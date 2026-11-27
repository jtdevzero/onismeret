# A torzítások térképe – magyar változat

Magyar fordítás a thebiasmap.com (Cognitive Bias Explorer) oldalából.

- Eredeti szerző: Thanos Papangelis. Licenc: CC BY-SA 4.0.
- Az eredeti oldal adatainak és grafikájának forrásai (John Manoogian III, Buster Benson, TilmannR) az oldal láblécében is szerepelnek.
- Az eredeti angol oldal: https://thebiasmap.com/

A fájl önállóan futtatható: nyissuk meg az `index.html`-t, vagy tegyük GitHub Pages alá.

## 1. fázis – stabilizálás (2026. november 25.)

- A magyar oldal saját canonical és megosztható URL-t használ.
- A katalógus hivatkozásai helyi `#b-...` címek, a rövid animációk megosztási címei `#video-...` formátumúak.
- Az eredeti angol oldalra mutató navigációs és feliratkozás nélküli előbetöltési elemek kikerültek; az eredeti alkotó és a kutatási hivatkozások jogi/szakmai forrásmegjelölésként megmaradtak.
- A megtalált angol UI-feliratokat magyarítottuk, valamint néhány elgépelést javítottunk.
- Nem változott a vizuális arculat, a színvilág, a térkép és a kártyák elrendezése.

### Ellenőrzés

`node biasmap-hu/scripts/verify.cjs` a repository gyökeréből.

A szkript ellenőrzi az inline JavaScriptet, az 54 animációs fájl szintaxisát, a 188 egyedi fogalmat és 189 kategóriabeli előfordulást, a 26 fogalomanimáció meglétét, valamint a kritikus belső URL- és magyarítási szabályokat. A GitHub Actions ugyanazt a tesztet futtatja az almappát érintő változásokra.

Ez **statikus regressziós teszt**, nem helyettesíti az iPhone/Android érintéses tesztet, az összes animáció szemrevételezését, a tényleges hálózati terhelés- és akadálymentességi auditot.

### Következő ütemek – még nem implementált

| Ütem | Tartalom | Becsült fejlesztési ráfordítás |
| --- | --- | --- |
| 1B | Eszközönkénti mobil/asztali E2E tesztek, teljes magyar szöveg- és akadálymentességi ellenőrzés | 1–2 munkanap |
| 2 | Vizuális újratervezés, csak külön felhasználói jóváhagyás után | tervezés után |
| 3A | 162 további egyedi torzítás animációinak forgatókönyvei és sablonjai | 3–5 munkanap |
| 3B | Animációk gyártása 20–25 darabos ellenőrzött csomagokban | csomagonként felmérendő |

Jelenleg 54 animációs scene létezik: 26 fogalomhoz, 20 csoporthoz és 8 szokáshoz. A további 162 egyedi fogalom animálható, de tartalmi/szakmai ellenőrzést igényel. A felhasználó engedélye nélkül az animációk vizuális stílusa nem változik.

## Animációs pilot: első 20 új jelenet

A `feature/biasmap-20-animations` tesztágon készült el az első csomag. A húsz különböző magyar helyzetet a `scenes/batch-01.js` tartalmazza, öt közös, SVG-alapú vizuális jelenetnyelvvel. Az `ANIM_FOR` és `BiasAnim.SRC` csak ezen a tesztágon bővült. Az éles `main` ágon lévő felület és animációk változatlanok.

Elfogadási teszt: `node biasmap-hu/scripts/verify.cjs`. Ellenőrzi, hogy mind a húsz torzítás létező katalógustételhez van kötve, megfelelő számú magyar felirata és animációs üteme van, az SVG-rajz alapelemei jelen vannak, és a végső képkocka kirajzolható.

Ez a csomag **műszaki pilot**: a vizuális, mobileszközös és narrációs ellenőrzés, valamint a megjelenés jóváhagyása után tekinthető kész animációs kiadásnak. A következő animációs csomagokat csak ezen tapasztalatok alapján érdemes gyártani.
