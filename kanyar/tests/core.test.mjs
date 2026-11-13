/* Az elemzőmag tesztjei szintetikus testpont-idősorokon. Futtatás: node --test kanyar/tests/ */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { angleAt, tilt, percentile, movingAverage } from '../js/core/geometry.js';
import { prepare } from '../js/core/series.js';
import { analyzeRun, detectTurns, RELIABLE } from '../js/core/snow.js';
import { analyzeExercise, detectReps } from '../js/core/exercise.js';
import { series, wave } from './synth.mjs';

const A = 1; /* képarány a szintetikus adatokhoz */
const run = (frames, o) => analyzeRun(frames, { aspect: A, sport: 'ski', view: 'front', ...o });
const band = (r, id) => r.metrics[id].band;
const reliable = (r, id) => r.metrics[id].usable && r.metrics[id].confidence >= RELIABLE;

test('geometria: szög, dőlés, percentilis, mozgó átlag', () => {
  assert.equal(Math.round(angleAt({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 })), 90);
  assert.equal(Math.round(tilt({ x: 0, y: 1 }, { x: 0, y: 0 })), 0);
  assert.equal(Math.round(tilt({ x: 0, y: 1 }, { x: 1, y: 0 })), 45);
  assert.equal(percentile([1, 2, 3, 4, 5], 0.5), 3);
  assert.deepEqual(movingAverage([0, 1, 2], [1, 2, 3], 1).map(v => Math.round(v * 10) / 10), [1.5, 2, 2.5]);
});

test('előkészítés: a rövid kiesést pótolja, a hosszút nem; a követett arányt a mért képkockákból számolja', () => {
  const f = series(6, t => ((t > 1 && t < 1.25) || (t > 3 && t < 4.5) ? null : { legTilt: 0 }));
  const { frames, quality } = prepare(f, A);
  assert.ok(frames.filter(x => x.t > 1 && x.t < 1.25).every(x => x.p), 'a 0,25 mp-es hézag pótolva');
  assert.ok(frames.filter(x => x.t > 3.2 && x.t < 4.3).every(x => !x.p), 'a 1,5 mp-es hézag üres marad');
  assert.ok(quality.tracked > 0.65 && quality.tracked < 0.8);
  assert.equal(quality.viewGuess, 'frontal');
});

test('kanyarfelismerés: 3 mp-es periódus 15 mp alatt 10 kanyar (±1), zajjal is', () => {
  for (const noise of [0, 0.004]) {
    const r = run(series(15, t => ({ legTilt: 15 * wave(t, 3), torsoTilt: 6 * wave(t, 3) }), { noise }));
    assert.ok(r.ok);
    assert.ok(Math.abs(r.turnCount - 10) <= 1, `kanyarok: ${r.turnCount}`);
    assert.equal(band(r, 'symmetry'), 'ok');
    assert.equal(band(r, 'rhythm'), 'ok');
    assert.ok(r.turns.every((k, i) => i === 0 || k.dir !== r.turns[i - 1].dir), 'az irányok váltakoznak');
    assert.ok(r.keyframes.length >= 3 && r.keyframes.length <= 5);
  }
});

test('álló testtartásból nem lesz kanyar; a rövid vagy követhetetlen felvétel nem ad elemzést', () => {
  assert.equal(run(series(10, () => ({ legTilt: 0 }))).turnCount, 0);
  assert.equal(detectTurns([0, 1, 2], [1, -1, 1]).length, 0);
  assert.equal(run(series(2, () => ({ legTilt: 0 }))).reason, 'too_short');
  assert.equal(run(series(10, () => ({ legTilt: 0, vis: 0.2 }))).reason, 'not_tracked');
  assert.equal(run([]).ok, false);
});

test('befelé dőlés: ha a törzs együtt dől a lábbal, az angulation „low”; ha függőlegesebb marad, „ok”', () => {
  const banking = run(series(15, t => ({ legTilt: 15 * wave(t, 3), torsoTilt: 15 * wave(t, 3) })));
  const good = run(series(15, t => ({ legTilt: 15 * wave(t, 3), torsoTilt: 4 * wave(t, 3) })));
  assert.equal(band(banking, 'angulation'), 'low');
  assert.equal(band(good, 'angulation'), 'ok');
  assert.ok(reliable(good, 'angulation'));
  /* kevés dőlésnél a mutató nem értelmezhető */
  assert.equal(run(series(15, t => ({ legTilt: 5 * wave(t, 3) }))).metrics.angulation.usable, false);
});

test('aszimmetria: ha az egyik irányú kanyar kétszer olyan hosszú, a symmetry „high”', () => {
  /* 3 mp-es ciklus: 2 mp az egyik, 1 mp a másik irányban */
  const tiltAt = t => { const p = t % 3; return p < 2 ? 15 * Math.sin(Math.PI * p / 2) : -15 * Math.sin(Math.PI * (p - 2)); };
  const r = run(series(21, t => ({ legTilt: tiltAt(t), torsoTilt: 0.3 * tiltAt(t) })));
  assert.equal(band(r, 'symmetry'), 'high');
  assert.ok(r.metrics.symmetry.detail.duration > 40);
});

test('oldalnézet: hátraülés és merev láb felismerése; szemből ezek nem használhatók', () => {
  const side = o => run(series(10, () => ({ view: 'side', ...o })), { view: 'side' });
  const back = side({ shin: 5, thigh: 60, torso: 30 });
  assert.equal(band(back, 'foreAft'), 'low');
  assert.ok(reliable(back, 'foreAft'));
  const good = side({ shin: 25, thigh: 30, torso: 25 });
  assert.equal(band(good, 'foreAft'), 'ok');
  assert.equal(band(good, 'kneeFlex'), 'ok');
  /* balra néző csúszónál is ugyanaz az eredmény */
  assert.equal(band(side({ shin: 5, thigh: 60, torso: 30, facing: -1 }), 'foreAft'), 'low');
  assert.equal(band(side({ shin: 3, thigh: 8, torso: 5 }), 'kneeFlex'), 'low');
  assert.equal(back.quality.viewGuess, 'side');
  const front = run(series(10, t => ({ legTilt: 12 * wave(t, 3) })));
  assert.equal(front.metrics.foreAft.usable, false);
  assert.equal(front.metrics.foreAft.confidence, 0);
});

test('megbízhatóság: távoli, kicsi alaknál a mutatók nem érik el a küszöböt', () => {
  const far = run(series(15, t => ({ legTilt: 15 * wave(t, 3), scale: 0.15, footY: 0.6 }), { noise: 0 }));
  assert.ok(far.quality.bodyHeight < 0.12);
  assert.ok(Object.values(far.metrics).every(m => m.confidence < RELIABLE));
});

test('sí és snowboard: a terpesz csak sín, a térdtávolság és a hátsó láb terhelése csak snowboardon számít', () => {
  const f = series(12, t => ({ legTilt: 12 * wave(t, 3), stance: 0.05 }));
  assert.equal(band(run(f), 'stance'), 'low');
  assert.equal(run(f).metrics.kneeTrack.usable, false);
  const sb = o => analyzeRun(series(10, () => ({ legTilt: -12, torsoTilt: -12, stance: 0.2, kneeW: 0.1 })), { aspect: A, sport: 'snowboard', view: 'side', ...o });
  assert.equal(sb({}).metrics.foreAft.usable, false, 'haladási irány nélkül nem értelmezhető');
  assert.equal(band(sb({ travel: 'left' }), 'foreAft'), 'low', 'balra haladva a jobbra tolt csípő a hátsó lábon van');
  assert.equal(band(sb({ travel: 'right' }), 'foreAft'), 'high');
  assert.equal(band(sb({ travel: 'left' }), 'kneeTrack'), 'low');
  assert.equal(sb({}).metrics.stance.usable, false);
});

/* ---- otthoni gyakorlatok ---- */
const ex = (id, frames) => analyzeExercise(frames, { aspect: A, exercise: id });
const chk = (r, id) => (r.checks.find(c => c.id === id) || {}).band;
const squatFlex = (t, period = 3) => 55 - 50 * Math.cos(2 * Math.PI * t / period); /* 5…105 fok */

test('ismétlésszámlálás: a jel hullámaiból pontosan annyi ismétlés, ahány volt', () => {
  const sig = Array.from({ length: 200 }, (_, i) => 130 + 40 * Math.cos(2 * Math.PI * i / 40));
  assert.equal(detectReps(sig, 30).length, 5);
  assert.equal(detectReps(sig.map(() => 170), 30).length, 0);
  assert.equal(detectReps(sig.map(v => 170 + (v - 130) / 10), 30).length, 0, 'túl kicsi mozgás nem ismétlés');
});

test('guggolás szemből: 5 ismétlés, jó mélység; beeső térdnél „knees_out” javítandó', () => {
  const good = ex('squat', series(15.5, t => ({ flex: squatFlex(t), stance: 0.2, kneeW: 0.24 })));
  assert.equal(good.reps, 5);
  assert.equal(chk(good, 'depth'), 'ok');
  assert.equal(chk(good, 'knees_out'), 'ok');
  assert.equal(chk(good, 'tempo'), 'ok');
  const valgus = ex('squat', series(15.5, t => ({ flex: squatFlex(t), stance: 0.2, kneeW: 0.24 - 0.12 * (squatFlex(t) / 105) })));
  assert.equal(valgus.reps, 5);
  assert.equal(chk(valgus, 'knees_out'), 'fix');
  const shallow = ex('squat', series(15.5, t => ({ flex: 25 - 20 * Math.cos(2 * Math.PI * t / 3), stance: 0.2, kneeW: 0.22 })));
  assert.ok(shallow.reps === 0 || chk(shallow, 'depth') === 'fix');
});

test('guggolás oldalról: az erősen előredőlő törzs „chest_up” javítandó', () => {
  const f = lean => series(12.5, t => { const k = (1 - Math.cos(2 * Math.PI * t / 3)) / 2; return { view: 'side', shin: 5 + 30 * k, thigh: 5 + 80 * k, torso: 5 + lean * k }; });
  const good = ex('squat', f(35)), bad = ex('squat', f(70));
  assert.equal(good.reps, 4);
  assert.equal(chk(good, 'chest_up'), 'ok');
  assert.equal(chk(bad, 'chest_up'), 'fix');
  assert.equal(good.perRep[0].view, 'side');
});

test('fal melletti ülés: a kitartott időt méri, az állás nem számít bele', () => {
  const r = ex('wall_sit', series(40, t => ({ view: 'side', ...(t < 30 ? { shin: 0, thigh: 88, torso: 0 } : { shin: 2, thigh: 5, torso: 0 }) })));
  assert.ok(r.holdSeconds >= 29 && r.holdSeconds <= 30.5, `tartás: ${r.holdSeconds}`);
  assert.equal(chk(r, 'knee_angle'), 'ok');
});

test('oldalirányú szökdelés: a váltások száma és a 20 mp-re vetített ütem', () => {
  const r = ex('lateral_hops', series(20, t => ({ cx: 0.5 + 0.1 * wave(t, 1), flex: 40 })));
  assert.ok(Math.abs(r.reps - 39) <= 2, `szökkenések: ${r.reps}`);
  assert.ok(Math.abs(r.rate - 39) <= 2);
  assert.equal(chk(r, 'rhythm'), 'ok');
});

test('egylábas állás: oldalanként méri a kilengést, és megnevezi a gyengébb oldalt', () => {
  const r = ex('sl_stand', series(52, t => (t < 25 ? { lift: 'right', legTilt: 0.5 * wave(t, 2) } : t < 27 ? {} : { lift: 'left', legTilt: 7 * wave(t, 2) }), { noise: 0.001 }));
  assert.ok(r.ok);
  assert.ok(r.sides.right > r.sides.left, 'a jobb lábon nagyobb a kilengés');
  assert.equal(r.weaker, 'right');
  assert.ok(r.asymmetry > 15);
  assert.ok(r.holdSeconds >= 23);
});

test('törzsfordítás: a két irány tartománya és a szűkebb oldal', () => {
  /* jobbra 60, balra 30 fokot fordul: a vállszélesség a koszinusszal csökken, az irányt a vállak mélysége adja */
  const r = ex('trunk_rotation', series(20, t => {
    const p = t % 10, deg = p < 5 ? 60 * Math.sin(Math.PI * p / 5) : -30 * Math.sin(Math.PI * (p - 5) / 5);
    return { shoulderW: 0.18 * Math.cos(deg * Math.PI / 180), shoulderZ: Math.sin(deg * Math.PI / 180) * 0.05, flex: 80 };
  }, { noise: 0.0005 }));
  assert.ok(Math.abs(r.sides.right - 60) < 8 && Math.abs(r.sides.left - 30) < 8, JSON.stringify(r.sides));
  assert.equal(r.weaker, 'left');
  assert.equal(chk(r, 'range'), 'fix');
});

test('ismeretlen gyakorlat és üres felvétel: hibával tér vissza, nem dob kivételt', () => {
  assert.equal(ex('nincs_ilyen', series(5, () => ({}))).reason, 'unknown_exercise');
  assert.equal(ex('squat', []).reason, 'not_tracked');
  assert.equal(ex('squat', series(8, () => ({ flex: 10 }))).reason, 'no_movement');
});
