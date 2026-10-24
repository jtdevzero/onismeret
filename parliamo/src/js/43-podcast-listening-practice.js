/* ============ PODCAST LISTENING PRACTICE: GAP FILL AND DICTATION ============ */
function gapsFor(p){
  if(p._gaps)return p._gaps;
  p._gaps=p.lines.map(l=>{const ws=l.it.split(" ");let best=-1,len=0;ws.forEach((w,i)=>{const c=w.replace(/[^\p{L}']/gu,"");if(i>0&&c.length>len&&c.length>=4){best=i;len=c.length;}});return best;});
  return p._gaps;
}
function drawGap(){
  const {p}=PD,g=gapsFor(p),chk=PD.gapChk;
  const line=(l,k)=>{const ws=l.it.split(" ");return ws.map((w,i)=>{if(i!==g[k])return esc(w);const core=w.replace(/[^\p{L}']/gu,""),tail=w.slice(w.indexOf(core)+core.length),head=w.slice(0,w.indexOf(core));
    const v=(PD.gapV||{})[k]||"",ok=chk&&deacc(norm(v))===deacc(norm(core));
    return `${esc(head)}<input class="gapin ${chk?(ok?"ok":"bad"):""}" data-g="${k}" value="${esc(v)}" size="${Math.max(4,core.length)}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Hiányzó szó, ${k+1}. mondat" ${LA()} ${chk?"readonly":""}>${chk&&!ok?`<b class="fillin">${esc(core)}</b>`:""}${esc(tail)}`;}).join(" ");};
  const n=g.filter(x=>x>=0).length,okN=chk?p.lines.filter((l,k)=>g[k]>=0&&deacc(norm((PD.gapV||{})[k]||""))===deacc(norm(l.it.split(" ")[g[k]].replace(/[^\p{L}']/gu,"")))).length:0;
  subShell(["Podcast",()=>{PD.stage="listen";drawPod();}],`Lyukas szöveg · ${p.level}`,esc(p.title),`<p class="muted">Hallgasd meg a mondatokat (koppints a hangszóróra), és írd be a hiányzó szavakat. A végén ellenőrizd.</p>
    <div class="card stack">${p.lines.map((l,k)=>`<div class="row" style="flex-wrap:nowrap;align-items:flex-start;gap:.6rem">${spkBtn(l.it,"sm")}<p style="margin:0" ${LA()}><b class="small muted">${esc((p.cast[l.s]||{name:l.s}).name)}:</b> ${line(l,k)}</p></div>`).join("")}</div>
    ${chk?`<div class="feedback ${okN>=n*0.8?"ok":"bad"}" role="status"><b>${okN} / ${n} szó helyes</b><span class="small" style="color:var(--ink)">A pirossal jelölt helyeken a helyes szó mellette áll.</span></div><div class="row"><button class="btn ghost" id="gpAgain">Újra</button><button class="btn" id="gpBack">Vissza a podcasthoz</button></div>`:`<button class="btn block lemon" id="gpChk">Ellenőrzés</button>`}`,chk?`${okN} / ${n}`:null);
  view.querySelectorAll(".gapin").forEach(inp=>inp.oninput=()=>{PD.gapV=PD.gapV||{};PD.gapV[inp.dataset.g]=inp.value;});
  if($("#gpChk"))$("#gpChk").onclick=()=>{PD.gapChk=true;const g2=gapsFor(p);let ok=0;p.lines.forEach((l,k)=>{if(g2[k]<0)return;const core=l.it.split(" ")[g2[k]].replace(/[^\p{L}']/gu,""),v=(PD.gapV||{})[k]||"";if(deacc(norm(v))===deacc(norm(core)))ok++;else logMiss("listen",l.it,v,core);});addXP(ok);incEv("listen");fx(ok>=n*0.8?"win":"ok");save();drawGap();};
  if($("#gpAgain"))$("#gpAgain").onclick=()=>{PD.gapChk=false;PD.gapV={};drawGap();};
  if($("#gpBack"))$("#gpBack").onclick=()=>{PD.stage="listen";drawPod();};
}
function drawPodDict(){
  const {p}=PD,i=PD.di||0,l=p.lines[i],res=PD.dres;
  if(!l){const ok=PD.dok||0;PD.stage="listen";PD.di=0;PD.dres=null;PD.dok=0;addXP(ok*2);incEv("listen");save();toast(`Diktálás kész: ${ok} / ${p.lines.length} mondat hibátlan.`);return drawPod();}
  subShell(["Podcast",()=>{PD.stage="listen";PD.dres=null;drawPod();}],`Diktálás · ${i+1}/${p.lines.length}`,esc(p.title),`<div class="card stack" style="align-items:center;text-align:center;padding:1.4rem 1rem"><span class="label">Hallgasd meg, és írd le</span>
      <div class="row" style="justify-content:center"><button class="icon-btn" id="pdPlayL" style="width:60px;height:60px" aria-label="Lejátszás">${I.spk}</button><button class="icon-btn" id="pdSlowL" aria-label="Lassan">${I.slow}</button></div></div>
    <input id="pdIn" ${LA()} autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Írd le, amit hallasz" aria-label="Diktált mondat" ${res?"readonly":""} value="${esc(PD.dv||"")}">
    ${res?`<div class="feedback ${res.ok?"ok":"bad"}" role="status"><b>${res.ok?rnd(LG().ok):"Majdnem."}</b><span class="ans" ${LA()}>${res.words.map(x=>`<span style="color:var(--${x.ok?"ok":"bad"})">${esc(x.w)}</span>`).join(" ")}</span><span class="small" style="color:var(--ink)">${esc(l.hu)}</span></div><button class="btn block" id="pdNextL">Következő mondat</button>`:`<button class="btn block" id="pdChkL">Ellenőrzés</button>`}`,`${PD.dok||0} / ${i}`);
  const play=slow=>PD&&say(l.it,false,slow?0.75:(PD.rate||1));
  $("#pdPlayL").onclick=()=>play(false);$("#pdSlowL").onclick=()=>play(true);
  if(!res)setTimeout(()=>{if(!PD||PD.stage!=="dict")return;play(false);const inp=$("#pdIn");if(inp)inp.focus();},200);
  const chk=()=>{const v=$("#pdIn").value.trim();if(!v)return;PD.dv=v;const d=speechDetail(l.it,[v]);const ok=d.score>=0.999||check(v,[l.it]).ok;PD.dres={ok,words:d.words};if(ok){PD.dok=(PD.dok||0)+1;fx("ok");}else{fx("bad");logMiss("dictation",l.it,v,l.it);}drawPodDict();$("#pdNextL").focus();};
  if($("#pdChkL"))$("#pdChkL").onclick=chk;
  if($("#pdIn")&&!res)$("#pdIn").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();chk();}};
  if($("#pdNextL"))$("#pdNextL").onclick=()=>{PD.di=i+1;PD.dres=null;PD.dv="";drawPodDict();};
}

