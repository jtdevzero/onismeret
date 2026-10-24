/* ============ PERSONALISATION ============ */
function applyPrefs(){
  const r=document.documentElement,st=S.settings;
  if(st.theme==="light"||st.theme==="dark"){r.dataset.theme=st.theme;r.dataset.themeSet="1";}else if(r.dataset.themeSet){delete r.dataset.theme;delete r.dataset.themeSet;}
  r.dataset.fs=st.fs||"m";if(st.readable)r.dataset.read="1";else delete r.dataset.read;
}
function prefsCard(){
  const st=S.settings;
  return `<label class="stack" style="gap:.3rem"><span class="label">Téma</span><span class="seg" id="sTheme">${[["auto","Automatikus"],["light","Világos"],["dark","Sötét"]].map(([k,l])=>`<button data-v="${k}" aria-pressed="${(st.theme||"auto")===k}">${l}</button>`).join("")}</span></label>
    <label class="stack" style="gap:.3rem"><span class="label">Betűméret</span><span class="seg" id="sFs">${[["m","Normál"],["l","Nagy"],["xl","Nagyon nagy"]].map(([k,l])=>`<button data-v="${k}" aria-pressed="${(st.fs||"m")===k}">${l}</button>`).join("")}</span></label>
    <label class="stack" style="gap:.3rem"><span class="label">Könnyen olvasható betű</span><span class="seg" id="sRead"><button data-v="1" aria-pressed="${!!st.readable}">Be</button><button data-v="0" aria-pressed="${!st.readable}">Ki</button></span><span class="small muted">Atkinson Hyperlegible: a hasonló betűk (I, l, 1) jól megkülönböztethetők, diszlexiánál és gyengénlátóknak is segít.</span></label>`;
}

