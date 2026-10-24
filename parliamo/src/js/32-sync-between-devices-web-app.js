/* ============ SYNC BETWEEN DEVICES (web app) ============ */
/* Progress is stored on the user's own server (worker/ /sync) next to the AI proxy, guarded by the same access code.
   Each device merges field by field, so practising on two phones in one day loses nothing. */
const DEVICE_KEYS=["proxy","pass","remind","cloud","lang","sound","rate","theme","fs","readable"];
let cloudT=null, cloudRev=0, cloudBusy=false, cloudAt=0, cloudErr="";
function mergeState(a,b){
  const newer=(b.updatedAt||0)>(a.updatedAt||0)?b:a, older=newer===a?b:a, o=JSON.parse(JSON.stringify(newer));
  const per=(k,better)=>{const m=Object.assign({},older[k]||{});for(const [x,v] of Object.entries(newer[k]||{}))m[x]=m[x]===undefined||better(v,m[x])?v:m[x];o[k]=m;};
  const num=(v,w)=>(typeof v==="number"?v:0)>=(typeof w==="number"?w:0);
  per("days",num);per("rounds",num);
  per("cards",(v,w)=>(v.last||0)>=(w.last||0));
  per("lessons",(v,w)=>(v.done?1:0)>(w.done?1:0)||((v.done?1:0)===(w.done?1:0)&&(v.best||0)>=(w.best||0)));
  per("log",(v,w)=>(v.n||0)>=(w.n||0));per("drills",(v,w)=>(v.n||0)>=(w.n||0));per("exam",(v,w)=>(v.n||0)>=(w.n||0));
  per("certs",(v,w)=>(v.score||0)>=(w.score||0));per("plan",(v,w)=>(v.at||0)>=(w.at||0));per("readDone",()=>true);per("dlg",()=>true);per("stories",()=>true);per("pods",()=>true);per("chal",()=>true);per("ai",()=>true);per("hard",()=>true);
  per("core",()=>true);per("gram",(v,w)=>(v.d||0)>=(w.d||0));per("ser",()=>true);per("mock",(v,w)=>(v.length||0)>=(w.length||0));
  const cat=(k,key,max)=>{const seen=new Set();o[k]=[...(a[k]||[]),...(b[k]||[])].filter(x=>{const id=key(x);return !seen.has(id)&&seen.add(id);}).sort((x,y)=>(x.at||0)-(y.at||0)).slice(-max);};
  cat("journal",x=>x.at,120);cat("spk",x=>x.at,60);
  cat("evidence",x=>x.id,80);
  o.dailySessions=Object.assign({},older.dailySessions||{});
  for(const [l,v] of Object.entries(newer.dailySessions||{})){
    const w=o.dailySessions[l];
    if(!w||v.day>w.day){o.dailySessions[l]=v;continue;}if(v.day<w.day)continue;
    const top=(v.at||0)>=(w.at||0)?v:w,other=top===v?w:v,sameLesson=top.lessonId===other.lessonId;
    const sameOutput=!top.outputItemId||!other.outputItemId||top.outputItemId===other.outputItemId;
    o.dailySessions[l]=Object.assign({},top,{review:v.review===true||w.review===true?true:v.review||w.review,
      lesson:sameLesson?(v.lesson===true||w.lesson===true?true:v.lesson||w.lesson):top.lesson,
      output:sameLesson&&sameOutput?(v.output||w.output):top.output,
      outputItemId:top.outputItemId||(sameLesson?other.outputItemId:undefined),
      outputHelp:sameLesson&&sameOutput?!!(v.outputHelp||w.outputHelp):!!top.outputHelp,
      celebrated:!!(v.celebrated||w.celebrated)});
  }
  o.evidence=(o.evidence||[]).map(e=>{
    const s=o.dailySessions[e.l],parts=e.id.split("|");
    if(e.kind==="output"&&s&&s.outputHelp&&s.day===+parts[1]&&s.outputItemId===(e.key||parts[3]))return Object.assign({},e,{kind:"practice",id:[e.l,s.day,"practice",e.key||parts[3]].join("|"),title:"Mondatot gyakoroltál segítséggel"});
    return e;
  }).filter((e,i,a)=>a.findIndex(x=>x.id===e.id)===i);
  o.onboardingSample=Object.assign({},older.onboardingSample||{},newer.onboardingSample||{});
  o.sk={};for(const k of ["read","listen","write","speak"]){const seen=new Set();o.sk[k]=[...((a.sk||{})[k]||[]),...((b.sk||{})[k]||[])].filter(x=>{const id=x.at+"|"+x.src;return !seen.has(id)&&seen.add(id);}).sort((x,y)=>x.at-y.at).slice(-40);}
  o.ev=Object.assign({},older.ev||{});for(const [d,e] of Object.entries(newer.ev||{})){const m=Object.assign({},o.ev[d]||{});for(const [k,n] of Object.entries(e))m[k]=Math.max(m[k]||0,n);o.ev[d]=m;}
  o.own={};for(const l of new Set([...Object.keys(a.own||{}),...Object.keys(b.own||{})])){const seen=new Set();o.own[l]=[...((newer.own||{})[l]||[]),...((older.own||{})[l]||[])].filter(w=>!seen.has(w.id)&&seen.add(w.id));}
  const ks=new Set();o.mlog=[...(a.mlog||[]),...(b.mlog||[])].filter(m=>{const k=m.d+"|"+m.k+"|"+m.q+"|"+m.a;return !ks.has(k)&&ks.add(k);}).sort((x,y)=>x.d-y.d).slice(-400);
  o.xp=Math.max(a.xp||0,b.xp||0);o.onboarded=!!(a.onboarded||b.onboarded);
  o.placed=Object.assign({},older.placed||{},newer.placed||{});
  o.settings=Object.assign({},newer.settings||{});DEVICE_KEYS.forEach(k=>{if(a.settings&&k in a.settings)o.settings[k]=a.settings[k];});
  o.updatedAt=Math.max(a.updatedAt||0,b.updatedAt||0);
  return o;
}
function cloudCopy(){const o=JSON.parse(JSON.stringify(S));DEVICE_KEYS.forEach(k=>delete o.settings[k]);return o;}
function queueCloud(){if(!IS_WEB||!S.settings.cloud||cloudBusy)return;clearTimeout(cloudT);cloudT=setTimeout(()=>cloudSync(),4000);}
function learningViewActive(){
  return !!(P||CS||D||ST||PD||PR||EX||PL||MK||SE||JR||SER||QZ||SB||AC||WC||CAR||DL||VT||dailyActive||
    route==="tanar"&&(T.sc||T.busy)||view.querySelector("#aiSetupBack,#jrCardReview")||
    view.contains(document.activeElement)&&document.activeElement.matches("input,textarea"));
}
async function cloudSync(){
  if(!IS_WEB||!S.settings.cloud||cloudBusy)return;
  // Merging replaces state objects: wait until an exercise no longer holds references into them.
  if(learningViewActive()){queueCloud();return;}
  clearTimeout(cloudT);cloudT=null;cloudBusy=true;
  try{
    for(let n=0;n<3;n++){
      const r=await proxyPost("/sync/get");
      if(learningViewActive()){cloudBusy=false;queueCloud();return;}
      if(r.state){const before=JSON.stringify(S),lang0=lang();S=migrate(mergeState(S,r.state));
        if(JSON.stringify(S)!==before){try{localStorage.setItem(LS,JSON.stringify(S));}catch(e){}queueRemote();
          if(lang()!==lang0)await loadCourse();else{rebuildOwn();}if(!learningViewActive()&&S.onboarded&&!view.querySelector("details[open]"))render();else renderChips();}}
      try{const w=await proxyPost("/sync/put",{state:cloudCopy(),base:r.rev||0});cloudRev=w.rev;cloudAt=Date.now();cloudErr="";break;}
      catch(e){if(e&&e.code==="conflict")continue;throw e;}
    }
  }catch(e){cloudErr=pushMsg(e);}
  cloudBusy=false;const m=$("#sSyncMsg");if(m)m.textContent=syncLine();
}
const syncLine=()=>cloudErr?cloudErr:cloudAt?"Utolsó szinkron: "+new Date(cloudAt).toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"}):S.settings.cloud?"Bekapcsolva.":"";
/* When the app goes to the background, send pending changes right away (keepalive survives closing the tab). */
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState!=="hidden"||!cloudT||!IS_WEB||!S.settings.cloud||!cloudRev)return;
  clearTimeout(cloudT);cloudT=null;const st=S.settings,body=JSON.stringify({state:cloudCopy(),base:cloudRev});
  try{fetch(st.proxy.replace(/\/+$/,"")+"/sync/put",{method:"POST",headers:{"content-type":"application/json","x-app-key":st.pass},body,keepalive:body.length<60000}).then(r=>r.ok&&r.json()).then(j=>{if(j&&j.rev)cloudRev=j.rev;}).catch(()=>{});}catch(e){}
});

