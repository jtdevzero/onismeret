/* Dunning-Kruger effect: actual rank vs guessed rank by quartile (Kruger & Dunning, 1999).
   Illustrative heights, not the paper's exact numbers. Scene for anim.js. */
(function () {
  const KEY = "dunning-kruger", SC = `.bp[data-scene="${KEY}"]`;
  const B = 210, TOP = 50, AX = 74, RX = 390;                  // baseline, 100th percentile, y axis, right edge
  const Y = p => B - (B - TOP) * p / 100;                        // percentile -> y
  const SLOT = (RX - AX) / 4, C = i => AX + SLOT * (i + .5);     // group centre
  const W = 22;                                                  // bar width
  const AXl = i => C(i) - 2 - W, GXl = i => C(i) + 2;            // left edge of actual / guess bar
  const ACT = [12, 37, 62, 87], GUESS = [60, 62, 68, 74], FIXED = 20;
  const FBX = 110, FBY = 44, FBW = 200;                           // feedback card
  const clamp = v => Math.max(0, Math.min(1, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const stag = (p, i) => ease(clamp((p - i * .12) / .64));      // staggered growth per group
  const lines = (arr, x, y, dy) => arr.map((s, j) => `<tspan x="${x}" y="${y + j * dy}">${s}</tspan>`).join("");

  // a small test page; marks: circled mistakes in red
  const doc = (x, y, marks) => `<g class="doc" transform="translate(${x} ${y})"><rect width="26" height="34" rx="3"/>
      <line x1="5" y1="8" x2="21" y2="8"/><line x1="5" y1="14" x2="18" y2="14"/><line x1="5" y1="20" x2="21" y2="20"/><line x1="5" y1="26" x2="15" y2="26"/>
      ${marks ? `<ellipse class="mk" cx="15" cy="14" rx="7.5" ry="3.8"/><ellipse class="mk" cx="11" cy="26" rx="7.5" ry="3.8"/>` : ""}</g>`;

  window.BiasAnim.SCENES[KEY] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
      ${SC} .dk-yl{font:500 9.5px var(--mono);fill:var(--faint);text-anchor:end}
      ${SC} .dk-avg{stroke:var(--muted);stroke-width:1.3;stroke-dasharray:4 4}
      ${SC} .dk-avgt{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:end}
      ${SC} .dk-avg.hi{stroke:var(--q);stroke-width:1.6}
      ${SC} .dk-avgt.hi{fill:var(--q);stroke:var(--ground);stroke-width:3;paint-order:stroke}
      ${SC} .dk-gl{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${SC} .dk-xt{font:500 9.5px var(--mono);fill:var(--faint);text-anchor:middle}
      ${SC} .dk-yt{font:500 9.5px var(--mono);fill:var(--faint);text-anchor:middle}
      ${SC} .dk-leg{font:600 10.5px var(--display);fill:var(--ink)}
      ${SC} .dk-act{fill:var(--ink)}
      ${SC} .dk-gs{fill:color-mix(in srgb,var(--q) 20%,transparent);stroke:var(--q);stroke-width:2;stroke-linejoin:round}
      ${SC} .dk-ok{fill:color-mix(in srgb,var(--good) 22%,transparent);stroke:var(--good);stroke-width:2;stroke-linejoin:round}
      ${SC} .dk-old{fill:none;stroke:var(--q);stroke-width:1.4;stroke-dasharray:3 3}
      ${SC} .dk-man circle,${SC} .dk-man path{fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${SC} .dk-qm{font:700 14px var(--display);fill:var(--q);text-anchor:middle}
      ${SC} .dk-br{fill:none;stroke:var(--bad);stroke-width:1.8;stroke-linecap:round}
      ${SC} .dk-guide{fill:none;stroke:var(--bad);stroke-width:1.3;stroke-dasharray:1 3.5;stroke-linecap:round}
      ${SC} .dk-brt{font:600 10px var(--mono);fill:var(--bad);text-anchor:middle}
      ${SC} .doc rect{fill:var(--surface);stroke:var(--ink);stroke-width:1.6}
      ${SC} .doc line{stroke:var(--muted);stroke-width:1.5;stroke-linecap:round}
      ${SC} .doc .mk{fill:none;stroke:var(--bad);stroke-width:1.5}
      ${SC} .dk-tick{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${SC} .dk-note{font:500 9.5px var(--mono);fill:var(--muted)}
      ${SC} .dk-card rect.c{fill:var(--surface);stroke:var(--good);stroke-width:1.6}
      ${SC} .dk-card .t{font:600 12px var(--display);fill:var(--good)}
      ${SC} .dk-card .s{font:500 9px var(--mono);fill:var(--muted)}
      ${SC} .dk-card .sc{font:700 15px var(--display);fill:var(--bad);text-anchor:end}
      ${SC} .dk-arrow{fill:none;stroke:var(--good);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${SC} .dk-check{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
    `,
    text: {
      hu: {
        name: "Dunning–Kruger-hatás", shareTitle: "A Dunning–Kruger-hatás, 30 másodpercben",
        ecline: "Minél kevesebbet tudsz, annál nehezebb ezt észrevenni. Kérj külső visszajelzést.",
        yTitle: "Percentilis", avg: "átlag", xTitle: "Csoportok a valós teszteredmény szerint",
        groups: [["Alsó", "25%"], ["Alsó közép", "rész"], ["Felső közép", "rész"], ["Felső", "25%"]],
        legA: "Valós helyezés", legG: "Ők mit gondoltak",
        tooSure: ["túlságosan magabiztos"], modest: ["kicsit szerény"],
        noSee: "nem lát hibát", see: "észreveszi a hibákat",
        fbT: "Visszajelzés", fbS: "pontozott gyakorlóteszt", score: "6/20",
        caps: [
          "Az emberek megírnak egy tesztet, aztán megbecsülik, hol <b>állnak</b> a többiekhez képest.",
          "Itt látszik, hol <b>ténylegesen</b> végzett az egyes csoport.",
          "És itt, hogy hol <b>gondolták</b>, hogy állnak: mindenki az átlag fölött.",
          "A leggyengébben teljesítők <b>értékelik túl</b> magukat a legjobban.",
          "Egy magyarázat: a hibák felismeréséhez ugyanaz a tudás kell, mint a hibák elkerüléséhez.",
          "A legjobbak kicsit <b>alulértékelik</b> magukat. Azt hiszik, mindenkinek könnyű volt.",
          "<b>A megoldás:</b> hasonlítsd össze magad külső visszajelzéssel.",
          "Vesd össze a pontszámot a becsléseddel, és igazítsd a <b>valósághoz</b>."
        ],
        say: [
          "Az emberek megírnak egy tesztet, aztán megbecsülik, hol állnak a többiekhez képest.",
          "Itt látszik, hol végzett valójában az egyes csoport.",
          "És itt, hogy hol gondolták, hogy állnak. Mindenki az átlag fölött.",
          "A leggyengébben teljesítők értékelik túl magukat a legjobban.",
          "Egy magyarázat: a hibák felismeréséhez ugyanaz a tudás kell, mint a hibák elkerüléséhez.",
          "A legjobbak kicsit alulértékelik magukat. Azt hiszik, mindenkinek könnyű volt.",
          "A megoldás: hasonlítsd össze magad külső visszajelzéssel.",
          "Vesd össze a pontszámot a becsléseddel, és igazítsd a valósághoz.",
          "A Dunning–Kruger-hatás. Minél kevesebbet tudsz, annál nehezebb ezt észrevenni. Kérj külső visszajelzést."
        ]
      },
      en: {
        name: "Dunning-Kruger effect", shareTitle: "The Dunning-Kruger effect, explained in 30 seconds",
        ecline: "The less you know, the harder it is to see it. Get outside feedback.",
        yTitle: "Percentile", avg: "average", xTitle: "Groups by actual test score",
        groups: [["Bottom", "25%"], ["Lower", "middle"], ["Upper", "middle"], ["Top", "25%"]],
        legA: "Actual rank", legG: "Their guess",
        tooSure: ["far too sure"], modest: ["a bit modest"],
        noSee: "sees no mistakes", see: "spots mistakes",
        fbT: "Feedback", fbS: "scored practice test", score: "6/20",
        caps: [
          "People take a test, then guess how they <b>rank</b> against the others.",
          "Here's where each group <b>actually</b> ranked.",
          "And where they <b>thought</b> they ranked: all above average.",
          "The lowest scorers overrate themselves <b>the most</b>.",
          "One explanation: spotting mistakes takes the <b>same skill</b> as avoiding them.",
          "Top scorers slightly <b>underrate</b> themselves. They think it was easy for everyone.",
          "<b>The fix:</b> check yourself against outside feedback.",
          "Compare the score with your guess. Adjust <b>toward reality</b>."
        ],
        say: [
          "People take a test, then guess how they rank against the others.",
          "Here's where each group actually ranked.",
          "And here's where they thought they ranked. All above average.",
          "The lowest scorers overrate themselves the most.",
          "One explanation: spotting mistakes takes the same skill as avoiding them.",
          "Top scorers slightly underrate themselves. They think it was easy for everyone.",
          "The fix: check yourself against outside feedback.",
          "Compare the score with your guess, and adjust toward reality.",
          "The Dunning-Kruger effect. The less you know, the harder it is to see it. Get outside feedback."
        ]
      },
      el: {
        name: "Φαινόμενο Dunning-Kruger", shareTitle: "Το φαινόμενο Dunning-Kruger σε 30 δευτερόλεπτα",
        ecline: "Όσο λιγότερα ξέρεις, τόσο πιο δύσκολα βλέπεις τι σου λείπει. Ζήτα αξιολόγηση από άλλους.",
        yTitle: "Εκατοστημόριο", avg: "μέσος όρος", xTitle: "Ομάδες με βάση την πραγματική βαθμολογία",
        groups: [["Χαμηλότερο", "25%"], ["Κάτω από", "τη μέση"], ["Πάνω από", "τη μέση"], ["Υψηλότερο", "25%"]],
        legA: "Πραγματική θέση", legG: "Η εκτίμησή τους",
        tooSure: ["υπερβολικά", "σίγουροι"], modest: ["λίγο σεμνοί"],
        noSee: "δεν βλέπει λάθη", see: "βλέπει τα λάθη",
        fbT: "Αξιολόγηση", fbS: "διαγώνισμα με βαθμό", score: "6/20",
        caps: [
          "Κάποιοι γράφουν ένα τεστ και μαντεύουν σε ποια <b>θέση</b> βγήκαν.",
          "Να πού βγήκε <b>στην πραγματικότητα</b> κάθε ομάδα.",
          "Και πού <b>νόμιζαν</b> ότι βγήκαν: όλοι πάνω από τον μέσο όρο.",
          "Οι πιο αδύναμοι υπερεκτιμούν τον εαυτό τους <b>πιο πολύ απ’ όλους</b>.",
          "Μια εξήγηση: όποιος δεν ξέρει να αποφεύγει τα λάθη, <b>ούτε καν τα βλέπει</b>.",
          "Οι πιο δυνατοί <b>υποτιμούν</b> λίγο τον εαυτό τους. Νομίζουν ότι ήταν εύκολο για όλους.",
          "<b>Η λύση:</b> μην αρκείσαι στη δική σου κρίση. Ζήτα αξιολόγηση από άλλους.",
          "Σύγκρινε τον βαθμό με την εκτίμησή σου. Φέρ’ την <b>πιο κοντά στην αλήθεια</b>."
        ],
        say: [
          "Κάποιοι γράφουν ένα τεστ και μαντεύουν σε ποια θέση βγήκαν.",
          "Να πού βγήκε στην πραγματικότητα κάθε ομάδα.",
          "Και να πού νόμιζαν ότι βγήκαν. Όλοι πάνω από τον μέσο όρο.",
          "Οι πιο αδύναμοι υπερεκτιμούν τον εαυτό τους πιο πολύ απ’ όλους.",
          "Μια εξήγηση: όποιος δεν ξέρει να αποφεύγει τα λάθη, ούτε καν τα βλέπει.",
          "Οι πιο δυνατοί υποτιμούν λίγο τον εαυτό τους. Νομίζουν ότι ήταν εύκολο για όλους.",
          "Η λύση: μην αρκείσαι στη δική σου κρίση. Ζήτα αξιολόγηση από άλλους.",
          "Σύγκρινε τον βαθμό με την εκτίμησή σου, και φέρ' την πιο κοντά στην αλήθεια.",
          "Φαινόμενο Dunning-Kruger. Όσο λιγότερα ξέρεις, τόσο πιο δύσκολα βλέπεις τι σου λείπει. Ζήτα αξιολόγηση από άλλους."
        ]
      },
      es: {
        name: "Efecto Dunning-Kruger", shareTitle: "El efecto Dunning-Kruger en 30 segundos",
        ecline: "Cuanto menos sabes, más te cuesta verlo. Busca una evaluación externa.",
        yTitle: "Percentil", avg: "media", xTitle: "Grupos según su nota real",
        groups: [["25%", "inferior"], ["Medio", "bajo"], ["Medio", "alto"], ["25%", "superior"]],
        legA: "Posición real", legG: "Su estimación",
        tooSure: ["demasiado", "seguros"], modest: ["algo modestos"],
        noSee: "no ve errores", see: "ve los errores",
        fbT: "Evaluación", fbS: "simulacro corregido", score: "6/20",
        caps: [
          "Un grupo de personas hace un examen y luego calcula su <b>posición</b> frente a los demás.",
          "Aquí está la posición <b>real</b> de cada grupo.",
          "Y aquí, la que <b>creían</b> tener: todas por encima de la media.",
          "Los que peor puntúan son los que <b>más</b> se sobrevaloran.",
          "Una explicación: ver los errores exige <b>la misma habilidad</b> que evitarlos.",
          "Los mejores se <b>infravaloran</b> un poco. Creen que fue fácil para todos.",
          "<b>La solución:</b> contrasta tu idea con una evaluación externa.",
          "Compara la nota con tu estimación. Ajústala <b>hacia la realidad</b>."
        ],
        say: [
          "Un grupo de personas hace un examen, y luego calcula su posición frente a los demás.",
          "Aquí está la posición real de cada grupo.",
          "Y aquí, la que creían tener. Todas por encima de la media.",
          "Los que peor puntúan son los que más se sobrevaloran.",
          "Una explicación: ver los errores exige la misma habilidad que evitarlos.",
          "Los mejores se infravaloran un poco. Creen que fue fácil para todos.",
          "La solución: contrasta tu idea con una evaluación externa.",
          "Compara la nota con tu estimación, y ajústala hacia la realidad.",
          "El efecto Dunning-Kruger. Cuanto menos sabes, más te cuesta verlo. Busca una evaluación externa."
        ]
      },
      fr: {
        name: "Effet Dunning-Kruger", shareTitle: "L’effet Dunning-Kruger en 30 secondes",
        ecline: "Moins on en sait, moins on s’en rend compte. Demandez un avis extérieur.",
        yTitle: "Centile", avg: "moyenne", xTitle: "Groupes par note réelle",
        groups: [["Quart", "inférieur"], ["Milieu", "bas"], ["Milieu", "haut"], ["Quart", "supérieur"]],
        legA: "Rang réel", legG: "Leur estimation",
        tooSure: ["bien trop", "sûrs d’eux"], modest: ["un peu", "modestes"],
        noSee: "ne voit aucune erreur", see: "repère les erreurs",
        fbT: "Évaluation", fbS: "test blanc corrigé", score: "6/20",
        caps: [
          "Des gens passent un test, puis estiment leur <b>rang</b> par rapport aux autres.",
          "Voici le rang <b>réel</b> de chaque groupe.",
          "Et le rang qu’ils <b>croyaient</b> avoir : tous au-dessus de la moyenne.",
          "Les moins bons se surestiment <b>le plus</b>.",
          "Une explication : repérer ses erreurs exige <b>la même compétence</b> que les éviter.",
          "Les meilleurs se <b>sous-estiment</b> un peu. Ils croient que c’était facile pour tous.",
          "<b>La solution :</b> confrontez-vous à un avis extérieur.",
          "Comparez la note à votre estimation. Ajustez <b>vers la réalité</b>."
        ],
        say: [
          "Des gens passent un test, puis estiment leur rang par rapport aux autres.",
          "Voici le rang réel de chaque groupe.",
          "Et voici le rang qu’ils croyaient avoir. Tous au-dessus de la moyenne.",
          "Les moins bons sont ceux qui se surestiment le plus.",
          "Une explication : repérer ses erreurs exige la même compétence que les éviter.",
          "Les meilleurs se sous-estiment un peu. Ils croient que c’était facile pour tout le monde.",
          "La solution : confrontez-vous à un avis extérieur.",
          "Comparez la note à votre estimation, et ajustez vers la réalité.",
          "L’effet Dunning-Kruger. Moins on en sait, moins on s’en rend compte. Demandez un avis extérieur."
        ]
      },
      de: {
        name: "Dunning-Kruger-Effekt", shareTitle: "Der Dunning-Kruger-Effekt in 30 Sekunden",
        ecline: "Je weniger du weißt, desto schwerer merkst du es. Hol dir Feedback von außen.",
        yTitle: "Perzentil", avg: "Schnitt", xTitle: "Gruppen nach echtem Testergebnis",
        groups: [["Unterste", "25 %"], ["Untere", "Mitte"], ["Obere", "Mitte"], ["Oberste", "25 %"]],
        legA: "Echter Rang", legG: "Geschätzter Rang",
        tooSure: ["viel zu sicher"], modest: ["etwas zu", "bescheiden"],
        noSee: "sieht keine Fehler", see: "findet Fehler",
        fbT: "Feedback", fbS: "bewerteter Probetest", score: "6/20",
        caps: [
          "Menschen machen einen Test und schätzen dann ihren <b>Rang</b> im Vergleich zu den anderen.",
          "Hier siehst du, wo jede Gruppe <b>tatsächlich</b> lag.",
          "Und wo sie sich <b>gesehen haben</b>: alle über dem Durchschnitt.",
          "Die Schwächsten überschätzen sich <b>am meisten</b>.",
          "Eine Erklärung: Fehler zu erkennen braucht <b>dieselbe Fähigkeit</b> wie sie zu vermeiden.",
          "Die Besten <b>unterschätzen</b> sich etwas. Sie glauben, es war für alle einfach.",
          "<b>Die Lösung:</b> Prüf dich an Feedback von außen.",
          "Vergleiche das Ergebnis mit deiner Schätzung. Korrigiere <b>Richtung Realität</b>."
        ],
        say: [
          "Menschen machen einen Test und schätzen dann ihren Rang im Vergleich zu den anderen.",
          "Hier siehst du, wo jede Gruppe tatsächlich lag.",
          "Und hier, wo sie sich gesehen haben. Alle über dem Durchschnitt.",
          "Die Schwächsten überschätzen sich am meisten.",
          "Eine Erklärung: Fehler zu erkennen braucht dieselbe Fähigkeit wie sie zu vermeiden.",
          "Die Besten unterschätzen sich etwas. Sie glauben, es war für alle einfach.",
          "Die Lösung: Prüf dich an Feedback von außen.",
          "Vergleiche das Ergebnis mit deiner Schätzung, und korrigiere Richtung Realität.",
          "Der Dunning-Kruger-Effekt. Je weniger du weißt, desto schwerer merkst du es. Hol dir Feedback von außen."
        ]
      },
      it: {
        name: "Effetto Dunning-Kruger", shareTitle: "L’effetto Dunning-Kruger in 30 secondi",
        ecline: "Meno sai, più è difficile accorgertene. Chiedi un parere esterno.",
        yTitle: "Percentile", avg: "media", xTitle: "Gruppi per punteggio reale",
        groups: [["25%", "inferiore"], ["Medio", "basso"], ["Medio", "alto"], ["25%", "superiore"]],
        legA: "Posizione reale", legG: "La loro stima",
        tooSure: ["troppa", "sicurezza"], modest: ["un po’", "modesti"],
        noSee: "non vede errori", see: "nota gli errori",
        fbT: "Valutazione", fbS: "simulazione corretta", score: "6/20",
        caps: [
          "Alcune persone fanno un test, poi stimano la loro <b>posizione</b> rispetto agli altri.",
          "Ecco dove si è <b>davvero</b> classificato ogni gruppo.",
          "E dove <b>pensavano</b> di essere: tutti sopra la media.",
          "Chi ha i punteggi più bassi si sopravvaluta <b>più di tutti</b>.",
          "Una spiegazione: per vedere gli errori serve la <b>stessa abilità</b> che serve a evitarli.",
          "I migliori si <b>sottovalutano</b> un po’. Pensano che sia stato facile per tutti.",
          "<b>La soluzione:</b> confrontati con un parere esterno.",
          "Confronta il punteggio con la tua stima. Correggiti <b>verso la realtà</b>."
        ],
        say: [
          "Alcune persone fanno un test, poi stimano la loro posizione rispetto agli altri.",
          "Ecco dove si è davvero classificato ogni gruppo.",
          "Ed ecco dove pensavano di essere. Tutti sopra la media.",
          "Chi ha i punteggi più bassi si sopravvaluta più di tutti.",
          "Una spiegazione: per vedere gli errori serve la stessa abilità che serve a evitarli.",
          "I migliori si sottovalutano un po’. Pensano che sia stato facile per tutti.",
          "La soluzione: confrontati con un parere esterno.",
          "Confronta il punteggio con la tua stima, e correggiti verso la realtà.",
          "L’effetto Dunning-Kruger. Meno sai, più è difficile accorgertene. Chiedi un parere esterno."
        ]
      }
    },
    svg(T) {
      // axes, average line and group labels
      let ax = `<line class="ax" x1="${AX}" y1="${TOP - 4}" x2="${AX}" y2="${B}"/><line class="ax" x1="${AX}" y1="${B}" x2="${RX}" y2="${B}"/>`;
      for (const p of [0, 50, 100]) ax += `<line class="tick" x1="${AX - 4}" y1="${Y(p)}" x2="${AX}" y2="${Y(p)}"/><text class="dk-yl" x="${AX - 8}" y="${Y(p) + 3.5}">${p}</text>`;
      ax += `<text class="dk-yt" transform="translate(19 ${(Y(100) + Y(50)) / 2}) rotate(-90)">${T.yTitle}</text>`;
      ax += `<line class="dk-avg" x1="${AX}" y1="${Y(50)}" x2="${RX}" y2="${Y(50)}"/><text class="dk-avgt" x="${AX - 8}" y="${Y(50) + 14}">${T.avg}</text>`;
      const avgHi = `<g data-k="avgHi"><line class="dk-avg hi" x1="${AX}" y1="${Y(50)}" x2="${RX}" y2="${Y(50)}"/><text class="dk-avgt hi" x="${AX - 8}" y="${Y(50) + 14}">${T.avg}</text></g>`;
      T.groups.forEach((g, i) => { ax += `<text class="dk-gl">${lines(g, C(i), B + 15, 11)}</text>`; });
      ax += `<text class="dk-xt" x="${(AX + RX) / 2}" y="${B + 45}">${T.xTitle}</text>`;
      // people waiting for their result
      let people = "";
      for (let i = 0; i < 4; i++) {
        for (const dx of [-15, 0, 15]) {
          const x = C(i) + dx;
          people += `<g class="dk-man"><circle cx="${x}" cy="${B - 20}" r="4.2"/><path d="M${x - 6.5} ${B - 1} V${B - 7} a6.5 6 0 0 1 13 0 V${B - 1}"/></g>`;
        }
        people += `<text class="dk-qm" data-k="qm${i}" x="${C(i)}" y="${B - 31}">?</text>`;
      }
      // bars
      let bars = "";
      for (let i = 0; i < 4; i++) bars += `<rect class="dk-act" data-k="a${i}" x="${AXl(i)}" width="${W}" rx="2"/>`;
      bars += `<rect class="dk-old" data-k="old0" x="${GXl(0)}" y="${Y(GUESS[0])}" width="${W}" height="${B - Y(GUESS[0])}" rx="2"/>`;
      for (let i = 0; i < 4; i++) bars += `<rect class="dk-gs" data-k="g${i}" x="${GXl(i)}" width="${W}" rx="2"/>`;
      bars += `<rect class="dk-ok" data-k="ok0" x="${GXl(0)}" width="${W}" rx="2"/>`;
      // legend, top left of the plot, one row each so long Greek labels fit
      const legend = `<g data-k="legA"><rect class="dk-act" x="${AX + 8}" y="10" width="10" height="10" rx="2"/><text class="dk-leg" x="${AX + 24}" y="19">${T.legA}</text></g>
        <g data-k="legG"><rect class="dk-gs" x="${AX + 9}" y="25" width="8" height="8" rx="1.5"/><text class="dk-leg" x="${AX + 24}" y="33">${T.legG}</text></g>`;
      // gap brackets
      const br = `<g data-k="br0"><path class="dk-guide" data-k="br0g"/><path class="dk-br" data-k="br0p"/></g>
        <text class="dk-brt" data-k="br0t">${lines(T.tooSure, C(0), Y(GUESS[0]) - 8 - (T.tooSure.length - 1) * 11, 11)}</text>
        <g data-k="br3"><path class="dk-guide" d="M${AXl(3) + W} ${Y(ACT[3])} H${C(3) + 13}"/><path class="dk-br" d="M${C(3) + 13} ${Y(ACT[3]) + 1} V${Y(GUESS[3]) - 1} M${C(3) + 9} ${Y(ACT[3]) + 1} H${C(3) + 17}"/></g>
        <text class="dk-brt" data-k="br3t">${lines(T.modest, C(3) - 5, Y(ACT[3]) - 8 - (T.modest.length - 1) * 11, 11)}</text>`;
      // step 5: the same test, seen by each group
      const d0x = C(0) - 13, d0y = 44, d3x = C(3) - 13, d3y = 22;
      const docs = `<g data-k="doc0">${doc(d0x, d0y, false)}<path class="dk-tick" d="M${d0x + 30} ${d0y + 18} l4 4 l8 -9"/><text class="dk-note" x="${d0x + 48}" y="${d0y + 21}">${T.noSee}</text></g>
        <g data-k="doc3">${doc(d3x, d3y, true)}<text class="dk-note" x="${d3x - 6}" y="${d3y + 20}" text-anchor="end">${T.see}</text></g>`;
      // step 7: outside feedback card
      const card = `<g class="dk-card" data-k="fb"><rect class="c" x="0" y="0" width="${FBW}" height="48" rx="8"/>
          ${doc(10, 7, true)}<text class="t" x="46" y="21">${T.fbT}</text><text class="s" x="46" y="35">${T.fbS}</text>
          <text class="sc" x="${FBW - 10}" y="30">${T.score}</text></g>`;
      const fix = `<path class="dk-arrow" data-k="down" d=""/><path class="dk-check" data-k="check" d=""/>`;
      return `<g data-k="axes">${ax}</g>${avgHi}<g data-k="people">${people}</g>${bars}${legend}${br}${docs}${card}${fix}`;
    },
    S0: { axes: 0, people: 0, qm: 0, act: 0, legA: 0, gs: 0, legG: 0, avgHi: 0, br0: 0, br0t: 0,
      doc0: 0, doc3: 0, br3: 0, fb: 0, fbX: 16, g0: GUESS[0], old: 0, fix: 0, down: 0, check: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = v; };
      op("axes", S.axes); op("people", S.people);
      for (let i = 0; i < 4; i++) op("qm" + i, S.qm);
      const bar = (el, v) => { const h = Math.max(0, B - Y(v)); el.setAttribute("y", B - h); el.setAttribute("height", h); el.style.opacity = h > .5 ? 1 : 0; };
      for (let i = 0; i < 4; i++) {
        bar(k("a" + i), ACT[i] * stag(S.act, i));
        const gv = (i === 0 ? S.g0 : GUESS[i]) * stag(S.gs, i);
        bar(k("g" + i), gv);
      }
      bar(k("ok0"), S.g0 * stag(S.gs, 0));
      k("ok0").style.opacity = S.fix;
      k("g0").style.opacity = 1 - S.fix;
      op("old0", S.old);
      op("legA", S.legA); op("legG", S.legG); op("avgHi", S.avgHi);
      // bracket on the bottom group: from the actual bar's top up to the guess level
      const ya = Y(ACT[0]), yg = Y(S.g0), bx = C(0) - 13;
      k("br0g").setAttribute("d", `M${GXl(0)} ${yg} H${bx}`);
      k("br0p").setAttribute("d", `M${bx} ${ya - 1} V${yg + 1} M${bx - 4} ${ya - 1} H${bx + 4} M${bx - 4} ${yg + 1} H${bx + 4}`);
      op("br0", S.br0); op("br0t", S.br0t);
      op("doc0", S.doc0); op("doc3", S.doc3);
      op("br3", S.br3); op("br3t", S.br3);
      k("fb").setAttribute("transform", `translate(${FBX + S.fbX} ${FBY})`);
      op("fb", S.fb);
      // step 8: the feedback pushes the guess down (arrow from the card), a check beside the new bar
      const x0 = GXl(0) + W / 2, top = FBY + 52, bot = Y(S.g0) - 5;
      k("down").setAttribute("d", `M${x0} ${top} V${bot} M${x0 - 4} ${bot - 4} L${x0} ${bot} L${x0 + 4} ${bot - 4}`);
      op("down", S.down);
      const cx = GXl(0) + W + 6, cy = Y(FIXED) - 2;
      k("check").setAttribute("d", `M${cx} ${cy} l3.5 3.5 l7 -8`);
      op("check", S.check);
    },
    beats: [
      { steps: [{ to: { axes: 1 }, ms: 500 }, { to: { people: 1 }, ms: 500, sfx: "pluck" }, { wait: 250 }, { to: { qm: 1 }, ms: 350 }] },
      { steps: [{ to: { people: 0, qm: 0 }, ms: 300 }, { to: { act: 1, legA: 1 }, ms: 1300, ease: "lin", sfx: "whoosh" }] },
      { steps: [{ to: { gs: 1, legG: 1 }, ms: 1300, ease: "lin", sfx: "whoosh" }, { to: { avgHi: 1 }, ms: 400 }] },
      { steps: [{ to: { avgHi: 0 }, ms: 300 }, { to: { br0: 1 }, ms: 450, sfx: "tick" }, { to: { br0t: 1 }, ms: 350 }] },
      { steps: [{ to: { doc0: 1 }, ms: 450, sfx: "pop" }, { wait: 500 }, { to: { doc3: 1 }, ms: 450, sfx: "pop" }], hold: 3000 },
      { steps: [{ to: { doc0: 0, doc3: 0 }, ms: 400 }, { to: { br3: 1 }, ms: 450, sfx: "tick" }], hold: 3000 },
      { steps: [{ to: { br3: 0, br0t: 0 }, ms: 400 }, { to: { fb: 1, fbX: 0 }, ms: 600, sfx: "scribble" }] },
      { steps: [{ to: { old: .7 } }, { to: { g0: FIXED, fix: 1, down: 1 }, ms: 1100, ease: "inOut" }, { to: { br0: 0 }, ms: 300 }, { to: { check: 1 }, ms: 300, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
