import { tr } from '../ui/i18n.js';
/* Programgenerátor: hétnapos forgó rend, gyakorlatsorok szintekkel, heti adagolás, szintlépés az értékelésekből.
   Tiszta függvények, DOM nélkül. A gyakorlatok a data/exercises.json-ból jönnek (paraméterként). */

/* A forgó rend a teljesített edzések szerint halad, nem a naptár szerint: ha kimarad egy nap, nem csúszik el. */
export const ROTATION = ['strengthA', 'speedA', 'mobility', 'strengthB', 'speedB', 'strengthC', 'mobility'];
export const SESSION_TITLES = {
  strengthA: tr('Erő A: guggolás és nyomás'), strengthB: tr('Erő B: egy láb és húzás'), strengthC: tr('Erő C: teljes test'),
  speedA: tr('Gyorsaság A: ugrás és lábmunka'), speedB: tr('Gyorsaság B: intervallum'), mobility: tr('Mobilitás és egyensúly'),
};
export const LADDERS = ['push', 'squat', 'squat_db', 'lunge', 'hinge', 'hinge_db', 'pull', 'pull_band', 'pull_db', 'pull_bar', 'core', 'side', 'power', 'speed', 'balance'];
export const EQUIPMENT = [['bar', tr('Húzódzkodó rúd (ajtókeretbe vagy falra szerelt)')], ['dumbbell', tr('Kettlebell vagy kézisúlyzó')], ['band', tr('Gumiszalag (erősítő szalag)')]];
/* Eszközös változatok, elsőbbségi sorrendben: ha megvan az eszköz, az alap gyakorlatsor helyett ez fut. */
const EQUIP_LADDERS = {
  squat: [['dumbbell', 'squat_db']],
  hinge: [['dumbbell', 'hinge_db']],
  pull: [['bar', 'pull_bar'], ['dumbbell', 'pull_db'], ['band', 'pull_band']],
};
export const effLadder = (ladder, equipment = []) => ((EQUIP_LADDERS[ladder] || []).find(([e]) => equipment.includes(e)) || [null, ladder])[1];
export const pullLadder = (equipment = []) => effLadder('pull', equipment);
/* az alap gyakorlatsor, amelyiknek a helyére egy eszközös lép (a szintek listájához) */
export const baseLadder = l => Object.keys(EQUIP_LADDERS).find(b => EQUIP_LADDERS[b].some(([, x]) => x === l)) || l;
export const CYCLE_WEEKS = 6; /* 5 hét terhelés, a 6. könnyített hét, utána újramérés */

const DAY = 86400000;

/* A gyakorlatsorok szint szerint rendezve: { push: [ex0, ex1, …], … } */
export function laddersOf(exercises) {
  const out = {};
  for (const e of exercises) if (e.ladder) (out[e.ladder] ||= []).push(e);
  for (const k of Object.keys(out)) out[k].sort((a, b) => a.level - b.level);
  return out;
}

/* Kezdő szintek a felmérésből. results: a nyers tesztértékek · evaluation: a score.evaluate eredménye */
export function initialLevels(results = {}, evaluation = { tests: {}, areas: {} }, profile = {}) {
  const r = k => (Number.isFinite(Number(results[k])) && results[k] !== '' && results[k] != null ? Number(results[k]) : null);
  const step = (v, cuts) => (v == null ? null : cuts.filter(c => v >= c).length);
  const area = k => (evaluation.areas[k] ? evaluation.areas[k].score : null);
  const pct = k => (evaluation.tests[k] ? evaluation.tests[k].score : null);
  const L = {};
  /* a nők a CSEP szerint térdelve mérnek: ott a 3. szint (teljes fekvőtámasz) a térdelős 20 fölött jön */
  L.push = step(r('pushup'), profile.sex === 'female' ? [5, 12, 20] : [3, 8, 15, 30]) ?? 1;
  L.squat = step(r('chair_stand'), [12, 18, 25, 33]) ?? 1;
  L.lunge = L.squat >= 4 ? 2 : L.squat >= 2 ? 1 : 0;
  const str = area('strength');
  L.hinge = str == null ? 0 : str >= 75 ? 2 : str >= 40 ? 1 : 0;
  L.pull = [0, 0, 1, 2, 3][L.push];
  L.pull_band = Math.min(2, L.pull);
  L.pull_bar = L.pull >= 2 ? 1 : 0;
  L.pull_db = Math.min(2, L.pull);
  L.squat_db = Math.min(2, Math.max(0, L.squat - 1));
  L.hinge_db = Math.min(2, L.hinge);
  L.core = step(r('plank'), [30, 60, 120]) ?? 1;
  L.side = [0, 1, 1, 2][L.core];
  const bj = pct('broad_jump');
  L.power = bj == null ? 0 : step(bj, [20, 60, 80]);
  const pw = area('power');
  L.speed = pw == null ? 0 : pw >= 75 ? 2 : pw >= 40 ? 1 : 0;
  L.balance = step(r('sl_stance'), [5, 15]) ?? 0;
  /* fájdalom a guggolásnál: a legkönnyebb guggolásról indulunk */
  if (evaluation.tests.deep_squat && evaluation.tests.deep_squat.pain) { L.squat = 0; L.lunge = 0; }
  if (evaluation.tests.shoulder_reach && evaluation.tests.shoulder_reach.pain) { L.push = 0; L.pull = 0; }
  return L;
}

/* Újramérés: a ténylegesen újramért sorok friss szintről indulnak, lefelé is.
   Kihagyott teszt nem írja felül a gyakorlással elért szintet. */
export function reassessedLevels(results, evaluation, profile, previous = {}) {
  const fresh = initialLevels(results, evaluation, profile);
  const measured = id => evaluation.tests[id]?.score != null;
  const evidence = {
    push: measured('pushup'), pull: measured('pushup'), pull_band: measured('pushup'),
    pull_bar: measured('pushup'), pull_db: measured('pushup'),
    squat: measured('chair_stand'), squat_db: measured('chair_stand'), lunge: measured('chair_stand'),
    hinge: !!evaluation.areas.strength, hinge_db: !!evaluation.areas.strength,
    core: measured('plank'), side: measured('plank'),
    power: measured('broad_jump'), speed: !!evaluation.areas.power, balance: measured('sl_stance'),
  };
  for (const k of LADDERS) if (!evidence[k] && Number.isInteger(previous[k])) fresh[k] = previous[k];
  // A fájdalom miatti könnyítés az eszközös változatokra is vonatkozik.
  if (evaluation.tests.deep_squat?.pain) for (const k of ['squat', 'squat_db', 'lunge']) fresh[k] = 0;
  if (evaluation.tests.shoulder_reach?.pain) for (const k of ['push', 'pull', 'pull_band', 'pull_bar', 'pull_db']) fresh[k] = 0;
  return fresh;
}

/* A szinthez tartozó gyakorlat; kímélő (ugrásmentes) módban a legközelebbi alacsonyabb, ugrás nélküli változat. */
export function exerciseFor(ladders, ladder, level, lowImpact = false) {
  const list = ladders[ladder] || [];
  if (!list.length) return null;
  let i = Math.max(0, Math.min(level ?? 0, list.length - 1));
  if (lowImpact) while (i > 0 && list[i].impact) i--;
  if (lowImpact && list[i].impact) return null;
  return list[i];
}

/* Hányadik hét a programban, és hányadik a cikluson belül? */
export function weekInfo(start, now = Date.now()) {
  const days = Math.max(0, Math.floor((now - start) / DAY));
  const week = Math.floor(days / 7) + 1;
  const cycleWeek = ((week - 1) % CYCLE_WEEKS) + 1;
  return { week, cycleWeek, deload: cycleWeek === CYCLE_WEEKS, cycle: Math.floor((week - 1) / CYCLE_WEEKS) + 1 };
}

/* Heti adag a [kezdő, cél] tartományból: az 1. héten a kezdő, az 5.-en a cél, a könnyített héten újra a kezdő. */
export function doseFor(ex, cycleWeek, deload = false) {
  const [k, range] = ex.dose.reps ? ['reps', ex.dose.reps] : ['seconds', ex.dose.seconds];
  const [lo, hi] = range;
  const f = deload ? 0 : Math.min(1, Math.max(0, (cycleWeek - 1) / 4));
  let v = lo + (hi - lo) * f;
  v = k === 'seconds' ? Math.round(v / 5) * 5 : Math.round(v);
  return { [k]: Math.max(1, v) };
}

/* Mobilitási blokk. targets: célterületek gyengeség szerint (a legrosszabb elöl). long: a mobilitásnap hosszabb változata. */
export function mobilityBlock(exercises, targets = [], long = false) {
  const mob = exercises.filter(e => e.type === 'mobility');
  const picked = mob.filter(e => e.daily);
  const order = [...new Set([...targets, 'squat', 'hipflexor', 'shoulder', 'ankle', 'hamstring', 'thoracic'])];
  const want = long ? order.length : 3;
  for (const t of order) {
    if (picked.length >= 2 + want) break;
    const cand = mob.filter(e => !picked.includes(e) && (e.target || []).includes(t));
    /* a hosszú napon a célterület második gyakorlata is bekerülhet, ha az a leggyengébb */
    if (cand.length) picked.push(cand[0]);
    if (long && t === targets[0] && cand[1]) picked.push(cand[1]);
  }
  if (long) { const cp = mob.find(e => e.id === 'child_pose'); if (cp && !picked.includes(cp)) picked.push(cp); }
  return picked.map(e => ({ exercise: e.id, sets: 1, ...(e.dose.reps ? { reps: e.dose.reps[long ? 1 : 0] } : { seconds: e.dose.seconds[long ? 1 : 0] }), rest: 0, part: 'mobility' }));
}

const PLAN = {
  strengthA: [['squat', 3, 75], ['push', 3, 75], ['hinge', 3, 60], ['core', 3, 40]],
  strengthB: [['lunge', 3, 60], ['pull', 3, 60], ['side', 2, 30], ['balance', 2, 20]],
  strengthC: [['squat', 3, 75], ['push', 3, 75], ['pull', 3, 60], ['hinge', 2, 60], ['side', 2, 30]],
  speedA: [['power', 4, 75], ['speed', 6, 40], ['balance', 2, 20], ['core', 2, 40]],
  speedB: [['power', 3, 60], ['speed', 8, 20], ['lunge', 2, 45]],
  mobility: [['balance', 2, 20]],
};

/* Egy edzés összeállítása. state: { levels, targets, lowImpact, start } · → { key, title, blocks, week } */
/* Időszakolás: a 6 hetes ciklusok fókusza váltakozik. alap → erő → robbanékonyság, majd újra. */
/* edzéshez szabott bemelegítés (a fő rész ízületei) */
export const WARMUP_FOR = {
  strengthA: ['ankle_rock', 'wall_slide'], strengthB: ['hip_9090', 'open_book'], strengthC: ['worlds_greatest'],
  speedA: ['ankle_rock', 'squat_hold'], speedB: ['ankle_rock'],
};
/* célprogramok: egy gyakorlatsorra fókuszál 6 hétig */
export const GOALS = [['push', tr('Több fekvőtámasz')], ['pull', tr('Első vagy több húzódzkodás')], ['squat', tr('Erősebb láb')], ['core', tr('Erősebb törzs')], ['power', tr('Magasabb ugrás')], ['balance', tr('Jobb egyensúly')]];

/* Edzéspartner mód: minden gyakorlati lépés kétszer, felváltva (1. és 2. személy); pihenő csak a pár után.
   Az értékelés csak az 1. személynél (a telefon gazdájánál) marad. */
export function partnerSteps(steps) {
  const out = [];
  for (const s of steps) {
    if (s.type === 'rest') { out.push(s); continue; }
    out.push({ ...s, person: 1, rate: undefined }, { ...s, person: 2, rate: undefined });
    if (s.rate) out[out.length - 2].rate = s.rate;
  }
  return out;
}

export const PHASES = [
  { id: 'base', name: tr('Alapozás'), about: tr('Kiegyensúlyozott terhelés, technika és állóképesség.') },
  { id: 'strength', name: tr('Erő'), about: tr('Erőnapokon több kör, kevesebb ismétlés, hosszabb pihenő: nehezebb változat felé.') },
  { id: 'power', name: tr('Robbanékonyság'), about: tr('Gyorsasági napokon több kör, az erőnapokon fenntartó adag.') },
];
export const phaseOf = cycle => PHASES[((cycle || 1) - 1) % PHASES.length];

/* Panaszmód (térd, derék, váll): óvatos, általános szabályok; szakember átnézte (2026-11-22).
   → { caps: { gyakorlatsor: legfeljebb szint }, noImpact, noBar, skip: [gyakorlatok] } */
export const COMPLAINTS = [['knee', tr('Térd')], ['back', tr('Derék')], ['shoulder', tr('Váll')]];
export function complaintRules(list = []) {
  const caps = {}, skip = new Set();
  const cap = (k, v) => { caps[k] = Math.min(caps[k] ?? 99, v); };
  let noImpact = false, noBar = false;
  if (list.includes('knee')) { noImpact = true; cap('squat', 1); cap('squat_db', 0); cap('lunge', 0); cap('balance', 1); }
  if (list.includes('back')) { noImpact = true; cap('hinge', 0); cap('hinge_db', 0); cap('core', 1); cap('speed', 2); skip.add('worlds_greatest'); }
  if (list.includes('shoulder')) { cap('push', 2); cap('pull_db', 0); cap('pull', 1); noBar = true; skip.add('towel_dislocate'); skip.add('wall_slide'); }
  return { caps, noImpact, noBar, skip: [...skip] };
}

/* opts.light: könnyített edzés (rossz nap): minden gyakorlatból eggyel kevesebb kör, és nem kér értékelést,
   hogy a fáradtan „könnyűnek” vagy „nehéznek” érzett kör ne torzítsa a szintlépést. */
export function buildSession(key, state, exercises, now = Date.now(), opts = {}) {
  const ladders = laddersOf(exercises);
  const wk = weekInfo(state.start ?? now, now);
  const warm = exercises.find(e => e.id === 'warmup');
  const blocks = [];
  const rules = complaintRules(state.complaints), phase = phaseOf((state.cycleBase || 0) + wk.cycle);
  const equipment = rules.noBar ? (state.equipment || []).filter(e => e !== 'bar') : state.equipment;
  /* ugrás és erő előtt általános bemelegítés; a mobilitásnap maga a bemelegítés */
  if (warm && key !== 'mobility') blocks.push({ exercise: warm.id, sets: 1, seconds: warm.dose.seconds[key.startsWith('speed') ? 1 : 0], rest: 0, part: 'warmup' });
  /* a mai edzéshez szabott bemelegítés: azokat az ízületeket készíti fel, amelyeket a fő rész terhel */
  for (const id of WARMUP_FOR[key] || []) {
    const e = exercises.find(x => x.id === id);
    if (e && !rules.skip.includes(id)) blocks.push({ exercise: id, sets: 1, ...(e.dose.reps ? { reps: e.dose.reps[0] } : { seconds: e.dose.seconds[0] }), rest: 0, part: 'warmup' });
  }
  /* visszatérés: ha 14 napnál régebben volt edzés, óvatosabb újrakezdés */
  const returning = state.lastDone != null && now - state.lastDone > 14 * 86400000;
  blocks.push(...mobilityBlock(exercises.filter(e => !rules.skip.includes(e.id)), state.targets || [], key === 'mobility'));
  for (const [ladder, sets0, rest] of PLAN[key] || []) {
    const eff = effLadder(ladder, equipment);
    const lvl = Math.min((state.levels || {})[eff] ?? 0, rules.caps[eff] ?? 99);
    const ex = exerciseFor(ladders, eff, lvl, state.lowImpact || rules.noImpact);
    if (!ex) continue;
    let sets = sets0, rst = rest, dose = doseFor(ex, wk.cycleWeek, wk.deload);
    /* a ciklus fókusza */
    const isStrength = ex.type === 'strength', isFast = ex.type === 'power' || ex.type === 'speed';
    if (phase.id === 'strength' && isStrength) { sets = Math.min(4, sets + 1); rst += 15; if (dose.reps) dose = { reps: Math.max(3, Math.round(dose.reps * 0.8)) }; }
    if (phase.id === 'power') { if (isFast) sets = Math.min(sets + 1, ex.type === 'speed' ? 10 : 5); else if (isStrength) sets = Math.max(2, sets - 1); }
    /* célprogram: a kiválasztott gyakorlatsor egy kört kap pluszban */
    if (state.goalFocus && eff === effLadder(state.goalFocus, equipment) && !opts.light) sets = Math.min(5, sets + 1);
    if (wk.deload || opts.light || returning) sets = Math.max(1, sets - 1);
    blocks.push({ exercise: ex.id, ladder: eff, sets, ...dose, rest: rst, rate: !opts.light, part: 'main' });
  }
  /* célprogram: a gyorsasági és mobilitásnapokon is kerül egy rövid blokk a célgyakorlatból */
  if (state.goalFocus && !opts.light && (key.startsWith('speed') || key === 'mobility') && !blocks.some(b => b.ladder === effLadder(state.goalFocus, equipment))) {
    const eff = effLadder(state.goalFocus, equipment), ex = exerciseFor(ladders, eff, Math.min((state.levels || {})[eff] ?? 0, rules.caps[eff] ?? 99), state.lowImpact || rules.noImpact);
    if (ex) blocks.push({ exercise: ex.id, ladder: eff, sets: 2, ...doseFor(ex, wk.cycleWeek, wk.deload), rest: 60, rate: false, part: 'main' });
  }
  return { key, title: SESSION_TITLES[key], blocks, week: wk, light: !!opts.light, returning, phase, complaints: state.complaints || [], goalFocus: state.goalFocus || null };
}

/* A forgó rend sorrendje: a felhasználó átrendezheti, de csak ugyanazokból a napokból (ugyanannyi erő-, gyorsasági és
   mobilitásnap), így a heti terhelés összetétele nem változik. Érvénytelen sorrendnél az alap marad. */
export function isRotation(list) {
  if (!Array.isArray(list) || list.length !== ROTATION.length) return false;
  const a = [...list].sort().join(','), b = [...ROTATION].sort().join(',');
  return a === b;
}
export const rotationOf = state => (state && isRotation(state.rotation) ? state.rotation : ROTATION);
/* két nap felcserélése a sorrendben (i ↔ j); a bemenetet nem módosítja */
export function moveDay(state, i, j) {
  const r = [...rotationOf(state)];
  if (!Number.isInteger(i) || !Number.isInteger(j) || i < 0 || j < 0 || i >= r.length || j >= r.length || i === j) return state;
  [r[i], r[j]] = [r[j], r[i]];
  return { ...state, rotation: r.join() === ROTATION.join() ? undefined : r };
}
export const nextKey = state => { const r = rotationOf(state); return r[(state.done || 0) % r.length]; };

/* Lépések a vezetett edzéshez. exById: { id: gyakorlat } */
export function sessionSteps(session, exById) {
  const steps = [];
  session.blocks.forEach((b, bi) => {
    const ex = exById[b.exercise];
    for (let s = 1; s <= b.sets; s++) {
      const last = s === b.sets;
      const base = { exercise: b.exercise, set: s, sets: b.sets, block: bi, part: b.part };
      if (b.seconds && ex && ex.perSide) {
        steps.push({ ...base, seconds: b.seconds, side: 'left' });
        steps.push({ ...base, seconds: b.seconds, side: 'right', rate: last && b.rate ? b.ladder : undefined });
      } else steps.push({ ...base, ...(b.seconds ? { seconds: b.seconds } : { reps: b.reps }), side: ex && ex.perSide ? 'both' : undefined, rate: last && b.rate ? b.ladder : undefined });
      if (b.rest > 0) steps.push({ type: 'rest', seconds: b.rest, block: bi });
    }
  });
  while (steps.length && steps[steps.length - 1].type === 'rest') steps.pop();
  return steps;
}

/* Becsült időtartam percben: ismétlésenként 3 mp, oldalanként kétszer, lépésenként 10 mp átállás. */
export function sessionMinutes(steps) {
  let s = 0;
  for (const st of steps) {
    if (st.type === 'rest') s += st.seconds;
    else s += 10 + (st.seconds || st.reps * 3 * (st.side === 'both' ? 2 : 1));
  }
  return Math.max(1, Math.round(s / 60));
}

export const RATINGS = [['easy', tr('Könnyű volt')], ['ok', tr('Pont jó')], ['hard', tr('Nehéz volt')], ['fail', tr('Nem ment végig')]];

/* Szintlépés: két egymást követő „könnyű” → egy szinttel feljebb; két „nem ment” → egy szinttel lejjebb.
   → { state, changes: [{ ladder, from, to }] } (a bemenetet nem módosítja) */
export function applyRatings(state, ratings, exercises, now = Date.now()) {
  const ladders = laddersOf(exercises);
  const levels = { ...(state.levels || {}) }, hist = { ...(state.ratings || {}) }, changes = [];
  for (const [ladder, rating] of Object.entries(ratings || {})) {
    if (!ladders[ladder] || !RATINGS.some(([k]) => k === rating)) continue;
    const list = [...(hist[ladder] || []), rating].slice(-3);
    const from = levels[ladder] ?? 0, max = ladders[ladder].length - 1;
    const two = k => list.length >= 2 && list[list.length - 1] === k && list[list.length - 2] === k;
    let to = from;
    if (two('easy') && from < max) to = from + 1;
    else if (two('fail') && from > 0) to = from - 1;
    if (to !== from) { levels[ladder] = to; hist[ladder] = []; changes.push({ ladder, from, to, date: now }); }
    else hist[ladder] = list;
  }
  return { state: { ...state, levels, ratings: hist, levelLog: [...(state.levelLog || []), ...changes].slice(-100) }, changes };
}

/* Programszerkesztő: egy gyakorlatsor szintjének tartós, kézi beállítása. Nem módosítja a bemenetet;
   azonos értéknél változatlanul adja vissza (idempotens). A változás a levelLog-ba kerül source: 'manual' jelöléssel,
   a sor értékelési előzménye törlődik (a kétszeri „könnyű” az új szinttől számít). A panaszkorlát (complaintRules)
   és a kímélő mód az edzés összeállításakor továbbra is érvényesül, ezért kézzel sem kerülhető meg. */
export function setLevel(state, ladder, to, exercises, now = Date.now()) {
  const ladders = laddersOf(exercises);
  if (!state || !ladders[ladder] || !Number.isInteger(to)) return state;
  const max = ladders[ladder].length - 1, from = (state.levels || {})[ladder] ?? 0;
  const next = Math.max(0, Math.min(max, to));
  if (next === from) return state;
  const ratings = { ...(state.ratings || {}) }; ratings[ladder] = [];
  return { ...state, levels: { ...(state.levels || {}), [ladder]: next }, ratings, levelLog: [...(state.levelLog || []), { ladder, from, to: next, date: now, source: 'manual' }].slice(-100) };
}
/* a kézi szintállítások listája sorrendben, soronként a kézi lánc előtti (ajánlott) szinttel */
export function manualOverrides(state) {
  /* csak az aktuális program (utolsó felmérés) óta: egy újramérés új ajánlott szinteket ad */
  const log = ((state && state.levelLog) || []).filter(c => !(state.start > c.date)), out = {};
  const ladders = [...new Set(log.map(c => c.ladder))];
  for (const l of ladders) {
    const mine = log.filter(c => c.ladder === l);
    let i = mine.length - 1;
    while (i >= 0 && mine[i].source === 'manual') i--;
    if (i < mine.length - 1) out[l] = { recommended: mine[i + 1].from, current: mine[mine.length - 1].to };
  }
  return out;
}
/* vissza az ajánlott szintekhez: minden kézzel állított sor a kézi lánc előtti szintre (source: 'revert') */
export function revertManual(state, now = Date.now()) {
  const ov = manualOverrides(state);
  const keys = Object.keys(ov).filter(l => ov[l].recommended !== ov[l].current);
  if (!keys.length) return state;
  const levels = { ...(state.levels || {}) }, entries = [];
  for (const l of keys) { entries.push({ ladder: l, from: levels[l] ?? 0, to: ov[l].recommended, date: now, source: 'revert' }); levels[l] = ov[l].recommended; }
  return { ...state, levels, levelLog: [...(state.levelLog || []), ...entries].slice(-100) };
}

/* Esedékes-e az újramérés? Az utolsó felmérés óta legalább 6 hét, vagy a könnyített hétre értünk. */
export function reassessDue(lastAssessment, state, now = Date.now()) {
  if (!lastAssessment) return true;
  const weeks = (now - lastAssessment) / (7 * DAY);
  return weeks >= CYCLE_WEEKS - 0.01 || (state && state.start != null && weekInfo(state.start, now).deload && weeks >= 4);
}

/* Egymást követő napok, amelyeken volt edzés (ma vagy tegnap kezdve). dates: időbélyegek */
export function streak(dates, now = Date.now()) {
  const day = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const set = new Set(dates.map(day));
  let d = day(now);
  if (!set.has(d)) d = day(d - DAY / 2);
  let n = 0;
  while (set.has(d)) { n++; d = day(d - DAY / 2); }
  return n;
}

/* Időkeret: az edzés igazítása a választott hosszhoz (15 / 25 / 35 perc). Rövidítéskor sorrendben: rövidebb
   mobilitás, rövidebb bemelegítés, szuperszett-szerű rövidebb pihenő, kevesebb kör (legalább 2), végül a sor
   végéről a kevésbé fontos gyakorlatok. Hosszabbításkor a fő gyakorlatok egy kört kapnak (legfeljebb 4).
   → az új edzés (a bemenetet nem módosítja), fit: { target, minutes } */
export const DURATIONS = [[0, tr('Ahogy a program adja')], [15, tr('15 perc')], [25, tr('25 perc')], [35, tr('35 perc')]];
export function fitSession(session, exById, target) {
  if (!target) return session;
  const s = { ...session, blocks: session.blocks.map(b => ({ ...b })) };
  const mins = () => sessionMinutes(sessionSteps(s, exById));
  const main = () => s.blocks.filter(b => b.part === 'main');
  const steps = [
    () => { /* mobilitás: a két napi alapgyakorlat és egy célzott marad */
      const mob = s.blocks.filter(b => b.part === 'mobility');
      if (mob.length <= 3) return false;
      const keep = new Set(mob.slice(0, 3));
      s.blocks = s.blocks.filter(b => b.part !== 'mobility' || keep.has(b));
      return true;
    },
    () => { const w = s.blocks.find(b => b.part === 'warmup' && b.seconds > 90); if (!w) return false; w.seconds = 90; return true; },
    () => { let ch = false; for (const b of main()) if (b.rest > 30) { b.rest = Math.max(20, Math.round(b.rest * 0.6 / 5) * 5); ch = true; } return ch; },
    () => { const b = [...main()].reverse().find(x => x.sets > 2); if (!b) return false; b.sets--; return true; },
    () => { const m = main(); if (m.length <= 2) return false; s.blocks = s.blocks.filter(b => b !== m[m.length - 1]); return true; },
    () => { const b = [...main()].reverse().find(x => x.sets > 1); if (!b) return false; b.sets--; return true; },
  ];
  let guard = 0;
  while (mins() > target && guard++ < 40) {
    if (!steps.some(fn => fn())) break;
  }
  if (target >= 35) for (const b of main()) { if (mins() + 2 > target) break; if (b.sets < 4) b.sets++; }
  return { ...s, fit: { target, minutes: mins() } };
}

/* Önálló edzés egy rutinból vagy saját összeállításból: blocks = [[gyakorlat, körök, { reps | seconds }, pihenő?]].
   Nem lépteti a forgó rendet és nem kér értékelést. */
export function freeSession(key, title, blocks, exById) {
  const out = [];
  for (const [id, sets, dose, rest] of blocks) {
    const ex = exById[id];
    if (!ex) continue;
    const d = dose && (dose.reps || dose.seconds) ? dose : (ex.dose.reps ? { reps: ex.dose.reps[0] } : { seconds: ex.dose.seconds[0] });
    out.push({ exercise: id, sets: Math.max(1, Math.min(6, sets || 1)), ...(d.reps ? { reps: d.reps } : { seconds: d.seconds }), rest: rest ?? (sets > 1 ? 30 : 0), rate: false, part: ex.type === 'mobility' || ex.type === 'recovery' ? 'mobility' : 'main' });
  }
  return { key, title, blocks: out, week: { week: 1, cycleWeek: 1, deload: false, cycle: 1 }, light: false, phase: null, complaints: [], free: true };
}
