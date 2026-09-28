# Önismereti térképek

Harmincegy önismereti kérdőív magyarul, statikus HTML fájlok, GitHub Pages-en futtatható.

**Live:** [`https://jtdevzero.github.io/onismeret/`](https://jtdevzero.github.io/onismeret/) (miután a GitHub Pages be van kapcsolva: Settings → Pages → Branch: main → / (root))

---

## Mit tartalmaz

| Kategória | Teszt | Item | Fájl |
|---|---|---|---|
| **I. Test-tudatosság** | MAIA-2 (interocepció) | 37 | `maia2.html` |
| | TAS-20 (alexitímia) | 20 | `terkepek.html#test-tas` |
| | DES-II (disszociáció) | 28 | `funkcio.html#test-des` |
| **II. Kötődés + séma** | ECR-R (párkapcsolati kötődés) | 36 | `terkepek.html#test-ecr` |
| | Kötődési mélytérkép (saját, nem validált) | 60 | `kotodes-melyterkep.html` |
| | YSQ-L (Young séma-kérdőív) | 244 | `ysq.html` |
| | SMI (Young séma-módusz) | 65 | `terkepek.html#test-smi` |
| | SSSS (szex-önkép, férfi) | 27 | `attitudok.html#test-ssss` |
| **III. Szex-funkció** | SIS/SES (gátlás/serkentés) | 45 | `sis-ses.html` |
| | IIEF-15 (férfi funkció) | 15 | `funkcio.html#test-iief` |
| | PEDT (ejakuláció) | 5 | `funkcio.html#test-pedt` |
| | SDI-2 (szex-vágy) | 14 | `funkcio.html#test-sdi` |
| **IV. Szex-attitűd** | NSSS (elégedettség) | 20 | `attitudok.html#test-nsss` |
| | SAQ (szexuális tudatosság, Snell) | 36 | `attitudok.html#test-saq` |
| **V. Kapcsolati nyelvek** | Love Languages | 30 pár | `nyelvek.html#test-love` |
| | Apology Languages | 20 pár | `nyelvek.html#test-apo` |
| | Imago | 57 | `nyelvek.html#test-imago` |
| **VI. Személyiség + erők** | IPIP-NEO-60 (Big Five) | 60 | `szemelyiseg.html#test-bf` |
| | VIA-72 (karakter-erők) | 72 | `szemelyiseg.html#test-via` |
| **VII. Kapcsolati dinamika** | LAS-SF (szeretetstílus) | 24 | `kapcsolat.html#test-las` |
| | Konfliktusmódok (Thomas–Kilmann-modell, saját itemek) | 25 | `kapcsolat.html#test-tki` |
| | Gottman-térkép (saját itemek) | 32 | `kapcsolat.html#test-gott` |
| | Fisher-temperamentum (saját itemek) | 40 | `kapcsolat.html#test-fti` |
| **VIII. Értékek, cselekvés, ritmus** | Schwartz PVQ-21 (értékek) | 21 | `cselekves.html#test-pvq` |
| | Négy tendencia (Rubin-modell, saját helyzetek) | 12 | `cselekves.html#test-ft` |
| | Cselekvési módok (Kolbe-modell, saját itemek) | 24 | `cselekves.html#test-kolbe` |
| | MEQ (kronotípus) | 19 | `cselekves.html#test-meq` |
| **IX. Szabályozás és végrehajtás** | IPS (halogatás) | 9 | `szabalyozas.html#test-ips` |
| | DERS-SF (érzelemszabályozás) | 18 | `szabalyozas.html#test-ders` |
| | SCS-SF (önegyüttérzés) | 12 | `szabalyozas.html#test-scs` |
| | TFEQ-R18 (evési viselkedés) | 18 | `szabalyozas.html#test-tfeq` |

**Összesen: 31 teszt, 1145 kérdés, 9 témakör.**

---

## Fájlstruktúra

```
self-knowledge-suite/
├── index.html          Landing page — haladásjelző, témakör-navigáció, kártyák, mentés/visszaállítás
├── osszegzes.html      Kereszt-összegzés: visszatérő minták, változás, újramérés, idővonal
├── fonts/              Helyben tárolt betűtípusok (Fontsource, SIL OFL, latin + latin-ext)
├── README.md           Ez a fájl
├── maia2.html          MAIA-2 (standalone)
├── sis-ses.html        SIS/SES (standalone)
├── ysq.html            YSQ-L (standalone)
├── kotodes-melyterkep.html  Kötődési mélytérkép (standalone)
├── terkepek.html       ECR-R + SMI + TAS-20 (hub, 3 fül)
├── funkcio.html        IIEF-15 + PEDT + SDI-2 + DES-II (hub, 4 fül)
├── attitudok.html      SSSS + NSSS + SAQ (hub, 3 fül)
├── nyelvek.html        Love + Apology + Imago (hub, 3 fül)
├── szemelyiseg.html    Big Five + VIA (hub, 2 fül)
├── kapcsolat.html      LAS + Konfliktus + Gottman + Fisher (hub, 4 fül)
├── cselekves.html      PVQ-21 + Négy tendencia + Cselekvési módok + MEQ (hub, 4 fül)
├── szabalyozas.html    IPS + DERS-SF + SCS-SF + TFEQ-R18 (hub, 4 fül)
└── par.html            Párkapcsolati mód: két profil egymás mellett
```

Minden oldal önálló: inline CSS és JS, külső szerverhez nem fordul. A betűtípusok a `fonts/` mappából töltődnek. Ha egyetlen HTML-fájlt küldesz el valakinek, az mappa nélkül is működik, csak rendszerbetűkkel jelenik meg.

---

## Adatkezelés

- **Válasz és eredmény nem hagyja el a böngészőt.** Nincs analytics, nincs cookie, nincs külső kérés (a betűtípusok is helyben vannak). Az oldal betöltése viszont hálózati kérés: a GitHub Pages a látogatók IP-címét biztonsági célból naplózhatja.
- **Automatikus mentés `localStorage`-ba.** Ha félbehagyod és később visszatérsz, ott folytatod.
- **Storage kulcsok** (haladóknak):
  - `maia2-responses-v2` (2026-09: a tételkészlet az eredeti MAIA-2-höz igazítva, a korábbi v1 válaszok nem kompatibilisek)
  - `sis-ses-responses-v1`
  - `ecr-r-responses-v1`, `smi-responses-v1`, `tas-20-responses-v1`
  - `iief-responses-v1`, `pedt-responses-v1`, `sdi-2-responses-v1`, `des-2-responses-v1`
  - `ssss-responses-v1`, `nsss-responses-v1`, `saq-responses-v1`
  - `love-responses-v1`, `apo-responses-v1`, `imago-responses-v1`
  - `bf-responses-v1`, `via-responses-v1`
  - `las-responses-v1`, `conflict-responses-v1`, `gottman-responses-v1`, `fisher-responses-v1`
  - `pvq21-responses-v1`, `four-tendencies-responses-v1`, `action-modes-responses-v1`, `meq-responses-v1`
  - `ips-responses-v1`, `ders-sf-responses-v1`, `scs-sf-responses-v1`, `tfeq-r18-responses-v1`
  - `onismeret-meta-v1` — az utolsó válasz ideje tesztenként (ebből lesz a kitöltés dátuma)
  - `onismeret-settings-v1` — pl. az újramérési emlékeztető (ki / 90 / 180 / 365 nap)
  - `onismeret-undo-v1` — az utolsó visszaállítás előtti állapot (7 napig)
  - `onismeret-partner-v1` — a párod betöltött összesített eredményei (a nyers válaszai nem)
  - `ysq_autosave`, `ysq_snapshots`, `ysq_log` stb. (YSQ)
  - `attachment_assessment_v1` (Kötődési mélytérkép)
  - `onismeret-results-v1` — közös eredménytár: minden teszt a kiértékeléskor ide menti a fő pontszámait dátummal (tesztenként legfeljebb 24 kitöltés, naponta egy). Ebből dolgozik az összegzés és az újramérés-jelzés.
- **JSON export** minden tesztnél — ha meg akarod mutatni terapeutának.
- **Mentés fájlba / Visszaállítás fájlból** a főoldalon: minden teszt összes adata egy JSON-fájlba, és vissza. Így lehet gépet vagy böngészőt váltani, illetve biztonsági mentést készíteni. A visszaállítás csak a fájlban szereplő teszteket írja felül.

## Összegzés (`osszegzes.html`)

- **Visszatérő minták:** 16 szabály, például szorongó vagy elkerülő kötődés, „indít, de nem zár le”, elemzési bénultság, teljesítmény-hajtás vagy önfeláldozó minta. Egy minta csak akkor jelenik meg, ha legalább két teszt ugyanabba az irányba mutat. A küszöbök heurisztikák, nem klinikai határértékek.
- **Profil tesztenként** a legutóbbi eredménnyel, ▲▼ változással az előző kitöltéshez képest.
- **Újramérés:** 90 nap után a főoldalon és az összegzésben is jelez.
- **Idővonal** az összes kiértékelésről.
- **Terapeuta-összefoglaló (PDF):** világos, nyomtatható riport a kiválasztott tesztekről és mintákról. Az érzékeny témák (szexuális tesztek, DES-II, TFEQ) alapból ki vannak kapcsolva.

## Kitöltést segítő funkciók (minden oldalon)

- **Folytatás:** ha egy tesztet félbehagytál, bal alul „Folytatás: N. kérdés ›” gomb visz az első megválaszolatlanhoz.
- **Fókusz mód:** egyszerre egy kérdés, válasz után automatikus továbblépés, billentyűzettel is (1–9 = válasz, ←/→ = lapozás, Esc = kilépés). A végén a kihagyott kérdésekhez ugrik, utána az eredménygombhoz.
- **Mentési visszajelzés:** „Mentve ezen az eszközön ✓”. Ha a mentés nem sikerül (tele a tárhely, privát ablak), látható figyelmeztetést ad.
- **Eredménytörténet:** a dátum a tényleges kitöltés ideje, minden eredmény mellett ott a pontozási verzió, és egy eredmény puszta újranyitása nem számít új kitöltésnek.

## Kezdő útvonal

Öt teszt (Négy tendencia → Cselekvési módok → ECR-R → Big Five → PVQ-21, kb. 40 perc), amelyek az összegzés mintáinak alapját adják. A főoldalon panel mutatja az állást. Minden teszt kiértékelése után lent megjelenik a „Következő lépés” sáv.

## Párban (`par.html`)

A párod a saját eszközén kitölti a párteszteket (szeretet- és bocsánatkérési nyelvek, LAS, Gottman, konfliktusmódok, kötődés, Fisher, értékek, Négy tendencia, MEQ, Big Five), és elküldi a mentésfájlját. Betöltve csak az összesített eredményei kerülnek be. Az oldal egymás mellé teszi a két profilt, kiemeli a nagy eltéréseket, és párdinamikai jelzéseket ad (pl. szorongó–elkerülő csapda, eltérő szeretetnyelv, konfliktusmód-kombinációk, értékeltérések, kronotípus).
- A régebben kitöltött teszteknél (a közös eredménytár előttről) az eredményt egyszer újra meg kell nyitni, hogy bekerüljön.

---

## GitHub Pages telepítés

### Ha még nincs `jtdevzero.github.io` repód

```bash
# 1. Klónold le a repót (üresen)
cd ~/Documents  # vagy ahova akarod
git clone https://github.com/jtdevzero/jtdevzero.github.io.git
cd jtdevzero.github.io

# 2. Másold be a fájlokat
cp -R /path/to/self-knowledge-suite/* .

# 3. Commit + push
git add .
git commit -m "Initial upload: self-knowledge suite"
git push origin main
```

Néhány perc, és élesben elérhető: `https://jtdevzero.github.io`

### Ha már van tartalmad ott, és almappa alá szeretnéd tenni

```bash
cd ~/Documents/jtdevzero.github.io
mkdir -p tests
cp -R /path/to/self-knowledge-suite/* tests/
git add tests/
git commit -m "Add self-knowledge test suite"
git push origin main
```

Elérhető: `https://jtdevzero.github.io/tests/`

### Új dedikált repó (nem a fő `.github.io` alá)

```bash
# GitHub-on hozz létre új publikus repót: pl. `onismereti-terkepek`
cd ~/Documents
git clone https://github.com/jtdevzero/onismereti-terkepek.git
cd onismereti-terkepek
cp -R /path/to/self-knowledge-suite/* .
git add .
git commit -m "Initial upload"
git push origin main

# Aktiváld a Pages-t: GitHub repo → Settings → Pages →
#   Source: Deploy from a branch → Branch: main → / (root) → Save
```

Elérhető pár perc múlva: `https://jtdevzero.github.io/onismereti-terkepek/`

---

## Használati javaslat

- **Egy teszt egy ülésben.** Ne akarj minden térképet egyszerre kirakni — az adatot fel is kell dolgozni.
- **Aludj rá.** A kiértékelést olvasd újra 1-2 nap múlva. Az első reakció ritkán a végleges.
- **Terapeutával.** Ha van heti terápiád, vidd el az eredményeket. Amit a szám mond + amit közösen olvastok ki belőle, két különböző dolog.
- **Nem diagnózis.** Ha bármelyik eredmény aggodalmat kelt (különösen SMI, DES-II, IIEF-15 nagyon alacsony), az kérdez, nem válaszol. Vidd szakemberhez.

---

## Klinikai háttér (rövid)

- **MAIA-2** — Mehling et al., 2018. 8 skála, 37 tétel, 0–5. 2026-09-ben tételenként az eredetihez igazítva (skálák, fordított tételek).
- **TAS-20** — Bagby, Parker, Taylor, 1994. Alexitímia arany-standard.
- **DES-II** — Carlson & Putnam, 1993. Disszociatív élmények szűrése.
- **ECR-R** — Fraley, Waller, Brennan, 2000. Attachment researchre a legelterjedtebb.
- **YSQ-L** — Young & Brown. Korai maladaptív sémák, 19 séma × 5 domén.
- **Kötődési mélytérkép** — saját fejlesztés. Az ECR-R szorongás/elkerülés tengelyeire épít, és kontextus-, aktivációs stratégia-, mentalizáció- és earned security-modullal bővíti. Nem validált.
- **SMI** — Young et al., 2007. Schema-Focused Therapy módszertani alapja.
- **SIS/SES** — Bancroft & Janssen, 2002. Dual-control model empirikus mérése.
- **IIEF-15** — Rosen et al., 1997. Urológiai arany-standard.
- **PEDT** — Symonds et al., 2007. Premature ejaculation dg. eszköze.
- **SDI-2** — Spector, Carey, Steinberg, 1996. Vágy diadikus/szoliter szeparálva.
- **SSSS** — Andersen & Cyranowski, 1994. Sexual Self-Schema.
- **NSSS** — Štulhofer, Buško, Brouillard, 2010.
- **SAQ** — Sexual Awareness Questionnaire, Snell, Fisher & Miller, 1991. 4 alskála.
- **Love / Apology Languages** — Chapman, 1992, 2006. Nem tudományos, de népszerű keret.
- **Imago** — Hendrix, 1988. Klinikai gyakorlatban használt önreflexiós keret.
- **IPIP-NEO-60** — Goldberg et al., IPIP.ori.org. NEO-PI-R open-source változat.
- **VIA-72** — Peterson & Seligman, 2004. VIA Institute char strengths.
- **LAS-SF** — Hendrick, Hendrick & Dicke, 1998. Lee szeretetstílusai, 6 × 4 item. Validált.
- **Konfliktusmódok** — Thomas & Kilmann, 1974 modellje. A TKI jogvédett, ezért saját Likert-itemkészlet. Nem validált.
- **Gottman-térkép** — Gottman, 1994, 1999 (Sound Relationship House, négy lovas). Saját itemek. Nem validált.
- **Fisher-temperamentum** — Fisher et al., 2015. Az FTI jogvédett, ezért saját itemek. Nem validált.
- **PVQ-21** — Schwartz, 2003 (European Social Survey). Centrált (MRAT) pontozás. Validált.
- **Négy tendencia** — Rubin, 2017. Saját helyzetkérdőív. A keretrendszer maga sem validált.
- **Cselekvési módok** — Kolbe, 1990 modellje. A Kolbe A Index fizetős és jogvédett, ezért saját itemek, 1–10 skálára vetítve. Nem validált.
- **MEQ** — Horne & Östberg, 1976. Kronotípus, 16–86 pont, 5 kategória. Validált.
- **IPS** — Steel, 2010. Irracionális halogatás, 9–45. Validált.
- **DERS-SF** — Kaufman et al., 2016 (Gratz & Roemer, 2004 alapján). 6 terület × 3 tétel. Validált.
- **SCS-SF** — Raes et al., 2011 (Neff, 2003). Önegyüttérzés, 12 tétel. Validált.
- **TFEQ-R18** — Karlsson et al., 2000. Érzelmi evés, kontrollálatlan evés, kognitív visszafogás, 0–100. Validált. Nem étkezési zavar szűrése.

Minden kérdőív magyar nyelvre lett adaptálva egyeztetett szakmai fordítással.

---

---

## Arculat

- **Két téma:** világos (alapértelmezett) és sötét. A jobb alsó ☾/☀ gombbal váltható, a választás minden oldalon megmarad (`onismeret-settings-v1.theme`).
- **Világos:** hűvös palaszürke háttér (#f8fafc / #f1f5f9 / #e2e8f0), sötét palaszöveg, mély smaragd, zafír és burgundi kiemelés, arany akcentus. **Sötét:** sötétkék háttér ugyanezekkel az ékszerszínekkel, élénkebb árnyalatban.
- **Tipográfia:** címek Lora, szöveg Inter, minden oldalon. A régi családnevek (Fraunces, Cardo, Playfair, DM Serif, Manrope, Nunito, DM Sans) a `fonts/fonts.css`-ben álnévként ugyanezekre a fájlokra mutatnak.
- **Megvalósítás:** `assets/theme.css`, az utolsó stíluslap minden oldal fejlécében. A különböző oldalcsaládok (pala-hubok, sötétkék hubok, főoldal/összegzés/pár, MAIA-2, SIS/SES, Kötődési mélytérkép, YSQ) saját színváltozóit képezi le a két közös palettára. A YSQ saját sötét módja a közös beállítást követi.

## Fejlesztés

```
src/                 A motoros hub-oldalak forrása (engine.js, stílusok, hubs/*.hub.html + *.tests.js)
assets/oni-core.js   Közös mag minden oldalon: téma, eredménytár, kitöltési alkalmak, verziók, kitöltés-segéd, mentési visszajelzés
assets/theme.css     Egységes arculat: világos/sötét téma minden oldalcsaládra
tools/build.py       Hubok generálása + a közös mag bekötése minden oldalba
tests/run.js         Automatikus ellenőrzés (Playwright)
```

- **Build:** `python3 tools/build.py`. A `kapcsolat.html`, `cselekves.html` és `szabalyozas.html` generált fájl, ezeket a `src/` mappában szerkeszd.
- **Tesztek:** `npm i --no-save playwright && npx playwright install chromium && node tests/run.js`. Ellenőrzi az oldalak betöltését (JS-hiba, külső kérés), a mélylinkeket és a darabszámokat, a pontozási szélsőértékeket és a fordított tételeket, a kitöltési alkalmakat (újranyitás, javítás, azonos pontszámú újramérés, verzióváltás), az NSSS hiányos kitöltését, a mintaszabályokat, valamint az importot, a visszavonást és a párexportot. GitHub Actions minden feltöltéskor lefuttatja.
- **Verziók:** ha egy teszt tételei vagy pontozása változik, emeld a verzióját az `assets/oni-core.js` `VERS` táblájában. Az eltérő verziójú eredményeket az összegzés nem hasonlítja össze.

## Eredménykezelés

- **Kitöltési alkalom:** minden kitöltés saját azonosítót kap. A dátuma az utolsó válasz ideje. Egy eredmény újranyitása nem új mérés, és nem változtatja a dátumot. Egy másik napon, azonos pontszámmal végzett újramérés viszont új bejegyzés. Az ugyanazon a napon módosított válaszok javításnak számítanak.
- **Verzió:** minden eredmény mellett ott a kérdéssor- és a pontozásverzió, az exportban és a terapeuta-riportban is.
- **NSSS:** ha a partner-kérdésekre nem mind válaszolsz, csak a saját tapasztalat alskála kap eredményt, a partner-alskála és az összpontszám nem.
- **Visszaállítás:** tartalmi ellenőrzés tesztenként (kérdésazonosítók, értékek, dátumok, eredményszerkezet). Előtte automatikus visszavonási pont készül, amely 7 napig egy gombbal visszaállítható.
- **Párexport** (Párban oldal): csak a párteszt-eredmények, nyers válaszok nélkül.

---

## Licenc / szerzőség

A kérdőívek maguk a felsorolt szerzők tulajdonai — kutatási + személyes önismereti célra szabadon használhatók a legtöbb esetben. Kereskedelmi célra vagy nagymintás kutatásra ellenőrizd az eredeti források licencét.

A HTML/CSS/JS kód JT saját munkája + AI-assisted (Claude). MIT license.

---

**Készült:** 2025–2026 · Budapest · JT
