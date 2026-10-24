/* ============ SHELL ============ */
let route="ma", P=null, CS=null, D=null;
function navHtml(){return ROUTES.map(([k,l])=>`<button data-go="${k}" ${route===k?'aria-current="page"':""}>${I[k]}<span>${l}</span></button>`).join("");}
function renderChips(){
  const st=streak();
  $("#chips").innerHTML=`<button class="chip langsw" id="langBtn" aria-haspopup="menu" aria-label="Tanult nyelv: ${LG().name}. Váltás">${flag(lang())}<b>${LG().code}</b><svg viewBox="0 0 24 24" aria-hidden="true" style="width:12px;height:12px"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg></button><span class="chip streak" title="Napok sorozatban">${I.fire}<span class="tnum">${st}</span></span><span class="chip" title="Összes XP">${I.star}<span class="tnum">${S.xp}</span></span>`;
}
/* Small flag-like colour marks, drawn so no external images or emoji are needed. */
function flag(l){
  const c={en:["#012169","#FFFFFF","#C8102E"],it:["#009246","#F1F2F1","#CE2B37"],es:["#AA151B","#F1BF00","#AA151B"]}[l];
  return l==="en"?`<svg class="flag" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="${c[0]}"/><path d="M0 0l30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0l30 20M30 0L0 20" stroke="${c[2]}" stroke-width="1.6"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6"/><path d="M15 0v20M0 10h30" stroke="${c[2]}" stroke-width="3.4"/></svg>`
   :l==="es"?`<svg class="flag" viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="${c[0]}"/><rect y="5" width="30" height="10" fill="${c[1]}"/></svg>`
   :`<svg class="flag" viewBox="0 0 30 20" aria-hidden="true"><rect width="10" height="20" fill="${c[0]}"/><rect x="10" width="10" height="20" fill="${c[1]}"/><rect x="20" width="10" height="20" fill="${c[2]}"/></svg>`;
}
function openLangMenu(){
  let m=$("#langMenu");if(m){m.remove();return;}
  m=document.createElement("div");m.id="langMenu";m.className="langmenu";m.setAttribute("role","menu");
  m.innerHTML=Object.entries(LANGS).map(([k,L])=>{const done=Object.keys(S.lessons).filter(id=>langOf(id)===k).length;
    return `<button role="menuitemradio" aria-checked="${k===lang()}" data-lang="${k}">${flag(k)}<span><b>${L.name}</b><span class="small muted">${L.nat} · ${L.range}${done?` · ${done} lecke kész`:""}</span></span>${k===lang()?'<span class="pill now">Most</span>':""}</button>`;}).join("");
  document.body.appendChild(m);
  const r=$("#langBtn").getBoundingClientRect();m.style.top=(r.bottom+8)+"px";m.style.right=Math.max(12,innerWidth-r.right)+"px";
  m.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>{m.remove();if(b.dataset.lang!==lang())switchLang(b.dataset.lang);});
  setTimeout(()=>document.addEventListener("click",function off(e){if(!e.target.closest("#langMenu,#langBtn")){m.remove();document.removeEventListener("click",off);}}),0);
}
async function switchLang(to){
  S.settings.lang=to;save();
  P=null;CS=null;D=null;ST=null;T={tab:"chat",sc:null,msgs:[],level:null,busy:false,wPrompt:null,wRes:null,wText:""};
  view.innerHTML=`<div class="card row"><span class="thinking"><i></i><i></i><i></i></span><span class="muted">${LG().name} tananyag betöltése…</span></div>`;
  try{await loadCourse();}catch(e){view.innerHTML=`<div class="notice">Nem sikerült betölteni a tananyagot. Töltsd újra az oldalt.</div>`;return;}
  toast(LG().name+" tananyag");render();
}
document.addEventListener("click",e=>{if(e.target.closest("#langBtn"))openLangMenu();});
window.addEventListener("hashchange",()=>{const h=(location.hash||"").slice(1);if(S.onboarded&&LESSONS.length)quickAction(h);});
function go(r){route=r;P=null;CS=null;D=null;ST=null;PL=null;stopViews();try{history.replaceState(null,"","#"+r);}catch(e){}render();window.scrollTo(0,0);try{view.focus({preventScroll:true});}catch(e){}}
function render(){
  $("#nav").innerHTML=navHtml();$("#bnav").innerHTML=navHtml();renderChips();
  const rt=(ROUTES.find(x=>x[0]===route)||[0,{stat:"Statisztika",utlevel:"Útlevél",terkep:"Térkép",ellenorzes:"Eszközellenőrzés"}[route]||"Ma"])[1];document.title="Parliamo · "+rt;document.documentElement.lang="hu";
  ({ma:renderHome,leckek:renderLessons,kartyak:renderCards,gyakorlas:renderPractice,nyelvtan:renderGrammar,tanar:renderTutor,stat:renderStats,utlevel:renderPassport,terkep:renderMap,ellenorzes:renderCheck}[route]||renderHome)();
}

