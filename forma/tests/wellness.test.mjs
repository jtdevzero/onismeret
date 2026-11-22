/* Heti áttekintés, levezetés, táplálkozási cél, időszakolás és panaszmód egységtesztjei. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { weeklyReview, cooldownSteps, nutritionTargets, dayKey } from '../js/core/wellness.js';
import { buildSession, phaseOf, complaintRules, initialLevels, ROTATION } from '../js/core/program.js';

const ex = JSON.parse(readFileSync(new URL('../data/exercises.json', import.meta.url), 'utf8')).exercises;
const byId = Object.fromEntries(ex.map(e => [e.id, e]));
const DAY = 86400000, MON = new Date(2026, 10, 9, 0, 0).getTime();

test('heti áttekintés: siker, elmaradás, fókusz; üres hét felismerése', () => {
  const items = [
    ...[0, 1, 2, 3, 4].map(d => ({ kind: 'workout', date: MON + d * DAY + 3600e3, changes: d === 2 ? [{ ladder: 'push', from: 2, to: 3 }] : [] })),
    { kind: 'cardio', date: MON + DAY, minutes: 60, intensity: 'vigorous' }, { kind: 'cardio', date: MON + 2 * DAY, minutes: 40, intensity: 'moderate' },
    { kind: 'body', date: MON - DAY, waist: 90 }, { kind: 'body', date: MON + 5 * DAY, waist: 89 },
  ];
  const r = weeklyReview(items, { start: MON });
  assert.equal(r.workouts, 5); assert.equal(r.cardio, 160); assert.equal(r.levelUps, 1); assert.equal(r.bodyChange, -1);
  assert.ok(r.wins.length >= 3 && r.misses.length === 0, JSON.stringify(r));
  const weak = weeklyReview([{ kind: 'workout', date: MON + DAY }], { start: MON });
  assert.match(weak.focus, /naptár/);
  assert.equal(weeklyReview([], { start: MON }).empty, true);
  assert.equal(weeklyReview(items, { now: MON + 9 * DAY }).start, MON, 'alapból az előző hét');
});

test('levezetés: célzott nyújtás, gyermekpóz és légzés, létező gyakorlatokkal', () => {
  const s = cooldownSteps(['ankle', 'hamstring']);
  assert.equal(s[0].id, 'calf_stretch');
  assert.equal(s[s.length - 1].id, 'breathing');
  for (const x of s) assert.ok(byId[x.id], x.id);
});

test('fehérje és víz: testsúlyból, ésszerű tartományban', () => {
  assert.deepEqual(nutritionTargets(80), { protein: 128, portions: 5, waterMl: 2650, glasses: 11 });
  assert.equal(nutritionTargets(null), null); assert.equal(nutritionTargets(10), null);
  assert.match(dayKey(new Date(2026, 0, 5).getTime()), /^2026-01-05$/);
});

const L = initialLevels({ pushup: 30, chair_stand: 30, plank: 130 }, { tests: { broad_jump: { score: 85 } }, areas: { strength: { score: 80 }, power: { score: 80 } } }, { sex: 'male' });
const st0 = { levels: L, targets: [], start: Date.now() };

test('időszakolás: alapozás → erő → robbanékonyság; erőciklusban több kör, kevesebb ismétlés', () => {
  assert.equal(phaseOf(1).id, 'base'); assert.equal(phaseOf(2).id, 'strength'); assert.equal(phaseOf(3).id, 'power'); assert.equal(phaseOf(4).id, 'base');
  const base = buildSession('strengthA', st0, ex, st0.start + DAY);
  const str = buildSession('strengthA', { ...st0, start: st0.start - 42 * DAY }, ex, st0.start + DAY);
  const sq = s => s.blocks.find(b => b.ladder === 'squat');
  assert.equal(str.phase.id, 'strength');
  assert.equal(sq(str).sets, sq(base).sets + 1);
  assert.ok(sq(str).reps <= sq(base).reps);
  const pw = buildSession('speedA', { ...st0, start: st0.start - 84 * DAY }, ex, st0.start + DAY), pb = buildSession('speedA', st0, ex, st0.start + DAY);
  assert.equal(pw.blocks.find(b => b.ladder === 'power').sets, pb.blocks.find(b => b.ladder === 'power').sets + 1);
});

test('panaszmód: térdnél nincs ugrás és mély egylábas guggolás, vállnál nincs rúd, deréknál nincs lendítés', () => {
  const knee = complaintRules(['knee']);
  assert.equal(knee.noImpact, true); assert.equal(knee.caps.squat, 1);
  for (const k of new Set(ROTATION)) {
    const s = buildSession(k, { ...st0, complaints: ['knee'] }, ex);
    for (const b of s.blocks) { assert.ok(!byId[b.exercise].impact, `${k}: ${b.exercise}`); assert.notEqual(b.exercise, 'pistol_box'); assert.notEqual(b.exercise, 'bulgarian'); }
  }
  const sh = buildSession('strengthB', { ...st0, equipment: ['bar'], complaints: ['shoulder'] }, ex);
  assert.ok(sh.blocks.every(b => !byId[b.exercise].equipment || byId[b.exercise].equipment !== 'bar'));
  assert.ok(sh.blocks.every(b => b.exercise !== 'towel_dislocate'));
  const back = buildSession('strengthC', { ...st0, equipment: ['dumbbell'], complaints: ['back'] }, ex);
  assert.ok(back.blocks.every(b => b.exercise !== 'kb_swing' && b.exercise !== 'hollow'));
  assert.deepEqual(complaintRules([]).caps, {});
});

test('időszakolás újramérés után is továbblép (a ciklusszámláló megmarad)', () => {
  const now = Date.now();
  /* új program (start = most), de már két ciklus eltelt korábban */
  const s = buildSession('strengthA', { ...st0, start: now - DAY, cycleBase: 1 }, ex, now);
  assert.equal(s.phase.id, 'strength');
  assert.equal(buildSession('strengthA', { ...st0, start: now - DAY, cycleBase: 2 }, ex, now).phase.id, 'power');
});
