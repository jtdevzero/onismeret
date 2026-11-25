/* Status quo bias: a €30 phone plan you never question, the same plan for €18 behind a door
   barricaded by worries, and €12 a month piling up while you stay in your armchair. Scene for anim.js. */
(function () {
  const KEY = "status-quo-bias", P = `.bp[data-scene="${KEY}"]`;
  const AX = 16, BX = 234, CT = 12, CW = 150, CH = 82;      // plan cards: left edges, top, size
  const CX = 80;                                            // armchair centre
  const DX = 318, DL = 292, DW = 52, DT = 150;              // door: centre, left edge, width, top
  const FLOOR = 244, PX = 190;                              // floor line, coin pile centre
  const coinY = i => 234.5 - 5.5 * i;                         // resting y of the i-th coin's top face
  const cl = v => Math.max(0, Math.min(1, v));
  const bounce = t => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375;
    return n * (t -= 2.625 / d) * t + .984375;
  };

  window.BiasAnim.SCENES[KEY] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
      ${P} .sq-card{fill:var(--surface);stroke:var(--ink);stroke-width:2}
      ${P} .sq-card.ok{fill:none;stroke:var(--good);stroke-width:2.6}
      ${P} .sq-ti{font:600 11.5px var(--display);fill:var(--ink)}
      ${P} .sq-pr{font:700 22px var(--display);fill:var(--ink)}
      ${P} .sq-pr.new{fill:var(--q)} ${P} .sq-pr.ok{fill:var(--good)}
      ${P} .sq-un{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .sq-ft{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .sq-ft.hi{fill:var(--q)}
      ${P} .sq-eq line{stroke:var(--q);stroke-width:2.4;stroke-linecap:round}
      ${P} .sq-note{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .sq-note.q{fill:var(--q)}
      ${P} .sq-scr{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .sq-ln{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .sq-st{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .sq-eye{fill:var(--ink)}
      ${P} .sq-floor{stroke:var(--rule);stroke-width:2;stroke-linecap:round}
      ${P} .sq-way{fill:var(--good);fill-opacity:.2}
      ${P} .sq-leaf{fill:var(--surface);stroke:var(--ink);stroke-width:2}
      ${P} .sq-pan{fill:none;stroke:var(--faint);stroke-width:1.4}
      ${P} .sq-knob{fill:var(--ink)}
      ${P} .sq-frame{fill:none;stroke:var(--ink);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .sq-frame.ok{stroke:var(--good)}
      ${P} .sq-lab{font:600 11.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .sq-lab.ok{fill:var(--good)}
      ${P} .sq-tm circle,${P} .sq-tm path{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round}
      ${P} .sq-tm text{font:600 11px var(--display);fill:var(--ink)}
      ${P} .sq-w rect{fill:var(--surface);stroke:var(--bad);stroke-width:1.8}
      ${P} .sq-w text{font:600 10.5px var(--display);fill:var(--bad);text-anchor:middle}
      ${P} .sq-coin{fill:var(--surface);stroke:var(--q);stroke-width:1.6}
      ${P} .sq-tot{font:700 15px var(--display);fill:var(--bad);text-anchor:middle}
      ${P} .sq-ask rect{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .sq-ask text{font:600 11.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .sq-chk circle{fill:var(--surface);stroke:var(--good);stroke-width:2}
      ${P} .sq-chk path{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
    `,
    text: {
      hu: {
        name: "Status quo torzítás", shareTitle: "A status quo torzítás, 30 másodpercben",
        ecline: "A megszokott dolgok biztonságosnak érződnek, akkor is, ha pénzbe kerülnek. Úgy válassz, mintha most kezdenéd.",
        yours: "A terved", newp: "Új terv", planA: "A terv", planB: "B terv", titleW: 58,
        pA: "30 €", pB: "18 €", per: "/hó", f1: "20 GB adat", f2: "korlátlan hívások", same: "ugyanaz",
        years: n => `${n} évig`, mins: "10 perc", stay: "Maradok", sw: "Váltok", safe: "biztonságosnak érződik",
        w1: "mi lesz, ha rosszabb?", w1W: 116, w2: "macera", w2W: 58,
        tot: n => (n === 1 ? "12 € havonta" : n === 12 ? "144 € évente" : `${12 * n} €`), cost: "a nem-választás ára",
        ask: "Melyiket választanád ma?", askW: 178,
        caps: [
          "Évek óta ugyanazt a telefoncsomagot használod. <b>30 €</b> havonta.",
          "Egy új csomag ugyanazokkal a funkciókkal <b>18 €</b>.",
          "A váltás csak <b>tíz percet</b> venne igénybe.",
          "De a maradás <b>biztonságosnak</b> érződik, a változtatás <b>kockázatosnak</b>.",
          "Így <b>maradsz</b>. Megint. Ez havonta <b>12 € többlet</b>.",
          "Egy év alatt ez <b>144 €</b>, semmiért.",
          "<b>A megoldás:</b> képzeld el, hogy ma kezdesz elölről, és úgy választasz.",
          "Frissen választva a válasz egyszerű. <b>Válts.</b>"
        ],
        say: [
          "Évek óta ugyanazt a telefoncsomagot használod. Harminc euró havonta.",
          "Egy új csomag ugyanazokkal a funkciókkal tizennyolc euró.",
          "A váltás csak tíz percet venne igénybe.",
          "De a maradás biztonságosnak érződik, a változtatás kockázatosnak.",
          "Így maradsz. Megint. Ez havonta tizenkét euró többlet.",
          "Egy év alatt ez száznegyvennégy euró, semmiért.",
          "A megoldás: képzeld el, hogy ma kezdesz elölről, és úgy választasz.",
          "Frissen választva a válasz egyszerű. Válts.",
          "A status quo torzítás. A megszokott dolgok biztonságosnak érződnek, akkor is, ha pénzbe kerülnek. Úgy válassz, mintha most kezdenéd."
        ]
      },
      en: {
        name: "Status quo bias", shareTitle: "Status quo bias, explained in 30 seconds",
        ecline: "Sticking with things feels safe even when it costs you. Choose as if from scratch.",
        yours: "Your plan", newp: "New plan", planA: "Plan A", planB: "Plan B", titleW: 58,
        pA: "€30", pB: "€18", per: "/month", f1: "20 GB data", f2: "unlimited calls", same: "same",
        years: n => `for ${n} year${n === 1 ? "" : "s"}`, mins: "10 min", stay: "Stay", sw: "Switch", safe: "feels safe",
        w1: "what if it's worse?", w1W: 116, w2: "hassle", w2W: 58,
        tot: n => (n === 1 ? "€12 a month" : n === 12 ? "€144 a year" : `€${12 * n}`), cost: "cost of not choosing",
        ask: "Which would you pick today?", askW: 178,
        caps: [
          "You've had the same phone plan for years. <b>€30</b> a month.",
          "A new plan with the same features costs <b>€18</b>.",
          "Switching would take just <b>ten minutes</b>.",
          "But staying feels <b>safe</b>, and changing feels <b>risky</b>.",
          "So you <b>stay</b>. Again. That's <b>€12 extra</b> every month.",
          "Over a year, that's <b>€144</b> for nothing.",
          "<b>The fix:</b> imagine choosing from scratch, today.",
          "Picked fresh, the answer is easy. <b>Switch.</b>"
        ],
        say: [
          "You've had the same phone plan for years. Thirty euros a month.",
          "A new plan with the same features costs eighteen euros.",
          "Switching would take just ten minutes.",
          "But staying feels safe, and changing feels risky.",
          "So you stay. Again. That's twelve euros extra, every month.",
          "Over a year, that's a hundred and forty-four euros, for nothing.",
          "The fix: imagine you're choosing from scratch, today.",
          "Picked fresh, the answer is easy. Switch.",
          "Status quo bias. Sticking with things feels safe, even when it costs you. Choose as if from scratch."
        ]
      },
      el: {
        name: "Μεροληψία του status quo", shareTitle: "Η μεροληψία του status quo σε 30 δευτερόλεπτα",
        ecline: "Το γνώριμο μοιάζει ασφαλές, ακόμα κι όταν σου κοστίζει. Διάλεγε σαν να ξεκινάς από το\u00a0μηδέν.",
        yours: "Το πρόγραμμά σου", newp: "Νέο πρόγραμμα", planA: "Πρόγραμμα Α", planB: "Πρόγραμμα Β", titleW: 100,
        pA: "30 €", pB: "18 €", per: "/μήνα", f1: "20 GB ίντερνετ", f2: "απεριόριστα λεπτά", same: "ίδια",
        years: n => `εδώ και ${n} ${n === 1 ? "χρόνο" : "χρόνια"}`, mins: "10 λεπτά", stay: "Μένω", sw: "Αλλάζω", safe: "ασφαλές",
        w1: "κι αν είναι χειρότερο;", w1W: 134, w2: "φασαρία", w2W: 64,
        tot: n => (n === 1 ? "12 € τον μήνα" : n === 12 ? "144 € τον χρόνο" : `${12 * n} €`), cost: "κόστος της αδράνειας",
        ask: "Ποιο θα διάλεγες σήμερα;", askW: 166,
        caps: [
          "Έχεις το ίδιο πρόγραμμα κινητού εδώ και χρόνια. <b>30 €</b> τον μήνα.",
          "Ένα νέο πρόγραμμα με τις ίδιες παροχές κοστίζει <b>18 €</b>.",
          "Για να αλλάξεις, αρκούν <b>δέκα λεπτά</b>.",
          "Όμως το να μείνεις σου φαίνεται <b>ασφαλές</b> και η αλλαγή <b>ρίσκο</b>.",
          "Έτσι <b>μένεις</b>. Ξανά. Και πληρώνεις <b>12 € παραπάνω</b> κάθε μήνα.",
          "Σε έναν χρόνο, αυτά γίνονται <b>144 €</b> για το τίποτα.",
          "<b>Η λύση:</b> φαντάσου ότι διαλέγεις σήμερα, από το μηδέν.",
          "Αν διαλέξεις από την αρχή, η\u00a0απάντηση είναι απλή: <b>αλλάζεις</b>."
        ],
        say: [
          "Έχεις το ίδιο πρόγραμμα κινητού εδώ και χρόνια. Τριάντα ευρώ τον μήνα.",
          "Ένα νέο πρόγραμμα με τις ίδιες παροχές κοστίζει δεκαοχτώ ευρώ.",
          "Για να αλλάξεις, αρκούν δέκα λεπτά.",
          "Όμως το να μείνεις σου φαίνεται ασφαλές, και η αλλαγή ρίσκο.",
          "Έτσι μένεις. Ξανά. Και πληρώνεις δώδεκα ευρώ παραπάνω κάθε μήνα.",
          "Σε έναν χρόνο, αυτά γίνονται εκατόν σαράντα τέσσερα ευρώ, για το τίποτα.",
          "Η λύση: φαντάσου ότι διαλέγεις σήμερα, από το μηδέν.",
          "Αν διαλέξεις από την αρχή, η απάντηση είναι απλή: αλλάζεις.",
          "Μεροληψία του status quo. Το γνώριμο μοιάζει ασφαλές, ακόμα κι όταν σου κοστίζει. Διάλεγε σαν να ξεκινάς από το μηδέν."
        ]
      },
      es: {
        name: "Sesgo del statu quo", shareTitle: "El sesgo del statu quo en 30 segundos",
        ecline: "Seguir igual parece seguro aunque te cueste dinero. Elige como si empezaras de cero.",
        yours: "Tu plan actual", newp: "Plan nuevo", planA: "Plan A", planB: "Plan B", titleW: 85,
        pA: "30 €", pB: "18 €", per: "/mes", f1: "20 GB de datos", f2: "llamadas ilimitadas", same: "igual",
        years: n => `desde hace ${n} ${n === 1 ? "año" : "años"}`, mins: "10 min", stay: "Me quedo", sw: "Cambio", safe: "parece seguro",
        w1: "¿y si es peor?", w1W: 116, w2: "papeleo", w2W: 68,
        tot: n => (n === 1 ? "12 € al mes" : n === 12 ? "144 € al año" : `${12 * n} €`), cost: "el costo de no elegir",
        ask: "¿Cuál elegirías hoy?", askW: 178,
        caps: [
          "Llevas años con el mismo plan de teléfono. <b>30 €</b> al mes.",
          "Un plan nuevo con lo mismo cuesta <b>18 €</b>.",
          "Cambiarte te llevaría solo <b>diez minutos</b>.",
          "Pero quedarte parece <b>seguro</b>, y cambiar parece <b>arriesgado</b>.",
          "Así que te <b>quedas</b>. Otra vez. Son <b>12 € de más</b> cada mes.",
          "En un año, son <b>144 €</b> a cambio de nada.",
          "<b>La solución:</b> imagina que eliges desde cero, hoy.",
          "Eligiendo de nuevo, la respuesta es fácil. <b>Cambia.</b>"
        ],
        say: [
          "Llevas años con el mismo plan de teléfono. Treinta euros al mes.",
          "Un plan nuevo con lo mismo cuesta dieciocho euros.",
          "Cambiarte te llevaría solo diez minutos.",
          "Pero quedarte parece seguro, y cambiar parece arriesgado.",
          "Así que te quedas. Otra vez. Son doce euros de más, cada mes.",
          "En un año, son ciento cuarenta y cuatro euros, a cambio de nada.",
          "La solución: imagina que eliges desde cero, hoy.",
          "Eligiendo de nuevo, la respuesta es fácil. Cambia.",
          "El sesgo del statu quo. Seguir igual parece seguro, aunque te cueste dinero. Elige como si empezaras de cero."
        ]
      },
      fr: {
        name: "Biais du statu quo", shareTitle: "Le biais du statu quo en 30 secondes",
        ecline: "Rester comme on est semble sûr, même quand ça coûte. Choisissez comme si vous partiez de zéro.",
        yours: "Votre forfait", newp: "Nouveau forfait", planA: "Forfait A", planB: "Forfait B", titleW: 75,
        pA: "30 €", pB: "18 €", per: "/mois", f1: "20 Go de données", f2: "appels illimités", same: "identique",
        years: n => `depuis ${n} an${n > 1 ? "s" : ""}`, mins: "10 min", stay: "Rester", sw: "Changer", safe: "rassurant",
        w1: "et si c’était pire ?", w1W: 116, w2: "tracas", w2W: 58,
        tot: n => (n === 1 ? "12 € par mois" : n === 12 ? "144 € par an" : `${12 * n} €`), cost: "le coût de ne pas choisir",
        ask: "Lequel choisiriez-vous aujourd’hui ?", askW: 216,
        caps: [
          "Vous avez le même forfait mobile depuis des années. <b>30 €</b> par mois.",
          "Un nouveau forfait avec les mêmes services coûte <b>18 €</b>.",
          "Changer ne prendrait que <b>dix minutes</b>.",
          "Mais rester semble <b>sûr</b>, et changer semble <b>risqué</b>.",
          "Alors vous <b>restez</b>. Encore. Soit <b>12 € de plus</b> chaque mois.",
          "Sur un an, ça fait <b>144 €</b> pour rien.",
          "<b>La solution :</b> imaginez que vous choisissez de zéro, aujourd’hui.",
          "En repartant de zéro, la réponse est simple. <b>Changez.</b>"
        ],
        say: [
          "Vous avez le même forfait mobile depuis des années. Trente euros par mois.",
          "Un nouveau forfait avec les mêmes services coûte dix-huit euros.",
          "Changer ne prendrait que dix minutes.",
          "Mais rester semble sûr, et changer semble risqué.",
          "Alors vous restez. Encore. Soit douze euros de plus, chaque mois.",
          "Sur un an, ça fait cent quarante-quatre euros, pour rien.",
          "La solution : imaginez que vous choisissez de zéro, aujourd’hui.",
          "En repartant de zéro, la réponse est simple. Changez.",
          "Le biais du statu quo. Rester comme on est semble sûr, même quand ça coûte. Choisissez comme si vous partiez de zéro."
        ]
      },
      de: {
        name: "Status-quo-Verzerrung", shareTitle: "Die Status-quo-Verzerrung in 30 Sekunden",
        ecline: "Beim Alten zu bleiben fühlt sich sicher an, auch wenn es dich etwas kostet. Entscheide, als würdest du ganz neu wählen.",
        yours: "Dein Tarif", newp: "Neuer Tarif", planA: "Tarif A", planB: "Tarif B", titleW: 58,
        pA: "30 €", pB: "18 €", per: "/Monat", f1: "20 GB Daten", f2: "unbegrenzt telefonieren", same: "gleich",
        years: n => `seit ${n} ${n === 1 ? "Jahr" : "Jahren"}`, mins: "10 Min.", stay: "Bleiben", sw: "Wechseln", safe: "wirkt sicher",
        w1: "Wenn’s schlechter ist?", w1W: 140, w2: "Aufwand", w2W: 72,
        tot: n => (n === 1 ? "12 € im Monat" : n === 12 ? "144 € im Jahr" : `${12 * n} €`), cost: "Preis fürs Nichtstun",
        ask: "Welchen nimmst du heute?", askW: 178,
        caps: [
          "Du hast seit Jahren denselben Handytarif. <b>30 €</b> im Monat.",
          "Ein neuer Tarif mit denselben Leistungen kostet <b>18 €</b>.",
          "Der Wechsel würde nur <b>zehn Minuten</b> dauern.",
          "Aber Bleiben fühlt sich <b>sicher</b> an, Wechseln <b>riskant</b>.",
          "Also <b>bleibst</b> du. Wieder. Das sind <b>12 € mehr</b>, jeden Monat.",
          "Aufs Jahr gerechnet sind das <b>144 €</b> für nichts.",
          "<b>Die Lösung:</b> Stell dir vor, du wählst heute ganz neu.",
          "Wählst du neu, ist die Antwort leicht. <b>Wechsle.</b>"
        ],
        say: [
          "Du hast seit Jahren denselben Handytarif. Dreißig Euro im Monat.",
          "Ein neuer Tarif mit denselben Leistungen kostet achtzehn Euro.",
          "Der Wechsel würde nur zehn Minuten dauern.",
          "Aber Bleiben fühlt sich sicher an, Wechseln riskant.",
          "Also bleibst du. Wieder. Das sind zwölf Euro mehr, jeden Monat.",
          "Aufs Jahr gerechnet sind das hundertvierundvierzig Euro, für nichts.",
          "Die Lösung: Stell dir vor, du wählst heute ganz neu.",
          "Wählst du neu, ist die Antwort leicht. Wechsle.",
          "Die Status-quo-Verzerrung. Beim Alten zu bleiben fühlt sich sicher an, auch wenn es dich etwas kostet. Entscheide, als würdest du ganz neu wählen."
        ]
      },
      it: {
        name: "Bias dello status quo", shareTitle: "Il bias dello status quo in 30 secondi",
        ecline: "Restare fermi sembra sicuro, anche quando ti costa. Scegli come se partissi da zero.",
        yours: "La tua tariffa", newp: "Nuova tariffa", planA: "Tariffa A", planB: "Tariffa B", titleW: 79,
        pA: "30 €", pB: "18 €", per: "/mese", f1: "20 GB di dati", f2: "chiamate illimitate", same: "uguali",
        years: n => `da ${n} ${n === 1 ? "anno" : "anni"}`, mins: "10 min", stay: "Restare", sw: "Cambiare", safe: "sembra sicuro",
        w1: "e se fosse peggio?", w1W: 119, w2: "seccature", w2W: 89,
        tot: n => (n === 1 ? "12 € al mese" : n === 12 ? "144 € all’anno" : `${12 * n} €`), cost: "costo del non scegliere",
        ask: "Quale sceglieresti oggi?", askW: 178,
        caps: [
          "Hai la stessa tariffa telefonica da anni. <b>30 €</b> al mese.",
          "Una nuova tariffa con gli stessi servizi costa <b>18 €</b>.",
          "Per cambiare basterebbero <b>dieci minuti</b>.",
          "Ma restare sembra <b>sicuro</b>, e cambiare sembra <b>rischioso</b>.",
          "Così <b>resti</b>. Di nuovo. Sono <b>12 € in più</b> ogni mese.",
          "In un anno fanno <b>144 €</b> buttati.",
          "<b>La soluzione:</b> immagina di scegliere da zero, oggi.",
          "Scegliendo da capo, la risposta è facile. <b>Cambia.</b>"
        ],
        say: [
          "Hai la stessa tariffa telefonica da anni. Trenta euro al mese.",
          "Una nuova tariffa con gli stessi servizi costa diciotto euro.",
          "Per cambiare basterebbero dieci minuti.",
          "Ma restare sembra sicuro, e cambiare sembra rischioso.",
          "Così resti. Di nuovo. Sono dodici euro in più, ogni mese.",
          "In un anno fanno centoquarantaquattro euro, buttati.",
          "La soluzione: immagina di scegliere da zero, oggi.",
          "Scegliendo da capo, la risposta è facile. Cambia.",
          "Il bias dello status quo. Restare fermi sembra sicuro, anche quando ti costa. Scegli come se partissi da zero."
        ]
      }
    },
    svg(T) {
      const card = s => {
        const a = s === "A", x0 = a ? AX : BX, tw = T.titleW;
        const price = (cls, key) => `<text data-k="${key}" x="12" y="47"><tspan class="sq-pr ${cls}">${a ? T.pA : T.pB}</tspan><tspan class="sq-un" dx="3">${T.per}</tspan></text>`;
        return `<g data-k="card${s}"><g transform="translate(${x0} ${CT})">
          <rect class="sq-card" width="${CW}" height="${CH}" rx="9"/>
          ${a ? "" : `<rect class="sq-card ok" data-k="okB" width="${CW}" height="${CH}" rx="9"/>`}
          <text class="sq-ti" data-k="ti${s}" x="12" y="19">${a ? T.yours : T.newp}</text>
          <text class="sq-ti" data-k="tn${s}" x="12" y="19">${a ? T.planA : T.planB}</text>
          ${a ? `<path class="sq-scr" data-k="scr" pathLength="1" stroke-dasharray="1 1" d="M9 15 L${14 + tw} 11 L11 19 L${16 + tw} 15"/>` : ""}
          ${price(a ? "" : "new", "pr" + s)}${a ? "" : price("ok", "prOk")}
          <text class="sq-ft" x="12" y="64">${T.f1}</text><text class="sq-ft" x="12" y="76">${T.f2}</text>
          <g data-k="hi${s}"><text class="sq-ft hi" x="12" y="64">${T.f1}</text><text class="sq-ft hi" x="12" y="76">${T.f2}</text></g>
        </g></g>`;
      };
      const coin = `<path class="sq-coin" d="M-17 0 V5 A17 4.5 0 0 0 17 5 V0"/><ellipse class="sq-coin" rx="17" ry="4.5"/>`;
      let coins = "";
      for (let i = 0; i < 12; i++) coins += `<g data-k="c${i}">${coin}</g>`;
      const block = (w, y, txt) => `<g class="sq-w"><rect x="${DX - w / 2}" y="${y}" width="${w}" height="22" rx="4"/><text x="${DX}" y="${y + 15}">${txt}</text></g>`;
      return `
        ${card("A")}${card("B")}
        <g class="sq-eq" data-k="eq"><line x1="191" x2="209" y1="74" y2="74"/><line x1="191" x2="209" y1="80" y2="80"/>
          <text class="sq-note q" x="200" y="94">${T.same}</text></g>
        <text class="sq-note" data-k="ten" x="${AX + CW / 2}" y="110"></text>
        <g class="sq-ask" data-k="ask"><rect x="${200 - T.askW / 2}" y="106" width="${T.askW}" height="23" rx="11.5"/><text x="200" y="121.5">${T.ask}</text></g>
        <g data-k="chkB"><g class="sq-chk"><circle r="10"/><path d="M-4.5 0.5 L-1.2 3.8 L4.8 -3"/></g></g>
        <g data-k="bot">
          <line class="sq-floor" x1="16" y1="${FLOOR}" x2="384" y2="${FLOOR}"/>
          <g data-k="chair">
            <path class="sq-ln" d="M${CX - 34} 212 V178 Q${CX - 34} 164 ${CX - 20} 164 H${CX + 20} Q${CX + 34} 164 ${CX + 34} 178 V212 Z"/>
            <rect class="sq-ln" x="${CX - 30}" y="206" width="60" height="18" rx="4"/>
            <rect class="sq-ln" x="${CX - 30}" y="224" width="60" height="12" rx="2"/>
            <rect class="sq-ln" x="${CX - 46}" y="190" width="18" height="46" rx="8"/>
            <rect class="sq-ln" x="${CX + 28}" y="190" width="18" height="46" rx="8"/>
            <path class="sq-st" d="M${CX - 40} 236 V${FLOOR} M${CX + 40} 236 V${FLOOR}"/>
          </g>
          <g data-k="sit">
            <path class="sq-ln" d="M${CX - 14} 220 V207 C${CX - 14} 199 ${CX - 8} 195 ${CX} 195 C${CX + 8} 195 ${CX + 14} 199 ${CX + 14} 207 V220 Z"/>
            <path class="sq-st" d="M${CX - 7} 220 V242 H${CX - 12} M${CX + 7} 220 V242 H${CX + 12}"/>
            <circle class="sq-ln" cx="${CX}" cy="183" r="9.5"/>
            <circle class="sq-eye" cx="${CX - 3.5}" cy="181.5" r="1.4"/><circle class="sq-eye" cx="${CX + 3.5}" cy="181.5" r="1.4"/>
            <path class="sq-st" data-k="mSit" d=""/>
          </g>
          <text class="sq-note q" data-k="safe" x="${CX}" y="155">${T.safe}</text>
          <text class="sq-lab" data-k="stl" x="${CX}" y="261">${T.stay}</text>
          <g data-k="door">
            <rect class="sq-way" data-k="way" x="${DL}" y="${DT}" width="${DW}" height="${FLOOR - DT}"/>
            <g data-k="leaf"><rect class="sq-leaf" x="${DL}" y="${DT}" width="${DW}" height="${FLOOR - DT}"/>
              <rect class="sq-pan" x="${DL + 8}" y="${DT + 10}" width="${DW - 16}" height="30" rx="2"/><rect class="sq-pan" x="${DL + 8}" y="${DT + 50}" width="${DW - 16}" height="34" rx="2"/>
              <circle class="sq-knob" cx="${DL + DW - 8}" cy="${DT + 46}" r="2.6"/></g>
            <path class="sq-frame" d="M${DL - 4} ${FLOOR} V${DT - 4} H${DL + DW + 4} V${FLOOR}"/>
            <path class="sq-frame ok" data-k="frOk" d="M${DL - 4} ${FLOOR} V${DT - 4} H${DL + DW + 4} V${FLOOR}"/>
            <text class="sq-lab" data-k="swl" x="${DX}" y="261">${T.sw}</text>
            <text class="sq-lab ok" data-k="swOk" x="${DX}" y="261">${T.sw}</text>
          </g>
          <g data-k="timer"><g class="sq-tm"><circle cx="${DX - 26}" cy="122" r="7"/><path d="M${DX - 26} 115 V112 M${DX - 29} 111.5 H${DX - 23} M${DX - 26} 122 V118 M${DX - 26} 122 L${DX - 23} 123.5"/>
            <text x="${DX - 15}" y="126">${T.mins}</text></g></g>
          ${coins}
          <text class="sq-note" data-k="cost" x="${PX}" y="144">${T.cost}</text>
          <text class="sq-tot" data-k="tot" x="${PX}" y="157"></text>
          <g data-k="w1">${block(T.w1W, 222, T.w1)}</g>
          <g data-k="w2"><g transform="rotate(-4 ${DX} 211)">${block(T.w2W, 200, T.w2)}</g></g>
          <g data-k="walk">
            <path class="sq-ln" d="M-14 211 V195 C-14 187 -8 183 0 183 C8 183 14 187 14 195 V211 Z"/>
            <path class="sq-st" d="M-6 211 V243 H-10 M6 211 V243 H10"/>
            <circle class="sq-ln" cx="0" cy="171" r="9.5"/>
            <circle class="sq-eye" cx="-3.5" cy="169.5" r="1.4"/><circle class="sq-eye" cx="3.5" cy="169.5" r="1.4"/>
            <path class="sq-st" data-k="mWalk" d=""/>
          </g>
        </g>`;
    },
    S0: { cardA: 0, chair: 0, ten: 0, years: 1, cardB: 0, same: 0, door: 0, timer: 0, safe: 0, smile: .4, w1: 0, w2: 0,
      rise: 0, coins: 0, cost: 0, dim: 0, wipe: 0, relabel: 0, ask: 0, pick: 0, chk: 0, clear: 0, open: 0, stand: 0, walk: 0, win: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const tr = (key, x, y, extra) => k(key).setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})${extra || ""}`);
      // the two plan cards
      op("cardA", S.cardA * (1 - .55 * S.pick)); tr("cardA", 0, -8 * (1 - S.cardA));
      op("cardB", S.cardB); tr("cardB", 26 * (1 - S.cardB), 0);
      op("hiA", S.same); op("hiB", S.same); op("eq", S.same);
      // years on the same plan, counting up
      k("ten").textContent = T.years(Math.max(1, Math.min(5, Math.round(S.years))));
      op("ten", S.ten * (1 - S.wipe));
      // the fix: cross out "your plan", both become plain options
      k("scr").style.strokeDashoffset = (1 - S.wipe).toFixed(3);
      op("scr", S.wipe > 0 ? 1 - S.relabel : 0);
      op("tiA", 1 - S.relabel); op("tnA", S.relabel); op("tiB", 1 - S.relabel); op("tnB", S.relabel);
      const as = .8 + .2 * S.ask;
      k("ask").setAttribute("transform", `translate(200 117) scale(${as.toFixed(3)}) translate(-200 -117)`); op("ask", S.ask);
      op("okB", S.pick); op("prOk", S.pick); op("prB", 1 - S.pick);
      tr("chkB", BX + 128, CT + 42, ` scale(${Math.max(0, S.chk).toFixed(3)})`); op("chkB", S.chk * 2);
      // everything below the cards dims while you choose afresh
      op("bot", 1 - .82 * S.dim);
      op("chair", S.chair);
      // you, sitting: half get up, then sink back
      tr("sit", 5 * S.rise, -9 * S.rise); op("sit", S.chair * (1 - S.stand));
      k("mSit").setAttribute("d", `M${CX - 4} 187 Q${CX} ${(187 + 3.2 * S.smile).toFixed(2)} ${CX + 4} 187`);
      op("safe", S.safe * (1 - S.relabel)); op("stl", S.safe * (1 - .5 * S.win));
      // the door, its timer, and the worries piled in front of it
      op("door", S.door);
      k("leaf").setAttribute("transform", `translate(${DL} 0) scale(${(1 - .8 * S.open).toFixed(3)} 1) translate(${-DL} 0)`);
      op("way", S.open); op("frOk", S.win); op("swOk", S.win); op("swl", 1 - S.win);
      const ts = .7 + .3 * S.timer;
      k("timer").setAttribute("transform", `translate(${DX - 26} 122) scale(${ts.toFixed(3)}) translate(${-(DX - 26)} -122)`); op("timer", S.timer * 1.5 * (1 - S.dim));
      for (const w of ["w1", "w2"]) { tr(w, 0, -34 * (1 - S[w]) - 10 * S.clear); op(w, (S[w] > 0 ? cl(S[w] * 4) : 0) * (1 - S.clear)); }
      // €12 a month, piling up
      let n = 0;
      for (let i = 0; i < 12; i++) {
        const p = cl(S.coins - i);
        if (S.coins - i >= .55) n = i + 1;
        tr("c" + i, PX, coinY(i) - 22 * (1 - bounce(p)));
        op("c" + i, (p > 0 ? cl(p * 5) : 0) * (1 - S.clear));
      }
      k("tot").textContent = n ? T.tot(n) : "";
      k("tot").setAttribute("y", (221 - 5.5 * (Math.max(1, Math.min(12, S.coins)) - 1)).toFixed(2));   // rides just above the pile
      op("tot", (n ? 1 : 0) * (1 - S.dim) * (1 - S.clear));
      op("cost", S.cost * (1 - S.dim) * (1 - S.clear));
      // you get up and walk through the open door
      const wx = CX + (DX - CX) * S.walk, bob = -2.2 * Math.abs(Math.sin(S.walk * Math.PI * 5));
      tr("walk", wx, bob); op("walk", S.stand);
      k("mWalk").setAttribute("d", `M-4 175 Q0 ${(175 + 3.4 * (.4 + .6 * S.win)).toFixed(2)} 4 175`);
    },
    beats: [
      { steps: [{ to: { cardA: 1 }, ms: 500, ease: "back", sfx: "pluck" }, { to: { chair: 1 }, ms: 500 },
        { to: { ten: 1 }, ms: 250 }, { to: { years: 5 }, ms: 1200, ease: "lin" }] },
      { steps: [{ to: { cardB: 1 }, ms: 550, ease: "back", sfx: "pop" }, { wait: 300 }, { to: { same: 1 }, ms: 500 }] },
      { steps: [{ to: { door: 1 }, ms: 500 }, { to: { timer: 1 }, ms: 400, ease: "back", sfx: "tick" }] },
      { steps: [{ to: { safe: 1, smile: 1 }, ms: 500 }, { wait: 300 },
        { to: { w1: 1 }, ms: 700, ease: "bounce", sfx: "thud", sfxAt: 250 }, { to: { w2: 1 }, ms: 650, ease: "bounce" }] },
      { steps: [{ to: { rise: 1 }, ms: 550, ease: "inOut" }, { wait: 200 }, { to: { rise: 0 }, ms: 650, ease: "back", sfx: "spring" },
        { to: { coins: 1 }, ms: 600, ease: "lin" }] },
      { steps: [{ to: { coins: 12 }, ms: 2400, ease: "lin", sfx: "tick" }, { to: { cost: 1 }, ms: 400 }] },
      { steps: [{ to: { dim: 1 }, ms: 500 }, { to: { wipe: 1 }, ms: 700, sfx: "scribble" }, { to: { relabel: 1 }, ms: 450 },
        { to: { ask: 1 }, ms: 450, ease: "back" }] },
      { steps: [{ to: { ask: 0, pick: 1 }, ms: 450 }, { to: { chk: 1 }, ms: 400, ease: "back", sfx: "pop" }, { to: { clear: 1 } },
        { to: { dim: 0, open: 1 }, ms: 550 }, { to: { stand: 1 }, ms: 300 }, { to: { walk: 1 }, ms: 1300, ease: "inOut" },
        { to: { win: 1 }, ms: 450, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
