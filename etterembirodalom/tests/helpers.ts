import { applyCommand, createGame, type Command } from '../src/sim/sim';
import type { GameState, Role } from '../src/sim/types';

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

/** Asztal négy székkel (fent, lent, bal, jobb). */
export function placeTable(s: GameState, x: number, y: number): void {
  must(s, { type: 'place', kind: 'table', x, y });
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) must(s, { type: 'place', kind: 'chair', x: x + dx, y: y + dy });
}

export function hireBest(s: GameState, role: Role): void {
  const c = s.candidates.filter((x) => x.role === role).sort((a, b) => b.skill - a.skill)[0];
  if (!c) throw new Error('Nincs jelölt');
  must(s, { type: 'hire', candidateId: c.id });
}

/** Szabványos tesztelrendezés: n asztal, 1 főzőállomás, 1 pult, adott létszám. */
export function setup(seed: number, opts: { tables: number; chefs: number; waiters: number }): GameState {
  const s = createGame(seed);
  for (const [x, y] of TABLE_SPOTS.slice(0, opts.tables)) placeTable(s, x, y);
  for (let i = 0; i < opts.chefs; i++) must(s, { type: 'place', kind: 'stove', x: 16, y: 7 + i * 2 });
  must(s, { type: 'place', kind: 'counter', x: 14, y: 9 });
  for (let i = 0; i < opts.chefs; i++) hireBest(s, 'chef');
  for (let i = 0; i < opts.waiters; i++) hireBest(s, 'waiter');
  return s;
}
