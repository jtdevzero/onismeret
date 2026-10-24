/* ============ TOPIC PACKS ============ */
function packsCard(){
  if(!XT.packs.length)return "";
  const own=new Set(ownList().map(w=>norm(w.it)));
  return `<div class="sec-head"><h2>Témakörös szócsomagok</h2><span class="small muted">${XT.packs.length} csomag</span></div>
  <div class="drills">${XT.packs.map((p,i)=>{const n=p.items.filter(x=>own.has(norm(x.it))).length;return `<button class="drill" data-pk="${p.id}"><span class="dico c${i%4+1}">${I.kartyak}</span><b>${esc(p.title)}</b><span class="small muted">${esc(p.desc)} · ${p.items.length} kifejezés</span>${n?`<span class="small"><span class="pill ${n===p.items.length?"ok":"now"}">${n===p.items.length?"Felvéve":n+" felvéve"}</span></span>`:""}</button>`;}).join("")}</div>`;
}
function bindPacks(){view.querySelectorAll("[data-pk]").forEach(b=>b.onclick=()=>openPack(b.dataset.pk));}
function openPack(id){
  const p=XT.packs.find(x=>x.id===id);prefetch(`pk-${lang()}-${id}`);const own=new Set(ownList().map(w=>norm(w.it)));const left=p.items.filter(x=>!own.has(norm(x.it)));
  subShell(["Kártyák",()=>go("kartyak")],"Témakörös szócsomag",esc(p.title),`<p class="muted">${esc(p.desc)} Minden kifejezéshez felvett hang és példamondat tartozik. A felvett szavak a napi körben és a kártyák között jönnek elő.</p>
    <button class="btn block lemon" id="pkAdd" ${left.length?"":"disabled"}>${left.length?`Mind a ${left.length} felvétele a kártyák közé`:"Minden kifejezés a kártyáid között van"}</button>
    <div class="card"><div class="phr">${p.items.map(x=>`<div>${spkBtn(x.it)}<div style="min-width:0;flex:1"><div class="it" ${LA()}>${esc(x.it)} ${own.has(norm(x.it))?'<span class="pill ok">✓</span>':""}</div><div class="small muted">${esc(x.hu)}</div><div class="small" style="margin-top:.2rem"><button class="linkish" data-say="${esc(x.ex)}" ${LA()}>${esc(x.ex)}</button></div><div class="small muted">${esc(x.exhu)}</div></div></div>`).join("")}</div></div>`);
  $("#pkAdd").onclick=()=>{left.forEach(x=>ownList().push({id:`${lang()}-own-${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`,it:x.it,hu:x.hu,alt:[],ex:x.ex,note:p.title}));save();rebuildOwn();fx("win");toast(left.length+" kifejezés felvéve: "+p.title);incEv("packs");openPack(id);};
}

