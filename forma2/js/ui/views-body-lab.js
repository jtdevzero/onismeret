/* BODY LAB: offline oktatási atlasz, sematikus 3D-modellel és hozzáférhető 2D-réteggel. */
import { h, clear } from './dom.js';
import { page, card, link, note } from './widgets.js';
import { D } from './data.js';
import { muscleMap } from './muscle-map.js';
import { bodyLabItems } from '../core/body-lab.js';
import { tr } from './i18n.js';
import { mountThreeBody } from './three-body.js';
import { searchAnatomyNames } from '../core/anatomy-inspector.js';

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
  const muscleRegions = [
    { id:'shoulders',name:tr('Váll'),zone:[52,81] },
    { id:'chest',name:tr('Mell'),zone:[80,101] },
    { id:'arms',name:tr('Kar'),zone:[30,138] },
    { id:'core',name:tr('Törzs'),zone:[80,150] },
    { id:'legs',name:tr('Láb'),zone:[64,237] },
  ];
  for (const item of layer === 'muscles' ? muscleRegions : bodyLabItems(layer)) {
    const [x, y] = item.zone;
    const group = el('g', { tabindex: '0', role: 'button', 'aria-label': item.name, 'aria-pressed': String(item.id === selected), class: 'bodylab-point' + (item.id === selected ? ' selected' : '') });
    group.append(el('circle', { cx: x, cy: y, r: 13, class: 'bodylab-point-ring' }), el('circle', { cx: x, cy: y, r: 5, class: 'bodylab-point-core' }));
    group.addEventListener('click', () => choose(item.id));
    group.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(item.id); } });
    svg.append(group);
  }
  return svg;
}

function anatomyViewer(layer, selected, choose) {
  const viewer = h('div', { class: 'bodylab-three', 'aria-label': tr('Interaktív anatómiai atlasz'), 'data-model': 'loading', 'data-webgl':'loading' });
  const supports3D = layer === 'muscles' || layer === 'bones';
  const fallback = h('div', { class: 'bodylab-static-fallback', role: 'region', 'aria-label': tr('Kétdimenziós anatómiai nézet') },
    h('span', { class: 'bodylab-fallback-badge' }, '2D · ' + tr('Oktatási ábra')),
    bodyDiagram(layer, selected, choose),
    supports3D ? h('p', { class:'bodylab-fallback-loading', role:'status' }, tr('Részletes 3D modell betöltése… Addig a 2D atlasz használható.')) : null,
    h('p', { class:'bodylab-fallback-error' }, supports3D ? tr('A 3D megjelenítés nem érhető el. A területeket a rajzon vagy az alatta lévő listából választhatod ki.') : tr('Ehhez a réteghez még nincs ellenőrzött 3D modell. A jelölők oktatási célúak.')));
  viewer.append(fallback);
  const inspector = h('aside', { class:'bodylab-mesh-inspector', 'aria-live':'polite' },
    h('p', { class:'muted small' }, tr('Érintsd meg a 3D modell egyik elemét a részletesebb azonosításhoz.')));
  viewer.meshInspector = inspector;
  const searchField=h('input', { type:'search', 'aria-label':tr('Keresés az anatómiai modellben'), placeholder:tr('Keress izmot vagy csontot…'), autocomplete:'off' });
  const results=h('div', { class:'bodylab-search-results', 'aria-live':'polite' });
  const search=h('div', { class:'bodylab-mesh-search', hidden:true },
    h('label',null,tr('Anatómiai kereső')),searchField,results);
  viewer.meshSearch=search;
  viewer.enableSearch = ({elements,focusElement}) => {
    search.hidden=false;
    const update=()=>{
      const text=searchField.value;
      const matches=searchAnatomyNames(elements,text);
      clear(results);
      if(text.trim().length<2)return;
      if(!matches.length){results.append(h('p',{class:'small muted'},tr('Nincs találat. Próbálj másik megnevezést.')));return;}
      for(const item of matches)results.append(h('button',{type:'button',class:'bodylab-search-result',onclick:()=>{
        searchField.value=item.hungarianName||item.sourceName;
        clear(results);focusElement(item.id);
      }},h('strong',null,item.hungarianName||item.sourceName),item.hungarianName?h('span',null,item.sourceName):null));
    };
    searchField.addEventListener('input',update);
  };
  viewer.showMesh = info => {
    if(!info)return;
    clear(inspector).append(
      h('p', { class:'eyebrow' }, tr('KIJELÖLT ANATÓMIAI ELEM')),
      h('h3', null, info.hungarianName || tr('Nincs ellenőrzött magyar elnevezés')),
      h('p', { class:'small' }, h('strong', null, tr('Eredeti forrásnév: ')), info.sourceName),
      h('p', { class:'muted small' }, tr('Forrás: Écorché / BodyParts3D / Z-Anatomy. Oktatási célú 3D megjelenítés; a névmegfeleltetés nem szakmailag validált.')));
  };
  return viewer;
}

export async function bodyLabView(_arg, onCleanup = () => {}) {
  const current = { layer: 'muscles', selected: null, mesh: null };
  let unmountModel = () => {};
  onCleanup(() => unmountModel());
  const selector = h('div', { class: 'bodylab-tabs', role: 'group', 'aria-label': tr('Anatómiai rétegek') });
  const display = h('div', { class: 'bodylab-content' });
  const render = () => {
    unmountModel(); unmountModel = () => {};
    clear(selector).append(...LAYERS.map(([id, name]) => h('button', {
      type: 'button', class: 'btn small' + (current.layer === id ? ' primary' : ''),
      'aria-pressed': String(current.layer === id), onclick: () => { current.layer = id; current.selected = null; current.mesh = null; render(); },
    }, name)));
    clear(display);
    if (current.layer === 'muscles') {
      const map = muscleMap(D.catalog, (_area, matches) => {
        clear(related).append(matches.length ? h('ul', { class: 'rows' }, matches.slice(0, 8).map(e => h('li', null, link('#/ex/' + e.id, e.name)))) : h('p', { class: 'muted' }, tr('Nincs kapcsolódó gyakorlat.')));
      });
      const related = h('div');
      const viewer = anatomyViewer('muscles', null, area => map.selectArea(area));
      display.append(h('div',{class:'bodylab-viewer-wrap'},h('div',{class:'bodylab-viewer-heading'},h('span',{class:'bodylab-live-tag'},'3D'),h('span',null,tr('Izomatlasz · forgatható nézet'))),viewer,viewer.meshSearch,viewer.meshInspector),map);
      display.append(card(h('h3', null, tr('Kapcsolódó gyakorlatok')), related));
      unmountModel = mountThreeBody(viewer, { layer: 'muscles', onPick: (area, info) => { viewer.showMesh(info); if(area)map.selectArea(area); }, onModelReady:ready=>viewer.enableSearch(ready) });
      return;
    }
    const entries = bodyLabItems(current.layer);
    const selected = entries.find(e => e.id === current.selected) || entries[0];
    current.selected = selected?.id;
    const choose = id => { current.selected = id; current.mesh = null; render(); };
    const viewer = anatomyViewer(current.layer, current.selected, choose);
    viewer.showMesh(current.mesh);
    const relatedExercises = selected?.exercises?.filter(id => D.ex[id]) || [];
    const related = relatedExercises.length ? h('div', null, h('h3', null, tr('Kapcsolódó gyakorlatok')),
      h('ul', { class: 'rows' }, relatedExercises.map(id => h('li', null, link('#/ex/' + id, D.ex[id].name))))) : null;
    const hasDetailed3D = current.layer === 'bones';
    const detail = selected ? card(h('p', { class: 'eyebrow' }, tr('BODY LAB · oktatási adatlap')),
      h('h2', null, selected.name), h('p', null, selected.what),
      selected.moves ? h('p', null, h('strong', null, tr('Jellemző mozgások: ')), selected.moves) : null,
      selected.watch ? h('p', null, h('strong', null, tr('Mire figyelj: ')), selected.watch) : null, related) : null;
    display.append(h('div', { class: 'bodylab-grid' },
      h('div', { class: 'bodylab-diagram-shell' },
        h('div',{class:'bodylab-viewer-heading'},h('span',{class:'bodylab-live-tag'},hasDetailed3D ? '3D' : '2D'),h('span',null,hasDetailed3D ? tr('Anatómiai modell · nem validált') : tr('Oktatási területtérkép · sematikus'))),viewer,hasDetailed3D ? viewer.meshSearch : null,hasDetailed3D ? viewer.meshInspector : null,
        h('details', { class: 'bodylab-fallback' }, h('summary', null, tr('2D nézet / kisegítő ábra')), bodyDiagram(current.layer, current.selected, choose)),
        h('p', { class: 'small muted' }, tr('Érintsd meg a jelölőpontokat vagy válassz a listából.'))),
      h('div', { class: 'bodylab-detail' },
        h('div', { class: 'bodylab-choices' }, entries.map(item => h('button', { type: 'button', class: 'chip' + (item.id === current.selected ? ' on' : ''), 'aria-pressed': String(item.id === current.selected), onclick: () => choose(item.id) }, item.name))),
        detail)));
    if (hasDetailed3D) unmountModel = mountThreeBody(viewer, { layer: current.layer, selected: current.selected, onPick: (area, info) => { current.mesh=info; if(area && area!==current.selected){current.selected=area;render();} else viewer.showMesh(info); },onModelReady:ready=>viewer.enableSearch(ready) });
    else viewer.dataset.webgl = 'unavailable'; // Nincs részletes, ellenőrzött 3D ízületi/kötőszöveti/mozgásmesh.
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
