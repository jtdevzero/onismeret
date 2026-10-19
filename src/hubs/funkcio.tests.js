/* funkcio hub — a kézzel írt funkcio.html-ből átköltöztetve. A pontozó és az eredményoldal-kód változatlan. */

/* ═══════════ 1. IIEF-15 — EREKCIÓS FUNKCIÓ ═══════════ */
(function(){
let document=window.document;   /* a régi kód ezen keresztül éri el a DOM-ot; kiértékeléskor egy leválasztott darabra mutat */
// Skálák tételenként
const SCALES = {
  freq5:[{v:0,l:'nem próbáltam'},{v:1,l:'szinte soha'},{v:2,l:'ritkán'},{v:3,l:'körülbelül fele'},{v:4,l:'többször'},{v:5,l:'majdnem mindig'}],
  diff5:[{v:0,l:'nem próbáltam'},{v:1,l:'rendkívül nehéz'},{v:2,l:'nagyon nehéz'},{v:3,l:'nehéz'},{v:4,l:'kissé nehéz'},{v:5,l:'nem nehéz'}],
  conf5:[{v:1,l:'nagyon alacsony'},{v:2,l:'alacsony'},{v:3,l:'közepes'},{v:4,l:'magas'},{v:5,l:'nagyon magas'}],
  attempt:[{v:0,l:'nem próbáltam'},{v:1,l:'1–2 alkalom'},{v:2,l:'3–4 alkalom'},{v:3,l:'5–6 alkalom'},{v:4,l:'7–10 alkalom'},{v:5,l:'11+ alkalom'}],
  satis5:[{v:0,l:'nem próbáltam'},{v:1,l:'szinte soha'},{v:2,l:'néha'},{v:3,l:'körülbelül fele'},{v:4,l:'többször'},{v:5,l:'majdnem mindig'}],
  enjoy5:[{v:0,l:'nem volt közösülés'},{v:1,l:'nem élveztem'},{v:2,l:'nem élveztem különösebben'},{v:3,l:'közepesen'},{v:4,l:'nagyon élveztem'},{v:5,l:'rendkívül élveztem'}],
  desirefreq5:[{v:1,l:'szinte soha'},{v:2,l:'ritkán'},{v:3,l:'körülbelül fele'},{v:4,l:'többször'},{v:5,l:'majdnem mindig'}],
  desirelevel5:[{v:1,l:'nagyon alacsony'},{v:2,l:'alacsony'},{v:3,l:'közepes'},{v:4,l:'magas'},{v:5,l:'nagyon magas'}],
  satisov5:[{v:1,l:'nagyon elégedetlen'},{v:2,l:'elégedetlen'},{v:3,l:'közepesen elégedett'},{v:4,l:'elégedett'},{v:5,l:'nagyon elégedett'}]
};
// 15 item
const ITEMS = [
  {n:1, dom:'EF', scale:'freq5', context:'Az elmúlt 4 hétben...', t:'Milyen gyakran tudtál merevedést elérni szexuális aktivitás közben?'},
  {n:2, dom:'EF', scale:'freq5', context:'Az elmúlt 4 hétben szexuális stimuláció esetén...', t:'Merevedéseid milyen gyakran voltak elegendőek a behatoláshoz?'},
  {n:3, dom:'EF', scale:'freq5', context:'Az elmúlt 4 hétben, amikor behatolást próbáltál...', t:'Milyen gyakran tudtál behatolni?'},
  {n:4, dom:'EF', scale:'freq5', context:'Az elmúlt 4 hétben közösülés közben...', t:'Milyen gyakran tudtad fenntartani a merevedést a behatolás után?'},
  {n:5, dom:'EF', scale:'diff5', context:'Az elmúlt 4 hétben közösülés közben...', t:'Mennyire volt nehéz fenntartani a merevedést a közösülés befejezéséig?'},
  {n:6, dom:'IS', scale:'attempt', context:'Az elmúlt 4 hétben...', t:'Hányszor kíséreltél meg szexuális közösülést?'},
  {n:7, dom:'IS', scale:'satis5', context:'Az elmúlt 4 hétben, amikor közösülést próbáltál...', t:'Milyen gyakran volt kielégítő számodra?'},
  {n:8, dom:'IS', scale:'enjoy5', context:'Az elmúlt 4 hétben...', t:'Mennyire élvezted a szexuális közösülést?'},
  {n:9, dom:'OF', scale:'freq5', context:'Az elmúlt 4 hétben szexuális stimuláció vagy közösülés közben...', t:'Milyen gyakran ejakuláltál?'},
  {n:10, dom:'OF', scale:'freq5', context:'Az elmúlt 4 hétben szexuális stimuláció vagy közösülés közben...', t:'Milyen gyakran volt orgazmusod (ejakulációval vagy anélkül)?'},
  {n:11, dom:'SD', scale:'desirefreq5', context:'Az elmúlt 4 hétben...', t:'Milyen gyakran éreztél szexuális vágyat?'},
  {n:12, dom:'SD', scale:'desirelevel5', context:'Az elmúlt 4 hétben...', t:'Hogyan jellemeznéd a szexuális vágyad szintjét?'},
  {n:13, dom:'OS', scale:'satisov5', context:'Az elmúlt 4 hétben...', t:'Mennyire voltál elégedett a szexuális életeddel összességében?'},
  {n:14, dom:'OS', scale:'satisov5', context:'Az elmúlt 4 hétben...', t:'Mennyire voltál elégedett a partneri szexuális kapcsolatoddal?'},
  {n:15, dom:'EF', scale:'conf5', context:'Az elmúlt 4 hétben...', t:'Mennyire voltál biztos abban, hogy meg tudod szerezni és fenntartani a merevedést?'}
];
const TOTAL = ITEMS.length;

function scoreDomain(dom){return ITEMS.filter(it=>it.dom===dom).reduce((s,it)=>s+(responses[it.n]||0),0);}
const DOMAINS = {
  EF:{name:'Erekciós Funkció',en:'Erectile Function',max:30,items:6},
  OF:{name:'Orgazmusfunkció',en:'Orgasmic Function',max:10,items:2},
  SD:{name:'Szexuális Vágy',en:'Sexual Desire',max:10,items:2},
  IS:{name:'Közösülési Elégedettség',en:'Intercourse Satisfaction',max:15,items:3},
  OS:{name:'Általános Elégedettség',en:'Overall Satisfaction',max:10,items:2}
};
// EF classification (Cappelleri 1999)
function efBand(score){
  if(score>=26)return{key:'none',label:'Nincs ED',color:'#065f46',desc:'26–30 · Erekciós funkció normál tartományban'};
  if(score>=22)return{key:'mild',label:'Enyhe ED',color:'#84cc16',desc:'22–25 · Enyhe erekciós zavar'};
  if(score>=17)return{key:'mildmod',label:'Enyhe-közepes ED',color:'#b8912e',desc:'17–21 · Enyhe-közepes erekciós zavar'};
  if(score>=11)return{key:'mod',label:'Közepes ED',color:'#c97a4a',desc:'11–16 · Közepes erekciós zavar'};
  return{key:'severe',label:'Súlyos ED',color:'#7c2d3c',desc:'6–10 · Súlyos erekciós zavar'};
}
function subBand(dom, score){
  const meta = DOMAINS[dom], pct = score/meta.max;
  if(pct>=0.8)return{key:'high',label:'Magas',color:'#065f46'};
  if(pct>=0.6)return{key:'good',label:'Jó',color:'#84cc16'};
  if(pct>=0.4)return{key:'mid',label:'Közepes',color:'#b8912e'};
  if(pct>=0.2)return{key:'low',label:'Alacsony',color:'#c97a4a'};
  return{key:'verylow',label:'Nagyon alacsony',color:'#7c2d3c'};
}
const INTERP = {
  EF:{
    none:`Az erekciós funkciód a normál tartományban. Ha jelen van valamilyen distressz vagy specifikus szituációs nehézség (pl. új partner, teljesítmény-szorongás), az inkább szituációs, mint funkcionális.`,
    mild:`Enyhe erekciós zavar tartomány. Ez a leggyakoribb kategória felnőtt férfiaknál — nem klinikai vészjelzés. <strong>Első lépés:</strong> orvosi alap-check (koleszterin, vércukor, tesztoszteron, gyógyszer-lista áttekintés) — az érrendszeri és metabolikus tényezők itt gyakran korrigálhatók.`,
    mildmod:`Enyhe-közepes erekciós zavar. Klinikai relevancia. <strong>Orvosi kivizsgálás indokolt</strong> (urológia + belgyógyászat: kardiovaszkuláris rizikó, endokrin panel). A pszichoszociális tényezők (teljesítmény-szorongás, kapcsolati distressz, spectator mode) többnyire <em>társulnak</em> — az elsődleges kezelés kombinált (organikus + pszichogén).`,
    mod:`Közepes súlyosságú erekciós zavar. <strong>Érdemes orvossal átbeszélni.</strong> Az érrendszeri kockázat itt már statisztikailag jelentős — az ED gyakran <em>korai jelzője</em> a koronária-betegségeknek (5–10 évvel megelőzheti). Kezelési opciók: PDE5-inhibitorok (Viagra/Cialis) hatásosak lehetnek, kombinálva a háttér-tényezők kezelésével.`,
    severe:`Súlyos erekciós zavar. <strong>Sürgős orvosi konzultáció javasolt.</strong> Az érrendszeri kivizsgálás nem halasztható. A pszichogén (situational) és organikus (mindig-jelen) elkülönítése kulcs — reggeli erekciók jelenléte pszichogén profilra utal, hiánya organikusra. A kezelési paletta széles: gyógyszeres, injekciós, vákuumpumpa, protézis; a legtöbb esetben jelentős javulás elérhető.`
  }
};
function getCrossLinks(scores){
  const ef=scores.EF, sd=scores.SD, os=scores.OS, is=scores.IS;
  const links=[];
  if(ef<22 && sd>=7){
    links.push({label:'Van vágy, de nehezebb az erekció',text:`Magas SD + alacsony EF mellett szituációs vagy lelki tényezők is szerepet játszhatnak, de ezt orvosi szempontból is érdemes megnézni (a rendszered akar, de nem tud "átkapcsolni"). Ez SIS/SES-en <strong>magas SIS1</strong> (teljesítmény-gátlás) képében jelenik meg. Reggeli erekciók jelenléte + önkielégítéskor működő funkció megerősíti ezt.`});
  }
  if(ef<22 && sd<=5){
    links.push({label:'Alacsony vágy + alacsony erekció — endokrin/depresszió is szóba jön',text:`Az együttes csökkenés <strong>tesztoszteron-hiány</strong>, hipogonadizmus, vagy súlyosabb depresszió jelzője lehet. Hormonpanel (össz-teszt, szabad-teszt, SHBG, prolaktin) érdemes.`});
  }
  if(is<8 && ef>=22){
    links.push({label:'Funkció rendben, elégedettség alacsony — pszichológiai/relációs',text:`Ha az EF megfelelő, de az IS és OS alacsony, a kérdés nem az erekció, hanem a <em>szex minősége és kontextusa</em>. Sensate Focus, párterápia, ECR-R felvétele érdemes.`});
  }
  if(ef<22 && os<=4){
    links.push({label:'ECR-R felvétele — kötődési biztonság ellenőrzése',text:`Alacsony EF + alacsony összelégedettség profilnál érdemes a kötődési profilt is megnézni (ECR-R): a kapcsolati distresz és a szexuális működés között kétirányú összefüggés van.`});
  }
  links.push({label:'SIS/SES kapcsolat',text:`Ha még nem töltötted ki, a SIS/SES árnyaltabb képet ad: milyen a "fék" (SIS1/SIS2) versus "gáz" (SES) arányod. Ez különösen fontos pszichogén ED gyanújánál.`});
  return links;
}
function therapySuggestions(scores){
  const ef=scores.EF;
  const mods=[];
  if(ef<22){
    mods.push({name:'Urológiai kivizsgálás — <em>első lépés</em>',text:`Vaszkuláris állapotfelmérés (Doppler UH ha indokolt), hormonpanel, gyógyszerlista áttekintése. Az ED gyakran <strong>korai kardiovaszkuláris jelzés</strong> — a szűrés önmagában is életmentő lehet.`});
  }
  if(ef<22){
    mods.push({name:'PDE5-inhibitor próba (Viagra/Cialis) — <em>orvosi javaslatra</em>',text:`Az EF domén 22 alatti értékénél a farmakoterápia gyakran gyors első segítség — a "sikerélmény" újraindítja a rendszert. NEM helyettesíti a háttér-vizsgálatot. Nitráttal vagy adott alfa-blokkolóval kombinálva ellenjavallt — orvos írja fel.`});
  }
  if(ef>=17){
    mods.push({name:'Sensate Focus (Masters & Johnson)',text:`Ha van pszichogén komponens, a Sensate Focus a nemzetközileg legjobban dokumentált viselkedéses intervenció. Strukturált érintkezéses gyakorlatok, kifejezetten a teljesítmény-frame kiiktatására. Párkapcsolati vagy önállóan is végezhető.`});
    mods.push({name:'Mindfulness-Based Sex Therapy — <em>Brotto</em>',text:`Kognitív elterelődés ("spectator mode") csökkentésére. Különösen hatékony, ha a "figyelem az izgalomtól elszakad" tapasztalatod van szex közben.`});
  }
  if(ef<11){
    mods.push({name:'Multidiszciplináris megközelítés',text:`Súlyos ED-nél optimális az urológia + endokrin + pszichológia együttes bevonása. A modern klinikai algoritmusok kombinált terápiát alkalmaznak.`});
  }
  mods.push({name:'Életmód-tényezők',text:`Aerob mozgás (heti 3× 30 perc), alvás minőség, alkohol- és nikotinfogyasztás csökkentése bizonyítottan javít az EF-en. Nem "csak jó tanács" — direkt vaszkuláris hatás.`});
  return mods;
}

/* — motorhoz illesztés —
   A régi eredményoldal-kód (__oldRender) változatlanul fut egy leválasztott DOM-darabon, a régi
   eredmény-sablonnal; a mentést (ONI.save) elkapjuk és a motor végzi. */
let responses={};
const RES_HTML="<div class=\"res-eyebrow\">Eredmény · IIEF-15 profil · Klinikai kontextus</div>\n      <h2 class=\"res-title\">A te <em>erekciós profilod</em></h2>\n      <p class=\"res-lead\">Az öt domén pontszáma külön-külön értékelendő. A klinikailag legjobban validált küszöb az Erekciós Funkció (EF) skálára van — az orgazmus, vágy, elégedettség kiegészítő információt ad.</p>\n      <div class=\"total-card\" id=\"iief-totalCard\"></div>\n      <div class=\"scores-grid\" id=\"iief-scoresGrid\"></div>\n      <div class=\"interp-card\" id=\"iief-interpCard\"></div>\n      <div class=\"cross-card\"><h3>Kapcsolatok más <em>területekkel</em></h3><div id=\"iief-cross-links\"></div></div>\n      <div class=\"therapy-card\"><h3>Klinikai <em>következő lépések</em></h3><div class=\"sub\">Orvosi + pszichológiai kombinációk</div><div id=\"iief-therapy-suggestions\"></div></div>\n      <div class=\"refs-card\"><h3>Tudományos <em>háttér</em></h3>\n        <div class=\"ref-item\"><strong>Rosen, R. C., Riley, A., Wagner, G., et al. (1997).</strong> The international index of erectile function (IIEF): a multidimensional scale for assessment of erectile dysfunction. <em>Urology, 49(6)</em>, 822–830.</div>\n        <div class=\"ref-item\"><strong>Cappelleri, J. C., Rosen, R. C., Smith, M. D., et al. (1999).</strong> Diagnostic evaluation of the erectile function domain of the International Index of Erectile Function. <em>Urology, 54(2)</em>, 346–351.</div>\n        <div class=\"ref-item\"><strong>Salonia, A., Bettocchi, C., Boeri, L., et al. (2021).</strong> European Association of Urology Guidelines on Sexual and Reproductive Health.</div>\n      </div>";
function __oldRender(){
  const scores={};
  ['EF','OF','SD','IS','OS'].forEach(d=>{scores[d]=scoreDomain(d);});
  try{__cap({n:'IIEF-15',h:'Erekciós funkció: '+efBand(scores.EF).label,d:Object.fromEntries(['EF','OF','SD','IS','OS'].map(k=>[k,[DOMAINS[k].name,scores[k],0,DOMAINS[k].max]]))});}catch(e){console.warn('ONI',e)}
  const efB=efBand(scores.EF);
  const tc=document.getElementById('iief-totalCard');
  tc.style.setProperty('--band-color', efB.color);
  tc.innerHTML=`<div class="total-label">Erekciós Funkció domén · elsődleges pontszám</div><div class="total-value">${scores.EF}</div><div class="total-out">/ 30 · Cappelleri (1999) kategorizálás</div><div class="total-band" style="background:${efB.color}">${efB.label}</div><p style="color:var(--ink-soft);font-size:14px;margin-top:16px;line-height:1.6">${efB.desc}</p>`;
  let scHtml='';
  ['EF','OF','SD','IS','OS'].forEach(d=>{
    const meta=DOMAINS[d], s=scores[d], band=subBand(d,s), pct=(s/meta.max)*100;
    scHtml+=`<div class="score-card" style="--sc:${band.color}"><div class="abbr">${d} · ${meta.en}</div><div class="sc-h"><em>${meta.name}</em></div><div class="val">${s}</div><div class="out">/ ${meta.max}</div><div class="band">${band.label}</div><div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div></div>`;
  });
  document.getElementById('iief-scoresGrid').innerHTML=scHtml;
  let interp=`<h3>Klinikai <em>értelmezés</em></h3><div class="interp-section" style="--sc:${efB.color}"><h4>Erekciós Funkció — ${efB.label}</h4><p>${INTERP.EF[efB.key]}</p></div>`;
  document.getElementById('iief-interpCard').innerHTML=interp;
  const links=getCrossLinks(scores);
  document.getElementById('iief-cross-links').innerHTML=links.map(l=>`<div class="cross-item"><div class="cross-item-label">${l.label}</div><p>${l.text}</p></div>`).join('');
  const mods=therapySuggestions(scores);
  document.getElementById('iief-therapy-suggestions').innerHTML=mods.map(m=>`<div class="therapy-mod"><div class="therapy-mod-name">${m.name}</div><p>${m.text}</p></div>`).join('');
  document.getElementById('iief-results').classList.add('visible');
  setTimeout(()=>{document.getElementById('iief-results').scrollIntoView({behavior:'smooth',block:'start'});},100);
}
function __run(){
  let payload=null;const __cap=p=>{payload=p;};
  const box=window.document.createElement('div');box.innerHTML='<div id="iief-results">'+RES_HTML+'</div>';
  const fake={getElementById:id=>box.querySelector('#'+CSS.escape(id)),querySelector:s=>box.querySelector(s),querySelectorAll:s=>box.querySelectorAll(s),createElement:(...a)=>window.document.createElement(...a)};
  const real=document;document=fake;window.__cap=__cap;try{__oldRender();}finally{document=real;delete window.__cap;}
  return {oni:payload,html:box.firstChild.innerHTML};
}
makeTest({
  id:"iief",key:"iief-responses-v1",name:"IIEF-15",c1:"#2563eb",c2:"#10b981",
  tab:"Erekciós funkció",tabSub:"IIEF-15 · 15 item",scale:[],
  header:{"status": "valid", "statusText": "Validált eszköz alapján · fordítás tételenként még nem ellenőrzött", "eyebrow": "International Index of Erectile Function · Rosen et al. (1997)", "title": "Erekciós <em>funkció</em>", "lead": "Az IIEF-15 a férfi szexuális válaszrendszer 5 dimenzióját méri: <em>erekció</em>, <em>orgazmus</em>, <em>vágy</em>, <em>közösülési elégedettség</em>, <em>általános elégedettség</em>. Az elmúlt 4 hetes időszakra kérdez rá. A klinikai gyakorlatban ez a legelterjedtebb önbevallott szexuális funkcionális műszer.", "intro": "<p><strong>Kitöltés:</strong> Válaszaid az <em>elmúlt 4 hét</em> tapasztalataira vonatkozzanak. A skálák tételenként változnak — figyeld a válaszlehetőségek szövegét.</p>"},
  sections:[{title:'',desc:'',items:ITEMS.map(it=>({s:it.dom,tag:it.dom,scale:SCALES[it.scale],t:(it.context?'<span class="q-context">'+it.context+'</span>':'')+it.t}))}],
  score(R){responses={};R.items.forEach(i=>{if(i.raw!==undefined)responses[i.n]=i.raw;});return __run();},
  sum(s){return s.oni;},
  render(R,s){return s.html;}
});
})();

/* ═══════════ 2. PEDT — IDŐZÍTÉS ═══════════ */
(function(){
let document=window.document;   /* a régi kód ezen keresztül éri el a DOM-ot; kiértékeléskor egy leválasztott darabra mutat */
const LIKERT = [{v:0,l:'egyáltalán nem'},{v:1,l:'kissé'},{v:2,l:'közepesen'},{v:3,l:'nagyon'},{v:4,l:'rendkívül'}];
const ITEMS = [
  {n:1, t:'Nehéznek találod-e késleltetni az ejakulációt?'},
  {n:2, t:'Előbb ejakulálsz, mint szeretnéd?'},
  {n:3, t:'Nagyon kis stimulációra ejakulálsz?'},
  {n:4, t:'Frusztráltnak érzed magad az ejakuláció időzítése miatt?'},
  {n:5, t:'Mennyire aggódsz amiatt, hogy a partneredet nem elégíted ki szexuálisan, mert túl gyorsan ejakulálsz?'}
];
const TOTAL=ITEMS.length;

function scoreTotal(){return ITEMS.reduce((s,it)=>s+(responses[it.n]||0),0);}
function band(score){
  if(score<=8)return{key:'none',label:'Nincs PE',color:'#065f46',desc:'Nem PE tartomány'};
  if(score<=10)return{key:'possible',label:'Valószínű PE',color:'#b8912e',desc:'Határeset — érdemes klinikai konzultáció'};
  return{key:'yes',label:'PE',color:'#7c2d3c',desc:'PE-tartomány — klinikai jelentőség'};
}
const INTERP = {
  none:`A PEDT nem jelez korai magömlést. Ha van distressz vagy időzítési aggodalmad, az inkább <em>észlelési</em> vagy szituációs, nem funkcionális. A <strong>2 perc alatti intravaginális latencia</strong> önmagában nem PE — a kontroll és a distressz együtt kell.`,
  possible:`Határérték körüli pontszám. Nem klinikai küszöb, de vannak jelek. Két lehetőség: (1) <em>lifelong</em> mintázat, ami mindig ilyen volt — biológiai/neurológiai; (2) <em>acquired</em>, ami az elmúlt hónapokban alakult ki — gyakran pszichogén, gyógyszer-mellékhatás, vagy társult ED. Érdemes urológust vagy szexuálterapeutát felkeresni.`,
  yes:`<strong>PE tartomány.</strong> A DSM-5 kritériumai a PEDT-vel közel esnek: ~1 perc alatti latencia + kontroll-hiány + distressz. Két típus különítendő el: <em>lifelong</em> (mindig ilyen, gyakran biológiai — szerotonerg tónus, a pénisz fokozott érzékenysége) és <em>acquired</em> (későbbi kialakulású, gyakran ED-vel társult, teljesítmény-szorongás, kapcsolati distressz). <strong>A kezelés kombinált</strong>: farmakológia (SSRI, dapoxetin, lokális anesztetikum) + viselkedéses (start-stop, squeeze) + kapcsolati intervenciók.`
};
function getCrossLinks(scores){
  const s=scoreTotal();
  const links=[];
  if(s>=9){
    links.push({label:'IIEF-15 kombinált értékelés (I. tab)',text:`PE gyakran társul ED-vel: az ED-vel élő férfiak azt kompenzálva sietősen fejezik be. Nézd meg az EF domént az I. tabon — ha az is 22 alatt, kombinált (két problémás) kezelés indokolt.`});
    links.push({label:'SIS/SES: érdemes a SIS1-et is megnézni',text:`A PE gyakran együtt jár magas <em>SIS1</em> (teljesítmény-gátlás) pontszámmal a Bancroft-modellben. A "mi lesz, ha túl gyorsan..." aggodalom önmagában felgyorsítja az ejakulációt. Ez terápiásan a Sensate Focus fő célpontja.`});
    links.push({label:'ECR-R: szorongásos kötődés hozzájáruló',text:`Anxiously-preoccupied kötődési profilnál a "vajon elég vagyok" folyamatos monitorozása szomatikusan időzítés-problémaként manifesztálódhat. A kötődési munka indirekt PE-csökkentő hatású.`});
  }
  return links;
}
function therapySuggestions(scores){
  const s=scoreTotal();
  const mods=[];
  if(s<=8){
    mods.push({name:'Nincs specifikus intervenciós javaslat',text:`A PEDT nem jelez klinikailag jelentős PE-t. Ha van szubjektív időzítési aggodalmad, érdemes a <em>partneri kommunikációt</em> és a <em>tempó-tudatosságot</em> megnézni, nem a "gyógyítást".`});
    return mods;
  }
  mods.push({name:'Start-stop és squeeze technikák — <em>viselkedéses alapok</em>',text:`Semans (1956) és Masters & Johnson módszerei. Strukturált gyakorlás: a stimuláció leállítása "point of no return" közelében, majd folytatás. Néhány hét alatt jelentős latencia-növelést hozhat. Partneri gyakorlás előnyben, de szóló is elkezdhető.`});
  mods.push({name:'Lokális anesztetikum spray — <em>orvosi javaslatra</em>',text:`Lidokain/prilokain spray-k (pl. Fortacin) hatásosak, a szenzoros bemenetet csökkentik. Kondommal ajánlott — enélkül a partneri szenzáció is csökkenhet.`});
  if(s>=11){
    mods.push({name:'Dapoxetin (Priligy) — <em>engedélyezett SSRI PE-re</em>',text:`Rövid hatású, kifejezetten "on demand" ejakulációs késleltetésre engedélyezett szer. Klinikailag validált (~2-3× latencia-növelés). Csak orvosi felírásra.`});
    mods.push({name:'Kognitív viselkedésterápiás szexterápia',text:`Ha a "acquired" típus valószínű (nem mindig volt ilyen), a kognitív komponens (elvárások, katasztrofizálás, spectator mode) kezelése kulcs. Sensate Focus + kognitív restrukturálás kombináció.`});
  }
  mods.push({name:'Urológiai + szexuálterapeuta kombinált konzultáció',text:`A klinikai gyakorlatban ez a kombinált (biológiai + pszichológiai) megközelítés hozza a legjobb eredményt. Magyarországon szexuálterapeuta hálózat elérhető (magyarszexualterapia.hu vagy hasonló).`});
  return mods;
}

/* — motorhoz illesztés —
   A régi eredményoldal-kód (__oldRender) változatlanul fut egy leválasztott DOM-darabon, a régi
   eredmény-sablonnal; a mentést (ONI.save) elkapjuk és a motor végzi. */
let responses={};
const RES_HTML="<div class=\"res-eyebrow\">Eredmény · PEDT · Szűrési kategória</div>\n      <h2 class=\"res-title\">Az időzítési <em>profilod</em></h2>\n      <p class=\"res-lead\">Az összpontszám 0 és 20 között skálázódik. Cut-offok: ≤8 = nincs PE, 9–10 = valószínű PE, ≥11 = PE. Ez szűrés, nem diagnózis.</p>\n      <div class=\"total-card\" id=\"pedt-totalCard\"></div>\n      <div class=\"interp-card\" id=\"pedt-interpCard\"></div>\n      <div class=\"cross-card\"><h3>Kapcsolatok más <em>területekkel</em></h3><div id=\"pedt-cross-links\"></div></div>\n      <div class=\"therapy-card\"><h3>Klinikai <em>következő lépések</em></h3><div class=\"sub\">Viselkedéses + farmakológiai kombinációk</div><div id=\"pedt-therapy-suggestions\"></div></div>\n      <div class=\"refs-card\"><h3>Tudományos <em>háttér</em></h3>\n        <div class=\"ref-item\"><strong>Symonds, T., Perelman, M. A., Althof, S., et al. (2007).</strong> Development and validation of a premature ejaculation diagnostic tool. <em>European Urology, 52(2)</em>, 565–573.</div>\n        <div class=\"ref-item\"><strong>Serefoglu, E. C., McMahon, C. G., Waldinger, M. D., et al. (2014).</strong> An evidence-based unified definition of lifelong and acquired premature ejaculation. <em>Sexual Medicine, 2(2)</em>, 41–59.</div>\n        <div class=\"ref-item\"><strong>Althof, S. E., McMahon, C. G., Waldinger, M. D., et al. (2014).</strong> An update of the International Society of Sexual Medicine's guidelines for the diagnosis and treatment of premature ejaculation.</div>\n      </div>";
function __oldRender(){
  const s=scoreTotal();
  const b=band(s);
  try{__cap({n:'PEDT',h:b.label,d:{total:['PEDT összpontszám',s,0,20]}});}catch(e){console.warn('ONI',e)}
  const tc=document.getElementById('pedt-totalCard');
  tc.style.setProperty('--tc',b.color);
  tc.innerHTML=`<div class="total-label">PEDT összpontszám</div><div class="total-value">${s}</div><div class="total-out">/ 20 · cut-off: ≤8 · 9–10 · ≥11</div><div class="total-band">${b.label}</div><p style="color:var(--ink-soft);font-size:14px;margin-top:16px;line-height:1.6">${b.desc}</p>`;
  document.getElementById('pedt-interpCard').innerHTML=`<h3>Klinikai <em>értelmezés</em></h3><div class="interp-section" style="--sc:${b.color}"><h4>${b.label}</h4><p>${INTERP[b.key]}</p></div>`;
  const links=getCrossLinks();
  document.getElementById('pedt-cross-links').innerHTML=links.length?links.map(l=>`<div class="cross-item"><div class="cross-item-label">${l.label}</div><p>${l.text}</p></div>`).join(''):`<p style="color:var(--ink-muted);font-style:italic">Nincs jelenlegi klinikai kereszthivatkozás.</p>`;
  const mods=therapySuggestions();
  document.getElementById('pedt-therapy-suggestions').innerHTML=mods.map(m=>`<div class="therapy-mod"><div class="therapy-mod-name">${m.name}</div><p>${m.text}</p></div>`).join('');
  document.getElementById('pedt-results').classList.add('visible');
  setTimeout(()=>{document.getElementById('pedt-results').scrollIntoView({behavior:'smooth',block:'start'});},100);
}
function __run(){
  let payload=null;const __cap=p=>{payload=p;};
  const box=window.document.createElement('div');box.innerHTML='<div id="pedt-results">'+RES_HTML+'</div>';
  const fake={getElementById:id=>box.querySelector('#'+CSS.escape(id)),querySelector:s=>box.querySelector(s),querySelectorAll:s=>box.querySelectorAll(s),createElement:(...a)=>window.document.createElement(...a)};
  const real=document;document=fake;window.__cap=__cap;try{__oldRender();}finally{document=real;delete window.__cap;}
  return {oni:payload,html:box.firstChild.innerHTML};
}
makeTest({
  id:"pedt",key:"pedt-responses-v1",name:"PEDT",c1:"#d4a017",c2:"#e11d48",
  tab:"Időzítés",tabSub:"PEDT · 5 item",scale:LIKERT,
  header:{"status": "valid", "statusText": "Validált eszköz alapján · fordítás tételenként még nem ellenőrzött", "eyebrow": "Premature Ejaculation Diagnostic Tool · Symonds et al. (2007)", "title": "Ejakuláció <em>időzítése</em>", "lead": "A PEDT egy 5 tételes gyors szűrőeszköz a korai magömlésre. Nem a \"hány perc\" a kérdés — hanem a <em>kontroll</em>, a <em>frusztráció</em>, az <em>ingerküszöb</em> és a <em>distressz</em>. A gyors idő magában nem probléma, ha kontroll van; és a hosszú idő is lehet probléma, ha a kontroll hiányzik.", "intro": "<p><strong>Kitöltés:</strong> Az utóbbi hónapok szexuális tapasztalataira gondolj. A partneri szex, nem az önkielégítés a fókusz.</p>"},
  sections:[{title:'',desc:'',items:ITEMS.map(it=>({t:it.t}))}],
  score(R){responses={};R.items.forEach(i=>{if(i.raw!==undefined)responses[i.n]=i.raw;});return __run();},
  sum(s){return s.oni;},
  render(R,s){return s.html;}
});
})();

/* ═══════════ 3. SDI-2 — VÁGY-TÉRKÉP ═══════════ */
(function(){
let document=window.document;   /* a régi kód ezen keresztül éri el a DOM-ot; kiértékeléskor egy leválasztott darabra mutat */
// SDI-2: 14 item, két alskála
// Dyadic (1-8): partneri vágy
// Solitary (9-14): szóló vágy
// Skálák változnak: frekvencia (0-8) és intenzitás (0-8)
const FREQ = [{v:0,l:'nincs'},{v:1,l:'havi 1'},{v:2,l:'havi 2'},{v:3,l:'heti 1'},{v:4,l:'heti 2'},{v:5,l:'heti 3-4'},{v:6,l:'heti 5-6'},{v:7,l:'napi 1'},{v:8,l:'napi több'}];
const INTEN = [{v:0,l:'nincs'},{v:1,l:'nagyon gyenge'},{v:2,l:'gyenge'},{v:3,l:'kissé gyenge'},{v:4,l:'közepes'},{v:5,l:'kissé erős'},{v:6,l:'erős'},{v:7,l:'nagyon erős'},{v:8,l:'rendkívül'}];
const ITEMS = [
  // Dyadic (partneri)
  {n:1, sub:'D', scale:FREQ, t:'Az elmúlt hónapban milyen gyakran szerettél volna partneri szexuális aktivitásba kezdeni (pl. csók, érintés, közösülés)?'},
  {n:2, sub:'D', scale:FREQ, t:'Az elmúlt hónapban milyen gyakran volt szexuális vágyad, ha vonzó személyt láttál?'},
  {n:3, sub:'D', scale:FREQ, t:'Amikor egy szexuálisan vonzó személlyel beszélgetsz, milyen gyakran érzel vágyat?'},
  {n:4, sub:'D', scale:FREQ, t:'Milyen gyakran fantáziálsz partneri szexuális helyzetről?'},
  {n:5, sub:'D', scale:FREQ, t:'Milyen gyakran érzel vágyat, hogy egy partnerrel szexuális aktivitásba kezdj?'},
  {n:6, sub:'D', scale:FREQ, t:'Milyen gyakran érzel vágyat egy vonzó személyre?'},
  {n:7, sub:'D', scale:FREQ, t:'Milyen gyakran ébred fel benned szexuális vágy, ha egy partneri kapcsolatra gondolsz?'},
  {n:8, sub:'D', scale:INTEN, t:'Amikor először találkozol egy vonzó személlyel, mennyire erős szexuális vágyat érzel?'},
  // Solitary (szóló)
  {n:9, sub:'S', scale:FREQ, t:'Milyen gyakran szerettél volna önkielégítéssel szexuális örömöt szerezni?'},
  {n:10, sub:'S', scale:FREQ, t:'Milyen gyakran volt szexuális vágyad partner nélkül?'},
  {n:11, sub:'S', scale:FREQ, t:'Milyen gyakran szerettél volna egyedül szexuálisan aktív lenni?'},
  {n:12, sub:'S', scale:FREQ, t:'Milyen gyakran fantáziálsz önkielégítésről?'},
  {n:13, sub:'S', scale:FREQ, t:'Milyen gyakran gondolsz szexuális örömre a nap folyamán, amikor senki nincs veled?'},
  {n:14, sub:'S', scale:INTEN, t:'Amikor egyedül vagy, mennyire erős szexuális vágyat érzel átlagosan?'}
];
const TOTAL=ITEMS.length;

function scoreSub(sub){return ITEMS.filter(it=>it.sub===sub).reduce((s,it)=>s+(responses[it.n]||0),0);}
/* Nincs magyar mintán normázott referencia: a válaszskála saját tartományán belüli helyet írjuk le, nem populációs átlagot. */
const SDI_MAX = {D:64,S:48};
function band(sub, score){
  const p=score/SDI_MAX[sub];
  if(p<0.2)return{key:'verylow',label:'Nagyon alacsony',color:'#7c2d3c',desc:'a skála legalsó ötöde'};
  if(p<0.4)return{key:'low',label:'Alacsony',color:'#c97a4a',desc:'a skála alsó része'};
  if(p<0.6)return{key:'mid',label:'Közepes',color:'#b8912e',desc:'a skála középső része'};
  if(p<0.8)return{key:'high',label:'Magas',color:'#84cc16',desc:'a skála felső része'};
  return{key:'veryhigh',label:'Nagyon magas',color:'#065f46',desc:'a skála legfelső ötöde'};
}
const INTERP = {
  D:{
    verylow:`A partneri vágy nagyon alacsony. Ez lehet: (1) rendszerszintű alacsony reaktivitás (magára az embereire nem "kapcsol"), (2) <em>responsive desire</em> profil (nem spontán, csak stimuláció után jön), (3) átmeneti állapot (stressz, kapcsolati distressz, gyógyszer, hormonális). Nem "hiba" — de érdemes a kontextust megnézni.`,
    low:`Alacsony partneri vágy. A "spontán" vágy ritka. A responsive desire modell (Basson) itt fontos: a vágy nem előzi meg a szexet — a szex vagy annak előjátéka <em>indítja el</em>. Kapcsolatban ez félreértéseket okozhat.`,
    mid:`Közepes partneri vágy a skálán.`,
    high:`Magas partneri vágy. Rendszered könnyen aktivizálódik partneri kontextusban. Ha a partneri vágyak nem szinkronban vannak, kapcsolati distressz forrása lehet.`,
    veryhigh:`Nagyon magas partneri vágy. Kiemelkedően reaktív rendszer. Ha ez distresszt okoz vagy funkcionális zavart, érdemes szakmai konzultáció; egyébként egyszerűen egy magas-libidójú profil.`
  },
  S:{
    verylow:`A szóló vágy nagyon alacsony. Ha a partneri vágy is alacsony, ez általános alacsony reaktivitás. Ha a partneri magasabb — akkor a vágy szigorúan partneri (nem is a saját testeddel akarsz kapcsolatot).`,
    low:`Alacsony szóló vágy.`,
    mid:`Közepes szóló vágy a skálán.`,
    high:`Magas szóló vágy. A rendszered erősen aktivizálódik partner nélkül is.`,
    veryhigh:`Nagyon magas szóló vágy.`
  }
};
function crossPattern(d, s){
  const links=[];
  /* hely a skála közepéhez képest (±1 ≈ a skálaterjedelem 20%-a); nem populációs z-érték */
  const dz=(d/SDI_MAX.D-0.5)/0.2, sz=(s/SDI_MAX.S-0.5)/0.2;
  if(dz<-1.0 && sz>0.5){
    links.push({label:'Magas szóló + alacsonyabb partneri vágy — a kontextust is érdemes megnézni',text:`A rendszered működik (magas szóló), csak partneri kontextusban nem "kapcsol". Okok lehetnek: kapcsolati distressz, teljesítmény-szorongás, kötődési biztonság hiánya, spectator mode. <strong>Nem alacsony libidó</strong> — hanem kontextus-érzékeny válaszrendszer.`});
  }
  if(dz>0.5 && sz<-1.0){
    links.push({label:'Magas partneri + alacsony szóló — a vágy relációs',text:`A vágyad inkább partnerhez kötött. Ez nem problematikus. Egyedül nem indul be szexuálisan a rendszer — ez elmondható a "responsive desire" egyik formájának.`});
  }
  if(dz<-1.0 && sz<-1.0){
    links.push({label:'Általánosan alacsony vágy — több lehetséges ok',text:`Mindkét dimenzió jelentősen alacsony. Ez lehet: (1) átmeneti (stressz, depresszió, gyógyszer), (2) hormonális (alacsony tesztoszteron), (3) egyszerűen alacsony baseline. Ha distresszt okoz, orvosi + pszichológiai kivizsgálás érdemes.`});
  }
  if(dz>1.0 && sz>1.0){
    links.push({label:'Általánosan magas vágy',text:`Mindkét dimenzió magas — kiemelkedően reaktív libidó. Csak akkor klinikai kérdés, ha distresszt vagy funkcionális zavart okoz.`});
  }
  links.push({label:'SIS/SES kapcsolat',text:`A vágy önmagában csak fél a képnek — a SIS/SES megmutatja a "gáz és fék" arányodat. Magas vágy + magas SIS1 (teljesítmény-gátlás) = frusztráló profil; alacsony vágy + alacsony SIS = "csendes" rendszer.`});
  if(d<25){
    links.push({label:'Post-breakup fázis — kontextus',text:`Friss kapcsolati veszteség után a partneri vágy átmenetileg alacsonyabb lehet — nem strukturális. Érdemes 3-6 hónap múlva újra felvenni.`});
  }
  return links;
}
function therapySuggestions(scores){
  const mods=[];
  const dz=(scores.D/SDI_MAX.D-0.5)/0.2, sz=(scores.S/SDI_MAX.S-0.5)/0.2;
  if(dz<-1.0 && sz>=0){
    mods.push({name:'Sensate Focus + kontextus-építés',text:`Ha a szóló vágy megvan, a partneri kevésbé, akkor érdemes a kontextust is megnézni, nem csak a vágy szintjét. Sensate Focus és partner-kommunikáció a Nagoski "Come as You Are" modell szerint.`});
    mods.push({name:'Responsive desire pszichoedukáció',text:`A Basson-modell megismerése önmagában nagy segítség: nem "várni a spontán vágyra", hanem tudatosan a szexuális helyzetbe belépni (érintés, közelség), ahonnan a vágy MÁR ott van, csak nem előzte meg.`});
  }
  if(dz<-1.0 && sz<-1.0){
    mods.push({name:'Orvosi kivizsgálás — tesztoszteron, egészségi állapot',text:`Általános alacsony vágy: hormonpanel (össz-teszt, szabad-teszt, SHBG, prolaktin, TSH), gyógyszerlista áttekintés (SSRI, béta-blokkoló, sok gyógyszer csökkenti). Depresszió-szűrés is indokolt.`});
  }
  if(dz>=0 && sz>=0){
    mods.push({name:'A vágy-skála nem alacsony',text:`A vágy-skálád a skála középső vagy felső részén van. Ha valamilyen distresszt élsz meg, érdemes más oldalról is megnézni. Nézd meg az IIEF-15 (I. tab), PEDT (II. tab), vagy SIS/SES tesztet.`});
  }
  mods.push({name:'Kapcsolati kommunikáció — vágy-eltérés esetén',text:`A partneri vágy-eltérés nagyon gyakori. Ez nem "hibás profil" — hanem különbség, ami kommunikációval kezelhető. Emily Nagoski "Come As You Are" könyve közérthető keret.`});
  return mods;
}

/* — motorhoz illesztés —
   A régi eredményoldal-kód (__oldRender) változatlanul fut egy leválasztott DOM-darabon, a régi
   eredmény-sablonnal; a mentést (ONI.save) elkapjuk és a motor végzi. */
let responses={};
const RES_HTML="<div class=\"res-eyebrow\">Eredmény · Vágy-térkép · Értelmezés</div>\n      <h2 class=\"res-title\">A te vágy-<em>térképed</em></h2>\n      <p class=\"res-lead\">Két pontszámot kapsz — egyet a partneri, egyet a szóló vágyra. A \"normális\" tartomány nagyon széles. Nem az abszolút érték számít, hanem a <em>saját magad-hoz</em> viszonyított és a <em>két érték közötti arány</em>.</p>\n      <div class=\"scores-grid\" id=\"sdi-scoresGrid\"></div>\n      <div class=\"interp-card\" id=\"sdi-interpCard\"></div>\n      <div class=\"cross-card\"><h3>Kapcsolatok más <em>területekkel</em></h3><div id=\"sdi-cross-links\"></div></div>\n      <div class=\"therapy-card\"><h3>Terápiás <em>implikációk</em></h3><div class=\"sub\">Ha vágy-nehézség vagy vágy-eltérés a probléma</div><div id=\"sdi-therapy-suggestions\"></div></div>\n      <div class=\"refs-card\"><h3>Tudományos <em>háttér</em></h3>\n        <div class=\"ref-item\"><strong>Spector, I. P., Carey, M. P., & Steinberg, L. (1996).</strong> The Sexual Desire Inventory: Development, factor structure, and evidence of reliability. <em>Journal of Sex & Marital Therapy, 22(3)</em>, 175–190.</div>\n        <div class=\"ref-item\"><strong>Moyano, N., Vallejo-Medina, P., & Sierra, J. C. (2017).</strong> Sexual Desire Inventory: Two or three dimensions? <em>Journal of Sex Research, 54(1)</em>, 105–116.</div>\n        <div class=\"ref-item\"><strong>Basson, R. (2001).</strong> Human sex-response cycles. <em>Journal of Sex & Marital Therapy, 27(1)</em>, 33–43. — A \"responsive desire\" modell alapja.</div>\n      </div>";
function __oldRender(){
  const scores={D:scoreSub('D'),S:scoreSub('S')};
  try{__cap({n:'SDI-2',h:'Partneri vágy: '+band('D',scores.D).label,d:{D:['Partneri vágy',scores.D,0,64],S:['Szóló vágy',scores.S,0,48]}});}catch(e){console.warn('ONI',e)}
  let scHtml='';
  [{k:'D',n:'Partneri vágy',en:'Dyadic Sexual Desire',max:64},{k:'S',n:'Szóló vágy',en:'Solitary Sexual Desire',max:48}].forEach(dim=>{
    const s=scores[dim.k], b=band(dim.k,s), pct=(s/dim.max)*100;
    scHtml+=`<div class="score-card" style="--sc:${b.color}"><div class="abbr">${dim.en}</div><div class="sc-h"><em>${dim.n}</em></div><div class="val">${s}</div><div class="out">/ ${dim.max}</div><div class="band">${b.label}</div><div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div></div>`;
  });
  document.getElementById('sdi-scoresGrid').innerHTML=scHtml;
  let interp=`<h3>Klinikai <em>értelmezés</em></h3>`;
  [{k:'D',n:'Partneri vágy'},{k:'S',n:'Szóló vágy'}].forEach(dim=>{
    const s=scores[dim.k], b=band(dim.k,s);
    interp+=`<div class="interp-section" style="--sc:${b.color}"><h4>${dim.n} — ${b.label}</h4><p>${INTERP[dim.k][b.key]}</p><p>A pontszámod (${s} / ${SDI_MAX[dim.k]}) ${b.desc}. Külföldi mintákon közölt átlagokhoz nem hasonlítom, mert ez a saját fordítás nincs magyar mintán normázva.</p></div>`;
  });
  document.getElementById('sdi-interpCard').innerHTML=interp;
  const links=crossPattern(scores.D, scores.S);
  document.getElementById('sdi-cross-links').innerHTML=links.map(l=>`<div class="cross-item"><div class="cross-item-label">${l.label}</div><p>${l.text}</p></div>`).join('');
  const mods=therapySuggestions(scores);
  document.getElementById('sdi-therapy-suggestions').innerHTML=mods.map(m=>`<div class="therapy-mod"><div class="therapy-mod-name">${m.name}</div><p>${m.text}</p></div>`).join('');
  document.getElementById('sdi-results').classList.add('visible');
  setTimeout(()=>{document.getElementById('sdi-results').scrollIntoView({behavior:'smooth',block:'start'});},100);
}
function __run(){
  let payload=null;const __cap=p=>{payload=p;};
  const box=window.document.createElement('div');box.innerHTML='<div id="sdi-results">'+RES_HTML+'</div>';
  const fake={getElementById:id=>box.querySelector('#'+CSS.escape(id)),querySelector:s=>box.querySelector(s),querySelectorAll:s=>box.querySelectorAll(s),createElement:(...a)=>window.document.createElement(...a)};
  const real=document;document=fake;window.__cap=__cap;try{__oldRender();}finally{document=real;delete window.__cap;}
  return {oni:payload,html:box.firstChild.innerHTML};
}
makeTest({
  id:"sdi",key:"sdi-2-responses-v1",name:"SDI-2",c1:"#e11d48",c2:"#7c3aed",
  tab:"Vágy-térkép",tabSub:"SDI-2 · 14 item",scale:[],
  header:{"status": "valid", "statusText": "Validált eszköz alapján · fordítás tételenként még nem ellenőrzött", "eyebrow": "Sexual Desire Inventory — 2 · Spector, Carey & Steinberg (1996)", "title": "Vágy <em>térképe</em>", "lead": "Az SDI-2 két, <strong>egymástól független</strong> vágy-dimenziót mér: <em>dyadic</em> (partneri, együttes) és <em>solitary</em> (szóló, önmagára irányuló) szexuális vágyat. A kettő gyakran <em>eltér</em> — nem hibás profil, hanem információ arról, hogy a rendszered milyen kontextusban aktivizálódik.", "intro": "<p><strong>Kitöltés:</strong> A frekvencia-kérdéseknél gondolj az utóbbi hónapra. Ha \"nem érzel vágyat\", az legitim válasz — nem elvárás, hogy gyakori legyen.</p>"},
  sections:[{title:'',desc:'',items:ITEMS.map(it=>({s:it.sub,tag:it.sub==='D'?'partneri':'szóló',scale:it.scale,t:it.t}))}],
  score(R){responses={};R.items.forEach(i=>{if(i.raw!==undefined)responses[i.n]=i.raw;});return __run();},
  sum(s){return s.oni;},
  render(R,s){return s.html;}
});
})();

/* ═══════════ 4. DES-II — DISSZOCIÁCIÓ ═══════════ */
(function(){
let document=window.document;   /* a régi kód ezen keresztül éri el a DOM-ot; kiértékeléskor egy leválasztott darabra mutat */
// DES-II: 28 item, 0-100 skálán 10-es lépésekben
const SCALE = [0,10,20,30,40,50,60,70,80,90,100].map(v=>({v,l:v+'%'}));
// Subscale assignments (Carlson & Putnam 1993):
// Absorption: items 2,14,15,16,17,18,20,21,23 (9)
// Amnesia: 3,4,5,6,8,10,25,26 (8)
// Depersonalization/Derealization: 7,11,12,13,22,27 (6)
// Nem-besorolt (total-only): 1,9,19,24,28
const ITEMS = [
  {n:1, t:'Néha úgy vezetsz autót, hogy közben rájössz, nem emlékszel arra, hogy hova mentél éppen (kirekesztve az alkohol vagy drog hatását).'},
  {n:2, sub:'ABS', t:'Néha, amikor valakit hallgatsz beszélni, hirtelen rájössz, hogy nem hallottad, mit mondott, vagy annak egy részét.'},
  {n:3, sub:'AMN', t:'Néha az az érzésed, hogy egy helyen vagy, de nem emlékszel, hogyan kerültél oda.'},
  {n:4, sub:'AMN', t:'Néha olyan ruhákat találsz magadon, amelyekre nem emlékszel, hogy felvetted volna.'},
  {n:5, sub:'AMN', t:'Néha új tárgyakat találsz a holmid között, amelyeket nem emlékszel, hogy megvettél volna.'},
  {n:6, sub:'AMN', t:'Néha idegenek találkoznak veled, és úgy szólítanak, mintha ismernék, és más néven, vagy azt mondják, hogy már láttak korábban.'},
  {n:7, sub:'DPD', t:'Néha úgy érzed, hogy a testeden kívülről állsz és nézed magadat, mintha egy másik személyt figyelnél.'},
  {n:8, sub:'AMN', t:'Néha azt mondják neked, hogy nem ismersz fel barátokat vagy családtagokat.'},
  {n:9, t:'Néha nem tudsz visszaemlékezni fontos életeseményekre (pl. esküvő, érettségi).'},
  {n:10, sub:'AMN', t:'Néha valamit hazudtál, és nem vagy biztos benne, hogy hazudtál-e, vagy valóban megtörtént.'},
  {n:11, sub:'DPD', t:'Néha úgy nézel a tükörbe, és nem ismersz magadra.'},
  {n:12, sub:'DPD', t:'Néha az az érzésed, hogy a körülötted lévő emberek, tárgyak és a világ nem valóságosak.'},
  {n:13, sub:'DPD', t:'Néha az az érzésed, hogy a tested nem hozzád tartozik.'},
  {n:14, sub:'ABS', t:'Néha eszedbe jut egy múltbeli esemény, olyan élénken, mintha most történne veled.'},
  {n:15, sub:'ABS', t:'Néha nem tudod eldönteni, hogy egy emléked ténylegesen megtörtént, vagy csak álmodtad.'},
  {n:16, sub:'ABS', t:'Néha egy ismerős helyen vagy, és mégis szokatlannak és idegennek tűnik.'},
  {n:17, sub:'ABS', t:'Néha annyira belemerülsz egy tévéműsor vagy filmbe, hogy nem veszed észre, mi történik körülötted.'},
  {n:18, sub:'ABS', t:'Néha annyira belemerülsz egy fantáziába vagy álmodozásba, hogy úgy érzed, valóban átéled.'},
  {n:19, t:'Néha észreveszed, hogy nem érzed a fájdalmat.'},
  {n:20, sub:'ABS', t:'Néha úgy ülsz és bámulsz a semmibe, és semmit sem gondolsz, mert az idő elrepül és nem tudod, mennyi idő telt el.'},
  {n:21, sub:'ABS', t:'Néha egyedül vagy és úgy beszélsz magaddal, mintha egy másik személy lennél.'},
  {n:22, sub:'DPD', t:'Néha úgy találod, hogy egy adott szituációban valami olyat csinálsz, mintha valaki más lennél — és nem tudod, miért.'},
  {n:23, sub:'ABS', t:'Néha olyan dolgokat, amelyek általában nehezek, olyan könnyen csinálod, mintha nem is te tennéd.'},
  {n:24, t:'Néha nem tudsz visszaemlékezni arra, hogy megcsináltál-e valamit, vagy csak elgondoltad, hogy megcsinálod (pl. lezártad-e az ajtót, elküldtél-e egy levelet).'},
  {n:25, sub:'AMN', t:'Néha bizonyítékot találsz arra, hogy valamit megcsináltál, de nem emlékszel rá.'},
  {n:26, sub:'AMN', t:'Néha jegyzeteket vagy rajzokat találsz a holmid között, amelyekről nem emlékszel, hogy csináltad volna őket.'},
  {n:27, sub:'DPD', t:'Néha hangokat hallasz a fejedben, amelyek azt mondják, mit tegyél, vagy megjegyzéseket tesznek arra, amit teszel.'},
  {n:28, t:'Néha úgy érzed, hogy egy köd, függöny, vagy üvegtábla van közted és a világ között.'}
];
const TOTAL=ITEMS.length;

function scoreTotal(){
  const vals=Object.values(responses);
  if(!vals.length)return 0;
  return vals.reduce((a,b)=>a+b,0)/vals.length;
}
function scoreSub(sub){
  const items=ITEMS.filter(it=>it.sub===sub);
  const vals=items.map(it=>responses[it.n]).filter(v=>v!=null);
  if(!vals.length)return 0;
  return vals.reduce((a,b)=>a+b,0)/vals.length;
}
function totalBand(score){
  if(score<15)return{key:'typical',label:'Tipikus',color:'#065f46',desc:'Nem klinikai tartomány — enyhe disszociatív élmények normálisak'};
  if(score<30)return{key:'elevated',label:'Emelt',color:'#b8912e',desc:'Emelt tartomány — érdemes megfigyelni, ha distresszt okoz'};
  return{key:'clinical',label:'Klinikailag jelentős',color:'#7c2d3c',desc:'Klinikai küszöb felett — szakmai konzultáció ajánlott'};
}
function subBand(score){
  if(score<15)return{key:'low',label:'Alacsony',color:'#065f46'};
  if(score<30)return{key:'mid',label:'Közepes',color:'#b8912e'};
  return{key:'high',label:'Magas',color:'#7c2d3c'};
}
const SUB_META = {
  ABS:{name:'Abszorpció',en:'Absorption / Imaginative Involvement',items:9,desc:'Belemerülés, "elveszés" fantáziában, filmben, gondolatban. A legenyhébb és legelterjedtebb disszociáció-forma; sokszor együtt jár kreativitással.'},
  AMN:{name:'Amnézia',en:'Dissociative Amnesia',items:8,desc:'Memóriakiesések a mindennapi élet eseményeire (nem betegségre visszavezethető). Ez a legspecifikusabb trauma-kapcsolt tünet.'},
  DPD:{name:'Depersonalizáció / Derealizáció',en:'Depersonalization / Derealization',items:6,desc:'Kívülről szemlélni magad, vagy a világ "nem valóságos" élménye. Szorongáshoz és trauma-történethez gyakran társul.'}
};
const INTERP = {
  overall:{
    typical:`Az általános disszociativitásod a tipikus tartományban van. Enyhe disszociatív élmények — pl. film közben "elveszés", ismerős útvonalon "automatikus" vezetés — normálisak, sőt gyakran adaptívak. Nincs klinikai jelzés.`,
    elevated:`Emelt tartomány. A rendszered időnként "elszakad" — nem klinikai kategória, de érdemes megfigyelni. Kérdés: <strong>okoz-e distresszt vagy funkcionális zavart?</strong> Ha igen, érdemes szakmai konzultáció; ha nem, ez lehet egyszerűen egy magasabb baseline, vagy stressz-válasz.`,
    clinical:`<strong>Klinikai küszöb felett (≥30).</strong> A DES-II ezt a küszöböt disszociatív zavarok (DID, DDD, PTSD, komplex trauma) szűrésére használja. <strong>Ez nem diagnózis — csak szűrés.</strong> Van magas hamis-pozitív arány (fantázia-hajlam, szuggesztibilitás is emelheti). <strong>Szakmai (trauma-informált pszichológus) konzultáció ajánlott</strong> a pontos értékeléshez — Dissociative Disorders Interview Schedule (DDIS) vagy Structured Clinical Interview for DSM-5 Dissociative Disorders (SCID-D-5) a következő lépés.`
  },
  ABS:{
    low:`Alacsony abszorpció — a figyelmed jól irányítható és rögzíthető.`,
    mid:`Közepes abszorpció. Néha "elveszel" fantáziában, filmben, gondolatban.`,
    high:`Magas abszorpció. Erős képesség a belemerülésre — sok kreatív ember, meditálók magas értéket adnak. Nem trauma-specifikus, de a többi alskála értékeivel együtt értékelendő.`
  },
  AMN:{
    low:`Alacsony amnesztikus disszociáció — a folyamatos memóriád intakt.`,
    mid:`Közepes szintű memória-diszkontinuitás. Néhány kiesés a napi életben.`,
    high:`<strong>Magas amnesztikus szintű disszociáció.</strong> Ez a legspecifikusabb trauma-kapcsolt disszociatív tünet. Ha ez magas és distresszt vagy funkcionális zavart okoz, <strong>szakmai konzultáció trauma-informált pszichológussal indokolt</strong>.`
  },
  DPD:{
    low:`Alacsony deperszonalizáció/derealizáció.`,
    mid:`Közepes szintű élmény. Néha van "kívülről" magad-nézése vagy a világ "nem valóságos" érzése.`,
    high:`<strong>Magas deperszonalizáció/derealizáció.</strong> A "saját testeden kívülről nézed magad", "a világ nem valóságos" élmények gyakoriak. Ez gyakran társul szorongással, PTSD-vel, vagy különálló Depersonalization-Derealization Disorder-rel. Szakmai értékelés indokolt.`
  }
};
function getCrossLinks(total){
  const links=[];
  if(total>=30){
    links.push({label:'ECR-R: fearful-avoidant korreláció',text:`Magas DES gyakran együtt jár a fearful-avoidant (magas szorongás + magas elkerülés) kötődési profillal — mindkettő komplex trauma-történet tipikus markere.`});
    links.push({label:'MAIA-2: Trusting és Not-Distracting alacsony',text:`Magas disszociáció mellett a testi bizalom és a "bent maradás a diszkomforttal" képessége gyakran alacsonyabb. A MAIA-2 megmutatja, nálad így van-e.`});
    links.push({label:'SMI: érdemes az elszakadó védő módot is megnézni',text:`A sématerápia a disszociációt gyakran az elszakadó védő módhoz köti. Ha felvetted az SMI-t, nézd meg.`});
  }
  if(total>=15 && total<30){
    links.push({label:'Enyhe disszociatív mintázat',text:`Nem klinikai, de az MAIA-2 Trusting alskála értékét érdemes ellenőrizni. Az enyhe disszociáció gyakran fokozódik stressz alatt.`});
  }
  links.push({label:'Post-traumatic stress felmérés',text:`Ha a DES magas és van trauma-történet, érdemes egy PTSD-szűrőt (PCL-5) is felvenni. A trauma-informált szakértői értékelés a következő lépés — nem az önismereti tesztek.`});
  return links;
}
function therapySuggestions(total, subs){
  const mods=[];
  if(total>=30){
    mods.push({name:'Trauma-informált szakmai konzultáció — <em>első lépés</em>',text:`A magas DES-pontszámnak többféle háttere lehet, gyakran megterhelő élmények is. Ha tartósan zavar, érdemes trauma-informált szakemberrel átbeszélni, aki strukturált felméréssel pontosíthat. Nem sürgős krízis, de érdemes időpontot foglalni.`});
    mods.push({name:'EMDR — <em>Shapiro</em>',text:`Az Eye Movement Desensitization and Reprocessing a leginkább validált trauma-kezelés. Disszociatív zavaroknál speciális adaptáció (Fine, Mosquera) — nem minden EMDR-terapeuta végzi ezt; érdemes komplex trauma-képzésű terapeutát keresni.`});
    mods.push({name:'Szomatikus Experiencing / Sensorimotor Psychotherapy',text:`Levine és Ogden módszerei — testi tudatosságon alapuló trauma-kezelés. Kifejezetten disszociatív klienseknél hatékonyak, mert a "top-down" (beszélgetéses) megközelítés a disszociációt fenntarthatja.`});
  } else if(total>=15){
    mods.push({name:'Mindfulness + testi tudatosság — <em>MABT</em>',text:`Enyhe disszociatív mintázatnál a testi tudatosság gyakorlása "földelő" hatású. A MAIA-2-alapú munka jó belépési pont — a test újrakapcsolása a jelenbe.`});
    mods.push({name:'Grounding technikák',text:`Ha disszociatív pillanatot érzel: 5-4-3-2-1 (5 dolog amit látsz, 4 amit hallasz, 3 amit érintesz, 2 amit szagolsz, 1 amit ízlelsz). Egyszerű, hatékony jelenbe-hozás.`});
  } else {
    mods.push({name:'Nincs specifikus intervenció',text:`A profilod tipikus tartományban. Ha időnként "elveszel" fantáziában vagy filmben, ez normális és sokszor adaptív — nem kell "gyógyítani".`});
  }
  if(subs.AMN>=30){
    mods.push({name:'Amnesztikus jelekre — <em>strukturált napló</em>',text:`Ha a memória-kiesések zavaróak, egy napló (mit tettem, mikor) segít külső referenciapontot adni. Ez nem terápia — csak funkcionális support. A háttér-munka szakemberrel.`});
  }
  return mods;
}

/* — motorhoz illesztés —
   A régi eredményoldal-kód (__oldRender) változatlanul fut egy leválasztott DOM-darabon, a régi
   eredmény-sablonnal; a mentést (ONI.save) elkapjuk és a motor végzi. */
let responses={};
const RES_HTML="<div class=\"res-eyebrow\">Eredmény · DES-II átlag + 3 alskála · Klinikai kontextus</div>\n      <h2 class=\"res-title\">A te disszociatív <em>profilod</em></h2>\n      <p class=\"res-lead\">A DES-II átlagpontszám (0-100) az általános disszociativitás mértéke. Cut-offok: ≤15 tipikus, 15-30 emelt, ≥30 klinikailag jelentős. A három alskála (amnézia, deperszonalizáció/derealizáció, abszorpció) árnyalja a képet.</p>\n      <div class=\"total-card\" id=\"des-totalCard\"></div>\n      <div class=\"scores-grid\" id=\"des-scoresGrid\"></div>\n      <div class=\"interp-card\" id=\"des-interpCard\"></div>\n      <div class=\"cross-card\"><h3>Kapcsolatok más <em>területekkel</em></h3><div id=\"des-cross-links\"></div></div>\n      <div class=\"therapy-card\"><h3>Klinikai <em>következő lépések</em></h3><div class=\"sub\">Trauma-informált megközelítések</div><div id=\"des-therapy-suggestions\"></div></div>\n      <div class=\"refs-card\"><h3>Tudományos <em>háttér</em></h3>\n        <div class=\"ref-item\"><strong>Carlson, E. B., & Putnam, F. W. (1993).</strong> An update on the Dissociative Experiences Scale. <em>Dissociation, 6(1)</em>, 16–27.</div>\n        <div class=\"ref-item\"><strong>Bernstein, E. M., & Putnam, F. W. (1986).</strong> Development, reliability, and validity of a dissociation scale. <em>Journal of Nervous and Mental Disease, 174(12)</em>, 727–735.</div>\n        <div class=\"ref-item\"><strong>van IJzendoorn, M. H., & Schuengel, C. (1996).</strong> The measurement of dissociation in normal and clinical populations: Meta-analytic validation of the DES. <em>Clinical Psychology Review, 16(5)</em>, 365–382.</div>\n        <div class=\"ref-item\"><strong>Dalenberg, C. J., Brand, B. L., Gleaves, D. H., et al. (2012).</strong> Evaluation of the evidence for the trauma and fantasy models of dissociation. <em>Psychological Bulletin, 138(3)</em>, 550–588.</div>\n      </div>";
function __oldRender(){
  const total=scoreTotal();
  const subs={ABS:scoreSub('ABS'),AMN:scoreSub('AMN'),DPD:scoreSub('DPD')};
  try{__cap({n:'DES-II',h:totalBand(total).label,d:{total:['DES-II átlag',total,0,100],ABS:[SUB_META.ABS.name,subs.ABS,0,100],AMN:[SUB_META.AMN.name,subs.AMN,0,100],DPD:[SUB_META.DPD.name,subs.DPD,0,100]}});}catch(e){console.warn('ONI',e)}
  const tB=totalBand(total);
  const tc=document.getElementById('des-totalCard');
  tc.style.setProperty('--tc',tB.color);
  tc.innerHTML=`<div class="total-label">DES-II átlagpontszám</div><div class="total-value">${total.toFixed(1)}</div><div class="total-out">/ 100 · cut-offs: <15 · 15–30 · ≥30</div><div class="total-band">${tB.label}</div><p style="color:var(--ink-soft);font-size:14px;margin-top:16px;line-height:1.6">${tB.desc}</p>`;
  let scHtml='';
  ['ABS','AMN','DPD'].forEach(sub=>{
    const s=subs[sub], meta=SUB_META[sub], b=subBand(s), pct=(s/100)*100;
    scHtml+=`<div class="score-card" style="--sc:${b.color}"><div class="abbr">${sub} · ${meta.en}</div><div class="sc-h"><em>${meta.name}</em></div><div class="val">${s.toFixed(1)}</div><div class="out">/ 100 · ${meta.items} item</div><div class="band">${b.label}</div><div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div></div>`;
  });
  document.getElementById('des-scoresGrid').innerHTML=scHtml;
  let interp=`<h3>Klinikai <em>értelmezés</em></h3><div class="interp-section" style="--sc:${tB.color}"><h4>Összkép — ${tB.label}</h4><p>${INTERP.overall[tB.key]}</p></div>`;
  ['ABS','AMN','DPD'].forEach(sub=>{
    const s=subs[sub], meta=SUB_META[sub], b=subBand(s);
    interp+=`<div class="interp-section" style="--sc:${b.color}"><h4>${meta.name} — ${b.label} (${s.toFixed(1)})</h4><p style="font-size:13.5px;color:var(--ink-muted);margin-bottom:8px;font-style:italic">${meta.desc}</p><p>${INTERP[sub][b.key]}</p></div>`;
  });
  document.getElementById('des-interpCard').innerHTML=interp;
  const links=getCrossLinks(total);
  document.getElementById('des-cross-links').innerHTML=links.map(l=>`<div class="cross-item"><div class="cross-item-label">${l.label}</div><p>${l.text}</p></div>`).join('');
  const mods=therapySuggestions(total, subs);
  document.getElementById('des-therapy-suggestions').innerHTML=mods.map(m=>`<div class="therapy-mod"><div class="therapy-mod-name">${m.name}</div><p>${m.text}</p></div>`).join('');
  document.getElementById('des-results').classList.add('visible');
  setTimeout(()=>{document.getElementById('des-results').scrollIntoView({behavior:'smooth',block:'start'});},100);
}
function __run(){
  let payload=null;const __cap=p=>{payload=p;};
  const box=window.document.createElement('div');box.innerHTML='<div id="des-results">'+RES_HTML+'</div>';
  const fake={getElementById:id=>box.querySelector('#'+CSS.escape(id)),querySelector:s=>box.querySelector(s),querySelectorAll:s=>box.querySelectorAll(s),createElement:(...a)=>window.document.createElement(...a)};
  const real=document;document=fake;window.__cap=__cap;try{__oldRender();}finally{document=real;delete window.__cap;}
  return {oni:payload,html:box.firstChild.innerHTML};
}
makeTest({
  id:"des",key:"des-2-responses-v1",name:"DES-II",c1:"#7c3aed",c2:"#2563eb",
  tab:"Disszociáció",tabSub:"DES-II · 28 item",scale:typeof SCALE!=="undefined"?SCALE:[],
  header:{"status": "valid", "statusText": "Validált eszköz alapján · fordítás tételenként még nem ellenőrzött", "eyebrow": "Dissociative Experiences Scale II · Carlson & Putnam (1993)", "title": "Disszociatív <em>élmények</em>", "lead": "A DES-II 28 típusú disszociatív élményt mér: <em>amnézia</em> (memóriakiesések), <em>deperszonalizáció/derealizáció</em> (magadtól vagy a világtól való elszakadás érzése), és <em>abszorpció</em> (belemerülés, \"elveszés\"). A skála <strong>0-100%</strong>: az idő hány százalékában tapasztalod az adott élményt.", "intro": "<p><strong>Kitöltés:</strong> Minden állításnál válaszd ki azt a százalékot, amilyen gyakorisággal a leírt élmény megtörténik veled — kizárva az alkohol vagy drog hatása alatti időszakokat. 0% = soha, 100% = mindig.</p>"},
  sections:[{title:'',desc:'',items:ITEMS.map(it=>Object.assign({t:it.t},it.sub?{s:it.sub,tag:it.sub}:{}))}],
  score(R){responses={};R.items.forEach(i=>{if(i.raw!==undefined)responses[i.n]=i.raw;});return __run();},
  sum(s){return s.oni;},
  render(R,s){return s.html;}
});
})();
