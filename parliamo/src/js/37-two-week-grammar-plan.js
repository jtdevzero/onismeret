/* ============ TWO-WEEK GRAMMAR PLAN ============ */
const planOf=()=>S.plan[lang()];
function planDay(p){return Math.min(13,Math.max(0,today()-p.start));}
function planCard(){
  const p=planOf();if(!p)return "";
  const d=planDay(p),doneN=p.days.filter(x=>x.done).length,dayIt=p.days[d];
  if(p.post!=null)return `<div class="card next"><div><span class="label">Kéthetes terv kész</span><h3>${esc(p.title)}</h3><p class="small muted">Előtte ${esc(p.pre)}/${p.test.length}, utána ${esc(p.post)}/${p.test.length}.</p></div><button class="btn soft" data-go="stat">Részletek</button></div>`;
  if(p.pre==null)return `<div class="card next" style="border:2px solid var(--lemon)"><div><span class="label">Új kéthetes terv</span><h3>${esc(p.title)}</h3><p class="small muted">Kezdd egy rövid felméréssel, hogy a végén látszódjon, mennyit javultál.</p></div><button class="btn lemon" id="plGo">Felmérés</button></div>`;
  const allDone=doneN>=p.days.length||d>=13&&dayIt.done;
  return `<div class="card next" style="border:2px solid var(--lemon)"><div><span class="label">Kéthetes terv · ${d+1}. nap · ${doneN}/${p.days.length} kész</span><h3>${esc(allDone?"Jöhet a zárófelmérés":dayIt.t)}</h3><p class="small muted">${esc(p.title)}</p></div><button class="btn lemon" id="plGo">${allDone?"Zárófelmérés":dayIt.done?"Újra":"Mai rész"}</button></div>`;
}
function bindPlan(back){const b=$("#plGo");if(b)b.onclick=()=>openPlan(back);}
function openPlan(back){
  const p=planOf();if(!p)return;QZ_BACK=back||(()=>go("ma"));
  const finishAll=p.days.every(x=>x.done)||planDay(p)>=13&&p.days[13].done;
  if(p.pre==null)return runQuiz({kind:"plan",label:"Kéthetes terv",title:"Kezdő felmérés",items:p.test.map(x=>Object.assign({},x)),backLabel:"Kezdőlap",
    intro:`<p>${esc(p.goal||"")}</p><p class="small muted">${p.test.length} kérdés. Ne izgulj, ez csak a kiindulópont.</p>`,
    onDone:(ok,n)=>{p.pre=ok;save();planResult(`Kiindulópont: ${ok} / ${n}`,"Holnaptól minden nap egy rövid rész vár a kezdőlapon. Ma már nekiállhatsz az első napnak is.",true);}});
  if(finishAll&&p.post==null)return runQuiz({kind:"plan",label:"Kéthetes terv",title:"Zárófelmérés",items:p.test.map(x=>Object.assign({},x)),backLabel:"Kezdőlap",
    onDone:(ok,n)=>{p.post=ok;addXP(30);save();confetti();planResult(`Előtte ${esc(p.pre)} / ${n}, most ${ok} / ${n}`,ok>p.pre?`${ok-p.pre} kérdéssel többet tudtál, mint két hete. Szép munka!`:ok===p.pre?"Ugyanannyi lett, mint az elején. Érdemes a gyenge pontokat újra átnézni.":"Most kevesebb ment. Nézd át a napi magyarázatokat még egyszer.",false);}});
  const d=planDay(p),day=p.days[d];
  runQuiz({kind:"plan",label:`Kéthetes terv · ${d+1}. nap`,title:day.t,items:day.items.map(x=>Object.assign({},x)),backLabel:"Kezdőlap",
    intro:`<p>${esc(day.ex)}</p>`,onDone:(ok,n)=>{day.done=true;day.score=ok+"/"+n;addXP(5+ok);incEv("plan");save();planResult(`${d+1}. nap kész: ${ok} / ${n}`,d<13?"Holnap jön a következő rész.":"Minden nap megvan. Jöhet a zárófelmérés.",false);}});
}
function planResult(h,p,again){
  view.innerHTML=`<div class="player" style="justify-content:center;align-items:center;text-align:center"><span class="label">Kéthetes terv</span><h1>${esc(h)}</h1><p class="muted" style="max-width:46ch">${esc(p)}</p><div class="row" style="justify-content:center"><button class="btn ghost" data-go="ma">Kezdőlap</button>${again?`<button class="btn" id="plNext">Első nap</button>`:""}</div></div>`;
  if($("#plNext"))$("#plNext").onclick=()=>openPlan();
}
async function makePlan(btn,msg){
  if(!btn||!msg||btn.disabled)return;const job=createAIRequest(()=>btn.isConnected&&msg.isConnected&&$("#aPlan")===btn&&$("#aMsg")===msg);
  btn.disabled=true;msg.innerHTML=`<span class="thinking"><i></i><i></i><i></i></span> Összeállítom a tervet (ez fél percig is eltarthat)…`;
  const ms=monthMisses().slice(-100).map(x=>`[${mkLabel(x.k)}] ${x.q} | válasz: ${x.a||"–"} | helyes: ${x.c}`).join("\n");
  const rep=S.ai["rep-"+lang()];
  const prompt=`${LG().teacher[0].toUpperCase()+LG().teacher.slice(1)}ként készíts egy kéthetes (14 napos), napi 10 perces nyelvtani-szókincs fejlesztési tervet egy magyar anyanyelvű tanulónak, a hibái alapján. A tanuló szintje: ${defLevel()}.
${rep?"Korábbi elemzés: "+rep.summary+" Minták: "+(rep.patterns||[]).map(p=>p.title).join(", ")+"\n":""}A hibái:
${ms}

A 14 nap épüljön egymásra: a leggyakoribb gyenge ponttal kezdj, közben ismételj vissza, az utolsó két nap vegyes ismétlés legyen.
Minden naphoz: rövid cím, 2-4 mondatos magyar magyarázat a szabállyal és egy ${LG().adj} példával, és 5 feleletválasztós feladat ${LG().adv} (egy ___ hellyel, 3-4 válaszlehetőség, pontosan egy helyes, rövid magyar indoklás).
Készíts egy 10 kérdéses felmérést is ugyanilyen formában, amely a terv összes témáját lefedi (ezt az elején és a végén is kitölti a tanuló).
Csak egy JSON objektumot adj vissza:
{"title":"a terv rövid címe magyarul","goal":"egy mondat magyarul, mit fog tudni a végére","days":[{"t":"a nap címe","ex":"magyarázat","items":[{"q":"mondat ___ hellyel","a":"helyes","o":["helyes","rossz1","rossz2"],"why":"indoklás"}]}],"test":[{"q":"…","a":"…","o":["…"],"why":"…"}]}`;
  const valid=a=>(Array.isArray(a)?a:[]).filter(d=>d&&typeof d.q==="string"&&d.q.includes("___")&&Array.isArray(d.o)&&d.o.map(String).includes(String(d.a))).map(d=>({q:d.q,a:String(d.a),o:[...new Set(d.o.map(String))],why:String(d.why||"")}));
  try{const r=await job.json(prompt,{modelTier:"default"});if(!job.current())return;
    const days=(Array.isArray(r.days)?r.days:[]).slice(0,14).map(d=>({t:String(d.t||""),ex:String(d.ex||""),items:valid(d.items),done:false})).filter(d=>d.items.length);
    const test=valid(r.test);
    if(days.length<7||test.length<5)throw {code:"invalid_json"};
    while(days.length<14)days.push(Object.assign({},days[days.length%7],{done:false}));
    S.plan[job.language]={start:today(),title:String(r.title||"Kéthetes terv"),goal:String(r.goal||""),days,test,pre:null,post:null,at:Date.now()};save();
    toast("Kész a kéthetes terv. A kezdőlapon indíthatod.");if(route==="stat")renderStats();}
  catch(e){if(!job.owns())return;msg.textContent=e&&e.code==="no_ai"?aiMissing():e&&e.code==="invalid_json"?"A terv formátuma nem sikerült. Próbáld újra.":aiRequestMessage(e);btn.disabled=false;}
}

