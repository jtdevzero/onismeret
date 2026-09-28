# Önismereti térképek

Huszonhét önismereti kérdőív magyarul, statikus HTML fájlok, GitHub Pages-en futtatható.

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
| | SAQ (attitűd) | 36 | `attitudok.html#test-saq` |
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

**Összesen: 27 teszt, 1088 kérdés, 8 témakör.**

---

## Fájlstruktúra

```
self-knowledge-suite/
├── index.html          Landing page — haladásjelző, témakör-navigáció, kártyák
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
└── cselekves.html      PVQ-21 + Négy tendencia + Cselekvési módok + MEQ (hub, 4 fül)
```

Minden fájl **teljesen önálló** — inline CSS, JS, semmi external asset a Google Fonts kivételével. Ez azt jelenti, hogy ha csak egy fájlt küldesz el valakinek, működik.

---

## Adatkezelés

- **Semmi adat nem hagyja el a böngészőt.** Nincs analytics, nincs cookie, nincs szerver-hívás (Google Fonts kivételével, azt ki lehet kapcsolni).
- **Automatikus mentés `localStorage`-ba.** Ha félbehagyod és később visszatérsz, ott folytatod.
- **Storage kulcsok** (haladtás esetére):
  - `maia2-responses-v1`
  - `sis-ses-responses-v1`
  - `ecr-r-responses-v1`, `smi-responses-v1`, `tas-20-responses-v1`
  - `iief-responses-v1`, `pedt-responses-v1`, `sdi-2-responses-v1`, `des-2-responses-v1`
  - `ssss-responses-v1`, `nsss-responses-v1`, `saq-responses-v1`
  - `love-responses-v1`, `apo-responses-v1`, `imago-responses-v1`
  - `bf-responses-v1`, `via-responses-v1`
  - `las-responses-v1`, `conflict-responses-v1`, `gottman-responses-v1`, `fisher-responses-v1`
  - `pvq21-responses-v1`, `four-tendencies-responses-v1`, `action-modes-responses-v1`, `meq-responses-v1`
  - `ysq_autosave`, `ysq_snapshots`, `ysq_log` stb. (YSQ)
  - `attachment_assessment_v1` (Kötődési mélytérkép)
- **JSON export** minden tesztnél — ha meg akarod mutatni terapeutának.

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

- **MAIA-2** — Mehling et al., 2018. 8 dimenzió × 37 item. Használva testtudatosság + trauma + krónikus fájdalom kutatásokban.
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
- **SAQ** — Hendrick & Hendrick, 1987.
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

Minden kérdőív magyar nyelvre lett adaptálva egyeztetett szakmai fordítással.

---

## Licenc / szerzőség

A kérdőívek maguk a felsorolt szerzők tulajdonai — kutatási + személyes önismereti célra szabadon használhatók a legtöbb esetben. Kereskedelmi célra vagy nagymintás kutatásra ellenőrizd az eredeti források licencét.

A HTML/CSS/JS kód JT saját munkája + AI-assisted (Claude). MIT license.

---

**Készült:** 2025–2026 · Budapest · JT
