# FORMA 2 – öt vizuális fejlesztés (2026-11-23)

## Implementált elemek

1. **Interaktív, sematikus izomtérkép** – elülső/hátsó nézet, érintés és Enter/Space billentyűzet, kiválasztott terület szerint tényleges gyakorlattár-szűrés. A régi létrás gyakorlatok besorolását külön, változatlan forrásadatokat megőrző szabály kezeli. Ez **nem 3D anatómiai modell**, és nem mérés.
2. **Vizuális gyakorlattár** – kétoszlopos mobilkártyák (320px alatt egy), kategória- és izomcsoportadatokkal. Az összes 101 gyakorlat elérhető, a kedvencek és a saját edzés összeállítása megmaradt.
3. **Cinematic edzésképernyő** – meglévő naplementés színekre épülő, kiemelt edzésfókusz, nagy idő-/ismétlésszámmal, érintési vezérlőkkel. Meglévő állapot-, mentés- és navigációs logika változatlan.
4. **Fejlődési dashboard** – rögzített utolsó 30 nap edzésszáma, időtartama, sorozatszáma, illetve elmúlt 7 nap edzéseinek aránya a heti célhoz képest. Nincs új adatgyűjtés; részletes tábla/CSV továbbra is elérhető.
5. **Edzésvégi vizuális összefoglaló** – sikeres tartós mentés *után* jelenik meg, rövidített edzés megkülönböztetésével; a felhasználó a meglévő helyi megosztható fejlődési kártyához léphet tovább.

### Izomkalauz-bővítés (2026-11-23)

Az izomtérképen kiválasztott hét területhez magyar és angol nyelvű rövid guide került: izomterület szerepe, jellemző mozdulatok, gyakorlati tipp. A panel a választással együtt frissül, kizárólag általános edukációs leírást tartalmaz, nem diagnózis és nem személyre szabott gyógytorna.

## Korlátok

- Az izomtérkép **sematikus 2D**, nem precíz 3D anatómia, a színezés és a kapcsolatok szerkesztői besorolások, nem szenzoros vagy egészségügyi eredmények.
- A 101 gyakorlathoz korábban jelzett további tartalmi ellenőrzés és egyes új rekordok angol fordítása változatlanul hátravan.
- Az edzésvégi kártya a meglévő megosztási funkcióhoz navigál, nem készít automatikusan feltölthető személyesadat-képet.
- A naplózott tételszám nem feltétlenül egyedi gyakorlatot jelent; a UI ezt nem állítja.

## Ellenőrzés

- `python3 forma2/build.py` – sikeres.
- `node --test --test-reporter=dot forma2/tests/*.test.mjs` – sikeres, **209** automatizált teszt.
- Izomkalauz-bővítés után: **210** automatizált teszt sikeres.
- `git diff --check` – tiszta.
- Chromium CLI böngészős teszt: **nem végrehajtható**, a telepített indító mögött hiányzik a `/usr/lib/chromium/chromium` futtatható állomány. Ezért nem jelölünk sikeresnek böngészős/mobile2e tesztet.
- iOS/Android valós készülék, offline PWA és 200%-os betűméret: **nem tesztelt**.

## Publikáció

Nincs deploy. A FORMA 2 fejlesztői ágon kész; a jelenlegi élő FORMA és FORMA 2 felületet ez a commit még nem változtatja meg.
