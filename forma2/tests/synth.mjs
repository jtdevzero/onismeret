/* Szintetikus testpont-idősorok a tesztekhez: ismert szögű, mesterségesen előállított testtartás.
   A képarány 1, így a normalizált koordináták közvetlenül összevethetők. */
const R = Math.PI / 180;
const rot = (x, y, deg) => { const a = deg * R; return [x * Math.cos(a) + y * Math.sin(a), -x * Math.sin(a) + y * Math.cos(a)]; };

/* Egy képkocka 33 testpontja. o: {
     view: 'frontal'|'side', cx, footY, scale, vis,
     frontal: legTilt (a láb dőlése), torsoTilt, flex (térdhajlás), stance, kneeW, shoulderW, handY (0 csípő, 1 váll), lift: 'left'|'right'|null
     side:    shin, thigh (a függőlegeshez képest), torso (előredőlés), facing (+1/−1) } */
export function pose(o = {}) {
  const s = o.scale ?? 1, cx = o.cx ?? 0.5, fy = o.footY ?? 0.9, vis = o.vis ?? 0.95;
  const L = 0.2 * s, T = 0.25 * s;
  const lm = Array.from({ length: 33 }, () => [cx, fy, 0, vis]);
  const set = (i, x, y, z = 0) => { lm[i] = [x, y, z, vis]; };
  if ((o.view ?? 'frontal') === 'side') {
    const f = o.facing ?? 1, shin = o.shin ?? 20, thigh = o.thigh ?? 25, torso = o.torso ?? 20;
    const kx = cx + f * L * Math.sin(shin * R), ky = fy - L * Math.cos(shin * R);
    const hx = kx - f * L * Math.sin(thigh * R), hy = ky - L * Math.cos(thigh * R);
    const sx = hx + f * T * Math.sin(torso * R), sy = hy - T * Math.cos(torso * R);
    for (const [d, off] of [[0, -0.004], [1, 0.004]]) {
      set(27 + d, cx + off, fy); set(29 + d, cx - f * 0.02 * s + off, fy + 0.01); set(31 + d, cx + f * 0.06 * s + off, fy + 0.01);
      set(25 + d, kx + off, ky); set(23 + d, hx + off, hy); set(11 + d, sx + off, sy);
      set(13 + d, sx + f * 0.05 * s + off, sy + 0.12 * s); set(15 + d, sx + f * 0.12 * s + off, sy + 0.2 * s);
    }
    set(0, sx + f * 0.03 * s, sy - 0.08 * s);
    return lm;
  }
  const legTilt = o.legTilt ?? 0, torsoTilt = o.torsoTilt ?? legTilt, flex = o.flex ?? 30;
  const stance = (o.stance ?? 0.16) * s, kneeW = (o.kneeW ?? o.stance ?? 0.16) * s, hipW = 0.1 * s, shW = (o.shoulderW ?? 0.18) * s;
  const thighH = L * Math.cos(Math.min(flex, 89) * R);
  /* a láb pontjai a bokaközéphez képest, majd elforgatva a láb dőlésével */
  const P = (x, y) => { const [rx, ry] = rot(x, y, legTilt); return [cx + rx, fy + ry]; };
  const lift = side => (o.lift === side ? -0.12 * s : 0);
  for (const [d, sg, name] of [[0, 1, 'left'], [1, -1, 'right']]) {
    const [ax, ay] = P(sg * stance / 2, lift(name));
    set(27 + d, ax, ay); set(29 + d, ax, ay + 0.01); set(31 + d, ax, ay + 0.02);
    set(25 + d, ...P(sg * kneeW / 2, -L + lift(name) / 2));
    set(23 + d, ...P(sg * hipW / 2, -L - thighH));
  }
  const [hx, hy] = P(0, -L - thighH);
  const [tx, ty] = rot(0, -T, torsoTilt);
  const sx = hx + tx, sy = hy + ty, zr = o.shoulderZ ?? 0;
  set(11, sx + shW / 2, sy, -zr); set(12, sx - shW / 2, sy, zr);
  const handY = o.handY ?? 0.3, wy = hy + (sy - hy) * handY;
  set(13, sx + shW / 2 + 0.03, (sy + wy) / 2); set(14, sx - shW / 2 - 0.03, (sy + wy) / 2);
  set(15, sx + shW / 2 + 0.05 + (o.armSwing ?? 0), wy); set(16, sx - shW / 2 - 0.05 + (o.armSwing ?? 0), wy);
  set(0, sx, sy - 0.08 * s);
  return lm;
}

/* Ismételhető zaj (mulberry32), hogy a tesztek determinisztikusak legyenek. */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/* Idősor: fn(t) → pose() paraméterei. noise: a koordináták egyenletes zaja. */
export function series(seconds, fn, { fps = 15, noise = 0.002, seed = 7 } = {}) {
  const r = rng(seed), out = [];
  for (let i = 0; i <= seconds * fps; i++) {
    const t = i / fps, o = fn(t);
    out.push({ t, lm: o === null ? null : pose(o).map(p => [p[0] + (r() - 0.5) * 2 * noise, p[1] + (r() - 0.5) * 2 * noise, p[2], p[3]]) });
  }
  return out;
}
export const wave = (t, period) => Math.sin(2 * Math.PI * t / period);
