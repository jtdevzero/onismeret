/* Gyors sorozatadat-bevitel: egyértelmű tartományok és kerekítési szabályok. */
export function nextReps(current, delta) {
  if (!Number.isInteger(current) || !Number.isInteger(delta)) return null;
  return Math.max(0, Math.min(999, current + delta));
}

export function nextWeight(current, delta) {
  if (!Number.isFinite(current) || !Number.isFinite(delta)) return null;
  const value = Math.round((current + delta) * 2) / 2;
  return Math.max(0, Math.min(300, value));
}

export function parseRepsInput(value) {
  if (typeof value !== 'string' || !/^\d{1,3}$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed <= 999 ? parsed : null;
}

export function parseWeightInput(value) {
  if (typeof value !== 'string' || !/^(?:\d{1,3})(?:[.,]\d{1,2})?$/.test(value)) return null;
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 300 ? parsed : null;
}

/* Pihenőidő-korrekció: a kijelzőn és a háttéridőzítőben ugyanaz a másodpercérték. */
export function adjustRestSeconds(current, delta) {
  if (!Number.isInteger(current) || !Number.isInteger(delta)) return null;
  return Math.max(1, Math.min(600, current + delta));
}
