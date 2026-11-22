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
    browser = await engine.launch();
    const page = await browser.newPage({ viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' });
    const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
    const base = `http://127.0.0.1:${server.address().port}/`;
    await page.goto(base); await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
    await page.evaluate(async () => {
      const data = await import('./js/ui/data.js'), state = await import('./js/ui/state.js');
      await data.saveSettings({ accepted: true, profile: { age: 34, sex: 'female' }, nickname: 'Próba' });
      const a = await state.saveAssessment({ results: { pushup: 20, plank: 70, deep_squat: 2, shoulder_reach: 2, ankle_wall: 9, sl_stance: 7 }, vitals: {} }); await state.programFromAssessment(a);
    });
    const go = async hash => { await page.evaluate(h => { location.hash = h; }, hash); await page.waitForFunction(h => document.documentElement.dataset.view === h, hash); };
    await go('#/prepare/strengthA.quick10');
    assert.ok(await page.locator('.session-preview svg').count() >= 4);
    await page.getByRole('link', { name: 'Edzés indítása', exact: true }).click();
    await page.waitForFunction(() => !!document.querySelector('.workout-clock'));
    const seconds = text => text.split(':').reduce((a, b) => a * 60 + Number(b), 0);
    const full = seconds(await page.locator('.workout-clock').first().innerText());
    await page.getByRole('button', { name: 'Indítás', exact: true }).click();
    await page.waitForTimeout(1200);
    const before = seconds(await page.locator('.workout-clock').first().innerText());
    assert.ok(before < full);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    await page.waitForTimeout(1200);
    const background = await page.evaluate(async () => (await import('./js/ui/store.js')).kvGet('activeSession'));
    assert.ok(background.left < full && background.left > 0);
    await page.evaluate(() => { delete document.hidden; });
    await page.reload(); await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
    assert.match(await page.locator('#main').innerText(), /Félbehagyott edzés/);
    await page.getByRole('link', { name: 'Edzés folytatása', exact: true }).click();
    await page.waitForFunction(() => !!document.querySelector('.workout-clock'));
    const resumed = await page.locator('.workout-clock').first().innerText();
    await page.waitForTimeout(1200);
    assert.equal(await page.locator('.workout-clock').first().innerText(), resumed, 'újratöltés után szünetel');
    await page.getByRole('button', { name: 'Kész, tovább', exact: true }).click();
    const position = await page.evaluate(async () => (await import('./js/ui/store.js')).kvGet('activeSession'));
    assert.equal(position.at, 1);
    await page.reload(); await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
    assert.match(await page.locator('.session-progress').innerText(), /2 \/ /);
    console.log('ok   lépés és hátralévő idő megmarad, háttérben és újratöltés után nem fut tovább');

    const programBefore = await page.evaluate(async () => (await import('./js/ui/state.js')).getProgram());
    await page.evaluate(() => {
      const put = IDBObjectStore.prototype.put;
      window.restorePut = () => { IDBObjectStore.prototype.put = put; };
      IDBObjectStore.prototype.put = function (...args) {
        const req = put.apply(this, args);
        if (this.name === 'items' && args[0]?.kind === 'workout') req.addEventListener('success', () => req.transaction.abort(), { once: true });
        return req;
      };
    });
    await page.getByRole('button', { name: 'Befejezés most', exact: true }).click();
    await page.getByRole('button', { name: 'Mentés újra', exact: true }).waitFor();
    const failed = await page.evaluate(async () => { const s = await import('./js/ui/store.js'); return { p: await s.kvGet('program'), w: await s.itemsAll('workout'), draft: await s.kvGet('activeSession') }; });
    assert.deepEqual(failed.p, programBefore); assert.equal(failed.w.length, 0); assert.ok(failed.draft);
    await page.evaluate(() => window.restorePut());
    await page.getByRole('button', { name: 'Mentés újra', exact: true }).click();
    await page.getByText('Edzés kész', { exact: true }).waitFor();
    const saved = await page.evaluate(async () => { const s = await import('./js/ui/store.js'); return { p: await s.kvGet('program'), w: await s.itemsAll('workout'), draft: await s.kvGet('activeSession') }; });
    assert.equal(saved.p.done, programBefore.done); assert.equal(saved.w.length, 1); assert.equal(saved.draft, null);
    assert.equal(saved.w[0].partial, true); assert.equal(saved.w[0].done.length, 1);
    await page.evaluate(async ({ item, p }) => { const s = await import('./js/ui/store.js'); await s.completeSession(item, { ...p, done: 999 }, s.storageEpoch()); }, { item: saved.w[0], p: saved.p });
    assert.equal(await page.evaluate(async () => (await (await import('./js/ui/store.js')).kvGet('program')).done), programBefore.done);
    const resurrected = await page.evaluate(async id => { const s = await import('./js/ui/store.js'); return s.checkpointSession({ id, version: 1 }, s.storageEpoch()); }, saved.w[0].id);
    assert.equal(resurrected, false, 'lezárt edzés késői checkpointja sem támasztja fel a draftot');
    console.log('ok   megszakadt mentés visszagördül, újrapróba idempotens, részleges edzés nem léptet programot');
    await page.getByText('Hogy esett? (nem kötelező)', { exact: true }).click();
    await page.getByLabel('Terhelés', { exact: true }).selectOption('hard');
    await page.getByLabel('Fájdalom', { exact: true }).selectOption('yes');
    await page.getByLabel('Közérzet utána', { exact: true }).selectOption('better');
    await page.getByRole('button', { name: 'Visszajelzés mentése', exact: true }).click();
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent === 'Visszajelzés mentése' && b.disabled));
    await go('#/log'); await page.getByRole('searchbox').fill('fájdalom volt');
    assert.match(await page.locator('#main').innerText(), /jobb közérzet/);
    await page.getByRole('searchbox').fill('nincsilyen'); assert.match(await page.locator('#main').innerText(), /Nincs találat/);
    await go('#/routines'); await page.getByRole('button', { name: 'Kitűzés: Reggeli ébresztő', exact: true }).click();
    await page.getByRole('button', { name: 'Kitűzve a kezdőlapra', exact: true }).waitFor();
    await go('#/'); assert.match(await page.locator('#main').innerText(), /Szia, Próba/); assert.match(await page.locator('#main').innerText(), /Kitűzött rutin/i);
    await go('#/library'); await page.getByRole('button', { name: 'Erő', exact: true }).click();
    assert.ok(await page.locator('.lib svg').count() > 0);
    await go('#/progress'); await page.getByLabel('Mérési terület').selectOption('strength');
    await page.getByLabel('Mért teszt').selectOption('pushup'); assert.equal(await page.locator('.measurement-chart circle').count(), 1);
    console.log('ok   visszajelzés kereshető, kitűzés és becenév megmarad, képes tár és nyers trend működik');

    const storage = await page.evaluate(async () => {
      const s = await import('./js/ui/store.js'), data = await import('./js/ui/data.js');
      const epoch = s.storageEpoch(), backup = await s.exportAll();
      await s.restoreAll(backup);
      const stale = await s.checkpointSession({ version: 1, stale: true }, epoch);
      const put = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function (...args) { if (this.name === 'kv' && args[1] === 'settings') throw new DOMException('full', 'QuotaExceededError'); return put.apply(this, args); };
      const before = structuredClone(data.S.settings); let rejected = false;
      try { await data.saveSettings({ nickname: 'Nem menthető' }); } catch { rejected = true; } finally { IDBObjectStore.prototype.put = put; }
      return { stale, active: await s.kvGet('activeSession'), rejected, same: JSON.stringify(data.S.settings) === JSON.stringify(before) };
    });
    assert.deepEqual(storage, { stale: false, active: null, rejected: true, same: true });
    console.log('ok   import után régi edzés nem támasztható fel, tárhelyhiba nem módosítja a memóriabeli beállítást');
    const upgrade = await page.evaluate(async () => {
      await new Promise((resolve, reject) => { const r = indexedDB.open('forma', 2); r.onsuccess = () => { r.result.close(); resolve(); }; r.onerror = () => reject(r.error); });
      const s = await import('./js/ui/store.js'); await s.kvGet('settings');
      const count = await new Promise((resolve, reject) => { const r = indexedDB.open('forma', 2); r.onerror = () => reject(r.error); r.onsuccess = () => { const db = r.result, tx = db.transaction('items', 'readonly'), req = tx.objectStore('items').count(); tx.oncomplete = () => { db.close(); resolve(req.result); }; }; });
      return { mode: s.storageStatus().mode, count };
    });
    assert.equal(upgrade.mode, 'memory'); assert.ok(upgrade.count >= 2, 'újabb adatbázis-verzió adatait nem törli');
    console.log('ok   másik ablak verzióváltását elengedi, az újabb adatbázist nem írja felül');
    assert.deepEqual(errors, []);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
