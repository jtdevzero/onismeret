/* U1-107/108: terhelés és jóváhagyandó súlyjavaslat. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateSetVolume, calculateExerciseVolume, summarizeWorkout, aggregateWeeklyLoad, buildLoadTrend } from '../js/core/load.js';
import { suggestProgression, applyLoadChange, stepFor } from '../js/core/progression.js';

const DAY = 86400000, NOW = new Date(2026, 10, 18, 12).getTime();
const W = (id, daysAgo, log, extra = {}) => ({ id, kind: 'workout', date: NOW - daysAgo * DAY, key: 'strengthA', minutes: 30, ratings: {}, changes: [], done: [], schemaVersion: 2, log, ...extra });
const row = { id: 'db_row', ladder: 'pull_db', equipment: 'dumbbell' };
const sets = (kg, rir, done = [true, true, true]) => done.map((d, i) => ({ reps: 10, weightKg: kg, done: d, ...(i === done.length - 1 && rir != null ? { rir } : {}) }));

test('testsúlyos sorozat: nincs kitalált kilogrammos volumen', () => {
  assert.deepEqual(calculateSetVolume({ reps: 12, done: true }), { reps: 12, seconds: 0, externalKgReps: null });
  assert.deepEqual(calculateSetVolume({ reps: 12, weightKg: 0 }), { reps: 12, seconds: 0, externalKgReps: null });
  assert.deepEqual(calculateSetVolume({ reps: 10, weightKg: 8 }), { reps: 10, seconds: 0, externalKgReps: 80 });
  assert.deepEqual(calculateSetVolume({ seconds: 30, weightKg: 8 }), { reps: 0, seconds: 30, externalKgReps: null });
  assert.deepEqual(calculateSetVolume({ reps: 10, weightKg: 8, done: false }), { reps: 0, seconds: 0, externalKgReps: null });
});

test('gyakorlat és edzés összesítése: csak a teljesített sorozat, külön egységek', () => {
  assert.deepEqual(calculateExerciseVolume({ sets: [{ reps: 10, weightKg: 8 }, { reps: 8 }, { reps: 6, weightKg: 8, done: false }] }), { sets: 2, reps: 18, seconds: 0, externalKgReps: 80 });
  const s = summarizeWorkout(W('a', 0, [{ ex: 'db_row', sets: [{ reps: 10, weightKg: 8 }] }, { ex: 'plank', sets: [{ seconds: 40 }] }], { rpe: 6 }));
  assert.equal(s.source, 'log');
  assert.deepEqual([s.sets, s.reps, s.seconds, s.externalKgReps, s.sessionLoad], [2, 10, 40, 80, 180]);
  const legacy = summarizeWorkout({ id: 'b', kind: 'workout', date: NOW, minutes: 20, done: [{ ex: 'push_wall', sets: 3, reps: 30 }] });
  assert.equal(legacy.source, 'plan');
  assert.equal(legacy.externalKgReps, null);
  assert.equal(legacy.sessionLoad, null, 'RPE nélkül nincs szubjektív terhelés');
});

test('heti összesítés: hiányzó adat null, nem nulla; deduplikáció azonosítóval; a bemenet változatlan', () => {
  const items = Object.freeze([W('a', 0, [{ ex: 'db_row', sets: [{ reps: 10, weightKg: 8 }] }], { rpe: 5 }), W('a', 0, [{ ex: 'db_row', sets: [{ reps: 10, weightKg: 8 }] }]), W('c', 8, [{ ex: 'push_wall', sets: [{ reps: 10 }] }]), { id: 'k', kind: 'cardio', date: NOW, minutes: 25 }]);
  const wk = aggregateWeeklyLoad(items, { weeks: 3, now: NOW });
  assert.equal(wk.length, 3);
  const [w0, w1, w2] = wk;
  assert.equal(w0.workouts, 0); assert.equal(w0.externalKgReps, null); assert.equal(w0.sessionLoad, null);
  assert.equal(w1.workouts, 1); assert.equal(w1.externalKgReps, null, 'csak testsúlyos hét');
  assert.equal(w2.workouts, 1, 'azonos azonosító egyszer számít');
  assert.equal(w2.externalKgReps, 80); assert.equal(w2.sessionLoad, 150); assert.equal(w2.cardioMinutes, 25);
  assert.ok(w2.start < NOW && NOW < w2.end);
});

test('trend: kevés előzménynél nincs, különben arány az átlaghoz', () => {
  assert.equal(buildLoadTrend([{ sets: 10 }, { sets: 12 }], 'sets'), null);
  assert.deepEqual(buildLoadTrend([{ sets: 10 }, { sets: 0 }, { sets: 10 }, { sets: 15 }], 'sets'), { last: 15, avg: 10, ratio: 1.5, weeks: 2 });
});

test('súlyjavaslat: nincs adat → insufficient_data, nincs változtatás', () => {
  const r = suggestProgression({ exercise: row, workouts: [] });
  assert.equal(r.action, 'insufficient_data');
  assert.equal(r.proposedChange, null);
  assert.equal(r.requiresApproval, true);
  assert.equal(suggestProgression({ exercise: { id: 'push_wall', ladder: 'push' } }).action, 'insufficient_data');
});

test('súlyjavaslat: két tartalékos, teljes edzés → emelés egy lépcsővel; RIR nélkül nincs emelés', () => {
  const two = [W('a', 4, [{ ex: 'db_row', sets: sets(8, 3) }]), W('b', 1, [{ ex: 'db_row', sets: sets(8, 4) }])];
  const r = suggestProgression({ exercise: row, workouts: two, currentKg: 8 });
  assert.equal(r.action, 'increase');
  assert.deepEqual(r.proposedChange, { ex: 'db_row', from: 8, to: 9 });
  assert.equal(r.evidence.length, 2);
  const noRir = [W('a', 4, [{ ex: 'db_row', sets: sets(8, null) }]), W('b', 1, [{ ex: 'db_row', sets: sets(8, null) }])];
  const m = suggestProgression({ exercise: row, workouts: noRir, currentKg: 8 });
  assert.equal(m.action, 'maintain');
  assert.match(m.reasons[0], /RIR nélkül/);
  assert.equal(m.proposedChange, null);
});

test('súlyjavaslat: sikertelen sorozatok → könnyítés; panasz → needs_review, emelés nélkül', () => {
  const bad = [W('b', 1, [{ ex: 'db_row', sets: sets(12, 0, [true, false, false]) }])];
  const d = suggestProgression({ exercise: row, workouts: bad, currentKg: 12 });
  assert.equal(d.action, 'decrease');
  assert.deepEqual(d.proposedChange, { ex: 'db_row', from: 12, to: 10 });
  const two = [W('a', 4, [{ ex: 'db_row', sets: sets(8, 3) }]), W('b', 1, [{ ex: 'db_row', sets: sets(8, 4) }])];
  const n = suggestProgression({ exercise: row, workouts: two, currentKg: 8, complaints: ['shoulder'] });
  assert.equal(n.action, 'needs_review');
  assert.equal(n.proposedChange, null);
});

test('súlyjavaslat: más gyakorlat adata nem számít (nincs hamis progresszió változatok között)', () => {
  const other = [W('a', 4, [{ ex: 'db_row_bent', sets: sets(8, 3) }]), W('b', 1, [{ ex: 'db_row_bent', sets: sets(8, 4) }])];
  assert.equal(suggestProgression({ exercise: row, workouts: other, currentKg: 8 }).action, 'insufficient_data');
});

test('jóváhagyás nélkül a program változatlan; az alkalmazás idempotens és naplózott', () => {
  const prog = Object.freeze({ start: 1, levels: { push: 1 }, loads: Object.freeze({ db_row: 8 }) });
  const two = [W('a', 4, [{ ex: 'db_row', sets: sets(8, 3) }]), W('b', 1, [{ ex: 'db_row', sets: sets(8, 4) }])];
  const sug = suggestProgression({ exercise: row, workouts: two, currentKg: prog.loads.db_row });
  assert.deepEqual(prog.loads, { db_row: 8 });
  const once = applyLoadChange(prog, sug.proposedChange, { now: 5 });
  assert.deepEqual(once.loads, { db_row: 9 });
  assert.deepEqual(once.loadLog, [{ ex: 'db_row', from: 8, to: 9, date: 5, source: 'suggestion' }]);
  assert.equal(once.levels, prog.levels, 'más mező érintetlen');
  const twice = applyLoadChange(once, sug.proposedChange, { now: 6 });
  assert.equal(twice, once, 'ugyanaz a jóváhagyás kétszer nem ír újra');
  assert.equal(applyLoadChange(prog, { ex: '<x>', to: 5 }), prog);
  assert.equal(applyLoadChange(prog, { ex: 'db_row', to: 999 }), prog);
});

test('lépcső: könnyű súlynál 1 kg, egyébként 2 kg', () => {
  assert.equal(stepFor(6), 1);
  assert.equal(stepFor(16), 2);
});
