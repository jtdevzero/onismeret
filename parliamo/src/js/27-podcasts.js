/* ============ PODCASTS ============ */
function renderPods(){
  const list=XT.pods;
  view.innerHTML=`<div class="stack"><div class="row"><button class="btn ghost" id="pBack">← Gyakorlás</button></div>
  <div><span class="label">Hallás utáni értés</span><h1>Podcastok</h1><p class="muted">Hosszabb beszélgetések természetes tempóban. Először szöveg nélkül hallgasd meg, aztán válaszolj a kérdésekre. Ha elakadsz, kapcsold be a szöveget vagy a fordítást.</p></div>
  <div class="lgrid">${list.map(p=>{const d=S.pods[p.id];return `<button class="lcard" data-p="${p.id}"><div class="pic"><img src="img/pod-${p.id}.webp" alt="" loading="lazy" decoding="async" onerror="this.remove()"><span class="badge">${d?`<span class="pill ok">${d.ok}/${d.n}</span>`:`<span class="pill">${p.level}</span>`}</span></div>
    <div class="body"><b ${LA()}>${esc(p.title)}</b><span class="small muted">${esc(p.hu)} · ${p.level} · ${p.lines.length} mondat</span><span class="small">${esc(p.desc)}</span></div></button>`;}).join("")}</div></div>`;
  $("#pBack").onclick=renderPractice;
  view.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>openPod(b.dataset.p));
}
function openPod(id){const p=XT.pods.find(x=>x.id===id);prefetch("pod-"+id);PD={p,i:-1,playing:false,showT:false,showHu:false,rate:1,stage:"listen",ans:{},ok:0};drawPod();}
function drawPod(){
  const {p}=PD;const back=["Podcastok",renderPods];
  if(PD.stage==="gap")return drawGap();if(PD.stage==="dict")return drawPodDict();
  if(PD.stage==="listen"){
    subShell(back,`Podcast · ${p.level}`,esc(p.title),`
    <div class="card stack" style="gap:.6rem"><p class="muted">${esc(p.desc)}</p>
      <div class="row"><button class="btn lemon" id="pdPlay">${PD.playing?"Szünet":PD.i>=0?"Folytatás":"Lejátszás"}</button>
      <span class="seg" id="pdRate">${[[0.8,"0,8×"],[1,"1×"],[1.25,"1,25×"]].map(([v,l])=>`<button data-v="${v}" aria-pressed="${PD.rate===v}">${l}</button>`).join("")}</span></div>
      <div class="row"><button class="btn ghost" id="pdT" aria-pressed="${PD.showT}">${PD.showT?"Szöveg elrejtése":"Szöveg mutatása"}</button><button class="btn ghost" id="pdH" aria-pressed="${PD.showHu}">${PD.showHu?"Fordítás elrejtése":"Fordítás"}</button></div></div>
    <div class="chat" id="pdLines">${p.lines.map((l,k)=>{const who=p.cast[l.s]||{name:l.s};const right=l.s===Object.keys(p.cast)[1];
      return `<button class="msg ${right?"me":"ai"} ${k===PD.i?"cur":""}" data-k="${k}" style="text-align:left;${right?"":"border:1px solid var(--line)"};${k===PD.i?"outline:3px solid var(--lemon);":""}"><span class="small" style="font-weight:700;opacity:.8">${esc(who.name)}</span><span ${LA()} ${PD.showT?"":'style="filter:blur(5px)" aria-hidden="true"'}>${PD.showT?wrapW(l.it):esc(l.it)}</span>${PD.showHu?`<span class="tr" style="${right?"color:inherit;opacity:.8":""}">${esc(l.hu)}</span>`:""}</button>`;}).join("")}</div>
    <div class="row"><button class="btn soft" id="pdGap">Lyukas szöveg</button><button class="btn soft" id="pdDict">Diktálás</button></div>
    <button class="btn block" id="pdQ">Kérdések (${p.questions.length}) →</button>`);
    $("#pdGap").onclick=()=>{PD.playing=false;try{player.pause();}catch(e){}PD.stage="gap";PD.gapChk=false;drawGap();};
    $("#pdDict").onclick=()=>{PD.playing=false;try{player.pause();}catch(e){}PD.stage="dict";PD.di=0;PD.dok=0;PD.dres=null;drawPodDict();};
    if(PD.showT)bindWords(p.lines.map(x=>x.it),p.vocab);
    $("#pdPlay").onclick=()=>{if(PD.playing){PD.playing=false;try{player.pause();speechSynthesis.cancel();}catch(e){}if(sayDone)sayDone();drawPod();}else playPod(Math.max(0,PD.i>=p.lines.length-1?0:PD.i));};
    $("#pdRate").querySelectorAll("button").forEach(b=>b.onclick=()=>{PD.rate=+b.dataset.v;try{player.playbackRate=PD.rate;}catch(e){}drawPod();});
    $("#pdT").onclick=()=>{PD.showT=!PD.showT;drawPod();};$("#pdH").onclick=()=>{PD.showHu=!PD.showHu;drawPod();};
    view.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{PD.playing=false;PD.i=+b.dataset.k;hlPod();say(p.lines[PD.i].it,false,PD.rate);});
    $("#pdQ").onclick=()=>{PD.playing=false;try{player.pause();}catch(e){}PD.stage="quiz";drawPod();};
    return;
  }
  if(PD.stage==="quiz"){
    const all=p.questions.every((_,k)=>PD.ans[k]!==undefined);
    subShell(back,`Podcast · ${p.level}`,esc(p.title),`
    ${p.questions.map((q,k)=>{const a=PD.ans[k];return `<div class="card stack" style="gap:.6rem"><span class="label">${k+1}. kérdés</span><b>${esc(q.q)}</b><div class="opts">${q.o.map((o,j)=>`<button class="opt ${a!==undefined?(j===q.a?"right":j===a?"wrong":""):""}" data-q="${k}" data-j="${j}" ${a!==undefined?"disabled":""}>${esc(o)}</button>`).join("")}</div></div>`;}).join("")}
    <div class="row"><button class="btn ghost" id="pdBackL">← Újrahallgatom</button><button class="btn block ${all?"lemon":""}" id="pdFin" ${all?"":"disabled"} style="flex:1">Eredmény és szószedet</button></div>`,`${PD.ok} / ${p.questions.length}`);
    view.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{const k=+b.dataset.q,j=+b.dataset.j;PD.ans[k]=j;const q=p.questions[k];if(j===q.a){PD.ok++;fx("ok");}else{fx("bad");logMiss("podcast",q.q,q.o[j],q.o[q.a]);}drawPod();});
    $("#pdBackL").onclick=()=>{PD.stage="listen";PD.showT=true;drawPod();};
    $("#pdFin").onclick=()=>{PD.stage="done";const n=p.questions.length,xp=10+PD.ok*3;const first=!S.pods[p.id];S.pods[p.id]={ok:PD.ok,n,day:today()};if(first)incEv("stories");incEv("pods");addXP(xp);PD.xp=xp;confetti();drawPod();};
    return;
  }
  subShell(back,`Podcast · ${p.level}`,esc(p.title),`
    <div class="card stats" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="stat"><span class="label">Helyes válasz</span><b class="tnum">${PD.ok} / ${p.questions.length}</b></div><div class="stat"><span class="label">Szerzett XP</span><b class="tnum">+${PD.xp||0}</b></div></div>
    <div class="card stack"><h3>Szószedet</h3><p class="small muted">A + gombbal felveheted a kifejezést a saját kártyáid közé.</p>
    <div class="wlist">${p.vocab.map((v,k)=>`<div><button class="icon-btn" style="width:30px;height:30px" data-say="${esc(v.it)}" aria-label="Meghallgatás">${I.spk}</button><span class="it" ${LA()}>${esc(v.it)}</span><span class="small muted">${esc(v.hu)}</span><button class="btn ghost" data-v="${k}" style="padding:.2rem .6rem" aria-label="Felvétel a kártyák közé: ${esc(v.it)}">+</button></div>`).join("")}</div></div>
    <div class="row"><button class="btn ghost" id="pdAgain">Újrahallgatom szöveggel</button><button class="btn" id="pdList">Többi podcast</button></div>`);
  view.querySelectorAll("[data-v]").forEach(b=>b.onclick=()=>{const v=p.vocab[+b.dataset.v];addOwnQuiet({it:v.it,hu:v.hu,ex:"",note:"Podcast: "+p.title});});
  $("#pdAgain").onclick=()=>{PD.stage="listen";PD.showT=true;PD.i=-1;drawPod();};$("#pdList").onclick=renderPods;
}
function hlPod(){view.querySelectorAll("#pdLines [data-k]").forEach(b=>{const on=+b.dataset.k===PD.i;b.style.outline=on?"3px solid var(--lemon)":"";if(on)b.scrollIntoView({block:"nearest",behavior:"smooth"});});}
async function playPod(from){
  const run=PD;run.playing=true;drawPod();
  for(let k=from;k<run.p.lines.length;k++){if(PD!==run||!run.playing)return;run.i=k;hlPod();await say(run.p.lines[k].it,false,run.rate);if(PD!==run||!run.playing)return;await new Promise(r=>setTimeout(r,250));}
  if(PD===run){run.playing=false;drawPod();toast("Vége az epizódnak. Jöhetnek a kérdések!");}
}

