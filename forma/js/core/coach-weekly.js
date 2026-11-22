/* Phase 3: helyi heti edzői összefoglaló. Nincs AI-hálózati kérés vagy automatikus
   programváltozás. Hiányzó önbevallásból nem következtetünk jó regenerációra. */
import { periodSummary } from './analytics.js';

export function weeklyCoachReport(items = [], { now = Date.now(), goal = 5 } = {}) {
  const s = periodSummary(items, { days: 7, now });
  const target = Number.isInteger(goal) && goal >= 1 && goal <= 7 ? goal : null;
  const coverage = s.recoveryDays === 0 ? 'missing' : s.recoveryDays < 4 ? 'limited' : 'partial';
  return {
    from: s.from, to: s.to, sessions: s.workouts, minutes: s.workoutMinutes,
    sets: s.sets, cardioMinutes: s.cardioMinutes, recoveryDays: s.recoveryDays,
    painReports: s.painReports, goal: target,
    goalMet: target == null ? null : s.workouts >= target,
    recoveryCoverage: coverage,
    /* A fájdalom önbevallás, nem diagnózis. A null terhelés hiányzó adatot jelent. */
    sourceTypes: { sessions: 'logged', painReports: 'self_report', goalMet: 'calculation' },
    disclaimer: 'Szabályalapú, helyi összefoglaló; nem orvosi diagnózis vagy automatikus edzésterv-módosítás.',
  };
}

export function weeklyCoachText(report, labels = {}, locale = 'hu-HU') {
  const l = (key, fallback) => labels[key] || fallback;
  const value = (v, unit) => v == null ? l('missing', 'nincs adat') : `${v}${unit ? ' ' + unit : ''}`;
  const day = ms => new Date(ms).toLocaleDateString(locale);
  return [
    l('title', 'FORMA – heti edzői összefoglaló'),
    `${day(report.from)} – ${day(report.to)}`,
    `${l('sessions', 'Naplózott edzések')}: ${value(report.sessions)}`,
    `${l('minutes', 'Edzésidő')}: ${value(report.minutes, l('min', 'perc'))}`,
    `${l('sets', 'Sorozatok')}: ${value(report.sets)}`,
    `${l('cardio', 'Kardió')}: ${value(report.cardioMinutes, l('min', 'perc'))}`,
    `${l('goal', 'Heti edzéscél')}: ${value(report.goal)}`,
    `${l('recovery', 'Regenerációs önbevallás')}: ${value(report.recoveryDays, l('day', 'nap'))}`,
    `${l('pain', 'Fájdalomjelzések')}: ${value(report.painReports)}`,
    report.recoveryCoverage === 'missing'
      ? l('uncertain', 'Nincs regenerációs bejegyzés: ebből nem következtethető jó állapot.')
      : l('selfReport', 'A regeneráció és a fájdalom a felhasználó önbevallása.'),
    l('disclaimer', report.disclaimer),
  ].join('\n') + '\n';
}
