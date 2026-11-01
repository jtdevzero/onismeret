# Páros est – szerkesztési irányelv

A kártyák hangneme, formája és határai. Új kártya csak akkor kerülhet be, ha megfelel ennek a leírásnak, és a `paros/tests/content.test.cjs` zöld.

## Megszólítás

- Tegezés.
- A kártyát az egyik játékos olvassa fel a másiknak. A másik félről „a másik” formában szólunk („Csókold meg a másik nyakát.”).
- Közös feladatnál többes szám: „válasszatok”, „vetkőztessétek le egymást”.
- Magunkra „mi” alakban: „kettőnk”, „a lakásunkban”. Egyes számú felszólítás mellett nincs „kettőtöknek”.
- A Mennyire ismersz? kérdései semlegesek („Utazáshoz inkább…”), mert tippelésnél a másikról szólnak.

## Szintek

A csomag szintje az alapérték, kártyánként a `!1`, `!2`, `!3` jelölő írja felül.

| Szint | Jelentés | Példa |
| --- | --- | --- |
| 1 | Ismerkedős, könnyed | „Milyen bók maradt meg benned sokáig?” |
| 2 | Személyes, flörtös | „Mivel lehet téged megnyugtatni egy nehéz nap után?” |
| 3 | Mély vagy explicit | „Melyik értékedből nem szeretnél engedni egy kapcsolatban?”, illetve a mocskos csomagok |

Csomagszintek: az alapcsomagok 1-esek; a Kémia, a Flört és szikra, a Vágyak és az Intimitásról nyíltan 2-es; a Tűzpróba, a Mocskos, a Mocskos kívánságlista és a Szex, kertelés nélkül 3-as.

## Jelölők a `data.js` soraiban

A sor végére, szóközzel elválasztva:

- `#címke` – a határlista kategóriája. Engedélyezett: `anal`, `oral`, `testnedv`, `fajdalom`, `kotozes`, `foto`, `szerep`, `jatekszer`, `harmadik`, `mult`, `erintes`, `meztelen`, `pozicio`.
- `~mp` – időtartam másodpercben; a kártyán időzítő jelenik meg.
- `!1`, `!2`, `!3` – intenzitás.
- `@penisz`, `@vulva` – adott testfelépítést feltételező kártya.

Flörtradar- és kvízkérdésnél a negyedik elem egy objektum: `['Fent vagy lent?','Fent','Lent',{tags:['pozicio']}]`.

Minden 3-as szintű kártya kapja meg azokat a címkéket, amelyekre a szövege utal; ezt a böngészős teszt kulcsszavak alapján ellenőrzi. Ha egy kártya időt ad meg („fél percig”), kapjon `~` jelölőt is.

## Határok

Ezek a témák semmilyen csomagba nem kerülnek, akkor sem, ha kérik:

- fojtogatás, légzéskorlátozás kihívásként, kívánságként vagy pörgetésként – játékból is okozhat agykárosodást vagy halált. Beszélgetőkérdésként (a fantáziáról, a kockázatról, a veszélytelen helyettesítőkről) csak a Tabuk nélkül csomagban szerepelhet;
- vér – fertőzés- és sérülésveszély;
- nyilvános helyen szex – azokat is belevonja, akik nem egyeztek bele;
- kiskorúra utaló szerep vagy szöveg, vérfertőzés;
- kényszert eljátszó kihívás. Megegyezésen alapuló fantáziáról beszélgetőkérdés lehet, stopszóval és határokkal keretezve, kihívás nem;
- részeg vagy alvó partner bevonása előzetes, kölcsönös igen nélkül.

A durvaság (kötözés, paskolás, nyomok, megalázó beszéd, elélvezés-tiltás) belefér, ha a kártya a beleegyezést és a stopszót nem kérdőjelezi meg.

A Tabuk nélkül csomag nyelvezete szándékosan nyers és vulgáris (baszás, farok, punci, segg, geci). A többi csomag ennél visszafogottabb.

## Forma

- Legfeljebb 110 karakter, hogy telefonon is kiférjen.
- Kérdés kérdőjellel, kihívás ponttal zárul; a kívánságlista tételei írásjel nélküliek.
- Egy csomagon belül nincs két majdnem azonos kártya (a teszt 85%-os hasonlóság fölött jelez).
- Minden csomagban legalább 12 kártya van.
- Fotóra vagy videóra utaló kártya `#foto` címkét kap; a játék ilyenkor figyelmeztet, hogy a kép megmarad.
