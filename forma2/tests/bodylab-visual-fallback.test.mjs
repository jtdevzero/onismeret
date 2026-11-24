import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('BODY LAB 3D hiba esetén látható 2D anatómiai atlaszt kínál', () => {
  const view = readFileSync(new URL('../js/ui/views-body-lab.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const three = readFileSync(new URL('../js/ui/three-body.js', import.meta.url), 'utf8');
  assert.match(view, /function anatomyViewer\(/);
  assert.match(view, /bodyDiagram\(layer, selected, choose\)/);
  assert.match(css, /\[data-webgl=ready\] \.bodylab-static-fallback \{ display: none;/);
  assert.match(css, /\[data-webgl=unavailable\] \.bodylab-3d-controls,\.bodylab-three\[data-webgl=unavailable\] \.bodylab-view-controls \{ display: none;/);
  assert.match(three, /container\.dataset\.webgl = 'loading'/);
  assert.match(three, /container\.dataset\.webgl='ready'/);
  assert.match(view, /bodylab-fallback-loading/);
});

test('nem ellenőrzött kötőszöveti 3D rudakat nem állítunk valós anatómiai modellnek', () => {
  const view = readFileSync(new URL('../js/ui/views-body-lab.js', import.meta.url), 'utf8');
  assert.match(view, /hasDetailed3D = current\.layer === 'bones'/);
  assert.match(view, /viewer\.dataset\.webgl = 'unavailable'/);
});

test('mobil BODY LAB: izomkijelölés 2D tartalékban és geometria-alapú 3D fókusz', () => {
  const view = readFileSync(new URL('../js/ui/views-body-lab.js', import.meta.url), 'utf8');
  const three = readFileSync(new URL('../js/ui/three-body.js', import.meta.url), 'utf8');
  assert.match(view, /area => map\.selectArea\(area\)/);
  assert.match(view, /id:'chest',name:tr\('Mell'\)/);
  assert.match(three, /focusBox\.expandByObject\(obj\)/);
  assert.match(three, /tr\('Elölnézet'\)/);
  assert.match(three, /tr\('Hátulnézet'\)/);
  assert.match(three, /viewTools\.remove\(\)/);
});
