# AGENTS.md – Étterembirodalom

## Specifikáció
A teljes specifikáció a `PLAN.md`. Mindig ehhez igazodj. Ha el kell térned tőle, előbb jelezd és indokold, ne dönts helyettem.

## Munkarend
- Egyszerre csak az aktuális mérföldkövön dolgozz. Jelenleg: **M1 – Vertical slice**.
- Az M2-t csak akkor kezdd el, ha kifejezetten kérem (az M1-kapu teljesülése után).
- Sorrend az M1-en belül: először a `sim/` mag és az egységtesztek, utána a PixiJS-megjelenítés és a React-panelek.

## Kötelező szabályok
- A szimuláció determinisztikus: fix 100 ms-os tick, seedelt PRNG, a sim mag nem importál semmit a megjelenítésből.
- A PLAN.md képletei és számai kötelezők. Minden hangolható érték a `balance.json`-ba kerül, nem a kódba.
- Minden képlethez és pénzmozgáshoz írj Vitest egységtesztet.
- A felület szövegei a `hu.json` fordítási fájlban élnek, a kódban nincs beégetett magyar szöveg.
- TypeScript strict mód, `any` nélkül.

## Kész-definíció egy feladatra
- `npm run test` hibátlanul lefut.
- `npm run build` hibátlanul lefut.
- A feladathoz tartozó elfogadási feltételt a PLAN.md-ből kipipálhatónak jelölöd meg az összefoglalódban.
