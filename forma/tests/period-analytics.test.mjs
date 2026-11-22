import { test } from 'node:test';
import assert from 'node:assert/strict';
import { periodSummary, periodSummaryCsv } from '../js/core/analytics.js';

const NOW = new Date(2026, 9, 25, 23, 30).getTime();
const w = (id, date, extra = {}) => ({ id, kind: 'workout', date, key: 'strengthA', minutes: 20, done: [{ ex: 'pushup', sets: 3, reps: 24 }], ...extra });

test('7/30/90 napos összesítő és idempotens deduplikálás', () => {
  const items = [w('recent', NOW), w('recent', NOW), w('old', NOW - 60 * 86400000)];
  assert.equal(periodSummary(items, { days: 7, now: NOW }).workouts, 1);
  assert.equal(periodSummary(items, { days: 30, now: NOW }).workouts, 1);
  assert.equal(periodSummary(items, { days: 90, now: NOW }).workouts, 2);
  assert.throws(() => periodSummary(items, { days: 365, now: NOW }), RangeError);
});

test('hiányzó mérték nem nullázódik és eltérő egységek nem adódnak össze', () => {
  const s = periodSummary([w('x', NOW), { id: 'body', kind: 'body', date: NOW, weight: 88 },
    { id: 'c', kind: 'cardio', date: NOW, minutes: 32 }], { days: 7, now: NOW });
  assert.equal(s.externalKgReps, null);
  assert.equal(s.sessionLoad, null);
  assert.equal(s.cardioMinutes, 32);
  assert.equal(s.weight.last, 88);
  assert.match(periodSummaryCsv(s), /nincs adat/);
});

test('helyi naptári nap kezdete DST-váltáskor', () => {
  const d = new Date(NOW); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 6);
  const first = d.getTime();
  const s = periodSummary([w('first', first), w('before', first - 1)], { days: 7, now: NOW });
  assert.equal(s.workouts, 1);
  assert.equal(s.from, first);
});
