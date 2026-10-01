/* Mélyelemzés: cselekves.html — Schwartz PVQ-21, Négy tendencia, Cselekvési módok, MEQ */
(function(D){

var PV = function(hi, lo){ return { hi: hi, mid: "Közepesen fontos érték számodra: jelen van a döntéseidben, de nem ez vezérel.", lo: lo }; };
D.pvq = {
  cim: "Az értékrended mélyebben",
  bevezeto: [
    "Shalom Schwartz értékelmélete a kultúrákon átívelően legjobban kutatott értékmodell. Tíz alapértéket különít el, amelyek egy körön helyezkednek el: a szomszédos értékek összeférnek, a szemköztiek feszültségben állnak egymással. A kör négy nagy tengelye: <strong>nyitottság a változásra</strong> (önirányítás, stimuláció) szemben a <strong>megőrzéssel</strong> (biztonság, konformitás, hagyomány), és <strong>önérvényesítés</strong> (teljesítmény, hatalom) szemben az <strong>önmeghaladással</strong> (jóindulat, univerzalizmus). A hedonizmus a nyitottság és az önérvényesítés között áll.",
    "Az eredmény <strong>relatív</strong>: a pontszámok a saját átlagodhoz vannak igazítva, vagyis azt mutatják, mi fontosabb számodra a többi értékedhez képest – nem azt, hogy valami „fontos” vagy „nem fontos” általában. Az értékek a döntések mögötti mély motivációk: ha az életed összhangban van velük, értelmet és elégedettséget élsz meg; ha ütköznek, belső feszültséget."
  ],
  profil: function(r, lv){
    var out = [];
    if (lv.SD === 'hi' && lv.CO === 'hi') out.push("<strong>Feszültség: önirányítás és konformitás egyszerre magas.</strong> Egyszerre fontos a saját utad és az, hogy megfelelj mások elvárásainak. Ez gyakran belső vívódást okoz a fontos döntéseknél.");
    if (lv.AC === 'hi' && lv.BE === 'hi') out.push("<strong>Feszültség: teljesítmény és jóindulat egyszerre magas.</strong> Fontos a siker és a közeli emberekről való gondoskodás – a kettő időben és energiában gyakran versenyez.");
    if (lv.PO === 'hi' && lv.UN === 'hi') out.push("<strong>Feszültség: hatalom és univerzalizmus egyszerre magas.</strong> Fontos a befolyás és a társadalmi igazságosság is. Ez lehet erő is: a befolyást a közjó érdekében használni.");
    if (lv.ST === 'hi' && lv.SE === 'hi') out.push("<strong>Feszültség: stimuláció és biztonság egyszerre magas.</strong> Vágysz az újdonságra és a kiszámíthatóságra is; ez gyakran ingadozásban jelenik meg a kaland és a visszahúzódás között.");
    return out;
  },
  skalak: {
    SD: PV("Az <strong>önirányítás</strong> kiemelt: fontos a független gondolkodás, a saját döntés, a kreativitás és a szabadság. Olyan helyzetben, ahol mások mondják meg, mit csinálj, hamar fullasztónak érzed.", "Az önirányítás kevésbé hangsúlyos: a függetlenség helyett más értékek (biztonság, közösség, teljesítmény) fontosabbak."),
    ST: PV("A <strong>stimuláció</strong> kiemelt: izgalom, újdonság, kihívás, változatosság. A rutin kimerít, az új élmények feltöltenek.", "A stimuláció kevésbé fontos: a nyugalom, a kiszámíthatóság vonzóbb az izgalomnál."),
    HE: PV("A <strong>hedonizmus</strong> kiemelt: fontos az élvezet, az öröm, a kényelem, a jó élet élvezete.", "A hedonizmus kevésbé fontos: az élvezet nem központi motivációd, gyakran háttérbe helyezed a kötelességek vagy mások mögé."),
    AC: PV("A <strong>teljesítmény</strong> kiemelt: fontos a siker, a kompetencia, a társadalmi elismerés a teljesítményért.", "A teljesítmény kevésbé fontos érték: a siker nem a fő motivációd."),
    PO: PV("A <strong>hatalom</strong> kiemelt: fontos a társadalmi státusz, a befolyás, az erőforrások feletti kontroll.", "A hatalom kevésbé fontos: a státusz és a befolyás nem vonz különösebben."),
    SE: PV("A <strong>biztonság</strong> kiemelt: fontos a stabilitás, a rend, a saját és a család biztonsága, a kiszámíthatóság.", "A biztonság kevésbé fontos: a kiszámíthatóság helyett kockázatot és változást is vállalsz."),
    CO: PV("A <strong>konformitás</strong> kiemelt: fontos, hogy ne sérts meg másokat és ne szegd meg a normákat; az önfegyelem és az udvariasság értékes.", "A konformitás kevésbé fontos: nem zavar különösebben, ha eltérsz a normáktól."),
    TR: PV("A <strong>hagyomány</strong> kiemelt: fontos a kulturális vagy vallási hagyományok tisztelete, a szerénység, a gyökerek.", "A hagyomány kevésbé fontos: a megszokott formák helyett a saját utadat keresed."),
    BE: PV("A <strong>jóindulat</strong> kiemelt: fontos a közeli emberek jólléte, a hűség, a segítőkészség, a megbízhatóság.", "A jóindulat a többi értékedhez képest kevésbé hangsúlyos: más motivációk erősebben vezetnek."),
    UN: PV("Az <strong>univerzalizmus</strong> kiemelt: fontos az igazságosság, az egyenlőség, a tolerancia, a természet védelme – mindenki jólléte, nem csak a közeli embereké.", "Az univerzalizmus kevésbé hangsúlyos: a figyelmed inkább a közeli körödön van, mint a tágabb közösségen.")
  },
  gyoker: [
    "Az értékek a családi neveltetésből, a kultúrából, a vallásból, a társadalmi helyzetből és a személyes tapasztalatokból alakulnak ki. Ami a gyerekkorban hiányzott, az gyakran felnőttkori értékké válik (pl. bizonytalanságból a biztonság), és ami túl sok volt, az ellen lázadás születhet (pl. merev szabályokból az önirányítás).",
    "Az értékek az életkorral is változnak: általában nő a hagyomány, a konformitás és a biztonság fontossága, és csökken a stimulációé és a hedonizmusé."
  ],
  mindennap: [
    "Az értékek a döntéseidben látszanak: munkaválasztás, párválasztás, hogyan töltöd a szabadidődet, mire költesz. A belső elégedetlenség gyakran abból fakad, hogy az életed egy másik értékrend szerint épült (szülők, partner, munkahely elvárásai), mint ami valóban a tiéd.",
    "Párkapcsolatban az értékkülönbségek a legmélyebb és legnehezebben feloldható konfliktusok forrásai; nem a viselkedésről, hanem arról szólnak, mi a fontos az életben."
  ],
  lepesek: [
    "<strong>Érték–élet összevetés.</strong> Nézd meg a három legfontosabb értékedet, és kérdezd meg: mennyi időt és energiát fordítok rájuk egy átlagos héten?",
    "<strong>Döntési mérce.</strong> Egy fontos döntésnél kérdezd meg: melyik lehetőség illik jobban a top értékeimhez?",
    "<strong>Belső feszültségek felismerése.</strong> Ha két fontos értéked ütközik, ne válassz automatikusan; tudatosan döntsd el, melyik helyzetben melyik fontosabb.",
    "<strong>Saját vs. örökölt értékek.</strong> Melyik érték a tiéd, és melyiket „kaptad”? Érdemes megtartani, ami a tiéd, és elengedni, ami nem.",
    "<strong>Párban.</strong> Hasonlítsátok össze az értékrendeteket: az eltérések megértése sok konfliktust megelőz."
  ],
  kerdesek: [
    "Ha csak egy értéket tarthatnál meg, melyik lenne az?",
    "Melyik értéked nem kap elég teret a mostani életedben?",
    "Melyik értéket örökölted a szüleidtől – és vállalod-e ma is?"
  ]
};

D.ft = {
  cim: "A tendenciád mélyebben",
  bevezeto: [
    "Gretchen Rubin Négy tendencia modellje azt írja le, hogyan reagálsz az <strong>elvárásokra</strong>: a <strong>külső</strong> elvárásokra (határidő, kérés, mások igényei) és a <strong>belső</strong> elvárásokra (saját fogadalom, újévi elhatározás, edzésterv). A <strong>Megfelelő</strong> (Upholder) mindkettőnek könnyen eleget tesz; a <strong>Kérdező</strong> (Questioner) csak akkor, ha érti és elfogadja az okát; a <strong>Kötelességtudó</strong> (Obliger) a külső elvárásoknak könnyen megfelel, a belsőknek nehezen; a <strong>Lázadó</strong> (Rebel) mindkettőnek ellenáll, és akkor cselekszik, ha ő maga akarja.",
    "A modell gyakorlati értéke abban van, hogy megmutatja, <strong>milyen struktúra működik nálad</strong>. Sok szokásváltozási kudarc abból fakad, hogy valaki egy másik tendenciára épülő módszert próbál: egy Kötelességtudónak az egyedül tartott fogadalom nem működik, egy Lázadónak a szigorú terv kifejezetten ellenállást kelt. (A modell népszerű, de kevéssé validált; önismereti keretként hasznos.)"
  ],
  profil: function(r){
    var h = String(r.h || '');
    if (/Megfelel|Upholder/i.test(h)) return ["<strong>Megfelelő:</strong> a külső és a belső elvárásoknak is könnyen eleget teszel. Szereted a terveket, a listákat, a szabályokat, és tartod magad hozzájuk. Erősség a megbízhatóság és az önfegyelem; kockázat a merevség, a szabályokhoz való ragaszkodás akkor is, ha már nem szolgálnak, és a nehézség, ha valami „váratlanul” változik. Nálad a tervezés és a napirend természetes erőforrás."];
    if (/Kérdez|Questioner/i.test(h)) return ["<strong>Kérdező:</strong> csak azt teszed meg, aminek érted és elfogadod az értelmét – legyen az külső vagy belső elvárás. Minden elvárásból belsőt csinálsz. Erősség a kritikus gondolkodás és a hatékonyság; kockázat az elemzési paralízis (soha nincs elég információ) és mások frusztrációja a sok kérdés miatt. Nálad a „miért” megértése a motiváció kulcsa."];
    if (/Kötelesség|Obliger/i.test(h)) return ["<strong>Kötelességtudó:</strong> a külső elvárásoknak (határidők, mások kérései) könnyen megfelelsz, a saját fogadalmaidnak viszont nehezen. Ez a leggyakoribb tendencia. Erősség a megbízhatóság és a csapatmunka; kockázat a kiégés és az „Obliger-lázadás”: amikor a túl sok külső elvárás után hirtelen mindent eldobsz. Nálad a <strong>külső elszámoltathatóság</strong> a kulcs: társ, coach, nyilvános vállalás, határidő."];
    if (/Lázad|Rebel/i.test(h)) return ["<strong>Lázadó:</strong> mind a külső, mind a belső elvárásoknak ellenállsz; akkor cselekszel, ha te magad akarod, a saját módodon. Ez a legritkább tendencia. Erősség az autenticitás, a spontaneitás és a szabadság; kockázat, hogy a saját céljaidnak is ellenállsz, ha „kötelezővé” válnak. Nálad a <strong>választás és az identitás</strong> a kulcs: „olyan ember vagyok, aki…”, nem „meg kell csinálnom”."];
    return [];
  },
  skalak: {
    U: { hi: "Erős a Megfelelő tendencia: tartod magad a tervekhez és a szabályokhoz.", mid: "A Megfelelő tendencia részben jelen van.", lo: "A Megfelelő tendencia gyenge: a tervek és szabályok önmagukban nem tartanak meg." },
    Q: { hi: "Erős a Kérdező tendencia: az indoklás nélküli elvárásokat nehezen fogadod el.", mid: "A Kérdező tendencia részben jelen van.", lo: "A Kérdező tendencia gyenge: az elvárásokat kérdés nélkül is elfogadod vagy elutasítod." },
    O: { hi: "Erős a Kötelességtudó tendencia: másoknak könnyebben teljesítesz, mint magadnak.", mid: "A Kötelességtudó tendencia részben jelen van.", lo: "A Kötelességtudó tendencia gyenge: mások elvárásai nem motiválnak különösebben." },
    R: { hi: "Erős a Lázadó tendencia: az elvárás (akár a sajátod is) ellenállást kelt.", mid: "A Lázadó tendencia részben jelen van.", lo: "A Lázadó tendencia gyenge: az elvárások nem keltenek benned ellenállást." }
  },
  gyoker: [
    "Rubin szerint a tendencia nagyrészt veleszületett, és élethosszig viszonylag stabil, bár a kifejeződése érhet. A neveltetés felerősítheti: egy szigorú, kontrolláló környezet a Lázadó vonásokat élezheti ki, egy szeretetteljes, de sok elvárással teli környezet a Kötelességtudót.",
    "A tendencia összefügg a személyiséggel is (lelkiismeretesség, barátságosság), és az ADHD-hoz hasonló, dopaminérzékeny működés gyakran a Lázadó vagy a Kérdező jellegű ellenállással jár együtt."
  ],
  mindennap: [
    "A tendencia meghatározza, hogyan működsz a munkában (határidők, feladatok), a szokásaidban (edzés, étkezés, alvás), a kapcsolataidban (elvárások, kérések) és az egészségedben (orvosi tanácsok betartása).",
    "Kapcsolatban gyakori súrlódás: a Megfelelő a terv betartását, a Lázadó a szabadságot, a Kérdező az indoklást, a Kötelességtudó a támogatást igényli – és mindegyik másképp hallja ugyanazt a kérést."
  ],
  lepesek: [
    "<strong>Megfelelő:</strong> használd a terveket és listákat, de építs be rugalmasságot is; kérdezd meg, egy szabály még szolgál-e.",
    "<strong>Kérdező:</strong> szerezz be indoklást minden új szokáshoz; szabj határidőt a döntéseknek, hogy ne ragadj elemzésben.",
    "<strong>Kötelességtudó:</strong> építs külső elszámoltathatóságot (edzőtárs, közös munka, nyilvános vállalás); figyelj a kiégés jeleire, és mondj nemet időben.",
    "<strong>Lázadó:</strong> kötelesség helyett választás és identitás: „olyan ember vagyok, aki mozog”. Adj magadnak több lehetőséget, és válassz szabadon közülük.",
    "<strong>A környezeted tendenciái.</strong> Ha tudod, a partnered vagy kollégád melyik tendenciájú, a kéréseidet ahhoz igazíthatod."
  ],
  kerdesek: [
    "Melyik fogadalmadat tartottad be a legkönnyebben – és mi segített?",
    "Mi történik benned, amikor valaki megmondja, mit csinálj?",
    "Milyen külső struktúra segítene most a legfontosabb célodban?"
  ]
};

var KZ = { hi: "Kezdeményező", mid: "Alkalmazkodó", lo: "Ellenálló" };
D.kolbe = {
  cim: "A cselekvési stílusod mélyebben",
  szint: KZ,
  bevezeto: [
    "Kathy Kolbe modellje a <strong>konatív</strong> működést méri: nem azt, mit tudsz (kognitív) vagy mit érzel (affektív), hanem azt, <strong>hogyan cselekszel ösztönösen</strong>, amikor szabadon dönthetsz. Négy cselekvési mód van: <strong>Tényfeltáró</strong> (információgyűjtés, részletek), <strong>Rendszerező</strong> (struktúra, sorrend, tervezés), <strong>Gyorsindító</strong> (kísérletezés, improvizáció, kockázatvállalás) és <strong>Megvalósító</strong> (kézzelfogható, fizikai alkotás).",
    "Minden módban három zóna létezik: <strong>kezdeményező</strong> (7–10: ezzel indítasz), <strong>alkalmazkodó</strong> (4–6: rugalmasan használod) és <strong>ellenálló</strong> (1–3: ösztönösen kerülöd – ez is erősség, mert megvéd attól, ami nem a tiéd). Nincs jó vagy rossz profil: a lényeg, hogy olyan feladatokban és környezetben dolgozz, ami illik a természetes cselekvési stílusodhoz. (A teszt itt saját itemekkel méri a Kolbe-modellt, nem a hivatalos Kolbe A Index.)"
  ],
  skalak: {
    ff: { cut: [3, 7], hi: "<strong>Kezdeményező Tényfeltáró:</strong> ösztönösen információt gyűjtesz, kutatsz, részletezel, mielőtt cselekszel. Erősség a pontosság és az alaposság; kockázat az elemzési paralízis.", mid: "<strong>Alkalmazkodó Tényfeltáró:</strong> annyi információt gyűjtesz, amennyi kell, nem többet.", lo: "<strong>Ellenálló Tényfeltáró:</strong> ösztönösen kerülöd a túl sok részletet és kutatást; a lényeget keresed, egyszerűsítesz. Erősség a gyorsaság; kockázat, hogy fontos részletek elsikkadnak." },
    ft: { cut: [3, 7], hi: "<strong>Kezdeményező Rendszerező:</strong> ösztönösen rendszereket, terveket, sorrendet építesz. Erősség a szervezettség; kockázat a merevség.", mid: "<strong>Alkalmazkodó Rendszerező:</strong> használsz struktúrát, de rugalmasan.", lo: "<strong>Ellenálló Rendszerező:</strong> ösztönösen kerülöd a merev rendszereket és terveket; rugalmasan, helyzet szerint dolgozol. Erősség az alkalmazkodóképesség; kockázat a rendetlenség és a befejezetlenség – ilyenkor külső struktúra (eszköz, társ) segít." },
    qs: { cut: [3, 7], hi: "<strong>Kezdeményező Gyorsindító:</strong> ösztönösen kísérletezel, improvizálsz, kockáztatsz, gyorsan indulsz. Erősség az innováció és az energia; kockázat a befejezetlenség és a túl sok egyidejű projekt.", mid: "<strong>Alkalmazkodó Gyorsindító:</strong> tudsz kísérletezni és tudsz stabil maradni is.", lo: "<strong>Ellenálló Gyorsindító:</strong> ösztönösen kerülöd a felesleges kockázatot és a hirtelen változást; stabilitást teremtesz. Erősség a megbízhatóság; kockázat a túl lassú alkalmazkodás." },
    im: { cut: [3, 7], hi: "<strong>Kezdeményező Megvalósító:</strong> ösztönösen kézzelfogható dolgokat alkotsz, építesz, javítasz; a térben és anyagban gondolkodsz.", mid: "<strong>Alkalmazkodó Megvalósító:</strong> szükség esetén szívesen dolgozol kézzel is.", lo: "<strong>Ellenálló Megvalósító:</strong> ösztönösen az absztrakt, digitális, gondolati munkát választod a fizikai helyett." }
  },
  gyoker: [
    "Kolbe szerint a konatív stílus veleszületett, és a felnőttkorban stabil: nem változik a tanulással vagy az életkorral, csak a kifejeződése. Ami változik, az a környezet: ha olyan helyen dolgozol, ami ellentétes a stílusoddal (pl. egy Gyorsindítónak merev, szabályozott munka), az <strong>konatív feszültséget</strong> és kimerülést okoz.",
    "Gyerekkorban gyakran a környezet „nevelte” a gyereket egy másik stílusra (pl. „légy alaposabb”, „ne kapkodj”), ami bűntudatot vagy hiányérzetet hagyhat a természetes működés iránt."
  ],
  mindennap: [
    "A konatív stílus megmutatja, milyen típusú feladatok töltenek fel és melyek merítenek le, függetlenül attól, hogy mennyire vagy képes elvégezni őket. Ha a munkád nagyrészt az ellenálló zónádra épít, akkor is kimerülsz, ha jól csinálod.",
    "Csapatban és párkapcsolatban a különböző stílusok kiegészítik egymást (pl. egy Gyorsindító és egy Rendszerező), de súrlódást is okozhatnak („miért kell mindent megtervezni?” – „miért ugrasz bele mindenbe?”)."
  ],
  lepesek: [
    "<strong>Feladat–stílus illesztés.</strong> Nézd meg a heti feladataidat: melyik épít a kezdeményező zónádra, és melyik az ellenállóra?",
    "<strong>Delegálás.</strong> Az ellenálló zónád feladatait, ahol lehet, add át olyannak, akinek az a kezdeményező zónája.",
    "<strong>Eszközök az ellenálló zónához.</strong> Ahol nem tudod delegálni, használj eszközöket (sablonok, checklisták, automatizálás).",
    "<strong>Ne harcolj a stílusod ellen.</strong> A „légy rendszerezettebb” típusú önvád helyett építs a természetes módodra, és tegyél mellé külső támogatást.",
    "<strong>Csapatösszeállítás.</strong> Egy projektnél figyelj arra, hogy mind a négy mód kezdeményezője jelen legyen."
  ],
  kerdesek: [
    "Milyen feladat után érzed magad a legenergikusabbnak?",
    "Melyik feladatot halogatod legtovább – és melyik módra épít?",
    "Ki egészít ki téged a legjobban a munkában vagy a kapcsolatodban?"
  ]
};

D.meq = {
  cim: "A kronotípusod mélyebben",
  szint: { hi: "Reggeli típus", mid: "Köztes típus", lo: "Esti típus" },
  bevezeto: [
    "A MEQ (Horne–Östberg) a <strong>kronotípust</strong> méri: azt, hogy a belső biológiai órád szerint mikor vagy a legéberebb, a legproduktívabb, és mikor szeretnél aludni. A kronotípus nem szokás vagy akaraterő kérdése, hanem a cirkadián ritmus egyéni különbségeiből fakad – genetikailag erősen meghatározott, és az életkorral változik (serdülőkorban esti, idősebb korban reggeli irányba tolódik).",
    "A kronotípus határozza meg az optimális időzítést a munkához, a tanuláshoz, a mozgáshoz és az alváshoz. Ha az életed ritmusa (munkakezdés, társas élet) eltér a belső órádtól, <strong>társas jet-lag</strong> alakul ki: krónikus alváshiány, fáradtság, gyengébb hangulat és koncentráció."
  ],
  skalak: {
    total: { cut: [41, 59], hi: "A pontszámod a <strong>reggeli típus</strong> felé mutat: korán ébredsz, délelőtt vagy a legélesebb, este korán elfáradsz. A reggeli munkakezdéshez igazodó társadalomban ez előny; a kockázat az esti társas élet és a késői programok nehézsége.", mid: "A pontszámod a <strong>köztes típus</strong> tartományban van: viszonylag rugalmasan alkalmazkodsz a különböző napirendekhez. A csúcsidőd általában a délelőtt második felére és a kora délutánra esik.", lo: "A pontszámod az <strong>esti típus</strong> felé mutat: későn fáradsz el, a késő délután és az este a legproduktívabb időszakod, és a korai kelés nehéz. Ez nem lustaság, hanem biológia; a korai munkakezdés viszont krónikus alváshiányt okozhat.", tipLo: "A reggeli fényexpozíció (10–20 perc természetes fény ébredés után) és az esti fénycsökkentés (képernyő, erős lámpa) segít előrébb hozni a belső órát. Ahol lehet, a mély fókuszt igénylő munkát tedd a délutáni–esti csúcsidődre.", tipHi: "Védd a reggeli csúcsidődet a legfontosabb munkára, és ne töltsd e-mailekkel. Az esti programoknál tervezz rövidebb jelenlétet." }
  },
  gyoker: [
    "A kronotípus nagyrészt genetikailag meghatározott (több „óragén” variánsa befolyásolja), és a belső óra hossza egyénenként eltér. A környezet – fény, napirend, munka, gyerekek – módosíthatja, de alapvetően nem írja át.",
    "Az életkor erősen hat: a serdülők és fiatal felnőttek kronotípusa későbbre tolódik, kb. 20 éves kor körül a legkésőbbi, utána fokozatosan korábbra kerül."
  ],
  mindennap: [
    "A kronotípus befolyásolja, mikor vagy a legjobb a gondolkodást, a kreativitást vagy a fizikai teljesítményt igénylő feladatokban, és mikor vagy hajlamosabb hibázni, impulzív döntést hozni vagy rosszabb hangulatban lenni.",
    "Párkapcsolatban az eltérő kronotípus (egy reggeli és egy esti típus) a közös idő, a szexualitás és az alvás időzítésében okozhat súrlódást."
  ],
  lepesek: [
    "<strong>Csúcsidő-tervezés.</strong> A legnehezebb, legfontosabb feladatot tedd a természetes csúcsidődre.",
    "<strong>Fény.</strong> Reggeli természetes fény és esti fénycsökkentés – a belső óra legerősebb szabályozója.",
    "<strong>Rendszeresség.</strong> Hétvégén se tolódjon el az ébredés két óránál többel; ez csökkenti a társas jet-laget.",
    "<strong>Koffein és étkezés időzítése.</strong> A késői koffein és a késő esti nagy étkezés a belső órát is tolja.",
    "<strong>Ha teheted, igazítsd a környezetet.</strong> Rugalmas munkaidő, a megbeszélések időzítése – a kronotípushoz igazított napirend mérhetően javítja a teljesítményt és a jóllétet."
  ],
  kerdesek: [
    "Mikor éreztél utoljára igazi, mély fókuszt – a nap melyik szakában?",
    "Mennyi a különbség a hétköznapi és a hétvégi ébredésed között?",
    "Melyik fontos tevékenységed esik most rossz időpontra?"
  ]
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
