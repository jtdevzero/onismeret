/* 1. modul — Az önbizalom alapjai */
OB.add({
  id:1, title:'Az önbizalom alapjai', sub:'Mi az, miből épül, és miért nem a pozitív gondolkodásból', color:'emerald',
  levels:[
  {name:'Alap', lessons:[
    {t:'Az önbizalom három rétege',
     lead:'Nem egyetlen dolog. Ha tudod, melyik réteg gyenge, tudod, hol kell dolgozni.',
     body:[
      'A hétköznapi nyelv mindent önbizalomnak hív, a pszichológia viszont három, egymással összefüggő, de külön mozgó réteget különít el. Az <strong>önértékelés</strong> az alapérzés, hogy rendben vagy-e úgy, ahogy vagy. Az <strong>énhatékonyság</strong> (Bandura) a hit abban, hogy egy adott feladatot meg tudsz oldani. A <strong>társas önbizalom</strong> pedig az, hogy mások előtt, mások ítéletének kitéve is cselekszel.',
      'Lehet valaki szakmailag nagyon magabiztos (magas énhatékonyság), és közben belül folyamatosan elégtelennek érezheti magát (alacsony önértékelés). Lehet valaki magában stabil, mégis lebénulhat, ha sokan nézik. A három réteg más-más módszerre reagál: az önértékelést a belső hang és a bizonyítékok formálják, az énhatékonyságot a saját sikeres tapasztalat, a társas önbizalmat a fokozatos kitettség.',
      'Ezért nincs egy univerzális önbizalom-tipp. A kurzus mind a hármat építi, de érdemes már most megnézni, nálad melyik a legszűkebb keresztmetszet.'],
     ex:{t:'Rétegtérkép',min:10,steps:[
      'Írj fel öt helyzetet az elmúlt hónapból, amikor nem érezted magad magabiztosnak.',
      'Mindegyik mellé írd oda, melyik réteg akadt el: „nem vagyok elég” (önértékelés), „nem fog menni” (énhatékonyság), vagy „mit fognak gondolni” (társas).',
      'Számold össze, melyik fordul elő legtöbbször. Ez lesz az első fókuszod.']},
     q:['Melyik rétegben érzem magam a legerősebbnek, és honnan tudom ezt?','Van olyan terület, ahol kifelé magabiztosnak tűnök, belül viszont nem vagyok az?','Ha egy rétegen azonnal javíthatnék, melyik változtatna a legtöbbet az életemben?'],
     ms:'Le tudod írni egy mondatban, melyik réteg a legszűkebb keresztmetszeted, és van rá három konkrét példád.'},
    {t:'Miért nem működik a „csak higgy magadban”',
     lead:'A pozitív önmegerősítés alacsony önértékelésnél akár ronthat is a helyzeten.',
     body:[
      'Wood és munkatársai 2009-ben azt találták, hogy az „Elfogadható ember vagyok” típusú mondatok ismételgetése a magas önértékelésű embereknek kicsit javított a hangulatán, az alacsony önértékelésűeknek viszont <strong>rontott</strong>. Ha az állítás túl messze van attól, amit valójában hiszel, az agyad ellenérveket gyárt, és a végén még meggyőzöttebb leszel a negatív képről.',
      'Az önbizalom nem a gondolkodásból indul, hanem a <strong>tapasztalatból</strong>. A gondolat követi a viselkedést: aki megcsinál valamit, amitől tartott, annak a gondolatai utólag frissülnek. Ezért a kurzus minden leckéje cselekvéssel zárul, nem mantrával.',
      'A belső hangot nem elhallgatni kell, hanem pontosabbá tenni. Egy reális, kicsit kedvezőbb mondat („Ezt még nem csináltam, de hasonlót már igen”) hihető, és ezért működik is.'],
     ex:{t:'Hihető mondat',min:5,steps:[
      'Írd le egy mondatban, mit mondasz magadnak, amikor elbizonytalanodsz.',
      'Írd le a túl pozitív ellentétét („Tökéletes vagyok”), és figyeld meg, mennyire hiszed el 0–10 között.',
      'Írj egy harmadik, reális változatot, amit legalább 6/10-re el tudsz hinni. Ezt használd a héten.']},
     q:['Milyen önbizalom-tanácsokat próbáltam már, amelyek nem működtek? Miért nem?','Mikor változott meg a véleményem magamról egy konkrét tett hatására?','Mi az a reális mondat, amit ma el tudok hinni magamról?'],
     ms:'Van egy saját, hihető mondatod, és legalább háromszor használtad egy nehéz helyzet előtt.'},
    {t:'Az önbizalom a cselekvés után jön',
     lead:'Nem kell magabiztosnak érezned magad ahhoz, hogy elkezdj valamit. Fordítva működik.',
     body:[
      'A legtöbb ember arra vár, hogy előbb megjöjjön a magabiztosság, és utána lépjen. Ez a sorrend fordított. A félelem csökkenése és a bizalom növekedése a <strong>megtett lépés után</strong> következik be, nem előtte. Aki megvárja a megfelelő érzést, sokszor sosem indul el.',
      'A kognitív viselkedésterápia ezt viselkedéses kísérletnek hívja: van egy jóslatod („ha szólok, kinevetnek”), és egy kis, biztonságos próbával ellenőrzöd. A legtöbbször a valóság enyhébb, mint a jóslat, és ez a különbség tanítja át az agyat.',
      'Ez a kurzus alapelve: <strong>kis lépés, valódi helyzetben, utána rögzítés.</strong> A naplóban mindig leírod, mire számítottál, és mi történt. Néhány hét alatt összegyűlik az a bizonyítékhalmaz, amit semmilyen motiváló szöveg nem pótol.'],
     ex:{t:'Az első kísérlet',min:15,steps:[
      'Válassz egy apró helyzetet, amit kerülsz (pl. egy kérdés feltevése, egy telefonhívás).',
      'Írd le előre: mi fog szerinted történni, és mennyire tartasz tőle 0–10 között.',
      'Csináld meg a következő 48 órában.',
      'Utána írd le: mi történt valójában, és mennyire volt nehéz 0–10 között.']},
     q:['Mire várok most, mielőtt belevágnék valamibe?','Mit mutatott az első kísérlet: mennyire tért el a jóslatom a valóságtól?','Mi lenne a következő, kicsit nehezebb lépés?'],
     ms:'Elvégeztél egy jóslat–valóság kísérletet, és leírtad a két számot.'}]},
  {name:'Közép', lessons:[
    {t:'Bandura négy forrása',
     lead:'Az énhatékonyság négy helyről táplálkozik. A legerősebb a saját tapasztalat.',
     body:[
      'Albert Bandura szerint a „meg tudom csinálni” érzés négy forrásból épül. Az első és legerősebb a <strong>saját sikeres tapasztalat</strong>: amit te magad végigcsináltál. A második a <strong>minta</strong>: ha hozzád hasonló embert látsz sikerrel megcsinálni valamit. A harmadik a <strong>bátorítás</strong>: valaki, akit hitelesnek tartasz, bízik benned. A negyedik a <strong>testi és érzelmi állapot</strong>: hogyan értelmezed a szívdobogást, a feszültséget.',
      'A sorrend számít. A bátorítás gyorsan elillan, ha nincs mögötte tapasztalat. A minta akkor hat, ha a modell hasonlít rád; egy profi teljesítménye inkább elriaszt. A testi jeleket pedig lehet úgy is olvasni, hogy „izgulok, mert fontos”, nem csak úgy, hogy „félek, tehát nem megy”.',
      'Tudatosan mind a négyet lehet építeni: kis, befejezhető kihívásokkal, hasonló utat bejárt emberek követésével, támogató kapcsolatokkal és a testi jelek újraértelmezésével.'],
     ex:{t:'Négy forrás leltár',min:15,steps:[
      'Válassz egy célt, amelyhez most hiányzik az önbizalmad.',
      'Írd le mind a négy forráshoz: mi van már meg, és mi hiányzik?',
      'Tervezz a hiányzó forrásokhoz egy-egy konkrét lépést a héten (pl. egy kis próba, egy beszélgetés valakivel, aki már megcsinálta).']},
     q:['Melyik forrásra támaszkodom a legtöbbet, és melyiket hanyagolom?','Ki az, aki hozzám hasonló, és már megcsinálta azt, amire vágyom?','Hogyan értelmezem a testem jeleit egy fontos helyzet előtt?'],
     ms:'Mind a négy forráshoz van egy lépésed, és legalább kettőt megtettél.'},
    {t:'Bizonyíték-gyűjtés: a naplózás logikája',
     lead:'A negatív önkép a sikereket kivételnek könyveli el. A napló ezt ellensúlyozza.',
     body:[
      'Az alacsony önbizalom egyik fenntartója egy szűrő: ami megerősíti a negatív képet, azt észreveszed és megjegyzed, ami cáfolja, azt szerencsének, kivételnek vagy apróságnak tekinted. Melanie Fennell kognitív modellje szerint ez a szűrő évekig életben tartja a régi hiedelmet, akkor is, ha a tények már mást mutatnak.',
      'A <strong>bizonyíték-napló</strong> egyszerű ellenszer: minden este leírsz három dolgot, amit jól csináltál, vagy amiben a saját értékeid szerint cselekedtél. Nem kell nagynak lennie. A lényeg a rendszeresség: az emlékezet elengedi, a papír nem.',
      'Két hét után olvasd vissza. A legtöbb ember meglepődik azon, mennyi minden összegyűlt. Ez nem önámítás: tények, amelyek eddig nem kerültek be a képbe.'],
     ex:{t:'Tizennégy nap',min:5,steps:[
      'Minden este írj le három dolgot, amit jól csináltál, vagy amiben az értékeid szerint cselekedtél.',
      'Mindegyiknél írd oda, mi volt benne a te szereped (nem a szerencse, nem a körülmények).',
      'A 14. napon olvasd vissza mindet, és írd le, mi lepett meg.']},
     q:['Milyen sikereimet szoktam lekicsinyelni vagy elfelejteni?','Mi a közös a naplóba került dolgokban?','Mit mondana rólam valaki, aki csak ezt a naplót olvasná?'],
     ms:'Legalább 10 napot kitöltöttél a 14-ből, és visszaolvastad.'},
    {t:'Feltételes és feltétel nélküli érték',
     lead:'Ha az értéked a teljesítménytől függ, minden kudarc fenyegetés lesz.',
     body:[
      'Crocker és Wolfe kutatásai szerint az önértékelés nem csak magas vagy alacsony lehet, hanem <strong>feltételes</strong> is: ha valaki az értékét a teljesítményre, a külsőre vagy mások elismerésére építi, az önértékelése ezekkel együtt hullámzik. A siker rövid felfutást hoz, a kudarc mély zuhanást. Az ilyen önértékelés sok szorongással jár, még akkor is, ha átlagosan magas.',
      'A stabilabb alap az, ha az értéked nem azon múlik, sikerült-e valami, hanem azon, hogy a saját értékeid szerint cselekedtél-e. A kitartás, az őszinteség, a gondoskodás akkor is megélhető, ha az eredmény nem jött össze.',
      'Ez nem jelenti, hogy a teljesítmény nem számít. Azt jelenti, hogy a kudarc információ a teljesítményről, nem ítélet rólad.'],
     ex:{t:'Mitől függ az értékem?',min:10,steps:[
      'Fejezd be ötször a mondatot: „Akkor érzem magam értékesnek, ha…”',
      'Jelöld, melyik függ külső eredménytől vagy mások véleményétől.',
      'Írj mellé egy értékalapú változatot: „Akkor is rendben vagyok, ha …, mert …”.']},
     q:['Melyik területen hullámzik a legjobban az önértékelésem?','Melyik az az érték, amit akkor is megélhetek, ha kudarcot vallok?','Hogyan beszélnék egy barátomhoz, akinek az értéke ugyanattól függene, mint az enyém?'],
     ms:'Azonosítottál egy feltételes forrást, és van hozzá értékalapú ellenpontod.'}]},
  {name:'Mester', lessons:[
    {t:'A kerülés ára',
     lead:'Minden elkerült helyzet rövid távon megkönnyebbülés, hosszú távon a félelem erősítése.',
     body:[
      'A kerülés az önbizalom legcsendesebb ellensége. Amikor kihagysz egy helyzetet, amitől tartasz, a szorongás azonnal csökken, és ez jutalomként erősíti a kerülést. Közben viszont elmarad a tapasztalat, amely cáfolhatná a félelmet. A jóslat ellenőrizetlen marad, és legközelebb még erősebb lesz.',
      'A kerülésnek vannak finom formái is, ezeket <strong>biztonsági viselkedésnek</strong> hívják: elmész a helyzetbe, de a sarokban állsz, előre megírod a mondatot, nem nézel a szemébe senkinek, túlkészülsz. Clark és Wells modellje szerint ezek ugyanúgy fenntartják a félelmet, mert a jó kimenetelt a biztonsági viselkedésnek tulajdonítod, nem magadnak.',
      'A mester szint feladata, hogy lásd a saját kerülési térképedet, beleértve a finom formákat is.'],
     ex:{t:'Kerülési térkép',min:20,steps:[
      'Írj listát a nyílt kerülésekről: amit egyszerűen nem csinálsz meg.',
      'Írj listát a biztonsági viselkedésekről: amit megcsinálsz, de „védőfelszereléssel”.',
      'Mindegyik mellé írd oda, mit veszítesz vele hosszú távon.',
      'Jelölj meg egyet, amit a héten elhagysz, és figyeld meg, mi történik.']},
     q:['Melyik biztonsági viselkedésem a legrégebbi, és mit véd valójában?','Mi lenne az életemben másképp, ha a legnagyobb kerülésemet abbahagynám?','Mi történt, amikor elhagytam egy biztonsági viselkedést?'],
     ms:'Elhagytál egy biztonsági viselkedést legalább egy helyzetben, és leírtad a hatását.'},
    {t:'A belső szabályok',
     lead:'„Ha hibázom, mindenki lenéz.” Ezek a ki nem mondott szabályok irányítanak.',
     body:[
      'Fennell modelljében a mélyben egy alapvető hiedelem áll („nem vagyok elég”), és erre épülnek a <strong>túlélési szabályok</strong>: „Mindig tökéletesnek kell lennem”, „Soha nem mondhatok nemet”, „Ha nem tetszem mindenkinek, valami baj van velem”. Ezek a szabályok egykor értelmesek voltak: megvédtek a kritikától vagy az elutasítástól.',
      'A szabály addig működik, amíg be tudod tartani. Ha viszont megsérül (hibázol, valaki elégedetlen), a régi hiedelem aktiválódik, és jön a szorongás vagy a lehangoltság. Ezért a szabályokat nem betartani kell erősebben, hanem rugalmasabbá tenni.',
      'Egy jó új szabály reális és emberi: „Szeretném jól csinálni, de a hiba is elfér benne”, „Fontos, hogy figyelek másokra, és fontos az is, hogy magamra”.'],
     ex:{t:'Szabály-átírás',min:20,steps:[
      'Írd le három „ha…, akkor…” vagy „mindig/soha” szabályodat.',
      'Mindegyiknél: honnan jön, mit véd, és mibe kerül?',
      'Írj mindegyikhez egy rugalmas változatot.',
      'Válassz egyet, és tervezz egy kísérletet, amelyben az új szabály szerint cselekszel.']},
     q:['Melyik szabályom a legszigorúbb, és ki tanította nekem?','Mi történik bennem, amikor egy szabályom sérül?','Hogyan élnék, ha a rugalmas változat szerint működnék?'],
     ms:'Van három átírt szabályod, és egyet kipróbáltál egy valódi helyzetben.'},
    {t:'Saját önbizalom-modell',
     lead:'Rakd össze a teljes képet: honnan jön, mi tartja fenn, és hol tudsz beavatkozni.',
     body:[
      'Az első modul végére összeáll a saját modelled. A <strong>korai tapasztalatok</strong> (kritika, összehasonlítás, feltételes elismerés) kialakítottak egy alaphiedelmet. Erre épülnek a <strong>szabályok</strong>. A szabályokat fenyegető helyzetekben <strong>jóslatok</strong> születnek, a jóslatok <strong>kerüléshez</strong> és biztonsági viselkedéshez vezetnek, a kerülés pedig megakadályozza a cáfoló tapasztalatot. A kör bezárul.',
      'A kör több ponton is megszakítható: a jóslat ellenőrzésénél (kísérletek), a kerülésnél (fokozatos kitettség), a belső hangnál (kritikus átírása, önegyüttérzés) és a bizonyíték-gyűjtésnél (napló). A következő modulok ezeket a pontokat veszik sorra.',
      'Ha a minta nagyon mély, régi sérülésből fakad, vagy erős szorongással, lehangoltsággal jár, ez a munka terapeutával a leghatékonyabb. A kurzus jó kiegészítés, de nem helyettesíti.'],
     ex:{t:'Az én köröm',min:25,steps:[
      'Rajzold le a kört öt dobozzal: korai tapasztalat → alaphiedelem → szabályok → jóslat és kerülés → elmaradó bizonyíték.',
      'Töltsd ki mindegyiket a saját példáiddal.',
      'Jelöld meg azt a pontot, ahol a legkönnyebben be tudsz avatkozni.',
      'Írd le, mit fogsz ott tenni a következő két hétben.']},
     q:['Mi a saját köröm legerősebb láncszeme?','Mit értettem meg magamról ebben a modulban, amit eddig nem láttam?','Kinek tudnám ezt a modellt elmondani úgy, hogy támogasson?'],
     ms:'Elkészült a saját modelled, és tudod, melyik ponton kezdesz.'}]}
  ]});
