/* Időkeret, súlyzós sorok és futóprogram egységtesztjei. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildSession, sessionSteps, sessionMinutes, fitSession, initialLevels, ROTATION } from '../js/core/program.js';
import { runSession, totalSeconds, runSeconds, describe, nextRun, repeatWeek, RUN_WEEKS } from '../js/core/runplan.js';

const ex = JSON.parse(readFileSync(new URL('../data/exercises.json', import.meta.url), 'utf8')).exercises;
const byId = Object.fromEntries(ex.map(e => [e.id, e]));
const L = initialLevels({ pushup: 20, chair_stand: 22, plank: 70 }, { tests: {}, areas: { strength: { score: 50 } } }, { sex: 'male' });
const st = { levels: L, targets: ['hamstring', 'ankle', 'squat'], start: Date.now() };
const mins = s => sessionMinutes(sessionSteps(s, byId));

test('időkeret: 15 percre rövidít, a fő gyakorlatok megmaradnak, 35-nél bővít, 0-nál nem nyúl hozzá', () => {
  for (const k of new Set(ROTATION)) {
    const full = buildSession(k, st, ex), short = fitSession(full, byId, 15);
    assert.ok(mins(short) <= Math.max(15, 12) || mins(short) < mins(full), `${k}: ${mins(full)} → ${mins(short)}`);
    assert.ok(short.blocks.filter(b => b.part === 'main').length >= Math.min(2, full.blocks.filter(b => b.part === 'main').length), k);
    assert.ok(short.blocks.some(b => b.part === 'mobility'), 'mobilitás mindig marad');
    assert.equal(short.fit.target, 15);
  }
  const a = buildSession('strengthA', st, ex);
  assert.ok(mins(fitSession(a, byId, 15)) <= 15, `erőnap 15 percre: ${mins(fitSession(a, byId, 15))}`);
  assert.equal(fitSession(a, byId, 0), a);
  const long = fitSession(a, byId, 35);
  assert.ok(mins(long) >= mins(a) && mins(long) <= 35 + 2, `35 perc: ${mins(a)} → ${mins(long)}`);
  assert.equal(a.blocks.find(b => b.part === 'main').sets, 3, 'a bemenet nem változik');
});

test('súlyzóval: serleg guggolás, román felhúzás és evezés kerül a programba', () => {
  const s = buildSession('strengthC', { ...st, equipment: ['dumbbell'] }, ex);
  const ids = s.blocks.filter(b => b.part === 'main').map(b => b.exercise);
  assert.ok(ids.some(i => byId[i].ladder === 'squat_db'), ids.join());
  assert.ok(ids.some(i => byId[i].ladder === 'hinge_db'), ids.join());
  assert.ok(ids.some(i => byId[i].ladder === 'pull_db'), ids.join());
  for (const i of ids.filter(i => byId[i].equipment)) assert.match(byId[i].how, /súlyt/, 'súlyválasztási tanács: ' + i);
});

test('futóprogram: 9 hét, a futásidő nő, a végén 30 perc folyamatos futás', () => {
  let prev = 0;
  for (let w = 1; w <= RUN_WEEKS; w++) {
    const segs = runSession(w, 1);
    assert.equal(segs[0].type, 'warm'); assert.equal(segs[segs.length - 1].type, 'cool');
    assert.ok(runSeconds(segs) >= prev * 0.9, `${w}. hét`); prev = runSeconds(segs);
    assert.ok(totalSeconds(segs) / 60 <= 41);
  }
  assert.equal(runSeconds(runSession(9, 3)), 1800);
  assert.equal(describe(runSession(1, 1)), '8 × (1 perc futás, 1,5 perc séta)');
  assert.equal(describe(runSession(9, 1)), '30 perc folyamatos futás');
  assert.deepEqual(nextRun({ week: 1, day: 3 }), { week: 2, day: 1, done: false });
  assert.deepEqual(nextRun({ week: 9, day: 3 }), { week: 9, day: 3, done: true });
  assert.deepEqual(nextRun(null), { week: 1, day: 2, done: false });
  assert.deepEqual(repeatWeek({ week: 4, day: 3 }), { week: 4, day: 1, done: false });
});

test('bemelegítés az edzéshez szabva, visszatérés szünet után, célprogram, edzéspartner', async () => {
  const { WARMUP_FOR, partnerSteps } = await import('../js/core/program.js');
  const a = buildSession('strengthA', st, ex);
  for (const id of WARMUP_FOR.strengthA) assert.ok(a.blocks.some(b => b.exercise === id && b.part === 'warmup'), id);
  const now = Date.now();
  const back = buildSession('strengthA', { ...st, lastDone: now - 20 * 86400000 }, ex, now);
  assert.equal(back.returning, true);
  const main = s => s.blocks.filter(b => b.part === 'main');
  main(back).forEach((b, i) => assert.equal(b.sets, Math.max(1, main(a)[i].sets - 1)));
  const goal = buildSession('strengthA', { ...st, goalFocus: 'push' }, ex);
  assert.equal(goal.blocks.find(b => b.ladder === 'push').sets, a.blocks.find(b => b.ladder === 'push').sets + 1);
  const sp = buildSession('speedA', { ...st, goalFocus: 'push' }, ex);
  assert.ok(sp.blocks.some(b => b.ladder === 'push'), 'gyorsasági napon is van célblokk');
  const steps = sessionSteps(a, byId), ps = partnerSteps(steps);
  assert.equal(ps.filter(s => s.type !== 'rest').length, 2 * steps.filter(s => s.type !== 'rest').length);
  assert.equal(ps.filter(s => s.rate).length, steps.filter(s => s.rate).length, 'értékelés csak az 1. személynél');
  assert.ok(ps.filter(s => s.rate).every(s => s.person === 1));
});
