/* ============ HANDS-FREE CONVERSATION ============ */
async function handsListen(manual){
  const session=T,scenario=session.sc,navigation=NAVN,language=lang();
  if(!scenario||session.busy||session.summaryBusy||session.listening||route!=="tanar")return;
  const token=session.listenToken=(session.listenToken||0)+1;
  const current=()=>T===session&&session.sc===scenario&&session.listenToken===token&&NAVN===navigation&&lang()===language&&route==="tanar";
  session.listening=true;session.listeningNav=navigation;if($("#chat"))drawChat();
  try{const alts=await listen();if(!current())return;session.listening=false;const v=String(alts[0]||"").trim();if(v)sendChat(v);else if($("#chat"))drawChat();}
  catch(error){if(!current())return;session.listening=false;if(error!=="no-speech"||manual)toast(micMsg(error));if(error!=="no-speech")session.hands=false;if($("#chat"))drawChat();}
}
function handsNext(){
  const session=T,scenario=session.sc,navigation=NAVN,language=lang();
  if(session.hands&&scenario&&!session.busy&&route==="tanar")setTimeout(()=>{if(T===session&&T.sc===scenario&&NAVN===navigation&&lang()===language)handsListen(false);},300);
}
function sumHtml(r){
  const fx=Array.isArray(r.fixes)?r.fixes:[];
  return `<div class="card stack"><div class="row" style="justify-content:space-between"><h3>A beszélgetés értékelése</h3><span class="pill ${(+r.score||0)>=7?"ok":""}">${esc(r.score)} / 10 · ${esc(r.level||"")}</span></div>
    <p>${esc(r.summary||"")}</p>${Array.isArray(r.good)&&r.good.length?`<div><b>Ami jól ment</b><ul>${r.good.map(g=>`<li>${esc(g)}</li>`).join("")}</ul></div>`:""}
    ${fx.length?`<div><b>Ezeken dolgozz</b><div class="err-list">${fx.map(e=>`<div><s>${esc(e.wrong)}</s> → <ins ${LA()}>${esc(e.right)}</ins><div class="small muted">${esc(e.why)}</div></div>`).join("")}</div></div>`:""}
    ${r.next?`<div class="notice"><b>Következő lépés:</b> ${esc(r.next)}</div>`:""}</div>`;
}
async function chatSummary(){
  const session=T,scenario=session.sc;if(!scenario||session.busy||session.summaryBusy)return;
  const token=session.summaryToken=(session.summaryToken||0)+1,chatToken=session.chatToken;
  const job=createAIRequest(()=>T===session&&session.sc===scenario&&session.summaryToken===token&&session.chatToken===chatToken&&session.tab==="chat");
  session.summaryRequest=job;session.summaryBusy=true;session.sumError=null;drawChat();
  const hist=session.msgs.map(m=>(m.r==="me"?"Tanuló: ":"Partner: ")+m.it+(m.fix?`  [javítás: ${m.fix}]`:"")).join("\n");
  const prompt=`${LG().teacher[0].toUpperCase()+LG().teacher.slice(1)}ként értékeld egy magyar anyanyelvű tanuló ${LG().adv} folytatott beszélgetését (helyzet: ${scenario.t}; célszint: ${session.level}).
A beszélgetés:
${hist}

Csak egy JSON objektumot adj vissza:
{"score":1-től 10-ig egész szám a célszinthez mérve,"level":"becsült szint (A1–C2)","summary":"2-3 mondat magyarul","good":["legfeljebb 3 konkrét erősség magyarul"],"fixes":[{"wrong":"a tanuló hibás mondatrésze","right":"helyesen","why":"rövid magyar magyarázat"}],"next":"egy konkrét tipp magyarul a következő beszélgetéshez"}
A fixes legfeljebb 6 elem legyen, a visszatérő hibákkal kezdve.`;
  try{const r=await job.json(prompt,{modelTier:"default"});if(!job.current())return;
    if(!r||typeof r.summary!=="string")throw {code:"invalid_json"};
    session.sum=r;session.summaryBusy=false;session.summaryRequest=null;addXP(3);skillLog("speak",session.level,(+r.score||0)*10,"chat");save();
    if($("#chat"))drawChat();const el=$("#csum");if(el)el.scrollIntoView({block:"start",behavior:"smooth"});}
  catch(error){if(!job.owns())return;session.summaryBusy=false;session.summaryRequest=null;session.sumError=error;if($("#chat"))drawChat();}
}
