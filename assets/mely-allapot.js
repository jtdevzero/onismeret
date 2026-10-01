/* Mélyelemzés: allapot.html — ASRS v1.1, PHQ-9, GAD-7 */
(function(D){

D.asrs = {
  jo: "lo",
  cim: "A figyelmi működésed mélyebben",
  bevezeto: [
    "Az ADHD (figyelemhiányos hiperaktivitás-zavar) nem a figyelem hiánya, hanem a figyelem és a végrehajtás <strong>szabályozásának</strong> eltérő működése: nehéz elkezdeni azt, ami nem érdekes, nehéz abbahagyni azt, ami nagyon az, nehéz a sorrend, az időérzék és a befejezés. Gyakran együtt jár érzelmi reaktivitással, elutasítás-érzékenységgel és nyugtalansággal. Felnőttkorban a hiperaktivitás sokszor befelé fordul: belső nyugtalanságként, túlpörgő gondolatokként jelenik meg.",
    "A szűrő két tünetcsoportot mér: a <strong>figyelmetlenséget</strong> (szervezés, befejezés, felejtés, figyelemtartás) és a <strong>hiperaktivitást/impulzivitást</strong> (nyugtalanság, közbevágás, várakozás nehézsége). Fontos: ugyanezek a tünetek szorongásból, depresszióból, krónikus alváshiányból, kiégésből vagy pajzsmirigyproblémából is fakadhatnak. A szűrő ezért csak azt mondja meg, érdemes-e alaposabban megnézni."
  ],
  profil: function(r){
    var a = r.d.partA && r.d.partA[1];
    if (typeof a !== 'number') return [];
    return a >= 4 ? ["<strong>A szűrő tünetkonzisztens.</strong> A következő lépés egy szakmai kivizsgálás (pszichiáter, klinikai szakpszichológus), amely a gyerekkori tüneteket, a több életterületen jelentkező nehézségeket és a lehetséges más okokat is megnézi. Érdemes a vizsgálatra elvinni az eredményt és néhány konkrét példát a mindennapokból."]
      : ["<strong>A szűrő nem tünetkonzisztens.</strong> Ha a figyelmi és végrehajtási nehézségek mégis sok szenvedést okoznak, a lent leírt stratégiák akkor is hasznosak, és érdemes más háttérokokat (alvás, stressz, hangulat) is megnézni."];
  },
  skalak: {
    partA: { cut: [3, 4], hi: "Az A rész hat tételéből legalább négy a jelzett tartományban van: a tüneteid nagy mértékben egybevágnak a felnőttkori ADHD-val.", mid: "", lo: "Az A rész jelzett tételeinek száma a küszöb alatt van.", tipHi: "Kérj szakmai kivizsgálást, és írj le előtte 5–10 konkrét példát (munka, kapcsolatok, pénzügyek, határidők), gyerekkoriakat is." },
    inatt: { hi: "Erős a <strong>figyelmetlenségi</strong> tünetcsoport: a szervezés, a befejezés, az unalmas feladatokra való figyelés és az emlékezés rendszeresen nehéz.", mid: "Közepes figyelmetlenségi tünetek: bizonyos helyzetekben (unalmas, ismétlődő, sok lépéses feladatok) jelennek meg.", lo: "Kevés figyelmetlenségi tünet.", tipHi: "Ne a fejedben tárold a teendőket: egy helyre gyűjtött lista, naptár, emlékeztetők. Bontsd a feladatot olyan kicsi lépésekre, hogy az első 5 perc alatt elkezdhető legyen." },
    hyper: { hi: "Erős a <strong>hiperaktivitási/impulzivitási</strong> tünetcsoport: nyugtalanság, nehéz kivárni, közbevágás, túlpörgés. Felnőttkorban ez gyakran belső nyugtalanságként él.", mid: "Közepes hiperaktivitási/impulzivitási tünetek.", lo: "Kevés hiperaktivitási/impulzivitási tünet.", tipHi: "A mozgás nem ellenség: rendszeres testmozgás, álló munka, séta-megbeszélések. Beszélgetésben jegyzetelj, hogy ne kelljen közbevágnod, hogy el ne felejtsd." },
    partB: { hi: "A B rész tételeinek nagy részénél gyakori tüneteket jeleztél.", mid: "A B rész tételeinek egy részénél gyakori tüneteket jeleztél.", lo: "A B részben kevés gyakori tünetet jeleztél." }
  },
  gyoker: [
    "Az ADHD az egyik leginkább örökletes pszichés állapot (az ikerkutatások szerint az eltérések nagy része genetikai). Az agy jutalmazási és végrehajtó rendszereinek eltérő működésével függ össze, különösen a dopamin és a noradrenalin szabályozásával. Ez magyarázza, miért megy könnyen az, ami érdekes vagy sürgős, és miért nehéz az, ami fontos, de nem azonnali.",
    "A környezet nem okozza, de formálja: egy strukturált, támogató környezetben a tünetek kisebb kárt okoznak, egy kaotikus vagy kritikus környezetben szégyen, kudarcélmények és negatív önkép rakódnak rájuk. Sok felnőttnél csak a felnőttkori terhelés (munka, család, önálló élet) teszi láthatóvá, ami gyerekkorban kompenzálható volt."
  ],
  mindennap: [
    "Jellegzetes az „érdeklődés-alapú idegrendszer”: ami érdekes, új, sürgős vagy kihívó, azon órákig tudsz dolgozni (hiperfókusz), ami unalmas, azt szinte lehetetlen elkezdeni. Gyakori a halogatás, a határidő előtti hajrá, a félbehagyott projektek, a késések, a felejtés és az időérzék zavara.",
    "Kapcsolatokban a partner gyakran úgy éli meg, hogy nem figyelsz rá vagy nem fontos neki, holott a figyelem szabályozása a nehéz, nem a szeretet. Érzelmileg sokan erős reaktivitást és elutasítás-érzékenységet élnek meg."
  ],
  fennmarad: "A kudarcélmények szégyent és önvádat hoznak, ami még nehezebbé teszi a kezdést; a „csak jobban kellene akarnom” hozzáállás pedig nem működik, mert a nehézség nem akarat-, hanem szabályozási kérdés.",
  lepesek: [
    "<strong>Kivizsgálás.</strong> Pozitív szűrőnél szakember: a megfelelő diagnózis és kezelés (gyógyszeres és nem gyógyszeres) sokaknál jelentős változást hoz.",
    "<strong>Külső struktúra az akaraterő helyett.</strong> Naptár, emlékeztetők, határidő valakinek, közös munka (body doubling).",
    "<strong>Érdeklődés és sürgősség tudatos használata.</strong> Párosítsd az unalmas feladatot valami érdekessel, vagy teremts mesterséges határidőt.",
    "<strong>Alvás, mozgás, étkezés.</strong> Ezek a figyelmi működést erősen befolyásolják, ADHD-tól függetlenül is.",
    "<strong>Önvád helyett tervezés.</strong> Egy elcsúszás után ne a jellemedet ítéld meg, hanem a rendszert javítsd."
  ],
  kerdesek: [
    "Gyerekként is jellemző volt rád ez a működés? Mit mondtak rólad a tanárok?",
    "Melyik a legnagyobb ára az életedben a figyelmi nehézségeknek?",
    "Mi az, ami nálad már bevált segítség?"
  ],
  megjegyzes: "Az ASRS szűrő, nem diagnózis; az A rész küszöbe (legalább 4 jelzett tétel) a kutatásokban a további vizsgálat jelzésére szolgál."
};

D.phq9 = {
  jo: "lo",
  cim: "A hangulatod mélyebben",
  bevezeto: [
    "A depresszió nem egyszerűen szomorúság, hanem egy egész rendszert érintő állapot: a hangulat, az öröm, az energia, az alvás, az étvágy, a gondolkodás és az önértékelés egyszerre változik. A PHQ-9 ezeket a tüneteket kérdezi, és a pontszám azt jelzi, mennyire voltak jelen az elmúlt két hétben.",
    "Fontos különbséget tenni a nehéz időszak és a tartós állapot között. Két rossz hét egy veszteség, stressz vagy kimerülés után természetes reakció lehet. Ha viszont a tünetek hetekig tartanak, rontják a működést, vagy reménytelenség, önsértő gondolatok jelennek meg, akkor ez szakmai segítséget igényel, és jól kezelhető."
  ],
  skalak: {
    total: { cut: [4, 10], hi: "Az eredményed a további vizsgálatot indokló tartományban van (10 pont vagy több): a tünetek valószínűleg érdemben befolyásolják a mindennapjaidat.", mid: "Enyhe tünetek (5–9 pont): figyelni érdemes, hogyan alakulnak a következő hetekben.", lo: "Minimális tünetek (0–4 pont).", tipHi: "Beszélj szakemberrel (háziorvos, pszichológus, pszichiáter). Addig is: rendszeres alvás, napi mozgás, napfény, és legalább egy beszélgetés valakivel naponta.", tipLo: "" }
  },
  gyoker: [
    "A depresszió hátterében biológiai (genetikai hajlam, hormonális változások, krónikus betegség, alváshiány), pszichés (negatív gondolkodási minták, önkritika, korábbi traumák, sémák) és társas tényezők (veszteség, magány, krónikus stressz, kapcsolati konfliktus) együtt állnak.",
    "Sokszor egy kiváltó esemény indítja el egy sérülékeny talajon: a korai érzelmi elhanyagolás, a büntető belső hang vagy a szégyen-sémák mind növelik a hajlamot."
  ],
  mindennap: [
    "A depresszió a mindennapokban gyakran nem szomorúságként, hanem fáradtságként, kedvetlenségként, ingerlékenységként, „semmi nem érdekel” érzésként jelenik meg. A dolgok több erőfeszítésbe kerülnek, a döntések nehezebbek, a jövő szűkebbnek tűnik.",
    "Kapcsolatokban visszahúzódással, ingerlékenységgel vagy azzal jár, hogy terhet érzel magad másokra nézve, ami tovább erősíti az elszigetelődést."
  ],
  fennmarad: "A depresszió visszahúzódást okoz (kevesebb mozgás, kapcsolódás, öröm), ami csökkenti a hangulatot javító élményeket, és ez tovább mélyíti a lehangoltságot. A rágódás és az önkritika szintén fenntartja.",
  lepesek: [
    "<strong>Szakember.</strong> 10 pont felett, vagy ha a tünetek hetek óta tartanak, beszélj háziorvossal, pszichológussal vagy pszichiáterrel.",
    "<strong>Viselkedéses aktiváció.</strong> Ne várd meg, hogy kedved legyen: tervezz be naponta egy kis kellemes és egy kis hasznos tevékenységet. A kedv gyakran a cselekvés után jön.",
    "<strong>Alvás és ritmus.</strong> Rendszeres kelés, napfény reggel, képernyő-mentes este.",
    "<strong>Kapcsolódás.</strong> Legalább egy beszélgetés naponta valakivel, akiben megbízol.",
    "<strong>Önegyüttérzés.</strong> A depresszió nem jellemhiba; a büntető belső hang a betegség része, nem az igazság."
  ],
  kerdesek: [
    "Mióta érzed így magad, és mi változott akkor?",
    "Kivel tudnál erről beszélni ezen a héten?",
    "Mi az a legkisebb dolog, ami holnap egy kicsit jobbá tehetné a napodat?"
  ],
  megjegyzes: "A PHQ-9 szűrő, nem diagnózis; a 10 pontos határt a kutatásokban a további vizsgálat jelzésére használják."
};

D.gad7 = {
  jo: "lo",
  cim: "A szorongásod mélyebben",
  bevezeto: [
    "A szorongás a rendszer riasztása: fel akar készíteni egy veszélyre. Kis mértékben hasznos (figyelmes, felkészült leszel tőle), tartósan és erősen viszont kimerít: a test feszült, az alvás romlik, a gondolatok a lehetséges veszélyek körül forognak, és a kontroll iránti igény egyre több energiát visz el.",
    "A GAD-7 a generalizált szorongást szűri (a sokféle dolog miatti, nehezen kontrollálható aggódást), de a pánik-, a szociális és a poszttraumás szorongás jelzésére is használják. Az eredmény az elmúlt két hét pillanatképe."
  ],
  skalak: {
    total: { cut: [4, 10], hi: "Az eredményed a további vizsgálatot indokló tartományban van (10 pont vagy több): a szorongás valószínűleg érdemben befolyásolja a mindennapjaidat.", mid: "Enyhe szorongás (5–9 pont).", lo: "Minimális szorongás (0–4 pont).", tipHi: "A szorongás jól kezelhető: a kognitív viselkedésterápia a legjobban vizsgált módszer. Addig is: lassú kilégzés (hosszabb kilégzés, mint belégzés), rendszeres mozgás, kevesebb koffein, és az aggódásra kijelölt napi 15 perc." }
  },
  gyoker: [
    "A szorongásra való hajlamot a temperamentum (érzékeny, reaktív idegrendszer), a genetika és a korai tapasztalatok együtt formálják. A kiszámíthatatlan, túlféltő vagy veszélyes gyerekkori környezet, és a Sérülékenység vagy a Negativizmus séma erősíti.",
    "A krónikus stressz, az alváshiány, a koffein és egyes testi állapotok (pajzsmirigy) szintén fokozzák."
  ],
  mindennap: [
    "A szorongás gyakran testi tünetekben jelenik meg: izomfeszülés, gyors szívverés, emésztési panaszok, alvászavar. A gondolkodásban a „mi lesz, ha” forgatókönyvek uralkodnak, a döntések nehezek, és sok energia megy el a kontrollra és az ellenőrzésre.",
    "Kapcsolatokban gyakori a megnyugtatás keresése és az ingerlékenység."
  ],
  fennmarad: "A kerülés és a biztonsági viselkedések (ellenőrzés, megnyugtatás-kérés) rövid távon csökkentik a szorongást, ezért megerősödnek; hosszú távon viszont megakadályozzák, hogy megtapasztald: a félt dolog nem következik be, vagy kezelhető.",
  lepesek: [
    "<strong>Szakember.</strong> 10 pont felett, vagy ha a szorongás hetek óta akadályoz: kognitív viselkedésterápia, szükség esetén orvosi segítség.",
    "<strong>Test először.</strong> Lassú, hosszú kilégzés; rendszeres mozgás; kevesebb koffein és alkohol.",
    "<strong>Aggódás-idő.</strong> Napi 15 perc kijelölt aggódás; azon kívül írd fel és halaszd el.",
    "<strong>Kerülés helyett fokozatos szembenézés.</strong> A szorongás a kerüléstől nő, a fokozatos kitettségtől csökken.",
    "<strong>Valószínűség vs. lehetőség.</strong> Írd le a félelmet és a valódi valószínűségét."
  ],
  kerdesek: [
    "Hol érzed a szorongást a testedben?",
    "Mit kerülsz el most a szorongás miatt?",
    "Mi az, ami eddig a leggyorsabban megnyugtatott?"
  ],
  megjegyzes: "A GAD-7 szűrő, nem diagnózis; a 10 pontos határt a kutatásokban a további vizsgálat jelzésére használják."
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
