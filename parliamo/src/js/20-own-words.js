/* ============ OWN WORDS ============ */
const OWN_LI=()=>LESSONS.length;
const ownList=()=>S.own[lang()]||(S.own[lang()]=[]);
function ownCard(){
  return `<div class="card stack" style="gap:.6rem"><div class="row" style="justify-content:space-between"><h3>Saját szavak</h3><span class="small muted">${ownList().length} szó</span></div>
    <p class="small muted">Írj be egy ${LG().adj} vagy magyar szót, kifejezést. Az AI hozzáteszi a fordítást, egy példamondatot és a nyelvtani tudnivalót, és bekerül az ismétlésbe.</p>
    <div class="row" style="flex-wrap:nowrap"><input id="ownIn" autocomplete="off" placeholder="pl. ${lang()==="en"?"to take for granted":lang()==="es"?"merecer la pena":"in bocca al lupo"}" aria-label="Új szó"><button class="btn" id="ownGo">Hozzáadás</button></div>
    <div id="ownOut"></div>
    ${ownList().length?`<details><summary class="small" style="cursor:pointer">Saját szavaim (${ownList().length})</summary><div style="margin-top:.4rem">${ownList().map((w,i)=>`<div class="dict-row">${spkBtn(w.it,"sm")}<div style="min-width:0"><div class="it">${esc(w.it)}</div><div class="small muted">${esc(w.hu)}${w.note?" · "+esc(w.note):""}</div></div><button class="btn ghost" data-del="${i}" style="padding:.35rem .6rem;font-size:.8rem" aria-label="Törlés">Törlés</button></div>`).join("")}</div></details>`:""}</div>`;
}
function bindOwn(){
  const input=$("#ownIn"),button=$("#ownGo"),out=$("#ownOut");
  const go=async()=>{const q=input.value.trim();if(!q||button.disabled)return;
    if(out.request)out.request.cancel("stale");const token=out.token=(out.token||0)+1;
    const job=createAIRequest(()=>out.isConnected&&input.isConnected&&$("#ownIn")===input&&out.token===token&&input.value.trim()===q);out.request=job;button.disabled=true;
    out.innerHTML=aiRequestBusy("Utánanézek…","ownCancelRequest");$("#ownCancelRequest").onclick=()=>job.cancel();
    try{const r=await job.json(`Egy magyar anyanyelvű ${LG().adj} nyelvtanuló fel akarja venni ezt a szót vagy kifejezést a szókártyái közé: "${q}". Lehet ${LG().adj} vagy magyar; ha magyar, add meg a legtermészetesebb ${LG().adj} megfelelőjét.
Csak egy JSON objektumot adj vissza:
{"it":"a ${LG().adj} szó vagy kifejezés szótári alakban${lang()==="en"?" (igéknél to-val)":" (főneveknél névelővel)"}","hu":"rövid magyar jelentés","alt":["elfogadható ${LG().adj} változatok, ha vannak"],"ex":"egy természetes ${LG().adj} példamondat","exhu":"a példamondat magyarul","note":"egy rövid magyar nyelvtani vagy használati megjegyzés (max. 15 szó)"}`,{modelTier:"quick"});
      if(!job.current())return;if(!r||!r.it||!r.hu)throw {code:"invalid_json"};
      out.innerHTML=`<div class="card stack" style="gap:.4rem;background:var(--sunk);border:0"><div class="row" style="flex-wrap:nowrap">${spkBtn(String(r.it),"sm")}<b class="it" style="font-size:1.1rem">${esc(r.it)}</b></div><span>${esc(r.hu)}</span>${r.ex?`<span class="small"><i>${esc(r.ex)}</i> – ${esc(r.exhu||"")}</span>`:""}${r.note?`<span class="small muted">${esc(r.note)}</span>`:""}<div class="row"><button class="btn" id="ownSave">Hozzáadás a kártyákhoz</button><button class="btn ghost" id="ownCancel">Mégse</button></div></div>`;
      $("#ownSave").onclick=()=>{if(job.current())addOwn({it:String(r.it),hu:String(r.hu),alt:Array.isArray(r.alt)?r.alt.map(String):[],ex:String(r.ex||""),exhu:String(r.exhu||""),note:String(r.note||"")});};
      $("#ownCancel").onclick=()=>{out.innerHTML="";};
    }catch(e){if(!job.owns())return;
      if(e&&e.code==="no_ai"){out.innerHTML=`<div class="stack" style="gap:.5rem"><p class="small muted">${aiMissing()} Kézzel is felveheted:</p><input id="ownHu" placeholder="Magyar jelentés" aria-label="Magyar jelentés"><button class="btn soft" id="ownSave">Mentés</button></div>`;
        $("#ownSave").onclick=()=>{if(!job.owns())return;const hu=out.querySelector("#ownHu").value.trim();if(hu)addOwn({it:q,hu});};}
      else out.innerHTML=`<div class="notice">${esc(e&&e.code==="invalid_json"?"Nem sikerült értelmezni a választ. Próbáld újra.":aiRequestMessage(e))}</div>`;
    }finally{if(job.owns())button.disabled=false;}};
  input.oninput=()=>{if(out.request)out.request.cancel("stale");out.token=(out.token||0)+1;button.disabled=false;out.innerHTML="";};
  $("#ownGo").onclick=go;$("#ownIn").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();go();}};
  view.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{const w=ownList().splice(+b.dataset.del,1)[0];if(w){delete S.cards[w.id];delete S.miss[w.id];}save();rebuildOwn();renderCards();});
}
function addOwn(w){
  const item=Object.assign({id:`${lang()}-own-${Date.now().toString(36)}`,alt:[]},w);
  if(ownList().some(x=>norm(x.it)===norm(item.it))){toast("Ez a szó már a kártyáid között van.");return;}
  ownList().push(item);save();rebuildOwn();fx("ok");toast("Hozzáadva. A következő ismétlésben előjön.");renderCards();
}
function rebuildOwn(){
  POOL=POOL.filter(c=>!c.own);
  ownList().forEach(w=>POOL.push({id:w.id,it:w.it,hu:w.hu,alt:w.alt||[],li:OWN_LI(),ph:w.it.trim().split(/\s+/).length>3?1:0,own:1}));
  rebuildCore();
}

