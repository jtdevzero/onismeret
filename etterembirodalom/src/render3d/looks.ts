// Szereplők megjelenése: azonosítóból determinisztikusan választott bőr, haj, ruha.

import type { Role } from '../sim/types';
import type { PersonLook } from './models';

function hash(n: number): number {
  let x = (n | 0) ^ 0x9e3779b9;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

const SKINS = [0xf1c9a5, 0xe0ac83, 0xc68863, 0x9c6644, 0x7a4b2f, 0xf6d7bd];
const HAIRS = [0x2b1a10, 0x4a2f1b, 0x7a4a24, 0xc9a24a, 0x1f1f1f, 0x8c8c8c, 0x6b2a1a];
const TOPS = [0x1e3a8a, 0x1d4ed8, 0x0f766e, 0x6b21a8, 0x7f1d3a, 0x334155, 0x047857, 0x9d174d, 0x0e7490, 0xb45309, 0xf5f5f4];
const BOTTOMS = [0x1f2937, 0x334155, 0x3f3f46, 0x1e3a5f, 0x52525b, 0x78350f];

const cache = new Map<string, PersonLook>();

export function guestLook(seed: number): PersonLook {
  const k = `g${seed}`;
  const hit = cache.get(k);
  if (hit) return hit;
  const pick = <T,>(arr: T[], i: number) => arr[Math.floor(hash(seed * 7 + i) * arr.length)]!;
  const look: PersonLook = {
    skin: pick(SKINS, 1),
    hair: pick(HAIRS, 2),
    top: pick(TOPS, 3),
    bottom: pick(BOTTOMS, 4),
    hairStyle: Math.floor(hash(seed * 7 + 5) * 3) as 0 | 1 | 2,
    role: 'guest',
  };
  cache.set(k, look);
  return look;
}

export function staffLook(seed: number, role: Role): PersonLook {
  const k = `s${seed}${role}`;
  const hit = cache.get(k);
  if (hit) return hit;
  const base = guestLook(seed + 1000);
  const look: PersonLook =
    role === 'waiter'
      ? { ...base, top: 0xf8fafc, bottom: 0x111827, role }
      : role === 'chef'
        ? { ...base, top: 0xf8fafc, bottom: 0x4b5563, role }
        : { ...base, top: 0x93c5fd, bottom: 0x1e3a8a, role };
  cache.set(k, look);
  return look;
}
