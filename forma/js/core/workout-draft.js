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
