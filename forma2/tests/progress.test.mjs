import { test } from 'node:test';
import assert from 'node:assert/strict';
import { progressSummary } from '../js/core/progress.js';
import { figurePoints, lerpPose } from '../js/core/figure.js';
import { readFileSync } from 'node:fs';

const now = new Date(2026, 10, 22, 12).getTime(), DAY = 86400000;
const assessment = (date, overall, version = 'v1') => ({ kind: 'assessment', date,
  scoring: { version: 1, testsVersion: version, normsVersion: 'n1', evaluation: { overall, areas: { strength: { score: overall } }, tests: { pushup: { score: overall } } } } });

test('hathetes összesítő: naplózott percek, aktív napok, határok és jövőbeli adatok', () => {
  const { from } = progressSummary([], now);
  const r = progressSummary([
    { kind: 'workout', date: from, minutes: 25 }, { kind: 'cardio', date: from + 1000, minutes: 30 },
    { kind: 'workout', date: now, minutes: 15 }, { kind: 'workout', date: from - 1, minutes: 100 },
    { kind: 'workout', date: now + 1, minutes: 100 }, { kind: 'body', date: now, minutes: 100 },
  ], now);
  assert.equal(r.workouts, 2); assert.equal(r.activeDays, 2); assert.equal(r.minutes, 70); assert.equal(r.cardioMinutes, 30);
  assert.equal(r.delta, null);
});

test('hathetes változás: azonos verzió és tesztkészlet, a csökkenés és nulla is látszik', () => {
  for (const [after, delta] of [[65, 15], [40, -10], [50, 0]]) {
    const r = progressSummary([assessment(now - 35 * DAY, 50), assessment(now - DAY, after)], now);
    assert.equal(r.delta, delta); assert.equal(r.measuredDays, 34); assert.equal(r.before, 50); assert.equal(r.after, after);
  }
});

test('eltérő verzióból, hiányos tesztkészletből és régi, verzió nélküli adatból nincs pontszámváltozás', () => {
  const a = assessment(now - 30 * DAY, 50), b = assessment(now, 75);
  const missing = structuredClone(a); delete missing.scoring.evaluation.tests.pushup;
  for (const first of [assessment(a.date, 50, 'old'), missing, { kind: 'assessment', date: a.date, results: { pushup: 10 } }]) {
    assert.equal(progressSummary([first, b], now).delta, null);
  }
  const outside = assessment(now - 50 * DAY, 50);
  assert.equal(progressSummary([outside, b], now).delta, null);
});

test('az összevethető párt keresi, nem a régebbi pontozású mérést, a bemenet változatlan', () => {
  const items = [assessment(now - 40 * DAY, 99, 'old'), assessment(now - 25 * DAY, 40), assessment(now, 60)];
  const before = structuredClone(items);
  assert.equal(progressSummary(items, now).delta, 20);
  assert.deepEqual(items, before);
});

test('minden gyakorlathoz van ábra; a koordinátás köztes képkockák és a kellékek végesek', () => {
  const load = file => JSON.parse(readFileSync(new URL('../data/' + file, import.meta.url)));
  const exercises = load('exercises.json').exercises, figures = load('figures.json').figures;
  for (const e of exercises) assert.ok(figures[e.figure]?.frames?.length, e.id);
  for (const [id, spec] of Object.entries(figures)) {
    for (let i = 0; i < spec.frames.length; i++) {
      const a = spec.frames[i].pose, b = spec.frames[(i + 1) % spec.frames.length].pose;
      for (const f of [0, .25, .5, .75, 1]) {
        const points = figurePoints(lerpPose(a, b, f));
        assert.ok(Object.values(points.box).every(Number.isFinite), id);
        assert.ok([...points.armN, ...points.armF, ...points.legN, ...points.legF].every(p => Number.isFinite(p.x) && Number.isFinite(p.y)), id);
      }
    }
    for (const point of (spec.props || []).flat()) assert.ok(point.length === 2 && point.every(Number.isFinite), id);
  }
});
