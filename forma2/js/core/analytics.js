/* Analitika (tiszta függvények): idősorok és összevetések a mentett tételekből. A bemenetet nem módosítja,
   azonosító szerint deduplikál, a hiányzó adatot nem nullázza, és nem ír vissza a történeti felmérésekbe. */
import { normalizeWorkout } from './workout-schema.js';
import { sameScoring } from './assessment.js';
import { weekEnd, weeksBack } from './cardio.js';
import { summarizeWorkout } from './load.js';

const dedupe = items => { const seen = new Set(); return (Array.isArray(items) ? items : []).filter(i => i && typeof i === 'object' && (!i.id || (!seen.has(i.id) && seen.add(i.id)))); };

/* Naptári napok helyi kezdőponttal: DST-váltásnál nem 24 órás periódusokat vonunk ki.
   A hiányzó metrika null, nem 0; külön mértékegységeket nem adunk össze. */
export function periodSummary(items, { days = 30, now = Date.now() } = {}) {
  if (![7, 30, 90].includes(days)) throw new RangeError('Csak 7, 30 vagy 90 nap kérhető.');
  const from = new Date(now); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() - days + 1);
  const filtered = dedupe(items).filter(i => Number.isFinite(i.date) && i.date >= from.getTime() && i.date <= now);
  const workouts = filtered.filter(i => i.kind === 'workout').map(summarizeWorkout).filter(Boolean);
  const cardio = filtered.filter(i => i.kind === 'cardio');
  const body = filtered.filter(i => i.kind === 'body').sort((a, b) => a.date - b.date);
  const recovery = filtered.filter(i => i.kind === 'check');
  const sum = (arr, key) => arr.reduce((a, x) => a + x[key], 0);
  const known = (arr, key) => { const v = arr.filter(x => Number.isFinite(x[key]) && x[key] >= 0); return v.length ? sum(v, key) : null; };
  const firstLast = key => {
    const rows = body.filter(x => Number.isFinite(x[key]) && x[key] > 0);
    return rows.length ? { first: rows[0][key], last: rows.at(-1)[key], count: rows.length,
      change: rows.length > 1 ? Math.round((rows.at(-1)[key] - rows[0][key]) * 10) / 10 : null } : null;
  };
  return { days, from: from.getTime(), to: now,
    workouts: workouts.length, workoutMinutes: sum(workouts, 'minutes'), sets: workouts.length ? sum(workouts, 'sets') : null,
    reps: workouts.length ? sum(workouts, 'reps') : null, seconds: workouts.length ? sum(workouts, 'seconds') : null,
    externalKgReps: known(workouts, 'externalKgReps'), sessionLoad: known(workouts, 'sessionLoad'),
    loggedWorkouts: workouts.filter(w => w.source === 'log').length, lightWorkouts: workouts.filter(w => w.light).length,
    partialWorkouts: filtered.filter(i => i.kind === 'workout' && i.partial === true).length,
    cardioSessions: cardio.length, cardioMinutes: known(cardio, 'minutes'),
    weight: firstLast('weight'), waist: firstLast('waist'), recoveryDays: recovery.length,
    painReports: recovery.filter(c => c.pain === true).length,
    knownPainResponses: recovery.filter(c => typeof c.pain === 'boolean').length };
}

export function periodSummaryCsv(summary) {
  const lines = [['Mutató', 'Érték', 'Egység'],
    ['Időszak', summary.days, 'nap'], ['Edzések', summary.workouts, 'alkalom'],
    ['Edzésidő', summary.workoutMinutes, 'perc'], ['Sorozatok', summary.sets, 'db'],
    ['Ismétlések', summary.reps, 'db'], ['Kitartások', summary.seconds, 'másodperc'],
    ['Külső súlyos volumen', summary.externalKgReps, 'kg × ismétlés'],
    ['Észlelt terhelés', summary.sessionLoad, 'RPE × perc'],
    ['Kardió', summary.cardioMinutes, 'perc'], ['Testsúly legutóbbi', summary.weight?.last, 'kg'],
    ['Derékbőség legutóbbi', summary.waist?.last, 'cm'],
    ['Testsúlyváltozás a mért napok között', summary.weight?.change, 'kg'],
    ['Derékbőség-változás a mért napok között', summary.waist?.change, 'cm'],
    ['Regenerációs kérdőív', summary.recoveryDays, 'bejegyzés'],
    ['Részben teljesített edzés', summary.partialWorkouts, 'alkalom'], ['Könnyített edzés', summary.lightWorkouts, 'alkalom'],
    ['Tényleges sorozatnapló', summary.loggedWorkouts, 'edzés'], ['Fájdalomjelzés', summary.painReports, 'önbevallás'],
    ['Fájdalomkérdés kitöltve', summary.knownPainResponses, 'válasz']];
  return '\uFEFF' + lines.map(row => row.map(v => '"' + String(v ?? 'nincs adat').replaceAll('"', '""') + '"').join(';')).join('\r\n') + '\r\n';
}

/* Egy gyakorlat edzésenkénti trendje. Forrás: sorozatnapló (log), régi rekordnál az összesített done (tervből jön).
   → [{ date, source, sets, bestReps, bestSeconds, maxKg, totalReps, totalSeconds }] időrendben */
export function buildExerciseProgress(items, exId) {
  return dedupe(items).filter(i => i.kind === 'workout' && Number.isFinite(i.date) && i.date > 0).map(normalizeWorkout).filter(Boolean).map(w => {
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

/* A gyakorlattrend ugyanabból a tisztított naplóból exportálható, mint a táblázat.
   Nem állítunk elő hiányzó ismétlésszámot vagy súlyt a tervezett értékből. */
export function exerciseProgressCsv(rows, name = '') {
  const lines = [['Gyakorlat', 'Dátum (ISO)', 'Forrás', 'Sorozatok', 'Legjobb ismétlés', 'Legjobb tartás (mp)', 'Összes ismétlés', 'Összes tartás (mp)', 'Legnagyobb súly (kg)']];
  for (const r of Array.isArray(rows) ? rows : []) {
    if (!r || !Number.isFinite(r.date)) continue;
    lines.push([name, new Date(r.date).toISOString(), r.source === 'log' ? 'napló' : 'terv', r.sets, r.bestReps, r.bestSeconds, r.totalReps, r.totalSeconds, r.maxKg]);
  }
  // Táblázatkezelőben az importált név soha ne váljon képletté.
  const cell = v => {
    let s = String(v ?? 'nincs adat');
    if (/^[\s\uFEFF]*[=+@\-\t\r]/.test(s) && typeof v === 'string') s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  return '\uFEFF' + lines.map(row => row.map(cell).join(';')).join('\r\n') + '\r\n';
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
  const ws = dedupe(items).filter(i => i.kind === 'workout' && Number.isFinite(i.date));
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

/* Regenerációs idősor: a napi „hogy vagy?” bejegyzések és az aznapi edzés egymás mellett, a legutóbbi elöl.
   Csak naplózott együttjárás, nem ok-okozat és nem orvosi értékelés. Hiányzó nap nem kerül bele (nem „rossz nap”). */
export function buildRecoveryTimeline(items, { days = 14, now = Date.now() } = {}) {
  const all = dedupe(items), start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - days + 1);
  const from = start.getTime();
  const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
  const ws = all.filter(i => i.kind === 'workout' && Number.isFinite(i.date));
  return all.filter(i => i.kind === 'check' && Number.isFinite(i.date) && i.date >= from && i.date <= now).sort((a, b) => b.date - a.date).map(c => {
    const day = ws.filter(w => sameDay(w.date, c.date));
    return { date: c.date, sleep: c.sleep ?? null, soreness: c.soreness ?? null, energy: c.energy ?? null, pain: typeof c.pain === 'boolean' ? c.pain : null, level: c.level ?? null, workouts: day.length, light: day.some(w => w.light) };
  });
}
