import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => JSON.parse(readFileSync(new URL('../data/' + file, import.meta.url), 'utf8'));

test('a kiegészítő gyakorlati útmutató érvényes, az eredeti gyakorlatokhoz kötődik', () => {
  const source = read('exercises.json');
  const extra = read('exercise-guidance.json');
  const ids = new Set(source.exercises.map(e => e.id));
  assert.equal(extra.schemaVersion, 1);
  assert.equal(extra.reviewStatus, 'editorial-draft');
  assert.equal(source.reviewed, true, 'a korábbi belső felülvizsgálat megmarad');
  assert.ok(Object.keys(extra.guidance).length >= 12);
  for (const [id, g] of Object.entries(extra.guidance)) {
    assert.ok(ids.has(id), `hiányzó gyakorlat: ${id}`);
    for (const field of ['setup', 'easier', 'harder', 'safety']) assert.ok(typeof g[field] === 'string' && g[field].length >= 20, `${id}.${field}`);
    assert.ok(Array.isArray(g.mistakes) && g.mistakes.length >= 2 && g.mistakes.every(x => typeof x === 'string' && x.length >= 15), `${id}.mistakes`);
  }
});

test('az eredeti leírás minden gyakorlathoz rendelkezésre áll akkor is, ha a kiegészítő fájl nem töltődik be', () => {
  for (const ex of read('exercises.json').exercises) {
    assert.ok(ex.how?.trim() && ex.points?.length === 3, ex.id);
  }
});
