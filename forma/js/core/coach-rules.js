/* Helyi edző (tiszta függvények, internet nélkül): rövid megfigyelések és javaslatok a mentett adatokból.
   Minden állítás mögött konkrét adat áll (evidence); ha nincs elég adat, nem mond semmit. Nem diagnosztizál,
   és semmit nem változtat magától: a javaslat legfeljebb egy linket ad, a döntés a felhasználóé. */
import { buildDashboard } from './dashboard.js';
import { aggregateWeeklyLoad, buildLoadTrend } from './load.js';
import { buildRecoveryTimeline } from './analytics.js';
import { suggestProgression } from './progression.js';

const DAY = 86400000;
const PRIORITY = { safety: 0, recovery: 1, consistency: 2, progress: 3, info: 4 };

/* ctx: { program, items, now, exercises (a program súlyzós gyakorlatai), weeklyGoal, profile, norms }
   → [{ id, kind, text, evidence, action? { href, label } }] legfeljebb `limit` darab, fontossági sorrendben */
export function generateLocalInsights({ program = null, items = [], now = Date.now(), exercises = [], weeklyGoal = 5, profile = null, norms = null } = {}, limit = 3) {
  const out = [];
  const dash = buildDashboard({ program, items, now, profile, norms, weeklyGoal });
  if (!program || !program.start) return out;
  const workouts = items.filter(i => i && i.kind === 'workout' && Number.isFinite(i.date) && i.date <= now).sort((a, b) => b.date - a.date);
  /* Naptári hétköznap, nem eltelt 24 órás blokkok: DST-átálláskor is pontos. */
  const dayOfWeek = (new Date(now).getDay() + 6) % 7; /* 0 = hétfő */

  /* fájdalom a legutóbbi napi kérdőívben: biztonság elöl */
  const rec = buildRecoveryTimeline(items, { days: 3, now });
  if (rec.some(r => r.pain)) out.push({ id: 'pain', kind: 'safety', text: 'Az elmúlt napokban fájdalmat jeleztél. Csak fájdalommentes mozdulatokkal dolgozz; ha nem múlik, kérj orvosi vagy gyógytornász tanácsot.', evidence: `Napi kérdőív, ${rec.filter(r => r.pain).length} nap fájdalommal az utolsó 3 napban.`, action: { href: '#/settings', label: 'Panaszmód beállítása' } });

  /* rossz alvás vagy erős izomláz több napon */
  const rec7 = buildRecoveryTimeline(items, { days: 7, now });
  const tired = rec7.filter(r => r.sleep === 1 || r.soreness === 1).length;
  if (tired >= 2) out.push({ id: 'tired', kind: 'recovery', text: 'Több napon rossz alvást vagy erős izomlázat jeleztél. Most a könnyített edzés vagy a mobilitás is jó választás; a következő heti terhelést nem érdemes emelni.', evidence: `${tired} ilyen nap az utolsó 7 napi kérdőívből.` });

  /* hosszú szünet */
  const last = workouts[0];
  if (last && now - last.date > 7 * DAY) out.push({ id: 'gap', kind: 'consistency', text: `${Math.floor((now - last.date) / DAY)} napja nem edzettél. Egy rövid, 15 perces edzés is jó visszatérés; két hét szünet után a program magától óvatosabban indul.`, evidence: `Utolsó edzés: ${new Date(last.date).toLocaleDateString('hu-HU')}.`, action: { href: dash.nextAction.href, label: 'Mai edzés' } });

  /* heti cél a hét második felében */
  const ww = dash.weeklyWorkouts, left = ww.goal - ww.completed, daysLeft = 7 - dayOfWeek;
  if (dayOfWeek >= 3 && left > 0 && left <= daysLeft && last && now - last.date <= 7 * DAY) out.push({ id: 'goal', kind: 'consistency', text: `Még ${left} edzés a heti ${ww.goal}-es célig, és ${daysLeft} nap van hátra a hétből.`, evidence: `Ezen a héten eddig ${ww.completed} edzés.`, action: { href: dash.nextAction.href, label: 'Indítás' } });

  /* hirtelen terhelésnövekedés (sorozatszám), csak elég előzménnyel */
  const trend = buildLoadTrend(aggregateWeeklyLoad(items, { weeks: 5, now }), 'sets');
  if (trend && trend.ratio >= 1.5 && trend.last >= 20) out.push({ id: 'spike', kind: 'recovery', text: 'Ezen a héten jóval több sorozatot csináltál, mint az előző hetekben. Figyelj az alvásra és az izomlázra, és ha kell, iktass be egy könnyebb napot.', evidence: `${trend.last} sorozat ezen a héten; az előző ${trend.weeks} hét átlaga ${trend.avg}.` });

  /* súlyjavaslat elfogadásra vár */
  for (const ex of exercises) {
    /* Régi edzésekre nem javasolunk ma súlyemelést; 21 napnál frissebb napló kell. */
    const recent = workouts.filter(w => now - w.date <= 21 * DAY);
    const s = suggestProgression({ exercise: ex, workouts: recent, currentKg: program.loads ? program.loads[ex.id] ?? null : null, complaints: program.complaints || [] });
    if (s.action === 'increase' && s.proposedChange) { out.push({ id: 'load-' + ex.id, kind: 'progress', text: `${ex.name}: a naplód alapján jöhet a ${s.proposedChange.to} kg. Csak akkor változik, ha a Program oldalon elfogadod.`, evidence: s.reasons[0], action: { href: '#/program', label: 'Súlyok' } }); break; }
  }

  /* egy „könnyű” értékelés után még egy kell a szintlépéshez */
  const almost = Object.entries(program.ratings || {}).filter(([, list]) => Array.isArray(list) && list.length && list[list.length - 1] === 'easy').map(([l]) => l);
  if (almost.length) out.push({ id: 'almost', kind: 'progress', text: 'Egy gyakorlatsorban a legutóbbi értékelésed „könnyű” volt: ha a következő alkalommal is az, nehezebb változatot kapsz.', evidence: `Gyakorlatsor: ${almost.slice(0, 2).join(', ')}.` });

  /* újramérés */
  if (dash.assessmentDue && dash.assessmentDue.due) out.push({ id: 'reassess', kind: 'info', text: 'Eltelt a 6 hét: egy újraméréssel láthatod a fejlődést, és a program is igazodik.', evidence: `Utolsó felmérés ${dash.assessmentDue.daysSince} napja.`, action: { href: '#/assess', label: 'Újramérés' } });

  const provenance = { pain: 'self_report', tired: 'self_report', gap: 'measured_record', goal: 'calculation', spike: 'calculation', almost: 'self_report', reassess: 'calculation' };
  return out.sort((a, b) => PRIORITY[a.kind] - PRIORITY[b.kind]).slice(0, limit).map(insight => ({
    ...insight,
    sourceType: insight.id.startsWith('load-') ? 'rule_based' : provenance[insight.id],
    confidence: insight.id === 'spike' || insight.id.startsWith('load-') ? 'limited' : 'record_based',
    freshness: insight.id === 'pain' || insight.id === 'tired' ? 'last_7_days' : insight.id.startsWith('load-') ? 'last_21_days' : 'derived_from_history',
    reversible: true,
  }));
}
