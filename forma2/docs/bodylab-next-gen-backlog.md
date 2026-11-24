# FORMA 2 ULTIMATE – vizuális és nagy léptékű fejlesztési backlog

Állapot: 2026-11-24. A dokumentum **nem** állítja az alábbi backlogelemek megvalósítását. Az aktuális, kész Studio v4.1 hibajavításokat a `bodylab-engine-v3.md` tartalmazza.

## P0 – valóban jó BODY LAB alap

- [x] WebGL nélkül nem üres panel, hanem interaktív 2D tartalék nézet.
- [x] Részletes GLB izom-/csontmodell külön rétegekben, dokumentált licenccel.
- [x] Elöl-/hátulnézet és geometria-alapú régiófókusz.
- [x] Kereshető GLB mesh-lista részleges magyar névszótárral, eredeti forrásnévvel és biztonságos kiválasztási kiemeléssel.
- [x] Ellenőrizetlen kötőszöveti/ízületi 3D-k helyett őszinte 2D jelölés.
- [ ] Modellenként dokumentált geometriaszám, draw call, GPU memória és fizikai iPhone/Android QA.
- [ ] Mobil Safari WebGL hibáinak reprodukciója és tesztelt helyreállítása.
- [ ] Minden mesh pontos, kézzel ellenőrzött magyar anatómiai azonosítója, forrás- és oldaliságjelölése.
- [ ] Anatómiai adat/mesh és UI-kijelölés kétirányú, regressziótesztelt kapcsolata.
- [ ] Valódi felületi embermodell megfelelő licenccel, az izom- és csontvázmodellhez igazítva.
- [ ] Igazolt ízületi/ín/szalag/porcmodell, külön dokumentált részleges vagy hiányzó lefedettséggel.

## P1 – prémium anatómiai stúdió

- [ ] Dupla anatómiai nézet: teljes alak + kiválasztott régió közelije.
- [ ] Kontextuális anatómiai feliratok és ütközést elkerülő címkék.
- [ ] Metszeti nézet csak megfelelő geometriai forrásanyag mellett.
- [ ] PBR anyagprofilok és kontrollált stúdiófények; kontrasztmérés világos/sötét módban.
- [ ] Átlátszóság és rétegsorrend valós anatómiai modellekkel.
- [ ] Izomeredés/tapadás adatkártyák ellenőrzött forráshoz kötve.
- [ ] Gyakorlatok anatómiai kapcsolati gráfja az edzésadatmodellből.
- [ ] 3D kamera könyvjelző, összehasonlító nézet és megosztható, személyes adat nélküli oktatási állapot.
- [ ] Részletességi szintek, KTX2 textúrák, lazy betöltés és mérhető cache-keret.

## P2 – mozgásstúdió és edzések

- [ ] Riggelt modell és hiteles licencű mozgásklip-gyűjtemény.
- [ ] Animációs státuszok: draft / illustrative / internally_reviewed / reference_checked / validated.
- [ ] Fáziscsúszka, szinkronizált elöl-/oldalnézet, tempó, alaphelyzet és tipikus technikai hibák.
- [x] Három meglévő szemléltető gyakorlatnál teljes ciklus, négy fáziscímke, több nézet, tempó és WebGL nélküli 2D fallback (nem riggelt/validált).
- [ ] Gyakorlatonként forrás- és bizonytalansági napló, nincs automatikus biomechanikai validáció.
- [ ] Gyakorlatadatlap → mozgásstúdió → edzésnapló egységes navigációval.
- [ ] Edzés közbeni vizuális sorozat- és pihenőidőzítő, háttérből visszatérő állapot helyreállítással.
- [ ] Offline előző teljesítmény, célzott progresszió és felhasználói jóváhagyás.
- [ ] Több szintű oktatási magyarázat kezdő és haladó felhasználónak.

## P3 – fejlődésvizualizáció és személyes stúdió

- [ ] 7/30/90 napos, hiányzó adatot megőrző, egység- és protokolltudatos trendek.
- [ ] 3D izomcsoport-terhelési hőtérkép kizárólag naplózott gyakorlatbesorolások alapján, nem mért izomaktivációként.
- [ ] Testméret, erő, mobilitás és regeneráció külön nézetekben.
- [ ] Fotó-előtte/utána összehasonlítás dátum- és nézetpárosítással, helyben feldolgozva.
- [ ] Fotópozicionálási guide rögzített kamera-/testpozícióhoz; nincs automatikus testzsírbecslés.
- [ ] Heti coaching összefoglaló: mért, bevallott, becsült, hiányzó és szabályalapú adatok elkülönítve.
- [ ] Magyarázható, visszavonható terhelésjavaslat; sérülésdiagnózis nélkül.
- [ ] Összes grafikonhoz szöveges és exportálható alternatíva.

## Kiadási kapuk

1. Minden változtatás csak `forma2/`; `/forma/` változatlan.
2. Build + teljes Node tesztek, célzott DOM/WebGL hibatestek és vizuális mobilos QA.
3. Jogosultság-, forrás-, licenc- és adatvédelmi ellenőrzés.
4. Valódi mobilos WebGL tesztet csak tényleges eszközpróba után lehet kipipálni.
5. A FORMA 2 tesztoldal publikálása külön felhasználói engedéllyel.
