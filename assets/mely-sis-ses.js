/* Mélyelemzés: sis-ses.html — SIS/SES (kettős kontroll) */
(function(D){

D.sisses = {
  cim: "A gázpedálod és a fékjeid mélyebben",
  bevezeto: [
    "A kettős kontroll modell (Bancroft és Janssen) szerint a szexuális izgalmat két egymástól független rendszer szabályozza: egy <strong>gázpedál</strong> (szexuális izgalmi rendszer, SES), amely a szexuálisan releváns ingerekre reagál, és két <strong>fék</strong> (szexuális gátló rendszer). Az <strong>SIS1</strong> a teljesítménytől való félelemhez kötött fék („mi lesz, ha nem működik?”), az <strong>SIS2</strong> a következményektől való félelemhez kötött fék (lebukás, fájdalom, terhesség, fertőzés, normák megsértése).",
    "Mindenkiben van gázpedál és fék is, csak eltérő érzékenységgel. Egyik konfiguráció sem „jó” vagy „rossz”: a nagyon érzékeny gázpedál és a gyenge fék kockázatvállaló szexuális viselkedéshez, az erős fékek szexuális nehézségekhez (izgalmi, erekciós, vágyzavar) kapcsolódhatnak. Emily Nagoski közismert összefoglalója szerint a legtöbb szexuális nehézség nem a gáz hiánya, hanem a <strong>túl erős fék</strong>."
  ],
  profil: function(r, lv){
    var out = [];
    if (lv.sis1 === 'hi' && lv.ses !== 'hi') out.push("<strong>Erős teljesítményfék, nem különösebben érzékeny gázpedál:</strong> ez a konfiguráció a leggyakrabban jár együtt izgalmi és erekciós nehézségekkel, főleg stresszes időszakokban vagy új partner mellett. Itt a legtöbbet a teljesítménynyomás csökkentése hozza.");
    if (lv.ses === 'hi' && lv.sis2 === 'lo') out.push("<strong>Érzékeny gázpedál, gyenge következmény-fék:</strong> könnyen izgalomba jössz, és a lehetséges következmények kevéssé fékeznek. Ez spontaneitást ad, de a kockázatvállalást is növelheti; érdemes tudatosan figyelni a biztonságra.");
    if (lv.ses === 'lo' && lv.sis1 === 'lo' && lv.sis2 === 'lo') out.push("<strong>Kevéssé érzékeny gáz és fékek:</strong> a szexuális rendszered általában nyugodt; az izgalomhoz erősebb, célzottabb ingerek kellenek.");
    return out;
  },
  skalak: {
    ses: { hi: "Érzékeny a <strong>gázpedálod</strong>: sokféle inger (látvány, érintés, fantázia, illat, helyzet) könnyen kivált izgalmat.", mid: "A gázpedálod közepesen érzékeny: a megfelelő helyzetben és ingerekkel könnyen izgalomba jössz.", lo: "A gázpedálod kevéssé érzékeny: az izgalomhoz erősebb, célzottabb ingerekre és megfelelő kontextusra van szükség. Ez nem probléma, csak tudatosabb figyelmet igényel arra, mi kapcsol be.", tipLo: "Írd le, mi kapcsolja be az izgalmadat: helyzetek, érzékszervi ingerek, gondolatok, a partner viselkedése. A gázpedál erősítése a kontextus tudatos megteremtésével kezdődik." },
    sis1: { jo: "lo", hi: "Erős a <strong>teljesítményfék</strong>: az aggodalom, hogy „mi lesz, ha nem működik” (erekció, orgazmus, partner elégedettsége), könnyen kioltja az izgalmat. Ez a fék a teljesítményszorongás biológiai oldala.", mid: "A teljesítményfék közepes: időnként, főleg stresszben, a „működik-e” aggodalom fékez.", lo: "A teljesítményfék gyenge: a teljesítménnyel kapcsolatos aggodalom ritkán oltja ki az izgalmat.", tipHi: "Csökkentsd a teljesítmény-fókuszt: érzéki fókusz gyakorlatok, a közösülés „levétele az asztalról” egy időre, figyelem az érzetekre a cél helyett." },
    sis2: { hi: "Erős a <strong>következmény-fék</strong>: a lehetséges negatív következmények (lebukás, fájdalom, terhesség, fertőzés, normák) erősen gátolják az izgalmat. Ez védelem, de ha túl erős, biztonságos helyzetben is fékezhet.", mid: "A következmény-fék közepes: a kockázatok figyelembevétele fontos, de nem bénít meg.", lo: "A következmény-fék gyenge: a lehetséges következmények kevéssé gátolják az izgalmadat. Ez spontaneitást ad, de érdemes tudatosan figyelni a biztonságra.", tipHi: "Teremts olyan kontextust, ahol a fékek okai valóban rendezve vannak (biztonság, védekezés, zavartalan idő, bizalom); így a fék is elengedhet." }
  },
  gyoker: [
    "A gázpedál és a fékek érzékenysége részben veleszületett (temperamentum, biológiai érzékenység), részben tanult. A szexualitásról szóló korai üzenetek (szégyen, veszély, bűn), a negatív vagy traumatikus tapasztalatok, és a teljesítményközpontú kultúra mind erősíthetik a fékeket.",
    "A kontextus is számít: a stressz, a fáradtság, a kapcsolati feszültség, a testkép, a környezet biztonsága pillanatnyilag is erősíti vagy gyengíti a fékeket."
  ],
  mindennap: [
    "A kettős kontroll magyarázza, miért működik ugyanaz a szexuális helyzet egyszer jól, máskor nem: a gáz és a fék aránya a kontextustól függően változik. Egy stresszes hét után a fék erősebb, egy nyaraláson gyengébb.",
    "Párban a két ember gázpedálja és fékjei eltérnek: ami az egyiket bekapcsolja, a másikat fékezheti. A közös feladat egy olyan kontextus megteremtése, amely mindkettőtöknek kedvez."
  ],
  lepesek: [
    "<strong>Gázpedál-lista.</strong> Mi kapcsolja be az izgalmadat? Helyzetek, ingerek, hangulat, partner viselkedése.",
    "<strong>Fék-lista.</strong> Mi oltja ki? Stressz, aggodalom, fáradtság, testkép, zavaró környezet, feszültség.",
    "<strong>A fékek csökkentése először.</strong> A legtöbb embernél ez hozza a legnagyobb változást: biztonság, nyugalom, nyomás nélküli helyzet.",
    "<strong>Kontextus megteremtése.</strong> Beszéljétek meg a partnereddel mindkettőtök gázpedálját és fékjeit.",
    "<strong>Szakember.</strong> Ha a fékek nagyon erősek és szenvedést okoznak, a szexuálterápia vagy a traumatudatos terápia segíthet."
  ],
  kerdesek: [
    "Mi az, ami a leggyorsabban kioltja az izgalmadat?",
    "Milyen helyzetben érezted a legszabadabbnak magad szexuálisan – mi volt akkor más?",
    "Hogyan beszélnél a partnereddel a gázpedálodról és a fékjeidről?"
  ]
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
