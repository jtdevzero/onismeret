/* Rekordok, jelvények, célok, testméretek és mini-teszt egységtesztjei. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { records, badges, bodyTrend, currentFitnessAge, goalProgress, metricValue, miniDue, testHistory } from '../js/core/achievements.js';

const norms = JSON.parse(readFileSync(new URL('../data/norms.json', import.meta.url), 'utf8'));
const DAY = 86400000, T0 = new Date(2026, 0, 5, 12).getTime(), man = { age: 34, sex: 'male' };
const VITALS = { rhr: 62, waist: 92, frequency: 2.5, intensity: 5, duration: 0.75 };
const base = [
  { kind: 'assessment', date: T0, profile: man, results: { pushup: 18, plank: 60, step_test: 105 }, vitals: VITALS },
  { kind: 'mini', date: T0 + 20 * DAY, profile: man, results: { pushup: 23, plank: 55 } },
  { kind: 'assessment', date: T0 + 42 * DAY, profile: man, results: { pushup: 21, plank: 80, step_test: 98 }, vitals: VITALS },
];

test('mérési előzmény és rekordok: a mini-teszt is számít, a lépcsőtesztnél a kisebb a jobb', () => {
  assert.deepEqual(testHistory(base, 'pushup').map(h => h.value), [18, 23, 21]);
  const r = Object.fromEntries(records(base, ['pushup', 'plank', 'step_test', 'sit_reach']).map(x => [x.id, x]));
  assert.equal(r.pushup.best, 23); assert.equal(r.pushup.improved, true);
  assert.equal(r.plank.best, 80);
  assert.equal(r.step_test.best, 98);
  assert.equal(r.sit_reach, undefined);
});

test('testméretek és fittségi kor most: a friss derékbőséggel újraszámol', () => {
  const items = [...base, { kind: 'body', date: T0 + 50 * DAY, waist: 86, weight: 82 }, { kind: 'body', date: T0 + 43 * DAY, waist: 90 }];
  const t = bodyTrend(items);
  assert.equal(t.waist.value, 86); assert.equal(t.waist.change, -4); assert.equal(t.weight.change, null);
  const before = currentFitnessAge(base, man, norms), after = currentFitnessAge(items, man, norms);
  assert.equal(after.waistUpdated, true);
  assert.ok(after.age < before.age, `${after.age} < ${before.age}`);
  assert.equal(currentFitnessAge([], man, norms), null);
  assert.equal(metricValue(items, 'weight', man, norms), 82);
  assert.equal(metricValue(items, 'pushup', man, norms), 21);
});

test('célok: növekvő és csökkenő cél, teljesítés, hátralévő napok', () => {
  const up = goalProgress({ metric: 'pushup', start: 18, target: 30, deadline: T0 + 100 * DAY }, base, man, norms, T0 + 50 * DAY);
  assert.deepEqual({ c: up.current, p: up.pct, d: up.done, l: up.daysLeft }, { c: 21, p: 25, d: false, l: 50 });
  const down = goalProgress({ metric: 'step_test', start: 105, target: 100 }, base, man, norms);
  assert.equal(down.done, true); assert.equal(down.pct, 100); assert.equal(down.lower, true);
  assert.equal(goalProgress({ metric: 'waist', start: 92, target: 85 }, base, man, norms).current, null);
});

test('jelvények: edzésszám, szintlépés, négy erős hét, heti 150 kardióperc, rekord', () => {
  const items = [];
  for (let w = 0; w < 4; w++) for (let d = 0; d < 4; d++) items.push({ kind: 'workout', date: T0 + (w * 7 + d) * DAY, changes: w === 1 && d === 0 ? [{ ladder: 'pull_bar', from: 2, to: 3 }] : [] });
  items.push({ kind: 'cardio', date: T0 + 1 * DAY, minutes: 80, intensity: 'moderate' }, { kind: 'cardio', date: T0 + 2 * DAY, minutes: 40, intensity: 'vigorous' });
  const b = Object.fromEntries(badges(items, { records: records(base, ['pushup']), fitnessAge: 30, age: 34 }).map(x => [x.id, x]));
  assert.equal(b.first.earned, true); assert.equal(b.ten.earned, true); assert.equal(b.fifty.earned, false);
  assert.equal(b.levelup.earned, true); assert.equal(b.pullup.earned, true); assert.equal(b.pushup.earned, false);
  assert.equal(b.fourweeks.earned, true); assert.equal(b.cardio150.earned, true);
  assert.equal(b.record.earned, true); assert.equal(b.younger.earned, true); assert.equal(b.goal.earned, false);
  assert.equal(badges([], {}).filter(x => x.earned).length, 0);
});

test('mini-teszt esedékes: a ciklus 3. hetében, ha ebben a ciklusban még nem volt', () => {
  const prog = { start: T0 };
  assert.equal(miniDue([], prog, T0 + 5 * DAY), false);
  assert.equal(miniDue([], prog, T0 + 15 * DAY), true);
  assert.equal(miniDue([{ kind: 'mini', date: T0 + 15 * DAY }], prog, T0 + 16 * DAY), false);
  assert.equal(miniDue([], prog, T0 + 30 * DAY), false);
  assert.equal(miniDue([{ kind: 'mini', date: T0 + 15 * DAY }], prog, T0 + 57 * DAY), true, 'a következő ciklusban újra');
  assert.equal(miniDue([], null), false);
});
