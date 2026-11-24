import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source=readFileSync(new URL('../js/ui/exercise-motion-studio.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');

test('a mozgásstúdió vezérlőit WebGL előtt létrehozza és offline SVG-vel működik',()=>{
  assert.ok(source.indexOf('const fallback=createFallback()') < source.indexOf("await import('../../vendor/three/three.module.js')"));
  assert.match(source,/container\.append\(fallback\.svg,phase,slider,stages,views,actions,disclaimer\)/);
  assert.match(source,/container\.dataset\.webgl='unavailable'/);
  assert.match(css,/\.exercise-motion-fallback/);
});

test('lejátszás, csúszka, nézetváltás, reduced motion és erőforrás-felszabadítás',()=>{
  assert.match(source,/slider\.oninput=\(\)=>\{pause\(\)/);
  assert.match(source,/for\(const \[key,label,value\] of viewButtons\)/);
  assert.match(source,/if\(reduced\)play\.hidden=true/);
  assert.match(source,/document\.addEventListener\('visibilitychange',visibility\)/);
  assert.match(source,/document\.removeEventListener\('visibilitychange',visibility\)/);
  assert.match(source,/renderer\.domElement\.addEventListener\('webglcontextlost',lost\)/);
  assert.match(source,/renderer\.dispose\(\)/);
});

test('a régi import API kompatibilis marad',()=>{
  const entry=readFileSync(new URL('../js/ui/three-exercise.js',import.meta.url),'utf8');
  assert.match(entry,/export \{ mountExerciseMotion \} from '\.\/exercise-motion-studio\.js'/);
});
