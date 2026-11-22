/* U1-113: felméréses megosztókártya: alapból nincs személyes adat. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAssessmentShare, SHARE_DEFAULTS } from '../js/core/share.js';

const item = { id: 'a', date: new Date(2026, 10, 18, 9).getTime(), profile: { age: 41, sex: 'female' } };
const ev = { overall: 62.4, fitnessAge: 35, areas: { mobility: { score: 70 }, strength: { score: 55.6 }, balance: { score: null } } };
const areas = [{ id: 'mobility', short: 'Mobilitás' }, { id: 'strength', short: 'Erő' }, { id: 'balance', short: 'Egyensúly' }, { id: 'speed', short: 'Gyorsaság' }];

test('alapértelmezés: kor, nem, fittségi kor és pontos nap nélkül', () => {
  const s = buildAssessmentShare(item, ev, areas);
  const text = JSON.stringify(s);
  assert.doesNotMatch(text, /41|nő|Fittségi kor|18\./);
  assert.equal(s.when, '2026. november');
  assert.deepEqual(s.axes, [{ label: 'Mobilitás', value: 70 }, { label: 'Erő', value: 56 }], 'hiányzó terület kimarad, nem nulla');
  assert.match(s.lines[0], /nem percentilis/);
  assert.deepEqual(SHARE_DEFAULTS, { age: false, fitnessAge: false, exactDate: false });
});

test('kifejezett bekapcsolásra jelennek meg a személyes adatok', () => {
  const s = buildAssessmentShare(item, ev, areas, { age: true, fitnessAge: true, exactDate: true });
  assert.ok(s.lines.includes('41 éves nő'));
  assert.ok(s.lines.some(l => /Fittségi kor: 35 év/.test(l)));
  assert.equal(s.when, '2026. november 18.');
});

test('nincs fejlődési különbség a kártyán', () => {
  assert.doesNotMatch(JSON.stringify(buildAssessmentShare(item, ev, areas, { age: true, fitnessAge: true })), /[+−-]\d+ pont|változás/);
});
