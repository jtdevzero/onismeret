import { describe, expect, it } from 'vitest';
import { referencePrice } from '../src/sim/formulas';
import { parseSave, serializeSave } from '../src/sim/save';
import { TICKS_PER_DAY, applyCommand, createGame, runDay, runTicks, sumLedger, tick } from '../src/sim/sim';
import type { GameState } from '../src/sim/types';
import { must, placeTable, setup } from './helpers';

const SEEDS = Array.from({ length: 30 }, (_, i) => i + 1);

describe('M1 elfogadás: idő és determinizmus', () => {
  it('egy játéknap 4800 lépés: 1×-en 8 perc, 4×-en 2 perc', () => {
    expect(TICKS_PER_DAY).toBe(4800);
    expect((TICKS_PER_DAY * 100) / 1000 / 60).toBe(8);
    expect((TICKS_PER_DAY * 100) / 4 / 1000 / 60).toBe(2);
  });

  it('1× és 4× ugyanazzal a seeddel bitre azonos napot ad', () => {
    const a = setup(7, { tables: 6, chefs: 1, waiters: 2 });
    const b = setup(7, { tables: 6, chefs: 1, waiters: 2 });
    while (a.phase === 'open') tick(a); // 1×: képkockánként egy lépés
    while (b.phase === 'open') runTicks(b, 4); // 4×: képkockánként négy lépés
    expect(JSON.stringify(b)).toBe(JSON.stringify(a));
  });

  it('mentés és visszatöltés nap közben nem változtat az eredményen', () => {
    const a = setup(11, { tables: 6, chefs: 1, waiters: 2 });
    const b = setup(11, { tables: 6, chefs: 1, waiters: 2 });
    runTicks(a, 2000);
    runTicks(b, 2000);
    const parsed = parseSave(serializeSave(b));
    if (!parsed.ok) throw new Error(parsed.error);
    const c = parsed.state;
    runDay(a);
    runDay(c);
    expect(JSON.stringify(c)).toBe(JSON.stringify(a));
  });
});

describe('M1 elfogadás: gazdaság', () => {
  it('optimális beállítással (6 asztal, 1 séf, 2 pincér, referenciaár) az 1. nap átlagosan +40 000 és +120 000 Ft között zárul', () => {
    const profits = SEEDS.map((seed) => runDay(setup(seed, { tables: 6, chefs: 1, waiters: 2 })).profit);
    const mean = profits.reduce((a, b) => a + b, 0) / profits.length;
    expect(mean).toBeGreaterThanOrEqual(40000);
    expect(mean).toBeLessThanOrEqual(120000);
    // A futások legalább 80%-a nyereséges.
    expect(profits.filter((p) => p > 0).length).toBeGreaterThanOrEqual(SEEDS.length * 0.8);
  });

  it('egy pincérrel 10 asztalnál a vendégek legalább 25%-a türelemvesztés miatt távozik', () => {
    let left = 0;
    let arrived = 0;
    let leftWithThree = 0;
    let arrivedWithThree = 0;
    for (const seed of SEEDS.slice(0, 10)) {
      const one = runDay(setup(seed, { tables: 10, chefs: 1, waiters: 1 }));
      left += one.stats.leftPatience;
      arrived += one.stats.arrivedGuests;
      const three = runDay(setup(seed, { tables: 10, chefs: 1, waiters: 3 }));
      leftWithThree += three.stats.leftPatience;
      arrivedWithThree += three.stats.arrivedGuests;
    }
    expect(left / arrived).toBeGreaterThanOrEqual(0.25);
    // A különbség a pincérhiányból fakad: elég pincérrel jóval kevesebben mennek el.
    expect(leftWithThree / arrivedWithThree).toBeLessThan(left / arrived - 0.15);
  });

  it('a referenciaár 2,5-szeresén a rendelésig eljutó vendégek legalább 60%-a rendelés nélkül távozik', () => {
    let refused = 0;
    let served = 0;
    for (const seed of SEEDS.slice(0, 10)) {
      const s = setup(seed, { tables: 6, chefs: 1, waiters: 2 });
      for (const m of s.menu) must(s, { type: 'setMenu', recipeId: m.recipeId, price: referencePrice(m.recipeId, 'university') * 2.5 });
      const r = runDay(s);
      refused += r.stats.leftPrice;
      served += r.stats.servedGuests;
    }
    expect(refused / (refused + served)).toBeGreaterThanOrEqual(0.6);
  });

  it('a napi eredmény egyezik a könyvelés összegével, a pénzváltozás az eredmény és a beruházás összege', () => {
    for (const seed of SEEDS.slice(0, 5)) {
      const s = setup(seed, { tables: 6, chefs: 1, waiters: 2 });
      const startCash = 3_000_000;
      const r = runDay(s);
      expect(r.profit).toBe(r.revenue - r.ingredients - r.wages - r.rent - r.maintenance - r.marketing);
      expect(r.profit + r.capex).toBe(sumLedger(s, ['revenue', 'ingredients', 'wages', 'rent', 'maintenance', 'marketing', 'purchase', 'refund']));
      expect(s.cash - startCash).toBe(r.profit + r.capex);
    }
  });

  it('több napon át fut, a hírnév 0 és 5 között marad', () => {
    const s = setup(3, { tables: 6, chefs: 1, waiters: 2 });
    for (let d = 0; d < 5; d++) {
      runDay(s);
      expect(s.reputation).toBeGreaterThanOrEqual(0);
      expect(s.reputation).toBeLessThanOrEqual(5);
      must(s, { type: 'continue' });
    }
    expect(s.history).toHaveLength(5);
    expect(s.day).toBe(6);
  });
});

describe('M1 elfogadás: építés', () => {
  it('elzárt útvonalú elemet nem lehet lerakni, és a hiba megmondja, miért', () => {
    const s = createGame(1);
    // Főzőállomás a sarokban: ha a második szomszédját is beépítjük, a séf nem éri el.
    must(s, { type: 'place', kind: 'stove', x: 17, y: 0 });
    must(s, { type: 'place', kind: 'counter', x: 16, y: 0 });
    expect(applyCommand(s, { type: 'place', kind: 'chair', x: 17, y: 1 })).toEqual({ ok: false, error: 'blocksPath' });
    // Teljes fal a terem közepén: a túloldali asztal elérhetetlenné válna.
    const t = createGame(1);
    must(t, { type: 'place', kind: 'table', x: 12, y: 5 });
    for (let y = 0; y < 11; y++) must(t, { type: 'place', kind: 'counter', x: 9, y });
    expect(applyCommand(t, { type: 'place', kind: 'counter', x: 9, y: 11 })).toEqual({ ok: false, error: 'blocksPath' });
  });

  it('a bejárat és az előtere nem építhető be', () => {
    const s = createGame(1);
    expect(applyCommand(s, { type: 'place', kind: 'table', x: 0, y: 6 })).toEqual({ ok: false, error: 'reserved' });
    expect(applyCommand(s, { type: 'place', kind: 'table', x: 1, y: 6 })).toEqual({ ok: false, error: 'reserved' });
  });

  it('foglalt mezőre, pályán kívülre és pénz nélkül nem lehet építeni', () => {
    const s = createGame(1);
    must(s, { type: 'place', kind: 'table', x: 5, y: 5 });
    expect(applyCommand(s, { type: 'place', kind: 'chair', x: 5, y: 5 })).toEqual({ ok: false, error: 'occupied' });
    expect(applyCommand(s, { type: 'place', kind: 'chair', x: 18, y: 5 })).toEqual({ ok: false, error: 'outOfBounds' });
    s.cash = 100;
    expect(applyCommand(s, { type: 'place', kind: 'stove', x: 9, y: 9 })).toEqual({ ok: false, error: 'noMoney' });
  });

  it('építés levonja az árat, eladás 50%-ot visszaad', () => {
    const s = createGame(1);
    const id = must(s, { type: 'place', kind: 'stove', x: 9, y: 9 })!;
    expect(s.cash).toBe(3_000_000 - 250_000);
    must(s, { type: 'remove', id });
    expect(s.cash).toBe(3_000_000 - 125_000);
  });

  it('a vendégkör végigjátszható: érkezés → ültetés → rendelés → evés → fizetés', () => {
    const s = setup(5, { tables: 2, chefs: 1, waiters: 1 });
    const phases = new Set<string>();
    while (s.phase === 'open') {
      tick(s);
      for (const g of s.groups) phases.add(g.phase);
    }
    for (const p of ['queue', 'toTable', 'waitOrder', 'ordering', 'waitFood', 'eating', 'waitPay', 'paying', 'leaving']) {
      expect(phases.has(p), p).toBe(true);
    }
    expect(s.lastReport!.revenue).toBeGreaterThan(0);
  });

  it('asztal nélkül senki nem fizet, a vendégek elmennek', () => {
    const s = createGame(2);
    const r = runDay(s);
    expect(r.revenue).toBe(0);
    expect(r.stats.arrivedGuests).toBeGreaterThan(0);
  });

  it('egy asztal 4 székkel a tesztelrendezés építőköve', () => {
    const s: GameState = createGame(1);
    placeTable(s, 4, 3);
    expect(s.restaurant.items.filter((i) => i.kind === 'chair')).toHaveLength(4);
  });
});

describe('mentés', () => {
  it('sérült, idegen vagy újabb verziójú mentés érthető hibát ad', () => {
    expect(parseSave('{nem json')).toEqual({ ok: false, error: 'corrupt' });
    expect(parseSave('{"format":"más"}')).toEqual({ ok: false, error: 'notASave' });
    expect(parseSave(JSON.stringify({ format: 'etterembirodalom-mentes', version: 99, state: {} }))).toEqual({ ok: false, error: 'unsupportedVersion' });
    expect(parseSave(JSON.stringify({ format: 'etterembirodalom-mentes', version: 1, state: { cash: 'sok' } }))).toEqual({ ok: false, error: 'invalid' });
  });

  it('a mentés-visszatöltés mélyen egyező állapotot ad', () => {
    const s = setup(9, { tables: 4, chefs: 1, waiters: 1 });
    runTicks(s, 1234);
    const p = parseSave(serializeSave(s));
    expect(p.ok).toBe(true);
    if (p.ok) expect(p.state).toEqual(JSON.parse(JSON.stringify(s)));
  });
});
