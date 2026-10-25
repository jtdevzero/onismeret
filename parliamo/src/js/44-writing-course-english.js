/* ============ WRITING COURSE (English) ============ */
let WC=null;
function renderWCourse(){
  const mods=XT.writing;
  view.innerHTML=`<div class="stack"><div class="row"><button class="btn ghost" id="wcBack">← Gyakorlás</button></div>
  <div><span class="label">B1–C1 · lépésenként</span><h1>Íráskurzus</h1><p class="muted">Négy szövegtípus a vizsgákról és a munkából. Mindegyiknél megtanulod a felépítést és a fordulatokat, megnézed a mintát, gyakorlod a kötőszavakat, aztán megírod a sajátodat, és az AI részenként javítja.</p></div>
  <div class="drills">${mods.map((m,i)=>{const d=(S.wc||{})[m.id];return `<button class="drill" data-wc="${m.id}"><span class="dico c${i%4+1}">${I.tanar}</span><b ${LA()}>${esc(m.title)}</b><span class="small muted">${esc(m.hu)} · ${m.level}</span>${d?`<span class="small"><span class="pill ${d.score>=12?"ok":""}">${esc(d.score)}/15 pont</span></span>`:""}</button>`;}).join("")}</div></div>`;
  $("#wcBack").onclick=renderPractice;
  view.querySelectorAll("[data-wc]").forEach(b=>b.onclick=()=>{WC={m:mods.find(x=>x.id===b.dataset.wc),tab:"learn",txt:{},res:null};drawWC();});
}
function drawWC(){
  const {m,tab}=WC,tabs=[["learn","Felépítés"],["model","Minta"],["drill","Kötőszavak"],["write","Te jössz"]];
  let body="";
  if(tab==="learn")body=`<div class="card stack"><p>${esc(m.intro)}</p></div>${m.parts.map((p,i)=>`<div class="card stack"><span class="label">${i+1}. ${esc(p.name)}</span><p class="small">${esc(p.tip)}</p><div class="sugg">${p.phrases.map(x=>`<button data-say="${esc(x.replace(/\s*\(.*\)$/,""))}" ${LA()}>${esc(x)}</button>`).join("")}</div></div>`).join("")}`;
  if(tab==="model")body=`<div class="card stack"><span class="label">Mintaszöveg</span><p class="prewrap" ${LA()}>${esc(m.model)}</p></div><p class="small muted">Figyeld meg a részeket és a fordulatokat. A Felépítés fülön koppintva meg is hallgathatod őket.</p>`;
  if(tab==="drill")body=`<div class="card stack"><p>${m.drill.length} feladat a szövegtípus legfontosabb fordulataival és kötőszavaival.</p><button class="btn lemon" id="wcDrill">Indítás</button></div>`;
  if(tab==="write"){const r=WC.res;body=`<div class="card stack"><span class="label">Feladat</span><p ${LA()}>${esc(m.task)}</p></div>
    ${m.parts.map((p,i)=>`<label class="stack" style="gap:.3rem"><span class="label">${i+1}. ${esc(p.name)}</span><span class="small muted">${esc(p.tip)}</span><textarea data-wp="${i}" ${LA()} style="min-height:${i===1?160:90}px" placeholder="${esc(p.phrases[0])}">${esc(WC.txt[i]||"")}</textarea></label>`).join("")}
    <div class="row" style="justify-content:space-between"><span class="small muted tnum" id="wcN">0 szó</span><button class="btn" id="wcSend">Javítást kérek</button></div><div id="wcRes">${r?wcResHtml(r):""}</div>`;}
  subShell(["Íráskurzus",renderWCourse],`${m.hu} · ${m.level}`,`<span ${LA()}>${esc(m.title)}</span>`,`<span class="seg" id="wcTab">${tabs.map(([k,l])=>`<button data-v="${k}" aria-pressed="${tab===k}">${l}</button>`).join("")}</span>${body}`);
  $("#wcTab").querySelectorAll("button").forEach(b=>b.onclick=()=>{if(WC.request)WC.request.cancel("stale");WC.tab=b.dataset.v;drawWC();});
  if($("#wcDrill"))$("#wcDrill").onclick=()=>{const back=()=>{WC.tab="write";drawWC();};QZ_BACK=back;runQuiz({kind:"writing",label:m.hu,title:"Kötőszavak és fordulatok",items:m.drill.map(x=>Object.assign({},x)),backLabel:m.hu,onDone:(ok,n)=>{addXP(ok);toast(`${ok} / ${n} helyes. Jöhet az írás!`);back();}});};
  if(tab==="write"){
    const cnt=()=>{const n=Object.values(WC.txt).join(" ").trim().split(/\s+/).filter(Boolean).length;$("#wcN").textContent=n+" szó";};
    view.querySelectorAll("[data-wp]").forEach(t=>t.oninput=()=>{WC.txt[t.dataset.wp]=t.value;cnt();});cnt();
    $("#wcSend").onclick=sendWC;
  }
}
async function sendWC(){
  const current=WC;if(!current||current.tab!=="write")return;
  const {m}=current,parts=m.parts.map((p,i)=>({name:p.name,text:String(current.txt[i]||"").trim()}));
  if(parts.some(p=>p.text.split(/\s+/).filter(Boolean).length<5)){toast("Mindegyik részbe írj legalább egy-két mondatot.");return;}
  if(current.request)current.request.cancel("stale");const job=createAIRequest(()=>WC===current&&current.tab==="write"&&current.request===job);current.request=job;
  const send=$("#wcSend"),out=$("#wcRes"),inputs=[...view.querySelectorAll("[data-wp]")];send.disabled=true;inputs.forEach(t=>t.readOnly=true);
  out.innerHTML=aiRequestBusy("A tanár részenként javít…","wcCancel");$("#wcCancel").onclick=()=>job.cancel();
  const prompt=`Tapasztalt angoltanárként javítsd egy magyar anyanyelvű tanuló írását. Szövegtípus: ${m.title} (${m.hu}), szint: ${m.level}.
Feladat: ${m.task}
A tanuló a szöveget részenként írta meg:
${parts.map((p,i)=>`[${i+1}. ${p.name}]\n"""${p.text}"""`).join("\n")}

Minden részt értékelj külön 0–5 pontra aszerint, mennyire teljesíti a rész szerepét (felépítés, hangnem, fordulatok, nyelvhelyesség). Minden részhez adj egy rövid magyar megjegyzést és a rész javított változatát (a tanuló stílusát megtartva). Végül egy mondatos összegzés és egy konkrét tipp magyarul.
Csak egy JSON objektumot adj vissza:
{"parts":[{"score":0,"comment":"magyar megjegyzés","corrected":"javított angol szöveg"}],"summary":"összegzés","tip":"tipp"}`;
  try{const r=await job.json(prompt,{modelTier:"default"});if(!job.current())return;
    if(!r||!Array.isArray(r.parts)||r.parts.length!==m.parts.length||r.parts.some(p=>!p||!Number.isFinite(Number(p.score))||Number(p.score)<0||Number(p.score)>5))throw {code:"invalid_json"};
    const score=r.parts.reduce((a,p)=>a+Math.max(0,Math.min(5,+p.score||0)),0);r.score=score;
    current.res=r;S.wc=S.wc||{};const prev=S.wc[m.id];if(!prev||prev.score<score)S.wc[m.id]={score,day:today()};addXP(8);incEv("writing");save();
    if(job.owns()&&out.isConnected)out.innerHTML=wcResHtml(r);}
  catch(e){if(job.owns()&&out.isConnected)out.innerHTML=`<div class="notice">${esc(e&&e.code==="no_ai"?aiMissing():aiRequestMessage(e))}</div>`;}
  finally{if(current.request===job)current.request=null;if(send.isConnected)send.disabled=false;inputs.forEach(t=>{if(t.isConnected)t.readOnly=false;});}
}
function wcResHtml(r){
  const m=WC.m,max=m.parts.length*5;
  return `<div class="stack"><div class="card"><div class="row" style="justify-content:space-between"><h3>${r.score} / ${max} pont</h3><span class="pill ${r.score>=max*0.8?"ok":""}">${Math.round(r.score/max*100)}%</span></div>${r.summary?`<p style="margin-top:.5rem">${esc(r.summary)}</p>`:""}</div>
  ${r.parts.map((p,i)=>`<div class="card stack"><div class="row" style="justify-content:space-between"><b>${i+1}. ${esc(m.parts[i].name)}</b><span class="pill ${(+p.score||0)>=4?"ok":(+p.score||0)<=2?"bad":""}">${esc(p.score)} / 5</span></div><p class="small muted">${esc(p.comment||"")}</p>${p.corrected?`<p class="prewrap" ${LA()}>${esc(p.corrected)}</p>`:""}</div>`).join("")}
  ${r.tip?`<div class="notice"><b>Tipp:</b> ${esc(r.tip)}</div>`:""}</div>`;
}

