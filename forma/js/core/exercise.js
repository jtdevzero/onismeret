/* Otthoni gyakorlatok és felmérő tesztek elemzése: ismétlésszámlálás, kitartott idő és formaértékelés.
   A Kanyar exercise.js-éből, kiegészítve a fekvőtámasszal és a székről felállással (Forma).
   Otthon a kamera áll, ezért a képen mért helyzet is használható.
   A határértékek szakmai becslések, szakember még nem kalibrálta őket.

   Eredmény: { ok, exercise, quality, reps, holdSeconds, checks: [{ id, band: 'ok'|'fix', value, unit }],
               sides: { left, right } | null, asymmetry: % | null, perRep: [...] } */
import { LM, clamp, mean, std, median, percentile, round, angleAt, tilt, movingAverage } from './geometry.js';
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
/* Egy ismétlés ideje: a szomszédos mélypontok közti idő (az utolsónál az előző ciklusé). Egy ismétlésnél a mért szakasz. */
function repSeconds(F, reps) {
  return reps.map((r, i) => {
    if (reps.length < 2) return F[r.i1].t - F[r.i0].t;
    const a = i + 1 < reps.length ? i : i - 1;
    return F[reps[a + 1].bottom].t - F[reps[a].bottom].t;
  });
}
const isFrontal = b => b.shoulderW / (b.torsoLen || 1) > 0.45;

/* ---- gyakorlatonkénti elemzők: (F, t) → részeredmény ---- */

function squat(F) {
  const reps = detectReps(F.map(f => f.b.knee), 30);
  const secs = repSeconds(F, reps);
  const perRep = reps.map((r, i) => {
    const f = F[r.bottom], frontal = isFrontal(f.b);
    return {
      view: frontal ? 'frontal' : 'side', depth: f.b.knee, seconds: secs[i],
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
    checks.push(check('tempo', sec >= 2, sec, 's'));
  }
  return { reps: reps.length, perRep, checks };
}

/* Fekvőtámasz oldalról: a könyökszög adja az ismétlést (a kisebbik kar a mélyebb), a váll–csípő–boka vonal a testtartást.
   A teljes, a térdelő, a ferde és a falnál végzett változat is így mérhető. */
const elbowOf = f => Math.min(angleAt(f.p[LM.lShoulder], f.p[LM.lElbow], f.p[LM.lWrist]), angleAt(f.p[LM.rShoulder], f.p[LM.rElbow], f.p[LM.rWrist]));
function pushup(F) {
  const reps = detectReps(F.map(elbowOf), 35);
  const secs = repSeconds(F, reps);
  const perRep = reps.map((r, i) => ({ depth: elbowOf(F[r.bottom]), line: angleAt(F[r.bottom].b.S, F[r.bottom].b.H, F[r.bottom].b.A), top: elbowOf(F[r.i1]), seconds: secs[i] }));
  const checks = [];
  if (perRep.length) {
    const d = mean(perRep.map(r => r.depth)), l = mean(perRep.map(r => r.line)), top = mean(perRep.map(r => r.top)), sec = mean(perRep.map(r => r.seconds));
    checks.push(check('depth', d <= 100, d), check('straight_line', l >= 160, l), check('lockout', top >= 150, top), check('tempo', sec >= 1.5, sec, 's'));
  }
  return { reps: reps.length, perRep, checks };
}

/* Felállás székről: a térd- és csípőszög együtt nyílik ki; teljes felállásnak a majdnem nyújtott térd számít. */
function chairStand(F) {
  const reps = detectReps(F.map(f => -f.b.knee), 40);
  const perRep = reps.map(r => ({ stand: F[r.bottom].b.knee, hip: F[r.bottom].b.hipAngle }));
  const checks = [];
  if (perRep.length) {
    const st = mean(perRep.map(r => r.stand)), hp = mean(perRep.map(r => r.hip));
    checks.push(check('full_stand', st >= 160, st), check('hips_open', hp >= 160, hp));
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
  const secs = repSeconds(F, reps);
  const perRep = reps.map((r, i) => ({ depth: Math.min(F[r.bottom].b.kneeL, F[r.bottom].b.kneeR), torso: Math.abs(F[r.bottom].b.torsoTilt), seconds: secs[i] }));
  const checks = [];
  if (perRep.length) {
    const d = mean(perRep.map(r => r.depth)), tr = mean(perRep.map(r => r.torso)), sec = mean(perRep.map(r => r.seconds));
    checks.push(check('depth', d <= 105, d), check('chest_up', tr <= 30, tr), check('tempo', sec >= 2, sec, 's'));
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
  const secs = repSeconds(F, reps);
  const perRep = reps.map((r, i) => ({ top: F[r.bottom].b.hipAngle, seconds: secs[i] }));
  const checks = [];
  if (perRep.length) {
    const top = mean(perRep.map(r => r.top)), sec = mean(perRep.map(r => r.seconds));
    checks.push(check('hips_high', top >= 160, top), check('tempo', sec >= 2, sec, 's'));
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
  const res = { reps: 0, perRep: [], holdSeconds: all.length ? round(Math.min(...all.map(v => v.seconds))) : 0, checks, sides: null, asymmetry: null, weaker: null,
    holdSides: { left: L ? round(L.seconds) : null, right: R ? round(R.seconds) : null } };
  if (L && R) {
    res.sides = { left: round(L.sway, 3), right: round(R.sway, 3) };
    res.asymmetry = asymPct(L.sway, R.sway);
    res.weaker = L.sway > R.sway ? 'left' : 'right';
  }
  return res;
}

/* Térd a falhoz (bokateszt), oldalról: az elöl lévő láb sípcsontjának dőlése. Megegyezés: előbb a bal, aztán a jobb láb. */
function ankleWall(F) {
  const shin = F.map(f => Math.max(Math.abs(tilt(f.p[LM.lAnkle], f.p[LM.lKnee])), Math.abs(tilt(f.p[LM.rAnkle], f.p[LM.rKnee]))));
  const reps = detectReps(shin.map(v => -v), 8);
  const perRep = reps.map((r, n) => ({ side: n < reps.length / 2 ? 'left' : 'right', shin: shin[r.bottom] }));
  const checks = perRep.length ? [check('ankle_range', mean(perRep.map(r => r.shin)) >= 35, mean(perRep.map(r => r.shin)))] : [];
  return { reps: reps.length, perRep, checks, ...(reps.length >= 2 ? sides(perRep, 'shin', false) : { sides: null, asymmetry: null, weaker: null }) };
}

/* Felugrás magassága a repülési időből: h = g · t² / 8. Mindkét boka a talajszint fölött → levegőben.
   A talajszint az álló helyzet bokamagassága (a felvétel első harmadának mediánja). 15 kép/mp mellett a mérés
   a valódi felvételeken mért pontosság még nem validált; a legjobb ugrás számít. */
function verticalJump(F, t0, raw) {
  /* a repülési időhöz a nyers (simítatlan) testpontok kellenek: a simítás elkenné a felszállás pillanatát */
  const R = (raw || []).filter(f => f && f.lm && f.lm.length >= 33 && Math.min(f.lm[LM.lAnkle][3] ?? 1, f.lm[LM.rAnkle][3] ?? 1) >= 0.5).sort((a, b) => a.t - b.t);
  const useRaw = R.length >= 10;
  const t = useRaw ? R.map(f => f.t) : t0;
  const ank = useRaw ? R.map(f => Math.max(f.lm[LM.lAnkle][1], f.lm[LM.rAnkle][1])) : F.map(f => Math.max(f.p[LM.lAnkle].y, f.p[LM.rAnkle].y));
  const base = median(ank.slice(0, Math.max(5, Math.floor(ank.length / 3))));
  const thr = 0.025 * (median(F.map(f => f.b.bodyLen)) || 1);
  const air = ank.map(y => y < base - thr);
  const jumps = [];
  let s = -1;
  for (let i = 0; i < air.length; i++) {
    if (air[i] && s < 0) s = i;
    if ((!air[i] || i === air.length - 1) && s >= 0) {
      const e = air[i] ? i : i - 1;
      /* a felszállás és a földet érés a két szomszédos kép közé esik: fél-fél képközt hozzáadunk */
      const dtPrev = s > 0 ? (t[s] - t[s - 1]) / 2 : 0, dtNext = e + 1 < t.length ? (t[e + 1] - t[e]) / 2 : 0;
      const flight = t[e] - t[s] + dtPrev + dtNext;
      if (flight >= 0.12 && flight <= 1.2) jumps.push({ flight, cm: round(981 * flight * flight / 8) });
      s = -1;
    }
  }
  const best = jumps.reduce((a, b) => (b.cm > (a ? a.cm : -1) ? b : a), null);
  const checks = best ? [check('soft_landing', percentile(F.map(f => Math.min(f.b.kneeL, f.b.kneeR)), 0.1) <= 150, percentile(F.map(f => Math.min(f.b.kneeL, f.b.kneeR)), 0.1))] : [];
  return { reps: jumps.length, perRep: jumps, checks, jumpCm: best ? best.cm : null };
}

/* A Forma gyakorlatai és tesztjei → elemző. Ami nincs itt, azt csak kézzel lehet számolni. */
export const ANALYZERS = {
  pushup, push_wall: pushup, push_incline: pushup, push_knee: pushup, push_full: pushup, push_decline: pushup,
  chair_stand: chairStand, squat_box: squat, squat, split_squat: lunge, bulgarian: lunge, pistol_box: singleLegSquat,
  reverse_lunge: lunge, lateral_lunge: lateralLunge, tempo_lunge: lunge,
  glute_bridge: gluteBridge, sl_bridge: gluteBridge,
  plank, side_plank: plank, sl_stance: singleLegStand, sl_stand: singleLegStand, sl_stand_closed: singleLegStand,
  ankle_rock: ankleWall, skater: lateralHops, vertical_jump: verticalJump, squat_jump: verticalJump,
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
  const res = ANALYZERS[id](F, F.map(f => f.t), raw);
  const vis = visibilityOf(frames, [LM.lHip, LM.rHip, LM.lKnee, LM.rKnee, LM.lAnkle, LM.rAnkle, LM.lShoulder, LM.rShoulder]);
  const found = res.reps > 0 || (res.holdSeconds || 0) > 1 || res.checks.length > 0;
  return {
    ok: found, ...(found ? {} : { reason: 'no_movement' }), ...base,
    reps: res.reps, holdSeconds: res.holdSeconds ?? null, rate: res.rate ?? null,
    checks: res.checks, sides: res.sides ?? null, holdSides: res.holdSides ?? null, jumpCm: res.jumpCm ?? null, asymmetry: res.asymmetry ?? null, weaker: res.weaker ?? null,
    perRep: (res.perRep || []).map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === 'number' ? round(v, 3) : v]))),
    confidence: round(clamp(Math.min(1, quality.tracked / 0.8) * vis, 0, 1), 2),
  };
}
