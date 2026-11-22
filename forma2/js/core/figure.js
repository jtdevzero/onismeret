/* Pálcikafigura a gyakorlatok ábráihoz: szögekből számolt ízületi pontok. Tiszta függvény, DOM nélkül.
   Szögek fokban: 0 = lefelé, 90 = előre (a kép jobb oldala felé), 180 = felfelé, −90 = hátra.
   pose: { t: törzs, h: fej (alapból a törzs irányában), aN/aF: közeli/távoli kar [felkar, alkar],
           lN/lF: közeli/távoli láb [comb, lábszár, lábfej], lift: elemelkedés a talajtól (ugrás) } */

export const LEN = { torso: 50, shoulder: 7, neck: 13, head: 9, upper: 27, fore: 25, thigh: 42, shin: 40, foot: 12 };
const R = Math.PI / 180;
const step = (p, a, len) => ({ x: p.x + Math.sin(a * R) * len, y: p.y + Math.cos(a * R) * len });

export function figurePoints(pose) {
  /* Egyedi vetület a bútoros, függeszkedő és szemből mutatott gyakorlatokhoz.
     A koordináták kézzel szerkesztett szemléltető ábrák, nem pózbecslő-adatok. */
  if (pose.points) {
    const point = ([x, y]) => ({ x, y });
    const p = pose.points;
    const out = { pelvis: point(p.pelvis), neck: point(p.neck), head: point(p.head),
      armN: p.armN.map(point), armF: p.armF.map(point), legN: p.legN.map(point), legF: p.legF.map(point) };
    const all = [out.pelvis, out.neck, ...out.armN, ...out.armF, ...out.legN, ...out.legF];
    out.ground = pose.ground ?? Math.max(...all.map(p => p.y));
    out.box = { x0: Math.min(...all.map(p => p.x), out.head.x - LEN.head), x1: Math.max(...all.map(p => p.x), out.head.x + LEN.head),
      y0: Math.min(...all.map(p => p.y), out.head.y - LEN.head), y1: Math.max(out.ground, out.head.y + LEN.head, ...all.map(p => p.y)) };
    return out;
  }
  const pelvis = { x: 0, y: 0 };
  const neck = step(pelvis, pose.t, LEN.torso);
  const head = step(neck, pose.h ?? pose.t, LEN.neck);
  const shoulder = step(pelvis, pose.t, LEN.torso - LEN.shoulder);
  const limb = (from, angles, lens) => {
    const pts = [from];
    angles.forEach((a, i) => pts.push(step(pts[pts.length - 1], a, lens[i])));
    return pts;
  };
  const arm = a => limb(shoulder, a || [5, 5], [LEN.upper, LEN.fore]);
  const leg = l => limb(pelvis, l || [0, 0, 90], [LEN.thigh, LEN.shin, LEN.foot]);
  const pts = { pelvis, neck, shoulder, head, armN: arm(pose.aN), armF: arm(pose.aF), legN: leg(pose.lN), legF: leg(pose.lF) };
  /* a talaj a legalsó pont alatt (a fejnél a koponya alja számít); ugrásnál lejjebb */
  const all = [pelvis, neck, ...pts.armN, ...pts.armF, ...pts.legN, ...pts.legF, { x: head.x, y: head.y + LEN.head }];
  const ground = Math.max(...all.map(p => p.y)) + (pose.lift || 0);
  const xs = all.map(p => p.x).concat([head.x - LEN.head, head.x + LEN.head]);
  const ys = all.map(p => p.y).concat([head.y - LEN.head]);
  return { ...pts, ground, box: { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: ground } };
}

/* Két póz közötti átmenet (animációhoz): a szögek lineárisan, a rövidebb úton. f: 0…1 */
const lerpA = (a, b, f) => { let d = ((b - a + 540) % 360) - 180; return a + d * f; };
export function lerpPose(a, b, f) {
  const out = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[k], y = b[k];
    if (k === 'points' && x && y) {
      const mix = (p, q) => p.map((v, i) => v + (q[i] - v) * f);
      out[k] = Object.fromEntries(Object.keys(x).map(key => [key, Array.isArray(x[key][0]) ? x[key].map((p, i) => mix(p, y[key][i])) : mix(x[key], y[key])]));
    } else if (Array.isArray(x) && Array.isArray(y)) out[k] = x.map((v, i) => lerpA(v, y[i] ?? v, f));
    else if (typeof x === 'number' && typeof y === 'number') out[k] = k === 'lift' || k === 'ground' ? x + (y - x) * f : lerpA(x, y, f);
    else out[k] = x ?? y;
  }
  return out;
}
