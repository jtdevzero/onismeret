/* ============ TIMED MOCK EXAMS (B2 First, C1 Advanced style) ============ */
/* One sitting with a countdown: reading, use of English (multiple choice, word formation, key word transformation),
   listening with recorded audio (two plays) and writing. Objective parts are marked at once, the writing by the AI examiner. */
let MK=null;
const MK_NAME={reading:"Olvasás",mc:"Szókitöltés",wf:"Szóképzés",kwt:"Mondatátalakítás",listening:"Hallás",writing:"Írás"};
const mkHist=id=>(S.mock||(S.mock={}))[id]||[];
function renderMocks(){stopViews();withExtra("mock",renderMocksNow);}
function renderMocksNow(){
  subShell(["Gyakorlás",()=>go("gyakorlas")],"Próbavizsga","Teljes, időre mért próbavizsga",`<p class="muted">Egy ülésben, visszaszámlálóval, mint a valódi vizsgán: olvasás, nyelvhelyesség, hallás és írás. A részek között szabadon lépkedhetsz. Ha lejár az idő, a vizsga automatikusan beadódik. Az írást az AI vizsgáztató pontozza.</p>
    <div class="drills">${XT.mock.map((m,i)=>{const h=mkHist(m.id),last=h[h.length-1];return `<button class="drill" data-mk="${m.id}"><span class="dico c${i%4+1}">${I.star}</span><b>${esc(m.title)}</b><span class="small muted">${m.minutes} perc · ${m.parts.length} rész</span>${last?`<span class="small"><span class="pill ${last.pct>=60?"ok":"bad"}">Legutóbb ${last.pct}% · ${last.scale}</span></span>`:""}</button>`;}).join("")}</div>
    <p class="small muted">Tipp: csendes helyen, fülhallgatóval csináld, és ne nézd meg közben a szótárt.</p>`);
  view.querySelectorAll("[data-mk]").forEach(b=>b.onclick=()=>startMock(b.dataset.mk));
}
function startMock(id){
  const m=XT.mock.find(x=>x.id===id);if(!m)return;prefetch(`mock-${lang()}-${id}`);
  /* Answer options are shuffled once per sitting (the data keeps the right answer first). */
  const ord={};m.parts.forEach((p,pi)=>(p.questions||p.items||[]).forEach((q,qi)=>{if(q.o)ord[pi+"-"+qi]=shuffle(q.o.map((_,j)=>j));}));
  MK={m,pi:0,ans:{},ord,left:m.minutes*60,end:Date.now()+m.minutes*60000,plays:0,text:"",timer:null,done:false,quit:0};
  MK.timer=setInterval(()=>{if(!MK)return;MK.left=Math.max(0,Math.round((MK.end-Date.now())/1000));const c=$("#mkClock");if(c){c.textContent=mkTime(MK.left);c.classList.toggle("bad",MK.left<300);}if(!MK.left)submitMock(true);},1000);
  drawMock();
}
const mkTime=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
function drawMock(){
  const m=MK.m,p=m.parts[MK.pi],pi=MK.pi;
  const tabs=`<div class="seg" style="flex-wrap:wrap" role="tablist">${m.parts.map((x,i)=>`<button role="tab" data-mp="${i}" aria-pressed="${i===pi}">${i+1}. ${MK_NAME[x.type]}</button>`).join("")}</div>`;
  const opt=(q,k)=>{const key=pi+"-"+k,a=MK.ans[key];return `<div class="card stack" style="gap:.5rem"><span class="label">${k+1}.</span><b ${LA()}>${q.q.includes("___")?blankify(q.q):esc(q.q)}</b><div class="opts">${MK.ord[key].map(j=>`<button class="opt" data-mq="${key}" data-j="${j}" aria-pressed="${a===j}" style="${a===j?"outline:3px solid var(--cobalt)":""}" ${LA()}>${esc(q.o[j])}</button>`).join("")}</div></div>`;};
  const typed=(q,k,ph)=>{const key=pi+"-"+k,mt=q.q.match(/^(.*)\(([A-Z]+)\)\s*$/);return `<div class="card stack" style="gap:.5rem"><span class="label">${k+1}.</span><div ${LA()}>${mt?blankify(mt[1].trim()):esc(q.q)}${mt?` <span class="pill now">${mt[2]}</span>`:""}</div><input data-mt="${key}" value="${esc(MK.ans[key]||"")}" autocomplete="off" autocapitalize="off" spellcheck="false" ${LA()} placeholder="${ph}" aria-label="${k+1}. válasz"></div>`;};
  let body="";
  if(p.type==="reading")body=`<article class="card stack" ${LA()}><h3>${esc(p.name)}</h3>${p.text.split(/\n\s*\n/).map(x=>`<p>${esc(x)}</p>`).join("")}</article>${p.questions.map(opt).join("")}`;
  else if(p.type==="mc")body=`<p class="small muted">Válaszd ki a mondatba illő szót.</p>${p.items.map(opt).join("")}`;
  else if(p.type==="wf")body=`<p class="small muted">Képezd a nagybetűs szóból a mondatba illő alakot.</p>${p.items.map((q,k)=>typed(q,k,"A szó helyes alakja")).join("")}`;
  else if(p.type==="kwt")body=`<p class="small muted">Írd át a mondatot a megadott szóval úgy, hogy a jelentése ne változzon. Az egész mondatot írd le.</p>${p.items.map((q,k)=>typed(q,k,"Az átírt mondat")).join("")}`;
  else if(p.type==="listening")body=`<div class="card stack"><h3>${esc(p.name)}</h3><p class="small muted">A felvételt kétszer hallgathatod meg, mint a vizsgán. Előbb olvasd el a kérdéseket.</p><div class="row"><button class="btn lemon" id="mkPlay" ${MK.plays>=2||MK.playing?"disabled":""}>${MK.playing?"Lejátszás…":MK.plays>=2?"Kétszer meghallgattad":MK.plays?"Második meghallgatás":"Lejátszás"}</button><span class="small muted">${MK.plays}/2</span></div></div>${p.questions.map(opt).join("")}`;
  else if(p.type==="writing")body=`<div class="card stack"><span class="label">${esc(p.etype)}</span><p ${LA()}>${esc(p.task)}</p></div><textarea id="mkText" style="min-height:280px" ${LA()} placeholder="${LG().write}" aria-label="A szöveged angolul">${esc(MK.text)}</textarea><span class="small muted tnum" id="mkWc"></span>`;
  view.innerHTML=`<div class="player"><div class="row" style="justify-content:space-between"><button class="btn ghost" id="mkQuit">${MK.quit?"Biztosan kilépsz? Kattints újra":"× Kilépés"}</button><span class="pill now tnum" id="mkClock" aria-live="off" style="font-size:1rem">${mkTime(MK.left)}</span></div>
    <div><span class="label">${esc(m.title)}</span><h2>${pi+1}. ${esc(p.title)}</h2></div>${tabs}${body}
    <div class="row" style="justify-content:space-between">${pi?`<button class="btn ghost" id="mkPrev">← Előző rész</button>`:"<span></span>"}${pi<m.parts.length-1?`<button class="btn" id="mkNext">Következő rész →</button>`:`<button class="btn lemon" id="mkSubmit">Beadás</button>`}</div>
    <p class="small muted">${mkAnswered()} / ${mkTotal()} feladat megválaszolva.</p></div>`;
  $("#mkQuit").onclick=()=>{if(MK.quit){stopViews();renderMocks();}else{MK.quit=1;drawMock();}};
  view.querySelectorAll("[data-mp]").forEach(b=>b.onclick=()=>{MK.pi=+b.dataset.mp;MK.quit=0;drawMock();window.scrollTo(0,0);});
  view.querySelectorAll("[data-mq]").forEach(b=>b.onclick=()=>{MK.ans[b.dataset.mq]=+b.dataset.j;const y=window.scrollY;drawMock();window.scrollTo(0,y);});
  view.querySelectorAll("[data-mt]").forEach(inp=>inp.oninput=()=>{MK.ans[inp.dataset.mt]=inp.value;});
  if($("#mkText")){const ta=$("#mkText"),wc=()=>{const n=ta.value.trim()?ta.value.trim().split(/\s+/).length:0;$("#mkWc").textContent=n+" szó (cél: "+(m.level==="C1"?"220–260":"140–190")+")";};ta.oninput=()=>{MK.text=ta.value;wc();};wc();}
  if($("#mkPlay"))$("#mkPlay").onclick=()=>mockPlay(p);
  if($("#mkPrev"))$("#mkPrev").onclick=()=>{MK.pi--;drawMock();window.scrollTo(0,0);};
  if($("#mkNext"))$("#mkNext").onclick=()=>{MK.pi++;drawMock();window.scrollTo(0,0);};
  if($("#mkSubmit"))$("#mkSubmit").onclick=()=>submitMock(false);
}
async function mockPlay(p){
  if(MK.playing||MK.plays>=2)return;MK.playing=true;MK.plays++;const mk=MK;drawMock();
  for(const l of p.lines){if(MK!==mk||!MK.playing)break;await say(l.it);await new Promise(r=>setTimeout(r,250));}
  if(MK===mk){MK.playing=false;if(MK.m.parts[MK.pi]===p){const y=window.scrollY;drawMock();window.scrollTo(0,y);}}
}
function mkTotal(){return MK.m.parts.reduce((n,p)=>n+(p.type==="writing"?1:(p.questions||p.items).length),0);}
function mkAnswered(){let n=0;MK.m.parts.forEach((p,pi)=>{if(p.type==="writing"){if(MK.text.trim())n++;return;}(p.questions||p.items).forEach((_,k)=>{const a=MK.ans[pi+"-"+k];if(a!==undefined&&a!=="")n++;});});return n;}
function mkMark(){
  const parts=[];
  MK.m.parts.forEach((p,pi)=>{if(p.type==="writing")return;const qs=p.questions||p.items;let ok=0;
    qs.forEach((q,k)=>{const a=MK.ans[pi+"-"+k];let good,given;
      if(q.o){good=a===q.a;given=a===undefined?"":q.o[a];}
      else if(p.type==="wf"){given=String(a||"").trim();good=!!given&&check(given,[q.a]).ok;}
      else{given=String(a||"").trim();good=!!given&&kwtOk(given,q);}
      if(good)ok++;else logMiss("mock:"+p.type,q.q,given,q.o?q.o[q.a]:q.a);
      q._r={good,given};});
    parts.push({pi,type:p.type,title:p.title,ok,n:qs.length,pct:Math.round(ok/qs.length*100)});});
  return parts;
}
/* Rough Cambridge English Scale: 60% is the pass mark of the exam's own level. */
/* IELTS Academic reading: the usual raw-score-to-band table, with our score scaled to 40 questions. */
function mkBand(pct){const r=Math.round(pct*0.4),T=[[39,9],[37,8.5],[35,8],[33,7.5],[30,7],[27,6.5],[23,6],[19,5.5],[15,5],[13,4.5],[10,4],[8,3.5],[6,3]];const b=(T.find(([n])=>r>=n)||[0,2.5])[1];return {s:b.toFixed(1),grade:"kb. IELTS "+b.toFixed(1)};}
function mkScale(level,pct){const base=level==="C1"?180:160,s=Math.round(base+(pct-60)),grade=level==="C1"?(s>=200?"C2 (A)":s>=180?"C1":s>=160?"B2":"B2 alatt"):(s>=180?"C1 (A)":s>=160?"B2":s>=140?"B1":"B1 alatt");return {s:Math.max(level==="C1"?140:120,Math.min(level==="C1"?210:190,s)),grade};}
async function submitMock(auto){
  if(!MK||MK.done)return;MK.done=true;clearInterval(MK.timer);MK.timer=null;MK.playing=false;try{player.pause();speechSynthesis.cancel();}catch(e){}
  const m=MK.m,parts=mkMark(),used=m.minutes*60-MK.left,mk=MK;
  const wp=m.parts.find(p=>p.type==="writing");let wres=null;
  view.innerHTML=`<div class="player"><span class="label">${esc(m.title)}</span><h1>${auto?"Lejárt az idő":"Beadva"}</h1><div id="mkRes"><div class="card row"><span class="thinking"><i></i><i></i><i></i></span><span class="muted">Javítás${wp&&MK.text.trim()?", az írást az AI vizsgáztató pontozza":""}…</span></div></div></div>`;
  if(wp&&MK.text.trim().split(/\s+/).length>=40){const sample=await getSample();
    if(sample){try{wres=await sample.json(`Tapasztalt ${m.level==="C1"?"Cambridge C1 Advanced":"Cambridge B2 First"} vizsgáztatóként értékeld egy magyar anyanyelvű vizsgázó írásbeli munkáját.
Feladattípus: ${wp.etype}
Feladat: ${wp.task}
A vizsgázó szövege:
"""${MK.text.trim()}"""

Pontozd a Cambridge írásbeli négy szempontja szerint, mindegyiket 0–5 skálán: Content, Communicative Achievement, Organisation, Language. Adj becsült eredményt is (pl. ${m.level} szint alatt / ${m.level} / magasabb).
Minden szemponthoz írj 1–2 mondatos, konkrét magyar indoklást. Sorold fel a legfontosabb nyelvi hibákat (legfeljebb 8). Végül írj egy mintaválaszt ugyanerre a feladatra a célszinten.
Csak egy JSON objektumot adj vissza:
{"scores":{"content":0,"communicative":0,"organisation":0,"language":0},"comments":{"content":"","communicative":"","organisation":"","language":""},"band":"becsült eredmény","summary":"2-3 mondatos összegzés magyarul","errors":[{"wrong":"","right":"","why":""}],"model":"mintaválasz angolul"}`,{modelTier:"default"});
      (Array.isArray(wres.errors)?wres.errors:[]).slice(0,8).forEach(e=>logMiss("mock:writing",e.wrong,e.wrong,e.right+" – "+(e.why||"")));}catch(e){wres={err:aiErr(e)};}}
    else wres={err:aiMissing()};}
  if(MK!==mk)return;
  if(wp){const w=wres&&wres.scores?Math.round(CRIT.reduce((a,[k])=>a+(Number(wres.scores[k])||0),0)/20*100):0;parts.push({type:"writing",title:wp.title,ok:null,n:null,pct:w,pending:!(wres&&wres.scores)});}
  const scored=parts.filter(p=>!p.pending),pct=scored.length?Math.round(scored.reduce((a,p)=>a+p.pct,0)/scored.length):0,sc=m.ielts?mkBand(pct):mkScale(m.level,pct);
  S.mock=S.mock||{};const h=S.mock[m.id]||(S.mock[m.id]=[]);h.push({at:Date.now(),pct,scale:sc.s,grade:sc.grade,parts:parts.map(p=>({t:p.type,pct:p.pct})),secs:used});if(h.length>10)h.splice(0,h.length-10);
  parts.forEach(p=>{if(p.pending)return;const k=p.type==="reading"?"read":p.type==="listening"?"listen":p.type==="writing"?"write":null;if(k)skillLog(k,m.level,p.pct,"mock");});
  incEv("exam");incEv("tests");addXP(30);save();if(pct>=60)confetti();
  const qrev=p=>{const pi=p.pi;const qs=m.parts[pi].questions||m.parts[pi].items;const bad=qs.filter(q=>q._r&&!q._r.good);
    return bad.length?`<details class="g"><summary>${esc(p.title)}: ${bad.length} hibás válasz</summary><div class="gb err-list">${bad.map(q=>`<div><span ${LA()}>${q.q.includes("___")?blankify(q.q.replace(/\(([A-Z]+)\)\s*$/,"($1)")):esc(q.q)}</span><div>${q._r.given?`<s ${LA()}>${esc(q._r.given)}</s> → `:"<span class='muted'>(nincs válasz)</span> → "}<ins ${LA()}>${esc(q.o?q.o[q.a]:q.a)}</ins></div>${q.why?`<div class="small muted">${esc(q.why)}</div>`:""}</div>`).join("")}</div></details>`:"";};
  $("#mkRes").innerHTML=`<div class="stack"><div class="card"><div class="stats" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="stat"><span class="label">Összesen</span><b class="tnum">${pct}%</b></div><div class="stat"><span class="label">${m.ielts?"Becsült sáv":"Becsült skála"}</span><b class="tnum">${sc.s}</b></div><div class="stat"><span class="label">Eredmény</span><b>${esc(sc.grade)}</b></div></div>
    <p class="small muted" style="margin-top:.6rem">Idő: ${mkTime(used)} · ${m.ielts?"Az IELTS-sáv becslés a szokásos olvasási átváltótábla alapján készül.":"A Cambridge-skála becslés: a vizsga saját szintjén kb. 60% a sikeres határ."}</p></div>
    <div class="card stack">${parts.map(p=>`<div><div class="row" style="justify-content:space-between"><b>${esc(p.title)}</b><span class="pill ${p.pending?"":p.pct>=60?"ok":"bad"}">${p.pending?"nincs pontozva":p.ok!=null?`${p.ok}/${p.n} · ${p.pct}%`:p.pct+"%"}</span></div><div class="meter"><i style="width:${p.pct}%"></i></div></div>`).join("")}</div>
    ${parts.filter(p=>p.ok!=null).map(qrev).join("")}
    ${wp?(wres&&wres.scores?`<h3>Írás: a vizsgáztató értékelése</h3>${essayHtml(wres)}`:`<div class="notice">${esc(wres&&wres.err?wres.err:"Az írásrész túl rövid volt az értékeléshez (legalább 40 szó kell).")}</div>`):""}
    <div class="row"><button class="btn ghost" id="mkBack">Próbavizsgák</button><button class="btn" data-go="gyakorlas">Kész</button></div></div>`;
  $("#mkBack").onclick=()=>{stopViews();renderMocks();};
}
