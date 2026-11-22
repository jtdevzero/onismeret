# Forma – a következő 20 bővítés terve

Sorrend: ami a célt (a korosztályos szint elérése, majd meghaladása) a legjobban szolgálja, és ami a meglévőre épül, az elöl.
Méret: **K** = kicsi (egy commit), **K+** = közepes, **N** = nagy (több lépés). Ahol új függőség, külső szolgáltatás vagy szakmai döntés kell, ott jelölve: ezek előtt kérdezni kell.

## A. Mérés és szakmai pontosság

1. **Szakmai lektorálás csomag (N, külső)** – a normák, a tesztleírások és a gyakorlatok összegyűjtése egy átnézhető dokumentumba gyógytornásznak vagy edzőnek; a visszajelzés után `reviewed: true`. *Kell hozzá: egy szakember.*
2. **◐ Pontosabb normák forrásokból (K+)** – a plank 18–29-es sávja forrásból pontosítva; az egylábas állásnál a források protokollja eltér, a többinél folytatandó. – a „B” minőségű normák (plank, távolugrás, egylábas állás, lépcsőteszt) felülvizsgálata publikált referenciatáblákkal; a forrás tételesen a `norms.json`-ban.
3. **◐ Kamerás elemzés kalibrálása valódi felvételen (K+)** – a mérési adat letöltése kész; a hangoláshoz valódi felvételek kellenek. – „mérési adat letöltése” gomb (testpontok videó nélkül), ebből a küszöbök hangolása; a felhasználó önként küldi el, az app semmit nem küld magától.
4. **✓ Rövid félidős mérés (K)** – a 3. héten 5 perces mini-teszt (fekvőtámasz, plank, egylábas állás), hogy ne csak 6 hetente lásd a fejlődést.
5. **✓ Testösszetétel-követés (K)** – derékbőség és testsúly hetente; a derékbőség a fittségi kor képletében is benne van, így a változás azonnal látszik.

## B. Program és edzés

6. **✓ Szuperszettek és időbeosztás (K+)** – a választott időkerethez (15 / 25 / 35 perc) igazított edzés: párosított gyakorlatok, rövidebb pihenő.
7. **✓ Sérülés- és panaszmód (K+)** – „fáj a térdem / derekam / vállam” beállítás: a terhelő gyakorlatok helyett kímélő változatok, és több célzott mobilitás. *A szakmai lektorálás előtt csak óvatos, általános szabályokkal.*
8. **✓ Gyakorlatcsere (K)** – egy gyakorlat helyett a sor egy azonos szintű másik változata (unalom, helyhiány, eszköz).
9. **✓ Súlyzós bővítés (K+)** – kettlebell / kézisúlyzó gyakorlatsorok (goblet guggolás, evezés, román felhúzás, swing), az eszközválasztóban.
10. **✓ Futóprogram (K+)** – nulláról 5 km-ig, 8–10 hetes szakaszolt terv a kardió oldalon (séta–futás intervallumok), a pulzuszónákkal.
11. **✓ Időszakolás hosszabb távra (N)** – 6 hetes ciklusok egymás után eltérő fókusszal (alapozás → erő → robbanékonyság), a felmérés gyenge pontjai szerint.

## C. Motiváció és visszajelzés

12. **✓ Célok és határidők (K)** – például „30 fekvőtámasz júniusra” vagy „fittségi kor 30 év alatt”, a haladással a kezdőlapon.
13. **✓ Jelvények és rekordok (K)** – egyéni csúcs tesztenként, első húzódzkodás, 4 teljes hét kihagyás nélkül; csak a saját eredményeidhez mérve, más felhasználóhoz nem.
14. **Megosztható eredménykártya (K)** – kép a pókhálóábrával és a fittségi korral, amit te osztasz meg, ha akarod (a Kanyarban már van ilyen minta).
15. **✓ Heti áttekintés (K)** – vasárnap este rövid összefoglaló: mi sikerült, mi maradt el, és mi a következő heti fókusz.

## D. Kényelem és technika

16. **Okosóra-adatok importja (K+)** – GPX- vagy CSV-fájlból kardióedzések beolvasása (időtartam, átlagpulzus), kézi export után; szerver és fiók nélkül.
17. **Értesítés a telefonon (N, külső)** – Web Push emlékeztető a naptárfájl helyett. Szerver kell hozzá (a Parliamo workere mintának jó). *Telepítés előtt kérdezni kell.*
18. **Szinkron több eszköz között (N, külső)** – titkosított mentés a saját tárhelyedre vagy egy workerre. *Külső szolgáltatás: előtte kérdezni kell.*
19. **✓ Sötét és világos téma kapcsolója, nagyobb betűméret (K)** – a rendszerbeállítástól függetlenül; edzés közben nagyobb számok.
20. **Angol nyelvű felület (K+)** – a szövegek kiemelése egy nyelvi fájlba; a magyar marad az alap.

## Javasolt sorrend

- **Kész:** 4, 5, 8, 12, 13
- **Kész:** 6, 9, 10; részben: 2, 3
- **Kész még:** 7 (óvatos változat, lektorálásra vár), 11, 15, 19, valamint regeneráció, fehérje- és vízcél, teljes dizájnmegújítás
- **Következő:** 14, 16, 20, 1
- **Szakemberrel:** 1, 7
- **Később, egyeztetés után:** 11, 14–20

---

# Újabb 20 bővítési ötlet

Méret: **K** kicsi, **K+** közepes, **N** nagy. *Külső*: szerver, szolgáltatás vagy szakmai döntés kell hozzá, ezért előtte kérdezni kell.

## Mérés a telefon érzékelőivel
1. **✓ Egyensúlyteszt gyorsulásmérővel (K+)** – a telefon a mellkason, egylábas állásban méri a kilengést: objektív egyensúlyi pontszám a stopper mellé.
2. **✓ Futókadencia (K+)** – lépésszám és lépés/perc a futás közben, a telefon mozgásérzékelőjéből; cél a 165–180 lépés/perc.
3. **✓ Nyugalmi pulzus kamerával (N)** – ujj a hátsó kamerán és a vakun: reggeli pulzus és regenerációs jelzés, óra nélkül. Tájékoztató mérés.
4. **✓ Metronóm futáshoz (K)** – választható ütem (pl. 170/perc) a futóprogramban, a kadencia javításához.

## Program és edzés
5. **✓ Regenerációs pontszám (K+)** – alvás, nyugalmi pulzus, izomláz és az előző napok terhelése alapján automatikusan könnyít vagy terhel a napi edzésen.
6. **✓ Szezonális programok (K+)** – nyári futó, téli sí előtti, strandszezon előtti törzserősítő 4–6 hetes blokkok.
7. **✓ Sportág-kiegészítők (K+)** – futó, kerékpáros, teniszes, focista: célzott mobilitás és sérülésmegelőzés a heti rendbe.
8. **✓ 30 napos kihívások (K)** – például plank vagy guggolás napi progresszióval, külön jelvénnyel.
9. **✓ Ülőmunka-szünetek (K)** – óránkénti 2 perces mozgásszünet-javaslat munkaidőben (naptárfájllal, szerver nélkül).
10. **✓ 60 év fölötti modul (K+)** – eséskockázat-felmérés (például a „felállás és séta” teszt), egyensúly- és erőprogram idősebbeknek. *Szakmai átnézés kell.*

## Motiváció és közösség
11. **✓ Fittségi kor előrejelzés (K)** – „ha így folytatod, 3 hónap múlva kb. X év”, a haladás üteméből.
12. **◐ Kihívás egy baráttal (K+)** – kimásolható kihíváskóddal kész; a QR-kódhoz új programkönyvtár kellene, ezért egyeztetésre vár. – az eredmények egy QR-kódban cserélhetők, szerver és fiók nélkül.
13. **✓ Havi „mozgás-összefoglaló” kép (K)** – a hónap számai egy megosztható képen.
14. **✓ Személyes rekordok értesítője (K)** – a mini-teszt és a felmérés után kiemelve, ha megdőlt egy csúcs.

## Kapcsolat és export
15. **✓ PDF-összefoglaló orvosnak vagy edzőnek (K+)** – felmérés, trendek, panaszok egy oldalon.
16. **✓ Lépésszám és okosóra-adatok importja (K+)** – CSV- vagy GPX-fájlból, kézi exporttal.
17. **✓ Önismereti oldalak bekötése (K)** – a Forma heti áttekintése a gyökér oldal szokás- és energiafigyelőjével együtt.
18. **AI-edző heti visszajelzéssel (N, külső)** – a Kanyar workerének mintájára, a Claude API-val. Szerver és API-kulcs kell.

## Akadálymentesség
19. **✓ Teljesen hangvezérelt edzés (K+)** – képernyő nélkül, csak hangos vezetéssel, és nagy, egyetlen „tovább” gombbal.
20. **Hangparancsok (N)** – „tovább”, „szünet”, „még egyet”. A böngészők beszédfelismerése többnyire külső szerveren fut, ezért adatvédelmi okból előtte egyeztetni kell.

# Dizájnjavaslatok a következő körre

1. **✓ Napszakhoz igazodó nyitórajz** – reggel napfelkelte, este naplemente, éjjel neonos városkép.
2. **✓ Ünneplő animáció** szintlépéskor és jelvénynél (konfetti vagy fényvillanás), csökkentett mozgásnál kikapcsolva.
3. **✓ Felpörgő számok** az eredményoldalon (fittségi kor, pontszámok).
4. **✓ Pókháló-összevetés csúszkával** – az előző és a mostani felmérés között húzva animál.
5. **✓ Gyakorlattípus-ikonok** a listákban (erő, mobilitás, egyensúly…), saját pálcika-stílusban.
6. **✓ Fekvő nézet edzés közben** – tableten vagy tévén nagy óra és ábra egymás mellett.
7. **✓ Napfényre optimalizált, nagy kontrasztú téma** a szabadtéri edzéshez.
8. **✓ Illusztrált üres állapotok** („még nincs edzés”, „még nincs cél”) egy-egy biztató rajzzal.
9. **✓ Ciklus-idővonal a Program oldalon** – a 6 hét és a fókusz egy vízszintes sávon, a mostani hét kiemelve.
10. **✓ Finom rezgés gombnyomásra** a fontos műveleteknél (indítás, kész, értékelés).

**Állapot:** a fenti ötletek és dizájnjavaslatok elkészültek, kivéve a 18. (AI-edző: szerver és API-kulcs kell) és a 20. (hangparancsok: külső beszédfelismerés) pontot, valamint a QR-kódot, amelyek egyeztetésre várnak.
