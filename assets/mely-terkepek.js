/* Mélyelemzés: terkepek.html — ECR-R, SMI, TAS-20 */
(function(D){

D.ecr = {
  jo: "lo",
  cim: "A kötődési mintád mélyebben",
  bevezeto: [
    "Az ECR-R két, egymástól független dimenzión méri a felnőttkori kötődést. A <strong>kötődési szorongás</strong> azt mutatja, mennyire figyel a rendszered arra, hogy a partnered elérhető-e, szeret-e, nem hagy-e el. A <strong>kötődési elkerülés</strong> azt, mennyire kényelmetlen számodra a közelség, a függés és az érzelmi megnyílás. A két dimenzió kombinációja adja a négy ismert mintát: biztonságos, szorongó (aggodalmaskodó), elkerülő (elutasító) és rettegő (dezorganizált).",
    "A kötődési minta <strong>nem személyiségjegy és nem ítélet</strong>, hanem egy korán megtanult stratégia arra, hogyan maradj kapcsolatban azokkal, akiktől függsz. Mindkét dimenzió a gyerekkori tapasztalatokból indul, de a felnőttkori kapcsolatok formálják tovább – ezért változtatható. A kutatások szerint egy biztonságos partner, egy jó terápiás kapcsolat vagy a saját minta tudatos megértése mérhetően elmozdíthatja a pontszámokat („szerzett biztonság”)."
  ],
  profil: function(r){
    var a = r.d.anx && r.d.anx[1], v = r.d.avd && r.d.avd[1];
    if (typeof a !== 'number' || typeof v !== 'number') return [];
    var A = a >= 4, V = v >= 4;
    if (!A && !V) return ["<strong>A kombinációd a biztonságos minta felé mutat:</strong> a közelség nem fenyeget, és a távolság sem indít riadót. Ilyenkor a konfliktus nem a kapcsolat végét jelenti, és könnyebb kérni, adni, kibírni a bizonytalanságot. Ez nem azt jelenti, hogy soha nem aktiválódik a szorongás vagy az elkerülés: erős stresszben, veszteség után vagy egy nagyon szorongó/elkerülő partner mellett a biztonságos ember is elmozdulhat. Érdemes figyelni, mely helyzetekben."];
    if (A && !V) return ["<strong>A kombinációd a szorongó (aggodalmaskodó) minta felé mutat:</strong> vágysz a közelségre, és könnyen meg is nyílsz, de a rendszered folyamatosan figyeli a jeleket, hogy a másik nem távolodik-e. Ha bizonytalanság jön (késik a válasz, hűvösebb a hang), felerősödnek a <strong>kötődési jelzések</strong>: több üzenet, megnyugtatás-kérés, féltékenység, vádaskodás, vagy épp sértett visszahúzódás, hogy a másik utánad jöjjön. A cél nem a vágy elfojtása, hanem az, hogy a riadót megnyugtatni tanuld meg belülről is, és közvetlenül kérd, amire szükséged van."];
    if (!A && V) return ["<strong>A kombinációd az elkerülő (elutasító) minta felé mutat:</strong> az önállóság biztonságot ad, a közelség és a függés viszont feszültséget kelt, különösen ha a másik érzelmi igényekkel érkezik. Jellegzetes a <strong>deaktiválás</strong>: távolságtartás, a partner hibáinak felnagyítása, a „nincs szükségem senkire” hozzáállás, a sebezhetőség kerülése. Belül ez gyakran nem közöny, hanem egy régi tanulság: a szükségleteim úgysem kapnak választ, jobb nem is érezni őket."];
    return ["<strong>A kombinációd a rettegő (dezorganizált) minta felé mutat:</strong> egyszerre vágysz a közelségre és félsz tőle. Ez a legfeszültebb együttállás, mert a két stratégia ütközik: közeledsz, aztán megijedsz és eltávolodsz; a másik visszahúzódása pánikot, a közeledése fulladást okozhat. A kapcsolat ezért gyakran hullámzó, intenzív és kimerítő. Ez a minta általában ijesztő vagy kiszámíthatatlan korai kapcsolatokból ered, ahol ugyanaz az ember volt a biztonság forrása és a félelemé – ezért itt különösen sokat ad a biztonságos terápiás kapcsolat."];
  },
  skalak: {
    anx: {
      norma: { m: 3.56, sd: 1.12, src: "Fraley online mintája, n > 17 000, 73% nő" },
      hi: "Erős a kötődési riasztórendszered. A partner elérhetőségének jeleit sokszor felnagyítva érzékeled, a bizonytalanságot nehezen viseled, és a kapcsolat könnyen a gondolataid középpontjába kerül. Ez gyakran a legintenzívebb érzelmeket hozza – a vonzalmat és a fájdalmat is.",
      mid: "A kötődési szorongásod közepes: nyugodt időszakokban kevésbé, stresszben, távolság vagy konfliktus idején jobban aktiválódik. Érdemes megfigyelni, milyen helyzetek kapcsolják be.",
      lo: "Kevés a kötődési szorongásod: nem kell folyamatosan ellenőrizned, hogy a másik szeret-e, és a távolságot vagy egy konfliktust nem éled meg a kapcsolat végének.",
      tipHi: "Amikor bekapcsol a riadó (olvasatlan üzenet, hűvösebb hang), nevezd meg: „ez a kötődési szorongásom”. Várj 20 percet mielőtt írsz, és közben szabályozd magad testileg (légzés, mozgás). A „ha szeretne, írna” helyett kérj közvetlenül: „jól esne, ha este jelentkeznél”."
    },
    avd: {
      norma: { m: 2.92, sd: 1.19, src: "Fraley online mintája, n > 17 000, 73% nő" },
      hi: "Erős a kötődési elkerülés: a közelség, a függés és az érzelmi megnyílás feszültséget kelt. Könnyebb egyedül megoldani a dolgokat, és a partner érzelmi igényei tehernek tűnhetnek. Belül ez gyakran védekezés egy régi csalódás ellen.",
      mid: "Az elkerülésed közepes: bizonyos témákban, helyzetekben (sebezhetőség, nagy elköteleződés, konfliktus) visszahúzódsz, máskor tudsz közel maradni.",
      lo: "Kényelmes számodra a közelség: meg tudsz nyílni, tudsz támaszkodni a másikra, és a függés nem fenyegeti az önállóságodat.",
      tipHi: "Figyeld meg a deaktiváló jeleket: amikor a közelség után hirtelen hibákat kezdesz látni a másikban, vagy teret akarsz. Ilyenkor mondd ki, ahelyett hogy eltűnnél: „most kell egy kis idő, de visszajövök hozzád”. Gyakorolj apró sebezhetőséget: egy érzés, egy kérés naponta."
    }
  },
  gyoker: [
    "A kötődési rendszer az első életévekben formálódik, abban, ahogyan a gondozók a gyerek jelzéseire válaszoltak. Ha a válasz <strong>kiszámíthatatlan</strong> volt (hol meleg, hol elérhetetlen), a gyerek megtanulja felerősíteni a jelzéseit, hogy biztosan meghallják – ebből lesz a szorongó stratégia. Ha a válasz <strong>következetesen elutasító</strong> volt (az igényeket bosszantónak tartották, a sírást leállították), a gyerek megtanulja elnémítani a jelzéseit – ebből lesz az elkerülő stratégia. Ha a gondozó maga volt <strong>ijesztő</strong> vagy traumatizált, a gyereknek nincs működő stratégiája: ebből lesz a dezorganizált minta.",
    "A felnőttkori párkapcsolatok tovább formálják a mintát. Egy hűtlenség, egy fájdalmas szakítás, egy kiszámíthatatlan partner felerősítheti a szorongást; egy elnyelő, kontrolláló kapcsolat az elkerülést. És fordítva: egy tartósan biztonságos kapcsolat lassan átírja a belső várakozásokat."
  ],
  mindennap: [
    "A kötődési minta leginkább <strong>stresszben</strong> látszik: konfliktusban, távolságban, betegségben, nagy döntés előtt. Jellegzetes a szorongó–elkerülő csapda: a szorongó fél közeledik és jelzést kér, az elkerülő ettől szorul és távolodik, ami a szorongót még inkább közeledésre készteti – a kör magától erősödik, és mindkét fél a másikat látja hibásnak.",
    "A minta a vonzalmat is befolyásolja. Az ismerős dinamika gyakran „kémiának” érződik: a szorongó embert sokszor az elérhetetlen partner vonzza, az elkerülőt pedig az, aki keveset kér. A biztonságos partner eleinte „langyosnak” tűnhet – miközben éppen ő adhatja meg a korrigáló tapasztalatot. A minta nemcsak a párkapcsolatban, hanem barátságokban, a munkahelyi vezetőkkel és a terapeutával is megjelenhet."
  ],
  fennmarad: "A kötődési stratégiák önbeteljesítők: a szorongó kapaszkodás valóban eltávolíthatja a partnert, az elkerülő távolságtartás valóban elmagányosít, és mindkettő azt „bizonyítja”, hogy a régi várakozás igaz volt. Ráadásul a mintánknak megfelelő partnereket választjuk, akikkel a régi dinamika újrajátszódik.",
  lepesek: [
    "<strong>Ismerd fel a saját ciklusodat.</strong> Írd le egy tipikus konfliktusod lépéseit: mi indítja, mit érzel, mit csinálsz, mit csinál a másik, és erre mit reagálsz. A ciklus meglátása már enyhíti.",
    "<strong>Beszéljetek a mintáról, ne egymásról.</strong> „Ilyenkor bekapcsol a szorongásom, és ezért írok sokat” – ez a mondat kiveszi a vádat a helyzetből, és közös ellenséggé teszi a ciklust.",
    "<strong>Biztonságos partner, biztonságos barátok.</strong> A szerzett biztonság leggyakrabban egy olyan kapcsolatban születik, ahol a megszokott félelmed nem igazolódik be. Ha ilyen ember van az életedben, tudatosan figyeld meg, mi történik benned mellette.",
    "<strong>Önszabályozás a kapcsolaton kívül is.</strong> Légzés, mozgás, napló, barátok – minél több forrásból tudod megnyugtatni a rendszeredet, annál kevésbé lesz a partner az egyetlen szabályozód.",
    "<strong>Párterápia vagy egyéni terápia.</strong> Az érzelemfókuszú párterápia (EFT) kifejezetten a kötődési ciklusra épül; dezorganizált mintánál az egyéni, traumatudatos munka sokat segít."
  ],
  kerdesek: [
    "Kihez fordultál gyerekként, ha féltél vagy szomorú voltál – és mi történt ilyenkor?",
    "Mi a legelső jel, amiből megérzed, hogy a kapcsolatban „baj van”?",
    "Ki volt az a partnered, aki mellett a legnagyobb biztonságban érezted magad – és vonzott-e?"
  ]
};

D.smi = {
  cim: "A belső szereplőid: sémamódok",
  bevezeto: [
    "A sémamódok azok az <strong>érzelmi állapotok, belső „részek”</strong>, amelyek egy adott pillanatban átveszik az irányítást. Míg a sémák (YSQ) a mélyben lévő, tartós mintázatok, a módok azt mutatják, <strong>mi történik veled most</strong>, amikor egy séma bekapcsol: ki „ül a volánnál”. Négy családjuk van: a <strong>gyermekmódok</strong> (sérült vagy egészséges érzelmek), a <strong>megküzdő módok</strong> (hogyan védekezel), a <strong>belső szülő módok</strong> (a kritikus, követelő hang) és az <strong>egészséges felnőtt</strong>, aki mindezt összefogja.",
    "A profil lényege nem az egyes számokban, hanem az <strong>egyensúlyban</strong> van: mennyire erősek a sérült gyermekmódok és a belső kritikus, és mennyire erős az egészséges felnőtt, aki meg tudja vigasztalni az egyiket és megfékezni a másikat. A sématerápia célja nem a módok „kiirtása”, hanem az, hogy az egészséges felnőtt legyen a legtöbbször a volánnál."
  ],
  profil: function(r, lv){
    var out = [], d = r.d;
    var g = function(k){ return d[k] ? d[k][1] : null; };
    var child = Math.max(g('vuln') || 0, g('angry') || 0, g('impulsive') || 0);
    var parent = Math.max(g('punitive') || 0, g('demanding') || 0);
    var adult = g('healthy');
    if (adult !== null && adult >= child && adult >= parent) out.push("<strong>Az egészséges felnőtt módod erősebb, mint a sérült gyermek- és a kritikus szülőmódjaid.</strong> Ez jó kiindulópont: nehéz pillanatokban van benned egy rész, amely meg tudja tartani a helyzetet. A munka itt arról szól, hogy ezt a részt még gyorsabban és tudatosabban hívd elő, amikor egy séma bekapcsol.");
    else if (adult !== null) out.push("<strong>A sérült gyermek- vagy a kritikus szülőmódjaid legalább olyan erősek, mint az egészséges felnőtt.</strong> Ez azt jelenti, hogy nehéz helyzetekben könnyen elragadnak az érzelmek vagy a belső kritikus hangja, és kevés belső erő marad a megnyugtatásra és a józan döntésre. Ez a sématerápia legjellemzőbb kiindulópontja – és pontosan ez az, amin a terápia dolgozik.");
    if (lv.vuln === 'hi' && lv.punitive === 'hi') out.push("A <strong>Sebezhető gyermek és a Büntető szülő</strong> együttes magas értéke klasszikus, fájdalmas páros: a belső kritikus azt a részt bünteti, amelyik amúgy is sérült. A legfontosabb lépés itt a kritikus hang megfékezése, és helyette a vigasztalás megtanulása.");
    if (lv.detached === 'hi' || lv.soother === 'hi') out.push("Erős nálad az <strong>elszakadó vagy öncsillapító védekezés</strong>: amikor az érzések túl nagyok, kikapcsolsz, elterelsz (munka, képernyő, evés, ingerek). Ez rövid távon véd, hosszú távon viszont elzár az érzelmeidtől és a kapcsolódástól.");
    return out;
  },
  skalak: {
    vuln: { jo: "lo", hi: "Gyakran kerülsz a <strong>Sebezhető gyermek</strong> állapotába: magány, szomorúság, félelem, tehetetlenség, elhagyatottság-érzés. Ez a rész azt hordozza, ami gyerekként nem kapott választ, és ma is vigasztalásra vár.", mid: "A Sebezhető gyermek időnként megjelenik, főleg veszteség, elutasítás vagy magány idején.", lo: "Ritkán érzed magad tehetetlenül sérülékenynek; a nehéz érzések nem söpörnek el.", tipHi: "Amikor ez a rész jelentkezik, ne terelj el azonnal. Kérdezd meg: hány évesnek érzem most magam, és mire lenne szüksége ennek a gyereknek? Mondd ki neki felnőttként, amit akkor senki nem mondott." },
    angry: { jo: "lo", hi: "Erős a <strong>Dühös gyermek</strong>: ha a szükségleteid nem teljesülnek, gyorsan feltámad a düh, a sértettség, a „ez igazságtalan” érzés. A düh jogos jelzés, de a kifejezése sokszor ellened dolgozik.", mid: "A düh időnként erősen jelentkezik, főleg ha igazságtalanságot vagy elhanyagolást érzel.", lo: "A Dühös gyermek ritkán veszi át az irányítást. Érdemes megnézni, hogy ez nyugalom vagy a düh elfojtása." , tipHi: "A düh mögött szinte mindig egy kielégítetlen szükséglet van. Mielőtt kifejezed, kérdezd meg: mire van most szükségem? Azt mondd ki, ne a vádat." },
    impulsive: { jo: "lo", hi: "Erős az <strong>Impulzív/fegyelmezetlen gyermek</strong>: a pillanatnyi vágy vagy kellemetlenség könnyen felülírja a hosszú távú szándékot (evés, költés, halogatás, szavak).", mid: "Időnként az impulzus győz, főleg fáradtan vagy feszültségben.", lo: "Jól tudod késleltetni a vágyaidat. Ha nagyon alacsony, érdemes megnézni, marad-e hely a spontaneitásnak.", tipHi: "Iktass be késleltetést: 10 perc a késztetés és a tett között. Építs külső struktúrát ahelyett, hogy akaraterőre építenél." },
    happy: { jo: "hi", hi: "Erős a <strong>Boldog gyermek</strong>: gyakran éled meg a játékosságot, a kíváncsiságot, a kapcsolódás örömét. Ez a legfontosabb erőforrásod.", mid: "A Boldog gyermek jelen van, de nem mindig fér hozzá: stresszben könnyen háttérbe szorul.", lo: "Ritkán éled meg a gondtalan örömöt és a biztonságot. Ez gyakran nem hiány benned, hanem jel arra, hogy a többi mód elfoglalja a helyét.", tipLo: "Tervezz be hetente valamit, ami öncélú öröm: játék, mozgás, zene, természet, olyan emberek, akik mellett nevetsz. A Boldog gyermek gyakorlással erősödik." },
    compliant: { jo: "lo", hi: "Erős az <strong>Alávető (behódoló)</strong> mód: a konfliktus elkerülésére alkalmazkodsz, nem mondasz nemet, a saját igényeidet háttérbe szorítod.", mid: "Bizonyos kapcsolatokban vagy helyzetekben alkalmazkodsz a saját károdra.", lo: "Ritkán adod fel a saját igényeidet mások kedvéért.", tipHi: "Mondj nemet apró, alacsony tétű dolgokra, és figyeld meg a következményt. Gyakran sokkal enyhébb, mint amitől a mód fél." },
    detached: { jo: "lo", hi: "Erős az <strong>Elszakadó védő</strong>: nehéz helyzetben kikapcsolsz, üresnek, tompának érzed magad, távol tartod az érzéseket és az embereket.", mid: "Időnként kikapcsolsz, ha túl sok az érzelem.", lo: "Ritkán zárkózol el az érzéseid elől.", tipHi: "A kikapcsolást ne erővel törd át, hanem lassan: nevezz meg egy testi érzést, egy érzelmet. Biztonságos kapcsolatban gyakorold, hogy érzelemmel jelen maradsz." },
    soother: { jo: "lo", hi: "Erős az <strong>Elterelő öncsillapító</strong>: munkával, képernyővel, evéssel, ingerekkel, szerekkel nyugtatod magad, hogy ne érezd a fájdalmat.", mid: "Időnként elterelsz, ha valami túl nehéz.", lo: "Ritkán használsz elterelést a nehéz érzések ellen.", tipHi: "Figyeld meg, mi előzi meg az elterelést: melyik érzés elől menekülsz? Keress olyan megnyugtatást, ami nem kapcsol ki: beszélgetés, séta, légzés, írás." },
    grandiose: { jo: "lo", hi: "Erős a <strong>Túlkompenzáló önfelfújó</strong>: a sérülékenység ellen fölénnyel, kontrollal, versengéssel, különlegességgel védekezel.", mid: "Bizonyos helyzetekben (kritika, kudarc) fölénnyel védekezel.", lo: "Ritkán védekezel fölénnyel; nem kell bizonyítanod a különlegességedet.", tipHi: "Amikor a fölény jelentkezik, kérdezd meg: mi az a sérülékeny érzés, amit most nem akarok érezni? A fölény a páncél, nem a lényeg." },
    bully: { jo: "lo", hi: "Erős a <strong>Támadó</strong> mód: ha fenyegetve érzed magad, támadással, dominanciával, mások lekicsinylésével védekezel. Ez rövid távon véd, de kapcsolatokat rombol.", mid: "Feszült helyzetekben időnként támadásba lendülsz.", lo: "Ritkán védekezel támadással.", tipHi: "Ismerd fel a jeleket a testedben, mielőtt a támadás kitör. Lépj ki a helyzetből, és térj vissza, ha a sérülés mögötti érzést meg tudod nevezni." },
    punitive: { jo: "lo", hi: "Erős a <strong>Büntető szülő</strong>: kemény, megvető belső hang, ami a hibáidért büntet, szégyenít, olykor gyűlöletet is kelt magad iránt. Ez a hang a régi kritikusok visszhangja.", mid: "A belső kritikus időnként keményen szól, főleg hibák után.", lo: "A belső hangod nem büntető. Ez nagy erőforrás.", tipHi: "Írd le szó szerint, mit mond a büntető hang, és kérdezd meg: kinek a hangja ez? Válaszolj neki az egészséges felnőtt hangján: határozottan, nem alkudozva. A sématerápiában ennek a módnak a megfékezése központi cél." },
    demanding: { jo: "lo", hi: "Erős a <strong>Követelő szülő</strong>: magas mércék, folyamatos hajtás, „még nem elég” érzés. Nem feltétlenül büntet, de nem engedi a pihenést és az elégedettséget.", mid: "A belső követelő hang időnként erősen hajt.", lo: "Nem hajt túlzott belső követelés.", tipHi: "Tárgyalj vele: mi a reális mérce ebben a helyzetben? Ütemezz be pihenést úgy, mint egy kötelező feladatot, és figyeld, mi történik benned." },
    healthy: { jo: "hi", hi: "Erős az <strong>Egészséges felnőtt</strong>: tudsz józanul dönteni, gondoskodni magadról, határokat húzni, és megtartani a nehéz érzéseket. Ez a legfontosabb belső erőforrásod.", mid: "Az Egészséges felnőtt jelen van, de nehéz helyzetekben könnyen háttérbe szorul.", lo: "Az Egészséges felnőtt még kevés teret kap. Ez nem hiány, hanem fejleszthető képesség – a sématerápia elsődleges célja ennek erősítése.", tipLo: "Készíts magadnak „egészséges felnőtt kártyát”: mit mondana egy bölcs, gondoskodó felnőtt, amikor a sebezhető részed szenved vagy a kritikus hang támad? Olvasd fel, amikor kell." },
    wise: { jo: "hi", hi: "Erős a <strong>Bölcs felnőtt</strong>: tágabb perspektívából látod a helyzeteket, és együttérzéssel tudsz viszonyulni magadhoz és másokhoz.", mid: "A bölcs, tágabb látásmód időnként elérhető.", lo: "A tágabb, bölcs nézőpont nehezen elérhető, főleg stresszben.", tipLo: "Nehéz helyzetben kérdezd meg: mit mondanék erről öt év múlva? Mit tanácsolnék egy barátomnak?" }
  },
  gyoker: [
    "A módok a gyerekkori tapasztalatokból születnek. A <strong>sérült gyermekmódok</strong> azokat az érzelmeket hordozzák, amelyek nem kaptak választ (félelem, magány, düh). A <strong>szülő módok</strong> a gondozók kritikus, büntető vagy követelő hangjának belsővé vált változatai. A <strong>megküzdő módok</strong> a túlélési stratégiák: behódolás, elszakadás, elterelés, túlkompenzálás – akkor ezek védtek.",
    "Az <strong>egészséges felnőtt</strong> abból nő ki, amit a gyerek a gondozóitól látott és kapott: megnyugtatást, határokat, józan döntéseket. Ahol ez hiányzott, ott a felnőtt rész később, tudatos munkával építhető fel – terápiában a terapeuta egy ideig „kölcsönadja” ezt a funkciót, amíg belsővé nem válik."
  ],
  mindennap: [
    "A módváltások gyorsak: egy kritikus megjegyzés a munkahelyen a Sebezhető gyermeket aktiválja, amit azonnal követhet a Büntető szülő („persze, mert béna vagy”), majd az Elterelő öncsillapító (este evés, sorozat). Kívülről ebből csak a viselkedés látszik – belül egy egész szereposztás zajlik.",
    "Párkapcsolatban gyakran a két fél módjai kapcsolódnak egymásba: az egyik Dühös gyermeke a másik Elszakadó védőjét hívja elő, ami az elsőt még dühösebbé teszi. Ha meg tudjátok nevezni, „melyik részed” beszél, a konfliktus sokkal kezelhetőbbé válik."
  ],
  fennmarad: "A megküzdő módok rövid távon csökkentik a fájdalmat, ezért megerősítődnek, de közben megakadályozzák, hogy a sebezhető rész valódi választ kapjon. A belső kritikus pedig minden hibát bizonyítéknak használ.",
  lepesek: [
    "<strong>Nevezd meg a módokat.</strong> Adj saját nevet a fő módjaidnak („a kis Józsi”, „a bíró”, „a pajzs”). Napi egyszer kérdezd meg: ki volt ma a volánnál?",
    "<strong>Módnapló.</strong> Egy nehéz helyzet után írd le: mi indította, melyik mód jelent meg, mit érzett, mit csinált, és mit tett volna az egészséges felnőtt.",
    "<strong>A kritikus megfékezése.</strong> A büntető és követelő hangnak ne igazat adj és ne vitatkozz vele végtelenül: határozottan állítsd le, mint egy bántalmazót.",
    "<strong>A sebezhető rész vigasztalása.</strong> Képzeld el a gyerekkori önmagadat, és mondd neki, amire szüksége van. Elsőre idegennek tűnhet; ez a leggyorsabban ható gyakorlat.",
    "<strong>Sématerápia.</strong> A székmunka és a képzeleti átírás kifejezetten a módokkal dolgozik, és erős gyermek- vagy szülőmódoknál a leghatékonyabb módszer."
  ],
  kerdesek: [
    "Melyik módodban töltöd a legtöbb időt egy átlagos nehéz napon?",
    "Kinek a hangja szólal meg benned, amikor hibázol?",
    "Mikor érezted utoljára, hogy az egészséges felnőtt van a volánnál – és mi segítette?"
  ]
};

D.tas = {
  jo: "lo",
  cim: "Az érzelmi szótárad mélyebben",
  bevezeto: [
    "A TAS-20 az <strong>alexitímiát</strong> méri: azt, mennyire nehéz felismerni, megkülönböztetni és szavakba önteni az érzelmeket. Szó szerint „szavak nélküli érzelmek”. Nem azt jelenti, hogy valaki nem érez – sokszor nagyon is sokat érez, csak nem tudja, mit. Az érzés gyakran testi feszültségként, nyugtalanságként, fáradtságként, vagy „valami nem stimmel” élményként jelenik meg.",
    "Három része van: az <strong>érzelmek azonosításának nehézsége</strong> (mit érzek most?), az <strong>érzelmek leírásának nehézsége</strong> (hogyan mondom el?) és a <strong>kifelé irányuló gondolkodás</strong> (a figyelem a külső, gyakorlati dolgokon van, a belső világ kevésbé érdekes). Az alexitímia nem betegség, hanem egy vonás, amely tanulással fejleszthető – és nagyon sok más nehézség (szorongás, evés, testi tünetek, párkapcsolati elakadás) mögött ott van."
  ],
  skalak: {
    total: { cut: [51, 61], hi: "Az összpontszámod a kutatásokban használt alexitímia-küszöb (61) körül vagy felett van. Ez azt jelzi, hogy az érzelmi szótárad jelentősen korlátozott: az érzések gyakran testi feszültségként vagy általános rossz közérzetként jelentkeznek, és nehéz eljutni a pontos névig.", mid: "Az összpontszámod a „lehetséges alexitímia” tartományban van (52–60): bizonyos érzelmeket, főleg a bonyolultabbakat vagy erősebbeket nehéz azonosítani és kimondani.", lo: "Az összpontszámod nem utal alexitímiára: általában fel tudod ismerni és ki tudod fejezni, mit érzel." },
    DIF: { hi: "Nehéz <strong>azonosítani</strong>, mit érzel: gyakran csak annyit tudsz, hogy „rossz” vagy „feszült vagyok”, vagy az érzelmet testi tünetként éled meg (gyomor, mellkas, fejfájás). Ez a leginkább terhelő része az alexitímiának, mert a nem azonosított érzelmet nehéz szabályozni.", mid: "Időnként nehéz eligazodni az érzéseiden, főleg erős vagy kevert érzelmeknél.", lo: "Általában tudod, mit érzel, és meg tudod különböztetni az érzelmeket a testi állapotoktól.", tipHi: "Napi 3 érzelmi check-in: mit érzek, hol a testemben, mekkora (1–10)? Használj érzelemkereket; a „rossz” helyett keress pontosabb szót." },
    DDF: { hi: "Nehéz <strong>szavakba önteni</strong> az érzéseidet mások felé. Ez a kapcsolatokban gyakran félreértéshez vezet: a partner nem tudja, mi zajlik benned, és távolinak vagy hidegnek érezhet.", mid: "Bizonyos érzelmeket vagy bizonyos emberek felé nehezebb kimondani, mit érzel.", lo: "Jól ki tudod fejezni az érzéseidet szavakkal.", tipHi: "Gyakorold írásban először: napló, üzenet, amit nem küldesz el. Utána egy biztonságos emberrel egy mondatban: „most … érzek, mert …”." },
    EOT: { hi: "Erős a <strong>kifelé irányuló gondolkodás</strong>: a figyelmed főleg a gyakorlati, külső dolgokon van, a belső élmények elemzése kevésbé érdekel vagy idegen. Ez a munkában erősség lehet, a kapcsolatokban viszont felszínessé teheti a kommunikációt.", mid: "A gondolkodásod vegyes: néha befelé is figyelsz, de a gyakorlati fókusz erős.", lo: "Kíváncsi vagy a belső világodra, szívesen gondolkodsz az érzéseiden és a motivációidon.", tipHi: "Egy héten át, minden este egy kérdés: mi volt ma a legerősebb érzésem, és miért? A belső kíváncsiság gyakorlással nő." }
  },
  gyoker: [
    "Az érzelmi szótár a kisgyermekkorban tanulódik meg, abban, ahogyan a gondozók <strong>tükrözik</strong> a gyerek állapotát: „látom, mérges vagy, mert elvették a játékodat”. Ahol ez a tükrözés hiányzott – mert a szülők maguk sem beszéltek érzelmekről, mert az érzéseket leállították („ne sírj”), vagy mert a családban túlélés volt a fő téma –, ott a gyerek nem kapott szavakat a belső állapotaihoz.",
    "Szerepet játszhat a trauma is: ha egy érzelem túl fájdalmas volt, a rendszer megtanulhatta tompítani. Biológiai és neurológiai tényezők is hozzájárulnak (pl. autizmus spektrum, egyes neurológiai állapotok), és a nemi szerepek is: a fiúk gyakran kevesebb érzelmi szót tanulnak."
  ],
  mindennap: [
    "Az alexitímia gyakran testi tünetekben jelenik meg (feszültség, fáradtság, emésztési panaszok, fejfájás), mert az érzelem a testben marad. Gyakori a <strong>külső szabályozás</strong>: evés, munka, mozgás, képernyő, szerek, amelyekkel a nevenincs feszültséget csillapítod.",
    "A kapcsolatokban a partner gyakran hiányolja az érzelmi elérhetőséget, te pedig nem érted, mit vár. Konfliktusban könnyen racionális érvekkel válaszolsz egy érzelmi kérdésre, ami a másikat még jobban frusztrálja."
  ],
  fennmarad: "Mivel a nem azonosított érzelmet nehéz kimondani, ritkán kapsz rá választ, így nincs alkalom gyakorolni. A külső szabályozó viselkedések rövid távon megoldják a feszültséget, ezért nem keletkezik igény a belső szótár fejlesztésére.",
  lepesek: [
    "<strong>Érzelemkerék.</strong> Tedd ki a telefonod háttérképeként vagy a hűtőre. Naponta többször válassz egy szót.",
    "<strong>Test → érzelem.</strong> Ha testi feszültséget érzel, kérdezd meg: ha ennek a feszültségnek szava lenne, mi lenne? Félelem, düh, szomorúság, szégyen?",
    "<strong>Utólagos elemzés.</strong> Egy erős reakció után írd le: mi történt, mit éreztem a testemben, mit gondoltam, mit csináltam. Az érzelem nevét gyakran utólag könnyebb megtalálni.",
    "<strong>Kreatív kifejezés.</strong> Zene, mozgás, rajz – olyan csatornák, ahol az érzelem szavak nélkül is kifejeződhet, és onnan könnyebb eljutni a szóig.",
    "<strong>Terápia.</strong> Az érzelemfókuszú és a mentalizáció-alapú terápiák kifejezetten az érzelmi szótár fejlesztésére épülnek."
  ],
  kerdesek: [
    "Hogyan beszéltek a családodban az érzésekről – ha beszéltek?",
    "Milyen testi jelből veszed észre leggyakrabban, hogy valami nincs rendben?",
    "Melyik érzelmet a legnehezebb felismerned vagy kimondanod?"
  ]
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
