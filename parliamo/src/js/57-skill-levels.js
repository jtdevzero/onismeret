/* ============ SKILL LEVELS ============ */
/* A separate level estimate for reading, listening, writing and speaking. Every scored task logs its level and result;
   the estimate is a recency-weighted average of the last eight results on a continuous A1–C2 scale. */
const SKILLS=[["read","Olvasás","Vizsgaolvasás, próbavizsga, folytatásos történetek"],["listen","Hallás utáni értés","Podcastok, folytatásos történetek, próbavizsga"],["write","Írás","Napló, esszé, próbavizsga"],["speak","Beszéd","Szóbeli vizsgáztató, AI-beszélgetés értékelése"]];
const CEFR=["A1","A2","B1","B2","C1","C2"];
function skillLog(k,lv,pct,src){
  const i=CEFR.indexOf(String(lv||"").toUpperCase().slice(0,2));if(i<0||!isFinite(pct))return;
  S.sk=S.sk||{};const a=S.sk[k]||(S.sk[k]=[]);a.push({at:Date.now(),l:lang(),lv:CEFR[i],p:Math.round(Math.max(0,Math.min(100,pct))),src:String(src||"")});
  if(a.length>40)a.splice(0,a.length-40);
}
/* 60% on a task of a level puts you in the middle of that level, 100% at its top, 0% a level below. */
const skillX=e=>{const i=CEFR.indexOf(e.lv);return Math.max(0,Math.min(5.99,e.p>=60?i+0.5+(e.p-60)/80:i-1+e.p/60*1.5));};
function skillEst(k){
  const a=((S.sk||{})[k]||[]).filter(e=>e.l===lang()).slice(-8);if(!a.length)return null;
  let w=0,x=0;a.forEach((e,j)=>{x+=skillX(e)*(j+1);w+=j+1;});x/=w;
  return {x,lv:CEFR[Math.floor(x)],frac:x-Math.floor(x),n:((S.sk||{})[k]||[]).filter(e=>e.l===lang()).length};
}
function skillsCard(){
  const est=SKILLS.map(([k])=>skillEst(k)),have=est.filter(Boolean);
  const weak=have.length>1?SKILLS[est.indexOf(have.reduce((m,e)=>e.x<m.x?e:m))]:null;
  return `<div class="card stack"><div class="row" style="justify-content:space-between"><h3>Készségszintek</h3><span class="small muted">A1–C2</span></div>
    <p class="small muted">Külön becslés a négy készségre, a legutóbbi pontozott feladataid alapján.</p>
    ${SKILLS.map(([k,l,src],i)=>{const e=est[i];return `<div><div class="row" style="justify-content:space-between"><b>${l}</b>${e?`<span class="pill ${e.x>=3?"ok":""}">${e.lv}${e.frac>=0.66?"+":e.frac<0.33?"−":""}</span>`:'<span class="pill">nincs adat</span>'}</div>
      <div class="meter" role="img" aria-label="${l}: ${e?e.lv:"nincs adat"}"><i style="width:${e?e.x/6*100:0}%"></i></div><p class="small muted">${e?`${e.n} eredmény alapján`:`Ebből lesz adat: ${src}.`}</p></div>`;}).join("")}
    <div class="row small muted" style="justify-content:space-between">${CEFR.map(c=>`<span>${c}</span>`).join("")}</div>
    ${weak?`<div class="notice"><b>Leggyengébb most:</b> ${weak[1].toLowerCase()}. ${esc(weak[2])} segít a legtöbbet.</div>`:""}</div>`;
}
