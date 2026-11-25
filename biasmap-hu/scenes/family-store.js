/* How it was stored (the "store" family): memory as a card drawer. Every fact is filed with a thread
   to a recall rail, and how you met the fact decides how thick the thread is: skimmed or asked why
   (levels of processing), reread or quizzed (testing effect), looked up on a phone (Google effect).
   A week later you pull: thick threads bring their cards back out, thin ones snap. Quizzing yourself
   and explaining it in your own words re-tie the thin ones; the rest can stay on the phone.
   Scene for anim.js. */
(function () {
  const KEY = "family-store", P = `.bp[data-scene="${KEY}"]`;
  const CW = 56, CH = 96;                                    // index cards
  const CX = [32, 94, 172, 234, 312];                        // card left edges, in three groups
  const CC = CX.map(x => x + CW / 2);                        // card centres, and the pegs above them
  const GC = [91, 231, 340];                                 // label holders on the drawer front
  const RY = 30;                                             // the recall rail
  const T0 = 126, T1 = 60;                                   // card top: filed, pulled back out
  const FY = 178, FB = 222;                                  // drawer front: top, bottom
  const BY = 160;                                            // back edge of the open drawer
  const HY = 184, HH = 30;                                   // label holders
  const PX = 340, PY = 102;                                   // the "look it up" pill, above the phone card
  const THIN = [0, 2, 4], THICK = [1, 3];
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  // everything you see in a day: little cards scattered above the drawer (centre x, centre y, tilt)
  const CLOUD = [[40, 52, -8], [118, 48, 6], [196, 54, -4], [264, 47, 9], [340, 53, -6],
    [78, 82, 7], [152, 80, -9], [228, 84, 4], [302, 79, -7], [366, 85, 5],
    [38, 112, 5], [114, 110, -6], [188, 113, 8], [264, 109, -3], [340, 112, 6]];
  const POP = [0, 5, 10, 3, 8, 13, 1, 6, 11, 4, 9, 14, 2, 7, 12];   // the order they pop in: all over, not row by row

  // icons, drawn around 0,0 at about 18 px
  const ICON = {
    skim: `<g transform="translate(3 0)"><path d="M-8 0 Q0 -7.5 8 0 Q0 7.5 -8 0 Z"/><circle class="f" cx="0" cy="0" r="2.3"/>
      <path d="M-15.5 -3.5 H-12 M-16.5 0 H-12.5 M-15.5 3.5 H-12"/></g>`,
    bulb: `<path d="M-3 5 V3.4 C-6.4 1.6 -7.2 -2 -6 -4.8 C-4.8 -7.6 -2 -8.8 0 -8.8 C2 -8.8 4.8 -7.6 6 -4.8 C7.2 -2 6.4 1.6 3 3.4 V5 Z"/>
      <path d="M-2.4 7.8 H2.4"/><path class="ray" data-k="ray" d="M-11 -9 L-8.8 -7.4 M11 -9 L8.8 -7.4 M0 -14 V-11.6 M-12.4 -1.6 H-9.8 M12.4 -1.6 H9.8"/>`,
    page: `<rect x="-6.5" y="-9" width="13" height="18" rx="1.6"/><path d="M-3.5 -4.5 H3.5 M-3.5 -1 H3.5 M-3.5 2.5 H1"/>`,
    quiz: `<rect x="-9" y="-7.5" width="18" height="15" rx="2"/><text x="0" y="4.3">?</text>`,
    phone: `<rect x="-6.5" y="-9.5" width="13" height="19" rx="2.2"/><path d="M-2 6.4 H2"/><circle cx="-0.6" cy="-1.8" r="2.7"/><path d="M1.4 0.2 L3.4 2.2"/>`,
    talk: `<path d="M-9 -7.5 H9 Q10.5 -7.5 10.5 -6 V2.5 Q10.5 4 9 4 H-1 L-5.5 8.5 V4 H-9 Q-10.5 4 -10.5 2.5 V-6 Q-10.5 -7.5 -9 -7.5 Z"/>
      <path d="M-6.5 -3.2 H6.5 M-6.5 0.2 H3"/>`
  };
  const KIND = ["skim", "bulb", "page", "quiz", "phone"];
  const FIXED = { 0: "talk", 2: "quiz" };                    // what the thin cards become after the fix

  window.BiasAnim.SCENES[KEY] = {
    q: "mem", viewBox: "0 0 400 272",
    css: `
      ${P} .fs-dr{fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linejoin:round}
      ${P} .fs-in{fill:none;stroke:var(--rule);stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round}
      ${P} .fs-card{fill:var(--surface);stroke:var(--muted);stroke-width:1.6}
      ${P} .fs-hole{fill:var(--ground);stroke:var(--muted);stroke-width:1.2}
      ${P} .fs-ic *{fill:none;stroke:var(--ink);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fs-ic .f{fill:var(--ink);stroke:none}
      ${P} .fs-ic .ray{stroke:var(--q);stroke-width:1.8}
      ${P} .fs-ic text{font:700 11px var(--display);fill:var(--ink);stroke:none;text-anchor:middle}
      ${P} .fs-w{font:600 10px var(--display);fill:var(--muted);text-anchor:middle}
      ${P} .fs-tx{stroke:var(--faint);stroke-width:1.6;stroke-linecap:round}
      ${P} .fs-th{fill:none;stroke-linecap:round}
      ${P} .fs-new{fill:none;stroke:var(--good);stroke-width:4.2;stroke-linecap:round}
      ${P} .fs-rail{stroke:var(--rule);stroke-width:2.6;stroke-linecap:round}
      ${P} .fs-peg{fill:var(--surface);stroke:var(--muted);stroke-width:1.6}
      ${P} .fs-hd rect{fill:var(--surface);stroke:var(--q);stroke-width:1.6}
      ${P} .fs-hd text{font:600 10.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fs-mem{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle;letter-spacing:.12em}
      ${P} .fs-mini rect{fill:var(--surface);stroke:var(--faint);stroke-width:1.2}
      ${P} .fs-mini path{stroke:var(--faint);stroke-width:1.4;stroke-linecap:round}
      ${P} .fs-lg text{font:600 11px var(--display);fill:var(--ink)}
      ${P} .fs-lg .thk{stroke:var(--q);stroke-width:4.2;stroke-linecap:round}
      ${P} .fs-lg .thn{stroke:var(--muted);stroke-width:1.3;stroke-linecap:round;stroke-dasharray:2 3.4}
      ${P} .fs-bx circle{fill:var(--surface);stroke:var(--bad);stroke-width:1.8}
      ${P} .fs-bx text{font:700 10px var(--display);fill:var(--bad);text-anchor:middle}
      ${P} .fs-bc circle{fill:var(--surface);stroke:var(--good);stroke-width:1.8}
      ${P} .fs-bc path{fill:none;stroke:var(--good);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fs-pill rect,${P} .fs-pill .pt{fill:var(--surface);stroke:var(--good);stroke-width:1.6;stroke-linejoin:round}
      ${P} .fs-pill text{font:600 11px var(--display);fill:var(--good)}
      ${P} .fs-pill .ok{fill:none;stroke:var(--good);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    `,
    text: {
      hu: {
        name: "Hogyan tárolódott", shareTitle: "Miért dönti el a tanulás módja, mire emlékszel, 30 másodpercben",
        ecline: "Az emlékezet azt tartja meg, amivel dolgozol, ezért dolgozz azzal, amit meg akarsz tartani.",
        mem: "AZ EMLÉKEZETED", week: "AZ EMLÉKEZETED · EGY HÉTTEL KÉSŐBB",
        lgThick: "amit használsz vagy gondolsz rá", lgThin: "amit alig vettél észre",
        words: ["átfutottad", "miért?", "", "kvíz", "utánanéztél"], reread: n => `újraolvasva ×${n}`, fixed: { 0: "elmagyarázva", 2: "kvíz" },
        labels: [["Feldolgozási szintek", "hatás"], ["Tesztelési hatás"], ["Google-hatás"]],
        pill: "nézd meg",
        caps: [
          "Az emlékezeted <b>nem tud</b> mindent megtartani, amit lát. Választania kell.",
          "Ezért <b>vastag szálakat</b> köt ahhoz, amit használsz. Általában ez okos.",
          "<b>Átfutottad</b>? Vékony szál. Megkérdezted <b>miért</b> igaz? Vastag.",
          "A <b>újraolvasás</b> keveset ad. A <b>saját magad kérdezése</b> vastag szálat köt.",
          "Tudod, hogy <b>utánanézhetsz</b>? Hajlamos vagy <b>kevésbé jól</b> megjegyezni.",
          "Egy héttel később meghúzod a szálakat. A <b>vékonyak elszakadnak</b>.",
          "<b>A megoldás:</b> ne olvass újra, <b>kérdezd ki magad</b>. Magyarázd el a saját szavaiddal.",
          "Most már <b>tartanak</b>. Ami fontos, tanuld meg fejből, a többit nézd meg."
        ],
        say: [
          "Az emlékezeted nem tud mindent megtartani, amit lát. Választania kell.",
          "Ezért vastag szálakat köt ahhoz, amit használsz és amire gondolsz, a vékonyakat pedig ahhoz, amit alig vettél észre. Általában ez okos: az emlékezeted oda megy, ahol megtérül.",
          "Átfutottad? Vékony szál. Megkérdezted, miért igaz? Vastag. Ez a feldolgozási szintek hatása.",
          "Az újraolvasás keveset ad. Saját magad kérdezése vastag szálat köt. A tesztelési hatás.",
          "Tudod, hogy utánanézhetsz? Hajlamos vagy kevésbé jól megjegyezni. A Google-hatás.",
          "Egy héttel később meghúzod a szálakat. A vékonyak elszakadnak.",
          "A megoldás: ne olvass újra, kérdezd ki magad. Magyarázd el a saját szavaiddal.",
          "Most már tartanak. Ami fontos, tanuld meg fejből, a többit pedig nézd meg.",
          "Az emlékezet azt tartja meg, amivel dolgozol, ezért dolgozz azzal, amit meg akarsz tartani."
        ]
      },
      en: {
        name: "How it was stored", shareTitle: "Why how you learn something decides what you remember, in 30 seconds",
        ecline: "Memory keeps what you work with, so work with what you want to keep.",
        mem: "YOUR MEMORY", week: "YOUR MEMORY · A WEEK LATER",
        lgThick: "what you use or think about", lgThin: "what you barely noticed",
        words: ["skimmed", "why?", "", "quiz", "looked up"], reread: n => `reread ×${n}`, fixed: { 0: "explained", 2: "quiz" },
        labels: [["Levels of processing", "effect"], ["Testing effect"], ["Google effect"]],
        pill: "look it up",
        caps: [
          "Your memory <b>can't keep</b> everything you see. It has to choose.",
          "So it ties <b>thick threads</b> to what you use. Usually, that's smart.",
          "<b>Skimmed</b> it? A thin thread. Asked <b>why</b> it's true? A thick one.",
          "<b>Rereading</b> adds little. <b>Quizzing yourself</b> ties a thick thread.",
          "Know you can <b>look it up</b>? You tend to remember it <b>less well</b>.",
          "A week later, you pull the threads. The <b>thin ones snap</b>.",
          "<b>The fix:</b> don't reread, <b>quiz yourself</b>. Explain it in your own words.",
          "Now they <b>hold</b>. Know what matters by heart, look up the rest."
        ],
        say: [
          "Your memory can't keep everything you see. It has to choose.",
          "So it ties thick threads to what you use and think about, and thin ones to what you barely noticed. Usually, that's smart: your memory goes where it pays off.",
          "Skimmed it? A thin thread. Asked why it's true? A thick one. That's the levels of processing effect.",
          "Rereading adds little. Quizzing yourself ties a thick thread. The testing effect.",
          "Know you can look it up? You tend to remember it less well. The Google effect.",
          "A week later, you pull the threads. The thin ones snap.",
          "The fix: don't reread, quiz yourself. Explain it in your own words.",
          "Now they hold. Know what matters by heart, and look up the rest.",
          "Memory keeps what you work with, so work with what you want to keep."
        ]
      },
      el: {
        name: "Πώς το αποθηκεύσαμε", shareTitle: "Γιατί ο τρόπος που μαθαίνεις κάτι καθορίζει τι θα θυμάσαι, σε 30 δευτερόλεπτα",
        ecline: "Η μνήμη κρατά ό,τι έχεις δουλέψει, γι’\u00a0αυτό δούλεψε ό,τι θέλεις να θυμάσαι.",
        mem: "Η ΜΝΗΜΗ ΣΟΥ", week: "Η ΜΝΗΜΗ ΣΟΥ · ΜΙΑ ΕΒΔΟΜΑΔΑ ΜΕΤΑ",
        lgThick: "ό,τι χρησιμοποιείς ή σκέφτεσαι", lgThin: "ό,τι ίσα που πρόσεξες",
        words: ["διαγώνια", "γιατί;", "", "τεστ", "ψάξιμο"], reread: n => `ξανά ×${n}`, fixed: { 0: "εξήγηση", 2: "τεστ" },
        labels: [["Φαινόμενο επιπέδων", "επεξεργασίας"], ["Φαινόμενο", "της εξέτασης"], ["Φαινόμενο", "Google"]],
        pill: "το ψάχνεις",
        caps: [
          "Η μνήμη σου <b>δεν μπορεί να κρατήσει</b> όλα όσα βλέπεις. Πρέπει να διαλέξει.",
          "Γι’\u00a0αυτό δένει με <b>χοντρό νήμα</b> ό,τι χρησιμοποιείς. Και συνήθως καλά κάνει.",
          "Το διάβασες <b>διαγώνια</b>; Λεπτό νήμα. Αναρωτήθηκες <b>γιατί</b> ισχύει; Χοντρό.",
          "Το <b>ξαναδιάβασμα</b> βοηθά λίγο. Αν <b>τεστάρεις τις γνώσεις σου</b>, το νήμα χοντραίνει.",
          "Ξέρεις ότι μπορείς <b>να το ψάξεις</b>; Συνήθως το θυμάσαι <b>χειρότερα</b>.",
          "Μια εβδομάδα μετά, τραβάς τα νήματα. <b>Τα λεπτά σπάνε</b>.",
          "<b>Η λύση:</b> μην ξαναδιαβάζεις, <b>τέσταρε τις\u00a0γνώσεις σου</b>. Εξήγησέ το με δικά σου λόγια.",
          "Τώρα <b>κρατάνε</b>. Μάθε απέξω ό,τι\u00a0μετράει και ψάχνε τα υπόλοιπα."
        ],
        say: [
          "Η μνήμη σου δεν μπορεί να κρατήσει όλα όσα βλέπεις. Πρέπει να διαλέξει.",
          "Γι’ αυτό δένει με χοντρό νήμα ό,τι χρησιμοποιείς και σκέφτεσαι, και με λεπτό ό,τι ίσα που πρόσεξες. Και συνήθως καλά κάνει: η μνήμη σου πάει εκεί που πιάνει τόπο.",
          "Το διάβασες διαγώνια; Λεπτό νήμα. Αναρωτήθηκες γιατί ισχύει; Χοντρό. Είναι το φαινόμενο επιπέδων επεξεργασίας.",
          "Το ξαναδιάβασμα βοηθά λίγο. Αν τεστάρεις τις γνώσεις σου, το νήμα χοντραίνει. Το φαινόμενο της εξέτασης.",
          "Ξέρεις ότι μπορείς να το ψάξεις; Συνήθως το θυμάσαι χειρότερα. Το φαινόμενο Google.",
          "Μια εβδομάδα μετά, τραβάς τα νήματα. Τα λεπτά σπάνε.",
          "Η λύση: μην ξαναδιαβάζεις, τέσταρε τις γνώσεις σου. Εξήγησέ το με δικά σου λόγια.",
          "Τώρα κρατάνε. Μάθε απέξω ό,τι μετράει και ψάχνε τα υπόλοιπα.",
          "Η μνήμη κρατά ό,τι έχεις δουλέψει, γι’ αυτό δούλεψε ό,τι θέλεις να θυμάσαι."
        ]
      },
      es: {
        name: "Cómo se guardó", shareTitle: "Por qué la forma en que aprendes algo decide lo que recuerdas, en 30 segundos",
        ecline: "La memoria guarda lo que trabajas, así que trabaja lo que quieras guardar.",
        mem: "TU MEMORIA", week: "TU MEMORIA · UNA SEMANA DESPUÉS",
        lgThick: "lo que usas o en lo que piensas", lgThin: "lo que apenas notaste",
        words: ["hojeado", "¿por qué?", "", "test", "buscado"], reread: n => `releído ×${n}`, fixed: { 0: "explicado", 2: "test" },
        labels: [["Efecto de niveles", "de procesamiento"], ["Efecto de", "la prueba"], ["Efecto Google"]],
        pill: "búscalo",
        caps: [
          "Tu memoria <b>no puede guardar</b> todo lo que ves. Tiene que elegir.",
          "Por eso ata con <b>hilos gruesos</b> lo que usas. Y suele acertar.",
          "¿Lo <b>hojeaste</b>? Hilo fino. ¿Te preguntaste <b>por qué</b> es cierto? Hilo grueso.",
          "<b>Releer</b> aporta poco. <b>Ponerte a prueba</b> ata un hilo grueso.",
          "¿Sabes que puedes <b>buscarlo</b>? Sueles recordarlo <b>peor</b>.",
          "Una semana después, tiras de los hilos. <b>Los finos se rompen</b>.",
          "<b>La solución:</b> no releas, <b>ponte a prueba</b>. Explícalo con tus palabras.",
          "Ahora <b>aguantan</b>. Apréndete de memoria lo que importa y busca el resto."
        ],
        say: [
          "Tu memoria no puede guardar todo lo que ves. Tiene que elegir.",
          "Por eso ata con hilos gruesos lo que usas y lo que piensas, y con hilos finos lo que apenas notaste. Y suele acertar: tu memoria se dedica a lo que vale la pena.",
          "¿Lo hojeaste? Hilo fino. ¿Te preguntaste por qué es cierto? Hilo grueso. Es el efecto de niveles de procesamiento.",
          "Releer aporta poco. Ponerte a prueba ata un hilo grueso. Es el efecto de la prueba.",
          "¿Sabes que puedes buscarlo? Sueles recordarlo peor. Es el efecto Google.",
          "Una semana después, tiras de los hilos. Los finos se rompen.",
          "La solución: no releas, ponte a prueba. Explícalo con tus propias palabras.",
          "Ahora aguantan. Apréndete de memoria lo que importa y busca el resto.",
          "La memoria guarda lo que trabajas, así que trabaja lo que quieras guardar."
        ]
      },
      fr: {
        name: "Comment c’est stocké", shareTitle: "Pourquoi la façon d’apprendre décide de ce que vous retenez, en 30 secondes",
        ecline: "La mémoire garde ce que vous travaillez, alors travaillez ce que vous voulez garder.",
        mem: "VOTRE MÉMOIRE", week: "VOTRE MÉMOIRE · UNE SEMAINE APRÈS",
        lgThick: "ce que vous utilisez ou creusez", lgThin: "ce que vous avez à peine remarqué",
        words: ["survolé", "pourquoi ?", "", "quiz", "cherché"], reread: n => `relu ×${n}`, fixed: { 0: "expliqué", 2: "quiz" },
        labels: [["Effet de niveau", "de traitement"], ["Effet de test"], ["Effet Google"]],
        pill: "cherchez-le",
        caps: [
          "Votre mémoire <b>ne peut pas garder</b> tout ce que vous voyez. Elle doit choisir.",
          "Alors elle attache des <b>fils épais</b> à ce qui vous sert. En général, c’est malin.",
          "<b>Survolé</b> ? Un fil fin. Vous avez demandé <b>pourquoi</b> c’est vrai ? Un fil épais.",
          "<b>Relire</b> apporte peu. <b>Vous interroger</b> noue un fil épais.",
          "Vous savez pouvoir <b>le chercher</b> ? Vous le retenez souvent <b>moins bien</b>.",
          "Une semaine plus tard, vous tirez les fils. <b>Les fins cassent</b>.",
          "<b>La solution :</b> ne relisez pas, <b>interrogez-vous</b>. Expliquez-le avec vos mots.",
          "Désormais, ils <b>tiennent</b>. Apprenez par cœur l’essentiel, cherchez le reste."
        ],
        say: [
          "Votre mémoire ne peut pas garder tout ce que vous voyez. Elle doit choisir.",
          "Alors elle attache des fils épais à ce que vous utilisez et à ce qui vous fait réfléchir, et des fils fins à ce que vous avez à peine remarqué. En général, c’est malin : votre mémoire va là où ça rapporte.",
          "Survolé ? Un fil fin. Vous avez demandé pourquoi c’est vrai ? Un fil épais. C’est l’effet de niveau de traitement.",
          "Relire apporte peu. Vous interroger noue un fil épais. C’est l’effet de test.",
          "Vous savez pouvoir le chercher ? Vous le retenez souvent moins bien. C’est l’effet Google.",
          "Une semaine plus tard, vous tirez les fils. Les fins cassent.",
          "La solution : ne relisez pas, interrogez-vous. Expliquez-le avec vos propres mots.",
          "Désormais, ils tiennent. Apprenez par cœur l’essentiel, et cherchez le reste.",
          "La mémoire garde ce que vous travaillez, alors travaillez ce que vous voulez garder."
        ]
      },
      de: {
        name: "Wie es gespeichert wurde", shareTitle: "Warum die Art, wie du lernst, entscheidet, was du behältst, in 30 Sekunden",
        ecline: "Das Gedächtnis behält, womit du arbeitest, also arbeite mit dem, was du behalten willst.",
        mem: "DEIN GEDÄCHTNIS", week: "DEIN GEDÄCHTNIS · EINE WOCHE SPÄTER",
        lgThick: "was du nutzt oder durchdenkst", lgThin: "was du kaum bemerkt hast",
        words: ["flüchtig", "warum?", "", "Quiz", "gegoogelt"], reread: n => `Lesen ×${n}`, fixed: { 0: "erklärt", 2: "Quiz" },
        labels: [["Effekt der", "Verarbeitungsebenen"], ["Testeffekt"], ["Google-Effekt"]],
        pill: "googeln",
        caps: [
          "Dein Gedächtnis <b>kann nicht alles behalten</b>, was du siehst. Es muss auswählen.",
          "Also knüpft es <b>dicke Fäden</b> an das, was du nutzt. Meistens ist das klug.",
          "Nur <b>flüchtig</b> gelesen? Ein dünner Faden. Gefragt, <b>warum</b> es stimmt? Ein dicker.",
          "<b>Erneutes Lesen</b> bringt wenig. <b>Dich selbst abzufragen</b> knüpft einen dicken Faden.",
          "Du weißt, du kannst es <b>nachschlagen</b>? Dann merkst du es dir oft <b>schlechter</b>.",
          "Eine Woche später ziehst du an den Fäden. Die <b>dünnen reißen</b>.",
          "<b>Die Lösung:</b> Lies nicht noch mal, <b>frag dich selbst ab</b>. Erklär es in eigenen Worten.",
          "Jetzt <b>halten</b> sie. Kenn das Wichtige auswendig, schlag den Rest nach."
        ],
        say: [
          "Dein Gedächtnis kann nicht alles behalten, was du siehst. Es muss auswählen.",
          "Also knüpft es dicke Fäden an das, was du nutzt und durchdenkst, und dünne an das, was du kaum bemerkt hast. Meistens ist das klug: Dein Gedächtnis geht dorthin, wo es sich lohnt.",
          "Nur flüchtig gelesen? Ein dünner Faden. Gefragt, warum es stimmt? Ein dicker. Das ist der Effekt der Verarbeitungsebenen.",
          "Erneutes Lesen bringt wenig. Dich selbst abzufragen knüpft einen dicken Faden. Der Testeffekt.",
          "Du weißt, du kannst es nachschlagen? Dann merkst du es dir oft schlechter. Der Google-Effekt.",
          "Eine Woche später ziehst du an den Fäden. Die dünnen reißen.",
          "Die Lösung: Lies nicht noch mal, frag dich selbst ab. Erklär es in deinen eigenen Worten.",
          "Jetzt halten sie. Kenn das Wichtige auswendig, und schlag den Rest nach.",
          "Das Gedächtnis behält, womit du arbeitest, also arbeite mit dem, was du behalten willst."
        ]
      },
      it: {
        name: "Come lo memorizziamo", shareTitle: "Perché il modo in cui impari qualcosa decide cosa ricordi, in 30 secondi",
        ecline: "La memoria tiene ciò su cui lavori, quindi lavora su ciò che vuoi tenere.",
        mem: "LA TUA MEMORIA", week: "LA TUA MEMORIA · UNA SETTIMANA DOPO",
        lgThick: "ciò che usi o su cui rifletti", lgThin: "ciò che hai appena notato",
        words: ["sfogliato", "perché?", "", "quiz", "cercato"], reread: n => `riletto ×${n}`, fixed: { 0: "spiegato", 2: "quiz" },
        labels: [["Effetto livelli", "di elaborazione"], ["Effetto test"], ["Effetto Google"]],
        pill: "cercalo",
        caps: [
          "La tua memoria <b>non può tenere</b> tutto ciò che vedi. Deve scegliere.",
          "Così lega <b>fili spessi</b> a ciò che usi. Di solito è sensato.",
          "Lo <b>sfogli</b>? Un filo sottile. Ti chiedi <b>perché</b> è vero? Uno spesso.",
          "<b>Rileggere</b> serve a poco. <b>Interrogarti da solo</b> lega un filo spesso.",
          "Sai che puoi <b>cercarlo</b>? Tendi a ricordarlo <b>meno bene</b>.",
          "Una settimana dopo, tiri i fili. Quelli <b>sottili si spezzano</b>.",
          "<b>La soluzione:</b> non rileggere, <b>interrogati</b>. Spiegalo con parole tue.",
          "Ora <b>reggono</b>. Impara a memoria ciò che conta, e cerca il resto."
        ],
        say: [
          "La tua memoria non può tenere tutto ciò che vedi. Deve scegliere.",
          "Così lega fili spessi a ciò che usi e su cui rifletti, e fili sottili a ciò che hai appena notato. Di solito è sensato: la memoria va dove rende.",
          "Lo sfogli? Un filo sottile. Ti chiedi perché è vero? Uno spesso. È l’effetto livelli di elaborazione.",
          "Rileggere serve a poco. Interrogarti da solo lega un filo spesso. L’effetto test.",
          "Sai che puoi cercarlo? Tendi a ricordarlo meno bene. L’effetto Google.",
          "Una settimana dopo, tiri i fili. Quelli sottili si spezzano.",
          "La soluzione: non rileggere, interrogati. Spiegalo con parole tue.",
          "Ora reggono. Impara a memoria ciò che conta, e cerca il resto.",
          "La memoria tiene ciò su cui lavori, quindi lavora su ciò che vuoi tenere."
        ]
      }
    },
    svg(T) {
      const mini = ([x, y, r], i) => `<g class="fs-mini" data-k="m${i}" transform="translate(${x} ${y}) rotate(${r})">
        <rect x="-13" y="-8.5" width="26" height="17" rx="2.5"/><path d="M-8 -3 H8 M-8 2.5 H4"/></g>`;
      const card = i => {
        const alt = FIXED[i] != null
          ? `<g data-k="icf${i}" transform="translate(${CW / 2} 25)"><g class="fs-ic">${ICON[FIXED[i]]}</g></g>
             <text class="fs-w" data-k="wf${i}" x="${CW / 2}" y="46">${T.fixed[i]}</text>` : "";
        return `<g data-k="card${i}"><g data-k="body${i}">
          <rect class="fs-card" x="0" y="0" width="${CW}" height="${CH}" rx="4"/>
          <circle class="fs-hole" cx="${CW / 2}" cy="8" r="2.2"/>
          <g data-k="ic${i}" transform="translate(${CW / 2} 25)"><g class="fs-ic">${ICON[KIND[i]]}</g></g>
          <text class="fs-w" data-k="w${i}" x="${CW / 2}" y="46">${T.words[i]}</text>${alt}
          <path class="fs-tx" d="M11 60 H45 M11 68 H41 M11 76 H33"/></g>
          <g class="fs-bx" data-k="x${i}"><circle r="6.5"/><text y="3.5">?</text></g>
          <g class="fs-bc" data-k="c${i}"><circle r="6.5"/><path d="M-3 0.2 L-0.8 2.5 L3.2 -2.2"/></g></g>`;
      };
      const thread = i => `<path class="fs-th" data-k="th${i}"/><path class="fs-th" data-k="tl${i}"/>` +
        (FIXED[i] != null ? `<path class="fs-new" data-k="tn${i}"/>` : "");
      const holder = (lines, j) => {
        const y0 = HY + HH / 2 + 3.8 - (lines.length - 1) * 6;
        return `<g class="fs-hd" data-k="h${j}"><rect data-k="hr${j}" y="${HY}" height="${HH}" rx="3"/>
          ${lines.map((l, n) => `<text data-k="ht${j}_${n}" x="${GC[j]}" y="${y0 + n * 12}">${l}</text>`).join("")}</g>`;
      };
      return `
        <g data-k="cloud">${CLOUD.map(mini).join("")}</g>
        <g data-k="lg" class="fs-lg">
          <g data-k="lg1"><line class="thk" data-k="lgl1" y1="68" y2="68"/><text data-k="lgt1" y="72">${T.lgThick}</text></g>
          <g data-k="lg2"><line class="thn" data-k="lgl2" y1="98" y2="98"/><text data-k="lgt2" y="102">${T.lgThin}</text></g>
        </g>
        <g data-k="drw"><path class="fs-in" d="M14 ${FY} L26 ${BY} H374 L386 ${FY}"/></g>
        ${[0, 1, 2, 3, 4].map(card).join("")}
        <g data-k="front"><rect class="fs-dr" x="12" y="${FY}" width="376" height="${FB - FY}" rx="5"/>
          <text class="fs-mem" data-k="mem" x="200" y="246">${T.mem}</text><text class="fs-mem" data-k="week" x="200" y="246">${T.week}</text></g>
        ${T.labels.map(holder).join("")}
        ${[0, 1, 2, 3, 4].map(thread).join("")}
        <g data-k="rail"><line class="fs-rail" x1="20" y1="${RY}" x2="380" y2="${RY}"/>
          ${CC.map(x => `<circle class="fs-peg" cx="${x}" cy="${RY}" r="3.6"/>`).join("")}</g>
        <g class="fs-pill" data-k="pill"><rect data-k="pr" y="-10" height="20" rx="10"/><path class="pt" d="M-5 9.4 L0 15 L5 9.4"/>
          <path class="ok" data-k="pok" d=""/><text data-k="pt" y="3.9">${T.pill}</text></g>`;
    },
    S0: { dr: 0, cl: 0, clo: 0, rail: 0, lg1: 0, lg2: 0, lgo: 0, wk: 0, pill: 0,
      a0: 0, a1: 0, a2: 0, a3: 0, a4: 0, g0: 0, g1: 0, g2: 0, g3: 0, g4: 0, t0: 0, t1: 0, t2: 0, t3: 0, t4: 0, r2: 0,
      l0: 0, l1: 0, l2: 0, l3: 0, l4: 0, s0: 0, s2: 0, s4: 0, x0: 0, x2: 0, x4: 0, c0: 0, c1: 0, c2: 0, c3: 0,
      f0: 0, f2: 0, n0: 0, n2: 0, o4: 0, h0: 0, h1: 0, h2: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const len = key => { const t = k(key), n = t.getComputedTextLength ? t.getComputedTextLength() : 0; return n || t.textContent.length * 6; };
      const pop = (key, v, x, y) => {
        k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)}) scale(${Math.max(.001, .5 + .5 * cl(v)).toFixed(3)})`);
        op(key, v * 2);
      };

      // a day's worth of things, scattered above the drawer
      CLOUD.forEach(([x, y, r], i) => {
        const p = cl((S.cl - POP[i] * .05) / .28);
        k("m" + i).setAttribute("transform", `translate(${x} ${f1(y + 6 * (1 - p))}) rotate(${r}) scale(${(.6 + .4 * p).toFixed(3)})`);
        op("m" + i, p * .95);
      });
      op("cloud", 1 - S.clo);

      // the drawer
      op("drw", S.dr); op("front", S.dr);
      k("front").setAttribute("transform", `translate(0 ${f1(6 * (1 - S.dr))})`);
      op("mem", 1 - S.wk); op("week", S.wk);

      // the rail and the legend: thick threads for what you use, thin ones for the rest
      op("rail", S.rail);
      const w1 = len("lgt1"), w2 = len("lgt2"), lx = f1(200 - (48 + Math.max(w1, w2)) / 2);
      [[1, S.lg1], [2, S.lg2]].forEach(([n, v]) => {
        const ln = k("lgl" + n);
        ln.setAttribute("x1", lx); ln.setAttribute("x2", f1(+lx + 36 * cl(v * 1.4)));
        ln.style.opacity = v > .01 ? 1 : 0;
        k("lgt" + n).setAttribute("x", f1(+lx + 48));
        op("lgt" + n, v * 1.5 - .5);
      });
      op("lg", 1 - S.lgo);

      // the cards and their threads
      for (let i = 0; i < 5; i++) {
        const a = S["a" + i], l = S["l" + i], s = S["s" + i] || 0;
        const fx = i === 4 ? S.o4 : S["f" + i] || 0;          // fixed (or, for the phone card, let go)
        const top = T0 - (T0 - T1) * l - 50 * (1 - a), cx = CC[i];
        k("card" + i).setAttribute("transform", `translate(${CX[i]} ${f1(top)})`);
        op("card" + i, a * 2.5);
        op("body" + i, 1 - .5 * s * (1 - fx));
        pop("x" + i, S["x" + i] || 0, CW - 10, 10);
        pop("c" + i, S["c" + i] || 0, CW - 10, 10);
        if (FIXED[i] != null) { op("ic" + i, 1 - fx); op("w" + i, 1 - fx); op("icf" + i, fx); op("wf" + i, fx); }

        // the thread: thin and dashed, or thick and solid; when it snaps, two loose ends
        const y0 = RY + 3.6, y1 = top + 8, t = S["t" + i], th = k("th" + i), tl = k("tl" + i);
        const thin = t < .35, w = (i === 4 ? 1 : 1.3) + 2.9 * t;
        const col = s > .02 ? "var(--bad)" : thin ? "var(--muted)" : "var(--q)";
        [th, tl].forEach(p => { p.style.stroke = col; p.style.strokeWidth = f1(w); p.style.strokeDasharray = thin ? "2 3.4" : "none"; });
        if (s < .001) {
          th.setAttribute("d", `M${cx} ${f1(y0)} V${f1(y0 + S["g" + i] * (y1 - y0))}`);
          tl.setAttribute("d", "");
        } else {
          const ym = (y0 + y1) / 2, ue = ym - (ym - y0) * .5 * s - 2 * s, le = ym + (y1 - ym) * .45 * s + 2 * s;
          th.setAttribute("d", `M${cx} ${f1(y0)} V${f1(ue)}`);
          tl.setAttribute("d", `M${cx} ${f1(y1)} Q${f1(cx + 2 * s)} ${f1((y1 + le) / 2)} ${f1(cx + 7 * s)} ${f1(le)}`);
        }
        const old = 1 - cl(fx * 1.5);
        op("th" + i, S["g" + i] > 0 ? old * (i === 4 ? .8 : 1) : 0); op("tl" + i, old);
        if (FIXED[i] != null) {
          const n = S["n" + i];
          k("tn" + i).setAttribute("d", `M${cx} ${f1(y0)} V${f1(y0 + n * (y1 - y0))}`);
          op("tn" + i, n > 0 ? 1 : 0);
        }
      }
      // the reread card counts its rereads, with a little pulse each time
      const r = S.r2, nR = Math.min(3, Math.max(1, Math.ceil(r - 1e-6)));
      k("w2").textContent = T.reread(nR);
      const pulse = r > 0 && r < 3 ? Math.sin(Math.PI * (r - Math.floor(r))) : 0;
      k("ic2").setAttribute("transform", `translate(${CW / 2} 25) scale(${(1 + .18 * pulse).toFixed(3)})`);
      op("ray", S.t1);

      // label holders on the drawer front, sized to their names
      T.labels.forEach((lines, j) => {
        const wmax = Math.max(...lines.map((_, n) => len(`ht${j}_${n}`))), wd = wmax + 18;
        const x = Math.min(GC[j] - wd / 2, 382 - wd);
        const rc = k("hr" + j); rc.setAttribute("x", f1(x)); rc.setAttribute("width", f1(wd));
        lines.forEach((_, n) => k(`ht${j}_${n}`).setAttribute("x", f1(x + wd / 2)));
        k("h" + j).setAttribute("transform", `translate(0 ${f1(5 * (1 - S["h" + j]))})`);
        op("h" + j, S["h" + j]);
      });

      // the phone card is fine where it is: look it up when you need it
      const pw = len("pt") + 36;
      const px = Math.min(PX, 386 - pw / 2);
      k("pr").setAttribute("x", f1(-pw / 2)); k("pr").setAttribute("width", f1(pw));
      k("pt").setAttribute("x", f1(-pw / 2 + 26));
      k("pok").setAttribute("d", `M${f1(-pw / 2 + 11)} 0.3 L${f1(-pw / 2 + 14)} 3.3 L${f1(-pw / 2 + 19)} -2.7`);
      k("pill").setAttribute("transform", `translate(${f1(px)} ${f1(PY + 5 * (1 - S.pill))})`);
      op("pill", S.pill);
    },
    beats: [
      { steps: [{ to: { dr: 1 }, ms: 500, sfx: "pluck" }, { to: { cl: 1 }, ms: 1800, ease: "lin", sfx: "whoosh" }] },
      { steps: [{ to: { clo: 1 }, ms: 400 }, { to: { rail: 1 }, ms: 400 }, { to: { lg1: 1 }, ms: 550, sfx: "tick" }, { wait: 250 },
        { to: { lg2: 1 }, ms: 550 }], hold: 2800 },
      { steps: [{ to: { lgo: 1 }, ms: 300 }, { to: { a0: 1 }, ms: 320 }, { to: { g0: 1 }, ms: 350 }, { wait: 350 },
        { to: { a1: 1 }, ms: 450, ease: "out", sfx: "pop" }, { to: { g1: 1 }, ms: 350 }, { to: { t1: 1 }, ms: 600, ease: "inOut", sfx: "scribble" },
        { to: { h0: 1 }, ms: 400 }] },
      { steps: [{ to: { a2: 1 }, ms: 420, ease: "out" }, { to: { g2: 1 }, ms: 300 },
        { to: { r2: 1, t2: .1 }, ms: 330 }, { to: { r2: 2, t2: .19 }, ms: 330 }, { to: { r2: 3, t2: .27 }, ms: 330 }, { wait: 250 },
        { to: { a3: 1 }, ms: 450, ease: "out", sfx: "pop" }, { to: { g3: 1 }, ms: 300 }, { to: { t3: 1 }, ms: 600, ease: "inOut" },
        { to: { h1: 1 }, ms: 400 }] },
      { steps: [{ to: { a4: 1 }, ms: 450, ease: "out" }, { to: { g4: 1 }, ms: 700 }, { to: { h2: 1 }, ms: 400 }] },
      { steps: [{ to: { wk: 1 }, ms: 400 }, { to: { l0: .1, l1: .1, l2: .1, l3: .1, l4: .1 }, ms: 280, ease: "inOut" },
        { to: { l1: 1, l3: 1, l0: 0, l2: 0, l4: 0, s0: 1, s2: 1, s4: 1 }, ms: 650, sfx: "spring" },
        { to: { c1: 1, c3: 1, x0: 1, x2: 1, x4: 1 }, ms: 400, ease: "out" }], hold: 3000 },
      { steps: [{ to: { x2: 0, f2: 1 }, ms: 450 }, { to: { n2: 1 }, ms: 500, sfx: "scribble" }, { wait: 250 },
        { to: { x0: 0, f0: 1 }, ms: 450 }, { to: { n0: 1 }, ms: 500 }], hold: 2800 },
      { steps: [{ to: { l0: 1, l2: 1 }, ms: 750, ease: "out" }, { to: { c0: 1, c2: 1 }, ms: 350, ease: "out" },
        { to: { x4: 0, o4: 1 }, ms: 400 }, { to: { pill: 1 }, ms: 450, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
