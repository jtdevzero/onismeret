import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describeAnatomyMesh, searchAnatomyNames } from '../js/core/anatomy-inspector.js';

test('ismert anatómiai forrásnevekhez részleges magyar megnevezést rendel, oldalisággal', () => {
  const pec = describeAnatomyMesh('Abdominal part of left pectoralis major');
  assert.equal(pec.hungarianName, 'Bal nagy mellizom');
  assert.equal(pec.side, 'bal');
  const leg = describeAnatomyMesh('Lateral head of right gastrocnemius');
  assert.equal(leg.hungarianName, 'Jobb kétfejű lábikraizom');
  const bone = describeAnatomyMesh('Left femur', 'bones');
  assert.equal(bone.hungarianName, 'Bal combcsont');
  assert.equal(bone.layer, 'bones');
});

test('az ismeretlen szövetnév nem kap kitalált fordítást vagy hamis ellenőrzési státuszt', () => {
  const unknown = describeAnatomyMesh('Left structure not in the glossary');
  assert.equal(unknown.hungarianName, null);
  assert.equal(unknown.sourceName, 'Left structure not in the glossary');
  assert.equal(unknown.reviewedName, false);
  assert.equal(unknown.status, 'illustrative');
  assert.equal(describeAnatomyMesh(null).sourceName, 'Névtelen elem');
});

test('a tényleges Écorché modellben szerepelnek az ellenőrzött névazonosítási tesztpéldák', () => {
  const buffer = readFileSync(new URL('../assets/models/ecorche.meshopt.glb',import.meta.url));
  const doc = JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12)).toString('utf8'));
  const names = new Set(doc.nodes.map(node=>node.name));
  assert.ok(names.has('Abdominal part of left pectoralis major'));
  assert.ok(names.has('Lateral head of right gastrocnemius'));
});

test('a 3D kijelölés a magyar információs panelhez továbbítja a forrásazonosítót', () => {
  const view = readFileSync(new URL('../js/ui/views-body-lab.js',import.meta.url),'utf8');
  const renderer = readFileSync(new URL('../js/ui/three-body.js',import.meta.url),'utf8');
  assert.match(renderer, /describeAnatomyMesh\(name,layerGroup\)/);
  assert.match(view, /viewer\.showMesh\(info\)/);
  assert.match(view, /info\.hungarianName/);
  assert.match(view, /info\.sourceName/);
  assert.match(view, /viewer\.enableSearch\(ready\)/);
  assert.match(renderer, /highlight\(object\)/);
  assert.match(renderer, /clearHighlight\(\);disposeAnatomyModel\(imported\)/);
  assert.match(renderer, /container\.dataset\.webgl='unavailable'/);
});

test('az anatómiai keresés ékezetfüggetlen, helyi és találatszámban korlátozott', () => {
  const records = [
    {...describeAnatomyMesh('Left femur','bones'),id:0},
    {...describeAnatomyMesh('Right femur','bones'),id:1},
    {...describeAnatomyMesh('Left gastrocnemius'),id:2},
  ];
  assert.deepEqual(searchAnatomyNames(records,'combcsont').map(x=>x.id),[0,1]);
  assert.deepEqual(searchAnatomyNames(records,'FÉMUR').map(x=>x.id),[0,1]);
  assert.deepEqual(searchAnatomyNames(records,'femur',1).map(x=>x.id),[0]);
  assert.deepEqual(searchAnatomyNames(records,'f'),[]);
  assert.deepEqual(searchAnatomyNames(records,'femur',100).map(x=>x.id),[0,1]);
  assert.deepEqual(searchAnatomyNames(null,'femur'),[]);
});
