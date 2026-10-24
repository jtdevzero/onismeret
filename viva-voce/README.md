# Viva Voce

Nyelvtanuló webapp, ami azt csinálja, amit a Duolingo nem: **tényleg hosszú távú memóriára optimalizál**, valós mondatokkal és kiejtésgyakorlással. Nincs szív, reklám, liga vagy fizetőfal. Első nyelvcsomag: **olasz A1–A2, magyarul** (18 lecke, 333 kifejezés és mondat).

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

- **Felolvasás:** a rendszer olasz hangját használja. Ha nincs, Androidon a Google Speech Services-ben, iOS-en a Kisegítő lehetőségek → Felolvasott tartalom → Hangok menüben tölthető le.
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
style.css             megjelenés: maiolica csempekeret, olasz szöveg Cardo dőlt, magyar Inter
fonts/                Cardo és Inter helyben (SIL OFL), nincs külső kérés
fsrs.js               FSRS-4.5 ütemező (Node-ban is tesztelhető)
app.js                nézetek, gyakorlattípusok, hang, tárolás
data/it.json          olasz A1 csomag: 10 lecke, 189 kifejezés és mondat
sw.js, manifest.webmanifest, icons/   PWA / offline
```

## Ütemterv

- [x] A2 olasz csomag (visszaható igék, imperfetto, feltételes mód, jövő idő, névmások)
- [x] AI beszélgetőtárs a leckék szókincsével
- [x] Sötét téma
- [ ] Második nyelv a nyelvválasztóval
- [ ] Szinkron eszközök között (szerver kell hozzá; addig export/import)

## Licenc

MIT
