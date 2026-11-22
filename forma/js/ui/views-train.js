/* Program, vezetett edzés értékeléssel és szintlépéssel, gyakorlatleírás. */
import { h, clear, fmtSec, fmtDate, uid, toast } from './dom.js';
import { page, card, btn, link, note, list, speak, beep, tickMs, videoSearch, celebrate } from './widgets.js';
import { D, S, lowImpact } from './data.js';
import { itemPut, itemGet, itemsAll, kvGet, kvDelete, checkpointSession, completeSession, storageEpoch } from './store.js';
import { getProgram, setProgram, latestAssessment } from './state.js';
import { ROTATION, SESSION_TITLES, LADDERS, RATINGS, effLadder, baseLadder, buildSession, sessionSteps, sessionMinutes, nextKey, weekInfo, laddersOf, exerciseFor, applyRatings, doseFor, fitSession, phaseOf, freeSession, partnerSteps, GOALS, CYCLE_WEEKS } from '../core/program.js';
import { figureStrip, figureAnim } from './figure.js';
import { weekStrip } from './views-main.js';
import { liveCounter } from './live.js';
import { blockProgress } from './views-extra.js';

import { remaining, validSession } from '../core/session.js';

const SIDE = { left: 'bal oldal', right: 'jobb oldal', both: 'oldalanként' };
/* az elvégzett mennyiség (ismétlés vagy másodperc) edzésről edzésre, apró oszlopdiagramon */
function exSpark(hist) {
  const vals = hist.slice(-12).map(x => x.reps || x.seconds || x.sets), max = Math.max(...vals, 1);
  return h('div', { class: 'ex-bars', role: 'img', 'aria-label': 'Az utolsó edzések mennyisége: ' + vals.join(', ') }, vals.map(v => { const b = h('span'); b.style.height = Math.max(8, Math.round(100 * v / max)) + '%'; return b; }));
}
/* Jegyzet az edzéshez: egy mondat, ami később a naplóban visszaolvasható (szövegként jelenik meg, nem HTML-ként). */
function noteBox(id) {
  const ta = h('textarea', { maxLength: 280, rows: 2, class: 'note-input', placeholder: 'Pl. a bal térdem kicsit érezte a kitörést', 'aria-label': 'Jegyzet ehhez az edzéshez' });
  const save = btn('Jegyzet mentése', async () => {
    const t = ta.value.trim(); if (!t) return;
    const it = await itemGet(id); if (!it) return;
    await itemPut({ ...it, note: t.slice(0, 280) }); toast('Elmentettem a jegyzetet.'); save.disabled = true;
  }, 'small');
  return h('div', { class: 'note-box' }, h('label', { class: 'field' }, 'Egy mondat a mai edzésről (nem kötelező)', ta), save);
}

function feedbackBox(id) {
  const field = (label, options) => h('label', { class: 'field' }, label, h('select', { 'aria-label': label }, h('option', { value: '' }, 'Nem adom meg'), options.map(([value, text]) => h('option', { value }, text))));
  const effort = field('Terhelés', [['easy', 'Könnyű'], ['ok', 'Megfelelő'], ['hard', 'Nehéz']]);
  const pain = field('Fájdalom', [['none', 'Nem volt'], ['yes', 'Volt – megálltam / kihagytam']]);
  const mood = field('Közérzet utána', [['better', 'Jobb'], ['same', 'Változatlan'], ['worse', 'Rosszabb']]);
  const save = btn('Visszajelzés mentése', async () => {
    try { const it = await itemGet(id); if (!it) return;
      await itemPut({ ...it, feedback: { effort: effort.querySelector('select').value, pain: pain.querySelector('select').value, mood: mood.querySelector('select').value } });
      toast('Elmentettem a visszajelzést.'); save.disabled = true;
    } catch { toast('Nem sikerült menteni. Próbáld újra.'); }
  }, 'small');
  return h('details', { class: 'section' }, h('summary', null, 'Hogy esett? (nem kötelező)'), effort, pain, mood, h('p', { class: 'small muted' }, 'Fájdalomnál ne folytasd az érintett gyakorlatot. A válasz nem állít fel diagnózist és nem emeli a terhelést.'), save);
}

export function equipmentText(ex) {
  const parts = [];
  const gear = { bar: 'Húzódzkodó rúd', band: 'Gumiszalag', dumbbell: 'Kézisúlyzó / kettlebell' }[ex.equipment];
  if (gear) parts.push(gear);
  if (/table_row|push_incline/.test(ex.id)) parts.push('Stabil, elmozdulás ellen biztosított asztal');
  else if (/squat_box|pistol_box|bulgarian|push_decline|db_row/.test(ex.id)) parts.push('Stabil, csúszásmentes szék / pad');
  else if (ex.id === 'sl_hip_thrust') parts.push('Stabil kanapé / pad');
  else if (/wall/.test(ex.id)) parts.push('Szabad falfelület');
  return parts.join(' + ') || 'Külön sporteszköz nélkül';
}
export async function prepareView(arg) {
  const [key, ...modes] = String(arg || '').split('.'), prog = await getProgram();
  const free = await freeSessionFor(key);
  if (!free && (!prog || !SESSION_TITLES[key])) return page('Válassz edzést', link('#/program', 'Program', 'btn primary'));
  const quiet = modes.includes('quiet');
  const session = free || fitSession(buildSession(key, quiet ? { ...prog, lowImpact: true } : prog, D.exercises.exercises, Date.now(), { light: modes.includes('light') }), D.ex, modes.includes('quick10') ? 10 : S.settings.duration || 0);
  const steps = sessionSteps(session, D.ex), equipment = [...new Set(session.blocks.map(b => equipmentText(D.ex[b.exercise])))];
  const previewBlocks = [...new Set([session.blocks.find(b => b.part === 'warmup'), session.blocks.find(b => b.part === 'mobility'), ...session.blocks.filter(b => b.part === 'main'), ...session.blocks].filter(Boolean))].slice(0, 6);
  return page('Edzés előtt', card(h('p', { class: 'eyebrow' }, 'Mai terv'), h('h2', null, session.title),
    h('p', { class: 'lead' }, `Kb. ${sessionMinutes(steps)} perc · ${session.blocks.length} gyakorlat`),
    modes.includes('quick10') ? note('A 10 perc célkeret. A bemelegítés és a biztonságos pihenők miatt a becsült idő ennél hosszabb is lehet.', 'small') : null,
    quiet ? note('Ugrásmentes összeállítás. A talajra lépés hangja a felülettől és a végrehajtástól is függ.', 'small') : null,
    h('p', null, 'Készítsd elő: ' + equipment.join(' · ') + '.'),
    h('div', { class: 'session-preview' }, previewBlocks.map(b => h('a', { href: '#/ex/' + b.exercise }, figureAnim(D.figures[D.ex[b.exercise].figure], { compact: true, still: true }), h('strong', null, D.ex[b.exercise].name), h('span', { class: 'small muted' }, doseText(b))))),
    h('details', null, h('summary', null, 'Teljes gyakorlatsor'), list(session.blocks.map(b => D.ex[b.exercise].name + ' · ' + doseText(b)))),
    note('Legyen szabad, csúszásmentes helyed. Nézd át a mozdulatokat, és csak fájdalommentesen kezdd el.', 'small'),
    link('#/session/' + arg, 'Edzés indítása', 'btn primary')));
}

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
    h('section', { class: 'card accent' }, h('h2', null, `A ciklus fókusza: ${phaseOf((prog.cycleBase || 0) + wk.cycle).name}`), h('p', null, phaseOf((prog.cycleBase || 0) + wk.cycle).about),
      h('div', { class: 'timeline', role: 'img', 'aria-label': `A ${CYCLE_WEEKS} hetes ciklus: most a ${wk.cycleWeek}. hét` }, Array.from({ length: CYCLE_WEEKS }, (_, i) => h('span', { class: 'tl-week' + (i + 1 < wk.cycleWeek ? ' past' : i + 1 === wk.cycleWeek ? ' now' : '') + (i + 1 === CYCLE_WEEKS ? ' deload' : '') }, i + 1 === CYCLE_WEEKS ? `${i + 1}. ↓` : `${i + 1}.`))),
      h('p', { class: 'small muted' }, `${wk.cycleWeek}. hét a ${CYCLE_WEEKS}-ből; a ${CYCLE_WEEKS}. (↓) könnyített hét, utána újramérés.`),
      h('p', { class: 'small muted' }, 'A ciklusok fókusza váltakozik: alapozás → erő → robbanékonyság, majd újra elölről.')),
    wk.deload ? note('Könnyített hét: kevesebb kör, a kezdő ismétlésszámokkal. A hét végén mérd fel újra magad.', 'warn') : null,
    card(h('h2', null, 'Forgó rend'), weekStrip(prog), h('p', { class: 'small muted' }, '3 erőnap, 2 gyorsasági nap és 2 mobilitásnap. Minden edzés napi mobilitással kezdődik. Az ismétlésszám hétről hétre nő, a gyakorlat pedig nehezebbre vált, ha kétszer egymás után könnyűnek értékeled.')),
    sessions,
    card(h('h2', null, 'Célprogram'), h('p', { class: 'small muted' }, 'Ha van egy konkrét célod, az a gyakorlatsor minden erőnapon plusz kört kap, a gyorsasági és mobilitásnapokon pedig egy rövid blokkot.'),
      h('label', { class: 'field' }, 'Fókusz', (() => { const s = h('select', { id: 'goalfocus', onchange: async () => { const p = await getProgram(); await setProgram({ ...p, goalFocus: s.value || null }); toast(s.value ? 'Célprogram beállítva.' : 'Célprogram kikapcsolva.'); } },
        h('option', { value: '' }, 'Nincs külön cél'), GOALS.map(([k, t]) => h('option', { value: k }, t))); s.value = prog.goalFocus || ''; return s; })())),
    card(h('h2', null, 'Állóképesség'), h('p', null, 'A forgó rend mellé heti 150 perc kardió: tempós séta, kocogás vagy kerékpár, a pulzustartományodban.'), h('div', { class: 'row' }, link('#/cardio', 'Kardió napló és pulzuszónák', 'btn'))),
    card(h('h2', null, 'Szintjeid'), h('ul', { class: 'rows' }, LADDERS.filter(l => effLadder(baseLadder(l), prog.equipment) === l).map(l => {
      const ex = exerciseFor(lad, l, prog.levels[l], prog.lowImpact);
      return ex ? h('li', null, h('span', { class: 'log-item' }, h('strong', null, D.exercises.ladders[l]), link('#/ex/' + ex.id, ex.name)), lvlDots(prog.levels[l] ?? 0, lad[l].length)) : null;
    }))));
}

/* Vezetett edzés: lépésről lépésre, időzítővel, pihenővel, hangos bemondással; a gyakorlatok végén értékelés. */
export async function sessionView(key, onCleanup) {
  const prog = (await getProgram()) || { levels: {}, done: 0 };
  const routeKey = String(key || '');
  const saved = await kvGet('activeSession');
  if (validSession(saved, D.ex) && !routeKey.endsWith('.resume')) {
    return page('Félbehagyott edzés', card(h('h2', null, saved.session.title),
      h('p', null, `${saved.at + 1}. lépés / ${saved.steps.length}. Az időzítő szünetel; a távolléted nem számít edzésnek.`),
      link('#/session/' + saved.route + '.resume', 'Edzés folytatása', 'btn primary'),
      btn('Új edzés a félbehagyott helyett', async () => { if (!confirm('Elveted a félbehagyott edzést? A korábbi naplód megmarad.')) return; await kvDelete('activeSession'); location.hash = '#/prepare/' + routeKey; }, 'small')));
  }
  const resume = routeKey.endsWith('.resume') && validSession(saved, D.ex) ? saved : null;
  const [k0, ...modes] = (resume ? resume.route : routeKey.replace(/\.resume$/, '')).split('.');
  const light = modes.includes('light'), quick = modes.includes('quick10'), quiet = modes.includes('quiet');
  key = k0;
  const free = await freeSessionFor(key);
  if (!resume && !free && (!SESSION_TITLES[key] || !prog.start)) return page('Nincs ilyen edzés', link('#/program', '← Program', 'btn'));
  const session = resume ? resume.session : free || fitSession(buildSession(key, quiet ? { ...prog, lowImpact: true } : prog, D.exercises.exercises, Date.now(), { light }), D.ex, quick ? 10 : S.settings.duration || 0);
  const baseSteps = sessionSteps(session, D.ex);
  let steps = resume ? resume.steps : baseSteps, total = steps.length;
  const ratings = resume ? resume.ratings || {} : {};
  const workoutId = resume ? resume.id : uid(), currentEpoch = storageEpoch();
  let at = resume ? resume.at : 0, left = resume ? resume.left : 0, timer = null, running = false, wake = null, finished = false, saving = false;
  let deadline = 0, restoredLeft = resume ? resume.left : null, elapsed = resume ? resume.elapsed : 0, visibleSince = Date.now();
  let checkpointQueue = Promise.resolve();
  const voice = h('input', { type: 'checkbox', checked: resume ? resume.voice : true });
  /* edzéspartner mód: csak az edzés elején kapcsolható */
  const partner = h('input', { type: 'checkbox', checked: !!resume?.partner, onchange: () => {
    if (at > 0) { partner.checked = !partner.checked; toast('Az edzéspartner módot az edzés elején lehet bekapcsolni.'); return; }
    steps = partner.checked ? partnerSteps(baseSteps) : baseSteps; total = steps.length; bar.max = total; show();
  } });
  const bar = h('progress', { max: total, value: 0, 'aria-label': 'Az edzés előrehaladása' });
  const count = h('p', { class: 'muted small' });
  const stage = h('div', { class: 'workout', 'aria-live': 'polite' });
  function checkpoint() {
    if (finished || saving || currentEpoch !== storageEpoch()) return;
    const draft = { version: 1, id: workoutId, route: (resume ? resume.route : routeKey.replace(/\.resume$/, '')), session, steps, at: Math.min(at, total - 1), left, ratings, elapsed: elapsed + (visibleSince ? Date.now() - visibleSince : 0), partner: partner.checked, voice: voice.checked, updated: Date.now() };
    const snapshot = structuredClone(draft);
    checkpointQueue = checkpointQueue.catch(() => {}).then(() => checkpointSession(snapshot, currentEpoch));
    checkpointQueue.catch(() => { toast('Az edzés állását nem sikerült menteni. Ellenőrizd a tárhelyet.'); });
  }
  const stop = () => { if (timer) { left = remaining(deadline, Date.now(), tickMs()); clearInterval(timer); timer = null; } running = false; };
  const release = () => { stop(); if (wake) { wake.release().catch(() => {}); wake = null; } try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch { /* a hang nem létfontosságú */ } };
  const suspended = h('div', { hidden: true, class: 'note warn', role: 'status' });
  function suspend() {
    if (finished) return;
    release(); if (visibleSince) { elapsed += Date.now() - visibleSince; visibleSince = 0; }
    restoredLeft = left; checkpoint();
    suspended.hidden = false;
    clear(suspended).append(h('p', null, 'Az edzés szünetel. A háttérben nem léptetjük tovább.'), btn('Visszatérek az edzéshez', () => { suspended.hidden = true; visibleSince = Date.now(); restoredLeft = left; show(); }));
  }
  const visibility = () => { if (document.hidden) suspend(); };
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('pagehide', suspend);
  onCleanup(() => { if (!finished) { release(); checkpoint(); } document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', suspend); });
  let disposed = false; onCleanup(() => { disposed = true; });
  try { navigator.wakeLock.request('screen').then(w => { if (disposed || finished || document.hidden) w.release().catch(() => {}); else wake = w; }, () => {}); } catch { /* opcionális */ }

  const advance = () => { stop(); at++; if (at >= total) finish(false); else show(); };
  /* az utolsó kör után megkérdezzük, milyen volt: ebből jön a szintlépés */
  const next = () => {
    if (saving || !suspended.hidden) return;
    const st = steps[at];
    if (st && st.rate && !ratings[st.rate]) { stop(); askRating(st); return; }
    advance();
  };
  const back = () => { if (saving || !suspended.hidden) return; stop(); if (at > 0) { at--; show(); } };

  function askRating(st) {
    const ex = D.ex[st.exercise];
    clear(stage).append(card(h('p', { class: 'workout-kicker' }, 'Milyen volt?'), h('h2', { class: 'workout-title' }, ex.name),
      h('p', null, 'Az utolsó kör alapján. Ha kétszer egymás után könnyű, a következő edzéstől nehezebb változatot kapsz.'),
      h('div', { class: 'rate' }, RATINGS.map(([k, t]) => btn(t, () => { ratings[st.rate] = k; advance(); }, k === 'ok' ? 'primary' : '')))));
    speak('Milyen volt?', voice.checked);
  }

  async function finish(partial) {
    if (finished || saving) return;
    saving = true; release();
    const minutes = Math.max(1, Math.round((elapsed + (visibleSince ? Date.now() - visibleSince : 0)) / 60000));
    try {
    await checkpointQueue.catch(() => {});
    let changes = [];
    /* az elvégzett gyakorlatok (az első személy lépései, az aktuális ponttal bezárólag) a gyakorlatonkénti előzményhez */
    const doneMap = new Map();
    steps.slice(0, partial ? at : steps.length).filter(s => s.type !== 'rest' && (s.person || 1) === 1).forEach(s => {
      const d = doneMap.get(s.exercise) || { ex: s.exercise, sets: 0, reps: 0, seconds: 0 };
      d.sets++; if (s.reps) d.reps += s.reps * (s.side === 'both' ? 2 : 1); if (s.seconds) d.seconds += s.seconds; doneMap.set(s.exercise, d);
    });
    const done = [...doneMap.values()].map(d => ({ ex: d.ex, sets: d.sets, ...(d.reps ? { reps: d.reps } : {}), ...(d.seconds ? { seconds: d.seconds } : {}) }));
    if (session.free) {
      await completeSession({ id: workoutId, kind: 'workout', date: Date.now(), key: key.startsWith('routine-') ? 'routine' : 'custom', title: session.title, minutes, steps: total, partial, ratings: {}, changes: [], done, partner: partner.checked || undefined }, null, currentEpoch);
    } else {
      const fresh = (await getProgram()) || prog;
      const res = partial ? { state: fresh, changes: [] } : applyRatings(fresh, ratings, D.exercises.exercises);
      changes = res.changes;
      const doneCount = !partial && key === nextKey(fresh) ? (fresh.done || 0) + 1 : fresh.done || 0;
      await completeSession({ id: workoutId, kind: 'workout', date: Date.now(), key, minutes, steps: total, partial, ratings, changes, light, done, partner: partner.checked || undefined }, { ...res.state, done: doneCount, ...(!partial ? { lastDone: Date.now() } : {}) }, currentEpoch);
    }
    finished = true;
    if (liveStop) { liveStop(); liveStop = null; }
    if (!partial && key.startsWith('routine-')) { try { await blockProgress(key.slice(8)); } catch { toast('Az edzés megvan, a kihívás frissítése nem sikerült.'); } }
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
      feedbackBox(workoutId), noteBox(workoutId),
      h('p', { class: 'small muted' }, 'Ha van még 4 perced: a levezetés csökkenti a másnapi merevséget.'),
      h('div', { class: 'row' }, link('#/cooldown', 'Levezetés (4 perc)', 'btn primary'), link('#/', 'Kezdőlap', 'btn'), link('#/log', 'Napló', 'btn small'))));
    } catch { saving = false; checkpoint(); stage.append(note('Az edzés mentése nem sikerült. Az állásod megmaradt; próbáld újra.', 'warn'), btn('Mentés újra', () => finish(partial), 'primary')); } finally { saving = false; }
  }

  /* Gyakorlatcsere erre az edzésre: a sor eggyel könnyebb vagy nehezebb tagja, azonos adagolási formával.
     A cserélt gyakorlat nem kér értékelést, hogy a szintlépés a kiírt gyakorlatra vonatkozzon. */
  const lad = laddersOf(D.exercises.exercises);
  const neighbor = (ex, dir) => {
    const list = lad[ex.ladder] || [], i = list.indexOf(ex) + dir, n = list[i];
    if (!n || ((prog.lowImpact || quiet) && n.impact) || !!n.dose.reps !== !!ex.dose.reps || !!n.perSide !== !!ex.perSide) return null;
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
    const savedLeft = restoredLeft; restoredLeft = null;
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
      if (running || document.hidden || !suspended.hidden) return;
      running = true; deadline = Date.now() + left * tickMs(); checkpoint();
      timer = setInterval(() => {
        left = remaining(deadline, Date.now(), tickMs()); draw();
        if (left > 0 && left % 5 === 0) checkpoint();
        if (left === 3) speak('három', voice.checked);
        if (left <= 0) { beep(660, 120); buzz([120, 60, 120]); next(); }
      }, tickMs());
    };
    if (st.type === 'rest') {
      const after = steps[at + 1];
      left = savedLeft ?? st.seconds; draw();
      clear(stage).append(h('section', { class: 'card workout-focus workout-rest' }, h('p', { class: 'workout-kicker' }, 'Pihenő'),
        h('div', { class: 'workout-visual' }, after ? figureAnim(D.figures[D.ex[after.exercise].figure], { compact: true, still: true }) : null,
          h('div', { class: 'workout-readout' }, ring.el)),
        after ? h('p', { class: 'workout-cue' }, 'Következik: ', h('strong', null, D.ex[after.exercise].name)) : null,
        h('div', { class: 'row workout-actions' }, btn('Pihenő kihagyása', next, 'primary'))), nav);
      speak('Pihenő', voice.checked);
      if (savedLeft == null) run();
      else stage.append(btn('Pihenő folytatása', run));
      checkpoint(); return;
    }
    const ex = D.ex[st.exercise];
    const kicker = [st.part === 'mobility' ? 'Mobilitás' : st.part === 'warmup' ? null : D.exercises.typeNames[ex.type], st.sets > 1 ? `${st.set}. kör / ${st.sets}` : null].filter(Boolean).join(' · ');
    const head = [st.person ? h('p', { class: 'badge person p' + st.person }, st.person + '. személy') : null, kicker ? h('p', { class: 'workout-kicker' }, kicker) : null, h('h2', { class: 'workout-title' }, ex.name)];
    const points = h('ul', { class: 'plain' }, ex.points.map(p => h('li', null, p)));
    const more = link('#/ex/' + ex.id, 'Leírás');
    const swap = st.part === 'main' ? swapRow(st, ex) : null;
    const upcoming = steps[at + 1];
    const nextMovement = steps.slice(at + 1).find(s => s.type !== 'rest');
    const nextExercise = nextMovement && D.ex[nextMovement.exercise];
    const nextHint = nextExercise ? h('aside', { class: 'next-preview', 'aria-label': 'Következő gyakorlat' },
      figureAnim(D.figures[nextExercise.figure], { compact: true, still: true }),
      h('div', null, h('p', { class: 'eyebrow' }, upcoming.type === 'rest' ? 'A pihenő után' : 'Következik'), h('p', null, nextExercise.name)))
      : h('p', { class: 'next-up' }, 'Ez az utolsó lépés.');
    const instructions = (...extra) => h('details', { class: 'workout-details' }, h('summary', null, 'Instrukciók és gyakorlatcsere'), points, swap, extra, more);
    const focus = (...kids) => h('section', { class: 'card workout-focus' }, h('div', { class: 'workout-heading' }, head), kids);
    if (st.seconds) {
      left = savedLeft ?? st.seconds; draw();
      const go = btn('Indítás', () => { go.hidden = true; pause.hidden = false; run(); }, 'primary');
      const pause = btn('Szünet', () => { if (running) { stop(); pause.textContent = 'Folytatás'; checkpoint(); } else { pause.textContent = 'Szünet'; run(); } });
      pause.hidden = true;
      clear(stage).append(focus(st.side ? h('p', { class: 'badge' }, SIDE[st.side]) : null,
        h('div', { class: 'workout-visual' }, figureAnim(D.figures[ex.figure], { compact: true }), h('div', { class: 'workout-readout' }, ring.el, h('p', { class: 'workout-unit' }, 'másodperc'))),
        h('p', { class: 'workout-cue' }, ex.points[0]),
        h('div', { class: 'row workout-actions' }, go, pause, btn('Kész, tovább', next)), nextHint, instructions()), nav);
      checkpoint();
      speak(ex.name + (st.side ? ', ' + SIDE[st.side] : '') + ', ' + st.seconds + ' másodperc', voice.checked);
    } else {
      left = savedLeft ?? 0;
      const live = st.part === 'main' ? liveCounter(ex.id, { startLabel: 'Számolj kamerával' }) : null;
      if (live) liveStop = live.stop;
      clear(stage).append(focus(
        h('div', { class: 'workout-visual' }, figureAnim(D.figures[ex.figure], { compact: true }), h('div', { class: 'workout-readout' }, h('div', { class: 'workout-clock reps' }, String(st.reps)),
          h('p', { class: 'workout-unit' }, 'ismétlés' + (st.side === 'both' ? ' oldalanként' : '')))),
        h('p', { class: 'workout-cue' }, ex.points[0]),
        h('div', { class: 'row workout-actions' }, btn('Kész, tovább', next, 'primary')), nextHint,
        instructions(live ? h('details', { class: 'live-box' }, h('summary', null, 'Számolás kamerával'), live.el) : null)), nav);
      speak(ex.name + ', ' + st.reps + ' ismétlés' + (st.side === 'both' ? ' oldalanként' : '') + (S.settings.voiceMode ? '. ' + ex.points.join('. ') : ''), voice.checked);
      /* hangos módban az ismétlések becsült ideje után magától továbblép */
      checkpoint();
      if (S.settings.voiceMode && savedLeft == null) { left = st.reps * 3 * (st.side === 'both' ? 2 : 1) + 6; running = true; deadline = Date.now() + left * tickMs(); checkpoint(); timer = setInterval(() => { left = remaining(deadline, Date.now(), tickMs()); if (left === 3) speak('három', voice.checked); if (left <= 0) { beep(660, 120); next(); } }, tickMs()); }
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
  const view = page(session.title,
    h('p', { class: 'muted' }, `Kb. ${sessionMinutes(steps)} perc · ${session.blocks.length} gyakorlat` + (session.week.deload ? ' · könnyített hét' : '') + (light ? ' · könnyített edzés, értékelés nélkül' : '') + (session.fit ? ` · ${session.fit.target} perces keretre igazítva` : '')),
    h('div', { class: 'session-progress' }, bar, count),
    session.returning ? note('Üdv újra! Két hétnél hosszabb szünet után óvatosabban indulunk: minden gyakorlatból eggyel kevesebb kör.', 'small') : null,
    session.goalFocus ? note('Célprogram: ' + (GOALS.find(([k]) => k === session.goalFocus) || ['', ''])[1] + '. Ez a gyakorlatsor plusz kört kap.', 'small') : null,
    session.complaints.length ? note('Panaszmód: ' + session.complaints.map(c => ({ knee: 'térd', back: 'derék', shoulder: 'váll' })[c]).join(', ') + '. Csak fájdalommentes tartományban mozogj.', 'warn') : null,
    note('Fájdalomnál hagyd ki. Szédülés vagy mellkasi panasz esetén állj meg.', 'small session-safety'),
    suspended, stage,
    h('details', { class: 'card session-options' }, h('summary', null, 'Edzés beállításai'),
      h('label', { class: 'check' }, voice, h('span', null, 'Hangos bemondás')),
      h('label', { class: 'check small' }, partner, h('span', null, 'Ketten csináljuk (felváltva, egy telefonon)')),
      h('p', { class: 'small muted swipe-hint' }, 'Tipp: balra húzva a következő lépésre ugrasz, jobbra húzva vissza.')));
  view.classList.add('session-page');
  return view;
}

export async function exerciseView(id, onCleanup) {
  const ex = D.ex[id];
  const live = ex ? liveCounter(id, { startLabel: 'Végrehajtás kamerával' }) : null;
  if (live) onCleanup(live.stop);
  if (!ex) return page('Nincs ilyen gyakorlat', link('#/program', '← Program', 'btn'));
  const lad = ex.ladder ? laddersOf(D.exercises.exercises)[ex.ladder] : null;
  const history = (await itemsAll('workout')).flatMap(w => (Array.isArray(w.done) ? w.done : []).filter(d => d.ex === id).map(d => ({ ...d, date: w.date }))).sort((a, b) => a.date - b.date);
  const dose = ex.dose.reps ? `${ex.dose.reps[0]}–${ex.dose.reps[1]} ismétlés` : `${ex.dose.seconds[0]}–${ex.dose.seconds[1]} másodperc`;
  return page(ex.name,
    h('p', { class: 'muted' }, D.exercises.typeNames[ex.type] + ' · ' + dose + (ex.perSide ? ' oldalanként' : '') + (ex.impact ? ' · ugrásos' : '')),
    card(figureAnim(D.figures[ex.figure], { big: true }), h('h3', null, 'Három dolog, amire figyelj'), list(ex.points),
      h('details', { class: 'section' }, h('summary', null, 'Részletes leírás'), figureStrip(D.figures[ex.figure], true), h('p', null, ex.how), videoSearch(ex))),
    history.length ? card(h('h2', null, 'Az előzményed'), exSpark(history), h('ul', { class: 'rows' }, history.slice(-6).reverse().map(x => h('li', null, h('span', null, fmtDate(x.date)), h('span', { class: 'muted small' }, `${x.sets} kör` + (x.reps ? ` · ${x.reps} ismétlés` : '') + (x.seconds ? ` · ${x.seconds} mp` : '')))))) : null,
    live ? card(h('h2', null, 'Számolás és formaellenőrzés kamerával'), live.el) : null,
    lad ? card(h('h2', null, D.exercises.ladders[ex.ladder]), h('p', { class: 'small muted' }, 'A gyakorlatsor szintjei, a legkönnyebbtől:'),
      h('ol', null, lad.map(e => h('li', null, e.id === id ? h('strong', null, e.name) : link('#/ex/' + e.id, e.name), e.impact ? h('span', { class: 'muted small' }, ' · ugrásos') : null)))) : null,
    D.exercises.reviewed ? null : note('A leírásokat szakember még nem lektorálta.', 'small'),
    h('div', { class: 'row' }, btn('← Vissza', () => window.history.back())));
}
