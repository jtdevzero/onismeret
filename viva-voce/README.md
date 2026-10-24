# Viva Voce

Nyelvtanuló webapp, ami azt csinálja, amit a Duolingo nem: **tényleg hosszú távú memóriára optimalizál**, valós mondatokkal és kiejtésgyakorlással. Nincs szív, reklám, liga vagy fizetőfal. Két nyelv, magyarul tanítva, a fejlécben egy koppintással váltható:

- **Olasz A1–B1:** 30 lecke, 549 kifejezés és mondat, 9 hangos történet, 25 ige teljes ragozása.
- **Angol:** általános ág (A1–B1, 12 lecke) és üzleti ág (B2–C1, 10 lecke: networking, megbeszélés, prezentáció, tárgyalás, e-mail, hívások, pénzügy, projektvezetés, visszajelzés, idiómák), összesen 396 kifejezés, 4 történet, 50 rendhagyó ige.

A haladás nyelvenként külön tárolódik, a napi sorozat és a napi cél közös.

## Miben más

| | Duolingo | Viva Voce |
|---|---|---|
| Ismétlés ütemezése | zárt, a megtartás helyett az aktivitásra hangolt | **FSRS-4.5** (ugyanaz, mint az Ankiban): minden kifejezés akkor jön vissza, amikor ~90% eséllyel még tudod |
| Feladattípus | sokszor felismerés (választás) | **progresszív nehézség**: választás → kirakás → gépelés → diktálás → kimondás, ahogy a szó stabilizálódik |
| Tartalom | gyakran abszurd mondatok | **valós helyzetek**: kávézó, utazás, étterem, bevásárlás, üzleti megbeszélés |
| Nyelvtan | rejtett | minden lecke előtt rövid, magyar nyelvű magyarázat |
| Kiejtés | korlátozott | böngészős felolvasás + beszédfelismerés (`it-IT`) |
| Hibák | szívvesztés | a rossz válasz pár feladat múlva könnyebb formában visszajön; elírásnál felülbírálhatod |
| Adatok | szerveren | csak a böngésződben, export/import JSON-ban |

## Hogyan működik

- **Napi kör:** először az esedékes ismétlések (a leginkább felejtőben lévők elöl), közéjük keverve a napi új anyag (alapból 8).
- **Új kifejezés:** bemutatás hanggal és példamondattal → két feladat múlva ellenőrzés → ettől kezdve az FSRS ütemezi.
- **Automatikus értékelés:** rossz = 1, ékezet- vagy névelőhiba, kis elírás = 2, jó = 3, gyors és hibátlan gépelés = 4.
- **Statisztika:** valódi megtartási arány (30 nap), 7 napos előrejelzés, 16 hetes aktivitási hőtérkép.
- **Beszélgetőtárs (Beszélj fül):** szerepjáték olaszul a leckék helyzeteiben (kávézó, orvos, ügyféltárgyalás…), a már tanult szókinccsel. Minden mondatod után kijavítja, és magyarul elmagyarázza a hibát. Saját Claude API-kulccsal működik (`claude-haiku-5-5`), a kulcs csak a böngészőben tárolódik, a kérés közvetlenül az Anthropichoz megy.
- **Téma:** sötét alapból, választható világos vagy rendszer szerinti.
- **Illusztrációk:** minden leckéhez saját, festett olasz plakát-illusztráció (Higgsfield, GPT Image), a főoldalon nagy képpel.
- **Útlevél:** minden befejezett leckéért pecsét (*timbro*) jár, a Haladás fülön gyűlnek.
- **Történetek (Gyakorlás fül):** 9 hangos párbeszédes történet két hanggal (A1–B1), közben értésellenőrző kérdésekkel. A szöveg mindig olaszul jelenik meg, a fordítás koppintásra.
- **Igeedző:** 25 gyakori ige 5 igeidőben (jelen, passato prossimo, imperfetto, jövő, feltételes), minden alak hanggal. A kérdéseket a saját hibaarányod alapján súlyozza, és a teljes ragozási táblát mutatja.
- **A hibáim:** külön kör a valaha elrontott kifejezésekből, a legtöbbször rontottakkal kezdve.
- **Napi cél és emlékeztető:** percben mért cél (csak az aktív tanulási idő számít), naptárbejegyzésként letölthető napi emlékeztető (.ics), heti összefoglaló a múlt héthez képest.

## Futtatás

Statikus oldal, nincs build lépés. Élő változat: https://jtdevzero.github.io/onismeret/viva-voce/

```bash
# helyben
python3 -m http.server 8000
# majd: http://localhost:8000
```

A fájl közvetlen megnyitása (`file://`) nem működik, mert a tananyag JSON-ból töltődik.

### GitHub Pages

Settings → Pages → *Deploy from a branch* → `main` / root. Telefonon a böngésző menüjéből „Hozzáadás a kezdőképernyőhöz”, ezután offline is fut.

### Hang

- **Leckék:** minden kifejezés előre felvett hangfájl (`audio/it/<id>.mp3`), a [Kokoro](https://github.com/thewh1teagle/kokoro-onnx) neurális modell olasz női hangjával (`if_sara`). Minden telefonon szól, offline is.
- **Beszélgetőtárs:** a szabad mondatokat a rendszer olasz felolvasója mondja.
- **Beszédfelismerés:** Chrome-ban és Safariban működik (Firefoxban nem), mikrofon-engedély kell.

## Új nyelv vagy tananyag hozzáadása

A tananyag a `data/it.json`-ban van:

```json
{
  "id": "u2", "title": "Al bar", "hu": "Kávézóban",
  "grammar": [{ "h": "Cím", "p": "Magyarázat" }],
  "items": [
    { "id": "u2-w1", "k": "w", "it": "il caffè", "hu": "a kávé" },
    { "id": "u2-s1", "k": "s", "it": "Vorrei un caffè.", "hu": "Egy kávét kérnék.", "alt": ["Un caffè, per favore."] }
  ]
}
```

`k`: `w` = szó/kifejezés, `s` = mondat · `alt`: elfogadott alternatív válaszok. Az `id` legyen stabil, mert ehhez kötődik a haladás.

## Fájlok

```
index.html            váz
style.css             „Notte italiana” arculat: éjszakai palackzöld, elefántcsont, okker; olasz szöveg Bodoni dőlt
fonts/                Bodoni Moda és Instrument Sans helyben (SIL OFL)
audio/it/             előre felvett hangfájlok (Kokoro: if_sara, im_nicola)
fsrs.js               FSRS-4.5 ütemező (Node-ban is tesztelhető)
app.js                nézetek, gyakorlattípusok, hang, tárolás
data/it.json          olasz A1–B1 csomag: 30 lecke, 549 kifejezés és mondat
data/stories-it.json  9 történet kérdésekkel
data/verbs-it.json    25 ige × 5 igeidő ragozása
data/en.json, stories-en.json, verbs-en.json   angol csomag
audio/en/             angol hang (Kokoro: af_heart, am_michael)
audio/it/st, vb/      a történetek és az igealakok hangja
sw.js, manifest.webmanifest, icons/   PWA / offline
```

## Ütemterv

- [x] A2 olasz csomag (visszaható igék, imperfetto, feltételes mód, jövő idő, névmások)
- [x] AI beszélgetőtárs a leckék szókincsével
- [x] Sötét téma
- [x] B1 szint, történetek, igeedző, hibakör, napi cél
- [x] Angol: általános és üzleti ág, nyelvváltó
- [ ] Szinkron eszközök között (szerver kell hozzá; addig export/import)

## Licenc

MIT
