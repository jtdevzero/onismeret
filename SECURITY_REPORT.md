# Biztonsági, hibajavító és optimalizálási átvizsgálás

Ág: `parliamo-v8` · Dátum: 2026-10-24 · Repó: `jtdevzero/onismeret`

## Mire terjedt ki

| Hatókör | Érvényes? | Miért |
|---|---|---|
| **[A] Alkalmazás** | ✅ igen | Statikus webappok a GitHub Pages-en (önismereti oldalak, Parliamo PWA, tarsas, viva-voce) és egy Cloudflare Worker szerver (`parliamo/worker`): AI-proxy, eszközök közötti szinkron, push-emlékeztető. |
| **[E] Munkakörnyezet** | ✅ igen | Git, GitHub Actions (teszt és worker-telepítés), AI-ügynök beállítások. Minden repóra vonatkozik. |
| **[P] Bővítmény** | ⏭️ nem | Nincs böngészőbővítmény, MCP-szerver, ügynök-skill, n8n-node, CMS- vagy IDE-bővítmény a repóban. A PWA és a service worker nem bővítmény. A hozzá legközelebb eső kérdéseket (push-címek, AI-válasz kezelése, jogosultságok) az [A] pontok alatt kezeltem. |

**A felállás röviden:** nincs adatbázis, nincs felhasználói fiók, nincs build-lánc a böngészős kódhoz (két Python-szkript rakja össze a HTML-t). A felhasználó adatai a böngészőben (localStorage) vannak. A worker egyetlen közös belépőkóddal (`APP_PASSWORD`, `x-app-key` fejléc) és eredet-engedélylistával (`ALLOWED_ORIGINS`) véd. A titkok (Claude API-kulcs, belépőkód) a Cloudflare titoktárában vannak, nem a kódban.

## Összefoglaló

**Előtte:** a kód alapvetően rendben volt: nem volt benne titok, a felhasználói szövegek túlnyomó része escape-elve jelent meg, a worker ellenőrizte az eredetet és a belépőkódot. A gyenge pontok ezek voltak:
- A belépőkódot korlát nélkül lehetett próbálgatni.
- A push-funkcióval a szervert tetszőleges `https://` címre lehetett küldeni (SSRF).
- A worker válaszaiból hiányoztak a védőfejlécek.
- A méretkorlát csak a fejlécet nézte.
- A CI-ban a GitHub-tokennek fölösleges írási joga volt, és az actionök nem voltak verzióra rögzítve.
- A worker build-eszközeiben ismert sérülékenység volt.

**Utána:**
- Mindezek javítva, és a worker 8 automatikus tesztet kapott.
- A CI a telepítés előtt is lefuttatja a teszteket.
- Commit előtti titokvédelem és AGENTS.md szabályzat került a repóba.
- Kijavítottam egy valódi hibát: ha a lusta adatbetöltés közben megszakadt a net, a képernyő üres maradt.
- Teljesítményben nem kellett nagyot változtatni: az app 0,2 mp alatt indul. Egy kisebb CI-gyorsítás került be.

## ⚠️ KRITIKUS: ezeket neked kell megtenned

Titkot sehol nem találtam, sem a fájlokban, sem a git-előzményben. **Kulcsot cserélni vagy előzményt átírni ezért nem kell.** A többi lépés azért kell, hogy a javítások élesben is működjenek, illetve a GitHub-beállításokat csak te tudod átállítani.

1. **Telepítsd újra a workert**, különben az új védelmek (próbálkozás-korlát, push-engedélylista, fejlécek, méretkorlát) nem élnek.
   - A PR beolvasztása után: GitHub → `Actions` → bal oldalt **„Parliamo AI-szerver telepítése”** → `Run workflow` → `main` → `Run workflow`.
   - Utána a Parliamo Beállítások → AI rész „Kapcsolat ellenőrzése” gombjával próbáld ki.
2. **Kapcsold be a GitHub védelmeit** (ingyenesek):
   - `Settings` → `Code security` (vagy `Advanced Security`):
     - **Secret scanning** → `Enable`.
     - **Push protection** → `Enable`. Ez visszadobja azt a pusht, amiben kulcs van.
     - **Dependabot alerts** és **Dependabot security updates** → `Enable`.
   - `Settings` → `Branches` (vagy `Rules` → `Rulesets`) → `Add rule` a `main` ágra:
     - „Require a pull request before merging”.
     - „Require status checks to pass” → válaszd az **Ellenőrzés / test** ellenőrzést.
     - „Block force pushes”.
   - A fiókodon: `github.com/settings/security` → **Two-factor authentication** legyen bekapcsolva.
   - `Settings` → `Collaborators`: csak az legyen rajta, akinek tényleg kell.
3. **Erős belépőkód.** Ha a mostani `APP_PASSWORD` rövid vagy könnyen kitalálható, cseréld le egy legalább 20 karakteres véletlen kódra:
   - `cd parliamo/worker && npx wrangler secret put APP_PASSWORD`
   - Utána a Parliamo Beállításainál is írd be az újat.
   - A próbálkozás-korlát (10 rossz kód/perc/IP) mellett ez elég.
4. **Helyi gépen, egyszer:** `pip install pre-commit && pre-commit install` a repó mappájában. Ettől kezdve a gitleaks minden commit előtt titkot keres.
5. **Döntsd el a 🙋 jelű kérdéseket** (lent: A1, A12/push, P2 jellegű viva-voce kulcs).

## Kiinduló állapot és utána

| Mérés | Előtte | Utána |
|---|---|---|
| Build (gyökér + Parliamo) | lefut, 0,4 s + 0,2 s | lefut, 0,4 s + 0,2 s, a generált fájlok egyeznek a forrással |
| Gyökér tesztek (`npm test`) | 547 rendben | 547 rendben |
| Parliamo böngészős teszt (`run.js`) | 133 rendben | 136 rendben (+ újrapróbálás, + 2 hanglejtés-teszt) |
| Parliamo további 6 tesztfájl | mind zöld | mind zöld |
| Worker tesztek | **nem volt** | 8 teszt, mind zöld |
| `npm audit` (gyökér) | 0 sérülékenység | 0 |
| `npm audit` (worker) | ismert sérülékenység a build-eszközben (wrangler → undici) | 0 |
| Titokkereső (gitleaks, előzmény + fájlok) | nincs találat | nincs találat |
| Lint / típusellenőrzés | nincs beállítva (sima JS, nincs TypeScript) | szintaxis-ellenőrzés a buildben, nincs hiba |
| Parliamo indulás (helyben, angol) | ~190 ms, 17 kérés, 913 KB (gzip ~250 KB) | ugyanannyi (szándékosan, lásd O2) |
| Hanglejtés-elemzés, 5 s hang | – | ~110 ms (asztali gép) |
| CI futásidő | 5 p 27 s | a PR első futása után mérhető (worker-tesztek +, npm-gyorsítótár −) |

---

## [C] Közös pontok

### C1. Titokkeresés
- **Állapot:** 🔍 Nem találtam problémát
- **Mit találtam:**
  - A gitleaks v8.21.2 az összes commitot és a teljes munkakönyvtárat átnézte: nincs találat.
  - Kézzel is kerestem (`sk-`, `api_key`, `password`, `BEGIN PRIVATE KEY`, `token`): csak dokumentáció és helyőrző.
  - A `parliamo/worker/wrangler.toml` csak a titkok *nevét* írja le, értéket nem.
- **Mit változtattam:** semmit, nem volt mit.
- **Maradék kockázat:** nincs. A jövőre nézve lásd E1 és a GitHub push protection (KRITIKUS 2).

### C2. API-kulcsok és környezeti változók
- **Állapot:** ✅ Javítva
- **Mit találtam:**
  - A Claude API-kulcs és a belépőkód a Cloudflare titoktárában van (`wrangler secret put`), a böngészős kódban nincs.
  - Nem volt példafájl a helyi beállításhoz.
  - A worker hiányzó belépőkódnál csendben 401-et adott, és nem lehetett tudni, hogy beállítási hiba van.
- **Mit változtattam:**
  - Új `parliamo/worker/.dev.vars.example`, csak helyőrzőkkel.
  - Ha az `APP_PASSWORD` nincs beállítva, a worker azonnal `server_config` hibát ad (fail-fast). Ez nem nyit ki semmit, a kérés ilyenkor is elutasítva.
- **Fájlok:** `parliamo/worker/.dev.vars.example`, `parliamo/worker/src/index.js`
- **Maradék kockázat:** a böngészőben két kulcs él localStorage-ban, lásd A1 és A12 (🙋).

### C3. Nyilvánosan elérhető fájlok
- **Állapot:** ✅ Javítva
- **Mit találtam:**
  - A GitHub Pages az egész repót kiszolgálja, de a repó amúgy is nyilvános, így ez nem szivárgás.
  - Nincs `.env`, SQL-dump, napló, mentés vagy source map.
  - A `.git/` mappát a Pages nem szolgálja ki.
  - A gyökér `.gitignore` viszont nem zárta ki a `.env` fájlokat és a kulcsfájlokat, így ezek véletlenül commitolhatók lettek volna.
- **Mit változtattam:**
  - `.gitignore`: `.env`, `.env.*`, `*.pem`, `*.key`.
  - Worker `.gitignore`: `.dev.vars*` (a példafájl kivételével), `.env`.
- **Fájlok:** `.gitignore`, `parliamo/worker/.gitignore`
- **Maradék kockázat:** nincs.

### C4. Hibakereső mód
- **Állapot:** 🔍 Nem találtam problémát
- **Mit találtam:**
  - A worker hibaüzenetei rövid kódok (`unauthorized`, `upstream`, `server`), stack trace nem megy ki.
  - Nincs debug-kapcsoló és nincs `console.log` a workerben.
  - A webappban nincs fejlesztői mód.
- **Mit változtattam:** semmit.

### C5. Fölösleges csomagok
- **Állapot:** 🔍 Nem találtam problémát
- **Mit találtam:**
  - A gyökérben egyetlen csomag van (`playwright`), ez a teszteké.
  - A workerben kettő: `@anthropic-ai/sdk` (az `index.js` használja) és `wrangler` (telepítés, `npm run deploy`).
  - Mindhárom használatban van.
- **Mit változtattam:** semmit.

### C6. Függőségek és ellátási lánc
- **Állapot:** ✅ Javítva
- **Mit találtam:**
  - Az `npm audit` a worker build-eszközében (wrangler 4.148 → undici) ismert sérülékenységet jelzett.
  - A lockfile-ok commitolva vannak, a CI `npm ci`-t használ.
  - Elgépelés-gyanús vagy elhagyott csomag nincs.
- **Mit változtattam:**
  - wrangler 4.148.0 → 4.152.0 (kisverzió), az undici javítási verzióra rögzítve (`overrides`). Ezután az audit 0.
  - A telepítő workflow-ban a wrangler-verziót is átírtam.
- **Fájlok:** `parliamo/worker/package.json`, `parliamo/worker/package-lock.json`, `.github/workflows/parliamo-ai.yml`
- **Maradék kockázat:** az `@anthropic-ai/sdk` 0.132 → 1.x főverzió-váltás csak javaslat, lásd lent.

### C7. Naplózás
- **Állapot:** 🔍 Nem találtam problémát
- **Mit találtam:**
  - A worker nem naplóz.
  - A CI nem ír ki titkot: a `CLOUDFLARE_API_TOKEN` csak `secrets`-ből megy a wrangler-actionnek.
  - A gyorsítótár csak npm-csomagokat tárol.
- **Mit változtattam:** semmit.

## [A] Alkalmazás

### A1. Hitelesítés
- **Állapot:** 🙋 A te döntésed kell (a technikai részt javítottam)
- **Mit találtam:**
  - Nincs felhasználói fiók: egyetlen közös belépőkód védi a workert (`x-app-key`). Időben állandó összehasonlítással (`safeEqual`), ez jó.
  - A kódot korlát nélkül lehetett próbálgatni.
  - A webapp a belépőkódot localStorage-ban tartja (`S.settings.pass`), és ezen a `jtdevzero.github.io` címen az összes többi app (önismeret, tarsas, viva-voce) ugyanazt a tárat látja.
- **Mit változtattam:**
  - Rossz kódnál IP-címenként legfeljebb 10 próba percenként, utána 429.
  - Hiányzó szerverbeállításnál külön hibakód.
- **Fájlok:** `parliamo/worker/src/index.js`, `parliamo/worker/wrangler.toml`, `parliamo/worker/test/worker.test.mjs`
- **Maradék kockázat / javaslat:**
  - A localStorage-t bármelyik saját oldalad szkriptje olvashatja. Ha egy XSS-hiba bárhol becsúszna, a kód kiszivároghat.
  - Kockázat így: alacsony (mindenhol CSP és escape van), de nem nulla.
  - Két lehetőség: (a) marad így, és erős, cserélhető kódot használsz (KRITIKUS 3); (b) a Parliamo külön (al)domainre költözik, például saját GitHub Pages repóba, így saját tára lesz.
  - Én az (a)-t javaslom most, a (b)-t később.

### A2. Jelszó-hashelés
- **Állapot:** ⏭️ Nem vonatkozik rá
- **Miért:** nincs felhasználói jelszó és nincs adatbázis. A belépőkód a Cloudflare titoktárában van, a szerver csak összehasonlítja.

### A3. Hozzáférés-szabályozás
- **Állapot:** 🔍 Nem találtam problémát
- **Mit találtam:**
  - Egyfelhasználós rendszer: a belépőkód birtokosa mindent lát, ami szándékos.
  - A mentés-letöltés (`/sync/backup-get`) csak `backup:<szám>` kulcsot fogad el, más KV-kulcsot (például a push-kulcspárt) nem lehet kiolvasni vele. Ezt teszt is ellenőrzi.

### A4. Admin útvonalak
- **Állapot:** ⏭️ Nem vonatkozik rá
- **Miért:** nincs admin felület. Az ismeretlen útvonalak 404-et adnak (teszt).

### A5. API-végpontok
- **Állapot:** ✅ Javítva
- **Mit találtam:**
  - Minden végpont `POST`, mindegyik a belépőkód mögött van:
    - `/chat`
    - `/usage`
    - `/push/key`, `/push/subscribe`, `/push/unsubscribe`, `/push/test`
    - `/sync/get`, `/sync/put`, `/sync/backups`, `/sync/backup-get`, `/sync/backup-now`
  - Az egyetlen nyilvános rész a Cloudflare időzítője (óránkénti emlékeztető), ez kívülről nem hívható.
  - Hiányos volt a push-feliratkozás ellenőrzése, és a méretkorlát csak a fejlécet nézte.
  - Érzékeny adat nem megy query stringben.
- **Mit változtattam:**
  - Szigorú push-feliratkozás-ellenőrzés (`validSub`) a teszt-útvonalon is.
  - Méretkorlát a valódi törzsre (lásd A7).
  - A `/push/test` percenkénti korlátot kapott.
- **Fájlok:** `parliamo/worker/src/index.js`, `parliamo/worker/src/push.js`

### A6. Sebességkorlát
- **Állapot:** ✅ Javítva
- **Mit találtam:**
  - A `/chat` már korlátozva volt (20/perc), és volt havi költségkorlát.
  - A belépőkód-próbálgatás és a `/push/test` nem volt korlátozva.
- **Mit változtattam:**
  - Új `AUTH_LIMITER`: 10 rossz kód/perc/IP.
  - `/push/test` a meglévő korláton keresztül.
  - Mindkettő 429-et ad, teszttel.
- **Fájlok:** `parliamo/worker/wrangler.toml`, `parliamo/worker/src/index.js`

### A7. Bemenet-ellenőrzés
- **Állapot:** ✅ Javítva
- **Mit találtam:**
  - A `/chat` üzenetformátumát (szerep, hossz, darabszám) és a szinkron állapotát a szerver már ellenőrizte.
  - A méretkorlát csak a `Content-Length` fejlécre támaszkodott. Ha a kliens ezt nem küldi (darabolt küldés), a push-útvonalak és a mentés-letöltés korlátlan méretű törzset olvastak volna be.
  - A push-kulcsok hossza nem volt korlátozva.
- **Mit változtattam:**
  - Minden útvonal a ténylegesen beolvasott törzs méretét is nézi: 200 KB, szinkronnál 1,5 MB, felette 413.
  - A push-kulcsok hossza korlátozva.
  - Mindkettőre teszt van; az új teszt a javítás nélkül elbukik.
- **Fájlok:** `parliamo/worker/src/index.js`, `parliamo/worker/src/push.js`, `parliamo/worker/test/worker.test.mjs`
- **Megjegyzés:** sémakönyvtárat (zod) nem vezettem be. A worker kicsi, a kézi ellenőrzés teljes, egy új függőség pedig több kockázatot hozna, mint amennyit nyer.

### A8. XSS
- **Állapot:** ✅ Javítva (mélységi védelem)
- **Mit találtam:**
  - A Parliamo `innerHTML`-lel rajzol, és szinte minden szöveg `esc()`-en megy át.
  - Néhány szám nem ment át rajta, holott szinkronból vagy importált mentésből jöhet, tehát elvileg bármi lehet:
    - `s.best` (10)
    - `done.score` (22)
    - `p.pre`, `p.post` (37)
    - `cert.score`, `c.score` (38)
    - `u.calls` (41)
    - `d.score` (44)
  - Az AI-válaszok mindenhol escape-elve jelennek meg.
- **Mit változtattam:**
  - Ezek az értékek is `esc()`-et kaptak.
  - Az új hanglejtés-modul csak számokat és rögzített szöveget rajzol, a tippeket is escape-eli.
  - A meglévő XSS-próba teszt (a beszúrt HTML sehol nem fut le) zöld.
- **Fájlok:** `parliamo/src/js/10-lessons.js`, `22-stories.js`, `37-two-week-grammar-plan.js`, `38-progress-map-and-level-tests.js`, `41-ai-usage-and-backups.js`, `44-writing-course-english.js`
- **Maradék kockázat:** alacsony. A CSP mindenhol ott van (A10).

### A9. CORS
- **Állapot:** 🔍 Nem találtam problémát
- **Mit találtam:**
  - Az engedélyezett eredetek a `ALLOWED_ORIGINS` beállításból jönnek, nincs `*`.
  - Csak `POST` és `OPTIONS`, csak a szükséges fejlécek (`content-type`, `x-app-key`).
  - Idegen eredet 403-at kap (teszt).

### A10. Biztonsági fejlécek
- **Állapot:** ⚠️ Részben javítva
- **Mit találtam:**
  - A gyökéroldalakon, a Parliamón és az önbizalom-kurzuson volt CSP (meta tag). A `tarsas` és a `viva-voce` oldalon nem volt.
  - A worker válaszaiban nem volt `nosniff`, `no-store` és `Referrer-Policy`.
  - A GitHub Pages HSTS-t automatikusan ad, de egyéni fejlécet (frame-ancestors, Permissions-Policy) nem enged beállítani.
- **Mit változtattam:**
  - CSP a `tarsas` és a `viva-voce` oldalra. A viva-voce csak a saját képszerverét és az `api.anthropic.com`-ot érheti el.
  - A worker minden válaszán `X-Content-Type-Options: nosniff`, `Cache-Control: no-store`, `Referrer-Policy: no-referrer`.
- **Fájlok:** `tarsas/index.html`, `viva-voce/index.html`, `parliamo/worker/src/index.js`
- **Maradék kockázat:**
  - A kattintáseltérítés elleni védelem (`frame-ancestors`) meta tagben nem működik, a GitHub Pages pedig nem enged fejlécet. Csak Cloudflare Pagesre vagy saját domainre költözve oldható meg.
  - A `parliamo/app.html` (a claude.ai artifact-változat) szándékosan CSP nélküli, mert ott a claude.ai saját sandboxa érvényes.

### A11. Adatbázis
- **Állapot:** ⏭️ Nem vonatkozik rá
- **Miért:** nincs adatbázis. A Cloudflare KV kulcs-érték tár, lekérdezőnyelv nincs, injekció nem lehetséges. A kulcsokat a kód állítja elő, és hashelve tárolja.

### A12. Egyéb webes kockázatok
- **Állapot:** ✅ Javítva / 🙋 egy döntés
- **Mit találtam:**
  - **SSRF:** a push-feliratkozás bármilyen `https://` címet elfogadott, így a szerverrel tetszőleges címre lehetett POST-ot küldetni.
  - CSRF: nincs süti, a kód fejlécben megy, ezért nem releváns.
  - Útvonal-bejárás, nyitott átirányítás, parancsinjekció: nincs ilyen kód.
  - Véletlenszám: a VAPID-kulcsok és a titkosítás `crypto.subtle` / `getRandomValues`, ez jó.
- **Mit változtattam:**
  - A push csak a böngészők valódi push-szolgáltatásaira megy (Google FCM, Mozilla, Apple, Microsoft): https, port és belépési adat nélkül.
  - A küldés előtt is ellenőrzi a címet (két kapu), teszttel.
- **Fájlok:** `parliamo/worker/src/push.js`
- **🙋 Döntés:** ha valaki ritka böngészőt használ, amely más push-szolgáltatást használ, annak nem fog menni az emlékeztető. Biztonságos alapértelmezésként szigorúan hagytam. Ha ilyen panasz jön, a `PUSH_HOSTS` listába kell felvenni az új címet.

## [E] Munkakörnyezet

### E1. Commit előtti titokvédelem
- **Állapot:** ✅ Javítva
- **Mit változtattam:** `.pre-commit-config.yaml` gitleaks v8.21.2 hookkal. Bekapcsolni neked kell egyszer (KRITIKUS 4).
- **Fájlok:** `.pre-commit-config.yaml`

### E2. Helyi titkok
- **Állapot:** ⏭️ Nem vonatkozik rá
- **Miért:** felhőben futó, eldobható konténerben dolgoztam, nem a te gépeden. A saját gépedet nem láttam. Ha szeretnéd, a lépések: `chmod 700 ~/.ssh && chmod 600 ~/.ssh/id_*`, és nézd át a shell-előzményben (`~/.bash_history`, `~/.zsh_history`) a beírt kulcsokat.

### E3. CI/CD
- **Állapot:** ✅ Javítva
- **Mit találtam:**
  - A workflow-k alapértelmezett, tágabb tokenjoggal futottak.
  - Az actionök mozgó címkén voltak (`@v4`, `@v3`).
  - A worker telepítés előtt nem futott teszt.
  - `pull_request_target` nincs, tehát forkból jövő PR nem kap titkot.
  - A telepítés csak kézzel indítható.
- **Mit változtattam:**
  - `permissions: contents: read` mindkét workflow-ban.
  - Minden action teljes commit-SHA-ra rögzítve (verziószám kommentben).
  - A worker tesztjei futnak a CI-ban és a telepítés előtt is.
- **Fájlok:** `.github/workflows/test.yml`, `.github/workflows/parliamo-ai.yml`
- **Maradék kockázat:** a Cloudflare-hez hosszú élettartamú API-token kell (OIDC-t a Cloudflare nem támogat ehhez). Javaslat: a tokennek csak „Workers Scripts: Edit” és „Workers KV: Edit” joga legyen, és tedd egy `production` nevű GitHub Environmentbe.

### E4. Repó-beállítások
- **Állapot:** 🙋 Neked kell beállítani
- **Mit tegyél:** lásd KRITIKUS 2 (secret scanning, push protection, Dependabot, ágvédelem, 2FA, közreműködők).

### E5. Konténerek
- **Állapot:** ⏭️ Nem vonatkozik rá
- **Miért:** nincs Dockerfile és nincs compose.

### E6. Helyi szolgáltatások
- **Állapot:** 🔍 Nem találtam problémát
- **Mit találtam:** a tesztek a `127.0.0.1`-en indítanak szervert, a `wrangler dev` alapból localhoston fut. Alapjelszó sehol.

### E7. Környezetek szétválasztása
- **Állapot:** 🔍 Nem találtam problémát
- **Mit találtam:**
  - A helyi worker a `.dev.vars`-ból olvas, az éles a Cloudflare titoktárából.
  - A webapp nem mutat alapból éles szerverre: a worker címét a felhasználó adja meg.
  - Külön staging nincs. Egyszemélyes projektnél ez rendben van.

### E8. AI-ügynök beállítások
- **Állapot:** ✅ Javítva
- **Mit találtam:** nem volt AGENTS.md, és nincs repószintű ügynök-beállítás (`.claude/settings.json`, `.cursor`).
- **Mit változtattam:** új `AGENTS.md` a repó leírásával és biztonsági szabályokkal:
  - Titkot nem commitol.
  - Biztonsági ellenőrzést nem gyengít.
  - A felhasználótól, AI-tól vagy szinkronból jövő szöveget escape-eli.
  - Az AI-választ adatnak tekinti, nem utasításnak.
  - Törlés, push, telepítés, beolvasztás és főverzió-váltás előtt kérdez.
- **Fájlok:** `AGENTS.md`

### E9. MCP-szerverek
- **Állapot:** 🔍 Nem találtam problémát
- **Mit találtam:**
  - A repóban nincs MCP-beállítás (`.mcp.json` és társai).
  - Ebben a munkamenetben a claude.ai fiókszintű kapcsolatai voltak elérhetők (GitHub, Higgsfield, Claude Docs, Claude Code Remote). Ezeket a claude.ai beállításaiban kezeled, nem a repóban.
  - A GitHub-hozzáférés erre az egy repóra volt szűkítve.
- **Javaslat:** a claude.ai → Settings → Connectors alatt kapcsold ki, amit nem használsz.

### E10. Szerkesztő és eszközök
- **Állapot:** ⏭️ Nem vonatkozik rá
- **Miért:** nincs `.vscode`, `.idea` vagy automatikusan induló feladat a repóban.

### E11. Mentések
- **Állapot:** 🔍 Ajánlás
- **Mit találtam:**
  - A kód a GitHubon van.
  - A tanulási állapotot a worker hetente menti a KV-ba (az utolsó 4 marad meg), és a webappban kézi export is van.
  - A worker beállítása a `wrangler.toml`-ban van, a titkok a Cloudflare-ben.
- **Javaslat:** a Claude API-kulcsot és a belépőkódot tartsd meg egy jelszókezelőben is, hogy újratelepítésnél meglegyen.

## [P] Bővítmény

### P1–P12
- **Állapot:** ⏭️ Nem vonatkozik rá
- **Miért:** a repóban nincs bővítmény jellegű kód (böngészőbővítmény, MCP-szerver, ügynök-skill, n8n- vagy CMS-node, IDE-bővítmény). Ahol mégis volt átfedés, ott az [A] pontok alatt kezeltem:
  - Végpontok és bemenet-ellenőrzés: A5, A7.
  - SSRF: A12.
  - Kimenet escape-elése: A8.
  - Az AI-válasz adatként kezelése: AGENTS.md (E8). A webapp az AI-választ mindig szövegként jeleníti meg, és sosem hajtja végre.

## [Q] Hibakeresés

### Q1. Statikus elemzés
- **Állapot:** 🔍 Nem találtam problémát
- **Mit találtam:**
  - Nincs linter és nincs TypeScript.
  - A build szintaxis-ellenőrzést futtat, minden teszt zöld.
  - Lintert most nem vezettem be, mert új függőség lenne. Javaslatként szerepel lent.

### Q2. Logikai hibák
- **Állapot:** ✅ Javítva
- **Mit találtam:**
  - Ha a késleltetve betöltött adat (például kollokációk, próbavizsgák) letöltése hálózati hiba miatt megszakadt, a hibás ígéret bennragadt a tárban.
  - Ennek két következménye volt: az oldal üres maradt, és újrapróbálni sem lehetett, csak az app újratöltésével.
- **Mit változtattam:**
  - Megkülönböztettem a két esetet: a „nincs ilyen fájl” (404) rendben van, a „nem jött válasz” újrapróbálható.
  - Hálózati hibánál üzenet és „Újra” gomb jelenik meg.
- **Fájlok:** `parliamo/src/js/02-course-data.js`, `parliamo/tests/run.js`

### Q3. Hibakezelés
- **Állapot:** 🔍 Nem találtam problémát
- **Mit találtam:**
  - Az üres `catch` blokkok szándékosak, és kommentjük van (például „üres törzs is jó a kulcskéréshez”).
  - A worker minden hibára rövid, biztonságos kódot ad, érvénytelen bemenetre nem omlik össze (teszt: rossz JSON → 400).

### Q4. Halott kód
- **Állapot:** 🔍 Nem találtam problémát
- **Mit találtam:** egy fölösleges feltételt egyszerűsítettem (`n==="core"?"core":n`). Ennél többet nem töröltem, mert nem tudtam minden esetben biztosan igazolni, hogy a kód nincs használatban.

### Q5. Tesztek
- **Állapot:** ✅ Javítva
- **Mit változtattam:**
  - Új worker-tesztcsomag 8 teszttel:
    - Eredet és ismeretlen útvonal.
    - Próbálkozás-korlát.
    - Hiányzó belépőkód.
    - Fejlécek.
    - Méretkorlát, Content-Length nélkül is.
    - Rossz üzenet.
    - Push-engedélylista.
    - Szinkronütközés és mentéskulcs.
  - Parliamo: újrapróbálás hálózati hiba után, és két teszt az új hanglejtés-funkcióra.
- **Fájlok:** `parliamo/worker/test/worker.test.mjs`, `parliamo/tests/run.js`

## [O] Optimalizálás

### O1. Szűk keresztmetszetek
- **Állapot:** 🔍 Nem találtam problémát
- **Mit találtam:**
  - Adatbázis nincs, így N+1 lekérdezés sincs.
  - A nézetváltáskor a hangok és időzítők leállnak (`stopViews`).
  - Az új hanglejtés-elemzés 5 másodperc hangra kb. 110 ms (asztali gép), és csak a felvétel után fut.

### O2. Frontend
- **Állapot:** 🔍 Mértem, nem változtattam
- **Mit találtam:**
  - Indulás helyben kb. 190 ms, 17 kérés, 913 KB (gzip kb. 250 KB).
  - A legnagyobb tétel az `index.html` (459 KB, gzip 153 KB).
  - A podcast- (83 KB) és szócsomag-adat (49 KB) is induláskor töltődik.
- **Miért nem változtattam:** ebből az adatból épül a hanglista (`AUDIO_IDX`). Ha később töltődne, induláskor egyes mondatoknál hiányozna a felvett hang. Ez a helyesség rovására menne, ezért javaslatként hagytam.

### O3. Hálózat
- **Állapot:** 🔍 Nem találtam problémát
- **Mit találtam:**
  - A service worker gyorsítótáraz.
  - A worker válaszai `no-store`-ral mennek, mert személyes adatot tartalmaznak.
  - A ritkán kellő adatok már most is lustán töltődnek.

### O4. Build és CI
- **Állapot:** ✅ Javítva
- **Mit változtattam:** a worker lockfile-ja is bekerült az npm-gyorsítótár kulcsába, így a második `npm ci` is a gyorsítótárból dolgozik.
- **Mérés:** a kiinduló CI-idő 5 p 27 s. A PR első futása után összevethető.
- **Fájlok:** `.github/workflows/test.yml`

### O5. Egyszerűsítés
- **Állapot:** 🔍 Nem találtam problémát
- **Miért:** működő kódot csak a szépség kedvéért nem írtam át. A kockázat nagyobb lett volna, mint a nyereség.

## [F] Végső ellenőrzés

### F1. Teljes biztonsági átnézés
- **Állapot:** ✅ Javítva
- **Mit néztem át:**
  - Nincs `eval`, `new Function` vagy `document.write` a forrásban.
  - Nincsenek elkerülő hibaágak: a belépőkód-ellenőrzés minden útvonal előtt fut.
  - A titkosítás korszerű (ECDSA P-256, AES-GCM, HKDF).
  - A telepítés csak kézzel indul.
  - Az új hanglejtés-modul helyben dolgozik, semmit nem tölt fel.
- **Mit találtam és javítottam:** a méretkorlát Content-Length nélküli megkerülése (A7).
- **Maradék kockázat:**
  - A szinkron mentésnél a „verzió-ellenőrzés, aztán írás” nem atomi a KV-ban. Két pontosan egyszerre érkező mentés közül az egyik felülírhatja a másikat.
  - Egyfelhasználós appnál ez gyakorlatilag nem fordul elő, ezért nem építettem rá zárolást.

---

## Javaslatok, amelyeket nem alkalmaztam

1. **`@anthropic-ai/sdk` 0.132 → 1.x** (főverzió). Az API-hívások szerkezete változhat, ezért külön PR-ban, teszteléssel kellene. A mostani verzióra nincs ismert sérülékenység.
2. **A Parliamo saját domainre vagy aldomainre költöztetése** (A1, A10). Így külön tára lenne, és beállítható lenne a `frame-ancestors` és a `Permissions-Policy`.
3. **viva-voce: a felhasználó saját Anthropic-kulcsa localStorage-ban van**, és a böngészőből hívja közvetlenül az API-t. Biztonságosabb lenne a Parliamo workerén át, belépőkóddal. Ez viselkedésváltozás, ezért 🙋 a te döntésed.
4. **Lusta betöltés a podcast- és szócsomag-adatra** (O2): kb. 40 KB gzip megtakarítás, de át kellene építeni a hanglistát.
5. **Playwright böngésző gyorsítótárazása a CI-ban** (`actions/cache`): talán 30–60 mp-et nyerne, de a rendszerfüggőségeket így is telepíteni kell, és az előnye addig nem mérhető, amíg nincs bent.
6. **Linter (ESLint) bevezetése**: új fejlesztői függőség, ezért külön döntés.
7. **A hanglejtés-elemzés gyorsítása** gyenge telefonokra (futó energiaszámítás vagy Web Worker), ha a gyakorlatban lassúnak bizonyul.

## Így ellenőrizheted magad

```bash
# függőségek és tesztek
npm ci && npx playwright install chromium
python3 tools/build.py && python3 parliamo/build.py && git status --short   # üres kimenet = rendben
npm test                                   # 547 rendben
node parliamo/tests/run.js                 # 136 ok
(cd parliamo/worker && npm ci && npm test) # 8 pass
npm audit; (cd parliamo/worker && npm audit)   # 0 vulnerabilities

# titokkeresés (gitleaks telepítve)
gitleaks git . && gitleaks dir .

# élő worker (újratelepítés után): rossz kóddal 11. próbára 429
for i in $(seq 11); do curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  -H "Origin: https://jtdevzero.github.io" -H "x-app-key: rossz" \
  https://<a-worker-cimed>/sync/get; done
```

## Az újraellenőrzés során talált saját hibák

1. **Méretkorlát Content-Length nélkül.** Az első javításom csak a fejlécet és a `/chat` törzsét nézte. A diff újraolvasásakor vettem észre, hogy a push-útvonalak és a mentés-letöltés a törzset ellenőrzés nélkül olvassák be. Javítottam, és írtam rá tesztet, amely a javítás nélkül elbukik.
2. **Halvány görbe világos módban.** Az új hanglejtés-görbén a saját vonal sárga volt, ez a világos háttéren kb. 1,6:1 kontrasztú (grafikánál legalább 3:1 kellene). Átírtam a zöld (`--ok`) színre: világos módban kb. 4,6:1, sötétben is jól látszik.
3. **Hiányzó `.env` kizárás.** Az AGENTS.md-ben azt írtam, hogy a helyi titkok ki vannak zárva a repóból. Ez a `.dev.vars`-ra igaz volt, a `.env`-re és a kulcsfájlokra nem. Pótoltam.
4. **Korábbi körből:** az első újrapróbálás-teszt olyan adatfájlt nézett, ami már be volt töltve, ezért nem tesztelt semmit. Átírtam egy először betöltődő útvonalra.
5. **Korábbi körből:** a worker `npm test` parancsa rossz volt („Cannot find module test”). Javítottam: `node --test test/worker.test.mjs`.
