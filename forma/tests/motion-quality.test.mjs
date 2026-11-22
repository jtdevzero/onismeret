/* U0-005: a kamerás mérés megbízhatósági jelölése. Szintetikus adat: a valós pontosságról semmit nem állít. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { measurementReliability } from '../js/core/motion-quality.js';
import { analyzeExercise } from '../js/core/exercise.js';
import { series } from './synth.mjs';

const ok = (over = {}) => ({ ok: true, confidence: 0.9, quality: { frames: 300, fps: 30, tracked: 0.95, bodyHeight: 0.7 }, ...over });

test('jó követés: jó, és beírható', () => {
  const m = measurementReliability(ok());
  assert.equal(m.level, 'good');
  assert.equal(m.autofill, true);
  assert.deepEqual(m.reasons, []);
});

test('közepes konfidencia, alacsony fps vagy kicsi alak: korlátozott, okkal', () => {
  assert.equal(measurementReliability(ok({ confidence: 0.6 })).level, 'limited');
  const slow = measurementReliability(ok({ quality: { fps: 6, tracked: 0.9, bodyHeight: 0.7 } }));
  assert.equal(slow.level, 'limited');
  assert.match(slow.reasons.join(' '), /képkockaszám/);
  assert.equal(measurementReliability(ok({ quality: { fps: 30, tracked: 0.9, bodyHeight: 0.2 } })).level, 'limited');
});

test('kevés látott képkocka, alacsony konfidencia vagy sikertelen elemzés: nem megbízható, nem íródik be', () => {
  for (const r of [ok({ quality: { fps: 30, tracked: 0.5 } }), ok({ confidence: 0.3 }), { ok: false, reason: 'not_tracked', quality: { tracked: 0.2 } }, null, {}]) {
    const m = measurementReliability(r);
    assert.equal(m.level, 'unreliable', JSON.stringify(r));
    assert.equal(m.autofill, false);
  }
});

test('hiányzó mezők nem okoznak hibát vagy hamis bizonyosságot', () => {
  const m = measurementReliability({ ok: true });
  assert.equal(m.level, 'unreliable');
  assert.equal(m.trackedPct, 0);
});

test('szintetikus felállás székről: teljes látás mellett nem „nem megbízható”, kitakarva igen', () => {
  const squat = t => { const k = (1 + Math.cos(2 * Math.PI * t / 2)) / 2; return { view: 'side', shin: 5, thigh: 90 * (1 - k), torso: 25 * (1 - k) }; };
  const full = analyzeExercise(series(30, squat), { aspect: 1, exercise: 'chair_stand' });
  assert.notEqual(measurementReliability(full).level, 'unreliable');
  /* a képkockák háromnegyedén nincs testpont (kitakarás) */
  const hidden = series(30, squat).map((f, i) => (i % 4 ? { ...f, lm: null } : f));
  const r = analyzeExercise(hidden, { aspect: 1, exercise: 'chair_stand' });
  assert.equal(measurementReliability(r).level, 'unreliable');
});
