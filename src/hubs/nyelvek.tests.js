/* nyelvek hub — a kézzel írt nyelvek.html-ből átköltöztetve. A pontozó és az eredményoldal-kód változatlan. */
/* közös diagram-segéd a régi oldalról (radar) */
window.CHARTS = (function(){
  // Radar chart (pentagon 5-axis, hexagon 6-axis, stb.)
  function radar(svgEl, data, opts){
    const W=480, H=480, cx=W/2, cy=H/2;
    const R=170;  // outer radius
    const n = data.length;
    const angleStep = (2*Math.PI)/n;
    const startAngle = -Math.PI/2;  // start at top
    const maxVal = opts.max || Math.max(...data.map(d=>d.value));
    const gridLevels = opts.gridLevels || 4;
    const color = opts.color || '#2563eb';
    const fillColor = opts.fillColor || 'rgba(37,99,235,0.18)';
    const strokeColor = opts.strokeColor || color;

    let html = '';
    // Grid — concentric polygons (dark bg, light grid)
    for(let g=1; g<=gridLevels; g++){
      const gr = (R*g)/gridLevels;
      let pts = '';
      for(let i=0; i<n; i++){
        const angle = startAngle + i*angleStep;
        const x = cx + gr*Math.cos(angle);
        const y = cy + gr*Math.sin(angle);
        pts += `${x},${y} `;
      }
      html += `<polygon points="${pts.trim()}" fill="none" stroke="rgba(147,197,253,0.18)" stroke-width="${g===gridLevels?1.5:1}" stroke-dasharray="${g===gridLevels?'':'3,4'}"/>`;
    }
    // Axes
    for(let i=0; i<n; i++){
      const angle = startAngle + i*angleStep;
      const x = cx + R*Math.cos(angle);
      const y = cy + R*Math.sin(angle);
      html += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(147,197,253,0.18)" stroke-width="1"/>`;
    }
    // Data polygon
    let dataPts = '';
    const dotSpec = [];
    for(let i=0; i<n; i++){
      const angle = startAngle + i*angleStep;
      const r = (data[i].value/maxVal)*R;
      const x = cx + r*Math.cos(angle);
      const y = cy + r*Math.sin(angle);
      dataPts += `${x},${y} `;
      dotSpec.push({x,y,val:data[i].value});
    }
    html += `<polygon points="${dataPts.trim()}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round"/>`;
    // Data dots + value labels
    dotSpec.forEach(d=>{
      html += `<circle cx="${d.x}" cy="${d.y}" r="6" fill="${strokeColor}" stroke="#fff" stroke-width="2"/>`;
    });
    // Labels around
    for(let i=0; i<n; i++){
      const angle = startAngle + i*angleStep;
      const lr = R + 32;
      const x = cx + lr*Math.cos(angle);
      const y = cy + lr*Math.sin(angle);
      let anchor='middle';
      if(Math.cos(angle) > 0.3) anchor='start';
      else if(Math.cos(angle) < -0.3) anchor='end';
      const dyLine1 = -4;
      const dyLine2 = 14;
      html += `<text x="${x}" y="${y+dyLine1}" text-anchor="${anchor}" font-family="Fraunces,Cardo,serif" font-size="14" font-weight="500" fill="#f1f5f9">${data[i].label}</text>`;
      html += `<text x="${x}" y="${y+dyLine2}" text-anchor="${anchor}" font-family="Manrope,Inter,sans-serif" font-size="13" font-weight="700" fill="${strokeColor}">${data[i].value}<tspan font-size="10" fill="rgba(203,213,225,0.6)" font-weight="500">/${maxVal}</tspan></text>`;
    }
    // Csillag akcent középen
    html += `<circle cx="${cx}" cy="${cy}" r="3" fill="${strokeColor}"/>`;
    // Scale numbers on top axis
    for(let g=1; g<=gridLevels; g++){
      const y = cy - (R*g)/gridLevels;
      const val = Math.round((maxVal*g)/gridLevels);
      html += `<text x="${cx+5}" y="${y-3}" font-family="Manrope,sans-serif" font-size="9" fill="rgba(147,197,253,0.45)" font-weight="500">${val}</text>`;
    }
    svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svgEl.innerHTML = html;
  }

  // Horizontal bar chart — items with score
  function barGroup(container, groups){
    let html = '';
    groups.forEach(group=>{
      html += `<div class="bar-group"><h4 style="color:${group.color}">${group.title}</h4>`;
      group.items.forEach(item=>{
        const pct = Math.round((item.value/group.max)*100);
        html += `<div class="bar-row"><div class="bar-row-name">${item.label}</div><div class="bar-row-value" style="font-family:'Fraunces',serif;font-style:italic;color:${group.color};font-weight:600;font-size:15px">${item.value}<span style="font-size:11px;color:rgba(15,23,42,0.45);font-weight:500">/${group.max}</span></div><div class="bar-row-track"><div class="bar-row-fill" style="width:${pct}%;background:linear-gradient(90deg,${group.color},${group.colorLight||group.color})"></div></div></div>`;
      });
      html += `</div>`;
    });
    container.innerHTML = html;
  }

  return { radar, barGroup };
})();


/* ═══════════ 1. LOVE LANGUAGES ═══════════ */
(function(){
let document=window.document;   /* a régi kód ezen keresztül éri el a DOM-ot; kiértékeléskor egy leválasztott darabra mutat */
// 5 kategória:
// A = Words of Affirmation (elismerő szavak)
// B = Quality Time (minőségi idő)
// C = Receiving Gifts (ajándék)
// D = Acts of Service (szolgálat)
// E = Physical Touch (érintés)
// 30 pair × 2 option = 60 items, mindegyik kategória 12-szer szerepel
const PAIRS = [
  {n:1,  a:{c:'A',t:'Szeretem, ha a partnerem kedves szavakkal fejezi ki, hogy értékel.'}, b:{c:'E',t:'Szeretem, ha a partnerem megérint, például átölel vagy megfog kézen.'}},
  {n:2,  a:{c:'B',t:'Szeretem, ha csak együtt vagyunk, minden más nélkül.'},        b:{c:'D',t:'Szeretem, ha a partnerem segít nekem egy feladatban.'}},
  {n:3,  a:{c:'C',t:'Szeretem, ha a partnerem egy kis meglepetéssel lep meg.'},     b:{c:'B',t:'Szeretem, ha valóban meghallgat, amikor beszélek hozzá.'}},
  {n:4,  a:{c:'D',t:'Szeretem, ha a partnerem elvégez valamit, amit én is megtehetnék.'}, b:{c:'C',t:'Szeretem, ha a partnerem gondolt rám és hozott valamit.'}},
  {n:5,  a:{c:'E',t:'Szeretem, ha a partnerem megsimogatja a hátamat vagy kezembe fogja a kezem.'}, b:{c:'A',t:'Szeretem, ha kimondja, hogy szeret.'}},
  {n:6,  a:{c:'A',t:'Szeretem, ha kifejezetten dicsér valamiért, amit tettem.'}, b:{c:'B',t:'Szeretem, ha együtt csinálunk valamit, csak mi ketten.'}},
  {n:7,  a:{c:'C',t:'A megfontolt ajándék többet jelent nekem, mint sok más gesztus.'}, b:{c:'E',t:'A gyengéd érintés többet jelent nekem, mint sok más gesztus.'}},
  {n:8,  a:{c:'D',t:'Amikor a partnerem elvégez helyettem egy háztartási feladatot, szeretve érzem magam.'}, b:{c:'A',t:'Amikor bókol, szeretve érzem magam.'}},
  {n:9,  a:{c:'B',t:'Szeretem, amikor félreteszi a telefonját, és csak rám figyel.'}, b:{c:'C',t:'Szeretem, amikor egy apró ajándékkal kifejezi, hogy gondolt rám.'}},
  {n:10, a:{c:'A',t:'Az elismerő szavak, hogy jól végeztem valamit, sokat jelentenek nekem.'}, b:{c:'D',t:'Amikor a partnerem tesz értem valamit, amitől megkönnyíti a napom, sokat jelent.'}},
  {n:11, a:{c:'B',t:'Szeretek hosszan beszélgetni a partneremmel.'}, b:{c:'E',t:'Szeretem, ha a partnerem közel ül hozzám, és fizikai kapcsolatban vagyunk.'}},
  {n:12, a:{c:'E',t:'A gyengéd érintés a nap folyamán megerősít.'}, b:{c:'A',t:'A partnerem kedves szavai a nap folyamán megerősítenek.'}},
  {n:13, a:{c:'C',t:'Fontos nekem, hogy a partnerem megünnepeljen születésnapokat vagy évfordulókat egy ajándékkal.'}, b:{c:'D',t:'Fontos nekem, hogy a partnerem segítsen a heti terheim csökkentésében.'}},
  {n:14, a:{c:'A',t:'Szeretem hallani, hogy szép vagyok / jó vagyok / a partnerem büszke rám.'}, b:{c:'B',t:'Szeretem, ha egy egész estét együtt tölthetünk, csak mi ketten.'}},
  {n:15, a:{c:'D',t:'Ha a partnerem elvégez valamit, ami rám vár, felesleg nélkül érzem, hogy törődik.'}, b:{c:'C',t:'Ha egy váratlan, gondos ajándékot kapok, érzem, hogy törődik.'}},
  {n:16, a:{c:'E',t:'A csók, ölelés, hozzáérés hitelesíti, hogy szeret.'}, b:{c:'B',t:'A megosztott idő és a jelenlét hitelesíti, hogy szeret.'}},
  {n:17, a:{c:'C',t:'Egy ajándékkor a "gondoltál rám" számít igazán.'}, b:{c:'A',t:'Egy elismerő mondat, hogy "látom, mit teszel", számít igazán.'}},
  {n:18, a:{c:'A',t:'A dicséret és bátorítás energiát ad.'}, b:{c:'D',t:'Amikor a partnerem levesz rólam egy feladatot, energiát kapok.'}},
  {n:19, a:{c:'D',t:'A partnerem a szeretetét megmutatja azzal, hogy segít nekem konkrét dolgokban.'}, b:{c:'E',t:'A partnerem a szeretetét megmutatja azzal, hogy fizikailag közel van hozzám.'}},
  {n:20, a:{c:'B',t:'Az együtt töltött, megosztott idő az elsődleges szeretet-forrás.'}, b:{c:'A',t:'A kimondott elismerő szavak az elsődleges szeretet-forrás.'}},
  {n:21, a:{c:'E',t:'A rendszeres fizikai kontaktus (pl. napi ölelés) fontos nekem.'}, b:{c:'C',t:'A rendszeres apró figyelmességek (pl. hozott kávé) fontosak nekem.'}},
  {n:22, a:{c:'C',t:'Egy ajándékot, amit a partnerem gondosan kiválasztott, sokáig őrzök.'}, b:{c:'B',t:'Egy közös élményt, amit együtt éltünk át, sokáig őrzök.'}},
  {n:23, a:{c:'D',t:'Ha a partnerem elvégez egy szívességet nekem, ez fontos szeretet-jel.'}, b:{c:'B',t:'Ha a partnerem félreteszi a napját, hogy velem legyen, ez fontos szeretet-jel.'}},
  {n:24, a:{c:'C',t:'A partnerem apró figyelmességei (egy virág, egy kártya) hitelesítik a szeretetét.'}, b:{c:'D',t:'A partnerem gyakorlati segítsége (elvégzett feladat) hitelesíti a szeretetét.'}},
  {n:25, a:{c:'B',t:'A megosztott csendben ülés is szeretet-forma.'}, b:{c:'E',t:'A gyengéd érintés csend közben szeretet-forma.'}},
  {n:26, a:{c:'A',t:'Egy szeretem-üzenet írásban is sokat jelent.'}, b:{c:'C',t:'Egy meglepetés-tárgy vagy virág sokat jelent.'}},
  {n:27, a:{c:'E',t:'Amikor a partnerem hozzám bújik, elhiszem, hogy szeret.'}, b:{c:'D',t:'Amikor a partnerem tesz valamit értem, elhiszem, hogy szeret.'}},
  {n:28, a:{c:'A',t:'A szavak — ha őszinték — legmélyebbre hatnak.'}, b:{c:'E',t:'Az érintés — ha gyengéd — legmélyebbre hat.'}},
  {n:29, a:{c:'B',t:'Fontosabb nekem, hogy jelen legyünk együtt, mint hogy sokat beszéljünk.'}, b:{c:'C',t:'Fontosabb nekem, hogy a partnerem konkrétan mutassa a szeretetét tárgyakkal.'}},
  {n:30, a:{c:'D',t:'A "tettek beszélnek hangosabban a szavaknál" — nekem pont ez igaz.'}, b:{c:'E',t:'A test emlékezik — nekem a fizikai közelség beszél a leghangosabban.'}}
];
const TOTAL=PAIRS.length;

function scores(){
  const s={A:0,B:0,C:0,D:0,E:0};
  Object.values(responses).forEach(code=>{if(s[code]!==undefined)s[code]++;});
  return s;
}
const CATEGORIES = {
  A:{name:'Elismerő szavak',en:'Words of Affirmation',color:'#b8912e',desc:'A szeretet szavakkal — dicséret, bátorítás, "szeretlek", elismerés. Egy őszinte "büszke vagyok rád" több nálad, mint egy órányi együttlét szavak nélkül.'},
  B:{name:'Minőségi idő',en:'Quality Time',color:'#7c2d3c',desc:'Az osztatlan, jelenléttel töltött együttlét. A telefon félretéve, figyelem rád fókuszálva. Fontos: nem a mennyiség — a minőség.'},
  C:{name:'Ajándék elfogadása',en:'Receiving Gifts',color:'#065f46',desc:'Nem az ajándék értéke, hanem az, hogy a másik <em>gondolt rád</em>. Egy szedett virág, egy megjegyzett kedvenc dolgod. A tárgy a szeretet szimbóluma.'},
  D:{name:'Szolgálat',en:'Acts of Service',color:'#1e3a8a',desc:'"Tettek beszélnek hangosabban a szavaknál." A partner elvégez valamit, amivel megkönnyíti a napodat — mos, főz, elintéz. Ez a szeretet gyakorlati jele.'},
  E:{name:'Fizikai érintés',en:'Physical Touch',color:'#9f1239',desc:'A gyengéd kontaktus — ölelés, kézfogás, simogatás, csók. Nem szexuális elsősorban — jelenlét-érintés. A test emlékezik.'}
};
const INTERP = {
  A:{
    primary:`Elsődleges nyelved az <strong>elismerő szavak</strong>. Amikor a partnered kimondja, hogy értékel, dicséret, bátorít — akkor érzed magad szeretve. Ha ez hiányzik, gyakran feltételezed, hogy nem szeret, akkor is, ha más gesztusaival mutatja. <em>Amit kérj</em>: rendszeres verbális elismerés, "látlak" üzenetek, kimondott érzelmek. <em>Vigyázz</em>: a kritika ezen a nyelven kettős fájdalom — sokkal jobban megsebez, mint másokat.`,
    strong:`A második vagy harmadik erős nyelved az elismerő szavak.`,
    weak:`Az elismerő szavak nem elsődleges nyelved. Ez nem azt jelenti, hogy ne örülnél nekik — csak azt, hogy nem <em>ez</em> az, amiből szeretve érzed magad elsősorban.`
  },
  B:{
    primary:`Elsődleges nyelved a <strong>minőségi idő</strong>. A jelenlét, az osztatlan figyelem, a közös élmény — ez tölt fel. Egy sms-váltás nem helyettesíti a személyes találkozást; egy ajándék nem helyettesíti az együtt töltött időt. <em>Amit kérj</em>: rendszeres, telefontól mentes együttlét, tervezett randi-idő. <em>Vigyázz</em>: ha a partnered "veled van, de nem veled", az különösen fáj — jelenléthiány = szeretethiány érzés.`,
    strong:`Erős másodlagos nyelved a minőségi idő.`,
    weak:`Nem a minőségi idő a fő nyelved. Az egyedüli időt tolerálod (vagy értékeled), és a szeretetet más csatornákon jobban érzed.`
  },
  C:{
    primary:`Elsődleges nyelved az <strong>ajándék elfogadása</strong>. Nem a materializmusról van szó — az ajándék jelképe annak, hogy a partnered <em>gondolt rád</em>. Egy virág az utcáról, egy megjegyzett kedvenc könyv, egy váratlan meglepetés. A tárgy a szeretet fizikai lenyomata. <em>Vigyázz</em>: az "elfelejtett" évforduló, névnap, születésnap különösen sebez — nem az ajándék hiányzik, hanem a "nem gondoltál rám" üzenet.`,
    strong:`Erős másodlagos nyelved az ajándék.`,
    weak:`Nem az ajándék a fő nyelved. Örülhetsz nekik, de nem ezen keresztül érzed a szeretetet elsősorban.`
  },
  D:{
    primary:`Elsődleges nyelved a <strong>szolgálat</strong>. Amikor a partnered tesz érted valamit — elmossa a bögrét, elintéz egy hivatalos ügyet, főz, amikor fáradt vagy — ez a szeretet gyakorlati jele. "Tettek beszélnek hangosabban a szavaknál." <em>Amit kérj</em>: konkrét gyakorlati segítség, felajánlott feladatátvétel. <em>Vigyázz</em>: az "ígérete, de nem csinálja meg" nálad kettős csalódás — nemcsak a feladat marad, hanem a "nem is szeretsz eléggé" üzenet is.`,
    strong:`Erős másodlagos nyelved a szolgálat.`,
    weak:`Nem a szolgálat a fő nyelved. Örülsz, ha a partnered segít, de nem ezen keresztül érzed a szeretetet elsősorban.`
  },
  E:{
    primary:`Elsődleges nyelved a <strong>fizikai érintés</strong>. Az ölelés, kézfogás, simogatás, közelség — ezek adják a "szeretve vagyok" élményt. Ez nem szexuális elsősorban: az érintés maga a szeretet. <em>Amit kérj</em>: rendszeres, nem-szexuális fizikai kontaktus (napi ölelés, kézfogás, közelség séta közben). <em>Vigyázz</em>: a fizikai távolság — akár csak órákra — hidegnek élheted meg, akkor is, ha a partner szóban vagy tettekben szeret.`,
    strong:`Erős másodlagos nyelved a fizikai érintés.`,
    weak:`Nem a fizikai érintés a fő nyelved. Örülsz neki, de nem ezen keresztül érzed elsősorban a szeretetet.`
  }
};
function crossLinks(scores){
  const links=[];
  const sorted=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  const primary=sorted[0][0];
  const weak=sorted[4][0];
  links.push({label:'Partner-egyeztetés',text:`Az elsődleges nyelved az egyik legfontosabb információ egy partnerről: ha nem tudja, nem tud "rád találni", akkor is, ha szeret. <strong>Mondd el neki</strong>. A partneri kommunikáció itt kezdődik — nem a "találja ki magától".`});
  if(scores[weak]<=2){
    const wm=CATEGORIES[weak];
    links.push({label:`Nagyon gyenge nyelv: ${wm.name}`,text:`Ez a nyelv szinte hiányzik nálad. Ha a jelenlegi partnered elsődleges nyelve ez, komoly félreértés potenciál — <em>ő adja</em>, te <em>nem érzed</em>. Érdemes tudnia.`});
  }
  if(primary==='E'){
    links.push({label:'MAIA-2 Trusting kapcsolat',text:`A fizikai érintés-elsődleges nyelvhez erős testi biztonság-érzet szükséges. Ha a MAIA-2 Trusting alacsony, az érintés-igény együtt járhat testi konfliktussal is. Nézd meg.`});
  }
  if(primary==='B'){
    links.push({label:'ECR-R szorongásos kötődés potenciálisan',text:`A minőségi idő-elsődleges nyelv gyakran korrelál a szorongásos kötődéssel — a "jelen légy velem" alapélmény. Nem szükségszerű, de érdemes megnézni.`});
  }
  if(primary==='A'){
    links.push({label:'SMI Vulnerable Child kapcsolat',text:`Az elismerő szavak-elsődleges nyelv gyakran együtt jár egy "nem vagyok elég" alapsémával — a külső validáció fontossága ebből fakadhat. Ha SMI Punitive Parent magas, ez különösen fontos.`});
  }
  return links;
}

/* — motorhoz illesztés —
   A régi eredményoldal-kód (__oldRender) változatlanul fut egy leválasztott DOM-darabon, a régi
   eredmény-sablonnal; a mentést (ONI.save) elkapjuk és a motor végzi. */
let responses={};
const RES_HTML="<div class=\"res-eyebrow\">Eredmény · 5 nyelv rangsora · Értelmezés</div>\n      <h2 class=\"res-title\">A te szeretet-<em>nyelved</em></h2>\n      <p class=\"res-lead\">Öt pontszám — az elsődleges nyelved a legmagasabb pontszámú kategória. Sok embernek van egy tiszta domináns nyelv, másoknak kettő megosztott, néhánynak mind az öt közel egyforma. Nincs \"helyes\" profil.</p>\n      <div class=\"chart-card\">\n        <h3>A szeretet-<em>térképed</em></h3>\n        <div class=\"chart-sub\">Öt tengely · min 0 · max 12</div>\n        <svg class=\"chart-svg\" id=\"love-radar\"></svg>\n        <div class=\"chart-legend\" id=\"love-legend\"></div>\n      </div>\n      <div class=\"rank-list\" id=\"love-rankList\"></div>\n      <div class=\"interp-card\" id=\"love-interpCard\"></div>\n      <div class=\"cross-card\"><h3>Kapcsolatok más <em>területekkel</em></h3><div id=\"love-cross-links\"></div></div>\n      <div class=\"refs-card\">\n        <h3>Tudományos <em>háttér</em></h3>\n        <div class=\"ref-item\"><strong>Chapman, G. (1992/2015).</strong> The 5 Love Languages: The Secret to Love that Lasts. Northfield Publishing.</div>\n        <div class=\"ref-item\"><strong>Egbert, N., & Polk, D. (2006).</strong> Speaking the language of relational maintenance: A validity test of Chapman's five love languages. <em>Communication Research Reports, 23(1)</em>, 19–26.</div>\n        <div class=\"ref-item\"><strong>Bland, A. M., & McQueen, K. S. (2018).</strong> The distribution of Chapman's love languages in couples: An exploratory cluster analysis. <em>Couple and Family Psychology, 7(2)</em>, 103–126.</div>\n        <div class=\"ref-item\"><strong>Hughes, J. L., & Camden, A. A. (2020).</strong> Using Chapman's five love languages theory to predict love and relationship satisfaction. <em>Psi Chi Journal of Psychological Research, 25(3)</em>.</div>\n      </div>";
function __oldRender(){
  const s=scores();
  const sorted=Object.entries(s).sort((a,b)=>b[1]-a[1]);
  let rankHtml='<h3>A te <em>nyelv-rangsorod</em></h3>';
  try{__cap({n:'Szeretetnyelvek',h:CATEGORIES[sorted[0][0]].name,d:Object.fromEntries(Object.keys(CATEGORIES).map(k=>[k,[CATEGORIES[k].name,s[k],0,12]]))});}catch(e){console.warn('ONI',e)}
  sorted.forEach((entry,i)=>{
    const [code,score]=entry;
    const cat=CATEGORIES[code];
    const isTop=i===0;
    rankHtml+=`<div class="rank-item ${isTop?'top':''}" style="--rc:${cat.color};--top-color:${cat.color}"><div class="rank-pos">${i+1}.</div><div><div class="rank-name"><em>${cat.name}</em> · ${cat.en}</div><div class="rank-desc">${cat.desc}</div></div><div class="rank-score">${score}<span class="out">/ 12</span></div></div>`;
  });
  document.getElementById('love-rankList').innerHTML=rankHtml;
  // Radar diagram
  const radarData = ['A','B','C','D','E'].map(code=>({label:CATEGORIES[code].name.split(' ')[0], value:s[code], color:CATEGORIES[code].color}));
  window.CHARTS.radar(document.getElementById('love-radar'), radarData, {max:12, color:'#818cf8', fillColor:'rgba(129,140,248,0.28)', strokeColor:'#818cf8'});
  // Legend
  document.getElementById('love-legend').innerHTML = ['A','B','C','D','E'].map(code=>{
    const cat=CATEGORIES[code];
    return `<div class="chart-legend-item"><span class="chart-legend-swatch" style="background:${cat.color}"></span><span><strong>${cat.name}</strong> · ${s[code]}/12</span></div>`;
  }).join('');
  let interp=`<h3>Klinikai <em>értelmezés</em></h3>`;
  const primary=sorted[0][0], secondary=sorted[1][0], weakest=sorted[4][0];
  // Profil-forma
  const balance=sorted[0][1]-sorted[4][1];
  interp+=`<div class="interp-section"><h4>Profil-forma</h4>`;
  if(balance>=8){
    interp+=`<p><strong>Erősen fókuszált profil.</strong> Egy nyelv dominál a többi felett (${sorted[0][1]}/12 vs ${sorted[4][1]}/12). Ez tiszta iránymutatás — de figyelmeztetés is: az egyoldalúság sebezhetőbb, mert csak egy csatornán érkezik meg a szeretet-üzenet. Ha a partnered nem ezen a nyelven "adja", <em>nem érzed</em>, akkor sem, ha objektíven szeret.</p>`;
  } else if(balance>=5){
    interp+=`<p><strong>Világos profil.</strong> Van egy elsődleges nyelv (${sorted[0][1]}/12), de más nyelvek is elérnek (${sorted[4][1]}/12 a leggyengébb). Ez a leggyakoribb és legrugalmasabb profil — a partneri "hibák" bizonyos csatornákon nem zúzzák össze a kapcsolatot, mert más csatornákon még mindig érkezik.</p>`;
  } else {
    interp+=`<p><strong>Kiegyenlített profil.</strong> Nincs egyértelmű elsődleges nyelv (${sorted[0][1]} vs ${sorted[4][1]}). Ez a "többnyelvű" profil — sok csatornán érzed a szeretetet, de egyik sem elég önmagában. A partneri kommunikáció itt különösen fontos, mert a partner nem tudja "eltalálni" egyetlen fókusszal.</p>`;
  }
  interp+=`</div>`;
  // Minden 5 nyelvhez külön szakasz — rangsor szerinti sorrendben
  sorted.forEach((entry, idx)=>{
    const [code, score] = entry;
    const cat = CATEGORIES[code];
    const rank = idx===0?'Elsődleges':idx===1?'Másodlagos':idx===2?'Harmadlagos':idx===3?'Alacsony':'Legalacsonyabb';
    let text;
    if(idx===0) text = INTERP[code].primary;
    else if(idx===1 && score>=6) text = INTERP[code].strong;
    else if(idx>=3) text = INTERP[code].weak;
    else text = `Közepes tartományban (${score}/12). Van bizonyos szeretet-érték számodra ezen a csatornán, de nem meghatározó. Ha a partnered ezt <em>hangsúlyosan</em> adja, örülsz neki, de nem ezen keresztül épül az alapkötelék.`;
    interp+=`<div class="interp-section"><h4>${idx+1}. ${rank} — ${cat.name} (${score}/12)</h4><p style="font-size:13px;color:var(--ink-lite-muted);margin-bottom:8px;font-style:italic">${cat.desc}</p><p>${text}</p></div>`;
  });
  // Kombinált mintázatok
  const s1=sorted[0][0], s2=sorted[1][0];
  const pair = [s1,s2].sort().join('-');
  const combos = {
    'A-B': `<strong>Elismerő szavak + Minőségi idő</strong> — a "látott és hallott" profil. Nem az számít, hogy mit tesz a partnered, hanem hogy <em>figyel</em> rád és <em>szavakba öntsd</em> azt, amit lát. Ez erősen kötődés-fókuszú kombináció.`,
    'A-E': `<strong>Elismerő szavak + Fizikai érintés</strong> — a "verbális és testi jelenlét" profil. A szex, ölelés és a kimondott dicséret együtt táplál. Bármelyik csatorna hiánya érzelmi éhezéshez vezet.`,
    'B-E': `<strong>Minőségi idő + Fizikai érintés</strong> — a "test-jelenlét" profil. A közös, jelenléttel töltött idő + a testi kontakt együtt. Sokszor introvertált-orientált profil, ahol kevesebb, mélyebb kapcsolat kell.`,
    'C-D': `<strong>Ajándék + Szolgálat</strong> — a "gesztus" profil. A partner cselekedetei (adás és segítés) számít. Ez pragmatikus, "tettek beszélnek" alapállás.`,
    'A-C': `<strong>Elismerő szavak + Ajándék</strong> — a "megjelölés" profil. Fontos, hogy a partnered explicit módon (szóban vagy tárggyal) <em>megjelölje</em>, hogy gondol rád.`,
    'A-D': `<strong>Elismerő szavak + Szolgálat</strong> — a "látott munka" profil. Fontos, hogy a partnered lássa és elismerje amit teszel, ÉS ő is konkrétan segítsen. A hallgatólagos tolerancia számodra elutasításként érkezik.`,
    'B-C': `<strong>Minőségi idő + Ajándék</strong> — a "gondolt rám" profil. A közös idő és a gondolt gesztusok együtt táplálnak.`,
    'B-D': `<strong>Minőségi idő + Szolgálat</strong> — a "partnerség" profil. A közös élet strukturális támogatása (időben és tettekben) számít elsősorban.`,
    'C-E': `<strong>Ajándék + Fizikai érintés</strong> — a "tárgyi jelenlét" profil. A partner gesztusai és a testi közelség együtt teremtik a biztonságot.`,
    'D-E': `<strong>Szolgálat + Fizikai érintés</strong> — a "cselekvő és testi" profil. A partner segít, és fizikailag közel van. Verbális dimenzió kevésbé fontos.`
  };
  if(combos[pair] && sorted[1][1]>=6){
    interp+=`<div class="interp-section"><h4>Kombinált mintázat — top 2 nyelved együtt</h4><p>${combos[pair]}</p></div>`;
  }
  // Partneri implikációk
  interp+=`<div class="interp-section"><h4>Partneri implikáció — mit kell tudnia rólad</h4><p><strong>Mondd el a partnerednek:</strong> "Én elsősorban <em>${CATEGORIES[primary].name.toLowerCase()}</em>-en keresztül érzem a szeretetet. Amikor te adsz nekem <em>${CATEGORIES[weakest].name.toLowerCase()}</em>-t, örülök — de nem ez az, amiből építek. Ha egyszer megkérdezhetlek: adnál nekem heti szinten <em>${CATEGORIES[primary].name.toLowerCase()}</em>-t?"</p><p>A partnered valószínűleg <strong>a saját</strong> elsődleges nyelvén ad — az emberek úgy szeretnek, ahogyan saját maguknak kellene. Ha ez eltér a te profilodtól, kettőtök szeretete "eltéved a fordításban".</p></div>`;
  // Kockázati mintázatok
  if(s.E>=8){
    interp+=`<div class="interp-section"><h4>Kockázati kontextus — magas Physical Touch</h4><p>Magas fizikai érintés-nyelv esetén különösen fontos, hogy a szex NE keveredjen a szeretetigénnyel — a testi jelenlét mint szeretet-forma NEM azonos a szexszel. Ha csak szex-alapú érintésed van, "üresen maradsz" a nem-szexuális testi közelség hiányában.</p></div>`;
  }
  if(s.C<=2 && s.D<=2){
    interp+=`<div class="interp-section"><h4>Kockázati kontextus — gesztus-vak profil</h4><p>Alacsony ajándék és szolgálat-nyelv esetén könnyen "észre sem veszed" ha a partnered ezekkel próbál szeretetet mutatni. Érdemes tudatosan megjelölni magadnak: "most a partnerem hozott nekem valamit — ez az ő szeretet-jele, függetlenül attól, hogy én ezt nem így érezném".</p></div>`;
  }
  document.getElementById('love-interpCard').innerHTML=interp;
  const links=crossLinks(s);
  document.getElementById('love-cross-links').innerHTML=links.map(l=>`<div class="cross-item"><div class="cross-item-label">${l.label}</div><p>${l.text}</p></div>`).join('');
  document.getElementById('love-results').classList.add('visible');
  setTimeout(()=>{document.getElementById('love-results').scrollIntoView({behavior:'smooth',block:'start'});},100);
}
function __run(){
  let payload=null;const __cap=p=>{payload=p;};
  const box=window.document.createElement('div');box.innerHTML='<div id="love-results">'+RES_HTML+'</div>';
  const fake={getElementById:id=>box.querySelector('#'+CSS.escape(id)),querySelector:s=>box.querySelector(s),querySelectorAll:s=>box.querySelectorAll(s),createElement:(...a)=>window.document.createElement(...a)};
  const real=document;document=fake;window.__cap=__cap;try{__oldRender();}finally{document=real;delete window.__cap;}
  return {oni:payload,html:box.firstChild.innerHTML};
}
makeTest({
  id:"love",key:"love-responses-v1",name:"Szeretetnyelvek",c1:"#d4a017",c2:"#e11d48",
  tab:"Szeretetnyelv",tabSub:"Love Languages · 30 pár",scale:typeof SCALE!=="undefined"?SCALE:[],
  header:{"status": "model", "statusText": "Terápiás önreflexiós keret · nem mérőeszköz", "eyebrow": "The 5 Love Languages · Gary Chapman (1992)", "title": "A te szeretet-<em>nyelvedː</em>", "lead": "Chapman öt kategóriát ír le, ahogyan az emberek a szeretetet elsődlegesen <em>kapják</em> és megélik: elismerő szavak, minőségi idő, ajándék elfogadása, szolgálat és fizikai érintés. A saját elsődleges nyelved gyakran eltér a partneredétől — a párkapcsolati félreértések nagy része innen származik: mindketten \"adjátok a szeretetet\", csak épp más nyelven, mint amit a másik ért.", "intro": "<p><strong>Kitöltési útmutató:</strong> 30 páros. Mindegyiknél <em>válaszd ki azt az egyetlen opciót</em>, amelyet inkább szeretnél. Nem \"melyik igaz\" — melyiket kívánnád. Ha mindkettőt akarod, válaszd azt, amelyik erősebben szól hozzád.</p>\n      <p>Ne gondolkodj sokat — az első reakció a leghitelesebb.</p>"},
  sections:[{title:'',desc:'',items:PAIRS.map(p=>({t:'Melyik szólít meg jobban?',opts:[{t:p.a.t,v:p.a.c},{t:p.b.t,v:p.b.c}]}))}],
  score(R){responses={};R.items.forEach(i=>{if(i.raw!==undefined)responses[i.n]=i.raw;});return __run();},
  sum(s){return s.oni;},
  render(R,s){return s.html;}
});
})();

/* ═══════════ 2. APOLOGY LANGUAGES ═══════════ */
(function(){
let document=window.document;   /* a régi kód ezen keresztül éri el a DOM-ot; kiértékeléskor egy leválasztott darabra mutat */
// 5 kategória:
// R = Expressing Regret (sajnálat kifejezése)
// A = Accepting Responsibility (felelősség vállalása)
// M = Making Restitution (jóvátétel)
// P = Genuinely Repenting (őszinte megbánás — nem-ismétlés)
// F = Requesting Forgiveness (bocsánat kérése)
// 20 pair × 2 = 40 items, 8 minden kategóriában
const PAIRS = [
  {n:1, a:{c:'R',t:'"Sajnálom, hogy megbántottalak — látom, hogy fáj."'}, b:{c:'A',t:'"Igazad volt, hibáztam, nem kellett volna."'}},
  {n:2, a:{c:'M',t:'"Mit tehetek, hogy jóvátegyem?"'}, b:{c:'P',t:'"Ígérem, dolgozom rajta, hogy ez ne ismétlődjön."'}},
  {n:3, a:{c:'F',t:'"Kérlek, bocsáss meg."'}, b:{c:'R',t:'"Nagyon sajnálom, hogy ez történt."'}},
  {n:4, a:{c:'A',t:'"Elismerem: én tettem rosszul."'}, b:{c:'M',t:'"Szeretném helyrehozni — mondd, mit tegyek."'}},
  {n:5, a:{c:'P',t:'"Nem így akartam viselkedni; ez nem az én értékrendem."'}, b:{c:'F',t:'"Elfogadnád a bocsánatkérésemet?"'}},
  {n:6, a:{c:'R',t:'A "sajnálom" — ha érzelemmel mondja — sokat jelent nekem.'}, b:{c:'A',t:'A "hibáztam" — ha nyíltan kimondja — sokat jelent nekem.'}},
  {n:7, a:{c:'M',t:'Számomra a konkrét jóvátétel — egy tett — a bocsánatkérés lényege.'}, b:{c:'P',t:'Számomra az "nem fog újra megtörténni" ígéret — és a betartása — a bocsánatkérés lényege.'}},
  {n:8, a:{c:'F',t:'Akkor tudom lezárni, ha a partnerem konkrétan kéri, hogy bocsássak meg.'}, b:{c:'R',t:'Akkor tudom lezárni, ha érzem, hogy tényleg sajnálja.'}},
  {n:9, a:{c:'A',t:'A felelősség-elhárítás ("igen, de te is...") nálam megsemmisíti a bocsánatkérést.'}, b:{c:'M',t:'A gyakorlati jóvátétel hiánya ("csak sajnálom, de nem csinálok semmit") nálam megsemmisíti a bocsánatkérést.'}},
  {n:10, a:{c:'P',t:'A ismétlődés — ha újra megcsinálja — nálam megsemmisíti a bocsánatkérést.'}, b:{c:'F',t:'A "kérlek, bocsáss meg" hiánya nálam megsemmisíti a bocsánatkérést.'}},
  {n:11, a:{c:'R',t:'Az érzelmi őszinteség — a "látom, mit tettem veled" — kulcs.'}, b:{c:'A',t:'A tulajdonosság — az "én voltam a hibás, nem a körülmény" — kulcs.'}},
  {n:12, a:{c:'M',t:'A cselekvő javítás — "mit tegyek?" — kulcs.'}, b:{c:'F',t:'A tényleges kérés — "megbocsátasz?" — kulcs.'}},
  {n:13, a:{c:'P',t:'A rendszer-szintű változás — "megnézem, mit tanulok belőle" — kulcs.'}, b:{c:'R',t:'A puszta megbánás-kifejezés — "annyira sajnálom" — kulcs.'}},
  {n:14, a:{c:'A',t:'Az "elismerem, hogy tévedtem" mondat átbillenti a helyzetet.'}, b:{c:'M',t:'A "megcsinálom, amit lehet" cselekvés átbillenti a helyzetet.'}},
  {n:15, a:{c:'F',t:'Csak a formális bocsánatkérés (a "kérlek, bocsáss meg" verbális aktus) zárja le a fejezetet.'}, b:{c:'P',t:'Csak az idő-alapú bizonyíték ("nem történt meg újra 3 hónapig") zárja le a fejezetet.'}},
  {n:16, a:{c:'R',t:'Amikor sír vagy megrendül, elhiszem, hogy fáj neki, amit tett.'}, b:{c:'A',t:'Amikor tisztán kimondja "hibás voltam", elhiszem, hogy elismerte.'}},
  {n:17, a:{c:'M',t:'A jóvátétel-tett többet ér, mint száz "sajnálom".'}, b:{c:'F',t:'A kérés — hogy megbocsássak — többet ér, mint száz "sajnálom".'}},
  {n:18, a:{c:'P',t:'Egy hosszan tartó viselkedés-változás — az igazi bocsánatkérés.'}, b:{c:'R',t:'Egy őszinte könnyes-szemű pillanat — az igazi bocsánatkérés.'}},
  {n:19, a:{c:'F',t:'"Megbocsátasz?" — ez az egyik legnehezebb és legfontosabb kérdés.'}, b:{c:'M',t:'"Mit csináljak?" — ez az egyik legnehezebb és legfontosabb kérdés.'}},
  {n:20, a:{c:'A',t:'Az önkritika — "látom, mit rontottam el" — a bocsánatkérés magja.'}, b:{c:'P',t:'A jövőre irányuló szándék — "megváltozom" — a bocsánatkérés magja.'}}
];
const TOTAL=PAIRS.length;

function scores(){
  const s={R:0,A:0,M:0,P:0,F:0};
  Object.values(responses).forEach(code=>{if(s[code]!==undefined)s[code]++;});
  return s;
}
const APO_CATS = {
  R:{name:'Sajnálat kifejezése',en:'Expressing Regret',color:'#7c2d3c',desc:'"Sajnálom, hogy fájdalmat okoztam." Az érzelmi kifejezés — a másik fájdalmának elismerése — a bocsánatkérés lényege. Számít, hogy meg is látja, mit tett.'},
  A:{name:'Felelősség vállalása',en:'Accepting Responsibility',color:'#b8912e',desc:'"Én tettem rosszul." Nincs mentegetőzés, nincs "de te is...". A tiszta önelismerés — hogy én voltam a hibás — a bocsánatkérés lényege.'},
  M:{name:'Jóvátétel',en:'Making Restitution',color:'#065f46',desc:'"Mit tehetek?" A gyakorlati javítás — egy konkrét tett — kell ahhoz, hogy elhiggyem: komolyan gondolja. A szó önmagában kevés.'},
  P:{name:'Őszinte megbánás',en:'Genuinely Repenting',color:'#1e3a8a',desc:'"Nem fog újra megtörténni." A jövőre irányuló szándék — és a betartása — teszi hitelessé. Az ismétlődés megsemmisíti a bocsánatkérést.'},
  F:{name:'Bocsánat kérése',en:'Requesting Forgiveness',color:'#9f1239',desc:'"Kérlek, bocsáss meg." A tényleges kérdés — a formális aktus — kell ahhoz, hogy le lehessen zárni. A kimondás számít.'}
};
const APO_INTERP = {
  R:{primary:`Elsődleges bocsánat-nyelved a <strong>sajnálat kifejezése</strong>. Ahhoz, hogy hidd, hogy a partnered komolyan gondolja: <em>látnia kell a fájdalmadat</em>, és érzelmileg reagálnia rá. A puszta "hibáztam" (racionális elismerés) nem elég — az érzelmi jelenlét kell. <em>Amit mondj el a partnerednek</em>: "Nekem az kell, hogy lássam, hogy tényleg fáj neked, hogy fáj nekem."`, weak:`Nem elsődleges, de fontos.`},
  A:{primary:`Elsődleges bocsánat-nyelved a <strong>felelősség vállalása</strong>. Neked a tiszta "hibáztam, nincs mentség" kell. Ha a partnered akárhogy is megpróbálja megmagyarázni ("de te is..."), a bocsánatkérés semmissé válik. <em>Amit mondj el</em>: "Először vállald a felelősséget, csak utána tudom hallgatni a kontextust."`, weak:`Nem elsődleges, de fontos.`},
  M:{primary:`Elsődleges bocsánat-nyelved a <strong>jóvátétel</strong>. Az érzelem és a szó nem elég — <em>tett</em> kell. Amíg nincs konkrét cselekvés, a bocsánatkérés csak jó szándék. <em>Amit mondj el</em>: "Mondd el, mit fogsz csinálni, hogy helyrehozd — az kell, hogy elhiggyem."`, weak:`Nem elsődleges, de fontos.`},
  P:{primary:`Elsődleges bocsánat-nyelved az <strong>őszinte megbánás</strong> — a jövőre irányuló változás. A "sajnálom" pillanat számodra kevés, ha ugyanaz újra megtörténik. Neked az idő beszél: <em>3 hónap után</em> derül ki, hogy a bocsánatkérés valódi volt-e. <em>Amit mondj el</em>: "Nekem az idő és a viselkedés-változás számít; a szavak addig üresek, amíg nem látom a tettet."`, weak:`Nem elsődleges, de fontos.`},
  F:{primary:`Elsődleges bocsánat-nyelved a <strong>bocsánat kérése</strong>. Neked a formális aktus — a "kérlek, bocsáss meg" konkrét kimondása — kell, hogy le tudd zárni. Nem "sejtett" bocsánat, nem "gondolt" bocsánat: a mondat kimondása. <em>Amit mondj el</em>: "Konkrétan kérned kell a bocsánatot, hogy tudjam megbocsátani."`, weak:`Nem elsődleges, de fontos.`}
};

/* — motorhoz illesztés —
   A régi eredményoldal-kód (__oldRender) változatlanul fut egy leválasztott DOM-darabon, a régi
   eredmény-sablonnal; a mentést (ONI.save) elkapjuk és a motor végzi. */
let responses={};
const RES_HTML="<div class=\"res-eyebrow\">Eredmény · 5 bocsánat-nyelv rangsora</div>\n      <h2 class=\"res-title\">A te bocsánat-<em>nyelved</em></h2>\n      <p class=\"res-lead\">Öt pontszám — az elsődleges bocsánat-nyelved a legmagasabb. Ez az, amit ha megkapsz, elhiszed, hogy a másik komolyan gondolja.</p>\n      <div class=\"chart-card\">\n        <h3>A bocsánat-<em>térképed</em></h3>\n        <div class=\"chart-sub\">Öt tengely · min 0 · max 8</div>\n        <svg class=\"chart-svg\" id=\"apo-radar\"></svg>\n        <div class=\"chart-legend\" id=\"apo-legend\"></div>\n      </div>\n      <div class=\"rank-list\" id=\"apo-rankList\"></div>\n      <div class=\"interp-card\" id=\"apo-interpCard\"></div>\n      <div class=\"cross-card\"><h3>Kapcsolatok más <em>területekkel</em></h3><div id=\"apo-cross-links\"></div></div>\n      <div class=\"refs-card\">\n        <h3>Tudományos <em>háttér</em></h3>\n        <div class=\"ref-item\"><strong>Chapman, G., & Thomas, J. (2006/2013).</strong> The Five Languages of Apology / When Sorry Isn't Enough. Northfield Publishing.</div>\n        <div class=\"ref-item\"><strong>Lewicki, R. J., Polin, B., & Lount, R. B. (2016).</strong> An exploration of the structure of effective apologies. <em>Negotiation and Conflict Management Research, 9(2)</em>, 177–196. — Independent empirikus validáció hasonló komponensekre.</div>\n        <div class=\"ref-item\"><strong>Fehr, R., & Gelfand, M. J. (2010).</strong> When apologies work: How matching apology components to victims' self-construals facilitates forgiveness. <em>Organizational Behavior and Human Decision Processes, 113(1)</em>, 37–50.</div>\n      </div>";
function __oldRender(){
  const s=scores();
  const sorted=Object.entries(s).sort((a,b)=>b[1]-a[1]);
  let rankHtml='<h3>A te <em>bocsánat-nyelv rangsorod</em></h3>';
  try{__cap({n:'Bocsánatkérési nyelvek',h:APO_CATS[sorted[0][0]].name,d:Object.fromEntries(Object.keys(APO_CATS).map(k=>[k,[APO_CATS[k].name,s[k],0,8]]))});}catch(e){console.warn('ONI',e)}
  sorted.forEach((entry,i)=>{
    const [code,score]=entry;
    const cat=APO_CATS[code];
    const isTop=i===0;
    rankHtml+=`<div class="rank-item ${isTop?'top':''}" style="--rc:${cat.color};--top-color:${cat.color}"><div class="rank-pos">${i+1}.</div><div><div class="rank-name"><em>${cat.name}</em> · ${cat.en}</div><div class="rank-desc">${cat.desc}</div></div><div class="rank-score">${score}<span class="out">/ 8</span></div></div>`;
  });
  document.getElementById('apo-rankList').innerHTML=rankHtml;
  // Radar
  const radarData = ['R','A','M','P','F'].map(code=>({label:APO_CATS[code].name.split(' ')[0], value:s[code], color:APO_CATS[code].color}));
  window.CHARTS.radar(document.getElementById('apo-radar'), radarData, {max:8, color:'#2dd4bf', fillColor:'rgba(45,212,191,0.28)', strokeColor:'#2dd4bf'});
  document.getElementById('apo-legend').innerHTML = ['R','A','M','P','F'].map(code=>{
    const cat=APO_CATS[code];
    return `<div class="chart-legend-item"><span class="chart-legend-swatch" style="background:${cat.color}"></span><span><strong>${cat.name}</strong> · ${s[code]}/8</span></div>`;
  }).join('');
  const primary=sorted[0][0], weakest=sorted[4][0];
  let interp=`<h3>Klinikai <em>értelmezés</em></h3>`;
  // Profil-forma
  const balance = sorted[0][1] - sorted[4][1];
  interp+=`<div class="interp-section"><h4>Profil-forma</h4>`;
  if(balance>=5){
    interp+=`<p><strong>Erősen fókuszált bocsánat-nyelv.</strong> Egy nyelv dominál (${sorted[0][1]}/8 vs ${sorted[4][1]}/8). Ha a partnered ezt <em>nem</em> adja, akkor bármit is mondjon, számodra "nem elég a bocsánatkérés" érzés marad — akkor is, ha ő őszintén próbálja.</p>`;
  } else if(balance>=3){
    interp+=`<p><strong>Világos profil.</strong> Van egy vezető nyelv, de más csatornák is elérnek. Rugalmasabb feldolgozás konfliktus után.</p>`;
  } else {
    interp+=`<p><strong>Kiegyenlített profil.</strong> Több csatorna is közel hasonló pontszámmal. Ez azt jelenti: a partneri bocsánatkérés akkor "teljes", ha több elemet együtt tartalmaz — pl. sajnálat + felelősség + jóvátétel egyben. Egyetlen elem önmagában kevesebb.</p>`;
  }
  interp+=`</div>`;
  // Minden 5 nyelvhez interp
  sorted.forEach((entry, idx)=>{
    const [code, score] = entry;
    const cat = APO_CATS[code];
    const rank = idx===0?'Elsődleges':idx===1?'Másodlagos':idx===2?'Harmadlagos':idx===3?'Alacsony':'Legalacsonyabb';
    let text;
    if(idx===0) text = APO_INTERP[code].primary;
    else if(idx>=3) text = `Alacsony fontosságú számodra (${score}/8). Ha a partnered ezt adja, elfogadod, de nem ezen keresztül dolgozod fel a konfliktust. Nem ez a "hitelesítő" jel.`;
    else text = `Közepesen fontos (${score}/8). Ha ez jelen van a partneri bocsánatkérésben, kiegészíti az elsődleges nyelvedet — de önmagában nem elég.`;
    interp+=`<div class="interp-section"><h4>${idx+1}. ${rank} — ${cat.name} (${score}/8)</h4><p style="font-size:13px;color:var(--ink-lite-muted);margin-bottom:8px;font-style:italic">${cat.desc}</p><p>${text}</p></div>`;
  });
  // Konfliktus-szcenáriók
  const scenarios = {
    R: `<strong>Konfliktus-forgatókönyv számodra:</strong> a partnered <em>érzelmi jelenléttel</em> jön el hozzád (visszafogott hang, "látom, mit tettem veled", esetleg könnyek). Ha ő pragmatikusan mondja "hát oké, hibáztam", te nem érzed őszintének — pedig lehet, hogy ő komolyan gondolja.`,
    A: `<strong>Konfliktus-forgatókönyv számodra:</strong> a partnered <em>tiszta felelősségvállalással</em> jön ("én rontottam el, punktum, nincs mentség"). Ha ő "de te is..." pozíciót vesz fel, számodra semmissé válik a bocsánatkérés.`,
    M: `<strong>Konfliktus-forgatókönyv számodra:</strong> a partnered <em>konkrét tettel</em> jön ("mit tegyek most, hogy helyrehozzam?"). A puszta szó (akár érzelmes is) nem elég — cselekvés kell.`,
    P: `<strong>Konfliktus-forgatókönyv számodra:</strong> a partnered <em>idő + változás</em> révén "bizonyít". Az azonnali szavak keveset érnek — 3-6 hónap múlva látod, hogy tényleg más volt-e. Ha a probléma megismétlődik, a bocsánatkérés retroaktívan semmissé válik.`,
    F: `<strong>Konfliktus-forgatókönyv számodra:</strong> szükséged van a <em>formális aktusra</em> ("kérlek, bocsáss meg"). A kimondott kérdés az, ami lezárja a fejezetet — enélkül nyitva marad a helyzet, akkor is, ha érzelmi kiegyenlítődés van.`
  };
  interp+=`<div class="interp-section"><h4>Konfliktus-forgatókönyv</h4><p>${scenarios[primary]}</p></div>`;
  // Kockázati mintázatok
  interp+=`<div class="interp-section"><h4>Kockázat — leggyengébb nyelv</h4><p>A legalacsonyabb pontszámod: <strong>${APO_CATS[weakest].name}</strong> (${sorted[4][1]}/8). Ha a partnered <em>éppen ezen keresztül</em> próbál bocsánatot kérni (mert neki ez a saját elsődleges nyelve), számodra "átsiklik" — nem érzed hitelesnek. <strong>Ezt kell tudnia rólad.</strong> Nem kritika a partnered felé — csak a te szótárad más.</p></div>`;
  // Gyakorlati partneri implikáció
  interp+=`<div class="interp-section"><h4>Praktikus partneri implikáció</h4><p><strong>Ne várd, hogy a partnered magától rájöjjön.</strong> Az emberek általában úgy kérnek bocsánatot, ahogyan <em>saját maguknak</em> kellene — nem úgy, ahogy neked. Ha ez eltér, a jó szándékú bocsánatkérése is elveszik a "nem ez volt, amit kellett" fordításban.</p><p><strong>Explicit script neked:</strong> "Amikor konfliktus van, nekem az a fontos, hogy ${primary==='R'?'lássam, tényleg fáj neked, ami történt':primary==='A'?'tisztán elismerd, hogy te hibáztál (a "de" nélkül)':primary==='M'?'konkrétan mondd meg, mit fogsz csinálni, hogy helyrehozd':primary==='P'?'ígérd meg — és tartsd is be — hogy változtatsz':'kérj bocsánatot direkten, konkrétan kimondva "kérlek, bocsáss meg"'}. Ez nekem többet ér, mint bármi más."</p></div>`;
  document.getElementById('apo-interpCard').innerHTML=interp;
  const links=[];
  links.push({label:'Kapcsolat a Love Languages-szel',text:`Sokszor (de nem mindig) az elsődleges bocsánat-nyelv rezonál az elsődleges szeretet-nyelvvel. Pl. Words of Affirmation → Expressing Regret; Acts of Service → Making Restitution. Nézd meg, van-e ilyen mintázat.`});
  links.push({label:'Konfliktus-utáni javítás — Gottman-modell',text:`John Gottman kutatásában a párkapcsolati stabilitás legerősebb prediktora nem a konfliktus elkerülése, hanem a <em>repair attempts</em> — a "javítási kísérletek" sikeressége. A bocsánat-nyelv ismerete pontosan ezt szolgálja.`});
  if(primary==='P'){
    links.push({label:'SMI Punitive Parent kapcsolat',text:`A "változást akarok látni, nem szavakat" elsődleges nyelv gyakran kapcsolódik a magas Punitive Parent mode-hoz — nehéz megbocsátani, mert a belső hang is folyamatosan ítélkezik. Érdemes megnézni.`});
  }
  if(primary==='M'){
    links.push({label:'SMI Demanding Parent kapcsolat',text:`A "tettek beszélnek" bocsánat-nyelv néha együtt jár a magas Demanding Parent mode-dal — a szó nem elég, a teljesítmény kell. Érdemes megnézni.`});
  }
  document.getElementById('apo-cross-links').innerHTML=links.map(l=>`<div class="cross-item"><div class="cross-item-label">${l.label}</div><p>${l.text}</p></div>`).join('');
  document.getElementById('apo-results').classList.add('visible');
  setTimeout(()=>{document.getElementById('apo-results').scrollIntoView({behavior:'smooth',block:'start'});},100);
}
function __run(){
  let payload=null;const __cap=p=>{payload=p;};
  const box=window.document.createElement('div');box.innerHTML='<div id="apo-results">'+RES_HTML+'</div>';
  const fake={getElementById:id=>box.querySelector('#'+CSS.escape(id)),querySelector:s=>box.querySelector(s),querySelectorAll:s=>box.querySelectorAll(s),createElement:(...a)=>window.document.createElement(...a)};
  const real=document;document=fake;window.__cap=__cap;try{__oldRender();}finally{document=real;delete window.__cap;}
  return {oni:payload,html:box.firstChild.innerHTML};
}
makeTest({
  id:"apo",key:"apo-responses-v1",name:"Bocsánatkérési nyelvek",c1:"#2563eb",c2:"#10b981",
  tab:"Bocsánatkérés",tabSub:"Apology Languages · 20 pár",scale:typeof SCALE!=="undefined"?SCALE:[],
  header:{"status": "model", "statusText": "Terápiás önreflexiós keret · nem mérőeszköz", "eyebrow": "The 5 Languages of Apology · Chapman & Thomas (2006)", "title": "A te bocsánat-<em>nyelved</em>", "lead": "Amikor valaki megbántott, mi kell ahhoz, hogy a bocsánatkérése <em>őszintének</em> hangozzon? Chapman és Thomas öt kategóriát ír le: sajnálat kifejezése, felelősség vállalása, jóvátétel, őszinte megbánás, bocsánat kérése. Egy \"sajnálom\" különböző emberek számára különböző dolgot jelent — és ha a partnered nem a te nyelveden bocsánatot kér, még ha jó szándékkal is, a konfliktus nem oldódik meg.", "intro": "<p><strong>Kitöltési útmutató:</strong> 20 páros — mindegyiknél a bocsánatkérés két lehetséges formáját olvasod. <em>Válaszd ki azt, amelyik számodra jobban hitelesen hangzik</em> — amelyiktől úgy éreznéd, valóban rendbe akarja tenni a dolgot.</p>"},
  sections:[{title:'',desc:'',items:PAIRS.map(p=>({t:'Melyik hitelesebb bocsánatkérés számodra?',opts:[{t:p.a.t,v:p.a.c},{t:p.b.t,v:p.b.c}]}))}],
  score(R){responses={};R.items.forEach(i=>{if(i.raw!==undefined)responses[i.n]=i.raw;});return __run();},
  sum(s){return s.oni;},
  render(R,s){return s.html;}
});
})();

/* ═══════════ 3. IMAGO ═══════════ */
(function(){
let document=window.document;   /* a régi kód ezen keresztül éri el a DOM-ot; kiértékeléskor egy leválasztott darabra mutat */
// 4 szakasz, 57 item, 0-3 skála
const ITEMS = [
  // Part A: 20 negatív gondozó-vonás
  {n:1,  s:'NEG', t:'kritikus'},
  {n:2,  s:'NEG', t:'elutasító'},
  {n:3,  s:'NEG', t:'kontrolláló'},
  {n:4,  s:'NEG', t:'hideg / érzelmileg távoli'},
  {n:5,  s:'NEG', t:'kiszámíthatatlan'},
  {n:6,  s:'NEG', t:'ítélkező'},
  {n:7,  s:'NEG', t:'érzelmileg elérhetetlen'},
  {n:8,  s:'NEG', t:'domináns / erőszakos'},
  {n:9,  s:'NEG', t:'gyakran mérges'},
  {n:10, s:'NEG', t:'túlaggódó / szorongó'},
  {n:11, s:'NEG', t:'szigorú / merev'},
  {n:12, s:'NEG', t:'túl megengedő / határok nélkül'},
  {n:13, s:'NEG', t:'elhanyagoló'},
  {n:14, s:'NEG', t:'verbálisan bántó'},
  {n:15, s:'NEG', t:'manipulatív'},
  {n:16, s:'NEG', t:'közömbös / érdektelen'},
  {n:17, s:'NEG', t:'versengő velem'},
  {n:18, s:'NEG', t:'önös / saját magával foglalkozó'},
  {n:19, s:'NEG', t:'perfekcionista velem szemben'},
  {n:20, s:'NEG', t:'megszégyenítő'},
  // Part B: 12 pozitív gondozó-vonás
  {n:21, s:'POS', t:'szerető'},
  {n:22, s:'POS', t:'támogató'},
  {n:23, s:'POS', t:'érzelmileg jelenlévő'},
  {n:24, s:'POS', t:'védelmező'},
  {n:25, s:'POS', t:'elfogadó (feltétel nélkül)'},
  {n:26, s:'POS', t:'meleg / érintős'},
  {n:27, s:'POS', t:'játékos / humoros'},
  {n:28, s:'POS', t:'megbízható / kiszámítható'},
  {n:29, s:'POS', t:'bátorító / önbizalom-adó'},
  {n:30, s:'POS', t:'konzisztens / stabil'},
  {n:31, s:'POS', t:'együttérző'},
  {n:32, s:'POS', t:'érdeklődő irántam'},
  // Part C: 15 gyermekkori sérülés / frusztráció
  {n:33, s:'WND', t:'Elhagyatottnak / magányosnak éreztem magam.'},
  {n:34, s:'WND', t:'Nem éreztem, hogy elég vagyok — akármit is teszek.'},
  {n:35, s:'WND', t:'Túl sokat kritizáltak.'},
  {n:36, s:'WND', t:'Nem hallgattak meg, ha próbáltam elmondani, mit érzek.'},
  {n:37, s:'WND', t:'Túl sok elvárás volt rajtam — teljesítmény, jó viselkedés.'},
  {n:38, s:'WND', t:'Ítélkeztek felettem — sokszor mielőtt meghallgattak volna.'},
  {n:39, s:'WND', t:'Kontroll alatt tartottak — nem volt tér nekem magamnak.'},
  {n:40, s:'WND', t:'Nem éreztem biztonságban magam — érzelmileg vagy fizikailag.'},
  {n:41, s:'WND', t:'Érzelmi távolság volt köztem és a gondozóim között.'},
  {n:42, s:'WND', t:'Verbális bántalmazás — kiabálás, megszégyenítés, sértegetés — volt jelen.'},
  {n:43, s:'WND', t:'Alultámogatva éreztem magam a fejlődésemben.'},
  {n:44, s:'WND', t:'Nem érdekelte őket, mit érzek — csak a viselkedésem.'},
  {n:45, s:'WND', t:'Túl sokat kellett teljesítenem, hogy szeretve érezzem magam.'},
  {n:46, s:'WND', t:'Ott voltak fizikailag, de nem érzelmileg — "üres jelenlét".'},
  {n:47, s:'WND', t:'Egymással veszekedtek, én lettem a néma tanú vagy közvetítő.'},
  // Part D: 10 kielégítetlen szükséglet
  {n:48, s:'NEED', t:'Biztonság-érzet — a "minden rendben van" alapélmény.'},
  {n:49, s:'NEED', t:'Feltétel nélküli szeretet — akkor is szeretnek, ha "rossz vagyok".'},
  {n:50, s:'NEED', t:'Elfogadás — pontosan úgy, ahogy vagyok, változtatás-igény nélkül.'},
  {n:51, s:'NEED', t:'Meghallgatás — valóban, figyelemmel, ítélet nélkül.'},
  {n:52, s:'NEED', t:'Autonómia — hely és tér, hogy saját döntéseket hozzak.'},
  {n:53, s:'NEED', t:'Játékosság-tér — nem kellett mindig komolynak / hasznosnak lenni.'},
  {n:54, s:'NEED', t:'Érzelmi közelség — nyíltan megélt kapcsolódás.'},
  {n:55, s:'NEED', t:'Fizikai érintés — ölelés, közelség, testi biztonság.'},
  {n:56, s:'NEED', t:'Elismerés — látták és értékelték, amit tettem.'},
  {n:57, s:'NEED', t:'Vezetés — érezhetően felnőtt jelenlét, aki tudja a dolgát.'}
];
const TOTAL=ITEMS.length;
const SCALE=[{v:0,l:'nem'},{v:1,l:'kissé'},{v:2,l:'közepesen'},{v:3,l:'nagyon'}];

const SECTIONS = {
  NEG:{title:'I. rész — Negatív gondozó-vonások',desc:'Mennyire jellemezték a fő gondozó(i)dat ezek a vonások, amikor gyermek voltál? 0 = egyáltalán nem · 3 = erősen jellemző.'},
  POS:{title:'II. rész — Pozitív gondozó-vonások',desc:'Mennyire jellemezték a fő gondozó(i)dat ezek a vonások?'},
  WND:{title:'III. rész — Gyermekkori sérülések',desc:'Mennyire élted át ezt gyermekkorodban? 0 = egyáltalán nem · 3 = erősen.'},
  NEED:{title:'IV. rész — Kielégítetlen szükségletek',desc:'Mennyire maradt <em>kielégítetlen</em> ez az igényed gyermekkorodban? 0 = megkaptad · 3 = teljesen hiányzott.'}
};

function topN(sub, n){
  return ITEMS.filter(it=>it.s===sub).map(it=>({t:it.t,v:responses[it.n]||0,n:it.n})).sort((a,b)=>b.v-a.v).slice(0,n);
}
function renderList(rootId, title, items, max, color){
  let html=`<h3>${title}</h3>`;
  items.forEach((item,i)=>{
    html+=`<div class="rank-item ${i===0?'top':''}" style="--rc:${color};--top-color:${color}"><div class="rank-pos">${i+1}.</div><div><div class="rank-name">${item.t}</div></div><div class="rank-score">${item.v}<span class="out">/ ${max}</span></div></div>`;
  });
  document.getElementById(rootId).innerHTML=html;
}
function generatePortrait(topNeg, topPos, topWnd, topNeed){
  const negList = topNeg.filter(x=>x.v>=2).map(x=>x.t).slice(0,4);
  const posList = topPos.filter(x=>x.v>=2).map(x=>x.t).slice(0,3);
  const wndList = topWnd.filter(x=>x.v>=2).map(x=>x.t.replace(/\.$/,'').toLowerCase()).slice(0,3);
  const needList = topNeed.filter(x=>x.v>=2).map(x=>x.t.split('—')[0].trim().toLowerCase()).slice(0,3);

  let html='';
  html+=`<h3>A te <em>imago-portréd</em></h3>`;
  html+=`<div class="sub">Az összefoglaló, amit a rendszered partnerkeresésbe visz — anélkül, hogy tudná</div>`;
  html+=`<div class="portrait-text">`;

  if(negList.length){
    html+=`<p>A gyermekkori gondozó(i)d — akiktől a legmélyebb kapcsolódási mintát tanultad — <strong>${negList.join(' · ')}</strong> voltak. Ez a lista nem "vádemelés" — csak a mintázat, ami beléégett a rendszeredbe.</p>`;
  } else {
    html+=`<p>Nem jelöltél be markáns negatív gondozó-vonást — vagy a gyermekkori gondozók valóban egészségesek voltak, vagy a védekező rendszer még nem enged hozzáférést a nehezebb emlékekhez. Mindkettő lehet.</p>`;
  }

  if(posList.length){
    html+=`<p>A pozitív oldalon: a gondozó(i)d ugyanakkor <strong>${posList.join(' · ')}</strong> is voltak. Ez a "biztonságos alap", amit belülre vittél magaddal.</p>`;
  }

  if(wndList.length){
    html+=`<p>A leginkább jelenlévő gyermekkori seb(ek): <em>${wndList.join(' · ')}</em>. Egy közeli, romantikus kapcsolat <strong>automatikusan újra-aktiválja</strong> ezeket a sebeket — nem "rontja el" a partnered, hanem a mélység közelsége hozza vissza őket.</p>`;
  }

  if(needList.length){
    html+=`<p>A leginkább kielégítetlen szükségletek: <em>${needList.join(' · ')}</em>. Ezt <strong>keresi</strong> a rendszered a partnerekben — pontosan ezt, amit nem kapott meg.</p>`;
  }

  // A Hendrix-paradoxon
  if(negList.length>=2 && needList.length>=1){
    html+=`<p><strong>A Hendrix-paradoxon:</strong> a rendszered olyan partnert vonz, aki egyszerre <em>emlékeztet</em> a gyermekkori sebek forrására, ÉS ígérete, hogy <em>most más lesz</em> — most megkapod, amit akkor nem. Ez a "szerelem első pillanata" biológiája: nem a rossz döntés, hanem a rendszer gyógyítási kísérlete. Az imago-tudatosság az első lépés ahhoz, hogy tudatosan válassz — nem az imago ellen, hanem vele együtt.</p>`;
  }

  html+=`</div>`;
  return html;
}

/* — motorhoz illesztés —
   A régi eredményoldal-kód (__oldRender) változatlanul fut egy leválasztott DOM-darabon, a régi
   eredmény-sablonnal; a mentést (ONI.save) elkapjuk és a motor végzi. */
let responses={};
const RES_HTML="<div class=\"res-eyebrow\">Eredmény · Imago-portré · Értelmezés</div>\n      <h2 class=\"res-title\">A te <em>imago-portréd</em></h2>\n      <p class=\"res-lead\">A portré nem \"értékel\" — leír. Ez egy tükör, ami megmutatja, mit hordozol be a rendszered a párkapcsolatokba. A tudatosság az első lépés — a Hendrix-féle munkában a portré ismerete önmagában elkezdi lassítani a paradoxális partnerválasztási mintát.</p>\n      <div class=\"imago-portrait\" id=\"imago-portraitCard\"></div>\n      <div class=\"chart-card\">\n        <h3>A négy <em>dimenzió</em> — top 5 mindegyikben</h3>\n        <div class=\"chart-sub\">Csoportosított összefoglaló bar chart</div>\n        <div id=\"imago-barChart\"></div>\n      </div>\n      <div class=\"rank-list\" id=\"imago-negTop\"></div>\n      <div class=\"rank-list\" id=\"imago-posTop\"></div>\n      <div class=\"rank-list\" id=\"imago-woundsTop\"></div>\n      <div class=\"rank-list\" id=\"imago-needsTop\"></div>\n      <div class=\"interp-card\" id=\"imago-interpCard\"></div>\n      <div class=\"cross-card\"><h3>Kapcsolatok más <em>területekkel</em></h3><div id=\"imago-cross-links\"></div></div>\n      <div class=\"refs-card\">\n        <h3>Tudományos <em>háttér</em></h3>\n        <div class=\"ref-item\"><strong>Hendrix, H. (1988/2007).</strong> Getting the Love You Want: A Guide for Couples. St. Martin's Griffin.</div>\n        <div class=\"ref-item\"><strong>Hendrix, H., & Hunt, H. L. (2013).</strong> Making Marriage Simple: 10 Truths for Changing the Relationship You Have into the One You Want.</div>\n        <div class=\"ref-item\"><strong>Muro, L., Holliman, R., & Luquet, W. (2016).</strong> Imago Relationship Therapy and accurate empathy development. <em>Journal of Couple & Relationship Therapy, 15(3)</em>, 232–246.</div>\n        <div class=\"ref-item\"><strong>Schmidt, C. D., Luquet, W., & Gehlert, N. C. (2015).</strong> Evaluating the impact of the \"Getting the Love You Want\" couples workshop. <em>Journal of Couple & Relationship Therapy, 14(1)</em>, 1–18.</div>\n      </div>";
function __oldRender(){
  const topNeg=topN('NEG',5);
  const topPos=topN('POS',5);
  const topWnd=topN('WND',5);
  const topNeed=topN('NEED',5);
  try{__cap({n:'Imágó',h:'Fő kielégítetlen szükséglet: '+(topNeed[0]?topNeed[0].t.split('—')[0].trim():'–'),d:Object.fromEntries(topNeed.filter(x=>x.v>0).map(x=>['n'+x.n,['Szükséglet: '+x.t.split('—')[0].trim().slice(0,40),x.v,0,3]])),x:{need:topNeed.slice(0,3).map(x=>x.t),wound:topWnd.slice(0,3).map(x=>x.t),neg:topNeg.slice(0,3).map(x=>x.t)}});}catch(e){console.warn('ONI',e)}
  document.getElementById('imago-portraitCard').innerHTML=generatePortrait(topNeg,topPos,topWnd,topNeed);
  // Bar chart — 4 kategória top 5 mindben
  window.CHARTS.barGroup(document.getElementById('imago-barChart'), [
    {title:'I. Negatív gondozó-vonások', color:'#fb7185', colorLight:'#f43f5e', max:3, items:topNeg.map(x=>({label:x.t, value:x.v}))},
    {title:'II. Pozitív gondozó-vonások', color:'#2dd4bf', colorLight:'#14b8a6', max:3, items:topPos.map(x=>({label:x.t, value:x.v}))},
    {title:'III. Gyermekkori sebek', color:'#a78bfa', colorLight:'#8b5cf6', max:3, items:topWnd.map(x=>({label:x.t.replace(/\.$/,''), value:x.v}))},
    {title:'IV. Kielégítetlen szükségletek', color:'#fbbf24', colorLight:'#fde047', max:3, items:topNeed.map(x=>({label:x.t.split('—')[0].trim(), value:x.v}))}
  ]);
  renderList('imago-negTop','I. Top negatív gondozó-<em>vonások</em>',topNeg,3,'#1e3a8a');
  renderList('imago-posTop','II. Top pozitív gondozó-<em>vonások</em>',topPos,3,'#0f766e');
  renderList('imago-woundsTop','III. Top <em>sebek</em>',topWnd,3,'#4338ca');
  renderList('imago-needsTop','IV. Top kielégítetlen <em>szükségletek</em>',topNeed,3,'#b8912e');

  // Interpretáció
  const negSum=ITEMS.filter(it=>it.s==='NEG').reduce((s,it)=>s+(responses[it.n]||0),0);
  const posSum=ITEMS.filter(it=>it.s==='POS').reduce((s,it)=>s+(responses[it.n]||0),0);
  const wndSum=ITEMS.filter(it=>it.s==='WND').reduce((s,it)=>s+(responses[it.n]||0),0);
  const needSum=ITEMS.filter(it=>it.s==='NEED').reduce((s,it)=>s+(responses[it.n]||0),0);
  let interp=`<h3>Klinikai <em>értelmezés</em></h3>`;

  interp+=`<div class="interp-section"><h4>Negatív-pozitív egyensúly</h4>`;
  if(negSum>posSum*2){
    interp+=`<p>A negatív vonások jelentősen dominánsak (${negSum} vs ${posSum} pozitív). Ez hangsúlyos mintázat; többféle háttere lehet, a nehéz gyermekkori tapasztalatok ezek egyike. Az imago-alapú vonzalom ilyenkor különösen erős: a rendszered <em>nagyon</em> keresi a gyógyulást a partnerekben. Trauma-informált terápiás munka jelentős erőforrás.</p>`;
  } else if(negSum>posSum){
    interp+=`<p>A negatív vonások enyhén dominánsak (${negSum} vs ${posSum}). Ez tipikus tartomány — a legtöbb ember gyermekkori gondozói kombinációja pozitív és negatív vonások. Az imago-mintázat működik, de nem extrém.</p>`;
  } else {
    interp+=`<p>A pozitív vonások dominánsak vagy egyensúlyban (${posSum} pozitív vs ${negSum} negatív). Ez kedvező — a gyermekkori "biztonságos alap" jelen van. Az imago-alapú partnerválasztás itt is működik, de az újra-aktiválódások szelídebbek.</p>`;
  }
  interp+=`</div>`;

  interp+=`<div class="interp-section"><h4>Seb-intenzitás</h4>`;
  if(wndSum>=25){
    interp+=`<p><strong>Magas seb-intenzitás.</strong> Erős gyermekkori érzelmi sebek jelenlétét mutatod. Ez nem "hiba" — a gyógyulás terápiában elérhető. Trauma-fókuszú megközelítések (EMDR, Schema Therapy, IFS, AEDP) különösen relevánsak.</p>`;
  } else if(wndSum>=15){
    interp+=`<p>Közepes seb-intenzitás. Vannak érzelmi mintázatok, amik a közeli kapcsolatokban aktiválódnak. A tudatosság önmagában sokat segít.</p>`;
  } else {
    interp+=`<p>Alacsony seb-intenzitás. A gyermekkori kötődési tapasztalatok többnyire pozitívak vagy semlegesek voltak. A partneri kapcsolatokban kevesebb "aktiválódási csapda".</p>`;
  }
  interp+=`</div>`;

  // 4 dimenzió külön részletes interp
  interp+=`<div class="interp-section"><h4>I. Negatív gondozó-vonások — részletes olvasat</h4>`;
  if(topNeg[0].v>=2){
    interp+=`<p>A legerősebb negatív vonás: <strong>"${topNeg[0].t}"</strong> (${topNeg[0].v}/3). Tisztázó kérdés: előfordul, hogy felnőttként <em>szinte automatikusan reagálsz</em>, amikor egy partnernél ezt a vonást észleled — vagy erős vonzalommal (a rendszer gyógyítani akar), vagy erős taszítással? Az Imágó-elmélet szerint mindkettő ugyanabból a korai élményből eredhet; hogy nálad így van-e, azt a saját tapasztalatod dönti el.</p>`;
    if(topNeg.filter(x=>x.v>=2).length>=3){
      interp+=`<p>Több markáns negatív vonás egyszerre: ez összetett, több-rétegű imago. A partnereidnél nem egy-egy tulajdonságra, hanem egész <em>karakter-mintázatra</em> reagálsz. Ez sok "furán ismerős" élmény forrása lehet, még akkor is, ha egyes tulajdonságok nem egyeznek.</p>`;
    }
  } else {
    interp+=`<p>A negatív vonások összességében alacsonyak. Vagy egészséges gyermekkori környezetre utal, vagy — figyelmeztetés — a védekező rendszer még nem enged hozzáférést a nehezebb emlékekhez. Ha úgy érzed, az utóbbi lehet, ez terápiában biztonságosan feltárható.</p>`;
  }
  interp+=`</div>`;

  interp+=`<div class="interp-section"><h4>II. Pozitív gondozó-vonások — részletes olvasat</h4>`;
  if(topPos[0].v>=2){
    interp+=`<p>A legerősebb pozitív vonás: <strong>"${topPos[0].t}"</strong> (${topPos[0].v}/3). Ez az, amit belülre <em>vittél magaddal</em> — a "belső jó szülő" alapanyaga. Amikor egy partnerben ezt a vonást találod, "otthon" érzed magad — de vigyázz: az önmagában nem elég, ha a negatív oldal is aktiválódik.</p>`;
  } else {
    interp+=`<p>A pozitív vonások alacsonyak. Ez gyakori a nehéz gyermekkori kontextusban, de figyelemre méltó: a belső "biztonságos alap" nélküle nehezebb egy egészséges felnőtt kapcsolatot megtartani. Ez terápiásan pótolható — az "earned security" (megszerzett biztonság) fogalma erre vonatkozik.</p>`;
  }
  interp+=`</div>`;

  interp+=`<div class="interp-section"><h4>III. Gyermekkori sebek — részletes olvasat</h4>`;
  if(topWnd[0].v>=2){
    const woundText = topWnd[0].t.replace(/\.$/,'');
    interp+=`<p>A legerősebb seb: <strong>"${woundText}"</strong> (${topWnd[0].v}/3). Egy közeli, romantikus kapcsolat <em>automatikusan újra-aktiválja</em> ezt a sebet — nem a partnered "rontja el", hanem a közelség maga hozza vissza. Amikor ez a seb aktív, a rendszered a gyermekkori védekezéseket használja (nem a felnőtt eszközöket) — pl. visszahúzódik, támad, disszociál, kompenzál.</p>`;
    if(topWnd.filter(x=>x.v>=2).length>=3){
      interp+=`<p><strong>Több markáns seb egyszerre</strong> — ez összetett sebzési mintázat. A jó hír: mindegyik <em>ugyanabból a talajból</em> jött, és a gyógyulás nem sebenként, hanem alapállás-szinten történik (az egyik legerősebb terápiás elv: nem tüneteket kezelünk, hanem a rendszert, ami termeli őket).</p>`;
    }
  } else {
    interp+=`<p>A sebek intenzitása alacsony. Ez kedvező alap. Ha valamilyen kapcsolati distresszt élsz meg most, az inkább szituációs, nem strukturális.</p>`;
  }
  interp+=`</div>`;

  interp+=`<div class="interp-section"><h4>IV. Kielégítetlen szükségletek — részletes olvasat</h4>`;
  if(topNeed[0].v>=2){
    const needText = topNeed[0].t.split('—')[0].trim();
    interp+=`<p>A leginkább kielégítetlen szükséglet: <strong>"${needText}"</strong> (${topNeed[0].v}/3). <em>Ezt keresi</em> a rendszered a partnerekben — akár tudatosan, akár nem. A "szerelem első pillanata" élmény egy részének <em>ez</em> a magja: valaki, aki ígéri, hogy ezt most megkaphatod.</p>`;
    interp+=`<p><strong>A csapda:</strong> nem tudod megkapni egy partnertől, amit nem kaptál meg gyerekként. A partnered lehet szerető, jelenlévő, támogató — de nem tudja "visszaadni" a hiányzó gyermekkori tapasztalatot. Egy fokig kompenzál — de ha ezt teszed a partneri kapcsolat elsődleges feladatává, gyakorlatilag lehetetlen elvárást teszel.</p>`;
    interp+=`<p><strong>A megoldás Hendrix szerint:</strong> a szükségletet <em>magadnak</em> kell megadnod (self-parenting), miközben a partner egy támogató társ ebben — nem a "javítás forrása".</p>`;
  } else {
    interp+=`<p>A kielégítetlen szükségletek listája alacsony. Kedvező profilelem — a párkapcsolati elvárásaid reálisak, nem kompenzációs alapon.</p>`;
  }
  interp+=`</div>`;

  // Partnermintázati előrejelzés
  if(topNeg[0].v>=2 && topWnd[0].v>=2){
    interp+=`<div class="interp-section"><h4>Előrejelezhető partneri mintázat</h4>`;
    interp+=`<p>Az imago-portréd alapján a rendszered valószínűbben vonz olyan partnereket, akiknél:</p>`;
    interp+=`<ul style="color:var(--ink-lite-soft);font-size:14.5px;line-height:1.65;margin-left:20px;margin-top:8px">`;
    topNeg.filter(x=>x.v>=2).slice(0,3).forEach(t=>{
      interp+=`<li style="margin-bottom:6px">Van bennük valami <em>"${t.t}"</em> jellegű — akár enyhén.</li>`;
    });
    interp+=`</ul>`;
    interp+=`<p style="margin-top:10px">Ez <strong>nem determinisztikus</strong> — csak valószínűségi mintázat. A tudatosság maga csökkenti a "vak" vonzódást. Amikor legközelebb erős vonzalmat érzel, tedd fel magadnak a kérdést: <em>mennyire fed át ez a partner az én imago-portrémmal?</em> Ha nagyon — a rendszered "kattant", nem feltétlenül a szíved.</p>`;
    interp+=`</div>`;
  }

  // Terápiás javaslatok
  interp+=`<div class="interp-section"><h4>Terápiás út — mit tehetsz</h4>`;
  if(wndSum>=25){
    interp+=`<p><strong>Trauma-fókuszú terápia javasolt.</strong> A magas seb-intenzitás mellett az önismereti munka önmagában nem elég. Modalitások, amik erre a mintázatra épültek:</p>`;
    interp+=`<ul style="color:var(--ink-lite-soft);font-size:14.5px;line-height:1.7;margin-left:20px;margin-top:8px">`;
    interp+=`<li style="margin-bottom:6px"><strong>Imago Relationship Therapy (Hendrix)</strong> — az itt kirajzolódó portrét kifejezetten kezeli, párban vagy egyénileg.</li>`;
    interp+=`<li style="margin-bottom:6px"><strong>Schema Therapy (Young)</strong> — a séma-mintázatok (Abandonment, Defectiveness, Mistrust) direkt kezelése.</li>`;
    interp+=`<li style="margin-bottom:6px"><strong>Internal Family Systems (IFS)</strong> — a "sebesült gyermek" és "védekező rész" különválasztása, integráció.</li>`;
    interp+=`<li style="margin-bottom:6px"><strong>EMDR</strong> — konkrét gyermekkori emlékek deszenzitizálása.</li>`;
    interp+=`</ul>`;
  } else if(wndSum>=15){
    interp+=`<p><strong>Önismereti munka + esetleges terápia.</strong> A közepes seb-intenzitás melletti tudatosság-építés (könyvek, workshopok, journaling) sokat segíthet. Ha kapcsolati distresszt élsz meg, terápia is indokolt.</p>`;
    interp+=`<ul style="color:var(--ink-lite-soft);font-size:14.5px;line-height:1.7;margin-left:20px;margin-top:8px">`;
    interp+=`<li style="margin-bottom:6px">Hendrix könyv: <em>Getting the Love You Want</em> — a portré önismereti feldolgozása.</li>`;
    interp+=`<li style="margin-bottom:6px">Séma-írás (journaling) — a napi partneri és kapcsolati reakcióid megfigyelése az imago-mintázat tükrében.</li>`;
    interp+=`<li style="margin-bottom:6px">Imago-workshop (weekend intensive) — 2-3 napos strukturált munka párral vagy egyénileg.</li>`;
    interp+=`</ul>`;
  } else {
    interp+=`<p><strong>Nem szükséges intenzív terápiás munka.</strong> Alacsony seb-intenzitás mellett a portré megismerése önmagában értékes — de nem "kezelendő" jelenség.</p>`;
  }
  interp+=`</div>`;

  // Post-breakup kontextus
  interp+=`<div class="interp-section"><h4>Post-breakup kontextus</h4><p>Ha friss szakítás után vagy, két dolog fontos: (1) az imago-portré <em>most</em> különösen aktív — a fájdalom közel van, a mintázatok élénkek. (2) <strong>Ne dönts most partnerről.</strong> A rendszered épp a régi mintázatot próbálja "meggyógyítani" — és pontosan ilyenkor húz be legerősebben egy hasonló mintázatba, csak "jobb változatban". A 6-12 hónapos "single reset" időszak nem véletlen ajánlás — az imago-rendszernek időre van szüksége <em>lelassulni</em>, mielőtt új partnert integrálni tud.</p></div>`;

  // Praktikus napi lépések
  interp+=`<div class="interp-section"><h4>Praktikus napi lépések</h4>`;
  interp+=`<p><strong>1. Ismerd fel a mintát.</strong> Amikor egy partnernél erős vonzalmat érzel (különösen ha "furán ismerős"), nézd meg: mennyire fed át az imago-portréddal?</p>`;
  interp+=`<p><strong>2. Ne az imago ellen — vele együtt.</strong> A cél nem az, hogy "egészen más" partnert válassz — hanem hogy tudatosan válaszd meg, mennyi az újra-aktiválódási csapda és mennyi a gyógyulás lehetősége. Egy partner, akinél <em>egyáltalán semmi</em> imago-átfedés nincs, gyakran nem is vonzó.</p>`;
  interp+=`<p><strong>3. Self-parenting gyakorlat.</strong> A napi 5 perces "belső gyermek check-in" — mit érzek most a legmélyebb szinten, és mi kellene most az én <em>kicsi részemnek</em>? Ezt tudod te magadnak megadni, még mielőtt bármely partner megjelenne.</p>`;
  interp+=`<p><strong>4. Terápia vagy pár-munka.</strong> Az imago-tudatosság önmagában nem gyógyít — csak lehetőséget teremt. A Hendrix-féle Imago Relationship Therapy pontosan erre a mintázatra épült.</p>`;
  interp+=`</div>`;

  document.getElementById('imago-interpCard').innerHTML=interp;

  // Cross-links
  const links=[];
  if(wndSum>=20){
    links.push({label:'ECR-R (kötődés) korreláció',text:`Magas seb-intenzitás gyakran együtt jár a fearful-avoidant vagy anxious-preoccupied kötődési profilokkal. Ha nem töltötted még ki az ECR-R-t, most különösen releváns.`});
    links.push({label:'SMI Vulnerable Child + Punitive Parent',text:`A gyermekkori sérülésekre utaló magas pontszámok gyakran együtt járhatnak magasabb Sebezhető gyermek és Büntető szülő módokkal. Ha az SMI-t még nem töltötted, komplex kép ott lesz.`});
    links.push({label:'CTQ (Childhood Trauma Questionnaire) — következő lépés',text:`Ha az imago-portré nehéz vagy fájdalmas volt, a CTQ (Childhood Trauma Questionnaire — Bernstein) strukturáltabb szűrés a gyermekkori trauma-történetre. Terápiás munka része lehet.`});
  }
  if(topWnd.filter(x=>x.v>=2).some(x=>x.t.includes('kritikus')||x.t.includes('elég'))){
    links.push({label:'"Nem vagyok elég" alap-séma',text:`A "kritika" és a "nem elég" sebek erős korrelációt mutatnak a Defectiveness/Shame sémával (Young). Ez felnőttként gyakran teljesítmény-túlkompenzálásban jelenik meg.`});
  }
  if(negSum>=25 && posSum>=15){
    links.push({label:'Ambivalens gyermekkori kép',text:`Együttesen erős negatív ÉS pozitív gondozói vonások az ambivalens kötődés lenyomata — "közel és távol egyszerre". Ez a fearful-avoidant kötődés tipikus felnőttkori profilja.`});
  }
  document.getElementById('imago-cross-links').innerHTML=links.length?links.map(l=>`<div class="cross-item"><div class="cross-item-label">${l.label}</div><p>${l.text}</p></div>`).join(''):`<p style="color:var(--ink-muted);font-style:italic">Nincs jelenlegi markáns keresztmintázat.</p>`;

  document.getElementById('imago-results').classList.add('visible');
  setTimeout(()=>{document.getElementById('imago-results').scrollIntoView({behavior:'smooth',block:'start'});},100);
}
function __run(){
  let payload=null;const __cap=p=>{payload=p;};
  const box=window.document.createElement('div');box.innerHTML='<div id="imago-results">'+RES_HTML+'</div>';
  const fake={getElementById:id=>box.querySelector('#'+CSS.escape(id)),querySelector:s=>box.querySelector(s),querySelectorAll:s=>box.querySelectorAll(s),createElement:(...a)=>window.document.createElement(...a)};
  const real=document;document=fake;window.__cap=__cap;try{__oldRender();}finally{document=real;delete window.__cap;}
  return {oni:payload,html:box.firstChild.innerHTML};
}
makeTest({
  id:"imago",key:"imago-responses-v1",name:"Imago",c1:"#7c3aed",c2:"#d4a017",
  tab:"Imago",tabSub:"Imago · 57 item",scale:typeof SCALE!=="undefined"?SCALE:[],
  header:{"status": "model", "statusText": "Terápiás önreflexiós keret · nem mérőeszköz", "eyebrow": "Imago Self-Assessment · Harville Hendrix (Getting the Love You Want, 1988)", "title": "Az <em>imagód</em>", "lead": "Az <em>imago</em> (Hendrix fogalma) az a belső \"profil\", amit a rendszered a gyermekkori gondozóid tulajdonságaiból, sebeidből és kielégítetlen szükségleteidből épített fel — és amit <strong>felnőttként partnerekben keres</strong>, hogy meggyógyítsa. Paradox: pont azt a fájdalom-mintázatot vonzod, amit gyógyítani szeretnél. Ez nem hiba a rendszerben — ez a rendszer.", "intro": "<p><strong>Kitöltési útmutató:</strong> 4 szakaszon vezet végig, összesen 57 item. Mindegyiknél 0–3 skálán értékeld, mennyire jellemző volt / jellemző rád. Végül automatikusan generál egy <em>imago-portrét</em> — mit \"keres\" a rendszered anélkül, hogy tudná.</p>"},
  sections:(()=>{const out=[];ITEMS.forEach(it=>{let sec=out[out.length-1];if(!sec||sec.key!==it.s){sec={key:it.s,title:SECTIONS[it.s].title,desc:SECTIONS[it.s].desc,items:[]};out.push(sec);}
    const trait=it.s==='NEG'||it.s==='POS';sec.items.push({s:it.s,t:trait?'Mennyire volt jellemző: <strong>'+it.t+'</strong>':it.t});});return out;})(),
  score(R){responses={};R.items.forEach(i=>{if(i.raw!==undefined)responses[i.n]=i.raw;});return __run();},
  sum(s){return s.oni;},
  render(R,s){return s.html;}
});
})();
