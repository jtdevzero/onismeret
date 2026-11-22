/* Nyelv: minden t('…') kulcsnak van angol fordítása; a magyar alap változatlan; paraméterek behelyettesítve. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import EN from '../js/ui/i18n-en.js';
import { t, setLocale } from '../js/ui/i18n.js';

test('minden t() kulcsnak van angol fordítása, üres fordítás nincs', () => {
  const missing = [];
  for (const d of ['../js/ui/', '../js/core/']) for (const f of readdirSync(new URL(d, import.meta.url)).filter(x => x.endsWith('.js'))) {
    const src = readFileSync(new URL(d + f, import.meta.url), 'utf8');
    for (const m of src.matchAll(/\btr?\('((?:[^'\\]|\\.)+)'/g)) if (!(m[1].replace(/\\n/g, '\n').replace(/\\'/g, "'") in EN)) missing.push(f + ': ' + m[1]);
  }
  assert.deepEqual(missing, []);
  for (const [k, v] of Object.entries(EN)) assert.ok(typeof v === 'string' && v.length, k);
});

test('a fordítás megtartja a paramétereket', () => {
  for (const [k, v] of Object.entries(EN)) {
    const a = [...k.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort(), b = [...v.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
    assert.deepEqual(b, a, k);
  }
});

test('magyar alap változatlan, angolul fordít, hiányzó kulcsnál magyar marad', () => {
  setLocale('hu');
  assert.equal(t('{n}. hét', { n: 3 }), '3. hét');
  setLocale('en');
  assert.equal(t('{n}. hét', { n: 3 }), 'Week 3');
  assert.equal(t('Ez nincs a szótárban'), 'Ez nincs a szótárban');
  setLocale('xx');
  assert.equal(t('Mai edzés'), 'Mai edzés');
});
