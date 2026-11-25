/* Spotlight effect: a coffee stain, a room of ten, and a spotlight that only you can see.
   Everyone else is busy with their own thoughts, under their own small light. Scene for anim.js. */
(function () {
  const KEY = "spotlight-effect", P = `.bp[data-scene="${KEY}"]`;
  const FY = 234, X0 = 200, XS = 92;              // your feet line, where you stand, where you start
  const SX = 2, SY = -44;                          // the stain, relative to your feet
  const STX = X0 + SX, STY = FY + SY;              // ...and where it is once you stand in the middle
  const LX = 200, LY = 20;                         // the big lamp
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const lerp = (a, b, t) => a + (b - a) * t;
  const walkE = p => (3 * p - p * p * p) / 2;      // walk in briskly, slow to a stop
  const bump = p => cl(Math.min(p, 1 - p) * 14);   // 1 while walking, 0 when standing
  const back = t => { const u = t - 1; return 1 + 2.9 * u * u * u + 1.9 * u * u; };

  // ten people in an arc around you: head centre and thought-bubble centre (left half, mirrored for the right)
  const LEFT = [[28, 191, 61, 186], [37, 143, 70, 147], [59, 110, 59, 79], [89, 81, 89, 50], [125, 61, 125, 30]];
  const PPL = [...LEFT, ...LEFT.map(([x, y, bx, by]) => [400 - x, y, 400 - bx, by])];
  const ORDER = [0, 1, 2, 3, 4, 9, 8, 7, 6, 5];    // left to right around the arc
  const NOTICE = [2, 6];                           // the two who really noticed
  const AWAY = [0, 8];                             // the two you don't even imagine looking
  const BUSY = ORDER.filter(i => !NOTICE.includes(i));
  const LOOK = ORDER.filter(i => !AWAY.includes(i));
  const ICONS = ["phone", "notes", "chart", "clock", "tee", "home", "cal", "euro", "cup", "mail"];

  const ICON = {
    phone: `<rect x="-3.6" y="-6" width="7.2" height="12" rx="1.6"/><path d="M-1.1 3.4 H1.1"/>`,
    notes: `<rect x="-4.6" y="-5.8" width="9.2" height="11.6" rx="1.2"/><path d="M-2.3 -2.6 H2.3 M-2.3 0 H2.3 M-2.3 2.6 H0.6"/>`,
    chart: `<path d="M-5.6 5 H5.6 M-3 5 V1 M0 5 V-4.6 M3 5 V-1.6"/>`,
    clock: `<circle r="5.7"/><path d="M0 -3.2 V0 L2.4 1.6"/>`,
    tee: `<path d="M-2.6 -5.3 L-6.3 -3.2 L-4.8 -0.2 L-3.5 -0.9 V5.5 H3.5 V-0.9 L4.8 -0.2 L6.3 -3.2 L2.6 -5.3 Q0 -3.4 -2.6 -5.3 Z"/><circle class="st" cx="0.9" cy="1.8" r="1.8"/>`,
    home: `<path d="M-6 0.2 L0 -5.4 L6 0.2 M-4.2 -1.4 V5.4 H4.2 V-1.4 M-1.3 5.4 V2 H1.3 V5.4"/>`,
    cal: `<rect x="-5.4" y="-4.2" width="10.8" height="9.8" rx="1.3"/><path d="M-5.4 -1 H5.4 M-2.6 -6 V-2.8 M2.6 -6 V-2.8"/>`,
    euro: `<text y="4.3">€</text>`,
    cup: `<path d="M-4.8 -3.2 H3 V1.6 Q3 4.8 -0.9 4.8 Q-4.8 4.8 -4.8 1.6 Z M3 -1.6 Q5.9 -1.6 5.9 0.4 Q5.9 2.4 3 2.4 M-2.4 -5.8 V-6.4 M0.6 -5.8 V-6.4"/>`,
    mail: `<rect x="-5.9" y="-4.2" width="11.8" height="8.4" rx="1.2"/><path d="M-5.2 -3.3 L0 0.7 L5.2 -3.3"/>`
  };
  // a simple person, head and shoulders
  const bust = (i, x, y) => `<g class="sp-p" data-k="p${i}"><path d="M${x - 13} ${y + 25} V${y + 21} C${x - 13} ${y + 14} ${x - 7} ${y + 10.5} ${x} ${y + 10.5} C${x + 7} ${y + 10.5} ${x + 13} ${y + 14} ${x + 13} ${y + 21} V${y + 25}"/>` +
    `<circle cx="${x}" cy="${y}" r="6.5"/><circle class="e" cx="${x - 2.4}" cy="${y - .5}" r="1"/><circle class="e" cx="${x + 2.4}" cy="${y - .5}" r="1"/></g>`;
  // their own thought, with two small dots trailing back to the head
  const bubble = (i, x, y, bx, by) => {
    const dx = bx - x, dy = by - y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, d1 = 9.6, d2 = L - 14.6;
    return `<g class="sp-b" data-k="b${i}"><circle class="t" cx="${f1(x + ux * d1)}" cy="${f1(y + uy * d1)}" r="1.4"/><circle class="t" cx="${f1(x + ux * d2)}" cy="${f1(y + uy * d2)}" r="2.1"/>` +
      `<circle class="bb" cx="${bx}" cy="${by}" r="11"/><g class="ic" transform="translate(${bx} ${by})">${ICON[ICONS[i]]}</g></g>`;
  };
  // you, standing on (0, 0): legs and arms redrawn every frame, body and head
  const you = s => `<g class="sp-you${s}" data-k="you${s}"><path class="lm" data-k="legs${s}"/><path class="lm" data-k="arms${s}"/>` +
    `<path class="b" d="M-13 -26 V-49 Q-13 -61 0 -61 Q13 -61 13 -49 V-26 Z"/><circle class="b" cy="-72" r="8.5"/></g>`;
  // where a line of sight starts: the edge of the head, facing the stain
  const eye = i => { const [x, y] = PPL[i], dx = STX - x, dy = STY - y, L = Math.hypot(dx, dy); return [x + dx / L * 9, y + dy / L * 9]; };

  window.BiasAnim.SCENES[KEY] = {
    q: "nem", viewBox: "0 0 400 272",
    css: `
      ${P} .sp-cone{fill:var(--q);fill-opacity:.15}
      ${P} .sp-pool{fill:var(--q);fill-opacity:.24}
      ${P} .sp-cone.g,${P} .sp-pool.g{fill:var(--good)}
      ${P} .sp-mini{fill:var(--q);fill-opacity:.17}
      ${P} .sp-ml{fill:var(--surface);stroke:var(--q);stroke-width:1.6;stroke-linejoin:round}
      ${P} .sp-lamp{fill:var(--surface);stroke:var(--q);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
      ${P} .sp-lamp.g{stroke:var(--good)}
      ${P} .sp-lb{font:500 10px var(--mono);fill:var(--q)}
      ${P} .sp-look{stroke:var(--q);stroke-width:1.8;stroke-dasharray:2.5 4;stroke-linecap:round}
      ${P} .sp-real{stroke:var(--ink);stroke-width:2;stroke-linecap:round}
      ${P} .sp-p path,${P} .sp-p circle{fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .sp-p .e{fill:var(--ink);stroke:none}
      ${P} .sp-b .bb{fill:var(--surface);stroke:var(--muted);stroke-width:1.6}
      ${P} .sp-b .t{fill:var(--surface);stroke:var(--muted);stroke-width:1.4}
      ${P} .sp-b .ic *{fill:none;stroke:var(--ink);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
      ${P} .sp-b .ic text{fill:var(--ink);stroke:none;font:700 12px var(--display);text-anchor:middle}
      ${P} .sp-b .ic .st{fill:var(--bad);stroke:none}
      ${P} .sp-youI .b{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .sp-youI .lm{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round}
      ${P} .sp-youG .b{fill:var(--surface);stroke:var(--good);stroke-width:2.2;stroke-linejoin:round}
      ${P} .sp-youG .lm{fill:none;stroke:var(--good);stroke-width:2.2;stroke-linecap:round}
      ${P} .sp-stain{fill:var(--bad)}
      ${P} .sp-cup path{fill:var(--surface);stroke:var(--ink);stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round}
      ${P} .sp-cup .h{fill:none}
      ${P} .sp-ct rect{fill:var(--surface);stroke:var(--muted);stroke-width:1.6}
      ${P} .sp-ct .l{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .sp-ct .v{font:700 14px var(--display);fill:var(--ink)}
      ${P} .sp-ct .v.q{fill:var(--q)}
      ${P} .sp-tee{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .sp-face circle,${P} .sp-face path{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round}
      ${P} .sp-face .ey{fill:var(--q);stroke:none}
      ${P} .sp-sl{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .sp-bl{font:500 10px var(--mono);fill:var(--muted)}
      ${P} .sp-bar{fill:var(--q)}
      ${P} .sp-bar.n{fill:var(--muted)}
      ${P} .sp-guide{stroke:var(--faint);stroke-width:1.4;stroke-dasharray:2 3;stroke-linecap:round}
      ${P} .sp-br{fill:none;stroke:var(--bad);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .sp-brt{font:600 10px var(--mono);fill:var(--bad);text-anchor:middle}
    `,
    text: {
      hu: {
        name: "Reflektorfény-hatás", shareTitle: "A reflektorfény-hatás, 30 másodpercben",
        ecline: "Sokkal kevesebben veszik észre rajtad, mint hiszed. Mindenki a saját reflektorfényével van elfoglalva.",
        spot: "reflektorfény", think: "azt hiszed", actual: "valójában", v8: "10-ből 8", v2: "10-ből 2",
        shirt: ["kínos póló"], guessed: "tippelted", noticed: "észrevette", fewer: "jóval kevesebben",
        caps: [
          "Egy értekezlet előtt kiöntöd a kávét az ingedre.",
          "Belépsz, és úgy érzed, <b>reflektorfény</b> van rajtad.",
          "Biztos, hogy <b>mindenki</b> a foltot nézi.",
          "Valójában a legtöbben a <b>saját</b> gondjaikkal vannak elfoglalva.",
          "Csak <b>ketten</b> vették egyáltalán észre.",
          "Egy klasszikus kísérletben <b>jóval kevesebben</b> vették észre, mint amennyire tippelték.",
          "<b>A megoldás:</b> emlékezz rá, hogy mindenki más is a saját reflektorfényében áll.",
          "Vegyél egy mély levegőt, és folytasd. <b>Alig látta valaki.</b>"
        ],
        say: [
          "Egy értekezlet előtt kiöntöd a kávét az ingedre.",
          "Belépsz, és úgy érzed, reflektorfény van rajtad.",
          "Biztos, hogy mindenki a foltot nézi.",
          "Valójában a legtöbben a saját gondjaikkal vannak elfoglalva. A telefonjukkal, a jegyzeteikkel, még a saját foltjukkal is.",
          "Csak ketten vették egyáltalán észre.",
          "Egy klasszikus kísérletben a diákok kínos pólóban léptek be egy terembe. Jóval kevesebben vették észre, mint amennyire tippelték.",
          "A megoldás: emlékezz rá, hogy mindenki más is a saját reflektorfényében áll.",
          "Vegyél egy mély levegőt, és folytasd. Alig látta valaki.",
          "A reflektorfény-hatás. Sokkal kevesebben veszik észre rajtad, mint hiszed. Mindenki a saját reflektorfényével van elfoglalva."
        ]
      },
      en: {
        name: "Spotlight effect", shareTitle: "Spotlight effect, explained in 30 seconds",
        ecline: "You're far less noticed than you feel. Everyone's busy with their own spotlight.",
        spot: "spotlight", think: "you think", actual: "actually", v8: "8 of 10", v2: "2 of 10",
        shirt: ["embarrassing T-shirt"], guessed: "guessed", noticed: "noticed", fewer: "far fewer",
        caps: [
          "You spill coffee on your shirt, right before a meeting.",
          "You walk in, and it feels like a <b>spotlight</b> is on you.",
          "Surely <b>everyone</b> is looking at the stain.",
          "In fact, most are busy with <b>their own</b> worries.",
          "Only <b>two</b> of them even noticed.",
          "In a classic study, <b>far fewer</b> people noticed than guessed.",
          "<b>The fix:</b> remember everyone else is in their own spotlight.",
          "Take a breath and carry on. <b>Hardly anyone saw.</b>"
        ],
        say: [
          "You spill coffee on your shirt, right before a meeting.",
          "You walk in, and it feels like a spotlight is on you.",
          "Surely everyone is looking at the stain.",
          "In fact, most are busy with their own worries. Their phone, their notes, even a stain of their own.",
          "Only two of them even noticed.",
          "In a classic study, students walked into a room wearing an embarrassing T-shirt. Far fewer people noticed it than they guessed.",
          "The fix: remember that everyone else is in their own spotlight.",
          "Take a breath and carry on. Hardly anyone saw.",
          "The spotlight effect. You're far less noticed than you feel. Everyone's busy with their own spotlight."
        ]
      },
      el: {
        name: "Φαινόμενο του προβολέα", shareTitle: "Το φαινόμενο του προβολέα σε 30 δευτερόλεπτα",
        ecline: "Σε προσέχουν πολύ λιγότερο απ’ όσο νιώθεις. Ο καθένας έχει τον δικό του προβολέα.",
        spot: "προβολέας", think: "νομίζεις", actual: "στην πραγματικότητα", v8: "8 στους 10", v2: "2 στους 10",
        shirt: ["ντροπιαστικό", "μπλουζάκι"], guessed: "περίμεναν", noticed: "πρόσεξαν", fewer: "πολύ λιγότεροι",
        caps: [
          "Χύνεις καφέ στο πουκάμισό σου λίγο πριν από μια σύσκεψη.",
          "Μπαίνεις μέσα και νιώθεις σαν να σε φωτίζει <b>προβολέας</b>.",
          "Σίγουρα <b>όλοι</b> κοιτάνε τον λεκέ.",
          "Στην πραγματικότητα, οι περισσότεροι έχουν το μυαλό τους <b>στα δικά τους</b>.",
          "Μόνο <b>δύο</b> το πρόσεξαν στ’ αλήθεια.",
          "Σε ένα κλασικό πείραμα, το πρόσεξαν <b>πολύ λιγότεροι</b> απ’ όσους περίμεναν.",
          "<b>Η λύση:</b> θυμήσου ότι ο καθένας έχει τον δικό του προβολέα.",
          "Πάρε μια ανάσα και συνέχισε. <b>Σχεδόν κανείς δεν το είδε.</b>"
        ],
        say: [
          "Χύνεις καφέ στο πουκάμισό σου, λίγο πριν από μια σύσκεψη.",
          "Μπαίνεις μέσα, και νιώθεις σαν να σε φωτίζει προβολέας.",
          "Σίγουρα όλοι κοιτάνε τον λεκέ.",
          "Στην πραγματικότητα, οι περισσότεροι έχουν το μυαλό τους στα δικά τους. Στο κινητό, στις σημειώσεις, ακόμα και σε κάποιον δικό τους λεκέ.",
          "Μόνο δύο το πρόσεξαν στ’ αλήθεια.",
          "Σε ένα κλασικό πείραμα, φοιτητές μπήκαν σε μια αίθουσα φορώντας ένα ντροπιαστικό μπλουζάκι. Το πρόσεξαν πολύ λιγότεροι απ’ όσους περίμεναν.",
          "Η λύση: θυμήσου ότι ο καθένας έχει τον δικό του προβολέα.",
          "Πάρε μια ανάσα και συνέχισε. Σχεδόν κανείς δεν το είδε.",
          "Φαινόμενο του προβολέα. Σε προσέχουν πολύ λιγότερο απ’ όσο νιώθεις. Ο καθένας έχει τον δικό του προβολέα."
        ]
      },
      es: {
        name: "Efecto foco", shareTitle: "El efecto foco en 30 segundos",
        ecline: "Te miran mucho menos de lo que sientes. Cada uno está ocupado con su propio foco.",
        spot: "foco", think: "crees", actual: "en realidad", v8: "8 de 10", v2: "2 de 10",
        shirt: ["camiseta vergonzosa"], guessed: "estimaron", noticed: "lo notaron", fewer: "muchos menos",
        caps: [
          "Se te cae café en la camisa justo antes de una reunión.",
          "Entras y sientes que un <b>foco</b> te ilumina.",
          "Seguro que <b>todos</b> están mirando la mancha.",
          "En realidad, casi todos están ocupados con <b>sus propias</b> preocupaciones.",
          "Solo <b>dos</b> se han dado cuenta.",
          "En un estudio clásico, se fijaron <b>muchas menos</b> personas de lo que se creía.",
          "<b>La solución:</b> recuerda que cada uno está bajo su propio foco.",
          "Respira y sigue. <b>Casi nadie lo vio.</b>"
        ],
        say: [
          "Se te cae café en la camisa justo antes de una reunión.",
          "Entras y sientes que un foco te ilumina.",
          "Seguro que todos están mirando la mancha.",
          "En realidad, casi todos están ocupados con sus propias preocupaciones. Su teléfono, sus notas, incluso una mancha propia.",
          "Solo dos se han dado cuenta.",
          "En un estudio clásico, unos estudiantes entraron en una sala con una camiseta vergonzosa. Se fijaron en ella muchas menos personas de lo que ellos creían.",
          "La solución: recuerda que cada uno está bajo su propio foco.",
          "Respira y sigue. Casi nadie lo vio.",
          "El efecto foco. Te miran mucho menos de lo que sientes. Cada uno está ocupado con su propio foco."
        ]
      },
      fr: {
        name: "Effet projecteur", shareTitle: "L’effet projecteur en 30 secondes",
        ecline: "On vous remarque bien moins que vous ne le croyez. Chacun est occupé par son propre projecteur.",
        spot: "projecteur", think: "vous pensez", actual: "en réalité", v8: "8 sur 10", v2: "2 sur 10",
        shirt: ["T-shirt gênant"], guessed: "estimé", noticed: "remarqué", fewer: "bien moins",
        caps: [
          "Vous renversez du café sur votre chemise juste avant une réunion.",
          "Vous entrez, et vous avez l’impression d’être sous un <b>projecteur</b>.",
          "Sûrement, <b>tout le monde</b> regarde la tache.",
          "En fait, la plupart sont pris par <b>leurs propres</b> soucis.",
          "Seuls <b>deux</b> d’entre eux l’ont remarquée.",
          "Dans une étude classique, <b>bien moins</b> de gens l’ont remarqué que prévu.",
          "<b>La solution :</b> rappelez-vous que chacun est sous son propre projecteur.",
          "Respirez et continuez. <b>Presque personne n’a rien vu.</b>"
        ],
        say: [
          "Vous renversez du café sur votre chemise juste avant une réunion.",
          "Vous entrez, et vous avez l’impression d’être sous un projecteur.",
          "Sûrement, tout le monde regarde la tache.",
          "En fait, la plupart sont pris par leurs propres soucis. Leur téléphone, leurs notes, et même une tache à eux.",
          "Seuls deux d’entre eux l’ont remarquée.",
          "Dans une étude classique, des étudiants entraient dans une salle avec un T-shirt gênant. Bien moins de gens l’ont remarqué qu’ils ne l’avaient prévu.",
          "La solution : rappelez-vous que chacun est sous son propre projecteur.",
          "Respirez et continuez. Presque personne n’a rien vu.",
          "L’effet projecteur. On vous remarque bien moins que vous ne le croyez. Chacun est occupé par son propre projecteur."
        ]
      },
      de: {
        name: "Spotlight-Effekt", shareTitle: "Der Spotlight-Effekt in 30 Sekunden",
        ecline: "Du fällst viel weniger auf, als du denkst. Alle sind mit ihrem eigenen Scheinwerfer beschäftigt.",
        spot: "Scheinwerfer", think: "du denkst", actual: "tatsächlich", v8: "8 von 10", v2: "2 von 10",
        shirt: ["peinliches T-Shirt"], guessed: "geschätzt", noticed: "bemerkt", fewer: "viel weniger",
        caps: [
          "Du kippst dir kurz vor einem Meeting Kaffee aufs Hemd.",
          "Du gehst hinein, und es fühlt sich an, als wäre ein <b>Scheinwerfer</b> auf dich gerichtet.",
          "Bestimmt starren <b>alle</b> auf den Fleck.",
          "Dabei sind die meisten mit <b>ihren eigenen</b> Sorgen beschäftigt.",
          "Nur <b>zwei</b> haben ihn überhaupt bemerkt.",
          "In einer klassischen Studie bemerkten es <b>viel weniger</b> Leute als geschätzt.",
          "<b>Die Lösung:</b> Denk daran, dass alle anderen in ihrem eigenen Scheinwerferlicht stehen.",
          "Atme durch und mach weiter. <b>Kaum jemand hat’s gesehen.</b>"
        ],
        say: [
          "Du kippst dir kurz vor einem Meeting Kaffee aufs Hemd.",
          "Du gehst hinein, und es fühlt sich an, als wäre ein Scheinwerfer auf dich gerichtet.",
          "Bestimmt starren alle auf den Fleck.",
          "Dabei sind die meisten mit ihren eigenen Sorgen beschäftigt. Ihrem Handy, ihren Notizen, sogar einem eigenen Fleck.",
          "Nur zwei haben ihn überhaupt bemerkt.",
          "In einer klassischen Studie betraten Studierende einen Raum in einem peinlichen T-Shirt. Viel weniger Leute bemerkten es, als sie geschätzt hatten.",
          "Die Lösung: Denk daran, dass alle anderen in ihrem eigenen Scheinwerferlicht stehen.",
          "Atme durch und mach weiter. Kaum jemand hat’s gesehen.",
          "Der Spotlight-Effekt. Du fällst viel weniger auf, als du denkst. Alle sind mit ihrem eigenen Scheinwerfer beschäftigt."
        ]
      },
      it: {
        name: "Effetto riflettore", shareTitle: "L’effetto riflettore in 30 secondi",
        ecline: "Gli altri ti notano molto meno di quanto credi. Ognuno è preso dal proprio riflettore.",
        spot: "riflettore", think: "pensi", actual: "in realtà", v8: "8 su 10", v2: "2 su 10",
        shirt: ["maglietta imbarazzante"], guessed: "previsto", noticed: "notato", fewer: "molti meno",
        caps: [
          "Ti versi il caffè sulla camicia, proprio prima di una riunione.",
          "Entri, e ti sembra di avere un <b>riflettore</b> puntato addosso.",
          "Di sicuro <b>tutti</b> stanno guardando la macchia.",
          "In realtà, quasi tutti sono presi dalle <b>proprie</b> preoccupazioni.",
          "Solo <b>due</b> di loro l’hanno notata.",
          "In uno studio classico, se ne sono accorte <b>molte meno</b> persone del previsto.",
          "<b>La soluzione:</b> ricorda che ognuno è sotto il proprio riflettore.",
          "Fai un respiro e vai avanti. <b>Quasi nessuno l’ha vista.</b>"
        ],
        say: [
          "Ti versi il caffè sulla camicia, proprio prima di una riunione.",
          "Entri, e ti sembra di avere un riflettore puntato addosso.",
          "Di sicuro tutti stanno guardando la macchia.",
          "In realtà, quasi tutti sono presi dalle proprie preoccupazioni. Il telefono, gli appunti, persino una macchia tutta loro.",
          "Solo due di loro l’hanno notata.",
          "In uno studio classico, alcuni studenti entravano in una stanza con una maglietta imbarazzante. Se ne sono accorte molte meno persone di quante ne avessero previste.",
          "La soluzione: ricorda che ognuno è sotto il proprio riflettore.",
          "Fai un respiro e vai avanti. Quasi nessuno l’ha vista.",
          "L’effetto riflettore. Gli altri ti notano molto meno di quanto credi. Ognuno è preso dal proprio riflettore."
        ]
      }
    },
    svg(T) {
      let minis = "", looks = "", reals = "", people = "", bubbles = "";
      PPL.forEach(([x, y, bx, by], i) => {
        const lo = y - (i % 5 === 0 ? 14 : 20);        // the lowest pair sit just under a neighbour: a shorter lamp
        minis += `<g data-k="m${i}"><polygon class="sp-mini" points="${x - 3},${lo} ${x + 3},${lo} ${x + 15},${y + 25} ${x - 15},${y + 25}"/>` +
          `<path class="sp-ml" d="M${x - 3.5} ${lo - 5} H${x + 3.5} L${x + 5} ${lo} H${x - 5} Z"/></g>`;
        looks += `<line class="sp-look" data-k="l${i}"/>`;
        if (NOTICE.includes(i)) reals += `<line class="sp-real" data-k="r${i}"/>`;
        people += bust(i, x, y);
        bubbles += bubble(i, x, y, bx, by);
      });
      const TX = 92, TY = 120, BX = 178;            // the study: T-shirt centre, left edge of the bars
      return `
        <g data-k="room">
          <polygon class="sp-cone" data-k="cone" points=""/><ellipse class="sp-pool" data-k="pool" cx="${X0}" cy="${FY + 2}" ry="5.5"/>
          <polygon class="sp-cone g" data-k="coneG" points=""/><ellipse class="sp-pool g" data-k="poolG" cx="${X0}" cy="${FY + 2}" ry="5.5"/>
          ${minis}
          <g data-k="lampT"><g class="sp-lamp" data-k="lamp"><path d="M${LX} ${LY - 12} V${LY - 5} M${LX - 6} ${LY - 5} H${LX + 6} L${LX + 9} ${LY + 6} H${LX - 9} Z"/></g>
            <g class="sp-lamp g" data-k="lampG"><path d="M${LX - 6} ${LY - 5} H${LX + 6} L${LX + 9} ${LY + 6} H${LX - 9} Z"/></g></g>
          <text class="sp-lb" data-k="spotL" x="${LX + 16}" y="${LY + 4}">${T.spot}</text>
          ${looks}${reals}${people}${bubbles}
          ${you("I")}${you("G")}
          <g class="sp-cup" data-k="cup"><path class="h" d="M-4.4 -3 Q-8.2 -3 -8.2 0 Q-8.2 3 -4.2 3"/><path d="M-4.8 -6.5 H4.8 L4 5 Q3.8 6.8 2 6.8 H-2 Q-3.8 6.8 -4 5 Z"/></g>
          <circle class="sp-stain" data-k="drop" r="2.4"/><circle class="sp-stain" data-k="drop2" r="1.8"/>
          <g class="sp-stain" data-k="stain"><path d="M-5 -1 C-6 -5 -2 -7 1 -5.5 C4 -7 7 -4 5.5 -1 C7.5 2 4 5 1 4 C-1 6.5 -5.5 4.5 -4.5 1.5 C-6 1 -6 -0.4 -5 -1 Z"/><circle cx="5.6" cy="-6.9" r="1.2"/></g>
          <g class="sp-ct" data-k="c1"><rect x="12" y="222" width="128" height="38" rx="8"/><text class="l" x="22" y="236">${T.think}</text><text class="v q" x="22" y="253">${T.v8}</text></g>
          <g class="sp-ct" data-k="c2"><rect x="260" y="222" width="128" height="38" rx="8"/><text class="l" x="270" y="236">${T.actual}</text><text class="v" x="270" y="253">${T.v2}</text></g>
        </g>
        <g data-k="study">
          <path class="sp-tee" d="M${TX - 12} ${TY - 26} L${TX - 30} ${TY - 17} L${TX - 23} ${TY - 3} L${TX - 16} ${TY - 7} V${TY + 30} H${TX + 16} V${TY - 7} L${TX + 23} ${TY - 3} L${TX + 30} ${TY - 17} L${TX + 12} ${TY - 26} Q${TX} ${TY - 17} ${TX - 12} ${TY - 26} Z"/>
          <g class="sp-face"><circle cx="${TX}" cy="${TY + 6}" r="8.5"/><circle class="ey" cx="${TX - 3}" cy="${TY + 4}" r="1.2"/><circle class="ey" cx="${TX + 3}" cy="${TY + 4}" r="1.2"/><path d="M${TX - 3.8} ${TY + 8} Q${TX} ${TY + 11.5} ${TX + 3.8} ${TY + 8}"/></g>
          ${T.shirt.map((s, i) => `<text class="sp-sl" x="${TX}" y="${TY + 46 + i * 12}">${s}</text>`).join("")}
          <text class="sp-bl" x="${BX}" y="100">${T.guessed}</text><rect class="sp-bar" data-k="barG" x="${BX}" y="106" height="16" rx="3"/>
          <text class="sp-bl" x="${BX}" y="146">${T.noticed}</text><rect class="sp-bar n" data-k="barN" x="${BX}" y="152" height="16" rx="3"/>
          <g data-k="gap"><line class="sp-guide" x1="${BX + 190}" y1="126" x2="${BX + 190}" y2="152"/>
            <path class="sp-br" d="M${BX + 91} 154 V166 M${BX + 91} 160 H${BX + 190} M${BX + 190} 154 V166"/>
            <text class="sp-brt" x="${BX + 140}" y="184">${T.fewer}</text></g>
        </g>`;
    },
    S0: { you: 0, lbl: 0, tilt: 0, drop: 0, stain: 0, cupOff: 0, walk: 0, lamp: 0, cone: 0, look: 0, big: 0, c1: 0,
      busy: 0, real: 0, c2: 0, cut: 0, study: 0, bars: 0, gap: 0, own: 0, calm: 0, breath: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const R = 1 - S.cut;                                   // the room hides while the study is shown
      op("room", R);
      // you: walk in from the left, then stand in the middle
      const x = XS + (X0 - XS) * walkE(S.walk), m = bump(S.walk), sw = 3.4 * Math.sin((x - XS) * .15) * m;
      const sy = 1 + .045 * Math.sin(Math.PI * S.breath);
      const hx = lerp(20, 16, S.cupOff), hy = lerp(-41, -31, S.cupOff);
      const win = cl((S.calm - .35) / .65);
      for (const s of ["I", "G"]) {
        k("you" + s).setAttribute("transform", `translate(${f1(x)} ${FY}) scale(1 ${sy.toFixed(3)})`);
        k("legs" + s).setAttribute("d", `M-5 -26 L${f1(-5.5 + sw)} 0 M5 -26 L${f1(5.5 - sw)} 0`);
        k("arms" + s).setAttribute("d", `M-9 -52 L-16 -31 M9 -52 L${f1(hx)} ${f1(hy)}`);
      }
      op("youI", S.you * (1 - win)); op("youG", S.you * win);
      // the coffee: tip the cup, one drop, a stain
      k("cup").setAttribute("transform", `translate(${f1(x + hx + 11)} ${f1(FY + hy - 2)}) rotate(${f1(-65 * S.tilt)}) scale(1.4)`);
      op("cup", S.you * (1 - S.cupOff));
      // two drops fly from the rim to the shirt
      const d0x = x + hx + 3, d0y = FY + hy - 6;             // the rim, once the cup is tipped
      [["drop", 0, 0, 0], ["drop2", .25, 3, 7]].forEach(([key, lag, ox, oy]) => {
        const t = cl((S.drop - lag) / (1 - lag));
        k(key).setAttribute("cx", f1(lerp(d0x, x + SX + ox, t))); k(key).setAttribute("cy", f1(lerp(d0y, FY + SY + oy, t) - 5 * Math.sin(Math.PI * t)));
        op(key, t > 0 && t < 1 ? 1 : 0);
      });
      const ss = Math.max(.001, S.stain * (1 + .45 * S.big * (1 - S.calm)));
      k("stain").setAttribute("transform", `translate(${f1(x + SX)} ${f1(FY + SY * sy)}) scale(${ss.toFixed(3)})`);
      op("stain", S.stain > .01 ? 1 : 0);
      // the big spotlight switches on; at the end it shrinks to a normal one, like everyone else's
      const c = S.cone, e = S.calm * S.calm * (3 - 2 * S.calm);
      const ls = lerp(1, .55, e), ly = lerp(0, FY - 72 - 8.5 - 14 - (LY + 6) * ls, e);   // lamp: scale, then drop to just above your head
      const ty = ly + (LY + 6) * ls, tw = 8 * ls, bw = lerp(38 * (.35 + .65 * c), 18, e);
      const pts = `${f1(LX - tw)},${f1(ty)} ${f1(LX + tw)},${f1(ty)} ${f1(X0 + bw)},${FY + 2} ${f1(X0 - bw)},${FY + 2}`;
      for (const [cone, pool, o] of [["cone", "pool", 1 - win], ["coneG", "poolG", win]]) {
        k(cone).setAttribute("points", pts); op(cone, c * o);
        k(pool).setAttribute("rx", f1(bw)); op(pool, c * o);
      }
      k("lampT").setAttribute("transform", `translate(${f1(LX * (1 - ls))} ${f1(ly - 8 * (1 - S.lamp))}) scale(${ls.toFixed(3)})`);
      op("lampT", S.lamp); op("lamp", 1 - win); op("lampG", win); k("lamp").setAttribute("transform", `translate(0 ${f1(-8 * (1 - S.lamp))})`);
      op("spotL", S.lbl);
      // the people: fade in as you arrive
      const pin = cl((S.walk - .3) / .6);
      PPL.forEach(([px, py], i) => {
        op("p" + i, pin);
        // their own small spotlight
        const j = ORDER.indexOf(i), o = cl((S.own - j * .07) / .37);
        k("m" + i).setAttribute("transform", `translate(0 ${f1(-6 * (1 - o))})`);
        op("m" + i, o);
        // lines of sight you imagine, and the two that are real
        const [ex, ey] = eye(i), bi = BUSY.indexOf(i), li = LOOK.indexOf(i);
        const busy = bi < 0 ? 0 : cl((S.busy - bi * .1) / .3);
        const drawn = li < 0 ? 0 : cl((S.look - li * .08) / .44) * (1 - busy);
        const lx = lerp(ex, STX, drawn), ly = lerp(ey, STY, drawn), l = k("l" + i);
        l.setAttribute("x1", f1(ex)); l.setAttribute("y1", f1(ey)); l.setAttribute("x2", f1(lx)); l.setAttribute("y2", f1(ly));
        const real = NOTICE.includes(i) ? S.real : 0;
        op("l" + i, drawn > .02 ? 1 - real : 0);
        if (NOTICE.includes(i)) {
          const r = k("r" + i);
          r.setAttribute("x1", f1(ex)); r.setAttribute("y1", f1(ey)); r.setAttribute("x2", f1(lx)); r.setAttribute("y2", f1(ly));
          op("r" + i, drawn > .02 ? real : 0);
        }
        // their own worries
        const shown = busy, [, , bx, by] = PPL[i], sc = Math.max(.001, shown < 1 ? back(shown) : 1);
        k("b" + i).setAttribute("transform", `translate(${bx} ${by}) scale(${sc.toFixed(3)}) translate(${-bx} ${-by})`);
        op("b" + i, shown * 3);
      });
      // the counters
      op("c1", S.c1); k("c1").setAttribute("transform", `translate(0 ${f1(6 * (1 - S.c1))})`);
      op("c2", S.c2); k("c2").setAttribute("transform", `translate(0 ${f1(6 * (1 - S.c2))})`);
      // the classic study: guessed vs noticed
      op("study", S.study); k("study").setAttribute("transform", `translate(0 ${f1(8 * (1 - S.study))})`);
      k("barG").setAttribute("width", f1(Math.max(0, 190 * S.bars)));
      k("barN").setAttribute("width", f1(Math.max(0, 88 * S.bars)));
      op("gap", S.gap);
    },
    beats: [
      { steps: [{ to: { you: 1 }, ms: 500, sfx: "pluck" }, { wait: 300 }, { to: { tilt: 1 }, ms: 450, ease: "inOut" },
        { to: { drop: 1 }, ms: 420, ease: "lin" }, { to: { stain: 1 }, ms: 450, ease: "out", sfx: "pop" }, { to: { tilt: 0 }, ms: 400, ease: "inOut" }], hold: 2200 },
      { steps: [{ to: { cupOff: 1 }, ms: 300 }, { to: { walk: 1 }, ms: 1500, ease: "lin" }, { to: { lamp: 1 }, ms: 300, ease: "out" },
        { to: { cone: 1 }, ms: 650, sfx: "whoosh" }, { to: { lbl: 1 }, ms: 300 }] },
      { steps: [{ to: { lbl: 0 }, ms: 250 }, { to: { look: 1 }, ms: 1300, ease: "lin", sfx: "tick" }, { to: { big: 1, c1: 1 }, ms: 500, ease: "out" }], hold: 2400 },
      { steps: [{ to: { busy: 1 }, ms: 1600, ease: "lin", sfx: "pop" }], hold: 2600 },
      { steps: [{ to: { real: 1 }, ms: 500 }, { to: { c2: 1 }, ms: 550, ease: "out", sfx: "spring" }], hold: 2600 },
      { steps: [{ to: { cut: 1 }, ms: 500 }, { to: { study: 1 }, ms: 450 }, { to: { bars: 1 }, ms: 900, sfx: "tick" }, { to: { gap: 1 }, ms: 450 }], hold: 2800 },
      { steps: [{ to: { c1: 0, c2: 0, real: 0, look: 0, busy: 0 } }, { to: { study: 0 }, ms: 350 }, { to: { cut: 0 }, ms: 600 },
        { to: { own: 1 }, ms: 1200, ease: "lin", sfx: "pluck" }] },
      { steps: [{ to: { calm: 1 }, ms: 1200, ease: "inOut", sfx: "chime", sfxAt: 500 }, { to: { breath: 1 }, ms: 1300, ease: "lin" }], hold: 4200 }
    ]
  };
})();
