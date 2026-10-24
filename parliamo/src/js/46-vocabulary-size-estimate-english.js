/* ============ VOCABULARY SIZE ESTIMATE (English) ============ */
let VT=null;
function vsizeCard(){
  if(lang()!=="en"||!XT.vt)return "";
  const h=S.vsize||[],last=h[h.length-1],days=last?today()-Math.floor(last.at/864e5):null,max=Math.max(1,...h.map(x=>x.size));
  return `<div class="card stack"><div class="row" style="justify-content:space-between"><h3>Szókincsbecslés</h3>${last?`<span class="pill ok">${last.level}</span>`:""}</div>
    ${last?`<p><b class="tnum" style="font-size:1.6rem">~${last.size.toLocaleString("hu-HU")}</b> angol szó · becsült szint: <b>${last.level}</b></p>
      ${h.length>1?`<div class="bars" style="height:110px">${h.slice(-8).map(x=>`<div class="bcol"><span class="small tnum">${Math.round(x.size/100)/10}k</span><i style="height:${Math.max(4,x.size/max*100)}%"></i><span class="small muted">${new Date(x.at).toLocaleDateString("hu-HU",{month:"short"})}</span></div>`).join("")}</div>`:""}
      <p class="small muted">${days<30?`Következő ajánlott teszt ${30-days} nap múlva.`:"Ideje egy új tesztnek."}</p>`:`<p class="small muted">3 perces teszt: 64 szóról döntöd el, ismered-e. Néhány közülük kitalált szó, ezekkel szűri ki az app a találgatást. A végén megbecsüli, hány angol szót ismersz, és milyen szinten állsz.</p>`}
    <div><button class="btn soft" id="vtGo">${last?"Új teszt":"Teszt indítása"}</button></div></div>`;
}
function startVT(){
  const X=XT.vt,items=shuffle([...X.bands.flatMap((b,bi)=>b.words.map(w=>({w,b:bi}))),...X.pseudo.map(w=>({w,b:-1}))]);
  VT={items,i:0,yes:{}};drawVT();
}
function drawVT(){
  const it=VT.items[VT.i];if(!it)return finishVT();
  subShell(["Statisztika",()=>{VT=null;go("stat");}],"Szókincsbecslés","",`<div class="pbar"><div class="track"><div class="fill" style="width:${VT.i/VT.items.length*100}%"></div></div><span class="small muted tnum">${VT.i+1}/${VT.items.length}</span></div>
    <div class="card" style="text-align:center;padding:2.2rem 1rem"><span class="label">Ismered ezt az angol szót?</span><div class="big-q" style="font-size:2.4rem;margin-top:.5rem" lang="en">${esc(it.w)}</div></div>
    <div class="opts" style="grid-template-columns:1fr 1fr"><button class="opt" data-y="0" style="justify-content:center"><kbd>1</kbd>Nem ismerem</button><button class="opt" data-y="1" style="justify-content:center"><kbd>2</kbd>Ismerem</button></div>
    <p class="small muted">Csak akkor jelöld, hogy ismered, ha tudod, mit jelent. Vigyázz: néhány szó kitalált.</p>`);
  view.querySelectorAll("[data-y]").forEach(b=>b.onclick=()=>{VT.yes[VT.i]=b.dataset.y==="1";VT.i++;drawVT();});
}
document.addEventListener("keydown",e=>{if(!VT||e.target.matches("input,textarea"))return;if(e.key==="1"||e.key==="2"){const b=view.querySelector(`[data-y="${+e.key-1}"]`);if(b)b.click();}});
function vtScore(items,yes,X){
  const ps=items.map((x,i)=>[x,yes[i]]).filter(([x])=>x.b<0),fa=ps.filter(([,y])=>y).length/Math.max(1,ps.length);
  let size=0;X.bands.forEach((b,bi)=>{const ws=items.map((x,i)=>[x,yes[i]]).filter(([x])=>x.b===bi),hit=ws.filter(([,y])=>y).length/Math.max(1,ws.length);
    const r=fa>=1?0:Math.max(0,(hit-fa)/(1-fa));size+=r*(b.to-b.from);});
  size=Math.round(size/50)*50;const level=(X.levels.find(([n])=>size<n)||[0,"C2"])[1];
  return {size,level,fa};
}
function finishVT(){
  const r=vtScore(VT.items,VT.yes,XT.vt);VT=null;S.vsize=S.vsize||[];S.vsize.push({at:Date.now(),size:r.size,level:r.level,fa:Math.round(r.fa*100)});incEv("tests");addXP(10);save();
  view.innerHTML=`<div class="player" style="justify-content:center;align-items:center;text-align:center"><span class="label">Szókincsbecslés</span><h1>~${r.size.toLocaleString("hu-HU")} szó</h1><p class="muted" style="max-width:46ch">Becsült szint: <b>${r.level}</b>. ${r.fa>0.25?"Sok kitalált szót jelöltél ismerősnek, ezért az eredmény pontatlan lehet. Legközelebb csak akkor jelöld, ha biztosan tudod a jelentését.":"Az eredmény a gyakori szavak sávjaiból számolt becslés, nem pontos szám."}</p><div class="row" style="justify-content:center"><button class="btn" data-go="stat">Statisztika</button></div></div>`;
  confetti();
}

