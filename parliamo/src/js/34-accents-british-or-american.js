/* ============ ACCENTS: BRITISH OR AMERICAN? ============ */
async function playKey(bundle,key,text,rate){
  const language=lang(),navigation=NAVN;
  const data=await loadBundle(bundle);
  if(language!==lang()||navigation!==NAVN)return;
  if(!data||!data[key])return say(text,false,rate);
  return new Promise(res=>{try{speechSynthesis.cancel();player.pause();player.src=clipUrl(key,data[key]);player.playbackRate=rate||1;player.onended=res;player.onerror=res;player.play().catch(res);}catch(e){res();}});
}
let AC=null;
function startAccent(){if(!XT.acc.length){toast("Az akcentus-gyakorló nem töltődött be.");return;}prefetch("acc-en");AC={ok:0,n:0,q:null,res:null,order:shuffle(XT.acc.map((_,i)=>i)),pos:0};nextAccent();}
function nextAccent(){if(AC.pos>=AC.order.length){AC.order=shuffle(AC.order);AC.pos=0;}const current=AC,it=XT.acc[AC.order[AC.pos++]];AC.q={it,acc:Math.random()<.5?"uk":"us"};AC.res=null;drawAccent();setTimeout(()=>AC===current&&AC.q.it===it&&playKey("acc-en",AC.q.acc+":"+it.it,it.it),250);}
function drawAccent(){
  const {it,acc}=AC.q,res=AC.res,L={uk:"Brit",us:"Amerikai"};
  subShell(["Gyakorlás",renderPractice],"Brit vagy amerikai?","",`<div class="card stack" style="align-items:center;text-align:center;padding:1.6rem 1rem"><span class="label">Hallgasd meg, és tippelj</span><button class="icon-btn" id="acPlay" style="width:64px;height:64px" aria-label="Lejátszás újra">${I.spk}</button>${res?`<div class="big-q" style="font-size:1.35rem" ${LA()}>${esc(it.it)}</div>`:""}</div>
    <div class="opts" style="grid-template-columns:1fr 1fr">${["uk","us"].map(a=>`<button class="opt ${res?(a===acc?"right":a===res.pick?"wrong":""):""}" data-a="${a}" ${res?"disabled":""} style="justify-content:center">${a==="uk"?"🇬🇧":"🇺🇸"} ${L[a]}</button>`).join("")}</div>
    ${res?`<div class="feedback ${res.ok?"ok":"bad"}" role="status"><b>${res.ok?rnd(LG().ok):"Ez "+L[acc].toLowerCase()+" kiejtés volt."}</b><span class="small" style="color:var(--ink)">${esc(it.why)}</span>
      <span class="row"><button class="btn ghost" id="acUk" style="padding:.3rem .7rem">🇬🇧 Brit változat</button><button class="btn ghost" id="acUs" style="padding:.3rem .7rem">🇺🇸 Amerikai változat</button></span></div><button class="btn block" id="acNext">Következő</button>`:""}`,`${AC.ok} / ${AC.n}`);
  $("#acPlay").onclick=()=>playKey("acc-en",acc+":"+it.it,it.it);
  view.querySelectorAll("[data-a]").forEach(b=>b.onclick=()=>{if(AC.res)return;const ok=b.dataset.a===acc;AC.res={ok,pick:b.dataset.a};AC.n++;if(ok){AC.ok++;addXP(1);fx("ok");}else{fx("bad");save();}drillStat("acc",ok);drawAccent();$("#acNext").focus();});
  if(res){$("#acUk").onclick=()=>playKey("acc-en","uk:"+it.it,it.it);$("#acUs").onclick=()=>playKey("acc-en","us:"+it.it,it.it);$("#acNext").onclick=nextAccent;}
}

