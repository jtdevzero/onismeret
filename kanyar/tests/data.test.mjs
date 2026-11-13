/* A tartalom és a kód összhangja: minden hivatkozott azonosító létezik, a program és a helyi edző a valódi adatokkal működik. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ANALYZERS, analyzeExercise } from '../js/core/exercise.js';
import { TESTS, WEAK_ORDER, buildProfile, buildProgram } from '../js/core/program.js';
import { analyzeRun, THRESHOLDS } from '../js/core/snow.js';
import { localSnowCoach, localPrepCoach, validSnowCoach, validPrepCoach, triggeredFaults } from '../js/core/coach.js';
import { series, wave } from './synth.mjs';

const load = n => JSON.parse(readFileSync(new URL('../data/' + n, import.meta.url), 'utf8'));
const EX = load('exercises.json'), LES = load('lessons.json'), FA = load('faults.json');
const ex = Object.fromEntries(EX.exercises.map(e => [e.id, e])), lesson = Object.fromEntries(LES.lessons.map(l => [l.id, l]));
const squatFlex = t => 55 - 50 * Math.cos(2 * Math.PI * t / 3);

test('gyakorlatok: egyedi azonosítók, kötelező mezők, https videólinkek, létező könnyítés és nehezítés', () => {
  assert.equal(new Set(EX.exercises.map(e => e.id)).size, EX.exercises.length);
  for (const e of EX.exercises) {
    assert.ok(e.name && e.how && e.onSnow && e.query, e.id);
    assert.equal(e.points.length, 3, e.id);
    assert.ok(EX.typeNames[e.type], e.id);
    assert.ok(e.dose.reps > 0 || e.dose.seconds > 0, e.id);
    for (const v of e.videos) { assert.ok(v.title, e.id); assert.match(v.url, /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/, e.id); }
    for (const k of ['easier', 'harder']) if (e[k]) assert.ok(ex[e[k]], `${e.id}.${k}`);
  }
  for (const list of Object.values(EX.workouts)) for (const v of list) assert.match(v.url, /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);
  for (const w of WEAK_ORDER) assert.ok(EX.weakNames[w], w);
});

test('minden elemezhető gyakorlathoz van kameratanács és szöveg az összes ellenőrzött ponthoz', () => {
  const produced = {
    squat: ['depth', 'knees_out', 'chest_up', 'tempo'], deep_squat: ['depth', 'knees_out', 'chest_up', 'tempo'],
    sl_squat: ['depth', 'knee_line', 'pelvis_level'], reverse_lunge: ['depth', 'chest_up', 'tempo'],
    lateral_lunge: ['depth', 'other_leg_straight', 'chest_up'], glute_bridge: ['hips_high', 'tempo'], lateral_hops: ['rhythm', 'soft_landing'],
    wall_sit: ['knee_angle', 'steady'], plank: ['straight_line', 'steady'], side_plank: ['straight_line', 'steady'],
    sl_stand: ['still', 'hold_time'], trunk_rotation: ['range'], ankle_wall: ['ankle_range'],
  };
  assert.deepEqual(Object.keys(produced).sort(), Object.keys(ANALYZERS).sort());
  for (const [id, checks] of Object.entries(produced)) {
    assert.ok(ex[id], id);
    assert.ok(ex[id].camera, id + ': kameratanács');
    for (const c of checks) for (const k of ['good', 'fix', 'cue']) assert.ok(ex[id].checkpoints[c][k], `${id}.${c}.${k}`);
  }
  for (const t of TESTS) assert.ok(ANALYZERS[t] && ex[t], t);
});

test('leckék: egyedi azonosítók, mindkét sportág első két szintjén van lecke', () => {
  assert.equal(new Set(LES.lessons.map(l => l.id)).size, LES.lessons.length);
  for (const l of LES.lessons) { assert.ok(l.title && l.body.length, l.id); assert.ok(['lesson', 'drill', 'guide'].includes(l.kind), l.id); }
  for (const sport of ['ski', 'snowboard']) {
    assert.equal(LES.levels[sport].length, 5);
    for (const lv of [1, 2]) assert.ok(LES.lessons.filter(l => l.sport === sport && l.level === lv && l.kind === 'lesson').length >= 5, `${sport} ${lv}. szint`);
  }
  for (const id of ['guide_filming', 'guide_fis', 'guide_limits', 'guide_mountain_routine']) assert.ok(lesson[id], id);
});

test('hibakatalógus: létező mutatók, sávok, gyakorlatok és otthoni gyakorlatok; minden mutatónak van neve', () => {
  assert.equal(new Set(FA.faults.map(f => f.id)).size, FA.faults.length);
  for (const f of FA.faults) {
    assert.ok(f.summary && f.what && f.why && f.cue && f.when.length && f.drills.length, f.id);
    for (const c of f.when) { assert.ok(THRESHOLDS[c.metric], `${f.id}: ${c.metric}`); assert.ok(THRESHOLDS[c.metric][c.band] != null, `${f.id}: ${c.metric}.${c.band}`); }
    for (const d of f.drills) { assert.ok(lesson[d] && lesson[d].kind === 'drill', `${f.id}: ${d}`); assert.ok(f.sports.includes(lesson[d].sport), `${f.id}: ${d} sportága`); }
    for (const hm of f.home) { assert.ok(ex[hm.exercise], `${f.id}: ${hm.exercise}`); assert.ok(WEAK_ORDER.includes(hm.weak), `${f.id}: ${hm.weak}`); }
  }
  for (const m of Object.keys(THRESHOLDS)) { assert.ok(FA.metricNames[m], m); assert.ok(FA.bandNames[m].ok, m); for (const b of Object.keys(THRESHOLDS[m])) assert.ok(FA.bandNames[m][b], `${m}.${b}`); }
  for (const s of FA.strengths) assert.ok(THRESHOLDS[s.metric] && s.text, s.metric);
});

test('program: 6 hét × 3 edzés, csak létező gyakorlatokkal; térdgond, fájdalom vagy felmérés hiánya esetén nincs ugrás', () => {
  const jumps = p => p.weeks.flatMap(w => w.sessions.flatMap(s => s.blocks.map(b => b.exercise))).filter(id => ['lateral_hops', 'squat_jump'].includes(id));
  for (const sport of ['ski', 'snowboard']) {
    const p = buildProgram({ weak: [], done: 7 }, sport, ex);
    assert.equal(p.weeks.length, 6);
    for (const w of p.weeks) {
      assert.equal(w.sessions.length, 3);
      for (const s of w.sessions) {
        assert.equal(s.blocks[0].exercise, 'warmup_routine');
        assert.equal(new Set(s.blocks.map(b => b.exercise)).size, s.blocks.length, 'nincs ismétlődő gyakorlat');
        assert.ok(s.blocks.length >= 6 && s.blocks.length <= 9);
        for (const b of s.blocks) { assert.ok(ex[b.exercise]); assert.ok(b.reps > 0 || b.seconds > 0); }
      }
    }
    assert.ok(jumps(p).length > 0);
    assert.ok(p.weeks[5].sessions[0].blocks[1].reps > p.weeks[0].sessions[0].blocks[1].reps, 'a terhelés nő');
    assert.ok(p.weeks[2].sessions[0].blocks[1].sets > p.weeks[0].sessions[0].blocks[1].sets);
  }
  assert.equal(jumps(buildProgram({ weak: ['knee_control'], done: 7 }, 'ski', ex)).length, 0);
  assert.equal(jumps(buildProgram({ weak: [], done: 7 }, 'ski', ex, { pain: true })).length, 0);
  assert.equal(jumps(buildProgram(null, 'ski', ex)).length, 0);
  assert.deepEqual(buildProgram({ weak: ['power'], done: 7 }, 'ski', ex), buildProgram({ weak: ['power'], done: 7 }, 'ski', ex), 'determinisztikus');
  assert.ok(buildProgram({ weak: ['ankle_mobility'], done: 3 }, 'ski', ex).focus.includes('ankle_wall'));
});

test('profil: a beeső térdű guggolásból térdkontroll-gyengeség lesz, a jó guggolásból nem', () => {
  const run = kneeW => analyzeExercise(series(15.5, t => ({ flex: squatFlex(t), stance: 0.2, kneeW: kneeW(t) })), { aspect: 1, exercise: 'deep_squat' });
  const bad = buildProfile({ deep_squat: run(t => 0.24 - 0.12 * (squatFlex(t) / 105)) });
  assert.ok(bad.weak.includes('knee_control'));
  assert.equal(bad.scores.deep_squat, 'weak');
  assert.equal(bad.done, 1);
  const good = buildProfile({ deep_squat: run(() => 0.24) });
  assert.deepEqual(good.weak, []);
  assert.equal(buildProfile({}).done, 0);
  assert.equal(buildProfile({ deep_squat: { ok: false } }).done, 0);
});

test('helyi edző a hóra: hátraülésnél azt nevezi meg, érvényes formában; ismétlődő hibánál másik gyakorlatot ad', () => {
  const a = analyzeRun(series(10, () => ({ view: 'side', shin: 5, thigh: 60, torso: 30 })), { aspect: 1, sport: 'ski', view: 'side' });
  const ids = { faults: FA.faults.map(f => f.id), drills: LES.lessons.filter(l => l.kind === 'drill').map(l => l.id), homeDrills: EX.exercises.map(e => e.id) };
  const c = localSnowCoach(a, { level: 2, catalog: FA, profile: { weak: ['ankle_mobility'] }, history: null });
  assert.equal(c.main_issue.id, 'backseat');
  assert.equal(c.drill_id, 'drill_shin_pressure');
  assert.equal(c.home_drill_id, 'ankle_wall', 'a gyenge bokához otthoni gyakorlat jár');
  assert.ok(validSnowCoach(c, ids));
  assert.equal(localSnowCoach(a, { level: 2, catalog: FA, profile: null, history: null }).home_drill_id, null);
  const again = localSnowCoach(a, { level: 2, catalog: FA, profile: null, history: { faultId: 'backseat', drillId: 'drill_shin_pressure' } });
  assert.equal(again.drill_id, 'drill_hands_forward');
  assert.ok(again.progress);
  assert.equal(triggeredFaults(a, FA, 2)[0].id, 'backseat', 'több hiba közül az alapvetőbb az első');
});

test('helyi edző a hóra: a befelé dőlés 1. szinten még nem hiba; bizonytalan felvételnél nem találgat', () => {
  const bank = analyzeRun(series(15, t => ({ legTilt: 15 * wave(t, 3), torsoTilt: 15 * wave(t, 3) })), { aspect: 1, sport: 'ski', view: 'front' });
  assert.equal(localSnowCoach(bank, { level: 3, catalog: FA }).main_issue.id, 'banking');
  assert.notEqual(localSnowCoach(bank, { level: 1, catalog: FA }).main_issue.id, 'banking');
  const far = analyzeRun(series(15, t => ({ legTilt: 15 * wave(t, 3), scale: 0.15, footY: 0.6 }), { noise: 0 }), { aspect: 1, sport: 'ski', view: 'front' });
  const c = localSnowCoach(far, { level: 3, catalog: FA });
  assert.equal(c.main_issue.id, null);
  assert.equal(c.confidence, 'low');
  assert.ok(c.reshoot_tip);
  assert.equal(c.drill_id, null);
});

test('helyi edző otthonra: érvényes forma; fájdalomnál nem nehezít; két hibánál könnyít', () => {
  const T = { count_hold: '{n}', count_reps: '{n}', sum_fix: 'f', sum_ok: 'o', pain_summary: 'p', good_fallback: 'g', nofix_what: 'n', nofix_cue: 'c', asym: '{side} {pct}', left: 'bal', right: 'jobb', reshoot: 'r' };
  const good = analyzeExercise(series(15.5, t => ({ flex: squatFlex(t), stance: 0.2, kneeW: 0.24 })), { aspect: 1, exercise: 'squat' });
  const c = localPrepCoach(good, ex.squat, { texts: T });
  assert.equal(c.next, 'harder');
  assert.equal(c.option_id, 'sl_squat');
  assert.ok(validPrepCoach(c, ['sl_squat']));
  assert.equal(localPrepCoach(good, ex.squat, { texts: T, health: { pain: true } }).next, 'keep', 'fájdalomnál nincs nehezítés (a guggolásnak nincs könnyebb változata)');
  assert.equal(localPrepCoach(good, ex.sl_squat, { texts: T, health: { pain: true } }).option_id, 'squat');
});

test('érvényesítő: hiányzó mező, ismeretlen azonosító, túl hosszú szöveg és rossz típus elbukik', () => {
  const ids = { faults: ['backseat'], drills: ['d1'], homeDrills: ['h1'] };
  const ok = { summary: 's', strength: 's', main_issue: { id: 'backseat', what: 'w', why: 'y', evidence: ['foreAft'] }, drill_id: 'd1', home_drill_id: null, cue: null, progress: null, confidence: 'high', reshoot_tip: null };
  assert.ok(validSnowCoach(ok, ids));
  for (const bad of [null, [], 'x', { ...ok, drill_id: 'zzz' }, { ...ok, home_drill_id: 'zzz' }, { ...ok, confidence: 'biztos' }, { ...ok, summary: 'x'.repeat(401) },
    { ...ok, summary: { toString: () => 'x' } }, { ...ok, main_issue: { ...ok.main_issue, id: 'zzz' } }, { ...ok, main_issue: { ...ok.main_issue, evidence: 'foreAft' } }, { ...ok, main_issue: null }]) assert.equal(validSnowCoach(bad, ids), false);
  const p = { summary: 's', good: 'g', fix: { what: 'w', cue: 'c', evidence: [] }, on_snow: 'o', next: 'keep', option_id: null, asymmetry: null, confidence: 'low', reshoot_tip: null };
  assert.ok(validPrepCoach(p, []));
  for (const bad of [{ ...p, next: 'jump' }, { ...p, option_id: 'x' }, { ...p, fix: null }, { ...p, good: '' }]) assert.equal(validPrepCoach(bad, []), false);
});

test('build: az index.html és az sw.js friss, a gyorsítótár-lista minden fájlja létezik, a CSP szigorú', async () => {
  const { execFileSync } = await import('node:child_process');
  const { existsSync } = await import('node:fs');
  const root = new URL('../', import.meta.url);
  const read = n => readFileSync(new URL(n, root), 'utf8');
  const before = [read('index.html'), read('sw.js')];
  execFileSync('python3', [new URL('build.py', root).pathname]);
  assert.deepEqual([read('index.html'), read('sw.js')], before, 'futtasd: python3 kanyar/build.py');
  const list = JSON.parse(/const PRECACHE = (\[[\s\S]*?\]);/.exec(before[1])[1]);
  for (const f of list) if (f !== './') assert.ok(existsSync(new URL(f, root)), f);
  assert.ok(list.includes('js/ui/app.js') && list.includes('data/faults.json'));
  assert.ok(!list.some(f => f.includes('vendor/')), 'a 16 MB-os pózbecslő nem a telepítéskor töltődik');
  const csp = /Content-Security-Policy" content="([^"]+)"/.exec(before[0])[1];
  assert.match(csp, /script-src 'self' 'wasm-unsafe-eval';/);
  assert.match(csp, /style-src 'self';/);
  assert.doesNotMatch(csp, /unsafe-inline|(?<!wasm-)unsafe-eval|\*(?!\.workers\.dev)/);
  assert.doesNotMatch(before[0], /<script(?![^>]*\bsrc=)|\son\w+=|style="/, 'nincs beágyazott szkript, eseménykezelő vagy stílus');
});
