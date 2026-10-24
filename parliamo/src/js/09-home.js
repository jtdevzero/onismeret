/* ============ HOME ============ */
function renderHome(){
  const d=new Date(), t=today(), x=S.days[t]||0, goal=S.settings.goal, pct=Math.min(1,x/goal);
  const C=2*Math.PI*50, nl=nextLesson(), due=dueList().length, nw=Math.min(newLeft(),newAvail().length);
  const w=WORDS[t%WORDS.length];
  let strip="";for(let i=13;i>=0;i--){const v=S.days[t-i]||0;const l=v===0?"":v<goal/2?"l1":v<goal?"l2":"l3";strip+=`<i class="${l} ${i===0?"today":""}" title="${v} XP"></i>`;}
  const done=doneCount();
  view.innerHTML=`<div class="stack">
  <section class="banner">${pic(LG().hero)}
    <div class="in">
      <div class="ring" role="img" aria-label="Mai cél: ${x} / ${goal} XP">
        <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="rgba(9,18,44,.35)" stroke="rgba(255,255,255,.25)" stroke-width="11"/><circle cx="60" cy="60" r="50" fill="none" stroke="${pct>=1?"#4CC38A":"#F2C230"}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct)}"/></svg>
        <div class="v"><div><b class="tnum">${x}</b><div class="small muted">/ ${goal} XP</div></div></div>
      </div>
      <div class="stack" style="gap:.35rem;flex:1;min-width:min(100%,260px)">
        <span class="label">${lang()==="en"?d.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"}):DAYS_IT[d.getDay()]+", "+d.getDate()+" "+MONTHS_IT[d.getMonth()]}</span>
        <h1>${x===0?LG().hello:pct>=1?LG().goalDone:LG().goalLeft(goal-x)}</h1>
        <p>${due?due+" kártya vár ismétlésre. ":""}${nl!==null?"Következő lecke: "+esc(LESSONS[nl].hu)+".":"Minden leckét befejeztél. Jöhet a beszélgetés az AI-tanárral."}</p>
      </div>
    </div>
  </section>
  ${budgetWarn()}
  ${roundCard(due,nw)}
  ${planCard()}
  ${weekCard()}
  ${chalCard()}
  <div class="card feature">${pic(LESSONS[nl!==null?nl:LESSONS.length-1].id)}<div class="fbody"><span class="label">Lecke ${nl!==null?nl+1:LESSONS.length} / ${LESSONS.length}</span><h2>${esc(nl!==null?LESSONS[nl].t:"Ripasso")}</h2><p class="muted">${esc(nl!==null?LESSONS[nl].goal:"Ismételd át bármelyik leckét.")}</p>
    <div><button class="btn lemon" id="hLesson">${nl!==null?(ls(nl)?"Folytatás":"Indítás"):"Leckék"} →</button></div></div></div>
  ${missCount()?`<div class="card next"><div><span class="label">A hibáim</span><h3><span class="tnum">${missCount()}</span> kifejezés vár javításra</h3><p class="small muted">Amit eddig elrontottál, a legtöbbször rontottakkal kezdve.</p></div><button class="btn soft" id="hMiss">Hibakör</button></div>`:""}
  <div class="card wotd"><div class="row" style="justify-content:space-between"><div><span class="label">${LG().wotd}</span><div class="word" ${LA()}>${esc(w.it)}</div><div>${esc(w.hu)}</div></div>${spkBtn(w.it)}</div></div>
  <div class="card"><div class="stats">
    <div class="stat"><span class="label">Sorozat</span><b class="tnum">${streak()} nap</b></div>
    <div class="stat"><span class="label">Összes XP</span><b class="tnum">${S.xp}</b></div>
    <div class="stat"><span class="label">Tanult elem</span><b class="tnum">${learnedCount()}</b></div>
    <div class="stat"><span class="label">${LG().name} kurzus</span><b class="tnum">${Math.round(done/LESSONS.length*100)}%</b></div>
  </div><div class="days" aria-label="Az elmúlt 14 nap aktivitása">${strip}</div><div class="row small muted" style="justify-content:space-between;margin-top:.3rem"><span>14 napja</span><span>ma</span></div>
  <div style="margin-top:.8rem"><button class="btn ghost" data-go="stat">Részletes statisztika →</button></div></div>
  <div class="sec-head"><h2>Gyors gyakorlás</h2></div>
  <div class="grid3">
    <button class="drill" data-drill="conj"><span class="dico c1">${I.gyakorlas}</span><b>Igeedző</b><span class="small muted">${lang()==="en"?"50 rendhagyó ige":"25 ige, 5 igeidő"}</span></button>
    <button class="drill" data-drill="story"><span class="dico c2">${I.spk}</span><b>Történetek</b><span class="small muted">${STORIES.length} hangos párbeszéd</span></button>
    <button class="drill" data-drill="ai"><span class="dico c3">${I.tanar}</span><b>Napi AI-történet</b><span class="small muted">A saját szavaidból</span></button>
  </div>
  <details class="g"><summary>Beállítások</summary><div class="gb">
    <label class="stack" style="gap:.3rem"><span class="label">Napi cél</span><span class="seg" id="sGoal">${[20,50,100].map(g=>`<button data-v="${g}" aria-pressed="${S.settings.goal===g}">${g} XP</button>`).join("")}</span></label>
    <label class="stack" style="gap:.3rem"><span class="label">Új kártyák naponta</span><span class="seg" id="sNew">${[5,10,20].map(g=>`<button data-v="${g}" aria-pressed="${S.settings.newPerDay===g}">${g}</button>`).join("")}</span></label>
    <label class="stack" style="gap:.3rem"><span class="label">Hangjelzések és rezgés</span><span class="seg" id="sSound"><button data-v="1" aria-pressed="${S.settings.sound!==false}">Be</button><button data-v="0" aria-pressed="${S.settings.sound===false}">Ki</button></span></label>
    <div><button class="btn soft" data-go="ellenorzes">Eszközellenőrzés: mi működik ezen a telefonon?</button></div>
    ${prefsCard()}
    <label class="stack" style="gap:.3rem"><span class="label">Ismétlés célja (megtartás)</span><span class="seg" id="sRet">${[[0.85,"Lazább · 85%"],[0.9,"Normál · 90%"],[0.95,"Szigorú · 95%"]].map(([g,l])=>`<button data-v="${g}" aria-pressed="${(S.settings.ret||0.9)===g}">${l}</button>`).join("")}</span><span class="small muted">Magasabb célnál gyakrabban jönnek vissza a kártyák, de jobban megmaradnak.</span></label>
    <label class="stack" style="gap:.3rem"><span class="label">Felolvasás tempója</span><span class="seg" id="sRate">${[[0.8,"Lassú"],[0.95,"Normál"],[1.1,"Gyors"]].map(([g,l])=>`<button data-v="${g}" aria-pressed="${S.settings.rate===g}">${l}</button>`).join("")}</span></label>
    <p class="small muted">${sync==="cloud"?"A haladásodat a fiókodba mentem, így más eszközön is megvan.":IS_WEB&&S.settings.cloud?"A haladásod ebben a böngészőben és a saját szervereden is megvan.":"A haladás ebben a böngészőben van elmentve."}${voicesChecked&&!itVoice?" A böngésződben nincs olasz hang, ezért a felolvasás más hanggal szólhat. Telepíts olasz hangcsomagot a rendszerbeállításokban.":""}</p>
    ${IS_WEB?webSettings():""}
    <div><button class="btn ghost" id="sReset">Haladás törlése</button></div>
  </div></details>
  </div>`;
  if($("#hRound"))$("#hRound").onclick=()=>startRound("daily");
  bindPlan();bindWeek();
  if($("#hMiss"))$("#hMiss").onclick=()=>startRound("miss");
  if(IS_WEB)bindWebSettings();
  $("#hLesson").onclick=()=>{route="leckek";render();if(nl!==null)openLesson(nl);};
  view.querySelectorAll("[data-drill]").forEach(b=>b.onclick=()=>{route="gyakorlas";render();startDrill(b.dataset.drill);});
  const segs=[["#sTheme","theme",String],["#sFs","fs",String],["#sRead","readable",v=>v==="1"],["#sRet","ret",Number],["#sGoal","goal",Number],["#sNew","newPerDay",Number],["#sRate","rate",Number],["#sSound","sound",v=>v==="1"]];
  segs.forEach(([id,k,f])=>$(id).querySelectorAll("button").forEach(b=>b.onclick=e=>{e.preventDefault();S.settings[k]=f(b.dataset.v);save();applyPrefs();renderHome();view.querySelector("details.g").open=true;}));
  let armed=false;$("#sReset").onclick=()=>{if(!armed){armed=true;$("#sReset").textContent="Biztosan? Kattints újra a törléshez";$("#sReset").style.color="var(--bad)";return;}const st=S.settings;S=fresh();S.settings=st;save();toast("A haladásod törölve.");renderHome();};
}

