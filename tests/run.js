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
      const t = await p.evaluate(() => [document.documentElement.dataset.theme, !!document.getElementById('oni-theme'), !!document.querySelector('link[href="assets/theme.css"]')]);
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

  await browser.close();
  console.log(`\n${pass} rendben, ${fail} hiba`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
