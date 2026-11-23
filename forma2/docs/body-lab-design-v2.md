# BODY LAB – vizuális revízió v2 (2026-11-23)

## Miért kellett az átdolgozás?

Az első Three.js-változat testfelületei nagyméretű, homogén gömbökből és hengerekből álltak; a 2D fallback egyetlen sematikus körvonalra épült. Ezt túl kezdetlegesnek értékeltük a prémium FORMA 2 arculathoz.

## Implementáció

- Szegmentált, eltérő tónusú pectoralis-, váll-, felkar-, alkar-, has-, hát-, far-, comb- és lábszár-formák. A régiók továbbra is kattinthatók és a gyakorlatlistához kapcsolódnak.
- Külön 3D vizuális talapzat és diszkrét mélységi atmoszféra, felületgradiens és rácsminta a Miami-naplementés színekben.
- A 2D sematikus testábra új színátmenetet, belső szegmentáló vonalakat és nagyobb jelölőpontokat kapott. Az eredeti ARIA-gombok és billentyűzetes kezelés megmaradt.
- Egységes 3D-jelölés, rétegválasztó gombok, részletesebb információs vezetősáv, aktív szakaszok kiemelése. Az angol UI-fordítások frissültek.
- A 3D alacsony fogyasztású, továbbra sem fut folyamatos animációs ciklus. A GPU geometria és material továbbra is felszabadul képernyőváltáskor.

## Pontossági és QA-státusz

**Fontos:** a részletesebb megjelenés nem jelenti, hogy hiteles anatómiai szövetmodell, csontszerkezet vagy biomechanikai szimuláció lenne. A testarányok és izomfelületek stilizált oktatási vizualizációk.

- `python3 forma2/build.py`: sikeres.
- `node --test forma2/tests/*.test.mjs`: 214 sikeres, 0 sikertelen.
- `node --check` az érintett 3D és atlaszmodulokra, valamint `git diff --check`: sikeres.
- Valós iOS Safari/Android Chrome, WebGL GPU és kis mobilnézet vizuális kézi QA még nem történt ezen a módosított verzión.

## Következő vizuális szint

1. Jogtisztán használható, minőségi riggelt GLB-modell, az app méretkeretéhez és a telefonos GPU-teljesítményhez mérten.
2. Edző által ellenőrzött mozdulatokra külön animációk, sematikus és hiteles referenciaadatok tudatos elkülönítésével.
3. Valós Safari és Android képernyőképes regresszió, kis képernyős kontraszt és érintési méret ellenőrzése.
