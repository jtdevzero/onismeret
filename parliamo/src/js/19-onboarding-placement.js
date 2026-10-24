/* ============ ONBOARDING & PLACEMENT ============ */
function renderOnboarding(step){
  document.body.classList.add("onb");
  const dots=n=>`<div class="dots">${[0,1,2].map(i=>`<i class="${i<=n?"on":""}"></i>`).join("")}</div>`;
  if(!step){
    view.innerHTML=`<div class="onb-wrap"><div class="logo-big">${LOGO}</div><h1>Üdv a Parliamóban!</h1><p class="muted">Tanulj nyelvet magyarul, napi 10 percben: felvett hang, okos ismétlés, történetek és AI-tanár.</p>${dots(0)}
      <h2 style="margin-top:.6rem">Melyik nyelvet tanulnád?</h2>
      <div class="onb-langs">${Object.entries(LANGS).map(([k,L])=>`<button class="onb-lang" data-l="${k}">${flag(k)}<span><b>${L.name}</b><span class="small muted">${L.nat} · ${L.range}</span></span>${k==="en"?'<span class="pill now">Ajánlott</span>':""}</button>`).join("")}</div></div>`;
    view.querySelectorAll("[data-l]").forEach(b=>b.onclick=async()=>{fx("tap");S.settings.lang=b.dataset.l;save();view.innerHTML=`<div class="card row"><span class="thinking"><i></i><i></i><i></i></span></div>`;await loadCourse();renderOnboarding("goal");});
    return;
  }
  if(step==="goal"){
    view.innerHTML=`<div class="onb-wrap"><div class="logo-big small">${flag(lang())}</div>${dots(1)}<h2>Mennyi időd van naponta?</h2><p class="muted">Később a Beállításokban bármikor átállíthatod.</p>
      <div class="onb-langs">${[[20,"Laza","kb. 5 perc"],[50,"Rendszeres","kb. 10–15 perc"],[100,"Komoly","kb. 25–30 perc"]].map(([g,t,d])=>`<button class="onb-lang" data-g="${g}"><span><b>${t}</b><span class="small muted">${d} · ${g} XP</span></span>${g===50?'<span class="pill now">Ajánlott</span>':""}</button>`).join("")}</div></div>`;
    view.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{fx("tap");S.settings.goal=+b.dataset.g;save();renderOnboarding("level");});
    return;
  }
  if(step==="level"){
    view.innerHTML=`<div class="onb-wrap"><div class="logo-big small">${flag(lang())}</div>${dots(2)}<h2>Mennyire beszélsz ${LG().adv}?</h2>
      <div class="onb-langs"><button class="onb-lang" data-v="new"><span><b>Most kezdem</b><span class="small muted">Az első leckétől indulunk.</span></span></button>
      <button class="onb-lang" data-v="test"><span><b>Tudok már valamennyit</b><span class="small muted">Rövid szintfelmérő, 2–3 perc. Utána kihagyhatod, amit már tudsz.</span></span><span class="pill now">Szintfelmérő</span></button></div></div>`;
    view.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{fx("tap");if(b.dataset.v==="test")startPlacement(true);else finishOnboarding();});
  }
}
function finishOnboarding(){S.onboarded=true;save();document.body.classList.remove("onb");route="ma";render();}
/* Placement: three questions per level band; two right moves you up, otherwise the test stops there. */
function startPlacement(fromOnb){
  const levels=LG().levels.filter(lv=>LESSONS.some(L=>L.level===lv));
  PL={fromOnb,levels,li:0,qs:[],i:0,ok:0,reached:null};nextPlacementLevel();
}
let PL=null;
function nextPlacementLevel(){
  const lv=PL.levels[PL.li];const idx=new Set(LESSONS.map((L,i)=>L.level===lv?i:-1).filter(i=>i>=0));
  const items=shuffle(POOL.filter(c=>idx.has(c.li))).slice(0,3);
  PL.qs=items.map((c,k)=>!c.ph&&k%2?exFor(c,2):exFor(c,1));PL.i=0;PL.ok=0;drawPlacement();
}
function drawPlacement(){
  const e=PL.qs[PL.i],total=PL.levels.length*3,done=PL.li*3+PL.i;
  view.innerHTML=`<div class="player"><div class="pbar"><button class="close" id="quit" aria-label="Kilépés">×</button><div class="track"><div class="fill" style="width:${done/total*100}%"></div></div><span class="small muted">${PL.levels[PL.li]}</span></div>
    <div class="stack"><span class="label">Szintfelmérő · ${esc(e.sub||"")}</span><div class="row" style="flex-wrap:nowrap">${e.say?spkBtn(e.say):""}<div class="q">${esc(e.q)}</div></div></div>
    <div class="opts">${e.opts.map((o,i)=>`<button class="opt" data-o="${i}"><kbd>${i+1}</kbd>${esc(o)}</button>`).join("")}<button class="opt" data-o="-1" style="color:var(--muted)">Nem tudom</button></div></div>`;
  $("#quit").onclick=()=>{PL=null;if(S.onboarded)render();else finishOnboarding();};
  view.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{const k=+b.dataset.o;if(k>=0&&e.opts[k]===e.ans)PL.ok++;fx("tap");PL.i++;
    if(PL.i<PL.qs.length)return drawPlacement();
    if(PL.ok>=2){PL.reached=PL.levels[PL.li];PL.li++;if(PL.li<PL.levels.length)return nextPlacementLevel();}
    endPlacement();});
}
function endPlacement(){
  const lv=PL.reached,fromOnb=PL.fromOnb;PL=null;
  const order=LG().levels, cut=lv?order.indexOf(lv):-1;let skipped=0;
  if(cut>=0)LESSONS.forEach((L,i)=>{if(order.indexOf(L.level)<=cut&&!(ls(i)&&ls(i).done)){S.lessons[L.id]={done:true,best:0,placed:true,day:today()};skipped++;}});
  S.placed=S.placed||{};S.placed[lang()]=lv||"kezdő";save();
  const next=nextLesson();
  view.innerHTML=`<div class="onb-wrap"><div class="logo-big small">${flag(lang())}</div><span class="label">Szintfelmérő eredménye</span><h1>${lv?`A szinted: ${lv}`:"Kezdjük az alapoktól"}</h1>
    <p class="muted">${lv?`${skipped} leckét megjelöltem késznek, ezek szavai is bekerülnek az ismétlésbe. A következő lecke: ${next!==null?esc(LESSONS[next].t):"mind kész"}.`:"Az első leckétől indulunk, így biztos lesz az alap."}</p>
    <button class="btn lemon block" id="go1">Kezdjük!</button></div>`;
  confetti();
  $("#go1").onclick=()=>{if(fromOnb)finishOnboarding();else{route="leckek";render();}};
}
