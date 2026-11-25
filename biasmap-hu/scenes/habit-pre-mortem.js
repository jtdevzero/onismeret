/* Habit: run a pre-mortem. A team sure its app launch will go great, a jump to a year later where
   it failed, the likeliest reasons written down, and each one carried back to today as a fix.
   Same motif as the habit's tile: you today, a gravestone a year out, a dotted arc bringing a wrench back.
   Scene for anim.js. */
(function () {
  const KEY = "habit-pre-mortem", P = `.bp[data-scene="${KEY}"]`;
  const TY = 220, TX0 = 16, TX1 = 384;                 // the timeline
  const NOW = 62, GO = 196, LATER = 336;               // today, launch day, a year later
  const TEAM = [34, 90, 62];                           // three people standing on today (middle one in front)
  const CW = 182, CH = 21, LX = 14, RX = 204;          // cards: size, left (today) and right (a year later) columns
  const ROWS = [52, 77, 102];
  const TW = CW - 30;                                  // room for a card's text
  const BX = 96, BY = 134, BH = 28;                    // the thought bubble
  const A0 = [296, 46], A1 = [280, 14], A2 = [120, 14], A3 = [104, 46];   // the arc from the reasons back to today
  const cl = v => Math.max(0, Math.min(1, v));
  const f2 = v => +v.toFixed(2), f3 = v => +v.toFixed(3);
  const inOut = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const back = t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const bez = t => {
    const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [a * A0[0] + b * A1[0] + c * A2[0] + d * A3[0], a * A0[1] + b * A1[1] + c * A2[1] + d * A3[1]];
  };
  // arrowhead at the end of the arc, along its last direction
  const AH = (() => {
    const dx = A3[0] - A2[0], dy = A3[1] - A2[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, s = 7;
    const r = a => [A3[0] - s * (ux * Math.cos(a) - uy * Math.sin(a)), A3[1] - s * (uy * Math.cos(a) + ux * Math.sin(a))];
    const [p, q] = [r(.5), r(-.5)];
    return `M${f2(p[0])} ${f2(p[1])} L${A3[0]} ${A3[1]} L${f2(q[0])} ${f2(q[1])}`;
  })();
  const WRENCH = "M11.5 -2.3 A2.3 2.3 0 0 1 11.5 2.3 H0.3 A5.8 5.8 0 0 1 -10.4 2.3 H-5.4 V-2.3 H-10.4 A5.8 5.8 0 0 1 0.3 -2.3 Z";
  // a person (the tile's figure, a little bigger), standing on the timeline, looking towards the future
  const person = (x, i) => `<g class="pm-man">
      <path d="M${x - 15} ${TY - 2} V${TY - 6.6} C${x - 15} ${TY - 14.7} ${x - 8.1} ${TY - 18.7} ${x} ${TY - 18.7} C${x + 8.1} ${TY - 18.7} ${x + 15} ${TY - 14.7} ${x + 15} ${TY - 6.6} V${TY - 2}"/>
      <circle cx="${x}" cy="${TY - 31}" r="7.5"/>
      <circle class="pm-eye" cx="${x - 1.4}" cy="${TY - 31.8}" r="1.2"/><circle class="pm-eye" cx="${x + 4.4}" cy="${TY - 31.8}" r="1.2"/>
      <path class="pm-mouth" data-k="mo${i}" d=""/></g>`;
  const tick = x => `<line class="pm-tick" x1="${x}" x2="${x}" y1="${TY}" y2="${TY + 6}"/>`;
  // a card: a reason it failed (red cross) or a fix (green tick)
  const card = (cls, text, extra) => `<rect class="pm-cd ${cls}" width="${CW}" height="${CH}" rx="6"/>` +
    (cls === "r" ? `<path class="pm-ic r" d="M9 7 l7 7 M16 7 l-7 7"/>` : `<path class="pm-ic f" d="M8.5 10.8 L11.6 13.9 L17 7.6"/>`) +
    `<text class="pm-ct" x="24" y="14.3">${text}</text>${extra || ""}`;

  window.BiasAnim.SCENES[KEY] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
      ${P} .pm-line{fill:none;stroke:var(--rule);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .pm-tick{stroke:var(--rule);stroke-width:2;stroke-linecap:round}
      ${P} .pm-tl{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .pm-tl.s{font-size:9px;fill:var(--faint)}
      ${P} .pm-man path,${P} .pm-man circle{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .pm-man .pm-eye{fill:var(--ink);stroke:none}
      ${P} .pm-man .pm-mouth{fill:none;stroke-width:1.6}
      ${P} .pm-ph{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .pm-phl{fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round}
      ${P} .pm-app{fill:var(--q)}
      ${P} .pm-bolt{fill:var(--ground)}
      ${P} .pm-spark{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round}
      ${P} .pm-bub{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .pm-bt{font:600 12.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .pm-hd{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .pm-hd.b{fill:var(--bad)}
      ${P} .pm-cd{fill:var(--surface);stroke-width:1.6}
      ${P} .pm-cd.q{fill:none;stroke:var(--muted);stroke-dasharray:3 3}
      ${P} .pm-cd.r{stroke:var(--bad)}
      ${P} .pm-cd.f{stroke:var(--good)}
      ${P} .pm-qm{font:700 12px var(--display);fill:var(--muted);text-anchor:middle}
      ${P} .pm-ct{font:600 10.5px var(--display);fill:var(--ink)}
      ${P} .pm-cv{fill:var(--surface)}
      ${P} .pm-ic{fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
      ${P} .pm-ic.r{stroke:var(--bad)} ${P} .pm-ic.f{stroke:var(--good)}
      ${P} .pm-strike{fill:none;stroke:var(--ink);stroke-width:1.6;stroke-linecap:round}
      ${P} .pm-ff{fill:none;stroke:var(--q);stroke-width:3.2;stroke-linecap:round}
      ${P} .pm-ffd{fill:var(--q)}
      ${P} .pm-tomb{fill:var(--surface);stroke:var(--ink);stroke-width:2.4;stroke-linejoin:round}
      ${P} .pm-ep{fill:none;stroke:var(--muted);stroke-width:2;stroke-linecap:round}
      ${P} .pm-crack{fill:none;stroke:var(--bad);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .pm-arc{fill:none;stroke:var(--q);stroke-width:2.2;stroke-linecap:round;stroke-dasharray:.1 5.5}
      ${P} .pm-ah{fill:none;stroke:var(--q);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .pm-wr{fill:var(--q);stroke:var(--q);stroke-width:2;stroke-linejoin:round}
      ${P} .pm-wrh{fill:none;stroke:var(--ground);stroke-width:7;stroke-linejoin:round}
      ${P} .pm-brk{fill:none;stroke:var(--q);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .pm-tag rect{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .pm-tag text{font:700 11.5px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .pm-go{fill:none;stroke:var(--good);stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .pm-ok circle{fill:var(--surface);stroke:var(--good);stroke-width:2}
      ${P} .pm-ok path{fill:none;stroke:var(--good);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
    `,
    text: {
      hu: {
        name: "Tarts utólagos előtörténetet", shareTitle: "Tarts utólagos előtörténetet: egy szokás 30 másodpercben",
        ecline: "Képzeld el a kudarcot, mielőtt megtörténik, aztán még ma javítsd a legvalószínűbb okait.",
        today: "ma", launch: "indítás", next: "jövő hónap", later: "egy évvel később",
        great: "Nagyszerű lesz!", bubW: 108, ask: "mi mehet rosszul?", why: "miért bukott meg",
        reasons: ["senki nem hallott róla", "első napon összeomlott a szerver", "túl sokáig tartott a regisztráció"], rw: [112.5, 134.8, 107.2],
        fixes: ["indítási terv", "terhelésteszt", "rövidebb regisztráció"],
        bias: "Optimizmus-torzítás", tagW: 104,
        caps: [
          "A csapatod <b>jövő hónapban</b> indít egy új alkalmazást.",
          "Mindenki arra számít, hogy <b>nagyszerű lesz</b>.",
          "Senki nem áll meg, hogy megkérdezze: <b>mi mehet rosszul</b>.",
          "<b>Utólagos előtörténet:</b> képzeld el, hogy egy év telt el, és az indítás <b>kudarcot vallott</b>.",
          "Mindenki felírja a <b>legvalószínűbb okokat</b>, amiért megbukott.",
          "Aztán még ma <b>javítsd meg, amit tudsz</b>, az indítás előtt.",
          "Ez elkapja az <b>optimizmus-torzítást</b>: „velünk ez nem történhet meg.”",
          "Az indítás megy tovább, <b>a kockázatokat már kezelve</b>."
        ],
        say: [
          "A csapatod jövő hónapban indít egy új alkalmazást.",
          "Mindenki arra számít, hogy nagyszerű lesz.",
          "Senki nem áll meg, hogy megkérdezze, mi mehet rosszul.",
          "Tarts utólagos előtörténetet. Képzeld el, hogy egy év telt el, és az indítás kudarcot vallott.",
          "Mindenki felírja a legvalószínűbb okokat, amiért megbukott.",
          "Aztán még ma javítsd meg, amit tudsz, az indítás előtt.",
          "Ez elkapja az optimizmus-torzítást: a hiedelmet, hogy velünk ez nem történhet meg.",
          "Az indítás megy tovább, a kockázatokat már kezelve.",
          "Tarts utólagos előtörténetet. Képzeld el a kudarcot, mielőtt megtörténik, aztán még ma javítsd a legvalószínűbb okait."
        ]
      },
      en: {
        name: "Run a pre-mortem", shareTitle: "Run a pre-mortem: a habit in 30 seconds",
        ecline: "Picture the failure before it happens, then fix its likeliest causes today.",
        today: "today", launch: "launch", next: "next month", later: "a year later",
        great: "It'll go great!", bubW: 108, ask: "what could go wrong?", why: "why it failed",
        reasons: ["nobody heard about it", "server crashed on day one", "sign-up took too long"], rw: [112.5, 134.8, 107.2],
        fixes: ["launch plan", "load test", "shorter sign-up"],
        bias: "Optimism bias", tagW: 104,
        caps: [
          "Your team launches a new app <b>next month</b>.",
          "Everyone expects it to <b>go great</b>.",
          "Nobody stops to ask <b>what could go wrong</b>.",
          "<b>Pre-mortem:</b> imagine it's a year later and the launch <b>failed</b>.",
          "Everyone writes down the <b>likeliest reasons</b> it failed.",
          "Then <b>fix what you can</b> today, before launch.",
          "It catches <b>optimism bias</b>: “it won't happen to us.”",
          "The launch goes ahead, <b>with those risks handled</b>."
        ],
        say: [
          "Your team launches a new app next month.",
          "Everyone expects it to go great.",
          "Nobody stops to ask what could go wrong.",
          "Run a pre-mortem. Imagine it's a year later, and the launch failed.",
          "Everyone writes down the likeliest reasons it failed.",
          "Then fix what you can today, before launch.",
          "It catches optimism bias: the belief that it won't happen to us.",
          "The launch goes ahead, with those risks handled.",
          "Run a pre-mortem. Picture the failure before it happens, then fix its likeliest causes today."
        ]
      },
      el: {
        name: "Κάνε μια «νεκροψία» από πριν", shareTitle: "Κάνε μια «νεκροψία» από πριν: μια συνήθεια σε 30 δευτερόλεπτα",
        ecline: "Φαντάσου την αποτυχία πριν έρθει και αντιμετώπισε από σήμερα τις πιο πιθανές αιτίες της.",
        today: "σήμερα", launch: "κυκλοφορία", next: "τον άλλο μήνα", later: "σε έναν χρόνο",
        great: "Θα πάει τέλεια!", bubW: 122, ask: "τι μπορεί να στραβώσει;", why: "γιατί απέτυχε",
        reasons: ["δεν το έμαθε κανείς", "ο server έπεσε την πρώτη μέρα", "η εγγραφή ήθελε πολλή ώρα"], rw: [95.2, 148.1, 136.4],
        fixes: ["σχέδιο προώθησης", "δοκιμή αντοχής", "πιο σύντομη εγγραφή"],
        bias: "Μεροληψία αισιοδοξίας", tagW: 152,
        caps: [
          "Η ομάδα σου βγάζει μια καινούργια εφαρμογή <b>τον άλλο μήνα</b>.",
          "Όλοι περιμένουν ότι θα <b>πάει τέλεια</b>.",
          "Κανείς δεν κάθεται να ρωτήσει <b>τι μπορεί να στραβώσει</b>.",
          "<b>«Νεκροψία» από πριν:</b> φαντάσου ότι πέρασε ένας χρόνος και η εφαρμογή <b>απέτυχε</b>.",
          "Όλοι γράφουν τους <b>πιο\u00a0πιθανούς λόγους</b> της αποτυχίας.",
          "Μετά <b>διόρθωσε σήμερα</b> ό,τι μπορείς, πριν βγει.",
          "Έτσι πιάνεις τη <b>μεροληψία\u00a0αισιοδοξίας</b>: «εμάς δεν θα μας συμβεί».",
          "Η εφαρμογή βγαίνει κανονικά, <b>με τους κινδύνους υπό έλεγχο</b>."
        ],
        say: [
          "Η ομάδα σου βγάζει μια καινούργια εφαρμογή τον άλλο μήνα.",
          "Όλοι περιμένουν ότι θα πάει τέλεια.",
          "Κανείς δεν κάθεται να ρωτήσει τι μπορεί να στραβώσει.",
          "Κάνε μια νεκροψία από πριν. Φαντάσου ότι πέρασε ένας χρόνος και η εφαρμογή απέτυχε.",
          "Όλοι γράφουν τους πιο πιθανούς λόγους της αποτυχίας.",
          "Μετά διόρθωσε σήμερα ό,τι μπορείς, πριν βγει.",
          "Έτσι πιάνεις τη μεροληψία αισιοδοξίας: τη σιγουριά ότι εμάς δεν θα μας συμβεί.",
          "Η εφαρμογή βγαίνει κανονικά, με τους κινδύνους υπό έλεγχο.",
          "Κάνε μια νεκροψία από πριν. Φαντάσου την αποτυχία πριν έρθει και αντιμετώπισε από σήμερα τις πιο πιθανές αιτίες της."
        ]
      },
      es: {
        name: "Haz un premortem", shareTitle: "Haz un premortem: un hábito en 30 segundos",
        ecline: "Imagina el fracaso antes de que ocurra y arregla hoy sus causas más probables.",
        today: "hoy", launch: "lanzamiento", next: "el mes que viene", later: "un año después",
        great: "¡Saldrá genial!", bubW: 108, ask: "¿qué puede salir mal?", why: "por qué fracasó",
        reasons: ["nadie supo que existía", "el servidor cayó el primer día", "el registro era muy largo"], rw: [113.2, 146.9, 124.2],
        fixes: ["plan de lanzamiento", "prueba de carga", "registro más corto"],
        bias: "Sesgo de optimismo", tagW: 144,
        caps: [
          "Tu equipo lanza una nueva app <b>el mes que viene</b>.",
          "Todos esperan que <b>salga genial</b>.",
          "Nadie se para a preguntar <b>qué puede salir mal</b>.",
          "<b>Premortem:</b> imagina que ha pasado un año y el lanzamiento <b>fracasó</b>.",
          "Cada uno apunta <b>las razones más probables</b> del fracaso.",
          "Luego <b>arregla lo que puedas</b> hoy, antes del lanzamiento.",
          "Detecta el <b>sesgo de optimismo</b>: «a nosotros no nos pasará».",
          "El lanzamiento sigue adelante, <b>con esos riesgos bajo control</b>."
        ],
        say: [
          "Tu equipo lanza una nueva app el mes que viene.",
          "Todos esperan que salga genial.",
          "Nadie se para a preguntar qué puede salir mal.",
          "Haz un premortem. Imagina que ha pasado un año, y el lanzamiento fracasó.",
          "Cada uno apunta las razones más probables del fracaso.",
          "Luego arregla lo que puedas hoy, antes del lanzamiento.",
          "Detecta el sesgo de optimismo: la creencia de que a nosotros no nos pasará.",
          "El lanzamiento sigue adelante, con esos riesgos bajo control.",
          "Haz un premortem. Imagina el fracaso antes de que ocurra, y arregla hoy sus causas más probables."
        ]
      },
      fr: {
        name: "Faites un pré-mortem", shareTitle: "Faites un pré-mortem : une habitude en 30 secondes",
        ecline: "Imaginez l’échec avant qu’il arrive, puis réglez dès aujourd’hui ses causes les plus probables.",
        today: "aujourd’hui", launch: "lancement", next: "le mois prochain", later: "un an plus tard",
        great: "Ça va marcher !", bubW: 138, ask: "qu’est-ce qui pourrait rater ?", why: "pourquoi ça a échoué",
        reasons: ["personne ne la connaissait", "le serveur a planté le 1er jour", "inscription trop longue"], rw: [135.9, 144.2, 115.7],
        fixes: ["plan de lancement", "test de charge", "inscription plus courte"],
        bias: "Biais d’optimisme", tagW: 128,
        caps: [
          "Votre équipe lance une nouvelle appli <b>le mois prochain</b>.",
          "Tout le monde s’attend à <b>un grand succès</b>.",
          "Personne ne prend le temps de se demander <b>ce qui pourrait rater</b>.",
          "<b>Pré-mortem :</b> imaginez qu’un an a passé et que le lancement a <b>échoué</b>.",
          "Chacun note les <b>causes les plus probables</b> de l’échec.",
          "Puis <b>réglez ce que vous pouvez</b> dès aujourd’hui, avant le lancement.",
          "Il déjoue le <b>biais d’optimisme</b> : « ça ne nous arrivera pas ».",
          "Le lancement a lieu, <b>avec ces risques maîtrisés</b>."
        ],
        say: [
          "Votre équipe lance une nouvelle appli le mois prochain.",
          "Tout le monde s’attend à un grand succès.",
          "Personne ne prend le temps de se demander ce qui pourrait rater.",
          "Faites un pré-mortem. Imaginez qu’un an a passé, et que le lancement a échoué.",
          "Chacun note les causes les plus probables de l’échec.",
          "Puis réglez ce que vous pouvez dès aujourd’hui, avant le lancement.",
          "Il déjoue le biais d’optimisme : la conviction que ça ne nous arrivera pas.",
          "Le lancement a lieu, avec ces risques maîtrisés.",
          "Faites un pré-mortem. Imaginez l’échec avant qu’il arrive, puis réglez dès aujourd’hui ses causes les plus probables."
        ]
      },
      de: {
        name: "Mach ein Pre-Mortem", shareTitle: "Mach ein Pre-Mortem: eine Gewohnheit in 30 Sekunden",
        ecline: "Stell dir das Scheitern vor, bevor es passiert, und behebe seine wahrscheinlichsten Ursachen schon heute.",
        today: "heute", launch: "Start", next: "nächsten Monat", later: "ein Jahr später",
        great: "Wird ein Hit!", bubW: 108, ask: "was könnte schiefgehen?", why: "warum es scheiterte",
        reasons: ["niemand hat davon gehört", "Server am 1. Tag abgestürzt", "Registrierung zu lang"], rw: [133.9, 138.8, 107.5],
        fixes: ["Startplan", "Lasttest", "kürzere Registrierung"],
        bias: "Optimismus-Verzerrung", tagW: 170,
        caps: [
          "Dein Team bringt <b>nächsten Monat</b> eine neue App heraus.",
          "Alle erwarten <b>einen Hit</b>.",
          "Niemand hält inne und fragt, <b>was schiefgehen könnte</b>.",
          "<b>Pre-Mortem:</b> Stell dir vor, ein Jahr ist vergangen und der Start ist <b>gescheitert</b>.",
          "Alle schreiben die <b>wahrscheinlichsten Gründe</b> für das Scheitern auf.",
          "Dann <b>behebe, was geht</b>, noch heute, vor dem Start.",
          "Das fängt die <b>Optimismus-Verzerrung</b> ab: „Uns passiert das nicht.“",
          "Der Start findet statt, <b>mit diesen Risiken im Griff</b>."
        ],
        say: [
          "Dein Team bringt nächsten Monat eine neue App heraus.",
          "Alle erwarten einen Hit.",
          "Niemand hält inne und fragt, was schiefgehen könnte.",
          "Mach ein Pre-Mortem. Stell dir vor, ein Jahr ist vergangen, und der Start ist gescheitert.",
          "Alle schreiben die wahrscheinlichsten Gründe für das Scheitern auf.",
          "Dann behebe, was geht, noch heute, vor dem Start.",
          "Das fängt die Optimismus-Verzerrung ab: den Glauben, dass uns das nicht passiert.",
          "Der Start findet statt, mit diesen Risiken im Griff.",
          "Mach ein Pre-Mortem. Stell dir das Scheitern vor, bevor es passiert, und behebe seine wahrscheinlichsten Ursachen schon heute."
        ]
      },
      it: {
        name: "Fai un pre-mortem", shareTitle: "Fai un pre-mortem: un’abitudine in 30 secondi",
        ecline: "Immagina il fallimento prima che accada, poi correggi oggi le sue cause più probabili.",
        today: "oggi", launch: "lancio", next: "il mese prossimo", later: "un anno dopo",
        great: "Andrà benone!", bubW: 130, ask: "cosa potrebbe andare storto?", why: "perché è fallito",
        reasons: ["nessuno lo conosceva", "server giù il primo giorno", "registrazione troppo lunga"], rw: [112.2, 126.8, 134.5],
        fixes: ["piano di lancio", "test di carico", "registrazione più breve"],
        bias: "Bias di ottimismo", tagW: 126,
        caps: [
          "Il tuo team lancia una nuova app <b>il mese prossimo</b>.",
          "Tutti si aspettano che <b>vada alla grande</b>.",
          "Nessuno si ferma a chiedersi <b>cosa potrebbe andare storto</b>.",
          "<b>Pre-mortem:</b> immagina che sia passato un anno e che il lancio sia <b>fallito</b>.",
          "Ognuno scrive le <b>cause più probabili</b> del fallimento.",
          "Poi <b>sistema ciò che puoi</b> oggi, prima del lancio.",
          "Smaschera il <b>bias di ottimismo</b>: «a noi non succederà».",
          "Il lancio va avanti, <b>con quei rischi sotto controllo</b>."
        ],
        say: [
          "Il tuo team lancia una nuova app il mese prossimo.",
          "Tutti si aspettano che vada alla grande.",
          "Nessuno si ferma a chiedersi cosa potrebbe andare storto.",
          "Fai un pre-mortem. Immagina che sia passato un anno, e che il lancio sia fallito.",
          "Ognuno scrive le cause più probabili del fallimento.",
          "Poi sistema ciò che puoi oggi, prima del lancio.",
          "Smaschera il bias di ottimismo: la convinzione che a noi non succederà.",
          "Il lancio va avanti, con quei rischi sotto controllo.",
          "Fai un pre-mortem. Immagina il fallimento prima che accada, poi correggi oggi le sue cause più probabili."
        ]
      }
    },
    svg(T) {
      // each risk: an unasked "?", then the reason it failed (crossed off once it's handled) ...
      const list = ROWS.map((y, i) => `<g data-k="cs${i}" transform="translate(${RX} ${y})">
          <g data-k="cq${i}"><rect class="pm-cd q" width="${CW}" height="${CH}" rx="6"/><text class="pm-qm" x="${CW / 2}" y="15">?</text></g>
          <g data-k="cr${i}">${card("r", T.reasons[i], `<rect class="pm-cv" data-k="cv${i}" x="23" y="3" width="${TW}" height="${CH - 6}"/><path class="pm-strike" data-k="ck${i}" d=""/>`)}</g></g>`).join("");
      // ... and a copy of it that travels back to today and becomes the fix
      const moving = ROWS.map((y, i) => `<g data-k="cm${i}"><g data-k="cmr${i}">${card("r", T.reasons[i])}</g><g data-k="cmf${i}">${card("f", T.fixes[i])}</g></g>`).join("");
      const bw = T.bubW, tagX = BX + bw + 12;
      return `
        <g data-k="tl"><path class="pm-line" data-k="line" d=""/><path class="pm-line" data-k="arr" d="M${TX1 - 6} ${TY - 5} L${TX1} ${TY} L${TX1 - 6} ${TY + 5}"/>
          <g data-k="tNow">${tick(NOW)}<text class="pm-tl" x="${NOW}" y="${TY + 18}">${T.today}</text></g>
          <g data-k="tGo">${tick(GO)}<text class="pm-tl" x="${GO}" y="${TY + 18}">${T.launch}</text><text class="pm-tl s" x="${GO}" y="${TY + 30}">${T.next}</text></g>
          <g data-k="tLater">${tick(LATER)}<text class="pm-tl" x="${LATER}" y="${TY + 18}">${T.later}</text></g></g>
        <path class="pm-ff" data-k="ff" d=""/><circle class="pm-ffd" data-k="ffd" r="4"/>
        <path class="pm-go" data-k="go" d=""/>
        <path class="pm-go" data-k="goA" d="M${TX1 - 6} ${TY - 5} L${TX1} ${TY} L${TX1 - 6} ${TY + 5}"/>
        <g data-k="tomb"><g data-k="tombIn">
          <path class="pm-tomb" d="M${LATER - 20} ${TY} V${TY - 30} A20 20 0 0 1 ${LATER + 20} ${TY - 30} V${TY} Z"/>
          <path class="pm-ep" d="M${LATER - 10} ${TY - 23} H${LATER + 10} M${LATER - 7} ${TY - 16} H${LATER + 7}"/>
          <path class="pm-crack" d="M${LATER + 7} ${TY - 49.4} L${LATER + 3} ${TY - 42} L${LATER + 8} ${TY - 37} L${LATER + 5} ${TY - 31}"/>
          <path class="pm-ep" d="M${LATER - 25} ${TY} l-2 -5 M${LATER - 22.5} ${TY} l1 -6 M${LATER + 22.5} ${TY} l1 -5 M${LATER + 25} ${TY} l3 -4"/></g></g>
        <g data-k="phone">
          <rect class="pm-ph" x="${GO - 13}" y="${TY - 46}" width="26" height="44" rx="5"/>
          <path class="pm-phl" d="M${GO - 3} ${TY - 41} H${GO + 3} M${GO - 5} ${TY - 7} H${GO + 5}"/>
          <rect class="pm-app" x="${GO - 7}" y="${TY - 31}" width="14" height="14" rx="4"/>
          <path class="pm-bolt" d="M${GO + 1.2} ${TY - 29} L${GO - 3.6} ${TY - 23.2} H${GO - 0.4} L${GO - 1.4} ${TY - 19} L${GO + 3.6} ${TY - 25} H${GO + 0.4} Z"/></g>
        <path class="pm-spark" data-k="spark" d="M${GO + 17} ${TY - 38} l6 -5 M${GO + 18} ${TY - 28} h8 M${GO + 17} ${TY - 18} l6 4"/>
        <g class="pm-ok" data-k="ok"><circle r="7.5"/><path d="M-3.6 0.3 L-1 2.9 L3.8 -2.6"/></g>
        ${TEAM.map((x, i) => `<g data-k="p${i}">${person(x, i)}</g>`).join("")}
        <g data-k="bub">
          <circle class="pm-bub" cx="${BX - 20}" cy="${BY + BH + 12}" r="1.7"/><circle class="pm-bub" cx="${BX - 13}" cy="${BY + BH + 7}" r="2.4"/>
          <rect class="pm-bub" x="${BX}" y="${BY}" width="${bw}" height="${BH}" rx="14"/>
          <text class="pm-bt" x="${BX + bw / 2}" y="${BY + 18.5}">${T.great}</text></g>
        <path class="pm-brk" data-k="brk" d=""/>
        <g class="pm-tag" data-k="tag"><rect x="${tagX}" y="${BY + 3}" width="${T.tagW}" height="22" rx="11"/><text x="${tagX + T.tagW / 2}" y="${BY + 18}">${T.bias}</text></g>
        <text class="pm-hd" data-k="ask" x="${RX}" y="44">${T.ask}</text>
        <text class="pm-hd b" data-k="why" x="${RX}" y="44">${T.why}</text>
        <g data-k="arcG"><path class="pm-arc" data-k="arc" d=""/><path class="pm-ah" data-k="ah" d="${AH}"/></g>
        ${list}${moving}
        <g data-k="wr"><path class="pm-wrh" d="${WRENCH}"/><path class="pm-wr" d="${WRENCH}"/></g>`;
    },
    S0: { line: 0, team: 0, phone: 0, mood: 0, bub: 0, spark: 0, ask: 0, q0: 0, q1: 0, q2: 0, qdim: 0,
      ff: 0, ffo: 1, drop: 0, why: 0, w0: 0, w1: 0, w2: 0, arc: 0, m0: 0, m1: 0, m2: 0,
      dim: 0, grab: 0, tag: 0, go: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = f3(cl(v)); };
      const tr = (key, x, y, s) => k(key).setAttribute("transform", `translate(${f2(x)} ${f2(y)})${s == null ? "" : ` scale(${f3(s)})`}`);
      const dim = 1 - .7 * S.dim;
      // the timeline: today, launch day next month, and (once you imagine it) a year later
      const xe = TX0 + (TX1 - TX0) * S.line;
      k("line").setAttribute("d", `M${TX0} ${TY} H${f2(xe)}`);
      op("arr", (S.line - .96) * 25);
      op("tNow", (xe - NOW) / 20); op("tGo", S.phone);
      op("tLater", (S.ff - .85) / .15);
      // the team, and how they feel about it
      TEAM.forEach((x, i) => {
        const p = cl((S.team - i * .15) / .7);
        tr("p" + i, 0, 8 * (1 - p)); op("p" + i, p * 3);
        k("mo" + i).setAttribute("d", `M${x - 2} ${TY - 27} Q${x + 1.5} ${f2(TY - 27 + 3.4 * S.mood)} ${x + 5} ${TY - 27}`);
      });
      // the app, and the picture in everyone's head
      tr("phone", 0, 8 * (1 - S.phone)); op("phone", S.phone);
      op("spark", S.spark);
      const bs = .8 + .2 * S.bub, ox = BX - 20, oy = BY + BH + 12;
      k("bub").setAttribute("transform", `translate(${ox} ${oy}) scale(${f3(bs)}) translate(${-ox} ${-oy})`);
      op("bub", S.bub);
      // what nobody asks, then why it failed
      op("ask", S.ask); op("why", S.why);
      // the jump to a year later, where it failed
      const fx = NOW + (LATER - NOW) * S.ff;
      k("ff").setAttribute("d", `M${NOW} ${TY} H${f2(fx)}`);
      op("ff", S.ff > 0 ? S.ffo : 0);
      tr("ffd", fx, TY); op("ffd", S.ff > 0 ? S.ffo : 0);
      // the launch going ahead: a green line all the way, past where the gravestone stood
      const gx = TX0 + (TX1 - TX0) * S.go;
      k("go").setAttribute("d", S.go > 0 ? `M${TX0} ${TY} H${f2(gx)}` : "");
      op("goA", (S.go - .97) * 33);
      tr("tombIn", 0, -44 * (1 - S.drop));
      op("tomb", cl(S.drop * 3) * (1 - cl((gx - (LATER - 44)) / 34)) * dim);
      const okp = cl((gx - GO) / 26);
      tr("ok", GO + 13, TY - 45, okp > 0 ? back(okp) : 0); op("ok", okp * 3);
      // the list: "?" nobody asks, the reasons it failed, then each one sent back to today as a fix and crossed off
      for (let i = 0; i < 3; i++) {
        const m = S["m" + i], e = inOut(m), w = S["w" + i], rw = T.rw[i];
        op("cs" + i, (1 - .5 * cl(m * 3)) * dim);
        op("cq" + i, S["q" + i] * (1 - .4 * S.qdim) * (1 - cl(w * 8)));
        op("cr" + i, w * 8);
        const cv = k("cv" + i);
        cv.setAttribute("x", f2(23 + TW * w)); cv.setAttribute("width", f2(TW * (1 - w)));
        const sp = cl((m - .05) / .3);
        k("ck" + i).setAttribute("d", sp > 0 ? `M22 10.5 H${f2(22 + (rw + 5) * sp)}` : "");
        tr("cm" + i, RX + (LX - RX) * e, ROWS[i] - 10 * Math.sin(Math.PI * e));
        op("cm" + i, m > 0 ? dim : 0);
        const flip = cl((m - .35) / .3);
        op("cmr" + i, 1 - flip); op("cmf" + i, flip);
      }
      // the dotted arc back to today, with the wrench riding it
      const n = Math.max(1, Math.round(40 * S.arc)), pts = [];
      for (let j = 0; j <= n; j++) pts.push(bez(S.arc * j / n).map(f2).join(" "));
      k("arc").setAttribute("d", S.arc > 0 ? "M" + pts.join(" L") : "");
      op("ah", (S.arc - .95) * 20);
      op("arcG", dim);
      const [wx, wy] = bez(Math.min(S.arc, .5));
      k("wr").setAttribute("transform", `translate(${f2(wx)} ${f2(wy)}) rotate(-35) scale(1.2)`);
      op("wr", cl(S.arc * 8) * dim);
      // optimism bias, caught: brackets close in on the old thought, and it gets its name
      const pad = 5 + 10 * (1 - S.grab), x0 = BX - pad, y0 = BY - pad, x1 = BX + T.bubW + pad, y1 = BY + BH + pad, a = 8;
      k("brk").setAttribute("d", `M${f2(x0)} ${f2(y0 + a)} V${f2(y0)} H${f2(x0 + a)} M${f2(x1 - a)} ${f2(y0)} H${f2(x1)} V${f2(y0 + a)}` +
        ` M${f2(x1)} ${f2(y1 - a)} V${f2(y1)} H${f2(x1 - a)} M${f2(x0 + a)} ${f2(y1)} H${f2(x0)} V${f2(y1 - a)}`);
      op("brk", S.grab * 2);
      tr("tag", -10 * (1 - S.tag), 0); op("tag", S.tag);
    },
    beats: [
      { steps: [{ to: { line: 1 }, ms: 800, ease: "inOut", sfx: "pluck" }, { to: { team: 1 }, ms: 600 },
        { to: { phone: 1 }, ms: 450, ease: "back" }] },
      { steps: [{ to: { mood: 1 }, ms: 350 }, { to: { bub: 1 }, ms: 450, ease: "back", sfx: "pop" }, { to: { spark: 1 }, ms: 350 }] },
      { steps: [{ to: { ask: 1 }, ms: 400 }, { to: { q0: 1 }, ms: 300, sfx: "tick" }, { to: { q1: 1 }, ms: 300 }, { to: { q2: 1 }, ms: 300 },
        { wait: 400 }, { to: { qdim: 1 }, ms: 600 }] },
      { steps: [{ to: { bub: 0, spark: 0, ask: 0, mood: 0 }, ms: 400 }, { to: { ff: 1 }, ms: 1000, ease: "inOut", sfx: "whoosh" },
        { to: { drop: 1, mood: -.8 }, ms: 800, ease: "bounce", sfx: "thud", sfxAt: 280 }, { to: { ffo: 0 }, ms: 400 }] },
      { steps: [{ to: { why: 1 }, ms: 350 }, { to: { w0: 1 }, ms: 700, ease: "lin", sfx: "scribble" }, { wait: 150 },
        { to: { w1: 1 }, ms: 700, ease: "lin" }, { wait: 150 }, { to: { w2: 1 }, ms: 700, ease: "lin" }], hold: 3000 },
      { steps: [{ to: { why: 0, mood: 0 }, ms: 300 }, { to: { arc: 1 }, ms: 900, ease: "inOut", sfx: "whoosh" },
        { to: { m0: 1 }, ms: 750, ease: "lin" }, { to: { m1: 1 }, ms: 750, ease: "lin" }, { to: { m2: 1 }, ms: 750, ease: "lin" }], hold: 3000 },
      { steps: [{ to: { dim: 1 }, ms: 400 }, { to: { bub: 1 }, ms: 400 }, { to: { grab: 1 }, ms: 500, ease: "back" },
        { to: { tag: 1 }, ms: 400, ease: "back", sfx: "pop" }], hold: 3000 },
      { steps: [{ to: { bub: 0, grab: 0, tag: 0, dim: 0 }, ms: 450 }, { to: { go: 1 }, ms: 1600, ease: "inOut" },
        { to: { mood: 1 }, ms: 400, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
