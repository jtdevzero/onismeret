import { bodyLabItems } from './body-lab.js';
import { BODYLAB_MUSCLE_NAMES, bodylabRegionsForView } from './bodylab-silhouette.js';

const LAYERS = new Set(['muscles','joints','bones','connective','movements']);
export function bodyLabRegions(layer) {
  if(layer==='muscles')return Object.entries(BODYLAB_MUSCLE_NAMES).map(([id,name])=>({id,name}));
  return bodyLabItems(layer).map(({id,name})=>({id,name}));
}
export function parseBodyLabRoute(arg) {
  const [rawLayer,rawRegion] = String(arg||'').split(':',2);
  const layer=LAYERS.has(rawLayer)?rawLayer:'muscles';
  const selected=bodyLabRegions(layer).some(x=>x.id===rawRegion)?rawRegion:null;
  return {layer,selected};
}
export function bodyLabSharePath(layer,region) {
  if(!LAYERS.has(layer))return '#/bodylab';
  const selected=bodyLabRegions(layer).some(x=>x.id===region)?region:null;
  return '#/bodylab/'+layer+(selected?':'+selected:'');
}
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu');
export function searchBodyLabRegions(layer,query,limit=12) {
  const text=normalize(query).trim();
  const entries=bodyLabRegions(layer);
  return text?entries.filter(item=>normalize(item.name).includes(text)).slice(0,Math.max(1,Math.min(12,limit|0))):entries;
}
export function stepBodyLabRegion(layer,current,direction) {
  const entries=bodyLabRegions(layer),index=entries.findIndex(item=>item.id===current);
  if(!entries.length)return null;
  if(index<0)return entries[direction<0?entries.length-1:0].id;
  const next=(index+(direction<0?-1:1)+entries.length)%entries.length;
  return entries[next].id;
}
export function bodyLabSideForRegion(region) {
  return bodylabRegionsForView('back').some(([id])=>id===region)&&!bodylabRegionsForView('front').some(([id])=>id===region)?'back':'front';
}
