/* Kártyasorok jelölőkkel: #címke, ~másodperc, !szint (1–3), @testfelépítés. Jelölő nélkül a sor sima szöveg marad. */
window.PAIR_LINES=s=>s.trim().split('\n').map(x=>x.trim()).filter(Boolean).map(line=>{
 const tags=[...line.matchAll(/ #([a-z]+)/g)].map(m=>m[1]);
 const sec=+(/ ~(\d+)/.exec(line)?.[1]||0),lvl=+(/ !([123])/.exec(line)?.[1]||0),body=/ @([a-z]+)/.exec(line)?.[1]||null;
 const t=line.replace(/ [#~!@][a-z0-9]+/g,'').trim();
 return tags.length||sec||lvl||body?{t,tags,sec,lvl,body}:t;
});
/* Saját megfogalmazású kérdések és ötletek. A 18+ témák kapcsolati kommunikációt szolgálnak. */
'use strict';
window.PAIR_DATA = (() => {
 const lines=window.PAIR_LINES;
 const closer=lines(`Mi az az apróság, amitől rögtön vonzóbb lesz számodra valaki? !2
Mikor érezted legutóbb, hogy igazán figyelnek rád? !3
Milyen lenne számodra egy tökéletes közös vasárnap?
Melyik történetedet mesélnéd el, hogy jobban megismerjelek? !2
Milyen bók maradt meg benned sokáig?
Milyen helyzetben érzed leginkább önmagadnak magad? !3
Mivel lehet téged megnyugtatni egy nehéz nap után? !2
Milyen közös emléket szeretnél egy év múlva felidézni?
Milyen apró gesztusból érzed, hogy fontos vagy? !2
Mi lepett meg bennem kellemesen?
Mit tanultál az utóbbi időben saját magadról? !3
Melyik szokásodat szeretnéd, ha jobban megérteném? !3
Mit jelent neked a minőségi együtt töltött idő? !2
Milyen programon lennél szívesen kezdő velem együtt?
Miből veszed észre, hogy valaki mellett biztonságban vagy? !3
Melyik gyerekkori örömödet hoznád vissza egy napra?
Hogyan szereted jelezni, ha egy kis egyedüllétre van szükséged? !3
Milyen utazást terveznél kettőnknek, ha csak egy hétvégénk lenne?
Melyik értékedből nem szeretnél engedni egy kapcsolatban? !3
Mit szeretnél, hogy gyakrabban kérdezzenek meg tőled? !3
Mikor nevettél utoljára felszabadultan valakivel? !2
Milyen közös hagyományt találnál ki nekünk?
Mitől lesz szerinted egy hétköznapi találkozás emlékezetes? !2
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
 ['Reggelire inkább…','Édes reggeli','Sós reggeli'],
 ['Utazáshoz inkább…','Tengerpart','Hegyek'],
 ['Szabadnapon inkább…','Sokáig aludnék','Korán indulnék'],
 ['Filmezéshez inkább…','Vígjáték','Izgalmas történet'],
 ['Ajándékként inkább…','Közös élmény','Személyes tárgy'],
 ['Egy új hobbi inkább…','Kreatív','Sportos'],
 ['Ha valami bánt, inkább…','Előbb átgondolom','Rögtön megbeszélem'],
 ['Utazásnál inkább…','Pontos terv','Szabad felfedezés'],
 ['Otthoni hangulatként…','Zene szóljon','Legyen csend'],
 ['Egy üres délutánon…','Kint lennék','Otthon lennék'],
 ['A kedvenc évszak inkább…','Meleg hónapok','Hűvös hónapok'],
 ['Egy új étteremben…','Biztos kedvencet kérek','Újdonságot próbálok'],
 ['Jobban esik…','Dicséretet hallani','Segítséget kapni'],
 ['Közös programnak inkább…','Társasjáték','Mozi'],
 ['Egy közös emléket inkább…','Lefotóznék','Leírnék']
 ];

 closer.push(...lines(`Milyen apró közös sikerre lennél büszke?
Milyen helyzetben szeretsz segítséget kérni? !3
Mi volt egy váratlanul jó találkozás az életedben? !2
Milyen szokásod mögött van egy fontos történet? !3
Hogyan mutatod ki, hogy megbízol valakiben? !3
Milyen helyet mutatnál meg nekem a szülővárosodból?
Mivel tudnál ma örömet szerezni saját magadnak? !2
Mikor szeretsz előre tervezni, és mikor inkább sodródni? !2
Melyik közös témánkról beszélgetnél még sokáig?
Milyen hibádból tanultál valami kedveset magadról? !3
Mit jelent számodra egy figyelmes kérdés? !2
Milyen közös pillanatból szeretnél többet? !2`));
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
 const L=window.PAIR_LINES;
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
 const L=window.PAIR_LINES,P=window.PAIR_PACKS;
 P.radar.push({id:'fire',name:'Tűzpróba · mocskos 18+',adult:true,items:[
 ['A szám inkább…','Én nyalok','Engem nyaljanak',{tags:['oral']}],
 ['A dugás inkább…','Lassan, hogy minden centit érezzek','Keményen, amíg bírjuk'],
 ['Az ágyban…','Én baszlak meg téged','Te baszol meg engem'],
 ['Kedvenc póz…','Kutyapóz','Lovaglás',{tags:['pozicio']}],
 ['Fent vagy lent?','Fent','Lent',{tags:['pozicio']}],
 ['A hangerő…','Fojtott nyögés','Üvöltés, hadd hallják'],
 ['A paskolás…','Pár finom csapás','Amíg ki nem pirul a seggem',{tags:['fajdalom']}],
 ['Hajhúzás dugás közben…','Igen, erősen','Inkább ne',{tags:['fajdalom']}],
 ['Mocskos beszéd…','Szidj mocskosan','Dicsérj mocskosan'],
 ['Kikötözve…','Én legyek','Te legyél',{tags:['kotozes']}],
 ['Hol?','Az ágyban','Konyhapult, mosógép, lépcső, bárhol otthon',{tags:['pozicio']}],
 ['Az előjáték…','Kínozz, amíg könyörgök','Azonnal dugj meg',{tags:['fajdalom','kotozes']}],
 ['Elélvezéskor…','A testemre','A számba',{tags:['oral','testnedv'],body:'penisz'}],
 ['A vibrátor…','Rajtam, amíg remegek','Rajtad, amíg remegsz',{tags:['jatekszer']}],
 ['Szexvideó…','Vegyük fel és nézzük vissza','Csak élőben',{tags:['foto']}],
 ['Egy éjszaka…','Egy hosszú, brutális menet','Ahányszor csak bírjuk',{tags:['fajdalom']}],
 ['Az elélvezés megtagadása…','Kínozz vele, könyörögni akarok','Ne tarts vissza',{tags:['kotozes']}],
 ['A ruhám…','Tépd le','Hagyd rajtam, csak told félre',{tags:['meztelen']}],
 ['A tükör előtt…','Nézni akarom, ahogy dugunk','Csukott szemmel jobb',{tags:['pozicio']}],
 ['Reggel…','Ébressz nyalással','Ébressz egy gyors dugással',{tags:['oral']}],
 ['A fenekem…','Csak paskold','Játssz is vele',{tags:['anal','fajdalom']}],
 ['Utána…','Még egy menet','Hulla vagyok'],
 ['Napközben…','Küldj meztelen képet','Írd meg, mit csinálsz velem este',{tags:['foto','meztelen']}],
 ['Ha könyörgök…','Add meg rögtön','Várass még',{tags:['kotozes']}]
 ]});
 P.truth.push({id:'naughty',name:'Mocskos · 18+',adult:true,truth:L(`Mit csinálnál velem most, ha nem kellene játszanunk? Mondd el mocskosan, részletesen.
Mi a legperverzebb dolog, amit valaha meg akartál csinálni velem?
Pontosan hogyan akarsz ma éjjel elélvezni? #testnedv
Mi indít be jobban: ha nyalnak, vagy ha dugnak? #oral
Melyik pózban a legjobb, amikor dugunk? #pozicio
Mi volt a legmocskosabb szex az életedben? Részleteket kérek. #mult
Mire gondoltál utoljára, amikor magadhoz nyúltál? #erintes
Hányszor nyúltál magadhoz rám gondolva az elmúlt héten? #erintes
Mit mondjak a füledbe, miközben dugunk? Mondd ki szó szerint.
Melyik testrészemet nyalnád a legszívesebben, és meddig bírnád? #oral
Mi a legbetegebb fantáziád, amit még senkinek sem mertél elmondani?
Egy tízes skálán milyen durván bánjak veled? És mit jelent nálad a tízes? #fajdalom
Hová élvezzek a legszívesebben? Mondd ki. #testnedv
Milyen szexvideót vennél fel kettőnkről, és mi lenne a címe? #foto
Melyik pornókategóriát nézed a legtöbbet, amikor egyedül vagy?
Mit csinálnál velem, ha egy éjszakára a játékszered lennék? #kotozes
Mennyire erősen húzhatom a hajad, és hányat paskolhatok a seggedre? #fajdalom
Hol nyaltál vagy dugtál a legnagyobb lebukásveszélyben? #oral #mult
Milyen szexjátékot próbálnál ki rajtam elsőként, és hogyan? #jatekszer
Ha ma éjjel minden kérésedre igent mondanék, mi lenne az első három?
Milyen hangosan akarod hallani, ahogy élvezek? #testnedv
Inkább könyörögnél, hogy megdugjalak, vagy parancsolnál? #kotozes
Mondd ki háromszor egymás után a legmocskosabb szót, ami beindít.
Mit kennél rám, hogy aztán lenyald? #oral`),dare:L(`Súgd a másik fülébe, pontosan hogyan fogod megdugni ma éjjel.
Vedd le a fogaddal a másik alsóneműjét. #meztelen
Nyald végig a másik testét a nyakától a köldöke aláig. #oral
Nyúlj magadhoz a ruhádon keresztül fél percig, miközben a másik néz. #erintes ~30
Lovagolj a másik ölében egy percig, ruhában. #erintes #pozicio ~60
Vetkőzz meztelenre, és maradj így a következő három körben. #meztelen
Nyögd el hangosan, ahogy elélvezel.
Csókold és nyald a másik combjának belső oldalát egy percig. #oral ~60
Mondd el szó szerint, hogyan nyalnád ki vagy szopnád le. #oral
Markold meg a másik seggét, és paskold meg háromszor. #fajdalom
Harapj bele a másik fenekébe. #fajdalom
Küldj a másiknak egy meztelen képet magadról, és nézze meg most rögtön. #foto #meztelen
A másik egy percig bárhol megérinthet, ahol akar, ruha nélkül. #erintes #meztelen ~60
Kösd be a másik szemét, és két percig csak a nyelved érhet hozzá. #kotozes #oral ~120
Helyezkedj el abban a pózban, amiben a legszívesebben dugnál most. #pozicio
Vetkőztessétek le egymást teljesen egy perc alatt. #meztelen ~60
Szívj ki egy foltot a másik mellén vagy combján. #fajdalom
Simogasd egy percig a másik lába közét, ruhán keresztül. #erintes ~60
Nézz a másik szemébe, és mondd: „Most azonnal meg akarlak baszni.”
A következő kört a másik ölében, meztelenül játszod. #meztelen #erintes
Szopd meg lassan a másik ujjait, és közben nézz a szemébe. #oral #erintes
Kenj valamit a másik bőrére, és nyald le róla. #oral
A másik dönti el, mit veszel le, és hogyan mutatod meg magad neki. #meztelen
Kényeztesd a másikat a száddal ott, ahol ő kéri, két teljes percig. #oral ~120`)});
 P.match.push({id:'wishlist',name:'Mocskos kívánságlista · 18+',adult:true,items:L(`69 egészen az elélvezésig #oral #testnedv
Elélvezés az arcomra #testnedv @penisz
Szájba élvezés és lenyelés #oral #testnedv @penisz
Anális szex lassan, sok síkosítóval #anal
Kikötözve, teljesen kiszolgáltatva, stopszóval #kotozes
Fenékpaskolás, amíg ki nem pirul #fajdalom
Hajhúzás dugás közben #fajdalom
Egy éjszaka, amikor az egyikünk a másik szexrabszolgája, stopszóval #kotozes
Szexvideó felvétele és közös visszanézése #foto
Vibrátor, amíg többször el nem élvezek #jatekszer
Közös pornónézés, aztán ugyanazt csináljuk
Önkielégítés egymás előtt, végig szemkontaktussal #erintes
Dugásmaraton reggelig
Gyors dugás a konyhapulton, félig felöltözve #pozicio
Mocskos beszéd és káromkodás az egész idő alatt
Szerepjáték: két idegen, akik egy bárban szedik fel egymást #szerep
Meztelen képek cseréje napközben #foto #meztelen
Popsidugó egész este, aztán anális játék #anal #jatekszer
Dugás a tükör előtt, végig nézve magunkat #pozicio
Elélvezni csak engedéllyel, könyörgésig húzva #kotozes
Fenekelés kézzel vagy lapáttal #fajdalom
Ébresztés úgy, hogy már nyalnak #oral
Kézbilincs és szemkötő egyszerre #kotozes
Szerepcsere strap-onnal #anal #jatekszer #szerep`)});
 P.honest.push({id:'frank',name:'Szex, kertelés nélkül · 18+',adult:true,items:L(`Mit csinálok rosszul, amikor a számmal kényeztetlek? Mondd meg őszintén. #oral
Valójában mennyire durván szereted a szexet, és mit nem mertél még kérni? #fajdalom
Milyen gyakran nyúlsz magadhoz, mivel, és mire gondolsz közben? #erintes
Mi a legjobb érzés neked dugás közben, pontosan hol és hogyan?
Melyik pózban érzed a legmélyebben, és miért kéred ritkán? #pozicio
Mennyire izgat az anál, és melyik oldalon? #anal
Hová szeretnéd, hogy élvezzek, és mi az, ami kiábrándít? #testnedv
Milyen mocskos szavakat akarsz hallani dugás közben? Mondd ki őket.
Gondoltál már hármasra, vagy arra, hogy valaki néz minket? Mennyire komolyan? #harmadik
Milyen pornót nézel, és melyik jelenetet csinálnád meg velem?
Mit csinált egy korábbi partnered jobban az ágyban, mint én? #mult
Megjátszottad már, hogy elélvezel? Velem is?
Hol a legérzékenyebb a tested ott, ahol még nem nyaltalak elég sokáig? #oral
Szereted, ha leszorítalak, lefoglak és nem engedlek? #kotozes
Mit csinálnál velem, ha egy egész estére a szexrabszolgád lennék? #kotozes
Milyen szexjátékot rendelnénk ma este, ha holnapra kihoznák? #jatekszer
Mikor indultál be tőlem a legjobban, és mit éreztél a testedben?
Mitől lohad le a kedved dugás közben?
Csinálnánk pornót magunkról? Mi kerülne bele, és hogyan vigyáznánk rá? #foto
Meddig kell kényeztetnem, hogy könyörögj? #kotozes
Milyen szavakat szeretsz a nemi szervedre, és melyiket utálod?
Hányszor dugnál egy héten, ha semmi sem akadályozna?
Mit csináljak veled gátlástalanabbul?
Mi az a határ, amit akkor sem akarsz átlépni, ha nagyon be vagy indulva?`)});
})();

/* Mocskos 18+ csomagok bővítése: durvább, szélsőségesebb kártyák. Minden passzolható, a stopszó mindig érvényes. */
(() => {
 const L=window.PAIR_LINES,P=window.PAIR_PACKS,pack=(game,id)=>P[game].find(p=>p.id===id);
 pack('radar','fire').items.push(
 ['Kötözésnél inkább…','Kéz a hátam mögött','Kéz az ágy támlájához',{tags:['kotozes']}],
 ['A szemkötő alatt inkább…','Csókokat várnék','Harapásokat várnék',{tags:['kotozes','fajdalom']}],
 ['Paskoláskor…','Én számolom hangosan','Te számolod helyettem',{tags:['fajdalom']}],
 ['Az irányításnál inkább…','Parancsokat adnék','Parancsokat követnék',{tags:['kotozes']}],
 ['Egy éjszakára inkább…','A szexrabszolgád lennék','A gazdád lennék',{tags:['kotozes']}],
 ['Elélvezés előtt…','Én könyörögjek érte','Te könyörögj érte',{tags:['kotozes']}],
 ['Az anál…','Lassan, ujjal kezdve','Játékszerrel kezdve',{tags:['anal','jatekszer']}],
 ['Elélvezéskor inkább…','A számba','A testemre',{tags:['oral','testnedv'],body:'penisz'}],
 ['Dugás közben…','Fogd le a csuklóm','Markold a fenekem',{tags:['kotozes','erintes']}],
 ['A mocskos szavak közül…','Hívj a mocskos kis játékszerednek','Mondd, hogy csak a tiéd vagyok',{tags:['kotozes']}],
 ['Egy játékszer…','Távirányítós vibrátor','Popsidugó',{tags:['anal','jatekszer']}],
 ['Videóra vennél minket…','Csak a testünket','Mindent, az arcunkat is',{tags:['foto']}],
 ['Az elélvezések…','Egy, de robbanó','Sorozatban, amíg bírom',{tags:['testnedv']}],
 ['Dugás után…','Azonnal még egy','Lassú kényeztetés'],
 ['Szerepjátékban inkább…','Főnök és beosztott','Idegenek egy szállodában',{tags:['szerep']}],
 ['Kikötve…','Csak kényeztess','Kínozz az elélvezésig',{tags:['kotozes','fajdalom']}],
 ['Tükör előtt dugva…','Én nézem, ahogy dugsz','Te nézed, ahogy élvezek',{tags:['pozicio']}],
 ['Lefogva lenni…','Imádnám','Nem nekem való',{tags:['kotozes']}],
 ['Az alsóneműm…','Tépd le rólam','Hagyd rajtam végig',{tags:['meztelen']}],
 ['Egy durva éjszaka után…','Nyomok a bőrömön','Semmi nyom',{tags:['fajdalom']}],
 ['Előjáték helyett…','Falhoz nyomva','Ágyra dobva',{tags:['pozicio']}],
 ['Mocskos beszéd közben…','Mondd el, mit csinálsz velem','Mondasd ki velem, mit akarok'],
 ['A szex hangja…','Csattanások','Nyögések'],
 ['Ha két óránk lenne…','Egy órás előjáték','Két óra dugás']
 );
 const naughty=pack('truth','naughty');
 naughty.truth.push(...L(`Mi a legdurvább, amit valaha kipróbáltál az ágyban, és megcsinálnád velem is? #fajdalom #mult
Milyen nyomot hagynál szívesen a testemen? #fajdalom
Minek hívjalak dugás közben?
Hányszor tudnál egymás után elélvezni, ha nem állnék le? #testnedv
Mit csinálnál velem, ha kikötnélek, és két órád lenne? #kotozes
Hogyan büntetnél meg az ágyban, ha rossz voltam? #kotozes #fajdalom
Melyik testrészemet kötnéd ki vagy fognád le a legszívesebben? #kotozes
Mi az a mocskos dolog, amit szégyellsz, hogy beindít?
Mennyire izgatna, ha egy egész estére megtagadnám tőled az elélvezést? #kotozes
Melyik játékszert használnád rajtam először, és hol? #jatekszer
Mi a legperverzebb dolog, amit valaha velem csináltál?
Mit akarsz, hogy könyörögjek, mielőtt megkapom? #kotozes
Milyen szerepjátékba mennél bele velem, amibe senki mással nem? #szerep
Hol nem dugtunk még a lakásban, pedig kellene? #pozicio
Hogyan ébresszelek fel holnap reggel?
Melyik pornójelenet jut eszedbe rólunk?
Mennyire szereted, ha karmolás, harapás vagy szívásnyom marad rajtad? #fajdalom
Mit éreznél, ha végignéznéd, ahogy magamhoz nyúlok? #erintes
Mit csinálnál velem, ha egy estére a szexrabszolgád lennék? #kotozes
Mi a legmocskosabb üzenet, amit munka közben szívesen kapnál tőlem?
Halkan vagy üvöltve akarod hallani, ahogy elélvezek? #testnedv
Ha egy napig parancsolhatnál nekem, mi lenne az első utasításod? #kotozes
Mikor akartál a legjobban, de nem mutattad?
Milyen mocskos szót kiáltanál, amikor elélvezel? #testnedv`));
 naughty.dare.push(...L(`Kösd hátra a másik kezét egy sállal a következő kör végéig. #kotozes
Paskold meg ötször a másik fenekét. Ő számolja hangosan. #fajdalom
Fogd le a másik csuklóját, és csókold, amíg ő nem szól, hogy elég. #kotozes #erintes
Vedd a szádba a másik ujjait, és mutasd meg, hogyan szopnál. #oral
Nyald végig a másik combjának belső oldalát az alsóneműje széléig. #oral
Térdelj le a másik elé, és várd az első utasítását. #kotozes
Mondd el részletesen, hogyan dugnál vele a konyhapulton. #pozicio
Vetkőztesd le a másikat teljesen, te pedig maradj felöltözve a következő körig. #meztelen
Harapd meg gyengéden a másik nyakát, és hagyj rajta kis nyomot, ha engedi. #fajdalom
Nyúlj magadhoz meztelenül egy percig, miközben a másik szemébe nézel. #meztelen #erintes ~60
Tedd a másik kezét oda, ahol most a legjobban vágysz rá. #erintes
Ülj a másik arcára fél percig, ha ő is akarja. #oral ~30
Szívd a másik mellbimbóját fél percig. #oral ~30
Dörzsöld magad egy percig a másik combjához, mint aki nem bír magával. #erintes ~60
Adj a másiknak három parancsot, amit a következő percben teljesítenie kell. #kotozes
Kösd be a másik szemét, és érintsd meg valamivel, amit ki kell találnia. #kotozes
Húzz végig egy jégkockát a másik testén. #fajdalom
Fektesd hasra a másikat, és csókold végig a gerincét a fenekéig. #erintes
Mondd ki kertelés nélkül, mit csináljon veled a másik ma éjjel.
Nyald meg a másik fülét, és súgd bele a kedvenc mocskos szavadat. #oral
A másik kiválaszt egy testrészedet, és két percig úgy kényezteti, ahogy akarja. #erintes ~120
Hajolj előre, és hagyd, hogy a másik nézzen, ameddig akar. #meztelen
Csókold meg a másikat a lába között, a ruhán keresztül. #oral #erintes
Kényeztessétek egymást egyszerre a kezetekkel egy percig. #erintes ~60`));
 pack('match','wishlist').items.push(...L(`Kikötés az ágyhoz széttárt kézzel-lábbal, stopszóval #kotozes
Szemkötő és fülhallgató egyszerre, teljes kiszolgáltatottság #kotozes
Egy egész nap, amikor az egyikünk a másik szexrabszolgája #kotozes
Elélvezés tiltása napokig, aztán egy robbanó este #kotozes
Távirányítós vibrátor egy otthoni este alatt #jatekszer
Játékszer és kéz egyszerre #jatekszer
Fenekelés, amíg nyomot nem hagy #fajdalom
Harapás-, karmolás- és szívásnyomok #fajdalom
Arcra ülés #oral
Mély torok lassan, szünetekkel #oral
Anális szex dildóval vagy strap-onnal #anal #jatekszer
Elélvezés egymás után, amíg bírom
Dugás egy előre megírt, durva forgatókönyv szerint #szerep #fajdalom
Megalázó mocskos beszéd, előre megbeszélt határokkal #kotozes
Nyakörv és póráz otthon #kotozes
Popsidugó egész nap, este anál #anal #jatekszer
Szexvideó egy egész éjszakáról #foto
Fantáziálás egy hármasról, csak szavakban #harmadik
Kézbilincs és szemkötő a zuhany alatt #kotozes
Jégkocka és masszázsgyertya felváltva #fajdalom
Ágyhoz kötve dugni, elélvezés-tiltással #kotozes
Dugás a nappali padlóján #pozicio
Egymás arcára élvezni #testnedv @penisz
Kutyapóz hajhúzással #fajdalom #pozicio`));
 pack('honest','frank').items.push(...L(`Milyen durvaságot élveznél, amit még soha nem mertél kérni? #fajdalom
Mennyire izgat, ha megaláznak az ágyban, és hol a határ? #kotozes
Van „elvevős” fantáziád? Milyen határokkal és stopszóval beszélnénk róla biztonságosan? #kotozes
Mit jelentene neked, ha egy estére teljesen átadnád az irányítást? #kotozes
Mit jelentene neked, ha egy estére teljesen te irányítanál? #kotozes
Melyik a legdurvább pornó, amit izgatónak találtál?
Mennyire fontosak neked a nyomok szex után, és hol látszódhatnak? #fajdalom
Mit gondolsz a mély torokról? #oral
Mennyire izgat, ha a testnedveinkről beszélünk szex közben? #testnedv
Van olyan fantáziád, amit undorítónak tartasz, mégis beindít?
Milyen stopszót választanál, és mit tegyek, ha kimondod?
Mennyire érdekel a nyakörv, a póráz, a gazda és szolga játék? #kotozes
Mi segítene, hogy hangosabb legyél szex közben?
Melyik testrészedet szégyelled, mégis szeretnéd, ha többet foglalkoznék vele?
A hármas gondolata valódi vágy nálad, vagy csak fantázia? #harmadik
Hányszor élveztél el a legtöbbször egy nap alatt?
Milyen gyakran gondolsz napközben arra, hogy velem szexelsz?
Mit gondolsz a fenékjátékokról nálad és nálam? #anal
Melyik szexjáték van a kívánságlistádon, amit még nem mertél megvenni? #jatekszer
Mire van szükséged egy durva este után: ölelésre, csendre, beszélgetésre?
Mennyire szereted, ha könyörgök neked? #kotozes
Volt, hogy túl messzire mentem? Mit csináljak másképp?
Mit tennénk, ha egy fantáziád megvalósulna, és mégsem tetszene?
Hogyan beszéljünk a határainkról úgy, hogy közben ne lohadjon le a kedvünk?`));
})();

/* Pajzán pörgető: cselekvés, testrész és időtartam. A parts[].acts az engedélyezett párokat sorolja fel. */
window.PAIR_SPIN={
 acts:[
 {id:'kiss',t:'Csókolgasd a másik',tags:['erintes']},
 {id:'lick',t:'Nyalogasd a másik',tags:['oral']},
 {id:'stroke',t:'Simogasd a másik',tags:['erintes']},
 {id:'bite',t:'Harapdáld gyengéden a másik',tags:['fajdalom']},
 {id:'suck',t:'Szívogasd a másik',tags:['oral']},
 {id:'massage',t:'Masszírozd a másik',tags:['erintes']}
 ],
 parts:[
 {t:'nyakát',acts:['kiss','lick','stroke','bite','suck']},
 {t:'fülcimpáját',acts:['kiss','lick','bite','suck']},
 {t:'vállát',acts:['kiss','bite','massage']},
 {t:'hátát',acts:['kiss','lick','stroke','massage']},
 {t:'hasát',acts:['kiss','lick','stroke']},
 {t:'mellbimbóit',acts:['kiss','lick','stroke','bite','suck'],tags:['meztelen']},
 {t:'ujjait',acts:['kiss','lick','suck']},
 {t:'combja belső oldalát',acts:['kiss','lick','stroke','bite','massage']},
 {t:'fenekét',acts:['kiss','stroke','bite','massage'],tags:['meztelen']},
 {t:'lába közét',acts:['kiss','lick','stroke','massage'],tags:['meztelen']}
 ],
 secs:[10,20,30,60]
};

/* Szerepjáték-forgatókönyvek (18+): két felnőtt, egyenrangú szerep, otthoni vagy zárt helyszín. A stopszó mindig érvényes. */
window.PAIR_SCENES=[
 {t:'Idegenek a bárban',detail:['Szerepek: aki először szólít meg · aki nehezen kapható','Helyszín: egy szállodai bár, aztán a szoba','Kezdőmondat: „Erre a helyre egyedül szoktál járni?”','Félidőben: kiderül, hogy ugyanazon az emeleten laktok.'],tags:['szerep']},
 {t:'Masszőr és vendég',detail:['Szerepek: a masszőr · a vendég, aki többet szeretne','Helyszín: félhomályos szoba, olaj, halk zene','Kezdőmondat: „Szóljon, ha valahol erősebben kell.”','Félidőben: a vendég megfordul, és ő kér valamit.'],tags:['szerep','erintes']},
 {t:'Főnök és új asszisztens',detail:['Szerepek: a szigorú főnök · az új asszisztens','Helyszín: iroda túlóra után','Kezdőmondat: „Ezt a jelentést még ma kérem.”','Félidőben: az asszisztens veszi át az irányítást.'],tags:['szerep','kotozes']},
 {t:'Fotós és modell',detail:['Szerepek: a fotós · a modell','Helyszín: otthoni műterem, egy lámpa','Kezdőmondat: „Lazíts, és csak engem nézz.”','Félidőben: a modell kéri, hogy a fotós is vetkőzzön.'],tags:['szerep','meztelen']},
 {t:'Szobaszerviz',detail:['Szerepek: a vendég · aki felhozza a rendelést','Helyszín: szállodai szoba, köntösben','Kezdőmondat: „Rendelt valamit, vagy csak engem várt?”','Félidőben: a vendég megkéri, hogy maradjon még.'],tags:['szerep']},
 {t:'Régi szerelmek',detail:['Szerepek: aki évek után felismeri · aki úgy tesz, mintha nem emlékezne','Helyszín: egy esküvő után a hotelszobában','Kezdőmondat: „Te mindig is így néztél rám?”','Félidőben: egyikőtök bevallja, hogy mindig is akarta.'],tags:['szerep']},
 {t:'A hívott szerelő',detail:['Szerepek: aki szerelőt hívott · a szerelő','Helyszín: konyha, csöpögő csap','Kezdőmondat: „Hol szivárog pontosan?”','Félidőben: kiderül, hogy semmi sem romlott el.'],tags:['szerep']},
 {t:'Gazda és szolga',detail:['Szerepek: aki parancsol · aki engedelmeskedik','Helyszín: hálószoba, előre megbeszélt stopszóval','Kezdőmondat: „Térdelj le, és várd az utasításomat.”','Félidőben: szerepcsere.'],tags:['szerep','kotozes']},
 {t:'Privát tánc',detail:['Szerepek: a táncos · a vendég, akinek nem szabad hozzáérnie','Helyszín: nappali, egy szék és tompa fény','Kezdőmondat: „A szabály egyszerű: csak nézhetsz.”','Félidőben: a táncos megszegi a saját szabályát.'],tags:['szerep','meztelen']},
 {t:'Edző és ügyfél',detail:['Szerepek: a személyi edző · az ügyfél','Helyszín: nappali, edzés után','Kezdőmondat: „Még tíz ismétlés, aztán jön a jutalom.”','Félidőben: a jutalom egészen más, mint amire számít.'],tags:['szerep']},
 {t:'Kihallgatás',detail:['Szerepek: a kém · aki kihallgatja','Helyszín: elsötétített szoba, egy szék','Kezdőmondat: „Mindent elmondasz, vagy kitaláljam, hogyan szedjem ki belőled?”','Félidőben: a kém csábítással fordít a helyzeten.'],tags:['szerep','kotozes']},
 {t:'Első randi, újra',detail:['Szerepek: aki randira hív · aki először ideges','Helyszín: otthon, gyertyafény, két pohár','Kezdőmondat: „Szóval… gyakran randizol idegenekkel?”','Félidőben: egyikőtök sokkal merészebben kezdeményez.'],tags:['szerep']}
];

/* Alkalmi csomagok a Közelebb hozzád játékhoz. */
(() => {
 const L=window.PAIR_LINES,P=window.PAIR_PACKS;
 P.closer=[
 {id:'valentin',name:'Valentin-nap',adult:false,items:L(`Mikor érezted először, hogy szerelmes vagy belém?
Melyik apró szokásomat szereted a legjobban?
Milyen ajándéknak örülnél jobban egy tárgynál?
Melyik közös dalunk jut eszedbe, ha rám gondolsz?
Milyen romantikus gesztust szeretnél, ha gyakrabban kapnál tőlem?
Mi az, amit még sosem mondtál ki arról, mit jelentek neked?
Melyik randinkra emlékszel a legszívesebben?
Mitől érzed magad igazán szeretve egy átlagos kedden?
Milyen szerelmes levelet írnál nekem egy mondatban?
Mi az a pillanat, amikor a legközelebb éreztél magadhoz?
Milyen közös hagyományt kezdenénk el minden Valentin-napon?
Mit kívánnál kettőnknek a következő Valentin-napig?`)},
 {id:'evfordulo',name:'Évforduló',adult:false,items:L(`Mire vagy a legbüszkébb kettőnkben?
Melyik nehéz időszakunkból tanultunk a legtöbbet?
Mi változott bennem, amióta együtt vagyunk?
Melyik közös döntésünkért vagy a leghálásabb?
Mit csinálunk jobban most, mint az elején?
Melyik napunkat élnéd át újra pontosan ugyanígy?
Miben szeretnél még együtt fejlődni velem?
Mi az, amit sosem szeretnél elveszíteni belőlünk?
Milyen ígéretet tennél a következő évre?
Mikor nevettünk a legnagyobbat együtt?
Milyen szokásunk lett a kedvenced?
Hol leszünk szerinted öt év múlva egy ilyen estén?`)},
 {id:'nyaralas',name:'Nyaralás',adult:false,items:L(`Melyik pillanatot vinnéd haza ebből az utazásból?
Mi lepett meg a legjobban ezen a helyen?
Milyen helyi ételt kóstolnál meg még velem?
Mitől érzed magad igazán kikapcsolva?
Melyik közös utunkkal vetnéd össze ezt?
Mi az, amit itthon is megtartanál ebből a ritmusból?
Hova utaznánk legközelebb, ha holnap indulhatnánk?
Mi volt a legviccesebb eltévedésünk?
Melyik napszakot szereted itt a legjobban?
Milyen képeslapot írnál magadnak erről a napról?
Mit csinálnál, ha még egy szabad napunk lenne itt?
Mi volt az a pillanat, amikor csak ültünk, és tökéletes volt?`)},
 {id:'elsorandi',name:'Első randi',adult:false,items:L(`Mivel töltöd a legszívesebben egy szabad vasárnapot?
Mi az, ami mindig megnevettet?
Milyen helyre vinnél el egy második randin?
Melyik képességedre vagy a legbüszkébb?
Mi volt az utóbbi idők legjobb döntése?
Milyen zenét hallgatsz, amikor senki sem látja?
Melyik utazásod változtatott meg valamit benned?
Mi az a kis dolog, amitől jó lesz egy napod?
Mit csinálnál, ha egy évig nem kellene dolgoznod?
Milyen kérdést szeretsz, ha feltesznek neked?
Mi volt az első benyomásod ma rólam?
Mit szeretnél még megtudni rólam ma este?`)}
 ];
})();

/* Mocskos csomagok második bővítése: csomagonként +24, a meglévő határokon belül. */
(() => {
 const L=window.PAIR_LINES,P=window.PAIR_PACKS,pack=(game,id)=>P[game].find(p=>p.id===id);
 pack('radar','fire').items.push(
 ['A szemkötő…','Rajtam legyen','Rajtad legyen',{tags:['kotozes']}],
 ['Egy menet inkább…','A kanapén','Az ágyon',{tags:['pozicio']}],
 ['Egy egész este inkább…','Csak kezek','Csak szájak',{tags:['oral','erintes']}],
 ['Dugás közben inkább…','Szemkontaktus','Csukott szem'],
 ['A fenekelés…','Kézzel','Valamivel',{tags:['fajdalom']}],
 ['Amikor már könyörgök…','Kínozz még','Add meg azonnal',{tags:['kotozes']}],
 ['A nyakam…','Csókold','Harapd',{tags:['fajdalom']}],
 ['A kezem dugás közben…','Fogd le','Hagyd szabadon',{tags:['kotozes']}],
 ['Ha valaki hallana minket…','Izgatna','Zavarna'],
 ['Az előjátékban inkább…','Nyalj','Ujjazz',{tags:['oral','erintes']}],
 ['Ma este inkább…','Lassú szeretkezés tükör előtt','Gyors menet a konyhában',{tags:['pozicio']}],
 ['Egy nap inkább…','Popsidugóval munkába','Vibrátorral otthon',{tags:['anal','jatekszer']}],
 ['Az elélvezés után…','Folytasd, amíg bírom','Állj meg rögtön',{tags:['testnedv']}],
 ['Mocskos üzenetben…','Kép','Hangüzenet',{tags:['foto']}],
 ['Az irányítás…','Egész este nálad','Felváltva',{tags:['kotozes']}],
 ['Ha egy szót kiáltok…','A neved','Hogy ne hagyd abba'],
 ['A testemen nyom…','Csak ahol ruha takarja','Bárhol',{tags:['fajdalom']}],
 ['A szerepjáték…','Bárban felszedve','Szállodában rendelve',{tags:['szerep']}],
 ['Vetkőzésnél inkább…','Én vetkőzzek előtted','Te vetkőzz előttem',{tags:['meztelen']}],
 ['A szádba vagy a kezembe…','Szádba','Kezembe',{tags:['oral','testnedv']}],
 ['Ha végeztünk…','Közös zuhany','Ott maradunk izzadtan'],
 ['Egy kívánság estére…','Kikötve kényeztess','Kikötve dugj meg',{tags:['kotozes']}],
 ['A szomszédok…','Hallják meg','Ne halljanak semmit'],
 ['Inkább lennék…','A játékszered','A gazdád',{tags:['kotozes']}]
 );
 const naughty=pack('truth','naughty');
 naughty.truth.push(...L(`Mi az a mocskos mondat, amit sosem mertél kimondani nekem? #kotozes
Melyik ruhámat tépnéd le rólam a legszívesebben? #meztelen
Hányszor gondoltál ma a testemre?
Mi az a hely, ahol a legszívesebben elélveznél rajtam? #testnedv
Mit csinálnál velem, ha tudnád, hogy semmire sem mondok nemet?
Melyik hangomtól indulsz be a legjobban?
Melyik pózban néznél a legszívesebben a szemembe? #pozicio
Mit akarsz, hogy holnap egész nap rád gondolva csináljak?
Milyen játékszert vennél nekem titokban? #jatekszer
Mi a legperverzebb gondolatod rólam, amit ma este volt?
Mennyire izgatna, ha egy egész estére kikötnélek? #kotozes
Mit szeretnél, hogy a fülembe súgj, mielőtt elélvezek? #testnedv
Mit csinálnál, ha most azonnal a szádba vehetnél? #oral
Melyik testrészemet paskolnád a legszívesebben? #fajdalom
Milyen szót mondjak, amitől azonnal elveszted a fejed?
Hogyan akarsz ma éjjel felébredni mellettem?
Melyik fantáziádban vagyok a legmocskosabb?
Mit csinálnál velem a tükör előtt? #pozicio
Hogyan bánnál velem, ha egy éjjelre csak a tiéd lennék? #kotozes
Mit akarsz, hogy szégyenkezés nélkül kérjek tőled?
Melyik volt a legjobb orgazmusod velem, és mitől? #testnedv
Mit csinálnál velem egy hétvégén, ha ki sem kellene kelnünk az ágyból?
Melyik mocskos szóra kapod fel a fejed, ha meghallod?
Mi lenne az első, amit megcsinálnál, ha most kikötnél? #kotozes`));
 naughty.dare.push(...L(`Vedd le a másik ingét vagy felsőjét lassan, csókolva minden szabaddá váló részt. #meztelen #erintes
Nyald végig a másik fülét, és súgd meg, hányszor akarod ma éjjel. #oral
Ülj a másik ölébe meztelenül egy percig, mozdulatlanul. ~60 #meztelen #erintes
Paskold meg a másik fenekét tízszer, ő számol. #fajdalom
Szívd a másik nyakát, amíg ő meg nem kér, hogy hagyd abba. #fajdalom
Kösd össze a másik csuklóját, és csókold végig a karját. #kotozes #erintes
Mondd el a másik fülébe, pontosan hova akarsz elélvezni. #testnedv
Nyúlj a másik lába közé a ruháján keresztül egy percig. ~60 #erintes
Vetkőztesd le a másikat a fogaddal, ameddig tudod. #meztelen
Térdepelj a másik elé, és kérd meg szépen arra, amit most akarsz. #kotozes
Nyald végig a másik hasát, és állj meg ott, ahol ő mondja. #oral
Csókold a másik belső combját két percig, feljebb nem mehetsz. ~120 #oral #erintes
Mutasd meg a másiknak, hogyan nyúlsz magadhoz, ha egyedül vagy. ~60 #erintes #meztelen
Engedd, hogy a másik egy percig csak a fogával érjen hozzád. ~60 #fajdalom
Fogd le a másik kezét a feje fölött, és csókold egy percig. ~60 #kotozes
Mondd el lassan, mit csinálsz vele, miközben a szemébe nézel.
Csókold végig a másik gerincét, és harapj a fenekébe. #fajdalom #erintes
A másik egy szót mondhat, és azt kell csinálnod vele egy percig. ~60 #kotozes
Dörzsöld a másik mellbimbóját két ujjal fél percig. ~30 #erintes
Nyald le a másik ujjairól, amit a másik választ. #oral
Feküdj hanyatt, és hagyd, hogy a másik bármit csináljon veled egy percig. ~60 #kotozes
Kényeztesd a másikat a nyelveddel ott, ahol ő mutatja, egy percig. ~60 #oral
Súgd el, mi lesz a büntetése, ha passzol. #kotozes
Kérd meg a másikat, hogy fenekeljen meg, és köszönd meg minden csapását. #fajdalom #kotozes`));
 pack('match','wishlist').items.push(...L(`Egy este alsónemű nélkül, csak ketten otthon #meztelen
Ujjazás, amíg könyörgök #erintes
Orális kényeztetés a konyhapulton #oral #pozicio
Egymás kikötése felváltva #kotozes
Dugás a zuhany alatt, hátulról #pozicio
Pajzán hangüzenetek napközben
Kényeztetés vibrátorral, miközben a másik néz #jatekszer
Csak kezekkel elélvezni, egymás szemébe nézve #erintes #testnedv
Egy egész este csak engedelmeskedem #kotozes
Popsidugó egy közös vacsorán otthon #anal #jatekszer
Dugás, amíg a másik telefonál #pozicio
Elélvezés a mellemre vagy a hasamra #testnedv
Egy hétvége, amikor ki sem kelünk az ágyból
Szemkötővel kitalálni, mi ér hozzám #kotozes
Dugás közben a tükörben nézni egymást #pozicio
Masszázsolajjal végig, aztán dugás #erintes
Szexi fotósorozat egy fehérneműben #foto #meztelen
Kéz a számon, amíg csendben kell maradnom #kotozes
Fenékjáték nyelvvel #anal #oral
Egymás kényeztetése egyszerre, versenyre #erintes
Dugás az íróasztalon #pozicio
Hajnali gyors menet ébresztő helyett
Elélvezés-tiltás egész este, aztán háromszor egymás után #kotozes #testnedv
Lassú szeretkezés gyertyafényben, utána durva menet #fajdalom`));
 pack('honest','frank').items.push(...L(`Melyik testrészedet érinted magadnál a legszívesebben? #erintes
Mi az, amit egy durva menet után hallani szeretnél tőlem?
Hogyan érzed magad, ha egy este csak én élvezek el?
Mennyire fontos neked, hogy egyszerre élvezzünk el?
Mi az a pornós jelenet, ami nem tetszik, pedig sokan szeretik?
Melyik szexuális emléked hoz még mindig zavarba? #mult
Milyen szavakkal kérnéd, hogy durvább legyek? #fajdalom
Mennyire izgat, ha engedelmeskednem kell neked? #kotozes
Milyen gyakran szeretnél kezdeményezni, és mi tart vissza?
Mit szeretnél, ha szex közben többet beszélnék?
Mit gondolsz a szexről menstruáció alatt?
Melyik napszakban vagy a legjobban beindulva, és miért?
Mennyire érdekel, hogy felvegyük magunkat? Mit néznél vissza? #foto
Milyen határt lépnél át szívesen velem, amit eddig senkivel?
Mi az, amit a testedről szeretnél, hogy jobban értsek?
Hogyan vehetném észre, ha valami nem tetszik, de nem mondod?
Melyik a kedvenc pózod, és melyiket utálod titokban? #pozicio
Mennyire izgat a szex olyan helyen a lakásban, ahol még nem csináltuk?
Mi segítene, hogy kevesebbet gondolkodj szex közben?
Melyik szexjátékot próbálnád ki, de félsz tőle? #jatekszer
Mi volt az a pillanat, amikor a legjobban kívántál?
Mennyire fontos neked az utójáték?
Hogyan beszéljünk arról, ha valamelyikünk többet szeretne?
Mit szeretnél, hogy egy év múlva többet csináljunk az ágyban?`));
})();

/* Póz- és helyszínkocka: póz, hely a lakásban (zárt, nem nyilvános), időtartam. */
window.PAIR_DICE={
 poses:[{t:'Misszionárius',tags:['pozicio']},{t:'Lovaglás',tags:['pozicio']},{t:'Fordított lovaglás',tags:['pozicio']},{t:'Kutyapóz',tags:['pozicio']},{t:'Kanál',tags:['pozicio']},{t:'Ölbe ülve, szemben',tags:['pozicio']},{t:'Állva, a falnak dőlve',tags:['pozicio']},{t:'Az asztal szélén',tags:['pozicio']},{t:'Oldalt fekve, szemben',tags:['pozicio']},{t:'Térdelve, hátulról',tags:['pozicio']},{t:'Lótusz',tags:['pozicio']},{t:'69',tags:['pozicio','oral']}],
 places:[{t:'az ágyon'},{t:'a kanapén'},{t:'a konyhapulton'},{t:'a zuhany alatt'},{t:'a nappali szőnyegén'},{t:'egy fotelben'},{t:'az íróasztalon'},{t:'a tükör előtt'},{t:'az előszobában'},{t:'behúzott függöny mögött, az ablaknál'}],
 secs:[60,120,180,300]
};

/* Tabuk nélkül (Szexről őszintén, 18+): nyers, provokatív kérdések. Kérdések, nem felszólítások; minden passzolható. */
(() => {
 const L=window.PAIR_LINES;
 window.PAIR_PACKS.honest.push({id:'taboo',name:'Tabuk nélkül · 18+',adult:true,items:L(`Gondoltál már valaki másra, miközben velem basztál? Kire? #harmadik
Melyik közös ismerősünket basznád meg a legszívesebben, csak fantáziában? #harmadik
Mi a legmocskosabb fantáziád, amit sosem csinálnál meg, de elmesélnéd?
Ha egy éjszakára büntetlenül megdughatnál valaki mást, ki lenne az? #harmadik
Izgatna, ha végignéznéd, ahogy valaki más nyal engem? #harmadik #oral
Izgatna, ha én nézném végig, ahogy valaki más dug téged? #harmadik
Mit csináltál egy volt partnereddel az ágyban, amit sosem mernél elmondani nekem? #mult
Ki dugott a legjobban előttem, és mit csinált jobban? #mult
Hasonlítottad már a farkamat vagy a puncimat valaki máséhoz? #mult
Izgatna, ha egy szerepjátékban fizetnék a baszásért? #szerep
Melyik pornókategóriára nyúlsz magadhoz, amit a legjobban szégyellsz?
Milyen pornót töröltél gyorsan az előzményekből, miután elélveztél rá? #testnedv
Mi a legbetegebb dolog, amitől valaha begerjedtél?
Szeretnéd, ha valaki végignézné, ahogy megbaszlak? #harmadik
Mennyire izgat, ha a szomszédok hallják, ahogy üvöltesz alattam?
Hagynád, hogy lefotózzalak, miközben benned vagyok vagy rajtad vagyok? #foto
Néznéd velem hetente, ahogy a saját videónkon baszunk? #foto
Mi a legmegalázóbb dolog, amit velem csinálnál, ha hagynám? #kotozes
Mi a legmegalázóbb, amit tőlem elviselnél, sőt élveznél? #kotozes
Mennyire üssek, csípjek, harapjak, mielőtt már nem élvezed? #fajdalom
Lennél egy estére a kis ribancom, szabályokkal és stopszóval? #kotozes
Melyik testnedvemet szereted a legjobban a szádban vagy a bőrödön? #testnedv
Mindig lenyelnéd a gecimet, vagy csak ha kérem? #oral #testnedv @penisz
Mennyire akarsz seggbe dugni, és mennyire akarod, hogy én dugjalak oda? #anal
Nyalnád a seggemet, vagy azt akarod, hogy én nyaljam a tiédet? #anal #oral
Hagynád, hogy egész nap távirányítós vibrátorral kínozzalak itthon? #jatekszer
Mit szólnál, ha egy este másik párral cserélnénk, csak fantáziában? #harmadik
Ha bárkit megdughatnánk egymás mellett, mi lenne az első szabályod? #harmadik
Felizgatna vagy féltékennyé tenne, ha másra gondolnék, miközben nyalsz? #harmadik #oral
Melyik fantáziádtól esne le az állam?
Mi a legerkölcstelenebb, amire valaha magadhoz nyúltál?
Melyik ruhámban akarsz rögtön megdugni? #meztelen
Hol nyúltál magadhoz a legfurcsább helyen? #erintes
Akarod, hogy egy harmadik ember is ujjazzon vagy nyaljon, amíg baszunk? #harmadik
Mi a legmocskosabb mondat, amit valaki valaha a füledbe nyögött? #mult
Dugtál már valakivel, akinek még a nevét sem tudtad? #mult
Hol buktál le majdnem dugás közben? #mult
Melyik barátomat dugnád meg, ha szabad lenne? #harmadik
Elcsábítsalak egy szerepjátékban idegenként, mintha először látnál? #szerep
Melyik izgat jobban: ha fizetnek a kényeztetésedért, vagy ha te fizetsz érte? #szerep
Mennyire izgat, ha baszás közben ribancnak vagy kurvának hívlak? #kotozes
Milyen fétisedtől pirulnál el, ha most hangosan kimondanád?
Nyalnád a lábamat, vagy azt szeretnéd, hogy én nyaljam a tiédet?
Izgatna, ha egy estére a másik nem ruháiban dugnál meg? #szerep
Izgatna, ha egy idegen kamerán nézné, ahogy vetkőzöl és magadhoz nyúlsz? #harmadik #foto
Szexeltél már videóhívásban valakivel? Kivel és hogyan? #foto #mult
Küldtél már meztelen képet valakinek, akinek nem kellett volna? #foto #mult
Mit hallgattál el a szexuális múltadról nekem? #mult
Hány emberrel basztál valójában? #mult
Kivel dugtál a legrövidebb ismeretség után? #mult
Szerinted mire gondolok, amikor egyedül nyúlok magamhoz?
Megnéznéd velem a kedvenc pornódat, és közben megmutatnád, mire indulsz be?
Mit nem kérnél tőlem soha az ágyban, mert félsz, hogy elítéllek?
Mi a legmocskosabb üzenet, amit valaha kaptál vagy küldtél? #mult
Melyik perverz fantáziádat készítenéd elő nekem meglepetésként?
Megdugnál a fürdőszobában, miközben vendégeink vannak a nappaliban?
Melyik baszást bántad meg a legjobban? #mult
Mit csinálnál, ha azt mondanám: ma este bármit megtehetsz velem, a stopszóig? #kotozes
Kinek a teste jár a fejedben, amikor nem rám gondolsz? #harmadik
Felizgatna, ha bevallanám, hogy egy volt partneremre is gondoltam dugás közben? #mult
Izgat a fojtogatás gondolata? Tudod, hogy játékból is okozhat maradandó sérülést? #fajdalom #kotozes
Mi vonz a fojtogatásban: a kiszolgáltatottság vagy az irányítás? Mi adná ezt meg veszély nélkül? #kotozes
Hol a határ, ha a nyakadhoz érek szex közben: csók, simítás, és mi az, ami már nem fér bele? #fajdalom`)});
})();

/* Nagy bővítés (2026. november): alap- és flörtös csomagok 48-ra, mocskos csomagok 100-ra, Tabuk nélkül 120-ra. */
(() => {
 const L=window.PAIR_LINES,D=window.PAIR_DATA,P=window.PAIR_PACKS,pack=(game,id)=>P[game].find(p=>p.id===id);
 D.closer.push(...L(`Melyik étel juttat eszedbe egy jó gyerekkori napot?
Milyen apró dolog dobta fel a hetedet?
Melyik évszakban érzed magad a legjobban, és miért?
Milyen hobbit kezdenél el, ha holnap lenne rá időd?
Mit csinálok, amitől úgy érzed, hogy figyelek rád? !2
Mikor érezted legutóbb, hogy büszke vagyok rád? !2
Milyen szokásomat hiányolnád, ha egy hétre elutaznék? !2
Melyik közös beszélgetésünk változtatott valamin benned? !2
Mitől félsz a legjobban egy kapcsolatban? !3
Mi az, amit még sosem mertél kimondani nekem? !3
Melyik régi sebed hat még ma is arra, ahogy szeretsz? !3
Mit szeretnél, ha jobban értenék abból, ahogy gyerekként szerettek? !3`));
 D.honest.push(...L(`Melyik érintésnél érzed magad a legbiztonságosabban?
Mit jelent neked az, hogy egy együttlét jól sikerült?
Milyen hangulat kell ahhoz, hogy kívánj?
Mitől érzed magad vonzónak egy átlagos napon?
Hogyan szeretnéd, hogy szóba hozzam, ha valami újat szeretnék?
Milyen emlékünk segít, ha eltávolodtunk egymástól?
Mi segít, hogy a stressz ne vegye el a kedvedet a közelségtől?
Milyen bókot szeretsz hallani a testedről?
Mit szeretnél, hogy tudjak arról, hogyan jön meg a kedved?
Mennyi idő kell neked, hogy egy veszekedés után újra közel kerülj?
Hogyan szeretnéd, ha egy elutasítást fogadnék?
Melyik közös szokásunk tesz kívánatosabbá a szemedben?`));
 D.truth.push(...L(`Mi volt az első gondolatod, amikor először megláttál?
Melyik ruhámban tetszem neked a legjobban?
Milyen titkot árulnál el most, ami megnevettet?
Melyik közös fotónk a kedvenced, és miért?
Mikor féltékenykedtél utoljára, akár csak egy kicsit?
Melyik szokásomat utánoznád a legszívesebben?
Mit gondoltál rólam, amit később át kellett értékelned?
Milyen randiötletet tartogatsz még nekem?
Mi volt a legviccesebb félreértésünk?
Melyik dalt énekelnéd nekem, ha senki sem hallaná?
Milyen becenevet adnál nekem titokban?
Mikor nevettél rajtam úgy, hogy nem vettem észre?
Mi az, amiben sokkal jobb vagy nálam?
Mit csinálsz, amikor egyedül vagy, és senki sem lát?
Melyik pillanatban akartál a legjobban megcsókolni?
Milyen meglepetést terveztél, ami végül elmaradt?
Mi a legkínosabb dolog, ami velem kapcsolatban történt veled?
Melyik ismerősömmel jönnél ki a legjobban?
Mit szeretnél, ha gyakrabban mondanék neked?
Melyik tulajdonságomat örökítenéd tovább?`));
 D.dare.push(...L(`Mondd el a másik három kedvenc tulajdonságát, gondolkodás nélkül.
Utánozd a másik nevetését.
Táncolj fél percig a kedvenc dalodra. ~30
Rajzold le a másikat tíz másodperc alatt, csukott szemmel. ~10
Írj egy rövid, vicces verset a nevéről.
Meséld el, hogyan képzeled el a következő közös nyaralásunkat.
Adj a másiknak egy hosszú, szoros ölelést.
Mondj egy bókot egy olyan dologra, amit ma csinált.
Válassz a telefonodról egy közös képet, és mesélj róla.
Énekelj el egy szerelmes dalból két sort.
Mutasd meg, hogyan néztél rá az első randin.
Masszírozd meg a másik vállát egy percig. ~60
Mondd el, mit főznél neki egy különleges estére.
Találj ki egy titkos jelet, ami azt jelenti: „szeretlek”.
Suttogd el a fülébe, mit szeretsz benne a legjobban.
Csókold meg a kézfejét, mint egy régi filmben.
Tervezz egy tökéletes vasárnapot öt lépésben.
Mondj egy mondatot úgy, mintha egy romantikus film hőse lennél.
Fogjátok meg egymás kezét, és fél percig ne szóljatok. ~30
Adj a másiknak egy puszit oda, ahová ő kéri, az arcán.`));
 D.radar.push(
 ['Egy esős estén inkább…','Film és takaró','Társasjáték és tea'],
 ['Születésnapra inkább…','Nagy buli','Csendes vacsora kettesben'],
 ['Reggelente inkább…','Kávé ágyba','Közös reggeli az asztalnál'],
 ['Az ideális randi hossza…','Pár óra','Egy egész nap'],
 ['Kalandnak inkább…','Hegyi túra','Városnézés'],
 ['Egy ajándékban inkább…','A meglepetés','A hasznosság'],
 ['Veszekedés után inkább…','Rögtön kibeszélem','Előbb lehiggadok'],
 ['Egy közös estén inkább…','Főzünk','Rendelünk'],
 ['Nyáron inkább…','Strand','Erdő'],
 ['Egy üzenetre inkább…','Azonnal válaszolok','Ráérősen válaszolok'],
 ['A közös fotókon inkább…','Komolyak vagyunk','Bolondozunk'],
 ['Hétköznap este inkább…','Sorozat','Séta'],
 ['Indulás előtt inkább…','Tervezett utazás','Last minute út'],
 ['Egy bulin inkább…','Táncolok','Beszélgetek'],
 ['A meglepetéseket…','Imádom','Inkább tudom előre'],
 ['Közös hobbiként inkább…','Sport','Alkotás'],
 ['Egy kávézóban inkább…','Ablak mellett','Csendes sarokban'],
 ['Háziállatnak inkább…','Kutya','Macska'],
 ['Közlekedésben inkább…','Repülő','Vonat'],
 ['A lakásban inkább…','Sok növény','Kevés tárgy'],
 ['Pihenőnapon inkább…','Alszom egy nagyot','Korán kelek'],
 ['Nassolni inkább…','Édes','Sós'],
 ['Egy filmnél inkább…','Sírok','Nevetek'],
 ['A hétvégén inkább…','Barátokkal','Csak kettesben']
 );
 D.match.push(...L(`Közös fürdő gyertyafénnyel
Lassú tánc a konyhában
Egymás kedvenc filmjének megnézése
Szerelmes üzenetek elrejtése a lakásban
Meglepetés-reggeli a kedvenc kávézóban
Naplementés séta kézen fogva
Egymás masszírozása illatos olajjal
Közös fotóalbum összeállítása
Hétvégi kiruccanás egy kis panzióba
Egy este csak gyertyafénnyel, áram nélkül
Egymásnak választott ruhában menni randira
Közös főzés egy új receptből
Csillagnézés pokrócon
Szerepjátékos randi, mintha most ismerkednénk
Egy nap telefon nélkül
Szerelmes levél felolvasása egymásnak
Csókverseny: ki bírja tovább
Egymás hajának megmosása
Pizsamás filmmaraton
Ölelkezés egy egész film alatt`));
 D.quiz.push(
 ['Ébredés után inkább…','Rögtön felkelek','Még szundítok'],
 ['Stresszes napon inkább…','Mozgok','Pihenek'],
 ['Zenében inkább…','Régi slágerek','Új számok'],
 ['Egy könyvnél inkább…','Regény','Ismeretterjesztő'],
 ['Vásárláskor inkább…','Előre listát írok','Spontán veszek'],
 ['Telefonon inkább…','Hívok','Írok'],
 ['Egy ünnepen inkább…','Hagyományos menü','Valami új'],
 ['Kirándulásnál inkább…','Rövid séta','Hosszú túra'],
 ['Nyaraláskor inkább…','Pihenés','Program'],
 ['Egy vitában inkább…','Gyorsan kibékülök','Kell egy kis idő'],
 ['A kedvenc napszak…','Reggel','Este'],
 ['Egy partin inkább…','A konyhában beszélgetek','A táncparketten vagyok'],
 ['Ajándéknál inkább…','Kézzel készített','Boltban vett'],
 ['Edzésben inkább…','Egyedül','Társasággal'],
 ['Egy új helyen inkább…','Térképet nézek','Kérdezek'],
 ['Moziban inkább…','Elöl ülök','Hátul ülök'],
 ['Sorozatnál inkább…','Egyszerre végignézem','Részenként élvezem'],
 ['Pénzzel inkább…','Spórolok','Elköltöm'],
 ['Takarításnál inkább…','Mindent egyszerre','Apránként'],
 ['Kávét inkább…','Feketén','Tejjel'],
 ['Egy döntés után inkább…','Nem bánom','Sokat rágódom'],
 ['Vendégségben inkább…','Én főzök','Én viszem a desszertet'],
 ['Egy szabad estén inkább…','Olvasok','Játszom'],
 ['Ünnepi fotón inkább…','Mosolygok','Grimaszolok']
 );
 D.memories.push(...L(`Melyik közös utazásunkon nevettünk a legtöbbet?
Mi volt az első ajándék, amit tőlem kaptál?
Melyik ünnepünk maradt meg a legszebben?
Mikor éreztem úgy, hogy igazán számíthatok rád?
Melyik közös kalandunk ment teljesen félre, mégis jó volt?
Milyen időjárás jut eszedbe az első randinkról?
Melyik közös reggelünkre emlékszel szívesen?
Mikor láttál először sírni, és mit éreztél?
Melyik közös barátunkkal töltött este volt a legjobb?
Mi volt az első közös vásárlásunk?
Melyik veszekedésünk után szerettelek még jobban?
Milyen ruhában voltam, amikor először megláttál?
Melyik közös sorozatunk kötött össze?
Mikor kerültünk igazán közel egymáshoz, akár képletesen?
Melyik meglepetésem volt a legemlékezetesebb?
Milyen helyen csókolóztunk először?
Melyik közös nyarunk volt a kedvenced?
Mi volt az első közös szokásunk?
Melyik közös fotónk mögött van a legviccesebb történet?
Mikor hiányoztam neked a legjobban?
Melyik receptünk lett igazi hagyomány?
Milyen dalt énekeltünk együtt a legtöbbször?
Mikor éreztük úgy, hogy csapat vagyunk?
Melyik első alkalmunkra gondolsz ma is mosolyogva?`));
 D.future.push(...L(`Hol szeretnél élni velem tíz év múlva?
Milyen közös célért spórolnánk szívesen?
Milyen hagyományt adnánk tovább másoknak?
Milyen kalandot tervezzünk jövő nyárra?
Hogyan szeretnénk ünnepelni a következő évfordulónkat?
Milyen nyelvet tanulnánk meg együtt?
Milyen lenne az álomkonyhánk?
Milyen otthoni szokást vezetnénk be jövő hónaptól?
Mi lenne az első dolog a közös bakancslistánkon?
Hogyan osztanánk meg a házimunkát igazságosabban?
Milyen sportot kezdenénk el közösen?
Milyen ünnepet szerveznénk a barátainknak?
Hogyan töltenénk egy szabad évet?
Milyen állatot fogadnánk örökbe?
Milyen hosszú utat tennénk meg autóval?
Milyen közös szokással figyelnénk jobban egymásra?
Mit tanulnánk meg, hogy könnyebb legyen a hétköznap?
Hogyan néz ki egy tökéletes közös nyugdíjas napunk?
Milyen helyet szeretnél újra meglátogatni velem?
Milyen közös vállalkozást indítanánk szívesen?
Hogyan fogjuk tudni, hogy jól vagyunk egy év múlva?
Milyen bátor döntést hoznánk meg együtt?
Melyik közös álmunkat kezdenénk el kicsiben már most?
Mire szánnánk több időt, ha kevesebbet dolgoznánk?`));
 D.bucket.push(...L(`Hajnali túra a hegyekben
Közös főzőtanfolyam
Lovaglás egy tanyán
Kajakozás egy tavon
Biciklitúra egy hétvégén
Koncert, ahol egyikünk sem ismeri a zenekart
Szabadulószoba
Önkéntes nap egy állatmenhelyen
Termálfürdő egy hideg napon
Kemping sátorral
Hőlégballonos repülés
Egy éjszaka egy faházban
Fazekas-workshop
Tánciskola egy estére
Bortúra egy borvidéken
Kalandpark
Hajókirándulás
Moziban egy régi film
Piknik egy várromnál
Közös fotósorozat egy városban
Hosszú vonatút ismeretlen célba
Csillagvizsgáló meglátogatása
Saját limonádé vagy szörp készítése
Strandröplabda`));
 pack('radar','chemistry').items.push(
 ['Egy flörtös üzenetben inkább…','Emoji','Szavak'],
 ['Egy randi végén inkább…','Hosszú csók','Ölelés és ígéret'],
 ['Ha tetszem neked, inkább…','Megmondod','Megmutatod'],
 ['Kezdeményezésnél inkább…','Én lépek','Várom, hogy lépj'],
 ['Kettesben otthon inkább…','Közel ülünk','Szemben ülünk'],
 ['Egy bókban inkább…','A külsőmet dicsérd','A gondolataimat dicsérd'],
 ['A kémia nálad inkább…','Azonnal érezhető','Lassan épül'],
 ['Egy táncnál inkább…','Lassú','Pörgős'],
 ['A szemkontaktus…','Zavarba hoz','Felizgat'],
 ['Egy csók előtt inkább…','Kérdezz','Lepj meg'],
 ['Egy illatban inkább…','Friss','Fűszeres'],
 ['A legszexibb rajtam inkább…','A mosolyom','A hangom'],
 ['Csábításnál inkább…','Szóbeli játék','Érintések'],
 ['Egy randin inkább…','Te tervezel','Én tervezek'],
 ['Egy meglepetés csókra…','Imádom','Előbb szólj'],
 ['Egy közös fürdésre…','Igen, gyertyával','Inkább később'],
 ['Telefonon inkább…','Hosszú hívás','Gyors flört'],
 ['A vonzalom jele nálad inkább…','Pirulás','Bátorság'],
 ['Egy romantikus helyszín inkább…','Tetőterasz','Tengerpart'],
 ['Egy hosszú nap után inkább…','Masszázs','Csók'],
 ['Egy kacsintásra inkább…','Visszakacsintok','Elnevetem magam'],
 ['Öltözködésben randira inkább…','Elegáns','Laza'],
 ['A kezed fogásánál…','Összefonódó ujjak','Tenyér a tenyérben'],
 ['A búcsúnál inkább…','Még egy csók','Egy kedves üzenet később']
 );
 const spark=pack('truth','spark');
 spark.truth.push(...L(`Mikor akartál a legjobban megcsókolni, de nem tetted?
Melyik testrészemet nézed meg először?
Milyen ruhám vonz a legjobban?
Mi volt a legszexibb dolog, amit valaha mondtam?
Mikor gondoltál rám pajzánul napközben?
Milyen randin csábítanál el a legszívesebben?
Hol csókolnálak meg most a legszívesebben?
Mi az a mozdulatom, amitől beindulsz?
Milyen illatomat szereted a legjobban?
Mikor voltál a legféltékenyebb rám?
Milyen fantáziád van egy közös nyaralásról?
Melyik közös éjszakánkra gondolsz a legszívesebben?
Mit viselnék, ha te választhatnál ma estére?
Mikor pirultál el miattam utoljára?
Milyen üzenetet írnál nekem, amit csak éjjel olvashatok el?
Mi az a bók, amitől elolvadsz?
Mikor éreztél a legerősebb vonzalmat irántam?
Milyen helyen szeretnél egyszer kettesben lenni velem?
Melyik hangulatban vagyok a legvonzóbb?
Mit csinálnál, ha most egy órára csak a tiéd lennék?
Milyen játékos kihívást adnál nekem ma este?
Melyik csókunk volt a legemlékezetesebb?
Mit szeretsz a legjobban abban, ahogy hozzád érek?
Mi az, amit még nem kértél tőlem, de szeretnéd?`));
 spark.dare.push(...L(`Csókold meg a másik nyakát, lassan.
Súgj a fülébe egy pajzán bókot.
Simogasd a másik arcát fél percig, csukott szemmel. ~30
Táncolj vele egy lassút zene nélkül.
Ülj az ölébe a következő kör végéig.
Fogd meg a kezét, és csókold végig az ujjait.
Mondd el, mi az első, amit levennél róla.
Adj neki egy csókot, ami legalább tíz másodpercig tart. ~10
Nézz a szemébe, és mondd el, mennyire kívánod.
Írj neki egy flörtös üzenetet, és küldd el most.
Csókold meg ott, ahová ő mutat a nyakától felfelé.
Masszírozd a vállát egy percig. ~60
Mutasd meg, hogyan csábítanád el egy bárban.
Harapj gyengéden az alsó ajkába.
Simogasd a hátát a pólója alatt egy percig. ~60
Mondd el három szóban, mit csinálnál vele ma éjjel.
Fújj lágyan a nyakára.
Ölelj át hátulról, és maradj így fél percig. ~30
Csókold meg a homlokát, az orrát és a száját.
Táncolj neki fél percig csábítóan. ~30
Kérdezd meg, hol szeretné, hogy megérintsd, és tedd meg.
Simítsd végig a combját a ruháján keresztül.
Mondj neki egy bókot csak a szemeddel, szavak nélkül.
Csókolj bele a tenyerébe, és nézz a szemébe.`));
 pack('match','desires').items.push(...L(`Hosszú csókolózás a kanapén, sietség nélkül
Közös zuhany illatos tusfürdővel
Egymás vetkőztetése lassan
Masszázs gyertyafényben
Flörtös randi egy bárban, mintha nem ismernénk egymást
Szexi fehérnemű egy meglepetés estére
Egy este csak csókokkal
Közös fürdő pezsgővel
Egymás érintésének felfedezése bekötött szemmel
Hétvége egy hotelben kettesben
Reggeli összebújás ébresztő nélkül
Egymás testének végigcsókolása
Tánc gyertyafényben, lassan vetkőzve
Romantikus vacsora otthon, utána ágy
Közös film után hosszú simogatás
Egy este, amikor a másik dönt mindenről
Fürdés után krémezés egymásnak
Pajzán társasjáték kettesben
Csókok a nyakon, amíg bírjuk
Egy éjszaka meztelenül alva
Közös tervezés: mit próbálnánk ki legközelebb
Lassú szeretkezés zenére
Érintés-térkép: megmutatjuk, hol szeretjük`));
 pack('honest','intimacy').items.push(...L(`Mi a kedvenc emléked az első együttlétünkről?
Milyen érintéstől olvadsz el a legjobban?
Mikor kívánsz a legjobban a nap folyamán?
Mit szeretsz abban, ahogy megcsókollak?
Milyen hangulat segít, hogy elengedd magad?
Melyik testrészedet szereted, ha kényeztetem?
Mit szeretnél többet az előjátékból?
Milyen szavakat szeretsz hallani szeretkezés közben?
Mi az, ami után a legközelebb érzed magad hozzám?
Hogyan szeretnéd, hogy kezdeményezzek, ha fáradt vagy?
Milyen új dolgot próbálnál ki velem lassan?
Mitől érzed magad a legszexibbnek?
Mi a kedvenc napszakod a szeretkezéshez?
Milyen zene illik szerinted hozzánk az ágyban?
Mit szeretsz abban, ahogy rád nézek?
Mi az, amit egy hosszú együttlét után a legjobban élvezel?
Hogyan mondanád el, ha valami nagyon jólesik?
Mit gondolsz, miben lettünk jobbak az ágyban?
Milyen fantáziádat mesélnéd el először?
Milyen szerepet játszik nálad a lassúság?
Mikor érzed, hogy igazán rád figyelek szex közben?
Mi az, amit sosem unsz meg velem?
Mit szeretnél, ha gyakrabban kezdeményeznék?
Milyen helyen szeretnél egyszer szeretkezni velem a lakásban?`));
})();

// Mocskos és Tabuk nélkül bővítés (2026. november)
(()=>{
 const L=window.PAIR_LINES,P=window.PAIR_PACKS,pack=(game,id)=>P[game].find(p=>p.id===id);
 pack('match','desires').items.push(...L(`Hosszú, lassú masszázs olajjal, utána közös fürdés`));
 pack('radar','fire').items.push(
 ['A csuklómon inkább…','Selyemsál','Bilincs',{tags:['kotozes']}],
 ['Orálisnál inkább…','Lassan, kínzóan','Mohón, gyorsan',{tags:['oral']}],
 ['Az ujjaid inkább…','A számban','Bennem',{tags:['erintes','oral']}],
 ['A csúcson inkább…','Nézz a szemembe','Fordíts hátat'],
 ['Popsidugó…','Csak előjátékhoz','Egész estére',{tags:['anal','jatekszer']}],
 ['Reggel inkább…','Gyors menet a zuhany alatt','Lassú menet az ágyban',{tags:['pozicio']}],
 ['Hátulról inkább…','A hajamat húzva','A csípőmet markolva',{tags:['pozicio','fajdalom']}],
 ['Mocskos beszédben inkább…','Dicsérj','Alázz meg'],
 ['Vibrátorral inkább…','Rajtam, míg nézed','Rajtad, míg nézem',{tags:['jatekszer']}],
 ['Lovagláskor…','Én diktálok','Te húzol magadra',{tags:['pozicio']}],
 ['A fenekemen inkább…','Tenyér','Lapát',{tags:['fajdalom']}],
 ['Ha karmolok…','A hátadon','A combodon',{tags:['fajdalom']}],
 ['Elélvezés-tiltás…','Egész estére','Három könyörgésig',{tags:['kotozes']}],
 ['Egy videó rólunk…','Csak nézni együtt','Soha ne készüljön',{tags:['foto']}],
 ['A testnedvek…','Minél több','Minél tisztább',{tags:['testnedv']}],
 ['Egy hármas…','Csak fantáziában','Talán egyszer',{tags:['harmadik']}],
 ['Szerepben inkább…','Főnök és titkárnő','Szállodai vendég és masszőr',{tags:['szerep']}],
 ['Nyakörv…','Rajtam','Rajtad',{tags:['kotozes']}],
 ['Meztelenül inkább…','Főzz nekem','Táncolj nekem',{tags:['meztelen']}],
 ['Egy menet…','Teljes csendben','Hangosan nyögve'],
 ['A tükör…','Nézzük magunkat','Inkább sötét legyen',{tags:['pozicio']}],
 ['Nyalás közben…','Fogd a fejem','Tartsd szét a combom',{tags:['oral']}],
 ['Kikötve inkább…','Szemkötővel','Látva mindent',{tags:['kotozes']}],
 ['Az utolsó menet…','Lassú és mély','Durva és gyors'],
 ['Szexjáték vásárlás…','Együtt választunk','Lepj meg vele',{tags:['jatekszer']}],
 ['Kényeztetésnél inkább…','Mellbimbó','Belső comb',{tags:['erintes']}],
 ['Egész hétvégén…','Ruha nélkül otthon','Csak alsóneműben',{tags:['meztelen']}],
 ['Ha nyomot hagysz…','Harapás','Szívásnyom',{tags:['fajdalom']}]
 );
 const naughty=pack('truth','naughty');
 naughty.truth.push(...L(`Hányszor akartál ma megdugni, mióta felébredtél?
Melyik testrészemet nyalnád most a legszívesebben? #oral
Mi volt a legjobb orgazmusod velem, és mitől lett olyan jó?
Mit gondolsz rólam, amikor egyedül nyúlsz magadhoz?
Melyik pózban élvezel el a leggyorsabban? #pozicio
Mire gerjedsz rá, amiről azt hiszed, nem tudok?
Melyik szexjátékot használnád rajtam legelőször? #jatekszer
Mit suttogjak neked, mielőtt elélvezel?
Mennyire szereted, ha lefoglak és nem mozdulhatsz? #kotozes
Melyik ruhadarabomat tartanád meg emlékbe egy jó dugás után?
Szereted látni a nyomát a bőrömön, amikor elélvezel rajtam? #testnedv
Mit csinálsz a legszívesebben a száddal, ha szabad kezet kapsz? #oral
Melyik fantáziádat valósítanád meg még ma éjjel, ha belemennék?
Hogyan dugnál meg, ha csak öt perced lenne?
Milyen hangot adsz ki, amikor tényleg nagyon jó?
Mit tennél velem, ha egy egész napig a rabszolgád lennék? #kotozes #szerep
Mi a legmocskosabb dolog, amit már csináltunk, és megismételnéd?
Milyen fehérneműben akarsz látni legközelebb? #meztelen
Mennyire izgat, ha a hajadat húzom dugás közben? #fajdalom
Szeretnéd, ha készítenék rólad egy pajzán képet csak magunknak? #foto
Melyik szerepben dugnál meg a legszívesebben? #szerep
Mit csinálnál, ha most meztelenül az öledbe ülnék? #meztelen
Hány menetet bírnál ki egy éjszaka alatt, ha nem engednélek pihenni?
Melyik testrészemre harapnál rá a legszívesebben? #fajdalom
Mennyire szereted, ha előjáték közben a fenekedhez nyúlok? #anal
Mitől leszel a legnedvesebb vagy a legkeményebb?
Mit csinálnék veled egy héten át minden este, ha te döntenél?
Melyik mocskos üzenetemet olvastad el többször is?`));
 naughty.dare.push(...L(`Súgd a másik fülébe, pontosan hogyan dugod meg ma este.
Csókold a másik belső combját egy percig, de a közepéhez nem érhetsz. ~60 #erintes
Vetkőzz le a másik előtt lassan, zene nélkül, a szemébe nézve. #meztelen
Nyúlj a másik nadrágjába, és simogasd fél percig. ~30 #erintes
Kösd össze a másik csuklóját, és csókold, ahol akarod, két percig. ~120 #kotozes
Harapd meg gyengéden háromszor a másik fenekét. #fajdalom
Szívd a másik mellbimbóját, amíg fel nem nyög. #oral #erintes
Ülj a másik arcára tíz másodpercig, aztán állj fel. ~10 #oral
Sorold fel hangosan, a másik mely három testrészét nyalnád meg ma. #oral
Tartsd a másik csuklóját az ágyhoz szorítva, és csókold végig a hasát. #kotozes
Hintázz lassan a másik ölében, amíg ő azt nem mondja, elég. #pozicio
Készíts egy pajzán fotót a másikról, amit utána együtt töröltök. #foto
Dörzsöld magad a másik combjához fél percig. ~30 #erintes
Kényeztesd a másikat csak a nyelveddel két percig, kéz nélkül. ~120 #oral
Paskold meg a másik fenekét ötször, és minden csapás után kérdezd, kér-e még. #fajdalom
Vedd a szádba a másik ujjait, és szopogasd őket lassan. #oral
Nyögj a másik fülébe úgy, ahogy elélvezéskor szoktál.
Vetkőztessétek le egymást úgy, hogy csak a szátokat használhatjátok. #meztelen
A másik bekötött szemmel fekszik, te egy percig kényezteted, ő találja ki, mivel. ~60 #kotozes #erintes
Simogasd a másik fenekét két percig, közben mondd el, mit tennél vele. ~120 #erintes
Mutasd meg a másiknak fél percig, hogyan nyúlsz magadhoz. ~30 #erintes #meztelen
Csókold meg a másikat úgy, mintha most dugnátok először.
Írj ujjal egy mocskos szót a másik hátára, neki ki kell találnia. #erintes
Szívj egy nyomot a másik nyakára, ha ő igent mond. #fajdalom
Nyald le lassan a mézet a másik ujjáról. #oral
Térdelj a másik elé, és várd az utasítását egy percig. ~60 #szerep
Kényeztesd a másik mellbimbóját jégkockával tíz másodpercig. ~10 #erintes
Fordítsd hasra a másikat, és csókold végig a gerincét. #erintes`));
 pack('match','wishlist').items.push(...L(`Tíz csapás a fenekemre, hangosan számolva #fajdalom
Egész estés elélvezés-tiltás, csak a végén szabad #kotozes
Közös zuhany, ahol végig a számmal kényeztetlek #oral
Vibrátoros kínzás, amíg a másik könyörögni nem kezd #jatekszer
Bekötött szemmel kitalálni, mivel érintesz #kotozes #erintes
Popsidugó egész este, aztán anál, ha mindketten akarjuk #anal #jatekszer
Szerepjáték: masszőr, aki túl messzire megy #szerep #erintes
Kikötve, amíg háromszor el nem élvezek #kotozes
Arcra élvezés, előre megbeszélve #testnedv
Megbeszélt ébresztés nyalással egy szabadnapon #oral
Egymás nyalása tükör előtt, hogy lássuk magunkat #oral
Hajhúzás hátulról, keményen #fajdalom #pozicio
Otthoni videó, amit megnézünk, aztán törlünk #foto
Nyakörv és póráz egy estére a lakásban #kotozes
Mocskos beszéd végig, egy perc szünet nélkül
Lassú, kínzó kézimunka a legvégéig #erintes
Ujjazás, miközben a fülembe mondod, mit akarsz #erintes
Meztelen házimunka, amíg a másik nézi #meztelen
Gyertyaviasz a hátamra, alacsony olvadáspontú masszázsgyertyával #fajdalom
Egy este, amikor csak te élvezhetsz el
Egy este, amikor csak én parancsolok #kotozes
Nyalás, amíg már könyörgök, hogy hagyd abba #oral
Tusfürdős, csúszós kényeztetés az egész testen #erintes
Dugás az ablaknál, behúzott függöny mögött #pozicio
Karmolás a hátamon, ahogy jólesik #fajdalom
Fenékjáték nyelvvel, előtte közös fürdés #anal #oral
Szexjáték, amit együtt választunk ki a boltban #jatekszer
Hármas fantázia elmesélve dugás közben #harmadik`));
 pack('honest','frank').items.push(...L(`Milyen gyakran szeretnél valójában szexelni, ha csak rajtad múlna?
Mi az, amit túl gyorsan csinálok az ágyban?
Megjátszottad már velem az orgazmust? Mikor és miért?
Mi kell ahhoz, hogy biztosan elélvezz?
Melyik szexjáték érdekel, amit eddig szégyelltél szóba hozni? #jatekszer
Hogyan szereted az orálist: lassan, gyorsan, mélyen? #oral
Mit gondolsz az anál szexről, nálad hol a határ? #anal
Zavar, ha szex közben nyikorog az ágy, vagy túl hangosak vagyunk?
Milyen illatomat vagy ízemet szereted a legjobban? #testnedv
Mikor csalódtál utoljára egy együttlét után, és miért?
Mit csinálsz magaddal másként, amikor egyedül élvezel el? #erintes
Melyik szexuális élményed formált a legjobban? #mult
Mit csinált jobban egy volt partnered, amit megtanítanál nekem? #mult
Szereted, ha fenekelés közben beszélek hozzád? #fajdalom
Hol van számodra a határ a megalázó beszédben?
Mit szeretnél, hogy csináljak, miután te már elélveztél?
Melyik pózt kéred túl ritkán? #pozicio
Mit érzel, ha szájjal fejezem be, és mit, ha nem? #oral #testnedv
Mennyire izgat a gondolat, hogy kikötöm a kezedet? #kotozes
Milyen pornójelenetet néznél meg velem, hogy megmutasd, mit szeretnél?
Mi az, amitől szex közben elmegy a kedved?
Milyen szóval szereted, ha a nemi szervedet nevezem?
Elég hosszú szerinted az előjátékunk? Mit tennél hozzá?
Mit csinálsz, amikor nem vagy hangulatban, de én igen?
Melyik testrészed miatt vagy bizonytalan meztelenül? #meztelen
Kell nekünk egy lassíts jel a stopszó mellé? Mi legyen az?
Melyik fantáziád ijeszt meg egy kicsit, mégis vonz?
Volt már, hogy fájt szex közben, és nem szóltál? #fajdalom`));
 pack('honest','taboo').items.push(...L(`Kivel csalnál meg a fantáziádban, ha semmi következménye nem lenne? #harmadik
Melyik barátunk segge jár a fejedben, amikor magadhoz nyúlsz? #harmadik
Mennyire akarod, hogy az arcodra élvezzek, és utána így nézzelek? #testnedv
Hagynád, hogy egy egész estén át csak a szádat baszjam? #oral
Mi a legkurvább dolog, amit valaha csináltál?
Ki volt a legrosszabb baszásod, és mit rontott el? #mult
Fizetnél valaha szexért, ha senki nem tudná meg?
Mennyire izgat a gondolat, hogy valaki más gecije vagy nedve van rajtam? #harmadik #testnedv
Néznél velem élő szexkamerát, és közben magadhoz nyúlnál?
Melyik ismerősöd punciját vagy farkát nézted meg titokban a legtöbbször? #harmadik
Ha hármasban basznánk, kit nyalnál előbb: engem vagy őt? #harmadik #oral
Hagynád, hogy egy idegen nézze, ahogy baszunk, ha te nem is látnád őt? #harmadik
Mi a legocsmányabb szó, amit hallani akarsz, miközben elélvezel?
Mennyire akarsz a seggembe élvezni? #anal #testnedv
Mi a legaljasabb fantáziád rólam, amit sosem mondtál ki?
Ha egy éjszakára a szexrabszolgád lennék, mit csinálnál velem először? #kotozes
Lennél egy estére a szexjátékom, aki csak akkor beszél, ha kérdezem? #kotozes #szerep
Térden állva könyörögnél a farkamért vagy a puncimért, ha azt mondanám? #szerep
Melyik pornósztárt basznád meg előttem, ha megengedném? #harmadik
Mit csinált veled egy volt partnered, ami most is beindít, ha rágondolsz? #mult
Mennyi ismeretség után basztál meg valakit a leghamarabb? #mult
Szopnám a lábujjaidat, miközben magadhoz nyúlsz: izgatna vagy röhögnél?
Mennyire izgat, ha nyomot hagyok rajtad, amit holnap mindenki láthat? #fajdalom
Hány ujjat bírnál magadban egyszerre? #erintes
Mi a legdurvább dolog, amit valaha a seggedbe dugtál, vagy dugnál? #anal #jatekszer
Megnyalnád a saját nedvedet a farkamról vagy az ujjamról? #testnedv #oral
Szoptál vagy nyaltál már valakit, akit közben utáltál? #mult #oral
Mi a legperverzebb keresés a telefonod előzményeiben?
Izgatna, ha elmennénk egy cserepárbuliba, csak nézelődni? #harmadik
Elképzelted már, hogy egy másik nő vagy férfi segít neked kielégíteni engem? #harmadik
Basznál velem egy amatőr pornó előtt, pontosan azt csinálva, amit ők? #pozicio
Ki lenne szívesebben a mocskos ribanc kettőnk közül egy éjszakára? #szerep
Akarod, hogy bekötött szemmel, kikötve várj rám az ágyon, amíg megbaszlak? #kotozes
Mit szólnál, ha meztelen képet küldenék magamról, miközben dolgozol? #foto #meztelen
Videóznál, miközben a farkadat vagy a puncidat nyalom? #foto #oral
Szétkennéd a gecimet vagy a nedvemet a melleden, hogy lássam? #testnedv
Mennyire akarsz megfenekelni, amíg piros nem lesz a seggem? #fajdalom
Meddig bírnád elélvezés nélkül, ha megtiltanám, és közben kínoználak?
Gerjesztene, ha a fantáziádban egy egész csapat nézné, ahogy kiszolgálsz? #harmadik
Kit akarnál látni magunk között az ágyban: egy nőt vagy egy férfit? #harmadik
Milyen hazugságot mondtál már, hogy megdughass valakit? #mult
Kit szégyellsz a legjobban azok közül, akiket megbasztál? #mult
Akarod, hogy a hajadnál fogva húzzalak a farkamra vagy a puncimra? #fajdalom #oral
Mennyire izgat, ha ruhában, sietve baszunk, mintha bármikor ránk nyithatnának?
Kiszolgálnál egész hétvégén meztelenül, ha én úgy akarom? #meztelen #szerep
Melyik tilos hely jár a fejedben, ahol otthon még nem basztunk?
Gondoltál már arra, hogy pénzért vetkőzz egy kamera előtt? #meztelen
Bevallanád, ha egész héten valaki más után nyúltál volna magadhoz? #harmadik
Mi a legmocskosabb hely a testemen, amit mégis megnyalnál? #oral
Akarnád, hogy egy napig csak a lyukaimat használd, a stopszóig? #szerep
Izgatna, ha baszás után kidobnálak, mint egy egyéjszakás kalandot, szerepből? #szerep
Basznál velem úgy, hogy közben egy volt partnered nevét kiáltod, ha kérném? #mult
Melyik testrészemet akarod a legközelebbről látni, miközben elélvezel?
Mennyire vágysz arra, hogy egy éjszaka alatt minden lyukamat megbaszd? #anal #oral
Elvinnélek vacsorázni a konyhánkba úgy, hogy egy játék van a seggedben? #anal #jatekszer
Mi az a perverzió, amit rólad senki sem gondolna?
Melyik határodat lépnéd át velem, ha tudnád, hogy bármikor megállíthatod?`));
})();
