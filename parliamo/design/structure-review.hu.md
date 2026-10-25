# Nyelvi szerkezet és a nap szava

A felhasználó olasz tartalmat jelzett a nap szavánál. Az ellenőrzés alapja a
`5566505` éles változat; a javítások a `parliamo-structure-review` ágon készülnek.

## A keveredés oka

A tananyag betöltése több párhuzamos letöltésből állt. Egy későn beérkező
olasz kérés felülírhatta a közben kiválasztott angol szavait, leckéit és
hangmutatóját. Az új nyelv betöltése közben a navigáció a korábbi nyelv
adatait is megjeleníthette az új címkék alatt. Lassított kérésekkel a hiba
megismételhető volt.

A teljes tananyag most egyetlen, ellenőrzött lépésben kerül használatba.
Csak a legutolsó, még kiválasztott nyelv tölthet be adatot vagy rendezheti
a mentett haladást. Betöltés közben a navigáció elérhető, a régi tananyag
helyén betöltési állapot látszik; hiba esetén újrapróbálás kérhető. A késői
kiegészítő adatokra, bevezetőre és gyorsindításokra ugyanez a szabály érvényes.

A kezdőlapon a cím **A nap szava · Angol/Olasz/Spanyol**. A szó a kiválasztott
nyelv kész tananyagából származik; a saját vagy utólag bekapcsolt szókészlet
nem változtatja meg véletlenszerűen a napi választást. A magyar jelentés és
a felolvasási gomb ugyanahhoz a szóhoz tartozik.

## További talált és javított hibák

- A folytatásos történetek azonosítói nyelvek között ismétlődtek. A fejezetek,
  árnyékolási eredmények, vizsgák és gyakorlók most nyelvenként külön kulcsot
  kapnak. Két eszköz különböző befejezett fejezetei összefésülődnek.
- A régi, nyelvjelölés nélküli, több nyelvhez is illő eredmény megmarad a
  mentésben, de nem számít automatikusan valamelyik másik nyelv sikerének.
  Az egyértelműen angol régi történeteredmények továbbra is olvashatók.
- Az olasz és spanyol vizsgafeladatok leírásából és AI-utasításából eltűntek
  az angol feladatra kötelező fordulatok. A szintválasztás és az írás
  készségnaplója a tényleges feladathoz igazodik. Üres vagy érvénytelen
  olvasásértési feladatra nincs kész eredmény.
- A nyelvtani kérdés, saját szó, olvasó, napi történet, mondatépítő,
  hibaelemzés, terv, íráskurzus, saját szöveges lecke, próbavizsga és havi
  riport régi AI-válasza nem írhat másik nyelvhez vagy újabb munkamenethez.
  A kérések időkorlátosak, a megfelelő helyeken megszakíthatók.
- A magyar értésellenőrző kérdések magyar felolvasási nyelvet örökölnek.
  A kiejtési és vizsgacsempék az aktuális nyelvet írják le. Az olvasókat is
  tartalmazó gyakorlócsoport neve **Olvasás és írás**.
- Az azonos írású szavak hanggyorsítótára nyelvenként különül el. Például
  az olasz és a spanyol „la casa” nem használhatja egymás hangklipjét.
  A böngészőhang váltásakor a korábbi nyelv hangja sem maradhat kiválasztva.
- A globális aktivitást és a nyelvenkénti tanulási adatokat a statisztikák
  feliratai megkülönböztetik. Régi biztonsági mentés visszaállítása megtartja
  a jelenlegi törlési generációt, így egy elavult eszköz nem írhatja felül.

## Ellenőrzött adatok és működés

A fájlok ellenőrzése 114 leckét, 2061 tananyagelemet, 21 rövid történetet,
33 podcastot, 5 folytatásos történetet, 31 szócsomagot és 4687 alapszót
érintett. Nem volt ismétlődő tananyagelem-azonosító, hiányzó feloldólecke,
deklarált kép, hangcsomag vagy elsődleges/példamondatos hangklip. Az angol
tananyagfájlba nem került olasz csomag; a hiba a futó alkalmazás állapotában
jelentkezett. A történeti `it` adatmező mindhárom nyelvnél a célnyelvi szöveget
jelöli.

A regressziók lassított és hibás hálózatot, gyors és visszafordított
nyelvváltást, betöltés közbeni navigációt, nyelvenkénti eredményt,
régi AI-választ és megszakítást is ellenőriznek. A tényleges böngészős
ellenőrzés mindhárom nyelv fő nézeteire kiterjed. Az új tesztek bekerültek
a GitHub Actions ellenőrzésébe.
