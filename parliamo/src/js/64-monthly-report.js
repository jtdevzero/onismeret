/* ============ MONTHLY PROGRESS REPORT ============ */
/* One printable page about the last 30 days: activity, vocabulary, skill estimates, results and the recurring mistakes.
   "Nyomtatás / PDF" uses the browser's print dialog (the print stylesheet hides the app chrome); an optional AI summary
   turns the numbers into a short paragraph that is clearly marked as AI text. */
function reportData(){
  const t=today(),from=t-29,since=Date.now()-30*864e5,l=lang();
  let xp=0,days=0,rev=0,ok=0;for(let d=from;d<=t;d++){const v=S.days[d]||0;xp+=v;if(v)days++;const g=S.log[d];if(g){rev+=g.n;ok+=g.ok;}}
  const ev={};for(let d=from;d<=t;d++)Object.entries(S.ev[d]||{}).forEach(([k,n])=>ev[k]=(ev[k]||0)+n);
  const pc=packCards(),mature=pc.filter(c=>c.ivl>=21).length;
  const mk={};monthMisses().forEach(m=>mk[m.k]=(mk[m.k]||0)+1);
  const mocks=Object.entries(S.mock||{}).flatMap(([id,h])=>h.filter(x=>x.at>=since).map(x=>({id,...x})));
  return {xp,days,rev,ret:rev?Math.round(ok/rev*100):null,ev,cards:pc.length,mature,lessons:doneCount(),
    skills:SKILLS.map(([k,lbl])=>({lbl,e:skillEst(k)})),miss:Object.entries(mk).sort((a,b)=>b[1]-a[1]).slice(0,5),mocks,
    spk:(S.spk||[]).filter(x=>x.at>=since&&x.l===l),journal:(S.journal||[]).filter(x=>x.at>=since&&x.l===l)};
}
function reportCard(){return `<div class="card next"><div><h3>Havi riport</h3><p class="small muted">Egy oldal az elmúlt 30 napról: aktivitás, szókincs, készségek, eredmények, visszatérő hibák. Kinyomtatható vagy PDF-be menthető, tanárnak is megmutatható.</p></div><button class="btn soft" id="repGo">Megnyitás</button></div>`;}
function renderReport(){
  stopViews();const R=reportData(),d0=new Date(Date.now()-29*864e5),d1=new Date(),f=d=>d.toLocaleDateString("hu-HU",{month:"long",day:"numeric"});
  const rep=S.ai["report-"+lang()];
  view.innerHTML=`<div class="stack report">
  <div class="row no-print"><button class="btn ghost" data-go="stat">← Statisztika</button><button class="btn" id="repPrint">Nyomtatás / PDF</button><button class="btn soft" id="repAI">AI-összegzés</button></div>
  <div><span class="label">Parliamo · ${LG().name} · havi riport</span><h1>${f(d0)} – ${f(d1)}</h1></div>
  <div class="card"><div class="stats">
    <div class="stat"><span class="label">Aktív napok</span><b class="tnum">${R.days} / 30</b></div>
    <div class="stat"><span class="label">XP</span><b class="tnum">${R.xp}</b></div>
    <div class="stat"><span class="label">Ismétlések</span><b class="tnum">${R.rev}</b><span class="small muted">${R.ret===null?"":R.ret+"% helyes"}</span></div>
    <div class="stat"><span class="label">Leckék összesen</span><b class="tnum">${R.lessons}</b></div>
  </div></div>
  <div class="card stack"><h3>Szókincs</h3><p>${R.cards} kártya tanulásban, ebből <b>${R.mature}</b> már biztosan megy (21+ napos időköz).</p>
    <p class="small muted">A hónapban: ${R.ev.reviews||0} kártyaismétlés, ${R.ev.drills||0} gyakorlófeladat, ${R.ev.pods||0} podcast, ${R.ev.stories||0} történet.</p></div>
  <div class="card stack"><h3>Készségek (gyakorlási becslés)</h3>${R.skills.map(s=>`<div class="row" style="justify-content:space-between"><span>${s.lbl}</span><span class="pill">${s.e?"kb. "+s.e.lv:"nincs adat"}</span></div>`).join("")}</div>
  ${R.mocks.length||R.spk.length||R.journal.length?`<div class="card stack"><h3>Eredmények</h3>
    ${R.mocks.map(m=>`<div class="row" style="justify-content:space-between"><span>Próbavizsga (${esc((XT.mock.find(x=>x.id===m.id)||{}).title||m.id)}) · ${new Date(m.at).toLocaleDateString("hu-HU")}</span><span class="pill">${m.pct}% · ${esc(m.grade||"")}</span></div>`).join("")}
    ${R.spk.length?`<div class="row" style="justify-content:space-between"><span>Szóbeli gyakorlás</span><span class="pill">${R.spk.length} alkalom</span></div>`:""}
    ${R.journal.length?`<div class="row" style="justify-content:space-between"><span>Napló</span><span class="pill">${R.journal.length} bejegyzés · átlag ${Math.round(R.journal.reduce((a,x)=>a+(x.n||0),0)/R.journal.length*10)/10} javítás</span></div>`:""}</div>`:""}
  <div class="card stack"><h3>Visszatérő hibák</h3>${R.miss.length?R.miss.map(([k,n])=>`<div class="row" style="justify-content:space-between"><span>${esc(mkLabel(k))}</span><span class="tnum">${n}</span></div>`).join(""):`<p class="small muted">Ebben a hónapban nem gyűlt össze elemezhető hiba.</p>`}</div>
  <div id="repAIout">${rep?`<div class="card stack"><span class="label">AI-összegzés · ${new Date(rep.at).toLocaleDateString("hu-HU")}</span><p>${esc(rep.text)}</p></div>`:""}</div>
  <p class="small muted">A szintek és a vizsgaeredmények gyakorlási becslések, nem hivatalos nyelvvizsga-eredmények.</p></div>`;
  $("#repPrint").onclick=()=>{try{window.print();}catch(e){toast("A nyomtatás itt nem érhető el.");}};
  $("#repAI").onclick=async()=>{const sample=await getSample();if(!sample){$("#repAIout").innerHTML=`<div class="notice">${aiMissing()}</div>`;return;}
    $("#repAI").disabled=true;$("#repAIout").innerHTML=`<div class="card row"><span class="thinking"><i></i><i></i><i></i></span><span class="muted">Összegzés készül…</span></div>`;
    const sum={aktiv_napok:R.days,xp:R.xp,ismetlesek:R.rev,helyes_arany:R.ret,kartyak:R.cards,biztos_szavak:R.mature,keszsegek:R.skills.map(s=>[s.lbl,s.e?s.e.lv:null]),hibak:R.miss.map(([k,n])=>[mkLabel(k),n]),probavizsgak:R.mocks.map(m=>m.pct),szobeli:R.spk.length,naplo:R.journal.length};
    try{const r=await sample(`Egy magyar anyanyelvű ${LG().adj} nyelvtanuló elmúlt 30 napjának adatai (JSON): ${JSON.stringify(sum)}
Írj róla 3–4 mondatos, barátságos, konkrét magyar összefoglalót: mi ment jól, mire figyeljen a következő hónapban, és egy gyakorlati javaslatot. Ne találj ki adatot, csak a fentiekből dolgozz, és ne nevezd a szinteket hivatalos eredménynek. Csak a szöveget add vissza.`,{modelTier:"quick"});
      const text=String(r.text||"").trim();if(text){S.ai["report-"+lang()]={at:Date.now(),text};save();}
      if($("#repAIout"))$("#repAIout").innerHTML=`<div class="card stack"><span class="label">AI-összegzés</span><p>${esc(text)}</p></div>`;}
    catch(e){if($("#repAIout"))$("#repAIout").innerHTML=`<div class="notice">${esc(aiErr(e))}</div>`;}
    if($("#repAI"))$("#repAI").disabled=false;};
  window.scrollTo(0,0);
}
