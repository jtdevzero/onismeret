// Procedurális izometrikus grafika: terem, berendezés, szereplők, buborékok.
// Minden rajz a mező közepéhez (berendezés) vagy a talppontjához (szereplő) képest történik.

import type { Graphics } from 'pixi.js';

export const TW = 64;
export const TH = 32;
export const WALL_H = 78;

export function iso(x: number, y: number): { x: number; y: number } {
  return { x: ((x - y) * TW) / 2, y: ((x + y) * TH) / 2 };
}

// --- Színek ---------------------------------------------------------------------

export function shade(color: number, f: number): number {
  const r = Math.min(255, Math.max(0, Math.round(((color >> 16) & 0xff) * f)));
  const g = Math.min(255, Math.max(0, Math.round(((color >> 8) & 0xff) * f)));
  const b = Math.min(255, Math.max(0, Math.round((color & 0xff) * f)));
  return (r << 16) | (g << 8) | b;
}

export function mix(a: number, b: number, t: number): number {
  const ch = (c: number, s: number) => (c >> s) & 0xff;
  const m = (s: number) => Math.round(ch(a, s) + (ch(b, s) - ch(a, s)) * t);
  return (m(16) << 16) | (m(8) << 8) | m(0);
}

export function hash(n: number): number {
  let x = (n | 0) ^ 0x9e3779b9;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

export const P = {
  plank: 0x8b5a34,
  plankAlt: [0x925f37, 0x86552f, 0x9a6740, 0x80502c],
  plankLine: 0x5e3a1f,
  wainscot: 0x0b4d3b,
  wainscotPanel: 0x0f5e48,
  rail: 0xc9a43a,
  plaster: 0xe7ebf0,
  plasterShade: 0xd5dce4,
  wallCap: 0x5b3a24,
  frame: 0x3b2516,
  walnut: 0x5a3820,
  walnutDark: 0x3f2615,
  cloth: 0xf8fafc,
  clothShade: 0xdfe5ec,
  napkin: 0x8a1c3c,
  cushion: 0x8a1c3c,
  steel: 0x9aa5b4,
  steelDark: 0x5b6676,
  steelDeep: 0x3a4351,
  burner: 0x1f2937,
  marble: 0xf1f3f6,
  marbleVein: 0xcfd6df,
  gold: 0xd4af37,
  flame: 0xf59e0b,
  plate: 0xffffff,
  shadow: 0x0f172a,
  night: 0x1b2a4e,
};

// --- Padló és falak ---------------------------------------------------------------

/** Parkettamező: deszkák az x tengely mentén, eltolt illesztésekkel. */
export function drawFloorTile(g: Graphics, x: number, y: number): void {
  const c = iso(x, y);
  const pt = (u: number, v: number) => [c.x + (u - v) * (TW / 2), c.y + (u + v) * (TH / 2)];
  const planks = 4;
  for (let i = 0; i < planks; i++) {
    const v0 = -0.5 + i / planks;
    const v1 = v0 + 1 / planks;
    const color = P.plankAlt[Math.floor(hash(x * 131 + y * 17 + i * 7) * P.plankAlt.length)] ?? P.plank;
    g.poly([...pt(-0.5, v0), ...pt(0.5, v0), ...pt(0.5, v1), ...pt(-0.5, v1)]).fill(color);
    const joint = -0.5 + ((hash(x * 31 + y * 97 + i * 13) * 0.8 + 0.1) % 1);
    g.moveTo(pt(joint, v0)[0]!, pt(joint, v0)[1]!).lineTo(pt(joint, v1)[0]!, pt(joint, v1)[1]!).stroke({ width: 0.8, color: P.plankLine, alpha: 0.45 });
    g.moveTo(pt(-0.5, v1)[0]!, pt(-0.5, v1)[1]!).lineTo(pt(0.5, v1)[0]!, pt(0.5, v1)[1]!).stroke({ width: 0.8, color: P.plankLine, alpha: 0.35 });
  }
  // Fényes kopás a mező közepén.
  g.ellipse(c.x, c.y, 18, 8).fill({ color: 0xffffff, alpha: 0.035 });
}

type WallSide = 'right' | 'left';

/** Pont egy hátsó falon: t = pozíció a fal mentén (mezőegységben), h = magasság pixelben. */
function wallPt(side: WallSide, t: number, h: number): [number, number] {
  const p = side === 'right' ? iso(t, -0.5) : iso(-0.5, t);
  return [p.x, p.y - h];
}

function wallQuad(g: Graphics, side: WallSide, t0: number, t1: number, h0: number, h1: number, color: number, alpha = 1): void {
  g.poly([...wallPt(side, t0, h0), ...wallPt(side, t1, h0), ...wallPt(side, t1, h1), ...wallPt(side, t0, h1)]).fill({ color, alpha });
}

export interface WallLayout {
  width: number;
  height: number;
  doorY: number;
}

/** Statikus falak: lambéria, arany léc, vakolat, falkorona, ajtó, képek. */
export function drawWalls(g: Graphics, w: WallLayout): void {
  const sides: [WallSide, number, number][] = [
    ['right', -0.5, w.width - 0.5],
    ['left', -0.5, w.height - 0.5],
  ];
  for (const [side, a, b] of sides) {
    const light = side === 'right' ? 1 : 0.9;
    wallQuad(g, side, a, b, 0, WALL_H, shade(P.plaster, light));
    wallQuad(g, side, a, b, 0, 30, shade(P.wainscot, light));
    // Lambériatáblák.
    for (let t = a + 0.12; t < b - 0.2; t += 1) {
      wallQuad(g, side, t, Math.min(b - 0.12, t + 0.76), 5, 25, shade(P.wainscotPanel, light));
    }
    wallQuad(g, side, a, b, 29, 32, P.rail);
    wallQuad(g, side, a, b, WALL_H - 4, WALL_H, shade(P.wallCap, light));
    // Halvány árnyék a padló mentén.
    wallQuad(g, side, a, b, 0, 3, P.shadow, 0.18);
  }

  // Ajtó a bal falon.
  const d0 = w.doorY - 0.42;
  const d1 = w.doorY + 0.42;
  wallQuad(g, 'left', d0 - 0.08, d1 + 0.08, 0, 62, P.frame);
  wallQuad(g, 'left', d0, d1, 0, 58, 0x1f3b2f);
  wallQuad(g, 'left', d0 + 0.08, d1 - 0.08, 24, 54, 0xbfd7ea, 0.85);
  wallQuad(g, 'left', d0 - 0.12, d1 + 0.12, 62, 66, P.rail);

  // Képek a bal falon az ajtótól távol.
  for (const ty of [2, w.height - 3]) {
    if (Math.abs(ty - w.doorY) < 2) continue;
    wallQuad(g, 'left', ty - 0.55, ty + 0.55, 38, 66, P.rail);
    wallQuad(g, 'left', ty - 0.47, ty + 0.47, 40, 64, 0x14324f);
    wallQuad(g, 'left', ty - 0.47, ty + 0.47, 40, 50, 0x2f6b4f);
    wallQuad(g, 'left', ty - 0.05, ty + 0.3, 50, 58, 0xd4af37, 0.85);
  }
}

/** Ablakok a jobb falon, az ég színe a napszaktól függ. */
export function drawWindows(g: Graphics, width: number, hour: number): void {
  const sky = skyColor(hour);
  const glow = hour >= 18.5 ? 0.35 : 0;
  for (let t = 2; t < width - 1; t += 4) {
    wallQuad(g, 'right', t - 0.62, t + 0.62, 34, 72, P.frame);
    wallQuad(g, 'right', t - 0.54, t + 0.54, 37, 69, sky.top);
    wallQuad(g, 'right', t - 0.54, t + 0.54, 37, 48, sky.bottom);
    wallQuad(g, 'right', t - 0.03, t + 0.03, 37, 69, P.frame);
    wallQuad(g, 'right', t - 0.54, t + 0.54, 52, 54, P.frame);
    wallQuad(g, 'right', t - 0.7, t + 0.7, 32, 35, P.rail);
    // Fali lámpa a két ablak között.
    const lx = t + 2;
    if (lx < width - 0.8) {
      const [x, y] = wallPt('right', lx, 52);
      if (glow > 0) {
        g.ellipse(x, y + 2, 16, 12).fill({ color: 0xffe9a8, alpha: glow * 0.35 });
        g.ellipse(x, y + 1, 8, 6).fill({ color: 0xfff3c4, alpha: glow * 0.5 });
      }
      g.rect(x - 1, y - 2, 2, 8).fill(P.rail);
      g.ellipse(x, y - 3, 5, 3).fill(hour >= 18.5 ? 0xfff3c4 : 0xe8dcb0);
    }
  }
}

function skyColor(hour: number): { top: number; bottom: number } {
  const day = { top: 0x8ec5f0, bottom: 0xcfe7f7 };
  const dusk = { top: 0x5b6fa8, bottom: 0xf2a65a };
  const night = { top: 0x0f1a35, bottom: 0x263a66 };
  if (hour < 17) return day;
  if (hour < 19) {
    const k = (hour - 17) / 2;
    return { top: mix(day.top, dusk.top, k), bottom: mix(day.bottom, dusk.bottom, k) };
  }
  if (hour < 20.5) {
    const k = (hour - 19) / 1.5;
    return { top: mix(dusk.top, night.top, k), bottom: mix(dusk.bottom, night.bottom, k) };
  }
  return night;
}

/** Esti fényhatás erőssége (0–1). */
export function eveningAmount(hour: number): number {
  return Math.max(0, Math.min(1, (hour - 18) / 2.5));
}

// --- Berendezés --------------------------------------------------------------------

function prism(g: Graphics, ox: number, oy: number, sx: number, sy: number, h: number, top: number, left: number, right: number, alpha = 1): void {
  const hw = (TW / 2) * sx;
  const hh = (TH / 2) * sy;
  g.poly([ox - hw, oy, ox, oy + hh, ox, oy + hh - h, ox - hw, oy - h]).fill({ color: left, alpha });
  g.poly([ox + hw, oy, ox, oy + hh, ox, oy + hh - h, ox + hw, oy - h]).fill({ color: right, alpha });
  g.poly([ox, oy - hh - h, ox + hw, oy - h, ox, oy + hh - h, ox - hw, oy - h]).fill({ color: top, alpha });
}

/** Függőleges henger izometrikus nézetben. */
function cylinder(g: Graphics, ox: number, oy: number, rx: number, ry: number, h: number, side: number, top: number, alpha = 1): void {
  g.ellipse(ox, oy, rx, ry).fill({ color: side, alpha });
  g.rect(ox - rx, oy - h, rx * 2, h).fill({ color: side, alpha });
  g.ellipse(ox, oy - h, rx, ry).fill({ color: top, alpha });
}

export function drawTable(g: Graphics, alpha = 1, tint?: number): void {
  const t = (c: number) => (tint === undefined ? c : mix(c, tint, 0.55));
  g.ellipse(0, 3, 24, 11).fill({ color: P.shadow, alpha: 0.16 * alpha });
  g.rect(-2.5, -14, 5, 14).fill({ color: t(P.walnutDark), alpha });
  g.ellipse(0, 0, 9, 4).fill({ color: t(P.walnutDark), alpha });
  // Terítő szoknyával.
  g.ellipse(0, -11, 22, 11).fill({ color: t(P.clothShade), alpha });
  g.rect(-22, -17, 44, 6).fill({ color: t(P.clothShade), alpha });
  g.ellipse(0, -17, 22, 11).fill({ color: t(P.cloth), alpha });
  g.ellipse(0, -17, 8, 3.8).fill({ color: t(P.napkin), alpha: 0.9 * alpha });
  // Gyertya.
  g.rect(-1.2, -26, 2.4, 8).fill({ color: t(0xf6f0dc), alpha });
  g.ellipse(0, -28, 1.6, 2.6).fill({ color: P.flame, alpha });
}

/** Szék: ülés lábakkal; a háttámla külön rajzolható, hogy a vendég elé kerülhessen. */
export function drawChairSeat(g: Graphics, alpha = 1, tint?: number): void {
  const t = (c: number) => (tint === undefined ? c : mix(c, tint, 0.55));
  g.ellipse(0, 2, 11, 5).fill({ color: P.shadow, alpha: 0.14 * alpha });
  for (const [lx, ly] of [[-6, -1], [6, -1], [0, 3], [0, -5]] as const) g.rect(lx - 0.8, ly - 9, 1.6, 9).fill({ color: t(P.walnutDark), alpha });
  prism(g, 0, -9, 0.34, 0.34, 3, t(P.walnut), t(P.walnutDark), t(shade(P.walnut, 0.85)), alpha);
  g.ellipse(0, -12.5, 7, 3.2).fill({ color: t(P.cushion), alpha });
}

/** Háttámla a szék asztaltól távoli szélén; (dx, dy) = szék − asztal mezőirány. */
export function drawChairBack(g: Graphics, dx: number, dy: number, alpha = 1, tint?: number): void {
  const t = (c: number) => (tint === undefined ? c : mix(c, tint, 0.55));
  const off = 0.24;
  const cx = ((dx - dy) * TW * off) / 2;
  const cy = ((dx + dy) * TH * off) / 2 - 12;
  // A támla síkja merőleges az asztal irányára.
  const px = -dy;
  const py = dx;
  const ex = ((px - py) * TW * 0.2) / 2;
  const ey = ((px + py) * TH * 0.2) / 2;
  const h = 17;
  g.poly([cx - ex, cy - ey, cx + ex, cy + ey, cx + ex, cy + ey - h, cx - ex, cy - ey - h]).fill({ color: t(P.walnut), alpha });
  g.poly([cx - ex, cy - ey - h, cx + ex, cy + ey - h, cx + ex * 0.9, cy + ey - h - 2, cx - ex * 0.9, cy - ey - h - 2]).fill({ color: t(shade(P.walnut, 1.2)), alpha });
  g.poly([cx - ex * 0.7, cy - ey * 0.7 - 4, cx + ex * 0.7, cy + ey * 0.7 - 4, cx + ex * 0.7, cy + ey * 0.7 - 13, cx - ex * 0.7, cy - ey * 0.7 - 13]).fill({ color: t(P.cushion), alpha });
}

export function drawStove(g: Graphics, alpha = 1, tint?: number): void {
  const t = (c: number) => (tint === undefined ? c : mix(c, tint, 0.55));
  g.ellipse(0, 4, 28, 13).fill({ color: P.shadow, alpha: 0.16 * alpha });
  prism(g, 0, 0, 0.84, 0.84, 30, t(P.steel), t(P.steelDeep), t(P.steelDark), alpha);
  // Sütőajtó a bal homlokon.
  g.poly([-22, -6, -6, 2, -6, -16, -22, -24]).fill({ color: t(0x2a313c), alpha });
  g.poly([-20, -10, -8, -4, -8, -14, -20, -20]).fill({ color: t(0x45505f), alpha });
  g.moveTo(-21, -23).lineTo(-7, -16).stroke({ width: 1.5, color: t(0xcbd5e1), alpha });
  // Gombok.
  for (let i = 0; i < 4; i++) g.circle(-24 + i * 5, -27 + i * 2.5, 1.2).fill({ color: P.gold, alpha });
  // Égők.
  for (const [bx, by] of [[-10, -30], [10, -30], [0, -35], [0, -25]] as const) {
    g.ellipse(bx, by, 6, 3).fill({ color: t(P.burner), alpha });
    g.ellipse(bx, by, 3.5, 1.6).stroke({ width: 0.8, color: 0x64748b, alpha });
  }
  // Elszívó perem.
  g.poly([0, -44, 27, -30, 27, -31.5, 0, -45.5, -27, -31.5, -27, -30]).fill({ color: t(0xb8c2cf), alpha: 0.4 * alpha });
}

export function drawCounter(g: Graphics, alpha = 1, tint?: number): void {
  const t = (c: number) => (tint === undefined ? c : mix(c, tint, 0.55));
  g.ellipse(0, 4, 28, 13).fill({ color: P.shadow, alpha: 0.16 * alpha });
  prism(g, 0, 0, 0.88, 0.88, 26, t(P.marble), t(P.walnutDark), t(P.walnut), alpha);
  // Faragott táblák a homlokon.
  g.poly([-24, -6, -4, 4, -4, -16, -24, -24]).stroke({ width: 1, color: t(0x2c1a0e), alpha: 0.5 * alpha });
  g.poly([24, -6, 4, 4, 4, -16, 24, -24]).stroke({ width: 1, color: t(0x2c1a0e), alpha: 0.5 * alpha });
  // Márványerezet és aranyperem.
  g.moveTo(-14, -30).bezierCurveTo(-4, -26, 4, -34, 14, -28).stroke({ width: 0.8, color: P.marbleVein, alpha });
  g.poly([0, -40, 28, -26, 28, -24.5, 0, -38.5, -28, -24.5, -28, -26]).fill({ color: P.gold, alpha: 0.55 * alpha });
}

// --- Dinamikus kiegészítők ---------------------------------------------------------

/** Tányérok az asztalon; n = rendelt ételek, eaten = 0–1 haladás. */
export function drawTablePlates(g: Graphics, n: number, eaten: number): void {
  const spots: [number, number][] = [
    [-11, -18],
    [11, -18],
    [0, -22],
    [0, -13],
  ];
  for (let i = 0; i < Math.min(4, n); i++) {
    const [x, y] = spots[i]!;
    g.ellipse(x, y, 5.2, 2.6).fill(P.plate).stroke({ width: 0.6, color: 0xcbd5e1 });
    const food = 1 - eaten;
    if (food > 0.05) g.ellipse(x, y - 0.6, 3.2 * food + 0.6, 1.5 * food + 0.3).fill(i % 2 ? 0xc2410c : 0xd97706);
  }
}

/** Fazekak és gőz a tűzhelyen főzés közben. */
export function drawPots(g: Graphics, n: number, time: number): void {
  const spots: [number, number][] = [
    [-10, -30],
    [10, -30],
    [0, -35],
  ];
  for (let i = 0; i < Math.min(3, n); i++) {
    const [x, y] = spots[i]!;
    g.ellipse(x, y + 1, 7, 3.4).fill(P.flame).fill({ color: P.flame, alpha: 0.4 });
    cylinder(g, x, y, 5.5, 2.6, 6, 0x9aa5b4, 0xc8d1dc);
    g.ellipse(x, y - 6, 4.2, 1.9).fill(0x7c2d12);
    for (let k = 0; k < 3; k++) {
      const ph = (time / 900 + k / 3 + i * 0.37) % 1;
      g.circle(x + Math.sin(ph * 6 + k) * 2.5, y - 9 - ph * 18, 2 + ph * 3).fill({ color: 0xffffff, alpha: 0.45 * (1 - ph) });
    }
  }
}

/** Kész ételek a pulton. */
export function drawCounterPlates(g: Graphics, n: number): void {
  const spots: [number, number][] = [
    [-12, -28],
    [0, -32],
    [12, -28],
    [0, -24],
    [-6, -30],
    [6, -26],
  ];
  for (let i = 0; i < Math.min(6, n); i++) {
    const [x, y] = spots[i]!;
    g.ellipse(x, y, 5, 2.5).fill(P.plate).stroke({ width: 0.6, color: 0xcbd5e1 });
    g.ellipse(x, y - 1.5, 3.6, 2.2).fill({ color: 0xe2e8f0, alpha: 0.95 });
    g.circle(x, y - 3.6, 0.9).fill(P.gold);
  }
}

// --- Szereplők ------------------------------------------------------------------------

export interface Look {
  skin: number;
  hair: number;
  top: number;
  bottom: number;
  hairStyle: 0 | 1 | 2;
  role: 'guest' | 'waiter' | 'chef';
}

const SKINS = [0xf1c9a5, 0xe0ac83, 0xc68863, 0x9c6644, 0x7a4b2f, 0xf6d7bd];
const HAIRS = [0x2b1a10, 0x4a2f1b, 0x7a4a24, 0xc9a24a, 0x1f1f1f, 0x8c8c8c, 0x6b2a1a];
const TOPS = [0x1e3a8a, 0x1d4ed8, 0x0f766e, 0x6b21a8, 0x7f1d3a, 0x334155, 0x047857, 0x9d174d, 0x0e7490, 0xb45309];
const BOTTOMS = [0x1f2937, 0x334155, 0x3f3f46, 0x1e3a5f, 0x52525b];

export function guestLook(seed: number): Look {
  const pick = <T,>(arr: T[], k: number) => arr[Math.floor(hash(seed * 7 + k) * arr.length)]!;
  return {
    skin: pick(SKINS, 1),
    hair: pick(HAIRS, 2),
    top: pick(TOPS, 3),
    bottom: pick(BOTTOMS, 4),
    hairStyle: Math.floor(hash(seed * 7 + 5) * 3) as 0 | 1 | 2,
    role: 'guest',
  };
}

export function staffLook(seed: number, role: 'waiter' | 'chef'): Look {
  const base = guestLook(seed + 1000);
  return role === 'waiter' ? { ...base, top: 0xf8fafc, bottom: 0x111827, role } : { ...base, top: 0xf8fafc, bottom: 0x4b5563, role };
}

export interface Pose {
  kind: 'stand' | 'walk' | 'sit';
  phase: number;
  carrying: boolean;
  eating: boolean;
  time: number;
}

/** Ember a talppontjánál; a test a képernyő felé néz, a fej kicsit oldalra. */
export function drawPerson(g: Graphics, look: Look, pose: Pose): void {
  g.clear();
  const sit = pose.kind === 'sit';
  const sw = pose.kind === 'walk' ? Math.sin(pose.phase) * 2.6 : 0;
  const bob = pose.kind === 'walk' ? Math.abs(Math.sin(pose.phase)) * 1.2 : 0;
  const lift = sit ? 9 : 0;
  const by = -bob + lift;

  if (!sit) g.ellipse(0, 0, 8.5, 3.6).fill({ color: P.shadow, alpha: 0.22 });

  // Lábak.
  if (sit) {
    g.roundRect(-5, -8, 4, 6, 1.5).fill(look.bottom);
    g.roundRect(1, -8, 4, 6, 1.5).fill(look.bottom);
  } else {
    g.roundRect(-4.6 + sw, -13, 3.6, 12.5, 1.6).fill(look.bottom);
    g.roundRect(1 - sw, -13, 3.6, 12.5, 1.6).fill(look.bottom);
    g.ellipse(-2.8 + sw, -0.6, 2.6, 1.3).fill(0x111827);
    g.ellipse(2.8 - sw, -0.6, 2.6, 1.3).fill(0x111827);
  }

  // Törzs.
  g.roundRect(-6.6, -27.5 + by, 13.2, 15.5, 5).fill(look.top);
  if (look.role === 'waiter') {
    g.roundRect(-5.2, -24 + by, 10.4, 12, 3).fill(0x065f46);
    g.rect(-0.6, -27 + by, 1.2, 3).fill(0x111827);
  }
  if (look.role === 'chef') {
    for (let i = 0; i < 3; i++) {
      g.circle(-2, -24 + i * 3.5 + by, 0.8).fill(P.gold);
      g.circle(2, -24 + i * 3.5 + by, 0.8).fill(P.gold);
    }
    g.roundRect(-6.6, -15 + by, 13.2, 3, 1).fill(0xe5e7eb);
  }
  if (look.role === 'guest') g.roundRect(-6.6, -27.5 + by, 13.2, 3, 1.5).fill({ color: 0xffffff, alpha: 0.12 });

  // Karok.
  const arm = pose.kind === 'walk' ? -sw * 0.8 : 0;
  if (pose.carrying) {
    g.roundRect(5, -24 + by, 7, 3, 1.5).fill(look.top);
    g.ellipse(13, -24 + by, 8, 3).fill(0xd1d5db).stroke({ width: 0.6, color: 0x9ca3af });
    g.ellipse(11, -25.5 + by, 3.4, 1.6).fill(P.plate);
    g.ellipse(15, -25.5 + by, 3.4, 1.6).fill(P.plate);
    g.roundRect(-9, -25 + by + arm, 3, 10, 1.5).fill(look.top);
  } else if (sit && pose.eating) {
    const fork = Math.sin(pose.time / 240) * 2;
    g.roundRect(-9, -24 + by, 3, 8, 1.5).fill(look.top);
    g.roundRect(6, -24 + by + fork, 3, 8, 1.5).fill(look.top);
    g.circle(7.5, -15.5 + by + fork, 1.6).fill(look.skin);
  } else {
    g.roundRect(-9, -25 + by + arm, 3, 10.5, 1.5).fill(look.top);
    g.roundRect(6, -25 + by - arm, 3, 10.5, 1.5).fill(look.top);
    g.circle(-7.5, -14 + by + arm, 1.6).fill(look.skin);
    g.circle(7.5, -14 + by - arm, 1.6).fill(look.skin);
  }

  // Fej és haj.
  g.rect(-1.6, -29.5 + by, 3.2, 2.5).fill(shade(look.skin, 0.9));
  const hy = -33.5 + by;
  if (look.hairStyle === 2 && look.role === 'guest') g.roundRect(-6, hy - 1, 12, 9, 4).fill(look.hair);
  g.circle(0, hy, 5.4).fill(look.skin);
  if (look.role === 'chef') {
    g.roundRect(-5.2, hy - 12, 10.4, 7, 2).fill(0xf8fafc).stroke({ width: 0.6, color: 0xcbd5e1 });
    g.ellipse(0, hy - 12.5, 6.2, 3.6).fill(0xf8fafc).stroke({ width: 0.6, color: 0xcbd5e1 });
    g.rect(-5.4, hy - 5.6, 10.8, 2).fill(0xe5e7eb);
  } else if (look.hairStyle === 1) {
    g.ellipse(0, hy - 2.8, 5.8, 3.2).fill(look.hair);
    g.circle(-4.6, hy - 0.5, 1.6).fill(look.hair);
  } else {
    g.ellipse(0, hy - 2.4, 5.7, 3.6).fill(look.hair);
  }
  g.circle(-1.9, hy + 0.6, 0.7).fill(0x1f2937);
  g.circle(1.9, hy + 0.6, 0.7).fill(0x1f2937);
  g.ellipse(0, hy + 2.8, 1.4, 0.5).fill({ color: 0x7f1d1d, alpha: 0.5 });
}

export type BubbleKind = 'queue' | 'order' | 'food' | 'pay';

/** Gondolatbuborék ikonnal; a keret a türelem állapotát jelzi. */
export function drawBubble(g: Graphics, kind: BubbleKind, ring: number, baseY: number): void {
  const y = baseY;
  g.roundRect(-10, y - 16, 20, 15, 6).fill(0xffffff).stroke({ width: 2, color: ring });
  g.poly([-2, y - 1.5, 3, y - 1.5, -1, y + 3.5]).fill(0xffffff);
  const cy = y - 8.5;
  switch (kind) {
    case 'queue':
      g.circle(0, cy, 4.5).stroke({ width: 1.4, color: 0x334155 });
      g.moveTo(0, cy).lineTo(0, cy - 3).stroke({ width: 1.3, color: 0x334155 });
      g.moveTo(0, cy).lineTo(2.4, cy + 1).stroke({ width: 1.3, color: 0x334155 });
      break;
    case 'order':
      g.roundRect(-3.8, cy - 4.8, 7.6, 9.6, 1).fill(0xf8fafc).stroke({ width: 1.1, color: 0x334155 });
      for (let i = 0; i < 3; i++) g.moveTo(-2.2, cy - 2.4 + i * 2.4).lineTo(2.2, cy - 2.4 + i * 2.4).stroke({ width: 0.9, color: 0x64748b });
      break;
    case 'food':
      g.ellipse(0, cy + 1.5, 6, 2.8).fill(0xffffff).stroke({ width: 1, color: 0x94a3b8 });
      g.ellipse(0, cy, 4, 2.2).fill(0xd97706);
      g.moveTo(-6, cy - 4).lineTo(-6, cy + 2).stroke({ width: 1, color: 0x64748b });
      break;
    case 'pay':
      g.circle(0, cy, 4.6).fill(P.gold).stroke({ width: 1, color: 0x8a6d1f });
      g.circle(0, cy, 2.6).stroke({ width: 0.9, color: 0x8a6d1f });
      break;
  }
}
