// Seedelt, szerializálható álvéletlen-generátor (mulberry32).
// Az állapot egyetlen szám a GameState-ben, így a mentés és a visszajátszás determinisztikus.

export interface RngHolder {
  rng: number;
}

export function nextFloat(h: RngHolder): number {
  h.rng = (h.rng + 0x6d2b79f5) | 0;
  let t = h.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function nextRange(h: RngHolder, min: number, max: number): number {
  return min + (max - min) * nextFloat(h);
}

export function nextInt(h: RngHolder, min: number, maxInclusive: number): number {
  return Math.floor(nextRange(h, min, maxInclusive + 1));
}

/** Súlyozott választás; a súlyok összege tetszőleges pozitív szám. */
export function nextWeighted(h: RngHolder, weights: readonly number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = nextFloat(h) * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i] ?? 0;
    if (r < 0) return i;
  }
  return weights.length - 1;
}

/** Poisson-eloszlású minta (Knuth), kis várható értékre. */
export function nextPoisson(h: RngHolder, mean: number): number {
  if (mean <= 0) return 0;
  const limit = Math.exp(-mean);
  let k = 0;
  let p = 1;
  for (;;) {
    p *= nextFloat(h);
    if (p <= limit) return k;
    k++;
  }
}
