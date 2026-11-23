import { test } from 'node:test';
import assert from 'node:assert/strict';
import { previousExercisePerformance } from '../js/core/workout-previous.js';

test('előző teljesítmény: legfrissebb mentett edzés és deduplikáció', () => {
  const data = [
    { id: 'old', kind: 'workout', date: 100, done: [{ ex: 'push_wall', sets: 2, reps: 20 }] },
    { id: 'new', kind: 'workout', date: 200, done: [{ ex: 'push_wall', sets: 3, reps: 30 }] },
    { id: 'new', kind: 'workout', date: 200, done: [{ ex: 'push_wall', sets: 6, reps: 60 }] },
    { id: 'future', kind: 'workout', date: 500, done: [{ ex: 'push_wall', sets: 5 }] },
  ];
  assert.deepEqual(previousExercisePerformance(data, 300).get('push_wall'), { date: 200, sets: 3, reps: 30, seconds: null });
});

test('hiányzó és sérült gyakorlatnapló nem lesz kitalált előző teljesítmény', () => {
  const data = [{ id: 'x', kind: 'workout', date: 100, done: [{ ex: 'bad', sets: null }] },
    { id: 'y', kind: 'assessment', date: 120, done: [{ ex: 'push_wall', sets: 9 }] }];
  assert.equal(previousExercisePerformance(data, 200).size, 0);
});
