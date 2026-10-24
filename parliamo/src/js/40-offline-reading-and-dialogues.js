/* ============ OFFLINE READING AND DIALOGUES ============ */
function offlineReadsHtml(){
  if(!XT.off.reads.length)return "";
  return `<div class="card stack"><span class="label">Kész olvasmányok · AI és net nélkül is</span><div class="drills">${XT.off.reads.map(r=>`<button class="drill" data-or="${r.id}"><b ${LA()}>${esc(r.title)}</b><span class="small muted">${esc(r.hu)} · ${r.level}</span>${(S.readDone||{})[r.id]?`<span class="small"><span class="pill ok">Elolvasva</span></span>`:""}</button>`).join("")}</div></div>`;
}
function openOfflineRead(id){
  const r=XT.off.reads.find(x=>x.id===id);
  const t={title:r.title,hu:r.hu,topic:"Kész olvasmány",level:r.level,paragraphs:r.text.split(/\n\s*\n/),glossary:Object.entries(r.gloss).map(([w,hu])=>({w,base:w,hu})),questions:r.questions,off:r.id};
  S.readDone=S.readDone||{};if(!S.readDone[id]){S.readDone[id]=today();incEv("read");save();}
  showText(t);
}
let DL=null;
function offlineDialogsHtml(){
  if(!XT.off.dialogs.length)return "";
  return `<div class="sec-head"><h2>Kész párbeszédek</h2><span class="small muted">AI és net nélkül is</span></div><div class="lgrid">${XT.off.dialogs.map(d=>`<button class="lcard scard" data-dl="${d.id}">${pic(d.img)}<div class="body"><b ${LA()}>${esc(d.title)}</b><span class="small muted">${esc(d.hu)} · ${d.level}${(S.dlg||{})[d.id]?" · ✓":""}</span></div></button>`).join("")}</div>`;
}
function bindOfflineDialogs(){view.querySelectorAll("[data-dl]").forEach(b=>b.onclick=()=>openDialog(b.dataset.dl));}
function openDialog(id){prefetch("dl-en");DL={d:XT.off.dialogs.find(x=>x.id===id),i:0,ok:0,tries:0,log:[],pick:null};drawDialog();setTimeout(()=>DL&&say(DL.d.turns[0].p),250);}
function drawDialog(){
  const {d,i}=DL,t=d.turns[i],fin=i>=d.turns.length;
  const hist=DL.log.map(x=>`<div class="mrow"><div class="msg ai"><span ${LA()}>${esc(x.p)}</span></div></div><div class="msg me" ${LA()}>${esc(x.me)}</div>`).join("");
  subShell(["AI tanár",()=>go("tanar")],`Kész párbeszéd · ${d.level}`,esc(d.title),`<div class="chat">${hist}${fin?"":`<div class="mrow"><div class="msg ai"><div class="row" style="flex-wrap:nowrap;align-items:flex-start"><span style="flex:1" ${LA()}>${esc(t.p)}</span><button class="icon-btn" style="width:32px;height:32px" data-say="${esc(t.p)}" aria-label="Meghallgatás">${I.spk}</button></div><details><summary class="tr" style="cursor:pointer">Fordítás</summary><div class="tr">${esc(t.phu)}</div></details></div></div>`}</div>
    ${fin?`<div class="card"><h3>Vége a párbeszédnek</h3><p class="muted">${DL.ok} / ${d.turns.length} válasz elsőre is jó volt.</p><div class="row"><button class="btn ghost" id="dlAgain">Újra</button><button class="btn" data-go="tanar">Többi helyzet</button></div></div>`
    :`<span class="label">Mit válaszolsz?</span><div class="opts">${t.opts.map((o,j)=>`<button class="opt ${DL.pick!=null?(o.ok&&DL.pick===j?"right":DL.pick===j?"wrong":""):""}" data-j="${j}" ${LA()} ${DL.pick!=null&&t.opts[DL.pick].ok?"disabled":""}>${esc(o.t)}</button>`).join("")}</div>
      ${DL.pick!=null?`<div class="feedback ${t.opts[DL.pick].ok?"ok":"bad"}" role="status"><b>${t.opts[DL.pick].ok?rnd(LG().ok):"Próbálj másikat."}</b><span class="small" style="color:var(--ink)">${esc(t.opts[DL.pick].fb)}</span></div>${t.opts[DL.pick].ok?`<button class="btn block" id="dlNext">Tovább</button>`:""}`:""}`}`);
  if(fin){$("#dlAgain").onclick=()=>openDialog(d.id);return;}
  view.querySelectorAll("[data-j]").forEach(b=>b.onclick=()=>{const j=+b.dataset.j,o=t.opts[j];DL.pick=j;if(o.ok){if(!DL.tries)DL.ok++;fx("ok");say(o.t);}else{DL.tries++;fx("bad");logMiss("dialog",t.p,o.t,t.opts.find(x=>x.ok).t);}drawDialog();if($("#dlNext"))$("#dlNext").focus();});
  if($("#dlNext"))$("#dlNext").onclick=()=>{DL.log.push({p:t.p,me:t.opts[DL.pick].t});DL.i++;DL.pick=null;DL.tries=0;
    if(DL.i>=d.turns.length){S.dlg=S.dlg||{};if(!S.dlg[d.id])incEv("chat");S.dlg[d.id]={ok:DL.ok,n:d.turns.length,day:today()};addXP(5+DL.ok*2);confetti();}else{const ni=DL.i;setTimeout(()=>DL&&DL.i===ni&&say(d.turns[ni].p),200);}
    drawDialog();};
}

