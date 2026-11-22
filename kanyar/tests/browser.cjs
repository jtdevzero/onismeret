/* Böngészős végpontteszt (Playwright, mobil nézet). A pózbecslést szintetikus adatokra cseréljük, hogy a teszt
   determinisztikus legyen; a valódi pózbecslőt a tests/pose-smoke.cjs próbálja ki.
   Futtatás: node kanyar/tests/browser.cjs   (képernyőképek: KANYAR_SHOTS=mappa) */
const { chromium, devices } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const SHOTS = process.env.KANYAR_SHOTS;

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

/* A lapon belül: a pózbecslő lecserélése szintetikus idősorra. kind: 'ski-side-backseat' | 'ski-front' | 'squat' | 'none' */
async function fakePose(page, kind) {
  await page.evaluate(async kind => {
    const w = await import('./js/ui/widgets.js'), s = await import('./tests/synth.mjs');
    const make = {
      'ski-side-backseat': () => s.series(10, () => ({ view: 'side', shin: 5, thigh: 60, torso: 30 })),
      'ski-front': () => s.series(15, t => ({ legTilt: 15 * s.wave(t, 3), torsoTilt: 15 * s.wave(t, 3) })),
      squat: () => s.series(15.5, t => ({ flex: 55 - 50 * Math.cos(2 * Math.PI * t / 3), stance: 0.2, kneeW: 0.24 - 0.12 * ((55 - 50 * Math.cos(2 * Math.PI * t / 3)) / 105) })),
      none: () => s.series(8, () => ({ vis: 0.1 })),
    }[kind];
    w.setRunner({
      analyzeVideo: async (_blob, onProgress) => { onProgress(0.5); onProgress(1); return { frames: make(), aspect: 1, duration: 10, seconds: 0.1 }; },
      captureFrames: async () => [],
    });
  }, kind);
}
const upload = page => page.setInputFiles('input[type=file]', { name: 'teszt.mp4', mimeType: 'video/mp4', buffer: Buffer.from('nem valódi videó') });
const shown = (page, hash) => page.waitForFunction(h => document.documentElement.dataset.view === h, hash);
const go = async (page, hash) => { await page.evaluate(h => { if (location.hash === h) dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = h; }, hash); await page.waitForTimeout(50); await shown(page, hash); };

(async () => {
  const srv = await serve(), base = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices['Pixel 7'] });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', m => { if (m.type() === 'error' && !/teszt\.mp4|blob:|Failed to load resource|camera_denied/.test(m.text())) problems.push('console: ' + m.text()); });
  page.on('pageerror', e => problems.push('pageerror: ' + e.message));
  let n = 0;
  const shot = async name => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, String(++n).padStart(2, '0') + '-' + name + '.png'), fullPage: true }); };
  const text = () => page.locator('#main').innerText();
  const step = async (name, fn) => { try { await fn(); console.log('ok   ' + name); } catch (e) { console.log('FAIL ' + name + '\n     ' + (e.message || e).split('\n')[0]); process.exitCode = 1; await shot('fail-' + n); } };

  await page.goto(base);
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1');

  await step('első indítás: elfogadás nélkül nem lehet továbblépni, utána a kezdőlap jön', async () => {
    assert.match(await text(), /Mit űzöl\?/);
    assert.equal(await page.locator('#nav').isVisible(), false);
    await go(page, '#/snow');
    assert.match(await text(), /Mit űzöl\?/, 'beállítás nélkül minden út a kezdőképernyőre visz');
    assert.equal(await page.getByRole('button', { name: 'Kezdjük' }).isDisabled(), true);
    await shot('start');
    await page.getByText('Megértettem és elfogadom.').click();
    await page.getByRole('button', { name: 'Kezdjük' }).click();
    await page.waitForFunction(() => /Kezdd a mozgásfelméréssel/.test(document.getElementById('main').innerText));
    assert.equal(await page.locator('#nav').isVisible(), true);
    await shot('home');
  });

  await step('havas elemzés oldalról: hátraülést talál, gyakorlatot ajánl, a napló megőrzi', async () => {
    await go(page, '#/snow');
    await fakePose(page, 'ski-side-backseat');
    await shot('snow-form');
    await upload(page);
    await page.waitForFunction(() => (document.documentElement.dataset.view || '').startsWith('#/a/'));
    await page.waitForFunction(() => /Visszajelzés/.test(document.getElementById('main').innerText));
    const t = await text();
    assert.match(t, /Hátraülsz/);
    assert.match(t, /Sípcsont a cipő nyelvén/);
    assert.match(t, /Helyi elemzés/);
    assert.match(t, /Ebből a nézetből nem mérhető/);
    await shot('analysis');
    await page.getByRole('link', { name: 'Sípcsont a cipő nyelvén' }).click();
    await shown(page, '#/l/drill_shin_pressure');
    assert.match(await text(), /Így gyakorold/);
    await go(page, '#/log');
    assert.match(await text(), /Hátraülsz/);
  });

  await step('filmező mód: jelzi a keretezést, a rövid felvételt elutasítja, a jót elemzi', async () => {
    await go(page, '#/snow');
    await fakePose(page, 'ski-side-backseat');
    await page.evaluate(async () => {
      const w = await import('./js/ui/widgets.js');
      window.__film = { check: { ok: false, reason: 'too_far' }, closed: 0 };
      w.setRunner({ tick: 4, openFilmCamera: async () => ({ el: null, frameCheck: () => window.__film.check, start() {}, stop: async () => new Blob(['felvétel'], { type: 'video/webm' }), close() { window.__film.closed++; } }) });
    });
    await page.getByRole('button', { name: 'Felvétel az appban' }).click();
    await page.waitForFunction(() => /Túl messze van/.test(document.querySelector('.film-frame')?.textContent || ''));
    await page.evaluate(() => { window.__film.check = { ok: true, reason: null }; });
    await page.waitForFunction(() => /Jó a keret/.test(document.querySelector('.film-frame')?.textContent || ''));
    await shot('film');
    /* túl rövid felvétel (valós idejű órával, hogy a leállítás biztosan 5 mp előtt jöjjön) */
    await page.evaluate(async () => { const w = await import('./js/ui/widgets.js'); w.setRunner({ tick: 1000 }); });
    await page.getByRole('button', { name: 'Felvétel indítása' }).click();
    await page.getByRole('button', { name: 'Leállítás és elemzés' }).click();
    await page.waitForFunction(() => /A felvétel túl rövid/.test(document.getElementById('main').innerText));
    assert.equal(await page.evaluate(() => window.__film.closed), 1, 'a kamera leáll');
    assert.equal(await page.evaluate(() => location.hash), '#/snow');
    /* elég hosszú felvétel: elemzés lesz belőle */
    await page.evaluate(async () => { const w = await import('./js/ui/widgets.js'); w.setRunner({ tick: 4 }); });
    await page.getByRole('button', { name: 'Felvétel az appban' }).click();
    await page.getByRole('button', { name: 'Felvétel indítása' }).click();
    /* a felgyorsított órával a felvétel a 45 mp-es felső határnál magától leáll, és indul az elemzés */
    await page.waitForFunction(() => (document.documentElement.dataset.view || '').startsWith('#/a/'));
    assert.equal(await page.evaluate(() => window.__film.closed), 2, 'a kamera a második felvétel után is leáll');
    assert.match(await text(), /Hátraülsz/);
    await page.evaluate(async () => { const w = await import('./js/ui/widgets.js'); w.setRunner({ tick: 1000 }); });
  });

  await step('rosszul megadott nézet: jelzi, és a tárolt testpontokból újraszámolja', async () => {
    await go(page, '#/snow');
    await fakePose(page, 'ski-side-backseat');
    await page.getByText('Szemből', { exact: true }).click();
    await upload(page);
    await page.waitForFunction(() => (document.documentElement.dataset.view || '').startsWith('#/a/'));
    let t = await text();
    assert.match(t, /Biztos jó a megadott nézet\?/);
    assert.doesNotMatch(t, /Hátraülsz/, 'rossz nézettel a hátraülés nem látszik');
    await shot('view-mismatch');
    await page.getByRole('button', { name: 'Újraszámolás oldalnézetként' }).click();
    await page.waitForFunction(() => /Hátraülsz/.test(document.getElementById('main').innerText));
    t = await text();
    assert.doesNotMatch(t, /Biztos jó a megadott nézet\?/);
    assert.match(t, /Nézet: oldalról/);
  });

  await step('követhetetlen felvétel: nincs elemzés, filmezési tanácsot ad', async () => {
    await go(page, '#/snow');
    await fakePose(page, 'none');
    await upload(page);
    await page.waitForFunction(() => /Nem tudtam követni/.test(document.getElementById('main').innerText));
    assert.equal(await page.evaluate(() => location.hash), '#/snow');
  });

  await step('nem videófájl: elutasítja', async () => {
    await page.setInputFiles('input[type=file]', { name: 'kep.png', mimeType: 'image/png', buffer: Buffer.from('x') });
    await page.waitForFunction(() => /Ez nem videófájl/.test(document.getElementById('main').innerText));
  });

  await step('mély guggolás teszt: ismétlést számol, a beeső térdet jelzi, a profil frissül', async () => {
    await go(page, '#/ex/deep_squat');
    await fakePose(page, 'squat');
    await upload(page);
    await page.waitForFunction(() => /5 ismétlés/.test(document.getElementById('main').innerText));
    const t = await text();
    assert.match(t, /Térdek kifelé[\s\S]*Javítandó/);
    assert.match(t, /A havon/i);
    await shot('exercise-result');
    await go(page, '#/prep');
    const p = await text();
    assert.match(p, /Eddig 1 \/ 8 készült el/);
    assert.match(p, /térdkontroll/);
    await shot('prep');
  });

  await step('élő számlálás: visszaszámlál, élőben számolja az ismétléseket, a végén értékel és naplóz', async () => {
    await go(page, '#/ex/squat');
    await page.evaluate(async () => {
      const w = await import('./js/ui/widgets.js'), s = await import('./tests/synth.mjs');
      const flex = t => 55 - 50 * Math.cos(2 * Math.PI * t / 3);
      /* 2 mp visszaszámlálás, utána 5 guggolás; a képkockák gyorsítva érkeznek */
      const frames = s.series(17.5, t => ({ flex: t < 2 ? 5 : flex(t - 2), stance: 0.2, kneeW: 0.24 }));
      let i = 0, open = true;
      window.__liveSeen = [];
      w.setRunner({ countdown: 2, openCamera: async () => ({ el: null, aspect: 1, read: async () => { await new Promise(r => setTimeout(r, 2)); const c = document.querySelector('.live-count'); if (c) window.__liveSeen.push(c.textContent); return open && i < frames.length ? frames[i++] : null; }, close: () => { open = false; window.__liveClosed = true; } }) });
    });
    await page.getByRole('button', { name: 'Élő számlálás kamerával' }).click();
    await page.waitForFunction(() => /5 ismétlés/.test(document.getElementById('main').innerText));
    const seen = await page.evaluate(() => [...new Set(window.__liveSeen)]);
    for (const v of ['2', '1', '3', '4', '5']) assert.ok(seen.includes(v), 'a kijelzőn megjelent: ' + v + ' (' + seen.join(',') + ')');
    assert.equal(await page.evaluate(() => window.__liveClosed), true, 'a kamera leáll');
    assert.match(await text(), /Mélység[\s\S]*Rendben/);
    assert.equal(await page.locator('.live-stage').isVisible(), false);
    await shot('live-result');
    /* kamera nélkül érthető hibaüzenet */
    await page.evaluate(async () => { const w = await import('./js/ui/widgets.js'); w.setRunner({ openCamera: async () => { throw Object.assign(new Error('camera_denied'), { code: 'camera_denied' }); } }); });
    await page.getByRole('button', { name: 'Élő számlálás kamerával' }).click();
    await page.waitForFunction(() => /Nem kaptam engedélyt a kamerához/.test(document.getElementById('main').innerText));
  });

  await step('program: a gyenge térdkontroll miatt ugrások nélkül készül, az edzés kipipálható', async () => {
    await go(page, '#/prep');
    await page.getByRole('button', { name: 'Program készítése' }).click();
    await shown(page, '#/program');
    const t = await text();
    assert.match(t, /ugrások nélkül/);
    assert.match(t, /1\. hét/);
    assert.doesNotMatch(t, /Guggolásból felugrás|Korcsolyázó szökdelés/);
    await page.locator('.session-head input').first().check();
    /* naptárfájl: három nap kell; utána letölthető, 18 eseménnyel */
    await page.locator('.day-pick input').nth(1).check();
    await page.getByRole('button', { name: 'Naptárfájl letöltése' }).click();
    assert.match(await text(), /Pontosan három napot válassz/);
    await page.locator('.day-pick input').nth(1).uncheck();
    const [cal] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Naptárfájl letöltése' }).click()]);
    assert.equal(cal.suggestedFilename(), 'kanyar-edzesterv.ics');
    const icsText = fs.readFileSync(await cal.path(), 'utf8');
    assert.equal((icsText.match(/BEGIN:VEVENT/g) || []).length, 18);
    assert.match(icsText, /SUMMARY:Kanyar: 1\. hét\\, 1\. edzés – Erő/);
    await go(page, '#/prep');
    assert.match(await text(), /1 \/ 18 edzés kész/);
    await shot('program');
  });

  await step('vezetett edzés: lépésről lépésre végigmegy, az időzítő magától lép, a végén naplóz és kipipál', async () => {
    await page.evaluate(async () => { const w = await import('./js/ui/widgets.js'); w.setRunner({ tick: 2 }); });
    await go(page, '#/program');
    await page.locator('a[href="#/session/1-1"]').click();
    await shown(page, '#/session/1-1');
    assert.match(await text(), /1 \/ \d+ lépés/);
    assert.match(await text(), /Bemelegítés/);
    await shot('workout');
    let guard = 0, sawRest = false, sawSide = false;
    while (!/Edzés kész/.test(await text())) {
      assert.ok(++guard < 200, 'az edzés véget ér');
      const t = await text();
      if (/PIHENŐ/i.test(t) && /Következik/.test(t)) sawRest = true;
      if (/bal oldal|jobb oldal/.test(t)) sawSide = true;
      const start = page.getByRole('button', { name: 'Indítás', exact: true });
      if (await start.isVisible().catch(() => false)) { await start.click().catch(() => {}); await page.waitForTimeout(30); continue; }
      const done = page.getByRole('button', { name: 'Kész, tovább' });
      if (await done.isVisible().catch(() => false)) { await done.click().catch(() => {}); continue; }
      await page.waitForTimeout(20);
    }
    assert.ok(sawRest, 'volt pihenő a következő gyakorlat nevével');
    assert.ok(sawSide, 'az oldalankénti, időre menő gyakorlat külön lépés oldalanként');
    await go(page, '#/prep');
    assert.match(await text(), /2 \/ 18 edzés kész/);
    await go(page, '#/log');
    assert.match(await text(), /Edzés · [\s\S]*1\. hét, 2\. edzés: Oldalirány és törzs/);
    await page.evaluate(async () => { const w = await import('./js/ui/widgets.js'); w.setRunner({ tick: 1000 }); });
  });

  await step('tananyag, lecke, beállítások megjelennek; a külső videólink biztonságosan nyílik', async () => {
    await go(page, '#/learn');
    assert.match(await text(), /1\. szint: Hóeke/);
    await go(page, '#/l/guide_fis');
    assert.match(await text(), /Mások tisztelete/);
    await go(page, '#/ex/squat');
    const a = page.locator('.videos a').first();
    assert.match(await a.getAttribute('href'), /^https:\/\/www\.youtube\.com\//);
    assert.equal(await a.getAttribute('target'), '_blank');
    assert.equal(await a.getAttribute('rel'), 'noopener noreferrer');
    await go(page, '#/settings');
    assert.match(await text(), /AI-edző \(nem kötelező\)/);
    await shot('settings');
  });

  await step('AI-szerver: csak workers.dev címet fogad el; a válasz szövegként jelenik meg, a rossz formájút eldobja', async () => {
    await page.locator('input[type=url]').fill('https://evil.example/');
    await page.locator('input[type=password]').fill('titkos-kod-123');
    await page.getByRole('button', { name: 'Mentés', exact: true }).click();
    assert.match(await text(), /workers\.dev cím legyen/);
    await page.locator('input[type=url]').fill('https://kanyar-teszt.workers.dev');
    await page.getByRole('button', { name: 'Mentés', exact: true }).click();
    await page.waitForFunction(() => /Elmentve/.test(document.getElementById('main').innerText));

    let sent = null, reply = null;
    await page.route('https://kanyar-teszt.workers.dev/coach', async route => {
      const req = route.request();
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type, x-app-key', 'access-control-allow-methods': 'POST' } });
      sent = { key: req.headers()['x-app-key'], body: JSON.parse(req.postData()) };
      return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ coach: reply }) });
    });
    const good = {
      summary: 'AI: <img src=x onerror="window.__xss=1"> hátul a súlyod.', strength: 'Stabilan csúszol.',
      main_issue: { id: 'backseat', what: 'Hátraülsz.', why: 'A léc orra elkönnyül.', evidence: ['foreAft'] },
      drill_id: 'drill_hands_forward', home_drill_id: null, cue: 'Kéz előre.', progress: null, confidence: 'high', reshoot_tip: null,
    };
    reply = good;
    await go(page, '#/snow');
    await fakePose(page, 'ski-side-backseat');
    await upload(page);
    await page.waitForFunction(() => (document.documentElement.dataset.view || '').startsWith('#/a/') && /AI-edző/.test(document.getElementById('main').innerText));
    assert.match(await text(), /AI: <img src=x/, 'a HTML szövegként látszik');
    assert.equal(await page.locator('#main img').count(), 0);
    assert.equal(await page.evaluate(() => window.__xss), undefined);
    assert.match(await text(), /Tálca a kézben/);
    const [mdl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Mérési adatok letöltése' }).click()]);
    const meas = JSON.parse(fs.readFileSync(await mdl.path(), 'utf8'));
    assert.equal(meas.kind, 'snow-measurement');
    assert.ok(meas.frames.length > 100 && meas.frames[0].lm.length === 33, 'a testpontok benne vannak');
    assert.equal(meas.analysis.metrics.foreAft.band, 'low');
    assert.ok(!JSON.stringify(meas).includes('data:image') && !JSON.stringify(meas).includes('titkos-kod-123'), 'kép és belépőkód nincs benne');
    assert.match(await text(), /Változás az előző elemzéshez képest[\s\S]*Súlypont elöl–hátul[\s\S]*Változatlan/, 'az előző, azonos nézetű elemzéssel összeveti');
    assert.equal(sent.key, 'titkos-kod-123');
    assert.equal(sent.body.kind, 'snow');
    assert.equal(sent.body.input.metrics.foreAft.band, 'low');
    assert.ok(!JSON.stringify(sent.body).includes('teszt.mp4'), 'a videó nem megy a szerverre');
    assert.equal(sent.body.input.history.faultId, 'backseat', 'az előző elemzés fő hibája is elmegy');
    await shot('analysis-ai');

    /* ismeretlen gyakorlatazonosító: a választ eldobjuk, a helyi edző válaszol */
    reply = { ...good, drill_id: 'nincs_ilyen' };
    await go(page, '#/snow');
    await fakePose(page, 'ski-side-backseat');
    await upload(page);
    await page.waitForFunction(() => (document.documentElement.dataset.view || '').startsWith('#/a/') && /Helyi elemzés/.test(document.getElementById('main').innerText));
    assert.match(await text(), /Az AI-edzőt most nem sikerült elérni/);
  });

  await step('eszközpróba és korábbi eredmények', async () => {
    await page.evaluate(async () => { const w = await import('./js/ui/widgets.js'); w.setRunner({ benchmark: async () => ({ loadMs: 2100, frameMs: 38 }) }); });
    await go(page, '#/settings');
    await page.getByRole('button', { name: 'Eszközpróba indítása' }).click();
    await page.waitForFunction(() => /egy képkocka 38 ms/.test(document.getElementById('main').innerText));
    const t = await text();
    assert.match(t, /gyors: az elemzés nagyjából a videó hosszáig tart/);
    assert.match(t, /Kamera/);
    assert.match(t, /Mozilla\//, 'a másolható szövegben ott a böngésző azonosítója');
    await shot('device-check');
    await go(page, '#/ex/squat');
    assert.match(await text(), /Korábbi eredményeid[\s\S]*5 ismétlés · élő/);
  });

  await step('napi terv, haladás és megosztható kártya', async () => {
    await go(page, '#/');
    assert.match(await text(), /Mai terv a hegyen/);
    await go(page, '#/day');
    let t = await text();
    assert.match(t, /Erre figyelj ma[\s\S]*Hátraülsz/i);
    assert.match(t, /Bemelegítés/);
    assert.equal(await page.locator('.plan input[type=checkbox]').count(), 4, 'bemelegítés és három gyakorlat');
    await shot('day');
    for (const box of await page.locator('.plan input[type=checkbox]').all()) await box.check();
    await page.waitForFunction(() => /Megvan a mai adag/.test(document.getElementById('main').innerText));
    await go(page, '#/log');
    await go(page, '#/day');
    assert.equal(await page.locator('.plan input[type=checkbox]:checked').count(), 4, 'a pipák megmaradnak');
    await go(page, '#/log');
    t = await text();
    assert.match(t, /Haladás/);
    assert.match(t, /Havas mutatók alakulása[\s\S]*Súlypont elöl–hátul/i);
    assert.ok(await page.locator('.bar:not(.empty)').count() >= 1);
    await shot('progress');
    /* megosztható kártya: PNG készül, a letöltés elindul (a tesztböngészőben nincs megosztás) */
    await page.locator('.log-item[href^="#/a/"]').first().click();
    await page.waitForFunction(() => (document.documentElement.dataset.view || '').startsWith('#/a/'));
    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Eredmény megosztása' }).click()]);
    assert.equal(dl.suggestedFilename(), 'kanyar-eredmeny.png');
    const png = fs.readFileSync(await dl.path());
    assert.ok(png.length > 20000 && png.subarray(1, 4).toString() === 'PNG', 'valódi PNG-kép');
    if (SHOTS) fs.copyFileSync(await dl.path(), path.join(SHOTS, 'share-card.png'));
  });

  await step('mentés fájlba: a belépőkód nem kerül bele', async () => {
    await go(page, '#/settings');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Mentés fájlba' }).click()]);
    const data = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
    assert.equal(data.app, 'kanyar');
    assert.ok(data.items.length >= 3);
    assert.ok(!JSON.stringify(data).includes('titkos-kod-123'));
  });

  await step('akadálymentesség (axe, WCAG 2 A/AA): a fő képernyőkön nincs hiba', async () => {
    const axe = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
    const snowId = await page.evaluate(async () => { const st = await import('./js/ui/store.js'); return (await st.itemsAll()).find(i => i.kind === 'snow').id; });
    const found = [];
    for (const hash of ['#/', '#/prep', '#/program', '#/session/2-0', '#/ex/squat', '#/snow', '#/a/' + snowId, '#/day', '#/learn', '#/l/ski_1_stance', '#/log', '#/settings', '#/start']) {
      await go(page, hash);
      await page.evaluate(src => { if (!window.axe) (0, eval)(src); }, axe).catch(() => {});
      if (!(await page.evaluate(() => !!window.axe))) await page.addScriptTag({ content: axe }).catch(() => {});
      const res = await page.evaluate(async () => (window.axe ? (await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map(v => v.id + ': ' + v.nodes.length + ' elem, pl. ' + v.nodes[0].html.slice(0, 90)) : ['az axe nem töltődött be']));
      for (const v of res) found.push(hash + ' → ' + v);
    }
    assert.deepEqual(found, [], found.join('\n     '));
  });

  await step('nincs konzolhiba és CSP-sértés', async () => { assert.deepEqual(problems, [], problems.join(' | ')); });

  await browser.close();
  srv.close();
  console.log(process.exitCode ? '\nVan hibás lépés.' : '\nMinden böngészős lépés rendben.');
})().catch(e => { console.error(e); process.exit(1); });
