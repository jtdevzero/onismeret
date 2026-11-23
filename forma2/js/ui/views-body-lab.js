/* BODY LAB: offline oktatási atlasz, sematikus 3D-modellel és hozzáférhető 2D-réteggel. */
import { h, clear } from './dom.js';
import { page, card, link, note } from './widgets.js';
import { D } from './data.js';
import { muscleMap } from './muscle-map.js';
import { bodyLabItems } from '../core/body-lab.js';
import { tr } from './i18n.js';
import { mountThreeBody } from './three-body.js';

const NS = 'http://www.w3.org/2000/svg';
const LAYERS = [
  ['muscles', tr('Izmok')], ['joints', tr('Ízületek')], ['bones', tr('Csontok')],
  ['connective', tr('Inak és szalagok')], ['movements', tr('Mozgások')],
];

function bodyDiagram(layer, selected, choose) {
  const el = (tag, attrs = {}, text) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    if (text != null) n.textContent = text;
    return n;
  };
  const svg = el('svg', { viewBox: '0 0 160 300', role: 'group', class: 'bodylab-diagram', 'aria-label': tr('Sematikus testrégiók és választható pontok') });
  const defs=el('defs');
  const gradient=el('linearGradient',{id:'bodylab-figure-shade',x1:'0%',x2:'100%',y1:'0%',y2:'100%'});
  gradient.append(el('stop',{offset:'0%','stop-color':'#f5b29a'}),el('stop',{offset:'46%','stop-color':'#bc6a8b'}),el('stop',{offset:'100%','stop-color':'#48375f'}));
  defs.append(gradient);svg.append(defs);
  svg.append(el('circle',{cx:80,cy:139,r:105,class:'bodylab-guide-ring'}));
  svg.append(el('path', { d: 'M 80 15 C 60 15 59 51 80 56 C 101 51 100 15 80 15 Z M 65 60 Q 80 69 95 60 Q 118 57 129 78 L 146 151 Q 151 168 137 169 L 124 167 L 110 113 L 105 185 L 104 271 Q 102 284 85 280 L 80 192 L 75 280 Q 58 284 56 271 L 55 185 L 50 113 L 36 167 L 23 169 Q 9 168 14 151 L 31 78 Q 42 57 65 60 Z', class: 'bodylab-silhouette' }));
  svg.append(el('path',{d:'M 80 64 L 80 186 M 53 90 Q 80 104 107 90 M 60 115 Q 80 124 100 115 M 64 135 Q 80 146 96 135 M 56 185 Q 80 195 104 185 M 80 191 L 80 262',class:'bodylab-figure-lines'}));
  for (const item of bodyLabItems(layer)) {
    const [x, y] = item.zone;
    const group = el('g', { tabindex: '0', role: 'button', 'aria-label': item.name, 'aria-pressed': String(item.id === selected), class: 'bodylab-point' + (item.id === selected ? ' selected' : '') });
    group.append(el('circle', { cx: x, cy: y, r: 13, class: 'bodylab-point-ring' }), el('circle', { cx: x, cy: y, r: 5, class: 'bodylab-point-core' }));
    group.addEventListener('click', () => choose(item.id));
    group.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(item.id); } });
    svg.append(group);
  }
  return svg;
}

export async function bodyLabView(_arg, onCleanup = () => {}) {
  const current = { layer: 'muscles', selected: null };
  let unmountModel = () => {};
  onCleanup(() => unmountModel());
  const selector = h('div', { class: 'bodylab-tabs', role: 'group', 'aria-label': tr('Anatómiai rétegek') });
  const display = h('div', { class: 'bodylab-content' });
  const render = () => {
    unmountModel(); unmountModel = () => {};
    clear(selector).append(...LAYERS.map(([id, name]) => h('button', {
      type: 'button', class: 'btn small' + (current.layer === id ? ' primary' : ''),
      'aria-pressed': String(current.layer === id), onclick: () => { current.layer = id; current.selected = null; render(); },
    }, name)));
    clear(display);
    if (current.layer === 'muscles') {
      const map = muscleMap(D.catalog, (_area, matches) => {
        clear(related).append(matches.length ? h('ul', { class: 'rows' }, matches.slice(0, 8).map(e => h('li', null, link('#/ex/' + e.id, e.name)))) : h('p', { class: 'muted' }, tr('Nincs kapcsolódó gyakorlat.')));
      });
      const related = h('div');
      const viewer = h('div', { class: 'bodylab-three', 'aria-label': tr('Forgatható, stilizált 3D testmodell') });
      display.append(h('div',{class:'bodylab-viewer-wrap'},h('div',{class:'bodylab-viewer-heading'},h('span',{class:'bodylab-live-tag'},'3D'),h('span',null,tr('Izomatlasz · forgatható nézet'))),viewer),map);
      display.append(card(h('h3', null, tr('Kapcsolódó gyakorlatok')), related));
      unmountModel = mountThreeBody(viewer, { layer: 'muscles', onPick: area => map.selectArea(area) });
      return;
    }
    const entries = bodyLabItems(current.layer);
    const selected = entries.find(e => e.id === current.selected) || entries[0];
    current.selected = selected?.id;
    const choose = id => { current.selected = id; render(); };
    const viewer = h('div', { class: 'bodylab-three', 'aria-label': tr('Forgatható, stilizált 3D testmodell') });
    const relatedExercises = selected?.exercises?.filter(id => D.ex[id]) || [];
    const related = relatedExercises.length ? h('div', null, h('h3', null, tr('Kapcsolódó gyakorlatok')),
      h('ul', { class: 'rows' }, relatedExercises.map(id => h('li', null, link('#/ex/' + id, D.ex[id].name))))) : null;
    const detail = selected ? card(h('p', { class: 'eyebrow' }, tr('BODY LAB · oktatási adatlap')),
      h('h2', null, selected.name), h('p', null, selected.what),
      selected.moves ? h('p', null, h('strong', null, tr('Jellemző mozgások: ')), selected.moves) : null,
      selected.watch ? h('p', null, h('strong', null, tr('Mire figyelj: ')), selected.watch) : null, related) : null;
    display.append(h('div', { class: 'bodylab-grid' },
      h('div', { class: 'bodylab-diagram-shell' },
        h('div',{class:'bodylab-viewer-heading'},h('span',{class:'bodylab-live-tag'},'3D'),h('span',null,tr('Sematikus anatómiai modell'))),viewer,
        h('details', { class: 'bodylab-fallback' }, h('summary', null, tr('2D nézet / kisegítő ábra')), bodyDiagram(current.layer, current.selected, choose)),
        h('p', { class: 'small muted' }, tr('Érintsd meg a jelölőpontokat vagy válassz a listából.'))),
      h('div', { class: 'bodylab-detail' },
        h('div', { class: 'bodylab-choices' }, entries.map(item => h('button', { type: 'button', class: 'chip' + (item.id === current.selected ? ' on' : ''), 'aria-pressed': String(item.id === current.selected), onclick: () => choose(item.id) }, item.name))),
        detail)));
    unmountModel = mountThreeBody(viewer, { layer: current.layer, onPick: choose });
  };
  render();
  return page(tr('BODY LAB'),
    h('section', { class: 'bodylab-hero' }, h('p', { class: 'eyebrow' }, 'FORMA 2 · BODY LAB'),
      h('h2', null, tr('Ismerd meg a mozgásod')), h('p', null, tr('Izmok, ízületek, csontok és mozgásminták egy helyen.'))),
    h('div',{class:'bodylab-intro'},h('span',{class:'bodylab-intro-icon','aria-hidden':'true'},'✦'),
      h('div',null,h('strong',null,tr('Fedezd fel a tested működését')),h('p',null,tr('Válts réteget, forgass, majd érintsd meg a kiemelt területet.')))),
    selector, display,
    note(tr('Sematikus oktatási atlasz. Nem orvosi diagnózis, nem sérülésfelmérés, és nem valós idejű ízületi mérés. A tartalom külön belső szakmai felülvizsgálatra vár.'), 'small'),
    h('div', { class: 'row' }, link('#/library', tr('Teljes gyakorlattár'), 'btn primary')));
}
