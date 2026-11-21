/* Heti áttekintés, levezetés, fehérje- és vízcél. Tiszta függvények, DOM nélkül. Általános irányelvek, nem orvosi tanács. */
import { weekStart, weeklyCardio, WEEKLY_GOAL } from './cardio.js';

const DAY = 86400000;

/* Heti áttekintés egy hétről (alapból az előző, lezárt hét). → { start, workouts, goal, cardio, levelUps, light, minis, bodyChange, wins: [], misses: [], focus } */
export function weeklyReview(items, opts = {}) {
  const now = opts.now ?? Date.now();
  const start = opts.start ?? weekStart(now) - 7 * DAY, end = start + 7 * DAY;
  const inW = items.filter(i => i.date >= start && i.date < end);
  const ws = inW.filter(i => i.kind === 'workout');
  const cardio = weeklyCardio(items.filter(i => i.kind === 'cardio'), start + DAY);
  const levelUps = ws.flatMap(w => (w.changes || []).filter(c => c.to > c.from));
  const light = ws.filter(w => w.light).length;
  const body = items.filter(i => i.kind === 'body' && Number.isFinite(i.waist)).sort((a, b) => a.date - b.date);
  const before = [...body].reverse().find(b => b.date < start), after = [...body].reverse().find(b => b.date < end && b.date >= start);
  const bodyChange = before && after ? Math.round((after.waist - before.waist) * 10) / 10 : null;
  const goal = opts.goal ?? 5, wins = [], misses = [];
  if (ws.length >= goal) wins.push(`Megvolt mind a ${goal} edzés.`); else if (ws.length) misses.push(`${ws.length} edzés a ${goal}-ből.`); else misses.push('Ezen a héten nem volt edzés.');
  if (cardio.equivalent >= WEEKLY_GOAL) wins.push(`Heti ${cardio.equivalent} kardióperc: teljesítetted a WHO-ajánlást.`); else misses.push(`Kardió: ${cardio.equivalent} / ${WEEKLY_GOAL} perc.`);
  if (levelUps.length) wins.push(`${levelUps.length} szintlépés: nehezebb gyakorlatra váltottál.`);
  if (bodyChange != null && bodyChange < 0) wins.push(`A derékbőséged ${Math.abs(bodyChange)} cm-rel csökkent.`);
  if (light >= 2) misses.push(`${light} könnyített edzés: figyelj az alvásra és a regenerációra.`);
  /* fókusz a jövő hétre: ami a leginkább elmaradt */
  const focus = !ws.length ? 'Kezdj kicsiben: két rövid edzés is jobb a semminél. Állítsd az edzésidőt 15 percre, ha kevés az időd.'
    : ws.length < goal - 1 ? 'Tűzd ki előre a napokat: tedd be az edzéseket a naptáradba (Beállítások → napi emlékeztető).'
    : cardio.equivalent < WEEKLY_GOAL / 2 ? 'Jövő héten a kardióra figyelj: két 30 perces tempós séta már a cél felét adja.'
    : light >= 2 ? 'Jövő héten az alváson a hangsúly: 7–9 óra, rendszeres lefekvés.'
    : 'Tartsd a lendületet; ha egy gyakorlat kétszer egymás után könnyű volt, jelöld könnyűnek, hogy léphess.';
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
