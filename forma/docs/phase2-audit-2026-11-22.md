# FORMA ULTIMATE – Phase 2 audit és QA (2026-11-22)

**Hatókör:** `forma/` a `8b92bdc` kiinduló commitból, `feat/forma-ultimate-phase2` ág. A részletes `FORMA_ULTIMATE_MASTER_SPEC.md` **nem található a repóban** (a terv szerint külső fájl), ezért annak teljes tételes összevetése nem végezhető el. A rendelkezésre álló Phase 2 megbízás és a kód alapján készült audit. Nem release-igazolás.

## Funkcióleltár és integráció

| Terület | Meglévő megvalósítás | Hiány / kockázat | Felelős modulok |
| --- | --- | --- | --- |
| Helyi adatok, import/export | IndexedDB (`kv`, `items`), atomikus `commit`, v1/v2 mentés, idempotens edzésazonosító | Memóriamód nem tartós; nincs leállás után folytatható vezetett edzés; mentés utáni UI frissítés hibaágai további ellenőrzést igényelnek | `ui/store.js`, `core/backup.js`, `ui/views-train.js` |
| Edzésmotor | Időalapú stopper, edzés közben ismétlés/idő változtatása, napló a végén, egyszeri/tartós csere, napok forgatása, könnyített mód, súlyjavaslat jóváhagyással | Sorozatonkénti tartós checkpoint és visszaállítás, súly/RIR edzés közben, változtatás-visszavonás egységes naplója; egyes szintlépések értékelésből automatikusak, ezért a külön jóváhagyás politikáját tisztázni kell | `ui/views-train.js`, `core/program.js`, `core/progression.js`, `core/workout-schema.js` |
| Adaptive Coach | Offline szabályok fájdalom, alvás, szünet, heti cél, terhelés, súly, újramérés alapján | Felmérés célzott elemzése, ciklusfázis, adatfrissesség, hiányzó adat és alaposabb magyarázat; ajánlás-visszavonás külön eseménynaplója | `core/coach-rules.js`, `ui/views-coach.js` |
| Kamera / Motion Lab | Lokális pose modell, becsült testpontkövetés, kameraleállítás, mérési megbízhatósági címke | Valós, címkézett videós mérés és eszközszintű hibamérés hiányzik; állítás csak béta. Jogosultságmegtagadás és orientáció kézi ellenőrzendő | `ui/pose.js`, `ui/live.js`, `core/motion-quality.js`, `core/exercise.js` |
| Analitika | Heti terhelés 8 hét, gyakorlatszintű trend, regeneráció 14 nap, testsúly/testméret és célok külön felületeken | Egységes 7/30/90 napos választó, kardió/futás trendegységesítés, exportálható táblázat/CSV hiányzik | `core/analytics.js`, `core/load.js`, `ui/views-analytics.js`, `ui/views-progress.js` |
| UI és offline | Miami-naplemente illusztrációk, 4 fül, világos/sötét, reduced motion, cache-verziózás | Készüléken 320–430 px, 200% méret, fekvő, tablet, Safari, Android nem igazolt; service worker aktiválás edzés közben kézzel tesztelendő | `styles.css`, `ui/app.js`, `src/shell.html`, `build.py`, `sw.js` (generált) |
| Felmérés és normák | Verziózott eredmény és pontozás, minőségi A/B jelzés, tulajdonosi belső szakmai ellenőrzés | B minőségű normák becsültek; A források tételes protokollauditja és kamerás validáció hátra van | `data/*.json`, `core/assessment.js`, `core/score.js` |

### Modultérkép

- **Core:** `assessment`, `score`, `program`, `progression`, `workout-schema`, `load`, `analytics`, `coach-rules`, `dashboard`, `history`, `calendar`, `cardio`, `runplan`, `track`, `motion-quality`, `geometry`, `exercise`, `posture`, `sensors`, `wellness`, `reaction`, `series`, `figure`, `share`, `backup`, `achievements`, `extras`.
- **UI:** `app` útvonalkezelés; `data`, `state`, `store` állapot; `views-train`, `views-assess`, `views-progress`, `views-analytics`, `views-coach`, `views-cardio`, `views-run`, `views-posture`, `views-wellness`, `views-library`, `views-main`, `views-extra`, `views-diag` képernyők; `pose`, `live` kamera; `dom`, `widgets`, `figure`, `radar`, `share-card`, `progress-card` megjelenítés.
- **Adatok:** `tests`, `norms`, `exercises`, `routines`, `blocks`, `figures` JSON. **Build:** `src/shell.html` + `build.py` → generált `index.html`, `sw.js`, szakmai HTML.

## Elvégzett Phase 2 módosítások

1. A coach hétköznapját helyi naptári napon alapuló számítás adja; nem 24 órás blokkokkal osztott időeltérés.
2. A coach megfigyelései forrástípust és korlátozott bizonyosságot jelölnek, a UI ezt láthatóan közli.
3. Hiányzó/nulla FPS mellett a kamera megbízhatósága `unreliable`, automatikus eredménybeírás nélkül.
4. Verziózott belső szakmai nyilvántartás készült; semmi nem állít független külső validációt, a `reviewed` adatok érintetlenek.
5. A böngészős tesztek opcionálisan explicit `FORMA_CHROMIUM_PATH` útvonalról is indíthatók; új dependency nem került be.

## QA-jelentés

| Teszt | Eredmény | Bizonyíték / korlát |
| --- | --- | --- |
| `python3 forma/build.py` | **PASS** | Generált fájlok újrakészültek |
| `node --test forma/tests/*.test.mjs` | **PASS 135/135** | Új coach DST/provenance és hiányzó FPS regresszió |
| `node forma/tests/browser.cjs` | **BLOCKED** | Playwright saját böngésző nincs; `/usr/bin/chromium` indításakor `socket() failed: Operation not permitted` |
| `node forma/tests/onboarding.cjs` | **BLOCKED** | Azonos Chromium környezeti jogosultsághiba |
| `node forma/tests/focus.cjs` | **BLOCKED** | Azonos Chromium környezeti jogosultsághiba |
| `node forma/tests/pose-smoke.cjs` | **BLOCKED** | A böngésző indításkor leállt |
| iOS Safari/WebKit, Android Chrome, valós telefon, tablet, VoiceOver/TalkBack | **NOT RUN** | Nincs hiteles valódi eszközös futás |
| Offline PWA, szolgáltatásmunkás frissítés | **NOT RUN** | A böngészős környezet nem indítható |

Nincs sikeresnek jelentett, ténylegesen végre nem hajtott ellenőrzés. A 320×568, 375×812, 390×844, 430×932, fekvő, 200%-os szöveg, reduced motion és témaváltás valós mobilos QA-ja nyitott.

## Adatbiztonsági kontrollok

- A helyi architektúra és a saját forrásra korlátozó CSP változatlan. Nincs hozzáadott API-hívás, követőkód, kulcs vagy külső szolgáltatás.
- A mentés v1/v2 kompatibilitása és az atomi visszaállítás meglévő unit tesztjei zöldek; a valódi IndexedDB tranzakcióhibát célzó böngészős teszt most **blokkolt**.
- A fejlesztés nem töröl, nem migrál és nem ír át felhasználói adatot; a memóriamód azonban továbbra is adatvesztési kockázat bezáráskor.
- A kamera képét nem tölti fel a módosítás, de a videós validációhoz külön hozzájárulási folyamat és referenciaadat kell.

## Fennmaradó hibák és U2/U3 backlog (prioritás)

1. **U2-P0:** folytatható edzés-draft atomi, gyakori checkpointtal; duplikált írás és sérült draft visszaállítási browser teszttel.
2. **U2-P0:** Playwright-kompatibilis böngészővel az összes automatizált e2e teszt, offline/cache frissítés, navigáció és import-visszaállítás végrehajtása.
3. **U2-P0:** iOS Safari és Android Chrome valódi eszközös mobil/akadálymentességi mátrix; 200% nagyítás, orientációváltás, háttérben lévő időzítő, kamerajogosultság.
4. **U2-P1:** edzés közbeni sorozat-, súly-, RIR/RPE-mentés tranzakciónként, előzmény előhívása, auditálható és visszavonható programváltozások.
5. **U2-P1:** coach adatfrissességi és hiányzó adat szabályok, ciklus-, cél- és felméréstámogatás; biztonsági szabályok és jóváhagyás minden terhelésnövelésre.
6. **U2-P1:** 7/30/90 napos analitika, egységes mértékegység- és forrásjelzés, CSV export, össze nem vethető protokollok kizárása.
7. **U2-P1:** kamerás kalibráció valódi, címkézett felvételekkel, távolság- és kameraállás-segédlettel; béta státusz megtartása.
8. **U3:** AI provider/backend, felhőszinkron, többeszközös adatkezelés — **külön engedély, költségkeret és adatvédelmi döntés előtt nem indítható**.

**Kiadási javaslat:** **NO-GO** az aktuális Phase 2 teljes körű élesítésére a P0 hiányok és a blokkolt böngészős/mobilos tesztek miatt. A jelen javítások csak fejlesztői ágon maradjanak, jóváhagyott QA után javasolt a külön release-review.

## Utólagos integrációs kiegészítés

Az újabb `main` (`8f0b109`) változásaival integrált fejlesztői változat a helyi edzés-folytatási checkpointot implementálja. A félkész állapot egy `workoutDraft` kv-rekord, a sikeres befejezéskor az ugyanazzal az ID-val írt edzéssel egy atomi tranzakcióban törlődik. A `core/workout-draft.js` szigorúan ellenőrzi a verziót és a lépésszámot. Nem validált továbbra sem a Safari/WebKit, az offline PWA cache-életciklus és a valódi IndexedDB hiba-/újraindítási browser teszt; ezért az eredeti NO-GO döntés továbbra is érvényes. Az U2-P0 checkpoint implementációs részfeladata elkészült, a teljes elfogadási tesztje még nyitott.

**Analytics kiegészítés:** 7/30/90 napos helyi, naptári időszaki összesítő és CSV-export bekerült a Fejlődés oldalra. A hiányzó adat nem lesz nulla, a külső súlyos volumen és RPE-terhelés külön egységben szerepel, a testsúly és derékbőség külön idősor-adat. A kontrollált unit futás 147/147 sikeres. A browser/mobile ellenőrzések és a teljes kétnyelvű fordítás továbbra is nyitottak.
