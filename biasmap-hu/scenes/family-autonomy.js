/* Family "Autonomy & status": to avoid mistakes we guard our freedom to choose and our standing.
   One picture stays on screen: you, inside a dashed circle of "my choices", with a star for your standing.
   Pushes arrive from outside. A pushy offer bounces off (the shortcut helps); a friend's "you must" dents
   the circle and you back off (reactance); "don't" and you lean out for it (reverse psychology); a rising
   star asks for help and you hold back (social comparison bias). The fix: split the idea from whoever
   pushes it, and take it in only if you'd pick it as your own. Scene for anim.js. */
(function () {
  const KEY = "family-autonomy", P = `.bp[data-scene="${KEY}"]`;
  const RX = 118, RY = 146, R = 74;               // the circle of "my choices"
  const G = 200, SC = 1.7;                        // everyone's feet, and the size of the people
  const HOME = RX, BACK = 88, FWD = 150;          // where you stand: centre, backed off, leaning out
  const CY = 160;                                 // height where pushes meet the circle (book, card)
  const TH = Math.asin((CY - RY) / R);            // angle of that point on the circle
  const EDGE = RX + R * Math.cos(TH);             // the circle's edge at that height
  const FX = 334;                                 // the friend, and later the rising star
  const BW = 26, BH = 34;                         // the book
  const BHAND = 293, BPUSH = 192, BSEP = 246, BIN = 160;   // book: in the friend's hand, pushed in, set apart, taken in
  const BUBX = 330, BUBY = 76, BUBH = 38;         // the friend's speech bubble (centre x, top, height)
  const LX = 200, LY = 112, LG = 32;              // the recap list: left, first row, row gap
  const LAB = 248;                                // your reaction, under the circle
  const RSY = 100;                                // the rising star's star
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const lerp = (a, b, t) => a + (b - a) * t;

  // arm poses, in the person's own units: shoulder, elbow, hand
  const DOWN = { l: [[-6.5, -25.5], [-9, -19.5], [-10, -14]], r: [[6.5, -25.5], [9, -19.5], [10, -14]] };
  const POSE = {
    cross: { l: [[-6.5, -25.5], [-9, -19], [5, -20.5]], r: [[6.5, -25.5], [9, -19], [-5, -19]] },
    reach: { r: [[6.5, -25.5], [12, -24.5], [17.5, -24]] },
    push: { l: [[-6.5, -25.5], [-12, -24.5], [-17.5, -24]] },
    ask: { l: [[-6.5, -25.5], [-11, -20.5], [-16, -21]] }
  };
  const arms = w => ["l", "r"].map(side => {
    const pts = DOWN[side].map(([x, y], i) => {
      let px = x, py = y;
      for (const k in w) {
        const p = POSE[k][side];
        if (p && w[k]) { px += (p[i][0] - x) * w[k]; py += (p[i][1] - y) * w[k]; }
      }
      return `${f1(px)} ${f1(py)}`;
    });
    return `M${pts[0]} L${pts[1]} L${pts[2]}`;
  }).join(" ");
  // a person standing on (0, 0) in their own units; arms, eyes and mouth are set in render
  const person = (key, cls) => `<g data-k="${key}"><g class="fa-p ${cls}">
      <path d="M-3 -12 L-3.5 0 M3 -12 L3.5 0"/>
      <path class="b" d="M-7 -12 V-23 Q-7 -29.5 0 -29.5 Q7 -29.5 7 -23 V-12 Z"/>
      <path data-k="${key}A"/>
      <circle class="b" cy="-36" r="5.5"/>
      <g data-k="${key}E"><circle class="e" cx="-2" cy="-36.8" r=".8"/><circle class="e" cx="2" cy="-36.8" r=".8"/></g>
      <path data-k="${key}M"/></g></g>`;
  const star = (ro, ri) => {
    let d = "";
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? ri : ro;
      d += `${i ? "L" : "M"}${f1(r * Math.cos(a))} ${f1(r * Math.sin(a))} `;
    }
    return d + "Z";
  };
  const rays = (r1, r2) => [0, 1, 2, 3, 4, 5, 6, 7].map(i => {
    const a = i * Math.PI / 4 + Math.PI / 8, c = Math.cos(a), s = Math.sin(a);
    return `M${f1(c * r1)} ${f1(s * r1)} L${f1(c * r2)} ${f1(s * r2)}`;
  }).join(" ");
  // the circle, dented (D < 0) where pushes meet it, or bulging out (B > 0) toward something you want
  const ring = (r, D, B) => {
    let d = "";
    for (let i = 0; i <= 120; i++) {
      const a = i / 120 * 2 * Math.PI;
      let da = a - TH; da = Math.atan2(Math.sin(da), Math.cos(da));
      const rr = r + D * Math.exp(-(da / .42) * (da / .42)) + B * Math.exp(-(da / .7) * (da / .7));
      d += `${i ? "L" : "M"}${f1(RX + rr * Math.cos(a))} ${f1(RY + rr * Math.sin(a))} `;
    }
    return d + "Z";
  };
  // little arrows closing in on the circle from all sides
  const STEER = [-.5, -2.55, 2.55, .75];
  const steer = a => {
    const c = Math.cos(a), s = Math.sin(a), r1 = R + 32, r2 = R + 12;
    const x1 = RX + c * r1, y1 = RY + s * r1, x2 = RX + c * r2, y2 = RY + s * r2;
    return `M${f1(x1)} ${f1(y1)} L${f1(x2)} ${f1(y2)} M${f1(x2 + 7 * c - 5 * s)} ${f1(y2 + 7 * s + 5 * c)} L${f1(x2)} ${f1(y2)} L${f1(x2 + 7 * c + 5 * s)} ${f1(y2 + 7 * s - 5 * c)}`;
  };

  window.BiasAnim.SCENES[KEY] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
      ${P} .fa-ring{fill:none;stroke:var(--q);stroke-width:2.2;stroke-dasharray:6 5;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fa-ring.w{stroke-width:3.6;stroke-dasharray:none}
      ${P} .fa-ring.g{stroke:var(--good);stroke-width:3;stroke-dasharray:none}
      ${P} .fa-mine{font:500 10px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .fa-st{fill:none;stroke:var(--muted);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fa-p path,${P} .fa-p circle{fill:none;stroke:var(--ink);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fa-p .b{fill:var(--surface)}
      ${P} .fa-p .e{fill:var(--ink);stroke:none}
      ${P} .fa-p.you path,${P} .fa-p.you circle{stroke:var(--q)}
      ${P} .fa-p.you .b{fill:var(--surface)}
      ${P} .fa-p.you .e{fill:var(--q);stroke:none}
      ${P} .fa-star{fill:var(--q);fill-opacity:.28;stroke:var(--q);stroke-width:2;stroke-linejoin:round}
      ${P} .fa-star.dim{fill:var(--faint);fill-opacity:.2;stroke:var(--faint)}
      ${P} .fa-rays{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round}
      ${P} .fa-note{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .fa-note.q{fill:var(--q)}
      ${P} .fa-card rect{fill:var(--surface);stroke:var(--bad);stroke-width:2}
      ${P} .fa-card text{font:600 12px var(--display);fill:var(--bad);text-anchor:middle}
      ${P} .fa-bub rect,${P} .fa-bub path{fill:var(--surface);stroke:var(--muted);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fa-bub .cv{fill:var(--surface);stroke:none}
      ${P} .fa-bub text{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fa-bub tspan.q{fill:var(--q)}
      ${P} .fa-book rect{fill:var(--surface);stroke:var(--ink);stroke-width:2}
      ${P} .fa-book path{fill:none;stroke:var(--ink);stroke-width:1.6;stroke-linecap:round}
      ${P} .fa-book .tl{stroke:var(--muted)}
      ${P} .fa-ok circle{fill:var(--surface);stroke:var(--good);stroke-width:1.8}
      ${P} .fa-ok path{fill:none;stroke:var(--good);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fa-pill rect{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .fa-pill text{font:600 11.5px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .fa-react{font:600 11.5px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .fa-react.g{fill:var(--good)}
      ${P} .fa-cmp{fill:none;stroke:var(--muted);stroke-width:1.6;stroke-dasharray:3 4;stroke-linecap:round}
      ${P} .fa-cut{fill:none;stroke:var(--q);stroke-width:2;stroke-dasharray:5 5;stroke-linecap:round}
      ${P} .fa-li rect{fill:var(--surface);stroke:var(--muted);stroke-width:1.6}
      ${P} .fa-li .c{font:600 11px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fa-li .r{font:600 11px var(--display);fill:var(--q)}
      ${P} .fa-li path{fill:none;stroke:var(--muted);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fa-li .s{fill:var(--q);fill-opacity:.28;stroke:var(--q);stroke-width:1.4;stroke-linejoin:round}
      ${P} .fa-lh{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .fa-lh.m{text-anchor:middle}
    `,
    text: {
      hu: {
        name: "Autonómia és státusz", shareTitle: "Miért ellenállunk, ha nyomást éreznek rajtunk, még jó ötletek felé is, 30 másodpercben",
        ecline: "Őrizd a szabadságodat, de minden ötletet a saját érdeme alapján ítélj meg, ne aszerint, ki nyomja.",
        mine: "a döntéseim", standing: "a helyzetem", sign: "Írd alá most!", signW: 84, safe: "megvéd téged",
        must: ["Ezt <tspan class=\"q\">el kell</tspan>", "olvasnod!"], dont: ["<tspan class=\"q\">Ne</tspan>", "olvasd el!"], bubW: 96,
        help: "Segítesz?", helpW: 72, cmp: "összehasonlítás",
        back: "← hátrálsz", want: "akarod →", hold: "visszafogod magad", own: "a saját ötleted?", chosen: "a választásod",
        idea: "csak az ötlet", push: "ki nyomja",
        pills: [["Reaktancia", 80], ["Fordított pszichológia", 138], ["Társas összehasonlítás", 164]],
        lhA: "a nyomás", lhB: "te", chipW: 104,
        rows: [["„El kell olvasnod!”", "hátrálsz"], ["„Ne olvasd!”", "akarod"], ["túlragyog rajtad", "visszafogod magad"]],
        caps: [
          "Mindenki irányítani akar. Ezért az agyad <b>őrzi a döntéseidet</b>…",
          "…és a <b>helyzetedet</b>. Ez általában megakadályozza, hogy mások <b>kihasználjanak</b>.",
          "„El <b>kell</b> olvasnod!” Jó könyv, de te <b>hátrálsz</b>.",
          "Ha azt hallod: „<b>Ne</b> olvasd!”, hirtelen <b>akarod</b>.",
          "Segítesz egy feltörekvő tehetségen? Túlragyoghat rajtad. <b>Visszafogod magad.</b>",
          "Mindig a <b>nyomásra</b> reagálsz, nem az <b>ötletre</b>.",
          "<b>A megoldás:</b> válaszd szét az ötletet attól, <b>ki nyomja</b> azt.",
          "Kérdezd meg: <b>a saját ötletemként</b> is ezt választanám? Akkor szabadon <b>dönts</b>."
        ],
        say: [
          "Mindenki el akar téged terelni valahova. Ezért az agyad őrzi a döntéseidet...",
          "...és a helyzetedet a csoportban. Ez általában megakadályozza, hogy mások kihasználjanak, vagy kiszorítsanak.",
          "Reaktancia. Valaki ragaszkodik hozzá: el kell olvasnod! Jó könyv, de te hátrálsz.",
          "Fordított pszichológia. Ha azt mondják, ne olvasd, hirtelen akarod.",
          "Társas összehasonlítás. Segítsek egy feltörekvő tehetségen? Túlragyoghat rajtam, ezért visszafogom magam.",
          "Mindig a nyomásra reagálsz, nem magára az ötletre.",
          "A megoldás: válaszd szét az ötletet attól, ki nyomja.",
          "Kérdezd meg magadtól: a saját ötletemként is ezt választanám? Akkor szabadon dönts.",
          "Autonómia és státusz. Őrizd a szabadságodat, de minden ötletet a saját érdeme alapján ítélj meg, ne aszerint, ki nyomja."
        ]
      },
      en: {
        name: "Autonomy & status", shareTitle: "Why we resist being pushed, even toward good ideas, in 30 seconds",
        ecline: "Guard your freedom, but judge each idea on its merits, not by who pushes it.",
        mine: "my choices", standing: "standing", sign: "Sign now!", signW: 84, safe: "protects you",
        must: ["You <tspan class=\"q\">must</tspan>", "read this!"], dont: ["<tspan class=\"q\">Don't</tspan>", "read this!"], bubW: 96,
        help: "Help me?", helpW: 72, cmp: "compare",
        back: "← back off", want: "want it →", hold: "hold back", own: "my own idea?", chosen: "my choice",
        idea: "just the idea", push: "who is pushing",
        pills: [["Reactance", 80], ["Reverse psychology", 138], ["Social comparison bias", 164]],
        lhA: "the push", lhB: "you", chipW: 104,
        rows: [["“You must!”", "back off"], ["“Don't!”", "want it"], ["outshines you", "hold back"]],
        caps: [
          "Everyone wants to steer you. So your brain <b>guards your choices</b>…",
          "…and your <b>standing</b>. Usually, that keeps others from <b>using you</b>.",
          "“You <b>must</b> read this!” It's a good book, but you <b>back off</b>.",
          "Hear “<b>Don't</b> read it!” instead, and suddenly you <b>want to</b>.",
          "Help a rising star? They might <b>outshine</b> you. You <b>hold back</b>.",
          "Each time, you react to the <b>push</b>, not to the <b>idea</b>.",
          "<b>The fix:</b> separate the idea from <b>who is pushing</b> it.",
          "Ask: “Would I pick this if it were <b>my own idea</b>?” Then choose <b>freely</b>."
        ],
        say: [
          "Everyone wants to steer you somewhere. So your brain guards your choices...",
          "...and your standing in the group. Usually, that keeps others from using you, or pushing you out.",
          "Reactance. Someone insists: you must read this! It's a good book, but you back off.",
          "Reverse psychology. If they say, don't read it, suddenly you want to.",
          "Social comparison bias. Should you help a rising star? They might outshine you, so you hold back.",
          "Each time, you react to the push, not to the idea itself.",
          "The fix: separate the idea from who is pushing it.",
          "Ask yourself: would I pick this if it were my own idea? Then choose freely.",
          "Autonomy and status. Guard your freedom, but judge each idea on its merits, not by who pushes it."
        ]
      },
      el: {
        name: "Αυτονομία & κύρος", shareTitle: "Γιατί αντιδράμε όταν μας πιέζουν, ακόμα και για κάτι καλό, σε 30 δευτερόλεπτα",
        ecline: "Να φυλάς την ελευθερία σου, αλλά να κρίνεις κάθε ιδέα από την αξία της, όχι από το ποιος σε πιέζει.",
        mine: "οι επιλογές μου", standing: "κύρος", sign: "Υπόγραψε τώρα!", signW: 116, safe: "σε προστατεύει",
        must: ["<tspan class=\"q\">Πρέπει</tspan> να", "το διαβάσεις!"], dont: ["<tspan class=\"q\">Μην</tspan> το", "διαβάσεις!"], bubW: 110,
        help: "Με βοηθάς;", helpW: 82, cmp: "σύγκριση",
        back: "← κάνεις πίσω", want: "σε τραβάει →", hold: "διστάζεις", own: "δική μου ιδέα;", chosen: "δική μου επιλογή",
        idea: "μόνο η ιδέα", push: "ποιος πιέζει",
        pills: [["Ψυχολογική αντίδραση", 150], ["Αντίστροφη ψυχολογία", 150], ["Μεροληψία κοινωνικής σύγκρισης", 222]],
        lhA: "η πίεση", lhB: "εσύ", chipW: 98,
        rows: [["«Πρέπει!»", "κάνεις πίσω"], ["«Μη!»", "σε τραβάει"], ["σε επισκιάζει", "διστάζεις"]],
        caps: [
          "Όλοι θέλουν να σε κατευθύνουν. Γι’\u00a0αυτό το μυαλό σου <b>φυλάει τις επιλογές σου</b>…",
          "…και το <b>κύρος</b> σου. Συνήθως, έτσι οι άλλοι δεν σε <b>εκμεταλλεύονται</b>.",
          "«<b>Πρέπει</b> να το διαβάσεις!» Το βιβλίο είναι καλό, όμως εσύ <b>κάνεις πίσω</b>.",
          "Αν όμως σου πουν «<b>Μην</b> το διαβάσεις!», ξαφνικά σε <b>τραβάει</b>.",
          "Να βοηθήσεις ένα ανερχόμενο αστέρι; Μπορεί να σε <b>επισκιάσει</b>. <b>Διστάζεις</b>.",
          "Κάθε φορά αντιδράς στην <b>πίεση</b>, όχι στην ίδια την <b>ιδέα</b>.",
          "<b>Η λύση:</b> ξεχώρισε την ιδέα από το <b>ποιος σε πιέζει</b>.",
          "Αναρωτήσου: «Θα το διάλεγα αν ήταν <b>δική\u00a0μου\u00a0ιδέα</b>;» Μετά διάλεξε <b>ελεύθερα</b>."
        ],
        say: [
          "Όλοι θέλουν να σε κατευθύνουν κάπου. Γι’ αυτό το μυαλό σου φυλάει τις επιλογές σου...",
          "...και το κύρος σου στην ομάδα. Συνήθως, έτσι οι άλλοι δεν σε εκμεταλλεύονται ούτε σε παραγκωνίζουν.",
          "Ψυχολογική αντίδραση. Κάποιος επιμένει: πρέπει να το διαβάσεις! Το βιβλίο είναι καλό, όμως εσύ κάνεις πίσω.",
          "Αντίστροφη ψυχολογία. Αν όμως σου πουν να μην το διαβάσεις, ξαφνικά σε τραβάει.",
          "Μεροληψία κοινωνικής σύγκρισης. Να βοηθήσεις ένα ανερχόμενο αστέρι; Μπορεί να σε επισκιάσει, οπότε διστάζεις.",
          "Κάθε φορά αντιδράς στην πίεση, όχι στην ίδια την ιδέα.",
          "Η λύση: ξεχώρισε την ιδέα από το ποιος σε πιέζει.",
          "Αναρωτήσου: θα το διάλεγα αν ήταν δική μου ιδέα; Μετά διάλεξε ελεύθερα.",
          "Αυτονομία και κύρος. Να φυλάς την ελευθερία σου, αλλά να κρίνεις κάθε ιδέα από την αξία της, όχι από το ποιος σε πιέζει."
        ]
      },
      es: {
        name: "Autonomía y estatus", shareTitle: "Por qué nos resistimos cuando nos presionan, incluso hacia algo bueno, en 30 segundos",
        ecline: "Protege tu libertad, pero juzga cada idea por lo que vale, no por quién te presiona.",
        mine: "mis decisiones", standing: "estatus", sign: "¡Firma ya!", signW: 93, safe: "te protege",
        must: ["¡<tspan class=\"q\">Tienes que</tspan>", "leer esto!"], dont: ["¡<tspan class=\"q\">No</tspan> lo", "leas!"], bubW: 106,
        help: "¿Me ayudas?", helpW: 99, cmp: "comparar",
        back: "← retrocedes", want: "lo quieres →", hold: "te frenas", own: "¿idea mía?", chosen: "decido yo",
        idea: "solo la idea", push: "quién presiona",
        pills: [["Reactancia", 89], ["Psicología inversa", 138], ["Sesgo de comparación social", 201]],
        lhA: "la presión", lhB: "tú", chipW: 104,
        rows: [["«¡Debes!»", "retrocedes"], ["«¡No!»", "lo quieres"], ["te eclipsa", "te frenas"]],
        caps: [
          "Todos quieren influir en ti. Así que tu cerebro <b>protege tus decisiones</b>…",
          "…y tu <b>estatus</b>. Normalmente, eso evita que otros <b>te utilicen</b>.",
          "«¡<b>Tienes que</b> leer esto!» Es un buen libro, pero <b>retrocedes</b>.",
          "Si oyes «¡<b>No</b> lo leas!», de repente <b>quieres leerlo</b>.",
          "¿Ayudar a una estrella en ascenso? Podría <b>eclipsarte</b>. <b>Te frenas</b>.",
          "Cada vez, reaccionas a la <b>presión</b>, no a la <b>idea</b>.",
          "<b>La solución:</b> separa la idea de <b>quién te presiona</b>.",
          "Pregúntate: «¿Lo elegiría si fuera <b>idea mía</b>?». Luego decide <b>con libertad</b>."
        ],
        say: [
          "Todo el mundo quiere llevarte a su terreno. Así que tu cerebro protege tus decisiones...",
          "...y tu estatus en el grupo. Normalmente, eso evita que otros te utilicen o te dejen fuera.",
          "Reactancia. Alguien insiste: ¡tienes que leer esto! Es un buen libro, pero retrocedes.",
          "Psicología inversa. Si te dicen que no lo leas, de repente quieres leerlo.",
          "Sesgo de comparación social. ¿Deberías ayudar a una estrella en ascenso? Podría eclipsarte, así que te frenas.",
          "Cada vez, reaccionas a la presión, no a la idea en sí.",
          "La solución: separa la idea de quién te presiona.",
          "Pregúntate: ¿elegiría esto si fuera idea mía? Luego decide con libertad.",
          "Autonomía y estatus. Protege tu libertad, pero juzga cada idea por lo que vale, no por quién te presiona."
        ]
      },
      fr: {
        name: "Autonomie et statut", shareTitle: "Pourquoi on résiste quand on nous pousse, même vers une bonne idée, en 30 secondes",
        ecline: "Protégez votre liberté, mais jugez chaque idée sur le fond, pas selon qui la défend.",
        mine: "mes choix", standing: "statut", sign: "Signez vite !", signW: 103, safe: "vous protège",
        must: ["<tspan class=\"q\">Il faut</tspan>", "lire ça !"], dont: ["<tspan class=\"q\">Ne</tspan> lisez", "<tspan class=\"q\">pas</tspan> ça !"], bubW: 96,
        help: "Vous m’aidez ?", helpW: 116, cmp: "comparer",
        back: "← vous reculez", want: "envie →", hold: "vous freinez", own: "mon idée ?", chosen: "mon choix",
        idea: "l’idée seule", push: "qui insiste",
        pills: [["Réactance", 80], ["Psychologie inversée", 145], ["Biais de comparaison sociale", 205]],
        lhA: "la pression", lhB: "vous", chipW: 104,
        rows: [["« Il faut ! »", "recul"], ["« Ne lisez pas ! »", "envie"], ["vous éclipse", "retenue"]],
        caps: [
          "Tout le monde veut vous orienter. Alors votre cerveau <b>protège vos choix</b>…",
          "…et votre <b>statut</b>. D’habitude, ça empêche les autres de <b>vous manipuler</b>.",
          "« <b>Il faut</b> lire ça ! » C’est un bon livre, mais vous <b>reculez</b>.",
          "Entendez plutôt « <b>Ne lisez pas</b> ça ! », et soudain vous <b>en avez envie</b>.",
          "Aider une étoile montante ? Elle pourrait vous <b>éclipser</b>. Vous <b>freinez</b>.",
          "À chaque fois, vous réagissez à la <b>pression</b>, pas à l’<b>idée</b>.",
          "<b>La solution :</b> séparez l’idée de <b>qui insiste</b>.",
          "Demandez-vous : « Le choisirais-je si c’était <b>mon idée</b> ? » Puis choisissez <b>librement</b>."
        ],
        say: [
          "Tout le monde veut vous mener quelque part. Alors votre cerveau protège vos choix...",
          "...et votre statut dans le groupe. D’habitude, ça empêche les autres de vous manipuler, ou de vous mettre à l’écart.",
          "La réactance. Quelqu’un insiste : il faut lire ça ! C’est un bon livre, mais vous reculez.",
          "La psychologie inversée. Si on vous dit de ne pas le lire, soudain vous en avez envie.",
          "Le biais de comparaison sociale. Faut-il aider une étoile montante ? Elle pourrait vous éclipser, alors vous freinez.",
          "À chaque fois, vous réagissez à la pression, pas à l’idée elle-même.",
          "La solution : séparez l’idée de qui insiste.",
          "Demandez-vous : le choisirais-je si c’était mon idée ? Puis choisissez librement.",
          "Autonomie et statut. Protégez votre liberté, mais jugez chaque idée sur le fond, pas selon qui la défend."
        ]
      },
      de: {
        name: "Autonomie und Status", shareTitle: "Warum wir uns gegen Druck wehren, selbst bei guten Ideen, in 30 Sekunden",
        ecline: "Schütze deine Freiheit, aber beurteile jede Idee nach ihrem Wert, nicht danach, wer drängt.",
        mine: "meine Wahl", standing: "Ansehen", sign: "Greif zu!", signW: 84, safe: "schützt dich",
        must: ["Du <tspan class=\"q\">musst</tspan>", "das lesen!"], dont: ["Lies das", "<tspan class=\"q\">bloß nicht</tspan>!"], bubW: 96,
        help: "Hilfst du mir?", helpW: 105, cmp: "vergleichen",
        back: "← zurückweichen", want: "haben wollen →", hold: "zurückhalten", own: "meine Idee?", chosen: "meine Wahl",
        idea: "nur die Idee", push: "wer drängt",
        pills: [["Reaktanz", 80], ["Umgekehrte Psychologie", 171], ["Sozialer Vergleichsfehler", 177]],
        lhA: "der Druck", lhB: "du", chipW: 104,
        rows: [["„Du musst!“", "Rückzug"], ["„Bloß nicht!“", "Verlangen"], ["übertrifft dich", "Zögern"]],
        caps: [
          "Alle wollen dich lenken. Also wacht dein Gehirn <b>über deine Entscheidungen</b>…",
          "…und über <b>dein Ansehen</b>. Meist schützt dich das davor, <b>benutzt zu werden</b>.",
          "„Du <b>musst</b> das lesen!“ Ein gutes Buch, aber du <b>weichst zurück</b>.",
          "Hörst du stattdessen „Lies das <b>bloß nicht</b>!“, <b>willst</b> du es plötzlich.",
          "Einem aufstrebenden Talent helfen? Es könnte dich <b>übertreffen</b>. Du <b>hältst dich zurück</b>.",
          "Jedes Mal reagierst du auf den <b>Druck</b>, nicht auf die <b>Idee</b>.",
          "<b>Die Lösung:</b> Trenn die Idee von der Person, <b>die drängt</b>.",
          "Frag dich: „Würde ich das wählen, wenn es <b>meine eigene Idee</b> wäre?“ Dann entscheide <b>frei</b>."
        ],
        say: [
          "Alle wollen dich irgendwohin lenken. Also wacht dein Gehirn über deine Entscheidungen...",
          "...und über dein Ansehen in der Gruppe. Meist schützt dich das davor, benutzt oder ausgegrenzt zu werden.",
          "Reaktanz. Jemand besteht darauf: Du musst das lesen! Es ist ein gutes Buch, aber du weichst zurück.",
          "Umgekehrte Psychologie. Sagt man dir, lies das bloß nicht, willst du es plötzlich.",
          "Sozialer Vergleichsfehler. Solltest du einem aufstrebenden Talent helfen? Es könnte dich übertreffen, also hältst du dich zurück.",
          "Jedes Mal reagierst du auf den Druck, nicht auf die Idee selbst.",
          "Die Lösung: Trenn die Idee von der Person, die drängt.",
          "Frag dich: Würde ich das wählen, wenn es meine eigene Idee wäre? Dann entscheide frei.",
          "Autonomie und Status. Schütze deine Freiheit, aber beurteile jede Idee nach ihrem Wert, nicht danach, wer drängt."
        ]
      },
      it: {
        name: "Autonomia e status", shareTitle: "Perché resistiamo alle pressioni, anche verso buone idee, in 30 secondi",
        ecline: "Difendi la tua libertà, ma giudica ogni idea per quello che vale, non per chi insiste.",
        mine: "le mie scelte", standing: "status", sign: "Firma ora!", signW: 87, safe: "ti protegge",
        must: ["<tspan class=\"q\">Devi</tspan>", "leggerlo!"], dont: ["<tspan class=\"q\">Non</tspan>", "leggerlo!"], bubW: 96,
        help: "Mi aiuti?", helpW: 72, cmp: "confronto",
        back: "← ti ritrai", want: "lo vuoi →", hold: "ti trattieni", own: "un’idea mia?", chosen: "scelta mia",
        idea: "solo l’idea", push: "chi insiste",
        pills: [["Reattanza", 80], ["Psicologia inversa", 138], ["Bias del confronto sociale", 183]],
        lhA: "la pressione", lhB: "tu", chipW: 104,
        rows: [["«Devi!»", "ti ritrai"], ["«Non farlo!»", "lo vuoi"], ["ti oscura", "ti trattieni"]],
        caps: [
          "Tutti vogliono indirizzarti. Così il cervello <b>difende le tue scelte</b>…",
          "…e il tuo <b>status</b>. Di solito, così gli altri non possono <b>usarti</b>.",
          "«<b>Devi</b> leggerlo!» È un buon libro, ma tu <b>ti ritrai</b>.",
          "Se invece senti «<b>Non</b> leggerlo!», d’un tratto <b>lo vuoi</b>.",
          "Aiutare una stella nascente? Potrebbe <b>oscurarti</b>. <b>Ti trattieni</b>.",
          "Ogni volta reagisci alla <b>pressione</b>, non all’<b>idea</b>.",
          "<b>La soluzione:</b> separa l’idea da <b>chi insiste</b>.",
          "Chiediti: «La sceglierei se fosse <b>un’idea mia</b>?» Poi scegli <b>liberamente</b>."
        ],
        say: [
          "Tutti vogliono portarti da qualche parte. Così il cervello difende le tue scelte...",
          "...e il tuo status nel gruppo. Di solito, così gli altri non possono usarti, o metterti da parte.",
          "Reattanza. Qualcuno insiste: devi leggerlo! È un buon libro, ma tu ti ritrai.",
          "Psicologia inversa. Se ti dicono di non leggerlo, d’un tratto lo vuoi.",
          "Bias del confronto sociale. Aiutare una stella nascente? Potrebbe oscurarti, così ti trattieni.",
          "Ogni volta reagisci alla pressione, non all’idea in sé.",
          "La soluzione: separa l’idea da chi insiste.",
          "Chiediti: la sceglierei se fosse un’idea mia? Poi scegli liberamente.",
          "Autonomia e status. Difendi la tua libertà, ma giudica ogni idea per quello che vale, non per chi insiste."
        ]
      }
    },
    svg(T) {
      const pills = T.pills.map(([name, w], i) => `<g class="fa-pill" data-k="p${i}">
          <rect x="12" y="10" width="${w}" height="22" rx="11"/><text x="${12 + w / 2}" y="25">${name}</text></g>`).join("");
      const bw = T.bubW, bx0 = BUBX - bw / 2, bb = BUBY + BUBH;
      const lines = (a, cls) => `<text class="${cls}" x="${BUBX}" y="${BUBY + 16}">${a[0]}</text><text class="${cls}" x="${BUBX}" y="${BUBY + 31}">${a[1]}</text>`;
      const hw = T.helpW, hx1 = FX - 16, hy = 126;
      const rows = T.rows.map(([a, b], i) => {
        const y = LY + i * LG, cw = T.chipW, icon = i === 2;
        const tx = icon ? LX + 22 + (cw - 29) / 2 : LX + cw / 2;
        return `<g class="fa-li" data-k="l${i}"><rect x="${LX}" y="${y - 11}" width="${cw}" height="22" rx="11"/>
          ${icon ? `<path class="s" transform="translate(${LX + 13} ${y})" d="${star(6.5, 2.9)}"/>` : ""}
          <text class="c" x="${tx}" y="${y + 4}">${a}</text>
          <path d="M${LX + cw + 5} ${y} H${LX + cw + 16} M${LX + cw + 12} ${y - 4} L${LX + cw + 16} ${y} L${LX + cw + 12} ${y + 4}"/>
          <text class="r" x="${LX + cw + 21}" y="${y + 4}">${b}</text></g>`;
      }).join("");
      const SY = G - 41.5 * SC - 22;             // your star, just above your head
      const cutX = f1((BSEP + BW / 2 + FX - 17.5 * SC) / 2);
      return `
        ${pills}
        <text class="fa-mine" data-k="mine" x="${RX}" y="${RY - R - 10}">${T.mine}</text>
        <g data-k="steer"><path class="fa-st" data-k="steerP" d=""/></g>
        <path class="fa-ring" data-k="ring" d=""/>
        <path class="fa-ring w" data-k="ringW" d=""/>
        <path class="fa-ring g" data-k="ringG" d=""/>
        <g class="fa-card" data-k="offer"><rect x="${-T.signW / 2}" y="-14" width="${T.signW}" height="28" rx="6"/><text y="4.5">${T.sign}</text></g>
        <line class="fa-cmp" data-k="cmp" x1="${RX + 15}" y1="${SY}" x2="${FX - 25}" y2="${RSY}"/>
        <text class="fa-note" data-k="cmpT" x="${(RX + FX) / 2}" y="${RSY - 7}">${T.cmp}</text>
        <path class="fa-cut" data-k="cut" d="M${cutX} ${CY - BH / 2 + 4} V${G + 4}"/>
        <g data-k="fr">${person("frP", "")}</g>
        <text class="fa-note" data-k="push" x="${FX}" y="${G + 18}">${T.push}</text>
        <g data-k="rv">${person("rvP", "")}</g>
        <g data-k="rstar" transform="translate(${FX} ${RSY})"><g data-k="rstarS"><path class="fa-rays" d="${rays(17, 23)}"/><path class="fa-star" d="${star(13, 5.8)}"/></g></g>
        <g class="fa-bub" data-k="bub">
          <rect x="${bx0}" y="${BUBY}" width="${bw}" height="${BUBH}" rx="11"/>
          <path d="M${BUBX - 6} ${bb} L${BUBX - 2} ${bb + 9} L${BUBX + 5} ${bb}"/><rect class="cv" x="${BUBX - 4.8}" y="${bb - 1.6}" width="8.6" height="2.8"/>
          <g data-k="bubF"><g data-k="bm">${lines(T.must, "")}</g><g data-k="bd">${lines(T.dont, "")}</g></g></g>
        <g class="fa-bub" data-k="rb">
          <rect x="${hx1 - hw}" y="${hy}" width="${hw}" height="22" rx="11"/>
          <path d="M${hx1} ${hy + 6} L${hx1 + 8} ${hy + 10} L${hx1} ${hy + 15}"/><rect class="cv" x="${hx1 - 1.4}" y="${hy + 7.2}" width="2.6" height="6.6"/>
          <text x="${hx1 - hw / 2}" y="${hy + 15}">${T.help}</text></g>
        <g data-k="book"><g class="fa-book">
          <rect x="${-BW / 2}" y="${-BH / 2}" width="${BW}" height="${BH}" rx="2.5"/>
          <path d="M${-BW / 2 + 5} ${-BH / 2 + 1} V${BH / 2 - 1}"/><path class="tl" d="M-3 -8 H8 M-3 -3 H5"/></g>
          <g class="fa-ok" data-k="ok" transform="translate(${BW / 2 - 1} ${-BH / 2 + 1})"><circle r="6.5"/><path d="M-3 .2 L-.8 2.6 L3.2 -2"/></g></g>
        <text class="fa-note q" data-k="idea" x="${BSEP}" y="${CY - BH / 2 - 10}">${T.idea}</text>
        <g data-k="youS"><g data-k="youSs"><path class="fa-star" d="${star(10, 4.5)}"/></g><g data-k="youSd"><path class="fa-star dim" d="${star(10, 4.5)}"/></g></g>
        <text class="fa-note q" data-k="stl" x="${RX}" y="${SY - 18}">${T.standing}</text>
        <g data-k="you">${person("youP", "you")}</g>
        <text class="fa-react g" data-k="safe" x="${RX}" y="${LAB}">${T.safe}</text>
        <text class="fa-react" data-k="back" x="${RX}" y="${LAB}">${T.back}</text>
        <text class="fa-react" data-k="want" x="${RX}" y="${LAB}">${T.want}</text>
        <text class="fa-react" data-k="hold" x="${RX}" y="${LAB}">${T.hold}</text>
        <text class="fa-react" data-k="own" x="${RX}" y="${LAB}">${T.own}</text>
        <text class="fa-react g" data-k="chosen" x="${RX}" y="${LAB}">${T.chosen}</text>
        <g data-k="list">
          <text class="fa-lh m" data-k="lh" x="${LX + T.chipW / 2}" y="${LY - 22}">${T.lhA}</text>
          <text class="fa-lh" data-k="lh2" x="${LX + T.chipW + 21}" y="${LY - 22}">${T.lhB}</text>
          ${rows}</g>`;
    },
    S0: { you: 0, yx: HOME, cross: 0, reach: 0, look: 0, mood: .35, ring: 0, mine: 0, wall: 0, win: 0, bulge: 0, dentOn: 1,
      steer: 0, steerIn: 0, star: 0, dim: 0, stl: 0, offer: 0, cardP: 0, cardB: 0, safe: 0, p0: 0, p1: 0, p2: 0,
      fr: 0, frDim: 0, fP: 0, book: 0, bx: BHAND, ok: 0, bub: 0, flip: 0, rv: 0, rstar: 0, rb: 0, cmp: 0,
      back: 0, want: 0, hold: 0, own: 0, chosen: 0, list: 0, lh: 0, lOut: 0, cut: 0, idea: 0, push: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const tr = (key, s) => k(key).setAttribute("transform", s);
      const face = (key, look, mood) => {
        tr(key + "E", `translate(${f1(look * 1.3)} 0)`);
        k(key + "M").setAttribute("d", `M${f1(-2.4 + look * 1.1)} -32.6 Q${f1(look * 1.1)} ${f1(-32.6 + 2.8 * mood)} ${f1(2.4 + look * 1.1)} -32.6`);
      };
      // pushes that press on the circle: the pushy card (flies in, bounces off), then the book
      const cw = T.signW, cOff = 400 + cw / 2 + 10, cHit = EDGE - 9 + cw / 2 + 1.5, cRest = EDGE + 58 + cw / 2;
      const cx = S.cardB > 0 ? lerp(cHit, cRest, S.cardB) : lerp(cOff, cHit, S.cardP);
      const dent = x => Math.max(-16, Math.min(0, x - 1.5 - EDGE));
      const D = (dent(cx - cw / 2) * (S.offer > 0 ? 1 : 0) + dent(S.bx - BW / 2) * (S.book > 0 ? 1 : 0)) * S.dentOn;
      const d = ring(20 + (R - 20) * S.ring, D, 12 * S.bulge);
      for (const r of ["ring", "ringW", "ringG"]) k(r).setAttribute("d", d);
      op("ring", S.ring * 2 * (1 - S.win) * (1 - S.wall)); op("ringW", S.wall); op("ringG", S.win);
      op("mine", S.mine);
      // everyone wants to steer you
      k("steerP").setAttribute("d", STEER.map(steer).join(" "));
      tr("steer", `translate(${RX} ${RY}) scale(${(1 - .08 * S.steerIn).toFixed(3)}) translate(${-RX} ${-RY})`);
      op("steer", S.steer);
      tr("offer", `translate(${f1(cx)} ${CY})`); op("offer", S.offer);
      op("safe", S.safe);
      // you: position, arms, face, and your star
      const yx = S.yx, SY = G - 41.5 * SC - 22;
      tr("you", `translate(${f1(yx)} ${G}) scale(${SC})`); op("you", S.you);
      k("youPA").setAttribute("d", arms({ cross: S.cross, reach: S.reach }));
      face("youP", S.look, S.mood);
      const ss = S.star * (1 - .35 * S.dim);
      tr("youS", `translate(${f1(yx)} ${f1(SY)}) scale(${Math.max(.001, ss).toFixed(3)})`);
      op("youSs", 1 - S.dim); op("youSd", S.dim); op("youS", S.star);
      tr("stl", `translate(${f1(yx - HOME)} 0)`); op("stl", S.stl);
      // the bias being shown
      for (let i = 0; i < 3; i++) {
        const p = S["p" + i];
        tr("p" + i, `translate(12 21) scale(${(.8 + .2 * cl(p)).toFixed(3)}) translate(-12 -21)`);
        op("p" + i, p);
      }
      // the friend, the book and the speech bubble
      const fo = 1 - .72 * S.frDim;
      tr("fr", `translate(${FX} ${G}) scale(${SC})`); op("fr", S.fr * fo);
      k("frPA").setAttribute("d", arms({ push: S.fP }));
      face("frP", -.8, .5);
      op("bub", S.bub * fo); op("push", S.push);
      const flip = Math.abs(Math.cos(Math.PI * cl(S.flip)));
      tr("bubF", `translate(0 ${BUBY + 19}) scale(1 ${Math.max(.001, flip).toFixed(3)}) translate(0 ${-(BUBY + 19)})`);
      op("bm", S.flip < .5 ? 1 : 0); op("bd", S.flip < .5 ? 0 : 1);
      tr("book", `translate(${f1(S.bx)} ${CY})`); op("book", S.book); op("ok", S.ok);
      op("cut", S.cut); tr("cut", `translate(0 ${f1(8 * (1 - S.cut))})`);
      op("idea", S.idea);
      // the rising star
      tr("rv", `translate(${FX} ${G}) scale(${SC})`); op("rv", S.rv);
      k("rvPA").setAttribute("d", arms({ ask: 1 }));
      face("rvP", -.8, .7);
      tr("rstarS", `scale(${Math.max(.001, S.rstar).toFixed(3)})`); op("rstar", S.rstar);
      op("rb", S.rb); op("cmp", S.cmp); op("cmpT", S.cmp);
      // what you do
      for (const w of ["back", "want", "hold", "own", "chosen"]) op(w, S[w]);
      // recap list
      op("list", 1 - S.lOut); op("lh", S.lh); op("lh2", S.lh);
      for (let i = 0; i < 3; i++) {
        const p = cl(S.list - i);
        tr("l" + i, `translate(${f1(-8 * (1 - p))} 0)`); op("l" + i, p);
      }
    },
    beats: [
      { steps: [{ to: { you: 1 }, ms: 450, sfx: "pluck" }, { to: { ring: 1 }, ms: 800, ease: "out" }, { to: { mine: 1 }, ms: 300 },
        { to: { steer: 1 }, ms: 400 }, { to: { steerIn: 1 }, ms: 350, ease: "inOut" }, { to: { steerIn: 0 }, ms: 450, ease: "out" }] },
      { steps: [{ to: { steer: 0 }, ms: 300 }, { to: { star: 1, stl: 1 }, ms: 450, ease: "out" }, { wait: 300 },
        { to: { offer: 1 } }, { to: { cardP: 1 }, ms: 650, ease: "inOut" }, { to: { wall: 1 }, sfx: "thud" },
        { to: { cardB: 1, offer: .4, wall: 0 }, ms: 700 }, { to: { safe: 1 }, ms: 400 }] },
      { steps: [{ to: { safe: 0, offer: 0, stl: 0 }, ms: 300 }, { to: { p0: 1, fr: 1, book: 1, ok: 1 }, ms: 450, ease: "out", sfx: "pop" },
        { to: { bub: 1 }, ms: 350 }, { wait: 300 }, { to: { fP: 1, bx: BPUSH }, ms: 700, ease: "inOut" },
        { to: { yx: BACK, cross: 1, mood: -.7, look: 1 }, ms: 650, ease: "inOut", sfx: "spring" }, { to: { back: 1 }, ms: 300 }] },
      { steps: [{ to: { p0: 0, back: 0 }, ms: 250 }, { to: { p1: 1 }, ms: 350, ease: "out" }, { to: { flip: 1 }, ms: 450, sfx: "tick" },
        { to: { bx: BHAND, fP: .5 }, ms: 600, ease: "inOut" },
        { to: { yx: FWD, cross: 0, reach: 1, mood: .9, bulge: 1 }, ms: 750, ease: "inOut" }, { to: { want: 1 }, ms: 300 }] },
      { steps: [{ to: { p1: 0, want: 0, fr: 0, book: 0, bub: 0, bulge: 0, reach: 0 }, ms: 400 },
        { to: { yx: HOME, mood: .3, look: 0 }, ms: 500, ease: "inOut" }, { to: { p2: 1, rv: 1, stl: 1 }, ms: 400, ease: "out" },
        { to: { rstar: 1 }, ms: 450, ease: "out" }, { to: { rb: 1 }, ms: 300 }, { wait: 200 },
        { to: { cmp: 1, dim: 1, look: .8, mood: -.2 }, ms: 600 }, { wait: 200 },
        { to: { cross: 1, wall: 1, mood: -.6, look: -.9, hold: 1 }, ms: 500, sfx: "thud" }], hold: 2400 },
      { steps: [{ to: { p2: 0, rv: 0, rstar: 0, rb: 0, cmp: 0, hold: 0, wall: 0, cross: 0, look: 0, mood: 0, dim: 0 }, ms: 450 },
        { to: { lh: 1 }, ms: 300 }, { to: { list: 3 }, ms: 1200, ease: "lin", sfx: "tick" }] },
      { steps: [{ to: { lOut: 1 }, ms: 400 }, { to: { flip: 0, bx: BHAND, fP: 1 } },
        { to: { fr: 1, book: 1, bub: 1 }, ms: 450 }, { wait: 400 },
        { to: { bx: BSEP }, ms: 700, ease: "inOut" }, { to: { cut: 1 }, ms: 400, sfx: "scribble" },
        { to: { frDim: 1, push: 1, idea: 1 }, ms: 450 }] },
      { steps: [{ to: { dentOn: 0 } }, { to: { idea: 0, cut: 0, fr: 0, bub: 0, push: 0 }, ms: 350 },
        { to: { bx: BIN, look: 1, mood: .5 }, ms: 850, ease: "inOut" }, { to: { own: 1 }, ms: 350 }, { wait: 900 },
        { to: { own: 0, chosen: 1, win: 1, mood: 1, reach: .6 }, ms: 600, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
