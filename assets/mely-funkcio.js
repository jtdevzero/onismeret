/* Mélyelemzés: funkcio.html — IIEF-15, PEDT, SDI-2, DES-II */
(function(D){

D.iief = {
  jo: "hi",
  cim: "A szexuális funkciód mélyebben",
  bevezeto: [
    "Az IIEF-15 a férfi szexuális funkció öt területét méri az elmúlt négy hétre vonatkozóan: <strong>erekció</strong>, <strong>orgazmus</strong>, <strong>vágy</strong>, <strong>a közösülással való elégedettség</strong> és az <strong>általános szexuális elégedettség</strong>. Ezeket érdemes külön-külön olvasni: lehet, hogy a vágy erős, de az erekció bizonytalan, vagy a funkció rendben van, mégis alacsony az elégedettség – és mindegyik másfajta megoldás felé mutat.",
    "Fontos, hogy a szexuális működés <strong>biopszichoszociális</strong> jelenség: egyszerre függ az érrendszertől, a hormonoktól, az idegrendszertől, a gyógyszerektől, az alvástól és a stressztől, valamint a teljesítményszorongástól, az önképtől és a kapcsolat minőségétől. Egy alacsony pontszám tehát nem „kudarc”, hanem információ arról, hol érdemes vizsgálódni. Az erekciós nehézség ráadásul sokszor az érrendszeri egészség korai jelzője, ezért orvosi szempontból is érdemes komolyan venni."
  ],
  skalak: {
    EF: { cut: [16, 26], hi: "Az erekciós funkciód a tesztben nem jelez nehézséget (26–30 pont). Az erekció általában megbízhatóan kialakul és fennmarad.", mid: "Az erekciós funkciód enyhe vagy enyhe–közepes nehézséget jelez (17–25 pont). Ez gyakran helyzetfüggő: stressz, fáradtság, alkohol, új partner vagy teljesítményszorongás mellett jobban előjön.", lo: "Az erekciós funkciód közepes vagy súlyos nehézséget jelez (16 pont vagy kevesebb). Ez érdemes orvosi kivizsgálásra (urológus, andrológus), mert gyakran kezelhető, és a háttérben érrendszeri, hormonális vagy gyógyszeres ok is állhat.", tipLo: "Kérj orvosi kivizsgálást (vérnyomás, vércukor, koleszterin, tesztoszteron, gyógyszerek áttekintése). A reggeli erekció jelenléte segíthet elkülöníteni a pszichés és testi hátteret." },
    OF: { hi: "Az orgazmus és az ejakuláció általában rendben működik.", mid: "Az orgazmus időnként nehezebben vagy kevésbé kielégítően jön létre.", lo: "Az orgazmus rendszeresen nehéz vagy elmarad. Ennek lehet gyógyszeres (pl. egyes antidepresszánsok), hormonális vagy pszichés háttere.", tipLo: "Nézd át orvossal a szedett gyógyszereket. A figyelem, a stimuláció módja és a teljesítménynyomás csökkentése gyakran sokat számít." },
    SD: { hi: "A szexuális vágyad erős és gyakori.", mid: "A vágyad közepes, időszakonként változó.", lo: "A vágyad alacsony. Ennek gyakori okai a stressz, a kimerültség, a depresszió, a kapcsolati feszültség, egyes gyógyszerek és az alacsony tesztoszteron.", tipLo: "Figyeld meg, mikor erősebb és mikor gyengébb a vágyad, és mi változik ilyenkor (alvás, stressz, kapcsolat). Tartósan alacsony vágynál érdemes hormonvizsgálatot is kérni." },
    IS: { hi: "A közösüléssel kapcsolatos elégedettséged magas.", mid: "A közösüléssel közepesen vagy változóan vagy elégedett.", lo: "A közösüléssel alacsony az elégedettséged. Ez lehet a funkcióból fakadó, de lehet a kapcsolati vagy kommunikációs elégedetlenség jele is.", tipLo: "Beszélj a partnereddel arról, mi esik jól és mi nem – a szexuális elégedettség egyik legerősebb előrejelzője a nyílt kommunikáció." },
    OS: { hi: "Az általános szexuális életeddel elégedett vagy.", mid: "A szexuális életeddel részben vagy elégedett.", lo: "Általánosságban elégedetlen vagy a szexuális életeddel. Ez gyakran a kapcsolat, az önkép vagy a stressz felől érdemes megnézni, nem csak a funkció felől.", tipLo: "Fogalmazd meg, mi hiányzik: gyakoriság, közelség, változatosság, könnyedség, biztonság? A pontos megnevezés a megoldás első lépése." }
  },
  gyoker: [
    "Az erekciós és szexuális nehézségek hátterében gyakran több tényező áll egyszerre. A <strong>testi</strong> oldal: érrendszeri állapot, cukorbetegség, magas vérnyomás, dohányzás, túlsúly, alváshiány, alkohol, egyes gyógyszerek (vérnyomáscsökkentők, antidepresszánsok), hormonális eltérések. A <strong>pszichés</strong> oldal: teljesítményszorongás, stressz, depresszió, önértékelés, korábbi negatív tapasztalatok.",
    "Gyakran egy testi ok indít el egy pszichés kört: egy-két sikertelen alkalom után megjelenik a „mi lesz, ha megint” félelem, a figyelem a teljesítményre szűkül (spectatoring), ami tovább rontja a működést. A <strong>kapcsolati</strong> tényezők – feszültség, kimondatlan konfliktus, nyomás – szintén erősen hatnak."
  ],
  mindennap: [
    "A szexuális nehézség ritkán marad a hálószobában: érintheti az önértékelést, a férfiasság-élményt, az intimitás kerülését, és a kapcsolatban feszültséget, távolodást okozhat. A partner gyakran saját magára vonatkoztatja („nem vagyok elég vonzó”), ha nem beszéltek róla.",
    "A teljesítményszorongás jellegzetes jele, hogy egyedül (vagy reggel) minden működik, partnerrel viszont nem; ez erős jelzés arra, hogy a pszichés tényezők nagy szerepet játszanak."
  ],
  fennmarad: "A teljesítményszorongás önfenntartó: minél inkább figyeled, működik-e, annál kevésbé működik. Az intimitás kerülése pedig elveszi a lehetőséget a pozitív tapasztalatokra.",
  lepesek: [
    "<strong>Orvosi kivizsgálás.</strong> Különösen tartós vagy erős nehézségnél: vérnyomás, vércukor, lipidek, hormonok, gyógyszerek. Ez nem szégyen, hanem egészségügyi rutin.",
    "<strong>Életmód.</strong> Alvás, rendszeres mozgás, kevesebb alkohol, dohányzás elhagyása – ezek az erekciós funkcióra mérhetően hatnak.",
    "<strong>A teljesítmény helyett az élmény.</strong> Az érzéki fókusz (sensate focus) gyakorlatok a közösülés nyomása nélkül építik újra az érintés és az izgalom biztonságát.",
    "<strong>Kommunikáció.</strong> Beszélj a partnereddel nyugodt helyzetben, nem a hálószobában. A „mi” közös feladatává tett nehézség sokkal kisebb terhet jelent.",
    "<strong>Szexuálterápia.</strong> Pszichés vagy kapcsolati háttérnél a szexuálterápia kifejezetten hatékony, akár gyógyszeres kezeléssel kombinálva."
  ],
  kerdesek: [
    "Milyen helyzetekben működik jól, és milyenekben nehezebben?",
    "Mire figyelsz szex közben: az élményre vagy arra, hogy „működik-e”?",
    "Beszéltél-e erről a partnereddel vagy orvossal – és ha nem, mi tart vissza?"
  ]
};

D.pedt = {
  jo: "lo",
  cim: "Az időzítés mélyebben",
  bevezeto: [
    "A PEDT a korai magömlés (PE) öt jellemzőjét méri: <strong>a késleltetés nehézségét</strong>, <strong>a túl gyors ejakulációt</strong>, <strong>a minimális ingerre bekövetkező ejakulációt</strong>, <strong>a frusztrációt</strong> és <strong>a partner elégedetlenségével kapcsolatos aggodalmat</strong>. A teszt tehát nem csak az időt, hanem a kontroll-élményt és a megélt terhet is vizsgálja: a probléma ott kezdődik, ahol a kontroll hiánya rendszeresen frusztrációt vagy feszültséget okoz.",
    "A korai magömlés a leggyakoribb férfi szexuális nehézség; becslések szerint a férfiak jelentős része tapasztalja valamikor. Két formáját különítik el: az <strong>élethosszig tartót</strong> (mindig így volt) és a <strong>szerzettet</strong> (később alakult ki, gyakran stressz, szorongás, erekciós nehézség vagy prosztata-probléma mellett). A kezelési lehetőségek jók, és sok esetben viselkedéses technikákkal is jelentős javulás érhető el."
  ],
  skalak: {
    total: { cut: [8, 11], hi: "Az összpontszámod (11 vagy több) a korai magömlés tartományába esik. A kontroll hiánya rendszeresen jelen van, és ez feszültséget vagy frusztrációt okoz.", mid: "Az összpontszámod (9–10) határeset: időnként jelentkezik a nehézség, de nem állandóan.", lo: "Az összpontszámod (8 vagy kevesebb) nem utal korai magömlésre: általában van kontrollod az időzítés felett.", tipHi: "A „start–stop” és a „squeeze” technika rendszeres gyakorlása (először egyedül, majd partnerrel) javítja az izgalom felismerését és a kontrollt. Tartós nehézségnél urológus vagy szexuálterapeuta segíthet, gyógyszeres lehetőségek is vannak." }
  },
  gyoker: [
    "Az élethosszig tartó formában szerepet játszhat a biológiai érzékenység (szerotonin-rendszer, a péniszérzékenység, genetikai tényezők) és a korai tanulási tapasztalatok: ha a szexuális élmények rendszeresen sietve, a lebukás félelmében zajlottak, a test „megtanulja” a gyorsaságot.",
    "A szerzett formában gyakori a szorongás, a stressz, a kapcsolati feszültség, az erekciós nehézség (a gyors ejakuláció ilyenkor „menekülés” az erekció elvesztése elől), a pajzsmirigy-problémák és a prosztatagyulladás. A teljesítményszorongás mindkét formát felerősíti."
  ],
  mindennap: [
    "A korai magömlés gyakran erős szégyennel jár, és az intimitás kerüléséhez vezethet. Sok férfi a partner elégedetlenségétől fél, miközben a partnerek gyakran sokkal kevésbé az időt, inkább a kapcsolódás hiányát vagy a visszahúzódást élik meg terhesnek.",
    "A szex teljesítményként való megélése (a „kibírni” fókusz) gyakran éppen a szorongást és ezzel a gyorsaságot erősíti."
  ],
  fennmarad: "A szorongás felgyorsítja az izgalmat, a gyors ejakuláció pedig újabb szorongást kelt a következő alkalom előtt. Az intimitás kerülése miatt kevés gyakorlási lehetőség van.",
  lepesek: [
    "<strong>Izgalom-tudatosság.</strong> Tanuld meg felismerni az izgalom szintjeit egy 1–10-es skálán, és a „pont, ahonnan nincs visszaút” előtti pillanatot.",
    "<strong>Viselkedéses technikák.</strong> Start–stop, squeeze, lassabb tempó, légzés, medencefenék-tudatosság – ezek rendszeres gyakorlással mérhetően javítják a kontrollt.",
    "<strong>A szex újradefiniálása.</strong> A szex nem csak a közösülésből áll; az élvezet és a kapcsolódás sokféleképpen megvalósulhat, ami csökkenti a nyomást.",
    "<strong>Kommunikáció a partnerrel.</strong> A titkolózás helyett a közös megoldáskeresés csökkenti a szorongást.",
    "<strong>Szakember.</strong> Tartós nehézségnél urológus (testi okok, gyógyszeres lehetőségek) és szexuálterapeuta (viselkedéses és pszichés munka)."
  ],
  kerdesek: [
    "Mindig így volt, vagy egy időszaktól kezdődött?",
    "Mit érzel közvetlenül a szexuális helyzet előtt: izgalmat vagy szorongást?",
    "Hogyan beszélt erről a partnered – vagy beszéltetek-e róla egyáltalán?"
  ]
};

D.sdi = {
  cim: "A vágyad mélyebben",
  bevezeto: [
    "Az SDI-2 a szexuális vágyat két irányban méri: a <strong>partneri (diádikus) vágyat</strong>, vagyis a vágyat egy másik ember iránt és vele együtt, és a <strong>szóló vágyat</strong>, a magányos szexuális aktivitás iránti vágyat. A kettő nem ugyanaz: lehet erős a szóló vágy, miközben a partneri gyenge (ez gyakran a kapcsolatról, nem a libidóról szól), vagy fordítva.",
    "A vágy nem állandó mennyiség. A modern szexológia szerint két formája van: a <strong>spontán vágy</strong>, amely „magától” megjelenik, és a <strong>reaktív vágy</strong>, amely az érintés, a közelség, az izgalom hatására ébred. Sok embernél – különösen hosszú kapcsolatban – a reaktív forma a jellemző, és ez teljesen egészséges. Az alacsony spontán vágy tehát nem feltétlenül probléma."
  ],
  skalak: {
    D: { hi: "Erős a partneri vágyad: gyakran gondolsz a partnerrel közös szexualitásra, és fontos számodra.", mid: "A partneri vágyad közepes, a helyzettől és a kapcsolat állapotától függően változik.", lo: "A partneri vágyad alacsony. Ez sokszor nem a libidó hiánya, hanem a kapcsolati feszültség, a stressz, a kimerültség, a rutin vagy egy kimondatlan konfliktus jele.", tipLo: "Figyeld meg, hogy a szóló vágyad is alacsony-e. Ha nem, a kapcsolat felől érdemes keresni: közelség, sértettség, kommunikáció, újdonság." },
    S: { hi: "Erős a szóló vágyad: a magányos szexualitás rendszeres része az életednek.", mid: "A szóló vágyad közepes.", lo: "A szóló vágyad alacsony. Ez lehet személyes preferencia, de lehet a stressz, a kimerültség, a hormonok vagy a szexualitással kapcsolatos szégyen jele is." }
  },
  profil: function(r, lv){
    if (lv.D === 'lo' && (lv.S === 'mid' || lv.S === 'hi')) return ["<strong>A partneri vágyad alacsonyabb, mint a szóló vágyad.</strong> Ez gyakori mintázat, és általában azt jelzi, hogy a libidó maga megvan, de a partneri helyzetben valami gátolja: feszültség, teljesítménynyomás, kimondatlan sértettség, a közelség kerülése, vagy egyszerűen a rutin. A kérdés tehát nem az, hogy „mi a baj velem”, hanem hogy mi történik a kapcsolatban."];
    if (lv.D === 'lo' && lv.S === 'lo') return ["<strong>Mindkét vágyformád alacsony.</strong> Ez általános libidócsökkenésre utalhat, aminek gyakori okai a krónikus stressz, a kimerültség, az alváshiány, a depresszió, egyes gyógyszerek és hormonális tényezők. Ha ez új állapot és zavar, érdemes orvossal is átnézni."];
    return [];
  },
  gyoker: [
    "A vágyat biológiai tényezők (hormonok, gyógyszerek, alvás, egészség), pszichés tényezők (stressz, hangulat, önkép, szégyen, trauma) és kapcsolati tényezők (közelség, biztonság, konfliktus, újdonság, vonzalom) együtt alakítják. A <strong>kettős kontroll modell</strong> szerint a vágyat egy gázpedál (izgalmi ingerek) és egy fék (gátló tényezők: stressz, félelem, feszültség) együtt szabályozza – az alacsony vágy gyakran nem a gáz hiánya, hanem a túl erős fék.",
    "A gyerekkori és kulturális üzenetek a szexualitásról (bűn, veszély, szégyen, vagy épp teljesítmény) szintén mélyen befolyásolják, mennyire engedheted meg magadnak a vágyat."
  ],
  mindennap: [
    "A vágyeltérés a párkapcsolatok egyik leggyakoribb konfliktusforrása. A magasabb vágyú fél gyakran elutasítva érzi magát, az alacsonyabb vágyú fél nyomás alatt – és a nyomás tovább csökkenti a vágyat.",
    "Hosszú kapcsolatban a vágy gyakran a biztonság és az újdonság egyensúlyán múlik: a túl sok összeolvadás csökkentheti, a különállás, a játékosság és az új élmények erősíthetik."
  ],
  fennmarad: "A vágyeltérés körüli feszültség (nyomás – elutasítás – sértettség) maga is fékként működik, ami tovább csökkenti a vágyat.",
  lepesek: [
    "<strong>Fékek és gázpedálok.</strong> Írd le, mi kapcsolja be a vágyadat és mi oltja ki. A legtöbb embernél a fékek csökkentése többet hoz, mint a gáz erősítése.",
    "<strong>Reaktív vágy elfogadása.</strong> Ha nálad a vágy inkább a közelség hatására ébred, ez nem probléma: tudatosan teremtsetek helyzeteket az érintésre nyomás nélkül.",
    "<strong>Stressz és alvás.</strong> A krónikus stressz és az alváshiány a vágy egyik leggyakoribb kioltója.",
    "<strong>Kommunikáció.</strong> Beszéljetek a vágyról vád és nyomás nélkül: mit szeretnél, mi segítene, mi akadályoz?",
    "<strong>Szakember.</strong> Tartós, zavaró vágycsökkenésnél orvosi (hormonok, gyógyszerek) és szexuálterápiás segítség is lehetséges."
  ],
  kerdesek: [
    "Milyen helyzetben érezted utoljára erősnek a vágyadat?",
    "Mi működik nálad fékként: stressz, fáradtság, feszültség, szégyen?",
    "Hogyan beszéltek a vágyról a kapcsolatodban?"
  ]
};

D.des = {
  jo: "lo",
  cim: "A disszociatív élmények mélyebben",
  bevezeto: [
    "A DES-II azt méri, milyen gyakran fordulnak elő a <strong>disszociatív élmények</strong> a mindennapjaidban. A disszociáció egy természetes, kontinuumon elhelyezkedő folyamat: a tudat, az emlékezet, az identitás vagy az észlelés egyes részei elválnak egymástól. Enyhe formái mindenkinél előfordulnak (elmerülés egy filmben, „robotpilóta” vezetés közben), erősebb formái viszont gyakran a túlterhelés és a trauma elleni védekezést jelzik.",
    "Három fő területe van: az <strong>abszorpció</strong> (elmerülés, beszűkült figyelem), az <strong>amnéziás élmények</strong> (emlékezeti kiesések) és a <strong>deperszonalizáció/derealizáció</strong> (idegennek, valószerűtlennek érezni magad vagy a környezetet). A DES <strong>szűrőeszköz, nem diagnózis</strong>: a magas pontszám azt jelzi, hogy érdemes alaposabban megvizsgálni a háttért, de önmagában nem dönt el semmit."
  ],
  skalak: {
    total: { cut: [10, 30], hi: "Az átlagpontszámod 30 vagy magasabb, ami a kutatásokban a további vizsgálatot indokló küszöb. Ez gyakran a stressz és a trauma feldolgozásával összefüggő, jelentős disszociatív élményekre utal. Mindenképpen érdemes traumatudatos szakemberrel átbeszélni.", mid: "Az átlagpontszámod a közepes tartományban van: a disszociatív élmények jelen vannak, főleg stresszben, de nem uralják a mindennapokat.", lo: "Az átlagpontszámod alacsony: a disszociatív élmények ritkák, a mindennapokban jellemző tartományban vannak.", tipHi: "Ez a terület szakemberrel együtt dolgozható fel biztonságosan. Keress traumatudatos pszichoterapeutát vagy pszichiátert, és mutasd meg neki ezt az eredményt." },
    ABS: { cut: [15, 35], hi: "Gyakran merülsz el annyira egy tevékenységben vagy a gondolataidban, hogy a környezet kiesik. Ez egyrészt képesség (kreativitás, fókusz), másrészt menekülőút is lehet a nehéz érzések elől.", mid: "Időnként erősen elmerülsz, de vissza tudsz térni.", lo: "Ritkán merülsz el annyira, hogy elveszítsd a kapcsolatot a környezettel." },
    AMN: { cut: [10, 30], hi: "Gyakran fordulnak elő emlékezeti kiesések: nem emlékszel, hogyan kerültél valahova, vagy mit csináltál egy időszakban. Ez a disszociáció komolyabb jele, és mindenképpen szakmai figyelmet érdemel.", mid: "Időnként előfordulnak emlékezeti kiesések, főleg stresszben.", lo: "Ritkák az emlékezeti kiesések.", tipHi: "Vezess naplót az emlékezeti kiesésekről (mikor, milyen helyzetben), és vidd el szakemberhez. Ennek a területnek a feltárása szakmai segítséget igényel." },
    DPD: { cut: [10, 30], hi: "Gyakran érzed úgy, hogy kívülről nézed magad, a tested vagy a környezeted valószerűtlen, mintha álomban lennél. Ez a túlterhelt idegrendszer védekezése: amikor a valóság túl sok, a rendszer „lecsavarja a hangerőt”.", mid: "Időnként megjelenik az idegenség vagy valószerűtlenség érzése, főleg stresszben vagy fáradtan.", lo: "Ritkán érzed magad vagy a környezeted idegennek.", tipHi: "Földelő gyakorlatok: 5-4-3-2-1 (öt dolog, amit látsz, négy, amit hallasz…), hideg víz a kézen, a talp érzése a földön. Ezek visszahoznak a jelenbe." }
  },
  gyoker: [
    "A disszociáció a legtöbbször <strong>védekező mechanizmus</strong>: amikor egy helyzet elviselhetetlen és nincs menekvés, a tudat „leválasztja” magát a tapasztalatról. Gyerekkorban ez különösen gyakori, ha a gyerek ismétlődő, ijesztő helyzetekben volt (bántalmazás, elhanyagolás, kiszámíthatatlan vagy ijesztő gondozó), mert a gyerek nem tud elmenekülni. A disszociáció akkor a túlélés eszköze volt.",
    "Felnőttkorban a disszociatív élményeket erősítheti a krónikus stressz, az alváshiány, a szorongás, a pánik és egyes szerek. Az abszorpció részben vonásszerű is: egyes emberek természetüknél fogva hajlamosabbak az elmerülésre."
  ],
  mindennap: [
    "A disszociáció gyakran észrevétlen: „kiesések” beszélgetés közben, időérzék elvesztése, robotpilóta, a test vagy az érzések tompasága. Kapcsolatokban a partner úgy élheti meg, hogy „nem vagy jelen”, konfliktusban pedig hirtelen elérhetetlenné válsz.",
    "Gyakran együtt jár a nehéz érzések, emlékek vagy helyzetek kerülésével, és a szorongással vagy depresszióval."
  ],
  fennmarad: "A disszociáció rövid távon csökkenti az elviselhetetlen érzéseket, ezért a rendszer egyre könnyebben nyúl hozzá – még akkor is, ha a veszély már elmúlt.",
  lepesek: [
    "<strong>Szakmai segítség.</strong> Magas pontszámnál, különösen emlékezeti kieséseknél, keress traumatudatos szakembert. Ezt a területet nem érdemes egyedül feltárni.",
    "<strong>Földelés.</strong> Tanulj meg néhány földelő technikát (érzékszervi figyelem, légzés, mozgás), és használd, amikor a valószerűtlenség érzése megjelenik.",
    "<strong>Kiváltók felismerése.</strong> Vezess naplót: milyen helyzetekben, érzésekben, emberek mellett jelentkezik a disszociáció?",
    "<strong>Biztonság és stabilitás.</strong> Rendszeres alvás, napirend, biztonságos kapcsolatok – a traumafeldolgozás első lépése mindig a stabilizáció.",
    "<strong>Gyengéd tempó.</strong> A disszociáció a túlterhelés jele; a cél nem az, hogy erővel áttörd, hanem hogy fokozatosan több biztonságot építs."
  ],
  kerdesek: [
    "Milyen helyzetekben veszed észre, hogy „nem vagy ott”?",
    "Mi segít visszatérni a jelenbe?",
    "Van-e olyan időszak az életedben, amire kevésbé emlékszel?"
  ],
  megjegyzes: "A DES-II szűrőeszköz, nem diagnózis; a 30-as küszöb a kutatásokban a további vizsgálat jelzésére szolgál."
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
