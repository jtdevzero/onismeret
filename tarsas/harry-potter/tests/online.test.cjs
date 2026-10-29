'use strict';
// Run against the actual backend checkout, not a mocked room implementation:
// HP_BACKEND_ROOT=/path/to/maeste npm run test:hp
const test = require('node:test'), assert = require('node:assert/strict');
const http = require('node:http'), fs = require('node:fs/promises'), path = require('node:path');
const { existsSync } = require('node:fs');
const { once } = require('node:events');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const { questions } = require('../questions.js');
const backendRoot = process.env.HP_BACKEND_ROOT;

test('shared quiz: real separate-origin API, private answers, scoring, reconnect, invite and host control', {
  skip: !backendRoot && 'Set HP_BACKEND_ROOT to the Sites backend source checkout for shared-game integration tests.',
  timeout: 120000,
}, async t => {
  const prefix = '/tarsas/harry-potter/';
  const publicRoot = path.resolve(__dirname, '..');
  let local, apiOrigin;
  const requests = [], errors = [];
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (!url.pathname.startsWith(prefix)) { res.writeHead(404).end(); return; }
      const relative = url.pathname.slice(prefix.length) || 'index.html';
      const file = path.resolve(publicRoot, relative);
      if (!file.startsWith(publicRoot + path.sep)) { res.writeHead(403).end(); return; }
      let body = await fs.readFile(file);
      if (relative === 'index.html') {
        const html = body.toString();
        assert.match(html, /name="hp-api-origin"/);
        body = Buffer.from(html
          .replace(/(<meta\s+name="hp-api-origin"\s+content=")[^"]*(")/, `$1${apiOrigin}$2`)
          .replace(/connect-src[^;\"]*/, `connect-src 'self' ${apiOrigin}`));
      }
      res.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(body);
    } catch { res.writeHead(404).end(); }
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(async () => { await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }); });
  const frontendOrigin = `http://127.0.0.1:${server.address().port}`;
  const { startLocal } = await import(pathToFileURL(path.join(path.resolve(backendRoot), 'server/local.mjs')).href);
  local = await startLocal({ env: { MAESTE_DB_PATH: ':memory:', APP_ALLOWED_ORIGINS: frontendOrigin }, port: 0, hostname: '127.0.0.1', quiet: true });
  apiOrigin = `http://127.0.0.1:${local.port}`;
  local.server.on('request', req => requests.push({ method: req.method, path: new URL(req.url, apiOrigin).pathname, hasToken: !!req.headers['x-hp-token'], origin: req.headers.origin, preflight: req.headers['access-control-request-headers'] }));
  t.after(async () => { await new Promise(resolve => { local.server.close(resolve); local.server.closeAllConnections(); }); local.database.close(); });
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
  t.after(() => browser.close());
  const contexts = await Promise.all(Array.from({ length: 3 }, () => browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })));
  const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));
  for (const page of pages) { page.on('pageerror', error => errors.push(error.message)); page.setDefaultTimeout(10000); }
  const [host, guest, third] = pages;
  const open = (page, suffix = '') => page.goto(frontendOrigin + prefix + suffix, { waitUntil: 'networkidle' });
  const phase = (page, value) => page.locator(`#hp-phase[data-phase="${value}"]`).waitFor({ state: 'visible' });
  const getSession = page => page.evaluate(() => JSON.parse(localStorage.getItem('hp.online.session')));
  const state = async page => {
    const session = await getSession(page);
    const response = await fetch(`${apiOrigin}/api/hp/rooms/${session.code}`, { headers: { 'X-HP-Token': session.memberToken } });
    return response.json();
  };
  const answer = async (page, value) => {
    const number = page.locator('form[data-online-form="answer"] input[name="answer"]');
    if (await number.count()) {
      await number.fill(String(value));
      await page.locator('form[data-online-form="answer"] button[data-online-command]').click();
    } else await page.locator(`[data-online-answer="${value}"]`).click();
  };
  const currentAnswer = snapshot => {
    const canonical = questions.find(q => q.id === snapshot.question.id);
    return canonical.type === 'number' ? canonical.answer : snapshot.question.options.indexOf(canonical.options[canonical.answer]);
  };

  await open(host);
  assert.equal(requests.filter(r => r.path.startsWith('/api/hp')).length, 0, 'The solo homepage must not connect to the multiplayer API');
  await host.locator('[data-mode="online"]').click();
  const create = host.locator('form[data-online-form="create"]');
  await create.locator('input[name="name"]').fill('Anna');
  await create.locator('select[name="mode"]').selectOption('choice');
  await create.locator('select[name="count"]').selectOption('5');
  await create.locator('select[name="seconds"]').selectOption('60');
  await create.locator('button[data-online-command]').click();
  await phase(host, 'lobby');
  const code = (await host.locator('#hp-room-code').textContent()).trim();
  assert.match(code, /^[A-Z2-9]{8}$/);
  const hostSession = await getSession(host);
  assert.equal(host.url().includes(hostSession.memberToken), false, 'Participant capability never appears in the invitation URL');
  await open(guest, '?room=' + code);
  const join = guest.locator('form[data-online-form="join"]');
  await join.locator('input[name="name"]').fill('Bence');
  assert.equal(await join.locator('input[name="code"]').inputValue(), code);
  await join.locator('button[data-online-command]').click(); await phase(guest, 'lobby');
  await open(third); await third.locator('[data-mode="online"]').click();
  const joinThird = third.locator('form[data-online-form="join"]');
  await joinThird.locator('input[name="name"]').fill('Csilla'); await joinThird.locator('input[name="code"]').fill(code);
  await joinThird.locator('button[data-online-command]').click(); await phase(third, 'lobby');
  await host.waitForFunction(() => document.querySelectorAll('#hp-scoreboard .hp-player').length === 3);
  await host.locator('[data-online-action="start"]').click();
  await Promise.all(pages.map(page => phase(page, 'question')));
  const initial = await state(host);
  assert.equal(initial.players.length, 3);
  assert.equal('answer' in initial.question, false); assert.equal('explanation' in initial.question, false); assert.equal('reveal' in initial, false);
  assert.ok(requests.some(r => r.method === 'OPTIONS' && r.origin === frontendOrigin && r.preflight?.includes('x-hp-token')), 'Actual Chromium CORS preflight uses the participant header');
  const guestSession = await getSession(guest);
  const forbidden = await fetch(`${apiOrigin}/api/hp/rooms/${code}/reveal`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-HP-Token': guestSession.memberToken }, body: JSON.stringify({ round: initial.round }) });
  assert.equal(forbidden.status, 403, 'A guest cannot control host-only transitions');
  await guest.reload({ waitUntil: 'networkidle' }); await phase(guest, 'question');
  assert.equal((await state(guest)).question.id, initial.question.id, 'Reload restores the current shared question');
  await contexts[2].setOffline(true);
  await third.waitForTimeout(2400);
  assert.match(await third.locator('#hp-connection').textContent(), /offline|kapcsol|újra|internet/i);
  await contexts[2].setOffline(false);
  if (await third.locator('[data-online-action="retry"]').isVisible()) await third.locator('[data-online-action="retry"]').click();
  const solution = currentAnswer(initial);
  await answer(host, solution);
  const privateState = await state(guest);
  assert.equal(privateState.phase, 'question'); assert.equal('reveal' in privateState, false);
  assert.equal(privateState.players.some(player => 'answer' in player), false, 'Other participant answers stay private during the round');
  await answer(guest, (solution + 1) % 4); await answer(third, solution);
  await Promise.all(pages.map(page => phase(page, 'reveal')));
  const reveal = await state(host);
  assert.equal(reveal.players.find(player => player.name === 'Anna').score, 1000);
  assert.equal(reveal.players.find(player => player.name === 'Bence').score, 0);
  assert.equal(reveal.players.find(player => player.name === 'Csilla').score, 1000);
  assert.equal(reveal.reveal.answer, solution);
  await guest.reload({ waitUntil: 'networkidle' }); await phase(guest, 'reveal');
  assert.equal((await state(guest)).players.find(player => player.name === 'Anna').score, 1000, 'Restoring reveal must not double-apply points');
  for (const page of pages) assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Shared mode fits a 390px phone');

  // First-film choice filter contains only three questions. Complete every round.
  let current = reveal;
  while (current.round + 1 < current.total) {
    await host.locator('[data-online-action="next"]').click(); await Promise.all(pages.map(page => phase(page, 'question')));
    current = await state(host); const correct = currentAnswer(current);
    await Promise.all(pages.map(page => answer(page, correct)));
    await Promise.all(pages.map(page => phase(page, 'reveal'))); current = await state(host);
  }
  await host.locator('[data-online-action="next"]').click(); await Promise.all(pages.map(page => phase(page, 'end')));
  const final = await state(host);
  assert.equal(final.players.find(player => player.name === 'Anna').score, final.total * 1000);
  assert.equal(final.players.find(player => player.name === 'Bence').score, (final.total - 1) * 1000);
  assert.deepEqual(errors, []);
  await host.screenshot({ path: '/tmp/harry-potter-online.png', fullPage: true });

  // Polling must not destroy an unfinished number answer or move keyboard focus.
  const numericContexts = await Promise.all([browser.newContext({ viewport: { width: 320, height: 844 } }), browser.newContext({ viewport: { width: 390, height: 844 } })]);
  const [numberHost, numberGuest] = await Promise.all(numericContexts.map(ctx => ctx.newPage()));
  for (const page of [numberHost, numberGuest]) { page.setDefaultTimeout(10000); page.on('pageerror', error => errors.push(error.message)); }
  await open(numberHost); await numberHost.locator('[data-mode="online"]').click();
  const numericCreate = numberHost.locator('form[data-online-form="create"]');
  await numericCreate.locator('input[name="name"]').fill('Nóra');
  await numericCreate.locator('select[name="mode"]').selectOption('number'); await numericCreate.locator('select[name="seconds"]').selectOption('60');
  await numericCreate.locator('button[data-online-command]').click(); await phase(numberHost, 'lobby');
  const numericCode = (await numberHost.locator('#hp-room-code').textContent()).trim();
  await open(numberGuest, '?room=' + numericCode);
  const numericJoin = numberGuest.locator('form[data-online-form="join"]');
  await numericJoin.locator('input[name="name"]').fill('Dávid'); await numericJoin.locator('button[data-online-command]').click(); await phase(numberGuest, 'lobby');
  await numberHost.waitForFunction(() => document.querySelectorAll('#hp-scoreboard .hp-player').length === 2);
  await numberHost.locator('[data-online-action="start"]').click(); await Promise.all([phase(numberHost, 'question'), phase(numberGuest, 'question')]);
  const numericState = await state(numberHost), numericSolution = currentAnswer(numericState);
  const input = numberGuest.locator('form[data-online-form="answer"] input[name="answer"]');
  await input.fill(String(numericSolution)); await input.focus(); await numberGuest.waitForTimeout(2400);
  assert.equal(await input.inputValue(), String(numericSolution)); assert.equal(await input.evaluate(element => document.activeElement === element), true);
  await answer(numberHost, numericSolution + 2); await numberGuest.locator('form[data-online-form="answer"] button[data-online-command]').click();
  await Promise.all([phase(numberHost, 'reveal'), phase(numberGuest, 'reveal')]);
  const numericReveal = await state(numberGuest);
  assert.equal(numericReveal.players.find(player => player.name === 'Nóra').score, 333);
  assert.equal(numericReveal.players.find(player => player.name === 'Dávid').score, 1000);
  assert.ok(await numberHost.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Numeric shared mode fits a 320px phone');
  assert.deepEqual(errors, []);
});
