/* Mélyelemzés: alvas.html — SCI, Epworth, BAS-2 */
(function(D){

D.sci = {
  jo: "hi",
  cim: "Az alvásod mélyebben",
  bevezeto: [
    "Az álmatlanság (inszomnia) nem csak a kevés alvás: az a helyzet, amikor <strong>van lehetőséged aludni, mégsem megy</strong>, legalább heti három éjszakán, hónapokon át, és ez napközben is érződik.",
    "Az alvás minősége szinte minden más eredményt befolyásol: a jóllétet, a stresszt, a figyelmet, az érzelemszabályozást. Rossz alvás mellett a többi teszt is rosszabbnak látszhat."
  ],
  skalak: {
    total: { cut: [16, 25], hi: "Jó alvás: gyorsan elalszol, keveset vagy ébren, és napközben sem érzed a hiányát.", mid: "Közepes alvásproblémák: nem minden éjszaka, vagy nem zavarnak nagyon napközben.", lo: "Valószínű álmatlanság: a válaszaid az inszomnia mintáját mutatják." }
  },
  gyoker: [
    "Az álmatlanságot rendszerint egy stresszes időszak indítja el, és a kialakuló szokások tartják fenn: korai lefekvés, sok idő ébren az ágyban, napközbeni szunyókálás, esti képernyő, koffein.",
    "A szorongás (GAD-7), a lehangoltság (PHQ-9) és a kronotípussal (MEQ) ütköző napirend gyakran együtt jár vele."
  ],
  mindennap: [
    "Rossz alvás után nehezebb a koncentráció, rövidebb a türelem, erősebb az édesség- és koffeinvágy, és a stresszes helyzetek nagyobbnak tűnnek."
  ],
  fennmarad: "Minél jobban akarsz aludni, annál nehezebb: az elalvás körüli aggodalom ébren tart, az ágy pedig az ébrenléttel társul. A kört az alvás „erőltetésének” elengedése és a következetes napirend töri meg.",
  lepesek: [
    "<strong>Rögzített kelési idő</strong>, hétvégén is. Ez a belső óra legerősebb beállítója.",
    "<strong>20 perc szabály.</strong> Ha nem alszol el, kelj fel, csinálj valami nyugodtat félhomályban, és csak álmosan feküdj vissza.",
    "<strong>Az ágy csak alvásra.</strong> Telefon, munka, sorozat máshol.",
    "<strong>Ha 16 vagy alatta</strong>, és hónapok óta tart, kérdezd meg háziorvosodat a kognitív viselkedésterápiáról álmatlanságra (CBT-I): ez hatékonyabb és tartósabb, mint az altató."
  ],
  kerdesek: [
    "Mi jár a fejedben, amikor nem tudsz elaludni?",
    "Mikor kelsz hétköznap és hétvégén? Mekkora a különbség?",
    "Mi az utolsó, amit lefekvés előtt csinálsz?"
  ],
  megjegyzes: "Az SCI szűrő; a 16 pontos határ a szerzők által javasolt, a klinikai diagnózishoz orvosi vizsgálat kell."
};

D.ess = {
  jo: "lo",
  cim: "A nappali álmosság mélyebben",
  bevezeto: [
    "Az Epworth-skála az elalvási hajlamot méri, nem a fáradtságot. A magas érték azt jelzi, hogy a szervezeted napközben is alvást „követel”, mert éjjel nem kap eleget vagy nem elég jó minőségűt.",
    "Leggyakoribb okai: kevés alvás, alvási apnoe, egyes gyógyszerek, és ritkábban más alvászavarok (pl. narkolepszia)."
  ],
  skalak: {
    total: { cut: [10, 16], hi: "Súlyos nappali álmosság: orvosi kivizsgálás javasolt.", mid: "Enyhe vagy közepes nappali álmosság.", lo: "A nappali álmosságod a normál tartományban van." }
  },
  gyoker: [
    "Ha horkolsz, ha a partnered légzéskimaradást észlel, ha száraz szájjal vagy fejfájással ébredsz, gondolj alvási apnoéra: ez gyakori, és jól kezelhető.",
    "Ha keveset alszol (a munka vagy a késői lefekvés miatt), az álmosság a legegyszerűbben az alvásidő növelésével javul."
  ],
  mindennap: [
    "Nappali álmosságnál a koncentráció hullámzik, a délután különösen nehéz, és veszélyes lehet a vezetés vagy a gépkezelés."
  ],
  fennmarad: "Az álmosságot sokan koffeinnel és akaraterővel kompenzálják; ez elfedi a jelzést, de az okot nem szünteti meg.",
  lepesek: [
    "<strong>Alvásnapló.</strong> Egy hétig írd fel, mikor fekszel, mikor kelsz, mennyit alszol szerinted.",
    "<strong>Plusz 30 perc.</strong> Két hétig feküdj le fél órával korábban, és nézd meg, változik-e az álmosság.",
    "<strong>Horkolás?</strong> Kérdezd meg a partneredet; ha igen, beszélj orvossal.",
    "<strong>Vezetés.</strong> Ha álmos vagy, ne vezess; 16 vagy afölött mindenképp kérj orvosi kivizsgálást."
  ],
  kerdesek: [
    "Hány órát alszol átlagosan egy éjszaka?",
    "Horkolsz? Mondta már valaki, hogy alvás közben kihagy a légzésed?",
    "Mikor a legrosszabb az álmosság napközben?"
  ],
  megjegyzes: "Az Epworth-skála szűrő; a 10 pontos határ a nemzetközi gyakorlatban használt érték."
};

D.bas = {
  jo: "hi",
  cim: "A testképed mélyebben",
  bevezeto: [
    "A pozitív testkép nem azt jelenti, hogy tökéletesnek látod a tested, hanem hogy <strong>elfogadod, tiszteled és gondoskodsz róla</strong>, a hibáival együtt. A kutatások szerint ez független attól, mennyire felel meg a tested az aktuális ideálnak.",
    "A BAS-2 nemtől függetlenül használható: férfiaknál a testkép gyakran izmosság, erő és teljesítmény körül forog."
  ],
  skalak: {
    total: { cut: [2.99, 4], hi: "Elfogadó, értékelő testkép.", mid: "Vegyes testkép: helyzetfüggően elfogadó vagy kritikus.", lo: "Kritikus testkép: most inkább a hibák kerülnek előtérbe." }
  },
  gyoker: [
    "A testképet a korai megjegyzések (család, kortársak), a média és a közösségi média összehasonlításai, és a teljesítményhez kötött önértékelés formálják.",
    "A kritikus testkép gyakran a szélesebb önkritika része: érdemes az RSES (önértékelés) és az SCS-SF (önegyüttérzés) eredményeivel együtt nézni."
  ],
  mindennap: [
    "Kritikus testképnél gyakori a tükör kerülése vagy túl gyakori ellenőrzése, az összehasonlítás, és az, hogy a mozgás inkább büntetés, mint öröm."
  ],
  fennmarad: "Az összehasonlítás (különösen a közösségi médiában) folyamatosan új hiányokat mutat. A kört a figyelem áthelyezése töri meg: a kinézetről a funkcióra és az érzésre.",
  lepesek: [
    "<strong>Funkció-lista.</strong> Írd le, mi mindenre képes ma a tested (séta, ölelés, munka, sport).",
    "<strong>Média-diéta.</strong> Egy hétre kövesd ki azokat a fiókokat, amelyek után rosszabbul érzed magad.",
    "<strong>Mozgás örömből.</strong> Válassz olyan mozgást, ami jólesik, nem azt, ami „kellene”.",
    "<strong>Ha a testtel való elégedetlenség evéssel, kontrollal vagy kerüléssel jár</strong>, beszélj róla szakemberrel."
  ],
  kerdesek: [
    "Mit szeretsz a testedben, ha a kinézetet félreteszed?",
    "Mikor érzed magad a legjobban a bőrödben?",
    "Kinek a hangja szól, amikor kritizálod a tested?"
  ],
  megjegyzes: "A BAS-2 sávjai tájékozódók; magyar normaérték nincs."
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
