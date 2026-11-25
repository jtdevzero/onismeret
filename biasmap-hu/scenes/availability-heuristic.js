/* Availability heuristic: a week of plane-crash headlines fills your memory, everyday car crashes
   barely register, so flying feels riskier than driving, though per mile it's the other way round.
   Scene for anim.js. */
(function () {
  const KEY = "availability-heuristic", P = `.bp[data-scene="${KEY}"]`;
  const MCX = 105;                                   // centre line of the memory bubble
  const CH = 30, slotY = i => 44 + i * 36;           // headline cards: height, top of each slot
  const NW = 58, NH = 16;                            // small car-crash notes
  const NSLOT = [MCX - NW / 2, 156];                 // where the one remembered note lands
  const NOTES = [[222, 58], [314, 66], [226, 96], [310, 104], [220, 134], [316, 142], [228, 172], [306, 180]];
  const LAND = 2;                                    // the note that makes it into memory
  const IX = 225, BX = 246, BL = 134, BH = 16;       // chart: icon centre, bar start, max bar length, bar height
  const TA = 48, TB = 144;                           // chart titles: feels, actual
  const ROW = { fp: 70, fc: 98, ap: 166, ac: 194 };  // bar centre lines: feels plane/car, actual plane/car
  const TX = 66, TY = 202, TW = 132, TH = 44;        // question tag next to your head
  const clamp = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const outC = p => 1 - Math.pow(1 - p, 3);

  // side-view icons drawn around (0, 0), about 44 px wide
  const plane = `<path d="M-20 -1 C-20 -5 -17 -6 -13 -6 H12 C17 -6 21 -3 23 0 C22 2 19 3 15 3 H-15 C-18 3 -20 2 -20 -1 Z"/>
    <path d="M-16 -6 L-20 -15 H-15 L-9 -6"/><path d="M-4 0 L-10 10 H-5 L6 0"/><path class="w" d="M-9 -2 H9"/>`;
  const car = `<path d="M-21 4 V-1 Q-21 -5 -17 -5 H-11 L-5 -12 H7 L13 -5 H18 Q22 -5 22 -1 V4 Z"/><path class="w" d="M1 -11 V-5"/>
    <circle cx="-11" cy="5" r="4.5"/><circle cx="12" cy="5" r="4.5"/>`;

  window.BiasAnim.SCENES[KEY] = {
    q: "tmi", viewBox: "0 0 400 272",
    css: `
      ${P} .av-ln{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .av-bub{fill:none;stroke:var(--muted);stroke-width:1.8}
      ${P} .av-dot{fill:none;stroke:var(--muted);stroke-width:1.6}
      ${P} .av-qm{font:700 44px var(--display);fill:var(--faint);text-anchor:middle}
      ${P} .av-lb{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .av-lb.c{text-anchor:middle}
      ${P} .av-ic path,${P} .av-ic circle{fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
      ${P} .av-ic .w{fill:none;stroke-width:1.4;stroke-dasharray:1.5 3}
      ${P} .av-card .bg{fill:var(--surface);stroke:var(--ink);stroke-width:1.6}
      ${P} .av-card .lit{fill:var(--q);fill-opacity:.16;stroke:var(--q);stroke-width:2.2}
      ${P} .av-card .hl{font:700 11.5px var(--display);fill:var(--ink)}
      ${P} .av-card .tx{stroke:var(--faint);stroke-width:1.6;stroke-linecap:round}
      ${P} .av-card .gl path{fill:var(--bad);stroke:none}
      ${P} .av-note rect{fill:var(--surface);stroke:var(--faint);stroke-width:1.2}
      ${P} .av-note text{font:500 9px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .av-beam{fill:var(--q);fill-opacity:.09}
      ${P} .av-spot{fill:var(--q);fill-opacity:.1;stroke:var(--q);stroke-width:1.6;stroke-opacity:.7}
      ${P} .av-tag rect,${P} .av-tag path{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}
      ${P} .av-tag text{font:600 11px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .av-tag.ok rect,${P} .av-tag.ok path{stroke:var(--good)}
      ${P} .av-tag.ok text{fill:var(--good)}
      ${P} .av-ttl{font:600 11px var(--display);fill:var(--ink)}
      ${P} .av-base{stroke:var(--rule);stroke-width:2;stroke-linecap:round}
      ${P} .av-bar{stroke-width:1.8;stroke-linejoin:round}
      ${P} .av-bar.f{fill:var(--q);fill-opacity:.45;stroke:var(--q)}
      ${P} .av-bar.g{fill:var(--good);fill-opacity:.45;stroke:var(--good)}
      ${P} .av-bar.a{fill:var(--ink);fill-opacity:.4;stroke:var(--ink)}
      ${P} .av-hi{fill:none;stroke:var(--good);stroke-width:1.8;stroke-dasharray:4 3}
      ${P} .av-bdg circle{fill:var(--surface);stroke-width:2}
      ${P} .av-bdg path{fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
      ${P} .av-bdg .x circle,${P} .av-bdg .x path{stroke:var(--bad)}
      ${P} .av-bdg .v circle,${P} .av-bdg .v path{stroke:var(--good)}
    `,
    text: {
      hu: {
        name: "Elérhetőségi heurisztika", shareTitle: "Az elérhetőségi heurisztika, 30 másodpercben",
        ecline: "Könnyű felidézni nem jelent valószínűt. Nézd meg, valójában milyen gyakran történik.",
        memory: "Az emlékezeted", or: "vagy", head: "Repülőgép-baleset", cw: 112, note: "autóbaleset", daily: "naponta",
        q1: ["Mi jut eszedbe elsőként?"], q2: ["Valójában milyen gyakran", "történik?"],
        feels: "Mennyire veszélyesnek tűnik", actual: "Valós kockázat megtett mérföldenként",
        caps: [
          "Repülővel vagy autóval mész a tengerpartra: melyik a <b>veszélyesebb</b>?",
          "Ezen a héten a repülőgép-baleset <b>mindenhol a hírekben van</b>.",
          "Az autóbaleset <b>naponta</b> történik, mégis ritkán kerül a címlapra.",
          "Az agyad kérdezi: melyik példa <b>jut eszedbe leggyorsabban</b>?",
          "Így a repülés hirtelen <b>veszélyesebbnek érződik</b>.",
          "Pedig megtett mérföldenként a <b>vezetés sokkal kockázatosabb</b>.",
          "<b>A megoldás:</b> azt kérdezd, milyen gyakran történik, ne azt, mennyire emlékezetes.",
          "Nézd meg a <b>valós számokat</b>, aztán döntsd el, hogyan utazol."
        ],
        say: [
          "Repülővel vagy autóval mész a tengerpartra. Melyik a veszélyesebb?",
          "Ezen a héten a repülőgép-baleset mindenhol a hírekben van.",
          "Az autóbaleset naponta történik, de ritkán kerül a hírekbe.",
          "Az agyad kérdezi: melyik példa jut eszedbe leggyorsabban?",
          "Így a repülés hirtelen veszélyesebbnek érződik.",
          "Pedig megtett mérföldenként a vezetés sokkal kockázatosabb.",
          "A megoldás: azt kérdezd, milyen gyakran történik, ne azt, mennyire emlékezetes.",
          "Nézd meg a valós számokat, aztán döntsd el, hogyan utazol.",
          "Az elérhetőségi heurisztika. Könnyű felidézni nem jelent valószínűt. Nézd meg, valójában milyen gyakran történik."
        ]
      },
      en: {
        name: "Availability heuristic", shareTitle: "Availability heuristic, explained in 30 seconds",
        ecline: "Easy to recall isn't the same as likely. Check how often it really happens.",
        memory: "Your memory", or: "or", head: "Plane crash", cw: 112, note: "car crash", daily: "every day",
        q1: ["What comes to mind?"], q2: ["How often does it", "really happen?"],
        feels: "How risky it feels", actual: "Actual risk per mile",
        caps: [
          "Flying or driving to the coast: which is <b>riskier</b>?",
          "This week, a plane crash is <b>all over the news</b>.",
          "Car crashes happen <b>every day</b> but rarely make headlines.",
          "Your mind asks: which examples <b>come to mind fastest</b>?",
          "So flying suddenly <b>feels</b> more dangerous.",
          "But per mile travelled, <b>driving is far riskier</b>.",
          "<b>The fix:</b> ask how often it happens, not how memorable it is.",
          "Check the <b>real numbers</b>, then decide how to travel."
        ],
        say: [
          "Flying or driving to the coast. Which is riskier?",
          "This week, a plane crash is all over the news.",
          "Car crashes happen every day, but they rarely make headlines.",
          "Your mind asks: which examples come to mind fastest?",
          "So flying suddenly feels more dangerous.",
          "But per mile travelled, driving is far riskier.",
          "The fix: ask how often it happens, not how memorable it is.",
          "Check the real numbers, then decide how to travel.",
          "The availability heuristic. Easy to recall isn't the same as likely. Check how often it really happens."
        ]
      },
      el: {
        name: "Ευρετική της διαθεσιμότητας", shareTitle: "Η ευρετική της διαθεσιμότητας σε 30 δευτερόλεπτα",
        ecline: "Ό,τι θυμάσαι εύκολα δεν είναι απαραίτητα και πιθανό. Δες πόσο συχνά συμβαίνει στ’\u00a0αλήθεια.",
        memory: "Η μνήμη σου", or: "ή", head: "Αεροπορική τραγωδία", cw: 158, note: "τροχαίο", daily: "κάθε μέρα",
        q1: ["Τι θυμάμαι πρώτα;"], q2: ["Πόσο συχνά συμβαίνει", "στην πραγματικότητα;"],
        feels: "Πόσο επικίνδυνο μοιάζει", actual: "Πραγματικός κίνδυνος ανά χλμ.",
        caps: [
          "Θα πας διακοπές με αεροπλάνο ή με αυτοκίνητο; Ποιο είναι πιο <b>επικίνδυνο</b>;",
          "Αυτή την εβδομάδα, μια αεροπορική τραγωδία <b>μονοπωλεί τις ειδήσεις</b>.",
          "Τροχαία συμβαίνουν <b>κάθε μέρα</b>, αλλά σπάνια γίνονται πρώτο θέμα.",
          "Το μυαλό σου αναρωτιέται: ποια παραδείγματα <b>θυμάμαι πιο γρήγορα</b>;",
          "Κι έτσι, το αεροπλάνο ξαφνικά <b>σου φαίνεται</b> πιο επικίνδυνο.",
          "Όμως, ανά χιλιόμετρο, <b>το αυτοκίνητο είναι πολύ πιο επικίνδυνο</b>.",
          "<b>Η λύση:</b> αναρωτήσου πόσο συχνά συμβαίνει, όχι πόσο εύκολα το θυμάσαι.",
          "Δες τα <b>πραγματικά νούμερα</b> και μετά αποφάσισε πώς θα ταξιδέψεις."
        ],
        say: [
          "Θα πας διακοπές με αεροπλάνο ή με αυτοκίνητο; Ποιο είναι πιο επικίνδυνο;",
          "Αυτή την εβδομάδα, μια αεροπορική τραγωδία μονοπωλεί τις ειδήσεις.",
          "Τροχαία συμβαίνουν κάθε μέρα, αλλά σπάνια γίνονται πρώτο θέμα.",
          "Το μυαλό σου αναρωτιέται: ποια παραδείγματα θυμάμαι πιο γρήγορα;",
          "Κι έτσι, το αεροπλάνο ξαφνικά σου φαίνεται πιο επικίνδυνο.",
          "Όμως, ανά χιλιόμετρο, το αυτοκίνητο είναι πολύ πιο επικίνδυνο.",
          "Η λύση: αναρωτήσου πόσο συχνά συμβαίνει, όχι πόσο εύκολα το θυμάσαι.",
          "Δες τα πραγματικά νούμερα και μετά αποφάσισε πώς θα ταξιδέψεις.",
          "Ευρετική της διαθεσιμότητας. Ό,τι θυμάσαι εύκολα δεν είναι απαραίτητα και πιθανό. Δες πόσο συχνά συμβαίνει στ’ αλήθεια."
        ]
      },
      es: {
        name: "Heurística de disponibilidad", shareTitle: "La heurística de disponibilidad en 30 segundos",
        ecline: "Fácil de recordar no significa probable. Comprueba cuántas veces pasa de verdad.",
        memory: "Tu memoria", or: "o", head: "Cae un avión", cw: 122, note: "choque", daily: "cada día",
        q1: ["¿Qué me viene", "a la mente?"], q2: ["¿Cuántas veces", "pasa de verdad?"],
        feels: "Riesgo que sientes", actual: "Riesgo real por km",
        caps: [
          "¿Ir a la costa en avión o por carretera? ¿Qué es más <b>arriesgado</b>?",
          "Esta semana, un accidente aéreo <b>copa todas las noticias</b>.",
          "Los accidentes de tráfico ocurren <b>cada día</b>, pero casi nunca son titular.",
          "Tu mente se pregunta: ¿qué ejemplos <b>me vienen antes a la mente</b>?",
          "Así que volar, de pronto, <b>parece</b> más peligroso.",
          "Pero, por kilómetro recorrido, <b>la carretera es mucho más arriesgada</b>.",
          "<b>La solución:</b> pregúntate cuántas veces ocurre, no cuánto se recuerda.",
          "Mira los <b>números reales</b> y luego decide cómo viajar."
        ],
        say: [
          "¿Ir a la costa en avión o por carretera? ¿Qué es más arriesgado?",
          "Esta semana, un accidente aéreo copa todas las noticias.",
          "Los accidentes de tráfico ocurren cada día, pero casi nunca son titular.",
          "Tu mente se pregunta: ¿qué ejemplos me vienen antes a la mente?",
          "Así que volar, de pronto, parece más peligroso.",
          "Pero, por kilómetro recorrido, la carretera es mucho más arriesgada.",
          "La solución: pregúntate cuántas veces ocurre, no cuánto se recuerda.",
          "Mira los números reales, y luego decide cómo viajar.",
          "Heurística de disponibilidad. Fácil de recordar no significa probable. Comprueba cuántas veces pasa de verdad."
        ]
      },
      fr: {
        name: "Heuristique de disponibilité", shareTitle: "L’heuristique de disponibilité en 30 secondes",
        ecline: "Ce qui revient vite en tête n’est pas forcément probable. Vérifiez la fréquence réelle.",
        memory: "Votre mémoire", or: "ou", head: "Crash aérien", cw: 122, note: "accident", daily: "chaque jour",
        q1: ["Qu’est-ce qui me", "vient à l’esprit ?"], q2: ["Combien de fois", "ça arrive vraiment ?"],
        feels: "Risque ressenti", actual: "Risque réel par km",
        caps: [
          "L’avion ou la voiture pour aller à la mer : lequel est le plus <b>risqué</b> ?",
          "Cette semaine, un crash aérien <b>fait la une partout</b>.",
          "Les accidents de voiture arrivent <b>chaque jour</b>, mais font rarement la une.",
          "Votre esprit se demande : quels exemples <b>me viennent le plus vite</b> ?",
          "Du coup, l’avion <b>semble</b> soudain plus dangereux.",
          "Mais par kilomètre parcouru, <b>la voiture est bien plus risquée</b>.",
          "<b>La solution :</b> demandez-vous si ça arrive souvent, pas si ça marque.",
          "Regardez les <b>vrais chiffres</b>, puis choisissez comment voyager."
        ],
        say: [
          "L’avion ou la voiture pour aller à la mer. Lequel est le plus risqué ?",
          "Cette semaine, un crash aérien fait la une partout.",
          "Les accidents de voiture arrivent chaque jour, mais ils font rarement la une.",
          "Votre esprit se demande : quels exemples me viennent le plus vite ?",
          "Du coup, l’avion semble soudain plus dangereux.",
          "Mais par kilomètre parcouru, la voiture est bien plus risquée.",
          "La solution : demandez-vous si ça arrive souvent, pas si ça marque les esprits.",
          "Regardez les vrais chiffres, puis choisissez comment voyager.",
          "L’heuristique de disponibilité. Ce qui revient vite en tête n’est pas forcément probable. Vérifiez la fréquence réelle."
        ]
      },
      de: {
        name: "Verfügbarkeits-Heuristik", shareTitle: "Die Verfügbarkeits-Heuristik in 30 Sekunden",
        ecline: "Was dir leicht einfällt, ist nicht unbedingt wahrscheinlich. Prüf, wie oft es wirklich passiert.",
        memory: "Dein Gedächtnis", or: "oder", head: "Flugzeugabsturz", cw: 140, note: "Unfall", daily: "jeden Tag",
        q1: ["Was fällt mir ein?"], q2: ["Wie oft passiert", "das wirklich?"],
        feels: "Gefühltes Risiko", actual: "Echtes Risiko pro km",
        caps: [
          "Mit dem Flugzeug oder mit dem Auto ans Meer: Was ist <b>riskanter</b>?",
          "Diese Woche ist ein Flugzeugabsturz <b>in allen Nachrichten</b>.",
          "Autounfälle passieren <b>jeden Tag</b>, kommen aber selten in die Schlagzeilen.",
          "Dein Kopf fragt: Welche Beispiele <b>fallen mir am schnellsten ein</b>?",
          "Also <b>fühlt</b> sich Fliegen plötzlich gefährlicher an.",
          "Doch pro Kilometer ist <b>das Auto viel riskanter</b>.",
          "<b>Die Lösung:</b> Frag, wie oft es passiert, nicht wie sehr es hängen bleibt.",
          "Schau dir die <b>echten Zahlen</b> an und entscheide dann, wie du reist."
        ],
        say: [
          "Mit dem Flugzeug oder mit dem Auto ans Meer. Was ist riskanter?",
          "Diese Woche ist ein Flugzeugabsturz in allen Nachrichten.",
          "Autounfälle passieren jeden Tag, aber sie kommen selten in die Schlagzeilen.",
          "Dein Kopf fragt: Welche Beispiele fallen mir am schnellsten ein?",
          "Also fühlt sich Fliegen plötzlich gefährlicher an.",
          "Doch pro Kilometer ist das Auto viel riskanter.",
          "Die Lösung: Frag, wie oft es passiert, nicht wie sehr es hängen bleibt.",
          "Schau dir die echten Zahlen an, und entscheide dann, wie du reist.",
          "Die Verfügbarkeits-Heuristik. Was dir leicht einfällt, ist nicht unbedingt wahrscheinlich. Prüf, wie oft es wirklich passiert."
        ]
      },
      it: {
        name: "Euristica della disponibilità", shareTitle: "L’euristica della disponibilità in 30 secondi",
        ecline: "Ciò che ricordi facilmente non è per forza probabile. Controlla quanto spesso succede davvero.",
        memory: "La tua memoria", or: "o", head: "Aereo caduto", cw: 128, note: "incidente", daily: "ogni giorno",
        q1: ["Cosa mi viene", "in mente?"], q2: ["Quanto spesso", "succede davvero?"],
        feels: "Rischio percepito", actual: "Rischio reale per km",
        caps: [
          "Al mare in aereo o in auto: cos’è <b>più rischioso</b>?",
          "Questa settimana un aereo caduto è <b>su tutti i giornali</b>.",
          "Gli incidenti d’auto avvengono <b>ogni giorno</b>, ma raramente fanno notizia.",
          "La tua mente si chiede: quali esempi <b>vengono in mente prima</b>?",
          "Così all’improvviso l’aereo <b>sembra</b> più pericoloso.",
          "Ma a parità di chilometri, <b>l’auto è molto più rischiosa</b>.",
          "<b>La soluzione:</b> chiediti quanto spesso succede, non quanto ti resta impresso.",
          "Guarda i <b>numeri reali</b>, poi decidi come viaggiare."
        ],
        say: [
          "Al mare in aereo o in auto. Cos’è più rischioso?",
          "Questa settimana un aereo caduto è su tutti i giornali.",
          "Gli incidenti d’auto avvengono ogni giorno, ma raramente fanno notizia.",
          "La tua mente si chiede: quali esempi vengono in mente prima?",
          "Così all’improvviso l’aereo sembra più pericoloso.",
          "Ma a parità di chilometri percorsi, l’auto è molto più rischiosa.",
          "La soluzione: chiediti quanto spesso succede, non quanto ti resta impresso.",
          "Guarda i numeri reali, poi decidi come viaggiare.",
          "L’euristica della disponibilità. Ciò che ricordi facilmente non è per forza probabile. Controlla quanto spesso succede davvero."
        ]
      }
    },
    svg(T) {
      const card = i => `<g class="av-card" data-k="card${i}"><rect class="bg" x="0" y="0" width="${T.cw}" height="${CH}" rx="4"/>
        <rect class="lit" data-k="lit${i}" x="0" y="0" width="${T.cw}" height="${CH}" rx="4"/>
        <g class="gl" transform="translate(13 14) scale(.36)">${plane.replace(/<path class="w"[^>]*\/>/, "")}</g>
        <text class="hl" x="25" y="14">${T.head}</text>
        <line class="tx" x1="25" y1="21" x2="${T.cw - 10}" y2="21"/><line class="tx" x1="25" y1="25.5" x2="${T.cw - 34}" y2="25.5"/></g>`;
      const note = i => `<g class="av-note" data-k="n${i}"><rect x="0" y="0" width="${NW}" height="${NH}" rx="3"/><text x="${NW / 2}" y="11">${T.note}</text></g>`;
      const tag = (key, cls, lines) => {
        const y0 = TY + TH / 2 + 4 - (lines.length - 1) * 7;
        return `<g class="av-tag ${cls}" data-k="${key}"><rect x="${TX}" y="${TY}" width="${TW}" height="${TH}" rx="9"/>
          <path d="M${TX + 1} ${TY + 16} L${TX - 7} ${TY + 21} L${TX + 1} ${TY + 26}"/>
          ${lines.map((l, j) => `<text x="${TX + TW / 2}" y="${y0 + j * 14}">${l}</text>`).join("")}</g>`;
      };
      const bar = (key, cls, y) => `<rect class="av-bar ${cls}" data-k="${key}" x="${BX}" y="${y - BH / 2}" height="${BH}" rx="2"/>`;
      const icon = (shape, y) => `<g class="av-ic" transform="translate(${IX} ${y}) scale(.68)">${shape}</g>`;
      return `
        <g data-k="you">
          <rect class="av-bub" x="14" y="14" width="182" height="166" rx="16"/>
          <circle class="av-dot" cx="52" cy="193" r="4"/><circle class="av-dot" cx="44" cy="205" r="2.5"/>
          <circle class="av-ln" cx="36" cy="224" r="11"/><path class="av-ln" d="M12 262 C12 248 22 241 36 241 C50 241 60 248 60 262"/>
        </g>
        <text class="av-qm" data-k="qm" x="${MCX}" y="112">?</text>
        <text class="av-lb" data-k="mlab" x="28" y="33">${T.memory}</text>
        <g data-k="pc">
          <g class="av-ic" transform="translate(300 92) scale(1.7)">${plane}</g>
          <text class="av-lb c" x="300" y="141">${T.or}</text>
          <g class="av-ic" transform="translate(300 186) scale(1.7)">${car}</g>
        </g>
        <text class="av-lb c" data-k="daily" x="296" y="40">${T.daily}</text>
        ${NOTES.map((_, i) => note(i)).join("")}
        <path class="av-beam" data-k="cone" d=""/>
        ${[0, 1, 2].map(card).join("")}
        <rect class="av-spot" data-k="spot"/>
        ${tag("tag1", "", T.q1)}${tag("tag2", "ok", T.q2)}
        <g data-k="chartA">
          <text class="av-ttl" data-k="ttlA" x="210" y="${TA}">${T.feels}</text>
          ${icon(plane, ROW.fp)}${icon(car, ROW.fc)}
          <line class="av-base" x1="${BX}" y1="${ROW.fp - 16}" x2="${BX}" y2="${ROW.fc + 16}"/>
          ${bar("fpq", "f", ROW.fp)}${bar("fcq", "f", ROW.fc)}${bar("fpg", "g", ROW.fp)}${bar("fcg", "g", ROW.fc)}
        </g>
        <g data-k="chartB">
          <text class="av-ttl" x="210" y="${TB}">${T.actual}</text>
          ${icon(plane, ROW.ap)}${icon(car, ROW.ac)}
          <line class="av-base" x1="${BX}" y1="${ROW.ap - 16}" x2="${BX}" y2="${ROW.ac + 16}"/>
          ${bar("apb", "a", ROW.ap)}${bar("acb", "a", ROW.ac)}
        </g>
        <rect class="av-hi" data-k="hl" x="203" y="${TB - 16}" width="187" height="${ROW.ac + 18 - TB + 16}" rx="10"/>
        <g class="av-bdg" data-k="bdg"><g class="x" data-k="bx"><circle r="8"/><path d="M-3 -3 L3 3 M3 -3 L-3 3"/></g><g class="v" data-k="bv"><circle r="8"/><path d="M-3.6 0.4 L-1 3 L3.8 -2.6"/></g></g>`;
    },
    S0: { you: 0, qm: 0, pc: 0, mlab: 0, news: 0, notes: 0, drift: 0, nout: 0, tag: 0, beam: 0, sweep: 0, settle: 0,
      fa: 0, fp: 0, fc: 0, ab: 0, ap: 0, ac: 0, bdg: 0, mdim: 0, q2: 0, hl: 0, fix: 0, chk: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = clamp(v); };
      const cx0 = MCX - T.cw / 2, dim = 1 - .55 * S.mdim;
      op("you", S.you); op("qm", S.qm); op("mlab", S.mlab);
      k("pc").setAttribute("transform", `translate(${f1((1 - S.pc) * 16)} 0)`); op("pc", S.pc);
      // headline cards fly in from the right and stack in memory
      const tilt = [-1.5, 1.2, -.8];
      for (let i = 0; i < 3; i++) {
        const p = clamp((S.news - i * .25) / .5), e = outC(p);
        const x = cx0 + (1 - e) * 250, y = slotY(i) - (1 - e) * 8, r = tilt[i] + (1 - e) * 7;
        k("card" + i).setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(r)} ${T.cw / 2} ${CH / 2})`);
        op("card" + i, (p > 0 ? p * 4 : 0) * dim);
        const sw = (168 - (slotY(i) + CH / 2)) / 128;
        op("lit" + i, clamp((S.sweep - sw) / .08) * (1 - S.mdim));
      }
      // car-crash notes: many and faint; only one makes it into memory, the rest fade from view
      op("daily", S.notes * (1 - S.nout));
      NOTES.forEach(([nx, ny], i) => {
        const a = clamp((S.notes - i * .08) / .44), e = outC(S.drift);
        if (i === LAND) {
          k("n" + i).setAttribute("transform", `translate(${f1(nx + (NSLOT[0] - nx) * e)} ${f1(ny + (NSLOT[1] - ny) * e + 34 * Math.sin(Math.PI * e))})`);
          op("n" + i, (.65 * a + .25 * e) * dim);
        } else {
          k("n" + i).setAttribute("transform", `translate(${nx} ${ny})`);
          op("n" + i, a * (.65 - .2 * S.drift) * (1 - S.nout));
        }
      });
      // the search beam sweeps up through memory from your head, then rests on what it found
      // (a round spot while it searches, a frame around the plane cards once it has found them)
      const st = S.settle, hw = 22 + (T.cw / 2 + 7 - 22) * st, hh = 22 + (57 - 22) * st;
      let sy = 168 - 128 * S.sweep, sx = MCX + 46 * Math.sin(S.sweep * Math.PI * 3);
      sx += (MCX - sx) * st; sy += (95 - sy) * st;
      const sp = k("spot");
      sp.setAttribute("x", f1(sx - hw)); sp.setAttribute("y", f1(sy - hh)); sp.setAttribute("width", f1(2 * hw)); sp.setAttribute("height", f1(2 * hh));
      sp.setAttribute("rx", f1(22 - 12 * st));
      k("cone").setAttribute("d", `M40 213 L${f1(sx - hw)} ${f1(sy)} L${f1(sx + hw)} ${f1(sy)} Z`);
      op("cone", S.beam); op("spot", S.beam);
      // the question your mind asks, then the better one
      op("tag1", S.tag * (1 - S.q2 * 2)); op("tag2", S.q2 * 2 - 1);   // one out, then the other in
      // bars
      op("chartA", S.fa); op("chartB", S.ab);
      const w = (key, v) => k(key).setAttribute("width", f1(Math.max(0, v) * BL));
      w("fpq", S.fp); w("fcq", S.fc); w("fpg", S.fp); w("fcg", S.fc); w("apb", S.ap); w("acb", S.ac);
      op("fpq", 1 - S.fix); op("fcq", 1 - S.fix); op("fpg", S.fix); op("fcg", S.fix);
      op("hl", S.hl);
      // a badge after the "feels" title: wrong, then right
      const tw = k("ttlA").getComputedTextLength ? k("ttlA").getComputedTextLength() : 110;
      k("bdg").setAttribute("transform", `translate(${f1(210 + tw + 13)} ${TA - 4}) scale(${Math.max(0, S.bdg).toFixed(3)})`);
      op("bdg", S.bdg * 2); op("bx", 1 - S.chk); op("bv", S.chk);
    },
    beats: [
      { steps: [{ to: { you: 1, qm: 1 }, ms: 500, sfx: "pluck" }, { wait: 200 }, { to: { pc: 1 }, ms: 600 }] },
      { steps: [{ to: { pc: 0, qm: 0 }, ms: 400 }, { to: { mlab: 1 }, ms: 300 },
        { to: { news: .5 }, ms: 800, ease: "lin", sfx: "whoosh" }, { to: { news: 1 }, ms: 800, ease: "lin", sfx: "pop" }] },
      { steps: [{ to: { notes: 1 }, ms: 1000, ease: "lin", sfx: "tick" }, { wait: 600 }, { to: { drift: 1 }, ms: 1700, ease: "lin" }] },
      { steps: [{ to: { tag: 1 }, ms: 400 }, { to: { beam: 1 }, ms: 300 }, { to: { sweep: 1 }, ms: 1500, ease: "inOut", sfx: "whoosh" },
        { to: { settle: 1, beam: .8 }, ms: 500, ease: "inOut" }] },
      { steps: [{ to: { beam: 0, nout: 1 }, ms: 400 }, { to: { fa: 1 }, ms: 400 }, { to: { fp: .86, fc: .3 }, ms: 900, ease: "back", sfx: "spring" }] },
      { steps: [{ to: { ab: 1 }, ms: 400 }, { to: { ac: .9, ap: .04 }, ms: 800, sfx: "thud", sfxAt: 250 }, { to: { bdg: 1 }, ms: 400, ease: "back" }] },
      { steps: [{ to: { mdim: 1 }, ms: 500 }, { to: { q2: 1 }, ms: 800, sfx: "scribble", sfxAt: 300 }, { to: { hl: 1 }, ms: 500 }] },
      { steps: [{ to: { fp: .04, fc: .9, fix: 1 }, ms: 1200, ease: "inOut" }, { to: { chk: 1 }, ms: 400, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
