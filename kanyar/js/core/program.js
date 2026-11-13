/* Mozgásfelmérés → profil → 6 hetes felkészülési program. Tiszta, determinisztikus függvények.
   A határértékek és a program szabályai szakmai becslések; edző vagy gyógytornász még nem lektorálta őket. */

export const TESTS = ['deep_squat', 'sl_squat', 'sl_stand', 'ankle_wall', 'lateral_hops', 'wall_sit', 'trunk_rotation'];
/* A gyenge pontok fontossági sorrendje: előbb a biztonság (térdkontroll), aztán a sítartáshoz kellő mozgékonyság. */
export const WEAK_ORDER = ['knee_control', 'ankle_mobility', 'balance', 'leg_strength', 'leg_endurance', 'hip_mobility', 'rotation', 'power'];
const ASYM_LIMIT = 15;   /* % bal–jobb különbség, ami fölött szólunk */
const HOPS_TARGET = 24;  /* oldalirányú szökdelés 20 mp alatt */
const WALL_SIT_TARGET = 45;

const fixed = (r, id) => !!r && r.checks.some(c => c.id === id && c.band === 'fix');

/* results: { tesztazonosító: az analyzeExercise eredménye } → profil */
export function buildProfile(results = {}) {
  const tags = new Set(), scores = {}, asym = [];
  const mark = (test, ...t) => { t.forEach(x => tags.add(x)); if (t.length) scores[test] = 'weak'; };
  for (const id of TESTS) {
    const r = results[id];
    if (!r || !r.ok) continue;
    scores[id] = 'ok';
    if (id === 'deep_squat') {
      if (fixed(r, 'depth') || fixed(r, 'chest_up')) mark(id, 'hip_mobility');
      if (fixed(r, 'knees_out')) mark(id, 'knee_control');
    } else if (id === 'sl_squat') {
      if (fixed(r, 'knee_line') || fixed(r, 'pelvis_level')) mark(id, 'knee_control');
      if (fixed(r, 'depth')) mark(id, 'leg_strength');
    } else if (id === 'sl_stand') {
      if (fixed(r, 'still') || fixed(r, 'hold_time')) mark(id, 'balance');
    } else if (id === 'ankle_wall') {
      if (fixed(r, 'ankle_range')) mark(id, 'ankle_mobility');
    } else if (id === 'lateral_hops') {
      if (r.rate != null && r.rate < HOPS_TARGET) mark(id, 'power');
      if (fixed(r, 'soft_landing')) mark(id, 'knee_control');
    } else if (id === 'wall_sit') {
      if ((r.holdSeconds || 0) < WALL_SIT_TARGET) mark(id, 'leg_endurance');
    } else if (id === 'trunk_rotation') {
      if (fixed(r, 'range')) mark(id, 'rotation');
    }
    if (r.asymmetry != null && r.asymmetry >= ASYM_LIMIT && r.weaker) asym.push({ test: id, weaker: r.weaker, pct: r.asymmetry });
  }
  const done = TESTS.filter(id => scores[id]).length;
  return { weak: WEAK_ORDER.filter(t => tags.has(t)), scores, asym, done, total: TESTS.length, complete: done === TESTS.length };
}

const FOCUS = {
  knee_control: 'glute_bridge', ankle_mobility: 'ankle_wall', balance: 'sl_reach', leg_strength: 'squat',
  leg_endurance: 'wall_sit', hip_mobility: 'stretch_hipflexor', rotation: 'thoracic_rotation', power: 'lateral_hops',
};
const MOBILITY = {
  ankle_mobility: 'stretch_calf', hip_mobility: 'stretch_hipflexor', rotation: 'thoracic_rotation',
  knee_control: 'stretch_glute', leg_strength: 'stretch_quad', leg_endurance: 'stretch_quad', balance: 'stretch_hamstring', power: 'stretch_hamstring',
};
const JUMPS = ['lateral_hops', 'squat_jump'];

/* profile: buildProfile eredménye (vagy null) · sport · exercises: { id: { dose: { reps | seconds }, perSide } } · health: { pain } */
export function buildProgram(profile, sport, exercises, health = {}) {
  const weak = (profile && profile.weak) || [];
  /* ugrás csak akkor, ha a felmérés megvolt, a térdkontroll rendben van, és nincs fájdalom */
  const jumpsOk = !!profile && profile.done > 0 && !weak.includes('knee_control') && !health.pain;
  const focus = weak.filter(t => jumpsOk || !JUMPS.includes(FOCUS[t])).slice(0, 2).map(t => FOCUS[t]);
  const mob = [...new Set([...weak.map(t => MOBILITY[t]), sport === 'snowboard' ? 'thoracic_rotation' : 'stretch_calf',
    'stretch_hipflexor', 'stretch_hamstring', 'stretch_quad', 'stretch_glute'])];
  const weeks = [];
  for (let w = 1; w <= 6; w++) {
    const sets = w <= 2 ? 2 : 3, scale = w >= 5 ? 1.25 : 1;
    const block = id => {
      const ex = exercises[id];
      if (!ex) throw new Error('Ismeretlen gyakorlat a programban: ' + id);
      const mobility = ex.type === 'mobility' || ex.type === 'warmup';
      const b = { exercise: id, sets: mobility ? 1 : sets, perSide: !!ex.perSide };
      if (ex.dose.seconds) b.seconds = mobility ? ex.dose.seconds : Math.round(ex.dose.seconds * scale / 5) * 5;
      else b.reps = Math.round(ex.dose.reps * scale);
      return b;
    };
    const session = (key, ids, n) => {
      const list = ['warmup_routine', ...ids, focus.length ? focus[(n + w) % focus.length] : null, mob[(n * 2 + w) % mob.length], mob[(n * 2 + w + 1) % mob.length]];
      const seen = new Set();
      return { key, blocks: list.filter(id => id && !seen.has(id) && seen.add(id)).map(block) };
    };
    weeks.push({
      week: w,
      sessions: [
        session('strength', ['squat', 'reverse_lunge', 'plank', 'sl_stand'], 0),
        session('lateral', ['lateral_lunge', 'glute_bridge', 'side_plank', jumpsOk && w >= 2 ? 'lateral_hops' : 'sl_reach'], 1),
        session('endurance', ['sl_squat', 'calf_raise', sport === 'snowboard' ? 'bird_dog' : 'dead_bug', 'wall_sit',
          w >= 3 ? (jumpsOk && w >= 5 ? 'squat_jump' : 'interval_squat') : null], 2),
      ],
    });
  }
  return { sport, weeks, jumps: jumpsOk, focus, retestWeek: 3 };
}
