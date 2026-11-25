/* Fundamental attribution error: a driver cuts in front of you, then you cut in front of someone,
   and the same move gets two different labels. Every car follows a fixed path, so each run is identical. Scene for anim.js. */
(function () {
  const KEY = "fundamental-attribution-error", P = `.bp[data-scene="${KEY}"]`;
  const LW = 28;                                        // lane width (two lanes per road)
  const RA = 52, RB = 166;                              // top edges of road A (you get cut off) and road B (you cut in)
  const upA = RA + LW / 2, loA = RA + LW * 1.5, upB = RB + LW / 2, loB = RB + LW * 1.5;
  const AY = 56;                                        // road A sits this much lower while it is the only story
  const YOU = 120, CUT = 206;                           // the car that gets cut off, and where each cut-in ends
  const X0 = -36, SW = 162;                             // cut-ins start off-frame in the fast lane and swerve in from here
  const TW = 132, TH = 28, TA = loA + 24, TB = loB + 24; // verdict tags hang under the car that cut in
  const CX = CUT + 38, CY = -5, CH = 50;                // the hidden-situation card (road A coordinates)
  const BA = 84;                                        // your "what a jerk" thought, centre x
  const cl = v => Math.max(0, Math.min(1, v));
  const f2 = n => +n.toFixed(2);
  const sm = u => { u = cl(u); return u * u * (3 - 2 * u); };
  // a cutting car at progress p: straight along the fast lane, then an S-curve into the slow lane
  const cutAt = (p, up, lo) => {
    const x = X0 + (CUT - X0) * p, u = (x - SW) / (CUT - SW), d = u > 0 && u < 1 ? 6 * u * (1 - u) : 0;
    return [x, up + (lo - up) * sm(u), .55 * Math.atan((lo - up) * d / (CUT - SW)) * 180 / Math.PI];   // heading eased: the road moves too
  };
  // a car seen from above, facing right: wheels, body, windows, the driver, brake lights
  const car = (key, cls) => `<g class="fa-car ${cls}" data-k="${key}">
    <path class="wh" d="M-16 -11.5 H-10 M10 -11.5 H16 M-16 11.5 H-10 M10 11.5 H16"/>
    <rect class="bd" x="-24" y="-10.5" width="48" height="21" rx="6.5"/>
    <path class="gl" d="M-14 -7 H3 Q11 -7 11 0 Q11 7 3 7 H-14 Q-16.5 0 -14 -7 Z"/>
    <circle class="hd" cx="-3" cy="-3" r="3"/>
    <g class="bk" data-k="${key}k"><rect x="-25.6" y="-9" width="3.4" height="5" rx="1"/><rect x="-25.6" y="4" width="3.4" height="5" rx="1"/></g></g>`;
  const road = (key, top) => `<g data-k="${key}"><rect class="fa-bed" x="10" y="${top}" width="380" height="${2 * LW}"/>
    <line class="fa-edge" x1="10" x2="390" y1="${top}" y2="${top}"/><line class="fa-edge" x1="10" x2="390" y1="${top + 2 * LW}" y2="${top + 2 * LW}"/>
    <line class="fa-mid" data-k="${key}m" x1="10" x2="390" y1="${top + LW}" y2="${top + LW}"/></g>`;
  // rounded box with a tail pointing down at (tx, bottom + th)
  const callout = (x0, y0, w, h, r, tx, th) => `M${x0 + r} ${y0} H${x0 + w - r} Q${x0 + w} ${y0} ${x0 + w} ${y0 + r} V${y0 + h - r} Q${x0 + w} ${y0 + h} ${x0 + w - r} ${y0 + h}` +
    ` H${tx + 6} L${tx} ${y0 + h + th} L${tx - 6} ${y0 + h} H${x0 + r} Q${x0} ${y0 + h} ${x0} ${y0 + h - r} V${y0 + r} Q${x0} ${y0} ${x0 + r} ${y0} Z`;
  const box = (cls, y, key) => `<rect class="fa-bx${cls ? " " + cls : ""}"${key ? ` data-k="${key}"` : ""} x="${CUT - TW / 2}" y="${y}" width="${TW}" height="${TH}" rx="7"/>`;
  const leg = (cls, y, s, key) => `<text class="fa-leg ${cls}"${key ? ` data-k="${key}"` : ""} x="${CUT - TW / 2 + 9}" y="${y + 3.4}">${s}</text>`;
  const body = (y, s) => `<text class="fa-body" x="${CUT}" y="${y + 18.5}">${s}</text>`;

  window.BiasAnim.SCENES[KEY] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
      ${P} .fa-bed{fill:var(--surface)}
      ${P} .fa-edge{stroke:var(--faint);stroke-width:2;stroke-linecap:round}
      ${P} .fa-mid{stroke:var(--faint);stroke-width:2;stroke-dasharray:12 10}
      ${P} .fa-car .bd{fill:var(--surface);stroke:var(--ink);stroke-width:2.2}
      ${P} .fa-car .gl{fill:none;stroke:var(--ink);stroke-width:1.6;stroke-linejoin:round}
      ${P} .fa-car .hd{fill:var(--ink)}
      ${P} .fa-car .wh{stroke:var(--ink);stroke-width:3.2;stroke-linecap:round}
      ${P} .fa-car .bk rect{fill:var(--bad)}
      ${P} .fa-car.you .bd,${P} .fa-car.you .gl{stroke:var(--q)}
      ${P} .fa-car.you .hd{fill:var(--q)}
      ${P} .fa-car.you .wh{stroke:var(--q)}
      ${P} .fa-car.oth .bd,${P} .fa-car.oth .gl{stroke:var(--muted)}
      ${P} .fa-car.oth .hd{fill:var(--muted)}
      ${P} .fa-car.oth .wh{stroke:var(--muted)}
      ${P} .fa-you{font:500 10px var(--mono);fill:var(--q)}
      ${P} .fa-ring{fill:none;stroke:var(--bad);stroke-width:1.8}
      ${P} .fa-bub rect,${P} .fa-bub circle{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .fa-bub text{font:600 12.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fa-str{stroke:var(--muted);stroke-width:1.6;stroke-linecap:round}
      ${P} .fa-bx{fill:var(--surface);stroke:var(--ink);stroke-width:1.8}
      ${P} .fa-bx.bad{fill:none;stroke:var(--bad)}
      ${P} .fa-bx.q{fill:none;stroke:var(--q)}
      ${P} .fa-bx.good{fill:none;stroke:var(--good);stroke-width:2.2}
      ${P} .fa-glow{fill:none;stroke-width:2}
      ${P} .fa-glow.bad{stroke:var(--bad)}
      ${P} .fa-glow.q{stroke:var(--q)}
      ${P} .fa-leg{font:500 9.5px var(--mono);stroke:var(--surface);stroke-width:6px;paint-order:stroke;stroke-linejoin:round}
      ${P} .fa-leg.bad{fill:var(--bad)}
      ${P} .fa-leg.q{fill:var(--q)}
      ${P} .fa-leg.good{fill:var(--good)}
      ${P} .fa-body{font:600 11.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fa-card .bx{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .fa-card .back{fill:var(--surface);stroke:var(--muted);stroke-width:1.8;stroke-dasharray:4 3.5}
      ${P} .fa-card .qm{font:700 20px var(--display);fill:var(--muted);text-anchor:middle}
      ${P} .fa-card .ic{fill:none;stroke:var(--q);stroke-width:1.8}
      ${P} .fa-card .cr{stroke:var(--q);stroke-width:3.4;stroke-linecap:round}
      ${P} .fa-card .tx{font:600 11px var(--display);fill:var(--ink)}
      ${P} .fa-ptr{stroke:var(--q);stroke-width:1.6;stroke-dasharray:3 3;stroke-linecap:round}
      ${P} .fa-note{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .fa-ask path{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fa-ask text{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
    `,
    text: {
      hu: {
        name: "Alapvető attribúciós hiba", shareTitle: "Az alapvető attribúciós hiba, 30 másodpercben",
        ecline: "Másokat a jellemük miatt hibáztatunk, a saját helyzetünket pedig mentegetjük. Kérdezd meg, mi történhetett.",
        you: "te", jerk: "Mekkora barom!", bubAW: 104,
        char: "jellem", char2: "jellem?", sit: "helyzet",
        careless: "gondatlan ember", emergency: "talán vészhelyzet", late: "késésben van",
        card: ["Rohan a", "kórházba"], cardW: 132, hidden: "neked nem látszik",
        mine: ["Késésben vagyok", "egy megbeszélésre!"], ask: "Mi történhetett?", askW: 158,
        caps: [
          "Egy autó beszúr elédes elő.",
          "Az első gondolatod: „<b>Mekkora barom!</b>”",
          "<b>Azt</b> ítéled meg, milyen <b>ember</b>, nem azt, mi történik vele.",
          "Amit nem látsz: <b>a kórházba rohan</b>.",
          "Amikor <b>te</b> vágsz be valakit, tudod, miért: késésben voltál.",
          "Őket a <b>kiléte</b> miatt hibáztatják. Téged a <b>helyzeted</b> mentesít.",
          "<b>A megoldás:</b> kérdezd meg, mi magyarázhatná a helyzetet.",
          "Adj másoknak ugyanazt a <b>kedvezményt</b>, amit magadnak adsz. Gyakran igazad lesz."
        ],
        say: [
          "Egy autó beszúr eléd.",
          "Az első gondolatod: Mekkora barom!",
          "Azt ítéled meg, milyen ember, nem azt, mi történik vele.",
          "Amit nem látsz: a kórházba rohan.",
          "De amikor te vágsz be valakit, tudod, miért. Késésben voltál.",
          "Őket a kiléte miatt hibáztatják. Téged a helyzeted mentesít.",
          "A megoldás: kérdezd meg, mi magyarázhatná a helyzetet.",
          "Adj másoknak ugyanazt a kedvezményt, amit magadnak adsz. Gyakran igazad lesz.",
          "Az alapvető attribúciós hiba. Másokat a jellemük miatt hibáztatunk, a saját helyzetünket pedig mentegetjük. Kérdezd meg, mi történhetett."
        ]
      },
      en: {
        name: "Fundamental attribution error", shareTitle: "Fundamental attribution error, explained in 30 seconds",
        ecline: "We blame others' character and excuse our own situation. Ask what might be going on.",
        you: "you", jerk: "What a jerk!", bubAW: 104,
        char: "character", char2: "character?", sit: "situation",
        careless: "careless person", emergency: "maybe an emergency", late: "running late",
        card: ["Rushing to", "the hospital"], cardW: 132, hidden: "hidden from you",
        mine: ["I'm late for", "a meeting!"], ask: "What might be going on?", askW: 158,
        caps: [
          "A car cuts in front of you.",
          "Your first thought: “<b>What a jerk!</b>”",
          "You judge <b>who they are</b>, not what's happening to them.",
          "What you can't see: they're <b>rushing to the hospital</b>.",
          "When <b>you</b> cut someone off, you know why: you were late.",
          "They're blamed for <b>who they are</b>. You're excused by <b>your situation</b>.",
          "<b>The fix:</b> ask what situation could explain it.",
          "Give others <b>the same benefit</b> you give yourself. You'll often be right."
        ],
        say: [
          "A car cuts in front of you.",
          "Your first thought: What a jerk!",
          "You judge who they are, not what's happening to them.",
          "What you can't see: they're rushing to the hospital.",
          "But when you cut someone off, you know why. You were late.",
          "They're blamed for who they are. You're excused by your situation.",
          "The fix: ask what situation could explain it.",
          "Give others the same benefit you give yourself. You'll often be right.",
          "The fundamental attribution error. We blame others' character and excuse our own situation. Ask what might be going on."
        ]
      },
      el: {
        name: "Θεμελιώδες σφάλμα απόδοσης", shareTitle: "Το θεμελιώδες σφάλμα απόδοσης σε 30 δευτερόλεπτα",
        ecline: "Για τους άλλους φταίει ο χαρακτήρας, για εμάς οι συνθήκες. Αναρωτήσου τι μπορεί να συμβαίνει.",
        you: "εσύ", jerk: "Τι βλάκας!", bubAW: 96,
        char: "χαρακτήρας", char2: "χαρακτήρας;", sit: "συνθήκες",
        careless: "απρόσεκτο άτομο", emergency: "ίσως κάτι επείγον", late: "αργούσα",
        card: ["Τρέχει στο", "νοσοκομείο"], cardW: 136, hidden: "δεν το βλέπεις",
        mine: ["Άργησα για", "τη σύσκεψη!"], ask: "Τι μπορεί να συμβαίνει;", askW: 162,
        caps: [
          "Ένα αυτοκίνητο μπαίνει απότομα μπροστά σου.",
          "Η πρώτη σου σκέψη: «<b>Τι βλάκας!</b>»",
          "Κρίνεις <b>τι άνθρωπος είναι</b>, όχι τι περνάει εκείνη τη στιγμή.",
          "Αυτό που δεν βλέπεις: <b>τρέχει στο νοσοκομείο</b>.",
          "Όταν <b>εσύ</b> μπαίνεις μπροστά σε κάποιον, ξέρεις γιατί: αργούσες.",
          "Για τους άλλους φταίει ο <b>χαρακτήρας</b> τους. Για σένα, οι <b>συνθήκες</b>.",
          "<b>Η λύση:</b> αναρωτήσου ποιες συνθήκες θα μπορούσαν να το εξηγήσουν.",
          "Δίνε και στους άλλους <b>τα ίδια ελαφρυντικά</b>. Συχνά θα έχεις δίκιο."
        ],
        say: [
          "Ένα αυτοκίνητο μπαίνει απότομα μπροστά σου.",
          "Η πρώτη σου σκέψη: Τι βλάκας!",
          "Κρίνεις τι άνθρωπος είναι, όχι τι περνάει εκείνη τη στιγμή.",
          "Αυτό που δεν βλέπεις: τρέχει στο νοσοκομείο.",
          "Όταν όμως μπαίνεις εσύ μπροστά σε κάποιον, ξέρεις γιατί. Αργούσες.",
          "Για τους άλλους φταίει ο χαρακτήρας τους. Για σένα, οι συνθήκες.",
          "Η λύση: αναρωτήσου ποιες συνθήκες θα μπορούσαν να το εξηγήσουν.",
          "Δίνε και στους άλλους τα ίδια ελαφρυντικά. Συχνά θα έχεις δίκιο.",
          "Θεμελιώδες σφάλμα απόδοσης. Για τους άλλους φταίει ο χαρακτήρας, για εμάς οι συνθήκες. Αναρωτήσου τι μπορεί να συμβαίνει."
        ]
      },
      es: {
        name: "Error fundamental de atribución", shareTitle: "El error fundamental de atribución en 30 segundos",
        ecline: "Culpamos a los demás por su carácter y nos excusamos por la situación. Pregúntate qué le estará pasando.",
        you: "tú", jerk: "¡Qué idiota!", bubAW: 104,
        char: "carácter", char2: "¿carácter?", sit: "situación",
        careless: "persona descuidada", emergency: "quizá una urgencia", late: "llegaba tarde",
        card: ["Va corriendo", "al hospital"], cardW: 132, hidden: "no lo ves",
        mine: ["¡Voy tarde a", "una reunión!"], ask: "¿Qué le estará pasando?", askW: 158,
        caps: [
          "Un conductor se te cruza delante.",
          "Lo primero que piensas: «<b>¡Qué idiota!</b>».",
          "Juzgas <b>cómo es</b>, no lo que le está pasando.",
          "Lo que no ves: <b>va corriendo al hospital</b>.",
          "Cuando <b>tú</b> te cruzas delante de alguien, sabes por qué: llegabas tarde.",
          "A los demás los culpas por <b>cómo son</b>. A ti te excusa <b>tu situación</b>.",
          "<b>La solución:</b> pregúntate qué situación podría explicarlo.",
          "Dales a los demás <b>el mismo beneficio de la duda</b> que te das a ti. A menudo acertarás."
        ],
        say: [
          "Un conductor se te cruza delante.",
          "Lo primero que piensas: ¡qué idiota!",
          "Juzgas cómo es, no lo que le está pasando.",
          "Lo que no ves: va corriendo al hospital.",
          "Pero cuando tú te cruzas delante de alguien, sabes por qué. Llegabas tarde.",
          "A los demás los culpas por cómo son. A ti te excusa tu situación.",
          "La solución: pregúntate qué situación podría explicarlo.",
          "Dales a los demás el mismo beneficio de la duda que te das a ti. A menudo acertarás.",
          "El error fundamental de atribución. Culpamos a los demás por su carácter y nos excusamos por la situación. Pregúntate qué le estará pasando."
        ]
      },
      fr: {
        name: "Erreur fondamentale d’attribution", shareTitle: "L’erreur fondamentale d’attribution en 30 secondes",
        ecline: "Nous accusons le caractère des autres et excusons notre propre situation. Demandez-vous ce qui a pu se passer.",
        you: "vous", jerk: "Quel crétin !", bubAW: 104,
        char: "caractère", char2: "caractère ?", sit: "situation",
        careless: "chauffard", emergency: "une urgence ?", late: "en retard",
        card: ["Il fonce", "à l’hôpital"], cardW: 132, hidden: "caché à vos yeux",
        mine: ["En retard pour", "une réunion !"], ask: "Qu’a-t-il pu se passer ?", askW: 158,
        caps: [
          "Une voiture vous fait une queue de poisson.",
          "Votre première pensée : « <b>Quel crétin !</b> »",
          "Vous jugez <b>qui il est</b>, pas ce qui lui arrive.",
          "Ce que vous ne voyez pas : il <b>fonce à l’hôpital</b>.",
          "Quand <b>vous</b> faites une queue de poisson, vous savez pourquoi : vous étiez en retard.",
          "On l’accuse pour <b>qui il est</b>. Vous, <b>votre situation</b> vous excuse.",
          "<b>La solution :</b> demandez-vous quelle situation pourrait l’expliquer.",
          "Accordez aux autres <b>la même indulgence</b> qu’à vous-même. Vous aurez souvent raison."
        ],
        say: [
          "Une voiture vous fait une queue de poisson.",
          "Votre première pensée : quel crétin !",
          "Vous jugez qui il est, pas ce qui lui arrive.",
          "Ce que vous ne voyez pas : il fonce à l’hôpital.",
          "Mais quand c’est vous qui faites une queue de poisson, vous savez pourquoi. Vous étiez en retard.",
          "On l’accuse pour qui il est. Vous, votre situation vous excuse.",
          "La solution : demandez-vous quelle situation pourrait l’expliquer.",
          "Accordez aux autres la même indulgence qu’à vous-même. Vous aurez souvent raison.",
          "L’erreur fondamentale d’attribution. Nous accusons le caractère des autres et excusons notre propre situation. Demandez-vous ce qui a pu se passer."
        ]
      },
      de: {
        name: "Fundamentaler Attributionsfehler", shareTitle: "Der fundamentale Attributionsfehler in 30 Sekunden",
        ecline: "Bei anderen geben wir dem Charakter die Schuld, bei uns der Situation. Frag dich, was da los sein könnte.",
        you: "du", jerk: "So ein Idiot!", bubAW: 104,
        char: "Charakter", char2: "Charakter?", sit: "Situation",
        careless: "rücksichtslos", emergency: "vielleicht ein Notfall", late: "spät dran",
        card: ["Eilt ins", "Krankenhaus"], cardW: 132, hidden: "für dich unsichtbar",
        mine: ["Bin zu spät", "zum Meeting!"], ask: "Was ist da wohl los?", askW: 158,
        caps: [
          "Ein Auto schert knapp vor dir ein.",
          "Dein erster Gedanke: „<b>So ein Idiot!</b>“",
          "Du urteilst über <b>den Menschen</b>, nicht über das, was ihm gerade passiert.",
          "Was du nicht siehst: Da <b>eilt jemand ins Krankenhaus</b>.",
          "Wenn <b>du</b> knapp vor jemandem einscherst, kennst du den Grund: Du warst spät dran.",
          "Bei anderen liegt es an <b>ihrem Charakter</b>. Bei dir an <b>deiner Situation</b>.",
          "<b>Die Lösung:</b> Frag dich, welche Situation es erklären könnte.",
          "Gib anderen <b>dasselbe Wohlwollen</b> wie dir selbst. Oft liegst du damit richtig."
        ],
        say: [
          "Ein Auto schert knapp vor dir ein.",
          "Dein erster Gedanke: So ein Idiot!",
          "Du urteilst über den Menschen, nicht über das, was ihm gerade passiert.",
          "Was du nicht siehst: Da eilt jemand ins Krankenhaus.",
          "Aber wenn du knapp vor jemandem einscherst, kennst du den Grund. Du warst spät dran.",
          "Bei anderen liegt es an ihrem Charakter. Bei dir an deiner Situation.",
          "Die Lösung: Frag dich, welche Situation es erklären könnte.",
          "Gib anderen dasselbe Wohlwollen wie dir selbst. Oft liegst du damit richtig.",
          "Der fundamentale Attributionsfehler. Bei anderen geben wir dem Charakter die Schuld, bei uns der Situation. Frag dich, was da los sein könnte."
        ]
      },
      it: {
        name: "Errore fondamentale di attribuzione", shareTitle: "L’errore fondamentale di attribuzione in 30 secondi",
        ecline: "Agli altri diamo la colpa del carattere, a noi la scusa della situazione. Chiediti cosa starà succedendo.",
        you: "tu", jerk: "Che idiota!", bubAW: 104,
        char: "carattere", char2: "carattere?", sit: "situazione",
        careless: "persona imprudente", emergency: "forse un’emergenza", late: "in ritardo",
        card: ["Di corsa", "in ospedale"], cardW: 132, hidden: "non lo vedi",
        mine: ["Faccio tardi", "alla riunione!"], ask: "Cosa starà succedendo?", askW: 158,
        caps: [
          "Un’auto ti taglia la strada.",
          "Il tuo primo pensiero: «<b>Che idiota!</b>»",
          "Giudichi <b>chi è</b>, non la situazione in cui si trova.",
          "Quello che non vedi: sta <b>correndo in ospedale</b>.",
          "Quando <b>tu</b> tagli la strada a qualcuno, sai perché: eri in ritardo.",
          "Gli altri li incolpi per <b>chi sono</b>. Per te la scusa è <b>la tua situazione</b>.",
          "<b>La soluzione:</b> chiediti quale situazione potrebbe spiegarlo.",
          "Concedi agli altri <b>lo stesso beneficio del dubbio</b> che dai a te. Spesso avrai ragione."
        ],
        say: [
          "Un’auto ti taglia la strada.",
          "Il tuo primo pensiero: che idiota!",
          "Giudichi chi è, non la situazione in cui si trova.",
          "Quello che non vedi: sta correndo in ospedale.",
          "Ma quando tu tagli la strada a qualcuno, sai perché. Eri in ritardo.",
          "Gli altri li incolpi per chi sono. Per te la scusa è la tua situazione.",
          "La soluzione: chiediti quale situazione potrebbe spiegarlo.",
          "Concedi agli altri lo stesso beneficio del dubbio che dai a te. Spesso avrai ragione.",
          "L’errore fondamentale di attribuzione. Agli altri diamo la colpa del carattere, a noi la scusa della situazione. Chiediti cosa starà succedendo."
        ]
      }
    },
    svg(T) {
      const W = T.cardW, cx0 = -W / 2;
      return `
        <g data-k="A">
          ${road("roadA", RA)}
          <g data-k="youA">${car("carY", "you")}<text class="fa-you" data-k="youAt" text-anchor="end">${T.you}</text></g>
          ${car("carT", "")}
          <circle class="fa-ring" data-k="ring" r="6.5"/>
          <g class="fa-bub" data-k="bubA"><rect x="${BA - T.bubAW / 2}" y="6" width="${T.bubAW}" height="28" rx="14"/>
            <circle cx="104" cy="43" r="3.6"/><circle cx="110" cy="54" r="2.7"/><circle cx="115" cy="64" r="1.9"/>
            <text x="${BA}" y="24.5">${T.jerk}</text></g>
          <g data-k="hc"><line class="fa-ptr" x1="${CUT - CX}" y1="${CH / 2 + 4}" x2="${CUT - CX}" y2="${loA - 15 - CY}"/>
            <g class="fa-card" data-k="cardf">
              <g data-k="cardB"><rect class="back" x="${cx0}" y="${-CH / 2}" width="${W}" height="${CH}" rx="8"/><text class="qm" y="7">?</text></g>
              <g data-k="cardF"><rect class="bx" x="${cx0}" y="${-CH / 2}" width="${W}" height="${CH}" rx="8"/>
                <rect class="ic" x="${cx0 + 11}" y="-10" width="22" height="22" rx="5"/><path class="cr" d="M${cx0 + 22} -4.5 V6.5 M${cx0 + 16.5} 1 H${cx0 + 27.5}"/>
                <text class="tx" x="${cx0 + 42}" y="-1">${T.card[0]}</text><text class="tx" x="${cx0 + 42}" y="13">${T.card[1]}</text>
                <text class="fa-leg q" x="${cx0 + 10}" y="${-CH / 2 + 3.4}">${T.sit}</text></g></g></g>
          <text class="fa-note" data-k="note" x="${CUT + 8}" y="36">${T.hidden}</text>
          <g data-k="tagA"><line class="fa-str" x1="${CUT + 18}" y1="${loA + 10}" x2="${CUT + 18}" y2="${TA}"/>
            <rect class="fa-glow bad" data-k="glowA" rx="10"/>
            <g data-k="tagAf">${box("", TA)}${box("bad", TA, "tagAbad")}${box("good", TA, "tagAgood")}
              <g data-k="tagA0">${body(TA, T.careless)}${leg("bad", TA, T.char, "legA")}</g>
              <g data-k="tagA1">${body(TA, T.emergency)}${leg("good", TA, T.sit)}</g></g></g>
          <g class="fa-ask" data-k="ask"><path d="${callout(CUT - T.askW / 2, 10, T.askW, 28, 9, CUT, 8)}"/><text x="${CUT}" y="28.5">${T.ask}</text></g>
        </g>
        <g data-k="B">
          ${road("roadB", RB)}
          ${car("carO", "oth")}
          <g data-k="youB">${car("carB", "you")}<text class="fa-you" data-k="youBt">${T.you}</text></g>
          <g class="fa-bub" data-k="bubB"><rect x="282" y="114" width="100" height="36" rx="14"/>
            <circle cx="273" cy="157" r="3.4"/><circle cx="263" cy="165" r="2.5"/><circle cx="254" cy="172" r="1.8"/>
            <text x="332" y="128.5">${T.mine[0]}</text><text x="332" y="142.5">${T.mine[1]}</text></g>
          <g data-k="tagB"><line class="fa-str" x1="${CUT + 18}" y1="${loB + 10}" x2="${CUT + 18}" y2="${TB}"/>
            <rect class="fa-glow q" data-k="glowB" rx="10"/>
            ${box("", TB)}${box("q", TB, "tagBq")}${box("good", TB, "tagBgood")}
            ${body(TB, T.late)}${leg("q", TB, T.sit, "legBq")}${leg("good", TB, T.sit, "legBg")}</g>
        </g>`;
    },
    S0: { roadA: 0, youA: 0, cutA: 0, joltA: 0, brakeA: 0, bubA: 0, tagA: 0, legA: 0, glowA: 0, ring: 0,
      hc: 0, flip: 0, note: 0, ay: AY, roadB: 0, cutB: 0, joltB: 0, brakeB: 0, bubB: 0, tagB: 0, glowB: 0,
      ask: 0, doubt: 0, win: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const tr = (key, x, y, extra) => k(key).setAttribute("transform", `translate(${f2(x)} ${f2(y)})${extra || ""}`);
      const pop = (key, v, cx, cy) => {   // scale in around (cx, cy)
        const s = f2(.7 + .3 * v);
        k(key).setAttribute("transform", `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`);
        op(key, v * 1.6);
      };
      const glow = (key, top, g) => {      // a ring that grows and fades around a tag
        const e = 3 + 4.5 * g, r = k(key);
        r.setAttribute("x", f2(CUT - TW / 2 - e)); r.setAttribute("y", f2(top - e));
        r.setAttribute("width", f2(TW + 2 * e)); r.setAttribute("height", f2(TH + 2 * e));
        r.style.opacity = g > 0 && g < 1 ? f2(1 - g) : 0;
      };
      // road A: alone and centred at first, then slides up to make room for road B
      tr("A", 0, S.ay);
      op("roadA", S.roadA);
      k("roadAm").style.strokeDashoffset = f2(S.cutA * 110);
      // you, cut off: a jolt back and brake lights
      const yx = YOU - 6 * S.joltA;
      tr("carY", yx, loA); op("carYk", S.brakeA);
      const ya = k("youAt"); ya.setAttribute("x", f2(yx - 29)); ya.setAttribute("y", loA + 3.5);
      op("youA", S.youA);
      // the other driver cuts in
      const [ax, ayy, aa] = cutAt(S.cutA, upA, loA);
      tr("carT", ax, ayy, ` rotate(${f2(aa)})`); op("carT", S.cutA > 0 ? (ax - X0) / 36 : 0); op("carTk", 0);
      // judging the person: a ring on the driver, a thought, a tag
      tr("ring", CUT - 3, loA - 2.8); op("ring", S.ring);
      pop("bubA", S.bubA, 115, 64);
      k("tagA").setAttribute("transform", `translate(0 ${f2(-8 * (1 - S.tagA))})`); op("tagA", S.tagA * 1.6);
      glow("glowA", TA, S.glowA);
      // the hidden situation: a card that flips over
      const fl = Math.abs(Math.cos(Math.PI * S.flip));
      tr("hc", CX, CY + 6 * (1 - S.hc)); op("hc", S.hc);
      k("cardf").setAttribute("transform", `scale(${f2(Math.max(.01, fl))} 1)`);
      op("cardB", S.flip < .5 ? 1 : 0); op("cardF", S.flip < .5 ? 0 : 1);
      op("note", S.note);
      // the fix: the tag on them flips from character to situation
      const w = Math.abs(Math.cos(Math.PI * S.win)), after = S.win >= .5;
      k("tagAf").setAttribute("transform", `translate(0 ${TA + TH / 2}) scale(1 ${f2(Math.max(.01, w))}) translate(0 ${-(TA + TH / 2)})`);
      op("tagA0", after ? 0 : 1 - .35 * S.doubt); op("tagA1", after ? 1 : 0);
      op("legA", S.legA); k("legA").textContent = S.doubt > .5 ? T.char2 : T.char;
      op("tagAbad", after ? 0 : S.legA * (1 - .6 * S.doubt)); op("tagAgood", after ? 1 : 0);
      pop("ask", S.ask, CUT, 46);
      // road B: you cut in front of someone
      op("B", S.roadB);
      k("roadBm").style.strokeDashoffset = f2(S.cutB * 110);
      tr("carO", YOU - 6 * S.joltB, loB); op("carOk", S.brakeB);
      const [bx, by, ba] = cutAt(S.cutB, upB, loB);
      tr("carB", bx, by, ` rotate(${f2(ba)})`); op("carBk", 0);
      const yb = k("youBt"); yb.setAttribute("x", f2(bx + 29)); yb.setAttribute("y", f2(by + 3.5));
      op("youB", S.cutB > 0 ? (bx - X0) / 36 : 0);
      pop("bubB", S.bubB, 254, 172);
      k("tagB").setAttribute("transform", `translate(0 ${f2(-8 * (1 - S.tagB))})`); op("tagB", S.tagB * 1.6);
      glow("glowB", TB, S.glowB);
      op("tagBq", 1 - S.win); op("legBq", 1 - S.win); op("tagBgood", S.win); op("legBg", S.win);
    },
    beats: [
      { steps: [{ to: { roadA: 1, youA: 1 }, ms: 500 }, { to: { cutA: 1 }, ms: 1500, sfx: "whoosh" },
        { to: { joltA: 1, brakeA: 1 }, ms: 320, ease: "back" }] },
      { steps: [{ to: { bubA: 1 }, ms: 450, ease: "back", sfx: "pop" }, { wait: 350 }, { to: { tagA: 1 }, ms: 450, ease: "back" }] },
      { steps: [{ to: { brakeA: 0 }, ms: 300 }, { to: { legA: 1, ring: 1 }, ms: 400, sfx: "tick" },
        { to: { glowA: 1 }, ms: 700, ease: "lin" }, { to: { glowA: 0 } }, { to: { glowA: 1 }, ms: 700, ease: "lin" }, { to: { glowA: 0 } }] },
      { steps: [{ to: { hc: 1 }, ms: 400, ease: "back" }, { wait: 300 }, { to: { flip: 1 }, ms: 700, ease: "inOut", sfx: "spring" },
        { to: { note: 1 }, ms: 400 }], hold: 2800 },
      { steps: [{ to: { bubA: 0, hc: 0, note: 0, ring: 0 }, ms: 400 }, { to: { ay: 0, roadB: 1 }, ms: 800, ease: "inOut" },
        { to: { cutB: 1 }, ms: 1500, sfx: "whoosh" }, { to: { joltB: 1, brakeB: 1 }, ms: 320, ease: "back" },
        { to: { bubB: 1 }, ms: 450, ease: "back", sfx: "pop" }] },
      { steps: [{ to: { brakeB: 0 }, ms: 300 }, { to: { tagB: 1 }, ms: 450, ease: "back", sfx: "tick" },
        { to: { glowB: 1 }, ms: 700, ease: "lin" }, { to: { glowB: 0 } }], hold: 3000 },
      { steps: [{ to: { ask: 1 }, ms: 500, ease: "back", sfx: "scribble" }, { wait: 300 }, { to: { doubt: 1 }, ms: 400 }] },
      { steps: [{ to: { win: 1 }, ms: 800, ease: "inOut", sfx: "chime", sfxAt: 400 }], hold: 4200 }
    ]
  };
})();
