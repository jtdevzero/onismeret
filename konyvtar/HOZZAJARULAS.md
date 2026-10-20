# Bővítés: új forrás felvétele

A könyvtárnak egyetlen forrása van: [`src/konyvtar.json`](../src/konyvtar.json). Ebből generálódik minden alkönyvtár `README.md`-je és a böngészős oldal adata (`assets/konyvtar-data.js`). A generált fájlokat ne szerkeszd kézzel.

## Lépések

1. Vegyél fel egy elemet az `items` tömbbe:

```json
{"id": "rovid-azonosito", "c": "konyvek", "t": "konyv",
 "ti": "Eredeti cím", "hu": "Magyar cím, ha biztosan megjelent", "a": "Szerző", "y": 2020,
 "ev": "B", "tg": ["szokasok"], "ts": ["bscs"],
 "w": "Egy-két mondat: miért érdemes, mennyire megalapozott, kinek."}
```

2. Futtasd: `python3 tools/build.py`, majd `npm test`.

## Mezők

| Mező | Kötelező | Jelentés |
|---|---|---|
| `id` | igen | kisbetű, szám, kötőjel; 2–40 karakter, egyedi |
| `c` | igen | alkönyvtár: `konyvek`, `modszerek`, `gyakorlatok`, `tesztek`, `eszkozok`, `hallgatnivalo`, `elmelet`, `magyar` |
| `c2` | nem | második alkönyvtár, ha két helyen is meg kell jelennie |
| `t` | igen | típus: `konyv`, `modszer`, `gyakorlat`, `teszt`, `eszkoz`, `podcast`, `kurzus`, `kutatas`, `segitseg` |
| `ev` | igen | bizonyítékszint: `A` erős · `B` ígéretes · `C` gyakorlati/elméleti · `V` vitatott |
| `tg` | igen | témacímkék (`meta.tags`); az első a fő téma, e szerint csoportosít |
| `ts` | igen | kapcsolódó tesztek azonosítói az `assets/registry.js`-ből (lehet üres) |
| `w` | igen | ismertető, őszintén a korlátokról is |
| `u` | nem | link, csak `https://` vagy `tel:` |
| `site` | nem | belső oldal, pl. `edzes.html` |
| `hu`, `a`, `y` | nem | magyar cím, szerző, év |
| `how`, `time` | gyakorlatnál | lépések tömbje és időigény |

## Szabályok

- **Bizonyítékszint őszintén.** Ha a fő állítás nem replikálódott, `V`, és az ismertető mondja meg, miért.
- **Magyar cím csak akkor, ha biztos.** Ha nem tudod, hagyd el a `hu` mezőt.
- **Nincs reklámlink, nincs affiliate.** Elsődleges forrás (kiadó, szerző, kutatóintézet, GitHub-repó).
- **Segélyvonal csak ellenőrzött számmal.**

A build megáll, ha egy azonosító ismétlődik, egy teszt vagy belső oldal nem létezik, vagy egy útvonal nem létező elemre mutat.
