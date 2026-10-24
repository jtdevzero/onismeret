/* ============ AI SPEAKING EXAMINER (IELTS-style and Cambridge B2 First / C1 Advanced style) ============ */
/* Three parts like the IELTS speaking test: a short interview, a two-minute long turn from a cue card, and a discussion.
   Answers are spoken (continuous speech recognition, editable) or typed. AI feedback covers the transcript only;
   pronunciation and spoken fluency are not assessed without audio. */
/* The topics live in data/speaking-en.json: 20 IELTS sets and 6 Cambridge sets with a picture pair and a paired task.
   In the Cambridge paired task the AI plays the other candidate (a fixed fallback reply keeps it working without AI). */
let SE=null,SE_FMT="ielts";
const seSteps=set=>set.pics?[...set.p1.map(q=>({part:1,q})),{part:2,q:set.pics.q,pics:set.pics},{part:2,q:set.pics.follow},
    ...[0,1].map(t=>({part:3,q:set.collab.q,collab:set.collab,turn:t})),{part:3,q:set.collab.decide,collab:set.collab,turn:2},...set.p4.map(q=>({part:4,q}))]
  :[...set.p1.map(q=>({part:1,q})),{part:2,q:set.cue.q,say:set.cue.say},...set.p3.map(q=>({part:3,q}))];
function renderExaminer(){stopViews();withExtra("speaking",renderExaminerNow);}
function renderExaminerNow(){
  const hist=(S.spk||[]).filter(x=>x.l===lang()).slice(-5).reverse(),D=XT.speak||{ielts:[],cam:[]},cam=SE_FMT==="cam",sets=cam?D.cam:D.ielts;
  subShell(["Gyakorlás",()=>go("gyakorlas")],"Szóbeli vizsgáztató",cam?"Cambridge-jellegű szóbeli vizsga":"IELTS-jellegű szóbeli vizsga",`<span class="seg" id="seFmt"><button data-v="ielts" aria-pressed="${!cam}">IELTS</button><button data-v="cam" aria-pressed="${cam}">B2 First / C1 Advanced</button></span>
    <p class="muted">${cam?"Négyrészes, Cambridge-jellegű gyakorlás: rövid interjú, két kép összehasonlítása, páros feladat (a vizsgázótársat az AI játssza), végül vita.":"Háromrészes, IELTS-jellegű gyakorlás: rövid interjú, kétperces önálló beszéd egy témakártyáról, végül vita."} ${canSpeak()?"Mondd a válaszaidat a mikrofonba, vagy írd be őket.":"Ebben a böngészőben nincs beszédfelismerés, ezért írd be a válaszaidat úgy, ahogy mondanád."} A végén az AI az átirat szókincséről, nyelvtanáról és gondolatmenetéről ad gyakorlási visszajelzést és mintaválaszokat.</p>
    <div class="card stack"><h3>Válassz témát</h3><div class="drills">${sets.map((s,i)=>`<button class="drill" data-se="${i}">${s.pics?`<div class="row" style="gap:.3rem;flex-wrap:nowrap">${["a","b"].map(k=>`<img src="img/${s.pics[k]}.webp" alt="" loading="lazy" style="width:50%;border-radius:8px;aspect-ratio:4/3;object-fit:cover">`).join("")}</div>`:""}<b>${esc(s.t)}</b><span class="small muted">${s.pics?s.level+" · "+esc(s.collab.q):esc(s.cue.q)}</span></button>`).join("")}</div></div>
    ${hist.length?`<div class="card stack"><h3>Korábbi gyakorlási becslések</h3>${hist.map(h=>`<div class="row" style="justify-content:space-between"><span>${new Date(h.at).toLocaleDateString("hu-HU")} · ${esc(h.t)}</span><span class="pill ${(+h.band||0)>=6.5?"ok":""}">kb. ${esc(h.band)} · ${esc(h.cefr||"")}</span></div>`).join("")}</div>`:""}
    <p class="small muted">Az értékelés az átiratot használja. A kiejtést és a beszéd folyékonyságát nem méri; az esetleges sáv- és KER-becslés tájékoztató gyakorlási visszajelzés, nem vizsgaeredmény.</p>`);
  $("#seFmt").querySelectorAll("button").forEach(b=>b.onclick=()=>{SE_FMT=b.dataset.v;renderExaminerNow();});
  view.querySelectorAll("[data-se]").forEach(b=>b.onclick=()=>{const set=sets[+b.dataset.se];SE={set,cam,steps:seSteps(set),i:0,ans:[],text:"",secs:0,prep:0,res:null,partner:""};drawSE();});
}
function drawSE(){
  const st=SE.steps[SE.i];if(!st)return scoreSE();
  const partName=(SE.cam?{1:"1. rész · Interjú",2:"2. rész · Képösszehasonlítás",3:"3. rész · Páros feladat",4:"4. rész · Vita"}:{1:"1. rész · Interjú",2:"2. rész · Önálló beszéd",3:"3. rész · Vita"})[st.part];
  const pr=st.pics?`<div class="row" style="gap:.4rem;flex-wrap:nowrap">${["a","b"].map(k=>`<img src="img/${st.pics[k]}.webp" alt="${k==="a"?"Első":"Második"} kép" style="width:50%;border-radius:10px;aspect-ratio:4/3;object-fit:cover">`).join("")}</div><p class="small muted">Kb. egy percig beszélj: hasonlítsd össze a két képet, és válaszolj a kérdésre.</p>`
    :st.collab?`<div class="card stack" style="background:var(--sunk);border:0"><b ${LA()}>${esc(st.collab.q)}</b><div class="row" style="flex-wrap:wrap;gap:.35rem">${st.collab.prompts.map(x=>`<span class="pill" ${LA()}>${esc(x)}</span>`).join("")}</div>
      ${SE.partner?`<div class="feedback" role="status" style="border-left:3px solid var(--cobalt)"><b>A vizsgázótársad:</b> <span ${LA()}>${esc(SE.partner)}</span> ${spkBtn(SE.partner,"sm")}</div>`:`<p class="small muted">Beszéljétek meg a szempontokat. Te kezdesz; utána a vizsgázótársad (az AI) válaszol.</p>`}</div>`
    :st.part===2&&st.say?`<div class="card stack" style="background:var(--sunk);border:0"><b ${LA()}>${esc(st.q)}</b><span class="small" ${LA()}>You should say:</span><ul style="padding-left:1.1rem" ${LA()}>${st.say.map(x=>`<li>${esc(x)}</li>`).join("")}</ul><span class="small muted">Egy perc felkészülés (jegyzetelhetsz), aztán 1–2 percig beszélj megállás nélkül.</span><div class="row"><span class="pill now tnum" id="seClock">${SE.prep?"":"1:00"}</span><button class="btn ghost" id="sePrep">${SE.prep?"Felkészülés folyik…":"Felkészülési idő indítása"}</button></div></div>`:"";
  subShell(["Kilépés",renderExaminer],partName,"",`<div class="pbar"><div class="track"><div class="fill" style="width:${SE.i/SE.steps.length*100}%"></div></div><span class="small muted tnum">${SE.i+1}/${SE.steps.length}</span></div>
    <div class="card stack"><span class="label">A vizsgáztató kérdése</span>${st.part===2&&st.say?`<p class="muted small">Most kapsz egy témakártyát.</p>`:`<div class="big-q" style="font-size:1.35rem" ${LA()}>${esc(st.q)}</div>`}<div>${spkBtn(st.part===2?st.q:st.q)}</div></div>${pr}
    <textarea id="seText" style="min-height:${st.part===2?220:140}px" ${LA()} placeholder="${canSpeak()?"Nyomd meg a mikrofont, és beszélj. Utána javíthatod a szöveget.":"Írd ide a válaszod angolul…"}" aria-label="A válaszod">${esc(SE.text)}</textarea>
    <div class="row" style="justify-content:space-between">${canSpeak()?`<button class="btn soft" id="seMic" aria-pressed="${!!SE.recording}">${I.mic.replace("<svg",'<svg style="width:18px;height:18px"')} ${SE.recording?"Leállítás":"Beszéd"}</button>`:"<span></span>"}<span class="small muted tnum" id="seWc"></span></div>
    <button class="btn block" id="seNext">${SE.i===SE.steps.length-1?"Befejezés és értékelés":"Következő kérdés"}</button>`);
  if(!SE.spoken){SE.spoken=SE.i+1;setTimeout(()=>{if(SE&&SE.steps[SE.i]===st)say(st.q);},250);}
  const ta=$("#seText"),wc=()=>{const n=ta.value.trim()?ta.value.trim().split(/\s+/).length:0;$("#seWc").textContent=n+" szó";};ta.oninput=()=>{SE.text=ta.value;wc();};wc();
  if($("#seMic"))$("#seMic").onclick=()=>SE.recording?seStop():seStart();
  if($("#sePrep")&&!SE.prep)$("#sePrep").onclick=()=>{SE.prep=Date.now();const tick=()=>{if(!SE||!SE.prep||!$("#seClock"))return;const left=Math.max(0,60-Math.round((Date.now()-SE.prep)/1000));$("#seClock").textContent=left?`0:${String(left).padStart(2,"0")}`:"Beszélj!";if(left)setTimeout(tick,500);else fx("tap");};tick();$("#sePrep").disabled=true;};
  $("#seNext").onclick=()=>{if(SE.recording)seStop();const text=$("#seText").value.trim();if(!text){toast("Válaszolj a kérdésre, mielőtt továbblépsz.");return;}
    SE.ans.push({part:st.part,q:st.q,text,secs:Math.round(SE.secs)});SE.text="";SE.secs=0;SE.prep=0;
    if(st.collab&&st.turn<2)return sePartner(st,text);
    SE.i++;SE.spoken=0;drawSE();};
}
/* The AI plays the other candidate in the Cambridge paired task: a short reply that reacts, adds a point and hands back. */
async function sePartner(st,said){
  const cur=SE;$("#seNext").disabled=true;$("#seNext").textContent="A vizsgázótársad gondolkodik…";
  const used=cur.ans.filter(a=>a.partner).map(a=>a.text).join(" ");
  let reply="";const sample=await getSample();
  if(sample){try{const r=await sample(`Te vagy a vizsgázótársa egy magyar anyanyelvű vizsgázónak egy Cambridge ${cur.set.level==="C1"?"C1 Advanced":"B2 First"} szóbeli vizsga páros feladatában. A feladat kérdése: "${st.collab.q}" Szempontok: ${st.collab.prompts.join("; ")}.
Eddig te ezt mondtad: "${used||"(még semmit)"}"
A társad most ezt mondta: "${said}"
Válaszolj angolul, természetes beszélt nyelven, ${cur.set.level==="C1"?"C1":"B2"} szinten, 2–3 mondatban: reagálj a társad gondolatára (egyetértés vagy udvarias ellenvélemény), hozz fel egy új szempontot a listából, és a végén kérdezd meg a véleményét. Csak a választ írd le, magyarázat nélkül.`,{modelTier:"quick"});reply=String(r.text||"").replace(/^["']|["']$/g,"").trim();}catch(e){}}
  if(SE!==cur)return;
  if(!reply){const left=st.collab.prompts.filter(x=>!used.includes(x)&&!said.toLowerCase().includes(x.toLowerCase()));reply=`That's a good point. I'd also like to mention ${left[st.turn%Math.max(1,left.length)]||st.collab.prompts[0]}, because it could make a real difference. What do you think about that?`;}
  cur.partner=reply;cur.ans.push({part:3,q:st.q,text:reply,partner:true,secs:0});cur.i++;cur.spoken=0;drawSE();setTimeout(()=>{if(SE===cur)say(reply);},300);
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
  const tr=cur.ans.map(a=>a.partner?`[${a.part}. rész] A vizsgázótárs (AI) válasza: ${a.text}`:`[${a.part}. rész] Kérdés: ${a.q}\nVálasz${a.secs>5?` (beszéd, ${a.secs} mp)`:" (beírva)"}: ${a.text}`).join("\n\n");
  const prompt=cur.cam?seCamPrompt(cur,tr,wpm):`Tapasztalt IELTS szóbeli vizsgáztatóként értékeld egy magyar anyanyelvű vizsgázó szóbeli vizsgáját. A válaszok átiratát látod (beszédfelismerés vagy beírás).
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
    const band=parseFloat(r.band)||0;S.spk=S.spk||[];S.spk.push({at:Date.now(),l:lang(),t:SE.set.t,fmt:cur.cam?"cam":"ielts",band:String(r.band||""),cefr:String(r.cefr||""),basis:"transcript"});if(S.spk.length>60)S.spk.splice(0,S.spk.length-60);
    (Array.isArray(r.errors)?r.errors:[]).slice(0,8).forEach(e=>logMiss("examiner",e.wrong,e.wrong,e.right+" – "+(e.why||"")));
    /* Transcript feedback does not establish a measured speaking skill level. */
    incEv("drills");drillStat("examiner",cur.cam?(+(r.scores||{}).lexical||0)>=3:band>=6.5);addXP(15);save();
    if($("#seRes"))$("#seRes").innerHTML=seHtml(r,cur.cam);}
  catch(e){if(SE!==cur)return;if($("#seRes"))$("#seRes").innerHTML=`<div class="notice">${esc(aiErr(e))}</div><button class="btn" id="seRetry">Újra</button>`;if($("#seRetry"))$("#seRetry").onclick=scoreSE;}
}
function seCamPrompt(cur,tr,wpm){
  const lv=cur.set.level==="C1"?"C1 Advanced":"B2 First";
  return `Tapasztalt Cambridge szóbeli vizsgáztatóként (${lv}) értékeld egy magyar anyanyelvű vizsgázó szóbeli vizsgáját. A válaszok átiratát látod (beszédfelismerés vagy beírás); a páros feladatban a vizsgázótársat az AI játszotta, az ő mondatait ne értékeld.
Téma: ${cur.set.t}
${wpm?`Mért beszédtempó a kimondott válaszoknál: kb. ${wpm} szó/perc (csak tájékoztató adat).`:"A válaszokat a vizsgázó beírta, tempót nem mértünk."}

${tr}

Adj tájékoztató gyakorlási becslést 0–5-ös skálán a Cambridge-szempontok közül azokra, amelyek az átiratból megítélhetők: Grammar and Vocabulary (a lexical mezőben a szókincs, a grammar mezőben a nyelvtan), Discourse Management (fluency mező: gondolatmenet, kifejtettség, kötőszavak), Interactive Communication (interactive mező: reagál-e a társára, kérdez-e, jut-e döntésre). A kiejtést nem hallod: a pronunciation értéke mindig null.
A cefr mezőben durva, tájékoztató becslés legyen (B1 / B2 / C1 / C2); ne nevezd hivatalos eredménynek. A band mező maradjon üres.
Minden szemponthoz 1–2 mondatos, konkrét magyar indoklás. Sorold fel a legfontosabb nyelvi hibákat (legfeljebb 8). Válassz ki két választ, és írj rájuk ${cur.set.level}-es szintű mintaválaszt angolul.
Csak egy JSON objektumot adj vissza:
{"band":"","cefr":"B2","scores":{"fluency":3,"lexical":3,"grammar":3,"interactive":3,"pronunciation":null},"comments":{"fluency":"","lexical":"","grammar":"","interactive":"","pronunciation":""},"summary":"2-3 mondat magyarul","strengths":["legfeljebb 3 erősség magyarul"],"errors":[{"wrong":"","right":"","why":""}],"better":[{"q":"a kérdés","answer":"mintaválasz angolul"}],"tip":"egy konkrét tipp magyarul"}`;
}
const SE_CRIT=[["fluency","A szöveg koherenciája"],["lexical","Szókincs"],["grammar","Nyelvtani változatosság és pontosság"],["pronunciation","Kiejtés"]];
const SE_CRIT_CAM=[["lexical","Szókincs (Grammar and Vocabulary)"],["grammar","Nyelvtan (Grammar and Vocabulary)"],["fluency","Gondolatmenet (Discourse Management)"],["interactive","Interakció (Interactive Communication)"],["pronunciation","Kiejtés"]];
function seHtml(r,cam){
  const max=cam?5:9,crit=cam?SE_CRIT_CAM:SE_CRIT;
  const sc=r.scores||{},cm=r.comments||{},errs=Array.isArray(r.errors)?r.errors:[],better=Array.isArray(r.better)?r.better:[];
  return `<div class="stack"><div class="card"><div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))"><div class="stat"><span class="label">${cam?"Vizsga":"Becsült nyelvi sáv"}</span><b class="tnum">${cam?"Cambridge":r.band?"kb. "+esc(r.band):"–"}</b></div><div class="stat"><span class="label">Tájékoztató KER-becslés</span><b>${esc(r.cefr||"–")}</b></div></div><p class="small muted" style="margin-top:.8rem">Az átirat nyelvhasználatának AI-becslése, nem hivatalos ${cam?"Cambridge":"IELTS"}- vagy KER-eredmény. A tényleges beszédfolyékonyságot és a kiejtést nem értékeli.</p>${r.summary?`<p style="margin-top:.8rem">${esc(r.summary)}</p>`:""}</div>
  <div class="card stack">${crit.map(([k,l])=>{const v=k==="pronunciation"?null:sc[k];if(k==="pronunciation")return `<div><b>${l}</b><p class="small muted">Hanganyag nélkül nem értékelhető.</p></div>`;return `<div><div class="row" style="justify-content:space-between"><b>${l}</b><span class="pill ${(+v||0)>=max*0.75?"ok":(+v||0)&&(+v)<max*0.6?"bad":""}">${v==null?"–":esc(v)} / ${max}</span></div><div class="meter"><i style="width:${(+v||0)/max*100}%"></i></div><p class="small muted">${esc(cm[k]||"")}</p></div>`;}).join("")}</div>
  ${Array.isArray(r.strengths)&&r.strengths.length?`<div class="card stack"><h3>Erősségek</h3><ul style="padding-left:1.1rem">${r.strengths.map(s=>`<li>${esc(s)}</li>`).join("")}</ul></div>`:""}
  ${errs.length?`<div class="card stack"><h3>Hibák (${errs.length})</h3><div class="err-list">${errs.map(e=>`<div><s ${LA()}>${esc(e.wrong)}</s> → <ins ${LA()}>${esc(e.right)}</ins><div class="small muted">${esc(e.why)}</div></div>`).join("")}</div></div>`:""}
  ${better.map(b=>`<div class="card stack"><span class="label">Mintaválasz</span><b ${LA()}>${esc(b.q)}</b><p class="prewrap" ${LA()}>${esc(b.answer)}</p>${spkBtn(String(b.answer||""))}</div>`).join("")}
  ${r.tip?`<div class="notice"><b>Tipp:</b> ${esc(r.tip)}</div>`:""}<button class="btn" data-go="gyakorlas">Kész</button></div>`;
}
