/* Fókusznézet: látható vezérlés kis kijelzőn, statikus előnézet és csökkentett mozgás. */
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
const engine = process.env.FORMA_BROWSER === 'webkit' ? webkit : chromium;

(async () => {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.join(root, pathname.endsWith('/') ? pathname + 'index.html' : pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (e, data) => { res.writeHead(e ? 404 : 200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }); res.end(e ? undefined : data); });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await engine.launch({ executablePath: process.env.FORMA_BROWSER === 'webkit' ? undefined : (process.env.FORMA_CHROMIUM_PATH || undefined) });
    const page = await browser.newPage({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
    // Vasárnapi történet: a heti áttekintés a futtatás napjától függetlenül tesztelhető.
    await page.addInitScript(fixed => {
      const NativeDate = Date;
      window.Date = class extends NativeDate {
        constructor(...args) { super(...(args.length ? args : [fixed])); }
        static now() { return fixed; }
      };
    }, new Date(2026, 10, 22, 12).getTime());
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/#/`);
    await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
    await page.evaluate(async () => {
      const data = await import('./js/ui/data.js'), state = await import('./js/ui/state.js'), store = await import('./js/ui/store.js');
      await data.saveSettings({ accepted: true, profile: { age: 34, sex: 'female' } });
      const a = await state.saveAssessment({ results: { pushup: 20, plank: 70, deep_squat: 2, shoulder_reach: 2, ankle_wall: 9, sl_stance: 7 }, vitals: {} });
      await state.programFromAssessment(a);
      await store.itemPut({ id: 'focus-workout', kind: 'workout', date: Date.now(), minutes: 20, key: 'strengthA' });
    });
    const malformed = await page.evaluate(async () => {
      const { D } = await import('./js/ui/data.js'), { figureStrip } = await import('./js/ui/figure.js');
      return Object.entries(D.figures).filter(([, spec]) => /NaN|Infinity|undefined/.test(figureStrip(spec).innerHTML)).map(([id]) => id);
    });
    assert.deepEqual(malformed, [], 'minden gyakorlat sziluettje érvényes SVG');
    const go = async hash => {
      await page.evaluate(h => { location.hash = h; }, hash);
      await page.waitForFunction(h => document.documentElement.dataset.view === h, hash);
      await page.waitForTimeout(200);
    };
    await go('#/program'); await go('#/');
    assert.equal(await page.locator('.hero .btn.primary').count(), 1, 'egy kiemelt művelet a kezdőlapon');
    assert.equal(await page.locator('.hero .btn').count(), 1, 'a Program a menüből érhető el');
    assert.equal(await page.locator('.home-summary').count(), 1);
    assert.equal(await page.locator('.home-summary[open]').count(), 0);
    await page.locator('.home-summary > summary').click();
    await page.locator('.home-summary').getByRole('button', { name: 'Rendben', exact: true }).click();
    await page.locator('.home-summary').waitFor({ state: 'detached' });

    for (const [width, height] of [[320, 568], [375, 667], [393, 852], [844, 390]]) {
      await page.setViewportSize({ width, height });
      await go('#/program'); await go('#/session/strengthA');
      const button = await page.getByRole('button', { name: 'Indítás', exact: true }).boundingBox();
      const nav = await page.locator('#nav').boundingBox();
      assert.ok(button && button.y >= 0 && button.y + button.height <= nav.y, `${width}×${height}: a fő gomb elfér az alsó menü fölött`);
      assert.match(await page.locator('#main').innerText(), /Szédülés vagy mellkasi panasz/);
      assert.equal(await page.locator('.next-preview .fig-shirt').count(), 1, 'képes előnézet a következő mozdulatról');
      const preview = await page.locator('.next-preview svg').evaluate(e => e.innerHTML);
      await page.waitForTimeout(700);
      assert.equal(await page.locator('.next-preview svg').evaluate(e => e.innerHTML), preview, 'az előnézet nem animál');
    }
    console.log(`ok   ${engine.name()}: egy fő kezdőlapi művelet, négy kijelzőn látható edzésvezérlés, statikus előnézet`);

    await page.setViewportSize({ width: 320, height: 568 });
    await go('#/program'); await go('#/session/strengthA');
    for (let i = 0; i < 60 && !(await page.locator('.workout-clock.reps').count()); i++) {
      const rest = page.getByRole('button', { name: 'Pihenő kihagyása' });
      if (await rest.count()) await rest.click();
      else await page.getByRole('button', { name: 'Kész, tovább' }).click();
    }
    assert.equal(await page.locator('.workout-clock.reps').count(), 1);
    for (const size of ['normal', 'large']) {
      await page.evaluate(s => { document.documentElement.dataset.size = s; }, size);
      const widths = await page.evaluate(() => [document.documentElement.clientWidth, document.documentElement.scrollWidth]);
      assert.ok(widths[1] <= widths[0] + 1, size + ': az ismétlésszám sem okoz vízszintes túlcsordulást');
    }
    await page.evaluate(() => { delete document.documentElement.dataset.size; });
    console.log(`ok   ${engine.name()}: ismétléses nézet normál és nagy betűmérettel, 320 px-en`);

    /* Valóban több képkockás ábrán ellenőrizzük a mozgást és annak élő kikapcsolását. */
    await go('#/ex/push_full');
    const figure = page.locator('.fig-live.big svg.fig-anim');
    const moving = await figure.evaluate(e => e.innerHTML);
    await page.waitForFunction(before => document.querySelector('.fig-live.big svg.fig-anim').innerHTML !== before, moving);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(100);
    const still = await figure.evaluate(e => e.innerHTML);
    await page.waitForTimeout(900);
    assert.equal(await figure.evaluate(e => e.innerHTML), still);
    await go('#/program'); await go('#/session/strengthA');
    assert.equal(await page.locator('.workout-focus').evaluate(e => getComputedStyle(e).animationName), 'none');
    await page.evaluate(async () => (await import('./js/ui/widgets.js')).celebrate());
    assert.equal(await page.locator('.celebration').count(), 0);
    assert.deepEqual(errors, []);
    console.log(`ok   ${engine.name()}: csökkentett mozgásnál álló ábra, nincs belépő animáció vagy ünneplő réteg`);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
