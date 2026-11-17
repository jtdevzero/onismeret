/* A csúszó kiválasztása, ha több ember van a képen.
   A pózbecslő képkockánként legfeljebb néhány alakot ad, sorrend nélkül. Ezekből nyomvonalakat építünk
   (a csípő helyzete alapján képkockáról képkockára), és azt a nyomvonalat tartjuk meg, amelyik a legtovább,
   a legnagyobban és a kép közepéhez legközelebb látszik. Ennek oka: a filmező a csúszót követi a kamerával,
   ezért ő marad középen, a többiek átúsznak a képen.
   Bemenet: [{ t, poses: [[x, y, z, láthatóság] × 33, …] }] · Kimenet: [{ t, lm }] (lm: a csúszó pontjai vagy null) */

const KEY = [11, 12, 23, 24, 25, 26, 27, 28];
/* Csak a szinte láthatatlan alakokat dobjuk el; a részben látható alakot követjük (a visszajátszáson így is van csontváz),
   a mérésből pedig a series.js szűri ki a bizonytalan képkockákat. */
const MIN_VIS = 0.15;
const MAX_JUMP = 0.15;   /* ennél nagyobb csípőugrás két képkocka között már másik ember (a kép méretéhez képest) */
const MAX_GAP = 0.5;     /* ennyi másodpercnyi kiesés után a nyomvonal lezárul */

const visOf = p => KEY.reduce((a, i) => a + (p[i][3] ?? 1), 0) / KEY.length;
const visible = p => visOf(p) >= MIN_VIS;
export const hipOf = p => [(p[23][0] + p[24][0]) / 2, (p[23][1] + p[24][1]) / 2];
/* az alak magassága a képen: a legfelső és a legalsó kulcspont távolsága (orral együtt) */
export function heightOf(p) {
  const ys = [0, ...KEY].map(i => p[i][1]);
  return Math.max(...ys) - Math.min(...ys);
}
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/* Élő módhoz: a jelöltek közül az előző csípőhelyzethez legközelebbi; ha nincs előző, a legnagyobb. */
export function pickNearest(poses, prevHip) {
  const c = (poses || []).filter(p => p && visible(p));
  if (!c.length) return null;
  if (prevHip) {
    let best = null, bd = Infinity;
    for (const p of c) { const d = dist(hipOf(p), prevHip); if (d < bd) { bd = d; best = p; } }
    if (bd <= MAX_JUMP * 2) return best;
  }
  return c.reduce((a, b) => (heightOf(b) > heightOf(a) ? b : a));
}

export function trackSubject(raw) {
  const tracks = [];
  for (const f of raw || []) {
    const cands = (f.poses || (f.lm ? [f.lm] : [])).filter(p => p && visible(p)).map(p => ({ p, hip: hipOf(p) }));
    /* a még élő nyomvonalak és a jelöltek párosítása a legkisebb távolságok szerint */
    const live = tracks.filter(tr => f.t - tr.lastT <= MAX_GAP);
    const pairs = [];
    for (const tr of live) for (const c of cands) { const d = dist(tr.lastHip, c.hip); if (d <= MAX_JUMP) pairs.push({ tr, c, d }); }
    pairs.sort((a, b) => a.d - b.d);
    const usedT = new Set(), usedC = new Set();
    for (const { tr, c } of pairs) {
      if (usedT.has(tr) || usedC.has(c)) continue;
      usedT.add(tr); usedC.add(c);
      tr.points.set(f.t, c.p); tr.lastHip = c.hip; tr.lastT = f.t;
    }
    for (const c of cands) if (!usedC.has(c)) tracks.push({ points: new Map([[f.t, c.p]]), lastHip: c.hip, lastT: f.t });
  }
  /* pontszám: minden képkockán a magasság, a láthatósággal és a kép közepétől való távolsággal súlyozva */
  const score = tr => {
    let s = 0;
    for (const p of tr.points.values()) s += heightOf(p) * visOf(p) * Math.max(0.1, 1 - 1.2 * Math.abs(hipOf(p)[0] - 0.5));
    return s;
  };
  const best = tracks.reduce((a, b) => (!a || score(b) > score(a) ? b : a), null);
  return (raw || []).map(f => ({ t: f.t, lm: best && best.points.has(f.t) ? best.points.get(f.t) : null }));
}

/* Hány különböző embert látott a pózbecslő egyszerre (legalább a képkockák tizedén) – a felület figyelmeztetéséhez. */
export function crowdLevel(raw) {
  const n = (raw || []).filter(f => (f.poses || []).filter(p => p && visOf(p) >= 0.5).length > 1).length;
  return raw && raw.length ? n / raw.length : 0;
}
