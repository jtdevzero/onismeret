import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validDraft, backupDraft, DRAFT_VERSION } from '../js/core/workout-draft.js';
import { parseBackup, BACKUP_VERSION } from '../js/core/backup.js';

const draft = () => ({ version: DRAFT_VERSION, key: 'strengthA', workoutId: 'workout-123', started: Date.now() - 1000,
  at: 1, steps: [{ exercise: 'pushup', reps: 8 }, { type: 'rest', seconds: 30 }], ratings: {}, partner: false });

test('azonos edzés checkpointja folytatható', () => assert.equal(validDraft(draft(), 'strengthA', 2), true));
test('másik edzés és eltérő terv nem tölthető vissza', () => {
  assert.equal(validDraft(draft(), 'strengthB', 2), false);
  assert.equal(validDraft(draft(), 'strengthA', 3), false);
});
test('sérült és jövőbeli checkpoint elutasítva', () => {
  for (const bad of [{ at: 2 }, { steps: null }, { started: Date.now() + 86400000 }, { ratings: [] }, { workoutId: '' }, { version: 99 }])
    assert.equal(validDraft({ ...draft(), ...bad }, 'strengthA', 2), false);
});

test('v3 fájlmentés megőrzi a félbehagyott edzés lépéseit, a v2 továbbra is olvasható', () => {
  const d = draft(); d.steps[0].actualReps = 9;
  const ctx = { ladders: [], ratingKeys: [], sessionKeys: ['strengthA'], exerciseIds: ['pushup'], testIds: [] };
  const file = { app: 'forma', version: BACKUP_VERSION, items: [], workoutDraft: d };
  const parsed = parseBackup(JSON.stringify(file), ctx);
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.data.workoutDraft, backupDraft(d));
  assert.equal(parsed.data.workoutDraft.steps[0].actualReps, 9);
  assert.equal(parseBackup(JSON.stringify({ ...file, version: 2 }), ctx).data.workoutDraft, null);
});

test('sorozatonkénti súly és RIR checkpoint export/import után is megmarad', () => {
  const d = draft(); d.steps[0].weightKg = 12.5; d.steps[0].rir = 2;
  const ctx = { ladders: [], ratingKeys: [], sessionKeys: ['strengthA'], exerciseIds: ['pushup'], testIds: [] };
  const parsed = parseBackup(JSON.stringify({ app: 'forma', version: BACKUP_VERSION, items: [], workoutDraft: d }), ctx);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.data.workoutDraft.steps[0].weightKg, 12.5);
  assert.equal(parsed.data.workoutDraft.steps[0].rir, 2);
  for (const bad of [{ weightKg: -1 }, { weightKg: 301 }, { rir: 1.5 }, { rir: 11 }]) {
    assert.equal(backupDraft({ ...d, steps: [{ ...d.steps[0], ...bad }, d.steps[1]] }), null);
  }
});

test('sérült v3 checkpointnál az egész import elutasított, idegen mezők nem kerülnek át', () => {
  const ctx = { ladders: [], ratingKeys: [], sessionKeys: ['strengthA'], exerciseIds: ['pushup'], testIds: [] };
  for (const bad of [{ ...draft(), at: 99 }, { ...draft(), steps: [{ exercise: 'pushup', reps: -8 }] },
    { ...draft(), steps: [{ exercise: 'pushup', unknown: '<script>' }] }]) {
    const parsed = parseBackup(JSON.stringify({ app: 'forma', version: BACKUP_VERSION, items: [], workoutDraft: bad }), ctx);
    assert.equal(parsed.ok, false);
  }
});
