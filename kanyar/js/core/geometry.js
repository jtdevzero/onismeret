/* Geometriai és statisztikai segédfüggvények. Tiszta függvények: nincs DOM, nincs hálózat, Node alatt tesztelhetők. */

/* A MediaPipe Pose 33 testpontjából azok, amelyeket használunk. */
export const LM = {
  nose: 0,
  lShoulder: 11, rShoulder: 12, lElbow: 13, rElbow: 14, lWrist: 15, rWrist: 16,
  lHip: 23, rHip: 24, lKnee: 25, rKnee: 26, lAnkle: 27, rAnkle: 28,
  lHeel: 29, rHeel: 30, lToe: 31, rToe: 32,
};
/* Ezek nélkül nem értelmezhető a testtartás. */
export const KEY_POINTS = [LM.lShoulder, LM.rShoulder, LM.lHip, LM.rHip, LM.lKnee, LM.rKnee, LM.lAnkle, LM.rAnkle];
/* A csontváz rajzolásához. */
export const BONES = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28], [27, 29], [29, 31], [27, 31], [28, 30], [30, 32], [28, 32],
];

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2, v: Math.min(a.v, b.v) });
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const DEG = 180 / Math.PI;

/* A b csúcsnál bezárt szög fokban (180 = nyújtott). */
export function angleAt(a, b, c) {
  const ux = a.x - b.x, uy = a.y - b.y, vx = c.x - b.x, vy = c.y - b.y;
  const n = Math.hypot(ux, uy) * Math.hypot(vx, vy);
  if (!n) return 180;
  return Math.acos(clamp((ux * vx + uy * vy) / n, -1, 1)) * DEG;
}
/* A from→to szakasz dőlése a függőlegeshez képest, előjeles fokban. 0 = a „to” pont pontosan a „from” fölött van;
   pozitív = a kép jobb oldala felé dől. (A kép y tengelye lefelé nő.) */
export function tilt(from, to) {
  return Math.atan2(to.x - from.x, from.y - to.y) * DEG;
}

export const mean = a => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN);
export function std(a) {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / (a.length - 1));
}
export function percentile(a, p) {
  if (!a.length) return NaN;
  const s = [...a].sort((x, y) => x - y), i = clamp(p, 0, 1) * (s.length - 1), lo = Math.floor(i), hi = Math.ceil(i);
  return s[lo] + (s[hi] - s[lo]) * (i - lo);
}
export const median = a => percentile(a, 0.5);
export const round = (v, d = 1) => (Number.isFinite(v) ? Math.round(v * 10 ** d) / 10 ** d : null);

/* Időben mozgó átlag: minden mintához a ±half másodpercen belüli érvényes minták átlaga. */
export function movingAverage(t, v, half) {
  const out = new Array(v.length);
  let lo = 0, hi = 0, sum = 0, n = 0;
  for (let i = 0; i < v.length; i++) {
    while (hi < v.length && t[hi] <= t[i] + half) { if (Number.isFinite(v[hi])) { sum += v[hi]; n++; } hi++; }
    while (t[lo] < t[i] - half) { if (Number.isFinite(v[lo])) { sum -= v[lo]; n--; } lo++; }
    out[i] = n ? sum / n : NaN;
  }
  return out;
}
