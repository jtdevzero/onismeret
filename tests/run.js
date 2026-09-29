#!/usr/bin/env node
/* Önismereti térképek — automatikus ellenőrzés.
 * Futtatás a repó gyökeréből:  node tests/run.js
 * Kell hozzá: playwright (npm i playwright) és egy Chromium (npx playwright install chromium).
 */
let chromium;
try { ({ chromium } = require('playwright')); }
catch (e) { ({ chromium } = require(require('path').join(process.env.HOME || '', '.npm-global/lib/node_modules/playwright'))); }
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const R = 'file://' + ROOT + '/';
let pass = 0, fail = 0;
const ok = (cond, name, info) => { if (cond) { pass++; console.log('  ✓', name); } else { fail++; console.log('  ✗', name, info !== undefined ? '→ ' + JSON.stringify(info) : ''); } };
const near = (a, b) => Math.abs(a - b) < 0.011;

(async () => {
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const newCtx = async () => { const c = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true }); return c; };
  const pageIn = async (ctx) => { const p = await ctx.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push(e.message)); p.on('dialog', d => d.accept()); return p; };

  console.log('\n1. Oldalak: betöltés, JS-hibák, külső kérések');
  {
    const ctx = await newCtx(); const ext = [];
    ctx.on('request', r => { const u = r.url(); if (!/^(file|data|blob):/.test(u)) ext.push(u); });
    const p = await pageIn(ctx);
    for (const f of fs.readdirSync(ROOT).filter(x => x.endsWith('.html'))) {
      p._errs = []; await p.goto(R + f); await p.waitForTimeout(150);
      ok(p._errs.length === 0, `${f} hibamentes`, p._errs);
      ok(await p.evaluate(() => !!window.ONI && !!ONI.save), `${f} betölti a közös magot`);
    }
    ok(ext.length === 0, 'nincs külső hálózati kérés', ext.slice(0, 3));
    await ctx.close();
  }

  console.log('\n2. Főoldal: kártyák mélylinkjei és darabszámai');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    await p.goto(R + 'index.html');
    const cards = await p.$$eval('.card[data-key]', cs => cs.map(c => ({ href: c.getAttribute('href'), total: +c.dataset.total })));
    const hero = await p.evaluate(() => [document.getElementById('hero-tests').textContent, document.getElementById('pp-qtotal').textContent]);
    ok(+hero[0] === cards.length, 'hero tesztszám = kártyák száma', hero[0]);
    ok(+hero[1] === cards.reduce((a, c) => a + c.total, 0), 'kérdésszám = kártyák összege', hero[1]);
    for (const c of cards) {
      const [, hash] = c.href.split('#'); if (!hash) continue;
      await p.goto(R + c.href); await p.waitForTimeout(150);
      ok(await p.evaluate(h => { const el = document.getElementById(h); return !!el && !!el.offsetParent; }, hash), `${c.href} a saját fülét nyitja`);
    }
    await ctx.close();
  }

  console.log('\n3. Pontozás: MAIA-2 szélsőértékek és fordított tételek');
  for (const [val, exp] of [[0, { noticing: 0, 'not-distract': 5, 'not-worry': 3, trusting: 0 }], [5, { noticing: 5, 'not-distract': 0, 'not-worry': 2, trusting: 5 }]]) {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    await p.goto(R + 'maia2.html');
    await p.evaluate(v => document.querySelectorAll('.q').forEach(q => [...q.querySelectorAll('button[data-n]')].find(b => +(b.dataset.value ?? b.dataset.v) === v).click()), val);
    await p.click('#showResults'); await p.waitForTimeout(200);
    const d = await p.evaluate(() => { const h = ONI.all().maia2; return h[h.length - 1]; });
    for (const [k, e] of Object.entries(exp)) ok(near(d.d[k][1], e), `MAIA-2 minden válasz ${val}: ${k} = ${e}`, d.d[k][1]);
    ok(d.qv === 2 && d.sv === 2, 'MAIA-2 verzió q2/s2', [d.qv, d.sv]);
    await ctx.close();
  }

  console.log('\n4. Pontozás: motoros tesztek min/max, NaN-mentesség');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    const hubs = { kapcsolat: ['las', 'tki', 'gott', 'fti'], cselekves: ['pvq', 'ft', 'kolbe', 'meq'], szabalyozas: ['ips', 'ders', 'scs', 'tfeq'] };
    for (const [hub, ids] of Object.entries(hubs)) for (const id of ids) for (const mode of ['min', 'max']) {
      await p.goto(R + hub + '.html#test-' + id); await p.waitForTimeout(80);
      const r = await p.evaluate(([id, mode]) => { TESTS[id]._fillAll(k => mode === 'min' ? 0 : k - 1); TESTS[id].show(); const el = document.getElementById(id + '-results'); const h = ONI.all()[id]; return { bad: /NaN|undefined|Infinity/.test(el.innerHTML), rec: h && h[h.length - 1] }; }, [id, mode]);
      ok(!r.bad && r.rec, `${id} ${mode}: eredmény és mentés rendben`);
      if (id === 'ips') ok(r.rec.d.total[1] === (mode === 'min' ? 21 : 33), `IPS ${mode} (fordított tételekkel) = ${mode === 'min' ? 21 : 33}`, r.rec.d.total[1]);
      if (id === 'meq') ok(r.rec.d.total[1] >= 16 && r.rec.d.total[1] <= 86, 'MEQ a 16–86 tartományban', r.rec.d.total[1]);
      if (id === 'tfeq') ok(Object.values(r.rec.d).every(x => x[1] >= 0 && x[1] <= 100), 'TFEQ skálák 0–100 között');
    }
    ok(p._errs.length === 0, 'nincs JS-hiba a motoros teszteken', p._errs.slice(0, 2));
    await ctx.close();
  }

  console.log('\n5. Kitöltési alkalmak: újranyitás, javítás, újramérés, verzióváltás');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    await p.goto(R + 'cselekves.html#test-meq');
    await p.evaluate(() => { TESTS.meq._fillAll(() => 1); TESTS.meq.show(); });
    let n = await p.evaluate(() => ONI.all().meq.length); ok(n === 1, 'első kitöltés: 1 bejegyzés', n);
    await p.reload(); await p.evaluate(() => TESTS.meq.show());
    n = await p.evaluate(() => ONI.all().meq.length); ok(n === 1, 'újranyitás nem új mérés', n);
    // javítás: „Új kitöltés” nélkül módosított válasz → ugyanaz a mérés, javítottként
    await p.evaluate(() => { TESTS.meq._fillAll((k, it) => (it.n === 1 ? 2 : 1)); TESTS.meq.show(); });
    let h = await p.evaluate(() => ONI.all().meq);
    ok(h.length === 1 && h[0].corrected === 1, 'válasz módosítása új kitöltés nélkül: javítás, nem új mérés', [h.length, h[0].corrected]);
    const sid0 = h[0].sid;
    // „Új kitöltés” ugyanazon a napon, ugyanazokkal a válaszokkal → mégis külön mérés
    await p.evaluate(() => { TESTS.meq.reset(); TESTS.meq._fillAll((k, it) => (it.n === 1 ? 2 : 1)); TESTS.meq.show(); });
    h = await p.evaluate(() => ONI.all().meq);
    ok(h.length === 2 && JSON.stringify(h[0].d) === JSON.stringify(h[1].d) && h[0].done.slice(0, 10) === h[1].done.slice(0, 10), 'aznapi, azonos pontszámú új kitöltés külön bejegyzés', h.length);
    ok(h[0].sid === sid0 && h[1].sid && h[0].sid !== h[1].sid && !h[1].corrected, 'minden kitöltés saját azonosítót kap');
    await p.reload(); await p.evaluate(() => TESTS.meq.show());
    ok(await p.evaluate(() => ONI.all().meq.length) === 2, 'az új kitöltés újranyitása sem új mérés');
    // verzióváltás: régebbi kérdéssor → összegzés nem hasonlít
    await p.evaluate(() => { const a = ONI.all(); a.meq[0].qv = 9; localStorage.setItem(ONI.K, JSON.stringify(a)); });
    await p.goto(R + 'osszegzes.html');
    ok(await p.evaluate(() => document.body.innerText.includes('egy másik változatával készült')), 'eltérő verzió: nincs összehasonlítás, jelzi');
    // fordításverzió: eltérő fordítás sem összevethető, és megjelenik az eredményen
    await p.evaluate(() => { const a = ONI.all(); a.meq[0].qv = 1; a.meq[0].tv = 2; localStorage.setItem(ONI.K, JSON.stringify(a)); });
    await p.reload();
    ok(await p.evaluate(() => document.body.innerText.includes('egy másik változatával készült') && /fordítás v1/.test(document.body.innerText)), 'eltérő fordításverzió sem hasonlítható össze, és látszik');
    await ctx.close();
  }

  console.log('\n6. NSSS: partner-kérdések kihagyása');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    await p.goto(R + 'attitudok.html#test-nsss'); await p.waitForTimeout(150);
    ok(await p.evaluate(() => document.getElementById('nsss-showResults').disabled), 'üresen tiltott az eredmény');
    await p.evaluate(() => { const qs = [...document.querySelectorAll('#test-nsss .q')]; qs.forEach(q => { if (/saját/.test(q.textContent)) q.querySelector('button[data-n]').click(); }); });
    ok(await p.evaluate(() => !document.getElementById('nsss-showResults').disabled), 'csak az ego-kérdésekkel megnyitható');
    await p.click('#nsss-showResults'); await p.waitForTimeout(200);
    const r = await p.evaluate(() => { const h = ONI.all().nsss; return h[h.length - 1]; });
    ok(r && r.d.EGO && !r.d.total && r.x && r.x.partial, 'csak az ego-alskála mentve, összpontszám nincs', r && Object.keys(r.d));
    await ctx.close();
  }

  console.log('\n7. Összegzés: egy teszt önmagában nem ad mintát; irányfüggő színezés');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    await p.goto(R + 'cselekves.html#test-kolbe');
    await p.evaluate(() => { TESTS.kolbe._fillAll((k, it) => it.s === 'ff' ? (it.r ? 0 : 4) : it.s === 'qs' ? (it.r ? 4 : 0) : 2); TESTS.kolbe.show(); });
    await p.goto(R + 'osszegzes.html');
    const pats = await p.$$eval('.pat h3', e => e.map(x => x.textContent));
    ok(!pats.includes('Elemzési bénultság'), 'Cselekvési módok egyedül nem vált ki mintát', pats);
    await ctx.close();
  }

  console.log('\n8. Import/export: ellenőrzés, visszavonás, párexport');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    await p.goto(R + 'cselekves.html#test-ft'); await p.evaluate(() => { TESTS.ft._fillAll(() => 0); TESTS.ft.show(); });
    await p.goto(R + 'index.html');
    const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'oni-'));
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#pp-export')]); const f = path.join(tmp, 'm.json'); await dl.saveAs(f);
    const good = JSON.parse(fs.readFileSync(f)); ok(!!good.data['onismeret-results-v1'], 'export tartalmazza az eredménytárat');
    const bad = JSON.parse(JSON.stringify(good)); bad.data['four-tendencies-responses-v1'] = JSON.stringify({ '1': '<img>' }); fs.writeFileSync(path.join(tmp, 'b.json'), JSON.stringify(bad));
    await p.setInputFiles('#pp-import', path.join(tmp, 'b.json')); await p.waitForTimeout(200);
    ok(/sérült/.test(await p.textContent('#pp-msg')), 'hibás értéket tartalmazó fájlt elutasít');
    const bad2 = JSON.parse(JSON.stringify(good)); bad2.data['onismeret-results-v1'] = JSON.stringify({ ft: [{ t: 'nem-datum', d: {} }] }); fs.writeFileSync(path.join(tmp, 'b2.json'), JSON.stringify(bad2));
    await p.setInputFiles('#pp-import', path.join(tmp, 'b2.json')); await p.waitForTimeout(200);
    ok(/sérült/.test(await p.textContent('#pp-msg')), 'hibás dátumú eredményt elutasít');
    // visszaállítás + visszavonás
    await p.evaluate(() => localStorage.setItem('meq-responses-v1', JSON.stringify({ 1: 5 })));
    await p.setInputFiles('#pp-import', f); await p.waitForLoadState('load'); await p.waitForTimeout(500);
    ok(await p.evaluate(() => !!localStorage.getItem('onismeret-undo-v1')), 'visszaállítás előtt visszavonási pont készül');
    ok(await p.evaluate(() => [...document.querySelectorAll('.pp-btn')].some(b => /visszavonása/.test(b.textContent))), 'megjelenik a visszavonás gomb');
    // párexport csak párteszteket tartalmaz
    await p.goto(R + 'par.html');
    await p.click('#pexport'); await p.waitForTimeout(100);
    const [dl2] = await Promise.all([p.waitForEvent('download'), p.click('#pexp-go')]); const f2 = path.join(tmp, 'p.json'); await dl2.saveAs(f2);
    const pe = JSON.parse(fs.readFileSync(f2)); const keys = Object.keys(pe.data);
    ok(pe.kind === 'partner' && keys.length === 1 && keys[0] === 'onismeret-results-v1', 'párexport: csak az eredménytár, nyers válaszok nélkül', keys);
    await ctx.close();
  }

  console.log('\n9. Arculat: világos alap, sötét kapcsoló, megmarad oldalváltáskor');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    for (const f of fs.readdirSync(ROOT).filter(x => x.endsWith('.html'))) {
      await p.goto(R + f);
      const t = await p.evaluate(() => [document.documentElement.dataset.theme, !!document.getElementById('oni-theme'), !!document.querySelector('link[href^="assets/theme.css"]')]);
      ok(t[0] === 'light' && t[1] && t[2], `${f}: világos alap, kapcsoló, témafájl`, t);
    }
    await p.goto(R + 'index.html'); await p.click('#oni-theme');
    const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await p.goto(R + 'maia2.html');
    ok(await p.evaluate(() => document.documentElement.dataset.theme) === 'dark', 'sötét téma megmarad oldalváltás után');
    await p.goto(R + 'ysq.html'); await p.waitForTimeout(200);
    ok(await p.evaluate(() => document.documentElement.dataset.theme) === 'dark', 'a YSQ a közös témát követi');
    ok(/rgb\(5, 13, 30\)|rgba?\(5, 13, 30/.test(bg), 'sötét háttér a főoldalon', bg);
    await ctx.close();
  }

  console.log('\n10. Egységes eredményfelépítés: adatlap, Röviden-kártya, jegyzetek');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    const ids = ['ecr','smi','tas','iief','pedt','sdi','des','ssss','nsss','saq','love','apo','imago','bf','via','las','tki','gott','fti','pvq','ft','kolbe','meq','ips','ders','scs','tfeq'];
    const pages = { kapcsolat:['las','tki','gott','fti'], cselekves:['pvq','ft','kolbe','meq'], szabalyozas:['ips','ders','scs','tfeq'], terkepek:['ecr','smi','tas'], funkcio:['iief','pedt','sdi','des'], attitudok:['ssss','nsss','saq'], nyelvek:['love','apo','imago'], szemelyiseg:['bf','via'] };
    for (const [pg, list] of Object.entries(pages)) { await p.goto(R + pg + '.html'); await p.waitForTimeout(150);
      for (const id of list) ok(await p.evaluate(id => !!document.querySelector('#test-' + id + ' .oni-sheet'), id), `${id}: tesztadatlap a kérdések fölött`); }
    for (const f of ['maia2', 'sis-ses']) { await p.goto(R + f + '.html'); await p.waitForTimeout(150); ok(await p.evaluate(() => !!document.querySelector('.oni-sheet')), `${f}: tesztadatlap`); }
    ok(await p.evaluate(() => Object.keys(window.ONI_DATA).length) === 31, 'mind a 31 teszthez van adatlap');
    for (const [pg, id] of [['szabalyozas', 'ips'], ['terkepek', 'tas'], ['nyelvek', 'love']]) {
      await p.goto(R + pg + '.html#test-' + id); await p.waitForTimeout(150);
      await p.evaluate(id => { const g = {}; document.querySelectorAll('#test-' + id + ' button[data-n]').forEach(x => (g[x.dataset.n] = g[x.dataset.n] || []).push(x)); Object.values(g).forEach(a => a[0].click()); const b = document.querySelector('#test-' + id + ' button[id$=showResults], #' + id + '-show'); b.click(); }, id);
      await p.waitForTimeout(700);
      const r = await p.evaluate(id => { const res = document.getElementById(id + '-results'); return { brief: !!res.querySelector(':scope > .oni-brief'), det: !!res.querySelector(':scope > details.oni-detail'), open: res.querySelector(':scope > details.oni-detail').open, deep: !!res.querySelector(':scope > .oni-deep .od-panel'), order: [...res.children].map(c => c.className.split(' ')[0]).join(',') }; }, id);
      ok(r.brief && r.det && r.open && r.deep && /^oni-brief,oni-deep,oni-detail/.test(r.order), `${id}: Röviden-kártya, vizuális áttekintés, alapból nyitott részletes elemzés`, r);
      ok(await p.evaluate(id => { const res = document.getElementById(id + '-results'), b = res.querySelector(':scope > .oni-brief'); return !b.querySelector('.oni-chart, textarea, .oni-commit') && !!b.querySelector('.oni-sum') && res.lastElementChild.classList.contains('oni-mine') && !!res.querySelector(':scope > .oni-deep .oni-chart'); }, id), `${id}: rövid összefoglaló diagram és jegyzet nélkül; diagram az áttekintésben, jegyzetek a végén`);
    }
    await p.click('#love-results .oni-chip[data-v=explore]'); await p.fill('#love-results textarea', 'teszt jegyzet'); await p.waitForTimeout(700);
    const n = await p.evaluate(() => JSON.parse(localStorage.getItem('onismeret-notes-v1')).love);
    ok(n && Object.values(n)[0].fit.includes('explore') && Object.values(n)[0].text === 'teszt jegyzet', 'jegyzet és címke mentve a kitöltéshez kötve');
    const sc = await p.evaluate(() => { const h = ONI.all().love; return h[h.length - 1].d; });
    await p.goto(R + 'osszegzes.html');
    ok(await p.evaluate(() => document.body.innerText.includes('teszt jegyzet')), 'jegyzet megjelenik az összegzésben');
    await ctx.close();
  }

  const seedDemo = (p) => p.evaluate((src) => { eval(src); localStorage.setItem('onismeret-results-v1', JSON.stringify(ONI_DEMO.store())); localStorage.setItem('onismeret-notes-v1', JSON.stringify(ONI_DEMO.notes())); }, fs.readFileSync(path.join(ROOT, 'assets/demo-data.js'), 'utf8'));

  console.log('\n11. Főoldal: saját kezdőlap visszatérőknek');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    await p.goto(R + 'index.html');
    ok(await p.evaluate(() => document.getElementById('home').hidden), 'új látogatónál nincs kezdőlap-panel');
    await p.goto(R + 'cselekves.html#test-ft'); await p.evaluate(() => { TESTS.ft._fillAll(() => 0); TESTS.ft.show(); });
    await p.evaluate(() => localStorage.setItem('meq-responses-v1', JSON.stringify({ 1: 2, 2: 3 })));
    await p.goto(R + 'index.html'); await p.waitForTimeout(200);
    const home = await p.evaluate(() => ({ hidden: document.getElementById('home').hidden, txt: document.getElementById('home-grid').textContent }));
    ok(!home.hidden, 'visszatérőnél megjelenik a kezdőlap-panel');
    ok(/Folytasd/.test(home.txt) && /MEQ|Kronotípus/.test(home.txt), 'a félbehagyott teszt a Folytasd kártyán', home.txt.slice(0, 200));
    ok(/Legutóbbi/.test(home.txt) && /tendencia/i.test(home.txt), 'a legutóbbi eredmény látszik');
    ok(/Következő/.test(home.txt) && /Cselekvési módok/.test(home.txt), 'következő lépés: a kezdő útvonal következő tesztje');
    ok(await p.evaluate(() => !!document.querySelector('a[href="adatok.html"]') && !!document.querySelector('a[href="valtozasok.html"]')), 'főoldal linkeli az Adatok és a Változásnapló oldalt');
    await ctx.close();
  }

  console.log('\n12. Összegzés: eredménytörténet-grafikon, demó profil');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    await p.goto(R + 'osszegzes.html?demo=1'); await p.waitForTimeout(200);
    ok(await p.evaluate(() => Object.keys(localStorage).filter(k => k !== 'onismeret-settings-v1').length === 0), 'a demó profil semmit nem ír a tárhelyre');
    ok(await p.evaluate(() => !document.getElementById('demo-bar').hidden && /Kitalált/.test(document.getElementById('demo-bar').textContent)), 'a demó profil jól láthatóan jelölve');
    const hc = await p.evaluate(() => { const card = [...document.querySelectorAll('.card.test')].find(c => c.querySelector('.nm').textContent.includes('ECR')); const w = card.querySelector('.hc-wrap'); return w ? { n: JSON.parse(w.dataset.hc).t.length, paths: w.querySelectorAll('path.ln').length, rows: card.querySelectorAll('.hc table tr').length } : null; });
    ok(hc && hc.n === 3 && hc.paths === 2 && hc.rows === 4, 'ECR-R: 3 kitöltés, 2 vonal, táblázat', hc);
    ok(await p.evaluate(() => { const card = [...document.querySelectorAll('.card.test')].find(c => c.querySelector('.nm').textContent.includes('Konfliktus')); return !card.querySelector('.hc-wrap') && /második kitöltéstől/.test(card.textContent); }), 'egy kitöltésnél nincs grafikon, csak magyarázat');
    ok(await p.evaluate(() => [...document.querySelectorAll('.hc-wrap')].every(w => w.querySelectorAll('path.ln').length <= 4)), 'legfeljebb 4 vonal egy grafikonon');
    const w = await p.$('.hc-wrap svg'); await w.scrollIntoViewIfNeeded(); const b = await w.boundingBox(); await p.mouse.move(b.x + b.width * 0.5, b.y + 40);
    await p.mouse.move(b.x + b.width * 0.52, b.y + 44); await p.waitForTimeout(300);
    ok(await p.evaluate(() => { const t = document.querySelector('.hc-tip'); return +getComputedStyle(t).opacity > 0.9 && /\d/.test(t.textContent); }), 'rámutatáskor megjelenik a tooltip');
    await p.click('#oni-theme'); await p.waitForTimeout(100); await p.click('#oni-theme'); await p.waitForTimeout(100);
    ok(p._errs.length === 0 && await p.$$eval('.hc-wrap', x => x.length) > 0, 'témaváltás után is újrarajzol, hiba nélkül', p._errs);
    // eltérő verzió nem kerül a grafikonra
    await p.goto(R + 'index.html'); await seedDemo(p);
    await p.evaluate(() => { const a = ONI.all(); a.ecr[0].qv = 9; localStorage.setItem(ONI.K, JSON.stringify(a)); });
    await p.goto(R + 'osszegzes.html'); await p.waitForTimeout(200);
    ok(await p.evaluate(() => { const card = [...document.querySelectorAll('.card.test')].find(c => c.querySelector('.nm').textContent.includes('ECR')); return JSON.parse(card.querySelector('.hc-wrap').dataset.hc).t.length === 2; }), 'eltérő kérdéssor-változatú kitöltés kimarad a grafikonról');
    await p.setViewportSize({ width: 390, height: 800 }); await p.waitForTimeout(400);
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= 392 && JSON.parse(document.querySelector('.hc-wrap').dataset.hc).W < 400), 'mobilon keskeny grafikon, nincs vízszintes görgetés');
    await ctx.close();
  }

  console.log('\n13. Adatok oldal: törlés, visszavonás, export, teljes törlés');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    await p.goto(R + 'index.html'); await seedDemo(p);
    await p.evaluate(() => { localStorage.setItem('ecr-r-responses-v1', JSON.stringify({ 1: 4 })); localStorage.setItem('maia2-responses-v1', JSON.stringify({ 1: 3 })); });
    await p.goto(R + 'adatok.html'); await p.waitForTimeout(150);
    ok(await p.$$eval('.card[data-test]', c => c.length) === 11, 'minden adattal rendelkező teszt listázva');
    await p.click('[data-del-sess="ecr"][data-i="0"]'); await p.waitForTimeout(100);
    let st = await p.evaluate(() => ({ n: ONI.all().ecr.length, raw: localStorage.getItem('ecr-r-responses-v1') }));
    ok(st.n === 2 && st.raw !== null, 'régebbi kitöltés törlése: csak az a mérés tűnik el, a válaszok maradnak');
    await p.click('[data-del-sess="ecr"][data-i="1"]'); await p.waitForTimeout(100);
    st = await p.evaluate(() => ({ n: ONI.all().ecr.length, raw: localStorage.getItem('ecr-r-responses-v1'), note: (JSON.parse(localStorage.getItem('onismeret-notes-v1')).ecr || {}).demo5 }));
    ok(st.n === 1 && st.raw === null && !st.note, 'legutóbbi kitöltés törlése a mentett válaszokat és a jegyzetét is viszi');
    await p.click('#undo-go'); await p.waitForTimeout(100);
    ok(await p.evaluate(() => ONI.all().ecr.length === 2), 'törlés visszavonható');
    await p.click('[data-del-test="bf"]'); await p.waitForTimeout(100);
    ok(await p.evaluate(() => !ONI.all().bf && ONI.all().ecr.length === 2), 'tesztenkénti törlés csak azt a tesztet viszi');
    const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'oni-'));
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-exp="ips"]')]); const f = path.join(tmp, 'ips.json'); await dl.saveAs(f);
    const ex = JSON.parse(fs.readFileSync(f));
    ok(ex.kind === 'test' && Object.keys(JSON.parse(ex.data['onismeret-results-v1'])).join() === 'ips', 'tesztenkénti export csak azt a tesztet tartalmazza');
    await p.click('[data-del-test="ips"]'); await p.waitForTimeout(100);
    await p.goto(R + 'index.html'); await p.setInputFiles('#pp-import', f); await p.waitForLoadState('load'); await p.waitForTimeout(400);
    ok(await p.evaluate(() => ONI.all().ips.length === 3 && ONI.all().ecr.length === 2 && ONI.all().meq.length === 2), 'tesztexport visszaállítása összefésül, a többi tesztet nem bántja');
    await p.goto(R + 'adatok.html'); await p.waitForTimeout(100);
    ok(await p.evaluate(() => !!document.getElementById('del-orph')), 'régi kérdőívváltozat válaszai külön jelölve');
    await p.click('#wipe'); await p.fill('#wipe-in', 'rossz');
    ok(await p.evaluate(() => document.getElementById('wipe-go').disabled), 'teljes törlés csak a megerősítő szóval');
    await p.fill('#wipe-in', 'TÖRLÉS'); await p.click('#wipe-go'); await p.waitForTimeout(100);
    ok(await p.evaluate(() => Object.keys(localStorage).filter(k => /-responses-v\d+$|^onismeret-/.test(k)).length === 0), 'teljes törlés után nem marad adat');
    ok(p._errs.length === 0, 'adatok oldal hibamentes', p._errs);
    await ctx.close();
  }

  console.log('\n14. Változásnapló');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    await p.goto(R + 'valtozasok.html'); await p.waitForTimeout(150);
    ok(await p.evaluate(() => document.querySelectorAll('#log > li').length >= 5 && [...document.querySelectorAll('#log > li')].every(li => li.querySelectorAll('.flag').length === 2)), 'minden bejegyzésnél pontozás- és újrakitöltés-jelzés');
    ok(await p.evaluate(() => /még nincs tárolt/.test(document.getElementById('mine').textContent)), 'adat nélkül: nem érint semmit');
    await p.evaluate(() => localStorage.setItem(ONI.K, JSON.stringify({ maia2: [{ n: 'MAIA-2', t: '2026-01-01T10:00:00Z', done: '2026-01-01T10:00:00Z', qv: 1, sv: 1, d: {} }] })));
    await p.reload(); await p.waitForTimeout(150);
    ok(await p.evaluate(() => /MAIA-2/.test(document.getElementById('mine').textContent) && !!document.querySelector('#mine .hit')), 'régi MAIA-2 eredménynél jelzi az újrakitöltést');
    ok(await p.evaluate(() => document.querySelectorAll('#vers tr').length === 32), 'verziótábla mind a 31 teszttel');
    await ctx.close();
  }

  console.log('\n15. Célok, vállalás, naptár, jelölés, változás-összefoglaló, nyugodt zárás');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    await p.goto(R + 'index.html'); await p.waitForTimeout(150);
    ok(await p.$$eval('.goal-chip', x => x.length) === 8, 'nyolc cél a főoldalon');
    await p.click('.goal-chip[data-g="proc"]');
    let g = await p.evaluate(() => ({ n: document.querySelectorAll('#goal-out .home-card').length, first: document.querySelector('#goal-out .home-card.first .hn').textContent }));
    ok(g.n === 3 && /IPS/.test(g.first), 'célhoz 3 teszt, az első kiemelve', g);
    await p.goto(R + 'szabalyozas.html#test-ips'); await p.waitForTimeout(200);
    // „nem értem” jelölés
    const nFlags = await p.$$eval('#test-ips .oni-unclear', x => x.length);
    ok(nFlags === 9, 'minden IPS-kérdésen van jelölőgomb', nFlags);
    await p.click('#test-ips .oni-unclear');
    const un = await p.evaluate(() => JSON.parse(localStorage.getItem('onismeret-unclear-v1')));
    ok(un && un.ips && un.ips['1'] && un.ips['1'].q.length > 10, 'jelölés mentve a kérdés szövegével', un);
    ok(await p.evaluate(() => !localStorage.getItem('ips-responses-v1')), 'a jelölés nem számít válasznak');
    await p.evaluate(() => { TESTS.ips._fillAll(() => 2); TESTS.ips.show(); }); await p.waitForTimeout(500);
    ok(await p.evaluate(() => !document.querySelector('#ips-results .oni-calm')), 'könnyű tesztnél nincs nyugodt zárás');
    // vállalás
    await p.fill('#ips-results .oni-crow input', 'Reggel az első 25 percben a legnehezebb feladat'); await p.click('#ips-results .oni-cbtn');
    let cm = await p.evaluate(() => [JSON.parse(localStorage.getItem('onismeret-commit-v1')).ips, ONI.all().ips[0].sid]);
    ok(cm[0] && cm[0].length === 1 && !cm[0][0].st && cm[0][0].sid === cm[1], 'vállalás mentve a kitöltéshez kötve');
    // naptár
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#ips-results .oni-ics')]);
    const ics = fs.readFileSync(await dl.path(), 'utf8'); const exp = new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10).replace(/-/g, '');
    ok(/BEGIN:VCALENDAR/.test(ics) && ics.includes('DTSTART;VALUE=DATE:' + exp) && /\r\n/.test(ics) && dl.suggestedFilename() === 'ujrameres-ips.ics', 'naptárfájl a 90. napra', dl.suggestedFilename());
    // főoldal visszakérdez
    await p.goto(R + 'index.html'); await p.waitForTimeout(200);
    ok(await p.evaluate(() => /25 percben/.test(document.getElementById('home-commit').textContent)), 'nyitott vállalás a főoldali kezdőlapon');
    // következő kitöltésnél visszakérdez
    await p.evaluate(() => { const a = ONI.all(); a.ips[0].done = a.ips[0].t = new Date(Date.now() - 20 * 864e5).toISOString(); localStorage.setItem(ONI.K, JSON.stringify(a)); const m = JSON.parse(localStorage.getItem(ONI.META)); m.ans['ips-responses-v1'] = new Date(Date.now() - 20 * 864e5).toISOString(); localStorage.setItem(ONI.META, JSON.stringify(m)); });
    await p.goto(R + 'szabalyozas.html#test-ips'); await p.waitForTimeout(200);
    await p.evaluate(() => { TESTS.ips.reset(); TESTS.ips._fillAll(() => 1); TESTS.ips.show(); }); await p.waitForTimeout(500);
    ok(await p.evaluate(() => ONI.all().ips.length === 2 && /25 percben/.test((document.querySelector('#ips-results .oni-cprev') || {}).textContent || '')), 'új kitöltésnél visszakérdez a múltkori vállalásra');
    await p.click('#ips-results .oni-cprev [data-cst="part"]');
    ok(await p.evaluate(() => JSON.parse(localStorage.getItem('onismeret-commit-v1')).ips[0].st === 'part'), 'kimenetel rögzítve');
    // változás-összefoglaló
    await p.goto(R + 'osszegzes.html'); await p.waitForTimeout(200);
    const chg = await p.evaluate(() => ({ txt: (document.querySelector('.chg-card') || {}).textContent, ips: ONI.all().ips.map(e => [e.d.total[1], e.qv, e.sv]) }));
    ok(chg.txt && /10%-ánál/.test(chg.txt) && Math.abs(chg.ips[0][0] - chg.ips[1][0]) / 36 < 0.1, 'küszöb alatti változást (IPS 27 → 24) nem nagyít fel', chg);
    await p.goto(R + 'osszegzes.html?demo=1'); await p.waitForTimeout(200);
    ok(await p.evaluate(() => { const li = document.querySelectorAll('.chg-list li'); return li.length >= 3 && li.length <= 5 && [...li].every(x => /→/.test(x.textContent)); }), 'demó: 3–5 kiemelt változás, értékekkel');
    // adatok oldal
    await p.goto(R + 'adatok.html'); await p.waitForTimeout(150);
    ok(await p.evaluate(() => /25 percben/.test(document.getElementById('commits').textContent) && document.querySelectorAll('#unclear [data-unf]').length === 1), 'adatok oldal: vállalások és jelölések listázva');
    // nyugodt zárás (DES-II)
    await p.goto(R + 'funkcio.html#test-des'); await p.waitForTimeout(300);
    await p.evaluate(() => document.querySelectorAll('#test-des .q').forEach(q => { const b = q.querySelectorAll('button[data-n]'); b[1] && b[1].click(); }));
    await p.waitForTimeout(300); await p.click('#test-des button[id$=show], #test-des button[id$=showResults]'); await p.waitForTimeout(1500);
    const calm = await p.evaluate(() => { const r = document.getElementById('des-results'); const c = r.firstElementChild; return { first: c && c.classList.contains('oni-calm'), tel: !!(c && c.querySelector('a[href="tel:116123"]')), brief: !!r.querySelector(':scope > .oni-brief') }; });
    ok(calm.first && calm.tel && calm.brief, 'DES-II: nyugodt zárás az eredmény előtt, 116-123-mal', calm);
    await p.click('#des-results .oni-calm-ok');
    ok(await p.evaluate(() => document.querySelector('#des-results .oni-calm').classList.contains('min')), 'összecsukható egy sorra');
    ok(p._errs.length === 0, 'hibamentes', p._errs);
    await ctx.close();
  }

  console.log('\n16. Olvashatóság és diagram: minden teszt eredménye, mindkét témában');
  {
    const AUDIT=(scopeSel)=>{
  const parse=c=>{const m=c.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}};
  const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
  const blend=(top,bot)=>({r:top.r*top.a+bot.r*(1-top.a),g:top.g*top.a+bot.g*(1-top.a),b:top.b*top.a+bot.b*(1-top.a),a:1});
  const bgOf=el=>{const stack=[];let e=el;while(e&&e.nodeType===1){const cs=getComputedStyle(e);let c=parse(cs.backgroundColor);
      if((!c||c.a===0)&&cs.backgroundImage&&cs.backgroundImage!=='none'){const m=cs.backgroundImage.match(/rgba?\([^)]+\)|#[0-9a-f]{3,8}/i);if(m){c=m[0][0]==='#'?null:parse(m[0]);}}
      if(c&&c.a>0){stack.push(c);if(c.a>=0.99)break;}e=e.parentElement;}
    let base={r:255,g:255,b:255,a:1};const bodyBg=parse(getComputedStyle(document.body).backgroundColor)||parse(getComputedStyle(document.documentElement).backgroundColor);if(bodyBg&&bodyBg.a>0.5)base=bodyBg;
    let out=base;for(let i=stack.length-1;i>=0;i--)out=blend(stack[i],out);return out};
  const scope=document.querySelector(scopeSel)||document.body;
  const fails=[],seen=new Set();let n=0;
  const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);let t;
  while(t=walker.nextNode()){
    const s=t.textContent.trim();if(s.length<2)continue;const el=t.parentElement;if(!el||seen.has(el))continue;seen.add(el);
    const r=el.getBoundingClientRect();if(r.width<2||r.height<2)continue;
    const cs=getComputedStyle(el);if(cs.visibility==='hidden')continue;
    let op=1,e=el,hidden=false;while(e&&e.nodeType===1){const c2=getComputedStyle(e);if(c2.display==='none'){hidden=true;break}op*=+c2.opacity;e=e.parentElement;}
    if(hidden||op<0.05)continue;
    if(el.closest('svg')||el.closest('#oni-toast,#oni-path-banner')||el.closest(':disabled'))continue;if(/text/.test(cs.webkitBackgroundClip||''))continue;
    const fg=parse(cs.color);if(!fg)continue;const bg=bgOf(el);
    const f2=blend({...fg,a:fg.a*Math.min(1,op)},bg);
    const L1=lum(f2),L2=lum(bg),ratio=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
    const big=parseFloat(cs.fontSize)>=18.5||(parseFloat(cs.fontSize)>=14&&+cs.fontWeight>=700);
    n++;
    if(ratio<(big?3:4.5))fails.push({txt:s.slice(0,50),ratio:+ratio.toFixed(2),fs:cs.fontSize,cls:(el.className&&el.className.baseVal===undefined?el.className:'').toString().slice(0,40),tag:el.tagName,fg:cs.color,bg:`rgb(${bg.r|0},${bg.g|0},${bg.b|0})`});
  }
  return {n,fails};
};
    const fillLegacy = id => { const sc = document.getElementById('test-' + id) || document.body; const g = {}; sc.querySelectorAll('button[data-n]').forEach(x => (g[x.dataset.n] = g[x.dataset.n] || []).push(x)); Object.values(g).forEach(a => a[Math.floor(a.length / 2)].click()); const bt = sc.querySelector('button[id$=showResults], #' + id + '-show, button[id$=-show], #showResults'); bt.click(); };
    const CASES = [['kapcsolat', 'gott', 'hub'], ['szabalyozas', 'ders', 'hub'], ['terkepek', 'smi', 'leg'], ['terkepek', 'ecr', 'leg'], ['funkcio', 'sdi', 'leg'], ['funkcio', 'des', 'leg'], ['attitudok', 'nsss', 'leg'], ['nyelvek', 'love', 'leg'], ['nyelvek', 'imago', 'leg'], ['szemelyiseg', 'via', 'leg'], ['maia2', 'maia2', 'solo'], ['sis-ses', 'sisses', 'solo']];
    for (const th of ['light', 'dark']) {
      const ctx = await newCtx(); await ctx.addInitScript(t => { if (!sessionStorage.getItem('t')) { localStorage.setItem('onismeret-settings-v1', JSON.stringify({ theme: t })); sessionStorage.setItem('t', 1); } }, th);
      const p = await pageIn(ctx); let worst = [], charts = [];
      for (const [pg, id, kind] of CASES) {
        await p.goto(R + pg + '.html' + (kind === 'solo' ? '' : '#test-' + id)); await p.waitForTimeout(250);
        if (kind === 'hub') await p.evaluate(id => { TESTS[id]._fillAll(() => 1); TESTS[id].show(); }, id); else await p.evaluate(fillLegacy, id);
        await p.waitForTimeout(1500); await p.evaluate(() => ONI_CONTRAST.run()); await p.waitForTimeout(300);
        const sel = kind === 'solo' ? '#results' : '#' + id + '-results';
        await p.evaluate(sel => { const d = document.querySelector(sel + ' details.oni-detail'); if (d) d.open = true; }, sel); await p.evaluate(() => ONI_CONTRAST.run()); await p.waitForTimeout(250);
        const a = await p.evaluate(AUDIT, sel); if (a.fails.length) worst.push([id, a.fails.length, a.fails[0]]);
        charts.push([id, await p.evaluate(sel => !!document.querySelector(sel + ' .oni-deep .oni-chart .oc-row'), sel)]);
      }
      ok(worst.length === 0, th + ' téma: minden vizsgált eredményoldal szövege eléri a WCAG AA kontrasztot', worst.slice(0, 3));
      ok(charts.every(c => c[1]), th + ' téma: minden eredmény végén van diagramos összkép', charts.filter(c => !c[1]));
      ok(p._errs.length === 0, th + ' téma: hibamentes', p._errs.slice(0, 2));
      await ctx.close();
    }
  }

  console.log('\n17. Hibajavítások: régi MAIA a mintákban, tesztspecifikus import, hisztogramhatár, félkész visszaállítás');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    const iso = d => new Date(Date.now() - d * 864e5).toISOString();
    const maia = (qv) => ({ n: 'MAIA-2', t: iso(5), done: iso(5), qv, sv: qv, tv: 1, sid: 'm' + qv, d: { noticing: ['Észrevevés', 1, 0, 5], trusting: ['Bizalom', 1.5, 0, 5] } });
    const tas = { n: 'TAS-20', t: iso(4), done: iso(4), qv: 1, sv: 1, tv: 1, sid: 't1', d: { total: ['TAS-20 összpontszám', 70, 20, 100] } };
    await p.goto(R + 'index.html');
    // régi MAIA-2 + magas TAS: a régi MAIA nem adhat második jelzést
    await p.evaluate(([m, t]) => localStorage.setItem(ONI.K, JSON.stringify({ maia2: [m], tas: [t] })), [maia(1), tas]);
    await p.goto(R + 'osszegzes.html'); await p.waitForTimeout(150);
    let st = await p.evaluate(() => ({ pats: [...document.querySelectorAll('.pat h3')].map(x => x.textContent), old: /korábbi változatával készült/.test(document.body.innerText) }));
    ok(!st.pats.includes('Nehéz hozzáférés az érzésekhez') && st.old, 'régi MAIA-2 nem vált ki keresztmintát, de az előzményekben jelölve megmarad', st);
    await p.evaluate(([m, t]) => localStorage.setItem(ONI.K, JSON.stringify({ maia2: [m], tas: [t] })), [maia(2), tas]);
    await p.reload(); await p.waitForTimeout(150);
    ok(await p.evaluate(() => [...document.querySelectorAll('.pat h3')].some(x => x.textContent === 'Nehéz hozzáférés az érzésekhez')), 'jelenlegi MAIA-2 már számít a mintába');
    // keresztminta-kártya: pontszám és dátum a kiváltó teszteknél
    ok(await p.evaluate(() => { const c = [...document.querySelectorAll('.pat')].find(x => /Nehéz hozzáférés/.test(x.textContent)); return !!c && /TAS-20/.test(c.textContent) && /70/.test(c.textContent) && /\d{4}\./.test(c.querySelector('.pat-ev').textContent); }), 'minta mellett az aktuális pontszám és dátum');

    // tesztspecifikus import-ellenőrzés
    await p.goto(R + 'index.html');
    const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'oni-'));
    const file = (name, data) => { const f = path.join(tmp, name); fs.writeFileSync(f, JSON.stringify({ app: 'onismeret', v: 1, exported: iso(0), data })); return f; };
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('maia2-responses-v2', JSON.stringify({ 1: 3 })); });
    const cases = [
      ['MAIA-2: 99-es válasz', { 'maia2-responses-v2': JSON.stringify({ 1: 99 }) }],
      ['MAIA-2: nem létező 999. kérdés', { 'maia2-responses-v2': JSON.stringify({ 999: 3 }) }],
      ['IIEF: 11. kérdésnél 0 nem megengedett', { 'iief-responses-v1': JSON.stringify({ 11: 0 }) }],
      ['DES-II: 15 nem megengedett (10-es lépték)', { 'des-2-responses-v1': JSON.stringify({ 1: 15 }) }],
      ['YSQ: 245. kérdés nem létezik', { 'ysq_autosave': JSON.stringify({ answers: { 245: 3 } }) }],
      ['eredmény skálán kívüli értékkel', { 'onismeret-results-v1': JSON.stringify({ ecr: [{ t: iso(1), d: { anx: ['Szorongás', 9, 1, 7] } }] }) }],
      ['ismeretlen teszt eredménye', { 'onismeret-results-v1': JSON.stringify({ xyz: [{ t: iso(1), d: {} }] }) }],
      ['vegyes: egy jó és egy hibás tétel', { 'tas-20-responses-v1': JSON.stringify({ 1: 3 }), 'maia2-responses-v2': JSON.stringify({ 2: 7 }) }],
    ];
    for (const [nm, data] of cases) {
      await p.setInputFiles('#pp-import', file('x.json', data)); await p.waitForTimeout(150);
      const r = await p.evaluate(() => ({ msg: document.getElementById('pp-msg').textContent, maia: localStorage.getItem('maia2-responses-v2'), tas: localStorage.getItem('tas-20-responses-v1') }));
      ok(/sérült/.test(r.msg) && r.maia === '{"1":3}' && r.tas === null, 'import elutasítva, semmi nem változott: ' + nm, r.msg.slice(0, 90));
    }
    // helyes, vegyes skálájú fájl átmegy
    await p.setInputFiles('#pp-import', file('ok.json', { 'iief-responses-v1': JSON.stringify({ 1: 0, 11: 5 }), 'maia2-responses-v2': JSON.stringify({ 1: 0, 37: 5 }), 'maia2-responses-v1': JSON.stringify({ 1: 3 }) }));
    await p.waitForLoadState('load'); await p.waitForTimeout(300);
    ok(await p.evaluate(() => localStorage.getItem('iief-responses-v1') === '{"1":0,"11":5}'), 'érvényes (vegyes skálájú) mentés visszaállítható');
    // félúton elakadó visszaállítás: minden az előző állapotra áll vissza
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('tas-20-responses-v1', JSON.stringify({ 1: 2 })); localStorage.setItem('meq-responses-v1', JSON.stringify({ 1: 1 }));
      const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'meq-responses-v1' && v === '{"1":3}') throw new Error('QuotaExceeded'); return o.call(this, k, v); }; });
    await p.setInputFiles('#pp-import', file('half.json', { 'tas-20-responses-v1': JSON.stringify({ 1: 5 }), 'meq-responses-v1': JSON.stringify({ 1: 3 }), 'ips-responses-v1': JSON.stringify({ 1: 4 }) }));
    await p.waitForTimeout(300);
    st = await p.evaluate(() => ({ tas: localStorage.getItem('tas-20-responses-v1'), meq: localStorage.getItem('meq-responses-v1'), ips: localStorage.getItem('ips-responses-v1'), msg: document.getElementById('pp-msg').textContent }));
    ok(st.tas === '{"1":2}' && st.meq === '{"1":1}' && st.ips === null && /nem fejeződött be/.test(st.msg), 'elakadt visszaállítás után nem marad félkész állapot', st);
    await ctx.close();
  }
  {
    // hisztogram: a skálahatár a kérdőívből jön, nem a válaszokból
    const ctx = await newCtx(); const p = await pageIn(ctx);
    await p.goto(R + 'maia2.html');
    await p.evaluate(() => document.querySelectorAll('.q').forEach((q, i) => [...q.querySelectorAll('button[data-n]')].find(b => +(b.dataset.value ?? b.dataset.v) === (i % 2 ? 3 : 4)).click()));
    await p.click('#showResults'); await p.waitForTimeout(600);
    let bins = await p.$$eval('#results .hist .hbk', x => x.map(e => e.textContent));
    ok(bins.join() === '0,1,2,3,4,5', 'MAIA-2 hisztogram a teljes 0–5 skálán, akkor is, ha csak 3 és 4 válasz van', bins);
    await p.goto(R + 'funkcio.html#test-iief'); await p.waitForTimeout(200);
    await p.evaluate(() => document.querySelectorAll('#test-iief .q').forEach(q => { const b = q.querySelectorAll('button[data-n]'); b[b.length - 1].click(); }));
    await p.click('#iief-showResults'); await p.waitForTimeout(600);
    const iief = await p.evaluate(() => ({ bins: [...document.querySelectorAll('#iief-results .hist .hbk')].map(e => e.textContent), note: (document.querySelector('#iief-results .hist') || { parentElement: { textContent: '' } }).parentElement.textContent }));
    ok(iief.bins.join() === '0,1,2,3,4,5' && /további 5 kérdése más válaszskálát/.test(iief.note), 'IIEF: eltérő skálájú kérdések nincsenek összeöntve, a diagram megnevezi őket', iief.bins);
    ok(p._errs.length === 0, 'hibamentes', p._errs);
    await ctx.close();
  }

  console.log('\n18. Hiányzó kérdések listája');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    await p.goto(R + 'szabalyozas.html#test-ders'); await p.waitForTimeout(200);
    await p.evaluate(() => { const g = {}; document.querySelectorAll('#test-ders button[data-n]').forEach(x => (g[x.dataset.n] = g[x.dataset.n] || []).push(x)); Object.entries(g).forEach(([n, a]) => { if (!['4', '9', '15'].includes(n)) a[0].click(); }); });
    await p.waitForTimeout(800);
    await p.click('#oni-miss'); await p.waitForTimeout(100);
    const items = await p.$$eval('#oni-misslist .oni-mi', x => x.map(e => e.textContent.trim().slice(0, 4)));
    ok(items.length === 3 && /^4\./.test(items[0]) && /^15\./.test(items[2]), 'a lista pontosan a 3 hiányzó kérdést mutatja', items);
    await p.click('#oni-misslist .oni-mi[data-k="8"]'); await p.waitForTimeout(700);
    const st = await p.evaluate(() => { const u = [...document.querySelectorAll('#test-ders .oni-unit')][8], r = u.getBoundingClientRect(); return { open: !!document.getElementById('oni-misslist'), vis: r.top >= 0 && r.bottom <= innerHeight, foc: u.contains(document.activeElement) }; });
    ok(!st.open && st.vis && st.foc, 'kattintásra a kérdéshez ugrik, és oda kerül a fókusz', st);
    await p.goto(R + 'attitudok.html#test-nsss'); await p.waitForTimeout(200);
    await p.evaluate(() => { [...document.querySelectorAll('#test-nsss .q')].slice(0, 9).forEach(q => q.querySelector('button[data-n]').click()); });
    await p.waitForTimeout(800); await p.click('#oni-miss'); await p.waitForTimeout(100);
    const ns = await p.evaluate(() => ({ req: document.querySelectorAll('#oni-misslist > ul')[0].querySelectorAll('.oni-mi').length, opt: /Kihagyható/.test(document.getElementById('oni-misslist').textContent), lists: document.querySelectorAll('#oni-misslist > ul').length }));
    ok(ns.req === 1 && ns.opt && ns.lists === 2, 'NSSS: a partner-kérdések külön, kihagyhatóként szerepelnek', ns);
    ok(p._errs.length === 0, 'hibamentes', p._errs);
    await ctx.close();
  }

  console.log('\n19. Katalógus: keresés és szűrés');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    await p.goto(R + 'index.html'); await p.waitForTimeout(300);
    const vis = () => p.$$eval('.card[data-key]', c => c.filter(x => !x.hidden).map(x => x.dataset.id));
    ok((await vis()).length === 31 && /31 teszt/.test(await p.textContent('#ct-count')), 'alapból mind a 31 teszt látszik');
    await p.fill('#ct-q', 'halogat'); await p.waitForTimeout(100);
    ok((await vis()).includes('ips'), 'szöveges keresés (ékezet nélkül is): halogatás → IPS', await vis());
    await p.fill('#ct-q', 'kotodes'); await p.waitForTimeout(100);
    ok((await vis()).includes('ecr') && (await vis()).includes('kotodes'), 'ékezet nélküli keresés megtalálja a kötődési teszteket', await vis());
    await p.fill('#ct-q', ''); await p.selectOption('#ct-time', '5'); await p.waitForTimeout(100);
    const short = await p.evaluate(() => [...document.querySelectorAll('.card[data-key]:not([hidden])')].every(c => +c.dataset.min > 0 && +c.dataset.min <= 5));
    ok(short && (await vis()).length > 0, 'időszűrő: csak a legfeljebb 5 perces tesztek');
    await p.selectOption('#ct-time', ''); await p.selectOption('#ct-type', 'own'); await p.waitForTimeout(100);
    ok((await vis()).sort().join() === ['fti', 'ft', 'gott', 'kolbe', 'kotodes', 'tki'].sort().join(), 'típusszűrő: saját kérdéssorok', await vis());
    await p.selectOption('#ct-type', ''); await p.selectOption('#ct-cat', '1'); await p.waitForTimeout(100);
    ok((await vis()).sort().join() === 'des,maia2,tas' && await p.evaluate(() => document.querySelectorAll('.cat:not([hidden])').length === 1), 'témakör-szűrő, az üres témakörök eltűnnek');
    await p.selectOption('#ct-cat', ''); await p.selectOption('#ct-st', 'done'); await p.waitForTimeout(100);
    ok((await vis()).length === 0 && !(await p.$eval('#ct-empty', e => e.hidden)), 'üres találatnál szöveges visszajelzés');
    await p.click('#ct-reset2'); await p.waitForTimeout(100);
    ok((await vis()).length === 31 && await p.evaluate(() => document.activeElement.id === 'ct-q'), 'szűrők törlése, fókusz a keresőre');
    ok(await p.evaluate(() => document.getElementById('goals').compareDocumentPosition(document.getElementById('path')) & Node.DOCUMENT_POSITION_FOLLOWING), 'első látogatáskor a célválasztó az útvonal előtt');
    ok(await p.evaluate(() => [...document.querySelectorAll('.card[data-key] .card-meta')].length === 31 && getComputedStyle(document.querySelector('.card .tests')).display === 'none'), 'kártyán időigény és kérdésszám, a részletes lista alapból rejtve');
    ok(p._errs.length === 0, 'hibamentes', p._errs);
    await ctx.close();
  }

  console.log('\n20. Akadálymentes válaszadás');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    await p.goto(R + 'maia2.html'); await p.waitForTimeout(800);
    const g = await p.evaluate(() => { const q = document.querySelector('.q'), grp = q.querySelector('[role=group]'); const b = grp.querySelectorAll('button[data-n]'); return { lbl: grp.getAttribute('aria-label'), pr: [...b].map(x => x.getAttribute('aria-pressed')) }; });
    ok(g.lbl && g.lbl.length > 15 && g.pr.every(x => x === 'false'), 'válaszcsoport a kérdés szövegével címkézve, kijelölés nélkül aria-pressed=false', g.lbl);
    await p.evaluate(() => document.querySelector('.q button[data-n]').click()); await p.waitForTimeout(900);
    ok(await p.evaluate(() => document.querySelector('.q button[data-n]').getAttribute('aria-pressed') === 'true'), 'kijelöléskor aria-pressed=true');
    await p.click('#oni-focus-on'); await p.waitForTimeout(500);
    await p.keyboard.press('0'); await p.waitForTimeout(500);
    let v = await p.evaluate(() => JSON.parse(localStorage.getItem('maia2-responses-v2')));
    ok(v['2'] === 0, 'MAIA-2 fókusz módban a 0 billentyű a 0 választ adja', v);
    await p.keyboard.press('1'); await p.waitForTimeout(500);
    v = await p.evaluate(() => JSON.parse(localStorage.getItem('maia2-responses-v2')));
    ok(v['3'] === 1, 'az 1 billentyű az 1 értéket adja, nem az első gombot (0)', v);
    ok(await p.evaluate(() => document.querySelector('.oni-unit.oni-cur').contains(document.activeElement)), 'továbblépés után a fókusz az új kérdésen van');
    await p.goto(R + 'szemelyiseg.html#test-via'); await p.waitForTimeout(800);
    const via = await p.evaluate(() => [...document.querySelector('#test-via .oni-unit').querySelectorAll('[role=group]')].map(x => x.getAttribute('aria-label')));
    ok(via.length === 3 && via.every(x => /^\d\. rész: .{10,}/.test(x)) && new Set(via).size === 3, 'több kérdéses kártyán minden válaszcsoport külön címkét kap', via);
    ok(p._errs.length === 0, 'hibamentes', p._errs);
    await ctx.close();
  }

  console.log('\n21. Tesztenkénti emlékeztető');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    await p.goto(R + 'szabalyozas.html#test-ips'); await p.waitForTimeout(200);
    await p.evaluate(() => { TESTS.ips._fillAll(() => 2); TESTS.ips.show(); }); await p.waitForTimeout(800);
    // a kitöltés dátumát 40 nappal korábbra tesszük
    await p.evaluate(() => { const t = new Date(Date.now() - 40 * 864e5).toISOString(), a = ONI.all(); a.ips[0].done = a.ips[0].t = t; localStorage.setItem(ONI.K, JSON.stringify(a)); const m = JSON.parse(localStorage.getItem(ONI.META)); m.ans['ips-responses-v1'] = t; localStorage.setItem(ONI.META, JSON.stringify(m)); });
    await p.reload(); await p.evaluate(() => TESTS.ips.show()); await p.waitForTimeout(800);
    await p.selectOption('#ips-results .oni-rsel', '30'); await p.waitForTimeout(100);
    ok(await p.evaluate(() => ONI.due('ips', ONI.all().ips[0]).due && /Most esedékes/.test(document.querySelector('#ips-results .oni-rstate').textContent)), '30 napos egyedi emlékeztető: 40 nap után esedékes');
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#ips-results .oni-ics')]);
    const ics = fs.readFileSync(await dl.path(), 'utf8'), tmr = new Date(Date.now() + 864e5).toISOString().slice(0, 10).replace(/-/g, '');
    ok(ics.includes('DTSTART;VALUE=DATE:' + tmr), 'lejárt határidőnél a naptár a holnapi napot javasolja', ics.match(/DTSTART[^\r]*/)[0]);
    await p.click('#ips-results .oni-snooze'); await p.waitForTimeout(100);
    ok(await p.evaluate(() => { const d = ONI.due('ips', ONI.all().ips[0]); return !d.due && d.snoozed; }), 'halasztás 30 nappal');
    await p.selectOption('#ips-results .oni-rsel', '0'); await p.waitForTimeout(100);
    ok(await p.evaluate(() => ONI.due('ips', ONI.all().ips[0]).off && document.querySelector('#ips-results .oni-ics').disabled), 'tesztenként kikapcsolható');
    await p.selectOption('#ips-results .oni-rsel', '90'); await p.waitForTimeout(100);
    const exp = await p.evaluate(() => { const r = ONI.all().ips[0]; return new Date(Date.parse(r.done) + 90 * 864e5).toISOString().slice(0, 10).replace(/-/g, ''); });
    const [dl3] = await Promise.all([p.waitForEvent('download'), p.click('#ips-results .oni-ics')]);
    ok(fs.readFileSync(await dl3.path(), 'utf8').includes('DTSTART;VALUE=DATE:' + exp), 'a naptárjavaslat a tényleges kitöltés dátumából indul (+90 nap)');
    await p.goto(R + 'index.html'); await p.waitForTimeout(200);
    ok(await p.evaluate(() => document.querySelector('.card[data-key="ips-responses-v1"] .status').dataset.state === 'done'), 'főoldal az egyedi beállítást használja (90 nap: még nem esedékes)');
    ok(p._errs.length === 0, 'hibamentes', p._errs);
    await ctx.close();
  }

  console.log('\n22. Párnézet: választható export, betöltés előtti előnézet, semleges kérdések');
  {
    const ctx = await newCtx(); const p = await pageIn(ctx);
    await p.goto(R + 'index.html'); await seedDemo(p);
    await p.goto(R + 'par.html'); await p.waitForTimeout(200);
    await p.click('#pexport'); await p.waitForTimeout(100);
    const boxes = await p.$$eval('#pexp-box input[type=checkbox]', x => x.map(e => e.dataset.id));
    ok(boxes.length >= 3, 'párexport: a tesztek egyenként kiválaszthatók', boxes);
    for (const id of boxes.slice(1)) await p.uncheck(`#pexp-box input[data-id="${id}"]`);
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#pexp-go')]);
    const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'oni-')), f = path.join(tmp, 'p.json'); await dl.saveAs(f);
    const pe = JSON.parse(fs.readFileSync(f));
    ok(Object.keys(JSON.parse(pe.data['onismeret-results-v1'])).join() === boxes[0], 'csak a kiválasztott teszt kerül a fájlba');
    // teljes párexport a betöltéshez
    await p.click('#pexport'); await p.waitForTimeout(100);
    const [dl2] = await Promise.all([p.waitForEvent('download'), p.click('#pexp-go')]); const f2 = path.join(tmp, 'p2.json'); await dl2.saveAs(f2);
    await p.setInputFiles('#pfile', f2); await p.waitForTimeout(200);
    const pv = await p.evaluate(() => ({ shown: !document.getElementById('pimp-box').hidden, rows: document.querySelectorAll('#pimp-box li').length, txt: document.getElementById('pimp-box').textContent, stored: localStorage.getItem('onismeret-partner-v1') }));
    ok(pv.shown && pv.rows === boxes.length && /kitöltés/.test(pv.txt) && /kérdéssor v/.test(pv.txt) && pv.stored === null, 'betöltés előtt előnézet: tesztek, dátumok, változatok; még nem mentett', pv.rows);
    await p.click('#pimp-go'); await p.waitForTimeout(200);
    const r = await p.evaluate(() => ({ stored: !!localStorage.getItem('onismeret-partner-v1'), pats: [...document.querySelectorAll('#root .card.pat')].map(c => !!c.querySelector('.pq')), cmp: [...document.querySelectorAll('#root .card.cmp')].every(c => !!c.querySelector('.pq')) }));
    ok(r.stored && r.pats.length > 0 && r.pats.every(Boolean) && r.cmp, 'megerősítés után betöltve; minden jelzésnél és összevetésnél semleges kérdés', r);
    ok(p._errs.length === 0, 'hibamentes', p._errs);
    await ctx.close();
  }

  await browser.close();
  console.log(`\n${pass} rendben, ${fail} hiba`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
