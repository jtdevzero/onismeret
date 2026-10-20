/* Mélyelemzés: munka.html — UWES-9, Grit-S, SAPS */
(function(D){

D.uwes = {
  jo: "hi",
  cim: "A munkahelyi bevonódásod mélyebben",
  bevezeto: [
    "A munkahelyi bevonódás a kiégés pozitív ellentéte: <strong>lendület</strong> (energia, kitartás), <strong>elkötelezettség</strong> (lelkesedés, büszkeség, értelem) és <strong>elmélyülés</strong> (flow, az idő elszaladása).",
    "A Job Demands–Resources modell szerint a bevonódást az erőforrások (kontroll, támogatás, fejlődés, visszajelzés) táplálják, a kiégést a tartós terhelés. A kettő egyszerre is jelen lehet."
  ],
  skalak: {
    total: { cut: [2.88, 4.67], hi: "Magas bevonódás: a munkád energiát ad.", mid: "Átlagos bevonódás.", lo: "Alacsony bevonódás: a munkád most kevés energiát ad." },
    VI: { cut: [2.88, 4.67], hi: "Erős lendület munka közben.", mid: "Közepes lendület.", lo: "Kevés lendület: a munka fáraszt." },
    DE: { cut: [2.88, 4.67], hi: "Erős elkötelezettség és büszkeség.", mid: "Közepes elkötelezettség.", lo: "Kevés lelkesedés és értelem a munkában." },
    AB: { cut: [2.88, 4.67], hi: "Gyakori elmélyülés, flow.", mid: "Időnkénti elmélyülés.", lo: "Ritka elmélyülés." }
  },
  gyoker: [
    "A bevonódás leggyakoribb forrásai: autonómia (te döntesz a munkádról), fejlődési lehetőség, értelmes feladat, jó kapcsolatok és elismerés.",
    "Vállalkozóknál a bevonódás gyakran magas, de könnyen átbillen túlhajszoltságba, ha nincs határ."
  ],
  mindennap: [
    "Magas bevonódásnál a munka nem teher, hanem forrás; alacsonynál a nap a vége felé tart, és a munka kívül marad az identitáson."
  ],
  fennmarad: "A bevonódás önerősítő: aki elmélyül, jobb eredményt ér el, ami több erőforrást és elismerést hoz. Visszafelé is igaz: a kiürült munka kevesebb visszajelzést ad.",
  lepesek: [
    "<strong>Energia-napló.</strong> Egy hétig jelöld a feladataidnál: tölt vagy merít?",
    "<strong>Munkaformálás (job crafting).</strong> Tegyél egy kicsit többet abból, ami tölt, és szervezz ki vagy csökkents valamit abból, ami merít.",
    "<strong>Flow-blokk.</strong> Naponta egy 60–90 perces, megszakítás nélküli munkablokk.",
    "<strong>Összevetés.</strong> Nézd meg együtt a CBI munkához kötött alskálájával."
  ],
  kerdesek: [
    "Melyik feladatod közben szalad el leginkább az idő?",
    "Mire vagy a legbüszkébb a munkádban az elmúlt hónapból?",
    "Mi venné el a legjobban a kedvedet, ha holnap mindennap ezt kellene csinálnod?"
  ],
  megjegyzes: "Az UWES-9 sávjai a kézikönyv tájékozódó határai (nem magyar mintán)."
};

D.grit = {
  jo: "hi",
  cim: "A kitartásod mélyebben",
  bevezeto: [
    "A grit két dolog: az <strong>érdeklődés állandósága</strong> (ugyanaz a cél hónapokon, éveken át) és az <strong>erőfeszítés kitartása</strong> (akadályok ellenére is végigviszed).",
    "A grit népszerű fogalom, de a kutatások szerint kevesebbet magyaráz a sikerből, mint amit a könyvek állítanak, és nagyrészt átfed a lelkiismeretességgel. Inkább önismereti tükörnek jó, mint jóslatnak."
  ],
  skalak: {
    total: { cut: [2.99, 4], hi: "Magas kitartás a hosszú távú célok mellett.", mid: "Közepes kitartás.", lo: "A céljaid gyakran váltják egymást, vagy hamar elfogy az erőfeszítés." },
    CI: { cut: [2.99, 4], hi: "Stabil érdeklődés: hosszú távon ugyanaz foglalkoztat.", mid: "Közepesen stabil érdeklődés.", lo: "Gyakran váltó érdeklődés: az új ötletek könnyen elvisznek." },
    PE: { cut: [2.99, 4], hi: "Erős erőfeszítés-kitartás.", mid: "Közepes erőfeszítés-kitartás.", lo: "Az erőfeszítés hamar elfogy." }
  },
  gyoker: [
    "A váltó érdeklődés gyakran a kezdés izgalmából táplálkozik: az új projekt jutalmazóbb, mint a régi befejezése. Ha ez gyerekkor óta jellemző, a figyelmi működés (ASRS) is szerepet játszhat.",
    "Az erőfeszítés kitartását erősíti az értelmes cél (MLQ), a külső struktúra és a megküzdésbe vetett bizalom (GSE)."
  ],
  mindennap: [
    "Alacsony érdeklődés-állandóságnál sok félbehagyott projekt halmozódik fel; alacsony erőfeszítés-kitartásnál a nehéz szakaszban fogy el a lendület."
  ],
  fennmarad: "A félbehagyott projektek csökkentik a megküzdésbe vetett bizalmat, ami még kevesebb kitartást eredményez. A kört a kicsi, valóban befejezett projektek törik meg.",
  lepesek: [
    "<strong>Ötlet-parkoló.</strong> Az új ötleteket írd fel, de csak egy lezárt projekt után válassz közülük.",
    "<strong>Egy fő cél.</strong> Nevezz meg egyetlen célt a következő 90 napra, és minden héten tegyél érte egy lépést.",
    "<strong>Külső struktúra.</strong> Határidő, elszámolási társ, nyilvános vállalás.",
    "<strong>Tudatos elengedés.</strong> Ha egy célt elengedsz, döntsd el tudatosan, ne csak sodródj el tőle."
  ],
  kerdesek: [
    "Melyik az a cél, amit évek óta követsz?",
    "Mi szokott történni, mielőtt félbehagysz egy projektet?",
    "Melyik célod érdemli meg leginkább a kitartást?"
  ],
  megjegyzes: "A Grit-S sávjai tájékozódók; a grit és a lelkiismeretesség (Big Five C) erősen átfed."
};

D.saps = {
  cim: "A perfekcionizmusod mélyebben",
  bevezeto: [
    "A perfekcionizmus két oldala független: a <strong>magas mérce</strong> önmagában inkább hajtóerő, a <strong>diszkrepancia</strong> (a soha-nem-elég érzés) viszont a kutatásokban következetesen stresszel, halogatással, lehangoltsággal és kiégéssel jár együtt.",
    "Ezért a cél nem a mérce lejjebb engedése, hanem a mércéhez való viszony megváltoztatása: elég jó, ha elég jó."
  ],
  skalak: {
    S: { cut: [12, 20], hi: "Magas mérce önmagaddal szemben.", mid: "Közepes mérce.", lo: "Rugalmas, nem kiemelkedő mérce." },
    D: { jo: "lo", cut: [10, 16], hi: "Erős soha-nem-elég érzés.", mid: "Időnkénti elégedetlenség.", lo: "Ritka elégedetlenség a saját teljesítményeddel." }
  },
  gyoker: [
    "A megterhelő perfekcionizmus gyakran feltételes elfogadásból nő ki: a szeretet és az elismerés a teljesítményhez kötődött. A YSQ <em>Könyörtelen mércék</em> sémája és az SMI <em>Követelő szülő</em> módja ennek lenyomata.",
    "Teljesítményorientált környezet (vállalkozás, verseny, közösségi média) tovább erősíti."
  ],
  mindennap: [
    "Megterhelő perfekcionizmusnál gyakori a halogatás (ha nem tudom tökéletesen, el sem kezdem), a túlkészülés, a delegálás nehézsége és a siker utáni üresség."
  ],
  fennmarad: "A tökéletes eredmény ritkán jön, így a soha-nem-elég érzés folyamatosan megerősítést kap. A siker sem oldja: a mérce rögtön feljebb lép.",
  lepesek: [
    "<strong>Kész-kritérium előre.</strong> Mielőtt nekiállsz, írd le, mikor lesz elég jó.",
    "<strong>Szándékos 90%.</strong> Egy kis tétű feladatnál állj meg 90%-on, és figyeld meg a következményeket.",
    "<strong>Időkeret.</strong> Minden feladatnak legyen előre rögzített ideje; ha lejár, leadod.",
    "<strong>Önegyüttérzés.</strong> Kudarc után a barát-teszt: mit mondanál egy barátodnak?"
  ],
  kerdesek: [
    "Mi történne, ha valamit csak 80%-ra csinálnál meg?",
    "Kinek a mércéjének akarsz megfelelni?",
    "Mikor voltál utoljára igazán elégedett valamivel, amit csináltál?"
  ],
  megjegyzes: "A SAPS profilhatárai (mérce ≥ 20, diszkrepancia ≥ 16) tájékozódók."
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
