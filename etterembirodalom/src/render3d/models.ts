// Low-poly 3D modellek egyszerű testekből. Egy mező = 1 egység; a modellek a mező közepén, y = 0-n állnak.
// A geometriák és anyagok megosztottak, így sok bútor és szereplő is olcsó.

import * as THREE from 'three';
import type { FloorStyle, ItemKind, WallStyle } from '../data/content';

// --- Anyagok ------------------------------------------------------------------------

const matCache = new Map<string, THREE.MeshStandardMaterial>();

export function mat(color: number, opts: { rough?: number; metal?: number; emissive?: number; emissiveIntensity?: number; opacity?: number } = {}): THREE.MeshStandardMaterial {
  const k = `${color}|${opts.rough ?? 0.8}|${opts.metal ?? 0}|${opts.emissive ?? 0}|${opts.emissiveIntensity ?? 0}|${opts.opacity ?? 1}`;
  let m = matCache.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: opts.rough ?? 0.8,
      metalness: opts.metal ?? 0,
      flatShading: true,
      emissive: opts.emissive ?? 0x000000,
      emissiveIntensity: opts.emissiveIntensity ?? 0,
      transparent: (opts.opacity ?? 1) < 1,
      opacity: opts.opacity ?? 1,
    });
    matCache.set(k, m);
  }
  return m;
}

const geoCache = new Map<string, THREE.BufferGeometry>();
function geo<T extends THREE.BufferGeometry>(k: string, make: () => T): T {
  let g = geoCache.get(k);
  if (!g) {
    g = make();
    geoCache.set(k, g);
  }
  return g as T;
}

export const box = (w: number, h: number, d: number) => geo(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d));
export const cyl = (rt: number, rb: number, h: number, seg = 12) => geo(`c${rt},${rb},${h},${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg));
export const sphere = (r: number, seg = 10) => geo(`s${r},${seg}`, () => new THREE.SphereGeometry(r, seg, Math.max(6, seg - 2)));
const ico = (r: number) => geo(`i${r}`, () => new THREE.IcosahedronGeometry(r, 0));
const cone = (r: number, h: number, seg = 12) => geo(`k${r},${h},${seg}`, () => new THREE.ConeGeometry(r, h, seg, 1, true));

export function mesh(g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, shadow = true): THREE.Mesh {
  const o = new THREE.Mesh(g, m);
  o.position.set(x, y, z);
  o.castShadow = shadow;
  o.receiveShadow = true;
  return o;
}

export const PAL = {
  walnut: 0x6b4226,
  walnutDark: 0x3f2615,
  oak: 0x9a6a3c,
  cloth: 0xf7f7f2,
  burgundy: 0x7f1d3a,
  gold: 0xc9a43a,
  steel: 0x9aa5b4,
  steelDark: 0x4b5563,
  black: 0x1f2937,
  marble: 0xeef1f4,
  terracotta: 0xb4552d,
  leaf: 0x4d7c3a,
  leafDark: 0x355e28,
  glass: 0x7cc4e8,
  flame: 0xffb347,
  skinTones: [0xf1c9a5, 0xe0ac83, 0xc68863, 0x9c6644, 0x7a4b2f, 0xf6d7bd],
};

// --- Berendezés -------------------------------------------------------------------------

export function makeTable(): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.2, 0.26, 0.05, 14), mat(PAL.walnutDark), 0, 0.025, 0));
  g.add(mesh(cyl(0.05, 0.05, 0.7, 8), mat(PAL.walnutDark), 0, 0.38, 0));
  g.add(mesh(cyl(0.42, 0.42, 0.04, 20), mat(PAL.walnut), 0, 0.74, 0));
  // Terítő szoknyával.
  g.add(mesh(cyl(0.44, 0.47, 0.16, 20), mat(PAL.cloth, { rough: 0.95 }), 0, 0.68, 0));
  g.add(mesh(cyl(0.445, 0.445, 0.02, 20), mat(PAL.cloth, { rough: 0.95 }), 0, 0.77, 0));
  g.add(mesh(box(0.5, 0.005, 0.14), mat(PAL.burgundy), 0, 0.782, 0, false));
  // Gyertya lánggal.
  g.add(mesh(cyl(0.025, 0.025, 0.12, 8), mat(0xf6f0dc), 0, 0.84, 0));
  const flame = mesh(sphere(0.022, 6), mat(PAL.flame, { emissive: PAL.flame, emissiveIntensity: 2.5 }), 0, 0.915, 0, false);
  flame.scale.set(1, 1.6, 1);
  flame.name = 'flame';
  g.add(flame);
  return g;
}

/** Szék; a támla a −z oldalon van, a hívó forgatja az asztal felé. */
export function makeChair(): THREE.Group {
  const g = new THREE.Group();
  const wood = mat(PAL.walnut);
  for (const [x, z] of [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]] as const) g.add(mesh(box(0.04, 0.44, 0.04), wood, x, 0.22, z));
  g.add(mesh(box(0.38, 0.05, 0.38), wood, 0, 0.46, 0));
  g.add(mesh(box(0.34, 0.03, 0.34), mat(PAL.burgundy, { rough: 0.95 }), 0, 0.5, 0));
  g.add(mesh(box(0.38, 0.5, 0.04), wood, 0, 0.73, -0.17));
  g.add(mesh(box(0.28, 0.28, 0.02), mat(PAL.burgundy, { rough: 0.95 }), 0, 0.76, -0.145));
  return g;
}

export function makeStove(): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(box(0.86, 0.86, 0.8), mat(PAL.steel, { rough: 0.35, metal: 0.6 }), 0, 0.43, 0));
  g.add(mesh(box(0.88, 0.04, 0.82), mat(PAL.black, { rough: 0.5 }), 0, 0.88, 0));
  for (const [x, z] of [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]] as const) {
    g.add(mesh(cyl(0.12, 0.12, 0.02, 12), mat(0x111827), x, 0.91, z, false));
  }
  // Sütőajtó és gombok a +z (elülső) oldalon.
  g.add(mesh(box(0.6, 0.42, 0.02), mat(0x2a313c, { rough: 0.3, metal: 0.4 }), 0, 0.36, 0.41, false));
  g.add(mesh(box(0.46, 0.22, 0.01), mat(0x0f172a, { rough: 0.1, metal: 0.2, emissive: 0x7c2d12, emissiveIntensity: 0.25 }), 0, 0.38, 0.425, false));
  g.add(mesh(box(0.5, 0.03, 0.03), mat(0xd1d5db, { metal: 0.8, rough: 0.2 }), 0, 0.6, 0.44, false));
  for (let i = 0; i < 4; i++) g.add(mesh(cyl(0.03, 0.03, 0.03, 8), mat(PAL.gold, { metal: 0.8, rough: 0.3 }), -0.27 + i * 0.18, 0.74, 0.42, false));
  for (const o of g.children.slice(-4)) o.rotation.x = Math.PI / 2;
  return g;
}

export function makeCounter(): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(box(0.9, 0.9, 0.7), mat(PAL.walnut), 0, 0.45, 0));
  for (const x of [-0.22, 0.22]) g.add(mesh(box(0.34, 0.6, 0.02), mat(PAL.walnutDark), x, 0.45, 0.355, false));
  g.add(mesh(box(0.96, 0.05, 0.76), mat(PAL.marble, { rough: 0.25 }), 0, 0.925, 0));
  g.add(mesh(box(0.97, 0.02, 0.77), mat(PAL.gold, { metal: 0.8, rough: 0.3 }), 0, 0.89, 0, false));
  return g;
}

export function makePlant(): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.22, 0.16, 0.36, 10), mat(PAL.terracotta), 0, 0.18, 0));
  g.add(mesh(cyl(0.2, 0.2, 0.02, 10), mat(0x3f2a1d), 0, 0.36, 0, false));
  g.add(mesh(cyl(0.035, 0.05, 0.7, 6), mat(0x6b4f35), 0, 0.7, 0));
  const leaf = mat(PAL.leaf, { rough: 0.9 });
  const dark = mat(PAL.leafDark, { rough: 0.9 });
  for (const [x, y, z, r, m] of [[0, 1.15, 0, 0.32, leaf], [0.18, 1.0, 0.08, 0.22, dark], [-0.16, 1.02, -0.1, 0.24, leaf], [0.05, 1.32, -0.06, 0.2, dark]] as const) {
    g.add(mesh(ico(r), m, x, y, z));
  }
  return g;
}

export function makeLamp(): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.16, 0.2, 0.04, 12), mat(PAL.gold, { metal: 0.8, rough: 0.3 }), 0, 0.02, 0));
  g.add(mesh(cyl(0.02, 0.02, 1.5, 6), mat(PAL.gold, { metal: 0.8, rough: 0.3 }), 0, 0.77, 0));
  const shade = mesh(cone(0.26, 0.3, 14), mat(0xf3e3c3, { rough: 0.9, emissive: 0xffd58a, emissiveIntensity: 0.3 }), 0, 1.58, 0);
  (shade.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  shade.name = 'shade';
  g.add(shade);
  return g;
}

export function makeWine(): THREE.Group {
  const g = new THREE.Group();
  const wood = mat(PAL.walnutDark);
  g.add(mesh(box(0.86, 1.7, 0.36), wood, 0, 0.85, 0));
  const inner = mat(0x24160c);
  g.add(mesh(box(0.76, 1.56, 0.02), inner, 0, 0.86, 0.17, false));
  const bottleColors = [0x14532d, 0x7f1d1d, 0x14532d, 0x3f1d0f];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const b = mesh(cyl(0.045, 0.045, 0.26, 6), mat(bottleColors[(row + col) % 4]!, { rough: 0.25, metal: 0.1 }), -0.3 + col * 0.15, 0.22 + row * 0.3, 0.12, false);
      b.rotation.x = Math.PI / 2;
      g.add(b);
    }
    g.add(mesh(box(0.8, 0.02, 0.34), wood, 0, 0.08 + row * 0.3, 0, false));
  }
  return g;
}

export function makeAquarium(): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(box(0.9, 0.7, 0.5), mat(PAL.walnutDark), 0, 0.35, 0));
  g.add(mesh(box(0.86, 0.6, 0.44), mat(PAL.glass, { rough: 0.05, opacity: 0.45, emissive: 0x1e6091, emissiveIntensity: 0.25 }), 0, 1.0, 0, false));
  g.add(mesh(box(0.86, 0.06, 0.44), mat(0xd6c49a), 0, 0.73, 0, false));
  g.add(mesh(box(0.92, 0.04, 0.52), mat(PAL.walnutDark), 0, 1.32, 0));
  for (let i = 0; i < 4; i++) {
    const f = mesh(box(0.08, 0.04, 0.02), mat([0xf97316, 0xfacc15, 0xef4444, 0x60a5fa][i]!, { emissive: 0x331a00, emissiveIntensity: 0.2 }), 0, 0.9 + i * 0.1, 0, false);
    f.name = `fish${i}`;
    g.add(f);
  }
  g.add(mesh(ico(0.07), mat(PAL.leaf), -0.25, 0.8, 0.05, false));
  return g;
}

export function makePiano(): THREE.Group {
  const g = new THREE.Group();
  const lacquer = mat(0x0b0b0f, { rough: 0.2, metal: 0.3 });
  g.add(mesh(box(0.9, 0.3, 0.8), lacquer, 0, 0.78, -0.02));
  const lid = mesh(box(0.88, 0.02, 0.78), lacquer, 0, 1.12, -0.18);
  lid.rotation.x = -0.6;
  g.add(lid);
  g.add(mesh(box(0.02, 0.4, 0.02), lacquer, 0.3, 1.0, 0.05, false));
  for (const [x, z] of [[-0.38, -0.34], [0.38, -0.34], [0, 0.32]] as const) g.add(mesh(cyl(0.035, 0.03, 0.64, 6), lacquer, x, 0.32, z));
  g.add(mesh(box(0.84, 0.04, 0.16), mat(0xf8fafc, { rough: 0.4 }), 0, 0.95, 0.4, false));
  g.add(mesh(box(0.5, 0.06, 0.26), lacquer, 0, 0.48, 0.62));
  return g;
}

export function makeItem(kind: ItemKind): THREE.Group {
  switch (kind) {
    case 'table':
      return makeTable();
    case 'chair':
      return makeChair();
    case 'stove':
      return makeStove();
    case 'counter':
      return makeCounter();
    case 'plant':
      return makePlant();
    case 'lamp':
      return makeLamp();
    case 'wine':
      return makeWine();
    case 'aquarium':
      return makeAquarium();
    case 'piano':
      return makePiano();
  }
}

// --- Kiegészítők: tányér, fazék, gőz --------------------------------------------------

export function makePlate(food: number): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.09, 0.07, 0.015, 14), mat(0xffffff, { rough: 0.3 }), 0, 0, 0, false));
  const f = mesh(sphere(0.055, 8), mat(food, { rough: 0.7 }), 0, 0.02, 0, false);
  f.scale.set(1, 0.45, 1);
  f.name = 'food';
  g.add(f);
  return g;
}

export function makePot(): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.11, 0.1, 0.14, 12), mat(0xb8c2cf, { metal: 0.8, rough: 0.25 }), 0, 0.07, 0, false));
  g.add(mesh(cyl(0.095, 0.095, 0.01, 12), mat(0x9a3412), 0, 0.13, 0, false));
  return g;
}

// --- Padló és fal textúrák ----------------------------------------------------------------

function canvasTex(size: number, draw: (c: CanvasRenderingContext2D, s: number) => void): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const c = cv.getContext('2d')!;
  draw(c, size);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

function rand(seed: number): () => number {
  let x = seed;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 4294967296;
  };
}

/** Egy mezőnyi padlómintázat; a hívó ismétli a teljes teremre. */
export function floorTexture(style: FloorStyle): THREE.CanvasTexture {
  return canvasTex(256, (c, s) => {
    const r = rand(style.length * 99);
    if (style === 'parquet') {
      const planks = 4;
      const cols = ['#8b5a34', '#925f37', '#86552f', '#9a6740', '#80502c'];
      for (let i = 0; i < planks; i++) {
        const y = (i * s) / planks;
        const joint = r() * s;
        for (const [x0, x1] of [[0, joint], [joint, s]] as const) {
          c.fillStyle = cols[Math.floor(r() * cols.length)]!;
          c.fillRect(x0, y, x1 - x0, s / planks);
          c.strokeStyle = 'rgba(40,22,10,0.45)';
          c.lineWidth = 2;
          c.strokeRect(x0 + 1, y + 1, x1 - x0 - 2, s / planks - 2);
          for (let k = 0; k < 6; k++) {
            c.strokeStyle = `rgba(60,34,16,${0.08 + r() * 0.1})`;
            c.beginPath();
            const yy = y + 6 + r() * (s / planks - 12);
            c.moveTo(x0, yy);
            c.bezierCurveTo(x0 + (x1 - x0) / 3, yy + 3, x0 + (2 * (x1 - x0)) / 3, yy - 3, x1, yy);
            c.stroke();
          }
        }
      }
    } else if (style === 'marble') {
      const half = s / 2;
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          c.fillStyle = (i + j) % 2 === 0 ? '#f1f3f6' : '#1f2937';
          c.fillRect(i * half, j * half, half, half);
          c.strokeStyle = (i + j) % 2 === 0 ? 'rgba(148,163,184,0.5)' : 'rgba(148,163,184,0.25)';
          for (let k = 0; k < 4; k++) {
            c.beginPath();
            c.moveTo(i * half + r() * half, j * half);
            c.bezierCurveTo(i * half + r() * half, j * half + half / 3, i * half + r() * half, j * half + (2 * half) / 3, i * half + r() * half, j * half + half);
            c.stroke();
          }
        }
      }
      c.strokeStyle = 'rgba(15,23,42,0.35)';
      c.lineWidth = 2;
      c.strokeRect(0, 0, s, s);
      c.beginPath();
      c.moveTo(half, 0);
      c.lineTo(half, s);
      c.moveTo(0, half);
      c.lineTo(s, half);
      c.stroke();
    } else {
      const cols = ['#b4552d', '#a94e2a', '#bd5f35', '#9f4826'];
      const half = s / 2;
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          c.fillStyle = cols[Math.floor(r() * cols.length)]!;
          c.fillRect(i * half + 3, j * half + 3, half - 6, half - 6);
        }
      }
      c.fillStyle = '#d8c7a8';
      c.globalCompositeOperation = 'destination-over';
      c.fillRect(0, 0, s, s);
    }
  });
}

export const WALL_COLORS: Record<WallStyle, { panel: number; dark: number }> = {
  emerald: { panel: 0x0f5e48, dark: 0x0b4d3b },
  bordeaux: { panel: 0x7f1d3a, dark: 0x5c1228 },
  navy: { panel: 0x1e3a8a, dark: 0x172554 },
  olive: { panel: 0x556b2f, dark: 0x3f4f22 },
};

// --- Emberek --------------------------------------------------------------------------------

export interface PersonLook {
  skin: number;
  hair: number;
  top: number;
  bottom: number;
  hairStyle: 0 | 1 | 2;
  role: 'guest' | 'waiter' | 'chef' | 'cleaner';
}

export interface PersonRig {
  root: THREE.Group;
  body: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
  armL: THREE.Group;
  armR: THREE.Group;
  tray: THREE.Object3D | null;
  mop: THREE.Object3D | null;
}

function limb(len: number, w: number, m: THREE.Material, shoe?: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  g.add(mesh(box(w, len, w), m, 0, -len / 2, 0));
  if (shoe) g.add(mesh(box(w + 0.01, 0.04, w + 0.06), shoe, 0, -len + 0.02, 0.02));
  return g;
}

export function makePerson(look: PersonLook): PersonRig {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const top = mat(look.top, { rough: 0.85 });
  const bottom = mat(look.bottom, { rough: 0.9 });
  const skin = mat(look.skin, { rough: 0.7 });
  const hair = mat(look.hair, { rough: 0.9 });
  const shoe = mat(0x111827, { rough: 0.6 });

  const legL = limb(0.46, 0.09, bottom, shoe);
  legL.position.set(-0.06, 0.48, 0);
  const legR = limb(0.46, 0.09, bottom, shoe);
  legR.position.set(0.06, 0.48, 0);
  body.add(legL, legR);

  body.add(mesh(box(0.26, 0.4, 0.16), top, 0, 0.7, 0));
  if (look.role === 'waiter') {
    body.add(mesh(box(0.22, 0.28, 0.01), mat(0x065f46), 0, 0.66, 0.085, false));
    body.add(mesh(box(0.05, 0.03, 0.01), mat(0x111827), 0, 0.87, 0.085, false));
  } else if (look.role === 'chef') {
    for (let i = 0; i < 3; i++) for (const x of [-0.05, 0.05]) body.add(mesh(sphere(0.012, 6), mat(PAL.gold, { metal: 0.7 }), x, 0.82 - i * 0.08, 0.085, false));
  } else if (look.role === 'cleaner') {
    body.add(mesh(box(0.27, 0.22, 0.17), mat(0x1d4ed8), 0, 0.6, 0, false));
  }

  const armL = limb(0.38, 0.07, top);
  armL.position.set(-0.17, 0.88, 0);
  armL.add(mesh(sphere(0.04, 6), skin, 0, -0.4, 0, false));
  const armR = limb(0.38, 0.07, top);
  armR.position.set(0.17, 0.88, 0);
  armR.add(mesh(sphere(0.04, 6), skin, 0, -0.4, 0, false));
  body.add(armL, armR);

  body.add(mesh(box(0.08, 0.06, 0.08), skin, 0, 0.93, 0, false));
  body.add(mesh(sphere(0.12, 10), skin, 0, 1.05, 0));
  body.add(mesh(sphere(0.018, 6), mat(0x1f2937), -0.045, 1.07, 0.11, false));
  body.add(mesh(sphere(0.018, 6), mat(0x1f2937), 0.045, 1.07, 0.11, false));

  if (look.role === 'chef') {
    body.add(mesh(cyl(0.11, 0.1, 0.16, 12), mat(0xffffff, { rough: 0.95 }), 0, 1.22, 0));
    const puff = mesh(sphere(0.14, 10), mat(0xffffff, { rough: 0.95 }), 0, 1.33, 0);
    puff.scale.set(1, 0.6, 1);
    body.add(puff);
  } else {
    const cap = mesh(sphere(0.125, 10), hair, 0, 1.08, -0.01);
    cap.scale.set(1.02, look.hairStyle === 1 ? 0.75 : 0.85, 1.02);
    body.add(cap);
    if (look.hairStyle === 2) body.add(mesh(box(0.24, 0.24, 0.08), hair, 0, 0.98, -0.09));
  }

  let tray: THREE.Object3D | null = null;
  if (look.role === 'waiter') {
    const t = new THREE.Group();
    t.add(mesh(cyl(0.16, 0.16, 0.015, 14), mat(0xd1d5db, { metal: 0.7, rough: 0.3 }), 0, 0, 0, false));
    t.add(mesh(cyl(0.07, 0.06, 0.012, 12), mat(0xffffff), -0.05, 0.015, 0, false));
    t.add(mesh(cyl(0.07, 0.06, 0.012, 12), mat(0xffffff), 0.06, 0.015, 0.03, false));
    t.add(mesh(sphere(0.06, 8), mat(0xe5e7eb, { metal: 0.5, rough: 0.3 }), -0.05, 0.05, 0, false));
    t.position.set(0.24, 0.9, 0.16);
    t.visible = false;
    body.add(t);
    tray = t;
  }
  let mop: THREE.Object3D | null = null;
  if (look.role === 'cleaner') {
    const m = new THREE.Group();
    m.add(mesh(cyl(0.012, 0.012, 1.1, 6), mat(0x9ca3af), 0, 0.55, 0, false));
    m.add(mesh(box(0.2, 0.05, 0.08), mat(0xe5e7eb, { rough: 1 }), 0, 0.02, 0, false));
    m.position.set(0.22, 0, 0.18);
    m.rotation.z = -0.25;
    body.add(m);
    mop = m;
  }

  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
    }
  });
  return { root, body, legL, legR, armL, armR, tray, mop };
}

/** Póz: járás fázisa, ülés, evés, takarítás. */
export function posePerson(rig: PersonRig, kind: 'stand' | 'walk' | 'sit', phase: number, t: number, opts: { eating?: boolean; carrying?: boolean; cleaning?: boolean } = {}): void {
  const swing = kind === 'walk' ? Math.sin(phase) * 0.55 : 0;
  rig.body.position.y = kind === 'walk' ? Math.abs(Math.cos(phase)) * 0.025 : 0;
  if (kind === 'sit') {
    rig.body.position.y = -0.04;
    rig.legL.rotation.x = rig.legR.rotation.x = -Math.PI / 2;
    rig.legL.position.y = rig.legR.position.y = 0.5;
    rig.legL.position.z = rig.legR.position.z = 0.0;
  } else {
    rig.legL.rotation.x = swing;
    rig.legR.rotation.x = -swing;
    rig.legL.position.y = rig.legR.position.y = 0.48;
  }
  if (opts.carrying) {
    rig.armR.rotation.x = -1.2;
    rig.armL.rotation.x = -swing * 0.8;
  } else if (opts.eating) {
    const f = Math.sin(t / 260) * 0.25;
    rig.armR.rotation.x = -1.1 + f;
    rig.armL.rotation.x = -0.9;
  } else if (opts.cleaning) {
    rig.armR.rotation.x = -0.6 + Math.sin(t / 180) * 0.3;
    rig.armL.rotation.x = -0.5 + Math.sin(t / 180) * 0.3;
    if (rig.mop) rig.mop.position.z = 0.22 + Math.sin(t / 180) * 0.08;
  } else {
    rig.armL.rotation.x = -swing * 0.8;
    rig.armR.rotation.x = swing * 0.8;
  }
  if (rig.tray) rig.tray.visible = !!opts.carrying;
}
