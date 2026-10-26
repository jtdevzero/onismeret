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
Mivel lehet téged megnyugtatni egy nehéz nap után?
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
Hogyan hat a fáradtság vagy a stressz a vágyadra, és mi segít ilyenkor?
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
Találj ki egy közös titkos kézjelet arra, ha szünetet kérünk.
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
Mi segít, hogy jól érezd magad a saját testedben, amikor közel vagyunk egymáshoz?
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
Rajzolj a levegőbe egy közös hétvégi programot, a másik pedig találja ki, mi az.
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
Egy közös este, amikor felváltva választunk programot`));
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
Melyik közös félreértésen tudunk már mosolyogni?
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
Milyen közös emléket szeretnél a következő nyárról?
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
Napfelkelte megnézése egy közeli kilátóból
Egy régi kedvenc hely újrafelfedezése
Egy közösen választott új hobbi kipróbálása
Közös jótékonysági vagy önkéntes program keresése
Egymásnak készített tematikus lejátszási lista
Csillagnézés egy biztonságos, nyugodt helyen
Egy közös emlékfüzet elkezdése`);
 return {closer,honest,truth,dare,radar,match,quiz,memories,future,bucket};
})();

/* Külön választható flörtös és felnőtt beszélgetőcsomagok. */
window.PAIR_PACKS = (() => {
 const L=s=>s.trim().split('\n').map(x=>x.trim()).filter(Boolean);
 return {
 radar:[{id:'chemistry',name:'Kémia · 18+',adult:true,items:[
 ['Mitől érzed jobban a köztetek lévő kémiát?','Egy hosszú beszélgetéstől','Apró, figyelmes gesztusoktól'],
 ['A flört nálad inkább…','Játékos humor','Őszinte bókok'],
 ['Milyen kezdeményezés esik jobban?','Egy egyenes kérdés','Egy finom célzás, amit megbeszélünk'],
 ['Mikor oldódsz könnyebben?','Egy nyugodt estén','Egy közös kaland után'],
 ['Egy romantikus üzenetben inkább…','Kedves emléket idéznék','Következő találkozót terveznék'],
 ['Melyik bók érintene meg jobban?','Ahogy gondolkodsz, lenyűgöz','Jó veled egy térben lenni'],
 ['A közeledés tempója inkább…','Lassan kibontakozó','Gyorsabb, ha mindketten szeretnénk'],
 ['Egy késő esti beszélgetéshez…','Lágy zene','Csend és figyelem'],
 ['A romantikus meglepetés legyen…','Személyes és apró','Együtt megélt program'],
 ['Mitől érzed magad kívánatosnak?','Ha ezt ki is mondják','Ha külön időt szánnak rám'],
 ['Egy közös emléket inkább…','Újra átélnék','Új nézőpontból beszélnék meg'],
 ['Mikor könnyebb kimondanod a vágyadat?','Ha előbb megkérdeznek','Ha én választhatom meg a pillanatot'],
 ['Egy ismerkedős estén inkább…','Sokat nevetnék','Mélyebb témákat érintenék'],
 ['Mi esik jobban egy randi után?','Rögtön egy kedves üzenet','Másnap egy személyes visszajelzés'],
 ['Milyen meghívás fogna meg?','Van kedved velem felfedezni valamit?','Lenne kedved egy csak nekünk szóló estéhez?'],
 ['A figyelem inkább ebből látszik…','Emlékszik, mit meséltem','Észreveszi, mire van most szükségem'],
 ['Egy romantikus filmben inkább…','A szellemes párbeszéd fog meg','A csendes összhang fog meg'],
 ['Milyen közös titok tetszene?','Egy csak általunk ismert becenév','Egy közösen kitalált jel'],
 ['A flörtben inkább…','Kérdezek','Magamról osztok meg valamit'],
 ['Mit választanál egy nyugodt randira?','Egy eldugott kávézót','Egy hosszú esti sétát'],
 ['A közelséghez inkább…','Időre van szükségem','Jólesik a nyílt beszélgetés'],
 ['Mivel teremtenél romantikus hangulatot?','Zenével és fénnyel','Figyelmes beszélgetéssel'],
 ['Milyen üzenetet őriznél meg?','Egy vicces belső utalást','Egy őszinte vallomást'],
 ['Egy szabad estén inkább…','Új közös élményt keresnék','Egy kedves emléket idéznék fel']
 ]}],
 truth:[{id:'spark',name:'Flört és szikra · 18+',adult:true,truth:L(`Mi volt az a pillanat, amikor más szemmel kezdtél nézni rám?
Milyen bókot szeretnél egyszer hallani tőlem?
Milyen gesztusomban érzed a legtöbb vonzalmat?
Milyen helyzetben lennél szívesen kezdeményezőbb?
Melyik közös emlékünkből csinálnál romantikus jelenetet?
Milyen mondattal hívnál el engem újra egy első randira?
Mitől érzed különlegesnek egy találkozásunk végét?
Milyen apró részletet vettél észre rajtam először?
Milyen közös pillanatot szeretnél szavakban megőrizni?
Miben vagyunk szerinted meglepően jó páros?
Milyen romantikus ötlethez kérnéd ki a véleményemet?
Hogyan jeleznéd, ha most közelebb szeretnél kerülni hozzám?
Melyik tulajdonságomban van számodra a legtöbb báj?
Milyen ismerkedős kérdést tennél fel nekem most?
Mitől lesz nálad egy pillantás emlékezetes?
Milyen közös programon tudnál teljesen feloldódni?
Mikor volt jóleső meglepetés a figyelmem?
Milyen flörtös mondaton tudnál jóízűen nevetni?
Milyen meghívásra mondanál ma szívesen igent?
Mit szeretnél megtudni arról, hogyan látlak téged?
Milyen közös hangulatot idéz számodra a nevem?
Mitől különleges számodra egy egymásnak írt üzenet?
Mikor szeretsz inkább egyenesen kérdezni a finom célzások helyett?
Milyen romantikus szokást próbálnál ki velünk?`),dare:L(`Mondj egy bókot, amely egy közös emlékünkhöz kapcsolódik.
Találj ki egy szellemes, kedves megszólítást kettőnk következő randijára.
Hívd el a másikat egy képzeletbeli első randira három mondatban.
Válassz egy dalt, és mondd el, miért jut róla eszedbe a másik.
Mondj egy őszinte mondatot arról, mit értékelsz a figyelmében.
Tervezz meg egy romantikus találkozót három, közösen választott szóval.
Találjatok ki egy belső poént a mai estéhez.
Meséld el a megismerkedésünket úgy, ahogy szerinted a másik élte meg.
Írj egy képzeletbeli képeslapot egy közös hétvégéről.
Mondj egy apró figyelmességet, amit szívesen adnál a másiknak.
Kérdezd meg, milyen közös programnak örülne most legjobban.
Írjatok együtt egy háromszavas mottót a mai estére.
Súgj a másik fülébe egy bókot, ha ez neki is jólesik.
Mondj egy bókot a másik humoráról vagy gondolkodásáról.
Mesélj egy kedves jelenetet egy lehetséges közös utazásról.
Kérdezd meg, melyik korábbi bókodat őrizte meg a másik.
Találjatok ki egy vicces jelszót arra, hogy ideje közös programot szervezni.
Fejezd be ezt a mondatot: „Azért jó ma veled lennem, mert…”
Képzeld el, hogy újra bemutatkozol a másiknak, és mutass meg egy ritkán látott oldaladat.
Köszönj meg egy apró gesztust, amellyel a másik figyelt rád.
Találjatok ki egy közösen választott, telefonmentes randiötletet.
Mondj egy tulajdonságot, amelyben szerinted jól kiegészítjük egymást.
Írj egy rövid meghívást egy következő, nyugodt beszélgetésre.
Kérdezd meg, van-e olyan közös emlék, amit szívesen felidézne most.`)}],
 match:[{id:'desires',name:'Vágyak, közös igenek · 18+',adult:true,items:L(`Nyugodt beszélgetés arról, mitől érezzük magunkat kívánatosnak
Egymásnak elmondott romantikus fantáziák megbeszélése
Annak megosztása, milyen kezdeményezés esik jól
Közös romantikus lejátszási lista összeállítása
Egy csak kettőnknek szóló esti randi megtervezése
Beszélgetés arról, milyen tempóban szeretünk közeledni
Egy személyes bókokra szánt közös este
Annak megbeszélése, milyen környezet segít ellazulni
Egy kedves, romantikus levél megírása egymásnak
Beszélgetés a közelség és a személyes tér egyensúlyáról
Egymás kedvenc romantikus emlékeinek felidézése
Annak megosztása, milyen figyelemre vágyunk most
Közös szokás kialakítása az intim témák megbeszéléséhez
Egymás masszírozása előre megbeszélt keretekkel
Beszélgetés arról, mit jelent számunkra a gyengédség
Egy új napszak vagy helyszín kipróbálása a kettesben töltött időnkhöz
Annak megosztása, mikor van szükségünk több időre
Beszélgetés arról, milyen jelből tudjuk, hogy érdemes lassítani
Egy ráérős este elvárások nélkül, csak összebújással
Beszélgetés a vágyaink időbeli változásáról
Közös fürdő vagy zuhany, ha mindkettőnknek jólesik
Annak megosztása, milyen kérdést szeretnénk gyakrabban hallani
Egymás romantikus ötleteinek meghallgatása elvárások nélkül
Egy közös, nyugodt pillanat kiválasztása a következő beszélgetéshez`)}],
 honest:[{id:'intimacy',name:'Intimitásról nyíltan · 18+',adult:true,items:L(`Milyen módon szeretnéd, hogy rákérdezzek a kívánságaidra?
Mi segít abban, hogy ne kelljen elvárásoknak megfelelned?
Hogyan különböztessük meg a bizonytalanságot az igentől?
Milyen témáról beszélnél könnyebben írásban, mint szóban?
Miből érzed, hogy valóban figyelek a válaszodra?
Hogyan szeretnéd, hogy fogadjak egy később megváltozott döntést?
Milyen közös szokás segítene nyugodtan beszélni a szexuális igényeinkről?
Mitől érzed úgy, hogy egy kívánságodat ítélkezés nélkül elmondhatod?
Hogyan lehetne több helye a kíváncsiságnak a feltételezések helyett?
Mi segít, ha eltérő időben vágyunk közelségre?
Hogyan szeretnéd jelezni, ha egy kérdést most passzolnál?
Milyen reakció esne jól egy érzékeny gondolat megosztása után?
Milyen szavakkal beszélsz legszívesebben az intimitásról?
Mitől különbözik nálad a romantikus hangulat és az együttlét iránti vágy?
Hogyan tudjuk elengedni, hogy minden közös estéből valaminek következnie kelljen?
Milyen gesztusból érzed, hogy a határaid fontosak nekem?
Mire szeretnél időt hagyni egy intim témáról szóló beszélgetés után?
Hogyan tudjuk kedvesen jelezni, ha félreértettük egymást?
Milyen kérdés segítene megérteni, mire van most szükséged?
Mit szeretnél, hogy tudjak a közelséghez kapcsolódó bizonytalanságaidról?
Hogyan lehessen beszélni a vágyakról úgy, hogy az ne jelentsen vállalást?
Milyen hétköznapi feszültséget lenne jó külön kezelni az intim időnktől?
Hogyan tudunk egymás különböző igényeire közös feladatként tekinteni?
Mit szeretnél megköszönni abból, ahogyan a másik meghallgatott?`)}]
 };
})();

/* Mocskos 18+ csomagok: nyers, explicit kérdések és kihívások. Minden passzolható, a másik bármikor nemet mondhat. */
(() => {
 const L=s=>s.trim().split('\n').map(x=>x.trim()).filter(Boolean),P=window.PAIR_PACKS;
 P.radar.push({id:'fire',name:'Tűzpróba · mocskos 18+',adult:true,items:[
 ['A szám inkább…','Én nyalok','Engem nyaljanak'],
 ['A dugás inkább…','Lassan, hogy minden centit érezzek','Keményen, amíg bírjuk'],
 ['Az ágyban…','Én baszlak meg téged','Te baszol meg engem'],
 ['Kedvenc póz…','Kutyapóz','Lovaglás'],
 ['Fent vagy lent?','Fent','Lent'],
 ['A hangerő…','Fojtott nyögés','Üvöltés, hadd hallják'],
 ['A paskolás…','Pár finom csapás','Amíg ki nem pirul a seggem'],
 ['Hajhúzás dugás közben…','Igen, erősen','Inkább ne'],
 ['Mocskos beszéd…','Szidj mocskosan','Dicsérj mocskosan'],
 ['Kikötözve…','Én legyek','Te legyél'],
 ['Hol?','Az ágyban','Konyhapult, mosógép, lépcső, bárhol otthon'],
 ['Az előjáték…','Kínozz, amíg könyörgök','Azonnal dugj meg'],
 ['Elélvezéskor…','A testemre','A számba'],
 ['A vibrátor…','Rajtam, amíg remegek','Rajtad, amíg remegsz'],
 ['Szexvideó…','Vegyük fel és nézzük vissza','Csak élőben'],
 ['Egy éjszaka…','Egy hosszú, brutális menet','Ahányszor csak bírjuk'],
 ['Az elélvezés megtagadása…','Kínozz vele, könyörögni akarok','Ne tarts vissza'],
 ['A ruhám…','Tépd le','Hagyd rajtam, csak told félre'],
 ['A tükör előtt…','Nézni akarom, ahogy dugunk','Csukott szemmel jobb'],
 ['Reggel…','Ébressz nyalással','Ébressz egy gyors dugással'],
 ['A fenekem…','Csak paskold','Játssz is vele'],
 ['Utána…','Még egy menet','Hulla vagyok'],
 ['Napközben…','Küldj meztelen képet','Írd meg, mit csinálsz velem este'],
 ['Ha könyörgök…','Add meg rögtön','Várass még']
 ]});
 P.truth.push({id:'naughty',name:'Mocskos · 18+',adult:true,truth:L(`Mit csinálnál velem most, ha nem kellene játszanunk? Mondd el mocskosan, részletesen.
Mi a legperverzebb dolog, amit valaha meg akartál csinálni velem?
Pontosan hogyan akarsz ma éjjel elélvezni?
Mi indít be jobban: ha nyalnak, vagy ha dugnak?
Melyik pózban a legjobb, amikor dugunk?
Mi volt a legmocskosabb szex az életedben? Részleteket kérek.
Mire gondoltál utoljára, amikor magadhoz nyúltál?
Hányszor nyúltál magadhoz rám gondolva az elmúlt héten?
Mit mondjak a füledbe, miközben dugunk? Mondd ki szó szerint.
Melyik testrészemet nyalnád a legszívesebben, és meddig bírnád?
Mi a legbetegebb fantáziád, amit még senkinek sem mertél elmondani?
Egy tízes skálán milyen durván bánjak veled? És mit jelent nálad a tízes?
Hová élvezzek a legszívesebben? Mondd ki.
Milyen szexvideót vennél fel kettőnkről, és mi lenne a címe?
Melyik pornókategóriát nézed a legtöbbet, amikor egyedül vagy?
Mit csinálnál velem, ha egy éjszakára a játékszered lennék?
Mennyire erősen húzhatom a hajad, és hányat paskolhatok a seggedre?
Hol nyaltál vagy dugtál a legnagyobb lebukásveszélyben?
Milyen szexjátékot próbálnál ki rajtam elsőként, és hogyan?
Ha ma éjjel minden kérésedre igent mondanék, mi lenne az első három?
Milyen hangosan akarod hallani, ahogy élvezek?
Inkább könyörögnél, hogy megdugjalak, vagy parancsolnál?
Mondd ki háromszor egymás után a legmocskosabb szót, ami beindít.
Mit kennél rám, hogy aztán lenyald?`),dare:L(`Súgd a másik fülébe, pontosan hogyan fogod megdugni ma éjjel.
Vedd le a fogaddal a másik alsóneműjét.
Nyald végig a másik testét a nyakától a köldöke aláig.
Nyúlj magadhoz a ruhádon keresztül fél percig, miközben a másik néz.
Lovagolj a másik ölében egy percig, ruhában.
Vetkőzz meztelenre, és maradj így a következő három körben.
Nyögd el hangosan, ahogy elélvezel.
Csókold és nyald a másik combjának belső oldalát egy percig.
Mondd el szó szerint, hogyan nyalnád ki vagy szopnád le.
Markold meg a másik seggét, és paskold meg háromszor.
Harapj bele a másik fenekébe.
Küldj a másiknak egy meztelen képet magadról, és nézze meg most rögtön.
A másik egy percig bárhol megérinthet, ahol akar, ruha nélkül.
Kösd be a másik szemét, és két percig csak a nyelved érhet hozzá.
Helyezkedj el abban a pózban, amiben a legszívesebben dugnál most.
Vetkőztessétek le egymást teljesen egy perc alatt.
Szívj ki egy foltot a másik mellén vagy combján.
Simogasd egy percig a másik lába közét, ruhán keresztül.
Nézz a másik szemébe, és mondd: „Most azonnal meg akarlak baszni.”
A következő kört a másik ölében, meztelenül játszod.
Szopd meg lassan a másik ujjait, és közben nézz a szemébe.
Kenj valamit a másik bőrére, és nyald le róla.
A másik dönti el, mit veszel le, és hogyan mutatod meg magad neki.
Kényeztesd a másikat a száddal ott, ahol ő kéri, két teljes percig.`)});
 P.match.push({id:'wishlist',name:'Mocskos kívánságlista · 18+',adult:true,items:L(`69 egészen az elélvezésig
Elélvezés az arcomra
Szájba élvezés és lenyelés
Anális szex lassan, sok síkosítóval
Kikötözve, teljesen kiszolgáltatva, stopszóval
Fenékpaskolás, amíg ki nem pirul
Hajhúzás dugás közben
Egy éjszaka, amikor az egyikünk a másik szexrabszolgája, stopszóval
Szexvideó felvétele és közös visszanézése
Vibrátor, amíg többször el nem élvezek
Közös pornónézés, aztán ugyanazt csináljuk
Önkielégítés egymás előtt, végig szemkontaktussal
Dugásmaraton reggelig
Gyors dugás a konyhapulton, félig felöltözve
Mocskos beszéd és káromkodás az egész idő alatt
Szerepjáték: két idegen, akik egy bárban szedik fel egymást
Meztelen képek cseréje napközben
Popsidugó egész este, aztán anális játék
Dugás a tükör előtt, végig nézve magunkat
Elélvezni csak engedéllyel, könyörgésig húzva
Fenekelés kézzel vagy lapáttal
Ébresztés úgy, hogy már nyalnak
Kézbilincs és szemkötő egyszerre
Szerepcsere strap-onnal`)});
 P.honest.push({id:'frank',name:'Szex, kertelés nélkül · 18+',adult:true,items:L(`Mit csinálok rosszul, amikor a számmal kényeztetlek? Mondd meg őszintén.
Valójában mennyire durván szereted a szexet, és mit nem mertél még kérni?
Milyen gyakran nyúlsz magadhoz, mivel, és mire gondolsz közben?
Mi a legjobb érzés neked dugás közben, pontosan hol és hogyan?
Melyik pózban érzed a legmélyebben, és miért kéred ritkán?
Mennyire izgat az anál, és melyik oldalon?
Hová szeretnéd, hogy élvezzek, és mi az, ami kiábrándít?
Milyen mocskos szavakat akarsz hallani dugás közben? Mondd ki őket.
Gondoltál már hármasra, vagy arra, hogy valaki néz minket? Mennyire komolyan?
Milyen pornót nézel, és melyik jelenetet csinálnád meg velem?
Mit csinált egy korábbi partnered jobban az ágyban, mint én?
Megjátszottad már, hogy elélvezel? Velem is?
Hol a legérzékenyebb a tested ott, ahol még nem nyaltalak elég sokáig?
Szereted, ha leszorítalak, lefoglak és nem engedlek?
Mit csinálnál velem, ha egy egész estére a szexrabszolgád lennék?
Milyen szexjátékot rendelnénk ma este, ha holnapra kihoznák?
Mikor indultál be tőlem a legjobban, és mit éreztél a testedben?
Mitől lohad le a kedved dugás közben?
Csinálnánk pornót magunkról? Mi kerülne bele, és hogyan vigyáznánk rá?
Meddig kell kényeztetnem, hogy könyörögj?
Milyen szavakat szeretsz a nemi szervedre, és melyiket utálod?
Hányszor dugnál egy héten, ha semmi sem akadályozna?
Mit csináljak veled gátlástalanabbul?
Mi az a határ, amit akkor sem akarsz átlépni, ha nagyon be vagy indulva?`)});
})();
