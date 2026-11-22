# FORMA – verziózott szakmai felülvizsgálati nyilvántartás

Ez a nyilvántartás a kód és az adatkészletek felülvizsgálati **státuszát** rögzíti, nem tanúsítvány.

| Azonosító | Dátum | Vizsgálat | Típus | Bizonyíték és korlát | Következő lépés |
| --- | --- | --- | --- | --- | --- |
| INT-2026-11-22-v1 | 2026-11-22 | `data/norms.json`, `data/tests.json`, `data/exercises.json`, panaszmód és súlyjavaslat | **Tulajdonos által, személyi edzőként végzett belső szakmai ellenőrzés** | A tulajdonos közlése alapján megtörtént; a három adatállomány `reviewed: true` és `reviewDate` mezője megmarad. Nincs független külső tanúsítás vagy a repóban ellenőrizhető aláírt jegyzőkönyv. | Változtatáskor tételes újraellenőrzés és a következő verzió felvétele |
| REF-2026-11-22-v1 | 2026-11-22 | `norms.json` A minőségű értékei | Publikált forrásra hivatkozó értékek | A forrásmegjelölések az egyes normák `source` mezőiben szerepelnek; az eredeti publikációk és a pontos mérési protokollok független újraellenőrzése nem része ennek a kódellenőrzésnek. | Forrásonként protokoll- és számegyezőségi audit |
| EST-2026-11-22-v1 | 2026-11-22 | `norms.json` B minőségű értékei | **Becsült normák** | Belső átnézésük nem változtatja őket publikált percentilistáblákká. A protokollok eltérhetnek. | Kor- és nemcsoportonként hiteles referencia, protokoll-azonosság ellenőrzése |
| CAM-2026-11-22-v1 | 2026-11-22 | Motion Lab testpontkövetés, ismétlésszámlálás és testtartási küszöbök | **Nem validált béta** | Szintetikus mozgássor és böngészős füstteszt nem bizonyít valós videós vagy klinikai pontosságot. Kamera-, hozzájárulási és mérési feltételek nem validáltak. | Önkéntes, megfelelően engedélyezett referenciavideók, kézzel címkézett ismétlések, eszközönkénti hibaarány |
| ART-2026-11-22-v1 | 2026-11-22 | Új koordinátaalapú gyakorlatillusztrációk | Szemléltető anyag | Az ábrák nem szolgálnak szakmai mozgáselemzés vagy instrukcióvalidáció bizonyítékaként. | Vizuális és szakmai tételes ellenőrzés |

## Változáskezelés

- Az adatkészletek meglévő `reviewed: true` jelöléseit nem töröljük és nem értelmezzük át külső validációvá.
- Tartalmi vagy mérési protokoll változásakor a megfelelő adatkészlet verziója és a nyilvántartás külön sora frissítendő; pontozás módosításakor a pontozási verzió is.
- Szakértői név, oklevél, aláírás és külső jóváhagyás nincs a rendelkezésre álló bizonyítékok között; ilyet nem állítunk.
- Egészségügyi diagnózis, sérülésmegállapítás és biomechanikai pontossági állítás nincs jóváhagyva.
