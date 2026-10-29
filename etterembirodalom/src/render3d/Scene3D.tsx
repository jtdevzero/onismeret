// 3D játéktér three.js-szel. Csak olvassa a játékállapotot; módosítani parancsokkal lehet.
// Egér: bal gomb forgat, jobb gomb mozgat, görgő nagyít, kattintás lerak.
// Érintés: egy ujj forgat, két ujj nagyít és mozgat, koppintás lerak.

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ITEMS, PHRASES, nameRegion, type ItemKind } from '../data/content';
import { money, t } from '../i18n';
import { B } from '../sim/formulas';
import { canPlace, chairTable, isWalkable, buildBlocked, itemAt, neighbors } from '../sim/grid';
import { activeRestaurant, setFxListener } from '../sim/sim';
import type { FxEvent, GameState, Group, PlacedItem, RestaurantState } from '../sim/types';
import { useApp } from '../store';
import { guestLook, staffLook } from './looks';
import { WALL_COLORS, PAL, box, floorTexture, makeItem, makePerson, makePlate, makePot, mat, mesh, posePerson, sphere, type PersonRig } from './models';

const WALL_H = 2.6;
const BG = 0xdfe5ec;
const OK = 0x059669;
const WARN = 0xd97706;
const BAD = 0xb91c1c;
const SEATED: Group['phase'][] = ['waitOrder', 'ordering', 'waitFood', 'eating', 'waitPay', 'paying'];
const BUBBLE_KIND: Partial<Record<Group['phase'], 'queue' | 'order' | 'food' | 'pay'>> = { queue: 'queue', waitOrder: 'order', waitFood: 'food', waitPay: 'pay' };
const FOODS = [0xd97706, 0x9a3412, 0x65a30d, 0xb45309, 0xdc2626, 0xfbbf24];

function patienceColor(g: Group): number {
  const p = B.patience;
  const limit = g.phase === 'queue' ? p.seatMinutes : g.phase === 'waitOrder' ? p.orderMinutes : g.phase === 'waitFood' ? p.foodMinutes : p.payMinutes;
  const f = g.phaseTime / (limit * 60);
  return f < 0.5 ? OK : f < 0.8 ? WARN : BAD;
}

// --- Buborék-sprite-ok ---------------------------------------------------------------

const bubbleTex = new Map<string, THREE.SpriteMaterial>();
function bubbleMaterial(kind: 'queue' | 'order' | 'food' | 'pay', ring: number): THREE.SpriteMaterial {
  const k = `${kind}${ring}`;
  let m = bubbleTex.get(k);
  if (m) return m;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 96;
  const c = cv.getContext('2d')!;
  c.fillStyle = '#ffffff';
  c.strokeStyle = `#${ring.toString(16).padStart(6, '0')}`;
  c.lineWidth = 7;
  c.beginPath();
  c.roundRect(8, 8, 80, 66, 18);
  c.fill();
  c.stroke();
  c.beginPath();
  c.moveTo(40, 74);
  c.lineTo(56, 74);
  c.lineTo(46, 90);
  c.closePath();
  c.fill();
  c.strokeStyle = '#334155';
  c.fillStyle = '#334155';
  c.lineWidth = 5;
  const cx = 48;
  const cy = 41;
  if (kind === 'queue') {
    c.beginPath();
    c.arc(cx, cy, 18, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.moveTo(cx, cy);
    c.lineTo(cx, cy - 12);
    c.moveTo(cx, cy);
    c.lineTo(cx + 9, cy + 4);
    c.stroke();
  } else if (kind === 'order') {
    c.strokeRect(cx - 14, cy - 18, 28, 36);
    c.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.moveTo(cx - 8, cy - 8 + i * 9);
      c.lineTo(cx + 8, cy - 8 + i * 9);
      c.stroke();
    }
  } else if (kind === 'food') {
    c.fillStyle = '#d97706';
    c.beginPath();
    c.ellipse(cx, cy + 2, 20, 10, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#94a3b8';
    c.beginPath();
    c.ellipse(cx, cy + 6, 26, 12, 0, 0, Math.PI * 2);
    c.stroke();
  } else {
    c.fillStyle = '#d4af37';
    c.beginPath();
    c.arc(cx, cy, 18, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#8a6d1f';
    c.lineWidth = 3;
    c.beginPath();
    c.arc(cx, cy, 11, 0, Math.PI * 2);
    c.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  m = new THREE.SpriteMaterial({ map: tex, depthTest: false });
  bubbleTex.set(k, m);
  return m;
}

// --- Segédek ----------------------------------------------------------------------------

/** Az elem elejét a legközelebbi járható szomszéd felé fordító szög (a modellek a +z felé néznek). */
function facingAngle(r: RestaurantState, it: PlacedItem): number {
  if (it.kind === 'chair') {
    const table = chairTable(r.layout, it);
    if (table) return Math.atan2(table.x - it.x, table.y - it.y);
  }
  const blocked = buildBlocked(r.layout);
  const free = neighbors(it).filter((n) => isWalkable(r.layout, blocked, n));
  const cx = r.layout.width / 2;
  const cy = r.layout.height / 2;
  const target = free.sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy))[0] ?? { x: cx, y: cy };
  const a = Math.atan2(target.x - it.x, target.y - it.y);
  return Math.round(a / (Math.PI / 2)) * (Math.PI / 2);
}

function skyColors(hour: number): { sky: THREE.Color; sun: number; hemi: number; evening: number } {
  const day = new THREE.Color(0x9fd0f2);
  const dusk = new THREE.Color(0xf2a65a);
  const night = new THREE.Color(0x14213d);
  if (hour < 17) return { sky: day, sun: 2.4, hemi: 1.0, evening: 0 };
  if (hour < 19) {
    const k = (hour - 17) / 2;
    return { sky: day.clone().lerp(dusk, k), sun: 2.4 - 1.4 * k, hemi: 1.0 - 0.35 * k, evening: k * 0.5 };
  }
  const k = Math.min(1, (hour - 19) / 1.5);
  return { sky: dusk.clone().lerp(night, k), sun: 1.0 - 0.8 * k, hemi: 0.65 - 0.25 * k, evening: 0.5 + 0.5 * k };
}

interface AgentVis {
  rig: PersonRig;
  x: number;
  z: number;
  phase: number;
  angle: number;
  bubble: THREE.Sprite;
}

interface ItemVis {
  item: PlacedItem;
  obj: THREE.Group;
  extra: THREE.Group;
  light: THREE.PointLight | null;
}

export function Scene3D() {
  const host = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current!;
    const ov = overlay.current!;
    const narrow = () => el.clientWidth < 900;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(narrow() ? 1.5 : 2, window.devicePixelRatio || 1));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    // Környezeti tükröződés a fémes felületekhez (tűzhely, arany díszek).
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.45;
    const camera = new THREE.PerspectiveCamera(36, el.clientWidth / el.clientHeight, 0.1, 300);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = 1.22;
    controls.minDistance = 5;
    controls.maxDistance = 42;
    controls.screenSpacePanning = false;
    controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

    // Fények.
    const hemi = new THREE.HemisphereLight(0xe6eef7, 0x6b4a2f, 1.0);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff1dc, 2.4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(narrow() ? 1024 : 2048, narrow() ? 1024 : 2048);
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    scene.add(sun, sun.target);
    const warm = new THREE.AmbientLight(0xffc277, 0);
    scene.add(warm);

    // Talapzat a terem alatt: diorámaszerű kivágás.
    const ground = mesh(new THREE.PlaneGeometry(400, 400), mat(0xcfd8e3, { rough: 1 }), 0, -0.32, 0, false);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    const room = new THREE.Group();
    const objects = new THREE.Group();
    const agentsGroup = new THREE.Group();
    const ghostGroup = new THREE.Group();
    scene.add(room, objects, agentsGroup, ghostGroup);

    let walls: { obj: THREE.Group; normal: THREE.Vector3; center: THREE.Vector3 }[] = [];
    let windowPanes: { mesh: THREE.Mesh; walkers: THREE.Mesh[] }[] = [];
    let dirt: THREE.Mesh[] = [];
    const dirtMat = new THREE.MeshBasicMaterial({ color: 0x3b2a1a, transparent: true, opacity: 0, depthWrite: false });
    const skyMat = new THREE.MeshBasicMaterial({ color: 0x9fd0f2 });

    const items = new Map<number, ItemVis>();
    const agents = new Map<string, AgentVis>();
    let builtKey = '';
    let fittedFor = '';

    const fit = (r: RestaurantState) => {
      const w = r.layout.width;
      const h = r.layout.height;
      const target = new THREE.Vector3(w / 2 - 0.5, 0, h / 2 - 0.5);
      const dist = narrow() ? 30 : 31;
      camera.position.set(target.x + dist * 0.62, dist * 0.72, target.z + dist * 0.62);
      controls.target.copy(target);
      controls.update();
      fittedFor = `${r.id}`;
    };

    // --- Terem építése --------------------------------------------------------------
    const buildRoom = (r: RestaurantState) => {
      room.clear();
      walls = [];
      windowPanes = [];
      dirt = [];
      const W = r.layout.width;
      const H = r.layout.height;
      const tex = floorTexture(r.style.floor);
      tex.repeat.set(W, H);
      const floor = mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ map: tex, roughness: r.style.floor === 'marble' ? 0.35 : 0.75 }), W / 2 - 0.5, 0, H / 2 - 0.5, false);
      floor.rotation.x = -Math.PI / 2;
      floor.name = 'floor';
      room.add(floor);
      room.add(mesh(box(W + 0.3, 0.3, H + 0.3), mat(0x4a3423), W / 2 - 0.5, -0.155, H / 2 - 0.5, false));

      // Bejárati szőnyeg.
      const rug = mesh(box(0.9, 0.012, 0.9), mat(PAL.burgundy, { rough: 1 }), r.layout.entrance.x, 0.006, r.layout.entrance.y, false);
      room.add(rug);
      room.add(mesh(box(0.7, 0.014, 0.7), mat(PAL.gold, { rough: 1 }), r.layout.entrance.x, 0.007, r.layout.entrance.y, false));

      // Piszokfoltok a padlón (átlátszóságuk a tisztaságtól függ).
      let seed = r.id * 7919;
      const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
      for (let i = 0; i < 34; i++) {
        const d = mesh(new THREE.CircleGeometry(0.08 + rnd() * 0.12, 10), dirtMat, rnd() * (W - 1), 0.004 + i * 0.0001, rnd() * (H - 1), false);
        d.rotation.x = -Math.PI / 2;
        room.add(d);
        dirt.push(d);
      }

      const colors = WALL_COLORS[r.style.wall];
      const plaster = mat(0xe9edf2, { rough: 0.95 });
      const panel = mat(colors.panel, { rough: 0.7 });
      const panelDark = mat(colors.dark, { rough: 0.7 });
      const rail = mat(PAL.gold, { metal: 0.7, rough: 0.35 });
      const cap = mat(0x5b3a24, { rough: 0.8 });
      const frame = mat(0x3b2516, { rough: 0.7 });

      const makeWall = (len: number, withWindows: boolean, door: number | null) => {
        const g = new THREE.Group();
        const th = 0.12;
        g.add(mesh(box(len, WALL_H, th), plaster, len / 2, WALL_H / 2, 0));
        g.add(mesh(box(len, 0.95, th + 0.02), panelDark, len / 2, 0.475, 0.01));
        for (let x = 0.15; x < len - 0.3; x += 1) g.add(mesh(box(0.7, 0.6, 0.02), panel, x + 0.35, 0.47, th / 2 + 0.02, false));
        g.add(mesh(box(len, 0.06, th + 0.05), rail, len / 2, 0.97, 0.02));
        g.add(mesh(box(len + 0.12, 0.12, th + 0.12), cap, len / 2, WALL_H + 0.06, 0));
        if (withWindows) {
          for (let x = 2; x < len - 1; x += 4) {
            g.add(mesh(box(1.3, 1.25, 0.06), frame, x, 1.75, th / 2 + 0.03, false));
            const pane = mesh(new THREE.PlaneGeometry(1.14, 1.09), skyMat, x, 1.75, th / 2 + 0.065, false);
            const walkers: THREE.Mesh[] = [];
            for (let k = 0; k < 2; k++) {
              const w = mesh(new THREE.PlaneGeometry(0.12, 0.42), new THREE.MeshBasicMaterial({ color: 0x1f2937, transparent: true, opacity: 0.55 }), 0, -0.3, 0.002, false);
              pane.add(w);
              walkers.push(w);
            }
            g.add(pane);
            windowPanes.push({ mesh: pane, walkers });
            g.add(mesh(box(0.05, 1.1, 0.03), frame, x, 1.75, th / 2 + 0.08, false));
            g.add(mesh(box(1.15, 0.05, 0.03), frame, x, 1.9, th / 2 + 0.08, false));
            g.add(mesh(box(1.45, 0.06, 0.16), rail, x, 1.1, th / 2 + 0.06, false));
            // Fali lámpa.
            if (x + 2 < len - 0.6) {
              g.add(mesh(box(0.06, 0.2, 0.06), rail, x + 2, 1.7, th / 2 + 0.05, false));
              const bulb = mesh(sphere(0.07, 8), mat(0xfff3c4, { emissive: 0xffd58a, emissiveIntensity: 0.6 }), x + 2, 1.84, th / 2 + 0.1, false);
              bulb.name = 'sconce';
              g.add(bulb);
            }
          }
        }
        if (door !== null) {
          g.add(mesh(box(1.1, 2.15, 0.08), frame, door, 1.075, th / 2 + 0.02, false));
          g.add(mesh(box(0.9, 2.0, 0.05), mat(0x1f3b2f, { rough: 0.6 }), door, 1.0, th / 2 + 0.05, false));
          g.add(mesh(box(0.66, 0.9, 0.02), mat(0xbfd7ea, { rough: 0.1, opacity: 0.8 }), door, 1.45, th / 2 + 0.08, false));
          g.add(mesh(sphere(0.04, 6), rail, door + 0.32, 1.0, th / 2 + 0.1, false));
          g.add(mesh(box(1.3, 0.12, 0.14), rail, door, 2.2, th / 2 + 0.05, false));
        } else {
          // Festmények.
          for (const x of [Math.min(2, len / 3), Math.max(len - 3, len * 0.66)]) {
            g.add(mesh(box(1.0, 0.75, 0.05), rail, x, 1.8, th / 2 + 0.03, false));
            g.add(mesh(box(0.88, 0.63, 0.02), mat(0x14324f), x, 1.8, th / 2 + 0.06, false));
            g.add(mesh(box(0.88, 0.25, 0.021), mat(0x2f6b4f), x, 1.6, th / 2 + 0.065, false));
            g.add(mesh(sphere(0.08, 8), mat(0xd4af37, { emissive: 0x7a5a10, emissiveIntensity: 0.3 }), x + 0.2, 1.95, th / 2 + 0.07, false));
          }
        }
        return g;
      };

      // Hátsó (−z), bal (−x), első (+z) és jobb (+x) fal; mindig csak a kamerától távoli kettő látszik.
      const back = makeWall(W, true, null);
      back.position.set(-0.5, 0, -0.5 - 0.06);
      room.add(back);
      walls.push({ obj: back, normal: new THREE.Vector3(0, 0, -1), center: new THREE.Vector3(W / 2 - 0.5, 0, -0.5) });

      const left = makeWall(H, false, r.layout.entrance.y + 0.5);
      left.rotation.y = -Math.PI / 2;
      left.position.set(-0.5 - 0.06, 0, -0.5);
      room.add(left);
      walls.push({ obj: left, normal: new THREE.Vector3(-1, 0, 0), center: new THREE.Vector3(-0.5, 0, H / 2 - 0.5) });

      const front = makeWall(W, true, null);
      front.rotation.y = Math.PI;
      front.position.set(W - 0.5, 0, H - 0.5 + 0.06);
      room.add(front);
      walls.push({ obj: front, normal: new THREE.Vector3(0, 0, 1), center: new THREE.Vector3(W / 2 - 0.5, 0, H - 0.5) });

      const right = makeWall(H, false, null);
      right.rotation.y = Math.PI / 2;
      right.position.set(W - 0.5 + 0.06, 0, H - 0.5);
      room.add(right);
      walls.push({ obj: right, normal: new THREE.Vector3(1, 0, 0), center: new THREE.Vector3(W - 0.5, 0, H / 2 - 0.5) });

      // A falak árnyékot vetnek és fogadnak.
      room.traverse((o) => {
        if ((o as THREE.Mesh).isMesh && o.name !== 'floor') o.receiveShadow = true;
      });

      // Napfény-árnyékkamera a teremre.
      const sc = sun.shadow.camera as THREE.OrthographicCamera;
      const span = Math.max(W, H) * 0.8;
      sc.left = -span;
      sc.right = span;
      sc.top = span;
      sc.bottom = -span;
      sc.near = 1;
      sc.far = 80;
      sc.updateProjectionMatrix();
      sun.target.position.set(W / 2 - 0.5, 0, H / 2 - 0.5);
    };

    const buildItems = (r: RestaurantState) => {
      for (const v of items.values()) {
        objects.remove(v.obj, v.extra);
        if (v.light) objects.remove(v.light);
      }
      items.clear();
      let lights = 0;
      for (const it of r.layout.items) {
        const obj = makeItem(it.kind);
        obj.position.set(it.x, 0, it.y);
        obj.rotation.y = facingAngle(r, it);
        objects.add(obj);
        const extra = new THREE.Group();
        extra.position.set(it.x, 0, it.y);
        objects.add(extra);
        let light: THREE.PointLight | null = null;
        if ((it.kind === 'lamp' || it.kind === 'table') && lights < 8) {
          light = new THREE.PointLight(0xffc477, 0, it.kind === 'lamp' ? 4.5 : 2.2, 1.6);
          light.position.set(it.x, it.kind === 'lamp' ? 1.5 : 1.0, it.y);
          objects.add(light);
          lights++;
        }
        items.set(it.id, { item: it, obj, extra, light });
      }
    };

    // --- Szereplők -------------------------------------------------------------------
    const syncAgent = (key: string, look: ReturnType<typeof guestLook>, x: number, z: number, dt: number): AgentVis => {
      let v = agents.get(key);
      if (!v) {
        const rig = makePerson(look);
        agentsGroup.add(rig.root);
        const bubble = new THREE.Sprite(bubbleMaterial('order', OK));
        bubble.scale.set(0.42, 0.42, 1);
        bubble.position.y = 1.65;
        bubble.visible = false;
        bubble.renderOrder = 10;
        rig.root.add(bubble);
        v = { rig, x, z, phase: 0, angle: 0, bubble };
        agents.set(key, v);
      }
      const k = 1 - Math.exp(-dt / 70);
      const ox = v.x;
      const oz = v.z;
      if (Math.abs(v.x - x) + Math.abs(v.z - z) > 3) {
        v.x = x;
        v.z = z;
      } else {
        v.x += (x - v.x) * k;
        v.z += (z - v.z) * k;
      }
      const dx = v.x - ox;
      const dz = v.z - oz;
      const moved = Math.hypot(dx, dz);
      v.phase += moved * 9;
      if (moved > 0.0015) {
        const want = Math.atan2(dx, dz);
        let diff = want - v.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        v.angle += diff * Math.min(1, dt / 90);
      }
      v.rig.root.position.set(v.x, 0, v.z);
      v.rig.root.rotation.y = v.angle;
      return v;
    };

    // --- Lebegő szövegek (DOM) ------------------------------------------------------
    interface Floater {
      el: HTMLDivElement;
      pos: THREE.Vector3;
      born: number;
    }
    const floaters: Floater[] = [];
    const addFloater = (text: string, at: { x: number; y: number }, kind: 'money' | 'happy' | 'angry' | 'talk', lift = 1.8) => {
      if (floaters.length > 24) return;
      const d = document.createElement('div');
      d.className = `floater ${kind}`;
      d.textContent = text;
      ov.appendChild(d);
      floaters.push({ el: d, pos: new THREE.Vector3(at.x, lift, at.y), born: performance.now() });
    };
    const onFx = (e: FxEvent) => {
      const gs = useApp.getState().game;
      if (!gs || e.restaurant !== gs.active) return;
      const region = nameRegion(activeRestaurant(gs).neighborhood);
      const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]!;
      if (e.kind === 'pay') {
        addFloater(`+${money(e.amount)}`, e.at, 'money', 1.5);
        if (e.stars >= 3.6 && Math.random() < 0.6) addFloater(`${pick(PHRASES[region].happy)} ★`, { x: e.at.x + 0.3, y: e.at.y }, 'happy', 2.1);
        else if (e.stars < 2.2 && Math.random() < 0.6) addFloater(pick(PHRASES[region].angry), e.at, 'angry', 2.1);
      } else if (e.kind === 'angry') {
        if (Math.random() < 0.7) addFloater(pick(PHRASES[region].angry), e.at, 'angry', 1.9);
      } else if (e.kind === 'arrive' && Math.random() < 0.18) {
        addFloater(pick(PHRASES[region].greet), e.at, 'talk', 1.9);
      }
    };
    setFxListener(onFx);

    // --- Építési előnézet ------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hover = { x: -99, y: -99, inside: false, mouse: false };
    const tileHi = mesh(new THREE.PlaneGeometry(0.96, 0.96), new THREE.MeshBasicMaterial({ color: OK, transparent: true, opacity: 0.35, depthWrite: false }), 0, 0.01, 0, false);
    tileHi.rotation.x = -Math.PI / 2;
    ghostGroup.add(tileHi);
    let ghostKind: ItemKind | null = null;
    let ghostObj: THREE.Group | null = null;
    let ghostBad: boolean | null = null;
    const ghostMats = new Map<THREE.Material, THREE.MeshStandardMaterial>();
    const tintGhost = (obj: THREE.Group, bad: boolean) => {
      obj.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const base = (m.userData.base as THREE.MeshStandardMaterial | undefined) ?? (m.material as THREE.MeshStandardMaterial);
        m.userData.base = base;
        const key = base;
        let g = ghostMats.get(key);
        if (!g) {
          g = base.clone();
          g.transparent = true;
          g.opacity = 0.55;
          g.depthWrite = false;
          ghostMats.set(key, g);
        }
        const gm = g.clone();
        gm.color.lerp(new THREE.Color(bad ? BAD : OK), bad ? 0.7 : 0.25);
        m.material = gm;
        m.castShadow = false;
      });
    };

    const pickTile = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const p = new THREE.Vector3();
      if (!raycaster.ray.intersectPlane(floorPlane, p)) return null;
      return { x: Math.round(p.x), y: Math.round(p.z) };
    };

    const act = (clientX: number, clientY: number) => {
      const st = useApp.getState();
      if (!st.tool || !st.game) return;
      const p = pickTile(clientX, clientY);
      if (!p) return;
      const r = activeRestaurant(st.game);
      if (st.tool === 'remove') {
        const it = itemAt(r.layout, p);
        if (it) st.dispatch({ type: 'remove', id: it.id });
      } else {
        st.dispatch({ type: 'place', kind: st.tool as ItemKind, x: p.x, y: p.y });
      }
    };

    // --- Bemenet: koppintás felismerése ---------------------------------------------
    const canvas = renderer.domElement;
    let down: { x: number; y: number; t: number; id: number; button: number } | null = null;
    let pointersDown = 0;
    const onDown = (ev: PointerEvent) => {
      pointersDown++;
      hover.mouse = ev.pointerType === 'mouse';
      down = pointersDown === 1 ? { x: ev.clientX, y: ev.clientY, t: performance.now(), id: ev.pointerId, button: ev.button } : null;
    };
    const onUp = (ev: PointerEvent) => {
      pointersDown = Math.max(0, pointersDown - 1);
      if (down && down.id === ev.pointerId && down.button === 0) {
        const moved = Math.hypot(ev.clientX - down.x, ev.clientY - down.y);
        if (moved < 8 && performance.now() - down.t < 450) act(ev.clientX, ev.clientY);
      }
      down = null;
    };
    const onMove = (ev: PointerEvent) => {
      hover.mouse = ev.pointerType === 'mouse';
      hover.inside = true;
      const p = pickTile(ev.clientX, ev.clientY);
      if (p) {
        hover.x = p.x;
        hover.y = p.y;
      }
    };
    const onLeave = () => {
      hover.inside = false;
      pointersDown = 0;
    };
    const onContext = (ev: MouseEvent) => ev.preventDefault();
    const onRefit = () => {
      fittedFor = '';
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onLeave);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('contextmenu', onContext);
    window.addEventListener('etterem:refit', onRefit);

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    });
    ro.observe(el);

    // --- Képkocka ---------------------------------------------------------------------
    let last = performance.now();
    let raf = 0;
    const tmp = new THREE.Vector3();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(100, now - last);
      last = now;
      const st = useApp.getState();
      const gs = st.game;
      if (!gs) return;
      const r = activeRestaurant(gs);
      const key = `${r.id}|${r.layout.gridVersion}|${r.style.floor}|${r.style.wall}|${gs.restaurants.length}`;
      if (key !== builtKey) {
        if (!builtKey.startsWith(`${r.id}|`)) {
          for (const v of agents.values()) agentsGroup.remove(v.rig.root);
          agents.clear();
        }
        buildRoom(r);
        buildItems(r);
        builtKey = key;
      }
      if (fittedFor !== `${r.id}`) fit(r);
      controls.target.x = THREE.MathUtils.clamp(controls.target.x, 0, r.layout.width - 1);
      controls.target.z = THREE.MathUtils.clamp(controls.target.z, 0, r.layout.height - 1);
      controls.target.y = 0;
      controls.update();

      // Falak: csak a kamerától távoli oldalak látszanak.
      for (const w of walls) {
        tmp.copy(camera.position).sub(w.center);
        w.obj.visible = tmp.dot(w.normal) < 0;
      }

      // Napszak.
      const hour = B.time.openHour + gs.time / 3600;
      const sky = skyColors(hour);
      skyMat.color.copy(sky.sky);
      sun.intensity = sky.sun;
      hemi.intensity = sky.hemi;
      warm.intensity = sky.evening * 0.35;
      const sunAngle = ((hour - 10) / 12) * Math.PI;
      sun.position.set(r.layout.width / 2 + Math.cos(sunAngle) * 18, 14 + Math.sin(sunAngle) * 6, -10);
      for (const p of windowPanes) {
        p.walkers.forEach((w, i) => {
          const speed = 0.00012 + i * 0.00005;
          const ph = ((now * speed + i * 0.43 + p.mesh.position.x * 0.1) % 1.4) - 0.7;
          w.position.x = ph * (i % 2 ? -1 : 1);
          (w.material as THREE.MeshBasicMaterial).opacity = hour < 20.5 ? 0.5 : 0.25;
        });
      }
      dirtMat.opacity = Math.max(0, (1 - r.cleanliness) * 0.75 - 0.05);

      // Berendezés állapota.
      const byTable = new Map<number, Group>();
      for (const g of r.groups) if (g.tableId !== null) byTable.set(g.tableId, g);
      const ready = r.tickets.filter((x) => x.state === 'ready').reduce((a, x) => a + x.dishes.length, 0);
      for (const v of items.values()) {
        if (v.light) v.light.intensity = sky.evening * (v.item.kind === 'lamp' ? 3.2 : 0.9);
        const flame = v.obj.getObjectByName('flame');
        if (flame) flame.scale.y = 1.6 + Math.sin(now / 90 + v.item.id) * 0.25;
        if (v.item.kind === 'aquarium') {
          for (let i = 0; i < 4; i++) {
            const f = v.obj.getObjectByName(`fish${i}`);
            if (f) {
              f.position.x = Math.sin(now / (900 + i * 170) + i) * 0.32;
              f.rotation.y = Math.cos(now / (900 + i * 170) + i) > 0 ? 0 : Math.PI;
            }
          }
        }
        const ex = v.extra;
        const want = (() => {
          if (v.item.kind === 'table') {
            const g = byTable.get(v.item.id);
            if (g && (g.phase === 'eating' || g.phase === 'waitPay' || g.phase === 'paying')) {
              const tk = r.tickets.find((x) => x.id === g.ticketId);
              return `t${tk ? tk.dishes.length : g.members.length}${g.phase === 'eating' ? 'f' : 'e'}`;
            }
            return '';
          }
          if (v.item.kind === 'stove') {
            const chef = r.staff.find((x) => x.stoveId === v.item.id);
            return chef && chef.cooking.length ? `s${chef.cooking.length}` : '';
          }
          if (v.item.kind === 'counter') return ready ? `c${Math.min(6, ready)}` : '';
          return '';
        })();
        if (ex.userData.state !== want) {
          ex.clear();
          ex.userData.state = want;
          if (want.startsWith('t')) {
            const n = Math.min(4, Number(want.slice(1, -1)));
            const full = want.endsWith('f');
            const spots = [[-0.22, 0], [0.22, 0], [0, -0.22], [0, 0.22]] as const;
            for (let i = 0; i < n; i++) {
              const p = makePlate(FOODS[(v.item.id + i) % FOODS.length]!);
              p.position.set(spots[i]![0], 0.8, spots[i]![1]);
              const food = p.getObjectByName('food');
              if (food && !full) food.visible = false;
              ex.add(p);
            }
          } else if (want.startsWith('s')) {
            const n = Math.min(3, Number(want.slice(1)));
            const spots = [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18]] as const;
            for (let i = 0; i < n; i++) {
              const pot = makePot();
              pot.position.set(spots[i]![0], 0.92, spots[i]![1]);
              ex.add(pot);
              for (let k = 0; k < 3; k++) {
                const puff = mesh(sphere(0.05, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false }), spots[i]![0], 1.1, spots[i]![1], false);
                puff.userData.puff = k / 3 + i * 0.27;
                ex.add(puff);
              }
            }
            ex.rotation.y = v.obj.rotation.y;
          } else if (want.startsWith('c')) {
            const n = Number(want.slice(1));
            for (let i = 0; i < n; i++) {
              const p = makePlate(FOODS[i % FOODS.length]!);
              p.position.set(-0.3 + (i % 3) * 0.3, 0.96, -0.15 + Math.floor(i / 3) * 0.3);
              ex.add(p);
            }
            ex.rotation.y = v.obj.rotation.y;
          }
        }
        for (const o of ex.children) {
          if (o.userData.puff !== undefined) {
            const ph = (now / 1400 + (o.userData.puff as number)) % 1;
            o.position.y = 1.02 + ph * 0.6;
            o.scale.setScalar(0.6 + ph * 1.4);
            ((o as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - ph);
          }
        }
      }

      // Szereplők.
      const seen = new Set<string>();
      for (const s of r.staff) {
        if (s.trainingDay === gs.day) continue;
        const k = `s${s.id}`;
        seen.add(k);
        const v = syncAgent(k, staffLook(s.id, s.role), s.agent.pos.x, s.agent.pos.y, dt);
        const walking = Math.hypot(s.agent.pos.x - v.x, s.agent.pos.y - v.z) > 0.02 || (s.agent.goal !== null && s.agent.pathPos < s.agent.path.length - 1);
        const carrying = s.role === 'waiter' && s.task?.kind === 'serve' && s.task.stage !== 'toCounter';
        posePerson(v.rig, walking ? 'walk' : 'stand', v.phase, now, { carrying, cleaning: s.role === 'cleaner' && s.cleanTimer > 0 });
        v.bubble.visible = false;
      }
      for (const g of r.groups) {
        const seated = SEATED.includes(g.phase);
        const table = g.tableId !== null ? r.layout.items.find((i) => i.id === g.tableId) : undefined;
        g.members.forEach((m, i) => {
          const k = `g${g.id}:${i}`;
          seen.add(k);
          const v = syncAgent(k, guestLook(g.id * 8 + i), m.agent.pos.x, m.agent.pos.y, dt);
          const atSeat = seated && Math.abs(m.agent.pos.x - v.x) + Math.abs(m.agent.pos.y - v.z) < 0.05;
          const walking = !atSeat && (Math.hypot(m.agent.pos.x - v.x, m.agent.pos.y - v.z) > 0.02 || (m.agent.goal !== null && m.agent.pathPos < m.agent.path.length - 1));
          if (atSeat && table) {
            v.angle = Math.atan2(table.x - m.agent.pos.x, table.y - m.agent.pos.y);
            v.rig.root.rotation.y = v.angle;
            // A széken kicsit hátrébb ül, az asztaltól távolabb.
            v.rig.root.position.x -= Math.sin(v.angle) * 0.08;
            v.rig.root.position.z -= Math.cos(v.angle) * 0.08;
          }
          posePerson(v.rig, atSeat ? 'sit' : walking ? 'walk' : 'stand', v.phase, now + i * 300, { eating: g.phase === 'eating' });
          const kind = BUBBLE_KIND[g.phase];
          v.bubble.visible = i === 0 && !!kind;
          if (kind && i === 0) {
            v.bubble.material = bubbleMaterial(kind, patienceColor(g));
            v.bubble.position.y = atSeat ? 1.45 : 1.65;
          }
        });
      }
      for (const [k, v] of agents) {
        if (!seen.has(k)) {
          agentsGroup.remove(v.rig.root);
          agents.delete(k);
        }
      }

      // Építési előnézet.
      const tool = st.tool;
      const inRoom = hover.x >= 0 && hover.y >= 0 && hover.x < r.layout.width && hover.y < r.layout.height;
      const showGhost = !!tool && hover.inside && hover.mouse && inRoom;
      tileHi.visible = showGhost;
      if (showGhost) {
        tileHi.position.set(hover.x, 0.012, hover.y);
        let bad = false;
        if (tool === 'remove') {
          bad = !!itemAt(r.layout, hover);
          (tileHi.material as THREE.MeshBasicMaterial).color.setHex(bad ? BAD : 0xffffff);
        } else {
          bad = !!(canPlace(r.layout, tool, hover) ?? (gs.cash < ITEMS[tool].price ? 'noMoney' : null));
          (tileHi.material as THREE.MeshBasicMaterial).color.setHex(bad ? BAD : OK);
        }
        if (tool !== 'remove') {
          if (ghostKind !== tool || ghostBad !== bad) {
            if (ghostObj) ghostGroup.remove(ghostObj);
            ghostObj = makeItem(tool);
            tintGhost(ghostObj, bad);
            ghostGroup.add(ghostObj);
            ghostKind = tool;
            ghostBad = bad;
          }
          ghostObj!.visible = true;
          ghostObj!.position.set(hover.x, 0, hover.y);
          ghostObj!.rotation.y = facingAngle(r, { id: -1, kind: tool, x: hover.x, y: hover.y, rot: 0 });
        } else if (ghostObj) ghostObj.visible = false;
      } else if (ghostObj) ghostObj.visible = false;

      renderer.render(scene, camera);

      // Lebegő szövegek a kép fölött.
      const w = el.clientWidth;
      const h = el.clientHeight;
      for (let i = floaters.length - 1; i >= 0; i--) {
        const f = floaters[i]!;
        const age = (now - f.born) / 1800;
        if (age >= 1) {
          f.el.remove();
          floaters.splice(i, 1);
          continue;
        }
        tmp.copy(f.pos);
        tmp.y += age * 0.6;
        tmp.project(camera);
        f.el.style.transform = `translate(${((tmp.x + 1) / 2) * w}px, ${((1 - tmp.y) / 2) * h}px) translate(-50%, -50%)`;
        f.el.style.opacity = String(age < 0.15 ? age / 0.15 : 1 - Math.max(0, age - 0.6) / 0.4);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      setFxListener(null);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onLeave);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('contextmenu', onContext);
      window.removeEventListener('etterem:refit', onRefit);
      for (const f of floaters) f.el.remove();
      controls.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return (
    <div className="iso-host">
      <div ref={host} className="scene-host" />
      <div ref={overlay} className="floaters" aria-hidden="true" />
      <span className="sr-only">{t('app.title')}</span>
    </div>
  );
}

export type { GameState };
