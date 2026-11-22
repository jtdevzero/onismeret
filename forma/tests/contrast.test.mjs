/* U1-104: a színváltozók kontrasztja minden témában (WCAG 2: szöveg ≥ 4,5:1, nagy elem/ikon ≥ 3:1). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const vars = block => Object.fromEntries([...block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(m => [m[1], m[2]]));
const blockAfter = sel => { const i = css.indexOf(sel); assert.ok(i >= 0, sel); return css.slice(css.indexOf('{', i) + 1, css.indexOf('}', i)); };
const light = vars(blockAfter(':root {'));
const dark = { ...light, ...vars(blockAfter(':root[data-theme="dark"] {')) };
const sunSel = css.includes(':root[data-theme="sun"] {') ? ':root[data-theme="sun"] {' : null;
const sun = sunSel ? { ...light, ...vars(blockAfter(sunSel)) } : null;
const lum = hex => { const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const TEXT = [['text', 'bg'], ['text', 'surface'], ['muted', 'surface'], ['muted', 'bg'], ['accent-text', 'accent'], ['accent', 'surface'], ['good', 'good-bg'], ['warn', 'warn-bg'], ['danger', 'surface']];
const UI = [['teal', 'surface'], ['accent', 'bg']];

for (const [name, t] of [['világos', light], ['sötét', dark], ...(sun ? [['napfény', sun]] : [])]) {
  test(`kontraszt (${name} téma): szöveg legalább 4,5:1, felületi elem legalább 3:1`, () => {
    for (const [f, b] of TEXT) assert.ok(ratio(t[f], t[b]) >= 4.5, `${name}: --${f} a --${b} háttéren ${ratio(t[f], t[b]).toFixed(2)}:1`);
    for (const [f, b] of UI) assert.ok(ratio(t[f], t[b]) >= 3, `${name}: --${f} a --${b} háttéren ${ratio(t[f], t[b]).toFixed(2)}:1`);
  });
}

test('a sötét téma a rendszerbeállításnál és a kézi kapcsolónál azonos', () => {
  const sys = vars(blockAfter(':root:not([data-theme="light"]) {'));
  for (const [k, v] of Object.entries(sys)) assert.equal(dark[k], v, k);
});
