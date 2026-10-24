/* ============ HANDS-FREE REVIEW (car mode) ============ */
let CAR=null;
function sayHu(text){
  return new Promise(res=>{try{player.pause();speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="hu-HU";const v=speechSynthesis.getVoices().find(x=>/^hu/i.test(x.lang));if(v)u.voice=v;u.rate=1;u.onend=res;u.onerror=res;setTimeout(res,1500+text.length*110);speechSynthesis.speak(u);}catch(e){res();}});
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function startCar(){
  const due=dueList().sort((a,b)=>S.cards[a.id].due-S.cards[b.id].due);
  const extra=POOL.filter(c=>S.cards[c.id]&&!due.includes(c)).sort((a,b)=>S.cards[a.id].due-S.cards[b.id].due);
  const q=[...due,...extra].slice(0,30);
  if(!q.length){toast("Még nincs ismételhető kártya. Fejezz be egy leckét vagy egy napi kört.");return;}
  prefetch(...new Set(q.map(c=>LESSONS[c.li]&&LESSONS[c.li].id).filter(Boolean)));
  CAR={q,i:0,run:true,phase:"",done:0,lock:null};
  try{if(navigator.wakeLock)navigator.wakeLock.request("screen").then(l=>{if(CAR)CAR.lock=l;}).catch(()=>{});}catch(e){}
  drawCar();carLoop();
}
function stopCar(){if(!CAR)return;CAR.run=false;try{CAR.lock&&CAR.lock.release();}catch(e){}try{player.pause();speechSynthesis.cancel();}catch(e){}if(sayDone)sayDone();}
function drawCar(){
  const c=CAR.q[CAR.i];
  view.innerHTML=`<div class="player car"><div class="row" style="justify-content:space-between"><button class="btn ghost" id="carStop">Befejezés</button><span class="score tnum">${CAR.i+1} / ${CAR.q.length}</span></div>
    <div class="card stack" style="align-items:center;text-align:center;padding:2rem 1rem;min-height:220px;justify-content:center"><span class="label">${esc(CAR.phase||"Hangos ismétlés")}</span>
      ${c?`<div class="big-q">${esc(c.hu)}</div>${CAR.phase==="Válasz"||CAR.phase==="Értékelés"?`<div class="big-q" style="color:var(--cobalt)" ${LA()}>${esc(c.it)}</div>`:""}`:""}</div>
    <div class="carbtns"><button class="btn" data-cg="0">Újra</button><button class="btn lemon" data-cg="2">Tudtam</button><button class="btn soft" data-cg="3">Könnyű</button></div>
    <p class="small muted" style="text-align:center">${canSpeak()?"Válaszolj hangosan: „tudtam”, „könnyű” vagy „újra”. Ha nem szólsz, a kártya marad a következő alkalomra.":"Az app felolvassa a magyar jelentést, vár, aztán kimondja a választ. Értékelj a nagy gombokkal."}</p></div>`;
  $("#carStop").onclick=()=>{stopCar();const n=CAR.done;CAR=null;toast(`${n} kártyát ismételtél hangosan.`);go("kartyak");};
  view.querySelectorAll("[data-cg]").forEach(b=>b.onclick=()=>{CAR.manual=+b.dataset.cg;if(CAR.phase!=="Értékelés"){try{player.pause();speechSynthesis.cancel();}catch(e){}if(sayDone)sayDone();}});
}
function carGrade(c,g){const isNew=!S.cards[c.id];S.cards[c.id]=sched(S.cards[c.id],g,c.id);logReview(g>0);incEv("reviews");if(g===0)S.miss[c.id]=(S.miss[c.id]||0)+1;if(isNew){const t=today();if(S.newToday.day!==t)S.newToday={day:t,n:0};S.newToday.n++;}CAR.done++;addXP(1);}
async function carLoop(){
  const me=CAR;
  while(me.run&&me.i<me.q.length){
    const c=me.q[me.i];me.manual=null;
    me.phase="Kérdés";drawCar();await sayHu(c.hu);if(!me.run)return;
    for(let t=0;t<35&&me.run&&me.manual==null;t++)await wait(100);if(!me.run)return;
    me.phase="Válasz";drawCar();await say(c.it);if(!me.run)return;
    let g=me.manual;
    if(g==null){me.phase="Értékelés";drawCar();
      if(canSpeak()){try{const alts=(await listen()).join(" ").toLowerCase();g=/újra|nem tudtam|nem|again|no\b/.test(alts)?0:/könnyű|easy/.test(alts)?3:/tudtam|igen|megvan|jó|yes|ok/.test(alts)?2:null;}catch(e){g=null;}}
      else{for(let t=0;t<60&&me.run&&me.manual==null;t++)await wait(100);g=me.manual;}}
    if(!me.run)return;
    if(g!=null)carGrade(c,g);
    me.i++;
  }
  if(me.run&&CAR===me){stopCar();save();view.innerHTML=`<div class="player" style="justify-content:center;align-items:center;text-align:center"><span class="label">Hangos ismétlés</span><h1>${LG().fin[1]}</h1><p class="muted">${me.done} kártyát értékeltél, kéz nélkül.</p><div class="row" style="justify-content:center"><button class="btn ghost" data-go="kartyak">Kártyák</button><button class="btn" id="carAgain">Még egy kör</button></div></div>`;$("#carAgain").onclick=startCar;CAR=null;}
}

