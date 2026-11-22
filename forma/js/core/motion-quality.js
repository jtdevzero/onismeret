import { tr } from '../ui/i18n.js';
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
  if (!r || !r.ok) reasons.push(r && r.reason === 'no_movement' ? tr('Nem találtam a gyakorlat mozgását.') : tr('A kamera nem látott elég jól.'));
  if (trackedPct < 60) reasons.push(tr('A képkockák csak {p0}%-án látszottál.', { p0: trackedPct }));
  if (fps && fps < MIN_FPS) reasons.push(tr('Alacsony képkockaszám ({p0}/mp).', { p0: fps }));
  if (Number.isFinite(q.bodyHeight) && q.bodyHeight > 0 && q.bodyHeight < MIN_BODY) reasons.push(tr('Túl messze voltál vagy kicsi volt az alak a képen.'));
  let level = 'good';
  if (!r || !r.ok || conf < 0.4 || trackedPct < 60) level = 'unreliable';
  else if (conf < 0.7 || reasons.length) level = 'limited';
  const label = { good: tr('jó'), limited: tr('korlátozott'), unreliable: tr('nem megbízható') }[level];
  /* nem megbízható mérés nem kerül magától a mezőbe: a felhasználó dönt (újramérés vagy kézi beírás) */
  return { level, label, reasons, trackedPct, fps, autofill: level !== 'unreliable' };
}
