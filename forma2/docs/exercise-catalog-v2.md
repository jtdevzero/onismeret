# FORMA 2 – gyakorlattár v2 (2026-11-22)

## Funkciók

- Meglévő, korábban belső szakmai ellenőrzött gyakorlattár: 70 rekord, változatlan `reviewed: true` és `reviewDate`.
- Új, külön tárolt katalógus: **31 gyakorlat**, összesen **101 választható gyakorlat**. Mell, hát, váll, kar, láb, törzs, mobilitás, állóképesség területeken.
- Az új gyakorlatok címe, célterülete, eszköze, ismétlés- vagy időtartománya, végrehajtási leírása, három ellenőrzési pontja és keresési kulcsszava rögzített.
- Keresés leírásban és célterületben, izomcsoport- és felszerelésszűrő; kapcsolódó gyakorlatok azonos célterület alapján.
- A katalógusból új és meglévő gyakorlatok választhatók saját edzésbe, a korábbi edzésnaplók azonosítói változatlanok.
- A kiegészítő fájl betöltési hibájánál az eredeti gyakorlattár és edzésprogram tovább működik.

## Nem megvalósított, ezért nem szabad késznek jelölni

- A **275** gyakorlatos célig további **174** részletesen ellenőrzendő gyakorlat hiányzik.
- Az új elemekhez nincsenek egyedi, biomechanikailag ellenőrzött animációk vagy kamerás ellenőrzések. Ezt a UI jelzi, a kamerás gomb nem jelenik meg.
- A meglévő 70 gyakorlat izomcsoportmezői nincsenek mind strukturáltan annotálva; az új izomszűrő emiatt elsősorban az új elemekre használható.
- Az új elemek teljes angol tartalmi fordítása, az egyedi részletes könnyítések és hibakatalógus, valamint saját gyakorlat-adatlap létrehozása hátralévő feladat.
- Valós iOS és Android képernyőn, offline PWA-val nem történt ellenőrzés.

## Szakmai státusz és adatbiztonság

Az új `exercise-catalog-extra.json` állapota `editorial-draft`, külön személyi edzői **belső szakmai felülvizsgálatot** igényel; nem független vagy klinikai validáció. Az új elemek nem kapnak `ladder` és `level` mezőt: a programgenerátor meglévő létrái és a felhasználói progresszió nem változnak. Nincs új hálózati szolgáltatás, API-kulcs vagy személyesadat-küldés.

## QA

- `python3 forma2/build.py` – sikeres.
- `node --test --test-reporter=dot forma2/tests/*.test.mjs` – sikeres, **208 teszt**.
- `node --check` az érintett két UI-modulra – sikeres.
- Valós eszköz / mobil screenshot / kamera: ebben a fejlesztési egységben nem futtatva.
- Az előző egységben hiányzó `forma2/tests/browser.cjs` szkript továbbra sem áll rendelkezésre ebben a repóban.

## Következő szakmai egységek

1. A 70 régi gyakorlat strukturált izomcsoport-, eszköz- és mozgásminta-annotációja.
2. Újabb katalógusrekordok szakaszos bővítése és edzői ellenőrzése.
3. Magyar–angol tartalmi fordítás.
4. Egyedi biztonsági variációk és ellenőrzött ábrák.
5. Saját gyakorlat-adatlapok export/import kompatibilitással.
