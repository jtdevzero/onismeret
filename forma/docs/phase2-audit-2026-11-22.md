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

## Záró fejlesztői ellenőrzés – 2026-11-22

Ez a rész a fenti **korábbi állapotot** aktualizálja; a korábbi tesztszámok történeti ellenőrzőpontok.

| Funkciócsomag | Jelenlegi bizonyítható állapot | Megmaradt feltétel |
| --- | --- | --- |
| Reliability / Training | Atomi edzésmentés, stabil ID, visszatölthető checkpoint, elvetési megerősítés, v3 fájlmentés (v1/v2 importtal) | Valós IndexedDB, megszakítás, export/import és többtabos ütközés e2e |
| Training Engine | Sorozatnapló (RPE/RIR, súly, idő/ismétlés), gyakorlatszint, egyszeri/tartós csere, napok átrendezése, könnyített mód | Edzés közbeni minden mező külön checkpointja, progresszió egységes jóváhagyási auditja |
| Adaptive Coach | Offline szabálymotor, bizonyítéktípus és adatfrissesség, jóváhagyásos súlyjavaslat | Szabálymagyarázatok és szakmai küszöbök szélesebb, valós adatos ellenőrzése |
| Motion Lab | Lokális pose, minőségi jelzés, hiányzó FPS elutasítása, béta címke | Felcímkézett valódi videók, kalibráció pontossága, iOS/Android kamera |
| Analytics Pro | 7/30/90, terhelés és regeneráció, text/CSV, külön mértékegységek | Egységes heti/havi riport, további kardió/futás mélytrendek |
| Premium UI | Meglévő naplementés arculat, kontrasztregresszió, téma és reduced motion | Teljes mobil QA, 200% szöveg, valódi kontraszt- és teljesítménymérés |
| Offline PWA | Teljes saját core/UI/data előcache; felhasználó által jóváhagyott várakozó Service Worker aktiválás | Valódi offline reload és SW verzióváltás böngészős tesztje |
| Szakmai státusz | Tulajdonos személyi edzőként végzett belső ellenőrzése, verziózott nyilvántartás; nem külső validáció | Becslések és kamera referenciaadatainak további felülvizsgálata |

### Legutóbbi helyi tesztjelentés

- `python3 forma/build.py`: **PASS**.
- `TZ=Europe/Budapest node --test forma/tests/*.test.mjs`: **155/155 PASS**.
- `node forma/tests/browser.cjs`, `onboarding.cjs`, `focus.cjs`, `pose-smoke.cjs`: **BLOCKED** (a Playwright által elvárt Chromium bináris hiányzik). A `/usr/bin/chromium` alternatívája `socket() failed: Operation not permitted` hibával nem indult.
- GitHub Actions korábbi, `61de692` commiton indult böngészős ellenőrzése **FAIL**. A különálló edzéshelyreállítási eset átment, de további e2e tesztállapot-ütközés és kontraszthiba volt; ezeket későbbi commitok javították. Az új commitok **teljes** GitHub CI eredménye nem áll rendelkezésre, tehát nem tekinthető zöldnek.
- Valódi iOS Safari, Android Chrome, 320×568 / 375×812 / 390×844 / 430×932, fekvő mobil, tablet, 200%-os szöveg, reduced motion, világos/sötét és offline telepített PWA: **NOT RUN** ezen az ellenőrzőponton. Az automatizált kódellenőrzés nem egyenértékű valós készülékkel.

### Adatbiztonság és kiadási javaslat

- Nem adtunk hozzá AI-szolgáltatót, titkot, felhőt, követőkódot vagy személyesadat-küldést. A kamera a helyi feldolgozási modellen maradt. A fájl-export kifejezett felhasználói művelet.
- A v3 mentés tartalmazza a félkész edzést; sérült visszatöltés előbb elutasított, mint hogy a régi adatok törlésre kerülhetnének. Memóriamódban továbbra sincs tartóssági garancia.
- **U2-P0:** sikeres teljes CI; browser IndexedDB hibainjektálás, SW váltás, offline PWA, mobil/Safari e2e és valós eszközös mátrix. Ezek kiadásblokkolók.
- **U2-P1:** sorozatonkénti mentési visszajelzés, egységes manuális progressziójóváhagyás és visszavonás, kamera valódi videós validációja, analitikai riportok teljessége, kétnyelvű szakmai lektorálás.
- **U3:** online coach, szinkron, külső szolgáltatók – külön költség-, adatvédelmi és technológiai jóváhagyás nélkül nem aktiválhatók.
- **Release: NO-GO.** Kész a fejlesztői implementáció több jelentős része, de a Phase 2 teljes, hiteles elfogadási lezárása a P0 bizonyítékok hiányában **nem állítható**. Nincs main push vagy élesítés.
