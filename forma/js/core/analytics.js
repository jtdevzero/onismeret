/* Analitika (tiszta függvények): idősorok és összevetések a mentett tételekből. A bemenetet nem módosítja,
   azonosító szerint deduplikál, a hiányzó adatot nem nullázza, és nem ír vissza a történeti felmérésekbe. */
import { normalizeWorkout } from './workout-schema.js';
import { sameScoring } from './assessment.js';
import { weekEnd, weeksBack } from './cardio.js';

const dedupe = items => { const seen = new Set(); return items.filter(i => i && (!i.id || (!seen.has(i.id) && seen.add(i.id)))); };

/* Egy gyakorlat edzésenkénti trendje. Forrás: sorozatnapló (log), régi rekordnál az összesített done (tervből jön).
   → [{ date, source, sets, bestReps, bestSeconds, maxKg, totalReps, totalSeconds }] időrendben */
export function buildExerciseProgress(items, exId) {
  return dedupe(items).filter(i => i.kind === 'workout').map(normalizeWorkout).filter(Boolean).map(w => {
    const e = w.log.find(x => x.ex === exId);
    if (e) {
      const ok = e.sets.filter(s => s.done !== false);
      if (!ok.length) return null;
      const reps = ok.map(s => s.reps).filter(Number.isFinite), secs = ok.map(s => s.seconds).filter(Number.isFinite), kgs = ok.map(s => s.weightKg).filter(v => Number.isFinite(v) && v > 0);
      return { date: w.date, source: 'log', sets: ok.length, bestReps: reps.length ? Math.max(...reps) : null, bestSeconds: secs.length ? Math.max(...secs) : null, maxKg: kgs.length ? Math.max(...kgs) : null, totalReps: reps.reduce((a, b) => a + b, 0) || null, totalSeconds: secs.reduce((a, b) => a + b, 0) || null };
    }
    const d = (Array.isArray(w.done) ? w.done : []).find(x => x.ex === exId);
    if (!d || !d.sets) return null;
    return { date: w.date, source: 'plan', sets: d.sets, bestReps: null, bestSeconds: null, maxKg: null, totalReps: d.reps || null, totalSeconds: d.seconds || null };
  }).filter(Boolean).sort((a, b) => a.date - b.date);
}

/* a naplóban szereplő gyakorlatok, gyakoriság szerint */
export function loggedExercises(items) {
  const n = new Map();
  for (const w of dedupe(items).filter(i => i.kind === 'workout').map(normalizeWorkout).filter(Boolean)) {
    const ids = new Set([...w.log.map(e => e.ex), ...(Array.isArray(w.done) ? w.done.map(d => d.ex) : [])]);
    for (const id of ids) n.set(id, (n.get(id) || 0) + 1);
  }
  return [...n].sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ id, count }));
}

/* Rendszeresség az utolsó `weeks` héten: heti edzésszám, könnyített és félbehagyott külön. */
export function buildConsistencyStats(items, { weeks = 8, now = Date.now(), goal = 5 } = {}) {
  const ws = dedupe(items).filter(i => i.kind === 'workout');
  const rows = Array.from({ length: weeks }, (_, k) => {
    const start = weeksBack(now, weeks - 1 - k), end = weekEnd(start);
    const inW = ws.filter(w => w.date >= start && w.date < end);
    return { start, end, workouts: inW.length, light: inW.filter(w => w.light).length, partial: inW.filter(w => w.partial).length };
  });
  const past = rows.slice(0, -1);
  return { weeks: rows, goal, weeksMeetingGoal: past.filter(r => r.workouts >= goal).length, activeWeeks: past.filter(r => r.workouts > 0).length, completeWeeks: past.length };
}

/* Két felmérés összevetése: pontszámkülönbség csak azonos pontozásnál. A nyers eredmények tesztenként mindig láthatók.
   evaluate: (item) → { areas: { id: { score } }, overall } */
export function buildAssessmentComparison(list, evaluate) {
  const sorted = dedupe(list).filter(a => a.kind === 'assessment').sort((a, b) => a.date - b.date);
  if (sorted.length < 2) return { comparable: false, reason: 'not_enough', scoreDelta: null, raw: [] };
  const a = sorted[sorted.length - 2], b = sorted[sorted.length - 1];
  const ids = [...new Set([...Object.keys(a.results || {}), ...Object.keys(b.results || {})])];
  const raw = ids.filter(id => Number.isFinite(a.results?.[id]) && Number.isFinite(b.results?.[id])).map(id => ({ id, from: a.results[id], to: b.results[id], delta: b.results[id] - a.results[id] }));
  if (!sameScoring(a, b)) return { comparable: false, reason: 'scoring_changed', scoreDelta: null, raw, from: a.date, to: b.date };
  const ea = evaluate ? evaluate(a) : null, eb = evaluate ? evaluate(b) : null;
  const scoreDelta = ea && eb && Number.isFinite(ea.overall) && Number.isFinite(eb.overall) ? eb.overall - ea.overall : null;
  return { comparable: true, reason: null, scoreDelta, raw, from: a.date, to: b.date };
}
