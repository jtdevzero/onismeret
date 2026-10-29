// Izometrikus játéktér PixiJS-szel. Csak olvassa a játékállapotot; módosítani parancsokkal lehet.

import { useEffect, useRef } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import { B } from '../sim/formulas';
import { canPlace, chairTable, itemAt } from '../sim/grid';
import type { GameState, Group, PlacedItem } from '../sim/types';
import { ITEMS, type ItemKind } from '../data/content';
import { useApp } from '../store';
import { C } from './palette';

const TW = 64;
const TH = 32;
const WALL_H = 54;

function iso(x: number, y: number): { x: number; y: number } {
  return { x: ((x - y) * TW) / 2, y: ((x + y) * TH) / 2 };
}

function screenToTile(wx: number, wy: number): { x: number; y: number } {
  const a = wx / (TW / 2);
  const b = wy / (TH / 2);
  return { x: Math.round((a + b) / 2), y: Math.round((b - a) / 2) };
}

/** Hasáb a mező közepén: s = méret a mezőhöz képest, h = magasság pixelben. */
function prism(g: Graphics, ox: number, oy: number, s: number, h: number, top: number, left: number, right: number, alpha = 1): void {
  const hw = (TW / 2) * s;
  const hh = (TH / 2) * s;
  g.poly([ox - hw, oy, ox, oy + hh, ox, oy + hh - h, ox - hw, oy - h]).fill({ color: left, alpha });
  g.poly([ox + hw, oy, ox, oy + hh, ox, oy + hh - h, ox + hw, oy - h]).fill({ color: right, alpha });
  g.poly([ox, oy - hh - h, ox + hw, oy - h, ox, oy + hh - h, ox - hw, oy - h]).fill({ color: top, alpha });
}

function drawItem(g: Graphics, it: Pick<PlacedItem, 'kind' | 'x' | 'y'>, gs: GameState | null, alpha = 1, tint?: number): void {
  const pick = (c: number) => (tint === undefined ? c : tint);
  switch (it.kind) {
    case 'table':
      g.ellipse(0, 4, 20, 9).fill({ color: C.shadow, alpha: 0.12 * alpha });
      prism(g, 0, 0, 0.64, 18, pick(C.tableTop), pick(C.tableLeft), pick(C.tableRight), alpha);
      g.circle(0, -18, 2.5).fill({ color: C.candle, alpha });
      break;
    case 'chair': {
      prism(g, 0, 0, 0.36, 9, pick(C.chairTop), pick(C.chairLeft), pick(C.chairRight), alpha);
      // Háttámla az asztallal ellentétes oldalon.
      let dx = 0;
      let dy = -1;
      const table = gs ? chairTable(gs.restaurant, { ...it, id: -1, rot: 0 } as PlacedItem) : undefined;
      if (table) {
        dx = it.x - table.x;
        dy = it.y - table.y;
      }
      const off = iso(dx * 0.22, dy * 0.22);
      prism(g, off.x, off.y - 9, 0.14, 14, pick(C.chairTop), pick(C.chairLeft), pick(C.chairRight), alpha);
      break;
    }
    case 'stove':
      g.ellipse(0, 4, 24, 11).fill({ color: C.shadow, alpha: 0.12 * alpha });
      prism(g, 0, 0, 0.82, 26, pick(C.stoveTop), pick(C.stoveLeft), pick(C.stoveRight), alpha);
      for (const [bx, by] of [[-9, -26], [9, -26], [0, -31], [0, -21]] as const) g.ellipse(bx, by, 5, 2.5).fill({ color: C.burner, alpha });
      g.rect(-24, -6, 4, 3).fill({ color: C.flame, alpha });
      break;
    case 'counter':
      g.ellipse(0, 4, 24, 11).fill({ color: C.shadow, alpha: 0.12 * alpha });
      prism(g, 0, 0, 0.86, 22, pick(C.counterTop), pick(C.counterLeft), pick(C.counterRight), alpha);
      break;
  }
}

function patienceColor(g: Group): number {
  const p = B.patience;
  const limit = g.phase === 'queue' ? p.seatMinutes : g.phase === 'waitOrder' ? p.orderMinutes : g.phase === 'waitFood' ? p.foodMinutes : p.payMinutes;
  const f = g.phaseTime / (limit * 60);
  return f < 0.5 ? C.ok : f < 0.8 ? C.warn : C.bad;
}

function drawGuest(g: Graphics, color: number): void {
  g.clear();
  g.ellipse(0, 0, 9, 4.5).fill({ color: C.shadow, alpha: 0.18 });
  g.roundRect(-6, -24, 12, 22, 6).fill(color);
  g.circle(0, -29, 5.5).fill(C.skin);
}

function drawWaiter(g: Graphics): void {
  g.clear();
  g.ellipse(0, 0, 9, 4.5).fill({ color: C.shadow, alpha: 0.18 });
  g.roundRect(-6, -25, 12, 23, 6).fill(C.waiter);
  g.roundRect(-4, -16, 8, 12, 3).fill(C.apron);
  g.circle(0, -30, 5.5).fill(C.skin);
}

function drawChef(g: Graphics): void {
  g.clear();
  g.ellipse(0, 0, 9, 4.5).fill({ color: C.shadow, alpha: 0.18 });
  g.roundRect(-6, -25, 12, 23, 6).fill(C.chef).stroke({ width: 1, color: C.chefLine, alpha: 0.5 });
  g.circle(0, -30, 5.5).fill(C.skin);
  g.roundRect(-5, -43, 10, 9, 3).fill(C.chef).stroke({ width: 1, color: C.chefLine, alpha: 0.5 });
}

interface Visual {
  c: Container;
  body: Graphics;
  badge: Graphics;
  x: number;
  y: number;
  kind: string;
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
      await app.init({ resizeTo: el, background: C.bg, antialias: true, autoDensity: true, resolution: window.devicePixelRatio || 1 });
      ready = true;
      if (destroyed) {
        app.destroy(true, { children: true });
        return;
      }
      el.appendChild(app.canvas);

      const world = new Container();
      app.stage.addChild(world);
      const floor = new Graphics();
      const objects = new Container();
      objects.sortableChildren = true;
      const ghostLayer = new Container();
      const ghost = new Graphics();
      const ghostItem = new Graphics();
      ghostLayer.addChild(ghost, ghostItem);
      world.addChild(floor, objects, ghostLayer);

      const items = new Map<number, Graphics>();
      const agents = new Map<string, Visual>();
      let builtFor = -1;
      let builtGame: GameState | null = null;

      let zoom = 1;
      let fitted = false;
      const hover = { x: -99, y: -99, inside: false };

      const fit = (gs: GameState) => {
        const r = gs.restaurant;
        const c = iso(r.width / 2, r.height / 2);
        const span = ((r.width + r.height) * TW) / 2;
        // A bal oldali építősáv (≈240 px) és a jobb oldali panel (≈385 px) közötti sávba illeszt.
        const left = 240;
        const right = 385;
        const availW = Math.max(320, app.screen.width - left - right - 24);
        const availH = Math.max(240, app.screen.height - 96);
        zoom = Math.max(0.5, Math.min(1.6, availW / span, availH / (((r.width + r.height) * TH) / 2 + WALL_H)));
        if (!Number.isFinite(zoom) || zoom <= 0) zoom = 1;
        world.scale.set(zoom);
        world.position.set(left + availW / 2 - c.x * zoom, 80 + availH / 2 - c.y * zoom + (WALL_H * zoom) / 2);
        fitted = true;
      };

      const buildStatic = (gs: GameState) => {
        const r = gs.restaurant;
        floor.clear();
        for (let y = 0; y < r.height; y++) {
          for (let x = 0; x < r.width; x++) {
            const p = iso(x, y);
            floor
              .poly([p.x, p.y - TH / 2, p.x + TW / 2, p.y, p.x, p.y + TH / 2, p.x - TW / 2, p.y])
              .fill((x + y) % 2 === 0 ? C.floorA : C.floorB)
              .stroke({ width: 1, color: C.floorLine, alpha: 0.6 });
          }
        }
        // Falak a hátsó két oldalon; ajtónyílás a bejáratnál.
        for (let x = 0; x < r.width; x++) {
          const a = iso(x - 0.5, -0.5);
          const b = iso(x + 0.5, -0.5);
          floor.poly([a.x, a.y, b.x, b.y, b.x, b.y - WALL_H, a.x, a.y - WALL_H]).fill(C.wallRight);
        }
        for (let y = 0; y < r.height; y++) {
          const a = iso(-0.5, y - 0.5);
          const b = iso(-0.5, y + 0.5);
          if (y === r.entrance.y) {
            floor.poly([a.x, a.y, b.x, b.y, b.x, b.y - WALL_H, a.x, a.y - WALL_H]).fill({ color: C.door, alpha: 0.35 });
            continue;
          }
          floor.poly([a.x, a.y, b.x, b.y, b.x, b.y - WALL_H, a.x, a.y - WALL_H]).fill(C.wallLeft);
        }
        const e = iso(r.entrance.x, r.entrance.y);
        floor.poly([e.x, e.y - TH / 2 + 4, e.x + TW / 2 - 8, e.y, e.x, e.y + TH / 2 - 4, e.x - TW / 2 + 8, e.y]).fill({ color: C.doorMat, alpha: 0.55 });

        for (const g of items.values()) g.destroy();
        items.clear();
        for (const it of r.items) {
          const g = new Graphics();
          drawItem(g, it, gs);
          const p = iso(it.x, it.y);
          g.position.set(p.x, p.y);
          g.zIndex = (it.x + it.y) * 10;
          objects.addChild(g);
          items.set(it.id, g);
        }
        builtFor = r.gridVersion;
        builtGame = gs;
      };

      const syncAgent = (keyName: string, kind: string, x: number, y: number, draw: (g: Graphics) => void, dt: number) => {
        let v = agents.get(keyName);
        if (!v || v.kind !== kind) {
          if (v) v.c.destroy({ children: true });
          const c = new Container();
          const body = new Graphics();
          const badge = new Graphics();
          draw(body);
          c.addChild(body, badge);
          objects.addChild(c);
          v = { c, body, badge, x, y, kind };
          agents.set(keyName, v);
        }
        const k = 1 - Math.exp(-dt / 70);
        if (Math.abs(v.x - x) + Math.abs(v.y - y) > 3) {
          v.x = x;
          v.y = y;
        } else {
          v.x += (x - v.x) * k;
          v.y += (y - v.y) * k;
        }
        const p = iso(v.x, v.y);
        v.c.position.set(p.x, p.y);
        v.c.zIndex = (v.x + v.y) * 10 + 5;
        return v;
      };

      app.ticker.add((ticker) => {
        const st = useApp.getState();
        const gs = st.game;
        if (!gs) return;
        if (!fitted) fit(gs);
        if (builtFor !== gs.restaurant.gridVersion || builtGame !== gs) buildStatic(gs);
        const dt = ticker.deltaMS;
        const seen = new Set<string>();

        for (const s of gs.staff) {
          const kname = `s${s.id}`;
          seen.add(kname);
          syncAgent(kname, s.role, s.agent.pos.x, s.agent.pos.y, s.role === 'chef' ? drawChef : drawWaiter, dt);
        }
        for (const grp of gs.groups) {
          const color = C.guests[grp.id % C.guests.length] ?? C.guests[0]!;
          grp.members.forEach((m, i) => {
            const kname = `g${grp.id}:${i}`;
            seen.add(kname);
            const v = syncAgent(kname, `guest${color}`, m.agent.pos.x, m.agent.pos.y, (g) => drawGuest(g, color), dt);
            // Türelemjelző a csoport első tagja fölött.
            const waiting = grp.phase === 'queue' || grp.phase === 'waitOrder' || grp.phase === 'waitFood' || grp.phase === 'waitPay';
            v.badge.clear();
            if (i === 0 && waiting) v.badge.circle(0, -44, 5).fill(patienceColor(grp)).stroke({ width: 1.5, color: 0xffffff });
          });
        }
        for (const [k, v] of agents) {
          if (!seen.has(k)) {
            v.c.destroy({ children: true });
            agents.delete(k);
          }
        }

        // Építési előnézet.
        ghost.clear();
        ghostItem.clear();
        const tool = st.tool;
        const r = gs.restaurant;
        if (tool && hover.inside && hover.x >= 0 && hover.y >= 0 && hover.x < r.width && hover.y < r.height) {
          const p = iso(hover.x, hover.y);
          if (tool === 'remove') {
            const it = itemAt(r, hover);
            ghost
              .poly([p.x, p.y - TH / 2, p.x + TW / 2, p.y, p.x, p.y + TH / 2, p.x - TW / 2, p.y])
              .fill({ color: it ? C.ghostBad : C.floorLine, alpha: it ? 0.45 : 0.3 });
          } else {
            const err = canPlace(r, tool, hover) ?? (gs.cash < ITEMS[tool].price ? 'noMoney' : null);
            const tint = err ? C.ghostBad : C.ghostOk;
            ghost
              .poly([p.x, p.y - TH / 2, p.x + TW / 2, p.y, p.x, p.y + TH / 2, p.x - TW / 2, p.y])
              .fill({ color: tint, alpha: 0.28 });
            drawItem(ghostItem, { kind: tool, x: hover.x, y: hover.y }, gs, 0.55, err ? C.ghostBad : undefined);
            ghostItem.position.set(p.x, p.y);
          }
        }
      });

      // --- Bemenet -------------------------------------------------------------
      const canvas = app.canvas;
      let pan: { x: number; y: number; moved: boolean } | null = null;

      const toTile = (ev: PointerEvent | WheelEvent) => {
        const rect = canvas.getBoundingClientRect();
        const wx = (ev.clientX - rect.left - world.position.x) / zoom;
        const wy = (ev.clientY - rect.top - world.position.y) / zoom;
        return screenToTile(wx, wy);
      };

      const onDown = (ev: PointerEvent) => {
        const st = useApp.getState();
        if (ev.button === 2 || ev.button === 1 || (ev.button === 0 && !st.tool)) {
          pan = { x: ev.clientX, y: ev.clientY, moved: false };
          canvas.setPointerCapture(ev.pointerId);
          return;
        }
        if (ev.button === 0 && st.tool && st.game) {
          const p = toTile(ev);
          if (st.tool === 'remove') {
            const it = itemAt(st.game.restaurant, p);
            if (it) st.dispatch({ type: 'remove', id: it.id });
          } else {
            st.dispatch({ type: 'place', kind: st.tool as ItemKind, x: p.x, y: p.y });
          }
        }
      };
      const onMove = (ev: PointerEvent) => {
        const p = toTile(ev);
        hover.x = p.x;
        hover.y = p.y;
        hover.inside = true;
        if (pan) {
          const dx = ev.clientX - pan.x;
          const dy = ev.clientY - pan.y;
          if (Math.abs(dx) + Math.abs(dy) > 2) pan.moved = true;
          world.position.x += dx;
          world.position.y += dy;
          pan.x = ev.clientX;
          pan.y = ev.clientY;
        }
      };
      const onUp = (ev: PointerEvent) => {
        if (pan) canvas.releasePointerCapture(ev.pointerId);
        pan = null;
      };
      const onLeave = () => {
        hover.inside = false;
      };
      const onWheel = (ev: WheelEvent) => {
        ev.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mx = ev.clientX - rect.left;
        const my = ev.clientY - rect.top;
        const before = { x: (mx - world.position.x) / zoom, y: (my - world.position.y) / zoom };
        zoom = Math.max(0.45, Math.min(2.4, zoom * Math.exp(-ev.deltaY * 0.0015)));
        world.scale.set(zoom);
        world.position.set(mx - before.x * zoom, my - before.y * zoom);
      };
      const onContext = (ev: MouseEvent) => ev.preventDefault();

      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointerleave', onLeave);
      canvas.addEventListener('wheel', onWheel, { passive: false });
      canvas.addEventListener('contextmenu', onContext);
      cleanups.push(() => {
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerup', onUp);
        canvas.removeEventListener('pointerleave', onLeave);
        canvas.removeEventListener('wheel', onWheel);
        canvas.removeEventListener('contextmenu', onContext);
      });
    })();

    return () => {
      destroyed = true;
      for (const c of cleanups) c();
      // Ha az inicializálás még fut, a végén az async ág takarít.
      if (ready) app.destroy(true, { children: true });
    };
  }, []);

  return <div ref={host} className="iso-host" />;
}
