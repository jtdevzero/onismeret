/* Peak-end rule: a week by the sea drawn as a mood line. One amazing boat trip, a cancelled flight
   on the last day, and a memory that keeps only those two points and averages them to "meh".
   The whole record, and a good ending next time, set it straight. Scene for anim.js. */
(function () {
  const KEY = "peak-end-rule", P = `.bp[data-scene="${KEY}"]`;
  const V = [0.8, 1.1, 0.9, 2, 1.2, 1.1, -2];            // how each of the 7 days felt: -2 awful .. 2 amazing
  const PK = 3, EN = 6, GOOD = [0, 1, 2, 4, 5];         // the boat trip, the last day, the five good days
  const NEWEND = 1.4;                                   // next trip: an easy last day
  const XD = i => 64 + 46 * i;                          // day i (0..6) -> x
  const YV = v => 84 - 24 * v;                          // mood -> y
  const AXY = 146, FX = 24;                             // the day axis; the column of mood faces
  const PX = XD(PK), PY = YV(V[PK]), EX = XD(EN), EY = YV(V[EN]);
  const MX = (PX + EX) / 2, MY = (PY + EY) / 2;         // the peak and the end, averaged: "meh"
  const YOU = 40, FR = 358, HY = 224;                   // the two people, and their head height
  const BX0 = XD(0) - 14, BX1 = XD(EN) + 14, BY = 166;  // the bracket under the week
  const f1 = n => +n.toFixed(1);
  const cl = v => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const mouth = (x, y, hw, m) => `M${f1(x - hw)} ${f1(y)} Q${f1(x)} ${f1(y + 3.6 * m)} ${f1(x + hw)} ${f1(y)}`;
  const PLANE = "M6.5 0 C6.5 -1 5.5 -1.2 4.5 -1.2 L1.5 -1.2 L-2 -6 L-3.5 -6 L-1.5 -1.2 L-4.5 -1.2 L-5.8 -3 L-7 -3 L-6.2 0 " +
    "L-7 3 L-5.8 3 L-4.5 1.2 L-1.5 1.2 L-3.5 6 L-2 6 L1.5 1.2 L4.5 1.2 C5.5 1.2 6.5 1 6.5 0 Z";

  window.BiasAnim.SCENES[KEY] = {
    q: "mem", viewBox: "0 0 400 272",
    css: `
      ${P} .pe-ax{fill:none;stroke:var(--rule);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .pe-tk{stroke:var(--rule);stroke-width:1.4;stroke-linecap:round}
      ${P} .pe-day{font:500 9.5px var(--mono);fill:var(--faint);text-anchor:middle}
      ${P} .pe-face .o{fill:none;stroke:var(--muted);stroke-width:1.6}
      ${P} .pe-face .e{fill:var(--muted)}
      ${P} .pe-face path{fill:none;stroke:var(--muted);stroke-width:1.6;stroke-linecap:round}
      ${P} .pe-ln{fill:none;stroke:var(--ink);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
      ${P} .pe-gh path{fill:none;stroke:var(--bad);stroke-width:1.8;stroke-dasharray:3 4;stroke-linecap:round}
      ${P} .pe-gh circle{fill:none;stroke:var(--bad);stroke-width:1.6}
      ${P} .pe-sw{stroke:var(--good);stroke-width:2;stroke-linecap:round}
      ${P} .pe-dot{fill:var(--ink)}
      ${P} .pe-dot.g{fill:var(--good)}
      ${P} .pe-dot.b{fill:var(--bad)}
      ${P} .pe-hole{fill:none;stroke:var(--muted);stroke-width:1.5;stroke-dasharray:2 2.2}
      ${P} .pe-ring{fill:none;stroke:var(--q);stroke-width:2}
      ${P} .pe-ring.g{stroke:var(--good)}
      ${P} .pe-tag{font:600 10.5px var(--mono);fill:var(--q)}
      ${P} .pe-tag.g{fill:var(--good)}
      ${P} .pe-boat .h{fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linejoin:round}
      ${P} .pe-boat .m{fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round}
      ${P} .pe-boat .s{fill:var(--q);fill-opacity:.35;stroke:var(--q);stroke-width:1.6;stroke-linejoin:round}
      ${P} .pe-boat .w{fill:none;stroke:var(--q);stroke-width:1.6;stroke-linecap:round}
      ${P} .pe-chip rect{fill:var(--surface);stroke:var(--bad);stroke-width:1.6}
      ${P} .pe-chip path{fill:var(--bad)}
      ${P} .pe-chip text{font:600 9.5px var(--mono);fill:var(--bad);letter-spacing:.06em}
      ${P} .pe-cn{stroke:var(--q);stroke-width:1.6;stroke-dasharray:3 4;stroke-linecap:round}
      ${P} .pe-gd{stroke:var(--q);stroke-width:1.8;stroke-dasharray:.5 4.5;stroke-linecap:round}
      ${P} .pe-mv{fill:var(--q)}
      ${P} .pe-mm{fill:var(--q);stroke:var(--ground);stroke-width:2}
      ${P} .pe-lab{font:500 9.5px var(--mono);fill:var(--q);text-anchor:end}
      ${P} .pe-br{fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .pe-br.b{stroke:var(--bad)}
      ${P} .pe-br.g{stroke:var(--good)}
      ${P} .pe-bl{font:600 10px var(--mono);text-anchor:middle}
      ${P} .pe-bl.b{fill:var(--bad)}
      ${P} .pe-bl.g{fill:var(--good)}
      ${P} .pe-p .o{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .pe-p .e{fill:var(--ink)}
      ${P} .pe-p .m{fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round}
      ${P} .pe-p.f .o{stroke:var(--muted)}
      ${P} .pe-p.f .e{fill:var(--muted)}
      ${P} .pe-p.f .m{stroke:var(--muted)}
      ${P} .pe-bub rect,${P} .pe-bub path{fill:var(--surface);stroke:var(--muted);stroke-width:1.8;stroke-linejoin:round}
      ${P} .pe-bub text{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .pe-bub.q rect,${P} .pe-bub.q path{stroke:var(--q)}
      ${P} .pe-bub.g rect,${P} .pe-bub.g path{stroke:var(--good)}
      ${P} .pe-bub.g text{fill:var(--good)}
      ${P} .pe-nt rect{fill:none;stroke:var(--q);stroke-width:1.5}
      ${P} .pe-nt text{font:600 10px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .pe-ok rect{fill:var(--surface);stroke:var(--good);stroke-width:1.6}
      ${P} .pe-ok path{fill:none;stroke:var(--good);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .pe-ok text{font:600 10.5px var(--display);fill:var(--good)}
    `,
    text: {
      hu: {
        name: "Csúcs–vég szabály", shareTitle: "A csúcs–vég szabály, 30 másodpercben",
        ecline: "Az emlékezet a csúcsra és a végre támaszkodik. Az egészet ítéld meg, és tervezz jó befejezést.",
        day: "nap", peak: "csúcs", end: "vég", cancel: "LEMONDVA",
        ask: "Milyen volt?", askW: 88, meh: "Hát…", mehW: 48, fine: "Szép volt, a repülést leszámítva.", fineW: 196,
        avg: "átlag", barely: "7 nap: alig számít", tally: "7 nap: 6 jó, 1 rossz",
        next: "következő út", nextW: 70, easy: "könnyű utolsó nap", easyW: 104,
        caps: [
          "Egy hét a tengernél: többnyire kellemes, és egy <b>csodálatos</b> hajóút.",
          "Az utolsó nap: a járatot <b>lemondják</b>, <b>órákig rekedsz</b> a repülőtéren.",
          "Hazaérve egy barátod megkérdezi: „Milyen volt?”",
          "Az emléked két pillanatra támaszkodik: a <b>csúcsra</b> és a <b>végre</b>.",
          "Ezt a kettőt átlagolja, és azt feleled: <b>„Hát…”</b>",
          "Az öt jó nap <b>eltűnik</b>. Hogy meddig tartott, <b>alig számít</b>.",
          "<b>A megoldás:</b> nézd át a <b>teljes képet</b>, fotók vagy napi jegyzetek alapján.",
          "Következő út tervezésekor adj neki <b>jó befejezést</b>."
        ],
        say: [
          "Egy hét a tengernél. Többnyire kellemes volt, és egy csodálatos hajóút.",
          "Az utolsó napon lemondják a járatodat. Órákig rekedsz a repülőtéren.",
          "Hazaérve a barátod megkérdezi: milyen volt?",
          "Az emléked két pillanatra támaszkodik. A csúcsra, és a végre.",
          "Ezt a kettőt átlagolja, és azt feleled: hát...",
          "Az öt jó nap eltűnik. Az is alig számít, meddig tartott.",
          "A megoldás: nézd át a teljes képet, fotók vagy napi jegyzetek alapján.",
          "A következő út tervezésekor pedig adj neki jó befejezést.",
          "A csúcs–vég szabály. Az emlékezet a csúcsra és a végre támaszkodik. Az egészet ítéld meg, és tervezz jó befejezést."
        ]
      },
      en: {
        name: "Peak-end rule", shareTitle: "Peak-end rule, explained in 30 seconds",
        ecline: "Memory leans on the peak and the end. Judge the whole thing, and plan a good ending.",
        day: "day", peak: "peak", end: "end", cancel: "CANCELLED",
        ask: "How was it?", askW: 88, meh: "Meh.", mehW: 48, fine: "Lovely, apart from the flight.", fineW: 196,
        avg: "average", barely: "7 days: barely counts", tally: "7 days: 6 good, 1 bad",
        next: "next trip", nextW: 70, easy: "easy last day", easyW: 104,
        caps: [
          "A week by the sea: mostly pleasant, and one <b>amazing</b> boat trip.",
          "Last day: flight cancelled, <b>hours stuck</b> at the airport.",
          "Back home, a friend asks: “How was it?”",
          "Your memory leans on two moments: the <b>peak</b> and the <b>end</b>.",
          "It averages those two, and you answer: <b>“Meh.”</b>",
          "Five good days <b>vanish</b>. How long it lasted <b>barely counts</b>.",
          "<b>The fix:</b> check the <b>whole record</b>, from photos or daily notes.",
          "Planning the next trip? Give it a <b>good ending</b>."
        ],
        say: [
          "A week by the sea. Mostly pleasant, and one amazing boat trip.",
          "On the last day, your flight is cancelled. Hours stuck at the airport.",
          "Back home, a friend asks: how was it?",
          "Your memory leans on two moments. The peak, and the end.",
          "It averages those two, and you answer: meh.",
          "The five good days vanish. And how long it lasted barely counts.",
          "The fix: check the whole record, from photos or daily notes.",
          "And when you plan the next trip, give it a good ending.",
          "The peak-end rule. Memory leans on the peak and the end. Judge the whole thing, and plan a good ending."
        ]
      },
      el: {
        name: "Κανόνας κορύφωσης-τέλους", shareTitle: "Ο κανόνας κορύφωσης-τέλους σε 30 δευτερόλεπτα",
        ecline: "Η μνήμη στηρίζεται κυρίως στην κορύφωση και στο τέλος. Κρίνε από το σύνολο και φρόντιζε για ένα ωραίο τέλος.",
        day: "μέρα", peak: "κορύφωση", end: "τέλος", cancel: "ΑΚΥΡΩΘΗΚΕ",
        ask: "Πώς πέρασες;", askW: 96, meh: "Έτσι κι έτσι.", mehW: 96, fine: "Υπέροχα, εκτός από την πτήση.", fineW: 198,
        avg: "μέσος όρος", barely: "7 μέρες: σχεδόν δεν μετράνε", tally: "7 μέρες: 6 καλές, 1 κακή",
        next: "επόμενο ταξίδι", nextW: 100, easy: "χαλαρό φινάλε", easyW: 106,
        caps: [
          "Μια εβδομάδα στη θάλασσα: ωραίες μέρες και μια <b>απίθανη</b> εκδρομή με καΐκι.",
          "Τελευταία μέρα: η πτήση ακυρώνεται και <b>περιμένεις ώρες</b> στο αεροδρόμιο.",
          "Γυρνάς σπίτι και σε ρωτάνε: «Πώς πέρασες;»",
          "Η μνήμη σου στηρίζεται κυρίως σε δύο στιγμές: στην <b>κορύφωση</b> και στο <b>τέλος</b>.",
          "Βγάζει τον μέσο όρο τους και απαντάς: <b>«Έτσι κι έτσι»</b>.",
          "Οι πέντε ωραίες μέρες <b>χάνονται</b>. Η διάρκεια <b>σχεδόν δεν μετράει</b>.",
          "<b>Η λύση:</b> δες <b>ολόκληρη την εικόνα</b>, μέσα από φωτογραφίες ή σημειώσεις.",
          "Σχεδιάζεις το επόμενο ταξίδι; Φρόντισε να έχει <b>ωραίο τέλος</b>."
        ],
        say: [
          "Μια εβδομάδα στη θάλασσα. Ωραίες μέρες, και μια απίθανη εκδρομή με καΐκι.",
          "Την τελευταία μέρα, η πτήση ακυρώνεται. Περιμένεις ώρες στο αεροδρόμιο.",
          "Γυρνάς σπίτι και σε ρωτάνε: Πώς πέρασες;",
          "Η μνήμη σου στηρίζεται κυρίως σε δύο στιγμές. Στην κορύφωση και στο τέλος.",
          "Βγάζει τον μέσο όρο τους, και απαντάς: έτσι κι έτσι.",
          "Οι πέντε ωραίες μέρες χάνονται. Και η διάρκεια σχεδόν δεν μετράει.",
          "Η λύση: δες ολόκληρη την εικόνα, μέσα από φωτογραφίες ή σημειώσεις.",
          "Κι όταν σχεδιάζεις το επόμενο ταξίδι, φρόντισε να έχει ωραίο τέλος.",
          "Κανόνας κορύφωσης-τέλους. Η μνήμη στηρίζεται κυρίως στην κορύφωση και στο τέλος. Κρίνε από το σύνολο και φρόντιζε για ένα ωραίο τέλος."
        ]
      },
      es: {
        name: "Regla del pico y el final", shareTitle: "La regla del pico y el final en 30 segundos",
        ecline: "La memoria se apoya en el pico y el final. Juzga el conjunto y planea un buen final.",
        day: "día", peak: "pico", end: "final", cancel: "CANCELADO",
        ask: "¿Qué tal?", askW: 88, meh: "Regular.", mehW: 96, fine: "Genial, salvo por el vuelo.", fineW: 196,
        avg: "promedio", barely: "7 días: apenas cuentan", tally: "7 días: 6 buenos, 1 malo",
        next: "próximo viaje", nextW: 101, easy: "final relajado", easyW: 112,
        caps: [
          "Una semana junto al mar: casi todo agradable, y una excursión en barco <b>increíble</b>.",
          "Último día: vuelo cancelado, <b>horas atrapado</b> en el aeropuerto.",
          "Ya en casa, una amiga te pregunta: «¿Qué tal?».",
          "Tu memoria se apoya en dos momentos: el <b>pico</b> y el <b>final</b>.",
          "Promedia esos dos, y respondes: <b>«Regular»</b>.",
          "Cinco días buenos <b>desaparecen</b>. Lo que duró <b>apenas cuenta</b>.",
          "<b>La solución:</b> revisa <b>todo el registro</b>, con fotos o notas diarias.",
          "¿Planeas el próximo viaje? Dale un <b>buen final</b>."
        ],
        say: [
          "Una semana junto al mar. Casi todo agradable, y una excursión en barco increíble.",
          "El último día, cancelan tu vuelo. Horas atrapado en el aeropuerto.",
          "Ya en casa, una amiga te pregunta: ¿qué tal?",
          "Tu memoria se apoya en dos momentos. El pico, y el final.",
          "Promedia esos dos, y respondes: regular.",
          "Los cinco días buenos desaparecen. Y lo que duró apenas cuenta.",
          "La solución: revisa todo el registro, con fotos o notas diarias.",
          "Y cuando planees el próximo viaje, dale un buen final.",
          "La regla del pico y el final. La memoria se apoya en el pico y el final. Juzga el conjunto, y planea un buen final."
        ]
      },
      fr: {
        name: "Règle pic-fin", shareTitle: "La règle pic-fin en 30 secondes",
        ecline: "La mémoire s’appuie sur le pic et la fin. Jugez l’ensemble, et prévoyez une belle fin.",
        day: "jour", peak: "pic", end: "fin", cancel: "ANNULÉ",
        ask: "C’était bien ?", askW: 94, meh: "Bof.", mehW: 48, fine: "Génial, à part le vol.", fineW: 196,
        avg: "moyenne", barely: "7 jours : comptent à peine", tally: "7 jours : 6 bons, 1 mauvais",
        next: "prochain voyage", nextW: 106, easy: "fin en douceur", easyW: 110,
        caps: [
          "Une semaine à la mer : surtout agréable, et une sortie en bateau <b>géniale</b>.",
          "Dernier jour : vol annulé, <b>des heures d’attente</b> à l’aéroport.",
          "De retour, une amie vous demande : « C’était bien ? »",
          "Votre mémoire s’appuie sur deux moments : le <b>pic</b> et la <b>fin</b>.",
          "Elle fait la moyenne des deux, et vous répondez : <b>« Bof. »</b>",
          "Cinq bons jours <b>disparaissent</b>. La durée <b>compte à peine</b>.",
          "<b>La solution :</b> regardez <b>l’ensemble</b>, avec vos photos ou des notes quotidiennes.",
          "Vous préparez le prochain voyage ? Offrez-lui une <b>belle fin</b>."
        ],
        say: [
          "Une semaine à la mer. Surtout agréable, et une sortie en bateau géniale.",
          "Le dernier jour, votre vol est annulé. Des heures d’attente à l’aéroport.",
          "De retour, une amie vous demande : c’était bien ?",
          "Votre mémoire s’appuie sur deux moments. Le pic, et la fin.",
          "Elle fait la moyenne des deux, et vous répondez : bof.",
          "Les cinq bons jours disparaissent. Et la durée compte à peine.",
          "La solution : regardez l’ensemble, avec vos photos ou des notes quotidiennes.",
          "Et quand vous préparez le prochain voyage, offrez-lui une belle fin.",
          "La règle pic-fin. La mémoire s’appuie sur le pic et la fin. Jugez l’ensemble, et prévoyez une belle fin."
        ]
      },
      de: {
        name: "Peak-End-Regel", shareTitle: "Die Peak-End-Regel in 30 Sekunden",
        ecline: "Das Gedächtnis stützt sich auf den Höhepunkt und das Ende. Beurteile das Ganze und plane ein gutes Ende.",
        day: "Tag", peak: "Höhepunkt", end: "Ende", cancel: "FÄLLT AUS",
        ask: "Wie war’s?", askW: 88, meh: "Na ja.", mehW: 54, fine: "Schön, bis auf den Flug.", fineW: 196,
        avg: "Durchschnitt", barely: "7 Tage: zählen kaum", tally: "7 Tage: 6 gut, 1 schlecht",
        next: "nächste Reise", nextW: 94, easy: "ruhiges Ende", easyW: 104,
        caps: [
          "Eine Woche am Meer: meist angenehm, dazu eine <b>traumhafte</b> Bootstour.",
          "Letzter Tag: Der Flug fällt aus, <b>stundenlang Warten</b> am Flughafen.",
          "Zu Hause fragt eine Freundin: „Wie war’s?“",
          "Dein Gedächtnis stützt sich auf zwei Momente: den <b>Höhepunkt</b> und das <b>Ende</b>.",
          "Es bildet den Mittelwert aus beiden, und du sagst: <b>„Na ja.“</b>",
          "Fünf gute Tage <b>verschwinden</b>. Wie lange es dauerte, <b>zählt kaum</b>.",
          "<b>Die Lösung:</b> Schau dir <b>den ganzen Verlauf</b> an, mit Fotos oder täglichen Notizen.",
          "Du planst die nächste Reise? Gönn ihr <b>ein gutes Ende</b>."
        ],
        say: [
          "Eine Woche am Meer. Meist angenehm, dazu eine traumhafte Bootstour.",
          "Am letzten Tag fällt dein Flug aus. Stundenlang sitzt du am Flughafen fest.",
          "Zu Hause fragt eine Freundin: Wie war’s?",
          "Dein Gedächtnis stützt sich auf zwei Momente. Den Höhepunkt und das Ende.",
          "Es bildet den Mittelwert aus beiden, und du sagst: na ja.",
          "Die fünf guten Tage verschwinden. Und wie lange es dauerte, zählt kaum.",
          "Die Lösung: Schau dir den ganzen Verlauf an, mit Fotos oder täglichen Notizen.",
          "Und wenn du die nächste Reise planst, gönn ihr ein gutes Ende.",
          "Die Peak-End-Regel. Das Gedächtnis stützt sich auf den Höhepunkt und das Ende. Beurteile das Ganze und plane ein gutes Ende."
        ]
      },
      it: {
        name: "Regola del picco e della fine", shareTitle: "La regola del picco e della fine in 30 secondi",
        ecline: "La memoria si appoggia sul picco e sulla fine. Giudica l’insieme, e pianifica un bel finale.",
        day: "giorno", peak: "picco", end: "fine", cancel: "ANNULLATO",
        ask: "Com’è andata?", askW: 107, meh: "Mah.", mehW: 48, fine: "Bellissimo, a parte il volo.", fineW: 196,
        avg: "media", barely: "7 giorni: contano appena", tally: "7 giorni: 6 bene, 1 male",
        next: "nuovo viaggio", nextW: 94, easy: "finale sereno", easyW: 104,
        caps: [
          "Una settimana al mare: quasi tutta piacevole, e una gita in barca <b>fantastica</b>.",
          "Ultimo giorno: volo annullato, <b>ore di attesa</b> in aeroporto.",
          "A casa, un amico ti chiede: «Com’è andata?»",
          "La memoria si appoggia su due momenti: il <b>picco</b> e la <b>fine</b>.",
          "Fa la media dei due, e rispondi: <b>«Mah»</b>.",
          "Cinque giorni belli <b>spariscono</b>. Quanto è durata <b>conta appena</b>.",
          "<b>La soluzione:</b> guarda il <b>quadro completo</b>, da foto o appunti quotidiani.",
          "Pianifichi il prossimo viaggio? Dagli un <b>bel finale</b>."
        ],
        say: [
          "Una settimana al mare. Quasi tutta piacevole, e una gita in barca fantastica.",
          "L’ultimo giorno, il volo viene annullato. Ore di attesa in aeroporto.",
          "A casa, un amico ti chiede: com’è andata?",
          "La memoria si appoggia su due momenti. Il picco, e la fine.",
          "Fa la media dei due, e rispondi: mah.",
          "I cinque giorni belli spariscono. E quanto è durata conta appena.",
          "La soluzione: guarda il quadro completo, da foto o appunti quotidiani.",
          "E quando pianifichi il prossimo viaggio, dagli un bel finale.",
          "La regola del picco e della fine. La memoria si appoggia sul picco e sulla fine. Giudica l’insieme, e pianifica un bel finale."
        ]
      }
    },
    svg(T) {
      // mood faces up the side, days along the bottom
      const face = (v, m, my) => `<g class="pe-face" transform="translate(${FX} ${YV(v)})"><circle class="o" r="7"/>` +
        `<circle class="e" cx="-2.5" cy="-1.6" r="1"/><circle class="e" cx="2.5" cy="-1.6" r="1"/><path d="${mouth(0, my, 3.2, m)}"/></g>`;
      let days = "";
      for (let i = 0; i < 7; i++) days += `<line class="pe-tk" x1="${XD(i)}" y1="${AXY}" x2="${XD(i)}" y2="${AXY + 4}"/><text class="pe-day" x="${XD(i)}" y="159">${i + 1}</text>`;
      const dots = GOOD.map(i => { const x = XD(i), y = YV(V[i]);
        return `<circle class="pe-hole" data-k="h${i}" cx="${x}" cy="${y}" r="4.4"/><circle class="pe-dot" data-k="d${i}" cx="${x}" cy="${y}" r="3.6"/>` +
          `<circle class="pe-dot g" data-k="g${i}" cx="${x}" cy="${y}" r="3.6"/>`; }).join("");
      // a person: head and shoulders standing on the bottom edge, with a face
      const bust = (x, cls, key, m) => `<g class="pe-p ${cls}" data-k="${key}">` +
        `<path class="o" d="M${x - 20} 262 V258 C${x - 20} 246 ${x - 11} 240 ${x} 240 C${x + 11} 240 ${x + 20} 246 ${x + 20} 258 V262"/>` +
        `<circle class="o" cx="${x}" cy="${HY}" r="10"/><circle class="e" cx="${x - 3.5}" cy="${HY - 2}" r="1.3"/><circle class="e" cx="${x + 3.5}" cy="${HY - 2}" r="1.3"/>` +
        (m === null ? `<path class="m" data-k="ym"/>` : `<path class="m" d="${mouth(x, HY + 4, 4, m)}"/>`) + `</g>`;
      // your speech bubble, to the right of your head
      const say = (key, cls, w, s) => `<g class="pe-bub ${cls}" data-k="${key}"><rect x="64" y="${HY - 13}" width="${w}" height="24" rx="9"/>` +
        `<path d="M65 ${HY - 6} L55 ${HY - 1} L65 ${HY + 4}"/><text x="${64 + w / 2}" y="${HY + 3.5}">${s}</text></g>`;
      const fbx = 386 - T.askW, okx = 330 - T.easyW / 2;
      return `
        <g data-k="ax"><path class="pe-ax" d="M40 24 V${AXY} H364"/>${days}<text class="pe-day" x="${FX}" y="159">${T.day}</text>
          ${face(2, 1, 2.2)}${face(0, 0, 3)}${face(-2, -1, 4.2)}</g>
        <line class="pe-sw" data-k="sw" y1="24" y2="${AXY}"/>
        <g class="pe-gh" data-k="gh"><path d="M${XD(5)} ${YV(V[5])} L${EX} ${EY}"/><circle cx="${EX}" cy="${EY}" r="4"/></g>
        <path class="pe-ln" data-k="ln"/>
        ${dots}
        <circle class="pe-dot" data-k="pk" cx="${PX}" cy="${PY}" r="4.4"/>
        <circle class="pe-dot b" data-k="en" cx="${EX}" r="4.4"/><circle class="pe-dot g" data-k="en2" cx="${EX}" r="4.4"/>
        <circle class="pe-ring" data-k="rp" cx="${PX}" cy="${PY}"/><circle class="pe-ring" data-k="re" cx="${EX}"/><circle class="pe-ring g" data-k="rg" cx="${EX}" r="9"/>
        <line class="pe-cn" data-k="cn" x1="${PX}" y1="${PY}"/>
        <line class="pe-gd" data-k="gd" y1="${MY}" y2="${MY}" x2="${MX}"/>
        <circle class="pe-ring" data-k="mr" cx="${FX}" cy="${MY}" r="10.5"/>
        <circle class="pe-mv" data-k="ma" r="4"/><circle class="pe-mv" data-k="mb" r="4"/>
        <circle class="pe-mm" data-k="mm" cx="${MX}" cy="${MY}"/>
        <text class="pe-lab" data-k="avg" x="${MX - 10}" y="${MY + 15}">${T.avg}</text>
        <text class="pe-tag" data-k="lp" x="${PX + 12}" y="${PY - 4}">${T.peak}</text>
        <text class="pe-tag" data-k="le" x="${EX + 12}">${T.end}</text><text class="pe-tag g" data-k="le2" x="${EX + 12}">${T.end}</text>
        <g class="pe-boat" data-k="boat"><g transform="translate(174 28)"><path class="m" d="M0 0 V-16"/><path class="s" d="M2 -15 L10 -3 H2 Z"/>
          <path class="h" d="M-11 0 H11 L7 6 H-7 Z"/><path class="w" d="M-13 10 q3.25 -3 6.5 0 t6.5 0 t6.5 0 t6.5 0"/></g></g>
        <g class="pe-chip" data-k="chip"><rect x="234" y="122" width="80" height="16" rx="3"/><path transform="translate(243 130)" d="${PLANE}"/>
          <text x="253" y="133.5">${T.cancel}</text></g>
        <g data-k="br"><path class="pe-br b" data-k="brb" pathLength="1" stroke-dasharray="1 1" d="M${BX0} ${BY - 4} V${BY} H${BX1} V${BY - 4}"/>
          <path class="pe-br g" data-k="brg" d="M${BX0} ${BY - 4} V${BY} H${BX1} V${BY - 4}"/>
          <text class="pe-bl b" data-k="blb" x="${(BX0 + BX1) / 2}" y="${BY + 15}">${T.barely}</text>
          <text class="pe-bl g" data-k="blg" x="${(BX0 + BX1) / 2}" y="${BY + 15}">${T.tally}</text></g>
        ${bust(YOU, "", "you", null)}${bust(FR, "f", "fr", .7)}
        <g class="pe-bub" data-k="fb"><rect x="${fbx}" y="182" width="${T.askW}" height="24" rx="12"/><path d="M${FR - 11} 205 L${FR - 4} 212 L${FR - 1} 205"/>
          <text x="${fbx + T.askW / 2}" y="198">${T.ask}</text></g>
        ${say("yb1", "q", T.mehW, T.meh)}${say("yb2", "g", T.fineW, T.fine)}
        <g class="pe-nt" data-k="nt"><rect x="48" y="10" width="${T.nextW}" height="17" rx="8.5"/><text x="${48 + T.nextW / 2}" y="22">${T.next}</text></g>
        <g class="pe-ok" data-k="ok"><rect x="${okx}" y="12" width="${T.easyW}" height="19" rx="9.5"/>
          <path data-k="chk" pathLength="1" stroke-dasharray="1 1" d="M${okx + 9} 21.5 l3 3 l6 -7"/><text x="${okx + 22}" y="25.5">${T.easy}</text></g>`;
    },
    S0: { ax: 0, ln: -0.3, boat: 0, chip: 0, you: 0, fr: 0, fb: 0, mood: .35, fade: 0, tp: 0, te: 0,
      cn: 0, mv: 0, mm: 0, gd: 0, avg: 0, mr: 0, yb1: 0, gone: 0, br: 0,
      avgOut: 0, back: 0, brG: 0, yb2: 0, talkOut: 0, nt: 0, gh: 0, chipOut: 0, endV: V[EN], ok: 0, chk: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const at = (key, x, y) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)})`);
      const grow = (key, x, y, s) => k(key).setAttribute("transform",
        `translate(${f1(x)} ${f1(y)}) scale(${Math.max(.001, s).toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
      const pos = (key, x, y) => { const e = k(key); e.setAttribute("cx", f1(x)); e.setAttribute("cy", f1(y)); };
      // the chart
      op("ax", S.ax); at("ax", 0, 6 * (1 - S.ax));
      // the mood line, drawn day by day; its last point is wherever the ending is
      const ys = V.map((v, i) => YV(i === EN ? S.endV : v));
      let d = `M${XD(0)} ${f1(ys[0])}`;
      for (let i = 1; i <= EN; i++) {
        if (S.ln >= i) { d += ` L${XD(i)} ${f1(ys[i])}`; continue; }
        if (S.ln > i - 1) { const t = S.ln - (i - 1); d += ` L${f1(lerp(XD(i - 1), XD(i), t))} ${f1(lerp(ys[i - 1], ys[i], t))}`; }
        break;
      }
      k("ln").setAttribute("d", d);
      op("ln", (S.ln > 0 ? 1 : 0) * (1 - .75 * S.fade));
      const appear = i => cl((S.ln - i) * 5 + 1);
      // the five good days: faded by memory, then gone, then back in green when you check the record
      GOOD.forEach((i, n) => {
        const g = cl(S.gone * 5 - n), b = cl(S.back * 7 - i);
        op("d" + i, appear(i) * (1 - .7 * S.fade) * (1 - g) * (1 - b));
        op("h" + i, g * (1 - b));
        op("g" + i, b); k("g" + i).setAttribute("r", f1(3.6 * (.4 + .6 * b)));
      });
      op("sw", Math.sin(Math.PI * cl(S.back)));
      k("sw").setAttribute("x1", f1(40 + 324 * S.back)); k("sw").setAttribute("x2", f1(40 + 324 * S.back));
      // the peak and the end
      op("pk", appear(PK));
      k("en").setAttribute("cy", f1(ys[EN])); k("en2").setAttribute("cy", f1(ys[EN]));
      op("en", appear(EN) * (1 - S.ok)); op("en2", S.ok);
      k("rp").setAttribute("r", f1(9 + 6 * (1 - S.tp))); op("rp", S.tp * (1 - S.avgOut));
      k("re").setAttribute("r", f1(9 + 6 * (1 - S.te))); k("re").setAttribute("cy", f1(ys[EN])); op("re", S.te * (1 - S.avgOut));
      k("rg").setAttribute("cy", f1(ys[EN])); op("rg", S.ok);
      op("lp", S.tp);
      k("le").setAttribute("y", f1(ys[EN] + 3.5)); k("le2").setAttribute("y", f1(ys[EN] + 3.5));
      op("le", S.te * (1 - S.ok)); op("le2", S.te * S.ok);
      op("boat", S.boat); grow("boat", 174, 34, .5 + .5 * S.boat);
      op("chip", cl(S.chip * 3) * (1 - S.chipOut)); at("chip", 0, -16 * (1 - S.chip));
      // memory averages the two: they slide together and meet halfway, at "meh"
      const out = 1 - S.avgOut;
      k("cn").setAttribute("x2", f1(lerp(PX, EX, S.cn))); k("cn").setAttribute("y2", f1(lerp(PY, EY, S.cn)));
      op("cn", (S.cn > 0 ? .9 : 0) * out);
      pos("ma", lerp(PX, MX, S.mv), lerp(PY, MY, S.mv)); pos("mb", lerp(EX, MX, S.mv), lerp(EY, MY, S.mv));
      op("ma", cl(S.mv * 8) * (1 - S.mm) * out); op("mb", cl(S.mv * 8) * (1 - S.mm) * out);
      k("mm").setAttribute("r", f1(Math.max(0, 6 * S.mm))); op("mm", cl(S.mm * 3) * out);
      k("gd").setAttribute("x1", f1(MX - (MX - FX - 13) * S.gd)); op("gd", (S.gd > 0 ? 1 : 0) * out);
      op("avg", S.avg * out); op("mr", S.mr * out);
      // how long it lasted
      k("brb").style.strokeDashoffset = (1 - cl(S.br * 1.4)).toFixed(3);
      op("brb", (S.br > 0 ? 1 : 0) * (1 - S.brG)); op("brg", S.brG);
      op("blb", cl(S.br * 3 - 2) * (1 - S.brG)); op("blg", S.brG);
      op("br", 1 - S.talkOut);
      // you and a friend, back home
      op("you", S.you); at("you", 0, 10 * (1 - S.you));
      op("fr", S.fr); at("fr", 0, 10 * (1 - S.fr));
      k("ym").setAttribute("d", mouth(YOU, HY + 4, 4, S.mood));
      op("fb", cl(S.fb * 2) * (1 - S.talkOut)); grow("fb", FR - 4, 212, .7 + .3 * S.fb);
      op("yb1", cl(S.yb1 * 2)); grow("yb1", 55, HY - 1, .7 + .3 * S.yb1);
      op("yb2", cl(S.yb2 * 2) * (1 - S.talkOut)); grow("yb2", 55, HY - 1, .7 + .3 * S.yb2);
      // next time: a good ending
      op("nt", S.nt); at("nt", -6 * (1 - S.nt), 0);
      op("gh", S.gh);
      op("ok", cl(S.ok * 2)); grow("ok", 330, 31, .7 + .3 * S.ok);
      k("chk").style.strokeDashoffset = (1 - cl(S.chk)).toFixed(3);
    },
    beats: [
      { steps: [{ to: { ax: 1 }, ms: 500, sfx: "pluck" }, { to: { ln: PK }, ms: 1300, ease: "inOut" },
        { to: { boat: 1 }, ms: 500, ease: "out", sfx: "pop" }, { to: { ln: 5 }, ms: 900, ease: "inOut" }] },
      { steps: [{ wait: 200 }, { to: { ln: EN }, ms: 650, ease: "inOut", sfx: "thud", sfxAt: 520 },
        { to: { chip: 1 }, ms: 700, ease: "out" }] },
      { steps: [{ to: { you: 1 }, ms: 400 }, { to: { fr: 1 }, ms: 400 }, { wait: 150 },
        { to: { fb: 1 }, ms: 450, ease: "out", sfx: "pop" }] },
      { steps: [{ to: { fade: 1 }, ms: 700 }, { to: { tp: 1 }, ms: 400, ease: "out", sfx: "tick" }, { wait: 250 },
        { to: { te: 1 }, ms: 400, ease: "out" }], hold: 2800 },
      { steps: [{ to: { cn: 1 }, ms: 500, ease: "inOut" }, { to: { mv: 1 }, ms: 900, ease: "inOut", sfx: "whoosh" },
        { to: { mm: 1 }, ms: 350, ease: "out" }, { to: { gd: 1, avg: 1 }, ms: 500 }, { to: { mr: 1 }, ms: 300 },
        { to: { yb1: 1, mood: 0 }, ms: 450, ease: "out" }], hold: 2800 },
      { steps: [{ to: { gone: 1 }, ms: 1100, ease: "lin" }, { wait: 250 }, { to: { br: 1 }, ms: 700, ease: "lin" }], hold: 3000 },
      { steps: [{ to: { avgOut: 1, yb1: 0 }, ms: 400 }, { to: { fade: 0 }, ms: 400 },
        { to: { back: 1 }, ms: 1100, ease: "lin", sfx: "tick" }, { to: { brG: 1 }, ms: 400 },
        { to: { yb2: 1, mood: 1 }, ms: 450, ease: "out" }], hold: 3000 },
      { steps: [{ to: { talkOut: 1 }, ms: 400 }, { to: { nt: 1 }, ms: 400 }, { to: { gh: 1, chipOut: 1 }, ms: 300 },
        { to: { endV: NEWEND }, ms: 900, ease: "out", sfx: "spring" }, { to: { ok: 1 }, ms: 450, ease: "out" },
        { to: { chk: 1 }, ms: 350, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
