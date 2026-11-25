/* Five individually storyboarded Hungarian SVG explainers, preview only.
 * Original pictograms and narrative beats, matching BiasAnim's existing design. */
(function () {
  'use strict';
  const registry = window.BiasAnim && window.BiasAnim.SCENES;
  const ids = window.BiasMapPremium || {};
  if (!registry) return;
  const css = `
    .pp-line{fill:none;stroke:var(--ink);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
    .pp-q{fill:none;stroke:var(--q);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
    .pp-strong{fill:var(--surface-2);stroke:var(--q);stroke-width:2.8}
    .pp-box{fill:var(--surface);stroke:var(--ink);stroke-width:2}
    .pp-fill{fill:var(--q)} .pp-muted{fill:var(--muted)}
    .pp-good{fill:none;stroke:var(--good);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
    .pp-bad{fill:none;stroke:var(--bad);stroke-width:2.8;stroke-linecap:round;stroke-linejoin:round}
    .pp-title{fill:var(--ink);font:600 12px var(--display);text-anchor:middle}
    .pp-note{fill:var(--muted);font:500 10px var(--mono);text-anchor:middle}
    .pp-em{fill:var(--q);font:700 12px var(--display);text-anchor:middle}
  `;
  const g = (name,body) => `<g data-k="${name}">${body}</g>`;
  const tx = (x,y,s,klass='pp-title') => `<text x="${x}" y="${y}" class="${klass}">${s}</text>`;
  const rect=(x,y,w,h,klass='pp-box',rx=8)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" class="${klass}"/>`;
  const circ=(x,y,r,klass='pp-box')=>`<circle cx="${x}" cy="${y}" r="${r}" class="${klass}"/>`;
  const path=(d,klass='pp-line')=>`<path d="${d}" class="${klass}"/>`;
  const mark = (x,y) => path(`M${x-13} ${y}l9 10 20-25`,'pp-good');
  const television = (x,y,w,h,clarity) => `${rect(x,y,w,h)}<path d="M${x+8} ${y+h-23}l${w*.27} -32 ${w*.21} 17 ${w*.27} -45 ${w*.17} 18" class="${clarity?'pp-q':'pp-line'}"/>${path(`M${x+w*.47} ${y+h}v13m-18 0h36`)}${clarity?`<circle cx="${x+w*.72}" cy="${y+26}" r="7" class="pp-fill"/>`:''}`;
  const person = (x,y,q=false) => `${circ(x,y-10,9,q?'pp-strong':'pp-box')}${path(`M${x-16} ${y+24}v-6q0-13 16-13t16 13v6`,q?'pp-q':'pp-line')}`;
  const ball=(x,y,klass='pp-box')=>`${circ(x,y,13,klass)}${path(`M${x-13} ${y}h26M${x} ${y-13}v26M${x-9} ${y-9}q18 9 0 18M${x+9} ${y-9}q-18 9 0 18`)}`;
  const pipLayouts = [
    [[32,32]],[[18,18],[46,46]],[[18,18],[32,32],[46,46]],
    [[18,18],[46,18],[18,46],[46,46]],
    [[18,18],[46,18],[32,32],[18,46],[46,46]],
    [[18,18],[46,18],[18,32],[46,32],[18,46],[46,46]]
  ];
  const die=(x,y,n)=>`${rect(x,y,64,64,'pp-strong',12)}${pipLayouts[n-1].map(([a,b])=>circ(x+a,y+b,4,'pp-fill')).join('')}`;

  const stories = [
    {
      en:'Distinction bias',name:'Megkülönböztetési torzítás',q:'tmi',
      line:'A különbséget önmagában is észrevennéd? Próbáld így megítélni.',
      caps:[
        'Két televíziót nézel a boltban. Az egyik <b>jóval drágább</b>.',
        'Egymás mellett az élesebb képet <b>óriási előnynek</b> érzed.',
        'Otthon azonban csak <b>egyetlen képernyőt</b> néznél.',
        'A kis eltérés a hétköznapokban <b>alig észrevehető</b>.',
        'Az összehasonlítás <b>felnagyította</b> a különbséget.',
        '<b>Próbáld ki:</b> értékeld külön-külön a lehetőségeket.'
      ],
      svg:()=>g('a',television(36,64,142,104,0)+television(224,64,142,104,1)+tx(107,206,'ALAPMODELL')+tx(295,206,'DRÁGÁBB'))+
        g('b',path('M182 106H218M209 97l9 9-9 9','pp-q')+tx(200,44,'EGYMÁS MELLETT','pp-em')+tx(295,224,'+30% ár','pp-em'))+
        g('c',rect(118,45,164,130)+television(143,65,114,82,0)+tx(200,206,'OTTHON EGYET NÉZEL'))+
        g('d',path('M157 235h86','pp-good')+mark(200,239)+tx(200,260,'MEGFELELŐ KÉP','pp-em'))+
        g('e',tx(200,30,'A KÜLÖNBSÉG FELNAGYÍTVA','pp-em'))+
        g('f',tx(200,248,'DÖNTS ÖNÁLLÓ ÉRTÉK ALAPJÁN','pp-em')),
    },
    {
      en:'False consensus effect',name:'Hamis konszenzus hatása',q:'fast',
      line:'A saját véleményed nem közvélemény-kutatás. Kérdezd meg a többieket.',
      caps:[
        'Szerinted <b>mindenki</b> az otthoni munkavégzést választaná.',
        'A saját véleményedet <b>rávetíted másokra</b>.',
        'A társaságban azonban <b>különböző igények</b> vannak.',
        'A valódi válaszok eltérnek a <b>feltételezésedtől</b>.',
        'A saját preferenciád <b>nem reprezentatív minta</b>.',
        '<b>Megoldás:</b> kérdezz, ne következtess magadból.'
      ],
      svg:()=>g('a',person(200,92,true)+tx(200,145,'ÉN OTTHONRÓL DOLGOZNÉK','pp-em'))+
        g('b',[70,135,265,330].map(x=>person(x,208)).join('')+tx(200,30,'BIZTOS MINDENKI ÍGY GONDOLJA'))+
        g('c',`${rect(16,169,82,36)}${tx(57,192,'IRODA')}${rect(106,169,82,36)}${tx(147,192,'HIBRID')}${rect(212,169,82,36,'pp-strong')}${tx(253,192,'OTTHON')}${rect(302,169,82,36)}${tx(343,192,'IRODA')}`)+
        g('d',path('M147 217l-11 15m0-15 11 15','pp-bad')+mark(253,222)+tx(200,259,'NEM VOLT EGYHANGÚ','pp-em'))+
        g('e',tx(200,56,'A SAJÁT NÉZŐPONT EGY A SOK KÖZÜL','pp-note'))+
        g('f',tx(200,260,'KÉRDEZD MEG ŐKET!','pp-em')),
    },
    {
      en:'Hot-hand fallacy',name:'Forró kéz tévedés',q:'nem',
      line:'A korábbi sikersorozat nem bizonyítja, hogy a következő dobás is bemegy.',
      caps:[
        'A kosárlabdázó <b>háromszor egymás után</b> betalál.',
        'A közönség azt gondolja: most <b>biztosan a következő is</b> bemegy.',
        'A korábbi találatokból <b>túl erős jóslatot</b> készítünk.',
        'A következő dobás önmagában is <b>bizonytalan</b>.',
        'Egy rövid sorozat <b>nem elég bizonyíték</b> a tartós formára.',
        '<b>Megoldás:</b> mérj sok próbát, ne csak a sikerszériát.'
      ],
      svg:()=>g('a',`${path('M35 158H365M304 83v76m0-76h53l-8 17h-37z')}${ball(84,102)}${tx(94,194,'DOBÁSOK')}`)+
        g('b',[143,193,243].map(x=>`${circ(x,107,16,'pp-strong')}${mark(x,107)}`).join('')+tx(194,156,'3 / 3 TALÁLAT','pp-em'))+
        g('c',`${path('M260 113q30-45 65-15','pp-q')}${tx(304,66,'BIZTOS A KÖVETKEZŐ?','pp-em')}`)+
        g('d',`${circ(330,113,18,'pp-box')}${tx(330,118,'?','pp-em')}${tx(200,230,'A KÖVETKEZŐ NEM GARANTÁLT')}`)+
        g('e',`${rect(101,234,198,9,'pp-box')}${rect(101,234,89,9,'pp-strong')}${tx(200,262,'KIS MINTA ≠ BIZTOS JÓSLAT','pp-note')}`)+
        g('f',`${tx(200,40,'SOK DOBÁST VIZSGÁLJ!','pp-em')}`),
    },
    {
      en:'Illusion of control',name:'Kontrollillúzió',q:'fast',
      line:'A választás érzése nem változtatja meg a véletlen valószínűségeit.',
      caps:[
        'Te választod ki a kockát, ezért azt érzed: <b>irányítasz</b>.',
        'Egy különleges dobómozdulat után <b>hatost vársz</b>.',
        'A kocka eredménye továbbra is <b>véletlenszerű</b>.',
        'A kezed mozdulata <b>nem növelte</b> a hatos esélyét.',
        'A befolyás érzete nem azonos a <b>valódi kontrollal</b>.',
        '<b>Megoldás:</b> válaszd szét a döntésedet és a véletlent.'
      ],
      svg:()=>g('a',`${path('M57 113q22-42 51 0m-25-38 13-13 14 13','pp-q')}${die(60,132,6)}${tx(93,223,'ÉN VÁLASZTOK','pp-em')}`)+
        g('b',`${path('M155 142q38-74 78-6m-13-14 13 14-19 5','pp-q')}${tx(200,89,'HATOST AKAROK','pp-em')}`)+
        g('c',`${die(270,132,2)}${tx(302,223,'VÉLETLEN','pp-em')}`)+
        g('d',`${path('M237 115h126','pp-bad')}${tx(301,102,'NEM TE IRÁNYÍTOD','pp-em')}`)+
        g('e',`${rect(135,238,130,13,'pp-box')}${rect(135,238,22,13,'pp-strong')}${tx(200,265,'HATOS ESÉLYE: 1/6','pp-note')}`)+
        g('f',`${mark(204,39)}${tx(204,57,'VÁLASZD SZÉT A KETTŐT','pp-em')}`),
    },
    {
      en:'False memory',name:'Hamis emlék',q:'mem',
      line:'Az emlék nem felvétel. Ellenőrizd a részleteket független forrásból.',
      caps:[
        'Egy baráti összejövetelre <b>kék kabátban</b> érkezel.',
        'Később valaki azt kérdezi: <b>piros volt a kabátod?</b>',
        'Az új részlet <b>belekeveredhet</b> a felidézésbe.',
        'Egy idő után úgy rémlik, hogy <b>pirosban voltál</b>.',
        'Az emlékünk <b>újraépül</b>, nem tökéletes felvétel.',
        '<b>Megoldás:</b> nézd meg a korabeli fotót vagy jegyzetet.'
      ],
      svg:()=>g('a',`${person(91,123)}${rect(61,141,60,65,'pp-strong')}${tx(91,232,'KÉK KABÁT','pp-em')}${tx(94,39,'TÖRTÉNT','pp-note')}`)+
        g('b',`${path('M134 103H246m-13-12 13 12-13 12','pp-q')}${tx(198,73,'„PIROS VOLT?”','pp-em')}`)+
        g('c',`${circ(295,113,57,'pp-box')}${rect(267,123,56,56,'pp-strong')}${tx(295,204,'ÚJ KÉP')}`)+
        g('d',`${path('M270 149h51','pp-bad')}${tx(295,226,'MÁSKÉPP RÉMLIK','pp-em')}`)+
        g('e',`${rect(157,25,86,27)}${tx(200,43,'EMLÉK ≠ FILM','pp-em')}`)+
        g('f',`${rect(142,239,116,22,'pp-strong')}${tx(200,255,'FOTÓ / JEGYZET','pp-em')}${mark(331,245)}`),
    }
  ];

  const wave = [
    {steps:[{to:{a:1},ms:650,ease:'out'}],hold:3150},
    {steps:[{to:{b:1},ms:700,ease:'out'}],hold:3100},
    {steps:[{to:{a:0,b:0,c:1},ms:700,ease:'out'}],hold:3100},
    {steps:[{to:{d:1},ms:650,ease:'out'}],hold:3100},
    {steps:[{to:{e:1},ms:700,ease:'out'}],hold:3150},
    {steps:[{to:{f:1},ms:700,ease:'out'}],hold:3150}
  ];
  for (const story of stories) {
    const key = ids[story.en];
    if (!key) continue;
    registry[key] = {
      q:story.q,viewBox:'0 0 400 272',css,
      text:{hu:{name:story.name,shareTitle:`${story.name} – animáció`,ecline:story.line,
        caps:story.caps,say:story.caps.map(s=>s.replace(/<[^>]+>/g,''))}},
      svg:story.svg,
      S0:{a:0,b:0,c:0,d:0,e:0,f:0},
      render(S,k) {
        for (const part of ['a','b','c','d','e','f']) k(part).style.opacity=String(Math.max(0,Math.min(1,S[part])));
      },
      beats:wave
    };
  }
})();
