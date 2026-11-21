/* Böngészős végpontteszt (Playwright, mobil nézet): első indítás, felmérés, eredmény, program, vezetett edzés
   értékeléssel és szintlépéssel, napló, beállítások, akadálymentesség (axe-core).
   Futtatás: node forma/tests/browser.cjs   (képernyőképek: FORMA_SHOTS=mappa) */
const { chromium, devices } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const SHOTS = process.env.FORMA_SHOTS;

function serve() {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let u = decodeURIComponent(req.url.split('?')[0]);
      if (u.endsWith('/')) u += 'index.html';
      const f = path.join(ROOT, u);
      if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
      fs.readFile(f, (e, b) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); res.end(b); } });
    }).listen(0, '127.0.0.1', () => resolve(srv));
  });
}
const shown = (page, hash) => page.waitForFunction(h => document.documentElement.dataset.view === h, hash);
const go = async (page, hash) => { await page.evaluate(h => { if (location.hash === h) dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = h; }, hash); await page.waitForTimeout(50); await shown(page, hash); };

const RESULTS = { deep_squat: 2, shoulder_reach: 2, ankle_wall: 9, sit_reach: 0, hip_flexor: 2, chair_stand: 22, plank: 70, broad_jump: 205, tapping: 40, sl_stance: 7, sit_rise: 9, step_test: 100 };

(async () => {
  const srv = await serve(), base = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['Pixel 7'] });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
  page.on('pageerror', e => problems.push('pageerror: ' + e.message));
  page.on('dialog', d => d.accept());
  let n = 0;
  const shot = async name => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, String(++n).padStart(2, '0') + '-' + name + '.png'), fullPage: true }); };
  const text = () => page.locator('#main').innerText();
  const step = async (name, fn) => { try { await fn(); console.log('ok   ' + name); } catch (e) { console.log('FAIL ' + name + '\n     ' + (e.message || e).split('\n')[0]); process.exitCode = 1; await shot('fail'); } };

  await page.goto(base);
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
  /* gyors időzítő a tesztekhez */
  await page.evaluate(async () => { (await import('./js/ui/widgets.js')).setTick(15); });

  await step('első indítás: profil és szűrés nélkül nem lehet továbblépni, minden út ide visz', async () => {
    assert.match(await text(), /Egészségügyi szűrés/);
    assert.equal(await page.locator('#nav').isVisible(), false);
    await go(page, '#/program');
    assert.match(await text(), /Egészségügyi szűrés/);
    const start = page.getByRole('button', { name: 'Kezdjük' });
    assert.equal(await start.isDisabled(), true);
    await page.getByLabel('Életkor').fill('16');
    assert.match(await text(), /felnőtteknek készült/);
    await page.getByLabel('Életkor').fill('34');
    await page.getByText('Férfi', { exact: true }).click();
    for (const fs of await page.locator('fieldset').all()) await fs.getByText('Nem', { exact: true }).click();
    assert.equal(await start.isDisabled(), true, 'elfogadás nélkül tiltva');
    await page.getByText(/Megértettem: a Forma nem orvosi eszköz/).click();
    await shot('start');
    await start.click();
    await page.waitForFunction(() => /Felmérés indítása/i.test(document.getElementById('main').innerText));
    assert.equal(await page.locator('#nav').isVisible(), true);
    await shot('home-empty');
  });

  await step('felmérés: időzítős teszt (számláló, visszaszámlálás, stopper), kihagyás, alapadatok', async () => {
    await go(page, '#/assess');
    assert.match(await text(), /0 \/ 13 teszt kész/);
    assert.equal(await page.getByRole('button', { name: 'Kiértékelés' }).isDisabled(), true);
    /* fekvőtámasz: koppintós számláló tölti a mezőt */
    await go(page, '#/test/pushup');
    for (let i = 0; i < 20; i++) await page.getByRole('button', { name: 'Egy ismétlés hozzáadása' }).click();
    assert.equal(await page.locator('#val').inputValue(), '20');
    await shot('test-pushup');
    await page.getByRole('button', { name: 'Mentés' }).click();
    await page.waitForFunction(() => location.hash !== '#/test/pushup');
    /* 30 mp felállás: visszaszámlálás végig fut */
    await go(page, '#/test/chair_stand');
    await page.getByRole('button', { name: 'Indítás' }).click();
    await page.waitForFunction(() => /Kész\. Írd be az eredményt/.test(document.getElementById('main').innerText), null, { timeout: 5000 });
    /* plank: a stopper beírja az időt */
    await go(page, '#/test/plank');
    await page.getByRole('button', { name: 'Indítás' }).click();
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'Megállt' }).click();
    assert.ok(Number(await page.locator('#val').inputValue()) > 0, 'a stopper beírta az időt');
    /* választós teszt */
    await go(page, '#/test/deep_squat');
    await page.getByText(/Lemegyek, de a sarkam/).click();
    await page.getByRole('button', { name: 'Mentés' }).click();
    await page.waitForFunction(() => location.hash !== '#/test/deep_squat');
    /* kihagyás */
    await go(page, '#/test/tapping');
    await page.getByRole('button', { name: 'Kihagyom' }).click();
    await page.waitForFunction(() => location.hash !== '#/test/tapping');
    /* a többi eredmény közvetlenül a piszkozatba (a felület útját fent már bejártuk) */
    await page.evaluate(async r => { const s = await import('./js/ui/state.js'); const d = await s.getDraft(); Object.assign(d.results, r); delete d.results.tapping; await s.setDraft(d); }, RESULTS);
    await go(page, '#/test/vitals');
    await page.getByLabel(/Nyugalmi pulzus/).fill('62');
    await page.getByLabel(/Derékbőség/).fill('88');
    await page.getByText('Hetente 2–3-szor').click();
    await page.getByText('Kifulladok és megizzadok').click();
    await page.getByText('30–60 perc').click();
    await shot('vitals');
    await page.getByRole('button', { name: 'Mentés' }).click();
    await shown(page, '#/assess');
    assert.match(await text(), /alapadatok megvannak/);
    assert.match(await text(), /Kihagyva/);
    await shot('assess');
  });

  await step('kiértékelés: pókhálóábra, fittségi kor, területek, tesztek, források', async () => {
    await page.getByRole('button', { name: 'Kiértékelés' }).click();
    await page.waitForFunction(() => (document.documentElement.dataset.view || '').startsWith('#/result/'));
    const t = await text();
    assert.match(t, /Fittségi kor/);
    assert.match(t, /\d+ év/);
    assert.match(t, /Területenként/);
    assert.match(t, /Erre fókuszálunk/);
    assert.match(t, /becsült norma/);
    assert.equal(await page.locator('svg.radar').count(), 1);
    await shot('result');
  });

  await step('program: elkészül, látszik a forgó rend és a szintek', async () => {
    await page.getByRole('button', { name: 'Program készítése' }).click();
    await shown(page, '#/program');
    const t = await text();
    assert.match(t, /Forgó rend/);
    assert.match(t, /Erő A: guggolás és nyomás/);
    assert.match(t, /Szintjeid/);
    assert.match(t, /Fekvőtámasz/);
    await shot('program');
    await go(page, '#/');
    assert.match(await text(), /Mai edzés/i);
    await shot('home');
  });

  await step('vezetett edzés: végigmegy, értékelést kér, két „könnyű” után szintet lép', async () => {
    const levelBefore = await page.evaluate(async () => (await (await import('./js/ui/state.js')).getProgram()).levels.push);
    for (let round = 0; round < 2; round++) {
      /* mindig az Erő A-t csináljuk, hogy a fekvőtámasz kétszer egymás után értékelve legyen */
      await go(page, '#/session/strengthA');
      if (round === 0) await shot('session');
      /* a gyorsított időzítő magától is továbblép, ezért egy gomb el is tűnhet a kattintás előtt: rövid várakozás, újrapróba */
      const tap = async name => { const b = page.getByRole('button', { name }); return (await b.count()) ? b.click({ timeout: 1000 }).then(() => true, () => false) : false; };
      for (let guard = 0; guard < 300; guard++) {
        if (/Edzés kész/i.test(await text())) break;
        if (await tap('Könnyű volt')) continue;
        if (await tap('Pihenő kihagyása')) continue;
        if (await tap('Kész, tovább')) continue;
        await page.waitForTimeout(100);
      }
      await page.waitForFunction(() => /Edzés kész/i.test(document.getElementById('main').innerText));
    }
    assert.match(await text(), /Szintváltás/i);
    await shot('done');
    const prog = await page.evaluate(async () => (await (await import('./js/ui/state.js')).getProgram()));
    assert.equal(prog.levels.push, levelBefore + 1);
    assert.equal(prog.done, 1, 'csak a soron következő edzés léptette a rendet');
  });

  await step('napló és gyakorlatleírás', async () => {
    await go(page, '#/log');
    const t = await text();
    assert.match(t, /Edzések hetente/);
    assert.match(t, /Szintlépés/);
    await shot('log');
    await go(page, '#/ex/push_full');
    assert.match(await text(), /Hogyan csináld/);
    assert.equal(await page.locator('svg.fig').count(), 2, 'a fekvőtámasz ábrája két képkocka');
    await shot('exercise');
  });

  await step('beállítások: kímélő mód kiveszi az ugrásokat a programból', async () => {
    await go(page, '#/settings');
    await page.getByText(/Kímélő mód/).click();
    await page.getByRole('button', { name: 'Mentés', exact: true }).click();
    await page.waitForFunction(async () => (await (await import('./js/ui/state.js')).getProgram()).lowImpact === true);
    const jumps = await page.evaluate(async () => {
      const { buildSession, ROTATION } = await import('./js/core/program.js'), { D } = await import('./js/ui/data.js'), s = await import('./js/ui/state.js');
      const p = await s.getProgram();
      return ROTATION.flatMap(k => buildSession(k, p, D.exercises.exercises).blocks).filter(b => D.ex[b.exercise].impact).length;
    });
    assert.equal(jumps, 0);
    await shot('settings');
  });

  await step('tesztoldal: látszanak a korábbi eredmények', async () => {
    await go(page, '#/test/pushup');
    const t = await text();
    assert.match(t, /Korábbi eredményeid/);
    assert.match(t, /20 ismétlés/);
  });

  await step('mentés és visszatöltés: törlés után a mentésfájlból minden visszajön', async () => {
    const backup = await page.evaluate(async () => JSON.stringify(await (await import('./js/ui/store.js')).exportAll()));
    const before = await page.evaluate(async () => (await (await import('./js/ui/store.js')).itemsAll()).length);
    await page.evaluate(async () => { await (await import('./js/ui/store.js')).wipeAll(); });
    await page.reload();
    await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
    await page.evaluate(async () => { (await import('./js/ui/widgets.js')).setTick(15); });
    assert.match(await text(), /Van már mentésed/);
    await page.setInputFiles('input[type=file]', { name: 'forma-mentes.json', mimeType: 'application/json', buffer: Buffer.from(backup) });
    await page.waitForFunction(() => /Mai edzés/i.test(document.getElementById('main').innerText), null, { timeout: 10000 });
    const after = await page.evaluate(async () => (await (await import('./js/ui/store.js')).itemsAll()).length);
    assert.equal(after, before);
    /* idegen fájl: hibaüzenet, nincs változás */
    await go(page, '#/settings');
    await page.setInputFiles('input[type=file]', { name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"app":"mas"}') });
    await page.waitForSelector('.toast');
    assert.match(await page.locator('.toast').innerText(), /nem a Forma mentésfájlja/);
  });

  await step('akadálymentesség (axe, WCAG 2 A/AA): a fő képernyőkön nincs hiba', async () => {
    const axe = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
    const found = [];
    for (const hash of ['#/', '#/assess', '#/test/pushup', '#/test/deep_squat', '#/test/vitals', '#/result', '#/program', '#/session/mobility', '#/ex/squat', '#/log', '#/settings']) {
      await go(page, hash);
      /* a Playwright evaluate-je nem esik a lap CSP-je alá, így beágyazott szkript nélkül töltjük be */
      await page.evaluate(src => { if (!window.axe) (0, eval)(src); }, axe).catch(() => {});
      const res = await page.evaluate(async () => (window.axe ? (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map(v => v.id + ': ' + v.nodes.length + ' elem, pl. ' + v.nodes[0].html.slice(0, 90)) : ['az axe nem töltődött be']));
      for (const v of res) found.push(hash + ' → ' + v);
    }
    assert.deepEqual(found, [], found.join('\n     '));
  });

  await step('nincs konzolhiba és CSP-sértés', async () => { assert.deepEqual(problems, [], problems.join(' | ')); });

  await browser.close();
  srv.close();
})();
