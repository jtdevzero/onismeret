/* ============ AI USAGE AND SERVER BACKUPS (web app) ============ */
function usageCard(){
  return `<div class="card stack" style="gap:.6rem"><span class="label">AI-használat ebben a hónapban</span><div id="sUse" class="small muted">${S.settings.proxy?"Betöltés…":"Előbb állítsd be az AI-kapcsolatot."}</div>
    <label class="row" style="gap:.5rem"><span class="small">Figyelmeztetés ennél a havi összegnél ($):</span><input id="sBudget" inputmode="decimal" style="width:6rem" value="${esc(S.settings.budget||"")}" placeholder="pl. 10" aria-label="Havi keret dollárban"><button class="btn ghost" id="sBudgetSave">Mentés</button></label>
    <p class="small muted">A költség becslés a szerver naplója alapján (Claude Opus 5.5: 4 $ / millió bemeneti, 20 $ / millió kimeneti token). Kemény korlátot a szerver MONTHLY_BUDGET_USD beállításával és a Claude Console-ban adhatsz meg.</p></div>
  <div class="card stack" style="gap:.6rem"><span class="label">Biztonsági mentések a szerveren</span><p class="small muted">Ha a szinkron be van kapcsolva, a szerver hetente automatikusan elmenti a haladásodat, és az utolsó 4 mentést megtartja.</p>
    <div id="sBk" class="small muted">${S.settings.cloud?"Betöltés…":"A mentésekhez kapcsold be a szinkront."}</div>${S.settings.cloud?`<div><button class="btn ghost" id="sBkNow">Mentés most</button></div>`:""}</div>`;
}
const fmtUsd=x=>"$"+(Math.round(x*100)/100).toFixed(2);
let USAGE=null;
async function loadUsage(){
  if(!S.settings.proxy||!S.settings.pass)return null;
  try{USAGE=await proxyPost("/usage");return USAGE;}catch(e){return null;}
}
function budgetWarn(){
  const b=+S.settings.budget;if(!IS_WEB||!b||!USAGE)return "";
  const c=USAGE.cost||0;if(c<b*0.8)return "";
  return `<div class="notice"><b>AI-költség:</b> ebben a hónapban kb. ${fmtUsd(c)} ment el a ${fmtUsd(b)} keretből${c>=b?" (túllépve)":""}. A Beállításokban látod a részleteket.</div>`;
}
async function bindUsage(){
  if($("#sBudgetSave"))$("#sBudgetSave").onclick=e=>{e.preventDefault();const v=parseFloat(String($("#sBudget").value).replace(",","."));S.settings.budget=v>0?v:0;save();toast(v>0?"Keret elmentve.":"Figyelmeztetés kikapcsolva.");};
  const u=await loadUsage(),el=$("#sUse");
  if(el)el.innerHTML=u?`<b style="color:var(--ink)">${fmtUsd(u.cost)}</b> becsült költség · ${esc(u.calls)} kérés · ${Math.round(u.in/1000)}k bemeneti és ${Math.round(u.out/1000)}k kimeneti token${u.budget?` · szerverkorlát: ${fmtUsd(u.budget)}`:""}${(u.months||[]).length>1?`<br>Korábban: ${u.months.slice(1).map(m=>`${esc(m.month)}: ${fmtUsd(m.cost)}`).join(" · ")}`:""}`:S.settings.proxy?"A szerver még nem ad használati adatot. Futtasd újra a telepítést.":el.innerHTML;
  if(!S.settings.cloud)return;
  const draw=async()=>{try{const r=await proxyPost("/sync/backups"),bk=$("#sBk");if(!bk)return;bk.innerHTML=r.list.length?r.list.map(x=>`<div class="row" style="justify-content:space-between"><span>${new Date(x.at).toLocaleString("hu-HU",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})} · ${x.xp} XP</span><button class="btn ghost" data-bk="${esc(x.key)}" style="padding:.3rem .7rem">Visszaállítás</button></div>`).join(""):"Még nincs mentés.";
    bk.querySelectorAll("[data-bk]").forEach(b=>{let armed=false;b.onclick=async e=>{e.preventDefault();if(!armed){armed=true;b.textContent="Biztosan? A mostani haladás felülíródik";b.style.color="var(--bad)";return;}
      b.disabled=true;try{const g=await proxyPost("/sync/backup-get",{key:b.dataset.bk});await cloudRestore(g.state);toast("Visszaállítva a mentésből.");}catch(err){toast(pushMsg(err));b.disabled=false;}};});}
    catch(e){const bk=$("#sBk");if(bk)bk.textContent=pushMsg(e);}};
  draw();
  if($("#sBkNow"))$("#sBkNow").onclick=async e=>{e.preventDefault();try{await cloudSync();await proxyPost("/sync/backup-now");toast("Mentés kész.");draw();}catch(err){toast(pushMsg(err));}};
}
/* Restoring replaces the state outright (no merge), so no sync may run in between. */
async function cloudRestore(state){
  clearTimeout(cloudT);cloudT=null;
  for(let i=0;cloudBusy&&i<100;i++)await new Promise(r=>setTimeout(r,100));
  cloudBusy=true;
  try{
    const keep={};DEVICE_KEYS.forEach(k=>keep[k]=S.settings[k]);
    const epoch=resetEpoch(S);stopViews();S=migrate(state);S.resetAt=Math.max(epoch,resetEpoch(S));Object.assign(S.settings,keep);S.updatedAt=Date.now();try{localStorage.setItem(LS,JSON.stringify(S));}catch(e){}
    for(let n=0;n<3;n++){const r=await proxyPost("/sync/get");
      try{const w=await proxyPost("/sync/put",{state:cloudCopy(),base:r.rev||0});cloudRev=w.rev;cloudAt=Date.now();break;}catch(e){if(!(e&&e.code==="conflict"))throw e;}}
  }finally{cloudBusy=false;clearTimeout(cloudT);cloudT=null;}
  if(!await loadCourse())return;render();
}

