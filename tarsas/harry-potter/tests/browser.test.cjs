'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { once } = require('node:events');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const { chromium } = require('playwright');
const { createQuizServer } = require('../server.cjs');
const executablePath = process.env.PW_CHROMIUM || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
test('mobile browser: solo, true two-device room, retained numeric input, escaping and reload recovery', async t => {
  const server = createQuizServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] }); t.after(() => browser.close());
  const base = 'http://127.0.0.1:' + server.address().port;
  const context = await browser.newContext({ viewport: { width: 320, height: 800 } });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base); await page.getByRole('button', { name: 'Kódos szoba létrehozása' }).waitFor();
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.getByRole('button', { name: 'Egyéni játék indítása' }).click();
  await page.locator('.question h2').waitFor();
  while (!(await page.locator('.result').count())) {
    if (await page.locator('button[data-answer]').count()) await page.locator('button[data-answer]').first().click();
    else { await page.locator('input[name="answer"]').fill('11'); await page.getByRole('button', { name: 'Beküldöm a tippem' }).click(); }
    await page.locator('[data-action="next"]').click();
  }
  await page.getByRole('button', { name: 'Új próbatétel' }).click();
  await page.locator('select[name="mode"]').selectOption('number');
  await page.locator('input[name="name"]').first().fill('<img src=x>');
  await page.getByRole('button', { name: 'Kódos szoba létrehozása' }).click();
  const code = await page.locator('.code').innerText();
  assert.equal(await page.locator('img[src="x"]').count(), 0);
  const guestContext = await browser.newContext({ viewport: { width: 390, height: 844 } }), guest = await guestContext.newPage();
  guest.on('pageerror', e => errors.push(e.message));
  await guest.goto(base + '/?room=' + code);
  await guest.locator('form[data-form="join"] input[name="name"]').fill('Ron');
  await guest.getByRole('button', { name: 'Csatlakozom' }).click();
  await page.getByRole('button', { name: 'Induljon a kvíz' }).click();
  await guest.locator('.question h2').waitFor();
  await guest.locator('input[name="answer"]').fill('123');
  await page.locator('input[name="answer"]').fill('11'); await page.getByRole('button', { name: 'Beküldöm a tippem' }).click();
  await guest.waitForTimeout(1600);
  assert.equal(await guest.locator('input[name="answer"]').inputValue(), '123', 'polling must not erase typed input');
  await guest.locator('input[name="answer"]').fill('11'); await guest.getByRole('button', { name: 'Beküldöm a tippem' }).click();
  await page.getByRole('heading', { name: 'Ranglista' }).waitFor();
  await page.reload(); await page.getByRole('heading', { name: 'Ranglista' }).waitFor();
  assert.match(await page.locator('.tally').innerText(), /1000 pont/);
  await page.getByRole('button', { name: 'Végeredmény' }).click();
  await guest.getByRole('heading', { name: 'Íme a végeredmény!' }).waitFor();
  assert(await guest.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(errors, []);
  await guest.screenshot({ path: '/tmp/harry-potter-results.png', fullPage: true });
});
test('Pages-like static hosting offers solo and server link without advertising an active room server', async t => {
  const root = path.resolve(__dirname, '..');
  const server = http.createServer((req, res) => {
    const file = req.url === '/' ? 'index.html' : req.url.slice(1);
    if (!['index.html', 'app.js', 'questions.js', 'style.css'].includes(file)) { res.writeHead(404).end(); return; }
    const mime = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html';
    res.writeHead(200, { 'Content-Type': mime }); res.end(fs.readFileSync(path.join(root, file)));
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] }); t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://127.0.0.1:' + server.address().port);
  await page.getByText('Ezen a címen az egyéni mód érhető el.', { exact: false }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Kódos szoba létrehozása' }).count(), 0);
  await page.screenshot({ path: '/tmp/harry-potter-home.png', fullPage: true });
  await page.getByRole('button', { name: 'Egyéni játék indítása' }).click();
  await page.locator('.question h2').waitFor();
});
