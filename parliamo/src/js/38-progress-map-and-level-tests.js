/* ============ PROGRESS MAP AND LEVEL TESTS ============ */
const certKey=l=>lang()+"-"+l;
function levelLessons(l){return LESSONS.map((L,i)=>({L,i})).filter(x=>x.L.level===l);}
function renderMap(){
  const levels=LG().levels.filter(l=>levelLessons(l).length);let html="";
  levels.forEach((l,k)=>{
    const ls_=levelLessons(l),done=ls_.filter(x=>ls(x.i)&&ls(x.i).done).length,pct=done/ls_.length,cert=S.certs[certKey(l)],open=pct>=0.7;
    html+=`<div class="mapband"><div class="mapnodes">${ls_.map(({L,i})=>{const s=ls(i),d=s&&s.done;return `<button class="mnode ${d?"done":s&&s.placed?"placed":i===nextLesson()?"cur":""}" data-l="${i}" title="${esc(L.t)}" aria-label="${i+1}. lecke: ${esc(L.t)}${d?", kész":s&&s.placed?", szintfelmérő alapján átugorva":""}">${d?"✓":s&&s.placed?"↗":i+1}</button>`;}).join('<i class="mline"></i>')}</div>
      <div class="mile ${cert?"ok":open?"open":""}"><div><span class="label">${l} szint · ${done}/${ls_.length} lecke</span><h3>${cert?`${l} oklevél megszerezve`:open?`${l} szintzáró teszt`:`${l} mérföldkő`}</h3><p class="small muted">${cert?`${new Date(cert.at).toLocaleDateString("hu-HU")} · ${esc(cert.score)}%`:open?"15 kérdés a szint leckéiből. 80%-tól jár az oklevél.":"A szintzáró a szint leckéinek 70%-a után nyílik meg."}</p></div>
      ${cert?`<button class="btn soft" data-cert="${l}">Oklevél</button>`:open?`<button class="btn lemon" data-test="${l}">Teszt</button>`:`<span class="pill">${Math.round(pct*100)}%</span>`}</div></div>`;});
  view.innerHTML=`<div class="stack"><div class="row"><button class="btn ghost" data-go="leckek">← Leckék</button></div>
    <div><span class="label">${LG().name} · ${LG().range}</span><h1>Haladási térkép</h1><p class="muted">Az útvonalad szintenként. A ↗ jelű leckéket a szintfelmérő alapján átugrottad; ezekért még nem jár teljesítés vagy pecsét. Az oklevél az app feladatainak teljesítését jelzi, nem hivatalos nyelvvizsga.</p></div>
    <div class="map">${html}</div></div>`;
  view.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{route="leckek";render();openLesson(+b.dataset.l);});
  view.querySelectorAll("[data-test]").forEach(b=>b.onclick=()=>levelTest(b.dataset.test));
  view.querySelectorAll("[data-cert]").forEach(b=>b.onclick=()=>showCert(b.dataset.cert));
}
function levelTest(l){
  const ids=new Set(levelLessons(l).map(x=>x.i)),pool=POOL.filter(c=>ids.has(c.li)&&!c.own);
  const items=pick(pool,15).map((c,k)=>{const same=pool.filter(x=>!!x.ph===!!c.ph);
    return k%2?{q:c.hu,a:c.it,o:distract(c,"it",same),sub:"Hogy mondod "+LG().adv+"?",huQ:true,say:null}:{q:c.it,a:c.hu,o:distract(c,"hu",same),sub:"Mit jelent?",say:c.it};});
  prefetch(...[...ids].map(i=>LESSONS[i].id));QZ_BACK=()=>go("terkep");
  runQuiz({kind:"level",label:`${l} szintzáró teszt`,title:"",items,backLabel:"Térkép",onDone:(ok,n)=>{
    const pct=Math.round(ok/n*100),pass=pct>=80;incEv("tests");
    if(pass){const prev=S.certs[certKey(l)];if(!prev||prev.score<pct)S.certs[certKey(l)]={at:Date.now(),score:pct};addXP(50);confetti();}save();
    view.innerHTML=`<div class="player" style="justify-content:center;align-items:center;text-align:center"><span class="label">${l} szintzáró</span><h1>${pass?"Oklevél megszerezve!":"Most még nem sikerült"}</h1><p class="muted">${ok} / ${n} helyes (${pct}%). ${pass?"":"80% kell az oklevélhez. Ismételd át a szint leckéit, és próbáld újra."}</p><div class="row" style="justify-content:center"><button class="btn ghost" data-go="terkep">Térkép</button>${pass?`<button class="btn" id="tCert">Oklevél</button>`:""}</div></div>`;
    if($("#tCert"))$("#tCert").onclick=()=>showCert(l);}});
}
function certSvg(l,c){
  return `<svg viewBox="0 0 800 560" role="img" aria-label="Parliamo oklevél, ${LG().name} ${l}" style="width:100%;height:auto;display:block"><rect width="800" height="560" rx="24" fill="#FBF8EF"/><rect x="18" y="18" width="764" height="524" rx="16" fill="none" stroke="#1F4FD6" stroke-width="4"/><rect x="30" y="30" width="740" height="500" rx="10" fill="none" stroke="#F2C230" stroke-width="2"/>
  <g transform="translate(368 58) scale(1)">${LOGO.replace('<svg viewBox="0 0 64 64" aria-hidden="true">','<svg width="64" height="64" viewBox="0 0 64 64">')}</g>
  <text x="400" y="170" text-anchor="middle" font-family="Young Serif, Georgia, serif" font-size="44" fill="#14204A">Oklevél</text>
  <text x="400" y="215" text-anchor="middle" font-family="Figtree, system-ui, sans-serif" font-size="18" fill="#5A6788" letter-spacing="3">PARLIAMO · ${esc(LG().name.toUpperCase())} NYELV</text>
  <text x="400" y="320" text-anchor="middle" font-family="Young Serif, Georgia, serif" font-size="110" fill="#1F4FD6">${l}</text>
  <text x="400" y="380" text-anchor="middle" font-family="Figtree, system-ui, sans-serif" font-size="20" fill="#14204A">szintzáró teszt sikeresen teljesítve · ${esc(c.score)}%</text>
  <text x="400" y="470" text-anchor="middle" font-family="Figtree, system-ui, sans-serif" font-size="16" fill="#5A6788">${new Date(c.at).toLocaleDateString("hu-HU",{year:"numeric",month:"long",day:"numeric"})}</text></svg>`;
}
function showCert(l){
  const c=S.certs[certKey(l)];if(!c)return;
  view.innerHTML=`<div class="stack"><div class="row"><button class="btn ghost" data-go="terkep">← Térkép</button></div><div class="card" style="padding:.6rem">${certSvg(l,c)}</div>
    <p class="small muted">Az oklevél a szint leckéiből összeállított tesztet igazolja, nem hivatalos nyelvvizsga.</p>${IS_WEB?`<div><button class="btn soft" id="cPng">Mentés képként</button></div>`:""}</div>`;
  if($("#cPng"))$("#cPng").onclick=()=>{const svg=view.querySelector("svg"),img=new Image(),url=URL.createObjectURL(new Blob([svg.outerHTML.replace("<svg ",'<svg xmlns="http://www.w3.org/2000/svg" ')],{type:"image/svg+xml"}));
    img.onload=()=>{const cv=document.createElement("canvas");cv.width=1600;cv.height=1120;cv.getContext("2d").drawImage(img,0,0,1600,1120);const a=document.createElement("a");a.href=cv.toDataURL("image/png");a.download=`parliamo-oklevel-${lang()}-${l}.png`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);};img.src=url;};
}

