/* Habit: decide what would change your mind. A new study method, a high-jump bar that keeps
   sliding down under flat scores; then the same bar written down first, locked in place,
   and held when the urge to move it comes. Scene for anim.js. */
(function () {
  const KEY = "habit-change-mind", P = `.bp[data-scene="${KEY}"]`;
  const LP = 190, RP = 378, MID = (LP + RP) / 2, GY = 240;       // the two uprights and the ground
  const Y = s => GY - (s - 50) * 7.2;                            // test score (%) -> y
  const GOAL = 70, SCORES = [61, 63, 56, 62];                    // four weekly tests, flat
  const CXS = SCORES.map((_, i) => LP + (RP - LP) * (i + .5) / 4);
  const CW = 38, CH = 18;                                        // result card
  const TAGX = 158;                                              // centre of the bar's height tag
  const NX = 90, NY = 49;                                        // the note, written before looking
  const f1 = n => +n.toFixed(1);
  const clamp = v => Math.max(0, Math.min(1, v));

  window.BiasAnim.SCENES[KEY] = {
    q: "mem", viewBox: "0 0 400 272",
    css: `
      ${P} .cm-post{fill:none;stroke:var(--ink);stroke-width:2.4;stroke-linecap:round}
      ${P} .cm-ground{stroke:var(--rule);stroke-width:2.2;stroke-linecap:round}
      ${P} .cm-wk{font:500 9.5px var(--mono);fill:var(--faint);text-anchor:middle}
      ${P} .cm-wk.hl{fill:var(--q);font-weight:600}
      ${P} .cm-stem{stroke:var(--faint);stroke-width:2;stroke-dasharray:.1 5;stroke-linecap:round}
      ${P} .cm-card .bg{fill:var(--surface);stroke:var(--muted);stroke-width:1.4}
      ${P} .cm-card .lit{fill:none;stroke:var(--q);stroke-width:1.8}
      ${P} .cm-card .bd{fill:none;stroke:var(--bad);stroke-width:1.8}
      ${P} .cm-card text{font:600 11px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .cm-card .ck{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .cm-bar{fill:none;stroke:var(--q);stroke-width:3.4;stroke-linecap:round}
      ${P} .cm-bar.ok{stroke:var(--good)}
      ${P} .cm-ghost{fill:none;stroke:var(--muted);stroke-width:1.8;stroke-dasharray:4 5;stroke-linecap:round}
      ${P} .cm-gtag rect{fill:none;stroke:var(--muted);stroke-width:1.4;stroke-dasharray:3 3}
      ${P} .cm-gtag text{font:600 11px var(--display);fill:var(--faint);text-anchor:middle}
      ${P} .cm-trail{fill:none;stroke:var(--bad);stroke-width:2;stroke-dasharray:.1 5;stroke-linecap:round}
      ${P} .cm-moved{font:500 9.5px var(--mono);fill:var(--bad);text-anchor:middle}
      ${P} .cm-tag rect{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .cm-tag line{stroke:var(--q);stroke-width:1.8;stroke-linecap:round}
      ${P} .cm-tag text{font:700 11.5px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .cm-tag.ok rect{stroke:var(--good)}
      ${P} .cm-tag.ok line{stroke:var(--good)}
      ${P} .cm-tag.ok text{fill:var(--good)}
      ${P} .cm-lock{--lc:var(--q)}
      ${P} .cm-lock.ok{--lc:var(--good)}
      ${P} .cm-lock path{fill:none;stroke:var(--lc);stroke-width:2;stroke-linecap:round}
      ${P} .cm-lock rect{fill:var(--surface);stroke:var(--lc);stroke-width:2}
      ${P} .cm-lock circle{fill:var(--lc)}
      ${P} .cm-urge{fill:none;stroke:var(--bad);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .cm-warn .i{fill:var(--surface);stroke:var(--bad);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .cm-warn .s{fill:none;stroke:var(--bad);stroke-width:1.8;stroke-linecap:round}
      ${P} .cm-warn circle{fill:var(--bad)}
      ${P} .cm-warn text{font:600 10px var(--mono);fill:var(--bad)}
      ${P} .cm-man circle,${P} .cm-man path{fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .cm-bub .sb{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .cm-bub .sbad{fill:none;stroke:var(--bad);stroke-width:1.8}
      ${P} .cm-bub .sok{fill:none;stroke:var(--good);stroke-width:1.8}
      ${P} .cm-big{font:700 13px var(--display);fill:var(--ink)}
      ${P} .cm-say{font:600 11.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .cm-say.bad{fill:var(--bad)}
      ${P} .cm-sw{font:700 12px var(--display);fill:var(--good)}
      ${P} .cm-ico{fill:var(--surface);stroke:var(--ink);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .cm-ico.ok{fill:none;stroke:var(--good)}
      ${P} .cm-note .pa{fill:var(--surface);stroke:var(--ink);stroke-width:1.6}
      ${P} .cm-note .tape{fill:var(--q);fill-opacity:.35}
      ${P} .cm-note .h{font:500 9px var(--mono);fill:var(--muted)}
      ${P} .cm-note .l{font:600 11px var(--display);fill:var(--ink)}
      ${P} .cm-note .hl{fill:var(--q)}
      ${P} .cm-check{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
      ${P} .cm-badge rect{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .cm-badge .lb{font:500 9px var(--mono);fill:var(--muted)}
      ${P} .cm-badge .nm{font:600 12.5px var(--display);fill:var(--ink)}
      ${P} .cm-boom{fill:var(--q);stroke:var(--q);stroke-width:1;stroke-linejoin:round}
    `,
    text: {
      hu: {
        name: "Döntsd el, mi változtatná meg a véleményed",
        shareTitle: "Döntsd el, mi változtatná meg a véleményed: egy szokás 30 másodpercben",
        ecline: "Állítsd be a mércét, mielőtt megjönnek a bizonyítékok, és ne mozgasd meg, amikor megérkeznek.",
        wk: "hét", works: "Működik!", more: ["Csak kell", "még idő…"], sw: ["Ideje", "váltani"],
        moved: "a mérce elmozdult", warn: "figyelmeztető jel", bell: false,
        catches: "elkapja", bias: "Visszahatási hatás",
        noteH: "mielőtt megnézem:",
        note: ["Ha nem leszek <tspan class=\"hl\">70%</tspan>-on", "a <tspan class=\"hl\">4. hétre</tspan>,", "módszert váltok."],
        caps: [
          "Új tanulási módszert kezdesz, biztos vagy benne, hogy <b>70%</b>-ra visz.",
          "Az eredményeid állva maradnak, de mindegyiket <b>jó jelnek</b> olvasod.",
          "Amikor elmaradnak, elmozdítod a mércét: „Csak kell <b>még idő</b>.”",
          "<b>A szokás:</b> mielőtt megnézed, írd le, mi változtatná meg a <b>véleményedet</b>.",
          "<b>Rögzítsd azt a mércét</b>. Aztán hagyd, hogy megjöjjenek az eredmények.",
          "Elmaradnak. Kísért, hogy elmozdítsd a mércét? Ez a <b>figyelmeztető jel</b>.",
          "Ez a szokás elkapja a <b>visszahatási hatást</b>: makacsul ragaszkodsz valamihez, amikor a bizonyíték ellene szól.",
          "A mérce megmaradt. <b>Módszert váltasz</b>, ahelyett hogy várnál és reménykednél."
        ],
        say: [
          "Új tanulási módszert kezdesz, biztos vagy benne, hogy hetven százalékra visz.",
          "Az eredményeid állva maradnak, de mindegyiket jó jelnek olvasod.",
          "Amikor elmaradnak, elmozdítod a mércét. Csak több idő kell.",
          "A szokás: mielőtt megnézed, írd le, mi változtatná meg a véleményedet.",
          "Rögzítsd azt a mércét. Aztán hagyd, hogy megjöjjenek az eredmények.",
          "Elmaradnak. Kísért, hogy elmozdítsd a mércét? Ez a figyelmeztető jel.",
          "Ez a szokás elkapja a visszahatási hatást: makacsul ragaszkodsz valamihez, amikor a bizonyíték ellene szól.",
          "A mérce megmaradt. Módszert váltasz, ahelyett hogy várnál és reménykednél.",
          "Döntsd el, mi változtatná meg a véleményed. Állítsd be a mércét, mielőtt megjönnek a bizonyítékok, és ne mozgasd meg, amikor megérkeznek."
        ]
      },
      en: {
        name: "Decide what would change your mind",
        shareTitle: "Decide what would change your mind: a habit in 30 seconds",
        ecline: "Set the bar before the evidence comes in, and don't move it once it does.",
        wk: "wk", works: "It works!", more: ["It just needs", "more time…"], sw: ["Time to", "switch"],
        moved: "the bar moved", warn: "warning sign", bell: false,
        catches: "catches", bias: "Backfire effect",
        noteH: "before I look:",
        note: ["If I'm not at <tspan class=\"hl\">70%</tspan>", "by <tspan class=\"hl\">week 4</tspan>,", "I switch methods."],
        caps: [
          "You start a new study method, sure it'll get you to <b>70%</b>.",
          "Your scores stay flat, but you read each one as <b>a good sign</b>.",
          "When they fall short, you move the bar: “It just needs <b>more time</b>.”",
          "<b>The habit:</b> before you look, write down what would <b>change your mind</b>.",
          "<b>Lock that bar</b> in place. Then let the results come in.",
          "They fall short. Tempted to move the bar? That's the <b>warning sign</b>.",
          "It catches the <b>backfire effect</b>: digging in when evidence goes against you.",
          "The bar held. You <b>switch methods</b> instead of waiting and hoping."
        ],
        say: [
          "You start a new study method, sure it'll get you to seventy percent.",
          "Your scores stay flat, but you read each one as a good sign.",
          "When they fall short, you move the bar. It just needs more time.",
          "The habit: before you look, write down what would change your mind.",
          "Lock that bar in place. Then let the results come in.",
          "They fall short. Tempted to move the bar? That's the warning sign.",
          "It catches the backfire effect: digging in when the evidence goes against you.",
          "The bar held. You switch methods, instead of waiting and hoping.",
          "Decide what would change your mind. Set the bar before the evidence comes in, and don't move it once it does."
        ]
      },
      el: {
        name: "Αποφάσισε τι θα σε έκανε να αλλάξεις γνώμη",
        shareTitle: "Αποφάσισε τι θα σε έκανε να αλλάξεις γνώμη: μια συνήθεια σε 30 δευτερόλεπτα",
        ecline: "Βάλε τον πήχη πριν έρθουν τα στοιχεία και μην τον μετακινήσεις όταν φτάσουν.",
        wk: "εβδ.", works: "Δουλεύει!", more: ["Θέλει λίγο", "χρόνο ακόμα…"], sw: ["Ώρα για", "αλλαγή"],
        moved: "ο πήχης κατέβηκε", warn: "καμπανάκι", bell: true,
        catches: "σε προστατεύει από", bias: "Φαινόμενο μπούμερανγκ",
        noteH: "πριν κοιτάξω:",
        note: ["Αν ως την <tspan class=\"hl\">4η εβδομάδα</tspan>", "δεν έχω φτάσει το <tspan class=\"hl\">70%</tspan>,", "αλλάζω μέθοδο."],
        caps: [
          "Ξεκινάς νέα μέθοδο διαβάσματος. Σίγουρα θα σε ανεβάσει στο <b>70%</b>.",
          "Οι βαθμοί σου δεν ανεβαίνουν, αλλά σε κάθε τεστ βλέπεις <b>καλό σημάδι</b>.",
          "Όταν μένουν χαμηλά, κατεβάζεις τον\u00a0πήχη: «Θέλει <b>λίγο χρόνο ακόμα</b>».",
          "<b>Η συνήθεια:</b> πριν κοιτάξεις, γράψε τι θα σε έκανε να <b>αλλάξεις γνώμη</b>.",
          "<b>Κλείδωσε τον πήχη</b> στη θέση\u00a0του. Μετά δες τα αποτελέσματα.",
          "Μένουν κάτω από τον πήχη. Θες να τον κατεβάσεις; Εδώ <b>χτυπάει καμπανάκι</b>.",
          "Έτσι πιάνεις το <b>φαινόμενο μπούμερανγκ</b>: πεισμώνεις όταν τα στοιχεία σε διαψεύδουν.",
          "Ο πήχης δεν κουνήθηκε. <b>Αλλάζεις μέθοδο</b> αντί να περιμένεις και να ελπίζεις."
        ],
        say: [
          "Ξεκινάς νέα μέθοδο διαβάσματος. Σίγουρα θα σε ανεβάσει στο εβδομήντα τοις εκατό.",
          "Οι βαθμοί σου δεν ανεβαίνουν, αλλά σε κάθε τεστ βλέπεις καλό σημάδι.",
          "Όταν μένουν χαμηλά, κατεβάζεις τον πήχη. Θέλει λίγο χρόνο ακόμα.",
          "Η συνήθεια: πριν κοιτάξεις, γράψε τι θα σε έκανε να αλλάξεις γνώμη.",
          "Κλείδωσε τον πήχη στη θέση του. Μετά δες τα αποτελέσματα.",
          "Μένουν κάτω από τον πήχη. Θες να τον κατεβάσεις; Εδώ χτυπάει καμπανάκι.",
          "Έτσι πιάνεις το φαινόμενο μπούμερανγκ: πεισμώνεις όταν τα στοιχεία σε διαψεύδουν.",
          "Ο πήχης δεν κουνήθηκε. Αλλάζεις μέθοδο, αντί να περιμένεις και να ελπίζεις.",
          "Αποφάσισε τι θα σε έκανε να αλλάξεις γνώμη. Βάλε τον πήχη πριν έρθουν τα στοιχεία και μην τον μετακινήσεις όταν φτάσουν."
        ]
      },
      es: {
        name: "Decide qué te haría cambiar de opinión",
        shareTitle: "Decide qué te haría cambiar de opinión: un hábito en 30 segundos",
        ecline: "Pon el listón antes de que lleguen las pruebas, y no lo muevas cuando lleguen.",
        wk: "sem.", works: "¡Funciona!", more: ["Solo necesita", "más tiempo…"], sw: ["Hora de", "cambiar"],
        moved: "el listón bajó", warn: "señal de alarma", bell: false,
        catches: "detecta", bias: "Efecto contraproducente",
        noteH: "antes de mirar:",
        note: ["Si no llego al <tspan class=\"hl\">70%</tspan>", "en la <tspan class=\"hl\">semana 4</tspan>,", "cambio de método."],
        caps: [
          "Empiezas un nuevo método de estudio, seguro de que te llevará al <b>70%</b>.",
          "Tus notas no suben, pero ves cada una como <b>una buena señal</b>.",
          "Cuando no llegan, mueves el listón: «Solo necesita <b>más tiempo</b>».",
          "<b>El hábito:</b> antes de mirar, escribe qué te haría <b>cambiar de opinión</b>.",
          "<b>Fija ese listón</b>. Luego deja que lleguen los resultados.",
          "No llegan. ¿Tienes ganas de mover el listón? Esa es la <b>señal de alarma</b>.",
          "Detecta el <b>efecto contraproducente</b>: aferrarte más cuando las pruebas te contradicen.",
          "El listón aguantó. <b>Cambias de método</b> en vez de esperar y cruzar los dedos."
        ],
        say: [
          "Empiezas un nuevo método de estudio, seguro de que te llevará al setenta por ciento.",
          "Tus notas no suben, pero ves cada una como una buena señal.",
          "Cuando no llegan, mueves el listón. Solo necesita más tiempo.",
          "El hábito: antes de mirar, escribe qué te haría cambiar de opinión.",
          "Fija ese listón. Luego deja que lleguen los resultados.",
          "No llegan. ¿Tienes ganas de mover el listón? Esa es la señal de alarma.",
          "Detecta el efecto contraproducente: aferrarte más cuando las pruebas te contradicen.",
          "El listón aguantó. Cambias de método, en vez de esperar y cruzar los dedos.",
          "Decide qué te haría cambiar de opinión. Pon el listón antes de que lleguen las pruebas, y no lo muevas cuando lleguen."
        ]
      },
      fr: {
        name: "Décidez ce qui vous ferait changer d’avis",
        shareTitle: "Décidez ce qui vous ferait changer d’avis : une habitude en 30 secondes",
        ecline: "Placez la barre avant que les faits arrivent, et ne la bougez plus une fois qu’ils sont là.",
        wk: "sem.", works: "Ça marche !", more: ["Il faut juste", "plus de temps…"], sw: ["Il est temps", "de changer"],
        moved: "la barre a bougé", warn: "signal d’alarme", bell: false,
        catches: "déjoue", bias: "Effet retour de flamme",
        noteH: "avant de regarder :",
        note: ["Si je ne suis pas à <tspan class=\"hl\">70 %</tspan>", "à la <tspan class=\"hl\">semaine 4</tspan>,", "je change de méthode."],
        caps: [
          "Vous adoptez une nouvelle méthode de révision : elle vous mènera à <b>70 %</b>, c’est sûr.",
          "Vos notes stagnent, mais vous voyez dans chacune <b>un bon signe</b>.",
          "Quand elles restent trop basses, vous baissez la barre : « Il faut juste <b>plus de temps</b>. »",
          "<b>L’habitude :</b> avant de regarder, écrivez ce qui vous ferait <b>changer d’avis</b>.",
          "<b>Verrouillez cette barre</b>. Puis laissez venir les résultats.",
          "Notes trop basses. Envie de baisser la barre ? Voilà le <b>signal d’alarme</b>.",
          "Elle déjoue l’<b>effet retour de flamme</b> : s’entêter quand les faits vous contredisent.",
          "La barre a tenu. Vous <b>changez de méthode</b> au lieu d’attendre en espérant."
        ],
        say: [
          "Vous adoptez une nouvelle méthode de révision. Elle vous mènera à soixante-dix pour cent, c’est sûr.",
          "Vos notes stagnent, mais vous voyez dans chacune un bon signe.",
          "Quand elles restent trop basses, vous baissez la barre. Il faut juste plus de temps.",
          "L’habitude : avant de regarder, écrivez ce qui vous ferait changer d’avis.",
          "Verrouillez cette barre. Puis laissez venir les résultats.",
          "Notes trop basses. Envie de baisser la barre ? Voilà le signal d’alarme.",
          "Elle déjoue l’effet retour de flamme : s’entêter quand les faits vous contredisent.",
          "La barre a tenu. Vous changez de méthode, au lieu d’attendre en espérant.",
          "Décidez ce qui vous ferait changer d’avis. Placez la barre avant que les faits arrivent, et ne la bougez plus une fois qu’ils sont là."
        ]
      },
      de: {
        name: "Leg fest, was dich umstimmen würde",
        shareTitle: "Leg fest, was dich umstimmen würde: eine Gewohnheit in 30 Sekunden",
        ecline: "Leg die Latte auf, bevor die Ergebnisse kommen, und rühr sie danach nicht mehr an.",
        wk: "Wo.", works: "Es klappt!", more: ["Es braucht nur", "mehr Zeit…"], sw: ["Zeit zu", "wechseln"],
        moved: "Latte verschoben", warn: "Warnsignal", bell: false,
        catches: "hilft gegen", bias: "Bumerangeffekt",
        noteH: "bevor ich nachsehe:",
        note: ["Wenn ich bis <tspan class=\"hl\">Woche 4</tspan>", "nicht bei <tspan class=\"hl\">70 %</tspan> bin,", "wechsle ich die Methode."],
        caps: [
          "Du startest eine neue Lernmethode, sicher, dass sie dich auf <b>70 %</b> bringt.",
          "Deine Ergebnisse treten auf der Stelle, doch du deutest jedes als <b>gutes Zeichen</b>.",
          "Reichen sie nicht, verschiebst du die Latte: „Es braucht nur <b>mehr Zeit</b>.“",
          "<b>Die Gewohnheit:</b> Bevor du nachsiehst, schreib auf, was <b>dich umstimmen würde</b>.",
          "<b>Fixiere diese Latte</b>. Dann lass die Ergebnisse kommen.",
          "Sie reichen nicht. Lust, die Latte zu verschieben? Das ist das <b>Warnsignal</b>.",
          "Diese Gewohnheit fängt den <b>Bumerangeffekt</b> ab: sich einzugraben, wenn die Belege gegen dich sprechen.",
          "Die Latte hält. Du <b>wechselst die Methode</b>, statt zu warten und zu hoffen."
        ],
        say: [
          "Du startest eine neue Lernmethode, sicher, dass sie dich auf siebzig Prozent bringt.",
          "Deine Ergebnisse treten auf der Stelle, doch du deutest jedes als gutes Zeichen.",
          "Reichen sie nicht, verschiebst du die Latte. Es braucht nur mehr Zeit.",
          "Die Gewohnheit: Bevor du nachsiehst, schreib auf, was dich umstimmen würde.",
          "Fixiere diese Latte. Dann lass die Ergebnisse kommen.",
          "Sie reichen nicht. Lust, die Latte zu verschieben? Das ist das Warnsignal.",
          "Diese Gewohnheit fängt den Bumerangeffekt ab: sich einzugraben, wenn die Belege gegen dich sprechen.",
          "Die Latte hält. Du wechselst die Methode, statt zu warten und zu hoffen.",
          "Leg fest, was dich umstimmen würde. Leg die Latte auf, bevor die Ergebnisse kommen, und rühr sie danach nicht mehr an."
        ]
      },
      it: {
        name: "Decidi cosa ti farebbe cambiare idea",
        shareTitle: "Decidi cosa ti farebbe cambiare idea: un’abitudine in 30 secondi",
        ecline: "Fissa l’asticella prima che arrivino i fatti, e non spostarla quando arrivano.",
        wk: "sett.", works: "Funziona!", more: ["Serve solo", "più tempo…"], sw: ["È ora di", "cambiare"],
        moved: "l’asticella è scesa", warn: "campanello", bell: true,
        catches: "smaschera", bias: "Effetto boomerang",
        noteH: "prima di guardare:",
        note: ["Se non arrivo al <tspan class=\"hl\">70%</tspan>", "entro la <tspan class=\"hl\">settimana 4</tspan>,", "cambio metodo."],
        caps: [
          "Inizi un nuovo metodo di studio, sicuro di arrivare al <b>70%</b>.",
          "I tuoi punteggi non salgono, ma in ognuno vedi <b>un buon segno</b>.",
          "Quando restano sotto, sposti l’asticella: «Serve solo <b>più tempo</b>».",
          "<b>L’abitudine:</b> prima di guardare, scrivi cosa ti <b>farebbe cambiare idea</b>.",
          "<b>Blocca l’asticella</b> lì. Poi lascia arrivare i risultati.",
          "Restano sotto. Hai voglia di spostare l’asticella? È il <b>campanello d’allarme</b>.",
          "Smaschera <b>l’effetto boomerang</b>: ostinarti quando i fatti ti danno torto.",
          "L’asticella ha tenuto. <b>Cambi metodo</b> invece di aspettare e sperare."
        ],
        say: [
          "Inizi un nuovo metodo di studio, sicuro di arrivare al settanta per cento.",
          "I tuoi punteggi non salgono, ma in ognuno vedi un buon segno.",
          "Quando restano sotto, sposti l’asticella. Serve solo più tempo.",
          "L’abitudine: prima di guardare, scrivi cosa ti farebbe cambiare idea.",
          "Blocca l’asticella lì. Poi lascia arrivare i risultati.",
          "Restano sotto. Hai voglia di spostare l’asticella? È il campanello d’allarme.",
          "Smaschera l’effetto boomerang: ostinarti quando i fatti ti danno torto.",
          "L’asticella ha tenuto. Cambi metodo, invece di aspettare e sperare.",
          "Decidi cosa ti farebbe cambiare idea. Fissa l’asticella prima che arrivino i fatti, e non spostarla quando arrivano."
        ]
      }
    },
    svg(T) {
      const y70 = Y(GOAL);
      // the high-jump stand, as in the habit's tile
      const frame = `<g data-k="frame">
          <line class="cm-ground" x1="${LP - 20}" y1="${GY}" x2="${RP + 8}" y2="${GY}"/>
          <path class="cm-post" d="M${LP} ${GY} V58 M${RP} ${GY} V58 M${LP - 7} ${GY} H${LP + 7} M${RP - 7} ${GY} H${RP + 7}"/>
          ${CXS.map((x, i) => `<text class="cm-wk" x="${x}" y="${GY + 16}">${T.wk} ${i + 1}</text>`).join("")}
          <text class="cm-wk hl" data-k="wk4" x="${CXS[3]}" y="${GY + 16}">${T.wk} 4</text></g>`;
      const cards = SCORES.map((s, i) => `<line class="cm-stem" data-k="s${i}" x1="${CXS[i]}" x2="${CXS[i]}" y1="${GY}" y2="${GY}"/>
        <g class="cm-card" data-k="c${i}"><rect class="bg" x="${-CW / 2}" y="${-CH}" width="${CW}" height="${CH}" rx="4"/>
          <rect class="lit" data-k="l${i}" x="${-CW / 2}" y="${-CH}" width="${CW}" height="${CH}" rx="4"/>
          <rect class="bd" data-k="b${i}" x="${-CW / 2}" y="${-CH}" width="${CW}" height="${CH}" rx="4"/>
          <text data-k="t${i}" y="-5">${s}%</text><path class="ck" data-k="k${i}" d="M8.5 -9.5 l2.8 2.8 l4.7 -5.6"/></g>`).join("");
      const lock = (x, s) => `<g class="cm-lock" data-k="lk${s}"><g transform="translate(${x} ${y70}) scale(1.3)">
          <path data-k="lk${s}s" d="M-4 3 V-2 A4 4 0 0 1 4 -2 V3"/><rect x="-7" y="2.5" width="14" height="11" rx="2.5"/><circle cx="0" cy="8" r="1.4"/></g></g>`;
      const tag = cls => `<g class="cm-tag${cls}"><line x1="${TAGX + 20}" x2="${LP - 2}" y1="0" y2="0"/><rect x="${TAGX - 20}" y="-9" width="40" height="18" rx="5"/><text data-k="tagt${cls ? 2 : 1}" x="${TAGX}" y="4">70%</text></g>`;
      const warnIcon = T.bell
        ? `<path class="i" d="M-7 5 H7 C5 3 5 1 5 -2 C5 -6 3 -8 0 -8 C-3 -8 -5 -6 -5 -2 C-5 1 -5 3 -7 5 Z M0 -8 V-10"/><path class="s" d="M-2 8 A2 2 0 0 0 2 8 M-10 -6 Q-11.5 -2 -9.5 1.5 M10 -6 Q11.5 -2 9.5 1.5"/>`
        : `<path class="i" d="M0 -10 L10 7 H-10 Z"/><path class="s" d="M0 -4 V1"/><circle cx="0" cy="3.8" r="1.2"/>`;
      const bubShape = cls => `<rect class="${cls}" x="12" y="106" width="120" height="50" rx="14"/><circle class="${cls}" cx="46" cy="168" r="4.2"/><circle class="${cls}" cx="41" cy="180" r="2.6"/>`;
      return `${frame}${cards}
        <g data-k="ghost"><line class="cm-ghost" x1="${LP}" x2="${RP}" y1="${y70}" y2="${y70}"/>
          <g class="cm-gtag"><rect x="${TAGX - 20}" y="${y70 - 9}" width="40" height="18" rx="5"/><text x="${TAGX}" y="${y70 + 4}">70%</text></g></g>
        <path class="cm-trail" data-k="trail" d=""/>
        <text class="cm-moved" data-k="moved" x="${MID}" y="118">${T.moved}</text>
        <g data-k="bars"><path class="cm-bar" data-k="bar" d=""/><path class="cm-bar ok" data-k="barok" d=""/></g>
        <path class="cm-urge" data-k="urge" d=""/>
        <g data-k="tag">${tag("")}<g data-k="tagok">${tag(" ok")}</g></g>
        ${lock(LP, "L")}${lock(RP, "R")}
        <g class="cm-warn" data-k="warn">${warnIcon}<text x="15" y="4">${T.warn}</text></g>
        <g class="cm-note" data-k="note"><rect class="pa" x="-78" y="-33" width="156" height="66" rx="4"/>
          <rect class="tape" x="-20" y="-38" width="40" height="11" rx="2" transform="rotate(3)"/>
          <text class="h" x="-66" y="-16">${T.noteH}</text>
          ${T.note.map((l, i) => `<text class="l" data-k="nl${i}" x="-66" y="${1 + i * 13.5}">${l}</text>`).join("")}
          <path class="cm-check" data-k="nck" d="M52 -21 l4 4 l9 -10"/></g>
        <g class="cm-bub" data-k="bub">${bubShape("sb")}<g data-k="bubBad">${bubShape("sbad")}</g><g data-k="bubOk">${bubShape("sok")}</g>
          <g data-k="bw"><path class="cm-ico" transform="translate(23 123)" d="M0 2 C3.5 0 7.5 0 11 2 V16 C7.5 14 3.5 14 0 16 Z M11 2 C14.5 0 18.5 0 22 2 V16 C18.5 14 14.5 14 11 16 Z"/>
            <text class="cm-big" x="53" y="136">${T.works}</text></g>
          <g data-k="bm">${T.more.map((l, i) => `<text class="cm-say" x="72" y="${128 + i * 15}">${l}</text>`).join("")}</g>
          <g data-k="bmBad">${T.more.map((l, i) => `<text class="cm-say bad" x="72" y="${128 + i * 15}">${l}</text>`).join("")}</g>
          <g data-k="bs"><path class="cm-ico ok" transform="translate(23 122)" d="M1 5 H17 M13 1 L17 5 L13 9 M19 13 H3 M7 9 L3 13 L7 17"/>
            ${T.sw.map((l, i) => `<text class="cm-sw" x="52" y="${128 + i * 15}">${l}</text>`).join("")}</g></g>
        <g class="cm-man" data-k="man"><circle cx="40" cy="214" r="9"/><path d="M20 252 V247 a20 17 0 0 1 40 0 V252"/></g>
        <g class="cm-badge" data-k="badge"><rect x="180" y="10" width="206" height="38" rx="10"/>
          <g transform="translate(201 29)"><path class="cm-boom" data-k="boom" d="M-11 5 C-9 -2 -5 -7 0 -8 C5 -7 9 -2 11 5 A2.6 2.6 0 0 1 6.5 7 C5 2 3 -1.5 0 -2.5 C-3 -1.5 -5 2 -6.5 7 A2.6 2.6 0 0 1 -11 5 Z"/></g>
          <text class="lb" x="222" y="25">${T.catches}</text><text class="nm" x="222" y="41">${T.bias}</text></g>`;
    },
    S0: { frame: 0, man: 0, bub: 0, nod: 0, bw: 0, bm: 0, bs: 0, bubBad: 0, bubGood: 0,
      barOp: 0, barV: GOAL, tug: 0, ghost: 0, moved: 0, good: 0,
      c0: 0, c1: 0, c2: 0, c3: 0, k0: 0, k1: 0, k2: 0, k3: 0, cOut: 0, bad: 0,
      note: 0, nl: 0, wk4: 0, nck: 0, lock: 0, urge: 0, warn: 0, badge: 0, boom: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = v; };
      op("frame", S.frame); op("wk4", S.wk4);
      op("man", S.man);
      // the thought bubble: belief, excuse, and finally the switch
      k("bub").setAttribute("transform", `translate(${f1(6 * (1 - S.bub))} ${f1(6 * (1 - S.bub))}) rotate(${f1(S.nod * 3)} 72 131)`);
      op("bub", S.bub);
      op("bubBad", S.bubBad); op("bubOk", S.bubGood);
      op("bw", S.bw); op("bm", S.bm * (1 - S.bubBad)); op("bmBad", S.bm * S.bubBad); op("bs", S.bs);
      // weekly results rise from the ground to their score
      for (let i = 0; i < 4; i++) {
        const r = S["c" + i], cy = GY - (GY - Y(SCORES[i])) * r, o = clamp(r * 5) * (1 - S.cOut);
        k("c" + i).setAttribute("transform", `translate(${f1(CXS[i])} ${f1(cy + 10 * S.cOut)})`);
        op("c" + i, o);
        k("s" + i).setAttribute("y2", f1(cy)); op("s" + i, o);
        op("l" + i, S["k" + i]); op("k" + i, S["k" + i]); op("b" + i, S.bad);
        k("t" + i).setAttribute("x", f1(-5.5 * S["k" + i]));
      }
      // the bar: slides when it's loose, bows (but holds) when it's locked
      const y70 = Y(GOAL), by = Y(S.barV), d = `M${LP} ${f1(by)} Q${MID} ${f1(by + 2 * S.tug)} ${RP} ${f1(by)}`;
      k("bar").setAttribute("d", d); k("barok").setAttribute("d", d);
      op("bars", S.barOp); op("barok", S.good);
      k("tag").setAttribute("transform", `translate(0 ${f1(by)})`);
      const tv = Math.round(S.barV) + "%";
      k("tagt1").textContent = tv; k("tagt2").textContent = tv;
      op("tag", S.barOp); op("tagok", S.good);
      const away = clamp((GOAL - S.barV) / 3);
      op("ghost", S.ghost * away);
      k("trail").setAttribute("d", `M${TAGX} ${y70 + 12} V${f1(Math.max(y70 + 12, by - 12))}`);
      op("trail", S.ghost * clamp((by - y70 - 26) / 8));
      op("moved", S.moved);
      const uy = by + S.tug - 24;                                   // the urge pushes down on the middle of the bar
      k("urge").setAttribute("d", `M${MID} ${f1(uy)} V${f1(uy + 17)} M${MID - 5} ${f1(uy + 12)} L${MID} ${f1(uy + 17)} L${MID + 5} ${f1(uy + 12)}`);
      op("urge", S.urge);
      // padlocks drop onto both uprights and snap shut
      const drop = clamp(S.lock / .6), close = clamp((S.lock - .6) / .4);
      [["L", LP, 1], ["R", RP, -1]].forEach(([s, x, dir]) => {
        const g = k("lk" + s);
        g.setAttribute("transform", `translate(0 ${f1(-16 * (1 - drop))}) rotate(${f1(dir * S.tug * .7)} ${x} ${y70 + 8})`);
        g.style.opacity = clamp(S.lock * 3);
        g.classList.toggle("ok", S.good > .5);
        k("lk" + s + "s").setAttribute("transform", `translate(0 ${f1(-4 * (1 - close))})`);
      });
      k("warn").setAttribute("transform", `translate(262 75) scale(${f1((.6 + .4 * S.warn) * 100) / 100})`);
      op("warn", S.warn);
      // the note, written before looking
      const np = S.note;
      k("note").setAttribute("transform", `translate(${NX} ${f1(NY + 14 * (1 - np))}) rotate(${f1(-1.8 - 4 * (1 - np))})`);
      op("note", clamp(np * 1.6));
      for (let i = 0; i < 3; i++) op("nl" + i, clamp(S.nl - i));
      const ck = k("nck"); ck.style.strokeDasharray = "22"; ck.style.strokeDashoffset = f1(22 * (1 - S.nck));
      op("nck", S.nck > 0 ? 1 : 0);
      // the bias it catches
      k("badge").setAttribute("transform", `translate(283 29) scale(${f1((.85 + .15 * S.badge) * 100) / 100}) translate(-283 -29)`);
      op("badge", S.badge);
      k("boom").setAttribute("transform", `rotate(${f1(-25 + S.boom * 720)})`);
    },
    beats: [
      { steps: [{ to: { frame: 1 }, ms: 500, sfx: "pluck" }, { to: { man: 1 }, ms: 300 }, { to: { bub: 1, bw: 1 }, ms: 450, ease: "back" },
        { to: { nod: 1 }, ms: 220 }, { to: { nod: -1 }, ms: 300, ease: "inOut" }, { to: { nod: 0 }, ms: 260, ease: "inOut" },
        { to: { barOp: 1 }, ms: 500 }] },
      { steps: [0, 1, 2, 3].flatMap(i => [{ to: { ["c" + i]: 1 }, ms: 420, ease: "back", sfx: i ? undefined : "pop" }, { to: { ["k" + i]: 1 }, ms: 200 }, { wait: 150 }]) },
      { steps: [{ to: { bw: 0, bm: 1 }, ms: 400 }, { to: { ghost: 1 } }, { to: { barV: 60 }, ms: 900, ease: "back", sfx: "spring" }, { wait: 350 },
        { to: { barV: 55 }, ms: 700, ease: "back" }, { to: { moved: 1 }, ms: 300 }], hold: 3000 },
      { steps: [{ to: { cOut: 1, bub: 0, moved: 0 }, ms: 400 }, { to: { barV: GOAL, ghost: 0 }, ms: 700, ease: "inOut" },
        { to: { c0: 0, c1: 0, c2: 0, c3: 0, k0: 0, k1: 0, k2: 0, k3: 0, cOut: 0 } },
        { to: { note: 1 }, ms: 500, ease: "back" }, { to: { nl: 3 }, ms: 1400, ease: "lin", sfx: "scribble" }, { to: { wk4: 1 }, ms: 300 }], hold: 2800 },
      { steps: [{ to: { lock: 1 }, ms: 700, sfx: "thud", sfxAt: 420 }, { wait: 300 },
        ...[0, 1, 2, 3].flatMap(i => [{ to: { ["c" + i]: 1 }, ms: 420, ease: "out" }, { wait: 120 }])] },
      { steps: [{ to: { bad: 1 }, ms: 400 }, { to: { bub: 1, bubBad: 1 }, ms: 400 },
        { to: { tug: 12, urge: 1 }, ms: 550, ease: "inOut", sfx: "spring" }, { to: { tug: 0 }, ms: 600, ease: "back" },
        { to: { warn: 1, urge: 0 }, ms: 350, ease: "back", sfx: "tick" }], hold: 3000 },
      { steps: [{ to: { warn: 0 }, ms: 300 }, { to: { badge: 1 }, ms: 500, ease: "back", sfx: "whoosh" }, { to: { boom: 1 }, ms: 900, ease: "inOut" }], hold: 3000 },
      { steps: [{ to: { bm: 0, bs: 1, bubBad: 0, bubGood: 1 }, ms: 450 }, { to: { good: 1 }, ms: 500 },
        { to: { nck: 1 }, ms: 350, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
