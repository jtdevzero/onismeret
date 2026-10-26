/* ============ PERSONALISATION ============ */
function applyPrefs(){
  const r=document.documentElement,st=S.settings;
  if(st.theme==="light"||st.theme==="dark"){r.dataset.theme=st.theme;r.dataset.themeSet="1";}else if(r.dataset.themeSet){delete r.dataset.theme;delete r.dataset.themeSet;}
  r.dataset.fs=st.fs||"m";if(st.readable)r.dataset.read="1";else delete r.dataset.read;
  if(typeof applyLanguageWorld==="function")applyLanguageWorld();
}
function prefsCard(){
  const st=S.settings;
  return `<label class="stack" style="gap:.3rem"><span class="label">Téma</span><span class="seg" id="sTheme">${[["auto","Automatikus"],["light","Világos"],["dark","Sötét"]].map(([k,l])=>`<button data-v="${k}" aria-pressed="${(st.theme||"auto")===k}">${l}</button>`).join("")}</span></label>
    <label class="stack" style="gap:.3rem"><span class="label">Betűméret</span><span class="seg" id="sFs">${[["m","Normál"],["l","Nagy"],["xl","Nagyon nagy"]].map(([k,l])=>`<button data-v="${k}" aria-pressed="${(st.fs||"m")===k}">${l}</button>`).join("")}</span></label>
    <label class="stack" style="gap:.3rem"><span class="label">Könnyen olvasható betű</span><span class="seg" id="sRead"><button data-v="1" aria-pressed="${!!st.readable}">Be</button><button data-v="0" aria-pressed="${!st.readable}">Ki</button></span><span class="small muted">Atkinson Hyperlegible: a hasonló betűk (I, l, 1) jól megkülönböztethetők, diszlexiánál és gyengénlátóknak is segít.</span></label>
    ${badgeSupported()?`<label class="stack" style="gap:.3rem"><span class="label">Jelvény az app ikonján</span><span class="seg" id="sBadge"><button data-v="1" aria-pressed="${st.badge!==false}">Be</button><button data-v="0" aria-pressed="${st.badge===false}">Ki</button></span><span class="small muted">Amíg a mai cél nincs meg, a telepített app ikonján egy szám mutatja az esedékes kártyákat (vagy 1-et, ha nincs esedékes). A cél teljesítésekor eltűnik.</span></label>`:""}`;
}

/* App icon badge (Badging API, installed web app only): the number of cards due while today's goal is still open. */
const badgeSupported=()=>IS_WEB&&"setAppBadge" in navigator;
function updateBadge(){
  if(!badgeSupported())return;
  try{const left=S.settings.badge!==false&&(S.days[today()]||0)<(S.settings.goal||50);
    const p=left?navigator.setAppBadge(Math.min(99,Math.max(1,typeof POOL!=="undefined"&&POOL.length?dueList().length:1))):navigator.clearAppBadge();
    if(p&&p.catch)p.catch(()=>{});}catch(e){}
}
