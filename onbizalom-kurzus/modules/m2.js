/* 2. modul — A belső kritikus */
OB.add({
  id:2, title:'A belső kritikus', sub:'A hang, amely leszól: hogyan ismerd fel, és hogyan beszélj vissza', color:'sapphire',
  levels:[
  {name:'Alap', lessons:[
    {t:'A kritikus hang felismerése',
     lead:'Amíg tényként hallod, irányít. Amint hangként hallod, választhatsz.',
     body:[
      'A belső kritikus nem úgy szól, mint egy vélemény, hanem mint a valóság leírása: „béna vagy”, „úgyis elrontod”, „mások jobbak”. Mivel a saját hangodon szól, nem kérdőjelezed meg. Az első lépés ezért nem a vitatkozás, hanem a <strong>felismerés</strong>: ez egy gondolat, nem tény.',
      'Az elfogadás- és elköteleződés-terápia (ACT) ezt <strong>defúziónak</strong> hívja. Ha azt mondod: „Az a gondolatom támadt, hogy béna vagyok”, a mondat ereje csökken, pedig a tartalma nem változott. Távolabbról nézed, és van tér dönteni.',
      'Sok embernek segít, ha nevet ad a hangnak („a Bíró”, „a Főnök”). Nem ellenség, inkább egy túlbuzgó, régi védelmező, aki rossz módszerekkel próbál megóvni a kudarctól.'],
     ex:{t:'Hangfelvétel',min:5,steps:[
      'Egy napig minden alkalommal, amikor leszólod magad, írd le szó szerint a mondatot.',
      'Este nézd végig a listát: mely mondatok ismétlődnek?',
      'Adj nevet a hangnak, és írd le, kinek a hangjára emlékeztet.']},
     q:['Mi a kritikusom három leggyakoribb mondata?','Kinek a hangja, hanglejtése ez? Honnan ismerős?','Mit próbál elérni nálam a kritikus? Mitől akar megvédeni?'],
     ms:'Egy napig rögzítetted a kritikus mondatait, és nevet adtál neki.'},
    {t:'A tíz gondolatcsapda',
     lead:'A kritikus mindig ugyanazokkal a torzításokkal dolgozik. Ha ismered őket, észreveszed.',
     body:[
      'Aaron Beck és David Burns leírta azokat a gondolkodási torzításokat, amelyek a negatív önképet fenntartják. A leggyakoribbak: <strong>mindent vagy semmit</strong> („ha nem tökéletes, akkor kudarc”), <strong>túláltalánosítás</strong> („mindig elrontom”), <strong>gondolatolvasás</strong> („biztos hülyének tart”), <strong>katasztrofizálás</strong> („ha ez nem sikerül, vége”), <strong>pozitívum leértékelése</strong> („ez csak szerencse volt”), <strong>címkézés</strong> („vesztes vagyok”), <strong>kell-állítások</strong> („nem kellene ilyennek lennem”), <strong>érzelmi érvelés</strong> („úgy érzem, béna vagyok, tehát az vagyok”), <strong>perszonalizáció</strong> („miattam nem sikerült”) és a <strong>negatív szűrő</strong>.',
      'Nem kell megtanulni a listát. Elég, ha a saját két-három kedvenc csapdádat felismered. A legtöbb embernél ugyanazok ismétlődnek.',
      'Ha egy gondolatnál megnevezed a csapdát, már kevésbé hiszed el.'],
     ex:{t:'Csapdavadászat',min:10,steps:[
      'Vedd elő az előző lecke listáját.',
      'Minden mondat mellé írd oda, melyik csapda (lehet több is).',
      'Jelöld meg a három leggyakoribbat. Ezek a te csapdáid.']},
     q:['Melyik gondolatcsapdába esem a leggyakrabban?','Melyik helyzetben a legerősebb?','Mit veszek észre másoknál, amit magamnál nem?'],
     ms:'Meg tudod nevezni a saját három leggyakoribb gondolatcsapdádat.'},
    {t:'A barát-teszt',
     lead:'Egy barátnak sosem mondanád, amit magadnak mondasz. Ez a különbség a kulcs.',
     body:[
      'A legegyszerűbb, mégis hatásos technika: amikor leszólod magad, kérdezd meg, mit mondanál egy barátnak ugyanebben a helyzetben. Szinte mindenki kedvesebb, reálisabb és támogatóbb másokkal, mint saját magával. Ez nem jóindulat kérdése: másoknál pontosabban látod a teljes képet.',
      'A barát-teszt nem hízelgés. Egy jó barát nem mondja, hogy minden tökéletes volt; azt mondja: „Ez most nem sikerült, de látom, mennyit dolgoztál rajta. Mit csinálnál legközelebb másképp?” Ez a hang egyszerre őszinte és kedves, és ebből lehet tanulni.',
      'Gyakorlással ez a második hang egyre hamarabb megszólal, és egyre jobban hihető.'],
     ex:{t:'Két oszlop',min:10,steps:[
      'Bal oszlop: írd le a kritikus mondatát egy friss helyzetről.',
      'Jobb oszlop: írd le, mit mondanál egy jó barátnak ugyanerre.',
      'Olvasd fel hangosan a jobb oszlopot, és figyeld meg, mit érzel.',
      'Csináld meg naponta egyszer, egy héten át.']},
     q:['Miért vagyok szigorúbb magammal, mint másokkal?','Mi az a mondat, amit a legnehezebb magamnak mondani?','Ki volt az életemben, aki így beszélt velem, ahogy a jobb oszlop?'],
     ms:'Egy héten át naponta kitöltötted a két oszlopot.'}]},
  {name:'Közép', lessons:[
    {t:'Gondolatnapló: a teljes kép',
     lead:'Helyzet, gondolat, érzés, bizonyíték. Ez a CBT legfontosabb eszköze.',
     body:[
      'A gondolatnapló a kognitív terápia alapeszköze. Egy nehéz pillanat után leírod: mi történt (<strong>helyzet</strong>), mi járt a fejedben (<strong>automatikus gondolat</strong>), mit éreztél és mennyire (<strong>érzés 0–100</strong>), mi szól a gondolat mellett és mi ellene (<strong>bizonyítékok</strong>), és végül egy kiegyensúlyozott változatot.',
      'A bizonyítékok mérlegelése a lényeg. Nem az a cél, hogy pozitívan gondolkodj, hanem hogy <strong>pontosan</strong>. Ha a gondolat igaz, akkor problémamegoldás jön. Ha torz, a kiegyensúlyozott változat általában 20–40 ponttal csökkenti az érzés erősségét.',
      'Elsőre lassú és mesterkélt. Pár hét után fejben is gyorsan lefut.'],
     ex:{t:'Öt oszlop',min:15,steps:[
      'Válassz egy nehéz pillanatot a mai vagy tegnapi napból.',
      'Írd le az öt oszlopot: helyzet, gondolat, érzés (0–100), bizonyítékok mellette és ellene.',
      'Írj kiegyensúlyozott gondolatot, és értékeld újra az érzést.',
      'Csináld meg a héten legalább háromszor.']},
     q:['Mennyit változott az érzés erőssége a kiegyensúlyozott gondolat után?','Melyik bizonyítékot nem vettem volna észre napló nélkül?','Melyik gondolat bizonyult igaznak, és mit tudok tenni vele?'],
     ms:'Három teljes gondolatnaplót kitöltöttél, és mindegyiknél mérted a változást.'},
    {t:'Önegyüttérzés: a három lépés',
     lead:'Nem önsajnálat és nem a mérce lazítása. Kudarc után ez segít újra próbálni.',
     body:[
      'Kristin Neff kutatásai szerint az <strong>önegyüttérzés</strong> három elemből áll: <strong>tudatosság</strong> (észreveszed, hogy szenvedsz, anélkül hogy felnagyítanád), <strong>közös emberség</strong> (mások is átélik ezt, nem vagy egyedül) és <strong>kedvesség</strong> önmagad iránt (úgy bánsz magaddal, ahogy egy jó baráttal).',
      'Sokan attól tartanak, hogy ez ellustít. A kutatások az ellenkezőjét mutatják: Breines és Chen kísérletében azok, akik kudarc után önegyüttérző szemlélettel gondoltak a hibájukra, <strong>többet</strong> gyakoroltak a következő próbára, mint akik önbecsülésüket próbálták növelni. A szégyen lebénít, a kedvesség mozgásba hoz.',
      'Az önegyüttérző szünet egy perc: „Ez most nehéz. Ezt más is átéli. Mit mondanék most egy barátnak?”'],
     ex:{t:'Önegyüttérző szünet',min:3,steps:[
      'Ha nehéz pillanatod van, állj meg, és mondd ki (magadban is): „Ez most nehéz.”',
      'Folytasd: „A nehézség az élet része, ezt mások is átélik.”',
      'Tedd a kezed a mellkasodra vagy a karodra, és mondd: „Legyek most kedves magamhoz.”',
      'Csináld meg naponta legalább egyszer, egy héten át.']},
     q:['Mi az első reakcióm, amikor hibázom?','Mit éreztem, amikor kimondtam a kedves mondatot? Mi volt kényelmetlen?','Mit tenne másképp az, aki önegyüttérzéssel közelít a hibáihoz?'],
     ms:'Egy hétig naponta elvégezted a szünetet, és leírtad, mit vettél észre.'},
    {t:'A kritikus funkciója',
     lead:'A kritikus nem gonosz. Egykor védett valamitől. Ha érted, könnyebb vele bánni.',
     body:[
      'A sématerápia és a belső részek munkája (IFS) szerint a belső kritikus egy régi <strong>védelmező</strong>. Gyakran akkor alakult ki, amikor a külső kritika, megszégyenítés vagy elutasítás fájdalmas volt. Ha előbb te mondod el magadnak, mi a baj, a külvilág már nem tud meglepni. Ha tökéletes vagy, nincs mibe belekötni.',
      'A kritikus logikája egykor érthető volt, ma viszont többet árt, mint használ. Ha harcolsz vele, erősebb lesz. Ha megérted, mit akar megelőzni, tárgyalhatsz vele: „Látom, hogy félsz, hogy megszégyenülök. Most én figyelek erre, te pihenhetsz.”',
      'A cél nem a kritikus megsemmisítése, hanem az, hogy ne ő vezessen.'],
     ex:{t:'Párbeszéd a kritikussal',min:15,steps:[
      'Írj levelet a kritikusodnak: kérdezd meg, mitől akar megvédeni.',
      'Válaszolj az ő nevében, őszintén.',
      'Írd le, mit tudsz neki ígérni, hogy kevésbé kelljen kiabálnia.']},
     q:['Mitől akar megvédeni a kritikusom?','Mikor alakulhatott ki ez a hang az életemben?','Mi az, amit a kritikus nem tud: miben vagyok már erősebb, mint akkor?'],
     ms:'Megírtad a párbeszédet, és meg tudod fogalmazni a kritikus szándékát.'}]},
  {name:'Mester', lessons:[
    {t:'A mélyben: alaphiedelmek',
     lead:'A felszíni gondolatok alatt egy-két mély hiedelem áll. Ezt keressük.',
     body:[
      'A „lefelé nyíl” technikával a felszíni gondolattól eljuthatsz az alaphiedelemig. Minden gondolatnál megkérdezed: „És ha ez igaz, mit jelent rólam?” Például: „Elrontottam a prezentációt” → „és akkor?” → „a főnököm csalódott” → „és akkor?” → „rájön, hogy nem vagyok elég jó” → „és az mit jelent rólam?” → „<strong>alkalmatlan vagyok</strong>”.',
      'Az alaphiedelmek ritkák, rövidek és nagyon régiek: „nem vagyok elég”, „szerethetetlen vagyok”, „gyenge vagyok”. Felnőttként sokszor nem is hiszed el őket tudatosan, de érzelmileg mégis működnek.',
      'Egy alaphiedelem nem változik meg egy gondolatnaplótól. Hónapok alatt, sok kis ellentapasztalattal gyengül. Ehhez kell az, hogy tudd, mit keresel.'],
     ex:{t:'Lefelé nyíl',min:20,steps:[
      'Válassz egy erős, negatív gondolatot a gondolatnaplódból.',
      'Kérdezd meg ötször egymás után: „Ha ez igaz, mit jelent rólam?”',
      'Írd le a legalsó mondatot. Ez valószínűleg egy alaphiedelem.',
      'Értékeld, mennyire hiszed érzelmileg (0–100) és mennyire racionálisan (0–100).']},
     q:['Mi az alaphiedelmem, és mióta él bennem?','Mekkora a különbség aközött, amit racionálisan és amit érzelmileg hiszek?','Milyen tapasztalat gyengítené ezt a hiedelmet?'],
     ms:'Megtaláltál egy alaphiedelmet, és mérted a két hihetőségi számot.'},
    {t:'Az új hiedelem építése',
     lead:'A régit nem lehet kitörölni. Mellé lehet építeni egy újat, és táplálni.',
     body:[
      'Christine Padesky módszere: megfogalmazol egy <strong>alternatív hiedelmet</strong> („Alapvetően rendben vagyok, a hibáimmal együtt”), és elkezdesz bizonyítékot gyűjteni rá. Nem az a kérdés, hogy most igaz-e, hanem hogy milyen jeleit látod, ha néha igaz.',
      'A <strong>folytonossági skála</strong> segít a fekete-fehér gondolkodás ellen. Egy 0–100-as skálán elhelyezed magad („mennyire vagyok alkalmatlan?”), majd elhelyezel másokat is, valódi és elképzelt példákat. Kiderül, hogy a 0 és a 100 között rengeteg árnyalat van, és te nem a szélén állsz.',
      'Hetente nézd újra a hihetőséget. Lassan nő, és ez rendben van így.'],
     ex:{t:'Új hiedelem-napló',min:10,steps:[
      'Fogalmazd meg az alternatív hiedelmet egy mondatban.',
      'Értékeld, mennyire hiszed ma (0–100).',
      'Minden nap írj fel legalább egy apró jelet, amely alátámasztja.',
      'Egy hónap múlva értékeld újra.']},
     q:['Mi az alternatív hiedelmem?','Milyen jelek támasztják alá, amelyeket eddig figyelmen kívül hagytam?','Hol állok valójában a folytonossági skálán?'],
     ms:'Két hétig gyűjtöttél bizonyítékot az új hiedelemre, és mérted a változást.'},
    {t:'A kritikusból edző',
     lead:'Ugyanaz a mérce, más hang: a végső cél egy belső edző, aki egyszerre igényes és kedves.',
     body:[
      'A belső kritikusnak van egy egészséges magja: szeretné, hogy jól csináld. Az a baj vele, hogy a módszere a büntetés. A belső <strong>edző</strong> ugyanazt a mércét tartja, de másképp kommunikál: konkrét („a bevezetőt lehetne rövidebbre fogni”, nem „béna voltál”), előre néző („legközelebb”), és elismeri a fejlődést.',
      'A jó sportedző nem alázza meg a játékost egy hibás passz után. Megállítja, megmutatja, mit lehet másképp csinálni, és visszaküldi a pályára. Ugyanez a stílus belül is tanulható.',
      'A modul zárásaként írd meg a belső edződ „kézikönyvét”: hogyan beszél, mikor szólal meg, mit soha nem mond.'],
     ex:{t:'Az edző kézikönyve',min:20,steps:[
      'Írd le az edződ öt alapmondatát különböző helyzetekre (hiba, siker, halogatás, kritika, fáradtság).',
      'Írd le, mit nem mond soha.',
      'Egy héten át minden kritikus mondatot fordíts le az edző nyelvére.']},
     q:['Milyen mércét akar a kritikusom tartani, és mi belőle a jogos?','Melyik edzőmondat hat rám a legjobban?','Mit vettem észre, amikor egy héten át az edző nyelvén beszéltem magamhoz?'],
     ms:'Elkészült az edző kézikönyve, és egy héten át használtad.'}]}
  ]});
