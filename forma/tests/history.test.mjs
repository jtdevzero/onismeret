/* Naptár, havi összefoglaló és eszközös gyakorlatsorok egységtesztjei. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { monthGrid, monthSummary } from '../js/core/history.js';
import { buildSession, initialLevels, pullLadder, laddersOf, LADDERS } from '../js/core/program.js';

const at = (y, m, d, h = 12) => new Date(y, m, d, h).getTime();

test('havi naptár: hétfővel kezd, teljes heteket ad, a napokon jelöli az edzést, kardiót, felmérést', () => {
  const items = [
    { kind: 'workout', date: at(2026, 10, 3), minutes: 20 }, { kind: 'workout', date: at(2026, 10, 3, 18), minutes: 10, light: true },
    { kind: 'cardio', date: at(2026, 10, 4), minutes: 30 }, { kind: 'assessment', date: at(2026, 10, 21) },
  ];
  const g = monthGrid(items, 2026, 10, at(2026, 10, 21));
  assert.equal(new Date(g.weeks[0][0].date).getDay(), 1);
  assert.ok(g.weeks.every(w => w.length === 7));
  const flat = g.weeks.flat(), day = n => flat.find(c => c.inMonth && c.day === n);
  assert.equal(flat.filter(c => c.inMonth).length, 30);
  assert.deepEqual([day(3).workout, day(3).light, day(3).minutes], [2, 1, 30]);
  assert.equal(day(4).cardio, 1);
  assert.equal(day(21).assessment, 1); assert.equal(day(21).today, true);
});

test('havi összefoglaló: edzés, aktív nap, perc, szintlépés, leghosszabb sorozat, előző hónap', () => {
  const items = [
    { kind: 'workout', date: at(2026, 10, 1), minutes: 20, changes: [{ ladder: 'push', from: 1, to: 2 }, { ladder: 'core', from: 2, to: 1 }] },
    { kind: 'workout', date: at(2026, 10, 2), minutes: 25 }, { kind: 'cardio', date: at(2026, 10, 3), minutes: 40 },
    { kind: 'workout', date: at(2026, 10, 10), minutes: 15 }, { kind: 'assessment', date: at(2026, 10, 12) },
    { kind: 'workout', date: at(2026, 9, 30), minutes: 20 },
  ];
  const s = monthSummary(items, 2026, 10);
  assert.deepEqual({ w: s.workouts, d: s.activeDays, m: s.minutes, c: s.cardioMinutes, l: s.levelUps, b: s.bestStreak, a: s.assessments },
    { w: 3, d: 4, m: 100, c: 40, l: 1, b: 3, a: 1 });
  assert.equal(s.prev.workouts, 1);
  assert.equal(monthSummary(items, 2026, 0).prev.workouts, 0, 'januárnál az előző év decembere');
});

test('eszközök: rúddal húzódzkodás, szalaggal evezés, eszköz nélkül asztal alatti húzás', () => {
  const ex = JSON.parse(readFileSync(new URL('../data/exercises.json', import.meta.url), 'utf8')).exercises;
  assert.equal(pullLadder([]), 'pull'); assert.equal(pullLadder(['band']), 'pull_band'); assert.equal(pullLadder(['band', 'bar']), 'pull_bar');
  const lad = laddersOf(ex);
  for (const k of ['pull_band', 'pull_bar']) assert.ok(lad[k].every(e => e.equipment), k);
  for (const k of LADDERS.filter(k => !k.startsWith('pull_'))) assert.ok(lad[k].every(e => !e.equipment), 'eszköz nélküli sor: ' + k);
  const L = initialLevels({ pushup: 20 }, { tests: {}, areas: {} }, { sex: 'male' });
  assert.equal(L.pull_bar, 1, 'erős felsőtesttel a negatív húzódzkodásról indul');
  const st = { levels: L, targets: [], start: Date.now() };
  const pullOf = s => s.blocks.find(b => b.ladder && b.ladder.startsWith('pull'));
  assert.equal(pullOf(buildSession('strengthB', st, ex)).ladder, 'pull');
  assert.equal(pullOf(buildSession('strengthB', { ...st, equipment: ['bar'] }, ex)).exercise, 'negative_pullup');
  assert.equal(pullOf(buildSession('strengthC', { ...st, equipment: ['band'] }, ex)).ladder, 'pull_band');
});
