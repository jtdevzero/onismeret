/* Felugrás, testtartás, reakcióidő, rutinok és saját edzés egységtesztjei (szintetikus adatokon). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyzeExercise } from '../js/core/exercise.js';
import { analyzePosture } from '../js/core/posture.js';
import { reactionResult, randomDelay, TRIALS } from '../js/core/reaction.js';
import { freeSession, sessionSteps } from '../js/core/program.js';
import { series, pose } from './synth.mjs';

const json = f => JSON.parse(readFileSync(new URL('../data/' + f, import.meta.url), 'utf8'));
const ex = json('exercises.json').exercises, byId = Object.fromEntries(ex.map(e => [e.id, e]));

test('felugrás: a repülési időből számol, a legjobb ugrás számít', () => {
  /* álló helyzet, majd két ugrás: 0,40 s és 0,50 s repülés (h = g t² / 8 → kb. 19,6 és 30,7 cm) */
  const lift = t => (t >= 2 && t < 2.4 ? 0.15 : t >= 4 && t < 4.5 ? 0.18 : 0);
  const frames = series(6, t => ({ view: 'side', shin: 2, thigh: 4, torso: 4, footY: 0.9 - lift(t) }), { fps: 60, noise: 0.001 });
  const r = analyzeExercise(frames, { aspect: 1, exercise: 'vertical_jump' });
  assert.equal(r.ok, true);
  assert.equal(r.reps, 2);
  assert.ok(Math.abs(r.jumpCm - 30.7) <= 4, `legjobb ugrás: ${r.jumpCm} cm`);
  const still = analyzeExercise(series(5, () => ({ view: 'side', shin: 2, thigh: 4, torso: 4 }), { fps: 30 }), { aspect: 1, exercise: 'vertical_jump' });
  assert.equal(still.jumpCm, null);
});

/* álló testpontok: szemből (dőlésekkel) vagy oldalról (előretolt fejjel) */
function stand(view, o = {}) {
  const lm = pose({ view: view === 'side' ? 'side' : 'frontal', shin: 0, thigh: 0, torso: 0, flex: 0, stance: 0.12 });
  if (view === 'front') { lm[12][1] += o.shoulderDrop || 0; lm[24][1] += o.hipDrop || 0; }
  if (view === 'side') {
    const sx = (lm[11][0] + lm[12][0]) / 2, sy = lm[11][1];
    lm[7] = [sx + (o.head || 0), sy - 0.06, 0, 0.95]; lm[8] = [sx + (o.head || 0), sy - 0.06, 0, 0.3];
    lm[0] = [sx + (o.head || 0) + 0.03, sy - 0.06, 0, 0.95];
  }
  return lm;
}
const hold = (view, o) => Array.from({ length: 30 }, (_, i) => ({ t: i / 10, lm: stand(view, o) }));

test('testtartás: egyenes állásnál rendben, váll- és csípődőlést és előretolt fejet jelez', () => {
  const ok = analyzePosture(hold('front', {}), 'front');
  assert.equal(ok.ok, true);
  assert.equal(ok.metrics.shoulder_tilt.band, 'ok'); assert.equal(ok.metrics.hip_tilt.band, 'ok');
  const tilt = analyzePosture(hold('front', { shoulderDrop: 0.02, hipDrop: 0.015 }), 'front');
  assert.equal(tilt.metrics.shoulder_tilt.band, 'fix'); assert.equal(tilt.metrics.hip_tilt.band, 'fix');
  assert.equal(analyzePosture(hold('side', { head: 0.01 }), 'side').metrics.head_forward.band, 'ok');
  assert.equal(analyzePosture(hold('side', { head: 0.08 }), 'side').metrics.head_forward.band, 'fix');
  assert.equal(analyzePosture([], 'front').ok, false);
});

test('reakcióidő: medián, a korai és a túl lassú próbák kiszűrve, kevés érvényesnél nincs eredmény', () => {
  assert.deepEqual(reactionResult([250, NaN, 270, 260, 2000]), { median: 260, best: 250, valid: 3, discarded: 2 });
  assert.equal(reactionResult([250, NaN, NaN, NaN, 300]), null);
  assert.equal(reactionResult([210, 230, 250, 240]).median, 235);
  for (let i = 0; i < 20; i++) { const d = randomDelay(); assert.ok(d >= 1500 && d <= 4000); }
  assert.equal(TRIALS, 5);
});

test('rutinok és saját edzés: létező gyakorlatok, értékelés nélkül, nem léptet', () => {
  const rs = json('routines.json').routines;
  assert.ok(rs.length >= 4);
  for (const r of rs) {
    for (const [id] of r.blocks) assert.ok(byId[id], `${r.id}: ${id}`);
    const s = freeSession('routine-' + r.id, r.name, r.blocks, byId), steps = sessionSteps(s, byId);
    assert.equal(s.free, true);
    assert.equal(steps.filter(x => x.rate).length, 0);
    assert.ok(steps.length >= r.blocks.length);
  }
  const c = freeSession('custom-x', 'Saját', [['push_full', 9, { reps: 10 }], ['nincs', 1, {}], ['plank', 1, null]], byId);
  assert.equal(c.blocks.length, 2); assert.equal(c.blocks[0].sets, 6, 'legfeljebb 6 kör'); assert.equal(c.blocks[1].seconds, 20, 'alapadag a katalógusból');
});
