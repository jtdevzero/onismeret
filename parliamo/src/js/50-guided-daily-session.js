/* A resumable daily path. Its stages record completed work, never inferred fluency. */
let dailyActive=false;
function dailyPacing(){
  return S.settings.goal===20?{minutes:5,review:3,lessonSeconds:150,outputCount:1,newReviews:3}:S.settings.goal===100?{minutes:25,review:12,lessonSeconds:900,outputCount:3,newReviews:8}:{minutes:10,review:6,lessonSeconds:330,outputCount:2,newReviews:5};
}
function dailySession(){
  S.dailySessions=S.dailySessions||{};
  let s=S.dailySessions[lang()];
  if(!s||s.day!==today()){
    const li=nextLesson();
    s={day:today(),lessonId:li===null?null:LESSONS[li].id,review:false,lesson:false,output:false,at:Date.now()};
    S.dailySessions[lang()]=s;
  }
  const li=nextLesson(),current=LESSONS.findIndex(l=>l.id===s.lessonId);
  if(!s.lesson&&((!s.startedAt&&!s.review)||current>=0&&ls(current)&&ls(current).placed)){
    const nextId=li===null?null:LESSONS[li].id;
    if(nextId!==s.lessonId){s.lessonId=nextId;s.output=false;delete s.outputItemId;delete s.outputHelp;delete s.outputDone;delete s.outputDraft;delete s.outputAttempts;}
  }
  if(Array.isArray(s.outputDone)&&new Set(s.outputDone).size>=dailyPacing().outputCount)s.output=true;
  return s;
}
function saveDaily(){dailySession().at=Date.now();save();}
function dailySteps(){
  const s=dailySession(),L=LESSONS.find(l=>l.id===s.lessonId);
  return [
    [s.review,"Rövid ismétlés",s.review==="none"?"Most nincs esedékes kártya":s.review?"Az ismétlőkör elkészült":"A korábban tanultak rövid felidézése"],
    [s.lesson,"Egy leckeszakasz",s.lesson==="none"?"A kijelölt leckéket már végigvetted":s.lesson?"A mai leckeszakasz elkészült":L?L.hu:"Szabad ismétlés"],
    [s.output,"Önálló válasz",s.output?"Válaszgyakorlat elkészült":dailyPacing().outputCount+" mondat felidézése segítség nélkül"]
  ];
}
function startDailyJourney(){if(savedExercise())return offerExerciseResume("daily",()=>startDailyJourney());dailyActive=true;dailySession().startedAt=dailySession().startedAt||Date.now();saveDaily();continueDaily();}
function continueDaily(){
  dailyActive=true;
  const s=dailySession();
  if(!s.review){
    if(dueList().length)return startRound("daily",{review:dailyPacing().review,newCards:0});
    s.review="none";saveDaily();
  }
  if(!s.lesson){
    const li=LESSONS.findIndex(l=>l.id===s.lessonId);
    if(li>=0)return openDailyLesson(li);
    s.lesson="none";saveDaily();
  }
  if(!s.output)return drawDailyOutput();
  finishDailyJourney();
}
function openDailyLesson(li){
  openLesson(li);
  const back=$("#back");if(back){back.textContent="← Mai gyakorlás";back.onclick=()=>{dailyActive=false;go("ma");};}
  const start=$("#startL");if(start){start.textContent="A mai, kb. "+Math.max(2,Math.round(dailyPacing().lessonSeconds/60))+" perces rész indítása";start.onclick=()=>startLesson(li,{guided:true,seconds:dailyPacing().lessonSeconds});}
  view.insertAdjacentHTML("afterbegin",'<p class="small muted" style="margin-bottom:1rem">Mai gyakorlás · 2/3 · Olvasd át a tudnivalókat, majd egy rövid részt gyakorlunk. A többit máskor folytathatod.</p>');
}
function dailyRoundFinished(kind){
  if(!dailyActive||kind!=="daily")return;
  dailySession().review=true;saveDaily();
  attachDailyContinue("Tovább a mai leckéhez");
}
function dailyLessonFinished(li,acc){
  if(!dailyActive||dailySession().lessonId!==LESSONS[li].id)return;
  dailySession().lesson=true;saveDaily();
  attachDailyContinue("Jöhet az önálló válasz");
}
function attachDailyContinue(label){
  const actions=view.querySelector(".player > .row:last-child");
  if(!actions)return;
  actions.innerHTML=`<button class="btn ghost" id="dailyPause">Most befejezem</button><button class="btn lemon" id="dailyContinue">${esc(label)}</button>`;
  $("#dailyPause").onclick=()=>go("ma");
  $("#dailyContinue").onclick=continueDaily;
}
function dailyOutputItem(){
  const s=dailySession();
  let c=POOL.find(c=>c.id===s.outputItemId);
  if(c&&!s.output&&(s.outputDone||[]).includes(c.id)){
    delete s.outputItemId;delete s.outputHelp;delete s.outputAttempts;delete s.outputDraft;c=null;
  }
  if(!c){
    const li=LESSONS.findIndex(l=>l.id===s.lessonId),u=new Set(unlocked());
    const phrases=POOL.filter(c=>c.ph&&c.li===li),fallback=POOL.filter(c=>c.ph&&u.has(c.li)),candidates=phrases.length?phrases:fallback.length?fallback:POOL.filter(c=>u.has(c.li));
    const already=s.outputDone||[],available=candidates.filter(c=>!already.includes(c.id));
    c=available.length?available[(today()+already.length)%available.length]:null;
    if(c){s.outputItemId=c.id;delete s.outputDraft;delete s.outputAttempts;saveDaily();}
  }
  return c;
}
function drawDailyOutput(){
  const c=dailyOutputItem();
  if(!c){dailySession().output="none";saveDaily();return finishDailyJourney();}
  const s=dailySession(),count=Array.isArray(s.outputDone)?s.outputDone.length:0,target=dailyPacing().outputCount;
  view.innerHTML=`<div class="player"><div class="row"><button class="btn ghost" id="dailyBack">← Mai gyakorlás</button><span class="label">3/3 · Önálló válasz</span></div>
    <h1>Most te következel. ${count+1}/${target}</h1><p class="muted">Hogyan mondanád ${LG().adv}? Először segítség nélkül próbáld meg. A válaszodat leírhatod vagy mikrofonba mondhatod.</p>
    <div class="card"><h2>${esc(c.hu)}</h2></div>
    <label class="stack"><span class="label">A válaszod</span><input id="dailyAnswer" ${LA()} autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${esc(LG().write)}"></label>
    <div class="row"><button class="btn" id="dailyCheck" disabled>Ellenőrzés</button>${canSpeak()?'<button class="btn ghost" id="dailyMic">Mikrofon</button>':""}<button class="btn ghost" id="dailyHint">Mutass segítséget</button></div>
    <div id="dailyFeedback" aria-live="polite"></div></div>`;
  const answer=$("#dailyAnswer"),checkBtn=$("#dailyCheck"),feedback=$("#dailyFeedback");
  answer.value=s.outputDraft||"";checkBtn.disabled=!answer.value.trim();answer.oninput=()=>{checkBtn.disabled=!answer.value.trim();s.outputDraft=answer.value;saveDaily();};
  $("#dailyBack").onclick=()=>go("ma");
  $("#dailyHint").onclick=()=>{s.outputHelp=true;saveDaily();feedback.innerHTML=`<div class="notice">${spkBtn(c.it)} <span ${LA()}>${esc(c.it)}</span><p class="small">Olvasd el, majd mondd ki és írd le újra. Ezt segített gyakorlásként mentjük.</p></div>`;};
  checkBtn.onclick=()=>{
    const r=check(answer.value,[c.it,...(c.alt||[])],{type:"translation"});
    if(!r.ok){s.outputAttempts=(s.outputAttempts||0)+1;if(s.outputAttempts===1&&!s.outputHelp){saveDaily();feedback.innerHTML=`<div class="notice"><b>Nézzük meg még egyszer.</b><p>${esc(r.hint||"Ezt a változatot a rövid ellenőrzés még nem tudta elfogadni. Nézd meg az alanyt, az igét és a szórendet; más helyes megfogalmazás is létezhet.")}</p><p class="small">Próbáld újra. A mintaválaszt csak külön kérésre vagy a következő sikertelen próbálkozás után mutatjuk.</p></div>`;answer.focus();return;}s.outputHelp=true;saveDaily();feedback.innerHTML=`<div class="feedback bad"><b>Próbáld újra.</b><span>Így mondhatod: <span ${LA()}>${esc(c.it)}</span></span><span class="small">Figyeld meg a szórendet és az ige alakját, majd írd le újra.</span></div>`;answer.focus();return;}
    s.outputDone=Array.isArray(s.outputDone)?s.outputDone:[];if(!s.outputDone.includes(c.id))s.outputDone.push(c.id);s.output=s.outputDone.length>=target;delete s.outputDraft;
    recordEvidence(s.outputHelp?"practice":"output",c.id,s.outputHelp?"Mondatot gyakoroltál segítséggel":"Segítség nélkül felidézted",c.it);
    saveDaily();fx("ok");
    feedback.innerHTML=`<div class="feedback ok"><b>${s.outputHelp?"Megvan, begyakoroltad.":"Sikerült önállóan!"}</b><span ${LA()}>${esc(c.it)}</span>${r.warn?`<span>${esc(r.warn)}</span>`:""}</div><button class="btn block" id="dailyFinish" style="margin-top:1rem">${s.output?"Mai gyakorlás befejezése":"Következő önálló mondat"}</button>`;
    checkBtn.disabled=true;answer.readOnly=true;$("#dailyHint").disabled=true;
    if($("#dailyMic"))$("#dailyMic").disabled=true;
    $("#dailyFinish").onclick=()=>{if(s.output)finishDailyJourney();else{delete s.outputItemId;delete s.outputHelp;saveDaily();drawDailyOutput();}};
  };
  answer.onkeydown=e=>{if(e.key==="Enter"&&!checkBtn.disabled)checkBtn.click();};
  const mic=$("#dailyMic");if(mic)mic.onclick=async()=>{
    mic.disabled=true;feedback.textContent="Hallgatlak…";
    try{const alts=await listen();if(!answer.isConnected||s.output||answer.readOnly)return;answer.value=alts[0]||"";s.outputDraft=answer.value;saveDaily();checkBtn.disabled=!answer.value.trim();feedback.textContent="Ezt ismerte fel a böngésző: „"+answer.value+"”. A szöveget ellenőrizzük; a kiejtést ebből nem pontozzuk.";}
    catch(e){if(answer.isConnected&&!s.output)feedback.textContent="A mikrofon most nem érhető el. Írd be a válaszodat.";}
    if(mic.isConnected&&!s.output)mic.disabled=false;
  };
}
function finishDailyJourney(){
  dailyActive=false;
  const s=dailySession();
  view.innerHTML=`<div class="player"><span class="label">Mai gyakorlás kész</span><h1>Ma is tettél egy lépést.</h1><p class="muted">A következő alkalommal innen folytatjuk. A tanult kifejezések az ismétlésben újra előkerülnek.</p>
    <div class="daily-steps">${dailySteps().map(([done,title,detail],i)=>`<div class="daily-step is-done"><span>${done==="none"?"–":"✓"}</span><div><b>${esc(title)}</b><small>${esc(detail)}</small></div></div>`).join("")}</div>
    ${milestonesCard()}<button class="btn lemon" data-go="ma">Vissza a kezdőlapra</button></div>`;
  if(!s.celebrated){s.celebrated=true;saveDaily();confetti();}
  window.scrollTo(0,0);
}
function recordEvidence(kind,key,title,detail){
  S.evidence=Array.isArray(S.evidence)?S.evidence:[];
  const id=[lang(),today(),kind,key].join("|");
  if(S.evidence.some(e=>e.id===id))return;
  S.evidence.push({id,key,l:lang(),kind,title:String(title),detail:String(detail||""),at:Date.now()});
  S.evidence=S.evidence.slice(-80);
}
function milestonesCard(){
  const evidence=(S.evidence||[]).filter(e=>e.l===lang()).slice(-3).reverse();
  const completed=LESSONS.filter((L,i)=>ls(i)&&ls(i).done);
  const pod=XT.pods.find(p=>S.pods[p.id]&&S.pods[p.id].n&&S.pods[p.id].ok===S.pods[p.id].n);
  const entries=evidence.map(e=>({title:e.title,detail:e.detail}));
  if(entries.length<3&&completed.length)entries.push({title:completed.length+" leckét végiggyakoroltál",detail:completed[completed.length-1].hu});
  if(entries.length<3&&pod)entries.push({title:"Egy podcast összes kérdésére jól válaszoltál",detail:pod.title||pod.t||"Hallásértés"});
  return `<section class="card stack"><span class="label">Amit már megcsináltál</span><h3>Kézzelfogható haladás</h3>${entries.length?`<div class="milestone-list">${entries.slice(0,3).map(e=>`<div class="milestone-item"><span aria-hidden="true">✓</span><div><b>${esc(e.title)}</b><p class="small muted">${esc(e.detail)}</p></div></div>`).join("")}</div>`:'<p class="small muted">Az első önálló válaszod, befejezett leckéd és egy hét után felidézett kifejezésed itt fog megjelenni.</p>'}</section>`;
}
