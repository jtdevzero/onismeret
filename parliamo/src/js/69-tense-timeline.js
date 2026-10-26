/* ============ TENSE TIMELINE ============ */
/* Each tense drawn on one time axis (past · now · future), with a Hungarian explanation, an example, signal words and a
   gap-fill drill that shows the timeline of the right answer. Positions run from -3 (far past) to +3 (future); 0 is now.
   Shapes: pt (one event), wave (in progress), rep (repeated), bar (lasting state), ref (a reference moment), arr (up to now). */
const TL={
  en:[
    {id:"ps",name:"Present simple",shapes:[{t:"rep",a:-2.6,b:2.6}],hu:"Szokás, ismétlődő cselekvés vagy általános igazság. Nem a pillanatról szól, hanem arról, ami rendszerint így van.",ex:"I work in an office.",sig:"always, usually, often, every day, never"},
    {id:"pc",name:"Present continuous",shapes:[{t:"wave",a:-.45,b:.45}],hu:"Éppen most, a beszéd pillanatában zajló cselekvés, vagy átmeneti helyzet.",ex:"I'm working from home this week.",sig:"now, at the moment, this week, Look!"},
    {id:"past",name:"Past simple",shapes:[{t:"pt",x:-2}],hu:"Lezárt múltbeli esemény egy megadott vagy ismert időpontban. A jelenhez már nincs köze.",ex:"I visited Rome last year.",sig:"yesterday, last year, ago, in 2019"},
    {id:"pastc",name:"Past continuous",shapes:[{t:"wave",a:-2.6,b:-1.4},{t:"pt",x:-2}],hu:"Múltban folyamatban lévő cselekvés; gyakran egy rövid esemény szakítja félbe (az a past simple).",ex:"I was cooking when you called.",sig:"when, while, at 8 o'clock yesterday"},
    {id:"pp",name:"Present perfect",shapes:[{t:"arr",a:-2,b:0},{t:"pt",x:-2}],hu:"Múltban kezdődött, és a jelenig tart, vagy a múltbeli eseménynek most is van eredménye. Az időpont nem fontos.",ex:"I have lived here since 2019.",sig:"ever, never, already, yet, just, since, for"},
    {id:"ppc",name:"Present perfect continuous",shapes:[{t:"wave",a:-2,b:0}],hu:"Múltban kezdődött, és a jelenig folyamatosan tart; az időtartamon van a hangsúly.",ex:"I've been waiting for an hour.",sig:"for, since, all day, how long"},
    {id:"pastp",name:"Past perfect",shapes:[{t:"pt",x:-2.5},{t:"ref",x:-1.2,l:"akkor"}],hu:"Egy múltbeli időpont előtt már megtörtént esemény: a „múlt múltja”.",ex:"When we arrived, the train had left.",sig:"already, before, by the time, when"},
    {id:"pastpc",name:"Past perfect continuous",shapes:[{t:"wave",a:-2.7,b:-1.2},{t:"ref",x:-1.2,l:"akkor"}],hu:"Egy múltbeli időpontig folyamatosan tartó cselekvés; az időtartam a fontos.",ex:"They were tired because they had been walking for hours.",sig:"for, since, before, how long"},
    {id:"will",name:"Will",shapes:[{t:"pt",x:2}],hu:"Jövőbeli esemény, jóslat, hirtelen döntés vagy ígéret.",ex:"I'll call you tomorrow.",sig:"tomorrow, next week, I think, probably"},
    {id:"goingto",name:"Going to",shapes:[{t:"arr",a:0,b:1.8,dash:true},{t:"pt",x:1.8}],hu:"Már eldöntött terv, vagy a jelenből látható, biztosra vehető jövő (pl. sötét felhők).",ex:"Look at those clouds! It's going to rain.",sig:"Look!, I've decided, plan"},
    {id:"futc",name:"Future continuous",shapes:[{t:"wave",a:1.5,b:2.5},{t:"ref",x:2,l:"holnap 9-kor"}],hu:"A jövő egy adott pillanatában éppen folyamatban lévő cselekvés.",ex:"This time tomorrow I'll be flying to New York.",sig:"this time tomorrow, at 9 tomorrow"},
    {id:"futp",name:"Future perfect",shapes:[{t:"pt",x:1.4},{t:"ref",x:2.4,l:"péntek"}],hu:"Egy jövőbeli határidőre már befejeződik a cselekvés.",ex:"By Friday I will have finished the report.",sig:"by, by the time, before"}
  ],
  it:[
    {id:"pres",name:"Presente",shapes:[{t:"rep",a:-2.6,b:2.6}],hu:"Szokás, általános igazság, és gyakran a közeli jövő is („Domani vado a Roma”).",ex:"Ogni mattina prendo un caffè.",sig:"sempre, di solito, ogni giorno, spesso"},
    {id:"stare",name:"Stare + gerundio",shapes:[{t:"wave",a:-.45,b:.45}],hu:"Éppen most zajló cselekvés (mint az angol ‑ing alak).",ex:"Sto leggendo un libro.",sig:"adesso, in questo momento"},
    {id:"pp",name:"Passato prossimo",shapes:[{t:"pt",x:-1.8}],hu:"Befejezett múltbeli esemény. A beszélt nyelvben ez a fő múlt idő.",ex:"Ieri sono andato al cinema.",sig:"ieri, la settimana scorsa, una volta, già"},
    {id:"imp",name:"Imperfetto",shapes:[{t:"bar",a:-2.8,b:-1}],hu:"Múltbeli háttér, leírás, szokás vagy folyamatban lévő cselekvés; nem mondja meg, mikor ért véget.",ex:"Da bambino andavo sempre al mare.",sig:"mentre, di solito, sempre, da bambino"},
    {id:"trap",name:"Trapassato prossimo",shapes:[{t:"pt",x:-2.5},{t:"ref",x:-1.2,l:"akkor"}],hu:"Egy másik múltbeli esemény előtt már megtörtént: a „múlt múltja”.",ex:"Quando sono arrivato, il treno era già partito.",sig:"già, prima, quando"},
    {id:"rem",name:"Passato remoto",shapes:[{t:"pt",x:-2.8}],hu:"Régmúlt, lezárt esemény, főleg írott nyelvben, történelemben, mesékben (Dél-Olaszországban beszédben is).",ex:"Dante scrisse la Divina Commedia.",sig:"nel Trecento, molti anni fa, c'era una volta"},
    {id:"fut",name:"Futuro semplice",shapes:[{t:"pt",x:2}],hu:"Jövőbeli esemény, terv vagy jóslat; feltételezést is kifejezhet („Sarà stanco” = biztos fáradt).",ex:"Domani andrò a Roma.",sig:"domani, l'anno prossimo, fra un mese"},
    {id:"futant",name:"Futuro anteriore",shapes:[{t:"pt",x:1.4},{t:"ref",x:2.4,l:"utána"}],hu:"Egy másik jövőbeli esemény előtt már befejeződik.",ex:"Quando avrò finito i compiti, uscirò.",sig:"quando, dopo che, appena"}
  ],
  es:[
    {id:"pres",name:"Presente",shapes:[{t:"rep",a:-2.6,b:2.6}],hu:"Szokás, általános igazság, és gyakran a közeli jövő is.",ex:"Este año voy al trabajo en bici.",sig:"siempre, normalmente, todos los días"},
    {id:"estar",name:"Estar + gerundio",shapes:[{t:"wave",a:-.45,b:.45}],hu:"Éppen most zajló cselekvés (mint az angol ‑ing alak).",ex:"Estoy leyendo un libro.",sig:"ahora, en este momento"},
    {id:"perf",name:"Pretérito perfecto",shapes:[{t:"arr",a:-1.2,b:0},{t:"pt",x:-1.2}],hu:"Múltbeli esemény egy még tartó időszakban (ma, ezen a héten), vagy aminek most is van jelentősége. Spanyolországban így használják; Latin-Amerikában ilyenkor is gyakran az indefinido jön.",ex:"Hoy he trabajado mucho.",sig:"hoy, esta semana, ya, todavía no, nunca"},
    {id:"indef",name:"Pretérito indefinido",shapes:[{t:"pt",x:-2}],hu:"Lezárt múltbeli esemény egy lezárt időszakban.",ex:"Ayer hablé con mi hermana.",sig:"ayer, el año pasado, en 2019, hace dos días"},
    {id:"imp",name:"Pretérito imperfecto",shapes:[{t:"bar",a:-2.8,b:-1}],hu:"Múltbeli háttér, leírás, szokás vagy folyamatban lévő cselekvés.",ex:"De niño jugaba al fútbol todos los sábados.",sig:"mientras, siempre, de niño, antes"},
    {id:"plus",name:"Pluscuamperfecto",shapes:[{t:"pt",x:-2.5},{t:"ref",x:-1.2,l:"akkor"}],hu:"Egy másik múltbeli esemény előtt már megtörtént.",ex:"Cuando llegué, la película ya había empezado.",sig:"ya, antes, cuando"},
    {id:"ira",name:"Ir a + infinitivo",shapes:[{t:"arr",a:0,b:1.6,dash:true},{t:"pt",x:1.6}],hu:"Eldöntött terv vagy a jelenből látható jövő; a beszélt nyelvben nagyon gyakori.",ex:"Mira esas nubes: va a llover.",sig:"esta tarde, mañana, ¡mira!"},
    {id:"fut",name:"Futuro simple",shapes:[{t:"pt",x:2}],hu:"Jövőbeli esemény vagy jóslat; feltételezést is kifejezhet („Estará cansado”).",ex:"Mañana visitaré a mis abuelos.",sig:"mañana, el año que viene, dentro de un mes"},
    {id:"futp",name:"Futuro perfecto",shapes:[{t:"pt",x:1.4},{t:"ref",x:2.4,l:"hétfő"}],hu:"Egy jövőbeli határidőre már befejeződik.",ex:"Para el lunes ya habré terminado el informe.",sig:"para, antes de, cuando"}
  ]
};
/* Gap-fill items: q with ___, the right form first in o, and the tense id that explains it. */
const TLQ={
  en:[
    ["She ___ to work by bus every day.",["takes","is taking","took"],"ps","every day: rendszeres szokás."],
    ["Look! It ___.",["is snowing","snows","has snowed"],"pc","Look!: éppen most történik."],
    ["We ___ Rome last summer.",["visited","have visited","were visiting"],"past","last summer: lezárt múltbeli időpont."],
    ["I ___ dinner when the phone rang.",["was cooking","cooked","had cooked"],"pastc","Folyamatban volt, amikor egy rövid esemény közbejött."],
    ["I ___ here since 2019.",["have lived","live","lived"],"pp","since: a múltban kezdődött, és most is tart."],
    ["She ___ for two hours, so she's tired.",["has been running","runs","ran"],"ppc","Az időtartam a fontos, és az eredménye most látszik."],
    ["When we got to the station, the train ___.",["had left","left","has left"],"pastp","A vonat még a megérkezésünk előtt elment."],
    ["They were tired because they ___ for three hours.",["had been walking","have been walking","walk"],"pastpc","Egy múltbeli pillanatig tartó folyamat."],
    ["I promise I ___ you tomorrow.",["will call","am calling","called"],"will","Ígéret: will."],
    ["Look at those clouds! It ___.",["is going to rain","will be raining","rains"],"goingto","A jelenből látható jövő: going to."],
    ["This time tomorrow I ___ to New York.",["will be flying","will fly","fly"],"futc","A jövő egy adott pillanatában éppen zajlik."],
    ["By Friday I ___ the report.",["will have finished","will finish","finish"],"futp","by Friday: határidőre már kész lesz."]
  ],
  it:[
    ["Adesso ogni mattina ___ un caffè al bar.",["prendo","ho preso","prendevo"],"pres","Mostani szokás: presente."],
    ["Che cosa fai? – ___ un libro.",["Sto leggendo","Leggevo","Ho letto"],"stare","Éppen most zajlik."],
    ["Ieri ___ al cinema con Marta.",["sono andato","andavo","vado"],"pp","ieri: befejezett múltbeli esemény."],
    ["Da bambino ___ sempre al mare d'estate.",["andavo","sono andato","vado"],"imp","Múltbeli szokás: imperfetto."],
    ["Mentre ___ la cena, è arrivato Luca.",["preparavo","ho preparato","preparo"],"imp","mentre: háttér, ami közben valami történt."],
    ["Quando sono arrivato alla stazione, il treno ___.",["era già partito","è già partito","partiva"],"trap","A vonat még a megérkezésem előtt elment."],
    ["Dante ___ la Divina Commedia nel Trecento.",["scrisse","scriveva","scriverà"],"rem","Régmúlt, írott nyelv: passato remoto."],
    ["L'anno prossimo ___ in Spagna.",["andrò","andavo","sono andato"],"fut","l'anno prossimo: jövő."],
    ["Quando ___ i compiti, uscirò.",["avrò finito","finivo","finirei"],"futant","Előbb befejezem, aztán megyek ki."]
  ],
  es:[
    ["Este año ___ al trabajo en bici todos los días.",["voy","fui","iba"],"pres","Mostani szokás: presente."],
    ["¿Qué haces? – ___ un libro.",["Estoy leyendo","Leí","Leía"],"estar","Éppen most zajlik."],
    ["Hoy ___ mucho.",["he trabajado","trabajé","trabajaba"],"perf","hoy: még tartó időszak; Spanyolországban pretérito perfecto."],
    ["Ayer ___ con mi hermana.",["hablé","he hablado","hablaba"],"indef","ayer: lezárt időszak."],
    ["De niño ___ al fútbol todos los sábados.",["jugaba","jugué","he jugado"],"imp","Múltbeli szokás: imperfecto."],
    ["Mientras ___ la cena, sonó el teléfono.",["preparaba","preparé","he preparado"],"imp","mientras: háttér, ami közben valami történt."],
    ["Cuando llegué, la película ya ___.",["había empezado","empezó","ha empezado"],"plus","A film még a megérkezésem előtt elkezdődött."],
    ["Mira esas nubes: ___ a llover.",["va","fue","iba"],"ira","A jelenből látható jövő: ir a + infinitivo."],
    ["Mañana ___ a mis abuelos.",["visitaré","visité","visitaba"],"fut","mañana: jövő."],
    ["Para el lunes ya ___ el informe.",["habré terminado","terminé","terminaba"],"futp","para el lunes: határidőre már kész lesz."]
  ]
};
function tlSvg(shapes,label){
  const W=320,H=96,Y=62,X=v=>160+v*48,c="var(--cobalt)",m="var(--muted)";
  const parts=shapes.map(s=>{
    if(s.t==="pt")return `<circle cx="${X(s.x)}" cy="${Y}" r="7" fill="${c}"/>`;
    if(s.t==="bar")return `<rect x="${X(s.a)}" y="${Y-6}" width="${X(s.b)-X(s.a)}" height="12" rx="6" fill="${c}" opacity=".75"/>`;
    if(s.t==="wave"){let d=`M${X(s.a)} ${Y}`;for(let x=X(s.a);x<X(s.b);x+=8)d+=` q4 -9 8 0`;return `<path d="${d}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;}
    if(s.t==="rep"){let o="";for(let v=s.a;v<=s.b+1e-9;v+=.65)o+=`<circle cx="${X(v)}" cy="${Y}" r="4" fill="${c}"/>`;return o;}
    if(s.t==="arr")return `<line x1="${X(s.a)}" y1="${Y-14}" x2="${X(s.b)-6}" y2="${Y-14}" stroke="${c}" stroke-width="3" ${s.dash?'stroke-dasharray="5 4"':""}/><path d="M${X(s.b)-8} ${Y-20} l8 6 l-8 6" fill="none" stroke="${c}" stroke-width="3"/>`;
    if(s.t==="ref")return `<line x1="${X(s.x)}" y1="${Y-22}" x2="${X(s.x)}" y2="${Y+10}" stroke="${m}" stroke-width="2" stroke-dasharray="3 3"/><text x="${X(s.x)}" y="${Y-26}" text-anchor="middle" font-size="11" fill="${m}">${esc(s.l)}</text>`;
    return "";}).join("");
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Idővonal: ${esc(label)}" style="width:100%;height:auto;max-width:420px">
    <line x1="8" x2="${W-8}" y1="${Y}" y2="${Y}" stroke="currentColor" stroke-opacity=".35" stroke-width="2"/><path d="M${W-14} ${Y-5} l6 5 l-6 5" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="2"/>
    <line x1="160" x2="160" y1="${Y-30}" y2="${Y+12}" stroke="var(--bad)" stroke-width="2"/>
    <text x="40" y="${H-4}" font-size="11" fill="${m}">múlt</text><text x="160" y="${H-4}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--bad)">most</text><text x="${W-40}" y="${H-4}" text-anchor="end" font-size="11" fill="${m}">jövő</text>
    ${parts}</svg>`;
}
const tlOf=id=>(TL[lang()]||[]).find(t=>t.id===id);
function renderTimeline(){
  stopViews();const list=TL[lang()]||[];
  subShell(["Gyakorlás",()=>go("gyakorlas")],"Nyelvtan","Igeidő-idővonal",`<p class="muted">Minden igeidő ugyanazon az idővonalon: hová esik a cselekvés a „most”-hoz képest, pont-e vagy folyamat, és mihez viszonyítjuk.</p>
    <div class="card row" style="gap:1rem;flex-wrap:wrap;font-size:.85rem" aria-label="Jelmagyarázat"><span><b style="color:var(--cobalt)">●</b> egyszeri esemény</span><span><b style="color:var(--cobalt)">∿</b> folyamatban</span><span><b style="color:var(--cobalt)">• • •</b> ismétlődő</span><span><b style="color:var(--cobalt)">━</b> tartós állapot, háttér</span><span><b style="color:var(--muted)">┊</b> viszonyítási pont</span></div>
    <button class="btn lemon" id="tlQuiz">Gyakorló: melyik igeidő illik? (${(TLQ[lang()]||[]).length} mondat)</button>
    ${list.map(t=>`<article class="card stack" style="gap:.5rem"><h3 ${LA()}>${esc(t.name)}</h3>${tlSvg(t.shapes,t.name)}<p>${esc(t.hu)}</p>
      <div class="row" style="gap:.4rem"><span ${LA()}><b>${esc(t.ex)}</b></span>${spkBtn(t.ex)}</div><p class="small muted">Jelzőszavak: <span ${LA()}>${esc(t.sig)}</span></p></article>`).join("")}`);
  $("#tlQuiz").onclick=startTimelineQuiz;
}
function startTimelineQuiz(){
  QZ_BACK=renderTimeline;
  runQuiz({kind:"drill:tline",label:"Igeidő-idővonal",title:"Melyik igeidő illik?",backLabel:"Idővonal",
    items:shuffle((TLQ[lang()]||[]).map(([q,o,t,why])=>({q,a:o[0],o,why,tense:t}))),
    after:it=>{const t=tlOf(it.tense);return t?`<div class="stack" style="gap:.3rem;margin-top:.4rem;color:var(--ink)"><span class="small"><b ${LA()}>${esc(t.name)}</b></span>${tlSvg(t.shapes,t.name)}</div>`:"";},
    onDone:(ok,n)=>{QZ_BACK=null;addXP(ok*2);drillStat("tline",ok===n);save();
      subShell(["Idővonal",renderTimeline],"Igeidő-idővonal","Kész",`<div class="card stack"><h3>${ok} / ${n} helyes</h3><p class="muted">${ok===n?"Minden igeidőt eltaláltál.":"A hibás mondatok a hibakörbe és a havi elemzésbe kerültek."}</p><div class="row"><button class="btn" id="tlAgain">Újra</button><button class="btn ghost" data-go="gyakorlas">Gyakorlás</button></div></div>`);
      $("#tlAgain").onclick=startTimelineQuiz;}});
}
