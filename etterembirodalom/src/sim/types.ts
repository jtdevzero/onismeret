import type { FloorStyle, IngredientQuality, ItemKind, NeighborhoodId, WallStyle } from '../data/content';

export const SAVE_VERSION = 2;

export interface Pt {
  x: number;
  y: number;
}

export type Rotation = 0 | 1 | 2 | 3;

export interface PlacedItem {
  id: number;
  kind: ItemKind;
  x: number;
  y: number;
  rot: Rotation;
}

/** Mozgó szereplő: a pozíció lebegőpontos, az útvonal rácspontok listája. */
export interface Agent {
  pos: Pt;
  path: Pt[];
  pathPos: number;
  goal: Pt | null;
  /** A rács verziója, amelyre az útvonal készült. Eltérésnél újraszámol. */
  pathVer: number;
}

export type Role = 'chef' | 'waiter' | 'cleaner';

export interface Candidate {
  id: number;
  role: Role;
  name: string;
  skill: number;
  wage: number;
  /** A Gourmet Global beépített embere: elrontja az ételeket. A felület nem árulja el. */
  saboteur: boolean;
}

export type WaiterTaskKind = 'order' | 'serve' | 'pay';

export interface WaiterTask {
  kind: WaiterTaskKind;
  groupId: number;
  ticketId: number | null;
  stage: 'toCounter' | 'toTable' | 'working';
  timer: number;
}

export interface Staff {
  id: number;
  role: Role;
  name: string;
  skill: number;
  wage: number;
  agent: Agent;
  /** Séfnél: a hozzárendelt főzőállomás. */
  stoveId: number | null;
  /** Séfnél: éppen főzött ételek (ticketId, recept, hátralévő játékmásodperc). */
  cooking: { ticketId: number; recipeId: string; remaining: number }[];
  task: WaiterTask | null;
  /** Takarítónál: a takarítás hátralévő ideje az aktuális helyen (játékmásodperc). */
  cleanTimer: number;
  /** Ezen a napon képzésen van, nem dolgozik. */
  trainingDay: number | null;
  saboteur: boolean;
}

export type GroupPhase =
  | 'queue'
  | 'toTable'
  | 'waitOrder'
  | 'ordering'
  | 'waitFood'
  | 'eating'
  | 'waitPay'
  | 'paying'
  | 'leaving';

export type LeaveReason = 'done' | 'patience' | 'price' | 'closing';

export interface Guest {
  agent: Agent;
  seatId: number | null;
  /** A rendelt étel indexe a ticketben; null, ha nem rendelt. */
  dishIdx: number | null;
}

export interface Group {
  id: number;
  members: Guest[];
  phase: GroupPhase;
  tableId: number | null;
  /** Az aktuális várakozási fázisban eltöltött idő (játékmásodperc). */
  phaseTime: number;
  /** Összes várakozási idő a satisfaction képlethez (játékmásodperc). */
  waitTotal: number;
  /** Evés hátralévő ideje (játékmásodperc). */
  eatRemaining: number;
  ticketId: number | null;
  leaveReason: LeaveReason | null;
}

export type TicketState = 'queued' | 'cooking' | 'ready' | 'carried' | 'served';

export interface Ticket {
  id: number;
  groupId: number;
  dishes: string[];
  /** Rendeléskori eladási árak, ételenként. */
  prices: number[];
  /** Az elkészült ételek minősége (Q), főzés indulásakor rögzítve. */
  qualities: number[];
  /** Hány étel főzése indult el. */
  started: number;
  /** Hány étel készült el. */
  done: number;
  state: TicketState;
  waiterId: number | null;
}

export interface MenuEntry {
  recipeId: string;
  onMenu: boolean;
  price: number;
  ingredient: IngredientQuality;
  level: number;
}

export type LedgerKind = 'revenue' | 'ingredients' | 'wages' | 'rent' | 'maintenance' | 'marketing' | 'purchase' | 'refund' | 'training' | 'opening' | 'style' | 'reward';

export interface LedgerEntry {
  time: number;
  kind: LedgerKind;
  /** Előjeles összeg eurócentben: bevétel pozitív, kiadás negatív. */
  amount: number;
}

export interface DayStats {
  arrivedGuests: number;
  servedGuests: number;
  /** Legalább 3 csillagos értékelést adó vendégek. */
  happyGuests: number;
  /** Kifizetett elveszett-recept ételek. */
  lostServed: number;
  /** Elrontott ételek (szabotázs). */
  ruinedDishes: number;
  leftPatience: number;
  leftPrice: number;
  leftClosing: number;
  ratingSum: number;
  ratingCount: number;
}

export interface DayReport {
  day: number;
  revenue: number;
  ingredients: number;
  wages: number;
  rent: number;
  maintenance: number;
  marketing: number;
  /** Napi eredmény: bevétel − működési költségek (beruházás nélkül). */
  profit: number;
  /** Berendezés, nyitás és képzés nettó összege (nem része az eredménynek). */
  capex: number;
  stats: DayStats;
  avgRating: number;
  reputation: number;
  cleanliness: number;
  share: number;
}

export interface Layout {
  width: number;
  height: number;
  entrance: Pt;
  items: PlacedItem[];
  gridVersion: number;
}

export interface Rival {
  id: string;
  priceLevel: number;
}

/** Egy étterem teljes állapota. Minden étterem a háttérben is teljes szimulációval fut. */
export interface RestaurantState {
  id: number;
  name: string;
  neighborhood: NeighborhoodId;
  layout: Layout;
  style: { floor: FloorStyle; wall: WallStyle };
  menu: MenuEntry[];
  staff: Staff[];
  candidates: Candidate[];
  groups: Group[];
  tickets: Ticket[];
  reputation: number;
  cleanliness: number;
  marketingPerDay: number;
  rivals: Rival[];
  ledger: LedgerEntry[];
  today: DayStats;
  lastReport: DayReport | null;
  history: DayReport[];
}

export interface EmpireReport {
  day: number;
  profit: number;
  revenue: number;
  capex: number;
  cashEnd: number;
  restaurants: { id: number; neighborhood: NeighborhoodId; report: DayReport }[];
}

export interface Campaign {
  mode: 'campaign' | 'free';
  /** Az aktuális fejezet indexe (0-tól); a fejezetek száma után a kampány kész. */
  chapter: number;
  chapterStartDay: number;
  /** A legutóbb lezárt fejezet eredménye a felületnek. */
  lastResult: { chapter: number; success: boolean } | null;
  /** Hány fejezet bevezetőjét látta már a játékos. */
  introSeen: number;
  /** Megtalált elveszett receptek. */
  unlocked: string[];
  /** Az aktuális versenyfejezet legjobb pontszáma. */
  bestContest: number | null;
  /** Ezen a napon már neveztél versenyre. */
  contestDay: number | null;
  lastContest: { day: number; recipeId: string; score: number; target: number; win: boolean } | null;
}

export interface GameState {
  saveVersion: number;
  seed: number;
  rng: number;
  day: number;
  /** Nyitás óta eltelt játékmásodperc az aktuális napon. */
  time: number;
  phase: 'open' | 'dayEnd' | 'bankrupt';
  cash: number;
  restaurants: RestaurantState[];
  active: number;
  nextId: number;
  /** Egymást követő negatív pénzegyenlegű napzárások. */
  negativeDays: number;
  lastReport: EmpireReport | null;
  history: EmpireReport[];
  campaign: Campaign;
  tick: number;
}

/** Látványhoz szóló esemény; nem része a játékállapotnak és a mentésnek. */
export type FxEvent =
  | { kind: 'pay'; restaurant: number; amount: number; at: Pt; stars: number }
  | { kind: 'angry'; restaurant: number; at: Pt }
  | { kind: 'arrive'; restaurant: number; at: Pt };
