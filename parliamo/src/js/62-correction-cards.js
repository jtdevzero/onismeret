/* ============ CARDS FROM YOUR CORRECTIONS ============ */
/* Corrections from the journal, the speaking examiner and the writing tasks land in the mistake log as "wrong → right – why".
   Here they become card suggestions: the learner checks each one (and may edit it) before it joins the flashcards.
   Dismissed suggestions are remembered so they do not come back. */
const FIX_KINDS=["journal","examiner","mock:writing","exam:write","chat"];
const fixNo=()=>{const o=S.fixno||(S.fixno={});return o[lang()]||(o[lang()]=[]);};
const fixKey=(w,r)=>norm(w)+"→"+norm(r);
function fixCandidates(){
  const own=new Set(ownList().map(w=>norm(w.it))),no=new Set(fixNo()),seen=new Set(),out=[];
  (S.mlog||[]).slice().reverse().forEach(m=>{
    if(m.l!==lang()||!FIX_KINDS.includes(m.k)||!m.q||!m.c)return;
    const [right,...why]=m.c.split(" – "),wrong=m.q.trim(),r=(right||"").trim();
    if(!r||!wrong||norm(r)===norm(wrong)||r.length>90)return;
    const k=fixKey(wrong,r);if(seen.has(k)||no.has(k)||own.has(norm(r)))return;seen.add(k);
    out.push({k,wrong,right:r,why:why.join(" – ").trim(),src:m.k});
  });
  return out.slice(0,30);
}
function fixCard(){
  const c=fixCandidates();if(!c.length)return "";
  return `<div class="card next"><div><h3>Kártyák a javításaidból</h3><p class="small muted">${c.length} javítás vár átnézésre a naplóból, a szóbeliből és az írásfeladatokból. Mentés előtt mindegyiket ellenőrizheted.</p></div><button class="btn soft" id="fixGo">Átnézés</button></div>`;
}
function bindFix(){if($("#fixGo"))$("#fixGo").onclick=openFixReview;}
function openFixReview(){
  const c=fixCandidates(),src={journal:"Napló",examiner:"Szóbeli","mock:writing":"Próbavizsga","exam:write":"Esszé",chat:"Beszélgetés"};
  if(!c.length){toast("Nincs átnézendő javítás.");return go("kartyak");}
  subShell(["Kártyák",()=>go("kartyak")],"Kártyák a javításaidból",`${c.length} javaslat`,`<p class="muted">A kártya elején a hibás változat áll, a hátoldalon a helyes. A helyes alakot kell majd felidézned. Javítsd, ha az AI pontatlan volt, és vedd ki a pipát, ha nem szeretnéd tanulni.</p>
    ${c.map((x,i)=>`<div class="card stack" data-fix="${i}" style="gap:.5rem"><label class="row" style="flex-wrap:nowrap;justify-content:flex-start"><input type="checkbox" data-fsel checked style="width:20px;height:20px;flex:none"><b>${i+1}.</b><span class="pill">${esc(src[x.src]||x.src)}</span></label>
      <p class="small">Hibás: <s ${LA()}>${esc(x.wrong)}</s></p>
      <label class="stack" style="gap:.25rem"><span class="small">Helyesen (ezt tanulod)</span><input data-fit value="${esc(x.right)}" ${LA()}></label>
      ${x.why?`<p class="small muted">${esc(x.why)}</p>`:""}</div>`).join("")}
    <div class="row"><button class="btn lemon" id="fixSave">Kijelöltek mentése</button><button class="btn ghost" id="fixSkip">Kijelöletlenek elvetése</button></div>`);
  const pick=sel=>[...view.querySelectorAll("[data-fix]")].filter(el=>el.querySelector("[data-fsel]").checked===sel).map(el=>({x:c[+el.dataset.fix],it:el.querySelector("[data-fit]").value.trim()}));
  $("#fixSave").onclick=()=>{const ok=pick(true).filter(p=>p.it);let n=0;
    ok.forEach(({x,it})=>{if(ownList().some(w=>norm(w.it)===norm(it)))return;ownList().push({id:`${lang()}-own-${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`,it,hu:"Javítsd: "+x.wrong,alt:[],note:x.why?("Javítás: "+x.why).slice(0,120):"Javítás"});fixNo().push(x.k);n++;});
    pick(false).forEach(({x})=>fixNo().push(x.k));if(fixNo().length>500)fixNo().splice(0,fixNo().length-500);
    save();rebuildOwn();fx("ok");toast(n?n+" javítás-kártya mentve.":"Nem mentettél új kártyát.");go("kartyak");};
  $("#fixSkip").onclick=()=>{pick(false).forEach(({x})=>fixNo().push(x.k));save();toast("A kijelöletlen javaslatokat elvetettem.");openFixReview();};
}
