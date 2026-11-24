# FORMA 2 – BODY LAB Engine v3: implementált és nyitott részek (2026-11-23)

## 2026-11-24 – Studio v4 vizuális hibajavítás (helyi fejlesztői ág)

- Élő böngészős ellenőrzéskor a WebGL nélküli nézet üres lila panelként jelent meg. A 3D nézetbe beépült a mindig rendelkezésre álló, magyar feliratú 2D SVG anatómiai fallback; a hibaállapotban a 3D vezérlők eltűnnek.
- A stúdió nagyobb, sötétlila/türkiz keretet, rendezettebb vezérlőket, betöltéskori 2D nézetet és mobilos méretezést kapott. Reduced motion támogatás megmaradt.
- A kötőszöveti réteg félrevezető procedurális rúdmodellje helyett csak a jelölt, sematikus oktatási 2D atlasz látható; nem állítunk valós ín- vagy szalaggeometriát.
- Új célzott fallback tesztek és hozzájuk tartozó angol fordítások. Teljes Node-tesztcsomag: 220/220 sikeres; build sikeres.
- **Korlát:** az éles böngészőben a WebGL nem indult el, ezért a valós GLB látványát, a GPU-teljesítményt és az iOS Safari képernyőt nem tudtuk igazoltan ellenőrizni. Ez a javítás nem teszi a modellt biomechanikailag validálttá.

### Studio v4.1 – régiónavigáció

- A WebGL nélküli izomatlaszon öt interaktív, billentyűzettel is választható terület jelenik meg, és azonos gyakorlat- / útmutatószűrőhöz kapcsolódik, mint a meglévő izomtérkép.
- A 3D nézet elöl-/hátulnézet-kapcsolót kapott, külön, mobilon is 44 CSS-pixeles vezérlőkkel.
- Az ízületek, kötőszövetek és mozgásminták eddigi gömb-/rúd-illusztrációi helyett a kifejezetten **2D sematikus** jelölőtérkép az elsődleges. Csak az izom- és csontvázréteg hivatkozik a tényleges részletes GLB-re.
- Kijelölt izom vagy csont esetén a kamera a tényleges látható GLB mesh-ek befoglaló dobozára fókuszál, nem pusztán kézzel rögzített közelítő pontra. Pontos biomechanikai kalibrációnak ez nem tekinthető.
- Célzott regressziós ellenőrzés és fordításellenőrzés: **221/221 sikeres Node teszt**. A build lefutott.

### Studio v5.0 – részletesebb 3D modellfelderítés (fejlesztői ág)

- A GLB konkrét mesh-elemei külön kijelölhetők; a meglévő területkijelölés továbbra is működik.
- Új offline, ékezetfüggetlen anatómiai kereső, legfeljebb 8 látható találattal, egyező 3D elemre történő fókuszálással.
- Részleges magyar anatómiai névszótár, bal/jobb oldalisággal és változatlanul megjelenített eredeti Écorché forrásnévvel; a nem ismert elemeknél nincs kitalált magyar fordítás.
- Kijelölt elem türkiz kiemelést kap klónozott anyagon, amelyet csere és navigáció közben felszabadítunk; az eredeti GLB anyag nem változik.
- Modellbetöltési hiba esetén a sematikus 3D gömb-/rúdmodell helyett megjelenik a 2D SVG atlasz. Nem történik új adatküldés vagy külső szolgáltatás aktiválása.
- A névszótár és a GLB mesh-ek összekötése nem igazol független anatómiai vagy biomechanikai validációt.
- A 6 MB-os GLB betöltése alatt a 2D atlasz látható: nem villan fel a korábbi primitív gömbmodell. A 3D állapot csak sikeres GLB feldolgozás után válik aktívvá.
- **Ellenőrzés:** `python3 forma2/build.py` sikeres, `node --test forma2/tests/*.test.mjs`: **226/226 sikeres**, `git diff --check` tiszta. Valódi telefonos 3D-render QA nem történt.
- A valódi iOS és Android teljesítménymérés, illetve a 634 elem egyenkénti szakmai ellenőrzése továbbra is nyitott.

## Kész / ellenőrizhető kódban

- A korábbi BODY LAB 3D nézet, magyar anatómiai rétegek, SVG fallback, gyakorlatkapcsolatok és három szemléltető mozgás megmaradtak.
- Új `core/bodylab-render.js` mobil GPU-profilokkal, modellméret- és helyi útvonal-korláttal.
- A Three.js 0.187.0 hivatalos GLTFLoader és két szükséges segédmodulja helyi, MIT-licencű vendorkódként elérhető. Az importok helyi Three.js-re mutatnak, nincs CDN.
- `ui/anatomy-model-loader.js`: ellenőrzött helyi GLB-assetek izolált betöltése, beágyazott (külső erőforrás nélküli) glTF `parse`, Meshopt dekódolás, GPU-geometriák, anyagok és textúrák felszabadítása.
- **Valódi anatómiai GLB:** `assets/models/ecorche.meshopt.glb` (6 004 016 byte, 634 névvel és szövettípussal ellátott mesh), külön izom- és csontvázrétegben. A Three.js GLTFLoaderrel Node-környezetben ténylegesen dekódoltuk; a fájl fejléce, struktúrája, rétegei és licence célzott tesztet kapott.
- Forrás: [Écorché](https://github.com/Charleeh/ecorche), git commit `320805e06aee51e2e6f6b22533eb2a59d43f2d4d`; modelllicenc **CC BY-SA 4.0**. Származék: BodyParts3D © Database Center for Life Science (CC BY 4.0) és Z-Anatomy – Gauthier Kervyn (CC BY-SA 4.0). A teljes szerzői nyilatkozat és licenc a `assets/models/attribution/` alatt. Az alkalmazás a 3D modell használatakor látható forrásjelölést mutat. A modell kizárólag edukációs célra, nem orvosi eszköz.
- `ui/three-body.js`: kiválasztott régió kiemelése és kamera-fókusz, kétujjas zoom, alapnézet-visszaállítás, WebGL-context-loss jelzés, aszinkron betöltés törölhető művelettel és sematikus fallbackkel.
- `core/exercise-motion.js`: a három létező 3D mozgás `illustrative` státuszt és forrásbizonytalanságot kapott. Új mozgás nem lett automatikusan kitalálva.
- `ui/three-exercise.js`: 0,5×/1×/1,5× sebesség, manuális fáziscsúszka, csökkentett mozgás és egyértelmű nem validált jelölés.
- `ui/views-photo.js`: képek helyben, egymás mellett vagy kézi átlátszósági csúszkával egymásra vetítve; vízszintes és függőleges manuális igazítás 40%-os tartományban. Nincs hálózati képfeltöltés, fotós testzsírbecslés vagy új arcfelismerő funkció.

## Tudatosan nem kész

- **Riggelt anatómiai animáció:** a valós GLB részletes, de nem riggelt, nincs benne ellenőrzött mozdulatsor, női/gyermek variáns vagy teljes ízületi/ín/porc-réteg. A helyi izom-/csontmodellek működését valódi telefonon még ellenőrizni kell; WebGL/GLB hiba esetén a korábbi sematikus 3D modell és a 2D tartalom használható.
- Nincs hiteles izom-, ideg-, ín-, porc- vagy biomechanikai mérési mélység; nincsenek fiktív szövetmetszetek.
- Nincs 101 validált riggelt gyakorlatanimáció. Három szemléltető mozgás van; ezek státusza `illustrative`.
- Valódi Android Chrome és iOS Safari, WebGL GPU-memory és PWA offline eszközpróba nem volt végrehajtva.
- A fotóadatok külön IndexedDB-ben vannak; a standard FORMA backup továbbra sem tartalmazza őket.

## Megvalósítási út a későbbi prémium modellhez

1. A jelenlegi anatómiai referencia-modellel összehangolt, dokumentált származású **riggelt** GLB karakter és ellenőrzött mozdulatsorok beszerzése/készítése.
2. Modell- és animációminőség dokumentált belső személyi edzői felülvizsgálata, a független biomechanikai validációtól elkülönítve.
3. Külön réteg-GLB-k az egységes ~5 egység magas koordinátarendszerben, `userData.area` régióazonosítókkal; 8 MiB-os alap modellméret-keret.
4. A helyi `ANATOMY_MODELS` manifest jelenleg az Écorché izom/csontváz rétegét tartalmazza `illustrative` státusszal. Magasabb státusz csak külön, dokumentált felülvizsgálat után állítható.
5. Eszközön végzett képernyőképes vizuális QA és memória-/FPS-mérés; nem elég a Node-szintetikus teszt.

## Tesztek

- `python3 forma2/build.py`
- `node --test forma2/tests/*.test.mjs`
- `node --check` az érintett UI-, loader- és vendor-modulokra.
- `git diff --check`

Publikáció és main merge külön engedéllyel; a forrásváltozások csak a `forma2/` mappán belül történtek.
