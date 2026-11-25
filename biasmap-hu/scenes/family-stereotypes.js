/* Family: stereotypes. A blank outline with one label, and the mind fills in the rest.
   Stereotyping: a job badge fills in six traits nobody saw. Authority bias: a white coat makes a bare claim
   sound right. Group attribution error: one loud fan stands for every fan. The fix: one real fact about the
   person, and the real person turns out different from the label. Traits are illustrative. Scene for anim.js. */
(function () {
  const KEY = "family-stereotypes", P = `.bp[data-scene="${KEY}"]`;
  const PX = 96, HY = 88, HR = 19;                        // the person: centre x, head centre y, head radius
  const BODY = "M48 224 V182 C48 142 70 117 96 117 C122 117 144 142 144 182 V224";
  const BY = 170;                                          // badge centre y
  const CX = 214, CW = 176, CH = 22;                       // trait chips: left edge, width, height
  const RY = [44, 76, 108, 140, 172, 204];                 // chip centres
  const OK = [0, 1, 0, 0, 1, 0];                           // guesses the real person confirms
  const LAST = [0, 1, 3, 4, 5];                            // resolved at the end (chip 2 is the first real fact)
  const FANS = [230, 273, 316, 359], FY = 156;             // the other fans: centre x, head y
  const FT = [124, 98];                                    // tops of the fans' copied tags (alternating rows)
  const TG = [123, 50];                                    // the tag on the person: left edge, top
  const BX0 = 14, BY0 = 12, BW = 172, BH = 40, TIP = 64;   // speech bubble box, tail tip y (above the head)
  const PL = [14, 234, 24];                                // name tag: left, top, height
  const BAR = [214, 176];                                  // bars: left edge, full width
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const lerp = (a, b, t) => a + (b - a) * t;
  const sm = u => { u = cl(u); return u * u * (3 - 2 * u); };

  // rounded box with a tail pointing down at (tx, y0 + h + th)
  const callout = (x0, y0, w, h, r, tx, th) => `M${x0 + r} ${y0} H${x0 + w - r} Q${x0 + w} ${y0} ${x0 + w} ${y0 + r} V${y0 + h - r} Q${x0 + w} ${y0 + h} ${x0 + w - r} ${y0 + h}` +
    ` H${tx + 6} L${tx} ${y0 + h + th} L${tx - 6} ${y0 + h} H${x0 + r} Q${x0} ${y0 + h} ${x0} ${y0 + h - r} V${y0 + r} Q${x0} ${y0} ${x0 + r} ${y0} Z`;
  // a luggage-tag outline: pointed on the left, with a hole
  const tagPath = (x, y, w, h) => `M${f1(x + 10)} ${y} H${f1(x + w - 6)} Q${f1(x + w)} ${y} ${f1(x + w)} ${y + 6} V${y + h - 6} Q${f1(x + w)} ${y + h} ${f1(x + w - 6)} ${y + h} H${f1(x + 10)} L${x} ${y + h / 2} Z`;
  const lines = (arr, x, yc, step) => arr.map((s, i) => `<text x="${x}" y="${f1(yc + 4.3 + (i - (arr.length - 1) / 2) * step)}">${s}</text>`).join("");
  // a small fan: head, shoulders, team scarf
  const fan = (x, i) => `<g class="fs-fan" data-k="f${i}">
      <circle class="o" cx="${x}" cy="${FY}" r="9.5"/>
      <path class="o" d="M${x - 16} 198 V188 C${x - 16} 177 ${x - 9} 169.5 ${x} 169.5 C${x + 9} 169.5 ${x + 16} 177 ${x + 16} 188 V198"/>
      <path class="sc" d="M${x - 8} 168 Q${x} 173 ${x + 8} 168 L${x + 8} 172.5 Q${x} 177.5 ${x - 8} 172.5 Z M${x + 1} 174 L${x + 6} 174 L${x + 8} 192 L${x + 3} 192 Z"/></g>`;

  window.BiasAnim.SCENES[KEY] = {
    q: "nem", viewBox: "0 0 400 272",
    css: `
      ${P} .fs-dash{fill:none;stroke:var(--muted);stroke-width:2.2;stroke-dasharray:5 5;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fs-solid{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fs-eye{fill:var(--ink)}
      ${P} .fs-lan{stroke:var(--muted);stroke-width:1.6;stroke-linecap:round}
      ${P} .fs-badge rect{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .fs-badge text{font:600 11px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fs-link{fill:none;stroke:var(--q);stroke-width:1.4;stroke-linecap:round;opacity:.7}
      ${P} .fs-chip .bg{fill:var(--surface)}
      ${P} .fs-chip .m{fill:none;stroke:var(--muted);stroke-width:1.5;stroke-dasharray:4 3}
      ${P} .fs-chip .b{fill:none;stroke:var(--bad);stroke-width:1.6;stroke-dasharray:4 3}
      ${P} .fs-chip .g{fill:none;stroke:var(--good);stroke-width:1.9}
      ${P} .fs-chip .q{font:700 12px var(--display);fill:var(--faint)}
      ${P} .fs-chip .t{font:600 11px var(--display);fill:var(--ink)}
      ${P} .fs-chip .n{font:600 11px var(--display);fill:var(--good)}
      ${P} .fs-chip .s{stroke:var(--bad);stroke-width:1.8;stroke-linecap:round}
      ${P} .fs-chip .k{fill:none;stroke:var(--good);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fs-note{font:500 10px var(--mono);fill:var(--muted)}
      ${P} .fs-note.b{fill:var(--bad)}
      ${P} .fs-note.g{fill:var(--good)}
      ${P} .fs-coat .c{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fs-coat .l{fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fs-coat .st{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round}
      ${P} .fs-scarf .sc{fill:var(--q)}
      ${P} .fs-scarf .str{stroke:var(--ground);stroke-width:3}
      ${P} .fs-scarf .fr{stroke:var(--q);stroke-width:1.6;stroke-linecap:round}
      ${P} .fs-shout{fill:none;stroke:var(--muted);stroke-width:2;stroke-linecap:round}
      ${P} .fs-tag rect{fill:var(--surface);stroke:var(--bad);stroke-width:1.6}
      ${P} .fs-tag text{font:500 10px var(--mono);fill:var(--bad);text-anchor:middle}
      ${P} .fs-tl{stroke:var(--bad);stroke-width:1.2;stroke-dasharray:2 2.5}
      ${P} .fs-fan .o{fill:none;stroke:var(--muted);stroke-width:1.8;stroke-dasharray:3.5 3.5;stroke-linecap:round}
      ${P} .fs-fan .sc{fill:var(--q)}
      ${P} .fs-bub path{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fs-bub text{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fs-bub.g path{stroke:var(--good)}
      ${P} .fs-bl{font:500 10px var(--mono);fill:var(--muted)}
      ${P} .fs-trk{fill:none;stroke:var(--rule);stroke-width:1.4}
      ${P} .fs-bq{fill:var(--q)}
      ${P} .fs-none{font:500 9.5px var(--mono);fill:var(--bad)}
      ${P} .fs-name path{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fs-name circle{fill:none;stroke:var(--q);stroke-width:1.5}
      ${P} .fs-name text{font:600 12px var(--display);fill:var(--ink)}
    `,
    text: {
      hu: {
        name: "Sztereotípiák", shareTitle: "Miért tölt ki egy címke egy egész embert, 30 másodpercben",
        ecline: "A címke kitölti, amit nem tudsz, ezért ítélkezés előtt tanulj meg egy valódi tényt.",
        badge: "Mérnök",
        guess: ["csendes", "szereti a matekot", "sakkozik", "mindent előre tervez", "mindent megjavít", "korán kel"],
        real: ["nagyon vicces", "szereti a matekot", "dobol", "improvizál", "mindent megjavít", "éjszakai bagoly"],
        gaps: "6 rés", filled: "a címkéből töltve ki", seen: "látott: 0 a 6-ból", fact1: "1 valódi tény", close: "közelről",
        claim: ["X-vitamin", "megállítja a megfázást."], trust: "a bizalmad", evidence: "bemutatott bizonyíték", none: "nincs",
        loud: "hangos", fact: ["Dobolok", "egy zenekarban!"],
        names: ["Sztereotipizálás", "Tekintélyi torzítás", "Csoportos attribúciós hiba"],
        caps: [
          "Megismersz valakit. Csak <b>egy címkét</b> tudsz róla.",
          "Az agyad a réseket <b>az elvárásaival</b> tölti ki. Ez spórol az erőfeszítéssel.",
          "Ez a <b>sztereotipizálás</b>: hat tulajdonság, amit <b>soha nem láttál</b>.",
          "Adj hozzá egy <b>fehér köpenyt</b>, és egy <b>bizonyíték nélküli</b> állítás is igaznak hangzik.",
          "A meccsen egy szurkoló szüntelenül <b>kiabál</b>…",
          "…így azt döntöd el, hogy a csapat <b>összes</b> szurkolója hangos.",
          "<b>A megoldás:</b> először tanulj meg egy <b>valódi tényt</b> az illetőről.",
          "Közelről minden ember <b>több, mint egy címke</b>."
        ],
        say: [
          "Megismersz valakit. Csak egy címkét tudsz róla: mérnök.",
          "Az agyad a réseket az elvárásaival tölti ki a címke alapján. Ez sok erőfeszítést spórol.",
          "Ez a sztereotipizálás: hat tulajdonság, amit soha nem láttál.",
          "Adj hozzá egy fehér köpenyt, és egy bizonyíték nélküli állítás is igaznak hangzik. Ez a tekintélyi torzítás.",
          "A meccsen egy szurkoló szüntelenül kiabál...",
          "...így azt döntöd el, hogy a csapat összes szurkolója hangos. Ez a csoportos attribúciós hiba.",
          "A megoldás: először tanulj meg egy valódi tényt az illetőről.",
          "Közelről minden ember több, mint egy címke.",
          "Sztereotípiák. A címke kitölti, amit nem tudsz, ezért ítélkezés előtt tanulj meg egy valódi tényt."
        ]
      },
      en: {
        name: "Stereotypes", shareTitle: "Why one label fills in a whole person, in 30 seconds",
        ecline: "A label fills in what you don't know, so learn one real fact before you judge.",
        badge: "Engineer",
        guess: ["quiet", "loves maths", "plays chess", "plans everything", "fixes anything", "early riser"],
        real: ["very funny", "loves maths", "plays drums", "improvises", "fixes anything", "night owl"],
        gaps: "6 gaps", filled: "filled in from the label", seen: "seen: 0 of 6", fact1: "1 real fact", close: "up close",
        claim: ["Vitamin X", "stops colds."], trust: "your trust", evidence: "evidence shown", none: "none",
        loud: "loud", fact: ["I play drums", "in a band!"],
        names: ["Stereotyping", "Authority bias", "Group attribution error"],
        caps: [
          "You meet someone new. All you know is <b>one label</b>.",
          "Your brain fills the gaps with <b>what it expects</b>. It saves effort.",
          "That's <b>stereotyping</b>: six traits you <b>never actually saw</b>.",
          "Add a <b>white coat</b>, and a claim with <b>no evidence</b> sounds right.",
          "At the match, one fan <b>shouts</b> nonstop…",
          "…so you decide <b>all</b> the team's fans are loud.",
          "<b>The fix:</b> learn one <b>real fact</b> about the person first.",
          "Up close, every person is <b>more than a label</b>."
        ],
        say: [
          "You meet someone new. All you know is one label: engineer.",
          "Your brain fills the gaps with what it expects from the label. It saves a lot of effort.",
          "That's stereotyping: six traits you never actually saw.",
          "Add a white coat, and a claim with no evidence sounds right. That's authority bias.",
          "At the match, one fan shouts nonstop...",
          "...so you decide all the team's fans are loud. That's the group attribution error.",
          "The fix: learn one real fact about the person first.",
          "Up close, every person is more than a label.",
          "Stereotypes. A label fills in what you don't know, so learn one real fact before you judge."
        ]
      },
      el: {
        name: "Στερεότυπα", shareTitle: "Γιατί από μια ταμπέλα φανταζόμαστε ολόκληρο άνθρωπο, σε 30 δευτερόλεπτα",
        ecline: "Μια ταμπέλα συμπληρώνει όσα δεν ξέρεις, γι’ αυτό μάθε ένα πραγματικό στοιχείο πριν κρίνεις.",
        badge: "Μηχανικός",
        guess: ["μιλάει λίγο", "αγαπά τα μαθηματικά", "παίζει σκάκι", "τα σχεδιάζει όλα", "φτιάχνει τα πάντα", "ξυπνάει νωρίς"],
        real: ["έχει πολύ χιούμορ", "αγαπά τα μαθηματικά", "παίζει ντραμς", "αυτοσχεδιάζει", "φτιάχνει τα πάντα", "ξενυχτάει"],
        gaps: "6 κενά", filled: "τα γέμισε η ταμπέλα", seen: "είδες: 0 από τα 6", fact1: "1 πραγματικό στοιχείο", close: "από κοντά",
        claim: ["Η βιταμίνη Χ", "κόβει το κρύωμα."], trust: "η εμπιστοσύνη σου", evidence: "στοιχεία", none: "κανένα",
        loud: "θορυβώδης", fact: ["Παίζω ντραμς", "σε μια μπάντα!"],
        names: ["Στερεοτυπική σκέψη", "Μεροληψία υπέρ της αυθεντίας", "Σφάλμα ομαδικής απόδοσης"],
        caps: [
          "Γνωρίζεις έναν άνθρωπο για πρώτη φορά. Το μόνο που ξέρεις είναι <b>μια ταμπέλα</b>.",
          "Το μυαλό σου γεμίζει τα κενά με <b>ό,τι περιμένει</b>. Έτσι γλιτώνεις κόπο.",
          "Αυτή είναι η <b>στερεοτυπική σκέψη</b>: έξι γνωρίσματα που <b>δεν είδες ποτέ</b>.",
          "Με μια <b>λευκή ποδιά</b>, ακόμα κι ένας ισχυρισμός <b>χωρίς στοιχεία</b> ακούγεται σωστός.",
          "Στο γήπεδο, ένας οπαδός <b>φωνάζει</b> ασταμάτητα…",
          "…και συμπεραίνεις ότι <b>όλοι</b> οι οπαδοί της ομάδας είναι θορυβώδεις.",
          "<b>Η λύση:</b> μάθε πρώτα ένα <b>πραγματικό στοιχείο</b> για τον ίδιο τον άνθρωπο.",
          "Από κοντά, κάθε άνθρωπος είναι <b>κάτι πολύ περισσότερο από μια ταμπέλα</b>."
        ],
        say: [
          "Γνωρίζεις έναν άνθρωπο για πρώτη φορά. Το μόνο που ξέρεις είναι μια ταμπέλα: μηχανικός.",
          "Το μυαλό σου γεμίζει τα κενά με ό,τι περιμένει από την ταμπέλα. Έτσι γλιτώνεις πολύ κόπο.",
          "Αυτή είναι η στερεοτυπική σκέψη: έξι γνωρίσματα που δεν είδες ποτέ.",
          "Με μια λευκή ποδιά, ακόμα κι ένας ισχυρισμός χωρίς στοιχεία ακούγεται σωστός. Λέγεται μεροληψία υπέρ της αυθεντίας.",
          "Στο γήπεδο, ένας οπαδός φωνάζει ασταμάτητα...",
          "...και συμπεραίνεις ότι όλοι οι οπαδοί της ομάδας είναι θορυβώδεις. Είναι το σφάλμα ομαδικής απόδοσης.",
          "Η λύση: μάθε πρώτα ένα πραγματικό στοιχείο για τον ίδιο τον άνθρωπο.",
          "Από κοντά, κάθε άνθρωπος είναι κάτι πολύ περισσότερο από μια ταμπέλα.",
          "Στερεότυπα. Μια ταμπέλα συμπληρώνει όσα δεν ξέρεις, γι’ αυτό μάθε ένα πραγματικό στοιχείο πριν κρίνεις."
        ]
      },
      es: {
        name: "Estereotipos", shareTitle: "Por qué una sola etiqueta basta para imaginar a toda una persona, en 30 segundos",
        ecline: "Una etiqueta rellena lo que no sabes, así que averigua un dato real antes de juzgar.",
        badge: "Ingeniero",
        guess: ["callado", "ama las matemáticas", "juega al ajedrez", "lo planea todo", "lo arregla todo", "madrugador"],
        real: ["muy gracioso", "ama las matemáticas", "toca la batería", "improvisa", "lo arregla todo", "trasnochador"],
        gaps: "6 huecos", filled: "los rellenó la etiqueta", seen: "vistos: 0 de 6", fact1: "1 dato real", close: "de cerca",
        claim: ["La vitamina X", "frena los resfriados."], trust: "tu confianza", evidence: "pruebas aportadas", none: "ninguna",
        loud: "ruidoso", fact: ["¡Toco la batería", "en una banda!"],
        names: ["Uso de estereotipos", "Sesgo de autoridad", "Error de atribución grupal"],
        caps: [
          "Conoces a alguien. Lo único que sabes es <b>una etiqueta</b>.",
          "Tu cerebro rellena los huecos con <b>lo que espera</b>. Así ahorra esfuerzo.",
          "Eso es el <b>uso de estereotipos</b>: seis rasgos que <b>nunca llegaste a ver</b>.",
          "Con una <b>bata blanca</b>, una afirmación <b>sin pruebas</b> suena cierta.",
          "En el partido, un aficionado <b>grita</b> sin parar…",
          "…y concluyes que <b>todos</b> los aficionados del equipo son ruidosos.",
          "<b>La solución:</b> averigua primero un <b>dato real</b> sobre esa persona.",
          "De cerca, cada persona es <b>más que una etiqueta</b>."
        ],
        say: [
          "Conoces a alguien. Lo único que sabes es una etiqueta: ingeniero.",
          "Tu cerebro rellena los huecos con lo que espera de esa etiqueta. Así se ahorra mucho esfuerzo.",
          "Eso es el uso de estereotipos: seis rasgos que nunca llegaste a ver.",
          "Con una bata blanca, una afirmación sin pruebas suena cierta. Es el sesgo de autoridad.",
          "En el partido, un aficionado grita sin parar...",
          "...y concluyes que todos los aficionados del equipo son ruidosos. Es el error de atribución grupal.",
          "La solución: averigua primero un dato real sobre esa persona.",
          "De cerca, cada persona es más que una etiqueta.",
          "Estereotipos. Una etiqueta rellena lo que no sabes, así que averigua un dato real antes de juzgar."
        ]
      },
      fr: {
        name: "Stéréotypes", shareTitle: "Pourquoi une seule étiquette suffit à imaginer toute une personne, en 30 secondes",
        ecline: "Une étiquette comble ce que vous ignorez, alors apprenez un fait réel avant de juger.",
        badge: "Ingénieur",
        guess: ["discret", "adore les maths", "joue aux échecs", "planifie tout", "répare tout", "lève-tôt"],
        real: ["très drôle", "adore les maths", "joue de la batterie", "improvise", "répare tout", "couche-tard"],
        gaps: "6 cases vides", filled: "déduits de l’étiquette", seen: "vus : 0 sur 6", fact1: "1 fait réel", close: "de près",
        claim: ["La vitamine X", "stoppe les rhumes."], trust: "votre confiance", evidence: "preuves fournies", none: "aucune",
        loud: "bruyant", fact: ["Je joue de la batterie", "dans un groupe !"],
        names: ["Stéréotypage", "Biais d’autorité", "Erreur d’attribution de groupe"],
        caps: [
          "Vous rencontrez quelqu’un. Tout ce que vous en savez : <b>une étiquette</b>.",
          "Votre cerveau comble les vides avec <b>ce qu’il attend</b>. Il s’épargne un effort.",
          "C’est le <b>stéréotypage</b> : six traits que vous <b>n’avez jamais vus</b>.",
          "Ajoutez une <b>blouse blanche</b>, et une affirmation <b>sans preuve</b> semble juste.",
          "Au match, un supporter <b>crie</b> sans arrêt…",
          "…alors vous décidez que <b>tous</b> les supporters de l’équipe sont bruyants.",
          "<b>La solution :</b> apprenez d’abord un <b>fait réel</b> sur la personne.",
          "De près, chaque personne est <b>plus qu’une étiquette</b>."
        ],
        say: [
          "Vous rencontrez quelqu’un. Tout ce que vous en savez, c’est une étiquette : ingénieur.",
          "Votre cerveau comble les vides avec ce qu’il attend de l’étiquette. Il s’épargne beaucoup d’effort.",
          "C’est le stéréotypage : six traits que vous n’avez jamais vus.",
          "Ajoutez une blouse blanche, et une affirmation sans preuve semble juste. C’est le biais d’autorité.",
          "Au match, un supporter crie sans arrêt...",
          "...alors vous décidez que tous les supporters de l’équipe sont bruyants. C’est l’erreur d’attribution de groupe.",
          "La solution : apprenez d’abord un fait réel sur la personne.",
          "De près, chaque personne est plus qu’une étiquette.",
          "Stéréotypes. Une étiquette comble ce que vous ignorez, alors apprenez un fait réel avant de juger."
        ]
      },
      de: {
        name: "Stereotype", shareTitle: "Warum dein Kopf aus einem Etikett einen ganzen Menschen macht, in 30 Sekunden",
        ecline: "Ein Etikett ergänzt, was du nicht weißt, also finde eine echte Tatsache heraus, bevor du urteilst.",
        badge: "Ingenieur",
        guess: ["still", "liebt Mathe", "spielt Schach", "plant alles", "repariert alles", "Frühaufsteher"],
        real: ["sehr witzig", "liebt Mathe", "spielt Schlagzeug", "improvisiert", "repariert alles", "Nachteule"],
        gaps: "6 Lücken", filled: "vom Etikett ergänzt", seen: "gesehen: 0 von 6", fact1: "1 echte Tatsache", close: "aus der Nähe",
        claim: ["Vitamin X", "stoppt Erkältungen."], trust: "dein Vertrauen", evidence: "vorgelegte Belege", none: "keine",
        loud: "laut", fact: ["Ich spiele Schlagzeug", "in einer Band!"],
        names: ["Stereotypisierung", "Autoritätsglaube", "Gruppen-Attributionsfehler"],
        caps: [
          "Du lernst jemanden kennen. Du weißt nur eins: <b>ein Etikett</b>.",
          "Dein Gehirn füllt die Lücken mit dem, <b>was es erwartet</b>. Das spart Mühe.",
          "Das ist <b>Stereotypisierung</b>: sechs Eigenschaften, die du <b>nie gesehen hast</b>.",
          "Mit einem <b>weißen Kittel</b> klingt eine Behauptung <b>ohne Belege</b> richtig.",
          "Im Stadion <b>brüllt</b> ein Fan ununterbrochen…",
          "…also hältst du <b>alle</b> Fans des Teams für laut.",
          "<b>Die Lösung:</b> Finde zuerst <b>eine echte Tatsache</b> über die Person heraus.",
          "Aus der Nähe ist jeder Mensch <b>mehr als ein Etikett</b>."
        ],
        say: [
          "Du lernst jemanden kennen. Du weißt nur eins, ein Etikett: Ingenieur.",
          "Dein Gehirn füllt die Lücken mit dem, was es von dem Etikett erwartet. Das spart eine Menge Mühe.",
          "Das ist Stereotypisierung: sechs Eigenschaften, die du nie gesehen hast.",
          "Mit einem weißen Kittel klingt eine Behauptung ohne Belege richtig. Das ist Autoritätsglaube.",
          "Im Stadion brüllt ein Fan ununterbrochen...",
          "...also hältst du alle Fans des Teams für laut. Das ist der Gruppen-Attributionsfehler.",
          "Die Lösung: Finde zuerst eine echte Tatsache über die Person heraus.",
          "Aus der Nähe ist jeder Mensch mehr als ein Etikett.",
          "Stereotype. Ein Etikett ergänzt, was du nicht weißt, also finde eine echte Tatsache heraus, bevor du urteilst."
        ]
      },
      it: {
        name: "Stereotipi", shareTitle: "Perché un’etichetta basta a immaginare un’intera persona, in 30 secondi",
        ecline: "Un’etichetta riempie ciò che non sai, quindi scopri un fatto reale prima di giudicare.",
        badge: "Ingegnere",
        guess: ["riservato", "ama la matematica", "gioca a scacchi", "pianifica tutto", "aggiusta tutto", "mattiniero"],
        real: ["molto spiritoso", "ama la matematica", "suona la batteria", "improvvisa", "aggiusta tutto", "nottambulo"],
        gaps: "6 vuoti", filled: "riempiti dall’etichetta", seen: "visti: 0 su 6", fact1: "1 fatto reale", close: "da vicino",
        claim: ["La vitamina X", "ferma i raffreddori."], trust: "la tua fiducia", evidence: "prove mostrate", none: "nessuna",
        loud: "rumoroso", fact: ["Suono la batteria", "in una band!"],
        names: ["Stereotipizzazione", "Bias di autorità", "Errore di attribuzione di gruppo"],
        caps: [
          "Incontri una persona nuova. Di lei sai solo <b>un’etichetta</b>.",
          "Il tuo cervello riempie i vuoti con <b>ciò che si aspetta</b>. Risparmia fatica.",
          "Questa è la <b>stereotipizzazione</b>: sei tratti che <b>non hai mai visto</b> davvero.",
          "Aggiungi un <b>camice bianco</b> e un’affermazione <b>senza prove</b> sembra giusta.",
          "Allo stadio, un tifoso <b>urla</b> senza sosta…",
          "…così decidi che <b>tutti</b> i tifosi della squadra sono rumorosi.",
          "<b>La soluzione:</b> scopri prima un <b>fatto reale</b> su quella persona.",
          "Da vicino, ogni persona è <b>più di un’etichetta</b>."
        ],
        say: [
          "Incontri una persona nuova. Di lei sai solo un’etichetta: ingegnere.",
          "Il tuo cervello riempie i vuoti con ciò che si aspetta da quell’etichetta. Risparmia molta fatica.",
          "Questa è la stereotipizzazione: sei tratti che non hai mai visto davvero.",
          "Aggiungi un camice bianco e un’affermazione senza prove sembra giusta. È il bias di autorità.",
          "Allo stadio, un tifoso urla senza sosta...",
          "...così decidi che tutti i tifosi della squadra sono rumorosi. È l’errore di attribuzione di gruppo.",
          "La soluzione: scopri prima un fatto reale su quella persona.",
          "Da vicino, ogni persona è più di un’etichetta.",
          "Stereotipi. Un’etichetta riempie ciò che non sai, quindi scopri un fatto reale prima di giudicare."
        ]
      }
    },
    svg(T) {
      const head = `<circle cx="${PX}" cy="${HY}" r="${HR}"/>`;
      const chips = RY.map((y, i) => `
        <path class="fs-link" data-k="l${i}" pathLength="1" stroke-dasharray="1 1"/>
        <g class="fs-chip" data-k="c${i}">
          <rect class="bg" x="${CX}" y="${y - CH / 2}" width="${CW}" height="${CH}" rx="7"/>
          <rect class="m" data-k="cm${i}" x="${CX}" y="${y - CH / 2}" width="${CW}" height="${CH}" rx="7"/>
          <rect class="b" data-k="cb${i}" x="${CX}" y="${y - CH / 2}" width="${CW}" height="${CH}" rx="7"/>
          <rect class="g" data-k="cg${i}" x="${CX}" y="${y - CH / 2}" width="${CW}" height="${CH}" rx="7"/>
          <text class="q" data-k="cq${i}" x="${CX + 12}" y="${y + 4.3}">?</text>
          <text class="t" data-k="ct${i}" x="${CX + 12}" y="${y + 3.9}">${T.guess[i]}</text>
          <line class="s" data-k="cs${i}" x1="${CX + 9}" x2="${CX + 9}" y1="${y}" y2="${y}"/>
          <text class="n" data-k="cn${i}" x="${CX + 12}" y="${y + 3.9}">${T.real[i]}</text>
          <path class="k" data-k="ck${i}" d="M${CX + CW - 18.5} ${y} L${CX + CW - 15.3} ${y + 3.3} L${CX + CW - 9.2} ${y - 3.6}"/>
        </g>`).join("");
      const fans = FANS.map((x, i) => fan(x, i)).join("");
      const copies = FANS.map((x, i) => `<line class="fs-tl" data-k="tl${i}" x1="${x}" x2="${x}" y1="${FT[i % 2] + 16}" y2="${FY - 11}"/>
        <g class="fs-tag" data-k="t${i}"><rect data-k="t${i}r" y="-8" height="16" rx="8"/><text y="3.5">${T.loud}</text></g>`).join("");
      const names = T.names.map((s, i) => `<g class="fs-name" data-k="p${i}"><path data-k="p${i}s"/>
        <circle cx="${PL[0] + 9.5}" cy="${PL[1] + PL[2] / 2}" r="2.3"/><text data-k="p${i}t" x="${PL[0] + 19}" y="${PL[1] + 16.3}">${s}</text></g>`).join("");
      return `
        ${chips}
        <g data-k="per">
          <g class="fs-dash" data-k="pd">${head}<path d="${BODY}"/></g>
          <g class="fs-solid" data-k="ps">${head}<path d="${BODY}"/></g>
          <g data-k="face"><circle class="fs-eye" cx="${PX - 6.5}" cy="${HY - 2}" r="1.9"/><circle class="fs-eye" cx="${PX + 6.5}" cy="${HY - 2}" r="1.9"/>
            <path class="fs-solid" d="M${PX - 7} ${HY + 6} Q${PX} ${HY + 12} ${PX + 7} ${HY + 6}"/></g>
          <g class="fs-coat" data-k="coat"><path class="c" d="${BODY}"/>
            <path class="l" d="M86 118 L80 137 L91 142 L96 152 L101 142 L112 137 L106 118"/>
            <path class="l" d="M58 176 H76 V190 H58 Z M71 176 V168"/>
            <path class="st" d="M84 121 Q76 156 96 162 Q116 156 108 121 M96 162 V170"/><circle class="st" cx="96" cy="175" r="4.6"/></g>
          <g class="fs-scarf" data-k="scarf">
            <path class="sc" d="M75 114 Q96 124 117 114 L118 122.5 Q96 133 74 122.5 Z"/>
            <path class="sc" d="M100 126 L112 125 L117 170 L105 171 Z"/>
            <path class="str" d="M101.6 141 L113.6 140 M103.1 155 L115.1 154"/>
            <path class="fr" d="M106.5 172 V178 M110.5 171.5 V177.5 M114.5 171 V177"/></g>
          <g data-k="badge"><path class="fs-lan" d="M88 119 L${PX - 5} ${BY - 11} M104 119 L${PX + 5} ${BY - 11}"/>
            <g class="fs-badge"><rect data-k="bb" y="${BY - 11}" height="22" rx="5"/><text data-k="bt" x="${PX}" y="${BY + 4}">${T.badge}</text></g></g>
          <path class="fs-shout" data-k="shout" d="M122 80 Q126 88 122 96 M128.5 75 Q135 88 128.5 101"/>
        </g>
        <g class="fs-tag" data-k="tag"><rect data-k="tagr" y="-8" height="16" rx="8"/><text data-k="tagt" y="3.5">${T.loud}</text></g>
        <text class="fs-note" data-k="n1" x="${CX}" y="23">${T.gaps}</text>
        <text class="fs-note" data-k="n2" x="${CX}" y="23">${T.filled}</text>
        <text class="fs-note b" data-k="n3" x="${CX}" y="23">${T.seen}</text>
        <text class="fs-note g" data-k="n4" x="${CX}" y="23">${T.fact1}</text>
        <text class="fs-note g" data-k="n5" x="${CX}" y="23">${T.close}</text>
        <g data-k="bars">
          <text class="fs-bl" x="${BAR[0]}" y="92">${T.trust}</text>
          <rect class="fs-trk" x="${BAR[0]}" y="98" width="${BAR[1]}" height="16" rx="4"/>
          <rect class="fs-bq" data-k="trustb" x="${BAR[0]}" y="98" height="16" rx="4"/>
          <text class="fs-bl" x="${BAR[0]}" y="148">${T.evidence}</text>
          <rect class="fs-trk" x="${BAR[0]}" y="154" width="${BAR[1]}" height="16" rx="4"/>
          <text class="fs-none" x="${BAR[0] + 9}" y="165.4">${T.none}</text>
        </g>
        ${fans}
        ${copies}
        <g class="fs-bub" data-k="bub"><path d="${callout(BX0, BY0, BW, BH, 10, PX, TIP - BY0 - BH)}"/>${lines(T.claim, BX0 + BW / 2, BY0 + BH / 2, 15)}</g>
        <g class="fs-bub g" data-k="fact"><path d="${callout(BX0, BY0, BW, BH, 10, PX, TIP - BY0 - BH)}"/>${lines(T.fact, BX0 + BW / 2, BY0 + BH / 2, 15)}</g>
        ${names}`;
    },
    S0: { who: 0, badge: 0, chips: 0, link: 0, fill: 0, bad: 0, n1: 0, n2: 0, n3: 0, n4: 0, n5: 0, p0: 0, p1: 0, p2: 0,
      coat: 0, bub: 0, bars: 0, trust: 0, scarf: 0, crowd: 0, shout: 0, tag: 0, copy: 0,
      real: 0, fact: 0, r0: 0, r1: 0, r2: 0, r3: 0, r4: 0, r5: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = +cl(v).toFixed(3); };
      const tw = (key, fb) => { try { return k(key).getComputedTextLength() || fb; } catch (e) { return fb; } };
      const pop = (key, v, cx, cy) => {   // scale in around (cx, cy)
        const s = f1((.7 + .3 * cl(v)) * 100) / 100;
        k(key).setAttribute("transform", `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`);
        op(key, v * 1.6);
      };

      // the person: a blank dashed outline until you meet them for real
      k("per").setAttribute("transform", `translate(0 ${f1(6 * (1 - S.who))})`);
      op("per", S.who);
      op("pd", 1 - S.real); op("ps", S.real); op("face", S.real);
      op("coat", S.coat); op("scarf", S.scarf);
      op("shout", S.shout);

      // the one label, and the links from it to everything it fills in
      const bw = Math.max(62, tw("bt", 56) + 22);
      k("bb").setAttribute("x", f1(PX - bw / 2)); k("bb").setAttribute("width", f1(bw));
      pop("badge", S.badge, PX, BY);
      const bx = PX + bw / 2 + 1;
      RY.forEach((y, i) => {
        const l = k("l" + i);
        l.setAttribute("d", `M${f1(bx)} ${BY} C${f1(bx + 34)} ${BY} ${CX - 44} ${y} ${CX - 2} ${y}`);
        l.setAttribute("stroke-dashoffset", (1 - cl(S.link * 1.3 - i * .06)).toFixed(3));
        op("l" + i, S.link > 0 ? S.chips : 0);
      });

      // the trait chips: gaps, then guesses, then (at the end) what the real person is like
      RY.forEach((y, i) => {
        const f = cl(S.fill - i), b = cl(S.bad - i), r = S["r" + i];
        const c = k("c" + i);
        c.setAttribute("transform", `translate(${f1(-8 * (1 - S.chips))} 0)`);
        op("c" + i, S.chips);
        op("cq" + i, 1 - sm(f / .4));   // the gap's "?" leaves before the guess arrives
        let out, inn, strike = 0;
        if (OK[i]) { out = sm(r); inn = sm(r); }
        else { strike = sm(r / .4); out = sm((r - .45) / .3); inn = sm((r - .55) / .45); }
        op("ct" + i, sm((f - .4) / .6) * (1 - out));
        op("cn" + i, inn);
        op("cm" + i, 1 - b); op("cb" + i, b * (1 - inn)); op("cg" + i, inn);
        const len = tw("ct" + i, 60);
        k("cs" + i).setAttribute("x2", f1(CX + 9 + (len + 6) * strike));
        op("cs" + i, strike > 0 ? 1 - out : 0);
        op("ck" + i, OK[i] ? inn : 0);
      });
      ["n1", "n2", "n3", "n4", "n5"].forEach(n => op(n, S[n]));

      // authority: a claim, your trust, the evidence
      op("bars", S.bars);
      k("trustb").setAttribute("width", f1(BAR[1] * .92 * S.trust));
      pop("bub", S.bub, PX, TIP);
      pop("fact", S.fact, PX, TIP);

      // the loud fan's tag, and its copies landing on every other fan
      const tl = tw("tagt", 28) + 16;
      const src = [TG[0] + tl / 2, TG[1] + 8];
      k("tagr").setAttribute("x", f1(-tl / 2)); k("tagr").setAttribute("width", f1(tl));
      k("tag").setAttribute("transform", `translate(${f1(src[0])} ${f1(src[1])}) scale(${f1((.7 + .3 * cl(S.tag)) * 100) / 100})`);
      op("tag", S.tag * 1.6);
      FANS.forEach((x, i) => {
        const o = cl(S.crowd * 1.6 - i * .2);
        k("f" + i).setAttribute("transform", `translate(0 ${f1(6 * (1 - o))})`);
        op("f" + i, o);
        const p = sm(cl(S.copy - i)), dy = FT[i % 2] + 8;
        const dx = Math.min(x, 390 - tl / 2);   // keep the long Greek tag inside the frame
        const x1 = lerp(src[0], dx, p), y1 = lerp(src[1], dy, p) - 18 * Math.sin(Math.PI * p);
        k("t" + i + "r").setAttribute("x", f1(-tl / 2)); k("t" + i + "r").setAttribute("width", f1(tl));
        k("t" + i).setAttribute("transform", `translate(${f1(x1)} ${f1(y1)})`);
        op("t" + i, (p > 0 ? 1 : 0) * S.crowd);
        op("tl" + i, cl((p - .85) / .15) * S.crowd);
      });

      // the name of each bias, on a tag of its own
      ["p0", "p1", "p2"].forEach(key => {
        const nw = tw(key + "t", 120) + 29;
        k(key + "s").setAttribute("d", tagPath(PL[0], PL[1], nw, PL[2]));
        k(key).setAttribute("transform", `translate(0 ${f1(6 * (1 - cl(S[key])))})`);
        op(key, S[key] * 1.4);
      });
    },
    beats: [
      // 1: a blank outline, one label, six gaps
      { steps: [{ to: { who: 1 }, ms: 600, sfx: "pluck" }, { to: { badge: 1 }, ms: 450, ease: "out", sfx: "pop" }, { wait: 250 },
        { to: { chips: 1, n1: 1 }, ms: 600 }], hold: 2400 },
      // 2: the label fills the gaps
      { steps: [{ to: { link: 1, n1: 0 }, ms: 700, ease: "inOut" }, { to: { fill: 6, n2: 1 }, ms: 1500, ease: "lin", sfx: "scribble" }] },
      // 3: stereotyping: none of it was seen
      { steps: [{ to: { n2: 0 }, ms: 250 }, { to: { bad: 6, n3: 1 }, ms: 900, ease: "lin", sfx: "tick" }, { wait: 200 }, { to: { p0: 1 }, ms: 450, ease: "out" }] },
      // 4: authority bias: a white coat, a claim, trust without evidence
      { steps: [{ to: { chips: 0, link: 0, n3: 0, badge: 0, p0: 0 }, ms: 450 }, { to: { coat: 1 }, ms: 450 },
        { to: { bub: 1 }, ms: 400, ease: "out", sfx: "pop" }, { to: { bars: 1 }, ms: 350 },
        { to: { trust: 1 }, ms: 800 }, { to: { p1: 1 }, ms: 450, ease: "out" }], hold: 2800 },
      // 5: group attribution error, set-up: one loud fan among others
      { steps: [{ to: { bub: 0, bars: 0, coat: 0, p1: 0 }, ms: 500 }, { to: { scarf: 1, crowd: 1 }, ms: 700 }, { wait: 200 },
        { to: { shout: 1, tag: 1 }, ms: 450, ease: "out", sfx: "spring" }] },
      // 6: ...and the tag lands on every fan
      { steps: [{ to: { copy: 4 }, ms: 1300, ease: "lin", sfx: "whoosh" }, { wait: 200 }, { to: { p2: 1 }, ms: 450, ease: "out" }] },
      // 7: the fix: one real fact about the person
      { steps: [{ to: { crowd: 0, scarf: 0, shout: 0, tag: 0, p2: 0 }, ms: 500 }, { to: { badge: 1, chips: 1, real: 1 }, ms: 600 },
        { to: { fact: 1 }, ms: 450, ease: "out", sfx: "pop" }, { wait: 300 }, { to: { r2: 1, n4: 1 }, ms: 900, ease: "inOut" }], hold: 2800 },
      // 8: up close, the person differs from the label
      { steps: [{ to: { r0: 1 }, ms: 550, ease: "inOut" }, { to: { r1: 1 }, ms: 350 }, { to: { r3: 1 }, ms: 550, ease: "inOut" },
        { to: { r4: 1 }, ms: 350 }, { to: { r5: 1 }, ms: 550, ease: "inOut" }, { to: { n4: 0 }, ms: 250 }, { to: { n5: 1 }, ms: 400, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
