/* Mélyelemzés: onbizalom.html — RSES, GSE, BFNE-II, gyakorlati önbizalom */
(function(D){

D.rses = {
  jo: "hi",
  cim: "Az önértékelésed mélyebben",
  bevezeto: [
    "Az önértékelés az az alapérzés, hogy <strong>rendben vagy-e úgy, ahogy vagy</strong>. Nem azonos a teljesítménnyel: lehet valaki nagyon sikeres és közben belül folyamatosan elégtelennek érezni magát, és fordítva.",
    "A kutatások szerint az önértékelés felnőttkorban viszonylag stabil, de nem rögzített: a tartós változás leginkább a belső kritikus hang és a kerülő viselkedés megváltoztatásával jön, nem a pozitív önmegerősítéssel."
  ],
  skalak: {
    total: { cut: [14, 26], hi: "Stabil, elfogadó viszony önmagaddal: egyenrangúnak érzed magad másokkal.", mid: "Átlagos tartomány: alapvetően működik, de kudarc, kritika vagy összehasonlítás megbillentheti.", lo: "Most inkább az az alapérzésed, hogy nem vagy elég. Ez tanult nézőpont, nem tény rólad, és jól változtatható." }
  },
  gyoker: [
    "Az önértékelés korai alapja az, hogy feltétel nélkül elfogadottnak érezted-e magad, vagy a szeretet teljesítményhez, jó viselkedéshez kötődött. A feltételes elfogadás gyakran ingadozó, külső megerősítésre szoruló önértékelést hagy maga után.",
    "Később a kortárs tapasztalatok (megszégyenítés, kiközösítés), a tartós kudarcok és a kritikus kapcsolatok formálják."
  ],
  mindennap: [
    "Alacsony önértékelésnél gyakori a dicséret elhárítása, a hibák felnagyítása, a túlzott alkalmazkodás és a döntések halogatása, hogy ne lehessen rosszul dönteni.",
    "Gyakori a kompenzálás is: túlteljesítés, maximalizmus, mások megmentése, hogy az érték kívülről bizonyítható legyen."
  ],
  fennmarad: "A negatív önkép önmagát erősíti: amit vársz magadtól, annak jeleit veszed észre, a cáfoló tapasztalatokat pedig kivételnek tekinted („csak szerencsém volt”). A kerülés miatt kevés új bizonyíték érkezik.",
  lepesek: [
    "<strong>Bizonyíték-napló.</strong> Este írj le három dolgot, amit jól csináltál, vagy amiben a saját értékeid szerint cselekedtél. Két hét után olvasd vissza.",
    "<strong>Fogd el a kritikust.</strong> Írd le szó szerint, mit mond a belső hang, és kérdezd meg: egy barátnak is ezt mondanám?",
    "<strong>Ne a teljesítményből építkezz.</strong> Válassz egy értéket (pl. őszinteség, kitartás), és azt mérd, nem az eredményt.",
    "<strong>Ha tartósan alacsony</strong>, és lehangoltsággal jár, a kognitív viselkedésterápia és a sématerápia hatékony."
  ],
  kerdesek: [
    "Kinek a hangja szól, amikor kritizálod magad?",
    "Milyen helyzetben érzed magad a legkevésbé értékesnek?",
    "Mit kellene elérned ahhoz, hogy elég legyél? Ki szabta ezt a mércét?"
  ],
  megjegyzes: "Az RSES az önértékelés globális szintjét méri; a 15 és 26 pontos sávhatár tájékozódási, nem diagnosztikai."
};

D.gse = {
  jo: "hi",
  cim: "Az énhatékonyságod mélyebben",
  bevezeto: [
    "Az énhatékonyság Bandura fogalma: az a meggyőződés, hogy <strong>képes vagy cselekedni</strong>, és megbirkózol azzal, ami jön. Erősebben jelzi előre, hogy belevágsz-e valamibe és kitartasz-e, mint a tényleges tudásod.",
    "Az általános énhatékonyság egy átfogó szint; konkrét területeken (nyilvános beszéd, tárgyalás, sport) eltérhet tőle."
  ],
  skalak: {
    total: { cut: [24, 35], norma: { m: 29.55, sd: 5.32, src: "Scholz és mtsai, 2002, 25 ország, n ≈ 19 000" }, hi: "Erős bizalom a megküzdési képességedben: nehéz helyzetben is inkább a megoldást keresed.", mid: "Átlagos bizalom: ismerős helyzetben stabil, újban bizonytalanabb lehet.", lo: "Most kevéssé bízol abban, hogy megoldod a nehéz helyzeteket. Ezt leginkább friss sikertapasztalatok építik." }
  },
  gyoker: [
    "A legerősebb forrás a saját sikerélmény, különösen az, amit erőfeszítéssel értél el. A túl könnyű sikerek és a túl nagy kudarcok egyaránt gyengíthetik.",
    "Hozzájárul mások példája (ha egy hozzád hasonló ember megcsinálja), a biztatás, és az, hogyan értelmezed a testi izgalmat: félelemnek vagy készenlétnek."
  ],
  mindennap: [
    "Alacsony énhatékonyságnál a kihívások fenyegetésnek látszanak, gyakori a kerülés, a hamar feladás és a „nem nekem való” gondolat.",
    "Magasnál a nehézség inkább feladatnak tűnik, és a kudarcot az erőfeszítés vagy a stratégia hiányának tulajdonítod, nem a képességeidnek."
  ],
  fennmarad: "A kerülés miatt nem gyűlik új sikertapasztalat, ezért a bizonytalanság megmarad. Fordítva is igaz: minden végigvitt kis kihívás növeli a következő vállalásának esélyét.",
  lepesek: [
    "<strong>Lépcsőzetes kihívások.</strong> Válassz olyan feladatot, ami kicsit a komfortzónán túl van, de 70%-os eséllyel sikerül.",
    "<strong>Rögzítsd a sikert.</strong> Utána írd le, mit csináltál, ami működött. Ez teszi a sikert a sajátoddá.",
    "<strong>Modell.</strong> Keress valakit, aki hozzád hasonlóból indult, és megcsinálta, amit te szeretnél.",
    "<strong>Izgalom = készenlét.</strong> A gyors szívverést nevezd készenlétnek. Ez a kutatások szerint javítja a teljesítményt."
  ],
  kerdesek: [
    "Mi az a nehéz helyzet, amit az elmúlt évben mégis megoldottál?",
    "Mit kerülsz el most, mert nem vagy biztos benne, hogy sikerülne?",
    "Ki az, akinek a példája neked is erőt ad?"
  ],
  megjegyzes: "A GSE átfogó énhatékonyságot mér; a viszonyítás nemzetközi mintán alapul, magyar norma nélkül."
};

D.bfne = {
  jo: "lo",
  cim: "Mások ítéletétől való félelem mélyebben",
  bevezeto: [
    "A negatív értékeléstől való félelem azt méri, mennyire foglalkoztat, hogyan látnak mások, és mennyire tartasz attól, hogy kedvezőtlenül ítélnek meg. Ez a <strong>szociális szorongás magja</strong>, és az önbizalom egyik leggyakoribb fékje.",
    "Mérsékelt szinten hasznos: figyelmessé tesz a társas jelzésekre. Erős szinten viszont a figyelem befelé fordul (hogyan hatok?), és ez rontja a teljesítményt, amitől a félelem igazolódni látszik."
  ],
  skalak: {
    total: { cut: [16, 33], hi: "Mások ítélete erősen jelen van: sok energia megy el arra, hogy figyeld, hogyan hatsz, és kerüld a hibát.", mid: "Mások véleménye fontos, és bizonyos helyzetekben visszafoghat.", lo: "Mások ítélete kevéssé szabja meg, mit mondasz vagy teszel." }
  },
  gyoker: [
    "Hozzájárul a temperamentum (gátolt, óvatos alkat), a kritikus vagy megszégyenítő nevelés, a kortársak általi kiközösítés, és a társas kudarcok emléke.",
    "A YSQ Csökkentértékűség/szégyen és Elismerés-hajszolás sémái gyakran állnak mögötte."
  ],
  mindennap: [
    "Gyakori a megszólalás visszatartása, a mondatok előre begyakorlása, a háttérben maradás, a dicséret kínos elhárítása és a beszélgetések utólagos újrajátszása.",
    "Munkában a kérdezés, a vélemény képviselése és a saját eredmények bemutatása nehezedik meg."
  ],
  fennmarad: "A biztonsági viselkedések (kerülés, túlkészülés, figyelem önmagadra) megakadályozzák, hogy megtapasztald: a legtöbb ember sokkal kevésbé figyel és ítél, mint gondolod.",
  lepesek: [
    "<strong>Figyelem kifelé.</strong> Beszélgetésben a másikra figyelj (mit mond, milyen az arca), ne arra, hogyan hatsz.",
    "<strong>Viselkedéses kísérlet.</strong> Írd le, mire számítasz (pl. „ha kérdezek, hülyének néznek”), csináld meg, és jegyezd fel, mi történt valójában.",
    "<strong>Engedd el a túlkészülést</strong> egy kis tétű helyzetben, és figyeld meg az eredményt.",
    "<strong>Ha helyzeteket kerülsz el</strong> emiatt, a kognitív viselkedésterápia kifejezetten hatékony."
  ],
  kerdesek: [
    "Kinek a véleményétől tartasz a legjobban, és mit gondolsz, mit látna?",
    "Melyik helyzetet kerülöd el most mások ítélete miatt?",
    "Mi a legrosszabb, ami történhet, és hogyan kezelnéd, ha megtörténne?"
  ],
  megjegyzes: "A BFNE-II-nek nincs hivatalos határértéke; a sávok a skála harmadai."
};

D.obgy = {
  jo: "hi",
  cim: "A gyakorlati önbizalmad mélyebben",
  bevezeto: [
    "Ez a skála nem azt kérdezi, mit gondolsz magadról, hanem azt, <strong>mit csinálsz</strong> öt olyan területen, ahol az önbizalom láthatóvá válik: kiállás, határok, kezdeményezés, hibák kezelése, láthatóság.",
    "Az önbizalom a gyakorlatban nem érzés, ami megelőzi a cselekvést, hanem tapasztalat, ami a cselekvés után jön. Ezért ez a skála mozdul el leghamarabb egy kurzus vagy gyakorlás hatására."
  ],
  skalak: {
    total: { cut: [2.8, 3.8], hi: "Összességében magabiztosan mozogsz a hétköznapi helyzetekben.", mid: "Bizonyos területeken magabiztos vagy, másokon visszafogod magad.", lo: "Több területen visszatart a bizonytalanság. A jó hír: ez a viselkedési szint a leggyorsabban gyakorolható." },
    KI: { cut: [2.8, 3.8], hi: "Ki tudsz állni magadért és a véleményedért.", mid: "Néha kiállsz magadért, néha lenyeled.", lo: "Gyakran lenyeled a véleményed vagy a kérésed.", tipLo: "Naponta egy kimondott vélemény vagy kérés, kis tétű helyzetben kezdve." },
    HA: { cut: [2.8, 3.8], hi: "Tudsz nemet mondani, és jelzed a határaidat.", mid: "A határaid tartása helyzetfüggő.", lo: "Nehéz nemet mondani; gyakran mások igényét teszed előre.", tipLo: "Rövid nem, magyarázkodás nélkül: „Ezt most nem vállalom.”" },
    KE: { cut: [2.8, 3.8], hi: "Belevágsz bizonytalan helyzetekbe is.", mid: "Kezdeményezel, ha elég biztosnak érzed magad.", lo: "A kudarctól való félelem miatt lehetőségeket hagysz ki.", tipLo: "Hetente egy „felkészületlen igen”." },
    HI: { cut: [2.8, 3.8], hi: "A hibákat tanulságként kezeled, és hamar újrapróbálkozol.", mid: "A hibák egy ideig foglalkoztatnak, de továbblépsz.", lo: "Egy hiba sokáig foglalkoztat, és az értékedről szóló ítéletnek érzed.", tipLo: "Hiba-napló: mi történt, mit tanultam, mi a következő lépés." },
    LA: { cut: [2.8, 3.8], hi: "El tudod fogadni az elismerést, és vállalod a sikereidet.", mid: "Az elismerés néha kínos, de elfogadod.", lo: "A figyelem és a dicséret kényelmetlen; a sikereidet inkább a szerencsének tulajdonítod.", tipLo: "Dicséretre csak annyi: „Köszönöm.”" }
  },
  gyoker: [
    "A gyakorlati önbizalom mögött általában a három másik réteg áll: az önértékelés (RSES), a megküzdésbe vetett bizalom (GSE) és mások ítéletétől való félelem (BFNE-II). Érdemes ezeket egymás mellé tenni.",
    "Gyakori minta, hogy a belső önkép rendben van, de a viselkedés még a régi, óvatos szokásokat követi. Ilyenkor a gyakorlás gyorsan hoz változást."
  ],
  mindennap: [
    "A gyenge területeken jellemző a kerülés, a túlzott alkalmazkodás és az utólagos rágódás; az erős területeken a természetesség és a gyors döntés."
  ],
  fennmarad: "Amit kerülsz, abban nem gyűlik tapasztalat, ezért a bizonytalanság megmarad. A legkisebb, de rendszeres gyakorlás töri meg ezt a kört.",
  lepesek: [
    "<strong>Egy terület egyszerre.</strong> Válaszd a leggyengébbet, és 2–3 hétig csak arra fókuszálj.",
    "<strong>Napi mikrogyakorlat</strong> kis tétű helyzetben, utána egy sor jegyzet arról, mi történt.",
    "<strong>Újramérés.</strong> 6–8 hét után töltsd ki újra ezt és a másik három skálát."
  ],
  kerdesek: [
    "Melyik területen szeretnéd a legjobban, hogy 2 hónap múlva másképp legyen?",
    "Mi az a legkisebb lépés, amit ezen a héten megtehetsz?",
    "Ki az, aki ebben példa lehet számodra?"
  ],
  megjegyzes: "Saját, nem validált skála; a területenkénti sávok (2,8 és 3,8) tájékozódásra valók."
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
