# Étterembirodalom – fejlesztési terv v2

> **Utasítás a kódoló ágensnek:** Ez a dokumentum a specifikáció. Kizárólag az aktuális mérföldkövön dolgozz (először M1). A képletek és számok kötelezőek; minden hangolható érték a `balance.json`-ba kerüljön. Minden képlethez írj egységtesztet. Ha valami nem egyértelmű, kérdezz, ne találj ki saját logikát.

## Összefoglaló

Az Étterembirodalom négy mérföldkőben készül, és az első egy szűk, de teljes vertical slice. Ennek a célja annak bizonyítása, hogy a játék 20 perc után is szórakoztató, mielőtt a tartalom felskálázódik. Ha az M1 nem szórakoztató, a gazdasági modell változik, nem a tartalom mennyisége.

Változások a v1-hez képest:

- **Konkrét gazdasági és szimulációs képletek**, hogy a kódoló ágens ne találjon ki saját logikát.
- **Hírnévrendszer és rivális éttermek**, mert ezek adják a hosszú távú célt a szabad játékban.
- **Absztrakt háttérszimuláció** a nem látható éttermekre; teljes vendégszimuláció csak az aktív nézetben fut.
- **Konkrét technológia**: PixiJS a játéktérhez, React a panelekhez, IndexedDB a mentéshez.
- **Grafikai terv** placeholder → végleges asset útvonallal.
- **Mérhető elfogadási feltételek** minden mérföldkőhöz.

## Alapfeltevések és kivágások

Egyjátékos, offline, asztali böngészős játék készül, magyar felülettel, saját tartalommal és forintban számolt játékpénzzel.

| Benne van | Szándékosan kimarad (v1) |
| --- | --- |
| Rácsos építés, forgatás, útvonal-ellenőrzés | Romlandó készlet, raktárkezelés |
| Vendégkör: érkezés → ültetés → rendelés → evés → fizetés → értékelés | Műszakbeosztás, személyzeti fáradtság |
| Séf, pincér, takarító; bér, képzés, elbocsátás | Többjátékos mód, felhőmentés |
| 3 konyha, 18 recept (M3-tól) | Szimuláció bezárt böngésző mellett |
| Max. 3 étterem, 3 környék | Szabad kamerás 3D, valós idejű árnyékok |
| Hírnév és 2 AI rivális | Mobil- és érintésvezérlés |
| 5 kampányküldetés + szabad játék | Egyéni receptszerkesztő |

A szövegek kezdettől egy fordítási fájlban élnek (`hu.json`). Ez alig kerül többe, és később kinyitja az angol verziót.

## Technikai architektúra

A szimuláció tiszta, determinisztikus TypeScript-mag, ami semmit nem tud a megjelenítésről. A PixiJS és a React csak olvassa az állapotot, és parancsokat küld.

| Réteg | Döntés | Indok |
| --- | --- | --- |
| Build | Vite + TypeScript strict | Gyors fejlesztés, statikus kimenet |
| Szimuláció | Saját `sim/` modul, fix 100 ms-os tick, seedelt PRNG | Determinisztikus, tesztelhető, a gyorsítás csak több ticket futtat |
| Állapot | Egyetlen `GameState` objektum, immutábilis parancsokkal (`placeItem`, `hireStaff`, `setPrice`…) | Mentés = szerializálás, visszajátszható tesztek |
| Játéktér | PixiJS v8, izometrikus 2:1 rács, 64×32 px csempe | Kiforrott 2D WebGL, sprite-batching |
| UI | React + Zustand, a sim állapotára feliratkozva 4 Hz-en | A panelek nem lassítják a renderelést |
| Útvonalkeresés | A\* a rácson, gyorsítótárazott útvonalak, újraszámolás csak építéskor | 60 vendég alatt elhanyagolható költség |
| Mentés | IndexedDB (idb-keyval), verziózott séma + migrációk, Zod-validáció importnál | A localStorage 5 MB-os korlátja kevés lehet |
| Hang | Howler.js | Egyszerű, böngészőfüggetlen |
| Teszt | Vitest a magra, Playwright a fő folyamatra |  |

Időgyorsítás: 1×, 2×, 4×. Egy játéknap 8 perc valós idő 1×-en, 10:00–22:00 nyitvatartással. 4×-en a renderer kihagyhat animációs képkockákat, a sim ticket viszont soha.

Hosztolás: statikus build, kezdetben jelszóval védett, privát URL-en (GitHub Pages privát repóból vagy Netlify jelszavas oldal). A v1 „Sites-hosztingja” itt pontosítandó.

## Gazdasági és szimulációs modell

A vendégek számát a kereslet, a vendégek döntését a hasznosság, az eredményt az elégedettség és a hírnév zárt köre adja. Minden szám induló érték; egyensúlyozni a `balance.json` fájlban kell, nem kódban.

### 1. Kereslet (vendégérkezés óránként)

```latex
\lambda(t) = B_{k} \cdot N(t) \cdot H_f \cdot M_f \cdot R_{share}
```

- B\_k: a környék alapforgalma (vendég/óra), lásd a környéktáblát.
- N(t): napszakszorzó; 10–12 óra: 0,4, 12–14 óra: 1,6, 14–18 óra: 0,6, 18–21 óra: 1,8, 21–22 óra: 0,5.
- H\_f = 0,5 + 0,2 × H, ahol H a hírnév 0–5 csillagon. Így a szorzó 0,5 és 1,5 között mozog.
- M\_f = 1 + 0,25 × ln(1 + napi marketing / 10 000 Ft), legfeljebb 1,6. A csökkenő hozam miatt a marketing nem végtelen pénzgép.
- R\_share: a játékos piaci részesedése a riválisokkal szemben (5. pont).

Az érkezés Poisson-folyamat; a csoportméret 1–4 fő (súlyok: 20%, 45%, 20%, 15%).

### 2. Ételválasztás

A vendég az étlapról a legnagyobb hasznosságú ételt választja:

```latex
U_i = 0{,}6 \cdot Q_i - 0{,}4 \cdot \frac{P_i}{P_{ref,k}} + K_{i,k} + \varepsilon
```

- Q\_i: az étel minősége (0–1, lásd lent), P\_i: eladási ár, P\_ref,k: a környék referenciaára az adott ételkategóriára.
- K\_i,k: konyha-preferencia bónusz (+0,1, ha a környék kedvenc konyhájáról van szó), ε: kis zaj (±0,05).
- Ha minden U\_i < 0, a vendég rendelés nélkül távozik („túl drága”). Ez a magas ár látható következménye.

```latex
Q_i = 0{,}35 \cdot \frac{L_i}{5} + 0{,}35 \cdot A_q + 0{,}30 \cdot \frac{S_{chef}}{100}
```

L\_i: a recept szintje (1–5), A\_q: alapanyagminőség (olcsó 0,4 · normál 0,7 · prémium 1,0), S\_chef: a séf képessége (0–100).

### 3. Kiszolgálási idők és türelem

| Lépés | Alapidő (játékperc) | Képességszorzó | Türelem (játékperc) |
| --- | --- | --- | --- |
| Ültetés | 1 | — | 8 |
| Rendelés felvétele | 2 | 1,5 − S\_pincér/100 | 10 |
| Főzés | recept szerint 8–20 | 1,5 − S\_séf/100 | 30 |
| Felszolgálás | 1 | 1,5 − S\_pincér/100 | — |
| Evés | 15–25 | — | — |
| Fizetés | 2 | 1,5 − S\_pincér/100 | 8 |

Türelem túllépésekor a vendég távozik, nem fizet, és 1 csillagos értékelést hagy. Egy séf egyszerre 2 ételt főz egy konyhai állomáson; egy pincér egyszerre egy feladatot végez.

### 4. Elégedettség és hírnév

```latex
S = 35 \cdot Q + 20 \cdot \left(1 - \frac{W}{W_{max}}\right) + 15 \cdot C + 15 \cdot V + 15 \cdot D
```

- W/W\_max: a teljes várakozás aránya a türelemkerethez; C: tisztaság (0–1); V: ár-érték = min(1, Q × P\_ref / P); D: dekor- és hangulatpontszám (0–1, a berendezés értékéből és sűrűségéből).
- Értékelés csillagban: S / 20.
- Hírnév-frissítés vendégenként: H ← H + 0,02 × (csillag − H). Egy rossz nap tehát érezhető, de nem végzetes.
- Tisztaság: vendégenként −0,5%, takarító percenként +4%. 60% alatt a D tényező a felére esik.

### 5. Riválisok és piaci részesedés

Környékenként két AI rivális fix hírnévvel és árszinttel működik. A játékos részesedése:

```latex
R_{share} = \frac{e^{\bar{U}_{j}}}{e^{\bar{U}_{j}} + \sum_{r} e^{\bar{U}_{r}}} \cdot (1 + n_{rivális})
```

Ū az átlagos hasznosság az ételkínálaton és a hírnéven. A riválisok hetente kis mértékben reagálnak: árat csökkentenek, ha a játékos részesedése 50% fölé megy.

### 6. Költségek és pénzügy

| Tétel | Induló érték |
| --- | --- |
| Kezdőtőke | 3 000 000 Ft |
| Bérleti díj | 40 000–120 000 Ft/nap, környéktől függően |
| Bérek | pincér 18 000 · séf 28 000 · takarító 14 000 Ft/nap; képességenként +0,3% / pont |
| Képzés | 80 000 Ft, +10 képességpont, 1 napig kiesik |
| Alapanyag | recept alapköltsége × 0,7 / 1,0 / 1,5 (olcsó / normál / prémium) |
| Karbantartás | a berendezés értékének 0,2%-a naponta |
| Új étterem nyitása | 2–6 millió Ft + berendezés |

Napi eredmény = bevétel − (alapanyag + bérek + bérleti díj + marketing + karbantartás). Fizetésképtelenség: 3 egymást követő napzárás negatív pénzegyenleggel.

### 7. Környékek

| Környék | B\_k (vendég/óra) | Referenciaár szorzó | Kedvenc konyha | Bérleti díj/nap |
| --- | --- | --- | --- | --- |
| Külvárosi lakónegyed | 14 | 0,8 | magyar | 40 000 Ft |
| Egyetemi negyed | 22 | 0,9 | olasz | 65 000 Ft |
| Belvárosi sétálóutca | 30 | 1,4 | francia | 120 000 Ft |

### 8. Háttéréttermek

A nem látható étterem nem futtat vendégszimulációt. Óránként egyszer számol:

- várható vendégszám = λ × min(1, kapacitás / igény) × személyzeti lefedettség;
- bevétel = vendégszám × átlagos számla az étlap választási valószínűségeiből;
- elégedettség és hírnév ugyanazokkal a képletekkel, várható értékekkel.

Amikor a játékos átvált rá, az étterem a számolt állapotból indul, üres asztalokkal.

## Grafika és hang

M1 és M2 kizárólag placeholder grafikával készül; a végleges stílus csak a játékmenet jóváhagyása után kerül be. Így a grafika nem viszi el az időt egy még nem bizonyított játékról.

**Stílusdöntés:** lapos, „low-poly-hatású” izometrikus 2D, korlátozott palettával. Ez generálható és utómunkával egységesíthető, ellentétben a festett, részletgazdag stílussal.

| Asset-csoport | Darab (becslés) | Placeholder (M1–M2) | Végleges (M4) |
| --- | --- | --- | --- |
| Padló és fal csempék | 12 | Színezett rombuszok | Generált + kézi egységesítés |
| Bútorok (asztal, szék, pult) | 15 × 2 irány | Egyszerű dobozok | Generált sprite-ok, 2 irányban tükrözve |
| Konyhai állomások | 6 | Ikonos dobozok | Generált sprite-ok |
| Dekoráció | 20 | — | Generált sprite-ok |
| Vendégek | 6 típus × 4 irány × 4 animáció (sétál, ül, eszik, távozik) | Színes kapszulák | Moduláris karakter: fej, test, szín cserélhető |
| Személyzet | 3 típus × 4 irány × 3 animáció | Színes kapszulák | Ugyanaz a moduláris rendszer |
| Ételek ikonjai | 18 | Emoji / betű | Generált ikonok |
| UI | panelek, gombok | Alap React-komponensek | Egységes UI-kit |

A karakterek moduláris felépítése a legfontosabb költségcsökkentés: kb. 10 alap testpóz × cserélhető színek adja a változatosságot, nem 100+ egyedi sprite.

**Hang (M4):** 1 háttérzene-hurok környékenként, kb. 15 UI- és játékhang (fizetés, rendelés, távozás, hibajelzés). Jogtiszta könyvtárból vagy generálva.

## Mérföldkövek

Minden mérföldkő végén kapu van: a következő csak akkor indul, ha az előző minden elfogadási feltétele teljesül.

```
M1 Vertical slice ──► [Kapu 1: 2/3 tesztelő folytatja] ──► M2 Gazdaság, bővülés ──► [Kapu 2: háttér-sim ±10%-on belül] ──► M3 Tartalom, kampány ──► [Kapu 3: 5 küldetés teljesíthető] ──► M4 Látvány, kiadás
```

Az M1 a legfontosabb kapu: itt dől el, hogy érdemes-e tartalmat gyártani.

### M1 – Vertical slice: egy működő étterem

Tartalom: 1 étterem (egyetemi negyed), 1 konyha (olasz), 5 recept, 1 szint; séf és pincér felvétele; asztal, szék, főzőállomás, pult; teljes vendégkör; napi eredménykimutatás; szünet, 1×, 2×, 4×; placeholder grafika; IndexedDB-mentés.

- [ ] Egy játéknap 1×-en 8 percig tart, 4×-en 2 percig, és a napi eredmény mindkét sebességen bitre azonos ugyanazzal a seeddel.
- [ ] Optimális beállítással (6 asztal, 1 séf, 2 pincér, referenciaár) az 1. nap nyereséges: +40 000 és +120 000 Ft között.
- [ ] Egyetlen pincérrel 10 asztalnál a vendégek legalább 25%-a türelemvesztés miatt távozik.
- [ ] A referenciaár 2,5-szeresén a vendégek legalább 60%-a rendelés nélkül távozik.
- [ ] Elzárt útvonalú asztalt nem lehet lerakni; a hibaüzenet megmondja, miért.
- [ ] 40 egyidejű vendégnél a játék legalább 55 FPS-sel fut egy átlagos laptopon.
- [ ] **Kapu:** 3 külső tesztelő közül legalább 2 önként folytatja 20 perc után.

### M2 – Gazdaság, személyzet, terjeszkedés

Tartalom: takarító és tisztaság; képzés, elbocsátás; alapanyagminőség; marketing; hírnév; 2 rivális környékenként; mindhárom környék; max. 3 étterem; absztrakt háttérszimuláció; birodalom-áttekintő panel.

- [ ] A birodalom összesített napi eredménye fillérre egyezik az éttermek eredményeinek összegével (automata teszt 100 seedre).
- [ ] Háttérbe tett étterem 10 napos eredménye legfeljebb ±10%-kal tér el a teljes szimulációtól ugyanazon a beállításon.
- [ ] Takarító nélkül a tisztaság egy nap alatt 60% alá esik, és az elégedettség mérhetően csökken.
- [ ] Prémium alapanyag és 5-ös recept mellett a hírnév 10 játéknap alatt legalább 1 csillagot emelkedik.
- [ ] 3 egymást követő negatív napzárás után megjelenik a fizetésképtelenségi képernyő a mentés betöltésének lehetőségével.

### M3 – Tartalom és kampány

Tartalom: magyar és francia konyha; összesen 18 recept, 5 szinttel; receptfejlesztés; 5 kampányküldetés oktatással; szabad játék induló beállításokkal.

| # | Küldetés | Megtanítja | Győzelmi feltétel |
| --- | --- | --- | --- |
| 1 | Első vendégek | Építés, vendégkör | 5 nap alatt 50 elégedett vendég (≥ 3 csillag) |
| 2 | Pénz beszél | Árazás, költségek | 7 nap alatt 300 000 Ft összesített nyereség |
| 3 | Jó hírnév | Minőség, tisztaság, személyzet | 3,5 csillagos hírnév 10 napon belül |
| 4 | A séf titka | Receptfejlesztés | 3 recept 4-es szintre fejlesztve, nyereséges nappal |
| 5 | Birodalom | Terjeszkedés, háttérszimuláció | 3 nyereséges étterem egyszerre, 30 napon belül |

- [ ] Mind az 5 küldetés teljesíthető egy előre rögzített „ideális” parancssorozattal (automata teszt).
- [ ] Egy új tesztelő segítség nélkül teljesíti az 1. és 2. küldetést.
- [ ] A szabad játék a kampánytól függetlenül indítható és menthető.

### M4 – Látvány, hang, egyensúly, kiadás

Tartalom: végleges grafika és animációk; hangok; egyensúlyozás; export és import; hibakezelés; privát hosztolás.

- [ ] Exportálás, majd importálás után az állapot mélyen egyezik az eredetivel (automata teszt).
- [ ] Sérült, hiányos vagy újabb verziójú mentés importja érthető magyar hibaüzenetet ad, és nem írja felül az aktuális játékot.
- [ ] Böngésző-újratöltés után a játék az utolsó automatikus mentésből folytatódik (percenként + napzáráskor).
- [ ] 5 tesztelő átlagos teljes kampányideje 3–5 óra között van.

## Tesztelés és kockázatok

A determinisztikus mag miatt a játékszabályok többsége böngésző nélkül, gyors egységtesztekkel ellenőrizhető.

**Automata tesztek (Vitest):**

- Pénzmozgás: minden tranzakció könyvelve, a napi és birodalmi összeg egyezik.
- Determinizmus: azonos seed + parancssor → azonos állapot 1×-en és 4×-en.
- Útvonal: minden lerakott asztal elérhető a bejárattól és a konyhától.
- Küldetések: rögzített parancssorral mind az 5 teljesíthető.
- Mentés: szerializálás → visszatöltés → mély egyezés; migráció minden korábbi sémaverzióról.
- Egyensúly-regresszió: 30 napos szimuláció 3 előre rögzített stratégiával; a nyereség sávon kívül esése hibának számít.

**Böngészős teszt (Playwright):** új játék → 6 asztal lerakása → séf és pincér felvétele → 1 nap 4×-en → nyereséges napzárás látható.

| Kockázat | Valószínűség | Hatás | Kezelés |
| --- | --- | --- | --- |
| A játék nem szórakoztató | Közepes | Nagyon nagy | M1-kapu külső tesztelőkkel, mielőtt tartalom készül |
| A grafika szétfeszíti az időt | Magas | Nagy | Placeholder M3 végéig, moduláris karakterek, egységes palettájú generálás |
| Egyensúlyozatlan gazdaság | Magas | Közepes | Minden szám a `balance.json`-ban, regressziós szimulációk |
| Teljesítmény sok vendégnél | Alacsony | Közepes | Absztrakt háttérszimuláció, útvonal-gyorsítótár, sprite-batching |
| Mentés elvesztése | Alacsony | Nagy | Napi 3 rotáló automatikus mentés + kézi export |
| A kódoló ágens eltér a modelltől | Közepes | Közepes | Ez a dokumentum a specifikáció; minden képlethez egységteszt |

Nyitott kérdés: hol fut a végleges privát hosztolás, és kik a külső tesztelők az M1-kapuhoz.
