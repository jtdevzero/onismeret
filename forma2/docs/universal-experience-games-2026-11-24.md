# FORMA 2 – BODY LAB navigáció, mobil mód és pihenőjátékok

**Dátum:** 2026-11-24. **Ág:** `feat/forma2-universal-experience-pack`. **Állapot:** helyi fejlesztés, nem publikált.

## Megvalósult

1. Közvetlen BODY LAB anatómiai hivatkozás réteggel és érvényes elemmel; hibás útvonal esetén biztonságos alapállapot.
2. Offline, ékezetfüggetlen anatómiai területkeresés.
3. Előző/következő terület vezérlés, billentyűzetes bal/jobb léptetés.
4. Oktatási hivatkozás másolása felhasználói adatok nélkül.
5. Hátsó izom kiválasztásakor megfelelő 2D oldalsó nézet.
6. Kézi 2D takarékos mód, külön 3D próbálkozás / újrapróbálás.
7. A 3D render-felbontás újraméretezéskor konténerszélességhez igazodik.
8. Opcionális, offline pihenőjátékok: célpontvadászat, kosárdobás (irány és szél), sorrendmemória, hatlapos párosító, villám fejszámolás és három másodperces időérzék-játék. A kosárdobás saját CSS-pályát, palánkot, gyűrűt, hálót és csökkentett mozgásbeállítást tiszteletben tartó labdaanimációt kapott.
11. Új `#/arcade` oldal, a Több menüben külön belépővel; a hat játék edzésen kívül is elérhető, három választható vizuális témával.
12. Opcionális helyi rekordmentés csak kifejezetten bejelölt hozzájárulás után, külön törlőgombbal. A játékpontok elkülönülnek az edzésnaplótól, nem kerülnek hálózatra.
9. Magyar felületi szövegek és angol fordításkulcsok az új funkciókhoz.
10. Mobilbarát, fókuszállapotokat és reduced-motion beállítást figyelembe vevő vezérlők.

A játékok csak az edzés pihenőképernyőjén érhetők el. **Nem mentenek pontszámot, nem kérnek személyes adatot, nem végeznek hálózati kérést, és nem állítják meg vagy hosszabbítják meg az edzés pihenőidőzítőjét.** A pihenő lezárásával a játék képernyője is megszűnik. Ezek rövid kikapcsolódási lehetőségek, nem kognitív vagy egészségügyi teljesítménymérések.

## Tesztek

- `python3 forma2/build.py`: sikeres.
- `node --test forma2/tests/*.test.mjs`: **262/262 sikeres**, 0 sikertelen.
- Az új célzott tesztek: útvonal, keresés, léptetés, megosztás, 2D fallback, renderfelbontás, játékállapotok és adatvédelmi statikus ellenőrzések.
- `git diff --check`: sikeres.

## Ellenőrzési korlátok

- Nem történt valódi Android Chrome- vagy iOS Safari-eszközteszt, teljes WebGL/FPS mérés, 200%-os betűnagyítási, tájolásváltási vagy offline telepített PWA-teszt.
- A célzott vizsgálatok nem helyettesítik a kézi érintőképernyős használhatósági teszteket.
- A meglévő BODY LAB modellek anatómiai pontossága ettől nem kapott új validációt.

## Módosított állományok

`js/core/bodylab-navigation.js`, `js/core/rest-mini-game.js`, `js/ui/views-body-lab.js`, `js/ui/three-body.js`, `js/ui/exercise-motion-studio.js`, `js/ui/rest-mini-game.js`, `js/ui/views-arcade.js`, `js/ui/views-train.js`, `js/ui/views-main.js`, `js/ui/app.js`, `js/ui/i18n-en.js`, `styles.css`, `sw.js`, `tests/universal-experience.test.mjs`, `tests/bodylab-premium-fallback.test.mjs`.

## Következő ellenőrzés

320/375/390/430 px kijelzőn, fekvő tájolásban és tableten játékvezérlők; iOS Safari WebGL-visszaállás; pihenőidő lejárta aktív játék közben; touch / képernyőolvasó / reduced motion; cache frissítés meglévő offline adatokkal. Élesítés csak külön jóváhagyással.
