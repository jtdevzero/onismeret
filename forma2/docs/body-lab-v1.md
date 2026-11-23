# BODY LAB v1 – 3D anatómiai atlasz (2026-11-23)

## Működik a fejlesztői ágon

- Új `#/bodylab` menüpont a **Több** oldalról és a gyakorlattárból.
- Öt választható oktatási réteg: izmok, ízületek, csontok, inak/szalagok és mozgásminták.
- 7 ízület, 6 csontterület, 4 kötőszöveti egység és 5 mozgásminta saját rövid, magyar nyelvű magyarázattal és a témánál kapcsolódó gyakorlatlinkekkel.
- Helyi Three.js 0.187.0 modul (MIT licenc), sematikus 3D testmodell: húzással forgatható, nagyítható, rétegenként kapcsolható; az egérrel kiválasztott terület az ismertetőre kapcsol.
- 3D-kontrollok 44px érintési mérettel, képernyőváltáskor WebGL-erőforrások felszabadítása, WebGL nélküli 2D nézet és szöveges gombok.
- Saját, generált naplementés BODY LAB hero kép `assets/body-lab-hero.webp` formában; a feliratokat HTML/CSS jeleníti meg.
- Az alapalkalmazás online szolgáltatás nélkül működik, az anatómiai tartalom helyi kód. A 3D könyvtár a service worker vendor-cache rétegében első használat után offline is elérhető. Friss, internet nélkül telepített kliensen az SVG/tartalmi nézet használható akkor is, ha a 3D modul még nem került a cache-be.

## Fontos korlátok

- **Nem kész** hiteles, részletes 3D anatómiai mesh, csontok/inak pontos geometriája, teljes csontváz-rig vagy biomechanikai szimuláció. A jelenlegi modell programból épített sematikus, stilizált 3D forma; nem használható diagnózishoz, sérülésbecsléshez vagy ízületi szögek pontos méréséhez.
- Három gyakorlatnak elkészült a **sematikus**, kétpózos Three.js demója; a további gyakorlatokhoz riggelt mozgássorozatok és referencia-videós ellenőrzés szükséges. A 101 gyakorlat animációját nem állítjuk késznek.
- A külön helyi fotónapló és két fotó összehasonlítása elkészült, de a fotók **nem részei** a standard backupnak, és a böngésző tárolóján túl külön titkosítással nem rendelkeznek. Lásd: `three-exercise-photo-v1.md`.
- Az atlasz új szerkesztői tartalma külön belső szakmai felülvizsgálatot igényel; a korábban ellenőrzött gyakorlatleírások változatlanok.
- A BODY LAB új anatómiai adatlapjainak teljes angol fordítása még nincs kész; a menücímek angol fordítása rendelkezésre áll.

## Ellenőrzés

- `python3 forma2/build.py`: sikeres.
- A tesztfuttatás frissebb állapotát lásd: `three-exercise-photo-v1.md`.
- `git diff --check`: tiszta.
- Chromium CLI valódi UI teszt nem futtatható, a helyi Chromium indító mögött hiányzik a bináris. Valós iOS/Android, WebGL GPU és kamera nem tesztelt, nem jelölhető sikeresnek.
- Publikáció nem történt; `forma/` érintetlen.

## Képgenerálási prompt (beépített generátor)

`Premium fitness web app BODY LAB hero artwork, luminous translucent anatomy-inspired athletic human silhouette, Miami sunset coral/magenta/turquoise on midnight plum, horizontal composition, dark left-side negative space for native HTML text, no embedded text, labels or logos. Decorative, not medically precise anatomy.`
