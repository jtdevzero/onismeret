/* Fejlődés: egyéni rekordok, jelvények, célok, aktuális fittségi kor a friss derékbőséggel, és a félidős mini-teszt.
   Tiszta függvények, DOM nélkül. items: a tárolt tételek (assessment, mini, workout, cardio, body, goal). */
import { estimateVo2, fitnessAge } from './score.js';
import { weekStart, weeklyCardio } from './cardio.js';

const DAY = 86400000;
export const MINI_TESTS = ['pushup', 'plank', 'sl_stance'];
/* ezeknél a kisebb érték a jobb */
export const LOWER_BETTER = new Set(['step_test', 'fitness_age', 'waist']);

/* Egy mért érték története a felmérésekből és a mini-tesztekből, időrendben. → [{ date, value, source }] */
export function testHistory(items, id) {
  return items.filter(i => (i.kind === 'assessment' || i.kind === 'mini') && i.results && Number.isFinite(i.results[id]))
    .map(i => ({ date: i.date, value: i.results[id], source: i.kind })).sort((a, b) => a.date - b.date);
}
export const latestValue = (items, id) => { const h = testHistory(items, id); return h.length ? h[h.length - 1] : null; };

/* Egyéni rekordok tesztenként. ids: a pontozható, számos tesztek → [{ id, best, date, count }] */
export function records(items, ids) {
  return ids.map(id => {
    const h = testHistory(items, id);
    if (!h.length) return null;
    const best = h.reduce((a, b) => ((LOWER_BETTER.has(id) ? b.value < a.value : b.value > a.value) ? b : a));
    return { id, best: best.value, date: best.date, count: h.length, improved: h.length > 1 && best !== h[0] };
  }).filter(Boolean);
}

/* Testméretek: a legutóbbi derékbőség és testsúly, és a változás az elsőhöz képest. */
export function bodyTrend(items) {
  const b = items.filter(i => i.kind === 'body').sort((a, c) => a.date - c.date);
  const last = k => [...b].reverse().find(i => Number.isFinite(i[k])), first = k => b.find(i => Number.isFinite(i[k]));
  const out = {};
  for (const k of ['waist', 'weight']) {
    const l = last(k), f = first(k);
    out[k] = l ? { value: l[k], date: l.date, change: f && f !== l ? Math.round((l[k] - f[k]) * 10) / 10 : null } : null;
  }
  return out;
}

/* Fittségi kor most: a legutóbbi felmérés alapadatai, a friss derékbőséggel (ha van újabb mérés). */
export function currentFitnessAge(items, profile, norms) {
  const a = items.filter(i => i.kind === 'assessment' && i.vitals).sort((x, y) => y.date - x.date)[0];
  if (!a) return null;
  const t = bodyTrend(items), vitals = { ...a.vitals };
  if (t.waist && t.waist.date > a.date) vitals.waist = t.waist.value;
  const vo2 = estimateVo2(profile, vitals, norms);
  return vo2 == null ? null : { age: fitnessAge(vo2, profile.sex, norms), vo2, waistUpdated: vitals.waist !== a.vitals.waist };
}

/* Egy cél jelenlegi értéke. metric: tesztazonosító, 'fitness_age', 'waist' vagy 'weight'. */
export function metricValue(items, metric, profile, norms) {
  if (metric === 'fitness_age') { const f = currentFitnessAge(items, profile, norms); return f ? f.age : null; }
  if (metric === 'waist' || metric === 'weight') { const t = bodyTrend(items)[metric]; return t ? t.value : null; }
  const v = latestValue(items, metric);
  return v ? v.value : null;
}

/* Cél állása. goal: { metric, start, target, deadline } → { current, pct, done, daysLeft, lower } */
export function goalProgress(goal, items, profile, norms, now = Date.now()) {
  const current = metricValue(items, goal.metric, profile, norms);
  const lower = goal.target < goal.start;
  const span = goal.target - goal.start;
  const pct = current == null || !span ? 0 : Math.round(100 * Math.min(1, Math.max(0, (current - goal.start) / span)));
  const done = current != null && (lower ? current <= goal.target : current >= goal.target);
  return { current, pct: done ? 100 : pct, done, lower, daysLeft: goal.deadline ? Math.ceil((goal.deadline - now) / DAY) : null };
}

/* Jelvények: csak a saját teljesítményedhez mérve. → [{ id, name, about, earned, date? }] */
export function badges(items, ctx = {}) {
  const ws = items.filter(i => i.kind === 'workout').sort((a, b) => a.date - b.date);
  const cs = items.filter(i => i.kind === 'cardio');
  const ups = ws.flatMap(w => (w.changes || []).filter(c => c.to > c.from).map(c => ({ ...c, date: w.date })));
  const nth = n => (ws.length >= n ? ws[n - 1].date : null);
  /* négy egymást követő hét, mindegyikben legalább 4 edzés */
  const weeks = new Map();
  for (const w of ws) { const k = weekStart(w.date); weeks.set(k, (weeks.get(k) || 0) + 1); }
  let run = 0, fourWeeks = null;
  for (const k of [...weeks.keys()].sort((a, b) => a - b)) {
    const prev = weeks.has(k - 7 * DAY) && weeks.get(k - 7 * DAY) >= 4;
    run = weeks.get(k) >= 4 ? (prev ? run + 1 : 1) : 0;
    if (run >= 4 && !fourWeeks) fourWeeks = k;
  }
  /* heti 150 kardióperc valamelyik héten */
  const cardioWeeks = [...new Set(cs.map(c => weekStart(c.date)))].sort((a, b) => a - b);
  const cardioWeek = cardioWeeks.find(k => weeklyCardio(cs, k + DAY).equivalent >= 150) ?? null;
  const pullUp = ups.find(u => u.ladder === 'pull_bar' && u.to >= 3);
  const pushFull = ups.find(u => u.ladder === 'push' && u.to >= 3);
  const recs = (ctx.records || []).filter(r => r.improved);
  const list = [
    ['first', 'Az első edzés', 'Elkezdted.', nth(1)],
    ['ten', '10 edzés', 'A szokás kezd kialakulni.', nth(10)],
    ['fifty', '50 edzés', 'Ez már életmód.', nth(50)],
    ['hundred', '100 edzés', 'Kitartás felsőfokon.', nth(100)],
    ['levelup', 'Első szintlépés', 'Egy gyakorlat könnyűvé vált, jöhet a nehezebb.', ups.length ? ups[0].date : null],
    ['fourweeks', 'Négy erős hét', 'Négy hét egymás után, hetente legalább 4 edzéssel.', fourWeeks],
    ['cardio150', 'Heti 150 perc', 'Egy héten belül teljesítetted a WHO kardióajánlását.', cardioWeek],
    ['pushup', 'Teljes fekvőtámasz', 'Elérted a teljes fekvőtámasz szintjét.', pushFull ? pushFull.date : null],
    ['pullup', 'Első húzódzkodás', 'Elérted a húzódzkodás szintjét a rúdon.', pullUp ? pullUp.date : null],
    ['record', 'Egyéni csúcs', 'Megdöntötted egy saját tesztrekordodat.', recs.length ? Math.min(...recs.map(r => r.date)) : null],
    ['younger', 'Fiatalabb a korodnál', 'A fittségi korod alacsonyabb a naptári korodnál.', ctx.fitnessAge != null && ctx.age != null && ctx.fitnessAge < ctx.age ? ctx.now || Date.now() : null],
    ['goal', 'Cél teljesítve', 'Elérted az egyik kitűzött célodat.', ctx.goalDone ? ctx.now || Date.now() : null],
  ];
  return list.map(([id, name, about, date]) => ({ id, name, about, earned: date != null, date }));
}

/* Esedékes-e a félidős mini-teszt: a ciklus 3. hetében, ha ebben a ciklusban még nem volt. */
export function miniDue(items, program, now = Date.now()) {
  if (!program || program.start == null) return false;
  const days = Math.floor((now - program.start) / DAY), cycleDay = days % 42;
  if (cycleDay < 14 || cycleDay >= 28) return false;
  const cycleStart = now - cycleDay * DAY;
  return !items.some(i => i.kind === 'mini' && i.date >= cycleStart);
}
