/* U1-110: analitika. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildExerciseProgress, loggedExercises, buildConsistencyStats, buildAssessmentComparison } from '../js/core/analytics.js';

const DAY = 86400000, NOW = new Date(2026, 10, 18, 12).getTime();
const W = (id, d, extra) => ({ id, kind: 'workout', date: NOW - d * DAY, minutes: 20, done: [], ...extra });
const sc = (v = 1) => ({ version: v, normsVersion: 'n1', testsVersion: 't1', evaluation: {} });

test('gyakorlattrend: napló és régi összesítés külön forrásjelöléssel, nem teljesített sorozat nélkül', () => {
  const items = Object.freeze([
    W('a', 10, { done: [{ ex: 'db_row', sets: 3, reps: 30 }] }),
    W('b', 5, { schemaVersion: 2, log: [{ ex: 'db_row', sets: [{ reps: 10, weightKg: 8 }, { reps: 12, weightKg: 9 }, { reps: 15, weightKg: 12, done: false }] }] }),
    W('b', 5, {}),
    W('c', 1, { schemaVersion: 2, log: [{ ex: 'db_row', sets: [{ reps: 5, done: false }] }] }),
  ]);
  const p = buildExerciseProgress(items, 'db_row');
  assert.equal(p.length, 2, 'duplikátum és csak sikertelen sorozat kimarad');
  assert.equal(p[0].source, 'plan'); assert.equal(p[0].maxKg, null); assert.equal(p[0].totalReps, 30);
  assert.deepEqual([p[1].source, p[1].sets, p[1].bestReps, p[1].maxKg, p[1].totalReps], ['log', 2, 12, 9, 22]);
  assert.deepEqual(buildExerciseProgress(items, 'nincs'), []);
});

test('naplózott gyakorlatok gyakoriság szerint', () => {
  const items = [W('a', 2, { done: [{ ex: 'x1', sets: 1 }, { ex: 'x2', sets: 1 }] }), W('b', 1, { done: [{ ex: 'x2', sets: 1 }] })];
  assert.deepEqual(loggedExercises(items), [{ id: 'x2', count: 2 }, { id: 'x1', count: 1 }]);
});

test('rendszeresség: a folyó hét nem számít a teljesített hetek közé; könnyített és félbehagyott külön', () => {
  const items = [W('a', 1, { light: true }), W('b', 8), W('c', 9, { partial: true })];
  const s = buildConsistencyStats(items, { weeks: 4, now: NOW, goal: 2 });
  assert.equal(s.weeks.length, 4);
  assert.equal(s.weeks[3].workouts, 1); assert.equal(s.weeks[3].light, 1);
  assert.equal(s.weeks[2].workouts, 2); assert.equal(s.weeks[2].partial, 1);
  assert.equal(s.weeksMeetingGoal, 1);
  assert.equal(s.activeWeeks, 1);
  assert.equal(s.completeWeeks, 3);
});

test('felmérés-összevetés: eltérő pontozásnál nincs pontszámkülönbség, a nyers eredmény látszik', () => {
  const a = { id: 'a', kind: 'assessment', date: NOW - 50 * DAY, results: { pushup: 20, plank: 60 }, scoring: sc(1) };
  const b = { id: 'b', kind: 'assessment', date: NOW, results: { pushup: 25 }, scoring: sc(2) };
  const r = buildAssessmentComparison([b, a], () => ({ overall: 50 }));
  assert.equal(r.comparable, false);
  assert.equal(r.reason, 'scoring_changed');
  assert.equal(r.scoreDelta, null);
  assert.deepEqual(r.raw, [{ id: 'pushup', from: 20, to: 25, delta: 5 }]);
  const same = buildAssessmentComparison([a, { ...b, scoring: sc(1) }], x => ({ overall: x.id === 'a' ? 50 : 56 }));
  assert.equal(same.comparable, true);
  assert.equal(same.scoreDelta, 6);
  assert.equal(buildAssessmentComparison([a]).reason, 'not_enough');
});
