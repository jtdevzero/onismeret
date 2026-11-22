/* Edzésrekord-szerződés (tiszta függvények).
   1-es séma (régi): { id, kind:'workout', date, key, minutes, steps, partial, ratings, changes, done[], light?, partner?, note?, title? }
   2-es séma: ugyanezek a mezők változatlanul, és opcionálisan:
     schemaVersion: 2,
     log: [{ ex, sets: [{ reps?, seconds?, weightKg?, rir?, done }] }]   – sorozatonként a ténylegesen rögzített adat
     rpe: 0–10                                                           – az egész edzés érzett nehézsége (önbevallás)
   A régi rekordokat nem írjuk át: az olvasóadapter (normalizeWorkout) egységes nézetet ad róluk.
   A weightKg az egy eszközön lévő külső súly (két kézisúlyzónál az egyiké); testsúlyos gyakorlatnál nincs. */

export const WORKOUT_SCHEMA = 2;
export const MAX_LOG_EXERCISES = 40, MAX_SETS = 20;

const num = (v, lo, hi) => (typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi ? v : undefined);
const clean = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
const EX_ID = /^[a-z0-9_]{2,30}$/;

/* Egy sorozat ellenőrzése. Hiányzó érték nem lesz 0: ami nincs megadva, az kimarad. */
export function cleanSet(s) {
  if (!s || typeof s !== 'object') return null;
  const reps = num(s.reps, 0, 1000), seconds = num(s.seconds, 0, 7200);
  if (reps === undefined && seconds === undefined) return null;
  return clean({
    reps: reps === undefined ? undefined : Math.round(reps),
    seconds: seconds === undefined ? undefined : Math.round(seconds),
    weightKg: num(s.weightKg, 0, 300),
    rir: Number.isInteger(s.rir) ? num(s.rir, 0, 10) : undefined,
    done: s.done !== false,
  });
}

/* A sorozatnapló ellenőrzése; exIds (Set vagy tömb) megadásakor csak ismert gyakorlat maradhat. */
export function cleanLog(log, exIds) {
  if (!Array.isArray(log)) return undefined;
  const known = exIds ? new Set(exIds) : null;
  const out = [];
  for (const e of log.slice(0, MAX_LOG_EXERCISES)) {
    if (!e || !EX_ID.test(e.ex || '') || (known && !known.has(e.ex))) continue;
    const sets = Array.isArray(e.sets) ? e.sets.slice(0, MAX_SETS).map(cleanSet).filter(Boolean) : [];
    if (sets.length) out.push({ ex: e.ex, sets });
  }
  return out.length ? out : undefined;
}

export const cleanRpe = v => (Number.isInteger(v) ? num(v, 0, 10) : undefined);

/* Olvasóadapter: régi és új rekordból egységes nézet. A bemenetet nem módosítja. */
export function normalizeWorkout(w) {
  if (!w || w.kind !== 'workout') return null;
  const log = cleanLog(w.log) || [];
  return { ...w, schemaVersion: w.schemaVersion === WORKOUT_SCHEMA && log.length ? WORKOUT_SCHEMA : 1, log, rpe: cleanRpe(w.rpe) ?? null, partial: !!w.partial };
}

/* A tervezett lépésekből előtöltött napló (a felhasználó a végén javíthatja).
   steps: a vezetett edzés lépései; csak a fő rész (main) és az első személy sorozatai számítanak. */
export function plannedLog(steps, upTo = steps.length, loads = {}) {
  const map = new Map();
  for (const s of steps.slice(0, upTo)) {
    if (s.type === 'rest' || s.part !== 'main' || (s.person || 1) !== 1) continue;
    const e = map.get(s.exercise) || { ex: s.exercise, sets: [] };
    const factor = s.side === 'both' ? 2 : 1;
    /* edzés közben rögzített tényleges érték, ha van (actualReps oldalanként, actualSeconds), különben a tervezett */
    const reps = Number.isFinite(s.actualReps) ? s.actualReps : s.reps, secs = Number.isFinite(s.actualSeconds) ? s.actualSeconds : s.seconds;
    e.sets.push(clean({ reps: s.reps ? reps * factor : undefined, seconds: s.seconds ? secs : undefined, weightKg: num(loads[s.exercise], 0, 300), done: true }));
    map.set(s.exercise, e);
  }
  return [...map.values()];
}

/* A napló összesítése a régi `done` formára, hogy a gyakorlatonkénti előzmény a javított számokat mutassa. */
export function doneFromLog(log) {
  return (log || []).map(e => {
    const ok = e.sets.filter(s => s.done !== false);
    const reps = ok.reduce((a, s) => a + (s.reps || 0), 0), seconds = ok.reduce((a, s) => a + (s.seconds || 0), 0);
    return clean({ ex: e.ex, sets: ok.length, reps: reps || undefined, seconds: seconds || undefined });
  }).filter(d => d.sets > 0);
}

/* A régi done-ba beírja a naplóból számolt értéket (a bemelegítés és mobilitás változatlan marad). */
export function mergeDone(done, log) {
  const fromLog = new Map(doneFromLog(log).map(d => [d.ex, d]));
  const logged = new Set((log || []).map(e => e.ex));
  const out = (done || []).filter(d => !logged.has(d.ex) || fromLog.has(d.ex)).map(d => fromLog.get(d.ex) || d);
  for (const [ex, d] of fromLog) if (!out.some(x => x.ex === ex)) out.push(d);
  return out;
}
