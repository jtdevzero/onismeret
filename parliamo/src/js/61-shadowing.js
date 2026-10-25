/* ============ SHADOWING ============ */
/* Line by line: listen to the recording, repeat it, and the app records you (MediaRecorder) and plays the model and your
   version back to back, with both intonation curves drawn over each other (65-intonation.js). Nothing leaves the device;
   the recordings live only until the next line. */
let SH=null;
let SH_FILTER={lang:null,level:"all",type:"all"};
const canRecord=()=>!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
function shSources(){
  const pods=XT.pods.map(p=>({id:"pod-"+p.id,t:p.title,level:p.level,type:"pod",sub:"Podcast · "+p.level,lines:p.lines.map(x=>x.it),img:"pod-"+p.id}));
  const st=STORIES.map(s=>({id:"st-"+s.id,t:s.title||s.id,level:s.level,type:"story",sub:"Történet · "+(s.level||""),lines:s.lines.filter(x=>x.it).map(x=>x.it),img:s.img}));
  const ser=XT.ser.flatMap(s=>s.chapters.map((c,k)=>({id:`ser-${s.id}-${k}`,t:`${s.title}: ${c.title}`,level:s.level,type:"serial",sub:`Folytatásos · ${s.level} · ${k+1}. fejezet`,lines:c.lines.map(x=>x.it),img:s.img})));
  const levels=["A1","A2","B1","B2","C1","C2"],target=levels.indexOf(defLevel());
  return [...st,...pods,...ser].filter(x=>x.lines.length).sort((a,b)=>{
    const ai=levels.indexOf(a.level),bi=levels.indexOf(b.level),rank=i=>i<0?99:Math.abs(i-Math.max(0,target))*2+(i>target?1:0);
    return rank(ai)-rank(bi)||ai-bi;
  });
}
function shFilteredSources(sources,level="all",type="all"){return sources.filter(x=>(level==="all"||x.level===level)&&(type==="all"||x.type===type));}
function renderShadow(){stopViews();withExtra("serials",renderShadowNow);}
function renderShadowNow(){
  if(SH_FILTER.lang!==lang())SH_FILTER={lang:lang(),level:"all",type:"all"};
  const all=shSources(),srcs=shFilteredSources(all,SH_FILTER.level,SH_FILTER.type),done=S.shadow||{};
  const levels=["A1","A2","B1","B2","C1","C2"].filter(l=>all.some(s=>s.level===l));
  subShell(["Gyakorlás",()=>go("gyakorlas")],"Árnyékolás","Hallgasd, mondd utána, hasonlítsd össze",`<p class="muted">Válassz egy hangos szöveget. Mondatonként: meghallgatod a felvételt, utánamondod ugyanazzal a tempóval és hanglejtéssel, aztán az app egymás után lejátssza a mintát és a te felvételedet. A felvétel csak a te eszközödön marad.</p>
    ${canRecord()?"":`<div class="notice">Ebben a böngészőben nem érhető el hangfelvétel. A mondatokat így is meghallgathatod és utánamondhatod.</div>`}
    <div class="shadow-filters"><label>Szint<select id="shLevelFilter"><option value="all">Minden szint</option>${levels.map(l=>`<option value="${l}" ${SH_FILTER.level===l?"selected":""}>${l}</option>`).join("")}</select></label><label>Szövegtípus<select id="shTypeFilter">${[["all","Minden típus"],["story","Rövid történet"],["pod","Podcast"],["serial","Folytatásos történet"]].map(([k,l])=>`<option value="${k}" ${SH_FILTER.type===k?"selected":""}>${l}</option>`).join("")}</select></label></div>
    <p class="small muted" id="shSourceCount" role="status">${srcs.length} / ${all.length} szöveg · alapból a javasolt ${esc(defLevel())} szinthez közeliek elöl.</p>
    <div class="drills">${srcs.map((x,i)=>`<button class="drill" data-sh="${esc(x.id)}"><span class="dico c${i%4+1}">${I.mic}</span><b ${LA()}>${esc(x.t)}</b><span class="small muted">${esc(x.sub)} · ${x.lines.length} mondat</span>${done[x.id]?`<span class="small"><span class="pill ok">✓ ${esc(done[x.id])} mondat kész</span></span>`:""}</button>`).join("")}</div>${srcs.length?"":'<p class="notice">Ezzel a két szűrővel nincs találat. Válassz másik szintet vagy típust.</p>'}`);
  $("#shLevelFilter").onchange=e=>{SH_FILTER.level=e.target.value;renderShadowNow();};
  $("#shTypeFilter").onchange=e=>{SH_FILTER.type=e.target.value;renderShadowNow();};
  view.querySelectorAll("[data-sh]").forEach(b=>b.onclick=()=>{const src=srcs.find(x=>x.id===b.dataset.sh);if(!src)return;prefetch(...new Set(src.lines.map(t=>AUDIO_IDX[t]).filter(Boolean)));SH={src,i:0,url:null,rec:null,stream:null,hide:false,n:0,busy:false,completed:new Set()};drawShadow();});
}
function drawShadow(){
  const {src,i}=SH,line=src.lines[i],last=i===src.lines.length-1;
  subShell(["Árnyékolás",renderShadow],`Árnyékolás · ${esc(src.sub)}`,"",`<div class="pbar"><div class="track"><div class="fill" style="width:${i/src.lines.length*100}%"></div></div><span class="small muted tnum">${i+1}/${src.lines.length}</span></div>
    <div class="card stack" style="padding:1.4rem 1.1rem;min-height:7rem"><span class="label">${SH.hide?"Csak hallás után":"Mondd utána"}</span><div class="big-q" style="font-size:1.35rem" ${LA()}>${SH.hide?"• • •":esc(line)}</div></div>
    <div class="speech-controls"><button class="btn soft" id="shPlay" ${SH.rec||SH.busy?"disabled":""}>▶︎ Minta</button><button class="btn soft" id="shSlow" ${SH.rec||SH.busy?"disabled":""}>▶︎ Lassan</button>${canRecord()?`<button class="btn ${SH.rec?"":"lemon"}" id="shRec" aria-pressed="${!!SH.rec}" ${SH.busy?"disabled":""}>${SH.busy?"Mikrofon indítása…":SH.rec?"■ Leállítás":"● Felvétel"}</button>`:""}<button class="btn ghost" id="shHide" aria-pressed="${SH.hide}" ${SH.rec||SH.busy?"disabled":""}>${SH.hide?"Szöveg mutatása":"Szöveg elrejtése"}</button></div>
    ${SH.rec?'<div class="speech-record-status" role="status"><b id="shTimer">Felvétel · 0:00</b><label>Jelszint <meter id="shLevel" min="0" max="1" value="0" aria-label="A mikrofon becsült jelszintje"></meter></label><span class="small muted">A zöld jel a hangerőt mutatja, nem a kiejtést.</span></div>':""}
    <div class="speech-progress"><span id="shPlaybackClock" class="small muted">Lejátszás: álló helyzet</span><progress id="shPlaybackProgress" max="1" value="0" aria-label="A felvett hang lejátszási ideje"></progress></div>
    <details class="g speech-guide"><summary>Hogyan gyakorolj?</summary><div class="gb"><p>Hallgasd meg a mintát, majd vedd fel a mondatot. Hallgasd vissza egymás után a két változatot, és válassz egy részletet, amit újra próbálsz. A görbe egyszerű hangmagasság-becslés; nem pontozza a kiejtést.</p><p class="small muted">A hang csak a böngésző memóriájában marad, mondatváltáskor töröljük. A felvétel leállításakor a mikrofont is kikapcsoljuk.</p></div></details>
    ${SH.url?`<div class="card stack"><b>Összehasonlítás</b><p class="small muted">Előbb a minta, aztán a te felvételed szól. Figyeld a hangsúlyt, a tempót és a szóvégeket.</p><div class="row"><button class="btn" id="shCmp">▶︎ Minta + saját</button><button class="btn ghost" id="shMine">▶︎ Csak a sajátom</button></div><div id="shInto">${SH.into===undefined?`<p class="small muted">A hanglejtés kirajzolása…</p>`:intonationHtml(SH.into)}</div></div>`:""}
    <div class="row" style="justify-content:space-between"><button class="btn ghost" id="shPrev" ${i?"":"disabled"}>← Előző</button><button class="btn" id="shNext">${last?"Befejezés":"Következő →"}</button></div>`);
  shBindPlayback(SH);shUpdateRecording(SH);
  $("#shPlay").onclick=()=>shPlayModel(line);$("#shSlow").onclick=()=>shPlayModel(line,true);
  $("#shHide").onclick=()=>{SH.hide=!SH.hide;drawShadow();};
  if($("#shRec"))$("#shRec").onclick=()=>SH.rec?shStop():shRecord(line);
  if($("#shCmp"))$("#shCmp").onclick=async()=>{const cur=SH,take=cur.take;await shPlayModel(line);if(SH===cur&&cur.take===take)shPlayMine();};
  if($("#shMine"))$("#shMine").onclick=shPlayMine;
  $("#shPrev").onclick=()=>{shReset();SH.i--;drawShadow();};
  $("#shNext").onclick=()=>{if(SH.url){SH.completed=SH.completed||new Set();SH.completed.add(i);SH.n=SH.completed.size;}shReset();if(last)return shFinish();SH.i++;drawShadow();};
  if(!SH.spoke){SH.spoke=1;const cur=SH;setTimeout(()=>{if(SH===cur&&cur.src.lines[cur.i]===line&&!cur.rec&&!cur.busy)shPlayModel(line);},250);}
}
async function shRecord(line){
  const cur=SH;if(!cur||cur.rec||cur.busy)return;const take=cur.take=(cur.take||0)+1;cur.busy=true;drawShadow();try{player.pause();speechSynthesis.cancel();if(sayDone){sayDone();sayDone=null;}}catch(e){}
  let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:true});}
  catch(e){if(SH===cur&&cur.take===take){cur.busy=false;toast(micMsg(e&&e.name==="NotAllowedError"?"not-allowed":"error"));drawShadow();}return;}
  if(SH!==cur||cur.take!==take){stream.getTracks().forEach(t=>t.stop());return;}cur.stream=stream;
  const chunks=[];let rec;
  try{rec=new MediaRecorder(cur.stream);}catch(e){cur.busy=false;shReleaseInput(cur);toast("Ezen az eszközön nem sikerült elindítani a hangfelvételt.");drawShadow();return;}cur.rec=rec;cur.busy=false;
  rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
  rec.onstop=()=>{if(SH!==cur||cur.take!==take)return;shReleaseInput(cur);if(cur.url)URL.revokeObjectURL(cur.url);const blob=chunks.length?new Blob(chunks,{type:rec.mimeType||"audio/webm"}):null;cur.url=blob?URL.createObjectURL(blob):null;cur.into=undefined;cur.rec=null;drawShadow();
    if(blob)analyseIntonation(line,blob).catch(()=>null).then(r=>{if(SH!==cur||cur.take!==take)return;cur.into=r;const el=$("#shInto");if(el)el.innerHTML=intonationHtml(r);shUpdatePlayback(cur);});if(cur.url)cur.compareTimer=setTimeout(()=>{cur.compareTimer=null;if(SH===cur&&cur.take===take)$("#shCmp")&&$("#shCmp").click();},200);};
  rec.onerror=()=>{if(SH!==cur||cur.take!==take)return;shReleaseInput(cur);cur.rec=null;toast("Nem sikerült a felvétel. Próbáld újra.");drawShadow();};
  try{rec.start();cur.recordedAt=Date.now();shStartMeter(cur);drawShadow();}catch(e){cur.rec=null;shReleaseInput(cur);toast("Nem sikerült a felvétel. Próbáld újra.");drawShadow();return;}
  /* Long enough for the line at a calm pace, then it stops by itself. */
  const ms=Math.min(15000,2000+line.split(/\s+/).length*550);setTimeout(()=>{if(SH===cur&&cur.rec===rec)shStop();},ms);
}
function shStop(){if(SH&&SH.rec&&SH.rec.state!=="inactive")try{SH.rec.stop();}catch(e){}}
function shPlayModel(line,slow){if(!SH||SH.rec||SH.busy)return Promise.resolve();clearTimeout(SH.compareTimer);SH.compareTimer=null;return say(line,slow);}
function shPlayMine(){if(!SH||!SH.url||SH.rec||SH.busy)return;clearTimeout(SH.compareTimer);SH.compareTimer=null;try{speechSynthesis.cancel();if(sayDone){sayDone();sayDone=null;}player.pause();player.src=SH.url;player.playbackRate=1;player.onended=null;player.play().catch(()=>{});}catch(e){}}
function shReset(){if(!SH)return;clearTimeout(SH.compareTimer);SH.compareTimer=null;SH.take=(SH.take||0)+1;SH.busy=false;shStop();SH.rec=null;shReleaseInput(SH);try{player.pause();speechSynthesis.cancel();if(sayDone){sayDone();sayDone=null;}}catch(e){}if(SH.url){URL.revokeObjectURL(SH.url);SH.url=null;}SH.into=undefined;SH.spoke=0;}
function shReleaseInput(s){if(!s)return;cancelAnimationFrame(s.meterFrame||0);if(s.meterCtx){s.meterCtx.close().catch(()=>{});s.meterCtx=null;}s.analyser=null;if(s.stream){s.stream.getTracks().forEach(t=>t.stop());s.stream=null;}}
function shCleanup(s){if(!s)return;clearTimeout(s.compareTimer);s.compareTimer=null;s.take=(s.take||0)+1;try{if(s.rec&&s.rec.state!=="inactive")s.rec.stop();}catch(e){}shReleaseInput(s);if(s.playListener)for(const e of ["timeupdate","loadedmetadata","play","pause","ended","emptied"])player.removeEventListener(e,s.playListener);if(s.url)URL.revokeObjectURL(s.url);}
function shClock(seconds){const n=Math.max(0,Math.floor(Number(seconds)||0));return Math.floor(n/60)+":"+String(n%60).padStart(2,"0");}
function shBindPlayback(s){if(!s.playListener){s.playListener=()=>shUpdatePlayback(s);for(const e of ["timeupdate","loadedmetadata","play","pause","ended","emptied"])player.addEventListener(e,s.playListener);}shUpdatePlayback(s);}
function shUpdatePlayback(s){
  if(SH!==s)return;const line=s.src.lines[s.i],src=player.currentSrc||player.src,kind=s.url&&src===s.url?"saját":CLIPS[line]&&src===CLIPS[line]?"minta":null;
  const duration=Number.isFinite(player.duration)?player.duration:0,time=kind?player.currentTime||0:0,ratio=kind&&duration>0?Math.max(0,Math.min(1,time/duration)):0;
  const clock=$("#shPlaybackClock"),progress=$("#shPlaybackProgress");if(clock)clock.textContent=kind?`${kind==="minta"?"Minta":"Saját felvétel"} · ${shClock(time)} / ${shClock(duration)}${player.paused?" · szünet":""}`:"Lejátszás: álló helyzet · időjel csak felvett hanghoz";if(progress)progress.value=ratio;
  view.querySelectorAll("[data-intonation-cursor]").forEach(cursor=>{cursor.setAttribute("x1",String(ratio*320));cursor.setAttribute("x2",String(ratio*320));cursor.setAttribute("visibility",kind&&duration?"visible":"hidden");});
}
function shStartMeter(s){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;s.meterCtx=new AC();const source=s.meterCtx.createMediaStreamSource(s.stream);s.analyser=s.meterCtx.createAnalyser();s.analyser.fftSize=512;source.connect(s.analyser);s.meterSamples=new Float32Array(s.analyser.fftSize);s.meterCtx.resume().catch(()=>{});}catch(e){s.analyser=null;}}
function shUpdateRecording(s){
  cancelAnimationFrame(s.meterFrame||0);if(SH!==s||!s.rec)return;
  const tick=()=>{if(SH!==s||!s.rec)return;const timer=$("#shTimer"),meter=$("#shLevel");if(timer)timer.textContent="Felvétel · "+shClock((Date.now()-s.recordedAt)/1000);if(meter){let rms=0;if(s.analyser){s.analyser.getFloatTimeDomainData(s.meterSamples);for(const x of s.meterSamples)rms+=x*x;rms=Math.sqrt(rms/s.meterSamples.length);}meter.value=Math.min(1,rms*4);meter.title=s.analyser?"Becsült hangerő; nem kiejtési pontszám":"Ezen az eszközön a jelszint nem érhető el";}s.meterFrame=requestAnimationFrame(tick);};tick();
}
function shFinish(){
  const s=SH,n=s.n;S.shadow=S.shadow||{};S.shadow[s.src.id]=Math.max(S.shadow[s.src.id]||0,n);drillStat("shadow",true);incEv("drills");addXP(Math.max(3,n));save();
  shCleanup(s);SH=null;
  subShell(["Árnyékolás",renderShadow],"Árnyékolás",esc(s.src.t),`<div class="card stack" style="text-align:center"><h1>${LG().fin[1]}</h1><p class="muted">${n?`${n} mondatot mondtál utána felvétellel.`:"Végighallgattad a szöveget."} Az árnyékolás akkor hat igazán, ha ugyanazt a szöveget pár napig naponta megismétled.</p><div class="row" style="justify-content:center"><button class="btn" id="shAgain">Még egyszer</button></div></div>`);
  $("#shAgain").onclick=()=>{SH={src:s.src,i:0,url:null,rec:null,stream:null,hide:false,n:0,completed:new Set()};drawShadow();};
}
