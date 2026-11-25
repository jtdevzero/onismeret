/* Loss aversion: a fair coin bet that pays on average, how its two outcomes feel, and the
   same bet seen as ten flips. Scene for anim.js. */
(function () {
  const P = '.bp[data-scene="loss-aversion"]';
  // Ten flips, fixed so every recording is identical: 5 heads (1), 5 tails (0).
  // Ordered so the running total never drops below zero: 120, 20, 140, 260, 160, 280, 180, 80, 200, 100.
  const SEQ = [1, 0, 1, 1, 0, 1, 0, 0, 1, 0];
  const RUN = SEQ.reduce((a, h) => (a.push((a.length ? a[a.length - 1] : 0) + (h ? 120 : -100)), a), []);
  const CX = i => 38 + i * 36;                 // x of the i-th small coin
  const CY = 90;                               // y of the row of small coins
  const BASE = 232, FEEL = 0.45;               // baseline of the feeling bars, px per felt euro
  const fy = v => BASE - v * FEEL;             // felt euros -> y
  const GX = 184, LX = 244, BW = 36;           // left edge of the gain and loss bars, bar width
  const BR = 292;                              // x of the brackets right of the loss bar
  const clamp = v => Math.max(0, Math.min(1, v));
  const eurEn = v => (v > 0 ? "+" : v < 0 ? "−" : "") + "€" + Math.abs(v);
  const eurEl = v => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " €";

  window.BiasAnim.SCENES["loss-aversion"] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
      ${P} .la-coin{fill:var(--surface);stroke:var(--ink);stroke-width:2.4}
      ${P} .la-coin-in{fill:none;stroke:var(--faint);stroke-width:1.2}
      ${P} .la-coin-t{font:700 19px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .la-link{stroke:var(--rule);stroke-width:1.8;stroke-linecap:round;stroke-dasharray:1 4}
      ${P} .la-card rect{fill:var(--surface);stroke-width:1.8}
      ${P} .la-card .h{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .la-card .v{font:700 15px var(--display);text-anchor:middle}
      ${P} .la-card.win rect{stroke:var(--good)} ${P} .la-card.win .v{fill:var(--good)}
      ${P} .la-card.lose rect{stroke:var(--bad)} ${P} .la-card.lose .v{fill:var(--bad)}
      ${P} .la-evf{font:500 10.5px var(--mono);fill:var(--ink);text-anchor:end}
      ${P} .la-evr{font:700 14px var(--display);fill:var(--good)}
      ${P} .la-evs{font:500 9px var(--mono);fill:var(--faint);text-anchor:middle}
      ${P} .la-you{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .la-eye{fill:var(--ink)}
      ${P} .la-bub rect,${P} .la-bub path{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}
      ${P} .la-bub text{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .la-bub.yes rect,${P} .la-bub.yes path{stroke:var(--good)}
      ${P} .la-bub.yes text{fill:var(--good)}
      ${P} .la-head{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .la-base{stroke:var(--rule);stroke-width:2;stroke-linecap:round}
      ${P} .la-bar{stroke-width:2;stroke-linejoin:round}
      ${P} .la-bar.win{fill:var(--good);fill-opacity:.22;stroke:var(--good)}
      ${P} .la-bar.lose{fill:var(--bad);fill-opacity:.22;stroke:var(--bad)}
      ${P} .la-amt{font:600 11px var(--display);text-anchor:middle}
      ${P} .la-amt.win{fill:var(--good)} ${P} .la-amt.lose{fill:var(--bad)}
      ${P} .la-wd{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .la-ref line{stroke:var(--muted);stroke-width:1.3;stroke-dasharray:3 3}
      ${P} .la-ref text{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:end}
      ${P} .la-x2 path{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .la-x2 text{font:700 13px var(--display);fill:var(--q)}
      ${P} .la-gap rect{fill:var(--bad);fill-opacity:.45}
      ${P} .la-gap line{stroke:var(--bad);stroke-width:1.4;stroke-dasharray:3 3}
      ${P} .la-gap path{fill:none;stroke:var(--bad);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .la-gap text{font:600 11px var(--display);fill:var(--bad)}
      ${P} .la-mc circle{fill:var(--surface);stroke:var(--faint);stroke-width:2}
      ${P} .la-mc text{font:700 11px var(--display);text-anchor:middle;fill-opacity:0}
      ${P} .la-mc.h circle{stroke:var(--good)} ${P} .la-mc.h text{fill:var(--good);fill-opacity:1}
      ${P} .la-mc.t circle{stroke:var(--bad)} ${P} .la-mc.t text{fill:var(--bad);fill-opacity:1}
      ${P} .la-ml{font:500 9.5px var(--mono);text-anchor:middle}
      ${P} .la-ml.h{fill:var(--good)} ${P} .la-ml.t{fill:var(--bad)}
      ${P} .la-ring{fill:none;stroke:var(--q);stroke-width:2}
      ${P} .la-tot .lab{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .la-tot .num{font:700 28px var(--display);fill:var(--good);text-anchor:middle}
      ${P} .la-tot .f{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
    `,
    text: {
      hu: {
        name: "Veszteségkerülés", shareTitle: "A veszteségkerülés, 30 másodpercben",
        ecline: "A veszteségek nagyobbnak látszanak, mint a nyereségek. A fogadást az esélyei alapján ítéld meg, ne a fájdalma alapján.",
        eur: eurEl, heads: "Fej", tails: "Írás", hl: "F", tl: "Í",
        evs: "átlagosan dobásonként", no: "Köszönöm, nem", yes: "Benne vagyok!",
        feels: "Milyennek érződik", win: "nyerés", lose: "veszteség",
        gap1: "úgy érződik, mint", gap2: "rossz fogadás", after: n => `${n} dobás után`,
        caps: [
          "Pénzfeldobás: fejre <b>120 € nyereséged</b> van, írásra <b>100 € veszteséged</b>.",
          "Átlagosan dobásonként <b>10 €-val</b> jössz ki jobban.",
          "Mégis a legtöbben <b>nemet mondanak</b>.",
          "A veszteség <b>jobban fáj</b>, mint amennyire a nyereség jó.",
          "A veszteségek <b>nagyjából kétszer</b> olyan erősnek érződnek, mint az azonos összegű nyereségek.",
          "Így a jó fogadás <b>rossz fogadásnak érződik</b>.",
          "<b>A megoldás:</b> gondolj rá úgy, mint sok dobás egyikére.",
          "Tíz dobás után <b>+100 €</b>-t várhatsz. Vállald a jó fogadásokat, amelyeket meg tudsz engedni magadnak."
        ],
        say: [
          "Egy pénzfeldobás. Fejre nyersz száznyolcvan eurót, írásra veszítesz egy százat.",
          "Átlagosan minden dobásnál tíz euróval jössz ki jobban.",
          "Mégis a legtöbben nemet mondanak.",
          "A veszteség jobban fáj, mint amennyire a nyereség jó.",
          "A veszteségek nagyjából kétszer olyan erősnek érződnek, mint az azonos összegű nyereségek.",
          "Így a jó fogadás rossz fogadásnak érződik.",
          "A megoldás: gondolj rá úgy, mint sok dobás egyikére.",
          "Tíz dobás után száz euróval többet várhatsz. Vállald a jó fogadásokat, amelyeket meg tudsz engedni magadnak.",
          "A veszteségkerülés. A veszteségek nagyobbnak látszanak, mint a nyereségek. A fogadást az esélyei alapján ítéld meg, ne a fájdalma alapján."
        ]
      },
      en: {
        name: "Loss aversion", shareTitle: "Loss aversion, explained in 30 seconds",
        ecline: "Losses loom larger than gains. Judge a bet by its odds, not the sting.",
        eur: eurEn, heads: "Heads", tails: "Tails", hl: "H", tl: "T",
        evs: "average per flip", no: "No thanks", yes: "I'm in!",
        feels: "How it feels", win: "win", lose: "lose",
        gap1: "feels like", gap2: "a bad bet", after: n => `After ${n} flip${n === 1 ? "" : "s"}`,
        caps: [
          "A coin flip: heads you <b>win €120</b>, tails you <b>lose €100</b>.",
          "On average, you'd come out <b>€10 ahead</b> per flip.",
          "Yet most people still <b>say no</b>.",
          "Losing <b>hurts more</b> than winning feels good.",
          "Losses feel <b>roughly twice as strong</b> as equal gains.",
          "So a good bet <b>feels like a bad one</b>.",
          "<b>The fix:</b> think of it as one of many flips.",
          "Ten flips: expect <b>+€100</b>. Take good bets you can afford to lose."
        ],
        say: [
          "A coin flip. Heads, you win a hundred and twenty euros. Tails, you lose a hundred.",
          "On average, you'd come out ten euros ahead on every flip.",
          "Yet most people still say no.",
          "Losing hurts more than winning feels good.",
          "Losses feel roughly twice as strong as equal gains.",
          "So a good bet feels like a bad one.",
          "The fix: think of it as one of many flips.",
          "Over ten flips, you'd expect to be a hundred euros up. Take good bets you can afford to lose.",
          "Loss aversion. Losses loom larger than gains. Judge a bet by its odds, not the sting."
        ]
      },
      el: {
        name: "Αποστροφή στην απώλεια", shareTitle: "Η αποστροφή στην απώλεια σε 30 δευτερόλεπτα",
        ecline: "Οι απώλειες φαντάζουν μεγαλύτερες από τα κέρδη. Κρίνε ένα στοίχημα από τα νούμερα, όχι από το πόσο τσούζει.",
        eur: eurEl, heads: "Κορόνα", tails: "Γράμματα", hl: "Κ", tl: "Γ",
        evs: "μέσο κέρδος ανά γύρο", no: "Όχι, ευχαριστώ", yes: "Παίζω!",
        feels: "Πώς το νιώθεις", win: "κέρδος", lose: "απώλεια",
        gap1: "μοιάζει", gap2: "κακό στοίχημα", after: n => `Μετά από ${n} ${n === 1 ? "γύρο" : "γύρους"}`,
        caps: [
          "Κορόνα-γράμματα: κορόνα <b>κερδίζεις 120\u00a0€</b>, γράμματα <b>χάνεις 100\u00a0€</b>.",
          "Κατά μέσο όρο, κάθε γύρος σού αφήνει <b>10\u00a0€ κέρδος</b>.",
          "Κι όμως, οι περισσότεροι <b>λένε όχι</b>.",
          "Η απώλεια <b>πονάει πιο πολύ</b> απ’\u00a0όσο σε ευχαριστεί το κέρδος.",
          "Οι απώλειες βαραίνουν <b>περίπου διπλάσια</b> από ισόποσα κέρδη.",
          "Έτσι, ένα καλό στοίχημα <b>σου φαίνεται κακό</b>.",
          "<b>Η λύση:</b> δες το σαν έναν από πολλούς γύρους.",
          "Σε δέκα γύρους περιμένεις <b>+100\u00a0€</b>. Παίζε τα καλά στοιχήματα, αν αντέχεις τη χασούρα."
        ],
        say: [
          "Κορόνα γράμματα. Κορόνα, κερδίζεις εκατόν είκοσι ευρώ. Γράμματα, χάνεις εκατό.",
          "Κατά μέσο όρο, κάθε γύρος σού αφήνει δέκα ευρώ κέρδος.",
          "Κι όμως, οι περισσότεροι λένε όχι.",
          "Η απώλεια πονάει πιο πολύ απ’ όσο σε ευχαριστεί το κέρδος.",
          "Οι απώλειες βαραίνουν περίπου διπλάσια από ισόποσα κέρδη.",
          "Έτσι, ένα καλό στοίχημα σου φαίνεται κακό.",
          "Η λύση: δες το σαν έναν από πολλούς γύρους.",
          "Σε δέκα γύρους, περιμένεις να βγεις εκατό ευρώ μπροστά. Παίζε τα καλά στοιχήματα, αν αντέχεις τη χασούρα.",
          "Αποστροφή στην απώλεια. Οι απώλειες φαντάζουν μεγαλύτερες από τα κέρδη. Κρίνε ένα στοίχημα από τα νούμερα, όχι από το πόσο τσούζει."
        ]
      },
      es: {
        name: "Aversión a la pérdida", shareTitle: "La aversión a la pérdida en 30 segundos",
        ecline: "Las pérdidas pesan más que las ganancias. Juzga una apuesta por sus probabilidades, no por lo que duele.",
        eur: v => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " €", heads: "Cara", tails: "Cruz", hl: "C", tl: "X",
        evs: "media por tirada", no: "No, gracias", yes: "¡Me apunto!",
        feels: "Cómo se siente", win: "ganar", lose: "perder",
        gap1: "parece", gap2: "mala apuesta", after: n => `Tras ${n} ${n === 1 ? "tirada" : "tiradas"}`,
        caps: [
          "Una moneda al aire: cara, <b>ganas 120 €</b>; cruz, <b>pierdes 100 €</b>.",
          "En promedio, saldrías <b>10 € por delante</b> en cada tirada.",
          "Aun así, la mayoría <b>dice que no</b>.",
          "Perder <b>duele más</b> de lo que alegra ganar.",
          "Las pérdidas se sienten <b>casi el doble de fuertes</b> que ganancias iguales.",
          "Así que una buena apuesta <b>parece mala</b>.",
          "<b>La solución:</b> piensa en ella como una de muchas tiradas.",
          "Diez tiradas: espera <b>+100 €</b>. Acepta buenas apuestas que te puedas permitir perder."
        ],
        say: [
          "Una moneda al aire. Si sale cara, ganas ciento veinte euros. Si sale cruz, pierdes cien.",
          "En promedio, saldrías ganando diez euros en cada tirada.",
          "Aun así, la mayoría dice que no.",
          "Perder duele más de lo que alegra ganar.",
          "Las pérdidas se sienten casi el doble de fuertes que ganancias iguales.",
          "Así que una buena apuesta parece mala.",
          "La solución: piensa en ella como una de muchas tiradas.",
          "En diez tiradas, lo esperable es ganar cien euros. Acepta buenas apuestas que te puedas permitir perder.",
          "La aversión a la pérdida. Las pérdidas pesan más que las ganancias. Juzga una apuesta por sus probabilidades, no por lo que duele."
        ]
      },
      fr: {
        name: "Aversion à la perte", shareTitle: "L’aversion à la perte en 30 secondes",
        ecline: "Les pertes pèsent plus lourd que les gains. Jugez un pari sur ses chances, pas sur la peur de perdre.",
        eur: v => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " €", heads: "Face", tails: "Pile", hl: "F", tl: "P",
        evs: "moyenne par lancer", no: "Non merci", yes: "Je joue !",
        feels: "Ce qu’on ressent", win: "gain", lose: "perte",
        gap1: "on dirait un", gap2: "mauvais pari", after: n => `Après ${n} lancer${n > 1 ? "s" : ""}`,
        caps: [
          "Pile ou face : face, vous <b>gagnez 120 €</b> ; pile, vous <b>perdez 100 €</b>.",
          "En moyenne, vous seriez <b>gagnant de 10 €</b> à chaque lancer.",
          "Pourtant, la plupart des gens <b>refusent</b>.",
          "Perdre <b>fait plus mal</b> que gagner ne fait plaisir.",
          "Une perte pèse <b>environ deux fois plus</b> qu’un gain égal.",
          "Alors un bon pari <b>semble mauvais</b>.",
          "<b>La solution :</b> voyez-le comme un lancer parmi beaucoup d’autres.",
          "Dix lancers : comptez sur <b>+100 €</b>. Acceptez les bons paris dont vous pouvez assumer la perte."
        ],
        say: [
          "Pile ou face. Face, vous gagnez cent vingt euros. Pile, vous en perdez cent.",
          "En moyenne, vous gagneriez dix euros à chaque lancer.",
          "Pourtant, la plupart des gens refusent.",
          "Perdre fait plus mal que gagner ne fait plaisir.",
          "Une perte pèse environ deux fois plus qu’un gain égal.",
          "Alors un bon pari semble mauvais.",
          "La solution : voyez-le comme un lancer parmi beaucoup d’autres.",
          "Sur dix lancers, vous pouvez espérer cent euros de plus. Acceptez les bons paris dont vous pouvez assumer la perte.",
          "L’aversion à la perte. Les pertes pèsent plus lourd que les gains. Jugez un pari sur ses chances, pas sur la peur de perdre."
        ]
      },
      de: {
        name: "Verlustaversion", shareTitle: "Die Verlustaversion in 30 Sekunden",
        ecline: "Verluste wiegen schwerer als Gewinne. Beurteile eine Wette nach ihren Chancen, nicht nach dem Schmerz.",
        eur: v => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + " €", heads: "Kopf", tails: "Zahl", hl: "K", tl: "Z",
        evs: "Durchschnitt pro Wurf", no: "Nein danke", yes: "Ich bin dabei!",
        feels: "Wie es sich anfühlt", win: "Gewinn", lose: "Verlust",
        gap1: "wirkt wie eine", gap2: "schlechte Wette", after: n => `Nach ${n} ${n === 1 ? "Wurf" : "Würfen"}`,
        caps: [
          "Ein Münzwurf: Bei Kopf <b>gewinnst du 120 €</b>, bei Zahl <b>verlierst du 100 €</b>.",
          "Im Schnitt lägst du pro Wurf <b>10 € im Plus</b>.",
          "Trotzdem sagen die meisten Menschen <b>Nein</b>.",
          "Verlieren <b>tut mehr weh</b>, als Gewinnen Freude macht.",
          "Verluste wiegen <b>etwa doppelt so schwer</b> wie gleich große Gewinne.",
          "So wirkt eine gute Wette <b>wie eine schlechte</b>.",
          "<b>Die Lösung:</b> Sieh jeden Wurf als einen von vielen.",
          "Zehn Würfe: Rechne mit <b>+100 €</b>. Nimm gute Wetten an, deren Verlust du verkraften kannst."
        ],
        say: [
          "Ein Münzwurf. Bei Kopf gewinnst du hundertzwanzig Euro. Bei Zahl verlierst du hundert.",
          "Im Schnitt lägst du bei jedem Wurf zehn Euro im Plus.",
          "Trotzdem sagen die meisten Menschen Nein.",
          "Verlieren tut mehr weh, als Gewinnen Freude macht.",
          "Verluste wiegen etwa doppelt so schwer wie gleich große Gewinne.",
          "So wirkt eine gute Wette wie eine schlechte.",
          "Die Lösung: Sieh jeden Wurf als einen von vielen.",
          "Über zehn Würfe kannst du mit hundert Euro Plus rechnen. Nimm gute Wetten an, deren Verlust du verkraften kannst.",
          "Die Verlustaversion. Verluste wiegen schwerer als Gewinne. Beurteile eine Wette nach ihren Chancen, nicht nach dem Schmerz."
        ]
      },
      it: {
        name: "Avversione alla perdita", shareTitle: "L’avversione alla perdita in 30 secondi",
        ecline: "Le perdite pesano più dei guadagni. Giudica una scommessa dalle probabilità, non da quanto brucia perdere.",
        eur: v => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v)} €`, heads: "Testa", tails: "Croce", hl: "T", tl: "C",
        evs: "media per lancio", no: "No, grazie", yes: "Ci sto!",
        feels: "Cosa si prova", win: "vincita", lose: "perdita",
        gap1: "sembra un", gap2: "cattivo affare", after: n => `Dopo ${n} ${n === 1 ? "lancio" : "lanci"}`,
        caps: [
          "Testa o croce: con testa <b>vinci 120 €</b>, con croce <b>perdi 100 €</b>.",
          "In media, ci <b>guadagneresti 10 €</b> a lancio.",
          "Eppure quasi tutti <b>rifiutano</b>.",
          "Perdere <b>fa più male</b> di quanto vincere faccia piacere.",
          "Le perdite pesano <b>circa il doppio</b> di guadagni equivalenti.",
          "Così una buona scommessa <b>sembra una cattiva</b>.",
          "<b>La soluzione:</b> pensala come uno di tanti lanci.",
          "Dieci lanci: aspettati <b>+100 €</b>. Accetta le buone scommesse che puoi permetterti di perdere."
        ],
        say: [
          "Testa o croce. Con testa, vinci centoventi euro. Con croce, ne perdi cento.",
          "In media, ci guadagneresti dieci euro a ogni lancio.",
          "Eppure quasi tutti rifiutano.",
          "Perdere fa più male di quanto vincere faccia piacere.",
          "Le perdite pesano circa il doppio di guadagni equivalenti.",
          "Così una buona scommessa sembra una cattiva.",
          "La soluzione: pensala come uno di tanti lanci.",
          "Su dieci lanci, ti aspetteresti di essere in attivo di cento euro. Accetta le buone scommesse che puoi permetterti di perdere.",
          "L’avversione alla perdita. Le perdite pesano più dei guadagni. Giudica una scommessa dalle probabilità, non da quanto brucia perdere."
        ]
      }
    },
    svg(T) {
      const bubble = (key, cls, txt) => `<g class="la-bub ${cls}" data-k="${key}"><rect x="16" y="134" width="124" height="28" rx="10"/><path d="M42 161 L48 172 L56 161"/><text x="78" y="152">${txt}</text></g>`;
      let coins = "";
      SEQ.forEach((h, i) => {
        coins += `<g data-k="c${i}"><g class="la-mc" data-k="cf${i}"><circle r="11"/><text y="4">${h ? T.hl : T.tl}</text></g></g>` +
          `<text class="la-ml ${h ? "h" : "t"}" data-k="cl${i}" x="${CX(i)}" y="${CY + 27}">${h ? "+120" : "−100"}</text>`;
      });
      return `
        <g data-k="cardH"><g class="la-card win"><rect x="42" y="20" width="110" height="40" rx="8"/><text class="h" x="97" y="34">${T.heads}</text><text class="v" x="97" y="53">${T.eur(120)}</text></g></g>
        <g data-k="cardT"><g class="la-card lose"><rect x="248" y="20" width="110" height="40" rx="8"/><text class="h" x="303" y="34">${T.tails}</text><text class="v" x="303" y="53">${T.eur(-100)}</text></g></g>
        <g data-k="links"><line class="la-link" x1="157" y1="40" x2="173" y2="40"/><line class="la-link" x1="227" y1="40" x2="243" y2="40"/></g>
        <g data-k="coin"><circle class="la-coin" r="22"/><circle class="la-coin-in" r="17"/><text class="la-coin-t" y="7">€</text></g>
        <g data-k="ev"><text class="la-evf" x="236" y="90">½ × 120 − ½ × 100 =</text><text class="la-evr" data-k="evr" x="242" y="91">${T.eur(10)}</text><text class="la-evs" x="200" y="106">${T.evs}</text></g>
        <g data-k="you"><circle class="la-you" cx="52" cy="194" r="13"/><circle class="la-eye" cx="47.5" cy="191" r="1.6"/><circle class="la-eye" cx="56.5" cy="191" r="1.6"/>
          <path class="la-you" data-k="mouth" d=""/><path class="la-you" d="M26 252 C26 230 38 216 52 216 C66 216 78 230 78 252"/></g>
        ${bubble("no", "no", T.no)}${bubble("yes", "yes", T.yes)}
        <g data-k="chart">
          <text class="la-head" x="232" y="128">${T.feels}</text>
          <rect class="la-bar win" data-k="gbar" x="${GX}" width="${BW}"/>
          <rect class="la-bar lose" data-k="lbar" x="${LX}" width="${BW}"/>
          <line class="la-base" x1="172" y1="${BASE}" x2="292" y2="${BASE}"/>
          <text class="la-amt win" x="${GX + BW / 2}" y="${BASE + 14}">${T.eur(120).replace("+", "")}</text><text class="la-wd" x="${GX + BW / 2}" y="${BASE + 26}">${T.win}</text>
          <text class="la-amt lose" x="${LX + BW / 2}" y="${BASE + 14}">${T.eur(100).replace("+", "")}</text><text class="la-wd" x="${LX + BW / 2}" y="${BASE + 26}">${T.lose}</text>
          <g class="la-ref" data-k="ref"><line x1="${GX - 4}" y1="${fy(100)}" x2="${LX + BW + 4}" y2="${fy(100)}"/><text x="${GX - 8}" y="${fy(100) + 3.5}">${T.eur(100).replace("+", "")}</text></g>
          <g class="la-x2" data-k="x2"><path d="M${BR - 6} ${BASE} H${BR} V${fy(200)} H${BR - 6} M${BR} ${fy(100)} H${BR - 4}"/><text x="${BR + 7}" y="${fy(100) + 4.5}">≈ ×2</text></g>
          <g class="la-gap" data-k="gap"><rect x="${LX}" y="${fy(200)}" width="${BW}" height="${fy(120) - fy(200)}"/>
            <line x1="${GX + BW}" y1="${fy(120)}" x2="${LX}" y2="${fy(120)}"/>
            <path d="M${BR - 6} ${fy(120)} H${BR} V${fy(200)} H${BR - 6}"/>
            <text x="${BR + 7}" y="${(fy(120) + fy(200)) / 2 - 2}">${T.gap1}</text><text x="${BR + 7}" y="${(fy(120) + fy(200)) / 2 + 11}">${T.gap2}</text></g>
        </g>
        ${coins}
        <circle class="la-ring" data-k="ring" r="15" cy="${CY}"/>
        <g class="la-tot" data-k="tot"><text class="lab" data-k="totl" x="270" y="194"></text><text class="num" data-k="totv" x="270" y="228"></text>
          <text class="f" data-k="totf" x="270" y="248">5 × 120 − 5 × 100</text></g>`;
    },
    S0: { coin: 0, spin: 0, cards: 0, you: 0, ev: 0, evr: 0, no: 0, mood: 0, chart: 0, g: 0, l: 0, ref: 0, x2: 0, gap: 0,
      evm: 0, flips: 0, ring: 0, sweep: 0.5, tot: 0, totf: 0, yes: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = clamp(v); };
      // the big coin pops in and spins (scaleX follows the turn)
      const sc = Math.max(0.001, S.coin), sx = Math.max(0.001, sc * Math.abs(Math.cos(S.spin * Math.PI)));
      k("coin").setAttribute("transform", `translate(200 40) scale(${sx} ${sc})`);
      op("coin", S.coin * 3);
      k("cardH").setAttribute("transform", `translate(${(1 - S.cards) * 40} 0)`);
      k("cardT").setAttribute("transform", `translate(${(S.cards - 1) * 40} 0)`);
      op("cardH", S.cards); op("cardT", S.cards); op("links", S.cards);
      op("ev", S.ev); op("evr", S.evr);
      k("ev").setAttribute("transform", `translate(${S.evm * 70} ${S.evm * 58})`);
      op("you", S.you);
      k("mouth").setAttribute("d", `M46.5 200 Q52 ${200 + 4.5 * S.mood} 57.5 200`);
      const pop = (key, v) => {
        const s = 0.7 + 0.3 * v;
        k(key).setAttribute("transform", `translate(48 172) scale(${s}) translate(-48 -172)`);
        op(key, v * 1.6);
      };
      pop("no", S.no); pop("yes", S.yes);
      // feeling bars
      op("chart", S.chart);
      const bar = (key, x, v) => { const h = Math.max(0, v * FEEL); const r = k(key); r.setAttribute("y", BASE - h); r.setAttribute("height", h); r.style.opacity = v > 0.5 ? 1 : 0; };
      bar("gbar", GX, S.g); bar("lbar", LX, S.l);
      op("ref", S.ref); op("x2", S.x2); op("gap", S.gap);
      // ten fixed flips: each coin fades in, hops and turns, then lands on its face
      SEQ.forEach((h, i) => {
        const p = clamp((S.flips - i * 0.085) / 0.235);
        const landed = p > 5 / 6;
        const sx2 = p >= 1 ? 1 : Math.max(0.001, Math.abs(Math.cos(p * 3 * Math.PI)));
        const hop = Math.sin(p * Math.PI) * 10;
        k("c" + i).setAttribute("transform", `translate(${CX(i)} ${CY - hop}) scale(${sx2} 1)`);
        op("c" + i, p * 4);
        k("cf" + i).setAttribute("class", "la-mc" + (landed ? (h ? " h" : " t") : ""));
        op("cl" + i, (p - 0.85) / 0.15);
      });
      // running total: a ring walks along the coins; each coin counts once the ring reaches it
      const counted = Math.min(10, Math.floor(S.sweep + 0.5));
      const pos = Math.max(0, Math.min(9, S.sweep - 0.5));
      k("ring").setAttribute("cx", 38 + pos * 36);
      op("ring", S.ring);
      op("tot", S.tot);
      k("totv").textContent = T.eur(counted ? RUN[counted - 1] : 0);
      k("totl").textContent = T.after(counted);
      op("totf", S.totf);
    },
    beats: [
      { steps: [{ to: { coin: 1 }, ms: 420, ease: "out", sfx: "pop" }, { to: { spin: 4 }, ms: 900, ease: "inOut" },
        { to: { cards: 1 }, ms: 500 }, { to: { you: 1 }, ms: 400 }] },
      { steps: [{ to: { ev: 1 }, ms: 500 }, { wait: 250 }, { to: { evr: 1 }, ms: 350, sfx: "tick" }] },
      { steps: [{ to: { no: 1, mood: -0.3 }, ms: 450, ease: "out", sfx: "pop" }] },
      { steps: [{ to: { chart: 1 }, ms: 350 }, { to: { g: 120 }, ms: 700, sfx: "whoosh" }, { to: { l: 165 }, ms: 900, ease: "inOut" }] },
      { steps: [{ to: { ref: 1 }, ms: 400 }, { to: { l: 200 }, ms: 800, ease: "out", sfx: "spring" }, { to: { x2: 1 }, ms: 400 }] },
      { steps: [{ to: { x2: 0, ref: 0 }, ms: 300 }, { to: { gap: 1, mood: -1 }, ms: 500, sfx: "thud" }] },
      { steps: [{ to: { chart: 0, no: 0, mood: 0 }, ms: 400 }, { to: { evm: 1 }, ms: 600, ease: "inOut" }, { to: { flips: 1 }, ms: 2600, ease: "lin", sfx: "whoosh" }] },
      { steps: [{ to: { tot: 1, ring: 1 }, ms: 400, sfx: "tick" }, { to: { sweep: 9.5 }, ms: 2200, ease: "lin" },
        { to: { ring: 0, totf: 1, yes: 1, mood: 1 }, ms: 500, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
