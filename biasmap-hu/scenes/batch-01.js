/* Twenty additional Hungarian 30-second cognitive-bias explainers.
 * Each scene has its own situation, competing interpretations and practical antidote.
 * Five reusable diagram grammars preserve the visual language of the original SVG scenes.
 * Licensed with the adapted BiasMap HU work under CC BY-SA 4.0. */
(function () {
  'use strict';
  const definitions = [
    ['attentional-bias','Figyelmi torzítás','tmi','spot','Állásinterjú','Egyetlen kritika','Sok pozitív jel','Egy rossz megjegyzés elfedi a sok jó visszajelzést.','A figyelmed a félelmedhez illő részletre tapad.','A teljes visszajelzés kiegyensúlyozottabb képet ad.','Sorolj fel három olyan jelet is, amelyet elsőre nem vettél észre.'],
    ['illusory-truth-effect','Illúziós igazsághatás','tmi','echo','Ismételt állítás','Ismerősen hangzik','Bizonyíték kell','Ugyanazt az állítást több helyen újra hallod.','Az ismétlés miatt könnyebb feldolgozni, ezért igazabbnak tűnik.','Az ismerősség nem bizonyíték.','Keresd meg az állítás eredeti, ellenőrizhető forrását.'],
    ['mere-exposure-effect','Puszta expozíció hatása','tmi','echo','Új márka','Gyakran látod','Más alternatívák','Egy ismeretlen márka először semleges neked.','Sok találkozás után egyre szimpatikusabbnak érzed.','A kedveltség nem feltétlenül minőség.','Próbáld objektív szempontok szerint is összehasonlítani.'],
    ['context-effect','Kontextushatás','tmi','compare','Árkategória','Középső ajánlat','Önálló érték','Ugyanaz az ajánlat mást jelent két különböző listában.','A környező lehetőségek átírják az értékérzetedet.','Az ajánlat tényleges tulajdonságai nem változtak.','Határozd meg az értékelési szempontokat a lista megnyitása előtt.'],
    ['cue-dependent-forgetting','Jelfüggő felejtés','tmi','path','Miért jöttél ide?','Másik szoba','Eredeti hely','Átlépsz a másik szobába, és elfelejted, miért indultál.','A megváltozott környezetből hiányzik az előhívó jel.','A korábbi helyszín segíthet visszahozni az emléket.','Jegyezd fel a fontos tennivalót még indulás előtt.'],
    ['mood-congruent-memory-bias','Hangulattal egybevágó emlékezés','tmi','filter','Rossz nap','Negatív emlékek','Teljes kép','Rosszkedvű vagy, és hirtelen több régi kudarc jut eszedbe.','A hangulatoddal egyező emlékeket könnyebb előhívni.','A jó élmények ettől még nem tűntek el.','Döntés előtt idézz fel szándékosan ellenpéldákat is.'],
    ['frequency-illusion','Gyakoriság-illúzió','tmi','spot','Új kifejezés','Mindenhol látod','Ugyanannyi előfordulás','Megtanulsz egy új szót, aztán mintha mindenki azt mondaná.','A figyelmed most már könnyen felismeri.','Nem biztos, hogy valóban gyakoribb lett.','Különítsd el az észlelés változását a valódi gyakoriságtól.'],
    ['empathy-gap','Empátiarés','tmi','compare','Nyugodt állapot','Forró helyzet','Előzetes terv','Nyugodtan biztos vagy abban, hogy nem leszel ingerült.','A fáradtság vagy éhség megváltoztatja a reakciódat.','Az előzetes önbecslésed nem számolt az állapottal.','Fontos vitáknál hagyj időt a megnyugvásra.'],
    ['omission-bias','Mulasztási torzítás','tmi','balance','Két kockázat','Nem teszek semmit','Beavatkozom','Két lehetőség egyaránt hordozhat veszteséget.','A tétlenség következményét enyhébbnek érezheted.','A következményeket attól függetlenül érdemes összevetni, ki cselekedett.','Mindkét döntés várható következményeit írd le.'],
    ['bizarreness-effect','Bizarrság-hatás','tmi','spot','Furcsa történet','Emlékezetes részlet','Szokványos részlet','Egy tananyagban egy szokatlan kép ragad meg legjobban.','A különösség kiemeli az információt a többi közül.','A kiemelkedő részlet nem feltétlenül a legfontosabb.','Kapcsold a fontos tényeket is emlékezetes példákhoz.'],
    ['humor-effect','Humorhatás','tmi','spot','Vicces példa','Megmarad az emlék','A lényeg is kell','Egy humoros mondatot napok múlva is idézel.','A humor figyelmet és érzelmi többletet ad.','A poénra jobban emlékezhetsz, mint az üzenetre.','Fogalmazd meg külön egy mondatban a tanulságot.'],
    ['von-restorff-effect','Von Restorff-hatás','tmi','spot','Egyforma elemek','Eltérő elem','Teljes lista','Tíz azonos színű szó között egy pirosat látsz.','A különböző elem könnyebben megmarad.','A többi ettől nem lesz kevésbé fontos.','Csoportosítsd és ismételd át a kevésbé feltűnőket.'],
    ['picture-superiority-effect','Képi fölényhatás','tmi','compare','Tanulási feladat','Kép és szöveg','Csak szöveg','Egy folyamatot szövegből próbálsz megérteni.','A hozzáillő kép több előhívási támpontot ad.','A jó ábra segíti a megjegyzést, de nem helyettesíti a megértést.','Rajzolj egyszerű vázlatot, majd magyarázd el saját szavaiddal.'],
    ['self-relevance-effect','Önvonatkozási hatás','tmi','filter','Új ismeret','Rólad szól','Távoli példa','Két azonosan fontos történet közül az egyik rólad szól.','A személyes kapcsolat elősegítheti a felidézést.','A másokat érintő tanulságot is érdemes megjegyezni.','Kösd a fontos információt egy saját helyzethez.'],
    ['conservatism','Konzervatizmus (vélekedés)','tmi','balance','Új bizonyíték','Régi becslés','Új adatok','A korábbi előrejelzésedhez új adatok érkeznek.','Csak kicsit változtatsz, pedig az adatok többet indokolnának.','A régi becslés túl nagy súlyt kaphat.','Számold újra az értékelést a friss bizonyítékok alapján.'],
    ['contrast-effect','Kontraszthatás','tmi','compare','Két ajánlat','A drága után','Önmagában','Egy nagyon drága lakás után a következő olcsónak tűnik.','Az összehasonlítás erősebben hat, mint az abszolút ár.','A második lakás önmagában még lehet túlárazott.','Vesd össze a piaci adatokkal is.'],
    ['focusing-effect','Fókuszhatás','tmi','spot','Állásajánlat','Magas fizetés','Teljes élethelyzet','Egy ajánlatnál csak a magasabb fizetést figyeled.','Egyetlen hangsúlyos tényező elnyomja a többit.','A munkaidő, utazás és stressz is számít.','Készíts súlyozott listát minden fontos szempontról.'],
    ['money-illusion','Pénzillúzió','tmi','balance','Béremelés','Névleges összeg','Vásárlóerő','Öt százalékkal nő a fizetésed.','A nagyobb szám önmagában fejlődésnek látszik.','Ha az árak jobban emelkednek, a vásárlóerőd csökken.','Mindig vizsgáld a reálértéket is.'],
    ['weber-fechner-law','Weber–Fechner-törvény','tmi','compare','Árváltozás','Ezer forint','Arányos változás','Ugyanaz az ezerforintos különbség két árnál mást jelent.','Az észlelt különbség függ a kiinduló nagyságtól.','A százalékos eltérés megmutatja az arányt.','Nézd együtt az abszolút és a relatív különbséget.'],
    ['congruence-bias','Egybevágósági torzítás','tmi','filter','Saját elmélet','Igazoló teszt','Cáfoló teszt','Azt gondolod, egy hiba mindig ugyanattól történik.','Csak olyan esetet vizsgálsz, ahol a hiba előfordul.','Más okokat és cáfoló próbákat kihagysz.','Tervezz olyan tesztet is, amely megcáfolhatja a feltevésedet.']
  ];
  const safe = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const art = (kind, A, B) => {
    const label = (x,y,s) => `<text x="${x}" y="${y}" class="batch-label"${s.length>17?' textLength="128" lengthAdjust="spacingAndGlyphs"':''}>${safe(s)}</text>`;
    const box = (x,y,w,h,cls='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" class="batch-box ${cls}"/>`;
    const circle = (x,y,r,cls='') => `<circle cx="${x}" cy="${y}" r="${r}" class="batch-orb ${cls}"/>`;
    let shape = '';
    if (kind === 'spot') shape = `${Array.from({length:9},(_,i)=>circle(83+(i%3)*52,68+Math.floor(i/3)*52,13,i===4?'mark':'')).join('')}<path d="M254 69L304 119L254 169" class="batch-arrow"/>${circle(325,119,35,'mark')}`;
    else if (kind === 'filter') shape = `${Array.from({length:7},(_,i)=>circle(68+i*39,52+(i%2)*20,9,i%3?'':'mark')).join('')}<path d="M48 116H352M70 116L120 204H280L330 116" class="batch-arrow"/>${circle(148,177,17,'mark')}${circle(205,177,17,'')}${circle(251,177,17,'mark')}`;
    else if (kind === 'balance') shape = `<path d="M200 57V219M101 111H299M101 111L65 175H137ZM299 111L263 175H335Z" class="batch-arrow"/>${box(85,171,68,15,'mark')}${box(247,171,68,15)}${circle(200,52,12,'mark')}`;
    else if (kind === 'path') shape = `${[0,1,2,3].map(i=>box(42+i*82,82+(i%2)*30,52,45,i===3?'mark':'')).join('')}<path d="M91 104H120M173 133H205M255 104H285" class="batch-arrow"/>`;
    else if (kind === 'echo') shape = `${[0,1,2,3].map(i=>circle(85+i*75,130,16+i*3,i===3?'mark':'')).join('')}<path d="M109 130H138M184 130H211M260 130H286" class="batch-arrow"/>`;
    else shape = `${box(46,71,126,133)}${box(228,71,126,133,'mark')}<path d="M183 139H217" class="batch-arrow"/>`;
    return `<g data-k="picture">${shape}</g><g data-k="left">${label(107,248,A)}</g><g data-k="right">${label(294,248,B)}</g><g data-k="check"><circle cx="346" cy="45" r="16" class="batch-orb mark"/><path d="M338 45l6 6 11-13" class="batch-check"/></g>`;
  };
  const css = `.batch-box{fill:var(--surface);stroke:var(--ink);stroke-width:2}.batch-box.mark{stroke:var(--q);fill:var(--surface-2)}.batch-orb{fill:var(--surface);stroke:var(--ink);stroke-width:2}.batch-orb.mark{stroke:var(--q);fill:var(--surface-2)}.batch-arrow{fill:none;stroke:var(--q);stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round}.batch-label{font:600 11px var(--display);fill:var(--ink);text-anchor:middle}.batch-check{fill:none;stroke:var(--good);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}`;
  definitions.forEach(([key,name,q,kind,context,left,right,setup,bias,reality,tip]) => {
    window.BiasAnim.SCENES[key] = {
      q, viewBox:'0 0 400 272', css,
      text:{hu:{name,shareTitle:`${name} – 30 másodpercben`,ecline:tip,
        caps:[setup,bias,reality,`<b>Mit tehetsz?</b> ${tip}`],
        say:[setup,bias,reality,tip],context,left,right}},
      svg(T){return art(kind,T.left,T.right);},
      S0:{picture:0,left:0,right:0,check:0,scale:0},
      render(S,k){
        for(const key of ['picture','left','right','check']) k(key).style.opacity = Math.max(0,Math.min(1,S[key]));
        k('picture').setAttribute('transform',`translate(${200*(1-S.scale)} ${136*(1-S.scale)}) scale(${S.scale})`);
      },
      beats:[
        {steps:[{to:{picture:1,scale:.9},ms:850,ease:'out'},{to:{scale:1},ms:700,ease:'out'}]},
        {steps:[{to:{left:1},ms:650},{wait:900}]},
        {steps:[{to:{right:1},ms:650},{wait:900}]},
        {steps:[{to:{check:1},ms:600,ease:'out'}],hold:3200}
      ]
    };
  });
})();
