# FORMA 2 ULTIMATE – külön tesztalkalmazás

A `forma2/` önálló, magyar nyelvű, offline-first PWA, saját belépési ponttal,
manifesttel, Service Workerrel és IndexedDB-adatbázissal. Nem az éles `forma/`
oldalba ágyazott demó: a teljes alkalmazásmodul-készlet és a szükséges adatok
helyi másolatát tartalmazza.

**Elkülönítés:** az előnézet adattára `forma2-preview`; a Service Worker csak a
`forma2/` útvonalról regisztrálódik, a cache-ei `forma2-` előtagúak. Az eredeti
FORMA korábbi edzéseit nem importálja automatikusan. Az előnézet és az éles
alkalmazás adatai külön maradnak. A felhasználó saját fájlból történő
visszatöltése külön, kifejezett művelet.

## Fejlesztés és ellenőrzés

```sh
python3 forma2/build.py
node --test forma2/tests/*.test.mjs
```

A `src/shell.html`, a `js/` modulok, `styles.css`, `data/` és az eszközök a
források; az `index.html` és `sw.js` generált fájlok. A generáló kizárólag a
`forma2/` mappában ír. A kamera-modell a hálózatról az első kamerahasználatkor
töltődik le, utána kerülhet helyi cache-be. A kamerás mérés béta, nem klinikai
vagy igazolt biomechanikai pontosságú.

## Integrált fejlesztési kör

- személyre szabható kezdőlap és kártyasorrend, gyorsműveletek, utolsó edzés;
- OLED és kompakt megjelenítés, mobilos stílusfinomítás;
- edzés közbeni gyorsbeviteli mezők és fejlődési rövidítések;
- mentés-export konzisztens adatpillanatképből, beállítások és haladás megőrzése;
- önálló, verziózott offline alkalmazáscache és frissítési folyamat.
- biztonságos aszinkron navigáció: egy későn betöltődő régi képernyő
  erőforrásai nem maradnak az új képernyőn, és a takarítási hibák izoláltak.
- pihenőidő ±15 másodperces módosítása nagy mobilos vezérlőkkel; a módosított
  időre újraindított, háttérbe kerüléskor is valós időhöz igazított számláló;
- késve érkező képernyő-ébrentartási engedély felszabadítása navigáció után;
- fájlos mentési és megosztási hiba esetén figyelmeztetés; sikertelen mentés
  után nem tűnik el a mentési emlékeztető.

## QA és kiadás

2026-11-22: a FORMA 2-be átvezetett Node tesztkészlet a navigációs
versenyhelyzetek három célzott tesztjével bővült;
ezt pihenőidő-határérték teszt követi. A 7/30/90 napos analitika, a
szöveges táblázatok és a CSV-export már korábban léteztek, nem kerültek
újraimplementálásra.
`python3 forma2/build.py` sikeres. A tesztek ellenőrzik az offline csomag
fájljainak létezését és a tárolók izolációját. **Valódi Android/iOS eszközös
QA, kamerás videóvalidáció és telepített offline PWA-próba itt nem történt.**
A kód fejlesztői ágon készült; publikálás vagy `main` merge csak külön
jóváhagyással történhet.

## Következő 40 fejlesztés

A [40 pontos státuszlista](docs/upgrade-40.md) szerint 24 kisebb fejlesztés
helyben beépült az analitika, regeneráció és mobilos hozzáférhetőség területén;
a további 16 feladat még hátravan, több közülük valós eszközös QA-t igényel.
