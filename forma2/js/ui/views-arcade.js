import { h } from './dom.js';
import { page } from './widgets.js';
import { tr } from './i18n.js';
import { restMiniGame } from './rest-mini-game.js';

const STORAGE_KEY='forma2-arcade-best-v1';
const GAME_NAMES={focus:'🎯',basket:'🏀',memory:'🧠',pairs:'🃏',math:'➕',timing:'⏱'};
function readRecords(){
  try{
    const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
    return Object.fromEntries(Object.keys(GAME_NAMES).filter(k=>Number.isSafeInteger(parsed[k])&&parsed[k]>=0&&parsed[k]<=1000000).map(k=>[k,parsed[k]]));
  }catch{return {};}
}

export async function arcadeView(){
  const records=readRecords();
  let enabled=false;
  const root=h('div',{class:'arcade-hub','data-arcade-theme':'sunset'});
  const scores=h('div',{class:'arcade-records','aria-live':'polite'});
  const status=h('p',{class:'small muted',role:'status'});
  const draw=()=>{
    scores.replaceChildren(...Object.entries(GAME_NAMES).map(([id,icon])=>h('div',{class:'arcade-record'},h('span',{'aria-hidden':'true'},icon),h('strong',null,String(records[id]??'—')))));
  };
  const save=h('input',{type:'checkbox',checked:false,onchange:()=>{enabled=save.checked;status.textContent=enabled?tr('A további rekordok ezen a készüléken tárolódnak.'):tr('Rekordmentés kikapcsolva.');}});
  const wipe=h('button',{type:'button',class:'btn small',onclick:()=>{
    if(!confirm(tr('Törlöd a helyben mentett Arcade rekordokat?')))return;
    try{localStorage.removeItem(STORAGE_KEY);Object.keys(records).forEach(k=>delete records[k]);draw();status.textContent=tr('Helyi Arcade rekordok törölve.');}
    catch{status.textContent=tr('A helyi rekordok törlése nem sikerült.');}
  }},tr('Arcade rekordok törlése'));
  const themes=h('div',{class:'arcade-themes',role:'group','aria-label':tr('Arcade színtéma')});
  for(const [id,label] of [['sunset','🌅 Sunset'],['ocean','🌊 Ocean'],['night','🌃 Night']]){
    const themeButton=h('button',{type:'button',class:'btn small','aria-pressed':String(id==='sunset'),onclick:()=>{
      root.dataset.arcadeTheme=id;
      for(const button of themes.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button===themeButton));
    }},label);
    themes.append(themeButton);
  }
  const game=restMiniGame({standalone:true,onScore:(id,value)=>{
    if(value<=(records[id]??-1))return;
    records[id]=value;draw();
    if(enabled){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(records));}catch{status.textContent=tr('A rekord mentése nem sikerült.');}}
  }});
  draw();
  root.append(h('section',{class:'arcade-hero'},h('p',{class:'eyebrow'},'FORMA 2 · ARCADE'),h('h2',null,'PLAY. REST. REPEAT.'),h('p',null,tr('Hat rövid játék. Edzés közben és azon kívül is.'))),
    themes,h('h3',null,tr('Személyes Arcade rekordok')),scores,
    h('label',{class:'check'},save,h('span',null,tr('Rekordok mentése erre a készülékre (opcionális)'))),wipe,status,game,
    h('p',{class:'small muted'},tr('A játékok nem egészségügyi mérések és nem befolyásolják az edzést.')));
  return page(tr('FORMA ARCADE'),root);
}
