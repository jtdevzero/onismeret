/* A vezetett edzés visszaállításának szűk adatkontraktusa. Soha nem fogadunk el más programhoz
   vagy megváltozott tervhez tartozó checkpointot; a régi naplókat nem érintjük. */
export const DRAFT_VERSION = 1;
export function validDraft(d, key, expectedSteps) {
  return !!(d && d.version === DRAFT_VERSION && d.key === key &&
    typeof d.workoutId === 'string' && d.workoutId.length >= 3 && d.workoutId.length <= 80 &&
    Number.isFinite(d.started) && d.started > 0 && d.started <= Date.now() &&
    Array.isArray(d.steps) && d.steps.length === expectedSteps && expectedSteps > 0 && expectedSteps <= 1000 &&
    Number.isInteger(d.at) && d.at >= 0 && d.at < d.steps.length &&
    d.ratings && typeof d.ratings === 'object' && !Array.isArray(d.ratings) &&
    d.steps.every(s => s && (s.type === 'rest' || (s.type == null && typeof s.exercise === 'string'))));
}

/* Mentésfájlhoz csak az edzésfolytatáshoz szükséges, korlátozott mezőket engedjük át.
   A runtime a visszaállított checkpointot az aktuális edzéstervvel ismét összeveti. */
export function backupDraft(d) {
  if (!d || !Array.isArray(d.steps) || !validDraft(d, d.key, d.steps.length)) return null;
  if (!/^(?:[a-zA-Z0-9_-]{3,60})$/.test(d.key) || d.steps.length > 1000) return null;
  const bounded = (v, max) => typeof v === 'string' && v.length <= max;
  const finite = (v, lo, hi) => Number.isFinite(v) && v >= lo && v <= hi;
  const ratings = {};
  for (const [k, v] of Object.entries(d.ratings)) {
    if (!bounded(k, 40) || !/^[a-z_]+$/.test(k) || !['easy', 'ok', 'hard', 'fail'].includes(v)) return null;
    ratings[k] = v;
  }
  const steps = [];
  for (const s of d.steps) {
    const keys = ['type', 'exercise', 'set', 'sets', 'block', 'part', 'seconds', 'reps', 'side', 'rate', 'person', 'actualReps', 'actualSeconds', 'weightKg', 'rir'];
    if (Object.keys(s).some(k => !keys.includes(k))) return null;
    if (s.type !== undefined && s.type !== 'rest') return null;
    if (s.exercise !== undefined && (!bounded(s.exercise, 40) || !/^[a-z0-9_]+$/.test(s.exercise))) return null;
    if (s.part !== undefined && !bounded(s.part, 40)) return null;
    if (s.side !== undefined && !['left', 'right', 'both'].includes(s.side)) return null;
    if (s.rate !== undefined && (!bounded(s.rate, 40) || !/^[a-z_]+$/.test(s.rate))) return null;
    if (['set', 'sets', 'block', 'seconds', 'reps', 'person', 'actualReps', 'actualSeconds'].some(k => s[k] !== undefined && !finite(s[k], 0, 10000))) return null;
    if (s.weightKg !== undefined && !finite(s.weightKg, 0, 300)) return null;
    if (s.rir !== undefined && (!Number.isInteger(s.rir) || !finite(s.rir, 0, 10))) return null;
    steps.push(Object.fromEntries(keys.filter(k => s[k] !== undefined).map(k => [k, s[k]])));
  }
  return { version: DRAFT_VERSION, key: d.key, workoutId: d.workoutId, started: d.started,
    at: d.at, steps, ratings, partner: d.partner === true };
}
