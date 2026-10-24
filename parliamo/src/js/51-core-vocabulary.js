/* ============ CORE VOCABULARY (English, A1–B2) ============ */
/* The ~3000 most useful words by level. A level that is switched on feeds the new-card queue (after lesson and own words),
   so the daily new-card limit still decides how fast they come. */
const coreOn=()=>S.core||(S.core={});
function rebuildCore(){
  POOL=POOL.filter(c=>!c.core);
  if(CORE&&lang()==="en"){const have=new Set(POOL.map(c=>norm(c.it)));
    CORE.levels.forEach(L=>{if(!coreOn()[L.level])return;L.words.forEach(w=>{const n=norm(w.it);if(have.has(n))return;have.add(n);POOL.push({id:w.id,it:w.it,hu:w.hu,alt:[],li:OWN_LI(),core:L.level});});});}
  WORDS=POOL.filter(c=>!c.ph);
}
function coreSuggest(){
  const v=(S.vsize||[]).slice(-1)[0];
  if(v)return v.size<900?"A1":v.size<1800?"A2":v.size<2800?"B1":"B2";
  const d=defLevel();return d==="C1"?"B2":d;
}
function coreStats(L){let seen=0,ok=0;L.words.forEach(w=>{const c=S.cards[w.id];if(c){seen++;if(c.ivl>=21)ok++;}});return {seen,ok};}
function coreCard(){
  if(!CORE||lang()!=="en")return "";
  const sug=coreSuggest(),total=CORE.levels.reduce((a,L)=>a+L.words.length,0);
  return `<div class="sec-head"><h2>Alapszókincs</h2><span class="small muted tnum">${total} szó · A1–B2</span></div>
  <div class="card stack" style="gap:.7rem"><p class="small muted">A leggyakoribb angol szavak szintenként, felvett kiejtéssel. Kapcsold be a szintedet: a szavai a napi új kártyák közé kerülnek (naponta legfeljebb ${S.settings.newPerDay}, a leckék szavai után).</p>
  <div class="drills">${CORE.levels.map(L=>{const on=!!coreOn()[L.level],st=coreStats(L);
    return `<div class="drill" style="cursor:default"><div class="row" style="justify-content:space-between"><b>${L.level}</b>${L.level===sug?'<span class="pill now">Ajánlott</span>':""}</div>
      <span class="small muted tnum">${L.words.length} szó · ${st.seen} elkezdve · ${st.ok} megy</span><div class="meter" aria-hidden="true"><i style="width:${st.seen/L.words.length*100}%"></i></div>
      <div class="row"><button class="btn ${on?"soft":""}" data-core="${L.level}" aria-pressed="${on}">${on?"✓ Bekapcsolva":"Bekapcsolás"}</button><button class="btn ghost" data-corel="${L.level}">Lista</button></div></div>`;}).join("")}</div></div>`;
}
function bindCore(){
  view.querySelectorAll("[data-core]").forEach(b=>b.onclick=()=>{const lv=b.dataset.core;if(coreOn()[lv])delete coreOn()[lv];else{coreOn()[lv]=1;toast(lv+" alapszavak bekapcsolva. A napi körben jönnek.");}save();rebuildCore();renderCards();});
  view.querySelectorAll("[data-corel]").forEach(b=>b.onclick=()=>openCoreList(b.dataset.corel));
}
function openCoreList(lv){
  const L=CORE.levels.find(x=>x.level===lv);if(!L)return;
  const t=today();
  subShell(["Kártyák",()=>go("kartyak")],"Alapszókincs",`${lv} · ${L.words.length} szó`,`<input id="cq" placeholder="Keresés angolul vagy magyarul…" aria-label="Keresés a listában"><div class="card" id="clist"></div>`);
  const draw=()=>{const q=deacc(norm($("#cq").value));
    const rows=L.words.filter(w=>!q||deacc(norm(w.it)).includes(q)||deacc(norm(w.hu)).includes(q)).slice(0,300);
    $("#clist").innerHTML=rows.length?rows.map(w=>{const s=S.cards[w.id];return `<div class="dict-row">${spkBtn(w.it)}<div style="min-width:0"><div class="it" ${LA()}>${esc(w.it)}</div><div class="small muted">${esc(w.hu)}</div></div>${s?s.ivl>=21?'<span class="pill ok">megy</span>':s.due<=t?'<span class="pill now">esedékes</span>':'<span class="pill">tanulva</span>':""}</div>`;}).join("")+(rows.length===300?`<p class="small muted">Az első 300 találat. Keress rá a többire.</p>`:""):`<p class="muted">Nincs találat.</p>`;};
  $("#cq").oninput=draw;draw();prefetch(L.words[0].b);
}
