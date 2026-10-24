/* ============ PASSPORT STAMPS ============ */
/* Each finished lesson earns a stamp: a round rubber-stamp drawing with the lesson title around the rim. */
const STAMP_COLORS=["#1F4FD6","#C2352B","#1B8053","#8A4FD6","#C77A12","#0E7C86"];
function stampSvg(L,idx,on,day){
  const col=STAMP_COLORS[idx%STAMP_COLORS.length], rot=((idx*37)%24)-12, id="sp"+L.id.replace(/\W/g,"");
  const date=day?new Date(day*864e5).toLocaleDateString("hu-HU",{month:"short",day:"numeric"}):"";
  return `<svg viewBox="0 0 120 120" class="stamp ${on?"on":""}" role="img" aria-label="${esc(L.t)}${on?" – megszerzett pecsét":" – még nincs meg"}" style="--sc:${col};transform:rotate(${on?rot:0}deg)">
    <defs><path id="${id}" d="M60 60 m-43 0 a43 43 0 1 1 86 0 a43 43 0 1 1 -86 0"/></defs>
    <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" stroke-width="3" ${on?"":'stroke-dasharray="4 5"'}/>
    <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" stroke-width="1.6"/>
    <text font-size="10.5" font-weight="700" letter-spacing="1.4" fill="currentColor"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${esc(L.t.toUpperCase().slice(0,26))}</textPath></text>
    <text x="60" y="56" text-anchor="middle" font-size="9" font-weight="700" letter-spacing="1.2" fill="currentColor">${LG().code} · ${L.level}</text>
    <text x="60" y="72" text-anchor="middle" font-size="15" font-weight="700" fill="currentColor" style="font-family:var(--display)">${on?esc(date):idx+1}</text>
  </svg>`;
}
function renderPassport(){
  const got=LESSONS.filter((_,i)=>ls(i)&&ls(i).done).length;
  view.innerHTML=`<div class="stack"><div class="row"><button class="btn ghost" data-go="stat">← Statisztika</button></div>
    <div><span class="label">${LG().name} · ${got} / ${LESSONS.length} pecsét</span><h1>Útlevél</h1><p class="muted">Minden befejezett lecke egy pecsét. Gyűjtsd össze mindet!</p></div>
    <div class="passport">${LESSONS.map((L,i)=>{const s=ls(i);return `<button class="pstamp" data-l="${i}">${stampSvg(L,i,s&&s.done,s&&s.day)}<span class="small ${s&&s.done?"":"muted"}">${esc(L.hu)}</span></button>`;}).join("")}</div></div>`;
  view.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>{route="leckek";render();openLesson(+b.dataset.l);});
  window.scrollTo(0,0);
}

