/* ============ JOURNAL WITH AI CORRECTION ============ */
/* A short daily entry in the target language. The AI corrects it, explains the mistakes in Hungarian and suggests a
   more natural version; the mistakes go to the mistake log and can become flashcards. */
let JR=null;
const JR_PROMPTS=["What did you do yesterday? Describe your day.","Describe something that made you smile this week.","What are your plans for the weekend?","Write about a place you would like to visit and why.","What is the best thing you have learned recently?","Describe a person you spoke to today.","What would you do if you had a free day tomorrow?","Write about a problem you solved recently.","What is your favourite way to relax, and why?","Describe your ideal job.","What did you eat today? Was it healthy?","Write about a film, book or series you enjoyed.","What habit would you like to change, and how?","Describe the weather today and how it affects your mood.","What was the most difficult part of your week?","If you could live in another country for a year, where would you go?","Write about a childhood memory.","What do you like and dislike about your town?","Describe a skill you would like to learn.","What advice would you give to your younger self?"];
const jrList=()=>(S.journal||(S.journal=[])).filter(e=>e.l===lang());
function journalSessionFromDraft(){
  const l=lang(),draft=(S.journalDrafts||{})[l]||{};
  return {l,text:typeof draft.text==="string"&&!draft.deleted?draft.text:"",prompt:typeof draft.prompt==="string"?draft.prompt:JR_PROMPTS[today()%JR_PROMPTS.length],res:null,history:false,historyLimit:10};
}
function saveJournalDraft(session=JR){
  if(!session||session.history||session.l!==lang())return;
  S.journalDrafts=S.journalDrafts||{};S.journalDrafts[session.l]={text:session.text,prompt:session.prompt,at:Date.now(),deleted:!session.text};save();
}
function journalFeedback(record){
  if(record.feedback&&typeof record.feedback==="object")return record.feedback;
  return {corrected:record.fixed||record.text||"",errors:(record.errs||[]).map(e=>({wrong:e.wrong,right:e.right,why:e.why||"",hu:e.hu||""})),level:record.lv||"",natural:"",praise:"",tip:"",words:[]};
}
function openJournalHistory(key){
  const record=jrList().find(e=>(e.id||String(e.at))===key);if(!record)return;
  stopViews();JR={l:lang(),history:true,entryId:key,text:record.text||"",prompt:record.prompt||"Korábbi bejegyzés",res:journalFeedback(record),historyLimit:10};renderJournal(true);window.scrollTo(0,0);
}
function renderJournal(keep){
  if(!keep)stopViews();if(!JR||JR.l!==lang())JR=journalSessionFromDraft();
  if(JR.request&&!JR.request.owns()){JR.request.cancel("stale");JR.request=null;JR.busy=false;}
  const list=jrList(),t=today(),done=list.some(e=>e.d===t),session=JR;
  let streak=0;for(let d=t-(done?0:1);list.some(e=>e.d===d);d--)streak++;
  const limit=session.historyLimit||10;
  subShell(["Gyakorlás",()=>go("gyakorlas")],"Napló",session.history?"Korábbi bejegyzés":"Napi bejegyzés",`<p class="muted">Írj pár mondatot ${LG().adv} a napodról vagy a mai témáról. A tanár magyar magyarázatot ad; a javításokat átnézés után ismétlőkártyára mentheted.</p>
    <div class="row">${aiAccessBadge()}${session.history?`<button class="btn soft" id="jrBackToDraft">Vissza a piszkozatomhoz</button>`:""}</div>${!session.history&&!aiConfigured()?aiSetupNotice():""}
    <div class="card"><div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="stat"><span class="label">Bejegyzések</span><b class="tnum">${list.length}</b></div><div class="stat"><span class="label">Napok sorozatban</span><b class="tnum">${streak}</b></div></div></div>
    <div class="card stack"><span class="label">${session.history?"A bejegyzés témája":"Mai téma (nem kötelező)"}</span><p lang="en">${esc(session.prompt)}</p>${!session.history?`<div><button class="btn ghost" id="jrOther" ${session.busy?"disabled":""}>Másik téma</button></div>`:""}</div>
    <label class="stack" style="gap:.4rem"><span class="small">${session.history?"Az eredeti szöveged":"A bejegyzésed"}</span><textarea id="jrText" style="min-height:200px" ${LA()} placeholder="${LG().write}" aria-label="Napló ${LG().adv}" ${session.history||session.busy?"readonly":""}>${esc(session.text)}</textarea></label>
    ${!session.history?`<div class="row" style="justify-content:space-between"><span class="small muted tnum" id="jrWc"></span><button class="btn" id="jrSend" ${session.busy?"disabled":""}>Javítást kérek</button></div><p class="small muted" id="jrDraftStatus">A piszkozatod automatikusan mentődik ebben a böngészőben.</p>`:""}
    <div id="jrRes">${session.busy?aiRequestBusy("A tanár javítja a naplódat…","jrCancel"):session.error?`<div class="notice stack"><p>${esc(aiRequestMessage(session.error))}</p><div><button class="btn soft" id="jrRetry">Újrapróbálás</button></div></div>`:session.res?jrHtml(session.res,session.text):""}</div>
    ${!session.history&&session.res?`<div><button class="btn ghost" id="jrNew">Új bejegyzés</button></div>`:""}
    ${list.length?`<div class="sec-head"><h2>Korábbi bejegyzések</h2></div>${list.slice().reverse().slice(0,limit).map(e=>`<div class="card next"><div><b>${new Date(e.at).toLocaleDateString("hu-HU")}</b><p class="small muted">${e.n||0} javítás${e.lv?" · AI-becslés: "+esc(e.lv):""}</p></div><button class="btn ghost" data-journal-entry="${esc(e.id||String(e.at))}">Megnyitás</button></div>`).join("")}${list.length>limit?`<div><button class="btn ghost" id="jrMore">További bejegyzések (${list.length-limit})</button></div>`:""}`:""}`);
  const ta=$("#jrText"),wc=()=>{const n=ta.value.trim()?ta.value.trim().split(/\s+/).length:0;const counter=$("#jrWc");if(counter)counter.textContent=n+" szó";};
  ta.oninput=()=>{if(session.history||session.busy)return;session.text=ta.value;session.error=null;saveJournalDraft(session);wc();};wc();
  if($("#jrOther"))$("#jrOther").onclick=()=>{session.prompt=rnd(JR_PROMPTS.filter(p=>p!==session.prompt));saveJournalDraft(session);renderJournal(true);};
  if($("#jrSend"))$("#jrSend").onclick=sendJournal;
  if($("#jrRetry"))$("#jrRetry").onclick=sendJournal;
  if($("#jrCancel"))$("#jrCancel").onclick=()=>{if(session.request)session.request.cancel();};
  if($("#jrMore"))$("#jrMore").onclick=()=>{session.historyLimit=limit+10;const y=window.scrollY;renderJournal(true);window.scrollTo(0,y);};
  if($("#jrBackToDraft"))$("#jrBackToDraft").onclick=()=>{JR=journalSessionFromDraft();renderJournal(true);};
  if($("#jrNew"))$("#jrNew").onclick=()=>{session.text="";saveJournalDraft(session);JR=journalSessionFromDraft();renderJournal(true);$("#jrText").focus();};
  view.querySelectorAll("[data-journal-entry]").forEach(b=>b.onclick=()=>openJournalHistory(b.dataset.journalEntry));
  bindJrCards();bindAISetup(view,()=>renderJournal(true));
}
async function sendJournal(){
  const session=JR;if(!session||session.history||session.busy)return;
  const text=$("#jrText").value.trim();if(text.split(/\s+/).length<15){toast("Írj legalább 15 szót.");return;}
  session.text=text;saveJournalDraft(session);
  const token=session.token=(session.token||0)+1,job=createAIRequest(()=>JR===session&&session.l===lang()&&session.token===token&&!session.history);
  session.request=job;session.busy=true;session.error=null;renderJournal(true);
  const prompt=`${LG().teacher[0].toUpperCase()+LG().teacher.slice(1)}ként javítsd ki egy magyar anyanyelvű tanuló ${LG().adv} írt naplóbejegyzését. Légy pontos, de bátorító.
A bejegyzés:
"""${text}"""

Javítsd ki a nyelvtani, szóhasználati és helyesírási hibákat úgy, hogy a tanuló mondanivalója megmaradjon. Minden hibát külön sorolj fel rövid magyar magyarázattal (legfeljebb 10). Írj egy természetesebb, anyanyelvi változatot is ugyanarról. Becsüld meg a szöveg szintjét (A1–C2). Adj 3 hasznos ${LG().adj} kifejezést, ami ehhez a témához illik.
Csak egy JSON objektumot adj vissza:
{"corrected":"a kijavított szöveg","errors":[{"wrong":"hibás rész","right":"javított rész","hu":"a javított kifejezés magyar jelentése","why":"rövid magyar magyarázat"}],"natural":"természetesebb változat","level":"B1","praise":"egy mondat dicséret magyarul","tip":"egy konkrét tipp magyarul","words":[{"it":"kifejezés","hu":"jelentés"}]}`;
  try{
    const r=await job.json(prompt,{modelTier:"default"});if(!job.current())return;
    if(!r||typeof r.corrected!=="string")throw {code:"invalid_json"};
    const errors=(Array.isArray(r.errors)?r.errors:[]).filter(e=>e&&e.wrong&&e.right).slice(0,10).map(e=>({wrong:String(e.wrong),right:String(e.right),why:String(e.why||""),hu:String(e.hu||"")}));
    const feedback={corrected:r.corrected,errors,natural:String(r.natural||""),level:String(r.level||""),praise:String(r.praise||""),tip:String(r.tip||""),words:(Array.isArray(r.words)?r.words:[]).filter(w=>w&&w.it).slice(0,10).map(w=>({it:String(w.it),hu:String(w.hu||"")}))};
    const at=Date.now();session.res=feedback;session.busy=false;session.request=null;session.entryId=`${job.language}-jr-${at.toString(36)}-${Math.random().toString(36).slice(2,6)}`;
    S.journal=S.journal||[];S.journal.push({id:session.entryId,at,d:today(),l:job.language,prompt:session.prompt,text,fixed:feedback.corrected,errs:errors,n:errors.length,lv:feedback.level,feedback});if(S.journal.length>120)S.journal.splice(0,S.journal.length-120);
    errors.forEach(e=>logMiss("journal",e.wrong,e.wrong,e.right+" – "+e.why));
    const words=text.split(/\s+/).length;if(feedback.level)skillLog("write",feedback.level,Math.max(30,85-errors.length/words*400),"journal");
    incEv("drills");addXP(8);save();renderJournal(true);
  }catch(error){
    if(!job.owns())return;session.busy=false;session.request=null;session.error=error;renderJournal(true);
    if(error&&error.code==="no_ai"){$("#jrRes").innerHTML=aiSetupNotice();bindAISetup($("#jrRes"),()=>renderJournal(true));}
  }
}
function jrHtml(r,text){
  const errs=r.errors||[],words=Array.isArray(r.words)?r.words.filter(w=>w&&w.it):[];
  return `<div class="stack"><div class="card stack"><div class="row" style="justify-content:space-between"><h3>Javított szöveg</h3><span class="pill">AI-becslés: ${esc(r.level||"nincs szint")} · ${errs.length} javítás</span></div><p class="prewrap" ${LA()}>${esc(r.corrected||text)}</p>${r.praise?`<p class="small">${esc(r.praise)}</p>`:""}</div>
    ${errs.length?`<div class="card stack"><h3>Hibák</h3><div class="err-list">${errs.map(e=>`<div><s ${LA()}>${esc(e.wrong)}</s> → <ins ${LA()}>${esc(e.right)}</ins><div class="small muted">${esc(e.why)}</div></div>`).join("")}</div><button class="btn soft" id="jrCards">Javítások átnézése és kártyára mentése (${errs.length})</button></div>`:""}
    ${r.natural?`<div class="card stack"><h3>Így mondaná egy anyanyelvi</h3><p class="prewrap" ${LA()}>${esc(r.natural)}</p></div>`:""}
    ${words.length?`<div class="card stack"><h3>Hasznos kifejezések</h3>${words.map(w=>`<div class="dict-row">${spkBtn(String(w.it),"sm")}<div style="min-width:0"><div class="it" ${LA()}>${esc(w.it)}</div><div class="small muted">${esc(w.hu)}</div></div><button class="btn ghost" data-jw="${esc(w.it)}" data-jh="${esc(w.hu)}" style="padding:.35rem .6rem;font-size:.8rem">+ Kártya</button></div>`).join("")}</div>`:""}
    <div id="jrCardReview" hidden></div>
    ${r.tip?`<div class="notice"><b>Tipp:</b> ${esc(r.tip)}</div>`:""}</div>`;
}
/* AI suggestions are drafts: each card needs an explicit check and a Hungarian meaning. */
function openJournalCardReview(cards){
  const target=$("#jrCardReview");if(!target)return;
  target.hidden=false;
  target.innerHTML=`<div class="card stack"><h3>Kártyák átnézése</h3><p class="small muted">Az AI javaslatait mentés előtt ellenőrizd. Javíthatod a kifejezést és a magyar jelentést, és kihagyhatod, amit nem szeretnél tanulni.</p>
    ${cards.map((c,i)=>`<div class="stack" data-jr-card="${i}" style="gap:.5rem;border-top:1px solid var(--line);padding-top:.8rem"><label class="row" style="flex-wrap:nowrap;justify-content:flex-start"><input type="checkbox" data-jr-select checked style="width:20px;height:20px;flex:none"><b>${i+1}. kártya mentése</b></label>
      ${c.wrong?`<p class="small muted">Eredetileg: <s ${LA()}>${esc(c.wrong)}</s></p>`:""}
      <label class="stack" style="gap:.25rem"><span class="small">Kifejezés ${LG().adv}</span><input data-jr-it value="${esc(c.it)}" ${LA()}></label>
      <label class="stack" style="gap:.25rem"><span class="small">Magyar jelentés</span><input data-jr-hu value="${esc(c.hu||"")}" placeholder="Mit jelent magyarul?"></label>
      ${c.why?`<p class="small muted">${esc(c.why)}</p>`:""}</div>`).join("")}
    <p id="jrCardMsg" class="small" role="status" aria-live="polite"></p><div class="row"><button class="btn" id="jrSaveCards">Kijelölt kártyák mentése</button><button class="btn ghost" id="jrCancelCards">Mégsem</button></div></div>`;
  $("#jrCancelCards").onclick=()=>{target.hidden=true;};
  $("#jrSaveCards").onclick=()=>{
    const rows=[...target.querySelectorAll("[data-jr-card]")].filter(row=>row.querySelector("[data-jr-select]").checked),msg=$("#jrCardMsg");
    if(!rows.length){msg.textContent="Jelölj ki legalább egy kártyát.";return;}
    for(const row of rows){for(const key of ["it","hu"]){const input=row.querySelector(`[data-jr-${key}]`);input.removeAttribute("aria-invalid");if(!input.value.trim()){input.setAttribute("aria-invalid","true");input.focus();msg.textContent=key==="hu"?"Add meg a kijelölt kártya magyar jelentését.":"Add meg a kijelölt kártya kifejezését.";return;}}}
    let n=0;rows.forEach(row=>{const it=row.querySelector("[data-jr-it]").value.trim(),hu=row.querySelector("[data-jr-hu]").value.trim();if(ownList().some(x=>norm(x.it)===norm(it)))return;
      ownList().push({id:`${lang()}-own-${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`,it,hu,alt:[],note:"Napló · ellenőrzött javaslat"});n++;});
    save();rebuildOwn();fx("ok");msg.textContent=n?`${n} kártya elmentve. Az ismétlésben is megjelennek.`:"Ezek a kifejezések már a kártyáid között vannak.";$("#jrSaveCards").disabled=true;toast(n?`${n} kártya elmentve.`:"A kártyák már megvannak.");
  };
  target.scrollIntoView({block:"nearest"});target.querySelector("input").focus({preventScroll:true});
}
function bindJrCards(){
  if($("#jrCards"))$("#jrCards").onclick=()=>{const errs=(JR&&JR.res&&JR.res.errors)||[];openJournalCardReview(errs.map(e=>({it:e.right,hu:e.hu||"",wrong:e.wrong,why:e.why})));};
  view.querySelectorAll("[data-jw]").forEach(b=>b.onclick=()=>openJournalCardReview([{it:b.dataset.jw,hu:b.dataset.jh||""}]));
}
