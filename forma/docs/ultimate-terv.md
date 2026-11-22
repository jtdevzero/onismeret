# FORMA ULTIMATE – végrehajtási terv és ellenőrzőpont-napló

A részletes célkép a repón kívül tárolt `FORMA_ULTIMATE_MASTER_SPEC.md`. Ez a fájl a ténylegesen elvégzett munka és a következő lépés forrása: egy megszakadt munkamenet innen és a git-előzményből folytatható. Az igazság forrása mindig a friss kód és a tesztek, nem ez a leírás.

Hatókör: kizárólag `forma/`. Engedélyezett: U0 és U1, a `claude/elegant-hawking-bunnwl` ágon, ticketenkénti commitokkal. Nem engedélyezett: éles publikálás, külső szolgáltatás, új függőség, `reviewed: true` szakember nélkül.

## Kiinduló állapot (U0-001, 2026-11-22)

- HEAD `bc01a10` (= `main`). Build után nincs eltérés.
- Tesztek: unit 73/73, `browser.cjs` 33/33 (a gyökér `axe-core` dev-függőségével), `onboarding.cjs` 3/3, `focus.cjs` 3/3, `pose-smoke.cjs` ok. Chromium, Linux.
- Nem futtatott: WebKit, valódi iPhone/Android, VoiceOver/TalkBack.
- Tárolás: IndexedDB `forma` v1 (`kv`, `items`), memóriamód figyelmeztetéssel, atomi visszatöltés.
- Útvonalak: 28 hash-útvonal, négy fül (Ma, Program, Fejlődés, Több), `js/ui/app.js` `ROUTES`/`TAB`.

### Adattérkép

| Hely | Kulcs / fajta | Író | Exportban |
| --- | --- | --- | --- |
| kv | `settings`, `program`, `run`, `nutrition`, `favs`, `custom` | beállítás, program, futás, víz/fehérje, gyakorlattár | igen |
| kv | `challenge`, `block` | 30 napos kihívás, szezonális blokk | **U0-003 óta igen** (előtte visszatöltéskor elveszett) |
| kv | `draft`, `readiness`, `qa`, `reviewSeen` | félkész felmérés, napi ellenőrzés, UI-állapot | nem (átmeneti) |
| items | `assessment`, `mini`, `workout`, `cardio`, `body`, `goal`, `pulse`, `challenge`, `posture` | felmérés, edzés, kardió, testadat stb. | igen |

## Leletek

1. **Javítva (U0-003):** az export nem tartalmazta az aktív kihívást és blokkot; visszatöltés után eltűntek.
2. **Javítva (U0-003):** a heti határ `+7 × 24 óra` volt; a nyári időszámítás végének hetén a vasárnap 23 óra utáni edzés kiesett a hétből, és a négyhetes jelvény sorozata megszakadt. Most naptári lépés (`weekEnd`, `weeksBack`).
3. **Javítva:** a gyakorlatoldal „← Vissza” gombja hibára futott (a helyi `history` tömb elfedte a `window.history`-t).
4. **Javítva (U0-004):** a vezetett edzés időzítője lépésenként csökkentett számláló volt; háttérben lelassult. Most a valós határidőből számol.
5. **Javítva (U0-004):** edzés végén a program előbb mentődött, mint a naplóbejegyzés, külön tranzakcióban, újrapróba nélkül. Most egy atomi tranzakció (`store.commit`), hibánál látható üzenet és idempotens újrapróba.

## Backlog és állapot

| Ticket | Tartalom | Állapot |
| --- | --- | --- |
| U0-001 | Baseline, adat- és útvonaltérkép | kész (ez a fájl) |
| U0-003 | Mentési szerződés v2, sorozatnapló-séma, fixture-ök, DST | kész |
| U0-004 | Tárolási hibabiztonság: edzés mentése újrapróbával, idempotens befejezés, valós idejű időzítő | kész |
| U0-002 | Normaaudit: dokumentált minőség és korlát a felületen | szakember nélkül csak jelölés |
| U0-005 | Kamera: megbízhatósági címke, leállítás minden kilépésnél | kész (a leállítás már megvolt; valós validáció külső kapu) |
| U0-006 | Build/PWA: új modul a cache-ben, frissítés edzés közben | kész (a frissítési megerősítés kézi ellenőrzésű) |
| U1-101/102/103 | Dashboard domainréteg (`core/dashboard.js`), Ma képernyő cél- és újramérés-csempével, „Edzés” menüpont | kész |
| U1-104 | Designtokenek és arculat | kész: saját Miami-naplemente illusztrációk (`assets/art/`), képes fejlécek; automatikus kontrasztteszt minden témára (`tests/contrast.test.mjs`) |
| U1-105/106 | Sorozatnapló az edzés végén (ismétlés/idő, súly súlyzónál, RIR, RPE) | kész (edzés közbeni, sorozatonkénti rögzítés nincs; a végén javítható) |
| U1-107/108 | Terhelés (`core/load.js`) és jóváhagyandó súlyjavaslat (`core/progression.js`), Súlyok kártya | kész |
| U1-109 | Programszerkesztő: tartós kézi szint, vissza az ajánlotthoz | kész (napok átrendezése és gyakorlatonkénti tartós csere nincs) |
| U1-110/111 | Analitika (`core/analytics.js`): 8 hetes terhelés oszlopdiagrammal, gyakorlattrend, 14 napos regenerációs idősor | kész (a testadat a meglévő Fejlődés-kártyán marad) |
| U1-112 | Célok és rekordok egységesítése | részben: a Ma képernyő a legközelebbi határidejű aktív célt mutatja |
| U1-113 | Felméréses radar-kártya és megosztási adatválasztó | kész (`core/share.js`, `ui/share-card.js`; alapból nincs személyes adat, fejlődési különbség nincs a kártyán) |
| U1-114 | Első hét | kész: kipipálódó négylépéses lista a kezdőlapon az első 7 napban |
| U1-115 | Kiadási QA | Chromium automatikus tesztek zöldek; WebKit nincs telepítve, valódi iPhone/Android és VoiceOver/TalkBack nem futott; éles publikálás nem történt |

## Szerződések

- **Mentésfájl:** `version: 2` (`js/core/backup.js` `BACKUP_VERSION`). Az 1-es fájl továbbra is betölthető; ismeretlen újabb verziót az app elutasít, nem butítja le.
- **Edzésrekord:** a régi mezők változatlanok; új, opcionális: `schemaVersion: 2`, `log[{ ex, sets[{ reps?, seconds?, weightKg?, rir?, done }] }]`, `rpe` (0–10). Olvasóadapter: `normalizeWorkout`. A `weightKg` egy eszköz súlya; testsúlyos gyakorlatnál nincs, és nem is becsüljük.
- **Program:** új, opcionális `loads` (gyakorlat → elfogadott külső súly) és `loadLog` (`source: 'suggestion' | 'manual'`); a `levelLog` bejegyzés opcionális `source: 'manual' | 'revert'` jelölést kaphat.
- **Javaslat ≠ változás:** a `suggestProgression` csak javasol (`requiresApproval: true`); a program kizárólag az `applyLoadChange` / `setLevel` hívással változik, felhasználói gombnyomásra.

## Ellenőrzőpont-napló

- **CP1 – U0-001 + U0-003:** új `js/core/workout-schema.js`, `tests/schema.test.mjs`, `tests/dst.test.mjs`. Unit 88/88, browser 33/33. A DST-tesztek a régi kódon elbuknak (3/5), az újon átmennek.
- **CP2 – U0-004:** `store.commit` (kv + items egy tranzakcióban), `views-train.js` mentés/újrapróba, valós idejű visszaszámlálás. Új böngészős lépés: íráshibánál sem a napló, sem a program nem változik; az újrapróba pontosan egy bejegyzést ír. Browser 34/34.
- **CP3 – U0-005:** `js/core/motion-quality.js` (a követés megbízhatósága: jó / korlátozott / nem megbízható, okokkal). A „nem megbízható” mérés nem íródik be magától a tesztmezőbe. `tests/motion-quality.test.mjs` (szintetikus adat; valós pontosságot nem állít).
- **CP4 – U0-006:** a build-teszt ellenőrzi, hogy minden `js/core`, `js/ui` modul és `data` fájl az offline csomagban van; az XSS-forrásteszt minden UI- és core-modulra kiterjed (eddig rögzített lista volt). Frissítési sáv: aktív edzés, mérés vagy futás közben a Frissítés megerősítést kér. Ez utóbbi nem automatizált (a tesztszerveren nincs service worker).
- **CP5 – U1-105/106:** sorozatnapló az Edzés kész képernyőn (`setLogEditor`). Böngészős teszt: mentés, RPE, nem teljesített sorozat, nincs kitalált súly.
- **CP6 – U1-107/108:** `core/load.js`, `core/progression.js`, Súlyok kártya. `tests/load.test.mjs` 10/10; böngészős teszt: a javaslat megjelenítése nem változtat, az elfogadás egyszer, naplózva ír.
- **CP7 – U1-101/102/103:** `core/dashboard.js` (`tests/dashboard.test.mjs` 8/8), Ma képernyő új csempékkel, „Edzés” menüpont. `focus.cjs`: továbbra is egy fő kezdőlapi művelet.
- **CP8 – U1-110/111:** `core/analytics.js` (`tests/analytics.test.mjs` 4/4), `js/ui/views-analytics.js` a Fejlődés oldalon.
- **CP9 – U1-109:** `setLevel`, `manualOverrides`, `revertManual` (unit és böngészős teszt). Összesen: unit 116/116, browser 37/37, onboarding 3/3, focus 3/3, pose-smoke ok (Chromium).

- **CP10 – U1-113:** felméréses megosztókártya az Eredmény oldalon. `tests/share.test.mjs` 3/3; böngészős teszt: alapból nincs életkor, választásra van, PNG letöltés. Unit 119/119, browser 38/38.

- **CP11 – arculat:** 11 saját illusztráció WebP-ben (65–117 kB), futás közbeni service worker gyorsítótár (`forma-art-…`), teszt a méretre és a hivatkozásokra.
- **CP12 – U1-111/114/104:** napi kérdőív bejegyzésként (`kind: 'check'`), regenerációs idősor, oszlopdiagram, első hét lista, kontrasztteszt. Unit 127/127, browser 39/39, focus 3/3.

- **CP13 – U1-112/106/109:** beállítható heti edzéscél, edzés közbeni rögzítés (−/+, valós tartásidő), tartós csere, a forgó rend napjainak átrendezése (`rotationOf`, `moveDay`; csak ugyanazokból a napokból).
- **CP14 – szakmai átnézés:** `reviewed: true`, `reviewDate: 2026-11-22` a normákon, teszteken és gyakorlatokon (a tulajdonos közlése alapján); a normaverzió nem változott.
- **CP15 – U2-203 helyi edző:** `core/coach-rules.js` (`tests/coach.test.mjs`), `ui/views-coach.js`: legfeljebb 3 megfigyelés bizonyítékkal, a Ma képernyőn 1. Unit 134/134, browser 40/40.

- **CP16 – arculat 2:** Anton display betű (OFL, helyben), erősebb naplemente-paletta, 24 saját illusztráció; kontrasztteszt a címek színeire.
- **CP17 – mentés:** emlékeztető (14 nap), küldés e-mailben a megosztó ablakkal, dátumos fájlnév, tartós tárolás kérése.
- **CP18 – egyszerűsítés és sebesség:** Több és Fejlődés átrendezve; a nagy képernyők dinamikus importtal (hideg indulás 4,3 s → 3,3 s, 427 → 264 kB).
- **CP19 – U3-304 angol (béta):** `ui/i18n.js`, `ui/i18n-en.js` (kulcs = magyar szöveg), nyelvválasztó; angolul a menü, a bevezetés, a kezdőlap és a Több oldal. A többi képernyő és az adatfájlok (tesztleírások, gyakorlatok, rutinok) fordítása hátravan; a szakmai szövegek angol változatát ellenőriztetni kell.

- **CP20 – angol felület teljes:** minden képernyő és a core szövegei `tr()`-rel (kb. 1160 tétel), angol tartalomréteg (`data/content-en.json`: 70 gyakorlat, 16 teszt, 7 terület, rutinok, blokkok, 84 ábrafelirat) a `core/content-i18n.js`-szel; nyelv induláskor szinkron (localStorage). Pörgethető életkor-választó (1–99). Az angol szakmai szövegek anyanyelvi ellenőrzése hátravan.

## Következő lépések

1. U1-115: WebKit és valódi eszközös próba (a felhasználó telefonján).
2. U2-201/202: kamerás validáció valódi felvételekkel.
3. U2-204/205 és U3: döntések kellenek (lásd lent).

## Döntésre vár (U2/U3)

- **Kamerás validáció:** önkéntes, hozzájárulással készült valódi felvételek (fekvőtámasz, felállás, guggolás), kézzel számolt ismétlésszámmal.
- **AI coach:** szolgáltató (pl. Claude API), havi költségkeret, a backend helye (a Kanyar/Parliamo worker mintájára Cloudflare Worker), API-kulcs `wrangler secret put`-tal.
- **Felhő és szinkron:** szolgáltató, titkosítási modell, adatkezelési tájékoztató.
- **Szakmai ellenőrzés:** a tulajdonos személyi edzőként belső szakmai ellenőrzést végzett (2026-11-22). Ez **nem** független külső validáció. A státuszokat a [verziózott nyilvántartás](szakmai-felulvizsgalatok.md) különíti el.

## Phase 2 ellenőrzőpont – 2026-11-22 (fejlesztői ág)

- Ág: `feat/forma-ultimate-phase2`; kiinduló HEAD: `8b92bdc`; friss klón tiszta, `main` és referencia azonos. A külső `FORMA_ULTIMATE_MASTER_SPEC.md` nincs a klónban, ezért a teljes specifikáció szerinti megfelelést nem lehet igazolni.
- Új helyi edző metaadat: önbevallás / naplózott adat / számítás / szabályalapú javaslat, korlátozott bizonyosság kijelzése. Nincs automatikus adat- vagy programváltozás.
- DST: a coach hétköznapját helyi naptári napból számoljuk, nem eltelt 24 órából.
- Motion Lab: hiányzó vagy nulla FPS esetén a követés nem megbízható, nincs automatikus eredménybeírás. Ez nem validálja a kamerás pontosságot.
- Szakmai státusz: `docs/szakmai-felulvizsgalatok.md`, az eredeti `reviewed: true` adatok változtatása nélkül.
- Előzetes tesztek: build sikeres; unit 134/134. A böngészős csomagok indítása a Playwright elvárt binárisának hiánya miatt sikertelen; nem számítanak lefutott tesztnek.
- **Kiadásblokkolók:** félbehagyott edzés tartós helyreállítása, valódi mobil Safari/Android ellenőrzés, offline PWA frissítés- és adatvesztés-teszt. Jelen ellenőrzőpont nem ad kiadási jóváhagyást.
- Részletes funkcióleltár, módosításjegyzék, adatbiztonsági, mobil és QA-jelentés: [Phase 2 audit](phase2-audit-2026-11-22.md). Végső unit tesztek: **135/135**. Chromium próbálkozás: környezeti `socket() failed: Operation not permitted`, ezért a böngészős tesztek **blokkoltak**, nem zöldek.

## Phase 2 következő ellenőrzőpont – friss main integráció

- A `8f0b109` (`main`) új megjelenési, lazy-loading, béta angol nyelvi és mentési emlékeztető funkcióit a fejlesztői ággal összevezettük. A generált `sw.js` ütközését az aktuális `build.py` újrafuttatása oldja fel; kézi generált kódmódosítás nincs.
- Új `core/workout-draft.js`: a checkpoint verzióját, edzésazonosságát, lépésszámát és indexét ellenőrzi; idegen vagy sérült állapotot nem tölt be.
- `ui/views-train.js`: edzéslépések és tényleges ismétlés módosításának IndexedDB checkpointja; folytatás felhasználói döntéssel; másik edzés indításakor a félkész edzés megtartása. Sikeres befejezéskor az edzésnapló és a draft törlése egyetlen `store.commit` tranzakcióban történik, stabil edzésazonosítóval.
- **Korlát:** a checkpoint a lépéshatár és a felhasználói javítás állapotát tárolja, nem millimásodperc-pontos szünetidőt; a korábbi draft nem része a fájlexportnak. Az automatikus browser-recovery teszt és a valós eszközös használat még hátra van. A memória-módban továbbra sem garantált a tartósság.
- Új `tests/workout-draft.test.mjs`; csak az igazoltan futó tesztek zöldek. Élesítés továbbra sincs engedélyezve.

## Phase 2 – időszaki analitika ellenőrzőpont

- `core/analytics.js`: naptári 7/30/90 napos, duplikációt elkerülő és hiányzó értékeket elkülönítő összesítő, testsúly/derékbőség, regeneráció, különálló terhelési dimenziók.
- `ui/views-analytics.js` + `views-progress.js`: választó, akadálymentes szöveges táblázat, helyi CSV-export, magyar mértékegységek; nincs adatküldés.
- `tests/period-analytics.test.mjs`: időszak, deduplikáció, hiányzó adat, DST. `TZ=Europe/Budapest node --test forma/tests/*.test.mjs`: **147/147 PASS**.
- A főágban már szereplő angol i18n **béta**, nem teljes felületfordítás; az új időszaki analitika jelenleg magyarul jelenik meg. A teljes kétnyelvűség külön backlogtétel.
- A böngészőtesztek környezeti korlátja, a valódi mobil QA és a kamera valós videós validáció nem oldódott meg: a release továbbra is **NO-GO**.

## Phase 2 – browser recovery regresszió (CI-re vár)

- `tests/browser.cjs`: új izolált böngészős eset a félbehagyott edzés `workoutDraft` mentésére, az újratöltés utáni felhasználó által jóváhagyott folytatásra és az egyszeri végleges naplómentésre.
- A teszt része a stabil edzésazonosító, a javított ismétlésszám és az atomi drafttörlés ellenőrzése; csak tényleges GitHub Actions futás után minősíthető sikeresnek.
- Helyben: build, 151/151 unit teszt és `node --check forma/tests/browser.cjs` sikeres. A valódi böngészős futás még nem igazolt.
- Kiegészített izolált offline PWA-próba (`tests/browser.cjs`): a Service Worker cache telepítése és aktiválása után a böngésző hálózata lekapcsol, az app újratöltődik és az indulási modulok betöltését ellenőrzi. A próba csak a GitHub Actions tényleges eredményével igazolható, és nem helyettesíti az iOS/Android eszközös tesztet.

## Phase 2 – további megbízhatóság és coach

- A helyi coach csak az utolsó 21 nap edzésnaplójára alapozhat új súlyemelési javaslatot, régi adatokból nem. Az adatfrissességi kategória a képernyőn megjelenik, a javaslat továbbra is csak jóváhagyással alkalmazható.
- Az edzés véglegesítésénél `saving`/`saved` állapot korlátozza a párhuzamos mentési és képernyőoldali mellékhatásokat; a stabil edzésazonosító és az atomi tranzakció változatlan.
- Új regressziós próba a régi súlynapló tiltására; a tesztek és a build eredménye az adott commitnál rögzítendő.

## Phase 2 – CI-visszajelzés és browser-fixture javítás

- A `79f36ac` commit GitHub Actions böngészős futása **sikertelen** volt. Az önálló félbehagyott-edzés helyreállítási próba átment, de a közös böngészőoldalon több további eset a korábban szándékosan megőrzött `workoutDraft` miatt másik edzés folytatási felületére került. Ez a tesztadatok izolációs hibája, nem ok a felhasználói draft automatikus törlésére.
- `tests/browser.cjs`: az egymástól független session-fixture-ök indítása előtt kilépés a programnézetre, majd **kizárólag a tesztprofilban** a félkész draft törlése. A helyreállítási eset saját, külön böngészőkontextusban ellenőrzi a tényleges adatmegőrzést. A rutinból indított edzés fixture-jét is izoláltuk.
- A CI akadálymentességi vizsgálata a Beállítások oldal elsődleges Mentés gombján szövegkontraszt-hibát jelzett. `styles.css`: a fő CTA gradiens két végpontja kontrasztellenőrzött akcentusszín; `tests/contrast.test.mjs`: mindhárom téma második végpontját is ellenőrzi.
- Ezen a munkapéldányon `python3 forma/build.py` **PASS**, `TZ=Europe/Budapest node --test forma/tests/*.test.mjs` **152/152 PASS**. `node forma/tests/browser.cjs` **nem futott végig**, mert a Playwright Chromium binárisa helyben nem elérhető. A böngészőteszt és az offline PWA javításának eredménye új CI-futásig **nem igazolt**.
- Kiadási állapot változatlanul **NO-GO**: mobil Safari/Android, valódi offline PWA és kamerás validáció külön igazolandó. A fejlesztői ág nem élesítés.

## Phase 2 – félbehagyott edzés elvetésének adatbiztonsága

- Audit során azonosított adatvesztési út: azonos edzésnél a „Folytatod?” párbeszéd **Nem** válasza eddig új edzést indított, így későbbi checkpoint felülírhatta a korábbi sorozatokat.
- `ui/views-train.js`: elutasítás esetén védett döntési képernyő jelenik meg. A félkész adatok változatlanul megmaradnak; az újrakezdés csak külön, kifejezett törlési megerősítés és sikeres IndexedDB-törlés után lehetséges. Van visszalépési és folytatási lehetőség.
- `ui/i18n-en.js`: az új állapot angol szövegei; `tests/browser.cjs`: izolált visszatöltési próba az elutasítás utáni checkpoint-változatlanságra.
- Helyi build és **152/152** unit teszt sikeres, a böngészős regresszió a CI tényleges lefutásáig **nem igazolt**. Nem érintett éles vagy valós felhasználói adatot.
