/* ============ HOME ============ */
function wordOfDay(){
  const words=WORDS.filter(w=>!w.own&&!w.core&&langOf(w.id)===lang());
  return words.length?words[today()%words.length]:null;
}
function renderHome(){
  if(!courseReady())return render();
  const nl=nextLesson(),s=dailySession(),steps=dailySteps(),finished=steps.every(x=>x[0]),started=steps.some(x=>x[0]);
  const w=wordOfDay(),L=LESSONS.find(l=>l.id===s.lessonId);
  view.innerHTML=`<div class="stack">
  ${worldHeroHtml()}
  <section class="daily-focus" aria-labelledby="dailyTitle"><span class="label">A mai útvonalad · kb. ${dailyPacing().minutes} perc</span><h2 id="dailyTitle">${finished?"A mai gyakorlásod elkészült.":started?"Folytassuk, ahol tartottál.":"Egy kis lépés, ami összeadódik."}</h2><p>Rövid ismétlés, egy leckeszakasz, végül saját válaszok. Lépésről lépésre végigvezetünk.</p>
    <div class="daily-steps">${steps.map(([done,title,detail],i)=>`<div class="daily-step ${done?"is-done":""}"><span>${done?(done==="none"?"–":"✓"):i+1}</span><div><b>${esc(title)}</b><small>${esc(detail)}</small></div></div>`).join("")}</div>
    <div class="row"><button class="btn lemon" id="hRound">${finished?"Mai kör áttekintése":started?"Mai gyakorlás folytatása":"Mai gyakorlás indítása"} →</button><span class="small">Bármikor megállhatsz, innen folytatjuk.</span></div>
  </section>
  <div class="home-summary"><div><b class="tnum">${streak()} nap</b><span>tanulási sorozat</span></div><div><b class="tnum">${doneCount()}</b><span>elvégzett lecke</span></div><div><b class="tnum">${dueList().length}</b><span>esedékes ismétlés</span></div><div><b class="tnum">${S.days[today()]||0} / ${S.settings.goal}</b><span>mai XP</span></div></div>
  <div class="home-secondary">
    ${milestonesCard()}
    <section class="card stack"><span class="label">${L?"A mai leckéd":"Leckék"}</span><h3>${esc(L?L.hu:"Vedd elő, amit gyakorolnál")}</h3><p class="small muted">${esc(L?L.goal:"A már elvégzett és átugrott leckéket is bármikor újra megnyithatod.")}</p><div><button class="btn ghost" id="hLesson">Lecke megnyitása →</button></div></section>
  </div>
  <details class="g"><summary>További gyakorlás és tervezés</summary><div class="gb stack">
    ${missCount()?`<div class="card next"><div><h3>Gyakorolj a hibáidból</h3><p class="small muted">${missCount()} kifejezés vár újabb próbára.</p></div><button class="btn soft" id="hMiss">Hibakör</button></div>`:""}
    <div class="row"><button class="btn ghost" data-go="gyakorlas">Gyakorlók készségenként →</button><button class="btn ghost" data-go="stat">Részletes haladás →</button></div>
    ${goalCard()}${planCard()}${weekCard()}${chalCard()}
  </div></details>
  <div class="home-secondary">
    ${w?`<section class="card wotd" aria-labelledby="wordOfDayTitle" data-word-language="${lang()}"><div class="row" style="justify-content:space-between"><div><span class="label" id="wordOfDayTitle">A nap szava · ${esc(LG().name)}</span><div class="word" ${LA()}>${esc(w.it)}</div><div>${esc(w.hu)}</div></div>${spkBtn(w.it)}</div></section>`:""}
    <section class="card stack"><span class="label">Ha beszélgetnél</span><h3>Próbáld ki az AI-tanárt</h3><p class="small muted">Szerepjátékok és magyar magyarázatok. Külön AI-kapcsolatot igényel; a napi gyakorlás enélkül is működik.</p><div class="row">${aiAccessBadge()}<button class="btn ghost" data-go="tanar">AI-tanár →</button></div></section>
  </div>
  ${budgetWarn()}
  <details class="g" id="homeSettings"><summary>Beállítások</summary><div class="gb">
    <label class="stack" style="gap:.3rem"><span class="label">Napi cél</span><span class="seg" id="sGoal">${[20,50,100].map(g=>`<button data-v="${g}" aria-pressed="${S.settings.goal===g}">${({20:5,50:10,100:25})[g]} perc</button>`).join("")}</span></label>
    <label class="stack" style="gap:.3rem"><span class="label">Új kártyák naponta</span><span class="seg" id="sNew">${[5,10,20].map(g=>`<button data-v="${g}" aria-pressed="${S.settings.newPerDay===g}">${g}</button>`).join("")}</span></label>
    <label class="stack" style="gap:.3rem"><span class="label">Hangjelzések és rezgés</span><span class="seg" id="sSound"><button data-v="1" aria-pressed="${S.settings.sound!==false}">Be</button><button data-v="0" aria-pressed="${S.settings.sound===false}">Ki</button></span></label>
    <div><button class="btn soft" data-go="ellenorzes">Eszközellenőrzés: mi működik ezen a telefonon?</button></div>
    ${prefsCard()}
    <label class="stack" style="gap:.3rem"><span class="label">Ismétlés célja (megtartás)</span><span class="seg" id="sRet">${[[0.85,"Lazább · 85%"],[0.9,"Normál · 90%"],[0.95,"Szigorú · 95%"]].map(([g,l])=>`<button data-v="${g}" aria-pressed="${(S.settings.ret||0.9)===g}">${l}</button>`).join("")}</span><span class="small muted">Magasabb célnál gyakrabban jönnek vissza a kártyák, de jobban megmaradnak.</span></label>
    <label class="stack" style="gap:.3rem"><span class="label">Felolvasás tempója</span><span class="seg" id="sRate">${[[0.8,"Lassú"],[0.95,"Normál"],[1.1,"Gyors"]].map(([g,l])=>`<button data-v="${g}" aria-pressed="${S.settings.rate===g}">${l}</button>`).join("")}</span></label>
    <p class="small muted">${sync==="cloud"?"A haladásodat a fiókodba mentem, így más eszközön is megvan.":IS_WEB&&S.settings.cloud?"A haladásod ebben a böngészőben és a saját szervereden is megvan.":"A haladás ebben a böngészőben van elmentve."}${voicesChecked&&!itVoice?" A böngésződben nincs a tanult nyelvhez megfelelő hang. Telepíts hozzá hangcsomagot a rendszerbeállításokban.":""}</p>
    ${IS_WEB?webSettings():""}
    <div><button class="btn ghost" id="sReset">Haladás törlése</button></div>
  </div></details>
  </div>`;
  $("#hRound").onclick=startDailyJourney;
  $("#hLesson").onclick=()=>{dailyActive=false;route="leckek";render();const li=L?LESSONS.indexOf(L):nl;if(li!==null)openLesson(li);};
  bindPlan();bindWeek();bindGoal(renderHome);
  if($("#hMiss"))$("#hMiss").onclick=()=>{dailyActive=false;startRound("miss");};
  if(IS_WEB)bindWebSettings();
  bindAISetup(view);
  const segs=[["#sTheme","theme",String],["#sFs","fs",String],["#sRead","readable",v=>v==="1"],["#sRet","ret",Number],["#sGoal","goal",Number],["#sNew","newPerDay",Number],["#sRate","rate",Number],["#sSound","sound",v=>v==="1"]];
  segs.forEach(([id,k,f])=>$(id).querySelectorAll("button").forEach(b=>b.onclick=e=>{e.preventDefault();S.settings[k]=f(b.dataset.v);save();applyPrefs();renderHome();$("#homeSettings").open=true;}));
  let armed=false;$("#sReset").onclick=()=>{if(!armed){armed=true;$("#sReset").textContent="Biztosan? Kattints újra a törléshez";$("#sReset").style.color="var(--bad)";return;}dailyActive=false;stopViews();resetProgress();toast("A haladásod törölve.");renderHome();};
}
