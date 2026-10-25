/* ============ INTONATION CONTOUR (shadowing) ============ */
/* Pitch (fundamental frequency) of the model recording and of the learner's recording, estimated in the browser with a
   normalised autocorrelation on 40 ms frames (16 kHz, 70–400 Hz). Both curves are shown in semitones around each speaker's
   own median. This normalises the baseline; it does not calibrate pronunciation or voice quality. Nothing is uploaded. */
const PITCH_SR=16000,PITCH_MIN=70,PITCH_MAX=400;
function toMono16k(buf){
  const ch=buf.numberOfChannels,n=buf.length,src=new Float32Array(n);
  for(let c=0;c<ch;c++){const d=buf.getChannelData(c);for(let i=0;i<n;i++)src[i]+=d[i]/ch;}
  const step=buf.sampleRate/PITCH_SR,out=new Float32Array(Math.floor(n/step));
  for(let i=0;i<out.length;i++){const a=Math.floor(i*step),b=Math.max(a+1,Math.floor((i+1)*step));let s=0;for(let j=a;j<b;j++)s+=src[j];out[i]=s/(b-a);}
  return out;
}
/* One value per 10 ms: frequency in Hz, or 0 for silence and unvoiced sounds. */
function pitchTrack(x,sr=PITCH_SR){
  const win=Math.round(sr*0.04),hop=Math.round(sr*0.01),lo=Math.floor(sr/PITCH_MAX),hi=Math.ceil(sr/PITCH_MIN),out=[];
  let peak=0;for(let i=0;i<x.length;i++)peak=Math.max(peak,Math.abs(x[i]));
  const gate=Math.max(1e-4,peak*0.06);
  for(let s=0;s+win+hi<x.length;s+=hop){
    let e=0;for(let i=0;i<win;i++)e+=x[s+i]*x[s+i];
    if(Math.sqrt(e/win)<gate){out.push(0);continue;}
    let best=0,lag=0;
    for(let l=lo;l<=hi;l++){let c=0,e2=0;for(let i=0;i<win;i++){c+=x[s+i]*x[s+i+l];e2+=x[s+i+l]*x[s+i+l];}const r=c/Math.sqrt(e*e2||1);if(r>best){best=r;lag=l;}}
    out.push(best>0.55&&lag?sr/lag:0);
  }
  /* A 5-point median removes the occasional octave jump. */
  return out.map((v,i)=>{if(!v)return 0;const w=out.slice(Math.max(0,i-2),i+3).filter(Boolean).sort((a,b)=>a-b);return w[w.length>>1];});
}
function pitchQuality(track){
  const voiced=track.filter(v=>Number.isFinite(v)&&v>0).length,total=track.length;
  return {voiced,total,seconds:voiced*0.01,usable:total>=25&&voiced>=25&&voiced/total>=0.25};
}
/* Keep the full recording timeline. Long unvoiced gaps stay gaps; do not invent a contour across silence. */
function contour(track,n=60){
  if(!pitchQuality(track).usable)return null;
  const voiced=track.filter(v=>v>0).sort((a,b)=>a-b),med=voiced[voiced.length>>1],st=track.map(v=>v?12*Math.log2(v/med):null);
  for(let i=0;i<st.length;){if(st[i]!==null){i++;continue;}const start=i;while(i<st.length&&st[i]===null)i++;const end=i;if(start>0&&end<st.length&&end-start<=15)for(let j=start;j<end;j++)st[j]=st[start-1]+(st[end]-st[start-1])*(j-start+1)/(end-start+1);}
  const pts=[];for(let k=0;k<n;k++){const p=k/(n-1)*(st.length-1),a=Math.floor(p),b=Math.min(a+1,st.length-1),f=p-a;pts.push(st[a]===null||st[b]===null?null:st[a]+(st[b]-st[a])*f);}
  return pts;
}
function contourStats(c){
  const vals=c.filter(Number.isFinite);if(!vals.length)return {range:0,end:"flat"};
  const sorted=vals.slice().sort((a,b)=>a-b),range=sorted[Math.floor(vals.length*0.9)]-sorted[Math.floor(vals.length*0.1)];
  const tail=vals.slice(Math.floor(vals.length*0.75)),slope=tail[tail.length-1]-tail[0];
  return {range,end:slope>1.5?"up":slope<-1.5?"down":"flat"};
}
function contourSim(a,b){
  const pairs=a.map((v,i)=>[v,b[i]]).filter(([v,w])=>Number.isFinite(v)&&Number.isFinite(w));if(pairs.length<12)return null;
  const ma=pairs.reduce((s,p)=>s+p[0],0)/pairs.length,mb=pairs.reduce((s,p)=>s+p[1],0)/pairs.length;let c=0,ea=0,eb=0;
  for(const [x,y] of pairs){c+=(x-ma)*(y-mb);ea+=(x-ma)**2;eb+=(y-mb)**2;}
  return ea>1e-6&&eb>1e-6?Math.max(-1,Math.min(1,c/Math.sqrt(ea*eb))):null;
}
let PITCH_CTX=null;
async function decodeAudio(arrayBuf){
  PITCH_CTX=PITCH_CTX||new (window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,1,44100);
  return await new Promise((res,rej)=>{const p=PITCH_CTX.decodeAudioData(arrayBuf.slice(0),res,rej);if(p&&p.then)p.then(res,rej);});
}
async function modelBuffer(line){
  const b=AUDIO_IDX[line];if(!b)return null;const data=await loadBundle(b);const b64=data&&data[line];if(!b64)return null;
  const bin=atob(b64),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer;
}
/* Returns {me, model?} contours with stats, or null when the recording has no usable voiced part. */
async function analyseIntonation(line,blob){
  const mineBuf=await decodeAudio(await blob.arrayBuffer()),mineTrack=pitchTrack(toMono16k(mineBuf)),mine=contour(mineTrack),meQ=pitchQuality(mineTrack);
  if(!mine)return {me:null,meQ,meDuration:mineBuf.duration};
  let model=null,modelQ=null,modelDuration=null;
  try{const mb=await modelBuffer(line);if(mb){const buf=await decodeAudio(mb),track=pitchTrack(toMono16k(buf));model=contour(track);modelQ=pitchQuality(track);modelDuration=buf.duration;}}catch(e){model=null;}
  return {me:mine,meS:contourStats(mine),meQ,meDuration:mineBuf.duration,model,modelQ,modelDuration,modelS:model&&contourStats(model),sim:model?contourSim(model,mine):null};
}
const END_HU={up:"emelkedő",down:"eső",flat:"egyenletes"};
function contourComparison(r){
  if(!r||!r.model||!r.me)return "";
  if(!Number.isFinite(r.sim))return "A görbealakok ebből a felvételből nem hasonlíthatók össze megbízhatóan.";
  return r.sim>=0.7?"Az időben arányosított görbealakok többnyire hasonló irányban változnak.":r.sim<0?"Az időben arányosított görbealakok több helyen ellentétes irányban változnak.":"Az időben arányosított görbealakok eltérnek egymástól. Hallgasd vissza, hol tér el a két változat.";
}
function intonationHtml(r){
  if(!r||!r.me)return `<p class="small muted">A felvételen nem találtam elég zöngés hangot a hanglejtés kirajzolásához. Csendesebb helyen, a mikrofonhoz közelebb próbáld újra. Ebből nem készül összehasonlítás vagy pontszám.</p>`;
  const W=320,H=120,y=v=>H/2-Math.max(-8,Math.min(8,v))*(H/2-6)/8,path=c=>{let gap=true;return c.map((v,i)=>{if(!Number.isFinite(v)){gap=true;return "";}const p=`${gap?"M":"L"}${(i/(c.length-1)*W).toFixed(1)},${y(v).toFixed(1)}`;gap=false;return p;}).join(" ");};
  const tips=[];
  if(r.model){
    tips.push(contourComparison(r));
    if(r.meS.range<r.modelS.range*0.6)tips.push("A becsült hangmagasság kisebb tartományban változik a saját felvételeden, mint a mintában.");
    else if(r.meS.range>r.modelS.range*1.6)tips.push("A becsült hangmagasság nagyobb tartományban változik a saját felvételeden, mint a mintában.");
    if(r.meS.end!==r.modelS.end)tips.push(`Az utolsó zöngés szakasz iránya a mintában ${END_HU[r.modelS.end]}, a saját felvételeden ${END_HU[r.meS.end]}. Hallgasd vissza a mondat végét is.`);
  }
  return `<div class="stack" style="gap:.4rem"><b>Hanglejtés</b>
    <svg class="intonation-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Becsült hangmagasság az idő függvényében${r.model?": minta és saját":""}" style="width:100%;height:auto;background:var(--sunk);border-radius:10px">
      <line x1="0" x2="${W}" y1="${H/2}" y2="${H/2}" stroke="currentColor" stroke-opacity=".15"/>
      ${r.model?`<path d="${path(r.model)}" fill="none" stroke="var(--cobalt)" stroke-width="3" stroke-linejoin="round"/>`:""}
      <path d="${path(r.me)}" fill="none" stroke="var(--ok)" stroke-width="3" stroke-linejoin="round" stroke-dasharray="${r.model?"6 4":"0"}"/>
      <line data-intonation-cursor x1="0" x2="0" y1="0" y2="${H}" stroke="var(--ink)" stroke-width="2" visibility="hidden"/>
    </svg>
    <div class="intonation-axis small muted"><span>0 · eleje</span><span>félidő</span><span>vége</span></div>
    <div class="row small" style="gap:.8rem">${r.model?`<span><b style="color:var(--cobalt)">━</b> minta${Number.isFinite(r.modelDuration)?" · "+r.modelDuration.toFixed(1)+" mp":""}</span>`:""}<span><b style="color:var(--ok)">┅</b> saját${Number.isFinite(r.meDuration)?" · "+r.meDuration.toFixed(1)+" mp":""}</span></div>
    ${r.model?tips.map(t=>`<p class="small">${esc(t)}</p>`).join(""):`<p class="small muted">${r.modelQ?"A minta hangmagasságából nem rajzolható ki elég megbízható görbe, ezért csak a saját görbédet látod.":"Ehhez a mondathoz nincs felvett minta, ezért csak a saját görbédet látod."}</p>`}
    ${r.meQ?`<p class="small muted">Kirajzolható, zöngésként becsült hangrész: ${r.meQ.seconds.toFixed(1)} mp${Number.isFinite(r.meDuration)?" a "+r.meDuration.toFixed(1)+" mp-es saját felvételből":""}. A szüneteknél a görbe megszakadhat.</p>`:""}
    <p class="small muted">A teljes felvételek idejét arányosítjuk; a szavak nincsenek egymáshoz igazítva. A mozgó időjel az éppen lejátszott felvett hang helyét mutatja. A görbe a saját hangmagasság középértékéhez igazított becslés; nem minősíti a kiejtést vagy a beszéd helyességét.</p></div>`;
}
