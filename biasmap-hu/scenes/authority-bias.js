/* Authority bias: a sleep-supplement ad, the same words in a white coat and in a T-shirt, and a trust slider
   that follows the costume until you check the evidence. Scene for anim.js. */
(function () {
  const KEY = "authority-bias", P = `.bp[data-scene="${KEY}"]`;
  const TX = 14, TY = 12, TW = 190, TH = 156, TB = TY + TH;   // the TV screen
  const PX = 68, BX = 160;                                   // presenter and bottle centres (inside the TV)
  const YX = 340;                                            // you (right)
  const SY = 216, S0X = 36, S1X = 364;                        // trust slider: line y, left and right ends
  const SX = v => S0X + (S1X - S0X) * v / 100;               // trust 0..100 -> x
  const MID = 50, HIGH = 88, LOW = 20, EVID = 55;             // where the pins sit
  const QY = [37, 61, 85];                                   // checklist rows
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);

  // a pin standing on the slider at x = 0: stem, head, label to the left
  const pin = (key, cls, labels) => `<g class="ab-pin ${cls}" data-k="${key}"><line x1="0" x2="0" y1="${SY - 13}" y2="${SY}"/>
    <circle cy="${SY - 20}" r="7"/>${labels}</g>`;
  const lab = (key, text, cls) => `<text class="ab-pl${cls ? " " + cls : ""}" data-k="${key}" x="-12" y="${SY - 16.5}">${text}</text>`;

  window.BiasAnim.SCENES[KEY] = {
    q: "nem", viewBox: "0 0 400 272",
    css: `
      ${P} .ab-tv{fill:var(--surface);stroke:var(--ink);stroke-width:2.4}
      ${P} .ab-ln{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ab-body{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ab-eye{fill:var(--ink)}
      ${P} .ab-coat{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ab-coat circle{fill:var(--surface)}
      ${P} .ab-tee{fill:none;stroke:var(--muted);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ab-tee .ab-slv{fill:var(--surface);stroke:var(--ink);stroke-width:2.2}
      ${P} .ab-bot{fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linejoin:round}
      ${P} .ab-lbl{fill:none;stroke:var(--muted);stroke-width:1.4}
      ${P} .ab-moon{fill:var(--q);stroke:none}
      ${P} .ab-bub rect,${P} .ab-bub path,${P} .ab-bub circle{fill:var(--ground);stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}
      ${P} .ab-bub text{font:600 12.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ab-same path{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ab-same text{font:500 9.5px var(--mono);fill:var(--q)}
      ${P} .ab-you{font:500 10px var(--mono);fill:var(--q)}
      ${P} .ab-list rect.bx,${P} .ab-list circle{fill:var(--ground);stroke:var(--q);stroke-width:1.8}
      ${P} .ab-list rect.ck{fill:var(--surface);stroke:var(--muted);stroke-width:1.6}
      ${P} .ab-list text{font:600 10.5px var(--display);fill:var(--ink)}
      ${P} .ab-tick{fill:none;stroke:var(--good);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ab-ax{stroke:var(--rule);stroke-width:2;stroke-linecap:round}
      ${P} .ab-end{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .ab-pin line{stroke:var(--ink);stroke-width:2;stroke-linecap:round}
      ${P} .ab-pin circle{fill:var(--surface);stroke:var(--ink);stroke-width:2}
      ${P} .ab-pin.a line{stroke:var(--q)}
      ${P} .ab-pin.a circle{stroke:var(--q);fill:var(--q);fill-opacity:.25}
      ${P} .ab-pin.g line{stroke:var(--good)}
      ${P} .ab-pin.g circle{stroke:var(--good);fill:var(--good);fill-opacity:.25}
      ${P} .ab-pl{font:500 9.5px var(--mono);fill:var(--ink);text-anchor:end}
      ${P} .ab-pl.a{fill:var(--q)}
      ${P} .ab-pl.g{fill:var(--good)}
      ${P} .ab-gap path{fill:none;stroke:var(--bad);stroke-width:1.8;stroke-linecap:round}
      ${P} .ab-gap text{font:600 10px var(--mono);fill:var(--bad);text-anchor:middle}
      ${P} .ab-band rect{fill:var(--good);fill-opacity:.22;stroke:var(--good);stroke-width:1.6}
      ${P} .ab-band text{font:500 9.5px var(--mono);fill:var(--good);text-anchor:middle}
    `,
    text: {
      hu: {
        name: "Tekintélyi torzítás", shareTitle: "A tekintélyi torzítás, 30 másodpercben",
        ecline: "A valódi szakértelmet bízd meg, a jelmezt ne. Kérj bizonyítékot.",
        claim: "„Az orvosok ajánlják!”", same: "ugyanaz a mondat", you: "te", proof: "Bizonyíték?",
        coat: "fehér köpeny", tee: "póló", anyone: "akárki mondja", doubt: "kétely", trust: "bizalom",
        gap: "a köpeny, nem a bizonyíték", evid: "a bizonyíték",
        qs: ["Mi a bizonyíték?", "Ha valaki más mondaná?", "Ez az ő szakterülete?"],
        caps: [
          "Egy új altatókészítmény reklámja fut.",
          "Valaki <b>fehér köpenyben</b> mondja: „Az orvosok ajánlják!”",
          "<b>Azonnal</b> elhiszed. Nem kérdezel semmit.",
          "Ugyanaz a reklám, <b>ugyanazokkal a szavakkal</b>, de most pólóban.",
          "Hirtelen már nem vagy ennyire biztos. Hol a <b>bizonyíték</b>?",
          "Ugyanaz az állítás, ugyanaz a bizonyíték. <b>Csak a jelmez változott.</b>",
          "<b>A megoldás:</b> kérj bizonyítékot, és nézd meg, ez az ő szakterülete-e.",
          "Utánanézel, aztán a <b>bizonyíték alapján</b> döntesz, bárki mondja."
        ],
        say: [
          "Egy új altatókészítmény reklámja fut.",
          "Valaki fehér köpenyben mondja: az orvosok ajánlják!",
          "Azonnal elhiszed. Nem kérdezel semmit.",
          "Ugyanaz a reklám, ugyanazokkal a szavakkal. De most pólóban.",
          "Hirtelen már nem vagy ennyire biztos. Hol a bizonyíték?",
          "Ugyanaz az állítás, ugyanaz a bizonyíték. Csak a jelmez változott.",
          "A megoldás: kérj bizonyítékot, és nézd meg, ez az ő szakterülete-e.",
          "Utánanézel, aztán a bizonyíték alapján döntesz, bárki mondja.",
          "Tekintélyi torzítás. A valódi szakértelmet bízd meg, a jelmezt ne. Kérj bizonyítékot."
        ]
      },
      en: {
        name: "Authority bias", shareTitle: "Authority bias, explained in 30 seconds",
        ecline: "Trust real expertise, not the costume. Ask for the evidence.",
        claim: "“Doctors recommend it!”", same: "same words", you: "you", proof: "Proof?",
        coat: "white coat", tee: "T-shirt", anyone: "whoever says it", doubt: "doubt", trust: "trust",
        gap: "the coat, not the evidence", evid: "the evidence",
        qs: ["What's the evidence?", "If someone else said it?", "Is this their field?"],
        caps: [
          "An ad for a new sleep supplement comes on.",
          "Someone in a <b>white coat</b> says: “Doctors recommend it!”",
          "You believe it <b>instantly</b>. No questions asked.",
          "Same ad, <b>same words</b>, but this time in a T-shirt.",
          "Suddenly you're not so sure. Where's the <b>proof</b>?",
          "Same claim, same evidence. <b>Only the costume changed.</b>",
          "<b>The fix:</b> ask for the evidence, and if it's their field.",
          "Look it up, then decide <b>on the evidence</b>, whoever says it."
        ],
        say: [
          "An ad for a new sleep supplement comes on.",
          "Someone in a white coat says: doctors recommend it!",
          "You believe it instantly. No questions asked.",
          "Same ad, same words. But this time, in a T-shirt.",
          "Suddenly you're not so sure. Where's the proof?",
          "Same claim, same evidence. Only the costume changed.",
          "The fix: ask for the evidence, and whether this is their field.",
          "Look it up, then decide on the evidence, whoever says it.",
          "Authority bias. Trust real expertise, not the costume. Ask for the evidence."
        ]
      },
      el: {
        name: "Μεροληψία υπέρ της αυθεντίας", shareTitle: "Η μεροληψία υπέρ της αυθεντίας σε 30 δευτερόλεπτα",
        ecline: "Να εμπιστεύεσαι την πραγματική γνώση, όχι τη\u00a0στολή. Ζήτα τα στοιχεία.",
        claim: "«Το συστήνουν οι γιατροί!»", same: "ίδια λόγια", you: "εσύ", proof: "Αποδείξεις;",
        coat: "λευκή ποδιά", tee: "μπλουζάκι", anyone: "όποιος κι αν το λέει", doubt: "αμφιβολία", trust: "εμπιστοσύνη",
        gap: "η ποδιά, όχι τα στοιχεία", evid: "τα στοιχεία",
        qs: ["Ποια είναι τα στοιχεία;", "Αν το άκουγα από αλλού;", "Είναι ειδικός σε αυτό;"],
        caps: [
          "Στην τηλεόραση παίζει μια διαφήμιση για ένα νέο συμπλήρωμα ύπνου.",
          "<b>Λευκή ποδιά</b>, στηθοσκόπιο και η\u00a0ατάκα: «Το συστήνουν οι γιατροί!»",
          "Το πιστεύεις <b>αμέσως</b>, χωρίς δεύτερη σκέψη.",
          "Ίδια διαφήμιση, <b>ίδια λόγια</b>, αλλά τώρα με μπλουζάκι.",
          "Ξαφνικά έχεις αμφιβολίες. Πού είναι οι <b>αποδείξεις</b>;",
          "Ίδιος ισχυρισμός, ίδια στοιχεία. <b>Άλλαξαν μόνο τα ρούχα.</b>",
          "<b>Η λύση:</b> ζήτα στοιχεία και δες αν μιλάει ειδικός στο θέμα.",
          "Ψάξε λίγο και αποφάσισε <b>με βάση τα στοιχεία</b>, όποιος κι αν το λέει."
        ],
        say: [
          "Στην τηλεόραση παίζει μια διαφήμιση για ένα νέο συμπλήρωμα ύπνου.",
          "Λευκή ποδιά, στηθοσκόπιο και η ατάκα: Το συστήνουν οι γιατροί!",
          "Το πιστεύεις αμέσως, χωρίς δεύτερη σκέψη.",
          "Ίδια διαφήμιση, ίδια λόγια. Αλλά τώρα με μπλουζάκι.",
          "Ξαφνικά έχεις αμφιβολίες. Πού είναι οι αποδείξεις;",
          "Ίδιος ισχυρισμός, ίδια στοιχεία. Άλλαξαν μόνο τα ρούχα.",
          "Η λύση: ζήτα στοιχεία, και δες αν μιλάει ειδικός στο θέμα.",
          "Ψάξε λίγο, και αποφάσισε με βάση τα στοιχεία, όποιος κι αν το λέει.",
          "Μεροληψία υπέρ της αυθεντίας. Να εμπιστεύεσαι την πραγματική γνώση, όχι τη στολή. Ζήτα τα στοιχεία."
        ]
      },
      es: {
        name: "Sesgo de autoridad", shareTitle: "El sesgo de autoridad en 30 segundos",
        ecline: "Confía en el conocimiento real, no en el disfraz. Pide las pruebas.",
        claim: "«¡Los médicos lo avalan!»", same: "mismas palabras", you: "tú", proof: "¿Pruebas?",
        coat: "bata blanca", tee: "camiseta", anyone: "sea quien sea", doubt: "duda", trust: "confianza",
        gap: "la bata, no las pruebas", evid: "las pruebas",
        qs: ["¿Qué pruebas hay?", "¿Y si lo dijera otro?", "¿Es su especialidad?"],
        caps: [
          "Sale un anuncio de un nuevo suplemento para dormir.",
          "Alguien con <b>bata blanca</b> dice: «¡Los médicos lo avalan!»",
          "Te lo crees <b>al instante</b>, sin hacer preguntas.",
          "Mismo anuncio, <b>mismas palabras</b>, pero esta vez con camiseta.",
          "De pronto ya no lo tienes tan claro. ¿Dónde están las <b>pruebas</b>?",
          "Misma afirmación, mismas pruebas. <b>Solo cambió el disfraz.</b>",
          "<b>La solución:</b> pide las pruebas y pregunta si es su especialidad.",
          "Infórmate y decide <b>según las pruebas</b>, lo diga quien lo diga."
        ],
        say: [
          "Sale un anuncio de un nuevo suplemento para dormir.",
          "Alguien con bata blanca dice: ¡los médicos lo avalan!",
          "Te lo crees al instante, sin hacer preguntas.",
          "Mismo anuncio, mismas palabras. Pero esta vez, con camiseta.",
          "De pronto ya no lo tienes tan claro. ¿Dónde están las pruebas?",
          "Misma afirmación, mismas pruebas. Solo cambió el disfraz.",
          "La solución: pide las pruebas, y pregunta si es su especialidad.",
          "Infórmate, y decide según las pruebas, lo diga quien lo diga.",
          "Sesgo de autoridad. Confía en el conocimiento real, no en el disfraz. Pide las pruebas."
        ]
      },
      fr: {
        name: "Biais d’autorité", shareTitle: "Le biais d’autorité en 30 secondes",
        ecline: "Fiez-vous à la vraie expertise, pas au costume. Demandez les preuves.",
        claim: "« Validé par les médecins ! »", same: "mêmes mots", you: "vous", proof: "Preuves ?",
        coat: "blouse blanche", tee: "T-shirt", anyone: "qui que ce soit", doubt: "doute", trust: "confiance",
        gap: "la blouse, pas les preuves", evid: "les preuves",
        qs: ["Quelles preuves ?", "Et si un autre le disait ?", "Est-ce son domaine ?"],
        caps: [
          "Une pub passe pour un nouveau complément pour mieux dormir.",
          "Quelqu’un en <b>blouse blanche</b> affirme : « Validé par les médecins ! »",
          "Vous y croyez <b>aussitôt</b>, sans vous poser de questions.",
          "Même pub, <b>mêmes mots</b>, mais cette fois en T-shirt.",
          "Soudain, vous n’en êtes plus si sûr. Où sont les <b>preuves</b> ?",
          "Même affirmation, mêmes preuves. <b>Seul le costume a changé.</b>",
          "<b>La solution :</b> demandez les preuves, et si c’est son domaine.",
          "Renseignez-vous, puis décidez <b>sur les preuves</b>, qui que ce soit."
        ],
        say: [
          "Une pub passe pour un nouveau complément pour mieux dormir.",
          "Quelqu’un en blouse blanche affirme : validé par les médecins !",
          "Vous y croyez aussitôt, sans vous poser de questions.",
          "Même pub, mêmes mots. Mais cette fois, en T-shirt.",
          "Soudain, vous n’en êtes plus si sûr. Où sont les preuves ?",
          "Même affirmation, mêmes preuves. Seul le costume a changé.",
          "La solution : demandez les preuves, et si c’est bien son domaine.",
          "Renseignez-vous, puis décidez sur les preuves, peu importe qui parle.",
          "Le biais d’autorité. Fiez-vous à la vraie expertise, pas au costume. Demandez les preuves."
        ]
      },
      de: {
        name: "Autoritätsglaube", shareTitle: "Der Autoritätsglaube in 30 Sekunden",
        ecline: "Vertrau echtem Fachwissen, nicht dem Kostüm. Frag nach Belegen.",
        claim: "„Ärzte empfehlen es!“", same: "gleiche Worte", you: "du", proof: "Beweise?",
        coat: "weißer Kittel", tee: "T-Shirt", anyone: "egal, wer’s sagt", doubt: "Zweifel", trust: "Vertrauen",
        gap: "der Kittel, nicht die Belege", evid: "die Belege",
        qs: ["Welche Belege gibt es?", "Wenn’s ein anderer sagt?", "Ist die Person vom Fach?"],
        caps: [
          "Im Fernsehen läuft Werbung für ein neues Mittel zum Einschlafen.",
          "Jemand im <b>weißen Kittel</b> sagt: „Ärzte empfehlen es!“",
          "Du glaubst es <b>sofort</b>. Ohne jede Frage.",
          "Gleiche Werbung, <b>gleiche Worte</b>, aber diesmal im T-Shirt.",
          "Plötzlich bist du nicht mehr so sicher. Wo sind die <b>Beweise</b>?",
          "Gleiche Aussage, gleiche Belege. <b>Nur das Kostüm ist anders.</b>",
          "<b>Die Lösung:</b> Frag nach Belegen und ob die Person vom Fach ist.",
          "Schau nach und entscheide <b>nach den Belegen</b>, egal wer es sagt."
        ],
        say: [
          "Im Fernsehen läuft Werbung für ein neues Mittel zum Einschlafen.",
          "Jemand im weißen Kittel sagt: Ärzte empfehlen es!",
          "Du glaubst es sofort. Ohne jede Frage.",
          "Gleiche Werbung, gleiche Worte. Aber diesmal im T-Shirt.",
          "Plötzlich bist du nicht mehr so sicher. Wo sind die Beweise?",
          "Gleiche Aussage, gleiche Belege. Nur das Kostüm ist anders.",
          "Die Lösung: Frag nach Belegen, und ob die Person vom Fach ist.",
          "Schau nach, und entscheide dann nach den Belegen, egal wer es sagt.",
          "Der Autoritätsglaube. Vertrau echtem Fachwissen, nicht dem Kostüm. Frag nach Belegen."
        ]
      },
      it: {
        name: "Bias di autorità", shareTitle: "Il bias di autorità in 30 secondi",
        ecline: "Fidati della vera competenza, non dell’abito. Chiedi le prove.",
        claim: "«Lo consigliano i medici!»", same: "stesse parole", you: "tu", proof: "E le prove?",
        coat: "camice bianco", tee: "maglietta", anyone: "chiunque lo dica", doubt: "dubbio", trust: "fiducia",
        gap: "il camice, non le prove", evid: "le prove",
        qs: ["Quali prove ci sono?", "E se lo dicesse un altro?", "È il suo campo?"],
        caps: [
          "Parte la pubblicità di un nuovo integratore per dormire.",
          "Qualcuno in <b>camice bianco</b> dice: «Lo consigliano i medici!»",
          "Ci credi <b>all’istante</b>. Senza farti domande.",
          "Stessa pubblicità, <b>stesse parole</b>, ma stavolta in maglietta.",
          "D’un tratto hai qualche dubbio. Dove sono le <b>prove</b>?",
          "Stessa affermazione, stesse prove. <b>È cambiato solo l’abito.</b>",
          "<b>La soluzione:</b> chiedi le prove, e se è il suo campo.",
          "Verifica, poi decidi <b>in base alle prove</b>, chiunque lo dica."
        ],
        say: [
          "Parte la pubblicità di un nuovo integratore per dormire.",
          "Qualcuno in camice bianco dice: lo consigliano i medici!",
          "Ci credi all’istante. Senza farti domande.",
          "Stessa pubblicità, stesse parole. Ma stavolta, in maglietta.",
          "D’un tratto hai qualche dubbio. Dove sono le prove?",
          "Stessa affermazione, stesse prove. È cambiato solo l’abito.",
          "La soluzione: chiedi le prove, e se quello è davvero il suo campo.",
          "Verifica, poi decidi in base alle prove, chiunque lo dica.",
          "Bias di autorità. Fidati della vera competenza, non dell’abito. Chiedi le prove."
        ]
      }
    },
    svg(T) {
      const tail = `M${PX - 6} ${TY + 37} L${PX} ${TY + 50} L${PX + 8} ${TY + 37}`;
      const list = QY.map((y, i) => `<g data-k="q${i}"><rect class="ck" x="226" y="${y - 9}" width="11" height="11" rx="2.5"/>
          <text x="245" y="${y}">${T.qs[i]}</text></g>
        <path class="ab-tick" data-k="t${i}" d="M228.5 ${y - 3.5} L231.2 ${y - 0.8} L235.4 ${y - 6.2}"/>`).join("");
      const moonY = 139;
      return `
        <g data-k="tv"><rect class="ab-tv" x="${TX}" y="${TY}" width="${TW}" height="${TH}" rx="10"/>
          <path class="ab-ln" d="M${TX + TW / 2} ${TB} V${TB + 7} M${TX + TW / 2 - 18} ${TB + 8} H${TX + TW / 2 + 18}"/></g>
        <g data-k="bottle"><rect class="ab-bot" x="${BX - 11}" y="104" width="22" height="11" rx="2.5"/>
          <rect class="ab-bot" x="${BX - 16}" y="115" width="32" height="49" rx="6"/>
          <rect class="ab-lbl" x="${BX - 12}" y="126" width="24" height="26" rx="3"/>
          <path class="ab-moon" d="M${BX + 3} ${moonY - 6.3} A7 7 0 1 0 ${BX + 3} ${moonY + 6.3} A6.4 6.4 0 0 1 ${BX + 3} ${moonY - 6.3} Z"/></g>
        <g data-k="pres">
          <path class="ab-body" d="M${PX - 36} ${TB - 1} V150 C${PX - 36} 128 ${PX - 20} 112 ${PX} 112 C${PX + 20} 112 ${PX + 36} 128 ${PX + 36} 150 V${TB - 1}"/>
          <circle class="ab-body" cx="${PX}" cy="90" r="13"/>
          <circle class="ab-eye" cx="${PX - 4.5}" cy="88" r="1.5"/><circle class="ab-eye" cx="${PX + 4.5}" cy="88" r="1.5"/>
          <path class="ab-ln" d="M${PX - 5} 94 Q${PX} 98.5 ${PX + 5} 94"/>
          <g class="ab-coat" data-k="coat">
            <path d="M${PX - 9} 113 L${PX - 17} 129 L${PX - 10} 132 L${PX} 146 L${PX + 10} 132 L${PX + 17} 129 L${PX + 9} 113 M${PX} 146 V${TB - 1}"/>
            <path d="M${PX + 18} 148 H${PX + 30} V158 H${PX + 18} Z M${PX + 22} 143 V148"/>
            <path d="M${PX - 12} 113 C${PX - 25} 122 ${PX - 27} 138 ${PX - 22} 147"/>
            <path d="M${PX + 12} 113 C${PX + 21} 118 ${PX + 24} 125 ${PX + 23} 131 M${PX + 23} 131 L${PX + 19.5} 134 M${PX + 23} 131 L${PX + 26.5} 134"/>
            <circle cx="${PX - 21}" cy="151.5" r="4.5"/></g>
          <g class="ab-tee" data-k="tee">
            <path class="ab-slv" d="M${PX - 25.5} 122.8 L${PX - 46} 140 L${PX - 39} 148 L${PX - 35.6} 144.5 M${PX + 25.5} 122.8 L${PX + 46} 140 L${PX + 39} 148 L${PX + 35.6} 144.5"/>
            <path d="M${PX - 11} 112.8 Q${PX} 123 ${PX + 11} 112.8"/>
            <path d="M${PX} 131 L${PX + 2.6} 137.4 L${PX + 9.4} 137.6 L${PX + 4} 141.8 L${PX + 5.9} 148.3 L${PX} 144.5 L${PX - 5.9} 148.3 L${PX - 4} 141.8 L${PX - 9.4} 137.6 L${PX - 2.6} 137.4 Z"/></g>
        </g>
        <g class="ab-bub" data-k="bub"><rect x="${TX + 7}" y="${TY + 10}" width="${TW - 14}" height="28" rx="12"/><path d="${tail}"/>
          <text x="${TX + TW / 2}" y="${TY + 28.5}">${T.claim}</text></g>
        <g class="ab-same" data-k="same"><path d="M236 36 H212 M217 31 L212 36 L217 41"/><text x="241" y="39.5">${T.same}</text></g>
        <g data-k="you"><path class="ab-body" d="M${YX - 24} 178 V174 C${YX - 24} 162 ${YX - 14} 154 ${YX} 154 C${YX + 14} 154 ${YX + 24} 162 ${YX + 24} 174 V178"/>
          <circle class="ab-body" cx="${YX}" cy="136" r="12"/>
          <circle class="ab-eye" cx="${YX - 4}" cy="134" r="1.4"/><circle class="ab-eye" cx="${YX + 4}" cy="134" r="1.4"/>
          <path class="ab-ln" data-k="mouth" d=""/><path class="ab-ln" data-k="brow" d="M${YX + 2} 127.5 L${YX + 7.5} 125.5"/>
          <text class="ab-you" x="${YX + 18}" y="130">${T.you}</text></g>
        <g class="ab-bub" data-k="proof"><rect x="${YX - 70}" y="74" width="96" height="26" rx="12"/>
          <circle cx="${YX - 12}" cy="108" r="3"/><circle cx="${YX - 7}" cy="116" r="2"/>
          <text x="${YX - 22}" y="91.5">${T.proof}</text></g>
        <g class="ab-list" data-k="list"><rect class="bx" x="214" y="12" width="174" height="90" rx="12"/>
          <circle cx="${YX - 14}" cy="109" r="3.4"/><circle cx="${YX - 8}" cy="117" r="2.2"/>
          ${list}</g>
        <line class="ab-ax" x1="${S0X}" y1="${SY}" x2="${S1X}" y2="${SY}"/>
        <path class="ab-ax" d="M${S0X} ${SY - 5} V${SY + 5} M${S1X} ${SY - 5} V${SY + 5}"/>
        <text class="ab-end" x="${S0X}" y="${SY + 16}">${T.doubt}</text>
        <text class="ab-end" x="${S1X}" y="${SY + 16}" text-anchor="end">${T.trust}</text>
        <g class="ab-band" data-k="band"><rect x="${SX(EVID - 5)}" y="${SY - 6}" width="${SX(EVID + 5) - SX(EVID - 5)}" height="12" rx="3"/>
          <text x="${SX(EVID)}" y="${SY + 16}">${T.evid}</text></g>
        <g class="ab-gap" data-k="gap"><path d="M${SX(LOW)} ${SY + 26} H${SX(HIGH)} M${SX(LOW)} ${SY + 21} V${SY + 31} M${SX(HIGH)} ${SY + 21} V${SY + 31}"/>
          <text x="${(SX(LOW) + SX(HIGH)) / 2}" y="${SY + 42}">${T.gap}</text></g>
        ${pin("pinA", "a", lab("labA", T.coat, "a"))}
        ${pin("pinB", "", lab("labB", T.tee))}
        ${pin("pinG", "g", lab("labG", T.anyone, "g"))}`;
    },
    S0: { tv: 0, bottle: 0, you: 0, pres: 0, coat: 1, bub: 0, pulse: 0, same: 0, mood: 0,
      pinA: 0, pinAX: MID, pinAFade: 1, pinB: 0, pinBX: MID, win: 0, proof: 0, gap: 0, list: 0, qs: 0, ticks: 0, band: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const tr = (key, x, y, extra) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)})${extra || ""}`);
      const pop = (key, v, cx, cy) => { const s = Math.max(.001, .6 + .4 * v); k(key).setAttribute("transform", `translate(${cx} ${cy}) scale(${s.toFixed(3)}) translate(${-cx} ${-cy})`); op(key, v * 1.5); };
      // the ad: TV, bottle, presenter, speech bubble
      op("tv", S.tv); tr("tv", 0, 8 * (1 - S.tv));
      pop("bottle", S.bottle, BX, 164);
      op("pres", S.pres); tr("pres", 0, 10 * (1 - S.pres));
      op("coat", S.coat); op("tee", 1 - S.coat);
      const bs = Math.max(.001, (.6 + .4 * S.bub) * (1 + .07 * S.pulse));
      k("bub").setAttribute("transform", `translate(${PX} ${TY + 50}) scale(${bs.toFixed(3)}) translate(${-PX} ${-(TY + 50)})`);
      op("bub", S.bub * 1.5);
      op("same", S.same); tr("same", 6 * (1 - S.same), 0);
      // you: face follows your trust
      op("you", S.you);
      const m = S.mood, y0 = 141;
      k("mouth").setAttribute("d", `M${YX - 5} ${f1(y0 - m)} Q${YX} ${f1(y0 + 4 * m)} ${YX + 5} ${f1(y0 - m)}`);
      op("brow", -m);
      pop("proof", S.proof, YX - 7, 116);
      // what you ask yourself
      pop("list", S.list, YX - 8, 117);
      for (let i = 0; i < 3; i++) { op("q" + i, S.qs - i); op("t" + i, (S.ticks - i) * 2); }
      // the trust slider
      tr("pinA", SX(S.pinAX), 0); op("pinA", S.pinA * S.pinAFade);
      tr("pinB", SX(S.pinBX), 0); op("pinB", S.pinB * (1 - S.win)); op("labB", 1 - 2 * S.win);
      tr("pinG", SX(S.pinBX), 0); op("pinG", S.pinB * S.win); op("labG", 2 * S.win - 1);
      op("gap", S.gap);
      op("band", S.band);
    },
    beats: [
      { steps: [{ to: { tv: 1 }, ms: 600, sfx: "pluck" }, { to: { bottle: 1 }, ms: 450, ease: "out" }, { wait: 150 }, { to: { you: 1 }, ms: 500 }] },
      { steps: [{ to: { pres: 1 }, ms: 650 }, { wait: 200 }, { to: { bub: 1 }, ms: 450, ease: "out", sfx: "pop" }] },
      { steps: [{ to: { pinA: 1 }, ms: 300 }, { to: { pinAX: HIGH, mood: 1 }, ms: 800, ease: "out", sfx: "spring" }] },
      { steps: [{ to: { pinAFade: .4, mood: 0 }, ms: 400 }, { to: { coat: 0 }, ms: 800, ease: "inOut", sfx: "whoosh" },
        { to: { pulse: 1 }, ms: 200 }, { to: { pulse: 0 }, ms: 300, ease: "inOut" }, { to: { same: 1 }, ms: 400 }] },
      { steps: [{ to: { pinB: 1 }, ms: 300 }, { to: { pinBX: LOW, mood: -1 }, ms: 900, ease: "inOut", sfx: "thud", sfxAt: 750 },
        { to: { proof: 1 }, ms: 450, ease: "out" }] },
      { steps: [{ to: { pinAFade: 1 }, ms: 300 }, { to: { gap: 1 }, ms: 500, sfx: "tick" }], hold: 2800 },
      { steps: [{ to: { gap: 0, proof: 0, same: 0, pinA: 0, mood: 0 }, ms: 500 }, { to: { list: 1 }, ms: 450, ease: "out" },
        { to: { qs: 3 }, ms: 1500, ease: "lin", sfx: "scribble" }], hold: 2800 },
      { steps: [{ to: { ticks: 3 }, ms: 1000, ease: "lin", sfx: "tick" }, { to: { band: 1 }, ms: 400 },
        { to: { pinBX: EVID }, ms: 900, ease: "inOut" }, { to: { win: 1, mood: .6 }, ms: 500, sfx: "chime" },
        { to: { coat: 1 }, ms: 400 }, { wait: 350 }, { to: { coat: 0 }, ms: 400 }, { wait: 350 }, { to: { coat: 1 }, ms: 400 }], hold: 3800 }
    ]
  };
})();
