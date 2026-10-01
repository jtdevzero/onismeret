/* Mélyelemzés: kapcsolat.html — LAS-SF, Konfliktusmódok, Gottman-térkép, Fisher-temperamentum */
(function(D){

D.las = {
  cim: "A szeretetstílusod mélyebben",
  bevezeto: [
    "John Alan Lee szeretetstílus-elmélete (Hendrick és Hendrick mérőeszközével) hat módot különít el, ahogyan az emberek a romantikus szerelmet megélik: <strong>Eros</strong> (szenvedélyes, intenzív vonzalom), <strong>Ludus</strong> (játékos, könnyed, elköteleződést kerülő), <strong>Storge</strong> (barátságból növő, nyugodt), <strong>Pragma</strong> (gyakorlatias, tudatos párválasztás), <strong>Mania</strong> (birtokló, szorongó, függő) és <strong>Agape</strong> (önzetlen, önfeláldozó).",
    "A stílusok nem kizárólagosak: mindenki több stílus keverékét hordozza, és a keverék a kapcsolattól és az életszakasztól függően változhat. A kutatások szerint az Eros és az Agape a kapcsolati elégedettséggel, a Ludus és a Mania inkább a kapcsolati problémákkal jár együtt – de az illeszkedés is számít: két hasonló stílusú ember általában könnyebben érti egymást."
  ],
  skalak: {
    eros: { jo: "hi", hi: "Erős az <strong>Eros</strong>: a szerelem nálad intenzív, testi-lelki vonzalom, gyors kötődés, a „ő az igazi” érzése. Ez sok örömöt ad; a kihívás akkor jön, amikor a kezdeti intenzitás alábbhagy.", mid: "Az Eros közepes: a szenvedély fontos, de nem az egyetlen alapja a kapcsolatnak.", lo: "Az Eros alacsony: a szerelmet kevésbé éled meg intenzív, azonnali vonzalomként. Ez lehet nyugodtabb stílus, de lehet a hosszú távú kiábrándultság vagy a kötődési elkerülés jele is." },
    ludus: { jo: "lo", hi: "Erős a <strong>Ludus</strong>: a szerelmet játékként, élvezetként éled meg, kerülöd a túl erős elköteleződést, és szereted a szabadságot. A kutatások szerint ez a stílus gyakran a kötődési elkerüléssel függ össze.", mid: "A Ludus közepes: értékeled a könnyedséget és a játékosságot, de el tudsz kötelezni.", lo: "A Ludus alacsony: a szerelem nálad komoly ügy, nem játék.", tipHi: "Figyeld meg, mi történik benned, amikor egy kapcsolat elmélyül: kíváncsiság vagy a menekülés késztetése? A könnyedség érték, de lehet védekezés is." },
    storge: { jo: "hi", hi: "Erős a <strong>Storge</strong>: a szerelem nálad barátságból, közös érdeklődésből, lassan növő bizalomból születik. Stabil, nyugodt, tartós stílus.", mid: "A Storge közepes: a barátság fontos része a szerelemnek számodra.", lo: "A Storge alacsony: a szerelmet kevésbé éled meg barátságként; a romantikus és a baráti kapcsolat nálad külön dolog." },
    pragma: { hi: "Erős a <strong>Pragma</strong>: tudatosan, gyakorlati szempontok alapján választasz partnert (értékek, életcélok, család, anyagiak). Ez stabilitást ad; a kihívás a spontaneitás és a romantika helyének megtalálása.", mid: "A Pragma közepes: a gyakorlati szempontok számítanak, de nem csak azok.", lo: "A Pragma alacsony: a párválasztásban kevésbé figyelsz a gyakorlati illeszkedésre; a szív dönt." },
    mania: { jo: "lo", hi: "Erős a <strong>Mania</strong>: a szerelem nálad szorongó, birtokló, hullámzó: erős féltékenység, a partner folyamatos megerősítésének igénye, a kapcsolat körüli gondolatok uralma. Ez a stílus a legszorosabban a kötődési szorongással és az elhagyatottság-sémával függ össze.", mid: "A Mania közepes: időnként megjelenik a féltékenység és a szorongás, főleg bizonytalan helyzetekben.", lo: "A Mania alacsony: a szerelem nálad nem jár erős szorongással vagy birtoklással.", tipHi: "Ha a szorongás elhatalmasodik, figyelj az önszabályozásra (légzés, mozgás, barátok), és kérj közvetlenül megnyugtatást a vádaskodás helyett. Érdemes kitölteni az ECR-R-t és a YSQ elhagyatottság sémáját is." },
    agape: { hi: "Erős az <strong>Agape</strong>: önzetlenül adsz, a partner jólléte nálad előre kerül. Ez mély szeretetet tükröz; a kockázat az önfeláldozás és a kihasználhatóság.", mid: "Az Agape közepes: adsz, de figyelsz a saját igényeidre is.", lo: "Az Agape alacsony: a szerelemben a kölcsönösség fontos számodra; nem adsz feltétel nélkül.", tipHi: "Figyelj a kölcsönösségre: a szeretet nem csak adásból áll, hanem kapásból is." }
  },
  gyoker: [
    "A szeretetstílusokat a kötődési minta, a személyiség (pl. extraverzió, neuroticizmus), a korábbi kapcsolati tapasztalatok és a kulturális minták formálják. A Mania szorosan összefügg a szorongó kötődéssel, a Ludus az elkerülővel, a Storge és a Pragma a biztonságos, stabil működéssel.",
    "A stílus életszakaszonként is változhat: fiatalabb korban gyakoribb a Ludus és az Eros, később a Storge és a Pragma. Egy fájdalmas szakítás után felerősödhet a Ludus vagy a Mania."
  ],
  mindennap: [
    "A stílusok eltérése gyakori konfliktusforrás: az Eros-orientált fél romantikát és szenvedélyt vár, a Pragma-orientált fél stabilitást és tervezést; a Ludus-orientált szabadságot, a Mania-orientált biztonságot és jelenlétet.",
    "A stílus azt is befolyásolja, hogyan reagálsz a kapcsolat válságaira: van, aki harcol érte, van, aki elengedi, van, aki szorong."
  ],
  lepesek: [
    "<strong>Beszéljétek meg a stílusaitokat.</strong> Töltse ki a partnered is, és nézzétek meg, hol hasonlítotok és hol tértek el.",
    "<strong>A szenvedély ápolása.</strong> Hosszú kapcsolatban az Eros nem magától marad meg: új közös élmények, figyelem, játékosság táplálják.",
    "<strong>A szorongás kezelése.</strong> Magas Mania esetén az önszabályozás és a kötődési biztonság építése a legfontosabb.",
    "<strong>A kölcsönösség figyelése.</strong> Magas Agape esetén figyelj arra, hogy kapsz-e is.",
    "<strong>A stílus és a kötődés összekapcsolása.</strong> Nézd meg a szeretetstílusod mellett az ECR-R eredményedet is: a kettő együtt sokkal többet mond."
  ],
  kerdesek: [
    "Melyik stílus dominált a legfontosabb kapcsolataidban – és mindegyikben ugyanaz volt?",
    "Mi történik benned, amikor a kezdeti szenvedély alábbhagy?",
    "Milyen stílusú partnerrel érezted magad a legjobban?"
  ]
};

D.tki = {
  cim: "A konfliktuskezelési stílusod mélyebben",
  bevezeto: [
    "A Thomas–Kilmann-modell két dimenzió mentén írja le a konfliktuskezelést: mennyire <strong>érvényesíted a saját érdekeidet</strong> (asszertivitás), és mennyire <strong>veszed figyelembe a másikét</strong> (kooperativitás). Ebből öt mód adódik: <strong>versengő</strong> (én nyerek), <strong>alkalmazkodó</strong> (te nyersz), <strong>elkerülő</strong> (senki nem foglalkozik vele), <strong>kompromisszumkereső</strong> (mindketten engedünk), és <strong>együttműködő</strong> (közösen keresünk olyan megoldást, ami mindkettőnknek jó).",
    "Nincs „legjobb” mód: mindegyiknek megvan a helye. A versengés vészhelyzetben hasznos, az alkalmazkodás akkor, ha a kapcsolat fontosabb a témánál, az elkerülés, ha a téma jelentéktelen vagy a felek túl feszültek. A probléma akkor jelentkezik, ha egy mód <strong>automatikussá válik</strong>, és minden helyzetben azt használod – vagy ha egy módot egyáltalán nem tudsz elérni."
  ],
  skalak: {
    comp: { hi: "Erős a <strong>versengő</strong> mód: határozottan kiállsz az álláspontod mellett, és nem engedsz könnyen. Ez gyors döntést és világos határokat ad; a költség a kapcsolatok sérülése és az, hogy a másik nem érzi magát meghallgatva.", mid: "A versengő mód közepes: ki tudsz állni magadért, ha fontos.", lo: "A versengő mód alacsony: nehéz kiállni a saját érdekeidért, ha az konfliktussal jár.", tipHi: "Mielőtt érvelsz, foglald össze a másik álláspontját úgy, hogy ő is egyetértsen vele. Ez nem gyengeség, hanem a meggyőzés leggyorsabb útja.", tipLo: "Gyakorold az asszertív kiállást kis tétű helyzetekben: „ezt másképp látom, és ez fontos nekem”." },
    coll: { jo: "hi", hi: "Erős az <strong>együttműködő</strong> mód: szeretsz olyan megoldást keresni, ami mindkét félnek jó. Ez a legidőigényesebb, de hosszú távon a legjobb eredményt hozó mód.", mid: "Az együttműködő mód közepes: fontos témákban keresed a közös megoldást.", lo: "Az együttműködő mód alacsony: ritkán jutsz el a mindkét félnek jó megoldásig; gyakrabban egyik fél enged.", tipLo: "Egy konfliktusban kérdezd meg: mi a te igazi érdeked ebben, és mi az enyém? A pozíciók mögötti érdekek gyakran összeegyeztethetők." },
    compr: { hi: "Erős a <strong>kompromisszumkereső</strong> mód: gyorsan megtalálod a középutat, ahol mindkét fél enged. Ez praktikus, de néha olyan megoldáshoz vezet, ami egyikőtöknek sem igazán jó.", mid: "A kompromisszum közepesen jellemző rád.", lo: "Ritkán keresel középutat; inkább az egyik végletet választod." },
    avoid: { jo: "lo", hi: "Erős az <strong>elkerülő</strong> mód: hajlamos vagy kitérni a konfliktus elől, halogatni, témát váltani, csendben maradni. Ez rövid távon nyugalmat ad, hosszú távon viszont a problémák felhalmozódnak, és a feszültség később robban.", mid: "Az elkerülés közepes: bizonyos témáknál vagy embereknél kitérsz a konfliktus elől.", lo: "Ritkán kerülöd a konfliktust: inkább szembenézel vele.", tipHi: "Állíts fel egy „24 órás szabályt”: ha valami zavar, egy napon belül hozd szóba, akár csak egy mondattal." },
    acc: { hi: "Erős az <strong>alkalmazkodó</strong> mód: a kapcsolat kedvéért gyakran engedsz, a másik igényeit előre helyezed. Ez megőrzi a békét, de hosszú távon neheztelést és a saját igények elvesztését hozhatja.", mid: "Az alkalmazkodás közepes: ha a kapcsolat fontos, engedsz.", lo: "Ritkán alkalmazkodsz; nehezen engedsz, ha a te igényeidről van szó.", tipHi: "Figyeld meg, mikor enged a szád „igen”-t, miközben belül „nem”-et érzel. Ott kezdődik a munka." }
  },
  gyoker: [
    "A konfliktuskezelési stílus a családi mintákból tanulódik: hogyan vitatkoztak a szüleid (vagy kerülték a vitát), mi történt, ha gyerekként ellentmondtál. Egy kiszámíthatatlan, dühös szülő mellett gyakran az alkalmazkodás vagy az elkerülés lesz a túlélési stratégia; egy domináns családban a versengés.",
    "A személyiség is számít (a barátságosság az alkalmazkodással, az alacsony barátságosság a versengéssel jár együtt), és a sémák is: a Leigázottság az alkalmazkodással, a Bizalmatlanság a versengéssel, az Érzelmi Gátoltság az elkerüléssel függ össze."
  ],
  mindennap: [
    "Párkapcsolatban gyakori a „üldöző–visszahúzódó” dinamika: az egyik fél konfrontál (versengő), a másik kitér (elkerülő), ami az elsőt még erősebb konfrontációra készteti.",
    "A munkahelyen a konfliktusstílus a vezetői hatékonyságot, a csapat légkörét és a karriert is befolyásolja: aki mindig alkalmazkodik, ritkábban kap előléptetést; aki mindig versenyez, nehezebben épít csapatot."
  ],
  fennmarad: "Az automatikus stílus megerősítődik, mert rövid távon működik: az elkerülés nyugalmat, az alkalmazkodás békét, a versengés győzelmet hoz. A hosszú távú költségeket viszont nehéz összekötni vele.",
  lepesek: [
    "<strong>Helyzet szerint válassz.</strong> Kérdezd meg minden konfliktus előtt: mennyire fontos a téma, és mennyire fontos a kapcsolat? Ebből adódik, melyik mód illik.",
    "<strong>A hiányzó mód gyakorlása.</strong> Azt a módot gyakorold, amelyik a legalacsonyabb nálad – ez bővíti a mozgásteret.",
    "<strong>Érdekek a pozíciók mögött.</strong> „Mit akarsz?” helyett „miért fontos ez neked?”. Ez nyitja meg az együttműködés útját.",
    "<strong>Szünet.</strong> Ha a feszültség túl nagy, kérj szünetet (20–30 perc), de mondd meg, mikor tértek vissza – ez nem elkerülés, hanem szabályozás.",
    "<strong>Utólagos átbeszélés.</strong> Egy konfliktus után beszéljétek meg, hogyan vitatkoztatok, nem csak azt, miről."
  ],
  kerdesek: [
    "Hogyan vitatkoztak a szüleid – és mit tanultál belőle?",
    "Melyik módot választod automatikusan, és melyiket soha?",
    "Mi az a konfliktus, amit most kerülsz?"
  ]
};

D.gott = {
  cim: "A kapcsolatod alapjai mélyebben",
  bevezeto: [
    "John Gottman évtizedes párkutatásai alapján a tartós kapcsolatok két dolgon múlnak: a <strong>barátság alapjain</strong> és a <strong>konfliktuskezelés minőségén</strong>. A barátság alapjai: a <strong>szeretettérkép</strong> (mennyire ismered a másik belső világát), a <strong>megbecsülés és csodálat</strong> (a pozitív alapérzés), az <strong>egymás felé fordulás</strong> (válaszolsz-e a másik apró kapcsolódási kísérleteire) és a <strong>javítási kísérletek</strong> (tudtok-e konfliktus közben lecsillapodni és újra kapcsolódni).",
    "A konfliktus „négy lovasa” a kapcsolat legerősebb kockázati jelei: <strong>kritika</strong> (a másik személyiségének támadása a viselkedés helyett), <strong>megvetés</strong> (lenézés, gúny, szemforgatás – a legerősebb előrejelzője a válásnak), <strong>védekezés</strong> (felelősség elhárítása) és <strong>falazás</strong> (érzelmi elzárkózás). Gottman szerint nem a konfliktus mennyisége, hanem ezek jelenléte és a javítás hiánya jósolja a kapcsolat végét."
  ],
  skalak: {
    strength: { jo: "hi", hi: "A kapcsolat barátsági alapjai összességében erősek.", mid: "A barátsági alapok vegyesek: vannak erős és gyengülő területek.", lo: "A barátsági alapok gyengék: kevés a kapcsolódás, a megbecsülés, a javítás. Ez a kapcsolat legfontosabb munkaterülete." },
    risk: { jo: "lo", hi: "A négy lovas összességében erősen jelen van a konfliktusaitokban. Ez komoly kockázati jelzés, amivel érdemes tudatosan foglalkozni, lehetőleg pártámogatással.", mid: "A négy lovas közepesen van jelen: bizonyos konfliktusokban megjelennek.", lo: "A négy lovas ritkán jelenik meg: a konfliktusaitok többnyire tiszteletteljesek." },
    maps: { jo: "hi", hi: "Erős a <strong>szeretettérkép</strong>: jól ismered a másik belső világát – vágyait, félelmeit, napi stresszeit.", mid: "A szeretettérkép közepes: ismered a másikat, de vannak „fehér foltok”.", lo: "A szeretettérkép gyenge: kevéssé ismered a másik mostani belső világát. Ez gyakran a rohanó életmód vagy az eltávolodás jele.", tipLo: "Kérdezz nyitott kérdéseket: „Mi foglalkoztat mostanában?”, „Mi a legnagyobb stressz most az életedben?”. Gottman szerint a szeretettérkép frissítése a legegyszerűbb erősítő gyakorlat." },
    fond: { jo: "hi", hi: "Erős a <strong>megbecsülés és csodálat</strong>: alapvetően tisztelettel és szeretettel nézel a másikra.", mid: "A megbecsülés közepes: van, de a napi súrlódások elhomályosíthatják.", lo: "Gyenge a megbecsülés és csodálat. Ez fontos jelzés: a megvetés éppen ezen a talajon nő.", tipLo: "Naponta egyszer mondj ki valamit, amit értékelsz a másikban. Írd le három dolgot, amiért eredetileg beleszerettél." },
    turn: { jo: "hi", hi: "Gyakran <strong>fordultok egymás felé</strong>: reagáltok a másik apró kapcsolódási kísérleteire (egy megjegyzés, egy kérdés, egy érintés).", mid: "Az egymás felé fordulás közepes: néha észreveszitek egymás jelzéseit, néha nem.", lo: "Ritkán fordultok egymás felé: a kapcsolódási kísérletek gyakran válasz nélkül maradnak. Gottman kutatásaiban ez az egyik legerősebb előrejelzője a kapcsolat romlásának.", tipLo: "Figyelj a másik apró jelzéseire („nézd, milyen szép az ég”), és fordulj felé: válaszolj, kérdezz vissza, tedd le a telefont." },
    repair: { jo: "hi", hi: "Erősek a <strong>javítási kísérletek</strong>: konfliktus közben is tudtok lecsillapodni, humorral, gesztussal, bocsánatkéréssel újra kapcsolódni.", mid: "A javítás néha sikerül, néha nem.", lo: "Gyengék a javítási kísérletek: a konfliktus után nehéz visszatalálni egymáshoz, és a sérelmek felhalmozódnak.", tipLo: "Egyezzetek meg előre egy javítási jelben (egy szó, egy gesztus), ami azt jelenti: „ez most túl sok, álljunk meg”." },
    crit: { jo: "lo", hi: "Gyakori a <strong>kritika</strong>: a panasz helyett a másik személyiségét támadod („mindig”, „soha”, „te olyan vagy, aki…”).", mid: "A kritika időnként megjelenik.", lo: "Ritka a kritika: a panaszaidat konkrétan, a viselkedésre fókuszálva fogalmazod meg.", tipHi: "Ellenszer: szelíd kezdés. „Te soha nem…” helyett: „Azt érzem…, amikor…, és arra lenne szükségem, hogy…”." },
    cont: { jo: "lo", hi: "Jelen van a <strong>megvetés</strong>: lenézés, gúny, szarkazmus, szemforgatás. Gottman kutatásai szerint ez a válás legerősebb előrejelzője, ezért ez a legsürgősebb munkaterület.", mid: "A megvetés időnként megjelenik, főleg a feszült időszakokban.", lo: "Ritka a megvetés: alapvetően tisztelettel beszéltek egymással.", tipHi: "Ellenszer: a megbecsülés kultúrájának tudatos építése. Naponta keress valamit, amit értékelsz a másikban, és mondd ki." },
    def: { jo: "lo", hi: "Gyakori a <strong>védekezés</strong>: egy panaszra ellentámadással, kifogással vagy áldozatszereppel reagálsz.", mid: "A védekezés időnként megjelenik.", lo: "Ritka a védekezés: tudsz felelősséget vállalni a saját részedért.", tipHi: "Ellenszer: vállalj felelősséget akár egy kis részért is: „igazad van, ebben én is hibáztam”." },
    stone: { jo: "lo", hi: "Gyakori a <strong>falazás</strong>: konfliktusban elzárkózol, nem reagálsz, kivonulsz. Ez gyakran az idegrendszer túlterheltségének jele (elárasztás), nem közöny.", mid: "A falazás időnként megjelenik, főleg erős feszültségben.", lo: "Ritka a falazás: konfliktusban is jelen maradsz.", tipHi: "Ellenszer: önmegnyugtatás. Ha elárasztást érzel (gyors szívverés, beszűkült gondolkodás), kérj 20–30 perc szünetet, nyugtasd le magad, és térj vissza." }
  },
  gyoker: [
    "A kapcsolati minták részben az egyéni történetből (kötődési minta, családi konfliktusminták, sémák), részben a kapcsolat saját történetéből fakadnak. A megvetés gyakran hosszú ideig kimondatlan, felgyűlt sérelmek nyomán alakul ki; a falazás a fiziológiai elárasztás és a konfliktuskerülő neveltetés eredménye lehet.",
    "A barátsági alapok gyengülése gyakran fokozatos: a gyerekek, a munka, a stressz miatt egyre kevesebb a figyelem és a közös idő, és a kapcsolat „működéssé” válik."
  ],
  mindennap: [
    "A barátsági alapok a hétköznapokban dőlnek el, nem a nagy gesztusokban: a reggeli kérdésben, a napi stressz meghallgatásában, egy apró figyelmességben. Gottman szerint a stabil pároknál a konfliktus közben is legalább ötször annyi pozitív interakció van, mint negatív (5:1 arány).",
    "A négy lovas egymást erősíti: a kritika védekezést vált ki, a védekezés megvetést, a megvetés falazást – és a kör folytatódik."
  ],
  fennmarad: "Ha a négy lovas jelen van és a javítás nem működik, a felek egyre inkább negatívan értelmezik egymás viselkedését (negatív szűrő), ami tovább erősíti a negatív ciklust.",
  lepesek: [
    "<strong>Szelíd kezdés.</strong> A konfliktus első három perce nagyrészt meghatározza a kimenetelt. Panasz kritika nélkül, „én”-üzenetekkel.",
    "<strong>Napi kapcsolódás.</strong> Napi 20 perc stresszcsökkentő beszélgetés: meghallgatás tanácsadás nélkül.",
    "<strong>Megbecsülés kifejezése.</strong> Naponta egy kimondott értékelés.",
    "<strong>Javítási jel.</strong> Egyezzetek meg egy jelben, amivel megállíthatjátok az eszkalációt.",
    "<strong>Párterápia.</strong> Gottman-módszer vagy érzelemfókuszú párterápia, különösen ha a megvetés vagy a falazás erős."
  ],
  kerdesek: [
    "Mi volt az utolsó apró kapcsolódási kísérlete a partnerednek, és hogyan reagáltál rá?",
    "Melyik lovas jelenik meg nálad leggyakrabban?",
    "Mit csodálsz a partneredben, amit régóta nem mondtál ki?"
  ]
};

D.fti = {
  cim: "A temperamentumod mélyebben",
  bevezeto: [
    "Helen Fisher antropológus modellje négy temperamentum-stílust különít el, amelyeket egy-egy neurokémiai rendszerhez kötött: <strong>Felfedező</strong> (dopamin: kíváncsiság, újdonságkeresés, spontaneitás, energia), <strong>Építő</strong> (szerotonin: óvatosság, megbízhatóság, rend, hagyomány), <strong>Irányító</strong> (tesztoszteron: analitikus, határozott, versengő, egyenes) és <strong>Közvetítő</strong> (ösztrogén/oxitocin: empatikus, intuitív, nagy képben gondolkodó, érzelmileg kifejező).",
    "Mindenki mind a négy stílus keveréke, általában egy-két domináns stílussal. Fisher szerint a temperamentum befolyásolja, kihez vonzódunk: a Felfedezők és az Építők gyakran hasonlóhoz, az Irányítók és a Közvetítők gyakran a komplementer stílushoz. (A modell itt saját itemekkel mér, és a neurokémiai hozzárendelés egyszerűsítés; önismereti keretként hasznos, nem klinikai mérés.)"
  ],
  skalak: {
    exp: { hi: "Erős <strong>Felfedező</strong>: kíváncsi, energikus, spontán, kalandvágyó, kreatív; az újdonság hajt, a rutin gyorsan unalmas. A kihívás a kitartás és a befejezés.", mid: "A Felfedező oldalad közepes: időnként vágysz az újdonságra, de a stabilitást is értékeled.", lo: "A Felfedező oldalad alacsony: a kiszámíthatóság és a bevált dolgok vonzóbbak az újdonságnál." },
    bld: { hi: "Erős <strong>Építő</strong>: megbízható, nyugodt, szervezett, hűséges, a közösségre és a hagyományra figyelő. Biztonságot adsz másoknak. A kihívás a változással való megküzdés.", mid: "Az Építő oldalad közepes: van struktúrád és megbízhatóságod, de rugalmas is vagy.", lo: "Az Építő oldalad alacsony: a szabályok, a rutin és a hagyomány kevésbé fontosak számodra." },
    dir: { hi: "Erős <strong>Irányító</strong>: analitikus, logikus, határozott, egyenes, versengő; jól kezeled a rendszereket és a döntéseket. A kihívás az érzelmi árnyalatok és az empátia.", mid: "Az Irányító oldalad közepes: tudsz határozott és analitikus lenni, ha kell.", lo: "Az Irányító oldalad alacsony: kevésbé jellemző rád a versengés és a rendszerszintű, analitikus fókusz." },
    neg: { hi: "Erős <strong>Közvetítő</strong>: empatikus, intuitív, szavakkal és érzelmekkel ügyes, nagy képben gondolkodó; jól látod a kapcsolatokat és az összefüggéseket. A kihívás a döntésképesség és a határok.", mid: "A Közvetítő oldalad közepes: tudsz empatikus és intuitív lenni, de nem ez a fő stílusod.", lo: "A Közvetítő oldalad alacsony: kevésbé az érzelmi és intuitív, inkább a konkrét és gyakorlati nézőpont jellemző." }
  },
  gyoker: [
    "A temperamentum nagyrészt veleszületett: a különböző neurokémiai rendszerek működésének egyéni különbségeiből fakad, és már gyerekkorban látszik (pl. az újdonságkereső vagy az óvatos gyerek). A környezet nem írja át, de formálja a kifejeződését: egy Felfedező gyerek, akit folyamatosan fékeznek, megtanulhatja elfojtani a kíváncsiságát.",
    "Felnőttkorban a szerepek, a kapcsolatok és a munka felerősíthetnek vagy háttérbe szoríthatnak egy-egy stílust."
  ],
  mindennap: [
    "A temperamentum meghatározza, mitől töltődsz fel és mi fáraszt: a Felfedezőt az újdonság, az Építőt a rend, az Irányítót a kihívás és a hatékonyság, a Közvetítőt a mély kapcsolódás.",
    "Párkapcsolatban a különböző stílusok kiegészíthetik egymást, de súrlódást is okozhatnak: a Felfedező spontaneitása az Építőt felkavarhatja, az Irányító egyenessége a Közvetítőt megbánthatja."
  ],
  lepesek: [
    "<strong>Ismerd fel a domináns stílusod igényeit.</strong> Mire van szükséged ahhoz, hogy jól legyél? Újdonság, rend, kihívás vagy kapcsolódás?",
    "<strong>Az árnyoldalak.</strong> Minden stílusnak van árnyoldala (Felfedező: befejezetlenség; Építő: merevség; Irányító: érzéketlenség; Közvetítő: határtalanság). Melyik ismerős?",
    "<strong>A partner stílusa.</strong> Beszéljétek meg, milyen stílusúak vagytok, és mit jelent ez a közös életben.",
    "<strong>Kiegészítés.</strong> Munkában és kapcsolatban is érdemes olyan emberekkel dolgozni, akik a gyengébb stílusaidat kiegészítik.",
    "<strong>Tudatos tágítás.</strong> Gyakorold a leggyengébb stílusod egy-egy elemét: egy új élmény, egy rendszer, egy döntés, egy érzelmi beszélgetés."
  ],
  kerdesek: [
    "Mitől töltődsz fel leginkább – és mi merít le?",
    "Kihez vonzódtál eddig: hasonló vagy komplementer temperamentumhoz?",
    "Melyik stílusod árnyoldala okozta a legtöbb nehézséget az életedben?"
  ]
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
