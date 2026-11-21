# Forma – állapotfelmérés és otthoni edzés (PWA)

Telefonra telepíthető webapp. Felméri, hol tartasz a korosztályodhoz képest, és napi rövid, eszköz nélküli edzéssel visz a korosztályos szintre, majd afölé.

- **Felmérés (kb. 25 perc, 13 teszt):** mély guggolás, váll- és bokamobilitás, ülve előrenyúlás, csípőhajlító-teszt, fekvőtámasz, 30 mp felállás székről, plank, helyből távolugrás, gyors lábmunka, egylábas állás csukott szemmel, leülés–felállás a földről, 3 perces lépcsőteszt. Vezetett tesztek visszaszámlálással, stopperrel, ismétlésszámlálóval, metronómmal. Részletekben is elvégezhető.
- **Kiértékelés:** hét terület (mobilitás, hajlékonyság, erő, törzs, gyorsaság, egyensúly, állóképesség) 0–100 pontos skálán, kor és nem szerinti percentilisekkel, pókhálóábrával. **Fittségi kor** a Nes-féle (HUNT) edzés nélküli VO₂max-becslésből.
- **Program:** hétnapos forgó rend (3 erőnap, 2 gyorsasági nap, 2 mobilitásnap). Minden nap a leggyengébb ízületekre szabott mobilitással indul. A gyakorlatok szintekre bontott sorokban vannak (pl. fekvőtámasz falnál → … → megemelt lábbal); két „könnyű” értékelés után nehezebb változat jön. 5 hét terhelés, 1 könnyített hét, utána újramérés.
- **Egyéb:** vezetett edzés hangos bemondással, napló, fejlődés felmérésről felmérésre (tesztenként is), napi emlékeztető naptárfájlként (.ics), kímélő (ugrásmentes) mód, PAR-Q+ alapú egészségügyi szűrés, mentés fájlba és visszatöltés ellenőrzéssel (telefoncseréhez). Offline is működik.
- **Állóképesség:** kardió napló (séta, kocogás, futás, kerékpár, úszás), heti 150 perces WHO-cél (az intenzív perc duplán számít), személyre szabott pulzuszónák (Tanaka-maximum, Karvonen-féle pulzustartalék a felmérés nyugalmi pulzusából), szinttől függő heti javaslat.
- **Napi ellenőrzés:** edzés előtt alvás, izomláz, energia és fájdalom; rossz napon könnyített edzést (eggyel kevesebb kör, értékelés nélkül) vagy csak mobilitást ajánl.
- **Heti cél** a kezdőlapon: 5 edzés és 150 kardióperc.
- **Naptár és havi összefoglaló** a naplóban: napi jelölés (edzés, kardió, felmérés), lapozható hónapok, összevetés az előző hónappal.
- **Eszközök:** húzódzkodó rúd vagy gumiszalag esetén a húzógyakorlatok ahhoz igazodnak (függeszkedés → negatív → húzódzkodás; széthúzás → evezés).
- **Kamerás mérés (béta):** a letámasztott telefon kamerája előtt élőben számolja az ismétléseket vagy a kitartott időt, hangosan is, és a végén visszajelez a formáról. Tesztekhez (fekvőtámasz, 30 mp felállás, plank, egylábas állás: az eredmény a mezőbe kerül), a gyakorlatleírásnál és a vezetett edzésben. A pózbecslő (MediaPipe, kb. 15 MB) a Kanyaréval azonos, a készüléken fut, és csak az első használatkor töltődik le.
- **Adatvédelem:** minden adat a készüléken marad (IndexedDB). Nincs szerver, fiók, és nincs külső kérés (CSP: csak `'self'`; a `'wasm-unsafe-eval'` a pózbecslő WebAssembly-futtatójához kell).
- **Dizájn:** neonos naplemente (rózsaszín, narancs, türkiz), vastag, dőlt címek, saját rajzolású pálmás naplemente. Márkaelemet, logót vagy betűtípust nem vettünk át.

## Állapot: mit tud és mit nem

- A normák **egy része becsült** (`"quality": "B"` a `data/norms.json`-ban): a fekvőtámasz és az ülve előrenyúlás CSEP-norma, a többi több forrásból becsült érték. Az app ezt tesztenként jelzi.
- A normákat, a teszteket és a gyakorlatokat **szakember még nem lektorálta** (`"reviewed": false`).
- 53 gyakorlatból 41-hez van pálcikafigurás ábra (egy részük a Kanyarból). Ábra nélkül maradt, ami bútort igényel (asztal, szék), és néhány oldalt fekvő vagy szemből értelmezhető gyakorlat.
- A kamerás elemzés **szintetikus mozgásadatokon** van tesztelve; valódi felvételen még nincs kalibrálva, a formaküszöbök szakmai becslések. A mért eredményt az app beírja, de javítható.
- Nincs benne: szinkron több eszköz között, AI-edző.
- Nem orvosi eszköz.

A következő 20 bővítés terve: [ROADMAP.md](ROADMAP.md).

## Felépítés

| Hely | Mi van benne |
| --- | --- |
| `src/shell.html` | Az oldal váza. Ebből és a `build.py`-ból lesz az `index.html`. |
| `js/core/` | Pontozás (`score.js`), programgenerátor (`program.js`), naptárfájl, ábrageometria: tiszta függvények, Node alatt tesztelve. |
| `js/ui/` | Képernyők, tárolás, időzítők, pókhálóábra. |
| `data/` | Tesztek, normák, gyakorlatok, ábrák. Szerkeszthető kódolás nélkül. |
| `vendor/mediapipe/` | A vendorolt pózbecslő és modell (Apache-2.0), a Kanyaréval azonos. |
| `tests/` | Egységtesztek, böngészős végpontteszt (axe-core akadálymentességi ellenőrzéssel), pózbecslő-füstteszt. |

Generált fájl az `index.html` és az `sw.js`: ne szerkeszd kézzel, futtasd a buildet.

## Parancsok

```
python3 forma/build.py                    # index.html és sw.js
node --test forma/tests/*.test.mjs        # pontozás, program, tartalom, build
node forma/tests/browser.cjs              # böngészős végpontteszt (FORMA_SHOTS=mappa: képernyőképek)
node forma/tests/pose-smoke.cjs           # a valódi pózbecslő betöltése
python3 -m http.server 8765               # helyi kipróbálás: http://localhost:8765/forma/
```
