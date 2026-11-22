/* Helyi edző (tiszta függvények, internet nélkül): rövid megfigyelések és javaslatok a mentett adatokból.
   Minden állítás mögött konkrét adat áll (evidence); ha nincs elég adat, nem mond semmit. Nem diagnosztizál,
   és semmit nem változtat magától: a javaslat legfeljebb egy linket ad, a döntés a felhasználóé. */
import { buildDashboard } from './dashboard.js';
import { aggregateWeeklyLoad, buildLoadTrend } from './load.js';
import { buildRecoveryTimeline } from './analytics.js';
import { suggestProgression } from './progression.js';
import { weekStart } from './cardio.js';
import { tr } from '../ui/i18n.js';

const DAY = 86400000;
const PRIORITY = { safety: 0, recovery: 1, consistency: 2, progress: 3, info: 4 };

/* ctx: { program, items, now, exercises (a program súlyzós gyakorlatai), weeklyGoal, profile, norms }
   → [{ id, kind, text, evidence, action? { href, label } }] legfeljebb `limit` darab, fontossági sorrendben */
export function generateLocalInsights({ program = null, items = [], now = Date.now(), exercises = [], weeklyGoal = 5, profile = null, norms = null } = {}, limit = 3) {
  const out = [];
  const dash = buildDashboard({ program, items, now, profile, norms, weeklyGoal });
  if (!program || !program.start) return out;
  const workouts = items.filter(i => i && i.kind === 'workout').sort((a, b) => b.date - a.date);
  const dayOfWeek = Math.floor((now - weekStart(now)) / DAY); /* 0 = hétfő */

  /* fájdalom a legutóbbi napi kérdőívben: biztonság elöl */
  const rec = buildRecoveryTimeline(items, { days: 3, now });
  if (rec.some(r => r.pain)) out.push({ id: 'pain', kind: 'safety', text: tr('Az elmúlt napokban fájdalmat jeleztél. Csak fájdalommentes mozdulatokkal dolgozz; ha nem múlik, kérj orvosi vagy gyógytornász tanácsot.'), evidence: tr('Napi kérdőív, {p0} nap fájdalommal az utolsó 3 napban.', { p0: rec.filter(r => r.pain).length }), action: { href: '#/settings', label: tr('Panaszmód beállítása') } });

  /* rossz alvás vagy erős izomláz több napon */
  const rec7 = buildRecoveryTimeline(items, { days: 7, now });
  const tired = rec7.filter(r => r.sleep === 1 || r.soreness === 1).length;
  if (tired >= 2) out.push({ id: 'tired', kind: 'recovery', text: tr('Több napon rossz alvást vagy erős izomlázat jeleztél. Most a könnyített edzés vagy a mobilitás is jó választás; a következő heti terhelést nem érdemes emelni.'), evidence: tr('{p0} ilyen nap az utolsó 7 napi kérdőívből.', { p0: tired }) });

  /* hosszú szünet */
  const last = workouts[0];
  if (last && now - last.date > 7 * DAY) out.push({ id: 'gap', kind: 'consistency', text: tr('{p0} napja nem edzettél. Egy rövid, 15 perces edzés is jó visszatérés; két hét szünet után a program magától óvatosabban indul.', { p0: Math.floor((now - last.date) / DAY) }), evidence: tr('Utolsó edzés: {p0}.', { p0: new Date(last.date).toLocaleDateString('hu-HU') }), action: { href: dash.nextAction.href, label: tr('Mai edzés') } });

  /* heti cél a hét második felében */
  const ww = dash.weeklyWorkouts, left = ww.goal - ww.completed, daysLeft = 7 - dayOfWeek;
  if (dayOfWeek >= 3 && left > 0 && left <= daysLeft && last && now - last.date <= 7 * DAY) out.push({ id: 'goal', kind: 'consistency', text: tr('Még {p0} edzés a heti {p1}-es célig, és {p2} nap van hátra a hétből.', { p0: left, p1: ww.goal, p2: daysLeft }), evidence: tr('Ezen a héten eddig {p0} edzés.', { p0: ww.completed }), action: { href: dash.nextAction.href, label: tr('Indítás') } });

  /* hirtelen terhelésnövekedés (sorozatszám), csak elég előzménnyel */
  const trend = buildLoadTrend(aggregateWeeklyLoad(items, { weeks: 5, now }), 'sets');
  if (trend && trend.ratio >= 1.5 && trend.last >= 20) out.push({ id: 'spike', kind: 'recovery', text: tr('Ezen a héten jóval több sorozatot csináltál, mint az előző hetekben. Figyelj az alvásra és az izomlázra, és ha kell, iktass be egy könnyebb napot.'), evidence: tr('{p0} sorozat ezen a héten; az előző {p1} hét átlaga {p2}.', { p0: trend.last, p1: trend.weeks, p2: trend.avg }) });

  /* súlyjavaslat elfogadásra vár */
  for (const ex of exercises) {
    const s = suggestProgression({ exercise: ex, workouts, currentKg: program.loads ? program.loads[ex.id] ?? null : null, complaints: program.complaints || [] });
    if (s.action === 'increase' && s.proposedChange) { out.push({ id: 'load-' + ex.id, kind: 'progress', text: tr('{p0}: a naplód alapján jöhet a {p1} kg. Csak akkor változik, ha a Program oldalon elfogadod.', { p0: ex.name, p1: s.proposedChange.to }), evidence: s.reasons[0], action: { href: '#/program', label: tr('Súlyok') } }); break; }
  }

  /* egy „könnyű” értékelés után még egy kell a szintlépéshez */
  const almost = Object.entries(program.ratings || {}).filter(([, list]) => Array.isArray(list) && list.length && list[list.length - 1] === 'easy').map(([l]) => l);
  if (almost.length) out.push({ id: 'almost', kind: 'progress', text: tr('Egy gyakorlatsorban a legutóbbi értékelésed „könnyű” volt: ha a következő alkalommal is az, nehezebb változatot kapsz.'), evidence: `Gyakorlatsor: ${almost.slice(0, 2).join(', ')}.` });

  /* újramérés */
  if (dash.assessmentDue && dash.assessmentDue.due) out.push({ id: 'reassess', kind: 'info', text: tr('Eltelt a 6 hét: egy újraméréssel láthatod a fejlődést, és a program is igazodik.'), evidence: tr('Utolsó felmérés {p0} napja.', { p0: dash.assessmentDue.daysSince }), action: { href: '#/assess', label: tr('Újramérés') } });

  return out.sort((a, b) => PRIORITY[a.kind] - PRIORITY[b.kind]).slice(0, limit);
}
