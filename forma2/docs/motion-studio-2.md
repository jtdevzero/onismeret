# FORMA 2 – Motion Studio 2.0 (2026-11-24)

## Ténylegesen elkészült

- A három meglévő, **illustrative** státuszú mozgás (guggolás, fekvőtámasz, csípőemelés) teljes kétirányú ciklust kapott.
- Mindhárom gyakorlat külön magyar fáziscímkéket használ: kiindulás, első szakasz, véghelyzet és visszatérés.
- WebGL nélkül is működő, ugyanabból a pózadatból számoló 2D SVG bemutató. A csúszka, a fázisgombok, a lejátszás és a nézetválasztás ettől függetlenül működik.
- 0,5× / 1× / 1,5× sebesség, elöl-/oldal-/hátulnézet, manuális fázisugrás és hozzáférhető `aria-valuetext`.
- Csúszka-húzás megállítja az animációt, módváltás és oldal háttérbe kerülése nem hagy futó időzítőt. Reduced motion esetén csak kézi vezérlés látható.
- WebGL context loss esetén 2D bemutatóra váltás, helyreállításkor újrarajzolás és GPU-erőforrások cleanupja.
- `three-exercise.js` kompatibilis exportként megmaradt; az új implementáció `exercise-motion-studio.js`-ben van. A `views-train.js` routingja és adatmodellje változatlan.

## Nem kész / nem igazolható

- **Riggelt, magas részletességű anatómiai gyakorlatmozgás nincs:** a BODY LAB Écorché-modellje nem riggelt; a három bemutató továbbra is stilizált, kézzel készített vázlat.
- A 101 gyakorlat nincs automatikusan animálva és nincs biomechanikailag validálva. A fázisnevek oktatási célú címkék, nem klinikai vagy személyre szabott technikaértékelések.
- A fizikai iOS/Android QA nem történt meg. Helyi Playwright Chromium-próbát kezdeményeztünk, de az operációs környezet a böngésző indítását `socket() failed: Operation not permitted` hibával megakadályozta. Ez **nem sikeres böngészős teszt**.

## Riggelt GLB és referenciaanimációk következő kapui

1. Felhasználási joggal rendelkező, megfelelő riggelt karaktermodell és konkrét gyakorlatok referenciaanimációinak beszerzése vagy saját készítése.
2. A csontváz és pózleképezés független vizsgálata; a jelenlegi Écorché mesh önmagában nem alakítható automatikusan hitelesen animált testté.
3. Gyakorlatonkénti státusz: `draft`, `illustrative`, `internally_reviewed`, `reference_checked`, `validated`, felülvizsgálati nyilvántartással.
4. Mobil GPU-/memória-profilok, 320–430 CSS-pixel és 200% betűméret, iOS Safari + Android Chrome tényleges eszközellenőrzése.

## Ellenőrzés

- `python3 forma2/build.py`
- `node --test forma2/tests/*.test.mjs`
- `node --check forma2/js/ui/exercise-motion-studio.js`
- `git diff --check`

Eredmény: **230/230 Node-teszt sikeres**, build és JS szintaxisellenőrzés sikeres, a diff tiszta. A böngészős teszt indítása blokkolt; nem állítunk sikeres UI eszköztesztet. Publikálás csak külön jóváhagyással; `forma/` változatlan.
