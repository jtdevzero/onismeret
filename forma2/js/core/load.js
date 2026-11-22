/* Terhelési számítások (tiszta függvények, DOM és tároló nélkül).
   Minden dimenzió külön, saját mértékegységgel: sorozat (db), ismétlés (db), kitartott idő (mp), külső súlyos volumen
   (kg × ismétlés, csak ismert külső súlynál), edzésidő (perc), szubjektív terhelés (RPE × perc, csak megadott RPE-nél),
   kardió (perc). Nincs közös „összterhelés”: a különböző egységeket nem adjuk össze.
   A testsúlyos ismétlést nem számoljuk át kilogrammra. Csak a teljesített (done !== false) sorozat számít. */
import { normalizeWorkout } from './workout-schema.js';
import { weekEnd, weeksBack } from './cardio.js';

/* egy sorozat → { reps, seconds, externalKgReps } (null, ha nincs ismert külső súly vagy nem teljesült) */
export function calculateSetVolume(s) {
  if (!s || s.done === false) return { reps: 0, seconds: 0, externalKgReps: null };
  const reps = Number.isFinite(s.reps) ? s.reps : 0, seconds = Number.isFinite(s.seconds) ? s.seconds : 0;
  const externalKgReps = Number.isFinite(s.weightKg) && s.weightKg > 0 && reps > 0 ? s.weightKg * reps : null;
  return { reps, seconds, externalKgReps };
}

const addKg = (a, b) => (b == null ? a : (a ?? 0) + b);

/* egy gyakorlat naplója → { sets, reps, seconds, externalKgReps } */
export function calculateExerciseVolume(entry) {
  let sets = 0, reps = 0, seconds = 0, kg = null;
  for (const s of (entry && entry.sets) || []) {
    if (s.done === false) continue;
    const v = calculateSetVolume(s);
    sets++; reps += v.reps; seconds += v.seconds; kg = addKg(kg, v.externalKgReps);
  }
  return { sets, reps, seconds, externalKgReps: kg };
}

/* egy edzés összesítése. source: 'log' (sorozatnapló) vagy 'plan' (régi rekord: a done összesítés, amely a tervből jön) */
export function summarizeWorkout(raw) {
  const w = normalizeWorkout(raw);
  if (!w) return null;
  let sets = 0, reps = 0, seconds = 0, kg = null, source = 'plan';
  if (w.log.length) {
    source = 'log';
    for (const e of w.log) { const v = calculateExerciseVolume(e); sets += v.sets; reps += v.reps; seconds += v.seconds; kg = addKg(kg, v.externalKgReps); }
  } else {
    for (const d of Array.isArray(w.done) ? w.done : []) { sets += d.sets || 0; reps += d.reps || 0; seconds += d.seconds || 0; }
  }
  const minutes = Number.isFinite(w.minutes) ? w.minutes : 0;
  return { id: w.id, date: w.date, source, sets, reps, seconds, externalKgReps: kg, minutes, rpe: w.rpe, sessionLoad: w.rpe != null ? w.rpe * minutes : null, light: !!w.light, partial: w.partial };
}

/* heti összesítés az utolsó `weeks` naptári hétre (a legrégebbi elöl), [start, end) intervallumokkal */
export function aggregateWeeklyLoad(items, { weeks = 8, now = Date.now() } = {}) {
  const ws = items.filter(i => i && i.kind === 'workout'), cs = items.filter(i => i && i.kind === 'cardio');
  const seen = new Set();
  const uniq = arr => arr.filter(i => (i.id ? (seen.has(i.id) ? false : (seen.add(i.id), true)) : true));
  const W = uniq(ws), C = uniq(cs);
  return Array.from({ length: weeks }, (_, k) => {
    const start = weeksBack(now, weeks - 1 - k), end = weekEnd(start);
    const inW = W.filter(w => w.date >= start && w.date < end).map(summarizeWorkout).filter(Boolean);
    const rpeDone = inW.filter(s => s.sessionLoad != null);
    const kgs = inW.map(s => s.externalKgReps).filter(v => v != null);
    return {
      start, end,
      workouts: inW.length,
      minutes: inW.reduce((a, s) => a + s.minutes, 0),
      sets: inW.reduce((a, s) => a + s.sets, 0),
      reps: inW.reduce((a, s) => a + s.reps, 0),
      seconds: inW.reduce((a, s) => a + s.seconds, 0),
      externalKgReps: kgs.length ? kgs.reduce((a, b) => a + b, 0) : null,
      sessionLoad: rpeDone.length ? rpeDone.reduce((a, s) => a + s.sessionLoad, 0) : null,
      rpeSessions: rpeDone.length,
      logged: inW.filter(s => s.source === 'log').length,
      light: inW.filter(s => s.light).length,
      cardioMinutes: C.filter(c => c.date >= start && c.date < end).reduce((a, c) => a + (c.minutes || 0), 0),
    };
  });
}

/* trend egy dimenzióban: az utolsó hét a megelőző (adattal rendelkező) hetek átlagához; kevés adatnál null */
export function buildLoadTrend(weekly, key) {
  const vals = weekly.map(w => w[key]);
  const last = vals[vals.length - 1];
  const prev = vals.slice(0, -1).filter(v => v != null && v > 0);
  if (last == null || prev.length < 2) return null;
  const avg = prev.reduce((a, b) => a + b, 0) / prev.length;
  return { last, avg: Math.round(avg * 10) / 10, ratio: avg > 0 ? Math.round((last / avg) * 100) / 100 : null, weeks: prev.length };
}

