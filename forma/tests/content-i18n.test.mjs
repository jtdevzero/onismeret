/* Angol tartalomréteg: minden azonosítónak van fordítása, a szerkezet és a számok változatlanok. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyContent, applyBlocks } from '../js/core/content-i18n.js';

const json = f => JSON.parse(readFileSync(new URL('../data/' + f, import.meta.url), 'utf8'));
const C = json('content-en.json');

test('minden gyakorlathoz, teszthez, területhez, rutinhoz és blokkhoz van angol szöveg', () => {
  const ex = json('exercises.json'), t = json('tests.json'), r = json('routines.json'), b = json('blocks.json');
  for (const e of ex.exercises) { const c = C.exercises[e.id]; assert.ok(c && c.name && c.how, e.id); assert.equal(c.points.length, e.points.length, e.id); }
  for (const k of Object.keys(ex.typeNames)) assert.ok(C.typeNames[k], k);
  for (const k of Object.keys(ex.ladders)) assert.ok(C.ladders[k], k);
  for (const a of t.areas) assert.ok(C.areas[a.id] && C.areas[a.id].short, a.id);
  for (const x of t.tests) {
    const c = C.tests[x.id]; assert.ok(c && c.name && c.how, x.id);
    if (x.input.options) assert.equal(c.options.length, x.input.options.length, x.id);
    if (x.input.unit && !['cm', 'ms'].includes(x.input.unit)) assert.ok(c.unit, x.id + ' egység');
    if (x.safety) assert.ok(c.safety, x.id + ' biztonsági figyelmeztetés');
  }
  for (const k of ['frequency', 'intensity', 'duration']) assert.equal(C.vitals[k].length, t.vitals[k].length, k);
  for (const x of r.routines) assert.ok(C.routines[x.id], x.id);
  for (const x of b.blocks) assert.ok(C.blocks[x.id], x.id);
  const caps = new Set();
  const walk = o => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if ((k === 'label' || k === 'note') && typeof v === 'string') caps.add(v); else walk(v); } };
  walk(json('figures.json'));
  for (const s of caps) assert.ok(C.captions[s], 'ábrafelirat: ' + s);
});

test('a réteg csak szöveget ír felül: azonosítók, adagok, értékek és szerkezet változatlan', () => {
  const ex = json('exercises.json'), t = json('tests.json'), r = json('routines.json');
  const before = JSON.parse(JSON.stringify({ ex, t, r }));
  applyContent({ exercises: ex, tests: t, routines: r.routines }, C);
  assert.equal(ex.exercises.find(e => e.id === 'squat').name, 'Squat');
  assert.equal(t.tests.find(x => x.id === 'pushup').input.unit, 'reps');
  ex.exercises.forEach((e, i) => { const o = before.ex.exercises[i]; assert.equal(e.id, o.id); assert.deepEqual(e.dose, o.dose); assert.equal(e.ladder, o.ladder); assert.equal(e.level, o.level); assert.equal(e.figure, o.figure); });
  t.tests.forEach((x, i) => { const o = before.t.tests[i]; assert.equal(x.id, o.id); assert.equal(x.kind, o.kind); assert.deepEqual(x.timer, o.timer); if (o.input.options) assert.deepEqual(x.input.options.map(p => p[0]), o.input.options.map(p => p[0])); assert.equal(x.input.min, o.input.min); assert.equal(x.input.max, o.input.max); });
  assert.deepEqual(t.vitals.frequency.map(p => p[0]), before.t.vitals.frequency.map(p => p[0]));
  r.routines.forEach((x, i) => assert.deepEqual(x.blocks, before.r.routines[i].blocks));
  const b = applyBlocks(json('blocks.json'), C);
  assert.equal(b.blocks.find(x => x.id === 'beach').name, 'Core before beach season');
});

test('hiányzó réteg vagy fordítás esetén a magyar marad', () => {
  const ex = json('exercises.json');
  applyContent({ exercises: ex }, null);
  assert.equal(ex.exercises.find(e => e.id === 'squat').name, 'Guggolás');
  applyContent({ exercises: ex }, { exercises: { squat: { name: '' } } });
  assert.equal(ex.exercises.find(e => e.id === 'squat').name, 'Guggolás');
});
