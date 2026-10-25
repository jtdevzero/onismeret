/* ============ STORIES ============ */
function renderStories(){
  D=null;
  view.innerHTML=`<div class="stack"><div class="row"><button class="btn ghost" id="sBack">← Gyakorlás</button></div>
  <div><span class="label">Hangos párbeszédek</span><h1>Történetek</h1><p class="muted">Rövid jelenetek két hanggal. Hallgasd meg mondatonként, koppints a mondatra a fordításért, és válaszolj a közbeékelt kérdésekre.</p></div>
  <div class="lgrid">${STORIES.map(st=>{const done=S.stories[st.id];const li=LESSONS.findIndex(l=>l.id===st.unlock);const ready=li<0||(ls(li)&&ls(li).done);
    return `<button class="lcard scard ${done?"done":""}" data-st="${st.id}">${pic(st.img||st.unlock)}<div class="body"><b>${esc(st.title)}</b><span class="small muted">${esc(st.hu)}</span><span class="row" style="gap:.35rem;margin-top:.3rem"><span class="pill">${st.level}</span>${done?`<span class="pill ok">Kész · ${esc(done.score)}</span>`:ready?"":`<span class="pill">a ${li+1}. lecke után ajánlott</span>`}</span></div></button>`;}).join("")}</div></div>`;
  $("#sBack").onclick=()=>renderPractice();
  view.querySelectorAll("[data-st]").forEach(b=>b.onclick=()=>playStory(b.dataset.st));
  window.scrollTo(0,0);
}
let ST=null;
function playStory(id){const st=STORIES.find(x=>x.id===id);prefetch("st-"+id);playStoryObj(st);}
function playStoryObj(st){
  const order=Object.keys(st.cast).filter(k=>k!=="N");
  ST={st,i:0,ok:0,nq:0,ans:{},order};
  drawStory();
}
function drawStory(){
  const {st,i}=ST, lines=st.lines.slice(0,i+1), cur=st.lines[i], last=i>=st.lines.length-1;
  const qOpen=cur&&cur.q&&ST.ans[i]===undefined;
  view.innerHTML=`<div class="player" style="max-width:680px">
    <div class="pbar"><button class="close" id="quit" aria-label="Kilépés">×</button><div class="track"><div class="fill" style="width:${(i+1)/st.lines.length*100}%"></div></div><span class="small muted tnum">${i+1}/${st.lines.length}</span></div>
    <div class="chat-head" style="min-height:120px">${pic(st.img||st.unlock)}<div class="in"><div><span class="label" style="color:rgba(255,255,255,.8)">${st.level}</span><h3>${esc(st.title)}</h3><p class="small">${esc(st.hu)}</p></div></div></div>
    <div class="chat" id="story">${lines.map((l,k)=>{
      if(l.q){const a=ST.ans[k];return `<div class="card stack" style="gap:.6rem"><span class="label">Kérdés</span><b>${esc(l.q)}</b><div class="opts">${l.o.map((o,j)=>`<button class="opt ${a!==undefined?(j===l.a?"right":j===a?"wrong":""):""}" data-q="${j}" ${a!==undefined?"disabled":""}>${esc(o)}</button>`).join("")}</div></div>`;}
      const who=st.cast[l.s]||{name:""};
      if(l.s==="N")return `<button class="msg" data-tr="${k}" style="align-self:center;max-width:92%;background:transparent;border:0;text-align:center;font-style:italic;color:var(--muted)"><span ${LA()}>${wrapW(l.it)}</span><span class="tr" hidden>${esc(l.hu)}</span></button>`;
      const right=ST.order.indexOf(l.s)===1;
      return `<button class="msg ${right?"me":"ai"}" data-tr="${k}" style="text-align:left;${right?"":"border:1px solid var(--line)"}"><span class="small" style="font-weight:700;opacity:.8">${esc(who.name)}</span><span ${LA()}>${wrapW(l.it)}</span><span class="tr" hidden style="${right?"color:inherit;opacity:.8":""}">${esc(l.hu)}</span></button>`;}).join("")}</div>
    <div class="pfoot"><div class="row" style="justify-content:space-between"><span class="small muted">Koppints egy mondatra a fordításért.</span>${cur&&cur.it?`<button class="btn ghost" id="again">${I.spk.replace("<svg",'<svg style="width:18px;height:18px"')} Újra</button>`:""}</div>
    <button class="btn block ${last&&!qOpen?"lemon":""}" id="next" ${qOpen?"disabled":""}>${last?"Befejezés":"Tovább"}</button></div></div>`;
  $("#quit").onclick=()=>{ST=null;renderStories();};
  view.querySelectorAll("[data-tr]").forEach(b=>b.onclick=()=>{const t=b.querySelector(".tr");t.hidden=!t.hidden;});
  bindWords(st.lines.filter(l=>l.it).map(l=>l.it),[]);
  view.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{const j=+b.dataset.q;ST.ans[i]=j;ST.nq++;if(j===cur.a)ST.ok++;drawStory();});
  if($("#again"))$("#again").onclick=()=>say(cur.it);
  $("#next").onclick=()=>{if(last)return finishStory();ST.i++;drawStory();const l=ST.st.lines[ST.i];if(l.it)say(l.it);};
  const box=$("#story");if(box&&box.lastElementChild)box.lastElementChild.scrollIntoView({block:"nearest",behavior:"smooth"});
}
function finishStory(){
  const {st,ok,nq}=ST;ST=null;const xp=10+ok*2;
  if(!S.stories[st.id])incEv("stories");S.stories[st.id]={done:true,score:ok+"/"+nq,day:today()};addXP(xp);confetti();
  view.innerHTML=`<div class="player" style="justify-content:center;align-items:center;text-align:center"><span class="label">${esc(st.title)}</span><h1>${rnd(LG().ok)}</h1><p class="muted">${ok} / ${nq} kérdésre válaszoltál helyesen. +${xp} XP</p><div class="row" style="justify-content:center"><button class="btn ghost" id="sAgain">Újra</button><button class="btn" id="sList">Többi történet</button></div></div>`;
  $("#sAgain").onclick=()=>playStory(st.id);$("#sList").onclick=renderStories;
}
document.addEventListener("keydown",e=>{if(ST&&!e.target.matches("input,textarea")&&(e.key===" "||e.key==="Enter")){const n=$("#next");if(n&&!n.disabled){e.preventDefault();n.click();}}});
