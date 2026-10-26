#!/usr/bin/env node
/* User journeys for AI configuration and checking generated flashcards before saving.
   Run after python3 parliamo/build.py: PW_CHROMIUM=/usr/bin/chromium node parliamo/tests/ai-setup-review.js */
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html; charset=utf-8', '.json':'application/json', '.js':'text/javascript', '.css':'text/css', '.webp':'image/webp', '.svg':'image/svg+xml', '.woff2':'font/woff2' };
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const file = path.join(root, pathname.endsWith('/') ? pathname + 'index.html' : pathname);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
(async () => {
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath:process.env.PW_CHROMIUM } : {});
    const context = await browser.newContext({ viewport:{ width:390, height:860 }, serviceWorkers:'block' });
    await context.addInitScript(() => localStorage.setItem('parliamo.v1', JSON.stringify({ onboarded:true, settings:{ lang:'en' } })));
    let requests = 0;
    await context.route('https://setup-test.workers.dev/**', async route => {
      const request = route.request();
      const headers = { 'access-control-allow-origin':'*', 'access-control-allow-headers':'content-type, x-app-key', 'access-control-allow-methods':'POST' };
      if (request.method() === 'OPTIONS') return route.fulfill({ status:204, headers });
      requests++;
      if (request.headers()['x-app-user']) { const ok = request.headers()['x-app-user'] === 'anna' && request.headers()['x-app-key'] === 'annajelszava'; return route.fulfill({ status:ok ? 200 : 401, headers, contentType:'application/json', body:JSON.stringify(ok ? { text:'ok' } : { error:'unauthorized' }) }); }
      if (request.headers()['x-app-key'] === 'noai') return route.fulfill({ status:503, headers, contentType:'application/json', body:JSON.stringify({ error:'no_ai_key' }) });
      return route.fulfill({ status:request.headers()['x-app-key'] === 'correct' ? 200 : 401, headers, contentType:'application/json', body:JSON.stringify({ text:'ok' }) });
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.waitForFunction(() => LESSONS.length > 0 && S.onboarded);
    await page.evaluate(() => go('tanar'));
    assert.match(await page.locator('[data-ai-status]').textContent(), /beállítás szükséges/);
    await page.click('[data-ai-setup]');
    await page.fill('#sProxy', 'https://unrelated.example.com');
    await page.fill('#sPass', 'wrong'); await page.click('#sAiSave');
    assert.match(await page.locator('#sAiMsg').textContent(), /Érvényes HTTPS/);
    assert.equal(requests, 0, 'unsupported server is rejected before sending credentials');
    await page.fill('#sProxy', 'https://setup-test.workers.dev'); await page.click('#sAiSave');
    await page.waitForFunction(() => !document.querySelector('#sAiSave').disabled);
    assert.match(await page.locator('#sAiMsg').textContent(), /Hibás belépőkód/);
    assert.doesNotMatch(await page.locator('[data-ai-status]').textContent(), /ellenőrizve/);
    await page.fill('#sPass', 'correct'); await page.click('#sAiSave');
    await page.waitForFunction(() => !document.querySelector('#sAiSave').disabled);
    assert.match(await page.locator('[data-ai-status]').textContent(), /ellenőrizve/);
    await page.click('#aiSetupBack');
    assert.match(await page.locator('[data-ai-status]').textContent(), /ellenőrizve/);
    console.log('✓ direct setup, address validation, failed authentication and verified success');

    /* A server deployed without a Claude key: the connection works for sync and reminders, AI points to the artifact. */
    await page.evaluate(() => openAISettings()); await page.fill('#sPass', 'noai'); await page.click('#sAiSave');
    await page.waitForFunction(() => !document.querySelector('#sAiSave').disabled);
    assert.match(await page.locator('#sAiMsg').textContent(), /szinkron és az emlékeztető/);
    assert.match(await page.locator('[data-ai-status]').textContent(), /AI nélkül/);
    assert.match(await page.evaluate(async () => { try { await proxySample()('x'); return ''; } catch (e) { return aiErr(e); } }), /artifact/);
    await page.click('#aiSetupBack');
    console.log('✓ server without a Claude key: connection accepted, AI explained');

    /* Multi-user server: user name + password; the name travels in its own header, a wrong password names both fields. */
    await page.evaluate(() => openAISettings()); await page.fill('#sUser', 'Anna'); await page.fill('#sPass', 'rossz-jelszo');
    await page.click('#sAiSave'); await page.waitForFunction(() => !document.querySelector('#sAiSave').disabled);
    assert.match(await page.locator('#sAiMsg').textContent(), /Hibás felhasználónév vagy jelszó/);
    await page.fill('#sPass', 'annajelszava'); await page.click('#sAiSave'); await page.waitForFunction(() => !document.querySelector('#sAiSave').disabled);
    assert.match(await page.locator('[data-ai-status]').textContent(), /ellenőrizve/);
    assert.deepEqual(await page.evaluate(() => [S.settings.user, proxyHeaders()['x-app-user']]), ['anna', 'anna']);
    await page.fill('#sUser', 'Anna Kiss'); await page.click('#sAiSave');
    assert.match(await page.locator('#sAiMsg').textContent(), /felhasználónév/);
    await page.evaluate(() => { S.settings.user = ''; save(); });
    await page.click('#aiSetupBack');
    console.log('✓ multi-user login: user name header, wrong password message, name validation');

    await page.evaluate(() => { S.settings.proxy=''; S.settings.pass=''; renderJournal(); });
    const draft = 'Yesterday I went to the cinema with my friends and we watched a funny film.';
    await page.fill('#jrText', draft); await page.click('[data-ai-setup]'); await page.click('#aiSetupBack');
    assert.equal(await page.locator('#jrText').inputValue(), draft, 'draft survives setup round trip');
    await page.evaluate(() => {
      JR.res = { corrected:'I went.', errors:[{ wrong:'I goed', right:'I went', why:'Rendhagyó ige.' }, { wrong:'in cinema', right:'to the cinema', hu:'moziba' }], words:[{ it:'a film', hu:'egy film' }] };
      document.querySelector('#jrRes').innerHTML=jrHtml(JR.res,JR.text); bindJrCards();
    });
    await page.click('#jrCards');
    assert.equal(await page.evaluate(() => ownList().length), 0, 'review does not save automatically');
    await page.click('#jrSaveCards');
    assert.match(await page.locator('#jrCardMsg').textContent(), /magyar jelentését/);
    assert.equal(await page.evaluate(() => ownList().length), 0, 'missing Hungarian meaning blocks saving');
    await page.locator('[data-jr-it]').nth(0).fill('I travelled');
    await page.locator('[data-jr-hu]').nth(0).fill('utaztam');
    await page.locator('[data-jr-select]').nth(1).uncheck(); await page.click('#jrSaveCards');
    assert.deepEqual(await page.evaluate(() => ownList().map(x => ({ it:x.it, hu:x.hu }))), [{ it:'I travelled', hu:'utaztam' }]);
    await page.click('[data-jw]'); await page.click('#jrCancelCards');
    assert.equal(await page.evaluate(() => ownList().length), 1, 'cancelling another suggestion saves nothing');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'mobile content fits the viewport');
    assert.deepEqual(errors, []);
    console.log('✓ journal draft preservation, editable card review, validation, selection and cancellation');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode=1; });
