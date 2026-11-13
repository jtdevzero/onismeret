/* Otthoni gyakorlatok és felmérő tesztek elemzése: ismétlésszámlálás, kitartott idő és formaértékelés.
   Otthon a kamera áll, ezért itt a képen mért helyzet is használható (a pályán nem).
   A határértékek szakmai becslések, szakember még nem kalibrálta őket.

   Eredmény: { ok, exercise, quality, reps, holdSeconds, checks: [{ id, band: 'ok'|'fix', value, unit }],
               sides: { left, right } | null, asymmetry: % | null, perRep: [...] } */
import { LM, mid, clamp, mean, std, median, percentile, round, angleAt, tilt, movingAverage } from './geometry.js';
import { prepare, bodyOf, visibilityOf } from './series.js';

const DEG = 180 / Math.PI;
const check = (id, ok, value, unit = 'deg') => ({ id, band: ok ? 'ok' : 'fix', value: round(value), unit });
const asymPct = (a, b) => (Number.isFinite(a) && Number.isFinite(b) && a + b ? round(200 * Math.abs(a - b) / (a + b)) : null);

/* Ismétlések egy jelből, ahol a kisebb érték a „lent” (pl. térdszög). → [{ i0, bottom, i1 }] */
export function detectReps(sig, minRange) {
  const v = sig.filter(Number.isFinite);
  if (v.length < 6) return [];
  const top = percentile(v, 0.9), bot = percentile(v, 0.1), range = top - bot;
  if (range < minRange) return [];
  const lo = bot + 0.35 * range, hi = top - 0.25 * range;
  const reps = [];
  let down = false, start = 0, lastUp = 0, bottom = 0;
  for (let i = 0; i < sig.length; i++) {
    const s = sig[i];
    if (!Number.isFinite(s)) continue;
    if (!down) {
      if (s > hi) lastUp = i;
      if (s < lo) { down = true; start = lastUp; bottom = i; }
    } else {
      if (s < sig[bottom]) bottom = i;
      if (s > hi) { reps.push({ i0: start, bottom, i1: i }); down = false; lastUp = i; }
    }
  }
  return reps;
}

/* A leghosszabb összefüggő időszak, amíg a feltétel teljesül (rövid, 0,3 mp alatti kihagyást elnézünk). */
function longestHold(t, okArr) {
  let best = { dur: 0, i0: 0, i1: 0 }, start = -1, lastOk = -1;
  for (let i = 0; i < t.length; i++) {
    if (okArr[i]) { if (start < 0) start = i; lastOk = i; }
    if (start >= 0 && (!okArr[i] && t[i] - t[lastOk] > 0.3 || i === t.length - 1)) {
      if (t[lastOk] - t[start] > best.dur) best = { dur: t[lastOk] - t[start], i0: start, i1: lastOk };
      if (!okArr[i]) start = -1;
    }
  }
  return best;
}
const isFrontal = b => b.shoulderW / (b.torsoLen || 1) > 0.45;

/* ---- gyakorlatonkénti elemzők: (F, t) → részeredmény ---- */

function squat(F) {
  const reps = detectReps(F.map(f => f.b.knee), 30);
  const perRep = reps.map(r => {
    const f = F[r.bottom], frontal = isFrontal(f.b);
    return {
      view: frontal ? 'frontal' : 'side', depth: f.b.knee, seconds: F[r.i1].t - F[r.i0].t,
      valgus: frontal ? f.b.kneeDist / (f.b.ankleDist || 1) : null,
      torso: frontal ? null : Math.abs(f.b.torsoTilt),
    };
  });
  const checks = [];
  if (perRep.length) {
    const depth = mean(perRep.map(r => r.depth));
    checks.push(check('depth', depth <= 105, depth));
    const fr = perRep.filter(r => r.valgus != null), sd = perRep.filter(r => r.torso != null);
    if (fr.length) { const v = mean(fr.map(r => r.valgus)); checks.push(check('knees_out', v >= 0.75, v, 'ratio')); }
    if (sd.length) { const v = mean(sd.map(r => r.torso)); checks.push(check('chest_up', v <= 55, v)); }
    const sec = mean(perRep.map(r => r.seconds));
    checks.push(check('tempo', sec >= 1.2, sec, 's'));
  }
  return { reps: reps.length, perRep, checks };
}

/* Melyik lábon áll: amelyik bokája lejjebb van a képen. */
function standingLeg(f) {
  const d = f.p[LM.lAnkle].y - f.p[LM.rAnkle].y;
  return Math.abs(d) > 0.03 * f.b.bodyLen ? (d > 0 ? 'left' : 'right') : null;
}
function legPoints(f, side) {
  const L = side === 'left';
  return { hip: f.p[L ? LM.lHip : LM.rHip], knee: f.p[L ? LM.lKnee : LM.rKnee], ankle: f.p[L ? LM.lAnkle : LM.rAnkle] };
}
function sides(perRep, key, lowerIsBetter) {
  const L = perRep.filter(r => r.side === 'left').map(r => r[key]), R = perRep.filter(r => r.side === 'right').map(r => r[key]);
  if (!L.length || !R.length) return { sides: null, asymmetry: null, weaker: null };
  const l = mean(L), r = mean(R);
  const weaker = Math.abs(l - r) < 1e-9 ? null : ((l > r) === !!lowerIsBetter ? 'left' : 'right');
  return { sides: { left: round(l), right: round(r) }, asymmetry: asymPct(l, r), weaker };
}

function singleLegSquat(F) {
  const sig = F.map(f => Math.min(f.b.kneeL, f.b.kneeR));
  const reps = detectReps(sig, 20);
  const perRep = reps.map((r, n) => {
    const f = F[r.bottom];
    /* ha a képből nem dönthető el, a megegyezés számít: a sorozat első fele bal, a második jobb láb */
    const side = standingLeg(f) || (n < reps.length / 2 ? 'left' : 'right');
    const { hip, knee, ankle } = legPoints(f, side);
    /* a térd befelé tér ki a csípő–boka vonalból: a lábhossz arányában */
    const lineX = ankle.x + (hip.x - ankle.x) * ((ankle.y - knee.y) / ((ankle.y - hip.y) || 1));
    const otherHip = f.p[side === 'left' ? LM.rHip : LM.lHip];
    const inward = (Math.sign(otherHip.x - hip.x) || 1) * (knee.x - lineX);
    return {
      side, depth: angleAt(hip, knee, ankle), kneeIn: inward / (f.b.legLen || 1),
      pelvis: Math.abs(Math.atan2(f.p[LM.lHip].y - f.p[LM.rHip].y, Math.abs(f.p[LM.lHip].x - f.p[LM.rHip].x) || 1e-6) * DEG),
    };
  });
  const checks = [];
  if (perRep.length) {
    const d = mean(perRep.map(r => r.depth)), k = mean(perRep.map(r => r.kneeIn)), pv = mean(perRep.map(r => r.pelvis));
    checks.push(check('depth', d <= 125, d), check('knee_line', k <= 0.08, k, 'ratio'), check('pelvis_level', pv <= 8, pv));
  }
  return { reps: reps.length, perRep, checks, ...sides(perRep, 'depth', true) };
}

function lunge(F) {
  const reps = detectReps(F.map(f => Math.min(f.b.kneeL, f.b.kneeR)), 30);
  const perRep = reps.map(r => ({ depth: Math.min(F[r.bottom].b.kneeL, F[r.bottom].b.kneeR), torso: Math.abs(F[r.bottom].b.torsoTilt), seconds: F[r.i1].t - F[r.i0].t }));
  const checks = [];
  if (perRep.length) {
    const d = mean(perRep.map(r => r.depth)), tr = mean(perRep.map(r => r.torso)), sec = mean(perRep.map(r => r.seconds));
    checks.push(check('depth', d <= 105, d), check('chest_up', tr <= 30, tr), check('tempo', sec >= 1.2, sec, 's'));
  }
  return { reps: reps.length, perRep, checks };
}

function lateralLunge(F) {
  const reps = detectReps(F.map(f => Math.min(f.b.kneeL, f.b.kneeR)), 30);
  const perRep = reps.map(r => {
    const b = F[r.bottom].b;
    return { side: b.kneeL < b.kneeR ? 'left' : 'right', depth: Math.min(b.kneeL, b.kneeR), straight: Math.max(b.kneeL, b.kneeR), torso: Math.abs(b.torsoTilt) };
  });
  const checks = [];
  if (perRep.length) {
    const d = mean(perRep.map(r => r.depth)), s = mean(perRep.map(r => r.straight)), tr = mean(perRep.map(r => r.torso));
    checks.push(check('depth', d <= 115, d), check('other_leg_straight', s >= 155, s), check('chest_up', tr <= 40, tr));
  }
  return { reps: reps.length, perRep, checks, ...sides(perRep, 'depth', true) };
}

function gluteBridge(F) {
  /* fent a csípő nyújtva van: a jelet megfordítjuk, hogy a „lent” a nyújtott helyzet legyen */
  const reps = detectReps(F.map(f => -f.b.hipAngle), 20);
  const perRep = reps.map(r => ({ top: F[r.bottom].b.hipAngle, seconds: F[r.i1].t - F[r.i0].t }));
  const checks = [];
  if (perRep.length) {
    const top = mean(perRep.map(r => r.top)), sec = mean(perRep.map(r => r.seconds));
    checks.push(check('hips_high', top >= 160, top), check('tempo', sec >= 1.5, sec, 's'));
  }
  return { reps: reps.length, perRep, checks };
}

function lateralHops(F, t) {
  const w = median(F.map(f => f.b.shoulderW)) || 1;
  const hx = F.map(f => f.b.H.x), m = mean(hx);
  const x = movingAverage(t, hx.map(v => (v - m) / w), 0.05);
  const times = [];
  let state = 0;
  for (let i = 0; i < x.length; i++) {
    const s = x[i] > 0.15 ? 1 : x[i] < -0.15 ? -1 : 0;
    if (s && s !== state) { if (state) times.push(t[i]); state = s; }
  }
  const gaps = times.slice(1).map((v, i) => v - times[i]);
  const cv = gaps.length >= 3 ? 100 * std(gaps) / mean(gaps) : null;
  const landing = percentile(F.map(f => Math.min(f.b.kneeL, f.b.kneeR)), 0.2);
  const duration = t[t.length - 1] - t[0];
  const checks = [];
  if (times.length) {
    if (cv != null) checks.push(check('rhythm', cv <= 25, cv, '%'));
    checks.push(check('soft_landing', landing <= 150, landing));
  }
  return { reps: times.length, perRep: [], checks, rate: duration ? round(times.length / duration * 20) : null };
}

function hold(F, t, okFn, valueFn, checksFn) {
  const best = longestHold(t, F.map(okFn));
  const seg = F.slice(best.i0, best.i1 + 1);
  return { reps: 0, perRep: [], holdSeconds: round(best.dur), checks: best.dur > 1 ? checksFn(seg.map(valueFn), best.dur) : [] };
}
const wallSit = (F, t) => hold(F, t,
  f => f.b.knee >= 70 && f.b.knee <= 125 && Math.abs(f.b.torsoTilt) < 25,
  f => f.b.knee,
  v => [check('knee_angle', mean(v) <= 105, mean(v)), check('steady', std(v) <= 6, std(v))]);
const bodyLine = f => angleAt(f.b.S, f.b.H, f.b.A);
const plank = (F, t) => hold(F, t,
  f => bodyLine(f) >= 155 && Math.abs(Math.abs(tilt(f.b.A, f.b.S)) - 90) < 35,
  bodyLine,
  v => [check('straight_line', mean(v) >= 165, mean(v)), check('steady', std(v) <= 5, std(v))]);

function singleLegStand(F, t) {
  const side = F.map(standingLeg);
  const perSide = {};
  for (const s of ['left', 'right']) {
    const best = longestHold(t, side.map(v => v === s));
    if (best.dur < 1) continue;
    const seg = F.slice(best.i0, best.i1 + 1);
    const sway = std(seg.map(f => (f.b.H.x - f.p[s === 'left' ? LM.lAnkle : LM.rAnkle].x) / (f.b.bodyLen || 1)));
    perSide[s] = { seconds: best.dur, sway };
  }
  const L = perSide.left, R = perSide.right, all = [L, R].filter(Boolean);
  const checks = [];
  if (all.length) {
    const sw = mean(all.map(v => v.sway)), sec = Math.min(...all.map(v => v.seconds));
    checks.push(check('still', sw <= 0.03, sw, 'ratio'), check('hold_time', sec >= 20, sec, 's'));
  }
  const res = { reps: 0, perRep: [], holdSeconds: all.length ? round(Math.min(...all.map(v => v.seconds))) : 0, checks, sides: null, asymmetry: null, weaker: null };
  if (L && R) {
    res.sides = { left: round(L.sway, 3), right: round(R.sway, 3) };
    res.asymmetry = asymPct(L.sway, R.sway);
    res.weaker = L.sway > R.sway ? 'left' : 'right';
  }
  return res;
}

/* Törzsfordítás ülve, szemből: a vállak látszó szélessége csökken, az irányt a vállak mélysége (z) adja. */
function trunkRotation(F) {
  const w = F.map(f => f.b.shoulderW), max = percentile(w, 0.95) || 1;
  const rot = F.map((f, i) => ({ deg: Math.acos(clamp(w[i] / max, 0, 1)) * DEG, side: f.p[LM.lShoulder].z < f.p[LM.rShoulder].z ? 'right' : 'left' }));
  const peak = s => { const v = rot.filter(r => r.side === s).map(r => r.deg); return v.length ? percentile(v, 0.95) : NaN; };
  const l = peak('left'), r = peak('right'), both = [l, r].filter(Number.isFinite);
  const checks = both.length ? [check('range', Math.min(...both) >= 35, Math.min(...both))] : [];
  const out = { reps: 0, perRep: [], checks, sides: null, asymmetry: null, weaker: null };
  if (both.length === 2) { out.sides = { left: round(l), right: round(r) }; out.asymmetry = asymPct(l, r); out.weaker = l < r ? 'left' : 'right'; }
  return out;
}

/* Térd a falhoz (bokateszt), oldalról: az elöl lévő láb sípcsontjának dőlése. Megegyezés: előbb a bal, aztán a jobb láb. */
function ankleWall(F) {
  const shin = F.map(f => Math.max(Math.abs(tilt(f.p[LM.lAnkle], f.p[LM.lKnee])), Math.abs(tilt(f.p[LM.rAnkle], f.p[LM.rKnee]))));
  const reps = detectReps(shin.map(v => -v), 8);
  const perRep = reps.map((r, n) => ({ side: n < reps.length / 2 ? 'left' : 'right', shin: shin[r.bottom] }));
  const checks = perRep.length ? [check('ankle_range', mean(perRep.map(r => r.shin)) >= 35, mean(perRep.map(r => r.shin)))] : [];
  return { reps: reps.length, perRep, checks, ...(reps.length >= 2 ? sides(perRep, 'shin', false) : { sides: null, asymmetry: null, weaker: null }) };
}

export const ANALYZERS = {
  squat, deep_squat: squat, sl_squat: singleLegSquat, reverse_lunge: lunge, lateral_lunge: lateralLunge,
  glute_bridge: gluteBridge, lateral_hops: lateralHops, wall_sit: wallSit, plank, side_plank: plank,
  sl_stand: singleLegStand, trunk_rotation: trunkRotation, ankle_wall: ankleWall,
};
export const isAnalyzable = id => Object.prototype.hasOwnProperty.call(ANALYZERS, id);

/* raw: [{ t, lm }] · opts: { aspect, exercise } */
export function analyzeExercise(raw, opts = {}) {
  const id = opts.exercise;
  const { frames, quality } = prepare(raw, opts.aspect);
  const base = { exercise: id, quality };
  if (!isAnalyzable(id)) return { ok: false, reason: 'unknown_exercise', ...base };
  const F = frames.filter(f => f.p).map(f => ({ t: f.t, p: f.p, b: bodyOf(f.p) }));
  if (F.length < 10 || quality.tracked < 0.4) return { ok: false, reason: 'not_tracked', ...base };
  const res = ANALYZERS[id](F, F.map(f => f.t));
  const vis = visibilityOf(frames, [LM.lHip, LM.rHip, LM.lKnee, LM.rKnee, LM.lAnkle, LM.rAnkle, LM.lShoulder, LM.rShoulder]);
  const found = res.reps > 0 || (res.holdSeconds || 0) > 1 || res.checks.length > 0;
  return {
    ok: found, ...(found ? {} : { reason: 'no_movement' }), ...base,
    reps: res.reps, holdSeconds: res.holdSeconds ?? null, rate: res.rate ?? null,
    checks: res.checks, sides: res.sides ?? null, asymmetry: res.asymmetry ?? null, weaker: res.weaker ?? null,
    perRep: (res.perRep || []).map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === 'number' ? round(v, 3) : v]))),
    confidence: round(clamp(Math.min(1, quality.tracked / 0.8) * vis, 0, 1), 2),
  };
}
