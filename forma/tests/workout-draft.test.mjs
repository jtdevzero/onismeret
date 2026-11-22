import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validDraft, DRAFT_VERSION } from '../js/core/workout-draft.js';

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
