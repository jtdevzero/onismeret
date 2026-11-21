/* Program, vezetett edzés értékeléssel és szintlépéssel, gyakorlatleírás. */
import { h, clear, fmtSec, uid, toast } from './dom.js';
import { page, card, btn, link, note, list, speak, beep, tickMs, videoSearch } from './widgets.js';
import { D, lowImpact } from './data.js';
import { itemPut } from './store.js';
import { getProgram, setProgram, latestAssessment } from './state.js';
import { ROTATION, SESSION_TITLES, LADDERS, RATINGS, pullLadder, buildSession, sessionSteps, sessionMinutes, nextKey, weekInfo, laddersOf, exerciseFor, applyRatings, CYCLE_WEEKS } from '../core/program.js';
import { figureStrip } from './figure.js';
import { weekStrip } from './views-main.js';
import { liveCounter } from './live.js';

const SIDE = { left: 'bal oldal', right: 'jobb oldal', both: 'oldalanként' };
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
    const s = buildSession(k, prog, D.exercises.exercises), steps = sessionSteps(s, D.ex);
    return h('details', { class: 'card' }, h('summary', null, h('h2', null, s.title), h('span', { class: 'badge' + (k === key ? ' good' : '') }, k === key ? 'Következik' : sessionMinutes(steps) + ' perc')),
      h('ol', { class: 'blocks' }, s.blocks.map(b => h('li', null, link('#/ex/' + b.exercise, D.ex[b.exercise].name), h('span', { class: 'muted small' }, ' · ' + doseText(b) + (b.part === 'mobility' ? ' · mobilitás' : ''))))),
      h('div', { class: 'row' }, link('#/check/' + k, k === key ? 'Indítás' : 'Ezt csinálom inkább', 'btn' + (k === key ? ' primary' : ' small'))));
  });
  return page('Program',
    h('p', { class: 'muted' }, `${wk.week}. hét (a ${wk.cycle}. ciklus ${wk.cycleWeek}. hete a ${CYCLE_WEEKS}-ből)` + (prog.lowImpact ? ' · kímélő mód' : '')),
    wk.deload ? note('Könnyített hét: kevesebb kör, a kezdő ismétlésszámokkal. A hét végén mérd fel újra magad.', 'warn') : null,
    card(h('h2', null, 'Forgó rend'), weekStrip(prog), h('p', { class: 'small muted' }, '3 erőnap, 2 gyorsasági nap és 2 mobilitásnap. Minden edzés napi mobilitással kezdődik. Az ismétlésszám hétről hétre nő, a gyakorlat pedig nehezebbre vált, ha kétszer egymás után könnyűnek értékeled.')),
    sessions,
    card(h('h2', null, 'Állóképesség'), h('p', null, 'A forgó rend mellé heti 150 perc kardió: tempós séta, kocogás vagy kerékpár, a pulzustartományodban.'), h('div', { class: 'row' }, link('#/cardio', 'Kardió napló és pulzuszónák', 'btn'))),
    card(h('h2', null, 'Szintjeid'), h('ul', { class: 'rows' }, LADDERS.filter(l => !l.startsWith('pull') || l === pullLadder(prog.equipment)).map(l => {
      const ex = exerciseFor(lad, l, prog.levels[l], prog.lowImpact);
      return ex ? h('li', null, h('span', { class: 'log-item' }, h('strong', null, D.exercises.ladders[l]), link('#/ex/' + ex.id, ex.name)), lvlDots(prog.levels[l] ?? 0, lad[l].length)) : null;
    }))));
}

/* Vezetett edzés: lépésről lépésre, időzítővel, pihenővel, hangos bemondással; a gyakorlatok végén értékelés. */
export async function sessionView(key, onCleanup) {
  const prog = await getProgram();
  const [k0, mode] = String(key || '').split('.');
  const light = mode === 'light';
  key = k0;
  if (!prog || !SESSION_TITLES[key]) return page('Nincs ilyen edzés', link('#/program', '← Program', 'btn'));
  const session = buildSession(key, prog, D.exercises.exercises, Date.now(), { light }), steps = sessionSteps(session, D.ex), total = steps.length, started = Date.now();
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
    const fresh = (await getProgram()) || prog;
    const { state, changes } = applyRatings(fresh, ratings, D.exercises.exercises);
    /* a forgó rendben csak a soron következő edzés teljesítése lép tovább */
    const done = key === nextKey(fresh) ? (fresh.done || 0) + 1 : fresh.done || 0;
    await setProgram({ ...state, done, lastDone: Date.now() });
    await itemPut({ id: uid(), kind: 'workout', date: Date.now(), key, minutes, steps: total, partial, ratings, changes, light });
    speak('Kész az edzés. Szép munka!', voice.checked);
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
      h('div', { class: 'row' }, link('#/', 'Kezdőlap', 'btn primary'), link('#/log', 'Napló', 'btn'))));
  }

  let liveStop = null;
  onCleanup(() => { if (liveStop) liveStop(); });
  function show() {
    if (liveStop) { liveStop(); liveStop = null; }
    const st = steps[at];
    bar.value = at; count.textContent = `${at + 1} / ${total} lépés`;
    const nav = h('div', { class: 'row' },
      at > 0 ? btn('Vissza', back, 'small') : null,
      btn('Befejezés most', () => { if (confirm('Befejezed most az edzést? A hátralévő lépések kimaradnak, de az edzés bekerül a naplóba.')) finish(true); }, 'small'));
    const clock = h('div', { class: 'workout-clock', role: 'timer' });
    const draw = () => { clock.textContent = left >= 60 ? Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0') : String(left); };
    const run = () => {
      if (running) return;
      running = true;
      timer = setInterval(() => {
        left--; draw();
        if (left === 3) speak('három', voice.checked);
        if (left <= 0) { beep(660, 120); next(); }
      }, tickMs());
    };
    if (st.type === 'rest') {
      const after = steps[at + 1];
      left = st.seconds; draw();
      clear(stage).append(card(h('p', { class: 'workout-kicker' }, 'Pihenő'), clock,
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
    if (st.seconds) {
      left = st.seconds; draw();
      const go = btn('Indítás', () => { go.hidden = true; pause.hidden = false; run(); }, 'primary');
      const pause = btn('Szünet', () => { if (running) { stop(); pause.textContent = 'Folytatás'; } else { pause.textContent = 'Szünet'; run(); } });
      pause.hidden = true;
      clear(stage).append(card(head, st.side ? h('p', { class: 'badge' }, SIDE[st.side]) : null, figureStrip(D.figures[ex.figure], true), clock, points,
        h('div', { class: 'row' }, go, pause, btn('Kész, tovább', next)), more), nav);
      speak(ex.name + (st.side ? ', ' + SIDE[st.side] : '') + ', ' + st.seconds + ' másodperc', voice.checked);
    } else {
      const live = st.part === 'main' ? liveCounter(ex.id, { startLabel: 'Számolj kamerával' }) : null;
      if (live) liveStop = live.stop;
      clear(stage).append(card(head, figureStrip(D.figures[ex.figure], true), h('div', { class: 'workout-clock' }, String(st.reps)),
        h('p', { class: 'workout-unit' }, 'ismétlés' + (st.side === 'both' ? ' oldalanként' : '')), points,
        h('div', { class: 'row' }, btn('Kész, tovább', next, 'primary')),
        live ? h('details', { class: 'live-box' }, h('summary', null, 'Számolás kamerával'), live.el) : null, more), nav);
      speak(ex.name + ', ' + st.reps + ' ismétlés' + (st.side === 'both' ? ' oldalanként' : ''), voice.checked);
    }
  }
  show();
  return page(session.title,
    h('p', { class: 'muted' }, `Kb. ${sessionMinutes(steps)} perc · ${session.blocks.length} gyakorlat` + (session.week.deload ? ' · könnyített hét' : '') + (light ? ' · könnyített edzés, értékelés nélkül' : '')),
    bar, h('div', { class: 'row tight workout-meta' }, count, h('label', { class: 'check' }, voice, h('span', null, 'Hangos bemondás'))),
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
    card(h('h2', null, 'Hogyan csináld'), figureStrip(D.figures[ex.figure]), h('p', null, ex.how), h('h3', null, 'Három dolog, amire figyelj'), list(ex.points), videoSearch(ex)),
    live ? card(h('h2', null, 'Számolás és formaellenőrzés kamerával'), live.el) : null,
    lad ? card(h('h2', null, D.exercises.ladders[ex.ladder]), h('p', { class: 'small muted' }, 'A gyakorlatsor szintjei, a legkönnyebbtől:'),
      h('ol', null, lad.map(e => h('li', null, e.id === id ? h('strong', null, e.name) : link('#/ex/' + e.id, e.name), e.impact ? h('span', { class: 'muted small' }, ' · ugrásos') : null)))) : null,
    D.exercises.reviewed ? null : note('A leírásokat szakember még nem lektorálta.', 'small'),
    h('div', { class: 'row' }, btn('← Vissza', () => history.back())));
}
