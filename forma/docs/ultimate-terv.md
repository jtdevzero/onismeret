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

## Következő lépések

1. U1-112: szokáscél (heti edzésszám) beállíthatóvá tétele, külön a teljesítménycéloktól.
2. U1-109 folytatás: tartós gyakorlatcsere és napok átrendezése.
3. U1-115: WebKit és valódi eszközös próba.
4. U2/U3: döntések kellenek (lásd lent).

## Döntésre vár (U2/U3)

- **Kamerás validáció:** önkéntes, hozzájárulással készült valódi felvételek (fekvőtámasz, felállás, guggolás), kézzel számolt ismétlésszámmal.
- **AI coach:** szolgáltató (pl. Claude API), havi költségkeret, a backend helye (a Kanyar/Parliamo worker mintájára Cloudflare Worker), API-kulcs `wrangler secret put`-tal.
- **Felhő és szinkron:** szolgáltató, titkosítási modell, adatkezelési tájékoztató.
- **Szakmai lektorálás:** normák, panaszmód, súlyjavaslat szabályai.
