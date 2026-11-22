import { test } from 'node:test';
import assert from 'node:assert/strict';
import { moveCustomExercise, selectedCustomBlocks } from '../js/core/custom-order.js';

test('saját edzés sorrendje kézzel módosítható, a bemenet változatlan', () => {
  const original = ['a', 'b', 'c'];
  const moved = moveCustomExercise(original, 'b', -1);
  assert.deepEqual(moved, ['b', 'a', 'c']);
  assert.deepEqual(original, ['a', 'b', 'c']);
  assert.deepEqual(moveCustomExercise(moved, 'c', 1), moved);
  assert.deepEqual(moveCustomExercise(moved, 'unknown', -1), moved);
});

test('mentett blokklista a választott sorrendet követi, duplikált és nem jelölt gyakorlatot kizár', () => {
  const selected = new Map([['a', { sets: 2, dose: { reps: 12 } }], ['b', { sets: 9, dose: { seconds: 30 } }]]);
  assert.deepEqual(selectedCustomBlocks(['b', 'x', 'a', 'b'], selected), [
    ['b', 6, { seconds: 30 }], ['a', 2, { reps: 12 }],
  ]);
});
