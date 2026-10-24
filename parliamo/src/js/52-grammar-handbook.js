/* ============ GRAMMAR HANDBOOK (English) ============ */
/* Topic pages with a table, rules, typical Hungarian mistakes and a five-question drill. The recommendations come from the
   mistake log (handbook drills, the targeted drills, exam parts) and from weak drill scores. */
const GRAM_FROM={"drill:tenses":["pres","past","perf"],"drill:articles":["articles"],"drill:preps":["preps"],"drill:phrasal":["phrasal"],"drill:cond":["cond","cond3"],"exam:kwt":["passive","reported","wish"],"exam:wf":["compare"]};
const gramOf=()=>S.gram||(S.gram={});
function gramWeak(){
  const sc={},t=today();
  (S.mlog||[]).filter(m=>m.l==="en"&&m.d>t-30).forEach(m=>{const ids=m.k.startsWith("grammar:")?[m.k.slice(8)]:GRAM_FROM[m.k]||[];ids.forEach(id=>sc[id]=(sc[id]||0)+1);});
  Object.entries(gramOf()).forEach(([id,g])=>{if(g.n&&g.ok/g.n<0.8)sc[id]=(sc[id]||0)+2;});
  return XT.gram.filter(x=>sc[x.id]).sort((a,b)=>sc[b.id]-sc[a.id]).slice(0,4);
}
function gramPill(id){const g=gramOf()[id];if(!g||!g.n)return "";const p=Math.round(g.ok/g.n*100);return `<span class="small"><span class="pill ${p>=80?"ok":"bad"}">${p===100?"✓ ":""}${p}%</span></span>`;}
function renderHandbook(){
  const weak=gramWeak(),done=XT.gram.filter(x=>{const g=gramOf()[x.id];return g&&g.n&&g.ok/g.n>=0.8;}).length;
  const card=(x,i)=>`<button class="drill" data-gt="${x.id}"><span class="dico c${i%4+1}">${I.nyelvtan}</span><b>${esc(x.title)}</b><span class="small muted">${x.level} · ${x.drill.length} kérdéses gyakorló</span>${gramPill(x.id)}</button>`;
  const pre=`<div class="card"><div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="stat"><span class="label">Témák</span><b class="tnum">${XT.gram.length}</b></div><div class="stat"><span class="label">Megy (80%+)</span><b class="tnum">${done}</b></div></div></div>
  ${weak.length?`<div class="sec-head"><h2>Ajánlott a hibáid alapján</h2></div><div class="drills">${weak.map(card).join("")}</div>`:""}
  ${["A1","A2","B1","B2","C1"].map(lv=>{const xs=XT.gram.filter(x=>x.level.slice(0,2)===lv);return xs.length?`<div class="sec-head"><h2>${lv}</h2><span class="small muted">${xs.length} téma</span></div><div class="drills">${xs.map(card).join("")}</div>`:"";}).join("")}
  <div class="sec-head"><h2>A leckék jegyzetei</h2></div>`;
  grammarPage(LESSONS.map(L=>[`${esc(L.t)} <span class="small muted" style="font-family:var(--body)">· ${esc(L.hu)} · ${L.level}</span>`,L.notes.map(n=>`<p>${n}</p>`).join("")]),"Az angol nyelvtan témánként: táblázat, szabályok, a magyarok tipikus hibái és egy rövid gyakorló.",pre);
  view.querySelectorAll("[data-gt]").forEach(b=>b.onclick=()=>openTopic(b.dataset.gt));
}
function openTopic(id){
  const x=XT.gram.find(t=>t.id===id);if(!x)return;const g=gramOf()[id];
  subShell(["Nyelvtan",()=>go("nyelvtan")],`Nyelvtan · ${x.level}`,esc(x.title),`<div class="card stack"><p>${esc(x.intro)}</p></div>
    ${x.table?tbl(x.table.head.map(esc),x.table.rows.map(r=>r.map(esc))):""}
    <div class="card stack"><h3>Szabályok és példák</h3><ul class="stack" style="gap:.4rem;padding-left:1.1rem">${x.points.map(p=>`<li>${esc(p)}</li>`).join("")}</ul></div>
    ${x.mistakes.length?`<div class="card stack"><h3>Tipikus magyar hibák</h3><div class="err-list">${x.mistakes.map(m=>{const [w,r]=m.split(" → ");return r?`<div><s ${LA()}>${esc(w)}</s> → <ins ${LA()}>${esc(r)}</ins></div>`:`<div>${esc(m)}</div>`;}).join("")}</div></div>`:""}
    <button class="btn block lemon" id="gtGo">Gyakorlás (${x.drill.length} kérdés)${g&&g.n?` · legutóbb ${g.ok}/${g.n}`:""}</button>`);
  $("#gtGo").onclick=()=>{QZ_BACK=()=>openTopic(id);
    runQuiz({kind:"grammar:"+id,label:"Nyelvtan gyakorló",title:x.title,items:shuffle(x.drill.map(d=>({q:d.q,a:d.a,o:d.o,why:d.why}))),backLabel:"Téma",
      onDone:(ok,n)=>{gramOf()[id]={ok,n,d:today()};drillStat("grammar",ok===n);addXP(ok*2);save();
        subShell(["Nyelvtan",()=>go("nyelvtan")],"Nyelvtan gyakorló",esc(x.title),`<div class="card stack" style="text-align:center"><h1 class="tnum">${ok} / ${n}</h1><p class="muted">${ok===n?"Hibátlan! Ez a téma megy.":ok/n>=0.8?"Szép eredmény. Egy kis ismétlés, és hibátlan lesz.":"Olvasd át újra a szabályokat és a tipikus hibákat, aztán próbáld újra."}</p><div class="row" style="justify-content:center"><button class="btn ghost" id="gtBack">Vissza a témához</button><button class="btn" id="gtAgain">Újra</button></div></div>`);
        $("#gtBack").onclick=()=>openTopic(id);$("#gtAgain").onclick=()=>{openTopic(id);$("#gtGo").click();};}});};
}
