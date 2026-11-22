/* A megosztott #/ címen történő első indítás és a mentési hiba utáni újrapróba. */
const { chromium, webkit, devices } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png' };
const engine = process.env.FORMA_BROWSER === 'webkit' ? webkit : chromium;

async function fillOnboarding(page, url) {
  await page.goto(url);
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
  await page.getByRole('button', { name: 'Kezdjük el', exact: true }).click();
  await page.getByLabel('Életkor').fill('34');
  await page.getByText('Nő', { exact: true }).click();
  await page.getByRole('button', { name: 'Tovább', exact: true }).first().click();
  for (const q of await page.locator('fieldset.parq-q').all()) await q.getByText('Nem', { exact: true }).click();
  await page.locator('section.card:not([hidden])').getByRole('button', { name: 'Tovább', exact: true }).click();
  await page.getByText(/Megértettem: a Forma nem orvosi eszköz/).click();
}

(async () => {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const file = path.join(root, decodeURIComponent(url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (e, data) => { res.writeHead(e ? 404 : 200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' }); res.end(e ? undefined : data); });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await engine.launch({ executablePath: process.env.FORMA_BROWSER === 'webkit' ? undefined : (process.env.FORMA_CHROMIUM_PATH || undefined) });
    const base = `http://127.0.0.1:${server.address().port}/`;
    for (const hash of ['#/', '#/start', '']) {
      const ctx = await browser.newContext({ ...devices['iPhone 13'] });
      try {
        const page = await ctx.newPage(), errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await fillOnboarding(page, base + hash);
        await page.getByRole('button', { name: 'Kezdjük', exact: true }).click();
        await page.waitForFunction(() => !document.getElementById('nav').hidden && /Felmérés indítása/.test(document.getElementById('main').innerText), null, { timeout: 3000 });
        assert.match(await page.locator('#main').innerText(), /Felmérés indítása/);
        await page.reload();
        await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
        assert.equal(await page.locator('#nav').isVisible(), true, 'újratöltés után is megmarad a bevezetés');
        assert.deepEqual(errors, []);
        console.log(`ok   ${engine.name()}: első indítás ${hash || '(hash nélkül)'}, továbblépés és újratöltés`);
      } finally { await ctx.close(); }
    }
    const ctx = await browser.newContext({ ...devices['iPhone 13'] });
    try {
      const page = await ctx.newPage();
      await fillOnboarding(page, base + '#/');
      await page.evaluate(() => {
        const put = IDBObjectStore.prototype.put;
        window.restorePut = () => { IDBObjectStore.prototype.put = put; };
        IDBObjectStore.prototype.put = function (...args) {
          const req = put.apply(this, args);
          if (this.name === 'kv' && args[1] === 'settings') req.addEventListener('success', () => req.transaction.abort(), { once: true });
          return req;
        };
      });
      await page.getByRole('button', { name: 'Kezdjük', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: 'Nem sikerült menteni' }).waitFor();
      assert.equal(await page.locator('#nav').isVisible(), false);
      assert.equal(await page.getByRole('button', { name: 'Kezdjük', exact: true }).isEnabled(), true);
      assert.equal(await page.evaluate(async () => (await import('./js/ui/state.js')).settingsReady()), false);
      await page.evaluate(() => window.restorePut());
      await page.getByRole('button', { name: 'Kezdjük', exact: true }).click();
      await page.waitForFunction(() => !document.getElementById('nav').hidden);
      console.log(`ok   ${engine.name()}: sikertelen mentés látható, válaszok megmaradnak, újrapróba sikeres`);
    } finally { await ctx.close(); }
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
