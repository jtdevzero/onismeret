/* ============ TUTOR ============ */
let T={tab:"chat",sc:null,msgs:[],level:null,busy:false,wPrompt:null,wRes:null,wText:""};
function defLevel(){const n=nextLesson();return n===null?LG().levels[LG().levels.length-1]:LESSONS[n].level;}
function renderTutor(){
  if(!T.level)T.level=defLevel();
  if(T.wPrompt===null)T.wPrompt=today()%WRITING.length;
  view.innerHTML=`<div class="stack"><div><span class="label">Beszélgetés és írás</span><h1>AI tanár</h1><p class="muted">Gyakorold az élő nyelvet: szerepjáték valós helyzetekben, minden üzenetedre javítással, és fogalmazás részletes visszajelzéssel.</p></div>
  <div class="row" style="justify-content:space-between"><span class="seg" id="ttab"><button data-v="chat" aria-pressed="${T.tab==="chat"}">Beszélgetés</button><button data-v="write" aria-pressed="${T.tab==="write"}">Írás</button></span>
  <span class="seg" id="lvl">${LG().levels.map(l=>`<button data-v="${l}" aria-pressed="${T.level===l}">${l}</button>`).join("")}</span></div>
  <div id="tbody" class="stack"></div></div>`;
  $("#ttab").querySelectorAll("button").forEach(b=>b.onclick=()=>{T.tab=b.dataset.v;renderTutor();});
  $("#lvl").querySelectorAll("button").forEach(b=>b.onclick=()=>{T.level=b.dataset.v;renderTutor();});
  getSample().then(s=>{if(!s&&$("#tbody"))$("#tbody").insertAdjacentHTML("afterbegin",`<div class="notice">${aiMissing()} A többi funkció enélkül is működik${XT.off.dialogs.length?", és lent kész párbeszédeket is találsz":""}.</div>`);});
  T.tab==="chat"?(T.sc?drawChat():drawScenarios()):drawWriting();
}
function drawScenarios(){
  $("#tbody").innerHTML=`<div class="lgrid">${SCEN.map(s=>`<button class="lcard scard" data-s="${s.id}">${pic(s.img)}<div class="body"><b>${esc(s.t)}</b><span class="small muted">${esc(s.d)}</span></div></button>`).join("")}</div>${offlineDialogsHtml()}`;
  bindOfflineDialogs();
  $("#tbody").querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{T.sc=SCEN.find(s=>s.id===b.dataset.s);T.sum=null;
    if(T.sc.open){T.msgs=[{r:"ai",it:T.sc.open[0],hu:T.sc.open[1],sugg:[]}];drawChat();setTimeout(()=>say(T.sc.open[0]),200);}
    else{T.msgs=[];sendChat(null);}});
}
function drawChat(){
  if(!$("#tbody"))return;
  const s=T.sc;
  const av=`<div class="av pic"><img src="img/${s.av}.webp" alt="" onerror="this.remove()"></div>`;
  $("#tbody").innerHTML=`<div class="chat-head">${pic(s.img)}<div class="in"><div><h3>${esc(s.t)}</h3><p class="small">${esc(s.d)}</p></div><button class="btn ghost" id="endc">Másik helyzet</button></div></div>
  <div class="chat" id="chat">${T.msgs.map((m,i)=>m.r==="me"?`<div class="msg me">${esc(m.it)}</div>${m.fix?`<div class="msg ai" style="align-self:flex-end;background:transparent;border:0;padding:0"><div class="fix"><b>Javítás:</b> ${esc(m.fix)}</div></div>`:""}`
    :`<div class="mrow">${av}<div class="msg ai"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><span style="flex:1;min-width:0" ${LA()}>${esc(m.it)}</span><button class="icon-btn" style="width:32px;height:32px" data-say="${esc(m.it)}" aria-label="Meghallgatás">${I.spk}</button></div><details><summary class="tr" style="cursor:pointer">Fordítás</summary><div class="tr">${esc(m.hu)}</div></details>${i===T.msgs.length-1&&m.sugg&&m.sugg.length?`<div class="sugg">${m.sugg.map(x=>`<button data-sg="${esc(x)}">${esc(x)}</button>`).join("")}</div>`:""}</div></div>`).join("")}
  ${T.busy?`<div class="mrow">${av}<div class="msg ai"><span class="thinking"><i></i><i></i><i></i></span></div></div>`:""}</div>
  <div class="composer"><input id="cin" placeholder="Válaszolj ${LG().adv}…" autocomplete="off" aria-label="Üzenet ${LG().adv}" ${T.busy?"disabled":""}>${canSpeak()?`<button class="icon-btn" id="cmic" aria-label="Kimondom" ${T.busy?"disabled":""}>${I.mic}</button>`:""}<button class="btn" id="csend" ${T.busy?"disabled":""}>Küldés</button></div>
  <div class="row" style="justify-content:space-between"><p class="small muted" style="flex:1;min-width:200px">${T.hands?`<b id="hState" role="status">${T.listening?"Hallgatlak…":"Kéz nélküli mód: a tanár válasza után magától figyelek."}</b>`:`Tipp: ha nem tudsz egy szót, írd magyarul zárójelben, és a tanár megmondja ${LG().adv}.`}</p>
  <span class="row" style="gap:.4rem">${canSpeak()?`<button class="btn ghost" id="cHands" aria-pressed="${!!T.hands}">${T.hands?"Kéz nélkül: be":"Kéz nélküli mód"}</button>`:""}${T.msgs.filter(m=>m.r==="me").length>=2?`<button class="btn soft" id="cSum">Értékelés</button>`:""}</span></div>
  <div id="csum">${T.sum?sumHtml(T.sum):""}</div>`;
  $("#endc").onclick=()=>{T.sc=null;T.msgs=[];T.sum=null;T.hands=false;drawScenarios();};
  $("#tbody").querySelectorAll("[data-sg]").forEach(b=>b.onclick=()=>{$("#cin").value=b.dataset.sg;$("#cin").focus();});
  const send=()=>{const v=$("#cin").value.trim();if(v&&!T.busy)sendChat(v);};
  $("#csend").onclick=send;$("#cin").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();send();}};
  if($("#cmic"))$("#cmic").onclick=()=>handsListen(true);
  if($("#cHands"))$("#cHands").onclick=()=>{T.hands=!T.hands;if(T.hands&&!T.busy)handsListen(true);else{T.listening=false;drawChat();}};
  if($("#cSum"))$("#cSum").onclick=chatSummary;
  if(!T.busy)$("#cin").focus({preventScroll:true});
  const last=$("#chat").lastElementChild;if(last)last.scrollIntoView({block:"nearest"});
}
const LVL={A1:"A1: nagyon rövid, egyszerű mondatok, csak jelen idő, gyakori szavak",A2:"A2: egyszerű mondatok, jelen és múlt idő, mindennapi szókincs",B1:"B1: természetes, de világos beszéd, többféle igeidő",B2:"B2: természetes, üzleti helyzetekben is magabiztos nyelvhasználat",C1:"C1: árnyalt, idiomatikus, profi üzleti nyelv"};
async function sendChat(text){
  const sample=await getSample();
  if(!sample){toast(aiMissing());return;}
  const start=text===null;
  if(!start)T.msgs.push({r:"me",it:text});T.busy=true;drawChat();
  const hist=start?"(még nincs, a jelenet most kezdődik)":T.msgs.map(m=>(m.r==="me"?"Tanuló: ":"Te: ")+m.it).join("\n");
  const A=LG().adj,AV=LG().adv;
  const prompt=`Egy ${A} nyelvtanuló alkalmazásban szerepjátékot játszol egy magyar anyanyelvű tanulóval.
A szereped: ${T.sc.role}. Maradj a szerepben, légy kedves és természetes.
A tanuló szintje: ${LVL[T.level]}. Ehhez igazítsd a nyelvezetedet.

Az eddigi beszélgetés:
${hist}

${start?`Feladat: a jelenet most kezdődik. Szólalj meg először a szereped szerint ${AV}, egy-két rövid mondatban, és tegyél fel egy kérdést. A correction legyen null.`:`Feladat: válaszolj a tanuló utolsó üzenetére ${AV}, legfeljebb 2-3 mondatban, és vidd tovább a beszélgetést egy kérdéssel. Ha a tanuló magyar szót írt zárójelben, használd a megfelelő ${A} szót a válaszodban. Vizsgáld meg a tanuló utolsó üzenetét: ha nyelvtani, helyesírási, szóhasználati vagy udvariassági hiba van benne (például rossz megszólítási forma), add meg a javított ${A} mondatot és egy rövid magyar magyarázatot. Apró ékezethiányt ne javíts külön, ha a jelentés egyértelmű.`}

Csak egy JSON objektumot adj vissza, pontosan ezekkel a kulcsokkal:
{"reply":"a válaszod ${AV}","reply_hu":"a válaszod magyar fordítása","correction":"javított mondat – magyar magyarázat, vagy null, ha nem volt hiba","suggestions":["két rövid, a szintnek megfelelő ${A} mondat, amit a tanuló válaszolhat"]}`;
  try{
    const r=await sample.json(prompt,{modelTier:"quick",cache:false});
    const me=T.msgs[T.msgs.length-1];if(!start&&r&&r.correction){me.fix=String(r.correction);logMiss("chat",me.it,me.it,me.fix);}
    T.msgs.push({r:"ai",it:String(r.reply||"…"),hu:String(r.reply_hu||""),sugg:Array.isArray(r.suggestions)?r.suggestions.slice(0,3).map(String):[]});
    incEv("chat");addXP(2);T.busy=false;if(T.tab==="chat"&&T.sc&&$("#chat")){drawChat();say(String(r.reply||"")).then(handsNext);}
  }catch(e){T.busy=false;if(!start)T.msgs.pop();if($("#chat")){drawChat();if(!start)$("#cin").value=text;}toast(aiErr(e));}
}
function drawWriting(){
  const p=WRITING[T.wPrompt];
  $("#tbody").innerHTML=`<div class="card stack"><div class="row" style="justify-content:space-between;align-items:flex-start"><div style="min-width:0;flex:1"><span class="label">Mai feladat</span><h3>${esc(p)}</h3></div><button class="btn ghost" id="wnext">Másik téma</button></div>
  <textarea id="wtext" placeholder="${LG().write}" aria-label="Fogalmazás ${LG().adv}">${esc(T.wText)}</textarea>
  <div class="row" style="justify-content:space-between"><span class="small muted tnum" id="wc">0 szó</span><button class="btn" id="wsend">Javítást kérek</button></div></div>
  <div id="wres"></div>`;
  const ta=$("#wtext"),wc=()=>{const n=ta.value.trim()?ta.value.trim().split(/\s+/).length:0;$("#wc").textContent=n+" szó";};
  ta.oninput=()=>{T.wText=ta.value;wc();};wc();
  $("#wnext").onclick=()=>{T.wPrompt=(T.wPrompt+1)%WRITING.length;T.wRes=null;drawWriting();};
  $("#wsend").onclick=sendWriting;
  if(T.wRes)drawWRes();
}
async function sendWriting(){
  const text=$("#wtext").value.trim();if(text.split(/\s+/).length<3){toast("Írj legalább egy-két mondatot.");return;}
  const sample=await getSample();if(!sample){$("#wres").innerHTML=`<div class="notice">${aiMissing()}</div>`;return;}
  $("#wsend").disabled=true;$("#wres").innerHTML=`<div class="card row"><span class="thinking"><i></i><i></i><i></i></span><span class="muted">A tanár javítja a szövegedet…</span></div>`;
  const prompt=`${LG().teacher[0].toUpperCase()+LG().teacher.slice(1)}ként javítsd egy magyar anyanyelvű tanuló fogalmazását. A tanuló célszintje: ${T.level}.
A feladat ez volt: "${WRITING[T.wPrompt]}"
A tanuló szövege:
"""${text}"""

Csak egy JSON objektumot adj vissza, pontosan ezekkel a kulcsokkal:
{"score":1-től 10-ig egész szám a célszinthez mérve,"level":"a szöveg becsült szintje (A1, A2, B1, B2, C1 vagy C2)","praise":"egy konkrét dicséret magyarul","corrected":"a teljes szöveg javítva, a tanuló stílusát megtartva","errors":[{"wrong":"a hibás rész","right":"a javított rész","why":"rövid magyar magyarázat"}],"natural":"a szöveg természetesebb, anyanyelvi változata a célszinten","tip":"egy konkrét tipp magyarul, mire figyeljen legközelebb"}
Legfeljebb 8 hibát sorolj fel, a legfontosabbakkal kezdve. Ha nincs hiba, az errors legyen üres lista.`;
  try{const r=await sample.json(prompt,{modelTier:"default"});T.wRes=r;addXP(5);if(T.tab==="write"&&$("#wres"))drawWRes();}
  catch(e){if($("#wres"))$("#wres").innerHTML=`<div class="notice">${esc(aiErr(e))}</div>`;}
  if($("#wsend"))$("#wsend").disabled=false;
}
function drawWRes(){
  const r=T.wRes||{};const errs=Array.isArray(r.errors)?r.errors:[];
  $("#wres").innerHTML=`<div class="stack">
  <div class="card"><div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="stat"><span class="label">Pontszám</span><b class="tnum">${esc(r.score)} / 10</b></div><div class="stat"><span class="label">Becsült szint</span><b>${esc(r.level)}</b></div></div>${r.praise?`<p style="margin-top:.8rem">${esc(r.praise)}</p>`:""}</div>
  ${errs.length?`<div class="card stack"><h3>Hibák (${errs.length})</h3><div class="err-list">${errs.map(e=>`<div><s>${esc(e.wrong)}</s> → <ins>${esc(e.right)}</ins><div class="small muted">${esc(e.why)}</div></div>`).join("")}</div></div>`:`<div class="card"><h3>Nem találtam hibát. Complimenti!</h3></div>`}
  <div class="card stack"><div class="row" style="justify-content:space-between"><h3>Javított szöveg</h3>${spkBtn(r.corrected||"")}</div><p class="prewrap">${esc(r.corrected)}</p></div>
  <div class="card stack"><div class="row" style="justify-content:space-between"><h3>Így mondaná ${LG().native}</h3>${spkBtn(r.natural||"")}</div><p class="prewrap">${esc(r.natural)}</p></div>
  ${r.tip?`<div class="notice"><b>Tipp:</b> ${esc(r.tip)}</div>`:""}</div>`;
}

