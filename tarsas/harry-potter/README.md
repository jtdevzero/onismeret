# Harry Potter-kvíz — egyéni változat

Statikus, magyar nyelvű kvíz, közvetlenül a GitHub Pages-en fut. Nincs hozzá szerver, API, bejelentkezés vagy szobakód.

Útvonal: `tarsas/harry-potter/`. A Társasest kezdőlapjáról is megnyitható.

- Nyolc filmrészenként válogatható, 40 saját megfogalmazású kérdés.
- Feleletválasztós, képes és számtippelős mód; nyolc saját SVG-illusztráció.
- Véletlen kérdés- és válaszsorrend, ismétlés nélkül.
- Állítható időkorlát, automatikus pontozás és végső eredmény.
- Helyes felelet: 1000 pont. Számtipp: `round(1000 / (1 + abs(helyes - tipp)))`. Kihagyás: 0 pont.
- Frissítéskor új játék indul. A válaszokat nem küldi el sehova.
- A Társasest offline csomagjának első sikeres letöltése után az egyéni kvíz internet nélkül is megnyitható.

Ellenőrzés: `npm run test:hp`. A tesztek a repó meglévő Playwright-függőségét használják. Saját Chromium útvonala: `PW_CHROMIUM`.
