import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resumableHomeDraft } from '../js/core/home-action.js';

const draft = () => ({ version: 1, key: 'strengthA', workoutId: 'workout-home-1', started: Date.now() - 1000,
  at: 1, steps: [{ exercise: 'push_wall', reps: 10 }, { type: 'rest', seconds: 30 }, { exercise: 'push_wall', reps: 10 }], ratings: {}, partner: false });

test('a kezdőlap a valóban félbehagyott edzést ajánlja elsőként', () => {
  assert.deepEqual(resumableHomeDraft(draft(), []), { key: 'strengthA', href: '#/session/strengthA', at: 2, total: 3 });
});

test('véglegesített, sérült és ismeretlen checkpoint nem válik kezdőlapi folytatássá', () => {
  const d = draft();
  assert.equal(resumableHomeDraft(d, [{ kind: 'workout', id: d.workoutId }]), null);
  assert.equal(resumableHomeDraft({ ...d, at: 50 }, []), null);
  assert.equal(resumableHomeDraft({ ...d, key: 'unknown-session' }, []), null);
});
