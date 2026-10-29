// Izometrikus játéktér PixiJS-szel. Csak olvassa a játékállapotot; módosítani parancsokkal lehet.
// Egér: bal gomb lerak, jobb/középső gomb vagy eszköz nélküli húzás mozgat, görgő nagyít.
// Érintés: koppintás lerak, egy ujj mozgat, két ujj nagyít.

import { useEffect, useRef } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import { ITEMS, type ItemKind } from '../data/content';
import { B } from '../sim/formulas';
import { canPlace, chairTable, itemAt } from '../sim/grid';
import type { GameState, Group, PlacedItem } from '../sim/types';
import { useApp } from '../store';
import {
  P,
  TH,
  TW,
  WALL_H,
  drawBubble,
  drawChairBack,
  drawChairSeat,
  drawCounter,
  drawCounterPlates,
  drawFloorTile,
  drawPerson,
  drawPots,
  drawStove,
  drawTable,
  drawTablePlates,
  drawWalls,
  drawWindows,
  eveningAmount,
  guestLook,
  iso,
  staffLook,
  type BubbleKind,
  type Look,
} from './art';

const BG = 0xdfe5ec;
const OK = 0x059669;
const WARN = 0xd97706;
const BAD = 0xb91c1c;

function screenToTile(wx: number, wy: number): { x: number; y: number } {
  const a = wx / (TW / 2);
  const b = wy / (TH / 2);
  return { x: Math.round((a + b) / 2), y: Math.round((b - a) / 2) };
}

function drawItemBody(g: Graphics, it: Pick<PlacedItem, 'kind' | 'x' | 'y'>, gs: GameState | null, alpha = 1, tint?: number): void {
  switch (it.kind) {
    case 'table':
      drawTable(g, alpha, tint);
      break;
    case 'chair': {
      const d = chairDir(it, gs);
      if (d.backBehind) drawChairBack(g, d.dx, d.dy, alpha, tint);
      drawChairSeat(g, alpha, tint);
      break;
    }
    case 'stove':
      drawStove(g, alpha, tint);
      break;
    case 'counter':
      drawCounter(g, alpha, tint);
      break;
  }
}

/** A szék iránya: (dx, dy) az asztaltól a szék felé; a támla a vendég mögött van. */
function chairDir(it: Pick<PlacedItem, 'x' | 'y'>, gs: GameState | null): { dx: number; dy: number; backBehind: boolean } {
  const table = gs ? chairTable(gs.restaurant, { ...it, id: -1, kind: 'chair', rot: 0 }) : undefined;
  const dx = table ? it.x - table.x : 0;
  const dy = table ? it.y - table.y : -1;
  // A képernyőn felfelé (hátrafelé) eső támla a vendég mögé kerül, a lefelé eső elé.
  return { dx, dy, backBehind: dx + dy < 0 };
}

function patienceColor(g: Group): number {
  const p = B.patience;
  const limit = g.phase === 'queue' ? p.seatMinutes : g.phase === 'waitOrder' ? p.orderMinutes : g.phase === 'waitFood' ? p.foodMinutes : p.payMinutes;
  const f = g.phaseTime / (limit * 60);
  return f < 0.5 ? OK : f < 0.8 ? WARN : BAD;
}

const BUBBLE: Partial<Record<Group['phase'], BubbleKind>> = { queue: 'queue', waitOrder: 'order', waitFood: 'food', waitPay: 'pay' };
const SEATED: Group['phase'][] = ['waitOrder', 'ordering', 'waitFood', 'eating', 'waitPay', 'paying'];

interface Visual {
  c: Container;
  body: Graphics;
  badge: Graphics;
  x: number;
  y: number;
  phase: number;
  facing: number;
  look: Look;
}

export function IsoView() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let destroyed = false;
    let ready = false;
    const app = new Application();
    const cleanups: (() => void)[] = [];

    void (async () => {
      await app.init({ resizeTo: el, background: BG, antialias: true, autoDensity: true, resolution: Math.min(2, window.devicePixelRatio || 1) });
      ready = true;
      if (destroyed) {
        app.destroy(true, { children: true });
        return;
      }
      el.appendChild(app.canvas);

      const world = new Container();
      app.stage.addChild(world);
      const floor = new Graphics();
      const windows = new Graphics();
      const objects = new Container();
      objects.sortableChildren = true;
      const dusk = new Graphics();
      const ghostLayer = new Container();
      const ghost = new Graphics();
      const ghostItem = new Graphics();
      ghostLayer.addChild(ghost, ghostItem);
      world.addChild(floor, windows, objects, dusk, ghostLayer);

      const items = new Map<number, { body: Graphics; front: Graphics | null; extra: Graphics; item: PlacedItem }>();
      const agents = new Map<string, Visual>();
      let builtFor = -1;
      let builtGame: GameState | null = null;
      let lastWindowHour = -1;
      let lastDusk = -1;

      let zoom = 1;
      let userMoved = false;
      let fittedFor = '';
      const hover = { x: -99, y: -99, inside: false, mouse: false };

      const fit = (gs: GameState) => {
        const r = gs.restaurant;
        const narrow = app.screen.width < 900;
        const left = narrow ? 8 : 248;
        const right = narrow ? 8 : 384;
        const top = narrow ? 104 : 84;
        const bottom = narrow ? 84 : 16;
        const availW = Math.max(200, app.screen.width - left - right);
        const availH = Math.max(200, app.screen.height - top - bottom);
        const span = ((r.width + r.height) * TW) / 2;
        const tall = ((r.width + r.height) * TH) / 2 + WALL_H;
        const fitW = availW / span;
        const fitH = availH / tall;
        // Telefonon nagyobbra nagyítunk, mint a teljes szélesség: a terem széle húzással elérhető.
        zoom = narrow ? Math.max(0.3, Math.min(1.6, fitH, fitW * 1.5)) : Math.max(0.3, Math.min(1.6, fitW, fitH));
        world.scale.set(zoom);
        const c = iso(r.width / 2 - 0.5, r.height / 2 - 0.5);
        world.position.set(left + availW / 2 - c.x * zoom, top + availH / 2 - c.y * zoom + (WALL_H * zoom) / 2);
        fittedFor = `${app.screen.width}x${app.screen.height}`;
      };

      const buildStatic = (gs: GameState) => {
        const r = gs.restaurant;
        floor.clear();
        drawWalls(floor, { width: r.width, height: r.height, doorY: r.entrance.y });
        for (let y = 0; y < r.height; y++) for (let x = 0; x < r.width; x++) drawFloorTile(floor, x, y);
        // Lábtörlő a bejáratnál.
        const e = iso(r.entrance.x, r.entrance.y);
        floor.poly([e.x, e.y - TH / 2 + 5, e.x + TW / 2 - 9, e.y, e.x, e.y + TH / 2 - 5, e.x - TW / 2 + 9, e.y]).fill({ color: 0x7f1d3a, alpha: 0.85 });
        floor.poly([e.x, e.y - TH / 2 + 9, e.x + TW / 2 - 17, e.y, e.x, e.y + TH / 2 - 9, e.x - TW / 2 + 17, e.y]).stroke({ width: 1, color: P.gold, alpha: 0.8 });

        for (const v of items.values()) {
          v.body.destroy();
          v.front?.destroy();
          v.extra.destroy();
        }
        items.clear();
        for (const it of r.items) {
          const p = iso(it.x, it.y);
          const z = (it.x + it.y) * 10;
          const body = new Graphics();
          drawItemBody(body, it, gs);
          body.position.set(p.x, p.y);
          body.zIndex = z;
          objects.addChild(body);
          let front: Graphics | null = null;
          if (it.kind === 'chair') {
            const d = chairDir(it, gs);
            if (!d.backBehind) {
              front = new Graphics();
              drawChairBack(front, d.dx, d.dy);
              front.position.set(p.x, p.y);
              front.zIndex = z + 6;
              objects.addChild(front);
            }
          }
          const extra = new Graphics();
          extra.position.set(p.x, p.y);
          extra.zIndex = z + 1;
          objects.addChild(extra);
          items.set(it.id, { body, front, extra, item: it });
        }
        builtFor = r.gridVersion;
        builtGame = gs;
        lastWindowHour = -1;
        lastDusk = -1;
      };

      const syncAgent = (keyName: string, look: Look, x: number, y: number, dt: number): Visual => {
        let v = agents.get(keyName);
        if (!v) {
          const c = new Container();
          const body = new Graphics();
          const badge = new Graphics();
          c.addChild(body, badge);
          objects.addChild(c);
          v = { c, body, badge, x, y, phase: 0, facing: 1, look };
          agents.set(keyName, v);
        }
        const k = 1 - Math.exp(-dt / 70);
        const ox = v.x;
        const oy = v.y;
        if (Math.abs(v.x - x) + Math.abs(v.y - y) > 3) {
          v.x = x;
          v.y = y;
        } else {
          v.x += (x - v.x) * k;
          v.y += (y - v.y) * k;
        }
        const mdx = v.x - ox;
        const mdy = v.y - oy;
        v.phase += Math.hypot(mdx, mdy) * 14;
        const sdx = mdx - mdy;
        if (Math.abs(sdx) > 0.002) v.facing = sdx > 0 ? 1 : -1;
        const p = iso(v.x, v.y);
        v.c.position.set(p.x, p.y);
        v.c.zIndex = (v.x + v.y) * 10 + 5;
        return v;
      };

      app.ticker.add((ticker) => {
        const st = useApp.getState();
        const gs = st.game;
        if (!gs) return;
        if (!userMoved && fittedFor !== `${app.screen.width}x${app.screen.height}`) fit(gs);
        if (builtFor !== gs.restaurant.gridVersion || builtGame !== gs) buildStatic(gs);
        const dt = ticker.deltaMS;
        const now = performance.now();
        const hour = B.time.openHour + gs.time / 3600;
        const r = gs.restaurant;

        // Ablakok és esti fény, ritkán frissítve.
        const hq = Math.round(hour * 12) / 12;
        if (hq !== lastWindowHour) {
          windows.clear();
          drawWindows(windows, r.width, hour);
          lastWindowHour = hq;
        }
        const ev = Math.round(eveningAmount(hour) * 40) / 40;
        if (ev !== lastDusk) {
          dusk.clear();
          if (ev > 0) {
            const a = iso(-0.5, -0.5);
            const b2 = iso(r.width - 0.5, -0.5);
            const c2 = iso(r.width - 0.5, r.height - 0.5);
            const d2 = iso(-0.5, r.height - 0.5);
            dusk.poly([a.x, a.y - WALL_H, b2.x, b2.y - WALL_H, b2.x, b2.y, c2.x, c2.y, d2.x, d2.y, a.x, a.y]).fill({ color: P.night, alpha: 0.16 * ev });
          }
          lastDusk = ev;
        }

        // Berendezés állapota: tányérok, fazekak, kész ételek.
        const byTable = new Map<number, Group>();
        for (const g of gs.groups) if (g.tableId !== null) byTable.set(g.tableId, g);
        const ready = gs.tickets.filter((t) => t.state === 'ready').reduce((a, t) => a + t.dishes.length, 0);
        for (const v of items.values()) {
          const g = v.extra;
          g.clear();
          if (v.item.kind === 'table') {
            if (ev > 0) g.circle(0, -27, 10).fill({ color: P.gold, alpha: 0.22 * ev });
            const grp = byTable.get(v.item.id);
            if (grp && (grp.phase === 'eating' || grp.phase === 'waitPay' || grp.phase === 'paying')) {
              const t = gs.tickets.find((x) => x.id === grp.ticketId);
              const n = t ? t.dishes.length : grp.members.length;
              const eaten = grp.phase === 'eating' ? 1 - Math.max(0, grp.eatRemaining) / (20 * 60) : 1;
              drawTablePlates(g, n, Math.max(0, Math.min(1, eaten)));
            }
          } else if (v.item.kind === 'stove') {
            const chef = gs.staff.find((s) => s.stoveId === v.item.id);
            if (chef && chef.cooking.length) drawPots(g, chef.cooking.length, now);
          } else if (v.item.kind === 'counter') {
            if (ready) drawCounterPlates(g, ready);
          }
        }

        // Szereplők.
        const seen = new Set<string>();
        for (const s of gs.staff) {
          const kname = `s${s.id}`;
          seen.add(kname);
          const v = syncAgent(kname, staffLook(s.id, s.role), s.agent.pos.x, s.agent.pos.y, dt);
          const walking = Math.hypot(s.agent.pos.x - v.x, s.agent.pos.y - v.y) > 0.02 || (s.agent.goal !== null && s.agent.pathPos < s.agent.path.length - 1);
          const carrying = s.role === 'waiter' && s.task?.kind === 'serve' && s.task.stage !== 'toCounter';
          drawPerson(v.body, v.look, { kind: walking ? 'walk' : 'stand', phase: v.phase, carrying, eating: false, time: now });
          v.body.scale.x = v.facing;
          v.badge.clear();
        }
        for (const grp of gs.groups) {
          const seated = SEATED.includes(grp.phase);
          const table = grp.tableId !== null ? r.items.find((i) => i.id === grp.tableId) : undefined;
          grp.members.forEach((m, i) => {
            const kname = `g${grp.id}:${i}`;
            seen.add(kname);
            const v = syncAgent(kname, guestLook(grp.id * 8 + i), m.agent.pos.x, m.agent.pos.y, dt);
            const atSeat = seated && Math.abs(m.agent.pos.x - v.x) + Math.abs(m.agent.pos.y - v.y) < 0.05;
            const walking =
              !atSeat && (Math.hypot(m.agent.pos.x - v.x, m.agent.pos.y - v.y) > 0.02 || (m.agent.goal !== null && m.agent.pathPos < m.agent.path.length - 1));
            if (atSeat && table) {
              const sdx = table.x - m.agent.pos.x - (table.y - m.agent.pos.y);
              v.facing = sdx >= 0 ? 1 : -1;
            }
            drawPerson(v.body, v.look, {
              kind: atSeat ? 'sit' : walking ? 'walk' : 'stand',
              phase: v.phase,
              carrying: false,
              eating: grp.phase === 'eating',
              time: now + i * 300,
            });
            v.body.scale.x = v.facing;
            v.badge.clear();
            const kind = BUBBLE[grp.phase];
            if (i === 0 && kind) drawBubble(v.badge, kind, patienceColor(grp), atSeat ? -44 : -52);
          });
        }
        for (const [k, v] of agents) {
          if (!seen.has(k)) {
            v.c.destroy({ children: true });
            agents.delete(k);
          }
        }

        // Építési előnézet (egérrel).
        ghost.clear();
        ghostItem.clear();
        const tool = st.tool;
        if (tool && hover.inside && hover.mouse && hover.x >= 0 && hover.y >= 0 && hover.x < r.width && hover.y < r.height) {
          const p = iso(hover.x, hover.y);
          const diamond = [p.x, p.y - TH / 2, p.x + TW / 2, p.y, p.x, p.y + TH / 2, p.x - TW / 2, p.y];
          if (tool === 'remove') {
            const it = itemAt(r, hover);
            ghost.poly(diamond).fill({ color: it ? BAD : 0xffffff, alpha: it ? 0.45 : 0.25 });
          } else {
            const err = canPlace(r, tool, hover) ?? (gs.cash < ITEMS[tool].price ? 'noMoney' : null);
            ghost.poly(diamond).fill({ color: err ? BAD : OK, alpha: 0.32 }).stroke({ width: 1.5, color: err ? BAD : OK, alpha: 0.8 });
            drawItemBody(ghostItem, { kind: tool, x: hover.x, y: hover.y }, gs, 0.6, err ? BAD : undefined);
            ghostItem.position.set(p.x, p.y);
          }
        }
      });

      // --- Bemenet -------------------------------------------------------------
      const canvas = app.canvas;
      canvas.style.touchAction = 'none';
      const pointers = new Map<number, { x: number; y: number }>();
      let gesture: { startX: number; startY: number; moved: boolean; button: number; pinchDist: number; pinchZoom: number; mid: { x: number; y: number } } | null = null;

      const local = (ev: { clientX: number; clientY: number }) => {
        const rect = canvas.getBoundingClientRect();
        return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
      };
      const toTile = (ev: { clientX: number; clientY: number }) => {
        const l = local(ev);
        return screenToTile((l.x - world.position.x) / zoom, (l.y - world.position.y) / zoom);
      };
      const zoomAt = (mx: number, my: number, next: number) => {
        const before = { x: (mx - world.position.x) / zoom, y: (my - world.position.y) / zoom };
        zoom = Math.max(0.3, Math.min(2.6, next));
        world.scale.set(zoom);
        world.position.set(mx - before.x * zoom, my - before.y * zoom);
        userMoved = true;
      };
      const act = (ev: { clientX: number; clientY: number }) => {
        const st = useApp.getState();
        if (!st.tool || !st.game) return;
        const p = toTile(ev);
        if (st.tool === 'remove') {
          const it = itemAt(st.game.restaurant, p);
          if (it) st.dispatch({ type: 'remove', id: it.id });
        } else {
          st.dispatch({ type: 'place', kind: st.tool as ItemKind, x: p.x, y: p.y });
        }
      };

      const onDown = (ev: PointerEvent) => {
        canvas.setPointerCapture(ev.pointerId);
        pointers.set(ev.pointerId, local(ev));
        hover.mouse = ev.pointerType === 'mouse';
        if (pointers.size === 1) {
          gesture = { startX: ev.clientX, startY: ev.clientY, moved: false, button: ev.button, pinchDist: 0, pinchZoom: zoom, mid: local(ev) };
        } else if (pointers.size === 2 && gesture) {
          const [a, b] = [...pointers.values()] as [{ x: number; y: number }, { x: number; y: number }];
          gesture.moved = true;
          gesture.pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
          gesture.pinchZoom = zoom;
          gesture.mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        }
      };
      const onMove = (ev: PointerEvent) => {
        const p = toTile(ev);
        hover.x = p.x;
        hover.y = p.y;
        hover.inside = true;
        hover.mouse = ev.pointerType === 'mouse';
        const prev = pointers.get(ev.pointerId);
        if (!prev || !gesture) return;
        const cur = local(ev);
        pointers.set(ev.pointerId, cur);
        if (pointers.size >= 2) {
          const [a, b] = [...pointers.values()] as [{ x: number; y: number }, { x: number; y: number }];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
          world.position.x += mid.x - gesture.mid.x;
          world.position.y += mid.y - gesture.mid.y;
          gesture.mid = mid;
          if (gesture.pinchDist > 0) zoomAt(mid.x, mid.y, gesture.pinchZoom * (dist / gesture.pinchDist));
          return;
        }
        if (Math.abs(ev.clientX - gesture.startX) + Math.abs(ev.clientY - gesture.startY) > 8) gesture.moved = true;
        if (gesture.moved) {
          world.position.x += cur.x - prev.x;
          world.position.y += cur.y - prev.y;
          userMoved = true;
        }
      };
      const onUp = (ev: PointerEvent) => {
        if (canvas.hasPointerCapture(ev.pointerId)) canvas.releasePointerCapture(ev.pointerId);
        pointers.delete(ev.pointerId);
        if (gesture && pointers.size === 0) {
          if (!gesture.moved && gesture.button === 0) act(ev);
          gesture = null;
        }
      };
      const onCancel = (ev: PointerEvent) => {
        pointers.delete(ev.pointerId);
        if (pointers.size === 0) gesture = null;
      };
      const onLeave = () => {
        hover.inside = false;
      };
      const onWheel = (ev: WheelEvent) => {
        ev.preventDefault();
        const l = local(ev);
        zoomAt(l.x, l.y, zoom * Math.exp(-ev.deltaY * 0.0015));
      };
      const onContext = (ev: MouseEvent) => ev.preventDefault();
      const onRefit = () => {
        userMoved = false;
        fittedFor = '';
      };

      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onCancel);
      canvas.addEventListener('pointerleave', onLeave);
      canvas.addEventListener('wheel', onWheel, { passive: false });
      canvas.addEventListener('contextmenu', onContext);
      window.addEventListener('etterem:refit', onRefit);
      cleanups.push(() => {
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointercancel', onCancel);
        canvas.removeEventListener('pointerleave', onLeave);
        canvas.removeEventListener('wheel', onWheel);
        canvas.removeEventListener('contextmenu', onContext);
        window.removeEventListener('etterem:refit', onRefit);
      });
    })();

    return () => {
      destroyed = true;
      for (const c of cleanups) c();
      if (ready) app.destroy(true, { children: true });
    };
  }, []);

  return <div ref={host} className="iso-host" />;
}
