/* Lesiklás elemzése: kanyarok felismerése és technikai mutatók egy kamerás testpont-idősorból.

   FONTOS KORLÁT: a sávhatárok (THRESHOLDS) szakmai becslések, valódi sí- és snowboardvideókon még nincsenek
   kalibrálva. Egy kamerából a szögek a nézőponttól és a lejtő dőlésétől is függenek, ezért minden mutató kap
   megbízhatóságot, és csak abból a kameraállásból számít használhatónak, ahonnan értelmezhető. */
import { LM, mid, clamp, mean, std, median, percentile, round, movingAverage } from './geometry.js';
import { prepare, bodyOf, visibilityOf } from './series.js';

export const RELIABLE = 0.6; /* ez alatt a mutatóból nem vonunk le következtetést */

export const THRESHOLDS = {
  foreAft: { low: -0.15, high: 0.15 },      /* csípő a boka előtt (+) vagy mögött (−), a lábhossz arányában */
  kneeFlex: { low: 25, high: 85 },          /* térdhajlás fokban (0 = nyújtott) */
  kneeRange: { low: 10 },                   /* a hajlítás–nyújtás terjedelme fokban */
  hipFlex: { low: 15, high: 75 },           /* törzs előrehajlása a combhoz képest, fokban */
  torsoStability: { high: 8 },              /* a törzsdőlés szórása fokban (oldalnézet) */
  inclination: { low: 6 },                  /* a láb dőlése a kanyar csúcsán, fokban */
  angulation: { low: 3 },                   /* a törzs ennyivel marad függőlegesebb a lábnál, fokban */
  stance: { low: 0.45, high: 1.5 },         /* bokatávolság a vállszélességhez képest (sí) */
  kneeTrack: { low: 0.7 },                  /* térdtávolság a bokatávolsághoz képest */
  rotation: { high: 25 },                   /* a látszó vállszélesség ingadozása, % */
  symmetry: { high: 25 },                   /* a két irány eltérése, % */
  rhythm: { high: 30 },                     /* a kanyaridők szórása, % */
  hands: { low: 0 },                        /* kézmagasság: 0 = csípő, 1 = váll */
  armQuiet: { high: 0.35 },                 /* a csukló mozgása a vállhoz képest, a törzshossz arányában */
};

/* Melyik nézetből mennyire értelmezhető egy mutató (0 = nem használható).
   Snowboardon a test oldalt áll a deszkán, ezért az „oldalról” felvételen (keresztben halad el a kamera előtt)
   a mellkast vagy a hátat látjuk: ott más mutatók olvashatók le, mint sín. */
const VIEW_FACTOR = {
  ski: {
    foreAft: { side: 1, frontal: 0 }, kneeFlex: { side: 1, frontal: 0.5 }, kneeRange: { side: 1, frontal: 0.5 },
    hipFlex: { side: 1, frontal: 0 }, torsoStability: { side: 1, frontal: 0 },
    inclination: { side: 0, frontal: 1 }, angulation: { side: 0, frontal: 1 }, stance: { side: 0, frontal: 1 },
    kneeTrack: { side: 0, frontal: 0 }, rotation: { side: 0, frontal: 0.6 },
    symmetry: { side: 0.5, frontal: 1 }, rhythm: { side: 0.5, frontal: 1 },
    hands: { side: 1, frontal: 1 }, armQuiet: { side: 0.7, frontal: 0.7 },
  },
  snowboard: {
    foreAft: { side: 1, frontal: 0 }, kneeFlex: { side: 0.8, frontal: 0.5 }, kneeRange: { side: 0.8, frontal: 0.5 },
    hipFlex: { side: 0, frontal: 0.7 }, torsoStability: { side: 0, frontal: 0 },
    inclination: { side: 0, frontal: 1 }, angulation: { side: 0, frontal: 0.6 }, stance: { side: 0, frontal: 0 },
    kneeTrack: { side: 1, frontal: 0 }, rotation: { side: 0.8, frontal: 0 },
    symmetry: { side: 0.5, frontal: 1 }, rhythm: { side: 0.5, frontal: 1 },
    hands: { side: 1, frontal: 1 }, armQuiet: { side: 0.8, frontal: 0.7 },
  },
};
const UNITS = {
  foreAft: 'ratio', kneeFlex: 'deg', kneeRange: 'deg', hipFlex: 'deg', torsoStability: 'deg', inclination: 'deg',
  angulation: 'deg', stance: 'ratio', kneeTrack: 'ratio', rotation: '%', symmetry: '%', rhythm: '%', hands: 'ratio', armQuiet: 'ratio',
};

function band(id, v) {
  const th = THRESHOLDS[id];
  if (!Number.isFinite(v)) return null;
  if (th.low != null && v < th.low) return 'low';
  if (th.high != null && v > th.high) return 'high';
  return 'ok';
}

/* Kanyarok a láb oldalirányú dőléséből: előjelváltás hiszterézissel. → [{ i0, i1, t0, t1, dir, peak, peakT, partial }] */
export function detectTurns(t, sig) {
  const n = t.length;
  if (n < 8) return [];
  /* A dőlést a kép függőlegeséhez mérjük, alapvonal-korrekció nélkül: bármilyen levonás (átlag vagy középérték)
     elrejtené a két irány valódi különbségét. Ennek ára, hogy a ferdén tartott telefon hamis aszimmetriát ad,
     ezért a filmezési útmutató vízszintes tartást kér. */
  const x = movingAverage(t, sig, 0.15);
  const thr = Math.max(2.5, 0.3 * percentile(x.map(Math.abs), 0.9));
  const turns = [];
  let state = 0, start = 0, cross = 0;
  const close = (end, partial) => {
    let peak = 0, pk = start;
    for (let i = start; i <= end; i++) if (Math.abs(x[i]) > peak) { peak = Math.abs(x[i]); pk = i; }
    turns.push({ i0: start, i1: end, t0: t[start], t1: t[end], dir: state > 0 ? 'A' : 'B', peak, peakT: t[pk], peakI: pk, partial });
  };
  for (let i = 1; i < n; i++) {
    if (x[i - 1] * x[i] <= 0) cross = i;
    const sg = x[i] >= thr ? 1 : x[i] <= -thr ? -1 : 0;
    if (sg && sg !== state) {
      if (state) close(cross, turns.length === 0 && start === 0);
      start = state ? cross : (cross || 0);
      state = sg;
    }
  }
  if (state) close(n - 1, true);
  if (turns.length && turns[0].i0 === 0) turns[0].partial = true;
  return turns.filter(k => k.t1 - k.t0 >= 0.35).map(k => {
    /* fázisok: kezdés (a csúcs feléig), irányítás, befejezés (a csúcs fele alá esés után) */
    let a = k.i0, b = k.i1;
    while (a < k.peakI && Math.abs(x[a]) < 0.5 * k.peak) a++;
    while (b > k.peakI && Math.abs(x[b]) < 0.5 * k.peak) b--;
    return { ...k, controlI0: a, controlI1: b, initEnd: t[a], finishStart: t[b] };
  });
}

/* A csúszó merre néz a képen (+1 jobbra, −1 balra, 0 = nem dönthető el). Oldalnézethez. */
function facing(p, b) {
  const toe = mid(p[LM.lToe], p[LM.rToe]), heel = mid(p[LM.lHeel], p[LM.rHeel]);
  const f = (toe.x - heel.x) + (p[LM.nose].x - b.S.x);
  return Math.abs(f) > 0.03 * b.bodyLen ? Math.sign(f) : 0;
}

/* raw: [{ t, lm }] · opts: { aspect, sport: 'ski'|'snowboard', view: 'side'|'front'|'back', travel?: 'left'|'right' } */
export function analyzeRun(raw, opts = {}) {
  const sport = opts.sport === 'snowboard' ? 'snowboard' : 'ski';
  const viewKind = opts.view === 'side' ? 'side' : 'frontal';
  const { frames, quality } = prepare(raw, opts.aspect);
  const F = frames.filter(f => f.p).map(f => ({ t: f.t, p: f.p, b: bodyOf(f.p) }));
  const base = { sport, view: opts.view || (viewKind === 'side' ? 'side' : 'front'), quality };
  if (quality.duration < 3) return { ok: false, reason: 'too_short', ...base };
  if (F.length < 15 || quality.tracked < 0.3) return { ok: false, reason: 'not_tracked', ...base };

  const t = F.map(f => f.t);
  const turns = detectTurns(t, F.map(f => f.b.legTilt));
  const complete = turns.filter(k => !k.partial);

  const sizeFactor = quality.bodyHeight < 0.12 ? 0.3 : quality.bodyHeight < 0.2 ? 0.6 : 1;
  const trackFactor = Math.min(1, quality.tracked / 0.8);
  const metrics = {};
  const put = (id, value, { vis = 1, sample = 1, usable = true, detail } = {}) => {
    const vf = VIEW_FACTOR[sport][id][viewKind];
    const ok = usable && vf > 0 && Number.isFinite(value);
    metrics[id] = {
      value: ok ? round(value, 2) : null, unit: UNITS[id], band: ok ? band(id, value) : null,
      confidence: ok ? round(clamp(trackFactor * sizeFactor * vis * vf * clamp(sample, 0, 1), 0, 1), 2) : 0,
      usable: ok, ...(detail ? { detail } : {}),
    };
  };
  const frameSample = Math.min(1, F.length / 30);
  const legVis = visibilityOf(frames, [LM.lHip, LM.rHip, LM.lKnee, LM.rKnee, LM.lAnkle, LM.rAnkle]);
  const upperVis = visibilityOf(frames, [LM.lShoulder, LM.rShoulder, LM.lHip, LM.rHip]);
  const armVis = visibilityOf(frames, [LM.lWrist, LM.rWrist, LM.lShoulder, LM.rShoulder]);
  const footVis = visibilityOf(frames, [LM.lHeel, LM.rHeel, LM.lToe, LM.rToe, LM.lAnkle, LM.rAnkle]);

  /* elöl–hátul. Sí: a csípő helyzete a bokához képest a haladás irányában (oldalnézet).
     Snowboard: a csípő a két láb között az elülső (+) vagy a hátsó (−) láb felé tolódik; ehhez tudni kell,
     merre halad a csúszó a képen (opts.travel), mert ez a testtartásból nem derül ki. */
  const fa = [];
  if (sport === 'ski') {
    for (const f of F) { const s = facing(f.p, f.b); if (s) fa.push(s * (f.b.H.x - f.b.A.x) / f.b.legLen); }
  } else if (opts.travel === 'left' || opts.travel === 'right') {
    const dir = opts.travel === 'right' ? 1 : -1;
    for (const f of F) if (f.b.ankleDist > 0.5 * f.b.shoulderW) fa.push(dir * (f.b.H.x - f.b.A.x) / f.b.ankleDist);
  }
  put('foreAft', median(fa), { vis: Math.min(legVis, footVis), sample: fa.length / 30, usable: fa.length > 0 });

  const flex = F.map(f => 180 - f.b.knee);
  put('kneeFlex', median(flex), { vis: legVis, sample: frameSample });
  put('kneeRange', percentile(flex, 0.9) - percentile(flex, 0.1), { vis: legVis, sample: frameSample });
  put('hipFlex', median(F.map(f => 180 - f.b.hipAngle)), { vis: Math.min(legVis, upperVis), sample: frameSample });
  const torso = F.map(f => f.b.torsoTilt), torsoTrend = movingAverage(t, torso, 1.5);
  put('torsoStability', std(torso.map((v, i) => v - torsoTrend[i])), { vis: upperVis, sample: frameSample });

  /* kanyaronkénti mutatók */
  const turnSample = complete.length / 4;
  const peakMean = complete.length ? mean(complete.map(k => k.peak)) : NaN;
  put('inclination', peakMean, { vis: legVis, sample: turnSample });
  const ang = [];
  for (const k of complete) {
    const sign = k.dir === 'A' ? 1 : -1;
    for (let i = k.controlI0; i <= k.controlI1; i++) ang.push(sign * (F[i].b.legTilt - F[i].b.torsoTilt));
  }
  /* kevés dőlésnél nincs mit szögelni: ilyenkor a mutató nem értelmezhető */
  put('angulation', mean(ang), { vis: Math.min(legVis, upperVis), sample: turnSample, usable: peakMean >= 8 && ang.length > 0 });

  put('stance', median(F.map(f => f.b.ankleDist / (f.b.shoulderW || 1))), { vis: legVis, sample: frameSample });
  put('kneeTrack', median(F.map(f => f.b.kneeDist / (f.b.ankleDist || 1))), { vis: legVis, sample: frameSample });
  const sw = F.map(f => f.b.shoulderW / (f.b.torsoLen || 1));
  put('rotation', 100 * std(sw) / (mean(sw) || 1), { vis: upperVis, sample: frameSample });

  const A = complete.filter(k => k.dir === 'A'), B = complete.filter(k => k.dir === 'B');
  const asym = (a, b) => (a + b ? 200 * Math.abs(a - b) / (a + b) : 0);
  if (A.length >= 2 && B.length >= 2) {
    const dur = asym(mean(A.map(k => k.t1 - k.t0)), mean(B.map(k => k.t1 - k.t0)));
    const amp = asym(mean(A.map(k => k.peak)), mean(B.map(k => k.peak)));
    put('symmetry', Math.max(dur, amp), { vis: legVis, sample: complete.length / 6, detail: { duration: round(dur), amplitude: round(amp) } });
  } else put('symmetry', NaN);
  const durs = complete.map(k => k.t1 - k.t0);
  put('rhythm', durs.length >= 4 ? 100 * std(durs) / mean(durs) : NaN, { vis: legVis, sample: complete.length / 6 });

  put('hands', median(F.map(f => (f.b.H.y - mid(f.p[LM.lWrist], f.p[LM.rWrist]).y) / (f.b.torsoLen || 1))), { vis: armVis, sample: frameSample });
  const arm = side => {
    const w = side === 'l' ? LM.lWrist : LM.rWrist;
    const rx = F.map(f => (f.p[w].x - f.b.S.x) / (f.b.torsoLen || 1)), ry = F.map(f => (f.p[w].y - f.b.S.y) / (f.b.torsoLen || 1));
    return Math.hypot(std(rx), std(ry));
  };
  put('armQuiet', (arm('l') + arm('r')) / 2, { vis: armVis, sample: frameSample });

  /* kulcsképkockák: a kanyarok csúcsai, különben egyenletesen elosztva */
  let keyframes = complete.map(k => k.peakT);
  if (keyframes.length > 5) { const step = (keyframes.length - 1) / 4; keyframes = [0, 1, 2, 3, 4].map(i => keyframes[Math.round(i * step)]); }
  if (keyframes.length < 3) keyframes = [0.15, 0.4, 0.6, 0.85].map(f => t[Math.round(f * (t.length - 1))]);

  return {
    ok: true, ...base,
    turns: turns.map(k => ({
      t0: round(k.t0, 2), t1: round(k.t1, 2), dir: k.dir, peak: round(k.peak), peakT: round(k.peakT, 2),
      partial: k.partial, initEnd: round(k.initEnd, 2), finishStart: round(k.finishStart, 2),
    })),
    turnCount: turns.length, completeTurns: complete.length,
    metrics, keyframes: keyframes.map(v => round(v, 2)),
  };
}

/* A megbízható, használható mutatók azonosítói. */
export const reliableMetrics = a => Object.keys(a.metrics || {}).filter(id => a.metrics[id].usable && a.metrics[id].confidence >= RELIABLE);
