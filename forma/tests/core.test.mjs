/* A pontozómag és a programgenerátor egységtesztjei. Futtatás: node --test forma/tests/*.test.mjs */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { percentile, bandIndex, scoreTest, evaluate, estimateVo2, fitnessAge, paIndex, levelOf, mobilityTargets, vo2Percentile } from '../js/core/score.js';
import { initialLevels, laddersOf, exerciseFor, weekInfo, doseFor, buildSession, sessionSteps, sessionMinutes, applyRatings, nextKey, reassessDue, streak, ROTATION, LADDERS } from '../js/core/program.js';
import { buildDailyIcs, fold, icsText } from '../js/core/calendar.js';

const json = f => JSON.parse(readFileSync(new URL('../data/' + f, import.meta.url), 'utf8'));
const norms = json('norms.json'), tests = json('tests.json'), ex = json('exercises.json').exercises;
const byId = Object.fromEntries(ex.map(e => [e.id, e]));
const DAY = 86400000;
const man34 = { age: 34, sex: 'male' };

test('percentilis: a töréspontokon pontos, közte monoton, a széleken 1 és 99 közé szorítva', () => {
  const cuts = [12, 17, 22, 30];
  assert.equal(percentile(12, cuts), 20);
  assert.equal(percentile(22, cuts), 60);
  assert.equal(percentile(30, cuts), 80);
  assert.equal(percentile(0, cuts), 1);
  assert.equal(percentile(200, cuts), 99);
  let prev = 0;
  for (let v = 0; v <= 60; v++) { const p = percentile(v, cuts); assert.ok(p >= prev, 'monoton'); prev = p; }
  /* fordított teszt (pulzus): a kisebb a jobb */
  assert.equal(percentile(87, [113, 103, 96, 87], true), 80);
  assert.ok(percentile(90, [113, 103, 96, 87], true) > percentile(110, [113, 103, 96, 87], true));
  assert.equal(percentile(null, cuts), null);
});

test('korsáv: 18 alatt nincs, 70 fölött az utolsó sáv jelzéssel', () => {
  assert.equal(bandIndex(norms.bands, 17), null);
  assert.deepEqual(bandIndex(norms.bands, 34), { index: 1, outside: false });
  assert.deepEqual(bandIndex(norms.bands, 18), { index: 0, outside: false });
  assert.deepEqual(bandIndex(norms.bands, 75), { index: 4, outside: true });
});

test('normák: minden normás teszthez van norma minden sávra és nemre, a töréspontok helyes irányban nőnek', () => {
  for (const t of tests.tests.filter(t => t.kind === 'norm')) {
    const n = norms.tests[t.id];
    assert.ok(n, 'nincs norma: ' + t.id);
    assert.ok(['A', 'B'].includes(n.quality) && n.source, t.id);
    for (const sex of ['male', 'female']) {
      assert.equal(n[sex].length, norms.bands.length, t.id + ' ' + sex);
      for (const c of n[sex]) {
        assert.equal(c.length, 4);
        for (let i = 1; i < 4; i++) assert.ok(n.lower ? c[i] <= c[i - 1] : c[i] >= c[i - 1], `${t.id} ${sex} ${c}`);
      }
    }
  }
});

test('teszt pontozása: norma, kritérium (választós és számos), alapvonal', () => {
  const push = scoreTest(tests.tests.find(t => t.id === 'pushup'), 22, man34, norms);
  assert.equal(push.kind, 'norm'); assert.equal(push.score, 60); assert.equal(push.quality, 'A');
  const sq = scoreTest(tests.tests.find(t => t.id === 'deep_squat'), 0, man34, norms);
  assert.equal(sq.pain, true); assert.ok(sq.score < 10);
  const ankle = scoreTest(tests.tests.find(t => t.id === 'ankle_wall'), 13, man34, norms);
  assert.equal(ankle.score, 90);
  const tap = scoreTest(tests.tests.find(t => t.id === 'tapping'), 40, man34, norms);
  assert.equal(tap.score, null);
  assert.equal(scoreTest(tests.tests.find(t => t.id === 'pushup'), '', man34, norms), null);
  /* nők: ugyanaz az ismétlésszám jobb percentilis (térdelő változat, más norma) */
  assert.ok(scoreTest(tests.tests.find(t => t.id === 'pushup'), 15, { age: 34, sex: 'female' }, norms).score > scoreTest(tests.tests.find(t => t.id === 'pushup'), 15, man34, norms).score);
  /* idősebb korban ugyanaz az eredmény többet ér */
  assert.ok(scoreTest(tests.tests.find(t => t.id === 'pushup'), 15, { age: 55, sex: 'male' }, norms).score > scoreTest(tests.tests.find(t => t.id === 'pushup'), 15, man34, norms).score);
});

test('VO₂max-becslés és fittségi kor (Nes-modell): átlagos 34 éves férfi kb. a saját korát kapja', () => {
  const vitals = { rhr: 65, waist: 90, frequency: 2.5, intensity: 5, duration: 0.75 };
  assert.equal(paIndex(vitals), 9.375);
  const v = estimateVo2(man34, vitals, norms);
  assert.ok(v > 45 && v < 52, String(v));
  const fa = fitnessAge(v, 'male', norms);
  assert.ok(fa >= 28 && fa <= 42, String(fa));
  /* edzettebb, karcsúbb → fiatalabb fittségi kor */
  const fit = estimateVo2(man34, { rhr: 50, waist: 80, frequency: 5, intensity: 10, duration: 0.75 }, norms);
  assert.ok(fitnessAge(fit, 'male', norms) < fa);
  assert.ok(vo2Percentile(fit, man34, norms) > vo2Percentile(v, man34, norms));
  assert.equal(estimateVo2(man34, { rhr: 60 }, norms), null);
  assert.equal(fitnessAge(99, 'male', norms), 20);
  assert.equal(fitnessAge(5, 'male', norms), 90);
});

const RESULTS = { deep_squat: 2, shoulder_reach: 2, ankle_wall: 9, sit_reach: 0, hip_flexor: 2, pushup: 20, chair_stand: 22, plank: 70, broad_jump: 205, tapping: 40, sl_stance: 7, sit_rise: 9, step_test: 100 };
const VITALS = { rhr: 62, waist: 88, frequency: 2.5, intensity: 5, duration: 0.75 };

test('teljes kiértékelés: minden terület kap pontot, a leggyengébb kettő kijön, a hiányzó terület üres', () => {
  const ev = evaluate({ results: RESULTS, vitals: VITALS, profile: man34 }, tests, norms);
  assert.deepEqual(Object.keys(ev.areas).sort(), tests.areas.map(a => a.id).sort());
  for (const a of Object.values(ev.areas)) assert.ok(a.score >= 1 && a.score <= 99 && ['low', 'mid', 'top'].includes(a.level));
  assert.equal(ev.weakest.length, 2);
  const min = Math.min(...Object.values(ev.areas).map(a => a.score));
  assert.equal(ev.areas[ev.weakest[0]].score, min);
  assert.ok(ev.fitnessAge != null && ev.overall != null);
  const partial = evaluate({ results: { pushup: 20, chair_stand: 22 }, profile: man34 }, tests, norms);
  assert.deepEqual(Object.keys(partial.areas), ['strength']);
  assert.equal(partial.fitnessAge, null);
  assert.equal(levelOf(39), 'low'); assert.equal(levelOf(40), 'mid'); assert.equal(levelOf(75), 'top');
  const targets = mobilityTargets(ev, tests);
  assert.equal(targets[0].target, 'hamstring', 'a leggyengébb mobilitási célterület elöl');
});

test('kezdő szintek a mért eredményből; fájdalomnál a legkönnyebb', () => {
  const ev = evaluate({ results: RESULTS, vitals: VITALS, profile: man34 }, tests, norms);
  const L = initialLevels(RESULTS, ev, man34);
  for (const k of LADDERS) assert.ok(Number.isInteger(L[k]) && L[k] >= 0, k);
  assert.equal(L.push, 3, '20 fekvőtámasz → teljes fekvőtámasz');
  assert.equal(L.core, 2, '70 mp plank → plank vállérintéssel');
  const weak = initialLevels({ pushup: 1, chair_stand: 9, plank: 15 }, { tests: {}, areas: {} }, man34);
  assert.equal(weak.push, 0); assert.equal(weak.squat, 0); assert.equal(weak.core, 0);
  const pain = evaluate({ results: { ...RESULTS, deep_squat: 0, shoulder_reach: 0 }, profile: man34 }, tests, norms);
  const P = initialLevels({ ...RESULTS, deep_squat: 0 }, pain, man34);
  assert.equal(P.squat, 0); assert.equal(P.push, 0);
  const empty = initialLevels({}, { tests: {}, areas: {} }, man34);
  assert.equal(empty.push, 1);
});

test('gyakorlatsorok: minden szint megvan 0-tól folyamatosan, minden hivatkozott gyakorlat létezik', () => {
  const lad = laddersOf(ex);
  for (const k of LADDERS) {
    assert.ok(lad[k] && lad[k].length >= 2, k);
    lad[k].forEach((e, i) => assert.equal(e.level, i, `${k} ${e.id}`));
  }
  /* kímélő módban nincs ugrásos gyakorlat */
  for (let lv = 0; lv < 5; lv++) for (const k of ['power', 'speed']) { const e = exerciseFor(lad, k, lv, true); assert.ok(e && !e.impact, `${k} ${lv}`); }
});

test('heti adag: az 1. héten a kezdő, az 5.-en a cél, a könnyített héten újra a kezdő', () => {
  const e = byId.push_full;
  assert.deepEqual(doseFor(e, 1), { reps: 6 });
  assert.deepEqual(doseFor(e, 5), { reps: 15 });
  assert.deepEqual(doseFor(e, 6, true), { reps: 6 });
  assert.equal(doseFor(byId.plank, 3).seconds % 5, 0);
  const start = new Date(2026, 0, 5).getTime();
  assert.deepEqual(weekInfo(start, start + 2 * DAY), { week: 1, cycleWeek: 1, deload: false, cycle: 1 });
  assert.equal(weekInfo(start, start + 36 * DAY).deload, true);
  assert.deepEqual(weekInfo(start, start + 43 * DAY), { week: 7, cycleWeek: 1, deload: false, cycle: 2 });
});

test('edzések: minden nap mobilitással indul, hossza 10–35 perc, a lépések helyesek', () => {
  const ev = evaluate({ results: RESULTS, vitals: VITALS, profile: man34 }, tests, norms);
  const state = { levels: initialLevels(RESULTS, ev, man34), targets: mobilityTargets(ev, tests).map(t => t.target), start: Date.now() };
  for (const k of new Set(ROTATION)) {
    const s = buildSession(k, state, ex), steps = sessionSteps(s, byId), min = sessionMinutes(steps);
    assert.ok(min >= 8 && min <= 35, `${k}: ${min} perc`);
    assert.ok(s.blocks.some(b => b.part === 'mobility'), k);
    assert.ok(s.blocks.every(b => byId[b.exercise]), k);
    assert.notEqual(steps[steps.length - 1].type, 'rest', 'nem pihenővel ér véget');
    /* minden értékelendő gyakorlatsor pontosan egyszer kér értékelést */
    const rated = steps.filter(st => st.rate).map(st => st.rate);
    assert.deepEqual(rated, s.blocks.filter(b => b.rate).map(b => b.ladder), k);
  }
  /* a mobilitásnapon a leggyengébb célterület kerül előre */
  const mob = buildSession('mobility', state, ex);
  assert.ok(mob.blocks.some(b => (byId[b.exercise].target || []).includes(state.targets[0])));
  /* kímélő módban sehol nincs ugrás */
  for (const k of new Set(ROTATION)) assert.ok(buildSession(k, { ...state, levels: { ...state.levels, power: 4, speed: 3 }, lowImpact: true }, ex).blocks.every(b => !byId[b.exercise].impact), k);
  /* oldalanként tartott gyakorlat két lépés (bal, jobb) */
  const side = sessionSteps({ blocks: [{ exercise: 'side_plank', ladder: 'side', sets: 1, seconds: 20, rest: 0, rate: true }] }, byId);
  assert.deepEqual(side.map(s => s.side), ['left', 'right']);
  assert.equal(side[1].rate, 'side');
});

test('szintlépés: két könnyű → fel, két „nem ment” → le, a csúcson és az alján megáll', () => {
  let st = { levels: { push: 2 }, ratings: {} };
  ({ state: st } = applyRatings(st, { push: 'easy' }, ex));
  assert.equal(st.levels.push, 2);
  let ch;
  ({ state: st, changes: ch } = applyRatings(st, { push: 'easy' }, ex));
  assert.equal(st.levels.push, 3); assert.equal(ch[0].to, 3);
  ({ state: st } = applyRatings(st, { push: 'fail' }, ex));
  ({ state: st } = applyRatings(st, { push: 'fail' }, ex));
  assert.equal(st.levels.push, 2);
  const top = applyRatings({ levels: { push: 4 }, ratings: { push: ['easy'] } }, { push: 'easy' }, ex);
  assert.equal(top.state.levels.push, 4); assert.equal(top.changes.length, 0);
  const mixed = applyRatings({ levels: { push: 2 }, ratings: { push: ['easy'] } }, { push: 'ok' }, ex);
  assert.equal(mixed.state.levels.push, 2);
  assert.equal(applyRatings({ levels: {} }, { nope: 'easy', push: 'bogus' }, ex).changes.length, 0, 'ismeretlen bemenet nem változtat');
});

test('forgó rend, újramérés, sorozat', () => {
  assert.equal(nextKey({ done: 0 }), 'strengthA');
  assert.equal(nextKey({ done: 9 }), ROTATION[2]);
  const now = Date.now();
  assert.equal(reassessDue(null, null, now), true);
  assert.equal(reassessDue(now - 10 * DAY, { start: now - 10 * DAY }, now), false);
  assert.equal(reassessDue(now - 43 * DAY, { start: now - 43 * DAY }, now), true);
  const base = new Date(2026, 5, 10, 12).getTime();
  assert.equal(streak([base, base - DAY, base - 2 * DAY], base), 3);
  assert.equal(streak([base - DAY, base - 2 * DAY], base), 2, 'ma még nem edzett: tegnaptól számol');
  assert.equal(streak([base - 3 * DAY], base), 0);
});

test('napi emlékeztető naptárfájl', () => {
  const ics = buildDailyIcs({ time: '06:45', start: new Date(2026, 0, 5), days: 42, title: 'Forma, edzés; ma', now: new Date(Date.UTC(2026, 0, 1)) });
  assert.match(ics, /DTSTART:20260105T064500/);
  assert.match(ics, /RRULE:FREQ=DAILY;COUNT=42/);
  assert.match(ics, /SUMMARY:Forma\\, edzés\\; ma/);
  assert.ok(ics.split('\r\n').every(l => new TextEncoder().encode(l).length <= 75));
  assert.throws(() => buildDailyIcs({ time: '25:00' }));
  assert.equal(icsText('a\nb'), 'a\\nb');
  assert.equal(fold('x'.repeat(80)).split('\r\n ').length, 2);
});

test('mentésfájl: érvényes visszatöltés, idegen és sérült fájl elutasítása, ismeretlen mezők kiszűrése', async () => {
  const { parseBackup } = await import('../js/core/backup.js');
  const ctx = { testIds: tests.tests.map(t => t.id), ladders: LADDERS, sessionKeys: [...new Set(ROTATION)], ratingKeys: ['easy', 'ok', 'hard', 'fail'], cardioTypes: ['walk', 'run'] };
  const good = {
    app: 'forma', version: 1,
    settings: { accepted: true, profile: { age: 34, sex: 'male' }, lowImpact: false, parq: { heart: false }, evil: '<script>' },
    program: { start: 1700000000000, levels: { push: 3, bogus: 9 }, ratings: { push: ['easy', 'x'] }, done: 4, targets: ['ankle', '<img>'] },
    items: [
      { id: 'a1', kind: 'assessment', date: 1700000000000, profile: { age: 34, sex: 'male' }, results: { pushup: 20, hack: 5, plank: 'sok' }, vitals: { rhr: 60 } },
      { id: 'w1', kind: 'workout', date: 1700000100000, key: 'strengthA', minutes: 25, ratings: { push: 'easy' } },
      { id: 'w1', kind: 'workout', date: 1700000100000, key: 'strengthA', minutes: 25 },
      { id: 'c1', kind: 'cardio', date: 5, type: 'walk', minutes: 30, intensity: 'vigorous' }, { id: 'c2', kind: 'cardio', date: 6, type: 'repülés', minutes: 30 },
      { id: 'x', kind: 'mystery', date: 1 }, { id: 'w2', kind: 'workout', date: 2, key: 'nincs' },
    ],
  };
  const r = parseBackup(JSON.stringify(good), ctx);
  assert.equal(r.ok, true);
  assert.deepEqual(r.data.settings, { accepted: true, profile: { age: 34, sex: 'male' }, lowImpact: false, parq: { heart: false } });
  assert.deepEqual(r.data.program.levels, { push: 3 });
  assert.deepEqual(r.data.program.ratings.push, ['easy']);
  assert.deepEqual(r.data.program.targets, ['ankle']);
  assert.equal(r.data.items.length, 3, 'ismétlődő, ismeretlen típusú és ismeretlen edzésű tétel kimarad');
  assert.deepEqual(r.data.items.find(i => i.kind === 'cardio'), { id: 'c1', kind: 'cardio', date: 5, type: 'walk', minutes: 30, intensity: 'vigorous' });
  assert.deepEqual(r.data.items[0].results, { pushup: 20 });
  assert.equal(parseBackup('nem json', ctx).ok, false);
  assert.equal(parseBackup(JSON.stringify({ app: 'kanyar', version: 1, items: [] }), ctx).ok, false);
  assert.equal(parseBackup(JSON.stringify({ app: 'forma', version: 1, items: 'x' }), ctx).ok, false);
  assert.equal(parseBackup('', ctx).ok, false);
});
