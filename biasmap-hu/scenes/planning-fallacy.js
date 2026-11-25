/* Planning fallacy: a report pictured as three smooth days, real life landing on the calendar,
   seven days in the end, and a track record that said so all along. Scene for anim.js. */
(function () {
  const KEY = "planning-fallacy", P = `.bp[data-scene="${KEY}"]`;
  const X0 = 24, CW = 34, GAP = 12;                    // calendar: Mon..Fri, weekend gap, Mon..Fri
  const CT = 96, CB = 152;                             // day columns, top and bottom
  const BY = 122, BH = 20;                             // the task bar
  const TY = 100;                                      // snag tags, top
  const DY = 158;                                      // deadline flag, top
  const PLAN = 3, REAL = 7, NEW = 7, BUF = 1;          // days
  const PAST = [[3, 7], [2, 6], [3, 8]];               // earlier reports: planned, took
  const RY = [184, 198, 212], RH = 10, PT = 238;       // their rows, and the label under them
  const f1 = n => +n.toFixed(1);
  const clamp = v => Math.max(0, Math.min(1, v));
  const xd = d => X0 + d * CW + (d > 5 ? GAP : 0);    // end of day d (d = 5 is Friday evening)
  const col = i => X0 + i * CW + (i >= 5 ? GAP : 0);   // left edge of day column i
  // a stretch of days [a, b] as up to two pieces, split at the weekend
  const segs = (a, b) => {
    const out = [];
    if (b <= a) return out;
    if (a < 5) out.push([X0 + a * CW, X0 + Math.min(b, 5) * CW]);
    if (b > 5) out.push([X0 + Math.max(a, 5) * CW + GAP, X0 + b * CW + GAP]);
    return out;
  };
  const DUE0 = xd(PLAN), DUE1 = xd(NEW + BUF), OVX = xd(REAL);
  const SNAG = [1, 4, 6];                               // Tue, Fri, next Tue
  const LX = col(1) + CW / 2;                           // the "ignored" link from your track record
  const bar = (key, cls, y, h, r) => `<rect class="pf-bar ${cls}" data-k="${key}0" y="${y}" height="${h}" rx="${r}"/><rect class="pf-bar ${cls}" data-k="${key}1" y="${y}" height="${h}" rx="${r}"/>`;

  window.BiasAnim.SCENES[KEY] = {
    q: "nem", viewBox: "0 0 400 272",
    css: `
      ${P} .pf-col{fill:none;stroke:var(--rule);stroke-width:1.2}
      ${P} .pf-day{font:500 9px var(--mono);fill:var(--muted);text-anchor:middle;letter-spacing:.06em}
      ${P} .pf-bar.q{fill:var(--q)}
      ${P} .pf-bar.b{fill:var(--bad)}
      ${P} .pf-bar.g{fill:var(--good)}
      ${P} .pf-in{font:600 10px var(--display);fill:var(--ground)}
      ${P} .pf-in.c{text-anchor:middle}
      ${P} .pf-dur{font:600 11px var(--display);fill:var(--bad)}
      ${P} .pf-buf{fill:none;stroke:var(--good);stroke-width:1.8;stroke-dasharray:3 3}
      ${P} .pf-bufl{font:600 10px var(--mono);fill:var(--good)}
      ${P} .pf-tag rect{fill:var(--surface);stroke:var(--bad);stroke-width:1.6}
      ${P} .pf-tag text{font:600 10px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .pf-due line{stroke:var(--ink);stroke-width:1.6;stroke-dasharray:3 3;stroke-linecap:round}
      ${P} .pf-due rect{fill:var(--surface);stroke:var(--ink);stroke-width:1.4}
      ${P} .pf-due text{font:500 9.5px var(--mono);fill:var(--ink)}
      ${P} .pf-due.m line{stroke:var(--bad)}
      ${P} .pf-due.m rect{stroke:var(--bad)}
      ${P} .pf-due.m text{fill:var(--bad)}
      ${P} .pf-bub{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .pf-cell rect{fill:var(--q)}
      ${P} .pf-cell path{fill:none;stroke:var(--ground);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .pf-qm{font:700 22px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .pf-three{font:700 15px var(--display);fill:var(--ink)}
      ${P} .pf-best rect{fill:none;stroke:var(--q);stroke-width:1.4}
      ${P} .pf-best text{font:600 10px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .pf-man circle,${P} .pf-man path{fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .pf-doc .pa{fill:var(--surface);stroke:var(--ink);stroke-width:1.8;stroke-linejoin:round}
      ${P} .pf-doc .ln{fill:none;stroke:var(--muted);stroke-width:1.6;stroke-linecap:round}
      ${P} .pf-lab{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .pf-lab.c{text-anchor:middle}
      ${P} .pf-beam{fill:var(--q);fill-opacity:.1}
      ${P} .pf-beam-e{fill:none;stroke:var(--q);stroke-width:1.6;stroke-dasharray:2 4;stroke-linecap:round}
      ${P} .pf-ign line{stroke:var(--muted);stroke-width:1.6;stroke-dasharray:3 3;stroke-linecap:round}
      ${P} .pf-ign path{fill:none;stroke:var(--muted);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .pf-ign .x{stroke:var(--bad);stroke-width:2.4}
      ${P} .pf-ign text{font:600 9.5px var(--mono);fill:var(--bad)}
      ${P} .pf-ov{stroke:var(--q);stroke-width:2;stroke-dasharray:4 3;stroke-linecap:round}
      ${P} .pf-ovl{font:600 10px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .pf-chk circle{fill:var(--surface);stroke:var(--good);stroke-width:2}
      ${P} .pf-chk path{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
    `,
    text: {
      hu: {
        name: "A tervezési tévedés", shareTitle: "A tervezési tévedés, 30 másodpercben",
        ecline: "A terveid a legjobb esetet képzelik el. Tervezz abból, mennyi idő ment korábban valójában.",
        days: ["H", "K", "SZE", "CS", "P"], report: "Jelentés", three: "3 nap",
        plan: "A terved", newPlan: "Új terv", dur: n => `${n} nap`, over: "+4 nap",
        due: "határidő", dueW: 58, snags: ["megbeszélés", "visszajelzés", "betegnap"], snagW: [54, 58, 56],
        past: "Az utolsó jelentéseid", best: "legjobb eset", bestW: 60, ign: "figyelmen kívül hagyva",
        ov: "külső nézet", ovn: "általában 7 nap", buffer: "+ tartalék",
        caps: [
          "Meg kell írnod egy jelentést. Mennyi időbe telik?",
          "Simán elképzeled: <b>3 nap</b>.",
          "Aztán a <b>valóság</b> közbeszól, egyesével a gondok.",
          "<b>7 napba</b> telik, több mint a duplája.",
          "Az utolsó jelentéseid? <b>Mindegyik</b> túllépte az időt.",
          "De te a <b>legjobb esetből</b> terveztél, nem ebből a történetből.",
          "<b>A megoldás:</b> kérdezd meg, mennyi idő ment el valójában hasonló feladatokra.",
          "Ebből tervezz, aztán adj hozzá tartalékot. <b>Időben kész leszel.</b>"
        ],
        say: [
          "Meg kell írnod egy jelentést. Mennyi időbe telik?",
          "Simán elképzeled. Három nap.",
          "Aztán a valóság közbeszól, egyesével a gondok.",
          "Hét napba telik. Több mint a duplája.",
          "Az utolsó jelentéseid? Mindegyik túllépte az időt.",
          "De te a legjobb esetből terveztél, nem ebből a történetből.",
          "A megoldás: kérdezd meg, mennyi idő ment el valójában hasonló feladatokra.",
          "Ebből tervezz, aztán adj hozzá tartalékot. Időben kész leszel.",
          "A tervezési tévedés. A terveid a legjobb esetet képzelik el. Tervezz abból, mennyi idő ment korábban valójában."
        ]
      },
      en: {
        name: "Planning fallacy", shareTitle: "Planning fallacy, explained in 30 seconds",
        ecline: "Your plans picture the best case. Plan from how long it really took before.",
        days: ["MON", "TUE", "WED", "THU", "FRI"], report: "Report", three: "3 days",
        plan: "Your plan", newPlan: "New plan", dur: n => `${n} days`, over: "+4 days",
        due: "deadline", dueW: 58, snags: ["meeting", "feedback", "sick day"], snagW: [54, 58, 56],
        past: "Your last reports", best: "best case", bestW: 60, ign: "ignored",
        ov: "outside view", ovn: "usually 7 days", buffer: "+ buffer",
        caps: [
          "You have a report to write. How long will it take?",
          "You picture it going smoothly: <b>3 days</b>.",
          "Then <b>real life</b> shows up, one snag at a time.",
          "It takes <b>7 days</b>, more than double.",
          "Your last reports? <b>Every one</b> overran too.",
          "But you planned from the <b>best case</b>, not from that history.",
          "<b>The fix:</b> ask how long similar tasks really took.",
          "Plan from that, then add a buffer. <b>You finish on time.</b>"
        ],
        say: [
          "You have a report to write. How long will it take?",
          "You picture it going smoothly. Three days.",
          "Then real life shows up, one snag at a time.",
          "It takes seven days. More than double.",
          "Your last reports? Every one of them overran too.",
          "But you planned from the best case, not from that history.",
          "The fix: ask how long similar tasks really took.",
          "Plan from that, then add a buffer. You finish on time.",
          "The planning fallacy. Your plans picture the best case. Plan from how long it really took before."
        ]
      },
      el: {
        name: "Πλάνη του σχεδιασμού", shareTitle: "Η πλάνη του σχεδιασμού σε 30 δευτερόλεπτα",
        ecline: "Όταν σχεδιάζεις, φαντάζεσαι το καλύτερο σενάριο. Υπολόγιζε με βάση το πόσο σου πήρε στ’\u00a0αλήθεια τις άλλες φορές.",
        days: ["ΔΕΥ", "ΤΡΙ", "ΤΕΤ", "ΠΕΜ", "ΠΑΡ"], report: "Αναφορά", three: "3 μέρες",
        plan: "Το πλάνο σου", newPlan: "Νέο πλάνο", dur: n => `${n} μέρες`, over: "+4 μέρες",
        due: "προθεσμία", dueW: 64, snags: ["σύσκεψη", "διορθώσεις", "ίωση"], snagW: [54, 68, 40],
        past: "Οι προηγούμενες αναφορές σου", best: "καλύτερο σενάριο", bestW: 96, ign: "το αγνόησες",
        ov: "ματιά απ’ έξω", ovn: "συνήθως 7 μέρες", buffer: "+ περιθώριο",
        caps: [
          "Έχεις να γράψεις μια αναφορά. Πόσο θα σου πάρει;",
          "Φαντάζεσαι ότι όλα θα πάνε ρολόι: <b>3 μέρες</b>.",
          "Και τότε αρχίζουν τα <b>απρόοπτα</b>, το ένα μετά το άλλο.",
          "Τελικά σου παίρνει <b>7 μέρες</b>, πάνω από το διπλάσιο.",
          "Οι προηγούμενες αναφορές σου; <b>Όλες</b> καθυστέρησαν κι αυτές.",
          "Όμως υπολόγισες με βάση το <b>καλύτερο σενάριο</b>, όχι το ιστορικό σου.",
          "<b>Η λύση:</b> δες πόσο κράτησαν στην πράξη παρόμοιες δουλειές.",
          "Υπολόγισε με βάση αυτό, βάλε κι ένα περιθώριο. <b>Τελειώνεις στην ώρα σου.</b>"
        ],
        say: [
          "Έχεις να γράψεις μια αναφορά. Πόσο θα σου πάρει;",
          "Φαντάζεσαι ότι όλα θα πάνε ρολόι. Τρεις μέρες.",
          "Και τότε αρχίζουν τα απρόοπτα, το ένα μετά το άλλο.",
          "Τελικά σου παίρνει επτά μέρες. Πάνω από το διπλάσιο.",
          "Οι προηγούμενες αναφορές σου; Όλες καθυστέρησαν κι αυτές.",
          "Όμως υπολόγισες με βάση το καλύτερο σενάριο, όχι το ιστορικό σου.",
          "Η λύση: δες πόσο κράτησαν στην πράξη παρόμοιες δουλειές.",
          "Υπολόγισε με βάση αυτό, βάλε κι ένα περιθώριο. Τελειώνεις στην ώρα σου.",
          "Πλάνη του σχεδιασμού. Όταν σχεδιάζεις, φαντάζεσαι το καλύτερο σενάριο. Υπολόγιζε με βάση το πόσο σου πήρε στ’ αλήθεια τις άλλες φορές."
        ]
      },
      es: {
        name: "Falacia de la planificación", shareTitle: "La falacia de la planificación en 30 segundos",
        ecline: "Tus planes imaginan el mejor caso. Planifica según lo que de verdad tardaste antes.",
        days: ["LUN", "MAR", "MIÉ", "JUE", "VIE"], report: "Informe", three: "3 días",
        plan: "Tu plan", newPlan: "Nuevo plan", dur: n => (n === 1 ? "1 día" : `${n} días`), over: "+4 días",
        due: "plazo", dueW: 58, snags: ["reunión", "revisión", "gripe"], snagW: [54, 58, 56],
        past: "Tus informes anteriores", best: "mejor caso", bestW: 67, ign: "ignorado",
        ov: "visión externa", ovn: "lo normal: 7 días", buffer: "+ margen",
        caps: [
          "Tienes que escribir un informe. ¿Cuánto vas a tardar?",
          "Te lo imaginas sin contratiempos: <b>3 días</b>.",
          "Entonces aparece <b>la vida real</b>, un imprevisto tras otro.",
          "Tardas <b>7 días</b>, más del doble.",
          "¿Tus informes anteriores? <b>Todos</b> se alargaron también.",
          "Pero planeaste según el <b>mejor caso</b>, no según ese historial.",
          "<b>La solución:</b> pregúntate cuánto tardaron de verdad tareas parecidas.",
          "Planifica según eso y añade un margen. <b>Terminas a tiempo.</b>"
        ],
        say: [
          "Tienes que escribir un informe. ¿Cuánto vas a tardar?",
          "Te lo imaginas sin contratiempos. Tres días.",
          "Entonces aparece la vida real, un imprevisto tras otro.",
          "Tardas siete días. Más del doble.",
          "¿Tus informes anteriores? Todos se alargaron también.",
          "Pero planeaste según el mejor caso, no según ese historial.",
          "La solución: pregúntate cuánto tardaron de verdad tareas parecidas.",
          "Planifica según eso y añade un margen. Terminas a tiempo.",
          "La falacia de la planificación. Tus planes imaginan el mejor caso. Planifica según lo que de verdad tardaste antes."
        ]
      },
      fr: {
        name: "Erreur de planification", shareTitle: "L’erreur de planification en 30 secondes",
        ecline: "Vos plans imaginent le meilleur cas. Planifiez d’après le temps que ça vous a vraiment pris avant.",
        days: ["LUN", "MAR", "MER", "JEU", "VEN"], report: "Rapport", three: "3 jours",
        plan: "Votre plan", newPlan: "Nouveau plan", dur: n => (n > 1 ? `${n} jours` : `${n} jour`), over: "+4 jours",
        due: "échéance", dueW: 58, snags: ["réunion", "retours", "malade"], snagW: [54, 58, 56],
        past: "Vos derniers rapports", best: "meilleur cas", bestW: 76, ign: "ignoré",
        ov: "vision externe", ovn: "en général 7 jours", buffer: "+ marge",
        caps: [
          "Vous avez un rapport à écrire. Combien de temps ça va prendre ?",
          "Vous l’imaginez sans accroc : <b>3 jours</b>.",
          "Puis <b>la vraie vie</b> s’en mêle, un imprévu après l’autre.",
          "Il vous faut <b>7 jours</b>, plus du double.",
          "Vos derniers rapports ? <b>Tous</b> ont dépassé aussi.",
          "Mais vous avez planifié sur le <b>meilleur cas</b>, pas sur cet historique.",
          "<b>La solution :</b> demandez-vous combien de temps des tâches similaires ont vraiment pris.",
          "Planifiez à partir de ça, puis ajoutez une marge. <b>Vous finissez à temps.</b>"
        ],
        say: [
          "Vous avez un rapport à écrire. Combien de temps ça va prendre ?",
          "Vous l’imaginez sans accroc. Trois jours.",
          "Puis la vraie vie s’en mêle, un imprévu après l’autre.",
          "Il vous faut sept jours. Plus du double.",
          "Vos derniers rapports ? Tous ont dépassé aussi.",
          "Mais vous avez planifié sur le meilleur cas, pas sur cet historique.",
          "La solution : demandez-vous combien de temps des tâches similaires ont vraiment pris.",
          "Planifiez à partir de ça, puis ajoutez une marge. Vous finissez à temps.",
          "L’erreur de planification. Vos plans imaginent le meilleur cas. Planifiez d’après le temps que ça vous a vraiment pris avant."
        ]
      },
      de: {
        name: "Planungsfehlschluss", shareTitle: "Der Planungsfehlschluss in 30 Sekunden",
        ecline: "Deine Pläne malen den Idealfall aus. Plane damit, wie lange es früher wirklich gedauert hat.",
        days: ["MO", "DI", "MI", "DO", "FR"], report: "Bericht", three: "3 Tage",
        plan: "Dein Plan", newPlan: "Neuer Plan", dur: n => (n === 1 ? "1 Tag" : `${n} Tage`), over: "+4 Tage",
        due: "Frist", dueW: 58, snags: ["Meeting", "Feedback", "krank"], snagW: [54, 61, 56],
        past: "Deine letzten Berichte", best: "Idealfall", bestW: 60, ign: "ignoriert",
        ov: "Außensicht", ovn: "meist 7 Tage", buffer: "+ Puffer",
        caps: [
          "Du musst einen Bericht schreiben. Wie lange wird das dauern?",
          "Du stellst dir vor, dass alles glattläuft: <b>3 Tage</b>.",
          "Dann kommt <b>das echte Leben</b> dazwischen, ein Hindernis nach dem anderen.",
          "Es dauert <b>7 Tage</b>, mehr als doppelt so lang.",
          "Deine letzten Berichte? <b>Jeder einzelne</b> hat auch länger gedauert.",
          "Aber du hast mit dem <b>Idealfall</b> geplant, nicht mit dieser Erfahrung.",
          "<b>Die Lösung:</b> Frag dich, wie lange ähnliche Aufgaben wirklich gedauert haben.",
          "Plane damit und rechne einen Puffer ein. <b>Du wirst rechtzeitig fertig.</b>"
        ],
        say: [
          "Du musst einen Bericht schreiben. Wie lange wird das dauern?",
          "Du stellst dir vor, dass alles glattläuft. Drei Tage.",
          "Dann kommt das echte Leben dazwischen, ein Hindernis nach dem anderen.",
          "Es dauert sieben Tage. Mehr als doppelt so lang.",
          "Deine letzten Berichte? Jeder einzelne hat auch länger gedauert.",
          "Aber du hast mit dem Idealfall geplant, nicht mit dieser Erfahrung.",
          "Die Lösung: Frag dich, wie lange ähnliche Aufgaben wirklich gedauert haben.",
          "Plane damit und rechne einen Puffer ein. Du wirst rechtzeitig fertig.",
          "Der Planungsfehlschluss. Deine Pläne malen den Idealfall aus. Plane damit, wie lange es früher wirklich gedauert hat."
        ]
      },
      it: {
        name: "Fallacia della pianificazione", shareTitle: "La fallacia della pianificazione in 30 secondi",
        ecline: "I tuoi piani immaginano il caso migliore. Pianifica in base a quanto ci è voluto davvero in passato.",
        days: ["LUN", "MAR", "MER", "GIO", "VEN"], report: "Report", three: "3 giorni",
        plan: "Il tuo piano", newPlan: "Nuovo piano", dur: n => (n === 1 ? "1 giorno" : `${n} giorni`), over: "+4 giorni",
        due: "scadenza", dueW: 58, snags: ["riunione", "feedback", "malattia"], snagW: [55, 58, 56],
        past: "I tuoi ultimi report", best: "caso migliore", bestW: 84, ign: "ignorato",
        ov: "visione esterna", ovn: "di solito 7 giorni", buffer: "+ margine",
        caps: [
          "Devi scrivere un report. Quanto ci vorrà?",
          "Te lo immagini filare liscio: <b>3 giorni</b>.",
          "Poi arriva <b>la vita vera</b>, un intoppo alla volta.",
          "Ci vogliono <b>7 giorni</b>, più del doppio.",
          "I tuoi ultimi report? <b>Tutti</b> hanno sforato.",
          "Ma hai pianificato sul <b>caso migliore</b>, non su quello storico.",
          "<b>La soluzione:</b> chiediti quanto hanno richiesto davvero compiti simili.",
          "Pianifica su quello, poi aggiungi un margine. <b>Finisci in tempo.</b>"
        ],
        say: [
          "Devi scrivere un report. Quanto ci vorrà?",
          "Te lo immagini filare liscio. Tre giorni.",
          "Poi arriva la vita vera, un intoppo alla volta.",
          "Ci vogliono sette giorni. Più del doppio.",
          "I tuoi ultimi report? Hanno sforato tutti.",
          "Ma hai pianificato sul caso migliore, non su quello storico.",
          "La soluzione: chiediti quanto hanno richiesto davvero compiti simili.",
          "Pianifica su quello, poi aggiungi un margine. Finisci in tempo.",
          "La fallacia della pianificazione. I tuoi piani immaginano il caso migliore. Pianifica in base a quanto ci è voluto davvero in passato."
        ]
      }
    },
    svg(T) {
      // calendar: two working weeks
      let cal = "";
      for (let i = 0; i < 10; i++) {
        const x = col(i);
        cal += `<rect class="pf-col" x="${x + 1}" y="${CT}" width="${CW - 2}" height="${CB - CT}" rx="4"/>` +
          `<text class="pf-day" x="${x + CW / 2}" y="${CT - 6}">${T.days[i % 5]}</text>`;
      }
      // the picture in your head: three smooth days, drawn right above Mon..Wed
      let cells = "";
      for (let i = 0; i < PLAN; i++) {
        const x = col(i) + 2, w = CW - 4;
        cells += `<g class="pf-cell" data-k="c${i}"><rect x="${x}" y="22" width="${w}" height="22" rx="4"/><path d="M${x + 9} 33 l4 4 l8 -9"/></g>`;
      }
      const tags = T.snags.map((s, i) => {
        const cx = col(SNAG[i]) + CW / 2, w = T.snagW[i];
        return `<g class="pf-tag" data-k="s${i}"><rect x="${cx - w / 2}" y="${TY}" width="${w}" height="16" rx="8"/><text x="${cx}" y="${TY + 11.5}">${s}</text></g>`;
      }).join("");
      const rows = PAST.map((_, i) => bar(`rq${i}`, "q", RY[i], RH, 2.5) + bar(`rb${i}`, "b", RY[i], RH, 2.5)).join("");
      // the deadline: a dashed line through the bar, with a flag hanging to its right
      const due = cls => `<g class="pf-due${cls}"><line x1="0" y1="${BY - 4}" x2="0" y2="${DY + 2}"/>` +
        `<rect x="-6" y="${DY}" width="${T.dueW}" height="15" rx="7.5"/><text x="${T.dueW / 2 - 6}" y="${DY + 11}" text-anchor="middle">${T.due}</text></g>`;
      const x1 = col(0) + 2, x2 = col(PLAN - 1) + CW - 2, BX = 140;
      return `
        <g data-k="cal">${cal}</g>
        <g data-k="bub"><rect class="pf-bub" x="12" y="12" width="230" height="54" rx="16"/>
          <circle class="pf-bub" cx="249" cy="22" r="3"/><circle class="pf-bub" cx="256" cy="31" r="2"/>
          ${cells}<text class="pf-qm" data-k="qm" x="127" y="47">?</text>
          <text class="pf-three" data-k="three" x="${BX}" y="38">${T.three}</text>
          <g class="pf-best" data-k="best"><rect x="${BX - 4}" y="44" width="${T.bestW}" height="15" rx="7.5"/><text x="${BX - 4 + T.bestW / 2}" y="55">${T.best}</text></g></g>
        <g class="pf-man" data-k="man"><circle cx="274" cy="40" r="8"/><path d="M258 72 V67 a16 13 0 0 1 32 0 V72"/></g>
        <g class="pf-doc" data-k="doc"><path class="pa" d="M306 20 H324 L332 28 V54 H306 Z M324 20 V28 H332"/>
          <path class="ln" d="M311 34 H327 M311 40 H327 M311 46 H321"/><text class="pf-lab c" x="319" y="67">${T.report}</text></g>
        <g data-k="beam"><path class="pf-beam" d="M${x1} 44 H${x2} V${BY} H${x1} Z"/><path class="pf-beam-e" d="M${x1} 46 V${BY - 3} M${x2} 46 V${BY - 3}"/></g>
        <g data-k="old">${bar("pq", "q", BY, BH, 4)}${bar("pb", "b", BY, BH, 4)}
          <text class="pf-in" x="${X0 + 6}" y="${BY + 13.5}">${T.plan}</text>
          <text class="pf-in c" data-k="over" x="${(xd(PLAN) + xd(5)) / 2}" y="${BY + 13.5}">${T.over}</text>
          <text class="pf-dur" data-k="dur" y="${BY + 14}"></text></g>
        <g data-k="new">${bar("ng", "g", BY, BH, 4)}<text class="pf-in" x="${X0 + 6}" y="${BY + 13.5}">${T.newPlan}</text></g>
        <g data-k="buf"><rect class="pf-buf" x="${xd(NEW + BUF - 1) + 1}" y="${BY + 1}" width="${CW - 2}" height="${BH - 2}" rx="4"/>
          <text class="pf-bufl" x="${xd(NEW + BUF) + 6}" y="${BY + 13.5}">${T.buffer}</text></g>
        ${tags}
        <g data-k="due">${due("")}<g data-k="duem">${due(" m")}</g></g>
        <g data-k="past">${rows}<text class="pf-lab" x="${X0}" y="${PT}">${T.past}</text></g>
        <g class="pf-ign" data-k="ign"><line x1="${LX}" y1="${RY[0] - 5}" x2="${LX}" y2="${BY + BH + 5}"/>
          <path d="M${LX - 5} ${BY + BH + 10} l5 -5 l5 5"/>
          <path class="x" d="M${LX - 5} 158 l10 10 M${LX + 5} 158 l-10 10"/>
          <text x="${LX + 12}" y="166.5">${T.ign}</text></g>
        <line class="pf-ov" data-k="ov" x1="${OVX}" x2="${OVX}" y1="${RY[2] + RH + 6}" y2="${RY[2] + RH + 6}"/>
        <g data-k="ovl"><text class="pf-ovl" x="${OVX}" y="${PT}">${T.ov}</text><text class="pf-lab c" x="${OVX}" y="${PT + 13}">${T.ovn}</text></g>
        <g class="pf-chk" data-k="chk"><circle r="8"/><path d="M-3.8 0.4 L-1 3.2 L4.2 -2.8"/></g>`;
    },
    S0: { cal: 0, man: 0, doc: 0, bub: 0, qm: 0, c0: 0, c1: 0, c2: 0, three: 0, plan: 0, len: PLAN,
      due: 0, dueM: 0, miss: 0, s0: 0, s1: 0, s2: 0, dur: 0, over: 0, past: 0, pdim: 0, r0: 0, r1: 0, r2: 0,
      best: 0, beam: 0, ign: 0, dim: 0, ov: 0, ovl: 0, old: 1, grow: 0, buf: 0, chk: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = v; };
      const tr = (key, x, y) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)})`);
      // set a two-piece bar to the days [a, b], with a hairline gap where pieces meet
      const put = (key, a, b) => {
        const s = segs(a, b);
        for (let i = 0; i < 2; i++) {
          const r = k(key + i);
          if (s[i] && s[i][1] - s[i][0] > 2) { r.setAttribute("x", f1(s[i][0] + 1)); r.setAttribute("width", f1(s[i][1] - s[i][0] - 2)); r.style.display = ""; }
          else r.style.display = "none";
        }
      };
      // calendar, you, the report
      tr("cal", 0, 6 * (1 - S.cal)); op("cal", S.cal);
      op("man", S.man);
      tr("doc", 0, 6 * (1 - S.doc)); op("doc", S.doc);
      // the picture in your head
      k("bub").setAttribute("transform", `translate(${f1(6 * (1 - S.bub))} ${f1(6 * (1 - S.bub))})`);
      op("bub", S.bub * (1 - .65 * S.dim));
      op("qm", S.qm);
      for (let i = 0; i < PLAN; i++) { const p = S["c" + i]; tr("c" + i, 0, 4 * (1 - p)); op("c" + i, p); }
      op("three", S.three);
      op("best", S.best); tr("best", 6 * (1 - S.best), 0);
      // the plan, and what really happened
      tr("old", 0, -14 * (1 - S.plan));
      op("old", clamp(S.plan * 2) * S.old);
      put("pq", 0, PLAN);
      put("pb", PLAN, Math.max(PLAN, S.len));
      op("over", S.over);
      const d = k("dur");
      d.textContent = T.dur(Math.round(S.len)); d.setAttribute("x", f1(xd(S.len) + 6)); op("dur", S.dur);
      // real life, landing on the calendar
      for (let i = 0; i < 3; i++) { const p = S["s" + i]; tr("s" + i, 0, -26 * (1 - p)); op("s" + i, clamp(p * 3)); }
      // the deadline: missed, then moved out to cover the real length plus a buffer
      tr("due", DUE0 + (DUE1 - DUE0) * S.dueM, 0);
      op("due", S.due); op("duem", S.miss);
      // your track record
      op("past", S.past * (1 - .55 * S.pdim));
      PAST.forEach(([pl, took], i) => {
        const L = took * S["r" + i];
        put("rq" + i, 0, Math.min(L, pl)); put("rb" + i, pl, L);
      });
      // where the plan came from, and what it left out
      op("beam", S.beam); op("ign", S.ign);
      // the outside view: how long it usually takes, carried up to the calendar
      const y0 = RY[2] + RH + 6;
      k("ov").setAttribute("y2", f1(y0 - (y0 - BY + 3) * S.ov)); op("ov", S.ov > 0 ? 1 : 0);
      op("ovl", S.ovl);
      // the new plan
      put("ng", 0, S.grow); op("new", S.grow > 0 ? 1 : 0);
      op("buf", S.buf);
      k("chk").setAttribute("transform", `translate(${OVX} ${BY + BH / 2}) scale(${f1(Math.max(0, S.chk) * 100) / 100})`);
      op("chk", clamp(S.chk * 2));
    },
    beats: [
      { steps: [{ to: { cal: 1 }, ms: 600, sfx: "pluck" }, { to: { man: 1, doc: 1 }, ms: 400 }, { to: { bub: 1, qm: 1 }, ms: 500, ease: "back" }] },
      { steps: [{ to: { qm: 0 }, ms: 250 }, { to: { c0: 1 }, ms: 300, sfx: "tick" }, { to: { c1: 1 }, ms: 300 }, { to: { c2: 1 }, ms: 300 },
        { to: { three: 1 }, ms: 300 }, { wait: 300 }, { to: { plan: 1 }, ms: 500, ease: "back", sfx: "pop" }, { to: { due: 1 }, ms: 400 }] },
      { steps: [{ to: { s0: 1 }, ms: 600, ease: "bounce", sfx: "thud", sfxAt: 220 }, { wait: 200 },
        { to: { s1: 1 }, ms: 600, ease: "bounce" }, { wait: 200 }, { to: { s2: 1 }, ms: 600, ease: "bounce" }] },
      { steps: [{ to: { dur: 1 }, ms: 250 }, { to: { len: REAL }, ms: 1600, ease: "inOut", sfx: "whoosh" },
        { to: { miss: 1, over: 1 }, ms: 400 }] },
      { steps: [{ to: { past: 1 }, ms: 300 }, { to: { r0: 1 }, ms: 600, sfx: "tick" }, { to: { r1: 1 }, ms: 600 }, { to: { r2: 1 }, ms: 600 }] },
      { steps: [{ to: { due: 0 }, ms: 300 }, { to: { best: 1 }, ms: 500, ease: "back", sfx: "spring" }, { to: { beam: 1 }, ms: 500 }, { wait: 300 },
        { to: { ign: 1, pdim: 1 }, ms: 500 }], hold: 3000 },
      { steps: [{ to: { beam: 0, ign: 0, dim: 1, pdim: 0 }, ms: 500 }, { to: { ov: 1 }, ms: 900, ease: "inOut", sfx: "scribble" }, { to: { ovl: 1 }, ms: 400 }], hold: 3000 },
      { steps: [{ to: { old: 0, miss: 0 }, ms: 500 }, { to: { dueM: 1 } }, { to: { grow: NEW }, ms: 1100, ease: "inOut" },
        { to: { buf: 1, due: 1 }, ms: 500 }, { to: { chk: 1 }, ms: 450, ease: "back", sfx: "chime" }], hold: 4200 }
    ]
  };
})();
