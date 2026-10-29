// A szimuláció magja: játékállapot létrehozása, parancsok, fix időlépés.
// Nem importál semmit a megjelenítésből; minden véletlen a state.rng-ből jön.
// Minden étterem minden lépésben teljes szimulációval fut, a látható és a háttérben lévő is.

import {
  FLOOR_STYLES,
  ITEMS,
  NEIGHBORHOODS,
  RECIPES,
  RESTAURANT_NAMES,
  RIVALS,
  STAFF_NAMES,
  WALL_STYLES,
  nameRegion,
  recipeById,
  type FloorStyle,
  type IngredientQuality,
  type ItemKind,
  type NeighborhoodId,
  type WallStyle,
} from '../data/content';
import { CHAPTERS, completeChapter, currentChapter, evaluateChapter, type ChapterDef } from './campaign';
import { CAPITAL, OPERATING, sumLedger } from './ledger';
import {
  B,
  averageGroupSize,
  costPerServing,
  dailyWage,
  decorScore,
  decorValue,
  dishQuality,
  dishUtility,
  guestsPerHour,
  marketShare,
  playerAppeal,
  referencePrice,
  rivalAppeal,
  satisfaction,
  skillTimeFactor,
  stars,
  updateReputation,
  valueScore,
} from './formulas';
import {
  accessTiles,
  buildBlocked,
  canPlace,
  chairsOfTable,
  findPath,
  itemAt,
  key,
  nearest,
  reachableFrom,
  tableAccessTiles,
  type PlaceError,
} from './grid';
import { nextInt, nextPoisson, nextRange, nextWeighted } from './rng';
import {
  SAVE_VERSION,
  type Agent,
  type Candidate,
  type DayReport,
  type DayStats,
  type EmpireReport,
  type FxEvent,
  type GameState,
  type Group,
  type LeaveReason,
  type LedgerKind,
  type PlacedItem,
  type Pt,
  type RestaurantState,
  type Role,
  type Rotation,
  type Staff,
  type Ticket,
} from './types';

export const TICK_SEC = B.time.gameSecondsPerTick;
export const DAY_SEC = (B.time.closeHour - B.time.openHour) * 3600;
export const TICKS_PER_DAY = Math.round(DAY_SEC / TICK_SEC);
const WALK_PER_TICK = (B.service.walkTilesPerGameMinute * TICK_SEC) / 60;

type S = GameState;
type R = RestaurantState;

// --- Látványesemények ---------------------------------------------------------
// A megjelenítés feliratkozhat; a szimuláció állapotát nem befolyásolja.
let fxListener: ((e: FxEvent) => void) | null = null;
export function setFxListener(fn: ((e: FxEvent) => void) | null): void {
  fxListener = fn;
}
function fx(e: FxEvent): void {
  fxListener?.(e);
}

// --- Létrehozás ---------------------------------------------------------------

export function emptyStats(): DayStats {
  return { arrivedGuests: 0, servedGuests: 0, happyGuests: 0, lostServed: 0, ruinedDishes: 0, leftPatience: 0, leftPrice: 0, leftClosing: 0, ratingSum: 0, ratingCount: 0 };
}

function newRestaurant(s: S, neighborhood: NeighborhoodId): R {
  const r: R = {
    id: newId(s),
    name: RESTAURANT_NAMES[neighborhood],
    neighborhood,
    layout: { width: 18, height: 12, entrance: { x: 0, y: 6 }, items: [], gridVersion: 0 },
    style: { floor: 'parquet', wall: 'emerald' },
    menu: RECIPES.filter((x) => !x.lost && x.cuisine === NEIGHBORHOODS[neighborhood].favoriteCuisine).map((x) => ({
      recipeId: x.id,
      onMenu: true,
      price: referencePrice(x.id, neighborhood),
      ingredient: 'normal' as const,
      level: 1,
    })),
    staff: [],
    candidates: [],
    groups: [],
    tickets: [],
    reputation: B.satisfaction.startingReputation,
    cleanliness: 1,
    marketingPerDay: 0,
    rivals: RIVALS.filter((x) => x.neighborhood === neighborhood).map((x) => ({ id: x.id, priceLevel: x.priceLevel })),
    ledger: [],
    today: emptyStats(),
    lastReport: null,
    history: [],
  };
  for (const id of s.campaign?.unlocked ?? []) addLostRecipe(r, id);
  r.candidates = generateCandidates(s, r);
  return r;
}

/** Elveszett recept az étlapra: a saját konyhájú éttermekbe, a végső recept mindenhová. */
function addLostRecipe(r: R, id: string): void {
  const def = recipeById(id);
  const fits = id === 'bouillon_dor' || def.cuisine === NEIGHBORHOODS[r.neighborhood].favoriteCuisine;
  if (!fits || r.menu.some((m) => m.recipeId === id)) return;
  r.menu.push({ recipeId: id, onMenu: true, price: referencePrice(id, r.neighborhood), ingredient: 'normal', level: 5 });
}

function applyRewards(s: S, def: ChapterDef): void {
  for (const id of def.unlocks ?? []) {
    if (!s.campaign.unlocked.includes(id)) s.campaign.unlocked.push(id);
    for (const r of s.restaurants) addLostRecipe(r, id);
  }
  if (def.cash) book(s, s.restaurants[0]!, 'reward', def.cash);
}

export function createGame(seed: number, mode: 'campaign' | 'free' = 'campaign'): GameState {
  const s: GameState = {
    saveVersion: SAVE_VERSION,
    seed,
    rng: seed | 0,
    day: 1,
    time: 0,
    phase: 'open',
    cash: B.economy.startingCash,
    restaurants: [],
    active: 0,
    nextId: 1,
    negativeDays: 0,
    lastReport: null,
    history: [],
    campaign: { mode, chapter: 0, chapterStartDay: 1, lastResult: null, introSeen: 0, unlocked: [], bestContest: null, contestDay: null, lastContest: null },
    tick: 0,
  };
  const r = newRestaurant(s, 'paris');
  s.restaurants.push(r);
  s.active = r.id;
  return s;
}

export function activeRestaurant(s: S): R {
  return s.restaurants.find((r) => r.id === s.active) ?? s.restaurants[0]!;
}

function restaurantById(s: S, id: number | undefined): R {
  if (id === undefined) return activeRestaurant(s);
  return s.restaurants.find((r) => r.id === id) ?? activeRestaurant(s);
}

function newId(s: S): number {
  return s.nextId++;
}

function newAgent(p: Pt): Agent {
  return { pos: { x: p.x, y: p.y }, path: [], pathPos: 0, goal: null, pathVer: -1 };
}

const ROLES: Role[] = ['chef', 'waiter', 'cleaner'];

function generateCandidates(s: S, r: R): Candidate[] {
  const out: Candidate[] = [];
  const taken = new Set(s.restaurants.flatMap((x) => x.staff.map((st) => st.name)));
  for (const st of r.staff) taken.add(st.name);
  for (const role of ROLES) {
    const n = role === 'cleaner' ? 2 : B.economy.candidatesPerRole;
    for (let i = 0; i < n; i++) {
      const skill = nextInt(s, B.economy.candidateSkillMin, B.economy.candidateSkillMax);
      const used = new Set([...taken, ...out.map((x) => x.name)]);
      const names = STAFF_NAMES[nameRegion(r.neighborhood)];
      const free = names.filter((x) => !used.has(x));
      const pool = free.length > 0 ? free : names;
      const name = pool[nextInt(s, 0, pool.length - 1)]!;
      out.push({ id: newId(s), role, name, skill, wage: dailyWage(role, skill), saboteur: false });
    }
  }
  // A szabotázsfejezetben a Gourmet Global gyanúsan jó és olcsó séfet küld Párizsba.
  if (currentChapter(s)?.id === 'saboteur' && r.neighborhood === 'paris' && !r.staff.some((x) => x.saboteur)) {
    const names = STAFF_NAMES.fr;
    const name = names[nextInt(s, 0, names.length - 1)]!;
    const spy: Candidate = { id: newId(s), role: 'chef', name, skill: 88, wage: Math.round(dailyWage('chef', 88) * 0.55), saboteur: true };
    out.splice(nextInt(s, 0, 2), 0, spy);
  }
  return out;
}

// --- Könyvelés -----------------------------------------------------------------

function book(s: S, r: R, kind: LedgerKind, amount: number): void {
  if (amount === 0) return;
  s.cash += amount;
  r.ledger.push({ time: s.time, kind, amount });
}

export { CAPITAL, OPERATING, sumLedger };

export function furnitureValue(r: R): number {
  return r.layout.items.reduce((a, i) => a + ITEMS[i.kind].price, 0);
}

// --- Világ-gyorsítótár (akadályok, elérhetőség) -----------------------------

interface World {
  ver: number;
  blocked: Set<number>;
  reach: Set<number>;
}
const worlds = new WeakMap<R, World>();

function world(r: R): World {
  const w = worlds.get(r);
  if (w && w.ver === r.layout.gridVersion) return w;
  const blocked = buildBlocked(r.layout);
  const nw: World = { ver: r.layout.gridVersion, blocked, reach: reachableFrom(r.layout, blocked, r.layout.entrance) };
  worlds.set(r, nw);
  return nw;
}

// --- Mozgás ----------------------------------------------------------------------

function setGoal(a: Agent, goal: Pt | null): void {
  if (goal === null) {
    a.goal = null;
    a.path = [];
    a.pathPos = 0;
    return;
  }
  if (a.goal && a.goal.x === goal.x && a.goal.y === goal.y) return;
  a.goal = { x: goal.x, y: goal.y };
  a.path = [];
  a.pathPos = 0;
}

/** Egy időlépésnyi mozgás. true, ha a szereplő a célban van. */
function move(r: R, a: Agent): boolean {
  if (!a.goal) return true;
  const w = world(r);
  if (a.path.length === 0 || a.pathVer !== w.ver) {
    const start = { x: Math.round(a.pos.x), y: Math.round(a.pos.y) };
    const p = findPath(r.layout, w.blocked, start, a.goal);
    if (!p) return false;
    a.path = p;
    a.pathPos = 0;
    a.pathVer = w.ver;
  }
  const last = a.path.length - 1;
  a.pathPos = Math.min(last, a.pathPos + WALK_PER_TICK);
  const i = Math.floor(a.pathPos);
  const f = a.pathPos - i;
  const p0 = a.path[i]!;
  const p1 = a.path[Math.min(last, i + 1)]!;
  a.pos = { x: p0.x + (p1.x - p0.x) * f, y: p0.y + (p1.y - p0.y) * f };
  return a.pathPos >= last;
}

function tileOf(a: Agent): Pt {
  return { x: Math.round(a.pos.x), y: Math.round(a.pos.y) };
}

/** A jelenlegi célt megtartja, ha még érvényes; különben a legközelebbi lehetőséget választja. */
function keepOrNearest(a: Agent, options: Pt[]): Pt | null {
  if (a.goal && options.some((o) => o.x === a.goal!.x && o.y === a.goal!.y)) return a.goal;
  return nearest(tileOf(a), options);
}

function working(s: S, st: Staff): boolean {
  return st.trainingDay !== s.day;
}

// --- Parancsok ---------------------------------------------------------------------

/** A restaurant mező nélkül az aktív éttermet jelenti. */
export type Command =
  | { type: 'place'; kind: ItemKind; x: number; y: number; rot?: Rotation; restaurant?: number }
  | { type: 'remove'; id: number; restaurant?: number }
  | { type: 'hire'; candidateId: number; restaurant?: number }
  | { type: 'fire'; staffId: number; restaurant?: number }
  | { type: 'train'; staffId: number; restaurant?: number }
  | { type: 'setMenu'; recipeId: string; onMenu?: boolean; price?: number; ingredient?: IngredientQuality; restaurant?: number }
  | { type: 'setMarketing'; perDay: number; restaurant?: number }
  | { type: 'open'; neighborhood: NeighborhoodId }
  | { type: 'setStyle'; floor?: FloorStyle; wall?: WallStyle; restaurant?: number }
  | { type: 'seenIntro'; chapter: number }
  | { type: 'contest'; recipeId: string; restaurant?: number }
  | { type: 'switch'; restaurant: number }
  | { type: 'continue' };

export type CommandError =
  | PlaceError
  | 'inUse'
  | 'notFound'
  | 'invalidPrice'
  | 'invalidAmount'
  | 'notDayEnd'
  | 'dayEnded'
  | 'maxRestaurants'
  | 'alreadyOpen'
  | 'maxSkill'
  | 'alreadyTraining'
  | 'noContest'
  | 'contestToday'
  | 'wrongDish'
  | 'bankrupt';
export type CommandResult = { ok: true; id?: number } | { ok: false; error: CommandError };

export function applyCommand(s: S, c: Command): CommandResult {
  if (s.phase === 'bankrupt') return { ok: false, error: 'bankrupt' };
  switch (c.type) {
    case 'place':
      return placeItem(s, restaurantById(s, c.restaurant), c.kind, c.x, c.y, c.rot ?? 0);
    case 'remove':
      return removeItem(s, restaurantById(s, c.restaurant), c.id);
    case 'hire':
      return hire(s, restaurantById(s, c.restaurant), c.candidateId);
    case 'fire': {
      const r = restaurantById(s, c.restaurant);
      const st = r.staff.find((x) => x.id === c.staffId);
      if (!st) return { ok: false, error: 'notFound' };
      fireStaff(r, st);
      return { ok: true };
    }
    case 'train': {
      const r = restaurantById(s, c.restaurant);
      const st = r.staff.find((x) => x.id === c.staffId);
      if (!st) return { ok: false, error: 'notFound' };
      if (st.skill >= 100) return { ok: false, error: 'maxSkill' };
      if (st.trainingDay !== null && st.trainingDay >= s.day) return { ok: false, error: 'alreadyTraining' };
      if (s.cash < B.economy.trainingCost) return { ok: false, error: 'noMoney' };
      book(s, r, 'training', -B.economy.trainingCost);
      st.skill = Math.min(100, st.skill + B.economy.trainingSkill);
      st.wage = dailyWage(st.role, st.skill);
      // A képzés a következő napot foglalja el: akkor nem dolgozik.
      st.trainingDay = s.day + 1;
      return { ok: true };
    }
    case 'setMenu': {
      const r = restaurantById(s, c.restaurant);
      const m = r.menu.find((x) => x.recipeId === c.recipeId);
      if (!m) return { ok: false, error: 'notFound' };
      if (c.price !== undefined) {
        if (!Number.isFinite(c.price) || c.price < 100 || c.price > 100000) return { ok: false, error: 'invalidPrice' };
        m.price = Math.round(c.price);
      }
      if (c.onMenu !== undefined) m.onMenu = c.onMenu;
      if (c.ingredient !== undefined) m.ingredient = c.ingredient;
      return { ok: true };
    }
    case 'setMarketing': {
      if (!Number.isFinite(c.perDay) || c.perDay < 0 || c.perDay > 500000) return { ok: false, error: 'invalidAmount' };
      restaurantById(s, c.restaurant).marketingPerDay = Math.round(c.perDay);
      return { ok: true };
    }
    case 'open': {
      if (s.restaurants.length >= B.economy.maxRestaurants) return { ok: false, error: 'maxRestaurants' };
      if (s.restaurants.some((r) => r.neighborhood === c.neighborhood)) return { ok: false, error: 'alreadyOpen' };
      const cost = NEIGHBORHOODS[c.neighborhood].openCost;
      if (s.cash < cost) return { ok: false, error: 'noMoney' };
      const r = newRestaurant(s, c.neighborhood);
      s.restaurants.push(r);
      book(s, r, 'opening', -cost);
      s.active = r.id;
      return { ok: true, id: r.id };
    }
    case 'setStyle': {
      const r = restaurantById(s, c.restaurant);
      const cost = (c.floor && c.floor !== r.style.floor ? FLOOR_STYLES[c.floor].price : 0) + (c.wall && c.wall !== r.style.wall ? WALL_STYLES[c.wall].price : 0);
      if (s.cash < cost) return { ok: false, error: 'noMoney' };
      book(s, r, 'style', -cost);
      if (c.floor) r.style.floor = c.floor;
      if (c.wall) r.style.wall = c.wall;
      return { ok: true };
    }
    case 'contest': {
      const def = currentChapter(s);
      if (!def || def.kind !== 'contest') return { ok: false, error: 'noContest' };
      if (s.campaign.contestDay === s.day) return { ok: false, error: 'contestToday' };
      if (def.dish && c.recipeId !== def.dish) return { ok: false, error: 'wrongDish' };
      const r = restaurantById(s, c.restaurant);
      const m = r.menu.find((x) => x.recipeId === c.recipeId);
      if (!m) return { ok: false, error: 'notFound' };
      const chefs = r.staff.filter((x) => x.role === 'chef' && working(s, x) && !x.saboteur);
      const skill = chefs.length ? Math.max(...chefs.map((x) => x.skill)) : 0;
      const score = Math.round(100 * dishQuality(m.level, m.ingredient, skill) + nextRange(s, 0, B.campaign.contestLuck));
      const win = score >= def.target;
      s.campaign.contestDay = s.day;
      s.campaign.bestContest = Math.max(s.campaign.bestContest ?? 0, score);
      s.campaign.lastContest = { day: s.day, recipeId: c.recipeId, score, target: def.target, win };
      if (win) applyRewards(s, completeChapter(s, s.day));
      return { ok: true };
    }
    case 'seenIntro':
      s.campaign.introSeen = Math.max(s.campaign.introSeen, c.chapter + 1);
      return { ok: true };
    case 'switch': {
      if (!s.restaurants.some((r) => r.id === c.restaurant)) return { ok: false, error: 'notFound' };
      s.active = c.restaurant;
      return { ok: true };
    }
    case 'continue':
      if (s.phase !== 'dayEnd') return { ok: false, error: 'notDayEnd' };
      startNextDay(s);
      return { ok: true };
  }
}

function placeItem(s: S, r: R, kind: ItemKind, x: number, y: number, rot: Rotation): CommandResult {
  const p = { x, y };
  const err = canPlace(r.layout, kind, p);
  if (err) return { ok: false, error: err };
  const agents = [...r.staff.map((st) => st.agent), ...r.groups.flatMap((g) => g.members.map((m) => m.agent))];
  if (
    agents.some((a) => {
      const t = tileOf(a);
      return t.x === x && t.y === y;
    })
  )
    return { ok: false, error: 'agentThere' };
  const price = ITEMS[kind].price;
  if (s.cash < price) return { ok: false, error: 'noMoney' };
  const id = newId(s);
  r.layout.items.push({ id, kind, x, y, rot });
  r.layout.gridVersion++;
  book(s, r, 'purchase', -price);
  return { ok: true, id };
}

function itemInUse(r: R, it: PlacedItem): boolean {
  switch (it.kind) {
    case 'table':
      return r.groups.some((g) => g.tableId === it.id);
    case 'chair':
      return r.groups.some((g) => g.members.some((m) => m.seatId === it.id));
    case 'stove':
      return r.staff.some((st) => st.stoveId === it.id && st.cooking.length > 0);
    case 'counter':
      return r.tickets.some((t) => t.state === 'ready' || t.state === 'carried');
    default:
      return false;
  }
}

function removeItem(s: S, r: R, id: number): CommandResult {
  const it = r.layout.items.find((i) => i.id === id);
  if (!it) return { ok: false, error: 'notFound' };
  if (itemInUse(r, it)) return { ok: false, error: 'inUse' };
  r.layout.items = r.layout.items.filter((i) => i.id !== id);
  r.layout.gridVersion++;
  for (const st of r.staff) if (st.stoveId === id) st.stoveId = null;
  book(s, r, 'refund', Math.round(ITEMS[it.kind].price * B.economy.sellRefund));
  return { ok: true };
}

function hire(s: S, r: R, candidateId: number): CommandResult {
  const c = r.candidates.find((x) => x.id === candidateId);
  if (!c) return { ok: false, error: 'notFound' };
  r.candidates = r.candidates.filter((x) => x.id !== candidateId);
  const st: Staff = {
    id: newId(s),
    role: c.role,
    name: c.name,
    skill: c.skill,
    wage: c.wage,
    agent: newAgent(r.layout.entrance),
    stoveId: null,
    cooking: [],
    task: null,
    cleanTimer: 0,
    trainingDay: null,
    saboteur: c.saboteur,
  };
  r.staff.push(st);
  return { ok: true, id: st.id };
}

function fireStaff(r: R, st: Staff): void {
  // A félbehagyott ételek visszakerülnek a sorba, a vitt rendelés újra kiosztható.
  for (const c of st.cooking) {
    const t = r.tickets.find((x) => x.id === c.ticketId);
    if (t) t.started = Math.max(t.done, t.started - 1);
  }
  if (st.task?.ticketId) {
    const t = r.tickets.find((x) => x.id === st.task!.ticketId);
    if (t && t.state === 'carried') t.state = 'ready';
    if (t) t.waiterId = null;
  }
  r.staff = r.staff.filter((x) => x.id !== st.id);
}

// --- Időlépés ----------------------------------------------------------------------------

export function tick(s: S): void {
  if (s.phase !== 'open') return;
  s.tick++;
  s.time += TICK_SEC;
  for (const r of s.restaurants) tickRestaurant(s, r);
  if (s.time >= DAY_SEC) closeDay(s);
}

function tickRestaurant(s: S, r: R): void {
  if (s.time < DAY_SEC) spawnGuests(s, r);
  seatQueue(r);
  for (const g of [...r.groups]) updateGroup(s, r, g);
  for (const st of r.staff) if (working(s, st) && st.role === 'chef') updateChef(s, r, st);
  for (const st of r.staff) {
    if (!working(s, st)) continue;
    if (st.role === 'waiter') updateWaiter(s, r, st);
    else if (st.role === 'cleaner') updateCleaner(s, r, st);
  }
}

/** Több lépés egyszerre (gyorsított idő, tesztek). */
export function runTicks(s: S, n: number): void {
  for (let i = 0; i < n && s.phase === 'open'; i++) tick(s);
}

export function runDay(s: S): EmpireReport {
  while (s.phase === 'open') tick(s);
  return s.lastReport!;
}

// --- Kereslet ------------------------------------------------------------------------------

function chefSkillOf(s: S, r: R): number {
  const chefs = r.staff.filter((x) => x.role === 'chef' && working(s, x));
  return chefs.length ? Math.max(...chefs.map((c) => c.skill)) : 0;
}

export function shareOf(s: S, r: R): { raw: number; share: number } {
  const me = playerAppeal(r.menu, r.neighborhood, chefSkillOf(s, r), r.reputation);
  const others = r.rivals.map((rv) => rivalAppeal(RIVALS.find((d) => d.id === rv.id)!, rv.priceLevel));
  return marketShare(me, others);
}

function spawnGuests(s: S, r: R): void {
  const share = shareOf(s, r).share;
  const perHour = guestsPerHour(r.neighborhood, s.time, r.reputation, r.marketingPerDay, share);
  const meanGroups = (perHour / averageGroupSize()) * (TICK_SEC / 3600);
  const n = nextPoisson(s, meanGroups);
  for (let i = 0; i < n; i++) {
    const size = nextWeighted(s, B.demand.groupSizeWeights) + 1;
    const members = Array.from({ length: size }, () => ({ agent: newAgent(r.layout.entrance), seatId: null, dishIdx: null }));
    r.groups.push({
      id: newId(s),
      members,
      phase: 'queue',
      tableId: null,
      phaseTime: 0,
      waitTotal: 0,
      eatRemaining: 0,
      ticketId: null,
      leaveReason: null,
    });
    r.today.arrivedGuests += size;
    fx({ kind: 'arrive', restaurant: r.id, at: { ...r.layout.entrance } });
  }
}

// --- Vendégek ------------------------------------------------------------------------------

function seatQueue(r: R): void {
  const w = world(r);
  const l = r.layout;
  const taken = new Set(r.groups.map((g) => g.tableId).filter((x): x is number => x !== null));
  for (const g of r.groups) {
    if (g.phase !== 'queue') continue;
    const options = l.items
      .filter((t) => t.kind === 'table' && !taken.has(t.id))
      .map((t) => ({ t, chairs: chairsOfTable(l, t) }))
      .filter((o) => o.chairs.length >= g.members.length && tableAccessTiles(l, w.blocked, w.reach, o.t).length > 0)
      .sort((a, b) => a.chairs.length - b.chairs.length || a.t.id - b.t.id);
    const best = options[0];
    if (!best) continue;
    taken.add(best.t.id);
    g.tableId = best.t.id;
    g.members.forEach((m, i) => {
      const chair = best.chairs[i]!;
      m.seatId = chair.id;
      setGoal(m.agent, chair);
    });
    g.phase = 'toTable';
    g.phaseTime = 0;
  }
}

function waitPhase(s: S, r: R, g: Group, patienceMin: number): void {
  g.phaseTime += TICK_SEC;
  g.waitTotal += TICK_SEC;
  if (g.phaseTime > patienceMin * 60) leave(s, r, g, 'patience');
}

function updateGroup(s: S, r: R, g: Group): void {
  const p = B.patience;
  switch (g.phase) {
    case 'queue':
      waitPhase(s, r, g, p.seatMinutes);
      break;
    case 'toTable': {
      let all = true;
      let stuck = false;
      for (const m of g.members) {
        const before = m.agent.path.length;
        const arrived = move(r, m.agent);
        if (!arrived && m.agent.path.length === 0 && before === 0) stuck = true;
        all = all && arrived;
      }
      if (stuck) leave(s, r, g, 'patience');
      else if (all) {
        g.phase = 'waitOrder';
        g.phaseTime = 0;
      }
      break;
    }
    case 'waitOrder':
      waitPhase(s, r, g, p.orderMinutes);
      break;
    case 'waitFood':
      waitPhase(s, r, g, p.foodMinutes);
      break;
    case 'eating':
      g.eatRemaining -= TICK_SEC;
      if (g.eatRemaining <= 0) {
        g.phase = 'waitPay';
        g.phaseTime = 0;
      }
      break;
    case 'waitPay':
      waitPhase(s, r, g, p.payMinutes);
      break;
    case 'ordering':
    case 'paying':
      break;
    case 'leaving': {
      let all = true;
      for (const m of g.members) {
        const ok = move(r, m.agent);
        if (!ok && m.agent.path.length === 0) continue; // elakadt: kiléptetjük
        all = all && ok;
      }
      if (all) r.groups = r.groups.filter((x) => x.id !== g.id);
      break;
    }
  }
}

function recordReview(r: R, star: number): void {
  r.today.ratingSum += star;
  r.today.ratingCount++;
  r.reputation = updateReputation(r.reputation, star);
}

function leave(s: S, r: R, g: Group, reason: LeaveReason): void {
  if (g.phase === 'leaving') return;
  const size = g.members.length;
  if (reason === 'patience') {
    r.today.leftPatience += size;
    fx({ kind: 'angry', restaurant: r.id, at: tileOf(g.members[0]!.agent) });
    // Aki asztalt sem kapott, nem értékel (balance: queueLeaversReview).
    const reviews = g.phase !== 'queue' || B.patience.queueLeaversReview;
    if (reviews) for (let i = 0; i < size; i++) recordReview(r, 1);
  } else if (reason === 'price') {
    r.today.leftPrice += size;
  } else if (reason === 'closing') {
    r.today.leftClosing += size;
  }
  // Aki asztalnál ült, piszkot hagy maga után.
  if (g.tableId !== null && g.phase !== 'toTable') r.cleanliness = Math.max(0, r.cleanliness - B.cleaning.dirtPerGuest * size);
  if (g.ticketId !== null) {
    const tid = g.ticketId;
    r.tickets = r.tickets.filter((t) => t.id !== tid);
    for (const st of r.staff) st.cooking = st.cooking.filter((c) => c.ticketId !== tid);
  }
  for (const st of r.staff) if (st.task && st.task.groupId === g.id) st.task = null;
  g.ticketId = null;
  g.tableId = null;
  g.leaveReason = reason;
  g.phase = 'leaving';
  for (const m of g.members) {
    m.seatId = null;
    setGoal(m.agent, r.layout.entrance);
  }
}

// --- Séfek --------------------------------------------------------------------------

function stoveOf(r: R, st: Staff): PlacedItem | undefined {
  return r.layout.items.find((i) => i.id === st.stoveId && i.kind === 'stove');
}

function updateChef(s: S, r: R, st: Staff): void {
  const l = r.layout;
  if (!stoveOf(r, st)) {
    st.stoveId = null;
    const used = new Set(r.staff.filter((x) => working(s, x)).map((x) => x.stoveId));
    const free = l.items.filter((i) => i.kind === 'stove' && !used.has(i.id)).sort((a, b) => a.id - b.id)[0];
    if (!free) {
      setGoal(st.agent, null);
      return;
    }
    st.stoveId = free.id;
  }
  const stove = stoveOf(r, st)!;
  const w = world(r);
  const spot = keepOrNearest(st.agent, accessTiles(l, w.blocked, w.reach, stove));
  if (!spot) return;
  setGoal(st.agent, spot);
  if (!move(r, st.agent)) return;

  // Főzés: a hátralévő idő csökken, a kész ételek a ticketre kerülnek.
  for (const c of st.cooking) c.remaining -= TICK_SEC;
  const finished = st.cooking.filter((c) => c.remaining <= 0);
  st.cooking = st.cooking.filter((c) => c.remaining > 0);
  for (const c of finished) {
    const t = r.tickets.find((x) => x.id === c.ticketId);
    if (!t) continue;
    t.done++;
    if (t.done >= t.dishes.length) t.state = 'ready';
  }

  // Új ételek indítása a legrégebbi rendelésből.
  while (st.cooking.length < B.service.chefParallelDishes) {
    const t = r.tickets
      .filter((x) => (x.state === 'queued' || x.state === 'cooking') && x.started < x.dishes.length)
      .sort((a, b) => a.id - b.id)[0];
    if (!t) break;
    const idx = t.started++;
    t.state = 'cooking';
    const recipeId = t.dishes[idx]!;
    const menu = r.menu.find((m) => m.recipeId === recipeId)!;
    t.qualities[idx] = dishQuality(menu.level, menu.ingredient, st.skill);
    if (st.saboteur && nextRange(s, 0, 1) < B.campaign.sabotageChance) {
      t.qualities[idx] = t.qualities[idx]! * B.campaign.sabotageQuality;
      r.today.ruinedDishes++;
    }
    book(s, r, 'ingredients', -costPerServing(recipeId, menu.ingredient));
    st.cooking.push({ ticketId: t.id, recipeId, remaining: recipeById(recipeId).cookMinutes * 60 * skillTimeFactor(st.skill) });
  }
}

// --- Pincérek -------------------------------------------------------------------------

function targeted(r: R, groupId: number, self: Staff): boolean {
  return r.staff.some((x) => x !== self && x.task && x.task.groupId === groupId);
}

function pickupSpot(r: R, a: Agent): Pt | null {
  const l = r.layout;
  const w = world(r);
  const counters = l.items.filter((i) => i.kind === 'counter');
  const sources = counters.length > 0 ? counters : l.items.filter((i) => i.kind === 'stove');
  return keepOrNearest(a, sources.flatMap((c) => accessTiles(l, w.blocked, w.reach, c)));
}

function tableSpot(r: R, g: Group, a: Agent): Pt | null {
  const table = r.layout.items.find((i) => i.id === g.tableId);
  if (!table) return null;
  const w = world(r);
  return keepOrNearest(a, tableAccessTiles(r.layout, w.blocked, w.reach, table));
}

function chooseTask(r: R, st: Staff): void {
  const ready = r.tickets.filter((t) => t.state === 'ready' && t.waiterId === null).sort((a, b) => a.id - b.id)[0];
  if (ready) {
    ready.waiterId = st.id;
    st.task = { kind: 'serve', groupId: ready.groupId, ticketId: ready.id, stage: 'toCounter', timer: 0 };
    return;
  }
  const longest = (phase: Group['phase']) =>
    r.groups.filter((g) => g.phase === phase && !targeted(r, g.id, st)).sort((a, b) => b.phaseTime - a.phaseTime || a.id - b.id)[0];
  const payG = longest('waitPay');
  if (payG) {
    st.task = { kind: 'pay', groupId: payG.id, ticketId: payG.ticketId, stage: 'toTable', timer: 0 };
    return;
  }
  const order = longest('waitOrder');
  if (order) st.task = { kind: 'order', groupId: order.id, ticketId: null, stage: 'toTable', timer: 0 };
}

function updateWaiter(s: S, r: R, st: Staff): void {
  if (st.task && !r.groups.some((g) => g.id === st.task!.groupId && g.phase !== 'leaving')) st.task = null;
  if (!st.task) chooseTask(r, st);
  const task = st.task;
  if (!task) {
    setGoal(st.agent, pickupSpot(r, st.agent));
    move(r, st.agent);
    return;
  }
  const g = r.groups.find((x) => x.id === task.groupId)!;
  const sv = B.service;
  const factor = skillTimeFactor(st.skill);

  if (task.stage === 'toCounter') {
    const spot = pickupSpot(r, st.agent);
    if (!spot) return;
    setGoal(st.agent, spot);
    if (!move(r, st.agent)) return;
    const t = r.tickets.find((x) => x.id === task.ticketId);
    if (!t) {
      st.task = null;
      return;
    }
    t.state = 'carried';
    task.stage = 'toTable';
    return;
  }

  if (task.stage === 'toTable') {
    const spot = tableSpot(r, g, st.agent);
    if (!spot) return;
    setGoal(st.agent, spot);
    if (!move(r, st.agent)) return;
    task.stage = 'working';
    const minutes = task.kind === 'order' ? sv.takeOrderMinutes : task.kind === 'serve' ? sv.serveMinutes : sv.payMinutes;
    task.timer = minutes * 60 * factor;
    if (task.kind === 'order') g.phase = 'ordering';
    if (task.kind === 'pay') g.phase = 'paying';
    return;
  }

  task.timer -= TICK_SEC;
  if (task.timer > 0) return;
  st.task = null;
  if (task.kind === 'order') takeOrder(s, r, g);
  else if (task.kind === 'serve') serve(s, r, g, task.ticketId);
  else pay(s, r, g);
}

function takeOrder(s: S, r: R, g: Group): void {
  const nb = NEIGHBORHOODS[r.neighborhood];
  const options = r.menu.filter((m) => m.onMenu);
  const chefSkill = chefSkillOf(s, r);
  const dishes: string[] = [];
  const prices: number[] = [];
  let refused = 0;
  for (const m of g.members) {
    let best: { id: string; u: number; price: number } | null = null;
    for (const o of options) {
      const recipe = recipeById(o.recipeId);
      const q = dishQuality(o.level, o.ingredient, chefSkill);
      const noise = nextRange(s, -B.choice.noise, B.choice.noise);
      const u = dishUtility(q, o.price, referencePrice(o.recipeId, r.neighborhood), recipe.cuisine === nb.favoriteCuisine, noise);
      if (!best || u > best.u) best = { id: o.recipeId, u, price: o.price };
    }
    if (best && best.u >= 0) {
      m.dishIdx = dishes.length;
      dishes.push(best.id);
      prices.push(best.price);
    } else {
      m.dishIdx = null;
      refused++;
    }
  }
  if (dishes.length === 0) {
    leave(s, r, g, 'price');
    return;
  }
  r.today.leftPrice += refused;
  const t: Ticket = {
    id: newId(s),
    groupId: g.id,
    dishes,
    prices,
    qualities: dishes.map(() => 0),
    started: 0,
    done: 0,
    state: 'queued',
    waiterId: null,
  };
  r.tickets.push(t);
  g.ticketId = t.id;
  g.phase = 'waitFood';
  g.phaseTime = 0;
}

function serve(s: S, r: R, g: Group, ticketId: number | null): void {
  const t = r.tickets.find((x) => x.id === ticketId);
  if (!t) return;
  t.state = 'served';
  g.phase = 'eating';
  g.phaseTime = 0;
  g.eatRemaining = nextRange(s, B.service.eatMinMinutes, B.service.eatMaxMinutes) * 60;
}

function pay(s: S, r: R, g: Group): void {
  const t = r.tickets.find((x) => x.id === g.ticketId);
  if (t) {
    book(s, r, 'revenue', t.prices.reduce((a, b) => a + b, 0));
    const decor = decorScore(decorValue(r.layout.items), r.cleanliness);
    let starSum = 0;
    let starN = 0;
    for (const m of g.members) {
      if (m.dishIdx === null) continue;
      const q = t.qualities[m.dishIdx] ?? 0;
      const price = t.prices[m.dishIdx]!;
      const ref = referencePrice(t.dishes[m.dishIdx]!, r.neighborhood);
      const sat = satisfaction(q, g.waitTotal, r.cleanliness, valueScore(q, price, ref), decor);
      const st = stars(sat);
      recordReview(r, st);
      if (st >= 3) r.today.happyGuests++;
      if (recipeById(t.dishes[m.dishIdx]!).lost) r.today.lostServed++;
      starSum += st;
      starN++;
      r.today.servedGuests++;
    }
    const table = r.layout.items.find((i) => i.id === g.tableId);
    if (table) fx({ kind: 'pay', restaurant: r.id, amount: t.prices.reduce((a, b) => a + b, 0), at: { x: table.x, y: table.y }, stars: starN ? starSum / starN : 0 });
    r.tickets = r.tickets.filter((x) => x.id !== t.id);
  }
  g.ticketId = null;
  leave(s, r, g, 'done');
}

// --- Takarítók ------------------------------------------------------------------------

function updateCleaner(s: S, r: R, st: Staff): void {
  const l = r.layout;
  const w = world(r);
  if (st.cleanTimer > 0) {
    st.cleanTimer -= TICK_SEC;
    const factor = 1 / skillTimeFactor(st.skill);
    r.cleanliness = Math.min(1, r.cleanliness + (B.cleaning.cleanPerMinute * factor * TICK_SEC) / 60);
    return;
  }
  if (r.cleanliness >= 0.999) {
    setGoal(st.agent, null);
    return;
  }
  // A következő asztalhoz megy; ha nincs asztal, a bejárat előtt takarít.
  let spot: Pt | null = st.agent.goal;
  if (!spot) {
    const tables = l.items.filter((i) => i.kind === 'table');
    const t = tables.length ? tables[nextInt(s, 0, tables.length - 1)] : undefined;
    const options = t ? tableAccessTiles(l, w.blocked, w.reach, t) : [{ x: l.entrance.x + 1, y: l.entrance.y }];
    spot = options[0] ?? null;
    setGoal(st.agent, spot);
  }
  if (!spot) return;
  const ok = move(r, st.agent);
  if (!ok && st.agent.path.length === 0) {
    setGoal(st.agent, null);
    return;
  }
  if (!ok) return;
  st.cleanTimer = B.cleaning.workMinutes * 60;
  setGoal(st.agent, null);
}

// --- Napzárás -------------------------------------------------------------------------

function closeRestaurant(s: S, r: R): DayReport {
  for (const g of [...r.groups]) {
    if (g.phase === 'eating' || g.phase === 'waitPay' || g.phase === 'paying') pay(s, r, g);
    else if (g.phase !== 'leaving') leave(s, r, g, 'closing');
  }
  r.groups = [];
  r.tickets = [];
  for (const st of r.staff) {
    st.cooking = [];
    st.task = null;
    st.cleanTimer = 0;
  }
  const nb = NEIGHBORHOODS[r.neighborhood];
  book(s, r, 'wages', -r.staff.reduce((a, st) => a + st.wage, 0));
  book(s, r, 'rent', -nb.rentPerDay);
  book(s, r, 'maintenance', -Math.round(furnitureValue(r) * B.economy.maintenancePctPerDay));
  book(s, r, 'marketing', -r.marketingPerDay);

  const sum = (k: LedgerKind) => sumLedger(r, [k]);
  const report: DayReport = {
    day: s.day,
    revenue: sum('revenue'),
    ingredients: 0 - sum('ingredients') || 0,
    wages: 0 - sum('wages') || 0,
    rent: 0 - sum('rent') || 0,
    maintenance: 0 - sum('maintenance') || 0,
    marketing: 0 - sum('marketing') || 0,
    profit: sumLedger(r, OPERATING),
    capex: sumLedger(r, CAPITAL),
    stats: { ...r.today },
    avgRating: r.today.ratingCount ? r.today.ratingSum / r.today.ratingCount : 0,
    reputation: r.reputation,
    cleanliness: r.cleanliness,
    share: shareOf(s, r).share,
  };
  r.lastReport = report;
  r.history.push(report);
  return report;
}

function closeDay(s: S): void {
  const reports = s.restaurants.map((r) => ({ id: r.id, neighborhood: r.neighborhood, report: closeRestaurant(s, r) }));
  const empire: EmpireReport = {
    day: s.day,
    profit: reports.reduce((a, x) => a + x.report.profit, 0),
    revenue: reports.reduce((a, x) => a + x.report.revenue, 0),
    capex: reports.reduce((a, x) => a + x.report.capex, 0),
    cashEnd: s.cash,
    restaurants: reports,
  };
  s.lastReport = empire;
  s.history.push(empire);
  s.negativeDays = s.cash < 0 ? s.negativeDays + 1 : 0;
  s.phase = s.negativeDays >= B.economy.bankruptcyDays ? 'bankrupt' : 'dayEnd';
  if (s.phase === 'dayEnd') {
    const done = evaluateChapter(s);
    if (done) applyRewards(s, done);
  }
}

function reactRivals(s: S, r: R): void {
  const rv = B.rivals;
  if (s.day % rv.reactEveryDays !== 0) return;
  const recent = r.history.slice(-rv.reactEveryDays);
  if (recent.length === 0) return;
  const avgRaw = recent.reduce((a, d) => a + d.share / (1 + r.rivals.length), 0) / recent.length;
  if (avgRaw <= rv.reactThreshold) return;
  for (const x of r.rivals) if (x.priceLevel > rv.minPriceLevel) x.priceLevel = Math.max(rv.minPriceLevel, x.priceLevel - rv.reactStep);
}

function startNextDay(s: S): void {
  for (const r of s.restaurants) reactRivals(s, r);
  s.day++;
  s.time = 0;
  s.phase = 'open';
  for (const r of s.restaurants) {
    r.ledger = [];
    r.today = emptyStats();
    r.candidates = generateCandidates(s, r);
    r.cleanliness = Math.min(1, r.cleanliness + B.cleaning.overnightRecovery);
    for (const st of r.staff) st.agent = newAgent(tileOf(st.agent));
  }
}

// --- Segédek a felületnek és a teszteknek -------------------------------------------

export function clockLabel(timeSec: number): string {
  const total = Math.min(DAY_SEC, timeSec) + B.time.openHour * 3600;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function todayProfit(r: R): number {
  return sumLedger(r, OPERATING);
}

export function empireTodayProfit(s: S): number {
  return s.restaurants.reduce((a, r) => a + todayProfit(r), 0);
}

export function isServiceReady(r: R): { tables: number; chairs: number; stoves: number; counters: number; chefs: number; waiters: number } {
  const items = r.layout.items;
  const count = (k: ItemKind) => items.filter((i) => i.kind === k).length;
  return {
    tables: count('table'),
    chairs: count('chair'),
    stoves: count('stove'),
    counters: count('counter'),
    chefs: r.staff.filter((x) => x.role === 'chef').length,
    waiters: r.staff.filter((x) => x.role === 'waiter').length,
  };
}

export function isWorking(s: S, st: Staff): boolean {
  return working(s, st);
}

export { itemAt, key };
