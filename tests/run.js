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
    // ugyanazok a válaszok, de egy nappal később újra kitöltve → új mérés (azonos pontszám is)
    await p.evaluate(() => { const a = ONI.all(); a.meq[0].done = a.meq[0].t = new Date(Date.now() - 3 * 864e5).toISOString(); localStorage.setItem(ONI.K, JSON.stringify(a)); });
    await p.evaluate(() => { TESTS.meq._fillAll(() => 1); TESTS.meq.show(); });
    const h = await p.evaluate(() => ONI.all().meq);
    ok(h.length === 2 && JSON.stringify(h[0].d) === JSON.stringify(h[1].d), 'azonos pontszámú újramérés új bejegyzés', h.length);
    ok(h[0].sid && h[1].sid && h[0].sid !== h[1].sid, 'minden kitöltés saját azonosítót kap');
    // verzióváltás: régebbi kérdéssor → összegzés nem hasonlít
    await p.evaluate(() => { const a = ONI.all(); a.meq[0].qv = 9; localStorage.setItem(ONI.K, JSON.stringify(a)); });
    await p.goto(R + 'osszegzes.html');
    ok(await p.evaluate(() => document.body.innerText.includes('korábbi kérdéssor- vagy pontozásverzióval')), 'eltérő verzió: nincs összehasonlítás, jelzi');
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
    const [dl2] = await Promise.all([p.waitForEvent('download'), p.click('#pexport')]); const f2 = path.join(tmp, 'p.json'); await dl2.saveAs(f2);
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
      const r = await p.evaluate(id => { const res = document.getElementById(id + '-results'); return { brief: !!res.querySelector(':scope > .oni-brief'), det: !!res.querySelector(':scope > details.oni-detail'), closed: !res.querySelector(':scope > details.oni-detail').open }; }, id);
      ok(r.brief && r.det && r.closed, `${id}: Röviden-kártya elöl, részletes elemzés lenyitható`, r);
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
    await p.evaluate(() => { TESTS.ips._fillAll(() => 1); TESTS.ips.show(); }); await p.waitForTimeout(500);
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

  await browser.close();
  console.log(`\n${pass} rendben, ${fail} hiba`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
