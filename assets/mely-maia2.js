/* Mélyelemzés: maia2.html — MAIA-2 (interocepció) */
(function(D){

D.maia2 = {
  jo: "hi",
  cim: "A testtudatosságod mélyebben",
  bevezeto: [
    "Az <strong>interocepció</strong> a test belső jelzéseinek észlelése és értelmezése: a szívverés, a légzés, az éhség, a feszültség, a fáradtság, az érzelmek testi oldala. A MAIA-2 nem azt méri, mennyire pontosan érzékeled a szívverésedet, hanem azt, <strong>hogyan viszonyulsz</strong> a testi jelzéseidhez: észreveszed-e őket, nem terelődik-e el a figyelmed, nem aggódsz-e miattuk túlzottan, tudsz-e rájuk figyelni, összekapcsolod-e őket az érzelmeiddel, tudod-e őket a szabályozásra használni, és bízol-e bennük.",
    "Az interocepció az érzelemszabályozás alapja: az érzelmek a testben kezdődnek, és aki jól érzékeli a test jelzéseit, az korábban észreveszi a feszültséget, a fáradtságot vagy az érzelmi változást – és időben tud reagálni. Gyenge interocepció gyakran kíséri a szorongást, a depressziót, az alexitímiát, az evési nehézségeket és a krónikus stresszt; jó hír, hogy a testtudatosság gyakorlással erősödik."
  ],
  skalak: {
    noticing: { hi: "Jól <strong>észreveszed</strong> a testi érzeteket: a kellemeseket, a kellemetleneket és a semlegeseket is.", mid: "Időnként észreveszed a testi érzeteket, főleg ha erősek.", lo: "Kevéssé veszed észre a testi érzeteidet: gyakran csak akkor, amikor már nagyon erősek (fájdalom, kimerülés).", tipLo: "Napi 2–3 rövid testpásztázás (body scan): fejtől a lábig, mit érzek most a testemben?" },
    "not-distract": { hi: "Nem tereled el a figyelmedet a kellemetlen testi érzetekről: tudsz velük maradni.", mid: "Időnként elterelsz, ha valami kellemetlen.", lo: "Hajlamos vagy elterelni a figyelmet a kellemetlen testi érzetekről (figyelmen kívül hagyás, „túltolás”, elterelés). Ez rövid távon segít, hosszú távon viszont a jelzések elhanyagolásához vezethet.", tipLo: "Ha kellemetlen érzetet veszel észre, maradj vele 30 másodpercig kíváncsian, mielőtt cselekszel." },
    "not-worry": { hi: "Nem aggódsz túlzottan a kellemetlen testi érzetek miatt: nem katasztrofizálsz.", mid: "Időnként aggódsz a testi érzetek miatt.", lo: "Hajlamos vagy aggódni vagy megijedni a kellemetlen testi érzetektől. Ez gyakran az egészségszorongással vagy a pánikkal függ össze.", tipLo: "A testi érzetet nevezd meg semlegesen („feszülés a mellkasban”), ítélet és jóslás nélkül. A félelem gyakran nem az érzetből, hanem az értelmezéséből jön." },
    attention: { hi: "Jól tudod <strong>szabályozni a figyelmedet</strong> a test felé: tudsz rajta tartani, irányítani.", mid: "Időnként tudsz a testedre figyelni, de könnyen elkalandozik a figyelmed.", lo: "Nehéz a testedre irányítani és rajta tartani a figyelmet.", tipLo: "Légzésfigyelés: napi 5 perc, a figyelmet a légzésen tartva; amikor elkalandozik, gyengéden visszahozva." },
    "emotional-aware": { hi: "Erős az <strong>érzelmi tudatosság</strong>: tudod, hogy az érzelmeid hogyan jelennek meg a testedben.", mid: "Részben kapcsolod össze a testi érzeteket az érzelmekkel.", lo: "Kevéssé kapcsolod össze a testi érzeteket az érzelmekkel. Ez gyakran az alexitímiával (TAS-20) együtt jár.", tipLo: "Egy erős érzelem idején kérdezd meg: hol érzem ezt a testemben? Milyen a minősége (feszült, nehéz, forró, üres)?" },
    "self-reg": { hi: "Jól tudod <strong>a testi érzeteket a szabályozásra használni</strong>: a légzésre vagy a testre figyelve meg tudsz nyugodni.", mid: "Időnként a testre figyelve meg tudsz nyugodni.", lo: "Nehéz a testi érzeteket a megnyugvásra használni.", tipLo: "Tanulj meg 1–2 test alapú megnyugtató technikát (lassú kilégzés, kéz a mellkason, talpak érzése), és gyakorold nyugodt állapotban is." },
    "body-listen": { hi: "<strong>Hallgatsz a testedre</strong>: a testi jelzésekből információt nyersz a döntéseidhez és az érzelmeidhez.", mid: "Időnként hallgatsz a testedre.", lo: "Ritkán hallgatsz a testedre: a jelzéseit nem használod információként. Ez a MAIA-2 egyik leggyakrabban alacsony skálája.", tipLo: "Egy döntés előtt figyeld meg: mit mond a tested a két lehetőségről? Szűkülés vagy tágulás, feszülés vagy könnyedség?" },
    trusting: { hi: "<strong>Bízol a testedben</strong>: biztonságos helynek éled meg, és bízol a jelzéseiben.", mid: "Részben bízol a testedben.", lo: "Kevéssé bízol a testedben: nem érzed biztonságos helynek, vagy nem hiszel a jelzéseinek. Ez gyakran a trauma, a betegség vagy a testtel kapcsolatos negatív tapasztalatok nyoma.", tipLo: "Kezdj biztonságos, kellemes testi tapasztalatokkal (meleg zuhany, séta, nyújtás), és figyeld meg, mi esik jól. A bizalom kis lépésekből épül." }
  },
  gyoker: [
    "Az interocepció a csecsemőkorban, a gondozóval való kapcsolatban fejlődik: a szülő megnevezi és válaszol a csecsemő testi állapotaira („éhes vagy”, „fáradt vagy”), és ebből tanulja meg a gyerek értelmezni a saját jelzéseit. Ahol ez a tükrözés hiányzott, ott a test jelzései zavarosak maradhatnak.",
    "A trauma, a krónikus stressz, a testtel kapcsolatos negatív tapasztalatok (betegség, bántalmazás, testképpel kapcsolatos szégyen) gyakran a test jelzéseinek elkerüléséhez vagy félelméhez vezetnek. A teljesítményorientált kultúra is arra tanít, hogy figyelmen kívül hagyjuk a fáradtságot és a fájdalmat."
  ],
  mindennap: [
    "A gyenge interocepció gyakran kimerüléshez (nem veszed észre időben a fáradtságot), stresszhez (csak a robbanáskor veszed észre a feszültséget), evési nehézségekhez (az éhség és a jóllakottság jelei nem tiszták) és érzelmi zavarossághoz vezet.",
    "Az erős interocepció ezzel szemben korai figyelmeztető rendszer: időben jelzi, ha pihenésre, mozgásra, ételre vagy kapcsolódásra van szükséged."
  ],
  lepesek: [
    "<strong>Testpásztázás.</strong> Napi 5–10 perc body scan (pl. vezetett hanganyaggal).",
    "<strong>Mozgásos tudatosság.</strong> Jóga, tai chi, lassú séta figyelemmel – a mozgás közbeni testérzékelés.",
    "<strong>Légzés.</strong> A lassú, hosszú kilégzés a paraszimpatikus rendszert aktiválja, és egyben a testre irányítja a figyelmet.",
    "<strong>Test–érzelem összekapcsolás.</strong> Egy érzelem idején mindig kérdezd meg: hol érzem ezt?",
    "<strong>Szomatikus terápiák.</strong> Ha a testtel kapcsolatos bizalom alacsony, a szomatikus vagy testközpontú terápia (pl. Somatic Experiencing) segíthet."
  ],
  kerdesek: [
    "Mikor vetted észre utoljára időben a fáradtságot vagy a feszültséget – és mikor csak túl későn?",
    "Hol érzed a testedben a szorongást, a dühöt, a szomorúságot?",
    "Mennyire érzed biztonságos helynek a testedet?"
  ]
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
