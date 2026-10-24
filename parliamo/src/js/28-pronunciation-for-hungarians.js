/* ============ PRONUNCIATION FOR HUNGARIANS ============ */
function renderPron(){
  view.innerHTML=`<div class="stack"><div class="row"><button class="btn ghost" id="prBack">← Gyakorlás</button></div>
  <div><span class="label">Kiejtés magyaroknak</span><h1>Hangpárok</h1><p class="muted">A magyar anyanyelvűek tipikus ${LG().adj} kiejtési hibái, egyenként. Először hallás alapján különböztesd meg a párokat, aztán mondd ki őket${canSpeak()?", és az app megmondja, melyiket hallotta":""}.</p></div>
  <div class="drills">${XT.pron.map((st,i)=>{const s=S.drills["pr-"+st.id];return `<button class="drill" data-s="${st.id}"><span class="dico c${i%4+1}">${I.mic}</span><b>${esc(st.title)}</b><span class="small muted">${esc(st.pairs.slice(0,3).map(p=>p.join(" – ")).join(", "))}</span>${s&&s.n?`<span class="small"><span class="pill ${s.ok/s.n>=.8?"ok":""}">${Math.round(s.ok/s.n*100)}% · ${s.n} válasz</span></span>`:""}</button>`;}).join("")}</div></div>`;
  $("#prBack").onclick=renderPractice;
  view.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>openPron(b.dataset.s));
}
function openPron(id){const st=XT.pron.find(x=>x.id===id);prefetch("pron-"+lang());PR={st,mode:st.mode==="sent"||st.id==="stress"?"sent":"hear",ok:0,n:0,q:null,res:null,si:0};nextPron();}
function nextPron(){
  const {st}=PR;PR.res=null;
  if(PR.mode==="hear"){const pr=rnd(st.pairs),t=Math.random()<.5?0:1;PR.q={pair:pr,t};}
  else if(PR.mode==="speak"){const pr=rnd(st.pairs),t=Math.random()<.5?0:1;PR.q={pair:pr,t};}
  else{PR.q={sent:st.sentences[PR.si%st.sentences.length]};PR.si++;}
  drawPron();
  if(PR.mode==="hear")setTimeout(()=>PR&&say(PR.q.pair[PR.q.t]),250);
}
function drawPron(){
  const {st,q,res}=PR;const sp=canSpeak();
  const modes=`<span class="seg" id="prMode">${[["hear","Hallás"],["speak","Kimondás"],["sent","Mondatok"]].filter(m=>!(st.mode==="sent"||st.id==="stress")||m[0]==="sent").map(([k,l])=>`<button data-v="${k}" aria-pressed="${PR.mode===k}">${l}</button>`).join("")}</span>`;
  let body="";
  if(PR.mode==="hear"){
    body=`<div class="card stack" style="align-items:center;text-align:center;padding:1.6rem 1rem"><span class="label">Melyiket hallod?</span><button class="icon-btn" id="prPlay" style="width:64px;height:64px" aria-label="Lejátszás újra">${I.spk}</button></div>
    <div class="opts" style="grid-template-columns:1fr 1fr">${q.pair.map((w,j)=>`<button class="opt ${res?(j===q.t?"right":j===res.pick?"wrong":""):""}" data-j="${j}" ${res?"disabled":""} style="justify-content:center;font-size:1.3rem" ${LA()}>${esc(w)}</button>`).join("")}</div>
    ${res?`<div class="feedback ${res.ok?"ok":"bad"}" role="status"><b>${res.ok?rnd(LG().ok):"Nem egészen."}</b><span class="small" style="color:var(--ink)">Hallgasd meg egymás után: ${q.pair.map(w=>`<button class="btn ghost" data-say="${esc(w)}" style="padding:.15rem .6rem" ${LA()}>${esc(w)}</button>`).join(" ")}</span></div><button class="btn block" id="prNext">Következő</button>`:""}`;
  }else if(PR.mode==="speak"){
    const w=q.pair[q.t],o=q.pair[1-q.t];
    body=`<div class="card stack" style="align-items:center;text-align:center;padding:1.6rem 1rem"><span class="label">Mondd ki</span><div class="big-q" ${LA()}>${esc(w)}</div><span class="small muted">és ne így: <span ${LA()}>${esc(o)}</span></span><div class="row" style="justify-content:center">${spkBtn(w)}${sp?`<button class="btn lemon" id="prMic">${I.mic.replace("<svg",'<svg style="width:18px;height:18px"')} Mondom</button>`:""}</div></div>
    ${!sp?`<p class="small muted">A beszédfelismerés ebben a böngészőben nem érhető el (Chrome-ban és Safariban működik). Mondd ki hangosan utána, és értékeld magad.</p><div class="row"><button class="btn soft" data-self="1">Ment</button><button class="btn ghost" data-self="0">Még gyakorlom</button></div>`:""}
    ${res?`<div class="feedback ${res.ok?"ok":"bad"}" role="status"><b>${res.ok?rnd(LG().ok):res.partner?"Ezt hallottam: "+esc(o):"Nem egészen."}</b>${res.heard?`<span class="small" style="color:var(--ink)">A felismert szöveg: „${esc(res.heard)}”</span>`:""}${!res.ok?`<span class="small" style="color:var(--ink)">${esc(st.tip)}</span>`:""}</div><button class="btn block" id="prNext">Következő</button>`:""}`;
  }else{
    body=`<div class="card stack" style="padding:1.4rem 1.1rem"><span class="label">Mondd ki a mondatot</span><div class="big-q" style="font-size:1.5rem" ${LA()}>${res&&res.words?res.words.map(x=>`<span style="color:var(--${x.ok?"ok":"bad"});${x.ok?"":"text-decoration:underline wavy"}">${esc(x.w)}</span>`).join(" "):esc(q.sent)}</div>
      <div class="row">${spkBtn(q.sent)}<button class="icon-btn" data-say="${esc(q.sent)}" data-slow aria-label="Lassan">${I.slow}</button>${sp?`<button class="btn lemon" id="prMic">${I.mic.replace("<svg",'<svg style="width:18px;height:18px"')} Mondom</button>`:""}</div></div>
    ${!sp?`<p class="small muted">Hallgasd meg, aztán mondd utána hangosan (shadowing). A beszédfelismerés Chrome-ban és Safariban szavanként is visszajelez.</p><div class="row"><button class="btn soft" data-self="1">Ment</button><button class="btn ghost" data-self="0">Még gyakorlom</button></div>`:""}
    ${res?`<div class="feedback ${res.ok?"ok":"bad"}" role="status"><b>${res.ok?rnd(LG().ok):"A pirossal jelölt szavakat nem értettem."}</b>${res.heard?`<span class="small" style="color:var(--ink)">A felismert szöveg: „${esc(res.heard)}”</span>`:""}</div><button class="btn block" id="prNext">Következő mondat</button>`:""}`;
  }
  subShell(["Hangpárok",renderPron],"Kiejtés magyaroknak",esc(st.title),`<details class="g" ${PR.n?"":"open"}><summary>Hogyan képezd?</summary><div class="gb"><p>${esc(st.tip)}</p>${st.id==="stress"?`<div class="tbl-wrap"><table><tr><th>Főnév</th><th>Ige</th></tr>${st.pairs.map(p=>`<tr><td ${LA()}>${esc(p[0])}</td><td ${LA()}>${esc(p[1])}</td></tr>`).join("")}</table></div>`:st.mode==="sent"?`<p class="small" ${LA()}>${st.pairs.map(p=>esc(p.join(" – "))).join(" · ")}</p><p class="small muted">Ezeket a párokat a felvett hang sem mindig választja szét, ezért itt mondatokkal gyakorolsz.</p>`:""}</div></details>${modes}${body}`,`${PR.ok} / ${PR.n}`);
  $("#prMode").querySelectorAll("button").forEach(b=>b.onclick=()=>{PR.mode=b.dataset.v;nextPron();});
  if($("#prPlay"))$("#prPlay").onclick=()=>say(q.pair[q.t]);
  if($("#prNext"))$("#prNext").onclick=nextPron;
  view.querySelectorAll("[data-j]").forEach(b=>b.onclick=()=>{const j=+b.dataset.j;pronResult({pick:j,ok:j===q.t},q.pair[j],q.pair[q.t]);});
  view.querySelectorAll("[data-self]").forEach(b=>b.onclick=()=>pronResult({ok:b.dataset.self==="1",self:true},"",""));
  if($("#prMic"))$("#prMic").onclick=async()=>{const m=$("#prMic");m.disabled=true;m.textContent="Hallgatlak…";
    try{const alts=await listen();
      if(PR.mode==="speak"){const w=q.pair[q.t],o=q.pair[1-q.t],has=x=>alts.some(a=>deacc(norm(a)).split(" ").includes(deacc(norm(x))));
        const ok=has(w)&&!(!deacc(norm(alts[0])).split(" ").includes(deacc(norm(w)))&&has(o)),partner=!ok&&has(o);pronResult({ok,partner,heard:alts[0]},alts[0],w);}
      else{const d=speechDetail(q.sent,alts);pronResult({ok:d.score>=0.85,words:d.words,heard:d.heard},d.heard,q.sent);}}
    catch(e){toast(micMsg(e));drawPron();}};
}
function pronResult(r,given,correct){
  if(PR.res)return;PR.res=r;PR.n++;if(r.ok){PR.ok++;addXP(1);fx("ok");}else{fx("bad");if(!r.self)logMiss("pron:"+PR.st.id,correct,given,correct);save();}
  drillStat("pr-"+PR.st.id,r.ok);incEv("pron");drawPron();const n=$("#prNext");if(n)n.focus();
}

