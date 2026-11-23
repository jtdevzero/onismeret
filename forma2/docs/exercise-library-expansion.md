# Gyakorlattár-adatbővítés és edzésoldali hibajavítás — 2026-11-22

## Elkészült

- A meglévő 70 gyakorlat eredeti leírása és `reviewed: true` állapota változatlan.
- 15 gyakorlathoz külön, verziózott kiegészítő útmutató: előkészítés, két gyakori hiba, könnyítés, nehezítés, biztonsági szempontok.
- A gyakorlattári kereső a nevek mellett a meglévő leírásban, figyelmeztetésekben és a kiegészítő útmutató egyes mezőiben is keres.
- A kiegészítő adatfájl opcionálisan töltődik: régebbi/offline cache esetén nem akadályozza az alapképernyőt.
- Az edzésoldal kivételénél újrapróbálási lehetőség, adatmegőrzési tájékoztatás és hibakategória; a diagnosztika csak képernyőazonosítót és hibatípust rögzít, edzésadatot nem.
- Korábbi edzésnapló vagy program ismeretlen gyakorlat-azonosítója esetén két közvetlen névfeloldási hiba elhárítva.

## Szakmai státusz és korlátok

A korábbi `exercises.json` belső szakmai ellenőrzése megmaradt. Az új `exercise-guidance.json` **szerkesztői vázlat** (`editorial-draft`), nem független külső validáció, és külön belső szakmai felülvizsgálatot igényel. A szövegek nem diagnózisok. Az angol felülethez az új útmutató tartalmi szövegének külön fordítása még szükséges; a felületi címek fordítva vannak.

## Ellenőrzés

- `python3 forma2/build.py`: sikeres.
- `node --test --test-reporter=dot forma2/tests/*.test.mjs`: sikeres, 205 teszt.
- `node forma2/tests/browser.cjs`: nem futtatható, mert a `forma2/tests/browser.cjs` fájl ebben a munkafában nem található.
- Élő oldal: új tesztprofilnál a Program és egy rövid vezetett edzés betöltött; a felhasználó által jelzett konkrét hibát így nem sikerült reprodukálni. Az új változat nincs publikálva.
- Valós Android/iOS eszközös QA nem történt.

## Következő teendő

Kérni az érintett felhasználótól az edzésoldal útvonalát és a diagnosztikai hibakódot; régi mentéssel és offline PWA-val célzottan reprodukálni. Szakmai ellenőrzés után a kiegészítő útmutató felülvizsgálati állapotát külön rögzíteni; az angol tartalomfordítást elvégezni.
