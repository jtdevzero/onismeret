# Restaurant Empire – mechanikai elemzés és tervjavaslat

> **Forrás (két kör):** JT saját, telepített Restaurant Empire-példánya (Enlight Software, 2003), `C:\Program Files (x86)\Enlight\Restaurant Empire`. Olvasva: a `script/rpg` szkriptek (találkozások, főzőversenyek, fejezetcélok), a `Resource` alatti beállítás- és szövegfájlok (`GAMEPLAY.RES`, `scenario.res`, `opinion.res`, `*.txr`), és az `STD.SET` adatbázis szerkezete.
>
> **Határ:** a játékból semmilyen fájl, szöveg, név, recept, modell, textúra vagy zene nem kerül át az Étterembirodalomba. Ez a dokumentum csak azt rögzíti, **hogyan működnek a rendszerek**, saját szavakkal és összesített számokkal. A tartalom (receptek, szereplők, párbeszédek, nevek) nálunk saját. A számokat nem másoljuk, hanem a saját `balance.json`-unkban kalibráljuk; az itt szereplő értékek csak arányérzéket adnak.

---

## 1. Receptek és hozzávalók

**Mennyiség.** 187 recept, 202 hozzávaló és 1848 recept–hozzávaló kapcsolat van. A receptek három konyhára (amerikai, francia, olasz) és hét fogástípusra oszlanak: reggeli, előétel, leves, főétel, desszert, hideg és meleg ital.

| Konyha | Előétel | Leves | Főétel | Desszert | Reggeli |
| --- | ---: | ---: | ---: | ---: | ---: |
| Amerikai | 12 | 10 | 36 | 16 | 12 |
| Francia | 14 | 6 | 28 | 10 | – |
| Olasz | 13 | 5 | 21 | 4 | – |

**Egy recept adatai.**
- Minimum- és maximumminőség. A minimum 30 és 100 között van (medián 54), a maximum általában 100, kivételesen 130.
- Népszerűség és nehézség, 0–100.
- Alapár: 3,75 és 35 dollár között, medián kb. 13 dollár.
- Fő konyha és legfeljebb két alternatív konyha.
- Legfeljebb öt főzési lépés, mindegyik egy módszerrel és egy idővel. Módszerek: aprítás, sütés serpenyőben, keverés, szórás, sütés sütőben, főzés, öntés, grillezés, melegítés.
- Evési idő fogásonként: előétel és leves 7 perc, főétel és reggeli 20 perc, desszert 6 perc.

**Hozzávalók egy recepten belül.**
- **Kötelező hozzávalók:** 4–10 darab, medián 9.
- **Választható hozzávalók:** 0–7 darab. Alapból a legtöbb receptben nincs ilyen, ezeket találkozásokon lehet megszerezni (lásd 6. pont).
- **Súlyozás:** a kötelezők együtt legfeljebb 70%-ban, a választhatók 30%-ban számítanak a recept minőségébe. Egy hozzávaló súlya = egységár × mennyiség, vagyis a drága fő alapanyag számít a legtöbbet.

**Hozzávaló-kategóriák:** hús és hal, zöldség, gyümölcs, tejtermék, rizs és tészta, bab és hüvelyesek, magvak és diófélék, fűszerek, italok és olajok, sütemény és apró falatok.

**Ételminőség.** Ételenként a hozzávalók minőségéből és a séf tudásából jön ki. Ha a séfnek nincs tudása az adott fogásban, a tudás csak 30%-os súllyal számít, egy fix 50-es alapértékkel.

**Kezelőfelület.** A receptkártyán látszik a költség, a besorolás, a kedveltség, a rang, az alapár, a főzési idő (ikonok, 30 perc = 1 ikon), az igény, a kötelező és a választható hozzávalók (mennyiség, költség, minőség), és a beszállítólista. A recept lemásolható, és a másolat hozzávalói szerkeszthetők: ez a receptváltozat.

## 2. Beszállítók

- **42 beszállító:** Párizs 16, Róma 9, Los Angeles 17. Ebből 6 különleges, amely csak találkozásból nyílik meg.
- **Kínálat:** 181 beszállító–hozzávaló ajánlat 149 hozzávalóra. 25 hozzávalót több beszállító is árul, eltérő áron és minőségben. Tipikusan a 80%-os minőség 100%-ra emelése 25–40% felárral jár.
- **Minőség:** a beszállítói minőség 70 és 100 között szór, medián 85. Ez közvetlenül az étel minőségét adja.

## 3. Személyzet és séfek

- **Szerepkörök:** séf, főpincér, felszolgáló, konyhai kisegítő (mosogat), recepciós. Mindegyiknek van kora, tudása, fizetése, morálja és szolgálati ideje; a séfnek hírneve is.
- **Generálás:** a tudás a korral nő (séfnél kb. kor × 2,2), a fizetés a tudással (séfnél kb. tudás × 73). A fejezet előrehaladtával a jelöltek is jobbak.
- **A séf tudása fogásonként és konyhánként külön értékelődik.** Ezt mutatja a „Séf recept-tár” és a „Kelléktár”.
  - Minden elkészített étellel kis lépésben nő. A segédséf a főséftől is tanul.
- **Szakértelem a kiszolgálásban:** a főpincér tudása 1,35-ös súllyal számít a kiszolgálás-besorolásba, a felszolgálóé és a recepciósé 1,0-val.
- **Morál.** Kezdőérték kb. 50 ± 10.
  - Nő: fizetésemelés, elégedett vendégek, versenygyőzelem (az egész csapatnak), előléptetés, tanulás, telt ház.
  - Csökken: fizetéscsökkentés (erősebben, mint ahogy az emelés növel), panaszok, üres asztalok, hosszú műszak.
  - 10 alatt nő a felmondás esélye.
  - 75 felett a tudás magától is lassan nő.
- **Sztárséf-ranglista:** a legjobb 10 séf szerepel rajta, ami növeli a keresletet, és a fejezetcélok is gyakran hivatkoznak rá.

## 4. Vendégek és elégedettség

- **Vendég-tulajdonságok:** büdzsé, minőségi elvárás, társaság (hányan jönnek), kedvenc étel, napszak, preferált konyha.
- **Elégedettség:** az átlagos (kapott minőség − elvárt minőség) × 2,5.
  - Ha nem a preferált konyhájából eszik, az étel minősége felére számít.
  - Ha a recept vagy a séf a top 10 között van, szorzó jár rá.
- **Kedvenc étel ajánlása:** a pincér ajánlhatja a vendég kedvenc ételét. Ha elfogadja, bónusz elégedettség jár. Elutasítja, ha már eleget rendelt, ha túl drága, ha már végzett, vagy ha ugyanazt már kérte.
- **Panaszkategóriák (vendégbuborékban):**
  - rossz étel;
  - koszos tányér;
  - lassú felszolgálás: rendelésre, ételre vagy számlára várás;
  - várakozás asztalra;
  - szűk étlap- vagy italválaszték;
  - „idegen” ételek egy konyhatípusú étteremben;
  - menü főétel nélkül;
  - drága ár az étterem besorolásához képest;
  - modortalan személyzet;
  - zaj;
  - kényelmetlen szék;
  - csupasz falak;
  - kevés fény;
  - hiányzó recepció.
- **Panasz és morál:** a panaszok súlyossága összeadódik, és csökkenti a személyzet morálját.

## 5. Étterem-besorolás (1–5 csillag)

**Összesített besorolás, súlyokkal:**

| Összetevő | Súly |
| --- | ---: |
| Étel | 4 |
| Kiszolgálás | 3 |
| Vendégelégedettség | 3 |
| Franchise-egységesség | 3 |
| Környezet | 2 |
| Exkluzivitás | 1 |

Az ár és a panaszok külön sorként jelennek meg a jelentésben.

**Környezet:** díszítés 4, komfort 3, kilátás vagy homlokzat 5 (a zene és szórakoztatás súlya 0).
- **Komfort:** tárgyak 60%, hely 50%. Szűkösség esetén büntetés jár.
- **Zaj:** alapzaj 10; vendégenként +4; minden válaszfal −6, hatótávval.
- **Fény:** lámpánként adott megvilágított terület és sugár.

**Különleges étteremtípusok követelményekkel:**
- francia: legalább 20 recept, mindegyik 70-es besorolás fölött;
- olasz: 20 tésztarecept;
- steakhouse: 8 steak főétel;
- tengeri: 20 halétel;
- zenés: konyhánként 10 recept.

**Felújítások:** besorolási küszöbhöz kötött külső és belső felújítás, havi fenntartási költséggel. A fenntartás az alapterülettel és a felújítások értékével nő.

## 6. Városi találkozások (az étterem élete)

A vendégek egy része „különleges”: miután evett, rá lehet kattintani. Ilyenkor lelassul az idő, a kamera odarepül, és párbeszéd indul. Hét típus van, súlyozott véletlennel:

| Típus | Súly | Mit ad | Ár és feltétel |
| --- | ---: | --- | --- |
| Receptet ajánl megvételre | 16 | Új recept | Ár = minőség × sávszorzó (minőség 50 alatt ×100, 80 felett ×500) × (20 + fejezet) / 20 × 3 |
| Titkos hozzávalót árul | 10 | Különleges alapanyag a készletbe | Hangulata a vendég ételértékelésétől függ |
| Megvenné a te receptedet | 10 | Pénz | A legjobbra értékelt ételedet kéri, a recept értékéért |
| Hozzávalót árul el | 8 | Választható hozzávaló egy recepthez (+minőség) | Csak ha az ételértékelése 50 vagy alatta: „ebből hiányzik valami” |
| Képességet fejleszt | 6 | Séfek fogásbeli tudása +5–20 | Ár = tudásnövekmény × (8–12) × 100 |
| Beszállítót ajánl | 6 | Új (különleges) beszállító | Ingyen vagy pénzért |
| Séf csatlakozik | 5 | Új séf | Bérigénye a vendég elégedettségétől függ |

**Gyakoriság:** fejezetenként nő, a kezdeti 0-ról az utolsó fejezetre 10-re. Elutasítás vagy pénzhiány esetén az ajánlat elvész.

## 7. Főzőversenyek

**Szintek konyhánként:** helyi → regionális → nemzeti → mester → nemzetközi. Ezen felül vannak vegyes nemzetközi versenyek (francia, olasz és amerikai forduló egymás után), és van egy döntő.

| Szint | Nevezési díj | Csapat | Fordulók | Ellenfelek ereje | Pénzdíj | Hírnév |
| --- | --- | ---: | ---: | --- | --- | ---: |
| Helyi | 1 000 $ | 1 | 1 | kb. 50–60 | 8–10 000 $ | +5 |
| Regionális | 3–4 000 $ | 1–2 | 1–2 | kb. 50–65 | 20–25 000 $ | +7–10 |
| Nemzeti | 7–9 000 $ | 2 | 2–3 | kb. 65–80 | 25–45 000 $ | +12 |
| Mester | 10–12 000 $ | 3 | 4 | kb. 65–88 | 60–71 000 $ | +15–25 |
| Nemzetközi | 10–20 000 $ | 1–3 | 3–4 | kb. 70–99 | 40–90 000 $ | +15–25 |

- **Nevezési feltételek:** díj, minimális tudás, megkövetelt hozzávalók és fordulónként előírt konyha.
- **Díjak:** pénz, hírnév, 1–2 új recept, receptnépszerűség (+10–30), morál, ritkán új hozzávaló. Emlékérem, emléktábla vagy kupa, és rang („sous chef”, sztárséf).
- **Lánc:** győzelem esetén a következő verseny nyílik meg, vereség esetén ugyanaz ismételhető.
- **Minijátékok főzés közben**, mindegyik a séf egy-egy tulajdonságát emeli a versenyen:
  - **összpontosítás:** időzítés, a mozgó jelet a középpontnál kell megállítani;
  - **precizitás:** csúszka középre;
  - **szervezés:** dobozok helyes sorrendben;
  - **alapanyag-válogatás:** párosítás;
  - **elkapás:** lehulló alapanyagok tányérral.
  - A nehézség a verseny szintjével nő: rövidebb idő, gyorsabb mozgás.

## 8. Kampány és időbeosztás

- **Felépítés:** 18 fejezet, egyenként 3–12 játékhónap. Minden fejezetnek van fő- és mellékcélja, a teljesítésért ponttal.
- **Céltípusok:** havi bevétel vagy profit; vendégszám; időben kiszolgált fogások aránya; átlagos elégedettség; átlagos besorolás; adott verseny megnyerése; találkozás egy szereplővel; sztárséf-rang; éttermek száma; vendégenkénti költés; működési haszonkulcs; adott számú 100%-ban elégedett vendég.
- **Új városok fokozatosan nyílnak:** az elején egy, a 4. fejezetnél a második, a 9.-nél a harmadik.
- **Kaland-mód:** a városban vannak helyszínek (otthon, iroda, piac, versenyterem), ahová a főszereplő elmegy. Ott áll az idő, és párbeszéd vagy esemény történik.
- **Különleges vendégek:** a történet szereplői adott játékidőben betérnek az étterembe, és rájuk kattintva indul a jelenet.
- **Átvezetők a játékmotorban:** kamerapályák, a szereplők mozgatása, feliratkártyák be- és kiúsztatással, hangeffekt, háttér-elsötétítés. Ugyanezt csináljuk mi is a three.js-ben.
- **Napszakok:** reggeli 6–12, ebéd 12–14, uzsonna 14–18, vacsora 18–21, mindegyiknek csúcsidővel. Van ebéd- és vacsoramenü (fogássor), meg egy minimális receptszám fogástípusonként, ami alatt panasz jön („szűk választék”).

## 10. Berendezés, szettek és felújítás (második kör)

**Tárgyak.** 405 tárgy van 20 osztályban. Minden tárgynak van ára, kényelmi, díszítési és szórakoztatási értéke, mérete, havi fenntartása és stílusa (bármely, francia, olasz, steak, tengeri, zenés).

| Osztály | Darab | Ár (medián / max) | Mit ad |
| --- | ---: | --- | --- |
| Asztal | 50 | 605 / 1 400 $ | Komfort kb. 80–90, díszítés kb. 50–60 |
| Szék, box | 58 | 350 / 500 $ | Komfort kb. 75–100, díszítés kb. 65–70 |
| Dísz (festmény, padló- és falidísz, szőnyeg, válaszfal, asztaldísz) | 143 | 600 / 5 000 $ | Díszítés 30–100. Az ár és a díszítés közepesen függ össze (r ≈ 0,5). |
| Lámpa (fali, asztali, csillár) | 15 | 400 / 550 $ | Díszítés kb. 30–35, plusz fényerő és sugár |
| Recepciós pult | 6 | 1 500 $ | Kötelező: nélküle a vendégek be sem térnek |
| Mosdó-berendezés | 20 | 1 350 / 2 300 $ | Komfort és díszítés |
| Konyhai gépek (tűzhely, grill, mikró, robotgép, előkészítő pult, mosogatógép, mosogató, receptasztal) | 8 | 700 / 2 500 $ | Ezek nélkül bizonyos receptek nem készíthetők el („a konyhád nincs felkészülve”) |
| Ételfelvonó | 2 | 3 000 $ | Emeleti terem kiszolgálása |
| Szórakoztató elektronika | 1 | 11 000 $ | Díszítés 100 |

- **Kész szettek:** 82 darab (nagy asztal, kis asztal, box), 440 és 4 950 dollár között, stílusonként. Egy kattintással lerakható asztal a székeivel együtt.
- **Helyiségek:** konyha, női és férfi mosdó, egyenként legalább 10 egység méretben. A falnak és a padlónak stílusonként külön mintája van (25 padló, 26 fal).
- **Eltávolítás:** tárgy törlésekor az ár 20%-a elvész.
- **Homlokzat-felújítás:** 273 elem, étteremtípusonként külön sor (francia, olasz, steak, tengeri, zenés). Az elemek a földszintre, az emeletre és a tetőre kerülnek.
  - Négy csillagszint, a medián ár kb. 9 600 → 11 600 → 16 000 → 19 200 dollár.
  - Csak akkor vehető meg, ha az étterem besorolása eléri a szintet. A homlokzat a „kilátás és külső” értéket emeli, ennek a környezetben 5-ös a súlya.
- **Teremhatások:**
  - **zaj:** a vendégek növelik, a válaszfal csökkenti;
  - **fény:** a lámpák sugara számít;
  - **komfort:** a tárgyak és a szabad hely adják.
  - Az asztalmegosztás kapcsolható: több vendég fér el, de csökken az elégedettség.

## 11. Gazdaság

- **Telek és épület:** a telek egységenként kb. 11 000 dollár; az épület a földszinten egységenként 3 000, az emeleten 5 000 dollár. Mindkettő 250 000 dolláros felső határig. A jó kilátás drágítja az épületet. Az építési és fenntartási szorzó étteremtípusonként 0,96 és 1,05 között van.
- **Fenntartás havonta:** az alapterület és a szintek után jár egy díj, plus a felújítások értékének 1%-a.
- **Nyitvatartás:** állítható nyitás, zárás és utolsó rendelés. A reggeli 6-kor, az ebéd és vacsora 11-kor kezdődik, és 22-ig vagy 24-ig tart.
- **Ital:** 10 ital, beszerzési ár × 2,3–5,5-ös szorzó adja az eladási árat. Az alkoholos italokhoz 20 000 dolláros engedély kell.
- **Reklám:** havi keret, négy csatorna, mindegyiknek más a hatásplafonja és a szórása.

  | Csatorna | Hatásplafon | Jellemző |
  | --- | ---: | --- |
  | Tévé | 25% | Drága, nagy szórás |
  | Rádió | 20% | Olcsóbb |
  | Újság | 15% | Olcsó, állandóan kell frissíteni |
  | Magazin | 10% | A legpontosabb |

- **Képzés:** havi keret, legfeljebb 50 000 dollár. A személyzet átlagos tudását emeli.
- **Hitel:** felvehető és törleszthető, havi kamattal, a kamatláb évi kb. 10%-kal indul, és van hitelkeret.
- **Franchise:** egy éttermet franchise-ként is lehet nyitni. Ugyanaz az étlap és berendezés („minden franchise-ra” alkalmazva), és az egységesség maga is besorolási tényező (súlya 3).
- **Vendégrétegek városonként:** hét jövedelmi réteg, a prémiumtól az alacsonyig, népességarányokkal (pl. a középréteg 35%, a prémium 5%) és rétegenkénti büdzsével (100-tól 40-ig).
  - A turisták négy rétegben jönnek, a helyieknél nagyobb büdzsével.
  - **A turizmus havonta változik, és városonként máskor csúcsosodik:** Párizsban nyár végén, Rómában tavasszal, Los Angelesben télen.
- **Kereslet:** az árat, a környezetet, az ételt, a kiszolgálást, az exkluzivitást és az ismertséget egyforma súllyal veszi figyelembe. Ehhez jön az étterem helye (telekérték) és a népszerűségi rang.
  - **Ismertség:** a reklám, a három legjobb séf hírneve (1,0 / 0,6 / 0,3 súllyal) és az elégedettség adja. Ha az ebéd- és a vacsoramenü is kész, +10 bónusz jár.
- **Exkluzivitás:** ha egy receptet a régióban vagy az egész világon csak te kínálsz, ×1,5, illetve ×2,0 szorzót kap.
- **Mérföldkövek:** a 100%-ban elégedett vendégek száma lépcsőzetes küszöböket ér el (5, 8, 12, 20 … 100). Minden lépcső tartós bónuszt ad az ismertséghez és a várható napi vendégszámhoz.
- **Pontszám:** a besorolásból, az éves bevételből és profitból, valamint a sztárséf-rangból áll össze.

## 12. Riválisok

- **Nem teljes szimuláció.** Minden AI-étteremnek egy rögzített profilja van:
  - besorolások: étel, kiszolgálás, környezet, komfort, díszítés, zene, kilátás, ár;
  - ismertség, panaszbüntetés, elégedettség, nyitvatartás;
  - az előző havi számok: ülőhelyek, alkalmazottak, bevétel, kiadás, vendégszám, eladott ételek és italok, foglaltság, időben kiszolgált fogások, vendégenkénti költés és profit.
- **A szerepük:** versenytársként osztoznak a keresleten, és látszanak a piaci részesedés jelentésben.
- **Pénz:** az AI-cégek 1 millió dollárral indulnak, a játékos szabad játékban 5 millióval, a kampányban 0-val.
- **Események:** a riválisok időnként nyitnak vagy bezárnak, erről üzenet jön.

## 13. Díjak, rangok, üzenetek, tippek

- **Díjak:** 104 darab, minden versenyhez és minden helyezéshez külön (1., 2., 3. hely). Fajták: emlékérem, emléktábla, kupa. Néhány különleges versenynek („nagy nyolcak”, nagydöntő) saját díja van.
- **Üzenetek:** 21 típus, három fontossági szinten (apró, normál, sürgős). Például:
  - rekordbevétel vagy rekordprofit;
  - havi veszteség;
  - sok panasz egy ok miatt;
  - kilépett egy alkalmazott;
  - alacsony morál miatt felmondás fenyeget;
  - hiányzó ételpult vagy recepció;
  - recept a besorolás alatt;
  - asztalhiány;
  - a vendégek rendelés nélkül távoztak.

  A legtöbb üzenet ok-okozatilag tanácsot is ad.
- **Tippek:** 177 tipp kilenc témában: általános, kampány, gyakorló, vendég, recept, alkalmazott, irányítás, besorolás, verseny.

## 14. Oktatás (tutorial) felépítése

A játék hat leckében vezet be, mindegyiket az adott rendszer első megjelenésekor. Egy lecke lépései így néznek ki: üzenetablak, egy kiemelt felületi terület, egy elvárt kattintás vagy művelet, aztán a Tovább gomb.

1. **Városnézet:** kamera, felső sáv (pénz, nyereség), belépés az étterembe.
2. **Étlap és receptek:** fogástípusok, receptkártya, felvétel az étlapra.
3. **Személyzet:** felvétel, a recepciós és a recepciós pult, tárgyak mozgatása és törlése.
4. **Konyha és terem:** ételpult, ételfelvonó és emelet, asztalszettek.
5. **Főzőverseny:** nevezés, csapat, recept kiválasztása, minijáték.
6. **Új étterem:** helyiségek (mosdó, konyha) rajzolása, átméretezése, áthelyezése.

## 15. Ami nem jött ki, és miért

- **A pontos képletek** (kereslet, ételbesorolás, környezet) a futtatható programban vannak. Csak a konstansokat és a megjegyzéseket láttuk. A programot nem fejtjük vissza. A képleteket a saját, már tesztelt modellünkre építjük, ezeket az arányokat használva iránytűnek.
- **A történet párbeszédei** benne vannak, de szándékosan nem dolgoztuk fel őket, mert saját történetünk van. A szerkezetük (fejezet, cél, helyszín, különleges vendég, átvezető) a 8. pontban szerepel.
- **A grafika, a zene és a térképek** nem tartoznak a mechanikához, és nem is kerülnek át.

---

## 16. Mi lesz ebből az Étterembirodalomban

Saját tartalommal, a jelenlegi kódra építve, lépésenként. Minden szám a `balance.json`-ba kerül, minden képlet Vitest-tesztet kap.

### M3a – Receptkönyv és hozzávalók (következő lépés)
- **Saját receptkönyv:** kb. 40 recept (francia, mediterrán, olasz × előétel, leves, főétel, desszert) és kb. 45 saját hozzávaló 8 kategóriában.
- **Recept felépítése:** a jelenlegi `RecipeDef` bővül:
  - kötelező hozzávalók súllyal (70%) és választható hozzávalók (30%, kezdetben üres);
  - min- és maxminőség, nehézség;
  - 1–3 főzési lépés a meglévő főzési idő helyett.
- **Ételminőség:** a hozzávalók súlyozott minősége kombinálva a séf fogásbeli tudásával. Ez váltja ki a mai háromlépcsős alapanyag-minőség kapcsolót.
- **Beszállítók városonként** (2–4 darab): olcsó és közepes, drága és kiváló. Ugyanaz a hozzávaló több helyről, eltérő áron és minőséggel. Gaston régi beszállítói a kampányban nyílnak meg.
- **Konyhai gépek:** a recept konyhai gépet is kérhet (grill, sütő, robotgép). Ha nincs meg, a recept nem vehető fel az étlapra.
- **Receptszerkesztő:** másolat, hozzávaló cseréje vagy hozzáadása, élő költség- és minőség-előnézettel. Ez a „saját változat” élmény.

### M3b – Séfek tudása
- A tudás konyhánként és fogásonként külön értékelődik, és főzéssel nő; a segédséf a főséftől tanul.
- Morál: fizetés, panaszok, telt ház, győzelem. Alacsony morálnál felmondás jöhet.

### M3c – Vendégek
- Új vendég-tulajdonságok: kedvenc étel, büdzsé, preferált konyha.
- A pincér ajánlhatja a kedvenc ételt.
- A panaszkategóriák külön ikonnal jelennek meg a buborékban, és a nap végén összesítés készül.

### M3d – Városi találkozások
- Hét saját típus, saját szereplőkkel.
- Például: egy halkereskedő titkos fűszert árul, egy nyugdíjas szakács Gaston egyik régi trükkjét árulja el, egy kritikus megvenné a receptedet.
- A gyakoriság a fejezettel nő. A vendég fölött egy ikon jelzi, hogy kattintható.

### M3e – Versenylétra és minijátékok
- A mai egyszeri verseny helyett konyhánként négyszintes létra (helyi → regionális → országos → mester), plusz a Gourmet Global elleni döntő.
- Három saját minijáték a telefonra hangolva: időzítés, sorrend, elkapás.

### M3f – Besorolás
- Csillagbesorolás étel, kiszolgálás és környezet alapján.
- A környezet a díszítésből, a komfortból (hely), a zajból és a fényből áll össze. Az eddigi dekorációs érték ebbe olvad bele.

### M3g – Kaland-mód és átvezetők
- **Helyszínek a város-jelenetben:** Gaston lakása, a vásárcsarnok, Pellerin végrehajtó irodája, a nizzai kikötő, a római patrónus palazzója. Rájuk koppintva jelenet indul.
- **Átvezető minden felvonás elején és a kulcsfejezeteknél,** a bevezető mintájára.

### M3h – Gazdaság
- Reklám négy saját csatornával: plakát, rádió, újság, gasztromagazin. Mindegyiknek más a plafonja és a szórása.
- Képzési keret, hitel kamattal, italok és borlicenc, nyitvatartás.
- Turizmus városonként más csúcsszezonnal: a fejezetek napjaihoz kötve, Nizza nyáron, Róma tavasszal, Párizs ősszel.
- Mérföldkő-bónusz a 100%-ban elégedett vendégekért.
- Exkluzivitás: ha egy recept csak nálad kapható a városban, szorzót kap.

### M3i – Berendezés és homlokzat
- Asztalszettek, vagyis asztal székekkel egy mozdulattal. Ez telefonon különösen hasznos.
- Recepciós pult, válaszfal (zajcsökkentés), csillár.
- Homlokzat-felújítás négy csillagszinten, a város-jelenetben látható napellenzővel, virágládával, cégtáblával.

### M3j – Oktatás és üzenetek
- Hat rövid, kiemelős lecke az első kampánynapokra, telefonra hangolva.
- Ok-okozati üzenetek tanáccsal („a vendégek rendelés nélkül távoztak: túl drága az étlap”).

**Javasolt sorrend:** M3a → M3b → M3d → M3e → M3c → M3f → M3i → M3h → M3g → M3j. A recept- és hozzávalórendszer a mag, erre épül a többi.

### Nyitott kérdések JT-nek
1. Maradjon a napi ütem (egy nap = 8 perc), vagy legyen hónapos fejezet, mint az RE-ben? Javaslat: maradjon a nap, a fejezetek pedig 5–10 naposak.
2. Legyen reggeli és uzsonna is, vagy elég az ebéd és a vacsora? Javaslat: ebéd és vacsora, menüvel.
3. Legyenek külön szerepkörök (főpincér, mosogató, recepciós), vagy maradjon a séf, pincér, takarító hármas? Javaslat: maradjon a három, plusz a főpincér mint előléptetés.
