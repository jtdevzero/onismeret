# FORMA ULTIMATE – Phase 3 (2026-11-22)

## Hatókör és állapot

Kizárólag `forma/`, a Phase 2 fejlesztői változatára épülve. A Phase 2 valós böngészős és eszközös elfogadási blokkolói nem tekinthetők lezártnak. A ROADMAP U3-javaslatai közül az angol felület részben már megvalósult; az AI-edző, a felhőszinkron és a beszédfelismerés külső szolgáltatást érint, ezért **nincs aktiválva**.

## P3-01 – offline heti edzői összefoglaló

- `js/core/coach-weekly.js`: determinisztikus, helyi 7 napos adatösszesítés; naplóazonosító szerinti deduplikáció; naptári napok és időzóna kezelése a meglévő `periodSummary` alapján.
- `js/ui/views-coach.js` / `views-progress.js`: szöveges heti összegzés és helyi TXT export. Minden megjelenés az alkalmazásban marad; nincs hálózati hívás.
- `js/ui/i18n-en.js`: magyar és angol feliratok. A szakmai angol szövegek további nyelvi/szakmai lektorálást igényelnek.
- `tests/coach-weekly.test.mjs`: duplikált adatok, hiányzó regeneráció, önbevallás, read-only működés.
- Helyi ellenőrzés: `python3 forma/build.py` PASS; `TZ=Europe/Budapest node --test forma/tests/*.test.mjs` **158/158 PASS**.

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
