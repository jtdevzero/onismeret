#!/usr/bin/env node
/* Parliamo — böngészős végpontteszt.
 * Futtatás a repó gyökeréből:  node parliamo/tests/run.js
 * Saját statikus szervert indít a parliamo/ mappára, az AI-szervert (worker/) a böngészőben ál-válaszokkal helyettesíti.
 */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const PROXY = 'https://mock.workers.dev';
let pass = 0, fail = 0;
const ok = (cond, name, info) => { if (cond) { pass++; console.log('  ✓', name); } else { fail++; console.log('  ✗', name, info !== undefined ? '→ ' + JSON.stringify(info) : ''); } };

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const f = path.join(ROOT, u.endsWith('/') ? u + 'index.html' : u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

/* Ál-AI: a prompt tartalma alapján ad vissza a kért JSON-szerkezetet. */
function aiReply(prompt) {
  if (/olvasásértési/.test(prompt)) return { title: 'Working from home', text: 'Para one about remote work.\n\nPara two about offices.', questions: Array.from({ length: 5 }, (_, i) => ({ q: 'Question ' + (i + 1) + '?', o: ['Right', 'Wrong A', 'Wrong B', 'Wrong C'], a: 0, why: 'Mert a szöveg ezt mondja.' })) };
  if (/vizsgáztató/.test(prompt)) return { scores: { content: 4, communicative: 3, organisation: 4, language: 3 }, comments: { content: 'Jó.', communicative: 'Rendben.', organisation: 'Világos.', language: 'Néhány hiba.' }, band: 'B2', summary: 'Összességében jó.', errors: [{ wrong: 'more better', right: 'better', why: 'Dupla fokozás.' }], model: 'A model answer.' };
  if (/elemezd egy magyar/.test(prompt)) return { summary: 'A névelőkkel gyűlik meg a bajod.', patterns: [{ title: 'Névelők', explain: 'A magyar mindig tesz névelőt.', examples: ['I like music.'] }], drill: [{ q: 'I like ___ music.', a: '–', o: ['–', 'the', 'a'], why: 'Általánosságban nincs névelő.' }, { q: 'She is ___ engineer.', a: 'an', o: ['an', 'a', 'the'], why: 'Foglalkozás előtt a/an.' }, { q: 'Bad item without blank', a: 'x', o: ['y'] }] };
  if (/értékeld egy magyar/.test(prompt)) return { score: 7, level: 'B1', summary: 'Jól boldogultál.', good: ['Bátran kérdeztél.'], fixes: [{ wrong: 'I am agree', right: 'I agree', why: 'Az agree ige.' }], next: 'Gyakorold a múlt időt.' };
  if (/szerepjátékot/.test(prompt)) return { reply: 'Nice to meet you! What brings you here?', reply_hu: 'Örülök! Mi szél hozott?', correction: /Tanuló:/.test(prompt) ? 'I agree – az agree ige, nem kell am.' : null, suggestions: ['I am on holiday.', 'I work here.'] };
  return 'ok';
}
function mockProxy(store) {
  return async route => {
    const req = route.request(), p = new URL(req.url()).pathname, body = req.postData() ? JSON.parse(req.postData()) : {};
    const send = (status, j) => route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(j) });
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type, x-app-key', 'access-control-allow-methods': 'POST' } });
    if (req.headers()['x-app-key'] !== 'titok') return send(401, { error: 'unauthorized' });
    if (p === '/chat') { const r = aiReply(body.messages.map(m => m.content).join('\n')); return send(200, { text: typeof r === 'string' ? r : JSON.stringify(r) }); }
    if (p === '/sync/get') return send(200, store.rec || { rev: 0, state: null });
    if (p === '/sync/put') { const rev = store.rec ? store.rec.rev : 0; if (body.base !== rev) return send(409, { error: 'conflict', rev }); store.rec = { rev: rev + 1, state: body.state }; store.puts++; return send(200, { rev: rev + 1 }); }
    return send(404, { error: 'not_found' });
  };
}

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const URL0 = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM, args: ['--no-proxy-server'] } : { args: ['--no-proxy-server'] });
  const store = { rec: null, puts: 0 };
  const open = async (w = 390) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: 860 }, serviceWorkers: 'block' });
    await ctx.route(PROXY + '/**', mockProxy(store));
    const p = await ctx.newPage(); p._errs = [];
    p.on('pageerror', e => p._errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) p._errs.push(m.text()); });
    return { ctx, p };
  };
  const answerAll = async p => {
    for (let k = 0; k < 120; k++) {
      if (!(await p.evaluate(() => !!P))) break;
      const t = await p.evaluate(() => P.queue[P.i].t);
      if (t === 'match') { const n = await p.evaluate(() => P.queue[P.i].pairs.length); for (let i = 0; i < n; i++) { await p.click(`[data-ml="${i}"]`); await p.click(`[data-mr="${i}"]`); } await p.click('#go'); continue; }
      if (t === 'intro') { await p.click('#go'); continue; }
      if (t === 'speak') { await p.click('#skipSpeak'); continue; }
      if (t === 'mc' || t === 'listen') { const i = await p.evaluate(() => { const e = P.queue[P.i]; return e.opts.indexOf(e.ans); }); await p.click(`[data-o="${i}"]`); }
      else if (t === 'type' || t === 'dict') { await p.fill('#ans', await p.evaluate(() => P.queue[P.i].ans[0])); }
      else if (t === 'order') { const ws = await p.evaluate(() => { const e = P.queue[P.i]; const used = new Set(); return e.ans.replace(/[.?!,]/g, '').split(' ').map(w => { const t = e.tiles.find(t => t.w === w && !used.has(t.i)); used.add(t.i); return t.i; }); }); for (const i of ws) await p.click(`#bank [data-t="${i}"]`); }
      await p.click('#go'); await p.click('#go');
    }
  };

  console.log('\n1. Indulás és bevezető');
  const { ctx, p } = await open();
  await p.goto(URL0); await p.waitForSelector('[data-l="en"]');
  ok(await p.locator('a.skip').count() === 1, 'van „Ugrás a tartalomhoz” link');
  await p.click('[data-l="en"]'); await p.waitForSelector('[data-g="50"]'); await p.click('[data-g="50"]'); await p.click('[data-v="new"]');
  await p.waitForSelector('#hRound');
  ok(await p.evaluate(() => S.onboarded && lang() === 'en'), 'bevezető után angol, kész');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'nincs vízszintes görgetés telefonméretben');
  ok(await p.evaluate(() => !!document.querySelector('.wotd [lang="en"]')), 'a célnyelvi szöveg lang attribútumot kap');
  await p.evaluate(() => { S.settings.proxy = 'https://mock.workers.dev'; S.settings.pass = 'titok'; save(); });

  console.log('\n2. C1-es ág');
  await p.evaluate(() => go('leckek'));
  ok(await p.evaluate(() => document.activeElement === view), 'nézetváltáskor a fókusz a tartalomra kerül');
  ok(await p.locator('h2', { hasText: 'Haladó angol C1' }).count() === 1, 'a C1 ág fejléce látszik');
  const c1 = await p.evaluate(() => LESSONS.findIndex(l => l.id === 'en-c1'));
  ok(c1 > 0 && await p.evaluate(() => LESSONS.filter(l => l.track === 'c1').length) === 8, '8 C1 lecke', c1);
  await p.click(`[data-l="${c1}"]`); await p.click('#startL'); await answerAll(p);
  ok(await p.evaluate(() => S.lessons['en-c1'] && S.lessons['en-c1'].done), 'C1 lecke végigvihető');
  await p.reload(); await p.waitForFunction(() => LESSONS.length > 0 && !!document.querySelector('#view h1'));
  ok(await p.evaluate(() => !!(S.lessons['en-c1'] && S.lessons['en-c1'].done)), 'a C1 haladás újratöltés után is megmarad');

  console.log('\n3. Kiejtés magyaroknak');
  await p.evaluate(() => { go('gyakorlas'); });
  ok(await p.locator('[data-d="pod"]').count() === 1 && await p.locator('[data-d="pron"]').count() === 1 && await p.locator('[data-d="exam"]').count() === 1, 'új gyakorlók a listában');
  await p.click('[data-d="pron"]'); await p.click('[data-s="th"]');
  const t = await p.evaluate(() => PR.q.t); await p.click(`[data-j="${t}"]`);
  ok(await p.evaluate(() => PR.ok === 1 && PR.n === 1), 'hallás utáni párválasztás pontoz');
  await p.click('#prNext'); const t2 = await p.evaluate(() => 1 - PR.q.t); await p.click(`[data-j="${t2}"]`);
  ok(await p.evaluate(() => PR.n === 2 && S.mlog.some(m => m.k === 'pron:th')), 'a rossz válasz bekerül a hibanaplóba');
  await p.click('[data-v="sent"]');
  ok(await p.locator('.big-q').textContent().then(s => s.length > 10), 'mondatos mód');
  await p.click('#sbBack'); await p.click('[data-s="stress"]');
  ok(await p.evaluate(() => PR.mode === 'sent' && document.querySelectorAll('#prMode button').length === 1), 'a hangsúlynál csak mondatos mód van');
  const det = await p.evaluate(() => speechDetail('I think there are three', ['I sink there are tree']));
  ok(det.words.filter(w => !w.ok).map(w => w.w).join(',') === 'think,three', 'szavankénti kiértékelés', det.words);

  console.log('\n4. Podcastok');
  await p.evaluate(() => { go('gyakorlas'); }); await p.click('[data-d="pod"]');
  ok(await p.locator('[data-p]').count() === 6, '6 epizód');
  await p.click('[data-p="en-p1"]');
  ok(await p.evaluate(() => !!document.querySelector('#pdLines [aria-hidden="true"]')), 'a szöveg alapból rejtve');
  await p.click('#pdT'); ok(await p.evaluate(() => !document.querySelector('#pdLines [aria-hidden="true"]')), 'szöveg mutatása');
  await p.click('#pdQ');
  const nq = await p.evaluate(() => PD.p.questions.length);
  for (let k = 0; k < nq; k++) { const a = await p.evaluate(k => PD.p.questions[k].a, k); await p.click(`[data-q="${k}"][data-j="${a}"]`); }
  await p.click('#pdFin');
  ok(await p.evaluate(() => S.pods['en-p1'] && S.pods['en-p1'].ok === S.pods['en-p1'].n), 'kérdések után mentett eredmény');
  await p.click('[data-v="0"]');
  ok(await p.evaluate(() => ownList().length === 1), 'szószedetből saját kártya');

  console.log('\n5. Vizsgafelkészítő');
  await p.evaluate(() => { go('gyakorlas'); }); await p.click('[data-d="exam"]');
  await p.click('[data-x="wf"]'); await p.fill('#xans', await p.evaluate(() => EX.queue[EX.pos].a)); await p.click('#xgo');
  ok(await p.evaluate(() => EX.ok === 1), 'szóképzés: helyes válasz elfogadva');
  await p.click('#sbBack'); await p.click('[data-x="kwt"]');
  const kw = await p.evaluate(() => { const it = EX.queue[EX.pos]; return (it.accept && it.accept[0]) || it.a; });
  await p.fill('#xans', kw + ' to the cinema.'); await p.click('#xgo');
  ok(await p.evaluate(() => EX.ok === 1), 'mondatátalakítás: elfogadott változat');
  await p.click('#xgo'); await p.fill('#xans', 'nonsense'); await p.click('#xgo');
  ok(await p.evaluate(() => EX.n === 2 && EX.ok === 1), 'mondatátalakítás: rossz válasz');
  await p.click('#sbBack'); await p.click('[data-x="mc"]'); await p.click('[data-o="0"]');
  ok(await p.evaluate(() => D && D.k === 'exam-mc' && D.n === 1), 'feleletválasztós szókitöltés');
  await p.evaluate(() => { go('gyakorlas'); }); await p.click('[data-d="exam"]'); await p.click('[data-x="read"]');
  await p.click('[data-t="Technológia"]'); await p.waitForSelector('article');
  for (let k = 0; k < 5; k++) await p.click(`[data-q="${k}"][data-j="0"]`);
  ok(await p.locator('h3', { hasText: 'Eredmény: 5 / 5' }).count() === 1, 'AI-olvasásértés kiértékelve');
  await p.click('#sbBack'); await p.click('[data-x="write"]');
  await p.fill('#xtext', Array(70).fill('word').join(' ')); await p.click('#xsend'); await p.waitForSelector('text=Mintaválasz');
  ok(await p.locator('text=14 / 20').count() === 1, 'esszé: négy szempont összesítve');

  console.log('\n6. AI-tanár: értékelés');
  await p.evaluate(() => go('tanar')); await p.click('[data-s="free"]'); await p.waitForSelector('#cin:not([disabled])');
  await p.fill('#cin', 'I am agree with you.'); await p.click('#csend'); await p.waitForSelector('#cin:not([disabled])');
  await p.fill('#cin', 'I live in Budapest.'); await p.click('#csend'); await p.waitForSelector('#cSum');
  ok(await p.evaluate(() => S.mlog.some(m => m.k === 'chat')), 'a beszélgetés javításai a hibanaplóba kerülnek');
  await p.click('#cSum'); await p.waitForSelector('text=A beszélgetés értékelése');
  ok(await p.locator('text=Gyakorold a múlt időt.').count() === 1, 'beszélgetés-értékelés megjelenik');

  console.log('\n7. Havi hibaelemzés és személyre szabott ismétlés');
  await p.evaluate(() => { for (let i = 0; i < 6; i++) logMiss('drill:articles', 'I like ___ music.', 'the', '–'); save(); go('stat'); });
  await p.click('#aRun'); await p.waitForSelector('#aDrill');
  ok(await p.evaluate(() => S.ai['rep-en'].drill.length === 2), 'AI-elemzés: a hibás gyakorló feladat kiszűrve');
  await p.click('#aDrill'); ok(await p.evaluate(() => D && D.k === 'mx'), 'személyre szabott gyakorló indul');
  const iv = await p.evaluate(() => { const c = { s: 20, d: 5, reps: 5, lapses: 0, last: Date.now() - 20 * 864e5 };
    S.settings.ret = 0.9; const a = sched(c, 2, 'x').ivl; S.settings.ret = 0.95; const b = sched(c, 2, 'x').ivl; S.hard.x = 1; const h = sched(c, 2, 'x').ivl; delete S.hard.x; S.settings.ret = 0.9; return [a, b, h]; });
  ok(iv[1] < iv[0] && iv[2] < iv[1], 'magasabb megtartási cél és a nehéz kártya rövidebb időközt ad', iv);

  console.log('\n8. Szinkron két eszköz között');
  await p.evaluate(() => go('ma')); await p.click('details.g summary'); await p.click('#sSync [data-v="1"]');
  await p.waitForFunction(() => cloudRev > 0);
  ok(store.rec && store.rec.state.lessons['en-c1'] && !('pass' in store.rec.state.settings), 'feltöltve, a belépőkód nélkül');
  const B = await open(1280);
  await B.p.goto(URL0); await B.p.waitForSelector('[data-l="en"]');
  await B.p.evaluate(() => { S.onboarded = true; S.settings.proxy = 'https://mock.workers.dev'; S.settings.pass = 'titok'; S.settings.cloud = true; S.xp = 3; S.days[today() - 40] = 3; save(); });
  await B.p.evaluate(() => cloudSync());
  ok(await B.p.evaluate(() => !!S.lessons['en-c1'] && S.pods['en-p1'] && S.days[today() - 40] === 3), 'a másik eszköz megkapja és összefésüli a haladást');
  await B.p.evaluate(async () => { S.stories['en-s1'] = { done: true, score: '3/3', day: today() }; save(); await cloudSync(); });
  await p.evaluate(() => { S.xp += 1; save(); }); await p.evaluate(() => cloudSync());
  ok(await p.evaluate(() => !!S.stories['en-s1'] && S.days[today() - 40] === 3), 'az első eszköz is látja a másik változásait (ütközés után összefésülve)');
  ok(store.rec.rev >= 4, 'minden írás új verziót kap', store.rec.rev);

  console.log('\n9. Más nyelvek');
  await p.evaluate(() => switchLang('es')); await p.waitForFunction(() => lang() === 'es' && LESSONS.length > 0);
  await p.evaluate(() => go('gyakorlas'));
  ok(await p.locator('[data-d="pod"]').count() === 0 && await p.locator('[data-d="serestar"]').count() === 1, 'spanyolban a saját gyakorlók');
  ok(await p.evaluate(() => !!S.lessons['en-c1']), 'nyelvváltás nem törli az angol haladást');

  console.log('\n10. Beszédfelismerés (ál-mikrofonnal): kiejtés és kéz nélküli beszélgetés');
  const C = await open();
  await C.ctx.addInitScript(() => {
    window.__heard = [];
    window.SpeechRecognition = window.webkitSpeechRecognition = class { start() { setTimeout(() => { const t = window.__heard.shift(); if (!t) { this.onerror && this.onerror({ error: 'no-speech' }); this.onend && this.onend(); return; } this.onresult({ results: [[{ transcript: t }]] }); this.onend && this.onend(); }, 60); } };
  });
  await C.p.goto(URL0); await C.p.waitForSelector('[data-l="en"]');
  await C.p.evaluate(() => { S.onboarded = true; S.settings.proxy = 'https://mock.workers.dev'; S.settings.pass = 'titok'; save(); go('gyakorlas'); });
  await C.p.click('[data-d="pron"]'); await C.p.click('[data-s="th"]'); await C.p.click('[data-v="speak"]');
  await C.p.evaluate(() => { PR.q = { pair: ['think', 'sink'], t: 0 }; drawPron(); window.__heard = ['sink']; });
  await C.p.click('#prMic'); await C.p.waitForFunction(() => PR.res);
  ok(await C.p.evaluate(() => PR.res.partner && !PR.res.ok), 'a párjának hallott szót felismeri (think → sink)');
  await C.p.evaluate(() => { PR.q = { pair: ['think', 'sink'], t: 0 }; PR.res = null; drawPron(); window.__heard = ['I think so']; });
  await C.p.click('#prMic'); await C.p.waitForFunction(() => PR.res);
  ok(await C.p.evaluate(() => PR.res.ok), 'helyes kiejtés elfogadva');
  await C.p.evaluate(() => go('tanar')); await C.p.click('[data-s="free"]'); await C.p.waitForSelector('#cHands');
  await C.p.evaluate(() => { window.__heard = ['I live in Budapest.', 'I like it here.']; });
  await C.p.click('#cHands');
  await C.p.waitForFunction(() => T.msgs.filter(m => m.r === 'me').length === 2 && !T.busy, null, { timeout: 40000 });
  ok(await C.p.evaluate(() => T.msgs.filter(m => m.r === 'me').map(m => m.it).join('|')) === 'I live in Budapest.|I like it here.', 'kéz nélkül: a tanár válasza után magától hallgat és küld');
  ok(C.p._errs.length === 0, 'nincs JS-hiba (beszéd)', C.p._errs.slice(0, 3));

  ok(p._errs.length === 0 && B.p._errs.length === 0, 'nincs JS-hiba', [...p._errs, ...B.p._errs].slice(0, 5));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} hiba`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
