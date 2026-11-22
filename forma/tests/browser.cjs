/* Böngészős végpontteszt (Playwright, mobil nézet): első indítás, felmérés, eredmény, program, vezetett edzés
   értékeléssel és szintlépéssel, napló, beállítások, akadálymentesség (axe-core).
   Futtatás: node forma/tests/browser.cjs   (képernyőképek: FORMA_SHOTS=mappa) */
const { chromium, devices } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.wasm': 'application/wasm', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
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
/* aszinkron feltétel valódi kivárása (a lapon futó, Promise-t adó ellenőrzéssel) */
const until = async (page, fn, arg, ms = 5000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn, arg)) return; await page.waitForTimeout(50); } throw new Error('A feltétel nem teljesült időben.'); };
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

  await step('első indítás: négy lépés, adatok nélkül nem lehet továbblépni, minden út ide visz', async () => {
    assert.match(await text(), /Hogyan működik/);
    assert.equal(await page.locator('#nav').isVisible(), false);
    await go(page, '#/program');
    assert.match(await text(), /Hogyan működik/);
    await shot('start');
    await page.getByRole('button', { name: 'Kezdjük el' }).click();
    const next = page.getByRole('button', { name: 'Tovább' }).first();
    assert.equal(await next.isDisabled(), true);
    await page.getByLabel('Életkor').fill('16');
    assert.match(await text(), /felnőtteknek készült/);
    await page.getByLabel('Életkor').fill('34');
    await page.getByText('Férfi', { exact: true }).click();
    await next.click();
    assert.match(await text(), /Egészségügyi szűrés/);
    const next2 = page.locator('section.card:not([hidden])').getByRole('button', { name: 'Tovább' });
    assert.equal(await next2.isDisabled(), true);
    for (const fs of await page.locator('fieldset.parq-q').all()) await fs.getByText('Nem', { exact: true }).click();
    await shot('start-parq');
    await next2.click();
    const start = page.getByRole('button', { name: 'Kezdjük', exact: true });
    assert.equal(await start.isDisabled(), true, 'elfogadás nélkül tiltva');
    await page.getByText(/Megértettem: a Forma nem orvosi eszköz/).click();
    await start.click();
    await page.waitForFunction(() => /Felmérés indítása/i.test(document.getElementById('main').innerText));
    assert.equal(await page.locator('#nav').isVisible(), true);
    assert.equal(await page.locator('#nav a').count(), 4, 'négy menüpont');
    await shot('home-empty');
  });

  await step('felmérés: időzítős teszt (számláló, visszaszámlálás, stopper), kihagyás, alapadatok', async () => {
    await go(page, '#/assess');
    assert.match(await text(), /0 \/ 16 teszt kész/);
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
    /* lépcsőteszt: 3 perc mozgás után a teljes regenerációs perc ütéseit kérjük */
    await go(page, '#/test/step_test');
    assert.match(await text(), /pillanatnyi pulzusa más mérés/);
    await page.getByRole('button', { name: 'Indítás' }).click();
    await page.waitForFunction(() => /most kezdd számolni a szívveréseidet 60 másodpercig/.test(document.getElementById('main').innerText), null, { timeout: 10000 });
    assert.equal(await page.getByRole('button', { name: 'Leállítás' }).isVisible(), true);
    await page.waitForFunction(() => /Kész\. Írd be a 60 másodperc alatt összesen/.test(document.getElementById('main').innerText), null, { timeout: 5000 });
    assert.equal(await page.locator('#val').inputValue(), '', 'a pulzus kézzel megadott mérés, nem az időzítő értéke');
    assert.equal(await page.getByRole('button', { name: 'Leállítás' }).isVisible(), false);
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
    assert.match(t, /50 pontos segédvonal/);
    assert.match(t, /pontszám nem korosztályos helyezés/);
    await page.getByText('Mit jelentenek ezek a számok?', { exact: true }).click();
    assert.match(await text(), /nem mutatja a korosztályon belüli helyezésedet/);
    await page.getByText('Mit jelentenek ezek a számok?', { exact: true }).click();
    assert.match(t, /40-től közepes, 75-től magas pontszám/);
    assert.doesNotMatch(t, /Korosztályos szint|Felső negyed|korosztályos átlag/i);
    const labels = await page.locator('.area-row .badge, .stat .badge').allTextContents();
    assert.ok(labels.length >= 8, 'az összesített és minden területi pontszámhoz tartozik címke');
    for (const label of labels) {
      assert.match(label, /^(Alacsony|Közepes|Magas) pontszám$/);
    }
    const viewport = page.viewportSize();
    try {
      for (const width of [320, 393]) for (const size of ['normal', 'large']) {
        await page.setViewportSize({ width, height: viewport.height });
        await page.evaluate(s => { document.documentElement.dataset.size = s; }, size);
        const overflow = await page.evaluate(() => ({ page: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          rows: [...document.querySelectorAll('.area-top, .stat')].filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent) }));
        assert.deepEqual(overflow, { page: false, rows: [] }, `${width}px, ${size}`);
      }
    } finally {
      await page.setViewportSize(viewport);
      await page.evaluate(() => { delete document.documentElement.dataset.size; });
    }
    await page.locator('summary', { hasText: 'Tesztek részletesen' }).click();
    assert.match(await text(), /becsült norma/);
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

  await step('sorozatnapló: előtöltött, javítható, RPE-vel menthető; a hiányzó súly nem lesz kilogramm', async () => {
    await page.locator('details.setlog > summary').click();
    const first = page.locator('.setlog-row input[type="number"]').first();
    await first.fill('7');
    await page.getByLabel('Az edzés érzett nehézsége (RPE)').selectOption('7');
    await page.locator('.setlog-row input[type="checkbox"]').last().uncheck();
    await page.getByRole('button', { name: 'Napló mentése' }).click();
    await page.getByRole('status').filter({ hasText: 'Elmentve.' }).waitFor();
    const w = await page.evaluate(async () => (await (await import('./js/ui/store.js')).itemsAll('workout'))[0]);
    assert.equal(w.schemaVersion, 2);
    assert.equal(w.rpe, 7);
    assert.ok(w.log.length >= 1);
    assert.equal(w.log[0].sets[0].reps ?? w.log[0].sets[0].seconds, 7);
    assert.equal(w.log.at(-1).sets.at(-1).done, false);
    assert.ok(w.log.every(e => e.sets.every(st => st.weightKg === undefined)), 'testsúlyos edzésnél nincs kitalált súly');
    const d = w.done.find(x => x.ex === w.log[0].ex);
    assert.ok(d, 'a done összesítés a naplóból frissült');
    /* a meglévő mezők megmaradtak */
    assert.ok(w.ratings && Array.isArray(w.changes) && w.key === 'strengthA');
  });

  await step('edzés vége íráshibánál: nincs félkész mentés, az újrapróba egyszer ír', async () => {
    const before = await page.evaluate(async () => ({ n: (await (await import('./js/ui/store.js')).itemsAll('workout')).length, done: (await (await import('./js/ui/state.js')).getProgram()).done }));
    await go(page, '#/session/mobility');
    await page.evaluate(() => {
      const orig = IDBDatabase.prototype.transaction;
      window.restoreTx = () => { IDBDatabase.prototype.transaction = orig; };
      IDBDatabase.prototype.transaction = function (names, mode) {
        const t = orig.call(this, names, mode);
        if (Array.isArray(names) && names.includes('kv') && names.includes('items') && mode === 'readwrite') queueMicrotask(() => t.abort());
        return t;
      };
    });
    await page.getByRole('button', { name: 'Befejezés most' }).click();
    await page.getByRole('alert').filter({ hasText: 'nem fogadta' }).waitFor();
    const mid = await page.evaluate(async () => ({ n: (await (await import('./js/ui/store.js')).itemsAll('workout')).length, done: (await (await import('./js/ui/state.js')).getProgram()).done }));
    assert.deepEqual(mid, before, 'hibánál sem a napló, sem a program nem változott');
    await page.evaluate(() => window.restoreTx());
    await page.getByRole('button', { name: 'Újrapróba' }).click();
    await page.waitForFunction(() => /Edzés kész/i.test(document.getElementById('main').innerText));
    const after = await page.evaluate(async () => (await (await import('./js/ui/store.js')).itemsAll('workout')).length);
    assert.equal(after, before.n + 1, 'pontosan egy új edzésbejegyzés');
    /* a felső figyelmeztetés megjelent a hibánál */
    assert.equal(await page.locator('#storage-notice').isVisible(), true);
  });

  await step('napló és gyakorlatleírás', async () => {
    await go(page, '#/log');
    const t = await text();
    assert.match(t, /Edzések hetente/);
    assert.match(t, /Szintlépés/);
    await shot('log');
    await go(page, '#/ex/push_full');
    assert.match(await text(), /Három dolog, amire figyelj/i);
    assert.equal(await page.locator('.fig-live svg.fig').count(), 1, 'mozgó ábra');
    assert.equal(await page.locator('.figs svg.fig').count(), 2, 'alatta a két képkocka');
    await shot('exercise');
  });

  await step('beállítások: kímélő mód kiveszi az ugrásokat a programból', async () => {
    await go(page, '#/settings');
    await page.getByText(/Kímélő mód/).click();
    await page.getByRole('button', { name: 'Mentés', exact: true }).click();
    await until(page, async () => (await (await import('./js/ui/state.js')).getProgram()).lowImpact === true);
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
    assert.match(await page.locator('.toast').last().innerText(), /nem a Forma mentésfájlja/);
  });

  await step('kamerás mérés (hamis kamerával): 30 mp felállás megszámolva, az eredmény a mezőbe kerül', async () => {
    await page.evaluate(async () => {
      const w = await import('./js/ui/widgets.js'), s = await import('./tests/synth.mjs');
      const frames = s.series(32, t => { const k = (1 + Math.cos(2 * Math.PI * t / 2)) / 2; return { view: 'side', shin: 5, thigh: 90 * (1 - k), torso: 25 * (1 - k) }; });
      w.setRunner({ countdown: 0, openCamera: async () => { let i = 0; return { el: null, aspect: 1, read: async () => (i < frames.length ? frames[i++] : null), close() {} }; } });
    });
    await go(page, '#/test/chair_stand');
    await page.locator('summary', { hasText: 'Mérés kamerával' }).click();
    await shot('camera-test');
    await page.getByRole('button', { name: 'Mérés kamerával' }).click();
    await page.waitForFunction(() => /felállás|ismétlés/.test((document.querySelector('.live-result') || {}).innerText || ''), null, { timeout: 10000 });
    const v = Number(await page.locator('#val').inputValue());
    assert.ok(Math.abs(v - 15) <= 1, 'mért érték: ' + v);
    assert.match(await text(), /Teljes felállás/);
    assert.equal(await page.getByRole('button', { name: 'Mérési adat letöltése' }).count(), 1);
    await shot('camera-result');
  });

  await step('napi ellenőrzés: rossz napon könnyített edzést ajánl, az értékelés nélküli', async () => {
    await go(page, '#/check/strengthB');
    assert.match(await text(), /Hogy vagy ma/i);
    await page.getByText('Rosszul aludtam').click();
    await page.getByText('Nincs', { exact: true }).click();
    await page.getByText('Friss vagyok').click();
    await page.getByRole('link', { name: 'Könnyített edzés' }).click();
    await shown(page, '#/session/strengthB.light');
    assert.match(await text(), /könnyített edzés, értékelés nélkül/);
    await shot('session-light');
  });

  await step('kardió: pulzuszónák, rögzítés, heti cél a kezdőlapon', async () => {
    await go(page, '#/cardio');
    assert.match(await text(), /2\. zóna/);
    assert.match(await text(), /nyugalmi pulzusod \(62\)/);
    await page.getByText('Kocogás').click();
    await page.locator('#cmin').fill('40');
    await page.getByText(/Intenzív: csak pár szó/).click();
    await page.getByRole('button', { name: 'Mentés' }).click();
    await page.waitForFunction(() => /80 \/ 150 perc/.test(document.getElementById('main').innerText));
    await shot('cardio');
    await go(page, '#/');
    assert.match(await text(), /kardió 80 \/ 150 p/);
  });

  await step('naptár és havi összefoglaló a naplóban, lapozás hónapok között', async () => {
    await go(page, '#/log');
    const t = await text();
    assert.match(t, /A hónap összefoglalója/i);
    assert.ok(await page.locator('.cal-day.today').count() === 1);
    assert.ok(await page.locator('.cal-day.active').count() >= 1, 'van jelölt nap');
    await shot('calendar');
    const title = await page.locator('.cal-head h2').innerText();
    await page.locator('.cal-head a').first().click();
    await page.waitForFunction(t => /^#\/log\/\d{4}-\d{2}$/.test(location.hash) && document.querySelector('.cal-head h2').innerText !== t, title);
    assert.equal(await page.locator('.cal-day.today').count(), 0, 'az előző hónapban nincs „ma”');
  });

  await step('eszközök: húzódzkodó rúddal a program húzódzkodásra vált', async () => {
    await go(page, '#/settings');
    const box = page.getByRole('checkbox', { name: /Húzódzkodó rúd/ });
    await box.check();
    assert.equal(await box.isChecked(), true);
    await page.getByRole('button', { name: 'Eszközök mentése' }).click();
    let eq = [];
    for (let i = 0; i < 40 && !eq.includes('bar'); i++) { await page.waitForTimeout(50); eq = (await page.evaluate(async () => (await (await import('./js/ui/state.js')).getProgram()).equipment)) || []; }
    assert.ok(eq.includes('bar'), 'mentett eszközök: ' + JSON.stringify(eq));
    await go(page, '#/program');
    assert.match(await text(), /Húzódzkodás rúdon/);
  });

  await step('fejlődés: testméret, cél, jelvények, rekordok', async () => {
    await go(page, '#/progress');
    assert.match(await text(), /Jelvények/i);
    assert.match(await text(), /Az első edzés/);
    await page.locator('#bwaist').fill('86');
    await page.getByRole('button', { name: 'Mentés', exact: true }).click();
    await page.waitForFunction(() => /−?-?2 cm az első mérés óta|86 cm/.test(document.getElementById('main').innerText));
    assert.equal(await page.locator('#gmetric').inputValue(), 'pushup', 'a választó a mentendő értéket mutatja');
    await page.locator('#gmetric').selectOption('pushup');
    await page.locator('#gtarget').fill('30');
    await page.getByRole('button', { name: 'Cél mentése' }).click();
    await page.waitForFunction(() => /Fekvőtámasz kifáradásig: 30 ismétlés/.test(document.getElementById('main').innerText));
    assert.match(await text(), /most 20, indulás 20/);
    assert.match(await text(), /Az elmúlt 6 heted/);
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Kártya mentése képként' }).click()]);
    assert.equal(download.suggestedFilename(), 'forma-6-hetem.png');
    const png = fs.readFileSync(await download.path());
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), 1080); assert.equal(png.readUInt32BE(20), 1080);
    await shot('progress');
  });

  await step('mini-teszt: mentés és összevetés az előző méréssel', async () => {
    await go(page, '#/mini');
    await page.locator('#m-pushup').fill('24');
    await page.locator('#m-plank').fill('80');
    await page.getByRole('button', { name: 'Mentés és összevetés' }).click();
    await page.waitForFunction(() => [...document.querySelectorAll('h2')].some(e => e.innerText === 'Összevetés'));
    assert.match(await text(), /\+4/);
    await shot('mini');
    await go(page, '#/progress');
    assert.match(await text(), /most 24, indulás 20/, 'a cél a mini-teszt eredményét is látja');
  });

  await step('gyakorlatcsere: edzés közben könnyebbre cserélhető, és akkor nem kér értékelést', async () => {
    await go(page, '#/session/strengthA');
    for (let i = 0; i < 40; i++) {
      const details = page.locator('.workout-details:not([open]) > summary');
      if (await details.count()) await details.click();
      if (await page.getByRole('button', { name: 'Könnyebbre cserélem' }).count()) break;
      if (await page.getByRole('button', { name: 'Pihenő kihagyása' }).count()) await page.getByRole('button', { name: 'Pihenő kihagyása' }).click({ timeout: 1000 }).catch(() => {});
      else await page.getByRole('button', { name: 'Kész, tovább' }).click({ timeout: 1000 }).catch(() => {});
    }
    const before = await page.locator('.workout-title').innerText();
    await page.getByRole('button', { name: 'Könnyebbre cserélem' }).click();
    await page.waitForFunction(b => document.querySelector('.workout-title').innerText !== b, before);
    await shot('swap');
  });

  await step('edzésidő: 15 percre állítva a mai edzés belefér', async () => {
    await go(page, '#/settings');
    await page.getByText('15 perc', { exact: true }).click();
    await until(page, async () => (await (await import('./js/ui/store.js')).kvGet('settings')).duration === 15);
    await go(page, '#/');
    const m = (await text()).match(/Kb\. (\d+) perc/);
    assert.ok(m && Number(m[1]) <= 15, 'kezdőlap: ' + (m && m[1]));
    await go(page, '#/session/strengthC');
    assert.match(await text(), /15 perces keretre igazítva/);
  });

  await step('futóprogram: vezetett intervallumok, leállítás naplóz, de nem léptet', async () => {
    /* a visszatöltés után az oldal újratöltődött: a gyorsított időzítőt újra be kell állítani */
    await page.evaluate(async () => { (await import('./js/ui/widgets.js')).setTick(15); });
    await go(page, '#/run');
    assert.match(await text(), /1\. hét \/ 9, 1\. alkalom/);
    assert.match(await text(), /8 × \(1 perc futás, 1,5 perc séta\)/);
    await page.getByRole('button', { name: 'Indítás' }).click();
    await page.waitForFunction(() => /Futás · 2\. szakasz/i.test(document.getElementById('main').textContent), null, { timeout: 30000 });
    await shot('run');
    await page.getByRole('button', { name: 'Befejezés most' }).click();
    await page.waitForFunction(() => /Leállítva/.test(document.getElementById('main').innerText));
    const run = await page.evaluate(async () => (await import('./js/ui/views-run.js')).getRun());
    assert.deepEqual(run, { week: 1, day: 1, done: false });
    const last = await page.evaluate(async () => (await (await import('./js/ui/store.js')).itemsAll('cardio'))[0]);
    assert.equal(last.type, 'run'); assert.equal(last.partial, true);
  });

  await step('súlyzó: az eszközök közt bejelölve serleg guggolás kerül a programba', async () => {
    await go(page, '#/settings');
    await page.getByText(/Kettlebell vagy kézisúlyzó/).click();
    await page.getByRole('button', { name: 'Eszközök mentése' }).click();
    await until(page, async () => ((await (await import('./js/ui/state.js')).getProgram()).equipment || []).includes('dumbbell'));
    await go(page, '#/program');
    assert.match(await text(), /Serleg guggolás|Hátralépő kitörés súlyzóval|Bolgár guggolás súlyzóval/);
    assert.match(await text(), /Húzódzkodás rúdon/, 'a rúd elsőbbséget élvez a húzásnál');
  });

  await step('levezetés edzés után, fehérje- és vízcél, panaszmód, alvási tipp', async () => {
    await go(page, '#/cooldown');
    assert.match(await text(), /Levezetés/);
    assert.match(await text(), /1 \/ \d+/);
    await go(page, '#/progress');
    assert.match(await text(), /Add meg a testsúlyod/, 'testsúly nélkül kéri');
    await page.evaluate(async () => { await (await import('./js/ui/store.js')).itemPut({ id: 'teszt-suly', kind: 'body', date: Date.now(), weight: 80 }); });
    await go(page, '#/progress');
    assert.match(await text(), /Fehérje és víz ma/);
    assert.match(await text(), /Fehérjeadag 0 \/ 5/);
    await page.locator('.nut-row').first().getByRole('button', { name: '+' }).click();
    await until(page, async () => { const n = await (await import('./js/ui/store.js')).kvGet('nutrition'); return n && Object.values(n).some(v => v.p === 1); });
    await go(page, '#/settings');
    await page.getByRole('checkbox', { name: 'Térd' }).check();
    await until(page, async () => ((await (await import('./js/ui/state.js')).getProgram()).complaints || []).includes('knee'));
    const jumps = await page.evaluate(async () => {
      const { buildSession, ROTATION } = await import('./js/core/program.js'), { D } = await import('./js/ui/data.js'), s = await import('./js/ui/state.js');
      const p = await s.getProgram();
      return ROTATION.flatMap(k => buildSession(k, { ...p, lowImpact: false }, D.exercises.exercises).blocks).filter(b => D.ex[b.exercise].impact).length;
    });
    assert.equal(jumps, 0, 'térdpanasznál nincs ugrás');
    await go(page, '#/check/strengthA');
    await page.getByText('Rosszul aludtam').click();
    assert.match(await text(), /Alvás és edzés/);
    await go(page, '#/review');
    assert.match(await text(), /Ez a hét/);
    await go(page, '#/program');
    assert.match(await text(), /A ciklus fókusza: Alapozás/);
  });

  await step('reakcióidő-teszt: öt koppintás, a medián a mezőbe kerül', async () => {
    await page.evaluate(async () => { (await import('./js/ui/widgets.js')).setTick(5); });
    await go(page, '#/test/reaction');
    const pad = page.locator('.react-pad');
    await pad.dispatchEvent('pointerdown');
    for (let i = 0; i < 5; i++) {
      await page.waitForSelector('.react-pad.go', { timeout: 5000 });
      await page.waitForTimeout(160);
      await pad.dispatchEvent('pointerdown');
    }
    const v = Number(await page.locator('#val').inputValue());
    assert.ok(v >= 100 && v < 1500, 'medián: ' + v);
    await page.evaluate(async () => { (await import('./js/ui/widgets.js')).setTick(15); });
  });

  await step('testtartás (hamis kamerával): szemből és oldalról, eredmény és javaslat', async () => {
    await page.evaluate(async () => {
      const w = await import('./js/ui/widgets.js'), s = await import('./tests/synth.mjs');
      const mk = side => { const lm = s.pose({ view: side ? 'side' : 'frontal', shin: 0, thigh: 0, torso: 0, flex: 0, stance: 0.12 }); if (!side) lm[12][1] += 0.03; else { const x = (lm[11][0] + lm[12][0]) / 2; lm[7] = [x + 0.09, lm[11][1] - 0.06, 0, 0.95]; lm[0] = [x + 0.12, lm[11][1] - 0.06, 0, 0.95]; } return lm; };
      let n = 0;
      w.setRunner({ countdown: 0, openCamera: async () => { const side = n++ > 0; let t = 0; return { el: null, aspect: 1, read: async () => ({ t: (t += 0.1), lm: mk(side) }), close() {} }; } });
    });
    await go(page, '#/posture');
    await page.getByRole('button', { name: 'Szemből: mérés' }).click();
    await page.waitForFunction(() => /✓ Megvan/.test(document.getElementById('main').innerText), null, { timeout: 10000 });
    await page.getByRole('button', { name: 'Oldalról: mérés' }).click();
    await page.waitForFunction(() => /Mit tehetsz/i.test(document.getElementById('main').innerText), null, { timeout: 10000 });
    const t = await text();
    assert.match(t, /Vállak egy magasságban/); assert.match(t, /Fej a váll fölött/);
    await shot('posture');
    await page.getByRole('button', { name: 'Vegye fel a programom a fókuszba' }).click();
    await until(page, async () => ((await (await import('./js/ui/state.js')).getProgram()).targets || []).includes('thoracic'));
  });

  await step('gyakorlattár, saját edzés és rutin: összeállítás, futtatás, naplózás', async () => {
    await go(page, '#/library');
    await page.locator('.search').fill('plank');
    assert.match(await text(), /Alkartámasz \(plank\)/);
    await page.getByRole('button', { name: /Kedvencekhez: Alkartámasz/ }).click();
    await until(page, async () => ((await (await import('./js/ui/store.js')).kvGet('favs')) || []).includes('plank'));
    await shot('library');
    await go(page, '#/custom');
    await page.locator('#cname').fill('Reggeli 10');
    for (const n of ['Alkartámasz (plank)', 'Guggolás']) await page.locator('li.pick', { hasText: n }).first().getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Mentés', exact: true }).click();
    await shown(page, '#/routines');
    assert.match(await text(), /Reggeli 10/);
    assert.match(await text(), /Irodai mobilitás/);
    await shot('routines');
    const before = await page.evaluate(async () => (await (await import('./js/ui/state.js')).getProgram()).done);
    await page.getByRole('link', { name: /Irodai mobilitás/ }).click();
    await page.waitForFunction(() => (document.documentElement.dataset.view || '').startsWith('#/session/routine-office'));
    const tap = async name => { const b = page.getByRole('button', { name }); return (await b.count()) ? b.click({ timeout: 1000 }).then(() => true, () => false) : false; };
    for (let g = 0; g < 200; g++) {
      if (/Edzés kész/i.test(await text())) break;
      if (await tap('Pihenő kihagyása')) continue;
      if (await tap('Kész, tovább')) continue;
      await page.waitForTimeout(80);
    }
    assert.match(await text(), /Edzés kész/i);
    const after = await page.evaluate(async () => (await (await import('./js/ui/state.js')).getProgram()).done);
    assert.equal(after, before, 'a rutin nem lépteti a forgó rendet');
    const last = await page.evaluate(async () => (await (await import('./js/ui/store.js')).itemsAll('workout'))[0]);
    assert.equal(last.key, 'routine'); assert.equal(last.title, 'Irodai mobilitás');
  });

  await step('pulzus (hamis kamerával), regeneráció, egyensúly (hamis érzékelővel)', async () => {
    await page.evaluate(async () => {
      const w = await import('./js/ui/widgets.js');
      w.setTick(5);
      w.setRunner({
        openPpg: async () => { let i = 0; return { torch: true, read: async () => { const t = i++ / 30; await new Promise(r => setTimeout(r, 0)); return { t, v: 150 + 2 * Math.sin(2 * Math.PI * 1.1 * t) }; }, close() {} }; },
        openMotion: async () => { const samples = []; let i = 0; const iv = setInterval(() => { for (let k = 0; k < 4; k++, i++) samples.push({ t: i / 20, x: 0.03 * Math.sin(i / 3), y: 9.81, z: 0.03 * Math.cos(i / 4) }); }, 5); return { samples, stop: () => clearInterval(iv) }; },
      });
    });
    await go(page, '#/pulse');
    await page.getByRole('button', { name: 'Mérés indítása' }).click();
    await page.waitForFunction(() => /ütés\/perc/.test(document.getElementById('main').innerText), null, { timeout: 15000 });
    assert.match(await text(), /6[4-8] ütés\/perc/);
    await go(page, '#/');
    assert.match(await text(), /Regeneráció/);
    await go(page, '#/test/sway');
    await page.getByRole('button', { name: 'Indítás' }).click();
    await page.waitForFunction(() => /Stabilitás: \d+ \/ 100/.test(document.getElementById('main').innerText), null, { timeout: 15000 });
    assert.ok(Number(await page.locator('#val').inputValue()) > 80);
    await page.evaluate(async () => { (await import('./js/ui/widgets.js')).setTick(15); });
  });

  await step('kihívás, szezonális blokk, kihíváskód, összefoglaló, napfény téma', async () => {
    await go(page, '#/challenge');
    await page.getByText('30 napos plank').click();
    await page.waitForFunction(() => /Mai adag: 20 mp/.test(document.getElementById('main').innerText));
    await page.getByRole('button', { name: 'Kész, megcsináltam' }).click();
    await page.waitForFunction(() => /Mára kész/.test(document.getElementById('main').innerText));
    await shot('challenge');
    await go(page, '#/blocks');
    await page.getByText('Strandszezon előtti törzs').click();
    await page.waitForFunction(() => /Következő alkalom/i.test(document.getElementById('main').innerText));
    assert.match(await text(), /0 \/ 12 alkalom/);
    await go(page, '#/progress');
    assert.match(await text(), /Kihívás egy baráttal/);
    const code = await page.evaluate(async () => (await import('./js/core/extras.js')).encodeChallenge({ name: 'Barát', results: { pushup: 30, plank: 50 } }));
    await page.locator('#fcode').fill(code);
    await page.getByRole('button', { name: 'Összevetés' }).click();
    await page.waitForFunction(() => /Barátod/.test(document.getElementById('main').innerText) && document.querySelectorAll('.tests-table tbody tr').length >= 1);
    await go(page, '#/report');
    assert.match(await text(), /Forma – összefoglaló/);
    await page.evaluate(async () => { const d = await import('./js/ui/data.js'); await d.saveSettings({ theme: 'sun' }); d.applyLook(); });
    await go(page, '#/');
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'sun');
    await shot('sun-theme');
    await page.evaluate(async () => { const d = await import('./js/ui/data.js'); await d.saveSettings({ theme: 'auto' }); d.applyLook(); });
  });

  await step('edzésjegyzet, elvégzett gyakorlatok előzménye, partner mód, Több oldal, eszközpróba', async () => {
    await page.evaluate(async () => { (await import('./js/ui/widgets.js')).setTick(5); });
    await go(page, '#/session/routine-morning');
    await page.getByText('Edzés beállításai', { exact: true }).click();
    await page.getByText(/Ketten csináljuk/).click();
    assert.match(await text(), /1\. személy/);
    const tap = async name => { const b = page.getByRole('button', { name }); return (await b.count()) ? b.click({ timeout: 1000 }).then(() => true, () => false) : false; };
    let saw2 = false;
    for (let g = 0; g < 200; g++) {
      const t = await text();
      if (/2\. személy/.test(t)) saw2 = true;
      if (/Edzés kész/i.test(t)) break;
      if (await tap('Pihenő kihagyása')) continue;
      if (await tap('Kész, tovább')) continue;
      await page.waitForTimeout(60);
    }
    assert.ok(saw2, 'a 2. személy is sorra került');
    await page.locator('.note-input').fill('Jól ment, a csípőm laza volt.');
    await page.getByRole('button', { name: 'Jegyzet mentése' }).click();
    await until(page, async () => ((await (await import('./js/ui/store.js')).itemsAll('workout'))[0] || {}).note === 'Jól ment, a csípőm laza volt.');
    const w = await page.evaluate(async () => (await (await import('./js/ui/store.js')).itemsAll('workout'))[0]);
    assert.ok(Array.isArray(w.done) && w.done.some(d => d.ex === 'cat_cow'), 'elvégzett gyakorlatok listája');
    assert.equal(w.partner, true);
    await go(page, '#/ex/cat_cow');
    assert.match(await text(), /Az előzményed/i);
    await go(page, '#/log');
    assert.match(await text(), /Jól ment, a csípőm laza volt/);
    await go(page, '#/more');
    assert.equal(await page.locator('.quick').count(), 4);
    assert.match(await text(), /Extrák/i);
    await go(page, '#/diag');
    assert.match(await text(), /Böngésző:/);
    await go(page, '#/qa');
    assert.match(await text(), /0 \/ 11 kipróbálva/);
    await page.evaluate(async () => { (await import('./js/ui/widgets.js')).setTick(15); });
  });

  await step('újramérés: a ciklusszámláló és cél megmarad, a gyengébb mérés csökkenti a szintet', async () => {
    const r = await page.evaluate(async () => {
      const s = await import('./js/ui/state.js');
      const p = await s.getProgram();
      await s.setProgram({ ...p, start: Date.now() - 50 * 86400000, cycleBase: 0, goalFocus: 'pull', levels: { ...p.levels, push: 4 } });
      const item = (await s.assessments())[0];
      const np = await s.programFromAssessment({ ...item, results: { ...item.results, pushup: 2 } });
      return { cycleBase: np.cycleBase, goal: np.goalFocus, push: np.levels.push };
    });
    assert.ok(r.cycleBase >= 1, 'ciklus: ' + r.cycleBase);
    assert.equal(r.goal, 'pull'); assert.equal(r.push, 0);
    await go(page, '#/program');
    assert.match(await text(), /A ciklus fókusza: Erő/);
  });

  await step('tárolás: megszakított import visszagördül, a sikeres import megmarad újratöltés után', async () => {
    const context = await browser.newContext(), p = await context.newPage();
    try {
      await p.goto(base); await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
      const r = await p.evaluate(async () => {
        const store = await import('./js/ui/store.js'), state = await import('./js/ui/state.js'), data = await import('./js/ui/data.js');
        const settings = { accepted: true, profile: { age: 34, sex: 'male' } };
        data.S.settings = settings; await store.kvSet('settings', settings);
        const a = await state.saveAssessment({ results: { pushup: 20, plank: 70 }, vitals: {} });
        await store.kvSet('old-key', 'megmarad');
        const before = await store.exportAll(); delete before.exported;
        const put = IDBObjectStore.prototype.put;
        let triggered = false, rejected = false;
        IDBObjectStore.prototype.put = function (...args) {
          const req = put.apply(this, args);
          if (this.name === 'items' && !triggered) {
            triggered = true; req.addEventListener('success', () => req.transaction.abort(), { once: true });
          }
          return req;
        };
        try { await store.restoreAll({ settings: { ...settings, lowImpact: true }, items: [{ ...a, id: 'replacement' }] }); }
        catch { rejected = true; }
        finally { IDBObjectStore.prototype.put = put; }
        const after = await store.exportAll(); delete after.exported;
        return { triggered, rejected, before, after, old: await store.kvGet('old-key'), status: store.storageStatus() };
      });
      assert.equal(r.triggered, true); assert.equal(r.rejected, true);
      assert.deepEqual(r.after, r.before); assert.equal(r.old, 'megmarad'); assert.equal(r.status.writeError, true);
      assert.match(await p.locator('#storage-notice').innerText(), /Egy mentés nem sikerült/);
      const saved = await p.evaluate(async () => {
        const s = await import('./js/ui/store.js'), a = (await s.itemsAll('assessment'))[0];
        await s.restoreAll({ settings: await s.kvGet('settings'), items: [{ ...a, id: 'restored' }] });
        return { item: await s.itemGet('restored'), old: await s.kvGet('old-key'), count: (await s.itemsAll()).length };
      });
      assert.equal(saved.old, null); assert.equal(saved.count, 1);
      await p.reload(); await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
      const roundtrip = await p.evaluate(async () => {
        const s = await import('./js/ui/store.js'), state = await import('./js/ui/state.js'), { D } = await import('./js/ui/data.js');
        const a = await s.itemGet('restored');
        D.norms.tests.pushup.male[1] = [1, 2, 3, 4];
        return { a, ev: state.evaluateItem(a) };
      });
      assert.deepEqual(roundtrip.a, saved.item);
      assert.deepEqual(roundtrip.ev, saved.item.scoring.evaluation);
    } finally { await context.close(); }
  });

  await step('memóriamód: állandó figyelmeztetés, fájlos import újratöltés és adatvesztés nélkül', async () => {
    const context = await browser.newContext();
    await context.addInitScript(() => Object.defineProperty(window, 'indexedDB', { get() { throw new Error('Letiltott tárhely'); } }));
    const p = await context.newPage(); p.on('dialog', d => d.accept());
    try {
      await p.goto(base); await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
      assert.match(await p.locator('#storage-notice').innerText(), /csak ideiglenesen/);
      assert.equal(await p.locator('#storage-notice').getByRole('button', { name: 'Mentés fájlba' }).isVisible(), true);
      const backup = { app: 'forma', version: 1, settings: { accepted: true, profile: { age: 34, sex: 'male' } }, items: [{ id: 'memory-a', kind: 'assessment', date: 1000, profile: { age: 34, sex: 'male' }, results: { pushup: 20 }, vitals: {} }] };
      let navigations = 0; p.on('request', req => { if (req.isNavigationRequest() && req.frame() === p.mainFrame()) navigations++; });
      await p.locator('input[type="file"]').setInputFiles({ name: 'mentes.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
      await p.waitForFunction(() => !document.getElementById('nav').hidden);
      await p.waitForTimeout(500); // a korábbi, 300 ms-os automatikus újratöltés is kiderülne
      assert.equal(navigations, 0);
      const a = await p.evaluate(async () => (await import('./js/ui/store.js')).itemGet('memory-a'));
      assert.equal(a.results.pushup, 20);
      assert.equal(await p.locator('#storage-notice').isVisible(), true);
      await p.getByRole('link', { name: 'Beállítások', exact: true }).click();
      await p.waitForFunction(() => document.documentElement.dataset.view === '#/settings');
      assert.equal(await p.locator('#storage-notice').isVisible(), true);
    } finally { await context.close(); }
  });

  await step('hibás cím: nem dől el az app', async () => {
    await page.evaluate(() => { location.hash = '#/ex/%E0%A4%A'; });
    await page.waitForTimeout(300);
    assert.match(await text(), /Nincs ilyen gyakorlat/);
  });

  await step('akadálymentesség (axe, WCAG 2 A/AA): a fő képernyőkön nincs hiba', async () => {
    const axe = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
    const found = [];
    for (const hash of ['#/more', '#/', '#/assess', '#/test/pushup', '#/test/deep_squat', '#/test/vitals', '#/result', '#/program', '#/session/mobility', '#/ex/squat', '#/log', '#/settings', '#/cardio', '#/check/strengthA', '#/ex/pull_up', '#/progress', '#/mini', '#/run', '#/review', '#/cooldown', '#/library', '#/routines', '#/custom', '#/posture', '#/test/reaction', '#/pulse', '#/challenge', '#/blocks', '#/report', '#/test/sway', '#/more', '#/diag', '#/qa']) {
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
