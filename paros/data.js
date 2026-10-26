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
 return {closer,honest,truth,dare,radar,match,quiz};
})();
