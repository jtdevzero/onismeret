/* Bandwagon effect: two new restaurants, a coin flip, and a queue that grows because it is a queue.
   Everyone walks a fixed path at a fixed time, so every recording is identical. Scene for anim.js. */
(function () {
  const KEY = "bandwagon-effect", P = `.bp[data-scene="${KEY}"]`;
  const G = 192, LANE = 246;                  // pavement (the crowd's feet) and the front lane where you walk
  const SA = 150, SB = 270, SW = 106;         // left edges of restaurants A and B, and their width
  const TOP = G - 132;                        // roof line of both restaurants
  const DOOR = SA + 24;                       // A's door: people go in here
  const START = 16;                           // everyone walks in from the left, fading in here
  const NQ = 6, QX = j => SA - 8 - 20 * j;    // queue slots outside A, front to back
  const QGAP = 360, QV = .13, QT = 2000;      // queue: start gap (ms), walking speed (px/ms), total time (ms)
  const FGAP = 380, FT = 2000;                // the three followers: start gap and total time (ms), same speed
  const SEAT = i => SA + 52 + 9.5 * i;        // diners' seats in A's window
  const PAUSE = [116, 96];                    // where the couple stops to toss the coin
  const COIN = [106, G - 68];
  const YOU0 = 34, YOU1 = SB + SW / 2;        // you: first stop, then in front of B
  const CA = SA + SW / 2, CB = SB + SW / 2;   // centres of the two restaurants (and their review cards)
  const CY = 10, CH = 44;                              // top of the review cards
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const walkE = p => (3 * p - p * p * p) / 2;          // walk in briskly, slow to a stop
  const bump = p => cl(Math.min(p, 1 - p) * 14);        // 1 while walking, 0 when standing

  // a person standing on (0, 0): legs (redrawn every frame), body, head
  const person = (key, cls) => `<g class="bw-p${cls ? " " + cls : ""}" data-k="${key}"><path data-k="${key}l"/>` +
    `<path d="M-7 -12 V-23 Q-7 -29.5 0 -29.5 Q7 -29.5 7 -23 V-12 Z"/><circle cy="-36" r="5.5"/></g>`;
  // a diner seen through the window, above the table
  const diner = (i, x) => `<g class="bw-d" data-k="d${i}"><path d="M${x - 5.5} ${G - 30} C${x - 5.5} ${G - 37} ${x - 3} ${G - 40} ${x} ${G - 40} C${x + 3} ${G - 40} ${x + 5.5} ${G - 37} ${x + 5.5} ${G - 30}"/><circle cx="${x}" cy="${G - 47}" r="4.2"/></g>`;
  // striped awning with a scalloped edge
  const awning = (x0, x1, y) => {
    const n = 9, w = f1((x1 - x0) / n), r = f1(w / 2);
    let edge = "", stripes = "";
    for (let i = 0; i < n; i++) edge += ` a${r} ${r} 0 0 1 ${-w} 0`;
    for (let i = 0; i < n; i += 2) stripes += `<path class="bw-aws" d="M${f1(x0 + i * w)} ${y} h${w} v8 a${r} ${r} 0 0 1 ${-w} 0 Z"/>`;
    const d = `M${x0} ${y} H${f1(x0 + n * w)} V${y + 8}${edge} Z`;
    return `<path class="bw-aw" d="${d}"/>${stripes}<path class="bw-awl" d="${d}"/>`;
  };
  const store = (key, x, letter, diners) => `
    <g data-k="${key}">
      <rect class="bw-fa" x="${x}" y="${TOP}" width="${SW}" height="${G - TOP}"/>
      <line class="bw-cor" x1="${x - 3}" y1="${TOP}" x2="${x + SW + 3}" y2="${TOP}"/>
      <rect class="bw-sg" x="${x + 37}" y="${TOP + 6}" width="32" height="24" rx="5"/>
      <text class="bw-sl" data-k="${key}t" x="${x + 53}" y="${TOP + 24}">${letter}</text>
      ${awning(x - 4, x + SW + 4, TOP + 38)}
      <rect class="bw-dr" x="${x + 12}" y="${G - 58}" width="24" height="58" rx="2"/>
      <circle class="bw-kn" cx="${x + 31}" cy="${G - 28}" r="1.5"/>
      <rect class="bw-wn" x="${x + 46}" y="${G - 66}" width="50" height="46" rx="2"/>
      ${diners}
      ${key === "stA" ? `<rect class="bw-hi" data-k="winHi" x="${x + 42}" y="${G - 70}" width="58" height="54" rx="5"/>` : ""}
      <line class="bw-tb" x1="${x + 48}" y1="${G - 30}" x2="${x + 94}" y2="${G - 30}"/>
    </g>`;
  // "copy the one ahead": an arc from each head to the head in front
  const arrow = j => {
    const xa = QX(j) + 2, xb = QX(j - 1) - 2, mx = (xa + xb) / 2, y = G - 47, cy = G - 60;
    const dx = xb - mx, dy = y - cy, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const bx = xb - 5 * ux, by = y - 5 * uy;
    return `<path class="bw-ar" data-k="ar${j}" pathLength="1" d="M${xa} ${y} Q${mx} ${cy} ${xb} ${y}"/>` +
      `<path class="bw-ah" data-k="ah${j}" d="M${f1(bx - 3.6 * uy)} ${f1(by + 3.6 * ux)} L${xb} ${y} L${f1(bx + 3.6 * uy)} ${f1(by - 3.6 * ux)}"/>`;
  };
  // a menu with its rating: dishes on the left, stars on the right
  const card = (key, cx, T, rating, extra) => `<g class="bw-cd" data-k="${key}"><rect class="bx" x="${cx - 44}" y="${CY}" width="88" height="${CH}" rx="7"/>
    <text class="h" x="${cx - 21}" y="${CY + 19}">${T.menu}</text><path class="dl" d="M${cx - 32} ${CY + 27} H${cx - 10} M${cx - 32} ${CY + 33.5} H${cx - 17}"/>
    <line class="sep" x1="${cx + 1}" y1="${CY + 8}" x2="${cx + 1}" y2="${CY + CH - 8}"/>
    <text class="r" x="${cx + 23}" y="${CY + 26.5}">★ ${rating}</text>${extra || ""}</g>`;

  window.BiasAnim.SCENES[KEY] = {
    q: "nem", viewBox: "0 0 400 272",
    css: `
      ${P} .bw-gr{stroke:var(--rule);stroke-width:2;stroke-linecap:round}
      ${P} .bw-fa{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .bw-cor{stroke:var(--ink);stroke-width:2.6;stroke-linecap:round}
      ${P} .bw-sg{fill:var(--surface);stroke:var(--ink);stroke-width:1.8}
      ${P} .bw-sl{font:700 16px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .bw-sl.g{fill:var(--good)}
      ${P} .bw-aw{fill:var(--surface);stroke:none}
      ${P} .bw-aws{fill:var(--muted);fill-opacity:.35;stroke:none}
      ${P} .bw-awl{fill:none;stroke:var(--ink);stroke-width:2;stroke-linejoin:round}
      ${P} .bw-dr{fill:var(--ground);stroke:var(--ink);stroke-width:2}
      ${P} .bw-kn{fill:var(--ink)}
      ${P} .bw-wn{fill:var(--ground);stroke:var(--ink);stroke-width:2}
      ${P} .bw-hi{fill:none;stroke:var(--q);stroke-width:2;stroke-dasharray:4 3.5;stroke-linecap:round}
      ${P} .bw-tb{stroke:var(--muted);stroke-width:2;stroke-linecap:round}
      ${P} .bw-d path,${P} .bw-d circle{fill:var(--surface);stroke:var(--muted);stroke-width:1.6}
      ${P} .bw-p path,${P} .bw-p circle{fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .bw-p.you path,${P} .bw-p.you circle{stroke:var(--q)}
      ${P} .bw-p.win path,${P} .bw-p.win circle{stroke:var(--good)}
      ${P} .bw-coin circle{fill:var(--surface);stroke:var(--q);stroke-width:2.2}
      ${P} .bw-coin text{font:700 13px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .bw-bub rect,${P} .bw-bub circle{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .bw-bub text{font:600 12.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .bw-ar{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-dasharray:1 1}
      ${P} .bw-ah{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .bw-lb{font:500 10px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .bw-lb.m{fill:var(--muted)}
      ${P} .bw-lb.s{text-anchor:start}
      ${P} .bw-lb.g{fill:var(--good)}
      ${P} .bw-qm rect{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .bw-qm text{font:700 13px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .bw-cd .bx{fill:var(--surface);stroke:var(--muted);stroke-width:1.6}
      ${P} .bw-cd .h{font:500 9px var(--mono);fill:var(--muted);text-anchor:middle;letter-spacing:.02em}
      ${P} .bw-cd .dl{fill:none;stroke:var(--faint);stroke-width:2;stroke-linecap:round}
      ${P} .bw-cd .sep{stroke:var(--rule);stroke-width:1.4}
      ${P} .bw-cd .r{font:700 13px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .bw-cd .gx{fill:none;stroke:var(--good);stroke-width:2}
      ${P} .bw-cd .gr{font:700 13px var(--display);fill:var(--good);text-anchor:middle}
      ${P} .bw-ck circle{fill:var(--surface);stroke:var(--good);stroke-width:1.8}
      ${P} .bw-ck path{fill:none;stroke:var(--good);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .bw-lens circle{fill:var(--q);fill-opacity:.08;stroke:var(--q);stroke-width:2.4}
      ${P} .bw-lens line{stroke:var(--q);stroke-width:4.5;stroke-linecap:round}
    `,
    text: {
      hu: {
        name: "Csordaszellem-hatás", shareTitle: "A csordaszellem-hatás, 30 másodpercben",
        ecline: "A tömeg jel, nem bizonyíték. Nézd meg magad.",
        a: "A", b: "B", bubble: "Biztos jó!", follow: "a tömeget követve", empty: "üres", you: "te",
        menu: "ÉTLAP", rA: "3,6", rB: "4,7",
        caps: [
          "Két új étterem nyílik egymás mellett.",
          "Az első pár <b>véletlenszerűen</b> az egyiket választja.",
          "A következők látják, hogy az A-ban vannak vendégek, és <b>követik</b> őket.",
          "Sor alakul ki. <b>Biztos jó</b>… igaz?",
          "Mindenki <b>másokat másol</b>, és senki nem kóstolta meg az ételt.",
          "A B üres marad, pedig lehet, hogy <b>jobb</b>.",
          "<b>A megoldás:</b> a saját bizonyítékaid alapján ítélj. Étlap, vélemények, egy kóstoló.",
          "A saját indokaid alapján válassz, <b>ne a sor alapján</b>."
        ],
        say: [
          "Két új étterem nyílik egymás mellett.",
          "Az első pár véletlenszerűen az egyiket választja.",
          "A következők látják, hogy az A-ban vannak vendégek, és követik őket.",
          "Sor alakul ki. Biztos jó... igaz?",
          "Mindenki másokat másol. A sorban álló emberek közül senki nem kóstolta meg az ételt.",
          "A B étterem üres marad, pedig lehet, hogy jobb.",
          "A megoldás: a saját bizonyítékaid alapján ítélj. Az étlap, a vélemények, egy kóstoló.",
          "A saját indokaid alapján válassz, ne azért, mert sor van.",
          "Csordaszellem-hatás. A tömeg jel, nem bizonyíték. Nézd meg magad."
        ]
      },
      en: {
        name: "Bandwagon effect", shareTitle: "Bandwagon effect, explained in 30 seconds",
        ecline: "A crowd is a signal, not proof. Check for yourself.",
        a: "A", b: "B", bubble: "Must be good!", follow: "following the crowd", empty: "empty", you: "you",
        menu: "MENU", rA: "3.6", rB: "4.7",
        caps: [
          "Two new restaurants open side by side.",
          "The first couple picks one <b>at random</b>.",
          "The next people see diners in A, and <b>follow</b>.",
          "A queue forms. It <b>must be good</b>… right?",
          "Everyone is <b>copying everyone else</b>, not tasting the food.",
          "B stays empty, though it might be <b>better</b>.",
          "<b>The fix:</b> judge on your own evidence. Menu, reviews, a taste.",
          "Choose for your own reasons, <b>not the queue</b>."
        ],
        say: [
          "Two new restaurants open, side by side.",
          "The first couple picks one at random.",
          "The next people see diners in restaurant A, and follow them in.",
          "A queue forms. It must be good... right?",
          "Everyone is copying everyone else. Nobody in the queue has tasted the food.",
          "Restaurant B stays empty, even though it might be better.",
          "The fix: judge on your own evidence. The menu, the reviews, a taste.",
          "Choose for your own reasons, not because of the queue.",
          "The bandwagon effect. A crowd is a signal, not proof. Check for yourself."
        ]
      },
      el: {
        name: "Φαινόμενο της αγέλης", shareTitle: "Το φαινόμενο της αγέλης σε 30 δευτερόλεπτα",
        ecline: "Ο πολύς κόσμος είναι ένδειξη, όχι απόδειξη. Δες το με τα μάτια σου.",
        a: "Α", b: "Β", bubble: "Κάτι θα ’χει!", follow: "ακολουθούν την αγέλη", empty: "άδειο", you: "εσύ",
        menu: "ΜΕΝΟΥ", rA: "3,6", rB: "4,7",
        caps: [
          "Δύο καινούργια εστιατόρια ανοίγουν δίπλα δίπλα.",
          "Το πρώτο ζευγάρι διαλέγει ένα <b>στην τύχη</b>.",
          "Οι επόμενοι βλέπουν κόσμο στο Α και <b>ακολουθούν</b>.",
          "Μαζεύεται ουρά. <b>Κάτι θα ’χει</b>… έτσι;",
          "Ο ένας <b>αντιγράφει τον άλλον</b> χωρίς να έχει δοκιμάσει το φαγητό.",
          "Το Β μένει άδειο, αν και μπορεί να είναι <b>καλύτερο</b>.",
          "<b>Η λύση:</b> κρίνε με δικά σου στοιχεία. Μενού, κριτικές, μια μπουκιά.",
          "Διάλεξε με δικά σου κριτήρια, <b>όχι επειδή έχει ουρά</b>."
        ],
        say: [
          "Δύο καινούργια εστιατόρια ανοίγουν δίπλα δίπλα.",
          "Το πρώτο ζευγάρι διαλέγει ένα στην τύχη.",
          "Οι επόμενοι βλέπουν κόσμο στο Άλφα και μπαίνουν κι αυτοί.",
          "Μαζεύεται ουρά. Κάτι θα έχει... έτσι;",
          "Ο ένας αντιγράφει τον άλλον. Κανείς στην ουρά δεν έχει δοκιμάσει το φαγητό.",
          "Το Βήτα μένει άδειο, αν και μπορεί να είναι καλύτερο.",
          "Η λύση: κρίνε με δικά σου στοιχεία. Το μενού, οι κριτικές, μια μπουκιά.",
          "Διάλεξε με δικά σου κριτήρια, όχι επειδή έχει ουρά.",
          "Φαινόμενο της αγέλης. Ο πολύς κόσμος είναι ένδειξη, όχι απόδειξη. Δες το με τα μάτια σου."
        ]
      },
      es: {
        name: "Efecto de arrastre", shareTitle: "El efecto de arrastre en 30 segundos",
        ecline: "Una multitud es una señal, no una prueba. Compruébalo por tu cuenta.",
        a: "A", b: "B", bubble: "¡Será bueno!", follow: "siguiendo al resto", empty: "vacío", you: "tú",
        menu: "MENÚ", rA: "3,6", rB: "4,7",
        caps: [
          "Abren dos restaurantes nuevos, uno al lado del otro.",
          "La primera pareja elige uno <b>al azar</b>.",
          "Los siguientes ven clientes en el A y <b>los siguen</b>.",
          "Se forma una cola. <b>Será bueno</b>… ¿no?",
          "Todos <b>copian a los demás</b>, sin haber probado la comida.",
          "El B sigue vacío, aunque quizá sea <b>mejor</b>.",
          "<b>La solución:</b> juzga con tus propias pruebas. Menú, reseñas, probar algo.",
          "Elige por tus propias razones, <b>no por la cola</b>."
        ],
        say: [
          "Abren dos restaurantes nuevos, uno al lado del otro.",
          "La primera pareja elige uno al azar.",
          "Los siguientes ven clientes en el restaurante A, y entran detrás.",
          "Se forma una cola. Será bueno... ¿no?",
          "Todos copian a los demás. Nadie en la cola ha probado la comida.",
          "El restaurante B sigue vacío, aunque quizá sea mejor.",
          "La solución: juzga con tus propias pruebas. El menú, las reseñas, probar algo.",
          "Elige por tus propias razones, no porque haya cola.",
          "Efecto de arrastre. Una multitud es una señal, no una prueba. Compruébalo por tu cuenta."
        ]
      },
      fr: {
        name: "Effet d’entraînement", shareTitle: "L’effet d’entraînement en 30 secondes",
        ecline: "Une foule est un signal, pas une preuve. Vérifiez par vous-même.",
        a: "A", b: "B", bubble: "Ça doit être bon !", follow: "on suit la foule", empty: "vide", you: "vous",
        menu: "MENU", rA: "3,6", rB: "4,7",
        caps: [
          "Deux nouveaux restaurants ouvrent côte à côte.",
          "Le premier couple en choisit un <b>au hasard</b>.",
          "Les suivants voient des clients dans le A, et <b>les suivent</b>.",
          "Une file se forme. Ça <b>doit être bon</b>… non ?",
          "Chacun <b>copie les autres</b>, sans avoir goûté la cuisine.",
          "Le B reste vide, alors qu’il est peut-être <b>meilleur</b>.",
          "<b>La solution :</b> jugez par vous-même. La carte, les avis, un avant-goût.",
          "Choisissez pour vos propres raisons, <b>pas pour la file</b>."
        ],
        say: [
          "Deux nouveaux restaurants ouvrent, côte à côte.",
          "Le premier couple en choisit un au hasard.",
          "Les suivants voient des clients dans le restaurant A, et les suivent.",
          "Une file se forme. Ça doit être bon... non ?",
          "Chacun copie les autres. Personne dans la file n’a goûté la cuisine.",
          "Le restaurant B reste vide, alors qu’il est peut-être meilleur.",
          "La solution : jugez par vous-même. La carte, les avis, un avant-goût.",
          "Choisissez pour vos propres raisons, pas à cause de la file.",
          "L’effet d’entraînement. Une foule est un signal, pas une preuve. Vérifiez par vous-même."
        ]
      },
      de: {
        name: "Mitläufereffekt", shareTitle: "Der Mitläufereffekt in 30 Sekunden",
        ecline: "Eine Menschenmenge ist ein Signal, kein Beweis. Prüf selbst nach.",
        a: "A", b: "B", bubble: "Muss gut sein!", follow: "der Masse folgen", empty: "leer", you: "du",
        menu: "KARTE", rA: "3,6", rB: "4,7",
        caps: [
          "Zwei neue Restaurants eröffnen direkt nebeneinander.",
          "Das erste Paar wählt eins <b>per Zufall</b>.",
          "Die Nächsten sehen Gäste in A und <b>folgen</b>.",
          "Eine Schlange bildet sich. Das <b>muss gut sein</b>… oder?",
          "Alle <b>machen es den anderen nach</b>, ohne das Essen zu kennen.",
          "B bleibt leer, obwohl es vielleicht <b>besser</b> ist.",
          "<b>Die Lösung:</b> Urteile nach eigenen Belegen. Karte, Bewertungen, eine Kostprobe.",
          "Wähle aus eigenen Gründen, <b>nicht wegen der Schlange</b>."
        ],
        say: [
          "Zwei neue Restaurants eröffnen, direkt nebeneinander.",
          "Das erste Paar wählt eins per Zufall.",
          "Die Nächsten sehen Gäste in Restaurant A und gehen hinterher.",
          "Eine Schlange bildet sich. Das muss gut sein... oder?",
          "Alle machen es den anderen nach. Niemand in der Schlange hat das Essen probiert.",
          "Restaurant B bleibt leer, obwohl es vielleicht besser ist.",
          "Die Lösung: Urteile nach eigenen Belegen. Die Karte, die Bewertungen, eine Kostprobe.",
          "Wähle aus eigenen Gründen, nicht wegen der Schlange.",
          "Der Mitläufereffekt. Eine Menschenmenge ist ein Signal, kein Beweis. Prüf selbst nach."
        ]
      },
      it: {
        name: "Effetto carrozzone", shareTitle: "L’effetto carrozzone in 30 secondi",
        ecline: "Una folla è un segnale, non una prova. Verifica di persona.",
        a: "A", b: "B", bubble: "Sarà buono!", follow: "seguendo la folla", empty: "vuoto", you: "tu",
        menu: "MENU", rA: "3,6", rB: "4,7",
        caps: [
          "Due nuovi ristoranti aprono uno accanto all’altro.",
          "La prima coppia ne sceglie uno <b>a caso</b>.",
          "Chi arriva dopo vede clienti in A, e <b>li segue</b>.",
          "Si forma una coda. <b>Sarà buono</b>… no?",
          "Ognuno <b>copia gli altri</b>, senza aver assaggiato niente.",
          "B resta vuoto, anche se potrebbe essere <b>migliore</b>.",
          "<b>La soluzione:</b> giudica con le tue prove: menu, recensioni, un assaggio.",
          "Scegli per le tue ragioni, <b>non per la coda</b>."
        ],
        say: [
          "Due nuovi ristoranti aprono, uno accanto all’altro.",
          "La prima coppia ne sceglie uno a caso.",
          "Chi arriva dopo vede clienti nel ristorante A, e li segue dentro.",
          "Si forma una coda. Sarà buono... no?",
          "Ognuno copia gli altri. Nessuno in coda ha assaggiato il cibo.",
          "Il ristorante B resta vuoto, anche se potrebbe essere migliore.",
          "La soluzione: giudica con le tue prove. Il menu, le recensioni, un assaggio.",
          "Scegli per le tue ragioni, non perché c’è la coda.",
          "L’effetto carrozzone. Una folla è un segnale, non una prova. Verifica di persona."
        ]
      }
    },
    svg(T) {
      let diners = "";
      for (let i = 0; i < 5; i++) diners += diner(i, SEAT(i));
      let queue = "", arrows = "";
      for (let j = 0; j < NQ; j++) queue += person("q" + j);
      for (let j = 1; j < NQ; j++) arrows += arrow(j);
      const qm = (QX(0) + QX(NQ - 1)) / 2;
      return `
        <line class="bw-gr" x1="12" y1="${G}" x2="388" y2="${G}"/>
        ${store("stA", SA, T.a, diners)}
        ${store("stB", SB, T.b, "")}
        <text class="bw-sl g" data-k="stBg" x="${SB + 53}" y="${TOP + 24}">${T.b}</text>
        ${person("c1")}${person("c0")}
        ${person("f2")}${person("f1")}${person("f0")}
        <g data-k="queue">${queue}</g>
        <g class="bw-coin" data-k="coin"><g data-k="coinf"><circle r="12"/><text data-k="coinA" y="4.6">${T.a}</text><text data-k="coinB" y="4.6">${T.b}</text></g></g>
        <g class="bw-bub" data-k="bub"><rect x="16" y="${G - 106}" width="120" height="28" rx="12"/><circle cx="48" cy="${G - 68}" r="3.8"/><circle cx="45" cy="${G - 57}" r="2.6"/><text x="76" y="${G - 87.5}">${T.bubble}</text></g>
        <g data-k="arrs">${arrows}</g>
        <text class="bw-lb" data-k="fl" x="${qm}" y="${G + 20}">${T.follow}</text>
        <g class="bw-qm" data-k="qm"><rect x="-21" y="-12" width="42" height="24" rx="8"/><text y="4.6">★ ?</text></g>
        <text class="bw-lb m" data-k="empty" x="${CB}" y="${G + 20}">${T.empty}</text>
        ${card("cardA", CA, T, T.rA)}
        ${card("cardB", CB, T, T.rB, `<g data-k="cardBg"><rect class="gx" x="${CB - 44}" y="${CY}" width="88" height="${CH}" rx="7"/><text class="gr" x="${CB + 23}" y="${CY + 26.5}">★ ${T.rB}</text></g>`)}
        <g transform="translate(${SB + 87} ${TOP + 18})"><g class="bw-ck" data-k="ck"><circle r="7.5"/><path d="M-3.4 0.3 L-0.9 2.9 L3.6 -2.5"/></g></g>
        <g class="bw-lens" data-k="lens"><circle r="20.5"/><line x1="14.8" y1="14.8" x2="19.8" y2="19.8"/></g>
        <g data-k="you">${person("youQ", "you")}${person("youG", "win")}</g>
        <g data-k="youL"><text class="bw-lb s" data-k="youLq" y="0">${T.you}</text><text class="bw-lb s g" data-k="youLg" y="0">${T.you}</text></g>`;
    },
    S0: { stA: 0, stB: 0, c: 0, coin: 0, flip: 0, cGo: 0, cIn: 0, fol: 0, que: 0, bub: 0, arr: 0, fl: 0, arrOff: 0,
      hi: 0, qm: 0, sw: 0, empty: 0, dim: 0, you: 0, cards: 0, lens: 0, lensX: 0, walk: 0, win: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const tr = (key, x, y, extra) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)})${extra || ""}`);
      const sc = v => f1(Math.max(.001, v) * 100) / 100;
      // place a person: position, opacity, and legs that swing with the distance walked while moving
      const put = (key, x, y, o, m, dist) => {
        const s = 3.6 * Math.sin(dist * .15) * m;
        tr(key, x, y);
        k(key + "l").setAttribute("d", `M-3 -12 L${f1(-3.5 + s)} 0 M3 -12 L${f1(3.5 - s)} 0`);
        op(key, o);
      };
      // the two restaurants
      tr("stA", 0, (1 - S.stA) * 10); op("stA", S.stA);
      tr("stB", 0, (1 - S.stB) * 10); op("stB", S.stB);
      op("stBt", 1 - S.win); op("stBg", S.win);
      op("winHi", S.hi);
      // the couple: walk in, stop for the coin, walk to A's door, go in
      const cx = i => { const s0 = START + (i ? 0 : 20), x = s0 + (PAUSE[i] - s0) * walkE(S.c); return x + (DOOR - 20 * i - x) * walkE(S.cGo); };
      const x0 = cx(0), x1 = cx(1) + 20 * cl(S.cIn / .6), mc = Math.max(bump(S.c), bump(S.cGo));
      put("c0", x0, G, cl(S.c * 6) * (1 - cl(S.cIn * 2.5)), mc, x0 - START);
      put("c1", x1, G, cl(S.c * 6) * (1 - cl((S.cIn - .6) / .3)), Math.max(mc, S.cIn > 0 && S.cIn < .6 ? 1 : 0), x1 - START);
      const dinerOp = [cl((S.cIn - .3) / .25), cl((S.cIn - .88) / .12)];
      // the coin: pops up over the couple, flips, lands on A, fades as they walk
      const fp = cl(S.flip / 6), turn = Math.abs(Math.cos(S.flip * Math.PI));
      tr("coin", COIN[0], COIN[1] - Math.sin(Math.PI * fp) * 16);
      k("coinf").setAttribute("transform", `scale(${sc(turn * S.coin)} ${sc(S.coin)})`);
      const faceA = Math.round(S.flip) % 2 === 0;
      op("coinA", faceA ? 1 : 0); op("coinB", faceA ? 0 : 1);
      op("coin", S.coin * 3 * (1 - S.cGo));
      // three followers: walk in one after another and go into A
      for (let j = 0; j < 3; j++) {
        const p = cl((S.fol * FT - FGAP * j) / ((DOOR - START) / QV)), x = START + (DOOR - START) * p;
        put("f" + j, x, G, cl(p * 8) * (1 - cl((p - .93) / .07)), bump(p), x - START);
        dinerOp.push(cl((p - .93) / .07));
      }
      dinerOp.forEach((v, i) => op("d" + i, v * (1 - .45 * S.dim)));
      // the queue: each walks in and stops behind the one ahead
      for (let j = 0; j < NQ; j++) {
        const D = QX(j) - START, p = cl((S.que * QT - QGAP * j) / (D / QV)), x = START + D * walkE(p);
        put("q" + j, x, G, cl(p * 8), bump(p), x - START);
      }
      op("queue", 1 - .6 * S.dim);
      // "must be good" thought bubble over the newest in line
      k("bub").setAttribute("transform", `translate(45 ${G - 54}) scale(${sc(.6 + .4 * S.bub)}) translate(-45 ${54 - G})`);
      op("bub", S.bub * 1.5);
      // each one copies the one ahead
      for (let j = 1; j < NQ; j++) {
        const p = cl((S.arr - (j - 1) * .16) / .2);
        k("ar" + j).style.strokeDashoffset = 1 - p;
        op("ar" + j, p > 0 ? 1 : 0); op("ah" + j, (p - .8) / .2);
      }
      op("arrs", 1 - S.arrOff); op("fl", S.fl * (1 - S.arrOff));
      // B: unknown quality, empty
      tr("qm", CB, TOP - 20, ` rotate(${f1(S.sw)}) scale(${sc(.6 + .4 * S.qm)})`);
      op("qm", S.qm * 1.5); op("empty", S.empty);
      // the fix: look at the evidence for both
      tr("cardA", 0, (1 - S.cards) * 6); op("cardA", S.cards * (1 - .5 * S.win));
      tr("cardB", 0, (1 - S.cards) * 6); op("cardB", S.cards);
      op("cardBg", S.win);
      op("ck", S.win); k("ck").setAttribute("transform", `scale(${sc(S.win)})`);
      tr("lens", CA - 21 + (CB - CA) * S.lensX, CY + CH / 2); op("lens", S.lens);
      // you: step in, then walk past the queue to B
      const yx0 = START + (YOU0 - START) * walkE(S.you), yx = yx0 + (YOU1 - yx0) * walkE(S.walk), ym = Math.max(bump(S.you), bump(S.walk));
      put("youQ", yx, LANE, 1 - S.win, ym, yx - START);
      put("youG", yx, LANE, S.win, ym, yx - START);
      op("you", S.you * 4);
      tr("youL", yx + 10, LANE - 32); op("youL", S.you);
      op("youLq", 1 - S.win); op("youLg", S.win);
    },
    beats: [
      { steps: [{ to: { stA: 1 }, ms: 600, sfx: "pluck" }, { to: { stB: 1 }, ms: 600 }] },
      { steps: [{ to: { c: 1 }, ms: 950, ease: "lin" }, { to: { coin: 1 }, ms: 300, ease: "out", sfx: "pop" },
        { to: { flip: 6 }, ms: 1000, ease: "inOut" }, { wait: 300 }, { to: { cGo: 1 }, ms: 750, ease: "lin" }], hold: 2000 },
      { steps: [{ to: { cIn: 1 }, ms: 650, ease: "lin" }, { to: { hi: 1 }, ms: 250 }, { to: { fol: 1 }, ms: FT, ease: "lin", sfx: "whoosh" }], hold: 2000 },
      { steps: [{ to: { hi: 0 }, ms: 300 }, { to: { que: 1 }, ms: QT, ease: "lin" }, { to: { bub: 1 }, ms: 450, ease: "out", sfx: "pop" }], hold: 2200 },
      { steps: [{ to: { bub: 0 }, ms: 300 }, { to: { arr: 1 }, ms: 1300, ease: "lin", sfx: "tick" }, { to: { fl: 1 }, ms: 400 }] },
      { steps: [{ to: { arrOff: 1 }, ms: 400 }, { to: { qm: 1 }, ms: 450, ease: "out", sfx: "tick" }, { to: { sw: 12 }, ms: 260 },
        { to: { sw: -8 }, ms: 300, ease: "inOut" }, { to: { sw: 0 }, ms: 300, ease: "inOut" }, { to: { empty: 1 }, ms: 400 }] },
      { steps: [{ to: { qm: 0, empty: 0, dim: 1 }, ms: 500 }, { to: { you: 1 }, ms: 500, ease: "lin" },
        { to: { cards: 1 }, ms: 500, sfx: "scribble" }, { to: { lens: 1 }, ms: 350 }, { to: { lensX: 1 }, ms: 950, ease: "inOut" }] },
      { steps: [{ to: { lens: 0 }, ms: 300 }, { to: { walk: 1 }, ms: 1900, ease: "lin" }, { to: { win: 1 }, ms: 500, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
