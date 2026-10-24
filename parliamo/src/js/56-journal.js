/* ============ JOURNAL WITH AI CORRECTION ============ */
/* A short daily entry in the target language. The AI corrects it, explains the mistakes in Hungarian and suggests a
   more natural version; the mistakes go to the mistake log and can become flashcards. */
let JR=null;
const JR_PROMPTS=["What did you do yesterday? Describe your day.","Describe something that made you smile this week.","What are your plans for the weekend?","Write about a place you would like to visit and why.","What is the best thing you have learned recently?","Describe a person you spoke to today.","What would you do if you had a free day tomorrow?","Write about a problem you solved recently.","What is your favourite way to relax, and why?","Describe your ideal job.","What did you eat today? Was it healthy?","Write about a film, book or series you enjoyed.","What habit would you like to change, and how?","Describe the weather today and how it affects your mood.","What was the most difficult part of your week?","If you could live in another country for a year, where would you go?","Write about a childhood memory.","What do you like and dislike about your town?","Describe a skill you would like to learn.","What advice would you give to your younger self?"];
const jrList=()=>(S.journal||(S.journal=[])).filter(e=>e.l===lang());
function renderJournal(keep){
  if(!keep)stopViews();const list=jrList(),t=today(),done=list.some(e=>e.d===t);
  JR=JR||{text:"",res:null,prompt:JR_PROMPTS[t%JR_PROMPTS.length]};
  let streak=0;for(let d=t-(done?0:1);list.some(e=>e.d===d);d--)streak++;
  subShell(["Gyakorlás",()=>go("gyakorlas")],"Napló","Napi bejegyzés",`<p class="muted">Írj pár mondatot ${LG().adv} a napodról vagy a mai témáról. Az AI kijavítja, magyarul elmagyarázza a hibákat, és megmutatja, hogyan mondaná egy anyanyelvi. A hibáid bekerülnek a havi hibaelemzésbe, és egy gombbal kártyát csinálhatsz belőlük.</p>
    <div class="card"><div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="stat"><span class="label">Bejegyzések</span><b class="tnum">${list.length}</b></div><div class="stat"><span class="label">Napok sorozatban</span><b class="tnum">${streak}</b></div></div></div>
    <div class="card stack"><span class="label">Mai téma (nem kötelező)</span><p ${LA()}>${esc(JR.prompt)}</p><div><button class="btn ghost" id="jrOther">Másik téma</button></div></div>
    <textarea id="jrText" style="min-height:200px" ${LA()} placeholder="${LG().write}" aria-label="Napló ${LG().adv}">${esc(JR.text)}</textarea>
    <div class="row" style="justify-content:space-between"><span class="small muted tnum" id="jrWc"></span><button class="btn" id="jrSend">Javítást kérek</button></div>
    <div id="jrRes">${JR.res?jrHtml(JR.res,JR.text):""}</div>
    ${list.length?`<div class="sec-head"><h2>Korábbi bejegyzések</h2></div>${list.slice(-10).reverse().map(e=>`<details class="g"><summary>${new Date(e.at).toLocaleDateString("hu-HU")} · ${e.n||0} hiba${e.lv?" · "+esc(e.lv):""}</summary><div class="gb stack"><p class="prewrap" ${LA()}>${esc(e.fixed||e.text)}</p>${(e.errs||[]).length?`<div class="err-list">${e.errs.map(x=>`<div><s ${LA()}>${esc(x.wrong)}</s> → <ins ${LA()}>${esc(x.right)}</ins></div>`).join("")}</div>`:""}</div></details>`).join("")}`:""}`);
  const ta=$("#jrText"),wc=()=>{const n=ta.value.trim()?ta.value.trim().split(/\s+/).length:0;$("#jrWc").textContent=n+" szó";};ta.oninput=()=>{JR.text=ta.value;wc();};wc();
  $("#jrOther").onclick=()=>{JR.prompt=rnd(JR_PROMPTS.filter(p=>p!==JR.prompt));renderJournal(true);};
  $("#jrSend").onclick=sendJournal;bindJrCards();
}
async function sendJournal(){
  const text=$("#jrText").value.trim();if(text.split(/\s+/).length<15){toast("Írj legalább 15 szót.");return;}
  const sample=await getSample();if(!sample){$("#jrRes").innerHTML=`<div class="notice">${aiMissing()}</div>`;return;}
  $("#jrSend").disabled=true;$("#jrRes").innerHTML=`<div class="card row"><span class="thinking"><i></i><i></i><i></i></span><span class="muted">A tanár javítja a naplódat…</span></div>`;
  const prompt=`${LG().teacher[0].toUpperCase()+LG().teacher.slice(1)}ként javítsd ki egy magyar anyanyelvű tanuló ${LG().adv} írt naplóbejegyzését. Légy pontos, de bátorító.
A bejegyzés:
"""${text}"""

Javítsd ki a nyelvtani, szóhasználati és helyesírási hibákat úgy, hogy a tanuló mondanivalója megmaradjon. Minden hibát külön sorolj fel rövid magyar magyarázattal (legfeljebb 10). Írj egy természetesebb, anyanyelvi változatot is ugyanarról. Becsüld meg a szöveg szintjét (A1–C2). Adj 3 hasznos ${LG().adj} kifejezést, ami ehhez a témához illik.
Csak egy JSON objektumot adj vissza:
{"corrected":"a kijavított szöveg","errors":[{"wrong":"hibás rész","right":"javított rész","why":"rövid magyar magyarázat"}],"natural":"természetesebb változat","level":"B1","praise":"egy mondat dicséret magyarul","tip":"egy konkrét tipp magyarul","words":[{"it":"kifejezés","hu":"jelentés"}]}`;
  try{const r=await sample.json(prompt,{modelTier:"default"});if(!JR)return;
    const errs=(Array.isArray(r.errors)?r.errors:[]).filter(e=>e&&e.wrong&&e.right).slice(0,10).map(e=>({wrong:String(e.wrong),right:String(e.right),why:String(e.why||"")}));r.errors=errs;
    JR.res=r;S.journal=S.journal||[];S.journal.push({at:Date.now(),d:today(),l:lang(),text,fixed:String(r.corrected||""),errs:errs.map(e=>({wrong:e.wrong,right:e.right})),n:errs.length,lv:String(r.level||"")});if(S.journal.length>120)S.journal.splice(0,S.journal.length-120);
    errs.forEach(e=>logMiss("journal",e.wrong,e.wrong,e.right+" – "+e.why));
    const words=text.split(/\s+/).length;if(r.level)skillLog("write",String(r.level),Math.max(30,85-errs.length/words*400),"journal");
    incEv("drills");addXP(8);save();if($("#jrRes")){$("#jrRes").innerHTML=jrHtml(r,text);bindJrCards();}}
  catch(e){if($("#jrRes"))$("#jrRes").innerHTML=`<div class="notice">${esc(aiErr(e))}</div>`;}
  if($("#jrSend"))$("#jrSend").disabled=false;
}
function jrHtml(r,text){
  const errs=r.errors||[],words=Array.isArray(r.words)?r.words.filter(w=>w&&w.it):[];
  return `<div class="stack"><div class="card stack"><div class="row" style="justify-content:space-between"><h3>Javított szöveg</h3><span class="pill">${esc(r.level||"")} · ${errs.length} hiba</span></div><p class="prewrap" ${LA()}>${esc(r.corrected||text)}</p>${r.praise?`<p class="small">${esc(r.praise)}</p>`:""}</div>
    ${errs.length?`<div class="card stack"><h3>Hibák</h3><div class="err-list">${errs.map(e=>`<div><s ${LA()}>${esc(e.wrong)}</s> → <ins ${LA()}>${esc(e.right)}</ins><div class="small muted">${esc(e.why)}</div></div>`).join("")}</div><button class="btn soft" id="jrCards">A javítások kártyára (${errs.length})</button></div>`:""}
    ${r.natural?`<div class="card stack"><h3>Így mondaná egy anyanyelvi</h3><p class="prewrap" ${LA()}>${esc(r.natural)}</p></div>`:""}
    ${words.length?`<div class="card stack"><h3>Hasznos kifejezések</h3>${words.map(w=>`<div class="dict-row">${spkBtn(String(w.it),"sm")}<div style="min-width:0"><div class="it" ${LA()}>${esc(w.it)}</div><div class="small muted">${esc(w.hu)}</div></div><button class="btn ghost" data-jw="${esc(w.it)}" data-jh="${esc(w.hu)}" style="padding:.35rem .6rem;font-size:.8rem">+ Kártya</button></div>`).join("")}</div>`:""}
    ${r.tip?`<div class="notice"><b>Tipp:</b> ${esc(r.tip)}</div>`:""}</div>`;
}
function bindJrCards(){
  const add=(it,hu,note)=>{if(ownList().some(x=>norm(x.it)===norm(it)))return 0;ownList().push({id:`${lang()}-own-${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`,it,hu,alt:[],note});return 1;};
  if($("#jrCards"))$("#jrCards").onclick=()=>{const errs=(JR&&JR.res&&JR.res.errors)||[];let n=0;errs.forEach(e=>{n+=add(e.right,e.why?e.why.slice(0,80):"javítás: "+e.wrong,"Napló");});save();rebuildOwn();fx("ok");toast(n?n+" javítás felvéve a kártyák közé.":"Ezek már a kártyáid között vannak.");$("#jrCards").disabled=true;};
  view.querySelectorAll("[data-jw]").forEach(b=>b.onclick=()=>{const n=add(b.dataset.jw,b.dataset.jh,"Napló");save();rebuildOwn();toast(n?"Felvéve: "+b.dataset.jw:"Már a kártyáid között van.");b.disabled=true;});
}
