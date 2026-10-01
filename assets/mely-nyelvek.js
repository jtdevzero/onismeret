/* Mélyelemzés: nyelvek.html — Szeretetnyelvek, Bocsánatkérési nyelvek, Imágó */
(function(D){

var LOVE = {
  A: { hi: "Az <strong>elismerő szavak</strong> fontosak számodra: a kimondott szeretet, a dicséret, a megerősítés („büszke vagyok rád”, „jó, hogy vagy”) mélyen érint. A bántó szavak ezért nálad különösen erősen hatnak.", mid: "Az elismerő szavak jólesnek, de nem ez az elsődleges csatornád.", lo: "Az elismerő szavak kevésbé fontosak számodra; a szeretetet inkább tettekben, időben vagy érintésben éled meg.", tipHi: "Mondd ki a partnerednek, hogy a szavak neked sokat jelentenek – sokan azt hiszik, a tettek beszélnek helyettük." },
  B: { hi: "A <strong>minőségi idő</strong> a fő csatornád: osztatlan figyelem, közös élmény, beszélgetés telefon nélkül. Ha a másik jelen van, de figyelme máshol jár, az nálad hiányként csapódik le.", mid: "A közös idő fontos, de nem kizárólagos csatorna.", lo: "A közös idő kevésbé központi számodra a szeretet megélésében.", tipHi: "Kérj konkrét, védett közös időt (heti egy este, napi 15 perc beszélgetés), ahelyett hogy általánosságban hiányolnád." },
  C: { hi: "Az <strong>ajándék</strong> nálad a figyelem kézzelfogható jele: nem az értéke számít, hanem az, hogy a másik gondolt rád. Egy elfelejtett évforduló ezért mélyen fájhat.", mid: "Az ajándékok jólesnek, de nem ezek a fő jelek.", lo: "Az ajándékok kevésbé jelentenek számodra szeretetet; más csatornák fontosabbak.", tipHi: "Magyarázd el, hogy nem az ár, hanem a figyelem számít – ez sok félreértést megelőz." },
  D: { hi: "A <strong>szolgálat</strong>, vagyis a tettek a fő csatornád: ha a másik leveszi a terhet a válladról, segít, gondoskodik, az nálad szeretetként érkezik. A kimondott ígéret tett nélkül viszont üresnek hat.", mid: "A segítő tettek fontosak, de más csatornák is ugyanannyit jelentenek.", lo: "A szolgálat kevésbé a szeretet jele számodra.", tipHi: "Mondd ki konkrétan, melyik segítség jelentené a legtöbbet – a másik gyakran nem tudja kitalálni." },
  E: { hi: "A <strong>fizikai érintés</strong> a fő csatornád: ölelés, kézfogás, közelség – ezek nálad közvetlenül biztonságot és szeretetet jelentenek. Az érintés hiánya gyorsan távolságként hat.", mid: "Az érintés fontos, de nem kizárólagos csatorna.", lo: "A fizikai érintés kevésbé központi a szeretet megélésében számodra.", tipHi: "Különítsd el a nem szexuális érintés igényét a szexualitástól; sok párnál ez fontos félreértés forrása." }
};

D.love = {
  cim: "A szeretetnyelveid mélyebben",
  bevezeto: [
    "Chapman modellje szerint az emberek különböző csatornákon <strong>adják és fogadják</strong> a szeretetet: elismerő szavakkal, minőségi idővel, ajándékkal, szolgálattal és fizikai érintéssel. A gyakori probléma nem a szeretet hiánya, hanem a „fordítás”: mindketten szeretnek, de a saját nyelvükön, és a másik ezt nem érzékeli szeretetként.",
    "Fontos tudni, hogy a modell <strong>népszerű, de tudományosan vitatott</strong>: a kutatások nem igazolják, hogy az embereknek egyetlen „elsődleges nyelvük” lenne, vagy hogy a nyelvek egyezése boldogabb kapcsolatot jósolna. Hasznos viszont beszélgetésindítóként: segít kimondani, mitől érzed magad szeretve, és rákérdezni, a másik mitől."
  ],
  skalak: LOVE,
  gyoker: [
    "Hogy mi jelent számodra szeretetet, gyakran a gyerekkorban dől el: vagy abból, amit kaptál (és ezért ismerősként jelzi a szeretetet), vagy abból, ami hiányzott (és ezért különösen éhes vagy rá). Aki gyerekként ritkán hallott elismerést, felnőttként gyakran a szavakra érzékeny; akit ritkán öleltek meg, az érintésre.",
    "A család kultúrája is számít: egyes családokban a szeretet nyelve a gondoskodás és a munka, máshol a beszélgetés vagy a közös program."
  ],
  mindennap: [
    "Párkapcsolatban a leggyakoribb helyzet, hogy mindkét fél a saját nyelvén ad: az egyik takarít, főz, megold (szolgálat), a másik beszélgetést és figyelmet hiányol (minőségi idő). Mindketten úgy érzik, sokat adnak és keveset kapnak.",
    "A konfliktusban is a fő nyelv sérül a legjobban: akinek a szavak fontosak, azt a kritika, akinek az idő, azt a figyelmetlenség bántja a legjobban."
  ],
  lepesek: [
    "<strong>Beszéljétek meg.</strong> Töltse ki a partnered is, és nézzétek meg együtt, hol tér el a két profil.",
    "<strong>Mondd ki konkrétan.</strong> Ne „több figyelmet” kérj, hanem „heti egy este telefon nélkül”.",
    "<strong>Tanuld a másik nyelvét.</strong> Hetente egyszer tudatosan a partnered fő nyelvén fejezd ki a szeretetedet.",
    "<strong>Ne tegyél belőle elvárást.</strong> A nyelvek kiindulópontok, nem követelések: a cél a megértés, nem a pontozás.",
    "<strong>Vedd észre, amit már kapsz.</strong> Gyakran a másik a saját nyelvén már most is ad – csak nem ismered fel."
  ],
  kerdesek: [
    "Mitől érezted magad igazán szeretve gyerekként?",
    "Milyen csatornán adod te a szeretetet – ugyanazon, amelyiken kapni szeretnéd?",
    "Mit adhat a partnered, amit eddig nem vettél észre szeretetként?"
  ]
};

D.apo = {
  cim: "A bocsánatkérési nyelveid mélyebben",
  bevezeto: [
    "Chapman és Thomas modellje szerint egy bocsánatkérés öt elemből állhat: a <strong>sajnálat kifejezéséből</strong> („sajnálom, hogy fájdalmat okoztam”), a <strong>felelősség vállalásából</strong> („hibáztam”), a <strong>jóvátételből</strong> („mit tehetek, hogy rendbe hozzam?”), az <strong>őszinte megbánásból és változtatási szándékból</strong> („nem akarom, hogy ez újra megtörténjen”), és a <strong>bocsánat kéréséből</strong> („megbocsátasz?”).",
    "A profil azt mutatja, melyik elem nélkül <strong>nem érzed hitelesnek</strong> a bocsánatkérést. A kutatások (pl. Lewicki és mtsai.) szerint az elemek közül a felelősségvállalás és a jóvátételi ajánlat különösen erősen hat, de egyéni különbségek valóban vannak – ezért érdemes tudni, neked mi kell, és a partnerednek mi."
  ],
  skalak: {
    R: { hi: "Számodra a <strong>sajnálat kifejezése</strong> alapvető: látnod kell, hogy a másik érzi, mennyire megbántott.", mid: "A sajnálat kifejezése fontos, de önmagában nem elég.", lo: "A sajnálat kifejezése önmagában keveset jelent számodra; inkább tetteket vagy felelősségvállalást vársz." },
    A: { hi: "A <strong>felelősség vállalása</strong> nálad kulcs: a „sajnálom, ha megbántódtál” típusú mondat nem elég, hallanod kell, hogy „hibáztam”.", mid: "A felelősségvállalás fontos, de más elemekkel együtt.", lo: "A felelősség kimondása kevésbé fontos számodra, mint más elemek." },
    M: { hi: "A <strong>jóvátétel</strong> nálad a hitelesség próbája: a szavak után tettet vársz, ami helyrehozza a kárt.", mid: "A jóvátétel jólesik, de nem feltétel.", lo: "A jóvátétel kevésbé fontos számodra; inkább a szavak és a szándék számítanak." },
    P: { hi: "Az <strong>őszinte megbánás és változás</strong> fontos: nem a bocsánatkérés pillanata, hanem az számít, hogy legközelebb másképp legyen.", mid: "A változtatási szándék fontos, de más elemek is számítanak.", lo: "A változtatás ígérete kevésbé központi számodra." },
    F: { hi: "A <strong>bocsánat kérése</strong> fontos: a „megbocsátasz?” kérdés neked azt jelzi, hogy a másik elismeri a döntésed szabadságát.", mid: "A bocsánat kérése jólesik, de nem kulcselem.", lo: "A bocsánat explicit kérése kevésbé fontos számodra." }
  },
  gyoker: [
    "Hogy mi kell neked egy hiteles bocsánatkéréshez, gyakran attól függ, mit tapasztaltál gyerekként: kértek-e tőled bocsánatot a felnőttek, és ha igen, hogyan. Aki sok üres „bocsánat”-ot hallott változás nélkül, gyakran tetteket vagy változást vár. Aki soha nem hallotta, hogy egy felnőtt beismeri a hibáját, annak a felelősségvállalás lehet a legfontosabb.",
    "A személyiség és az értékek is befolyásolják: az igazságérzetre érzékenyebb emberek gyakran a jóvátételt, a kapcsolatorientáltak a sajnálatot és a megbánást tartják fontosnak."
  ],
  mindennap: [
    "Párkapcsolati konfliktusban gyakori, hogy az egyik fél bocsánatot kér, a másik pedig nem érzi hitelesnek – nem azért, mert a bocsánatkérés hazug, hanem mert más nyelven érkezik. Ez újabb sértettséghez vezet („már bocsánatot kértem, mit akarsz még?”).",
    "Érdemes tudni a saját bocsánatkérési stílusodat is: általában azon a nyelven kérünk bocsánatot, amelyiket mi magunk szeretnénk kapni."
  ],
  lepesek: [
    "<strong>Mondd el, mi kell.</strong> Egy nyugodt pillanatban mondd el a partnerednek, mi az, ami nélkül egy bocsánatkérés nem ér el hozzád.",
    "<strong>Kérdezd meg az övét.</strong> Ő mitől érzi hitelesnek? Lehet, hogy egészen mást vár.",
    "<strong>Teljes bocsánatkérés.</strong> Fontos konfliktusban használd mind az öt elemet: sajnálom – hibáztam – mit tehetek – legközelebb másképp – megbocsátasz?",
    "<strong>A „ha” kerülése.</strong> A „sajnálom, ha megbántódtál” szinte mindig rontja a helyzetet; a felelősség áthárítását jelzi.",
    "<strong>A megbocsátás külön folyamat.</strong> A bocsánatkérés után a megbocsátás időt igényelhet – ez nem a bocsánatkérés kudarca."
  ],
  kerdesek: [
    "Kértek-e tőled bocsánatot a szüleid – és hogyan?",
    "Milyen bocsánatkérés után tudtál igazán megbocsátani?",
    "Te hogyan szoktál bocsánatot kérni – és mit hagysz ki belőle?"
  ]
};

D.imago = {
  cim: "Az imágód mélyebben",
  bevezeto: [
    "Az Imágó-elmélet (Harville Hendrix) szerint a párválasztásban egy tudattalan belső kép, az <strong>imágó</strong> vezet: a gyerekkori gondozók pozitív és negatív vonásainak összegzése. Hendrix szerint gyakran olyan partnerhez vonzódunk, aki hasonlít a gondozóinkra – különösen azokban a vonásokban, amelyek fájdalmat okoztak –, mert a tudattalan esélyt keres arra, hogy a régi seb ezúttal begyógyuljon.",
    "Ez megmagyarázza, miért ismétlődnek a párkapcsolati minták, és miért érzi az ember a „kémiát” épp olyan partner mellett, aki a régi fájdalmat is aktiválja. Az elmélet szerint a kapcsolat konfliktusai nem véletlenek: pontosan ott keletkeznek, ahol a gyerekkori szükségletek kielégítetlenek maradtak – és ugyanitt van a gyógyulás lehetősége is. (Az Imágó-elmélet klinikai modell; empirikus alátámasztása korlátozott, de önismereti keretként sokaknak hasznos.)"
  ],
  profil: function(r){
    var x = r.x || {}, out = [];
    var clean = function(a){ return (a || []).map(function(t){ return String(t).split('—')[0].trim(); }).filter(Boolean); };
    var need = clean(x.need), wound = clean(x.wound), neg = clean(x.neg);
    if (need.length) out.push("<strong>A legerősebb kielégítetlen szükségleteid:</strong> " + need.join(', ') + ". Ezek azok, amelyekre a kapcsolataidban a legérzékenyebben reagálsz: ha a partner ezeket adja, mély biztonságot érzel; ha megvonja, a legerősebb fájdalom jelenik meg.");
    if (wound.length) out.push("<strong>A legerősebb gyerekkori sebeid a teszt szerint:</strong> " + wound.join(', ') + ". A párkapcsolati konfliktusok legforróbb pontjai gyakran ezekhez kapcsolódnak.");
    if (neg.length) out.push("<strong>A legmeghatározóbb negatív gondozói vonások:</strong> " + neg.join(', ') + ". Érdemes megnézni, a korábbi partnereidben megjelentek-e ezek a vonások – gyakran éppen ezek mögött érezted a legerősebb vonzalmat.");
    return out;
  },
  gyoker: [
    "Az imágó a gyerekkor első éveiben formálódik, abból, ahogyan a gondozók kielégítették (vagy nem elégítették ki) a gyerek alapvető szükségleteit: a biztonságot, az elfogadást, a meghallgatást, a közelséget, a vezetést. A gyerek megtanulja, mi a szeretet, és milyen a „szeretet hangulata” – akkor is, ha ebbe fájdalom is keveredett.",
    "A felnőtt partnerválasztásban ez a belső kép működik iránytűként: ami ismerős, az vonz. Hendrix szerint ez nem hiba, hanem a psziché gyógyulási kísérlete – a kérdés az, hogy a kapcsolat újra sebez-e, vagy tudatossá válik és gyógyít."
  ],
  mindennap: [
    "Az imágó a konfliktusokban látszik a legjobban: a partner egy apró viselkedése (késés, elhallgatás, kritika) aránytalanul erős reakciót vált ki, mert egy régi sebet érint. Ilyenkor nem csak a partnerre, hanem a régi gondozóra is reagálsz.",
    "A vonzalomban is megjelenik: a „kémia” gyakran éppen azokkal a partnerekkel a legerősebb, akik a gondozók negatív vonásait hordozzák. A biztonságos, de ismeretlen partner mellett ezzel szemben unalom vagy bizonytalanság jelentkezhet."
  ],
  fennmarad: "Mivel az imágó tudattalan, újra és újra hasonló partnereket választunk, és a régi dinamika újrajátszódik. Ha a konfliktusban mindketten védekezünk, a seb nem gyógyul, csak újra felszakad.",
  lepesek: [
    "<strong>Térképezd fel a mintát.</strong> Írd le a korábbi partnereid legfontosabb vonásait, és hasonlítsd össze a gondozóid vonásaival. Mi ismétlődik?",
    "<strong>Imágó-dialógus.</strong> A módszer három lépése: tükrözés („ha jól értem, azt mondod…”), validálás („érthető, hogy így érzed, mert…”), empátia („el tudom képzelni, hogy ez…”). Konfliktusban is használható.",
    "<strong>Kérés vád helyett.</strong> A frusztráció mögött mindig egy kívánság van. „Mindig elkésel” helyett: „azt szeretném, ha szólnál, ha késel”.",
    "<strong>A seb azonosítása konfliktusban.</strong> Kérdezd meg: hány évesnek érzem magam most? Kire emlékeztet ez a helyzet?",
    "<strong>Pár- vagy egyéni terápia.</strong> Az Imágó-párterápia kifejezetten erre épül; egyéni terápiában a gyerekkori sebek feldolgozása segít kevésbé ismételni a mintát."
  ],
  kerdesek: [
    "Miben hasonlítanak a korábbi partnereid a szüleidre?",
    "Melyik az a viselkedés, amire a partnerednél a legerősebben reagálsz – és kire emlékeztet?",
    "Mi az, amit gyerekként a legjobban szerettél volna megkapni?"
  ]
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
