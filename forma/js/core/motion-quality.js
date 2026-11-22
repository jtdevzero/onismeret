/* A kamerás mérés megbízhatósága (tiszta függvény).
   Ez a testpontkövetés minőségét írja le (látott-e a kamera eléggé), NEM a mozgás szakmai minőségét és NEM validált pontosságot.
   Bemenet: az analyzeExercise eredménye ({ ok, reason, quality: { frames, fps, tracked, bodyHeight }, confidence }).
   Kimenet: { level: 'good'|'limited'|'unreliable', label, reasons[], trackedPct, fps, autofill } */

export const MIN_FPS = 10, MIN_BODY = 0.35;

export function measurementReliability(r) {
  const q = (r && r.quality) || {};
  const trackedPct = Math.round(100 * (Number.isFinite(q.tracked) ? q.tracked : 0));
  const fps = Number.isFinite(q.fps) ? Math.round(q.fps) : 0;
  const conf = r && Number.isFinite(r.confidence) ? r.confidence : 0;
  const reasons = [];
  if (!r || !r.ok) reasons.push(r && r.reason === 'no_movement' ? 'Nem találtam a gyakorlat mozgását.' : 'A kamera nem látott elég jól.');
  if (trackedPct < 60) reasons.push(`A képkockák csak ${trackedPct}%-án látszottál.`);
  if (!fps) reasons.push('Nem áll rendelkezésre megbízható képkockasebesség-adat.');
  else if (fps < MIN_FPS) reasons.push(`Alacsony képkockaszám (${fps}/mp).`);
  if (Number.isFinite(q.bodyHeight) && q.bodyHeight > 0 && q.bodyHeight < MIN_BODY) reasons.push('Túl messze voltál vagy kicsi volt az alak a képen.');
  let level = 'good';
  if (!r || !r.ok || conf < 0.4 || trackedPct < 60 || !fps) level = 'unreliable';
  else if (conf < 0.7 || reasons.length) level = 'limited';
  const label = { good: 'jó', limited: 'korlátozott', unreliable: 'nem megbízható' }[level];
  /* nem megbízható mérés nem kerül magától a mezőbe: a felhasználó dönt (újramérés vagy kézi beírás) */
  return { level, label, reasons, trackedPct, fps, autofill: level !== 'unreliable' };
}
