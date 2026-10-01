/* Mélyelemzés: attitudok.html — SSSS, NSSS, SAQ */
(function(D){

D.ssss = {
  cim: "A szexuális önképed mélyebben",
  bevezeto: [
    "A szexuális önséma (Andersen és munkatársai) azt méri, <strong>hogyan látod magad szexuális lényként</strong>: milyen tulajdonságokat tartasz a sajátodnak, amikor a szexualitásodra gondolsz. Ez a belső kép erősen befolyásolja, hogyan közeledsz, mit mersz kérni, mennyire éled meg örömként vagy szorongásként az intimitást, és hogyan reagálsz a visszautasításra.",
    "Három dimenzióját méri a teszt: a <strong>szenvedélyes-szerető</strong> oldalt (érzelmi melegség, romantika, odaadás), az <strong>erős-független</strong> oldalt (határozottság, magabiztosság, kezdeményezés) és a <strong>nyitott-direkt</strong> oldalt (nyitottság, kíváncsiság, közvetlen kommunikáció a szexualitásról). Az önséma nem rögzített: a tapasztalatok, a kapcsolatok és a tudatos munka formálják."
  ],
  jo: "hi",
  skalak: {
    PL: { hi: "Erősen éled meg magad <strong>szenvedélyes és szerető</strong> szexuális lényként: a szexualitás nálad szorosan összekapcsolódik az érzelmi közelséggel, a melegséggel és az odaadással.", mid: "A szenvedélyes-szerető oldalad jelen van, de nem domináns; a helyzettől és a kapcsolattól függ, mennyire éled meg.", lo: "Kevéssé éled meg magad szenvedélyes-szerető lényként. Ez gyakran nem az érzelmek hiányát jelenti, hanem azt, hogy a szexualitás és az érzelmi közelség nálad kevéssé kapcsolódik össze – vagy hogy az érzelmi megnyílás szexuális helyzetben nehéz.", tipLo: "Figyeld meg, mi történne, ha az érintésben több érzelem lenne: gyengédség, lassúság, szemkontaktus. Mi ijeszt meg ebben?" },
    PI: { hi: "Erős az <strong>erős-független</strong> önképed: magabiztosnak, határozottnak, kezdeményezőnek látod magad a szexualitásban.", mid: "Az erős-független oldalad közepes: bizonyos helyzetekben kezdeményezel és magabiztos vagy, máskor visszafogottabb.", lo: "Kevéssé látod magad erősnek és függetlennek a szexualitásban. Ez gyakran a kezdeményezés nehézségében, a visszautasítástól való félelemben vagy a teljesítményszorongásban jelenik meg.", tipLo: "Kezdj kis kezdeményezésekkel, és figyeld meg a reakciót. A magabiztosság nem előfeltétele a cselekvésnek, hanem következménye." },
    OD: { hi: "Erős a <strong>nyitott-direkt</strong> oldalad: kíváncsi vagy, nyitott az új élményekre, és közvetlenül tudsz beszélni a szexualitásról.", mid: "Részben nyitott vagy: bizonyos témákban könnyen, másokban nehezebben beszélsz a vágyaidról.", lo: "A nyitottság és a közvetlen kommunikáció nehéz számodra a szexualitásban. Ez gyakran a szégyennel, a neveltetéssel vagy a visszautasítástól való félelemmel függ össze.", tipLo: "Gyakorold a kimondást kis lépésekben: először írásban, majd egy mondatban („jólesik, amikor…”). A szexuális kommunikáció a szexuális elégedettség egyik legerősebb előrejelzője." }
  },
  gyoker: [
    "A szexuális önkép a gyerekkori és serdülőkori üzenetekből épül: hogyan beszéltek (vagy hallgattak) otthon a testről és a szexualitásról, milyen volt az első érdeklődés és az első tapasztalatok fogadtatása, milyen kulturális és vallási normák vettek körül. A szégyent, bűnt vagy veszélyt hangsúlyozó neveltetés gyakran gátolt, zárt önképet hagy maga után.",
    "Felnőttkorban a kapcsolati tapasztalatok formálják tovább: egy elfogadó, biztonságos partner mellett az önkép nyitottabbá válhat, egy kritikus vagy bántó kapcsolat után pedig beszűkülhet."
  ],
  mindennap: [
    "Az önkép befolyásolja, ki kezdeményez, mennyire tudsz élvezni, és hogyan reagálsz a visszautasításra. A gátolt önkép gyakran visszahúzódásban, szorongásban vagy a szexualitás „kötelességként” való megélésében jelenik meg; a nyitott, erős önkép inkább kíváncsiságban és könnyedségben.",
    "A kapcsolatban a két fél önképe találkozik: ha az egyik nyitott-direkt, a másik zárt, a különbség feszültséget, de fejlődési lehetőséget is hozhat."
  ],
  lepesek: [
    "<strong>Az önkép eredete.</strong> Írd le, milyen üzeneteket kaptál gyerekként a testről és a szexualitásról. Melyiket vállalnád ma is, és melyiket nem?",
    "<strong>Testtel való kapcsolat.</strong> Mozgás, tánc, érintés, testtudatosság – az önkép a testben is épül, nem csak gondolatokban.",
    "<strong>Kommunikáció.</strong> Kezdj el beszélni a vágyaidról és határaidról egy biztonságos partnerrel, kis lépésekben.",
    "<strong>Szégyen felismerése.</strong> Ha a szexualitással kapcsolatos gondolatok szégyent hoznak, figyeld meg, kinek a hangja szól benned.",
    "<strong>Szakember.</strong> Ha az önkép mögött negatív vagy bántó élmények állnak, a szexuálterápia vagy traumatudatos terápia segíthet."
  ],
  kerdesek: [
    "Milyen üzeneteket kaptál a szexualitásról gyerekként és serdülőként?",
    "Melyik oldaladat szeretnéd jobban megélni: a szenvedélyt, az erőt vagy a nyitottságot?",
    "Mi segít abban, hogy szexuális helyzetben biztonságban érezd magad?"
  ]
};

D.nsss = {
  jo: "hi",
  cim: "A szexuális elégedettséged mélyebben",
  bevezeto: [
    "Az NSSS a szexuális elégedettséget két irányból méri. Az <strong>ego-fókuszú</strong> elégedettség a saját élményedről szól: az izgalomról, az élvezetről, a jelenlétről, a saját reakcióidról. A <strong>partner- és aktivitásfókuszú</strong> elégedettség a partner viselkedéséről és a közös szexuális életről: a gyakoriságról, a változatosságról, a partner odafigyeléséről, a kölcsönösségről.",
    "A szexuális elégedettség nem azonos a szexuális funkcióval: lehet minden „működik”, mégis alacsony az elégedettség, és fordítva. Az elégedettség a legerősebben a <strong>kommunikációval</strong>, a <strong>kapcsolati minőséggel</strong> és az <strong>érzelmi biztonsággal</strong> függ össze – ezért gyakran a kapcsolat felől érdemes megközelíteni."
  ],
  profil: function(r, lv){
    if (lv.EGO === 'lo' && lv.PA !== 'lo') return ["<strong>A saját élményeddel kevésbé vagy elégedett, mint a partnerrel és a közös élettel.</strong> Ez gyakran a jelenlét, a teljesítménynyomás, az önkép vagy a saját igények kimondásának nehézségéről szól – nem a partnerről."];
    if (lv.PA === 'lo' && lv.EGO !== 'lo') return ["<strong>A partner és a közös szexuális élet felé alacsonyabb az elégedettséged, mint a saját élményed felé.</strong> Ez gyakran a kölcsönösség, a gyakoriság, a változatosság vagy a kommunikáció hiányáról szól. Érdemes ezt a partnerrel közösen, vád nélkül megnézni."];
    return [];
  },
  skalak: {
    total: { hi: "Összességében elégedett vagy a szexuális életeddel.", mid: "Részben vagy elégedett: vannak jól működő és hiányzó területek.", lo: "Összességében elégedetlen vagy a szexuális életeddel. Ez fontos jelzés, amely gyakran a kapcsolat, a kommunikáció vagy a stressz felől érdemes megközelíteni." },
    EGO: { hi: "A saját szexuális élményeddel elégedett vagy: tudsz jelen lenni, élvezni, és megéled az izgalmat.", mid: "A saját élményed változó: néha jelen vagy és élvezed, máskor kevésbé.", lo: "A saját élményeddel kevésbé vagy elégedett: nehéz jelen lenni, élvezni, vagy a figyelmed a teljesítményen, a testképen, a partner reakcióján van.", tipLo: "Gyakorold a jelenlétet: a figyelmet terelgesd vissza az érzetekre, ne a teljesítményre. Az érzéki fókusz gyakorlatok ebben sokat segítenek." },
    PA: { hi: "A partnerrel és a közös szexuális élettel elégedett vagy.", mid: "A közös szexuális élettel részben vagy elégedett.", lo: "A partnerrel és a közös szexuális élettel elégedetlen vagy: hiányzik a kölcsönösség, a figyelem, a gyakoriság vagy a változatosság.", tipLo: "Fogalmazd meg pontosan, mi hiányzik, és beszéljétek meg nyugodt helyzetben, nem közvetlenül szex előtt vagy után." }
  },
  gyoker: [
    "A szexuális elégedettséget a kapcsolati biztonság, a kommunikáció, a stressz, az egészség, az önkép és a korábbi tapasztalatok együtt formálják. Gyakori, hogy a hosszú kapcsolatban a rutin, a kimondatlan sértettség vagy a vágyeltérés fokozatosan csökkenti az elégedettséget.",
    "Az egyéni oldalon a szexualitással kapcsolatos szégyen, a teljesítményszorongás és a testkép-problémák gyakran akadályozzák, hogy a saját élményed teljes legyen."
  ],
  mindennap: [
    "Az alacsony szexuális elégedettség gyakran a kapcsolat egészére kihat: távolság, feszültség, sértettség. Fordítva is igaz: a kapcsolati problémák szinte mindig megjelennek a szexualitásban is.",
    "Sok pár nem beszél az elégedetlenségről, mert félnek megbántani egymást – ez azonban gyakran a legnagyobb akadály."
  ],
  lepesek: [
    "<strong>Pontos megnevezés.</strong> Mi hiányzik? Gyakoriság, minőség, változatosság, figyelem, közelség, könnyedség?",
    "<strong>Beszélgetés.</strong> Nyugodt helyzetben, „én”-üzenetekkel: „azt szeretném, ha…”, „jólesne nekem…”.",
    "<strong>Jelenlét.</strong> Az élvezet nagy része a figyelem minőségén múlik; a jelenlét gyakorolható.",
    "<strong>Újdonság és játékosság.</strong> A közös új élmények (nem csak a hálószobában) mérhetően javítják a kapcsolati és szexuális elégedettséget.",
    "<strong>Szakember.</strong> Ha a beszélgetés elakad, a pár- és szexuálterápia biztonságos keretet ad."
  ],
  kerdesek: [
    "Mi az, ami a legjobban hiányzik a szexuális életedből?",
    "Beszéltetek-e a partnereddel arról, mit szeretnétek – és ha nem, mi akadályoz?",
    "Mikor élted meg utoljára igazán jól a szexualitást, és mi volt akkor más?"
  ]
};

D.saq = {
  cim: "A szexuális tudatosságod mélyebben",
  bevezeto: [
    "A SAQ (Snell) a szexualitással kapcsolatos <strong>tudatosság négy formáját</strong> méri. A <strong>szexuális tudatosság</strong> a saját szexuális érzéseid, vágyaid és motivációid iránti figyelem. A <strong>szexuális monitorozás</strong> arra vonatkozik, mennyire figyeled, hogyan hat a szexualitásod másokra. A <strong>vonzerő-tudatosság</strong> azt, mennyire vagy tisztában a saját szexuális vonzerőddel. A <strong>szexuális asszertivitás</strong> pedig azt, mennyire tudod kimondani és érvényesíteni a szexuális igényeidet és határaidat.",
    "Ezek a dimenziók külön-külön értelmezendők. A saját vágyak ismerete és az asszertivitás általában egészséges szexuális működéssel jár együtt, míg a túl erős monitorozás gyakran önmegfigyelést és szorongást jelez."
  ],
  skalak: {
    SC: { jo: "hi", hi: "Jól ismered a saját szexuális érzéseidet, vágyaidat és motivációidat; figyelsz a belső szexuális világodra.", mid: "Részben figyelsz a szexuális érzéseidre; bizonyos helyzetekben jobban, máskor kevésbé.", lo: "Kevéssé figyelsz a saját szexuális érzéseidre. Nehéz lehet megmondani, mit szeretsz és mit nem.", tipLo: "Kérdezd meg magadtól rendszeresen: mi esik jól, mi nem, mire vágyom? A saját vágyak ismerete az asszertivitás előfeltétele." },
    SM: { hi: "Erősen figyeled, hogyan hat a szexualitásod másokra. Ez lehet érzékenység, de gyakran önmegfigyelés is, ami szorongást és a jelenlét csökkenését okozhatja.", mid: "Közepesen figyeled mások reakcióit.", lo: "Kevéssé figyeled, hogyan hat a szexualitásod másokra; a saját élményeden van a fókusz.", tipHi: "Figyeld meg, mikor válik a monitorozás önmegfigyeléssé („hogyan nézek ki”, „jó vagyok-e”). Ilyenkor tereld a figyelmet vissza az érzetekre." },
    SA: { hi: "Tisztában vagy a saját szexuális vonzerőddel, és ezt tudatosan meg is éled.", mid: "Részben vagy tisztában a vonzerőddel; bizonyos helyzetekben bizonytalanabb vagy.", lo: "Kevéssé érzed magad vonzónak, vagy nem figyelsz erre. Ez gyakran testképpel vagy önértékeléssel kapcsolatos bizonytalanságból fakad.", tipLo: "Figyeld meg, milyen helyzetben érezted magad vonzónak. A vonzerő érzése sokszor nem a külsőn, hanem a jelenléten és a magabiztosságon múlik." },
    AS: { jo: "hi", hi: "Ki tudod mondani a szexuális igényeidet és határaidat, és ki is tudsz állni mellettük.", mid: "Részben tudod kimondani, mit szeretnél; bizonyos témák vagy helyzetek nehezebbek.", lo: "Nehezen mondod ki a szexuális igényeidet és határaidat. Ez gyakran a partner kedvéért való alkalmazkodással, a nemet mondás nehézségével vagy szégyennel jár együtt.", tipLo: "Kezdd kis kérésekkel és kis „nem”-ekkel. A szexuális asszertivitás nem önzés, hanem a kölcsönös elégedettség alapja." }
  },
  gyoker: [
    "A szexuális tudatosság és asszertivitás nagyrészt tanult: a neveltetés, a szexuális nevelés minősége, a kulturális normák és a korai tapasztalatok formálják. A szégyent vagy hallgatást közvetítő környezet gyakran gátolja a saját vágyak megismerését és kimondását.",
    "A túlzott monitorozás gyakran a megfelelési igénnyel, a visszautasítástól való félelemmel és a testképpel kapcsolatos bizonytalansággal függ össze."
  ],
  mindennap: [
    "Az alacsony asszertivitás gyakran olyan szexuális helyzetekhez vezet, amelyek nem igazán kívántak vagy nem élvezetesek, ami hosszú távon csökkenti a vágyat és az elégedettséget. A magas önmegfigyelés szorongást kelthet és csökkenti a jelenlétet.",
    "A saját vágyak ismerete és kimondása viszont a kapcsolat mindkét fele számára biztonságot ad: a partner tudja, mi esik jól, és nem kell találgatnia."
  ],
  lepesek: [
    "<strong>Ismerd meg a vágyaidat.</strong> Írd le, mi esik jól, mi semleges, mi nem – testi és érzelmi szinten is.",
    "<strong>Határok gyakorlása.</strong> A „nem” kimondása a „igen” hitelességének feltétele.",
    "<strong>Önmegfigyelés helyett jelenlét.</strong> Ha azon kapod magad, hogy kívülről nézed magad, irányítsd a figyelmet az érzetekre.",
    "<strong>Kommunikáció.</strong> Beszéljetek a szexualitásról a hálószobán kívül is, nyugodt helyzetben.",
    "<strong>Szakember.</strong> Ha a szexuális asszertivitás nehézsége mögött negatív tapasztalatok állnak, a szexuálterápia segíthet."
  ],
  kerdesek: [
    "Tudod-e pontosan, mi esik jól neked szexuálisan?",
    "Mikor mondtál utoljára nemet szexuális helyzetben – vagy mikor szerettél volna?",
    "Mire figyelsz szex közben: a saját élményedre vagy arra, hogyan látnak?"
  ]
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
