/* A Ma képernyő adatai (tiszta függvény: nincs DOM, tároló vagy rejtett rendszeróra; a `now` paraméter).
   Egyetlen kiemelt következő lépés, a heti számok saját egységgel, a legfontosabb cél, az újramérés ideje,
   és az adatok frissessége. Nem talál ki adatot: üres állapotban nincs rekord, sorozat vagy előrejelzés. */
import { nextKey, weekInfo, reassessDue, CYCLE_WEEKS } from './program.js';
import { weeklyCardio, weeklyWorkouts } from './cardio.js';
import { miniDue, goalProgress } from './achievements.js';
import { aggregateWeeklyLoad, buildLoadTrend } from './load.js';
import { tr } from '../ui/i18n.js';

const DAY = 86400000;
const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

/* program: a tárolt program (vagy null) · items: minden tétel · profile, norms: a cél aktuális értékéhez */
export function buildDashboard({ program = null, items = [], now = Date.now(), profile = null, norms = null, weeklyGoal = 5 } = {}) {
  const by = k => items.filter(i => i && i.kind === k).sort((a, b) => b.date - a.date);
  const assessments = by('assessment'), workouts = by('workout'), cardio = by('cardio'), goals = by('goal');
  const last = assessments[0] || null;
  const warnings = [];

  let nextAction;
  if (!last) nextAction = { type: 'assessment', href: '#/assess', label: tr('Felmérés indítása') };
  else if (!program || !program.start) nextAction = { type: 'program', href: '#/result', label: tr('Eredmény és program') };
  else {
    const key = nextKey(program);
    nextAction = { type: 'workout', key, href: '#/check/' + key, label: tr('Indítás'), doneToday: workouts.some(w => sameDay(w.date, now)) };
  }

  const cycle = program && program.start ? { ...weekInfo(program.start, now), weeks: CYCLE_WEEKS } : null;
  const ww = weeklyWorkouts(workouts, now, weeklyGoal), cw = weeklyCardio(cardio, now);
  const load = aggregateWeeklyLoad(items, { weeks: 4, now });
  const thisWeek = load[load.length - 1];

  /* az aktív (nem teljesített) célok közül a legközelebbi határidejű; határidő nélkül a legutóbbi */
  let primaryGoal = null;
  if (goals.length) {
    const scored = goals.map(g => ({ goal: g, ...goalProgress(g, items, profile, norms, now) })).filter(g => !g.done);
    scored.sort((a, b) => (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity) || b.goal.date - a.goal.date);
    primaryGoal = scored[0] || null;
  }

  const due = last ? !!reassessDue(last.date, program, now) : false;
  const assessmentDue = last ? { due, lastDate: last.date, daysSince: Math.floor((now - last.date) / DAY), daysLeft: due ? 0 : Math.max(0, Math.ceil((last.date + CYCLE_WEEKS * 7 * DAY - now) / DAY)) } : null;

  /* egy rövid, adatból igazolható megállapítás; kevés adatnál nincs */
  let insight = null;
  const setsTrend = buildLoadTrend(load, 'sets');
  if (setsTrend && setsTrend.ratio != null) insight = { kind: 'sets', text: tr('Ezen a héten eddig {p0} sorozat; az előző hetek átlaga {p1}.', { p0: setsTrend.last, p1: setsTrend.avg }), ...setsTrend };

  const lastWorkout = workouts[0] ? workouts[0].date : null;
  if (lastWorkout && now - lastWorkout > 14 * DAY) warnings.push(tr('Két hétnél régebben edzettél: az első edzés óvatosabb lesz.'));

  /* első hét: a program indulása utáni 7 napban rövid, adatokból kipipálódó lista; ha minden kész, eltűnik */
  let firstWeek = null;
  if (program && program.start && now - program.start < 7 * DAY && now >= program.start) {
    const since = i => i.date >= program.start;
    const steps = [
      { id: 'workout', label: tr('Az első edzés'), done: workouts.some(since) },
      { id: 'check', label: tr('Egy „Hogy vagy ma?” kérdőív edzés előtt'), done: items.some(i => i && i.kind === 'check' && since(i)) },
      { id: 'log', label: tr('Egy edzés végén a sorozatnapló vagy a nehézség (nem kötelező)'), done: workouts.some(w => since(w) && (w.log || w.rpe != null)) },
      { id: 'cardio', label: tr('Egy kardióalkalom (séta is számít)'), done: cardio.some(since) },
    ];
    if (!steps.every(x => x.done)) firstWeek = { day: Math.floor((now - program.start) / DAY) + 1, steps };
  }

  return {
    firstWeek,
    nextAction,
    currentCycle: cycle,
    weeklyWorkouts: { completed: ww.n, goal: ww.goal, pct: ww.pct, unit: tr('edzés') },
    weeklyCardio: { minutes: cw.minutes, equivalent: cw.equivalent, goal: cw.goal, pct: cw.pct, unit: tr('perc') },
    weeklyLoad: thisWeek ? { sets: thisWeek.sets, reps: thisWeek.reps, seconds: thisWeek.seconds, externalKgReps: thisWeek.externalKgReps, logged: thisWeek.logged } : null,
    primaryGoal,
    assessmentDue,
    miniDue: program ? miniDue(items, program, now) : false,
    insight,
    warnings,
    dataFreshness: { lastWorkout, lastAssessment: last ? last.date : null, lastCardio: cardio[0] ? cardio[0].date : null },
  };
}
