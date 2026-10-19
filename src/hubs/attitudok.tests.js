/* attitudok hub — a kézzel írt attitudok.html-ből átköltöztetve (tools: migráció). A pontozó kód és a szövegek változatlanok. */

/* ═══════════ 1. SSSS — SZEXUÁLIS ÖNKÉP ═══════════ */
(function(){
// Andersen, Cyranowski & Espindle (1999) — Men's SSSS, 27 releváns melléknév, 3 faktor
const ITEMS = [
  // Passionate-Loving (11)
  {n:1, f:'PL', t:'meleg'},
  {n:2, f:'PL', t:'szerető'},
  {n:3, f:'PL', t:'romantikus'},
  {n:4, f:'PL', t:'szenvedélyes'},
  {n:5, f:'PL', t:'érzékeny'},
  {n:6, f:'PL', t:'meleg szívű'},
  {n:7, f:'PL', t:'megértő'},
  {n:8, f:'PL', t:'gyengéd'},
  {n:9, f:'PL', t:'együttérző'},
  {n:10, f:'PL', t:'kedves'},
  {n:11, f:'PL', t:'ragaszkodó'},
  // Powerful-Independent (7)
  {n:12, f:'PI', t:'erős / hatalommal bíró'},
  {n:13, f:'PI', t:'független'},
  {n:14, f:'PI', t:'domináns'},
  {n:15, f:'PI', t:'individualista'},
  {n:16, f:'PI', t:'magabiztos'},
  {n:17, f:'PI', t:'nyíltszájú / szókimondó'},
  {n:18, f:'PI', t:'agresszív'},
  // Open-Direct (9)
  {n:19, f:'OD', t:'direkt'},
  {n:20, f:'OD', t:'egyenes'},
  {n:21, f:'OD', t:'gátlástalan'},
  {n:22, f:'OD', t:'tapasztalt'},
  {n:23, f:'OD', t:'nyitott gondolkodású'},
  {n:24, f:'OD', t:'liberális'},
  {n:25, f:'OD', t:'őszinte'},
  {n:26, f:'OD', t:'laza / kötetlen'},
  {n:27, f:'OD', t:'nyitott'}
];
const TOTAL=ITEMS.length;
const SCALE=[{v:0,l:'egyáltalán'},{v:1,l:'alig'},{v:2,l:'kissé'},{v:3,l:'közepesen'},{v:4,l:'elég'},{v:5,l:'nagyon'},{v:6,l:'rendkívül'}];

function scoreFactor(f){return ITEMS.filter(it=>it.f===f).reduce((s,it)=>s+(responses[it.n]||0),0);}
const FACTORS={
  PL:{name:'Szenvedélyes-Szerető',en:'Passionate-Loving',max:66,items:11,desc:'Meleg, romantikus, gyengéd, együttérző szexuális önkép. Az intimitás-orientált oldal.'},
  PI:{name:'Erős-Független',en:'Powerful-Independent',max:42,items:7,desc:'Domináns, magabiztos, individualista szexuális önkép. Az agentikus oldal.'},
  OD:{name:'Nyitott-Direkt',en:'Open-Direct',max:54,items:9,desc:'Nyitott, gátlástalan, tapasztalt, liberális szexuális önkép. A felszabadult oldal.'}
};
function band(f, score){
  const max=FACTORS[f].max;
  const pct=score/max;
  if(pct>=0.75)return{key:'high',label:'Erős',color:'#065f46'};
  if(pct>=0.5)return{key:'mid',label:'Közepes',color:'#b8912e'};
  if(pct>=0.3)return{key:'low',label:'Gyenge',color:'#c97a4a'};
  return{key:'verylow',label:'Nagyon gyenge',color:'#7c2d3c'};
}
const INTERP = {
  PL:{
    high:`Erős szenvedélyes-szerető önkép. A szexualitás számodra elsősorban <strong>intimitás</strong>, kapcsolódás, gyengédség. Ez sokszor pozitív prediktora a hosszú távú párkapcsolati elégedettségnek, de kockázata is van: ha a partneri kontextus hiányzik (post-breakup, egyedülálló periódus), a "szex mint puszta izgalom" nehezebben tapasztalható.`,
    mid:`Közepes szintű szenvedélyes-szerető önkép. Az intimitás fontos, de nem dominál — más aspektusok is jelen vannak.`,
    low:`Gyenge szenvedélyes-szerető önkép. A szexualitás nem elsősorban intim/érzelmi élményként van felszínen. Ez lehet: (1) érzelmi élettávolság (post-breakup, alexitímia, avoidant kötődés), (2) egyszerűen más karakter — nem minden férfi számára romantikus a szex; nem hiba.`,
    verylow:`Nagyon gyenge szenvedélyes-szerető önkép. Az érzelmi-romantikus dimenzió szinte hiányzik a szexuális önképedből. Ez erősen korrelál elkerülő kötődéssel, alexitímiával, vagy védekező érzelmi távolsággal. Nem "helytelen" — de a partneri kapcsolatokban nehézséget okozhat.`
  },
  PI:{
    high:`Erős agentikus önkép. Domináns, magabiztos, "vezető" pozíció a szexualitásban. Ez lehet egészséges kompetencia-érzés, vagy kompenzáló grandiozitás — az árnyalatot a többi skála adja. Ha a PL is magas → egészséges konfidencia; ha alacsony → esetleg pajzs.`,
    mid:`Közepes szintű agentikus önkép.`,
    low:`Gyenge agentikus önkép. A "vezetés", magabiztosság, dominancia nem elsődleges dimenzió számodra. Ez lehet egyszerűen szolid, egalitárius stílus — nem hiba.`,
    verylow:`Nagyon gyenge agentikus önkép. Szexuális helyzetekben passzív, bizonytalan, "vezetést váró" pozíció jellemző. Ha ez distresszt okoz, érdemes a szexuális asszertivitás fejlesztése (SAQ IV. alskála).`
  },
  OD:{
    high:`Erős nyitott-direkt önkép. Felszabadult, kalandvágyó, kevés belső korláttal működő szexuális önkép. Ez pozitív bejósló a partneri szexuális elégedettségre — de figyelem: az "open-direct" magas értéke NEM helyettesíti a partner beleegyezését és igényeit.`,
    mid:`Közepes szintű nyitott-direkt önkép. Van kísérletezés, van komfortzóna.`,
    low:`Gyenge nyitott-direkt önkép. Zárt, óvatosabb, kevésbé kísérletező szexuális karakter. Lehet szexuális szégyen, restriktív szocializáció, vagy egyszerűen konzervatív preferencia — kontextus-függő.`,
    verylow:`Nagyon gyenge nyitott-direkt önkép. Erős szexuális zártság, gátoltság. Gyakori együtthaladó: magas SIS2 (SIS/SES) + magas Mosher Sex Guilt. Ha distresszt okoz, kognitív munka és fokozatos exposure hasznos.`
  }
};
function getCrossLinks(scores){
  const links=[];
  const pl=scores.PL/FACTORS.PL.max, pi=scores.PI/FACTORS.PI.max, od=scores.OD/FACTORS.OD.max;
  if(pl<0.4 && pi>=0.6){
    links.push({label:'Alacsony PL + magas PI — kompenzáló minta lehet',text:`Gyenge érzelmi-romantikus önkép magas domináns-magabiztos önképpel együtt gyakran <em>kompenzáló struktúra</em>: az érzelmi sebezhetőség helyét a "power" tölti be. Érdemes az SMI Self-Aggrandizer és Vulnerable Child arányát megnézni.`});
  }
  if(pl<0.4 && od<0.4){
    links.push({label:'Alacsony PL + alacsony OD — érzelmi távolság',text:`Kombinált gyenge intimitás + gyenge nyitottság gyakran együtt jár elkerülő kötődéssel (ECR-R elkerülés magas) és alexitímiával (TAS-20).`});
  }
  if(od<0.3){
    links.push({label:'Nagyon alacsony OD → érdemes a SIS2-t is megnézni',text:`A zárt, gátolt szexuális önkép a Bancroft-modell szerint gyakran együtt járhat magasabb SIS2 (külső gátlás) pontszámmal; hogy nálad így van-e, azt a SIS/SES mutatja meg. Ha nem töltötted még ki, érdemes a SIS/SES-t is (előző hub).`});
  }
  if(pl>=0.7 && od>=0.7){
    links.push({label:'Magas PL + magas OD — integrált érett szexuális önkép',text:`Együttesen magas érzelmi + nyitott önkép a legkedvezőbb profil: intimitás és felszabadultság egyszerre elérhető. Ez a "biztonságos-explorative" attitűd.`});
  }
  if(pi>=0.75 && pl<0.4){
    links.push({label:'Magas PI + alacsony PL — narcisztikus/kompenzáló minta',text:`A "domináns/agresszív" önkép szenvedélyes-szerető önkép NÉLKÜL sok esetben kompenzáció a belső sebezhető gyermek fölött. Klinikailag érdemes megnézni: az agentikus önkép autentikus kompetencia-e, vagy páncél.`});
  }
  return links;
}
function therapySuggestions(scores){
  const mods=[];
  const pl=scores.PL/FACTORS.PL.max, pi=scores.PI/FACTORS.PI.max, od=scores.OD/FACTORS.OD.max;
  if(pl<0.4){
    mods.push({name:'Érzelmi kapacitás-építés — <em>Emotion-Focused Sex Therapy</em>',text:`Ha a szenvedélyes-szerető dimenzió alacsony, az érzelmi kapacitás a fejlesztendő terület. Emotion-Focused Therapy szexuális adaptációban (Greenberg/Woldarsky), vagy az AEDP-hangolású munka az intim érzelmek tudatosításán dolgozik.`});
  }
  if(od<0.4){
    mods.push({name:'Fokozatos exposure — szexuális zártság csökkentése',text:`Alacsony OD-nál a fokozatos, tudatos exposure új tapasztalatokra hasznos — nem "kényszer", hanem szelíd, kis lépések. Nagoski "Come As You Are" könyv jó kezdés.`});
  }
  if(pi>=0.75 && pl<0.4){
    mods.push({name:'Séma-munka: Vulnerable Child + Self-Aggrandizer',text:`Ha a "power" pajzsként működik az érzelmi sebezhetőség fölött, séma-terápiás munka (chair work a Self-Aggrandizer mode-dal, imagery rescripting a Vulnerable Child-dal) hasznos.`});
  }
  if(pl>=0.6 && pi>=0.6 && od>=0.6){
    mods.push({name:'Integrált profil — fenntartás',text:`Mindhárom dimenzió erős — kiegyensúlyozott, integrált szexuális önkép. Ez pozitív bejósló a hosszú távú szexuális jóllétre. Fenntartás: partneri kommunikáció, kölcsönös érdek-artikuláció, kapcsolati "learning zone" fenntartása.`});
  }
  mods.push({name:'Pszichoedukáció: <em>Andersen & Cyranowski cikkek</em>',text:`Az SSSS mögötti fogalmi keret megismerése önmagában értékes — a "szexuális önkép" mint identitás-dimenzió tudatosítása. A hivatkozott források jó kezdés.`});
  return mods;
}

/* — motorhoz illesztés: a régi pontozó függvények a nyers válaszokból (responses) számolnak — */
let responses={};
const TX={"res_eyebrow": "Eredmény · SSSS · Értelmezés", "res_title": "A te szexuális <em>önképed</em>", "res_lead": "A három dimenzió független — mindegyik saját karaktert ír le. A magas érték nem \"jobb\", csak \"erősebben jelenlévő\". Az érdekes információ a három együttes mintázata.", "cross": "Kapcsolatok más <em>területekkel</em>", "therapy": "Klinikai <em>következtetések</em>", "therapy_sub": "Mit kezdj vele az önismereti munkában", "refs": ["<strong>Andersen, B. L., Cyranowski, J. M., & Espindle, D. (1999).</strong> Men's sexual self-schema. <em>Journal of Personality and Social Psychology, 76(4)</em>, 645–661.", "<strong>Andersen, B. L., & Cyranowski, J. M. (1994).</strong> Women's sexual self-schema. <em>Journal of Personality and Social Psychology, 67(6)</em>, 1079–1100.", "<strong>Reissing, E. D., Laliberté, G. M., & Davis, H. J. (2005).</strong> Young women's sexual adjustment: The role of sexual self-schema, sexual self-efficacy, sexual aversion and body attitudes. <em>The Canadian Journal of Human Sexuality, 14(3-4)</em>."]};
const HEAD=()=>`<div class="res-eyebrow">${TX.res_eyebrow}</div><h2 class="res-title">${TX.res_title}</h2>${TX.res_lead?`<p class="res-lead">${TX.res_lead}</p>`:''}`;
const REFS=()=>TX.refs.length?H.refs(TX.refs):'';
makeTest({
  id:"ssss",key:"ssss-responses-v1",name:"SSSS",c1:"#e11d48",c2:"#d4a017",
  tab:"Önkép",tabSub:"SSSS · 27 melléknév",scale:SCALE,
  header:{"status": "valid", "statusText": "Validált eszköz alapján · fordítás tételenként még nem ellenőrzött", "eyebrow": "Sexual Self-Schema Scale — Male · Andersen, Cyranowski & Espindle (1999)", "title": "A szexuális <em>önképed</em>", "lead": "A szexuális önkép (<em>sexual self-schema</em>) az, ahogy magad szexuális lényként belülről leírod. Nem viselkedés, nem funkció — hanem <strong>identitás</strong>. A férfi SSSS három dimenzióban méri: <em>Szenvedélyes-Szerető</em>, <em>Erős-Független</em>, <em>Nyitott-Direkt</em>. Mindhárom pozitív aspektus — a magas pontszám nem \"jó\" vagy \"rossz\", hanem <em>karakter</em>.", "intro": "<p><strong>Kitöltési útmutató:</strong> Az alábbiakban 27 melléknevet találsz. Mindegyiknél értékeld 0–6 skálán, hogy <em>mennyire jellemez téged mint szexuális lényt</em>. 0 = egyáltalán nem jellemez, 6 = nagyon jellemez.</p>\n      <p>Ne \"ideális önmagad\" válaszait add — hanem hogy jelenleg hogyan látod magad. Ha most nem érzed magad szexuálisan aktívnak, még mindig van szexuális önképed — az válaszoljon.</p>"},
  sections:[{title:'',desc:'',items:ITEMS.map(it=>({s:it.f,tag:it.f,t:'Mennyire jellemez engem szexuális lényként: <strong><em>'+it.t+'</em></strong>'}))}],
  score(R){responses={};R.items.forEach(i=>{if(i.raw!==undefined)responses[i.n]=i.raw;});
    const scores={PL:scoreFactor('PL'),PI:scoreFactor('PI'),OD:scoreFactor('OD')};
    return {scores,oni:{n:'SSSS',d:Object.fromEntries(['PL','PI','OD'].map(k=>[k,[FACTORS[k].name,scores[k],0,FACTORS[k].max]]))}};
  },
  sum(s){return s.oni;},
  render(R,s){
    const sc=s.scores,total=sc.PL+sc.PI+sc.OD;
    return HEAD()+H.total({label:'Összesített szexuális önkép-erősség',val:total,out:'/ 162 (11+7+9 item × 6 max)',band:'3 dimenzió integrált',desc:'A dimenziók külön-külön értelmezendők — az érdekes az egymáshoz viszonyított aránya.'})
      +'<div class="score-grid">'+['PL','PI','OD'].map(f=>{const v=sc[f],m=FACTORS[f],b=band(f,v);return `<div class="score-card" style="--sc:${b.color}"><div class="abbr">${f+" · "+m.en}</div><div class="sc-h"><em>${m.name}</em></div><div class="val">${v}</div><div class="out">${"/ "+m.max+" · "+m.items+" item"}</div><div class="band">${b.label}</div><div class="bar"><div class="bar-fill" style="width:${v/m.max*100}%"></div></div></div>`;}).join('')+'</div>'
      +H.interp('Klinikai <em>értelmezés</em>',['PL','PI','OD'].map(f=>{const v=sc[f],m=FACTORS[f],b=band(f,v);return {h:m.name+' — '+b.label,color:b.color,html:`<p style="font-size:13px;color:var(--ink-lite-muted);margin-bottom:8px;font-style:italic">${m.desc}</p><p>${INTERP[f][b.key]}</p>`};}))
      +H.cross(TX.cross,getCrossLinks(sc))+H.therapy(TX.therapy,TX.therapy_sub,therapySuggestions(sc))+REFS();
  }
});
})();

/* ═══════════ 2. NSSS — SZEXUÁLIS ELÉGEDETTSÉG ═══════════ */
(function(){
const ITEMS = [
  // Ego-Centered (10)
  {n:1, sub:'EGO', t:'A szexuális izgalmam intenzitása'},
  {n:2, sub:'EGO', t:'Az orgazmusaim minősége'},
  {n:3, sub:'EGO', t:'Az "elengedés" és odaadás a szexuális örömnek szex közben'},
  {n:4, sub:'EGO', t:'A koncentrációm / fókuszom szexuális aktivitás közben'},
  {n:5, sub:'EGO', t:'Ahogyan szexuálisan reagálok a partneremre'},
  {n:6, sub:'EGO', t:'A testem szexuális működése'},
  {n:7, sub:'EGO', t:'Az érzelmi megnyílásom a szexben'},
  {n:8, sub:'EGO', t:'A hangulatom szexuális aktivitás után'},
  {n:9, sub:'EGO', t:'Az orgazmusaim gyakorisága'},
  {n:10, sub:'EGO', t:'Az öröm, amit a partneremnek nyújtok'},
  // Partner/Activity-Centered (10)
  {n:11, sub:'PA', t:'A partnerem orgazmusainak minősége'},
  {n:12, sub:'PA', t:'A partnerem elengedése és odaadása a szexuális örömnek'},
  {n:13, sub:'PA', t:'A partnerem szexuális kreativitása'},
  {n:14, sub:'PA', t:'A partnerem szexuális elérhetősége'},
  {n:15, sub:'PA', t:'A szexuális aktivitásaim változatossága'},
  {n:16, sub:'PA', t:'A szexuális aktivitásaim gyakorisága'},
  {n:17, sub:'PA', t:'Az egyensúly aközött, amit adok és kapok a szexben'},
  {n:18, sub:'PA', t:'A partnerem érzelmi megnyílása a szex során'},
  {n:19, sub:'PA', t:'A partnerem kezdeményezése szexuális aktivitásra'},
  {n:20, sub:'PA', t:'A partnerem orgazmus-képessége'}
];
const TOTAL=ITEMS.length;
const SCALE=[{v:1,l:'nagyon elégedetlen'},{v:2,l:'elégedetlen'},{v:3,l:'semleges'},{v:4,l:'elégedett'},{v:5,l:'nagyon'}];

/* Dokumentált szabály: az ego-alskála mind a 10 válasza kell. Ha a partner-alskála hiányos, azt és az összpontszámot nem számoljuk. */
function subDone(s){return ITEMS.filter(it=>it.sub===s).every(it=>responses[it.n]!=null);}
function egoDone(){return subDone('EGO');}
function paDone(){return subDone('PA');}
function scoreSub(s){return ITEMS.filter(it=>it.sub===s).reduce((sum,it)=>sum+(responses[it.n]||0),0);}
function scoreTotal(){return ITEMS.reduce((sum,it)=>sum+(responses[it.n]||0),0);}
/* Nincs magyar mintán normázott referencia: a sávok a 20–100 válaszskála tartományait írják le, nem populációs átlagot. */
function totalBand(score){
  if(score>=80)return{key:'high',label:'Nagyon elégedett',color:'#065f46',desc:'A 20–100 skála legfelső része'};
  if(score>=65)return{key:'good',label:'Elégedett',color:'#84cc16',desc:'A skála felső része'};
  if(score>=50)return{key:'mid',label:'Közepesen',color:'#b8912e',desc:'A skála középső része'};
  if(score>=35)return{key:'low',label:'Elégedetlen',color:'#c97a4a',desc:'A skála alsó része'};
  return{key:'verylow',label:'Nagyon elégedetlen',color:'#7c2d3c',desc:'A 20–100 skála legalsó része'};
}
function subBand(score){
  if(score>=40)return{key:'high',label:'Magas',color:'#065f46'};
  if(score>=30)return{key:'mid',label:'Közepes',color:'#b8912e'};
  return{key:'low',label:'Alacsony',color:'#7c2d3c'};
}
const INTERP = {
  overall:{
    high:`Nagyon magas szexuális elégedettség. Mind a saját tapasztalat, mind a partneri/aktivitási dimenzió jól működik. Ez kedvező profil.`,
    good:`Elégedett tartomány. A szexuális életeddel általánosan elégedett vagy — vannak részek, ahol több lehetne, de a összbenyomás pozitív.`,
    mid:`Közepes elégedettség. Nem kifejezetten distresszes, de nem is pozitív erőforrás. Kérdés: <em>melyik dimenzió</em> húzza le az összpontszámot — nézd meg az alskálákat.`,
    low:`Elégedetlen tartomány. A szexuális életeddel jelentős elégedetlenség van. Két lehetőség: (1) szituációs (kapcsolati krízis, egészségi probléma, poszt-breakup); (2) tartós (funkcionális, kapcsolati, vagy önismereti nehézség). Az alskála-arány segít eldönteni.`,
    verylow:`A válaszaid a skála legalsó részén vannak. Ha ez tartós és megterhel, érdemes szexuálterapeutával vagy párterapeutával átbeszélni.`
  },
  EGO:{
    high:`Erősen elégedett vagy a saját szexuális tapasztalataiddal — testi működés, izgalom, orgazmus, érzelmi megnyílás mind jól működnek belülről.`,
    mid:`Közepesen elégedett vagy a saját tapasztalattal. Bizonyos aspektusok (pl. testi működés) jól, mások (pl. érzelmi megnyílás) kevésbé.`,
    low:`A saját tapasztalatodra vonatkozó válaszaid a skála alsó részén vannak. Ha ez jóval alacsonyabb, mint a partneri oldal, érdemes a saját élményed felől is megnézni: mi történik benned ilyenkor? Ennek sokféle oka lehet (például feszültség, figyelem, testi működés, önértékelés), és a kérdőív nem mutatja meg, melyik. Tisztázó kérdés: mikor volt ez másképp? Kiegészítésként az IIEF-15, a SAQ Monitorozás és a TAS-20 adhat további szempontot.`
  },
  PA:{
    high:`Erősen elégedett vagy a partneri/aktivitási dimenzióval — partner kezdeményez, kreatív, elérhető, orgazmus-képes; a szex változatos és kiegyensúlyozott.`,
    mid:`Közepesen elégedett vagy a partner-oldallal. Bizonyos aspektusok jól működnek, mások nem.`,
    low:`Alacsony partneri/aktivitási elégedettség. Ha ez markánsan alacsonyabb, mint az EGO-oldal, a nehézség inkább <strong>a kapcsolati oldalon</strong> jelenhet meg — vágy-eltérés, partner szexuális elérhetetlensége, kreativitás-hiány, egyensúly-hiány. Kommunikációs vagy párterápiás munka indokolt lehet.`
  }
};
function getCrossLinks(scores){
  const links=[];
  const ego=scores.EGO, pa=scores.PA;
  if(ego<pa-10){
    links.push({label:'EGO << PA — a saját élmény felől érdemes kérdezni',text:`A saját elégedettséged markánsan alacsonyabb a partner-oldalinál. Ez arra utalhat, hogy a nehézség inkább a saját élményedben (nyomás, figyelem, test) jelenik meg, mint a kapcsolatban. Nézd meg: IIEF-15 EF domén, SAQ Sexual Monitoring (III. tab), TAS-20.`});
  }
  if(pa<ego-10){
    links.push({label:'PA << EGO — a kapcsolati oldal felől érdemes kérdezni',text:`A partneri/aktivitási oldal markánsan alacsonyabb, mint a saját. Ez arra utalhat, hogy a nehézség inkább a kapcsolati kontextusban jelenik meg. Neked megvan a "belső gépezet", csak a kapcsolati kontextus nem szolgál. Kérdés: vágy-eltérés, kommunikáció, partner szexuális elérhetetlensége — párterápia hasznos lehet.`});
  }
  if(ego<30 && pa<30){
    links.push({label:'Mindkettő alacsony — átfogó szexuális distressz',text:`Mind a saját, mind a partneri oldal alacsony elégedettséget mutat. Ez lehet: kapcsolati krízis, funkcionális probléma (nézd meg IIEF/PEDT), vagy súlyosabb depressziós/burnout állapot. Szakmai konzultáció ajánlott.`});
  }
  if(scores.total>=80){
    links.push({label:'Magas elégedettség — protective factor',text:`A szexuális elégedettség statisztikailag prediktor a párkapcsolati stabilitásra és általános jóllétre. Erős védő tényező.`});
  }
  return links;
}
function therapySuggestions(scores){
  const mods=[];
  const ego=scores.EGO, pa=scores.PA;
  if(ego<pa-10){
    mods.push({name:'Saját elégedettség fejlesztése — <em>mindfulness + testi tudatosság</em>',text:`Ha te vagy alacsonyabban, a saját szexuális tapasztalatod fejlesztése a kulcs. Mindfulness-Based Sex Therapy (Brotto), MAIA-2 alapú interoceptív munka, teljesítmény-frame kiiktatása (Sensate Focus).`});
  }
  if(pa<ego-10){
    mods.push({name:'Párkommunikáció — <em>Nagoski + Perel</em>',text:`A partner-oldal alacsonyabb: kommunikációs és relációs munka. Emily Nagoski "Come As You Are" (a stress + kapcsolat rendszerszerű kezelése), Esther Perel "Mating in Captivity" (hosszú távú kapcsolatokban a szex fenntartása). Párterápia indokolt lehet.`});
  }
  if(ego<25 && pa<25){
    mods.push({name:'Multidiszciplináris szexuálterapia',text:`Súlyosan alacsony elégedettség — érdemes szexuálterapeutai konzultáció, esetleg orvosi kivizsgálás (hormonpanel, alap-egészségügyi állapot).`});
  }
  if(scores.total>=80){
    mods.push({name:'Fenntartás — nincs specifikus intervenció',text:`Magas elégedettség — a jelenlegi minta jól szolgál. Fenntartás: rendszeres partneri kommunikáció, közös "learning zone" a kapcsolatban, kölcsönös érdek-artikuláció.`});
  }
  mods.push({name:'Post-breakup kontextus',text:`Ha friss szakítás után vagy, a partneri/aktivitási oldal átmenetileg alacsony lesz (nincs partneri kontextus). Ez nem strukturális elégedetlenség — kontextuális. Érdemes 6-12 hónap múlva újra felvenni.`});
  return mods;
}

/* — motorhoz illesztés: a régi pontozó függvények a nyers válaszokból (responses) számolnak — */
let responses={};
const TX={"res_eyebrow": "Eredmény · NSSS · Értelmezés", "res_title": "A te elégedettségi <em>arányod</em>", "res_lead": "Két pontszámot kapsz — egyet a saját tapasztalatra, egyet a partner/aktivitás oldalra. Az érdekes információ a kettő <em>egyensúlya</em>: ha az egyik markánsan magasabb, ott van élet — ha markánsan alacsonyabb, ott van a nyomás.", "cross": "Kapcsolatok más <em>területekkel</em>", "therapy": "Klinikai <em>következő lépések</em>", "therapy_sub": "Elégedettség-alapú intervenciók", "refs": ["<strong>Štulhofer, A., Buško, V., & Brouillard, P. (2010).</strong> Development and bicultural validation of the New Sexual Satisfaction Scale. <em>Journal of Sex Research, 47(4)</em>, 257–268.", "<strong>Pérez-Fuentes, M. C., Molero Jurado, M. M., et al. (2020).</strong> Analysis of the psychometric properties of the New Sexual Satisfaction Scale in different populations. <em>International Journal of Environmental Research and Public Health, 17</em>, 4247.", "<strong>Mark, K. P., Herbenick, D., Fortenberry, J. D., et al. (2014).</strong> A psychometric comparison of three scales and a single-item measure to assess sexual satisfaction. <em>Journal of Sex Research, 51(2)</em>, 159–169."]};
const HEAD=()=>`<div class="res-eyebrow">${TX.res_eyebrow}</div><h2 class="res-title">${TX.res_title}</h2>${TX.res_lead?`<p class="res-lead">${TX.res_lead}</p>`:''}`;
const REFS=()=>TX.refs.length?H.refs(TX.refs):'';
makeTest({
  id:"nsss",key:"nsss-responses-v1",name:"NSSS",c1:"#d4a017",c2:"#10b981",
  tab:"Elégedettség",tabSub:"NSSS · 20 item",scale:SCALE,
  header:{"status": "valid", "statusText": "Validált eszköz alapján · fordítás tételenként még nem ellenőrzött", "eyebrow": "New Sexual Satisfaction Scale · Štulhofer, Buško & Brouillard (2010)", "title": "A szexuális <em>elégedettséged</em>", "lead": "Az NSSS két, egymástól független elégedettség-forrást mér: <em>Ego-fókuszú</em> elégedettség (a saját tapasztalataid a szex során — érzelmek, testi reakciók, orgazmus minősége) és <em>Partner/Aktivitás-fókuszú</em> elégedettség (a partner viselkedése, a szexuális repertoár, a kapcsolati dinamika). A kettő <em>nem</em> feltétlenül szinkronban van — és ez fontos információ.", "intro": "<p><strong>Kitöltési útmutató:</strong> Gondolj az <em>elmúlt 6 hónap</em> szexuális tapasztalataira. Ha jelenleg nincs partneri szexuális életed, gondolj az utolsó jelentős kapcsolatra, vagy hagyd üresen a partner-kérdéseket. Ilyenkor csak a saját tapasztalat alskála kap eredményt, a partner-alskála és az összpontszám nem.</p>\n      <p>Skála: <strong>1</strong> = nagyon elégedetlen → <strong>5</strong> = nagyon elégedett.</p>"},
  sections:[{title:'',desc:'',items:ITEMS.map(it=>Object.assign({s:it.sub,tag:it.sub==='EGO'?'saját':'partner/aktivitás',t:'Mennyire vagyok elégedett ezzel az elmúlt 6 hónapban: <strong>'+it.t+'</strong>'},it.sub==='EGO'?{}:{optional:'partner-kérdések'}))}],
  ready:r=>ITEMS.filter(it=>it.sub==='EGO').every(it=>r[it.n]!=null),
  partialNote:"A saját tapasztalat kérdései megvannak. Az eredmény most már megnyitható, a partner-kérdések nélkül csak ezt az alskálát értékeljük.",
  score(R){responses={};R.items.forEach(i=>{if(i.raw!==undefined)responses[i.n]=i.raw;});
    if(!paDone()){const ego=scoreSub('EGO'),b=subBand(ego);return {ego,b,oni:{n:'NSSS',h:'Csak az ego-alskála: '+b.label,d:{EGO:['Ego-fókuszú',ego,10,50]},x:{partial:true}}};}
    const scores={EGO:scoreSub('EGO'),PA:scoreSub('PA'),total:scoreTotal()};
    return {scores,oni:{n:'NSSS',h:totalBand(scores.total).label,d:{total:['Szexuális elégedettség',scores.total,20,100],EGO:['Ego-fókuszú',scores.EGO,10,50],PA:['Partner- és aktivitásfókuszú',scores.PA,10,50]}}};
  },
  sum(s){return s.oni;},
  render(R,s){
    if(!s.scores){const ego=s.ego,b=s.b;
      return HEAD()+H.total({label:'NSSS · csak a saját tapasztalat alskála',val:ego,out:'/ 50',band:b.label,color:b.color,desc:'A partner- és aktivitásfókuszú kérdések nem mind kaptak választ, ezért azt az alskálát és az összpontszámot nem számoljuk. A saját tapasztalat alskála önmagában is értelmezhető.'})
        +'<div class="score-grid">'+`<div class="score-card" style="--sc:${b.color}"><div class="abbr">${"Ego-Centered"}</div><div class="sc-h"><em>${"Saját tapasztalat"}</em></div><div class="val">${ego}</div><div class="out">${"/ 50"}</div><div class="band">${b.label}</div><div class="bar"><div class="bar-fill" style="width:${ego/50*100}%"></div></div></div>`+'</div>'
        +H.interp('Lehetséges <em>értelmezés</em>',[{h:`Saját tapasztalat-elégedettség — ${b.label} (${ego}/50)`,color:b.color,html:`<p>${INTERP.EGO[b.key]}</p>`}])
        +H.cross(TX.cross,[],'Keresztmintázat csak mindkét alskálával számolható.')+REFS();}
    const sc=s.scores,tB=totalBand(sc.total);
    return HEAD()+H.total({label:'NSSS összpontszám',val:sc.total,out:'/ 100 · Štulhofer 2010',band:tB.label,color:tB.color,desc:tB.desc})
      +'<div class="score-grid">'+[{k:'EGO',n:'Saját tapasztalat',en:'Ego-Centered',max:50},{k:'PA',n:'Partner/Aktivitás',en:'Partner/Activity-Centered',max:50}].map(dim=>{const v=sc[dim.k],b=subBand(v);return `<div class="score-card" style="--sc:${b.color}"><div class="abbr">${dim.en}</div><div class="sc-h"><em>${dim.n}</em></div><div class="val">${v}</div><div class="out">${"/ "+dim.max}</div><div class="band">${b.label}</div><div class="bar"><div class="bar-fill" style="width:${v/dim.max*100}%"></div></div></div>`;}).join('')+'</div>'
      +H.interp('Klinikai <em>értelmezés</em>',[{h:'Összkép — '+tB.label,color:tB.color,html:`<p>${INTERP.overall[tB.key]}</p>`}].concat([{k:'EGO',n:'Saját tapasztalat-elégedettség'},{k:'PA',n:'Partner/Aktivitás-elégedettség'}].map(dim=>{const v=sc[dim.k],b=subBand(v);return {h:`${dim.n} — ${b.label} (${v}/50)`,color:b.color,html:`<p>${INTERP[dim.k][b.key]}</p>`};})))
      +H.cross(TX.cross,getCrossLinks(sc))+H.therapy(TX.therapy,TX.therapy_sub,therapySuggestions(sc))+REFS();
  }
});
})();

/* ═══════════ 3. SAQ — SZEXUÁLIS TUDATOSSÁG ═══════════ */
(function(){
// Snell, Fisher & Miller (1991) SAQ — 4 subscale × 9 items = 36
const ITEMS = [
  // Sexual Consciousness (SC) — 9
  {n:1, sub:'SC', t:'Nagyon tudatában vagyok a szexuális érzéseimnek.'},
  {n:2, sub:'SC', t:'Éberen figyelem a szexuális érzéseim változásait.'},
  {n:3, sub:'SC', t:'Nagyon tudatában vagyok a szexuális viselkedésemnek.'},
  {n:4, sub:'SC', t:'Azonnal tudom, amikor egy szexuális érzés uralkodik el rajtam.'},
  {n:5, sub:'SC', t:'Gyorsan észreveszem a szexuális érdeklődésem változásait.'},
  {n:6, sub:'SC', t:'Gyakran gondolkodom a szexuális/erotikus érzéseimen.'},
  {n:7, sub:'SC', t:'Tudatában vagyok annak, hogyan működik az elmém, amikor szexuálisan izgatott vagyok.'},
  {n:8, sub:'SC', t:'Sokat reflektálok a szexuális/erotikus érzéseimen.'},
  {n:9, sub:'SC', t:'Szeretem felfedezni a szexuális érzéseimet és gondolataimat.'},
  // Sexual Monitoring (SM) — 9 — THE SPECTATOR MODE
  {n:10, sub:'SM', t:'Aggódom amiatt, hogyan gondolnak rólam mások szexuálisan.'},
  {n:11, sub:'SM', t:'Általában aggódom, hogy jó szexuális benyomást keltsek.'},
  {n:12, sub:'SM', t:'Aggódom, hogyan látnak a szexuális megjelenésemben mások.'},
  {n:13, sub:'SM', t:'Aggódom, mennyire tűnök szexuálisan vonzónak mások szemében.'},
  {n:14, sub:'SM', t:'Mielőtt szexuális kapcsolatba lépnék valakivel, aggódom a teljesítményem miatt.'},
  {n:15, sub:'SM', t:'Aggódom a szexuális viselkedésem miatt.'},
  {n:16, sub:'SM', t:'Mielőtt új partnerrel szexelnék, aggódom, milyen benyomást keltek.'},
  {n:17, sub:'SM', t:'Általában tudatában vagyok a szexuális teljesítményemnek.'},
  {n:18, sub:'SM', t:'Aggódom, hogy a szexuális viselkedésemet mások értékelhetik.'},
  // Sex-Appeal Consciousness (SA) — 9
  {n:19, sub:'SA', t:'Gyorsan érzékelem, ha mások szexuálisan vonzónak találnak.'},
  {n:20, sub:'SA', t:'Általában tudom, ha valaki szexuálisan vonzónak tart.'},
  {n:21, sub:'SA', t:'Gyorsan tudom, ha valaki szexuálisan vonzónak talál.'},
  {n:22, sub:'SA', t:'Általában tudom, ha valaki szexi-nek tart.'},
  {n:23, sub:'SA', t:'Általában odafigyelek a szexuális megjelenésemre.'},
  {n:24, sub:'SA', t:'Éberen figyelem a szexuális vonzerőm változásait.'},
  {n:25, sub:'SA', t:'Általában megpróbálom kitalálni, mennyire vagyok szexuálisan vonzó másoknak.'},
  {n:26, sub:'SA', t:'Néha eltűnődöm, hogy vajon szexuálisan vonzónak találnak-e mások.'},
  {n:27, sub:'SA', t:'Aggódom, hogyan nézek ki egy potenciális szexuális partner számára.'},
  // Sexual Assertiveness (AS) — 9
  {n:28, sub:'AS', t:'Asszertív vagyok az életem szexuális aspektusaiban.'},
  {n:29, sub:'AS', t:'Nem habozom kérni, amit akarok egy szexuális kapcsolatban.'},
  {n:30, sub:'AS', t:'Ha szex van, általában kérem, amit akarok.'},
  {n:31, sub:'AS', t:'Ha valakivel szexelnék, elmondanám a partneremnek, mit szeretek.'},
  {n:32, sub:'AS', t:'Szót emelek a szexuális jogaimért.'},
  {n:33, sub:'AS', t:'Kissé passzív vagyok a szexuális vágyaim kifejezésében.', rev:true},
  {n:34, sub:'AS', t:'Nem habozom közölni a partneremmel, mit akarok szexuálisan.'},
  {n:35, sub:'AS', t:'Asszertíven közelítek meg szexuális helyzeteket.'},
  {n:36, sub:'AS', t:'Általában megyek azért, amit akarok szexuálisan.'}
];
const TOTAL=ITEMS.length;
const SCALE=[{v:1,l:'egyáltalán'},{v:2,l:'inkább nem'},{v:3,l:'semleges'},{v:4,l:'inkább igen'},{v:5,l:'teljesen'}];

function scoreSub(s){
  return ITEMS.filter(it=>it.sub===s).reduce((sum,it)=>{
    const raw=responses[it.n];
    if(raw==null)return sum;
    return sum+(it.rev?(6-raw):raw);
  },0);
}
const SUBSCALES={
  SC:{name:'Szexuális Tudatosság',en:'Sexual Consciousness',color:'#065f46',desc:'Belső, reflexív figyelem a saját szexuális érzelmeidre és gondolataidra. Introspektív dimenzió.'},
  SM:{name:'Szexuális Monitorozás',en:'Sexual Monitoring',color:'#7c2d3c',desc:'Aggodalom afelől, hogyan látnak és értékelnek mások szexuálisan. A kutatásokban a „spectator mode” egyik mérési megközelítése.'},
  SA:{name:'Vonzerő-Tudatosság',en:'Sex-Appeal Consciousness',color:'#b8912e',desc:'Figyelem arra, hogy mennyire tűnsz szexuálisan vonzónak. Kapcsolódhat testképhez, önértékeléshez.'},
  AS:{name:'Szexuális Asszertivitás',en:'Sexual Assertiveness',color:'#1e3a8a',desc:'Képesség a szexuális vágyak, preferenciák, határok kifejezésére a partnerrel szemben.'}
};
function band(s){
  if(s>=36)return{key:'high',label:'Magas',color:null};
  if(s>=27)return{key:'mid',label:'Közepes',color:null};
  if(s>=18)return{key:'low',label:'Alacsony',color:null};
  return{key:'verylow',label:'Nagyon alacsony',color:null};
}
const INTERP = {
  SC:{
    high:`Erős introspektív hozzáférés a saját szexuális belső élményeidhez. Reflektív, öntudatos, önmegértő szexuális karakter. Ez általában pozitív prediktor a szexuális elégedettségre és partneri kommunikációra.`,
    mid:`Közepes szintű tudatosság. Bizonyos szexuális élményeidre reflektálsz, másokra nem.`,
    low:`Alacsony szexuális tudatosság. A szexuális érzéseket "megéled", de nem reflektálsz rájuk aktívan. Nem hiba — de a fejlesztés (journaling, meditáció, terápia) hozhat érzelmi mélységet.`,
    verylow:`Nagyon alacsony szexuális tudatosság. A szexuális élményeidhez való introspektív hozzáférés hiányzik. Ez gyakori alexitímia (TAS-20) és avoidant kötődés esetén.`
  },
  SM:{
    high:`<strong>Magas Sexual Monitoring — aktív spectator mode.</strong> A szex közben (és előtte) folyamatos önmegfigyelés zajlik: "hogyan látszom?", "elég jó vagyok?", "értékel?". Ez a klinikai <em>spectator role</em> pontos képe. Masters & Johnson szerint ez az egyik legerősebb pszichogén erekciós zavar és PE tényező. A cél nem "több kontroll" — hanem a monitorozó rendszer <em>kikapcsolása</em> (mindfulness, Sensate Focus).`,
    mid:`Közepes szintű monitorozás. Bizonyos helyzetekben (új partner, teljesítmény-nyomás alatt) aktiválódik.`,
    low:`Alacsony monitorozás. Szex közben jelen tudsz maradni, nem "kívülről nézed" magad. Ez kedvező profil.`,
    verylow:`Nagyon alacsony monitorozás. A jelenlét szex közben erős — kevés belső "külső szem". Optimális állapot.`
  },
  SA:{
    high:`Éberen figyeled, hogyan látnak mások szexuálisan. Ez lehet egészséges kompetencia-érzés vagy szorongás-alapú monitorozás (átfed az SM-mel). Ha SM is magas → szorongásos átfedés; ha SM alacsony → egészséges kompetencia.`,
    mid:`Közepes szintű figyelem a vonzerőre.`,
    low:`Kevéssé figyelsz arra, hogyan látnak szexuálisan mások. Ez lehet: szolid önbizalom, vagy elzárkózás/nem-érdek. Kontextusfüggő.`,
    verylow:`Szinte nem figyelsz a szexuális megjelenésre. Ha ez distresszt nem okoz, egyszerűen alacsony ez a dimenzió — nem hiba.`
  },
  AS:{
    high:`Erős szexuális asszertivitás. Kifejezed a vágyaidat, határokat, preferenciákat. Ez pozitív bejósló a partneri szexuális elégedettségre — ha a partner is asszertív, konstruktív dinamika.`,
    mid:`Közepes szintű asszertivitás. Bizonyos helyzetekben tudsz kérni, másokban nem.`,
    low:`Alacsony asszertivitás. A vágyaidat, preferenciáidat nem, vagy alig kommunikálod. Ez gyakori compliant surrender (SMI) profilnál — a "másokat elrontok, ha kérek" gondolat aktív.`,
    verylow:`Nagyon alacsony asszertivitás. A szexuális helyzetekben passzív pozíció — a partner "vezet", te "engedelmeskedsz". Fontos: <em>ez nem preferencia-kérdés</em> (D/s dinamikák ettől függetlenek), hanem <em>képesség-kérdés</em>: tudsz-e egyáltalán kérni, ha akarnál.`
  }
};
function getCrossLinks(scores){
  const links=[];
  if(scores.SM>=32){
    links.push({label:'Magas Monitoring → IIEF-15 EF-domén megnézése',text:`Aktív spectator mode klinikailag korrelál pszichogén erekciós zavarral. Ha nem töltötted még ki az IIEF-15-öt, most érdemes.`});
    links.push({label:'SIS/SES: érdemes a SIS1-et is megnézni',text:`A Sexual Monitoring és a SIS1 (Sexual Inhibition — teljesítmény-fenyegetés) rokon jelenséget mérnek különböző szögből. Ha kitöltötted a SIS/SES-t, nézd meg, nálad is magasabb-e a SIS1.`});
  }
  if(scores.AS<=18 && scores.SM>=27){
    links.push({label:'Alacsony asszertivitás + magas monitorozás — compliant szexuális profil',text:`Nem mered kifejezni a vágyaidat + folyamatos aggodalom, hogyan látnak — ez a mások elvárásaihoz igazodó (<em>people-pleaser</em>) mintára utalhat. Tisztázó kérdés: mikor mondtad ki utoljára, mit szeretnél? Az SMI alávető módja kiegészítő szempontot adhat.`});
  }
  if(scores.SC>=36 && scores.SM<=18){
    links.push({label:'Egészséges introspektív profil',text:`Magas tudatosság + alacsony monitorozás = reflektálsz magadra, de nem szorongsz mások értékelése miatt. A legegészségesebb konfiguráció.`});
  }
  if(scores.SC<=18){
    links.push({label:'TAS-20 megnézése — alexitímia szűrés',text:`Alacsony szexuális tudatosság gyakran együtt jár általános alexitímiával. Nézd meg a TAS-20-at, különösen a DIF alskálát.`});
  }
  if(scores.AS<=18){
    links.push({label:'Kötődési profil — ECR-R',text:`Alacsony szexuális asszertivitás gyakori szorongásos kötődésnél (fear of losing partner if I ask) és elkerülő kötődésnél (nem szoktam kérni semmit). Nézd meg az ECR-R-t.`});
  }
  return links;
}
function therapySuggestions(scores){
  const mods=[];
  if(scores.SM>=32){
    mods.push({name:'Sensate Focus — <em>a spectator mode kikapcsolása</em>',text:`A Sexual Monitoring csökkentésének aranystandardja. Strukturált gyakorlatok, ahol a "teljesítmény-frame" tilos — csak érintés az érintésért. 6-8 hét alatt jelentős csökkentés lehetséges.`});
    mods.push({name:'Mindfulness-Based Sex Therapy — <em>Brotto</em>',text:`Kifejezetten a szex közbeni "elme kilépés" (spectator mode) csökkentésére. Empirikusan validált — pszichogén ED-nél, PE-nél, alacsony vágynál mind hatásos.`});
  }
  if(scores.AS<=18){
    mods.push({name:'Szexuális asszertivitás-tréning',text:`Strukturált gyakorlatok a szexuális kommunikációra: (1) belső "vágy-térkép" (mi az, amit szeretnék?); (2) verbális kifejezés próbája biztonságos kontextusban (leírás → hangosan kimondás → partnerrel megosztás). Rachman & Marks: expozíció-alapú modell működik.`});
  }
  if(scores.SC<=18){
    mods.push({name:'Journaling + testi tudatosság',text:`Alacsony szexuális tudatossághoz: napi 1-2 perc "mi történik bennem szexuálisan?" reflexió. Feelings Wheel + testi tudatosság (MAIA-2 alapú gyakorlatok). Lassú építkezés.`});
  }
  if(scores.SC>=36 && scores.SM<=18 && scores.AS>=27){
    mods.push({name:'Fenntartás — érett szexuális tudatossági profil',text:`Kiegyensúlyozott, egészséges profil. Fenntartás: rendszeres önreflexió, partneri kommunikáció, folyamatos "learning zone".`});
  }
  mods.push({name:'Pszichoedukáció: <em>Masters & Johnson spectator role</em>',text:`Az eredeti "spectator role" fogalom megismerése (1970 · Human Sexual Inadequacy) önmagában sokat segít. Nem "gyengeség" vagy "hiba" — hanem egy jól leírt jelenség, aminek van kezelése.`});
  return mods;
}

/* — motorhoz illesztés: a régi pontozó függvények a nyers válaszokból (responses) számolnak — */
let responses={};
const TX={"res_eyebrow": "Eredmény · SAQ · 4 alskála · Értelmezés", "res_title": "A te szexuális <em>tudatossági profilod</em>", "res_lead": "A négy alskála egymástól független. A klinikailag legfontosabb a <strong>Sexual Monitoring</strong> — ez a spectator mode. A többi három inkább karakterjegy, mint patológia-jelző.", "cross": "Kapcsolatok más <em>területekkel</em>", "therapy": "Klinikai <em>következő lépések</em>", "therapy_sub": "Ha a spectator mode aktív", "refs": ["<strong>Snell, W. E., Jr., Fisher, T. D., & Miller, R. S. (1991).</strong> Development of the Sexual Awareness Questionnaire: Components, reliability, and validity. <em>Annals of Sex Research, 4</em>, 65–92.", "<strong>Snell, W. E., Jr. (1998).</strong> The Multidimensional Sexual Self-Concept Questionnaire. In C. M. Davis, W. L. Yarber, R. Bauserman, G. Schreer, & S. L. Davis (Eds.), <em>Handbook of sexuality-related measures</em>.", "<strong>Masters, W. H., & Johnson, V. E. (1970).</strong> Human Sexual Inadequacy. — A \"spectator role\" fogalmának eredete.", "<strong>van Lankveld, J. J., et al. (2014).</strong> Attentional processes in sexual arousal and dysfunction. <em>Journal of Sex Research, 51(2)</em>, 191–210."]};
const HEAD=()=>`<div class="res-eyebrow">${TX.res_eyebrow}</div><h2 class="res-title">${TX.res_title}</h2>${TX.res_lead?`<p class="res-lead">${TX.res_lead}</p>`:''}`;
const REFS=()=>TX.refs.length?H.refs(TX.refs):'';
makeTest({
  id:"saq",key:"saq-responses-v1",name:"SAQ",c1:"#10b981",c2:"#2563eb",
  tab:"Tudatosság",tabSub:"SAQ · 36 item",scale:SCALE,
  header:{"status": "valid", "statusText": "Validált eszköz alapján · fordítás tételenként még nem ellenőrzött", "eyebrow": "Sexual Awareness Questionnaire · Snell, Fisher & Miller (1991)", "title": "Szexuális <em>tudatosság</em>", "lead": "A SAQ négy különböző módot mér, ahogy magadra és a szexualitásodra <em>figyelsz</em>: (I) <em>Consciousness</em> — belső, reflexív figyelem a saját szexuális élményeidre; (II) <em>Monitoring</em> — mit gondolnak <strong>rólad</strong> mások szexuálisan (ez a <em>spectator mode</em> egyik mérési megközelítése); (III) <em>Sex-Appeal Consciousness</em> — figyelem arra, mennyire vagy vonzó; (IV) <em>Assertiveness</em> — asszertivitás a szexuális vágyaid kifejezésében.", "intro": "<p><strong>Kitöltési útmutató:</strong> 36 állítást olvasol. Mindegyiknél értékeld 1–5 skálán, mennyire igaz rád <em>általában</em>.</p>\n      <p><strong>Klinikai különös figyelem:</strong> A <em>Sexual Monitoring</em> alskála a \"spectator mode\" jelenség pontos mérése — a magas érték itt közvetlenül összefügg a szexuális teljesítmény-szorongással, erekciós zavarral (pszichogén), és a szex \"kívülről szemlélésének\" tapasztalatával.</p>"},
  sections:[{title:'',desc:'',items:ITEMS.map(it=>({s:it.sub,t:it.t}))}],
  score(R){responses={};R.items.forEach(i=>{if(i.raw!==undefined)responses[i.n]=i.raw;});
    const scores={SC:scoreSub('SC'),SM:scoreSub('SM'),SA:scoreSub('SA'),AS:scoreSub('AS')};
    return {scores,oni:{n:'SAQ',d:Object.fromEntries(['SC','SM','SA','AS'].map(k=>[k,[SUBSCALES[k].name,scores[k],9,45]]))}};
  },
  sum(s){return s.oni;},
  render(R,s){
    const sc=s.scores;
    return HEAD()+'<div class="score-grid">'+['SC','SM','SA','AS'].map(k=>{const v=sc[k],m=SUBSCALES[k],b=band(v);return `<div class="score-card" style="--sc:${m.color}"><div class="abbr">${k+" · "+m.en}</div><div class="sc-h"><em>${m.name}</em></div><div class="val">${v}</div><div class="out">${"/ 45 · 9 item"}</div><div class="band">${b.label}</div><div class="bar"><div class="bar-fill" style="width:${v/45*100}%"></div></div></div>`;}).join('')+'</div>'
      +H.interp('Klinikai <em>értelmezés</em>',['SC','SM','SA','AS'].map(k=>{const v=sc[k],m=SUBSCALES[k],b=band(v);return {h:`${m.name} — ${b.label} (${v}/45)`,color:m.color,html:`<p style="font-size:13px;color:var(--ink-lite-muted);margin-bottom:8px;font-style:italic">${m.desc}</p><p>${INTERP[k][b.key]}</p>`};}))
      +H.cross(TX.cross,getCrossLinks(sc))+H.therapy(TX.therapy,TX.therapy_sub,therapySuggestions(sc))+REFS();
  }
});
})();
