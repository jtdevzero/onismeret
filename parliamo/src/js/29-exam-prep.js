/* ============ EXAM PREP (B2 First / IELTS style) ============ */
function renderExam(){
  const X=XT.exam;if(!X){toast("A vizsgafeladatok nem töltődtek be.");return;}
  const st=k=>{const s=S.exam[k];return s&&s.n?`<span class="small"><span class="pill ${s.ok/s.n>=.75?"ok":""}">${Math.round(s.ok/s.n*100)}% · ${s.n} feladat</span></span>`:"";};
  const items=[X.mc&&["mc",X.mc.title,X.mc.desc,I.leckek],X.wf&&["wf",X.wf.title,X.wf.desc,I.nyelvtan],X.kwt&&["kwt",X.kwt.title,X.kwt.desc,I.gyakorlas],["read","Olvasott szöveg értése","AI-szöveg B2 vagy C1 szinten, öt feleletválasztós kérdéssel és magyarázattal.",I.kartyak],["write","Esszé és e-mail","B2 First és IELTS Task 2 feladatok. Az AI a hivatalos szempontok szerint pontoz, és mintaválaszt ad.",I.tanar]];
  view.innerHTML=`<div class="stack"><div class="row"><button class="btn ghost" id="xBack">← Gyakorlás</button></div>
  <div><span class="label">${EXN[lang()]}</span><h1>Vizsgafelkészítő</h1><p class="muted">A nyelvvizsgák jellegzetes feladattípusai. A nyelvhelyességi részek azonnal javítanak, az olvasás és az írás az AI-tanárral működik.</p></div>
  <div class="drills">${items.filter(Boolean).map(([k,t,d,ic],i)=>`<button class="drill" data-x="${k}"><span class="dico c${i%4+1}">${ic}</span><b>${esc(t)}</b><span class="small muted">${esc(d)}</span>${st(k)}</button>`).join("")}</div></div>`;
  $("#xBack").onclick=renderPractice;
  view.querySelectorAll("[data-x]").forEach(b=>b.onclick=()=>startExam(b.dataset.x));
}
const EXN={en:"B2 First · IELTS",it:"CILS · CELI · PLIDA",es:"DELE · SIELE"};
function examStat(k,ok){const s=S.exam[k]||{ok:0,n:0};s.n++;if(ok)s.ok++;S.exam[k]=s;incEv("drills");incEv("exam");}
function startExam(k){
  const X=XT.exam;
  if(k==="mc"){CDRILLS["exam-mc"]={title:X.mc.title,desc:X.mc.desc,items:X.mc.items};return startChoice("exam-mc");}
  if(k==="wf"||k==="kwt"){EX={k,queue:shuffle(X[k].items.slice()),pos:0,ok:0,n:0,done:false};return drawTyped();}
  if(k==="read"){EX={k,level:defLevel()==="C1"?"C1":"B2",data:null,ans:{}};return drawReading();}
  if(k==="write"){EX={k,ti:today()%X.essays.length,text:"",res:null};return drawEssay();}
}
function kwtOk(v,it){const u=deacc(norm(v));return u===deacc(norm(it.a))||(it.accept||[]).some(a=>{const x=deacc(norm(a));return u===x||u.startsWith(x);});}
function drawTyped(){
  const X=XT.exam,set=X[EX.k];if(EX.pos>=EX.queue.length){EX.queue=shuffle(EX.queue);EX.pos=0;}
  const it=EX.queue[EX.pos];EX.done=false;
  const m=it.q.match(/^(.*)\(([A-ZÁÉÍÓÖŐÚÜŰ]+)\)\s*$/);const sent=m?m[1].trim():it.q,key=m?m[2]:"";
  subShell(["Vizsgafelkészítő",renderExam],set.title,"",`<div class="card stack" style="padding:1.4rem 1.1rem"><span class="label">${EX.k==="wf"?"Képezd a megfelelő alakot a nagybetűs szóból":"Írd át a mondatot úgy, hogy a jelentése ne változzon. Használd a megadott szót."}</span>
    <div class="big-q" style="font-size:1.4rem" ${LA()}>${EX.k==="wf"?blankify(sent):esc(sent)}</div>${key?`<div><span class="pill now" style="font-size:.95rem">${esc(key)}</span></div>`:""}</div>
    <input id="xans" autocomplete="off" autocapitalize="off" spellcheck="false" ${LA()} placeholder="${EX.k==="wf"?"A szó helyes alakja":"Az átírt mondat"}" aria-label="Válasz">
    <div id="xfb"></div><button class="btn block" id="xgo">Ellenőrzés</button>`,`${EX.ok} / ${EX.n}`);
  const inp=$("#xans"),btn=$("#xgo");setTimeout(()=>inp.focus(),30);
  const act=()=>{if(EX.done){EX.pos++;return drawTyped();}const v=inp.value.trim();if(!v)return;
    const ok=EX.k==="wf"?check(v,[it.a]).ok:kwtOk(v,it);EX.done=true;EX.n++;inp.readOnly=true;examStat(EX.k,ok);
    if(ok){EX.ok++;addXP(2);fx("ok");}else{fx("bad");logMiss("exam:"+EX.k,it.q,v,it.a);save();}
    $("#xfb").innerHTML=fbHtml(ok,ok?"":it.a,`<span class="small" style="color:var(--ink)">${esc(it.why)}</span>`);$(".score").textContent=EX.ok+" / "+EX.n;
    say(EX.k==="wf"?sent.replace("___",it.a):it.a);btn.textContent="Következő";btn.focus();};
  btn.onclick=act;inp.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();act();}};
}
async function drawReading(){
  const back=["Vizsgafelkészítő",renderExam];
  if(!EX.data){
    subShell(back,"Olvasott szöveg értése","Szint és téma",`<span class="seg" id="xLvl">${["B2","C1"].map(l=>`<button data-v="${l}" aria-pressed="${EX.level===l}">${l}</button>`).join("")}</span>
      <div class="drills">${["Munka és karrier","Technológia","Környezet","Egészség","Oktatás","Kultúra és művészet"].map(t=>`<button class="drill" data-t="${t}"><b>${t}</b></button>`).join("")}</div><div id="xmsg"></div>`);
    $("#xLvl").querySelectorAll("button").forEach(b=>b.onclick=()=>{EX.level=b.dataset.v;drawReading();});
    view.querySelectorAll("[data-t]").forEach(b=>b.onclick=async()=>{const sample=await getSample();if(!sample){$("#xmsg").innerHTML=`<div class="notice">${aiMissing()}</div>`;return;}
      $("#xmsg").innerHTML=`<div class="card row"><span class="thinking"><i></i><i></i><i></i></span><span class="muted">Készül a szöveg…</span></div>`;
      const prompt=`Írj egy ${EX.level} szintű ${LG().adj} olvasásértési vizsgafeladatot (${EXN[lang()]} jelleggel) magyar tanulóknak. Téma: ${b.dataset.t}.
A szöveg 280–380 szavas, hiteles, magazin- vagy újságcikk stílusú angol szöveg legyen, címmel, 4–5 bekezdésben.
Utána 5 feleletválasztós kérdés angolul, mindegyikhez 4 válaszlehetőség, amelyek közül pontosan egy helyes; a rossz válaszok legyenek hihetőek (parafrázis, részigazság). A magyarázat magyarul legyen, és idézze a szöveg releváns részét.
Csak egy JSON objektumot adj vissza:
{"title":"cím","text":"a szöveg, bekezdések között \\n\\n","questions":[{"q":"kérdés","o":["A","B","C","D"],"a":0,"why":"magyar magyarázat"}]}`;
      try{const d=await sample.json(prompt,{modelTier:"default"});
        if(!d||typeof d.text!=="string"||!Array.isArray(d.questions))throw {code:"invalid_json"};
        d.questions=d.questions.filter(q=>q&&Array.isArray(q.o)&&q.o.length>1&&Number.isInteger(q.a)).map(q=>({q:String(q.q),o:q.o.map(String),a:Math.min(q.a,q.o.length-1),why:String(q.why||"")}));
        if(EX&&EX.k==="read"){EX.data=d;EX.ans={};drawReading();}}
      catch(e){if($("#xmsg"))$("#xmsg").innerHTML=`<div class="notice">${esc(aiErr(e))}</div>`;}});
    return;
  }
  const d=EX.data,all=d.questions.every((_,k)=>EX.ans[k]!==undefined),ok=d.questions.filter((q,k)=>EX.ans[k]===q.a).length;
  subShell(back,`Olvasott szöveg értése · ${EX.level}`,"",`<article class="card stack" ${LA()}><h2>${esc(d.title||"")}</h2>${d.text.split(/\n\s*\n/).map(p=>`<p>${esc(p)}</p>`).join("")}</article>
    ${d.questions.map((q,k)=>{const a=EX.ans[k];return `<div class="card stack" style="gap:.6rem"><span class="label">${k+1}. kérdés</span><b ${LA()}>${esc(q.q)}</b><div class="opts">${q.o.map((o,j)=>`<button class="opt ${a!==undefined?(j===q.a?"right":j===a?"wrong":""):""}" data-q="${k}" data-j="${j}" ${a!==undefined?"disabled":""} ${LA()}>${esc(o)}</button>`).join("")}</div>${a!==undefined?`<p class="small">${esc(q.why)}</p>`:""}</div>`;}).join("")}
    ${all?`<div class="card"><h3>Eredmény: ${ok} / ${d.questions.length}</h3><p class="small muted">${ok>=4?"Ez vizsgaszinten is jó eredmény.":"Olvasd újra a magyarázatokat: a vizsgán a rossz válaszok gyakran a szöveg szavait ismétlik, de mást állítanak."}</p><div class="row"><button class="btn" id="xNew">Új szöveg</button></div></div>`:""}`,`${ok} / ${d.questions.length}`);
  view.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{const k=+b.dataset.q,j=+b.dataset.j,q=d.questions[k];EX.ans[k]=j;const good=j===q.a;examStat("read",good);if(d.questions.every((_,x)=>EX.ans[x]!==undefined))skillLog("read",EX.level,d.questions.filter((q,x)=>EX.ans[x]===q.a).length/d.questions.length*100,"exam");
    if(good){addXP(3);fx("ok");}else{fx("bad");logMiss("exam:read",q.q,q.o[j],q.o[q.a]);save();}const y=window.scrollY;drawReading();window.scrollTo(0,y);});
  if($("#xNew"))$("#xNew").onclick=()=>{EX.data=null;drawReading();};
}
const CRIT=[["content","Tartalom (Content)"],["communicative","Kommunikatív hatás (Communicative Achievement)"],["organisation","Szerkezet (Organisation)"],["language","Nyelvhasználat (Language)"]];
function drawEssay(){
  const X=XT.exam,t=X.essays[EX.ti];
  subShell(["Vizsgafelkészítő",renderExam],"Esszé és e-mail",esc(t.type),`<div class="card stack"><span class="label">Feladat</span><p ${LA()}>${esc(t.task)}</p><div><button class="btn ghost" id="xNext">Másik feladat</button></div></div>
    <textarea id="xtext" style="min-height:260px" ${LA()} placeholder="${LG().write}" aria-label="A válaszod ${LG().adv}">${esc(EX.text)}</textarea>
    <div class="row" style="justify-content:space-between"><span class="small muted tnum" id="xwc">0 szó</span><button class="btn" id="xsend">Értékelést kérek</button></div><div id="xres">${EX.res?essayHtml(EX.res):""}</div>`);
  const ta=$("#xtext"),wc=()=>{const n=ta.value.trim()?ta.value.trim().split(/\s+/).length:0;$("#xwc").textContent=n+" szó";};ta.oninput=()=>{EX.text=ta.value;wc();};wc();
  $("#xNext").onclick=()=>{EX.ti=(EX.ti+1)%X.essays.length;EX.res=null;drawEssay();};
  $("#xsend").onclick=async()=>{const text=ta.value.trim();if(text.split(/\s+/).length<60){toast("Írj legalább 60 szót, hogy értékelhető legyen.");return;}
    const sample=await getSample();if(!sample){$("#xres").innerHTML=`<div class="notice">${aiMissing()}</div>`;return;}
    $("#xsend").disabled=true;$("#xres").innerHTML=`<div class="card row"><span class="thinking"><i></i><i></i><i></i></span><span class="muted">A vizsgáztató értékel…</span></div>`;
    const ielts=/IELTS/.test(t.type);
    const exn=lang()==="en"?(ielts?"IELTS":"Cambridge B2 First"):EXN[lang()];
    const prompt=`Tapasztalt ${exn} vizsgáztatóként értékeld egy magyar anyanyelvű vizsgázó írásbeli munkáját.
Feladattípus: ${t.type}
Feladat: ${t.task}
A vizsgázó szövege:
"""${text}"""

Pontozd ${lang()==="en"?"a Cambridge B2 First írásbeli":"az európai nyelvvizsgák (KER) írásbeli értékelésének"} négy szempontja szerint, mindegyiket 0–5 skálán: Content, Communicative Achievement, Organisation, Language. ${ielts?"Adj becsült IELTS Writing band értéket is (pl. 6.0).":"Adj becsült eredményt is (pl. B2 szint alatt / B2 / C1 szint)."}
Minden szemponthoz írj 1–2 mondatos, konkrét magyar indoklást. Sorold fel a legfontosabb nyelvi hibákat (legfeljebb 8). Végül írj egy mintaválaszt ugyanerre a feladatra a célszinten, a feladat szóhatárán belül.
Csak egy JSON objektumot adj vissza:
{"scores":{"content":0,"communicative":0,"organisation":0,"language":0},"comments":{"content":"","communicative":"","organisation":"","language":""},"band":"becsült eredmény","summary":"2-3 mondatos összegzés magyarul","errors":[{"wrong":"","right":"","why":""}],"model":"mintaválasz ${LG().adv}"}`;
    try{const r=await sample.json(prompt,{modelTier:"default"});EX.res=r;addXP(10);examStat("write",true);skillLog("write","B2",CRIT.reduce((a,[k])=>a+(Number((r.scores||{})[k])||0),0)/20*100,"essay");
      (Array.isArray(r.errors)?r.errors:[]).slice(0,8).forEach(e=>logMiss("exam:write",e.wrong,e.wrong,e.right+" – "+(e.why||"")));save();
      if(EX&&EX.k==="write"&&$("#xres"))$("#xres").innerHTML=essayHtml(r);}
    catch(e){if($("#xres"))$("#xres").innerHTML=`<div class="notice">${esc(aiErr(e))}</div>`;}
    if($("#xsend"))$("#xsend").disabled=false;};
}
function essayHtml(r){
  const sc=r.scores||{},cm=r.comments||{},tot=CRIT.reduce((a,[k])=>a+(Number(sc[k])||0),0),errs=Array.isArray(r.errors)?r.errors:[];
  return `<div class="stack"><div class="card"><div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="stat"><span class="label">Összesen</span><b class="tnum">${tot} / 20</b></div><div class="stat"><span class="label">Becsült eredmény</span><b>${esc(r.band||"–")}</b></div></div>${r.summary?`<p style="margin-top:.8rem">${esc(r.summary)}</p>`:""}</div>
  <div class="card stack">${CRIT.map(([k,l])=>`<div><div class="row" style="justify-content:space-between"><b>${l}</b><span class="pill ${(+sc[k]||0)>=4?"ok":(+sc[k]||0)<=2?"bad":""}">${esc(sc[k]??"–")} / 5</span></div><div class="meter"><i style="width:${(+sc[k]||0)*20}%"></i></div><p class="small muted">${esc(cm[k]||"")}</p></div>`).join("")}</div>
  ${errs.length?`<div class="card stack"><h3>Hibák (${errs.length})</h3><div class="err-list">${errs.map(e=>`<div><s>${esc(e.wrong)}</s> → <ins>${esc(e.right)}</ins><div class="small muted">${esc(e.why)}</div></div>`).join("")}</div></div>`:""}
  ${r.model?`<div class="card stack"><h3>Mintaválasz</h3><p class="prewrap" ${LA()}>${esc(r.model)}</p></div>`:""}</div>`;
}

