/* Önismereti térképek — tesztek közti minták (közös modul).
   Az összegzés, a mélyelemzés és a Fókusz-oldal ugyanezeket a szabályokat használja.
   Használat: var RX = ONI_RULES({store: ONI.all(), isCur: ONI.isCur}); RX.evalRules() → {fired, locked} */
window.ONI_RULES = function(ctx){
const store = ctx.store || {};
const last=id=>{const h=store[id];return h&&h.length?h[h.length-1]:null};
const cur=id=>{const r=last(id);return r&&(!ctx.isCur||ctx.isCur(id,r))?r:null};
let TRACK=null;
const val=(id,k)=>{const r=cur(id);if(TRACK&&r&&r.d&&r.d[k])TRACK.push([id,k]);return r&&r.d&&r.d[k]?r.d[k][1]:null};
const avgAll=id=>{const r=cur(id);if(TRACK&&r)TRACK.push([id,'*']);if(!r||!r.d)return null;const v=Object.values(r.d).map(x=>x[1]).filter(x=>typeof x==='number');return v.length?v.reduce((a,b)=>a+b,0)/v.length:null};

/* ── Minták: legalább `min` jelzés kell ugyanabba az irányba ── */
const S=(test,label,fn)=>({test,label,fn});
const RULES=[
 {id:'anx',title:'Szorongó kötődési minta',acc:'#fb7185',min:2,
  sig:[S('ecr','ECR-R szorongás ≥ 4,5',()=>val('ecr','anx')>=4.5),S('kotodes','Mélytérkép: szorongás ≥ 50',()=>val('kotodes','anxiety')>=50),S('las','Mania (birtokló szeretet) ≥ 3',()=>val('las','mania')>=3),S('smi','Sebezhető gyermek mód ≥ 4',()=>val('smi','vuln')>=4),S('ysq','Elhagyatottság séma ≥ 4,5',()=>val('ysq','ab')>=4.5)],
  text:'Ezek az eredmények arra utalhatnak, hogy a kötődési rendszered érzékenyen reagál a másik elérhetőségére: távolság vagy bizonytalanság esetén gyorsabban jelenhet meg a nyugtalanság, a megerősítés keresése, a jelek figyelése.',
  q:'Felismersz magadon ilyen helyzetet az elmúlt hónapokból? Mi váltotta ki, és mi segített megnyugodni?',
  action:'Figyeld meg a következő „riasztásnál”, mi a kiváltó, és mit csinálsz utána (üzenet, ellenőrzés, visszahúzódás). Ezt a láncot érdemes terápiában vagy egy megbízható emberrel átbeszélni.'},
 {id:'avo',title:'Elkerülő kötődési minta',acc:'#60a5fa',min:2,
  sig:[S('ecr','ECR-R elkerülés ≥ 4,5',()=>val('ecr','avd')>=4.5),S('kotodes','Mélytérkép: elkerülés ≥ 50',()=>val('kotodes','avoidance')>=50),S('las','Ludus (játékos szeretet) ≥ 3',()=>val('las','ludus')>=3),S('smi','Elszakadó védő mód ≥ 4',()=>val('smi','detached')>=4),S('ysq','Érzelmi gátoltság séma ≥ 4,5',()=>val('ysq','ei')>=4.5)],
  text:'Ezek az eredmények arra utalhatnak, hogy a közelség nálad könnyebben élhető meg nyomásként, és a biztonságot inkább az önállóság és a kontroll adja. Ez a mélyebb érzelmi bevonódást nehezítheti.',
  q:'Van olyan kapcsolati helyzet, amikor érezted, hogy hátrébb lépsz, miközben valójában közelebb szerettél volna kerülni?',
  action:'Nézd meg, mikor húzódsz vissza: melyik helyzet után, milyen testi jelzéssel. A visszahúzódás előtti pillanat az, ahol választásod van.'},
 {id:'withdraw',title:'Kivonulás konfliktusban',acc:'#94a3b8',min:2,
  sig:[S('tki','Elkerülő konfliktusmód ≥ 3,5',()=>val('tki','avoid')>=3.5),S('gott','Falazás ≥ 3,5',()=>val('gott','stone')>=3.5),S('ecr','ECR-R elkerülés ≥ 4,5',()=>val('ecr','avd')>=4.5),S('ysq','Érzelmi gátoltság ≥ 4,5',()=>val('ysq','ei')>=4.5)],
  text:'Lehetséges, hogy feszült helyzetben hajlamos vagy lekapcsolni vagy kilépni. Ez sokszor nem tudatos döntés, hanem túlterhelődés. A másik fél viszont elutasításként élheti meg.',
  q:'Mi történik a testedben közvetlenül azelőtt, hogy egy vitából kivonulsz?',
  action:'Vezess be egy <b>bejelentett szünetet</b>: „Most túl sok, 20 perc múlva visszajövök.” A kivonulás így nem büntetésnek, hanem szabályozásnak látszik.'},
 {id:'finish',title:'Indít, de nem zár le',acc:'#fbbf24',min:2,
  sig:[S('kolbe','Gyorsindító ≥ 7',()=>val('kolbe','qs')>=7),S('kolbe','Rendszerező ≤ 4',()=>val('kolbe','ft')!==null&&val('kolbe','ft')<=4),S('bf','Lelkiismeretesség ≤ 36/60',()=>val('bf','C')!==null&&val('bf','C')<=36),S('ft','Kötelességtudó vagy Lázadó tendencia',()=>{const r=last('ft');return r&&r.x&&(r.x.primary==='O'||r.x.primary==='R')}),S('ysq','Elégtelen önkontroll séma ≥ 4,5',()=>val('ysq','is')>=4.5),S('fti','Felfedező temperamentum ≥ 38',()=>val('fti','exp')>=38),S('ips','IPS halogatás ≥ 28',()=>val('ips','total')>=28)],
  text:'Ezek a jelzések olyan mintára utalhatnak, amelyben az indítás energiája erős, a lezáráshoz szükséges struktúra gyengébb. Ilyenkor a további tervezés kevésbé segít, mint egy külső lezárási pont.',
  q:'Melyik az a 2–3 elkezdett dolog, amit most lezárhatnál, mielőtt újat kezdesz?',
  action:'A befejezést ne akaraterőre bízd: <b>külső lezárási pont</b> kell (határidő valakinek, fizetett vállalás, heti beszámoló), vagy egy Rendszerező alkatú partner. Új projekt csak egy régi lezárása után.'},
 {id:'paralysis',title:'Elemzési bénultság',acc:'#818cf8',min:2,
  sig:[S('kolbe','Tényfeltáró ≥ 7',()=>val('kolbe','ff')>=7),S('kolbe','Gyorsindító ≤ 4',()=>val('kolbe','qs')!==null&&val('kolbe','qs')<=4),S('ft','Kérdező tendencia',()=>{const r=last('ft');return r&&r.x&&r.x.primary==='Q'}),S('ysq','Könyörtelen mércék ≥ 4,5',()=>val('ysq','us')>=4.5),S('ips','IPS halogatás ≥ 28',()=>val('ips','total')>=28)],
  text:'Lehetséges, hogy a döntés előtti információgyűjtés biztonságot ad neked, de időnként a döntést helyettesíti.',
  q:'Melyik döntést halasztod most azzal, hogy még utánanézel valaminek?',
  action:'Minden döntésnél írd fel előre: <b>meddig gyűjtök, és milyen információ változtatná meg a döntést?</b> Ha a határidő lejárt, a legjobb elérhető opció mellett döntesz.'},
 {id:'autonomy',tone:'jelleg',title:'Autonómia a motor',acc:'#a78bfa',min:2,
  sig:[S('pvq','Önirányítás vezérérték (centrált ≥ 0,5)',()=>val('pvq','SD')>=0.5),S('ft','Lázadó vagy Kérdező tendencia',()=>{const r=last('ft');return r&&r.x&&(r.x.primary==='R'||r.x.primary==='Q')}),S('pvq','Konformitás alacsony (≤ −0,5)',()=>val('pvq','CO')!==null&&val('pvq','CO')<=-0.5),S('kolbe','Gyorsindító ≥ 7',()=>val('kolbe','qs')>=7)],
  text:'Ezek a jelzések arra utalhatnak, hogy a választás szabadsága és a saját út nálad energiaforrás, a kívülről ráerőltetett keretek pedig lemeríthetnek, akkor is, ha észszerűek.',
  q:'Hol érzed most kötelezőnek azt, amit akár saját választásként is felépíthetnél?',
  action:'A szükséges struktúrát <b>saját választásként</b> építsd fel: te döntöd el a szabályt, a határidőt, a formát. Munkában ott teremts értéket, ahol te határozod meg a hogyant.'},
 {id:'drive',title:'Teljesítmény-hajtás',acc:'#f59e0b',min:2,
  sig:[S('pvq','Teljesítmény érték (centrált ≥ 0,5)',()=>val('pvq','AC')>=0.5),S('ysq','Könyörtelen mércék ≥ 4,5',()=>val('ysq','us')>=4.5),S('smi','Követelő szülő mód ≥ 4',()=>val('smi','demanding')>=4),S('bf','Lelkiismeretesség ≥ 44/60',()=>val('bf','C')>=44),S('tki','Versengő konfliktusmód ≥ 3,5',()=>val('tki','comp')>=3.5),S('scs','Önítélkezés ≥ 3,5',()=>val('scs','SJ')>=3.5)],
  text:'A siker és a mérce nálad valószínűleg központi szerepű. Ez hajtóerő lehet, de ha a belső követelő hang túl erős, az eredmény ritkán érződik elégnek.',
  q:'Mikor pihentél utoljára bűntudat nélkül?',
  action:'Tegyél különbséget <b>vágy és kényszer</b> között: „Ezt azért csinálom, mert akarom, vagy mert különben nem vagyok elég?” Ahol a második, ott a mérce nem motivál, hanem büntet.'},
 {id:'emo',title:'Erős érzelmi reaktivitás',acc:'#fb7185',min:2,
  sig:[S('bf','Neuroticizmus ≥ 40/60',()=>val('bf','N')>=40),S('smi','Sebezhető gyermek ≥ 4',()=>val('smi','vuln')>=4),S('smi','Dühös gyermek ≥ 4',()=>val('smi','angry')>=4),S('ecr','ECR-R szorongás ≥ 4,5',()=>val('ecr','anx')>=4.5),S('gott','Elárasztás/falazás ≥ 3,5',()=>val('gott','stone')>=3.5),S('ders','DERS-SF összpontszám ≥ 54',()=>val('ders','total')>=54),S('ders','DERS impulzuskontroll ≥ 10',()=>val('ders','impulse')>=10)],
  text:'Ezek a jelzések arra utalhatnak, hogy az érzelmek nálad gyorsan és erősen jönnek, és nehezebben csillapodnak. Ez érzékenység, nem jellemhiba, és szabályozással jól kezelhető.',
  q:'Melyik az a helyzet, amelyben a leggyorsabban „felmegy” benned valami?',
  action:'A kulcs a <b>szabályozás a reakció előtt</b>: légzés, mozgás, szünet. Érdemes egy légzéstechnikát addig gyakorolni, amíg automatikus nem lesz.'},
 {id:'soothe',title:'Öncsillapító megküzdés',acc:'#2dd4bf',min:2,
  sig:[S('smi','Elterelő öncsillapító mód ≥ 4',()=>val('smi','soother')>=4),S('ysq','Elégtelen önkontroll ≥ 4,5',()=>val('ysq','is')>=4.5),S('smi','Impulzív gyermek ≥ 4',()=>val('smi','impulsive')>=4),S('bf','Neuroticizmus ≥ 40/60',()=>val('bf','N')>=40),S('tfeq','Érzelmi evés ≥ 50/100',()=>val('tfeq','EE')>=50),S('ders','DERS korlátozott stratégiák ≥ 10',()=>val('ders','strat')>=10)],
  text:'Lehetséges, hogy feszültség alatt gyors csillapításhoz nyúlsz (evés, görgetés, munka, stimuláció), ami rövid távon működik, de nem oldja meg azt, ami a feszültséget okozta.',
  q:'Mi az a csillapító, amihez a leggyakrabban nyúlsz, és mit érzel közvetlenül előtte?',
  action:'Nem tiltás kell, hanem <b>köztes lépés</b>: mielőtt a megszokott csillapítóhoz nyúlsz, 2 perc: „Mit érzek most, és mire lenne valójában szükségem?”'},
 {id:'access',title:'Nehéz hozzáférés az érzésekhez',acc:'#818cf8',min:2,
  sig:[S('tas','TAS-20 ≥ 61',()=>val('tas','total')>=61),S('maia2','MAIA-2 átlag ≤ 2,5',()=>{const a=avgAll('maia2');return a!==null&&a<=2.5}),S('ysq','Érzelmi gátoltság ≥ 4,5',()=>val('ysq','ei')>=4.5),S('smi','Elszakadó védő ≥ 4',()=>val('smi','detached')>=4),S('ders','DERS tisztánlátás ≥ 10',()=>val('ders','clarity')>=10),S('ders','DERS tudatosság ≥ 10',()=>val('ders','aware')>=10)],
  text:'Ezek az eredmények arra utalhatnak, hogy az érzések felismerése, megnevezése vagy a testi jelzések észlelése nehezebben megy. Ilyenkor az érzelmek inkább feszültségként vagy fáradtságként jelenhetnek meg.',
  q:'Tegnap milyen érzéseid voltak? Hány szóval tudnád megnevezni őket?',
  action:'Napi 2×1 perc <b>testi check-in</b>: hol érzel feszültséget, milyen a légzésed, milyen szó írja le. Az interocepció edzhető.'},
 {id:'giver',title:'Önfeláldozó minta',acc:'#34d399',min:2,
  sig:[S('las','Agape ≥ 4',()=>val('las','agape')>=4),S('tki','Alkalmazkodó konfliktusmód ≥ 3,5',()=>val('tki','acc')>=3.5),S('ysq','Önfeláldozás séma ≥ 4,5',()=>val('ysq','ss')>=4.5),S('smi','Alávető mód ≥ 4',()=>val('smi','compliant')>=4),S('ft','Kötelességtudó tendencia',()=>{const r=last('ft');return r&&r.x&&r.x.primary==='O'})],
  text:'Ezek a jelzések arra utalhatnak, hogy mások igényei gyakran megelőzik a sajátjaidat. Ha ez tartós, felgyűlhet a neheztelés.',
  q:'Mi az a saját igényed, amit mostanában nem mondtál ki?',
  action:'Hetente egy <b>kimondott saját igény</b>, kompromisszum nélkül. Figyeld, milyen érzés, és mi történik a kapcsolatban.'},
 {id:'spectator',title:'Megfigyelő mód az intimitásban',acc:'#fb7185',min:2,
  sig:[S('sisses','SIS1 (teljesítménygátlás) ≥ 3',()=>val('sisses','sis1')>=3),S('saq','Szexuális monitorozás ≥ 32',()=>val('saq','SM')>=32),S('nsss','Szexuális elégedettség ≤ 60',()=>val('nsss','total')!==null&&val('nsss','total')<=60),S('pedt','PEDT ≥ 9',()=>val('pedt','total')>=9)],
  text:'Lehetséges, hogy intim helyzetben a figyelmed egy része kívülről figyeli, hogyan teljesítesz. Ezt a „spectator mode” mintát a kutatások a teljesítményszorongással hozzák összefüggésbe.',
  q:'Mire figyelsz leginkább intim helyzetben: az érzeteidre, vagy arra, hogyan alakul?',
  action:'A figyelem visszahozása <b>az érzetekbe</b> (sensate focus): teljesítménycél nélküli érintés, a jelen pillanat érzeteire fókuszálva. Tartós panasznál szexuálterapeuta.'},
 {id:'harsh',title:'Éles kommunikáció vitában',acc:'#f97316',min:2,
  sig:[S('gott','Kritika ≥ 3,5',()=>val('gott','crit')>=3.5),S('gott','Megvetés ≥ 3',()=>val('gott','cont')>=3),S('tki','Versengő konfliktusmód ≥ 3,5',()=>val('tki','comp')>=3.5),S('smi','Támadó mód ≥ 4',()=>val('smi','bully')>=4)],
  text:'Ezek a jelzések arra utalhatnak, hogy vitában élesebben fogalmazol, mint szeretnéd: a konkrét viselkedés helyett a személyt minősíted. Gottman kutatásaiban ez a kapcsolati romlás egyik erős előrejelzője volt.',
  q:'Melyik mondatod szokott a legtöbb bajt okozni egy vitában?',
  action:'<b>Szelíd indítás</b>: „Én ___ érzek, amikor ___ történik. Azt szeretném, ha ___.” Egy hétig minden panaszt így fogalmazz meg.'},
 {id:'shame',title:'Büntető belső hang',acc:'#fb7185',min:2,
  sig:[S('scs','Önegyüttérzés ≤ 2,5',()=>val('scs','total')!==null&&val('scs','total')<=2.5),S('ysq','Büntető készenlét séma ≥ 4,5',()=>val('ysq','pu')>=4.5),S('smi','Büntető szülő mód ≥ 4',()=>val('smi','punitive')>=4),S('ders','Érzelmek el nem fogadása ≥ 10',()=>val('ders','nonacc')>=10),S('scs','Önítélkezés ≥ 3,5',()=>val('scs','SJ')>=3.5)],
  text:'Lehetséges, hogy hibázás vagy nehéz érzés után a belső hangod inkább büntet, mint támogat. A kutatások szerint ez nem növeli a motivációt, inkább a kudarctól való félelmet és az elkerülést erősíti.',
  q:'Hogyan beszélsz magadban magadhoz, amikor elrontasz valamit? Így beszélnél egy barátoddal is?',
  action:'Kudarc után <b>három mondat</b>: „Ez most nehéz. Ezt más is átéli. Mit mondanék egy barátomnak?” Az önegyüttérzés a kutatásokban több újrapróbálkozással jár, nem kevesebbel.'},
 {id:'emoproc',title:'Érzelmi halogatás',acc:'#f59e0b',min:2,
  sig:[S('ips','IPS halogatás ≥ 28',()=>val('ips','total')>=28),S('ders','DERS célirányos működés ≥ 10',()=>val('ders','goals')>=10),S('ders','DERS korlátozott stratégiák ≥ 10',()=>val('ders','strat')>=10),S('scs','Túlazonosulás ≥ 3,5',()=>val('scs','OI')>=3.5)],
  text:'Ezek a jelzések arra utalhatnak, hogy a halogatás mögött nem (csak) időbeosztás áll, hanem az, hogy a feladat kellemetlen érzést kelt, és az elkerülés azonnal csillapít.',
  q:'Melyik feladatot halogatod most, és milyen érzést kelt benned, ha rágondolsz?',
  action:'A feladat előtt nevezd meg az érzést, amit kelt, és tedd <b>nevetségesen kicsivé</b> az első lépést (2 perc, egy mondat, egy fájl megnyitása). Az érzés a kezdés után sokszor gyengül.'},
 {id:'bids',title:'Minőségi idő-igény, gyenge felé fordulás',acc:'#fbbf24',min:2,
  sig:[S('love','Első szeretetnyelv: Minőségi idő',()=>{const r=last('love');if(!r)return false;const top=Object.entries(r.d).sort((a,b)=>b[1][1]-a[1][1])[0];return top&&top[0]==='B'}),S('gott','Egymás felé fordulás ≤ 3',()=>val('gott','turn')!==null&&val('gott','turn')<=3)],
  text:'A figyelem és a közös jelenlét a legfontosabb szeretetnyelved, miközben az eredmények szerint a kapcsolatban az apró kapcsolódási kísérletekre adott válasz gyengébb. Ez hiányérzethez vezethet.',
  q:'Mikor érezted utoljára, hogy a párod teljes figyelme veled van?',
  action:'Egy hétig figyeld és számold a saját és a párod <b>apró jelzéseit</b> (megjegyzés, kérdés, érintés), és hogy mennyire fordultok egymás felé.'}
];

function evalRules(){
  const fired=[],locked=[];
  RULES.forEach(r=>{
    const avail=r.sig.filter(s=>cur(s.test));
    const hits=avail.filter(s=>{TRACK=[];let h=false;try{h=!!s.fn()}catch(e){}s.used=TRACK;TRACK=null;return h});
    const hitTests=new Set(hits.map(s=>s.test)),availTests=new Set(avail.map(s=>s.test));
    if(hitTests.size>=r.min)fired.push({r,avail,hits,nT:hitTests.size,aT:availTests.size});
    else if(availTests.size<r.min)locked.push(r);
  });
  return {fired,locked};
}

/* Változás iránya skálánként: +1 = magasabb kedvezőbb, -1 = magasabb kedvezőtlenebb, 0 = semleges (alapértelmezett) */
const DIR={ecr:{anx:-1,avd:-1},kotodes:{anxiety:-1,avoidance:-1,earned:1},tas:'-',des:'-',ysq:'-',ips:'-',ders:'-',pedt:'-',maia2:'+',nsss:'+',
  smi:{happy:1,healthy:1,wise:1,vuln:-1,angry:-1,impulsive:-1,compliant:-1,detached:-1,soother:-1,grandiose:-1,bully:-1,punitive:-1,demanding:-1},
  gott:{maps:1,fond:1,turn:1,repair:1,strength:1,crit:-1,cont:-1,def:-1,stone:-1,risk:-1},
  scs:{total:1,SK:1,CH:1,MI:1,SJ:-1,IS:-1,OI:-1},bf:{N:-1},iief:'+'};
function dirOf(id,k){const d=DIR[id];if(!d)return 0;if(d==='+')return 1;if(d==='-')return -1;return d[k]||0;}
return {RULES:RULES,evalRules:evalRules,val:val,avgAll:avgAll,cur:cur,last:last,DIR:DIR,dirOf:dirOf};
};
