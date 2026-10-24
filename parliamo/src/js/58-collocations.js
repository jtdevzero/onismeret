/* ============ COLLOCATIONS (English, B2–C1) ============ */
/* Twelve groups of twenty word partnerships with recorded audio and an example. Each group has a gap-fill drill built from
   its examples, and its phrases can be added to the flashcards in one go (as own words, like the topic packs). */
const colOf=()=>S.col||(S.col={});
function renderColloc(){stopViews();withExtra("colloc",renderCollocNow);}
function renderCollocNow(){
  const own=new Set(ownList().map(w=>norm(w.it))),total=XT.col.reduce((a,g)=>a+g.items.length,0);
  subShell(["Gyakorlás",()=>go("gyakorlas")],"Kollokációk","Szókapcsolatok",`<p class="muted">Amit a magyar egy igével mond, azt az angol gyakran állandó szókapcsolattal: döntést nem „csinálunk”, hanem <i ${LA()}>make a decision</i>, az eső nem „erős”, hanem <i ${LA()}>heavy rain</i>. Csoportonként hallgasd meg, gyakorold, és tedd kártyára, amit tanulni szeretnél.</p>
    <button class="btn block lemon" id="colMix">Vegyes gyakorló (15 kérdés az összes csoportból)</button>
    <div class="drills">${XT.col.map((g,i)=>{const r=colOf()[g.id],n=g.items.filter(x=>own.has(norm(x.it))).length;return `<button class="drill" data-col="${g.id}"><span class="dico c${i%4+1}">${I.kartyak}</span><b>${esc(g.title)}</b><span class="small muted">${esc(g.desc)} · ${g.items.length} kapcsolat</span>${r?`<span class="small"><span class="pill ${r.ok/r.n>=.8?"ok":""}">Legutóbb ${r.ok}/${r.n}</span></span>`:""}${n?`<span class="small"><span class="pill now">${n} kártyán</span></span>`:""}</button>`;}).join("")}</div>
    <p class="small muted tnum">${total} szókapcsolat · ${XT.col.length} csoport</p>`);
  view.querySelectorAll("[data-col]").forEach(b=>b.onclick=()=>openColGroup(b.dataset.col));
  $("#colMix").onclick=()=>colQuiz(null);
}
function openColGroup(id){
  const g=XT.col.find(x=>x.id===id);if(!g)return;prefetch(`col-${lang()}-${id}`);
  const own=new Set(ownList().map(w=>norm(w.it))),left=g.items.filter(x=>!own.has(norm(x.it)));
  subShell(["Kollokációk",renderColloc],"Kollokációk",esc(g.title),`<p class="muted">${esc(g.desc)}</p>
    <div class="row"><button class="btn lemon" id="colGo">Gyakorló (10 kérdés)</button><button class="btn soft" id="colAdd" ${left.length?"":"disabled"}>${left.length?`Mind a ${left.length} kártyára`:"Mind a kártyáid között van"}</button></div>
    <div class="card"><div class="phr">${g.items.map(x=>`<div>${spkBtn(x.it)}<div style="min-width:0;flex:1"><div class="it" ${LA()}>${esc(x.it)} ${own.has(norm(x.it))?'<span class="pill ok">✓</span>':""}</div><div class="small muted">${esc(x.hu)}</div><div class="small" style="margin-top:.2rem"><button class="linkish" data-say="${esc(x.ex)}" ${LA()}>${esc(x.ex)}</button></div><div class="small muted">${esc(x.exhu)}</div></div></div>`).join("")}</div></div>`);
  $("#colGo").onclick=()=>colQuiz(id);
  $("#colAdd").onclick=()=>{left.forEach(x=>ownList().push({id:`${lang()}-own-${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`,it:x.it,hu:x.hu,alt:[],ex:x.ex,note:"Kollokáció: "+g.title}));save();rebuildOwn();fx("win");toast(left.length+" szókapcsolat felvéve a kártyák közé.");openColGroup(id);};
}
function colQuiz(id){
  const g=id&&XT.col.find(x=>x.id===id),pool=g?g.items:XT.col.flatMap(x=>x.items),items=shuffle(pool.slice()).slice(0,g?10:15);
  prefetch(...new Set(items.map(x=>AUDIO_IDX[x.ex]).filter(Boolean)));
  QZ_BACK=()=>g?openColGroup(id):renderColloc();
  runQuiz({kind:"colloc",label:"Kollokációk",title:g?g.title:"Vegyes gyakorló",items:items.map(x=>({q:x.q,a:x.a,o:x.o,why:`${x.it} = ${x.hu}`})),backLabel:g?"Csoport":"Kollokációk",
    onDone:(ok,n)=>{if(g)colOf()[id]={ok,n,d:today()};drillStat("colloc",ok/n>=.8);addXP(ok);save();
      subShell(["Kollokációk",renderColloc],"Kollokációk",esc(g?g.title:"Vegyes gyakorló"),`<div class="card stack" style="text-align:center"><h1 class="tnum">${ok} / ${n}</h1><p class="muted">${ok===n?"Hibátlan!":ok/n>=.8?"Szép eredmény.":"A rontott kapcsolatokat érdemes kártyára tenni, és pár nap múlva újra gyakorolni."}</p><div class="row" style="justify-content:center">${g?`<button class="btn ghost" id="colBack">Vissza a csoporthoz</button>`:""}<button class="btn" id="colAgain">Újra</button></div></div>`);
      if($("#colBack"))$("#colBack").onclick=()=>openColGroup(id);$("#colAgain").onclick=()=>colQuiz(id);}});
}
