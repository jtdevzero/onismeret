# FORMA ULTIMATE – Phase 3 (2026-11-22)

## Hatókör és állapot

Kizárólag `forma/`, a Phase 2 fejlesztői változatára épülve. A Phase 2 valós böngészős és eszközös elfogadási blokkolói nem tekinthetők lezártnak. A ROADMAP U3-javaslatai közül az angol felület részben már megvalósult; az AI-edző, a felhőszinkron és a beszédfelismerés külső szolgáltatást érint, ezért **nincs aktiválva**.

## P3-01 – offline heti edzői összefoglaló

- `js/core/coach-weekly.js`: determinisztikus, helyi 7 napos adatösszesítés; naplóazonosító szerinti deduplikáció; naptári napok és időzóna kezelése a meglévő `periodSummary` alapján.
- `js/ui/views-coach.js` / `views-progress.js`: szöveges heti összegzés és helyi TXT export. Minden megjelenés az alkalmazásban marad; nincs hálózati hívás.
- `js/ui/i18n-en.js`: magyar és angol feliratok. A szakmai angol szövegek további nyelvi/szakmai lektorálást igényelnek.
- `tests/coach-weekly.test.mjs`: duplikált adatok, hiányzó regeneráció, önbevallás, read-only működés.
- Helyi ellenőrzés: `python3 forma/build.py` PASS; `TZ=Europe/Budapest node --test forma/tests/*.test.mjs` **158/158 PASS**.

### P3-01b – heti/havi időszak és forráshű riport

- A Fejlődés oldalon 7 vagy 30 nap választható, a letöltés ugyanarra a kiválasztott időszakra készül. A feliratok mindkét nyelven elérhetők.
- A havi riport nem szorozza fel a heti edzéscélt tetszőleges becsléssé; a havi célt ismeretlennek jelöli. Hiányzó regenerációból továbbra sem következtet jó állapotra.
- `core/coach-weekly.js`, `views-coach.js`, `tests/coach-weekly.test.mjs` célzott módosításai; az automatikus tervváltoztatás továbbra is tiltott.

## P3-04 – Workout Cockpit első mobilos iteráció

- `ui/views-train.js`: minden sorozat/checkpoint után látható, képernyőolvasó által felolvasható mentési állapot (`mentés…` → `mentve` vagy hiba). Memóriamódban a státusz kifejezetten ideiglenes mentést jelez, nem tartósságot.
- Az aktuális gyakorlatnál röviden látszik a korábbi, naplózott edzés dátuma, sorozat- és ismétlésszáma vagy tartási ideje. `core/workout-previous.js` azonosító alapján deduplikál, jövőbeli/sérült adatot elutasít, csak ténylegesen mentett edzésből dolgozik.
- `styles.css`: kisméretű, egységes előzmény- és státuszsor, fekvő elrendezési korrekció; a FORMA színei és illusztrációi maradnak.
- Célzott tesztek: `tests/workout-previous.test.mjs`; build és **161/161** helyi unit PASS. A mobil böngészőteszt és az élő mentésmegszakítási UX még nyitott.

## P3-05 – Program Builder Pro első iteráció

- `ui/views-library.js`: minden saját edzés saját **Szerkesztés** linket kapott; az eddig csak az első edzéshez tartozó szerkesztőlinket megszüntettük.
- A gyakorlatok sorrendje a szerkesztőben fel/le vezérlőkkel állítható. A kiválasztási lista sorrendje (kedvencek előre) nem írja felül a mentett edzéssorrendet; a módosítás csak a felhasználó Mentés műveletére kerül a helyi tárolóba. A gombok minimum 44 CSS-pixelesek, billentyűzettel is használhatók.
- `core/custom-order.js` tiszta sorrendmozgatás és deduplikált mentési lista; `tests/custom-order.test.mjs` ellenőrzi a sorrendet, határhelyzeteket és a bemenet változatlanságát.
- `styles.css` és `i18n-en.js`: arculatba illeszkedő, magyar/angol vezérlők. Build **PASS**, unit **163/163 PASS**. Drag-and-drop érintéses kezelés külön iteráció; a jelenlegi nyílgombos felület a hozzáférhető alternatíva.
- A teljes böngészős szerkesztés/mentés és mobilos UI ellenőrzése továbbra is szükséges a kiadási jóváhagyáshoz.

## P3-06 – Recovery Center 3.0 első biztonsági iteráció

- `core/extras.js`: a korábbi 3 nap edzésterhelése **önmagában nem alapoz meg regenerációs pontszámot**; legalább egy friss, teljes napi önbevallás vagy összevethető reggeli pulzus szükséges. A jövőbeli és irreális pulzusértékeket a bemenetből kizárjuk, a 3 napos terhelési ablak helyi naptári napokra épül.
- A pontszámhoz `evidence` (önbevallás / pulzus-összevetés / edzésnapló) és `confidence` (`more_data` vagy `limited`) metaadat tartozik. Ezek információforrást és hiányosságot jelölnek, **nem klinikai bizonyosságot**.
- `ui/views-extra.js`: adatforrások, hiányzó adat és bizonytalanság külön magyar/angol magyarázata. Nincs automatikus terhelésmódosítás, orvosi diagnózis vagy külső adatküldés.
- `tests/extras.test.mjs`: csak terhelés, jövőbeli pulzus, bizonyosság és forrástípus regressziók. Build **PASS**, unit **163/163 PASS**.
- A regenerációs algoritmus szakmai küszöbeinek és a valós mobilos megjelenítésnek a külső, reprezentatív validációja továbbra is szükséges; a kijelzett érték tájékoztató.

## P3-07 – FORMA Today 3.0: félbehagyott edzés elsőbbsége

- A kezdőlap napi CTA-ja jelenleg a következő programedzést mutatta, akkor is, ha egy másik edzés félbe volt hagyva. `ui/views-main.js` most ellenőrzött `workoutDraft` esetén elsőként a **Folytatás** műveletet és a megőrzött lépésszámot mutatja.
- `core/home-action.js`: szigorúan ellenőrzött, támogatott edzésazonosító, érvényes checkpoint és még nem mentett végleges edzés szükséges. A tényleges folytatás továbbra is a session nézetben felhasználói jóváhagyással történik; a kezdőlap semmit nem töröl vagy ír felül.
- `tests/home-action.test.mjs`: folytatható, lezárt, sérült és idegen edzés esetei; `i18n-en.js`: új magyar és angol szövegek. Build **PASS**, unit **165/165 PASS**.
- A valós iOS/Android kezdőlapi megjelenítés, e2e navigáció és offline visszatöltés további kiadásblokkoló teszt.

### P3-07b – kompakt napi állapot és 320 px-es kialakítás

- `views-main.js`: hiányzó regenerációs becslésnél a napi közérzetellenőrzéshez vezető csempe; korlátozott bizonyosság esetén erre külön látható jelzés figyelmeztet. A pulzusmérés önmagában nem helyettesíti a napi önbevallást.
- `styles.css`: a kezdőlapi csempék rugalmas `minmax(0, 1fr)` oszlopok, szövegtörés és skálázott számok; legfeljebb 350 CSS-pixel szélességben egy oszlopba kerülnek a túlzsúfoltság helyett. Megmaradnak a meglévő Miami-színek és CTA.
- `i18n-en.js`: magyar/angol állapotjelzések. Helyi build és unit **165/165 PASS**. A 320 × 568, nagy szöveg, VoiceOver és tényleges egykezes használat vizuális/eszközös validációja **nem futott**, kiadás előtt szükséges.

## P3-08 – Workout Cockpit: biztonságos gesztus és billentyűzetes kezelés

- `core/workout-navigation.js`: tiszta `swipeStep` döntés; 70 px-nél rövidebb, túlságosan függőleges, nem véges, interaktív vezérlőn indított vagy értékelés alatti gesztus nem lapozhat.
- `ui/views-train.js`: a pointer események csak nem interaktív felületen indulva navigálnak; `pointercancel` törli a kezdőpontot. A bal/jobb nyílbillentyűk előre/vissza mozgatnak, de mezőben, gombon, módosítóbillentyűvel vagy értékelés alatt nem; az eseményfigyelő nézetelhagyáskor felszabadul.
- Az instrukció magyar és angol változata frissült; a korábbi nagy érintéses vezérlők, a mentési checkpoint és a saját vizuális arculat érintetlenek.
- `tests/workout-navigation.test.mjs`: gesztus, görgetés, interaktív célpont és értékelés regresszió. Build **PASS**, unit **167/167 PASS**. A valós érintéses Safari/Android ellenőrzés továbbra is nyitott.

### P3-08b – kis képernyős edzésfókusz

- `styles.css`: 740 px-nél alacsonyabb telefonon kisebb másodlagos térközök, kompakt előző teljesítmény és következő gyakorlat előnézet; az aktuális gyakorlatábra és az ismétlés/idő marad az elsődleges. 350 px alatt a kéthasábos vizuális blokk rugalmasabb.
- A fő edzésvezérlők legalább 56 CSS-pixel magasak, több sorra törhetnek; a hosszú címek nem okozhatnak szándékos vízszintes túlcsordulást. A reduced-motion korábbi szabályai megmaradtak.
- `tests/workout-layout.test.mjs`: CSS szerződésellenőrzés a gombméretre, tördelésre és mobil breakpointokra. Build **PASS**, unit **169/169 PASS**.
- **Korlát:** ez automatizált statikus stílusellenőrzés, nem bizonyítja a 320×568 és fekvő telefonos valós megjelenést. A Playwright/valós eszközös ellenőrzés továbbra is kiadásblokkoló.

## P3-09 – vezetett edzés összesítésének adatpontossága

- A vezetett edzés végleges `done` összesítése a sorozatnál módosított `actualReps` és `actualSeconds` értékét veszi át, nem írja vissza helyette a tervezett mennyiséget. Az oldalankénti ismétléseket továbbra is két oldalra összesíti; a második partner sorozata nem kerül az első személy eredményébe.
- A tiszta `core/workout-schema.js` `completedSteps` függvény részleges edzésnél csak a lezárt lépéseket számolja; a régi naplókat nem írja át. `tests/schema.test.mjs` lefedi a módosított értékeket, a nullát, a partner módot, a részleges mentést és a bemenet változatlanságát.
- A sorozatonkénti utólagos szerkesztő működése változatlan. A valós IndexedDB-, offline- és mobilböngészős regresszió továbbra is kiadásblokkoló.
- 2026-11-22: `python3 forma/build.py` **PASS**; `TZ=Europe/Budapest node --test forma/tests/*.test.mjs` **170/170 PASS**. `node forma/tests/browser.cjs` **nem futott le sikeresen**: a Playwright Chromium headless shell nem található a környezetben; a valós böngészős és eszközös QA nyitott.

## P3-10 / P3-11 – böngészős tesztblokkoló és jóváhagyott progresszió (első egység)

- P3-10 diagnosztika: mind a négy Playwright belépőpont (`browser.cjs`, `onboarding.cjs`, `focus.cjs`, `pose-smoke.cjs`) nem indítható a hiányzó Playwright Chromium headless shell miatt. A telepített `/usr/bin/chromium` alternatíva `socket() failed: Operation not permitted` hibával áll meg ebben a környezetben. **Nincs sikeres böngészős vagy valós eszközös teszt.** A tesztfuttató függőségeit nem módosítottuk.
- P3-11: `core/program.js` `reviewRatings` a felkínált automatikus szintváltásokat csak a kifejezetten jóváhagyott gyakorlatsoroknál alkalmazza. Elutasításkor a valódi önbevallás megmarad, a program szintje és változásnaplója változatlan marad.
- Az edzés végén a UI minden felmerülő szintváltáshoz külön megerősítést kér az aktuális és a javasolt gyakorlattal, az indokkal és a bizonytalansággal. A javaslat nem mért biomechanikai tény. A magyar/angol magyarázó feliratok és a kapcsolódó szövegek is módosultak.
- Célzott regresszió: `tests/core.test.mjs` jóváhagyott/elutasított/nem javasolt szintváltás, eredeti állapot változatlansága. A teljes Phase 3 továbbra sem kiadáskész; az edzésmentés valódi böngészős jóváhagyási útját is ellenőrizni kell.

## P3-02 – online generatív coach biztonsági architektúra (csak terv)

1. **Alapbeállítás:** offline szabálymotor, nincs AI-kérés, API-kulcs vagy háttérszinkron.
2. **Explicit hozzájárulás:** külön, nem előre bejelölt választás; adatmezőnkénti előnézet; a visszavonás a jövőbeli adatküldéseket letiltja.
3. **Adatminimalizálás:** a lehető legkevesebb, lehetőleg összesített edzésadat. Név, pontos hely, fájlmentés, kamera-/mikrofonstream, egyedi egészségügyi történet alapból kizárt.
4. **Szerveroldali titokkezelés:** böngészőben tilos szolgáltatói kulcsot tartani; külön végpont, autentikáció, kvóta, költséglimit, naplózási/adatmegőrzési döntés szükséges.
5. **Kimeneti korlát:** AI szöveg csak magyarázatot adhat; nem módosíthat programot, terhelést, normát vagy naplót. Strukturált szabálymotor és felhasználói jóváhagyás az egyetlen módosítási út. Diagnózis nem készülhet.
6. **Hibamód:** offline működés az elsődleges; hibás, késő vagy nem biztonságos modellválasznál helyi coach marad. Kimeneti szöveg szigorúan szövegként renderelendő.

**Külön döntés nélkül nem indul:** szolgáltató, backend, titok, költségkeret, adatkezelési tájékoztató, adattovábbítás, telepítés.

## P3-03 – szinkron és hangparancsok (csak terv)

- Szinkron előtt konfliktuskezelés, eszközazonosság, végponttól végpontig titkosítás és törlési/retenciós szabályok döntendők el; nincs aktív fiók vagy felhő.
- Külső beszédfelismerés előtt mikrofon-adatkezelési és szolgáltatói hozzájárulás kell. A meglévő helyi gombos/hangos edzés marad az alap.
- QR-kódhoz új függőség kellene, ezért új könyvtár telepítése nélkül nem készült QR-generátor.

## Nyitott kiadásblokkolók

- Phase 2 CI teljes zöld futása, IndexedDB/offline PWA/SW frissítés valódi böngészős regresszióval.
- Valódi Android Chrome, iOS Safari/WebKit, orientáció és hozzáférhetőségi tesztmátrix.
- Motion Lab valós, címkézett videós validációja; addig béta.
- P3-01 böngészős felületi és letöltési ellenőrzése. A szintetikus/unit teszt nem helyettesíti a valós UI-próbát.

**Release:** NO-GO; Phase 3 P3-01 implementációs egység elkészült, a teljes Phase 3 nincs kész és nincs élesítve.
