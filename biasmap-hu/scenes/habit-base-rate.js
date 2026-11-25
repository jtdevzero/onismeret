/* Habit: start from the base rate. A friend wants to put all their savings into a restaurant and
   feels certain ("the food is amazing"). First ask how places like it usually do: a street of ten
   new restaurants, three years on, most closed. Start from that, nudge up a little for the food,
   then plan for a range and keep a cushion. Counts are illustrative, not a statistic.
   The street (many cases) and the magnifier (this case) echo the habit's tile. Scene for anim.js. */
(function () {
  const KEY = "habit-base-rate", P = `.bp[data-scene="${KEY}"]`;
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const back = p => 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2);

  // the friend, their restaurant, their savings
  const FX = 34, FY = 100;                             // friend: centre, shoulders' base
  const BUB = [12, 8, 24];                             // speech bubble: x, y, height
  const COIN = i => 202 + i * 21, CY = 86, CR = 8.5;   // eight coins
  const CUSH = [5, 6, 7], CSH = 14;                    // the coins kept back, and how far they move
  const LENS = [99, 82];                               // magnifier centre, over the dish in the window

  // the street: ten new restaurants like it
  const SX = i => 16 + i * 37, SW = 32;
  const CLOSED = [1, 2, 4, 6, 7, 9];
  const H1 = 118;                                       // street header baseline
  const ST = 128, SG = 156;                             // awning top, ground line

  // the scale: chance it's still open in 3 years, in tenths
  const X = p => 40 + p * 32;                          // p in tenths (0..10)
  const AY = 236, PY = 206;                            // axis, pin heads
  const TITLE = 186;
  const GY = 248;                                      // overconfidence bracket

  const bust = `<path d="M-16 0 V-9 Q-16 -27 0 -27 Q16 -27 16 -9 V0"/><circle cy="-42" r="11"/>`;
  const bowl = `<path class="hb-bowl" d="M-10 -1 H10 Q9 7 0 7 Q-9 7 -10 -1 Z"/><path class="hb-steam" d="M-4.5 -4 q-2 -3 0 -6 M0 -4 q-2 -3 0 -6 M4.5 -4 q-2 -3 0 -6"/>`;
  const scallops = (x, y, w, n, d) => { let s = ""; for (let i = 0; i < n; i++) s += ` q${-w / n / 2} ${d} ${-w / n} 0`; return `M${x} ${y} H${x + w} V${y + 6}${s} Z`; };
  const shop = i => {
    const x = SX(i);
    return `<g data-k="sh${i}"><g data-k="shb${i}">
      <rect class="hb-fac" x="${x + 2}" y="${ST + 7}" width="${SW - 4}" height="${SG - ST - 7}"/>
      <rect class="hb-win" x="${x + 6}" y="${ST + 12}" width="11" height="10" rx="1.5"/>
      <rect class="hb-win" x="${x + 20}" y="${ST + 12}" width="7" height="${SG - ST - 12}"/>
      <path class="hb-awn" data-k="aw${i}" d="${scallops(x, ST, SW, 4, 4)}"/>
      <path class="hb-awn off" data-k="ax${i}" d="${scallops(x, ST, SW, 4, 4)}"/></g>
      ${CLOSED.includes(i) ? `<path class="hb-board" data-k="bd${i}" d="M${x + 5} ${ST + 11} L${x + 18} ${ST + 23} M${x + 18} ${ST + 11} L${x + 5} ${ST + 23}"/>` : ""}</g>`;
  };
  const badge = (key, y, n, text) => `<g class="hb-hd" data-k="${key}"><circle cx="21" cy="${y - 4}" r="7"/>` +
    `<text class="n" x="21" y="${y - 0.6}">${n}</text><text class="t" x="32" y="${y}">${text}</text></g>`;
  const pin = (key, cls, dir, l1, l2) => {
    const a = dir < 0 ? "end" : "start", tx = dir * 10;
    return `<g class="hb-pin ${cls}" data-k="${key}"><line y1="${PY + 6}" y2="${AY}"/><circle cy="${PY}" r="6"/>` +
      `<text class="l1" x="${tx}" y="${PY - 1}" text-anchor="${a}">${l1}</text>` +
      `<text class="l2" x="${tx}" y="${PY + 11}" text-anchor="${a}">${l2}</text></g>`;
  };

  window.BiasAnim.SCENES[KEY] = {
    q: "nem", viewBox: "0 0 400 272",
    css: `
      ${P} .hb-ground{stroke:var(--rule);stroke-width:1.6;stroke-linecap:round}
      ${P} .hb-you path,${P} .hb-you circle{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round}
      ${P} .hb-you .e{fill:var(--ink);stroke:none}
      ${P} .hb-you .m{fill:none}
      ${P} .hb-line{fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
      ${P} .hb-ink{fill:none;stroke:var(--ink);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hb-stripe{fill:var(--q)}
      ${P} .hb-stripe.w{fill:var(--surface)}
      ${P} .hb-awnb{fill:none;stroke:var(--q);stroke-width:2;stroke-linejoin:round}
      ${P} .hb-bowl{fill:var(--surface);stroke:var(--ink);stroke-width:1.6;stroke-linejoin:round}
      ${P} .hb-steam{fill:none;stroke:var(--q);stroke-width:1.5;stroke-linecap:round}
      ${P} .hb-bub rect,${P} .hb-bub path{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}
      ${P} .hb-bub text{font:600 12px var(--display);fill:var(--ink)}
      ${P} .hb-beam{fill:var(--q);fill-opacity:.1}
      ${P} .hb-beam-e{fill:none;stroke:var(--q);stroke-width:1.6;stroke-dasharray:2 4;stroke-linecap:round}
      ${P} .hb-coin circle{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .hb-coin text{font:700 10px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .hb-coin.g circle{stroke:var(--good)}
      ${P} .hb-coin.g text{fill:var(--good)}
      ${P} .hb-arrow{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hb-lab{font:500 10px var(--mono);fill:var(--muted)}
      ${P} .hb-lab.q{fill:var(--q)}
      ${P} .hb-lab.g{fill:var(--good)}
      ${P} .hb-lab.r{text-anchor:end}
      ${P} .hb-lab.c{text-anchor:middle}
      ${P} .hb-cbox{fill:none;stroke:var(--good);stroke-width:1.6;stroke-dasharray:3 3}
      ${P} .hb-lens{fill:var(--surface);stroke:var(--ink);stroke-width:2.4}
      ${P} .hb-handle{fill:var(--ink);stroke:var(--ink);stroke-width:2;stroke-linejoin:round}
      ${P} .hb-hd circle{fill:none;stroke:var(--q);stroke-width:1.6}
      ${P} .hb-hd .n{font:700 9.5px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .hb-hd .t{font:500 10px var(--mono);fill:var(--q)}
      ${P} .hb-fac{fill:var(--surface);stroke:var(--ink);stroke-width:1.6;stroke-linejoin:round}
      ${P} .hb-win{fill:none;stroke:var(--ink);stroke-width:1.4;stroke-linejoin:round}
      ${P} .hb-awn{fill:var(--q);fill-opacity:.3;stroke:var(--q);stroke-width:1.6;stroke-linejoin:round}
      ${P} .hb-awn.off{fill:none;stroke:var(--faint);stroke-dasharray:2.5 2.5}
      ${P} .hb-board{fill:none;stroke:var(--bad);stroke-width:2;stroke-linecap:round}
      ${P} .hb-ax{stroke:var(--rule);stroke-width:2;stroke-linecap:round}
      ${P} .hb-tick{stroke:var(--rule);stroke-width:1.5}
      ${P} .hb-pin line{stroke:var(--pc);stroke-width:2.2}
      ${P} .hb-pin circle{fill:var(--pc)}
      ${P} .hb-pin .l1{font:600 10.5px var(--display);fill:var(--pc)}
      ${P} .hb-pin .l2{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .hb-pin.i{--pc:var(--ink)} ${P} .hb-pin.b{--pc:var(--bad)} ${P} .hb-pin.q{--pc:var(--q)} ${P} .hb-pin.g{--pc:var(--good)}
      ${P} .hb-gap line{stroke:var(--bad);stroke-width:1.8;stroke-linecap:round}
      ${P} .hb-gap text{font:600 11.5px var(--display);fill:var(--bad);text-anchor:middle}
      ${P} .hb-band{fill:var(--good);fill-opacity:.22}
    `,
    text: {
      hu: {
        name: "Indulj az alapaányból", shareTitle: "Indulj az alapaányból: egy szokás 30 másodpercben",
        ecline: "Kérdezd meg, hogyan szoktak az ilyen dolgok végződni, aztán kicsit igazíts a különlegességekhez.",
        bubble: "„Fantasztikus az étel!”", savings: "az egész megtakarításuk", invest: "befektetnek", cushion: "biztonsági tartalék",
        h1: "10 hasonló új étterem", later: "3 évvel később", open: "10-ből 4 még nyitva",
        h2: "mi a különleges itt?", chance: "esély, hogy 3 év múlva is nyitva lesz",
        sure: "biztos", base: "alapaány", adj: "+ kiváló étel", n: v => `${v} 10-ből`,
        gap: "Túlzott magabiztosság hatása", range: "reális sáv",
        caps: [
          "A barátod az <b>egész megtakarításából</b> akar éttermet nyitni.",
          "„Fantasztikus az étel” – mondja. „<b>Nem bukhat meg</b>.”",
          "Csak <b>ezt a helyet</b> látja, ezért <b>biztosnak</b> érzi magát.",
          "<b>A szokás:</b> először kérdezd meg, hogyan szoktak végződni az ilyen helyek.",
          "Három év múlva <b>10-ből 6</b> bezárt. Indulj a <b>10-ből 4</b> aránytól.",
          "Aztán igazíts a különlegességekhez. Kiváló étel? <b>Kicsit feljebb</b> lépsz.",
          "Ez a különbség a <b>túlzott magabiztosság hatása</b>. Ez a szokás elkapja.",
          "Egy <b>reális sávra</b> terveznek, és <b>biztonsági tartalékot</b> tartanak."
        ],
        say: [
          "A barátod az egész megtakarításából akar éttermet nyitni.",
          "Az étel fantasztikus – mondja. Nem bukhat meg.",
          "Csak ezt a helyet látja, ezért biztosnak érzi magát.",
          "A szokás: először kérdezd meg, hogyan szoktak végződni az ilyen helyek.",
          "Képzelj el tíz hasonló új éttermet. Három év múlva hat bezárt. Tehát indulj a tízből négy aránytól.",
          "Aztán igazíts a különlegességekhez. Kiváló étel? Ez egy kis lépés felfelé, nem ugrás a biztosra.",
          "Ez a különbség a túlzott magabiztosság hatása. Ez a szokás elkapja.",
          "Ezért egy reális sávra terveznek, és biztonsági tartalékot tartanak.",
          "Indulj az alapaányból. Kérdezd meg, hogyan szoktak az ilyen dolgok végződni, aztán kicsit igazíts a különlegességekhez."
        ]
      },
      en: {
        name: "Start from the base rate", shareTitle: "Start from the base rate: a habit in 30 seconds",
        ecline: "Ask how things like this usually turn out, then adjust a little for what's special.",
        bubble: "“The food is amazing!”", savings: "all their savings", invest: "invest", cushion: "safety cushion",
        h1: "10 new restaurants like it", later: "3 years later", open: "4 of 10 still open",
        h2: "what's special here?", chance: "chance it's still open in 3 years",
        sure: "certain", base: "base rate", adj: "+ great food", n: v => `${v} in 10`,
        gap: "Overconfidence effect", range: "realistic range",
        caps: [
          "Your friend wants to open a restaurant with <b>all their savings</b>.",
          "“The food is amazing,” they say. “It <b>can't fail</b>.”",
          "They see only <b>this one place</b>, so they feel <b>certain</b>.",
          "<b>The habit:</b> first ask how places like this usually turn out.",
          "Three years on, <b>6 of 10</b> have closed. Start from <b>4 in 10</b>.",
          "Then adjust for what's special. Great food? A <b>small nudge up</b>.",
          "That gap is the <b>overconfidence effect</b>. This habit catches it.",
          "They plan for a <b>realistic range</b> and keep a <b>safety cushion</b>."
        ],
        say: [
          "Your friend wants to open a restaurant with all their savings.",
          "The food is amazing, they say. It can't fail.",
          "They see only this one place, so they feel certain.",
          "The habit: first ask how places like this usually turn out.",
          "Picture ten new restaurants like it. Three years on, six have closed. So start from four in ten.",
          "Then adjust for what's special. Great food? That's a small nudge up, not a jump to certain.",
          "That gap is the overconfidence effect. This habit catches it.",
          "So they plan for a realistic range, and keep a safety cushion.",
          "Start from the base rate. Ask how things like this usually turn out, then adjust a little for what's special."
        ]
      },
      el: {
        name: "Ξεκίνα από το βασικό ποσοστό", shareTitle: "Ξεκίνα από το βασικό ποσοστό: μια συνήθεια σε 30 δευτερόλεπτα",
        ecline: "Αναρωτήσου πώς καταλήγουν συνήθως τέτοιες περιπτώσεις και μετά διόρθωσε λίγο την εκτίμηση, ανάλογα με ό,τι κάνει αυτήν εδώ ξεχωριστή.",
        bubble: "«Το φαγητό είναι φανταστικό!»", savings: "όλες οι οικονομίες", invest: "επένδυση", cushion: "μαξιλάρι ασφαλείας",
        h1: "10 νέα εστιατόρια σαν αυτό", later: "3 χρόνια μετά", open: "4 στα 10 ακόμα ανοιχτά",
        h2: "τι το κάνει ξεχωριστό;", chance: "πιθανότητα να είναι ανοιχτό σε 3 χρόνια",
        sure: "σίγουρο", base: "βασικό ποσοστό", adj: "+ καλό φαγητό", n: v => `${v} στα 10`,
        gap: "Υπερβολική αυτοπεποίθηση", range: "ρεαλιστικό εύρος",
        caps: [
          "Ένα φιλαράκι σου θέλει να ανοίξει εστιατόριο με <b>όλες του τις οικονομίες</b>.",
          "«Το φαγητό είναι φανταστικό», σου\u00a0λέει. «<b>Αποκλείεται να αποτύχει</b>».",
          "Κοιτάζει μόνο <b>αυτό το ένα μαγαζί</b>, γι’ αυτό δεν έχει <b>καμία αμφιβολία</b>.",
          "<b>Η συνήθεια:</b> αναρωτήσου πρώτα πώς τα πάνε συνήθως τέτοια μαγαζιά.",
          "Τρία χρόνια μετά, τα <b>6 στα 10</b> έχουν κλείσει. Ξεκίνα από <b>4 στα 10</b>.",
          "Μετά δες τι το κάνει ξεχωριστό. Το καλό φαγητό ανεβάζει <b>λίγο</b> τις πιθανότητες.",
          "Αυτή η διαφορά είναι η <b>υπερβολική\u00a0αυτοπεποίθηση</b>. Έτσι την πιάνεις.",
          "Σχεδιάζει με βάση ένα <b>ρεαλιστικό εύρος</b> και κρατά <b>μαξιλάρι ασφαλείας</b>."
        ],
        say: [
          "Ένα φιλαράκι σου θέλει να ανοίξει εστιατόριο με όλες του τις οικονομίες.",
          "Το φαγητό είναι φανταστικό, σου λέει. Αποκλείεται να αποτύχει.",
          "Κοιτάζει μόνο αυτό το ένα μαγαζί, γι’ αυτό δεν έχει καμία αμφιβολία.",
          "Η συνήθεια: αναρωτήσου πρώτα πώς τα πάνε συνήθως τέτοια μαγαζιά.",
          "Φαντάσου δέκα καινούργια εστιατόρια σαν αυτό. Τρία χρόνια μετά, τα έξι έχουν κλείσει. Ξεκίνα λοιπόν από τέσσερα στα δέκα.",
          "Μετά δες τι το κάνει ξεχωριστό. Το καλό φαγητό ανεβάζει λίγο τις πιθανότητες, αλλά δεν τις φτάνει ως το σίγουρο.",
          "Αυτή η διαφορά είναι η υπερβολική αυτοπεποίθηση. Έτσι την πιάνεις.",
          "Οπότε σχεδιάζει με βάση ένα ρεαλιστικό εύρος και κρατά μαξιλάρι ασφαλείας.",
          "Ξεκίνα από το βασικό ποσοστό. Αναρωτήσου πώς καταλήγουν συνήθως τέτοιες περιπτώσεις και μετά διόρθωσε λίγο την εκτίμηση, ανάλογα με ό,τι κάνει αυτήν εδώ ξεχωριστή."
        ]
      },
      es: {
        name: "Empieza por la tasa base", shareTitle: "Empieza por la tasa base: un hábito en 30 segundos",
        ecline: "Pregunta cómo suelen salir las cosas así y luego ajusta un poco por lo que este caso tiene de especial.",
        bubble: "«¡La comida es increíble!»", savings: "todos sus ahorros", invest: "invertir", cushion: "colchón de seguridad",
        h1: "10 restaurantes nuevos así", later: "3 años después", open: "4 de 10 siguen abiertos",
        h2: "¿qué tiene de especial?", chance: "probabilidad de seguir abierto en 3 años",
        sure: "seguro", base: "tasa base", adj: "+ gran comida", n: v => `${v} de 10`,
        gap: "Efecto de exceso de confianza", range: "rango realista",
        caps: [
          "Tu amigo quiere abrir un restaurante con <b>todos sus ahorros</b>.",
          "«La comida es increíble», dice. «<b>No puede fallar</b>».",
          "Solo ve <b>este local</b>, así que está <b>seguro</b>.",
          "<b>El hábito:</b> pregunta primero cómo les suele ir a locales así.",
          "A los tres años, <b>6 de 10</b> han cerrado. Empieza por <b>4 de 10</b>.",
          "Luego ajusta por lo especial. ¿Gran comida? <b>Sube un poco</b>.",
          "Esa diferencia es el <b>efecto de exceso de confianza</b>. Este hábito lo detecta.",
          "Planea con un <b>rango realista</b> y guarda un <b>colchón de seguridad</b>."
        ],
        say: [
          "Tu amigo quiere abrir un restaurante con todos sus ahorros.",
          "La comida es increíble, dice. No puede fallar.",
          "Solo ve este local, así que está seguro.",
          "El hábito: pregunta primero cómo les suele ir a locales así.",
          "Imagina diez restaurantes nuevos como este. A los tres años, seis han cerrado. Así que empieza por cuatro de diez.",
          "Luego ajusta por lo especial. ¿Gran comida? Eso lo sube un poco, no lo convierte en algo seguro.",
          "Esa diferencia es el efecto de exceso de confianza. Este hábito lo detecta.",
          "Así que planea con un rango realista y guarda un colchón de seguridad.",
          "Empieza por la tasa base. Pregunta cómo suelen salir las cosas así y luego ajusta un poco por lo que este caso tiene de especial."
        ]
      },
      fr: {
        name: "Partez du taux de base", shareTitle: "Partez du taux de base : une habitude en 30 secondes",
        ecline: "Demandez-vous comment ce genre de chose tourne en général, puis ajustez un peu selon ce qui est spécial.",
        bubble: "« La cuisine est incroyable ! »", savings: "toutes ses économies", invest: "investir", cushion: "matelas de sécurité",
        h1: "10 nouveaux restaurants similaires", later: "3 ans plus tard", open: "4 sur 10 encore ouverts",
        h2: "qu’a-t-il de spécial ?", chance: "chances d’être encore ouvert dans 3 ans",
        sure: "certain", base: "taux de base", adj: "+ bonne cuisine", n: v => `${v} sur 10`,
        gap: "Effet de surconfiance", range: "fourchette réaliste",
        caps: [
          "Votre ami veut ouvrir un restaurant avec <b>toutes ses économies</b>.",
          "« La cuisine est incroyable », dit-il. « Ça <b>ne peut pas rater</b>. »",
          "Il ne voit que <b>ce restaurant-là</b>, alors il en est <b>certain</b>.",
          "<b>L’habitude :</b> demandez d’abord comment ce genre d’endroit s’en sort en général.",
          "Trois ans plus tard, <b>6 sur 10</b> ont fermé. Partez de <b>4 sur 10</b>.",
          "Puis ajustez selon ce qui est spécial. Bonne cuisine ? <b>On monte un peu</b>.",
          "Cet écart, c’est l’<b>effet de surconfiance</b>. Cette habitude le repère.",
          "Il prévoit une <b>fourchette réaliste</b> et garde un <b>matelas de sécurité</b>."
        ],
        say: [
          "Votre ami veut ouvrir un restaurant avec toutes ses économies.",
          "La cuisine est incroyable, dit-il. Ça ne peut pas rater.",
          "Il ne voit que ce restaurant-là, alors il en est certain.",
          "L’habitude : demandez d’abord comment ce genre d’endroit s’en sort en général.",
          "Imaginez dix nouveaux restaurants du même genre. Trois ans plus tard, six ont fermé. Alors partez de quatre sur dix.",
          "Puis ajustez selon ce qui est spécial. Bonne cuisine ? Ça fait monter un peu, pas jusqu’à la certitude.",
          "Cet écart, c’est l’effet de surconfiance. Cette habitude le repère.",
          "Alors il prévoit une fourchette réaliste, et garde un matelas de sécurité.",
          "Partez du taux de base. Demandez-vous comment ce genre de chose tourne en général, puis ajustez un peu selon ce qui est spécial."
        ]
      },
      de: {
        name: "Starte bei der Basisrate", shareTitle: "Starte bei der Basisrate: eine Gewohnheit in 30 Sekunden",
        ecline: "Frag dich, wie so etwas meistens ausgeht. Dann pass die Schätzung ein wenig an das Besondere an.",
        bubble: "„Das Essen ist fantastisch!“", savings: "alle Ersparnisse", invest: "investieren", cushion: "Sicherheitspolster",
        h1: "10 ähnliche neue Restaurants", later: "3 Jahre später", open: "4 von 10 noch offen",
        h2: "was ist hier besonders?", chance: "Chance, in 3 Jahren noch offen zu sein",
        sure: "sicher", base: "Basisrate", adj: "+ tolles Essen", n: v => `${v} von 10`,
        gap: "Selbstüberschätzung", range: "realistische Spanne",
        caps: [
          "Dein Freund will mit <b>all seinen Ersparnissen</b> ein Restaurant eröffnen.",
          "„Das Essen ist fantastisch“, sagt er. „Das <b>kann nicht schiefgehen</b>.“",
          "Er sieht nur <b>dieses eine Lokal</b>, also fühlt er sich <b>sicher</b>.",
          "<b>Die Gewohnheit:</b> Frag erst, wie es solchen Lokalen meistens ergeht.",
          "Drei Jahre später haben <b>6 von 10</b> geschlossen. Starte bei <b>4 von 10</b>.",
          "Dann berücksichtige, was besonders ist. Tolles Essen? <b>Ein kleines Stück nach oben</b>.",
          "Diese Lücke ist die <b>Selbstüberschätzung</b>. Diese Gewohnheit fängt sie ab.",
          "Er plant mit einer <b>realistischen Spanne</b> und behält ein <b>Sicherheitspolster</b>."
        ],
        say: [
          "Dein Freund will mit all seinen Ersparnissen ein Restaurant eröffnen.",
          "Das Essen ist fantastisch, sagt er. Das kann nicht schiefgehen.",
          "Er sieht nur dieses eine Lokal, also fühlt er sich sicher.",
          "Die Gewohnheit: Frag erst, wie es solchen Lokalen meistens ergeht.",
          "Stell dir zehn ähnliche neue Restaurants vor. Drei Jahre später haben sechs geschlossen. Also starte bei vier von zehn.",
          "Dann berücksichtige, was besonders ist. Tolles Essen? Das bringt ein kleines Stück nach oben, keinen Sprung zur Gewissheit.",
          "Diese Lücke ist die Selbstüberschätzung. Diese Gewohnheit fängt sie ab.",
          "Also plant er mit einer realistischen Spanne und behält ein Sicherheitspolster.",
          "Starte bei der Basisrate. Frag dich, wie so etwas meistens ausgeht. Dann pass die Schätzung ein wenig an das Besondere an."
        ]
      },
      it: {
        name: "Parti dal tasso di base", shareTitle: "Parti dal tasso di base: un’abitudine in 30 secondi",
        ecline: "Chiediti come vanno di solito cose come questa, poi correggi un po’ per ciò che è speciale.",
        bubble: "«Si mangia benissimo!»", savings: "tutti i suoi risparmi", invest: "investire", cushion: "cuscinetto",
        h1: "10 ristoranti nuovi simili", later: "3 anni dopo", open: "4 su 10 ancora aperti",
        h2: "cosa ha di speciale?", chance: "probabilità che sia aperto tra 3 anni",
        sure: "certo", base: "tasso di base", adj: "+ ottimo cibo", n: v => `${v} su 10`,
        gap: "Eccesso di fiducia", range: "forbice realistica",
        caps: [
          "Un tuo amico vuole aprire un ristorante con <b>tutti i suoi risparmi</b>.",
          "«Si mangia benissimo», dice. «<b>Non può fallire</b>».",
          "Vede solo <b>questo locale</b>, quindi si sente <b>sicuro</b>.",
          "<b>L’abitudine:</b> prima chiediti come va di solito a locali come questo.",
          "Dopo tre anni, <b>6 su 10</b> hanno chiuso. Parti da <b>4 su 10</b>.",
          "Poi correggi per ciò che è speciale. Ottimo cibo? Una <b>piccola spinta in su</b>.",
          "Quel divario è <b>l’eccesso di fiducia</b>. Questa abitudine lo smaschera.",
          "Così pianifica su una <b>forbice realistica</b> e tiene da parte un <b>cuscinetto</b>."
        ],
        say: [
          "Un tuo amico vuole aprire un ristorante con tutti i suoi risparmi.",
          "Si mangia benissimo, dice. Non può fallire.",
          "Vede solo questo locale, quindi si sente sicuro.",
          "L’abitudine: prima chiediti come va di solito a locali come questo.",
          "Immagina dieci ristoranti nuovi simili. Dopo tre anni, sei hanno chiuso. Quindi parti da quattro su dieci.",
          "Poi correggi per ciò che è speciale. Ottimo cibo? È una piccola spinta in su, non un salto alla certezza.",
          "Quel divario è l’eccesso di fiducia. Questa abitudine lo smaschera.",
          "Così pianifica su una forbice realistica, e tiene da parte un cuscinetto.",
          "Parti dal tasso di base. Chiediti come vanno di solito cose come questa, poi correggi un po’ per ciò che è speciale."
        ]
      }
    },
    svg(T) {
      // the restaurant's striped awning
      let stripes = "";
      for (let j = 0; j < 6; j++) stripes += `<path class="hb-stripe${j % 2 ? " w" : ""}" d="M${62 + j * 18} 54 H${80 + j * 18} V62 q-9 8 -18 0 Z"/>`;
      let ticks = "";
      for (let v = 0; v <= 10; v++) ticks += `<line class="hb-tick" x1="${X(v)}" x2="${X(v)}" y1="${AY - (v % 5 ? 3 : 5)}" y2="${AY + (v % 5 ? 3 : 5)}"/>`;
      const coins = Array.from({ length: 8 }, (_, i) =>
        `<g data-k="co${i}"><g class="hb-coin"><circle cx="${COIN(i)}" cy="${CY}" r="${CR}"/><text x="${COIN(i)}" y="${CY + 3.6}">€</text></g>` +
        (CUSH.includes(i) ? `<g class="hb-coin g" data-k="cg${i}"><circle cx="${COIN(i)}" cy="${CY}" r="${CR}"/><text x="${COIN(i)}" y="${CY + 3.6}">€</text></g>` : "") + `</g>`).join("");
      const cx0 = COIN(CUSH[0]) + CSH - CR - 5, cx1 = COIN(CUSH[CUSH.length - 1]) + CSH + CR + 5;
      return `
        <g data-k="top"><line class="hb-ground" data-k="gr" x1="14" y1="100" x2="176" y2="100"/>
        <g data-k="rest">
          <path class="hb-ink" d="M98 50 V54 M134 50 V54"/>
          <rect class="hb-line" x="88" y="36" width="56" height="14" rx="3"/>
          <circle class="hb-ink" cx="116" cy="43" r="4.6"/><circle class="hb-ink" cx="116" cy="43" r="2" style="stroke-width:1.2"/>
          <path class="hb-ink" d="M104 39 V41.6 M106 39 V47 M108 39 V41.6 M104 41.6 Q104 43.4 106 43.4 Q108 43.4 108 41.6 M126 47 V39 Q129.2 40.6 128.6 44.2 H126"/>
          <rect class="hb-line" x="66" y="60" width="100" height="40"/>
          ${stripes}<path class="hb-awnb" d="${scallops(62, 54, 108, 6, 8)}"/>
          <rect class="hb-line" x="74" y="72" width="50" height="20" rx="3"/>
          <g transform="translate(${LENS[0]} 84)">${bowl}</g>
          <rect class="hb-line" x="134" y="72" width="22" height="28"/><circle cx="151" cy="87" r="1.5" style="fill:var(--ink)"/>
        </g>
        <g class="hb-you" data-k="you" transform="translate(${FX} ${FY})">${bust}
          <circle class="e" cx="-1.8" cy="-43" r="1.3"/><circle class="e" cx="5.2" cy="-43" r="1.3"/>
          <path class="m" data-k="mouth" d=""/></g>
        <g data-k="beam"><path class="hb-beam" d="M44 57 L64 34 H173 V103 H64 Z"/><path class="hb-beam-e" d="M45 55 L63 35 M45 59 L63 101"/></g>
        <g class="hb-bub" data-k="bub"><rect data-k="bubR" x="${BUB[0]}" y="${BUB[1]}" height="${BUB[2]}" rx="12"/>
          <path d="M26 ${BUB[1] + BUB[2] - 0.6} L31 41 L36 ${BUB[1] + BUB[2] - 0.6}"/>
          <text data-k="bubT" x="${BUB[0] + 12}" y="${BUB[1] + 16.3}">${T.bubble}</text></g>
        <g data-k="mag"><g transform="translate(${LENS[0]} ${LENS[1]})">
          <g transform="rotate(45)"><rect class="hb-handle" x="17" y="-2" width="14" height="4" rx="2"/></g>
          <circle class="hb-lens" r="16"/>
          <g transform="translate(0 4) scale(1.3)">${bowl}</g></g></g>
        ${badge("h2", 26, 2, T.h2)}
        <text class="hb-lab" data-k="sav" x="193" y="70">${T.savings}</text>
        <text class="hb-lab q" data-k="inv" x="193" y="70">${T.invest}</text>
        <text class="hb-lab g r" data-k="cus" x="${cx1}" y="70">${T.cushion}</text>
        <path class="hb-arrow" data-k="arr" d="M189 ${CY} H174 M179 ${CY - 5} L174 ${CY} L179 ${CY + 5}"/>
        <rect class="hb-cbox" data-k="cbox" x="${cx0}" y="${CY - CR - 4}" width="${cx1 - cx0}" height="${2 * CR + 8}" rx="${CR + 4}"/>
        ${coins}</g>
        ${badge("h1", H1, 1, T.h1)}
        <text class="hb-lab r" data-k="later" x="386" y="${H1}">${T.later}</text>
        <line class="hb-ground" data-k="sg" x1="14" y1="${SG}" x2="386" y2="${SG}"/>
        ${Array.from({ length: 10 }, (_, i) => shop(i)).join("")}
        <text class="hb-lab q r" data-k="open" x="386" y="${SG + 14}">${T.open}</text>
        <g data-k="scale"><text class="hb-lab" x="14" y="${TITLE}">${T.chance}</text>
          <line class="hb-ax" x1="${X(0)}" x2="${X(10)}" y1="${AY}" y2="${AY}"/>${ticks}</g>
        <rect class="hb-band" data-k="band" x="${X(3.5)}" y="${AY - 7}" width="${X(6.5) - X(3.5)}" height="14" rx="3"/>
        <text class="hb-lab g c" data-k="rangeT" x="${X(5)}" y="${AY + 21}">${T.range}</text>
        <g class="hb-gap" data-k="gap"><line x1="${X(5)}" x2="${X(10)}" y1="${GY}" y2="${GY}"/>
          <line x1="${X(5)}" x2="${X(5)}" y1="${GY - 5}" y2="${GY + 5}"/><line x1="${X(10)}" x2="${X(10)}" y1="${GY - 5}" y2="${GY + 5}"/>
          <text x="${(X(5) + X(10)) / 2}" y="${GY + 14}">${T.gap}</text></g>
        ${pin("pS", "i", -1, T.sure, T.n(10))}${pin("pSb", "b", -1, T.sure, T.n(10))}
        ${pin("pB", "q", -1, T.base, T.n(4))}
        <path class="hb-arrow" data-k="nudge" style="stroke:var(--good)" d="M${X(4) + 9} ${PY} H${X(5) - 9} M${X(5) - 13} ${PY - 4} L${X(5) - 9} ${PY} L${X(5) - 13} ${PY + 4}"/>
        ${pin("pA", "g", 1, T.adj, T.n(5))}`;
    },
    S0: { home: 0, rest: 0, you: 0, coins: 0, arr: 0, grin: 0, bub: 0, beam: 0, scale: 0, sure: 0, bad: 0, sureFade: 0,
      h1: 0, st: 0, later: 0, shut: 0, open: 0, base: 0, h2: 0, mag: 0, adj: 0, adjX: 4, nudge: 0, gap: 0,
      band: 0, split: 0, cush: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const tr = (key, x, y) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)})`);
      const around = (key, x, y, s) => k(key).setAttribute("transform",
        `translate(${f1(x)} ${f1(y)}) scale(${Math.max(0, s).toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
      const pop = p => (p > 0 ? back(cl(p)) : 0);

      // the friend, the restaurant, the savings
      tr("top", 0, 70 * (1 - S.home));
      op("gr", S.rest);
      tr("rest", 0, 8 * (1 - S.rest)); op("rest", S.rest);
      op("you", S.you);
      const g = S.grin;
      k("mouth").setAttribute("d", `M${f1(-3.5 - 1.2 * g)} -37.5 Q1.7 ${f1(-33.5 + 3 * g)} ${f1(6.9 + 1.2 * g)} -37.5`);
      for (let i = 0; i < 8; i++) {
        const p = cl(S.coins * 8 - i), kept = CUSH.includes(i);
        around("co" + i, COIN(i), CY, pop(p));
        k("co" + i).style.opacity = p > 0 ? 1 : 0;
        if (kept) {
          k("co" + i).setAttribute("transform", `translate(${f1(CSH * S.split)} 0) ` + k("co" + i).getAttribute("transform"));
          op("cg" + i, S.split);
        }
      }
      op("arr", S.arr);
      op("sav", S.coins * (1 - cl(S.split * 2))); op("inv", cl(S.split * 2 - 1)); op("cus", S.cush); op("cbox", S.cush);

      // what they say, and where they look
      const tw = k("bubT").getComputedTextLength ? k("bubT").getComputedTextLength() : 150;
      k("bubR").setAttribute("width", f1(tw + 24));
      around("bub", 31, 41, .85 + .15 * S.bub); op("bub", S.bub);
      op("beam", S.beam);

      // the scale, and the friend's certainty
      tr("scale", 0, 6 * (1 - S.scale)); op("scale", S.scale);
      const sy = -40 * (1 - S.sure);
      tr("pS", X(10), sy); tr("pSb", X(10), sy);
      op("pS", (S.sure > 0 ? 1 : 0) * (1 - S.bad) * (1 - .75 * S.sureFade));
      op("pSb", (S.sure > 0 ? 1 : 0) * S.bad * (1 - .75 * S.sureFade));

      // step 1: ten places like it, three years on
      tr("h1", 8 * (1 - S.h1), 0); op("h1", S.h1);
      op("sg", S.st > 0 ? cl(S.st * 3) : 0);
      for (let i = 0; i < 10; i++) {
        const p = cl((S.st - i / 10 * .75) / .25);
        around("sh" + i, SX(i) + SW / 2, SG, pop(p));
        k("sh" + i).style.opacity = p > 0 ? 1 : 0;
        const j = CLOSED.indexOf(i);
        const c = j < 0 ? 0 : cl((S.shut - j / CLOSED.length * .7) / .3);
        op("aw" + i, 1 - c); op("ax" + i, c);
        op("shb" + i, 1 - .45 * c);
        if (j >= 0) op("bd" + i, c);
      }
      op("later", S.later); op("open", S.open);
      tr("pB", X(4), -40 * (1 - S.base)); op("pB", S.base > 0 ? 1 : 0);

      // step 2: what's special here
      tr("h2", 8 * (1 - S.h2), 0); op("h2", S.h2);
      around("mag", LENS[0], LENS[1], pop(S.mag)); op("mag", S.mag > 0 ? 1 : 0);
      tr("pA", X(S.adjX), 0); op("pA", S.adj);
      op("nudge", S.nudge);

      // the gap is the bias; the fix is a range and a cushion
      op("gap", S.gap);
      op("band", S.band); op("rangeT", S.band);
    },
    beats: [
      { steps: [{ to: { rest: 1 }, ms: 600, sfx: "pluck" }, { to: { you: 1 }, ms: 400 },
        { to: { coins: 1 }, ms: 900, ease: "lin" }, { to: { arr: 1 }, ms: 400 }] },
      { steps: [{ to: { bub: 1, grin: 1 }, ms: 450, ease: "back", sfx: "pop" }] },
      { steps: [{ to: { home: 1 }, ms: 700, ease: "inOut" }, { to: { beam: 1 }, ms: 500 }, { wait: 200 }, { to: { scale: 1 }, ms: 400 },
        { to: { sure: 1 }, ms: 900, ease: "bounce", sfx: "thud", sfxAt: 320 }] },
      { steps: [{ to: { bub: 0, beam: 0 }, ms: 400 }, { to: { h1: 1 }, ms: 400 },
        { to: { st: 1 }, ms: 1300, ease: "lin", sfx: "whoosh" }] },
      { steps: [{ to: { later: 1 }, ms: 400 }, { to: { shut: 1 }, ms: 1500, ease: "lin", sfx: "thud" }, { to: { open: 1 }, ms: 400 },
        { wait: 200 }, { to: { base: 1 }, ms: 700, ease: "bounce", sfx: "pop", sfxAt: 250 }], hold: 3000 },
      { steps: [{ to: { h2: 1 }, ms: 400 }, { to: { mag: 1 }, ms: 500 }, { wait: 300 },
        { to: { adj: 1 } }, { to: { adjX: 5, nudge: 1 }, ms: 900, ease: "inOut", sfx: "spring" }], hold: 3000 },
      { steps: [{ to: { bad: 1 }, ms: 400 }, { to: { gap: 1 }, ms: 500, sfx: "tick" }], hold: 3000 },
      { steps: [{ to: { gap: 0, sureFade: 1, grin: .35 }, ms: 500 }, { to: { band: 1 }, ms: 600 },
        { wait: 200 }, { to: { split: 1 }, ms: 700, ease: "inOut" }, { to: { cush: 1 }, ms: 450, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
