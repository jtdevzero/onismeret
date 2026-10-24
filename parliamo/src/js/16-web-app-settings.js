/* ============ WEB APP SETTINGS ============ */
function webSettings(){
  return `<div class="card stack" style="gap:.6rem"><span class="label">AI-kapcsolat</span>
    <p class="small muted">A saját AI-szervered címe és a belépőkód a telepítési útmutatóból. A Claude API-kulcs a szerveren marad, ide nem kell beírni.</p>
    <input id="sProxy" inputmode="url" autocomplete="off" placeholder="https://parliamo-ai.fiokod.workers.dev" value="${esc(S.settings.proxy)}" aria-label="AI-szerver címe">
    <input id="sPass" type="password" autocomplete="off" placeholder="Belépőkód" value="${esc(S.settings.pass)}" aria-label="Belépőkód">
    <div class="row"><button class="btn soft" id="sAiSave">Mentés és próba</button><span class="small" id="sAiMsg" role="status"></span></div></div>
  <div class="card stack" style="gap:.6rem"><span class="label">Napi emlékeztető</span>
    <p class="small muted">Értesítést kapsz a telefonodra a választott órában, ha aznap még nem gyakoroltál. iPhone-on előbb add hozzá az appot a kezdőképernyőhöz.</p>
    <div class="row"><label class="row" style="gap:.4rem"><span class="small">Időpont</span><select id="sRemH" style="width:auto">${Array.from({length:24},(_,h)=>`<option value="${h}" ${(S.settings.remind&&S.settings.remind.hour||18)===h?"selected":""}>${String(h).padStart(2,"0")}:00</option>`).join("")}</select></label>
      <button class="btn soft" id="sRemOn">${S.settings.remind&&S.settings.remind.on?"Mentés":"Bekapcsolás"}</button>${S.settings.remind&&S.settings.remind.on?`<button class="btn ghost" id="sRemTest">Próba</button><button class="btn ghost" id="sRemOff">Kikapcsolás</button>`:""}</div>
    <span class="small" id="sRemMsg" role="status">${S.settings.remind&&S.settings.remind.on?"Bekapcsolva: minden nap "+String(S.settings.remind.hour).padStart(2,"0")+":00 körül.":""}</span></div>
  <div class="card stack" style="gap:.6rem"><span class="label">Szinkron eszközök között</span>
    <p class="small muted">A haladásod a saját AI-szervereden is tárolódik, így a telefonodon és a gépeden ugyanott tartasz. Minden eszközön add meg ugyanazt a címet és belépőkódot, és kapcsold be itt.</p>
    <div class="row"><span class="seg" id="sSync"><button data-v="1" aria-pressed="${!!S.settings.cloud}">Be</button><button data-v="0" aria-pressed="${!S.settings.cloud}">Ki</button></span>${S.settings.cloud?`<button class="btn ghost" id="sSyncNow">Szinkron most</button>`:""}</div>
    <span class="small" id="sSyncMsg" role="status">${syncLine()}</span></div>
  ${usageCard()}
  <div class="card stack" style="gap:.6rem"><span class="label">Offline és mentés</span>
    <div class="row"><button class="btn ghost" id="sOffline">Letöltés offline használatra</button><span class="small muted" id="sOffMsg" role="status"></span></div>
    <p class="small muted">Letölti mindhárom nyelv hangjait és képeit (kb. 60 MB), hogy net nélkül is működjön. Az AI-funkciókhoz net kell.</p>
    <div class="row"><button class="btn ghost" id="sExport">Haladás mentése fájlba</button><label class="btn ghost" for="sImport">Visszatöltés fájlból</label><input type="file" id="sImport" accept="application/json,.json" hidden></div></div>`;
}
/* Daily reminder via Web Push through the user's own server (worker/). */
const localDay=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);};
async function proxyPost(path,body){
  const st=S.settings;if(!st.proxy||!st.pass)throw {code:"no_proxy"};
  const r=await fetch(st.proxy.replace(/\/+$/,"")+path,{method:"POST",headers:{"content-type":"application/json","x-app-key":st.pass},body:JSON.stringify(body||{})});
  if(r.status===401)throw {code:"bad_key"};if(r.status===501)throw {code:"push_unavailable"};if(r.status===409)throw {code:"conflict"};if(r.status===413)throw {code:"too_big"};if(!r.ok)throw {code:"error"};return r.json();
}
async function pushSub(){
  if(!("serviceWorker" in navigator)||!("PushManager" in window))throw {code:"unsupported"};
  const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
  if(!sub){const {key}=await proxyPost("/push/key");const raw=Uint8Array.from(atob(key.replace(/-/g,"+").replace(/_/g,"/")+"===".slice((key.length+3)%4)),c=>c.charCodeAt(0));
    sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:raw});}
  return sub;
}
async function pushSync(){
  const r=S.settings.remind;if(!IS_WEB||!r||!r.on)return;
  const sub=await pushSub();await proxyPost("/push/subscribe",{subscription:sub.toJSON(),hour:r.hour,tz:-new Date().getTimezoneOffset(),lastDay:S.days[today()]?localDay():""});
}
const pushMsg=e=>({unsupported:"Ez a böngésző nem támogatja az értesítéseket. iPhone-on add hozzá az appot a kezdőképernyőhöz, és onnan nyisd meg.",no_proxy:"Előbb állítsd be az AI-kapcsolatot (szerver címe és belépőkód).",push_unavailable:"A szerveren még nincs bekapcsolva ez a funkció (tároló). Futtasd újra a telepítést (lásd az útmutatót).",too_big:"A haladásod túl nagy a szinkronhoz. Mentsd fájlba a Beállításokban.",denied:"Az értesítések le vannak tiltva a böngészőben. Engedélyezd az oldal beállításaiban."}[e&&e.code]||aiErr(e));
function bindWebSettings(){
  bindUsage();
  const msg=$("#sRemMsg");
  $("#sRemOn").onclick=async e=>{e.preventDefault();msg.style.color="";msg.textContent="Beállítom…";
    try{if(!("Notification" in window))throw {code:"unsupported"};if(Notification.permission!=="granted"&&(await Notification.requestPermission())!=="granted")throw {code:"denied"};
      S.settings.remind={on:true,hour:+$("#sRemH").value};save();await pushSync();renderHome();view.querySelector("details.g").open=true;$("#sRemMsg").style.color="var(--ok)";}
    catch(err){S.settings.remind={on:false,hour:+$("#sRemH").value};save();msg.style.color="var(--bad)";msg.textContent=pushMsg(err);}};
  if($("#sRemOff"))$("#sRemOff").onclick=async e=>{e.preventDefault();try{const reg=await navigator.serviceWorker.ready;const sub=await reg.pushManager.getSubscription();if(sub){await proxyPost("/push/unsubscribe",{endpoint:sub.endpoint}).catch(()=>{});await sub.unsubscribe();}}catch(err){}
    S.settings.remind={on:false,hour:S.settings.remind.hour};save();renderHome();view.querySelector("details.g").open=true;};
  if($("#sRemTest"))$("#sRemTest").onclick=async e=>{e.preventDefault();msg.textContent="Küldöm…";try{const sub=await pushSub();const r=await proxyPost("/push/test",{subscription:sub.toJSON()});msg.textContent=r.ok?"Elküldve. Pár másodpercen belül meg kell jelennie.":"A küldés nem sikerült ("+r.status+").";}catch(err){msg.textContent=pushMsg(err);}};
  $("#sSync").querySelectorAll("button").forEach(b=>b.onclick=async e=>{e.preventDefault();const on=b.dataset.v==="1";
    if(on&&(!S.settings.proxy||!S.settings.pass)){$("#sSyncMsg").textContent=pushMsg({code:"no_proxy"});return;}
    S.settings.cloud=on;cloudErr="";save();renderHome();view.querySelector("details.g").open=true;if(on){$("#sSyncMsg").textContent="Szinkronizálok…";await cloudSync();}});
  if($("#sSyncNow"))$("#sSyncNow").onclick=async e=>{e.preventDefault();$("#sSyncMsg").textContent="Szinkronizálok…";await cloudSync();};
  $("#sAiSave").onclick=async e=>{e.preventDefault();S.settings.proxy=$("#sProxy").value.trim();S.settings.pass=$("#sPass").value;save();
    const m=$("#sAiMsg"),s=proxySample();if(!s){m.textContent="Add meg a címet és a kódot.";return;}
    m.textContent="Próba…";try{await s("Válaszolj egyetlen szóval: ok",{modelTier:"quick"});m.style.color="var(--ok)";m.textContent="Működik.";}
    catch(err){m.style.color="var(--bad)";m.textContent=aiErr(err);}};
  $("#sOffline").onclick=async e=>{e.preventDefault();const m=$("#sOffMsg");m.textContent="Összeállítom a listát…";
    try{const files=[...Object.keys(LANGS).flatMap(l=>[`data/${l}.json`,`data/stories-${l}.json`,`data/verbs-${l}.json`]),...Object.keys(LANGS).map(l=>`data/drills-${l}.json`),"img/hero.webp","img/hero-en.webp","img/hero-es.webp","img/teacher.webp",...SCENARIOS.map(x=>"img/sc-"+x.id+".webp")];
      for(const l of Object.keys(LANGS)){const [pk,st,vb]=await Promise.all([`data/${l}.json`,`data/stories-${l}.json`,`data/verbs-${l}.json`].map(u=>fetch(u).then(r=>r.json())));
        pk.units.forEach(u=>files.push("audio/"+u.id+".json","img/"+u.id+".webp"));st.stories.forEach(x=>files.push("audio/st-"+x.id+".json"));
        files.push(...["podcasts","pron","exam","packs"].map(n=>`data/${n}-${l}.json`),`audio/pron-${l}.json`);
        if(l==="en"){files.push("data/writing-en.json","data/vocabtest-en.json","audio/vb-en.json","audio/pron-en.json","audio/acc-en.json","audio/dl-en.json","data/podcasts-en.json","data/pron-en.json","data/exam-en.json","data/accents-en.json","data/packs-en.json","data/offline-en.json");}
        const [pdl,pkl]=await Promise.all([`data/podcasts-${l}.json`,`data/packs-${l}.json`].map(u=>fetch(u).then(r=>r.ok?r.json():null).catch(()=>null)));
        (pdl?pdl.podcasts:[]).forEach(p=>files.push("audio/pod-"+p.id+".json","img/pod-"+p.id+".webp"));(pkl?pkl.packs:[]).forEach(p=>files.push(`audio/pk-${l}-${p.id}.json`));
        if(l!=="en")vb.verbs.forEach(v=>files.push("audio/vb-"+(l==="es"?"es-":"")+v.inf+".json"));}
      let k=0;for(const f of files){await fetch(f).catch(()=>{});k++;m.textContent=`${k} / ${files.length}`;}
      m.textContent="Kész, az app net nélkül is működik.";}catch(err){m.textContent="A letöltés megszakadt. Próbáld újra, amikor van net.";}};
  $("#sExport").onclick=e=>{e.preventDefault();const out=JSON.parse(JSON.stringify(S));out.settings.pass="";
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(out)],{type:"application/json"}));
    a.download="parliamo-mentes-"+new Date().toISOString().slice(0,10)+".json";document.body.appendChild(a);a.click();a.remove();toast("A mentés letöltve.");};
  $("#sImport").onchange=async e=>{const f=e.target.files[0];if(!f)return;
    try{const o=JSON.parse(await f.text());if(typeof o!=="object"||!o.cards||typeof o.xp!=="number")throw 0;
      const keep={proxy:S.settings.proxy,pass:S.settings.pass};S=migrate(o);Object.assign(S.settings,keep);save();await loadCourse();render();toast("Haladás visszatöltve.");}
    catch(err){toast("Ez a fájl nem Parliamo-mentés.");}};
}

