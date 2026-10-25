/* ============ HELPERS ============ */
const $=s=>document.querySelector(s);
const view=$("#view");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const pick=(a,n)=>shuffle(a.slice()).slice(0,n);
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const dayNum=(d=new Date())=>Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/864e5);
const norm=s=>String(s).toLowerCase().replace(/[’`´ʼ]/g,"'").replace(/[.,!?¿¡;:"«»()…]/g,"").replace(/'\s+/g,"'").replace(/\s+/g," ").trim();
const deacc=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"");
/* Translation alternatives are deliberately narrow and meaning preserving. Grammar and
   dictation never accept a paraphrase or silently remove a required article. */
function answerForm(text){
  const s=norm(text);
  if(lang()!=="en")return s;
  const forms={"i'm":"i am","you're":"you are","we're":"we are","they're":"they are","it's":"it is",
    "don't":"do not","doesn't":"does not","didn't":"did not","can't":"cannot","won't":"will not",
    "isn't":"is not","aren't":"are not","wasn't":"was not","weren't":"were not",
    "i've":"i have","you've":"you have","we've":"we have","they've":"they have"};
  return s.replace(/\b(?:i'm|you're|we're|they're|it's|don't|doesn't|didn't|can't|won't|isn't|aren't|wasn't|weren't|i've|you've|we've|they've)\b/g,x=>forms[x]).replace(/\bi'd like\b/g,"i would like");
}
function requestMeaning(text){
  let s=answerForm(text),m;
  if(lang()==="en"){
    s=s.replace(/^please\s+|\s+please$/g,"");
    m=s.match(/^(?:can|could|may) (i|we) (?:have|get) (.+)$/)||s.match(/^(i|we) would like (.+)$/);
    /* "would like to go" and "have to go" express different meanings. Only
       the shared object of a request can be compared by this narrow rule. */
    return m&&!/^to\b/.test(m[2])?m[1]+"|"+m[2]:null;
  }
  if(lang()==="it"){
    s=s.replace(/\s+per (?:favore|piacere)$/g,"");
    m=s.match(/^(?:vorrei|posso avere|potrei avere) (.+)$/);return m?"io|"+m[1]:null;
  }
  if(lang()==="es"){
    s=s.replace(/\s+por favor$/g,"");
    m=s.match(/^(?:quisiera|querría|me gustaría|puedo tomar|podría tomar) (.+)$/);return m?"yo|"+m[1]:null;
  }
  return null;
}
function check(user,answers,opts={}){
  const u=norm(user),list=(Array.isArray(answers)?answers:[answers]).filter(a=>typeof a==="string"&&a.trim());
  if(!u)return {ok:false,hint:"Írj be egy választ."};
  for(const a of list){const n=norm(a);
    if(u===n)return {ok:true};
    if(deacc(u)===deacc(n))return {ok:true,warn:"Figyelj az ékezetre: "+a};
  }
  if(opts.type==="translation")for(const a of list){
    const af=answerForm(a),uf=answerForm(user);
    if(af===uf)return {ok:true,alternative:true};
    if(deacc(af)===deacc(uf))return {ok:true,alternative:true,warn:"Figyelj az ékezetekre a mintában."};
    const ar=requestMeaning(a),ur=requestMeaning(user);
    if(ar&&ur&&ar===ur)return {ok:true,alternative:true};
    if(ar&&ur&&deacc(ar)===deacc(ur))return {ok:true,alternative:true,warn:"Figyelj az ékezetekre a mintában."};
  }
  const articleMissing=list.some(a=>{const n=norm(a),bare=n.replace(LG().art,"");return bare!==n&&deacc(u)===deacc(bare);});
  return {ok:false,hint:articleMissing?"Figyeld meg a kifejezés elejét: a névelő vagy a to is a tanult alak része.":opts.type==="translation"?"Nézd át a személyt, az ige alakját és a szórendet. Más jó megfogalmazás is létezhet a megadott mintákon kívül.":"Ellenőrizd a teljes tanult alakot, a névelőt és a szavak sorrendjét."};
}
const spkBtn=(t,cls="")=>`<button class="icon-btn ${cls}" data-say="${esc(t)}" aria-label="Meghallgatás: ${esc(t)}">${I.spk}</button>`;
const pic=(name,cls="")=>`<div class="pic ${cls}"><img src="img/${name}.webp" alt="" loading="lazy" decoding="async" onerror="this.remove()"></div>`;
/* Feedback sounds (synthesised, no files) and a short vibration where the device supports it. */
let actx=null;
function fx(kind){
  if(S.settings.sound===false)return;
  try{
    if(navigator.vibrate)navigator.vibrate(kind==="bad"?[30,40,30]:kind==="win"?[20,30,20,30,60]:15);
    actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==="suspended")actx.resume();
    const notes={ok:[[880,0],[1318.5,.09]],bad:[[220,0],[185,.1]],win:[[523.3,0],[659.3,.1],[784,.2],[1046.5,.32]],tap:[[660,0]]}[kind]||[];
    const t0=actx.currentTime;
    for(const [f,dt] of notes){const o=actx.createOscillator(),g=actx.createGain();o.type=kind==="bad"?"triangle":"sine";o.frequency.value=f;
      g.gain.setValueAtTime(0,t0+dt);g.gain.linearRampToValueAtTime(kind==="bad"?.12:.16,t0+dt+.015);g.gain.exponentialRampToValueAtTime(.001,t0+dt+(kind==="win"?.45:.22));
      o.connect(g).connect(actx.destination);o.start(t0+dt);o.stop(t0+dt+.5);}
  }catch(e){}
}
function confetti(){
  fx("win");
  if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const c=document.createElement("canvas");c.style.cssText="position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60";document.body.appendChild(c);
  const x=c.getContext("2d"),W=c.width=innerWidth*devicePixelRatio,H=c.height=innerHeight*devicePixelRatio,cols=["#1F4FD6","#F2C230","#E2604A","#4CC38A","#FFFFFF"];
  const ps=Array.from({length:140},()=>({x:W/2+(Math.random()-.5)*W*.3,y:H*.35,vx:(Math.random()-.5)*22,vy:-Math.random()*26-8,s:(Math.random()*8+5)*devicePixelRatio,r:Math.random()*6,vr:(Math.random()-.5)*.3,c:rnd(cols)}));
  let t=0;(function f(){x.clearRect(0,0,W,H);ps.forEach(p=>{p.vy+=.7;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/3,p.s,p.s*.66);x.restore();});if(++t<120)requestAnimationFrame(f);else c.remove();})();
}
function blankify(q){return esc(q).replace("___",'<span class="blank"></span>');}

