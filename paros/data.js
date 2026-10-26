/* Saját megfogalmazású kérdések és ötletek. A 18+ témák kapcsolati kommunikációt szolgálnak. */
'use strict';
window.PAIR_DATA = (() => {
 const lines=s=>s.trim().split('\n').map(x=>x.trim()).filter(Boolean);
 const closer=lines(`Mi az az apróság, amitől rögtön vonzóbb lesz számodra valaki?
Mikor érezted legutóbb, hogy igazán figyelnek rád?
Milyen lenne számodra egy tökéletes közös vasárnap?
Melyik történetedet mesélnéd el, hogy jobban megismerjelek?
Milyen bók maradt meg benned sokáig?
Milyen helyzetben érzed leginkább önmagadnak magad?
Mivel lehet egy nehéz nap után megnyugtatni?
Milyen közös emléket szeretnél egy év múlva felidézni?
Milyen apró gesztusból érzed, hogy fontos vagy?
Mi lepett meg bennem kellemesen?
Mit tanultál az utóbbi időben saját magadról?
Melyik szokásodat szeretnéd, ha jobban megérteném?
Mit jelent neked a minőségi együtt töltött idő?
Milyen programon lennél szívesen kezdő velem együtt?
Miből veszed észre, hogy valaki mellett biztonságban vagy?
Melyik gyerekkori örömödet hoznád vissza egy napra?
Hogyan szereted jelezni, ha egy kis egyedüllétre van szükséged?
Milyen utazást terveznél kettőnknek, ha csak egy hétvégénk lenne?
Melyik értékedből nem szeretnél engedni egy kapcsolatban?
Mit szeretnél, hogy gyakrabban kérdezzenek meg tőled?
Mikor nevettél utoljára felszabadultan valakivel?
Milyen közös hagyományt találnál ki nekünk?
Mitől lesz szerinted egy hétköznapi találkozás emlékezetes?
Mit szeretnél ma megtudni rólam?`);
 const honest=lines(`Hogyan tudnám könnyebbé tenni, hogy elmondd, mire vágysz?
Hogyan szereted jelezni, ha most nincs kedved az intimitáshoz?
Milyen körülmények segítenek abban, hogy ellazulj?
Mitől érzed magad érzelmileg biztonságban intim helyzetben?
Hogyan szeretnéd, hogy rákérdezzek, jólesik-e valami?
Mi segít, ha nehéz szavakba öntened egy kívánságodat?
Hogyan beszéljünk arról, ha eltér a szexuális vágyunk?
Milyen módon esik jól neked a kezdeményezés?
Mit jelent számodra a gyengédség a hétköznapokban?
Melyik közös szokásunk segíti a közelséget?
Hogyan szeretnéd jelezni, ha megállnál vagy szünetet kérnél?
Milyen témáról szeretnél ítélkezés nélkül beszélgetni?
Hogyan beszéljünk a védekezésről úgy, hogy mindketten nyugodtak legyünk?
Mitől érzed, hogy a nemet mondásodnak valóban van helye?
Milyen elvárást szeretnél levenni a vállunkról?
Mennyi beszélgetésre vagy csendre van szükséged együttlét után?
Hogyan tudjuk megkülönböztetni a kíváncsiságot az ígérettől?
Milyen szerepe van számodra a humornak az intimitásban?
Hogyan jelezzünk egymásnak, ha valami megváltozott az igényeinkben?
Melyik napszakban könnyebb számodra nyugodtan kapcsolódni?
Hogyan szeretnéd, hogy reagáljak egy bizonytalan válaszodra?
Mi segít abban, hogy ne teljesítményként gondolj az együttlétre?
Milyen határt fontos most tiszteletben tartanunk?
Melyik mai gondolatot szeretnéd magunkkal vinni?`);
 const truth=lines(`Mi volt az első benyomásod rólam?
Mit találsz vonzónak a viselkedésemben?
Milyen randiötletedet nem mondtad még el?
Mikor voltál utoljára kellemesen zavarban mellettem?
Milyen romantikus gesztust szeretnél egyszer átélni?
Mi a legkedvesebb emléked egy beszélgetésünkről?
Mitől érzed magad kívánatosnak?
Mi az, amit nehéz szemtől szemben megkérdezned?
Milyen közös kalandra mondanál szívesen igent?
Melyik tulajdonságomra vagy a legkíváncsibb?
Mit szeretnél, hogy tudjak a határaidról?
Milyen filmbe illő találkozást képzelnél el nekünk?
Milyen bókot adnál nekem most?
Mitől lesz neked emlékezetes egy csók?
Mi az a kis figyelmesség, amivel le lehet venni a lábadról?
Mikor érzed leginkább a köztünk lévő kémiát?`);
 const dare=lines(`Mondj egy őszinte bókot, ami nem a másik külsejéről szól.
Találj ki kettőnknek egy vicces, romantikus filmcímet.
Mesélj el egy képzeletbeli randit három mondatban.
Válassz egy dalt, ami szerinted illik ehhez az estéhez.
Tartsatok egy rövid, közösen vállalt szemkontaktust; bármikor el lehet nevetni.
Kérdezd meg, jólesne-e most egy ölelés. A választ fogadd el.
Mutasd meg szavak nélkül, hogyan örülsz egy találkozásunknak.
Írj egy kedves, egymondatos meghívót egy következő randira.
Találj ki egy közös titkos kézjelet arra, hogy szünetet kértek.
Tervezz meg egy húszperces közös programot pénzköltés nélkül.
Fejezd be: „Ma este azt értékelem benned, hogy…”
Mondj három apró dolgot, amit szívesen csinálnál együtt.
Ha mindkettőtöknek jólesik, fogjátok meg egymás kezét egy rövid időre.
Mesélj el egy kedves közös jelenetet úgy, mintha egy film előzetese lenne.
Válasszatok együtt egy új becenevet a következő körre.
Kérdezd meg a másiktól, milyen figyelmesség esne jól most.`);
 const radar=[
 ['Milyen találkozás vonz jobban?','Lassan kialakuló vonzalom','Azonnali szikra'],
 ['Egy szabad estére inkább…','Otthoni beszélgetés','Közös kimozdulás'],
 ['Milyen randi illik hozzád?','Előre megtervezett','Spontán'],
 ['Mit választanál?','Hosszú séta','Közös főzés'],
 ['Egy üzenetben inkább…','Kedves szavak','Játékos humor'],
 ['Közös programként…','Valami új kipróbálása','Egy régi kedvenc'],
 ['A figyelmesség, ami közelebb áll hozzád…','Apró ajándék','Rám szánt idő'],
 ['Egy találkozó ideális kezdése…','Nyugodt kávézás','Vidám közös program'],
 ['Hogyan ismerkedsz szívesebben?','Ketten beszélgetve','Közös társaságban'],
 ['Milyen közös utazás vonz?','Természet és csend','Város és felfedezés'],
 ['Egy romantikus este inkább…','Gyertyafény és zene','Pokróc és csillagok'],
 ['A vonzalom nálad inkább…','Beszélgetésből nő ki','Gesztusokból indul'],
 ['Milyen közös élményt választanál?','Tánc','Kreatív alkotás'],
 ['Mit szeretsz jobban?','Meglepetést kapni','Együtt tervezni'],
 ['Mi esik jobban egy nehéz nap után?','Meghallgatás','Közös figyelemelterelés'],
 ['Hétvégi hangulat…','Lassú reggel','Korai kaland']
 ];
 const match=lines(`Telefonmentes közös este
Közösen megtervezett randi
Meglepetésrandi előre egyeztetett keretekkel
Közös tánc otthon
Egymásnak írt kedves levél
Beszélgetés arról, mitől érezzük magunkat kívánatosnak
Beszélgetés romantikus fantáziákról
Beszélgetés az intimitás határairól
Egy új közös esti szokás kialakítása
Ölelés, ha mindkettőnknek jólesik
Közös pihenés és összebújás
Egy romantikus hétvége megtervezése
Annak megbeszélése, hogyan szeretünk kezdeményezni
Annak megbeszélése, mikor szeretnénk több személyes teret
Közös lejátszási lista készítése
Beszélgetés a vágyaink változásáról
Egymásnak mondott őszinte bókok
Közös, nyugodt reggeli az ágyban
Előre megbeszélt jel arra, ha szünetet szeretnénk
Egy közös emlék felidézése romantikus estéhez`);
 const quiz=[
 ['Melyik töltene fel jobban?','Egy csendes este','Egy mozgalmas nap'],
 ['Melyiket választanám?','Édes reggeli','Sós reggeli'],
 ['Szívesebben utaznék…','Tengerpartra','Hegyekbe'],
 ['Szabadnapon inkább…','Sokáig aludnék','Korán indulnék'],
 ['Filmezéshez inkább…','Vígjáték','Izgalmas történet'],
 ['Ajándékként inkább…','Közös élmény','Személyes tárgy'],
 ['Egy új hobbi inkább…','Kreatív','Sportos'],
 ['Ha valami bánt, inkább…','Előbb átgondolom','Rögtön megbeszélem'],
 ['Utazásnál inkább…','Pontos terv','Szabad felfedezés'],
 ['Otthoni hangulatként…','Zene szóljon','Legyen csend'],
 ['Egy üres délutánon…','Kint lennék','Otthon lennék'],
 ['A kedvenc évszakom inkább…','Meleg hónapok','Hűvös hónapok'],
 ['Egy új étteremben…','Biztos kedvencet kérek','Újdonságot próbálok'],
 ['Jobban esik…','Dicséretet hallani','Segítséget kapni'],
 ['Melyik közös programot kérném?','Társasjáték','Mozi'],
 ['Egy közös emléket inkább…','Lefotóznék','Leírnék']
 ];

 closer.push(...lines(`Milyen apró közös sikerre lennél büszke?
Milyen helyzetben szeretsz segítséget kérni?
Mi volt egy váratlanul jó találkozás az életedben?
Milyen szokásod mögött van egy fontos történet?
Hogyan mutatod ki, hogy megbízol valakiben?
Milyen helyet mutatnál meg nekem a szülővárosodból?
Mivel tudnál ma örömet szerezni saját magadnak?
Mikor szeretsz előre tervezni, és mikor inkább sodródni?
Melyik közös témánkról beszélgetnél még sokáig?
Milyen hibádból tanultál valami kedveset magadról?
Mit jelent számodra egy figyelmes kérdés?
Milyen közös pillanatból szeretnél többet?`));
 honest.push(...lines(`Hogyan szeretnéd jelezni, hogy valamire még nem tudsz válaszolni?
Milyen különbség van számodra a közelség és az elvárás között?
Mi segítene abban, hogy könnyebben kérdezz rá az igényeimre?
Hogyan szeretnéd megbeszélni, ha valami korábban jólesett, most pedig nem?
Milyen közös jelből tudhatjuk, hogy érdemes lassítani?
Mitől lesz számodra egy intim beszélgetés meghitt?
Milyen szót vagy kifejezést használnál szívesen a közelségről beszélve?
Mikor könnyebb számodra nemet mondani?
Hogyan tudunk egymás bizonytalanságára kíváncsian reagálni?
Milyen hétköznapi figyelmesség segít közelebb kerülni?
Mit szeretnél, hogy megkérdezzek, mielőtt feltételezek valamit?
Hogyan legyen helye a pihenésnek a közös időnkben?`));
 truth.push(...lines(`Melyik beszélgetésünk jut eszedbe néha váratlanul?
Milyen kedves meglepetést adnál nekem?
Melyik közös szokásunk hiányozna egy külön töltött héten?
Milyen közös szerepet játszanál szívesen egy romantikus filmben?
Mivel lehet igazán megnevettetni téged?
Milyen kis bátorságot szeretnél megünnepelni magadban?
Melyik kedves mondatot nehéz kimondanod?
Milyen ismerkedős helyzetben oldódsz fel legkönnyebben?
Milyen történetet hallanál szívesen a múltamból?
Mi az, amit most jobban értesz bennem, mint korábban?
Mitől érzed különlegesnek az együtt töltött időnket?
Milyen meglepetésprogramhoz adnál szívesen ötleteket?`));
 dare.push(...lines(`Találjatok ki egy képzeletbeli közös kávézót és adjatok neki nevet.
Mondj egy bókot úgy, mintha egy régi rádióműsorban lennél.
Írj két soros, kedves verset egy hétköznapi tárgyról, ami a másikra emlékeztet.
Válasszatok egy közös színt a mai estének, és mondjátok el, miért.
Mutass be egy lassított, képzeletbeli vörös szőnyeges bevonulást.
Találj ki egy új ünnepet, amelyet ketten tarthatnátok meg.
Kérdezd meg, melyik közös programot ismételné meg szívesen a másik.
Mondj egy kedves mondatot három különböző hangulatban.
Rajzoljatok a levegőbe egy közös hétvégi tervet, és találjátok ki.
Válasszatok egy új szót arra, amikor hiányzik a másik.
Tervezzetek meg egy képzeletbeli kirándulást csak három tárggyal.
Köszönj meg a másiknak valamit, amit eddig természetesnek vettél.`));
 radar.push(
 ['Egy közös meglepetéshez inkább…','Humor illik','Meghittség illik'],
 ['Melyik helyzetben kapcsolódsz könnyebben?','Séta közben','Egymással szemben ülve'],
 ['Egy szabad hétvégére…','Egy nagy program','Sok apró élmény'],
 ['Melyik gesztus érint meg jobban?','Egy személyes üzenet','Egy váratlan figyelmesség'],
 ['Egy randin inkább…','Felfedeznék egy új helyet','Újranéznék egy kedvenc helyet'],
 ['Egy közös játéknál…','Összedolgoznék','Barátságosan versenyeznék'],
 ['Milyen zene illene az estéhez?','Nyugodt dallamok','Vidám ritmusok'],
 ['Egy beszélgetésben inkább…','Kérdezek','Történetet mesélek']
 );
 match.push(...lines(`Egy közösen választott könyv felolvasása
Egy szabad délután tervek nélkül
Közös séta egy személyes beszélgetéssel
Egy apró, előre egyeztetett meglepetés
Beszélgetés arról, milyen bókok esnek jól
Egy közös emlékdoboz készítése
Közös szünet a közösségi médiától
Egy figyelmes üzenet megírása egymásnak`));
 quiz.push(
 ['Váratlan szabadidőben inkább…','Olvasnék','Zenét hallgatnék'],
 ['Közös alkotásként inkább…','Rajzolnék','Főznék'],
 ['Egy új városban először…','Céltalanul sétálnék','Megnézném a fő látnivalót'],
 ['A közös ünneplés inkább…','Csak kettesben','Közeli emberekkel'],
 ['Egy emléket szívesebben őrzök…','Egy tárggyal','Egy történettel'],
 ['Választás előtt inkább…','Sok információt gyűjtök','Az első megérzésemre hallgatok'],
 ['Közös pihenéshez inkább…','Séta','Film'],
 ['Egy új programmal kapcsolatban…','Rögtön kipróbálnám','Előbb utánanéznék']
 );
 const memories=lines(`Melyik találkozásunkat látnád szívesen újra egy pillanatra?
Melyik apró részletre emlékszel az első közös programunkból?
Mi volt az első dolog, ami megnevettetett velem kapcsolatban?
Melyik közös utunkon érezted magad különösen szabadnak?
Milyen illat vagy íz idéz fel egy közös emléket?
Melyik közös félreértésen tudtok már mosolyogni?
Mikor segített neked egy mondatom?
Melyik közös program lett jobb, mint amire számítottál?
Milyen dalhoz kötődik egy közös pillanatunk?
Melyik fényképünk mögötti történetet mesélnéd el?
Mikor érezted először, hogy jól tudunk együttműködni?
Milyen spontán tervünkből lett jó emlék?
Melyik régi beszélgetésünket folytatnád most?
Milyen közös nevet vagy kifejezést találtunk ki?
Melyik közös hétköznapunk vált emlékezetessé?
Mikor mutattál meg nekem valami fontosat magadból?
Melyik közös ételünk ízét hoznád vissza?
Mi volt az első közös döntésünk, amire büszke vagy?
Milyen apróságot őriztél meg egy közös programról?
Melyik szokásunk alakult ki észrevétlenül?
Mikor volt jó csak csendben együtt lenni?
Milyen közös kihívásból tanultunk valamit?
Melyik emlékünkről készítenél egy képeslapot?
Melyik közös pillanatot ismételnéd meg új körülmények között?`);
 const future=lines(`Milyen közös hétköznapnak örülnél egy év múlva?
Milyen új készséget tanulnál szívesen velem?
Milyen közös szokásra fordítanál több időt?
Melyik kis közös tervünket tudnánk egy hónapon belül elkezdeni?
Milyen ünneplést találnál ki egy jövőbeli sikerünkhöz?
Milyen élményt választanál közös ajándéknak?
Milyen otthoni hangulatot teremtenél egy pihenős estére?
Hogyan szeretnéd megosztani az ötleteidet a közös terveinkről?
Mire mondanál szívesen nemet, hogy több közös időnk legyen?
Milyen helyet fedeznél fel velem először?
Milyen közös hagyományt szeretnél öt év múlva is megtartani?
Hogyan tudnánk támogatni egymás külön céljait?
Mi lenne egy apró, közös bátorságpróba?
Milyen közös programhoz nem kellene sok pénz?
Miből vennénk észre, hogy túl sokat vállalunk?
Milyen hétvégi ritmust próbálnál ki?
Milyen közös alkotást kezdenél el?
Hogyan ünnepelnénk egy tervünk legelső kis lépését?
Mikor néznénk át legközelebb a közös ötleteinket?
Milyen utazást terveznél csak a hangulata alapján?
Milyen közös emléket szeretnél egy nyárról?
Mit tanulnál szívesen tőlem a következő időszakban?
Milyen személyes térre szeretnél vigyázni a közös tervek mellett?
Mi az a közös terv, amire még csak kíváncsi vagy, de nem ígéred?`);
 const bucket=lines(`Piknik egy közeli parkban
Közös reggeli egy új helyen
Egy rövid kirándulás ismeretlen útvonalon
Otthoni filmest saját készítésű moziplakáttal
Közös recept kipróbálása
Séta naplementében
Közös fotós kihívás a környéken
Egy ingyenes kiállítás meglátogatása
Társasjátékos délután
Egymás kedvenc dalainak meghallgatása
Egy közös növény gondozása
Saját képeslap készítése egymásnak
Kirándulás tömegközlekedéssel
Közös sütés
Egy helyi piac felfedezése
Közös nyújtás vagy könnyű mozgás
Könyvesbolti böngészés egymásnak ajánlott könyvekkel
Esős délután közös főzéssel
Egy régi kedvenc hely újrafelfedezése
Egy közösen választott új hobbi kipróbálása
Közös jótékonysági vagy önkéntes program keresése
Egymásnak készített tematikus lejátszási lista
Csillagnézés egy biztonságos, nyugodt helyen
Egy közös emlékfüzet elkezdése`);
 return {closer,honest,truth,dare,radar,match,quiz,memories,future,bucket};
})();
