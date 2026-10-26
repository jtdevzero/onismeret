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

/* Mocskos 18+ csomagok: nyílt, explicit kérdések és kihívások. Minden passzolható, a másik bármikor nemet mondhat. */
(() => {
 const L=s=>s.trim().split('\n').map(x=>x.trim()).filter(Boolean),P=window.PAIR_PACKS;
 P.radar.push({id:'fire',name:'Tűzpróba · mocskos 18+',adult:true,items:[
 ['Elélvezni inkább…','Együtt','Egymás után'],
 ['A szám inkább…','Adni szeretne','Kapni szeretne'],
 ['Az ágyban inkább…','Én parancsolok','Én engedelmeskedem'],
 ['A dugás inkább…','Lassan és mélyen','Gyorsan és keményen'],
 ['Kedvenc irány…','Szemtől szemben','Hátulról'],
 ['Fent vagy lent?','Fent','Lent'],
 ['A hangerő…','Fojtott nyögések','Hadd hallják a szomszédok'],
 ['A paskolás…','Gyengéden','Amíg ki nem pirul'],
 ['A hajhúzás…','Beindít','Nem nekem való'],
 ['Mocskos szavak…','Súgva a fülembe','Hangosan, parancsolva'],
 ['Kötözés…','Engem kötözz ki','Én kötözlek ki téged'],
 ['Hol?','Ágyban, kényelmesen','Konyhapult, zuhany, bárhol otthon'],
 ['Az előjáték…','Félórás kínzás','Rögtön a lényegre'],
 ['Elélvezéskor…','Bárhova','Előre megbeszélt helyre'],
 ['A vibrátor…','Rajtam','Rajtad'],
 ['Videó magunkról…','Felvenném','Inkább csak élőben'],
 ['Egy éjszaka…','Egy hosszú menet','Három gyors'],
 ['Az elélvezés megtagadása…','Megőrjít, kérem','Ne kínozz'],
 ['A ruhám…','Tépd le','Vedd le lassan'],
 ['A tükör…','Nézni akarom, ahogy dugunk','Csukott szemmel jobb'],
 ['Reggel…','Ébressz a száddal','Ébressz egy gyors menettel'],
 ['Egy fantáziát…','Mondd el közben','Csináljuk meg'],
 ['Utána…','Még egy kör','Összebújás és alvás'],
 ['Napközbeni pajzán üzenet…','Képpel','Csak szavakkal']
 ]});
 P.truth.push({id:'naughty',name:'Mocskos · 18+',adult:true,truth:L(`Mit csinálnál velem most azonnal, ha nem kellene játszanunk? Részletesen.
Mi a legmocskosabb dolog, amit csinálni akarsz velem, de még nem mertél kérni?
Hogyan szeretsz a legjobban elélvezni?
Mi jobb: ha a számmal kényeztetlek, vagy ha a kezemmel?
Melyik pózban élvezel el a legkönnyebben?
Mi volt a legdurvább szex az életedben?
Mire gondolsz, amikor magadhoz nyúlsz?
Hányszor nyúltál magadhoz rám gondolva az elmúlt hónapban?
Mit akarsz hallani tőlem, miközben dugunk?
Melyik testrészemet nyalnád a legszívesebben, és meddig?
Mi a legperverzebb fantáziád, amit még senkinek sem mondtál el?
Szeretnéd, ha néha durvábban bánnék veled az ágyban? Mennyire durván?
Hol szeretnéd érezni, amikor elélvezek?
Csinálnál velem szexvideót? Mit vennénk fel először?
Melyik pornókategóriára kattansz rá titokban a legjobban?
Melyik az a pillanat szex közben, amikor teljesen elveszted a fejed?
Mit csinálnál velem, ha egy egész éjszakára azt tehetnéd velem, amit akarsz?
Szereted, ha meghúzzák a hajad vagy elfenekelnek? Mennyire erősen?
Mi volt a legkockázatosabb hely, ahol valaha kényeztettél valakit?
Melyik szexjátékot próbálnád ki rajtam először?
Ha most bármit kérhetnél tőlem az ágyban, mi lenne az?
Milyen hangosan akarod, hogy nyögjek?
Mi indít be jobban: ha könyörgök, vagy ha parancsolgatok?
Mondd ki most a legmocskosabb szót, ami szex közben beindít.`),dare:L(`Súgd a másik fülébe a legmocskosabb mondatot, ami most eszedbe jut.
Vedd le a fogaddal a másik egyik ruhadarabját.
Nyald végig a másik nyakát a kulcscsontjától a füléig.
Mutasd meg a saját testeden, hol akarod, hogy a másik megérintsen.
Ülj a másik ölébe, és fél percig lassan mozogj rajta, ruhában.
Vetkőzz alsóneműre, és maradj úgy a következő körig.
Nyögd el, milyen hangot adsz ki, amikor elélvezel.
Csókold végig a másik hasát egészen a köldöke alá.
Mondd el részletesen, hogyan kényeztetnéd a száddal.
Markold meg a másik fenekét, és mondd el, mit csinálnál vele.
Harapj gyengéden a másik combjának belső oldalába.
Írj egy mocskos üzenetet a másik telefonjára, amit csak ma éjjel olvashat el.
A másik egy percig bárhol megérinthet, ahol akar, ruhán keresztül.
Kösd be a másik szemét, és két percig csak a szádat használhatod rajta.
Mutasd meg pózzal, hogyan dugnál vele a legszívesebben.
Vegyél le egy ruhadarabot a másikról, és egyet magadról.
Szívj ki egy foltot a másik bőrén ott, ahol ő engedi.
Simogasd egy percig a másik combjának belső oldalát. Feljebb nem mehetsz.
Nézz a másik szemébe, és mondd ki: „Most azonnal meg akarlak dugni.”
Játsszátok le a következő két kört csak alsóneműben.
Szopd meg lassan a másik ujjait, egyenként.
Mondd el, mit csinálnál vele egy szállodai szobában, ha három órátok lenne.
A másik dönti el, melyik ruhadarabodat veszi le, és hogyan.
Kényeztesd a másikat a száddal ott, ahol ő kéri, egy teljes percig.`)});
 P.match.push({id:'wishlist',name:'Mocskos kívánságlista · 18+',adult:true,items:L(`Egyszerre kényeztetni egymást a szánkkal (69)
Elélvezés a testemre
Szájba élvezés
Anális szex lassan, sok síkosítóval
Kikötözés és teljes kiszolgáltatottság, stopszóval
Fenékpaskolás, amíg ki nem pirul
Hajhúzás dugás közben
Egy este, amikor az egyikünk parancsol, a másik engedelmeskedik
Szexvideó csak kettőnknek
Vibrátor használata egymáson
Közös pornónézés, aztán utánozzuk
Önkielégítés egymás szeme láttára
Egész éjszakás dugásmaraton
Gyors menet a konyhapulton
Mocskos beszéd az egész idő alatt
Szerepjáték: orvos és páciens
Szexelés videóhívásban, amikor távol vagyunk
Popsidugó viselése egy egész estén
Dugás a tükör előtt, végig nézve magunkat
Elélvezni csak akkor, ha a másik megengedi
Forró masszázsgyertya viasza a bőrön
Ébresztés orális kényeztetéssel
Kézbilincs
Egy éjszaka alatt minél több póz kipróbálása`)});
 P.honest.push({id:'frank',name:'Szex, kertelés nélkül · 18+',adult:true,items:L(`Mit szeretsz a legjobban, amikor a számmal kényeztetlek, és mit csináljak másképp?
Mennyire szereted a durva szexet, és hol van a határ?
Milyen gyakran nyúlsz magadhoz, és mire gondolsz közben?
Testileg pontosan mi a legjobb érzés neked szex közben?
Melyik pózban érzed a legmélyebben?
Mennyire izgat az anális szex, és melyik oldalon?
Mit gondolsz arról, ha a szádba vagy a testedre élvezek?
Szeretnéd, ha mocskosabban beszélnék szex közben? Milyen szavakkal?
Volt már olyan fantáziád, amiben más is részt vesz? Mit gondolsz róla valójában?
Milyen pornót nézel, amikor senki sem látja?
Mit élveztél egy korábbi partnerrel, amit velem még nem csináltunk?
Mennyire fontos neked, hogy minden alkalommal elélvezz?
Hol a legérzékenyebb a tested ott, ahol még nem fedeztelek fel rendesen?
Szereted, ha leszorítalak és irányítalak?
Mit szólnál egy estéhez, amikor csak a te kényeztetésed számít, amíg bírod?
Melyik szexjátékot vennéd meg velem holnap?
Melyik pillanatban indultál be tőlem a legjobban?
Mitől zökkensz ki szex közben?
Szeretnél pajzán fotókat vagy videót magunkról? Hol tartanánk őket biztonságban?
Mennyi előjáték kell, hogy igazán beindulj?
Milyen szavak a testedre indítanak be, és melyek hangzanak kiábrándítóan?
Milyen gyakran szexelnél, ha semmi sem akadályozna?
Mit szeretnél, ha bátrabban kérnék tőled az ágyban?
Mi az a határ, amit soha nem akarsz átlépni, hogy biztosan tudjam?`)});
})();
