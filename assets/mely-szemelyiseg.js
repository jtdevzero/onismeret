/* Mélyelemzés: szemelyiseg.html — Big Five (IPIP-NEO-60), VIA-72 */
(function(D){

D.bf = {
  cim: "A személyiségprofilod mélyebben",
  bevezeto: [
    "A Big Five (Ötfaktoros modell) a személyiségpszichológia legjobban kutatott modellje. Öt széles dimenzióban írja le, miben különböznek az emberek tartósan: <strong>Nyitottság</strong> (új élmények, ötletek, esztétika iránti érzékenység), <strong>Lelkiismeretesség</strong> (szervezettség, kitartás, önfegyelem), <strong>Extraverzió</strong> (társas energia, aktivitás, pozitív érzelmek), <strong>Barátságosság</strong> (együttműködés, empátia, bizalom) és <strong>Neuroticizmus</strong> (érzelmi érzékenység, hajlam a negatív érzelmekre).",
    "Egyik pólus sem „jó” vagy „rossz” önmagában: minden vonásnak megvannak az előnyei és a költségei, és az számít, hogy mennyire illik a profilod az életedhez, a munkádhoz, a kapcsolataidhoz. A vonások viszonylag stabilak, de nem változatlanok: az életkorral általában nő a lelkiismeretesség és a barátságosság, csökken a neuroticizmus, és a tudatos munka, a szerepek és a kapcsolatok is formálják őket."
  ],
  profil: function(r, lv){
    var out = [];
    if (lv.N === 'hi' && lv.C === 'hi') out.push("<strong>Magas neuroticizmus és magas lelkiismeretesség együtt:</strong> erős belső hajtás és erős szorongás. Ez gyakran perfekcionizmusban, túlvállalásban és kiégés-veszélyben jelenik meg: a szorongás „üzemanyag” a teljesítményhez, de drága. A legfontosabb itt a pihenés és a szorongás kezelése, nem a még több szervezés.");
    if (lv.N === 'hi' && lv.C === 'lo') out.push("<strong>Magas neuroticizmus és alacsony lelkiismeretesség együtt:</strong> az érzelmi hullámok könnyen elsodorják a terveket. Gyakori a halogatás és az impulzív megküzdés (evés, képernyő, költés), amit önvád követ. Itt a külső struktúra (napirend, határidők, társ) és az érzelemszabályozás együtt hoz változást.");
    if (lv.E === 'lo' && lv.N === 'hi') out.push("<strong>Alacsony extraverzió és magas neuroticizmus együtt:</strong> a nehéz érzelmek könnyen befelé fordulnak, és kevés külső forrás (társaság, aktivitás) ellensúlyozza őket. Érdemes tudatosan építeni néhány megbízható, alacsony ingerszintű kapcsolódási pontot.");
    if (lv.O === 'hi' && lv.C === 'lo') out.push("<strong>Magas nyitottság és alacsony lelkiismeretesség együtt:</strong> sok ötlet, kevés befejezés. A kreativitásod akkor válik eredménnyé, ha melléteszel egy egyszerű rendszert vagy egy rendszerezőbb társat.");
    if (lv.A === 'hi' && lv.E === 'lo') out.push("<strong>Magas barátságosság és alacsony extraverzió:</strong> mély, kevés kapcsolat, sok empátia – és nagy hajlam az alkalmazkodásra. Figyelj a saját határaidra.");
    if (lv.A === 'lo' && lv.C === 'hi') out.push("<strong>Alacsony barátságosság és magas lelkiismeretesség:</strong> hatékony, kritikus, eredményorientált működés. Munkában erős, a kapcsolatokban viszont érdemes tudatosan figyelni a melegségre és a dicséretre.");
    return out;
  },
  skalak: {
    O: { hi: "<strong>Magas nyitottság:</strong> kíváncsi, kreatív, ötletgazdag gondolkodás; érzékenység a művészetre, az újdonságra, az összetett gondolatokra. Szereted az elméleteket, a változatosságot és a szokatlan megoldásokat. A költség: nehéz lehet a rutin, a monotónia, és könnyen elkezdesz sok mindent.", mid: "<strong>Közepes nyitottság:</strong> nyitott vagy az újdonságra, de a bevált dolgokat is értékeled. Pragmatikusan választasz a kísérletezés és a stabilitás között.", lo: "<strong>Alacsony nyitottság:</strong> a megszokott, kipróbált, gyakorlatias dolgokat részesíted előnyben. Ez stabilitást, megbízhatóságot ad; a költség az lehet, hogy a változás és az új nézőpontok nehezebben fogadhatók be.", tipHi: "Építs a kreativitásodra, de párosítsd egy befejezési rendszerrel: egyszerre legfeljebb 2–3 projekt, és mindegyiknek legyen következő konkrét lépése." },
    C: { hi: "<strong>Magas lelkiismeretesség:</strong> szervezett, kitartó, megbízható; végigviszed, amit elkezdesz. Ez az egyik legerősebb előrejelzője a munkahelyi sikernek és az egészségnek. A költség: perfekcionizmus, merevség, nehézség a lazítással és a „elég jó” elfogadásával.", mid: "<strong>Közepes lelkiismeretesség:</strong> van struktúrád, de rugalmas vagy; a fontos dolgokat végigviszed, a kevésbé fontosakban lazább vagy.", lo: "<strong>Alacsony lelkiismeretesség:</strong> spontán, rugalmas, a pillanatban élő működés. A költség a halogatás, a befejezetlenség és a hosszú távú célok nehézsége. Ez nem lustaság: gyakran a struktúra hiánya vagy egy dopaminérzékeny, újdonságkereső idegrendszer áll mögötte.", tipLo: "Ne akaraterőre építs, hanem külső struktúrára: naptárblokkok, nyilvános határidők, közös munka (body doubling), apró, befejezhető lépések.", tipHi: "Tudatosan engedd meg az „elég jó” szintet a kevésbé fontos dolgokban, és ütemezz be pihenést úgy, mint egy feladatot." },
    E: { hi: "<strong>Magas extraverzió:</strong> a társaság, az aktivitás és az ingerek feltöltenek. Gyakran éled meg a pozitív érzelmeket, könnyen kapcsolódsz, szívesen vezetsz. A költség: nehéz lehet az egyedüllét, és a túl sok inger impulzivitáshoz vezethet.", mid: "<strong>Közepes extraverzió (ambivert):</strong> néha a társaság, néha a csend tölt fel. A helyzethez tudsz alkalmazkodni.", lo: "<strong>Alacsony extraverzió (introverzió):</strong> az egyedüllét és a csendes, mély kapcsolatok töltenek fel; a sok társaság fáraszt. Ez nem félénkség vagy szociális szorongás, hanem eltérő energiagazdálkodás.", tipLo: "Tervezd meg a feltöltődési időt a társas események után, és válaszd a kis létszámú, mély beszélgetéseket a nagy rendezvények helyett." },
    A: { hi: "<strong>Magas barátságosság:</strong> együttműködő, empatikus, segítőkész, bizalommal teli. A kapcsolatokban ez melegséget ad. A költség: nehéz nemet mondani, könnyen alkalmazkodsz a saját károdra, és a konfliktust kerülöd.", mid: "<strong>Közepes barátságosság:</strong> együttműködsz, de ki tudsz állni magadért is.", lo: "<strong>Alacsony barátságosság:</strong> kritikus, versengő, szkeptikus működés; nem fogadsz el dolgokat csak azért, mert mások mondják. Ez tárgyalásban, vezetésben erősség lehet; a kapcsolatokban viszont érdemes tudatosan figyelni a melegségre.", tipHi: "Gyakorold az asszertív nemet: a barátságosság nem jelenti azt, hogy a saját igényeid kevésbé fontosak.", tipLo: "Kapcsolatokban tudatosan mondd ki az elismerést és a hálát; a kritikus éleslátásod mellé így kerül melegség." },
    N: { jo: "lo", hi: "<strong>Magas neuroticizmus:</strong> erős érzelmi érzékenység; a stressz, a szorongás, a szomorúság, a düh gyorsabban és erősebben jelentkezik, és lassabban cseng le. Ez nem gyengeség, hanem egy érzékeny riasztórendszer – ugyanez az érzékenység teszi lehetővé a mély empátiát és az előrelátást. A költség a kimerülés és a hangulati hullámzás.", mid: "<strong>Közepes neuroticizmus:</strong> vannak érzelmi hullámok, de általában vissza tudsz térni az egyensúlyba. A stressz-tűrésed helyzetfüggő.", lo: "<strong>Alacsony neuroticizmus (érzelmi stabilitás):</strong> nyugodt, kiegyensúlyozott működés; a stressz nem söpör el. A ritka költség: a valós veszélyek alábecslése vagy mások érzelmi reakcióinak nehezebb megértése.", tipHi: "Az érzelemszabályozás tanulható: rendszeres alvás és mozgás, légzés, az érzelmek megnevezése, és a gondolatok vizsgálata (KVT). Ezek a neuroticizmust mérhetően csökkentik." }
  },
  gyoker: [
    "A személyiségvonások kb. 40–50%-ban örökletesek: a temperamentum (ingerérzékenység, aktivitás, érzelmi reaktivitás) már csecsemőkorban látszik. A többit a környezet formálja – a szülői stílus, a gyerekkori tapasztalatok, a kortársak, a kultúra, és később a felnőtt szerepek (munka, párkapcsolat, szülőség).",
    "Érdekes, hogy a testvérek közötti különbségeket a közös családi környezet kevéssé, az egyéni tapasztalatok (barátok, egyedi élmények, a családon belüli egyéni szerep) jobban magyarázzák. A neuroticizmus különösen érzékeny a korai stresszre és a traumára."
  ],
  mindennap: [
    "A profilod meghatározza, milyen munkakörnyezetben, milyen ritmusban és milyen kapcsolatokban érzed jól magad. A lelkiismeretesség a munkahelyi teljesítményt, a neuroticizmus a stresszérzékenységet, az extraverzió a társas energiát, a barátságosság a konfliktuskezelést, a nyitottság a változáshoz való viszonyt befolyásolja leginkább.",
    "Párkapcsolatban a legtöbb súrlódás a különbségekből fakad: az extravertált és az introvertált fél eltérő hétvégét képzel el, a lelkiismeretes és a spontán fél másképp tervez. A különbség nem hiba, hanem tárgyalni való."
  ],
  lepesek: [
    "<strong>Ismerd fel a vonásaid előnyeit és költségeit.</strong> Mindegyik vonásnál írd le, mikor segít és mikor akadályoz.",
    "<strong>Környezet a vonásokhoz.</strong> Ne a személyiségedet próbáld megváltoztatni elsősorban, hanem olyan környezetet és rendszert építs, ami a vonásaidhoz illik.",
    "<strong>Tudatos „vonáson kívüli” viselkedés.</strong> A vonások ellenére tudsz másképp viselkedni, ha valami fontos (pl. introvertáltként egy előadás). Ez kimerítőbb, ezért utána tölts fel.",
    "<strong>Neuroticizmus kezelése.</strong> Ha magas, ez a legfontosabb munkaterület: az érzelemszabályozás fejlesztése az élet szinte minden területén javít.",
    "<strong>Párban.</strong> Hasonlítsátok össze a profilotokat, és beszéljetek arról, hol vagytok különbözőek és hogyan egészítitek ki egymást."
  ],
  kerdesek: [
    "Melyik vonásod segít a legtöbbet a mostani életedben, és melyik akadályoz?",
    "Milyen környezetben, milyen ritmusban érzed magad a legjobban önmagad?",
    "Mit változtatnál, ha tudnád, hogy a vonásaid részben választhatók?"
  ]
};

var V = function(hi, lo){ return { jo: "hi", hi: hi, mid: hi, lo: lo }; };
D.via = {
  cim: "A karaktererősségeid mélyebben",
  bevezeto: [
    "A VIA a pozitív pszichológia karaktererősség-modellje (Peterson és Seligman): 24 erősség, hat erény (bölcsesség, bátorság, emberiesség, igazságosság, mértékletesség, transzcendencia) köré rendezve. A teszt nem képességet mér, hanem azt, <strong>mennyire jellemzőek rád</strong> ezek a tulajdonságok: melyek azok, amelyeket természetesen, energiát adóan használsz.",
    "A legerősebb 3–7 erősséget <strong>szignatúra-erősségeknek</strong> nevezik: ezek tükrözik a leginkább, ki vagy. A kutatások szerint a szignatúra-erősségek új módokon való, tudatos használata mérhetően növeli a jóllétet és csökkenti a depressziós tüneteket. A legalacsonyabb erősségek nem „gyengeségek”: egyszerűen kevésbé természetesek számodra, és a jóllét szempontjából fontosabb az erősségekre építeni, mint a gyengeségeket javítgatni."
  ],
  mutat: { top: 5, bottom: 3 },
  skalak: {
    creativity: V("Új ötletek, szokatlan megoldások – a kreativitás nálad természetes erőforrás. Akkor vagy a legjobb, ha alkothatsz, kísérletezhetsz, nem csak végrehajtasz.", "A kreativitás kevésbé a te terepd; a bevált megoldásokat részesíted előnyben."),
    curiosity: V("Erős kíváncsiság: minden új élmény, kérdés, terület vonz. Ez a tanulás és a kapcsolódás motorja.", "A kíváncsiság kevésbé hajt; inkább a már ismert dolgok elmélyítését választod."),
    judgment: V("Kritikus gondolkodás: mérlegelsz, több oldalról nézed a dolgokat, nem hozol elhamarkodott ítéletet.", "Kevésbé jellemző rád a hosszas mérlegelés; inkább intuitívan vagy gyorsan döntesz."),
    learning: V("A tanulás szeretete: új tudás, készségek elsajátítása önmagában örömet okoz.", "A strukturált tanulás kevésbé motivál; inkább a gyakorlatban, tapasztalatból tanulsz."),
    perspective: V("Bölcsesség és perspektíva: mások tanácsért fordulnak hozzád, mert látod a nagy képet.", "A tágabb perspektíva és a tanácsadói szerep kevésbé a te erősséged."),
    bravery: V("Bátorság: kiállsz a meggyőződésed mellett akkor is, ha az kényelmetlen vagy kockázatos.", "A bátorság kevésbé természetes számodra; a kockázatos kiállás nehezebb."),
    perseverance: V("Kitartás: végigviszed, amit elkezdtél, akadályok ellenére is.", "A kitartás kevésbé természetes; könnyebben elkezdesz, mint befejezel. Ilyenkor a külső struktúra segít."),
    honesty: V("Őszinteség és hitelesség: igaz vagy magadhoz és másokhoz, nem játszol szerepet.", "Az őszinteség mint kiemelt érték kevésbé hangsúlyos; a diplomatikus alkalmazkodás néha fontosabb számodra."),
    zest: V("Lelkesedés és életerő: energiával, élvezettel veted bele magad a dolgokba.", "A lelkesedés kevésbé jellemző; az energiád jelenleg alacsonyabb vagy visszafogottabb. Érdemes megnézni, a kimerültség vagy a hangulat áll-e mögötte."),
    love: V("Szeretet: a mély, kölcsönös kapcsolatok a legfontosabbak számodra, és könnyen adsz és kapsz szeretetet.", "A szoros érzelmi kapcsolódás kevésbé természetes erőforrás jelenleg."),
    kindness: V("Kedvesség: szívesen segítesz, gondoskodsz, jót teszel másokkal.", "A kedvesség mint aktív erősség kevésbé hangsúlyos; a figyelmed inkább máshol van."),
    social_iq: V("Szociális intelligencia: érzékeled mások érzéseit és motivációit, és ügyesen mozogsz társas helyzetekben.", "A társas helyzetek „olvasása” kevésbé természetes számodra."),
    teamwork: V("Csapatmunka: jól működsz csoportban, lojális és megbízható csapattag vagy.", "Inkább egyedül dolgozol hatékonyan; a csapatmunka kevésbé tölt fel."),
    fairness: V("Igazságosság: mindenkit egyenlően kezelsz, és érzékeny vagy az igazságtalanságra.", "Az igazságosság mint kiemelt érték kevésbé hangsúlyos; a helyzetet egyedileg mérlegeled."),
    leadership: V("Vezetés: tudsz csoportot szervezni, irányt mutatni, és jó kapcsolatot tartani a csapattal.", "A vezetői szerep kevésbé természetes számodra."),
    forgiveness: V("Megbocsátás: el tudod engedni a sérelmeket, és adsz második esélyt.", "A megbocsátás nehéz: a sérelmek sokáig veled maradnak. Ez sokszor a Büntető készenlét vagy a Bizalmatlanság sémával függ össze."),
    humility: V("Alázat: nem keresed a reflektorfényt, az eredményeid magukért beszélnek.", "Az alázat kevésbé jellemző; fontos számodra, hogy az eredményeidet lássák."),
    prudence: V("Óvatosság: körültekintően döntesz, kerülöd a felesleges kockázatot.", "Az óvatosság kevésbé jellemző; spontánabban, kockázatvállalóbban döntesz."),
    self_regulation: V("Önszabályozás: uralod az impulzusaidat, érzelmeidet és szokásaidat.", "Az önszabályozás kevésbé természetes erősség – ez a VIA-ban az egyik leggyakoribb alacsony erősség. Külső struktúra és apró, befejezhető lépések segítenek."),
    beauty: V("A szépség és kiválóság értékelése: mélyen megérint a természet, a művészet, a kiváló teljesítmény.", "A szépség és kiválóság csodálata kevésbé meghatározó élmény számodra."),
    gratitude: V("Hála: észreveszed és értékeled a jó dolgokat, és kifejezed a köszönetedet.", "A hála kevésbé természetes; a figyelmed könnyebben megy a hiányokra. A hála gyakorolható, és erősen összefügg a jólléttel."),
    hope: V("Remény és optimizmus: a jövőben a lehetőséget látod, és dolgozol érte.", "A remény jelenleg kevésbé erős; a jövő bizonytalannak vagy nehéznek tűnhet. Ha ez tartós, érdemes figyelni a hangulatodra."),
    humor: V("Humor: könnyedséget hozol, megnevetteted az embereket, és a nehéz helyzetekben is meglátod a vicceset.", "A humor kevésbé jellemző eszközöd; komolyabban közelíted meg a dolgokat."),
    spirituality: V("Spiritualitás és értelemkeresés: van egy nagyobb keret vagy cél, amely értelmet ad az életednek.", "Az értelemkeresés vagy spiritualitás kevésbé hangsúlyos a mindennapjaidban.")
  },
  gyoker: [
    "A karaktererősségek részben temperamentumból, részben a családi és kulturális értékekből, részben az élettapasztalatokból alakulnak ki. Amit gyerekként díjaztak (kitartás, kedvesség, kreativitás), az gyakran megerősödik; amit nem vettek észre, az háttérben maradhat.",
    "Az erősségek kifejezése a környezettől is függ: egy munkahely vagy kapcsolat felerősítheti vagy elnémíthatja őket. Az alacsony erősség néha csak azt jelzi, hogy jelenleg nincs tere."
  ],
  mindennap: [
    "Ha a munkád és a kapcsolataid lehetővé teszik a szignatúra-erősségeid használatát, az energiát ad és értelmet hoz. Ha hosszú ideig olyan szerepben vagy, ami a legalacsonyabb erősségeidre épít, az kimerít.",
    "Párkapcsolatban az erősségek kiegészíthetik egymást – vagy súrlódást okozhatnak (pl. kíváncsiság vs. óvatosság). A partner erősségeinek tudatos elismerése az egyik legegyszerűbb kapcsolatjavító gyakorlat."
  ],
  lepesek: [
    "<strong>Szignatúra-erősség gyakorlat</strong> (Seligman, empirikusan vizsgált): egy hétig minden nap használd valamelyik top erősségedet egy új módon, és írd le, milyen volt.",
    "<strong>Munka-illesztés.</strong> Nézd meg, a munkádban hol használod a top erősségeidet, és hol lehetne többet (job crafting).",
    "<strong>Erősségekkel a nehézségek ellen.</strong> Egy problémánál kérdezd meg: hogyan tudnám a top erősségemmel megközelíteni?",
    "<strong>Ne a gyengeségeket javítgasd.</strong> Az alsó erősségeknél elég az „elég jó” szint, különösen ha valaki más kiegészít.",
    "<strong>Partneri gyakorlat.</strong> Mondd el a partnerednek, melyik erősségét látod és értékeled – és miért."
  ],
  kerdesek: [
    "Melyik top erősségedet használod a legkevésbé a mostani életedben?",
    "Mikor érezted magad igazán önmagadnak – melyik erősséged volt jelen?",
    "Melyik alacsony erősséged hiányzik a legjobban – és ki tudna ebben kiegészíteni?"
  ]
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
