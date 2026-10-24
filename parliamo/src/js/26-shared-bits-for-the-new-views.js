/* ============ SHARED BITS FOR THE NEW VIEWS ============ */
let PD=null, PR=null, EX=null;
function stopViews(){if(PD)PD.playing=false;if(MK&&MK.timer)clearInterval(MK.timer);if(SE&&SE.rec)try{SE.rec.stop();}catch(e){}if(SER)SER.playing=false;MK=null;SE=null;JR=null;SER=null;if(CAR){stopCar();CAR=null;}PD=null;PR=null;EX=null;QZ=null;AC=null;SB=null;DL=null;WC=null;VT=null;try{player.pause();speechSynthesis.cancel();}catch(e){}if(sayDone){sayDone();sayDone=null;}}
const LA=()=>`lang="${LG().tts.slice(0,2)}"`;
function subShell(back,label,title,inner,score){
  view.innerHTML=`<div class="player"><div class="row" style="justify-content:space-between"><button class="btn ghost" id="sbBack">← ${back[0]}</button>${score!=null?`<span class="score tnum">${score}</span>`:""}</div><div><span class="label">${label}</span>${title?`<h2>${title}</h2>`:""}</div>${inner}</div>`;
  $("#sbBack").onclick=()=>{stopViews();back[1]();};
}
/* Mistake log for the monthly analysis: what was asked, what the learner gave, what was right. */
function logMiss(k,q,given,correct){
  if(!Array.isArray(S.mlog))S.mlog=[];
  S.mlog.push({d:today(),l:lang(),k:String(k),q:String(q||"").slice(0,160),a:String(given||"").slice(0,120),c:String(correct||"").slice(0,200)});
  if(S.mlog.length>400)S.mlog.splice(0,S.mlog.length-400);
}
/* Align the recognised words in order. Recognition checks text, never pronunciation.
   Each token can match once, so reordered or repeated words cannot get a perfect score. */
function speechDetail(target,alts){
  const words=String(target||"").split(/\s+/).filter(w=>norm(w)),tw=words.map(w=>deacc(norm(w)));
  const heard=Array.isArray(alts)?alts.filter(a=>typeof a==="string"):[];
  let best={words:words.map(w=>({w,ok:false})),score:0,heard:heard[0]||"",missing:words.slice(),extra:[]};
  if(!tw.length)return best;
  for(const a of heard){
    const aw=deacc(norm(a)).split(" ").filter(Boolean),n=tw.length,m=aw.length;
    const dp=Array.from({length:n+1},()=>new Uint16Array(m+1));
    for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)dp[i][j]=tw[i]===aw[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
    const matched=new Set(),used=new Set();let i=0,j=0;
    while(i<n&&j<m){if(tw[i]===aw[j]){matched.add(i++);used.add(j++);}else if(dp[i+1][j]>=dp[i][j+1])i++;else j++;}
    const sc=matched.size/Math.max(n,m,1),res=words.map((w,k)=>({w,ok:matched.has(k)}));
    if(sc>best.score||(sc===best.score&&a===heard[0]))best={words:res,score:sc,heard:a,missing:res.filter(w=>!w.ok).map(w=>w.w),extra:aw.filter((_,k)=>!used.has(k))};
  }
  return best;
}
const micMsg=e=>e==="not-allowed"||e==="service-not-allowed"?"A mikrofon le van tiltva. Engedélyezd a böngésző beállításaiban.":e==="no-speech"?"Nem hallottam semmit. Próbáld újra, kicsit hangosabban.":"A beszédfelismerés most nem működik. Próbáld újra.";

