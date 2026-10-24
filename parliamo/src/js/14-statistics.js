/* ============ STATISTICS ============ */
function renderStats(){
  const t=today(), pc=packCards(), mature=pc.filter(c=>c.ivl>=21).length, learning=pc.length-mature, unseen=POOL.length-pc.length;
  let n=0,ok=0;for(let i=0;i<30;i++){const l=S.log[t-i];if(l){n+=l.n;ok+=l.ok;}}
  const ret=n?Math.round(ok/n*100):null;
  const fc=Array(7).fill(0);POOL.forEach(c=>{const s=S.cards[c.id];if(!s)return;const d=Math.max(0,s.due-t);if(d<7)fc[d]++;});
  const fmax=Math.max(1,...fc), dn=["ma","holnap","+2","+3","+4","+5","+6"];
  const sum=(a,b)=>{let x=0;for(let i=a;i<=b;i++)x+=S.days[t-i]||0;return x;}, w1=sum(0,6), w0=sum(7,13);
  const start=t-(t+3)%7-15*7, goal=S.settings.goal;let heat="";
  for(let d=start;d<=t;d++){const v=S.days[d]||0;heat+=`<i class="${v===0?"":v<goal/2?"l1":v<goal?"l2":"l3"} ${d===t?"today":""}" title="${v} XP"></i>`;}
  const ld=doneCount(), sd=STORIES.filter(s=>S.stories[s.id]).length, pct=x=>POOL.length?x/POOL.length*100:0;
  view.innerHTML=`<div class="stack">
  <div class="row"><button class="btn ghost" data-go="ma">← Kezdőlap</button></div>
  <div class="row" style="justify-content:space-between;align-items:flex-end"><div><span class="label">${LG().name} · haladás</span><h1>Statisztika</h1></div><button class="btn soft" data-go="utlevel">Útlevél · ${LESSONS.filter((_,i)=>ls(i)&&ls(i).done).length} pecsét</button></div>
  <div class="card"><div class="stats">
    <div class="stat"><span class="label">Megtartás (30 nap)</span><b class="tnum">${ret===null?"–":ret+"%"}</b><span class="small muted">${n} ismétlésből</span></div>
    <div class="stat"><span class="label">Ezen a héten</span><b class="tnum">${w1} XP</b><span class="small ${w1>=w0?"":"muted"}" style="color:var(--${w1>=w0?"ok":"muted"})">${w0?(w1>=w0?"+":"")+Math.round((w1-w0)/w0*100)+"% a múlt héthez":"első hét"}</span></div>
    <div class="stat"><span class="label">Leckék</span><b class="tnum">${ld} / ${LESSONS.length}</b></div>
    <div class="stat"><span class="label">Történetek</span><b class="tnum">${sd} / ${STORIES.length}</b></div>
  </div></div>
  <div class="card stack"><h3>Szókincs</h3>
    <div class="sbar" role="img" aria-label="${mature} megy, ${learning} tanulásban, ${unseen} még új"><i style="width:${pct(mature)}%;background:var(--ok)"></i><i style="width:${pct(learning)}%;background:var(--cobalt)"></i><i style="width:${pct(unseen)}%;background:var(--sunk)"></i></div>
    <div class="row small"><span><b style="color:var(--ok)">■</b> Megy (21+ nap): ${mature}</span><span><b style="color:var(--cobalt)">■</b> Tanulásban: ${learning}</span><span class="muted">■ Még új: ${unseen}</span><span class="pill ${missCount()?"bad":"ok"}">Hibáim: ${missCount()}</span></div></div>
  <div class="card stack"><h3>Ismétlések a következő 7 napban</h3>
    <div class="bars">${fc.map((v,i)=>`<div class="bcol"><span class="small tnum">${v}</span><i style="height:${Math.max(3,v/fmax*100)}%"></i><span class="small muted">${dn[i]}</span></div>`).join("")}</div></div>
  <div class="card stack"><h3>Aktivitás az elmúlt 16 hétben</h3><div class="heat days">${heat}</div><div class="row small muted" style="justify-content:space-between"><span>16 hete</span><span>ma</span></div></div>
  ${milestonesCard()}
  ${skillsCard()}
  ${vsizeCard()}
  ${analysisCard()}
  </div>`;
  bindAnalysis();if($("#vtGo"))$("#vtGo").onclick=startVT;window.scrollTo(0,0);
}

