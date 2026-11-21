/* Állóképesség, heti célok és a napi ellenőrzés egységtesztjei. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { maxHr, hrZones, weekStart, weeklyCardio, weeklyWorkouts, readiness, cardioPlan } from '../js/core/cardio.js';
import { buildSession, sessionSteps } from '../js/core/program.js';

const DAY = 86400000;

test('pulzus: Tanaka-maximum, zónák pulzustartalékkal és anélkül, növekvő sorrendben', () => {
  assert.equal(maxHr(34), 184);
  const z = hrZones(34, 62);
  assert.equal(z[0].method, 'reserve');
  assert.deepEqual([z[0].lo, z[0].hi], [135, 147]);
  for (let i = 0; i < z.length; i++) { assert.ok(z[i].lo < z[i].hi); if (i) assert.equal(z[i].lo, z[i - 1].hi); }
  const noRhr = hrZones(34, null);
  assert.equal(noRhr[0].method, 'max');
  assert.equal(noRhr[0].lo, Math.round(0.6 * 184));
  assert.deepEqual(hrZones(null, 60), []);
});

test('heti kardió: csak az aktuális hét számít, az intenzív perc duplán', () => {
  const now = new Date(2026, 10, 19, 12).getTime(); /* csütörtök */
  const mon = weekStart(now);
  assert.equal(new Date(mon).getDay(), 1);
  const items = [
    { date: mon + 1000, minutes: 30, intensity: 'moderate' },
    { date: mon + 2 * DAY, minutes: 20, intensity: 'vigorous' },
    { date: mon - 1000, minutes: 90, intensity: 'moderate' },
  ];
  const w = weeklyCardio(items, now);
  assert.equal(w.minutes, 50); assert.equal(w.equivalent, 70); assert.equal(w.pct, 47); assert.equal(w.sessions, 2);
  assert.equal(weeklyCardio([{ date: now, minutes: 200 }], now).pct, 100);
  assert.deepEqual(weeklyWorkouts([{ date: now }, { date: now - 10 * DAY }], now), { n: 1, goal: 5, pct: 20 });
  assert.equal(cardioPlan(30, w).left, 80);
  assert.match(cardioPlan(80, null).text, /intervallum/);
});

test('napi ellenőrzés: jó napon mehet, egy rossz jelnél könnyített, többnél vagy fájdalomnál pihenő', () => {
  assert.equal(readiness({ sleep: 3, soreness: 3, energy: 3 }).level, 'go');
  assert.equal(readiness({ sleep: 1, soreness: 3, energy: 3 }).level, 'light');
  assert.equal(readiness({ sleep: 2, soreness: 2, energy: 2 }).level, 'light');
  assert.equal(readiness({ sleep: 1, soreness: 1, energy: 3 }).level, 'rest');
  assert.equal(readiness({ sleep: 3, soreness: 3, energy: 3, pain: true }).level, 'rest');
  assert.equal(readiness({ sleep: 3 }), null);
});

test('könnyített edzés: kevesebb kör, és nem kér értékelést (nem torzítja a szintlépést)', () => {
  const ex = JSON.parse(readFileSync(new URL('../data/exercises.json', import.meta.url), 'utf8')).exercises;
  const byId = Object.fromEntries(ex.map(e => [e.id, e]));
  const st = { levels: { squat: 1, push: 2, hinge: 0, core: 1 }, targets: [], start: Date.now() };
  const full = buildSession('strengthA', st, ex), light = buildSession('strengthA', st, ex, Date.now(), { light: true });
  const main = s => s.blocks.filter(b => b.part === 'main');
  main(light).forEach((b, i) => assert.equal(b.sets, Math.max(1, main(full)[i].sets - 1)));
  assert.equal(sessionSteps(light, byId).filter(s => s.rate).length, 0);
  assert.ok(sessionSteps(full, byId).filter(s => s.rate).length > 0);
});
