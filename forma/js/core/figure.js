/* Pálcikafigura a gyakorlatok ábráihoz: szögekből számolt ízületi pontok. Tiszta függvény, DOM nélkül.
   Szögek fokban: 0 = lefelé, 90 = előre (a kép jobb oldala felé), 180 = felfelé, −90 = hátra.
   pose: { t: törzs, h: fej (alapból a törzs irányában), aN/aF: közeli/távoli kar [felkar, alkar],
           lN/lF: közeli/távoli láb [comb, lábszár, lábfej], lift: elemelkedés a talajtól (ugrás) } */

export const LEN = { torso: 50, shoulder: 7, neck: 13, head: 9, upper: 27, fore: 25, thigh: 42, shin: 40, foot: 12 };
const R = Math.PI / 180;
const step = (p, a, len) => ({ x: p.x + Math.sin(a * R) * len, y: p.y + Math.cos(a * R) * len });

export function figurePoints(pose) {
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
