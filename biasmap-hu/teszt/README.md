# BiasMap HU – elkülönített tesztoldal

Publikus útvonal: https://jtdevzero.github.io/onismeret/biasmap-hu/teszt/

Ez a tesztoldal **nem** helyettesíti az éles `biasmap-hu/` alkalmazást. A teszt HTML külön fájl, a meglévő 54 jelenetet és betűtípusokat a szülőmappából használja (`../scenes/`, `../fonts/`); az új húsz jelenet a `teszt/scenes/batch-01.js` csomagban van.

Fejlesztési szabály: az új animációk, UX-kísérletek és dizájnváltozatok először csak itt jelennek meg. Az éles oldalra történő átvételhez külön felhasználói jóváhagyás kell.

Ellenőrzés a repository gyökeréből:

```sh
node biasmap-hu/teszt/verify.cjs
```

Első kiadás: 20 új magyar animáció, összesen 46 torzításanimáció.

Második animációcsomag (fejlesztés alatt): a fennmaradó 142 egyedi fogalomhoz adatvezérelt,
négyfelvonásos magyar jelenet a `scenes/remaining.js` fájlban. A jelenetek a fogalom saját,
már meglévő magyar példáját, leírását, felismerési kérdését és gyakorlati tanácsát használják,
nyolc konzisztens vektoros mozgásséma segítségével. **Ezek nem egyedileg rajzolt 142 külön illusztráció:**
az egyedi tartalom és a vizuális sémák újrafelhasználása tudatos megoldás.

Az eredmény 188 egyedi torzításanimáció, továbbá változatlanul 20 csoport- és 8 szokásanimáció:
összesen 216 videójelölés a tesztoldalon. Az éles változat nem veszi át őket automatikusan.
