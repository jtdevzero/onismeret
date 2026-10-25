/* ============ SENTENCE BUILDER (speak the translation) ============ */
let SB=null;
function startBuild(){
  const u=new Set(unlocked().filter(li=>li<LESSONS.length)),pool=POOL.filter(c=>c.ph&&u.has(c.li));
  const src=(pool.length>=5?pool:POOL.filter(c=>c.ph&&c.li<6));
  SB={pool:shuffle(src.slice()),pos:0,ok:0,n:0,c:null,res:null,busy:false};nextBuild();
}
function nextBuild(){if(!SB)return;if(SB.request)SB.request.cancel("stale");if(SB.pos>=SB.pool.length){SB.pool=shuffle(SB.pool);SB.pos=0;}SB.c=SB.pool[SB.pos++];SB.res=null;SB.error=null;SB.draft="";SB.busy=false;drawBuild();}
function drawBuild(){
  if(!SB)return;const session=SB,c=session.c,res=session.res,sp=canSpeak();
  subShell(["Gyakorlás",renderPractice],"Mondatépítő",`Mondd ${LG().adv}!`,`<div class="card stack" style="padding:1.4rem 1.1rem"><span class="label">Magyarul</span><div class="big-q" style="font-size:1.5rem">${esc(c.hu)}</div></div>
    ${res?"":`<div class="row" style="flex-wrap:nowrap">${sp?`<button class="btn lemon" id="sbMic" ${SB.busy?"disabled":""}>${I.mic.replace("<svg",'<svg style="width:18px;height:18px"')} Mondom</button>`:""}<input id="sbIn" ${LA()} value="${esc(session.draft||"")}" autocomplete="off" placeholder="${sp?"…vagy gépeld be":"Írd be "+LG().adv}" aria-label="A mondat ${LG().adv}" ${SB.busy?"disabled":""}><button class="btn" id="sbGo" ${SB.busy?"disabled":""}>Kész</button></div>`}
    ${SB.busy?aiRequestBusy("A tanár ellenőrzi…","sbCancel"):session.error?`<div class="notice">${esc(aiRequestMessage(session.error))}</div>`:""}
    ${res?`<div class="feedback ${res.ok?"ok":"bad"}" role="status"><b>${res.ok?rnd(LG().ok):"Majdnem."}</b><span class="small" style="color:var(--ink)">Te: „${esc(res.said)}”</span>${res.fix&&!res.ok?`<span>Javítva: <span class="ans" ${LA()}>${esc(res.fix)}</span></span>`:""}${res.why?`<span class="small" style="color:var(--ink)">${esc(res.why)}</span>`:""}<span class="row" style="gap:.4rem">${spkBtn(c.it,"sm")}<span ${LA()}>${esc(c.it)}</span></span></div><button class="btn block" id="sbNext">Következő mondat</button>`:""}
    <p class="small muted">A szóbeli vizsgák fordítós feladatára készít fel: gyorsan, hangosan, a tanult kifejezésekből.</p>`,`${SB.ok} / ${SB.n}`);
  if(res){$("#sbNext").onclick=nextBuild;$("#sbNext").focus();return;}
  const inp=$("#sbIn");if(inp&&!SB.busy)setTimeout(()=>inp.focus(),30);
  const go=v=>{v=String(v||"").trim();if(SB===session&&session.c===c&&v)judgeBuild(v);};if(inp)inp.oninput=()=>session.draft=inp.value;
  if($("#sbGo"))$("#sbGo").onclick=()=>go(inp.value);if(inp)inp.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();go(inp.value);}};
  if($("#sbCancel"))$("#sbCancel").onclick=()=>session.request&&session.request.cancel();
  if($("#sbMic"))$("#sbMic").onclick=async()=>{const m=$("#sbMic"),l=lang(),nav=NAVN;m.disabled=true;m.textContent="Hallgatlak…";try{const alts=await listen();if(SB!==session||session.c!==c||lang()!==l||NAVN!==nav)return;const best=alts.reduce((a,b)=>speechScore(c.it,[b])>speechScore(c.it,[a])?b:a,alts[0]);session.draft=best;go(best);}catch(e){if(SB===session&&session.c===c&&lang()===l&&NAVN===nav){toast(micMsg(e));drawBuild();}}};
}
async function judgeBuild(said){
  const session=SB;if(!session||session.busy)return;
  const c=session.c,l=lang(),nav=NAVN,current=()=>SB===session&&session.c===c&&lang()===l&&NAVN===nav;
  const local=Math.max(speechScore(c.it,[said]),check(said,[c.it,...(c.alt||[])],{type:"translation"}).ok?1:0);
  const finish=r=>{if(!current())return;session.busy=false;session.request=null;session.error=null;session.res=Object.assign({said},r);session.n++;if(r.ok){session.ok++;addXP(3);fx("ok");}else{fx("bad");logMiss("build",c.hu,said,c.it);save();}incEv("build");drillStat("build",r.ok);drawBuild();};
  if(local>=0.95)return finish({ok:true});
  const job=createAIRequest(current);session.request=job;session.busy=true;session.draft=said;session.error=null;drawBuild();
  try{const r=await job.json(`Egy magyar tanuló ${LG().adv} mondta el ezt a magyar mondatot: "${c.hu}".
A tanuló válasza (beszédfelismerésből, ezért a központozás és a kis-nagybetű nem számít): "${said}"
Egy elfogadható mintamegoldás: "${c.it}"
Döntsd el, hogy a válasz helyes és természetes-e (más szórend vagy szinonima is lehet helyes). Ha nem, add meg a legkisebb javítást.
Csak JSON: {"ok":true vagy false,"fix":"a javított mondat ${LG().adv}, vagy üres, ha helyes","why":"egy rövid magyar magyarázat"}`,{modelTier:"quick"});
    if(job.current())finish({ok:!!r.ok,fix:String(r.fix||""),why:String(r.why||"")});}
  catch(e){if(!job.owns())return;if(e&&e.code==="no_ai")return finish({ok:local>=0.8,why:local>=0.8?"A mondatod közel áll a mintához.":"A mintamondat lent hallható. Mondd el még egyszer hangosan."});session.busy=false;session.request=null;session.error=e;drawBuild();}
}

