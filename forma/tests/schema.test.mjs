/* U0-003: mentési szerződés, sorozatnapló-séma, naptárbiztos heti határok. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseBackup, BACKUP_VERSION } from '../js/core/backup.js';
import { cleanLog, cleanSet, normalizeWorkout, plannedLog, doneFromLog, mergeDone } from '../js/core/workout-schema.js';
import { LADDERS, ROTATION } from '../js/core/program.js';

const tests = JSON.parse(readFileSync(new URL('../data/tests.json', import.meta.url)));
const exercises = JSON.parse(readFileSync(new URL('../data/exercises.json', import.meta.url)));
const exerciseIds = exercises.exercises.map(e => e.id);
const ctx = { testIds: tests.tests.map(t => t.id), areaIds: tests.areas.map(a => a.id), ladders: LADDERS, sessionKeys: [...new Set(ROTATION)], ratingKeys: ['easy', 'ok', 'hard', 'fail'], cardioTypes: ['walk', 'run'], goalMetrics: ['pushup'], exerciseIds, challengeIds: ['plank', 'squat'] };
const DAY = 86400000, T0 = Date.UTC(2026, 9, 1, 8);

/* Fixture: egy régi (1-es verziójú) export, a régi app mezőivel. */
const legacyWorkout = { id: 'w1', kind: 'workout', date: T0, key: 'strengthA', minutes: 24, steps: 30, partial: false, ratings: { push: 'easy' }, changes: [{ ladder: 'push', from: 1, to: 2, date: T0 }], done: [{ ex: 'push_wall', sets: 3, reps: 36 }], light: true };
const legacyFile = { app: 'forma', version: 1, settings: { accepted: true, profile: { age: 40, sex: 'female' } }, program: { start: T0 - 10 * DAY, levels: { push: 2 }, ratings: { push: ['easy'] }, done: 4, cycleBase: 1, fromAssessment: 'a1' }, items: [legacyWorkout] };

test('régi (1-es) mentés: minden eredeti mező megmarad, nincs kitalált napló', () => {
  const r = parseBackup(JSON.stringify(legacyFile), ctx);
  assert.equal(r.ok, true);
  const w = r.data.items[0];
  assert.deepEqual(w.ratings, { push: 'easy' });
  assert.deepEqual(w.changes, [{ ladder: 'push', from: 1, to: 2, date: T0 }]);
  assert.deepEqual(w.done, [{ ex: 'push_wall', sets: 3, reps: 36 }]);
  assert.equal(w.light, true);
  assert.equal(w.log, undefined);
  assert.equal(w.schemaVersion, undefined);
  assert.equal(r.data.program.cycleBase, 1);
  assert.equal(r.data.program.fromAssessment, 'a1');
  assert.equal(r.data.challenge, null);
});

test('2-es mentés: sorozatnapló, RPE, súlycél, kihívás és blokk oda-vissza veszteség nélkül', () => {
  const log = [{ ex: 'push_wall', sets: [{ reps: 12, rir: 2, done: true }, { reps: 10, done: true }, { reps: 8, done: false }] }];
  const dbEx = exercises.exercises.find(e => e.equipment === 'dumbbell').id;
  const file = { ...legacyFile, version: BACKUP_VERSION,
    program: { ...legacyFile.program, loads: { [dbEx]: 12 }, loadLog: [{ ex: dbEx, from: 10, to: 12, date: T0, source: 'suggestion' }] },
    challenge: { id: 'plank', start: T0 }, block: { id: 'ski', start: T0, done: 3 },
    items: [{ ...legacyWorkout, schemaVersion: 2, log, rpe: 7 }] };
  const r = parseBackup(JSON.stringify(file), ctx);
  assert.equal(r.ok, true);
  const w = r.data.items[0];
  assert.equal(w.schemaVersion, 2);
  assert.equal(w.rpe, 7);
  assert.deepEqual(w.log, log);
  assert.deepEqual(r.data.program.loads, { [dbEx]: 12 });
  assert.equal(r.data.program.loadLog[0].source, 'suggestion');
  assert.deepEqual(r.data.challenge, { id: 'plank', start: T0 });
  assert.deepEqual(r.data.block, { id: 'ski', start: T0, done: 3 });
  /* másodszori kör (export → import) ugyanazt adja */
  const again = parseBackup(JSON.stringify({ ...file, ...r.data, app: 'forma', version: BACKUP_VERSION }), ctx);
  assert.deepEqual(again.data.items, r.data.items);
});

test('ismeretlen, újabb mentésverziót nem tölt vissza veszteségesen', () => {
  const r = parseBackup(JSON.stringify({ ...legacyFile, version: 3 }), ctx);
  assert.equal(r.ok, false);
  assert.match(r.error, /újabb Forma-változat/);
  assert.equal(parseBackup(JSON.stringify({ ...legacyFile, version: '2' }), ctx).ok, false);
});

test('sérült napló és idegen mezők kiszűrése, az edzés maga megmarad', () => {
  const bad = { ...legacyWorkout, id: 'w2', schemaVersion: 2, rpe: 11, log: [{ ex: '<img>', sets: [{ reps: 5 }] }, { ex: 'nincs_ilyen', sets: [{ reps: 5 }] }, { ex: 'push_wall', sets: [{ reps: -1 }, { reps: 'x' }, { reps: Infinity }] }], evil: '<script>' };
  const r = parseBackup(JSON.stringify({ ...legacyFile, version: 2, items: [bad] }), ctx);
  assert.equal(r.ok, true);
  const w = r.data.items[0];
  assert.equal(w.log, undefined);
  assert.equal(w.schemaVersion, undefined);
  assert.equal(w.rpe, undefined);
  assert.equal(w.evil, undefined);
  assert.equal(w.minutes, 24);
});

test('ismeretlen kihívás- vagy blokkazonosító nem kerül vissza', () => {
  const r = parseBackup(JSON.stringify({ ...legacyFile, version: 2, challenge: { id: 'hack', start: T0 }, block: { id: '../x', start: T0 } }), ctx);
  assert.equal(r.data.challenge, null);
  assert.equal(r.data.block, null);
});

test('sorozat: a hiányzó érték nem lesz nulla, a tartományon kívüli elutasítva', () => {
  assert.equal(cleanSet({}), null);
  assert.equal(cleanSet({ reps: '' }), null);
  assert.deepEqual(cleanSet({ reps: 10 }), { reps: 10, done: true });
  assert.deepEqual(cleanSet({ seconds: 30, weightKg: 400, rir: 2.5, done: false }), { seconds: 30, done: false });
  assert.deepEqual(cleanSet({ reps: 8, weightKg: 0, rir: 0 }), { reps: 8, weightKg: 0, rir: 0, done: true });
});

test('olvasóadapter: régi és új rekord egységes nézete, a bemenet változatlan', () => {
  const frozen = Object.freeze({ ...legacyWorkout });
  const n = normalizeWorkout(frozen);
  assert.equal(n.schemaVersion, 1);
  assert.deepEqual(n.log, []);
  assert.equal(n.rpe, null);
  assert.equal(n.light, true);
  const v2 = normalizeWorkout({ ...legacyWorkout, schemaVersion: 2, rpe: 6, log: [{ ex: 'push_wall', sets: [{ reps: 10 }] }] });
  assert.equal(v2.schemaVersion, 2);
  assert.equal(v2.rpe, 6);
  assert.equal(normalizeWorkout({ kind: 'cardio' }), null);
});

test('tervezett napló: csak a fő rész és az első személy, oldalankénti ismétlés duplázva', () => {
  const steps = [
    { type: 'work', part: 'warmup', exercise: 'march', reps: 20 },
    { type: 'work', part: 'main', exercise: 'push_wall', reps: 10, set: 1 },
    { type: 'rest', seconds: 30 },
    { type: 'work', part: 'main', exercise: 'push_wall', reps: 10, set: 2, person: 2 },
    { type: 'work', part: 'main', exercise: 'lunge', reps: 8, side: 'both' },
    { type: 'work', part: 'main', exercise: 'plank', seconds: 30 },
  ];
  assert.deepEqual(plannedLog(steps, steps.length, { lunge: 6 }), [
    { ex: 'push_wall', sets: [{ reps: 10, done: true }] },
    { ex: 'lunge', sets: [{ reps: 16, weightKg: 6, done: true }] },
    { ex: 'plank', sets: [{ seconds: 30, done: true }] },
  ]);
  assert.deepEqual(plannedLog(steps, 2), [{ ex: 'push_wall', sets: [{ reps: 10, done: true }] }]);
});

test('a napló összesítése a régi done formára: csak a teljesített sorozat számít', () => {
  const log = [{ ex: 'push_wall', sets: [{ reps: 12 }, { reps: 10 }, { reps: 9, done: false }] }, { ex: 'plank', sets: [{ seconds: 20, done: false }] }];
  assert.deepEqual(doneFromLog(log), [{ ex: 'push_wall', sets: 2, reps: 22 }]);
  const merged = mergeDone([{ ex: 'march', sets: 1, reps: 20 }, { ex: 'push_wall', sets: 3, reps: 30 }, { ex: 'plank', sets: 1, seconds: 30 }], log);
  assert.deepEqual(merged, [{ ex: 'march', sets: 1, reps: 20 }, { ex: 'push_wall', sets: 2, reps: 22 }]);
});

test('napló tisztítás: ismeretlen gyakorlat és üres sorozat kimarad, a korlátok érvényesek', () => {
  assert.equal(cleanLog('x'), undefined);
  assert.equal(cleanLog([{ ex: 'push_wall', sets: [] }]), undefined);
  const big = [{ ex: 'push_wall', sets: Array.from({ length: 50 }, () => ({ reps: 1 })) }];
  assert.equal(cleanLog(big)[0].sets.length, 20);
  assert.deepEqual(cleanLog([{ ex: 'zz_unknown', sets: [{ reps: 1 }] }], exerciseIds), undefined);
});

test('napi ellenőrzés: érvényes bejegyzés visszatöltődik, hibás kimarad', () => {
  const good = { id: 'check-2026-11-18', kind: 'check', date: T0, sleep: 2, soreness: 3, energy: 1, pain: false, level: 'light' };
  const r = parseBackup(JSON.stringify({ ...legacyFile, version: 2, items: [good, { ...good, id: 'x', sleep: 9 }, { ...good, id: 'check-2026-11-19', sleep: 7, soreness: 0, energy: 'a' }] }), ctx);
  assert.deepEqual(r.data.items.filter(i => i.kind === 'check'), [good]);
});

test('tervezett napló: az edzés közben rögzített tényleges érték felülírja a tervet', () => {
  const steps = [
    { type: 'work', part: 'main', exercise: 'push_wall', reps: 10, actualReps: 7 },
    { type: 'work', part: 'main', exercise: 'lunge', reps: 8, side: 'both', actualReps: 6 },
    { type: 'work', part: 'main', exercise: 'plank', seconds: 30, actualSeconds: 22 },
    { type: 'work', part: 'main', exercise: 'plank', seconds: 30, actualSeconds: 0 },
  ];
  assert.deepEqual(plannedLog(steps), [
    { ex: 'push_wall', sets: [{ reps: 7, done: true }] },
    { ex: 'lunge', sets: [{ reps: 12, done: true }] },
    { ex: 'plank', sets: [{ seconds: 22, done: true }, { seconds: 0, done: true }] },
  ]);
});

test('mentésfájl: az egyéni sorrend átmegy, az érvénytelen kimarad', () => {
  const rot = ['strengthA', 'mobility', 'speedA', 'strengthB', 'speedB', 'strengthC', 'mobility'];
  const ok = parseBackup(JSON.stringify({ ...legacyFile, version: 2, program: { ...legacyFile.program, rotation: rot } }), ctx);
  assert.deepEqual(ok.data.program.rotation, rot);
  const bad = parseBackup(JSON.stringify({ ...legacyFile, version: 2, program: { ...legacyFile.program, rotation: ['strengthA', 'strengthA', 'speedA', 'strengthB', 'speedB', 'strengthC', 'mobility'] } }), ctx);
  assert.equal(bad.data.program.rotation, undefined);
});
