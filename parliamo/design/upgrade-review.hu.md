# Nyelvi világok és folytatható tanulás

A fejlesztés alapja a `b772d2a` v8-as változat. A változtatások a
`parliamo-language-worlds` ágon készültek.

## Megjelenés

| Nyelv | Hangulat | Színek |
| --- | --- | --- |
| Angol | London, Temze-parti könyvesbolt és kávézó | sötétkék, téglavörös, elefántcsont |
| Olasz | Bologna, árkádok és teraszos kávézó | terrakotta, olíva, krém |
| Spanyol | Sevilla, napfényes tér | okker, korall, mélykék |

A nyelvválasztás a teljes felület színeit és a kezdőképet együtt váltja.
Világos, sötét és automatikus téma használható. A helyes és hibás válaszok
jelentésszínei megmaradnak.

Az első összefüggően illusztrált sorozat a Londonban játszódó **The Archive /
Az archívum**. Mind a hat fejezet saját jelenetet kapott, azonos szereplőkkel.
A fejezetválasztó és az olvasónézet is ezeket használja. A többi történet
meglévő helyzetképe és helyszínfelirata megmaradt. A szereplőket és a
jeleneteket a [képi útmutató](story-illustrations.md) írja le.

Az új négy WebP-fájl együtt körülbelül 1,5 MB. A három kezdőkép előre
gyorsítótárazódik; a történetsorozat egyetlen képfájlt tölt le, amikor a
képei a nézet közelébe kerülnek. A történet kép nélkül is olvasható.

## Tanulási folyamat

- A napi 5/10/25 perces cél a tényleges feladatszámot is módosítja. A percek
  becslések; a saját olvasási és válaszadási tempó befolyásolja az időt.
- A leckeszakaszok teljesítése összeadódik. Egy rövid napi rész nem jelöli
  késznek az egész leckét. A következő rész az el nem végzett feladatokból áll.
- A félbehagyott lecke és ismétlőkör a megőrzött sorrenddel, piszkozattal és
  eredménnyel folytatható. A már pontozott válasz nem kap újabb XP-t vagy
  ismétlési ütemezést. A párosítás részállapota is megmarad.
- A napi saját válaszok váltakoznak, cél szerint 1/2/3 mondattal. Az első
  sikertelen próbálkozás csak támpontot ad; segítségkérés vagy második hiba
  után mintaválasz jön, és az eredmény segített gyakorlásként mentődik.
- A fordítások néhány biztonságosan felismerhető, azonos jelentésű változata
  elfogadható. A hiányzó névelő nem tűnik el automatikusan. A nyelvtani
  átalakítás és a diktálás a kért alakot ellenőrzi. A helyi ellenőrzés
  véges mintákból dolgozik, ezért az ismeretlen változatra óvatos szöveget ad.
- A leckék kereshetők, szintre és ágra szűrhetők.

## Megbízhatóság és beszéd

- A naplópiszkozat nyelvenként megmarad, a korábbi teljes javítás újranyitható.
- A tanár, írásjavítás és napló kérései megszakíthatók, legfeljebb 45
  másodpercet várnak. A késői válasz nem kerülhet át másik nyelvbe vagy
  újabb munkamenetbe.
- A haladás törlése új állapotgenerációt hoz létre; régi eszköz nem hozza
  vissza a korábban törölt haladást. A párhuzamos napi válaszok és
  leckeszakaszok összeadódnak, a segített eredmény nem lesz önálló siker.
- Az offline letöltés a ténylegesen vezérlő service workertől kéri a
  gyorsítótárak nevét, ellenőrzi a HTTP-eredményt és a tárolt fájlokat is.
  Hiányos letöltésre nincs sikerjelzés. Régi worker esetén újratöltést kér.
- Az angol árnyékolás mind az 51 forrása elérhető, szint- és típusfilterrel.
- A mondat és a felvételi gombok megelőzik az összecsukható magyarázatot.
  A felvételhez időzítő és jelszint tartozik; váltáskor a mikrofon felszabadul.
- A hanglejtés alakját időtengely és tényleges lejátszási mutató mutatja.
  A nyers korreláció nem jelenik meg kiejtési minőségszázalékként.

## Ellenőrzés

A `.github/workflows/test.yml` a korábbi tesztek mellett futtatja az új
válaszértékelési, folytatási, AI-életciklus-, szinkron-, beszéd-, képi és
valódi offline böngészős regressziókat is.

A képi teszt kilenc kezdőnézetet ellenőriz (három nyelv, asztali/mobil/sötét),
és végigjátssza a hat illusztrált fejezetet. Képernyőképeket ír a
`tests/artifacts/language-worlds/` mappába. A valódi PWA-teszt letöltés után
lekapcsolt hálózattal is ellenőrzi az alkalmazást, a nyelvváltást, a
kezdőképeket, az angol hanganyagot és a történetképet.

Az AI-tesztek ellenőrzött válaszokat használnak, így nem igényelnek élő
API-kulcsot vagy fizetős hívást. Új függőség és szerveroldali változás nincs.

A helyi ellenőrzés eredménye: a Parliamo teljes böngészős tesztje 136,
a napi tanulási teszt 33, a mikrofonos és aszinkron teszt 14, a képi teszt
37, a valódi offline teszt 8 ellenőrzéssel sikeres. A válaszértékelés 57,
a mentett feladatok védelme 23 esetet fed le; a többi célzott regresszió és
a Worker tesztjei is sikeresek.

A teljes tároló 547 ellenőrzése is átment helyi HTTP-kiszolgálással. Az
eredeti `npm test` által használt `file://` megnyitást a kezelt Chromium
tiltja, ezért a futtatáshoz csak az oldalbetöltés címét és a saját helyi
kérések felismerését igazítottuk HTTP-re egy ideiglenes futtatóban. A teszt
állításai, a repó tesztfájlja és a böngésző biztonsági szabályai nem változtak.
