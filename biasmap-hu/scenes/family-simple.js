/* Family: simple & complete. Two boxes: a neat one with a full label, and a messy one with a "?" where the
   label should be. Your pick, your reading and a meeting's hour all pile onto the neat one. Three members as
   quick examples: ambiguity bias, information bias, the bike-shedding effect. The fix: ask whether more facts
   would change your choice, and give time in proportion to what's at stake. Numbers are illustrative.
   Scene for anim.js. */
(function () {
  const KEY = "family-simple", P = `.bp[data-scene="${KEY}"]`;
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const oc = p => 1 - Math.pow(1 - p, 3);
  const AX = 100, BX = 300, FL = 176;              // box centres, the floor
  const LID = 97;                                  // top of the neat box's lid
  const TY = 185, TH = 22;                         // tags under the boxes
  const BY = 226, BW = 96, BH = 9;                 // time bars: top, track width, height
  // papers piling onto the neat box: centre x, bottom y, tilt
  const DOCS = [[73, LID, -5], [101, LID, 3], [129, LID, -3], [87, LID - 28, 6], [115, LID - 28, -4]];
  const ROWS = [-44, -33, -22];                    // label rows, relative to the label's bottom (y 0)

  // a label card with three ticked rows, bottom centre at (0, 0)
  const rows = cls => ROWS.map(y => `<path class="fs-tk ${cls}" d="M-28 ${y} l3 3 l5.5 -6"/><path class="fs-ln ${cls}" d="M-15 ${y + 1} H26"/>`).join("");
  const doc = i => `<g data-k="d${i}"><g class="fs-doc"><path class="o" d="M-12 0 V-28 H5 L12 -21 V0 Z"/><path class="c" d="M5 -28 V-21 H12"/>
      <path class="l q" d="M-7 -19 H3"/><path class="l" d="M-7 -13 H7 M-7 -7 H5"/></g></g>`;

  // a speech card whose tail points down at the neat box
  const bubble = (x, y, w, h, r) => {
    const t = x + 30, b = y + h;
    return `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${b - r} Q${x + w} ${b} ${x + w - r} ${b} H${t + 10} L${t - 6} ${b + 9} L${t} ${b} H${x + r} Q${x} ${b} ${x} ${b - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
  };

  window.BiasAnim.SCENES[KEY] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
      ${P} .fs-floor{stroke:var(--rule);stroke-width:2;stroke-linecap:round}
      ${P} .fs-box{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .fs-card{fill:var(--surface);stroke:var(--muted);stroke-width:1.6}
      ${P} .fs-card.g{fill:none;stroke:var(--good);stroke-width:2}
      ${P} .fs-tk{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fs-ln{fill:none;stroke:var(--muted);stroke-width:2;stroke-linecap:round}
      ${P} .fs-tk.g,${P} .fs-ln.g{stroke:var(--good)}
      ${P} .fs-tape{fill:var(--muted);fill-opacity:.35;stroke:var(--muted);stroke-width:1.2;stroke-linejoin:round}
      ${P} .fs-miss{fill:none;stroke:var(--faint);stroke-width:1.6;stroke-dasharray:4 3}
      ${P} .fs-qm{fill:none;stroke:var(--q);stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fs-qd{fill:var(--q)}
      ${P} .fs-pick circle{fill:var(--surface);stroke:var(--q);stroke-width:2.2}
      ${P} .fs-pick path{fill:none;stroke:var(--q);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fs-tag rect{fill:var(--surface);stroke:var(--muted);stroke-width:1.6}
      ${P} .fs-tag text{font:600 11px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fs-tag.q rect{stroke:var(--q)}
      ${P} .fs-tag.m text{fill:var(--muted)}
      ${P} .fs-tag.g rect{stroke:var(--good);stroke-width:2} ${P} .fs-tag.g text{fill:var(--good)}
      ${P} .fs-chip rect{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .fs-chip text{font:600 11.5px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .fs-note{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .fs-note.q{fill:var(--q);text-anchor:start}
      ${P} .fs-arr{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fs-doc .o{fill:var(--surface);stroke:var(--ink);stroke-width:1.6;stroke-linejoin:round}
      ${P} .fs-doc .c{fill:none;stroke:var(--ink);stroke-width:1.4;stroke-linejoin:round}
      ${P} .fs-doc .l{fill:none;stroke:var(--muted);stroke-width:1.6;stroke-linecap:round}
      ${P} .fs-doc .l.q{stroke:var(--q)}
      ${P} .fs-clock circle{fill:var(--surface);stroke:var(--muted);stroke-width:1.6}
      ${P} .fs-clock path{fill:none;stroke:var(--muted);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fs-track{fill:none;stroke:var(--muted);stroke-width:1.6}
      ${P} .fs-fill{fill:var(--q)}
      ${P} .fs-fill.b{fill:var(--bad)}
      ${P} .fs-fill.g{fill:var(--good)}
      ${P} .fs-min{font:600 11px var(--display);text-anchor:middle}
      ${P} .fs-ask path{fill:var(--surface);stroke:var(--good);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fs-ask text{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
    `,
    text: {
      hu: {
        name: "Egyszerű és teljes", shareTitle: "Miért nyer a szép, egyszerű lehetőség akkor is, ha rosszabb, 30 másodpercben",
        ecline: "A szép lehetőség biztonságosabbnak érződik, de az idődet arra fordítsd, ami számít, ne arra, ami könnyű.",
        cw: 6.1,
        jud: ["könnyen megítélhető", "nehezen megítélhető"],
        chip: ["Kétértelműség-torzítás", "Információs torzítás", "Kerékpárszín-hatás"],
        odds: ["4-ből 1 nyer", "az esély ismeretlen"], maybe: "talán 2-ből 1?",
        more: "több tény", same: "ugyanaz a választás",
        shed: ["a kerékpártároló színe", "atomerőmű"],
        min: n => `${n} perc`,
        ask: "Megváltoztatná ez a döntésem?", askW: 196,
        caps: [
          "Két doboz: az egyik <b>szép és teljesen felcímkézett</b>, a másik <b>tele kérdőjelekkel</b>.",
          "Az agyad a tisztát választja: <b>gyors</b>, <b>kiszámítható</b>, és általában okos lépés.",
          "Az <b>ismert esélyeket</b> választod az ismeretlenekkel szemben, amelyek <b>jobbak</b> lehetnek.",
          "Már döntöttél, mégis <b>tényeket gyűjtesz</b>, amelyek semmit sem változtatnak.",
          "Egy megbeszélésen <b>egy órát</b> töltenek a kerékpártároló színével…",
          "…és <b>öt percet</b> az atomerőműről, a részről, ami valóban számít.",
          "<b>A megoldás:</b> kérdezd meg: ez <b>megváltoztatná a döntésemet</b>? Ha nem, állj meg.",
          "Aztán minden döntésre annyi időt szánj, <b>amennyi a tét</b> arányában jár."
        ],
        say: [
          "Két doboz. Az egyik szép és teljesen felcímkézett. A másik tele van kérdőjelekkel.",
          "Az agyad a tisztát választja. Gyors és kiszámítható, és általában ez okos lépés.",
          "Kétértelműség-torzítás: az ismert esélyeket választod az ismeretlenekkel szemben, még akkor is, ha az ismeretlenek jobbak lehetnek.",
          "Információs torzítás: már döntöttél, mégis tényeket gyűjtesz, amelyek semmit sem változtatnak.",
          "A kerékpárszín-hatás: egy megbeszélés egy órát tölt a kerékpártároló színével...",
          "...és öt percet az atomerőműről, a részről, ami valóban számít.",
          "A megoldás: kérdezd meg magadtól, ez megváltoztatná a döntésemet? Ha nem, állj meg.",
          "Aztán minden döntésre annyi időt szánj, amennyi a tét arányában jár.",
          "Egyszerű és teljes. A szép lehetőség biztonságosabbnak érződik, de az idődet arra fordítsd, ami számít, ne arra, ami könnyű."
        ]
      },
      en: {
        name: "Simple & complete", shareTitle: "Why the neat, simple option wins even when it's worse, in 30 seconds",
        ecline: "The neat option feels safer, but give your time to what matters, not to what's easy.",
        cw: 6.1,
        jud: ["easy to judge", "hard to judge"],
        chip: ["Ambiguity bias", "Information bias", "Bike-shedding effect"],
        odds: ["1 in 4 wins", "odds unknown"], maybe: "maybe 1 in 2?",
        more: "more facts", same: "same choice",
        shed: ["bike shed colour", "nuclear plant"],
        min: n => `${n} min`,
        ask: "Would this change my choice?", askW: 196,
        caps: [
          "Two boxes: one <b>neat and fully labelled</b>, one <b>full of question marks</b>.",
          "Your brain picks the clear one: <b>quick</b>, <b>predictable</b>, usually a smart move.",
          "You pick <b>known odds</b> over unknown ones that might be <b>better</b>.",
          "You've chosen, yet keep <b>gathering facts</b> that won't change a thing.",
          "A meeting spends <b>an hour</b> on the bike shed's colour…",
          "…and <b>five minutes</b> on the nuclear plant, the part that matters.",
          "<b>The fix:</b> ask, “Would this <b>change my choice</b>?” If not, stop.",
          "Then give each choice time <b>in proportion to what's at stake</b>."
        ],
        say: [
          "Two boxes. One is neat and fully labelled. The other is full of question marks.",
          "Your brain picks the clear one. It's quick and predictable, and usually that's a smart move.",
          "Ambiguity bias: you pick known odds over unknown ones, even when the unknown ones might be better.",
          "Information bias: you've already chosen, yet you keep gathering facts that won't change a thing.",
          "The bike-shedding effect: a meeting spends an hour on the colour of the bike shed...",
          "...and five minutes on the nuclear plant, the part that really matters.",
          "The fix: ask yourself, would this change my choice? If not, stop.",
          "Then give each choice time in proportion to what's at stake.",
          "Simple and complete. The neat option feels safer, but give your time to what matters, not to what's easy."
        ]
      },
      el: {
        name: "Απλό και πλήρες", shareTitle: "Γιατί το απλό και τακτοποιημένο κερδίζει ακόμη κι όταν είναι χειρότερο, σε 30 δευτερόλεπτα",
        ecline: "Η τακτοποιημένη επιλογή μοιάζει πιο σίγουρη, αλλά δώσε τον χρόνο σου σε ό,τι μετράει, όχι σε ό,τι είναι εύκολο.",
        cw: 5.9,
        jud: ["εύκολο να το κρίνεις", "δύσκολο να το κρίνεις"],
        chip: ["Μεροληψία αμφισημίας", "Μεροληψία πληροφόρησης", "Φαινόμενο του ποδηλατοστασίου"],
        odds: ["κερδίζει 1 στις 4", "άγνωστες πιθανότητες"], maybe: "ίσως 1 στις 2;",
        more: "κι άλλα στοιχεία", same: "ίδια επιλογή",
        shed: ["χρώμα ποδηλατοστασίου", "πυρηνικός σταθμός"],
        min: n => `${n} λεπτά`,
        ask: "Θα άλλαζε την επιλογή μου;", askW: 190,
        caps: [
          "Δύο κουτιά: το ένα <b>τακτοποιημένο, με πλήρη ετικέτα</b>, το άλλο <b>γεμάτο ερωτηματικά</b>.",
          "Το μυαλό σου διαλέγει το ξεκάθαρο: <b>γρήγορη</b>, <b>προβλέψιμη</b> επιλογή, και συνήθως έξυπνη.",
          "Προτιμάς τις <b>γνωστές πιθανότητες</b> από άγνωστες που ίσως είναι <b>καλύτερες</b>.",
          "Έχεις διαλέξει, αλλά <b>μαζεύεις κι άλλα στοιχεία</b> που δεν αλλάζουν τίποτα.",
          "Μια σύσκεψη ξοδεύει <b>μία ώρα</b> για το χρώμα του ποδηλατοστασίου…",
          "…και <b>πέντε λεπτά</b> για τον πυρηνικό σταθμό, που είναι και το σημαντικό.",
          "<b>Η λύση:</b> αναρωτήσου «Θα <b>άλλαζε την επιλογή μου</b>;» Αν όχι, σταμάτα.",
          "Μετά δώσε σε κάθε απόφαση χρόνο <b>ανάλογο με το πόσο μετράει</b>."
        ],
        say: [
          "Δύο κουτιά. Το ένα είναι τακτοποιημένο, με πλήρη ετικέτα. Το άλλο είναι γεμάτο ερωτηματικά.",
          "Το μυαλό σου διαλέγει το ξεκάθαρο. Είναι γρήγορη και προβλέψιμη επιλογή, και συνήθως έξυπνη.",
          "Μεροληψία αμφισημίας: προτιμάς τις γνωστές πιθανότητες από άγνωστες, ακόμη κι όταν οι άγνωστες μπορεί να είναι καλύτερες.",
          "Μεροληψία πληροφόρησης: έχεις ήδη διαλέξει, αλλά μαζεύεις κι άλλα στοιχεία που δεν αλλάζουν τίποτα.",
          "Φαινόμενο του ποδηλατοστασίου: μια σύσκεψη ξοδεύει μία ώρα για το χρώμα του ποδηλατοστασίου...",
          "...και πέντε λεπτά για τον πυρηνικό σταθμό, που είναι και το πραγματικά σημαντικό.",
          "Η λύση: αναρωτήσου, θα άλλαζε αυτό την επιλογή μου; Αν όχι, σταμάτα.",
          "Μετά δώσε σε κάθε απόφαση χρόνο ανάλογο με το πόσο μετράει.",
          "Απλό και πλήρες. Η τακτοποιημένη επιλογή μοιάζει πιο σίγουρη, αλλά δώσε τον χρόνο σου σε ό,τι μετράει, όχι σε ό,τι είναι εύκολο."
        ]
      },
      es: {
        name: "Simple y completo", shareTitle: "Por qué gana la opción ordenada y simple aunque sea peor, en 30 segundos",
        ecline: "La opción ordenada parece más segura, pero dedica tu tiempo a lo que importa, no a lo que es fácil.",
        cw: 6.1,
        jud: ["fácil de juzgar", "difícil de juzgar"],
        chip: ["Sesgo de ambigüedad", "Sesgo de información", "Efecto del cobertizo de bicis"],
        odds: ["gana 1 de cada 4", "probabilidad incierta"], maybe: "¿quizá 1 de 2?",
        more: "más datos", same: "misma elección",
        shed: ["color del cobertizo", "central nuclear"],
        min: n => `${n} min`,
        ask: "¿Cambiaría esto mi elección?", askW: 196,
        caps: [
          "Dos cajas: una <b>ordenada y bien etiquetada</b>, otra <b>llena de interrogantes</b>.",
          "Tu cerebro elige la clara: es <b>rápido</b>, <b>predecible</b> y casi siempre sensato.",
          "Prefieres <b>probabilidades conocidas</b> a otras desconocidas que quizá sean <b>mejores</b>.",
          "Ya elegiste, pero sigues <b>reuniendo datos</b> que no cambiarán nada.",
          "Una reunión dedica <b>una hora</b> al color del cobertizo de bicis…",
          "…y <b>cinco minutos</b> a la central nuclear, que es lo que importa.",
          "<b>La solución:</b> pregúntate «¿Esto <b>cambiaría mi elección</b>?». Si no, para.",
          "Luego dale a cada decisión un tiempo <b>proporcional a lo que está en juego</b>."
        ],
        say: [
          "Dos cajas. Una está ordenada y bien etiquetada. La otra está llena de interrogantes.",
          "Tu cerebro elige la clara. Es rápido y predecible, y casi siempre es lo sensato.",
          "Sesgo de ambigüedad: prefieres probabilidades conocidas a otras desconocidas, aunque las desconocidas quizá sean mejores.",
          "Sesgo de información: ya elegiste, pero sigues reuniendo datos que no cambiarán nada.",
          "Efecto del cobertizo de bicis: una reunión dedica una hora al color del cobertizo de bicis...",
          "...y cinco minutos a la central nuclear, que es lo que de verdad importa.",
          "La solución: pregúntate, ¿esto cambiaría mi elección? Si no, para.",
          "Luego dale a cada decisión un tiempo proporcional a lo que está en juego.",
          "Simple y completo. La opción ordenada parece más segura, pero dedica tu tiempo a lo que importa, no a lo que es fácil."
        ]
      },
      fr: {
        name: "Simple et complet", shareTitle: "Pourquoi l’option nette et simple l’emporte même quand elle est pire, en 30 secondes",
        ecline: "L’option nette semble plus sûre, mais consacrez votre temps à ce qui compte, pas à ce qui est facile.",
        cw: 6.1,
        jud: ["facile à juger", "difficile à juger"],
        chip: ["Biais d’ambiguïté", "Biais d’information", "Effet abri à vélos"],
        odds: ["1 chance sur 4", "chances inconnues"], maybe: "peut-être 1 sur 2 ?",
        more: "plus de faits", same: "même choix",
        shed: ["couleur de l’abri", "centrale nucléaire"],
        min: n => `${n} min`,
        ask: "Cela changerait-il mon choix ?", askW: 196,
        caps: [
          "Deux boîtes : l’une <b>nette et bien étiquetée</b>, l’autre <b>pleine de points d’interrogation</b>.",
          "Votre cerveau prend la plus claire : c’est <b>rapide</b>, <b>prévisible</b>, souvent judicieux.",
          "Vous préférez des <b>chances connues</b> à des inconnues peut-être <b>meilleures</b>.",
          "Vous avez choisi, mais continuez à <b>accumuler des faits</b> qui ne changeront rien.",
          "Une réunion passe <b>une heure</b> sur la couleur de l’abri à vélos…",
          "…et <b>cinq minutes</b> sur la centrale nucléaire, le sujet qui compte.",
          "<b>La solution :</b> demandez-vous « Cela <b>changerait-il mon choix</b> ? » Sinon, arrêtez.",
          "Puis accordez à chaque choix un temps <b>à la mesure de l’enjeu</b>."
        ],
        say: [
          "Deux boîtes. L’une est nette et bien étiquetée. L’autre est pleine de points d’interrogation.",
          "Votre cerveau prend la plus claire. C’est rapide et prévisible, et c’est souvent judicieux.",
          "Biais d’ambiguïté : vous préférez des chances connues à des chances inconnues, même quand celles-ci pourraient être meilleures.",
          "Biais d’information : vous avez déjà choisi, mais vous continuez à accumuler des faits qui ne changeront rien.",
          "Effet abri à vélos : une réunion passe une heure sur la couleur de l’abri à vélos...",
          "...et cinq minutes sur la centrale nucléaire, le sujet qui compte vraiment.",
          "La solution : demandez-vous, cela changerait-il mon choix ? Sinon, arrêtez.",
          "Puis accordez à chaque choix un temps à la mesure de l’enjeu.",
          "Simple et complet. L’option nette semble plus sûre, mais consacrez votre temps à ce qui compte, pas à ce qui est facile."
        ]
      },
      de: {
        name: "Einfach und vollständig", shareTitle: "Warum die ordentliche, einfache Option gewinnt, selbst wenn sie schlechter ist, in 30 Sekunden",
        ecline: "Die ordentliche Option fühlt sich sicherer an, aber gib deine Zeit dem, was zählt, nicht dem, was leicht ist.",
        cw: 6.1,
        jud: ["leicht zu beurteilen", "schwer zu beurteilen"],
        chip: ["Ambiguitätsaversion", "Informations-Verzerrung", "Fahrradschuppen-Effekt"],
        odds: ["1 von 4 gewinnt", "Chancen unbekannt"], maybe: "vielleicht 1 von 2?",
        more: "mehr Fakten", same: "gleiche Wahl",
        shed: ["Farbe des Schuppens", "Atomkraftwerk"],
        min: n => `${n} Min.`,
        ask: "Ändert das meine Wahl?", askW: 196,
        caps: [
          "Zwei Kisten: eine <b>ordentlich und voll beschriftet</b>, eine <b>voller Fragezeichen</b>.",
          "Dein Gehirn nimmt die eindeutige: <b>schnell</b>, <b>berechenbar</b>, meist ein kluger Zug.",
          "Du wählst <b>bekannte Chancen</b> statt unbekannter, die vielleicht <b>besser</b> wären.",
          "Du hast schon gewählt und <b>sammelst weiter Fakten</b>, die nichts ändern.",
          "Ein Meeting verbringt <b>eine Stunde</b> mit der Farbe des Fahrradschuppens…",
          "…und <b>fünf Minuten</b> mit dem Atomkraftwerk, um das es eigentlich geht.",
          "<b>Die Lösung:</b> Frag dich: „Ändert das <b>meine Wahl</b>?“ Wenn nicht, hör auf.",
          "Gib dann jeder Entscheidung Zeit, <b>je nachdem, was auf dem Spiel steht</b>."
        ],
        say: [
          "Zwei Kisten. Eine ist ordentlich und voll beschriftet. Die andere ist voller Fragezeichen.",
          "Dein Gehirn nimmt die eindeutige. Das geht schnell, ist berechenbar und meistens ein kluger Zug.",
          "Ambiguitätsaversion: Du wählst bekannte Chancen statt unbekannter, selbst wenn die unbekannten besser sein könnten.",
          "Informations-Verzerrung: Du hast schon gewählt, sammelst aber weiter Fakten, die nichts mehr ändern.",
          "Der Fahrradschuppen-Effekt: Ein Meeting verbringt eine Stunde mit der Farbe des Fahrradschuppens...",
          "...und fünf Minuten mit dem Atomkraftwerk, um das es wirklich geht.",
          "Die Lösung: Frag dich, ändert das meine Wahl? Wenn nicht, hör auf.",
          "Gib dann jeder Entscheidung Zeit, je nachdem, was auf dem Spiel steht.",
          "Einfach und vollständig. Die ordentliche Option fühlt sich sicherer an, aber gib deine Zeit dem, was zählt, nicht dem, was leicht ist."
        ]
      },
      it: {
        name: "Semplice e completo", shareTitle: "Perché l’opzione ordinata e semplice vince anche quando è peggiore, in 30 secondi",
        ecline: "L’opzione ordinata sembra più sicura, ma dedica il tuo tempo a ciò che conta, non a ciò che è facile.",
        cw: 6.1,
        jud: ["facile da giudicare", "difficile da giudicare"],
        chip: ["Avversione all’ambiguità", "Bias dell’informazione", "Effetto tettoia per bici"],
        odds: ["vince 1 su 4", "probabilità ignote"], maybe: "forse 1 su 2?",
        more: "più dati", same: "stessa scelta",
        shed: ["colore della tettoia", "centrale nucleare"],
        min: n => `${n} min`,
        ask: "Cambierebbe la mia scelta?", askW: 196,
        caps: [
          "Due scatole: una <b>ordinata e ben etichettata</b>, l’altra <b>piena di punti interrogativi</b>.",
          "Il tuo cervello sceglie quella chiara: è <b>rapido</b>, <b>prevedibile</b> e di solito sensato.",
          "Preferisci <b>probabilità note</b> a probabilità ignote che forse sono <b>migliori</b>.",
          "Hai già scelto, eppure continui a <b>raccogliere dati</b> che non cambieranno nulla.",
          "Una riunione passa <b>un’ora</b> sul colore della tettoia per bici…",
          "…e <b>cinque minuti</b> sulla centrale nucleare, la parte che conta.",
          "<b>La soluzione:</b> chiediti «Questo <b>cambierebbe la mia scelta</b>?». Se no, fermati.",
          "Poi dai a ogni scelta un tempo <b>proporzionato alla posta in gioco</b>."
        ],
        say: [
          "Due scatole. Una è ordinata e ben etichettata. L’altra è piena di punti interrogativi.",
          "Il tuo cervello sceglie quella chiara. È rapido e prevedibile, e di solito è una mossa sensata.",
          "Avversione all’ambiguità: preferisci probabilità note a probabilità ignote, anche quando quelle ignote potrebbero essere migliori.",
          "Bias dell’informazione: hai già scelto, eppure continui a raccogliere dati che non cambieranno nulla.",
          "Effetto tettoia per bici: una riunione passa un’ora sul colore della tettoia per bici...",
          "...e cinque minuti sulla centrale nucleare, la parte che conta davvero.",
          "La soluzione: chiediti, questo cambierebbe la mia scelta? Se no, fermati.",
          "Poi dai a ogni scelta un tempo proporzionato alla posta in gioco.",
          "Semplice e completo. L’opzione ordinata sembra più sicura, ma dedica il tuo tempo a ciò che conta, non a ciò che è facile."
        ]
      }
    },
    svg(T) {
      const tag = (key, x, s, cls) => {
        const w = f1(s.length * T.cw + 22);
        return `<g class="fs-tag ${cls}" data-k="${key}"><rect x="${f1(x - w / 2)}" y="${TY}" width="${w}" height="${TH}" rx="6"/><text x="${x}" y="${TY + 15}">${s}</text></g>`;
      };
      const chip = (i, s) => {
        const w = f1(s.length * T.cw * 1.05 + 30);
        return `<g class="fs-chip" data-k="ch${i}"><rect x="${f1(200 - w / 2)}" y="9" width="${w}" height="22" rx="11"/><text x="200" y="24.5">${s}</text></g>`;
      };
      const bar = (s, c) => `<g data-k="bar${s}">
          <g class="fs-clock" transform="translate(${c - 51} ${BY + BH / 2})"><circle r="6.5"/><path d="M0 -3.6 V0 H2.8"/></g>
          <rect class="fs-fill" data-k="fq${s}" x="${c - 38}" y="${BY}" height="${BH}" rx="${BH / 2}"/>
          <rect class="fs-fill b" data-k="fb${s}" x="${c - 38}" y="${BY}" height="${BH}" rx="${BH / 2}"/>
          <rect class="fs-fill g" data-k="fg${s}" x="${c - 38}" y="${BY}" height="${BH}" rx="${BH / 2}"/>
          <rect class="fs-track" x="${c - 38}" y="${BY}" width="${BW}" height="${BH}" rx="${BH / 2}"/>
          <text class="fs-min" data-k="m${s}" x="${c + 10}" y="${BY + 26}"></text></g>`;
      return `
        <line class="fs-floor" data-k="floor" x1="22" y1="${FL}" x2="378" y2="${FL}"/>
        <g data-k="boxA">
          <rect class="fs-box" x="${AX - 55}" y="${LID + 10}" width="110" height="${FL - LID - 10}" rx="3"/>
          <rect class="fs-box" x="${AX - 60}" y="${LID}" width="120" height="13" rx="3"/>
          <g transform="translate(${AX} ${FL})"><rect class="fs-card" x="-36" y="-56" width="72" height="45" rx="4"/>${rows("")}</g>
        </g>
        <g data-k="boxB">
          <path class="fs-box" d="M-55 -68 L-63 -87 L-21 -90 L-12 -66 Z"/>
          <path class="fs-box" d="M-55 0 L55 0 L56 -62 L-55 -68 Z"/>
          <path class="fs-tape" d="M40 -70 L51 -71 L53 -50 L42 -49 Z"/>
          <g transform="translate(0 1)">
            <rect class="fs-miss" data-k="miss" x="-36" y="-56" width="72" height="45" rx="4"/>
            <g data-k="qm"><path class="fs-qm" d="M-9 -42 C-9 -52 10 -53 10 -43.5 C10 -36 1 -36 1 -28"/><circle class="fs-qd" cx="1" cy="-19.5" r="2.6"/></g>
            <g data-k="rowsB"><rect class="fs-card g" x="-36" y="-56" width="72" height="45" rx="4"/>${rows("g")}</g>
          </g>
        </g>
        <g class="fs-pick" data-k="pick"><circle r="11"/><path d="M-5 .5 L-1.5 4 L5 -3.5"/></g>
        ${DOCS.map((_, i) => doc(i)).join("")}
        <g data-k="more"><path class="fs-arr" d="M170 50 H150 M155 45 L150 50 L155 55"/><text class="fs-note q" x="176" y="53.5">${T.more}</text></g>
        ${tag("jA", AX, T.jud[0], "q")}${tag("jB", BX, T.jud[1], "m")}
        ${tag("oA", AX, T.odds[0], "q")}${tag("oB", BX, T.odds[1], "m")}
        <text class="fs-note" data-k="maybe" x="${BX}" y="${TY + TH + 17}">${T.maybe}</text>
        ${tag("sA", AX, T.same, "q")}
        ${tag("hA", AX, T.shed[0], "q")}${tag("hB", BX, T.shed[1], "")}${tag("hBg", BX, T.shed[1], "g")}
        ${bar("A", AX)}${bar("B", BX)}
        ${T.chip.map((s, i) => chip(i + 1, s)).join("")}
        <g class="fs-ask" data-k="ask"><path d="${bubble(200 - T.askW / 2, 8, T.askW, 26, 8)}"/><text x="200" y="25.5">${T.ask}</text></g>`;
    },
    S0: { aIn: 0, bIn: 0, qm: 0, wob: 0, pick: 0, pickOff: 0, jud: 0, ch1: 0, ch2: 0, ch3: 0, odds: 0, maybe: 0,
      bDim: 0, docs: 0, more: 0, same: 0, docDim: 0, shed: 0, bars: 0, tA: 0, tB: 0, bBig: 0, ask: 0, sweep: 0, gB: 0, fix: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const tr = (key, x, y, extra) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)})${extra || ""}`);
      op("floor", S.aIn);
      // the neat box drops in; the messy one lands after it, tipped up on one corner, and rocks when its "?" shows
      tr("boxA", 0, -12 * (1 - S.aIn)); op("boxA", S.aIn);
      const sB = 1 + .12 * S.bBig;
      tr("boxB", BX, FL - 12 * (1 - S.bIn), ` rotate(${f1(-3 + S.wob)} ${f1(-55 * sB)} 0) scale(${f1(sB * 100) / 100})`);
      op("boxB", S.bIn * (1 - .6 * S.bDim));
      const qs = .4 + .6 * S.qm;
      k("qm").setAttribute("transform", `translate(0 -34) scale(${f1(qs * 100) / 100}) translate(0 34)`);
      op("qm", cl(S.qm * 2) * (1 - S.fix));
      op("miss", 1 - S.fix);
      op("rowsB", S.fix);
      // your pick: a tick on the neat box's corner
      const ps = .5 + .5 * S.pick;
      tr("pick", AX + 60, LID, ` scale(${f1(ps * 100) / 100})`);
      op("pick", cl(S.pick * 2) * (1 - S.pickOff));
      // tags under the boxes, one set per example
      op("jA", S.jud); op("jB", S.jud);
      op("oA", S.odds); op("oB", S.odds); op("maybe", S.maybe);
      op("sA", S.same);
      op("hA", S.shed); op("hB", S.shed); op("hBg", S.fix);
      op("ch1", S.ch1); op("ch2", S.ch2); op("ch3", S.ch3);
      // more facts pile onto the neat box, one by one; the fix sweeps them off
      DOCS.forEach(([x, y, a], i) => {
        const p = cl(S.docs - i);
        tr("d" + i, x - 45 * oc(S.sweep), y - 14 * (1 - oc(p)) - 14 * S.sweep, ` rotate(${f1(a - 25 * S.sweep)})`);
        op("d" + i, cl(p * 3) * (1 - .45 * S.docDim) * (1 - S.sweep));
      });
      op("more", S.more);
      // time spent: an hour on the shed, five minutes on the plant, then the other way round
      op("barA", S.bars); op("barB", S.bars);
      const bar = (s, v, g) => {
        const w = f1(BW * cl(v));
        ["fq", "fb", "fg"].forEach(f => k(f + s).setAttribute("width", w));
        op("fq" + s, s === "A" ? 1 : 0);
        op("fb" + s, s === "B" ? 1 - g : 0);
        op("fg" + s, s === "B" ? g : 0);
        const n = Math.round(cl(v) * 12) * 5, m = k("m" + s);
        m.textContent = n ? T.min(n) : "";
        m.style.fill = s === "A" ? "var(--ink)" : g > .5 ? "var(--good)" : "var(--bad)";
      };
      bar("A", S.tA, 0);
      bar("B", S.tB, S.gB);
      const as = .8 + .2 * S.ask;
      k("ask").setAttribute("transform", `translate(200 21) scale(${f1(as * 100) / 100}) translate(-200 -21)`);
      op("ask", S.ask);
    },
    beats: [
      { steps: [{ to: { aIn: 1 }, ms: 600, ease: "back", sfx: "pluck" }, { to: { bIn: 1 }, ms: 600, ease: "back" },
        { to: { qm: 1, wob: -4 }, ms: 260, sfx: "pop" }, { to: { wob: 2 }, ms: 280, ease: "inOut" }, { to: { wob: 0 }, ms: 280, ease: "inOut" }] },
      { steps: [{ to: { pick: 1 }, ms: 450, ease: "back", sfx: "tick" }, { wait: 300 }, { to: { jud: 1 }, ms: 450 }] },
      { steps: [{ to: { jud: 0 }, ms: 250 }, { to: { ch1: 1, odds: 1 }, ms: 450, sfx: "pop" }, { wait: 900 }, { to: { maybe: 1 }, ms: 450 }] },
      { steps: [{ to: { ch1: 0, odds: 0, maybe: 0 }, ms: 250 }, { to: { ch2: 1, bDim: 1 }, ms: 450 },
        { to: { docs: 5, more: 1 }, ms: 2000, ease: "lin", sfx: "pluck" }, { to: { same: 1 }, ms: 400 }] },
      { steps: [{ to: { ch2: 0, same: 0, more: 0, pickOff: 1, bDim: 0, docDim: 1 }, ms: 350 }, { to: { ch3: 1, shed: 1 }, ms: 450 },
        { to: { bars: 1 }, ms: 300 }, { to: { tA: 1 }, ms: 1600, ease: "inOut", sfx: "whoosh" }] },
      { steps: [{ to: { bBig: 1 }, ms: 600, ease: "back", sfx: "spring" }, { to: { tB: 5 / 60 }, ms: 500 }] },
      { steps: [{ to: { ch3: 0 }, ms: 250 }, { to: { ask: 1 }, ms: 450, ease: "back" }, { wait: 700 },
        { to: { sweep: 1, tA: 5 / 60 }, ms: 1100, ease: "inOut", sfx: "whoosh" }] },
      { steps: [{ to: { tB: 1, gB: 1 }, ms: 1400, ease: "inOut" }, { to: { fix: 1 }, ms: 600, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
