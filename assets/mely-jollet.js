/* Mélyelemzés: jollet.html — WHO-5, PSS-10, CBI, BRS */
(function(D){

D.who5 = {
  jo: "hi",
  cim: "A közérzeted mélyebben",
  bevezeto: [
    "A WHO-5 nem a problémákat kérdezi, hanem a <strong>pozitív működést</strong>: jókedv, nyugalom, energia, pihentség, érdeklődés. Ezért jól jelzi, ha valami hiányzik, még mielőtt panaszként megfogalmazódna.",
    "Az eredmény az elmúlt két hét pillanatképe. Rövid időn belül is sokat változhat: egy rossz hét, egy betegség vagy kevés alvás lehúzza, egy pihentetőbb időszak felhúzza."
  ],
  skalak: {
    total: { cut: [48, 72], hi: "Jó közérzet: az elmúlt két hétben volt energiád, nyugalmad és érdeklődésed.", mid: "Közepes jóllét: vannak jó napjaid, de nem minden területen töltődsz.", lo: "Gyenge jóllét: kevés öröm, energia és pihenés jutott az elmúlt két hétre. 28 vagy alatta érdemes a PHQ-9-et is kitölteni." }
  },
  gyoker: [
    "A jóllét leggyakoribb rövid távú fékjei az alváshiány, a tartós terhelés, a mozgás hiánya és a kevés kapcsolódás. Hosszabb távon a lehangoltság, a krónikus betegség és a tartós magányosság csökkenti.",
    "A négyes kérdés (friss, kipihent ébredés) különösen érzékeny: ha csak ez alacsony, gyakran az alvás a fő tényező."
  ],
  mindennap: [
    "Alacsony jóllétnél a napok szürkébbek, kevesebb dolog érdekel, és könnyebben jön a „csak túl kell élni a hetet” üzemmód. A döntések és a kezdeményezés is nehezebb."
  ],
  fennmarad: "A kimerült állapot visszahúzódást hoz (kevesebb mozgás, kevesebb találkozás, kevesebb öröm), ami tovább csökkenti a feltöltődést. A kör ott szakítható meg, ahol a legkisebb a belépési küszöb: egy séta, egy találkozó, egy korábbi lefekvés.",
  lepesek: [
    "<strong>Alvás először.</strong> Két hétig rögzített lefekvési és kelési idő; ez a leggyorsabban ható változó.",
    "<strong>Napi egy feltöltő elem.</strong> Ami a WHO-5 állításai közül a leggyengébb, arra tervezz naponta egy kis dolgot (pl. érdeklődés → valami új, nyugalom → 10 perc csend).",
    "<strong>Újramérés.</strong> Két hét múlva töltsd ki újra: a WHO-5 gyorsan mutatja a változást.",
    "<strong>Ha 28 vagy alatta</strong>, töltsd ki a PHQ-9-et, és beszélj róla háziorvossal vagy pszichológussal."
  ],
  kerdesek: [
    "Melyik napod volt a legjobb az elmúlt két hétben, és mi volt benne más?",
    "Mi az, ami régen feltöltött, de mostanában kimaradt?",
    "Hogyan alszol mostanában?"
  ],
  megjegyzes: "A WHO-5 szűrő jellegű jóllét-mérő; az 50 és 28 pontos határt a szakirodalom használja tájékozódásra."
};

D.pss = {
  jo: "lo",
  cim: "Az észlelt stressz mélyebben",
  bevezeto: [
    "A PSS az <strong>értékelést</strong> méri, nem az eseményeket: azt, hogy a helyzeteidet mennyire éled meg kiszámíthatatlannak, kontrollálhatatlannak és túl soknak. Két összetevője van: a tehetetlenség-érzés és a megküzdésbe vetett bizalom hiánya.",
    "Ugyanaz a terhelés lehet kihívás vagy fenyegetés attól függően, mennyire érzed, hogy van ráhatásod. Ezért a stressz csökkentésének egyik leghatékonyabb útja a kontroll érzésének visszaszerzése."
  ],
  skalak: {
    total: { cut: [13, 27], hi: "Magas észlelt stressz: az elmúlt hónap túl soknak és nehezen irányíthatónak tűnt.", mid: "Közepes észlelt stressz: vannak túl soknak tűnő helyzetek, de összességében tartod a lépést.", lo: "Alacsony észlelt stressz: az életed most többnyire kiszámíthatónak és kezelhetőnek tűnik." },
    H: { cut: [8, 16], hi: "Erős tehetetlenség-érzés: a dolgok kicsúsznak a kezedből.", mid: "Időnként jelen lévő tehetetlenség-érzés.", lo: "Ritka tehetetlenség-érzés." },
    E: { cut: [5, 11], hi: "Gyenge bizalom a saját megküzdésedben.", mid: "Közepes megküzdési bizalom.", lo: "Erős bizalom abban, hogy megoldod a dolgokat." }
  },
  gyoker: [
    "A magas észlelt stresszt leggyakrabban a túl sok párhuzamos feladat, a kiszámíthatatlanság (munka, pénz, kapcsolat), a kevés pihenés és a kevés támogatás okozza.",
    "Hajlamosító tényező a magas neuroticizmus (Big Five), az érzelemszabályozási nehézség (DERS) és a perfekcionizmus (YSQ Könyörtelen mércék)."
  ],
  mindennap: [
    "Tartósan magas stressznél romlik az alvás és a koncentráció, nő az ingerlékenység, és gyakoribbak a testi tünetek (fejfájás, feszülés, emésztés).",
    "Gyakori a „mindenre reagálok, semmit nem tervezek” üzemmód, ami tovább csökkenti a kontroll érzését."
  ],
  fennmarad: "A stressz szűkíti a figyelmet: kevesebb idő jut tervezésre, pihenésre és támogatás kérésére, így a terhelés tovább nő. A kör a kontroll kis visszaszerzésével szakítható meg.",
  lepesek: [
    "<strong>Írd ki.</strong> Minden nyitott ügyet egy listára; a fejben tartott teendők önmagukban stresszt okoznak.",
    "<strong>Kontroll-szűrő.</strong> Jelöld meg, mi van a kezedben és mi nincs. A nem befolyásolható dolgokra ne tervezz energiát.",
    "<strong>Napi egy lezárás.</strong> Válassz naponta egy feladatot, amit befejezel; a lezárt ügyek visszaadják a kontroll érzését.",
    "<strong>Testi levezetés.</strong> Mozgás és lassú, hosszú kilégzés: a stresszválasz testi oldalát ezek csökkentik a leggyorsabban."
  ],
  kerdesek: [
    "Melyik helyzetben érezted a legkevésbé, hogy a kezedben vannak a dolgok?",
    "Mi az, amit most magadra vállalsz, de nem kellene?",
    "Ki tudna levenni rólad egy terhet, ha kérnéd?"
  ],
  megjegyzes: "A PSS-10 sávjai (14 és 27) tájékozódó határok, nem klinikai küszöbök."
};

D.cbi = {
  jo: "lo",
  cim: "A kiégés mélyebben",
  bevezeto: [
    "A koppenhágai modell a kiégést <strong>tartós testi és lelki kimerültségként</strong> írja le, és nem keveri össze a cinizmussal vagy a teljesítménnyel. Ezért kevésbé címkéz és jobban mutatja, honnan jön a kimerültség.",
    "A személyes alskála a munkától független kimerültséget méri, a munkához kötött azt, amit a munkádnak tulajdonítasz. A kettő különbsége mutatja, hol van a fő forrás."
  ],
  skalak: {
    P: { cut: [49, 75], hi: "Magas személyes kiégés: tartós testi és lelki kimerültség.", mid: "Közepes személyes kiégés: fogynak a tartalékok.", lo: "Alacsony személyes kiégés." },
    W: { cut: [49, 75], hi: "Magas munkához kötött kiégés: a munka tartósan lemerít.", mid: "Közepes munkához kötött kiégés.", lo: "Alacsony munkához kötött kiégés." }
  },
  gyoker: [
    "A munkahelyi kiégés legerősebb előrejelzői a tartósan magas terhelés, a kevés kontroll a saját munka felett, a kevés elismerés, az értékkonfliktus és a határok hiánya (mindig elérhető vagy).",
    "Vállalkozóknál gyakori, hogy nincs természetes határ a munka és a magánélet között, és minden felelősség egy kézben van."
  ],
  mindennap: [
    "Reggeli fáradtság, ami alvással sem múlik; a szabadidő is pihenés helyett „kidőlés”; kevesebb türelem a családdal és a barátokkal; gyakoribb betegségek."
  ],
  fennmarad: "A kimerült ember kevesebbet tölt fel (kevesebb mozgás, kapcsolat, öröm), és gyakran még többet dolgozik, hogy behozza a lemaradást. A kiégés ezért ritkán múlik el magától: a terhelést kell érdemben csökkenteni.",
  lepesek: [
    "<strong>Terhelés-leltár.</strong> Írd össze, mi viszi el a legtöbb energiát, és jelölj meg egyet, amit elhagysz, átadsz vagy kisebbre veszel.",
    "<strong>Határ.</strong> Egy rögzített időpont, ami után nincs munka és nincs elérhetőség.",
    "<strong>Testi alapok.</strong> Alvás, mozgás, és orvosi kivizsgálás, ha a fáradtság tartós (vérkép, pajzsmirigy, vitaminok).",
    "<strong>75 felett</strong> érdemes szakemberrel is beszélni; a kiégés és a depresszió gyakran együtt jár."
  ],
  kerdesek: [
    "Mikor érezted magad utoljára igazán kipihentnek?",
    "Melyik munkafeladat merít le a legjobban, és melyik tölt fel?",
    "Mi történne, ha egy hétig csak 80%-on teljesítenél?"
  ],
  megjegyzes: "A CBI határai (50 és 75) a szakirodalomban gyakran használt tájékozódó értékek."
};

D.brs = {
  jo: "hi",
  cim: "A rezilienciád mélyebben",
  bevezeto: [
    "A BRS a reziliencia eredeti, szűk jelentését méri: <strong>milyen gyorsan jössz helyre</strong> egy nehézség után. Nem azt, mennyire kerülöd el a stresszt, hanem azt, hogy mennyire rugalmasan térsz vissza.",
    "A reziliencia nem vonás, hanem erőforrások eredője: kapcsolatok, testi állapot, értelmezési mód, korábbi tapasztalatok."
  ],
  skalak: {
    total: { cut: [2.99, 4.31], hi: "Magas reziliencia: gyorsan helyrejössz a nehézségek után.", mid: "Átlagos reziliencia: a legtöbb nehézségből idővel helyrejössz.", lo: "Alacsony reziliencia: most lassabban jössz helyre a nehézségek után." }
  },
  gyoker: [
    "A reziliencia legerősebb forrásai a kutatások szerint a támogató kapcsolatok, az optimista, de valószerű értelmezés, a jó alvás és mozgás, és az önegyüttérzés kudarc után.",
    "Tartós terhelés és kevés pihenés idején a reziliencia átmenetileg csökken: ez állapot, nem jellem."
  ],
  mindennap: [
    "Alacsonyabb rezilienciánál egy-egy kudarc vagy konfliktus napokig elkísér, és nehezebb újra belevágni. Magasnál a nehézség inkább kitérő, mint fordulópont."
  ],
  fennmarad: "Ha a nehéz élményeket nem dolgozod fel (nem beszélsz róluk, nem vonod le a tanulságot), lassabban jössz helyre, és a következő nehézség is nagyobbnak tűnik.",
  lepesek: [
    "<strong>Utólagos feldolgozás.</strong> Egy nehéz helyzet után írd le: mi történt, mi segített, mit csinálnék másképp.",
    "<strong>Támogatás.</strong> Nevezz meg két embert, akihez nehéz időben fordulhatsz, és tartsd velük a kapcsolatot jó időben is.",
    "<strong>Testi alap.</strong> Az alvás és a mozgás a helyrejövés sebességét közvetlenül befolyásolja.",
    "<strong>Önegyüttérzés.</strong> Kudarc után a kemény önkritika lassítja, a megértő hozzáállás gyorsítja a helyrejövést (SCS-SF)."
  ],
  kerdesek: [
    "Melyik volt az a nehéz helyzet, amiből a leggyorsabban helyrejöttél, és mi segített?",
    "Mi az, ami a legtovább elkísér egy kudarc után?",
    "Kihez fordulsz, amikor nehéz?"
  ],
  megjegyzes: "A BRS sávjai (3,00 és 4,30) a szerzők által javasolt tájékozódó határok."
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
