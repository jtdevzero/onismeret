/* Mérés a telefon érzékelőivel: egyensúlyi kilengés, lépésszám és kadencia (gyorsulásmérő), pulzus a kamera
   fényjeléből (fotopletizmográfia). Tiszta függvények, DOM nélkül. Tájékoztató mérések. */

const mean = a => a.reduce((s, v) => s + v, 0) / (a.length || 1);

/* Kilengés: a gyorsulás vízszintes összetevőinek szórása (m/s²), a gravitáció nélkül.
   samples: [{ t (mp), x, y, z }] → { rms, score (0–100, nagyobb = stabilabb), seconds } vagy null */
export function swayMetrics(samples) {
  const s = (samples || []).filter(p => [p.t, p.x, p.y, p.z].every(Number.isFinite));
  if (s.length < 20) return null;
  const mx = mean(s.map(p => p.x)), mz = mean(s.map(p => p.z));
  const rms = Math.sqrt(mean(s.map(p => (p.x - mx) ** 2 + (p.z - mz) ** 2)));
  /* 0,05 m/s² körül nagyon stabil, 0,6 fölött jelentős kilengés (becsült skála) */
  const score = Math.round(Math.max(0, Math.min(100, 100 * (1 - (rms - 0.05) / 0.55))));
  return { rms: Math.round(rms * 1000) / 1000, score, seconds: Math.round((s[s.length - 1].t - s[0].t) * 10) / 10 };
}

/* Lépések a gyorsulás nagyságának csúcsaiból (futás, séta). samples: [{ t, x, y, z }]
   → { steps, cadence (lépés/perc), seconds } */
export function stepCount(samples, minGap = 0.25) {
  const s = (samples || []).filter(p => [p.t, p.x, p.y, p.z].every(Number.isFinite));
  if (s.length < 10) return { steps: 0, cadence: 0, seconds: 0 };
  const mag = s.map(p => Math.hypot(p.x, p.y, p.z));
  const m = mean(mag), sd = Math.sqrt(mean(mag.map(v => (v - m) ** 2)));
  const thr = m + Math.max(0.6, 0.5 * sd);
  let steps = 0, last = -Infinity;
  for (let i = 1; i < mag.length - 1; i++) {
    if (mag[i] > thr && mag[i] >= mag[i - 1] && mag[i] >= mag[i + 1] && s[i].t - last >= minGap) { steps++; last = s[i].t; }
  }
  const seconds = s[s.length - 1].t - s[0].t;
  return { steps, cadence: seconds > 0 ? Math.round(steps / seconds * 60) : 0, seconds: Math.round(seconds) };
}

/* Pulzus a kamera fényjeléből: a vörös csatorna átlaga ujjal letakart lencsénél a szívveréssel ritmusosan változik.
   times (mp), values → { bpm, quality (0–1) } vagy null. Trendszűrés, majd csúcskeresés 40–180/perc között. */
export function bpmFromSignal(times, values) {
  if (!times || times.length < 60) return null;
  const n = times.length, dur = times[n - 1] - times[0];
  if (dur < 10) return null;
  /* mozgóátlagos trendszűrés (~1 mp ablak) és enyhe simítás */
  const fps = (n - 1) / dur, w = Math.max(3, Math.round(fps)), sm = Math.max(1, Math.round(fps / 10));
  const det = values.map((v, i) => { const a = Math.max(0, i - w), b = Math.min(n, i + w + 1); return v - mean(values.slice(a, b)); });
  const sig = det.map((v, i) => mean(det.slice(Math.max(0, i - sm), Math.min(n, i + sm + 1))));
  const sd = Math.sqrt(mean(sig.map(v => v * v)));
  if (!(sd > 0)) return null;
  const peaks = [];
  for (let i = 1; i < n - 1; i++) {
    if (sig[i] > 0.3 * sd && sig[i] >= sig[i - 1] && sig[i] > sig[i + 1] && (!peaks.length || times[i] - times[peaks[peaks.length - 1]] >= 60 / 180)) peaks.push(i);
  }
  if (peaks.length < 8) return null;
  const ibi = peaks.slice(1).map((p, k) => times[p] - times[peaks[k]]).filter(x => x >= 60 / 180 && x <= 60 / 40);
  if (ibi.length < 6) return null;
  const sorted = [...ibi].sort((a, b) => a - b), med = sorted[Math.floor(sorted.length / 2)];
  const spread = mean(ibi.map(x => Math.abs(x - med))) / med;
  return { bpm: Math.round(60 / med), quality: Math.round(Math.max(0, Math.min(1, 1 - spread * 4)) * 100) / 100 };
}
