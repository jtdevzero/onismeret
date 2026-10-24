/* ============ LESSONS ============ */
function renderLessons(){
  const nl=nextLesson();
  view.innerHTML=`<div class="stack"><div><span class="label">${LG().name} · ${LG().range} · ${doneCount()} / ${LESSONS.length} kész</span><h1>Leckék</h1><p class="muted">Minden lecke egy rövid magyarázattal indul, aztán 15–20 feladat következik. Egy befejezett lecke szavai bekerülnek a szókártyáid közé, és pecsétet kapsz az útleveledbe.</p><div class="row" style="margin-top:.6rem"><button class="btn ghost" data-go="terkep">Haladási térkép</button><button class="btn ghost" id="lPlace">Szintfelmérő</button><button class="btn ghost" data-go="utlevel">Útlevél</button></div></div>
  <div class="lgrid">${LESSONS.map((L,i)=>{const s=ls(i);const cls=s&&s.done?"done":i===nl?"cur":"";
    const head=TRACKS&&(i===0||LESSONS[i-1].track!==L.track)?`<h2 style="grid-column:1/-1;margin-top:${i?"1rem":"0"}">${esc(TRACKS[L.track]||L.track)}</h2>`:"";
    return head+`<button class="lcard ${cls}" data-l="${i}"><div class="pic"><img src="img/${L.id}.webp" alt="" loading="lazy" decoding="async" onerror="this.remove()"><span class="num">${s&&s.done?"✓":i+1}</span><span class="badge">${s&&s.done?`<span class="pill ok">${s.best}%</span>`:i===nl?`<span class="pill now">Következő</span>`:`<span class="pill">${L.level}</span>`}</span></div>
      <div class="body"><b>${esc(L.t)}</b><span class="small muted">${esc(L.hu)} · ${L.words.length} szó, ${L.phrases.length} kifejezés</span>${s&&s.done?`<div class="meter"><i style="width:${s.best}%"></i></div>`:""}</div></button>`;}).join("")}</div></div>`;
  view.querySelectorAll("[data-l]").forEach(b=>b.onclick=()=>openLesson(+b.dataset.l));
  $("#lPlace").onclick=()=>startPlacement(false);
}
function openLesson(li){
  const L=LESSONS[li];prefetch(L.id);
  view.innerHTML=`<div class="stack">
  <div class="row"><button class="btn ghost" id="back">← Leckék</button></div>
  <section class="banner slim">${pic(L.id)}<div class="in"><div class="stack" style="gap:.3rem"><span class="label">Lecke ${li+1} / ${LESSONS.length}</span><h1>${esc(L.t)}</h1><p>${esc(L.hu)} · ${L.level} szint · ${L.words.length+L.phrases.length} kifejezés</p></div></div></section>
  <div class="card"><h3 style="margin-bottom:.6rem">Tudnivalók</h3><div class="notes">${L.notes.map(n=>`<p>${n}</p>`).join("")}</div></div>
  <div class="card"><h3 style="margin-bottom:.3rem">Kifejezések</h3><div class="phr">${L.phrases.map(p=>`<div>${spkBtn(p[0])}<div style="min-width:0"><div class="it" ${LA()}>${esc(p[0])}</div><div class="small muted">${esc(p[1])}</div></div></div>`).join("")}</div></div>
  <div class="card"><h3 style="margin-bottom:.3rem">Szavak</h3><div class="wlist">${L.words.map(w=>`<div><button class="icon-btn" style="width:30px;height:30px" data-say="${esc(w[0])}" aria-label="Meghallgatás">${I.spk}</button><span class="it" ${LA()}>${esc(w[0])}</span><span class="small muted">${esc(w[1])}</span></div>`).join("")}</div></div>
  <button class="btn block lemon" id="startL">Gyakorlás indítása</button>
  </div>`;
  $("#back").onclick=()=>renderLessons();
  $("#startL").onclick=()=>startLesson(li);
  window.scrollTo(0,0);
}
function distract(w,key,pool){const ans=w[key];const c=[...new Set(pool.filter(x=>x[key]!==ans).map(x=>x[key]))];const near=shuffle(c).slice(0,3);if(near.length<3){shuffle([...new Set(WORDS.map(x=>x[key]))].filter(x=>x!==ans&&!near.includes(x))).slice(0,3-near.length).forEach(x=>near.push(x));}return shuffle([ans,...near]);}
function tilesFor(it,others){const words=it.replace(/[.?!,]/g,"").split(" ");const extra=shuffle([...new Set(others.flatMap(p=>p.it.replace(/[.?!,]/g,"").split(" ")))].filter(x=>!words.includes(x))).slice(0,2);return shuffle([...words,...extra]).map((w,i)=>({w,i}));}
function startLesson(li){
  const L=LESSONS[li];
  prefetch(L.id);
  const pool=L.words.map(w=>({it:w[0],hu:w[1],alt:w[2],id:w[3]})), ph=L.phrases.map(p=>({it:p[0],hu:p[1],alt:p[2],id:p[3]}));
  const ex=[{t:"match",pairs:pick(pool,4)}];
  pick(pool,3).forEach(w=>ex.push({t:"mc",q:w.it,sub:"Mit jelent?",say:w.it,ans:w.hu,cid:w.id,opts:distract(w,"hu",pool)}));
  pick(pool,2).forEach(w=>ex.push({t:"mc",q:w.hu,sub:"Hogy mondod "+LG().adv+"?",ans:w.it,it:w.it,opts:distract(w,"it",pool)}));
  pick(pool,2).forEach(w=>ex.push({t:"type",q:w.hu,sub:"Írd le "+LG().adv,ans:[w.it,...w.alt],it:w.it,cid:w.id}));
  pick(ph,2).forEach(p=>ex.push({t:"order",q:p.hu,ans:p.it,it:p.it,cid:p.id,tiles:tilesFor(p.it,ph.filter(x=>x!==p))}));
  pick(ph,2).forEach(p=>ex.push({t:"listen",ans:p.it,it:p.it,hu:p.hu,opts:shuffle([p.it,...pick(ph.filter(x=>x.it!==p.it),3).map(x=>x.it)])}));
  pick(ph,1).forEach(p=>ex.push({t:"type",q:p.hu,sub:"Fordítsd le "+LG().adj+"ra",ans:[p.it,...p.alt],it:p.it,cid:p.id}));
  if(L.grammar.length<3)pick(ph,2).forEach(p=>ex.push({t:"mc",q:p.it,sub:"Mit jelent a mondat?",say:p.it,ans:p.hu,opts:distract(p,"hu",ph.length>3?ph:POOL.filter(c=>c.ph))}));
  pick(L.grammar,5).forEach(g=>ex.push(g[2]?{t:"mc",q:g[0],blank:1,sub:"Válaszd ki a helyes alakot",ans:g[1],opts:shuffle(g[2].slice())}:{t:"type",q:g[0],blank:1,sub:"Írd be a helyes alakot",ans:[g[1]]}));
  P={kind:"lesson",li,queue:[ex[0],...shuffle(ex.slice(1))],i:0,ok:0,n:0,xp:0,st:{}};
  renderEx();
}
function renderEx(){
  const e=P.queue[P.i]; P.st={sel:null,picked:[],done:false,mL:null,matched:0,miss:0,t0:Date.now(),heard:null};
  let body="";
  if(e.t==="mc"){body=`<div class="stack"><span class="label">${esc(e.sub)}</span><div class="row" style="flex-wrap:nowrap;align-items:center">${e.say?spkBtn(e.say):""}<div class="q">${e.blank?blankify(e.q):esc(e.q)}</div></div></div>
    <div class="opts">${e.opts.map((o,i)=>`<button class="opt" data-o="${i}" aria-pressed="false"><kbd>${i+1}</kbd>${esc(o)}</button>`).join("")}</div>`;}
  if(e.t==="type"){body=`<div class="stack"><span class="label">${esc(e.sub)}</span><div class="q">${e.blank?blankify(e.q):esc(e.q)}</div></div>
    <input id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Írd ide ${LG().adv}…" aria-label="Válasz">`;}
  if(e.t==="order"){body=`<div class="stack"><span class="label">Rakd össze ${LG().adv}</span><div class="q">${esc(e.q)}</div></div>
    <div class="tiles answer-line" id="line"></div><div class="tiles" id="bank">${e.tiles.map(t=>`<button class="tilebtn" data-t="${t.i}">${esc(t.w)}</button>`).join("")}</div>`;}
  if(e.t==="listen"){body=`<div class="stack"><span class="label">Mit hallasz?</span><div class="listen">${spkBtn(e.ans,"big")}<button class="icon-btn" data-say="${esc(e.ans)}" data-slow aria-label="Lassan">${I.slow}</button></div></div>
    <div class="opts">${e.opts.map((o,i)=>`<button class="opt" data-o="${i}" aria-pressed="false"><kbd>${i+1}</kbd>${esc(o)}</button>`).join("")}</div>`;}
  if(e.t==="match"){const L=shuffle(e.pairs.map((p,i)=>({x:p.it,i}))),R=shuffle(e.pairs.map((p,i)=>({x:p.hu,i})));
    body=`<div class="stack"><span class="label">Párosítsd a szavakat</span><div class="q">Koppints egy ${LG().adj} szóra, majd a jelentésére.</div></div>
    <div class="match"><div class="opts">${L.map(o=>`<button class="opt" data-ml="${o.i}">${esc(o.x)}</button>`).join("")}</div><div class="opts">${R.map(o=>`<button class="opt" data-mr="${o.i}">${esc(o.x)}</button>`).join("")}</div></div>`;}
  if(e.t==="intro"){body=`<div class="stack"><span class="pill now" style="align-self:flex-start">Új ${e.c.ph?"kifejezés":"szó"}</span><div class="card fc" style="min-height:200px"><div class="front">${esc(e.c.it)}</div>${spkBtn(e.c.it)}<div class="back">${esc(e.c.hu)}</div>${e.c.alt&&e.c.alt.length?`<span class="small muted">Így is mondhatod: ${esc(e.c.alt.join(" · "))}</span>`:""}</div><p class="small muted">Hallgasd meg, mondd ki hangosan, és jegyezd meg. Pár feladat múlva rákérdezek.</p></div>`;}
  if(e.t==="dict"){body=`<div class="stack"><span class="label">Írd le, amit hallasz</span><div class="listen">${spkBtn(e.ans[0],"big")}<button class="icon-btn" data-say="${esc(e.ans[0])}" data-slow aria-label="Lassan">${I.slow}</button></div></div>
    <input id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Írd le ${LG().adv}…" aria-label="Válasz">`;}
  if(e.t==="speak"){body=`<div class="stack"><span class="label">Mondd ki hangosan</span><div class="row" style="flex-wrap:nowrap">${spkBtn(e.ans)}<div class="q">${esc(e.ans)}</div></div><p class="small muted">${esc(e.hu||"")}</p></div>
    <div class="stack" style="align-items:center;gap:.6rem"><button class="icon-btn big" id="mic" aria-label="Felvétel indítása"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg></button><span class="small muted" id="heard">Koppints a mikrofonra, és mondd ki a mondatot.</span><button class="btn ghost" id="skipSpeak" style="font-size:.85rem">Most nem tudok beszélni</button></div>`;}
  view.innerHTML=`<div class="player">
    <div class="pbar"><button class="close" id="quit" aria-label="Kilépés">×</button><div class="track"><div class="fill" style="width:${P.i/P.queue.length*100}%"></div></div><span class="small muted tnum">${P.i+1}/${P.queue.length}</span></div>
    ${body}
    <div class="pfoot"><div id="fb"></div><button class="btn block" id="go" ${e.t==="match"?"hidden":""} disabled>Ellenőrzés</button></div>
  </div>`;
  const li=P.li, kind=P.kind; $("#quit").onclick=()=>{P=null;if(kind==="lesson")openLesson(li);else render();};
  const goBtn=$("#go");
  if(e.t==="intro"){goBtn.disabled=false;goBtn.textContent="Megvan, tovább";P.st.done=true;setTimeout(()=>say(e.c.it),250);}
  if(e.t==="dict"){const inp=$("#ans");inp.oninput=()=>goBtn.disabled=!inp.value.trim();setTimeout(()=>{say(e.ans[0]);inp.focus();},250);}
  if(e.t==="speak"){
    $("#mic").onclick=async()=>{const h=$("#heard");h.textContent="Hallgatlak…";$("#mic").disabled=true;
      try{const alts=await listen();P.st.heard=alts;h.textContent="Ezt hallottam: „"+alts[0]+"”";goBtn.disabled=false;}
      catch(err){h.textContent=err==="no-speech"?"Nem hallottam semmit. Próbáld újra.":"A mikrofon nem érhető el. Engedélyezd a böngészőben, vagy hagyd ki.";}
      $("#mic").disabled=false;};
    $("#skipSpeak").onclick=()=>{P.st.done=true;nextEx();};
  }
  if(e.t==="mc"||e.t==="listen"){view.querySelectorAll("[data-o]").forEach(b=>b.onclick=()=>{if(P.st.done)return;view.querySelectorAll("[data-o]").forEach(x=>x.setAttribute("aria-pressed","false"));b.setAttribute("aria-pressed","true");P.st.sel=+b.dataset.o;goBtn.disabled=false;if(e.t==="mc"&&!e.say&&e.it)say(e.opts[P.st.sel]);});}
  if(e.t==="type"){const inp=$("#ans");inp.oninput=()=>goBtn.disabled=!inp.value.trim();setTimeout(()=>inp.focus(),30);}
  if(e.t==="order"){
    const line=$("#line"),bank=$("#bank");
    const draw=()=>{line.innerHTML=P.st.picked.map(i=>`<button class="tilebtn" data-u="${i}">${esc(e.tiles.find(t=>t.i===i).w)}</button>`).join("");
      bank.querySelectorAll("[data-t]").forEach(b=>b.classList.toggle("used",P.st.picked.includes(+b.dataset.t)));goBtn.disabled=!P.st.picked.length;
      line.querySelectorAll("[data-u]").forEach(b=>b.onclick=()=>{if(P.st.done)return;P.st.picked=P.st.picked.filter(x=>x!==+b.dataset.u);draw();});};
    bank.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{if(P.st.done)return;const i=+b.dataset.t;if(!P.st.picked.includes(i)){P.st.picked.push(i);say(e.tiles.find(t=>t.i===i).w);draw();}});
  }
  if(e.t==="listen") setTimeout(()=>say(e.ans),250);
  if(e.t==="match"){
    view.querySelectorAll("[data-ml]").forEach(b=>b.onclick=()=>{view.querySelectorAll("[data-ml]").forEach(x=>x.setAttribute("aria-pressed","false"));b.setAttribute("aria-pressed","true");P.st.mL=+b.dataset.ml;say(e.pairs[P.st.mL].it);});
    view.querySelectorAll("[data-mr]").forEach(b=>b.onclick=()=>{if(P.st.mL===null)return;const l=view.querySelector(`[data-ml="${P.st.mL}"]`);
      if(+b.dataset.mr===P.st.mL){l.classList.add("right","gone");b.classList.add("right","gone");P.st.matched++;P.st.mL=null;
        if(P.st.matched===e.pairs.length){P.st.done=true;const ok=P.st.miss<=1;P.n++;if(ok){P.ok++;P.xp+=2;}showFb(ok,null,ok?"Minden pár a helyén.":"Kész, de "+P.st.miss+" tévesztéssel.");goBtn.hidden=false;goBtn.disabled=false;goBtn.textContent="Tovább";goBtn.focus();}}
      else{P.st.miss++;b.classList.add("wrong");l.classList.add("wrong");setTimeout(()=>{b.classList.remove("wrong");l.classList.remove("wrong");},500);}});
  }
  goBtn.onclick=()=>{if(P.st.done)return nextEx();evaluate();};
}
function showFb(ok,ans,extra){$("#fb").innerHTML=`<div class="feedback ${ok?"ok":"bad"}" role="status"><b>${ok?rnd(LG().ok):"Nem egészen."}</b>${ans?`<span>Helyes válasz: <span class="ans">${esc(ans)}</span></span>`:""}${extra?`<span class="small">${esc(extra)}</span>`:""}</div>`;}
function evaluate(){
  const e=P.queue[P.i];let ok=false,warn=null;
  if(e.t==="mc"||e.t==="listen"){ok=e.opts[P.st.sel]===e.ans;view.querySelectorAll("[data-o]").forEach(b=>{const o=e.opts[+b.dataset.o];if(o===e.ans)b.classList.add("right");else if(+b.dataset.o===P.st.sel)b.classList.add("wrong");});}
  if(e.t==="type"||e.t==="dict"){const r=check($("#ans").value,e.ans);ok=r.ok;warn=r.warn;$("#ans").readOnly=true;}
  if(e.t==="speak"){const sc=speechScore(e.ans,P.st.heard||[]);ok=sc>=0.75;if(ok&&sc<0.95)warn="Majdnem tökéletes. Hallgasd meg még egyszer, és figyelj a kiejtésre.";}
  if(e.t==="order"){const s=P.st.picked.map(i=>e.tiles.find(t=>t.i===i).w).join(" ");ok=norm(s)===norm(e.ans);}
  P.st.done=true;P.n++;
  const fast=(e.t==="type"||e.t==="dict")&&Date.now()-P.st.t0<8000;
  if(e.cid)itemResult(e,ok,warn,fast);fx(ok?"ok":"bad");
  if(!ok){const given=e.t==="mc"||e.t==="listen"?e.opts[P.st.sel]:e.t==="order"?P.st.picked.map(i=>e.tiles.find(t=>t.i===i).w).join(" "):e.t==="speak"?(P.st.heard||[])[0]:($("#ans")||{}).value;logMiss(P.kind,e.q||e.hu||e.it,given,Array.isArray(e.ans)?e.ans[0]:e.ans);}
  if(ok){P.ok++;P.xp+=2;}else if(!e.retry){P.queue.splice(Math.min(P.i+4,P.queue.length),0,easier(e));}
  let extra=warn;if(e.t==="listen"||e.t==="dict")extra=(extra?extra+" ":"")+"Jelentése: "+e.hu;
  showFb(ok,ok?null:(Array.isArray(e.ans)?e.ans[0]:e.ans),extra);
  if(e.blank){const q=view.querySelector(".q");if(q)q.innerHTML=esc(e.q).replace("___",`<b style="color:var(--${ok?"ok":"bad"})">${esc(e.ans)}</b>`);}
  const sp=e.it||(e.blank?e.q.replace(/\s*\(.*?\)\s*$/,"").replace("___",e.ans):null);
  if(sp&&!/^Írd|^Hogy van/.test(e.q))say(sp);
  const g=$("#go");g.textContent="Tovább";g.disabled=false;g.focus();
}
function nextEx(){P.i++;if(P.i>=P.queue.length)return P.kind==="lesson"?finishLesson():finishRound();renderEx();}
function finishLesson(){
  const acc=Math.round(P.ok/P.n*100), prev=ls(P.li), firstTime=!(prev&&prev.done);
  const bonus=acc>=90?10:0, xp=P.xp+bonus;
  S.lessons[LESSONS[P.li].id]={done:true,best:Math.max(acc,prev?prev.best||0:0),day:prev&&prev.day&&!prev.placed?prev.day:today()};
  if(firstTime||(prev&&prev.placed))incEv("lessons");addXP(xp);
  const L=LESSONS[P.li], n=L.words.length+L.phrases.length, li=P.li;P=null;
  view.innerHTML=`<div class="player" style="justify-content:center;text-align:center;align-items:center">
    ${firstTime?`<div class="stamp-new">${stampSvg(L,li,true,today())}</div><span class="label">Új pecsét az útleveledben</span>`:`<span class="label">Lecke ${li+1} kész</span>`}<h1>${LG().fin[acc>=90?0:acc>=70?1:2]}</h1>
    <div class="stats" style="width:100%;max-width:420px;grid-template-columns:repeat(2,minmax(0,1fr))"><div class="card stat"><span class="label">Pontosság</span><b class="tnum">${acc}%</b></div><div class="card stat"><span class="label">Szerzett XP</span><b class="tnum">+${xp}</b></div></div>
    <p class="muted" style="max-width:46ch">${firstTime?`A lecke ${n} szava és kifejezése bekerült a szókártyáid közé. Holnaptól ismétlésre is feljönnek.`:"Az ismétlés segít, hogy a szavak hosszú távon megmaradjanak."}${acc<70?" Érdemes még egyszer végigcsinálni.":""}</p>
    <div class="row" style="justify-content:center"><button class="btn ghost" id="again">Újra</button><button class="btn" id="cont">${nextLesson()!==null?"Következő lecke":"Leckék"}</button></div></div>`;
  confetti();
  $("#again").onclick=()=>startLesson(li);
  $("#cont").onclick=()=>{const n=nextLesson();if(n!==null)openLesson(n);else renderLessons();};
}

