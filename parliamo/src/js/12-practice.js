/* ============ PRACTICE ============ */
const DRILLS=[["tline","Igeidő-idővonal","Minden igeidő egy idővonalon, magyar magyarázattal és példával, utána gyakorló."],["mock","Próbavizsga","Hat teljes, időre mért B2 First és C1 Advanced jellegű vizsga és egy IELTS Academic jellegű olvasásvizsga, a végén tájékoztató gyakorlási eredménnyel."],["examiner","Szóbeli vizsgáztató","IELTS- (20 téma) vagy Cambridge-jellegű szóbeli (képösszehasonlítás, páros feladat az AI-val). Beszélsz vagy írsz, az AI szöveges visszajelzést és mintaválaszokat ad."],["journal","Napló","Pár mondat naponta. Az AI kijavítja, magyarul elmagyarázza a hibákat, és a javításokból kártya lehet."],["serial","Folytatásos történetek","Hatfejezetes hangos történetek, fejezetenként kérdésekkel; a következő fejezet a kérdések után nyílik."],["colloc","Kollokációk","240 angol szókapcsolat (make vagy do, heavy rain, deeply concerned…) 12 csoportban, hanggal, példamondattal, gyakorlóval és kártyára mentéssel."],["import","Saját szövegből lecke","Bemásolsz egy cikket, e-mailt vagy dalszöveget: az AI kiválogatja az új kifejezéseket, és lyukas szöveges gyakorlót készít belőle."],["shadow","Árnyékolás","Mondatonként meghallgatod, utánamondod, az app felveszi a hangod, és egymás után visszajátssza a mintát és a te változatodat."],["wcourse","Íráskurzus","Hivatalos e-mail, panaszlevél, esszé és beszámoló lépésenként: felépítés, minta, kötőszavak, aztán az AI részenként javítja a szövegedet."],["acc","Brit vagy amerikai?","Ugyanaz a mondat két akcentussal: hallás alapján döntsd el, melyiket hallod, és tanuld meg a különbségeket."],["build","Mondatépítő","Magyar mondatot kapsz, és kimondod a tanult nyelven. A szóbeli vizsga fordítós feladatára készít fel."],["pod","Podcastok","Hosszabb, természetes tempójú beszélgetések A2-től C1-ig, kérdésekkel és szószedettel."],["pron","Kiejtés magyaroknak","A magyarok tipikus angol hibái: th, w/v, rövid és hosszú i, æ, szóvégi zöngés hangok, hangsúly."],["exam","Vizsgafelkészítő","B2 First és IELTS jellegű feladatok: szókitöltés, szóképzés, mondatátalakítás, olvasás, esszé értékeléssel."],["read","Olvasó","AI-szöveg a szintedre, bármilyen témában. Koppints a szavakra a jelentésükért, és vedd fel őket a kártyáid közé."],["miss","A hibáim","Az elrontott kifejezések külön köre, a legtöbbször rontottakkal kezdve."],["ai","Napi AI-történet","Minden nap új rövid párbeszéd csak a már tanult szavaidból, kérdésekkel."],["speak","Hangos ismétlés","Mondd ki a mondatokat, majd hasonlítsd össze a mintát a felismert szöveggel."],["story","Történetek","9 hangos párbeszéd A1-től B1-ig, értésellenőrző kérdésekkel."],["conj","Igeedző","25 gyakori ige öt igeidőben, minden alak felvett hanggal."],["art","Névelők","il, lo, l', la, un, uno, una, i, gli, le: gyors döntések."],["prep","Névelős elöljárók","al, nella, dello, sugli: összevonások mondatban."],["dict","Diktálás","Hallgasd meg a mondatot, és írd le."],["num","Számok","Hallás után vagy betűvel, 0-tól 100-ig."]];
/* One destination per practice; recommendations use a separate selector so links remain unique. */
const PRACTICE_GROUPS=[
  ["words","Szókincs","Szavak és kifejezések felidézése.",["miss","colloc","phrasal","num"]],
  ["listen","Hallásértés","Hallgasd meg, értsd meg, idézd fel.",["pod","serial","story","acc","dict"]],
  ["speak","Beszéd","Mondj ki önállóan is mondatokat.",["shadow","build","speak","pron","examiner"]],
  ["write","Olvasás és írás","Olvasmányok, saját mondatok és szövegek.",["journal","import","wcourse","read","ai"]],
  ["grammar","Nyelvtan","Egy-egy nyelvtani pont célzott gyakorlása.",["tline","conj","art","prep","tenses","articles","preps","cond","cong","impp","serestar","pretimp","porpara"]],
  ["exam","Vizsga","Vizsgatípusú gyakorlás, tájékoztató visszajelzéssel.",["mock","exam"]]
];
function practiceAccess(k){
  const needsAI=["examiner","journal","ai","import"].includes(k)||(k==="read"&&!XT.off.reads.length);
  if(needsAI)return typeof aiAccessBadge==="function"?aiAccessBadge():'<span class="access-badge">AI-beállítás szükséges</span>';
  const optionalAI=["build","wcourse","mock","exam","read"].includes(k);
  return `<span class="access-badge">Azonnal használható${optionalAI?" · AI-val bővíthető":""}</span>`;
}
function practiceTile(item,i,recommended=false){
  let [k,t,d]=item;const s=drillResult(k);
  if(k==="conj"&&lang()==="en"){t="Rendhagyó igék";d="50 gyakori rendhagyó ige 2. és 3. alakja, felvett hanggal.";}
  if(k==="conj"&&lang()==="es")d="25 gyakori ige öt igeidőben.";
  if(k==="pron")d=`A magyar anyanyelvűek tipikus ${LG().adj} kiejtési nehézségei: hangpárok, mondatok és felvett minták.`;
  if(k==="mock"&&lang()!=="en")d=`Teljes, időre mért ${lang()==="it"?"CELI 2":"DELE B1"} jellegű vizsga: olvasás, nyelvhelyesség, hallás felvett hanggal és írás, a végén tájékoztató eredménnyel.`;
  if(k==="exam"&&lang()!=="en")d=`${EXN[lang()]} jellegű feladatok: szókitöltés, szóképzés, olvasás és írás magyar visszajelzéssel.`;
  if(k==="story")d=`${STORIES.length} hangos párbeszéd ${STORIES.length?STORIES[0].level+"–"+STORIES[STORIES.length-1].level:""}, értésellenőrző kérdésekkel.`;
  const icon=({tline:I.nyelvtan,mock:I.star,examiner:I.mic,journal:I.tanar,serial:I.spk,colloc:I.kartyak,import:I.nyelvtan,shadow:I.mic,read:I.nyelvtan,pod:I.spk,pron:I.mic,exam:I.star,acc:I.spk,build:I.mic,wcourse:I.tanar,miss:I.kartyak,ai:I.tanar,speak:I.mic,story:I.spk,conj:I.gyakorlas,art:I.nyelvtan,prep:I.leckek,dict:I.spk,num:I.star}[k])||I.nyelvtan;
  return `<button class="drill" ${recommended?'data-recommend':'data-d'}="${esc(k)}"><span class="dico c${i%4+1}">${icon}</span><b>${esc(t)}</b><span class="small muted">${esc(d)}</span>${practiceAccess(k)}${k==="miss"?`<span class="small"><span class="pill ${missCount()?"bad":"ok"}">${missCount()?missCount()+" vár javításra":"Nincs hiba"}</span></span>`:""}${s&&s.n?`<span class="small"><span class="pill ${s.ok/s.n>=.8?"ok":""}">${Math.round(s.ok/s.n*100)}% · ${s.n} válasz</span></span>`:""}</button>`;
}
function renderPractice(){
  const items=drillList(),available=new Map(items.map(d=>[d[0],d]));
  const recommend=[...(missCount()?["miss"]:[]),"story","dict","build","conj"].filter(k=>available.has(k)).slice(0,3);
  const assigned=new Set(PRACTICE_GROUPS.flatMap(g=>g[3]));
  const groups=PRACTICE_GROUPS.map(g=>g.slice());
  const extra=items.filter(d=>!assigned.has(d[0])).map(d=>d[0]);if(extra.length)groups[4]=[...groups[4].slice(0,3),[...groups[4][3],...extra]];
  view.innerHTML=`<div class="stack"><div class="home-head"><span class="label">Azt gyakorold, amire most szükséged van</span><h1>Gyakorlás</h1><p class="muted">Válassz az ajánlottakból, vagy nyiss meg egy készséget. A kész hanganyagokhoz és feladatokhoz nem kell AI-kapcsolat.</p></div>
    ${recommend.length?`<section class="stack" aria-labelledby="practiceRecommended"><div class="sec-head"><h2 id="practiceRecommended">Most ezt ajánlom</h2><span class="small muted">Rövid, önálló gyakorlatok</span></div><div class="drills">${recommend.map((k,i)=>practiceTile(available.get(k),i,true)).join("")}</div></section>`:""}
    <div class="sec-head"><h2>Válassz készséget</h2><button class="linkish small" id="practiceExpand">Összes megnyitása</button></div>
    <div class="stack practice-tools">${groups.map(([id,title,desc,keys])=>{const found=keys.filter(k=>available.has(k));return found.length?`<details class="g practice-group" id="practice-${id}"><summary><span>${title} <span class="pill">${found.length}</span></span></summary><div class="gb"><p class="small muted">${desc}</p><div class="drills">${found.map((k,i)=>practiceTile(available.get(k),i)).join("")}</div></div></details>`:"";}).join("")}</div>
    <p class="small muted">A beszédfelismerés a felismert szövegről ad visszajelzést. A szint- és vizsgaeredmények gyakorlási becslések.</p></div>`;
  view.querySelectorAll("[data-d], [data-recommend]").forEach(b=>b.onclick=()=>startDrill(b.dataset.d||b.dataset.recommend));
  $("#practiceExpand").onclick=()=>{const gs=[...view.querySelectorAll(".practice-group")],open=gs.some(g=>!g.open);gs.forEach(g=>g.open=open);$("#practiceExpand").textContent=open?"Összes becsukása":"Összes megnyitása";};
  if(typeof bindAISetup==="function")bindAISetup(view);
}
function drillList(){
  return LG().drills.map(k=>{const d=DRILLS.find(x=>x[0]===k);if(d)return d.slice();const c=CDRILLS[k];return c?[k,c.title,c.desc]:null;})
    .filter(d=>d&&(d[0]!=="speak"||canSpeak())&&(d[0]!=="shadow"||canRecord()));
}
const drillKey=k=>lang()+":"+k;
/* Shared legacy totals are retained, but cannot safely be attributed to a language. */
const drillResult=k=>(S.drills||{})[drillKey(k)];
function drillStat(k,ok){S.drills=S.drills||{};const key=drillKey(k),s=S.drills[key]||{ok:0,n:0};s.n++;if(ok)s.ok++;S.drills[key]=s;incEv("drills");}
function startDrill(k){if(k==="tline")return renderTimeline();if(k==="colloc")return renderColloc();if(k==="import")return renderImport();if(k==="shadow")return renderShadow();if(k==="mock")return renderMocks();if(k==="examiner")return renderExaminer();if(k==="journal")return renderJournal();if(k==="serial")return renderSerials();if(k==="wcourse")return renderWCourse();if(k==="acc")return startAccent();if(k==="build")return startBuild();if(k==="pod")return renderPods();if(k==="pron")return renderPron();if(k==="exam")return renderExam();if(k==="story")return renderStories();if(k==="miss")return startRound("miss");if(k==="ai")return aiStory();if(k==="speak")return startRound("speak");if(k==="read")return renderReader();if(CDRILLS[k])return startChoice(k);D={k,ok:0,n:0,tense:"",set:"all",mode:"listen",done:false};nextDrill();}
function drillShell(title,inner){const T=DRILLS.find(d=>d[0]===D.k)||[D.k,(CDRILLS[D.k]||{}).title||""];
  view.innerHTML=`<div class="player"><div class="row" style="justify-content:space-between"><button class="btn ghost" id="dBack">← Gyakorlás</button><span class="score tnum">${D.ok} / ${D.n}</span></div><div><h1 class="label">${T[1]}</h1>${title?`<h2>${title}</h2>`:""}</div>${inner}</div>`;
  $("#dBack").onclick=()=>{D=null;renderPractice();};}
function drillCheckUI(onCheck){
  const inp=$("#dans"),btn=$("#dgo");
  setTimeout(()=>inp&&inp.focus(),30);
  const act=()=>{if(D.done){nextDrill();return;}if(inp&&!inp.value.trim())return;onCheck();D.done=true;btn.textContent="Következő";btn.focus();};
  btn.onclick=act;if(inp)inp.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();act();}};
}
function fbHtml(ok,main,extra){return `<div class="feedback ${ok?"ok":"bad"}" role="status"><b>${ok?LG().ok[0]:"Nem egészen."}</b>${main?`<span>Helyes: <span class="ans">${esc(main)}</span></span>`:""}${extra||""}</div>`;}
function ppForms(v,p){const aux=v.aux==="e"?ESS:AVE;if(v.aux==="a")return [aux[p]+" "+v.pp];const st=v.pp.slice(0,-1);return p<3?[aux[p]+" "+st+"o",aux[p]+" "+st+"a"]:[aux[p]+" "+st+"i",aux[p]+" "+st+"e"];}
function nextDrill(){
  D.done=false;
  if(D.k==="conj"){
    if(!VB){drillShell("",`<div class="notice">Az igeadatok nem töltődtek be.</div>`);return;}
    const TN=VB.tenses, tk=Object.keys(TN); if(!TN[D.tense])D.tense=tk[0];
    const lv=[...new Set(VB.verbs.map(v=>v.level))].sort(), set=VB.verbs.filter(v=>D.set==="all"||v.level===D.set);
    const v=rnd(set.length?set:VB.verbs),t=D.tense,np=v.forms[t].length,p=Math.floor(Math.random()*np),one=np===1;
    prefetch(vbBundle(v));
    const alt=(v.alt&&v.alt[t]||[])[p], ans=[v.forms[t][p],...(alt?[alt]:[])];
    const rowLabel=i=>one?"":(VB.pronouns[i]||PRON[i]);
    drillShell("",`<div class="row"><span class="seg" id="tense">${tk.map(k=>`<button data-v="${k}" aria-pressed="${t===k}">${esc(TN[k].replace(/ \(.*\)$/,""))}</button>`).join("")}</span><span class="seg" id="vset">${["all",...lv].map(k=>`<button data-v="${k}" aria-pressed="${D.set===k}">${k==="all"?"Mind":k}</button>`).join("")}</span></div>
      <div class="card" style="text-align:center;padding:2rem 1rem"><span class="label">${esc(v.hu)} · ${esc(TN[t])}${v.aux==="essere"&&t==="pass"?" · essere-vel":""}</span><div class="big-q">${one?"":`<span class="muted">${esc(rowLabel(p))}</span> · `}${esc(v.inf)}</div></div>
      <input id="dans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Írd be az alakot" aria-label="Igealak"><div id="dfb"></div><button class="btn block" id="dgo">Ellenőrzés</button>`);
    $("#tense").querySelectorAll("button").forEach(b=>b.onclick=()=>{D.tense=b.dataset.v;nextDrill();});
    $("#vset").querySelectorAll("button").forEach(b=>b.onclick=()=>{D.set=b.dataset.v;nextDrill();});
    drillCheckUI(()=>{const r=check($("#dans").value,ans);D.n++;if(r.ok){D.ok++;addXP(1);}else save();drillStat("conj",r.ok);
      const rows=one?tk.map(k=>[esc(TN[k]),v.forms[k][0],k===t]):v.forms[t].map((f,i)=>[esc(rowLabel(i)),f,i===p]);
      const table=`<div class="tbl-wrap"><table><tr><th></th><th>${esc(v.inf)}${one?"":" · "+esc(TN[t])}</th><th></th></tr>${rows.map(([lab,f,em],i)=>`<tr><td class="muted">${lab}</td><td class="${em?"em":""}">${esc(f)}</td><td>${spkBtn(one?f:vbKey(i,f),"sm")}</td></tr>`).join("")}</table></div>`;
      $("#dfb").innerHTML=fbHtml(r.ok,r.ok?null:ans.join(" / "),r.warn?`<span class="small">${esc(r.warn)}</span>`:"")+table;
      $(".score").textContent=D.ok+" / "+D.n;say(one?v.forms[t][p]:vbKey(p,v.forms[t][p]));});
  }
  if(D.k==="art"){
    const nn=rnd(NOUNS),m=rnd(["def","indef","pl"]);
    const ans=m==="def"?nn[2]:m==="indef"?nn[3]:nn[4];
    const opts=m==="def"?["il","lo","l'","la"]:m==="indef"?["un","uno","una","un'"]:["i","gli","le"];
    const noun=m==="pl"?nn[5]:nn[0];
    drillShell("",`<div class="card" style="text-align:center;padding:2rem 1rem"><span class="label">${m==="def"?"határozott névelő":m==="indef"?"határozatlan névelő":"többes szám, határozott"} · ${esc(nn[1])}</span><div class="big-q"><span class="blank" style="display:inline-block;min-width:2em;border-bottom:3px solid var(--cobalt)"></span> ${esc(noun)}</div></div>
      <div class="opts" style="grid-template-columns:repeat(${opts.length},minmax(0,1fr))">${opts.map((o,i)=>`<button class="opt" style="justify-content:center" data-o="${i}"><kbd>${i+1}</kbd>${esc(o)}</button>`).join("")}</div><div id="dfb"></div><button class="btn block" id="dgo" hidden>Következő</button>`);
    const btn=$("#dgo");btn.onclick=()=>nextDrill();
    view.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{if(D.done)return;D.done=true;const o=opts[+b.dataset.o],ok=o===ans;D.n++;if(ok){D.ok++;addXP(1);}else save();drillStat("art",ok);
      view.querySelectorAll("[data-o]").forEach(x=>{if(opts[+x.dataset.o]===ans)x.classList.add("right");else if(x===b)x.classList.add("wrong");});
      const full=(ans.endsWith("'")?ans:ans+" ")+noun;$("#dfb").innerHTML=fbHtml(ok,ok?null:full,ok?`<span class="ans">${esc(full)}</span>`:"");$(".score").textContent=D.ok+" / "+D.n;say(full);btn.hidden=false;btn.focus();});
    D.keys=e=>{const n=+e.key;if(!D.done&&n>=1&&n<=opts.length)view.querySelector(`[data-o="${n-1}"]`).click();else if(D.done&&e.key==="Enter")nextDrill();};
  }
  if(D.k==="prep"){
    const useSent=Math.random()<.6;let q,ans,hint;
    if(useSent){const s=rnd(PREP_SENT);q=s[0];ans=s[1];hint=s[2];}else{const p=rnd(PREPS),a=rnd(ARTS);q=p+" + "+a;ans=prepArt(p,a);hint=null;}
    drillShell("",`<div class="card" style="text-align:center;padding:2rem 1rem"><span class="label">${useSent?"egészítsd ki · "+esc(hint):"vond össze"}</span><div class="big-q">${useSent?blankify(q):esc(q)+" = ?"}</div></div>
      <input id="dans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="pl. nella" aria-label="Válasz"><div id="dfb"></div><button class="btn block" id="dgo">Ellenőrzés</button>`);
    drillCheckUI(()=>{const r=check($("#dans").value,[ans]);D.n++;if(r.ok){D.ok++;addXP(1);}else save();drillStat("prep",r.ok);
      const full=useSent?q.replace("___ ",ans.endsWith("'")?ans:ans+" "):null;
      $("#dfb").innerHTML=fbHtml(r.ok,r.ok?null:ans,full?`<span class="small">${esc(full)}</span>`:"");$(".score").textContent=D.ok+" / "+D.n;if(full)say(full);});
  }
  if(D.k==="dict"){
    const u=new Set(unlocked());const ph=POOL.filter(c=>c.ph&&(u.has(c.li)||Math.random()<.35));const c=rnd(ph.length?ph:POOL.filter(c=>c.ph));
    drillShell("Írd le, amit hallasz",`<div class="listen">${spkBtn(c.it,"big")}<button class="icon-btn" data-say="${esc(c.it)}" data-slow aria-label="Lassan">${I.slow}</button><span class="small muted">Annyiszor hallgasd meg, ahányszor kell.</span></div>
      <input id="dans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Írd le ${LG().adv}…" aria-label="Diktált mondat"><div id="dfb"></div><button class="btn block" id="dgo">Ellenőrzés</button>`);
    setTimeout(()=>say(c.it),300);
    drillCheckUI(()=>{const user=$("#dans").value;const r=check(user,[c.it]);const uw=new Set(deacc(norm(user)).split(" "));
      const diff=dictDiff(c.it,user,uw);
      D.n++;if(r.ok){D.ok++;addXP(3);}else save();drillStat("dict",r.ok);
      $("#dfb").innerHTML=`<div class="feedback ${r.ok?"ok":"bad"}" role="status"><b>${r.ok?LG().ok[0]:"Majdnem."}</b><span class="diff ans">${diff}</span><span class="small" style="color:var(--muted)">${esc(c.hu)}</span>${r.warn?`<span class="small">${esc(r.warn)}</span>`:""}</div>`;$(".score").textContent=D.ok+" / "+D.n;});
  }
  if(D.k==="num"){
    const n=Math.floor(Math.random()*101),w=numIt(n),listen=D.mode==="listen";
    drillShell("",`<div class="row"><span class="seg" id="nmode">${[["listen","Hallás után"],["write","Betűvel"]].map(([k,l])=>`<button data-v="${k}" aria-pressed="${D.mode===k}">${l}</button>`).join("")}</span></div>
      <div class="card" style="text-align:center;padding:2rem 1rem">${listen?`<div class="listen" style="justify-content:center">${spkBtn(w,"big")}</div><span class="label" style="margin-top:.6rem">írd le számjegyekkel</span>`:`<span class="label">írd le olaszul</span><div class="big-q tnum">${n}</div>`}</div>
      <input id="dans" ${listen?'inputmode="numeric"':""} autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${listen?"pl. 42":"pl. quarantadue"}" aria-label="Válasz"><div id="dfb"></div><button class="btn block" id="dgo">Ellenőrzés</button>`);
    $("#nmode").querySelectorAll("button").forEach(b=>b.onclick=()=>{D.mode=b.dataset.v;nextDrill();});
    if(listen)setTimeout(()=>say(w),300);
    drillCheckUI(()=>{const r=listen?{ok:$("#dans").value.trim()===String(n)}:check($("#dans").value,[w]);D.n++;if(r.ok){D.ok++;addXP(1);}else save();drillStat("num",r.ok);
      $("#dfb").innerHTML=fbHtml(r.ok,r.ok?null:(listen?n+" ("+w+")":w),r.ok?`<span class="ans">${n} = ${esc(w)}</span>`:"");$(".score").textContent=D.ok+" / "+D.n;say(w);});
  }
}
document.addEventListener("keydown",e=>{if(D&&D.keys&&(D.k==="art"||D.choice)&&!e.target.matches("input,textarea"))D.keys(e);});
/* Dictation feedback: correct words in green; for a word that was nearly right (a letter or two off), only the wrong
   letters are marked, with the learner's spelling next to it; words not attempted at all are marked whole. */
function editDist(a,b){const d=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)d[0][j]=j;
  for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[a.length][b.length];}
function letterMarks(target,guess){
  /* Longest common subsequence: target letters outside it are the ones the learner got wrong or left out. */
  const t=[...target],g=[...guess],L=Array.from({length:t.length+1},()=>new Array(g.length+1).fill(0));
  for(let i=t.length-1;i>=0;i--)for(let j=g.length-1;j>=0;j--)L[i][j]=deacc(t[i].toLowerCase())===deacc(g[j].toLowerCase())?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
  const keep=new Array(t.length).fill(false);let i=0,j=0;
  while(i<t.length&&j<g.length){if(deacc(t[i].toLowerCase())===deacc(g[j].toLowerCase())){keep[i]=true;i++;j++;}else if(L[i+1][j]>=L[i][j+1])i++;else j++;}
  return t.map((ch,k)=>keep[k]||!/\p{L}/u.test(ch)?esc(ch):`<u class="bad-letter">${esc(ch)}</u>`).join("");
}
function dictDiff(target,user,userWords){
  const words=target.split(" "),keys=new Set(words.map(w=>deacc(norm(w)))),guesses=deacc(norm(user)).split(" ").filter(Boolean),used=new Set();
  return words.map(w=>{const key=deacc(norm(w));
    if(userWords.has(key))return `<span class="hit">${esc(w)}</span>`;
    /* Only guesses that are not already a correct word of the sentence can be a misspelling of this one. */
    let best=null,bd=99;guesses.forEach((g,gi)=>{if(used.has(gi)||keys.has(g))return;const dd=editDist(key,g);if(dd<bd){bd=dd;best=gi;}});
    if(best!==null&&key.length>2&&bd<=Math.max(1,Math.floor(key.length/3))){used.add(best);
      return `<span class="near">${letterMarks(w,guesses[best])} <small class="muted">(te: ${esc(guesses[best])})</small></span>`;}
    return `<span class="miss">${esc(w)}</span>`;}).join(" ");
}
