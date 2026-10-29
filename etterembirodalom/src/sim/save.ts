// Mentés szerializálása és ellenőrzött betöltése. Hibás adat soha nem írja felül az aktuális játékot:
// a parseSave csak akkor ad vissza állapotot, ha a teljes séma érvényes.

import { z } from 'zod';
import { SAVE_VERSION, type GameState } from './types';

const pt = z.object({ x: z.number().finite(), y: z.number().finite() });
const agent = z.object({ pos: pt, path: z.array(pt), pathPos: z.number().finite(), goal: pt.nullable(), pathVer: z.number().int() });
const role = z.enum(['chef', 'waiter', 'cleaner']);
const quality = z.enum(['cheap', 'normal', 'premium']);
const neighborhood = z.enum(['paris', 'riviera', 'roma']);
const stats = z.object({
  arrivedGuests: z.number().int().nonnegative(),
  servedGuests: z.number().int().nonnegative(),
  happyGuests: z.number().int().nonnegative(),
  lostServed: z.number().int().nonnegative(),
  ruinedDishes: z.number().int().nonnegative(),
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
  cleanliness: z.number(),
  share: z.number(),
});
const ledgerKind = z.enum(['revenue', 'ingredients', 'wages', 'rent', 'maintenance', 'marketing', 'purchase', 'refund', 'training', 'opening', 'style', 'reward']);

const restaurantSchema = z.object({
  id: z.number().int(),
  name: z.string().max(80),
  neighborhood,
  layout: z.object({
    width: z.number().int().positive().max(64),
    height: z.number().int().positive().max(64),
    entrance: pt,
    items: z.array(
      z.object({
        id: z.number().int(),
        kind: z.enum(['table', 'chair', 'stove', 'counter', 'plant', 'lamp', 'aquarium', 'wine', 'piano']),
        x: z.number().int(),
        y: z.number().int(),
        rot: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
      }),
    ),
    gridVersion: z.number().int(),
  }),
  style: z.object({ floor: z.enum(['parquet', 'marble', 'terracotta']), wall: z.enum(['emerald', 'bordeaux', 'navy', 'olive']) }),
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
      cleanTimer: z.number(),
      trainingDay: z.number().int().nullable(),
      saboteur: z.boolean(),
    }),
  ),
  candidates: z.array(z.object({ id: z.number().int(), role, name: z.string().max(80), skill: z.number(), wage: z.number(), saboteur: z.boolean() })),
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
  reputation: z.number().min(0).max(5),
  cleanliness: z.number().min(0).max(1),
  marketingPerDay: z.number().nonnegative(),
  rivals: z.array(z.object({ id: z.string(), priceLevel: z.number() })),
  ledger: z.array(z.object({ time: z.number(), kind: ledgerKind, amount: z.number() })),
  today: stats,
  lastReport: report.nullable(),
  history: z.array(report),
});

const empireReport = z.object({
  day: z.number().int(),
  profit: z.number(),
  revenue: z.number(),
  capex: z.number(),
  cashEnd: z.number(),
  restaurants: z.array(z.object({ id: z.number().int(), neighborhood, report })),
});

const gameStateSchema = z.object({
  saveVersion: z.literal(SAVE_VERSION),
  seed: z.number().int(),
  rng: z.number().int(),
  day: z.number().int().positive(),
  time: z.number().nonnegative(),
  phase: z.enum(['open', 'dayEnd', 'bankrupt']),
  cash: z.number().finite(),
  restaurants: z.array(restaurantSchema).min(1).max(3),
  active: z.number().int(),
  nextId: z.number().int().positive(),
  negativeDays: z.number().int().nonnegative(),
  lastReport: empireReport.nullable(),
  history: z.array(empireReport),
  campaign: z.object({
    mode: z.enum(['campaign', 'free']),
    chapter: z.number().int().nonnegative(),
    chapterStartDay: z.number().int().positive(),
    lastResult: z.object({ chapter: z.number().int(), success: z.boolean() }).nullable(),
    introSeen: z.number().int().nonnegative(),
    unlocked: z.array(z.string()),
    bestContest: z.number().nullable(),
    contestDay: z.number().int().nullable(),
    lastContest: z.object({ day: z.number().int(), recipeId: z.string(), score: z.number(), target: z.number(), win: z.boolean() }).nullable(),
  }),
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
  return { ok: true, state: parsed.data as unknown as GameState, savedAt: typeof env.savedAt === 'string' ? env.savedAt : '' };
}

/** Migrációk a korábbi sémaverziókról: v1 = egyetlen étterem a gyökérben. */
function migrate(version: number, state: unknown): unknown {
  if (version >= 2 || typeof state !== 'object' || state === null) return state;
  const v1 = state as Record<string, unknown> & { restaurant?: Record<string, unknown>; staff?: Record<string, unknown>[]; lastReport?: Record<string, unknown> | null; history?: Record<string, unknown>[] };
  const upgradeReport = (r: Record<string, unknown>) => {
    const { cashEnd: _cash, ...rest } = r;
    const st = (rest.stats ?? {}) as Record<string, unknown>;
    return { ...rest, stats: { ...st, happyGuests: 0, lostServed: 0, ruinedDishes: 0 }, cleanliness: 1, share: 1 };
  };
  const reports = (v1.history ?? []).map(upgradeReport);
  const id = typeof v1.nextId === 'number' ? v1.nextId : 1;
  const restaurant = {
    id,
    name: 'Chez Gaston',
    neighborhood: 'paris',
    layout: {
      width: v1.restaurant?.width,
      height: v1.restaurant?.height,
      entrance: v1.restaurant?.entrance,
      items: v1.restaurant?.items,
      gridVersion: v1.restaurant?.gridVersion,
    },
    style: { floor: 'parquet', wall: 'emerald' },
    menu: v1.menu,
    staff: (v1.staff ?? []).map((st) => ({ ...st, cleanTimer: 0, trainingDay: null, saboteur: false })),
    candidates: ((v1.candidates as Record<string, unknown>[]) ?? []).map((c) => ({ ...c, saboteur: false })),
    groups: v1.groups,
    tickets: v1.tickets,
    reputation: v1.reputation,
    cleanliness: 1,
    marketingPerDay: v1.marketingPerDay ?? 0,
    rivals: [
      { id: 'coin', priceLevel: 0.95 },
      { id: 'gg_paris', priceLevel: 0.7 },
    ],
    ledger: v1.ledger,
    today: { ...((v1.today as Record<string, unknown>) ?? {}), happyGuests: 0, lostServed: 0, ruinedDishes: 0 },
    lastReport: v1.lastReport ? upgradeReport(v1.lastReport) : null,
    history: reports,
  };
  const empire = (r: Record<string, unknown>, cashEnd: unknown) => ({
    day: r.day,
    profit: r.profit,
    revenue: r.revenue,
    capex: r.capex,
    cashEnd,
    restaurants: [{ id, neighborhood: restaurant.neighborhood, report: upgradeReport(r) }],
  });
  return {
    saveVersion: 2,
    seed: v1.seed,
    rng: v1.rng,
    day: v1.day,
    time: v1.time,
    phase: v1.phase,
    cash: v1.cash,
    restaurants: [restaurant],
    active: id,
    nextId: id + 1,
    negativeDays: 0,
    lastReport: v1.lastReport ? empire(v1.lastReport, v1.lastReport.cashEnd) : null,
    history: (v1.history ?? []).map((r) => empire(r, r.cashEnd)),
    campaign: { mode: 'free', chapter: 0, chapterStartDay: 1, lastResult: null, introSeen: 0, unlocked: [], bestContest: null, contestDay: null, lastContest: null },
    tick: v1.tick,
  };
}
