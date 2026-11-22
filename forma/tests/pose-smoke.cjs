/* Füstteszt a valódi pózbecslőre: a vendorolt MediaPipe a Forma szigorú CSP-je mellett betöltődik, lefut egy képkockán,
   és a böngésző teszt-kamerájával élő képkockák érkeznek. Külső hálózati kérés nincs.
   Futtatás: node forma/tests/pose-smoke.cjs */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const assert = require('assert/strict');
const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };

(async () => {
  const srv = await new Promise(resolve => {
    const s = http.createServer((req, res) => {
      let u = decodeURIComponent(req.url.split('?')[0]); if (u.endsWith('/')) u += 'index.html';
      const f = path.join(ROOT, u);
      if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
      fs.readFile(f, (e, b) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); res.end(b); } });
    }).listen(0, '127.0.0.1', () => resolve(s));
  });
  const browser = await chromium.launch({ executablePath: process.env.FORMA_CHROMIUM_PATH || undefined, args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  const page = await browser.newPage();
  const errors = [], external = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', r => { if (!/^(http:\/\/127\.0\.0\.1|data:|blob:)/.test(r.url())) external.push(r.url()); });
  await page.goto(`http://127.0.0.1:${srv.address().port}/`);
  await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
  const res = await page.evaluate(async () => {
    const { loadPose } = await import('./js/ui/pose.js');
    const lm = await loadPose();
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const g = c.getContext('2d'); g.fillStyle = '#88a'; g.fillRect(0, 0, 256, 256);
    return { poses: lm.detectForVideo(c, Math.round(performance.now())).landmarks.length };
  });
  assert.equal(typeof res.poses, 'number');
  const live = await page.evaluate(async () => {
    const { openCamera } = await import('./js/ui/pose.js');
    const cam = await openCamera();
    const frames = [await cam.read(), await cam.read(), await cam.read()];
    const track = cam.el.srcObject.getTracks()[0];
    cam.close();
    return { n: frames.length, increasing: frames[2].t > frames[1].t && frames[1].t > frames[0].t, shape: frames.every(f => f.lm === null || f.lm.length === 33), stopped: track.readyState === 'ended', after: await cam.read() };
  });
  assert.deepEqual(live, { n: 3, increasing: true, shape: true, stopped: true, after: null });
  assert.deepEqual(errors, [], errors.join(' | '));
  assert.deepEqual(external, [], 'külső kérés: ' + external.join(', '));
  console.log('ok   pózbecslő: betöltődik a CSP mellett, élő kamera működik, külső kérés nincs');
  await browser.close();
  srv.close();
})().catch(e => { console.log('FAIL ' + (e.message || e).split('\n')[0]); process.exitCode = 1; process.exit(1); });
