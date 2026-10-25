/* ============ READER ============ */
const READ_TOPICS=["Hírek","Utazás","Munka és karrier","Kultúra","Sport","Tudomány","Étel","Életmód"];
let RD=null;
function renderReader(){
  D=null;
  view.innerHTML=`<div class="stack"><div class="row"><button class="btn ghost" id="rBack">← Gyakorlás</button></div>
    <div><span class="label">${LG().name} · ${defLevel()} szint</span><h1>Olvasó</h1><p class="muted">Az AI a szintedre ír egy rövid szöveget. Koppints bármelyik szóra a jelentéséért, és egy gombbal felveheted a kártyáid közé.</p></div>
    <div class="card stack"><span class="label">Válassz témát</span><div class="sugg">${READ_TOPICS.map(t=>`<button data-t="${esc(t)}">${esc(t)}</button>`).join("")}</div>
    <div class="row" style="flex-wrap:nowrap"><input id="rTopic" placeholder="Vagy írd be a saját témád…" aria-label="Saját téma"><button class="btn" id="rGo">Mehet</button></div></div>
    ${S.readLast&&S.readLast[lang()]?`<button class="btn ghost" id="rLast">Legutóbbi szöveg: ${esc(S.readLast[lang()].title)}</button>`:""}
    <div id="rOut"></div>${offlineReadsHtml()}</div>`;
  $("#rBack").onclick=()=>{route="gyakorlas";render();};
  view.querySelectorAll("[data-or]").forEach(b=>b.onclick=()=>openOfflineRead(b.dataset.or));
  view.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>makeText(b.dataset.t));
  $("#rGo").onclick=()=>{const t=$("#rTopic").value.trim();if(t)makeText(t);};
  if($("#rLast"))$("#rLast").onclick=()=>showText(S.readLast[lang()]);
}
async function makeText(topic){
  const out=$("#rOut");if(!out)return;if(out.request)out.request.cancel("stale");
  const job=createAIRequest(()=>out.isConnected&&$("#rOut")===out&&out.request===job);out.request=job;
  out.innerHTML=aiRequestBusy("Írom a szöveget ("+topic+")…","rCancel");$("#rCancel").onclick=()=>job.cancel();
  const lvl=defLevel(),len={A1:90,A2:130,B1:180,B2:230,C1:280}[lvl]||150;
  try{const d=await job.json(`Írj egy érdekes, valósághű ${LG().adj} nyelvű olvasmányt egy magyar anyanyelvű nyelvtanulónak.
Téma: ${topic}. Szint: ${LVL[lvl]||lvl}. Hossz: kb. ${len} szó, 3-4 bekezdésben.
Adj szószedetet a szövegben előforduló minden nem triviális szóhoz és kifejezéshez (legalább 30 elem), pontosan abban az alakban, ahogy a szövegben szerepel.
Csak egy JSON objektumot adj vissza:
{"title":"${LG().adj} cím","hu":"magyar cím","paragraphs":["bekezdés 1","bekezdés 2"],"glossary":[{"w":"szóalak a szövegből","base":"szótári alak","hu":"magyar jelentés ebben a szövegben"}],"questions":[{"q":"értésellenőrző kérdés magyarul","o":["válasz 1","válasz 2","válasz 3"],"a":0}]}
Pontosan 3 kérdést adj, mindegyiknél pontosan egy helyes válasszal.`,{modelTier:"default"});
    if(!job.current())return;
    if(!d||!Array.isArray(d.paragraphs)||!d.paragraphs.length)throw {code:"invalid_json"};
    const text={title:String(d.title||topic),hu:String(d.hu||""),topic,level:lvl,paragraphs:d.paragraphs.map(String),
      glossary:(Array.isArray(d.glossary)?d.glossary:[]).filter(g=>g&&g.w&&g.hu).map(g=>({w:String(g.w),base:String(g.base||g.w),hu:String(g.hu)})),
      questions:(Array.isArray(d.questions)?d.questions:[]).filter(q=>q&&q.q&&Array.isArray(q.o)&&Number.isInteger(q.a)).slice(0,3)};
    S.readLast=S.readLast||{};S.readLast[job.language]=text;incEv("read");save();showText(text);
  }catch(e){if(!job.owns())return;out.innerHTML=`<div class="notice">${esc(e&&e.code==="no_ai"?aiMissing():e&&e.code==="invalid_json"?"A szöveg formátuma nem sikerült. Próbáld újra.":aiRequestMessage(e))}</div>`;}
}
function showText(t){
  RD={t,gl:new Map()};t.glossary.forEach(g=>{RD.gl.set(norm(g.w),g);if(!RD.gl.has(norm(g.base)))RD.gl.set(norm(g.base),g);});
  const wrap=p=>esc(p).split(/(\s+)/).map(tok=>/^\s+$/.test(tok)||!tok?tok:`<span class="w" tabindex="0">${tok}</span>`).join("");
  view.innerHTML=`<div class="stack reader"><div class="row"><button class="btn ghost" id="rBack2">← Új szöveg</button></div>
    <div><span class="label">${esc(t.topic)} · ${t.level}</span><h1>${esc(t.title)}</h1><p class="muted">${esc(t.hu)}</p></div>
    <div class="card stack read-body">${t.paragraphs.map((p,i)=>`<div class="row" style="flex-wrap:nowrap;align-items:flex-start;gap:.7rem">${spkBtn(p,"sm")}<p>${wrap(p)}</p></div>`).join("")}</div>
    ${t.questions.length?`<div class="card stack"><h3>Megértetted?</h3>${t.questions.map((q,k)=>`<div class="stack" style="gap:.4rem"><b>${esc(q.q)}</b><div class="opts">${q.o.map((o,j)=>`<button class="opt" data-q="${k}" data-j="${j}">${esc(o)}</button>`).join("")}</div></div>`).join("")}</div>`:""}
    <div id="wpop" class="wpop" hidden></div></div>`;
  $("#rBack2").onclick=renderReader;
  view.querySelectorAll(".w").forEach(el=>{el.onclick=()=>lookupWord(el);el.onkeydown=e=>{if(e.key==="Enter")lookupWord(el);};});
  view.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{const q=t.questions[+b.dataset.q],j=+b.dataset.j;const grp=view.querySelectorAll(`[data-q="${b.dataset.q}"]`);
    if([...grp].some(x=>x.disabled))return;grp.forEach(x=>{x.disabled=true;if(+x.dataset.j===q.a)x.classList.add("right");else if(x===b)x.classList.add("wrong");});
    const ok=j===q.a;fx(ok?"ok":"bad");if(ok)addXP(2);});
  window.scrollTo(0,0);
}
async function lookupWord(el){
  const session=RD,l=lang(),nav=NAVN;if(!session||!el.isConnected)return;
  view.querySelectorAll(".w.sel").forEach(x=>x.classList.remove("sel"));el.classList.add("sel");
  const raw=el.textContent, key=norm(raw), pop=$("#wpop"), sentence=(session.t.paragraphs.find(p=>p.includes(raw))||"").split(/(?<=[.!?])\s+/).find(x=>x.includes(raw))||"";
  if(!pop)return;if(pop.request)pop.request.cancel("stale");const token=pop.lookupToken=(pop.lookupToken||0)+1,current=()=>RD===session&&lang()===l&&NAVN===nav&&el.isConnected&&pop.isConnected&&pop.lookupToken===token;
  let g=session.gl.get(key);
  const place=()=>{const r=el.getBoundingClientRect();pop.style.top=(r.bottom+window.scrollY+8)+"px";pop.style.left=Math.max(12,Math.min(window.innerWidth-292,r.left+window.scrollX-20))+"px";};
  const show=g=>{if(!current())return;pop.hidden=false;pop.innerHTML=`<div class="row" style="flex-wrap:nowrap">${spkBtn(g.base,"sm")}<b class="it">${esc(g.base)}</b></div><span>${esc(g.hu)}</span><div class="row"><button class="btn soft" id="wAdd" style="padding:.45rem .8rem;font-size:.85rem">+ Kártyára</button><button class="btn ghost" id="wClose" style="padding:.45rem .8rem;font-size:.85rem">Bezár</button></div>`;place();
    $("#wAdd").onclick=()=>{if(!current())return;addOwnQuiet({it:g.base,hu:g.hu,ex:sentence});pop.hidden=true;};$("#wClose").onclick=()=>{pop.lookupToken++;pop.hidden=true;el.classList.remove("sel");};say(g.base);};
  if(g)return show(g);
  pop.hidden=false;pop.innerHTML=`<span class="thinking"><i></i><i></i><i></i></span>`;place();
  const job=createAIRequest(current);pop.request=job;
  try{const r=await job.json(`Mit jelent a(z) "${raw}" ${LG().adj} szó ebben a mondatban: "${sentence}"? Csak JSON: {"base":"szótári alak","hu":"rövid magyar jelentés ebben a mondatban"}`,{modelTier:"quick"});
    if(!job.current())return;g={w:raw,base:String(r.base||raw),hu:String(r.hu||"?")};session.gl.set(key,g);show(g);}catch(e){if(job.owns())pop.innerHTML=`<span class="small">${esc(e&&e.code==="no_ai"?aiMissing():aiRequestMessage(e))}</span>`;}
}
function addOwnQuiet(w){
  if(ownList().some(x=>norm(x.it)===norm(w.it))){toast("Már a kártyáid között van.");return;}
  ownList().push(Object.assign({id:`${lang()}-own-${Date.now().toString(36)}`,alt:[]},w));save();rebuildOwn();fx("ok");toast("Felvéve a kártyáid közé: "+w.it);
}

