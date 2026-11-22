import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('../js/ui/views-main.js', import.meta.url), 'utf8');
const data = readFileSync(new URL('../js/ui/data.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const english = readFileSync(new URL('../js/ui/i18n-en.js', import.meta.url), 'utf8');

test('a prémium beállítások a mentett nézetre épülnek és a sötét rendszerbe illeszkednek', () => {
  assert.match(data, /\['light', 'dark', 'sun', 'oled'\]/);
  assert.match(data, /st\.density === 'compact'/);
  assert.match(main, /saveSettings\(\{ density: v \}\)/);
  assert.match(styles, /:root\[data-theme="oled"\]/);
  assert.match(styles, /:root\[data-density="compact"\]/);
  assert.match(english, /"OLED fekete": "OLED black"/);
});

test('napi gyorsműveletek létező útvonalakat használnak, a check edzésazonosítót kap', () => {
  const quick = main.slice(main.indexOf("class: 'home-quick'"), main.indexOf("class: 'home-quick'" ) + 1000);
  assert.match(quick, /'#\/check\/' \+ nextKey\(prog\)/);
  for (const path of ['library', 'progress', 'log', 'program', 'cardio', 'assess']) {
    assert.ok(quick.includes(`'#/` + path + `'`), path);
  }
  assert.match(styles, /min-height: var\(--tap-target\)/);
});
