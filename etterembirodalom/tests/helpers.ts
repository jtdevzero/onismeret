import { activeRestaurant, applyCommand, createGame, runDay, type Command } from '../src/sim/sim';
import type { DayReport, GameState, RestaurantState, Role } from '../src/sim/types';

export const TABLE_SPOTS: [number, number][] = [
  [3, 2], [7, 2], [11, 2],
  [3, 6], [7, 6], [11, 6],
  [3, 10], [7, 10], [11, 10],
  [15, 2],
];

export function must(s: GameState, c: Command): number | undefined {
  const r = applyCommand(s, c);
  if (!r.ok) throw new Error(`Parancs sikertelen: ${JSON.stringify(c)} → ${r.error}`);
  return r.id;
}

export function rest(s: GameState): RestaurantState {
  return activeRestaurant(s);
}

/** Asztal négy székkel (fent, lent, bal, jobb). */
export function placeTable(s: GameState, x: number, y: number, restaurant?: number): void {
  must(s, { type: 'place', kind: 'table', x, y, restaurant });
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) must(s, { type: 'place', kind: 'chair', x: x + dx, y: y + dy, restaurant });
}

export function hireBest(s: GameState, role: Role, restaurant?: number): void {
  const r = restaurant === undefined ? rest(s) : s.restaurants.find((x) => x.id === restaurant)!;
  const c = r.candidates.filter((x) => x.role === role).sort((a, b) => b.skill - a.skill)[0];
  if (!c) throw new Error('Nincs jelölt');
  must(s, { type: 'hire', candidateId: c.id, restaurant: r.id });
}

export interface SetupOpts {
  tables: number;
  chefs: number;
  waiters: number;
  cleaners?: number;
}

/** Szabványos tesztelrendezés egy étteremben. */
export function furnish(s: GameState, opts: SetupOpts, restaurant?: number): void {
  for (const [x, y] of TABLE_SPOTS.slice(0, opts.tables)) placeTable(s, x, y, restaurant);
  for (let i = 0; i < opts.chefs; i++) must(s, { type: 'place', kind: 'stove', x: 16, y: 7 + i * 2, restaurant });
  must(s, { type: 'place', kind: 'counter', x: 14, y: 9, restaurant });
  for (let i = 0; i < opts.chefs; i++) hireBest(s, 'chef', restaurant);
  for (let i = 0; i < opts.waiters; i++) hireBest(s, 'waiter', restaurant);
  for (let i = 0; i < (opts.cleaners ?? 0); i++) hireBest(s, 'cleaner', restaurant);
}

export function setup(seed: number, opts: SetupOpts): GameState {
  const s = createGame(seed, 'free');
  furnish(s, opts);
  return s;
}

/** Egy nap lefuttatása; az első étterem jelentését adja vissza. */
export function day(s: GameState): DayReport {
  return runDay(s).restaurants[0]!.report;
}
