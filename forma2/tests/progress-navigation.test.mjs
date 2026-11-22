import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const view = readFileSync(new URL('../js/ui/views-progress.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('fejlődési gyorskiválasztó hat létező szekcióra mutat, route-ot nem ír át', () => {
  for (const id of ['overview', 'load', 'exercises', 'goals', 'records', 'body']) {
    assert.match(view, new RegExp(`anchor\\('${id}'`));
    assert.ok(view.includes(`['${id}',`));
  }
  assert.match(view, /heading\.focus\(\{ preventScroll: true \}\)/);
  assert.match(css, /\.progress-shortcuts \{[^}]*overflow-x: auto/);
});
