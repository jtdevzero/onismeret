/* Testtartás egy álló helyzetről (a kamera képkockáiból átlagolva): szemből a váll- és a csípődőlés,
   oldalról a fej előretolódása. Tájékoztató mérés, nem diagnózis; a küszöbök szakmai becslések. */
import { LM, mean, round } from './geometry.js';
import { prepare } from './series.js';

const DEG = 180 / Math.PI;
const EAR = { l: 7, r: 8 };

/* frames: [{ t, lm }] · view: 'front' | 'side' → { ok, metrics: { id: { value, unit, band } }, reason? } */
export function analyzePosture(raw, view, aspect = 1) {
  const { frames } = prepare(raw, aspect);
  const F = frames.filter(f => f.p);
  if (F.length < 5) return { ok: false, reason: 'not_tracked' };
  const avg = fn => mean(F.map(f => fn(f.p)));
  const tiltDeg = (a, b) => Math.atan2(b.y - a.y, Math.abs(b.x - a.x) || 1e-6) * DEG; /* + : a második pont lejjebb */
  const metrics = {};
  if (view === 'front') {
    const sh = avg(p => tiltDeg(p[LM.lShoulder], p[LM.rShoulder])), hip = avg(p => tiltDeg(p[LM.lHip], p[LM.rHip]));
    metrics.shoulder_tilt = { value: round(Math.abs(sh)), unit: '°', band: Math.abs(sh) <= 3 ? 'ok' : 'fix', side: sh > 0 ? 'right' : 'left' };
    metrics.hip_tilt = { value: round(Math.abs(hip)), unit: '°', band: Math.abs(hip) <= 3 ? 'ok' : 'fix', side: hip > 0 ? 'right' : 'left' };
  } else {
    /* a fül (vagy ha nem látszik, az orr) vízszintes távolsága a váll előtt, a törzshossz arányában */
    const fwd = avg(p => {
      const S = { x: (p[LM.lShoulder].x + p[LM.rShoulder].x) / 2, y: (p[LM.lShoulder].y + p[LM.rShoulder].y) / 2 };
      const H = { x: (p[LM.lHip].x + p[LM.rHip].x) / 2, y: (p[LM.lHip].y + p[LM.rHip].y) / 2 };
      const ear = p[EAR.l].v >= 0.5 || p[EAR.r].v >= 0.5 ? (p[EAR.l].v >= p[EAR.r].v ? p[EAR.l] : p[EAR.r]) : p[LM.nose];
      const torso = Math.hypot(S.x - H.x, S.y - H.y) || 1;
      /* előre: abba az irányba, amerre az orr néz a fülhöz képest */
      const facing = Math.sign(p[LM.nose].x - ear.x) || 1;
      return (facing * (ear.x - S.x)) / torso;
    });
    metrics.head_forward = { value: round(fwd * 100), unit: '%', band: fwd <= 0.15 ? 'ok' : 'fix' };
  }
  return { ok: true, view, metrics };
}

export const POSTURE_NAMES = { shoulder_tilt: 'Vállak egy magasságban', hip_tilt: 'Csípő egy magasságban', head_forward: 'Fej a váll fölött' };
/* javasolt gyakorlatok és mobilitási célterületek az eltérésekhez */
export const POSTURE_FIX = {
  shoulder_tilt: { text: 'Egyoldali erősítés és nyújtás: oldalplank mindkét oldalra, egykezes evezés.', exercises: ['side_plank', 'db_row', 'band_row_single'], target: 'shoulder' },
  hip_tilt: { text: 'Egylábas gyakorlatok és csípőnyújtás: egylábas csípőemelés, csípőhajlító-nyújtás.', exercises: ['sl_bridge', 'couch_stretch', 'side_plank'], target: 'hipflexor' },
  head_forward: { text: 'Háti mobilitás és lapockaerő: nyitott könyv, karcsúsztatás a falon, Y–T–W emelés.', exercises: ['open_book', 'wall_slide', 'prone_ytw'], target: 'thoracic' },
};
