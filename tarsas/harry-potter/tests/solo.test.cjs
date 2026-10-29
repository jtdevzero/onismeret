'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { once } = require('node:events');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const { chromium } = require('playwright');
const { questions } = require('../questions.js');
test('all film parts contain the three supported question types', () => {
  assert.equal(questions.length, 40);
  for (let film = 1; film <= 8; film++) {
    assert.deepEqual(questions.filter(q => q.film === film).map(q => q.type).sort(), ['choice', 'choice', 'choice', 'number', 'picture']);
  }
});
test('static solo game: filters, pictures, scoring, timeout, no API calls and mobile layout', async t => {
  const root = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const file = path.resolve(root, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (e, data) => {
      if (e) { res.writeHead(404).end(); return; }
      res.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp' }[path.extname(file)] || 'application/octet-stream' }); res.end(data);
    });
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 320, height: 844 } }), errors = [], api = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('request', r => { if (r.url().includes('/api/')) api.push(r.url()); });
  page.on('dialog', d => d.accept());
  const origin = 'http://127.0.0.1:' + server.address().port;
  await page.goto(origin);
  assert.equal(await page.getByRole('button', { name: 'Egyéni játék indítása' }).count(), 1);
  assert.equal(await page.locator('[data-mode="online"]').count(), 1, 'Shared mode is offered without contacting its API during solo play');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.locator('select[name="mode"]').selectOption('number');
  await page.getByRole('button', { name: 'Egyéni játék indítása' }).click();
  await page.locator('input[name="answer"]').fill('11'); await page.getByRole('button', { name: 'Beküldöm a tippem' }).click();
  assert.match(await page.locator('.stat').innerText(), /1000 pont/);
  await page.getByRole('button', { name: 'Végeredmény' }).click(); assert.equal(await page.locator('.result').innerText(), '1000 pont');
  await page.getByRole('button', { name: 'Új próbatétel' }).click();
  await page.locator('select[name="mode"]').selectOption('picture');
  await page.getByRole('button', { name: 'Egyéni játék indítása' }).click();
  await page.waitForFunction(() => document.querySelector('.illustration')?.naturalWidth > 0);
  await page.locator('[data-answer]').first().click(); await page.locator('[data-action="next"]').click();
  await page.getByRole('button', { name: 'Új próbatétel' }).click();
  await page.locator('select[name="mode"]').selectOption('mixed');
  for (const checkbox of await page.locator('input[name="film"]').all()) await checkbox.check();
  await page.locator('select[name="count"]').selectOption('40');
  await page.getByRole('button', { name: 'Egyéni játék indítása' }).click();
  const seen = new Set();
  for (let i = 0; i < 40; i++) {
    const question = await page.locator('.question h2').innerText(); assert(!seen.has(question)); seen.add(question);
    if (await page.locator('[data-answer]').count()) await page.locator('[data-answer]').first().click();
    else { await page.locator('input[name="answer"]').fill('3'); await page.getByRole('button', { name: 'Beküldöm a tippem' }).click(); }
    await page.locator('[data-action="next"]').click();
  }
  assert.equal(seen.size, 40); assert.equal(await page.locator('.result').count(), 1);
  await page.getByRole('button', { name: 'Új próbatétel' }).click();
  await page.clock.install();
  await page.getByRole('button', { name: 'Egyéni játék indítása' }).click();
  await page.clock.fastForward(31000);
  await page.locator('[data-action="next"]').waitFor(); assert.match(await page.locator('.stat').innerText(), /\+0 pont/);
  assert.deepEqual(api, []); assert.deepEqual(errors, []);
  await page.goto(origin); await page.screenshot({ path: '/tmp/harry-potter-solo.png', fullPage: true });
});
