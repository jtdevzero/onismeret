// Kampány: „Gaston nyomában”. Tizenkét fejezet négy felvonásban, Párizstól Rómáig.
// A feltételek a napzárások jelentéseiből és az aktuális nap állásából számolódnak.

import type { NeighborhoodId } from '../data/content';
import { OPERATING, sumLedger } from './ledger';
import type { GameState, RestaurantState } from './types';

export type ChapterKind = 'happy' | 'profit' | 'goodDay' | 'cleanStreak' | 'contest' | 'openProfit' | 'reputation' | 'critic' | 'lostServed' | 'empire';

export interface ChapterDef {
  id: string;
  act: number;
  kind: ChapterKind;
  /** Határidő napokban a fejezet kezdetétől. */
  days: number;
  target: number;
  city?: NeighborhoodId;
  /** Teljesítéskor feloldott elveszett receptek. */
  unlocks?: string[];
  /** Teljesítéskor kapott pénz (eurócent). */
  cash?: number;
  /** A versenyen kötelező étel. */
  dish?: string;
}

export const CHAPTERS: ChapterDef[] = [
  { id: 'sealed', act: 1, kind: 'happy', days: 5, target: 40, city: 'paris' },
  { id: 'debts', act: 1, kind: 'profit', days: 7, target: 300000 },
  { id: 'first_page', act: 1, kind: 'goodDay', days: 10, target: 3.4, city: 'paris', unlocks: ['gaston_potaufeu'] },
  { id: 'saboteur', act: 1, kind: 'cleanStreak', days: 10, target: 3, city: 'paris' },
  { id: 'halles', act: 1, kind: 'contest', days: 7, target: 70, cash: 300000 },
  { id: 'nice', act: 2, kind: 'openProfit', days: 15, target: 1, city: 'riviera' },
  { id: 'fisher', act: 2, kind: 'reputation', days: 12, target: 3.3, city: 'riviera', unlocks: ['fisher_bouillabaisse'] },
  { id: 'critic', act: 2, kind: 'critic', days: 12, target: 3.8 },
  { id: 'contessa', act: 3, kind: 'lostServed', days: 7, target: 25, cash: 1500000 },
  { id: 'trastevere', act: 3, kind: 'empire', days: 30, target: 3 },
  { id: 'last_page', act: 3, kind: 'reputation', days: 15, target: 3.5, city: 'roma', unlocks: ['nonna_cacio', 'bouillon_dor'] },
  { id: 'final', act: 4, kind: 'contest', days: 10, target: 88, dish: 'bouillon_dor' },
];

/** A „jó nap” feltételei a goodDay, cleanStreak és critic fejezeteknél. */
export const GOOD_DAY_SERVED = 40;
export const STREAK_SERVED = 80;
export const STREAK_RATING = 3.0;

export interface Progress {
  chapter: number;
  def: ChapterDef;
  value: number;
  target: number;
  done: boolean;
  dayOfChapter: number;
  daysTotal: number;
}

function byCity(s: GameState, city: NeighborhoodId | undefined): RestaurantState | undefined {
  return city ? s.restaurants.find((r) => r.neighborhood === city) : s.restaurants[0];
}

/** A fejezet állása a lezárt napok és a mai nap alapján. */
export function progress(s: GameState): Progress | null {
  const c = s.campaign;
  if (c.mode !== 'campaign' || c.chapter >= CHAPTERS.length) return null;
  const def = CHAPTERS[c.chapter]!;
  const since = (r: RestaurantState) => r.history.filter((h) => h.day >= c.chapterStartDay);
  const open = s.phase === 'open';
  const r = byCity(s, def.city);
  let value = 0;
  switch (def.kind) {
    case 'happy':
      if (r) value = since(r).reduce((a, h) => a + h.stats.happyGuests, 0) + (open ? r.today.happyGuests : 0);
      break;
    case 'profit':
      value = s.history.filter((h) => h.day >= c.chapterStartDay).reduce((a, h) => a + h.profit, 0);
      if (open) value += s.restaurants.reduce((a, x) => a + sumLedger(x, OPERATING), 0);
      break;
    case 'goodDay':
      if (r) value = since(r).filter((h) => h.stats.servedGuests >= GOOD_DAY_SERVED).reduce((m, h) => Math.max(m, h.avgRating), 0);
      break;
    case 'cleanStreak': {
      if (!r) break;
      let streak = 0;
      for (const h of since(r)) streak = h.stats.servedGuests >= STREAK_SERVED && h.avgRating >= STREAK_RATING ? streak + 1 : 0;
      value = streak;
      break;
    }
    case 'contest':
      value = c.bestContest ?? 0;
      break;
    case 'openProfit':
      value = r && since(r).some((h) => h.profit > 0) ? 1 : 0;
      break;
    case 'reputation':
      value = r ? r.reputation : 0;
      break;
    case 'critic':
      value = s.restaurants.reduce(
        (m, x) => Math.max(m, since(x).filter((h) => h.stats.servedGuests >= GOOD_DAY_SERVED).reduce((mm, h) => Math.max(mm, h.avgRating), 0)),
        0,
      );
      break;
    case 'lostServed':
      value = s.restaurants.reduce((a, x) => a + since(x).reduce((b, h) => b + h.stats.lostServed, 0) + (open ? x.today.lostServed : 0), 0);
      break;
    case 'empire':
      value = s.history.filter((h) => h.day >= c.chapterStartDay).reduce((m, h) => Math.max(m, h.restaurants.filter((x) => x.report.profit > 0).length), 0);
      break;
  }
  return {
    chapter: c.chapter,
    def,
    value,
    target: def.target,
    done: value >= def.target,
    dayOfChapter: Math.max(1, s.day - c.chapterStartDay + 1),
    daysTotal: def.days,
  };
}

/** Fejezet teljesítése: jutalmak, következő fejezet. A feloldást a hívó végzi (unlock). */
export function completeChapter(s: GameState, nextStartDay: number): ChapterDef {
  const c = s.campaign;
  const def = CHAPTERS[c.chapter]!;
  c.lastResult = { chapter: c.chapter, success: true };
  c.chapter++;
  c.chapterStartDay = nextStartDay;
  c.bestContest = null;
  c.contestDay = null;
  return def;
}

/** Napzáráskor: teljesült-e vagy lejárt-e a fejezet. Visszaadja a teljesített fejezetet, ha van. */
export function evaluateChapter(s: GameState): ChapterDef | null {
  const p = progress(s);
  if (!p) return null;
  const c = s.campaign;
  if (p.done) return completeChapter(s, s.day + 1);
  if (p.dayOfChapter >= p.daysTotal) {
    c.lastResult = { chapter: c.chapter, success: false };
    c.chapterStartDay = s.day + 1;
    c.bestContest = null;
    c.contestDay = null;
  } else {
    c.lastResult = null;
  }
  return null;
}

export function currentChapter(s: GameState): ChapterDef | null {
  const c = s.campaign;
  if (c.mode !== 'campaign' || c.chapter >= CHAPTERS.length) return null;
  return CHAPTERS[c.chapter]!;
}

/** Vár-e olvasatlan történetrész (fejezet-bevezető vagy befejezés). Ilyenkor az idő áll. */
export function storyPending(s: GameState): boolean {
  const c = s.campaign;
  return c.mode === 'campaign' && s.phase !== 'bankrupt' && c.introSeen <= c.chapter && c.chapter <= CHAPTERS.length;
}

/** Várható versenypontszám szerencse nélkül. */
export function expectedScore(quality: number): number {
  return Math.round(100 * quality);
}
