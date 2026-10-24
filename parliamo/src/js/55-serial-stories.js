/* ============ SERIAL STORIES (B1, B2, C1) ============ */
/* Six-chapter stories with recorded narration and voices. A chapter opens once the previous one is finished;
   every line can be played on its own, words are tappable and two questions close each chapter. */
let SER=null;
const serOf=id=>(S.ser||(S.ser={}))[id]||{};
function renderSerials(){
  stopViews();
  subShell(["Gyakorlás",()=>go("gyakorlas")],"Folytatásos történetek","Fejezetről fejezetre",`<p class="muted">Hosszabb, hangos történetek fejezetekre bontva. Minden fejezet végén két kérdés vár, és csak utána nyílik a következő. Koppints bármelyik szóra a jelentéséért.</p>
    <div class="lgrid">${XT.ser.map(s=>{const d=Object.keys(serOf(s.id)).length;return `<button class="lcard" data-ser="${s.id}"><div class="pic"><img src="img/${s.img}.webp" alt="" loading="lazy" decoding="async" onerror="this.remove()"><span class="badge"><span class="pill ${d===s.chapters.length?"ok":""}">${d===s.chapters.length?"✓ Kész":d?d+"/"+s.chapters.length:s.level}</span></span></div><div class="body"><b>${esc(s.title)}</b><span class="small muted">${esc(s.hu)} · ${s.level} · ${s.chapters.length} fejezet</span></div></button>`;}).join("")}</div>`);
  view.querySelectorAll("[data-ser]").forEach(b=>b.onclick=()=>openSerial(b.dataset.ser));
}
function openSerial(id){
  const s=XT.ser.find(x=>x.id===id);if(!s)return;stopViews();prefetch("ser-en-"+id);const d=serOf(id);
  subShell(["Történetek",renderSerials],`Folytatásos történet · ${s.level}`,esc(s.title),`${pic(s.img)}<p class="muted">${esc(s.desc)}</p>
    <div class="stack" style="gap:.5rem">${s.chapters.map((ch,k)=>{const open=k===0||d[k-1],r=d[k];return `<button class="btn ${r?"soft":open?"":"ghost"} block" data-ch="${k}" ${open?"":"disabled"} style="justify-content:space-between;text-align:left"><span>${k+1}. ${esc(ch.title)} <span class="small muted">· ${esc(ch.hu)}</span></span><span>${r?`✓ ${r.ok}/${r.n}`:open?"→":"🔒"}</span></button>`;}).join("")}</div>`);
  view.querySelectorAll("[data-ch]").forEach(b=>b.onclick=()=>{SER={s,k:+b.dataset.ch,i:-1,playing:false,showHu:false,ans:{},stage:"read"};drawChapter();});
}
function drawChapter(){
  const {s,k}=SER,ch=s.chapters[k],cast=s.cast,last=k===s.chapters.length-1;
  const nm=x=>x==="N"?"":`<b class="small" style="color:var(--cobalt)">${esc(cast[x].name)}:</b> `;
  const qs=ch.questions,all=qs.every((_,j)=>SER.ans[j]!==undefined),ok=qs.filter((q,j)=>SER.ans[j]===q.a).length;
  if(!SER.ord)SER.ord=qs.map(q=>shuffle(q.o.map((_,j)=>j)));
  subShell(["Fejezetek",()=>openSerial(s.id)],`${esc(s.title)} · ${k+1}/${s.chapters.length}. fejezet`,esc(ch.title),`<div class="row"><button class="btn lemon" id="chPlay">${SER.playing?"■ Megállítás":"▶ Felolvasás"}</button><button class="btn ghost" id="chHu" aria-pressed="${SER.showHu}">${SER.showHu?"Fordítás elrejtése":"Magyar fordítás"}</button></div>
    <div class="card stack" id="chLines" style="gap:.7rem">${ch.lines.map((l,j)=>`<div data-k="${j}" style="border-radius:8px;padding:.15rem .3rem"><div class="row" style="flex-wrap:nowrap;align-items:flex-start">${spkBtn(l.it,"sm")}<div style="min-width:0"><div ${LA()} style="${l.s==="N"?"":"font-style:italic"}">${nm(l.s)}${wrapW(l.it)}</div>${SER.showHu?`<div class="small muted">${esc(l.hu)}</div>`:""}</div></div></div>`).join("")}</div>
    <h3>Kérdések</h3>${qs.map((q,j)=>{const a=SER.ans[j];return `<div class="card stack" style="gap:.5rem"><b ${LA()}>${esc(q.q)}</b><div class="opts">${SER.ord[j].map(o=>`<button class="opt ${a!==undefined?(o===q.a?"right":o===a?"wrong":""):""}" data-sq="${j}" data-o="${o}" ${a!==undefined?"disabled":""} ${LA()}>${esc(q.o[o])}</button>`).join("")}</div></div>`;}).join("")}
    ${all?`<div class="card stack"><h3>${ok}/${qs.length} helyes</h3><p class="small muted">${last?"Ez volt az utolsó fejezet. Gratulálok, végigolvastad a történetet!":"A következő fejezet megnyílt."}</p><div class="row">${last?`<button class="btn" id="chList">Vissza a történetekhez</button>`:`<button class="btn" id="chNext">${k+2}. fejezet →</button>`}</div></div>`:""}`);
  bindWords(ch.lines.map(l=>l.it),[]);
  $("#chHu").onclick=()=>{SER.showHu=!SER.showHu;const y=window.scrollY;drawChapter();window.scrollTo(0,y);};
  $("#chPlay").onclick=()=>{if(SER.playing){SER.playing=false;try{player.pause();speechSynthesis.cancel();}catch(e){}drawChapter();}else serPlay();};
  view.querySelectorAll("[data-sq]").forEach(b=>b.onclick=()=>{const j=+b.dataset.sq,o=+b.dataset.o,q=qs[j];SER.ans[j]=o;const good=o===q.a;
    if(good){fx("ok");addXP(3);}else{fx("bad");logMiss("serial",q.q,q.o[o],q.o[q.a]);}
    if(qs.every((_,x)=>SER.ans[x]!==undefined)){const n=qs.filter((q,x)=>SER.ans[x]===q.a).length;S.ser=S.ser||{};S.ser[s.id]=Object.assign({},S.ser[s.id],{[k]:{ok:n,n:qs.length,d:today()}});
      skillLog("listen",s.level,n/qs.length*100,"serial");incEv("stories");addXP(10);if(last)confetti();}
    save();const y=window.scrollY;drawChapter();window.scrollTo(0,y);});
  if($("#chNext"))$("#chNext").onclick=()=>{SER={s,k:k+1,i:-1,playing:false,showHu:SER.showHu,ans:{}};drawChapter();window.scrollTo(0,0);};
  if($("#chList"))$("#chList").onclick=renderSerials;
}
async function serPlay(){
  const cur=SER;cur.playing=true;const b=$("#chPlay");if(b)b.textContent="■ Megállítás";
  const lines=cur.s.chapters[cur.k].lines;
  for(let j=Math.max(0,cur.i);j<lines.length;j++){if(SER!==cur||!cur.playing)return;cur.i=j;serHl();await say(lines[j].it);await new Promise(r=>setTimeout(r,200));}
  if(SER===cur){cur.playing=false;cur.i=-1;serHl();const b2=$("#chPlay");if(b2)b2.textContent="▶ Felolvasás";}
}
function serHl(){view.querySelectorAll("#chLines [data-k]").forEach(el=>{const on=+el.dataset.k===SER.i;el.style.outline=on?"3px solid var(--lemon)":"";if(on)el.scrollIntoView({block:"nearest",behavior:"smooth"});});}
