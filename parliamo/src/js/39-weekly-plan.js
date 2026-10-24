/* ============ WEEKLY PLAN ============ */
const WACT=[["round","Napi kör","rounds"],["lesson","Új lecke","lessons"],["cards","Kártyák","reviews"],["pod","Podcast","pods"],["exam","Vizsgafeladat","exam"],["pron","Kiejtés","pron"],["chat","Beszélgetés","chat"],["read","Olvasás","read"],["build","Mondatépítő","build"],["free","Pihenőnap",""]];
const WDAYS=["V","H","K","Sze","Cs","P","Szo"];
const WSHORT={round:"Kör",lesson:"Lecke",cards:"Kártya",pod:"Podcast",exam:"Vizsga",pron:"Kiejtés",chat:"Beszéd",read:"Olvasás",build:"Mondat",free:"Pihenő"};
const wplan=()=>S.settings.wplan||{};
function wDone(d){const k=wplan()[(d+4)%7];if(!k||k==="free")return null;const a=WACT.find(x=>x[0]===k);return !!(a&&(S.ev[d]||{})[a[2]]);}
function weekCard(){
  const w=wplan();if(!Object.keys(w).length)return `<div class="card next"><div><span class="label">Heti terv</span><h3>Tervezd meg a heted</h3><p class="small muted">Minden napra egy fő feladat: hétfő podcast, kedd vizsgafeladat… Az app követi, mi teljesült.</p></div><button class="btn soft" id="wEdit">Tervezés</button></div>`;
  const t=today(),ws=weekStart();let cells="",done=0,planned=0;
  for(let d=ws;d<ws+7;d++){const k=w[(d+4)%7],a=WACT.find(x=>x[0]===k),st=d>t?null:wDone(d);if(k&&k!=="free"){planned++;if(st)done++;}
    cells+=`<div class="wcell ${d===t?"today":""} ${st?"ok":st===false&&d<t?"miss":""}"><span class="small muted">${WDAYS[(d+4)%7]}</span><b>${a?WSHORT[a[0]]:"–"}</b><span>${st?"✓":k==="free"?"☾":""}</span></div>`;}
  const tk=w[(t+4)%7],ta=WACT.find(x=>x[0]===tk);
  return `<div class="card stack"><div class="row" style="justify-content:space-between"><div><span class="label">Heti terv · ${done}/${planned} teljesítve</span><h3>${ta&&tk!=="free"?"Ma: "+esc(ta[1])+(wDone(t)?" ✓":""):"Ma pihenőnap"}</h3></div><span class="row" style="gap:.4rem">${ta&&tk!=="free"&&!wDone(t)?`<button class="btn lemon" id="wGo">Indítás</button>`:""}<button class="btn ghost" id="wEdit">Szerkesztés</button></span></div><div class="wgrid">${cells}</div></div>`;
}
function bindWeek(){
  if($("#wEdit"))$("#wEdit").onclick=editWeek;
  if($("#wGo"))$("#wGo").onclick=()=>{const k=wplan()[(today()+4)%7];({round:()=>startRound("daily"),lesson:()=>{route="leckek";render();const n=nextLesson();if(n!==null)openLesson(n);},cards:()=>go("kartyak"),pod:()=>{route="gyakorlas";render();renderPods();},exam:()=>{route="gyakorlas";render();renderExam();},pron:()=>{route="gyakorlas";render();renderPron();},chat:()=>go("tanar"),read:()=>{route="gyakorlas";render();renderReader();},build:()=>{route="gyakorlas";render();startBuild();}}[k]||(()=>{}))();};
}
function editWeek(){
  const w=Object.assign({1:"pod",2:"exam",3:"round",4:"pron",5:"chat",6:"read",0:"free"},wplan());
  const acts=WACT;
  subShell(["Kezdőlap",()=>go("ma")],"Heti terv","Melyik nap mi legyen a fő feladat?",`<div class="card stack">${[1,2,3,4,5,6,0].map(d=>`<label class="row" style="justify-content:space-between"><b>${["Vasárnap","Hétfő","Kedd","Szerda","Csütörtök","Péntek","Szombat"][d]}</b><select data-wd="${d}" style="width:auto">${acts.map(a=>`<option value="${a[0]}" ${w[d]===a[0]?"selected":""}>${a[1]}</option>`).join("")}</select></label>`).join("")}</div>
    <p class="small muted">A napi kör mellett ez a nap fő feladata. Ha a szinkron és az emlékeztető be van kapcsolva, az értesítés is a napi tervet mondja, vasárnap pedig heti összefoglalót kapsz.</p><button class="btn block lemon" id="wSave">Mentés</button>`);
  $("#wSave").onclick=()=>{const o={};view.querySelectorAll("[data-wd]").forEach(s=>o[s.dataset.wd]=s.value);S.settings.wplan=o;save();toast("Heti terv elmentve.");go("ma");};
}

