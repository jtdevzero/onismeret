/* ============ WEEKLY CHALLENGES ============ */
const weekStart=(t=today())=>t-(t+3)%7;
function incEv(k,n=1){const d=today();const e=S.ev[d]||(S.ev[d]={});e[k]=(e[k]||0)+n;}
function weekSum(k){const w=weekStart();let x=0;for(let d=w;d<=today();d++)x+=k==="xp"?(S.days[d]||0):k==="days"?(S.days[d]?1:0):((S.ev[d]||{})[k]||0);return x;}
const CHAL_POOL=[
  {id:"xp",k:"xp",goal:300,t:"Gyűjts 300 XP-t"},{id:"days",k:"days",goal:5,t:"Gyakorolj 5 különböző napon"},
  {id:"rounds",k:"rounds",goal:5,t:"Teljesíts 5 napi kört"},{id:"lessons",k:"lessons",goal:2,t:"Fejezz be 2 leckét"},
  {id:"stories",k:"stories",goal:2,t:"Hallgass végig 2 történetet"},{id:"fixes",k:"fixes",goal:10,t:"Javíts ki 10 hibát a hibakörben"},
  {id:"reviews",k:"reviews",goal:80,t:"Ismételj át 80 kártyát"},{id:"drills",k:"drills",goal:40,t:"Válaszolj 40 gyakorlókérdésre"},
];
function weekChallenges(){const w=weekStart();const pool=CHAL_POOL.slice();const out=[];let seed=w*9301+49297;
  while(out.length<3){seed=(seed*9301+49297)%233280;out.push(pool.splice(seed%pool.length,1)[0]);}return out;}
function checkChallenges(){
  const w=weekStart(),done=S.chal[w]||(S.chal[w]={});let won=null;
  for(const c of weekChallenges())if(!done[c.id]&&weekSum(c.k)>=c.goal){done[c.id]=true;won=c;S.xp+=50;S.days[today()]=(S.days[today()]||0)+50;}
  if(won){save();setTimeout(()=>{toast("Heti kihívás teljesítve: "+won.t+" · +50 XP");confetti();},400);}
}
function chalCard(){
  const w=weekStart(),done=S.chal[w]||{},left=6-(today()-w);
  return `<div class="card stack" style="gap:.7rem"><div class="row" style="justify-content:space-between"><h3>Heti kihívások</h3><span class="small muted">${left?left+" nap van hátra":"utolsó nap"} · +50 XP mindegyikért</span></div>
    ${weekChallenges().map(c=>{const v=Math.min(c.goal,weekSum(c.k)),ok=done[c.id];return `<div class="chal ${ok?"ok":""}"><div class="row" style="justify-content:space-between"><span>${ok?"✓ ":""}${c.t}</span><span class="small tnum muted">${v} / ${c.goal}</span></div><div class="meter"><i style="width:${v/c.goal*100}%"></i></div></div>`;}).join("")}</div>`;
}

