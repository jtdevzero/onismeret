/* Társasest — játéktartalom. A kodnevek listáját ne rendezd át és ne törölj belőle:
   a kémfőnöki kulcs a kódból és ebből a sorrendből áll elő, így a két telefon csak azonos listával egyezik.
   Új szót csak a végére tegyél, és emeld a CODES_VERSION-t. */
window.TARSAS_DATA = (function () {
  const L = s => s.trim().split(/\s*\n\s*/);

  const impostor = {
    allat: { name: 'Állatok', words: L(`
      kutya
      macska
      zsiráf
      pingvin
      krokodil
      delfin
      sas
      teve
      kenguru
      polip
      méh
      csiga
      oroszlán
      elefánt
      hörcsög
      papagáj
      bagoly
      róka
      medve
      ló
      tehén
      malac
      kecske
      cápa
      teknős
      denevér
      mókus
      sün
      hangya
      flamingó
      gorilla
      zebra
      szarvas
      lajhár`) },
    etel: { name: 'Étel és ital', words: L(`
      pizza
      gulyásleves
      lángos
      palacsinta
      sushi
      hamburger
      pörkölt
      töltött káposzta
      rántott hús
      túrós csusza
      kürtőskalács
      somlói galuska
      popcorn
      fagylalt
      spagetti
      kebab
      hot dog
      rántotta
      lecsó
      halászlé
      kakaós csiga
      pogácsa
      sült krumpli
      csokitorta
      kávé
      pálinka
      fröccs
      forralt bor
      limonádé
      zsíros kenyér`) },
    hely: { name: 'Helyek', words: L(`
      strand
      kórház
      repülőtér
      iskola
      mozi
      templom
      edzőterem
      bevásárlóközpont
      könyvtár
      állatkert
      vidámpark
      temető
      börtön
      fodrászat
      piac
      benzinkút
      szauna
      kemping
      múzeum
      fesztivál
      lift
      metró
      Balaton
      sípálya
      esküvő
      kocsma
      fogorvosi rendelő
      IKEA
      játszótér
      tűzoltóság`) },
    munka: { name: 'Foglalkozások', words: L(`
      orvos
      tanár
      rendőr
      pék
      pilóta
      fodrász
      szakács
      ügyvéd
      programozó
      tűzoltó
      postás
      bohóc
      színész
      villanyszerelő
      fogorvos
      állatorvos
      pincér
      kamionsofőr
      újságíró
      focista
      DJ
      influenszer
      politikus
      űrhajós
      festő
      kertész
      bűvész
      kalóz
      detektív
      sebész`) },
    targy: { name: 'Tárgyak', words: L(`
      esernyő
      fogkefe
      telefon
      kulcscsomó
      tükör
      gyertya
      kanapé
      hűtő
      bicikli
      porszívó
      napszemüveg
      hajszárító
      párna
      távirányító
      bőrönd
      kalapács
      gitár
      olló
      karóra
      pénztárca
      létra
      hátizsák
      mikró
      kerti törpe
      papucs
      sátor
      labda
      telefontöltő
      fürdőkád
      vasaló`) },
    mese: { name: 'Mesék és filmek', words: L(`
      Shrek
      Harry Potter
      Titanic
      Az oroszlánkirály
      Mézga család
      Vuk
      Star Wars
      Jégvarázs
      Pókember
      Batman
      Hupikék törpikék
      Micimackó
      A Gyűrűk Ura
      Indiana Jones
      Nemo nyomában
      Macskafogó
      Toy Story
      Mátrix
      Jurassic Park
      Hófehérke
      Hamupipőke
      Piroska és a farkas
      Süsü, a sárkány
      Frakk
      Terminátor
      Mr. Bean
      A Simpson család
      Barbie
      Avatar
      Kockásfülű nyúl`) },
    sport: { name: 'Sport és hobbi', words: L(`
      foci
      kosárlabda
      tenisz
      úszás
      sakk
      horgászat
      jóga
      box
      síelés
      golf
      darts
      bowling
      futás
      kerékpározás
      vízilabda
      kézilabda
      Forma–1
      sziklamászás
      búvárkodás
      horgolás
      karaoke
      salsa
      lovaglás
      íjászat
      curling
      ping-pong
      röplabda
      szörf
      paintball
      kertészkedés`) }
  };

  // Spyfall mód: mindenki tudja a helyszínt és kap egy szerepet, a kém nem.
  const helyszinek = [
    ['Repülőgép', 'pilóta, légiutas-kísérő, utas a középső ülésen, síró baba anyukája, légi marsall'],
    ['Kórház', 'sebész, ápoló, beteg, látogató, portás'],
    ['Strand', 'úszómester, lángosos, napozó, homokvárépítő gyerek, büfés'],
    ['Iskola', 'igazgató, tanár, diák, takarító, portás'],
    ['Bank', 'pénztáros, igazgató, bankrabló, biztonsági őr, ügyfél'],
    ['Kalózhajó', 'kapitány, matróz, fogoly, hajószakács, papagáj'],
    ['Esküvő', 'menyasszony, vőlegény, anyós, DJ, vőfély'],
    ['Űrállomás', 'parancsnok, mérnök, kutató, űrturista, orvos'],
    ['Vidámpark', 'hullámvasút-kezelő, vattacukros, gyerek, szülő, bohóc'],
    ['Étterem', 'séf, pincér, vendég, mosogató, ételkritikus'],
    ['Kaszinó', 'krupié, kidobó, szerencsejátékos, pultos, tulajdonos'],
    ['Mozi', 'jegyszedő, popcornárus, szerelmespár, filmkritikus, gépész'],
    ['Rendőrség', 'nyomozó, gyanúsított, járőr, ügyvéd, tanú'],
    ['Szálloda', 'recepciós, londiner, vendég, takarító, igazgató'],
    ['Tengeralattjáró', 'kapitány, szonáros, szakács, gépész, matróz'],
    ['Színház', 'rendező, színész, súgó, néző, ruhatáros'],
    ['Zenei fesztivál', 'zenész, biztonsági őr, sörárus, fesztiválozó, hangmérnök'],
    ['Edzőterem', 'személyi edző, testépítő, recepciós, kezdő, jógaoktató'],
    ['Bevásárlóközpont', 'pénztáros, biztonsági őr, vásárló, Mikulás, eladó'],
    ['Vonat', 'kalauz, mozdonyvezető, utas, büfés, bliccelő'],
    ['Sípálya', 'síoktató, felvonókezelő, kezdő síelő, hegyimentő, forraltboros'],
    ['Állatkert', 'gondozó, állatorvos, látogató, idegenvezető, majom'],
    ['Kemping', 'táborvezető, kempingező, horgász, gitáros, medve'],
    ['Börtön', 'őr, rab, igazgató, ügyvéd, látogató'],
    ['Szauna', 'szaunamester, vendég, úszómester, masszőr, turista'],
    ['Lagzi a falusi kultúrházban', 'zenész, nagymama, menyasszony, részeg nagybácsi, szakácsnő']
  ].map(([name, roles]) => ({ name, roles: roles.split(', ') }));

  const never = {
    light: { name: 'Light', items: L(`
      aludtam el moziban.
      énekeltem karaokén.
      sütöttem kenyeret.
      néztem végig egy sorozatot egy hétvége alatt.
      tévedtem el egy idegen városban.
      felejtettem el valakinek a születésnapját.
      törtem el csontot.
      nyertem valamit sorsoláson.
      ettem csigát.
      voltam szerepelni a tévében vagy a rádióban.
      futottam le félmaratont.
      kaptam virágot csak úgy.
      írtam verset valakinek.
      vettem részt jelmezes bulin.
      ültem lovon.
      költöztem el otthonról egy bőrönddel.
      ültem hőlégballonban.
      ettem egy egész pizzát egyedül.
      voltam szerelmes egy rajzfilmfigurába.
      hívtam rossz nevén egy ismerősömet.
      dobtam fel érmét egy fontos döntésnél.
      sírtam egy reklámon.
      játszottam társasjátékot hajnalig.
      ugrottam be ruhástul a vízbe.
      ettem lejárt szavatosságú ételt.`) },
    buli: { name: 'Buli', items: L(`
      hánytam egy buli után.
      aludtam el egy buliban.
      ébredtem fel úgy, hogy nem tudtam, hol vagyok.
      táncoltam asztalon.
      mentem be dolgozni vagy suliba másnaposan.
      küldtem éjjel olyan üzenetet, amit reggel megbántam.
      loptam poharat egy kocsmából.
      mondtam egy kidobónak, hogy ismerem a tulajt.
      ittam pezsgőt az üvegből.
      buliztam reggel hétig.
      hagytam ott egy bulit köszönés nélkül.
      lettem kidobva egy szórakozóhelyről.
      ittam olyat, amiről nem tudtam, mi az.
      hagytam el a telefonomat egy bulin.
      csókoltam meg valakit, akinek nem tudtam a nevét.
      szerveztem meglepetésbulit.
      énekeltem el egy dalt rossz szöveggel, teli torokból.
      ettem gyrost hajnali négykor.
      fogadtam meg, hogy soha többé nem iszom.
      hívtam fel az exemet ittasan.`) },
    utazas: { name: 'Utazás', items: L(`
      késtem le repülőt.
      aludtam reptéren.
      stoppoltam.
      voltam másik kontinensen.
      utaztam egyedül külföldre.
      vesztették el a bőröndömet.
      aludtam autóban egy utazás alatt.
      ettem olyat külföldön, amit nem tudtam megnevezni.
      fürödtem éjjel a tengerben.
      foglaltam szállást, ami teljesen más volt, mint a képeken.
      ültem rossz vonatra.
      voltam fesztiválon sátorral.
      buktam el pénzt a valutaváltón.
      maradtam ki egy úti fotóról, mert én fotóztam mindenkit.
      tettem úgy, mintha nem érteném a nyelvet, hogy ne kelljen beszélgetni.`) },
    kinos: { name: 'Kínos', items: L(`
      integettem vissza valakinek, aki nem nekem integetett.
      küldtem üzenetet rossz embernek.
      estem el nyilvánosan, mindenki szeme láttára.
      hazudtam a koromról.
      olvastam bele más telefonjába.
      stalkoltam az exem új párját.
      tettem úgy, mintha telefonálnék, hogy ne kelljen beszélgetnem.
      felejtettem nyitva a sliccemet egy fontos napon.
      nevettem fel egy temetésen.
      adtam tovább kapott ajándékot.
      googliztam magamat.
      mondtam valakinek, hogy „te is”, amikor a pincér azt mondta: jó étvágyat.
      hazudtam beteget, hogy ne kelljen elmennem valahova.
      hallgattam ki mások veszekedését a falon át.
      ettem meg valaki más kajáját a közös hűtőből.
      kaptam rajta magamat, hogy a tükörben gyakorlok egy vitát.
      maradtam le egy csoportképről, mert a mosdóban voltam.
      hívtam a tanárt anyának vagy apának.`) },
    pikans: { name: 'Pikáns 18+', spicy: true, items: L(`
      csókolóztam valakivel ebben a szobában.
      küldtem pikáns fotót.
      feküdtem le valakivel az első randin.
      volt egyéjszakás kalandom.
      csókoltam meg egy barátom exét.
      szakítottam üzenetben.
      hazudtam arról, hány partnerem volt.
      randiztam egyszerre két emberrel.
      ébredtem ismeretlen ágyban.
      flörtöltem azért, hogy ingyen italt kapjak.
      voltam szerelmes egy barátom párjába.
      próbáltam ki valamit, amit a pornóban láttam.
      buktam le szex közben.
      szexeltem a szabadban.
      használtam randiappot.
      küldtem csábító üzenetet rossz embernek.
      fantáziáltam valakiről, aki ebben a társaságban van.
      csaltam meg valakit.
      maradtam éjszakára valakinél „csak beszélgetni”.
      szexeltem autóban.`) }
  };

  const likely = {
    normal: { name: 'Vegyes', items: L(`
      lesz híres?
      felejti el a saját születésnapját?
      nyer a lottón, és egy év alatt elveri az egészet?
      költözik külföldre?
      lesz milliomos?
      kerül be a hírekbe valami hülyeség miatt?
      éli túl a zombiapokalipszist?
      hal meg elsőként egy horrorfilmben?
      késik el a saját esküvőjéről?
      sír egy Disney-filmen?
      ír könyvet?
      fogad örökbe öt macskát?
      felejti a kulcsát a zárban?
      kezd vitát egy idegennel az interneten?
      eszik meg valamit, ami a földre esett?
      lesz politikus?
      mond igent egy őrült ötletre első hallásra?
      alszik el a buli közepén?
      nyit saját vállalkozást?
      talál ki valami elképesztő kifogást a késésre?
      tűnik el egy hétre szó nélkül egy szigetre?
      tud meg mindenkinek minden titkát?
      vesz meg valamit, amire semmi szüksége, csak mert akciós?
      nevet fel egy komoly pillanatban?
      lesz influenszer?
      hagyja az utolsó pillanatra a karácsonyi bevásárlást?
      jelentkezik valóságshow-ba?
      nyer meg egy vitát úgy, hogy nincs igaza?
      szervez meg egy egész nyaralást fél óra alatt?
      ismerkedik össze bárkivel a buszmegállóban?
      tévedne el a saját városában?
      marad barát az összes exével?
      tűnik el a buliról angolosan?
      tud fejből minden filmidézetet?
      vállal be egy tetoválást részegen?
      költ el egy havi fizetést egy hétvége alatt?
      lesz a legjobb szülő?
      lesz a legszigorúbb szülő?
      hív fel mindenkit hajnali háromkor?
      felejt el visszaírni egy hétig?
      válik internetes mémmé?
      viszi haza a buliról a maradékot?
      kezd bele egy új hobbiba, és hagyja abba két hét múlva?
      kerül börtönbe valami nevetséges dolog miatt?
      megy el egy randira, és jön haza jegyesként?
      vállal munkát a világ másik végén?
      tart beszédet egy esküvőn, amit mindenki megbán?
      kezd beszélgetni a növényeivel?
      nevezné el a gyerekét egy sorozathős után?
      kerül életveszélybe egy szelfi miatt?
      tud egy vicces sztorit minden helyzetre?
      lesz a társaság nagymamája hetvenévesen?
      nyerne meg egy kvízműsort?
      bukna el elsőként egy kvízműsorban?
      vágna bele egy maratonba felkészülés nélkül?
      állna bosszút apró, gonosz módon?
      bújna el egy szekrényben, hogy megijesszen valakit?
      fizetne a társaság helyett, és felejtené el visszakérni?
      sértődne meg ezen a kérdésen?`) },
    pikans: { name: 'Pikáns 18+', spicy: true, items: L(`
      csókol meg valakit ma este?
      kerül bele egy szerelmi háromszögbe?
      jön össze az exével?
      csábít el valakit egyetlen mondattal?
      próbálna ki bármit az ágyban?
      randizik két emberrel egyszerre?
      küld pikáns üzenetet rossz embernek?
      köt titokban házasságot Las Vegasban?
      ismerkedik meg a következő párjával egy buliban?
      szerelmesedik bele egy nyaralási kalandba?
      tartja a legtöbb partner rekordját a társaságban?
      kezdeményez először?
      felejti el a randija nevét?
      buknak le a szomszédok miatt, mert túl hangosak?
      ír erotikus regényt?
      flörtöl a pincérrel a párja előtt?
      csinál strip táncot egy buliban?
      költ el egy vagyont egy első randira?
      lép le valakivel ebből a buliból?
      vallja be ma este, kibe szerelmes?`) }
  };

  const bomb = {
    betu: L(`
      A
      B
      C
      D
      E
      F
      G
      H
      I
      J
      K
      L
      M
      N
      O
      P
      R
      S
      T
      U
      V
      Z
      Sz
      Cs
      Gy
      Ny
      Zs
      É
      Ö`),
    resz: L(`
      ka
      el
      ér
      ol
      an
      ság
      ség
      os
      ta
      re
      fa
      ház
      kő
      ár
      ló
      ma
      ki
      be
      ott
      ell
      ész
      ró
      ok
      tor
      szó
      kut
      alm
      ver
      pa
      szem
      fej
      víz
      gyü
      cso
      nap
      kar
      ős
      ály
      ügy
      ina`),
    kat: L(`
      állat
      gyümölcs vagy zöldség
      magyar város
      ország
      márka
      foglalkozás
      ami a hűtőben van
      testrész
      szín
      hangszer
      sport
      filmcím
      híres magyar ember
      ital
      ruhadarab
      ami a fürdőszobában van
      jármű
      folyó vagy tó
      bútor
      virág vagy növény
      étel
      ige
      ami kerek
      ami büdös
      ami piros
      szerszám
      rajzfilmfigura
      focicsapat
      énekes vagy zenekar
      társasjáték
      ami az iskolában van
      ami az erdőben van
      ami repül
      fűszer
      édesség
      konyhai eszköz
      ünnep
      becenév
      ami a tengerparton van
      ami elektromos`)
  };

  /* Vérfarkas / Maffia. A szerepnevek a két témában eltérnek, a működés azonos. */
  const wolfSkins = {
    farkas: {
      name: 'Vérfarkas', town: 'a falu', Town: 'A falu', townGen: 'falu',
      farkas: ['Vérfarkas', 'Vérfarkasok'], latno: ['Látnok'], gyogyito: ['Gyógyító'],
      boszi: ['Boszorkány'], vadasz: ['Vadász'], falusi: ['Falusi', 'Falusiak']
    },
    maffia: {
      name: 'Maffia', town: 'a város', Town: 'A város', townGen: 'város',
      farkas: ['Maffiózó', 'Maffiózók'], latno: ['Nyomozó'], gyogyito: ['Orvos'],
      boszi: ['Méregkeverő'], vadasz: ['Bosszúálló'], falusi: ['Polgár', 'Polgárok']
    }
  };
  const wolfRoles = {
    farkas: { icon: '🐺', team: 'farkas', desc: 'Éjjel a társaiddal együtt kiválasztotok egy áldozatot. Nappal titkold, ki vagy. Akkor nyertek, ha annyian vagytok, mint a többiek.' },
    latno: { icon: '🔮', team: 'falu', desc: 'Minden éjjel megtudhatod egy játékosról, hogy közéjük tartozik-e. Óvatosan oszd meg, amit tudsz.' },
    gyogyito: { icon: '🩹', team: 'falu', desc: 'Minden éjjel megvédesz valakit, akár magadat is. Két egymást követő éjjel nem védheted ugyanazt az embert.' },
    boszi: { icon: '🧪', team: 'falu', desc: 'Van egy gyógyító és egy mérgező bájitalod, mindkettő egyszer használható. Éjjel megtudod, ki az áldozat, és megmentheted.' },
    vadasz: { icon: '🏹', team: 'falu', desc: 'Ha meghalsz, akár éjjel, akár nappal, azonnal magaddal viszel valakit.' },
    falusi: { icon: '🧑‍🌾', team: 'falu', desc: 'Nincs különleges képességed, csak az eszed és a hangod. Találjátok meg a farkasokat, mielőtt késő.' }
  };

  // Kódnevek: rövid, egyértelmű főnevek. A sorrend számít (lásd a fájl tetején).
  const CODES_VERSION = 1;
  const codes = L(`
    alma
    bank
    bárány
    bika
    bolygó
    bomba
    borsó
    bot
    csavar
    csillag
    csiga
    csont
    daru
    delfin
    dinó
    dob
    dugó
    egér
    erdő
    fagyi
    fal
    fecske
    fej
    fény
    fésű
    fog
    folyó
    fóka
    font
    forrás
    fű
    gép
    gomba
    gomb
    gyertya
    gyémánt
    gyűrű
    hab
    hajó
    hal
    hang
    hattyú
    híd
    hó
    hold
    homok
    hős
    húr
    jég
    kabát
    kacsa
    kalap
    kanál
    kapu
    kard
    kártya
    kastély
    kecske
    kerék
    kés
    kígyó
    király
    kocka
    kód
    korona
    kő
    kör
    kulcs
    kút
    láb
    lámpa
    lánc
    láng
    lap
    levél
    liba
    ló
    lyuk
    macska
    madár
    maszk
    medve
    méz
    mező
    mozi
    nap
    nyúl
    nyíl
    olaj
    óra
    orr
    oroszlán
    ostor
    pálma
    papír
    paprika
    pók
    pont
    posta
    puska
    rák
    rakéta
    rés
    rózsa
    sapka
    sas
    sátor
    selyem
    sír
    só
    sör
    szárny
    szem
    szív
    szög
    tábla
    tál
    tank
    tea
    tej
    telek
    tenger
    tető
    tigris
    tojás
    tó
    toll
    torta
    tű
    tűz
    tükör
    ugrás
    út
    vadász
    vaj
    vár
    varázs
    vas
    vér
    vihar
    villa
    virág
    víz
    zebra
    zene
    zokni
    zöld
    angyal
    autó
    bak
    bálna
    banán
    baba
    bicikli
    bor
    busz
    cápa
    cukor
    disznó
    doboz
    elefánt
    ember
    ész
    fa
    farok
    fül
    galamb
    gáz
    golyó
    gumi
    gyár
    ház
    hegy
    ing
    iskola
    játék
    kalóz
    kamra
    kép
    kéz
    kórház
    kréta
    labda
    lift
    malom
    menet
    metró
    mokka
    nyak
    oltár
    orvos
    pajzs
    pék
    pénz
    pipa
    rendőr
    robot
    sakk
    sárkány
    seb
    sín
    sziget
    szoknya
    szél
    tavasz
    tél
    templom
    tolvaj
    tök
    vasút
    vonat
    zár`);

  return { impostor, helyszinek, never, likely, bomb, wolfSkins, wolfRoles, codes: [...new Set(codes)], CODES_VERSION };
})();
