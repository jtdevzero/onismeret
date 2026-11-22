/* Érzékelős mérések, regeneráció, kihívások, előrejelzés, szünetek, import és kihíváskód egységtesztjei. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { swayMetrics, stepCount, bpmFromSignal } from '../js/core/sensors.js';
import { recoveryScore, CHALLENGES, challengeDose, challengeDay, forecastFitnessAge, breaksIcs, parseCsv, encodeChallenge, decodeChallenge } from '../js/core/extras.js';

const DAY = 86400000;

test('kilengés: nyugodt állás magas, imbolygás alacsony pontszám', () => {
  const mk = amp => Array.from({ length: 400 }, (_, i) => ({ t: i / 20, x: amp * Math.sin(i / 3), y: 9.81, z: amp * Math.cos(i / 4) }));
  const calm = swayMetrics(mk(0.03)), wobbly = swayMetrics(mk(0.5));
  assert.ok(calm.score > 90 && wobbly.score < 40, `${calm.score} / ${wobbly.score}`);
  assert.equal(swayMetrics([]), null);
});

test('lépésszámlálás: 170 lépés/perc körüli futásból a kadencia', () => {
  const s = []; const f = 170 / 60;
  for (let i = 0; i < 50 * 30; i++) { const t = i / 50; s.push({ t, x: 0.5, y: 9.81 + 6 * Math.max(0, Math.sin(2 * Math.PI * f * t)) ** 3, z: 0.3 }); }
  const r = stepCount(s);
  assert.ok(Math.abs(r.cadence - 170) <= 6, `kadencia: ${r.cadence}`);
});

test('pulzus a fényjelből: szinuszos jel 30 fps-sel, zajjal', () => {
  const t = [], v = []; let seed = 3; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5);
  for (let i = 0; i < 30 * 30; i++) { const s = i / 30; t.push(s); v.push(150 + 2 * Math.sin(2 * Math.PI * (66 / 60) * s) + 0.4 * rnd() + 0.05 * s); }
  const r = bpmFromSignal(t, v);
  assert.ok(r && Math.abs(r.bpm - 66) <= 3, JSON.stringify(r));
  assert.equal(bpmFromSignal(t.slice(0, 20), v.slice(0, 20)), null);
});

test('regenerációs pontszám: jó közérzet, emelkedett reggeli pulzus, nagy terhelés', () => {
  const now = new Date(2026, 10, 20, 8).getTime();
  const good = recoveryScore({ readiness: { date: now, sleep: 3, soreness: 3, energy: 3 }, now });
  assert.equal(good.level, 'go');
  const pulses = [62, 60, 61, 63].map((b, i) => ({ date: now - (i + 1) * DAY, bpm: b })).concat([{ date: now, bpm: 74 }]);
  const high = recoveryScore({ readiness: { date: now, sleep: 3, soreness: 3, energy: 3 }, pulses, now });
  assert.ok(high.score < good.score);
  const tired = recoveryScore({ readiness: { date: now, sleep: 1, soreness: 1, energy: 2 }, pulses, workouts: [{ date: now - DAY, minutes: 150 }], now });
  assert.equal(tired.level, 'rest');
  assert.equal(recoveryScore({ now }), null);
});

test('30 napos kihívás: fokozatos adag, minden 4. nap könnyebb, a napszámítás a kezdéstől', () => {
  const p = CHALLENGES.find(c => c.id === 'plank30');
  assert.equal(challengeDose(p, 1).amount, 20);
  assert.ok(challengeDose(p, 10).amount > challengeDose(p, 2).amount);
  assert.equal(challengeDose(p, 4).easy, true);
  assert.ok(challengeDose(p, 4).amount < challengeDose(p, 3).amount);
  assert.equal(challengeDose(p, 31), null);
  const s = new Date(2026, 0, 1, 20).getTime();
  assert.equal(challengeDay(s, new Date(2026, 0, 1, 9).getTime()), 1);
  assert.equal(challengeDay(s, new Date(2026, 0, 10, 9).getTime()), 10);
});

test('fittségi kor előrejelzés: csökkenő trend, korlátozott meredekség, kevés adatnál nincs', () => {
  const t0 = new Date(2026, 0, 1).getTime();
  const f = forecastFitnessAge([{ date: t0, age: 36 }, { date: t0 + 42 * DAY, age: 34 }], t0 + 42 * DAY);
  assert.ok(f.in90 < 34 && f.perMonth < 0, JSON.stringify(f));
  assert.equal(forecastFitnessAge([{ date: t0, age: 36 }]), null);
  assert.equal(forecastFitnessAge([{ date: t0, age: 36 }, { date: t0 + 5 * DAY, age: 30 }]), null, '3 hétnél rövidebb időköz');
  assert.ok(forecastFitnessAge([{ date: t0, age: 60 }, { date: t0 + 30 * DAY, age: 20 }], t0 + 30 * DAY).perMonth >= -2);
});

test('mozgásszünetek naptárfájlban: munkaidőben óránként, hétköznap', () => {
  const ics = breaksIcs({ from: 9, to: 12, start: new Date(2026, 0, 5), now: new Date(Date.UTC(2026, 0, 1)) });
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 2);
  assert.match(ics, /DTSTART:20260105T100000/);
  assert.match(ics, /BYDAY=MO,TU,WE,TH,FR/);
  assert.throws(() => breaksIcs({ from: 17, to: 9 }));
});

test('CSV import és kihíváskód: csak érvényes sorok és ismert tesztek', () => {
  const rows = parseCsv('2026-11-20;35;futás\nrossz;sor\n2026-11-21,20,séta\n2026-11-22;999;futás', ['walk', 'run']);
  assert.deepEqual(rows.map(r => [r.minutes, r.type]), [[35, 'run'], [20, 'walk']]);
  const code = encodeChallenge({ name: 'Józsi', results: { pushup: 24, plank: 80.5, 'rossz kulcs': 3 } });
  assert.match(code, /^FORMA1\./);
  const d = decodeChallenge(code, ['pushup', 'plank']);
  assert.deepEqual(d.results, { pushup: 24, plank: 80.5 }); assert.equal(d.name, 'Józsi');
  assert.equal(decodeChallenge('valami', ['pushup']), null);
  assert.deepEqual(decodeChallenge(code, ['pushup']).results, { pushup: 24 }, 'ismeretlen teszt kimarad');
});

test('szezonális blokkok és sportrutinok: létező rutinok és gyakorlatok', () => {
  const json = f => JSON.parse(readFileSync(new URL('../data/' + f, import.meta.url), 'utf8'));
  const ex = new Set(json('exercises.json').exercises.map(e => e.id)), rs = json('routines.json').routines, ids = new Set(rs.map(r => r.id));
  for (const r of rs) for (const [id] of r.blocks) assert.ok(ex.has(id), `${r.id}: ${id}`);
  for (const b of json('blocks.json').blocks) { assert.ok(b.weeks >= 4 && b.perWeek >= 2); for (const r of b.routines) assert.ok(ids.has(r), `${b.id}: ${r}`); }
  for (const s of ['runner', 'cyclist', 'tennis', 'football', 'balance60']) assert.ok(ids.has(s), s);
});
