/* Habit, argue the other side: a café you're sure about, a "for" bubble full of articles that agree,
   an empty "against" bubble you then fill yourself, and a plan that grows a weekend pop-up before
   you go ahead. The two bubbles are the habit's tile drawing, grown into lists. Scene for anim.js. */
(function () {
  const KEY = "habit-argue", P = `.bp[data-scene="${KEY}"]`;
  const FX = 20, AX = 216, BY = 20, BW = 164, BB = 134, R = 12;   // the two bubbles: left edges, top, width, bottom
  const ROW = [52, 78, 104], RH = 22;                              // list rows inside the bubbles
  const G = 230, RY = 220;                                         // ground line, route height
  const HX = 200, HY = 189;                                        // your head
  const JX = 58, SX = 269, CX = 352;                               // job, pop-up stall, café (centres)
  const A0 = 80, A1 = 174, B0 = 226, B1 = 314;                     // route: job -> you, you -> café
  const WX0 = AX + 30, WX1 = AX + BW - 12;                         // write-on span of the "against" rows
  const cl = v => Math.max(0, Math.min(1, v));
  const f2 = v => (+v).toFixed(2);
  // a speech bubble with a short tail leaning towards you, like the habit's tile
  const bubble = (x, t0, tip, t1) => `M${x + R} ${BY} H${x + BW - R} A${R} ${R} 0 0 1 ${x + BW} ${BY + R} V${BB - R} A${R} ${R} 0 0 1 ${x + BW - R} ${BB}` +
    ` H${t0} L${tip[0]} ${tip[1]} L${t1} ${BB} H${x + R} A${R} ${R} 0 0 1 ${x} ${BB - R} V${BY + R} A${R} ${R} 0 0 1 ${x + R} ${BY} Z`;
  const FOR = bubble(FX, 172, [186, 150], 158), AGAINST = bubble(AX, 242, [214, 150], 228);
  const scallops = (x, y, n, w) => { let d = `M${x} ${y}`; for (let i = 0; i < n; i++) d += ` q${w / 2} ${w / 2} ${w} 0`; return d; };

  window.BiasAnim.SCENES[KEY] = {
    q: "tmi", viewBox: "0 0 400 272",
    css: `
      ${P} .ha-bub{fill:var(--surface);stroke:var(--muted);stroke-width:2;stroke-linejoin:round}
      ${P} .ha-bub.q{stroke:var(--q);stroke-width:2.4}
      ${P} .ha-bub.dash{fill:none;stroke:var(--faint);stroke-width:1.6;stroke-dasharray:4 5;stroke-linecap:round}
      ${P} .ha-sign{fill:none;stroke:var(--muted);stroke-width:2.4;stroke-linecap:round}
      ${P} .ha-sign.q{stroke:var(--q)} ${P} .ha-sign.f{stroke:var(--faint)}
      ${P} .ha-h{font:600 12.5px var(--display);fill:var(--ink)}
      ${P} .ha-h.f{fill:var(--faint)}
      ${P} .ha-rule{stroke:var(--rule);stroke-width:1.2;stroke-linecap:round}
      ${P} .ha-row{fill:none;stroke:var(--rule);stroke-width:1.2}
      ${P} .ha-row.q{stroke:var(--q);stroke-opacity:.45}
      ${P} .ha-it{font:600 10.5px var(--display);fill:var(--ink)}
      ${P} .ha-doc{fill:none;stroke:var(--muted);stroke-width:1.3;stroke-linejoin:round;stroke-linecap:round}
      ${P} .ha-ck{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ha-min circle{fill:none;stroke:var(--q);stroke-width:1.5}
      ${P} .ha-min path{stroke:var(--q);stroke-width:1.8;stroke-linecap:round}
      ${P} .ha-cover{fill:var(--surface)}
      ${P} .ha-pen{stroke:var(--q);stroke-width:2.2;stroke-linecap:round}
      ${P} .ha-empty{font:500 9.5px var(--mono);fill:var(--faint);text-anchor:middle}
      ${P} .ha-spark{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round}
      ${P} .ha-ln{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ha-st{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ha-aw{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ha-cup{fill:none;stroke:var(--q);stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ha-eye{fill:var(--ink)}
      ${P} .ha-ground{stroke:var(--rule);stroke-width:2;stroke-linecap:round}
      ${P} .ha-route{stroke:var(--muted);stroke-width:2;stroke-dasharray:2 5;stroke-linecap:round}
      ${P} .ha-head{fill:none;stroke:var(--muted);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ha-go{stroke:var(--good);stroke-width:2.6;stroke-linecap:round}
      ${P} .ha-head.ok{stroke:var(--good);stroke-width:2.6}
      ${P} .ha-lab{font:600 10.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ha-sub{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .ha-note{font:500 9.5px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .ha-note.ok{fill:var(--good)}
      ${P} .ha-strike{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round}
      ${P} .ha-pill rect{fill:var(--surface);stroke:var(--ink);stroke-width:1.6}
      ${P} .ha-pill text{font:600 11px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ha-pill.q rect{stroke:var(--q);stroke-width:2}
      ${P} .ha-pill.q path{fill:var(--q)}
      ${P} .ha-pause circle{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .ha-pause path{stroke:var(--q);stroke-width:2.2;stroke-linecap:round}
      ${P} .ha-chk circle{fill:var(--surface);stroke:var(--good);stroke-width:2}
      ${P} .ha-chk path{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
    `,
    text: {
      hu: {
        name: "Érveld meg az ellenkezőjét", shareTitle: "Érveld meg az ellenkezőjét: egy szokás 30 másodpercben",
        ecline: "Előbb a legerősebb érveket hozd fel a terved ellen, aztán nyitott szemmel indulj neki.",
        forH: "Mellette", agH: "Ellene", empty: "üres",
        pros: ["A kávézók virágzanak", "Azt csinálod, amit szeretsz", "Legyél a saját főnököd"],
        cons: ["Magas bérleti díj", "Lassú első hónapok", "12 órás munkanapok"],
        job: "A munkád", cafe: "A kávézód", quit: "felmondasz", quitW: 24, notYet: "még nem",
        popup: "Felugró bolt", popupSub: "hétvégén",
        sure: "100%-ig biztos", sureW: 74, bias: "Megerősítési torzítás", biasW: 130,
        caps: [
          "Ki akarsz lépni a munkahelyedről, és <b>kávézót</b> nyitnál. Biztos vagy benne.",
          "Minden, amit olvasol, úgy tűnik, <b>egyetért</b> veled.",
          "Ezért csak a <b>mellette</b> szóló okokat gyűjtöd. Az ellenkező oldal üres marad.",
          "<b>A szokás:</b> mielőtt elköteleződsz, érveld meg az ellenkezőjét.",
          "Írd le a <b>legerősebb érvet</b> a saját terved ellen.",
          "Aztán igazítsd a tervet: <b>tesztelj</b> először hétvégi felugró bolttal.",
          "Ez a szokás elkapja a <b>megerősítési torzítást</b>: csak azt látod, ami egyetért veled.",
          "Attól még megindulsz, de <b>nyitott szemmel</b>."
        ],
        say: [
          "Ki akarsz lépni a munkahelyedről, és kávézót nyitnál. Biztos vagy benne.",
          "Minden, amit olvasol, úgy tűnik, egyetért veled.",
          "Ezért csak a mellette szóló okokat gyűjtöd. Az ellenkező oldal üres marad.",
          "A szokás: mielőtt elköteleződsz, érveld meg az ellenkezőjét.",
          "Írd le a legerősebb érvet a saját terved ellen. Magas bérleti díj. Lassú első hónapok. Tizenkét órás munkanapok.",
          "Aztán igazítsd a tervet. Tesztelj először hétvégi felugró bolttal.",
          "Ez a szokás elkapja a megerősítési torzítást: csak azt látod, ami egyetért veled.",
          "Attól még megindulsz, de nyitott szemmel.",
          "Érveld meg az ellenkezőjét. Előbb a legerősebb érveket hozd fel a terved ellen, aztán nyitott szemmel indulj neki."
        ]
      },
      en: {
        name: "Argue the other side", shareTitle: "Argue the other side: a habit in 30 seconds",
        ecline: "Make the strongest case against your plan first, then go ahead with open eyes.",
        forH: "For", agH: "Against", empty: "empty",
        pros: ["Cafés are booming", "Do what you love", "Be your own boss"],
        cons: ["High rent", "Slow first months", "12-hour days"],
        job: "Your job", cafe: "Your café", quit: "quit", quitW: 24, notYet: "not yet",
        popup: "Pop-up", popupSub: "on weekends",
        sure: "100% sure", sureW: 74, bias: "Confirmation bias", biasW: 130,
        caps: [
          "You want to quit your job and open a <b>café</b>. You're sure.",
          "Everything you read seems to <b>agree</b> with you.",
          "So you only collect reasons <b>for</b>. The other side stays empty.",
          "<b>The habit:</b> before you commit, argue the other side.",
          "Write the <b>strongest case against</b> your own plan.",
          "Then adjust the plan: <b>test it</b> with weekend pop-ups first.",
          "This habit catches <b>confirmation bias</b>: seeing only what agrees with you.",
          "You still go ahead, but <b>with open eyes</b>."
        ],
        say: [
          "You want to quit your job and open a café. You're sure.",
          "Everything you read seems to agree with you.",
          "So you only collect reasons for. The other side stays empty.",
          "The habit: before you commit, argue the other side.",
          "Write the strongest case against your own plan. High rent. Slow first months. Twelve-hour days.",
          "Then adjust the plan. Test it with weekend pop-ups first.",
          "This habit catches confirmation bias: seeing only what agrees with you.",
          "You still go ahead, but with open eyes.",
          "Argue the other side. Make the strongest case against your plan first, then go ahead with open eyes."
        ]
      },
      el: {
        name: "Υπερασπίσου την άλλη πλευρά", shareTitle: "Υπερασπίσου την άλλη πλευρά: μια συνήθεια σε 30 δευτερόλεπτα",
        ecline: "Βρες πρώτα τα πιο δυνατά επιχειρήματα κατά του σχεδίου σου και μετά προχώρα με ανοιχτά μάτια.",
        forH: "Υπέρ", agH: "Κατά", empty: "κενό",
        pros: ["Ο καφές πουλάει", "Κάνε ό,τι αγαπάς", "Χωρίς αφεντικό"],
        cons: ["Ακριβό ενοίκιο", "Αργό ξεκίνημα", "12 ώρες τη μέρα"],
        job: "Η δουλειά σου", cafe: "Το καφέ σου", quit: "παραίτηση", quitW: 52, notYet: "όχι ακόμα",
        popup: "Πάγκος", popupSub: "τα Σαββατοκύριακα",
        sure: "100% σίγουρα", sureW: 92, bias: "Μεροληψία επιβεβαίωσης", biasW: 156,
        caps: [
          "Θέλεις να παραιτηθείς και να ανοίξεις ένα <b>καφέ</b>. Δεν έχεις καμία αμφιβολία.",
          "Ό,τι διαβάζεις μοιάζει να σου δίνει <b>δίκιο</b>.",
          "Μαζεύεις μόνο λόγους <b>υπέρ</b>. Η άλλη πλευρά μένει άδεια.",
          "<b>Η συνήθεια:</b> πριν δεσμευτείς, υπερασπίσου την άλλη πλευρά.",
          "Γράψε τα <b>πιο δυνατά επιχειρήματα κατά</b> του σχεδίου σου.",
          "Μετά προσάρμοσε το σχέδιο: <b>δοκίμασέ το</b> πρώτα σε έναν πάγκο τα Σαββατοκύριακα.",
          "Έτσι πιάνεις τη <b>μεροληψία επιβεβαίωσης</b>: να βλέπεις μόνο όσα σου δίνουν δίκιο.",
          "Και προχωράς, αλλά αυτή\u00a0τη\u00a0φορά <b>με ανοιχτά μάτια</b>."
        ],
        say: [
          "Θέλεις να παραιτηθείς και να ανοίξεις ένα καφέ. Δεν έχεις καμία αμφιβολία.",
          "Ό,τι διαβάζεις μοιάζει να σου δίνει δίκιο.",
          "Μαζεύεις μόνο λόγους υπέρ. Η άλλη πλευρά μένει άδεια.",
          "Η συνήθεια: πριν δεσμευτείς, υπερασπίσου την άλλη πλευρά.",
          "Γράψε τα πιο δυνατά επιχειρήματα κατά του σχεδίου σου. Ακριβό ενοίκιο. Αργό ξεκίνημα. Δώδεκα ώρες τη μέρα.",
          "Μετά προσάρμοσε το σχέδιο. Δοκίμασέ το πρώτα σε έναν πάγκο τα Σαββατοκύριακα.",
          "Έτσι πιάνεις τη μεροληψία επιβεβαίωσης: να βλέπεις μόνο όσα σου δίνουν δίκιο.",
          "Και προχωράς, αλλά αυτή τη φορά με ανοιχτά μάτια.",
          "Υπερασπίσου την άλλη πλευρά. Βρες πρώτα τα πιο δυνατά επιχειρήματα κατά του σχεδίου σου και μετά προχώρα με ανοιχτά μάτια."
        ]
      },
      es: {
        name: "Defiende la postura contraria", shareTitle: "Defiende la postura contraria: un hábito en 30 segundos",
        ecline: "Busca primero los mejores argumentos contra tu plan y luego sigue adelante con los ojos abiertos.",
        forH: "A favor", agH: "En contra", empty: "vacío",
        pros: ["Los cafés triunfan", "Haz lo que amas", "Sé tu propio jefe"],
        cons: ["Alquiler caro", "Arranque lento", "Días de 12 horas"],
        job: "Tu trabajo", cafe: "Tu café", quit: "renunciar", quitW: 54, notYet: "aún no",
        popup: "Puesto", popupSub: "fines de semana",
        sure: "100% seguro", sureW: 91, bias: "Sesgo de confirmación", biasW: 160,
        caps: [
          "Quieres dejar tu trabajo y abrir un <b>café</b>. Lo tienes claro.",
          "Todo lo que lees parece <b>darte la razón</b>.",
          "Así que solo reúnes razones <b>a favor</b>. El otro lado sigue vacío.",
          "<b>El hábito:</b> antes de lanzarte, defiende la postura contraria.",
          "Escribe <b>los mejores argumentos en contra</b> de tu propio plan.",
          "Luego ajusta el plan: <b>pruébalo</b> antes con un puesto los fines de semana.",
          "Este hábito detecta el <b>sesgo de confirmación</b>: ver solo lo que te da la razón.",
          "Sigues adelante, pero <b>con los ojos abiertos</b>."
        ],
        say: [
          "Quieres dejar tu trabajo y abrir un café. Lo tienes claro.",
          "Todo lo que lees parece darte la razón.",
          "Así que solo reúnes razones a favor. El otro lado sigue vacío.",
          "El hábito: antes de lanzarte, defiende la postura contraria.",
          "Escribe los mejores argumentos en contra de tu propio plan. Alquiler caro. Arranque lento. Días de doce horas.",
          "Luego ajusta el plan. Pruébalo antes con un puesto los fines de semana.",
          "Este hábito detecta el sesgo de confirmación: ver solo lo que te da la razón.",
          "Sigues adelante, pero con los ojos abiertos.",
          "Defiende la postura contraria. Busca primero los mejores argumentos contra tu plan y luego sigue adelante con los ojos abiertos."
        ]
      },
      fr: {
        name: "Défendez l’autre camp", shareTitle: "Défendez l’autre camp : une habitude en 30 secondes",
        ecline: "Commencez par les meilleurs arguments contre votre projet, puis lancez-vous les yeux ouverts.",
        forH: "Pour", agH: "Contre", empty: "vide",
        pros: ["Les cafés marchent", "Vivez votre passion", "Soyez votre patron"],
        cons: ["Loyer élevé", "Débuts lents", "Journées de 12 h"],
        job: "Votre emploi", cafe: "Votre café", quit: "démission", quitW: 52, notYet: "pas encore",
        popup: "Stand", popupSub: "le week-end",
        sure: "Sûr à 100 %", sureW: 83, bias: "Biais de confirmation", biasW: 155,
        caps: [
          "Vous voulez quitter votre emploi pour ouvrir un <b>café</b>. Aucun doute.",
          "Tout ce que vous lisez semble vous <b>donner raison</b>.",
          "Alors vous ne réunissez que des raisons <b>pour</b>. L’autre côté reste vide.",
          "<b>L’habitude :</b> avant de vous engager, défendez l’autre camp.",
          "Écrivez <b>les meilleurs arguments contre</b> votre propre projet.",
          "Puis ajustez le projet : <b>testez-le</b> d’abord avec un stand le week-end.",
          "Cette habitude déjoue le <b>biais de confirmation</b> : ne voir que ce qui vous donne raison.",
          "Vous vous lancez quand même, mais <b>les yeux ouverts</b>."
        ],
        say: [
          "Vous voulez quitter votre emploi pour ouvrir un café. Aucun doute.",
          "Tout ce que vous lisez semble vous donner raison.",
          "Alors vous ne réunissez que des raisons pour. L’autre côté reste vide.",
          "L’habitude : avant de vous engager, défendez l’autre camp.",
          "Écrivez les meilleurs arguments contre votre propre projet. Loyer élevé. Débuts lents. Journées de douze heures.",
          "Puis ajustez le projet. Testez-le d’abord avec un stand le week-end.",
          "Cette habitude déjoue le biais de confirmation : ne voir que ce qui vous donne raison.",
          "Vous vous lancez quand même, mais les yeux ouverts.",
          "Défendez l’autre camp. Commencez par les meilleurs arguments contre votre projet, puis lancez-vous les yeux ouverts."
        ]
      },
      de: {
        name: "Vertritt die Gegenseite", shareTitle: "Vertritt die Gegenseite: eine Gewohnheit in 30 Sekunden",
        ecline: "Sammle zuerst die stärksten Argumente gegen deinen Plan, dann zieh ihn mit offenen Augen durch.",
        forH: "Dafür", agH: "Dagegen", empty: "leer",
        pros: ["Cafés boomen", "Mach, was du liebst", "Eigener Chef sein"],
        cons: ["Hohe Miete", "Zähe erste Monate", "12-Stunden-Tage"],
        job: "Dein Job", cafe: "Dein Café", quit: "kündigen", quitW: 46, notYet: "noch nicht",
        popup: "Pop-up", popupSub: "am Wochenende",
        sure: "100 % sicher", sureW: 90, bias: "Bestätigungsfehler", biasW: 139,
        caps: [
          "Du willst deinen Job kündigen und ein <b>Café</b> eröffnen. Du bist dir sicher.",
          "Alles, was du liest, scheint dir <b>recht zu geben</b>.",
          "Also sammelst du nur Gründe <b>dafür</b>. Die andere Seite bleibt leer.",
          "<b>Die Gewohnheit:</b> Bevor du dich festlegst, vertritt die Gegenseite.",
          "Schreib die <b>stärksten Argumente gegen</b> deinen eigenen Plan auf.",
          "Dann pass den Plan an: <b>Teste ihn</b> erst mit Pop-ups am Wochenende.",
          "Diese Gewohnheit fängt den <b>Bestätigungsfehler</b> ab: nur zu sehen, was dir recht gibt.",
          "Du ziehst es trotzdem durch, aber <b>mit offenen Augen</b>."
        ],
        say: [
          "Du willst deinen Job kündigen und ein Café eröffnen. Du bist dir sicher.",
          "Alles, was du liest, scheint dir recht zu geben.",
          "Also sammelst du nur Gründe dafür. Die andere Seite bleibt leer.",
          "Die Gewohnheit: Bevor du dich festlegst, vertritt die Gegenseite.",
          "Schreib die stärksten Argumente gegen deinen eigenen Plan auf. Hohe Miete. Zähe erste Monate. Zwölf-Stunden-Tage.",
          "Dann pass den Plan an. Teste ihn erst mit Pop-ups am Wochenende.",
          "Diese Gewohnheit fängt den Bestätigungsfehler ab: nur zu sehen, was dir recht gibt.",
          "Du ziehst es trotzdem durch, aber mit offenen Augen.",
          "Vertritt die Gegenseite. Sammle zuerst die stärksten Argumente gegen deinen Plan, dann zieh ihn mit offenen Augen durch."
        ]
      },
      it: {
        name: "Difendi la tesi opposta", shareTitle: "Difendi la tesi opposta: un’abitudine in 30 secondi",
        ecline: "Prima costruisci gli argomenti più forti contro il tuo piano, poi vai avanti a occhi aperti.",
        forH: "Pro", agH: "Contro", empty: "vuoto",
        pros: ["I bar vanno forte", "Fai ciò che ami", "Mettiti in proprio"],
        cons: ["Affitto alto", "Primi mesi lenti", "Giornate di 12 ore"],
        job: "Il tuo lavoro", cafe: "Il tuo bar", quit: "dimissioni", quitW: 58, notYet: "non ancora",
        popup: "Chiosco", popupSub: "nel weekend",
        sure: "Sicuro al 100%", sureW: 104, bias: "Bias di conferma", biasW: 130,
        caps: [
          "Vuoi lasciare il lavoro e aprire un <b>bar</b>. Non hai dubbi.",
          "Tutto ciò che leggi sembra <b>darti ragione</b>.",
          "Così raccogli solo ragioni <b>a favore</b>. L’altro lato resta vuoto.",
          "<b>L’abitudine:</b> prima di impegnarti, difendi la tesi opposta.",
          "Scrivi gli <b>argomenti più forti contro</b> il tuo stesso piano.",
          "Poi adatta il piano: <b>mettilo alla prova</b> prima con un chiosco nel weekend.",
          "Questa abitudine smaschera il <b>bias di conferma</b>: vedere solo ciò che ti dà ragione.",
          "Vai avanti lo stesso, ma <b>a occhi aperti</b>."
        ],
        say: [
          "Vuoi lasciare il lavoro e aprire un bar. Non hai dubbi.",
          "Tutto ciò che leggi sembra darti ragione.",
          "Così raccogli solo ragioni a favore. L’altro lato resta vuoto.",
          "L’abitudine: prima di impegnarti, difendi la tesi opposta.",
          "Scrivi gli argomenti più forti contro il tuo stesso piano. Affitto alto. Primi mesi lenti. Giornate di dodici ore.",
          "Poi adatta il piano. Mettilo alla prova prima con un chiosco nel weekend.",
          "Questa abitudine smaschera il bias di conferma: vedere solo ciò che ti dà ragione.",
          "Vai avanti lo stesso, ma a occhi aperti.",
          "Difendi la tesi opposta. Prima costruisci gli argomenti più forti contro il tuo piano, poi vai avanti a occhi aperti."
        ]
      }
    },
    svg(T) {
      // the "for" side: articles that agree, then the bubble drawn around them
      const pros = T.pros.map((s, i) => {
        const y = ROW[i];
        return `<g data-k="f${i}"><rect class="ha-row" x="${FX + 8}" y="${y}" width="${BW - 16}" height="${RH}" rx="6"/>
          <path class="ha-doc" d="M34 ${y + 5} H41 L44 ${y + 8} V${y + 17} H34 Z M36.5 ${y + 11} H41.5 M36.5 ${y + 14} H41.5"/>
          <text class="ha-it" x="50" y="${y + 15}">${s}</text>
          <path class="ha-ck" d="M161.5 ${y + 11} l3 3 l5.5 -6"/></g>`;
      }).join("");
      // the "against" side: rows you write yourself, revealed left to right
      const cons = T.cons.map((s, i) => {
        const y = ROW[i];
        return `<g data-k="a${i}"><rect class="ha-row q" x="${AX + 8}" y="${y}" width="${BW - 16}" height="${RH}" rx="6"/>
          <g class="ha-min"><circle cx="${AX + 18}" cy="${y + 11}" r="5.5"/><path d="M${AX + 15} ${y + 11} H${AX + 21}"/></g>
          <text class="ha-it" data-k="t${i}" x="${AX + 30}" y="${y + 15}">${s}</text>
          <rect class="ha-cover" data-k="cv${i}" y="${y + 3}" height="16"/>
          <path class="ha-pen" data-k="pen${i}" d=""/></g>`;
      }).join("");
      const hdr = (x, sign, label, cls) => `<path class="ha-sign ${cls}" d="${sign === "+" ? `M${x + 13} 36 H${x + 23} M${x + 18} 31 V41` : `M${x + 13} 36 H${x + 23}`}"/>` +
        `<text class="ha-h${cls === "f" ? " f" : ""}" x="${x + 30}" y="40.5">${label}</text>`;
      return `
        <g data-k="forB"><path class="ha-bub" data-k="fb" pathLength="1" d="${FOR}"/>
          <g data-k="fh">${hdr(FX, "+", T.forH, "")}<line class="ha-rule" x1="${FX + 10}" y1="46" x2="${FX + BW - 10}" y2="46"/></g>
          ${pros}</g>
        <g data-k="agB">
          <path class="ha-bub dash" data-k="ab" d="${AGAINST}"/>
          <path class="ha-bub q" data-k="abOn" pathLength="1" d="${AGAINST}"/>
          <g data-k="ahF">${hdr(AX, "-", T.agH, "f")}</g>
          <g data-k="ah">${hdr(AX, "-", T.agH, "q")}<line class="ha-rule" x1="${AX + 10}" y1="46" x2="${AX + BW - 10}" y2="46"/></g>
          <text class="ha-empty" data-k="empty" x="${AX + BW / 2}" y="92">${T.empty}</text>
          <g data-k="spark"><path class="ha-spark" d="M378.6 16.5 L382.8 12.3 M384.9 26.3 H389.1 M369.5 14.4 L370.2 10.2"/></g>
          ${cons}</g>
        <g class="ha-pill" data-k="sure"><rect x="${HX - T.sureW / 2}" y="156" width="${T.sureW}" height="18" rx="9"/><text x="${HX}" y="168.8">${T.sure}</text></g>
        <g data-k="low">
          <line class="ha-ground" x1="14" y1="${G}" x2="386" y2="${G}"/>
          <g data-k="job"><rect class="ha-ln" x="${JX - 16}" y="210" width="32" height="20" rx="3"/>
            <path class="ha-st" d="M${JX - 6} 210 V206 Q${JX - 6} 204 ${JX - 4} 204 H${JX + 4} Q${JX + 6} 204 ${JX + 6} 206 V210 M${JX - 16} 218 H${JX + 16}"/>
            <text class="ha-lab" x="${JX}" y="245">${T.job}</text></g>
          <g data-k="rA"><line class="ha-route" data-k="segA" x1="${A0}" y1="${RY}" y2="${RY}"/>
            <g data-k="quit"><text class="ha-note" x="${(A0 + A1) / 2}" y="212">${T.quit}</text>
              <path class="ha-strike" data-k="strike" pathLength="1" stroke-dasharray="1 1" d="M${(A0 + A1) / 2 - T.quitW / 2 - 3} 209 L${(A0 + A1) / 2 + T.quitW / 2 + 3} 207"/></g>
            <text class="ha-note ok" data-k="notYet" x="${(A0 + A1) / 2}" y="212">${T.notYet}</text></g>
          <g data-k="rB"><line class="ha-route" data-k="segB" x1="${B0}" y1="${RY}" y2="${RY}"/><path class="ha-head" data-k="headB" d="M-5 -5 L0 0 L-5 5"/></g>
          <line class="ha-go" data-k="go" x1="${B0}" y1="${RY}" y2="${RY}"/><path class="ha-head ok" data-k="headG" d="M-5 -5 L0 0 L-5 5"/>
          <g class="ha-pause" data-k="pause"><circle cx="${SX}" cy="${RY}" r="8.5"/><path d="M${SX - 2.8} ${RY - 3.8} V${RY + 3.8} M${SX + 2.8} ${RY - 3.8} V${RY + 3.8}"/></g>
          <g data-k="stall"><path class="ha-st" d="M${SX - 13} 212 V197 M${SX + 13} 212 V197"/>
            <path class="ha-ln" d="M${SX - 19} 197 L${SX - 15} 188 H${SX + 15} L${SX + 19} 197 Z"/><path class="ha-aw" d="${scallops(SX - 19, 197, 4, 9.5)}"/>
            <rect class="ha-ln" x="${SX - 16}" y="212" width="32" height="18" rx="2"/>
            <path class="ha-cup" d="M${SX - 4} 217 h7 v4 a2.5 2.5 0 0 1 -2.5 2.5 h-2 a2.5 2.5 0 0 1 -2.5 -2.5 z M${SX + 3} 218.5 a1.8 1.8 0 0 1 0 3.6"/></g>
          <g data-k="stallL"><text class="ha-lab" x="${SX}" y="245">${T.popup}</text><text class="ha-sub" x="${SX}" y="257">${T.popupSub}</text></g>
          <g data-k="cafe"><path class="ha-ln" d="M${CX - 26} 230 V196 H${CX + 26} V230"/>
            <path class="ha-ln" d="M${CX - 30} 196 L${CX - 25} 184 H${CX + 25} L${CX + 30} 196 Z"/><path class="ha-aw" d="${scallops(CX - 30, 196, 5, 12)}"/>
            <rect class="ha-ln" x="${CX + 8}" y="210" width="12" height="20" rx="1.5"/>
            <rect class="ha-ln" x="${CX - 20}" y="205" width="22" height="16" rx="1.5"/>
            <path class="ha-cup" d="M${CX - 14} 210 h8 v4 a3 3 0 0 1 -3 3 h-2 a3 3 0 0 1 -3 -3 z M${CX - 6} 211.2 a2 2 0 0 1 0 4"/>
            <text class="ha-lab" x="${CX}" y="245">${T.cafe}</text></g>
        </g>
        <g data-k="you"><path class="ha-ln" d="M${HX - 21} ${G} V${G - 7} C${HX - 21} ${G - 19} ${HX - 12} ${G - 26} ${HX} ${G - 26} C${HX + 12} ${G - 26} ${HX + 21} ${G - 19} ${HX + 21} ${G - 7} V${G}"/>
          <circle class="ha-ln" cx="${HX}" cy="${HY}" r="9.5"/>
          <circle class="ha-eye" cx="${HX - 3.6}" cy="${HY - 0.6}" r="1.35"/><circle class="ha-eye" cx="${HX + 3.6}" cy="${HY - 0.6}" r="1.35"/>
          <path class="ha-st" data-k="mouth" style="stroke-width:1.6" d=""/></g>
        <g class="ha-pill q" data-k="bias"><path d="M${FX + 34} 152 L${FX + 40} 145 L${FX + 46} 152 Z"/>
          <rect x="${FX}" y="152" width="${T.biasW}" height="20" rx="10"/><text x="${FX + T.biasW / 2}" y="165.8">${T.bias}</text></g>
        <g class="ha-chk" data-k="done"><circle r="8.5"/><path d="M-3.8 0.4 L-1 3.2 L4.2 -2.8"/></g>`;
    },
    S0: { cafe: 0, you: 0, job: 0, segA: 0, segB: 0, quit: 0, sure: 0, smile: 1,
      f0: 0, f1: 0, f2: 0, fb: 0, ab: 0, abOn: 0, spark: 0, pause: 0, segDim: 0,
      a0: 0, a1: 0, a2: 0, w0: 0, w1: 0, w2: 0, stall: 0, strike: 0, notYet: 0,
      dim: 0, bias: 0, go: 0, done: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = f2(cl(v)); };
      const tr = (key, x, y, extra) => k(key).setAttribute("transform", `translate(${f2(x)} ${f2(y)})${extra || ""}`);
      const pop = (key, cx, cy, p) => k(key).setAttribute("transform", `translate(${cx} ${cy}) scale(${f2(.6 + .4 * p)}) translate(${-cx} ${-cy})`);
      // the "for" side: three articles that agree, then the bubble drawn round them
      for (let i = 0; i < 3; i++) { const p = S["f" + i]; op("f" + i, p * 1.6); tr("f" + i, 10 * (1 - p), 0); }
      const fb = k("fb");
      fb.style.strokeDasharray = "1 1"; fb.style.strokeDashoffset = f2(1 - S.fb); fb.style.fillOpacity = f2(S.fb);
      op("fh", (S.fb - .4) * 2);
      // the "against" side: empty and dashed, then yours to argue
      op("agB", 1 - .45 * S.dim);
      op("ab", S.ab * (1 - S.abOn)); op("ahF", S.ab * (1 - S.abOn)); op("empty", S.ab * (1 - S.abOn * 2));
      const ab = k("abOn");
      ab.style.strokeDasharray = "1 1"; ab.style.strokeDashoffset = f2(1 - S.abOn); ab.style.fillOpacity = f2(S.abOn);
      op("abOn", S.abOn > 0 ? 1 : 0); op("ah", (S.abOn - .3) * 2);
      pop("spark", 380, 20, S.spark); op("spark", S.spark);
      for (let i = 0; i < 3; i++) {
        const p = S["a" + i], w = S["w" + i], y = ROW[i];
        let span = WX1 - WX0;                                      // while writing, the pen runs the length of the words
        if (w > 0 && w < 1) try { span = Math.min(span, k("t" + i).getComputedTextLength() + 3); } catch (e) {}
        const x = WX0 + span * w;
        op("a" + i, p * 1.6); tr("a" + i, 8 * (1 - p), 0);
        const cv = k("cv" + i); cv.setAttribute("x", f2(x)); cv.setAttribute("width", f2(Math.max(0, WX1 + 4 - x)));
        k("pen" + i).setAttribute("d", w > 0 && w < 1 ? `M${f2(x)} ${y + 18} l5 -11` : "");
      }
      // you, your job and the café
      op("sure", S.sure); pop("sure", HX, 165, S.sure);
      op("you", S.you);
      k("mouth").setAttribute("d", `M${HX - 3.5} ${HY + 3.8} Q${HX} ${f2(HY + 3.8 + 3.2 * S.smile)} ${HX + 3.5} ${HY + 3.8}`);
      op("low", 1 - .7 * S.dim);
      op("job", S.job);
      op("cafe", S.cafe); tr("cafe", 0, 8 * (1 - S.cafe));
      // the plan as a route: quit, then straight to the café
      k("segA").setAttribute("x2", f2(A0 + (A1 - A0) * S.segA)); op("segA", S.segA > 0 ? 1 : 0);
      op("quit", S.quit);
      const st = k("strike"); st.style.strokeDashoffset = f2(1 - S.strike); op("strike", S.strike > 0 ? 1 : 0);
      op("notYet", S.notYet);
      const bx = B0 + (B1 - B0) * S.segB;
      k("segB").setAttribute("x2", f2(bx)); op("rB", (S.segB > 0 ? 1 : 0) * (1 - .65 * S.segDim));
      tr("headB", bx + 1, RY); op("headB", (S.segB - .9) * 10);
      // before you commit: a pause, which becomes a weekend pop-up
      op("pause", S.pause); pop("pause", SX, RY, S.pause);
      op("stall", S.stall * 2); tr("stall", 0, 10 * (1 - S.stall)); op("stallL", (S.stall - .5) * 2);
      // the bias it catches
      op("bias", S.bias * 3); tr("bias", 0, -14 * (1 - S.bias));
      // going ahead, eyes open
      const gx = B0 + (B1 - B0) * S.go;
      k("go").setAttribute("x2", f2(gx)); op("go", S.go > 0 ? 1 : 0);
      tr("headG", gx + 1, RY); op("headG", (S.go - .9) * 10);
      tr("done", CX, 170, ` scale(${f2(Math.max(0, S.done))})`); op("done", S.done * 2);
    },
    beats: [
      { steps: [{ to: { cafe: 1 }, ms: 500, ease: "back", sfx: "pluck" }, { to: { you: 1, job: 1 }, ms: 400 },
        { to: { segA: 1 }, ms: 450, ease: "inOut" }, { to: { quit: 1, segB: 1 }, ms: 650, ease: "inOut" },
        { wait: 200 }, { to: { sure: 1 }, ms: 450, ease: "back", sfx: "pop" }] },
      { steps: [{ to: { f0: 1 }, ms: 450, ease: "back", sfx: "tick" }, { wait: 250 }, { to: { f1: 1 }, ms: 450, ease: "back" },
        { wait: 250 }, { to: { f2: 1 }, ms: 450, ease: "back" }] },
      { steps: [{ to: { fb: 1 }, ms: 800, ease: "inOut" }, { wait: 300 }, { to: { ab: 1 }, ms: 600 }] },
      { steps: [{ to: { sure: 0, smile: 0 }, ms: 350 }, { to: { abOn: 1 }, ms: 800, ease: "inOut" },
        { to: { spark: 1 }, ms: 350, ease: "back", sfx: "pop" }, { to: { pause: 1, segDim: 1 }, ms: 400 }] },
      { steps: [{ to: { a0: 1 }, ms: 250 }, { to: { w0: 1 }, ms: 650, ease: "lin", sfx: "scribble" },
        { to: { a1: 1 }, ms: 250 }, { to: { w1: 1 }, ms: 650, ease: "lin" },
        { to: { a2: 1 }, ms: 250 }, { to: { w2: 1 }, ms: 650, ease: "lin", sfx: "scribble" }], hold: 2800 },
      { steps: [{ to: { pause: 0 }, ms: 250 }, { to: { stall: 1, segDim: 0 }, ms: 600, ease: "back", sfx: "pop" }, { wait: 300 },
        { to: { strike: 1 }, ms: 350 }, { to: { quit: 0 }, ms: 250 }, { to: { notYet: 1 }, ms: 350 }], hold: 2800 },
      { steps: [{ to: { dim: 1 }, ms: 500 }, { to: { bias: 1 }, ms: 700, ease: "bounce", sfx: "thud", sfxAt: 260 }], hold: 3000 },
      { steps: [{ to: { dim: 0 }, ms: 450 }, { to: { go: 1 }, ms: 1100, ease: "inOut" },
        { to: { done: 1, smile: 1 }, ms: 450, ease: "back", sfx: "chime" }], hold: 4200 }
    ]
  };
})();
