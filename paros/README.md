# Páros est

Önálló, két játékosra tervezett statikus alkalmazás az `onismeret/paros/` könyvtárban.

Játékok: Közelebb hozzád, Flörtradar, Igazság vagy kihívás (18+), Igen, nem, talán (18+), Szexről őszintén (18+), Mennyire ismersz?, Emlékösvény, Jövőnk mozaikja, Közös bakancslista

- A válaszok kizárólag memóriában élnek; újratöltés vagy körtörlés után elvesznek. Háttérbe kerüléskor fedőképernyő takarja a játékot.
- Az Igen, nem, talán eredménye csak a két igen találkozásait tartalmazza; az egyéni válaszokat az összevetés után töröljük a kör állapotából.
- A `localStorage` kizárólag a két nevet tárolja, külön `paros.preferences.v1` kulcs alatt. A 18+ megerősítés újratöltéskor megszűnik.
- Saját manifest és `/paros/` hatókörű service worker; a `paros-` gyorsítótárak elkülönülnek a Társasest és az önismereti oldalak gyorsítótáraitól.
- Nincs külső függőség, analitika vagy szerverre küldött válasz.

Fejlesztés: a könyvtár közvetlenül szerkeszthető, nincs generált alkalmazáskód. Helyi kiszolgálás a repó gyökeréből: `python3 -m http.server 8000`, majd `http://localhost:8000/paros/`.

Teszt: a repó gyökeréből `npm run test:paros`. A meglévő Playwright-függőséget használja. Rendszer Chromium választható a `PW_CHROMIUM` környezeti változóval.

Az alkalmazás kártyái eredeti magyar megfogalmazások. A szexuális témájú csomag kapcsolati kommunikációt segít; a kihívások és kérdések minden esetben passzolhatók.

A körhossz beszélgetős játékoknál és kihívásoknál 6/12/24 kártya; titkos válaszadásnál 4/8/12 kérdés fejenként. A kezdőlap beszélgetős, titkos választós és 18+ játékokra szűrhető.

Négy extra 18+ csomag: Kémia (Flörtradar), Flört és szikra (Igazság vagy kihívás), Vágyak–közös igenek (Igen, nem, talán), Intimitásról nyíltan (Szexről őszintén). Összesen 120 új elem; a teljes készlet 396 elem. A csomagválasztás körönként változtatható; az újraindítás megtartja a csomagot és a körhosszt. A Flörtradar alapcsomagja nem 18+, a Kémia csomag külön megerősítést kér. A 18+ kikapcsolása minden felnőtt csomag aktuális válaszait is törli.
