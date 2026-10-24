/* ============ BOOT ============ */
(async function(){const h=(location.hash||"").slice(1);if(ROUTES.some(r=>r[0]===h)||["stat","utlevel","terkep","ellenorzes"].includes(h))route=h;applyPrefs();
  view.innerHTML=`<div class="card row"><span class="thinking"><i></i><i></i><i></i></span><span class="muted">A tananyag betöltése…</span></div>`;
  try{await loadCourse();}catch(e){view.innerHTML=`<div class="notice">Nem sikerült betölteni a tananyagot. Töltsd újra az oldalt.</div>`;return;}
  renderChips();if(IS_WEB&&S.settings.cloud)cloudSync();if(IS_WEB&&S.settings.budget)loadUsage().then(u=>{if(u&&route==="ma"&&!P&&!CS&&!D&&S.onboarded)renderHome();});if(!S.onboarded)return renderOnboarding();
  render();quickAction(h);})();
