/* Curse of knowledge: you tap Happy Birthday on a table. In your head the tune plays loud and clear;
   your friend hears only knocks. The note heads are the melody: they fall off on the way over,
   and humming the first notes puts them back. Scene for anim.js. */
(function () {
  const KEY = "curse-of-knowledge", P = `.bp[data-scene="${KEY}"]`;
  const BY = 18, BW = 176, BH = 78, YB = 12, FB = 212;          // thought bubbles: top, size, your left edge, your friend's
  const ON = [0, .75, 1, 2, 3, 4];                               // Hap-py birth-day to you, in beats
  const NX = [30, 52, 66, 92, 118, 144];                         // note x inside a bubble
  const STAFF = [40, 46.5, 53, 59.5, 66];                        // five lines, F down to E
  const PY = [59.5, 59.5, 56.25, 59.5, 49.75, 53];               // G G A G C B
  const BASE = 62;                                               // where a bare knock sits
  const YX = 112, FX = 288, HY = 146;                            // heads
  const TX = 160, TY = 191;                                      // your fist, resting on the table
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const lerp = (a, b, t) => a + (b - a) * t;
  const back = t => { const u = t - 1; return 1 + 2.7 * u * u * u + 1.7 * u * u; };
  const TAPS = [-.6, ...ON];
  // hand height while tapping: up between knocks, down on each one, resting after the last
  const liftAt = t => {
    if (t <= TAPS[0] || t >= ON[ON.length - 1]) return 0;
    let i = 0; while (TAPS[i + 1] <= t) i++;
    const a = TAPS[i], b = TAPS[i + 1];
    return (3 + 7 * Math.min(1, b - a)) * Math.sin(Math.PI * (t - a) / (b - a));
  };
  const hitAt = t => Math.max(0, ...ON.map(o => (t >= o && t < o + .3 ? 1 - (t - o) / .3 : 0)));

  // a note: head centred on (0, 0), tilted; the stem is drawn separately
  const head = (cls, key, x, y) => `<ellipse class="${cls}"${key ? ` data-k="${key}"` : ""} rx="4.6" ry="3.4"${x != null ? ` transform="translate(${x} ${y}) rotate(-20)"` : ""}/>`;
  const staff = bx => STAFF.map(y => `<line class="ck-staff" x1="${bx + 14}" x2="${bx + 162}" y1="${y}" y2="${y}"/>`).join("");
  // thought bubble with three dots trailing to a head
  const bubble = (cls, key, bx, dots) => `<g class="ck-bub ${cls}" data-k="${key}"><rect x="${bx}" y="${BY}" width="${BW}" height="${BH}" rx="16"/>` +
    dots.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("") + `</g>`;
  const YD = [[98, 104, 4.2], [103, 117, 3], [107, 127, 2]], FD = YD.map(([x, y, r]) => [400 - x, y, r]);
  const tab = (cls, key, bx, s) => `<text class="ck-tab ${cls}" data-k="${key}" x="${bx + 14}" y="${BY + 3.4}">${s}</text>`;
  // head and shoulders; eyes turned towards the other person
  const person = (key, x, dir) => `<g data-k="${key}"><path class="ck-body" d="M${x - 24} 204 V190 C${x - 24} 174 ${x - 13} 164 ${x} 164 C${x + 13} 164 ${x + 24} 174 ${x + 24} 190 V204"/>` +
    `<circle class="ck-body" cx="${x}" cy="${HY}" r="12"/><circle class="ck-eye" cx="${x - 4 + 1.4 * dir}" cy="${HY - 1}" r="1.4"/><circle class="ck-eye" cx="${x + 4 + 1.4 * dir}" cy="${HY - 1}" r="1.4"/></g>`;
  const fist = (key, x, y) => `<rect class="ck-body"${key ? ` data-k="${key}"` : ""} x="-5.5" y="-4.5" width="11" height="9" rx="3.5" transform="translate(${x} ${y})"/>`;
  // speech bubble between the two, tail to your friend's mouth
  const SAY = "M155 104 H253 Q262 104 262 113 V119 Q262 128 253 128 H250 L270 146 L238 128 H155 Q146 128 146 119 V113 Q146 104 155 104 Z";
  const HUM = "M143 139 H179 Q186 139 186 146 V156 Q186 163 179 163 H143 Q136 163 136 156 V155 L127 151 L136 147 V146 Q136 139 143 139 Z";
  const LOOK = [127, 139, 178, 104, 232, 100];                   // your gaze to their bubble: start, control, end

  window.BiasAnim.SCENES[KEY] = {
    q: "nem", viewBox: "0 0 400 272",
    css: `
      ${P} .ck-body{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round}
      ${P} .ck-eye{fill:var(--ink)}
      ${P} .ck-ln{fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ck-leg{stroke:var(--ink);stroke-width:2.2;stroke-linecap:round}
      ${P} .ck-arm{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round}
      ${P} .ck-burst{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round}
      ${P} .ck-bub rect,${P} .ck-bub circle{fill:var(--surface);stroke-width:1.8}
      ${P} .ck-bub.q *{stroke:var(--q)}
      ${P} .ck-bub.b *{stroke:var(--bad)}
      ${P} .ck-bub.m *{stroke:var(--muted)}
      ${P} .ck-bub.d *{stroke:var(--muted)}
      ${P} .ck-bub.d rect{stroke-dasharray:4 3.5}
      ${P} .ck-bub.g *{stroke:var(--good)}
      ${P} .ck-tab{font:500 9.5px var(--mono);stroke:var(--surface);stroke-width:9px;paint-order:stroke;stroke-linejoin:round}
      ${P} .ck-tab.q{fill:var(--q)}
      ${P} .ck-tab.b{fill:var(--bad)}
      ${P} .ck-tab.m{fill:var(--muted)}
      ${P} .ck-staff{stroke:var(--faint);stroke-width:1.1}
      ${P} .ck-stem{stroke:var(--ink);stroke-width:1.8;stroke-linecap:round}
      ${P} .ck-hd{fill:var(--ink)}
      ${P} .ck-hd.h{fill:var(--surface);stroke:var(--ink);stroke-width:1.6}
      ${P} .ck-gh{fill:var(--good)}
      ${P} .ck-gh.h{fill:var(--surface);stroke:var(--good);stroke-width:1.6}
      ${P} .ck-dash{fill:none;stroke:var(--good);stroke-width:1.5;stroke-dasharray:2.2 2}
      ${P} .ck-song{font:600 11px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ck-tok{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .ck-miss{font:500 9.5px var(--mono);fill:var(--good);text-anchor:middle}
      ${P} .ck-say path{fill:var(--surface);stroke:var(--ink);stroke-width:1.8;stroke-linejoin:round}
      ${P} .ck-say text{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ck-say.g path{stroke:var(--good)}
      ${P} .ck-badge circle{fill:var(--surface);stroke-width:1.8}
      ${P} .ck-badge path{fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ck-badge.b *{stroke:var(--bad)}
      ${P} .ck-badge.g *{stroke:var(--good)}
      ${P} .ck-mark{font:700 15px var(--display)}
      ${P} .ck-mark.b{fill:var(--bad)}
      ${P} .ck-mark.m{fill:var(--muted)}
      ${P} .ck-look{fill:none;stroke:var(--good);stroke-width:1.8;stroke-dasharray:2.5 4;stroke-linecap:round}
      ${P} .ck-arr{fill:none;stroke:var(--good);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ck-hum .ck-say path{stroke:var(--good)}
      ${P} .ck-gn{fill:var(--good)}
      ${P} .ck-gs{stroke:var(--good);stroke-width:1.8;stroke-linecap:round}
    `,
    text: {
      hu: {
        name: "A tudás átka", shareTitle: "A tudás átka, 30 másodpercben",
        ecline: "Ha valamit már tudsz, nehéz elképzelni, hogy nem tudod. Próbáld meg kezdőnek elmagyarázni.",
        head: "a fejedben", assume: "amit feltételezel", hear: "amit ők hallanak", stuck: "nem tudják kikapcsolni",
        song: "Boldog szülinapot", toks: "kopp… kopp-kopp… kopp… kopp… kopp", miss: "a hiányzó dallam",
        guess: "Csengettyű?", right: "Boldog szülinapot!",
        caps: [
          "Az asztalon kopogsz egy ismert dalt. <b>Melyik dal?</b>",
          "A fejedben a <b>Boldog szülinapot</b> hangosan és tisztán szól.",
          "Egyértelműnek tűnik. Feltételezed, hogy ők is <b>hallják</b>.",
          "Pedig nekik csak kopogás jut: <b>kopp… kopp-kopp… kopp</b>.",
          "A tippjük: „Csengettyű?” <b>Hogy hallhatnák át?</b>",
          "Ha ismered a dallamot, nem tudod elképzelni, hogy <b>valaki ne ismerje</b>.",
          "<b>A megoldás:</b> képzelj el egy valódi kezdőt, és töltsd ki azokat a lépéseket, amiket kihagysz.",
          "Legközelebb elkezded dúdolni az első hangokat. <b>Rögtön kitalálják.</b>"
        ],
        say: [
          "Az asztalon kopogod egy ismert dal ritmusát, és megkéred a barátodat, hogy találja ki.",
          "A fejedben a Boldog szülinapot hangosan és tisztán szól.",
          "Egyértelműnek tűnik. Feltételezed, hogy ők is hallják.",
          "Pedig nekik csak kopogás jut. Kopp... kopp-kopp... kopp.",
          "A tippjük: Csengettyű? Hogy hallhatnák át?",
          "Ha ismered a dallamot, nem tudod elképzelni, hogy valaki ne ismerje.",
          "A megoldás: magyarázás előtt képzelj el egy valódi kezdőt, vagy próbáld ki rajta. Aztán töltsd ki azokat a lépéseket, amiket kihagysz.",
          "Legközelebb dúdold el az első néhány hangot. Rögtön kitalálják.",
          "A tudás átka. Ha valamit már tudsz, nehéz elképzelni, hogy nem tudod. Próbáld meg kezdőnek elmagyarázni."
        ]
      },
      en: {
        name: "Curse of knowledge", shareTitle: "Curse of knowledge, explained in 30 seconds",
        ecline: "Once you know something, it's hard to imagine not knowing it. Try explaining it to a beginner.",
        head: "in your head", assume: "what you assume", hear: "what they hear", stuck: "can't un-hear it",
        song: "Happy Birthday", toks: "tok… tok-tok… tok… tok… tok", miss: "the missing tune",
        guess: "Jingle Bells?", right: "Happy Birthday!",
        caps: [
          "You tap a famous song on the table. <b>Which song is it?</b>",
          "In your head, <b>Happy Birthday</b> plays loud and clear.",
          "It feels obvious. You assume they <b>hear it too</b>.",
          "But all they hear is knocks: <b>tok… tok-tok… tok</b>.",
          "Their guess: “Jingle Bells?” <b>How could they miss it?</b>",
          "Once you know the tune, you can't imagine <b>not knowing it</b>.",
          "<b>The fix:</b> picture a real beginner, and fill in the steps you skip.",
          "Next time, you hum the first notes. <b>They get it right away.</b>"
        ],
        say: [
          "You tap the rhythm of a famous song on the table, and ask a friend to guess it.",
          "In your head, Happy Birthday plays loud and clear.",
          "It feels obvious. You assume they hear it too.",
          "But all they hear is knocks. Tok... tok-tok... tok.",
          "Their guess: Jingle Bells? How could they miss it?",
          "Once you know the tune, you can't imagine not knowing it.",
          "The fix: before you explain, picture a real beginner, or test it on one. Then fill in the steps you skip.",
          "Next time, you hum the first few notes. They get it right away.",
          "The curse of knowledge. Once you know something, it's hard to imagine not knowing it. Try explaining it to a beginner."
        ]
      },
      el: {
        name: "Κατάρα της γνώσης", shareTitle: "Η κατάρα της γνώσης σε 30 δευτερόλεπτα",
        ecline: "Όταν ξέρεις κάτι, δύσκολα φαντάζεσαι πώς είναι να\u00a0μην\u00a0το\u00a0ξέρεις. Δοκίμασε να\u00a0το\u00a0εξηγήσεις σε έναν αρχάριο.",
        head: "στο μυαλό σου", assume: "αυτό που νομίζεις", hear: "αυτό που ακούει", stuck: "δεν σβήνει",
        song: "Happy Birthday", toks: "τοκ… τοκ-τοκ… τοκ… τοκ… τοκ", miss: "η μελωδία που λείπει",
        guess: "Jingle Bells;", right: "Happy Birthday!",
        caps: [
          "Χτυπάς στο τραπέζι τον ρυθμό ενός γνωστού τραγουδιού. <b>Ποιο είναι;</b>",
          "Στο μυαλό σου, το <b>Happy Birthday</b> ακούγεται δυνατά και καθαρά.",
          "Σου φαίνεται αυτονόητο. Νομίζεις ότι το ακούει <b>όπως κι εσύ</b>.",
          "Ακούει όμως μόνο χτυπήματα: <b>τοκ… τοκ-τοκ… τοκ</b>.",
          "Η απάντηση: «Jingle Bells;» <b>Πώς δεν το βρήκε;</b>",
          "Όταν ξέρεις τη μελωδία, δύσκολα φαντάζεσαι <b>πώς είναι να μην την ξέρεις</b>.",
          "<b>Η λύση:</b> δες το με τα μάτια ενός αρχάριου και συμπλήρωσε ό,τι προσπερνάς.",
          "Την επόμενη φορά μουρμουρίζεις τις\u00a0πρώτες νότες. <b>Το βρίσκει αμέσως.</b>"
        ],
        say: [
          "Χτυπάς στο τραπέζι τον ρυθμό ενός γνωστού τραγουδιού, και ζητάς από την παρέα σου να το μαντέψει.",
          "Στο μυαλό σου, το Happy Birthday ακούγεται δυνατά και καθαρά.",
          "Σου φαίνεται αυτονόητο. Νομίζεις ότι το ακούει όπως κι εσύ.",
          "Ακούει όμως μόνο χτυπήματα. Τοκ... τοκ-τοκ... τοκ.",
          "Η απάντηση: Jingle Bells; Πώς δεν το βρήκε;",
          "Όταν ξέρεις τη μελωδία, δύσκολα φαντάζεσαι πώς είναι να μην την ξέρεις.",
          "Η λύση: πριν εξηγήσεις κάτι, δες το με τα μάτια ενός αρχάριου, ή δοκίμασε την εξήγηση σε κάποιον αρχάριο. Μετά συμπλήρωσε ό,τι προσπερνάς.",
          "Την επόμενη φορά μουρμουρίζεις τις πρώτες νότες. Το βρίσκει αμέσως.",
          "Κατάρα της γνώσης. Όταν ξέρεις κάτι, δύσκολα φαντάζεσαι πώς είναι να μην το ξέρεις. Δοκίμασε να το εξηγήσεις σε έναν αρχάριο."
        ]
      },
      es: {
        name: "Maldición del conocimiento", shareTitle: "La maldición del conocimiento en 30 segundos",
        ecline: "Cuando sabes algo, cuesta imaginar no saberlo. Prueba a explicárselo a un principiante.",
        head: "en tu cabeza", assume: "lo que supones", hear: "lo que oye", stuck: "no te la quitas",
        song: "Cumpleaños feliz", toks: "toc… toc-toc… toc… toc… toc", miss: "la melodía que falta",
        guess: "¿Jingle Bells?", right: "¡Cumpleaños feliz!",
        caps: [
          "Das golpecitos en la mesa al ritmo de una canción famosa. <b>¿Cuál es?</b>",
          "En tu cabeza suena <b>Cumpleaños feliz</b>, alta y clara.",
          "Parece obvio. Das por hecho que <b>también la oye</b>.",
          "Pero solo oye golpes: <b>toc… toc-toc… toc</b>.",
          "Su respuesta: «¿Jingle Bells?» <b>¿Cómo no la reconoce?</b>",
          "Cuando conoces la melodía, no puedes imaginar <b>no conocerla</b>.",
          "<b>La solución:</b> piensa en un principiante de verdad y explica los pasos que te saltas.",
          "La próxima vez, tarareas las primeras notas. <b>La adivina al instante.</b>"
        ],
        say: [
          "Das golpecitos en la mesa al ritmo de una canción famosa, y le pides a un amigo que la adivine.",
          "En tu cabeza suena Cumpleaños feliz, alta y clara.",
          "Parece obvio. Das por hecho que también la oye.",
          "Pero solo oye golpes. Toc... toc-toc... toc.",
          "Su respuesta: ¿Jingle Bells? ¿Cómo no la reconoce?",
          "Cuando conoces la melodía, no puedes imaginar no conocerla.",
          "La solución: antes de explicar algo, piensa en un principiante de verdad, o pruébalo con uno. Luego explica los pasos que te saltas.",
          "La próxima vez, tarareas las primeras notas. La adivina al instante.",
          "Maldición del conocimiento. Cuando sabes algo, cuesta imaginar no saberlo. Prueba a explicárselo a un principiante."
        ]
      },
      fr: {
        name: "Malédiction du savoir", shareTitle: "La malédiction du savoir en 30 secondes",
        ecline: "Quand on sait quelque chose, on a du mal à imaginer ne pas le savoir. Essayez de l’expliquer à un débutant.",
        head: "dans votre tête", assume: "ce que vous croyez", hear: "ce qu’il entend", stuck: "impossible à oublier",
        song: "Joyeux anniversaire", toks: "toc… toc-toc… toc… toc… toc", miss: "la mélodie absente",
        guess: "Vive le vent ?", right: "Joyeux anniv’ !",
        caps: [
          "Vous tapez une chanson célèbre sur la table. <b>Laquelle est-ce ?</b>",
          "Dans votre tête, <b>Joyeux anniversaire</b> résonne fort et clair.",
          "Ça paraît évident. Vous supposez que votre ami <b>l’entend aussi</b>.",
          "Mais lui n’entend que des coups : <b>toc… toc-toc… toc</b>.",
          "Il propose : « Vive le vent ? » <b>Comment a-t-il pu la rater ?</b>",
          "Quand on connaît l’air, on ne peut plus imaginer <b>ne pas le connaître</b>.",
          "<b>La solution :</b> imaginez un vrai débutant, et ajoutez les étapes que vous sautez.",
          "La fois suivante, vous fredonnez les premières notes. <b>Il trouve tout de suite.</b>"
        ],
        say: [
          "Vous tapez le rythme d’une chanson célèbre sur la table, et demandez à un ami de la deviner.",
          "Dans votre tête, Joyeux anniversaire résonne fort et clair.",
          "Ça paraît évident. Vous supposez que votre ami l’entend aussi.",
          "Mais lui n’entend que des coups. Toc... toc-toc... toc.",
          "Il propose : Vive le vent ? Comment a-t-il pu la rater ?",
          "Quand on connaît l’air, on ne peut plus imaginer ne pas le connaître.",
          "La solution : avant d’expliquer, imaginez un vrai débutant, ou testez sur l’un d’eux. Puis ajoutez les étapes que vous sautez.",
          "La fois suivante, vous fredonnez les premières notes. Il trouve tout de suite.",
          "La malédiction du savoir. Quand on sait quelque chose, on a du mal à imaginer ne pas le savoir. Essayez de l’expliquer à un débutant."
        ]
      },
      de: {
        name: "Fluch des Wissens", shareTitle: "Der Fluch des Wissens in 30 Sekunden",
        ecline: "Wenn du etwas weißt, kannst du dir kaum vorstellen, es nicht zu wissen. Versuch, es einem Anfänger zu erklären.",
        head: "in deinem Kopf", assume: "was du annimmst", hear: "was ankommt", stuck: "bleibt im Ohr",
        song: "Happy Birthday", toks: "tok… tok-tok… tok… tok… tok", miss: "die fehlende Melodie",
        guess: "Jingle Bells?", right: "Happy Birthday!",
        caps: [
          "Du klopfst ein bekanntes Lied auf den Tisch. <b>Welches ist es?</b>",
          "In deinem Kopf läuft <b>Happy Birthday</b>, laut und deutlich.",
          "Es wirkt offensichtlich. Du nimmst an, dein Gegenüber <b>hört es auch</b>.",
          "Doch dein Gegenüber hört nur Klopfen: <b>tok… tok-tok… tok</b>.",
          "Der Tipp: „Jingle Bells?“ <b>Wie kann man das nicht erkennen?</b>",
          "Wer die Melodie kennt, kann sich kaum vorstellen, <b>sie nicht zu kennen</b>.",
          "<b>Die Lösung:</b> Stell dir einen echten Anfänger vor und ergänze die Schritte, die du überspringst.",
          "Beim nächsten Mal summst du die ersten Töne. <b>Dein Gegenüber errät es sofort.</b>"
        ],
        say: [
          "Du klopfst den Rhythmus eines bekannten Lieds auf den Tisch und lässt dein Gegenüber raten.",
          "In deinem Kopf läuft Happy Birthday, laut und deutlich.",
          "Es wirkt offensichtlich. Du nimmst an, dein Gegenüber hört es auch.",
          "Doch dein Gegenüber hört nur Klopfen. Tok... tok-tok... tok.",
          "Der Tipp: Jingle Bells? Wie kann man das nicht erkennen?",
          "Wer die Melodie kennt, kann sich kaum vorstellen, sie nicht zu kennen.",
          "Die Lösung: Bevor du etwas erklärst, stell dir einen echten Anfänger vor, oder teste es an einem. Dann ergänze die Schritte, die du überspringst.",
          "Beim nächsten Mal summst du die ersten paar Töne. Dein Gegenüber errät es sofort.",
          "Der Fluch des Wissens. Wenn du etwas weißt, kannst du dir kaum vorstellen, es nicht zu wissen. Versuch, es einem Anfänger zu erklären."
        ]
      },
      it: {
        name: "Maledizione della conoscenza", shareTitle: "La maledizione della conoscenza in 30 secondi",
        ecline: "Quando sai una cosa, è difficile immaginare di non saperla. Prova a spiegarla a un principiante.",
        head: "nella tua testa", assume: "ciò che credi", hear: "ciò che sente", stuck: "non la scordi più",
        song: "Tanti auguri a te", toks: "toc… toc-toc… toc… toc… toc", miss: "la melodia mancante",
        guess: "Jingle Bells?", right: "Tanti auguri!",
        caps: [
          "Batti sul tavolo una canzone famosa. <b>Qual è?</b>",
          "Nella tua testa, <b>Tanti auguri a te</b> suona forte e chiara.",
          "Ti sembra ovvio. Dai per scontato che <b>la senta anche il tuo amico</b>.",
          "Ma lui sente solo dei colpi: <b>toc… toc-toc… toc</b>.",
          "La sua risposta: «Jingle Bells?» <b>Come fa a non capirla?</b>",
          "Quando conosci la melodia, non riesci a immaginare <b>di non conoscerla</b>.",
          "<b>La soluzione:</b> immagina un vero principiante, e aggiungi i passaggi che salti.",
          "La volta dopo canticchi le prime note. <b>La indovina subito.</b>"
        ],
        say: [
          "Batti sul tavolo il ritmo di una canzone famosa, e chiedi a un amico di indovinarla.",
          "Nella tua testa, Tanti auguri a te suona forte e chiara.",
          "Ti sembra ovvio. Dai per scontato che la senta anche lui.",
          "Ma lui sente solo dei colpi. Toc... toc-toc... toc.",
          "La sua risposta: Jingle Bells? Come fa a non capirla?",
          "Quando conosci la melodia, non riesci a immaginare di non conoscerla.",
          "La soluzione: prima di spiegare, immagina un vero principiante, o prova con uno. Poi aggiungi i passaggi che salti.",
          "La volta dopo canticchi le prime note. La indovina subito.",
          "La maledizione della conoscenza. Quando sai una cosa, è difficile immaginare di non saperla. Prova a spiegarla a un principiante."
        ]
      }
    },
    svg(T) {
      // your notes: stem and head, grouped so each can pop in on its knock
      const yours = ON.map((_, i) => { const x = YB + NX[i], y = PY[i];
        return `<g data-k="yn${i}"><line class="ck-stem" x1="${x + 4.1}" y1="${y - .5}" x2="${x + 4.1}" y2="${y - 18}"/>${head(i === 5 ? "ck-hd h" : "ck-hd", "", x, y)}</g>`; }).join("");
      // their notes: stems that go bare, heads that fall off, and the heads that come back
      let copy = "", marks = "";
      ON.forEach((_, i) => {
        copy += `<line class="ck-stem" data-k="fs${i}"/>${head(i === 5 ? "ck-hd h" : "ck-hd", "fh" + i)}`;
        marks += head("ck-dash", "fd" + i) + head(i === 5 ? "ck-gh h" : "ck-gh", "fg" + i);
      });
      const eighth = (x, y) => `${head("ck-gn", "", x, y)}<line class="ck-gs" x1="${x + 4.1}" y1="${y - .5}" x2="${x + 4.1}" y2="${y - 12}"/>`;
      const flyer = key => `<g data-k="${key}"><ellipse class="ck-gn" rx="4.6" ry="3.4" transform="rotate(-20)"/><path class="ck-gs" d="M4.1 -.5 V-12 Q8.5 -9 8.5 -5" fill="none"/></g>`;
      return `
        <g data-k="scene">
          ${person("you", YX, 1)}${person("fr", FX, -1)}
          <rect class="ck-body" x="66" y="196" width="268" height="9" rx="2.5"/>
          <line class="ck-leg" x1="84" y1="205" x2="84" y2="254"/><line class="ck-leg" x1="316" y1="205" x2="316" y2="254"/>
          <path class="ck-arm" data-k="arm"/>${fist("fist", TX, TY)}
          <path class="ck-arm" d="M268 178 Q262 194 ${240 + 5} 192"/>${fist("", 240, TY)}
          <path class="ck-burst" data-k="burst" d="M${TX - 10} 193 L${TX - 16} 190 M${TX - 9} 187 L${TX - 13} 182 M${TX + 10} 193 L${TX + 16} 190 M${TX + 9} 187 L${TX + 13} 182"/>
          <path class="ck-ln" data-k="ySmile" d="M${YX - 3} ${HY + 4.5} Q${YX + 1} ${HY + 8} ${YX + 5} ${HY + 4.5}"/>
          <g data-k="yBaf"><ellipse class="ck-ln" cx="${YX + 1}" cy="${HY + 6}" rx="2.3" ry="2.9"/><path class="ck-ln" d="M${YX - 7} ${HY - 7.5} L${YX - 2.5} ${HY - 9} M${YX + 3.5} ${HY - 9} L${YX + 8} ${HY - 7.5}"/></g>
          <text class="ck-mark b" data-k="huh" x="${YX - 18}" y="${HY - 6}" text-anchor="end">?!</text>
          <path class="ck-ln" data-k="fFlat" d="M${FX - 5} ${HY + 5.5} H${FX + 2}"/>
          <g data-k="fPuzz"><path class="ck-ln" d="M${FX - 6} ${HY + 5.5} Q${FX - 3.5} ${HY + 3.5} ${FX - 1} ${HY + 5.5} Q${FX + 1.5} ${HY + 7.5} ${FX + 4} ${HY + 5.5} M${FX - 8} ${HY - 8} L${FX - 3} ${HY - 9.5}"/></g>
          <path class="ck-ln" data-k="fHappy" d="M${FX - 5} ${HY + 4.5} Q${FX - 1} ${HY + 8} ${FX + 3} ${HY + 4.5}"/>
          <text class="ck-mark m" data-k="q1" x="${FX + 17}" y="${HY - 12}">?</text>
        </g>
        <g data-k="yB">
          ${bubble("q", "yBq", YB, YD)}${bubble("b", "yBb", YB, YD)}
          ${tab("q", "tHead", YB, T.head)}${tab("b", "tStuck", YB, T.stuck)}
          ${staff(YB)}${yours}
          <text class="ck-song" data-k="song" x="${YB + 88}" y="86">${T.song}</text>
        </g>
        <g data-k="fB">
          ${bubble("d", "fBd", FB, FD)}${bubble("m", "fBm", FB, FD)}${bubble("g", "fBg", FB, FD)}
          ${tab("m", "tAssume", FB, T.assume)}${tab("m", "tHear", FB, T.hear)}
          <text class="ck-tok" data-k="toks" x="${FB + 88}" y="86">${T.toks}</text>
          <text class="ck-miss" data-k="miss" x="${FB + 88}" y="86">${T.miss}</text>
        </g>
        <g data-k="fcopy"><g data-k="fstaff">${staff(FB)}</g>${copy}</g>
        ${marks}
        <g data-k="look"><path class="ck-look" d="M${LOOK[0]} ${LOOK[1]} Q${LOOK[2]} ${LOOK[3]} ${LOOK[4]} ${LOOK[5]}"/><path class="ck-arr" data-k="lookA"/></g>
        <g class="ck-say" data-k="guess"><path d="${SAY}"/><text x="204" y="120.5">${T.guess}</text></g>
        <g class="ck-badge b" data-k="wrong"><circle cx="262" cy="104" r="8"/><path d="M258.5 100.5 L265.5 107.5 M265.5 100.5 L258.5 107.5"/></g>
        <g class="ck-hum" data-k="hum"><g class="ck-say"><path d="${HUM}"/></g>${eighth(152, 156)}${eighth(168, 153)}</g>
        ${flyer("fly0")}${flyer("fly1")}
        <g class="ck-say g" data-k="right"><path d="${SAY}"/><text x="204" y="120.5">${T.right}</text></g>
        <g class="ck-badge g" data-k="ok"><circle cx="262" cy="104" r="8"/><path d="M258 104.2 L261 107.2 L266.2 100.8"/></g>`;
    },
    S0: { ppl: 0, q1: 0, tap: -.6, mel: 0, notes: -.6, song: 0, ghost: 0, strip: 0, toks: 0, puzz: 0,
      guess: 0, wrong: 0, baf: 0, wipe: 0, curse: 0, dim: 0, look: 0, miss: 0, hum: 0, fly: 0, fill: 0, right: 0, happy: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const at = (key, x, y, extra) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)})${extra || ""}`);
      const pop = (key, v, cx, cy) => {   // scale in around (cx, cy)
        const s = (.7 + .3 * v).toFixed(3);
        k(key).setAttribute("transform", `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`);
        op(key, v * 1.6);
      };
      op("scene", S.ppl);
      // tapping: the fist lifts between knocks, and each knock sends out a little burst
      const fy = TY - liftAt(S.tap);
      at("fist", TX, fy);
      k("arm").setAttribute("d", `M133 178 Q140 ${f1(fy + 5)} ${TX - 5} ${f1(fy + 1)}`);
      op("burst", hitAt(S.tap));
      // faces
      op("ySmile", 1 - S.baf); op("yBaf", S.baf); op("huh", S.baf);
      op("fFlat", (1 - S.puzz) * (1 - S.happy)); op("fPuzz", S.puzz * (1 - S.happy)); op("fHappy", S.happy);
      op("q1", S.q1);
      // your bubble: the tune, one note per knock; later a wipe that won't take
      pop("yB", S.mel, 103, 127);
      k("yB").style.opacity = cl(S.mel * 1.6) * (1 - .6 * S.dim);
      op("yBq", 1 - S.curse); op("yBb", S.curse); op("tHead", 1 - S.curse); op("tStuck", S.curse);
      ON.forEach((o, i) => {
        const x = YB + NX[i], y = PY[i];
        const vis = cl((S.notes - o) / .12), s = cl((S.notes - o) / .35), w = cl((S.wipe - i / 5 * .6) / .4);
        const sc = Math.max(.001, s < 1 ? back(s) : 1);
        k("yn" + i).setAttribute("transform", `translate(${x} ${f1(y - 5 * w)}) scale(${sc.toFixed(3)}) translate(${-x} ${-y})`);
        op("yn" + i, vis * (1 - .85 * w));
      });
      op("song", S.song);
      // their bubble: first what you assume (a copy of your tune), then what they really hear
      const g = S.ghost;
      op("fB", g * 1.5);
      op("fBd", 1 - S.strip); op("fBm", S.strip * (1 - S.miss)); op("fBg", S.miss);
      op("tAssume", 1 - S.strip); op("tHear", S.strip);
      op("toks", S.toks * (1 - S.miss)); op("miss", S.miss * (1 - S.fill));
      at("fcopy", -200 * (1 - g), 0); op("fcopy", g * 1.3);
      op("fstaff", Math.max(1 - S.strip, S.fill));
      ON.forEach((o, i) => {
        const x = FB + NX[i], fi = cl((S.fill - i * .1) / .5), flat = S.strip * (1 - fi), y = lerp(PY[i], BASE, flat);
        const st = k("fs" + i);
        st.setAttribute("x1", f1(x + 4.1)); st.setAttribute("x2", f1(x + 4.1));
        st.setAttribute("y1", f1(y - .5)); st.setAttribute("y2", f1(y - 18));
        st.style.strokeWidth = f1(1.8 + .8 * flat);
        at("fh" + i, x, PY[i] + 14 * S.strip, " rotate(-20)"); op("fh" + i, 1 - 1.4 * S.strip);
        at("fd" + i, x, y, " rotate(-20)"); op("fd" + i, S.miss * (1 - fi));
        at("fg" + i, x, y, ` scale(${Math.max(.001, fi < 1 ? back(fi) : 1).toFixed(3)}) rotate(-20)`); op("fg" + i, fi * 2);
      });
      // the wrong guess
      pop("guess", S.guess, 250, 140); op("guess", S.guess * 1.6 * (1 - S.right));
      pop("wrong", S.wrong, 262, 104);
      // the fix: look at it from their side, and see what's missing
      op("look", S.look);
      const [x0, y0, cx, cy, x1, y1] = LOOK, dx = x1 - cx, dy = y1 - cy, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      k("lookA").setAttribute("d", `M${f1(x1 - 7 * ux - 4.5 * uy)} ${f1(y1 - 7 * uy + 4.5 * ux)} L${x1} ${y1} L${f1(x1 - 7 * ux + 4.5 * uy)} ${f1(y1 - 7 * uy - 4.5 * ux)}`);
      // hum the first notes: they fly over and fill the gaps
      pop("hum", S.hum, 127, 151);
      [[0, 0], [1, .18]].forEach(([i, lag]) => {
        const t = cl((S.fly - lag) / (1 - lag)), sx = 160 + 16 * i, sy = 150, ex = FB + NX[i], ey = PY[i];
        const u = 1 - t, qx = (sx + ex) / 2 - 20, qy = 70;
        at("fly" + i, u * u * sx + 2 * u * t * qx + t * t * ex, u * u * sy + 2 * u * t * qy + t * t * ey);
        op("fly" + i, t > 0 && t < 1 ? Math.min(1, t * 6, (1 - t) * 5) : 0);
      });
      pop("right", S.right, 250, 140);
      pop("ok", S.right, 262, 104);
    },
    beats: [
      { steps: [{ to: { ppl: 1 }, ms: 600 }, { to: { q1: 1 }, ms: 300 }, { to: { tap: 5 }, ms: 2600, ease: "lin", sfx: "tick", sfxAt: 280 }], hold: 1800 },
      { steps: [{ to: { mel: 1 }, ms: 450, ease: "out", sfx: "pop" }, { to: { tap: -.6 } },
        { to: { tap: 5, notes: 5 }, ms: 2600, ease: "lin" }, { to: { song: 1 }, ms: 400 }], hold: 2200 },
      { steps: [{ to: { q1: 0 }, ms: 250 }, { to: { ghost: 1 }, ms: 1000, ease: "inOut", sfx: "whoosh" }] },
      { steps: [{ to: { strip: 1 }, ms: 900, ease: "inOut", sfx: "thud", sfxAt: 350 }, { to: { toks: 1, puzz: 1 }, ms: 450 }], hold: 2800 },
      { steps: [{ to: { guess: 1 }, ms: 450, ease: "out", sfx: "pop" }, { wait: 300 }, { to: { wrong: 1 }, ms: 350, ease: "out" }, { to: { baf: 1 }, ms: 350 }] },
      { steps: [{ to: { guess: 0, wrong: 0 }, ms: 300 }, { to: { wipe: 1 }, ms: 800, ease: "lin" }, { to: { wipe: 0, curse: 1 }, ms: 600, ease: "out", sfx: "spring" }], hold: 2800 },
      { steps: [{ to: { baf: 0, curse: 0, dim: 1 }, ms: 500 }, { to: { look: 1 }, ms: 500 }, { to: { miss: 1 }, ms: 600, sfx: "tick" }], hold: 2800 },
      { steps: [{ to: { look: 0, dim: 0 }, ms: 400 }, { to: { hum: 1 }, ms: 400, ease: "out", sfx: "pluck" }, { to: { fly: 1 }, ms: 800, ease: "inOut" },
        { to: { fill: 1 }, ms: 700 }, { to: { right: 1, happy: 1, puzz: 0 }, ms: 450, ease: "out", sfx: "chime" }], hold: 4200 }
    ]
  };
})();
