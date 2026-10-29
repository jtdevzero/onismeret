// Mentés szerializálása és ellenőrzött betöltése. Hibás adat soha nem írja felül az aktuális játékot:
// a parseSave csak akkor ad vissza állapotot, ha a teljes séma érvényes.

import { z } from 'zod';
import { SAVE_VERSION, type GameState } from './types';

const pt = z.object({ x: z.number().finite(), y: z.number().finite() });
const agent = z.object({ pos: pt, path: z.array(pt), pathPos: z.number().finite(), goal: pt.nullable(), pathVer: z.number().int() });
const role = z.enum(['chef', 'waiter']);
const quality = z.enum(['cheap', 'normal', 'premium']);
const stats = z.object({
  arrivedGuests: z.number().int().nonnegative(),
  servedGuests: z.number().int().nonnegative(),
  leftPatience: z.number().int().nonnegative(),
  leftPrice: z.number().int().nonnegative(),
  leftClosing: z.number().int().nonnegative(),
  ratingSum: z.number().finite(),
  ratingCount: z.number().int().nonnegative(),
});
const report = z.object({
  day: z.number().int(),
  revenue: z.number(),
  ingredients: z.number(),
  wages: z.number(),
  rent: z.number(),
  maintenance: z.number(),
  marketing: z.number(),
  profit: z.number(),
  capex: z.number(),
  stats,
  avgRating: z.number(),
  reputation: z.number(),
  cashEnd: z.number(),
});

const gameStateSchema = z.object({
  saveVersion: z.literal(SAVE_VERSION),
  seed: z.number().int(),
  rng: z.number().int(),
  day: z.number().int().positive(),
  time: z.number().nonnegative(),
  phase: z.enum(['open', 'dayEnd']),
  cash: z.number().finite(),
  reputation: z.number().min(0).max(5),
  marketingPerDay: z.number().nonnegative(),
  restaurant: z.object({
    neighborhood: z.enum(['suburb', 'university', 'downtown']),
    width: z.number().int().positive().max(64),
    height: z.number().int().positive().max(64),
    entrance: pt,
    items: z.array(
      z.object({
        id: z.number().int(),
        kind: z.enum(['table', 'chair', 'stove', 'counter']),
        x: z.number().int(),
        y: z.number().int(),
        rot: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
      }),
    ),
    gridVersion: z.number().int(),
  }),
  menu: z.array(z.object({ recipeId: z.string(), onMenu: z.boolean(), price: z.number().positive(), ingredient: quality, level: z.number().int().min(1).max(5) })),
  staff: z.array(
    z.object({
      id: z.number().int(),
      role,
      name: z.string().max(80),
      skill: z.number().min(0).max(100),
      wage: z.number().nonnegative(),
      agent,
      stoveId: z.number().int().nullable(),
      cooking: z.array(z.object({ ticketId: z.number().int(), recipeId: z.string(), remaining: z.number() })),
      task: z
        .object({
          kind: z.enum(['order', 'serve', 'pay']),
          groupId: z.number().int(),
          ticketId: z.number().int().nullable(),
          stage: z.enum(['toCounter', 'toTable', 'working']),
          timer: z.number(),
        })
        .nullable(),
    }),
  ),
  candidates: z.array(z.object({ id: z.number().int(), role, name: z.string().max(80), skill: z.number(), wage: z.number() })),
  groups: z.array(
    z.object({
      id: z.number().int(),
      members: z.array(z.object({ agent, seatId: z.number().int().nullable(), dishIdx: z.number().int().nullable() })).min(1).max(8),
      phase: z.enum(['queue', 'toTable', 'waitOrder', 'ordering', 'waitFood', 'eating', 'waitPay', 'paying', 'leaving']),
      tableId: z.number().int().nullable(),
      phaseTime: z.number(),
      waitTotal: z.number(),
      eatRemaining: z.number(),
      ticketId: z.number().int().nullable(),
      leaveReason: z.enum(['done', 'patience', 'price', 'closing']).nullable(),
    }),
  ),
  tickets: z.array(
    z.object({
      id: z.number().int(),
      groupId: z.number().int(),
      dishes: z.array(z.string()),
      prices: z.array(z.number()),
      qualities: z.array(z.number()),
      started: z.number().int(),
      done: z.number().int(),
      state: z.enum(['queued', 'cooking', 'ready', 'carried', 'served']),
      waiterId: z.number().int().nullable(),
    }),
  ),
  nextId: z.number().int().positive(),
  ledger: z.array(
    z.object({
      time: z.number(),
      kind: z.enum(['revenue', 'ingredients', 'wages', 'rent', 'maintenance', 'marketing', 'purchase', 'refund']),
      amount: z.number(),
    }),
  ),
  today: stats,
  lastReport: report.nullable(),
  history: z.array(report),
  tick: z.number().int().nonnegative(),
});

export const SAVE_FORMAT = 'etterembirodalom-mentes';

export interface SaveEnvelope {
  format: typeof SAVE_FORMAT;
  version: number;
  savedAt: string;
  state: GameState;
}

export function serializeSave(state: GameState, savedAt: Date = new Date()): string {
  const env: SaveEnvelope = { format: SAVE_FORMAT, version: SAVE_VERSION, savedAt: savedAt.toISOString(), state };
  return JSON.stringify(env);
}

export type SaveError = 'corrupt' | 'notASave' | 'unsupportedVersion' | 'invalid';
export type ParseResult = { ok: true; state: GameState; savedAt: string } | { ok: false; error: SaveError };

export function parseSave(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'corrupt' };
  }
  if (typeof raw !== 'object' || raw === null || (raw as { format?: unknown }).format !== SAVE_FORMAT) {
    return { ok: false, error: 'notASave' };
  }
  const env = raw as { version?: unknown; state?: unknown; savedAt?: unknown };
  if (typeof env.version !== 'number' || env.version > SAVE_VERSION) return { ok: false, error: 'unsupportedVersion' };
  const migrated = migrate(env.version, env.state);
  const parsed = gameStateSchema.safeParse(migrated);
  if (!parsed.success) return { ok: false, error: 'invalid' };
  return { ok: true, state: parsed.data as GameState, savedAt: typeof env.savedAt === 'string' ? env.savedAt : '' };
}

/** Migrációk a korábbi sémaverziókról. Jelenleg csak az 1-es verzió létezik. */
function migrate(_version: number, state: unknown): unknown {
  return state;
}
