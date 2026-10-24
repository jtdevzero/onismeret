# Parliamo

Olasz és angol nyelvtanuló webapp, magyarul tanítva. Telepíthető a telefon kezdőképernyőjére, és net nélkül is működik.

Élő változat (a `main` ágra kerülés után): https://jtdevzero.github.io/onismeret/parliamo/

## Mit tud

- **Két nyelv, egy koppintással váltható** (IT | EN a fejlécben). A leckék és a kártyák nyelvenként külön haladnak, az XP és a napi sorozat közös.
  - Olasz A1–B1: 30 lecke, 549 kifejezés, 9 hangos történet, 25 ige öt igeidőben.
  - Angol: általános ág (A1–B1, 12 lecke) és üzleti ág (B2–C1, 10 lecke), 4 történet, 50 rendhagyó ige.
- **Napi kör:** egy gombbal az esedékes ismétlések és az új szavak, kb. 10 perc.
- **Fokozatos nehézség:** egy kifejezés előbb választós feladatban jön elő, aztán kirakósban, gépelve, diktálva, végül kimondva, ahogy egyre jobban megy.
- **FSRS-4.5 ütemező:** minden kifejezés akkor jön vissza, amikor nagyjából 90% eséllyel még emlékszel rá.
- **A hibáim:** külön kör az elrontott kifejezésekből, a legtöbbször rontottakkal kezdve.
- **Kiejtés:** kimondod a mondatot, a böngésző beszédfelismerése ellenőrzi (Chrome-ban és Safariban).
- **Történetek** felvett hanggal, **napi AI-történet** a saját szavaidból, **AI-tanár** szerepjátékkal és fogalmazásjavítással.
- **Statisztika:** megtartási arány, 7 napos előrejelzés, 16 hetes aktivitás.
- **Felvett hang** minden kifejezéshez (Kokoro neurális hang); az AI szövegeit a böngésző felolvasója mondja.
- **Adatok:** csak a böngésződben; a Beállításokban fájlba menthetők és visszatölthetők.

## AI-szerver: a kulcs rejtve marad

Az AI-funkciók (tanár, AI-történet, nyelvtani kérdések) egy kis saját szerveren keresztül hívják a Claude API-t. A Claude API-kulcs **csak a szerveren** van; a böngészőbe a szerver címe és egy belépőkód kerül. A szerver:

- csak a `https://jtdevzero.github.io` oldalról fogad kérést,
- belépőkód nélkül nem válaszol,
- percenként legfeljebb 20 kérést enged,
- csak beszélgetést továbbít, méretkorláttal, és csak a válasz szövegét adja vissza.

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

### Telepítés gépről

```bash
cd parliamo/worker
npm ci
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put APP_PASSWORD
npx wrangler deploy
```

## Fejlesztés

A forrás egyetlen fájl: `src/app.html`. Ugyanez fut claude.ai artifactként is (ott a fiókos AI és a szinkron érhető el); a webapp felismeri, hogy önállóan fut, és a saját AI-szervert, a helyi tárolást és a beszédfelismerést használja.

```bash
python3 parliamo/build.py      # src/app.html → index.html + sw.js
cd parliamo && python3 -m http.server 8000   # majd: http://localhost:8000
```

```
src/app.html          a teljes app (HTML, CSS, JS)
index.html, sw.js     generált fájlok (build.py)
data/                 tananyag: it.json, en.json, stories-*.json, verbs-*.json (a Viva Voce csomagból)
audio/                felvett hangok, leckénként / történetenként / igénként egy base64 JSON-csomag
img/                  lecke- és helyzetillusztrációk
fonts/                Young Serif és Figtree helyben (SIL OFL)
icons/, manifest.webmanifest   telepíthető app
worker/               AI-szerver (Cloudflare Worker)
```
