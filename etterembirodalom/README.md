# Étterembirodalom

Magyar, böngészős étteremmenedzser-játék. A specifikáció a [PLAN.md](PLAN.md), az ügynököknek szóló szabályok az [AGENTS.md](AGENTS.md).

**Állapot:** M1 – vertical slice. Egy étterem (egyetemi negyed), olasz konyha 5 recepttel, séf és pincér, teljes vendégkör, napi eredménykimutatás, IndexedDB-mentés, placeholder grafika.

## Futtatás

```bash
cd etterembirodalom
npm install
npm run dev      # fejlesztői szerver: http://localhost:5173
npm test         # Vitest: képletek és M1 elfogadási feltételek
npm run build    # típusellenőrzés + statikus build a dist/ mappába
```

## Irányítás

| Művelet | Bemenet |
| --- | --- |
| Lerakás / eladás | Válassz eszközt bal oldalt, kattints a padlóra |
| Kilépés az eszközből | Esc |
| Mozgatás | Jobb gomb húzása (eszköz nélkül bal gomb is) |
| Nagyítás | Görgő |
| Szünet / folytatás | Szóköz |
| Sebesség | 1, 2, 3 (1×, 2×, 4×) |

## Felépítés

| Mappa | Tartalom |
| --- | --- |
| `src/sim/` | Determinisztikus szimuláció: képletek, rács és A*, vendégkör, napzárás, mentés-séma. Nem importál semmit a megjelenítésből. |
| `src/data/` | `balance.json` (minden hangolható szám), `content.ts` (berendezés, receptek, környékek) |
| `src/render/` | PixiJS izometrikus játéktér |
| `src/ui/` | React panelek |
| `src/i18n/` | `hu.json` – a felület összes szövege |
| `tests/` | Vitest-tesztek |

A szimuláció fix, 9 játékmásodperces lépésekben fut (valós időben 100 ms 1×-en). A gyorsítás csak több lépést futtat képkockánként, ezért a számítás minden sebességen azonos.
