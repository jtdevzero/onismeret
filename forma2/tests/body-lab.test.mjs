import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BODY_LAB, BODY_LAB_VERSION, bodyLabItems, bodyLabItem } from '../js/core/body-lab.js';

test('BODY LAB atlasz: verzió, rétegek, egyedi adatlapok és kapcsolódó gyakorlatok', () => {
  const base = JSON.parse(readFileSync(new URL('../data/exercises.json', import.meta.url)));
  const extra = JSON.parse(readFileSync(new URL('../data/exercise-catalog-extra.json', import.meta.url)));
  const ids = new Set([...base.exercises, ...extra.exercises].map(e => e.id));
  assert.equal(BODY_LAB_VERSION, 1);
  for (const layer of ['joints', 'bones', 'connective', 'movements']) {
    const entries = bodyLabItems(layer);
    assert.ok(entries.length >= 4);
    assert.equal(new Set(entries.map(e => e.id)).size, entries.length);
    for (const entry of entries) {
      assert.ok(entry.name && entry.what.length >= 30, `${layer}/${entry.id}`);
      assert.ok(Array.isArray(entry.zone) && entry.zone.every(n => Number.isFinite(n) && n >= 0 && n <= 300), entry.id);
      assert.deepEqual(bodyLabItem(layer, entry.id), entry);
      for (const ex of entry.exercises || []) assert.ok(ids.has(ex), `${entry.id}: ${ex}`);
    }
  }
  assert.deepEqual(bodyLabItems('unknown'), []);
  assert.equal(bodyLabItem('joints', 'unknown'), null);
});
