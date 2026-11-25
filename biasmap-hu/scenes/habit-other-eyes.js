/* Habit: borrow other eyes. Your setup guide looks perfect to you, because your head fills in a step
   you never wrote. A friend with a magnifier finds the hole, and the step moves from your head onto the page.
   Same motif as the habit tile (you, a paper, a friend with a lens and a red X). Scene for anim.js. */
(function () {
  const KEY = "habit-other-eyes", P = `.bp[data-scene="${KEY}"]`;
  const PX0 = 118, PH = 14, PX1 = PX0 + PH;            // paper's left edge, before and after you hand it over
  const PW = 160, PT = 18, PB = 216, FOLD = 15;         // paper width, top, bottom, dog-ear
  const RY = s => 68 + 30 * s;                          // row slot -> y
  const RW = 150, RL = 5;                               // a row box: width and left inset inside the paper
  const YOU = [60, 162], FR = [346, 162], S1 = 1.5;     // head centres of you and the friend, bust scale
  const OTH = [[320, 172], [372, 172]], S2 = 1.1;       // the others who try it at the end
  const GX = 20, GY = 70, GW = 78;                      // the ghost step card, inside your thought bubble
  const LR = 17;                                        // lens radius
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const lerp = (a, b, t) => a + (b - a) * t;
  const sm = u => { u = cl(u); return u * u * (3 - 2 * u); };

  // head and shoulders; look = -1 eyes to the left, +1 to the right
  const bust = (key, cls, x, y, s, look) => {
    const p = (dx, dy) => `${f1(x + dx * s)} ${f1(y + dy * s)}`;
    return `<g class="oe-bust ${cls}" data-k="${key}"><path d="M${p(-13, 25)} L${p(-13, 21)} C${p(-13, 14)} ${p(-7, 10.5)} ${p(0, 10.5)} C${p(7, 10.5)} ${p(13, 14)} ${p(13, 21)} L${p(13, 25)}"/>` +
      `<circle cx="${x}" cy="${y}" r="${f1(6.5 * s)}"/><circle class="e" cx="${f1(x + (-1.9 + 1.5 * look) * s)}" cy="${f1(y - .5 * s)}" r="${f1(1.05 * s)}"/>` +
      `<circle class="e" cx="${f1(x + (1.9 + 1.5 * look) * s)}" cy="${f1(y - .5 * s)}" r="${f1(1.05 * s)}"/></g>`;
  };
  const tick = (cls, x, y, key) => `<path class="${cls}"${key ? ` data-k="${key}"` : ""} d="M${x - 4.5} ${y} L${x - 1.3} ${y + 3.3} L${x + 4.8} ${y - 3.6}"/>`;
  // rounded box with a tail pointing down at (tx, y0 + h + th)
  const callout = (x0, y0, w, h, r, tx, th, dx) => `M${x0 + r} ${y0} H${x0 + w - r} Q${x0 + w} ${y0} ${x0 + w} ${y0 + r} V${y0 + h - r} Q${x0 + w} ${y0 + h} ${x0 + w - r} ${y0 + h}` +
    ` H${tx + 6} L${tx + (dx || 0)} ${y0 + h + th} L${tx - 6} ${y0 + h} H${x0 + r} Q${x0} ${y0 + h} ${x0} ${y0 + h - r} V${y0 + r} Q${x0} ${y0} ${x0 + r} ${y0} Z`;

  window.BiasAnim.SCENES[KEY] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
      ${P} .oe-pap{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .oe-fold{fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round}
      ${P} .oe-ttl{font:700 12.5px var(--display);fill:var(--ink)}
      ${P} .oe-rule{stroke:var(--faint);stroke-width:1.6;stroke-linecap:round}
      ${P} .oe-nc{fill:none;stroke:var(--muted);stroke-width:1.6}
      ${P} .oe-nt{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .oe-st{font:600 11px var(--display);fill:var(--ink)}
      ${P} .oe-tk{fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .oe-tk.g{stroke:var(--good);stroke-width:2.3}
      ${P} .oe-bust path,${P} .oe-bust circle{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .oe-bust .e{fill:var(--ink);stroke:none}
      ${P} .oe-bust.fr path,${P} .oe-bust.fr circle{stroke:var(--q)}
      ${P} .oe-bust.fr .e{fill:var(--q)}
      ${P} .oe-bust.ot path,${P} .oe-bust.ot circle{stroke:var(--muted);stroke-width:2}
      ${P} .oe-bust.ot .e{fill:var(--muted)}
      ${P} .oe-lbl{font:500 10px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .oe-lbl.q{fill:var(--q)}
      ${P} .oe-th rect,${P} .oe-th circle{fill:var(--surface);stroke:var(--muted);stroke-width:1.8}
      ${P} .oe-th text{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .oe-gc .bk{fill:var(--surface)}
      ${P} .oe-gc .r{fill:none;stroke:var(--muted);stroke-width:1.6;stroke-dasharray:4 3}
      ${P} .oe-gc .c{fill:none;stroke:var(--muted);stroke-width:1.5;stroke-dasharray:2.5 2.5}
      ${P} .oe-gc .t{font:600 11px var(--display);fill:var(--muted)}
      ${P} .oe-gc .rg{fill:none;stroke:var(--good);stroke-width:2}
      ${P} .oe-gc .cg{fill:none;stroke:var(--good);stroke-width:1.6}
      ${P} .oe-gc .tg{font:600 11px var(--display);fill:var(--good)}
      ${P} .oe-gc .ng{font:500 9.5px var(--mono);fill:var(--good);text-anchor:middle}
      ${P} .oe-arr{fill:none;stroke:var(--muted);stroke-width:1.6;stroke-dasharray:3 3.5;stroke-linecap:round}
      ${P} .oe-ah{fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .oe-sp path{fill:var(--surface);stroke:var(--ink);stroke-width:1.8;stroke-linejoin:round}
      ${P} .oe-sp text{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .oe-fb path{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}
      ${P} .oe-fb path.g{stroke:var(--good)}
      ${P} .oe-fb text{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .oe-fb text.g{fill:var(--good)}
      ${P} .oe-lens .gl{fill:var(--q);fill-opacity:.13;stroke:var(--q);stroke-width:2.4}
      ${P} .oe-lens .hd{fill:var(--q)}
      ${P} .oe-x{fill:none;stroke:var(--bad);stroke-width:2.6;stroke-linecap:round}
      ${P} .oe-slot rect{fill:none;stroke:var(--bad);stroke-width:1.8;stroke-dasharray:4 3.5}
      ${P} .oe-slot text{font:500 9.5px var(--mono);fill:var(--bad)}
      ${P} .oe-tag rect{fill:var(--surface);stroke:var(--q);stroke-width:2}
      ${P} .oe-tag .lg{font:500 9.5px var(--mono);fill:var(--q);stroke:var(--surface);stroke-width:6px;paint-order:stroke;stroke-linejoin:round}
      ${P} .oe-tag .bd{font:600 12.5px var(--display);fill:var(--ink);text-anchor:middle}
    `,
    text: {
      hu: {
        name: "Kölcsönözz másik szemet", shareTitle: "Kölcsönözz másik szemet: egy szokás 30 másodpercben",
        ecline: "A saját hiányosságaidat nem látod, de egy friss szempár gyorsan megtalálja őket.",
        title: "Első lépések", steps: ["Töltsd le az alkalmazást", "Jelentkezz be", "Készíts listát", "Hívj meg barátokat"], missing: "Regisztrálj",
        head: "a fejedben", you: "te", fresh: "friss szem", ask: "Keresd meg a hibát!", gap: "hiányzó lépés",
        stuck: ["Jelentkezz be", "mivel?"], got: "Megértették!", caught: "elkapva", bias: "A tudás átka", tagW: 150,
        caps: [
          "Most írtad meg az új alkalmazásod beállítási útmutatóját.",
          "Neked tökéletesnek tűnik. Minden lépés <b>nyilvánvaló</b>.",
          "A fejed csendben kitölt <b>egy lépést, amit sosem írtál le</b>.",
          "<b>A szokás:</b> add oda valakinek, akinek más a háttere.",
          "Kérd meg, hogy <b>keresse meg a hibát</b>, ne azt, hogy jó.",
          "A második lépésnél elakad: „<b>Jelentkezzek be mivel?</b>”",
          "Ez a <b>tudás átkának</b> elkapása: nem tudod elképzelni, hogy valaki ne tudja.",
          "Beírod a hiányzó lépést. Most már <b>másoknak is</b> működik."
        ],
        say: [
          "Most írtad meg az új alkalmazásod beállítási útmutatóját.",
          "Neked tökéletesnek tűnik. Minden lépés nyilvánvaló.",
          "Régóta van fiókod, ezért a fejed csendben kitölt egy lépést, amit sosem írtál le: előbb regisztrálni kell.",
          "A szokás: add oda valakinek, akinek más a háttere.",
          "Kérd meg, hogy keresse meg a hibát, ne azt, hogy jó.",
          "A második lépésnél elakad. Jelentkezzek be mivel?",
          "Ez a tudás átkának elkapása. Ha valamit tudsz, nem tudod elképzelni, hogy ne tudd.",
          "Beírod a hiányzó lépést. Most már másoknak is működik.",
          "Kölcsönözz másik szemet. A saját hiányosságaidat nem látod, de egy friss szempár gyorsan megtalálja őket."
        ]
      },
      en: {
        name: "Borrow other eyes", shareTitle: "Borrow other eyes: a habit in 30 seconds",
        ecline: "You can't see your own gaps, but a fresh pair of eyes finds them fast.",
        title: "Getting started", steps: ["Get the app", "Log in", "Make a list", "Invite friends"], missing: "Sign up",
        head: "in your head", you: "you", fresh: "fresh eyes", ask: "Find the hole!", gap: "missing step",
        stuck: ["Log in", "with what?"], got: "Got it!", caught: "caught", bias: "Curse of knowledge", tagW: 150,
        caps: [
          "You've just written the setup guide for your new app.",
          "To you it looks perfect. Every step is <b>obvious</b>.",
          "Your head quietly fills in <b>a step you never wrote</b>.",
          "<b>The habit:</b> hand it to someone with a different background.",
          "Ask them to <b>find the hole</b>, not to say it's fine.",
          "They get stuck at step 2: “<b>Log in with what?</b>”",
          "It catches the <b>curse of knowledge</b>: you can't imagine not knowing.",
          "You add the missing step. Now it works <b>for others too</b>."
        ],
        say: [
          "You've just written the setup guide for your new app.",
          "To you, it looks perfect. Every step is obvious.",
          "You've had an account for ages, so your head quietly fills in a step you never wrote: sign up first.",
          "The habit: hand it to someone with a different background.",
          "Ask them to find the hole, not to tell you it's fine.",
          "They get stuck at step two. Log in with what?",
          "It catches the curse of knowledge. Once you know something, you can't imagine not knowing it.",
          "You add the missing step. Now it works for others too.",
          "Borrow other eyes. You can't see your own gaps, but a fresh pair of eyes finds them fast."
        ]
      },
      el: {
        name: "Ζήτα μια δεύτερη γνώμη", shareTitle: "Ζήτα μια δεύτερη γνώμη: μια συνήθεια σε 30 δευτερόλεπτα",
        ecline: "Τα δικά σου κενά δεν τα βλέπεις, αλλά μια φρέσκια ματιά τα βρίσκει γρήγορα.",
        title: "Πρώτα βήματα", steps: ["Λήψη εφαρμογής", "Σύνδεση", "Νέα λίστα", "Πρόσκληση φίλων"], missing: "Εγγραφή",
        head: "στο μυαλό σου", you: "εσύ", fresh: "φρέσκια ματιά", ask: "Βρες το κενό!", gap: "λείπει ένα βήμα",
        stuck: ["Με ποιον", "λογαριασμό;"], got: "Κατάλαβα!", caught: "πιάστηκε", bias: "Κατάρα της γνώσης", tagW: 150,
        caps: [
          "Μόλις έγραψες τις οδηγίες για τη νέα σου εφαρμογή.",
          "Σου φαίνονται τέλειες. Κάθε βήμα είναι <b>αυτονόητο</b>.",
          "Το μυαλό σου συμπληρώνει μόνο\u00a0του <b>ένα βήμα που δεν έγραψες</b>.",
          "<b>Η συνήθεια:</b> δώσε τις οδηγίες σε κάποιον με άλλο υπόβαθρο.",
          "Ζήτα να <b>βρει το κενό</b>, όχι να σε καθησυχάσει.",
          "Κολλάει στο βήμα 2: «<b>Με ποιον λογαριασμό;</b>»",
          "Έτσι πιάνεις την <b>κατάρα της γνώσης</b>: ξεχνάς πώς είναι να μην ξέρεις.",
          "Προσθέτεις το βήμα που έλειπε. Τώρα βγάζουν άκρη <b>και οι άλλοι</b>."
        ],
        say: [
          "Μόλις έγραψες τις οδηγίες για τη νέα σου εφαρμογή.",
          "Σου φαίνονται τέλειες. Κάθε βήμα είναι αυτονόητο.",
          "Έχεις λογαριασμό εδώ και καιρό, οπότε το μυαλό σου συμπληρώνει μόνο του ένα βήμα που δεν έγραψες ποτέ: πρώτα κάνεις εγγραφή.",
          "Η συνήθεια: δώσε τις οδηγίες σε κάποιον με άλλο υπόβαθρο.",
          "Ζήτα να βρει το κενό, όχι να σε καθησυχάσει.",
          "Κολλάει στο βήμα δύο. Με ποιον λογαριασμό;",
          "Έτσι πιάνεις την κατάρα της γνώσης. Όταν ξέρεις κάτι, ξεχνάς πώς είναι να μην το ξέρεις.",
          "Προσθέτεις το βήμα που έλειπε. Τώρα βγάζουν άκρη και οι άλλοι.",
          "Ζήτα μια δεύτερη γνώμη. Τα δικά σου κενά δεν τα βλέπεις, αλλά μια φρέσκια ματιά τα βρίσκει γρήγορα."
        ]
      },
      es: {
        name: "Pide otra mirada", shareTitle: "Pide otra mirada: un hábito en 30 segundos",
        ecline: "No ves tus propios huecos, pero unos ojos nuevos los encuentran rápido.",
        title: "Primeros pasos", steps: ["Descarga la app", "Inicia sesión", "Crea una lista", "Invita a amigos"], missing: "Registro",
        head: "en tu cabeza", you: "tú", fresh: "otra mirada", ask: "¡Busca el fallo!", gap: "falta un paso",
        stuck: ["¿Con qué", "cuenta?"], got: "¡Ahora sí!", caught: "detecta", bias: "Maldición del conocimiento", tagW: 217,
        caps: [
          "Acabas de escribir la guía de inicio de tu nueva app.",
          "A ti te parece perfecta. Cada paso es <b>obvio</b>.",
          "Tu cabeza rellena sin avisar <b>un paso que nunca escribiste</b>.",
          "<b>El hábito:</b> dásela a alguien de otro ámbito.",
          "Pídele que <b>busque el fallo</b>, no que te diga que está bien.",
          "Se atasca en el paso 2: «<b>¿Iniciar sesión con qué cuenta?</b>».",
          "Detecta la <b>maldición del conocimiento</b>: no puedes imaginar no saberlo.",
          "Añades el paso que faltaba. Ahora funciona <b>también para los demás</b>."
        ],
        say: [
          "Acabas de escribir la guía de inicio de tu nueva app.",
          "A ti te parece perfecta. Cada paso es obvio.",
          "Tienes cuenta desde hace mucho, así que tu cabeza rellena sin avisar un paso que nunca escribiste: registrarse primero.",
          "El hábito: dásela a alguien de otro ámbito.",
          "Pídele que busque el fallo, no que te diga que está bien.",
          "Se atasca en el paso dos. ¿Iniciar sesión con qué cuenta?",
          "Detecta la maldición del conocimiento. Cuando sabes algo, no puedes imaginar no saberlo.",
          "Añades el paso que faltaba. Ahora funciona también para los demás.",
          "Pide otra mirada. No ves tus propios huecos, pero unos ojos nuevos los encuentran rápido."
        ]
      },
      fr: {
        name: "Demandez un autre regard", shareTitle: "Demandez un autre regard : une habitude en 30 secondes",
        ecline: "Vous ne voyez pas vos propres lacunes, mais un œil neuf les repère vite.",
        title: "Premiers pas", steps: ["Installer l’appli", "Se connecter", "Créer une liste", "Inviter des amis"], missing: "S’inscrire",
        head: "dans la tête", you: "vous", fresh: "œil neuf", ask: "Où est la faille ?", gap: "étape manquante",
        stuck: ["Connexion", "avec quoi ?"], got: "Compris !", caught: "déjoue", bias: "Malédiction du savoir", tagW: 163,
        caps: [
          "Vous venez d’écrire le guide de démarrage de votre nouvelle appli.",
          "Pour vous, il est parfait. Chaque étape est <b>évidente</b>.",
          "Votre tête comble en silence <b>une étape jamais écrite</b>.",
          "<b>L’habitude :</b> confiez-le à quelqu’un d’un autre horizon.",
          "Demandez-lui de <b>trouver la faille</b>, pas de dire que c’est bien.",
          "Il bloque à l’étape 2 : « <b>Se connecter avec quoi ?</b> »",
          "Elle déjoue la <b>malédiction du savoir</b> : impossible d’imaginer ne pas savoir.",
          "Vous ajoutez l’étape manquante. Le guide marche <b>pour les autres aussi</b>."
        ],
        say: [
          "Vous venez d’écrire le guide de démarrage de votre nouvelle appli.",
          "Pour vous, il est parfait. Chaque étape est évidente.",
          "Vous avez un compte depuis longtemps, alors votre tête comble en silence une étape jamais écrite : d’abord, s’inscrire.",
          "L’habitude : confiez-le à quelqu’un d’un autre horizon.",
          "Demandez-lui de trouver la faille, pas de vous dire que c’est bien.",
          "Il bloque à l’étape deux. Se connecter avec quoi ?",
          "Elle déjoue la malédiction du savoir. Quand vous savez quelque chose, impossible d’imaginer ne pas le savoir.",
          "Vous ajoutez l’étape manquante. Désormais, le guide marche pour les autres aussi.",
          "Demandez un autre regard. Vous ne voyez pas vos propres lacunes, mais un œil neuf les repère vite."
        ]
      },
      de: {
        name: "Hol dir einen fremden Blick", shareTitle: "Hol dir einen fremden Blick: eine Gewohnheit in 30 Sekunden",
        ecline: "Deine eigenen Lücken siehst du nicht, aber ein frischer Blick findet sie schnell.",
        title: "Erste Schritte", steps: ["App laden", "Einloggen", "Liste anlegen", "Freunde einladen"], missing: "Konto",
        head: "im Kopf", you: "du", fresh: "fremder Blick", ask: "Finde die Lücke!", gap: "fehlender Schritt",
        stuck: ["Einloggen,", "aber womit?"], got: "Alles klar!", caught: "erwischt", bias: "Fluch des Wissens", tagW: 150,
        caps: [
          "Du hast gerade die Anleitung für deine neue App geschrieben.",
          "Für dich sieht sie perfekt aus. Jeder Schritt ist <b>selbstverständlich</b>.",
          "Dein Kopf ergänzt still <b>einen Schritt, den du nie aufgeschrieben hast</b>.",
          "<b>Die Gewohnheit:</b> Gib sie jemandem mit einem anderen Hintergrund.",
          "Bitte die Person, <b>die Lücke zu finden</b>, statt nur „passt“ zu sagen.",
          "Sie bleibt bei Schritt 2 hängen: „<b>Einloggen, aber womit?</b>“",
          "Diese Gewohnheit fängt den <b>Fluch des Wissens</b> ab: Du kannst dir Nichtwissen nicht vorstellen.",
          "Du ergänzt den fehlenden Schritt. Jetzt funktioniert es <b>auch für andere</b>."
        ],
        say: [
          "Du hast gerade die Anleitung für deine neue App geschrieben.",
          "Für dich sieht sie perfekt aus. Jeder Schritt ist selbstverständlich.",
          "Du hast seit Ewigkeiten ein Konto, also ergänzt dein Kopf still einen Schritt, den du nie aufgeschrieben hast: zuerst ein Konto anlegen.",
          "Die Gewohnheit: Gib sie jemandem mit einem anderen Hintergrund.",
          "Bitte die Person, die Lücke zu finden, statt dir zu sagen, dass alles passt.",
          "Sie bleibt bei Schritt zwei hängen. Einloggen, aber womit?",
          "Diese Gewohnheit fängt den Fluch des Wissens ab. Sobald du etwas weißt, kannst du dir nicht mehr vorstellen, es nicht zu wissen.",
          "Du ergänzt den fehlenden Schritt. Jetzt funktioniert es auch für andere.",
          "Hol dir einen fremden Blick. Deine eigenen Lücken siehst du nicht, aber ein frischer Blick findet sie schnell."
        ]
      },
      it: {
        name: "Chiedi uno sguardo esterno", shareTitle: "Chiedi uno sguardo esterno: un’abitudine in 30 secondi",
        ecline: "Non vedi le tue lacune, ma un paio d’occhi nuovi le trova in fretta.",
        title: "Primi passi", steps: ["Scarica l’app", "Accedi", "Crea una lista", "Invita gli amici"], missing: "Registrati",
        head: "nella tua testa", you: "tu", fresh: "occhi nuovi", ask: "Trova la falla!", gap: "passo mancante",
        stuck: ["Accedi", "con cosa?"], got: "Ora sì!", caught: "smaschera", bias: "Maledizione della conoscenza", tagW: 226,
        caps: [
          "Hai appena scritto la guida di configurazione della tua nuova app.",
          "A te sembra perfetta. Ogni passaggio è <b>ovvio</b>.",
          "La tua testa riempie in silenzio <b>un passaggio che non hai mai scritto</b>.",
          "<b>L’abitudine:</b> falla leggere a qualcuno con un’esperienza diversa.",
          "Chiedigli di <b>trovare la falla</b>, non di dirti che va bene.",
          "Si blocca al passo 2: «<b>Accedi con cosa?</b>»",
          "Smaschera la <b>maledizione della conoscenza</b>: non riesci a immaginare di non sapere.",
          "Aggiungi il passaggio mancante. Ora funziona <b>anche per gli altri</b>."
        ],
        say: [
          "Hai appena scritto la guida di configurazione della tua nuova app.",
          "A te sembra perfetta. Ogni passaggio è ovvio.",
          "Hai un account da secoli, quindi la tua testa riempie in silenzio un passaggio che non hai mai scritto: prima registrati.",
          "L’abitudine: falla leggere a qualcuno con un’esperienza diversa.",
          "Chiedigli di trovare la falla, non di dirti che va bene.",
          "Si blocca al passo due. Accedi con cosa?",
          "Smaschera la maledizione della conoscenza. Quando sai una cosa, non riesci a immaginare di non saperla.",
          "Aggiungi il passaggio mancante. Ora funziona anche per gli altri.",
          "Chiedi uno sguardo esterno. Non vedi le tue lacune, ma un paio d’occhi nuovi le trova in fretta."
        ]
      }
    },
    svg(T) {
      const rows = T.steps.map((s, i) => `<g data-k="row${i}"><circle class="oe-nc" cx="16" cy="0" r="7.5"/><text class="oe-nt" data-k="n${i}" x="16" y="3.3">${i + 1}</text>` +
        `<text class="oe-st" x="30" y="3.9">${s}</text>${tick("oe-tk", 146, 0, "tk" + i)}</g>`).join("");
      const oks = [0, 1, 2, 3, 4].map(j => tick("oe-tk g", 146, RY(j), "ok" + j)).join("");
      const [yx, yy] = YOU, [fx, fy] = FR, TX = PX1 + PW / 2, TW = T.tagW;
      return `
        ${OTH.map(([x, y], i) => `<g data-k="oth${i}">${bust("ob" + i, "ot", x, y, S2, -1)}${tick("oe-tk g", x, y - 20)}</g>`).join("")}
        ${bust("you", "", yx, yy, S1, 1)}<text class="oe-lbl" data-k="youL" x="${yx}" y="216">${T.you}</text>
        <g data-k="fr">${bust("frB", "fr", fx, fy, S1, -1)}<text class="oe-lbl q" x="${fx}" y="216">${T.fresh}</text></g>
        <g data-k="pap">
          <path class="oe-pap" d="M0 ${PT} H${PW - FOLD} L${PW} ${PT + FOLD} V${PB} H0 Z"/><path class="oe-fold" d="M${PW - FOLD} ${PT} V${PT + FOLD} H${PW}"/>
          <text class="oe-ttl" x="12" y="41">${T.title}</text><line class="oe-rule" x1="12" y1="50" x2="${PW - 12}" y2="50"/>
          <g class="oe-slot" data-k="slot" transform="translate(0 ${RY(1)})"><rect x="${RL}" y="-12" width="${RW}" height="24" rx="6"/><text x="50" y="3.4">${T.gap}</text></g>
          ${rows}
        </g>
        <g class="oe-th" data-k="think"><rect x="14" y="50" width="94" height="60" rx="14"/>
          <circle cx="58" cy="120" r="3.2"/><circle cx="60" cy="131" r="2.3"/><circle cx="61" cy="141" r="1.5"/>
          <text x="61" y="101">${T.head}</text></g>
        <path class="oe-arr" data-k="arr"/><path class="oe-ah" data-k="arrH"/>
        <g class="oe-gc" data-k="gc"><rect class="bk" data-k="gcB" x="0" y="-12" height="24" rx="6"/>
          <g data-k="gcD"><rect class="r" data-k="gcDr" x="0" y="-12" height="24" rx="6"/><circle class="c" cx="11" cy="0" r="7.5"/><text class="t" x="25" y="3.9">${T.missing}</text></g>
          <g data-k="gcG"><rect class="rg" data-k="gcGr" x="0" y="-12" height="24" rx="6"/><circle class="cg" cx="11" cy="0" r="7.5"/><text class="ng" x="11" y="3.3">2</text><text class="tg" x="25" y="3.9">${T.missing}</text></g>
        </g>
        <g data-k="oks">${oks}</g>
        <g class="oe-sp" data-k="say"><path d="${callout(12, 94, 108, 30, 10, 56, 12, 3)}"/><text x="66" y="113.5">${T.ask}</text></g>
        <g class="oe-fb" data-k="fb"><path data-k="fbQ" d="${callout(fx - 46, 74, 90, 44, 11, fx - 6, 14, 2)}"/><path class="g" data-k="fbG" d="${callout(fx - 46, 74, 90, 44, 11, fx - 6, 14, 2)}"/>
          <g data-k="fbQt"><text x="${fx - 1}" y="92">${T.stuck[0]}</text><text x="${fx - 1}" y="107">${T.stuck[1]}</text></g>
          <text class="g" data-k="fbGt" x="${fx - 1}" y="100">${T.got}</text></g>
        <g class="oe-lens" data-k="lens"><rect class="hd" x="${LR + 1}" y="-1.7" width="20" height="3.4" rx="1.7" transform="rotate(18)"/>
          <circle class="gl" r="${LR}"/><path class="oe-x" data-k="lx" d="M-5.5 -5.5 L5.5 5.5 M5.5 -5.5 L-5.5 5.5"/></g>
        <g class="oe-tag" data-k="tag"><rect x="${TX - TW / 2}" y="230" width="${TW}" height="28" rx="8"/>
          <text class="lg" x="${TX - TW / 2 + 10}" y="233.4">${T.caught}</text><text class="bd" x="${TX}" y="248.5">${T.bias}</text></g>`;
    },
    S0: { you: 0, paper: 0, w: 0, ticks: 0, tkA: 1, think: 0, ghost: 0, link: 0, hand: 0, friend: 0, say: 0,
      lens: 0, lx: 314, ly: 128, open: 0, slot: 0, ask: 0, tag: 0, fly: 0, fixed: 0, got: 0, ok: 0, others: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = +cl(v).toFixed(3); };
      const pop = (key, v, cx, cy) => {   // scale in around (cx, cy)
        const s = f1((.7 + .3 * cl(v)) * 100) / 100;
        k(key).setAttribute("transform", `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`);
        op(key, v * 1.6);
      };
      // you and the paper; handing it over slides and tilts it towards the friend with a small hop
      op("you", S.you); op("youL", S.you);
      const px = PX0 + PH * S.hand, hop = -5 * Math.sin(Math.PI * cl(S.hand));
      const tilt = 3 * Math.sin(Math.PI * cl(S.hand));
      k("pap").setAttribute("transform", `translate(${f1(px)} ${f1(hop)}) rotate(${f1(tilt)} ${PW / 2} ${PB})`);
      k("oks").setAttribute("transform", `translate(${f1(px)} 0)`);
      op("pap", S.paper);
      // the rows: written one by one; rows 2-4 slide down when the hole opens
      for (let i = 0; i < 4; i++) {
        const w = cl(S.w - i), y = RY(i + (i ? S.open : 0));
        k("row" + i).setAttribute("transform", `translate(${f1(-5 * (1 - w))} ${f1(y)})`);
        op("row" + i, w);
        k("n" + i).textContent = i && S.fixed > .5 ? i + 2 : i + 1;
        op("tk" + i, cl(S.ticks - i) * S.tkA);
      }
      for (let j = 0; j < 5; j++) op("ok" + j, cl(S.ok - j));
      op("slot", S.slot * (1 - S.fixed));
      // your thought: the step you never wrote, and where it would go
      op("think", S.think * S.ghost);
      k("think").setAttribute("transform", `translate(61 110) scale(${f1((.8 + .2 * cl(S.think)) * 100) / 100}) translate(-61 -110)`);
      const ty = lerp((RY(0) + RY(1)) / 2, RY(1), S.open), tx = px + lerp(15, 5, S.open), sx = GX + GW;
      k("arr").setAttribute("d", `M${sx + 2} ${GY} C${sx + 14} ${GY} ${f1(tx - 16)} ${f1(ty)} ${f1(tx - 3)} ${f1(ty)}`);
      k("arrH").setAttribute("d", `M${f1(tx - 8)} ${f1(ty - 4.5)} L${f1(tx - 2)} ${f1(ty)} L${f1(tx - 8)} ${f1(ty + 4.5)}`);
      op("arr", S.link * S.think); op("arrH", S.link * S.think);
      // the ghost card: lives in your head, then flies onto the page and turns into a real step
      const t = S.fly, ux = sm((t - .3) / .7), uy = sm(t / .4);   // drop to the slot's height first, then slide in from the left
      const gx = lerp(GX, px + RL, ux), gy = lerp(GY, RY(1), uy), gw = lerp(GW, RW, ux);
      k("gc").setAttribute("transform", `translate(${f1(gx)} ${f1(gy)})`);
      for (const r of ["gcB", "gcDr", "gcGr"]) k(r).setAttribute("width", f1(gw));
      op("gc", t > 0 ? 1 : S.think * S.ghost);
      op("gcD", 1 - S.fixed); op("gcG", S.fixed);
      // the friend, the ask, the lens
      op("fr", S.friend); k("fr").setAttribute("transform", `translate(0 ${f1(6 * (1 - S.friend))})`);
      pop("say", S.say, 59, 136);
      k("lens").setAttribute("transform", `translate(${f1(S.lx)} ${f1(S.ly)})`);
      op("lens", S.lens); op("lx", S.slot);
      pop("fb", S.ask, FR[0] - 4, 132);
      op("fbQ", 1 - S.got); op("fbQt", 1 - 2 * S.got); op("fbG", S.got); op("fbGt", 2 * S.got - 1);
      // the bias it caught
      k("tag").setAttribute("transform", `translate(0 ${f1(8 * (1 - cl(S.tag)))})`); op("tag", S.tag * 1.4);
      // others try it
      OTH.forEach((_, i) => { const o = cl(S.others * 2 - i); op("oth" + i, o); k("oth" + i).setAttribute("transform", `translate(0 ${f1(5 * (1 - o))})`); });
    },
    beats: [
      { steps: [{ to: { you: 1 }, ms: 400 }, { to: { paper: 1 }, ms: 400 }, { to: { w: 4 }, ms: 1800, ease: "lin", sfx: "scribble" }], hold: 2200 },
      { steps: [{ to: { ticks: 4 }, ms: 1400, ease: "lin", sfx: "tick" }], hold: 2400 },
      { steps: [{ to: { think: 1, ghost: 1 }, ms: 450, ease: "back", sfx: "pop" }, { wait: 300 }, { to: { link: 1 }, ms: 500 }], hold: 2800 },
      { steps: [{ to: { think: 0, tkA: 0 }, ms: 400 }, { to: { link: 0 } }, { to: { hand: 1 }, ms: 800, ease: "inOut", sfx: "whoosh" }, { to: { friend: 1 }, ms: 500 }] },
      { steps: [{ to: { say: 1 }, ms: 400, ease: "back", sfx: "pop" }, { wait: 300 }, { to: { lens: 1 }, ms: 300 },
        { to: { lx: PX1 + 128, ly: RY(0) }, ms: 700, ease: "inOut" }, { to: { lx: PX1 + 48 }, ms: 900, ease: "inOut" }] },
      { steps: [{ to: { lx: PX1 + 22, ly: RY(1) }, ms: 500, ease: "inOut" }, { wait: 200 }, { to: { open: 1 }, ms: 650, ease: "back", sfx: "spring" },
        { to: { slot: 1 }, ms: 350 }, { to: { ask: 1 }, ms: 450, ease: "back", sfx: "tick" }], hold: 2600 },
      { steps: [{ to: { say: 0 }, ms: 300 }, { to: { think: 1 }, ms: 450, ease: "back" }, { to: { link: 1 }, ms: 400 },
        { to: { tag: 1 }, ms: 500, ease: "back", sfx: "thud" }], hold: 2800 },
      { steps: [{ to: { lens: 0 }, ms: 300 }, { to: { fly: 1, think: 0 }, ms: 1000, ease: "lin" }, { to: { fixed: 1, got: 1 }, ms: 450, sfx: "chime" },
        { to: { ok: 5, others: 1 }, ms: 1000, ease: "lin" }], hold: 4200 }
    ]
  };
})();
