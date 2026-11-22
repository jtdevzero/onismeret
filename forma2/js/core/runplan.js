import { tr } from '../ui/i18n.js';
/* Futóprogram nulláról 5 km-ig (kb. 30 perc folyamatos futás): 9 hét, hetente 3 alkalom, séta–futás intervallumokkal.
   Minden alkalom 5 perc bemelegítő sétával kezdődik és 5 perc levezető sétával zárul.
   Tiszta függvények, DOM nélkül. Időtartamok másodpercben. */

const R = (m, n = 1) => Array.from({ length: n }, () => m).flat();
const run = s => ({ type: 'run', seconds: s }), walk = s => ({ type: 'walk', seconds: s });
/* hetek → napok → szakaszok (bemelegítés és levezetés nélkül) */
const WEEKS = [
  [R([run(60), walk(90)], 8)],
  [R([run(90), walk(120)], 6)],
  [R([run(90), walk(90), run(180), walk(180)], 2)],
  [[run(180), walk(90), run(300), walk(150), run(180), walk(90), run(300)]],
  [R([run(300), walk(180)], 3), [run(480), walk(300), run(480)], [run(1200)]],
  [[run(300), walk(180), run(480), walk(180), run(300)], [run(600), walk(180), run(600)], [run(1500)]],
  [[run(1500)]],
  [[run(1680)]],
  [[run(1800)]],
];
export const RUN_WEEKS = WEEKS.length, RUN_DAYS = 3;

/* Egy alkalom szakaszai a bemelegítéssel és a levezetéssel. week, day: 1-től */
export function runSession(week, day) {
  const w = WEEKS[Math.min(Math.max(week, 1), RUN_WEEKS) - 1];
  const core = w[Math.min(day - 1, w.length - 1)];
  return [{ type: 'warm', seconds: 300 }, ...core, { type: 'cool', seconds: 300 }];
}
export const totalSeconds = segs => segs.reduce((a, s) => a + s.seconds, 0);
export const runSeconds = segs => segs.filter(s => s.type === 'run').reduce((a, s) => a + s.seconds, 0);

/* Rövid leírás: „8 × (1 perc futás, 1,5 perc séta)” jellegű összefoglaló. */
export function describe(segs) {
  const core = segs.filter(s => s.type === 'run' || s.type === 'walk');
  const fmt = s => (s % 60 ? (s / 60).toFixed(1).replace('.', ',') : String(s / 60)) + tr(' perc');
  if (core.length === 1) return `${fmt(core[0].seconds)} folyamatos futás`;
  const txt = list => list.map(s => `${fmt(s.seconds)} ${s.type === 'run' ? 'futás' : 'séta'}`).join(', ');
  /* ismétlődő minta: „n × (…)” */
  for (let p = 1; p <= core.length / 2; p++) {
    if (core.length % p) continue;
    const same = core.every((s, i) => s.type === core[i % p].type && s.seconds === core[i % p].seconds);
    if (same) return `${core.length / p} × (${txt(core.slice(0, p))})`;
  }
  return txt(core);
}

/* Előrelépés: a teljesített alkalom után a következő; a 9. hét 3. napja után kész. state: { week, day, done } */
export function nextRun(state) {
  const st = { week: 1, day: 1, done: false, ...(state || {}) };
  if (st.done) return st;
  if (st.day < RUN_DAYS) return { ...st, day: st.day + 1 };
  if (st.week < RUN_WEEKS) return { ...st, week: st.week + 1, day: 1 };
  return { ...st, done: true };
}
/* Ismétlés: ha nehéz volt, ugyanazt a hetet újra (a nap 1-re áll). */
export const repeatWeek = state => ({ ...(state || { week: 1 }), day: 1, done: false });
