import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('mobil: fontos kis gombok legalább 44 pixeles érintési céllal', () => {
  assert.match(css, /\.page \.btn\.small \{ min-height: 44px; \}/);
  assert.match(css, /\.rest-adjust \.btn \{ min-width: 96px; min-height: 48px;/);
});

test('analitika: táblázat vízszintesen navigálható, billentyűzetes fókusz látható', () => {
  assert.match(css, /\.table-wrap \{[^}]*overflow-x: auto;/);
  assert.match(css, /\.table-wrap:focus-visible \{ outline:/);
  assert.match(css, /\.table-wrap \.data-table \{ width: max-content; min-width: 100%; \}/);
});

test('kis telefon és csökkentett mozgás külön stílust kap', () => {
  assert.match(css, /@media \(max-width: 370px\) \{\s*\.rest-adjust/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.table-wrap/);
});
