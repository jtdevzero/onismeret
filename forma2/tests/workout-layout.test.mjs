import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('edzésképernyő: kiemelt vezérlő mobilon legalább 44 px, hosszú felirat tördelhető', () => {
  assert.match(css, /\.workout-actions \.btn\s*\{[^}]*min-height:\s*56px/s);
  assert.match(css, /\.workout-actions\s*\{[^}]*flex-wrap:\s*wrap/s);
  assert.match(css, /\.session-page \.workout-title, \.session-page \.workout-cue\s*\{\s*overflow-wrap:\s*anywhere/s);
});

test('rövid telefon és 320 px: kompakt térköz, gyakorlatábra és csökkentett mozgás támogatása', () => {
  assert.match(css, /@media \(max-height:\s*740px\) and \(max-width:\s*699px\)/);
  assert.match(css, /@media \(max-width:\s*350px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /\.workout-visual \.fig-live \.fig\s*\{\s*height:\s*125px/);
});
