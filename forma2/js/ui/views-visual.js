/* Vizuális összegzők: kizárólag tárolt naplóadatok, null esetén ismeretlen. */
import { h } from './dom.js';
import { link } from './widgets.js';
import { periodSummary } from '../core/analytics.js';
import { weeklyGoal } from './data.js';
import { tr } from './i18n.js';

const value = n => Number.isFinite(n) ? String(n) : '–';
export function visualDashboard(items, now = Date.now()) {
  const s = periodSummary(items, { days: 30, now });
  const week = items.filter(i => i?.kind === 'workout' && Number.isFinite(i.date) && i.date <= now && i.date >= now - 7 * 86400000).length;
  const goal = Math.max(1, weeklyGoal());
  const pct = Math.max(0, Math.min(100, Math.round(week / goal * 100)));
  return h('section', { class: 'visual-dashboard', 'aria-label': tr('Edzésdashboard') },
    h('div', { class: 'visual-dashboard-top' }, h('div', null, h('p', { class: 'eyebrow' }, 'FORMA PERFORMANCE'),
      h('h2', null, tr('A fejlődésed számokban')), h('p', { class: 'small' }, tr('Az elmúlt 30 nap rögzített adatai.'))),
      h('div', { class: 'visual-goal-ring', style: `--goal-pct:${pct}%`, role: 'img', 'aria-label': tr('Heti cél: {p0} / {p1} edzés', { p0: week, p1: goal }) },
        h('strong', null, `${week}/${goal}`), h('span', null, tr('heti cél')))),
    h('div', { class: 'visual-metrics' },
      [[s.workouts, tr('edzés')], [s.workoutMinutes, tr('perc')], [s.sets, tr('sorozat')]].map(([v, label]) =>
        h('div', { class: 'visual-metric' }, h('strong', null, value(v)), h('span', null, label)))),
    h('p', { class: 'small' }, tr('A sorozatok száma naplóból vagy tervből származhat; a hiányzó mérés nem nulla teljesítmény.')));
}

export function workoutFinishVisual({ title, minutes, done, partial }) {
  const steps = Array.isArray(done) ? done.length : null;
  return h('div', { class: 'workout-finish-visual' },
    h('div', { class: 'finish-orb', 'aria-hidden': 'true' }, '✓'),
    h('p', { class: 'eyebrow' }, partial ? tr('Rövidített edzés') : tr('Teljesített edzés')),
    h('h2', null, tr('Edzés kész')),
    h('p', { class: 'small' }, title),
    h('div', { class: 'finish-metrics' },
      h('div', null, h('strong', null, value(minutes)), h('span', null, tr('perc'))),
      h('div', null, h('strong', null, value(steps)), h('span', null, tr('naplózott tétel')))),
    h('p', { class: 'small' }, tr('Az eredményed a készülékeden lett elmentve. A megosztásról te döntesz.')),
    link('#/progress', tr('Fejlődési kártyám'), 'btn small'));
}
