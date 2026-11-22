import { test } from 'node:test';
import assert from 'node:assert/strict';
import { periodSummary, periodSummaryCsv, exerciseProgressCsv, buildExerciseProgress, buildRecoveryTimeline } from '../js/core/analytics.js';

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

test('részleges és könnyített edzések, ismert fájdalomválaszok elkülönítése', () => {
  const s = periodSummary([w('a', NOW, { partial: true, light: true }),
    { id: 'c1', kind: 'check', date: NOW, pain: true },
    { id: 'c2', kind: 'check', date: NOW - 3600000 },
    { id: 'c3', kind: 'check', date: NOW - 7200000, pain: false }], { days: 7, now: NOW });
  assert.equal(s.partialWorkouts, 1);
  assert.equal(s.lightWorkouts, 1);
  assert.equal(s.painReports, 1);
  assert.equal(s.knownPainResponses, 2);
  assert.match(periodSummaryCsv(s), /Fájdalomkérdés kitöltve/);
});

test('sérült és hiányzó tételek, negatív kardió nem szennyezik az összesítőt', () => {
  const s = periodSummary([null, 14, {}, { id: 'bad', kind: 'cardio', date: NOW, minutes: -100 }], { days: 7, now: NOW });
  assert.equal(s.cardioSessions, 1);
  assert.equal(s.cardioMinutes, null);
  assert.equal(periodSummary(null, { days: 7, now: NOW }).workouts, 0);
});

test('CSV: gyakorlat naplója exportálható, hiányzó érték nincs nullázva, képlet nem futtatható', () => {
  const rows = buildExerciseProgress([w('a', NOW)], 'pushup');
  const csv = exerciseProgressCsv(rows, '=HYPERLINK("malicious")');
  assert.match(csv, /Gyakorlat/);
  assert.match(csv, /nincs adat/);
  assert.match(csv, /'=HYPERLINK/);
  assert.doesNotMatch(csv, /;"=HYPERLINK/);
});

test('regeneráció: a hiányzó fájdalomválasz nem jelenti azt, hogy nincs fájdalom', () => {
  const rows = buildRecoveryTimeline([{ id: 'a', kind: 'check', date: NOW },
    { id: 'b', kind: 'check', date: NOW - 1000, pain: false }], { days: 7, now: NOW });
  assert.equal(rows[0].pain, null);
  assert.equal(rows[1].pain, false);
});

test('testsúly és derékbőség változását csak két valódi mérésből számoljuk', () => {
  const s = periodSummary([
    { id: 'b1', kind: 'body', date: NOW - 2 * 86400000, weight: 92.1, waist: 102 },
    { id: 'b2', kind: 'body', date: NOW, weight: 91.4, waist: 99 },
  ], { days: 7, now: NOW });
  assert.equal(s.weight.change, -0.7);
  assert.equal(s.waist.change, -3);
  const one = periodSummary([{ id: 'b3', kind: 'body', date: NOW, weight: 90 }], { days: 7, now: NOW });
  assert.equal(one.weight.change, null);
  assert.equal(one.waist, null);
});
