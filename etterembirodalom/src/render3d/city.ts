// A terem körüli város: utca, járdák, házsorok, fák, lámpák, járókelők, autó, égbolt és jelképek.
// Városonként más építészet: Párizs (mészkő, palatető, kovácsoltvas erkély), Nizza (pasztell, zsalugáter),
// Róma (okker, terrakotta, árkádok). A terem a nyugati (−x) oldalon néz az utcára.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { NeighborhoodId } from '../data/content';
import { guestLook } from './looks';
import { box, cyl, makeChair, makePerson, makeTable, mat, mesh, posePerson, sphere, type PersonRig } from './models';

interface Theme {
  facades: number[];
  roof: number;
  trim: number;
  shutter: number | null;
  balcony: boolean;
  awnings: number[];
  ground: string;
  floors: [number, number];
}

const THEMES: Record<NeighborhoodId, Theme> = {
  paris: { facades: [0xd8c9ab, 0xcfbf9f, 0xe0d3b8, 0xc9b896], roof: 0x4b5563, trim: 0xe9dfc9, shutter: null, balcony: true, awnings: [0x7f1d3a, 0x14532d, 0x1e3a5f], ground: '#5b5650', floors: [5, 7] },
  riviera: { facades: [0xe3a857, 0xe8a397, 0xf0d48c, 0xd98a5f, 0xf2c6a0], roof: 0xb4552d, trim: 0xf6ecd9, shutter: 0x2f6b4f, balcony: false, awnings: [0x1e6091, 0xd97706, 0x2f6b4f], ground: '#8c7b68', floors: [3, 5] },
  roma: { facades: [0xc2703d, 0xd9944f, 0xb5543a, 0xe0b071, 0xa8553a], roof: 0xa1442a, trim: 0xead8b8, shutter: 0x6b3a1f, balcony: false, awnings: [0x7f1d3a, 0x14532d, 0xb45309], ground: '#6e5b4b', floors: [4, 6] },
};

function rng(seed: number): () => number {
  let x = seed >>> 0;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 4294967296;
  };
}

function cobbleTexture(base: string): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const c = cv.getContext('2d')!;
  c.fillStyle = '#2b2622';
  c.fillRect(0, 0, 256, 256);
  const r = rng(77);
  const size = 32;
  for (let y = 0; y < 256; y += size / 2) {
    const off = (y / (size / 2)) % 2 ? size / 2 : 0;
    for (let x = -size; x < 256 + size; x += size) {
      const shade = 0.75 + r() * 0.35;
      c.fillStyle = base;
      c.globalAlpha = shade;
      c.beginPath();
      c.roundRect(x + off + 2, y + 2, size - 4, size / 2 - 4, 5);
      c.fill();
    }
  }
  c.globalAlpha = 1;
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

const awningCache = new Map<number, THREE.MeshStandardMaterial>();
function awningMat(color: number): THREE.MeshStandardMaterial {
  let m = awningCache.get(color);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ map: awningTexture(color), side: THREE.DoubleSide, roughness: 0.9 });
    awningCache.set(color, m);
  }
  return m;
}

function awningTexture(color: number): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 128;
  cv.height = 32;
  const c = cv.getContext('2d')!;
  for (let i = 0; i < 8; i++) {
    c.fillStyle = i % 2 ? '#f3e9dc' : `#${color.toString(16).padStart(6, '0')}`;
    c.fillRect(i * 16, 0, 16, 32);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function signTexture(name: string): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 512;
  cv.height = 96;
  const c = cv.getContext('2d')!;
  c.fillStyle = '#5a1726';
  c.fillRect(0, 0, 512, 96);
  c.strokeStyle = '#c9a24a';
  c.lineWidth = 6;
  c.strokeRect(6, 6, 500, 84);
  c.fillStyle = '#e6c56f';
  c.font = 'italic 700 52px "Playfair Display", Georgia, serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(name, 256, 52);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export interface CityMats {
  windowLit: THREE.MeshStandardMaterial;
  lamp: THREE.MeshStandardMaterial;
}

/** Egy ház, a homlokzata a +z felé néz; a talppont a homlokzat alsó közepe. */
function makeBuilding(theme: Theme, width: number, depth: number, floors: number, seed: number, mats: CityMats): THREE.Group {
  const g = new THREE.Group();
  const r = rng(seed);
  const floorH = 1.15;
  const h = floors * floorH + 0.6;
  const facade = mat(theme.facades[Math.floor(r() * theme.facades.length)]!, { rough: 0.95 });
  g.add(mesh(box(width, h, depth), facade, 0, h / 2, -depth / 2));
  // Párkányok emeletenként.
  const trim = mat(theme.trim, { rough: 0.9 });
  for (let f = 1; f < floors; f++) g.add(mesh(box(width + 0.06, 0.08, 0.12), trim, 0, 0.6 + f * floorH, 0.04, false));
  // Tető.
  const roof = mat(theme.roof, { rough: 0.8 });
  if (theme.balcony) {
    // Párizsi manzárdtető tetőablakokkal.
    const m = mesh(box(width, 1.1, depth * 0.8), roof, 0, h + 0.55, -depth / 2);
    g.add(m);
    for (let x = -width / 2 + 0.6; x < width / 2 - 0.3; x += 1.1) {
      g.add(mesh(box(0.45, 0.6, 0.3), roof, x, h + 0.5, -depth * 0.1 + 0.05, false));
      g.add(mesh(box(0.3, 0.38, 0.02), mats.windowLit, x, h + 0.5, -depth * 0.1 + 0.21, false));
    }
    g.add(mesh(box(0.35, 0.8, 0.35), mat(0x8b5a3c), width / 2 - 0.5, h + 1.3, -depth / 2, false));
  } else {
    g.add(mesh(box(width + 0.3, 0.18, depth + 0.3), roof, 0, h + 0.09, -depth / 2));
  }
  // Ablakok és földszint.
  const dark = mat(0x1d2430, { rough: 0.15, metal: 0.3 });
  const shutter = theme.shutter !== null ? mat(theme.shutter, { rough: 0.8 }) : null;
  const iron = mat(0x16181c, { metal: 0.6, rough: 0.5 });
  const cols = Math.max(2, Math.floor(width / 1.1));
  for (let f = 1; f < floors; f++) {
    for (let i = 0; i < cols; i++) {
      const x = -width / 2 + (i + 0.5) * (width / cols);
      const y = 0.6 + f * floorH + floorH * 0.45;
      const lit = r() < 0.45;
      g.add(mesh(box(0.42, 0.72, 0.04), lit ? mats.windowLit : dark, x, y, 0.01, false));
      g.add(mesh(box(0.5, 0.06, 0.08), trim, x, y - 0.4, 0.04, false));
      if (shutter) {
        g.add(mesh(box(0.2, 0.74, 0.03), shutter, x - 0.33, y, 0.03, false));
        g.add(mesh(box(0.2, 0.74, 0.03), shutter, x + 0.33, y, 0.03, false));
      }
      if (theme.balcony && (f === 2 || f === floors - 1)) {
        g.add(mesh(box(0.62, 0.04, 0.22), iron, x, y - 0.38, 0.12, false));
        g.add(mesh(box(0.62, 0.26, 0.015), iron, x, y - 0.24, 0.23, false));
      }
    }
  }
  // Földszinti üzlet napellenzővel vagy árkádokkal.
  const awn = theme.awnings[Math.floor(r() * theme.awnings.length)]!;
  g.add(mesh(box(width * 0.8, 1.0, 0.04), mats.windowLit, 0, 0.75, 0.01, false));
  g.add(mesh(box(width * 0.86, 0.12, 0.08), mat(0x2a1d14), 0, 1.32, 0.04, false));
  const aw = mesh(new THREE.PlaneGeometry(width * 0.86, 0.9), awningMat(awn), 0, 1.5, 0.38, false);
  aw.rotation.x = -1.0;
  g.add(aw);
  return g;
}

function makeTree(seed: number, palm: boolean): THREE.Group {
  const g = new THREE.Group();
  const r = rng(seed);
  if (palm) {
    g.add(mesh(cyl(0.07, 0.11, 3.4, 6), mat(0x8a6d4b), 0, 1.7, 0));
    const leaf = mat(0x3f7d3a, { rough: 0.9 });
    for (let i = 0; i < 7; i++) {
      const l = mesh(box(1.3, 0.04, 0.26), leaf, 0, 3.4, 0);
      l.rotation.y = (i / 7) * Math.PI * 2;
      l.rotation.z = -0.35;
      l.position.x = Math.cos(l.rotation.y) * 0.55;
      l.position.z = -Math.sin(l.rotation.y) * 0.55;
      g.add(l);
    }
    return g;
  }
  g.add(mesh(cyl(0.09, 0.13, 1.9, 6), mat(0x6b5642), 0, 0.95, 0));
  const leaf = mat(0x4d6b33, { rough: 0.95 });
  const leaf2 = mat(0x3c5a28, { rough: 0.95 });
  for (let i = 0; i < 4; i++) {
    const s = mesh(new THREE.IcosahedronGeometry(0.6 + r() * 0.35, 0), i % 2 ? leaf : leaf2, (r() - 0.5) * 0.7, 2.2 + r() * 0.6, (r() - 0.5) * 0.7);
    g.add(s);
  }
  return g;
}

function makeStreetLamp(mats: CityMats): THREE.Group {
  const g = new THREE.Group();
  const iron = mat(0x1b1d21, { metal: 0.6, rough: 0.5 });
  g.add(mesh(cyl(0.07, 0.11, 0.3, 8), iron, 0, 0.15, 0));
  g.add(mesh(cyl(0.035, 0.045, 3.0, 6), iron, 0, 1.6, 0));
  g.add(mesh(box(0.3, 0.42, 0.3), mats.lamp, 0, 3.25, 0, false));
  g.add(mesh(cyl(0.02, 0.22, 0.16, 4), iron, 0, 3.55, 0, false));
  return g;
}

function makeCar(color: number): THREE.Group {
  const g = new THREE.Group();
  const body = mat(color, { rough: 0.35, metal: 0.4 });
  g.add(mesh(box(0.9, 0.38, 2.0), body, 0, 0.42, 0));
  g.add(mesh(box(0.8, 0.34, 1.0), body, 0, 0.78, -0.1));
  g.add(mesh(box(0.78, 0.26, 0.96), mat(0x9fc3d9, { rough: 0.1, opacity: 0.7 }), 0, 0.8, -0.1, false));
  const wheel = mat(0x111111, { rough: 0.8 });
  for (const [x, z] of [[-0.46, 0.65], [0.46, 0.65], [-0.46, -0.65], [0.46, -0.65]] as const) {
    const w = mesh(cyl(0.18, 0.18, 0.12, 10), wheel, x, 0.2, z);
    w.rotation.z = Math.PI / 2;
    g.add(w);
  }
  g.add(mesh(sphere(0.06, 6), mat(0xfff3c4, { emissive: 0xffe9a8, emissiveIntensity: 1.5 }), -0.3, 0.45, 1.0, false));
  g.add(mesh(sphere(0.06, 6), mat(0xfff3c4, { emissive: 0xffe9a8, emissiveIntensity: 1.5 }), 0.3, 0.45, 1.0, false));
  return g;
}

function makeEiffel(): THREE.Group {
  const g = new THREE.Group();
  const iron = mat(0x5a4636, { rough: 0.8, metal: 0.3 });
  const glow = mat(0x6b5236, { emissive: 0xffc46b, emissiveIntensity: 0 });
  glow.name = 'eiffelGlow';
  const seg = (rb: number, rt: number, h: number, y: number, m: THREE.Material) => {
    const o = mesh(new THREE.CylinderGeometry(rt, rb, h, 4, 1, true), m, 0, y + h / 2, 0, false);
    o.rotation.y = Math.PI / 4;
    (o.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    g.add(o);
  };
  seg(7, 3.2, 9, 0, iron);
  g.add(mesh(box(5.2, 0.6, 5.2), glow, 0, 9.2, 0, false));
  seg(3, 1.4, 10, 9.5, iron);
  g.add(mesh(box(2.4, 0.5, 2.4), glow, 0, 19.7, 0, false));
  seg(1.3, 0.25, 16, 20, iron);
  g.add(mesh(cyl(0.08, 0.08, 3, 4), iron, 0, 37.5, 0, false));
  // Ívek a lábak között.
  for (let i = 0; i < 4; i++) {
    const a = mesh(new THREE.TorusGeometry(2.6, 0.18, 4, 10, Math.PI), iron, 0, 3.4, 0, false);
    a.rotation.y = (i * Math.PI) / 2;
    a.position.x = Math.sin((i * Math.PI) / 2) * 3.4;
    a.position.z = Math.cos((i * Math.PI) / 2) * 3.4;
    g.add(a);
  }
  return g;
}

function makeColosseum(): THREE.Group {
  const g = new THREE.Group();
  const cv = document.createElement('canvas');
  cv.width = 512;
  cv.height = 128;
  const c = cv.getContext('2d')!;
  c.fillStyle = '#cdb48a';
  c.fillRect(0, 0, 512, 128);
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 16; i++) {
      c.fillStyle = '#3d2f22';
      c.beginPath();
      const x = i * 32 + 8;
      const y = row * 40 + 10;
      c.roundRect(x, y, 16, 28, [8, 8, 0, 0]);
      c.fill();
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(3, 1);
  const wall = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, side: THREE.DoubleSide });
  g.add(mesh(new THREE.CylinderGeometry(11, 11, 8, 40, 1, true, 0, Math.PI * 1.55), wall, 0, 4, 0, false));
  g.add(mesh(new THREE.CylinderGeometry(11, 11, 5.4, 40, 1, true, Math.PI * 1.55, Math.PI * 0.45), wall, 0, 2.7, 0, false));
  return g;
}

/** A statikus városi hálókat anyagonként egy-egy hálóba olvasztja (kevesebb rajzhívás telefonon). */
function mergeStatic(group: THREE.Group): void {
  group.updateMatrixWorld(true);
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const meshes: THREE.Mesh[] = [];
  group.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || Array.isArray(m.material)) return;
    meshes.push(m);
  });
  for (const m of meshes) {
    const src = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
    for (const name of Object.keys(src.attributes)) if (name !== 'position' && name !== 'normal' && name !== 'uv') src.deleteAttribute(name);
    if (!src.attributes.uv) src.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((src.attributes.position?.count ?? 0) * 2), 2));
    src.applyMatrix4(m.matrixWorld);
    const mt = m.material as THREE.Material;
    const list = buckets.get(mt) ?? [];
    list.push(src);
    buckets.set(mt, list);
  }
  group.clear();
  for (const [mt, list] of buckets) {
    const merged = mergeGeometries(list, false);
    for (const g of list) g.dispose();
    if (!merged) continue;
    const out = new THREE.Mesh(merged, mt);
    out.receiveShadow = true;
    group.add(out);
  }
}

export interface City {
  group: THREE.Group;
  mats: CityMats;
  update(now: number, evening: number): void;
}

/** A város felépítése egy étterem köré. W, H a terem mérete mezőben. */
export function buildCity(n: NeighborhoodId, W: number, H: number, entranceZ: number, restaurantName: string, seed: number): City {
  const theme = THEMES[n];
  const group = new THREE.Group();
  const mats: CityMats = {
    windowLit: new THREE.MeshStandardMaterial({ color: 0x3a3226, emissive: 0xffc777, emissiveIntensity: 0.15, roughness: 0.3, flatShading: true }),
    lamp: new THREE.MeshStandardMaterial({ color: 0xfff1c9, emissive: 0xffd28a, emissiveIntensity: 0.2, roughness: 0.4, flatShading: true }),
  };

  // Talaj: macskakő; út; járdák.
  const cobble = cobbleTexture(theme.ground);
  cobble.repeat.set(150, 150);
  const ground = mesh(new THREE.PlaneGeometry(420, 420), new THREE.MeshStandardMaterial({ map: cobble, roughness: 0.95 }), W / 2, -0.02, H / 2, false);
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);
  const road = mesh(new THREE.PlaneGeometry(5, 80), mat(0x2a2a2c, { rough: 0.9 }), -4.7, -0.01, H / 2, false);
  road.rotation.x = -Math.PI / 2;
  group.add(road);
  for (let z = -30; z < H + 30; z += 2.4) group.add(mesh(box(0.12, 0.005, 1.2), mat(0xd8d2c4), -4.7, 0.0, z, false));
  const curb = mat(0xa39d93, { rough: 0.9 });
  group.add(mesh(box(1.7, 0.1, 80), mat(0x8a847a, { rough: 0.95 }), -1.35, 0.05, H / 2, false));
  group.add(mesh(box(1.7, 0.1, 80), mat(0x8a847a, { rough: 0.95 }), -8.05, 0.05, H / 2, false));
  group.add(mesh(box(0.12, 0.14, 80), curb, -2.2, 0.07, H / 2, false));
  group.add(mesh(box(0.12, 0.14, 80), curb, -7.2, 0.07, H / 2, false));
  // Hátsó udvar járdája a hátsó fal mögött.
  group.add(mesh(box(W + 20, 0.08, 1.6), mat(0x8a847a, { rough: 0.95 }), W / 2 + 4, 0.04, -1.4, false));

  // Szemközti házsor (az utca túloldalán), homlokzattal kelet felé.
  const r = rng(seed);
  for (let z = -18; z < H + 18; ) {
    const w = 3 + r() * 1.6;
    const floors = theme.floors[0] + Math.floor(r() * (theme.floors[1] - theme.floors[0] + 1));
    const b = makeBuilding(theme, w, 5, floors, seed + Math.floor(z * 13), mats);
    b.rotation.y = Math.PI / 2;
    b.position.set(-8.95, 0, z + w / 2);
    group.add(b);
    z += w + 0.05;
  }
  // A hátsó fal mögötti házsor, homlokzattal dél felé (a terem felé).
  for (let x = -1; x < W + 16; ) {
    const w = 3 + r() * 1.6;
    const floors = theme.floors[0] + Math.floor(r() * (theme.floors[1] - theme.floors[0] + 1));
    const b = makeBuilding(theme, w, 5, floors, seed + 999 + Math.floor(x * 17), mats);
    b.position.set(x + w / 2, 0, -2.25);
    group.add(b);
    x += w + 0.05;
  }

  // Távoli háztömbök a kamerától elfelé eső oldalon: a köd mögött a város folytatódik.
  const farRoof = mat(theme.roof, { rough: 0.85 });
  const farFacades = theme.facades.map((c) => mat(c, { rough: 0.95 }));
  for (let x = -70; x < W + 50; x += 7) {
    for (let z = -70; z < H + 50; z += 7) {
      const behind = x < -17 || z < -11;
      if (!behind) continue;
      if (n === 'riviera' && z < -8) continue;
      if (n === 'paris' && Math.hypot(x + 38, z + 42) < 12) continue;
      if (n === 'roma' && Math.hypot(x + 34, z + 36) < 15) continue;
      if (x > -14 && x < -0 && z > -12) continue;
      const bw = 4.5 + r() * 2;
      const bd = 4.5 + r() * 2;
      const bh = 4 + r() * 6;
      group.add(mesh(new THREE.BoxGeometry(bw, bh, bd), farFacades[Math.floor(r() * farFacades.length)]!, x, bh / 2, z, false));
      group.add(mesh(new THREE.BoxGeometry(bw * 0.9, 0.9, bd * 0.9), farRoof, x, bh + 0.45, z, false));
    }
  }

  // Fák és utcai lámpák.
  const palm = n === 'riviera';
  for (let z = -10; z < H + 10; z += 5) {
    const t = makeTree(seed + z, palm);
    t.position.set(-7.85, 0.1, z + 1.2);
    group.add(t);
    const lamp = makeStreetLamp(mats);
    lamp.position.set(-2.0, 0.1, z + 3.6);
    group.add(lamp);
  }
  // A bisztró teraszasztalai a járdán.
  for (const [dz, rot] of [[-2.2, 0.3], [2.4, -0.2]] as const) {
    const tb = makeTable();
    tb.scale.setScalar(0.8);
    tb.position.set(-1.35, 0.1, entranceZ + dz + (dz > 0 ? 0.6 : -0.6));
    group.add(tb);
    for (const s of [-1, 1]) {
      const ch = makeChair();
      ch.scale.setScalar(0.8);
      ch.position.set(-1.35 + s * 0.55, 0.1, entranceZ + dz + (dz > 0 ? 0.6 : -0.6));
      ch.rotation.y = (s > 0 ? -Math.PI / 2 : Math.PI / 2) + rot;
      group.add(ch);
    }
  }

  // Napellenző az ajtó fölött az utcai oldalon, cégtábla a fal tetején (a kamera felől olvasható).
  const awnTex = awningTexture(0x7f1d3a);
  awnTex.center.set(0.5, 0.5);
  awnTex.rotation = Math.PI / 2;
  const awn = mesh(box(1.0, 0.04, 3.4), new THREE.MeshStandardMaterial({ map: awnTex, roughness: 0.9 }), -1.05, 2.25, entranceZ, false);
  awn.rotation.z = 0.42;
  group.add(awn);
  const sign = mesh(new THREE.PlaneGeometry(3.6, 0.68), new THREE.MeshBasicMaterial({ map: signTexture(restaurantName), toneMapped: false }), -0.56, 3.05, entranceZ, false);
  sign.rotation.y = Math.PI / 2;
  group.add(sign);
  const signBack = mesh(box(0.06, 0.78, 3.72), mat(0x2a1a10), -0.6, 3.05, entranceZ, false);
  group.add(signBack);
  for (const dz of [-1.4, 1.4]) group.add(mesh(box(0.05, 0.4, 0.05), mat(0xc9a24a, { metal: 0.7, rough: 0.35 }), -0.58, 2.6, entranceZ + dz, false));

  // Jelképek a távolban.
  if (n === 'paris') {
    const e = makeEiffel();
    e.position.set(-38, 0, -42);
    group.add(e);
  } else if (n === 'roma') {
    const c = makeColosseum();
    c.position.set(-34, 0, -36);
    group.add(c);
  } else {
    const sea = mesh(new THREE.PlaneGeometry(200, 120), mat(0x1e5f8a, { rough: 0.25, metal: 0.1 }), W / 2, -0.05, -60, false);
    sea.rotation.x = -Math.PI / 2;
    group.add(sea);
    for (let i = 0; i < 3; i++) {
      const boat = new THREE.Group();
      boat.add(mesh(box(0.8, 0.3, 2.4), mat(0xf5f5f4), 0, 0.15, 0, false));
      const sail = mesh(new THREE.ConeGeometry(0.9, 3, 3), mat(0xfbf4e8), 0, 1.8, 0, false);
      boat.add(sail);
      boat.position.set(-20 + i * 18, 0, -30 - i * 8);
      group.add(boat);
    }
  }

  mergeStatic(group);

  // Járókelők a két járdán és egy autó.
  const walkers: { rig: PersonRig; x: number; z: number; dir: number; speed: number; phase: number }[] = [];
  for (let i = 0; i < 9; i++) {
    const rig = makePerson(guestLook(seed * 31 + i * 7));
    const side = i % 2;
    const x = side ? -1.6 + (i % 3) * 0.15 : -7.9 + (i % 3) * 0.15;
    const dir = i % 3 === 0 ? -1 : 1;
    const z = -20 + ((i * 37) % 60);
    rig.root.position.set(x, 0.1, z);
    rig.root.rotation.y = dir > 0 ? 0 : Math.PI;
    group.add(rig.root);
    walkers.push({ rig, x, z, dir, speed: 0.0009 + (i % 4) * 0.00015, phase: i });
  }
  const car = makeCar([0x7f1d3a, 0x1e3a5f, 0x14532d, 0xc9a24a][seed % 4]!);
  car.position.set(-3.6, 0, -25);
  group.add(car);

  let last = performance.now();
  return {
    group,
    mats,
    update(now: number, evening: number) {
      const dt = Math.min(100, now - last);
      last = now;
      mats.windowLit.emissiveIntensity = 0.15 + evening * 1.4;
      mats.lamp.emissiveIntensity = 0.2 + evening * 2.2;
      for (const w of walkers) {
        w.z += w.dir * w.speed * dt * 1.6;
        if (w.z > H + 25) w.z = -25;
        if (w.z < -25) w.z = H + 25;
        w.phase += w.speed * dt * 14;
        w.rig.root.position.z = w.z;
        posePerson(w.rig, 'walk', w.phase, now);
      }
      car.position.z += dt * 0.006;
      if (car.position.z > H + 40) car.position.z = -40;
    },
  };
}
