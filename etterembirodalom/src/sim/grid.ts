// Rács, útvonalkeresés (A*) és elrendezés-ellenőrzés.

import { ITEMS, type ItemKind } from '../data/content';
import type { PlacedItem, Pt, Restaurant } from './types';

const DIRS: Pt[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

export function key(p: Pt): number {
  return p.y * 1000 + p.x;
}

export function inBounds(r: Restaurant, p: Pt): boolean {
  return p.x >= 0 && p.y >= 0 && p.x < r.width && p.y < r.height;
}

export function itemAt(r: Restaurant, p: Pt): PlacedItem | undefined {
  return r.items.find((i) => i.x === p.x && i.y === p.y);
}

/** A bejárat és a közvetlen előtere szabadon marad. */
export function isReserved(r: Restaurant, p: Pt): boolean {
  const e = r.entrance;
  return (p.x === e.x && p.y === e.y) || (p.x === e.x + 1 && p.y === e.y);
}

export function buildBlocked(r: Restaurant): Set<number> {
  const s = new Set<number>();
  for (const it of r.items) if (!ITEMS[it.kind].walkable) s.add(key(it));
  return s;
}

export function isWalkable(r: Restaurant, blocked: Set<number>, p: Pt): boolean {
  return inBounds(r, p) && !blocked.has(key(p));
}

export function neighbors(p: Pt): Pt[] {
  return DIRS.map((d) => ({ x: p.x + d.x, y: p.y + d.y }));
}

/** A bejáratból elérhető járható mezők. */
export function reachableFrom(r: Restaurant, blocked: Set<number>, start: Pt): Set<number> {
  const seen = new Set<number>([key(start)]);
  const queue: Pt[] = [start];
  while (queue.length) {
    const p = queue.shift()!;
    for (const n of neighbors(p)) {
      if (!isWalkable(r, blocked, n)) continue;
      const k = key(n);
      if (seen.has(k)) continue;
      seen.add(k);
      queue.push(n);
    }
  }
  return seen;
}

// --- A* ---------------------------------------------------------------------

// A gyorsítótár az akadálykészlethez kötött: új elrendezés = új készlet = üres gyorsítótár.
const pathCache = new WeakMap<Set<number>, Map<number, Pt[] | null>>();
const CACHE_LIMIT = 4000;

/**
 * Útvonal a start mezőből a cél mezőbe. A cél lehet nem járható (pl. szék, amelyre leül a vendég),
 * a köztes mezők járhatók kell legyenek. A kimenet tartalmazza a startot és a célt.
 */
export function findPath(r: Restaurant, blocked: Set<number>, start: Pt, goal: Pt): Pt[] | null {
  let cache = pathCache.get(blocked);
  if (!cache) {
    cache = new Map();
    pathCache.set(blocked, cache);
  }
  const ck = key(start) * 1_000_000 + key(goal);
  let result = cache.get(ck);
  if (result === undefined) {
    result = astar(r, blocked, start, goal);
    if (cache.size > CACHE_LIMIT) cache.clear();
    cache.set(ck, result);
  }
  return result ? result.map((p) => ({ ...p })) : null;
}

function astar(r: Restaurant, blocked: Set<number>, start: Pt, goal: Pt): Pt[] | null {
  if (start.x === goal.x && start.y === goal.y) return [{ ...start }];
  const gk = key(goal);
  const h = (p: Pt) => Math.abs(p.x - goal.x) + Math.abs(p.y - goal.y);
  const open: { p: Pt; f: number; g: number }[] = [{ p: start, f: h(start), g: 0 }];
  const came = new Map<number, Pt>();
  const gScore = new Map<number, number>([[key(start), 0]]);
  const closed = new Set<number>();
  while (open.length) {
    // Kis rácson a lineáris minimumkeresés elég gyors és determinisztikus.
    let bi = 0;
    for (let i = 1; i < open.length; i++) {
      const a = open[i]!;
      const b = open[bi]!;
      if (a.f < b.f || (a.f === b.f && a.g > b.g)) bi = i;
    }
    const cur = open.splice(bi, 1)[0]!;
    const ck = key(cur.p);
    if (ck === gk) {
      const path: Pt[] = [cur.p];
      let k = ck;
      while (came.has(k)) {
        const prev = came.get(k)!;
        path.push(prev);
        k = key(prev);
      }
      return path.reverse().map((p) => ({ x: p.x, y: p.y }));
    }
    if (closed.has(ck)) continue;
    closed.add(ck);
    for (const n of neighbors(cur.p)) {
      const nk = key(n);
      const isGoal = nk === gk;
      if (!inBounds(r, n)) continue;
      if (!isGoal && blocked.has(nk)) continue;
      if (closed.has(nk)) continue;
      const g = cur.g + 1;
      if (g < (gScore.get(nk) ?? Infinity)) {
        gScore.set(nk, g);
        came.set(nk, cur.p);
        open.push({ p: n, g, f: g + h(n) });
      }
    }
  }
  return null;
}

// --- Asztalok, székek, hozzáférési mezők ------------------------------------

/** A székekhez tartozó asztal: a szomszédos asztalok közül a legkisebb azonosítójú. */
export function chairTable(r: Restaurant, chair: PlacedItem): PlacedItem | undefined {
  const tables = neighbors(chair)
    .map((n) => itemAt(r, n))
    .filter((i): i is PlacedItem => !!i && i.kind === 'table')
    .sort((a, b) => a.id - b.id);
  return tables[0];
}

export function chairsOfTable(r: Restaurant, table: PlacedItem): PlacedItem[] {
  return r.items.filter((i) => i.kind === 'chair' && chairTable(r, i)?.id === table.id).sort((a, b) => a.id - b.id);
}

/** Járható, a bejáratból elérhető szomszédos mezők. */
export function accessTiles(r: Restaurant, blocked: Set<number>, reach: Set<number>, target: Pt): Pt[] {
  return neighbors(target).filter((n) => isWalkable(r, blocked, n) && reach.has(key(n)));
}

/** Asztal kiszolgálási pontjai: az asztal vagy a székei melletti elérhető mezők. */
export function tableAccessTiles(r: Restaurant, blocked: Set<number>, reach: Set<number>, table: PlacedItem): Pt[] {
  const out = accessTiles(r, blocked, reach, table);
  for (const c of chairsOfTable(r, table)) out.push(...accessTiles(r, blocked, reach, c));
  const seen = new Set<number>();
  return out.filter((p) => {
    const k = key(p);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function nearest(from: Pt, options: Pt[]): Pt | null {
  let best: Pt | null = null;
  let bd = Infinity;
  for (const o of options) {
    const d = Math.abs(o.x - from.x) + Math.abs(o.y - from.y);
    if (d < bd) {
      bd = d;
      best = o;
    }
  }
  return best;
}

// --- Lerakás ellenőrzése -----------------------------------------------------

export type PlaceError = 'outOfBounds' | 'occupied' | 'reserved' | 'noMoney' | 'blocksPath' | 'agentThere';

/**
 * Ellenőrzi, hogy az elrendezés minden eleme kiszolgálható marad-e.
 * Asztalnál: az asztalnak vagy egy székének legyen elérhető szomszédja; szék/főzőállomás/pult:
 * legyen elérhető szomszéd. Visszaadja a kiszolgálhatatlan elem azonosítóját, vagy null-t.
 */
export function findUnreachable(r: Restaurant): number | null {
  const blocked = buildBlocked(r);
  const reach = reachableFrom(r, blocked, r.entrance);
  for (const it of r.items) {
    if (it.kind === 'table') {
      if (tableAccessTiles(r, blocked, reach, it).length === 0) return it.id;
    } else if (accessTiles(r, blocked, reach, it).length === 0) {
      return it.id;
    }
  }
  return null;
}

export function canPlace(r: Restaurant, kind: ItemKind, p: Pt): PlaceError | null {
  if (!inBounds(r, p)) return 'outOfBounds';
  if (isReserved(r, p)) return 'reserved';
  if (itemAt(r, p)) return 'occupied';
  const trial: Restaurant = { ...r, items: [...r.items, { id: -1, kind, x: p.x, y: p.y, rot: 0 }] };
  if (findUnreachable(trial) !== null) return 'blocksPath';
  return null;
}
