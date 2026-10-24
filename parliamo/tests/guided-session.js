#!/usr/bin/env node
/* Guided daily path: real browser transitions, persistence and truthful milestones.
 * Run: PW_CHROMIUM=/usr/bin/chromium node parliamo/tests/guided-session.js
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname);
  const file = path.join(ROOT, pathname.endsWith('/') ? pathname + 'index.html' : pathname);
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
let browser, count = 0;
function check(value, title) { assert.ok(value, title); count++; console.log('  ✓ ' + title); }
async function answerAll(p) {
  for (let k = 0; k < 120; k++) {
    if (!await p.evaluate(() => !!P)) return;
    const t = await p.evaluate(() => P.queue[P.i].t);
    if (t === 'intro') { await p.click('#go'); continue; }
    if (t === 'speak') { await p.click('#skipSpeak'); continue; }
    if (t === 'match') {
      const n = await p.evaluate(() => P.queue[P.i].pairs.length);
      for (let i = 0; i < n; i++) { await p.click(`[data-ml="${i}"]`); await p.click(`[data-mr="${i}"]`); }
      await p.click('#go'); continue;
    }
    if (t === 'mc' || t === 'listen') {
      const i = await p.evaluate(() => { const e = P.queue[P.i]; return e.opts.indexOf(e.ans); });
      await p.click(`[data-o="${i}"]`);
    } else if (t === 'type' || t === 'dict') {
      await p.fill('#ans', await p.evaluate(() => P.queue[P.i].ans[0]));
    } else if (t === 'order') {
      const tiles = await p.evaluate(() => {
        const e = P.queue[P.i], used = new Set();
        return e.ans.replace(/[.?!,]/g, '').split(' ').map(w => {
          const tile = e.tiles.find(t => t.w === w && !used.has(t.i)); used.add(tile.i); return tile.i;
        });
      });
      for (const i of tiles) await p.click(`#bank [data-t="${i}"]`);
    } else throw new Error('Unexpected exercise ' + t);
    await p.click('#go'); await p.click('#go');
  }
  throw new Error('Exercise loop exceeded 120 items');
}
async function reset(p) {
  await p.evaluate(() => {
    S = fresh(); S.onboarded = true; S.settings.sound = false; S.settings.goal = 20;
    dailyActive = false; save(); go('ma');
  });
}
async function reloadHome(p) { await p.reload(); await p.waitForSelector('#hRound'); }
async function outputOnly(p) {
  await p.evaluate(() => { const s = dailySession(); s.review = true; s.lesson = true; saveDaily(); go('ma'); });
  await p.click('#hRound'); await p.waitForSelector('#dailyAnswer');
}
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  browser = await chromium.launch({ ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), args: ['--no-proxy-server'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 860 }, serviceWorkers: 'block' });
  const p = await context.newPage(), errors = [];
  p.on('pageerror', e => errors.push(e.message));
  await p.goto(`http://127.0.0.1:${server.address().port}/`);
  await p.waitForSelector('[data-l="en"]');
  await reset(p);
  console.log('\nGuided daily path');
  check(await p.locator('.daily-focus .daily-step').count() === 3, 'home presents three ordered stages');
  check(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'mobile home has no horizontal overflow');
  await p.click('#hRound');
  check(await p.evaluate(() => P.kind === 'daily' && P.queue.filter(e => e.t === 'intro').length === 1), 'daily CTA starts the short review');
  await answerAll(p);
  check(await p.evaluate(() => S.dailySessions.en.review === true && !S.dailySessions.en.lesson), 'review completion saves its stage');
  await p.waitForSelector('#dailyContinue');
  await reloadHome(p); await p.click('#hRound');
  check(await p.locator('#startL').count() === 1, 'reload resumes at the lesson rather than repeating review');
  await p.click('#startL'); await answerAll(p);
  check(await p.evaluate(() => S.dailySessions.en.lesson && !!S.lessons[S.dailySessions.en.lessonId].done), 'real lesson completion advances the daily stage');
  await p.click('#dailyContinue'); await p.waitForSelector('#dailyAnswer');
  check(await p.locator('#dailyFeedback [data-say]').count() === 0, 'independent answer starts without revealing a model');
  await p.fill('#dailyAnswer', await p.evaluate(() => dailyOutputItem().it)); await p.click('#dailyCheck');
  check(await p.evaluate(() => S.dailySessions.en.output && S.evidence.some(e => e.kind === 'output' && e.l === 'en')), 'independent answer records completed output evidence');
  await p.click('#dailyFinish');
  const after = await p.evaluate(() => ({ xp: S.xp, evidence: S.evidence.length, rounds: S.rounds[today()] }));
  await p.click('[data-go="ma"]'); await p.click('#hRound');
  check(await p.locator('text=Mai gyakorlás kész').count() === 1, 'completed daily CTA opens its summary');
  check(await p.evaluate(a => S.xp === a.xp && S.evidence.length === a.evidence && S.rounds[today()] === a.rounds, after), 'summary revisit grants no duplicate XP or evidence');
  await reloadHome(p); await p.click('#hRound');
  check(await p.evaluate(a => S.xp === a.xp && S.evidence.length === a.evidence, after), 'completed state survives reload without rewards');

  console.log('\nHelp and mistake persistence');
  await reset(p); await outputOnly(p); await p.click('#dailyHint');
  await reloadHome(p); await p.click('#hRound');
  await p.fill('#dailyAnswer', await p.evaluate(() => dailyOutputItem().it)); await p.click('#dailyCheck');
  check(await p.evaluate(() => S.evidence.length === 1 && S.evidence[0].kind === 'practice'), 'hint remains assisted after reload');
  check(!await p.locator('#dailyFeedback').innerText().then(t => t.includes('Sikerült önállóan')), 'assisted success avoids an independent claim');
  await reset(p); await outputOnly(p); await p.fill('#dailyAnswer', 'completely wrong answer'); await p.click('#dailyCheck');
  check(await p.evaluate(() => !S.dailySessions.en.output && !S.evidence.length), 'wrong output neither completes stage nor creates evidence');
  await reloadHome(p); await p.click('#hRound');
  await p.fill('#dailyAnswer', await p.evaluate(() => dailyOutputItem().it)); await p.click('#dailyCheck');
  check(await p.evaluate(() => S.evidence.length === 1 && S.evidence[0].kind === 'practice'), 'model shown after error stays assisted after reload');

  console.log('\nLanguage and date boundaries');
  const english = await p.evaluate(() => JSON.stringify(S.dailySessions.en));
  await p.evaluate(() => switchLang('es'));
  check(await p.evaluate(() => lang() === 'es' && !S.dailySessions.es.review && !S.dailySessions.es.output), 'Spanish starts its own daily stages');
  check(await p.evaluate(e => JSON.stringify(S.dailySessions.en) === e, english), 'changing language preserves English stages');
  await p.evaluate(() => switchLang('en')); await p.click('#hRound');
  check(await p.locator('text=Mai gyakorlás kész').count() === 1, 'switching back resumes completed English day');
  await p.evaluate(() => { S.dailySessions.en.day = today() - 1; save(); go('ma'); });
  check(await p.evaluate(() => !dailySession().review && !dailySession().output && !dailySession().outputHelp), 'new date resets stages and hint status');

  console.log('\nRecall evidence threshold and deduplication');
  const recalls = await p.evaluate(() => {
    S.evidence = [];
    const c = POOL.find(c => c.ph), e = { cid: c.id, it: c.it, t: 'type' };
    const run = (age, ok = true) => {
      S.cards[c.id] = { ...sched(null, 2, c.id), last: Date.now() - age };
      P = { kind: 'daily', graded: {} }; itemResult(e, ok, null, false); P = null;
      return S.evidence.filter(x => x.kind === 'recall').length;
    };
    const short = run(7 * 864e5 - 10000), failed = run(8 * 864e5, false), week = run(7 * 864e5 + 1000), again = run(8 * 864e5);
    return { short, failed, week, again };
  });
  check(recalls.short === 0 && recalls.failed === 0, 'recent or failed answers create no delayed-recall evidence');
  check(recalls.week === 1 && recalls.again === 1, 'successful week-old answer creates one daily evidence entry');

  console.log('\nCross-device stage merge');
  const merged = await p.evaluate(() => {
    const a = fresh(), b = fresh(), day = today(), item = POOL.find(c => c.ph).id;
    a.updatedAt = 100; b.updatedAt = 200;
    a.dailySessions.en = { day, lessonId: LESSONS[0].id, outputItemId: item, review: true, lesson: true, output: false, outputHelp: true, at: 100 };
    b.dailySessions.en = { day, lessonId: LESSONS[0].id, outputItemId: item, review: true, lesson: false, output: true, at: 200 };
    b.evidence = [{ id: ['en', day, 'output', item].join('|'), key: item, l: 'en', kind: 'output', title: 'Segítség nélkül felidézted', at: 200 }];
    const same = mergeState(a, b);
    b.dailySessions.en.day = day + 1; b.dailySessions.en.lesson = false; b.dailySessions.en.review = false; b.dailySessions.en.output = false;
    const next = mergeState(a, b);
    b.dailySessions.en.day = day; b.dailySessions.en.outputItemId = POOL.find(c => c.ph && c.id !== item).id; b.dailySessions.en.output = true;
    const otherItem = mergeState(a, b);
    b.dailySessions.en.lessonId = LESSONS[1].id; b.dailySessions.en.lesson = false;
    const otherLesson = mergeState(a, b);
    return { same, next, otherItem, otherLesson };
  });
  check(merged.same.dailySessions.en.review && merged.same.dailySessions.en.lesson && merged.same.dailySessions.en.outputHelp, 'stale device cannot undo completed stages or assistance');
  check(merged.same.evidence.some(e => e.kind === 'practice') && !merged.same.evidence.some(e => e.kind === 'output'), 'cross-device hint downgrades unsupported independent evidence');
  check(!merged.next.dailySessions.en.review && !merged.next.dailySessions.en.lesson && !merged.next.dailySessions.en.outputHelp, 'new-day merge does not inherit yesterday\'s completion or help');
  check(!merged.otherItem.dailySessions.en.outputHelp, 'help for a different output item does not contaminate a new answer');
  check(!merged.otherLesson.dailySessions.en.lesson, 'a different selected lesson does not inherit completion');
  check(errors.length === 0, 'daily flows produce no uncaught JavaScript errors: ' + errors.join('; '));
  console.log(`\n${count} guided-session checks passed.`);
})().catch(e => { console.error(e.stack || e); process.exitCode = 1; }).finally(async () => { if (browser) await browser.close(); server.close(); });
