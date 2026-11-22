/* A kamerás elemzés egységtesztjei szintetikus testpont-idősorokon (ismert szögű, mesterséges mozgás).
   Valódi felvételen még senki nem kalibrálta: ezek a tesztek a számolás logikáját védik, nem a pontosságot. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyzeExercise, isAnalyzable, ANALYZERS } from '../js/core/exercise.js';
import { series, rng } from './synth.mjs';

const R = Math.PI / 180;

/* Fekvőtámasz oldalról: a kéz a talajon a váll alatt, a test egyenes deszka (sag: a csípő lelógása, fok).
   elbow: a könyökszög (180 = nyújtott kar). → 33 testpont */
function pushPose(elbow, sag = 0) {
  const vis = 0.95, lm = Array.from({ length: 33 }, () => [0.5, 0.8, 0, vis]);
  const set = (i, x, y) => { lm[i] = [x, y, 0, vis]; };
  const upper = 0.12, fore = 0.12, wrist = { x: 0.75, y: 0.85 };
  /* a váll magassága a könyökszögből (kétszakaszos kar, a kéz a váll alatt) */
  const shH = Math.sqrt(upper ** 2 + fore ** 2 - 2 * upper * fore * Math.cos(elbow * R));
  const sh = { x: wrist.x, y: wrist.y - shH };
  const ankle = { x: 0.15, y: 0.84 };
  /* könyök: a váll–csukló szakasz mellett, hátrafelé kitérve */
  const a = Math.acos(Math.min(1, (upper ** 2 + shH ** 2 - fore ** 2) / (2 * upper * shH || 1)));
  const elb = { x: sh.x - upper * Math.sin(a), y: sh.y + upper * Math.cos(a) };
  const hip = { x: (sh.x + ankle.x) / 2, y: (sh.y + ankle.y) / 2 + sag / 100 };
  const knee = { x: (hip.x + ankle.x) / 2, y: (hip.y + ankle.y) / 2 };
  for (const d of [0, 1]) {
    const o = d ? 0.004 : -0.004;
    set(11 + d, sh.x + o, sh.y); set(13 + d, elb.x + o, elb.y); set(15 + d, wrist.x + o, wrist.y);
    set(23 + d, hip.x + o, hip.y); set(25 + d, knee.x + o, knee.y); set(27 + d, ankle.x + o, ankle.y);
    set(29 + d, ankle.x - 0.01 + o, ankle.y + 0.01); set(31 + d, ankle.x - 0.03 + o, ankle.y + 0.01);
  }
  set(0, sh.x + 0.06, sh.y - 0.02);
  return lm;
}
function pushSeries(seconds, period, lo, sag = 0) {
  const r = rng(3), out = [];
  for (let i = 0; i <= seconds * 15; i++) {
    const t = i / 15, elbow = 175 - (175 - lo) * (1 - Math.cos(2 * Math.PI * t / period)) / 2;
    out.push({ t, lm: pushPose(elbow, sag).map(p => [p[0] + (r() - 0.5) * 0.003, p[1] + (r() - 0.5) * 0.003, 0, p[3]]) });
  }
  return out;
}

test('fekvőtámasz: megszámolja az ismétléseket, és jónak látja a mély, egyenes testű végrehajtást', () => {
  const r = analyzeExercise(pushSeries(15.9, 2, 80), { aspect: 1, exercise: 'pushup' });
  assert.equal(r.ok, true);
  assert.ok(Math.abs(r.reps - 8) <= 1, `${r.reps} ismétlés`);
  const c = Object.fromEntries(r.checks.map(x => [x.id, x.band]));
  assert.equal(c.depth, 'ok'); assert.equal(c.straight_line, 'ok'); assert.equal(c.lockout, 'ok');
});

test('fekvőtámasz: a sekély ismétlést és a belógó csípőt jelzi', () => {
  const shallow = analyzeExercise(pushSeries(12, 2, 115), { aspect: 1, exercise: 'push_full' });
  assert.equal(shallow.ok, true);
  assert.equal(shallow.checks.find(x => x.id === 'depth').band, 'fix');
  const sag = analyzeExercise(pushSeries(12, 2, 80, 12), { aspect: 1, exercise: 'push_knee' });
  assert.equal(sag.checks.find(x => x.id === 'straight_line').band, 'fix');
});

test('felállás székről: a teljes felállásokat számolja', () => {
  /* oldalnézet: ülve a comb vízszintes (90°), állva függőleges (0°); 30 mp alatt 15 ismétlés */
  const frames = series(30, t => { const k = (1 + Math.cos(2 * Math.PI * t / 2)) / 2; return { view: 'side', shin: 5, thigh: 90 * (1 - k), torso: 25 * (1 - k) }; });
  const r = analyzeExercise(frames, { aspect: 1, exercise: 'chair_stand' });
  assert.equal(r.ok, true);
  assert.ok(Math.abs(r.reps - 15) <= 1, `${r.reps} felállás`);
  assert.equal(r.checks.find(x => x.id === 'full_stand').band, 'ok');
  /* félig felállás: nem teljes */
  const half = analyzeExercise(series(20, t => ({ view: 'side', shin: 5, thigh: 90 - 50 * (1 - Math.cos(2 * Math.PI * t / 2)) / 2, torso: 25 })), { aspect: 1, exercise: 'chair_stand' });
  assert.equal(half.checks.find(x => x.id === 'full_stand').band, 'fix');
});

test('mozdulatlanság és rossz látás: nem talál ismétlést, nem találgat', () => {
  assert.equal(analyzeExercise(pushSeries(8, 100, 174), { aspect: 1, exercise: 'pushup' }).ok, false);
  assert.equal(analyzeExercise(series(8, () => ({ vis: 0.1 })), { aspect: 1, exercise: 'squat' }).reason, 'not_tracked');
  assert.equal(analyzeExercise([], { exercise: 'ismeretlen' }).reason, 'unknown_exercise');
});

test('minden elemzőhöz létező gyakorlat vagy teszt tartozik', () => {
  const ex = JSON.parse(readFileSync(new URL('../data/exercises.json', import.meta.url), 'utf8')).exercises.map(e => e.id);
  const tests = JSON.parse(readFileSync(new URL('../data/tests.json', import.meta.url), 'utf8')).tests.map(t => t.id);
  for (const id of Object.keys(ANALYZERS)) assert.ok(ex.includes(id) || tests.includes(id), id);
  for (const id of ['pushup', 'chair_stand', 'plank', 'sl_stance']) assert.ok(isAnalyzable(id), id);
});
