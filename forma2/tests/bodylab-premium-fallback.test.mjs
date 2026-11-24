import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BODYLAB_MUSCLE_NAMES, BODYLAB_MUSCLE_REGIONS, bodylabRegionsForView } from '../js/core/bodylab-silhouette.js';

test('a prémium 2D atlasz elülső és hátulsó izomrégiói külön megjeleníthetők',()=>{
  const front=bodylabRegionsForView('front');
  const back=bodylabRegionsForView('back');
  assert.equal(front.length,5);
  assert.equal(back.length,5);
  assert.ok(front.some(([id])=>id==='chest'));
  assert.ok(front.some(([id])=>id==='core'));
  assert.ok(back.some(([id])=>id==='back'));
  assert.ok(back.some(([id])=>id==='glutes'));
  assert.equal(bodylabRegionsForView('invalid'),front);
  for(const regions of [front,back]){
    assert.equal(new Set(regions.map(([id])=>id)).size,regions.length);
    for(const [id,path] of regions){assert.ok(id);assert.match(path,/^M\s+\d+/);}
  }
  assert.equal(Object.keys(BODYLAB_MUSCLE_REGIONS).length,2);
  assert.equal(Object.keys(BODYLAB_MUSCLE_NAMES).length,7);
  for(const [id] of [...front,...back])assert.ok(BODYLAB_MUSCLE_NAMES[id]);
});

test('az izomtérkép és a 2D vésznézet ugyanabból a helyi régióforrásból dolgozik',()=>{
  const map=readFileSync(new URL('../js/ui/muscle-map.js',import.meta.url),'utf8');
  const body=readFileSync(new URL('../js/ui/views-body-lab.js',import.meta.url),'utf8');
  assert.match(map,/bodylabRegionsForView\(view\)/);
  assert.match(body,/bodylabRegionsForView\(view\)/);
  assert.match(body,/viewer\.selectRegion=id=>\{\s*fallbackSelected=id;/);
  assert.match(body,/else syncFallbackSelection\(\)/);
  assert.match(body,/viewer\?\.selectRegion\(area\)/);
  assert.match(body,/fallbackSide=side;paintFallback\(\)/);
  assert.match(body,/region\.classList\.toggle\('selected',active\)/);
  assert.match(body,/'aria-pressed':String\(fallbackSide===side\)/);
  assert.match(body,/quick\.querySelectorAll\('button'\)/);
  assert.match(body,/onclick:\(\)=>map\.selectArea\(id\)/);
});

test('a WebGL-től független kapcsolók mobilon használhatók és csökkentett mozgással is stabilak',()=>{
  const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
  const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
  assert.match(css,/\.bodylab-fallback-orientation \.btn \{ min-height: 44px/);
  assert.match(css,/\.bodylab-quick-regions \.btn \{ flex: 0 0 auto; min-height: 44px/);
  assert.match(css,/\.bodylab-region:hover,\.bodylab-region:focus-visible,\.bodylab-region.selected/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\) \{ \.bodylab-three \*/);
  assert.match(sw,/"js\/core\/bodylab-silhouette\.js"/);
});

test('a 3D státuszcímke csak sikeres GLB után mutat 3D-t; hiányzó modellnél 2D-re vált',()=>{
  const body=readFileSync(new URL('../js/ui/views-body-lab.js',import.meta.url),'utf8');
  const three=readFileSync(new URL('../js/ui/three-body.js',import.meta.url),'utf8');
  assert.match(body,/badge\.textContent=state==='ready'\?'3D':state==='loading'\?'2D \/ 3D':'2D'/);
  assert.match(body,/onModelReady:ready=>viewer\.enableSearch\(ready\),onStatusChange/);
  assert.match(three,/if\(!gltf\)\{container\.dataset\.model='fallback';container\.dataset\.webgl='unavailable';onStatusChange\('unavailable'\);return;\}/);
  assert.match(three,/const lost=e=>\{e\.preventDefault\(\);container\.dataset\.webgl='unavailable';onStatusChange\('unavailable'\)/);
});
