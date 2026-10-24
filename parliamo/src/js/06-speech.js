/* ============ SPEECH ============ */
let itVoice=null, voicesChecked=false;
function pickVoice(){try{const vs=speechSynthesis.getVoices(),t=LG().tts,pre=t.slice(0,2);if(vs.length){voicesChecked=true;itVoice=vs.find(v=>v.lang.replace("_","-")===t)||vs.find(v=>new RegExp("^"+pre,"i").test(v.lang))||null;}}catch(e){}}
try{speechSynthesis.onvoiceschanged=pickVoice;}catch(e){}
/* say() resolves when the clip or the synthesised speech has finished (or failed), so callers can chain lines. */
let sayDone=null;
function say(text,slow,rate){
  if(sayDone){sayDone();sayDone=null;}
  return new Promise(res=>{
    let fin=false;const done=()=>{if(!fin){fin=true;if(sayDone===done)sayDone=null;res();}};sayDone=done;
    const b=AUDIO_IDX[text];
    if(b){
      try{speechSynthesis.cancel();}catch(e){}
      const play=data=>{if(fin)return;if(!data||!data[text])return tts(text,slow,rate,done);try{player.pause();player.src=clipUrl(text,data[text]);player.playbackRate=rate||(slow?0.7:1);player.onended=done;player.onerror=done;player.play().catch(()=>tts(text,slow,rate,done));}catch(e){tts(text,slow,rate,done);}};
      loadBundle(b).then(play);return;
    }
    tts(text,slow,rate,done);
  });
}
function tts(text,slow,rate,done){
  try{player.pause();}catch(e){}
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang=LG().tts; if(itVoice) u.voice=itVoice;
    u.rate=(S.settings.rate||0.95)*(slow?0.65:1)*(rate||1);
    if(done){u.onend=done;u.onerror=done;setTimeout(done,1500+text.length*120);}
    speechSynthesis.speak(u);
  }catch(e){if(done)done();toast("A felolvasás nem érhető el ebben a böngészőben.");}
}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-say]"); if(b){e.preventDefault();say(b.dataset.say,b.hasAttribute("data-slow"));return;}
  const g=e.target.closest("[data-go]"); if(g){go(g.dataset.go);}
});
let toastT;
function toast(msg){let t=$("#toast");if(!t){t=document.createElement("div");t.id="toast";t.setAttribute("role","status");t.style.cssText="position:fixed;left:50%;transform:translateX(-50%);bottom:calc(90px + env(safe-area-inset-bottom,0px));background:var(--ink);color:var(--bg);padding:.6rem 1rem;border-radius:10px;font-weight:600;z-index:50;max-width:calc(100% - 32px);text-align:center";document.body.appendChild(t);}t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2600);}

