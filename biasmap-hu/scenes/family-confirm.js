/* Family "Confirms beliefs": a filter sits in front of what you believe. Facts rain down, the ones that
   fit drop through into the jar, the rest slide off into a heap you never look at. Three of its biases
   feed the same filter, then the fix: go looking in the heap. Scene for anim.js. */
(function () {
  const KEY = "family-confirm", P = `.bp[data-scene="${KEY}"]`;
  const f1 = n => +n.toFixed(1);
  const clamp = v => Math.max(0, Math.min(1, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const eIn = p => p * p, eOut = p => 1 - (1 - p) * (1 - p);
  // the filter: a grate sloping down to the right, so what doesn't fit slides off its end
  const F0 = [80, 96], F1 = [286, 126];
  const FL = Math.hypot(F1[0] - F0[0], F1[1] - F0[1]), ANG = Math.atan2(F1[1] - F0[1], F1[0] - F0[0]) * 180 / Math.PI;
  const fy = x => F0[1] + (x - F0[0]) * (F1[1] - F0[1]) / (F1[0] - F0[0]);
  const XE = F1[0] + 4;                                             // where things leave the filter
  // the jar: what you believe
  const JX = 160, JL = 88, JR = 232, JT = 150, JB = 234;
  const R = 8, PH = 10;                                             // a fact as a small token; half a labelled fact's height
  const ROW = (r, i) => [(r % 2 ? 115 : 106) + 18 * i, 223 - 15.6 * r]; // the pile: rows of 7 and 6, nested
  const PILL_Y = 189;                                               // a labelled fact resting on the pile
  const BACK = [0, 1, 2, 4, 5, 6];                                  // where the misfits end up, on the top row
  // the heap beside it: what you never look at
  const HEAP = [[316, 242], [333, 242], [350, 242]];                // three plain misfits
  const HP = [[334, 223], [338, 203], [336, 183]], HROT = [-3, 2, -2]; // the three labelled misfits, stacked
  const HLX = 334, HLY = 261;                                       // "unseen"
  // the rain: [x, y, fits?, target] where target is a jar slot (fits) or a heap place (doesn't)
  const CLOUD = [[114, 24, 1, 0], [150, 30, 0, 0], [188, 22, 1, 4], [226, 28, 0, 1],
    [132, 56, 1, 1], [170, 52, 1, 2], [208, 58, 1, 5], [246, 54, 0, 2]];
  const BX = 226, BW = 164, BY = 10;                                // family-member badge, and later the note
  const MX = 268;                                                   // the magnifier's track
  const CK = [226, 240];                                            // the "proven" check on the card

  // a fact falling straight through the filter into the jar
  const fall = (p, x0, y0, x1, y1) => [x0 + (x1 - x0) * p, y0 + (y1 - y0) * eIn(p)];
  // a fact that doesn't fit: lands on the filter, slides off its end, drops onto the heap
  const slide = (p, x0, y0, x1, y1, h, rot) => {
    const top = x => fy(x) - 5 - h;
    if (p <= .3) { const a = seg(p, 0, .3); return [x0, y0 + (top(x0) - y0) * eIn(a), ANG * seg(p, .22, .3)]; }
    if (p <= .68) { const b = eIn(seg(p, .3, .68)), x = x0 + (XE - x0) * b; return [x, top(x), ANG]; }
    const c = seg(p, .68, 1), ye = top(XE);
    return [XE + (x1 - XE) * eOut(c), ye + (y1 - ye) * eIn(c), ANG + (rot - ANG) * c];
  };
  // back into the jar at the end, arcing over and dropping through the opened filter
  const arc = (p, x0, y0, x1, y1) => {
    const cx = x1 + 10, cy = -20, u = 1 - p;
    return [u * u * x0 + 2 * u * p * cx + p * p * x1, u * u * y0 + 2 * u * p * cy + p * p * y1];
  };

  const dot = (key, fits, red) => `<g data-k="${key}"><circle class="fc-dot ${fits ? "p" : "n"}" r="${R}"/>` +
    `<path class="fc-sg ${fits ? "p" : "n"}" d="M-4 0 H4${fits ? " M0 -4 V4" : ""}"/>` +
    (red ? `<circle class="fc-rd" data-k="${key}r" r="${R}"/>` : "") + `</g>`;
  // a labelled fact: body (pill) and the dot it shrinks into; kind p = fits, n = doesn't, e = unopened envelope
  const pill = (key, kind, text, w) => {
    const x = -w / 2, icon = kind === "e"
      ? `<rect class="fc-env" x="${x + 5.5}" y="-5" width="13" height="10" rx="1.5"/><path class="fc-env" d="M${x + 6} -4.5 L${x + 12} .6 L${x + 18} -4.5"/>`
      : `<circle class="fc-sgc ${kind}" cx="${x + 11}" r="6"/><path class="fc-sg ${kind}" d="M${x + 8} 0 H${x + 14}${kind === "p" ? ` M${x + 11} -3 V3` : ""}"/>`;
    return `<g data-k="${key}"><g data-k="${key}b"><rect class="fc-pill ${kind}" x="${x}" y="${-PH}" width="${w}" height="${2 * PH}" rx="${PH}"/>${icon}` +
      `<text class="fc-pt" x="${x + 22}" y="3.8">${text}</text>` +
      (kind !== "p" ? `<rect class="fc-rd" data-k="${key}r" x="${x}" y="${-PH}" width="${w}" height="${2 * PH}" rx="${PH}"/>` : "") + `</g>` +
      dot(key + "d", kind === "p", false) + `</g>`;
  };

  window.BiasAnim.SCENES[KEY] = {
    q: "tmi", viewBox: "0 0 400 272",
    css: `
      ${P} .fc-jar{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fc-shine{fill:none;stroke:var(--faint);stroke-width:1.6;stroke-linecap:round}
      ${P} .fc-card rect{fill:var(--surface);stroke:var(--ink);stroke-width:1.5}
      ${P} .fc-card .ok{fill:none;stroke:var(--good);stroke-width:1.8}
      ${P} .fc-card text{font:600 11.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fc-fr{fill:none;stroke:var(--ink);stroke-width:2;stroke-linejoin:round}
      ${P} .fc-bar{fill:none;stroke:var(--muted);stroke-width:1.1;stroke-linecap:round}
      ${P} .fc-open{fill:none;stroke:var(--good);stroke-width:1.8;stroke-dasharray:3 4;stroke-linecap:round}
      ${P} .fc-lid{fill:var(--surface);stroke:var(--q);stroke-width:2}
      ${P} .fc-lidt{font:600 9px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .fc-fl{font:600 10px var(--mono);fill:var(--q);text-anchor:end}
      ${P} .fc-dot{fill:var(--surface);stroke-width:1.8}
      ${P} .fc-dot.p{stroke:var(--q)}
      ${P} .fc-dot.n{stroke:var(--muted)}
      ${P} .fc-sg{fill:none;stroke-width:1.8;stroke-linecap:round}
      ${P} .fc-sg.p{stroke:var(--q)}
      ${P} .fc-sg.n{stroke:var(--ink)}
      ${P} .fc-sgc{fill:none;stroke-width:1.4}
      ${P} .fc-sgc.p{stroke:var(--q)}
      ${P} .fc-sgc.n{stroke:var(--ink)}
      ${P} .fc-pill{fill:var(--surface);stroke-width:1.6}
      ${P} .fc-pill.p{stroke:var(--q)}
      ${P} .fc-pill.n,${P} .fc-pill.e{stroke:var(--muted)}
      ${P} .fc-pt{font:600 10.5px var(--display);fill:var(--ink)}
      ${P} .fc-env{fill:none;stroke:var(--ink);stroke-width:1.4;stroke-linejoin:round;stroke-linecap:round}
      ${P} .fc-rd{fill:none;stroke:var(--bad);stroke-width:2}
      ${P} .fc-heap{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .fc-heap.bad{fill:var(--bad)}
      ${P} .fc-badge rect{fill:var(--surface);stroke:var(--q);stroke-width:1.6}
      ${P} .fc-badge .h{font:500 9px var(--mono);fill:var(--muted)}
      ${P} .fc-badge .n{font:600 12px var(--display);fill:var(--ink)}
      ${P} .fc-note .pa{fill:var(--surface);stroke:var(--ink);stroke-width:1.6;stroke-linejoin:round}
      ${P} .fc-note .h{font:500 9px var(--mono);fill:var(--muted)}
      ${P} .fc-note .l{font:600 11.5px var(--display);fill:var(--ink)}
      ${P} .fc-mag{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round}
      ${P} .fc-ck{fill:var(--q)}
      ${P} .fc-ck.ok{fill:var(--good)}
      ${P} .fc-ckm{fill:none;stroke:var(--ground);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    `,
    text: {
      hu: {
        name: "Megerősíti a hiedelmeket", shareTitle: "Miért azt látjuk, amit eleve hiszünk, 30 másodpercben",
        ecline: "Az elménk azt engedi be, ami egyetért veled, ezért keresd azt, ami nem.",
        bel: ["Amit hiszel", "„Tisztességesen játszunk”", "„Jól választottam”", "„A pénzzel rendben vagyunk”"],
        fits: "illik?", unseen: "nem látott", fam: "ebben a családban", lid: "nem keresed",
        bias: [["Szelektív észlelés"], ["Választást megerősítő torzítás"], ["Strucchatás"]],
        pills: [["Az ő szabálytalanságuk", 80], ["A mi szabálytalanságunk", 72], ["Jó kilátás", 84], ["Utcai zaj", 92], ["Számla", 52]],
        noteH: "mielőtt döntök:", note: ["Mi változtatná", "meg a véleményem?"],
        caps: [
          "Egész nap jönnek a tények. Egy része <b>illik</b> ahhoz, amit hiszel, egy része <b>nem</b>.",
          "Az agyad átengedi, ami illik. Ez <b>gyors</b>, és a világodat <b>stabilan</b> tartja.",
          "A meccsen <b>az ő szabálytalanságaikat</b> látod, a sajátodat nem.",
          "A lakás, amit választottál? A <b>kilátásra</b> emlékszel, nem a <b>zajra</b>.",
          "Egy számla, amitől fél? <b>Fel sem nyitod.</b>",
          "A véleményed <b>igazoltnak</b> tűnik, de a <b>figyelmeztetések</b> sosem jutottak át.",
          "<b>A megoldás:</b> kérdezd meg, mi változtatná meg a véleményedet, aztán <b>keresd is meg</b>.",
          "Mérlegeld, amit találsz. A véleményed <b>közelebb kerül az igazsághoz</b>."
        ],
        say: [
          "Egész nap jönnek a tények. Egy részük illik ahhoz, amit hiszel, egy része nem.",
          "Az agyad átengedi, ami illik. Gyors, és a világodat stabilan tartja.",
          "Szelektív észlelés. A meccsen az ő szabálytalanságaikat látod, a sajátodat nem.",
          "Választást megerősítő torzítás. A lakás, amit választottál? A kilátásra emlékszel, nem a zajra.",
          "Strucchatás. Egy számla, amitől félsz? Fel sem nyitod.",
          "A véleményed igazoltnak tűnik, de a figyelmeztetések sosem jutottak át.",
          "A megoldás: kérdezd meg, mi változtatná meg a véleményedet, aztán keresd is meg.",
          "Mérlegeld, amit találsz, és a véleményed közelebb kerül az igazsághoz.",
          "Azokat vonzzák a bizonyítékok, amelyek megerősítik a hiedelmeinket. Az elménk azt engedi be, ami egyetért veled, ezért keresd azt, ami nem."
        ]
      },
      en: {
        name: "Confirms beliefs", shareTitle: "Why we see what we already believe, in 30 seconds",
        ecline: "Your mind lets in what agrees with you, so go looking for what doesn't.",
        bel: ["What you believe", "“We play fair”", "“I chose well”", "“Money’s fine”"],
        fits: "fits?", unseen: "unseen", fam: "in this family", lid: "not looking",
        bias: [["Selective perception"], ["Choice-supportive bias"], ["Ostrich effect"]],
        pills: [["Their foul", 80], ["Our foul", 72], ["Great view", 84], ["Street noise", 92], ["Bill", 52]],
        noteH: "before I decide:", note: ["What would", "change my mind?"],
        caps: [
          "All day, facts pour in. Some <b>fit</b> what you believe, some <b>don't</b>.",
          "Your brain lets through what fits. It's <b>fast</b> and keeps your world <b>steady</b>.",
          "At a match, you spot <b>their fouls</b> and miss your own team's.",
          "The flat you picked? You recall <b>the view</b>, not <b>the noise</b>.",
          "A bill you're dreading? You <b>don't even open it</b>.",
          "Your view looks <b>proven</b>, but the <b>warnings</b> never got through.",
          "<b>The fix:</b> ask what would change your mind, then <b>go look for it</b>.",
          "Weigh what you find. Your view gets <b>closer to the truth</b>."
        ],
        say: [
          "All day, facts pour in. Some fit what you believe, some don't.",
          "Your brain lets through what fits. It's fast, and it keeps your world steady.",
          "Selective perception. At a match, you spot their fouls, and miss your own team's.",
          "Choice-supportive bias. The flat you picked? You recall the view, not the noise.",
          "The ostrich effect. A bill you're dreading? You don't even open it.",
          "Your view looks proven, but the warnings never got through.",
          "The fix: ask what would change your mind, then go look for it.",
          "Weigh what you find, and your view gets closer to the truth.",
          "We're drawn to what confirms our beliefs. Your mind lets in what agrees with you, so go looking for what doesn't."
        ]
      },
      el: {
        name: "Ό,τι μας επιβεβαιώνει", shareTitle: "Γιατί βλέπουμε ό,τι ήδη πιστεύουμε, σε 30 δευτερόλεπτα",
        ecline: "Το μυαλό σου κρατά ό,τι σου δίνει δίκιο, οπότε ψάξε επίτηδες κι ό,τι σε διαψεύδει.",
        bel: ["Όσα πιστεύεις", "«Παίζουμε τίμια»", "«Διάλεξα σωστά»", "«Τα λεφτά φτάνουν»"],
        fits: "ταιριάζει;", unseen: "απαρατήρητα", fam: "σε αυτή την οικογένεια", lid: "δεν κοιτάς",
        bias: [["Επιλεκτική αντίληψη"], ["Μεροληψία υπέρ", "της επιλογής"], ["Φαινόμενο της", "στρουθοκαμήλου"]],
        pills: [["Φάουλ τους", 84], ["Φάουλ μας", 78], ["Υπέροχη θέα", 90], ["Φασαρία", 70], ["Λογαριασμός", 96]],
        noteH: "πριν αποφασίσω:", note: ["Τι θα με έκανε", "να αλλάξω γνώμη;"],
        caps: [
          "Κάθε μέρα δέχεσαι ένα σωρό πληροφορίες. Άλλες <b>ταιριάζουν</b> με όσα πιστεύεις, άλλες <b>όχι</b>.",
          "Το μυαλό κρατά ό,τι ταιριάζει: <b>γλιτώνεις χρόνο</b> και ο κόσμος σου μένει <b>σταθερός</b>.",
          "Στο γήπεδο βλέπεις τα <b>φάουλ των αντιπάλων</b>, όχι της ομάδας σου.",
          "Το σπίτι που διάλεξες; Θυμάσαι <b>τη θέα</b>, όχι <b>τη φασαρία</b>.",
          "Έναν λογαριασμό που φοβάσαι; <b>Ούτε καν τον ανοίγεις.</b>",
          "Η άποψή σου μοιάζει <b>αποδεδειγμένη</b>, όμως οι <b>προειδοποιήσεις</b> δεν σε έφτασαν ποτέ.",
          "<b>Η λύση:</b> σκέψου τι θα σε έκανε να αλλάξεις γνώμη και <b>ψάξε να το βρεις</b>.",
          "Ζύγισε ό,τι βρεις. Η άποψή σου έρχεται <b>πιο κοντά στην αλήθεια</b>."
        ],
        say: [
          "Κάθε μέρα δέχεσαι ένα σωρό πληροφορίες. Άλλες ταιριάζουν με όσα πιστεύεις, άλλες όχι.",
          "Το μυαλό κρατά ό,τι ταιριάζει. Γλιτώνεις χρόνο, και ο κόσμος σου μένει σταθερός.",
          "Επιλεκτική αντίληψη. Στο γήπεδο βλέπεις τα φάουλ των αντιπάλων, όχι της ομάδας σου.",
          "Μεροληψία υπέρ της επιλογής. Το σπίτι που διάλεξες; Θυμάσαι τη θέα, όχι τη φασαρία.",
          "Φαινόμενο της στρουθοκαμήλου. Έναν λογαριασμό που φοβάσαι; Ούτε καν τον ανοίγεις.",
          "Η άποψή σου μοιάζει αποδεδειγμένη, όμως οι προειδοποιήσεις δεν σε έφτασαν ποτέ.",
          "Η λύση: σκέψου τι θα σε έκανε να αλλάξεις γνώμη και ψάξε να το βρεις.",
          "Ζύγισε ό,τι βρεις, και η άποψή σου θα έρθει πιο κοντά στην αλήθεια.",
          "Μας τραβάει ό,τι επιβεβαιώνει όσα ήδη πιστεύουμε. Το μυαλό σου κρατά ό,τι σου δίνει δίκιο, οπότε ψάξε επίτηδες κι ό,τι σε διαψεύδει."
        ]
      },
      es: {
        name: "Confirma creencias", shareTitle: "Por qué vemos lo que ya creemos, en 30 segundos",
        ecline: "Tu mente deja entrar lo que te da la razón, así que busca lo que no.",
        bel: ["Lo que crees", "«Jugamos limpio»", "«Elegí bien»", "«El dinero va bien»"],
        fits: "¿encaja?", unseen: "sin ver", fam: "en esta familia", lid: "sin mirar",
        bias: [["Percepción selectiva"], ["Sesgo de apoyo", "a la elección"], ["Efecto avestruz"]],
        pills: [["Falta rival", 88], ["Falta tuya", 90], ["Buenas vistas", 109], ["Mucho ruido", 92], ["Factura", 91]],
        noteH: "antes de decidir:", note: ["¿Qué me haría", "cambiar de idea?"],
        caps: [
          "Todo el día te llegan datos. Unos <b>encajan</b> con lo que crees y otros <b>no</b>.",
          "Tu cerebro deja pasar lo que encaja. Es <b>rápido</b> y mantiene tu mundo <b>estable</b>.",
          "En un partido, ves <b>las faltas del rival</b> y no las de tu equipo.",
          "¿El apartamento que elegiste? Recuerdas <b>las vistas</b>, no <b>el ruido</b>.",
          "¿Una factura que temes? <b>Ni siquiera la abres</b>.",
          "Tu idea parece <b>demostrada</b>, pero las <b>advertencias</b> nunca pasaron.",
          "<b>La solución:</b> pregúntate qué te haría cambiar de idea y <b>ve a buscarlo</b>.",
          "Sopesa lo que encuentres. Tu idea se acerca <b>más a la verdad</b>."
        ],
        say: [
          "Todo el día te llegan datos. Unos encajan con lo que crees, y otros no.",
          "Tu cerebro deja pasar lo que encaja. Es rápido, y mantiene tu mundo estable.",
          "Percepción selectiva. En un partido, ves las faltas del rival, y no las de tu equipo.",
          "Sesgo de apoyo a la elección. ¿El apartamento que elegiste? Recuerdas las vistas, no el ruido.",
          "El efecto avestruz. ¿Una factura que temes? Ni siquiera la abres.",
          "Tu idea parece demostrada, pero las advertencias nunca pasaron.",
          "La solución: pregúntate qué te haría cambiar de idea, y ve a buscarlo.",
          "Sopesa lo que encuentres, y tu idea se acercará más a la verdad.",
          "Nos atrae lo que confirma nuestras creencias. Tu mente deja entrar lo que te da la razón, así que busca lo que no."
        ]
      },
      fr: {
        name: "Confirme nos idées", shareTitle: "Pourquoi on voit ce qu’on croit déjà, en 30 secondes",
        ecline: "Votre esprit laisse entrer ce qui vous donne raison, alors cherchez ce qui vous contredit.",
        bel: ["Ce que vous croyez", "« On joue fair-play »", "« J’ai bien choisi »", "« Côté argent, ça va »"],
        fits: "ça colle ?", unseen: "jamais vu", fam: "dans cette famille", lid: "on ne regarde pas",
        bias: [["Perception sélective"], ["Biais de soutien au choix"], ["Effet autruche"]],
        pills: [["Faute adverse", 106], ["Notre faute", 92], ["Belle vue", 84], ["Bruit de rue", 92], ["Facture", 78]],
        noteH: "avant de décider :", note: ["Qu’est-ce qui me", "ferait changer d’avis ?"],
        caps: [
          "Toute la journée, des faits arrivent. Certains <b>collent</b> à vos idées, d’autres <b>non</b>.",
          "Votre cerveau laisse passer ce qui colle. C’est <b>rapide</b> et ça garde votre monde <b>stable</b>.",
          "Pendant un match, vous voyez <b>leurs fautes</b> et ratez celles de votre équipe.",
          "L’appartement que vous avez choisi ? Vous retenez <b>la vue</b>, pas <b>le bruit</b>.",
          "Une facture qui vous inquiète ? Vous <b>ne l’ouvrez même pas</b>.",
          "Votre idée semble <b>prouvée</b>, mais les <b>alertes</b> ne sont jamais passées.",
          "<b>La solution :</b> demandez-vous ce qui vous ferait changer d’avis, puis <b>allez le chercher</b>.",
          "Pesez ce que vous trouvez. Votre idée <b>se rapproche du vrai</b>."
        ],
        say: [
          "Toute la journée, des faits arrivent. Certains collent à vos idées, d’autres non.",
          "Votre cerveau laisse passer ce qui colle. C’est rapide, et ça garde votre monde stable.",
          "La perception sélective. Pendant un match, vous voyez leurs fautes, et ratez celles de votre équipe.",
          "Le biais de soutien au choix. L’appartement que vous avez choisi ? Vous retenez la vue, pas le bruit.",
          "L’effet autruche. Une facture qui vous inquiète ? Vous ne l’ouvrez même pas.",
          "Votre idée semble prouvée, mais les alertes ne sont jamais passées.",
          "La solution : demandez-vous ce qui vous ferait changer d’avis, puis allez le chercher.",
          "Pesez ce que vous trouvez, et votre idée se rapproche de la vérité.",
          "Ce qui confirme nos idées nous attire. Votre esprit laisse entrer ce qui vous donne raison, alors cherchez ce qui vous contredit."
        ]
      },
      de: {
        name: "Was uns bestätigt", shareTitle: "Warum wir sehen, was wir schon glauben, in 30 Sekunden",
        ecline: "Dein Kopf lässt herein, was dir recht gibt, also such nach dem, was dir widerspricht.",
        bel: ["Was du glaubst", "„Wir spielen fair“", "„Gut gewählt“", "„Finanziell alles gut“"],
        fits: "passt?", unseen: "ungesehen", fam: "in dieser Familie", lid: "nicht hinsehen",
        bias: [["Selektive Wahrnehmung"], ["Wahlbestätigende", "Verzerrung"], ["Vogel-Strauß-Effekt"]],
        pills: [["Ihr Foul", 80], ["Unser Foul", 86], ["Tolle Aussicht", 101], ["Straßenlärm", 95], ["Rechnung", 88]],
        noteH: "bevor ich entscheide:", note: ["Was würde mich", "umstimmen?"],
        caps: [
          "Den ganzen Tag strömen Fakten herein. Manche <b>passen</b> zu dem, was du glaubst, manche <b>nicht</b>.",
          "Dein Gehirn lässt durch, was passt. Das geht <b>schnell</b> und hält deine Welt <b>stabil</b>.",
          "Beim Spiel siehst du <b>ihre Fouls</b> und übersiehst die deines Teams.",
          "Die Wohnung, die du gewählt hast? Du erinnerst dich an <b>die Aussicht</b>, nicht an <b>den Lärm</b>.",
          "Eine Rechnung, vor der dir graut? Du <b>öffnest sie gar nicht erst</b>.",
          "Deine Sicht wirkt <b>bewiesen</b>, aber die <b>Warnungen</b> kamen nie durch.",
          "<b>Die Lösung:</b> Frag dich, was dich umstimmen würde, und <b>such gezielt danach</b>.",
          "Wäge ab, was du findest. Deine Sicht kommt <b>der Wahrheit näher</b>."
        ],
        say: [
          "Den ganzen Tag strömen Fakten herein. Manche passen zu dem, was du glaubst, manche nicht.",
          "Dein Gehirn lässt durch, was passt. Das geht schnell, und es hält deine Welt stabil.",
          "Selektive Wahrnehmung. Beim Spiel siehst du ihre Fouls, und übersiehst die deines Teams.",
          "Wahlbestätigende Verzerrung. Die Wohnung, die du gewählt hast? Du erinnerst dich an die Aussicht, nicht an den Lärm.",
          "Der Vogel-Strauß-Effekt. Eine Rechnung, vor der dir graut? Du öffnest sie gar nicht erst.",
          "Deine Sicht wirkt bewiesen, aber die Warnungen kamen nie durch.",
          "Die Lösung: Frag dich, was dich umstimmen würde, und such gezielt danach.",
          "Wäge ab, was du findest, und deine Sicht kommt der Wahrheit näher.",
          "Uns zieht an, was unsere Überzeugungen bestätigt. Dein Kopf lässt herein, was dir recht gibt, also such nach dem, was dir widerspricht."
        ]
      },
      it: {
        name: "Conferma le idee", shareTitle: "Perché vediamo ciò in cui crediamo già, in 30 secondi",
        ecline: "La mente fa entrare ciò che ti dà ragione, quindi cerca ciò che ti smentisce.",
        bel: ["Ciò in cui credi", "«Giochiamo pulito»", "«Ho scelto bene»", "«I conti vanno bene»"],
        fits: "combacia?", unseen: "mai visti", fam: "in questa famiglia", lid: "non guardo",
        bias: [["Percezione selettiva"], ["Bias a favore della scelta"], ["Effetto struzzo"]],
        pills: [["Fallo loro", 80], ["Fallo nostro", 92], ["Bella vista", 84], ["Rumore", 92], ["Bolletta", 76]],
        noteH: "prima di decidere:", note: ["Cosa mi farebbe", "cambiare idea?"],
        caps: [
          "Tutto il giorno arrivano fatti. Alcuni <b>combaciano</b> con ciò che credi, altri <b>no</b>.",
          "Il cervello lascia passare ciò che combacia. È <b>veloce</b> e tiene il tuo mondo <b>stabile</b>.",
          "A una partita, noti <b>i loro falli</b> e non quelli della tua squadra.",
          "La casa che hai scelto? Ricordi <b>la vista</b>, non <b>il rumore</b>.",
          "Una bolletta che temi? <b>Non la apri nemmeno</b>.",
          "La tua idea sembra <b>dimostrata</b>, ma gli <b>avvertimenti</b> non sono mai passati.",
          "<b>La soluzione:</b> chiediti cosa ti farebbe cambiare idea, poi <b>vai a cercarlo</b>.",
          "Valuta ciò che trovi. La tua idea si fa <b>più vicina al vero</b>."
        ],
        say: [
          "Tutto il giorno arrivano fatti. Alcuni combaciano con ciò che credi, altri no.",
          "Il cervello lascia passare ciò che combacia. È veloce, e tiene il tuo mondo stabile.",
          "Percezione selettiva. A una partita, noti i loro falli, e non quelli della tua squadra.",
          "Bias a favore della scelta. La casa che hai scelto? Ricordi la vista, non il rumore.",
          "L’effetto struzzo. Una bolletta che temi? Non la apri nemmeno.",
          "La tua idea sembra dimostrata, ma gli avvertimenti non sono mai passati.",
          "La soluzione: chiediti cosa ti farebbe cambiare idea, poi vai a cercarlo.",
          "Valuta ciò che trovi, e la tua idea si avvicina al vero.",
          "Ci attira ciò che conferma le nostre idee. La mente fa entrare ciò che ti dà ragione, quindi cerca ciò che ti smentisce."
        ]
      }
    },
    svg(T) {
      // the grate, drawn along the slope
      const n = 17, st = FL / n;
      let mesh = "";
      for (let i = 0; i < n; i++) mesh += `M${f1(i * st)} -5 L${f1((i + 1) * st)} 5 M${f1((i + 1) * st)} -5 L${f1(i * st)} 5 `;
      const jar = `M${JL - 7} ${JT} H${JL} V${JB - 10} Q${JL} ${JB} ${JL + 10} ${JB} H${JR - 10} Q${JR} ${JB} ${JR} ${JB - 10} V${JT} H${JR + 7}`;
      const [pa, na, pb, nb, eb] = T.pills;
      const badge = (i) => {
        const lines = T.bias[i], h = 30 + 14 * lines.length;
        return `<g class="fc-badge" data-k="g${i}"><rect x="${BX}" y="${BY}" width="${BW}" height="${h}" rx="8"/>` +
          `<text class="h" x="${BX + 11}" y="${BY + 16}">${T.fam}</text>` +
          lines.map((s, j) => `<text class="n" x="${BX + 11}" y="${BY + 33 + 14 * j}">${s}</text>`).join("") + `</g>`;
      };
      return `
        <g data-k="jar"><path class="fc-jar" d="${jar}"/><path class="fc-shine" d="M${JL + 8} ${JT + 10} V${JT + 28}"/>
          ${[0, 1, 2, 3, 4, 5, 6].map(i => { const [x, y] = ROW(0, i); return dot("r" + i, true, false).replace("<g ", `<g transform="translate(${x} ${y})" `); }).join("")}
          <g class="fc-card"><rect x="${JX - 66}" y="240" width="132" height="20" rx="6"/><rect class="ok" data-k="cardok" x="${JX - 66}" y="240" width="132" height="20" rx="6"/>
            ${T.bel.map((s, i) => `<text data-k="b${i}" x="${JX}" y="254">${s}</text>`).join("")}</g></g>
        ${CLOUD.map(([, , fits], i) => fits ? dot("c" + i, true, false) : "").join("")}
        ${pill("p1", "p", pa[0], pa[1])}${pill("p2", "p", pb[0], pb[1])}
        <g data-k="filter"><g data-k="grate"><path class="fc-bar" d="${mesh}"/><rect class="fc-fr" x="0" y="-5" width="${f1(FL)}" height="10" rx="3"/></g>
          <rect class="fc-open" data-k="open" x="0" y="-5" width="${f1(FL)}" height="10" rx="3"/>
          <g data-k="lid"><rect class="fc-lid" x="-3" y="-20" width="${f1(FL + 6)}" height="15" rx="6"/><text class="fc-lidt" x="${f1(FL / 2)}" y="-9.3">${T.lid}</text></g></g>
        <text class="fc-fl" data-k="fl" x="${F0[0] - 7}" y="${F0[1] + 3.5}">${T.fits}</text>
        ${CLOUD.map(([, , fits], i) => fits ? "" : dot("c" + i, false, true)).join("")}
        ${pill("n1", "n", na[0], na[1])}${pill("n2", "n", nb[0], nb[1])}${pill("e3", "e", eb[0], eb[1])}
        <g data-k="hl"><text class="fc-heap" data-k="hl0" x="${HLX}" y="${HLY}">${T.unseen}</text><text class="fc-heap bad" data-k="hl1" x="${HLX}" y="${HLY}">${T.unseen}</text></g>
        <g data-k="chk" transform="translate(${CK[0]} ${CK[1]})"><circle class="fc-ck" r="7.5"/><circle class="fc-ck ok" data-k="chkok" r="7.5"/><path class="fc-ckm" d="M-3.4 .2 L-1 2.7 L3.6 -2.5"/></g>
        ${[0, 1, 2].map(badge).join("")}
        <g class="fc-note" data-k="note"><path class="pa" d="M${BX} ${BY} H${BX + BW - 12} L${BX + BW} ${BY + 12} V${BY + 54} H${BX} Z M${BX + BW - 12} ${BY} V${BY + 12} H${BX + BW}"/>
          <text class="h" x="${BX + 11}" y="${BY + 16}">${T.noteH}</text>
          ${T.note.map((s, j) => `<text class="l" x="${BX + 11}" y="${BY + 33 + 14 * j}">${s}</text>`).join("")}</g>
        <g class="fc-mag" data-k="mag"><circle r="9"/><path d="M-6.4 6.4 L-13 13"/></g>`;
    },
    S0: { jar: 0, a0: 0, a1: 0, a2: 0, a3: 0, a4: 0, a5: 0, a6: 0, a7: 0, filter: 0, drop: 0, fade: 0, hl: 0,
      b0: 1, b1: 0, b2: 0, b3: 0, g0: 0, g1: 0, g2: 0,
      p1: 0, n1: 0, u1: 0, m1: 0, p2: 0, n2: 0, u2: 0, m2: 0, lid: 0, e3: 0, u3: 0,
      chk: 0, warn: 0, note: 0, mag: 0, sweep: 0, open: 0, inflow: 0, ok: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = f1(v * 1000) / 1000; };
      const tr = (key, x, y, rot, s) => k(key).setAttribute("transform",
        `translate(${f1(x)} ${f1(y)})${rot ? ` rotate(${f1(rot)})` : ""}${s !== undefined && s !== 1 ? ` scale(${f1(s * 100) / 100})` : ""}`);
      // what you believe
      op("jar", S.jar);
      for (let i = 0; i < 4; i++) op("b" + i, S["b" + i]);
      op("cardok", S.ok);
      // the filter, and the lid you close over it
      k("filter").setAttribute("transform", `translate(${f1(F0[0] - 30 * (1 - S.filter))} ${F0[1]}) rotate(${f1(ANG)})`);
      op("filter", S.filter);
      op("grate", 1 - S.open); op("open", S.open);
      k("lid").setAttribute("transform", `translate(0 ${f1(-26 * (1 - S.lid))})`); op("lid", clamp(S.lid * 3));
      op("fl", S.filter * (1 - S.open));
      // where the misfits sit, and how they fly back in at the end
      const seenAt = y => clamp((S.sweep - (242 - y) / 59 * .8) * 5);        // the magnifier passes each one
      const inAt = i => clamp((S.inflow - i * .14) / .3);                      // six misfits, top of the heap first
      const back = (i, x, y) => { const q = inAt(i); return q > 0 ? arc(eIn(q) * .3 + q * .7, x, y, ...ROW(2, BACK[i])) : [x, y]; };
      // the rain, then the filter sorting it
      CLOUD.forEach(([x0, y0, fits, to], i) => {
        const a = S["a" + i], d = clamp((S.drop - i * .09) / .37);
        let x = x0, y = y0 - 22 * (1 - a), o = clamp(a * 2);
        if (fits) [x, y] = fall(d, x0, y0, ...ROW(1, to));
        else if (d > 0) {
          const [hx, hy] = HEAP[to];
          [x, y] = slide(d, x0, y0, hx, hy, R, 0);
          [x, y] = back(3 + to, x, y);
          o *= 1 - .6 * S.fade * (1 - S.warn);
          op(`c${i}r`, S.warn * (1 - seenAt(hy)));
        } else op(`c${i}r`, 0);
        tr("c" + i, x, y); op("c" + i, o);
      });
      // three labelled examples: the fitting one drops into the jar, then melts into the pile
      [["p1", "m1", 1], ["p2", "m2", 2]].forEach(([key, m, row]) => {
        const p = S[key], mm = S[m], [sx, sy] = ROW(row, 3);
        let [x, y] = fall(p, JX, -14, JX, PILL_Y);
        x += (sx - x) * mm; y += (sy - y) * mm;
        tr(key, x, y); op(key, clamp(p * 4));
        op(key + "b", 1 - mm); op(key + "d", mm);
      });
      // ...and the misfit slides off onto the heap, faded: you never look at it
      [["n1", "u1", 0, 2, 0], ["n2", "u2", 1, 1, 0], ["e3", "u3", 2, 0, 15]].forEach(([key, u, j, slot, lift]) => {
        const p = S[key], [hx, hy] = HP[j];
        let [x, y, rot] = slide(p, JX, -14, hx, hy, PH + lift, HROT[j]);
        const q = inAt(slot);
        if (q > 0) { [x, y] = back(slot, hx, hy); rot *= 1 - q; }
        tr(key, x, y, rot); op(key, clamp(p * 4) * (1 - .6 * S[u] * (1 - S.warn)));
        op(key + "r", S.warn * (1 - seenAt(hy)));
        const s = clamp(q * 4); op(key + "b", 1 - s); op(key + "d", s);
      });
      op("hl", S.hl * (1 - S.sweep)); op("hl0", 1 - S.warn); op("hl1", S.warn);
      // which bias of the family we're looking at
      for (let i = 0; i < 3; i++) { op("g" + i, S["g" + i]); tr("g" + i, 0, -6 * (1 - S["g" + i])); }
      // the check: looks proven, and later really does hold up
      tr("chk", CK[0], CK[1], 0, S.chk); op("chk", clamp(S.chk * 2)); op("chkok", S.ok);
      // the fix
      op("note", S.note); tr("note", 0, -6 * (1 - S.note));
      tr("mag", MX, 242 - 59 * S.sweep); op("mag", S.mag);
    },
    beats: [
      { steps: [{ to: { jar: 1 }, ms: 500, sfx: "pluck" }, { wait: 150 },
        ...[0, 1, 2, 3, 4, 5, 6, 7].flatMap(i => [{ to: { ["a" + i]: 1 }, ms: 240, ease: "back" }, { wait: 90 }])] },
      { steps: [{ to: { filter: 1 }, ms: 500, sfx: "whoosh" }, { wait: 250 }, { to: { drop: 1 }, ms: 2400, ease: "lin", sfx: "tick" },
        { to: { fade: 1, hl: 1 }, ms: 500 }] },
      { steps: [{ to: { g0: 1, b0: 0, b1: 1 }, ms: 450, sfx: "pop" }, { wait: 200 }, { to: { p1: 1 }, ms: 800, ease: "lin" }, { wait: 250 },
        { to: { n1: 1 }, ms: 1500, ease: "lin" }, { to: { u1: 1 }, ms: 400 }] },
      { steps: [{ to: { g0: 0, b1: 0 }, ms: 300 }, { to: { g1: 1, b2: 1 }, ms: 450, sfx: "pop" }, { to: { m1: 1 }, ms: 500, ease: "inOut" },
        { to: { p2: 1 }, ms: 800, ease: "lin" }, { wait: 250 }, { to: { n2: 1 }, ms: 1500, ease: "lin" }, { to: { u2: 1 }, ms: 400 }] },
      { steps: [{ to: { g1: 0, b2: 0 }, ms: 300 }, { to: { g2: 1, b3: 1 }, ms: 450 }, { to: { m2: 1 }, ms: 500, ease: "inOut" },
        { to: { lid: 1 }, ms: 700, ease: "bounce", sfx: "thud", sfxAt: 250 }, { to: { e3: 1 }, ms: 1500, ease: "lin" }, { to: { u3: 1 }, ms: 400 }] },
      { steps: [{ to: { g2: 0, b3: 0, lid: 0 }, ms: 400 }, { to: { b0: 1 }, ms: 300 }, { to: { chk: 1 }, ms: 400, ease: "back" }, { wait: 400 },
        { to: { warn: 1 }, ms: 600, sfx: "tick" }], hold: 3000 },
      { steps: [{ to: { note: 1 }, ms: 500, sfx: "scribble" }, { to: { mag: 1 }, ms: 300 }, { to: { sweep: 1 }, ms: 1500, ease: "inOut" }] },
      { steps: [{ to: { mag: 0, open: 1 }, ms: 500 }, { to: { inflow: 1 }, ms: 1800, ease: "lin" }, { to: { ok: 1 }, ms: 500, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
