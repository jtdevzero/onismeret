import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluate } from '../js/core/score.js';
import { createScoring, assessmentEvaluation, sameScoring, cleanScoring } from '../js/core/assessment.js';
import { reassessedLevels, LADDERS, ROTATION } from '../js/core/program.js';
import { parseBackup } from '../js/core/backup.js';
import { currentFitnessAge } from '../js/core/achievements.js';

const json = n => JSON.parse(readFileSync(new URL('../data/' + n, import.meta.url)));
const tests = json('tests.json'), norms = json('norms.json');
const profile = { age: 34, sex: 'male' };
const ctx = { testIds: tests.tests.map(t => t.id), areaIds: tests.areas.map(a => a.id), ladders: LADDERS, sessionKeys: ROTATION, ratingKeys: ['easy', 'ok', 'hard', 'fail'] };
const assessment = () => ({ id: 'a1', kind: 'assessment', date: 1000, profile, results: { pushup: 2, plank: 15, deep_squat: 3, shoulder_reach: 3, reaction: 1400 }, vitals: { rhr: 65, waist: 90, frequency: 2.5, intensity: 5, duration: 0.75 } });

test('újramérés: gyengébb eredmény lefelé is számít, kihagyott sor megmarad, javulás is érvényesül', () => {
  const a = assessment(), old = Object.fromEntries(LADDERS.map(k => [k, 3]));
  const ev = evaluate(a, tests, norms), next = reassessedLevels(a.results, ev, profile, old);
  assert.equal(next.push, 0); assert.equal(next.core, 0); assert.equal(next.side, 0);
  assert.equal(next.pull_bar, 0);
  assert.equal(next.squat, 3); assert.equal(next.balance, 3); assert.equal(next.power, 3);
  const improved = { ...a, results: { ...a.results, pushup: 35 } };
  assert.equal(reassessedLevels(improved.results, evaluate(improved, tests, norms), profile, { push: 0 }).push, 4);
  assert.equal(old.push, 3, 'bemenet nem változik');
});

test('fájdalomjelzés kihagyott teljesítményteszt mellett is könnyíti az eszközös sorokat', () => {
  const a = { profile, results: { deep_squat: 0, shoulder_reach: 0 } };
  const old = Object.fromEntries(LADDERS.map(k => [k, 3]));
  const next = reassessedLevels(a.results, evaluate(a, tests, norms), profile, old);
  for (const k of ['push', 'pull', 'pull_band', 'pull_bar', 'pull_db', 'squat', 'squat_db', 'lunge']) assert.equal(next[k], 0, k);
  assert.equal(next.core, 3); assert.equal(next.balance, 3);
});

test('mentett pontszám norma- és tesztfrissítés, valamint export/import után is változatlan', () => {
  const a = assessment(); a.scoring = createScoring(a, tests, norms);
  const expected = structuredClone(a.scoring.evaluation), changed = structuredClone(norms), changedTests = structuredClone(tests);
  changed.tests.pushup.male[1] = [1, 2, 3, 4]; changed.vo2.male.a = 60;
  changedTests.tests.find(t => t.id === 'deep_squat').map['3'] = 10;
  assert.notDeepEqual(evaluate(a, changedTests, changed), expected, 'a módosítás tényleg megváltoztatná a pontozást');
  assert.deepEqual(assessmentEvaluation(a, changedTests, changed), expected);
  const result = parseBackup(JSON.stringify({ app: 'forma', version: 1, items: [a] }), ctx);
  assert.equal(result.ok, true);
  assert.deepEqual(result.data.items[0], a);
  assert.deepEqual(assessmentEvaluation(result.data.items[0], changedTests, changed), expected);
  assert.deepEqual(currentFitnessAge([a], profile, changed), { age: expected.fitnessAge, vo2: expected.vo2, waistUpdated: false });
});

test('régi adatok olvashatók, ismeretlen vagy eltérő pontozásból nincs fejlődés-összevetés', () => {
  const a = assessment(), b = assessment();
  assert.deepEqual(assessmentEvaluation(a, tests, norms), evaluate(a, tests, norms));
  assert.equal(sameScoring(a, b), false);
  a.scoring = createScoring(a, tests, norms); b.scoring = createScoring(b, tests, norms);
  assert.equal(sameScoring(a, b), true);
  b.scoring.normsVersion = 'next'; assert.equal(sameScoring(a, b), false);
  const legacy = parseBackup(JSON.stringify({ app: 'forma', version: 1, items: [assessment()] }), ctx);
  assert.equal(legacy.ok, true); assert.equal(legacy.data.items[0].scoring, undefined);
});

test('sérült vagy ismeretlen pontozási pillanatkép miatt a teljes import elutasításra kerül', () => {
  const a = assessment(); a.scoring = createScoring(a, tests, norms);
  for (const edit of [s => { s.version = 999; }, s => { s.evaluation.overall = '99'; }, s => { s.evaluation.areas.strength.score = 1000; }, s => { s.evaluation.tests.pushup.quality = '<script>'; }]) {
    const bad = structuredClone(a); edit(bad.scoring);
    assert.equal(parseBackup(JSON.stringify({ app: 'forma', version: 1, items: [bad] }), ctx).ok, false);
  }
  a.scoring.extra = '<script>';
  assert.equal(cleanScoring(a.scoring, ctx.testIds, ctx.areaIds).extra, undefined);
});

test('memóriamód állapota megfigyelhető, hibás visszatöltés az eredeti adatokat érintetlenül hagyja', async () => {
  // Node-ban nincs IndexedDB: ugyanaz az ág fut, mint letiltott böngészőtárolónál.
  const s = await import('../js/ui/store.js');
  const states = [], stop = s.watchStorage(v => states.push(v));
  await s.kvSet('settings', { profile }); await s.itemPut(assessment());
  assert.equal(s.storageStatus().mode, 'memory');
  assert.ok(states.some(v => v.mode === 'memory')); stop();
  const before = await s.exportAll();
  await assert.rejects(s.restoreAll({ settings: {}, items: [{ kind: 'assessment' }] }));
  const after = await s.exportAll(); delete before.exported; delete after.exported;
  assert.deepEqual(after, before);
  const a = assessment(); a.scoring = createScoring(a, tests, norms);
  await s.restoreAll({ settings: { profile }, items: [a] });
  assert.deepEqual(await s.itemGet('a1'), a);
});
