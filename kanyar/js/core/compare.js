/* Két havas elemzés összevetése: mi javult, mi romlott. Csak azokat a mutatókat hasonlítjuk, amelyek mindkét
   felvételen megbízhatók voltak, és csak azonos sportág és azonos jellegű nézet (oldalról vagy szemből/hátulról) mellett. */
import { THRESHOLDS, RELIABLE } from './snow.js';

const kind = v => (v === 'side' ? 'side' : 'frontal');
export const comparable = (a, b) => !!(a && b && a.ok && b.ok && a.sport === b.sport && kind(a.view) === kind(b.view));

/* Milyen messze van az érték a „megfelelő” sávtól (0 = benne van). */
function distance(id, v) {
  const th = THRESHOLDS[id];
  if (th.low != null && v < th.low) return th.low - v;
  if (th.high != null && v > th.high) return v - th.high;
  return 0;
}
const reliable = m => !!m && m.usable && m.confidence >= RELIABLE && m.value != null;

/* prev, cur: analyzeRun eredményei → { rows: [{ id, from, to, change }], better, worse, same } vagy null */
export function compareRuns(prev, cur) {
  if (!comparable(prev, cur)) return null;
  const rows = [];
  for (const id of Object.keys(cur.metrics)) {
    const p = prev.metrics[id], c = cur.metrics[id];
    if (!reliable(p) || !reliable(c)) continue;
    const dp = distance(id, p.value), dc = distance(id, c.value);
    let change = 'same';
    if (dp > 0 && dc === 0) change = 'better';
    else if (dp === 0 && dc > 0) change = 'worse';
    else if (dp > 0 && dc > 0) {
      /* mindkétszer a sávon kívül: az számít változásnak, ha a távolság legalább tizedével nőtt vagy csökkent */
      if (dc < dp * 0.9) change = 'better'; else if (dc > dp * 1.1) change = 'worse';
    }
    rows.push({ id, from: p.band, to: c.band, change });
  }
  const count = k => rows.filter(r => r.change === k).length;
  return { rows, better: count('better'), worse: count('worse'), same: count('same') };
}
