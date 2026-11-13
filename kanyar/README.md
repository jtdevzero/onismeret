# Kanyar – sí- és snowboard-oktató és elemző PWA

Telefonra telepíthető webapp két részből:

- **Felkészülés a szezon előtt:** hét kamerás mozgásfelmérő teszt, ebből személyre szabott 6 hetes program, a felvett gyakorlatokon ismétlésszámlálás és formaértékelés, gyakorlatonként belinkelt bemutató videó.
- **Havas elemzés:** a csúszásról készült 10–30 másodperces videóból testtartás-mérés, kanyarfelismerés, mutatók, és visszajelzés: mi megy jól, mi a fő hiba, melyik gyakorlat javítja.

A videó a készüléken marad. A pózbecslés (MediaPipe Pose Landmarker) a böngészőben fut, a `vendor/` mappából.

## Állapot: mit tud és mit nem

- A mutatók **szintetikus mozgásadatokon** vannak tesztelve. Valódi sí- és snowboardvideón még senki nem próbálta ki; a sávhatárok (`js/core/snow.js`, `js/core/exercise.js`) szakmai becslések, kalibrálásra várnak.
- A tananyagot, a hibakatalógust és a gyakorlatokat **szakember még nem lektorálta** (`"reviewed": false` a `data/` fájlokban).
- A bemutató videók YouTube-keresésből, cím alapján kerültek be; a tartalmukat senki nem nézte át.
- Tananyag az első két szinthez készült (sí és snowboard). A felület magyar.
- AI-szerver nélkül a helyi, szabályalapú edző válaszol; a `worker/` telepítése után az AI-edző.
- Nincs benne: élő (csúszás vagy edzés közbeni) visszajelzés, szenzoros követés, fiók és szinkron, élszög és sebesség mérése.

## Felépítés

| Hely | Mi van benne |
| --- | --- |
| `src/shell.html` | Az oldal váza. Ebből és a `build.py`-ból lesz az `index.html`. |
| `js/core/` | Az elemzőmag: tiszta függvények, DOM és hálózat nélkül, Node alatt tesztelve. |
| `js/ui/` | Képernyők, tárolás (IndexedDB), a pózbecslő futtatása, az AI-kliens. |
| `data/` | Gyakorlatok, leckék, hibakatalógus. Szerkeszthető kódolás nélkül. |
| `vendor/mediapipe/` | A vendorolt pózbecslő és modell (Apache-2.0), kb. 16 MB. |
| `worker/` | Cloudflare Worker: AI-edző a Claude API-val, a kulcs csak ott van. |
| `tests/` | Egységtesztek, böngészős végpontteszt, pózbecslő-füstteszt. |

Generált fájl az `index.html` és az `sw.js`: ne szerkeszd kézzel, futtasd a buildet.

## Parancsok

```
python3 kanyar/build.py                      # index.html és sw.js
node --test kanyar/tests/*.test.mjs          # elemzőmag, tartalom, build
node kanyar/tests/browser.cjs                # böngészős végpontteszt (Playwright)
node kanyar/tests/pose-smoke.cjs             # a valódi pózbecslő betöltése
cd kanyar/worker && npm ci && npm test       # AI-szerver
python3 -m http.server 8765                  # helyi kipróbálás: http://localhost:8765/kanyar/
```

## AI-szerver telepítése (nem kötelező)

```
cd kanyar/worker && npm ci
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put APP_PASSWORD        # legalább 12 karakter
npx wrangler deploy
```

Az `ALLOWED_ORIGINS` a `wrangler.toml`-ban azt az eredetet sorolja fel, ahonnan az app hívhatja a szervert. Az appban a Beállítások → AI-edző alatt add meg a szerver címét és a belépőkódot. A szerver nem tárol és nem naplóz semmit a kérésből.

## Biztonság és adatvédelem

- Szigorú CSP: nincs beágyazott szkript és stílus; hálózati kérés csak a saját eredetre és `*.workers.dev`-re mehet.
- Minden megjelenített szöveg `textContent`; az AI-válasz formáját a kliens és a szerver is ellenőrzi, és csak a felkínált azonosítókat fogadja el.
- A videó és a teljes felbontású képkockák nem hagyják el a készüléket. Az AI-szervernek a mutatók és legfeljebb 6 lekicsinyített képkocka megy.
- A külső videólinkek új lapon nyílnak, `noopener noreferrer`-rel.

## Következő lépések

1. Kipróbálás 20 valódi csúszós és 10 otthoni videón: stabil-e a csontváz, stimmel-e a kanyarszám.
2. A sávhatárok kalibrálása ezek alapján, oktatóval.
3. A tananyag, a hibakatalógus, a gyakorlatok és a videók lektorálása.
