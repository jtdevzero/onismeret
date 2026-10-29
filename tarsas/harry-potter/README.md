# Harry Potter-kvíz — egyéni és közös próbatétel

Magyar nyelvű kvíz a nyolc film alapján, 40 saját megfogalmazású kérdéssel és nyolc saját SVG-illusztrációval. A felület közvetlenül a GitHub Pages-en fut, a Társasest kezdőlapjáról is megnyitható.

Útvonal: `tarsas/harry-potter/`.

## Egyéni játék

Az **Egyedül** mód teljesen a böngészőben működik. Nem kér szervert, bejelentkezést vagy szobakódot, és nem küldi el a válaszaidat. A Társasest offline csomagjának első sikeres letöltése után internet nélkül is megnyitható. Frissítéskor az egyéni játék újraindul.

Filmeken, kérdéstípuson, kérdésszámon és időkorláton lehet szűrni. Feleletválasztós, képes és számtippelős kérdések követik egymást, véletlen kérdés- és válaszsorrendben, ismétlés nélkül.

## Közös játék saját telefonokról

1. Válaszd a **Közös játék** módot, add meg a nevedet és a kérdések beállításait, majd hozz létre egy szobát.
2. Oszd meg a nyolc karakteres szobakódot vagy a **Meghívólink másolása** gombbal a hivatkozást.
3. A többiek megadják a nevüket és a kódot, vagy megnyitják a meghívólinket. Egy szobában 2–8 játékos lehet.
4. A házigazda elindítja a játékot. Mindenki ugyanazt a kérdést látja, és a saját telefonján válaszol.
5. Ha mindenki válaszolt vagy lejárt az idő, megjelenik a megfejtés és az eredménytábla. A házigazda is lezárhatja a kérdést, majd továbblépteti a közös játékot.

A közös mód internetet használ, regisztráció és ChatGPT-fiók nélkül. A felület a beállított felhős háttérrel kommunikál; a játékosnak nem kell szervert indítania vagy címet megadnia. A kérdések sorrendjét, az időkorlátot és a pontokat a szerver kezeli. A szoba 24 óráig él. A szobakód a csatlakozáshoz kell, nem belépési jelszó.

A saját csatlakozást a böngésző a `hp.online.session` kulcs alatt tárolja, így oldalfrissítés után a közös játék folytatható. A résztvevő hozzáférési tokenje nem szerepel a meghívólinkben. A **Kilépés** ezen az eszközön törli a mentett csatlakozást; a többiek szobája megmarad. Lejárt vagy elveszett hozzáférés után új szoba indítható. Hálózatkimaradásnál a felület újracsatlakozik; az addig sikeresen beküldött válasz megmarad. A szobakód ismeretében a várakozó szobához bárki csatlakozhat, ezért a meghívót a játékostársakkal osszátok meg.

## Pontozás

- Helyes felelet: **1000 pont**.
- Számtipp: `round(1000 / (1 + abs(helyes - tipp)))`.
- Kihagyás vagy beküldött válasz nélkül lejárt kör: **0 pont**.
- Nincs gyorsasági bónusz.

## Fejlesztés és ellenőrzés

A böngészős felületnek nincs telepítendő függősége. A `hp-api-origin` metaadat a felhős háttér originjét adja meg; a CSP csak ezt a konkrét külső origint engedélyezi. A token a `X-HP-Token` kérésfejlécben megy, nem URL-ben. Az egyéni mód új böngészőben nem kérdez le közösjáték-API-t.

Ellenőrzés: `npm run test:hp`. A tesztek a repó meglévő Playwright-függőségét használják. Saját Chromium útvonala: `PW_CHROMIUM`.
