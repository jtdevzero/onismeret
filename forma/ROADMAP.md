# Forma – a következő 20 bővítés terve

Sorrend: ami a célt (a korosztályos szint elérése, majd meghaladása) a legjobban szolgálja, és ami a meglévőre épül, az elöl.
Méret: **K** = kicsi (egy commit), **K+** = közepes, **N** = nagy (több lépés). Ahol új függőség, külső szolgáltatás vagy szakmai döntés kell, ott jelölve: ezek előtt kérdezni kell.

## A. Mérés és szakmai pontosság

1. **Szakmai lektorálás csomag (N, külső)** – a normák, a tesztleírások és a gyakorlatok összegyűjtése egy átnézhető dokumentumba gyógytornásznak vagy edzőnek; a visszajelzés után `reviewed: true`. *Kell hozzá: egy szakember.*
2. **Pontosabb normák forrásokból (K+)** – a „B” minőségű normák (plank, távolugrás, egylábas állás, lépcsőteszt) felülvizsgálata publikált referenciatáblákkal; a forrás tételesen a `norms.json`-ban.
3. **Kamerás elemzés kalibrálása valódi felvételen (K+)** – „mérési adat letöltése” gomb (testpontok videó nélkül), ebből a küszöbök hangolása; a felhasználó önként küldi el, az app semmit nem küld magától.
4. **Rövid félidős mérés (K)** – a 3. héten 5 perces mini-teszt (fekvőtámasz, plank, egylábas állás), hogy ne csak 6 hetente lásd a fejlődést.
5. **Testösszetétel-követés (K)** – derékbőség és testsúly hetente; a derékbőség a fittségi kor képletében is benne van, így a változás azonnal látszik.

## B. Program és edzés

6. **Szuperszettek és időbeosztás (K+)** – a választott időkerethez (15 / 25 / 35 perc) igazított edzés: párosított gyakorlatok, rövidebb pihenő.
7. **Sérülés- és panaszmód (K+)** – „fáj a térdem / derekam / vállam” beállítás: a terhelő gyakorlatok helyett kímélő változatok, és több célzott mobilitás. *A szakmai lektorálás előtt csak óvatos, általános szabályokkal.*
8. **Gyakorlatcsere (K)** – egy gyakorlat helyett a sor egy azonos szintű másik változata (unalom, helyhiány, eszköz).
9. **Súlyzós bővítés (K+)** – kettlebell / kézisúlyzó gyakorlatsorok (goblet guggolás, evezés, román felhúzás, swing), az eszközválasztóban.
10. **Futóprogram (K+)** – nulláról 5 km-ig, 8–10 hetes szakaszolt terv a kardió oldalon (séta–futás intervallumok), a pulzuszónákkal.
11. **Időszakolás hosszabb távra (N)** – 6 hetes ciklusok egymás után eltérő fókusszal (alapozás → erő → robbanékonyság), a felmérés gyenge pontjai szerint.

## C. Motiváció és visszajelzés

12. **Célok és határidők (K)** – például „30 fekvőtámasz júniusra” vagy „fittségi kor 30 év alatt”, a haladással a kezdőlapon.
13. **Jelvények és rekordok (K)** – egyéni csúcs tesztenként, első húzódzkodás, 4 teljes hét kihagyás nélkül; csak a saját eredményeidhez mérve, más felhasználóhoz nem.
14. **Megosztható eredménykártya (K)** – kép a pókhálóábrával és a fittségi korral, amit te osztasz meg, ha akarod (a Kanyarban már van ilyen minta).
15. **Heti áttekintés (K)** – vasárnap este rövid összefoglaló: mi sikerült, mi maradt el, és mi a következő heti fókusz.

## D. Kényelem és technika

16. **Okosóra-adatok importja (K+)** – GPX- vagy CSV-fájlból kardióedzések beolvasása (időtartam, átlagpulzus), kézi export után; szerver és fiók nélkül.
17. **Értesítés a telefonon (N, külső)** – Web Push emlékeztető a naptárfájl helyett. Szerver kell hozzá (a Parliamo workere mintának jó). *Telepítés előtt kérdezni kell.*
18. **Szinkron több eszköz között (N, külső)** – titkosított mentés a saját tárhelyedre vagy egy workerre. *Külső szolgáltatás: előtte kérdezni kell.*
19. **Sötét és világos téma kapcsolója, nagyobb betűméret (K)** – a rendszerbeállítástól függetlenül; edzés közben nagyobb számok.
20. **Angol nyelvű felület (K+)** – a szövegek kiemelése egy nyelvi fájlba; a magyar marad az alap.

## Javasolt sorrend

- **Most:** 4, 5, 8, 12, 13 (kicsik, azonnal hasznosak)
- **Utána:** 6, 9, 10, 2, 3
- **Szakemberrel:** 1, 7
- **Később, egyeztetés után:** 11, 14–20
