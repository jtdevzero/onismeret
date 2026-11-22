/* Program, vezetett edzés értékeléssel és szintlépéssel, gyakorlatleírás. */
import { h, clear, fmtSec, fmtDate, uid, toast } from './dom.js';
import { page, card, btn, link, note, list, speak, beep, tickMs, videoSearch, celebrate, artBanner } from './widgets.js';
import { D, S, lowImpact } from './data.js';
import { itemPut, itemGet, itemsAll, kvGet, kvSet, kvDelete, commit, storageStatus } from './store.js';
import { getProgram, setProgram, latestAssessment } from './state.js';
import { setLevel, manualOverrides, revertManual, rotationOf, moveDay } from '../core/program.js';
import { ROTATION, SESSION_TITLES, LADDERS, RATINGS, effLadder, baseLadder, buildSession, sessionSteps, sessionMinutes, nextKey, weekInfo, laddersOf, exerciseFor, applyRatings, reviewRatings, doseFor, fitSession, phaseOf, freeSession, partnerSteps, GOALS, CYCLE_WEEKS } from '../core/program.js';
import { figureStrip, figureAnim } from './figure.js';
import { weekStrip } from './views-main.js';
import { liveCounter } from './live.js';
import { dumbbellExercises } from './helpers.js';
import { suggestProgression, applyLoadChange } from '../core/progression.js';
import { plannedLog, completedSteps, cleanLog, cleanRpe, mergeDone, WORKOUT_SCHEMA } from '../core/workout-schema.js';
import { blockProgress } from './views-extra.js';
import { DRAFT_VERSION, validDraft } from '../core/workout-draft.js';
import { previousExercisePerformance } from '../core/workout-previous.js';
import { swipeStep } from '../core/workout-navigation.js';
import { nextReps, nextWeight, parseRepsInput, parseWeightInput, adjustRestSeconds } from '../core/workout-quick-input.js';
import { tr } from './i18n.js';

const SIDE = { left: 'bal oldal', right: 'jobb oldal', both: tr('oldalanként') };
/* az elvégzett mennyiség (ismétlés vagy másodperc) edzésről edzésre, apró oszlopdiagramon */
function exSpark(hist) {
  const vals = hist.slice(-12).map(x => x.reps || x.seconds || x.sets), max = Math.max(...vals, 1);
  return h('div', { class: 'ex-bars', role: 'img', 'aria-label': tr('Az utolsó edzések mennyisége: ') + vals.join(', ') }, vals.map(v => { const b = h('span'); b.style.height = Math.max(8, Math.round(100 * v / max)) + '%'; return b; }));
}
/* Jegyzet az edzéshez: egy mondat, ami később a naplóban visszaolvasható (szövegként jelenik meg, nem HTML-ként). */
function noteBox(id) {
  const ta = h('textarea', { maxLength: 280, rows: 2, class: 'note-input', placeholder: tr('Pl. a bal térdem kicsit érezte a kitörést'), 'aria-label': tr('Jegyzet ehhez az edzéshez') });
  const save = btn(tr('Jegyzet mentése'), async () => {
    const t = ta.value.trim(); if (!t) return;
    const it = await itemGet(id); if (!it) return;
    await itemPut({ ...it, note: t.slice(0, 280) }); toast('Elmentettem a jegyzetet.'); save.disabled = true;
  }, 'small');
  return h('div', { class: 'note-box' }, h('label', { class: 'field' }, tr('Egy mondat a mai edzésről (nem kötelező)'), ta), save);
}

/* Sorozatnapló az edzés végén (nem kötelező): a tervezett számokkal előtöltve, javítható.
   Súlymező csak súlyzós gyakorlatnál; testsúlyos gyakorlathoz nem számolunk kilogrammot. Az RPE és a RIR önbevallás. */
export function setLogEditor(id, base) {
  const rows = [], rpeSel = h('select', { 'aria-label': tr('Az edzés érzett nehézsége (RPE)') }, h('option', { value: '' }, tr('Nem adom meg')),
    Array.from({ length: 11 }, (_, i) => h('option', { value: String(i) }, `${i}${i === 0 ? ' – pihenés' : i <= 2 ? ' – nagyon könnyű' : i <= 4 ? ' – könnyű' : i <= 6 ? ' – közepes' : i <= 8 ? ' – nehéz' : i === 9 ? ' – nagyon nehéz' : ' – maximális'}`)));
  const blocks = base.map(e => {
    const ex = D.ex[e.ex], weighted = ex && ex.equipment === 'dumbbell';
    const sets = e.sets.map((st, i) => {
      const val = h('input', { type: 'number', inputMode: 'numeric', min: 0, max: st.seconds ? 7200 : 1000, value: String(st.reps ?? st.seconds), 'aria-label': `${ex.name}, ${i + 1}. sorozat: ${st.seconds ? 'másodperc' : 'ismétlés'}` });
      const kg = weighted ? h('input', { type: 'number', inputMode: 'decimal', min: 0, max: 300, step: 0.5, value: st.weightKg != null ? String(st.weightKg) : '', placeholder: 'kg', 'aria-label': tr('{p0}, {p1}. sorozat: súly kilogrammban (egy súlyzó)', { p0: ex.name, p1: i + 1 }) }) : null;
      const ok = h('input', { type: 'checkbox', checked: true, 'aria-label': tr('{p0}, {p1}. sorozat teljesítve', { p0: ex.name, p1: i + 1 }) });
      const rir = i === e.sets.length - 1 ? h('select', { 'aria-label': tr('{p0}: hány szabályos ismétlés maradt még az utolsó sorozat végén (RIR)', { p0: ex.name }) }, h('option', { value: '' }, tr('RIR –')), [0, 1, 2, 3, 4, 5].map(n => h('option', { value: String(n) }, n === 5 ? tr('RIR 5+') : tr('RIR ') + n))) : null;
      rows.push({ ex: e.ex, seconds: !!st.seconds, val, kg, ok, rir });
      return h('li', { class: 'setlog-row' }, h('span', { class: 'muted small' }, `${i + 1}.`), val, h('span', { class: 'small' }, st.seconds ? tr('mp') : tr('ism.')), kg, kg ? h('span', { class: 'small' }, 'kg') : null, h('label', { class: 'check small' }, ok, h('span', null, tr('kész'))), rir);
    });
    return h('div', { class: 'setlog-ex' }, h('h3', null, ex ? ex.name : e.ex), h('ol', { class: 'plain' }, sets));
  });
  const status = h('p', { class: 'small muted', role: 'status' });
  const save = btn(tr('Napló mentése'), async () => {
    const numOf = el => (el && el.value.trim() !== '' && Number.isFinite(Number(el.value)) ? Number(el.value) : undefined);
    const byEx = new Map();
    for (const r of rows) {
      const v = numOf(r.val);
      if (v === undefined) continue;
      const set = { [r.seconds ? 'seconds' : 'reps']: v, weightKg: numOf(r.kg), rir: r.rir && r.rir.value !== '' ? Number(r.rir.value) : undefined, done: r.ok.checked };
      (byEx.get(r.ex) || byEx.set(r.ex, []).get(r.ex)).push(set);
    }
    const log = cleanLog([...byEx].map(([ex, sets]) => ({ ex, sets })), Object.keys(D.ex));
    const rpe = cleanRpe(rpeSel.value === '' ? undefined : Number(rpeSel.value));
    const it = await itemGet(id);
    if (!it) return;
    const next = { ...it, rpe };
    if (log) Object.assign(next, { schemaVersion: WORKOUT_SCHEMA, log, done: mergeDone(it.done, log) });
    try { await itemPut(next); } catch { status.textContent = tr('Nem sikerült menteni; próbáld újra.'); return; }
    status.textContent = tr('Elmentve.'); toast('Elmentettem a sorozatnaplót.');
  }, 'small');
  return h('details', { class: 'setlog' }, h('summary', null, tr('Sorozatnapló és nehézség (nem kötelező)')),
    h('p', { class: 'small muted' }, tr('A tervezett számokat írtam be; javítsd, ha mást csináltál. RPE: mennyire volt nehéz az egész edzés (0–10). RIR: hány szabályos ismétlés maradt volna még. Mindkettő becslés, kihagyható.')),
    h('label', { class: 'field' }, tr('Nehézség (RPE)'), rpeSel), blocks, h('div', { class: 'row' }, save), status);
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
const doseText = b => (b.seconds ? fmtSec(b.seconds) : b.reps + tr(' ism.')) + (D.ex[b.exercise] && D.ex[b.exercise].perSide ? tr(' oldalanként') : '') + (b.sets > 1 ? ' × ' + b.sets : '');
const lvlDots = (level, max) => h('span', { class: 'lvl', role: 'img', 'aria-label': tr('{p0}. szint a {p1}-ből', { p0: level + 1, p1: max }) }, Array.from({ length: max }, (_, i) => h('i', { class: i <= level ? 'on' : '' })));

/* A forgó rend napjainak átrendezése: ugyanazok a napok, más sorrendben (a teljesített edzések száma nem változik). */
function orderEditor(prog) {
  const rot = rotationOf(prog), custom = rot !== ROTATION;
  const save = async next => {
    try { await setProgram(next); } catch { toast('Nem sikerült menteni; próbáld újra.'); return; }
    toast('Elmentettem a sorrendet.'); dispatchEvent(new HashChangeEvent('hashchange'));
  };
  const swap = async (i, j) => save(moveDay(await getProgram(), i, j));
  return h('details', { class: 'order-edit' }, h('summary', null, tr('Sorrend módosítása') + (custom ? tr(' (egyéni)') : '')),
    h('p', { class: 'small muted' }, tr('Ugyanaz a 7 nap, más sorrendben. Érdemes két erőnap közé gyorsasági vagy mobilitásnapot tenni.')),
    h('ol', { class: 'rows' }, rot.map((k, i) => h('li', null, h('span', null, SESSION_TITLES[k]), h('span', { class: 'level-edit' },
      h('button', { type: 'button', class: 'btn small icon', 'aria-label': tr('{p0}. nap ({p1}) feljebb', { p0: i + 1, p1: SESSION_TITLES[k] }), disabled: i === 0, onclick: () => swap(i, i - 1) }, '↑'),
      h('button', { type: 'button', class: 'btn small icon', 'aria-label': tr('{p0}. nap ({p1}) lejjebb', { p0: i + 1, p1: SESSION_TITLES[k] }), disabled: i === rot.length - 1, onclick: () => swap(i, i + 1) }, '↓'))))),
    custom ? h('div', { class: 'row' }, btn(tr('Vissza az alap sorrendhez'), async () => { const p = await getProgram(); await save({ ...p, rotation: undefined }); }, 'small')) : null);
}

/* Szintek és tartós, kézi szintállítás (programszerkesztő). Egy edzésre szóló csere a vezetett edzésben van. */
function levelsCard(prog, lad) {
  const ov = manualOverrides(prog);
  const save = async (next, msg) => {
    try { await setProgram(next); } catch { toast('Nem sikerült menteni; próbáld újra.'); return; }
    toast(msg); dispatchEvent(new HashChangeEvent('hashchange'));
  };
  const change = async (l, dir) => {
    const fresh = await getProgram(), from = fresh.levels[l] ?? 0;
    const a = exerciseFor(lad, l, from, fresh.lowImpact), b = exerciseFor(lad, l, from + dir, fresh.lowImpact);
    if (!b || (a && a.id === b.id)) { toast(dir > 0 ? tr('Ez a sor legnehezebb elérhető szintje.') : tr('Ez a sor legkönnyebb szintje.')); return; }
    if (!confirm(tr('Tartósan átállítod: {p0} → {p1}? A korábbi edzéseid nem változnak, és bármikor visszaállhatsz az ajánlott szintre.', { p0: a ? a.name : '', p1: b.name }))) return;
    await save(setLevel(fresh, l, from + dir, D.exercises.exercises), tr('Szint átállítva: ') + b.name);
  };
  const manual = Object.keys(ov).filter(l => ov[l].recommended !== ov[l].current);
  return card(h('h2', null, tr('Szintjeid')),
    h('p', { class: 'small muted' }, tr('A szint magától lép, ha kétszer egymás után könnyűnek értékeled. Itt tartósan, kézzel is állíthatod; a panasz- és kímélő mód korlátai ekkor is érvényesek.')),
    h('ul', { class: 'rows levels' }, LADDERS.filter(l => effLadder(baseLadder(l), prog.equipment) === l).map(l => {
      const ex = exerciseFor(lad, l, prog.levels[l], prog.lowImpact);
      if (!ex) return null;
      const name = D.exercises.ladders[l];
      return h('li', null, h('span', { class: 'log-item' }, h('strong', null, name), link('#/ex/' + ex.id, ex.name), ov[l] && ov[l].recommended !== ov[l].current ? h('span', { class: 'badge mid' }, tr('kézzel állítva')) : null),
        h('span', { class: 'level-edit' }, lvlDots(prog.levels[l] ?? 0, lad[l].length),
          h('button', { type: 'button', class: 'btn small icon', 'aria-label': name + tr(': könnyebb szint'), onclick: () => change(l, -1) }, '−'),
          h('button', { type: 'button', class: 'btn small icon', 'aria-label': name + ': nehezebb szint', onclick: () => change(l, 1) }, '+')));
    })),
    manual.length ? h('div', { class: 'row' }, btn(tr('Vissza az ajánlott szintekhez'), async () => {
      if (!confirm(tr('Visszaállítod a kézzel módosított szinteket az ajánlottra? A korábbi edzéseid nem változnak.'))) return;
      await save(revertManual(await getProgram()), tr('Visszaálltál az ajánlott szintekre.'));
    }, 'small')) : null);
}

/* Súlyok súlyzós gyakorlatokhoz: elfogadott súly, javaslat indoklással, jóváhagyás vagy kézi beállítás. */
async function loadsCard(prog, lad) {
  const exs = dumbbellExercises(prog, lad);
  if (!exs.length) return null;
  const ws = await itemsAll('workout');
  const apply = async (change, source) => {
    const fresh = await getProgram();
    const next = applyLoadChange(fresh, change, { source });
    if (next === fresh) { toast('Ez már be van állítva.'); return; }
    try { await setProgram(next); } catch { toast('Nem sikerült menteni; próbáld újra.'); return; }
    toast(`${D.ex[change.ex].name}: ${change.to} kg`);
    dispatchEvent(new HashChangeEvent('hashchange'));
  };
  const LABEL = { increase: tr('Javaslat: emelés'), decrease: tr('Javaslat: könnyítés'), maintain: tr('Maradj ennél'), insufficient_data: tr('Kevés adat'), needs_review: tr('Óvatosan') };
  return card(h('h2', null, tr('Súlyok')), h('p', { class: 'small muted' }, tr('Egy súlyzó súlya kilogrammban. A javaslat a sorozatnaplódból jön (teljesített sorozatok és RIR); csak akkor változik, ha elfogadod.')),
    h('ul', { class: 'rows loads' }, exs.map(ex => {
      const cur = prog.loads && Number.isFinite(prog.loads[ex.id]) ? prog.loads[ex.id] : null;
      const sug = suggestProgression({ exercise: ex, workouts: ws, currentKg: cur, complaints: prog.complaints || [] });
      const input = h('input', { type: 'number', inputMode: 'decimal', min: 0, max: 300, step: 0.5, value: cur != null ? String(cur) : '', 'aria-label': ex.name + tr(': súly kilogrammban') });
      return h('li', { class: 'load-row' }, h('div', null, h('strong', null, ex.name), h('span', { class: 'muted small' }, cur != null ? ` · most ${cur} kg` : tr(' · még nincs beállítva')),
        h('p', { class: 'small' }, h('span', { class: 'badge' + (sug.action === 'increase' ? ' good' : sug.action === 'needs_review' || sug.action === 'decrease' ? ' warn' : '') }, LABEL[sug.action]), ' ', sug.reasons[0] || ''),
        h('div', { class: 'row' },
          sug.proposedChange ? btn(`Elfogadom: ${sug.proposedChange.to} kg`, () => apply(sug.proposedChange, 'suggestion'), 'small primary') : null,
          h('label', { class: 'field inline small' }, tr('Kézzel'), input),
          btn(tr('Mentés'), () => { const v = input.value.trim() === '' ? NaN : Number(input.value); if (!(Number.isFinite(v) && v >= 0 && v <= 300)) { toast('Adj meg 0 és 300 közötti súlyt.'); return; } apply({ ex: ex.id, from: cur, to: Math.round(v * 2) / 2 }, 'manual'); }, 'small'))));
    })));
}

export async function programView() {
  const prog = await getProgram();
  if (!prog) {
    const last = await latestAssessment();
    return page(tr('Program'), h('p', null, last ? tr('Még nincs programod. Készítsd el a felmérésed eredményéből.') : tr('A program a felmérésedből készül.')),
      link(last ? '#/result' : '#/assess', last ? tr('Eredmény és program') : tr('Felmérés indítása'), 'btn primary'));
  }
  const wk = weekInfo(prog.start), key = nextKey(prog), lad = laddersOf(D.exercises.exercises);
  const sessions = [...new Set(ROTATION)].map(k => {
    const s = fitSession(buildSession(k, prog, D.exercises.exercises), D.ex, S.settings.duration || 0), steps = sessionSteps(s, D.ex);
    return h('details', { class: 'card' }, h('summary', null, h('h2', null, s.title), h('span', { class: 'badge' + (k === key ? ' good' : '') }, k === key ? tr('Következik') : sessionMinutes(steps) + tr(' perc'))),
      h('ol', { class: 'blocks' }, s.blocks.map(b => h('li', null, link('#/ex/' + b.exercise, D.ex[b.exercise].name), h('span', { class: 'muted small' }, ' · ' + doseText(b) + (b.part === 'mobility' ? tr(' · mobilitás') : ''))))),
      h('div', { class: 'row' }, link('#/check/' + k, k === key ? tr('Indítás') : tr('Ezt csinálom inkább'), 'btn' + (k === key ? ' primary' : ' small'))));
  });
  return page(tr('Program'),
    artBanner(key, tr('{p0}. hét · következik', { p0: wk.week }), SESSION_TITLES[key]),
    h('p', { class: 'muted' }, tr('{p0}. hét (a {p1}. ciklus {p2}. hete a {p3}-ből)', { p0: wk.week, p1: wk.cycle, p2: wk.cycleWeek, p3: CYCLE_WEEKS }) + (prog.lowImpact ? tr(' · kímélő mód') : '')),
    h('section', { class: 'card accent' }, h('h2', null, tr('A ciklus fókusza: {p0}', { p0: phaseOf((prog.cycleBase || 0) + wk.cycle).name })), h('p', null, phaseOf((prog.cycleBase || 0) + wk.cycle).about),
      h('div', { class: 'timeline', role: 'img', 'aria-label': tr('A {p0} hetes ciklus: most a {p1}. hét', { p0: CYCLE_WEEKS, p1: wk.cycleWeek }) }, Array.from({ length: CYCLE_WEEKS }, (_, i) => h('span', { class: 'tl-week' + (i + 1 < wk.cycleWeek ? ' past' : i + 1 === wk.cycleWeek ? ' now' : '') + (i + 1 === CYCLE_WEEKS ? ' deload' : '') }, i + 1 === CYCLE_WEEKS ? `${i + 1}. ↓` : `${i + 1}.`))),
      h('p', { class: 'small muted' }, tr('{p0}. hét a {p1}-ből; a {p2}. (↓) könnyített hét, utána újramérés.', { p0: wk.cycleWeek, p1: CYCLE_WEEKS, p2: CYCLE_WEEKS })),
      h('p', { class: 'small muted' }, tr('A ciklusok fókusza váltakozik: alapozás → erő → robbanékonyság, majd újra elölről.'))),
    wk.deload ? note(tr('Könnyített hét: kevesebb kör, a kezdő ismétlésszámokkal. A hét végén mérd fel újra magad.'), 'warn') : null,
    card(h('h2', null, tr('Forgó rend')), weekStrip(prog), h('p', { class: 'small muted' }, tr('3 erőnap, 2 gyorsasági nap és 2 mobilitásnap. Minden edzés napi mobilitással kezdődik. Az ismétlésszám hétről hétre nő; kétszeri könnyű értékelés után a nehezebb változathoz külön jóváhagyást kérünk.')),
      orderEditor(prog)),
    sessions,
    card(h('h2', null, tr('Célprogram')), h('p', { class: 'small muted' }, tr('Ha van egy konkrét célod, az a gyakorlatsor minden erőnapon plusz kört kap, a gyorsasági és mobilitásnapokon pedig egy rövid blokkot.')),
      h('label', { class: 'field' }, tr('Fókusz'), (() => { const s = h('select', { id: 'goalfocus', onchange: async () => { const p = await getProgram(); await setProgram({ ...p, goalFocus: s.value || null }); toast(s.value ? tr('Célprogram beállítva.') : tr('Célprogram kikapcsolva.')); } },
        h('option', { value: '' }, tr('Nincs külön cél')), GOALS.map(([k, t]) => h('option', { value: k }, t))); s.value = prog.goalFocus || ''; return s; })())),
    card(h('h2', null, tr('Állóképesség')), h('p', null, tr('A forgó rend mellé heti 150 perc kardió: tempós séta, kocogás vagy kerékpár, a pulzustartományodban.')), h('div', { class: 'row' }, link('#/cardio', tr('Kardió napló és pulzuszónák'), 'btn'))),
    await loadsCard(prog, lad),
    levelsCard(prog, lad));
}

/* Vezetett edzés: lépésről lépésre, időzítővel, pihenővel, hangos bemondással; a gyakorlatok végén értékelés. */
export async function sessionView(key, onCleanup) {
  const prog = (await getProgram()) || { levels: {}, done: 0 };
  const [k0, mode] = String(key || '').split('.');
  const light = mode === 'light';
  key = k0;
  /* önálló edzés: rutin (routine-…) vagy saját összeállítás (custom-…) */
  const free = await freeSessionFor(key);
  if (!free && (!SESSION_TITLES[key] || !prog.start)) return page(tr('Nincs ilyen edzés'), link('#/program', '← Program', 'btn'));
  const session = free || fitSession(buildSession(key, prog, D.exercises.exercises, Date.now(), { light }), D.ex, S.settings.duration || 0), baseSteps = sessionSteps(session, D.ex);
  /* Előző teljesítmény az aktuális edzés közben is látható; csak korábbi, mentett naplóból. */
  const previous = previousExercisePerformance(await itemsAll('workout'));
  const draftKey = 'workoutDraft';
  const draft = await kvGet(draftKey, null);
  if (draft && validDraft(draft, draft.key, draft.steps.length) && draft.key !== key && !await itemGet(draft.workoutId)) {
    return page(tr('Félbehagyott edzés'), card(h('h2', null, tr('Előbb dönts a korábbi edzésről')),
      h('p', null, tr('Egy másik edzésed még nincs befejezve. Folytathatod, vagy elvetheted a félkész adatokat.')),
      h('div', { class: 'row' }, link('#/session/' + encodeURIComponent(draft.key), tr('Korábbi edzés folytatása'), 'btn primary'),
        btn(tr('Félkész edzés elvetése'), async () => {
          if (!confirm(tr('Biztosan elveted a félbehagyott edzés adatait?'))) return;
          try { await kvDelete(draftKey); dispatchEvent(new HashChangeEvent('hashchange')); }
          catch { toast(tr('Nem sikerült törölni a félkész edzést.')); }
        }, 'small'))));
  }
  let resumed = false;
  if (draft && draft.key === key && validDraft(draft, key, draft.partner ? partnerSteps(baseSteps).length : baseSteps.length) && !await itemGet(draft.workoutId)) {
    resumed = confirm(tr('Van egy félbehagyott edzésed. Folytatod onnan, ahol abbahagytad?'));
    if (!resumed) {
      /* A Folytatás kérdés elutasítása nem jogosít fel a régi checkpoint felülírására.
         Az újrakezdés külön, megerősített elvetés után válik lehetségessé. */
      return page(tr('Félbehagyott edzés'), card(h('h2', null, tr('A félbehagyott edzésed megmaradt')),
        h('p', null, tr('Az újrakezdés törölné a korábban rögzített sorozatokat. Ezt külön jóvá kell hagynod.')),
        h('div', { class: 'row' }, btn(tr('Folytatás'), () => dispatchEvent(new HashChangeEvent('hashchange')), 'primary'),
          btn(tr('Félkész edzés elvetése'), async () => {
            if (!confirm(tr('Biztosan elveted a félbehagyott edzés adatait?'))) return;
            try { await kvDelete(draftKey); dispatchEvent(new HashChangeEvent('hashchange')); }
            catch { toast(tr('Nem sikerült törölni a félkész edzést.')); }
          }, 'small'), link('#/program', tr('Vissza a programhoz'), 'btn'))));
    }
  }
  const started = resumed ? draft.started : Date.now();
  const workoutId = resumed ? draft.workoutId : uid();
  let steps = baseSteps, total = steps.length;
  const ratings = resumed ? { ...draft.ratings } : {};
  let at = 0, left = 0, timer = null, running = false, wake = null, finished = false, disposed = false;
  if (resumed) { steps = draft.steps; total = steps.length; at = draft.at; }
  let checkpointQueue = Promise.resolve();
  const saveState = h('p', { class: 'small muted session-save-state', role: 'status', 'aria-live': 'polite' });
  let checkpointNumber = 0;
  const checkpoint = () => {
    if (finished) return checkpointQueue;
    const serial = ++checkpointNumber;
    saveState.textContent = tr('Sorozat mentése…');
    const snapshot = { version: DRAFT_VERSION, key, workoutId, started, at, steps: structuredClone(steps), ratings: { ...ratings }, partner: partner.checked };
    checkpointQueue = checkpointQueue.catch(() => {}).then(() => kvSet(draftKey, snapshot)).then(() => {
      if (serial === checkpointNumber) saveState.textContent = storageStatus().mode === 'persistent'
        ? tr('Sorozat mentve ezen az eszközön.') : tr('Ideiglenes mentés: bezáráskor elveszhet.');
    }).catch(() => {
      if (serial === checkpointNumber) saveState.textContent = tr('Mentési hiba – ez a módosítás még nincs biztonságban.');
      toast(tr('Nem sikerült a félbehagyott edzést menteni.'));
    });
    return checkpointQueue;
  };
  const voice = h('input', { type: 'checkbox', checked: true });
  /* edzéspartner mód: csak az edzés elején kapcsolható */
  const partner = h('input', { type: 'checkbox', onchange: () => {
    if (at > 0) { partner.checked = !partner.checked; toast('Az edzéspartner módot az edzés elején lehet bekapcsolni.'); return; }
    steps = partner.checked ? partnerSteps(baseSteps) : baseSteps; total = steps.length; bar.max = total; checkpoint(); show();
  } });
  partner.checked = resumed && draft.partner === true;
  const bar = h('progress', { max: total, value: 0, 'aria-label': tr('Az edzés előrehaladása') });
  const count = h('p', { class: 'muted small' });
  const stage = h('div', { class: 'workout', 'aria-live': 'polite' });
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } running = false; };
  const release = () => { stop(); if (wake) { wake.release().catch(() => {}); wake = null; } try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch { /* a hang nem létfontosságú */ } };
  onCleanup(() => { disposed = true; checkpoint(); release(); });
  try {
    const lock = await navigator.wakeLock.request('screen');
    if (finished || disposed) await lock.release().catch(() => {});
    else wake = lock;
  } catch { wake = null; }

  /* Visszaszámlálás a valós eltelt időből: háttérbe kerülés vagy lassú időzítő után is a tényleges hátralévő időt mutatja. */
  function countdown(onTick, onDone) {
    const unit = tickMs(), deadline = Date.now() + left * unit;
    timer = setInterval(() => {
      const prev = left;
      left = Math.max(0, Math.ceil((deadline - Date.now()) / unit));
      if (left === prev) return;
      onTick();
      if (prev > 3 && left <= 3 && left > 0) speak(tr('három'), voice.checked);
      if (left <= 0) onDone();
    }, Math.max(10, Math.round(unit / 4)));
  }
  const advance = () => { stop(); at++; if (at >= total) finish(false); else { checkpoint(); show(); } };
  /* az utolsó kör után megkérdezzük, milyen volt: ebből jön a szintlépés */
  const next = () => {
    const st = steps[at];
    if (st && st.rate && !ratings[st.rate]) { stop(); askRating(st); return; }
    advance();
  };
  const back = () => { stop(); if (at > 0) { at--; checkpoint(); show(); } };

  function askRating(st) {
    const ex = D.ex[st.exercise];
    clear(stage).append(card(h('p', { class: 'workout-kicker' }, tr('Milyen volt?')), h('h2', { class: 'workout-title' }, ex.name),
      h('p', null, tr('Az utolsó kör alapján. Két azonos értékelés után szintváltást javasolhatunk, amelyet külön jóvá kell hagynod.')),
      h('div', { class: 'rate' }, RATINGS.map(([k, t]) => btn(t, () => { ratings[st.rate] = k; checkpoint(); advance(); }, k === 'ok' ? 'primary' : '')))));
    speak(tr('Milyen volt?'), voice.checked);
  }

  /* A mentendő állapot egyszer számolódik ki; újrapróbánál ugyanez íródik (ugyanazzal az azonosítóval), így nincs duplikátum. */
  let pending = null, saving = false, saved = false;
  async function finish(partial) {
    if (finished) return;
    finished = true; release();
    const endedAt = Date.now();
    const minutes = Math.max(1, Math.round((endedAt - started) / 60000));
    let changes = [];
    /* az elvégzett gyakorlatok (az első személy lépései, az aktuális ponttal bezárólag) a gyakorlatonkénti előzményhez */
    const done = completedSteps(steps, partial ? at : steps.length);
    const values = {};
    let item;
    if (session.free) {
      item = { id: workoutId, kind: 'workout', date: endedAt, key: key.startsWith('routine-') ? 'routine' : 'custom', title: session.title, minutes, steps: total, partial, ratings: {}, changes: [], done, partner: partner.checked || undefined };
    } else {
      const fresh = (await getProgram()) || prog;
      const proposals = applyRatings(fresh, ratings, D.exercises.exercises).changes;
      const approved = proposals.filter(c => {
        const from = exerciseFor(laddersOf(D.exercises.exercises), c.ladder, c.from, lowImpact());
        const to = exerciseFor(laddersOf(D.exercises.exercises), c.ladder, c.to, lowImpact());
        return confirm(tr('Edzésprogram-javaslat (jóváhagyás szükséges): ') +
          (from?.name || c.ladder) + ' → ' + (to?.name || c.ladder) + '\n' +
          tr('Indok: két egymást követő azonos önbevallás alapján javasolt szintváltás. ') +
          tr('Ez nem mért biomechanikai teljesítmény; a bizonytalanság magas. ') +
          tr('Alkalmazod a következő edzésekre?'));
      }).map(c => c.ladder);
      const res = reviewRatings(fresh, ratings, D.exercises.exercises, approved);
      changes = res.changes;
      /* a forgó rendben csak a soron következő edzés teljesítése lép tovább */
      const doneCount = key === nextKey(fresh) ? (fresh.done || 0) + 1 : fresh.done || 0;
      values.program = { ...res.state, done: doneCount, lastDone: endedAt };
      item = { id: workoutId, kind: 'workout', date: endedAt, key, minutes, steps: total, partial, ratings, changes, light, done, partner: partner.checked || undefined };
    }
    const logBase = plannedLog(steps, partial ? at : steps.length, (values.program || prog).loads || {});
    const log = cleanLog(logBase, Object.keys(D.ex));
    if (log) { item.schemaVersion = WORKOUT_SCHEMA; item.log = log; item.done = mergeDone(item.done, log); }
    pending = { values, item, changes, minutes, logBase };
    bar.value = total; count.textContent = tr('{p0} / {p1} lépés', { p0: total, p1: total });
    clear(stage).append(card(h('p', { role: 'status' }, tr('Mentés…'))));
    await save();
  }

  async function save() {
    if (saving || saved) return;
    saving = true;
    const { values, item, changes, minutes } = pending;
    try { await checkpointQueue; await commit(values, [item], [draftKey]); }
    catch {
      saving = false;
      clear(stage).append(card(h('h2', null, tr('Az edzést nem sikerült menteni')),
        h('p', { role: 'alert' }, tr('Az eredményed itt még megvan, de a telefon tárolója most nem fogadta. Próbáld újra; ha továbbra sem megy, a lap tetején lévő „Mentés fájlba” gombbal mentsd el az eddigi adataidat.')),
        h('div', { class: 'row' }, btn(tr('Újrapróba'), save, 'primary'))));
      return;
    }
    saved = true;
    saving = false;
    if (session.free && key.startsWith('routine-')) { try { await blockProgress(key.slice(8)); } catch { /* a blokk számlálója nem létfontosságú */ } }
    const workoutId = item.id;
    speak(tr('Kész az edzés. Szép munka!'), voice.checked);
    if (changes.some(c => c.to > c.from)) celebrate();
    beep(880, 200);
    const lad = laddersOf(D.exercises.exercises);
    clear(stage).append(card(h('h2', null, tr('Edzés kész')),
      h('p', { class: 'lead' }, tr('{p0}, {p1} perc.', { p0: session.title, p1: minutes })),
      changes.length ? h('div', null, h('h3', null, tr('Szintváltás')), list(changes.map(c => {
        const a = exerciseFor(lad, c.ladder, c.from, lowImpact()), b = exerciseFor(lad, c.ladder, c.to, lowImpact());
        return (c.to > c.from ? tr('Feljebb: ') : tr('Visszább: ')) + (a ? a.name : '') + ' → ' + (b ? b.name : '');
      }))) : null,
      h('p', null, tr('Bekerült a naplódba.')),
      pending.logBase.length ? setLogEditor(workoutId, pending.logBase) : null,
      noteBox(workoutId),
      h('p', { class: 'small muted' }, tr('Ha van még 4 perced: a levezetés csökkenti a másnapi merevséget.')),
      h('div', { class: 'row' }, link('#/cooldown', tr('Levezetés (4 perc)'), 'btn primary'), link('#/', tr('Kezdőlap'), 'btn'), link('#/log', tr('Napló'), 'btn small'))));
  }

  /* Gyakorlatcsere erre az edzésre: a sor eggyel könnyebb vagy nehezebb tagja, azonos adagolási formával.
     A cserélt gyakorlat nem kér értékelést, hogy a szintlépés a kiírt gyakorlatra vonatkozzon. */
  const lad = laddersOf(D.exercises.exercises);
  const neighbor = (ex, dir) => {
    const list = lad[ex.ladder] || [], i = list.indexOf(ex) + dir, n = list[i];
    if (!n || (prog.lowImpact && n.impact) || !!n.dose.reps !== !!ex.dose.reps || !!n.perSide !== !!ex.perSide) return null;
    return n;
  };
  async function swapTo(blockIdx, n, persist) {
    const d = doseFor(n, session.week.cycleWeek, session.week.deload);
    for (const s of steps) if (s.block === blockIdx && s.type !== 'rest') { s.exercise = n.id; s.rate = undefined; if (s.reps) s.reps = d.reps; if (s.seconds) s.seconds = d.seconds; s.actualReps = undefined; s.actualSeconds = undefined; s.weightKg = undefined; s.rir = undefined; }
    /* tartós csere: a gyakorlatsor szintje is átáll (naplózva, visszaállítható a Program oldalon); ma nem kér értékelést */
    if (persist && !session.free && n.ladder) {
      try {
        const fresh = await getProgram(), lvl = (lad[n.ladder] || []).indexOf(n);
        if (fresh && lvl >= 0) await setProgram(setLevel(fresh, n.ladder, lvl, D.exercises.exercises));
        toast('Mostantól: ' + n.name);
      } catch { toast('Erre az edzésre cseréltem, de a tartós beállítást nem sikerült menteni.'); }
    } else toast('Erre az edzésre: ' + n.name);
    checkpoint(); stop(); show();
  }
  function swapRow(st, ex) {
    const easier = neighbor(ex, -1), harder = neighbor(ex, 1);
    if (!easier && !harder) return null;
    const keep = !session.free && ex.ladder ? h('input', { type: 'checkbox' }) : null;
    return h('div', null, h('div', { class: 'row swap' }, easier ? btn(tr('Könnyebbre cserélem'), () => swapTo(st.block, easier, keep && keep.checked), 'small') : null, harder ? btn(tr('Nehezebbre cserélem'), () => swapTo(st.block, harder, keep && keep.checked), 'small') : null),
      keep ? h('label', { class: 'check small' }, keep, h('span', null, tr('A következő edzésektől is (tartós, a Program oldalon visszaállítható)'))) : null);
  }
  let liveStop = null;
  onCleanup(() => { if (liveStop) liveStop(); });
  function show() {
    if (liveStop) { liveStop(); liveStop = null; }
    const st = steps[at];
    buzz(st.type === 'rest' ? 60 : [40, 40, 40]);
    bar.value = at; count.textContent = tr('{p0} / {p1} lépés', { p0: at + 1, p1: total });
    const nav = h('div', { class: 'row' },
      at > 0 ? btn(tr('Vissza'), back, 'small') : null,
      btn(tr('Befejezés most'), () => { if (confirm(tr('Befejezed most az edzést? A hátralévő lépések kimaradnak, de az edzés bekerül a naplóba.'))) finish(true); }, 'small'));
    const clock = h('div', { class: 'workout-clock', role: 'timer' });
    const full = st.seconds || 1;
    const ring = ringClock(clock);
    const draw = () => { clock.textContent = left >= 60 ? Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0') : String(left); ring.set(Math.min(1, left / full)); };
    const run = () => {
      if (running) return;
      running = true;
      countdown(() => draw(), () => { beep(660, 120); buzz([120, 60, 120]); next(); });
    };
    if (st.type === 'rest') {
      const after = steps[at + 1];
      left = st.seconds; draw();
      const adjust = delta => {
        const nextLeft = adjustRestSeconds(left, delta);
        if (nextLeft === null) return;
        stop(); left = nextLeft; draw(); run();
      };
      clear(stage).append(h('section', { class: 'card workout-focus workout-rest' }, h('p', { class: 'workout-kicker' }, tr('Pihenő')),
        h('div', { class: 'workout-visual' }, after ? figureAnim(D.figures[D.ex[after.exercise].figure], { compact: true, still: true }) : null,
          h('div', { class: 'workout-readout' }, ring.el)),
        after ? h('p', { class: 'workout-cue' }, tr('Következik: '), h('strong', null, D.ex[after.exercise].name)) : null,
        h('div', { class: 'row rest-adjust', 'aria-label': tr('Pihenőidő módosítása') },
          btn('−15 mp', () => adjust(-15), 'small'), btn('+15 mp', () => adjust(15), 'small')),
        h('div', { class: 'row workout-actions' }, btn(tr('Pihenő kihagyása'), next, 'primary'))), nav);
      speak(tr('Pihenő'), voice.checked);
      run();
      return;
    }
    const ex = D.ex[st.exercise];
    const kicker = [st.part === 'mobility' ? tr('Mobilitás') : st.part === 'warmup' ? null : D.exercises.typeNames[ex.type], st.sets > 1 ? tr('{p0}. kör / {p1}', { p0: st.set, p1: st.sets }) : null].filter(Boolean).join(' · ');
    const head = [st.person ? h('p', { class: 'badge person p' + st.person }, st.person + tr('. személy')) : null, kicker ? h('p', { class: 'workout-kicker' }, kicker) : null, h('h2', { class: 'workout-title' }, ex.name)];
    const points = h('ul', { class: 'plain' }, ex.points.map(p => h('li', null, p)));
    const prior = previous.get(ex.id);
    const priorLine = prior ? h('p', { class: 'small muted workout-previous' }, tr('Előző alkalom: ') + fmtDate(prior.date) + ' · ' +
      tr('{p0} kör', { p0: prior.sets }) + (prior.reps ? tr(' · {p0} ismétlés', { p0: prior.reps }) : '') +
      (prior.seconds ? tr(' · {p0} mp', { p0: prior.seconds }) : '')) : null;
    const more = link('#/ex/' + ex.id, tr('Leírás'));
    const swap = st.part === 'main' ? swapRow(st, ex) : null;
    const upcoming = steps[at + 1];
    const nextMovement = steps.slice(at + 1).find(s => s.type !== 'rest');
    const nextExercise = nextMovement && D.ex[nextMovement.exercise];
    const nextHint = nextExercise ? h('aside', { class: 'next-preview', 'aria-label': tr('Következő gyakorlat') },
      figureAnim(D.figures[nextExercise.figure], { compact: true, still: true }),
      h('div', null, h('p', { class: 'eyebrow' }, upcoming.type === 'rest' ? tr('A pihenő után') : tr('Következik')), h('p', null, nextExercise.name)))
      : h('p', { class: 'next-up' }, tr('Ez az utolsó lépés.'));
    const instructions = (...extra) => h('details', { class: 'workout-details' }, h('summary', null, tr('Instrukciók és gyakorlatcsere')), points, swap, extra, more);
    const focus = (...kids) => h('section', { class: 'card workout-focus' }, h('div', { class: 'workout-heading' }, head), priorLine, kids);
    const weightControl = () => {
      if (ex.equipment !== 'dumbbell') return null;
      const initial = st.weightKg ?? (prog.loads || {})[ex.id] ?? '';
      const field = h('input', { type: 'text', inputMode: 'decimal', autocomplete: 'off', value: String(initial), 'aria-label': tr('Súly (kg, egy súlyzó)'),
        onchange: e => {
          const raw = e.target.value.trim();
          const parsed = raw === '' ? undefined : parseWeightInput(raw);
          if (parsed === null) { toast(tr('Érvénytelen súlyérték.')); field.value = String(st.weightKg ?? initial); return; }
          st.weightKg = parsed; field.value = parsed === undefined ? '' : String(parsed); checkpoint();
        } });
      const adjust = delta => {
        const value = nextWeight(st.weightKg ?? parseWeightInput(String(field.value)) ?? 0, delta);
        if (value == null) return;
        st.weightKg = value; field.value = String(value); checkpoint();
      };
      return h('div', { class: 'field small' }, h('span', null, tr('Súly (kg, egy súlyzó)')),
        h('span', { class: 'workout-quick-weight' },
          h('button', { type: 'button', class: 'btn small', 'aria-label': tr('Súly csökkentése 0,5 kg-mal'), onclick: () => adjust(-0.5) }, '−'), field,
          h('button', { type: 'button', class: 'btn small', 'aria-label': tr('Súly növelése 0,5 kg-mal'), onclick: () => adjust(0.5) }, '+')));
    };
    const setCapture = st.part === 'main' && (st.person || 1) === 1 ? h('div', { class: 'row workout-set-capture' },
      weightControl(),
      h('label', { class: 'field small' }, tr('RIR (maradt ismétlés)'),
        h('select', { onchange: e => { st.rir = e.target.value === '' ? undefined : Number(e.target.value); checkpoint(); } },
          h('option', { value: '' }, tr('Nem adom meg')),
          Array.from({ length: 6 }, (_, i) => h('option', { value: String(i), selected: st.rir === i }, i === 5 ? tr('5 vagy több') : String(i)))))) : null;
    if (st.seconds) {
      left = st.seconds; draw();
      let startedTimer = false;
      const go = btn(tr('Indítás'), () => { startedTimer = true; go.hidden = true; pause.hidden = false; run(); }, 'primary');
      const pause = btn(tr('Szünet'), () => { if (running) { stop(); pause.textContent = tr('Folytatás'); } else { pause.textContent = tr('Szünet'); run(); } });
      pause.hidden = true;
      clear(stage).append(focus(st.side ? h('p', { class: 'badge' }, SIDE[st.side]) : null,
        h('div', { class: 'workout-visual' }, figureAnim(D.figures[ex.figure], { compact: true }), h('div', { class: 'workout-readout' }, ring.el, h('p', { class: 'workout-unit' }, tr('másodperc')))),
        h('p', { class: 'workout-cue' }, ex.points[0]),
        setCapture, h('div', { class: 'row workout-actions' }, go, pause, btn(tr('Kész, tovább'), () => { if (startedTimer && st.part === 'main') st.actualSeconds = Math.max(0, st.seconds - left); next(); })), nextHint, instructions()), nav);
      speak(ex.name + (st.side ? ', ' + SIDE[st.side] : '') + ', ' + st.seconds + tr(' másodperc'), voice.checked);
    } else {
      /* a ténylegesen elvégzett ismétlés edzés közben is javítható (a sorozatnaplóba kerül) */
      const repsClock = h('div', { class: 'workout-clock reps', 'aria-live': 'polite' }, String(st.actualReps ?? st.reps));
      const repsField = h('input', { type: 'text', inputMode: 'numeric', autocomplete: 'off', value: String(st.actualReps ?? st.reps), 'aria-label': tr('Tényleges ismétlések'), onchange: e => {
        const n = parseRepsInput(e.target.value.trim());
        if (n == null) { toast(tr('Érvénytelen ismétlésszám.')); repsField.value = String(st.actualReps ?? st.reps); return; }
        setReps(n);
      } });
      const setReps = v => {
        const next = nextReps(v, 0);
        if (next == null) return;
        st.actualReps = next; repsClock.textContent = String(next); repsField.value = String(next); checkpoint();
      };
      const adjust = st.part === 'main' ? h('div', { class: 'reps-adjust' },
        h('button', { type: 'button', class: 'btn small icon', 'aria-label': tr('Eggyel kevesebb ismétlés'), onclick: () => setReps((st.actualReps ?? st.reps) - 1) }, '−'),
        repsField,
        h('button', { type: 'button', class: 'btn small icon', 'aria-label': tr('Eggyel több ismétlés'), onclick: () => setReps((st.actualReps ?? st.reps) + 1) }, '+')) : null;
      const live = st.part === 'main' ? liveCounter(ex.id, { startLabel: tr('Számolj kamerával') }) : null;
      if (live) liveStop = live.stop;
      clear(stage).append(focus(
        h('div', { class: 'workout-visual' }, figureAnim(D.figures[ex.figure], { compact: true }), h('div', { class: 'workout-readout' }, repsClock,
          h('p', { class: 'workout-unit' }, tr('ismétlés') + (st.side === 'both' ? tr(' oldalanként') : '')), adjust)),
        h('p', { class: 'workout-cue' }, ex.points[0]),
        setCapture, h('div', { class: 'row workout-actions' }, btn(tr('Kész, tovább'), next, 'primary')), nextHint,
        instructions(live ? h('details', { class: 'live-box' }, h('summary', null, tr('Számolás kamerával')), live.el) : null)), nav);
      speak(ex.name + ', ' + st.reps + tr(' ismétlés') + (st.side === 'both' ? tr(' oldalanként') : '') + (S.settings.voiceMode ? '. ' + ex.points.join('. ') : ''), voice.checked);
      /* hangos módban az ismétlések becsült ideje után magától továbblép */
      if (S.settings.voiceMode) { left = st.reps * 3 * (st.side === 'both' ? 2 : 1) + 6; running = true; countdown(() => {}, () => { beep(660, 120); next(); }); }
    }
  }
  /* lapozás: balra húzva tovább, jobbra húzva vissza (az értékelésnél nem) */
  let sx = null, sy = null;
  const controls = 'button, a, input, select, textarea, summary, label';
  stage.addEventListener('pointerdown', e => {
    sx = null;
    if (e.pointerType !== 'mouse' && !e.target.closest(controls)) { sx = e.clientX; sy = e.clientY; }
  });
  stage.addEventListener('pointercancel', () => { sx = null; });
  stage.addEventListener('pointerup', e => {
    if (sx == null || finished) return;
    const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    const direction = swipeStep(dx, dy, { interactive: !!e.target.closest(controls), rating: !!stage.querySelector('.rate') });
    if (direction === 'next') next(); else if (direction === 'back') back();
  });
  const keyNavigate = e => {
    if (finished || !document.contains(stage) || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey ||
        e.target.closest(controls) || stage.querySelector('.rate')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); back(); }
  };
  addEventListener('keydown', keyNavigate);
  onCleanup(() => removeEventListener('keydown', keyNavigate));
  show();
  checkpoint();
  if (S.settings.voiceMode) stage.classList.add('voice-mode');
  const view = page(session.title,
    h('p', { class: 'muted' }, tr('Kb. {p0} perc · {p1} gyakorlat', { p0: sessionMinutes(steps), p1: session.blocks.length }) + (session.week.deload ? tr(' · könnyített hét') : '') + (light ? tr(' · könnyített edzés, értékelés nélkül') : '') + (session.fit ? tr(' · {p0} perces keretre igazítva', { p0: session.fit.target }) : '')),
    h('div', { class: 'session-progress' }, bar, count),
    saveState,
    session.returning ? note(tr('Üdv újra! Két hétnél hosszabb szünet után óvatosabban indulunk: minden gyakorlatból eggyel kevesebb kör.'), 'small') : null,
    session.goalFocus ? note(tr('Célprogram: ') + (GOALS.find(([k]) => k === session.goalFocus) || ['', ''])[1] + tr('. Ez a gyakorlatsor plusz kört kap.'), 'small') : null,
    session.complaints.length ? note(tr('Panaszmód: ') + session.complaints.map(c => ({ knee: tr('térd'), back: tr('derék'), shoulder: tr('váll') })[c]).join(', ') + tr('. Csak fájdalommentes tartományban mozogj.'), 'warn') : null,
    note(tr('Fájdalomnál hagyd ki. Szédülés vagy mellkasi panasz esetén állj meg.'), 'small session-safety'),
    stage,
    h('details', { class: 'card session-options' }, h('summary', null, tr('Edzés beállításai')),
      h('label', { class: 'check' }, voice, h('span', null, tr('Hangos bemondás'))),
      h('label', { class: 'check small' }, partner, h('span', null, tr('Ketten csináljuk (felváltva, egy telefonon)'))),
      h('p', { class: 'small muted swipe-hint' }, tr('Tipp: balra húzva vagy → billentyűvel a következő lépésre ugrasz; jobbra húzva vagy ← billentyűvel vissza. A gombokon indított mozdulat nem lapoz.'))));
  view.classList.add('session-page');
  return view;
}

export async function exerciseView(id, onCleanup) {
  const ex = D.ex[id];
  const live = ex ? liveCounter(id, { startLabel: tr('Végrehajtás kamerával') }) : null;
  if (live) onCleanup(live.stop);
  if (!ex) return page(tr('Nincs ilyen gyakorlat'), link('#/program', '← Program', 'btn'));
  const lad = ex.ladder ? laddersOf(D.exercises.exercises)[ex.ladder] : null;
  const history = (await itemsAll('workout')).flatMap(w => (Array.isArray(w.done) ? w.done : []).filter(d => d.ex === id).map(d => ({ ...d, date: w.date }))).sort((a, b) => a.date - b.date);
  const dose = ex.dose.reps ? tr('{p0}–{p1} ismétlés', { p0: ex.dose.reps[0], p1: ex.dose.reps[1] }) : tr('{p0}–{p1} másodperc', { p0: ex.dose.seconds[0], p1: ex.dose.seconds[1] });
  return page(ex.name,
    h('p', { class: 'muted' }, D.exercises.typeNames[ex.type] + ' · ' + dose + (ex.perSide ? tr(' oldalanként') : '') + (ex.impact ? tr(' · ugrásos') : '')),
    card(figureAnim(D.figures[ex.figure], { big: true }), h('h3', null, tr('Három dolog, amire figyelj')), list(ex.points),
      h('details', { class: 'section' }, h('summary', null, tr('Részletes leírás')), figureStrip(D.figures[ex.figure], true), h('p', null, ex.how), videoSearch(ex))),
    history.length ? card(h('h2', null, tr('Az előzményed')), exSpark(history), h('ul', { class: 'rows' }, history.slice(-6).reverse().map(x => h('li', null, h('span', null, fmtDate(x.date)), h('span', { class: 'muted small' }, tr('{p0} kör', { p0: x.sets }) + (x.reps ? tr(' · {p0} ismétlés', { p0: x.reps }) : '') + (x.seconds ? tr(' · {p0} mp', { p0: x.seconds }) : '')))))) : null,
    live ? card(h('h2', null, tr('Számolás és formaellenőrzés kamerával')), live.el) : null,
    lad ? card(h('h2', null, D.exercises.ladders[ex.ladder]), h('p', { class: 'small muted' }, tr('A gyakorlatsor szintjei, a legkönnyebbtől:')),
      h('ol', null, lad.map(e => h('li', null, e.id === id ? h('strong', null, e.name) : link('#/ex/' + e.id, e.name), e.impact ? h('span', { class: 'muted small' }, tr(' · ugrásos')) : null)))) : null,
    D.exercises.reviewed ? null : note(tr('A leírásokat szakember még nem lektorálta.'), 'small'),
    h('div', { class: 'row' }, btn('← Vissza', () => window.history.back())));
}
