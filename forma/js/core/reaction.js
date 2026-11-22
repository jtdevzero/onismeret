/* Reakcióidő-teszt kiértékelése: korai indulás kiszűrése, a próbák mediánja. A mért idő a készülék
   késleltetését is tartalmazza (általában 30–80 ms), ezért csak a saját fejlődésed követésére alkalmas. */
export const TRIALS = 5, MIN_MS = 100, MAX_MS = 1500;
export function reactionResult(times) {
  const valid = times.filter(t => Number.isFinite(t) && t >= MIN_MS && t <= MAX_MS);
  if (valid.length < 3) return null;
  const s = [...valid].sort((a, b) => a - b), mid = Math.floor(s.length / 2);
  const median = s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  return { median: Math.round(median), best: Math.round(s[0]), valid: valid.length, discarded: times.length - valid.length };
}
/* véletlen várakozás 1,5 és 4 mp között (hogy ne lehessen ritmusra koppintani) */
export const randomDelay = (rnd = Math.random) => Math.round(1500 + rnd() * 2500);
