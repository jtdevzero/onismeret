/* Társasest v2 — Node 20+ statikus regressziós ellenőrzések.
 * Futtatás a repó gyökeréből: node --test tarsas/tests/v2-smoke.test.cjs
 * Nem helyettesíti a valódi Safari/Chrome funkcionális tesztet. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const enhancement = read('enhancements.js');
const index = read('index.html');
const sw = read('sw.js');
const app = read('app.js');

test('minden játékmodul JavaScript-szintaxisa helyes', () => {
  for (const file of ['app.js','data.js','enhancements.js','games-party.js','games-social.js','games-bluff.js','games-quiz.js','games-dreams.js','sw.js']) {
    assert.doesNotThrow(() => new vm.Script(read(file), { filename: file }), file);
  }
});
test('HTML és offline cache ugyanazt a verziót szolgálja ki', () => {
  const version = index.match(/style\.css\?v=(\d+)/)?.[1];
  assert.ok(version);
  assert.match(sw, new RegExp("tarsas-v" + version + "\\b"));
  for (const asset of ['data.js','app.js','enhancements.js','games-party.js','games-social.js','games-bluff.js','games-quiz.js','games-dreams.js']) {
    const name = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(index, new RegExp(name + "\\?v=" + version));
    assert.match(sw, new RegExp(name + "\\?v=" + version));
  }
});
test('új kérdéscsomagok darabszáma és azonosítói', () => {
  const start = enhancement.indexOf('const extraPacks = ');
  const end = enhancement.indexOf('Object.entries(extraPacks)', start);
  assert.ok(start >= 0 && end > start);
  const data = vm.runInNewContext(enhancement.slice(start, end) + '\nextraPacks');
  let count = 0;
  for (const [game, packs] of Object.entries(data)) {
    assert.ok(['never','likely'].includes(game));
    for (const [id, pack] of Object.entries(packs)) {
      assert.match(id, /^uj_[a-z]+$/);
      assert.equal(pack.spicy, false);
      assert.equal(pack.items.length, 12);
      assert.equal(new Set(pack.items.map(x => x.trim().toLocaleLowerCase('hu'))).size, pack.items.length);
      count += pack.items.length;
    }
  }
  assert.equal(count, 48);
});
test('meglévő mentési kulcsok és Szóbomba biztonsági ellenőrzése megmaradt', () => {
  assert.match(app, /SKEY = 'tarsas\.v1', RKEY = 'tarsas\.run\.v1'/);
  assert.match(app, /function vibrationSupported\(\)/);
  assert.match(app, /buzz\(p > \.8 \? 35 : 20\)/);
});
test('ranglista tartalmazza a holtverseny logikáját', () => {
  assert.match(enhancement, /other > points/);
  assert.match(enhancement, /leaderboardMarkup\(rows\)/);
});
