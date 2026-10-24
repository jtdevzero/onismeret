/* ============ LESSONS FROM YOUR OWN TEXT ============ */
/* The learner pastes an article, e-mail or song text; the AI picks the expressions worth learning at the learner's level and
   builds a gap-fill from sentences of the text. Lessons are kept (the last ten per account) and can be reopened. */
let IMP=null;
const impList=()=>(S.imp||(S.imp=[])).filter(x=>x.l===lang());
function renderImport(keep){
  if(!keep)stopViews();IMP=IMP||{text:""};const list=impList().slice(-10).reverse();
  subShell(["Gyakorlás",()=>go("gyakorlas")],"Saját szövegből lecke","Bármilyen szövegből",`<p class="muted">Másolj be egy ${LG().adj} cikket, e-mailt, dalszöveget vagy bármit, amit olvasni szeretnél (legfeljebb kb. 600 szó). Az AI kiválogatja belőle a ${defLevel()} szintedhez illő új kifejezéseket, és a szöveg mondataiból lyukas gyakorlót készít.</p>
    <textarea id="impText" style="min-height:220px" ${LA()} placeholder="Ide másold a szöveget…" aria-label="A szöveg ${LG().adv}">${esc(IMP.text)}</textarea>
    <div class="row" style="justify-content:space-between"><span class="small muted tnum" id="impWc"></span><button class="btn" id="impGo">Lecke készítése</button></div><div id="impMsg"></div>
    ${list.length?`<div class="sec-head"><h2>Korábbi leckéid</h2></div><div class="drills">${list.map(x=>`<button class="drill" data-imp="${x.at}"><b ${LA()}>${esc(x.title)}</b><span class="small muted">${new Date(x.at).toLocaleDateString("hu-HU")} · ${x.words.length} kifejezés · ${x.cloze.length} kérdés</span></button>`).join("")}</div>`:""}`);
  const ta=$("#impText"),wc=()=>{const n=ta.value.trim()?ta.value.trim().split(/\s+/).length:0;$("#impWc").textContent=n+" szó";};ta.oninput=()=>{IMP.text=ta.value;wc();};wc();
  $("#impGo").onclick=makeImport;
  view.querySelectorAll("[data-imp]").forEach(b=>b.onclick=()=>{const x=impList().find(y=>String(y.at)===b.dataset.imp);if(x)openImport(x);});
}
async function makeImport(){
  const text=$("#impText").value.trim(),n=text.split(/\s+/).length;
  if(n<40){toast("Legalább 40 szavas szöveg kell.");return;}if(n>800){toast("Ez túl hosszú. Legfeljebb kb. 600 szót másolj be.");return;}
  const sample=await getSample();if(!sample){$("#impMsg").innerHTML=`<div class="notice">${aiMissing()}</div>`;return;}
  $("#impGo").disabled=true;$("#impMsg").innerHTML=`<div class="card row"><span class="thinking"><i></i><i></i><i></i></span><span class="muted">Készül a lecke…</span></div>`;
  const prompt=`Egy magyar anyanyelvű, ${defLevel()} szintű ${LG().adj} nyelvtanuló leckét szeretne készíteni a saját szövegéből. A szöveg:
"""${text}"""

Válaszd ki a szövegből a 8–15 leghasznosabb kifejezést, amely egy ${defLevel()} szintű tanulónak valószínűleg új (szókapcsolatok, igei szerkezetek, fordulatok is; alapszavakat ne). Mindegyikhez adj szótári alakot, rövid magyar jelentést és a szöveg azon mondatát, amelyben szerepel.
Készíts 6–8 feleletválasztós lyukas mondatot a szöveg mondataiból: a mondatban egy kifejezés helyén ___ álljon, 3 válaszlehetőséggel, amelyek közül pontosan egy helyes, a rossz válaszok legyenek hihetőek. Adj rövid magyar magyarázatot.
Adj a szövegnek rövid címet ${LG().adv} és 1–2 mondatos magyar összefoglalót.
Csak egy JSON objektumot adj vissza:
{"title":"cím","summary":"magyar összefoglaló","words":[{"it":"kifejezés","hu":"jelentés","ex":"a mondat a szövegből"}],"cloze":[{"q":"mondat ___ résszel","a":"helyes","o":["helyes","rossz1","rossz2"],"why":"magyar magyarázat"}]}`;
  try{const r=await sample.json(prompt,{modelTier:"default"});if(!IMP)return;
    const words=(Array.isArray(r.words)?r.words:[]).filter(w=>w&&w.it&&w.hu).slice(0,15).map(w=>({it:String(w.it),hu:String(w.hu),ex:String(w.ex||"")}));
    const cloze=(Array.isArray(r.cloze)?r.cloze:[]).filter(c=>c&&String(c.q).includes("___")&&Array.isArray(c.o)&&c.o.map(String).includes(String(c.a))).slice(0,8).map(c=>({q:String(c.q),a:String(c.a),o:[...new Set(c.o.map(String))].slice(0,4),why:String(c.why||"")}));
    if(!words.length)throw {code:"invalid_json"};
    const x={at:Date.now(),l:lang(),title:String(r.title||"Saját szöveg").slice(0,80),summary:String(r.summary||""),text:text.slice(0,4000),words,cloze};
    S.imp=S.imp||[];S.imp.push(x);if(S.imp.length>10)S.imp.splice(0,S.imp.length-10);incEv("drills");addXP(5);save();IMP.text="";openImport(x);}
  catch(e){if($("#impMsg"))$("#impMsg").innerHTML=`<div class="notice">${esc(e&&e.code==="invalid_json"?"Nem sikerült leckét készíteni ebből a szövegből. Próbáld újra, vagy válassz másik szöveget.":aiErr(e))}</div>`;if($("#impGo"))$("#impGo").disabled=false;}
}
function openImport(x){
  const own=new Set(ownList().map(w=>norm(w.it))),left=x.words.filter(w=>!own.has(norm(w.it))),paras=x.text.split(/\n\s*\n|\n/).map(p=>p.trim()).filter(Boolean);
  subShell(["Saját szöveg",()=>renderImport(true)],"Saját szövegből lecke",esc(x.title),`${x.summary?`<p class="muted">${esc(x.summary)}</p>`:""}
    <div class="row">${x.cloze.length?`<button class="btn lemon" id="impQuiz">Lyukas gyakorló (${x.cloze.length})</button>`:""}<button class="btn soft" id="impAdd" ${left.length?"":"disabled"}>${left.length?`Mind a ${left.length} kifejezés kártyára`:"Mind a kártyáid között van"}</button></div>
    <div class="card"><div class="phr">${x.words.map((w,i)=>`<div>${spkBtn(w.it)}<div style="min-width:0;flex:1"><div class="it" ${LA()}>${esc(w.it)} ${own.has(norm(w.it))?'<span class="pill ok">✓</span>':""}</div><div class="small muted">${esc(w.hu)}</div>${w.ex?`<div class="small" ${LA()}><i>${esc(w.ex)}</i></div>`:""}</div>${own.has(norm(w.it))?"":`<button class="btn ghost" data-iw="${i}" style="padding:.35rem .6rem;font-size:.8rem">+ Kártya</button>`}</div>`).join("")}</div></div>
    <details class="g"><summary>A szöveg (koppints egy szóra a jelentéséért)</summary><div class="gb stack" ${LA()}>${paras.map(p=>`<p>${wrapW(p)}</p>`).join("")}</div></details>`);
  bindWords(paras,x.words.map(w=>({it:w.it,hu:w.hu})));
  const add=ws=>{ws.forEach(w=>ownList().push({id:`${lang()}-own-${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`,it:w.it,hu:w.hu,alt:[],ex:w.ex,note:"Saját szöveg: "+x.title}));save();rebuildOwn();fx("ok");};
  $("#impAdd").onclick=()=>{add(left);toast(left.length+" kifejezés felvéve a kártyák közé.");openImport(x);};
  view.querySelectorAll("[data-iw]").forEach(b=>b.onclick=()=>{add([x.words[+b.dataset.iw]]);toast("Felvéve: "+x.words[+b.dataset.iw].it);openImport(x);});
  if($("#impQuiz"))$("#impQuiz").onclick=()=>{QZ_BACK=()=>openImport(x);
    runQuiz({kind:"import",label:"Saját szöveg",title:x.title,items:shuffle(x.cloze.slice()),backLabel:"Lecke",onDone:(ok,n)=>{drillStat("import",ok/n>=.8);addXP(ok);save();toast(`${ok}/${n} helyes.`);openImport(x);}});};
}
