/* ============ AI STORY OF THE DAY ============ */
async function aiStory(){
  D=null;
  const sample=await getSample();
  const shell=inner=>{view.innerHTML=`<div class="stack"><div class="row"><button class="btn ghost" id="aBack">← Gyakorlás</button></div><div><span class="label">A saját szavaidból</span><h1>Napi AI-történet</h1></div>${inner}</div>`;$("#aBack").onclick=()=>{route="gyakorlas";render();};};
  if(!sample){shell(`<div class="notice">${aiMissing()}</div>`);return;}
  const c=S.ai[lang()];if(c&&c.day===today()&&c.data)return playAi(c.data);
  shell(`<div class="card row"><span class="thinking"><i></i><i></i><i></i></span><span class="muted">Írom a mai történetet a szavaidból. Ez fél percig is eltarthat.</span></div>`);
  let words=POOL.filter(x=>!x.ph&&S.cards[x.id]&&S.cards[x.id].reps>0).map(x=>x.it);
  if(words.length<15){const u=new Set(unlocked());words=words.concat(POOL.filter(x=>!x.ph&&u.has(x.li)).map(x=>x.it));}
  words=shuffle([...new Set(words)]).slice(0,70);
  const lvl=defLevel(), A=LG().adj, AV=LG().adv;
  const prompt=`Írj egy rövid, hétköznapi párbeszédes történetet ${AV} egy magyar anyanyelvű nyelvtanulónak. Szint: ${LVL[lvl]||lvl}.
Főleg ezeket a szavakat használd, amelyeket a tanuló már ismer: ${words.join(", ")}.
Szerkezet: 10-14 mondat, egy narrátor (N) és két szereplő (A és B). A narrátor mondatai rövidek. A 4., a 8. mondat után és a végén tegyél egy-egy értésellenőrző kérdést magyarul, három válaszlehetőséggel, amelyek közül pontosan egy helyes.
Csak egy JSON objektumot adj vissza ebben a formában:
{"title":"cím ${AV}","hu":"magyar cím","cast":{"N":{"name":"Narrátor"},"A":{"name":"név"},"B":{"name":"név"}},"lines":[{"s":"N","it":"mondat ${AV}","hu":"magyar fordítás"},{"q":"kérdés magyarul","o":["válasz 1","válasz 2","válasz 3"],"a":0}]}
Az "it" mező mindig a ${A} szöveget tartalmazza.`;
  try{
    const d=await sample.json(prompt,{modelTier:"default"});
    const lines=(Array.isArray(d.lines)?d.lines:[]).filter(l=>l&&((l.q&&Array.isArray(l.o)&&l.o.length>1&&Number.isInteger(l.a))||(l.it&&typeof l.it==="string"))).map(l=>l.q?{q:String(l.q),o:l.o.map(String),a:Math.min(l.a,l.o.length-1)}:{s:["N","A","B"].includes(l.s)?l.s:"N",it:String(l.it),hu:String(l.hu||"")});
    if(lines.filter(l=>l.it).length<5)throw {code:"invalid_json"};
    const cast={N:{name:"Narrátor"},A:{name:String(d.cast&&d.cast.A&&d.cast.A.name||"A")},B:{name:String(d.cast&&d.cast.B&&d.cast.B.name||"B")}};
    const data={title:String(d.title||"La storia di oggi"),hu:String(d.hu||"A mai történet"),cast,lines};
    S.ai[lang()]={day:today(),data};save();playAi(data);
  }catch(e){
    if(!$("#aBack"))return;
    shell(`<div class="notice">${esc(e&&e.code==="invalid_json"?"A történet formátuma nem sikerült. Próbáld újra.":aiErr(e))}</div><div><button class="btn" id="aRetry">Újra</button></div>`);
    $("#aRetry").onclick=aiStory;
  }
}
function playAi(data){playStoryObj(Object.assign({id:"ai-"+lang()+"-"+today(),level:defLevel(),img:LG().hero,unlock:null},data));}

