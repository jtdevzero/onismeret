/* terkepek hub — a kézzel írt terkepek.html-ből átköltöztetve. A pontozó és az eredményoldal-kód változatlan. */

/* ═══════════ 1. ECR-R — KÖTŐDÉS ═══════════ */
(function(){
let document=window.document;   /* a régi kód ezen keresztül éri el a DOM-ot; kiértékeléskor egy leválasztott darabra mutat */
const ITEMS = [
  {n:1, scale:'anx', t:'Attól félek, hogy elveszítem a partnerem szeretetét.'},
  {n:2, scale:'avd', t:'Jobb szeretem, ha nem mutatom meg a partneremnek, mit érzek mélyen.'},
  {n:3, scale:'anx', t:'Gyakran aggódom, hogy a partnerem nem akar majd velem maradni.'},
  {n:4, scale:'avd', t:'Kényelmes megosztani a magánéleti gondolataimat és érzéseimet a partneremmel.', rev:true},
  {n:5, scale:'anx', t:'Gyakran aggódom, hogy a partnerem valójában nem szeret.'},
  {n:6, scale:'avd', t:'Nehéz megengednem magamnak, hogy a partneremtől függjek.'},
  {n:7, scale:'anx', t:'Aggódom, hogy a partnereim nem törődnek velem annyira, mint én velük.'},
  {n:8, scale:'avd', t:'Nagyon kényelmes közel lennem a partneremhez.', rev:true},
  {n:9, scale:'anx', t:'Sokszor azt kívánom, bárcsak olyan erősek lennének a partnerem érzései irántam, mint az enyémek iránta.'},
  {n:10, scale:'avd', t:'Nem érzem magam kényelmesen, ha megnyílok a partnerem előtt.'},
  {n:11, scale:'anx', t:'Sokat aggódom a kapcsolataim miatt.'},
  {n:12, scale:'avd', t:'Jobb szeretem, ha nem vagyok túl közel a partneremhez.'},
  {n:13, scale:'anx', t:'Amikor a partnerem távol van, aggódom, hogy másvalaki iránt kezd érdeklődni.'},
  {n:14, scale:'avd', t:'Kényelmetlenül érzem magam, amikor a partnerem nagyon közel akar lenni hozzám.'},
  {n:15, scale:'anx', t:'Amikor kimutatom az érzelmeimet a partnerem felé, félek, hogy ő nem ugyanígy érez irántam.'},
  {n:16, scale:'avd', t:'Viszonylag könnyű nekem közel kerülni a partneremhez.', rev:true},
  {n:17, scale:'anx', t:'Ritkán aggódom, hogy a partnerem elhagyna.', rev:true},
  {n:18, scale:'avd', t:'Nem nehéz nekem közel kerülni a partneremhez.', rev:true},
  {n:19, scale:'anx', t:'A partnerem miatt kezdek kételkedni magamban.'},
  {n:20, scale:'avd', t:'Általában megbeszélem a problémáimat és aggodalmaimat a partneremmel.', rev:true},
  {n:21, scale:'anx', t:'Nem gyakran aggódom, hogy elhagynak.', rev:true},
  {n:22, scale:'avd', t:'Segít, ha nehéz időkben a partneremhez fordulhatok.', rev:true},
  {n:23, scale:'anx', t:'Úgy találom, hogy a partnereim nem akarnak olyan közel kerülni hozzám, mint amennyire én szeretném.'},
  {n:24, scale:'avd', t:'Nagyjából mindent elmondok a partneremnek.', rev:true},
  {n:25, scale:'anx', t:'Néha a partnereim hirtelen, minden látható ok nélkül megváltoztatják az érzéseiket irántam.'},
  {n:26, scale:'avd', t:'Megbeszélem a dolgokat a partneremmel.', rev:true},
  {n:27, scale:'anx', t:'A közelség iránti erős vágyam néha elriaszt embereket.'},
  {n:28, scale:'avd', t:'Ideges leszek, ha a partnerem túl közel kerül hozzám.'},
  {n:29, scale:'anx', t:'Attól félek, hogy ha a partnerem igazán megismer, nem fog tetszeni neki, aki valójában vagyok.'},
  {n:30, scale:'avd', t:'Kényelmes függeni a partneremtől.', rev:true},
  {n:31, scale:'anx', t:'Feldühít, hogy nem kapom meg a szeretetet és támogatást, amire szükségem van a partneremtől.'},
  {n:32, scale:'avd', t:'Könnyű nekem függeni a partneremtől.', rev:true},
  {n:33, scale:'anx', t:'Aggódom, hogy nem mérem meg magamat más emberekkel.'},
  {n:34, scale:'avd', t:'Könnyű nekem gyengéd lenni a partneremmel.', rev:true},
  {n:35, scale:'anx', t:'A partnerem csak akkor vesz észre, amikor mérges vagyok.'},
  {n:36, scale:'avd', t:'A partnerem tényleg megért engem és a szükségleteimet.', rev:true}
];
const TOTAL = ITEMS.length;
const LIKERT = [{v:1,l:'egyáltalán'},{v:2,l:'nem'},{v:3,l:'inkább nem'},{v:4,l:'semleges'},{v:5,l:'inkább igen'},{v:6,l:'igen'},{v:7,l:'teljesen'}];

function scoreScale(id){
  const items=ITEMS.filter(it=>it.scale===id);
  const vals=items.map(it=>{const raw=responses[it.n];if(raw==null)return null;return it.rev?(8-raw):raw;}).filter(v=>v!==null);
  if(!vals.length)return null;
  return {mean:vals.reduce((a,b)=>a+b,0)/vals.length, n:vals.length};
}
function bandFor(id, score){
  const LO=1,HI=7;
  /* Nincs magyar mintán normázott referencia, ezért a válaszskála saját tartományán belüli helyet írjuk le, nem populációs átlagot. */
  const p=(score-LO)/(HI-LO);
  let label,key,desc;
  if(p<0.2){label='Nagyon alacsony';key='very-low';desc='a válaszskála legalsó ötödében van'}
  else if(p<0.4){label='Alacsony';key='low';desc='a válaszskála alsó részén van'}
  else if(p<0.6){label='Közepes';key='mid';desc='a válaszskála középső részén van'}
  else if(p<0.8){label='Magas';key='high';desc='a válaszskála felső részén van'}
  else{label='Nagyon magas';key='very-high';desc='a válaszskála legfelső ötödében van'}
  return {label,key,desc,p};
}
function normalCDF(z){
  const t=1/(1+0.2316419*Math.abs(z));
  const d=0.3989423*Math.exp(-z*z/2);
  let p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));
  if(z>0)p=1-p;return p;
}
function attachmentStyle(anx,avd){
  const ha=anx>3.5, hv=avd>3.5;
  if(!ha&&!hv)return'secure';
  if(ha&&!hv)return'preoccupied';
  if(!ha&&hv)return'dismissive';
  return'fearful';
}
const STYLES={
  secure:{name:'Biztonságos (Secure)',color:'#065f46',short:'Alacsony szorongás + alacsony elkerülés',long:`<p><strong>A stabilitás profilja.</strong> Képes vagy megnyílni, függeni, és megtartani az önállóságodat is. A partner távolléte, konfliktus, csend nem sodor ki — a belső "biztonsági bázis" működik. Külföldi felnőtt mintákban nagyjából 55-60%.</p>`},
  preoccupied:{name:'Belefeledkező / szorongó (Preoccupied)',color:'#1e3a8a',short:'Magas szorongás + alacsony elkerülés',long:`<p><strong>A megközelítési profil.</strong> Mélyen érzelmi, könnyen megnyíló — de folyamatosan monitoros: "miért nem ír vissza", "már nem szeret". A kapcsolat hőmérője folyamatosan mérésre van kapcsolva. Fárasztó. Külföldi felnőtt mintákban nagyjából 15-20%.</p>`},
  dismissive:{name:'Elkerülő / elutasító (Dismissive-Avoidant)',color:'#b8912e',short:'Alacsony szorongás + magas elkerülés',long:`<p><strong>A távolítási profil.</strong> Önállóság magasra értékelve. A közeli megnyílás nehezen viselhető — a rendszer a közelség növekedésére deaktivációval reagál. "Egyedül boldogulok". A kapcsolat mélyülésével nő a menekülési vágy. Külföldi felnőtt mintákban nagyjából 20-25%.</p>`},
  fearful:{name:'Rettegő / dezorganizált (Fearful-Avoidant)',color:'#7c2d3c',short:'Magas szorongás + magas elkerülés',long:`<p><strong>A legkomplexebb profil.</strong> Két ellentétes vágy: erős szükséglet a közelségre ÉS erős menekülési késztetés attól. Közelítés-menekülés (approach-avoidance) feszültség. Sok esetben korai, nehéz kötődési tapasztalatokkal hozzák összefüggésbe, de a pontszám önmagában ezt nem mutatja meg. Külföldi felnőtt mintákban nagyjából 7-10%.</p>`}
};
const INTERP={
  anx:{
    'very-low':`Nagyon alacsony szorongás. Csendek, konfliktusok nem hoznak lényegi aktivációt. Kedvező, ha a partner érzelmileg elérhető — extrém alacsony néha érzelmi távolság kompenzációját jelzi.`,
    low:`Alacsony szorongás. Belső biztonság van. Az elhagyástól való félelem nem strukturális tényező.`,
    mid:`Tipikus szintű szorongás. Bizonyos helyzetekben aktiválódik, más helyzetekben nyugodt.`,
    high:`<strong>Emelt szorongás.</strong> Az elhagyás, "nem elég vagyok" gondolatok aktív jelenlétben. Fokozott monitorozás. Módosítható.`,
    'very-high':`<strong>Jelentősen magas szorongás.</strong> A rendszer szinte folyamatosan éberen figyeli az elhagyás jeleit. Nem "túlérzékenység" — rendszer-szintű reakció. Célzott munkával csökkenthető.`
  },
  avd:{
    'very-low':`Nagyon alacsony elkerülés. A közelség természetesen jelen van. Ha ez emelt szorongással kombinálódik, a közelséget mintegy "használod" a szorongás enyhítésére.`,
    low:`Alacsony elkerülés. Kényelmesen tudsz közel lenni, függeni. Nem szorulsz "biztonsági távolságra".`,
    mid:`Tipikus szintű elkerülés. Helyzetfüggő komfort.`,
    high:`<strong>Emelt elkerülés.</strong> A közelség növekedésével nő a menekülési vágy. Nem érdektelenség — autonóm deaktivációs válasz.`,
    'very-high':`<strong>Jelentősen magas elkerülés.</strong> A közeli, tartós függés rendszer-szinten nehezen viselhető. "Egyedül biztonságos". Nem "önzés" — védekezés.`
  }
};
function getCrossLinks(scores){
  const anx=scores.anx.mean, avd=scores.avd.mean, style=attachmentStyle(anx,avd);
  const links=[];
  if(style==='fearful'){
    links.push({label:'YSQ átfedés: Abandonment + Mistrust/Abuse',text:`A fearful-avoidant profil erős korrelációt mutat a Young Schema modell <em>Abandonment</em> és <em>Mistrust/Abuse</em> alap-sémáival.`});
  }
  if(anx>=4.5){
    links.push({label:'YSQ séma: Defectiveness/Shame',text:`Magas szorongás gyakran áthidal a <em>Defectiveness/Shame</em> ("nem vagyok elég") sémával.`});
    links.push({label:'SIS/SES: magas SIS2 kapcsolat',text:`Magas szorongás → gyakran magasabb SIS2 (Sexual Inhibition — Külső gátlás). Az érzelmi biztonság hiányában szexuálisan is nehezebb "átadni magad".`});
  }
  if(avd>=4.5){
    links.push({label:'TAS-20 (alexitímia) korreláció',text:`Magas elkerülés gyakran gyengébb érzelmi tudatossággal jár együtt. A rendszer nem tanulta meg, hogy az érzelmek megbeszélése biztonságos. <strong>A III. tabon (TAS-20) megnézheted.</strong>`});
    links.push({label:'MAIA-2: Body Listening és Trusting',text:`Magas elkerülés általában alacsonyabb <em>Body Listening</em> és <em>Trusting</em> értékekkel jár. Az érzelmi távolság testi távolsággal is.`});
  }
  if(style==='preoccupied'){
    links.push({label:'Emocionális evés — kapcsolat',text:`A preoccupied profil erős korrelációt mutat az érzelmi evéssel: kötődési distressz → gyors dopaminerg kompenzáció.`});
  }
  if(style==='fearful' || (anx>=4.5 && avd>=4.5)){
    links.push({label:'"Közelít-menekül" ciklus',text:`Magas szorongás + magas elkerülés = intenzív vonzalom → közeledés → menekülési vágy → visszahúzódás → hiány → újra közeledés.`});
  }
  if(style==='secure'){
    links.push({label:'Kapcsolati distressz ≠ rendszerprobléma',text:`Biztonságos kötődés mellett a jelenlegi distressz inkább szituációs. Nem a kötődési rendszered kell "javítani".`});
  }
  if(anx>=4.0 || style==='fearful'){
    links.push({label:'Post-breakup fázis — kontextus',text:`Friss szakítás után az ECR-R ideiglenesen "szorongósabbnak" mutathat. Érdemes 3-6 hónap múlva újra felvenni.`});
  }
  return links;
}
function therapySuggestions(scores){
  const anx=scores.anx.mean, avd=scores.avd.mean, style=attachmentStyle(anx,avd);
  const mods=[];
  if(style==='fearful' || (anx>=4.5&&avd>=4.5)){
    mods.push({name:'Emotionally Focused Therapy (EFT) — <em>Sue Johnson</em>',text:`A fearful és preoccupied profilok arany-standard intervenciója. Kifejezetten a kötődési sérülések javítására fejlesztették. 8-20 üléses protokoll, szignifikáns javulást mutat.`});
    mods.push({name:'IFS (Internal Family Systems) — <em>Richard Schwartz</em>',text:`A "közelít-menekül" ciklus mögött különböző belső részek dolgoznak. Az IFS ezeket <strong>különválasztja, meghallgatja, integrálja</strong>.`});
  }
  if(style==='preoccupied' || anx>=4.5){
    mods.push({name:'Mentalization-Based Treatment (MBT)',text:`A magas szorongás gyakran mentalizációs kapacitás bezárulásával jár. Az MBT célzottan ezt fejleszti.`});
    mods.push({name:'Szomatikus önszabályozás',text:`Az akut kötődési aktiváció fiziológiai állapot. Hosszított kilégzés, pszichológiai sóhaj, jeges arc — direkt idegrendszeri szabályozás.`});
  }
  if(style==='dismissive' || avd>=4.5){
    mods.push({name:'Attachment-based therapy — érzelmi hozzáférés',text:`Az elkerülő profilnál gyakori tapasztalat lehet: "nem érzek semmit" akkor, amikor valami erős érzelemnek kellene lennie. A régen elhallgattatott érzelmek biztonságos újrahangolása.`});
    mods.push({name:'MABT — testi tudatosság',text:`Ha az érzelmek nem elérhetőek, a test gyakran ott hordja őket. Kevésbé fenyegetőző belépési pont.`});
  }
  if(style==='secure'){
    mods.push({name:'Fenntartás — nincs specifikus intervenciós javaslat',text:`Biztonságos profil — folyamatos gyakorlat, nem "elért állapot": érzelmi elérhetőség, felelősségvállalás, konfliktus-megoldás.`});
  }
  mods.push({name:'Pszichoedukáció: <em>Attached</em> és <em>Hold Me Tight</em>',text:`Két közérthető, empirikusan megalapozott könyv. Kiváló bevezető és önreflexió-eszköz.`});
  return mods;
}

function drawQuadrant(anx, avd, style){
  const svg=document.getElementById('quadrant-svg-ecr');
  const W=540,H=540,M=70,plotW=W-M*2,plotH=H-M*2;
  const x=M+((avd-1)/6)*plotW, y=M+plotH-((anx-1)/6)*plotH;
  const midX=M+((3.5-1)/6)*plotW, midY=M+plotH-((3.5-1)/6)*plotH;
  let html='';
  html+=`<rect x="${M}" y="${M}" width="${midX-M}" height="${midY-M}" fill="#7c2d3c" fill-opacity="0.05"/><rect x="${midX}" y="${M}" width="${M+plotW-midX}" height="${midY-M}" fill="#b8912e" fill-opacity="0.05"/><rect x="${M}" y="${midY}" width="${midX-M}" height="${M+plotH-midY}" fill="#1e3a8a" fill-opacity="0.05"/><rect x="${midX}" y="${midY}" width="${M+plotW-midX}" height="${M+plotH-midY}" fill="#065f46" fill-opacity="0.06"/>`;
  for(let i=1;i<=6;i++){
    const xx=M+(i/6)*plotW, yy=M+(i/6)*plotH;
    html+=`<line x1="${xx}" y1="${M}" x2="${xx}" y2="${M+plotH}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="2,3" stroke-opacity="0.5"/><line x1="${M}" y1="${yy}" x2="${M+plotW}" y2="${yy}" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="2,3" stroke-opacity="0.5"/>`;
  }
  html+=`<line x1="${midX}" y1="${M}" x2="${midX}" y2="${M+plotH}" stroke="#b8912e" stroke-width="1.5"/><line x1="${M}" y1="${midY}" x2="${M+plotW}" y2="${midY}" stroke="#b8912e" stroke-width="1.5"/>`;
  html+=`<text x="${M+16}" y="${M+22}" font-family="Cardo,serif" font-style="italic" font-size="15" fill="#7c2d3c" font-weight="700">Rettegő</text><text x="${M+16}" y="${M+38}" font-family="Inter,sans-serif" font-size="10" fill="#7c2d3c" letter-spacing="0.05em">Fearful-avoidant</text><text x="${M+plotW-16}" y="${M+22}" text-anchor="end" font-family="Cardo,serif" font-style="italic" font-size="15" fill="#b8912e" font-weight="700">Belefeledkező</text><text x="${M+plotW-16}" y="${M+38}" text-anchor="end" font-family="Inter,sans-serif" font-size="10" fill="#b8912e" letter-spacing="0.05em">Preoccupied</text><text x="${M+16}" y="${M+plotH-24}" font-family="Cardo,serif" font-style="italic" font-size="15" fill="#1e3a8a" font-weight="700">Elkerülő</text><text x="${M+16}" y="${M+plotH-8}" font-family="Inter,sans-serif" font-size="10" fill="#1e3a8a" letter-spacing="0.05em">Dismissive</text><text x="${M+plotW-16}" y="${M+plotH-24}" text-anchor="end" font-family="Cardo,serif" font-style="italic" font-size="15" fill="#065f46" font-weight="700">Biztonságos</text><text x="${M+plotW-16}" y="${M+plotH-8}" text-anchor="end" font-family="Inter,sans-serif" font-size="10" fill="#065f46" letter-spacing="0.05em">Secure</text>`;
  html+=`<text x="${M+plotW/2}" y="${H-24}" text-anchor="middle" font-family="Cardo,serif" font-style="italic" font-size="16" fill="#b8912e">← alacsony elkerülés · magas elkerülés →</text><text x="22" y="${M+plotH/2}" text-anchor="middle" font-family="Cardo,serif" font-style="italic" font-size="16" fill="#1e3a8a" transform="rotate(-90 22 ${M+plotH/2})">← magas szorongás · alacsony szorongás →</text>`;
  html+=`<rect x="${M}" y="${M}" width="${plotW}" height="${plotH}" fill="none" stroke="#334155" stroke-width="1.5"/>`;
  for(let i=1;i<=7;i++){const xx=M+((i-1)/6)*plotW;html+=`<text x="${xx}" y="${H-52}" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" fill="#64748b" font-weight="500">${i}</text>`;}
  for(let i=1;i<=7;i++){const yy=M+plotH-((i-1)/6)*plotH;html+=`<text x="${M-12}" y="${yy+4}" text-anchor="end" font-family="Inter,sans-serif" font-size="10" fill="#64748b" font-weight="500">${i}</text>`;}
  const c=STYLES[style].color;
  html+=`<circle cx="${x}" cy="${y}" r="26" fill="${c}" fill-opacity="0.15"/><circle cx="${x}" cy="${y}" r="16" fill="${c}" fill-opacity="0.28"/><circle cx="${x}" cy="${y}" r="8" fill="${c}" stroke="#fff" stroke-width="2.5"/><text x="${x+22}" y="${y-14}" font-family="Cardo,serif" font-style="italic" font-size="16" fill="${c}" font-weight="700">te</text>`;
  svg.innerHTML=html;
}

/* — motorhoz illesztés —
   A régi eredményoldal-kód (__oldRender) változatlanul fut egy leválasztott DOM-darabon, a régi
   eredmény-sablonnal; a mentést (ONI.save) elkapjuk és a motor végzi. */
let responses={};
const RES_HTML="<div class=\"res-eyebrow\">Eredmény · Kötődési profil · Értelmezés</div>\n      <h2 class=\"res-title\">A te kötődési <em>térképed</em></h2>\n      <p class=\"res-lead\">Két pontszám — egy szorongás-, egy elkerülés-dimenzióra. Metszéspontjuk határozza meg, melyik a négy fő kötődési stílus közül a domináns mintázat. Nem személyiségjegy — állapot, ami kapcsolati tapasztalatokból formálódik és változtatható.</p>\n      <div class=\"scores-row\" id=\"ecr-scoresRow\"></div>\n      <div class=\"quadrant-card\">\n        <h3>A pozíciód a <em>négyzet-térképen</em></h3>\n        <div class=\"sub\">Elkerülés (vízszintes) × Szorongás (függőleges) — Bartholomew-modell</div>\n        <div class=\"quadrant-svg-wrap\"><svg id=\"quadrant-svg-ecr\" viewBox=\"0 0 540 540\"></svg></div>\n        <div id=\"ecr-style-summary\"></div>\n      </div>\n      <div id=\"ecr-dimension-interpretations\"></div>\n      <div class=\"cross-card\"><h3>Kapcsolatok más <em>skálákkal</em></h3><div id=\"ecr-cross-links\"></div></div>\n      <div class=\"therapy-card\"><h3>Terápiás <em>implikációk</em></h3><div class=\"sub\">Empirikusan igazolt kötődés-orientált modalitások</div><div id=\"ecr-therapy-suggestions\"></div></div>\n      <div class=\"refs-card\">\n        <h3>Tudományos <em>háttér</em></h3>\n        <div class=\"ref-item\"><strong>Fraley, R. C., Waller, N. G., & Brennan, K. A. (2000).</strong> An item-response theory analysis of self-report measures of adult attachment. <em>Journal of Personality and Social Psychology, 78</em>, 350–365.</div>\n        <div class=\"ref-item\"><strong>Bartholomew, K., & Horowitz, L. M. (1991).</strong> Attachment styles among young adults. <em>Journal of Personality and Social Psychology, 61</em>, 226–244.</div>\n        <div class=\"ref-item\"><strong>Mikulincer, M., & Shaver, P. R. (2016).</strong> Attachment in Adulthood: Structure, Dynamics, and Change (2nd ed.).</div>\n        <div class=\"ref-item\"><strong>Johnson, S. M. (2019).</strong> Attachment Theory in Practice: EFT with Individuals, Couples, and Families.</div>\n      </div>";
function __oldRender(){
  const scores = {anx:scoreScale('anx'), avd:scoreScale('avd')};
  const style = attachmentStyle(scores.anx.mean, scores.avd.mean);
  try{__cap({n:'ECR-R',h:STYLES[style].name,d:{anx:['Kötődési szorongás',scores.anx.mean,1,7],avd:['Kötődési elkerülés',scores.avd.mean,1,7]}});}catch(e){console.warn('ONI',e)}
  const styleData = STYLES[style];
  const scaleNames = {anx:{tag:'Anxiety',name:'Kötődési szorongás'},avd:{tag:'Avoidance',name:'Kötődési elkerülés'}};
  let scoresHtml='';
  ['anx','avd'].forEach(k=>{
    const s=scores[k], band=bandFor(k,s.mean), pct=((s.mean-1)/6)*100;
    scoresHtml+=`<div class="score-card ${k}"><div class="score-tag">${scaleNames[k].tag}</div><div class="score-name">${scaleNames[k].name}</div><div class="score-value">${s.mean.toFixed(2)}</div><div class="score-out">/ 7.00</div><div class="score-band">${band.label}</div><div class="score-bar"><div class="score-bar-fill" style="width:${pct}%"></div></div></div>`;
  });
  document.getElementById('ecr-scoresRow').innerHTML=scoresHtml;
  drawQuadrant(scores.anx.mean, scores.avd.mean, style);
  document.getElementById('ecr-style-summary').innerHTML=`<div class="style-name">${styleData.name}</div><p style="font-size:12px;color:var(--ink-muted);letter-spacing:0.06em;margin-bottom:14px;font-weight:600;text-transform:uppercase">${styleData.short}</p><div class="style-desc">${styleData.long}</div>`;
  let interpHtml='';
  [{k:'anx',n:'Kötődési szorongás',tag:'Anxiety'},{k:'avd',n:'Kötődési elkerülés',tag:'Avoidance'}].forEach(dim=>{
    const s=scores[dim.k], band=bandFor(dim.k,s.mean);
    interpHtml+=`<div class="interp ${dim.k}"><h3>${dim.n} — <em>${dim.tag}</em></h3><div class="sub">${band.label} a skálán</div><div class="label">Értelmezés</div><p>${INTERP[dim.k][band.key]}</p><div class="label">Hol áll a skálán</div><p>A pontszámod (<strong>${s.mean.toFixed(2)} / 7.00</strong>) ${band.desc}. Külföldi normákhoz nem hasonlítom, mert ez a saját fordítás nincs magyar mintán normázva. Ez <strong>állapotot</strong> tükröz, nem statikus vonást.</p></div>`;
  });
  document.getElementById('ecr-dimension-interpretations').innerHTML=interpHtml;
  const links=getCrossLinks(scores);
  document.getElementById('ecr-cross-links').innerHTML=links.map(l=>`<div class="cross-item"><div class="cross-item-label">${l.label}</div><p>${l.text}</p></div>`).join('');
  const mods=therapySuggestions(scores);
  document.getElementById('ecr-therapy-suggestions').innerHTML=mods.map(m=>`<div class="therapy-mod"><div class="therapy-mod-name">${m.name}</div><p>${m.text}</p></div>`).join('');
  document.getElementById('ecr-results').classList.add('visible');
  setTimeout(()=>{document.getElementById('ecr-results').scrollIntoView({behavior:'smooth',block:'start'});},100);
}
function __run(){
  let payload=null;const __cap=p=>{payload=p;};
  const box=window.document.createElement('div');box.innerHTML='<div id="ecr-results">'+RES_HTML+'</div>';
  const fake={getElementById:id=>box.querySelector('#'+CSS.escape(id)),querySelector:s=>box.querySelector(s),querySelectorAll:s=>box.querySelectorAll(s),createElement:(...a)=>window.document.createElement(...a)};
  const real=document;document=fake;window.__cap=__cap;try{__oldRender();}finally{document=real;delete window.__cap;}
  return {oni:payload,html:box.firstChild.innerHTML};
}
makeTest({
  id:"ecr",key:"ecr-r-responses-v1",name:"ECR-R",c1:"#e11d48",c2:"#2563eb",
  tab:"Kötődés",tabSub:"ECR-R · 36 állítás",scale:LIKERT,
  header:{"status": "valid", "statusText": "Validált eszköz alapján · fordítás tételenként még nem ellenőrzött", "eyebrow": "Experiences in Close Relationships — Revised · Fraley, Waller & Brennan (2000)", "title": "Ahogyan <em>kötődsz</em>", "lead": "Az ECR-R két, egymástól független dimenzió mentén térképezi a felnőttkori kötődési stílust: <em>szorongás</em> (mennyire félsz az elhagyástól) és <em>elkerülés</em> (mennyire tartod távol magad az érzelmi közelségtől). A négy klasszikus kötődési stílus e két tengely kombinációjából adódik.", "intro": "<p><strong>Kitöltési útmutató:</strong> Olvasd el az állításokat, és értékeld 1–7 skálán, mennyire igaz rád <em>általában</em> a közeli szerelmi/párkapcsolataidra vonatkozóan. 5 item fordított pontozású — a rendszer automatikusan kezeli.</p>"},
  sections:[{title:'',desc:'',items:ITEMS.map(it=>({t:it.t}))}],
  score(R){responses={};R.items.forEach(i=>{if(i.raw!==undefined)responses[i.n]=i.raw;});return __run();},
  sum(s){return s.oni;},
  render(R,s){return s.html;}
});
})();

/* ═══════════ 2. SMI — SÉMAMÓDOK ═══════════ */
(function(){
let document=window.document;   /* a régi kód ezen keresztül éri el a DOM-ot; kiértékeléskor egy leválasztott darabra mutat */
const MODES = [
  {id:'vuln',cat:'child',name:'Sebezhető gyermek',en:'Vulnerable Child',color:'#b8912e',bg:'#fef3c722',
    desc:'A "kicsi", aki fájdalmat, magányt, elutasítást él meg. A korai érzelmi sérülések elsődleges hordozója.',
    items:['Magányosnak érzem magam.','Úgy érzem, senki sem szeret igazán.','Szomorúnak és letörtnek érzem magam.','Védtelennek érzem magam.','Félek, hogy elhagynak, akik fontosak nekem.']},
  {id:'angry',cat:'child',name:'Dühös gyermek',en:'Angry Child',color:'#c97a4a',bg:'#fed7aa22',
    desc:'A "kicsi", aki tehetetlen dühöt fejez ki, amikor szükségletei nem teljesülnek.',
    items:['Nagyon haragszom, ha valaki megsért.','Igazságtalannak érzem azt, ami velem történik.','Felháborodom, ha nem azt kapom, amire szükségem van.','Belülről forr a düh, amit nehezen tudok kifejezni.','Amikor haragszom, elveszítem az önkontrollt.']},
  {id:'impulsive',cat:'child',name:'Impulzív gyermek',en:'Impulsive Child',color:'#d4a941',bg:'#fef9c322',
    desc:'A "kicsi", aki azonnal akarja, amit akar. Frusztrációtűrés alacsony.',
    items:['Türelmetlen vagyok, ha nem kapom meg azonnal, amit akarok.','Nehéz nemet mondanom magamnak.','Impulzív döntéseket hozok, amiket később megbánok.','Az unalmas dolgokat nem csinálom meg.','Azonnali kielégülést akarok, akkor is, ha hosszú távon árt.']},
  {id:'happy',cat:'child',name:'Boldog gyermek',en:'Happy Child',color:'#84cc16',bg:'#ecfccb22',
    desc:'A "kicsi", aki szabad, játékos. A jóllét közvetlen forrása.',
    items:['Boldognak érzem magam.','Játékosnak és spontánnak érzem magam.','Élvezem a kis dolgokat is.','Biztonságban érzem magam a világban.','Kíváncsi vagyok az életre.']},
  {id:'compliant',cat:'coping',name:'Alávető',en:'Compliant Surrenderer',color:'#94a3b8',bg:'#e2e8f022',
    desc:'A passzív alkalmazkodás stratégiája. "People-pleaser" viselkedés.',
    items:['Megpróbálom mások kedvében járni, akkor is, ha ez nekem árt.','Hagyom, hogy mások döntsenek helyettem.','Inkább elfojtom a haragomat, mint hogy konfliktus legyen.','Mások szükségletei mindig fontosabbak az enyémnél.','Nem merek nemet mondani, félek, hogy elutasítanak.']},
  {id:'detached',cat:'coping',name:'Elszakadó védő',en:'Detached Protector',color:'#7c2d3c',bg:'#fecdd322',
    desc:'Érzelmi falat épít. Disszociáció, "üresség", "minden rendben" álca.',
    items:['Érzelmileg távol érzem magam másoktól és magamtól.','Néha semmit sem érzek — mintha üres lennék.','Elzárom magam az érzéseimtől, amikor túl sok lesz.','Inkább egyedül vagyok, mint hogy másokra szoruljak.','Tagadom, hogy fáj, akkor is, ha fáj.']},
  {id:'soother',cat:'coping',name:'Elterelő öncsillapító',en:'Detached Self-Soother',color:'#9f1239',bg:'#fecdd333',
    desc:'A belső kényelmetlenséget külső eszközökkel csillapítja: evés, képernyő, alkohol.',
    items:['Az evésbe menekülök, ha rosszul érzem magam.','Órákat töltök képernyő előtt, hogy ne kelljen érezni.','Túldolgozom magam, hogy elkerüljem az érzéseimet.','Elveszek egy tevékenységben, hogy elmeneküljek magam elől.','Olyan dolgokat csinálok, amiket később megbánok, csak hogy ne érezzek.']},
  {id:'grandiose',cat:'coping',name:'Túlkompenzáló önfelfújó',en:'Self-Aggrandizer',color:'#a21caf',bg:'#f5d0fe22',
    desc:'A belső sebezhetőséget grandiozitással fedi. Kompenzatorikus struktúra.',
    items:['Jobb vagyok, mint a legtöbb ember.','Megérdemlem a különleges bánásmódot.','Lenézem a "gyengéket".','Mindent kontroll alatt akarok tartani.','Nem érdekel, mit gondolnak rólam mások.']},
  {id:'bully',cat:'coping',name:'Támadó',en:'Bully and Attack',color:'#7f1d1d',bg:'#fecaca22',
    desc:'A túlkompenzálás agresszív verziója: megfélemlítés, kontrolláló viselkedés.',
    items:['Megijesztem az embereket, hogy ne bántsanak.','Inkább én támadok először, mielőtt más tehetné.','Ha valaki megsért, bosszút állok.','Élvezem, ha mások félnek tőlem — kontrollt ad.','Fenyegető vagyok konfliktusban.']},
  {id:'punitive',cat:'parent',name:'Büntető szülő',en:'Punitive Parent',color:'#1e293b',bg:'#e2e8f033',
    desc:'A belső kritikus hang — önítélet, "haszontalan vagyok".',
    items:['Belülről szigorú, kritikus hangot hallok magammal szemben.','Úgy érzem, valami alapvetően rossz van bennem.','Bűnösnek érzem magam a hibáimért, akkor is, ha kicsik.','Megérdemlem a büntetést, ha rosszul csinálok valamit.','Szigorúbb vagyok magammal, mint bárki más lenne velem.']},
  {id:'demanding',cat:'parent',name:'Követelő szülő',en:'Demanding Parent',color:'#334155',bg:'#e2e8f033',
    desc:'A "sose elég jó" belső hang. Perfekcionizmus, teljesítmény-kényszer.',
    items:['Soha nem érzem, hogy elég jó lennék.','Mindig többet kellene tennem, mint amennyit teszek.','Nem engedhetem meg magamnak a pihenést, amíg nem végeztem a feladatokkal.','Az értékem a teljesítményemhez van kötve.','A "elég jó" nem elég — a tökéletest várom el magamtól.']},
  {id:'healthy',cat:'healthy',name:'Egészséges felnőtt',en:'Healthy Adult',color:'#065f46',bg:'#d1fae522',
    desc:'Az integráló, gondoskodó, határtartó rész.',
    items:['Tudom, mire van szükségem érzelmileg és fizikailag.','Vigyázok magamra egészségesen.','Tudok határt szabni, ha kell.','Reális elvárásokat támasztok magammal szemben.','Segítséget kérek, ha szükségem van rá.']},
  {id:'wise',cat:'healthy',name:'Bölcs felnőtt',en:'Wise Adult',color:'#047857',bg:'#d1fae533',
    desc:'A tudatos, reflexív, döntésképes rész. Integratív, nem érzelmi.',
    items:['Amikor felindult vagyok, tudom lassítani és átgondolni a helyzetet.','Meg tudom nevezni, mi zajlik bennem érzelmileg.','Együttérzek magammal a nehéz pillanatokban is.','Tudok kapcsolódni a fontos emberekhez érett módon.','A saját értékeim szerint hozom a döntéseimet, nem impulzívan.']}
];
let counter=1;
const ITEMS=[];
MODES.forEach(m=>{m.items.forEach(t=>{ITEMS.push({n:counter++,mode:m.id,t});});});
const TOTAL=ITEMS.length;

const LIKERT=[{v:1,l:'soha'},{v:2,l:'ritkán'},{v:3,l:'néha'},{v:4,l:'gyakran'},{v:5,l:'többnyire'},{v:6,l:'mindig'}];
const CATLABELS={child:'I · Gyermek',coping:'II · Koping',parent:'III · Szülő',healthy:'IV · Egészséges'};

function scoreMode(id){
  const items=ITEMS.filter(it=>it.mode===id);
  const vals=items.map(it=>responses[it.n]).filter(v=>v!=null);
  if(!vals.length)return null;
  return {mean:vals.reduce((a,b)=>a+b,0)/vals.length, n:vals.length};
}
function bandFor(score){
  if(score<2.0)return{key:'very-low',label:'Nagyon alacsony',desc:'ritkán aktív'};
  if(score<3.0)return{key:'low',label:'Alacsony',desc:'ritkán aktiválódik'};
  if(score<4.0)return{key:'mid',label:'Közepes',desc:'időnként aktív'};
  if(score<5.0)return{key:'high',label:'Magas',desc:'gyakran aktív'};
  return{key:'very-high',label:'Nagyon magas',desc:'domináns'};
}
const INTERP = {
  vuln:{
    high:`Az érzelmi sebezhetőséged aktív hozzáférésben van. Nehéz, mert fájdalmas. Kedvező, mert a hozzáférhető sebezhetőség terápiásan a legjobb kiindulópont.`,
    'very-high':`A sebezhető gyermek mode nagyon aktív. Ha tartósan magas, érdemes terápiás támogatást keresni.`,
    mid:`Tipikus szintű sebezhetőség. Felszínhez közeli, de nem domináns.`,
    low:`Ritkán jelentkezik sebezhetőség — vagy egészséges belső biztonság, vagy aktív elfojtás (detached protector magas → nem elérhető).`,
    'very-low':`Szinte hozzáférhetetlen sebezhetőség. Kizárólag védekező struktúrák aktívak.`
  },
  angry:{
    high:`Aktív jelenlét. A frusztráció könnyen felszínre kerül. Gyermeki, sokszor tehetetlen düh, ami felnőtt helyzetekre vetül.`,
    'very-high':`Dominánsan aktív. Klinikai cél: az érzelmi gyök elismerése + érett kifejezés.`,
    mid:`Tipikus szintű harag.`,
    low:`Csekély jelenlét. Vagy egészséges integráció, vagy elfojtás (compliant surrenderrel: "elnyelve").`,
    'very-low':`Szinte hiányzó dühös gyermek. Ha alávetés magas, elfojtás jele.`
  },
  impulsive:{
    high:`Aktív. Frusztrációtűrés alacsony.`,
    'very-high':`Domináns impulzivitás. Cél: frustration tolerance építése.`,
    mid:`Tipikus szintű.`,
    low:`Erős önszabályozás.`,
    'very-low':`Szinte alvó. Ha demanding parent magas, ellenőrizd a túlzott önkontrollt.`
  },
  happy:{
    high:`Aktív boldog gyermek — <strong>kifejezetten kedvező profilelem.</strong>`,
    'very-high':`Domináns boldog gyermek — nagyon kedvező. Játékosság, öröm elérhetők.`,
    mid:`Tipikus szintű öröm-elérhetőség.`,
    low:`Csendes boldog gyermek. Érdemes tudatosan építeni.`,
    'very-low':`<strong>Szinte alvó boldog gyermek.</strong> Depresszív állapot vagy krónikus stressz jelzője. Strukturált öröm-építés (behavioral activation).`
  },
  compliant:{
    high:`Aktív alávetés. Konfliktus-kerülés jellemző. Rendszer-szintű kihívás.`,
    'very-high':`Domináns compliant surrender.`,
    mid:`Tipikus szintű alávetés — helyzetfüggő.`,
    low:`Egészséges határtartás.`,
    'very-low':`Szinte hiányzó alávetés. Ha grandiose magas, ellenőrizd túlkompenzációt.`
  },
  detached:{
    high:`Aktív érzelmi elszakadás. Túlélésre jó, kapcsolatokra korlátozó.`,
    'very-high':`Domináns detached protector. Klinikai cél: érzelmek biztonságos visszahozása.`,
    mid:`Tipikus — stresszben aktiválódik.`,
    low:`Általában elérhető érzelmi élet.`,
    'very-low':`Erős érzelmi nyitottság.`
  },
  soother:{
    high:`Aktív külső eszközökre alapozó önszabályozás. Addiktív potenciál.`,
    'very-high':`Domináns self-soother. Cél: új belső szabályozási kapacitások.`,
    mid:`Tipikus szintű öncsillapítás.`,
    low:`Alacsony.`,
    'very-low':`Szinte hiányzó.`
  },
  grandiose:{
    high:`Aktív grandiozitás. Kompenzáló struktúra a sebezhetőség elfedésére.`,
    'very-high':`Domináns. Cél: a sebezhető gyermek elfogadása.`,
    mid:`Tipikus szintű.`,low:`Alacsony.`,'very-low':`Szinte hiányzó.`
  },
  bully:{
    high:`Aktív támadó mode. Klinikai figyelmet érdemel.`,
    'very-high':`Domináns bully.`,
    mid:`Tipikus szintű.`,low:`Alacsony.`,'very-low':`Szinte hiányzó.`
  },
  punitive:{
    high:`Aktív büntető szülő. Belső kritikus hang. <strong>NEM te vagy</strong> — egy belső hang.`,
    'very-high':`<strong>Domináns büntető szülő.</strong> Chair work, imagery rescripting. Schema therapy egyik legerősebb intervenciója.`,
    mid:`Tipikus szintű.`,
    low:`Csekély jelenlét.`,'very-low':`Szinte hiányzó.`
  },
  demanding:{
    high:`Aktív követelő szülő. "Nem elég", "tudsz jobban".`,
    'very-high':`<strong>Domináns követelő szülő.</strong> Burnout magas kockázat. Self-worth elválasztása a teljesítménytől.`,
    mid:`Tipikus szintű.`,low:`Csekély.`,'very-low':`Szinte hiányzó.`
  },
  healthy:{
    'very-high':`<strong>Erős, fejlett egészséges felnőtt.</strong> A célállapot.`,
    high:`Aktív egészséges felnőtt. Erős védő tényező.`,
    mid:`Tipikus szintű integráló rész.`,
    low:`Csekély egészséges felnőtt. <strong>Klinikai célként érdemes itt aktívan dolgozni.</strong>`,
    'very-low':`Szinte hiányzó. Komoly strukturális állapot. Prioritás.`
  },
  wise:{
    'very-high':`Erős bölcs, reflexív rész.`,
    high:`Aktív bölcs felnőtt. Reflexió, tudatos választás.`,
    mid:`Tipikus szintű bölcsesség.`,
    low:`Csekély bölcs rész.`,
    'very-low':`Szinte hiányzó bölcs felnőtt. Impulzív mode-válaszok dominálnak.`
  }
};
function getCrossLinks(scores){
  const links=[];
  if(scores.punitive.mean>=4.0||scores.demanding.mean>=4.0){
    links.push({label:'YSQ átfedés: Defectiveness / Unrelenting Standards',text:`A magas <strong>szülő mode</strong>-ok mögött megfelelő <em>korai maladaptív sémák</em> húzódnak.`});
  }
  if(scores.detached.mean>=4.0){
    links.push({label:'MAIA-2: Trusting és Body Listening alacsonyabb',text:`Az elszakadó védő mód gyakran együtt járhat a MAIA-2 <em>Bizalom</em> és <em>Test-hallgatás</em> alacsonyabb értékeivel. A MAIA-2 megmutatja, nálad így van-e.`});
    links.push({label:'ECR-R: elkerülő kötődés (I. tab)',text:`Detached protector és elkerülő kötődési stílus mély átfedést mutatnak. Nézd meg az I. tabon!`});
  }
  if(scores.vuln.mean>=4.0&&scores.compliant.mean>=4.0){
    links.push({label:'ECR-R: érdemes a szorongó kötődést is megnézni (I. tab)',text:`Magas sebezhető gyermek + magas alávető mód: ez szorongó kötődési mintára utalhat. Az ECR-R megmutatja, nálad így van-e.`});
  }
  if(scores.soother.mean>=4.0){
    links.push({label:'Érzelmi evés és képernyő-menekülés',text:`Az elterelő öncsillapító közvetlen kapcsolata a stresszes evéssel és képernyő-időtöltéssel.`});
  }
  if(scores.grandiose.mean>=4.0&&scores.vuln.mean<3.0){
    links.push({label:'Grandiozitás + elrejtett sebezhetőség',text:`Ha self-aggrandizer magas, de vulnerable child alacsony — tipikus <em>elrejtett sebezhetőség</em>-mintázat.`});
  }
  if(scores.punitive.mean>=4.5){
    links.push({label:'Depressziós tünetekkel átfedés',text:`Nagyon magas büntető szülő gyakori a depressziós epizódokban.`});
  }
  if(scores.happy.mean<2.5){
    links.push({label:'Alacsony boldog gyermek — depresszív jel',text:`Az anhedónia szomszédságában lévő állapot.`});
  }
  if(scores.detached.mean>=4.0){
    links.push({label:'TAS-20 (alexitímia) — III. tab',text:`A detached protector és az alexitímia (különösen DIF) mély átfedést mutatnak. Nézd meg a III. tabon!`});
  }
  return links;
}
function therapySuggestions(scores){
  const mods=[];
  mods.push({name:'Schema Therapy — <em>a mode-modellhez tartozó modalitás</em>',text:`Az SMI keretrendszere maga a schema therapy. Imagery rescripting, chair work, limited reparenting. Bamelis et al. (2014) RCT-ben szignifikáns hatékonyságot mutatott.`});
  if(scores.punitive.mean>=4.0){
    mods.push({name:'Chair work — <em>büntető szülő externalizálása</em>',text:`Üres székre "kihelyezés", healthy adult perspektívából dialógus. Empirikusan hatékony.`});
  }
  if(scores.vuln.mean>=4.0){
    mods.push({name:'Imagery rescripting — <em>sebezhető gyermek gyógyítása</em>',text:`Régi jelenetek "újraírása": gondoskodó felnőtt belép és megadja, amit akkor nem kapott.`});
  }
  if(scores.detached.mean>=4.0){
    mods.push({name:'Limited reparenting — <em>érzelmi újrakapcsolás</em>',text:`Nem racionális belátás — korrektív érzelmi élmény. Csak séma-terapeutával.`});
  }
  if(scores.demanding.mean>=4.0){
    mods.push({name:'Self-worth elválasztása a teljesítménytől',text:`Napi "nem-teljesítmény" élmények tudatosítása, "elég jó" gyakorlása.`});
  }
  if(scores.healthy.mean<3.5||scores.wise.mean<3.5){
    mods.push({name:'Healthy Adult mode építése — <em>explicit cél</em>',text:`Napi "healthy adult check-in", tudatos önreflexió, mentor-kapcsolat.`});
  }
  if(scores.happy.mean<2.5){
    mods.push({name:'Joy reconstruction',text:`Behavioral activation: napi 1-2 percre olyasmivel, ami régen örömet okozott.`});
  }
  return mods;
}

/* — motorhoz illesztés —
   A régi eredményoldal-kód (__oldRender) változatlanul fut egy leválasztott DOM-darabon, a régi
   eredmény-sablonnal; a mentést (ONI.save) elkapjuk és a motor végzi. */
let responses={};
const RES_HTML="<div class=\"res-eyebrow\">Eredmény · Belső mode-térkép · Értelmezés</div>\n      <h2 class=\"res-title\">A te <em>lakásod</em></h2>\n      <p class=\"res-lead\">A 13 mode mindegyike egy \"szoba\". A pontszám azt mutatja, mennyire gyakran szólal meg ez a rész a napi életedben. A dominancia mintázata és a kategóriák egyensúlya beszédesebb, mint bármelyik egyedi pontszám.</p>\n      <div class=\"dominant\" id=\"smi-dominantCard\"></div>\n      <div class=\"map-card\">\n        <h3>A 13 <em>szoba</em></h3>\n        <div class=\"sub\">Kategóriánként csoportosítva · magas mode-ok kiemelve</div>\n        <div id=\"smi-roomsGrid\"></div>\n      </div>\n      <div id=\"smi-mode-interpretations\"></div>\n      <div class=\"cross-card\"><h3>Kapcsolatok más <em>skálákkal</em></h3><div id=\"smi-cross-links\"></div></div>\n      <div class=\"therapy-card\"><h3>Terápiás <em>implikációk</em></h3><div class=\"sub\">Schema Therapy — a mode-modellhez tartozó modalitás</div><div id=\"smi-therapy-suggestions\"></div></div>\n      <div class=\"refs-card\">\n        <h3>Tudományos <em>háttér</em></h3>\n        <div class=\"ref-item\"><strong>Young, J. E., Klosko, J. S., & Weishaar, M. E. (2003).</strong> Schema Therapy: A Practitioner's Guide. Guilford Press.</div>\n        <div class=\"ref-item\"><strong>Young, J. E., Arntz, A., Atkinson, T. et al. (2007).</strong> The Schema Mode Inventory (SMI 1.1).</div>\n        <div class=\"ref-item\"><strong>Lobbestael, J. et al. (2010).</strong> Reliability and validity of the short SMI. <em>Behavioural and Cognitive Psychotherapy, 38</em>, 437–458.</div>\n        <div class=\"ref-item\"><strong>Bamelis, L. L. M. et al. (2014).</strong> RCT of schema therapy for personality disorders. <em>American Journal of Psychiatry, 171</em>, 305–322.</div>\n      </div>";
function __oldRender(){
  const scores={};
  MODES.forEach(m=>{scores[m.id]=scoreMode(m.id);});
  const sorted=Object.entries(scores).sort((a,b)=>b[1].mean-a[1].mean);
  try{var _top=MODES.filter(m=>scores[m.id]).sort((a,b)=>scores[b.id].mean-scores[a.id].mean)[0];__cap({n:'SMI',h:'Legaktívabb mód: '+_top.name,d:Object.fromEntries(MODES.filter(m=>scores[m.id]).map(m=>[m.id,[m.name,scores[m.id].mean,1,6]]))});}catch(e){console.warn('ONI',e)}
  const top=sorted[0];
  const topMode=MODES.find(m=>m.id===top[0]);
  const topBand=bandFor(top[1].mean);
  const dc=document.getElementById('smi-dominantCard');
  dc.style.setProperty('--dc',topMode.color);
  dc.innerHTML=`<div class="dominant-tag">Leggyakrabban aktív mode</div><h3>${topMode.name} — <em>${topBand.label}</em></h3><div class="stats"><span>${CATLABELS[topMode.cat]}</span><span>Pontszám: <strong>${top[1].mean.toFixed(2)}</strong> / 6.00</span><span>${topMode.en}</span></div><p>${INTERP[top[0]][topBand.key]||INTERP[top[0]].mid}</p>`;
  const cats=['child','coping','parent','healthy'];
  let roomsHtml='';
  cats.forEach(cat=>{
    const catMods=MODES.filter(m=>m.cat===cat);
    roomsHtml+=`<div style="grid-column:1/-1;font-family:'Lora',serif;font-style:italic;font-size:14px;color:var(--ink-muted);letter-spacing:0.06em;margin:16px 0 4px;font-weight:600">${CATLABELS[cat]}</div><div class="rooms">`;
    catMods.forEach(mode=>{
      const s=scores[mode.id], band=bandFor(s.mean), pct=((s.mean-1)/5)*100, isHigh=s.mean>=4.0;
      roomsHtml+=`<div class="room ${isHigh?'highlight':''}" style="--rc:${mode.color}"><div class="room-name">${mode.name}</div><div class="room-score">${s.mean.toFixed(2)}</div><div class="room-out">${band.label}</div><div class="room-bar"><div class="room-bar-fill" style="width:${pct}%"></div></div></div>`;
    });
    roomsHtml+=`</div>`;
  });
  document.getElementById('smi-roomsGrid').innerHTML=roomsHtml;
  let interpHtml='';
  sorted.forEach(([id,s])=>{
    const mode=MODES.find(m=>m.id===id);
    const band=bandFor(s.mean);
    if(band.key==='mid')return;
    interpHtml+=`<div class="interp" style="--ic:${mode.color}"><h4>${mode.name} — <em>${band.label}</em></h4><div class="sub">${CATLABELS[mode.cat]} · ${s.mean.toFixed(2)} / 6.00 · ${band.desc}</div><p>${INTERP[id][band.key]||INTERP[id].mid}</p></div>`;
  });
  if(!interpHtml){interpHtml='<div class="interp" style="--ic:var(--emerald)"><p style="color:var(--ink-soft)">Minden mode a tipikus tartományban — kiegyensúlyozott profil.</p></div>';}
  document.getElementById('smi-mode-interpretations').innerHTML=interpHtml;
  const links=getCrossLinks(scores);
  document.getElementById('smi-cross-links').innerHTML=links.length?links.map(l=>`<div class="cross-item"><div class="cross-item-label">${l.label}</div><p>${l.text}</p></div>`).join(''):`<p style="color:var(--ink-muted);font-style:italic">A profilodban nincsenek markáns keresztmintázatok.</p>`;
  const mods=therapySuggestions(scores);
  document.getElementById('smi-therapy-suggestions').innerHTML=mods.map(m=>`<div class="therapy-mod"><div class="therapy-mod-name">${m.name}</div><p>${m.text}</p></div>`).join('');
  document.getElementById('smi-results').classList.add('visible');
  setTimeout(()=>{document.getElementById('smi-results').scrollIntoView({behavior:'smooth',block:'start'});},100);
}
function __run(){
  let payload=null;const __cap=p=>{payload=p;};
  const box=window.document.createElement('div');box.innerHTML='<div id="smi-results">'+RES_HTML+'</div>';
  const fake={getElementById:id=>box.querySelector('#'+CSS.escape(id)),querySelector:s=>box.querySelector(s),querySelectorAll:s=>box.querySelectorAll(s),createElement:(...a)=>window.document.createElement(...a)};
  const real=document;document=fake;window.__cap=__cap;try{__oldRender();}finally{document=real;delete window.__cap;}
  return {oni:payload,html:box.firstChild.innerHTML};
}
makeTest({
  id:"smi",key:"smi-responses-v1",name:"SMI",c1:"#7c3aed",c2:"#d4a017",
  tab:"Belső lakás",tabSub:"SMI · 65 állítás",scale:LIKERT,
  header:{"status": "valid", "statusText": "Validált eszköz alapján · fordítás tételenként még nem ellenőrzött", "eyebrow": "Schema Mode Inventory · Young, Arntz & Atkinson (2007)", "title": "A belső <em>lakás</em>", "lead": "Egy <em>schema mode</em> egy pillanatnyi belső állapot: egy \"én\", aki most éppen a szobában van. Nem személyiségjegy — hangulat, amit egy helyzet aktivál. A 13 mode négy kategóriába rendeződik: gyermek-részek, koping-stratégiák, belső szülő-hangok, és az egészséges felnőtt.", "intro": "<p><strong>Kitöltési útmutató:</strong> Olvasd el az állításokat, és értékeld 1–6 skálán, mennyire jellemzőek rád <em>általában</em>, az utóbbi 6 hónapban. A magas pontszám azt jelenti, hogy az a mode gyakran aktív — nem \"rossz\", csak jelenlévő.</p>"},
  sections:MODES.map(m=>({title:'<em>'+m.name+'</em> · '+m.en,desc:CATLABELS[m.cat]+' — '+m.desc,items:ITEMS.filter(it=>it.mode===m.id).map(it=>({s:m.id,t:it.t}))})),
  score(R){responses={};R.items.forEach(i=>{if(i.raw!==undefined)responses[i.n]=i.raw;});return __run();},
  sum(s){return s.oni;},
  render(R,s){return s.html;}
});
})();

/* ═══════════ 3. TAS-20 — ÉRZELMI SZÓTÁR ═══════════ */
(function(){
let document=window.document;   /* a régi kód ezen keresztül éri el a DOM-ot; kiértékeléskor egy leválasztott darabra mutat */
const ITEMS = [
  {n:1, sub:'DIF', t:'Gyakran nem tudom, milyen érzést élek meg éppen.'},
  {n:2, sub:'DDF', t:'Nehéz megtalálnom a megfelelő szavakat az érzéseimre.'},
  {n:3, sub:'DIF', t:'Vannak testi érzéseim, amiket még az orvosok sem tudnak megmagyarázni.'},
  {n:4, sub:'DDF', t:'Könnyen le tudom írni az érzéseimet.', rev:true},
  {n:5, sub:'EOT', t:'Inkább elemezem a problémákat, mint hogy csak leírjam őket.', rev:true},
  {n:6, sub:'DIF', t:'Amikor felkavart állapotban vagyok, nem tudom, szomorú vagyok-e, dühös vagy megijedt.'},
  {n:7, sub:'DIF', t:'Gyakran zavarba jönnek a testemben keletkező érzések.'},
  {n:8, sub:'EOT', t:'Inkább hagyom, hogy a dolgok megtörténjenek, mint hogy megértsem, miért alakultak úgy, ahogy.'},
  {n:9, sub:'DIF', t:'Vannak érzéseim, amiket nem tudok pontosan azonosítani.'},
  {n:10, sub:'EOT', t:'Az érzelmekkel való kapcsolatban lenni fontos.', rev:true},
  {n:11, sub:'DDF', t:'Nehezen tudom leírni, mit érzek az emberekkel kapcsolatban.'},
  {n:12, sub:'DDF', t:'Azt mondják nekem, jobban le kellene írnom az érzéseimet.'},
  {n:13, sub:'DIF', t:'Nem tudom, mi zajlik bennem.'},
  {n:14, sub:'DIF', t:'Gyakran nem tudom, miért vagyok dühös.'},
  {n:15, sub:'EOT', t:'Inkább a mindennapi tevékenységeikről beszélgetek az emberekkel, mint az érzéseikről.'},
  {n:16, sub:'EOT', t:'Inkább "könnyed" szórakoztató műsorokat nézek, mint pszichológiai drámákat.'},
  {n:17, sub:'DDF', t:'Nehéz a legbelső érzéseimet megosztanom, még közeli barátokkal is.'},
  {n:18, sub:'EOT', t:'Csendes pillanatokban is közel tudom érezni magam valakihez.', rev:true},
  {n:19, sub:'EOT', t:'Az érzéseim vizsgálatát hasznosnak találom a személyes problémáim megoldásában.', rev:true},
  {n:20, sub:'EOT', t:'A rejtett jelentések keresése filmekben vagy színdarabokban elrontja számomra az élvezetet.'}
];
const TOTAL=ITEMS.length;
const LIKERT=[{v:1,l:'egyáltalán nem'},{v:2,l:'inkább nem'},{v:3,l:'semleges'},{v:4,l:'inkább igen'},{v:5,l:'teljesen'}];

function scoreItem(item){const raw=responses[item.n];if(raw==null)return null;return item.rev?(6-raw):raw;}
function scoreTotal(){return ITEMS.reduce((sum,it)=>sum+scoreItem(it),0);}
function scoreSub(id){return ITEMS.filter(it=>it.sub===id).reduce((sum,it)=>sum+scoreItem(it),0);}
function totalBand(score){
  if(score<=51)return{key:'none',label:'Nincs alexitímia',color:'#065f46',desc:'A tipikus tartomány — érzelmi hozzáférés általában elérhető'};
  if(score<=60)return{key:'possible',label:'Lehetséges alexitímia',color:'#b8912e',desc:'Határ menti tartomány — vannak érzelmi hozzáférési nehézségek'};
  return{key:'yes',label:'Alexitímia',color:'#7c2d3c',desc:'Klinikai küszöb felett — jelentős érzelmi szótár-nehézség'};
}
function subBand(id, score){
  const cutoffs={DIF:{high:18,max:35},DDF:{high:13,max:25},EOT:{high:23,max:40}};
  const c=cutoffs[id];
  if(score<=c.high*0.7)return{key:'low',label:'Alacsony',color:'#065f46'};
  if(score<=c.high)return{key:'mid',label:'Közepes',color:'#b8912e'};
  return{key:'high',label:'Magas',color:'#7c2d3c'};
}
const SUB_META={
  DIF:{name:'Érzelmek azonosításának nehézsége',short:'DIF',en:'Difficulty Identifying Feelings',max:35},
  DDF:{name:'Érzelmek leírásának nehézsége',short:'DDF',en:'Difficulty Describing Feelings',max:25},
  EOT:{name:'Kifelé irányuló gondolkodás',short:'EOT',en:'Externally-Oriented Thinking',max:40}
};
const INTERP={
  overall:{
    none:`Az érzelmi feldolgozó rendszered jól működik — érzed, felismered, meg tudod nevezni és kifejezni a saját belső élményeidet. Nem azt jelenti, hogy minden érzelem tiszta és könnyű — csak azt, hogy az érzelmi <em>szótár</em> nem hiányos.`,
    possible:`Határ menti tartományban vagy. Bizonyos érzelmek tisztán elérhetőek, mások (különösen keverék-érzelmek) elmosódottak. Sok felnőttnél ez a "napi" működés — nem patológia, de finomítható.`,
    yes:`<strong>A pontszámod a klinikai küszöb felett van.</strong> A "szótár", ami az érzelmeidet észlelhetővé, azonosíthatóvá és kimondhatóvá teszi, hiányos. Nem karakterhiba — neurokognitív/fejlődési mintázat, aminek többféle háttere lehet. A pontszám önmagában nem mutatja meg, nálad melyik.`
  },
  DIF:{
    low:`Jó érzelem-azonosítási képesség. A testi/érzelmi feszültséget könnyen tudod címkézni.`,
    mid:`Közepes szint. Egyszerűbb érzelmek tiszták, bonyolultabbak elmosódottabbak.`,
    high:`<strong>Emelt szintű nehézség az azonosításban.</strong> A feszültség jelen van, de a "mi ez pontosan?" kérdésre nincs válasz. Érdemes összevetni a MAIA-2 testi figyelem skáláival.`
  },
  DDF:{
    low:`Jó érzelem-leírási képesség.`,
    mid:`Közepes szint. Egyszerű érzelmek szavakká alakíthatók, komplexebbek nem.`,
    high:`<strong>Emelt nehézség a leírásban.</strong> "Hogy vagy most?" — nincs válasz. Nem hazugságból, hanem hozzáférhetetlenségből. Partneri kapcsolatokban félreértést szül.`
  },
  EOT:{
    low:`Az érzelmi, belső élmények természetes része a figyelmednek.`,
    mid:`Külső, gyakorlati fókuszú, de introspekció elérhető.`,
    high:`<strong>Kifelé orientált gondolkodási stílus.</strong> "Miért érzem ezt" idegennek tűnik. A legkevésbé mozdítható alexitímia-komponens.`
  }
};
function getCrossLinks(scores, total){
  const links=[];
  if(scores.DIF>=18){
    links.push({label:'MAIA-2: Emotional Awareness alacsony',text:`Magas DIF gyakran együtt járhat a MAIA-2 <em>Érzelmi tudatosság</em> alacsonyabb pontszámával.`});
  }
  if(scores.DIF>=18&&scores.DDF>=13){
    links.push({label:'ECR-R: elkerülő kötődéssel átfedés (I. tab)',text:`A magas DIF+DDF profil erős korrelációt mutat az elkerülő kötődési stílussal. <strong>Nézd meg az I. tabon!</strong>`});
  }
  if(scores.EOT<20&&scores.DIF>=18){
    links.push({label:'"Belülről akarok jönni, de nem tudom megnevezni"',text:`Alacsony EOT + magas DIF: tudod, hogy fontos érteni, mit érzel, de nem érkezik meg a válasz. A szomatikus/interoceptív munka a legmegtérülőbb belépési pont.`});
  }
  if(scores.DDF>=13){
    links.push({label:'Írás mint eszköz — journaling protokollok',text:`A DDF egyik legjobban dokumentált intervenciója: érzelem-lista alapú journaling (Feelings Wheel).`});
  }
  if(total>=52){
    links.push({label:'SMI: Detached Protector kapcsolat (II. tab)',text:`A TAS-20 emelt pontszáma gyakran együtt jár a magas <em>Detached Protector</em> mode-dal. <strong>Nézd meg a II. tabon!</strong>`});
  }
  if(total<=51&&scores.DIF<=14){
    links.push({label:'Nem alexitímia — normál profil',text:`A pontszámod a tipikus tartományban van. Ha érzelmi nehézségeket élsz meg, azok inkább szituációsak.`});
  }
  return links;
}
function therapySuggestions(scores, total){
  const mods=[];
  if(total>=52){
    mods.push({name:'Emotion-Focused Therapy (EFT) — <em>Greenberg</em>',text:`Alexitímiára adaptált: nem az érzelmekről beszélni, hanem <strong>megélni</strong> a terápián. Empty-chair, focusing. Ogrodniczuk et al. (2011): alexitímia jelentős csökkenését mutatta.`});
    mods.push({name:'MABT — <em>Mindful Awareness in Body-Oriented Therapy</em>',text:`Testi tudatosságtól érzelmi tudatosság felé. Alexitím kliensekre kifejezetten hatékony — "mi zajlik a testedben most?" könnyebben megválaszolható.`});
  }
  if(scores.DIF>=18){
    mods.push({name:'Érzelem-lista alapú journaling — <em>Feelings Wheel</em>',text:`<strong>Egy pillanat, egy szó.</strong> A Plutchik-kör segít — nem kényszerít teremtésre, csak választásra. 6-8 hét után automatikus címkézés.`});
  }
  if(scores.DDF>=13){
    mods.push({name:'"Csendes megnevezés"',text:`Ha érzés megjelenik, mielőtt beszélnél, először magadnak nevezd meg egy szóval csendben. Pontosítás: harag? szorongás? irritáció? DDF-et közvetlenül fejleszti.`});
  }
  if(scores.EOT>=24&&total>=52){
    mods.push({name:'Reflexió-építés — <em>lassan, kis dózisban</em>',text:`Napi <strong>2 perc</strong> introspekció: "mi történt ma bennem?". Kis dózis, hosszú távú neuroplaszticitás.`});
  }
  if(total<=51){
    mods.push({name:'Fenntartás — nincs specifikus intervenció',text:`Az érzelmi feldolgozó rendszered működik. Egyéb életterületeken felmerülő problémákkal más eszközökkel kell dolgozni.`});
  }
  mods.push({name:'Pszichoedukáció',text:`Nagyobb önismeret: az alexitímia neurokognitív dimenzió (nem karakterhiba). Ismeret + tolerancia magaddal szemben.`});
  return mods;
}

/* — motorhoz illesztés —
   A régi eredményoldal-kód (__oldRender) változatlanul fut egy leválasztott DOM-darabon, a régi
   eredmény-sablonnal; a mentést (ONI.save) elkapjuk és a motor végzi. */
let responses={};
const RES_HTML="<div class=\"res-eyebrow\">Eredmény · Alexitímia-profil · Klinikai kontextus</div>\n      <h2 class=\"res-title\">A te érzelmi <em>szótárad</em></h2>\n      <p class=\"res-lead\">A TAS-20 összpontszáma 20 és 100 között skálázódik. Cut-offok: ≤51 nincs alexitímia · 52–60 lehetséges · ≥61 alexitímia. Nem diagnózis — jelzés a rendszered állapotáról.</p>\n      <div class=\"total-card\" id=\"tas-totalCard\"></div>\n      <div class=\"sub-scores\" id=\"tas-subScores\"></div>\n      <div class=\"interp-card\" id=\"tas-interpCard\"></div>\n      <div class=\"cross-card\"><h3>Kapcsolatok más <em>területekkel</em></h3><div id=\"tas-cross-links\"></div></div>\n      <div class=\"therapy-card\"><h3>Terápiás <em>implikációk</em></h3><div class=\"sub\">Alexitímia-tudatos beavatkozások</div><div id=\"tas-therapy-suggestions\"></div></div>\n      <div class=\"refs-card\">\n        <h3>Tudományos <em>háttér</em></h3>\n        <div class=\"ref-item\"><strong>Bagby, R. M., Parker, J. D. A., & Taylor, G. J. (1994).</strong> The twenty-item Toronto Alexithymia Scale. <em>Journal of Psychosomatic Research, 38</em>, 23–32.</div>\n        <div class=\"ref-item\"><strong>Taylor, G. J., Bagby, R. M., & Parker, J. D. A. (2003).</strong> The 20-Item Toronto Alexithymia Scale IV. <em>Journal of Psychosomatic Research, 55</em>, 277–283.</div>\n        <div class=\"ref-item\"><strong>Ogrodniczuk, J. S., Piper, W. E., & Joyce, A. S. (2011).</strong> Effect of alexithymia on the process and outcome of psychotherapy. <em>Psychiatry Research, 190</em>, 43–48.</div>\n      </div>";
function __oldRender(){
  const total=scoreTotal();
  const scores={DIF:scoreSub('DIF'),DDF:scoreSub('DDF'),EOT:scoreSub('EOT')};
  try{__cap({n:'TAS-20',h:totalBand(total).label,d:{total:['TAS-20 összpontszám',total,20,100],DIF:[SUB_META.DIF.name,scores.DIF,7,35],DDF:[SUB_META.DDF.name,scores.DDF,5,25],EOT:[SUB_META.EOT.name,scores.EOT,8,40]}});}catch(e){console.warn('ONI',e)}
  const tBand=totalBand(total);
  const tc=document.getElementById('tas-totalCard');
  tc.style.setProperty('--tc',tBand.color);
  tc.innerHTML=`<div class="total-label">Összpontszám · Total TAS-20 score</div><div class="total-value">${total}</div><div class="total-out">/ 100 · cut-offs: ≤51 · 52–60 · ≥61</div><div class="total-band">${tBand.label}</div><p style="color:var(--ink-soft);font-size:14.5px;margin-top:18px;max-width:520px;margin-left:auto;margin-right:auto;line-height:1.65;font-weight:400">${tBand.desc}</p>`;
  let subHtml='';
  ['DIF','DDF','EOT'].forEach(sub=>{
    const s=scores[sub], meta=SUB_META[sub], band=subBand(sub,s), pct=(s/meta.max)*100;
    subHtml+=`<div class="sub-card" style="--sc:${band.color}"><div class="abbr">${meta.short} · ${meta.en}</div><h4><em>${meta.name}</em></h4><div class="val">${s}</div><div class="out">/ ${meta.max}</div><div class="band">${band.label}</div><div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div></div>`;
  });
  document.getElementById('tas-subScores').innerHTML=subHtml;
  let interpHtml=`<h3>Klinikai <em>értelmezés</em></h3><div class="interp-section" style="--sc:${tBand.color}"><h4>Összkép — ${tBand.label}</h4><p>${INTERP.overall[tBand.key]}</p></div>`;
  ['DIF','DDF','EOT'].forEach(sub=>{
    const band=subBand(sub,scores[sub]), meta=SUB_META[sub];
    interpHtml+=`<div class="interp-section" style="--sc:${band.color}"><h4>${meta.short} — ${band.label}</h4><p>${INTERP[sub][band.key]}</p></div>`;
  });
  document.getElementById('tas-interpCard').innerHTML=interpHtml;
  const links=getCrossLinks(scores,total);
  document.getElementById('tas-cross-links').innerHTML=links.length?links.map(l=>`<div class="cross-item"><div class="cross-item-label">${l.label}</div><p>${l.text}</p></div>`).join(''):`<p style="color:var(--ink-muted);font-style:italic">A profilodban nincsenek markáns keresztmintázatok.</p>`;
  const mods=therapySuggestions(scores,total);
  document.getElementById('tas-therapy-suggestions').innerHTML=mods.map(m=>`<div class="therapy-mod"><div class="therapy-mod-name">${m.name}</div><p>${m.text}</p></div>`).join('');
  document.getElementById('tas-results').classList.add('visible');
  setTimeout(()=>{document.getElementById('tas-results').scrollIntoView({behavior:'smooth',block:'start'});},100);
}
function __run(){
  let payload=null;const __cap=p=>{payload=p;};
  const box=window.document.createElement('div');box.innerHTML='<div id="tas-results">'+RES_HTML+'</div>';
  const fake={getElementById:id=>box.querySelector('#'+CSS.escape(id)),querySelector:s=>box.querySelector(s),querySelectorAll:s=>box.querySelectorAll(s),createElement:(...a)=>window.document.createElement(...a)};
  const real=document;document=fake;window.__cap=__cap;try{__oldRender();}finally{document=real;delete window.__cap;}
  return {oni:payload,html:box.firstChild.innerHTML};
}
makeTest({
  id:"tas",key:"tas-20-responses-v1",name:"TAS-20",c1:"#10b981",c2:"#2563eb",
  tab:"Érzelmi szótár",tabSub:"TAS-20 · 20 állítás",scale:LIKERT,
  header:{"status": "valid", "statusText": "Validált eszköz alapján · fordítás tételenként még nem ellenőrzött", "eyebrow": "Toronto Alexithymia Scale · Bagby, Parker & Taylor (1994)", "title": "Az érzelmi <em>szótár</em>", "lead": "Az <em>alexitímia</em> nem érzelemhiány. A rendszered ugyanúgy termel érzelmeket — csak a <strong>szótár</strong>, ami észlelhető, azonosítható, kimondható jelenségekké alakítja, hiányos. Az érzelem ott van; a szó, ami rá vonatkoznék, nincs.", "intro": "<p><strong>Kitöltési útmutató:</strong> Olvasd el az állításokat, és értékeld 1–5 skálán, mennyire igaz rád <em>általában</em>. Nem egy adott pillanatra — általánosan.</p>\n      <p>A 20 itemből 5 fordított pontozású. A rendszer kezeli.</p>\n      <div class=\"likert-row\">\n        <div><span>1</span> egyáltalán nem</div>\n        <div><span>2</span> inkább nem</div>\n        <div><span>3</span> semleges</div>\n        <div><span>4</span> inkább igen</div>\n        <div><span>5</span> teljesen</div>\n      </div>"},
  sections:[{title:'',desc:'',items:ITEMS.map(it=>({t:it.t}))}],
  score(R){responses={};R.items.forEach(i=>{if(i.raw!==undefined)responses[i.n]=i.raw;});return __run();},
  sum(s){return s.oni;},
  render(R,s){return s.html;}
});
})();
