/* ============ DEVICE CHECK ============ */
async function renderCheck(){
  stopViews();const language=lang(),navigation=NAVN,locale=LG();
  const rows=[];const row=(id,t)=>rows.push([id,t]);
  row("audio","Felvett hang lejátszása");row("tts",LG().name+" felolvasó hang");row("hu","Magyar felolvasó hang (autós ismétléshez)");row("mic","Mikrofon és beszédfelismerés");
  if(IS_WEB){row("push","Értesítések");row("ai","AI-kapcsolat");row("sync","Szinkron");row("store","Offline tárolás");row("inst","Telepítés a kezdőképernyőre");}else row("ai","AI-tanár (claude.ai)");
  view.innerHTML=`<div class="stack"><div class="row"><button class="btn ghost" data-go="ma">← Kezdőlap</button></div>
    <div><span class="label">Hibaelhárítás</span><h1>Eszközellenőrzés</h1><p class="muted">Végignézem, mi működik ezen az eszközön, és ha valami nem, megmondom, mit kell beállítani.</p></div>
    <div class="card stack chk">${rows.map(([id,t])=>`<div class="chkrow" id="ck-${id}"><span class="ck" aria-hidden="true">…</span><div style="min-width:0;flex:1"><b>${esc(t)}</b><div class="small muted ckmsg">Ellenőrzés…</div></div><span class="ckact"></span></div>`).join("")}</div></div>`;
  const panel=view.firstElementChild,current=()=>lang()===language&&NAVN===navigation&&view.firstElementChild===panel;
  const set=(id,st,msg,act)=>{if(!current())return;const el=$("#ck-"+id);if(!el)return;el.querySelector(".ck").textContent=st==="ok"?"✓":st==="bad"?"✗":"–";el.className="chkrow "+st;el.querySelector(".ckmsg").textContent=msg;el.querySelector(".ckact").innerHTML=act||"";};
  const w=WORDS.find(x=>AUDIO_IDX[x.it]);
  const playAudio=async()=>{if(w)await say(w.it);if(!current())return;const yes=$("#ckYes"),no=$("#ckNo");if(yes)yes.hidden=false;if(no)no.hidden=false;};
  const drawAudio=()=>{
    set("audio","info","Nyomd meg a gombot: hallasz egy felvett szót?",`<span class="row" style="gap:.3rem"><button class="btn ghost" id="ckPlay">Lejátszás</button><button class="btn ghost" id="ckYes" hidden>Hallottam</button><button class="btn ghost" id="ckNo" hidden>Nem</button></span>`);
    $("#ckPlay").onclick=playAudio;
    $("#ckYes").onclick=()=>set("audio","ok","A felvett hangok működnek.");
    $("#ckNo").onclick=()=>{set("audio","bad","Nem szól a hang. Nézd meg a hangerőt és a némítás kapcsolót (iPhone oldalsó kapcsoló), majd próbáld újra.",`<button class="btn ghost" id="ckPlay2">Újra</button>`);const retry=$("#ckPlay2");if(retry)retry.onclick=()=>{if(!current())return;drawAudio();playAudio();};};
  };drawAudio();
  const vs=await new Promise(resolve=>{
    const synth=typeof speechSynthesis!=="undefined"?speechSynthesis:null;if(!synth)return resolve([]);
    let timer,done=false;const finish=()=>{if(done)return;done=true;clearTimeout(timer);if(synth.removeEventListener)synth.removeEventListener("voiceschanged",finish);try{resolve(synth.getVoices());}catch(e){resolve([]);}};
    try{if(synth.getVoices().length)return finish();if(synth.addEventListener)synth.addEventListener("voiceschanged",finish);timer=setTimeout(finish,1500);}catch(e){finish();}
  });
  if(!current())return;
  const pre=locale.tts.slice(0,2);
  vs.some(v=>new RegExp("^"+pre,"i").test(v.lang))?set("tts","ok","Van "+LG().adj+" hang a böngészőben (az AI szövegeit ez olvassa fel)."):set("tts","bad",`Nincs ${LG().adj} felolvasó hang. Telepíts ${LG().adj} hangcsomagot a rendszerbeállításokban (Beállítások → Kisegítő lehetőségek → Felolvasás), vagy használj Chrome-ot.`);
  vs.some(v=>/^hu/i.test(v.lang))?set("hu","ok","Van magyar hang."):set("hu","bad","Nincs magyar felolvasó hang, ezért az autós ismétlés a magyar jelentést nem tudja felolvasni. Telepíts magyar hangot a rendszerbeállításokban.");
  if(!IS_WEB)set("mic","info","A claude.ai felületén a mikrofon nem érhető el. A beszédfunkciókhoz nyisd meg a webappot.");
  else if(!canSpeak())set("mic","bad","Ez a böngésző nem ismeri a beszédfelismerést. Chrome-ban (Android, gép) és Safariban (iPhone) működik.");
  else set("mic","info",`Nyomd meg, és mondd: „${({en:"hello",it:"ciao",es:"hola"})[language]}”.`,`<button class="btn ghost" id="ckMic">Próba</button>`);
  if($("#ckMic"))$("#ckMic").onclick=async()=>{set("mic","info","Hallgatlak…");try{const a=await listen();if(!current())return;set("mic","ok","Működik. Ezt hallottam: „"+a[0]+"”");}catch(e){if(!current())return;set("mic","bad",micMsg(e),`<button class="btn ghost" id="ckMic">Újra</button>`);if($("#ckMic"))$("#ckMic").onclick=()=>renderCheck();}};
  if(IS_WEB){
    if(!("Notification" in window)||!("serviceWorker" in navigator))set("push","bad","Ez a böngésző nem tud értesítést küldeni. iPhone-on előbb tedd a kezdőképernyőre az appot, és onnan nyisd meg.");
    else if(Notification.permission==="denied")set("push","bad","Az értesítések le vannak tiltva. Engedélyezd az oldal beállításaiban (lakat ikon a címsorban).");
    else{let sub=null;try{const reg=await navigator.serviceWorker.getRegistration();sub=reg&&await reg.pushManager.getSubscription();}catch(e){}
      if(!current())return;
      S.settings.remind&&S.settings.remind.on&&sub?set("push","ok","Be van kapcsolva, minden nap "+String(S.settings.remind.hour).padStart(2,"0")+":00 körül."):set("push","info","Nincs bekapcsolva. A Beállításokban a Napi emlékeztetőnél kapcsolhatod be.");}
    if(!S.settings.proxy||!S.settings.pass)set("ai","bad","Nincs beállítva. Ma → Beállítások → AI-kapcsolat: add meg a szerver címét és a belépőkódot.");
    else{const job=createAIRequest(current,{timeoutMs:15000});try{await job.text("Válaszolj egyetlen szóval: ok",{modelTier:"quick"});set("ai","ok","Működik.");}catch(e){if(!job.owns())return;set("ai","bad",aiRequestMessage(e));}}
    if(!current())return;
    if(!S.settings.cloud)set("sync","info","Nincs bekapcsolva. Ha több eszközön tanulsz, kapcsold be a Beállításokban.");
    else{try{const r=await proxyPost("/sync/get");set("sync","ok","Működik (verzió: "+(r.rev||0)+").");}catch(e){set("sync","bad",pushMsg(e));}}
    if(!current())return;
    try{const est=navigator.storage&&await navigator.storage.estimate(),pers=navigator.storage&&navigator.storage.persisted&&await navigator.storage.persisted();
      const mb=est?Math.round((est.usage||0)/1e6):0;set("store",mb>20?"ok":"info",`${mb} MB tárolva${pers?", tartós tárolás engedélyezve":""}. ${mb>20?"":"A Beállításokban a „Letöltés offline használatra” gombbal minden letölthető."}`);}catch(e){set("store","info","Nem sikerült lekérdezni.");}
    matchMedia("(display-mode: standalone)").matches||navigator.standalone?set("inst","ok","Az app a kezdőképernyőről fut."):set("inst","info","Böngészőből fut. A kezdőképernyőre tett app gyorsabban indul, és iPhone-on csak úgy működnek az értesítések. (Megosztás → Hozzáadás a kezdőképernyőhöz)");
  }else{const s=await getSample();if(!current())return;s?set("ai","ok","Az AI-tanár elérhető."):set("ai","bad","Az AI-tanár itt nem érhető el.");}
}

