import { tr } from '../ui/i18n.js';
/* Pontozás: percentilis a kor- és nemszerinti normához, kritériumpont, területi pontszám, VO₂max-becslés és fittségi kor.
   Tiszta függvények, DOM és hálózat nélkül: a norms.json és a tests.json tartalmát paraméterként kapják. */

const ANCHORS = [20, 40, 60, 80];
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

/* Melyik korsáv? → { index, outside }. 18 alatt null; az utolsó sáv fölött az utolsó sáv, outside: true jelzéssel. */
export function bandIndex(bands, age) {
  if (!Number.isFinite(age) || age < bands[0][0]) return null;
  const i = bands.findIndex(([lo, hi]) => age >= lo && age <= hi);
  if (i >= 0) return { index: i, outside: false };
  return { index: bands.length - 1, outside: true };
}

/* Lineáris interpoláció töréspontok között; a széleken a szomszédos szakasz meredekségével folytatjuk. */
function interp(points, x) {
  const n = points.length;
  let a, b;
  if (x <= points[0][0]) [a, b] = [points[0], points[1]];
  else if (x >= points[n - 1][0]) [a, b] = [points[n - 2], points[n - 1]];
  else for (let i = 0; i < n - 1; i++) if (x >= points[i][0] && x <= points[i + 1][0]) { [a, b] = [points[i], points[i + 1]]; break; }
  if (b[0] === a[0]) return a[1];
  return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
}

/* Percentilis a négy töréspontból (p20, p40, p60, p80). lower: a kisebb érték a jobb. Eredmény 1 és 99 között. */
export function percentile(value, cuts, lower = false) {
  if (!Number.isFinite(value)) return null;
  const sign = lower ? -1 : 1;
  /* azonos töréspontok (pl. 2, 2) esetén a sorrend megtartásához egy hajszálnyi eltolás */
  const xs = cuts.map((c, i) => sign * c + i * 1e-6);
  const pts = xs.map((x, i) => [x, ANCHORS[i]]);
  return Math.round(clamp(interp(pts, sign * value), 1, 99));
}

export function levelOf(score, levels = { low: 40, top: 75 }) {
  if (score == null) return null;
  return score >= levels.top ? 'top' : score >= levels.low ? 'mid' : 'low';
}
/* A területi és összesített pontszám különböző mércéket átlagol, ezért nem percentilis. */
export const LEVEL_NAMES = { low: tr('Alacsony pontszám'), mid: tr('Közepes pontszám'), top: tr('Magas pontszám') };

/* Egy teszt pontszáma (0–100). → { score, kind, percentile?, quality?, pain? } vagy null, ha nincs érték vagy nem pontozható. */
export function scoreTest(test, value, profile, norms) {
  if (value == null || value === '' || !Number.isFinite(Number(value))) return null;
  const v = Number(value);
  if (test.kind === 'baseline') return { kind: 'baseline', score: null, value: v };
  if (test.kind === 'criterion') {
    const s = Array.isArray(test.map) ? interp(test.map, v) : test.map[String(v)];
    if (s == null) return null;
    return { kind: 'criterion', value: v, score: Math.round(clamp(s, 1, 99)), pain: !Array.isArray(test.map) && v === 0 };
  }
  const norm = norms.tests[test.id];
  const band = bandIndex(norms.bands, profile.age);
  if (!norm || !band || !norm[profile.sex]) return null;
  const p = percentile(v, norm[profile.sex][band.index], !!norm.lower);
  return { kind: 'norm', value: v, score: p, percentile: p, quality: norm.quality, outside: band.outside };
}

/* PAI (fizikai aktivitási index, Nes 2011): gyakoriság × intenzitás × időtartam. */
export const paIndex = ({ frequency, intensity, duration } = {}) =>
  [frequency, intensity, duration].every(Number.isFinite) ? frequency * intensity * duration : null;

/* Edzés nélküli VO₂max-becslés (ml/kg/perc). vitals: { rhr, waist, frequency, intensity, duration } */
export function estimateVo2(profile, vitals, norms) {
  const c = norms.vo2[profile.sex], pai = paIndex(vitals || {});
  if (!c || !vitals || ![profile.age, vitals.rhr, vitals.waist, pai].every(Number.isFinite)) return null;
  const v = c.a - c.age * profile.age - c.waist * vitals.waist - c.rhr * vitals.rhr + c.pai * pai;
  return Math.round(clamp(v, 10, 90) * 10) / 10;
}

/* Fittségi kor: az életkor, amelynek átlagos VO₂max-a megegyezik a becsült értékkel. 20 és 90 közé szorítva. */
export function fitnessAge(vo2, sex, norms) {
  const table = norms.vo2.meanByAge[sex];
  if (!table || !Number.isFinite(vo2)) return null;
  /* a táblázat csökkenő: fordított interpoláció (VO₂ → kor) */
  const pts = table.map(([age, v]) => [-v, age]);
  return Math.round(clamp(interp(pts, -vo2), 20, 90));
}

/* A VO₂max percentilise a korosztályban, normális eloszlást feltételezve (SD: férfi 7,5, nő 6,5 ml/kg/perc). */
export function vo2Percentile(vo2, profile, norms) {
  const table = norms.vo2.meanByAge[profile.sex];
  if (!table || !Number.isFinite(vo2) || !Number.isFinite(profile.age)) return null;
  const mean = interp(table, profile.age), sd = profile.sex === 'female' ? 6.5 : 7.5;
  return Math.round(clamp(100 * normCdf((vo2 - mean) / sd), 1, 99));
}
function normCdf(z) {
  /* Abramowitz–Stegun 7.1.26 közelítés */
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
  return z >= 0 ? (1 + y) / 2 : (1 - y) / 2;
}

/* A teljes felmérés kiértékelése.
   results: { tesztId: érték } · vitals: { rhr, waist, frequency, intensity, duration } · profile: { age, sex }
   → { tests: { id: pontozás }, areas: { id: { score, level, n } }, vo2, fitnessAge, overall, weakest: [területek] } */
export function evaluate({ results = {}, vitals = {}, profile }, testsDef, norms) {
  const tests = {};
  for (const t of testsDef.tests) {
    const s = scoreTest(t, results[t.id], profile, norms);
    if (s) tests[t.id] = s;
  }
  const vo2 = estimateVo2(profile, vitals, norms);
  const fAge = vo2 == null ? null : fitnessAge(vo2, profile.sex, norms);
  const areas = {};
  for (const a of testsDef.areas) {
    const scores = testsDef.tests.filter(t => t.area === a.id && tests[t.id] && tests[t.id].score != null).map(t => tests[t.id].score);
    /* az állóképességnél a VO₂max-becslés is beleszámít, a lépcsőteszt nélkül csak az */
    if (a.id === 'cardio' && vo2 != null) scores.push(vo2Percentile(vo2, profile, norms));
    if (!scores.length) continue;
    const score = Math.round(scores.reduce((x, y) => x + y, 0) / scores.length);
    areas[a.id] = { score, level: levelOf(score, norms.levels), n: scores.length };
  }
  const vals = Object.values(areas).map(a => a.score);
  const overall = vals.length ? Math.round(vals.reduce((x, y) => x + y, 0) / vals.length) : null;
  const weakest = Object.entries(areas).sort((a, b) => a[1].score - b[1].score).slice(0, 2).map(([id]) => id);
  const pain = Object.entries(tests).filter(([, s]) => s.pain).map(([id]) => id);
  return { tests, areas, vo2, fitnessAge: fAge, overall, weakest, pain };
}

/* Mobilitási célterületek gyengeség szerint sorba rendezve (a legrosszabb elöl), a kritérium- és normatesztekből. */
export function mobilityTargets(evaluation, testsDef) {
  return testsDef.tests
    .filter(t => t.target && evaluation.tests[t.id] && evaluation.tests[t.id].score != null)
    .map(t => ({ target: t.target, score: evaluation.tests[t.id].score }))
    .sort((a, b) => a.score - b.score);
}
