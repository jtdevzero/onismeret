# Parliamo

Angol, olasz és spanyol nyelvtanuló webapp, magyarul tanítva. Telepíthető a telefon kezdőképernyőjére, és net nélkül is működik.

Élő változat (a `main` ágra kerülés után): https://jtdevzero.github.io/onismeret/parliamo/

## Mit tud

- **Három nyelv**, a fejléc nyelvválasztójával váltható. Új felhasználónak az angol az alapértelmezett. A leckék és a kártyák nyelvenként külön haladnak, az XP és a napi sorozat közös.
  - Angol (A1–C1): általános ág (12 lecke), haladó B2 ág (8 lecke: phrasal verbs, feltételes mondatok, szenvedő szerkezet, függő beszéd, panasz, used to, módbeli igék, érvelés), haladó C1 ág (8 lecke: óvatos fogalmazás, idiómák, formális és kötetlen stílus, inverzió, kollokációk, kiemelő szerkezetek, múltbeli következtetés, érvelés) és üzleti ág (10 lecke), 8 hangos történet, 50 rendhagyó ige, 5 célzott gyakorló (igeidők, névelők, elöljárók, phrasal verbs, feltételes mondatok).
  - **Podcastok:** 6 hosszabb, felvett hangú beszélgetés A2-től C1-ig, rejthető szöveggel és fordítással, tempóváltással, kérdésekkel és szószedettel.
  - **Kiejtés magyaroknak:** 7 hangpár-csoport (th, w/v, rövid és hosszú i, æ, ʌ, szóvégi zöngés hangok, szóhangsúly). Hallás alapján választasz, aztán kimondod: az app megmondja, ha a párját hallotta (think helyett sink), a mondatoknál pedig szavanként jelöli, mit nem értett.
  - **Vizsgafelkészítő** (B2 First / IELTS jelleggel): feleletválasztós szókitöltés, szóképzés, mondatátalakítás, AI-olvasásértés és esszé, amit az AI a négy hivatalos szempont szerint pontoz, mintaválasszal.
  - Olasz (A1–B1): 30 lecke, 549 kifejezés, 9 történet, 25 ige öt igeidőben, gyakorlók: kötőmód, imperfetto vagy passato prossimo, névelők, elöljárók.
  - Spanyol (A1–B1): 18 lecke, 324 kifejezés, 4 történet, 25 ige öt igeidőben, gyakorlók: ser vagy estar, indefinido vagy imperfecto, por vagy para.
- **Bevezető és szintfelmérő:** első indításkor nyelv- és célválasztás, majd egy 2–3 perces szintfelmérő, ami kihagyja, amit már tudsz.
- **Útlevél-pecsétek** minden befejezett leckéért, **heti kihívások** (3 hetente, +50 XP mindegyikért), hangjelzés és rezgés a válaszoknál.
- **Olvasó:** AI-szöveg a szintedre bármilyen témában; koppints egy szóra a jelentéséért, és egy gombbal kártyára teheted.
- **Saját szavak:** beírsz egy szót, az AI hozzáteszi a fordítást, a példamondatot és a nyelvtani tudnivalót.
- **Napi emlékeztető** a telefonra a választott órában, ha aznap még nem gyakoroltál.
- **Napi kör:** egy gombbal az esedékes ismétlések és az új szavak, kb. 10 perc.
- **Fokozatos nehézség:** egy kifejezés előbb választós feladatban jön elő, aztán kirakósban, gépelve, diktálva, végül kimondva, ahogy egyre jobban megy.
- **FSRS-4.5 ütemező, személyre szabva:** választható megtartási cél (85/90/95%), nehéznek jelölhető kártyák, és ha a valós emlékezésed eltér a céltól, az időközök maguktól igazodnak.
- **Havi hibaelemzés:** az app naplózza a hibáidat (leckék, gyakorlók, vizsga, beszélgetés, kiejtés); a Statisztikában az AI csoportosítja a visszatérő mintákat, és ezekből személyre szabott gyakorlót készít.
- **A hibáim:** külön kör az elrontott kifejezésekből, a legtöbbször rontottakkal kezdve.
- **Kiejtés:** kimondod a mondatot, a böngésző beszédfelismerése ellenőrzi (Chrome-ban és Safariban).
- **Történetek** felvett hanggal, **napi AI-történet** a saját szavaidból, **AI-tanár** szerepjátékkal és fogalmazásjavítással. **Kéz nélküli mód:** a tanár válasza után az app magától figyel, így hangosan, gépelés nélkül beszélgethetsz; a végén értékelést kérhetsz.
- **Szinkron eszközök között:** a haladás a saját szervereden is tárolódik, így telefonon és gépen ugyanott tartasz.
- **Statisztika:** megtartási arány, 7 napos előrejelzés, 16 hetes aktivitás.
- **Felvett hang** minden kifejezéshez (Kokoro neurális hang); az AI szövegeit a böngésző felolvasója mondja.
- **Adatok:** a böngésződben, és ha bekapcsolod a szinkront, a saját szervereden; a Beállításokban fájlba is menthetők.
- **Hozzáférhetőség:** „Ugrás a tartalomhoz” link, nézetváltáskor a fókusz a tartalomra kerül, a célnyelvi szövegek nyelvi jelölést kapnak (helyes felolvasás képernyőolvasóval).

## AI-szerver: a kulcs rejtve marad

Az AI-funkciók (tanár, AI-történet, nyelvtani kérdések) egy kis saját szerveren keresztül hívják a Claude API-t. A Claude API-kulcs **csak a szerveren** van; a böngészőbe a szerver címe és egy belépőkód kerül. A szerver:

- csak a `https://jtdevzero.github.io` oldalról fogad kérést,
- belépőkód nélkül nem válaszol,
- percenként legfeljebb 20 kérést enged,
- csak beszélgetést továbbít, méretkorláttal, és csak a válasz szövegét adja vissza.

A szerver tárolja a szinkronizált haladást is (ugyanabban a KV-tárolóban, a belépőkód mögött), és küldi a napi emlékeztetőt (Web Push): a feliratkozásokat egy Cloudflare KV tárolóban tartja, óránként ellenőrzi, kinek van most a beállított órája, és csak annak küld, aki aznap még nem gyakorolt. A push-kulcspárt első használatkor maga generálja.

A szerver a `worker/` mappában van (Cloudflare Workers, ingyenes csomag elég). Modell: `claude-opus-5-5` (a `worker/wrangler.toml` `MODEL` sorában átírható). Biztonsági elutasításnál a szerver automatikusan tartalék modellt próbál (`fallbacks: "default"`).

**Állíts be havi költségkorlátot** a Claude Console-ban (Settings → Limits), hogy egy esetleg kiszivárgott belépőkód se okozhasson nagy számlát.

### Telepítés telefonról (GitHub Actions)

1. Cloudflare-fiók: https://dash.cloudflare.com (ingyenes). Jobb oldalt az **Account ID**-t másold ki.
2. Cloudflare API-token: My Profile → API Tokens → Create Token → **Edit Cloudflare Workers** sablon → Create. Másold ki.
3. Claude API-kulcs: https://platform.claude.com → API Keys → Create Key.
4. Találj ki egy hosszú belépőkódot (pl. 4-5 véletlen szó).
5. GitHub: a repó **Settings → Secrets and variables → Actions → New repository secret**, négy titok:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `ANTHROPIC_API_KEY`
   - `PARLIAMO_APP_PASSWORD` (a belépőkód)
6. **Actions** fül → **Parliamo AI-szerver telepítése** → **Run workflow**. A végén a naplóban ott a szerver címe: `https://parliamo-ai.<fiókneved>.workers.dev`.
7. A webappban: Ma → Beállítások → **AI-kapcsolat**: add meg a címet és a belépőkódot → **Mentés és próba**.
8. Emlékeztető: ugyanott **Napi emlékeztető** → válassz órát → **Bekapcsolás**, majd **Próba**. iPhone-on csak a kezdőképernyőre tett appból működik.

A telepítés a push-tárolót (KV) is magától létrehozza. Ha az emlékeztető korábbi telepítés után nem működik, futtasd újra a workflow-t.

### Telepítés gépről

```bash
cd parliamo/worker
npm ci
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put APP_PASSWORD
npx wrangler kv namespace create parliamo-push   # a kapott id-t írd be a wrangler.toml [[kv_namespaces]] részébe
npx wrangler deploy
```

## Fejlesztés

A forrás egyetlen fájl: `src/app.html`. Ugyanez fut claude.ai artifactként is (ott a fiókos AI és a szinkron érhető el); a webapp felismeri, hogy önállóan fut, és a saját AI-szervert, a helyi tárolást és a beszédfelismerést használja.

```bash
python3 parliamo/build.py      # src/app.html → index.html + sw.js
node parliamo/tests/run.js     # böngészős végpontteszt (a CI is futtatja)
cd parliamo && python3 -m http.server 8000   # majd: http://localhost:8000
```

```
src/app.html          a teljes app (HTML, CSS, JS)
index.html, sw.js     generált fájlok (build.py)
data/                 tananyag: en/it/es.json, stories-*.json, verbs-*.json, drills-*.json, podcasts-en, pron-en, exam-en
tools/                a saját tananyag forrása: content_en.py (haladó angol, történetek, gyakorlók), content_en2.py (C1, podcastok, kiejtés, vizsga), content_es.py (spanyol), content_drills.py
audio/                felvett hangok (Kokoro neurális hang), leckénként / történetenként / igénként egy base64 JSON-csomag
img/                  lecke- és helyzetillusztrációk
fonts/                Young Serif és Figtree helyben (SIL OFL)
icons/, manifest.webmanifest   telepíthető app
worker/               AI-szerver (Cloudflare Worker)
tests/                böngészős végpontteszt
```
