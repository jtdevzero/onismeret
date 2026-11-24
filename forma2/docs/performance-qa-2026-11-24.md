# FORMA 2 – kiadás előtti teljesítmény- és stabilitási ellenőrzés

**Dátum:** 2026-11-24  
**Ág:** `feat/forma2-performance-qa`  
**Kiadási állapot:** helyi fejlesztés; nem publikált, nem valós eszközön validált.

## Ténylegesen implementált optimalizáció

1. **Gyakorlatábrák (`js/ui/figure.js`):** a láthatatlan, háttérben lévő vagy képernyőn kívüli figurák nem rajzolódnak folyamatos 60 FPS mellett. A ciklus 240 ms-es ellenőrzésre vált; az aktív ábrák normál eszközön ~60 FPS, ismert, legfeljebb 2 GB memórián ~30 FPS felső rajzolási frekvenciát használnak. Az animációpálya sorrendje nem épül fel minden képkockán. A képernyőről eltávolított komponens ciklusa leáll.
2. **Motion Studio (`js/ui/exercise-motion-studio.js`):** a pózkövetés vektorai és a függőleges tengely újrahasznosulnak; nincs minden csontkapcsolatnál új `THREE.Vector3` allokáció. A mozgás adatai, animációs státuszai és az offline SVG fallback változatlanok.
3. **Offline csomag:** a generált service worker pontosan 126 előtöltési bejegyzést tartalmazott; a shell fájlméret-összege a méréskor **1 399 168 byte (1,33 MiB)**. A részletes anatómiai GLB nem része az azonnali precache-nek.

Ezek forráskódszintű terheléscsökkentések. **Nem állítunk igazolt FPS-javulást** eszközös mérés nélkül.

## Automatizált nagy terhelésű tesztek

| Teszt | Mért terhelés / ellenőrzés | Eredmény |
| --- | --- | --- |
| Gyors navigáció | 10 000 egymást követő lifecycle-csere, cleanup pontosan egyszer | sikeres |
| Anatómiai láthatóság | 634 mesh, 500 izolálási kör; eredeti állapot visszaáll | sikeres |
| Mozgásmotor | 15 000 fázis és pontkoordináta véges tartományban | sikeres |
| Mobil renderpolitika | 320/375/390/430/568/812/1024 szélesség × 4 pixelarány × 4 memóriaérték | sikeres |
| Animációk kódkorlátai | Offscreen frame-ritkítás, újrahasznált 3D vektorok | sikeres statikus ellenőrzés |
| Offline shell méret | 2 MiB költségkeret, GLB nélküli precache | sikeres |

## Teljes regresszió és forrásellenőrzés

- `python3 forma2/build.py`: **sikeres**.
- `node --test forma2/tests/*.test.mjs`: **245/245 sikeres**, 0 sikertelen.
- A `forma2/js/` **87 JavaScript-forrásfájlja** külön `node --check` ellenőrzéssel hibamentes.
- A `forma2/data/` **9 JSON-állománya** hibamentesen parse-olható.
- `git diff --check`: sikeres.
- A PWA saját útvonalat, saját offline cache-neveket és helyi `connect-src 'self'` CSP-t használ. A módosított modulok nem küldenek felhasználói adatot hálózatra és nem nyúlnak az IndexedDB-adatmodellhez.

## Nem teljesített, kiadásblokkoló ellenőrzések

- **Valós mobilos QA:** Android Chrome, iOS Safari, fekvő nézet, tablet, 200% betűméret, kontraszt, reduced motion, navigáció, fotók és offline PWA kézi tesztje nem futott.
- **Valós WebGL:** a böngészőindítás az ellenőrző konténerben `socket() failed: Operation not permitted` hibával leállt. Nem készült hiteles képernyőkép, FPS-, GPU- vagy memóriafelvétel.
- **Időzítők háttérben:** az edzés-, mérés- és futásidőzítők konkrét eszközön való háttérbe/visszatérés próbája nyitott; a kódbázisban több időalapú modul található, ezért ez külön regressziós forgatókönyv.
- **Offline GLB:** a nagyméretű anatómiai modell csak első betöltés után kerül külön cache-be; előzetes letöltés nélkül offline 2D fallback a várt útvonal. Valós eszközön még ellenőrizni kell.

## Kiadási javaslat

Kiadás előtt 320–430 px-es vizuális ellenőrzés, valódi iOS/Android WebGL-teszt, edzésidőzítő háttérpróba és teljes offline PWA-próba szükséges. Hibajavítás után build és teljes regressziós teszt ismétlendő. A `forma/` éles rendszer változatlan marad, közvetlen main-push nem történhet.
