import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mergeCatalog, relatedExercises, catalogMuscles, exerciseAreas, anatomyMatches } from '../js/core/exercise-catalog.js';

const read = file => JSON.parse(readFileSync(new URL('../data/' + file, import.meta.url), 'utf8'));

test('új gyakorlatok egyediek és nem módosítják az eredeti programlétrákat', () => {
  const base = read('exercises.json');
  const extra = read('exercise-catalog-extra.json');
  assert.equal(base.reviewed, true);
  assert.equal(extra.reviewStatus, 'editorial-draft');
  const merged = mergeCatalog(base.exercises, extra.exercises);
  assert.equal(merged.length, base.exercises.length + extra.exercises.length);
  assert.ok(extra.exercises.length >= 25);
  assert.deepEqual(merged.slice(0, base.exercises.length), base.exercises);
  assert.ok(extra.exercises.every(e => !e.ladder), 'új elem nem módosíthat szintlépcsőt');
  for (const e of extra.exercises) {
    assert.ok(e.id && e.name && e.how.length >= 60, e.id);
    assert.ok(base.typeNames[e.type], e.id);
    assert.ok(Array.isArray(e.points) && e.points.length === 3, e.id);
    assert.ok(e.dose?.reps?.length === 2 || e.dose?.seconds?.length === 2, e.id);
    assert.ok(Array.isArray(e.muscles) && e.muscles.length, e.id);
  }
});

test('duplikáció, sérült bejegyzés és hiányzó offline kiegészítés biztonságosan kimarad', () => {
  const base = [{ id: 'old', name: 'Régi', how: 'Leírás', points: ['a', 'b', 'c'], dose: { reps: [1, 2] } }];
  assert.deepEqual(mergeCatalog(base, null), base);
  assert.deepEqual(mergeCatalog(base, [{ ...base[0], name: 'Felülírni tilos' }, { id: 'bad' }, { ...base[0], id: 'with-ladder', ladder: 'push' }]), base);
});

test('hasonló gyakorlatok csak átfedő izomcsoportból javasolhatók és nem tartalmazzák önmagukat', () => {
  const all = mergeCatalog(read('exercises.json').exercises, read('exercise-catalog-extra.json').exercises);
  const ex = all.find(e => e.id === 'biceps_curl');
  const related = relatedExercises(ex, all);
  assert.ok(related.length > 0);
  assert.ok(related.every(e => e.id !== ex.id && e.muscles.some(m => ex.muscles.includes(m))));
  assert.ok(catalogMuscles(all).includes('bicepsz'));
  assert.deepEqual(relatedExercises(null, all), []);
});

test('az izomtérkép az új és a régi létrás gyakorlatokat is megtalálja, nem ír át adatot', () => {
  const base = read('exercises.json').exercises;
  const catalog = mergeCatalog(base, read('exercise-catalog-extra.json').exercises);
  assert.deepEqual(exerciseAreas(base.find(e => e.id === 'push_full')), ['mell']);
  assert.ok(anatomyMatches(catalog, 'chest').some(e => e.id === 'push_full'));
  assert.ok(anatomyMatches(catalog, 'shoulders').some(e => e.id === 'shoulder_lateral_raise'));
  assert.ok(anatomyMatches(catalog, 'back').some(e => e.id === 'db_row'));
  assert.deepEqual(anatomyMatches(catalog, 'unknown'), []);
  assert.equal(base.find(e => e.id === 'push_full').muscles, undefined);
});
