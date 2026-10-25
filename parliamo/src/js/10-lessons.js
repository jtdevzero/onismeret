/* ============ LESSONS ============ */
let lessonFilters={search:"",level:"",track:""};
function renderLessons(){
  const nl=nextLesson(),f=lessonFilters;if(!LG().levels.includes(f.level))f.level="";if(!LESSONS.some(l=>l.track===f.track))f.track="";
  view.innerHTML=`<div class="stack"><div><span class="label">${LG().name} · ${LG().range} · ${doneCount()} / ${LESSONS.length} kész</span><h1>Leckék</h1><p class="muted">Tanulj kisebb részekben, vagy végezz el egy teljes leckét. A félbehagyott gyakorlást és a már elvégzett részeket megőrizzük.</p><div class="row" style="margin-top:.6rem"><button class="btn ghost" data-go="terkep">Haladási térkép</button><button class="btn ghost" id="lPlace">Szintfelmérő</button><button class="btn ghost" data-go="utlevel">Útlevél</button></div></div>
  <div class="card stack"><label for="lSearch">Lecke keresése</label><input id="lSearch" type="search" placeholder="Téma vagy kifejezés" value="${esc(f.search)}"><div class="grid2"><label>Szint<select id="lLevel"><option value="">Minden szint</option>${LG().levels.map(l=>`<option value="${l}" ${f.level===l?"selected":""}>${l}</option>`).join("")}</select></label><label>Tanulási ág<select id="lTrack"><option value="">Minden ág</option>${[...new Set(LESSONS.map(l=>l.track).filter(Boolean))].map(t=>`<option value="${esc(t)}" ${f.track===t?"selected":""}>${esc((TRACKS||{})[t]||t)}</option>`).join("")}</select></label></div><p class="small muted" id="lCount" role="status"></p></div><div class="lgrid" id="lessonResults"></div></div>`;
  function results(){
    const query=deacc(norm(f.search)),list=LESSONS.map((L,i)=>({L,i})).filter(({L})=>(!f.level||L.level===f.level)&&(!f.track||L.track===f.track)&&(!query||deacc(norm([L.t,L.hu,L.goal].join(" "))).includes(query)));
    $("#lCount").textContent=list.length+" / "+LESSONS.length+" lecke";
    let previousTrack=null;
    $("#lessonResults").innerHTML=list.length?list.map(({L,i})=>{const state=ls(i),cls=state&&state.done?"done":state&&state.placed?"placed":i===nl?"cur":"",coverage=lessonCoverageCount(L.id);
      const head=TRACKS&&previousTrack!==L.track?`<h2 style="grid-column:1/-1">${esc(TRACKS[L.track]||L.track)}</h2>`:"";previousTrack=L.track;
      return head+`<button class="lcard ${cls}" data-l="${i}"><div class="pic"><img src="img/${L.id}.webp" alt="" loading="lazy" decoding="async" onerror="this.remove()"><span class="num">${state&&state.done?"✓":i+1}</span><span class="badge">${state&&state.done?`<span class="pill ok">${esc(state.best)}%</span>`:state&&state.placed?'<span class="pill">Átugorva</span>':i===nl?'<span class="pill now">Következő</span>':`<span class="pill">${L.level}</span>`}</span></div><div class="body"><b>${esc(L.t)}</b><span class="small muted">${esc(L.hu)} · ${L.words.length} szó, ${L.phrases.length} kifejezés</span>${coverage&&!state?.done?`<span class="small muted">${coverage} feladat már elkészült · folytatható</span>`:""}</div></button>`;
    }).join(""):'<div class="card" style="grid-column:1/-1"><h2>Nincs ilyen lecke</h2><p class="muted">Próbálj másik keresést, vagy válaszd a minden szint / minden ág lehetőséget.</p></div>';
    view.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>openLesson(+b.dataset.l));
  }
  $("#lSearch").oninput=e=>{f.search=e.target.value;results();};$("#lLevel").onchange=e=>{f.level=e.target.value;results();};$("#lTrack").onchange=e=>{f.track=e.target.value;results();};$("#lPlace").onclick=()=>startPlacement(false);results();
}
function openLesson(li){
  const L=LESSONS[li];prefetch(L.id);
  view.innerHTML=`<div class="stack">
  <div class="row"><button class="btn ghost" id="back">← Leckék</button></div>
  <section class="banner slim">${pic(L.id)}<div class="in"><div class="stack" style="gap:.3rem"><span class="label">Lecke ${li+1} / ${LESSONS.length}</span><h1>${esc(L.t)}</h1><p>${esc(L.hu)} · ${L.level} szint · ${L.words.length+L.phrases.length} kifejezés</p></div></div></section>
  <div class="card"><h3 style="margin-bottom:.6rem">Tudnivalók</h3><div class="notes">${L.notes.map(n=>`<p>${n}</p>`).join("")}</div></div>
  <div class="card"><h3 style="margin-bottom:.3rem">Kifejezések</h3><div class="phr">${L.phrases.map(p=>`<div>${spkBtn(p[0])}<div style="min-width:0"><div class="it" ${LA()}>${esc(p[0])}</div><div class="small muted">${esc(p[1])}</div></div></div>`).join("")}</div></div>
  <div class="card"><h3 style="margin-bottom:.3rem">Szavak</h3><div class="wlist">${L.words.map(w=>`<div><button class="icon-btn" style="width:30px;height:30px" data-say="${esc(w[0])}" aria-label="Meghallgatás">${I.spk}</button><span class="it" ${LA()}>${esc(w[0])}</span><span class="small muted">${esc(w[1])}</span></div>`).join("")}</div></div>
  ${ls(li)&&ls(li).placed&&!ls(li).done?'<p class="notice">Ezt a leckét a szintfelmérő alapján átugrottad. Bármikor elvégezheted; utána befejezett leckeként jelenik meg.</p>':""}<button class="btn block lemon" id="startL">Gyakorlás indítása</button>
  </div>`;
  $("#back").onclick=()=>renderLessons();
  $("#startL").onclick=()=>startLesson(li);
  window.scrollTo(0,0);
}
function distract(w,key,pool){const ans=w[key];const c=[...new Set(pool.filter(x=>x[key]!==ans).map(x=>x[key]))];const near=shuffle(c).slice(0,3);if(near.length<3){shuffle([...new Set(WORDS.map(x=>x[key]))].filter(x=>x!==ans&&!near.includes(x))).slice(0,3-near.length).forEach(x=>near.push(x));}return shuffle([ans,...near]);}
function tilesFor(it,others){const words=it.replace(/[.?!,]/g,"").split(" ");const extra=shuffle([...new Set(others.flatMap(p=>p.it.replace(/[.?!,]/g,"").split(" ")))].filter(x=>!words.includes(x))).slice(0,2);return shuffle([...words,...extra]).map((w,i)=>({w,i}));}
/* Stable authored exercise IDs make small daily sections add up to a whole lesson. */
function lessonCoverageCount(id){return Object.keys((S.lessonCoverage&&S.lessonCoverage[id]||{}).results||{}).length;}
function lessonApplicationExercises(li){
  const L=LESSONS[li],own=(L.grammar||[]).map((g,k)=>({t:"type",q:g[0],blank:1,sub:"Alkalmazd a szabályt: írd be az alakot",ans:[g[1]],why:g[3]||"",coverageId:"apply:grammar:"+k,seconds:50,strict:true}));
  const target=deacc(norm(L.goal)),rules={
    en:{pattern:/to be|lenni/,items:[["She is a teacher. → Tagadd: She ___ a teacher.","is not","A to be után not áll. Az összevont isn't alak is jó.",["isn't"]],["You are from Hungary. → Kérdés: ___ from Hungary?","Are you","Kérdésben az are az alany elé kerül."],["I am tired. → Többes szám: We ___ tired.","are","A we alanyhoz are tartozik."]]},
    it:{pattern:/essere|lenni/,items:[["Io sono stanco. → Többes szám: Noi ___ stanchi.","siamo","Az essere noi alakja siamo; a melléknév is többes számú."],["Tu sei ungherese. → Magázva: Lei ___ ungherese.","è","A magázó Lei harmadik személyű igealakot kér."],["Lui è a Roma. → Tagadd: Lui ___ a Roma.","non è","A non közvetlenül az ige elé kerül."]]},
    es:{pattern:/ser =|ser vagy/,items:[["Yo soy de Hungría. → Többes szám: Nosotros ___ de Hungría.","somos","A ser nosotros alakja somos."],["Tú eres médico. → Harmadik személy: Él ___ médico.","es","A ser harmadik személyű alakja es."],["Ella es profesora. → Tagadd: Ella ___ profesora.","no es","A no közvetlenül az ige elé kerül."]]}
  },rule=rules[lang()];
  if(rule&&rule.pattern.test(target))return rule.items.map((g,k)=>({t:"type",q:g[0],blank:1,sub:"Alakítsd át a mondatot",ans:[g[1],...(g[3]||[])],why:g[2],coverageId:"apply:transform:"+k,section:"application",seconds:60,strict:true}));
  if(own.length>=3)return own.slice(0,3);
  const topic=deacc(norm(L.goal+" "+L.notes.join(" "))),keys=Object.keys(CDRILLS).filter(k=>{
    const d=CDRILLS[k];return d&&Array.isArray(d.items)&&d.items.some(x=>x.q&&x.a&&!x.a.includes(" / "));
  });
  const aliases={tenses:["igeido","present","past","jovo","mult"],articles:["nevelo","a / an"],art:["nevelo","nemek"],preps:["eloljar","idopont"],prep:["eloljar"],cond:["felteteles"],serestar:["ser","estar"],pretimp:["mult","preterito"],porpara:["por","para"]};
  const matched=keys.filter(k=>(aliases[k]||[deacc(norm(CDRILLS[k].title))]).some(w=>topic.includes(w)));
  if(matched.length){
    const d=CDRILLS[matched[0]],items=d.items.filter(x=>x.q&&typeof x.a==="string"&&!x.a.includes(" / "));
    for(const [k,x] of items.slice(li%Math.max(1,items.length-2),li%Math.max(1,items.length-2)+3-own.length).entries())own.push({t:"type",q:x.q,blank:1,sub:"Alkalmazd a szabályt: "+d.title,ans:[x.a],why:x.why||"",coverageId:"apply:drill:"+matched[0]+":"+norm(x.q),seconds:50,strict:true});
  }
  // Authored course phrases supply a controlled application task when there is no matching drill rule.
  for(let k=own.length;k<3&&L.phrases.length;k++){
    const p=L.phrases[(li+k)%L.phrases.length],words=p[0].split(/\s+/),j=words.findIndex(w=>w.length>2&&/^[A-Za-zÀ-ÿ]/.test(w));
    if(j<0)continue;const answer=words[j].replace(/[.,!?¿¡;:]$/,""),q=words.map((w,i)=>i===j?"___":w).join(" ");
    own.push({t:"type",q,blank:1,sub:"Egészítsd ki a helyzethez illő mondatot: "+p[1],ans:[answer],why:"A tanult helyzet mintamondata: "+p[0],coverageId:"apply:phrase:"+p[3],seconds:45,strict:true});
  }
  return own;
}
function lessonExercisePlan(li){
  const L=LESSONS[li],pool=POOL.filter(c=>c.li===li&&!c.ph),ph=POOL.filter(c=>c.li===li&&c.ph),q=[];
  const words=pool.map((c,k)=>Object.assign(exFor(c,k%3===2?3:1),{coverageId:"word:"+c.id,section:"words",seconds:k%3===2?40:25})),phrases=ph.map((c,k)=>Object.assign(exFor(c,k%3===0?4:k%3===1?2:3),{coverageId:"phrase:"+c.id,section:"phrases",seconds:45}));
  while(words.length||phrases.length){if(phrases.length)q.push(phrases.shift());q.push(...words.splice(0,2));}
  return q.concat(lessonApplicationExercises(li).map(e=>Object.assign(e,{section:"application"})));
}
function startLesson(li,options={}){
  const L=LESSONS[li];if(!L)return;
  if(!options.restart&&offerExerciseResume("lesson:"+L.id,()=>startLesson(li,Object.assign({},options,{restart:true}))))return;
  prefetch(L.id);
  const plan=lessonExercisePlan(li),results=(S.lessonCoverage&&S.lessonCoverage[L.id]||{}).results||{},replay=!!ls(li)?.done;
  let selected=options.guided&&!replay?plan.filter(e=>!results[e.coverageId]):plan;
  if(options.guided){let seconds=0;selected=selected.filter(e=>{if(seconds>=(options.seconds||330))return false;seconds+=(e.seconds||35)+(e.cid&&!S.cards[e.cid]?15:0);return true;});}
  const queue=[];
  selected.forEach(e=>{const c=e.cid&&POOL.find(c=>c.id===e.cid);if(options.guided&&c&&!results[e.coverageId]&&!S.cards[c.id])queue.push({t:"intro",c,li,seconds:15});queue.push(e);});
  P={kind:"lesson",li,lessonId:L.id,queue,i:0,ok:0,n:0,xp:0,st:{},graded:{},chunk:!!options.guided,coverageIds:selected.map(e=>e.coverageId),replay};
  if(!queue.length)return finishLesson();renderEx();
}
/* Saved snapshots hold data only. Graded feedback resumes at the following question. */
function validExerciseSnapshot(x){
  const object=v=>!!v&&typeof v==="object"&&!Array.isArray(v),text=v=>typeof v==="string"&&v.length<=20000;
  const integer=(v,max=1000000)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
  const strings=(v,max=100)=>Array.isArray(v)&&v.length>0&&v.length<=max&&v.every(text);
  if(!object(x)||x.cleared||x.v!==1||!object(x.session))return false;
  const s=x.session,queue=s.queue;
  if(!["lesson","daily","miss","speak"].includes(s.kind)||!Array.isArray(queue)||!queue.length||queue.length>200||!integer(s.i,queue.length))return false;
  if(s.kind==="lesson"&&(typeof x.lessonId!=="string"||!integer(s.li,LESSONS.length-1)||LESSONS[s.li].id!==x.lessonId))return false;
  if(s.kind!=="lesson"&&(x.lessonId!=null||s.li!=null))return false;
  for(const key of ["ok","n","xp","retryN","retryOk"])if(s[key]!==undefined&&!integer(s[key]))return false;
  if(!integer(s.ok)||!integer(s.n)||!integer(s.xp)||s.ok>s.n)return false;
  if(!object(s.graded)||Object.entries(s.graded).some(([id,n])=>!POOL.some(c=>c.id===id)||n!==1))return false;
  if(s.coverageIds!==undefined&&(!Array.isArray(s.coverageIds)||s.coverageIds.length>200||!s.coverageIds.every(text)))return false;
  for(const e of queue){
    if(!object(e)||!["intro","mc","type","listen","dict","order","match","speak"].includes(e.t))return false;
    for(const key of ["q","sub","say","it","hu","why","coverageId","section"])if(e[key]!==undefined&&!text(e[key]))return false;
    if(e.cid!==undefined&&(typeof e.cid!=="string"||!POOL.some(c=>c.id===e.cid)))return false;
    if(e.li!==undefined&&!integer(e.li,LESSONS.length))return false;
    if(e.blank&&(!["mc","type"].includes(e.t)||!text(e.q)))return false;
    if(e.t==="intro"){
      const c=e.c;if(!object(c)||!POOL.some(p=>p.id===c.id)||!text(c.it)||!text(c.hu)||(c.alt!==undefined&&(!Array.isArray(c.alt)||c.alt.length>100||!c.alt.every(text))))return false;
    }
    if(e.opts!==undefined&&!strings(e.opts,30))return false;
    if(["mc","listen"].includes(e.t)&&(!strings(e.opts,30)||!text(e.ans)||!e.opts.includes(e.ans)))return false;
    if(["type","dict"].includes(e.t)&&!strings(e.ans,30))return false;
    if(["mc","type","order"].includes(e.t)&&!text(e.q))return false;
    if(["order","speak"].includes(e.t)&&!text(e.ans))return false;
    if(e.t==="order"){
      if(!Array.isArray(e.tiles)||!e.tiles.length||e.tiles.length>200||e.tiles.some(t=>!object(t)||!integer(t.i,10000)||!text(t.w))||new Set(e.tiles.map(t=>t.i)).size!==e.tiles.length)return false;
    }
    if(e.t==="match"){
      if(!Array.isArray(e.pairs)||!e.pairs.length||e.pairs.length>100||e.pairs.some(p=>!object(p)||!text(p.it)||!text(p.hu)))return false;
      if(e.matchDone!==undefined&&(!Array.isArray(e.matchDone)||e.matchDone.some(i=>!integer(i,e.pairs.length-1))||new Set(e.matchDone).size!==e.matchDone.length))return false;
      if(e.matchMiss!==undefined&&!integer(e.matchMiss))return false;
    }
  }
  if(s.draft!=null){
    const d=s.draft,e=queue[s.i];if(!object(d)||!e)return false;
    if(d.text!==undefined&&(!text(d.text)||!["type","dict"].includes(e.t)))return false;
    if(d.sel!=null&&(!["mc","listen"].includes(e.t)||!integer(d.sel,e.opts.length-1)))return false;
    if(d.picked!==undefined&&(e.t!=="order"||!Array.isArray(d.picked)||d.picked.some(i=>!integer(i,10000)||!e.tiles.some(t=>t.i===i))||new Set(d.picked).size!==d.picked.length))return false;
  }
  return true;
}
function savedExercise(){const x=(S.activeExercises||{})[lang()];return validExerciseSnapshot(x)?x:null;}
function clearActiveExercise(){S.activeExercises=S.activeExercises||{};S.activeExercises[lang()]={cleared:true,updatedAt:Date.now()};}
function persistExercise(afterAnswer=false){
  if(!P||!Array.isArray(P.queue))return;
  const session=JSON.parse(JSON.stringify(P));delete session.st;
  if(afterAnswer){session.i++;delete session.draft;}else session.draft=P.draft||null;
  S.activeExercises=S.activeExercises||{};
  S.activeExercises[lang()]={v:1,updatedAt:Date.now(),scope:P.kind==="lesson"?"lesson:"+LESSONS[P.li].id:"round:"+P.kind,lessonId:P.kind==="lesson"?LESSONS[P.li].id:null,session,daily:!!dailyActive};save();
}
function offerExerciseResume(scope,restart){
  const saved=savedExercise();if(!saved)return false;
  const li=saved.lessonId?LESSONS.findIndex(l=>l.id===saved.lessonId):null;
  if(saved.lessonId&&li<0){clearActiveExercise();save();return false;}
  const count=Math.min(saved.session.i,saved.session.queue.length),title=li!==null?LESSONS[li].hu:"Ismétlőkör";
  view.innerHTML=`<div class="player"><span class="label">Mentett gyakorlás</span><h1>Folytassuk innen?</h1><div class="card stack"><h2>${esc(title)}</h2><p>${count} / ${saved.session.queue.length} feladat elkészült. A feladatsor, a válaszaid eredménye és az ismétlési ütemezés megmaradt.</p></div><button class="btn block" id="resumeExercise">Mentett gyakorlás folytatása</button><button class="btn ghost" id="restartExercise">${saved.scope===scope?"Ezt a gyakorlást újrakezdem":"A kiválasztott gyakorlást kezdem"}</button><button class="btn ghost" data-go="ma">Később folytatom</button></div>`;
  $("#resumeExercise").onclick=resumeActiveExercise;$("#restartExercise").onclick=()=>{clearActiveExercise();save();restart();};return true;
}
function resumeActiveExercise(){
  const saved=savedExercise();if(!saved)return;
  const session=JSON.parse(JSON.stringify(saved.session)),allowed=new Set(["intro","mc","type","listen","dict","order","match","speak"]);
  if(!["lesson","daily","miss","speak"].includes(session.kind)||session.queue.length>200||!session.queue.every(e=>e&&allowed.has(e.t)&&(!e.cid||POOL.some(c=>c.id===e.cid))&&(e.t!=="intro"||e.c&&POOL.some(c=>c.id===e.c.id)))||!Number.isInteger(session.i)||session.i<0||session.i>session.queue.length){clearActiveExercise();save();return go("ma");}
  if(saved.lessonId){session.li=LESSONS.findIndex(l=>l.id===saved.lessonId);if(session.li<0)return;}
  P=session;P.st={};dailyActive=!!saved.daily;
  if(P.i>=P.queue.length)return P.kind==="lesson"?finishLesson():finishRound();renderEx();
}
function renderEx(){
  const e=P.queue[P.i],draft=P.draft||{}; P.st={sel:draft.sel??null,picked:draft.picked||[],done:false,mL:null,matched:(e.matchDone||[]).length,miss:e.matchMiss||0,t0:Date.now(),heard:null};persistExercise();
  let body="";
  if(e.t==="mc"){body=`<div class="stack"><span class="label">${esc(e.sub)}</span><div class="row" style="flex-wrap:nowrap;align-items:center">${e.say?spkBtn(e.say):""}<div class="q">${e.blank?blankify(e.q):esc(e.q)}</div></div></div>
    <div class="opts">${e.opts.map((o,i)=>`<button class="opt" data-o="${i}" aria-pressed="false"><kbd>${i+1}</kbd>${esc(o)}</button>`).join("")}</div>`;}
  if(e.t==="type"){body=`<div class="stack"><span class="label">${esc(e.sub)}</span><div class="q">${e.blank?blankify(e.q):esc(e.q)}</div></div>
    <input id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Írd ide ${LG().adv}…" aria-label="Válasz">`;}
  if(e.t==="order"){body=`<div class="stack"><span class="label">Rakd össze ${LG().adv}</span><div class="q">${esc(e.q)}</div></div>
    <div class="tiles answer-line" id="line"></div><div class="tiles" id="bank">${e.tiles.map(t=>`<button class="tilebtn" data-t="${esc(t.i)}">${esc(t.w)}</button>`).join("")}</div>`;}
  if(e.t==="listen"){body=`<div class="stack"><span class="label">Mit hallasz?</span><div class="listen">${spkBtn(e.ans,"big")}<button class="icon-btn" data-say="${esc(e.ans)}" data-slow aria-label="Lassan">${I.slow}</button></div></div>
    <div class="opts">${e.opts.map((o,i)=>`<button class="opt" data-o="${i}" aria-pressed="false"><kbd>${i+1}</kbd>${esc(o)}</button>`).join("")}</div>`;}
  if(e.t==="match"){const L=shuffle(e.pairs.map((p,i)=>({x:p.it,i}))),R=shuffle(e.pairs.map((p,i)=>({x:p.hu,i})));
    body=`<div class="stack"><span class="label">Párosítsd a szavakat</span><div class="q">Koppints egy ${LG().adj} szóra, majd a jelentésére.</div></div>
    <div class="match"><div class="opts">${L.map(o=>`<button class="opt" data-ml="${o.i}">${esc(o.x)}</button>`).join("")}</div><div class="opts">${R.map(o=>`<button class="opt" data-mr="${o.i}">${esc(o.x)}</button>`).join("")}</div></div>`;}
  if(e.t==="intro"){body=`<div class="stack"><span class="pill now" style="align-self:flex-start">Új ${e.c.ph?"kifejezés":"szó"}</span><div class="card fc" style="min-height:200px"><div class="front">${esc(e.c.it)}</div>${spkBtn(e.c.it)}<div class="back">${esc(e.c.hu)}</div>${e.c.alt&&e.c.alt.length?`<span class="small muted">Így is mondhatod: ${esc(e.c.alt.join(" · "))}</span>`:""}</div><p class="small muted">Hallgasd meg, mondd ki hangosan, és jegyezd meg. Pár feladat múlva rákérdezek.</p></div>`;}
  if(e.t==="dict"){body=`<div class="stack"><span class="label">Írd le, amit hallasz</span><div class="listen">${spkBtn(e.ans[0],"big")}<button class="icon-btn" data-say="${esc(e.ans[0])}" data-slow aria-label="Lassan">${I.slow}</button></div></div>
    <input id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Írd le ${LG().adv}…" aria-label="Válasz">`;}
  if(e.t==="speak"){body=`<div class="stack"><span class="label">Mondd ki hangosan</span><div class="row" style="flex-wrap:nowrap">${spkBtn(e.ans)}<div class="q">${esc(e.ans)}</div></div><p class="small muted">${esc(e.hu||"")}</p></div>
    <div class="stack" style="align-items:center;gap:.6rem"><button class="icon-btn big" id="mic" aria-label="Felvétel indítása"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg></button><span class="small muted" id="heard">Koppints a mikrofonra, és mondd ki a mondatot. A felismert szöveget ellenőrizzük; ez nem kiejtésmérés.</span><button class="btn ghost" id="skipSpeak" style="font-size:.85rem">Most nem tudok beszélni</button></div>`;}
  view.innerHTML=`<div class="player">
    <div class="pbar"><button class="close" id="quit" aria-label="Kilépés">×</button><div class="track"><div class="fill" style="width:${P.i/P.queue.length*100}%"></div></div><span class="small muted tnum">${P.i+1}/${P.queue.length}</span></div>
    ${e.retry?'<p class="small muted" role="status">Visszakérdezés · ezt már gyakoroltuk. Az eredeti pontosságodat és az XP-t nem módosítja.</p>':""}${body}
    <div class="pfoot"><div id="fb"></div><button class="btn block" id="go" ${e.t==="match"?"hidden":""} disabled>Ellenőrzés</button></div>
  </div>`;
  const li=P.li, kind=P.kind; $("#quit").onclick=()=>{persistExercise(P.st.done);P=null;if(dailyActive){go("ma");return;}if(kind==="lesson")openLesson(li);else render();};
  const goBtn=$("#go");
  if(e.t==="intro"){goBtn.disabled=false;goBtn.textContent="Megvan, tovább";P.st.done=true;setTimeout(()=>say(e.c.it),250);}
  if(e.t==="dict"){const inp=$("#ans");inp.value=draft.text||"";inp.oninput=()=>{goBtn.disabled=!inp.value.trim();P.draft={text:inp.value};persistExercise();};goBtn.disabled=!inp.value.trim();setTimeout(()=>{say(e.ans[0]);inp.focus();},250);}
  if(e.t==="speak"){
    const session=P,state=P.st;
    $("#mic").onclick=async()=>{const h=$("#heard"),mic=$("#mic");h.textContent="Hallgatlak…";mic.disabled=true;
      try{const alts=await listen();if(P!==session||P.st!==state)return;state.heard=alts;h.textContent="Ezt ismerte fel a böngésző: „"+alts[0]+"”";goBtn.disabled=false;}
      catch(err){if(P!==session||P.st!==state)return;h.textContent=err==="no-speech"?"Nem hallottam semmit. Próbáld újra.":"A mikrofon nem érhető el. Engedélyezd a böngészőben, vagy hagyd ki.";}
      if(P===session&&P.st===state)mic.disabled=false;};
    $("#skipSpeak").onclick=()=>{P.st.done=true;nextEx();};
  }
  if(e.t==="mc"||e.t==="listen"){view.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{if(P.st.done)return;view.querySelectorAll("[data-o]").forEach(x=>x.setAttribute("aria-pressed","false"));b.setAttribute("aria-pressed","true");P.st.sel=+b.dataset.o;P.draft={sel:P.st.sel};persistExercise();goBtn.disabled=false;if(e.t==="mc"&&!e.say&&e.it)say(e.opts[P.st.sel]);});}
  if(e.t==="type"){const inp=$("#ans");inp.value=draft.text||"";inp.oninput=()=>{goBtn.disabled=!inp.value.trim();P.draft={text:inp.value};persistExercise();};goBtn.disabled=!inp.value.trim();setTimeout(()=>inp.focus(),30);}
  if(e.t==="order"){
    const line=$("#line"),bank=$("#bank");
    const draw=()=>{line.innerHTML=P.st.picked.map(i=>`<button class="tilebtn" data-u="${esc(i)}">${esc(e.tiles.find(t=>t.i===i).w)}</button>`).join("");
      bank.querySelectorAll("[data-t]").forEach(b=>b.classList.toggle("used",P.st.picked.includes(+b.dataset.t)));goBtn.disabled=!P.st.picked.length;
      line.querySelectorAll("[data-u]").forEach(b=>b.onclick=()=>{if(P.st.done)return;P.st.picked=P.st.picked.filter(x=>x!==+b.dataset.u);P.draft={picked:P.st.picked};persistExercise();draw();});};
    draw();bank.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{if(P.st.done)return;const i=+b.dataset.t;if(!P.st.picked.includes(i)){P.st.picked.push(i);P.draft={picked:P.st.picked};persistExercise();say(e.tiles.find(t=>t.i===i).w);draw();}});
  }
  if(e.t==="listen") setTimeout(()=>say(e.ans),250);
  if(e.t==="match"){
    (e.matchDone||[]).forEach(i=>view.querySelectorAll(`[data-ml="${i}"],[data-mr="${i}"]`).forEach(b=>b.classList.add("right","gone")));
    view.querySelectorAll("[data-ml]").forEach(b=>b.onclick=()=>{view.querySelectorAll("[data-ml]").forEach(x=>x.setAttribute("aria-pressed","false"));b.setAttribute("aria-pressed","true");P.st.mL=+b.dataset.ml;say(e.pairs[P.st.mL].it);});
    view.querySelectorAll("[data-mr]").forEach(b=>b.onclick=()=>{if(P.st.mL===null||(e.matchDone||[]).includes(P.st.mL))return;const l=view.querySelector(`[data-ml="${P.st.mL}"]`);
      if(+b.dataset.mr===P.st.mL){l.classList.add("right","gone");b.classList.add("right","gone");P.st.matched++;e.matchDone=(e.matchDone||[]).concat(P.st.mL);P.st.mL=null;persistExercise();
        if(P.st.matched===e.pairs.length){P.st.done=true;const ok=P.st.miss<=1;recordExerciseResult(e,ok,null,false);showFb(ok,null,(ok?"Minden pár a helyén.":"Kész, de "+P.st.miss+" tévesztéssel. A hibás párokat hallgasd meg újra; pár feladat múlva visszakérdezek."));goBtn.hidden=false;goBtn.disabled=false;goBtn.textContent="Tovább";persistExercise(true);goBtn.focus();}}
      else{P.st.miss++;e.matchMiss=P.st.miss;persistExercise();b.classList.add("wrong");l.classList.add("wrong");setTimeout(()=>{b.classList.remove("wrong");l.classList.remove("wrong");},500);}});
  }
  if(draft.sel!=null&&(e.t==="mc"||e.t==="listen")){const selected=view.querySelector(`[data-o="${draft.sel}"]`);if(selected){selected.setAttribute("aria-pressed","true");goBtn.disabled=false;}}
  goBtn.onclick=()=>{if(P.st.done)return nextEx();evaluate();};
}
function showFb(ok,ans,extra){$("#fb").innerHTML=`<div class="feedback ${ok?"ok":"bad"}" role="status"><b>${ok?rnd(LG().ok):"Nem egészen."}</b>${ans?`<span>Helyes válasz: <span class="ans">${esc(ans)}</span></span>`:""}${extra?`<span class="small">${esc(extra)}</span>`:""}</div>`;}
/* A retry is feedback, not a second graded attempt. This keeps accuracy, XP and FSRS honest. */
function queueExerciseRetry(e){
  if(e.retry||e.retried)return;
  e.retried=true;
  const retry=easier(e);retry.retry=true;retry.retried=true;
  P.queue.splice(Math.min(P.i+4,P.queue.length),0,retry);
}
function recordExerciseResult(e,ok,warn,fast){
  if(e.retry){P.retryN=(P.retryN||0)+1;if(ok)P.retryOk=(P.retryOk||0)+1;return;}
  P.n++;if(ok){P.ok++;P.xp+=2;}else queueExerciseRetry(e);
  if(e.cid)itemResult(e,ok,warn,fast);
  if(P.kind==="lesson"&&e.coverageId&&!P.replay){S.lessonCoverage=S.lessonCoverage||{};const c=S.lessonCoverage[LESSONS[P.li].id]||(S.lessonCoverage[LESSONS[P.li].id]={results:{}});if(!c.results[e.coverageId])c.results[e.coverageId]={ok:!!ok,at:Date.now()};c.updatedAt=Date.now();}
}
function exerciseExplanation(e){
  if(e.why)return String(e.why);
  const known=e.cid&&POOL.find(c=>c.id===e.cid);
  if(e.blank){
    const matching=Object.values(CDRILLS).flatMap(d=>d.items||[]).find(x=>norm(x.q)===norm(e.q));
    if(matching&&matching.why)return matching.why;
    const answer=Array.isArray(e.ans)?e.ans[0]:e.ans;
    return "A teljes mondat: "+e.q.replace("___",answer)+". Figyeld meg a hiányzó alak helyét és a környező szavakat.";
  }
  if(known)return "Ezt a párt idézd fel együtt: „"+known.it+"” — "+known.hu+".";
  if(e.t==="listen"||e.t==="dict")return e.hu?"Jelentése: "+e.hu:"Hallgasd meg újra a mintát, és figyeld meg a szavak sorrendjét.";
  if(e.t==="order")return "A mintamondat szórendjét követjük. Olvasd el egyben, majd mondd ki hangosan.";
  if(e.t==="speak")return "A mintamondatot a felismert szöveggel hasonlítjuk össze; a hangképzést és a hanglejtést ez nem méri.";
  return e.q?"Jegyezd meg együtt: „"+e.q+"” — "+(Array.isArray(e.ans)?e.ans[0]:e.ans)+".":"Nézd meg a mintaválaszt, majd próbáld felidézni segítség nélkül.";
}
function evaluate(){
  if(!P||P.st.done)return;
  const e=P.queue[P.i];let ok=false,warn=null;
  if(e.t==="mc"||e.t==="listen"){ok=e.opts[P.st.sel]===e.ans;view.querySelectorAll("[data-o]").forEach(b=>{const o=e.opts[+b.dataset.o];if(o===e.ans)b.classList.add("right");else if(+b.dataset.o===P.st.sel)b.classList.add("wrong");});}
  if(e.t==="type"||e.t==="dict"){const r=check($("#ans").value,e.ans,{type:e.strict?"grammar":e.t==="dict"?"dictation":e.cid&&!POOL.find(c=>c.id===e.cid)?.ph?"word":"translation"});ok=r.ok;warn=r.warn;$("#ans").readOnly=true;}
  if(e.t==="speak"){const sc=speechScore(e.ans,P.st.heard||[]);ok=sc>=0.75;if(ok&&sc<0.95)warn="A felismert szöveg részben egyezik a mintával. Hasonlítsd össze a két mondatot, majd próbáld újra.";}
  if(e.t==="order"){const text=P.st.picked.map(i=>e.tiles.find(t=>t.i===i).w).join(" ");ok=norm(text)===norm(e.ans);}
  P.st.done=true;
  const fast=(e.t==="type"||e.t==="dict")&&Date.now()-P.st.t0<8000;
  recordExerciseResult(e,ok,warn,fast);fx(ok?"ok":"bad");
  if(!ok&&!e.retry){const given=e.t==="mc"||e.t==="listen"?e.opts[P.st.sel]:e.t==="order"?P.st.picked.map(i=>e.tiles.find(t=>t.i===i).w).join(" "):e.t==="speak"?(P.st.heard||[])[0]:($("#ans")||{}).value;logMiss(P.kind,e.q||e.hu||e.it,given,Array.isArray(e.ans)?e.ans[0]:e.ans);}
  let extra=warn||"";
  if(!ok||e.t==="listen"||e.t==="dict"||e.t==="speak")extra+=(extra?" ":"")+exerciseExplanation(e);
  if(!ok&&!e.retry)extra+=" Néhány feladat múlva újra előkerül.";
  if(e.retry&&ok)extra+=(extra?" ":"")+"Most már sikerült a visszakérdezés.";
  showFb(ok,ok?null:(Array.isArray(e.ans)?e.ans[0]:e.ans),extra);
  if(e.blank){const q=view.querySelector(".q");if(q)q.innerHTML=esc(e.q).replace("___",`<b style="color:var(--${ok?"ok":"bad"})">${esc(Array.isArray(e.ans)?e.ans[0]:e.ans)}</b>`);}
  const answer=Array.isArray(e.ans)?e.ans[0]:e.ans;
  const sp=e.it||(e.blank?e.q.replace(/\s*\(.*?\)\s*$/,"").replace("___",answer):null);
  if(sp&&!/^Írd|^Hogy van/.test(e.q))say(sp);
  persistExercise(true);const g=$("#go");g.textContent="Tovább";g.disabled=false;g.focus();
}
function nextEx(){P.i++;delete P.draft;if(P.i>=P.queue.length)return P.kind==="lesson"?finishLesson():finishRound();renderEx();}
function seedLessonReviews(li,ids,limit){
  const candidates=POOL.filter(c=>c.li===li&&c.ph&&(!ids||ids.includes("phrase:"+c.id))&&!S.cards[c.id]).slice(0,limit);
  candidates.forEach(c=>{const card=sched(null,2,c.id);card.due=today()+1;S.cards[c.id]=card;});
  return candidates.length;
}
function finishLesson(){
  const session=P,L=LESSONS[session.li],li=session.li,coverage=(S.lessonCoverage&&S.lessonCoverage[L.id]||{}).results||{},plan=lessonExercisePlan(li);
  const complete=!session.chunk||plan.every(e=>coverage[e.coverageId]),acc=session.chunk&&complete?Math.round(plan.filter(e=>coverage[e.coverageId]?.ok).length/Math.max(1,plan.length)*100):session.n?Math.round(session.ok/session.n*100):0,prev=ls(li),firstTime=!(prev&&prev.done),bonus=complete&&acc>=90?10:0,xp=session.xp+bonus;
  const reviewLimit=typeof dailyPacing==="function"?dailyPacing().newReviews:5,seeded=seedLessonReviews(li,session.chunk?session.coverageIds:null,reviewLimit);
  clearActiveExercise();P=null;
  if(complete){S.lessons[L.id]={done:true,best:Math.max(acc,prev?prev.best||0:0),day:prev&&prev.day&&!prev.placed?prev.day:today()};if(firstTime)incEv("lessons");}
  addXP(xp);
  view.innerHTML=`<div class="player" style="justify-content:center;text-align:center;align-items:center"><span class="label">${complete?"Lecke kész":"Mai leckeszakasz kész"}</span><h1>${complete?LG().fin[acc>=90?0:acc>=70?1:2]:"Egy újabb rész már megvan."}</h1>
    ${complete&&firstTime?`<div class="stamp-new">${stampSvg(L,li,true,today())}</div>`:""}<div class="stats" style="width:100%;max-width:420px;grid-template-columns:repeat(2,minmax(0,1fr))"><div class="card stat"><span class="label">Pontosság</span><b>${acc}%</b></div><div class="card stat"><span class="label">Szerzett XP</span><b>+${xp}</b></div></div><p class="muted">${complete?"A lecke feladatait végiggyakoroltad.":`${Object.keys(coverage).length} / ${plan.length} feladat készült el. A következő alkalommal a még hátralévő résszel folytatjuk; a teljes lecke addig nincs befejezettnek jelölve.`} ${seeded?seeded+" új kulcskifejezés holnap ismétlésre vár.":"A már ütemezett kifejezések a saját időpontjukban térnek vissza."}</p><div class="row"><button class="btn ghost" id="again">${complete?"Újra":"További leckeszakasz"}</button><button class="btn" id="cont">${complete?"Következő lecke":"Vissza a leckékhez"}</button></div></div>`;
  $("#again").onclick=()=>startLesson(li,session.chunk?{guided:true,seconds:dailyPacing().lessonSeconds}:{});
  $("#cont").onclick=()=>{const n=nextLesson();if(complete&&n!==null)openLesson(n);else renderLessons();};
  if(complete)confetti();if(typeof dailyLessonFinished==="function")dailyLessonFinished(li,acc);
}
