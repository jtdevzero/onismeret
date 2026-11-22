/* Állóképesség: pulzuszónák, heti kardióperc a WHO-ajánláshoz mérve, és a napi „hogy vagy?” ellenőrzés.
   Tiszta függvények, DOM nélkül. */

const DAY = 86400000;

/* Maximális pulzus becslése: Tanaka és mtsai. (2001): 208 − 0,7 × életkor. */
export const maxHr = age => (Number.isFinite(age) ? Math.round(208 - 0.7 * age) : null);

/* Pulzuszónák a pulzustartalékból (Karvonen): nyugalmi + arány × (max − nyugalmi). Nyugalmi pulzus nélkül a max. %-ában.
   → [{ id, name, lo, hi, what }] */
export const ZONES = [
  ['z2', 'Alapozó (2. zóna)', 0.6, 0.7, 'Beszélgetni még tudsz, de dalolni már nem. Ez építi leginkább az alap-állóképességet.'],
  ['z3', 'Tempó (3. zóna)', 0.7, 0.8, 'Csak rövid mondatokban tudsz beszélni.'],
  ['z4', 'Intervallum (4. zóna)', 0.8, 0.9, 'Pár szó fér ki: rövid, kemény szakaszok pihenővel.'],
];
export function hrZones(age, rhr) {
  const max = maxHr(age);
  if (max == null) return [];
  const useReserve = Number.isFinite(rhr) && rhr > 30 && rhr < max - 40;
  return ZONES.map(([id, name, a, b, what]) => {
    const f = x => Math.round(useReserve ? rhr + x * (max - rhr) : x * max);
    return { id, name, lo: f(a), hi: f(b), what, method: useReserve ? 'reserve' : 'max' };
  });
}

/* A hét hétfőjének kezdete (helyi idő). */
export function weekStart(ts) {
  const d = new Date(ts); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}
/* Az n héttel korábbi (negatív n: későbbi) hét hétfője, naptári lépéssel. */
export function weeksBack(ts, n) {
  const d = new Date(weekStart(ts)); d.setDate(d.getDate() - 7 * n);
  return d.getTime();
}
/* A következő hét hétfője: naptári lépés, így nyári időszámítás váltásakor is pontos (a hét nem mindig 7 × 24 óra). */
export function weekEnd(ts) {
  const d = new Date(weekStart(ts)); d.setDate(d.getDate() + 7);
  return d.getTime();
}

/* Heti kardióperc: a WHO 150 perc közepes intenzitást ajánl; az intenzív perc kettőnek számít.
   items: [{ date, minutes, intensity: 'moderate'|'vigorous' }] → { minutes, equivalent, goal, pct } */
export const WEEKLY_GOAL = 150;
export function weeklyCardio(items, now = Date.now()) {
  const s = weekStart(now), e = weekEnd(now);
  const wk = items.filter(i => i.date >= s && i.date < e);
  const minutes = wk.reduce((a, i) => a + (i.minutes || 0), 0);
  const equivalent = wk.reduce((a, i) => a + (i.minutes || 0) * (i.intensity === 'vigorous' ? 2 : 1), 0);
  return { minutes, equivalent, goal: WEEKLY_GOAL, pct: Math.min(100, Math.round(100 * equivalent / WEEKLY_GOAL)), sessions: wk.length };
}

/* Heti erő- és mozgásnapok a forgó rendből: hány edzés volt ezen a héten (a cél 5). */
export function weeklyWorkouts(workouts, now = Date.now(), goal = 5) {
  const s = weekStart(now), e = weekEnd(now);
  const n = workouts.filter(w => w.date >= s && w.date < e).length;
  return { n, goal, pct: Math.min(100, Math.round(100 * n / goal)) };
}

/* Napi ellenőrzés edzés előtt: alvás, izomláz, energia (1 = rossz … 3 = jó), és fájdalom (igen/nem).
   → { level: 'go'|'light'|'rest', text } */
export function readiness({ sleep, soreness, energy, pain } = {}) {
  if (pain) return { level: 'rest', text: 'Fájdalom esetén ma ne terheld a fájó részt. Válaszd a mobilitást (csak fájdalommentes mozdulatokkal), vagy pihenj, és ha nem múlik, kérj orvosi tanácsot.' };
  const vals = [sleep, soreness, energy];
  if (!vals.every(v => [1, 2, 3].includes(v))) return null;
  const sum = vals.reduce((a, b) => a + b, 0), bad = vals.filter(v => v === 1).length;
  if (bad >= 2 || sum <= 4) return { level: 'rest', text: 'Ma inkább regenerálódj: könnyű mobilitás vagy séta. Egy kihagyott nap nem számít, a túlhajtás igen.' };
  if (bad === 1 || sum <= 6) return { level: 'light', text: 'Könnyített edzést javaslok: minden gyakorlatból eggyel kevesebb kör, ugyanazzal a gyakorlattal.' };
  return { level: 'go', text: 'Mehet a teljes edzés.' };
}

/* Kardiójavaslat a heti állapotból és a fittségi szintből. cardioScore: az állóképesség területi pontszáma (0–100). */
export function cardioPlan(cardioScore, week) {
  const base = cardioScore == null || cardioScore < 40
    ? { sessions: 3, minutes: 30, zone: 'z2', text: 'Heti 3 × 30 perc a 2. zónában: tempós séta, kocogás vagy kerékpár.' }
    : cardioScore < 75
      ? { sessions: 3, minutes: 35, zone: 'z2', text: 'Heti 2 × 40 perc a 2. zónában, és 1 intervallumos alkalom (pl. 4 × 4 perc a 4. zónában, közte 3 perc könnyű).' }
      : { sessions: 3, minutes: 40, zone: 'z2', text: 'Heti 2 × 45 perc a 2. zónában, és 1 intervallumos alkalom (4 × 4 perc a 4. zónában). A magas állóképességi pontszámhoz igazított javaslat.' };
  return { ...base, left: Math.max(0, WEEKLY_GOAL - (week ? week.equivalent : 0)) };
}
