# Harry Potter-kvíz

Önálló aloldal a Társasesten belül: `tarsas/harry-potter/`. Nem külön Git-submodule: az oldal és a játékszerver egy repóban marad. Nincs új függőség, build vagy adatbázis.

- Magyar kérdések a nyolc filmhez, filmrészenként válogathatóan.
- 40 saját megfogalmazású kérdés: részenként 3 feleletválasztós, 1 képes, 1 számtipp. Nyolc saját SVG-illusztráció.
- A filmrészek külön jelölhetők; az újabb részek kérdései nem kerülnek bele automatikusan.
- Négy válasz véletlen sorrendben; kérdésismétlés nélkül, a rendelkezésre álló kérdésszámig.
- Egyéni mód a GitHub Pages-en. Többtelefonos mód a Node-szerveren: hatjegyű szobakód, meghívólink, 2–24 résztvevő, játékmester, közös határidő, körönkénti és végső ranglista.
- Feleletválasztás: helyes válasz 1000 pont, helytelen vagy kihagyott válasz 0. Számtipp: `round(1000 / (1 + abs(helyes - tipp)))`. Nincs gyorsasági bónusz.

## Szobás mód futtatása

Node.js 20 vagy újabb szükséges:

```sh
node tarsas/harry-potter/server.cjs
```

A teljes kvíz és a szobaszerver a `http://localhost:3000/` címen indul. Ugyanazon a Wi-Fi-n másik telefonról a gép helyi IP-címével nyissátok meg, például `http://192.168.1.20:3000/`. A tűzfalnak engednie kell a portot. A `PORT` változóval másik port állítható be.

Internetes játékhoz ezt a Node-folyamatot külön kell üzemeltetni HTTPS mögött, a statikus fájlokat és az `/api/` útvonalat **azonos eredeten** kiszolgálva. A szerver maga kiszolgálja a kvíz szükséges fájljait. Az oldal a saját `/api/health` végpontjából ismeri fel a szobás módot. GitHub Pages-en nincs szerverfuttatás: ott az egyéni mód látható, és a „Van játékszerver-címed?” mezővel a már működő HTTPS-szerverre lehet átlépni. A meghívót a szerveres oldalról kell megosztani.

Ez a változtatás **nem telepít szervert**, nem módosít DNS-t vagy hostingbeállítást. A meglévő társasjátékok CSP-jét sem módosítja; a kvíz saját CSP-je csak saját eredetű kapcsolatot enged.

## Szobák és adatkezelés

A nevek, válaszok és pontok a szerver memóriájában élnek. Két óra inaktivitás után, legkésőbb nyolc órával a létrehozás után a szoba lejár. Szerverújraindításkor minden szoba elveszik. Egyetlen szerverfolyamat használható; több példány közös tároló nélkül nem működik együtt.

A saját belépési token a böngészőlap `sessionStorage` tárában marad, így frissítés után a játék folytatódik. Új böngészőlap vagy másik eszköz új játékosnak számít. Elindult játékba új játékos nem léphet be. Kilépéskor a résztvevő helye a szobában megmarad: a nem válaszoló játékosra a többiek legfeljebb az időhatárig várnak. Ha a játékmester kilép, a következő kérdéshez új szoba szükséges; automatikus szerepátadás nincs.

A szerver ellenőrzi a jogosultságot, a kérdés sorszámát, a válasz típusát és a határidőt; az újraküldés nem ad újabb pontot. Az aktuális helyes választ csak a kör lezárásakor küldi el. Ez baráti társasjáték: az egyéni módhoz nyilvános kérdésadatbázis miatt nem alkalmas felügyelt vizsgának. Maximális kapacitás: 200 szoba, szobánként 24 fő; IP-nként percenként 3000 olvasás és 300 írás. Nem támaszkodik hamisítható `X-Forwarded-For` fejlécre; proxy mögött a korlát közös lehet.

## Ellenőrzés

```sh
npm run test:hp
npm run test:tarsas
```

A böngészős tesztek a repó meglévő Playwright-függőségét és Chromiumot használják. A `PW_CHROMIUM` változóval adható meg saját böngésző. A tesztek ellenőrzik a valódi kétböngészős játékot, az újratöltés utáni visszatérést, a mobilnézetet, a szövegek escape-elését, a bevitelt megőrző frissítést, a határidőt, a jogosultságokat, a pontozást és a statikus módot.
