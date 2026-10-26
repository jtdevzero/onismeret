/* ============ STATE ============ */
const LS="parliamo.v1";
function fresh(){return {v:1,resetAt:0,activeExercises:{},lessonCoverage:{},journalDrafts:{},xp:0,days:{},lessons:{},cards:{},stories:{},miss:{},log:{},ai:{},rounds:{},ev:{},chal:{},own:{},hard:{},pods:{},exam:{},certs:{},plan:{},mlog:[],onboarded:false,newToday:{day:0,n:0},drills:{},dailySessions:{},evidence:[],settings:{goal:50,newPerDay:10,dir:"mix",rate:0.95,ret:0.9,lang:"en",proxy:"",pass:"",cloud:false,theme:"auto",fs:"m",readable:false},updatedAt:0};}
function migrate(s){const old=s&&s.xp>0&&s.onboarded===undefined;const f=fresh();s=Object.assign(f,s||{});if(old)s.onboarded=true;s.settings=Object.assign(fresh().settings,s.settings||{});
  for(const rec of Object.values(s.lessons||{}))if(rec&&rec.placed&&rec.done&&!rec.best)rec.done=false;
  if(!Array.isArray(s.evidence))s.evidence=[];if(!s.dailySessions||typeof s.dailySessions!=="object")s.dailySessions={};
  s.resetAt=resetEpoch(s);
  for(const key of ["activeExercises","lessonCoverage","journalDrafts"])if(!s[key]||typeof s[key]!=="object"||Array.isArray(s[key]))s[key]={};
  return s;}
/* A reset starts a new generation of progress. An older device cannot merge its old generation back in. */
function resetEpoch(state){const value=Number(state&&state.resetAt);return Number.isSafeInteger(value)&&value>=0?value:0;}
function resetProgress(){
  const settings=Object.assign({},S.settings),onboarded=!!S.onboarded,epoch=Math.max(Date.now(),resetEpoch(S)+1);
  S=fresh();S.settings=settings;S.onboarded=onboarded;S.resetAt=epoch;save();return S;
}
let S=fresh();
try{const raw=localStorage.getItem(LS);if(raw)S=migrate(JSON.parse(raw));}catch(e){}
let sync="local", docRef=null, rTimer=null, rBusy=false, rAgain=false;
function save(){S.updatedAt=Date.now();try{localStorage.setItem(LS,JSON.stringify(S));}catch(e){}queueRemote();queueCloud();renderChips();if(typeof updateBadge==="function")updateBadge();}
function queueRemote(){if(!docRef)return;clearTimeout(rTimer);rTimer=setTimeout(pushRemote,2000);}
async function pushRemote(){
  if(rBusy){rAgain=true;return;}rBusy=true;
  try{
    const snap=await docRef.get(),remote=snap.exists&&(snap.data()||{}).state;
    if(remote&&resetEpoch(remote)>resetEpoch(S)){
      S=migrate(Object.assign({},remote,{settings:Object.assign({},remote.settings||{},S.settings)}));
      try{localStorage.setItem(LS,JSON.stringify(S));}catch(e){}
      P=null;CS=null;D=null;ST=null;PL=null;dailyActive=false;stopViews();if(LESSONS.length)render();
    }
    await docRef.set({state:cloudCopy()});sync="cloud";
  }catch(e){sync="local";}
  rBusy=false;renderChips();if(rAgain){rAgain=false;pushRemote();}
}
(async()=>{
  if(!window.claude||!window.claude.use) return;
  try{
    const [db,user]=await Promise.all([claude.use("db"),claude.use("user")]);
    if(!db||!user) return;
    const id=await user.id(); if(!id) return;
    docRef=db.collection("data/users/"+id).doc("progress");
    const snap=await docRef.get();
    const r=snap.exists?snap.data():null;
    if(r&&r.state&&(resetEpoch(r.state)>resetEpoch(S)||(resetEpoch(r.state)===resetEpoch(S)&&(r.state.updatedAt||0)>(S.updatedAt||0)))){S=migrate(Object.assign({},r.state,{settings:Object.assign({},r.state.settings||{},S.settings)}));try{localStorage.setItem(LS,JSON.stringify(S));}catch(e){}sync="cloud";pruneState();if(LESSONS.length&&!P&&!CS&&!D&&!ST)render();}
    else if(S.updatedAt){sync="cloud";pushRemote();}
    else sync="cloud";
    renderChips();
  }catch(e){sync="local";renderChips();}
})();
/* Same page runs in two places: as a claude.ai artifact (window.claude present) and as the standalone web app.
   In the web app the AI goes through the user's own proxy (worker/), so the API key never reaches the browser. */
const IS_WEB=!(window.claude&&window.claude.use);
let sampleP=null;
function proxySample(){
  const st=S.settings;if(!st.proxy||!st.pass)return null;
  const call=async(input,opts={})=>{
    const messages=typeof input==="string"?[{role:"user",content:input}]:input;
    let r;try{r=await fetch(st.proxy.replace(/\/+$/,"")+"/chat",{method:"POST",headers:{"content-type":"application/json","x-app-key":st.pass},body:JSON.stringify({tier:opts.modelTier||"default",messages}),signal:opts.signal});}
    catch(e){if(e&&e.name==="AbortError")throw {code:"aborted"};throw {code:"network"};}
    if(r.status===401)throw {code:"bad_key"};if(r.status===429){const j=await r.json().catch(()=>({}));throw {code:j.error==="budget"?"budget":"rate_limited"};}if(r.status===503){const j=await r.json().catch(()=>({}));if(j.error==="no_ai_key")throw {code:"no_ai_key"};}if(!r.ok)throw {code:"error"};
    const j=await r.json();if(j.refused)throw {code:"refused"};const text=String(j.text||"");
    if(opts.onText)opts.onText({text,delta:text});return {text,truncated:!!j.truncated};
  };
  call.json=async(input,opts)=>{const {text}=await call(input,opts);const m=text.match(/\{[\s\S]*\}/);if(!m)throw {code:"invalid_json",text};try{return JSON.parse(m[0]);}catch(e){throw {code:"invalid_json",text};}};
  return call;
}
function getSample(){
  if(IS_WEB)return Promise.resolve(proxySample());
  if(!sampleP)sampleP=claude.use("sample").catch(()=>null);return sampleP;
}
const aiMissing=()=>IS_WEB?"Ehhez AI-kapcsolat szükséges. Az AI-tanár oldalon közvetlenül beállíthatod. A leckék és az ismétlés enélkül is használható.":"Az AI-tanár csak a claude.ai-on megnyitott oldalon érhető el.";
function aiErr(e){const c=e&&e.code;if(c==="no_ai_key")return "A szervereden nincs Claude-kulcs, ezért a webappban nincs AI. A szinkron és az emlékeztető működik; az AI-funkciókat a claude.ai-os változatban (artifact) használd.";if(c==="bad_key")return "Hibás belépőkód. Ellenőrizd a Beállításokban az AI-kapcsolatot.";if(c==="network")return "Nem érem el az AI-szervert. Ellenőrizd a netet és a szerver címét.";if(c==="refused")return "Erre a kérésre a tanár nem válaszolt. Fogalmazd meg másképp.";if(c==="not_granted")return "Nem engedélyezted az AI-tanárt ebben a nézetben. Töltsd újra az oldalt, ha mégis használnád.";if(c==="budget")return "Elérted a szerveren beállított havi AI-keretet. A következő hónapban újra működik, vagy emeld a keretet (MONTHLY_BUDGET_USD).";if(c==="rate_limited")return "Túl sok kérés ment el egyszerre. Várj fél percet, és próbáld újra.";return "Nem jött válasz a tanártól. Próbáld újra.";}

function today(){return dayNum();}
function addXP(n){S.xp+=n;const d=today();S.days[d]=(S.days[d]||0)+n;save();checkChallenges();
  if(IS_WEB&&S.settings.remind&&S.settings.remind.on&&S.pushPinged!==d){S.pushPinged=d;pushSync().catch(()=>{});}}
function streak(){let d=today(),n=0;if(!S.days[d])d--;while(S.days[d]){n++;d--;}return n;}
const ls=i=>S.lessons[LESSONS[i].id];
function doneCount(){return LESSONS.filter((_,i)=>ls(i)&&ls(i).done).length;}
function nextLesson(){const i=LESSONS.findIndex((_,i)=>!(ls(i)&&(ls(i).done||ls(i).placed)));return i<0?null:i;}

/* cards */
function unlocked(){const d=LESSONS.map((_,i)=>i).filter(i=>ls(i)&&(ls(i).done||ls(i).placed));return (d.length?d:[0]).concat([OWN_LI()]);}
function dueList(){const t=today();return POOL.filter(c=>S.cards[c.id]&&S.cards[c.id].due<=t);}
function newLeft(){const t=today();const used=S.newToday.day===t?S.newToday.n:0;return Math.max(0,S.settings.newPerDay-used);}
function newAvail(){const u=new Set(unlocked());return POOL.filter(c=>u.has(c.li)&&!S.cards[c.id]);}
/* Personal scheduling: the learner's target retention, a "hard card" flag that shortens intervals,
   and a gentle multiplier that stretches or shrinks intervals when real recall runs above or below the target. */
function adaptMul(){let n=0,ok=0;const t=today();for(let i=0;i<30;i++){const l=S.log[t-i];if(l){n+=l.n;ok+=l.ok;}}
  if(n<40)return 1;return Math.min(1.25,Math.max(0.75,1+(ok/n-(S.settings.ret||0.9))*3));}
function sched(prev,g,id){const c=FSRS.review(prev,g+1,Date.now(),S.settings.ret||0.9);
  if(c.ivl>0)c.ivl=Math.max(1,Math.min(365,Math.round(c.ivl*adaptMul()*(id&&S.hard[id]?0.6:1))));c.due=today()+c.ivl;return c;}
const ivlLabel=c=>c.ivl===0?"most":c.ivl===1?"1 nap":c.ivl<30?c.ivl+" nap":Math.round(c.ivl/30)+" hó";
const packCards=()=>POOL.map(c=>S.cards[c.id]).filter(Boolean);
function learnedCount(){return packCards().filter(c=>c.reps>0).length;}

