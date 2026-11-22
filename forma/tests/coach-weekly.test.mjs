import { test } from 'node:test';
import assert from 'node:assert/strict';
import { weeklyCoachReport, weeklyCoachText } from '../js/core/coach-weekly.js';

const now = new Date(2026, 10, 22, 12).getTime();
const day = n => new Date(2026, 10, 22 - n, 12).getTime();

test('heti riport: duplikált napló nem kétszeres edzés, fájdalom önbevallás', () => {
  const w = { id: 'w1', kind: 'workout', key: 'strengthA', date: day(1), minutes: 30, done: [{ ex: 'push_wall', sets: 2, reps: 20 }] };
  const r = weeklyCoachReport([w, w, { id: 'c1', kind: 'check', date: day(1), pain: true }], { now, goal: 3 });
  assert.equal(r.sessions, 1);
  assert.equal(r.minutes, 30);
  assert.equal(r.painReports, 1);
  assert.equal(r.recoveryCoverage, 'limited');
  assert.equal(r.sourceTypes.painReports, 'self_report');
  assert.equal(r.goalMet, false);
});

test('hiányzó adatok nem jelentenek nulla terhelést vagy jó regenerációt', () => {
  const r = weeklyCoachReport([], { now });
  assert.equal(r.sets, null);
  assert.equal(r.cardioMinutes, null);
  assert.equal(r.recoveryCoverage, 'missing');
  const text = weeklyCoachText(r);
  assert.match(text, /nincs adat/);
  assert.match(text, /nem következtethető jó állapot/);
  assert.doesNotMatch(text, /https?:\/\//);
});

test('a heti riport nem módosítja az edzésnaplót és nem változtat programot', () => {
  const items = Object.freeze([Object.freeze({ id: 'w2', kind: 'workout', date: day(2), minutes: 10 })]);
  const before = JSON.stringify(items);
  const report = weeklyCoachReport(items, { now, goal: 7 });
  assert.equal(JSON.stringify(items), before);
  assert.equal('suggestedLoad' in report, false);
});
