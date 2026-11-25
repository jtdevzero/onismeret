/* Optimism bias: years of photos on a laptop with no backup, a row of laptops just like it that
   get broken, lost and stolen, a crowd that puts itself below average, and a backup drive. Scene for anim.js. */
(function () {
  const KEY = "optimism-bias", P = `.bp[data-scene="${KEY}"]`;
  const N = 10, RX0 = 26, RP = 30, RB = 228;          // row of laptops: first centre, pitch, base line
  const YOU = 3, SX = RX0 + RP * YOU;                 // your place in the row
  const HX = 92, HB = 110;                            // your laptop on its own: base centre
  const SH = .8, SR = .2;                             // laptop scale on its own / in the row
  const PX = 200, PY = 70;                            // you: head centre
  const LINE = 160, TAG = 243;                        // the "average" line, the row's tags
  const HITS = { 1: "broken", 6: "lost", 8: "stolen" };
  const CLAIM = [182, 176, 188, 0, 180, 186, 174, 184, 178, 189];   // where each person puts their own risk
  const REAL = [136, 176, 146, 0, 180, 130, 174, 150, 178, 140];    // where some of them must really be
  const UP = [0, 2, 5, 7, 9];
  const DX = 322, DY = 66;                            // backup drive centre
  const FROM = [SX, RB - 14], VIA = [262, 176], TO = [DX - 22, DY];      // photos copying across
  const cx = i => RX0 + RP * i;
  const cl = v => Math.max(0, Math.min(1, v));
  const f2 = v => +v.toFixed(2), f3 = v => +v.toFixed(3);
  const out3 = t => 1 - Math.pow(1 - t, 3);

  // a laptop, drawn big (screen 120 wide) around its base centre; scaled down with non-scaling strokes
  const lap = cls => `<rect class="ob-s ${cls}" x="-60" y="-84" width="120" height="76" rx="6"/><path class="ob-s ${cls}" d="M-70 0 L-61 -8 H61 L70 0 Z"/>`;
  const CRACK = "M38 -84 L24 -62 L34 -52 L14 -30 L22 -20 L12 -8 M24 -62 L2 -56 M14 -30 L-10 -36";
  const PH = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) PH.push([-54 + c * 38, -73 + r * 30]);
  const PHOTO = `<rect x="-10" y="-7.5" width="20" height="15" rx="2.5"/><path d="M-7 5 L-2 -1 L2 2.5 L4.5 0 L8 5"/><circle cx="4.5" cy="-3" r="1.8"/>`;
  const thumb = ([x, y]) => `<rect x="${x}" y="${y}" width="32" height="24" rx="3"/>` +
    `<path d="M${x + 4} ${y + 20} L${x + 12} ${y + 11} L${x + 18} ${y + 16} L${x + 22} ${y + 12} L${x + 28} ${y + 20}"/><circle cx="${x + 24}" cy="${y + 6.5}" r="2.6"/>`;

  window.BiasAnim.SCENES[KEY] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
      ${P} .ob-s{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round;vector-effect:non-scaling-stroke}
      ${P} .ob-s.q{stroke:var(--q)}
      ${P} .ob-s.d{fill:none;stroke:var(--bad);stroke-width:1.6;stroke-dasharray:3 3}
      ${P} .ob-s.dq{fill:none;stroke:var(--q);stroke-width:1.6;stroke-dasharray:3 3}
      ${P} .ob-ph rect{fill:var(--q);fill-opacity:.14;stroke:var(--q);stroke-width:1.6;vector-effect:non-scaling-stroke}
      ${P} .ob-ph path{fill:none;stroke:var(--q);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
      ${P} .ob-ph circle{fill:var(--q)}
      ${P} .ob-gp{fill:none;stroke:var(--faint);stroke-width:1.4;stroke-dasharray:3 3;vector-effect:non-scaling-stroke}
      ${P} .ob-dead{fill:var(--ground)}
      ${P} .ob-crack{fill:none;stroke:var(--bad);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
      ${P} .ob-tag rect{fill:var(--surface);stroke:var(--bad);stroke-width:1.6}
      ${P} .ob-tag path{fill:none;stroke:var(--bad);stroke-width:1.8;stroke-linecap:round}
      ${P} .ob-tag text{font:600 10.5px var(--display);fill:var(--bad)}
      ${P} .ob-hit{font:500 9.5px var(--mono);fill:var(--bad);text-anchor:middle}
      ${P} .ob-you{font:500 9.5px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .ob-note{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .ob-avg{stroke:var(--ink);stroke-width:1.6;stroke-dasharray:5 4;stroke-linecap:round}
      ${P} .ob-avgl{font:500 10px var(--mono);fill:var(--ink)}
      ${P} .ob-mk{fill:var(--surface);stroke:var(--ink);stroke-width:2}
      ${P} .ob-mk.b{stroke:var(--bad)}
      ${P} .ob-mk.q{fill:var(--q);stroke:var(--q)}
      ${P} .ob-ring{fill:none;stroke:var(--q);stroke-width:1.6}
      ${P} .ob-gh{fill:none;stroke:var(--muted);stroke-width:1.5;stroke-dasharray:2.2 2.2}
      ${P} .ob-br path{fill:none;stroke:var(--bad);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ob-br text{font:600 10.5px var(--display);fill:var(--bad)}
      ${P} .ob-hd{fill:var(--surface);stroke:var(--ink);stroke-width:2.2}
      ${P} .ob-st{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ob-eye{fill:var(--ink)}
      ${P} .ob-bub{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .ob-bt{font:600 12.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ob-drv{fill:var(--surface);stroke:var(--ink);stroke-width:2.2}
      ${P} .ob-trk{fill:none;stroke:var(--rule);stroke-width:1.4}
      ${P} .ob-barf{fill:var(--good)}
      ${P} .ob-led{fill:var(--good)}
      ${P} .ob-drl{font:600 11.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ob-chk circle{fill:var(--surface);stroke:var(--good);stroke-width:2}
      ${P} .ob-chk path{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
    `,
    text: {
      hu: {
        name: "Optimizmus-torzítás", shareTitle: "Az optimizmus-torzítás, 30 másodpercben",
        ecline: "A balszerencse nem kerül el. Úgy tervezz, mintha te is ugyanolyan eséllyel érintkeznél vele, mint bárki más.",
        nob: "nincs mentés", nobW: 78, notme: "Velem ez nem.", bubW: 84,
        hits: { broken: "elromlik", lost: "elveszik", stolen: "ellopják" }, you: "te", people: ["mások", "mint te"],
        avg: "átlag", imp: "lehetetlen", backup: "Mentés",
        caps: [
          "A laptopodon évek fotói vannak. <b>Nincs mentés.</b>",
          "A laptopok <b>folyton</b> elvesznek, ellopják, vagy elromlanak.",
          "De ez másokkal történik, gondolod.",
          "Ha megkérdezel egy csoportot, a <b>legtöbben</b> az átlag alá helyezik a saját kockázatukat.",
          "<b>Nem lehet</b> mind átlag alatt.",
          "Aztán egyszer rajtad is megtörténik. A fotók elvesznek.",
          "<b>A megoldás:</b> tételezd fel, hogy ugyanúgy érint, mint bárkit.",
          "Aztán tedd meg az olcsó óvintézkedést. <b>Mentsd le még ma.</b>"
        ],
        say: [
          "A laptopodon évek fotói vannak. Nincs mentés.",
          "A laptopok folyton elvesznek, ellopják, vagy elromlanak.",
          "De ez másokkal történik, gondolod.",
          "Ha megkérdezel egy csoportot, a legtöbben az átlag alá helyezik a saját kockázatukat.",
          "Nem lehet mind átlag alatt.",
          "Aztán egyszer rajtad is megtörténik. A fotók elvesznek.",
          "A megoldás: tételezd fel, hogy ugyanúgy érint, mint bárkit.",
          "Aztán tedd meg az olcsó óvintézkedést. Mentsd le még ma.",
          "Optimizmus-torzítás. A balszerencse nem kerül el. Úgy tervezz, mintha te is ugyanolyan eséllyel érintkeznél vele, mint bárki más."
        ]
      },
      en: {
        name: "Optimism bias", shareTitle: "Optimism bias, explained in 30 seconds",
        ecline: "Bad luck doesn't skip you. Plan as if you're as likely as anyone.",
        nob: "no backup", nobW: 78, notme: "Not me.", bubW: 84,
        hits: { broken: "broken", lost: "lost", stolen: "stolen" }, you: "you", people: ["people", "like you"],
        avg: "average", imp: "impossible", backup: "Backup",
        caps: [
          "Your laptop holds years of photos. <b>No backup.</b>",
          "Laptops get lost, stolen or broken <b>all the time</b>.",
          "But that happens to <b>other people</b>, you think.",
          "Ask a crowd, and <b>most</b> rate their own risk below average.",
          "They <b>can't all</b> be below average.",
          "Then one day, it happens to <b>you</b>. The photos are gone.",
          "<b>The fix:</b> assume you're as likely as anyone.",
          "Then take the cheap precaution. <b>Back it up today.</b>"
        ],
        say: [
          "Your laptop holds years of photos. No backup.",
          "Laptops get lost, stolen or broken all the time.",
          "But that happens to other people, you think.",
          "Ask a crowd, and most people rate their own risk below average.",
          "They can't all be below average.",
          "Then one day, it happens to you. The photos are gone.",
          "The fix: assume you're as likely as anyone.",
          "Then take the cheap precaution. Back it up today.",
          "Optimism bias. Bad luck doesn't skip you. Plan as if you're as likely as anyone."
        ]
      },
      el: {
        name: "Μεροληψία αισιοδοξίας", shareTitle: "Η μεροληψία αισιοδοξίας σε 30 δευτερόλεπτα",
        ecline: "Η ατυχία δεν κάνει εξαιρέσεις. Να\u00a0προετοιμάζεσαι σαν να κινδυνεύεις όσο και οι\u00a0άλλοι.",
        nob: "χωρίς αντίγραφο", nobW: 108, notme: "Όχι σ’ εμένα.", bubW: 108,
        hits: { broken: "χάλασε", lost: "χάθηκε", stolen: "κλάπηκε" }, you: "εσύ", people: ["άνθρωποι", "σαν εσένα"],
        avg: "μέσος όρος", imp: "αδύνατον", backup: "Αντίγραφο ασφαλείας",
        caps: [
          "Στο λάπτοπ σου έχεις φωτογραφίες πολλών χρόνων. <b>Αντίγραφο ασφαλείας; Κανένα.</b>",
          "Λάπτοπ χάνονται, κλέβονται και χαλάνε <b>συνέχεια</b>.",
          "Όμως αυτά συμβαίνουν <b>στους άλλους</b>, σκέφτεσαι.",
          "Ρώτα γύρω σου: οι <b>περισσότεροι</b> λένε ότι κινδυνεύουν λιγότερο από τον μέσο όρο.",
          "Δεν γίνεται να είναι <b>όλοι</b> κάτω από τον μέσο όρο.",
          "Ώσπου μια μέρα συμβαίνει σ’\u00a0<b>εσένα</b>. Οι φωτογραφίες χάθηκαν.",
          "<b>Η λύση:</b> υπολόγιζε ότι κινδυνεύεις όσο και οι\u00a0άλλοι.",
          "Η προφύλαξη κοστίζει λίγο: <b>κάνε αντίγραφο σήμερα κιόλας.</b>"
        ],
        say: [
          "Στο λάπτοπ σου έχεις φωτογραφίες πολλών χρόνων. Αντίγραφο ασφαλείας; Κανένα.",
          "Λάπτοπ χάνονται, κλέβονται και χαλάνε συνέχεια.",
          "Όμως αυτά συμβαίνουν στους άλλους, σκέφτεσαι.",
          "Ρώτα γύρω σου: οι περισσότεροι λένε ότι κινδυνεύουν λιγότερο από τον μέσο όρο.",
          "Δεν γίνεται να είναι όλοι κάτω από τον μέσο όρο.",
          "Ώσπου μια μέρα συμβαίνει σ’ εσένα. Οι φωτογραφίες χάθηκαν.",
          "Η λύση: υπολόγιζε ότι κινδυνεύεις όσο και οι άλλοι.",
          "Η προφύλαξη κοστίζει λίγο: κάνε αντίγραφο σήμερα κιόλας.",
          "Μεροληψία αισιοδοξίας. Η ατυχία δεν κάνει εξαιρέσεις. Να προετοιμάζεσαι σαν να κινδυνεύεις όσο και οι άλλοι."
        ]
      },
      es: {
        name: "Sesgo de optimismo", shareTitle: "El sesgo de optimismo en 30 segundos",
        ecline: "La mala suerte no hace excepciones contigo. Planifica como si te pudiera pasar igual que a cualquiera.",
        nob: "sin copia", nobW: 78, notme: "A mí no.", bubW: 96,
        hits: { broken: "roto", lost: "perdido", stolen: "robado" }, you: "tú", people: ["gente", "como tú"],
        avg: "promedio", imp: "imposible", backup: "Copia de seguridad",
        caps: [
          "Tu portátil guarda años de fotos. <b>Sin copia de seguridad.</b>",
          "Los portátiles se pierden, se roban o se rompen <b>constantemente</b>.",
          "Pero eso les pasa <b>a otros</b>, piensas.",
          "Pregunta a un grupo y <b>la mayoría</b> cree que su riesgo está por debajo del promedio.",
          "<b>No pueden estar todos</b> por debajo del promedio.",
          "Hasta que un día te pasa <b>a ti</b>. Las fotos se han perdido.",
          "<b>La solución:</b> asume que te puede pasar igual que a cualquiera.",
          "Y toma la precaución barata. <b>Haz una copia hoy.</b>"
        ],
        say: [
          "Tu portátil guarda años de fotos. Sin copia de seguridad.",
          "Los portátiles se pierden, se roban o se rompen constantemente.",
          "Pero eso les pasa a otros, piensas.",
          "Pregunta a un grupo y la mayoría cree que su riesgo está por debajo del promedio.",
          "No pueden estar todos por debajo del promedio.",
          "Hasta que un día te pasa a ti. Las fotos se han perdido.",
          "La solución: asume que te puede pasar igual que a cualquiera.",
          "Y toma la precaución barata. Haz una copia hoy.",
          "El sesgo de optimismo. La mala suerte no hace excepciones contigo. Planifica como si te pudiera pasar igual que a cualquiera."
        ]
      },
      fr: {
        name: "Biais d’optimisme", shareTitle: "Le biais d’optimisme en 30 secondes",
        ecline: "La malchance ne vous épargne pas. Prévoyez comme si ça pouvait vous arriver autant qu’à n’importe qui.",
        nob: "sans sauvegarde", nobW: 112, notme: "Pas moi.", bubW: 91,
        hits: { broken: "cassé", lost: "perdu", stolen: "volé" }, you: "vous", people: ["des gens", "comme vous"],
        avg: "moyenne", imp: "impossible", backup: "Sauvegarde",
        caps: [
          "Votre ordinateur portable contient des années de photos. <b>Aucune sauvegarde.</b>",
          "Des ordinateurs sont perdus, volés ou cassés <b>tout le temps</b>.",
          "Mais ça arrive <b>aux autres</b>, pensez-vous.",
          "Interrogez un groupe : <b>la plupart</b> jugent leur risque inférieur à la moyenne.",
          "Ils ne peuvent pas <b>tous</b> être sous la moyenne.",
          "Puis un jour, ça <b>vous</b> arrive. Les photos ont disparu.",
          "<b>La solution :</b> supposez que ça peut vous arriver comme à n’importe qui.",
          "Puis prenez la précaution qui coûte peu. <b>Sauvegardez dès aujourd’hui.</b>"
        ],
        say: [
          "Votre ordinateur portable contient des années de photos. Aucune sauvegarde.",
          "Des ordinateurs sont perdus, volés ou cassés tout le temps.",
          "Mais ça arrive aux autres, pensez-vous.",
          "Interrogez un groupe : la plupart des gens jugent leur risque inférieur à la moyenne.",
          "Ils ne peuvent pas tous être sous la moyenne.",
          "Puis un jour, ça vous arrive. Les photos ont disparu.",
          "La solution : supposez que ça peut vous arriver comme à n’importe qui.",
          "Puis prenez la précaution qui coûte peu. Sauvegardez dès aujourd’hui.",
          "Le biais d’optimisme. La malchance ne vous épargne pas. Prévoyez comme si ça pouvait vous arriver autant qu’à n’importe qui."
        ]
      },
      de: {
        name: "Optimismus-Verzerrung", shareTitle: "Die Optimismus-Verzerrung in 30 Sekunden",
        ecline: "Pech macht um dich keinen Bogen. Plane so, als könnte es dich genauso treffen wie jeden anderen.",
        nob: "kein Backup", nobW: 88, notme: "Mir doch nicht.", bubW: 130,
        hits: { broken: "kaputt", lost: "verloren", stolen: "gestohlen" }, you: "du", people: ["Leute", "wie du"],
        avg: "Schnitt", imp: "unmöglich", backup: "Backup",
        caps: [
          "Auf deinem Laptop sind Fotos aus vielen Jahren. <b>Kein Backup.</b>",
          "Laptops gehen <b>ständig</b> verloren, werden gestohlen oder gehen kaputt.",
          "Aber das passiert <b>anderen</b>, denkst du.",
          "Frag eine Gruppe: <b>Die meisten</b> sehen ihr eigenes Risiko unter dem Durchschnitt.",
          "Es <b>können nicht alle</b> unter dem Durchschnitt liegen.",
          "Dann trifft es eines Tages <b>dich</b>. Die Fotos sind weg.",
          "<b>Die Lösung:</b> Geh davon aus, dass es dich genauso treffen kann wie jeden anderen.",
          "Dann sorg günstig vor. <b>Mach noch heute ein Backup.</b>"
        ],
        say: [
          "Auf deinem Laptop sind Fotos aus vielen Jahren. Kein Backup.",
          "Laptops gehen ständig verloren, werden gestohlen oder gehen kaputt.",
          "Aber das passiert anderen, denkst du.",
          "Frag eine Gruppe, und die meisten sehen ihr eigenes Risiko unter dem Durchschnitt.",
          "Es können nicht alle unter dem Durchschnitt liegen.",
          "Dann trifft es eines Tages dich. Die Fotos sind weg.",
          "Die Lösung: Geh davon aus, dass es dich genauso treffen kann wie jeden anderen.",
          "Dann sorg günstig vor. Mach noch heute ein Backup.",
          "Die Optimismus-Verzerrung. Pech macht um dich keinen Bogen. Plane so, als könnte es dich genauso treffen wie jeden anderen."
        ]
      },
      it: {
        name: "Bias di ottimismo", shareTitle: "Il bias di ottimismo in 30 secondi",
        ecline: "La sfortuna non fa eccezioni per te. Pianifica come se potesse capitare a te come a chiunque.",
        nob: "senza backup", nobW: 103, notme: "A me no.", bubW: 93,
        hits: { broken: "rotto", lost: "perso", stolen: "rubato" }, you: "tu", people: ["persone", "come te"],
        avg: "media", imp: "impossibile", backup: "Backup",
        caps: [
          "Il tuo portatile custodisce anni di foto. <b>Nessun backup.</b>",
          "I portatili si perdono, vengono rubati o si rompono <b>di continuo</b>.",
          "Ma succede <b>agli altri</b>, pensi.",
          "Chiedi a un gruppo: <b>quasi tutti</b> stimano il proprio rischio sotto la media.",
          "<b>Non possono essere tutti</b> sotto la media.",
          "Poi un giorno succede <b>a te</b>. Le foto sono perse.",
          "<b>La soluzione:</b> dai per scontato che possa capitare a te come a chiunque.",
          "Poi prendi la precauzione che costa poco. <b>Fai il backup oggi.</b>"
        ],
        say: [
          "Il tuo portatile custodisce anni di foto. Nessun backup.",
          "I portatili si perdono, vengono rubati o si rompono di continuo.",
          "Ma succede agli altri, pensi.",
          "Chiedi a un gruppo, e quasi tutti stimano il proprio rischio sotto la media.",
          "Non possono essere tutti sotto la media.",
          "Poi un giorno succede a te. Le foto sono perse.",
          "La soluzione: dai per scontato che possa capitare a te come a chiunque.",
          "Poi prendi la precauzione che costa poco. Fai il backup oggi.",
          "Il bias di ottimismo. La sfortuna non fa eccezioni per te. Pianifica come se potesse capitare a te come a chiunque."
        ]
      }
    },
    svg(T) {
      // the row: people like you, each with a laptop like yours
      let row = "", tags = "";
      for (let i = 0; i < N; i++) {
        if (i === YOU) continue;
        const h = HITS[i];
        row += `<g data-k="L${i}"><g data-k="Ln${i}">${lap("")}</g>` +
          (h === "broken" ? `<path class="ob-crack" data-k="Lx${i}" d="${CRACK}"/>` : "") +
          (h && h !== "broken" ? `<g data-k="Lx${i}">${lap("d")}</g>` : "") + `</g>`;
        if (h) tags += `<text class="ob-hit" data-k="t${i}" x="${cx(i)}" y="${TAG}">${T.hits[h]}</text>`;
      }
      // the crowd's answers: a marker each, and where they sat before they had to spread out
      let marks = "", ghosts = "";
      for (let i = 0; i < N; i++) {
        if (i === YOU) continue;
        const up = UP.includes(i);
        marks += `<g data-k="m${i}"><circle class="ob-mk" r="4.5"/>${up ? `<circle class="ob-mk b" data-k="mb${i}" r="4.5"/>` : ""}</g>`;
        if (up) ghosts += `<circle class="ob-gh" cx="${cx(i)}" cy="${CLAIM[i]}" r="4.5"/>`;
      }
      const flyers = [0, 1, 2, 3].map(j => `<g class="ob-ph" data-k="f${j}">${PHOTO}</g>`).join("");
      const bx = 226, by = 16, bh = 28;
      return `
        <g data-k="row">${row}</g>
        <g data-k="slot" transform="translate(${SX} ${RB}) scale(${SR})">${lap("dq")}</g>
        <g data-k="tags">${tags}</g>
        <text class="ob-you" data-k="youL" x="${SX}" y="${TAG}">${T.you}</text>
        <g data-k="plu"><text class="ob-note" x="322" y="${RB - 15}">${T.people[0]}</text><text class="ob-note" x="322" y="${RB - 2}">${T.people[1]}</text></g>
        <g data-k="plot">
          <line class="ob-avg" x1="12" x2="312" y1="${LINE}" y2="${LINE}"/>
          <text class="ob-avgl" x="320" y="${LINE + 3.5}">${T.avg}</text>
          <g data-k="ghosts">${ghosts}</g>
          ${marks}
          <g class="ob-br" data-k="br"><path d="M303 168 H308 V196 H303"/><text x="316" y="186">${T.imp}</text></g>
          <g data-k="mY"><circle class="ob-ring" r="8.5"/><circle class="ob-mk q" r="4.5"/></g>
        </g>
        <g data-k="drive">
          <text class="ob-drl" x="${DX}" y="${DY - 32}">${T.backup}</text>
          <rect class="ob-drv" x="${DX - 44}" y="${DY - 22}" width="88" height="44" rx="9"/>
          <g class="ob-ph" data-k="stored" transform="translate(${DX - 22} ${DY})">${PHOTO}</g>
          <rect class="ob-trk" x="${DX - 4}" y="${DY - 3.5}" width="36" height="7" rx="3.5"/>
          <rect class="ob-barf" data-k="barf" x="${DX - 4}" y="${DY - 3.5}" width="0" height="7" rx="3.5"/>
          <circle class="ob-led" data-k="led" cx="${DX + 33}" cy="${DY - 12}" r="2.4"/>
        </g>
        ${flyers}
        <g class="ob-chk" data-k="chk"><circle r="10"/><path d="M-4.5 0.5 L-1.2 3.8 L4.8 -3"/></g>
        <g data-k="you">
          <circle class="ob-hd" cx="${PX}" cy="${PY}" r="10"/>
          <circle class="ob-eye" cx="${PX - 3.6}" cy="${PY - 1.5}" r="1.4"/><circle class="ob-eye" cx="${PX + 3.6}" cy="${PY - 1.5}" r="1.4"/>
          <path class="ob-st" data-k="mouth" d=""/>
          <path class="ob-st" d="M${PX - 19} ${HB} V${HB - 6} a19 17 0 0 1 38 0 V${HB}"/>
        </g>
        <g data-k="bub">
          <circle class="ob-bub" cx="${PX + 13}" cy="${PY - 13}" r="2.2"/><circle class="ob-bub" cx="${PX + 19}" cy="${PY - 20}" r="3"/>
          <rect class="ob-bub" x="${bx}" y="${by}" width="${T.bubW}" height="${bh}" rx="14"/>
          <text class="ob-bt" x="${bx + T.bubW / 2}" y="${by + 18.5}">${T.notme}</text>
        </g>
        <g class="ob-tag" data-k="nob"><rect x="${HX - 56}" y="16" width="${T.nobW}" height="18" rx="9"/>
          <path d="M${HX - 49} 21.5 l7 7 M${HX - 42} 21.5 l-7 7"/><text x="${HX - 36}" y="28.8">${T.nob}</text></g>
        <g data-k="me">
          <g data-k="meInk">${lap("")}</g><g data-k="meQ">${lap("q")}</g>
          <g class="ob-ph">${PH.map((p, i) => `<g data-k="p${i}">${thumb(p)}</g>`).join("")}</g>
          <rect class="ob-dead" data-k="dead" x="-58" y="-82" width="116" height="72" rx="4.5"/>
          <g data-k="gph">${PH.map(([x, y]) => `<rect class="ob-gp" x="${x}" y="${y}" width="32" height="24" rx="3"/>`).join("")}</g>
          <path class="ob-crack" data-k="crack" d="${CRACK}"/>
        </g>`;
    },
    S0: { lap: 0, you: 0, ph: 0, nob: 0, pulse: 0, row: 0, slot: 0, youL: 0, pos: 0, h0: 0, h1: 0, h2: 0, hit: 1,
      bub: 0, mood: 0, plot: 0, ask: 0, br: 0, ghost: 0, slide: 0, dim: 0, dead: 0, shake: 0, mY: 0, pdim: 0,
      drive: 0, fly: 0, copy: 0, chk: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = f3(cl(v)); };
      const tr = (key, x, y, s) => k(key).setAttribute("transform", `translate(${f2(x)} ${f2(y)})${s == null ? "" : ` scale(${f3(s)})`}`);
      const dimRow = 1 - .6 * S.dim;
      // you, and how you feel about it
      op("you", S.you);
      k("mouth").setAttribute("d", `M${PX - 4} ${PY + 4.5} Q${PX} ${f2(PY + 4.5 + 3.4 * S.mood)} ${PX + 4} ${PY + 4.5}`);
      const bs = .8 + .2 * S.bub;
      k("bub").setAttribute("transform", `translate(${PX + 13} ${PY - 13}) scale(${f3(bs)}) translate(${-(PX + 13)} ${-(PY - 13)})`);
      op("bub", S.bub);
      // your laptop: on its own, in the row, or back out of it
      const e = S.pos, s = (SH + (SR - SH) * e) * (.86 + .14 * S.lap);
      const jig = S.shake > 0 && S.shake < 1 ? 4 * Math.sin(S.shake * Math.PI * 7) * (1 - S.shake) : 0;
      tr("me", HX + (SX - HX) * e + jig, HB + (RB - HB) * e - 26 * Math.sin(Math.PI * e), s);
      op("me", S.lap);
      const small = cl(e * 1.6 - .3), big = cl((s - .38) / .3);
      op("meInk", 1 - small); op("meQ", small);
      for (let i = 0; i < 6; i++) op("p" + i, cl(S.ph - i) * big * (1 - S.dead));
      op("dead", .85 * S.dead * big); op("gph", S.dead * big); op("crack", S.dead);
      const ts = 1 + .14 * S.pulse;
      k("nob").setAttribute("transform", `translate(${HX - 56} 25) scale(${f3(ts)}) translate(${-(HX - 56)} -25)`);
      op("nob", S.nob * (1 - cl(e * 3)));
      // the row of laptops like yours, and what happens to some of them
      for (let i = 0; i < N; i++) {
        if (i === YOU) continue;
        const p = cl((S.row - i * .05) / .55);
        tr("L" + i, cx(i), RB + 8 * (1 - p), SR);
        op("L" + i, p * dimRow);
        const h = HITS[i];
        if (!h) continue;
        const v = S[h === "broken" ? "h0" : h === "lost" ? "h1" : "h2"] * S.hit;
        op("Lx" + i, v); op("t" + i, v);
        if (h !== "broken") op("Ln" + i, 1 - v);
      }
      op("tags", dimRow);
      op("slot", S.slot * dimRow * (1 - cl((e - .75) * 4)));
      op("youL", S.youL * dimRow); op("plu", cl(S.row * 1.5 - .5) * dimRow);
      // the crowd rates its own risk: every marker lands below the line, then some must move above it
      op("plot", S.plot * dimRow * (1 - .75 * S.pdim));
      for (let i = 0; i < N; i++) {
        if (i === YOU) continue;
        const p = cl((S.ask - i * .065) / .4), y0 = RB - 20;
        let y = y0 + (CLAIM[i] - y0) * out3(p);
        if (UP.includes(i)) { y += (REAL[i] - CLAIM[i]) * S.slide; op("mb" + i, S.slide); }
        tr("m" + i, cx(i), y); op("m" + i, cl(p * 3));
      }
      op("ghosts", S.ghost); op("br", S.br);
      tr("mY", SX, LINE, Math.max(0, S.mY)); op("mY", cl(S.mY * 2));
      // the fix: a backup drive, and the photos copying across
      tr("drive", 0, 8 * (1 - S.drive)); op("drive", S.drive);
      k("barf").setAttribute("width", f2(36 * cl(S.copy)));
      op("stored", cl(S.copy * 3 - .4));
      op("led", .35 + .65 * cl(S.copy * 3));
      for (let j = 0; j < 4; j++) {
        const p = cl((S.fly - j * .17) / .49), q = out3(p) * .6 + p * .4, u = 1 - q;
        const x = u * u * FROM[0] + 2 * u * q * VIA[0] + q * q * TO[0], y = u * u * FROM[1] + 2 * u * q * VIA[1] + q * q * TO[1];
        tr("f" + j, x, y, .5 + .5 * q + .4 * Math.sin(Math.PI * q));
        op("f" + j, p > 0 && p < 1 ? cl(p * 8) * cl((1 - p) * 6) : 0);
      }
      tr("chk", DX + 58, DY, Math.max(0, S.chk)); op("chk", cl(S.chk * 2));
    },
    beats: [
      { steps: [{ to: { lap: 1 }, ms: 550, ease: "back", sfx: "pluck" }, { to: { you: 1 }, ms: 350 },
        { to: { ph: 6 }, ms: 1100, ease: "lin" }, { wait: 250 }, { to: { nob: 1 }, ms: 400, ease: "back" }] },
      { steps: [{ to: { row: 1, slot: 1 }, ms: 900 }, { to: { pos: 1 }, ms: 1000, ease: "inOut" }, { to: { youL: 1 }, ms: 300 },
        { wait: 250 }, { to: { h0: 1 }, ms: 350, sfx: "tick" }, { wait: 300 }, { to: { h1: 1 }, ms: 350 }, { wait: 300 }, { to: { h2: 1 }, ms: 350 }] },
      { steps: [{ to: { pos: 0 }, ms: 1000, ease: "inOut" }, { to: { bub: 1, mood: 1 }, ms: 400, ease: "back", sfx: "pop" }] },
      { steps: [{ to: { hit: 0 }, ms: 400 }, { to: { plot: 1 }, ms: 500 }, { to: { ask: 1 }, ms: 1500, ease: "lin", sfx: "tick" }] },
      { steps: [{ to: { br: 1 }, ms: 450 }, { wait: 500 }, { to: { ghost: 1 } }, { to: { slide: 1 }, ms: 900, ease: "back", sfx: "spring" }] },
      { steps: [{ to: { bub: 0, dim: 1, br: 0, ghost: 0 }, ms: 450 }, { to: { dead: 1, mood: -1 }, ms: 300, sfx: "thud" },
        { to: { shake: 1 }, ms: 600, ease: "lin" }, { to: { pulse: 1 }, ms: 250 }, { to: { pulse: 0 }, ms: 350 }] },
      { steps: [{ to: { dead: 0, mood: 0 }, ms: 450 }, { to: { pos: 1 }, ms: 1100, ease: "inOut", sfx: "whoosh" },
        { to: { dim: 0 }, ms: 400 }, { to: { mY: 1 }, ms: 500, ease: "back" }] },
      { steps: [{ to: { pdim: 1 }, ms: 400 }, { to: { drive: 1 }, ms: 450, ease: "back" }, { to: { fly: 1, copy: 1 }, ms: 1700, ease: "lin" },
        { to: { chk: 1, mood: 1 }, ms: 450, ease: "back", sfx: "chime" }], hold: 4200 }
    ]
  };
})();
