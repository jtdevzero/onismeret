/* A hathetes kártya tényleges naplóadatokból készül; előrejelzést nem számít. */
import { sameScoring } from './assessment.js';

const DAY = 86400000;
export function progressSummary(items, now = Date.now()) {
  const start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - 41);
  const recent = items.filter(i => Number.isFinite(i.date) && i.date >= start.getTime() && i.date <= now);
  const workouts = recent.filter(i => i.kind === 'workout');
  const cardio = recent.filter(i => i.kind === 'cardio');
  const minutes = list => list.reduce((s, i) => s + (Number.isFinite(i.minutes) && i.minutes > 0 ? i.minutes : 0), 0);
  const assessments = recent.filter(i => i.kind === 'assessment').sort((a, b) => a.date - b.date);
  const latest = assessments.at(-1);
  const signature = a => JSON.stringify([Object.keys(a.scoring?.evaluation?.areas || {}).sort(), Object.keys(a.scoring?.evaluation?.tests || {}).sort()]);
  const baseline = latest && assessments.find(a => a.date < latest.date && sameScoring(a, latest) && signature(a) === signature(latest));
  const before = baseline?.scoring?.evaluation, after = latest?.scoring?.evaluation;
  const delta = before && Number.isFinite(before.overall) && Number.isFinite(after.overall) ? after.overall - before.overall : null;
  return {
    from: start.getTime(), to: now, workouts: workouts.length, minutes: Math.round(minutes(workouts) + minutes(cardio)),
    cardioMinutes: Math.round(minutes(cardio)),
    activeDays: new Set([...workouts, ...cardio].map(i => new Date(i.date).toLocaleDateString('en-CA'))).size,
    delta, before: delta == null ? null : before.overall, after: delta == null ? null : after.overall,
    measuredDays: delta == null ? null : Math.max(1, Math.round((latest.date - baseline.date) / DAY)),
  };
}
