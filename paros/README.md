# Páros est

Önálló, két játékosra tervezett statikus alkalmazás az `onismeret/paros/` könyvtárban.

Játékok: Közelebb hozzád, Flörtradar, Igazság vagy kihívás (18+), Igen, nem, talán (18+), Szexről őszintén (18+), Mennyire ismersz?, Emlékösvény, Jövőnk mozaikja, Közös bakancslista

- A válaszok kizárólag memóriában élnek; újratöltés vagy körtörlés után elvesznek. Háttérbe kerüléskor fedőképernyő takarja a játékot.
- Az Igen, nem, talán eredménye csak a két igen találkozásait tartalmazza; az egyéni válaszokat az összevetés után töröljük a kör állapotából.
- A `localStorage` kizárólag a két nevet tárolja, külön `paros.preferences.v1` kulcs alatt. A 18+ megerősítés újratöltéskor megszűnik.
- Saját manifest és `/paros/` hatókörű service worker; a `paros-` gyorsítótárak elkülönülnek a Társasest és az önismereti oldalak gyorsítótáraitól.
- Nincs külső hálózati függőség, analitika vagy szerverre küldött válasz. A Vágyjackpot helyben csomagolt Three.js-t használ.

Fejlesztés: a könyvtár közvetlenül szerkeszthető, nincs generált alkalmazáskód. Helyi kiszolgálás a repó gyökeréből: `python3 -m http.server 8000`, majd `http://localhost:8000/paros/`.

Teszt: a repó gyökeréből `npm run test:paros`. A meglévő Playwright-függőséget használja. Rendszer Chromium választható a `PW_CHROMIUM` környezeti változóval.

Az alkalmazás kártyái eredeti magyar megfogalmazások. A szexuális témájú csomag kapcsolati kommunikációt segít; a kihívások és kérdések minden esetben passzolhatók.

A körhossz beszélgetős játékoknál és kihívásoknál 6/12/24 kártya; titkos válaszadásnál 4/8/12 kérdés fejenként. A kezdőlap beszélgetős, titkos választós és 18+ játékokra szűrhető.

Négy extra 18+ csomag: Kémia (Flörtradar), Flört és szikra (Igazság vagy kihívás), Vágyak–közös igenek (Igen, nem, talán), Intimitásról nyíltan (Szexről őszintén). Összesen 120 új elem. A csomagválasztás körönként változtatható; az újraindítás megtartja a csomagot és a körhosszt. A Flörtradar alapcsomagja nem 18+, a Kémia csomag külön megerősítést kér. A 18+ kikapcsolása minden felnőtt csomag aktuális válaszait is törli.

Négy mocskos 18+ csomag nyílt, explicit kérdésekkel és kihívásokkal: Tűzpróba (Flörtradar), Mocskos (Igazság vagy kihívás), Mocskos kívánságlista (Igen, nem, talán), Szex, kertelés nélkül (Szexről őszintén). Újabb 120 elem. 2026 novemberében mind a négy mocskos csomag 48 elemre bővült, durvább kártyákkal (kötözés, dominancia, elélvezés-tiltás, nyomok, anál); a teljes készlet 636 elem. Szándékosan kimarad: fojtogatás és légzéskorlátozás, vér, nyilvános hely, kiskorúra utaló vagy kényszert eljátszó jelenet.
# Arculat, 2026-10-30

Sötét, visszafogott felület egy valódi nyitófotóval. A kilenc játék kezdőlapja, beállításai, átadási nézetei, kérdéskártyái és eredményei egységes stílust használnak. A játéklogika és a személyes válaszok memóriában tartása változatlan.

A fotó forrása és licence: [images/README.md](images/README.md).

# Bővítések, 2026 november

13 játék és 1388 kártya. A Szexről őszintén új, Tabuk nélkül nevű csomagja 120 nyers, provokatív kérdést ad (más emberekről szóló fantáziák, múlt, titkok, fétisek, megalázás, nyitott kapcsolat), csak kérdésként. A mocskos csomagok egyenként 100 elemesek, az alap- és flörtös csomagok 48 elemesek; négy alkalmi csomag (Valentin-nap, Évforduló, Nyaralás, Első randi) a Közelebb hozzád játékhoz. Új játékok: Pajzán pörgető, Póz- és helyszínkocka, Szerepjáték (12 jelenet), Titkos kívánság.

Biztonság: titkos határlista a címkézett 18+ csomagok előtt, Állj gomb, Esc azonnali elrejtés. Játékélmény: fokozatos hevülés, időzítő, rákérdező kártyák, jokerek, pontozós mód, évforduló mód, hangulatfény, „Ma este…” varázsló, az este íve, napi kérdés.

Minden, ami az eszközön megmaradhat (saját kártyák, közös lista, kedvencek és kizárt kártyák), csak külön kapcsolóval tárolódik, saját kulccsal: `paros.custom.v1`, `paros.together.v1`, `paros.marks.v1`.

Tesztek: `npm run test:paros` = tartalom-ellenőrző (`tests/content.test.cjs`), böngészős tesztek (`tests/run.cjs`) és akadálymentességi ellenőrzés (`tests/a11y.cjs`, axe-core). A tartalmi szabályok: [TARTALOM.md](TARTALOM.md).


## Vágyjackpot

14 játék, összesen 1424 beépített kérdés, feladat és ötlet. Az új `#jackpot` játékban két felnőtt egy telefonon, felváltva dob három 3D szimbólumkockával. Hat kategória, kategóriánként hat flörtös vagy érzéki feladat; 6/12/24 dobásos kör, alapból 12.

Minden kocka egymástól függetlenül, hat jelből egyenlő eséllyel dob. Különböző jelek: egy feladat a kidobott kategóriák egyikéből. Két egyező: két eltérő feladat közötti választás az egyező kategóriából. Három egyező: a játék előtt megadott jackpot (1/36 esély). Nincs pénztét, zseton vagy passzolási büntetés.

Kategóriánként legfeljebb tíz saját feladat adható meg. A jackpot és a saját feladatok közös határcímkéit a beállításokban kell megjelölni; a két titkos határlista uniója szűri őket. A beépített csókos, ölelős és masszázsos ötletek érintéscímkét kapnak. Üres kategória vagy kizárt jackpot esetén a játék új beállításokat kér. A saját szövegek és a játékállapot kizárólag memóriában élnek.

A `jackpot-core.js` tartalmazza a játékszabályokat, a `jackpot-3d.js` a megjelenítést. A helyi `vendor/three-r160.min.js` (Three.js 0.160.0, MIT, licenc mellette) csak aktív játékban töltődik be, és az offline csomag része. WebGL-hiba esetén olvasható szimbólumnézet marad; csökkentett mozgásnál nincs kockapörgés. Elrejtéskor, leállításkor és navigációkor az animáció és a WebGL-erőforrások felszabadulnak.

Az `npm run test:paros` a teljes 216 elemű dobásteret, határszűrést, új játékmenetet, mobilos/offline működést és akadálymentességet is ellenőrzi. Helyi megnyitás: `http://localhost:8000/paros/#jackpot`.
