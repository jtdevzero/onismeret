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

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const f = path.join(ROOT, u.endsWith('/') ? u + 'index.html' : u);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});

/* Ál-AI: a prompt tartalma alapján ad vissza a kért JSON-szerkezetet. */
function aiReply(prompt) {
  if (/részenként írta meg/.test(prompt)) return { parts: [1, 2, 3].map(() => ({ score: 4, comment: 'Jó rész.', corrected: 'Fixed part.' })), summary: 'Összességében jó.', tip: 'Használj több kötőszót.' };
  if (/kéthetes \(14 napos\)/.test(prompt)) {
    const it = k => ({ q: `Item ${k} ___ here.`, a: 'right', o: ['right', 'wrong', 'other'], why: 'Mert.' });
    return { title: 'Névelők és igeidők', goal: 'Biztosan használod a névelőket.', days: Array.from({ length: 14 }, (_, d) => ({ t: `Nap ${d + 1}`, ex: 'Magyarázat.', items: [1, 2, 3, 4, 5].map(it) })), test: Array.from({ length: 10 }, (_, k) => it(k)) };
  }
  if (/Döntsd el, hogy a válasz helyes/.test(prompt)) return { ok: false, fix: 'Corrected sentence.', why: 'Kis hiba.' };
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
    if (p === '/usage') return send(200, { month: '2026-10', calls: 42, in: 900000, out: 200000, cost: 7.6, months: [{ month: '2026-10', cost: 7.6 }, { month: '2026-09', cost: 3.1 }], budget: 0 });
    if (p === '/sync/backups') return send(200, { list: (store.backups || []).map(b => ({ key: b.key, at: b.at, xp: b.state.xp })) });
    if (p === '/sync/backup-now') { store.backups = [...(store.backups || []), { key: 'backup:' + Date.now(), at: Date.now(), state: store.rec.state }]; return send(200, { ok: true }); }
    if (p === '/sync/backup-get') { const b = (store.backups || []).find(x => x.key === body.key); return b ? send(200, { state: b.state }) : send(404, {}); }
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
    p.on('pageerror', e => p._errs.push(e.message + (process.env.PSTACK ? ' @ ' + e.stack.split('\n').slice(1, 3).join(' ') : ''))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) p._errs.push(m.text()); });
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
  ok(await p.locator('[data-p]').count() === 10, '10 epizód');
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
  ok(await p.locator('[data-d="pod"]').count() === 1 && await p.locator('[data-d="serestar"]').count() === 1 && await p.locator('[data-d="acc"]').count() === 0, 'spanyolban a saját gyakorlók és a podcastok');
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
  await C.p.evaluate(() => { POOL.slice(0, 3).forEach(c => { S.cards[c.id] = sched(null, 2, c.id); S.cards[c.id].due = today(); }); save(); window.__heard = ['tudtam', 'újra', 'könnyű']; go('kartyak'); });
  await C.p.click('#startCar'); await C.p.waitForFunction(() => !CAR, null, { timeout: 60000 });
  ok(await C.p.evaluate(() => { const c = POOL.slice(0, 3).map(x => S.cards[x.id]); return c[0].ivl >= 1 && c[1].ivl === 0 && c[2].ivl >= c[0].ivl; }), 'autós mód: hangra értékel (tudtam / újra / könnyű)');
  ok(C.p._errs.length === 0, 'nincs JS-hiba (beszéd)', C.p._errs.slice(0, 3));

  console.log('\n11. Akcentus, szócsomagok, mondatépítő');
  await p.evaluate(() => switchLang('en')); await p.waitForFunction(() => lang() === 'en' && XT.packs.length > 0);
  await p.evaluate(() => go('gyakorlas')); await p.click('[data-d="acc"]');
  const acc = await p.evaluate(() => AC.q.acc); await p.click(`[data-a="${acc}"]`);
  ok(await p.evaluate(() => AC.ok === 1) && await p.locator('#acUk').count() === 1, 'brit/amerikai: pontoz, és mindkét változat meghallgatható');
  ok(await p.evaluate(async () => { const d = await loadBundle('acc-en'); return !!(d && d['uk:' + XT.acc[0].it] && d['us:' + XT.acc[0].it]); }), 'mindkét akcentus fel van véve');
  await p.evaluate(() => go('kartyak')); ok(await p.locator('[data-pk]').count() === 15, '15 szócsomag a Kártyák oldalon');
  await p.click('[data-pk="doctor"]'); const before = await p.evaluate(() => ownList().length); await p.click('#pkAdd');
  ok(await p.evaluate(b => ownList().length === b + 20 && POOL.filter(c => c.own).length === ownList().length, before), 'csomag felvétele: 20 új kártya');
  ok(await p.evaluate(() => AUDIO_IDX['a sore throat'] === 'pk-en-doctor'), 'a csomag szavai felvett hangot kapnak');
  await p.evaluate(() => go('gyakorlas')); await p.click('[data-d="build"]');
  await p.fill('#sbIn', await p.evaluate(() => SB.c.it)); await p.click('#sbGo');
  ok(await p.evaluate(() => SB.ok === 1), 'mondatépítő: pontos válasz AI nélkül is elfogadva');
  await p.click('#sbNext'); await p.fill('#sbIn', 'something quite different'); await p.click('#sbGo'); await p.waitForSelector('#sbNext');
  ok(await p.evaluate(() => SB.n === 2 && SB.res.fix === 'Corrected sentence.'), 'mondatépítő: eltérő válasznál az AI javít');

  console.log('\n12. Kéthetes terv, térkép, oklevél, heti terv');
  await p.evaluate(() => go('stat')); await p.click('#aPlan'); await p.waitForFunction(() => !!S.plan.en);
  ok(await p.evaluate(() => S.plan.en.days.length === 14 && S.plan.en.test.length === 10), 'terv: 14 nap és 10 kérdéses felmérés');
  await p.evaluate(() => go('ma')); await p.click('#plGo');
  const answerQuiz = async right => { for (let k = 0; k < 20; k++) { if (!(await p.evaluate(() => !!QZ))) break; const i = await p.evaluate(r => { const it = QZ.items[QZ.i]; return r ? it._o.indexOf(it.a) : it._o.findIndex(x => x !== it.a); }, right); await p.click(`[data-o="${i}"]`); await p.click('#qgo'); } };
  await answerQuiz(false);
  ok(await p.evaluate(() => S.plan.en.pre === 0), 'kezdő felmérés eredménye elmentve');
  await p.click('#plNext'); await answerQuiz(true);
  ok(await p.evaluate(() => S.plan.en.days[0].done && (S.ev[today()] || {}).plan === 1), '1. nap teljesítve');
  await p.evaluate(() => { S.plan.en.start = today() - 13; S.plan.en.days.forEach(d => d.done = true); save(); go('ma'); }); await p.click('#plGo'); await answerQuiz(true);
  ok(await p.evaluate(() => S.plan.en.post === 10), 'zárófelmérés: javulás mérve (0 → 10)');
  await p.evaluate(() => go('terkep'));
  ok(await p.locator('.mile').count() >= 4, 'térkép: szintenkénti mérföldkövek');
  await p.evaluate(() => { levelLessons('A1').forEach(x => S.lessons[x.L.id] = { done: true, best: 100, day: today() }); save(); renderMap(); });
  await p.click('[data-test="A1"]'); await answerQuiz(true);
  ok(await p.evaluate(() => S.certs['en-A1'] && S.certs['en-A1'].score === 100), 'szintzáró teszt: oklevél megszerezve');
  await p.click('#tCert'); ok(await p.locator('svg[aria-label*="oklevél"]').count() === 1, 'oklevél megjelenik');
  await p.evaluate(() => go('ma')); await p.click('#wEdit'); await p.click('#wSave');
  ok(await p.evaluate(() => Object.keys(S.settings.wplan).length === 7) && await p.locator('.wcell').count() === 7, 'heti terv elmentve, 7 nap látszik');
  await p.evaluate(() => { const k = S.settings.wplan[(today() + 4) % 7]; const a = WACT.find(x => x[0] === k); if (a && a[2]) incEv(a[2]); save(); renderHome(); });
  ok(await p.evaluate(() => { const k = S.settings.wplan[(today() + 4) % 7]; return k === 'free' || wDone(today()) === true; }), 'a mai terv teljesítése látszik');

  console.log('\n13. Offline olvasmány és párbeszéd');
  await p.evaluate(() => go('gyakorlas')); await p.click('[data-d="read"]'); await p.click('[data-or="r1"]');
  await p.click('.w >> text=productivity'); await p.waitForSelector('#wpop:not([hidden])');
  ok(await p.locator('#wpop').textContent().then(t => /termelékenység/.test(t)), 'kész olvasmány: szótár AI nélkül');
  await p.evaluate(() => go('tanar')); await p.click('[data-dl="d1"]');
  for (let k = 0; k < 4; k++) { await p.click('[data-j="1"]'); const okNow = await p.evaluate(() => DL.d.turns[DL.i].opts[DL.pick].ok); if (!okNow) { const j = await p.evaluate(() => DL.d.turns[DL.i].opts.findIndex(o => o.ok)); await p.click(`[data-j="${j}"]`); } await p.click('#dlNext'); }
  ok(await p.evaluate(() => S.dlg.d1 && S.dlg.d1.n === 4), 'kész párbeszéd végigvihető, visszajelzéssel');

  console.log('\n14. AI-költség és szerveres mentések');
  await p.evaluate(() => { S.settings.budget = 8; save(); go('ma'); }); await p.click('details.g summary'); await p.waitForFunction(() => /\$7\.60/.test(document.querySelector('#sUse').textContent));
  ok(true, 'havi AI-használat megjelenik');
  await p.evaluate(() => renderHome()); ok(await p.locator('.notice', { hasText: 'AI-költség' }).count() === 1, '80% felett figyelmeztet a kezdőlapon');
  await p.click('details.g summary'); await p.click('#sBkNow'); await p.waitForSelector('[data-bk]');
  const xpBefore = await p.evaluate(() => S.xp);
  await p.evaluate(async () => { S.xp += 500; save(); await cloudSync(); });
  await p.evaluate(() => { renderHome(); document.querySelector('details.g').open = true; }); await p.waitForSelector('[data-bk]');
  await p.click('[data-bk]'); await p.click('[data-bk]'); await p.waitForFunction(x => S.xp === x && !cloudBusy, xpBefore);
  ok(await p.evaluate(x => S.xp === x, xpBefore), 'visszaállítás mentésből');
  ok(store.rec.state.xp === xpBefore, 'a visszaállított állapot a szerverre is felkerül', store.rec.state.xp);

  console.log('\n15. Olasz és spanyol extrák');
  await p.evaluate(() => switchLang('es')); await p.waitForFunction(() => lang() === 'es' && XT.packs.length > 0);
  ok(await p.evaluate(() => XT.pods.length === 4 && XT.pron.length === 5 && XT.packs.length === 8 && !!XT.exam.mc), 'spanyol: 4 podcast, 5 kiejtési csoport, 8 csomag, vizsga');
  ok(await p.evaluate(async () => { const d = await loadBundle('pron-es'); return !!(d && d.perro); }), 'spanyol kiejtés felvett hanggal');
  await p.evaluate(() => go('gyakorlas')); await p.click('[data-d="pron"]'); await p.click('[data-s="rr"]');
  await p.click(`[data-j="${await p.evaluate(() => PR.q.t)}"]`); ok(await p.evaluate(() => PR.ok === 1), 'spanyol hangpár (pero – perro) gyakorló');
  await p.click('#sbBack'); await p.click('[data-s="bv"]'); ok(await p.evaluate(() => PR.mode === 'sent'), 'b/v: csak mondatos mód (ugyanúgy hangzanak)');
  await p.evaluate(() => go('gyakorlas')); await p.click('[data-d="exam"]');
  ok(await p.locator('.label', { hasText: 'DELE' }).count() >= 1 && await p.locator('[data-x="kwt"]').count() === 0, 'spanyol vizsga: DELE, mondatátalakítás nélkül');
  await p.click('[data-x="mc"]'); await p.click('[data-o="0"]'); ok(await p.evaluate(() => D.k === 'exam-mc' && D.n === 1), 'DELE szókitöltés');
  await p.evaluate(() => go('kartyak')); await p.click('[data-pk="restaurant"]'); await p.click('#pkAdd');
  ok(await p.evaluate(() => ownList().some(w => w.it === 'la propina') && AUDIO_IDX['la propina'] === 'pk-es-restaurant'), 'spanyol szócsomag felvéve, hanggal');
  await p.evaluate(() => switchLang('it')); await p.waitForFunction(() => lang() === 'it' && XT.pods.length > 0);
  ok(await p.evaluate(() => XT.pods.length === 4 && XT.pron.some(s => s.id === 'doppie')), 'olasz: podcastok és dupla mássalhangzók');

  console.log('\n16. Podcast: koppintható szavak, lyukas szöveg, diktálás');
  await p.evaluate(() => switchLang('en')); await p.waitForFunction(() => lang() === 'en' && XT.writing.length > 0);
  await p.evaluate(() => go('gyakorlas')); await p.click('[data-d="pod"]'); await p.click('[data-p="en-p1"]'); await p.click('#pdT');
  await p.click('#pdLines .w >> text=awake'); await p.waitForSelector('#wpop:not([hidden])');
  ok(/éber/.test(await p.locator('#wpop').textContent()), 'podcast szövegében a szóra koppintva jön a jelentés');
  await p.click('#pdGap');
  await p.evaluate(() => { const g = gapsFor(PD.p); document.querySelectorAll('.gapin').forEach(inp => { const k = +inp.dataset.g; inp.value = PD.p.lines[k].it.split(' ')[g[k]].replace(/[^\p{L}']/gu, ''); inp.dispatchEvent(new Event('input')); }); });
  await p.click('#gpChk'); ok(await p.locator('.feedback.ok').count() === 1 && await p.locator('.gapin.bad').count() === 0, 'lyukas szöveg: helyes kitöltés elfogadva');
  await p.click('#gpBack'); await p.click('#pdDict'); await p.fill('#pdIn', await p.evaluate(() => PD.p.lines[0].it)); await p.click('#pdChkL');
  ok(await p.evaluate(() => PD.dok === 1), 'diktálás: hibátlan mondat');
  await p.click('#pdNextL'); await p.fill('#pdIn', 'totally wrong words'); await p.click('#pdChkL');
  ok(await p.evaluate(() => PD.dok === 1 && !PD.dres.ok) && await p.locator('.feedback.bad').count() === 1, 'diktálás: hibás mondatnál szavanként jelöl');
  await p.evaluate(() => go('gyakorlas')); await p.click('[data-d="story"]'); await p.click('[data-st] >> nth=0').catch(() => {});

  console.log('\n17. Íráskurzus');
  await p.evaluate(() => go('gyakorlas')); await p.click('[data-d="wcourse"]');
  ok(await p.locator('[data-wc]').count() === 4, '4 írásmodul');
  await p.click('[data-wc="complaint"]'); ok(await p.locator('.sugg button').count() >= 9, 'felépítés és fordulatok');
  await p.click('#wcTab [data-v="drill"]'); await p.click('#wcDrill');
  for (let k = 0; k < 5; k++) { const i = await p.evaluate(() => { const it = QZ.items[QZ.i]; return it._o.indexOf(it.a); }); await p.click(`[data-o="${i}"]`); await p.click('#qgo'); }
  ok(await p.evaluate(() => WC && WC.tab === 'write'), 'kötőszó-gyakorló után az írás jön');
  for (let i = 0; i < 3; i++) await p.fill(`[data-wp="${i}"]`, 'This is my part number ' + i + ' and it is long enough.');
  await p.click('#wcSend'); await p.waitForSelector('text=12 / 15 pont');
  ok(await p.evaluate(() => S.wc.complaint.score === 12), 'részenkénti AI-javítás és pontszám');

  console.log('\n18. Szókincsbecslés, testreszabás, eszközellenőrzés, gyorsindítás');
  await p.evaluate(() => go('stat')); await p.click('#vtGo');
  for (let k = 0; k < 64; k++) { const real = await p.evaluate(() => VT && VT.items[VT.i].b >= 0); if (real === null) break; await p.click(`[data-y="${real ? 1 : 0}"]`); }
  ok(await p.evaluate(() => S.vsize[S.vsize.length - 1].size === 10000 && S.vsize[S.vsize.length - 1].level === 'C2'), 'szókincsteszt: tökéletes válaszokra 10 000 szó, C2');
  ok(await p.evaluate(() => { const X = XT.vt, items = X.bands.flatMap((b, bi) => b.words.map(w => ({ w, b: bi }))).concat(X.pseudo.map(w => ({ w, b: -1 }))); const yes = items.map(() => true); return vtScore(items, yes, X).size === 0; }), 'aki mindenre igent mond, annak 0 a becslés');
  await p.evaluate(() => go('ma')); await p.click('details.g summary'); await p.click('#sTheme [data-v="dark"]');
  ok(await p.evaluate(() => document.documentElement.dataset.theme === 'dark'), 'sötét téma kézzel');
  await p.click('details.g summary').catch(() => {}); await p.evaluate(() => { document.querySelector('details.g').open = true; }); await p.click('#sFs [data-v="xl"]');
  await p.evaluate(() => { document.querySelector('details.g').open = true; }); await p.click('#sRead [data-v="1"]');
  ok(await p.evaluate(() => document.documentElement.dataset.fs === 'xl' && document.documentElement.dataset.read === '1' && getComputedStyle(document.body).fontFamily.includes('Atkinson')), 'nagy betű és könnyen olvasható betűtípus');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'nagy betűvel sincs vízszintes görgetés');
  await p.evaluate(() => { S.settings.theme = 'auto'; S.settings.fs = 'm'; S.settings.readable = false; save(); applyPrefs(); });
  await p.evaluate(() => go('ellenorzes')); await p.waitForFunction(() => document.querySelector('#ck-ai') && document.querySelector('#ck-ai').classList.contains('ok'), null, { timeout: 15000 });
  ok(await p.locator('.chkrow').count() >= 8, 'eszközellenőrzés: minden sor, az AI-kapcsolat működik');
  await p.goto(URL0 + '#podcast'); await p.waitForSelector('[data-p]');
  ok(await p.locator('[data-p]').count() === 10, 'gyorsindítás: #podcast a podcastokat nyitja');
  const man = await p.evaluate(() => fetch('manifest.webmanifest').then(r => r.json()));
  ok(man.shortcuts && man.shortcuts.length === 4, 'a telepített app ikonján 4 gyorsindító');

  ok(p._errs.length === 0 && B.p._errs.length === 0, 'nincs JS-hiba', [...p._errs, ...B.p._errs].slice(0, 5));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} hiba`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
