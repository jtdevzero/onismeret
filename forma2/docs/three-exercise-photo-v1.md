# FORMA 2 – Three.js gyakorlatdemók és helyi fotónapló (2026-11-23)

## Megvalósult

### BODY LAB

- Three.js `0.187.0` MIT licencű csomag két lokális ESM-modullal a `vendor/three/` alatt, CDN/API nélkül.
- Forgatható, nagyítható sematikus 3D testmodell, öt váltható témaréteggel és szöveges/tap-pontos navigációval.
- Saját generált, 72 KB körüli `assets/body-lab-hero.webp` illusztráció, az app eredeti Miami-naplementés színvilágához igazítva.
- Offline alapműködés: a 2D és a szöveges tartalom a PWA shell része, a Three.js vendorfájlok első online használat után kerülnek külön cache-be.

### 3D gyakorlatdemók

- **Guggolás**, **fekvőtámasz**, **csípőemelés**: külön kétpózos sematikus Three.js bemutató a meglévő gyakorlatadatlapon.
- Lejátszás/szünet, fáziscsúszka, nézetforgatás; háttérbe kerüléskor leáll, reduced-motion módban a csúszka marad.
- Nem bizonyított biomechanikai vagy klinikai animáció. A mozdulat fázisai vizuális magyarázatok, nem felhasználói technikaminősítés. Más gyakorlatokhoz nem mutatunk félrevezető, általános 3D animációt.

### Vizuális fotónapló

- Külön `#/photos` képernyő a Több menüben; a fotózást/fájlválasztást a felhasználó indítja.
- Csak JPEG/PNG/WebP, legfeljebb 12 MB bemenet; legfeljebb 1280px hosszabb éllel JPEG-re visszakódolva, amely nem másolja át az EXIF helymetaadatot.
- Külön `forma2-private-photos` IndexedDB, **nem** a szokásos `items` vagy `kv` tároló. A standard program-export/import nem nyúl hozzá. Egyedi fotóletöltés és végleges, megerősített törlés. Két eltérő időpont képei egymás mellé helyezhetők, manuálisan választható időpontokkal és kizárólag helyi objektum-URL-ekkel.
- Nem történik AI-testzsírbecslés, arcszkennelés, automatikus adatfeltöltés, kamera-hozzáférés az oldal megnyitásakor.

## Kötelező QA és adatvédelmi figyelmeztetés

- A külön fotóadatbázis **nem része** a szokásos FORMA biztonsági mentésnek. Telefoncsere, böngészőadat-törlés vagy új eszköz előtt a felhasználó egyedileg töltheti le a képeit. Az app ezt jól láthatóan jelzi.
- Nincs titkosítás a böngésző IndexedDB rétege fölött; a készülék és böngésző saját védelme érvényes. Nem szabad végpontok közötti titkosításként bemutatni.
- Az új anatómiai adatok és a 3D pózdemók külön belső szakmai felülvizsgálatra várnak. A korábbi `reviewed:true` jelzéseket nem módosítottuk.
- A 101 gyakorlathoz **3** új Three.js demó létezik, nem teljes 3D mozgáskönyvtár.

## Teszt

- `python3 forma2/build.py`: sikeres.
- `node --test --test-reporter=dot forma2/tests/*.test.mjs`: sikeres, **214** teszt.
- `node --check` az új UI-modulokra: sikeres.
- `git diff --check`: sikeres.
- A teljes tesztfutásból 0 hiba, 0 kihagyott teszt. Az új képernyők élő DOM-/WebGL-viselkedését ezek a tesztek nem igazolják.
- Valós WebGL GPU-teszt, fotó mentés-visszatöltés Safari-ban, offline PWA és iPhone kamera: **nem futtattuk**.
- Az éles `/forma/` és a külön tesztoldal publikált állapota változatlan.

## Következő konkrét fejlesztések

1. Mobilos WebGL/iOS-Safari teszt, GPU-erőforráskorlátok.
2. A mozgásrig strukturált bővítése és szakmai referencia-videós ellenőrzés (ezután lehet további gyakorlatokat bevonni).
3. Fotós napló eszközváltás előtti külön, ellenőrzött mentési/visszaállítási UX; a jelenlegi egyedi letöltés nem helyettesíti a teljes biztonsági mentést.
4. Fotók opcionális, titkosított, felhasználó által indított külön backup formátuma – csak alapos biztonsági tervezés után.

## Ellenőrzött korlátok és kiadási döntés

- **Kiadásjelölt, nem élesítésre kész**: Chromium nem futtatható ezen a tesztgépen (a `/usr/bin/chromium` indító megvan, a valódi `/usr/lib/chromium/chromium` bináris hiányzik). iOS Safari, Android Chrome, kamera, valós mozgásfelvétel és WebGL-vezérlők tényleges mobilos QA-ja nyitott.
- A 3D-s mozgás három kézzel paraméterezett oktatási pózpár interpolációja. Nem végeztünk személyi edzői kontrollvideós, független biomechanikai vagy klinikai mérést. Sematikus demonstrációként kezelendő.
- A szöveges, 2D-s atlasz és gyakorlatadatlap marad a hozzáférhető, WebGL nélküli alternatíva. A 3D vendorfájl első használatának cache-sikerét valós offline böngészőben még ellenőrizni kell.
- U2: eszközön végzett 320–430px, fekvő, tablet, 200% betűméret és reduced-motion ellenőrzés; fotómentési kvótahiba/Safari IndexedDB-teszt; 3 mozgás szakmai referencia-videóval történő ellenőrzése.
- U3: riggelt GLB animációk további gyakorlatokra csak vizuális/szakmai ellenőrzés után; egyenként exportálható mellett opcionális biztonságos fotó-archívum; angolra lefordítandó anatómiai szerkesztői szövegek.
