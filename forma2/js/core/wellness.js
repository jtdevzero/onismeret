/* Heti áttekintés, levezetés, fehérje- és vízcél. Tiszta függvények, DOM nélkül. Általános irányelvek, nem orvosi tanács. */
import { weekStart, weekEnd, weeksBack, weeklyCardio, WEEKLY_GOAL } from './cardio.js';
import { tr } from '../ui/i18n.js';

const DAY = 86400000;

/* Heti áttekintés egy hétről (alapból az előző, lezárt hét). → { start, workouts, goal, cardio, levelUps, light, minis, bodyChange, wins: [], misses: [], focus } */
export function weeklyReview(items, opts = {}) {
  const now = opts.now ?? Date.now();
  const start = opts.start ?? weeksBack(now, 1), end = weekEnd(start);
  const inW = items.filter(i => i.date >= start && i.date < end);
  const ws = inW.filter(i => i.kind === 'workout');
  const cardio = weeklyCardio(items.filter(i => i.kind === 'cardio'), start + DAY);
  const levelUps = ws.flatMap(w => (w.changes || []).filter(c => c.to > c.from));
  const light = ws.filter(w => w.light).length;
  const body = items.filter(i => i.kind === 'body' && Number.isFinite(i.waist)).sort((a, b) => a.date - b.date);
  const before = [...body].reverse().find(b => b.date < start), after = [...body].reverse().find(b => b.date < end && b.date >= start);
  const bodyChange = before && after ? Math.round((after.waist - before.waist) * 10) / 10 : null;
  const goal = opts.goal ?? 5, wins = [], misses = [];
  if (ws.length >= goal) wins.push(tr('Megvolt mind a {p0} edzés.', { p0: goal })); else if (ws.length) misses.push(tr('{p0} edzés a {p1}-ből.', { p0: ws.length, p1: goal })); else misses.push(tr('Ezen a héten nem volt edzés.'));
  if (cardio.equivalent >= WEEKLY_GOAL) wins.push(tr('Heti {p0} kardióperc: teljesítetted a WHO-ajánlást.', { p0: cardio.equivalent })); else misses.push(tr('Kardió: {p0} / {p1} perc.', { p0: cardio.equivalent, p1: WEEKLY_GOAL }));
  if (levelUps.length) wins.push(tr('{p0} szintlépés: nehezebb gyakorlatra váltottál.', { p0: levelUps.length }));
  if (bodyChange != null && bodyChange < 0) wins.push(tr('A derékbőséged {p0} cm-rel csökkent.', { p0: Math.abs(bodyChange) }));
  if (light >= 2) misses.push(tr('{p0} könnyített edzés: figyelj az alvásra és a regenerációra.', { p0: light }));
  /* fókusz a jövő hétre: ami a leginkább elmaradt */
  const focus = !ws.length ? tr('Kezdj kicsiben: két rövid edzés is jobb a semminél. Állítsd az edzésidőt 15 percre, ha kevés az időd.')
    : ws.length < goal - 1 ? tr('Tűzd ki előre a napokat: tedd be az edzéseket a naptáradba (Beállítások → napi emlékeztető).')
    : cardio.equivalent < WEEKLY_GOAL / 2 ? tr('Jövő héten a kardióra figyelj: két 30 perces tempós séta már a cél felét adja.')
    : light >= 2 ? tr('Jövő héten az alváson a hangsúly: 7–9 óra, rendszeres lefekvés.')
    : tr('Tartsd a lendületet; ha egy gyakorlat kétszer egymás után könnyű volt, jelöld könnyűnek, hogy léphess.');
  return { start, end, workouts: ws.length, goal, cardio: cardio.equivalent, levelUps: levelUps.length, light, minis: inW.filter(i => i.kind === 'mini').length, bodyChange, wins, misses, focus, empty: !inW.length };
}

/* Levezetés edzés után (kb. 4 perc): nyújtás és lassú légzés. → [{ id, seconds, side? }] (a gyakorlatok a katalógusból) */
export function cooldownSteps(targets = []) {
  const pick = { hamstring: 'hamstring_stretch', hipflexor: 'couch_stretch', ankle: 'calf_stretch', squat: 'glute_stretch', shoulder: 'child_pose', thoracic: 'child_pose' };
  const ids = [...new Set([...targets.map(t => pick[t]).filter(Boolean), 'hamstring_stretch', 'couch_stretch'])].slice(0, 2);
  return [...ids.map(id => ({ id, seconds: 30, perSide: id !== 'child_pose' })), { id: 'child_pose', seconds: 45 }, { id: 'breathing', seconds: 60 }];
}

/* Napi fehérje- és vízcél a testsúlyból. Fehérje: 1,6 g/ttkg (rendszeres erőedzésnél ajánlott 1,2–1,6 felső értéke),
   adagonként kb. 30 g. Víz: 33 ml/ttkg, pohár = 2,5 dl. → { protein, portions, waterMl, glasses } vagy null */
export function nutritionTargets(weight) {
  if (!Number.isFinite(weight) || weight < 30 || weight > 250) return null;
  const protein = Math.round(weight * 1.6), waterMl = Math.round(weight * 33 / 50) * 50;
  return { protein, portions: Math.ceil(protein / 30), waterMl, glasses: Math.round(waterMl / 250) };
}
export const dayKey = (ts = Date.now()) => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
