/* U1-101: a Ma képernyő domainrétege. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDashboard } from '../js/core/dashboard.js';

const DAY = 86400000, NOW = new Date(2026, 10, 18, 12).getTime(); /* szerda */
const A = (id, daysAgo, results = { pushup: 20 }) => ({ id, kind: 'assessment', date: NOW - daysAgo * DAY, profile: { age: 40, sex: 'female' }, results });
const prog = (daysAgo = 10) => ({ start: NOW - daysAgo * DAY, levels: {}, done: 3, ratings: {} });

test('üres állapot: felmérésre hív, nincs kitalált KPI, rekord vagy megállapítás', () => {
  const d = buildDashboard({ now: NOW });
  assert.equal(d.nextAction.type, 'assessment');
  assert.equal(d.weeklyWorkouts.completed, 0);
  assert.equal(d.weeklyCardio.minutes, 0);
  assert.equal(d.primaryGoal, null);
  assert.equal(d.assessmentDue, null);
  assert.equal(d.insight, null);
  assert.equal(d.currentCycle, null);
  assert.deepEqual(d.dataFreshness, { lastWorkout: null, lastAssessment: null, lastCardio: null });
});

test('van felmérés, nincs program: az eredményre és a programkészítésre hív', () => {
  const d = buildDashboard({ items: [A('a', 2)], now: NOW });
  assert.equal(d.nextAction.type, 'program');
  assert.equal(d.assessmentDue.due, false);
  assert.equal(d.assessmentDue.daysLeft, 40);
});

test('program van: a soron következő edzés; a mai edzés után jelzi, hogy kész', () => {
  const items = [A('a', 10)];
  const d = buildDashboard({ program: prog(), items, now: NOW });
  assert.equal(d.nextAction.type, 'workout');
  assert.match(d.nextAction.href, /^#\/check\//);
  assert.equal(d.nextAction.doneToday, false);
  assert.equal(d.currentCycle.cycleWeek, 2);
  const done = buildDashboard({ program: prog(), items: [...items, { id: 'w', kind: 'workout', date: NOW - 3600000, minutes: 20, done: [] }], now: NOW });
  assert.equal(done.nextAction.doneToday, true);
  assert.equal(done.weeklyWorkouts.completed, 1);
});

test('heti kardió: tényleges és célhoz számító perc külön', () => {
  const d = buildDashboard({ program: prog(), items: [A('a', 10), { id: 'c', kind: 'cardio', date: NOW - DAY, minutes: 20, intensity: 'vigorous' }], now: NOW });
  assert.equal(d.weeklyCardio.minutes, 20);
  assert.equal(d.weeklyCardio.equivalent, 40);
});

test('újramérés esedékes 6 hét után; régi edzésnél figyelmeztetés', () => {
  const d = buildDashboard({ program: prog(50), items: [A('a', 43), { id: 'w', kind: 'workout', date: NOW - 20 * DAY, done: [] }], now: NOW });
  assert.equal(d.assessmentDue.due, true);
  assert.equal(d.assessmentDue.daysLeft, 0);
  assert.equal(d.warnings.length, 1);
});

test('kiemelt cél: a legközelebbi határidejű, még nem teljesített', () => {
  const items = [A('a', 10, { pushup: 20 }),
    { id: 'g1', kind: 'goal', date: NOW - 5 * DAY, metric: 'pushup', start: 15, target: 30, deadline: NOW + 60 * DAY },
    { id: 'g2', kind: 'goal', date: NOW - 4 * DAY, metric: 'pushup', start: 15, target: 25, deadline: NOW + 20 * DAY },
    { id: 'g3', kind: 'goal', date: NOW - 3 * DAY, metric: 'pushup', start: 10, target: 18, deadline: NOW + 5 * DAY }];
  const d = buildDashboard({ program: prog(), items, now: NOW });
  assert.equal(d.primaryGoal.goal.id, 'g2', 'a teljesített g3 kimarad');
  assert.equal(d.primaryGoal.current, 20);
  assert.equal(d.primaryGoal.daysLeft, 20);
});

test('determinisztikus: azonos bemenet azonos kimenet, a bemenet változatlan', () => {
  const items = Object.freeze([A('a', 10), { id: 'w', kind: 'workout', date: NOW - DAY, minutes: 20, done: [{ ex: 'push_wall', sets: 3, reps: 30 }] }]);
  const p = Object.freeze(prog());
  assert.deepEqual(buildDashboard({ program: p, items, now: NOW }), buildDashboard({ program: p, items, now: NOW }));
});

test('sérült vagy hiányos tétel nem dönti el', () => {
  const d = buildDashboard({ program: prog(), items: [null, { kind: 'workout' }, A('a', 10)], now: NOW });
  assert.equal(d.nextAction.type, 'workout');
});
