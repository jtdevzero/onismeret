// A szimuláció magja: játékállapot létrehozása, parancsok, fix időlépés.
// Nem importál semmit a megjelenítésből; minden véletlen a state.rng-ből jön.

import { ITEMS, NEIGHBORHOODS, RECIPES, STAFF_NAMES, recipeById, type ItemKind } from '../data/content';
import {
  B,
  averageGroupSize,
  costPerServing,
  dailyWage,
  decorScore,
  dishQuality,
  dishUtility,
  guestsPerHour,
  referencePrice,
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
  type GameState,
  type Group,
  type LeaveReason,
  type LedgerKind,
  type PlacedItem,
  type Pt,
  type Role,
  type Rotation,
  type Staff,
  type Ticket,
} from './types';

export const TICK_SEC = B.time.gameSecondsPerTick;
export const DAY_SEC = (B.time.closeHour - B.time.openHour) * 3600;
export const TICKS_PER_DAY = Math.round(DAY_SEC / TICK_SEC);
const WALK_PER_TICK = (B.service.walkTilesPerGameMinute * TICK_SEC) / 60;

// --- Létrehozás ---------------------------------------------------------------

export function emptyStats(): DayStats {
  return { arrivedGuests: 0, servedGuests: 0, leftPatience: 0, leftPrice: 0, leftClosing: 0, ratingSum: 0, ratingCount: 0 };
}

export function createGame(seed: number): GameState {
  const state: GameState = {
    saveVersion: SAVE_VERSION,
    seed,
    rng: seed | 0,
    day: 1,
    time: 0,
    phase: 'open',
    cash: B.economy.startingCash,
    reputation: B.satisfaction.startingReputation,
    marketingPerDay: 0,
    restaurant: { neighborhood: 'university', width: 18, height: 12, entrance: { x: 0, y: 6 }, items: [], gridVersion: 0 },
    menu: RECIPES.filter((r) => r.cuisine === 'italian').map((r) => ({
      recipeId: r.id,
      onMenu: true,
      price: referencePrice(r.id, 'university'),
      ingredient: 'normal' as const,
      level: 1,
    })),
    staff: [],
    candidates: [],
    groups: [],
    tickets: [],
    nextId: 1,
    ledger: [],
    today: emptyStats(),
    lastReport: null,
    history: [],
    tick: 0,
  };
  state.candidates = generateCandidates(state);
  return state;
}

function newId(s: GameState): number {
  return s.nextId++;
}

function newAgent(p: Pt): Agent {
  return { pos: { x: p.x, y: p.y }, path: [], pathPos: 0, goal: null, pathVer: -1 };
}

function generateCandidates(s: GameState): Candidate[] {
  const out: Candidate[] = [];
  const roles: Role[] = ['chef', 'waiter'];
  for (const role of roles) {
    for (let i = 0; i < B.economy.candidatesPerRole; i++) {
      const skill = nextInt(s, B.economy.candidateSkillMin, B.economy.candidateSkillMax);
      const used = new Set([...s.staff.map((x) => x.name), ...out.map((x) => x.name)]);
      const free = STAFF_NAMES.filter((n) => !used.has(n));
      const pool = free.length > 0 ? free : STAFF_NAMES;
      const name = pool[nextInt(s, 0, pool.length - 1)]!;
      out.push({ id: newId(s), role, name, skill, wage: dailyWage(role, skill) });
    }
  }
  return out;
}

// --- Könyvelés -----------------------------------------------------------------

function book(s: GameState, kind: LedgerKind, amount: number): void {
  if (amount === 0) return;
  s.cash += amount;
  s.ledger.push({ time: s.time, kind, amount });
}

export function sumLedger(s: GameState, kinds: LedgerKind[]): number {
  return s.ledger.filter((e) => kinds.includes(e.kind)).reduce((a, e) => a + e.amount, 0);
}

const OPERATING: LedgerKind[] = ['revenue', 'ingredients', 'wages', 'rent', 'maintenance', 'marketing'];

export function furnitureValue(s: GameState): number {
  return s.restaurant.items.reduce((a, i) => a + ITEMS[i.kind].price, 0);
}

// --- Világ-gyorsítótár (akadályok, elérhetőség) -----------------------------

interface World {
  ver: number;
  blocked: Set<number>;
  reach: Set<number>;
}
const worlds = new WeakMap<GameState, World>();

function world(s: GameState): World {
  const w = worlds.get(s);
  if (w && w.ver === s.restaurant.gridVersion) return w;
  const blocked = buildBlocked(s.restaurant);
  const nw: World = { ver: s.restaurant.gridVersion, blocked, reach: reachableFrom(s.restaurant, blocked, s.restaurant.entrance) };
  worlds.set(s, nw);
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
function move(s: GameState, a: Agent): boolean {
  if (!a.goal) return true;
  const w = world(s);
  if (a.path.length === 0 || a.pathVer !== w.ver) {
    const start = { x: Math.round(a.pos.x), y: Math.round(a.pos.y) };
    const p = findPath(s.restaurant, w.blocked, start, a.goal);
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

// --- Parancsok ---------------------------------------------------------------------

export type Command =
  | { type: 'place'; kind: ItemKind; x: number; y: number; rot?: Rotation }
  | { type: 'remove'; id: number }
  | { type: 'rotate'; id: number }
  | { type: 'hire'; candidateId: number }
  | { type: 'setMenu'; recipeId: string; onMenu?: boolean; price?: number }
  | { type: 'continue' };

export type CommandError = PlaceError | 'inUse' | 'notFound' | 'invalidPrice' | 'notDayEnd' | 'dayEnded';
export type CommandResult = { ok: true; id?: number } | { ok: false; error: CommandError };

export function applyCommand(s: GameState, c: Command): CommandResult {
  switch (c.type) {
    case 'place':
      return placeItem(s, c.kind, c.x, c.y, c.rot ?? 0);
    case 'remove':
      return removeItem(s, c.id);
    case 'rotate': {
      const it = s.restaurant.items.find((i) => i.id === c.id);
      if (!it) return { ok: false, error: 'notFound' };
      it.rot = (((it.rot + 1) % 4) as Rotation);
      return { ok: true };
    }
    case 'hire':
      return hire(s, c.candidateId);
    case 'setMenu': {
      const m = s.menu.find((x) => x.recipeId === c.recipeId);
      if (!m) return { ok: false, error: 'notFound' };
      if (c.price !== undefined) {
        if (!Number.isFinite(c.price) || c.price < 100 || c.price > 100000) return { ok: false, error: 'invalidPrice' };
        m.price = Math.round(c.price);
      }
      if (c.onMenu !== undefined) m.onMenu = c.onMenu;
      return { ok: true };
    }
    case 'continue':
      if (s.phase !== 'dayEnd') return { ok: false, error: 'notDayEnd' };
      startNextDay(s);
      return { ok: true };
  }
}

function placeItem(s: GameState, kind: ItemKind, x: number, y: number, rot: Rotation): CommandResult {
  const p = { x, y };
  const err = canPlace(s.restaurant, kind, p);
  if (err) return { ok: false, error: err };
  const agents = [...s.staff.map((st) => st.agent), ...s.groups.flatMap((g) => g.members.map((m) => m.agent))];
  if (agents.some((a) => {
    const t = tileOf(a);
    return t.x === x && t.y === y;
  })) return { ok: false, error: 'agentThere' };
  const price = ITEMS[kind].price;
  if (s.cash < price) return { ok: false, error: 'noMoney' };
  const id = newId(s);
  s.restaurant.items.push({ id, kind, x, y, rot });
  s.restaurant.gridVersion++;
  book(s, 'purchase', -price);
  return { ok: true, id };
}

function itemInUse(s: GameState, it: PlacedItem): boolean {
  switch (it.kind) {
    case 'table':
      return s.groups.some((g) => g.tableId === it.id);
    case 'chair':
      return s.groups.some((g) => g.members.some((m) => m.seatId === it.id));
    case 'stove':
      return s.staff.some((st) => st.stoveId === it.id && st.cooking.length > 0);
    case 'counter':
      return s.tickets.some((t) => t.state === 'ready' || t.state === 'carried');
  }
}

function removeItem(s: GameState, id: number): CommandResult {
  const it = s.restaurant.items.find((i) => i.id === id);
  if (!it) return { ok: false, error: 'notFound' };
  if (itemInUse(s, it)) return { ok: false, error: 'inUse' };
  s.restaurant.items = s.restaurant.items.filter((i) => i.id !== id);
  s.restaurant.gridVersion++;
  for (const st of s.staff) if (st.stoveId === id) st.stoveId = null;
  book(s, 'refund', Math.round(ITEMS[it.kind].price * B.economy.sellRefund));
  return { ok: true };
}

function hire(s: GameState, candidateId: number): CommandResult {
  const c = s.candidates.find((x) => x.id === candidateId);
  if (!c) return { ok: false, error: 'notFound' };
  s.candidates = s.candidates.filter((x) => x.id !== candidateId);
  const st: Staff = {
    id: newId(s),
    role: c.role,
    name: c.name,
    skill: c.skill,
    wage: c.wage,
    agent: newAgent(s.restaurant.entrance),
    stoveId: null,
    cooking: [],
    task: null,
  };
  s.staff.push(st);
  return { ok: true, id: st.id };
}

// --- Időlépés ----------------------------------------------------------------------------

export function tick(s: GameState): void {
  if (s.phase !== 'open') return;
  s.tick++;
  s.time += TICK_SEC;
  if (s.time < DAY_SEC) spawnGuests(s);
  seatQueue(s);
  for (const g of [...s.groups]) updateGroup(s, g);
  for (const st of s.staff) if (st.role === 'chef') updateChef(s, st);
  for (const st of s.staff) if (st.role === 'waiter') updateWaiter(s, st);
  if (s.time >= DAY_SEC) closeDay(s);
}

/** Több lépés egyszerre (gyorsított idő, tesztek). */
export function runTicks(s: GameState, n: number): void {
  for (let i = 0; i < n && s.phase === 'open'; i++) tick(s);
}

export function runDay(s: GameState): DayReport {
  while (s.phase === 'open') tick(s);
  return s.lastReport!;
}

// --- Vendégek ------------------------------------------------------------------------------

function spawnGuests(s: GameState): void {
  const perHour = guestsPerHour(s.restaurant.neighborhood, s.time, s.reputation, s.marketingPerDay);
  const meanGroups = (perHour / averageGroupSize()) * (TICK_SEC / 3600);
  const n = nextPoisson(s, meanGroups);
  for (let i = 0; i < n; i++) {
    const size = nextWeighted(s, B.demand.groupSizeWeights) + 1;
    const members = Array.from({ length: size }, () => ({ agent: newAgent(s.restaurant.entrance), seatId: null, dishIdx: null }));
    s.groups.push({
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
    s.today.arrivedGuests += size;
  }
}

function seatQueue(s: GameState): void {
  const w = world(s);
  const r = s.restaurant;
  const taken = new Set(s.groups.map((g) => g.tableId).filter((x): x is number => x !== null));
  for (const g of s.groups) {
    if (g.phase !== 'queue') continue;
    const options = r.items
      .filter((t) => t.kind === 'table' && !taken.has(t.id))
      .map((t) => ({ t, chairs: chairsOfTable(r, t) }))
      .filter((o) => o.chairs.length >= g.members.length && tableAccessTiles(r, w.blocked, w.reach, o.t).length > 0)
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

function waitPhase(s: GameState, g: Group, patienceMin: number): void {
  g.phaseTime += TICK_SEC;
  g.waitTotal += TICK_SEC;
  if (g.phaseTime > patienceMin * 60) leave(s, g, 'patience');
}

function updateGroup(s: GameState, g: Group): void {
  const p = B.patience;
  switch (g.phase) {
    case 'queue':
      waitPhase(s, g, p.seatMinutes);
      break;
    case 'toTable': {
      let all = true;
      let stuck = false;
      for (const m of g.members) {
        const before = m.agent.path.length;
        const arrived = move(s, m.agent);
        if (!arrived && m.agent.path.length === 0 && before === 0) stuck = true;
        all = all && arrived;
      }
      if (stuck) leave(s, g, 'patience');
      else if (all) {
        g.phase = 'waitOrder';
        g.phaseTime = 0;
      }
      break;
    }
    case 'waitOrder':
      waitPhase(s, g, p.orderMinutes);
      break;
    case 'waitFood':
      waitPhase(s, g, p.foodMinutes);
      break;
    case 'eating':
      g.eatRemaining -= TICK_SEC;
      if (g.eatRemaining <= 0) {
        g.phase = 'waitPay';
        g.phaseTime = 0;
      }
      break;
    case 'waitPay':
      waitPhase(s, g, p.payMinutes);
      break;
    case 'ordering':
    case 'paying':
      break;
    case 'leaving': {
      let all = true;
      for (const m of g.members) {
        const ok = move(s, m.agent);
        if (!ok && m.agent.path.length === 0) continue; // elakadt: kiléptetjük
        all = all && ok;
      }
      if (all) s.groups = s.groups.filter((x) => x.id !== g.id);
      break;
    }
  }
}

function recordReview(s: GameState, star: number): void {
  s.today.ratingSum += star;
  s.today.ratingCount++;
  s.reputation = updateReputation(s.reputation, star);
}

function leave(s: GameState, g: Group, reason: LeaveReason): void {
  if (g.phase === 'leaving') return;
  const size = g.members.length;
  if (reason === 'patience') {
    s.today.leftPatience += size;
    // Aki asztalt sem kapott, nem értékel (balance: queueLeaversReview).
    const reviews = g.phase !== 'queue' || B.patience.queueLeaversReview;
    if (reviews) for (let i = 0; i < size; i++) recordReview(s, 1);
  } else if (reason === 'price') {
    s.today.leftPrice += size;
  } else if (reason === 'closing') {
    s.today.leftClosing += size;
  }
  // Rendelés törlése: a sorban álló és a főzés alatti ételek elvesznek.
  if (g.ticketId !== null) {
    const tid = g.ticketId;
    s.tickets = s.tickets.filter((t) => t.id !== tid);
    for (const st of s.staff) st.cooking = st.cooking.filter((c) => c.ticketId !== tid);
  }
  for (const st of s.staff) if (st.task && st.task.groupId === g.id) st.task = null;
  g.ticketId = null;
  g.tableId = null;
  g.leaveReason = reason;
  g.phase = 'leaving';
  for (const m of g.members) {
    m.seatId = null;
    setGoal(m.agent, s.restaurant.entrance);
  }
}

// --- Séfek --------------------------------------------------------------------------

function stoveOf(s: GameState, st: Staff): PlacedItem | undefined {
  return s.restaurant.items.find((i) => i.id === st.stoveId && i.kind === 'stove');
}

function updateChef(s: GameState, st: Staff): void {
  const r = s.restaurant;
  if (!stoveOf(s, st)) {
    st.stoveId = null;
    const used = new Set(s.staff.map((x) => x.stoveId));
    const free = r.items.filter((i) => i.kind === 'stove' && !used.has(i.id)).sort((a, b) => a.id - b.id)[0];
    if (!free) {
      setGoal(st.agent, null);
      return;
    }
    st.stoveId = free.id;
  }
  const stove = stoveOf(s, st)!;
  const w = world(s);
  const spot = keepOrNearest(st.agent, accessTiles(r, w.blocked, w.reach, stove));
  if (!spot) return;
  setGoal(st.agent, spot);
  if (!move(s, st.agent)) return;

  // Főzés: a hátralévő idő csökken, a kész ételek a ticketre kerülnek.
  for (const c of st.cooking) c.remaining -= TICK_SEC;
  const finished = st.cooking.filter((c) => c.remaining <= 0);
  st.cooking = st.cooking.filter((c) => c.remaining > 0);
  for (const c of finished) {
    const t = s.tickets.find((x) => x.id === c.ticketId);
    if (!t) continue;
    t.done++;
    if (t.done >= t.dishes.length) t.state = 'ready';
  }

  // Új ételek indítása a legrégebbi rendelésből.
  while (st.cooking.length < B.service.chefParallelDishes) {
    const t = s.tickets
      .filter((x) => (x.state === 'queued' || x.state === 'cooking') && x.started < x.dishes.length)
      .sort((a, b) => a.id - b.id)[0];
    if (!t) break;
    const idx = t.started++;
    t.state = 'cooking';
    const recipeId = t.dishes[idx]!;
    const menu = s.menu.find((m) => m.recipeId === recipeId)!;
    t.qualities[idx] = dishQuality(menu.level, menu.ingredient, st.skill);
    book(s, 'ingredients', -costPerServing(recipeId, menu.ingredient));
    st.cooking.push({ ticketId: t.id, recipeId, remaining: recipeById(recipeId).cookMinutes * 60 * skillTimeFactor(st.skill) });
  }
}

// --- Pincérek -------------------------------------------------------------------------

function targeted(s: GameState, groupId: number, self: Staff): boolean {
  return s.staff.some((x) => x !== self && x.task && x.task.groupId === groupId);
}

function pickupSpot(s: GameState, a: Agent): Pt | null {
  const r = s.restaurant;
  const w = world(s);
  const counters = r.items.filter((i) => i.kind === 'counter');
  const sources = counters.length > 0 ? counters : r.items.filter((i) => i.kind === 'stove');
  return keepOrNearest(a, sources.flatMap((c) => accessTiles(r, w.blocked, w.reach, c)));
}

function tableSpot(s: GameState, g: Group, a: Agent): Pt | null {
  const r = s.restaurant;
  const table = r.items.find((i) => i.id === g.tableId);
  if (!table) return null;
  const w = world(s);
  return keepOrNearest(a, tableAccessTiles(r, w.blocked, w.reach, table));
}

function chooseTask(s: GameState, st: Staff): void {
  const ready = s.tickets
    .filter((t) => t.state === 'ready' && t.waiterId === null)
    .sort((a, b) => a.id - b.id)[0];
  if (ready) {
    ready.waiterId = st.id;
    st.task = { kind: 'serve', groupId: ready.groupId, ticketId: ready.id, stage: 'toCounter', timer: 0 };
    return;
  }
  const longest = (phase: Group['phase']) =>
    s.groups
      .filter((g) => g.phase === phase && !targeted(s, g.id, st))
      .sort((a, b) => b.phaseTime - a.phaseTime || a.id - b.id)[0];
  const pay = longest('waitPay');
  if (pay) {
    st.task = { kind: 'pay', groupId: pay.id, ticketId: pay.ticketId, stage: 'toTable', timer: 0 };
    return;
  }
  const order = longest('waitOrder');
  if (order) {
    st.task = { kind: 'order', groupId: order.id, ticketId: null, stage: 'toTable', timer: 0 };
  }
}

function updateWaiter(s: GameState, st: Staff): void {
  if (st.task && !s.groups.some((g) => g.id === st.task!.groupId && g.phase !== 'leaving')) st.task = null;
  if (!st.task) chooseTask(s, st);
  const task = st.task;
  if (!task) {
    const idle = pickupSpot(s, st.agent);
    setGoal(st.agent, idle);
    move(s, st.agent);
    return;
  }
  const g = s.groups.find((x) => x.id === task.groupId)!;
  const sv = B.service;
  const factor = skillTimeFactor(st.skill);

  if (task.stage === 'toCounter') {
    const spot = pickupSpot(s, st.agent);
    if (!spot) return;
    setGoal(st.agent, spot);
    if (!move(s, st.agent)) return;
    const t = s.tickets.find((x) => x.id === task.ticketId);
    if (!t) {
      st.task = null;
      return;
    }
    t.state = 'carried';
    task.stage = 'toTable';
    return;
  }

  if (task.stage === 'toTable') {
    const spot = tableSpot(s, g, st.agent);
    if (!spot) return;
    setGoal(st.agent, spot);
    if (!move(s, st.agent)) return;
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
  if (task.kind === 'order') takeOrder(s, g);
  else if (task.kind === 'serve') serve(s, g, task.ticketId);
  else pay(s, g);
}

function takeOrder(s: GameState, g: Group): void {
  const nb = NEIGHBORHOODS[s.restaurant.neighborhood];
  const options = s.menu.filter((m) => m.onMenu);
  const chefSkill = bestChefSkill(s);
  const dishes: string[] = [];
  const prices: number[] = [];
  let refused = 0;
  for (const m of g.members) {
    let best: { id: string; u: number; price: number } | null = null;
    for (const o of options) {
      const recipe = recipeById(o.recipeId);
      const q = dishQuality(o.level, o.ingredient, chefSkill);
      const noise = nextRange(s, -B.choice.noise, B.choice.noise);
      const u = dishUtility(q, o.price, referencePrice(o.recipeId, s.restaurant.neighborhood), recipe.cuisine === nb.favoriteCuisine, noise);
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
    leave(s, g, 'price');
    return;
  }
  s.today.leftPrice += refused;
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
  s.tickets.push(t);
  g.ticketId = t.id;
  g.phase = 'waitFood';
  g.phaseTime = 0;
}

/** A rendeléskor várható minőséghez a legjobb séf képességét használjuk; főzéskor a tényleges séfét. */
function bestChefSkill(s: GameState): number {
  const chefs = s.staff.filter((x) => x.role === 'chef');
  return chefs.length ? Math.max(...chefs.map((c) => c.skill)) : 0;
}

function serve(s: GameState, g: Group, ticketId: number | null): void {
  const t = s.tickets.find((x) => x.id === ticketId);
  if (!t) return;
  t.state = 'served';
  g.phase = 'eating';
  g.phaseTime = 0;
  g.eatRemaining = nextRange(s, B.service.eatMinMinutes, B.service.eatMaxMinutes) * 60;
}

function pay(s: GameState, g: Group): void {
  const t = s.tickets.find((x) => x.id === g.ticketId);
  if (t) {
    const total = t.prices.reduce((a, b) => a + b, 0);
    book(s, 'revenue', total);
    const decor = decorScore(furnitureValue(s));
    for (const m of g.members) {
      if (m.dishIdx === null) continue;
      const q = t.qualities[m.dishIdx] ?? 0;
      const price = t.prices[m.dishIdx]!;
      const ref = referencePrice(t.dishes[m.dishIdx]!, s.restaurant.neighborhood);
      const sat = satisfaction(q, g.waitTotal, 1, valueScore(q, price, ref), decor);
      recordReview(s, stars(sat));
      s.today.servedGuests++;
    }
    s.tickets = s.tickets.filter((x) => x.id !== t.id);
  }
  g.ticketId = null;
  leave(s, g, 'done');
}

// --- Napzárás -------------------------------------------------------------------------

function closeDay(s: GameState): void {
  for (const g of [...s.groups]) {
    if (g.phase === 'eating' || g.phase === 'waitPay' || g.phase === 'paying') pay(s, g);
    else if (g.phase !== 'leaving') leave(s, g, 'closing');
  }
  s.groups = [];
  s.tickets = [];
  for (const st of s.staff) {
    st.cooking = [];
    st.task = null;
  }
  const nb = NEIGHBORHOODS[s.restaurant.neighborhood];
  book(s, 'wages', -s.staff.reduce((a, st) => a + st.wage, 0));
  book(s, 'rent', -nb.rentPerDay);
  book(s, 'maintenance', -Math.round(furnitureValue(s) * B.economy.maintenancePctPerDay));
  book(s, 'marketing', -s.marketingPerDay);

  const sum = (k: LedgerKind) => sumLedger(s, [k]);
  const report: DayReport = {
    day: s.day,
    revenue: sum('revenue'),
    ingredients: -sum('ingredients'),
    wages: -sum('wages'),
    rent: -sum('rent'),
    maintenance: -sum('maintenance'),
    marketing: -sum('marketing'),
    profit: sumLedger(s, OPERATING),
    capex: sumLedger(s, ['purchase', 'refund']),
    stats: { ...s.today },
    avgRating: s.today.ratingCount ? s.today.ratingSum / s.today.ratingCount : 0,
    reputation: s.reputation,
    cashEnd: s.cash,
  };
  s.lastReport = report;
  s.history.push(report);
  s.phase = 'dayEnd';
}

function startNextDay(s: GameState): void {
  s.day++;
  s.time = 0;
  s.ledger = [];
  s.today = emptyStats();
  s.candidates = generateCandidates(s);
  s.phase = 'open';
  for (const st of s.staff) st.agent = newAgent(tileOf(st.agent));
}

// --- Segédek a felületnek és a teszteknek -------------------------------------------

export function clockLabel(timeSec: number): string {
  const total = Math.min(DAY_SEC, timeSec) + B.time.openHour * 3600;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function todayProfit(s: GameState): number {
  return sumLedger(s, OPERATING);
}

export function isServiceReady(s: GameState): { tables: number; chairs: number; stoves: number; counters: number; chefs: number; waiters: number } {
  const items = s.restaurant.items;
  const count = (k: ItemKind) => items.filter((i) => i.kind === k).length;
  return {
    tables: count('table'),
    chairs: count('chair'),
    stoves: count('stove'),
    counters: count('counter'),
    chefs: s.staff.filter((x) => x.role === 'chef').length,
    waiters: s.staff.filter((x) => x.role === 'waiter').length,
  };
}

export { itemAt, key };
