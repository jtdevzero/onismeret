/* ============ EXAM GOAL WITH A DATE ============ */
/* The learner sets the exam, the date and the target. The card counts down, compares the skill estimates with the target and
   builds this week's plan around the weakest skill; the closer the exam, the more full mock exams it asks for. */
const GOAL_EXAMS={b2f:["B2 First","B2"],c1a:["C1 Advanced","C1"],ielts:["IELTS Academic","C1"]};
const goalOf=()=>S.goal&&S.goal.date&&GOAL_EXAMS[S.goal.exam]?S.goal:null;
const goalDays=g=>Math.ceil((new Date(g.date+"T12:00:00")-new Date())/864e5);
/* What was done in the last seven days, from the logs the views already keep. */
function goalWeek(){
  const since=Date.now()-7*864e5,t=today(),n=(a,f)=>(a||[]).filter(f).length;
  const mocks=Object.values(S.mock||{}).flat().filter(x=>x.at>=since).length;
  return {mock:mocks,spk:n(S.spk,x=>x.at>=since&&x.l==="en"),journal:n(S.journal,x=>x.at>=since&&x.l==="en"),
    pods:Object.values(S.pods||{}).filter(x=>x.day>t-7).length,read:(S.sk&&S.sk.read||[]).filter(x=>x.at>=since&&x.l==="en").length};
}
function goalPlan(g){
  const days=goalDays(g),tgt=CEFR.indexOf(GOAL_EXAMS[g.exam][1]),w=goalWeek();
  const est=SKILLS.map(([k,l])=>({k,l,e:skillEst(k)})),gaps=est.map(s=>({...s,gap:s.e?tgt+0.5-s.e.x:1})).sort((a,b)=>b.gap-a.gap);
  const act={read:["Olvasás: egy próbavizsga olvasásrésze vagy a vizsgafelkészítő olvasása","exam","read"],listen:["Hallás: két podcast vagy egy folytatásos fejezet","pod","listen"],
    write:["Írás: három napló és egy esszé","journal","write"],speak:["Beszéd: egy szóbeli vizsga és két árnyékolás","examiner","speak"]};
  const items=[];
  items.push([days<=14?"Teljes próbavizsga ezen a héten (időre)":days<=56?"Próbavizsga kéthetente: ha a múlt héten nem volt, most jöhet":"Havonta egy teljes próbavizsga","mock",w.mock?"✓ "+w.mock+" kész a héten":""]);
  gaps.slice(0,2).forEach(s=>{const a=act[s.k];items.push([a[0]+(s.e?` (most kb. ${s.e.lv})`:" (még nincs adat)"),a[1],s.k==="write"&&w.journal?`${w.journal} napló a héten`:s.k==="speak"&&w.spk?`${w.spk} szóbeli a héten`:s.k==="listen"&&w.pods?`${w.pods} podcast a héten`:""]);});
  items.push(["Napi 10 perc kártya: alapszókincs és kollokációk","colloc",""]);
  return {days,items,gaps};
}
function goalCard(){
  if(lang()!=="en")return "";
  const g=goalOf();
  if(!g)return `<div class="card stack"><h3>Vizsgacél</h3><p class="small muted">Add meg, melyik vizsgára készülsz és mikor: az app visszaszámol, és heti tervet állít össze a leggyengébb készségedre.</p>${goalForm({})}</div>`;
  const P=goalPlan(g),[name,lv]=GOAL_EXAMS[g.exam];
  return `<div class="card stack" id="goalCard"><div class="row" style="justify-content:space-between"><h3>Vizsgacél: ${esc(name)}</h3><span class="pill ${P.days<=14?"bad":"now"} tnum">${P.days>0?P.days+" nap":P.days===0?"ma":"lejárt"}</span></div>
    <p class="small muted">${new Date(g.date+"T12:00:00").toLocaleDateString("hu-HU",{year:"numeric",month:"long",day:"numeric"})} · cél: ${esc(g.target||lv)}</p>
    <div class="stack" style="gap:.35rem">${P.gaps.map(s=>`<div class="row small" style="justify-content:space-between"><span>${s.l}</span><span class="pill ${s.e&&s.gap<=0?"ok":""}">${s.e?"kb. "+s.e.lv+(s.gap<=0?" ✓":""):"nincs adat"}</span></div>`).join("")}</div>
    <div><b>Ezen a héten</b><ul class="stack" style="gap:.45rem;padding-left:0;list-style:none;margin-top:.4rem">${P.items.map(([t,k,d])=>`<li class="row" style="justify-content:space-between;flex-wrap:nowrap;gap:.5rem"><span class="small">${esc(t)}${d?` <span class="pill ok">${esc(d)}</span>`:""}</span><button class="btn ghost" data-gd="${k}" style="padding:.35rem .7rem;font-size:.85rem;flex:none">Indítás</button></li>`).join("")}</ul></div>
    <p class="small muted">A készségszintek gyakorlási becslések; a terv ezekből választja ki, mire érdemes most több időt szánni.</p>
    <details><summary class="small" style="cursor:pointer">Cél módosítása</summary>${goalForm(g)}</details></div>`;
}
function goalForm(g){
  return `<div class="stack" style="gap:.5rem;margin-top:.5rem"><label class="stack" style="gap:.25rem"><span class="small">Vizsga</span><select id="gExam">${Object.entries(GOAL_EXAMS).map(([k,[n]])=>`<option value="${k}" ${g.exam===k?"selected":""}>${n}</option>`).join("")}</select></label>
    <label class="stack" style="gap:.25rem"><span class="small">Időpont</span><input type="date" id="gDate" value="${esc(g.date||"")}"></label>
    <label class="stack" style="gap:.25rem"><span class="small">Célszint vagy -sáv (nem kötelező)</span><input id="gTarget" value="${esc(g.target||"")}" placeholder="pl. B2, C1 vagy 6.5"></label>
    <div class="row"><button class="btn" id="gSave">Mentés</button>${g.date?`<button class="btn ghost" id="gDel">Cél törlése</button>`:""}</div></div>`;
}
function bindGoal(rerender){
  if($("#gSave"))$("#gSave").onclick=()=>{const date=$("#gDate").value;if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){toast("Add meg a vizsga dátumát.");return;}
    S.goal={exam:$("#gExam").value,date,target:$("#gTarget").value.trim().slice(0,10),at:Date.now()};save();toast("Vizsgacél mentve.");rerender();};
  if($("#gDel"))$("#gDel").onclick=()=>{S.goal=null;save();rerender();};
  view.querySelectorAll("[data-gd]").forEach(b=>b.onclick=()=>{dailyActive=false;route="gyakorlas";render();startDrill(b.dataset.gd);});
}
