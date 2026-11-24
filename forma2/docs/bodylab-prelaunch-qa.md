# FORMA 2 – BODY LAB nagyobb publikálás előtti QA

Állapot: **2026-11-24, fejlesztői ág, még nincs publikálva.**

## Automatizált ellenőrzések

| Ellenőrzés | Státusz | Bizonyíték |
| --- | --- | --- |
| `python3 forma2/build.py` | sikeres | Generált `forma2/sw.js` frissült |
| `node --test forma2/tests/*.test.mjs` | 245/245 sikeres | Test runner összesítő, 2026-11-24; teljesítmény-stressztesztekkel |
| `node --check` az érintett UI-modulokra | sikeres | Külön szintaxisellenőrzés |
| `git diff --check` | sikeres | Nincs whitespace/patch hiba |
| Helyi Chromium képernyőkép | **blokkolt** | Playwright Chromium: `socket() failed: Operation not permitted` |
| Fizikai iOS/Android QA | **nem futott** | Nincs eszközös mérési jegyzőkönyv |

## Kötelező vizuális és funkcionális mátrix – nyitott

Az alábbiak **nem sikeres tesztek**, hanem későbbi kézi tesztforgatókönyvek.

| Nézet / környezet | Elvárt eredmény | Állapot |
| --- | --- | --- |
| 320 × 568 | Nincs vízszintes oldal-görgetés; 2D rétegek és gombok elférnek | nem futott |
| 375 × 812 | Izomterület-gyorssáv kézzel görgethető, legalább 44 px-es gombok | nem futott |
| 390 × 844 | Elöl/hátul mód és kijelölt terület jól olvasható | nem futott |
| 430 × 932 | 3D kereső és részletpanel nem fed át más vezérlőt | nem futott |
| Fekvő mobil / tablet | SVG, részletpanel és lapozás nem vágódik le | nem futott |
| 200% betűméret | Magyar szövegek, CTA-k és nézetgombok nem csúsznak egymásra | nem futott |
| Light / dark | Következetes kontraszt és jól látható fókuszkeret | nem futott |
| Reduced motion | Nincs szükségtelen animáció, minden interakció működik | nem futott |
| Android Chrome | Valódi GLB betöltés, kijelölés, izolálás, memóriafelszabadítás | nem futott |
| iOS Safari / WebKit | WebGL-visszaállás, kétujjas nagyítás, navigáció utáni cleanup | nem futott |
| Offline PWA | Betöltött SVG, kereső, magyar magyarázat és ikonok hálózat nélkül | nem futott |

## Adatvédelem és forrásállapot

- A v5.1 és v5.2 csak megjelenítést, helyi szövegeket és regionális szűrést módosít; nem hoz létre új személyes adatmezőt, felhőkapcsolatot vagy fotófeltöltést.
- A 2D útvonalak **sematikus illusztrációk**, az Écorché GLB névmegfeleltetése és a mozgásanimációk továbbra sem tekinthetők független biomechanikai validációnak.
- Az offline cache verziója a build során változik; a meglévő IndexedDB edzés- és fotóadatokat a fejlesztés nem migrálja és nem törli.
- A publikált `forma/` alkalmazáshoz nem tartozik változtatás.

## Nagy kiadás kapui

1. A fenti mobil- és WebGL-forgatókönyvek ellenőrzése valódi Android/iOS eszközön, eredmény és képernyőkép rögzítésével.
2. Eltérés esetén javítás, build és teljes regressziós újrafuttatás.
3. Licenc, fordítások, cache-méret, kontraszt és adatfolyam végső ellenőrzése.
4. Külön kiadási jóváhagyás után fejlesztői PR, majd GitHub Pages ellenőrzés; közvetlen `main` push tilos.
