/* A pózbecslő nyers kimenetéből tisztított idősor: szűrés, rövid hézagok pótlása, simítás, felvételminőség.
   Bemenet: frames = [{ t: másodperc, lm: [[x, y, z, láthatóság] × 33] | null }], aspect = szélesség / magasság.
   A koordináták a képmagasság egységében értendők (x-et a képaránnyal szorozzuk), így a szögek nem torzulnak. */
import { LM, KEY_POINTS, mid, dist, tilt, angleAt, median, mean } from './geometry.js';

export const MIN_VISIBILITY = 0.5;
const MAX_GAP = 0.4;      /* ennél rövidebb kiesést interpolálunk (mp) */
const SMOOTH_HALF = 0.1;  /* simítás fél ablaka (mp) */

function toPoints(lm, aspect) {
  return lm.map(p => ({ x: p[0] * aspect, y: p[1], z: (p[2] || 0) * aspect, v: p[3] == null ? 1 : p[3] }));
}
const keyVisibility = p => mean(KEY_POINTS.map(i => p[i].v));

function lerpPoints(a, b, f) {
  return a.map((p, i) => ({
    x: p.x + (b[i].x - p.x) * f, y: p.y + (b[i].y - p.y) * f, z: p.z + (b[i].z - p.z) * f, v: Math.min(p.v, b[i].v),
  }));
}

/* → { frames: [{ t, p: pontok | null, measured: bool }], quality } */
export function prepare(raw, aspect = 16 / 9) {
  const src = (raw || []).filter(f => f && Number.isFinite(f.t)).sort((a, b) => a.t - b.t);
  const frames = src.map(f => {
    const p = f.lm && f.lm.length >= 33 ? toPoints(f.lm, aspect) : null;
    const ok = !!p && keyVisibility(p) >= MIN_VISIBILITY;
    return { t: f.t, p: ok ? p : null, measured: ok };
  });
  const total = frames.length, measured = frames.filter(f => f.measured).length;

  /* rövid hézagok lineáris pótlása */
  let last = -1;
  for (let i = 0; i < total; i++) {
    if (!frames[i].p) continue;
    if (last >= 0 && i - last > 1 && frames[i].t - frames[last].t <= MAX_GAP) {
      for (let j = last + 1; j < i; j++) {
        const f = (frames[j].t - frames[last].t) / (frames[i].t - frames[last].t);
        frames[j].p = lerpPoints(frames[last].p, frames[i].p, f);
      }
    }
    last = i;
  }

  /* időablakos simítás (utólagos elemzés, ezért késleltetés nélküli, középre igazított ablak) */
  const smoothed = frames.map((f, i) => {
    if (!f.p) return f;
    const acc = f.p.map(() => ({ x: 0, y: 0, z: 0 }));
    let n = 0;
    for (let j = i; j >= 0 && f.t - frames[j].t <= SMOOTH_HALF; j--) if (frames[j].p) { add(acc, frames[j].p); n++; }
    for (let j = i + 1; j < total && frames[j].t - f.t <= SMOOTH_HALF; j++) if (frames[j].p) { add(acc, frames[j].p); n++; }
    return { t: f.t, measured: f.measured, p: f.p.map((q, k) => ({ x: acc[k].x / n, y: acc[k].y / n, z: acc[k].z / n, v: q.v })) };
  });

  const valid = smoothed.filter(f => f.p);
  const duration = total > 1 ? frames[total - 1].t - frames[0].t : 0;
  const body = valid.map(f => bodyOf(f.p));
  const quality = {
    frames: total,
    duration,
    fps: duration > 0 ? (total - 1) / duration : 0,
    tracked: total ? measured / total : 0,
    /* a csúszó magassága a képmagasság arányában: túl kicsi alaknál a testpontok pontatlanok */
    bodyHeight: body.length ? median(body.map(b => b.height)) : 0,
    viewGuess: body.length ? (median(body.map(b => b.shoulderW / (b.torsoLen || 1))) > 0.45 ? 'frontal' : 'side') : null,
  };
  return { frames: smoothed, quality };
}
function add(acc, p) { for (let k = 0; k < p.length; k++) { acc[k].x += p[k].x; acc[k].y += p[k].y; acc[k].z += p[k].z; } }

/* Egy képkocka származtatott testméretei és szögei. */
export function bodyOf(p) {
  const S = mid(p[LM.lShoulder], p[LM.rShoulder]), H = mid(p[LM.lHip], p[LM.rHip]);
  const K = mid(p[LM.lKnee], p[LM.rKnee]), A = mid(p[LM.lAnkle], p[LM.rAnkle]);
  const torsoLen = dist(S, H);
  const legLen = (dist(p[LM.lHip], p[LM.lKnee]) + dist(p[LM.lKnee], p[LM.lAnkle]) + dist(p[LM.rHip], p[LM.rKnee]) + dist(p[LM.rKnee], p[LM.rAnkle])) / 2;
  const kneeL = angleAt(p[LM.lHip], p[LM.lKnee], p[LM.lAnkle]), kneeR = angleAt(p[LM.rHip], p[LM.rKnee], p[LM.rAnkle]);
  return {
    S, H, K, A, torsoLen, legLen, bodyLen: torsoLen + legLen,
    height: dist(p[LM.nose], A),
    shoulderW: Math.abs(p[LM.lShoulder].x - p[LM.rShoulder].x),
    hipW: Math.abs(p[LM.lHip].x - p[LM.rHip].x),
    ankleDist: Math.abs(p[LM.lAnkle].x - p[LM.rAnkle].x),
    kneeDist: Math.abs(p[LM.lKnee].x - p[LM.rKnee].x),
    legTilt: tilt(A, H), torsoTilt: tilt(H, S),
    kneeL, kneeR, knee: (kneeL + kneeR) / 2,
    hipAngle: angleAt(S, H, K),
  };
}

/* Láthatóság egy pontcsoportra, a képkockák átlagában (a megbízhatósághoz). */
export function visibilityOf(frames, idx) {
  const v = frames.filter(f => f.p).map(f => mean(idx.map(i => f.p[i].v)));
  return v.length ? mean(v) : 0;
}
