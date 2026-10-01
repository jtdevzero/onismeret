/* Mélyelemzés: szabalyozas.html — IPS, DERS-SF, SCS-SF, TFEQ-R18 */
(function(D){

D.ips = {
  jo: "lo",
  cim: "A halogatásod mélyebben",
  bevezeto: [
    "A halogatás nem időbeosztási probléma, hanem elsősorban <strong>érzelemszabályozási</strong> probléma. A kutatások (Sirois, Pychyl, Steel) szerint akkor halogatunk, amikor egy feladat kellemetlen érzést kelt – unalmat, szorongást, bizonytalanságot, kudarcfélelmet, ellenállást –, és a halogatás azonnal megszünteti ezt az érzést. Rövid távon ez működik, ezért a rendszer megtanulja; hosszú távon viszont stresszt, bűntudatot és rosszabb eredményt hoz.",
    "Steel ideiglenes motivációelmélete szerint a motiváció akkor gyenge, ha alacsony a <strong>sikerbe vetett hit</strong>, alacsony a feladat <strong>értéke</strong> számodra, magas az <strong>impulzivitás</strong> (könnyen eltérít egy azonnali jutalom), és <strong>messze van a jutalom</strong>. Ebből négy beavatkozási pont adódik, amelyeken lent végigmegyünk."
  ],
  skalak: {
    total: { cut: [18, 28], hi: "Az eredményed erős vagy nagyon erős halogatást jelez: rendszeresen elhalasztod a feladatokat annak ellenére, hogy tudod, rosszabbul jársz vele, és ez a jóllétedre vagy a teljesítményedre is hat. Ez gyakran nem lustaság, hanem egy túlterhelt érzelemszabályozó rendszer, sokszor ADHD-s vagy szorongásos háttérrel.", mid: "Mérsékelt halogatás: bizonyos típusú feladatoknál (kellemetlen, bizonytalan, unalmas) rendszeresen halogatsz, másoknál nem.", lo: "Alacsony halogatás: általában időben nekikezdesz a feladatoknak, és a halogatás nem okoz jelentős problémát.", tipHi: "Ne a teljes feladatot tűzd ki célul, hanem az első 5 percet. A kezdés a legnehezebb pont; utána a motiváció gyakran megjön." }
  },
  gyoker: [
    "A halogatásnak több gyökere lehet. Az egyik az <strong>alacsony frusztrációs tolerancia</strong>, amelyet a struktúra nélküli vagy épp túlzottan kontrollált gyerekkor egyaránt okozhat. A másik a <strong>perfekcionizmus és a kudarcfélelem</strong>: ha a hibát szégyen követte, a feladat elkerülése biztonságosabbnak tűnik. A harmadik a neurológiai háttér: az ADHD-ban a jutalmazási rendszer másképp működik, és a távoli jutalom kevésbé motivál.",
    "A sémák közül a Kudarc, a Könyörtelen Mércék és az Elégtelen Önkontroll függ össze a legerősebben a halogatással."
  ],
  mindennap: [
    "A halogatás jellegzetes ciklusa: kellemetlen feladat → kellemetlen érzés → elterelés (telefon, apró, könnyű teendők, takarítás) → átmeneti megkönnyebbülés → bűntudat és stressz a határidő közeledtével → hajrá vagy csúszás → önvád → a következő feladat még kellemetlenebb.",
    "A halogatás gyakran a fontos, de nem sürgős dolgokat érinti a legjobban: egészség, kapcsolatok, saját projektek, hosszú távú célok."
  ],
  fennmarad: "A halogatás rövid távon csökkenti a kellemetlen érzést, ezért megerősítődik. Az utána jövő önvád pedig még kellemetlenebbé teszi a feladatot, ami a következő halogatást táplálja.",
  lepesek: [
    "<strong>Elvárás (sikerbe vetett hit):</strong> bontsd a feladatot olyan kicsi lépésekre, hogy az első biztosan sikerüljön.",
    "<strong>Érték:</strong> kösd össze a feladatot valamivel, ami fontos számodra, vagy párosítsd egy kellemes dologgal (temptation bundling: kedvenc podcast csak edzés közben).",
    "<strong>Impulzivitás:</strong> távolítsd el fizikailag a zavaró ingereket (telefon másik szobában, blokkoló alkalmazások).",
    "<strong>Késleltetés:</strong> teremts közeli, külső határidőket és elszámoltathatóságot (közös munka, „body doubling”, nyilvános vállalás).",
    "<strong>Önegyüttérzés önvád helyett.</strong> A kutatások szerint aki megbocsát magának a halogatásért, az legközelebb kevésbé halogat (Wohl és mtsai., 2010)."
  ],
  kerdesek: [
    "Milyen érzés jelenik meg közvetlenül azelőtt, hogy elkezdenéd halogatni a feladatot?",
    "Melyik feladatot halogatod most a legrégebben – és mitől félsz vele kapcsolatban?",
    "Milyen külső struktúra segített eddig a legjobban?"
  ]
};

D.ders = {
  jo: "lo",
  cim: "Az érzelemszabályozásod mélyebben",
  bevezeto: [
    "Az érzelemszabályozás nem az érzelmek elfojtását jelenti, hanem azt a képességet, hogy <strong>észreveszed, elfogadod, megérted</strong> az érzelmeidet, és erős érzelmi állapotban is a céljaid szerint tudsz cselekedni. Gratz és Roemer modellje szerint a szabályozás hat ponton akadhat el, és mindegyik más beavatkozást igényel.",
    "A DERS-SF ezeket méri: a <strong>tudatosság</strong> (figyelsz-e az érzéseidre), a <strong>tisztánlátás</strong> (tudod-e, mit érzel), az <strong>elfogadás</strong> (megengeded-e magadnak az érzést), a <strong>célirányos működés</strong> (tudsz-e felzaklatva is dolgozni), az <strong>impulzuskontroll</strong> (uralod-e a viselkedésedet) és a <strong>stratégiák</strong> (hiszed-e, hogy tudsz javítani az állapotodon). A magasabb pontszám nagyobb nehézséget jelent."
  ],
  skalak: {
    total: { norma: { m: 36, sd: 10.98, src: "Kaufman és mtsai, 2016, egyetemi minta, n = 791" }, hi: "Összességében jelentős nehézséget élsz meg az érzelmek szabályozásában. Ez az élet szinte minden területére kihat: a kapcsolatokra, a munkára, az egészségre. Jó hír, hogy az érzelemszabályozás jól tanulható készség.", mid: "Összességében mérsékelt nehézséget élsz meg: bizonyos területeken jól szabályozol, máshol elakadsz.", lo: "Összességében jól szabályozod az érzelmeidet." },
    strat: { hi: "Nehéz elhinni, hogy egy rossz állapoton tudsz változtatni: ha egyszer felzaklatódsz, úgy érzed, sokáig így maradsz. Ez reménytelenséget és passzivitást hozhat.", mid: "Időnként úgy érzed, nincs eszközöd a rossz állapot ellen.", lo: "Bízol abban, hogy tudsz javítani a rossz állapotodon.", tipHi: "Készíts előre egy listát 3–5 bevált szabályozó lépésről (mozgás, légzés, egy ember felhívása, zuhany, zene). Feszültségben nem kell kitalálni, csak választani." },
    nonacc: { hi: "Erős a <strong>második réteg</strong>: szégyent, bűntudatot, dühöt érzel amiatt, hogy egyáltalán ilyen érzésed van („nem kéne így éreznem”). Ez a második réteg gyakran jobban fáj, mint az eredeti érzés.", mid: "Időnként elítéled magad az érzéseidért.", lo: "Meg tudod engedni magadnak az érzéseidet ítélkezés nélkül.", tipHi: "Ha egy érzés megjelenik, nevezd meg, és tedd hozzá: „érthető, hogy így érzek”. Az elfogadás nem egyetértés, csak annak elismerése, ami van." },
    impulse: { hi: "Feszült állapotban nehéz uralni a viselkedésedet: gyorsan cselekszel, mondasz vagy teszel olyat, amit később megbánsz.", mid: "Időnként elragad az impulzus, főleg nagy feszültségben.", lo: "Erős érzelmi állapotban is uralod a viselkedésedet.", tipHi: "Iktass be késleltetést a késztetés és a tett közé (10 perc, 10 lélegzet). A késztetés hulláma általában 10–20 perc alatt csökken." },
    goals: { hi: "Felzaklatott állapotban nagyon nehéz koncentrálni, dolgozni, a feladatra figyelni. Az érzelem „elnyeli” a figyelmet.", mid: "Időnként az érzelmek megzavarják a munkádat.", lo: "Felzaklatva is tudsz a feladataidra figyelni.", tipHi: "Ha fel vagy zaklatva, először szabályozz, utána dolgozz. 5 perc szabályozás gyorsabb, mint egy óra szétesett munka." },
    aware: { hi: "Kevéssé figyelsz az érzéseidre: gyakran csak akkor veszed észre őket, amikor már nagyon erősek, vagy testi tünetként jelentkeznek.", mid: "Időnként nem veszed észre, mit érzel.", lo: "Figyelsz az érzéseidre, és időben észreveszed őket.", tipHi: "Napi 2–3 érzelmi check-in: mit érzek, hol érzem a testemben, mekkora (1–10)?" },
    clarity: { hi: "Nehéz megkülönböztetni és megnevezni, pontosan mit érzel: az érzelmek gyakran zavaros, kevert állapotként jelennek meg.", mid: "Időnként nehéz eligazodni az érzéseiden.", lo: "Pontosan tudod, mit érzel.", tipHi: "Használj érzelemkereket, és a „rossz” helyett keress pontosabb szót (csalódott, megszégyenült, túlterhelt). A pontos megnevezés önmagában csökkenti az intenzitást." }
  },
  gyoker: [
    "Az érzelemszabályozás a gyerekkorban, a gondozókkal való kapcsolatban tanulódik: a gyerek először a szülő segítségével nyugszik meg (ko-reguláció), és ebből tanulja meg később egyedül. Ahol a szülő nem tudott megnyugtatni, elutasította vagy büntette a gyerek érzéseit („ne sírj”, „ne hisztizz”), ott a gyerek nem kapott eszközöket.",
    "A temperamentum (érzelmi reaktivitás), az ADHD, a trauma és a krónikus stressz is erősen befolyásolja. A sémák közül az Érzelmi Gátoltság, az Elégtelen Önkontroll és az Érzelmi Depriváció függ össze a legerősebben."
  ],
  mindennap: [
    "A szabályozási nehézségek gyakran külső eszközökben jelennek meg: evés, képernyő, vásárlás, alkohol, munkába menekülés – ezek rövid távon csökkentik a feszültséget, de nem tanítják meg a rendszert a saját szabályozásra.",
    "Kapcsolatokban a nehézség konfliktusban látszik a legjobban: robbanás, elzárkózás, sértettség, vagy az, hogy a partnertől várod, hogy megnyugtasson."
  ],
  fennmarad: "Az elkerülés és a külső szabályozás rövid távon működik, ezért megerősítődik; a belső eszközök pedig gyakorlás hiányában fejletlenek maradnak.",
  lepesek: [
    "<strong>Kezdd a leggyengébb területtel.</strong> A fenti skálák közül a legmagasabb mutatja, hol akadsz el leginkább.",
    "<strong>Test először.</strong> Az érzelemszabályozás alapja az idegrendszer szabályozása: alvás, mozgás, légzés, étkezés.",
    "<strong>Megnevezés.</strong> Az érzelem pontos megnevezése (affect labeling) mérhetően csökkenti az intenzitást.",
    "<strong>Készségek tanulása.</strong> A DBT (dialektikus viselkedésterápia) érzelemszabályozási modulja kifejezetten erre épül, és önsegítő formában is hozzáférhető.",
    "<strong>Ko-reguláció.</strong> Biztonságos emberek mellett könnyebb megnyugodni; ez nem gyengeség, hanem a szabályozás természetes része."
  ],
  kerdesek: [
    "Mi történt gyerekként, ha erős érzelmet mutattál?",
    "Melyik a leggyakoribb módod a feszültség csökkentésére – és mibe kerül?",
    "Mi az az érzés, amit a legnehezebb elfogadnod magadban?"
  ]
};

D.scs = {
  cim: "Az önegyüttérzésed mélyebben",
  bevezeto: [
    "Kristin Neff modellje szerint az önegyüttérzés három pozitív komponensből és azok ellentéteiből áll: <strong>önkedvesség</strong> szemben az <strong>önítélkezéssel</strong>, <strong>közös emberi tapasztalat</strong> (a szenvedés az emberi lét része) szemben az <strong>elszigeteltséggel</strong> („csak velem van baj”), és <strong>tudatos jelenlét</strong> (a fájdalom észrevétele elnyomás és felnagyítás nélkül) szemben a <strong>túlazonosulással</strong> (elsodor az érzés).",
    "Az önegyüttérzés <strong>nem önsajnálat és nem önfelmentés</strong>. A kutatások szerint az önegyüttérző emberek nem kevésbé, hanem jobban vállalnak felelősséget a hibáikért, kitartóbbak a kudarc után, és ritkábban szoronganak, depressziósak. Az önkritika ezzel szemben szorongást és elkerülést hoz – ami rontja a teljesítményt."
  ],
  skalak: {
    total: { jo: "hi", norma: { m: 3.00, sd: 0.61, src: "Raes és mtsai, 2011, amerikai egyetemisták, n = 415" }, hi: "Magas önegyüttérzés: nehéz helyzetben kedvesen és megértően tudsz viszonyulni magadhoz.", mid: "Közepes önegyüttérzés: néha kedves vagy magaddal, máskor kemény.", lo: "Alacsony önegyüttérzés: nehéz helyzetben inkább kritikus, elszigetelt és elsodort vagy. Ez az egyik legjobban fejleszthető terület." },
    SK: { jo: "hi", hi: "Erős az önkedvesség: hiba vagy fájdalom esetén meleg, támogató hangon tudsz magadhoz szólni.", mid: "Az önkedvesség időnként elérhető.", lo: "Gyenge az önkedvesség: nehéz kedvesnek lenni magaddal, amikor szenvedsz.", tipLo: "Gyakorlat: hogyan beszélnél egy barátoddal ugyanebben a helyzetben? Írd le, és mondd el magadnak." },
    SJ: { jo: "lo", hi: "Erős az önítélkezés: kemény, kritikus belső hang, ami a hibáidért büntet és szégyenít.", mid: "Az önítélkezés időnként megjelenik.", lo: "Ritka az önítélkezés.", tipHi: "Figyeld meg a kritikus hang szavait, és kérdezd meg: kinek a hangja ez? Mit mondana helyette egy bölcs, támogató ember?" },
    CH: { jo: "hi", hi: "Erősen éled meg a közös emberi tapasztalatot: tudod, hogy a nehézség mindenkinek része az életének.", mid: "Időnként eszedbe jut, hogy nem vagy egyedül a nehézségeiddel.", lo: "Gyenge a közös emberi tapasztalat érzése: a nehézségeid elszigetelnek, mintha csak veled történne.", tipLo: "Amikor szenvedsz, mondd ki: „a nehézség az emberi élet része; most sokan éreznek hasonlót”." },
    IS: { jo: "lo", hi: "Erős az elszigeteltség: nehéz helyzetben úgy érzed, csak veled van baj, és mindenki más jobban boldogul.", mid: "Időnként elszigeteltnek érzed magad a nehézségeidben.", lo: "Ritkán érzed magad elszigeteltnek a nehézségeidben." },
    MI: { jo: "hi", hi: "Erős a tudatos jelenlét: a fájdalmat észreveszed anélkül, hogy elnyomnád vagy elsodorna.", mid: "A tudatos jelenlét időnként elérhető.", lo: "Gyenge a tudatos jelenlét: a fájdalmat vagy elnyomod, vagy elsodor.", tipLo: "Rövid gyakorlat: „ez most a szenvedés pillanata” – nevezd meg, tedd a kezed a mellkasodra, és lélegezz háromszor." },
    OI: { jo: "lo", hi: "Erős a túlazonosulás: egy fájdalmas érzés vagy gondolat elsodor, és sokáig rágódsz rajta.", mid: "Időnként elsodornak az érzések.", lo: "Ritkán sodornak el a negatív érzések." }
  },
  gyoker: [
    "Az önegyüttérzés képessége abból nő ki, ahogyan a gondozók bántak velünk, amikor hibáztunk vagy szenvedtünk. Ahol a szülő vigasztalt, megértő volt, ott a gyerek ezt a hangot internalizálja. Ahol a szülő kritikus, büntető, szégyenítő volt, ott a belső hang is ilyen lesz.",
    "A teljesítményorientált kultúra és a „keménység = siker” hiedelem szintén gátolja: sokan attól félnek, hogy ha kedvesek magukkal, ellustulnak – a kutatások ezt nem igazolják."
  ],
  mindennap: [
    "Az alacsony önegyüttérzés a kudarcok után látszik a legjobban: önostorozás, rágódás, a következő próbálkozás elkerülése. Gyakran együtt jár a perfekcionizmussal, a halogatással, a szégyennel és az érzelmi evéssel.",
    "Kapcsolatokban az önkritikus ember gyakran mások kritikájára is túlérzékeny, és nehezen fogadja el a szeretetet és a dicséretet."
  ],
  lepesek: [
    "<strong>Önegyüttérzés-szünet</strong> (Neff): 1) „Ez most nehéz.” 2) „A nehézség az emberi élet része.” 3) „Legyek kedves magamhoz.”",
    "<strong>Levél magadnak.</strong> Írj levelet magadnak egy bölcs, szerető barát szemszögéből egy nehéz helyzetről.",
    "<strong>Érintés.</strong> A kéz a mellkason vagy egy önölelés fiziológiailag is megnyugtat (oxitocin).",
    "<strong>A kritikus hang átírása.</strong> A „béna vagy” helyett: „ez nem sikerült, mit tanulok belőle?”.",
    "<strong>Rendszeres gyakorlás.</strong> Az MSC (Mindful Self-Compassion) program 8 hetes struktúrája kutatásokkal alátámasztott."
  ],
  kerdesek: [
    "Hogyan beszélsz magaddal, amikor hibázol – és kitől tanultad ezt a hangot?",
    "Mitől félsz, ha kedvesebb lennél magaddal?",
    "Mikor érezted utoljára, hogy valaki igazán megértett egy nehéz helyzetben?"
  ]
};

D.tfeq = {
  jo: "lo",
  cim: "Az evési mintáid mélyebben",
  bevezeto: [
    "A TFEQ-R18 három evési mintát mér. Az <strong>érzelmi evés</strong> azt, mennyire eszel érzelmi állapotokra (szorongás, magány, szomorúság, unalom) válaszul. A <strong>kontrollálatlan evés</strong> azt, mennyire nehéz abbahagyni vagy megállni, ha ételinger van előtted. A <strong>kognitív visszafogás</strong> azt, mennyire tudatosan korlátozod, figyeled vagy szabályozod az evésedet.",
    "Ezek a minták nem jellemhibák, hanem a test, az idegrendszer és a tanult szabályozási stratégiák együttes működései. Az evés az egyik legkorábbi és legelérhetőbb módja a megnyugvásnak, ezért nagyon gyakori, hogy érzelemszabályozásra is használjuk. A <strong>visszafogás</strong> pedig paradox módon gyakran éppen a kontrollálatlan evést erősíti: a szigorú korlátozás után nagyobb a „kiesés” valószínűsége."
  ],
  profil: function(r, lv){
    if (lv.CR === 'hi' && (lv.UE === 'hi' || lv.EE === 'hi')) return ["<strong>Magas visszafogás és magas érzelmi vagy kontrollálatlan evés együtt:</strong> ez a jellegzetes „korlátozás–kiesés” ciklus. Minél szigorúbb a kontroll, annál erősebb a visszacsapás, ami bűntudatot és még szigorúbb kontrollt hoz. Ebből a körből általában nem a még erősebb akarat, hanem a rugalmasabb, nem büntető viszony vezet ki."];
    return [];
  },
  skalak: {
    EE: { hi: "Erős az <strong>érzelmi evés</strong>: a nehéz érzésekre (szorongás, magány, szomorúság, düh, unalom) gyakran evéssel reagálsz. Ez az étel nem az éhséget csillapítja, hanem az érzést.", mid: "Az érzelmi evés időnként megjelenik, főleg nagy stresszben.", lo: "Ritkán eszel érzelmi állapotokra válaszul.", tipHi: "Mielőtt eszel, kérdezd meg: éhes vagyok, vagy érzek valamit? Ha érzés, nevezd meg, és nézd meg, mi más segíthetne most (mozgás, beszélgetés, pihenés). Nem tiltás, hanem választás." },
    UE: { hi: "Erős a <strong>kontrollálatlan evés</strong>: ha ételinger van előtted, nehéz megállni. Ez gyakran a korábbi korlátozás, a fáradtság, az alváshiány vagy a stressz következménye.", mid: "Időnként nehéz abbahagyni az evést, főleg fáradtan vagy feszültségben.", lo: "Általában meg tudsz állni, ha jóllaktál.", tipHi: "Figyelj a rendszeres, kielégítő étkezésekre és az alvásra – az éhes, kimerült test sokkal erősebben reagál az ingerekre." },
    CR: { hi: "Erős a <strong>kognitív visszafogás</strong>: tudatosan korlátozod és figyeled az evésedet. Ez lehet rugalmas és egészséges, de ha merev szabályokká válik, gyakran feszültséget, kiesést és bűntudatot hoz.", mid: "Közepesen figyeled az evésedet.", lo: "Kevéssé korlátozod tudatosan az evésedet.", tipHi: "Figyeld meg, mennyire rugalmasak a szabályaid. A merev tiltások gyakran pont azt erősítik, amit kerülni szeretnél." }
  },
  gyoker: [
    "Az érzelmi evés gyakran a gyerekkorban tanulódik: ha az étel volt a vigasz („egyél valamit, jobban leszel”) vagy a jutalom, vagy ha az érzelmekkel máshogy nem lehetett megküzdeni. Az érzelmi elhanyagolás és a stressz különösen erősíti.",
    "A kontrollálatlan evés mögött gyakran a korábbi diéták, a korlátozás, az alváshiány, és biológiai tényezők (pl. ADHD, dopamin-jutalmazás) állnak. A merev visszafogás a test- és súlyközpontú kultúrából, a testképpel kapcsolatos szégyenből és a kontroll iránti igényből fakadhat."
  ],
  mindennap: [
    "Az evési minták gyakran stresszben és este erősödnek: fáradtan, egyedül, a nap végén a legkisebb az ellenálló képesség, és a legnagyobb az igény a megnyugvásra.",
    "A szégyen és a titkolózás gyakran fenntartja a mintát: ami titokban zajlik, azt nehéz megváltoztatni."
  ],
  fennmarad: "Az evés rövid távon megnyugtat, ezért megerősítődik. A bűntudat és az önvád pedig újabb negatív érzést hoz, ami a következő érzelmi evés üzemanyaga; a szigorúbb kontroll pedig újabb kiesést.",
  lepesek: [
    "<strong>Éhség vagy érzés?</strong> Tanuld meg megkülönböztetni a fizikai éhséget az érzelmi éhségtől.",
    "<strong>Alternatív megnyugvás.</strong> Gyűjts össze 3–5 nem étel alapú megnyugtató eszközt, és tartsd kéznél.",
    "<strong>Rendszeresség.</strong> A kihagyott étkezés és a túl szigorú korlátozás a legtöbb embernél növeli a kiesés esélyét.",
    "<strong>Önvád helyett kíváncsiság.</strong> Egy érzelmi evés után ne büntesd magad, hanem kérdezd meg: mi történt előtte, mit éreztem?",
    "<strong>Szakember.</strong> Ha az evéssel kapcsolatos gondolatok, a korlátozás vagy a falásrohamok sok szenvedést okoznak, keress evészavarokban jártas szakembert; ez jól kezelhető terület."
  ],
  kerdesek: [
    "Milyen érzések előzik meg leggyakrabban az evést, ha nem vagy éhes?",
    "Mit tanultál gyerekként az ételről és a vigasztalásról?",
    "Mi segítene most megnyugodni étel nélkül?"
  ],
  megjegyzes: "A teszt nem diagnosztizál evészavart. Ha az evés vagy a testsúly körüli gondolatok sok szenvedést okoznak, evészavarokban jártas szakember (pszichológus, pszichiáter, dietetikus) tud segíteni."
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
