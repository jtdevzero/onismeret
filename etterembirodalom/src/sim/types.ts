import type { IngredientQuality, ItemKind, NeighborhoodId } from '../data/content';

export const SAVE_VERSION = 1;

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

export type Role = 'chef' | 'waiter';

export interface Candidate {
  id: number;
  role: Role;
  name: string;
  skill: number;
  wage: number;
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

export type LedgerKind = 'revenue' | 'ingredients' | 'wages' | 'rent' | 'maintenance' | 'marketing' | 'purchase' | 'refund';

export interface LedgerEntry {
  time: number;
  kind: LedgerKind;
  /** Előjeles összeg: bevétel pozitív, kiadás negatív. */
  amount: number;
}

export interface DayStats {
  arrivedGuests: number;
  servedGuests: number;
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
  /** Berendezésvásárlás és -eladás nettó összege (nem része az eredménynek). */
  capex: number;
  stats: DayStats;
  avgRating: number;
  reputation: number;
  cashEnd: number;
}

export interface Restaurant {
  neighborhood: NeighborhoodId;
  width: number;
  height: number;
  entrance: Pt;
  items: PlacedItem[];
  gridVersion: number;
}

export interface GameState {
  saveVersion: number;
  seed: number;
  rng: number;
  day: number;
  /** Nyitás óta eltelt játékmásodperc az aktuális napon. */
  time: number;
  phase: 'open' | 'dayEnd';
  cash: number;
  reputation: number;
  marketingPerDay: number;
  restaurant: Restaurant;
  menu: MenuEntry[];
  staff: Staff[];
  candidates: Candidate[];
  groups: Group[];
  tickets: Ticket[];
  nextId: number;
  ledger: LedgerEntry[];
  today: DayStats;
  lastReport: DayReport | null;
  history: DayReport[];
  tick: number;
}
