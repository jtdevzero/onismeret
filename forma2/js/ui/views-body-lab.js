/* BODY LAB: offline oktatási atlasz, sematikus 3D-modellel és hozzáférhető 2D-réteggel. */
import { h, clear } from './dom.js';
import { page, card, link, note } from './widgets.js';
import { D } from './data.js';
import { muscleMap } from './muscle-map.js';
import { bodyLabItems } from '../core/body-lab.js';
import { tr } from './i18n.js';
import { mountThreeBody } from './three-body.js';
import { searchAnatomyNames } from '../core/anatomy-inspector.js';
import { BODYLAB_MUSCLE_NAMES, bodylabRegionsForView } from '../core/bodylab-silhouette.js';
import { parseBodyLabRoute, bodyLabRegions, searchBodyLabRegions, stepBodyLabRegion, bodyLabSharePath, bodyLabSideForRegion } from '../core/bodylab-navigation.js';

const NS = 'http://www.w3.org/2000/svg';
const LAYERS = [
  ['muscles', tr('Izmok')], ['joints', tr('Ízületek')], ['bones', tr('Csontok')],
  ['connective', tr('Inak és szalagok')], ['movements', tr('Mozgások')],
];

function bodyDiagram(layer, selected, choose, view='front') {
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
  if(layer==='muscles'){
    for(const [id,path] of bodylabRegionsForView(view)){
      const name=tr(BODYLAB_MUSCLE_NAMES[id]);
      const region=el('path',{d:path,tabindex:'0',role:'button','aria-label':name,
        'data-bodylab-region':id,'aria-pressed':String(id===selected),class:'bodylab-region'+(id===selected?' selected':'')});
      region.append(el('title',{},name));
      region.addEventListener('click',()=>choose(id));
      region.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(id);}});
      svg.append(region);
    }
    return svg;
  }
  for (const item of bodyLabItems(layer)) {
    const [x, y] = item.zone;
    const group = el('g', { tabindex: '0', role: 'button', 'aria-label': item.name, 'data-bodylab-region':item.id, 'aria-pressed': String(item.id === selected), class: 'bodylab-point' + (item.id === selected ? ' selected' : '') });
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
  let fallbackSide='front',fallbackSelected=selected;
  const orientation=h('div',{class:'bodylab-fallback-orientation',role:'group','aria-label':tr('Anatómiai nézet iránya')});
  const art=h('div',{class:'bodylab-fallback-art'});
  const selectedText=h('p',{class:'bodylab-fallback-selection',role:'status'});
  const syncFallbackSelection=()=>{
    for(const region of art.querySelectorAll('[data-bodylab-region]')){
      const active=region.getAttribute('data-bodylab-region')===fallbackSelected;
      region.setAttribute('aria-pressed',String(active));
      region.classList.toggle('selected',active);
    }
    const selectedName=BODYLAB_MUSCLE_NAMES[fallbackSelected]
      ?tr(BODYLAB_MUSCLE_NAMES[fallbackSelected])
      :bodyLabItems(layer).find(item=>item.id===fallbackSelected)?.name;
    selectedText.textContent=selectedName
      ?tr('Kijelölt terület: {p0}',{p0:selectedName})
      :tr('Érints meg egy kiemelt területet.');
  };
  const paintFallback=()=>{
    clear(art).append(bodyDiagram(layer,fallbackSelected,id=>{
      fallbackSelected=id;syncFallbackSelection();choose(id);
    },fallbackSide));
    if(layer==='muscles')clear(orientation).append(...[['front',tr('Elöl')],['back',tr('Hátul')]].map(([side,label])=>
      h('button',{type:'button',class:'btn small', 'aria-pressed':String(fallbackSide===side),onclick:()=>{
        fallbackSide=side;paintFallback();
      }},label)));
    syncFallbackSelection();
  };
  viewer.selectRegion=id=>{
    fallbackSelected=id;
    if(layer==='muscles'&&bodyLabSideForRegion(id)!==fallbackSide){fallbackSide=bodyLabSideForRegion(id);paintFallback();}
    else syncFallbackSelection();
  };
  const fallback = h('div', { class: 'bodylab-static-fallback', role: 'region', 'aria-label': tr('Kétdimenziós anatómiai nézet') },
    h('div',{class:'bodylab-fallback-toolbar'},h('span', { class: 'bodylab-fallback-badge' }, '2D · ' + tr('Oktatási ábra')),layer==='muscles'?orientation:null),
    art,
    selectedText,
    supports3D ? h('p', { class:'bodylab-fallback-loading', role:'status' }, tr('Részletes 3D modell betöltése… Addig a 2D atlasz használható.')) : null,
    h('p', { class:'bodylab-fallback-error' }, supports3D ? tr('A 3D megjelenítés nem érhető el. A területeket a rajzon vagy az alatta lévő listából választhatod ki.') : tr('Ehhez a réteghez még nincs ellenőrzött 3D modell. A jelölők oktatási célúak.')));
  paintFallback();
  viewer.append(fallback);
  const inspectorDetail=h('div',null,h('p', { class:'muted small' }, tr('Érintsd meg a 3D modell egyik elemét a részletesebb azonosításhoz.')));
  const inspectorActions=h('div',{class:'bodylab-mesh-actions'});
  const inspector = h('aside', { class:'bodylab-mesh-inspector', 'aria-label':tr('Anatómiai részletvizsgáló') }, inspectorDetail,inspectorActions);
  viewer.meshInspector = inspector;
  const searchField=h('input', { type:'search', 'aria-label':tr('Keresés az anatómiai modellben'), placeholder:tr('Keress izmot vagy csontot…'), autocomplete:'off' });
  const results=h('div', { class:'bodylab-search-results', 'aria-live':'polite' });
  const search=h('div', { class:'bodylab-mesh-search', hidden:true },
    h('label',null,tr('Anatómiai kereső')),searchField,results);
  viewer.meshSearch=search;
  viewer.enableSearch = ({elements,focusElement,isolateSelected,resetView,getViewState}) => {
    search.hidden=false;
    clear(inspectorActions);
    const isolate=h('button',{type:'button',class:'btn small',disabled:true,onclick:()=>{
      isolateSelected();viewer.refreshActions();
    }},tr('Csak ez az elem'));
    const reset=h('button',{type:'button',class:'btn small',onclick:()=>{
      resetView();viewer.showMesh(null);
      viewer.refreshActions();
    }},tr('Alapnézet visszaállítása'));
    const status=h('p',{class:'small muted',role:'status'});
    inspectorActions.append(isolate,reset,status);
    viewer.refreshActions=()=>{
      const state=getViewState();
      isolate.disabled=!state.selected;
      isolate.textContent=tr(state.isolated?'Összes elem megjelenítése':'Csak ez az elem');
      isolate.setAttribute('aria-pressed',String(state.isolated));
      status.textContent=tr(state.isolated?'Csak a kijelölt 3D elem látható.':state.selected?'A kijelölt elem külön is megtekinthető.':'Válassz egy anatómiai elemet a modellből vagy a keresőből.');
    };
    viewer.refreshActions();
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
    if(!info){clear(inspectorDetail).append(h('p',{class:'muted small'},tr('Érintsd meg a 3D modell egyik elemét a részletesebb azonosításhoz.')));viewer.refreshActions?.();return;}
    clear(inspectorDetail).append(
      h('p', { class:'eyebrow' }, tr('KIJELÖLT ANATÓMIAI ELEM')),
      h('h3', null, info.hungarianName || tr('Nincs ellenőrzött magyar elnevezés')),
      h('p', { class:'small' }, h('strong', null, tr('Eredeti forrásnév: ')), info.sourceName),
      h('p', { class:'muted small' }, tr('Forrás: Écorché / BodyParts3D / Z-Anatomy. Oktatási célú 3D megjelenítés; a névmegfeleltetés nem szakmailag validált.')));
    viewer.refreshActions?.();
  };
  return viewer;
}

function regionNavigator(layer,selected,onSelect) {
  let active=selected;
  const root=h('section',{class:'bodylab-region-navigator','aria-label':tr('Anatómiai területek navigációja')});
  const input=h('input',{type:'search',placeholder:tr('Keress területet…'),'aria-label':tr('Keress területet…'),autocomplete:'off'});
  const results=h('div',{class:'bodylab-region-results','aria-live':'polite'});
  const status=h('p',{class:'small muted',role:'status'});
  const go=direction=>{const id=stepBodyLabRegion(layer,active,direction);if(id){root.selectRegion(id);onSelect(id);}};
  const previous=h('button',{type:'button',class:'btn small',onclick:()=>go(-1),'aria-label':tr('Előző anatómiai terület')},'←');
  const next=h('button',{type:'button',class:'btn small',onclick:()=>go(1),'aria-label':tr('Következő anatómiai terület')},'→');
  const share=h('button',{type:'button',class:'btn small',onclick:async()=>{
    const url=new URL(bodyLabSharePath(layer,active),location.href).href;
    try{await navigator.clipboard.writeText(url);status.textContent=tr('Oktatási hivatkozás másolva.');}
    catch{status.textContent=tr('A hivatkozást ezen a készüléken nem sikerült másolni.');}
  }},tr('Hivatkozás másolása'));
  const update=()=>{
    clear(results);
    const query=input.value.trim();
    if(!query)return;
    const matches=searchBodyLabRegions(layer,query);
    if(!matches.length){results.append(h('p',{class:'small muted'},tr('Nincs ilyen anatómiai terület.')));return;}
    for(const item of matches)results.append(h('button',{type:'button',class:'btn small',onclick:()=>{
      root.selectRegion(item.id);input.value='';clear(results);onSelect(item.id);
    }},tr(item.name)));
  };
  input.addEventListener('input',update);
  root.addEventListener('keydown',e=>{
    if(e.target===input||!['ArrowLeft','ArrowRight'].includes(e.key))return;
    e.preventDefault();go(e.key==='ArrowLeft'?-1:1);
  });
  root.selectRegion=id=>{
    active=id;
    const entry=bodyLabRegions(layer).find(item=>item.id===active);
    status.textContent=entry?tr('Kijelölt terület: {p0}',{p0:tr(entry.name)}):tr('Válassz egy anatómiai területet.');
  };
  root.append(h('div',{class:'bodylab-region-nav-actions'},previous,next,share),input,results,status);
  root.selectRegion(selected);
  return root;
}

export async function bodyLabView(arg, onCleanup = () => {}) {
  const initial=parseBodyLabRoute(arg);
  const current = { layer: initial.layer, selected:initial.selected, mesh: null, prefer2D:false };
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
      let viewer=null,navigatorPanel=null;
      const quick=h('div',{class:'bodylab-quick-regions',role:'group','aria-label':tr('Gyors izomterület-választás')});
      const updateQuick=area=>{
        for(const button of quick.querySelectorAll('button')){
          const active=button.dataset.area===area;
          button.setAttribute('aria-pressed',String(active));
        }
      };
      for(const [id,name] of Object.entries(BODYLAB_MUSCLE_NAMES))quick.append(h('button',{
        type:'button',class:'btn small',dataset:{area:id},'aria-pressed':'false',onclick:()=>map.selectArea(id),
      },tr(name)));
      const map = muscleMap(D.catalog, (area, matches) => {
        current.selected=area;
        viewer?.selectRegion(area);
        navigatorPanel?.selectRegion(area);
        updateQuick(area);
        clear(related).append(matches.length ? h('ul', { class: 'rows' }, matches.slice(0, 8).map(e => h('li', null, link('#/ex/' + e.id, e.name)))) : h('p', { class: 'muted' }, tr('Nincs kapcsolódó gyakorlat.')));
      });
      const related = h('div');
      viewer = anatomyViewer('muscles', null, area => map.selectArea(area));
      navigatorPanel=regionNavigator('muscles',current.selected,area=>map.selectArea(area));
      const badge=h('span',{class:'bodylab-live-tag','data-mode':'loading'},'2D / 3D');
      const modeButton=h('button',{type:'button',class:'btn small bodylab-mode-toggle',onclick:()=>{
        current.prefer2D=!current.prefer2D&&badge.dataset.mode!=='unavailable';render();
      }},tr('2D takarékos mód'));
      const onStatusChange=state=>{
        badge.textContent=state==='ready'?'3D':state==='loading'?'2D / 3D':'2D';badge.dataset.mode=state;
        modeButton.textContent=tr(current.prefer2D?'3D kipróbálása':state==='unavailable'?'3D újrapróbálása':'2D takarékos mód');
      };
      display.append(h('div',{class:'bodylab-viewer-wrap'},h('div',{class:'bodylab-viewer-heading'},badge,h('span',null,tr('Izomatlasz · forgatható nézet')),modeButton),viewer,quick,navigatorPanel,viewer.meshSearch,viewer.meshInspector),map);
      display.append(card(h('h3', null, tr('Kapcsolódó gyakorlatok')), related));
      if(current.selected)map.selectArea(current.selected);
      unmountModel = mountThreeBody(viewer, { layer: 'muscles', prefer2D:current.prefer2D,onPick: (area, info) => { viewer.showMesh(info); if(area)map.selectArea(area); }, onModelReady:ready=>viewer.enableSearch(ready),onStatusChange });
      return;
    }
    const entries = bodyLabItems(current.layer);
    const selected = entries.find(e => e.id === current.selected) || entries[0];
    current.selected = selected?.id;
    const choices=h('div', { class: 'bodylab-choices' });
    const detailPanel=h('div', { class: 'bodylab-detail' });
    const renderDetail=()=>{
      const entry=entries.find(e=>e.id===current.selected);
      clear(choices).append(...entries.map(item=>h('button', { type:'button',class:'chip'+(item.id===current.selected?' on':''),
        'aria-pressed':String(item.id===current.selected),onclick:()=>choose(item.id) },item.name)));
      const relatedExercises=entry?.exercises?.filter(id=>D.ex[id])||[];
      const related=relatedExercises.length?h('div',null,h('h3',null,tr('Kapcsolódó gyakorlatok')),
        h('ul',{class:'rows'},relatedExercises.map(id=>h('li',null,link('#/ex/'+id,D.ex[id].name))))):null;
      clear(detailPanel);
      if(entry)detailPanel.append(card(h('p',{class:'eyebrow'},tr('BODY LAB · oktatási adatlap')),
        h('h2',null,entry.name),h('p',null,entry.what),
        entry.moves?h('p',null,h('strong',null,tr('Jellemző mozgások: ')),entry.moves):null,
        entry.watch?h('p',null,h('strong',null,tr('Mire figyelj: ')),entry.watch):null,related));
    };
    const choose = (id,keepModel=false) => { current.selected = id; current.mesh = null; if(keepModel)renderDetail();else render(); };
    const viewer = anatomyViewer(current.layer, current.selected, choose);
    viewer.showMesh(current.mesh);
    const navigatorPanel=regionNavigator(current.layer,current.selected,id=>choose(id));
    const hasDetailed3D = current.layer === 'bones';
    const badge=h('span',{class:'bodylab-live-tag','data-mode':hasDetailed3D?'loading':'unavailable'},hasDetailed3D?'2D / 3D':'2D');
    const modeButton=h('button',{type:'button',class:'btn small bodylab-mode-toggle',onclick:()=>{
      current.prefer2D=!current.prefer2D&&badge.dataset.mode!=='unavailable';render();
    }},tr('2D takarékos mód'));
    const onStatusChange=state=>{
      badge.textContent=state==='ready'?'3D':state==='loading'?'2D / 3D':'2D';badge.dataset.mode=state;
      modeButton.textContent=tr(current.prefer2D?'3D kipróbálása':state==='unavailable'?'3D újrapróbálása':'2D takarékos mód');
    };
    renderDetail();
    display.append(h('div', { class: 'bodylab-grid' },
      h('div', { class: 'bodylab-diagram-shell' },
        h('div',{class:'bodylab-viewer-heading'},badge,h('span',null,hasDetailed3D ? tr('Anatómiai modell · nem validált') : tr('Oktatási területtérkép · sematikus')),hasDetailed3D?modeButton:null),viewer,hasDetailed3D ? viewer.meshSearch : null,hasDetailed3D ? viewer.meshInspector : null,
        h('details', { class: 'bodylab-fallback' }, h('summary', null, tr('2D nézet / kisegítő ábra')), bodyDiagram(current.layer, current.selected, choose)),
        h('p', { class: 'small muted' }, tr('Érintsd meg a jelölőpontokat vagy válassz a listából.'))),
      h('div', { class: 'bodylab-detail' },navigatorPanel,choices,detailPanel)));
    if (hasDetailed3D) unmountModel = mountThreeBody(viewer, { layer: current.layer, selected: current.selected, prefer2D:current.prefer2D,onPick: (area, info) => {
      if(area && area!==current.selected)choose(area,true);
      if(area)navigatorPanel.selectRegion(area);
      if(area)viewer.selectRegion(area);
      current.mesh=info;
      viewer.showMesh(info);
    },onModelReady:ready=>viewer.enableSearch(ready),onStatusChange });
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
