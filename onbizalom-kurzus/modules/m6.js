/* 6. modul — Kockázat és kezdeményezés */
OB.add({
  id:6, title:'Kockázat és kezdeményezés', sub:'Félelem, bátorság-létra, fokozatos kitettség: belevágni, mielőtt készen állnál', color:'sapphire',
  levels:[
  {name:'Alap', lessons:[
    {t:'Komfortzóna, tanulási zóna, pánikzóna',
     lead:'A fejlődés a középső zónában történik. A pánikzóna nem bátorság, hanem túlterhelés.',
     body:[
      'A Yerkes–Dodson-törvény régóta ismert: a teljesítmény egy ideig nő a feszültséggel, aztán meredeken esik. Ebből egy hasznos modell következik. A <strong>komfortzónában</strong> minden ismerős, nincs feszültség, és nincs is fejlődés. A <strong>tanulási zónában</strong> kényelmetlen, de kezelhető a feszültség; itt épül az önbizalom. A <strong>pánikzónában</strong> a feszültség elárasztja a gondolkodást, és a tapasztalat inkább megerősíti a félelmet.',
      'A gyakori hiba kétirányú: sokan a komfortzónában maradnak, mások pedig egyetlen nagy ugrással a pánikzónába vetik magukat („egyszerre kell legyőznöm”), és amikor ez rosszul sül el, még jobban félnek.',
      'A cél a tanulási zóna: egy lépés, ami 4–6 körüli nehézségű egy 0–10-es skálán.'],
     ex:{t:'Zónatérkép',min:15,steps:[
      'Rajzolj három kört egymásba: komfort, tanulás, pánik.',
      'Írj mindegyik zónába 5–5 helyzetet a saját életedből.',
      'Jelöld meg a tanulási zónából azt, amelyik a legtöbbet hozna, ha rendszeresen csinálnád.']},
     q:['Mennyi időt töltök a komfortzónámban?','Mikor ugrottam már a pánikzónába, és mit tanultam belőle?','Mi a következő lépés, ami a tanulási zónámban van?'],
     ms:'Elkészült a zónatérkép, és van egy kiválasztott tanulási-zóna lépésed.'},
    {t:'A jóslat és a valóság',
     lead:'A félelem jóslat. A kísérlet ellenőrzés. A különbség tanít.',
     body:[
      'Minden félelem mögött egy jóslat áll: „ha elmondom a véleményemet, nevetségessé válok”, „ha jelentkezem, kiderül, hogy nem értek hozzá”. A <strong>viselkedéses kísérlet</strong> a kognitív terápia egyik leghatékonyabb eszköze, mert nem érvekkel, hanem tapasztalattal cáfolja a jóslatot.',
      'A kísérlet négy lépés: <strong>1.</strong> fogalmazd meg a jóslatot konkrétan, és értékeld, mennyire hiszed (0–100); <strong>2.</strong> tervezz egy helyzetet, ami ellenőrzi; <strong>3.</strong> csináld meg biztonsági viselkedések nélkül; <strong>4.</strong> írd le, mi történt, és mennyire hiszed most a jóslatot.',
      'Nem baj, ha a jóslat néha igaznak bizonyul. Akkor is kiderül valami fontos: hogy a legrosszabb is kibírható.'],
     ex:{t:'Négylépéses kísérlet',min:20,steps:[
      'Válassz egy félelmet, és írd le a jóslatot egy mondatban, hihetőséggel.',
      'Tervezz egy konkrét kísérletet a héten.',
      'Hajtsd végre biztonsági viselkedés nélkül.',
      'Írd le az eredményt, és értékeld újra a jóslat hihetőségét.']},
     q:['Mennyit változott a jóslat hihetősége a kísérlet után?','Milyen biztonsági viselkedés volt a legnehezebb elhagyni?','Mit tanultam, ami nem várt?'],
     ms:'Elvégeztél egy teljes kísérletet, és mérted a hihetőség változását.'},
    {t:'Felkészületlen igen',
     lead:'Aki megvárja, hogy kész legyen, sokáig vár. A kész érzés a cselekvés után jön.',
     body:[
      'A perfekcionizmus és a bizonytalanság közös terméke a „még nem vagyok kész” érzés. Jelentkezni a projektre, ha már mindent tudsz. Megszólalni, ha már tökéletes a mondat. Elindítani a vállalkozást, ha már minden részlet a helyén. Ez a pont ritkán jön el.',
      'Gyakran idézett (bár tudományosan sosem publikált) belső HP-adat, hogy a férfiak akkor jelentkeztek egy pozícióra, ha a feltételek kb. 60%-ának megfeleltek, a nők jellemzően csak közel 100%-nál. A pontos szám vitatható, a minta viszont ismerős: sokan nem a tudás, hanem a „még nem vagyok kész” érzés miatt maradnak ki. Ez nem nemi kérdés, hanem mindenkire igaz, aki a tökéletes felkészültségre vár.',
      'A gyakorlat: hetente egyszer mondj igent valamire, mielőtt teljesen késznek éreznéd magad.'],
     ex:{t:'Heti egy igen',min:10,steps:[
      'Válassz valamit, amire régóta jelentkeznél, de várod, hogy készen állj.',
      'Mondd ki, hogy igen, ezen a héten.',
      'Jegyezd fel, mennyire érezted magad késznek előtte (0–100), és utána, mennyire volt elég.']},
     q:['Mire várok, hogy késznek érezzem magam?','Hányszor bizonyult elegendőnek az, amit tudtam, amikor belevágtam?','Mi lenne, ha a 60%-os szabály szerint élnék?'],
     ms:'Egy hét alatt egyszer igent mondtál valamire, mielőtt késznek érezted volna magad.'}]},
  {name:'Közép', lessons:[
    {t:'A bátorság-létra felépítése',
     lead:'A fokozatos kitettség a félelem kezelésének legjobban bizonyított módja.',
     body:[
      'A <strong>fokozatos kitettség</strong> a szorongásos zavarok kezelésének egyik legerősebb bizonyítékkal rendelkező módszere, és enyhébb félelmeknél is jól működik. A lényeg: a került helyzeteket nehézség szerint sorba állítod, és a legkönnyebbtől indulva lépcsőről lépcsőre haladsz.',
      'Egy jó létrának <strong>8–12 lépcsője</strong> van, 2-től 9-ig terjedő nehézséggel. A lépcsők konkrétak („Beszélgetést kezdeményezek egy idegennel a kávézóban”), nem általánosak („Bátrabb leszek”). Egy lépcsőt addig ismételsz, amíg a feszültség körülbelül a felére csökken, vagy amíg kezelhetőnek érzed. Csak akkor lépsz tovább.',
      'A létrát változtathatod: ha egy lépcső túl nagy, beszúrsz közbülsőt.'],
     ex:{t:'Az én létrám',min:25,steps:[
      'Válassz egy területet, ahol a félelem korlátoz (pl. társas helyzetek, szereplés, kérés).',
      'Írj 10 helyzetet, a könnyűtől a nehézig.',
      'Értékeld mindegyiket 0–10-ig.',
      'Rendezd sorba, és tervezd be az első lépcsőt a héten.']},
     q:['Melyik a legfelső lépcső, amire igazán vágyom?','Hol van a legnagyobb ugrás a létrámon, ahová közbülső lépcső kell?','Mit éreztem az első lépcső után?'],
     ms:'Elkészült a 10 lépcsős létrád, és megcsináltad az első lépcsőt.'},
    {t:'Ismétlés és kitartás',
     lead:'Egyszer megcsinálni nem elég. Az ismétlés hozza a tartós változást.',
     body:[
      'A kitettség első próbái gyakran még nagyon kellemetlenek. Ha egy lépcsőt egyszer megcsinálsz, aztán soha többé, a félelem nem tanul meg semmit. Az <strong>ismétlés</strong> a lényeg: a második, harmadik, ötödik alkalommal a feszültség egyre kisebb lesz.',
      'Michelle Craske kutatásai szerint nem is az a döntő, hogy a félelem egy alkalmon belül lecsökkenjen, hanem az, hogy a <strong>várakozás megsérüljön</strong>: amire számítottál, nem jött el. Ezért minden próba után írd le, mire számítottál, és mi lett. A meglepetés tanít.',
      'Hetente 3–4 próba sokkal többet ér, mint havonta egy nagy.'],
     ex:{t:'Két hét, nyolc próba',min:15,steps:[
      'Tervezz be két hétre nyolc próbát a létrád alsó lépcsőiből.',
      'Mindegyik előtt írd le, mire számítasz.',
      'Utána írd le, mi történt, és mennyire volt nehéz 0–10 között.',
      'Két hét után nézd meg a számok változását.']},
     q:['Hogyan változott a nehézség az ismétlések során?','Mikor ért a legnagyobb meglepetés?','Mi segít abban, hogy ne hagyjam abba?'],
     ms:'Két hét alatt legalább hat próbát elvégeztél és rögzítettél.'},
    {t:'Kezdeményezés társas helyzetekben',
     lead:'Elsőként köszönni, kérdezni, meghívni: a kezdeményezés tanulható.',
     body:[
      'A társas kezdeményezés (beszélgetést indítani, valakit meghívni, egy csoporthoz csatlakozni) különösen nehéz, mert itt az elutasítás személyesnek tűnik. Boothby és munkatársai a „liking gap” jelenségét írták le: egy beszélgetés után az emberek rendszeresen <strong>alábecsülik</strong>, mennyire kedvelte őket a másik.',
      'Egyszerű kezdőmondatok a helyzetből: egy közös dologra vonatkozó megjegyzés („Ez a kávé mindig ilyen jó itt?”), egy kérdés („Te is az előadás miatt jöttél?”), vagy egy őszinte dicséret. A beszélgetés folytatásához a nyitott kérdés és a valódi kíváncsiság a legjobb eszköz.',
      'Az elutasítás itt is gyakoribb a fejedben, mint a valóságban. És ha bekövetkezik, legtöbbször a másik helyzetéről szól.'],
     ex:{t:'Három nyitás',min:10,steps:[
      'A héten kezdeményezz három rövid beszélgetést olyan emberrel, akit kevéssé ismersz.',
      'Utána írd le: szerinted mennyire kedvelt a másik (0–10), és mire alapozod.',
      'Ha lehetséges, egyszer kérdezz rá később egy ismerősnél, hogyan látta.']},
     q:['Milyen helyzetekben várom, hogy a másik kezdeményezzen?','Mi történt a három nyitás során?','Mennyire becsültem helyesen, mit gondolt rólam a másik?'],
     ms:'Három beszélgetést kezdeményeztél, és rögzítetted a tapasztalatot.'}]},
  {name:'Mester', lessons:[
    {t:'Elutasítás-gyakorlat',
     lead:'Aki szándékosan gyűjti az elutasítást, az elveszíti a félelmét tőle.',
     body:[
      'Jia Jiang „100 nap elutasítás” kísérlete ismertté tette a módszert: szándékosan kérsz olyan dolgokat, amelyekre valószínű a nem. A cél nem az igen, hanem a nem megélése. Az eredmény két meglepetés: egyrészt sokkal több az igen, mint gondolnád, másrészt a nem sokkal kevésbé fáj, mint vártad.',
      'Kezdd kicsiben és biztonságosan: kérj kedvezményt egy boltban, kérj kóstolót egy kávézóban, kérj egy gyors szívességet egy idegentől. Udvariasan, tisztelettel, a nemet elfogadva.',
      'Ez a kitettség legtisztább formája: az elutasítástól való félelem ellen dolgozik, ami sok más félelem gyökere.'],
     ex:{t:'Tíz nem',min:10,steps:[
      'Két hét alatt gyűjts tíz nemet szándékosan feltett, ártalmatlan kérésekkel.',
      'Mindegyik után írd le, mit éreztél és mennyire.',
      'Számold meg, hány igent kaptál közben.']},
     q:['Mennyi igen jött a tíz nem keresése közben?','Melyik nem fájt a legjobban, és miért?','Hogyan változott az elutasítástól való félelmem?'],
     ms:'Összegyűjtöttél legalább hét szándékos nemet.'},
    {t:'Nagy döntések félelem mellett',
     lead:'Munkaváltás, vállalkozás, költözés: a nagy kockázat strukturálható.',
     body:[
      'A nagy döntéseknél a félelem természetes, és nem jelzi, hogy rossz a döntés. A kérdés az, hogyan vágj bele úgy, hogy a kockázat kezelhető legyen.',
      'Tim Ferriss <strong>„fear setting”</strong> módszere három oszlop: <strong>definiáld</strong> a legrosszabb forgatókönyvet konkrétan, <strong>előzd meg</strong> (mit tehetsz, hogy ne következzen be), <strong>javítsd</strong> (ha bekövetkezik, hogyan hozod helyre). Utána két kérdés: mi a haszna, ha megpróbálod? És mibe kerül, ha nem teszed meg 6 hónap, 1 év, 3 év múlva?',
      'A tétlenség ára láthatatlan, ezért alábecsüljük. A félelem a cselekvés kockázatát nagyítja, a halogatásét elrejti.'],
     ex:{t:'Fear setting',min:30,steps:[
      'Válassz egy nagy döntést, amit a félelem miatt halogatsz.',
      'Töltsd ki a három oszlopot: definiálás, megelőzés, javítás.',
      'Írd le a próbálkozás hasznát.',
      'Írd le a tétlenség árát 6 hónap, 1 év és 3 év távlatában.']},
     q:['Mi a legrosszabb, ami valóban megtörténhet, és mennyire visszafordíthatatlan?','Mi a tétlenség ára, amit eddig nem néztem meg?','Mi lenne az első, kis lépés ebben az irányban?'],
     ms:'Elkészült a fear setting, és meghatároztál egy első lépést.'},
    {t:'A bátorság mint gyakorlat',
     lead:'A bátor ember nem fél kevesebbet. Gyakrabban cselekszik félelem mellett.',
     body:[
      'A modul végére talán érzed: a félelem nem tűnik el, de egyre kevésbé dönt helyetted. Ez a bátorság valódi meghatározása: nem a félelem hiánya, hanem a <strong>cselekvés félelem mellett</strong>, egy fontos érték érdekében.',
      'A bátorság gyakorlat, nem jellemvonás. Mint egy izom, használattal erősödik, és használat nélkül sorvad. Ezért a mester szint célja, hogy a kockázatvállalás rendszeres része legyen az életednek: heti egy tanulási-zóna lépés, havi egy nagyobb kihívás.',
      'Írj magadnak egy bátorság-tervet a következő három hónapra.'],
     ex:{t:'Három hónapos terv',min:25,steps:[
      'Válassz egy fő célt, amihez bátorság kell.',
      'Bontsd 12 heti lépésre, növekvő nehézséggel.',
      'Tűzz ki minden hónap végére egy nagyobb kihívást.',
      'Írd be a naptáradba.']},
     q:['Mi változott a kockázathoz való viszonyomban a modul során?','Milyen érték miatt vagyok hajlandó félelem mellett cselekedni?','Ki tud nekem segíteni abban, hogy tartsam a tervet?'],
     ms:'Megvan a három hónapos bátorság-terv a naptáradban.'}]}
  ]});
