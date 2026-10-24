/* ============ ONBOARDING & PLACEMENT ============ */
let OB=null;
function renderOnboarding(step){
  document.body.classList.add("onb");
  const dots=n=>`<div class="dots" aria-label="${n+1}. lépés a háromból">${[0,1,2].map(i=>`<i class="${i<=n?"on":""}"></i>`).join("")}</div>`;
  if(!step){
    view.innerHTML=`<div class="onb-wrap"><div class="logo-big">${LOGO}</div><span class="label">Egy kis gyakorlás, minden nap</span><h1>Mit szeretnél megtanulni?</h1><p class="muted">Próbálj ki egy egyperces leckét. A magyarázat magyarul segít, a hang és a felidézés a tudást építi.</p>${dots(0)}
      <div class="onb-langs">${Object.entries(LANGS).map(([k,L])=>`<button class="onb-lang" data-l="${k}">${flag(k)}<span><b>${L.name}</b><span class="small muted">${L.nat} · ${L.range}</span></span><span aria-hidden="true">→</span></button>`).join("")}</div>
      <p class="small muted">A leckék és az ismétlés AI-kapcsolat nélkül is használhatók.</p></div>`;
    view.querySelectorAll("[data-l]").forEach(b=>b.onclick=async()=>{
      fx("tap");S.settings.lang=b.dataset.l;save();
      view.innerHTML=`<div class="card row" role="status"><span class="thinking"><i></i><i></i><i></i></span><span>A tananyag betöltése…</span></div>`;
      try{await loadCourse();renderOnboarding("level");}catch(e){view.innerHTML=`<div class="onb-wrap"><h1>Nem sikerült betölteni a tananyagot</h1><p class="muted">Ellenőrizd az internetkapcsolatot, és próbáld újra.</p><button class="btn" id="onbRetry">Újrapróbálom</button></div>`;$("#onbRetry").onclick=()=>renderOnboarding();}
    });return;
  }
  if(step==="goal"){
    view.innerHTML=`<div class="onb-wrap"><div class="logo-big small">${flag(lang())}</div>${dots(2)}<h1>Mennyi idő fér bele naponta?</h1><p class="muted">Már kipróbáltad a tanulást. Válassz egy kényelmes ritmust; később bármikor átállíthatod.</p>
      <div class="onb-langs">${[[20,"Kis lépések","kb. 5 perc"],[50,"Napi lendület","kb. 10–15 perc"],[100,"Több időm van","kb. 25–30 perc"]].map(([g,t,d])=>`<button class="onb-lang" data-g="${g}"><span><b>${t}</b><span class="small muted">${d}</span></span>${g===50?'<span class="pill now">Ajánlott</span>':""}</button>`).join("")}</div></div>`;
    view.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{fx("tap");S.settings.goal=+b.dataset.g;finishOnboarding();});return;
  }
  if(step==="level"){
    view.innerHTML=`<div class="onb-wrap"><div class="logo-big small">${flag(lang())}</div>${dots(1)}<h1>Honnan induljunk?</h1><p class="muted">Mennyit tanultál már ${LG().adv}?</p>
      <div class="onb-langs"><button class="onb-lang" data-v="new"><span><b>Most kezdem</b><span class="small muted">Próbáljunk ki egy rövid mintaleckét, kb. 1 percben.</span></span><span aria-hidden="true">→</span></button>
      <button class="onb-lang" data-v="test"><span><b>Tudok már valamennyit</b><span class="small muted">Változatos feladatokkal keresünk egy jó kezdőpontot. Szintenként kb. 2 perc.</span></span><span class="pill">Szintfelmérő</span></button></div></div>`;
    view.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{fx("tap");if(b.dataset.v==="test")startPlacement(true);else startOnboardingSample();});
  }
}
function finishOnboarding(){OB=null;S.onboarded=true;save();document.body.classList.remove("onb");route="ma";render();}
/* The first success comes before choosing a daily goal. This tiny real exercise uses the course's first phrase. */
function startOnboardingSample(){
  const c=POOL.find(c=>c.li===0&&c.ph)||POOL.find(c=>c.li===0);
  if(!c)return renderOnboarding("goal");
  OB={c,step:0,ok:0,n:0,attempted:false};drawOnboardingSample();
}
function drawOnboardingSample(){
  const {c,step}=OB;
  if(step===0){
    view.innerHTML=`<div class="onb-wrap"><span class="label">Az első perced · 1 / 3</span><h1>Egy mondat, amit már ma használhatsz</h1><div class="card fc"><div class="front" ${LA()}>${esc(c.it)}</div>${spkBtn(c.it)}<div class="back">${esc(c.hu)}</div></div><p class="muted">Hallgasd meg, majd mondd ki hangosan. A következő feladatban már te idézed fel.</p><button class="btn block" id="sampleStart">Megvan, próbáljuk ki →</button></div>`;
    $("#sampleStart").onclick=()=>{OB.step=1;drawOnboardingSample();};return;
  }
  if(step===3){
    S.onboardingSample=S.onboardingSample||{};S.onboardingSample[lang()]={at:Date.now(),ok:OB.ok,n:OB.n};save();
    view.innerHTML=`<div class="onb-wrap"><span class="label">Az első gyakorlás kész</span><h1>Megvan az első lépés!</h1><div class="card stack"><p class="it" ${LA()}>${esc(c.it)}</p><p class="muted">${esc(c.hu)}</p>${spkBtn(c.it)}</div><p class="muted">Ezt a mondatot meghallgattad, felismerted és leírtad. A későbbi ismétlés segít, hogy meg is maradjon.</p><button class="btn block" id="sampleGoal">Beállítom a napi ritmusom →</button></div>`;
    $("#sampleGoal").onclick=()=>renderOnboarding("goal");return;
  }
  const opts=step===1?distract(c,"hu",POOL.filter(x=>!!x.ph===!!c.ph)):null;
  view.innerHTML=`<div class="onb-wrap"><span class="label">Az első perced · ${step+1} / 3</span><h1>${step===1?"Mit jelent a mondat?":"Most idézd fel önállóan"}</h1>
    <div class="card"><p class="q" ${step===1?LA():""}>${esc(step===1?c.it:c.hu)}</p></div>
    ${step===1?`<div class="opts">${opts.map((o,i)=>`<button class="opt" data-sample-o="${i}">${esc(o)}</button>`).join("")}</div>`:`<form id="sampleForm" class="stack"><label for="sampleAnswer">Írd le ${LG().adv}.</label><input id="sampleAnswer" autocomplete="off" autocapitalize="off" spellcheck="false" ${LA()}><button class="btn block" id="sampleCheck" disabled>Ellenőrzés</button></form>`}
    <div id="sampleFeedback" role="status"></div><button class="btn block" id="sampleNext" hidden>Tovább →</button></div>`;
  const answer=given=>{
    if(OB.attempted)return;OB.attempted=true;OB.n++;
    const good=step===1?given===c.hu:check(given,[c.it,...(c.alt||[])]).ok;if(good)OB.ok++;
    fx(good?"ok":"bad");
    $("#sampleFeedback").innerHTML=`<div class="feedback ${good?"ok":"bad"}"><b>${good?"Így van!":"Nézzük meg együtt."}</b><span ${LA()}>${esc(c.it)}</span><span>${esc(c.hu)}</span>${!good&&step===2?'<span class="small">Olvasd el, mondd ki, majd írd le még egyszer.</span>':""}</div>`;
    view.querySelectorAll("[data-sample-o]").forEach(b=>{b.disabled=true;if(opts[+b.dataset.sampleO]===c.hu)b.classList.add("right");});
    if(step===2){
      if(!good){OB.attempted=false;$("#sampleCheck").textContent="Újra megpróbálom";$("#sampleAnswer").value="";$("#sampleCheck").disabled=true;$("#sampleAnswer").focus();return;}
      $("#sampleAnswer").readOnly=true;$("#sampleCheck").hidden=true;
    }
    $("#sampleNext").hidden=false;$("#sampleNext").focus();
  };
  if(opts)view.querySelectorAll("[data-sample-o]").forEach(b=>b.onclick=()=>answer(opts[+b.dataset.sampleO]));
  if(step===2){$("#sampleAnswer").oninput=()=>$("#sampleCheck").disabled=!$("#sampleAnswer").value.trim();$("#sampleForm").onsubmit=e=>{e.preventDefault();answer($("#sampleAnswer").value);};}
  $("#sampleNext").onclick=()=>{OB.step++;OB.attempted=false;drawOnboardingSample();};
}
/* Six items per band: recognition, listening and two independent written answers. A course starting point, not a CEFR certificate. */
let PL=null;
function startPlacement(fromOnb){
  const levels=LG().levels.filter(lv=>LESSONS.some(L=>L.level===lv));
  PL={fromOnb,levels,li:0,qs:[],i:0,ok:0,typed:0,reached:null,results:[],withoutAudio:false};nextPlacementLevel();
}
function placementItems(level){
  const lessonIds=shuffle(LESSONS.map((L,i)=>L.level===level?i:-1).filter(i=>i>=0)),out=[],seen=new Set();
  // Round-robin across lessons prevents a single familiar topic from deciding the whole band.
  for(let round=0;out.length<6&&round<6;round++)for(const li of lessonIds){
    const candidates=shuffle(POOL.filter(c=>c.li===li&&!seen.has(c.id)&&!!c.ph===(out.length%2===0)));
    const c=candidates[0]||POOL.find(c=>c.li===li&&!seen.has(c.id));
    if(c){out.push(c);seen.add(c.id);}if(out.length===6)break;
  }
  return out;
}
function nextPlacementLevel(){
  const items=placementItems(PL.levels[PL.li]);
  PL.qs=items.map((c,k)=>{
    const typed=k===1||k===4,listen=k===2;
    return {c,t:typed?"type":listen?"listen":"mc",weight:typed?2:1,
      q:typed||k===5?c.hu:c.it,ans:typed?[c.it,...(c.alt||[])]:listen||k===5?c.it:c.hu,
      opts:typed?null:distract(c,listen||k===5?"it":"hu",POOL.filter(x=>!!x.ph===!!c.ph)),reverse:k===5};
  });
  PL.i=0;PL.ok=0;PL.typed=0;drawPlacement();
}
function drawPlacement(){
  const e=PL.qs[PL.i],done=PL.li*6+PL.i,total=PL.levels.length*6;
  if(!e)return endPlacement();
  const prompt=e.t==="type"?"Írd le önállóan "+LG().adv:e.t==="listen"?"Válaszd ki, amit hallasz":e.reverse?"Hogy mondod "+LG().adv+"?":"Mit jelent?";
  view.innerHTML=`<div class="player"><div class="pbar"><button class="close" id="quit" aria-label="Kilépés a szintfelmérőből">×</button><div class="track"><div class="fill" style="width:${done/total*100}%"></div></div><span class="small muted">${PL.levels[PL.li]} · ${PL.i+1}/${PL.qs.length}</span></div>
    <div class="stack"><span class="label">Kezdőpont keresése · ${prompt}</span>${e.t==="listen"?`<div class="listen">${spkBtn(e.c.it,"big")}<button class="btn ghost" id="placeNoAudio">Hang nélkül folytatom</button></div>`:`<div class="q" ${e.t==="mc"&&!e.reverse?LA():""}>${esc(e.q)}</div>`}</div>
    ${e.t==="type"?`<form id="placeForm" class="stack"><label class="small muted" for="placeAnswer">Válasz ${LG().adv}</label><input id="placeAnswer" autocomplete="off" autocapitalize="off" spellcheck="false" ${LA()}><button class="btn" id="placeSubmit" disabled>Válasz elküldése</button></form>`:`<div class="opts">${e.opts.map((o,i)=>`<button class="opt" data-o="${i}">${esc(o)}</button>`).join("")}</div>`}
    <button class="btn ghost" id="placeUnknown">Nem tudom</button><p class="small muted">A feladatok a kurzus kezdőpontját segítenek kiválasztani. A beszédkészségedet ez a felmérő nem méri.</p></div>`;
  $("#quit").onclick=()=>{const from=PL.fromOnb;PL=null;if(from)renderOnboarding("level");else render();};
  const submit=correct=>{
    if(!PL)return;
    if(correct){PL.ok+=e.weight;if(e.t==="type")PL.typed++;}fx("tap");PL.i++;
    if(PL.i<PL.qs.length)return drawPlacement();
    const max=PL.qs.reduce((n,q)=>n+q.weight,0),passed=PL.ok/max>=0.75&&PL.typed>=1;
    PL.results.push({level:PL.levels[PL.li],score:PL.ok,max,typed:PL.typed,passed});
    if(passed){PL.reached=PL.levels[PL.li];PL.li++;if(PL.li<PL.levels.length)return nextPlacementLevel();}
    endPlacement();
  };
  view.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>submit(e.opts[+b.dataset.o]===e.ans));
  $("#placeUnknown").onclick=()=>submit(false);
  if(e.t==="type"){
    $("#placeAnswer").oninput=()=>$("#placeSubmit").disabled=!$("#placeAnswer").value.trim();
    $("#placeForm").onsubmit=ev=>{ev.preventDefault();submit(check($("#placeAnswer").value,e.ans).ok);};
  }
  if(e.t==="listen")$("#placeNoAudio").onclick=()=>{PL.withoutAudio=true;e.t="mc";e.q=e.c.it;e.ans=e.c.hu;e.opts=distract(e.c,"hu",POOL.filter(x=>!!x.ph===!!e.c.ph));drawPlacement();};
}
function endPlacement(){
  const result=PL,lv=result.reached,fromOnb=result.fromOnb,order=LG().levels;
  // Keep the highest available band open for practice even if every sampled band was passed.
  const startIdx=Math.min(result.li,result.levels.length-1),startLevel=result.levels[startIdx]||result.levels[0],cut=order.indexOf(startLevel)-1;
  PL=null;let skipped=0;
  LESSONS.forEach((L,i)=>{
    const prev=ls(i),below=order.indexOf(L.level)<=cut;
    if(prev&&prev.done&&!prev.placed)return;
    if(below){S.lessons[L.id]=Object.assign({},prev,{done:false,placed:true,day:today()});skipped++;}
    else if(prev&&prev.placed)delete S.lessons[L.id];
  });
  S.placed=S.placed||{};S.placed[lang()]=lv||"kezdő";
  S.placement=S.placement||{};S.placement[lang()]={at:Date.now(),startLevel,results:result.results,withoutAudio:result.withoutAudio};save();
  const next=nextLesson();
  view.innerHTML=`<div class="onb-wrap"><div class="logo-big small">${flag(lang())}</div><span class="label">Javasolt kezdőpont</span><h1>Kezdjünk a ${esc(startLevel)} szinten</h1>
    <p class="muted">Ez rövid, kurzuson belüli becslés, nem hivatalos nyelvi szintminősítés. A következő gyakorlatok segítenek pontosítani.${result.withoutAudio?" A hangos feladatokat írásos változattal helyettesítetted, ezért a hallásértésedet sem mértük.":""}</p>
    <div class="card stack"><p>${skipped?`${skipped} leckét átugrottként jelöltünk. Ezek bármikor megnyithatók és elvégezhetők; nem számítanak befejezett leckének.`:"Az alapoktól építkezünk; bármelyik leckébe belenézhetsz."}</p><p class="small muted">${next!==null?"Első javasolt lecke: "+esc(LESSONS[next].hu):"Válassz egy leckét az ismétléshez."}</p></div>
    <button class="btn block" id="go1">${fromOnb?"Kiválasztom a napi ritmusom":"Tovább a leckékhez"} →</button></div>`;
  $("#go1").onclick=()=>{if(fromOnb)renderOnboarding("goal");else{route="leckek";render();}};
}
