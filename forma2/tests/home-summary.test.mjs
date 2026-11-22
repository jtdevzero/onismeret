import { test } from 'node:test';
import assert from 'node:assert/strict';
import { latestWorkoutSummary } from '../js/core/home-summary.js';

test('a legutóbbi valóban mentett edzés jelenik meg, nem a sérült/jövőbeli adat', () => {
  const now = 1_800_000_000_000;
  const items = [
    { id: 'bad', kind: 'workout', date: now + 1, title: 'jövő' },
    { id: 'cardio', kind: 'cardio', date: now - 1, title: 'kardió' },
    { id: 'one', kind: 'workout', date: now - 200, title: 'Régebbi', minutes: 30 },
    { id: 'two', kind: 'workout', date: now - 100, title: 'Legutóbbi', minutes: 22, partial: true },
  ];
  const original = structuredClone(items);
  assert.deepEqual(latestWorkoutSummary(items, now), { title: 'Legutóbbi', date: now - 100, minutes: 22, partial: true });
  assert.deepEqual(items, original);
});

test('az üres és hibás adatokból nem készül hamis edzéskártya', () => {
  assert.equal(latestWorkoutSummary(null), null);
  assert.equal(latestWorkoutSummary([{ kind: 'workout', date: Date.now() }]), null);
  assert.equal(latestWorkoutSummary([{ id: 'a', kind: 'workout', date: -1 }]), null);
});

test('érvénytelen idő és cím tisztítása', () => {
  const now = 1_800_000_000_000;
  assert.deepEqual(latestWorkoutSummary([{ id: 'x', kind: 'workout', date: now, title: null, minutes: -20 }], now),
    { title: '', date: now, minutes: null, partial: false });
});
