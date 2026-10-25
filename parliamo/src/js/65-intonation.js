/* ============ INTONATION CONTOUR (shadowing) ============ */
/* Pitch (fundamental frequency) of the model recording and of the learner's recording, estimated in the browser with a
   normalised autocorrelation on 40 ms frames (16 kHz, 70–400 Hz). Both curves are shown in semitones around each speaker's
   own median, so a man copying a woman's voice still compares fairly. Nothing is uploaded. */
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
/* Voiced part, in semitones around the median, resampled to n points (gaps interpolated). */
function contour(track,n=60){
  const first=track.findIndex(Boolean),last=track.length-1-[...track].reverse().findIndex(Boolean);
  if(first<0||last-first<8)return null;
  const seg=track.slice(first,last+1),voiced=seg.filter(Boolean).sort((a,b)=>a-b),med=voiced[voiced.length>>1];
  const st=seg.map(v=>v?12*Math.log2(v/med):null);
  for(let i=0;i<st.length;i++)if(st[i]===null){let a=i-1,b=i+1;while(b<st.length&&st[b]===null)b++;st[i]=a>=0&&b<st.length?st[a]+(st[b]-st[a])/(b-a):a>=0?st[a]:st[b];}
  const pts=[];for(let k=0;k<n;k++){const p=k/(n-1)*(st.length-1),a=Math.floor(p),f=p-a;pts.push(st[a]+(st[Math.min(a+1,st.length-1)]-st[a])*f);}
  return pts;
}
function contourStats(c){
  const sorted=c.slice().sort((a,b)=>a-b),range=sorted[Math.floor(c.length*0.9)]-sorted[Math.floor(c.length*0.1)];
  const tail=c.slice(Math.floor(c.length*0.75)),slope=tail[tail.length-1]-tail[0];
  return {range,end:slope>1.5?"up":slope<-1.5?"down":"flat"};
}
function contourSim(a,b){
  const m=v=>v.reduce((s,x)=>s+x,0)/v.length,ma=m(a),mb=m(b);let c=0,ea=0,eb=0;
  for(let i=0;i<a.length;i++){c+=(a[i]-ma)*(b[i]-mb);ea+=(a[i]-ma)**2;eb+=(b[i]-mb)**2;}
  return ea&&eb?c/Math.sqrt(ea*eb):0;
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
  const mine=contour(pitchTrack(toMono16k(await decodeAudio(await blob.arrayBuffer()))));
  if(!mine)return null;
  let model=null;try{const mb=await modelBuffer(line);if(mb)model=contour(pitchTrack(toMono16k(await decodeAudio(mb))));}catch(e){model=null;}
  return {me:mine,meS:contourStats(mine),model,modelS:model&&contourStats(model),sim:model?contourSim(model,mine):null};
}
const END_HU={up:"emelkedő",down:"eső",flat:"egyenletes"};
function intonationHtml(r){
  if(!r)return `<p class="small muted">A felvételen nem találtam elég zöngés hangot a hanglejtés kirajzolásához. Beszélj kicsit hangosabban, közelebb a mikrofonhoz.</p>`;
  const W=320,H=120,y=v=>H/2-Math.max(-8,Math.min(8,v))*(H/2-6)/8,path=c=>c.map((v,i)=>`${(i/(c.length-1)*W).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const tips=[];
  if(r.model){
    if(r.meS.range<r.modelS.range*0.6)tips.push("A hanglejtésed laposabb a mintánál: a hangsúlyos szavakon emeld meg jobban a hangod.");
    else if(r.meS.range>r.modelS.range*1.6)tips.push("Nagyobbakat ugrik a hangod, mint a mintában: próbáld egyenletesebben.");
    if(r.meS.end!==r.modelS.end&&r.modelS.end!=="flat")tips.push(`A mondat végén a minta hangja ${END_HU[r.modelS.end]}, a tiéd ${END_HU[r.meS.end]}. ${r.modelS.end==="up"?"Kérdésnél a végén emeld fel a hangod.":"Kijelentésnél a végén engedd le a hangod."}`);
    if(!tips.length)tips.push("A hanglejtésed jól követi a mintát.");
  }
  return `<div class="stack" style="gap:.4rem"><b>Hanglejtés</b>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Hanglejtés-görbe${r.model?": minta és saját":""}" style="width:100%;height:auto;background:var(--sunk);border-radius:10px">
      <line x1="0" x2="${W}" y1="${H/2}" y2="${H/2}" stroke="currentColor" stroke-opacity=".15"/>
      ${r.model?`<polyline points="${path(r.model)}" fill="none" stroke="var(--cobalt)" stroke-width="3" stroke-linejoin="round"/>`:""}
      <polyline points="${path(r.me)}" fill="none" stroke="var(--ok)" stroke-width="3" stroke-linejoin="round" stroke-dasharray="${r.model?"6 4":"0"}"/>
    </svg>
    <div class="row small" style="gap:.8rem">${r.model?`<span><b style="color:var(--cobalt)">━</b> minta</span>`:""}<span><b style="color:var(--ok)">┅</b> te</span>${r.model?`<span class="pill">Hasonlóság: ${Math.max(0,Math.round(r.sim*100))}%</span>`:""}</div>
    ${r.model?tips.map(t=>`<p class="small">${esc(t)}</p>`).join(""):`<p class="small muted">Ehhez a mondathoz nincs felvett minta, ezért csak a saját görbédet látod.</p>`}
    <p class="small muted">A görbe a hangmagasság változását mutatja, nem értékeli a kiejtést. Mindkét görbe a saját beszédhangod átlagához igazodik.</p></div>`;
}
