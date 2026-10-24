/* ============ AI SPEAKING EXAMINER (IELTS-style, B2–C1) ============ */
/* Three parts like the IELTS speaking test: a short interview, a two-minute long turn from a cue card, and a discussion.
   Answers are spoken (continuous speech recognition, editable) or typed. AI feedback covers the transcript only;
   pronunciation and spoken fluency are not assessed without audio. */
const SE_SETS=[
  {t:"Home and free time",p1:["Do you live in a house or a flat?","What do you like most about the area where you live?","What do you usually do at the weekend?","Have your free-time activities changed since you were a child?"],
   cue:{q:"Describe a place in your town or city where you like to spend time.",say:["where it is","how often you go there","what you do there","and explain why you like it"]},
   p3:["Why do some people prefer to spend their free time at home?","How have cities changed in the way they provide spaces for young people?","Should local governments spend more money on parks and public spaces? Why?"]},
  {t:"Work and study",p1:["Do you work or are you a student?","What do you find most interesting about your work or studies?","Would you like to change anything about your daily routine?","Do you prefer working alone or with other people?"],
   cue:{q:"Describe a skill you learned that has been useful to you.",say:["what the skill is","when and how you learned it","how difficult it was","and explain why it has been useful"]},
   p3:["Which skills will be most important for young people in the future?","Is it better to learn a skill from a teacher or by yourself online?","Should schools focus more on practical skills than on academic subjects?"]},
  {t:"Travel",p1:["Do you enjoy travelling?","What kind of places do you like to visit?","How do you usually travel when you go on holiday?","Is there a country you would really like to visit? Why?"],
   cue:{q:"Describe a journey you remember well.",say:["where you went","who you travelled with","what happened during the journey","and explain why you remember it so well"]},
   p3:["How has tourism changed in the last twenty years?","What problems can mass tourism cause for local people?","Do you think people will travel more or less in the future? Why?"]},
  {t:"Technology",p1:["How often do you use your phone during the day?","What apps do you use most?","Did you use computers a lot when you were at school?","Is there any technology you would find it hard to live without?"],
   cue:{q:"Describe a piece of technology that has changed your life.",say:["what it is","when you started using it","how you use it","and explain how it has changed your life"]},
   p3:["Do you think people spend too much time on their phones?","How has technology changed the way families communicate?","Should children's use of technology be limited? Who should decide?"]},
  {t:"Food and health",p1:["What kind of food do you like?","Do you prefer eating at home or in restaurants?","Did you eat differently when you were a child?","Do you think you have a healthy lifestyle?"],
   cue:{q:"Describe a meal you enjoyed with other people.",say:["where you had it","who you were with","what you ate","and explain why you enjoyed it"]},
   p3:["Why do many people find it hard to eat healthily?","Should governments tax unhealthy food?","How important is it for families to eat together?"]},
  {t:"People and relationships",p1:["Do you have a large family?","Who are you closest to in your family?","How often do you meet your friends?","Do you prefer to have a few close friends or many friends?"],
   cue:{q:"Describe a person who has influenced you.",say:["who the person is","how you know them","what they are like","and explain how they have influenced you"]},
   p3:["What qualities make someone a good role model?","Do young people today have different role models from those of their parents?","Is it easier or harder to make friends as an adult?"]}
];
let SE=null;
const seSteps=set=>[...set.p1.map(q=>({part:1,q})),{part:2,q:set.cue.q,say:set.cue.say},...set.p3.map(q=>({part:3,q}))];
function renderExaminer(){
  stopViews();const hist=(S.spk||[]).filter(x=>x.l===lang()).slice(-5).reverse();
  subShell(["Gyakorlás",()=>go("gyakorlas")],"Szóbeli vizsgáztató","IELTS-jellegű szóbeli vizsga",`<p class="muted">Háromrészes, IELTS-jellegű gyakorlás: rövid interjú, kétperces önálló beszéd egy témakártyáról, végül vita. ${canSpeak()?"Mondd a válaszaidat a mikrofonba, vagy írd be őket.":"Ebben a böngészőben nincs beszédfelismerés, ezért írd be a válaszaidat úgy, ahogy mondanád."} A végén az AI az átirat szókincséről, nyelvtanáról és gondolatmenetéről ad gyakorlási visszajelzést és mintaválaszokat.</p>
    <div class="card stack"><h3>Válassz témát</h3><div class="drills">${SE_SETS.map((s,i)=>`<button class="drill" data-se="${i}"><b>${esc(s.t)}</b><span class="small muted">${esc(s.cue.q)}</span></button>`).join("")}</div></div>
    ${hist.length?`<div class="card stack"><h3>Korábbi gyakorlási becslések</h3>${hist.map(h=>`<div class="row" style="justify-content:space-between"><span>${new Date(h.at).toLocaleDateString("hu-HU")} · ${esc(h.t)}</span><span class="pill ${(+h.band||0)>=6.5?"ok":""}">kb. ${esc(h.band)} · ${esc(h.cefr||"")}</span></div>`).join("")}</div>`:""}
    <p class="small muted">Az értékelés az átiratot használja. A kiejtést és a beszéd folyékonyságát nem méri; az esetleges sáv- és KER-becslés tájékoztató gyakorlási visszajelzés, nem vizsgaeredmény.</p>`);
  view.querySelectorAll("[data-se]").forEach(b=>b.onclick=()=>{const set=SE_SETS[+b.dataset.se];SE={set,steps:seSteps(set),i:0,ans:[],text:"",secs:0,prep:0,res:null};drawSE();});
}
function drawSE(){
  const st=SE.steps[SE.i];if(!st)return scoreSE();
  const partName={1:"1. rész · Interjú",2:"2. rész · Önálló beszéd",3:"3. rész · Vita"}[st.part];
  const pr=st.part===2?`<div class="card stack" style="background:var(--sunk);border:0"><b ${LA()}>${esc(st.q)}</b><span class="small" ${LA()}>You should say:</span><ul style="padding-left:1.1rem" ${LA()}>${st.say.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><span class="small muted">Egy perc felkészülés (jegyzetelhetsz), aztán 1–2 percig beszélj megállás nélkül.</span><div class="row"><span class="pill now tnum" id="seClock">${SE.prep?"":"1:00"}</span><button class="btn ghost" id="sePrep">${SE.prep?"Felkészülés folyik…":"Felkészülési idő indítása"}</button></div></div>`:"";
  subShell(["Kilépés",renderExaminer],partName,"",`<div class="pbar"><div class="track"><div class="fill" style="width:${SE.i/SE.steps.length*100}%"></div></div><span class="small muted tnum">${SE.i+1}/${SE.steps.length}</span></div>
    <div class="card stack"><span class="label">A vizsgáztató kérdése</span>${st.part===2?`<p class="muted small">Most kapsz egy témakártyát.</p>`:`<div class="big-q" style="font-size:1.35rem" ${LA()}>${esc(st.q)}</div>`}<div>${spkBtn(st.part===2?st.q:st.q)}</div></div>${pr}
    <textarea id="seText" style="min-height:${st.part===2?220:140}px" ${LA()} placeholder="${canSpeak()?"Nyomd meg a mikrofont, és beszélj. Utána javíthatod a szöveget.":"Írd ide a válaszod angolul…"}" aria-label="A válaszod">${esc(SE.text)}</textarea>
    <div class="row" style="justify-content:space-between">${canSpeak()?`<button class="btn soft" id="seMic" aria-pressed="${!!SE.recording}">${I.mic.replace("<svg",'<svg style="width:18px;height:18px"')} ${SE.recording?"Leállítás":"Beszéd"}</button>`:"<span></span>"}<span class="small muted tnum" id="seWc"></span></div>
    <button class="btn block" id="seNext">${SE.i===SE.steps.length-1?"Befejezés és értékelés":"Következő kérdés"}</button>`);
  if(!SE.spoken){SE.spoken=SE.i+1;setTimeout(()=>{if(SE&&SE.steps[SE.i]===st)say(st.q);},250);}
  const ta=$("#seText"),wc=()=>{const n=ta.value.trim()?ta.value.trim().split(/\s+/).length:0;$("#seWc").textContent=n+" szó";};ta.oninput=()=>{SE.text=ta.value;wc();};wc();
  if($("#seMic"))$("#seMic").onclick=()=>SE.recording?seStop():seStart();
  if($("#sePrep")&&!SE.prep)$("#sePrep").onclick=()=>{SE.prep=Date.now();const tick=()=>{if(!SE||!SE.prep||!$("#seClock"))return;const left=Math.max(0,60-Math.round((Date.now()-SE.prep)/1000));$("#seClock").textContent=left?`0:${String(left).padStart(2,"0")}`:"Beszélj!";if(left)setTimeout(tick,500);else fx("tap");};tick();$("#sePrep").disabled=true;};
  $("#seNext").onclick=()=>{if(SE.recording)seStop();const text=$("#seText").value.trim();if(!text){toast("Válaszolj a kérdésre, mielőtt továbblépsz.");return;}
    SE.ans.push({part:st.part,q:st.q,text,secs:Math.round(SE.secs)});SE.text="";SE.secs=0;SE.prep=0;SE.i++;SE.spoken=0;drawSE();};
}
function seStart(){
  const SRC=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SRC)return;
  const r=new SRC();r.lang=LG().tts;r.continuous=true;r.interimResults=true;r.maxAlternatives=1;
  const base=($("#seText")?$("#seText").value.trim():SE.text);let got=false;
  SE.rec=r;SE.recording=true;SE.t0=Date.now();try{player.pause();speechSynthesis.cancel();}catch(e){}
  r.onresult=e=>{if(!SE||SE.rec!==r)return;got=true;let fin="",int="";for(const res of e.results){if(res.isFinal===false)int+=res[0].transcript;else fin+=res[0].transcript+" ";}
    SE.text=((base?base+" ":"")+fin).replace(/\s+/g," ").trim();const ta=$("#seText");if(ta){ta.value=SE.text+(int?" "+int.trim():"");ta.dispatchEvent(new Event("input"));}};
  r.onerror=e=>{if(e.error!=="no-speech"&&e.error!=="aborted")toast(micMsg(e.error));};
  r.onend=()=>{if(!SE||SE.rec!==r)return;if(SE.recording&&got){SE.secs+=(Date.now()-SE.t0)/1000;return seStart();}seStop(true);};
  try{r.start();}catch(e){SE.recording=false;}
  const b=$("#seMic");if(b){b.setAttribute("aria-pressed","true");b.lastChild.textContent=" Leállítás";}
}
function seStop(ended){
  if(!SE)return;const r=SE.rec;SE.rec=null;if(SE.recording)SE.secs+=(Date.now()-SE.t0)/1000;SE.recording=false;
  if(r&&!ended)try{r.stop();}catch(e){}
  const b=$("#seMic");if(b){b.setAttribute("aria-pressed","false");b.lastChild.textContent=" Beszéd";}
}
async function scoreSE(){
  const cur=SE;if(!cur)return;const back=["Szóbeli vizsgáztató",renderExaminer];
  subShell(back,"Szóbeli vizsgáztató","Értékelés",`<div id="seRes"><div class="card row"><span class="thinking"><i></i><i></i><i></i></span><span class="muted">A vizsgáztató értékel…</span></div></div>`);
  const sample=await getSample();if(SE!==cur)return;if(!sample){$("#seRes").innerHTML=`<div class="notice">${aiMissing()}</div>`;return;}
  const spoken=cur.ans.filter(a=>a.secs>5),words=spoken.reduce((n,a)=>n+a.text.split(/\s+/).length,0),secs=spoken.reduce((n,a)=>n+a.secs,0),wpm=secs?Math.round(words/secs*60):null;
  const tr=cur.ans.map(a=>`[${a.part}. rész] Kérdés: ${a.q}\nVálasz${a.secs>5?` (beszéd, ${a.secs} mp)`:" (beírva)"}: ${a.text}`).join("\n\n");
  const prompt=`Tapasztalt IELTS szóbeli vizsgáztatóként értékeld egy magyar anyanyelvű vizsgázó szóbeli vizsgáját. A válaszok átiratát látod (beszédfelismerés vagy beírás).
Téma: ${cur.set.t}
${wpm?`Mért beszédtempó a kimondott válaszoknál: kb. ${wpm} szó/perc.`:"A válaszokat a vizsgázó beírta, tempót nem mértünk."}

${tr}

Adj tájékoztató nyelvi gyakorlási becslést 0–9-es skálán a szöveg gondolatmenetéről (a fluency mezőben csak koherencia), szókincséről és nyelvtanáról. Nem látod és nem hallod az eredeti hangot: a kiejtést, hangsúlyt, intonációt, szüneteket és tényleges beszédfolyékonyságot nem értékelheted. A pronunciation értéke mindig null legyen, magyarázata: „Hanganyag nélkül nem értékelhető.” A hibás átirat nem bizonyít kiejtési hibát. A közölt szó/perc csak tájékoztató adat, önmagában nem minősíti a folyékonyságot.
Az összesített band és cefr kizárólag az átirat nyelvhasználatának durva becslése; ne nevezd hivatalos IELTS-pontszámnak vagy megállapított KER-szintnek. Kevés vagy nem értékelhető szövegnél hagyd őket üresen.
Minden szemponthoz 1–2 mondatos, konkrét magyar indoklás. Sorold fel a legfontosabb nyelvi hibákat (legfeljebb 8). Válassz ki két választ, és írj rájuk természetesebb, részletesebb mintaválaszt angolul.
Csak egy JSON objektumot adj vissza:
{"band":"6.5","cefr":"B2","scores":{"fluency":6.5,"lexical":6,"grammar":6,"pronunciation":null},"comments":{"fluency":"","lexical":"","grammar":"","pronunciation":""},"summary":"2-3 mondat magyarul","strengths":["legfeljebb 3 erősség magyarul"],"errors":[{"wrong":"","right":"","why":""}],"better":[{"q":"a kérdés","answer":"mintaválasz angolul"}],"tip":"egy konkrét tipp magyarul"}`;
  try{const r=await sample.json(prompt,{modelTier:"default"});if(SE!==cur)return;
    r.scores=Object.assign({},r.scores,{pronunciation:null});r.comments=Object.assign({},r.comments,{pronunciation:"Hanganyag nélkül nem értékelhető."});SE.res=r;
    const band=parseFloat(r.band)||0;S.spk=S.spk||[];S.spk.push({at:Date.now(),l:lang(),t:SE.set.t,band:String(r.band||""),cefr:String(r.cefr||""),basis:"transcript"});if(S.spk.length>60)S.spk.splice(0,S.spk.length-60);
    (Array.isArray(r.errors)?r.errors:[]).slice(0,8).forEach(e=>logMiss("examiner",e.wrong,e.wrong,e.right+" – "+(e.why||"")));
    /* Transcript feedback does not establish a measured speaking skill level. */
    incEv("drills");drillStat("examiner",band>=6.5);addXP(15);save();
    if($("#seRes"))$("#seRes").innerHTML=seHtml(r);}
  catch(e){if(SE!==cur)return;if($("#seRes"))$("#seRes").innerHTML=`<div class="notice">${esc(aiErr(e))}</div><button class="btn" id="seRetry">Újra</button>`;if($("#seRetry"))$("#seRetry").onclick=scoreSE;}
}
const SE_CRIT=[["fluency","A szöveg koherenciája"],["lexical","Szókincs"],["grammar","Nyelvtani változatosság és pontosság"],["pronunciation","Kiejtés"]];
function seHtml(r){
  const sc=r.scores||{},cm=r.comments||{},errs=Array.isArray(r.errors)?r.errors:[],better=Array.isArray(r.better)?r.better:[];
  return `<div class="stack"><div class="card"><div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="stat"><span class="label">Becsült nyelvi sáv</span><b class="tnum">${r.band?"kb. "+esc(r.band):"–"}</b></div><div class="stat"><span class="label">Tájékoztató KER-becslés</span><b>${esc(r.cefr||"–")}</b></div></div><p class="small muted" style="margin-top:.8rem">Az átirat nyelvhasználatának AI-becslése, nem hivatalos IELTS- vagy KER-eredmény. A tényleges beszédfolyékonyságot és a kiejtést nem értékeli.</p>${r.summary?`<p style="margin-top:.8rem">${esc(r.summary)}</p>`:""}</div>
  <div class="card stack">${SE_CRIT.map(([k,l])=>{const v=k==="pronunciation"?null:sc[k];if(k==="pronunciation")return `<div><b>${l}</b><p class="small muted">Hanganyag nélkül nem értékelhető.</p></div>`;return `<div><div class="row" style="justify-content:space-between"><b>${l}</b><span class="pill ${(+v||0)>=7?"ok":(+v||0)&&(+v)<5.5?"bad":""}">${v==null?"–":esc(v)} / 9</span></div><div class="meter"><i style="width:${(+v||0)/9*100}%"></i></div><p class="small muted">${esc(cm[k]||"")}</p></div>`;}).join("")}</div>
  ${Array.isArray(r.strengths)&&r.strengths.length?`<div class="card stack"><h3>Erősségek</h3><ul style="padding-left:1.1rem">${r.strengths.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div>`:""}
  ${errs.length?`<div class="card stack"><h3>Hibák (${errs.length})</h3><div class="err-list">${errs.map(e=>`<div><s ${LA()}>${esc(e.wrong)}</s> → <ins ${LA()}>${esc(e.right)}</ins><div class="small muted">${esc(e.why)}</div></div>`).join("")}</div></div>`:""}
  ${better.map(b=>`<div class="card stack"><span class="label">Mintaválasz</span><b ${LA()}>${esc(b.q)}</b><p class="prewrap" ${LA()}>${esc(b.answer)}</p>${spkBtn(String(b.answer||""))}</div>`).join("")}
  ${r.tip?`<div class="notice"><b>Tipp:</b> ${esc(r.tip)}</div>`:""}<button class="btn" data-go="gyakorlas">Kész</button></div>`;
}
