/* ============ SHADOWING ============ */
/* Line by line: listen to the recording, repeat it, and the app records you (MediaRecorder) and plays the model and your
   version back to back. Nothing leaves the device; the recordings live only until the next line. */
let SH=null;
const canRecord=()=>!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
function shSources(){
  const pods=XT.pods.map(p=>({id:"pod-"+p.id,t:p.title,sub:"Podcast · "+p.level,lines:p.lines.map(x=>x.it),img:"pod-"+p.id}));
  const st=STORIES.map(s=>({id:"st-"+s.id,t:s.title||s.id,sub:"Történet · "+(s.level||""),lines:s.lines.filter(x=>x.it).map(x=>x.it),img:s.img}));
  const ser=XT.ser.flatMap(s=>s.chapters.map((c,k)=>({id:`ser-${s.id}-${k}`,t:`${s.title}: ${c.title}`,sub:`Folytatásos · ${s.level} · ${k+1}. fejezet`,lines:c.lines.map(x=>x.it),img:s.img})));
  return [...ser,...pods,...st].filter(x=>x.lines.length);
}
function renderShadow(){stopViews();withExtra("serials",renderShadowNow);}
function renderShadowNow(){
  const srcs=shSources(),done=S.shadow||{};
  subShell(["Gyakorlás",()=>go("gyakorlas")],"Árnyékolás","Hallgasd, mondd utána, hasonlítsd össze",`<p class="muted">Válassz egy hangos szöveget. Mondatonként: meghallgatod a felvételt, utánamondod ugyanazzal a tempóval és hanglejtéssel, aztán az app egymás után lejátssza a mintát és a te felvételedet. A felvétel csak a te eszközödön marad.</p>
    ${canRecord()?"":`<div class="notice">Ebben a böngészőben nem érhető el hangfelvétel. A mondatokat így is meghallgathatod és utánamondhatod.</div>`}
    <div class="drills">${srcs.slice(0,40).map((x,i)=>`<button class="drill" data-sh="${x.id}"><span class="dico c${i%4+1}">${I.mic}</span><b ${LA()}>${esc(x.t)}</b><span class="small muted">${esc(x.sub)} · ${x.lines.length} mondat</span>${done[x.id]?`<span class="small"><span class="pill ok">✓ ${done[x.id]} mondat kész</span></span>`:""}</button>`).join("")}</div>`);
  view.querySelectorAll("[data-sh]").forEach(b=>b.onclick=()=>{const src=srcs.find(x=>x.id===b.dataset.sh);if(!src)return;prefetch(...new Set(src.lines.map(t=>AUDIO_IDX[t]).filter(Boolean)));SH={src,i:0,url:null,rec:null,stream:null,hide:false,n:0,busy:false};drawShadow();});
}
function drawShadow(){
  const {src,i}=SH,line=src.lines[i],last=i===src.lines.length-1;
  subShell(["Árnyékolás",renderShadow],`Árnyékolás · ${esc(src.sub)}`,"",`<div class="pbar"><div class="track"><div class="fill" style="width:${i/src.lines.length*100}%"></div></div><span class="small muted tnum">${i+1}/${src.lines.length}</span></div>
    <div class="card stack" style="padding:1.4rem 1.1rem;min-height:7rem"><span class="label">${SH.hide?"Csak hallás után":"Mondd utána"}</span><div class="big-q" style="font-size:1.35rem" ${LA()}>${SH.hide?"• • •":esc(line)}</div></div>
    <div class="row" style="flex-wrap:wrap"><button class="btn soft" id="shPlay">▶ Minta</button><button class="btn soft" id="shSlow">▶ Lassan</button>${canRecord()?`<button class="btn ${SH.rec?"":"lemon"}" id="shRec" aria-pressed="${!!SH.rec}">${SH.rec?"■ Leállítás":"● Felvétel"}</button>`:""}<button class="btn ghost" id="shHide" aria-pressed="${SH.hide}">${SH.hide?"Szöveg mutatása":"Szöveg elrejtése"}</button></div>
    ${SH.url?`<div class="card stack"><b>Összehasonlítás</b><p class="small muted">Előbb a minta, aztán a te felvételed szól. Figyeld a hangsúlyt, a tempót és a szóvégeket.</p><div class="row"><button class="btn" id="shCmp">▶ Minta + saját</button><button class="btn ghost" id="shMine">▶ Csak a sajátom</button></div></div>`:""}
    <div class="row" style="justify-content:space-between"><button class="btn ghost" id="shPrev" ${i?"":"disabled"}>← Előző</button><button class="btn" id="shNext">${last?"Befejezés":"Következő →"}</button></div>`);
  $("#shPlay").onclick=()=>say(line);$("#shSlow").onclick=()=>say(line,true);
  $("#shHide").onclick=()=>{SH.hide=!SH.hide;drawShadow();};
  if($("#shRec"))$("#shRec").onclick=()=>SH.rec?shStop():shRecord(line);
  if($("#shCmp"))$("#shCmp").onclick=async()=>{const cur=SH;await say(line);if(SH===cur)shPlayMine();};
  if($("#shMine"))$("#shMine").onclick=shPlayMine;
  $("#shPrev").onclick=()=>{shReset();SH.i--;drawShadow();};
  $("#shNext").onclick=()=>{if(SH.url)SH.n++;shReset();if(last)return shFinish();SH.i++;drawShadow();};
  if(!SH.spoke){SH.spoke=1;setTimeout(()=>{if(SH&&SH.src.lines[SH.i]===line)say(line);},250);}
}
async function shRecord(line){
  const cur=SH;try{player.pause();speechSynthesis.cancel();}catch(e){}
  try{if(!cur.stream)cur.stream=await navigator.mediaDevices.getUserMedia({audio:true});}
  catch(e){toast(micMsg(e&&e.name==="NotAllowedError"?"not-allowed":"error"));return;}
  if(SH!==cur)return shCleanup(cur);
  const chunks=[],rec=new MediaRecorder(cur.stream);cur.rec=rec;
  rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
  rec.onstop=()=>{if(SH!==cur)return;if(cur.url)URL.revokeObjectURL(cur.url);cur.url=chunks.length?URL.createObjectURL(new Blob(chunks,{type:rec.mimeType||"audio/webm"})):null;cur.rec=null;drawShadow();if(cur.url)setTimeout(()=>{if(SH===cur)$("#shCmp")&&$("#shCmp").click();},200);};
  rec.start();drawShadow();
  /* Long enough for the line at a calm pace, then it stops by itself. */
  const ms=Math.min(15000,2000+line.split(/\s+/).length*550);setTimeout(()=>{if(SH===cur&&cur.rec===rec)shStop();},ms);
}
function shStop(){if(SH&&SH.rec&&SH.rec.state!=="inactive")try{SH.rec.stop();}catch(e){}}
function shPlayMine(){if(!SH||!SH.url)return;try{speechSynthesis.cancel();player.pause();player.src=SH.url;player.playbackRate=1;player.onended=null;player.play().catch(()=>{});}catch(e){}}
function shReset(){if(!SH)return;shStop();if(SH.url){URL.revokeObjectURL(SH.url);SH.url=null;}SH.spoke=0;}
function shCleanup(s){if(!s)return;try{if(s.rec&&s.rec.state!=="inactive")s.rec.stop();}catch(e){}if(s.stream)s.stream.getTracks().forEach(t=>t.stop());if(s.url)URL.revokeObjectURL(s.url);}
function shFinish(){
  const s=SH,n=s.n;S.shadow=S.shadow||{};S.shadow[s.src.id]=Math.max(S.shadow[s.src.id]||0,n);drillStat("shadow",true);incEv("drills");addXP(Math.max(3,n));save();
  shCleanup(s);SH=null;
  subShell(["Árnyékolás",renderShadow],"Árnyékolás",esc(s.src.t),`<div class="card stack" style="text-align:center"><h1>${LG().fin[1]}</h1><p class="muted">${n?`${n} mondatot mondtál utána felvétellel.`:"Végighallgattad a szöveget."} Az árnyékolás akkor hat igazán, ha ugyanazt a szöveget pár napig naponta megismétled.</p><div class="row" style="justify-content:center"><button class="btn" id="shAgain">Még egyszer</button></div></div>`);
  $("#shAgain").onclick=()=>{SH={src:s.src,i:0,url:null,rec:null,stream:null,hide:false,n:0};drawShadow();};
}
