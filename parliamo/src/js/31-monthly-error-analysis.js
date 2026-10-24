/* ============ MONTHLY ERROR ANALYSIS ============ */
const MKIND={lesson:"Leckék",daily:"Napi kör",miss:"Hibakör",speak:"Kiejtés",chat:"AI-beszélgetés",podcast:"Podcast"};
const mkLabel=k=>MKIND[k]||(k.startsWith("drill:")?"Gyakorló: "+((CDRILLS[k.slice(6)]||{}).title||(DRILLS.find(d=>d[0]===k.slice(6))||[0,k.slice(6)])[1]):k.startsWith("exam:")?"Vizsga: "+({mc:"szókitöltés",wf:"szóképzés",kwt:"mondatátalakítás",read:"olvasás",write:"írás"}[k.slice(5)]||k.slice(5)):k.startsWith("pron:")?"Kiejtés: "+k.slice(5):k);
function monthMisses(){const t=today();return (S.mlog||[]).filter(m=>m.l===lang()&&m.d>t-30);}
function analysisCard(){
  const ms=monthMisses(),by={};ms.forEach(m=>{by[m.k]=(by[m.k]||0)+1;});
  const kinds=Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,5),top={};ms.forEach(m=>{const k=m.c;top[k]=(top[k]||0)+1;});
  const rep=S.ai["rep-"+lang()],mul=adaptMul();
  return `<div class="card stack"><div class="row" style="justify-content:space-between"><h3>Havi hibaelemzés</h3><span class="small muted tnum">${ms.length} hiba az elmúlt 30 napban</span></div>
    ${ms.length?`<div class="stack" style="gap:.35rem">${kinds.map(([k,n])=>`<div><div class="row small" style="justify-content:space-between"><span>${esc(mkLabel(k))}</span><span class="tnum">${n}</span></div><div class="meter"><i style="width:${n/kinds[0][1]*100}%"></i></div></div>`).join("")}</div>
    <div class="small"><b>Legtöbbször elrontva:</b> ${Object.entries(top).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([c,n])=>`<span ${LA()}>${esc(c.split(" – ")[0])}</span>${n>1?` (${n}×)`:""}`).join(" · ")}</div>`:`<p class="small muted">Még nincs elég hiba az elemzéshez. Ez jó hír!</p>`}
    ${rep?`<div class="stack" style="gap:.5rem;border-top:1px solid var(--line);padding-top:.7rem"><span class="label">AI-elemzés · ${new Date(rep.at).toLocaleDateString("hu-HU")}</span><p>${esc(rep.summary)}</p>
      ${(rep.patterns||[]).map(p=>`<div><b>${esc(p.title)}</b><p class="small">${esc(p.explain)}</p>${p.examples&&p.examples.length?`<p class="small muted" ${LA()}>${p.examples.map(esc).join(" · ")}</p>`:""}</div>`).join("")}
      ${rep.drill&&rep.drill.length?`<button class="btn lemon" id="aDrill">Személyre szabott gyakorló (${rep.drill.length} feladat)</button>`:""}</div>`:""}
    <div class="row"><button class="btn soft" id="aRun" ${ms.length<5?"disabled":""}>${rep?"Új elemzés":"AI-elemzés készítése"}</button><button class="btn soft" id="aPlan" ${ms.length<5?"disabled":""}>${planOf()&&planOf().post==null?"Új kéthetes terv":"Kéthetes terv készítése"}</button><span class="small muted" id="aMsg" role="status">${ms.length<5?"Legalább 5 hiba kell az elemzéshez.":""}</span></div>
    ${planOf()?planCard():""}
    <p class="small muted" style="border-top:1px solid var(--line);padding-top:.6rem"><b>Ütemezés:</b> cél ${Math.round((S.settings.ret||0.9)*100)}% megtartás · ${Object.keys(S.hard).filter(id=>langOf(id)===lang()).length} nehéznek jelölt kártya · ${mul===1?"az időközök a szokásosak":mul>1?`a vártnál jobban emlékszel, ezért ${Math.round((mul-1)*100)}%-kal ritkábban jönnek a kártyák`:`a vártnál többet felejtesz, ezért ${Math.round((1-mul)*100)}%-kal gyakrabban jönnek a kártyák`}.</p></div>`;
}
function bindAnalysis(){
  if($("#aPlan"))$("#aPlan").onclick=()=>makePlan($("#aPlan"),$("#aMsg"));
  if($("#plGo"))bindPlan(()=>go("stat"));
  if($("#aDrill"))$("#aDrill").onclick=()=>{const rep=S.ai["rep-"+lang()];CDRILLS.mx={title:"Személyre szabott gyakorló",desc:"A saját hibáidból",items:rep.drill};route="gyakorlas";render();startChoice("mx");};
  if($("#aRun"))$("#aRun").onclick=async()=>{const m=$("#aMsg"),sample=await getSample();if(!sample){m.textContent=aiMissing();return;}
    $("#aRun").disabled=true;m.innerHTML=`<span class="thinking"><i></i><i></i><i></i></span> Elemzem a hibáidat…`;
    const ms=monthMisses().slice(-120).map(x=>`[${mkLabel(x.k)}] kérdés: ${x.q} | válasz: ${x.a||"–"} | helyes: ${x.c}`).join("\n");
    const prompt=`${LG().teacher[0].toUpperCase()+LG().teacher.slice(1)}ként elemezd egy magyar anyanyelvű tanuló elmúlt havi hibáit egy ${LG().adj} nyelvtanuló alkalmazásban. A tanuló szintje: ${defLevel()}.
A hibák (kategória, feladat, a tanuló válasza, a helyes válasz):
${ms}

Keresd meg a visszatérő mintákat (nyelvtan, szókincs, tipikus magyar tükörfordítás, kiejtés, helyesírás). Ne egyenként sorold fel a hibákat, hanem csoportosítsd őket.
Készíts hozzá 10 feleletválasztós gyakorló feladatot ${LG().adv}, amelyek pontosan ezeket a gyenge pontokat gyakoroltatják (új mondatokkal, nem a hibák ismétlésével). Minden feladatban egy ___ hely legyen, 3-4 válaszlehetőség, pontosan egy helyes.
Csak egy JSON objektumot adj vissza:
{"summary":"2-3 mondatos összegzés magyarul","patterns":[{"title":"a minta neve magyarul","explain":"magyarázat és szabály magyarul, 1-3 mondat","examples":["1-2 helyes ${LG().adj} példa"]}],"drill":[{"q":"mondat ___ hellyel","a":"helyes válasz","o":["a helyes válasz is benne"],"why":"rövid magyar magyarázat"}]}
A patterns 2–5 elem legyen.`;
    try{const r=await sample.json(prompt,{modelTier:"default"});
      const drill=(Array.isArray(r.drill)?r.drill:[]).filter(d=>d&&typeof d.q==="string"&&d.q.includes("___")&&Array.isArray(d.o)&&d.o.map(String).includes(String(d.a))).map(d=>({q:d.q,a:String(d.a),o:d.o.map(String),why:String(d.why||"")}));
      S.ai["rep-"+lang()]={at:Date.now(),summary:String(r.summary||""),patterns:(Array.isArray(r.patterns)?r.patterns:[]).slice(0,5).map(p=>({title:String(p.title||""),explain:String(p.explain||""),examples:(Array.isArray(p.examples)?p.examples:[]).slice(0,2).map(String)})),drill};
      save();if(route==="stat")renderStats();}
    catch(e){m.textContent=aiErr(e);$("#aRun").disabled=false;}};
}

