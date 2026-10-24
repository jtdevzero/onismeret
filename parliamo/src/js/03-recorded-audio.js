/* ============ RECORDED AUDIO ============ */
/* Neural-voice recordings ship as base64 bundles (one per unit, story and verb) and are decoded on demand. */
const BUNDLES={}, CLIPS={};
const player=new Audio();
/* The claude.ai artifact holds a limited number of files, so there the bundles are merged into a few larger packs
   (tools/artifact_audio.py writes audio/packs.json: bundle name → pack). The web app keeps the small per-bundle files,
   which the service worker caches one by one. Without a pack map the per-bundle file is used everywhere. */
let PACKMAP=null;const PACKS={};
const packMap=()=>PACKMAP||(PACKMAP=IS_WEB?Promise.resolve(null):fetch("audio/packs.json").then(r=>r.ok?r.json():null).catch(()=>null));
const getJSON=u=>fetch(u).then(r=>r.ok?r.json():null).catch(()=>null);
function loadBundle(name){
  if(!name)return Promise.resolve(null);
  if(!BUNDLES[name])BUNDLES[name]=packMap().then(m=>{const p=m&&m[name];if(!p)return getJSON("audio/"+name+".json");
    if(!PACKS[p])PACKS[p]=getJSON("audio/"+p+".json");return PACKS[p].then(d=>(d&&d[name])||null);});
  return BUNDLES[name];
}
function clipUrl(text,data){
  if(CLIPS[text])return CLIPS[text];
  const b=atob(data),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
  return CLIPS[text]=URL.createObjectURL(new Blob([u],{type:"audio/mpeg"}));
}
const prefetch=(...names)=>names.forEach(n=>loadBundle(n));

/* FSRS-4.5 scheduler, from the Viva Voce package. Grades: 1 = again, 2 = hard, 3 = good, 4 = easy. */
const FSRS=(()=>{const W=[0.4872,1.4003,3.7145,13.8206,5.1618,1.2298,0.8975,0.031,1.6474,0.1367,1.0461,2.1072,0.0793,0.3246,1.587,0.2272,2.8755];
  const DECAY=-0.5,FACTOR=19/81,DAY=864e5,clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
  const R=(t,s)=>Math.pow(1+FACTOR*t/s,DECAY), ivl=(s,r)=>s/FACTOR*(Math.pow(r,1/DECAY)-1);
  const initD=g=>clamp(W[4]-(g-3)*W[5],1,10), nextD=(d,g)=>clamp(W[7]*initD(3)+(1-W[7])*(d-W[6]*(g-3)),1,10);
  const recallS=(d,s,r,g)=>s*(Math.exp(W[8])*(11-d)*Math.pow(s,-W[9])*(Math.exp(W[10]*(1-r))-1)*(g===2?W[15]:1)*(g===4?W[16]:1)+1);
  const forgetS=(d,s,r)=>W[11]*Math.pow(d,-W[12])*(Math.pow(s+1,W[13])-1)*Math.exp(W[14]*(1-r));
  function review(card,g,now,ret){now=now||Date.now();let c;
    if(!card||!card.reps||card.s==null){c={s:W[g-1],d:initD(g),reps:1,lapses:g===1?1:0,last:now};}
    else{c=Object.assign({},card);const r=R(Math.max(0,(now-c.last)/DAY),c.s);
      if(g===1){c.s=Math.max(0.1,Math.min(c.s,forgetS(c.d,c.s,r)));c.lapses=(c.lapses||0)+1;}else c.s=recallS(c.d,c.s,r,g);
      c.d=nextD(c.d,g);c.reps+=1;c.last=now;}
    c.ivl=g===1?0:clamp(Math.round(ivl(c.s,ret||0.9)),1,365);return c;}
  return {review};})();

