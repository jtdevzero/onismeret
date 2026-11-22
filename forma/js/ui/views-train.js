/* Program, vezetett edzés értékeléssel és szintlépéssel, gyakorlatleírás. */
import { h, clear, fmtSec, uid, toast } from './dom.js';
import { page, card, btn, link, note, list, speak, beep, tickMs, videoSearch, celebrate } from './widgets.js';
import { D, S, lowImpact } from './data.js';
import { itemPut, kvGet } from './store.js';
import { getProgram, setProgram, latestAssessment } from './state.js';
import { ROTATION, SESSION_TITLES, LADDERS, RATINGS, effLadder, baseLadder, buildSession, sessionSteps, sessionMinutes, nextKey, weekInfo, laddersOf, exerciseFor, applyRatings, doseFor, fitSession, phaseOf, freeSession, CYCLE_WEEKS } from '../core/program.js';
import { figureStrip, figureAnim } from './figure.js';
import { weekStrip } from './views-main.js';
import { liveCounter } from './live.js';
import { blockProgress } from './views-extra.js';

const SIDE = { left: 'bal oldal', right: 'jobb oldal', both: 'oldalanként' };
/* rutin vagy saját edzés keresése a kulcs alapján */
export async function freeSessionFor(key) {
  if (key.startsWith('routine-')) { const r = D.routines.find(x => 'routine-' + x.id === key); return r ? freeSession(key, r.name, r.blocks, D.ex) : null; }
  if (key.startsWith('custom-')) { const c = ((await kvGet('custom', [])) || []).find(x => 'custom-' + x.id === key); return c ? freeSession(key, c.name, c.blocks, D.ex) : null; }
  return null;
}
/* rezgés (ha a készülék tudja): edzés közben hang nélkül is jelez */
const buzz = p => { try { if (navigator.vibrate) navigator.vibrate(p); } catch { /* nem létfontosságú */ } };
/* Kör alakú visszaszámláló: a gyűrű a hátralévő idő arányában fogy, a szám a közepén. */
const SVGNS = 'http://www.w3.org/2000/svg';
function ringClock(clock) {
  const R = 54, C = 2 * Math.PI * R;
  const mk = (tag, a) => { const e = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, String(v)); return e; };
  const svg = mk('svg', { viewBox: '0 0 120 120', class: 'ring-svg', 'aria-hidden': 'true' });
  const bg = mk('circle', { cx: 60, cy: 60, r: R, class: 'ring-bg' }), fg = mk('circle', { cx: 60, cy: 60, r: R, class: 'ring-fg', 'stroke-dasharray': C.toFixed(1), 'stroke-dashoffset': '0' });
  svg.append(bg, fg);
  const el = h('div', { class: 'ring' }, svg, clock);
  return { el, set: f => fg.setAttribute('stroke-dashoffset', (C * (1 - Math.max(0, Math.min(1, f)))).toFixed(1)) };
}
const doseText = b => (b.seconds ? fmtSec(b.seconds) : b.reps + ' ism.') + (D.ex[b.exercise] && D.ex[b.exercise].perSide ? ' oldalanként' : '') + (b.sets > 1 ? ' × ' + b.sets : '');
const lvlDots = (level, max) => h('span', { class: 'lvl', role: 'img', 'aria-label': `${level + 1}. szint a ${max}-ből` }, Array.from({ length: max }, (_, i) => h('i', { class: i <= level ? 'on' : '' })));

export async function programView() {
  const prog = await getProgram();
  if (!prog) {
    const last = await latestAssessment();
    return page('Program', h('p', null, last ? 'Még nincs programod. Készítsd el a felmérésed eredményéből.' : 'A program a felmérésedből készül.'),
      link(last ? '#/result' : '#/assess', last ? 'Eredmény és program' : 'Felmérés indítása', 'btn primary'));
  }
  const wk = weekInfo(prog.start), key = nextKey(prog), lad = laddersOf(D.exercises.exercises);
  const sessions = [...new Set(ROTATION)].map(k => {
    const s = fitSession(buildSession(k, prog, D.exercises.exercises), D.ex, S.settings.duration || 0), steps = sessionSteps(s, D.ex);
    return h('details', { class: 'card' }, h('summary', null, h('h2', null, s.title), h('span', { class: 'badge' + (k === key ? ' good' : '') }, k === key ? 'Következik' : sessionMinutes(steps) + ' perc')),
      h('ol', { class: 'blocks' }, s.blocks.map(b => h('li', null, link('#/ex/' + b.exercise, D.ex[b.exercise].name), h('span', { class: 'muted small' }, ' · ' + doseText(b) + (b.part === 'mobility' ? ' · mobilitás' : ''))))),
      h('div', { class: 'row' }, link('#/check/' + k, k === key ? 'Indítás' : 'Ezt csinálom inkább', 'btn' + (k === key ? ' primary' : ' small'))));
  });
  return page('Program',
    h('p', { class: 'muted' }, `${wk.week}. hét (a ${wk.cycle}. ciklus ${wk.cycleWeek}. hete a ${CYCLE_WEEKS}-ből)` + (prog.lowImpact ? ' · kímélő mód' : '')),
    h('section', { class: 'card accent' }, h('h2', null, `A ciklus fókusza: ${phaseOf(wk.cycle).name}`), h('p', null, phaseOf(wk.cycle).about),
      h('div', { class: 'timeline', role: 'img', 'aria-label': `A ${CYCLE_WEEKS} hetes ciklus: most a ${wk.cycleWeek}. hét` }, Array.from({ length: CYCLE_WEEKS }, (_, i) => h('span', { class: 'tl-week' + (i + 1 < wk.cycleWeek ? ' past' : i + 1 === wk.cycleWeek ? ' now' : '') + (i + 1 === CYCLE_WEEKS ? ' deload' : '') }, i + 1 === CYCLE_WEEKS ? 'könnyű' : `${i + 1}. hét`))),
      h('p', { class: 'small muted' }, 'A 6 hetes ciklusok fókusza váltakozik: alapozás → erő → robbanékonyság, majd újra elölről.')),
    wk.deload ? note('Könnyített hét: kevesebb kör, a kezdő ismétlésszámokkal. A hét végén mérd fel újra magad.', 'warn') : null,
    card(h('h2', null, 'Forgó rend'), weekStrip(prog), h('p', { class: 'small muted' }, '3 erőnap, 2 gyorsasági nap és 2 mobilitásnap. Minden edzés napi mobilitással kezdődik. Az ismétlésszám hétről hétre nő, a gyakorlat pedig nehezebbre vált, ha kétszer egymás után könnyűnek értékeled.')),
    sessions,
    card(h('h2', null, 'Állóképesség'), h('p', null, 'A forgó rend mellé heti 150 perc kardió: tempós séta, kocogás vagy kerékpár, a pulzustartományodban.'), h('div', { class: 'row' }, link('#/cardio', 'Kardió napló és pulzuszónák', 'btn'))),
    card(h('h2', null, 'Szintjeid'), h('ul', { class: 'rows' }, LADDERS.filter(l => effLadder(baseLadder(l), prog.equipment) === l).map(l => {
      const ex = exerciseFor(lad, l, prog.levels[l], prog.lowImpact);
      return ex ? h('li', null, h('span', { class: 'log-item' }, h('strong', null, D.exercises.ladders[l]), link('#/ex/' + ex.id, ex.name)), lvlDots(prog.levels[l] ?? 0, lad[l].length)) : null;
    }))));
}

/* Vezetett edzés: lépésről lépésre, időzítővel, pihenővel, hangos bemondással; a gyakorlatok végén értékelés. */
export async function sessionView(key, onCleanup) {
  const prog = (await getProgram()) || { levels: {}, done: 0 };
  const [k0, mode] = String(key || '').split('.');
  const light = mode === 'light';
  key = k0;
  /* önálló edzés: rutin (routine-…) vagy saját összeállítás (custom-…) */
  const free = await freeSessionFor(key);
  if (!free && (!SESSION_TITLES[key] || !prog.start)) return page('Nincs ilyen edzés', link('#/program', '← Program', 'btn'));
  const session = free || fitSession(buildSession(key, prog, D.exercises.exercises, Date.now(), { light }), D.ex, S.settings.duration || 0), steps = sessionSteps(session, D.ex), total = steps.length, started = Date.now();
  const ratings = {};
  let at = 0, left = 0, timer = null, running = false, wake = null, finished = false;
  const voice = h('input', { type: 'checkbox', checked: true });
  const bar = h('progress', { max: total, value: 0, 'aria-label': 'Az edzés előrehaladása' });
  const count = h('p', { class: 'muted small' });
  const stage = h('div', { class: 'workout', 'aria-live': 'polite' });
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } running = false; };
  const release = () => { stop(); if (wake) { wake.release().catch(() => {}); wake = null; } try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch { /* a hang nem létfontosságú */ } };
  onCleanup(release);
  try { wake = await navigator.wakeLock.request('screen'); } catch { wake = null; }

  const advance = () => { stop(); at++; if (at >= total) finish(false); else show(); };
  /* az utolsó kör után megkérdezzük, milyen volt: ebből jön a szintlépés */
  const next = () => {
    const st = steps[at];
    if (st && st.rate && !ratings[st.rate]) { stop(); askRating(st); return; }
    advance();
  };
  const back = () => { stop(); if (at > 0) { at--; show(); } };

  function askRating(st) {
    const ex = D.ex[st.exercise];
    clear(stage).append(card(h('p', { class: 'workout-kicker' }, 'Milyen volt?'), h('h2', { class: 'workout-title' }, ex.name),
      h('p', null, 'Az utolsó kör alapján. Ha kétszer egymás után könnyű, a következő edzéstől nehezebb változatot kapsz.'),
      h('div', { class: 'rate' }, RATINGS.map(([k, t]) => btn(t, () => { ratings[st.rate] = k; advance(); }, k === 'ok' ? 'primary' : '')))));
    speak('Milyen volt?', voice.checked);
  }

  async function finish(partial) {
    if (finished) return;
    finished = true; release();
    const minutes = Math.max(1, Math.round((Date.now() - started) / 60000));
    let changes = [];
    if (session.free) {
      if (key.startsWith('routine-')) await blockProgress(key.slice(8));
      await itemPut({ id: uid(), kind: 'workout', date: Date.now(), key: key.startsWith('routine-') ? 'routine' : 'custom', title: session.title, minutes, steps: total, partial, ratings: {}, changes: [] });
    } else {
      const fresh = (await getProgram()) || prog;
      const res = applyRatings(fresh, ratings, D.exercises.exercises);
      changes = res.changes;
      /* a forgó rendben csak a soron következő edzés teljesítése lép tovább */
      const done = key === nextKey(fresh) ? (fresh.done || 0) + 1 : fresh.done || 0;
      await setProgram({ ...res.state, done, lastDone: Date.now() });
      await itemPut({ id: uid(), kind: 'workout', date: Date.now(), key, minutes, steps: total, partial, ratings, changes, light });
    }
    speak('Kész az edzés. Szép munka!', voice.checked);
    if (changes.some(c => c.to > c.from)) celebrate();
    beep(880, 200);
    bar.value = total; count.textContent = `${total} / ${total} lépés`;
    const lad = laddersOf(D.exercises.exercises);
    clear(stage).append(card(h('h2', null, 'Edzés kész'),
      h('p', { class: 'lead' }, `${session.title}, ${minutes} perc.`),
      changes.length ? h('div', null, h('h3', null, 'Szintváltás'), list(changes.map(c => {
        const a = exerciseFor(lad, c.ladder, c.from, lowImpact()), b = exerciseFor(lad, c.ladder, c.to, lowImpact());
        return (c.to > c.from ? 'Feljebb: ' : 'Visszább: ') + (a ? a.name : '') + ' → ' + (b ? b.name : '');
      }))) : null,
      h('p', null, 'Bekerült a naplódba.'),
      h('p', { class: 'small muted' }, 'Ha van még 4 perced: a levezetés csökkenti a másnapi merevséget.'),
      h('div', { class: 'row' }, link('#/cooldown', 'Levezetés (4 perc)', 'btn primary'), link('#/', 'Kezdőlap', 'btn'), link('#/log', 'Napló', 'btn small'))));
  }

  /* Gyakorlatcsere erre az edzésre: a sor eggyel könnyebb vagy nehezebb tagja, azonos adagolási formával.
     A cserélt gyakorlat nem kér értékelést, hogy a szintlépés a kiírt gyakorlatra vonatkozzon. */
  const lad = laddersOf(D.exercises.exercises);
  const neighbor = (ex, dir) => {
    const list = lad[ex.ladder] || [], i = list.indexOf(ex) + dir, n = list[i];
    if (!n || (prog.lowImpact && n.impact) || !!n.dose.reps !== !!ex.dose.reps || !!n.perSide !== !!ex.perSide) return null;
    return n;
  };
  function swapTo(blockIdx, n) {
    const d = doseFor(n, session.week.cycleWeek, session.week.deload);
    for (const s of steps) if (s.block === blockIdx && s.type !== 'rest') { s.exercise = n.id; s.rate = undefined; if (s.reps) s.reps = d.reps; if (s.seconds) s.seconds = d.seconds; }
    toast('Erre az edzésre: ' + n.name);
    stop(); show();
  }
  function swapRow(st, ex) {
    const easier = neighbor(ex, -1), harder = neighbor(ex, 1);
    if (!easier && !harder) return null;
    return h('div', { class: 'row swap' }, easier ? btn('Könnyebbre cserélem', () => swapTo(st.block, easier), 'small') : null, harder ? btn('Nehezebbre cserélem', () => swapTo(st.block, harder), 'small') : null);
  }
  let liveStop = null;
  onCleanup(() => { if (liveStop) liveStop(); });
  function show() {
    if (liveStop) { liveStop(); liveStop = null; }
    const st = steps[at];
    buzz(st.type === 'rest' ? 60 : [40, 40, 40]);
    bar.value = at; count.textContent = `${at + 1} / ${total} lépés`;
    const nav = h('div', { class: 'row' },
      at > 0 ? btn('Vissza', back, 'small') : null,
      btn('Befejezés most', () => { if (confirm('Befejezed most az edzést? A hátralévő lépések kimaradnak, de az edzés bekerül a naplóba.')) finish(true); }, 'small'));
    const clock = h('div', { class: 'workout-clock', role: 'timer' });
    const full = st.seconds || 1;
    const ring = ringClock(clock);
    const draw = () => { clock.textContent = left >= 60 ? Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0') : String(left); ring.set(left / full); };
    const run = () => {
      if (running) return;
      running = true;
      timer = setInterval(() => {
        left--; draw();
        if (left === 3) speak('három', voice.checked);
        if (left <= 0) { beep(660, 120); buzz([120, 60, 120]); next(); }
      }, tickMs());
    };
    if (st.type === 'rest') {
      const after = steps[at + 1];
      left = st.seconds; draw();
      clear(stage).append(card(h('p', { class: 'workout-kicker' }, 'Pihenő'), ring.el,
        after ? h('p', null, 'Következik: ', h('strong', null, D.ex[after.exercise].name)) : null,
        h('div', { class: 'row' }, btn('Pihenő kihagyása', next, 'primary'))), nav);
      speak('Pihenő', voice.checked);
      run();
      return;
    }
    const ex = D.ex[st.exercise];
    const kicker = [st.part === 'mobility' ? 'Mobilitás' : st.part === 'warmup' ? null : D.exercises.typeNames[ex.type], st.sets > 1 ? `${st.set}. kör / ${st.sets}` : null].filter(Boolean).join(' · ');
    const head = [kicker ? h('p', { class: 'workout-kicker' }, kicker) : null, h('h2', { class: 'workout-title' }, ex.name)];
    const points = h('ul', { class: 'plain' }, ex.points.map(p => h('li', null, p)));
    const more = link('#/ex/' + ex.id, 'Leírás');
    const swap = st.part === 'main' ? swapRow(st, ex) : null;
    if (st.seconds) {
      left = st.seconds; draw();
      const go = btn('Indítás', () => { go.hidden = true; pause.hidden = false; run(); }, 'primary');
      const pause = btn('Szünet', () => { if (running) { stop(); pause.textContent = 'Folytatás'; } else { pause.textContent = 'Szünet'; run(); } });
      pause.hidden = true;
      clear(stage).append(card(head, st.side ? h('p', { class: 'badge' }, SIDE[st.side]) : null, figureAnim(D.figures[ex.figure], { compact: true }), ring.el, points,
        h('div', { class: 'row' }, go, pause, btn('Kész, tovább', next)), swap, more), nav);
      speak(ex.name + (st.side ? ', ' + SIDE[st.side] : '') + ', ' + st.seconds + ' másodperc', voice.checked);
    } else {
      const live = st.part === 'main' ? liveCounter(ex.id, { startLabel: 'Számolj kamerával' }) : null;
      if (live) liveStop = live.stop;
      clear(stage).append(card(head, figureAnim(D.figures[ex.figure], { compact: true }), h('div', { class: 'workout-clock reps' }, String(st.reps)),
        h('p', { class: 'workout-unit' }, 'ismétlés' + (st.side === 'both' ? ' oldalanként' : '')), points,
        h('div', { class: 'row' }, btn('Kész, tovább', next, 'primary')), swap,
        live ? h('details', { class: 'live-box' }, h('summary', null, 'Számolás kamerával'), live.el) : null, more), nav);
      speak(ex.name + ', ' + st.reps + ' ismétlés' + (st.side === 'both' ? ' oldalanként' : '') + (S.settings.voiceMode ? '. ' + ex.points.join('. ') : ''), voice.checked);
      /* hangos módban az ismétlések becsült ideje után magától továbblép */
      if (S.settings.voiceMode) { left = st.reps * 3 * (st.side === 'both' ? 2 : 1) + 6; running = true; timer = setInterval(() => { left--; if (left === 3) speak('három', voice.checked); if (left <= 0) { beep(660, 120); next(); } }, tickMs()); }
    }
  }
  /* lapozás: balra húzva tovább, jobbra húzva vissza (az értékelésnél nem) */
  let sx = null, sy = null;
  stage.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') { sx = e.clientX; sy = e.clientY; } });
  stage.addEventListener('pointerup', e => {
    if (sx == null || finished) return;
    const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6 || stage.querySelector('.rate')) return;
    if (dx < 0) next(); else back();
  });
  show();
  if (S.settings.voiceMode) stage.classList.add('voice-mode');
  return page(session.title,
    h('p', { class: 'muted' }, `Kb. ${sessionMinutes(steps)} perc · ${session.blocks.length} gyakorlat` + (session.week.deload ? ' · könnyített hét' : '') + (light ? ' · könnyített edzés, értékelés nélkül' : '') + (session.fit ? ` · ${session.fit.target} perces keretre igazítva` : '')),
    bar, h('div', { class: 'row tight workout-meta' }, count, h('label', { class: 'check' }, voice, h('span', null, 'Hangos bemondás'))),
    h('p', { class: 'small muted swipe-hint' }, 'Tipp: balra húzva a következő lépésre ugrasz, jobbra húzva vissza.'),
    session.complaints.length ? note('Panaszmód: ' + session.complaints.map(c => ({ knee: 'térd', back: 'derék', shoulder: 'váll' })[c]).join(', ') + '. Csak fájdalommentes tartományban mozogj.', 'warn') : null,
    note('Ha valami fáj, hagyd ki, vagy válts könnyebbre. Szédülés vagy mellkasi panasz esetén azonnal állj meg.', 'small'),
    stage);
}

export async function exerciseView(id, onCleanup) {
  const ex = D.ex[id];
  const live = ex ? liveCounter(id, { startLabel: 'Végrehajtás kamerával' }) : null;
  if (live) onCleanup(live.stop);
  if (!ex) return page('Nincs ilyen gyakorlat', link('#/program', '← Program', 'btn'));
  const lad = ex.ladder ? laddersOf(D.exercises.exercises)[ex.ladder] : null;
  const dose = ex.dose.reps ? `${ex.dose.reps[0]}–${ex.dose.reps[1]} ismétlés` : `${ex.dose.seconds[0]}–${ex.dose.seconds[1]} másodperc`;
  return page(ex.name,
    h('p', { class: 'muted' }, D.exercises.typeNames[ex.type] + ' · ' + dose + (ex.perSide ? ' oldalanként' : '') + (ex.impact ? ' · ugrásos' : '')),
    card(h('h2', null, 'Hogyan csináld'), figureAnim(D.figures[ex.figure]), figureStrip(D.figures[ex.figure], true), h('p', null, ex.how), h('h3', null, 'Három dolog, amire figyelj'), list(ex.points), videoSearch(ex)),
    live ? card(h('h2', null, 'Számolás és formaellenőrzés kamerával'), live.el) : null,
    lad ? card(h('h2', null, D.exercises.ladders[ex.ladder]), h('p', { class: 'small muted' }, 'A gyakorlatsor szintjei, a legkönnyebbtől:'),
      h('ol', null, lad.map(e => h('li', null, e.id === id ? h('strong', null, e.name) : link('#/ex/' + e.id, e.name), e.impact ? h('span', { class: 'muted small' }, ' · ugrásos') : null)))) : null,
    D.exercises.reviewed ? null : note('A leírásokat szakember még nem lektorálta.', 'small'),
    h('div', { class: 'row' }, btn('← Vissza', () => history.back())));
}
