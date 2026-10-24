/* ============ FLASHCARDS ============ */
function renderCards(){
  const due=dueList(), avail=newAvail(), nl=Math.min(newLeft(),avail.length);
  const pc=packCards(), total=pc.length, mature=pc.filter(c=>c.ivl>=21).length;
  view.innerHTML=`<div class="stack">
  <div><span class="label">Időközös ismétlés</span><h1>Szókártyák</h1><p class="muted">Minden kártyánál mondd ki magadban a választ, aztán fordítsd meg, és értékeld, mennyire ment. Amit jól tudsz, ritkábban jön elő, amit elfelejtettél, hamarabb.</p></div>
  <div class="card"><div class="stats">
    <div class="stat"><span class="label">Esedékes</span><b class="tnum">${due.length}</b></div>
    <div class="stat"><span class="label">Új ma</span><b class="tnum">${nl}</b></div>
    <div class="stat"><span class="label">Tanulásban</span><b class="tnum">${total-mature}</b></div>
    <div class="stat"><span class="label">Megy (21+ nap)</span><b class="tnum">${mature}</b></div>
  </div></div>
  <div class="row"><span class="label">Irány</span><span class="seg" id="dir">${[["it",LG().adj+" → magyar"],["hu","magyar → "+LG().adj],["mix","vegyes"]].map(([k,l])=>`<button data-v="${k}" aria-pressed="${S.settings.dir===k}">${l}</button>`).join("")}</span></div>
  ${POOL.some(c=>S.cards[c.id])?`<button class="btn block soft" id="startCar">${I.spk.replace("<svg",'<svg style="width:18px;height:18px"')} Hangos ismétlés (autóban, kéz nélkül)</button>`:""}
  <button class="btn block lemon" id="startC" ${due.length+nl?"":"disabled"}>${due.length+nl?`Ismétlés indítása (${due.length+nl})`:"Mára nincs több kártya"}</button>
  ${!avail.length&&!due.length?`<p class="small muted">Fejezz be egy újabb leckét, és a szavai itt jelennek meg.</p>`:""}
  ${ownCard()}
  ${packsCard()}
  <div class="sec-head"><h2>Szótár</h2><span class="small muted tnum">${POOL.length} elem</span></div>
  <input id="q" placeholder="Keresés ${LG().adv} vagy magyarul…" aria-label="Keresés a szótárban">
  <div class="card" id="dict"></div>
  </div>`;
  $("#dir").querySelectorAll("button").forEach(b=>b.onclick=()=>{S.settings.dir=b.dataset.v;save();renderCards();});
  $("#startC").onclick=startCards;if($("#startCar"))$("#startCar").onclick=startCar;
  const drawDict=()=>{const q=deacc(norm($("#q").value));const t=today();
    const rows=POOL.filter(c=>!q||deacc(norm(c.it)).includes(q)||deacc(norm(c.hu)).includes(q)).slice(0,80);
    $("#dict").innerHTML=rows.length?rows.map(c=>{const s=S.cards[c.id];const pill=c.own&&!s?`<span class="pill now">Saját</span>`:!s?`<span class="pill">L${c.li+1}</span>`:s.ivl>=21?`<span class="pill ok">megy</span>`:s.due<=t?`<span class="pill now">esedékes</span>`:`<span class="pill">${ivlLabel({ivl:s.due-t})} múlva</span>`;
      return `<div class="dict-row">${spkBtn(c.it)}<div style="min-width:0"><div class="it" ${LA()}>${esc(c.it)}</div><div class="small muted">${esc(c.hu)}</div></div>${pill}</div>`;}).join(""):`<p class="muted">Nincs találat.</p>`;};
  $("#q").oninput=drawDict;drawDict();bindOwn();bindPacks();
}
function startCards(){
  const due=shuffle(dueList()), nw=newAvail().slice(0,newLeft());
  prefetch(...new Set([...due,...nw].slice(0,40).map(c=>LESSONS[c.li]&&LESSONS[c.li].id).filter(Boolean)));
  CS={q:[...due,...nw].map(c=>({c,dir:S.settings.dir==="mix"?(Math.random()<.5?"it":"hu"):S.settings.dir,isNew:!S.cards[c.id]})),done:0,flip:false};
  drawCard();
}
function drawCard(){
  if(!CS.q.length){const n=CS.done;CS=null;view.innerHTML=`<div class="player" style="justify-content:center;align-items:center;text-align:center"><span class="label">Kész</span><h1>${LG().fin[1]}</h1><p class="muted">${n} kártyát ismételtél át. Holnap újra találkozunk.</p><div class="row" style="justify-content:center"><button class="btn ghost" data-go="ma">Kezdőlap</button><button class="btn" data-go="leckek">Leckék</button></div></div>`;return;}
  const it=CS.q[0], c=it.c, front=it.dir==="it"?c.it:c.hu, back=it.dir==="it"?c.hu:c.it, prev=S.cards[c.id];
  view.innerHTML=`<div class="player">
    <div class="pbar"><button class="close" id="quit" aria-label="Kilépés">×</button><div class="track"><div class="fill" style="width:${CS.done/(CS.done+CS.q.length)*100}%"></div></div><span class="small muted tnum">${CS.q.length} hátra</span></div>
    <div class="card fc">${it.isNew?`<span class="pill now">Új</span>`:""}<span class="label">${it.dir==="it"?"Mit jelent?":"Hogy mondod "+LG().adv+"?"}</span>
      <div class="front" ${it.dir==="it"?LA():""}>${esc(front)}</div>${it.dir==="it"?spkBtn(c.it):""}
      ${CS.flip?`<hr style="width:60%;border:0;border-top:1px solid var(--line)"><div class="back" ${it.dir==="hu"?LA():""}>${esc(back)}</div>${it.dir==="hu"?spkBtn(c.it):""}<button class="btn ghost" id="hardT" aria-pressed="${!!S.hard[c.id]}" style="font-size:.85rem">${S.hard[c.id]?"★ Nehéz kártya (gyakrabban jön)":"☆ Megjelölés nehéznek"}</button>`:""}</div>
    <div class="pfoot">${CS.flip?`<div class="grades">${["Újra","Nehéz","Jó","Könnyű"].map((l,g)=>`<button class="g${g}" data-g="${g}">${l}<small>${ivlLabel(sched(prev,g,c.id))}</small></button>`).join("")}</div><p class="small muted" style="text-align:center">Billentyűk: 1–4</p>`:`<button class="btn block" id="flip">Megfordítás <span class="small" style="opacity:.7">(szóköz)</span></button>`}</div></div>`;
  $("#quit").onclick=()=>{CS=null;renderCards();};
  if(!CS.flip){$("#flip").onclick=()=>{CS.flip=true;drawCard();};if(it.dir==="it")setTimeout(()=>say(c.it),200);}
  else{if(it.dir==="hu")say(c.it);view.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>gradeCard(+b.dataset.g));
    $("#hardT").onclick=()=>{if(S.hard[c.id])delete S.hard[c.id];else S.hard[c.id]=1;save();drawCard();};}
}
function gradeCard(g){
  const it=CS.q.shift();const t=today();
  if(it.isNew){if(S.newToday.day!==t)S.newToday={day:t,n:0};S.newToday.n++;it.isNew=false;}
  S.cards[it.c.id]=sched(S.cards[it.c.id],g,it.c.id);logReview(g>0);incEv("reviews");if(g===0)S.miss[it.c.id]=(S.miss[it.c.id]||0)+1;
  if(g===0)CS.q.splice(Math.min(3,CS.q.length),0,it);else CS.done++;
  CS.flip=false;addXP(1);drawCard();
}
document.addEventListener("keydown",e=>{
  if(e.target.matches("input,textarea,select")){
    if(e.key==="Enter"&&P&&e.target.id==="ans"){e.preventDefault();const g=$("#go");if(g&&!g.disabled)g.click();}
    return;}
  if(CS){if(!CS.flip&&(e.key===" "||e.key==="Enter")){e.preventDefault();CS.flip=true;drawCard();}else if(CS.flip&&/^[1-4]$/.test(e.key)){gradeCard(+e.key-1);}return;}
  if(P){const n=+e.key;if(n>=1&&n<=4){const b=view.querySelector(`[data-o="${n-1}"]`);if(b)b.click();}if(e.key==="Enter"){const g=$("#go");if(g&&!g.disabled&&!g.hidden){e.preventDefault();g.click();}}}
});

