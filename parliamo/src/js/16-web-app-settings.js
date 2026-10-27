/* ============ WEB APP SETTINGS ============ */
let AI_CHECK=null;
function aiConfigured(){return !IS_WEB||!!(S.settings.proxy&&S.settings.pass);}
function aiChecked(){return AI_CHECK&&AI_CHECK.proxy===S.settings.proxy&&AI_CHECK.pass===S.settings.pass&&AI_CHECK.user===(S.settings.user||"")?AI_CHECK:null;}
function aiAccessBadge(){
  const check=aiChecked(),label=!IS_WEB?"AI az alkalmazáson keresztül":!aiConfigured()?"AI-beállítás szükséges":check?(check.ok?"AI-kapcsolat ellenőrizve":check.noAI?"Szerver kapcsolódva · AI nélkül":"AI-kapcsolati hiba"):"AI beállítva · próba szükséges";
  return `<span class="access-badge ${check&&check.ok?"ok":""}" data-ai-status>${label}</span>`;
}
function aiSetupNotice(){
  if(!IS_WEB)return `<div class="notice">${aiMissing()}</div>`;
  return `<div class="notice stack" style="gap:.6rem"><div><b>Az AI-tanárhoz külön kapcsolat szükséges.</b><p class="small">A leckék, a kész hanganyagok és az ismétlés AI nélkül is használhatók. Az AI a saját szervereden keresztül működik, és használati költsége lehet.</p></div><div><button class="btn soft" data-ai-setup>AI-kapcsolat beállítása</button></div></div>`;
}
function bindAISetup(root=view,back){root.querySelectorAll("[data-ai-setup]").forEach(b=>b.onclick=()=>openAISettings(back));}
function openAISettings(back){
  const returnTo=typeof back==="function"?back:()=>render();
  view.innerHTML=`<div class="player"><div><button class="btn ghost" id="aiSetupBack">← Vissza</button></div><div class="stack" style="gap:.5rem"><span class="label">Beállítások</span><h1>AI-kapcsolat</h1><p class="muted">Add meg a telepítéskor kapott szervercímet és belépőkódot. A próba egy rövid AI-kérést küld.</p></div>${webSettings(true)}<div class="card stack"><h3>AI nélkül is tanulhatsz</h3><p class="small muted">A leckék, az ismétlőkártyák és a kész hanganyagok külön AI-kapcsolat nélkül működnek. A saját AI-szerver telepítésének lépéseit a projekt útmutatója írja le.</p><a href="https://github.com/jtdevzero/onismeret/tree/main/parliamo#readme" target="_blank" rel="noopener noreferrer">Telepítési útmutató ↗</a></div></div>`;
  $("#aiSetupBack").onclick=returnTo;bindWebSettings();window.scrollTo(0,0);view.focus({preventScroll:true});
}
function aiConnectionSettings(){
  return `<div class="card stack" style="gap:.8rem"><div class="row" style="justify-content:space-between"><h3>AI-kapcsolat</h3>${aiAccessBadge()}</div>
    <p class="small muted">A saját AI-szervered címe és a belépőkód a telepítési útmutatóból. A Claude API-kulcs a szerveren marad, ide nem kell beírni. A címet és a belépőkódot ez a böngésző megjegyzi.</p>
    <label class="stack" style="gap:.3rem" for="sProxy"><span class="small">AI-szerver címe</span><input id="sProxy" type="url" inputmode="url" autocomplete="off" spellcheck="false" placeholder="https://parliamo-ai.fiokod.workers.dev" value="${esc(S.settings.proxy)}" aria-describedby="sProxyHelp"></label>
    <p class="small muted" id="sProxyHelp">A telepítéskor kapott HTTPS-címet használd (workers.dev), vagy az alkalmazás saját címét.</p>
    <label class="stack" style="gap:.3rem" for="sUser"><span class="small">Felhasználónév</span><input id="sUser" autocomplete="username" autocapitalize="off" spellcheck="false" placeholder="pl. anna (egyfelhasználós szervernél üresen marad)" value="${esc(S.settings.user||"")}" aria-describedby="sUserHelp"></label>
    <p class="small muted" id="sUserHelp">Ha a szervereden több tanuló van, mindenki a saját nevével és jelszavával lép be, és mindenkinek külön tárolódik a haladása.</p>
    <label class="stack" style="gap:.3rem" for="sPass"><span class="small">Jelszó (belépőkód)</span><input id="sPass" type="password" autocomplete="current-password" placeholder="A jelszavad vagy a szerver belépőkódja" value="${esc(S.settings.pass)}"></label>
    <div class="row"><button class="btn" id="sAiSave">Mentés és kapcsolat ellenőrzése</button><span class="small" id="sAiMsg" role="status" aria-live="polite"></span></div></div>`;
}
function webSettings(aiOnly=false){
  const connection=aiConnectionSettings();if(aiOnly)return connection;
  return connection+`
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
    <div class="row"><label class="stack" style="gap:.3rem" for="sOfflineLang"><span class="small">Offline tananyag</span><select id="sOfflineLang" style="width:auto">${Object.entries(LANGS).map(([key,L])=>`<option value="${key}" ${key===lang()?"selected":""}>${esc(L.name)}</option>`).join("")}<option value="all">Mindhárom nyelv</option></select></label><button class="btn ghost" id="sOffline">Letöltés és ellenőrzés</button></div>
    <p class="small muted">A kiválasztott nyelv kész hanganyagait és képeit tölti le, és ellenőrzi a mentést. Mindhárom nyelv együtt nagyobb tárhelyet használ. Az AI-funkciókhoz továbbra is net kell.</p><span class="small muted" id="sOffMsg" role="status" aria-live="polite"></span>
    <div class="row"><button class="btn ghost" id="sExport">Haladás mentése fájlba</button><label class="btn ghost" for="sImport">Visszatöltés fájlból</label><input type="file" id="sImport" accept="application/json,.json" hidden></div></div>`;
}
/* Daily reminder via Web Push through the user's own server (worker/). */
const localDay=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);};
async function proxyPost(path,body){
  const st=S.settings;if(!st.proxy||!st.pass)throw {code:"no_proxy"};
  const r=await fetch(st.proxy.replace(/\/+$/,"")+path,{method:"POST",headers:proxyHeaders(),body:JSON.stringify(body||{})});
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
function refreshWebSettings(){renderHome();const panel=$("#sProxy")&&$("#sProxy").closest("details");if(panel)panel.open=true;}
function refreshAIBadges(){view.querySelectorAll("[data-ai-status]").forEach(el=>{const holder=document.createElement("span");holder.innerHTML=aiAccessBadge();el.replaceWith(holder.firstElementChild);});}
function bindWebSettings(){
  [$("#sProxy"),$("#sUser"),$("#sPass")].filter(Boolean).forEach(input=>input.oninput=()=>view.querySelectorAll("[data-ai-status]").forEach(el=>{el.textContent="Nem mentett módosítások";el.classList.remove("ok");}));
  const saveAI=$("#sAiSave");
  if(saveAI)saveAI.onclick=async e=>{
    e.preventDefault();const m=$("#sAiMsg"),address=$("#sProxy").value.trim(),pass=$("#sPass").value,user=($("#sUser")?$("#sUser").value:"").trim().toLowerCase();
    m.style.color="var(--bad)";AI_CHECK=null;refreshAIBadges();
    if(!address||!pass){m.textContent="Add meg a szerver címét és a belépőkódot.";return;}
    let url;try{url=new URL(address);if(url.username||url.password||url.search||url.hash||!(url.origin===location.origin||(url.protocol==="https:"&&url.hostname.endsWith(".workers.dev"))))throw 0;}
    catch(err){m.textContent="Érvényes HTTPS-címet adj meg: a saját workers.dev szervered vagy az alkalmazás saját címe használható.";return;}
    if(user&&!/^[a-z0-9._-]{1,32}$/.test(user)){m.textContent="A felhasználónév kisbetűs betűkből, számokból, pontból, kötőjelből vagy aláhúzásból álljon (legfeljebb 32 karakter).";return;}
    S.settings.proxy=url.href.replace(/\/+$/,"");S.settings.pass=pass;S.settings.user=user;save();
    const proxy=S.settings.proxy,sample=proxySample(),controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),15000);saveAI.disabled=true;m.style.color="";m.textContent="Kapcsolat ellenőrzése…";
    const snapshot={proxy,pass,user,ok:false};
    try{const response=await sample("Válaszolj egyetlen szóval: ok",{modelTier:"quick",signal:controller.signal});if(!response.text.trim())throw {code:"error"};snapshot.ok=true;m.style.color="var(--ok)";m.textContent="A kapcsolat működik. Visszatérhetsz a gyakorláshoz.";}
    catch(err){if(err&&err.code==="no_ai_key"){snapshot.noAI=true;m.style.color="var(--ok)";m.textContent="A kapcsolat működik: a szinkron és az emlékeztető bekapcsolható. A szerveren nincs Claude-kulcs, ezért AI-hoz a claude.ai-os változatot (artifact) használd.";return;}
      m.style.color="var(--bad)";m.textContent=err&&err.code==="aborted"?"A szerver 15 másodperc alatt nem válaszolt. Ellenőrizd a címet és próbáld újra.":aiErr(err);}
    finally{clearTimeout(timeout);AI_CHECK=snapshot;saveAI.disabled=false;refreshAIBadges();}
  };
  if(!$("#sRemOn"))return;
  bindUsage();
  const msg=$("#sRemMsg");
  $("#sRemOn").onclick=async e=>{e.preventDefault();msg.style.color="";msg.textContent="Beállítom…";
    try{if(!("Notification" in window))throw {code:"unsupported"};if(Notification.permission!=="granted"&&(await Notification.requestPermission())!=="granted")throw {code:"denied"};
      S.settings.remind={on:true,hour:+$("#sRemH").value};save();await pushSync();refreshWebSettings();$("#sRemMsg").style.color="var(--ok)";}
    catch(err){S.settings.remind={on:false,hour:+$("#sRemH").value};save();msg.style.color="var(--bad)";msg.textContent=pushMsg(err);}};
  if($("#sRemOff"))$("#sRemOff").onclick=async e=>{e.preventDefault();try{const reg=await navigator.serviceWorker.ready;const sub=await reg.pushManager.getSubscription();if(sub){await proxyPost("/push/unsubscribe",{endpoint:sub.endpoint}).catch(()=>{});await sub.unsubscribe();}}catch(err){}
    S.settings.remind={on:false,hour:S.settings.remind.hour};save();refreshWebSettings();};
  if($("#sRemTest"))$("#sRemTest").onclick=async e=>{e.preventDefault();msg.textContent="Küldöm…";try{const sub=await pushSub();const r=await proxyPost("/push/test",{subscription:sub.toJSON()});msg.textContent=r.ok?"Elküldve. Pár másodpercen belül meg kell jelennie.":"A küldés nem sikerült ("+r.status+").";}catch(err){msg.textContent=pushMsg(err);}};
  $("#sSync").querySelectorAll("button").forEach(b=>b.onclick=async e=>{e.preventDefault();const on=b.dataset.v==="1";
    if(on&&(!S.settings.proxy||!S.settings.pass)){$("#sSyncMsg").textContent=pushMsg({code:"no_proxy"});return;}
    S.settings.cloud=on;cloudErr="";save();refreshWebSettings();if(on){$("#sSyncMsg").textContent="Szinkronizálok…";await cloudSync();}});
  if($("#sSyncNow"))$("#sSyncNow").onclick=async e=>{e.preventDefault();$("#sSyncMsg").textContent="Szinkronizálok…";await cloudSync();};
  const offline=$("#sOffline"),offlineLang=$("#sOfflineLang");
  offline.onclick=async e=>{
    e.preventDefault();if(offline.disabled)return;
    const message=$("#sOffMsg"),selected=offlineLang?offlineLang.value:lang(),languages=selected==="all"?Object.keys(LANGS):[selected];
    offline.disabled=true;if(offlineLang)offlineLang.disabled=true;message.textContent="Összeállítom és ellenőrzöm a letöltést…";
    try{
      const result=await downloadOfflineLanguages(languages,(done,total)=>message.textContent=`Ellenőrzés: ${done} / ${total} fájl`);
      if(result.ok){message.textContent=`Ellenőrizve: ${result.total} fájl elmentve. A kiválasztott kész tananyag offline elérhető; az AI-hoz net kell.`;offline.textContent="Letöltés és ellenőrzés";}
      else{message.textContent=`${result.missing.length} fájl hiányzik vagy nem menthető. Az offline letöltés még nem teljes; ellenőrizd a hálózatot és a szabad tárhelyet, majd próbáld újra.`;offline.textContent="Hiányzó fájlok újrapróbálása";}
    }catch(err){message.textContent=err&&err.code==="offline_unavailable"?"Az offline mentés most nem ellenőrizhető. Nyisd meg az appot HTTPS-en, engedélyezett böngészőtárhellyel, és töltsd újra. Sikeres mentést még nem jeleztünk.":"A letöltést nem sikerült ellenőrizni. Ellenőrizd a hálózatot és a tárhelyet, majd próbáld újra.";offline.textContent="Letöltés újrapróbálása";}
    finally{offline.disabled=false;if(offlineLang)offlineLang.disabled=false;}
  };
  $("#sExport").onclick=async e=>{e.preventDefault();const out=JSON.parse(JSON.stringify(S));out.settings.pass="";
    if(await saveFile("parliamo-mentes-"+new Date().toISOString().slice(0,10)+".json",new Blob([JSON.stringify(out)],{type:"application/json"})))toast("A mentés letöltve.");};
  $("#sImport").onchange=async e=>{const f=e.target.files[0];if(!f)return;
    try{const o=JSON.parse(await f.text());if(typeof o!=="object"||!o.cards||typeof o.xp!=="number")throw 0;
      const keep={proxy:S.settings.proxy,pass:S.settings.pass},epoch=resetEpoch(S);stopViews();S=migrate(o);S.resetAt=Math.max(epoch,resetEpoch(S));Object.assign(S.settings,keep);save();if(!await loadCourse())return;render();toast("Haladás visszatöltve.");}
    catch(err){toast("Ez a fájl nem Parliamo-mentés.");}};
}


/* Ask the worker controlling this page which caches it actually serves. A fetched sw.js could
   already describe a newer worker, so its cache names cannot prove this page is ready offline. */
function offlineWorkerManifest(worker){
  if(typeof MessageChannel==="undefined")return Promise.reject({code:"offline_unavailable"});
  return new Promise((resolve,reject)=>{
    const channel=new MessageChannel();let settled=false;
    const finish=(value,error)=>{if(settled)return;settled=true;clearTimeout(timer);channel.port1.close();channel.port2.close();error?reject(error):resolve(value);};
    const timer=setTimeout(()=>finish(null,{code:"offline_unavailable"}),2500);
    channel.port1.onmessage=event=>{
      const manifest=event.data;
      if(!manifest||manifest.type!=="parliamo-offline-manifest"||!/^parliamo-shell-[a-z0-9]+$/.test(manifest.shell)||!/^parliamo-media-[a-z0-9]+$/.test(manifest.media)||!Array.isArray(manifest.precache))return finish(null,{code:"offline_unavailable"});
      finish(manifest);
    };
    try{worker.postMessage({type:"parliamo-offline-manifest"},[channel.port2]);}
    catch(e){finish(null,{code:"offline_unavailable"});}
  });
}
async function offlineCacheTargets(){
  if(!navigator.serviceWorker||!navigator.serviceWorker.controller||!("caches" in window))throw {code:"offline_unavailable"};
  const reg=await navigator.serviceWorker.getRegistration(),base=new URL("./",location.href),script=new URL("sw.js",base),worker=navigator.serviceWorker.controller;
  if(!reg||!reg.active||new URL(worker.scriptURL).href!==script.href)throw {code:"offline_unavailable"};
  const {shell,media,precache}=await offlineWorkerManifest(worker);
  if(!Array.isArray(precache)||precache.some(file=>typeof file!=="string"||!offlineAssetURL(file,base)))throw {code:"offline_unavailable"};
  try{return {shell:await caches.open(shell),media:await caches.open(media),precache,base};}
  catch(e){throw {code:"offline_unavailable"};}
}
function offlineAssetURL(file,base){
  try{const url=new URL(file,base);return url.origin===base.origin&&url.pathname.startsWith(base.pathname)&&!url.search&&!url.hash?url.href:null;}catch(e){return null;}
}
async function cacheOfflineAsset(file,targets){
  const url=offlineAssetURL(file,targets.base);if(!url)throw {code:"offline_asset"};
  const cache=/\/(audio|img)\//.test(new URL(url).pathname)?targets.media:targets.shell;
  let response=await cache.match(url);
  if(response&&response.ok)return response;
  response=await fetch(url);if(!response.ok)throw {code:"offline_asset",status:response.status};
  await cache.put(url,response.clone());
  const stored=await cache.match(url);if(!stored||!stored.ok)throw {code:"offline_asset"};
  return stored;
}
async function downloadOfflineLanguages(languages,onProgress=()=>{}){
  const selected=[...new Set(languages)].filter(l=>Object.prototype.hasOwnProperty.call(LANGS,l));
  if(!selected.length)throw {code:"offline_asset"};
  const targets=await offlineCacheTargets(),files=new Set(targets.precache),missing=new Set(),declared=new Set(targets.precache);
  const read=async(file,required=false)=>{
    if(!required&&!declared.has(file))return null;
    files.add(file);try{return await (await cacheOfflineAsset(file,targets)).json();}catch(e){missing.add(file);return null;}
  };
  for(const l of selected){
    const [pack,stories,verbs,pods,packs,serials,mocks,colloc,core,speaking]=await Promise.all([
      read(`data/${l}.json`,true),read(`data/stories-${l}.json`,true),read(`data/verbs-${l}.json`,true),
      ...["podcasts","packs","serials","mock","colloc","core","speaking"].map(name=>read(`data/${name}-${l}.json`))]);
    (pack&&pack.units||[]).forEach(unit=>{files.add(`audio/${unit.id}.json`);files.add(`img/${unit.id}.webp`);});
    (stories&&stories.stories||[]).forEach(story=>files.add(`audio/st-${story.id}.json`));
    if(verbs){if(l==="en")files.add("audio/vb-en.json");else(verbs.verbs||[]).forEach(verb=>files.add(`audio/vb-${l==="es"?"es-":""}${verb.inf}.json`));}
    if(declared.has(`data/pron-${l}.json`))files.add(`audio/pron-${l}.json`);
    (pods&&pods.podcasts||[]).forEach(pod=>{files.add(`audio/pod-${pod.id}.json`);files.add(`img/pod-${pod.id}.webp`);});
    (packs&&packs.packs||[]).forEach(pack=>files.add(`audio/pk-${l}-${pack.id}.json`));
    (serials&&serials.serials||[]).forEach(story=>{files.add(`audio/ser-${l}-${story.id}.json`);if(story.img)files.add(`img/${story.img}.webp`);});
    (mocks&&mocks.mocks||[]).filter(mock=>(mock.parts||[]).some(part=>part.lines)).forEach(mock=>files.add(`audio/mock-${l}-${mock.id}.json`));
    (colloc&&colloc.groups||[]).forEach(group=>files.add(`audio/col-${l}-${group.id}.json`));
    (speaking&&speaking.cam||[]).forEach(card=>{if(card.pics){files.add(`img/${card.pics.a}.webp`);files.add(`img/${card.pics.b}.webp`);}});
    const enabled=(S.core||{})[l]||{};
    (core&&core.levels||[]).filter(level=>enabled[level.level]).forEach(level=>(level.words||[]).forEach(word=>files.add(`audio/${word.b}.json`)));
    files.add(`img/${LANGS[l].hero}.webp`);
    files.add(`img/world-${l}.webp`);
    if(l==="en"){files.add("audio/acc-en.json");files.add("audio/dl-en.json");files.add("img/story-s3-scenes.webp");}
    if(l==="it"){files.add("img/teacher.webp");SCENARIOS.forEach(scene=>files.add(`img/sc-${scene.id}.webp`));}
  }
  let done=0;
  for(const file of files){
    if(!missing.has(file))try{await cacheOfflineAsset(file,targets);}catch(e){missing.add(file);}
    onProgress(++done,files.size);
  }
  return {ok:missing.size===0,missing:[...missing],total:files.size};
}
