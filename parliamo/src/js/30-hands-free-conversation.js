/* ============ HANDS-FREE CONVERSATION ============ */
async function handsListen(manual){
  if(!T.sc||T.busy||T.listening||route!=="tanar")return;
  T.listening=true;if($("#chat"))drawChat();
  try{const alts=await listen();T.listening=false;const v=String(alts[0]||"").trim();if(v)sendChat(v);else if($("#chat"))drawChat();}
  catch(e){T.listening=false;if(e!=="no-speech"||manual)toast(micMsg(e));if(e!=="no-speech")T.hands=false;if($("#chat"))drawChat();}
}
function handsNext(){if(T.hands&&T.sc&&!T.busy&&route==="tanar")setTimeout(()=>handsListen(false),300);}
function sumHtml(r){
  const fx=Array.isArray(r.fixes)?r.fixes:[];
  return `<div class="card stack"><div class="row" style="justify-content:space-between"><h3>A beszélgetés értékelése</h3><span class="pill ${(+r.score||0)>=7?"ok":""}">${esc(r.score)} / 10 · ${esc(r.level||"")}</span></div>
    <p>${esc(r.summary||"")}</p>${Array.isArray(r.good)&&r.good.length?`<div><b>Ami jól ment</b><ul>${r.good.map(g=>`<li>${esc(g)}</li>`).join("")}</ul></div>`:""}
    ${fx.length?`<div><b>Ezeken dolgozz</b><div class="err-list">${fx.map(e=>`<div><s>${esc(e.wrong)}</s> → <ins ${LA()}>${esc(e.right)}</ins><div class="small muted">${esc(e.why)}</div></div>`).join("")}</div></div>`:""}
    ${r.next?`<div class="notice"><b>Következő lépés:</b> ${esc(r.next)}</div>`:""}</div>`;
}
async function chatSummary(){
  const sample=await getSample();if(!sample){toast(aiMissing());return;}
  const b=$("#cSum");if(b){b.disabled=true;b.textContent="Értékelem…";}
  const hist=T.msgs.map(m=>(m.r==="me"?"Tanuló: ":"Partner: ")+m.it+(m.fix?`  [javítás: ${m.fix}]`:"")).join("\n");
  const prompt=`${LG().teacher[0].toUpperCase()+LG().teacher.slice(1)}ként értékeld egy magyar anyanyelvű tanuló ${LG().adv} folytatott beszélgetését (helyzet: ${T.sc.t}; célszint: ${T.level}).
A beszélgetés:
${hist}

Csak egy JSON objektumot adj vissza:
{"score":1-től 10-ig egész szám a célszinthez mérve,"level":"becsült szint (A1–C2)","summary":"2-3 mondat magyarul","good":["legfeljebb 3 konkrét erősség magyarul"],"fixes":[{"wrong":"a tanuló hibás mondatrésze","right":"helyesen","why":"rövid magyar magyarázat"}],"next":"egy konkrét tipp magyarul a következő beszélgetéshez"}
A fixes legfeljebb 6 elem legyen, a visszatérő hibákkal kezdve.`;
  try{const r=await sample.json(prompt,{modelTier:"default"});T.sum=r;addXP(3);skillLog("speak",T.level,(+r.score||0)*10,"chat");save();if($("#chat"))drawChat();const el=$("#csum");if(el)el.scrollIntoView({block:"start",behavior:"smooth"});}
  catch(e){toast(aiErr(e));if(b){b.disabled=false;b.textContent="Értékelés";}}
}

