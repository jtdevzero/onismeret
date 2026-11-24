/* Egyszerű, interaktív izomterület-választó. Sematikus ábra, nem anatómiai diagnosztika. */
import { h, clear } from './dom.js';
import { anatomyMatches } from '../core/exercise-catalog.js';
import { muscleGuide } from '../core/muscle-guide.js';
import { BODYLAB_MUSCLE_NAMES, bodylabRegionsForView } from '../core/bodylab-silhouette.js';
import { tr, getLocale } from './i18n.js';

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => {
  const node = document.createElementNS(NS, tag);
  for (const [key, val] of Object.entries(attrs)) node.setAttribute(key, String(val));
  return node;
};
const AREAS = Object.fromEntries(Object.entries(BODYLAB_MUSCLE_NAMES).map(([id,name])=>[id,tr(name)]));

export function muscleMap(exercises, onSelect) {
  let view = 'front', selected = '';
  const surface = h('div', { class: 'anatomy-stage' });
  const status = h('p', { class: 'small muted', role: 'status', 'aria-live': 'polite' });
  const guide = h('div', { class: 'anatomy-guide', 'aria-live': 'polite' }, h('p', { class: 'muted small' }, tr('Válassz egy izomterületet a rövid ismertetőhöz.')));
  const buttons = h('div', { class: 'row anatomy-switch' });
  const choose = area => {
    selected = area;
    const matched = anatomyMatches(exercises, area);
    status.textContent = tr('{p0}: {p1} kapcsolódó gyakorlat', { p0: AREAS[area], p1: matched.length });
    const info = muscleGuide(area, getLocale());
    if (info) clear(guide).append(
      h('h3', null, info.title),
      h('p', null, info.about),
      h('p', null, h('strong', null, tr('Jellemző gyakorlatok: ')), info.moves),
      h('p', null, h('strong', null, tr('Gyakorlati tipp: ')), info.tip),
      h('p', { class: 'muted small' }, tr('Általános tájékoztató, nem személyes egészségügyi tanács.')));
    onSelect(area, matched);
    paint();
  };
  const paint = () => {
    const svg = svgEl('svg', { viewBox: '0 0 160 290', class: 'anatomy-svg', role: 'group', 'aria-label': tr('Sematikus izomterületek') });
    svg.append(svgEl('path', { d: 'M 80 15 C 60 15 59 51 80 56 C 101 51 100 15 80 15 Z M 65 60 Q 80 69 95 60 Q 118 57 129 78 L 146 151 Q 151 168 137 169 L 124 167 L 110 113 L 105 185 L 104 271 Q 102 284 85 280 L 80 192 L 75 280 Q 58 284 56 271 L 55 185 L 50 113 L 36 167 L 23 169 Q 9 168 14 151 L 31 78 Q 42 57 65 60 Z', class: 'anatomy-outline' }));
    for (const [area, path] of bodylabRegionsForView(view)) {
      const shape = svgEl('path', { d: path, class: 'anatomy-zone' + (selected === area ? ' on' : ''), role: 'button', tabindex: '0', 'aria-label': AREAS[area], 'aria-pressed': String(selected === area) });
      shape.addEventListener('click', () => choose(area));
      shape.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(area); } });
      svg.append(shape);
    }
    clear(surface).append(svg);
    clear(buttons).append(...[['front', tr('Elöl')], ['back', tr('Hátul')]].map(([key, label]) =>
      h('button', { type: 'button', class: 'btn small' + (key === view ? ' primary' : ''), 'aria-pressed': String(key === view), onclick: () => { view = key; paint(); } }, label)));
  };
  paint();
  const root = h('section', { class: 'card anatomy-card' }, h('h2', null, tr('Interaktív izomtérkép')),
    h('p', { class: 'small muted' }, tr('Érints meg egy színezett területet. A rajz sematikus; az ajánlások a gyakorlatok besorolásából származnak.')),
    buttons, surface, status, guide);
  root.selectArea = area => { if (AREAS[area]) choose(area); };
  return root;
}
