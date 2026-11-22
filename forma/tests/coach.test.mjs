/* U2-203: helyi edző – minden állítás adatra vezethető vissza, hiányzó adatnál nem mond semmit. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateLocalInsights } from '../js/core/coach-rules.js';

const DAY = 86400000, NOW = new Date(2026, 10, 20, 12).getTime(); /* péntek */
const A = { id: 'a', kind: 'assessment', date: NOW - 20 * DAY, profile: { age: 40, sex: 'female' }, results: {} };
const prog = { start: NOW - 20 * DAY, levels: {}, done: 4, ratings: {} };
const W = (id, d, extra = {}) => ({ id, kind: 'workout', date: NOW - d * DAY, minutes: 20, done: [], ...extra });

test('program nélkül vagy üres adatnál nincs kitalált megfigyelés', () => {
  assert.deepEqual(generateLocalInsights({ now: NOW }), []);
  assert.deepEqual(generateLocalInsights({ program: prog, items: [A, W('w', 1)], now: NOW, weeklyGoal: 1 }), []);
});

test('fájdalom elöl, linkkel; minden megfigyelésnek van bizonyítéka', () => {
  const items = [A, W('w', 1), { id: 'check-1', kind: 'check', date: NOW - DAY, sleep: 1, soreness: 1, energy: 2, pain: true }, { id: 'check-2', kind: 'check', date: NOW - 2 * DAY, sleep: 1, soreness: 2, energy: 2 }];
  const r = generateLocalInsights({ program: prog, items, now: NOW });
  assert.equal(r[0].id, 'pain');
  assert.ok(r.some(x => x.id === 'tired'));
  for (const x of r) assert.ok(x.evidence && x.evidence.length > 5, x.id);
  assert.doesNotMatch(JSON.stringify(r), /diagnózis|sérülésed van/);
});

test('hosszú szünet és heti cél', () => {
  const gap = generateLocalInsights({ program: prog, items: [A, W('w', 10)], now: NOW });
  assert.ok(gap.some(x => x.id === 'gap' && /10 napja/.test(x.text)));
  const goal = generateLocalInsights({ program: prog, items: [A, W('w', 1)], now: NOW, weeklyGoal: 3 });
  const g = goal.find(x => x.id === 'goal');
  assert.match(g.text, /Még 2 edzés a heti 3-es célig/);
});

test('súlyjavaslat csak jelzés, a program nem változik; legfeljebb a megadott számú megfigyelés', () => {
  const sets = rir => [1, 2, 3].map(i => ({ reps: 10, weightKg: 8, done: true, ...(i === 3 ? { rir } : {}) }));
  const p = Object.freeze({ ...prog, loads: Object.freeze({ db_row: 8 }), ratings: { push: ['easy'] } });
  const items = [A, W('a', 4, { log: [{ ex: 'db_row', sets: sets(3) }] }), W('b', 1, { log: [{ ex: 'db_row', sets: sets(4) }] })];
  const r = generateLocalInsights({ program: p, items, now: NOW, weeklyGoal: 2, exercises: [{ id: 'db_row', name: 'Evezés', ladder: 'pull_db', equipment: 'dumbbell' }] });
  assert.ok(r.some(x => x.id === 'load-db_row' && /9 kg/.test(x.text) && x.action.href === '#/program'));
  assert.ok(r.some(x => x.id === 'almost'));
  assert.deepEqual(p.loads, { db_row: 8 });
  assert.ok(generateLocalInsights({ program: p, items, now: NOW, weeklyGoal: 2, exercises: [] }, 1).length <= 1);
});
