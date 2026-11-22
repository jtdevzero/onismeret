import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../forma2/index.html', import.meta.url), 'utf8');
const store = readFileSync(new URL('../js/ui/store.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../js/ui/app.js', import.meta.url), 'utf8');

test('FORMA 2 előnézet: saját belépés, közös kód, elkülönített IndexedDB', () => {
  assert.match(html, /FORMA 2 – FEJLESZTŐI ELŐNÉZET/);
  assert.match(html, /src="\.\.\/js\/ui\/app\.js"/);
  assert.match(html, /href="\.\.\/styles\.css"/);
  assert.doesNotMatch(html, /<link rel="manifest"/);
  assert.match(store, /forma2-preview/);
  assert.match(app, /forma2.*'serviceWorker' in navigator/);
});
