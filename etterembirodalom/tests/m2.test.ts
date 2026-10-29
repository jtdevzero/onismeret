import { describe, expect, it } from 'vitest';
import { applyCommand, createGame, runDay, runTicks, shareOf } from '../src/sim/sim';
import type { GameState } from '../src/sim/types';
import { day, furnish, must, rest, setup } from './helpers';

const SEEDS = Array.from({ length: 30 }, (_, i) => i + 1);

function threeRestaurants(seed: number): GameState {
  const s = createGame(seed, 'free');
  s.cash = 20_000_000;
  furnish(s, { tables: 6, chefs: 1, waiters: 2, cleaners: 1 });
  for (const n of ['riviera', 'roma'] as const) {
    const id = must(s, { type: 'open', neighborhood: n })!;
    furnish(s, { tables: 6, chefs: 1, waiters: 2, cleaners: 1 }, id);
  }
  return s;
}

describe('M2 elfogadás: birodalom', () => {
  it('a birodalom napi eredménye pontosan az éttermek eredményeinek összege', () => {
    for (const seed of SEEDS) {
      const s = threeRestaurants(seed);
      const start = 20_000_000;
      const e = runDay(s);
      expect(e.restaurants).toHaveLength(3);
      expect(e.profit).toBe(e.restaurants.reduce((a, r) => a + r.report.profit, 0));
      expect(s.cash - start).toBe(e.profit + e.capex);
    }
  }, 60000);

  it('a háttérben futó étterem eredménye megegyezik azzal, mintha látnánk (eltérés ≤ 10%)', () => {
    const a = threeRestaurants(4);
    const b = threeRestaurants(4);
    const riviera = (s: GameState) => s.restaurants.find((r) => r.neighborhood === 'riviera')!;
    must(a, { type: 'switch', restaurant: riviera(a).id });
    must(b, { type: 'switch', restaurant: b.restaurants[0]!.id });
    let pa = 0;
    let pb = 0;
    for (let d = 0; d < 10; d++) {
      runDay(a);
      runDay(b);
      pa += riviera(a).lastReport!.profit;
      pb += riviera(b).lastReport!.profit;
      must(a, { type: 'continue' });
      must(b, { type: 'continue' });
    }
    expect(Math.abs(pa - pb)).toBeLessThanOrEqual(Math.abs(pa) * 0.1);
  }, 60000);

  it('legfeljebb 3 étterem, városonként egy', () => {
    const s = threeRestaurants(1);
    expect(applyCommand(s, { type: 'open', neighborhood: 'roma' })).toEqual({ ok: false, error: 'maxRestaurants' });
    const t = createGame(1, 'free');
    t.cash = 1e9;
    must(t, { type: 'open', neighborhood: 'roma' });
    expect(applyCommand(t, { type: 'open', neighborhood: 'roma' })).toEqual({ ok: false, error: 'alreadyOpen' });
  });
});

describe('M2 elfogadás: személyzet és tisztaság', () => {
  it('takarító nélkül a tisztaság egy nap alatt 60% alá esik, és az elégedettség csökken', () => {
    let without = 0;
    let withC = 0;
    for (const seed of SEEDS.slice(0, 8)) {
      const a = setup(seed, { tables: 6, chefs: 1, waiters: 2 });
      const ra = day(a);
      expect(ra.cleanliness).toBeLessThan(0.6);
      without += ra.avgRating;
      const b = setup(seed, { tables: 6, chefs: 1, waiters: 2, cleaners: 1 });
      const rb = day(b);
      expect(rb.cleanliness).toBeGreaterThan(0.8);
      withC += rb.avgRating;
    }
    expect(withC).toBeGreaterThan(without);
  });

  it('képzés: +10 képesség, 80 000 díj, másnap távol van', () => {
    const s = setup(2, { tables: 2, chefs: 1, waiters: 1 });
    const chef = rest(s).staff.find((x) => x.role === 'chef')!;
    const skill = chef.skill;
    const cash = s.cash;
    must(s, { type: 'train', staffId: chef.id });
    expect(chef.skill).toBe(Math.min(100, skill + 10));
    expect(s.cash).toBe(cash - 80000);
    expect(applyCommand(s, { type: 'train', staffId: chef.id })).toEqual({ ok: false, error: 'alreadyTraining' });
    runDay(s);
    must(s, { type: 'continue' });
    // A képzés napján nem főz: nincs elkészült étel.
    const r = day(s);
    expect(r.ingredients).toBe(0);
  });

  it('elbocsátás után a munkatárs eltűnik, a bére nem terheli a napot', () => {
    const s = setup(3, { tables: 2, chefs: 1, waiters: 2 });
    const w = rest(s).staff.find((x) => x.role === 'waiter')!;
    must(s, { type: 'fire', staffId: w.id });
    expect(rest(s).staff.some((x) => x.id === w.id)).toBe(false);
    const r = day(s);
    expect(r.wages).toBe(rest(s).staff.reduce((a, x) => a + x.wage, 0));
  });

  it('prémium alapanyag és 5-ös recept mellett a hírnév 10 nap alatt legalább 1 csillagot nő', () => {
    const s = setup(5, { tables: 6, chefs: 2, waiters: 3, cleaners: 1 });
    const r = rest(s);
    for (const m of r.menu) {
      must(s, { type: 'setMenu', recipeId: m.recipeId, ingredient: 'premium' });
      m.level = 5;
    }
    const start = r.reputation;
    for (let d = 0; d < 10; d++) {
      runDay(s);
      must(s, { type: 'continue' });
    }
    expect(r.reputation - start).toBeGreaterThanOrEqual(1);
  });
});

describe('M2 elfogadás: piac és csőd', () => {
  it('a marketing több vendéget hoz', () => {
    let base = 0;
    let mkt = 0;
    for (const seed of SEEDS.slice(0, 6)) {
      base += day(setup(seed, { tables: 10, chefs: 2, waiters: 3 })).stats.arrivedGuests;
      const s = setup(seed, { tables: 10, chefs: 2, waiters: 3 });
      must(s, { type: 'setMarketing', perDay: 30000 });
      mkt += day(s).stats.arrivedGuests;
    }
    expect(mkt).toBeGreaterThan(base * 1.15);
  });

  it('drágább étlap kisebb piaci részesedést ad a riválisokkal szemben', () => {
    const s = setup(1, { tables: 2, chefs: 1, waiters: 1 });
    const before = shareOf(s, rest(s)).share;
    for (const m of rest(s).menu) must(s, { type: 'setMenu', recipeId: m.recipeId, price: m.price * 1.5 });
    expect(shareOf(s, rest(s)).share).toBeLessThan(before);
  });

  it('a riválisok árat csökkentenek, ha a játékos részesedése tartósan 50% fölött van', () => {
    const s = setup(6, { tables: 10, chefs: 2, waiters: 3, cleaners: 1 });
    for (const m of rest(s).menu) {
      must(s, { type: 'setMenu', recipeId: m.recipeId, ingredient: 'premium' });
      m.level = 5;
    }
    const before = rest(s).rivals.map((x) => x.priceLevel);
    for (let d = 0; d < 7; d++) {
      runDay(s);
      must(s, { type: 'continue' });
    }
    const after = rest(s).rivals.map((x) => x.priceLevel);
    expect(after.every((p, i) => p <= before[i]!)).toBe(true);
    expect(after.some((p, i) => p < before[i]!)).toBe(true);
  });

  it('3 egymást követő negatív napzárás után csőd, utána nincs több parancs', () => {
    const s = setup(7, { tables: 2, chefs: 1, waiters: 1 });
    s.cash = -2_000_000;
    for (let d = 0; d < 3; d++) {
      runDay(s);
      if (d < 2) {
        expect(s.phase).toBe('dayEnd');
        must(s, { type: 'continue' });
      }
    }
    expect(s.phase).toBe('bankrupt');
    expect(applyCommand(s, { type: 'continue' })).toEqual({ ok: false, error: 'bankrupt' });
  });

  it('nap közben is fut minden étterem, nem csak a látható', () => {
    const s = threeRestaurants(8);
    runTicks(s, 1500);
    for (const r of s.restaurants) expect(r.today.arrivedGuests).toBeGreaterThan(0);
  });
});
