/* Family: mind reading. You and three people. You draw dashed thought bubbles over their heads,
   then their real thoughts arrive and push your guesses up and out of the way. Three members of the
   family, one per person: illusion of transparency, curse of knowledge, illusion of asymmetric insight.
   The fix: ask, and their thoughts become things they say. Scene for anim.js. */
(function () {
  const KEY = "family-minds", P = `.bp[data-scene="${KEY}"]`;
  const X = [176, 262, 348], HY = 198, S2 = 1.3;        // the three others: head centres, bust scale
  const YX = 62, YY = 186, S1 = 1.7;                     // you
  const LOW = 150, UP = 94, BW = 80, BH = 36;            // their thought row, where your guesses get pushed, bubble size
  const MX = 70, MY = 128, MW = 104, MH = 44;            // your own thought bubble
  const SX0 = 12, SY0 = 106, SW = 116, SH = 40;          // your speech bubble
  const PY = 240, PH = 18;                               // the bias-name pill
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const f2 = n => +n.toFixed(2);
  const sm = u => { u = cl(u); return u * u * (3 - 2 * u); };
  const lerp = (a, b, t) => a + (b - a) * t;
  // your coffee thought, copied from your bubble to theirs on a low arc
  const fly = (x0, y0, x1, y1, t) => {
    const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 55, u = 1 - t;
    return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1];
  };
  // a guess leaving your head: up, small, along the free lane at y = LANE, then down onto its person
  const LANE = 58;
  const flyG = (x0, y0, x1, y1, t) => [x0 + (x1 - x0) * sm(t / .8),
    t < .5 ? lerp(y0, LANE, sm(t / .3)) : lerp(LANE, y1, sm((t - .7) / .3)), .15 + .4 * sm(t / .7) + .45 * sm((t - .7) / .3)];

  // head and shoulders, head centre (x, y), scale s
  const bust = (x, y, s) => {
    const p = (dx, dy) => `${f1(x + dx * s)} ${f1(y + dy * s)}`;
    return `<path d="M${p(-13, 25)} L${p(-13, 21)} C${p(-13, 14)} ${p(-7, 10.5)} ${p(0, 10.5)} C${p(7, 10.5)} ${p(13, 14)} ${p(13, 21)} L${p(13, 25)}"/>` +
      `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(6.5 * s)}"/>`;
  };
  const eyes = (x, y, s) => `<circle class="e" cx="${f1(x - 2.4 * s)}" cy="${f1(y - .5 * s)}" r="${f1(1.05 * s)}"/>` +
    `<circle class="e" cx="${f1(x + 2.4 * s)}" cy="${f1(y - .5 * s)}" r="${f1(1.05 * s)}"/>`;
  const bun = (x, y, s) => `<circle cx="${f1(x + 5.4 * s)}" cy="${f1(y - 4.6 * s)}" r="${f1(2.6 * s)}"/>`;   // at the back, clear of the thought dots
  const specs = (x, y, s) => `<g class="gl"><circle cx="${f1(x - 2.5 * s)}" cy="${f1(y - .5 * s)}" r="${f1(2.1 * s)}"/>` +
    `<circle cx="${f1(x + 2.5 * s)}" cy="${f1(y - .5 * s)}" r="${f1(2.1 * s)}"/><path d="M${f1(x - .4 * s)} ${f1(y - .7 * s)} H${f1(x + .4 * s)}"/></g>`;
  const smile = (x, y, s) => `M${f1(x - 2.6 * s)} ${f1(y + 2.4 * s)} Q${f1(x)} ${f1(y + 5 * s)} ${f1(x + 2.6 * s)} ${f1(y + 2.4 * s)}`;
  // a person inside a bubble: cls picks the colour, dashed for a blurry guess
  const mini = (cls, x, y, s, glasses) => `<g class="fm-mini ${cls}">${bust(x, y, s)}${glasses ? specs(x, y, s) : eyes(x, y, s)}</g>`;
  const tick = (cls, x, y, s = 1) => `<path class="${cls}" d="M${f1(x - 5 * s)} ${f1(y)} L${f1(x - 1.5 * s)} ${f1(y + 3.6 * s)} L${f1(x + 5.4 * s)} ${f1(y - 4 * s)}"/>`;
  // one or two lines of text, centred on (0, 0)
  const lines = (cls, L, dy = 0) => L.map((s, i) => `<text class="${cls}" y="${f1(dy + (L.length === 1 ? 4 : i * 13.5 - 2.6))}">${s}</text>`).join("");
  // a thought bubble centred on (0, 0) with two dots trailing down to a head
  const dots = (cls, key, w, h, dx = 0) => `<g class="${cls}" data-k="${key}"><circle cx="${f1(dx - 2)}" cy="${f1(h / 2 + 8)}" r="2.6"/><circle cx="${f1(dx - 4)}" cy="${f1(h / 2 + 16)}" r="1.8"/></g>`;
  const shell = (cls, w, h, key) => `<rect class="${cls}"${key ? ` data-k="${key}"` : ""} x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}"/>`;
  // rounded box with a tail pointing down at (tx, y0 + h + th)
  const callout = (x0, y0, w, h, r, tx, th, dx = 0) => `M${x0 + r} ${y0} H${x0 + w - r} Q${x0 + w} ${y0} ${x0 + w} ${y0 + r} V${y0 + h - r} Q${x0 + w} ${y0 + h} ${x0 + w - r} ${y0 + h}` +
    ` H${tx + 6} L${tx + dx} ${y0 + h + th} L${tx - 6} ${y0 + h} H${x0 + r} Q${x0} ${y0 + h} ${x0} ${y0 + h - r} V${y0 + r} Q${x0} ${y0} ${x0 + r} ${y0} Z`;
  // a pill with a notch pointing up at nx
  const pill = (x0, y0, w, h, nx) => { const r = h / 2;
    return `M${x0 + r} ${y0} H${nx - 5} L${nx} ${y0 - 6} L${nx + 5} ${y0} H${x0 + w - r} Q${x0 + w} ${y0} ${x0 + w} ${y0 + r} Q${x0 + w} ${y0 + h} ${x0 + w - r} ${y0 + h}` +
      ` H${x0 + r} Q${x0} ${y0 + h} ${x0} ${y0 + r} Q${x0} ${y0} ${x0 + r} ${y0} Z`; };
  const badge = (cls, key) => `<g class="fm-bdg ${cls}" data-k="${key}" transform="translate(${BW / 2 - 6} ${-BH / 2 + 3})"><circle r="7"/>` +
    (cls === "x" ? `<path d="M-2.6 -2.6 L2.6 2.6 M2.6 -2.6 L-2.6 2.6"/>` : `<path d="M-3 .2 L-.9 2.4 L3.2 -2.4"/>`) + `</g>`;
  const CUP = `<path d="M-4.8 -3.2 H3 V1.6 Q3 4.8 -0.9 4.8 Q-4.8 4.8 -4.8 1.6 Z M3 -1.6 Q5.9 -1.6 5.9 0.4 Q5.9 2.4 3 2.4 M-2.4 -5.8 V-6.8 M0.6 -5.8 V-6.8"/>`;

  window.BiasAnim.SCENES[KEY] = {
    q: "nem", viewBox: "0 0 400 272",
    css: `
      ${P} .fm-p path,${P} .fm-p circle{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fm-p .e{fill:var(--ink);stroke:none}
      ${P} .fm-p .gl circle,${P} .fm-p .gl path{fill:none;stroke-width:1.6}
      ${P} .fm-p .sm{fill:none;stroke-width:1.8}
      ${P} .fm-y path,${P} .fm-y circle{fill:var(--surface);stroke:var(--q);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fm-y .e{fill:var(--q);stroke:none}
      ${P} .fm-y .mo{fill:none;stroke-width:1.8}
      ${P} .fm-y.g path,${P} .fm-y.g circle{stroke:var(--good)}
      ${P} .fm-y.g .e{fill:var(--good)}
      ${P} .fm-y .sw{fill:var(--surface);stroke-width:1.5}
      ${P} .fm-you{font:500 10px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .fm-b .t{font:600 11px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fm-b.h rect,${P} .fm-b.h circle{fill:var(--surface);stroke:var(--muted);stroke-width:1.8}
      ${P} .fm-b.h .qm{font:700 17px var(--display);fill:var(--muted);text-anchor:middle}
      ${P} .fm-b.g rect{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-dasharray:4.5 3.5}
      ${P} .fm-b.g .dd circle{fill:var(--surface);stroke:var(--q);stroke-width:1.5}
      ${P} .fm-b.g .t{fill:var(--q)}
      ${P} .fm-b.g .ic path{fill:none;stroke:var(--q);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fm-b.g rect.ok{fill:none;stroke:var(--good);stroke-width:2.2;stroke-dasharray:none}
      ${P} .fm-b.r .th{fill:var(--surface);stroke:var(--ink);stroke-width:1.8}
      ${P} .fm-b.r .dd circle{fill:var(--surface);stroke:var(--ink);stroke-width:1.5}
      ${P} .fm-b.r .sp{fill:var(--surface);stroke:var(--good);stroke-width:2.2;stroke-linejoin:round}
      ${P} .fm-b.m rect,${P} .fm-b.m .dd circle{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .fm-b.m .ic path{fill:none;stroke:var(--ink);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fm-mini path,${P} .fm-mini circle{fill:var(--surface);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fm-mini.i path,${P} .fm-mini.i circle{stroke:var(--ink)}
      ${P} .fm-mini.i .e{fill:var(--ink);stroke:none}
      ${P} .fm-mini.q path,${P} .fm-mini.q circle{stroke:var(--q)}
      ${P} .fm-mini.q .e{fill:var(--q);stroke:none}
      ${P} .fm-mini.f path,${P} .fm-mini.f circle{stroke:var(--q);stroke-width:1.4;stroke-dasharray:2 2.4;opacity:.75}
      ${P} .fm-mini.f .e{fill:var(--q);stroke:none;opacity:.75}
      ${P} .fm-mini .gl circle,${P} .fm-mini .gl path{fill:none;stroke-width:1.2}
      ${P} .fm-tk{fill:none;stroke:var(--q);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fm-tk.i{stroke:var(--ink)}
      ${P} .fm-qm{font:700 15px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .fm-bdg circle{fill:var(--surface);stroke-width:1.6}
      ${P} .fm-bdg path{fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fm-bdg.x circle,${P} .fm-bdg.x path{stroke:var(--bad)}
      ${P} .fm-bdg.v circle,${P} .fm-bdg.v path{stroke:var(--good)}
      ${P} .fm-say path{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fm-say .t{font:600 11.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fm-lab path{fill:var(--surface);stroke:var(--q);stroke-width:1.6;stroke-linejoin:round}
      ${P} .fm-lab text{font:500 10px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .fm-lg text{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .fm-lg rect{fill:none;stroke-width:1.6}
      ${P} .fm-lg .g{stroke:var(--q);stroke-dasharray:3.5 2.5}
      ${P} .fm-lg .r{stroke:var(--ink)}
      ${P} .fm-glow{fill:none;stroke:var(--q);stroke-width:2}
    `,
    text: {
      hu: {
        name: "Gondolatolvasás", shareTitle: "Miért hisszük, hogy tudjuk, mit gondolnak mások, 30 másodpercben",
        ecline: "Mások elméje nem a tiéd másolata, ezért kérdezz, ne feltételezz.",
        you: "te", lg: ["a tipped", "mit gondolnak valójában"],
        labs: ["Az átláthatóság illúziója", "A tudás átka", "Az aszimmetrikus belátás illúziója"],
        nervous: ["Annyira ideges vagy!"], calm: ["Annyira nyugodt vagy!"], got: ["Megértették!"], what: ["Mi az a", "gyorsítótár?"],
        cache: ["Csak töröld", "a gyorsítótárat."], ask: ["Mit gondolsz", "te?"],
        caps: [
          "Nem láthatsz mások fejébe, ezért <b>tippelsz</b>.",
          "Az agy rövidítése: feltételezi, hogy úgy gondolkodnak, <b>mint te</b>. Gyakran működik.",
          "Ideges vagy, és biztos vagy benne, hogy <b>látszik</b>. Kívülről alig látszik.",
          "Te jól ismered, ezért feltételezed, hogy <b>megértették</b>. Nem értették meg.",
          "Úgy érzed, <b>jobban</b> olvasod őket, mint ők téged.",
          "Közben ők is ugyanennyire biztosak benne, hogy <b>téged</b> olvasnak.",
          "<b>A megoldás:</b> ne töltsd ki helyettük a gondolataikat. <b>Kérdezz</b>, és figyelj.",
          "A valódi válasz jobb a legjobb tippednél, és az emberek <b>meghallgatva érzik magukat</b>."
        ],
        say: [
          "Nem láthatsz mások fejébe, ezért tippelsz, mire gondolnak.",
          "Az agy rövidítése: feltételezed, hogy úgy gondolkodnak, mint te. Az emberek sokat osztoznak, ezért ez gyakran működik.",
          "Az átláthatóság illúziója. Ideges vagy, és biztos vagy benne, hogy látszik. Kívülről alig látszik.",
          "A tudás átka. Te jól ismered, ezért feltételezed, hogy megértették. Nem értették meg.",
          "Az aszimmetrikus belátás illúziója. Úgy érzed, jobban olvasod őket, mint ők téged.",
          "Közben ők is ugyanennyire biztosak benne, hogy téged olvasnak.",
          "A megoldás: ne töltsd ki helyettük a gondolataikat. Kérdezz, és figyelj.",
          "A valódi válasz jobb a legjobb tippedénél, és az emberek meghallgatva érzik magukat.",
          "Gondolatolvasás. Mások elméje nem a tiéd másolata, ezért kérdezz, ne feltételezz."
        ]
      },
      en: {
        name: "Mind reading", shareTitle: "Why we think we know what others think, in 30 seconds",
        ecline: "Other minds aren't copies of yours, so ask instead of assuming.",
        you: "you", lg: ["your guess", "what they really think"],
        labs: ["Illusion of transparency", "Curse of knowledge", "Illusion of asymmetric insight"],
        nervous: ["So nervous!"], calm: ["So calm!"], got: ["Got it!"], what: ["What's a", "cache?"],
        cache: ["Just clear", "the cache."], ask: ["What do", "you think?"],
        caps: [
          "You can't see inside other people's heads, so you <b>guess</b>.",
          "The brain's shortcut: assume they think <b>like you</b>. Often it works.",
          "You're nervous and sure <b>it shows</b>. From outside, it barely does.",
          "You know it well, so you assume <b>they got it</b>. They didn't.",
          "You feel you read them <b>better</b> than they read you.",
          "Meanwhile, they're just as sure they can read <b>you</b>.",
          "<b>The fix:</b> don't fill in their thoughts. <b>Ask</b>, and listen.",
          "Real answers beat your best guess, and people <b>feel heard</b>."
        ],
        say: [
          "You can't see inside other people's heads, so you guess what they're thinking.",
          "The brain's shortcut: assume they think like you. People share a lot, so it often works.",
          "The illusion of transparency. You're nervous, and sure it shows. From the outside, it barely does.",
          "The curse of knowledge. You know it well, so you assume they got it. They didn't.",
          "The illusion of asymmetric insight. You feel you read them better than they read you.",
          "Meanwhile, they're just as sure they can read you.",
          "The fix: don't fill in their thoughts for them. Ask, and listen.",
          "Real answers beat your best guess, and people feel heard.",
          "Mind reading. Other minds aren't copies of yours, so ask instead of assuming."
        ]
      },
      el: {
        name: "Διαβάζουμε σκέψεις", shareTitle: "Γιατί νομίζουμε ότι ξέρουμε τι σκέφτονται οι άλλοι, σε 30 δευτερόλεπτα",
        ecline: "Το μυαλό των άλλων δεν είναι αντίγραφο του δικού σου, γι’ αυτό ρώτα αντί να υποθέτεις.",
        you: "εσύ", lg: ["το μάντεμά σου", "τι σκέφτονται στ’ αλήθεια"],
        labs: ["Ψευδαίσθηση διαφάνειας", "Κατάρα της γνώσης", "Ψευδαίσθηση ασύμμετρης γνώσης"],
        nervous: ["Τι άγχος!"], calm: ["Τι ηρεμία!"], got: ["Κατάλαβα!"], what: ["Τι είναι", "η cache;"],
        cache: ["Απλώς καθάρισε", "την cache."], ask: ["Εσείς τι λέτε;"],
        caps: [
          "Δεν βλέπεις τι έχουν οι άλλοι στο μυαλό τους, οπότε <b>μαντεύεις</b>.",
          "Το μυαλό σου κόβει δρόμο: υποθέτει ότι σκέφτονται <b>όπως εσύ</b>. Συχνά πετυχαίνει.",
          "Έχεις άγχος και νομίζεις ότι <b>φαίνεται</b>. Οι άλλοι σχεδόν δεν το βλέπουν.",
          "Εσύ το ξέρεις καλά, οπότε θεωρείς ότι <b>το έπιασαν</b>. Δεν το έπιασαν.",
          "Νιώθεις ότι τους καταλαβαίνεις <b>καλύτερα</b> απ’ ό,τι σε καταλαβαίνουν.",
          "Κι εκείνοι όμως πιστεύουν ακριβώς το ίδιο για <b>σένα</b>.",
          "<b>Η λύση:</b> μη συμπληρώνεις εσύ τις σκέψεις τους. <b>Ρώτα</b> και άκου.",
          "Η αληθινή απάντηση κερδίζει κάθε μάντεμα, κι οι άλλοι <b>νιώθουν ότι τους ακούς</b>."
        ],
        say: [
          "Δεν βλέπεις τι έχουν οι άλλοι στο μυαλό τους, οπότε μαντεύεις τι σκέφτονται.",
          "Το μυαλό σου κόβει δρόμο: υποθέτει ότι σκέφτονται όπως εσύ. Οι άνθρωποι έχουμε πολλά κοινά, γι’ αυτό συχνά πετυχαίνει.",
          "Ψευδαίσθηση διαφάνειας. Έχεις άγχος και νομίζεις ότι φαίνεται. Οι άλλοι σχεδόν δεν το βλέπουν.",
          "Κατάρα της γνώσης. Εσύ το ξέρεις καλά, οπότε θεωρείς ότι το έπιασαν. Δεν το έπιασαν.",
          "Ψευδαίσθηση ασύμμετρης γνώσης. Νιώθεις ότι τους καταλαβαίνεις καλύτερα απ’ ό,τι σε καταλαβαίνουν.",
          "Κι εκείνοι όμως πιστεύουν ακριβώς το ίδιο για σένα.",
          "Η λύση: μη συμπληρώνεις εσύ τις σκέψεις τους. Ρώτα και άκου.",
          "Η αληθινή απάντηση κερδίζει κάθε μάντεμα, κι οι άλλοι νιώθουν ότι τους ακούς.",
          "Διαβάζουμε σκέψεις. Το μυαλό των άλλων δεν είναι αντίγραφο του δικού σου, γι’ αυτό ρώτα αντί να υποθέτεις."
        ]
      },
      es: {
        name: "Leer mentes", shareTitle: "Por qué creemos saber lo que piensan los demás, en 30 segundos",
        ecline: "Las mentes ajenas no son copias de la tuya, así que pregunta en vez de suponer.",
        you: "tú", lg: ["tu suposición", "lo que piensan de verdad"],
        labs: ["Ilusión de transparencia", "Maldición del conocimiento", "Ilusión de conocimiento asimétrico"],
        nervous: ["¡Qué nervios!"], calm: ["¡Qué calma!"], got: ["¡Entendido!"], what: ["¿Qué es", "la caché?"],
        cache: ["Solo borra", "la caché."], ask: ["¿Tú qué", "opinas?"],
        caps: [
          "No puedes ver dentro de la cabeza de los demás, así que <b>supones</b>.",
          "El atajo del cerebro: suponer que piensan <b>como tú</b>. A menudo funciona.",
          "Tienes nervios y crees que <b>se notan</b>. Desde fuera, apenas se ven.",
          "Lo conoces bien, así que das por hecho que <b>lo han entendido</b>. No es así.",
          "Sientes que los lees <b>mejor</b> de lo que ellos te leen a ti.",
          "Mientras, ellos creen con la misma certeza que te leen <b>a ti</b>.",
          "<b>La solución:</b> no completes sus pensamientos. <b>Pregunta</b> y escucha.",
          "Las respuestas reales superan tu mejor suposición, y la gente <b>se siente escuchada</b>."
        ],
        say: [
          "No puedes ver dentro de la cabeza de los demás, así que supones lo que piensan.",
          "El atajo del cerebro: suponer que piensan como tú. Las personas compartimos mucho, así que a menudo funciona.",
          "La ilusión de transparencia. Tienes nervios, y crees que se notan. Desde fuera, apenas se ven.",
          "La maldición del conocimiento. Lo conoces bien, así que das por hecho que lo han entendido. No es así.",
          "La ilusión de conocimiento asimétrico. Sientes que los lees mejor de lo que ellos te leen a ti.",
          "Mientras, ellos creen con la misma certeza que te leen a ti.",
          "La solución: no completes sus pensamientos por ellos. Pregunta, y escucha.",
          "Las respuestas reales superan tu mejor suposición, y la gente se siente escuchada.",
          "Leer mentes. Las mentes ajenas no son copias de la tuya, así que pregunta en vez de suponer."
        ]
      },
      fr: {
        name: "Lire les pensées", shareTitle: "Pourquoi on croit savoir ce que pensent les autres, en 30 secondes",
        ecline: "L’esprit des autres n’est pas une copie du vôtre, alors demandez au lieu de supposer.",
        you: "vous", lg: ["votre supposition", "ce qu’ils pensent vraiment"],
        labs: ["Illusion de transparence", "Malédiction du savoir", "Illusion de connaissance asymétrique"],
        nervous: ["Quel trac !"], calm: ["Quel calme !"], got: ["Compris !"], what: ["C’est quoi,", "le cache ?"],
        cache: ["Videz juste", "le cache."], ask: ["Qu’en", "pensez-vous ?"],
        caps: [
          "Vous ne voyez pas dans la tête des autres, alors vous <b>devinez</b>.",
          "Le raccourci du cerveau : supposer qu’ils pensent <b>comme vous</b>. Ça marche souvent.",
          "Vous avez le trac et êtes sûr que <b>ça se voit</b>. De l’extérieur, à peine.",
          "Vous connaissez bien le sujet, alors vous croyez qu’<b>ils ont compris</b>. Non.",
          "Vous pensez les lire <b>mieux</b> qu’ils ne vous lisent.",
          "Pendant ce temps, ils sont tout aussi sûrs de <b>vous</b> lire.",
          "<b>La solution :</b> ne pensez pas à leur place. <b>Demandez</b>, et écoutez.",
          "Une vraie réponse bat toute supposition, et les gens <b>se sentent écoutés</b>."
        ],
        say: [
          "Vous ne voyez pas dans la tête des autres, alors vous devinez ce qu’ils pensent.",
          "Le raccourci du cerveau : supposer qu’ils pensent comme vous. Nous avons beaucoup en commun, alors ça marche souvent.",
          "L’illusion de transparence. Vous avez le trac, et vous êtes sûr que ça se voit. De l’extérieur, ça se voit à peine.",
          "La malédiction du savoir. Vous connaissez bien le sujet, alors vous croyez qu’ils ont compris. Ce n’est pas le cas.",
          "L’illusion de connaissance asymétrique. Vous pensez les lire mieux qu’ils ne vous lisent.",
          "Pendant ce temps, ils sont tout aussi sûrs de vous lire.",
          "La solution : ne remplissez pas leurs pensées à leur place. Demandez, et écoutez.",
          "Une vraie réponse vaut mieux que votre meilleure supposition, et les gens se sentent écoutés.",
          "Lire les pensées. L’esprit des autres n’est pas une copie du vôtre, alors demandez au lieu de supposer."
        ]
      },
      de: {
        name: "Gedankenlesen", shareTitle: "Warum wir glauben zu wissen, was andere denken, in 30 Sekunden",
        ecline: "Andere Köpfe sind keine Kopien deines eigenen, also frag, statt zu vermuten.",
        you: "du", lg: ["deine Vermutung", "was sie wirklich denken"],
        labs: ["Transparenzillusion", "Fluch des Wissens", "Illusion asymmetrischer Einsicht"],
        nervous: ["So nervös!"], calm: ["So ruhig!"], got: ["Kapiert!"], what: ["Was ist ein", "Cache?"],
        cache: ["Lösch einfach", "den Cache."], ask: ["Was meinst", "du dazu?"],
        caps: [
          "Du kannst nicht in andere Köpfe schauen, also <b>rätst</b> du.",
          "Die Abkürzung des Gehirns: Andere denken <b>wie du</b>. Oft klappt das.",
          "Du bist nervös und sicher, <b>man sieht es dir an</b>. Von außen sieht man kaum etwas.",
          "Du kennst dich aus, also nimmst du an, <b>es ist angekommen</b>. Ist es nicht.",
          "Du glaubst, du durchschaust andere <b>besser</b> als sie dich.",
          "Dabei sind sie genauso sicher, dass sie <b>dich</b> durchschauen.",
          "<b>Die Lösung:</b> Denk nicht für andere mit. <b>Frag</b> und hör zu.",
          "Echte Antworten schlagen jede Vermutung, und andere <b>fühlen sich gehört</b>."
        ],
        say: [
          "Du kannst nicht in andere Köpfe schauen, also rätst du, was sie denken.",
          "Die Abkürzung des Gehirns: Andere denken wie du. Menschen haben viel gemeinsam, also klappt das oft.",
          "Die Transparenzillusion. Du bist nervös, und sicher, dass man es dir ansieht. Von außen sieht man kaum etwas.",
          "Der Fluch des Wissens. Du kennst dich gut aus, also nimmst du an, dass es angekommen ist. Ist es nicht.",
          "Die Illusion asymmetrischer Einsicht. Du glaubst, du durchschaust andere besser als sie dich.",
          "Dabei sind sie genauso sicher, dass sie dich durchschauen.",
          "Die Lösung: Denk nicht für andere mit. Frag, und hör zu.",
          "Echte Antworten schlagen deine beste Vermutung, und andere fühlen sich gehört.",
          "Gedankenlesen. Andere Köpfe sind keine Kopien deines eigenen, also frag, statt zu vermuten."
        ]
      },
      it: {
        name: "Leggere la mente", shareTitle: "Perché crediamo di sapere cosa pensano gli altri, in 30 secondi",
        ecline: "Le menti degli altri non sono copie della tua, quindi chiedi invece di supporre.",
        you: "tu", lg: ["la tua ipotesi", "ciò che pensano davvero"],
        labs: ["Illusione di trasparenza", "Maledizione della conoscenza", "Illusione di comprensione asimmetrica"],
        nervous: ["Che ansia!"], calm: ["Che calma!"], got: ["Capito!"], what: ["Cos’è", "la cache?"],
        cache: ["Svuota solo", "la cache."], ask: ["Tu che", "ne pensi?"],
        caps: [
          "Non puoi vedere nella testa degli altri, quindi <b>tiri a indovinare</b>.",
          "La scorciatoia del cervello: pensare che ragionino <b>come te</b>. Spesso funziona.",
          "Sei in ansia e credi che <b>si veda</b>. Da fuori, si nota appena.",
          "Lo sai bene, quindi pensi che <b>abbia capito</b>. Non è così.",
          "Ti sembra di leggere gli altri <b>meglio</b> di quanto loro leggano te.",
          "Intanto, loro sono altrettanto sicuri di leggere <b>te</b>.",
          "<b>La soluzione:</b> non riempire tu i loro pensieri. <b>Chiedi</b>, e ascolta.",
          "Le risposte vere battono la tua ipotesi migliore, e le persone <b>si sentono ascoltate</b>."
        ],
        say: [
          "Non puoi vedere nella testa degli altri, quindi tiri a indovinare cosa pensano.",
          "La scorciatoia del cervello: pensare che ragionino come te. Le persone hanno molto in comune, quindi spesso funziona.",
          "L’illusione di trasparenza. Sei in ansia, e credi che si veda. Da fuori, si nota appena.",
          "La maledizione della conoscenza. Lo sai bene, quindi pensi che abbia capito. Non è così.",
          "L’illusione di comprensione asimmetrica. Ti sembra di leggere gli altri meglio di quanto loro leggano te.",
          "Intanto, loro sono altrettanto sicuri di leggere te.",
          "La soluzione: non riempire tu i loro pensieri. Chiedi, e ascolta.",
          "Le risposte vere battono la tua ipotesi migliore, e le persone si sentono ascoltate.",
          "Leggere la mente. Le menti degli altri non sono copie della tua, quindi chiedi invece di supporre."
        ]
      }
    },
    svg(T) {
      // the three others: plain, a bun, glasses
      let people = "";
      X.forEach((x, i) => {
        people += `<g class="fm-p" data-k="p${i}">${i === 1 ? bun(x, HY, S2) : ""}${bust(x, HY, S2)}${i === 2 ? specs(x, HY, S2) : ""}${eyes(x, HY, S2)}` +
          `<path class="sm" data-k="sm${i}" d="${smile(x, HY, S2)}"/></g>`;
      });
      // their bubbles: hidden "?", your coffee copy, your guess, their real thought
      const G = [T.nervous, T.got], R = [T.calm, T.what];
      let hid = "", cof = "", gs = "", rs = "";
      X.forEach((x, i) => {
        hid += `<g class="fm-b h" data-k="h${i}">${dots("dd", `h${i}d`, BW, BH)}${shell("", BW, BH)}<text class="qm" y="6">?</text></g>`;
        cof += `<g class="fm-b g" data-k="c${i}">${dots("dd", `c${i}d`, BW, BH)}${shell("", BW, BH)}` +
          `<g data-k="c${i}ok">${shell("ok", BW, BH)}</g><g class="ic" transform="scale(1.6)">${CUP}</g>${badge("v", `c${i}v`)}</g>`;
        const gIn = i < 2 ? lines("t", G[i]) : `${mini("f", -12, -6, .8)}<text class="fm-qm" x="16" y="5.5">?</text>`;
        gs += `<g class="fm-b g" data-k="g${i}">${dots("dd", `g${i}d`, BW, BH)}${shell("", BW, BH)}${gIn}${badge("x", `g${i}x`)}</g>`;
        const rIn = i < 2 ? lines("t", R[i]) : `${mini("q", -12, -6, .8)}${tick("fm-tk i", 16, 0)}`;
        rs += `<g class="fm-b r" data-k="r${i}">${dots("dd", `r${i}d`, BW, BH)}${shell("th", BW, BH, `r${i}th`)}` +
          `<path class="sp" data-k="r${i}sp" d="${callout(-BW / 2, -BH / 2, BW, BH, BH / 2, 0, 15, -3)}"/>${rIn}</g>`;
      });
      // the bias names, each under its person
      let labs = "";
      T.labs.forEach((s, i) => {
        const w = s.length * 6 + 22, cx = Math.max(12 + w / 2, Math.min(388 - w / 2, X[i]));
        labs += `<g class="fm-lab" data-k="lab${i}"><path d="${pill(f1(cx - w / 2), PY, w, PH, X[i])}"/><text x="${f1(cx)}" y="${PY + 12.5}">${s}</text></g>`;
      });
      const sayMid = SX0 + SW / 2;
      return `
        <g class="fm-lg"><g data-k="lg1"><rect class="g" x="12" y="12" width="18" height="10" rx="5"/><text x="36" y="21">${T.lg[0]}</text></g>
          <g data-k="lg2"><rect class="r" x="12" y="29" width="18" height="10" rx="5"/><text x="36" y="38">${T.lg[1]}</text></g></g>
        <rect class="fm-glow" data-k="glowM"/><rect class="fm-glow" data-k="glowR"/>
        ${people}
        <g data-k="you">
          <g class="fm-y" data-k="youQ">${bust(0, 0, S1)}${eyes(0, 0, S1)}
            <path class="mo" data-k="mw" d="M-4.6 5.4 Q-2.3 3.6 0 5.4 Q2.3 7.2 4.6 5.4"/>
            <g data-k="sweat"><path class="sw" d="M-15.5 -12 Q-12.6 -7.6 -15.5 -5.6 Q-18.4 -7.6 -15.5 -12 Z"/><path class="sw" d="M15 -16 Q17.4 -12.4 15 -10.6 Q12.6 -12.4 15 -16 Z"/></g></g>
          <g class="fm-y g" data-k="youG">${bust(0, 0, S1)}${eyes(0, 0, S1)}<path class="mo" d="${smile(0, 0, S1)}"/></g>
          <text class="fm-you" y="${f1(25 * S1 + 16)}">${T.you}</text></g>
        <g class="fm-b m" data-k="mine">${dots("dd", "mined", MW, MH, -4)}${shell("", MW, MH)}
          <g class="ic" data-k="myCup" transform="scale(2)">${CUP}</g>
          <g data-k="myPic">${mini("i", -16, -7, 1, true)}${tick("fm-tk", 22, 0, 1.2)}</g></g>
        <g class="fm-say" data-k="say"><path d="${callout(SX0, SY0, SW, SH, 12, 60, 16, -2)}"/>
          <g data-k="sayA" transform="translate(${sayMid} ${SY0 + SH / 2})">${lines("t", T.cache)}</g>
          <g data-k="sayB" transform="translate(${sayMid} ${SY0 + SH / 2})">${lines("t", T.ask)}</g></g>
        ${hid}${rs}${cof}${gs}
        ${labs}`;
    },
    S0: { you: 0, ppl: 0, hid: 0, mine: 0, myCup: 0, myPic: 0, cf: 0, cok: 0, cfOut: 0, lg1: 0, lg2: 0,
      nerv: 0, shake: 0, g0: 0, g1: 0, g2: 0, u0: 0, u1: 0, u2: 0, r0: 0, r1: 0, r2: 0,
      lab0: 0, lab1: 0, lab2: 0, say: 0, sayA: 0, sayB: 0, glow: 0, gOut: 0, win: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = f2(cl(v)); };
      const at = (key, x, y, s = 1) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)}) scale(${f2(Math.max(.01, s))})`);
      // you: a small shake while nervous, green once you ask
      const shx = S.nerv * 1.4 * Math.sin(S.shake * Math.PI * 16);
      k("you").setAttribute("transform", `translate(${f1(YX + shx)} ${YY})`);
      op("you", S.you); op("youQ", 1 - S.win); op("youG", S.win);
      op("sweat", S.nerv); op("mw", S.nerv);
      k("sweat").setAttribute("transform", `translate(0 ${f1(3 * (1 - S.nerv))})`);
      // the others, one after another
      X.forEach((x, i) => {
        op("p" + i, (S.ppl - i * .2) / .6);
        op("sm" + i, S.win);
        // their hidden minds: a "?" each, until your copy lands on it
        const h = cl((S.hid - i * .25) / .5), ct = sm((S.cf - i * .2) / .6), land = cl((ct - .8) / .2);
        at("h" + i, x, LOW, .7 + .3 * h); op("h" + i, h * 1.6 * (1 - land));
        // your coffee thought, copied into their heads; then it turns out right
        const [cx, cy] = fly(MX, MY, x, LOW, ct);
        at("c" + i, cx, cy, .3 + .7 * ct); op("c" + i, (ct > 0 ? ct * 5 : 0) * (1 - S.cfOut));
        op(`c${i}d`, land); op(`c${i}ok`, S.cok); op(`c${i}v`, S.cok);
        // your guess: flies from your head, then gets pushed up and crossed out
        const g = S["g" + i], u = sm(S["u" + i]), [gx, gy, gs] = flyG(YX + 8, YY - 14, x, LOW, g);
        at("g" + i, gx, gy - (LOW - UP) * u, gs);
        op("g" + i, (g > 0 ? g * 5 : 0) * (1 - .4 * u) * (1 - S.gOut));
        op(`g${i}d`, cl((g - .85) / .15) * (1 - u)); op(`g${i}x`, u);
        // what they really think; once you ask, they say it
        const r = S["r" + i];
        at("r" + i, x, LOW, .7 + .3 * cl(r)); op("r" + i, r * 1.6);
        op(`r${i}d`, 1 - S.win); op(`r${i}th`, 1 - S.win); op(`r${i}sp`, S.win);
        op("lab" + i, S["lab" + i]);
        k("lab" + i).setAttribute("transform", `translate(0 ${f1(5 * (1 - S["lab" + i]))})`);
      });
      // your own thought bubble and your speech bubble
      at("mine", MX, MY, .7 + .3 * cl(S.mine)); op("mine", S.mine * 1.6);
      op("myCup", S.myCup); op("myPic", S.myPic);
      const sx = SX0 + 60, sy = SY0 + SH + 16, ss = f2(.7 + .3 * cl(S.say));
      k("say").setAttribute("transform", `translate(${sx} ${sy}) scale(${ss}) translate(${-sx} ${-sy})`);
      op("say", S.say * 1.6); op("sayA", S.sayA); op("sayB", S.sayB);
      op("lg1", S.lg1); op("lg2", S.lg2);
      // the mirror: your bubble and theirs light up together
      const e = 3 + 5 * S.glow, go = S.glow > 0 && S.glow < 1 ? 1 - S.glow : 0;
      const ring = (key, x0, y0, w, h) => {
        const g = k(key); g.setAttribute("x", f1(x0 - e)); g.setAttribute("y", f1(y0 - e));
        g.setAttribute("width", f1(w + 2 * e)); g.setAttribute("height", f1(h + 2 * e)); g.setAttribute("rx", f1(h / 2 + e));
        g.style.opacity = f2(go);
      };
      ring("glowM", MX - MW / 2, MY - MH / 2, MW, MH);
      ring("glowR", X[2] - BW / 2, LOW - BH / 2, BW, BH);
    },
    beats: [
      { steps: [{ to: { you: 1 }, ms: 450, sfx: "pluck" }, { to: { ppl: 1 }, ms: 700 }, { wait: 200 }, { to: { hid: 1 }, ms: 800 }], hold: 2400 },
      { steps: [{ to: { mine: 1, myCup: 1 }, ms: 450, ease: "back" }, { wait: 300 }, { to: { cf: 1, lg1: 1 }, ms: 1200, ease: "lin", sfx: "whoosh" },
        { wait: 300 }, { to: { cok: 1 }, ms: 500 }] },
      { steps: [{ to: { mine: 0, cfOut: 1 }, ms: 400 }, { to: { myCup: 0, lab0: 1, nerv: 1 }, ms: 400 },
        { to: { g0: 1, shake: 1 }, ms: 1100, ease: "lin", sfx: "scribble" }, { wait: 700 },
        { to: { u0: 1 }, ms: 450, ease: "inOut" }, { to: { r0: 1, lg2: 1 }, ms: 450, ease: "back", sfx: "pop" }], hold: 2400 },
      { steps: [{ to: { nerv: 0, lab0: 0 }, ms: 350 }, { to: { lab1: 1, say: 1, sayA: 1 }, ms: 450, ease: "back" }, { wait: 400 },
        { to: { g1: 1 }, ms: 1100, ease: "lin" }, { wait: 600 },
        { to: { u1: 1 }, ms: 450, ease: "inOut" }, { to: { r1: 1 }, ms: 450, ease: "back", sfx: "pop" }], hold: 2400 },
      { steps: [{ to: { say: 0, lab1: 0 }, ms: 350 }, { to: { sayA: 0 } }, { to: { lab2: 1, mine: 1, myPic: 1 }, ms: 450, ease: "back", sfx: "tick" },
        { wait: 400 }, { to: { g2: 1 }, ms: 1100, ease: "lin" }], hold: 2600 },
      { steps: [{ to: { u2: 1 }, ms: 450, ease: "inOut" }, { to: { r2: 1 }, ms: 450, ease: "back", sfx: "spring" }, { wait: 200 },
        { to: { glow: 1 }, ms: 700, ease: "lin" }, { to: { glow: 0 } }, { to: { glow: 1 }, ms: 700, ease: "lin" }, { to: { glow: 0 } }], hold: 2400 },
      { steps: [{ to: { gOut: 1, lab2: 0, lg1: 0, lg2: 0, mine: 0 }, ms: 600, sfx: "whoosh" }, { to: { myPic: 0 } },
        { to: { say: 1, sayB: 1 }, ms: 450, ease: "back" }] },
      { steps: [{ wait: 200 }, { to: { win: 1 }, ms: 900, ease: "inOut", sfx: "chime", sfxAt: 300 }], hold: 4200 }
    ]
  };
})();
