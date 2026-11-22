import { test } from 'node:test';
import assert from 'node:assert/strict';
import { remaining, validSession } from '../js/core/session.js';

test('időzítő késő callbacknél is a tényleges időből számol, nem megy negatívba', () => {
  assert.equal(remaining(30000, 0), 30);
  assert.equal(remaining(30000, 10250), 20);
  assert.equal(remaining(30000, 30000), 0);
  assert.equal(remaining(30000, 40000), 0);
  assert.equal(remaining(300, 105, 10), 20);
});
test('folytatás: hibás lépés és sérült tárolt állás nem indítható el', () => {
  const d = { version: 1, id: 'a', route: 'strengthA', session: { blocks: [], week: {}, complaints: [] }, steps: [{ exercise: 'squat', reps: 8 }], at: 0, left: 0, elapsed: 100 };
  assert.equal(validSession(d, { squat: {} }), true);
  for (const patch of [{ at: -1 }, { at: 1 }, { left: NaN }, { left: -5 }, { elapsed: Infinity }, { steps: [{ exercise: 'unknown' }] }, { steps: [] }]) assert.equal(validSession({ ...d, ...patch }, { squat: {} }), false);
});
