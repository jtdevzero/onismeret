import { describe, expect, it } from 'vitest';
import { CHAPTERS, currentChapter, progress } from '../src/sim/campaign';
import { applyCommand, createGame, runDay, tick } from '../src/sim/sim';
import type { GameState, RestaurantState } from '../src/sim/types';
import { furnish, must, rest } from './helpers';

function byCity(s: GameState, n: RestaurantState['neighborhood']): RestaurantState | undefined {
  return s.restaurants.find((r) => r.neighborhood === n);
}

/** Minőségi ugrás egy étteremben: prémium alapanyag, dekoráció, több konyhai és felszolgáló kapacitás. */
function upgrade(s: GameState, r: RestaurantState): void {
  for (const m of r.menu) must(s, { type: 'setMenu', recipeId: m.recipeId, ingredient: 'premium', restaurant: r.id });
  for (const [kind, x, y] of [['piano', 16, 1], ['aquarium', 17, 4], ['plant', 0, 0], ['plant', 17, 11], ['plant', 9, 0], ['wine', 13, 0]] as const) {
    applyCommand(s, { type: 'place', kind, x, y, restaurant: r.id });
  }
  applyCommand(s, { type: 'place', kind: 'stove', x: 16, y: 9, restaurant: r.id });
  const best = (role: 'chef' | 'waiter') => r.candidates.filter((c) => c.role === role && !c.saboteur).sort((a, b) => b.skill - a.skill)[0];
  const chef = best('chef');
  if (chef) must(s, { type: 'hire', candidateId: chef.id, restaurant: r.id });
  const waiter = best('waiter');
  if (waiter) must(s, { type: 'hire', candidateId: waiter.id, restaurant: r.id });
}

/** „Ideális” játékmenet: minden fejezetnél a kézenfekvő lépések. */
function play(seed: number): { s: GameState; log: string[] } {
  const s = createGame(seed, 'campaign');
  const log: string[] = [];
  furnish(s, { tables: 6, chefs: 1, waiters: 2, cleaners: 1 });
  const upgraded = new Set<number>();
  for (let d = 0; d < 160 && s.campaign.chapter < CHAPTERS.length && s.phase !== 'bankrupt'; d++) {
    const ch = currentChapter(s)!;
    const paris = s.restaurants[0]!;
    if (['first_page', 'critic'].includes(ch.id) && !upgraded.has(paris.id)) {
      upgraded.add(paris.id);
      upgrade(s, paris);
    }
    for (const n of ['riviera', 'roma'] as const) {
      const want = (n === 'riviera' && ch.act >= 2) || (n === 'roma' && ch.id === 'trastevere') || (n === 'roma' && ch.act >= 3 && ch.id !== 'contessa');
      if (want && !byCity(s, n) && s.cash > 3_000_000) {
        const id = must(s, { type: 'open', neighborhood: n })!;
        furnish(s, { tables: 6, chefs: 1, waiters: 2, cleaners: 1 }, id);
        must(s, { type: 'switch', restaurant: paris.id });
      }
    }
    const local = ch.city ? byCity(s, ch.city) : undefined;
    if (local && ch.kind === 'reputation' && !upgraded.has(local.id)) {
      upgraded.add(local.id);
      upgrade(s, local);
    }
    if (ch.kind === 'contest') {
      const dish = ch.dish ?? paris.menu.find((m) => m.level === 5)?.recipeId ?? paris.menu[0]!.recipeId;
      applyCommand(s, { type: 'setMenu', recipeId: dish, ingredient: 'premium', restaurant: paris.id });
      applyCommand(s, { type: 'contest', recipeId: dish, restaurant: paris.id });
      if (s.campaign.chapter >= CHAPTERS.length) break;
      continue;
    }
    runDay(s);
    log.push(`${s.day}. nap: ${ch.id}, pénz ${s.cash}, ${JSON.stringify({ ...progress(s), def: undefined })}`);
    if (s.phase === 'dayEnd') must(s, { type: 'continue' });
  }
  return { s, log };
}

describe('kampány: Gaston nyomában', () => {
  it('mind a 12 fejezet teljesíthető egy kézenfekvő játékmenettel', () => {
    const { s, log } = play(3);
    if (s.campaign.chapter < CHAPTERS.length) console.log(log.slice(-25).join('\n'));
    expect(s.campaign.chapter).toBe(CHAPTERS.length);
    expect(s.campaign.unlocked).toEqual(expect.arrayContaining(['gaston_potaufeu', 'fisher_bouillabaisse', 'nonna_cacio', 'bouillon_dor']));
  }, 180000);

  it('lejárt határidő után a fejezet újraindul, nem lép tovább', () => {
    const s = createGame(1, 'campaign');
    for (let d = 0; d < 5; d++) {
      runDay(s);
      must(s, { type: 'continue' });
    }
    expect(s.campaign.chapter).toBe(0);
    expect(s.campaign.chapterStartDay).toBe(6);
  });

  it('szabad játékban nincs fejezet', () => {
    expect(progress(createGame(1, 'free'))).toBeNull();
  });

  it('a szabotőr elrontja az ételeket, és rontja az értékelést', () => {
    const make = () => {
      const s = createGame(4, 'campaign');
      furnish(s, { tables: 6, chefs: 1, waiters: 2, cleaners: 1 });
      s.campaign.chapter = CHAPTERS.findIndex((c) => c.id === 'saboteur');
      runDay(s);
      must(s, { type: 'continue' });
      return s;
    };
    const a = make();
    const b = make();
    const spy = rest(a).candidates.find((c) => c.saboteur);
    expect(spy).toBeDefined();
    expect(spy!.skill).toBeGreaterThan(80);
    // A régi séfet lecseréljük a gyanúsan jó jelentkezőre.
    const oldChef = rest(a).staff.find((x) => x.role === 'chef')!;
    must(a, { type: 'fire', staffId: oldChef.id });
    must(a, { type: 'hire', candidateId: spy!.id });
    const ra = runDay(a).restaurants[0]!.report;
    const rb = runDay(b).restaurants[0]!.report;
    expect(ra.stats.ruinedDishes).toBeGreaterThan(10);
    expect(rb.stats.ruinedDishes).toBe(0);
    expect(ra.avgRating).toBeLessThan(rb.avgRating);
  });

  it('versenyen naponta egyszer lehet nevezni, a gyenge étel kikap', () => {
    const s = createGame(2, 'campaign');
    furnish(s, { tables: 2, chefs: 1, waiters: 1 });
    s.campaign.chapter = CHAPTERS.findIndex((c) => c.id === 'halles');
    must(s, { type: 'setMenu', recipeId: 'onion_soup', ingredient: 'cheap' });
    must(s, { type: 'contest', recipeId: 'onion_soup' });
    expect(s.campaign.lastContest!.win).toBe(false);
    expect(applyCommand(s, { type: 'contest', recipeId: 'onion_soup' })).toEqual({ ok: false, error: 'contestToday' });
    tick(s);
  });
});
