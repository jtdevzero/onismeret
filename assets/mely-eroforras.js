/* Mélyelemzés: eroforras.html — SWLS, LOT-R, GQ-6, BPNSFS */
(function(D){

D.swls = {
  jo: "hi",
  cim: "Az élettel való elégedettséged mélyebben",
  bevezeto: [
    "Az élettel való elégedettség a jóllét <strong>kognitív</strong> oldala: nem egy pillanatnyi érzés, hanem egy mérlegelés arról, mennyire felel meg az életed a saját mércédnek.",
    "Viszonylag stabil, de nem rögzített: nagy életesemények (párkapcsolat, munkanélküliség, költözés) tartósan is elmozdíthatják."
  ],
  skalak: {
    total: { cut: [19, 26], hi: "Elégedett vagy az életed összképével.", mid: "Vegyes összkép: bizonyos területek rendben, mások nem.", lo: "Most elégedetlen vagy az életed összképével." }
  },
  gyoker: [
    "Az elégedettség legerősebb előrejelzői a kapcsolatok minősége, az egészség, az anyagi biztonság érzése, és az, hogy az életed mennyire összhangban van az értékeiddel.",
    "A nagy különbség a jelen és a vágyott élet között gyakran nem a jelen rosszaságából, hanem a mérce emelkedéséből fakad."
  ],
  mindennap: [
    "Alacsony elégedettségnél a figyelem gyakran a hiányokra szűkül, és nehezebb élvezni azt, ami megvan."
  ],
  fennmarad: "Az összehasonlítás (mások életével vagy egy elképzelt ideállal) fenntartja az elégedetlenséget; a saját értékek szerinti apró lépések csökkentik.",
  lepesek: [
    "<strong>Területek szerint.</strong> Értékeld 1–10-ig a fő életterületeidet (munka, kapcsolat, egészség, anyagiak, szabadidő), és válassz egyet.",
    "<strong>Értékek.</strong> A PVQ-21 megmutatja, mi fontos neked; nézd meg, melyik kap kevés helyet.",
    "<strong>Hála.</strong> A GQ-6 gyakorlatai a meglévőre irányítják a figyelmet."
  ],
  kerdesek: [
    "Melyik életterület húzza le leginkább az összképet?",
    "Mit változtatnál, ha újrakezdhetnéd?",
    "Mi az, amivel elégedett vagy, de ritkán gondolsz rá?"
  ],
  megjegyzes: "A sávok a szerző által javasolt értelmezési tartományok."
};

D.lotr = {
  jo: "hi",
  cim: "Az optimizmusod mélyebben",
  bevezeto: [
    "A diszpozicionális optimizmus az az általános várakozás, hogy a jövőben inkább jó dolgok történnek. Nem a valóság tagadása: az optimisták a kutatások szerint aktívabban kezelik a problémákat, és ritkábban adják fel.",
    "Az optimizmus részben öröklött, részben tanult; a magyarázati stílus (hogyan értelmezed a rossz eseményeket) jól fejleszthető."
  ],
  skalak: {
    total: { cut: [13, 19], hi: "Optimista beállítódás.", mid: "Mérsékelt optimizmus.", lo: "Pesszimista beállítódás." }
  },
  gyoker: [
    "A pesszimizmus gyakran tapasztalatokból tanult óvatosság: kiszámíthatatlan környezet, ismétlődő csalódások. A YSQ <em>Negativizmus/pesszimizmus</em> sémája ennek mélyebb rétege.",
    "Tartós stressz és lehangoltság idején az optimizmus átmenetileg csökken."
  ],
  mindennap: [
    "Pesszimista beállítódásnál ritkábban vágsz bele új dolgokba, mert nem tűnik érdemesnek, és a nehézségek tartósabbnak és mindenre kiterjedőnek látszanak."
  ],
  fennmarad: "Ha nem próbálkozol, nincs alkalom megtapasztalni, hogy a dolgok jól is alakulhatnak; ez megerősíti a pesszimista várakozást.",
  lepesek: [
    "<strong>A legjobb lehetséges én:</strong> írd le, milyen lesz az életed öt év múlva, ha minden jól alakul.",
    "<strong>Magyarázati stílus:</strong> rossz esemény után kérdezd meg, tényleg tartós-e, mindenre kiterjed-e, csak rajtad múlik-e.",
    "<strong>Jó hírek naplója:</strong> egy hétig jegyezd fel, mi alakult jobban a vártnál."
  ],
  kerdesek: [
    "Mire számítasz a következő évben?",
    "Mi volt az utolsó helyzet, ami jobban alakult, mint vártad?",
    "Kitől tanultad, hogy a rosszra kell készülni?"
  ],
  megjegyzes: "A LOT-R sávjai tájékozódó határok."
};

D.gq6 = {
  jo: "hi",
  cim: "A hála mélyebben",
  bevezeto: [
    "A hála beállítódásként azt jelenti, hogy gyakran, erősen és sok irányba érzel hálát. A kutatások szerint a hála csökkenti az irigységet és az összehasonlítást, és erősíti a kapcsolatokat.",
    "A hála a legjobban dokumentáltan fejleszthető pozitív érzelmek egyike."
  ],
  skalak: {
    total: { cut: [35, 39], hi: "Erős hála-beállítódás.", mid: "Közepes hála-beállítódás.", lo: "Ritkábban megélt hála." }
  },
  gyoker: [
    "Terhelés és stressz idején a figyelem a problémákra szűkül, és a hála háttérbe szorul. Ez természetes működés, nem jellemhiba."
  ],
  mindennap: [
    "A hála gyakoribb megélése több kezdeményezéssel a kapcsolatokban és kevesebb „mindig csak a rosszat látom” érzéssel jár."
  ],
  fennmarad: "Ami nem tudatosul, az nem tölt fel: a hála-gyakorlatok épp a tudatosításon keresztül hatnak.",
  lepesek: [
    "<strong>Három jó dolog</strong> este, és hogy miért történtek.",
    "<strong>Hálalevél</strong> valakinek, akinek sosem köszönted meg rendesen.",
    "<strong>Heti ritmus:</strong> heti 1–2 alkalom hatékonyabb, mint a napi kötelező lista."
  ],
  kerdesek: [
    "Kinek vagy hálás, de még sosem mondtad el neki?",
    "Mi volt ma jó, amit könnyű lenne észre sem venni?",
    "Milyen nehézségért vagy utólag hálás?"
  ],
  megjegyzes: "A GQ-6 tájékozódó értékei egy amerikai felnőtt minta eloszlásán alapulnak."
};

D.bpns = {
  cim: "Az alapszükségleteid mélyebben",
  bevezeto: [
    "Az önmeghatározás-elmélet szerint az autonómia, a kapcsolódás és a kompetencia egyetemes lelki alapszükségletek: ha kielégülnek, a motiváció belülről jön és a jóllét nő; ha frusztrálódnak, kimerültség, védekezés és kompenzáló viselkedés jelenik meg.",
    "A kielégülés és a frusztráció külön mérendő: valaki egyszerre érezheti, hogy van szabadsága, és hogy sok mindenre kényszerítik."
  ],
  skalak: {
    AS: { jo: "hi", cut: [2.5, 4], hi: "Erős autonómia-élmény.", mid: "Közepes autonómia.", lo: "Kevés szabadság és választás." },
    AF: { jo: "lo", cut: [2.5, 3.5], hi: "Erős kényszerítettség-érzés.", mid: "Időnkénti kényszerítettség.", lo: "Ritka kényszerítettség." },
    RS: { jo: "hi", cut: [2.5, 4], hi: "Erős kapcsolódás.", mid: "Közepes kapcsolódás.", lo: "Kevés megtartó kapcsolódás." },
    RF: { jo: "lo", cut: [2.5, 3.5], hi: "Erős kirekesztettség- vagy elutasítottság-érzés.", mid: "Időnkénti kapcsolati frusztráció.", lo: "Ritka kapcsolati frusztráció." },
    CS: { jo: "hi", cut: [2.5, 4], hi: "Erős kompetencia-élmény.", mid: "Közepes kompetencia.", lo: "Kevés kompetencia-élmény." },
    CF: { jo: "lo", cut: [2.5, 3.5], hi: "Erős kudarc- és kételyérzés.", mid: "Időnkénti kompetencia-frusztráció.", lo: "Ritka kompetencia-frusztráció." }
  },
  gyoker: [
    "Az autonómiát a kontrolláló környezet (túl sok kötelesség, mikromenedzsment, mások elvárásai) frusztrálja; a kapcsolódást az elutasítás és a felszínes kapcsolatok; a kompetenciát a túl nehéz vagy visszajelzés nélküli feladatok.",
    "Vállalkozóknál az autonómia gyakran magas, a kapcsolódás viszont könnyen háttérbe szorul."
  ],
  mindennap: [
    "Frusztrált autonómiánál a napok kötelességek láncolatának tűnnek; frusztrált kapcsolódásnál a társaságban is magányos vagy; frusztrált kompetenciánál a hibák a saját értékedről szóló ítéletté válnak."
  ],
  fennmarad: "A frusztrált szükséglet kompenzációt hív elő (több kontroll, több munka, visszahúzódás), ami gyakran tovább frusztrálja ugyanazt a szükségletet.",
  lepesek: [
    "<strong>Autonómia:</strong> egy kötelességet alakíts választássá vagy hagyj el.",
    "<strong>Kapcsolódás:</strong> egy mélyebb beszélgetés hetente valakivel, aki fontos.",
    "<strong>Kompetencia:</strong> kicsi, befejezhető, visszajelzett feladatok.",
    "<strong>Mérlegelés:</strong> a leginkább frusztrált szükséglettel kezdj."
  ],
  kerdesek: [
    "Mit csinálsz most azért, mert muszáj, és mit azért, mert fontos?",
    "Kivel érzed magad igazán kapcsolódva?",
    "Mi az, amiben mostanában ügyesnek érezted magad?"
  ],
  megjegyzes: "A BPNSFS sávjai tájékozódók; a kielégülés és a frusztráció külön értelmezendő."
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
