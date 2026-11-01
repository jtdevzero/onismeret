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

test('a prémium stílus minden céloldalon és a cache-ben szerepel', () => {
  const root = require('node:path').resolve(__dirname, '../..');
  const fs = require('node:fs');
  const readRoot = p => fs.readFileSync(require('node:path').join(root,p),'utf8');
  const premium = readRoot('assets/party-premium.css');
  assert.match(premium, /premium-focus/);
  for (const page of ['tarsas/index.html','paros/index.html','tarsas/harry-potter/index.html','tarsas/atkozott/index.html']) {
    assert.match(readRoot(page), /(?:party-premium|premium)\.css\?v=\d+/, page);
  }
  for (const rootName of ['tarsas','paros']) {
    const html = readRoot(rootName+'/index.html');
    const worker = readRoot(rootName+'/sw.js');
    const version = html.match(/(?:style|styles)\.css\?v=(\d+)/)?.[1];
    assert.ok(version, rootName+' asset version');
    assert.ok(worker.includes(rootName+'-v'+version), rootName+' cache version');
    assert.match(worker, new RegExp('premium\\.css\\?v='+version));
  }
});
test('Átkozott döntések: egyéni mód csak a végén mutat eredményt', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const page = fs.readFileSync(path.resolve(__dirname,'../atkozott/index.html'),'utf8');
  const script = page.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);
  assert.doesNotThrow(() => new vm.Script(script));
  assert.match(script, /players===1/);
  assert.match(script, /soloVotes\[choice\]\+\+/);
  assert.match(script, /idx>=decks\[cat\]\.length/);
  assert.match(script, /phase='solo-end'/);
});


test('a külön játékok offline navigációja és a csomag tartalma összhangban van', () => {
 const sw = read('sw.js');
 assert.match(sw, /'atkozott\/'/);
 assert.match(sw, /childRoots = \[[^\]]*'atkozott\/'/);
 for (const file of ['atkozott/index.html','homlok/index.html','activity18/index.html','harry-potter/index.html']) {
   assert.ok(fs.existsSync(path.join(root,file)), file);
 }
});
test('Páros est: mind a kilenc játékmód és az érzékeny válaszok memóriában tartása', () => {
 const js=fs.readFileSync(path.resolve(root,'../paros/app.js'),'utf8');
 assert.doesNotThrow(()=>new vm.Script(js));
 const games=js.match(/const GAMES=\{([\s\S]*?)\n\};/);
 assert.ok(games);
 const keys=[...games[1].matchAll(/^\s*([a-z]+):\{/gm)].map(m=>m[1]);
 assert.equal(keys.length,9);
 assert.equal(new Set(keys).size,9);
 assert.match(js,/válaszok kizárólag memóriában élnek/);
});

test('Esttervező: öt játék és megosztható ranglista', () => {
 const script=read('enhancements.js');
 assert.match(script,/s\.queue\.length < 5/);
 assert.match(script,/A\.eveningShare =/);
 assert.match(script,/Estprogram megosztása/);
 assert.match(script,/navigator\.share/);
});

test('Eredménykártya és helyi játékosprofil elérhető',()=>{
 const js=read('enhancements.js');
 assert.match(js,/A\.eveningCard =/);
 assert.match(js,/canvas\.toBlob/);
 assert.match(js,/Eredménykártya PNG/);
 assert.match(js,/Játékosprofilok · az este/);
});
