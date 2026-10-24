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
/* Word-level match between what was meant and the best recognised alternative. */
function speechDetail(target,alts){
  const words=target.split(/\s+/).filter(Boolean);let best={words:words.map(w=>({w,ok:false})),score:0,heard:alts[0]||""};
  for(const a of alts){const aw=new Set(deacc(norm(a)).split(" "));const res=words.map(w=>({w,ok:!deacc(norm(w))||aw.has(deacc(norm(w)))}));
    const sc=res.filter(x=>x.ok).length/Math.max(1,res.length);if(sc>best.score)best={words:res,score:sc,heard:a};}
  return best;
}
const micMsg=e=>e==="not-allowed"||e==="service-not-allowed"?"A mikrofon le van tiltva. Engedélyezd a böngésző beállításaiban.":e==="no-speech"?"Nem hallottam semmit. Próbáld újra, kicsit hangosabban.":"A beszédfelismerés most nem működik. Próbáld újra.";

