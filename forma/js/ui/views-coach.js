/* Helyi edző: a core/coach-rules.js megfigyelései. Internet nélkül fut, semmit nem küld el és semmit nem változtat magától. */
import { h } from './dom.js';
import { card, link } from './widgets.js';
import { D, profile, weeklyGoal } from './data.js';
import { generateLocalInsights } from '../core/coach-rules.js';
import { dumbbellExercises } from './helpers.js';
import { tr } from './i18n.js';

const ICON = { safety: '⚠', recovery: '◐', consistency: '◷', progress: '↗', info: 'ℹ' };
const SOURCES = { self_report: 'önbevallás', measured_record: 'naplózott adat', calculation: 'matematikai számítás', rule_based: 'szabályalapú javaslat' };

export function coachInsights(prog, items, limit = 3) {
  return generateLocalInsights({ program: prog, items, now: Date.now(), exercises: dumbbellExercises(prog), weeklyGoal: weeklyGoal(), profile: profile(), norms: D.norms }, limit);
}

/* compact: a kezdőlapra egy megfigyelés; különben a teljes kártya a Fejlődés oldalra */
export function coachCard(prog, items, { compact = false } = {}) {
  const list = coachInsights(prog, items, compact ? 1 : 3);
  if (!list.length) return compact ? null : card(h('h2', null, tr('Helyi edző')), h('p', { class: 'small muted' }, tr('Most nincs külön megjegyzésem: haladj a terv szerint. A megfigyeléseim csak a telefonodon mentett adatokból jönnek.')));
  const item = x => h('li', { class: 'coach-item ' + x.kind }, h('span', { class: 'coach-ic', 'aria-hidden': 'true' }, ICON[x.kind] || '•'),
    h('div', null, h('p', null, x.text), h('p', { class: 'small muted' }, tr('Miből gondolom: ') + x.evidence),
      h('p', { class: 'small muted' }, tr('Adat típusa: ') + tr(SOURCES[x.sourceType] || 'nem besorolt') +
        (x.freshness === 'last_7_days' ? tr(' · Utolsó 7 nap.') : x.freshness === 'last_21_days' ? tr(' · Utolsó 21 nap.') : tr(' · Előzményekből.')) +
        (x.confidence === 'limited' ? tr(' · Korlátozott bizonyosság.') : '') + tr(' · Nem módosítja automatikusan a programodat.')),
      x.action ? h('div', { class: 'row' }, link(x.action.href, x.action.label, 'btn small')) : null));
  return card(h('h2', null, compact ? tr('Az edző megjegyzése') : tr('Helyi edző')), h('ul', { class: 'plain coach-list' }, list.map(item)),
    compact ? null : h('p', { class: 'small muted' }, tr('Szabályalapú, a telefonodon fut, internet nélkül. Nem orvosi tanács, és semmit nem változtat magától: a döntés a tiéd.')));
}
