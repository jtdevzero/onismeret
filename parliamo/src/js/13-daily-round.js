/* ============ DAILY ROUND, MISTAKES, PRONUNCIATION ============ */
const missCount=()=>{const ids=new Set(POOL.map(c=>c.id));return Object.keys(S.miss).filter(k=>ids.has(k)).length;};
function logReview(ok){const d=today();const l=S.log[d]||(S.log[d]={n:0,ok:0});l.n++;if(ok)l.ok++;}
function roundCard(due,nw){
  const r=Math.min(due,25),n=Math.min(nw,10),tot=r+n,mins=Math.max(1,Math.round(tot*12/60)),done=S.rounds[today()];
  return `<div class="card next" style="border:2px solid var(--cobalt)"><div><span class="label">Napi kör</span><h3>${tot?`<span class="tnum">${r}</span> ismétlés · <span class="tnum">${n}</span> új · kb. ${mins} perc`:done?"Mára kész a napi kör":"Mára nincs esedékes elem"}</h3>
    <p class="small muted">${tot?"Egy menetben az esedékes ismétlések és az új szavak. A feladatok egyre nehezebbek, ahogy egy szó egyre jobban megy.":"Holnap jönnek az újabb ismétlések. Addig jöhet egy lecke, egy történet vagy a hibakör."}</p></div>${tot?`<button class="btn lemon" id="hRound">Indítás</button>`:""}</div>`;
}
/* Progressive difficulty: the stronger an item's memory (FSRS stability), the harder the exercise. */
function stageOf(card){if(!card||!card.reps)return 0;const s=card.s||0;return s<1.5?1:s<4?2:s<10?3:s<30?4:5;}
function exFor(c,st){
  let pool=POOL.filter(x=>x.li===c.li&&!!x.ph===!!c.ph);if(pool.length<4)pool=POOL.filter(x=>!!x.ph===!!c.ph);
  const base={cid:c.id,li:c.li,it:c.it},alt=c.alt||[];
  const mcIt=()=>({...base,t:"mc",q:c.it,sub:"Mit jelent?",say:c.it,ans:c.hu,opts:distract(c,"hu",pool)});
  const mcHu=()=>({...base,t:"mc",q:c.hu,sub:"Hogy mondod "+LG().adv+"?",ans:c.it,opts:distract(c,"it",pool)});
  const order=()=>({...base,t:"order",q:c.hu,ans:c.it,tiles:tilesFor(c.it,pool.filter(x=>x!==c))});
  const type=()=>({...base,t:"type",q:c.hu,sub:"Írd le "+LG().adv,ans:[c.it,...alt]});
  const dict=()=>({...base,t:"dict",ans:[c.it],hu:c.hu});
  const speak=()=>({...base,t:"speak",ans:c.it,hu:c.hu});
  if(st==="speak")return speak();
  if(st<=1)return mcIt();
  if(st===2)return c.ph&&c.it.split(" ").length>2?order():mcHu();
  if(st===3)return type();
  if(st===4)return dict();
  return canSpeak()&&c.ph?speak():c.ph?dict():type();
}
function easier(e){
  const c=e.cid&&POOL.find(x=>x.id===e.cid);
  if(c&&e.t!=="mc")return Object.assign(exFor(c,1),{retry:true});
  return Object.assign({},e,{retry:true,opts:e.opts?shuffle(e.opts.slice()):undefined});
}
function itemResult(e,ok,warn,fast){
  const id=e.cid;
  if(!ok)S.miss[id]=(S.miss[id]||0)+1;
  else if((P.kind==="miss"||e.fromMiss)&&!e.retry){S.miss[id]=(S.miss[id]||1)-1;if(S.miss[id]<=0)delete S.miss[id];incEv("fixes");}
  /* Mistake items are practice, not reviews: they never create or reschedule a card. */
  if(P.kind==="daily"&&!e.retry&&!e.fromMiss&&!P.graded[id]){
    P.graded[id]=1;const g=!ok?1:warn?2:fast?4:3,isNew=!S.cards[id];
    const prev=S.cards[id];
    if(ok&&prev&&prev.last&&Date.now()-prev.last>=7*864e5)recordEvidence("recall",id,e.t==="type"&&!warn?"Egy hét után is felidézted":"Egy hét után is helyesen válaszoltál",(POOL.find(c=>c.id===id)||{}).it||e.it||e.q||"");
    S.cards[id]=sched(prev,g-1,id);logReview(g>1);incEv("reviews");
    if(isNew){const t=today();if(S.newToday.day!==t)S.newToday={day:t,n:0};S.newToday.n++;}
  }
  save();
}
/* The most-missed items that are not already in the round, most frequent first. */
function missPicks(skip,n){
  if(!n)return [];
  return Object.entries(S.miss).map(([id,k])=>[POOL.find(c=>c.id===id),k]).filter(([c])=>c&&!skip.has(c.id)).sort((a,b)=>b[1]-a[1]).slice(0,n).map(([c])=>c);
}
/* The grammar topic or drill that the last 30 days of mistakes point to most (at least two mistakes). */
function weakSpot(){
  const by={};monthMisses().forEach(m=>{by[m.k]=(by[m.k]||0)+1;});
  const top=Object.entries(by).filter(([k,n])=>n>=2&&(k.startsWith("grammar:")||k.startsWith("drill:"))).sort((a,b)=>b[1]-a[1])[0];
  return top?{k:top[0],n:top[1],label:mkLabel(top[0])}:null;
}
function startRound(kind,limits={}){
  if(!limits.restart&&offerExerciseResume("round:"+kind,()=>startRound(kind,Object.assign({},limits,{restart:true}))))return;
  const q=[];
  if(kind==="daily"){
    const due=dueList().sort((a,b)=>S.cards[a.id].due-S.cards[b.id].due).slice(0,limits.review??25), nw=newAvail().slice(0,Math.min(newLeft(),limits.newCards??10));
    due.forEach(c=>q.push(exFor(c,stageOf(S.cards[c.id]))));
    nw.forEach((c,k)=>{const pos=Math.min(q.length,k*3);q.splice(pos,0,{t:"intro",c,li:c.li});q.splice(Math.min(q.length,pos+3),0,exFor(c,0));});
    /* A few of the learner's own recurring mistakes ride along in every daily round, spread through the queue. */
    missPicks(new Set(q.map(e=>e.cid).filter(Boolean)),limits.miss??3).forEach((c,k,all)=>q.splice(Math.round((k+1)*q.length/(all.length+1)),0,Object.assign(exFor(c,c.ph&&Math.random()<.5?2:3),{fromMiss:true})));
  }
  if(kind==="miss"){
    Object.entries(S.miss).map(([id,n])=>[POOL.find(c=>c.id===id),n]).filter(x=>x[0]).sort((a,b)=>b[1]-a[1]).slice(0,15)
      .forEach(([c])=>q.push(exFor(c,c.ph&&Math.random()<.5?2:3)));
  }
  if(kind==="speak"){
    const u=new Set(unlocked());shuffle(POOL.filter(c=>c.ph&&u.has(c.li))).slice(0,8).forEach(c=>q.push(exFor(c,"speak")));
  }
  if(!q.length){toast(kind==="miss"?"Nincs javítandó hiba. Szép munka!":"Mára nincs több feladat.");return;}
  prefetch(...new Set(q.map(e=>AUDIO_IDX[e.it||(e.c&&e.c.it)]).filter(Boolean)));
  P={kind,li:null,queue:q,i:0,ok:0,n:0,xp:0,st:{},graded:{}};
  renderEx();
}
function finishRound(){
  const kind=P.kind, acc=P.n?Math.round(P.ok/P.n*100):100, bonus=kind==="daily"?10:0, xp=P.xp+bonus;
  if(kind==="daily"){S.rounds[today()]=(S.rounds[today()]||0)+1;incEv("rounds");}
  clearActiveExercise();addXP(xp);P=null;
  const title={daily:"Napi kör kész",miss:"Hibakör kész",speak:"Hangos gyakorlás kész"}[kind];
  view.innerHTML=`<div class="player" style="justify-content:center;text-align:center;align-items:center">
    <span class="label">${title}</span><h1>${LG().fin[acc>=90?0:acc>=70?1:2]}</h1>
    <div class="stats" style="width:100%;max-width:420px;grid-template-columns:repeat(2,minmax(0,1fr))"><div class="card stat"><span class="label">Pontosság</span><b class="tnum">${acc}%</b></div><div class="card stat"><span class="label">Szerzett XP</span><b class="tnum">+${xp}</b></div></div>
    <p class="muted" style="max-width:46ch">${kind==="daily"?"Az ütemező minden kifejezést akkor hoz vissza, amikor nagyjából 90% eséllyel még emlékszel rá.":kind==="miss"?(missCount()?`Még ${missCount()} kifejezés vár javításra.`:"Minden hibát kijavítottál."):"A kiejtés a sok hangos ismétléstől javul. Holnap is mondj ki pár mondatot."}</p>
    ${kind==="daily"&&weakSpot()?`<div class="card stack" style="max-width:420px;text-align:left"><span class="label">A visszatérő hibáid alapján</span><p><b>${esc(weakSpot().label)}</b> · ${weakSpot().n} hiba az elmúlt 30 napban.</p><button class="btn soft" id="rWeak">Gyakoroljuk most</button></div>`:""}
    <div class="row" style="justify-content:center"><button class="btn ghost" data-go="ma">Kezdőlap</button>${missCount()&&kind!=="miss"?`<button class="btn" id="rMiss">Hibakör</button>`:`<button class="btn" id="rAi">Napi AI-történet</button>`}</div></div>`;
  confetti();
  if($("#rMiss"))$("#rMiss").onclick=()=>startRound("miss");
  if($("#rWeak"))$("#rWeak").onclick=()=>{const w=weakSpot();if(!w)return;dailyActive=false;route="gyakorlas";
    if(w.k.startsWith("grammar:")){const id=w.k.slice(8);route="nyelvtan";withExtra("grammar",()=>openTopic(id));}else startDrill(w.k.slice(6));};
  if($("#rAi"))$("#rAi").onclick=()=>{route="gyakorlas";aiStory();};
  dailyRoundFinished(kind);
}
/* Speech recognition only exists outside the artifact frame (the frame refuses the microphone). */
const canSpeak=()=>IS_WEB&&!!(window.SpeechRecognition||window.webkitSpeechRecognition);
function listen(){
  return new Promise((res,rej)=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return rej("unsupported");
    const r=new SR();r.lang=LG().tts;r.interimResults=false;r.maxAlternatives=4;let got=false;
    r.onresult=e=>{got=true;res([...e.results[0]].map(a=>a.transcript));};
    r.onerror=e=>rej(e.error||"error");r.onend=()=>{if(!got)rej("no-speech");};
    try{player.pause();speechSynthesis.cancel();}catch(e){}
    r.start();
  });
}
function speechScore(target,alts){return speechDetail(target,alts).score;}
