/* Mélyelemzés: kotodes-melyterkep.html — Kötődési mélytérkép */
(function(D){

D.kotodes = {
  cim: "A kötődési térképed mélyebben",
  bevezeto: [
    "A kötődési mélytérkép az ECR-R két alapdimenzióját – <strong>szorongás</strong> és <strong>elkerülés</strong> – egészíti ki további területekkel, köztük a <strong>szerzett biztonsággal</strong>. A szorongás azt mutatja, mennyire figyel a rendszered a kapcsolat elvesztésének jeleire; az elkerülés azt, mennyire kényelmetlen a közelség és a függés; a szerzett biztonság pedig azt, mennyire tudtad a nehéz korai tapasztalatok ellenére (vagy után) felépíteni a biztonságos kötődés képességeit: a javítást, a bizalmat, az érzelmi megnyílást.",
    "A „szerzett biztonság” fogalma a kötődéskutatás egyik legreménykeltőbb eredménye: azok az emberek, akik bizonytalan kötődési háttérből jönnek, de feldolgozták és megértették a történetüket, felnőttként ugyanúgy biztonságosan kötődhetnek, és ugyanúgy biztonságot adhatnak a gyerekeiknek, mint akik eleve biztonságos háttérből jöttek. (Ez a mélytérkép saját, nem validált eszköz; az ECR-R-rel együtt érdemes olvasni.)"
  ],
  profil: function(r, lv){
    var out = [];
    if (r.h) out.push("<strong>A térkép szerinti mintád: " + r.h + ".</strong> Ez a jelenlegi működésed pillanatképe, nem végleges besorolás.");
    if (lv.earned === 'hi' && (lv.anxiety !== 'lo' || lv.avoidance !== 'lo')) out.push("<strong>Magas szerzett biztonság mellett még jelen van a szorongás vagy az elkerülés.</strong> Ez gyakori és jó jel: a régi minta még aktiválódik, de már vannak eszközeid a javításra. A munka itt nem a minta eltüntetése, hanem az, hogy a javítás egyre gyorsabb és természetesebb legyen.");
    if (lv.earned === 'lo' && (lv.anxiety === 'hi' || lv.avoidance === 'hi')) out.push("<strong>Erős szorongás vagy elkerülés, alacsony szerzett biztonság mellett.</strong> A régi minta még erősen vezet, és kevés belső eszköz van a javításra. Ez a legjobb kiindulópont egy célzott munkához: a biztonságos kapcsolatok (terápiás és személyes) itt hozzák a legnagyobb változást.");
    return out;
  },
  skalak: {
    anxiety: { jo: "lo", hi: "Erős a kötődési <strong>szorongás</strong>: a kapcsolat elvesztésének jeleire nagyon érzékeny vagy, a bizonytalanságot nehezen viseled, és a megnyugtatás iránti igényed erős.", mid: "A kötődési szorongás közepes: stresszben, távolságban, konfliktusban erősödik fel.", lo: "Kevés a kötődési szorongás: a kapcsolat stabilitásában általában bízol.", tipHi: "Tanuld meg a megnyugtatást belülről is: légzés, mozgás, barátok, napló – minél több forrás, annál kevésbé lesz a partner az egyetlen szabályozód." },
    avoidance: { jo: "lo", hi: "Erős a kötődési <strong>elkerülés</strong>: a közelség, a függés és az érzelmi megnyílás feszültséget kelt; az önállóság biztonságot ad.", mid: "Az elkerülés közepes: bizonyos helyzetekben (sebezhetőség, elköteleződés, konfliktus) visszahúzódsz.", lo: "Kevés az elkerülés: kényelmes számodra a közelség és a támaszkodás.", tipHi: "Gyakorolj apró sebezhetőséget: naponta egy érzés vagy kérés kimondása egy biztonságos embernek." },
    earned: { jo: "hi", hi: "Erős a <strong>szerzett biztonság</strong>: a nehézségek ellenére (vagy után) kialakultak benned a biztonságos kötődés képességei – a javítás, a bizalom, a reflexió a saját történetedre.", mid: "A szerzett biztonság részben kialakult: bizonyos helyzetekben működik, máshol még a régi minta vezet.", lo: "A szerzett biztonság még kevéssé alakult ki: a régi minták erősen vezetnek, és kevés belső eszköz van a javításra. Ez fejleszthető – a saját történet megértése és a biztonságos kapcsolatok a fő utak.", tipLo: "Írd le a kötődési történetedet: kik voltak a gondozóid, milyen volt velük, hogyan alkalmazkodtál. A koherens történet a szerzett biztonság egyik legerősebb előrejelzője." }
  },
  gyoker: [
    "A kötődési minta a korai gondozói kapcsolatokban formálódik: kiszámítható, meleg gondoskodás mellett biztonságos, kiszámíthatatlan mellett szorongó, elutasító mellett elkerülő, ijesztő mellett dezorganizált minta alakul ki. Ezek a gyerek számára mind <strong>ésszerű alkalmazkodások</strong> voltak.",
    "A szerzett biztonság a későbbi tapasztalatokból épül: egy biztonságos felnőtt (nagyszülő, tanár, mentor), egy jó párkapcsolat, egy terápiás kapcsolat, és mindenekelőtt a saját történet megértése és feldolgozása."
  ],
  mindennap: [
    "A kötődési minta leginkább a közeli kapcsolatokban látszik, és ott is a stressz pillanataiban: konfliktusban, távolságban, betegségben, nagy döntéseknél. A szorongó minta kapaszkodásban, megnyugtatás-keresésben, féltékenységben; az elkerülő minta visszahúzódásban, távolságtartásban, az érzések kerülésében jelenik meg.",
    "A szerzett biztonság abban látszik, hogy a régi minta aktiválódása után gyorsabban visszatalálsz: észreveszed, megnevezed, és tudsz javítani."
  ],
  fennmarad: "A kötődési minták önbeteljesítők: a szorongó kapaszkodás eltávolít, az elkerülő távolság elmagányosít, és mindkettő megerősíti a régi várakozást. A szerzett biztonság ezt a kört szakítja meg.",
  lepesek: [
    "<strong>Koherens történet.</strong> Írd le a kötődési történetedet: mi történt, hogyan alkalmazkodtál, mit hozol belőle ma.",
    "<strong>A ciklus felismerése.</strong> Mi indítja el a szorongást vagy a visszahúzódást? Mit csinálsz ilyenkor, és mit csinál a másik?",
    "<strong>Javítás gyakorlása.</strong> Egy konfliktus után kezdeményezd a visszatalálást: „sajnálom, hogy így reagáltam; szeretném megérteni, mi történt benned”.",
    "<strong>Biztonságos kapcsolatok.</strong> Tölts időt olyan emberekkel, akik mellett a régi félelem nem igazolódik.",
    "<strong>Terápia.</strong> Érzelemfókuszú pár- vagy egyéni terápia, sématerápia – a terápiás kapcsolat maga is korrigáló kötődési tapasztalat."
  ],
  kerdesek: [
    "Ki volt az a felnőtt a gyerekkorodban, aki mellett biztonságban érezted magad?",
    "Hogyan mesélnéd el a kötődési történetedet egy barátnak öt mondatban?",
    "Mi az első jel, hogy a régi minta bekapcsolt – és mi segít visszatalálni?"
  ]
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
