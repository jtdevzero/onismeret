import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOME_CARDS, normalizeHomeCards, normalizeHiddenHomeCards, moveHomeCard } from '../js/core/home-layout.js';
import { parseBackup } from '../js/core/backup.js';

test('kezdőlapi sorrend: ismert elemek, deduplikáció és alapértékek', () => {
  const original = ['quick', 'quick', 'unknown', 'last'];
  assert.deepEqual(normalizeHomeCards(original), ['quick', 'last', 'weekly', 'goals']);
  assert.deepEqual(original, ['quick', 'quick', 'unknown', 'last']);
  assert.deepEqual(normalizeHomeCards(null), HOME_CARDS);
  assert.deepEqual(normalizeHiddenHomeCards(['quick', 'unknown', 'quick']), ['quick']);
});

test('a sorrendváltoztatás csak érvényes, szomszédos csere', () => {
  const original = [...HOME_CARDS];
  assert.deepEqual(moveHomeCard(original, 'last', -1), ['last', 'weekly', 'quick', 'goals']);
  assert.deepEqual(moveHomeCard(original, 'weekly', -1), original);
  assert.deepEqual(moveHomeCard(original, 'missing', 1), original);
  assert.deepEqual(original, HOME_CARDS);
});

test('mentésfájl megőrzi az OLED/kompakt kártyákat és tisztítja az idegen azonosítókat', () => {
  const file = { app: 'forma', version: 3, items: [], settings: {
    theme: 'oled', density: 'compact', homeCards: ['quick', 'bad', 'weekly'], hiddenHomeCards: ['last', 'bad'],
  } };
  const result = parseBackup(JSON.stringify(file), { ladders: [], ratingKeys: [], sessionKeys: [], testIds: [], areaIds: [], exerciseIds: [], cardioTypes: [], goalMetrics: [] });
  assert.equal(result.ok, true);
  assert.equal(result.data.settings.theme, 'oled');
  assert.equal(result.data.settings.density, 'compact');
  assert.deepEqual(result.data.settings.homeCards, ['quick', 'weekly', 'last', 'goals']);
  assert.deepEqual(result.data.settings.hiddenHomeCards, ['last']);
});
