/* Programgenerátor: hétnapos forgó rend, gyakorlatsorok szintekkel, heti adagolás, szintlépés az értékelésekből.
   Tiszta függvények, DOM nélkül. A gyakorlatok a data/exercises.json-ból jönnek (paraméterként). */

/* A forgó rend a teljesített edzések szerint halad, nem a naptár szerint: ha kimarad egy nap, nem csúszik el. */
export const ROTATION = ['strengthA', 'speedA', 'mobility', 'strengthB', 'speedB', 'strengthC', 'mobility'];
export const SESSION_TITLES = {
  strengthA: 'Erő A: guggolás és nyomás', strengthB: 'Erő B: egy láb és húzás', strengthC: 'Erő C: teljes test',
  speedA: 'Gyorsaság A: ugrás és lábmunka', speedB: 'Gyorsaság B: intervallum', mobility: 'Mobilitás és egyensúly',
};
export const LADDERS = ['push', 'squat', 'lunge', 'hinge', 'pull', 'core', 'side', 'power', 'speed', 'balance'];
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
export function buildSession(key, state, exercises, now = Date.now()) {
  const ladders = laddersOf(exercises);
  const wk = weekInfo(state.start ?? now, now);
  const warm = exercises.find(e => e.id === 'warmup');
  const blocks = [];
  /* ugrás és erő előtt általános bemelegítés; a mobilitásnap maga a bemelegítés */
  if (warm && key !== 'mobility') blocks.push({ exercise: warm.id, sets: 1, seconds: warm.dose.seconds[key.startsWith('speed') ? 1 : 0], rest: 0, part: 'warmup' });
  blocks.push(...mobilityBlock(exercises, state.targets || [], key === 'mobility'));
  for (const [ladder, sets0, rest] of PLAN[key] || []) {
    const ex = exerciseFor(ladders, ladder, (state.levels || {})[ladder], state.lowImpact);
    if (!ex) continue;
    const sets = wk.deload ? Math.max(1, sets0 - 1) : sets0;
    blocks.push({ exercise: ex.id, ladder, sets, ...doseFor(ex, wk.cycleWeek, wk.deload), rest, rate: true, part: 'main' });
  }
  return { key, title: SESSION_TITLES[key], blocks, week: wk };
}

export const nextKey = state => ROTATION[(state.done || 0) % ROTATION.length];

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

export const RATINGS = [['easy', 'Könnyű volt'], ['ok', 'Pont jó'], ['hard', 'Nehéz volt'], ['fail', 'Nem ment végig']];

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
