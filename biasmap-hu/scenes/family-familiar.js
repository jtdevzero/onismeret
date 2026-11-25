/* Family: familiar is better. Two teams hand in the same work. The glow of the familiar spreads from your team
   onto its work, the other team blurs into "all the same", and their better idea bounces off your team's bubble.
   Names hidden and one checklist for both: level scores, and the idea wins. Scene for anim.js. */
(function () {
  const KEY = "family-familiar", P = `.bp[data-scene="${KEY}"]`;
  const LX = 100, RX = 300, DX = 52, HY = 58;          // team centres, spacing between people, head centre y
  const CT = 122, CW = 88, CH = 76;                    // report cards: top, width, height
  const ROW = [158, 172, 186];                         // the report's lines, and the checklist rows
  const LEN = [52, 44, 56];                            // line lengths inside a card
  const GX = 20, GW = 160, GT = 34, GH0 = 78, GH1 = 172; // the glow round your team: left, width, top, height round the people, then down over the work
  const BIN = [236, 70], B0 = [210, 44], BHIT = [194, 48], BOUT = [208, 72], BWIN = [200, 58], BS = 1.3;   // the idea bulb: rises from their team, hits your bubble, bounces, wins
  const TY = 216, TH = 28;                             // name tag: top, height
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const lerp = (a, b, t) => a + (b - a) * t;

  // three looks, so each person is someone: glasses, a fringe, a bun
  const FEAT = [
    `<circle class="gl" cx="-3.2" cy="-0.6" r="2.9"/><circle class="gl" cx="3.2" cy="-0.6" r="2.9"/><path class="gl" d="M-6.1 -1.2 H-8.3 M6.1 -1.2 H8.3"/>`,
    `<path class="hc" d="M-8.5 0 A8.5 8.5 0 0 1 8.5 0 Q7 -3.2 4.2 -3.6 Q2 -5.8 0 -3.8 Q-2 -5.8 -4.2 -3.6 Q-7 -3.2 -8.5 0 Z"/>`,
    `<circle cx="0" cy="-11.9" r="3.4"/>`
  ];
  // head and shoulders around the head centre (0, 0); colour comes from currentColor
  const person = (key, i) => `<g data-k="${key}"><g class="ff-p" data-k="${key}c">
    <path class="bd" d="M-17 32 V27 C-17 19 -9 14 0 14 C9 14 17 19 17 27 V32"/><circle r="8.5"/>
    <circle class="e" cx="-3.2" cy="-0.6" r="1.25"/><circle class="e" cx="3.2" cy="-0.6" r="1.25"/>
    <g data-k="${key}f">${FEAT[i]}</g></g></g>`;
  const tick = (x, y, key) => `<path class="ff-tk" data-k="${key}" d="M${x - 4.5} ${y} L${x - 1.3} ${y + 3.3} L${x + 4.8} ${y - 3.6}"/>`;
  // a report: title, score badge, three lines of work, and a tick slot per line
  const report = (s, x0) => {
    const bx = x0 + CW - 17, by = CT + 16;
    const badge = (cls, key) => `<g class="ff-bd ${cls}" data-k="${key}"><circle cx="${bx}" cy="${by}" r="11.5"/><text data-k="${key}v" x="${bx}" y="${by + 4.5}"></text></g>`;
    return `<g class="ff-cd" data-k="cd${s}"><rect class="bx" x="${x0}" y="${CT}" width="${CW}" height="${CH}" rx="6"/>
      <line class="t" x1="${x0 + 10}" x2="${x0 + 42}" y1="${CT + 14}" y2="${CT + 14}"/><line class="l" x1="${x0 + 10}" x2="${x0 + 32}" y1="${CT + 22}" y2="${CT + 22}"/>
      ${ROW.map((y, i) => `<line class="l" x1="${x0 + 10}" x2="${x0 + 10 + LEN[i]}" y1="${y}" y2="${y}"/>`).join("")}
      ${ROW.map((y, i) => tick(x0 + CW - 13, y, `k${s}${i}`)).join("")}</g>
      <g data-k="b${s}">${badge(s === "L" ? "q" : "m", `b${s}o`)}${badge("g", `b${s}g`)}</g>`;
  };
  const star = (x, y, r) => `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`;
  // the idea: a bulb centred on (0, 0), in one colour, with or without rays
  const bulb = (cls, rays) => `<g class="ff-bb ${cls}"><path class="gs" d="M-4 6 C-4 2.5 -8 0.5 -8 -5 A8 8 0 1 1 8 -5 C8 0.5 4 2.5 4 6 Z"/>
    <path class="ln" d="M-2.2 1.5 L0 -3 L2.2 1.5 M-3.6 9.5 H3.6 M-2.4 12.8 H2.4"/>${rays ? `<path class="ln" d="M0 -17 V-21 M-11.5 -13.5 L-14.3 -16.3 M11.5 -13.5 L14.3 -16.3 M-15 -4 H-19 M15 -4 H19"/>` : ""}</g>`;

  window.BiasAnim.SCENES[KEY] = {
    q: "nem", viewBox: "0 0 400 272",
    css: `
      ${P} .ff-team{font:500 10px var(--mono);text-anchor:middle;fill:var(--muted)}
      ${P} .ff-team.q{fill:var(--q)}
      ${P} .ff-glow{fill:var(--q);fill-opacity:.13}
      ${P} .ff-edge{stroke:var(--bad);stroke-width:3;stroke-linecap:round}
      ${P} .ff-spk{fill:var(--q)}
      ${P} .ff-p path,${P} .ff-p circle{fill:var(--surface);stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ff-p .bd{stroke-linecap:butt}
      ${P} .ff-p .e{fill:currentColor;stroke:none}
      ${P} .ff-p .gl{fill:none;stroke-width:1.5}
      ${P} .ff-p .hc{fill:currentColor;fill-opacity:.7;stroke:none}
      ${P} .ff-lb{font:500 9.5px var(--mono);text-anchor:middle;fill:var(--q)}
      ${P} .ff-lb.m{fill:var(--muted)}
      ${P} .ff-cd .bx{fill:var(--surface);stroke:var(--ink);stroke-width:1.8}
      ${P} .ff-cd .t{stroke:var(--ink);stroke-width:2.4;stroke-linecap:round}
      ${P} .ff-cd .l{stroke:var(--faint);stroke-width:1.8;stroke-linecap:round}
      ${P} .ff-bd circle{fill:var(--surface);stroke-width:2}
      ${P} .ff-bd text{font:700 12.5px var(--display);text-anchor:middle}
      ${P} .ff-bd.q circle{stroke:var(--q)} ${P} .ff-bd.q text{fill:var(--q)}
      ${P} .ff-bd.m circle{stroke:var(--muted)} ${P} .ff-bd.m text{fill:var(--muted)}
      ${P} .ff-bd.g circle{stroke:var(--good)} ${P} .ff-bd.g text{fill:var(--good)}
      ${P} .ff-eq line{stroke:var(--q);stroke-width:2.4;stroke-linecap:round}
      ${P} .ff-tk{fill:none;stroke:var(--good);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ff-cr{font:600 11px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ff-chk{font:500 9.5px var(--mono);fill:var(--good);text-anchor:middle}
      ${P} .ff-bb .gs{fill:var(--surface);stroke-width:2.2;stroke-linejoin:round}
      ${P} .ff-bb .ln{fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ff-bb.q .gs,${P} .ff-bb.q .ln{stroke:var(--q)}
      ${P} .ff-bb.q .gs{fill:var(--q);fill-opacity:.16}
      ${P} .ff-bb.m .gs,${P} .ff-bb.m .ln{stroke:var(--muted)}
      ${P} .ff-bb.g .gs,${P} .ff-bb.g .ln{stroke:var(--good)}
      ${P} .ff-bb.g .gs{fill:var(--good);fill-opacity:.16}
      ${P} .ff-x{fill:none;stroke:var(--bad);stroke-width:2.6;stroke-linecap:round}
      ${P} .ff-cv rect{fill:var(--surface);stroke:var(--muted);stroke-width:1.8}
      ${P} .ff-cv text{font:700 24px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ff-tag .bx{fill:var(--surface);stroke:var(--q);stroke-width:2}
      ${P} .ff-tag .lb{fill:var(--surface);stroke:none}
      ${P} .ff-tag .lg{font:500 9.5px var(--mono);fill:var(--q)}
      ${P} .ff-tag .nm{font:600 12.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ff-tag.g .bx{stroke:var(--good)} ${P} .ff-tag.g .lg{fill:var(--good)}
    `,
    text: {
      hu: {
        name: "Az ismerős a jobb", shareTitle: "Miért néz ki mindig jobban a mi oldalunk, 30 másodpercben",
        ecline: "Az ismerős nem jelent jobbat, ezért a munkát ítéld meg, ne azt, aki csinálta.",
        us: "a te csapatod", them: "a másik csapat", same: "ugyanaz a munka", safe: "ismerős = biztonságos",
        traits: ["kreatív", "vicces", "nyugodt"], blur: "„mind ugyanaz”",
        check: "ugyanaz az ellenőrzőlista", crit: ["Érthető", "Pontos", "Hasznos"], cover: ["A", "B"],
        bias: "torzítás", fix: "a megoldás", tags: ["Csoporton belüli torzítás", "Csoporton kívüli homogenitás", "Nem itt találták ki", "Vak bírálat"], tw: [124, 196, 146, 120],
        caps: [
          "Két csapat ugyanazt a munkát adja be. Az egyik a tiétek.",
          "Az agyad rövidít: az <b>ismerős jobbnak tűnik</b>. Általában biztos fogadás.",
          "Ugyanaz a munka, mégis a te csapatod <b>9</b>-et kap, a másik <b>6</b>-ot.",
          "A saját embereid mind mások. A többiek? „<b>Mind ugyanolyanok.</b>”",
          "Aztán a másik csapat egy <b>jobb módot</b> javasol.",
          "A te csapatod elutasítja: <b>nem itt találták ki</b>. Egy jó ötlet elveszett.",
          "<b>A megoldás:</b> rejtsd el a neveket, és mindkettőt ugyanazzal az <b>ellenőrzőlistával</b> bíráld el.",
          "Vakon bírálva <b>egyenlő</b> lesz, és a legjobb ötlet nyer, <b>akárki hozta</b>."
        ],
        say: [
          "Két csapat ugyanazt a munkát adja be. Az egyik a tiétek.",
          "Az agyad rövidít: ami ismerős, az jobbnak érződik. Ez általában biztos fogadás, és nem kell mindent elölről megítélni.",
          "Mégis, ugyanaz a munka kilenest kap, ha a tiétek, és hatost, ha a másiké. Ez a csoporton belüli torzítás.",
          "A saját embereid mind mások, mindegyiknek megvan a maga erőssége. A többiek? Mind ugyanolyanok. Ez a csoporton kívüli homogenitás torzítása.",
          "Aztán a másik csapat egy jobb módot javasol.",
          "A te csapatod elutasítja: nem itt találták ki. Egy jó ötlet, amely csak attól veszett el, honnan jött.",
          "A megoldás: rejtsd el a neveket, és mindkettőt ugyanazzal az ellenőrzőlistával bíráld el.",
          "Vakon bírálva a munka egyenlő lesz, és a legjobb ötlet nyer, akárki hozta.",
          "Az ismerős a jobb. Vagy legalábbis úgy tűnik. Az ismerős nem jelent jobbat, ezért a munkát ítéld meg, ne azt, aki csinálta."
        ]
      },
      en: {
        name: "Familiar is better", shareTitle: "Why our side always looks better, in 30 seconds",
        ecline: "Familiar doesn't mean better, so judge the work, not who made it.",
        us: "your team", them: "other team", same: "same work", safe: "familiar = safe",
        traits: ["creative", "funny", "calm"], blur: "“all the same”",
        check: "same checklist", crit: ["Clear", "Accurate", "Useful"], cover: ["A", "B"],
        bias: "bias", fix: "the fix", tags: ["In-group bias", "Out-group homogeneity bias", "Not invented here", "Blind review"], tw: [124, 196, 146, 120],
        caps: [
          "Two teams hand in <b>the same work</b>. One of them is yours.",
          "Your brain takes a shortcut: <b>familiar feels better</b>. Usually, it's a safe bet.",
          "Same work, yet your team gets <b>9</b> and theirs gets <b>6</b>.",
          "Your people are all different. The others? “<b>All the same.</b>”",
          "Then the other team suggests a <b>better way</b> to do it.",
          "Your team waves it off: <b>not invented here</b>. A good idea, lost.",
          "<b>The fix:</b> hide the names and judge both on <b>the same checklist</b>.",
          "Judged blind, it's <b>level</b>, and the best idea wins, <b>whoever had it</b>."
        ],
        say: [
          "Two teams hand in the same work. One of them is yours.",
          "Your brain takes a shortcut: what's familiar feels better. Usually that's a safe bet, and it saves judging everything from scratch.",
          "Yet the same work gets a nine when it's your team's, and a six when it's theirs. That's in-group bias.",
          "Your people are all different, each with their own strengths. The others? All the same. That's out-group homogeneity bias.",
          "Then the other team suggests a better way to do it.",
          "Your team waves it off. Not invented here. A good idea, lost just because of where it came from.",
          "The fix: hide the names, and judge both on the same checklist.",
          "Judged blind, the work comes out level, and the best idea wins, whoever had it.",
          "Familiar is better. Or so it feels. Familiar doesn't mean better, so judge the work, not who made it."
        ]
      },
      el: {
        name: "Προτιμάμε το οικείο", shareTitle: "Γιατί ό,τι είναι δικό μας μάς φαίνεται πάντα καλύτερο, σε 30 δευτερόλεπτα",
        ecline: "Οικείο δεν σημαίνει καλύτερο, γι’ αυτό κρίνε τη δουλειά κι όχι ποιος την έκανε.",
        us: "η ομάδα σου", them: "η άλλη ομάδα", same: "ίδια δουλειά", safe: "οικείο = ασφαλές",
        traits: ["έμπνευση", "χιούμορ", "ηρεμία"], blur: "«όλοι ίδιοι»",
        check: "ίδια λίστα", crit: ["Σαφήνεια", "Ακρίβεια", "Χρησιμότητα"], cover: ["Α", "Β"],
        bias: "μεροληψία", fix: "η λύση", tags: ["Μεροληψία της ενδοομάδας", "Ομοιογένεια της εξωομάδας", "Δεν το φτιάξαμε εμείς", "Τυφλή αξιολόγηση"], tw: [196, 200, 174, 146],
        caps: [
          "Δύο ομάδες παραδίδουν <b>την ίδια δουλειά</b>. Η μία είναι η δική σου.",
          "Το μυαλό σου κόβει δρόμο: <b>το οικείο μοιάζει καλύτερο</b>. Και συνήθως δεν πέφτει έξω.",
          "Ίδια δουλειά, κι όμως η ομάδα σου παίρνει <b>9</b> και η άλλη <b>6</b>.",
          "Οι δικοί σου είναι όλοι διαφορετικοί. Οι άλλοι; «<b>Όλοι ίδιοι</b>».",
          "Μετά η άλλη ομάδα προτείνει <b>έναν καλύτερο τρόπο</b> να γίνει η δουλειά.",
          "Η ομάδα σου το απορρίπτει: «<b>δεν το φτιάξαμε εμείς</b>». Μια καλή ιδέα χάνεται.",
          "<b>Η λύση:</b> κρύψε τα ονόματα και κρίνε και τις δύο δουλειές με <b>την ίδια λίστα</b>.",
          "Χωρίς ονόματα βγαίνουν <b>ισάξιες</b>, και κερδίζει η καλύτερη ιδέα, <b>όποιου κι αν είναι</b>."
        ],
        say: [
          "Δύο ομάδες παραδίδουν την ίδια δουλειά. Η μία είναι η δική σου.",
          "Το μυαλό σου κόβει δρόμο: ό,τι είναι οικείο μοιάζει καλύτερο. Και συνήθως δεν πέφτει έξω. Σε γλιτώνει κιόλας από τον κόπο να κρίνεις τα πάντα από το μηδέν.",
          "Κι όμως, η ίδια δουλειά παίρνει εννιά όταν είναι της ομάδας σου, και έξι όταν είναι της άλλης. Λέγεται μεροληψία της ενδοομάδας.",
          "Οι δικοί σου είναι όλοι διαφορετικοί, ο καθένας με τα δικά του δυνατά σημεία. Οι άλλοι; Όλοι ίδιοι. Λέγεται ομοιογένεια της εξωομάδας.",
          "Μετά η άλλη ομάδα προτείνει έναν καλύτερο τρόπο να γίνει η δουλειά.",
          "Η ομάδα σου το απορρίπτει: δεν το φτιάξαμε εμείς. Μια καλή ιδέα χάνεται, μόνο και μόνο επειδή ήρθε από αλλού.",
          "Η λύση: κρύψε τα ονόματα, και κρίνε και τις δύο δουλειές με την ίδια λίστα ελέγχου.",
          "Χωρίς ονόματα, οι δύο δουλειές βγαίνουν ισάξιες, και κερδίζει η καλύτερη ιδέα, όποιου κι αν είναι.",
          "Προτιμάμε το οικείο. Όμως οικείο δεν σημαίνει καλύτερο, γι’ αυτό κρίνε τη δουλειά κι όχι ποιος την έκανε."
        ]
      },
      es: {
        name: "Lo familiar es mejor", shareTitle: "Por qué lo nuestro siempre parece mejor, en 30 segundos",
        ecline: "Familiar no significa mejor, así que juzga el trabajo, no a quien lo hizo.",
        us: "tu equipo", them: "otro equipo", same: "mismo trabajo", safe: "familiar = seguro",
        traits: ["ingenio", "humor", "calma"], blur: "«todos iguales»",
        check: "misma lista", crit: ["Claridad", "Precisión", "Utilidad"], cover: ["A", "B"],
        bias: "sesgo", fix: "solución", tags: ["Sesgo endogrupal", "Sesgo de homogeneidad exogrupal", "No inventado aquí", "Revisión a ciegas"], tw: [153, 234, 146, 170],
        caps: [
          "Dos equipos entregan <b>el mismo trabajo</b>. Uno de ellos es el tuyo.",
          "Tu cerebro toma un atajo: <b>lo familiar parece mejor</b>. Suele ser una apuesta segura.",
          "Mismo trabajo, pero tu equipo saca un <b>9</b> y el suyo, un <b>6</b>.",
          "Los tuyos son todos distintos. ¿Los otros? «<b>Todos iguales.</b>»",
          "Entonces el otro equipo propone una <b>forma mejor</b> de hacerlo.",
          "Tu equipo la descarta: <b>no se inventó aquí</b>. Una buena idea, perdida.",
          "<b>La solución:</b> oculta los nombres y evalúa ambos con <b>la misma lista</b>.",
          "A ciegas, quedan <b>igualados</b>, y gana la mejor idea, <b>sea de quien sea</b>."
        ],
        say: [
          "Dos equipos entregan el mismo trabajo. Uno de ellos es el tuyo.",
          "Tu cerebro toma un atajo: lo familiar parece mejor. Suele ser una apuesta segura, y te ahorra juzgarlo todo desde cero.",
          "Sin embargo, el mismo trabajo saca un nueve si es de tu equipo, y un seis si es del suyo. Es el sesgo endogrupal.",
          "Los tuyos son todos distintos, cada uno con sus puntos fuertes. ¿Los otros? Todos iguales. Es el sesgo de homogeneidad exogrupal.",
          "Entonces el otro equipo propone una forma mejor de hacerlo.",
          "Tu equipo la descarta. No se inventó aquí. Una buena idea, perdida solo por su origen.",
          "La solución: oculta los nombres, y evalúa ambos con la misma lista.",
          "Evaluado a ciegas, el trabajo queda igualado, y gana la mejor idea, sea de quien sea.",
          "Lo familiar es mejor. O eso parece. Familiar no significa mejor, así que juzga el trabajo, no a quien lo hizo."
        ]
      },
      fr: {
        name: "Préférer le familier", shareTitle: "Pourquoi notre camp semble toujours meilleur, en 30 secondes",
        ecline: "Familier ne veut pas dire meilleur, alors jugez le travail, pas son auteur.",
        us: "votre équipe", them: "l’autre équipe", same: "même travail", safe: "familier = sûr",
        traits: ["créatif", "drôle", "calme"], blur: "« tous pareils »",
        check: "même grille", crit: ["Clair", "Exact", "Utile"], cover: ["A", "B"],
        bias: "biais", fix: "solution", tags: ["Biais d’endogroupe", "Biais d’homogénéité de l’exogroupe", "Syndrome du « pas inventé ici »", "Évaluation à l’aveugle"], tw: [180, 242, 253, 209],
        caps: [
          "Deux équipes rendent <b>le même travail</b>. L’une d’elles est la vôtre.",
          "Raccourci du cerveau : <b>le familier semble meilleur</b>. C’est souvent un pari sûr.",
          "Même travail, et pourtant votre équipe a <b>9</b> et la leur <b>6</b>.",
          "Vos collègues sont tous différents. Les autres ? « <b>Tous pareils.</b> »",
          "Puis l’autre équipe propose une <b>meilleure façon</b> de faire.",
          "Votre équipe l’écarte : <b>pas inventé ici</b>. Une bonne idée, perdue.",
          "<b>La solution :</b> cachez les noms et jugez les deux sur <b>la même grille</b>.",
          "À l’aveugle, c’est <b>égal</b>, et la meilleure idée gagne, <b>peu importe qui l’a eue</b>."
        ],
        say: [
          "Deux équipes rendent le même travail. L’une d’elles est la vôtre.",
          "Votre cerveau prend un raccourci : ce qui est familier semble meilleur. En général, c’est un pari sûr, et ça évite de tout juger à partir de zéro.",
          "Pourtant, le même travail obtient un neuf quand c’est votre équipe, et un six quand c’est la leur. C’est le biais d’endogroupe.",
          "Vos collègues sont tous différents, chacun avec ses points forts. Les autres ? Tous pareils. C’est le biais d’homogénéité de l’exogroupe.",
          "Puis l’autre équipe propose une meilleure façon de faire.",
          "Votre équipe l’écarte. Pas inventé ici. Une bonne idée, perdue juste à cause de sa provenance.",
          "La solution : cachez les noms, et jugez les deux sur la même grille.",
          "Jugé à l’aveugle, le travail est à égalité, et la meilleure idée gagne, peu importe qui l’a eue.",
          "On préfère le familier. Pourtant, familier ne veut pas dire meilleur, alors jugez le travail, pas son auteur."
        ]
      },
      de: {
        name: "Vertrautes ist besser", shareTitle: "Warum unsere Seite immer besser aussieht, in 30 Sekunden",
        ecline: "Vertraut heißt nicht besser, also beurteile die Arbeit, nicht wer sie gemacht hat.",
        us: "dein Team", them: "anderes Team", same: "gleiche Arbeit", safe: "vertraut = sicher",
        traits: ["kreativ", "lustig", "ruhig"], blur: "„alle gleich“",
        check: "gleiche Checkliste", crit: ["Klar", "Korrekt", "Nützlich"], cover: ["A", "B"],
        bias: "Verzerrung", fix: "die Lösung", tags: ["Eigengruppen-Verzerrung", "Fremdgruppen-Homogenitätseffekt", "Not-invented-here-Syndrom", "Blinde Bewertung"], tw: [244, 245, 230, 173],
        caps: [
          "Zwei Teams geben <b>die gleiche Arbeit</b> ab. Eins davon ist deins.",
          "Dein Gehirn nimmt eine Abkürzung: <b>Vertrautes wirkt besser</b>. Meist ist das eine sichere Wette.",
          "Gleiche Arbeit, doch dein Team bekommt eine <b>9</b> und ihres eine <b>6</b>.",
          "Deine Leute sind alle verschieden. Die anderen? „<b>Alle gleich.</b>“",
          "Dann schlägt das andere Team einen <b>besseren Weg</b> vor.",
          "Dein Team winkt ab: <b>nicht bei uns erfunden</b>. Eine gute Idee, verloren.",
          "<b>Die Lösung:</b> Verdeck die Namen und bewerte beide mit <b>derselben Checkliste</b>.",
          "Blind bewertet steht es <b>gleich</b>, und die beste Idee gewinnt, <b>egal von wem</b>."
        ],
        say: [
          "Zwei Teams geben die gleiche Arbeit ab. Eins davon ist deins.",
          "Dein Gehirn nimmt eine Abkürzung: Was vertraut ist, wirkt besser. Meist ist das eine sichere Wette, und es erspart dir, alles von Grund auf zu beurteilen.",
          "Doch die gleiche Arbeit bekommt eine Neun, wenn sie von deinem Team ist, und eine Sechs, wenn sie von ihrem ist. Das ist die Eigengruppen-Verzerrung.",
          "Deine Leute sind alle verschieden, jeder mit eigenen Stärken. Die anderen? Alle gleich. Das ist der Fremdgruppen-Homogenitätseffekt.",
          "Dann schlägt das andere Team einen besseren Weg vor.",
          "Dein Team winkt ab. Das Not-invented-here-Syndrom: nicht bei uns erfunden. Eine gute Idee, verloren, nur weil sie von woanders kam.",
          "Die Lösung: Verdeck die Namen, und bewerte beide mit derselben Checkliste.",
          "Blind bewertet steht die Arbeit gleich, und die beste Idee gewinnt, egal von wem sie kam.",
          "Vertrautes ist besser. So fühlt es sich jedenfalls an. Vertraut heißt nicht besser, also beurteile die Arbeit, nicht wer sie gemacht hat."
        ]
      },
      it: {
        name: "Meglio il familiare", shareTitle: "Perché la nostra parte sembra sempre migliore, in 30 secondi",
        ecline: "Familiare non vuol dire migliore, quindi giudica il lavoro, non chi l’ha fatto.",
        us: "la tua squadra", them: "l’altra squadra", same: "stesso lavoro", safe: "familiare = sicuro",
        traits: ["fantasia", "spirito", "calma"], blur: "«tutti uguali»",
        check: "stessa lista", crit: ["Chiaro", "Preciso", "Utile"], cover: ["A", "B"],
        bias: "bias", fix: "soluzione", tags: ["Bias dell’ingroup", "Omogeneità dell’outgroup", "Sindrome del «non inventato qui»", "Valutazione alla cieca"], tw: [155, 196, 270, 209],
        caps: [
          "Due squadre consegnano <b>lo stesso lavoro</b>. Una delle due è la tua.",
          "Il cervello prende una scorciatoia: <b>il familiare sembra migliore</b>. Di solito funziona.",
          "Stesso lavoro, eppure la tua squadra prende <b>9</b> e la loro <b>6</b>.",
          "I tuoi sono tutti diversi. Gli altri? «<b>Tutti uguali.</b>»",
          "Poi l’altra squadra propone un <b>modo migliore</b> di farlo.",
          "La tua squadra lo scarta: <b>non inventato qui</b>. Una buona idea, persa.",
          "<b>La soluzione:</b> nascondi i nomi e giudica entrambi con <b>la stessa lista</b>.",
          "Alla cieca, finisce <b>pari</b>, e vince l’idea migliore, <b>di chiunque sia</b>."
        ],
        say: [
          "Due squadre consegnano lo stesso lavoro. Una delle due è la tua.",
          "Il cervello prende una scorciatoia: ciò che è familiare sembra migliore. Di solito è una scommessa sicura, e ti risparmia di giudicare tutto da zero.",
          "Eppure lo stesso lavoro prende nove quando è della tua squadra, e sei quando è della loro. È il bias dell’ingroup.",
          "I tuoi sono tutti diversi, ognuno con i suoi punti di forza. Gli altri? Tutti uguali. È l’omogeneità dell’outgroup.",
          "Poi l’altra squadra propone un modo migliore di farlo.",
          "La tua squadra lo scarta. Non inventato qui. Una buona idea, persa solo per la sua provenienza.",
          "La soluzione: nascondi i nomi, e giudica entrambi con la stessa lista.",
          "Alla cieca, il lavoro finisce pari, e vince l’idea migliore, di chiunque sia.",
          "Meglio il familiare. O così sembra. Familiare non vuol dire migliore, quindi giudica il lavoro, non chi l’ha fatto."
        ]
      }
    },
    svg(T) {
      const people = [0, 1, 2].map(i => person("p" + i, i)).join("");
      const theirs = [0, 2, 1].map(i => person("t" + i, i)).join("");   // the middle one in front when they bunch up
      const traits = T.traits.map((t, i) => `<text class="ff-lb" data-k="tr${i}" x="${LX + (i - 1) * DX}" y="104">${t}</text>`).join("");
      const crit = T.crit.map((c, i) => `<text class="ff-cr" data-k="cr${i}" x="200" y="${ROW[i] + 4}">${c}</text>`).join("");
      const tags = T.tags.map((t, j) => {
        const w = T.tw[j], x = 200 - w / 2, lg = j === 3 ? T.fix : T.bias;
        return `<g class="ff-tag${j === 3 ? " g" : ""}" data-k="tag${j}"><rect class="bx" x="${x}" y="${TY}" width="${w}" height="${TH}" rx="8"/>
          <rect class="lb" x="${x + 7}" y="${TY - 3}" width="${f1(lg.length * 5.7 + 6)}" height="6"/><text class="lg" x="${x + 10}" y="${TY + 3.4}">${lg}</text><text class="nm" x="200" y="${TY + 18.5}">${t}</text></g>`;
      }).join("");
      const cover = (key, x, letter) => `<g class="ff-cv" data-k="${key}"><rect x="${x - 78}" y="34" width="156" height="80" rx="12"/><text x="${x}" y="83">${letter}</text></g>`;
      return `
        <rect class="ff-glow" data-k="glow" x="${GX}" y="${GT}" width="${GW}" height="${GH0}" rx="16"/>
        <line class="ff-edge" data-k="edge" x1="${GX + GW}" y1="${GT + 10}" x2="${GX + GW}" y2="${GT + GH0 - 10}"/>
        <path class="ff-spk" data-k="spk" d="${star(37, 138, 6)} ${star(163, 150, 5)} ${star(36, 186, 4.5)}"/>
        <text class="ff-team q" data-k="lu" x="${LX}" y="22">${T.us}</text><text class="ff-team" data-k="lt" x="${RX}" y="22">${T.them}</text>
        ${people}${theirs}
        <text class="ff-lb" data-k="safe" x="${LX}" y="104">${T.safe}</text>
        ${traits}
        <text class="ff-lb m" data-k="blur" x="${RX}" y="104">${T.blur}</text>
        ${report("L", LX - CW / 2)}${report("R", RX - CW / 2)}
        <g class="ff-eq" data-k="eq"><line x1="189" x2="211" y1="151" y2="151"/><line x1="189" x2="211" y1="158" y2="158"/><text class="ff-lb" x="200" y="176">${T.same}</text></g>
        <text class="ff-chk" data-k="chk" x="200" y="${CT + 18}">${T.check}</text>${crit}
        ${cover("cvA", LX, T.cover[0])}${cover("cvB", RX, T.cover[1])}
        <g data-k="bulb"><g data-k="bq">${bulb("q", true)}</g><g data-k="bm">${bulb("m", false)}</g><g data-k="bg">${bulb("g", true)}</g>
          <path class="ff-x" data-k="bx" d="M-6 -11 L6 1 M6 -11 L-6 1"/></g>
        ${tags}`;
    },
    S0: { teams: 0, cards: 0, eq: 0, glow: 0, glowH: 0, glowOff: 0, safe: 0, sa: 0, spark: 0,
      traits: 0, tOff: 0, blur: 0, blurL: 0, bulb: 0, fly: 0, back: 0, dim: 0, edge: 0, xm: 0, adopt: 0,
      cover: 0, crit: 0, ticks: 0, good: 0, tg0: 0, tg1: 0, tg2: 0, tg3: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = +cl(v).toFixed(3); };
      const tr = (key, x, y, extra) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)})${extra || ""}`);
      const pop = (key, v, cx, cy) => {   // scale in around (cx, cy)
        const s = f1((.6 + .4 * Math.max(0, v)) * 100) / 100;
        k(key).setAttribute("transform", `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`);
        op(key, v * 1.6);
      };
      // the two teams; theirs bunch up, lose their looks and fade to grey when they blur together
      const rise = 6 * (1 - S.teams);
      op("lu", S.teams * (1 - S.cover)); op("lt", S.teams * (1 - S.cover));
      for (let i = 0; i < 3; i++) {
        tr("p" + i, LX + (i - 1) * DX, HY + rise); op("p" + i, S.teams);
        tr("t" + i, RX + (i - 1) * DX * (1 - .56 * S.blur), HY + rise); op("t" + i, S.teams);
        k("t" + i + "c").style.color = `color-mix(in srgb, var(--muted) ${Math.round(100 * S.blur)}%, var(--ink))`;
        op("t" + i + "f", 1 - S.blur);
        op("tr" + i, cl(S.traits - i) * (1 - S.tOff));
      }
      op("safe", S.safe); op("blur", S.blurL);
      // the warm glow of the familiar: round your team, then down over its work
      k("glow").setAttribute("height", f1(lerp(GH0, GH1, S.glowH)));
      op("glow", S.glow * (1 - S.glowOff));
      op("edge", S.edge * (1 - S.glowOff));
      op("spk", S.spark * (1 - S.glowOff));
      // the same work on both sides, and its scores
      for (const s of ["L", "R"]) { tr("cd" + s, 0, 6 * (1 - S.cards)); op("cd" + s, S.cards); }
      op("eq", S.eq);
      const bx = [LX + CW / 2 - 17, RX + CW / 2 - 17], by = CT + 16;
      pop("bL", S.sa, bx[0], by); pop("bR", S.sa, bx[1], by);
      const vL = Math.round(lerp(9, 8, S.good)), vR = Math.round(lerp(6, 8, S.good));
      k("bLov").textContent = vL; k("bLgv").textContent = vL;
      k("bRov").textContent = vR; k("bRgv").textContent = vR;
      op("bLo", 1 - S.good); op("bLg", S.good); op("bRo", 1 - S.good); op("bRg", S.good);
      // the fix: one checklist for both, ticked row by row on each card
      op("chk", S.crit);
      for (let i = 0; i < 3; i++) {
        op("cr" + i, cl(S.crit * 3 - i));
        op("kL" + i, cl(S.ticks - i)); op("kR" + i, cl(S.ticks - i));
      }
      for (const [key, x] of [["cvA", LX], ["cvB", RX]]) { op(key, S.cover); tr(key, 0, -8 * (1 - S.cover)); }
      // their idea: pops up, flies at your team, bounces off, goes grey; wins in the end
      const u = cl(S.bulb), x0 = lerp(BIN[0], B0[0], u), y0 = lerp(BIN[1], B0[1], u);
      const x1 = lerp(x0, BHIT[0], S.fly), y1 = lerp(y0, BHIT[1], S.fly);
      const x2 = lerp(x1, BOUT[0], S.back), y2 = lerp(y1, BOUT[1], S.back);
      const bxp = lerp(x2, BWIN[0], S.adopt), byp = lerp(y2, BWIN[1], S.adopt);
      tr("bulb", bxp, byp, ` scale(${f1(BS * (.6 + .4 * Math.max(0, S.bulb)) * 100) / 100})`);
      op("bulb", S.bulb * 1.6);
      op("bq", (1 - S.dim) * (1 - S.adopt)); op("bm", S.dim * (1 - S.adopt)); op("bg", S.adopt);
      op("bx", S.xm);
      // the name tags
      for (let j = 0; j < 4; j++) { const v = S["tg" + j]; op("tag" + j, v * 1.4); tr("tag" + j, 0, 6 * (1 - cl(v))); }
    },
    beats: [
      { steps: [{ to: { teams: 1 }, ms: 600, sfx: "pluck" }, { to: { cards: 1 }, ms: 500 }, { to: { eq: 1 }, ms: 400 }], hold: 2400 },
      { steps: [{ to: { glow: 1 }, ms: 700 }, { wait: 250 }, { to: { safe: 1 }, ms: 400, sfx: "tick" }], hold: 2800 },
      { steps: [{ to: { glowH: 1 }, ms: 1000, ease: "inOut", sfx: "whoosh" }, { to: { sa: 1, spark: 1 }, ms: 450, ease: "out", sfx: "pop" },
        { wait: 400 }, { to: { tg0: 1 }, ms: 450 }], hold: 2800 },
      { steps: [{ to: { tg0: 0, safe: 0 }, ms: 300 }, { to: { traits: 3 }, ms: 750, ease: "lin", sfx: "tick" }, { wait: 250 },
        { to: { blur: 1 }, ms: 800, ease: "inOut" }, { to: { blurL: 1 }, ms: 300 }, { wait: 200 }, { to: { tg1: 1 }, ms: 450 }], hold: 2800 },
      { steps: [{ to: { tg1: 0 }, ms: 300 }, { to: { bulb: 1 }, ms: 600, ease: "out", sfx: "pop" }], hold: 2200 },
      { steps: [{ to: { fly: 1 }, ms: 650, ease: "inOut" }, { to: { edge: 1 }, ms: 100 }, { to: { back: 1, dim: 1 }, ms: 700, ease: "out", sfx: "spring" },
        { to: { edge: .7, xm: 1 }, ms: 350 }, { wait: 250 }, { to: { tg2: 1 }, ms: 450 }], hold: 2800 },
      { steps: [{ to: { tg2: 0, glowOff: 1 }, ms: 500 }, { to: { cover: 1, tOff: 1, blurL: 0, eq: 0 }, ms: 550, ease: "out" },
        { to: { crit: 1 }, ms: 500 }, { to: { ticks: 3 }, ms: 1000, ease: "lin", sfx: "scribble" }, { to: { tg3: 1 }, ms: 450 }], hold: 2800 },
      { steps: [{ to: { good: 1 }, ms: 900, ease: "inOut" }, { to: { cover: 0, blur: 0 }, ms: 800, ease: "inOut" },
        { to: { xm: 0 }, ms: 250 }, { to: { adopt: 1 }, ms: 700, ease: "out", sfx: "chime" }], hold: 4200 }
    ]
  };
})();
