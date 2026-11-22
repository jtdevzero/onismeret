import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(resolve(root, p), 'utf8');

test('FORMA 2: önálló belépési pont és telepíthető PWA', () => {
  const html = read('index.html');
  assert.match(html, /FORMA 2 ULTIMATE/);
  assert.match(html, /src="js\/ui\/app\.js"/);
  assert.match(html, /href="styles\.css"/);
  assert.match(html, /rel="manifest"/);
  assert.match(read('manifest.webmanifest'), /FORMA 2/);
});

test('FORMA 2: saját IndexedDB és saját offline cache, működő SW regisztráció', () => {
  assert.match(read('js/ui/store.js'), /forma2-preview/);
  assert.match(read('js/ui/app.js'), /navigator\.serviceWorker\.register\('sw\.js'\)/);
  const sw = read('sw.js');
  assert.match(sw, /const SHELL = 'forma2-shell-/);
  assert.match(sw, /const VENDOR = 'forma2-vendor-/);
  assert.match(sw, /const ART = 'forma2-art-/);
  assert.match(sw, /k\.startsWith\('forma2-'\)/);
  assert.doesNotMatch(sw, /k\.startsWith\('forma-'\)/);
});

test('FORMA 2: minden előtöltött fájl létezik, új modulok offline is elérhetők', () => {
  const sw = read('sw.js');
  const list = JSON.parse(sw.match(/const PRECACHE = (\[[\s\S]*?\]);/)[1]);
  for (const path of list) assert.ok(existsSync(resolve(root, path)), `hiányzó offline fájl: ${path}`);
  for (const path of ['js/core/home-layout.js', 'js/core/home-summary.js', 'js/core/workout-quick-input.js']) {
    assert.ok(list.includes(path), `hiányzó offline modul: ${path}`);
  }
});
