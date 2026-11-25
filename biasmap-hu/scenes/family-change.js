/* Family "Change": we judge by the difference from a starting point, not by the thing itself. The same
   €60 headphones feel cheap or pricey as the reference beside them changes (anchoring, contrast, framing),
   until you sleep on it and work out the cost per use. Scene for anim.js. */
(function () {
  const KEY = "family-change", P = `.bp[data-scene="${KEY}"]`;
  const HX = 292, HY = 96;                        // headphones: centre between the cups
  const TG = { x: 262, y: 122, w: 60, h: 28 };    // the price tag, pointed end on the right
  const TY = TG.y + TG.h / 2;                     // tag centre line, shared by the card and the arrow
  const CX = 92, CW = 120, CH = 60;               // the reference card: centre x and size
  const AX0 = CX + CW / 2 + 6, AX1 = TG.x - 6;    // the difference arrow, card to tag
  const MY = 212, MC = 200, MR = 130;             // the meter: row, centre, half-width
  const KP = [-.3, -.88, .88, -.5, .5];           // where each reference puts the knob: old pair, was, just seen, off, fee
  const DIFF = [-10, -90, 45, -10, 10];           // €60 minus each reference
  const MOOD = ["m", "g", "g", "b", "g", "b"];    // colour of each verdict ("?" first)
  const CHIP = { x: 26, y: 102, w: 132, h: 16, gap: 4 };   // recap: the four starting points as a list
  const CALC = { x: 110, y: 178, w: 200, h: 66 }; // the cost-per-use card
  const TAG = `M${TG.x + 6} ${TG.y} H${TG.x + TG.w - 14} L${TG.x + TG.w} ${TY} L${TG.x + TG.w - 14} ${TG.y + TG.h} H${TG.x + 6} ` +
    `Q${TG.x} ${TG.y + TG.h} ${TG.x} ${TG.y + TG.h - 6} V${TG.y + 6} Q${TG.x} ${TG.y} ${TG.x + 6} ${TG.y} Z`;
  const TAG_HOLE = TG.x + TG.w - 11;
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const mx = p => f1(MC + MR * p);

  // headphones centred on (0, 0), at scale s: band, two cups, two cushions
  const phones = (s, cls) => {
    const n = v => f1(v * s);
    return `<g class="${cls}"><path class="fc-band" d="M${n(-30)} ${n(-10)} C${n(-30)} ${n(-62)} ${n(30)} ${n(-62)} ${n(30)} ${n(-10)}"/>
      <rect class="fc-cup" x="${n(-40)}" y="${n(-16)}" width="${n(20)}" height="${n(32)}" rx="${n(8)}"/>
      <rect class="fc-cup" x="${n(20)}" y="${n(-16)}" width="${n(20)}" height="${n(32)}" rx="${n(8)}"/>
      <rect class="fc-cush" x="${n(-22)}" y="${n(-11)}" width="${n(6)}" height="${n(22)}" rx="${n(3)}"/>
      <rect class="fc-cush" x="${n(16)}" y="${n(-11)}" width="${n(6)}" height="${n(22)}" rx="${n(3)}"/></g>`;
  };
  // a reference card, centred on (0, 0): dashed outline, a small label, then its content
  const card = (i, label, body) => `<g data-k="c${i}"><g class="fc-card">
      <rect x="${-CW / 2}" y="${-CH / 2}" width="${CW}" height="${CH}" rx="9"/><text class="fc-cl" y="-12">${label}</text>${body}</g></g>`;
  const spark = (x, y, r) => `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`;
  const rays = (x, y, r1, r2) => [0, 1, 2, 3, 4, 5, 6, 7].map(i => {
    const a = i * Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
    return `M${f1(x + c * r1)} ${f1(y + s * r1)} L${f1(x + c * r2)} ${f1(y + s * r2)}`;
  }).join(" ");

  window.BiasAnim.SCENES[KEY] = {
    q: "tmi", viewBox: "0 0 400 272",
    css: `
      ${P} .fc-band{fill:none;stroke:var(--ink);stroke-width:2.6;stroke-linecap:round}
      ${P} .fc-cup{fill:var(--surface);stroke:var(--ink);stroke-width:2.2}
      ${P} .fc-cush{fill:var(--q);fill-opacity:.3;stroke:var(--ink);stroke-width:1.6}
      ${P} .fc-mini .fc-band{stroke:var(--muted);stroke-width:1.8}
      ${P} .fc-mini .fc-cup{stroke:var(--muted);stroke-width:1.6}
      ${P} .fc-mini .fc-cush{stroke:none;fill:var(--muted);fill-opacity:.5}
      ${P} .fc-tag path.t{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .fc-tag path.ok{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linejoin:round}
      ${P} .fc-tag circle{fill:none;stroke:var(--ink);stroke-width:1.6}
      ${P} .fc-str{fill:none;stroke:var(--muted);stroke-width:1.6;stroke-linecap:round}
      ${P} .fc-price{font:700 17px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fc-card rect{fill:var(--surface);stroke:var(--muted);stroke-width:1.8;stroke-dasharray:5 4}
      ${P} .fc-cl{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .fc-pr{font:700 18px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fc-strike{fill:none;stroke:var(--bad);stroke-width:2.4;stroke-linecap:round}
      ${P} .fc-fr{font:700 13px var(--display);text-anchor:middle}
      ${P} .fc-fr.g{fill:var(--good)} ${P} .fc-fr.b{fill:var(--bad)}
      ${P} .fc-start{font:500 9.5px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .fc-chip rect{fill:var(--surface);stroke:var(--muted);stroke-width:1.4;stroke-opacity:.7}
      ${P} .fc-chip .v{font:700 11px var(--display);fill:var(--ink)}
      ${P} .fc-chip .l{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .fc-arr{fill:none;stroke:var(--q);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fc-diff{font:700 13px var(--display);text-anchor:middle}
      ${P} .fc-diff.g{fill:var(--good)} ${P} .fc-diff.b{fill:var(--bad)}
      ${P} .fc-note{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .fc-track{fill:none;stroke:var(--muted);stroke-width:1.6}
      ${P} .fc-mid{stroke:var(--rule);stroke-width:2;stroke-linecap:round}
      ${P} .fc-end{font:500 10px var(--mono);fill:var(--muted)} ${P} .fc-end.e{text-anchor:end}
      ${P} .fc-dot{fill:var(--faint)} ${P} .fc-lit{fill:var(--q)}
      ${P} .fc-knob{fill:var(--q);stroke:var(--surface);stroke-width:2}
      ${P} .fc-v{font:600 11px var(--display);text-anchor:middle}
      ${P} .fc-v.m{fill:var(--muted)} ${P} .fc-v.g{fill:var(--good)} ${P} .fc-v.b{fill:var(--bad)}
      ${P} .fc-brk path{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fc-brk text{font:600 11px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .fc-pill rect{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .fc-pill text{font:600 11.5px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .fc-moon{fill:var(--q);stroke:var(--q);stroke-width:2;stroke-linejoin:round}
      ${P} .fc-sun circle{fill:var(--q);fill-opacity:.25;stroke:var(--q);stroke-width:2}
      ${P} .fc-sun path{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round}
      ${P} .fc-calc rect{fill:var(--surface);stroke:var(--good);stroke-width:2}
      ${P} .fc-calc .h{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .fc-calc .s{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fc-calc .r{font:700 16px var(--display);fill:var(--good);text-anchor:middle}
      ${P} .fc-carr{fill:none;stroke:var(--good);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
    `,
    text: {
      hu: {
        name: "Változás", shareTitle: "Miért a különbség alapján ítélünk, nem a dolog alapján, 30 másodpercben",
        ecline: "Összehasonlítással ítélünk, ezért a kiindulópont dönti el, hogyan látszanak a dolgok.",
        price: "60 €", old: "70 €", was: "150 €", seen: "15 €", off: "10 € kedvezmény!", fee: "+10 € díj",
        lOld: "a régi párod", lWas: "régen", lSeen: "most láttad", lWord: "a megfogalmazás",
        start: "kiindulópont", starts: "kiindulópontok", pm: "±10 €", diffL: "különbség", money: v => `${v < 0 ? "−" : "+"}${Math.abs(v)} €`,
        cheap: "olcsó", pricey: "drága", feels: "milyennek érződik a 60 €", same: "ugyanaz a 60 €",
        verdict: ["?", "jó ár", "lopás!", "túl sok!", "nyereség", "veszteség"],
        pills: [["Horgonyhatás", 84], ["Kontrasztbatás", 118], ["Keretezési hatás", 112]],
        morning: "másnap reggel", cpu: "költség használatonként", sum: "60 € ÷ 300 használat", res: "= 20 cent alkalmanként",
        caps: [
          "Fejhallgató <b>60 €</b>-ért. Olcsó vagy drága? Az ár önmagában keveset mond.",
          "Ezért az agyad <b>összehasonlít</b>. Gyors, és általában elég jó.",
          "A címke szerint „régen <b>150 €</b>” volt. Most a 60 € <b>lopásnak</b> tűnik.",
          "Most láttál egy párt <b>15 €</b>-ért? Most a 60 € <b>túl soknak</b> tűnik.",
          "A „<b>10 € kedvezmény</b>” győzelemnek hangzik. A „<b>10 € díj</b>” veszteségnek.",
          "Ugyanaz a fejhallgató, ugyanaz a 60 €. Csak a <b>kiindulópont</b> változott.",
          "<b>A megoldás:</b> aludj rá egyet, és az összehasonlítások nélkül ítéld meg az árat.",
          "Aztán számold ki a <b>használatonkénti költséget</b>, és lásd a <b>valódi méretét</b>."
        ],
        say: [
          "Fejhallgató hatvan euróért. Olcsó vagy drága? Az ár önmagában nem sokat mond.",
          "Ezért az agyad összehasonlít, egy kiindulóponthoz, például a hetven eurós régi pároddal. Gyors, és általában elég jó.",
          "Horgonyhatás. A címke szerint régen száznegyven volt. Most a hatvan lopásnak tűnik.",
          "Kontrasztbatás. Most láttál egy párt tizenötért. Most a hatvan túl soknak tűnik.",
          "Keretezési hatás. Tíz euró kedvezmény győzelemnek hangzik. Tíz eurós díj veszteségnek.",
          "Ugyanaz a fejhallgató, ugyanaz a hatvan euró. Csak a kiindulópont változott.",
          "A megoldás: aludj rá egyet, és az összehasonlítások nélkül ítéld meg az árat.",
          "Aztán számold ki a használatonkénti költséget. Hatvan euró háromszáz használatra az alkalmankénti húsz cent. Most látod a valódi méretét.",
          "A változást vesszük észre. Összehasonlítással ítélünk, ezért a kiindulópont dönti el, hogyan látszanak a dolgok."
        ]
      },
      en: {
        name: "Change", shareTitle: "Why we judge by the difference, not the thing, in 30 seconds",
        ecline: "We judge by comparison, so the starting point decides how things look.",
        price: "€60", old: "€70", was: "€150", seen: "€15", off: "€10 off!", fee: "+€10 fee",
        lOld: "your old pair", lWas: "was", lSeen: "just seen", lWord: "the wording",
        start: "starting point", starts: "starting points", pm: "±€10", diffL: "difference", money: v => `${v < 0 ? "−" : "+"}€${Math.abs(v)}`,
        cheap: "cheap", pricey: "pricey", feels: "how the €60 feels", same: "same €60",
        verdict: ["?", "good price", "a steal!", "too much!", "a win", "a loss"],
        pills: [["Anchoring", 84], ["Contrast effect", 118], ["Framing effect", 112]],
        morning: "next morning", cpu: "cost per use", sum: "€60 ÷ 300 uses", res: "= 20c a use",
        caps: [
          "Headphones for <b>€60</b>. Cheap or pricey? The price alone says little.",
          "So your brain <b>compares</b>. It's quick, and usually good enough.",
          "The tag says “was <b>€150</b>”. Now €60 feels like <b>a steal</b>.",
          "Just seen a pair for <b>€15</b>? Now €60 feels like <b>too much</b>.",
          "“<b>€10 off</b>” sounds like a win. A “<b>€10 fee</b>”, like a loss.",
          "Same headphones, same €60. Only the <b>starting point</b> changed.",
          "<b>The fix:</b> sleep on it, and judge the price <b>without the comparisons</b>.",
          "Then work out the <b>cost per use</b>, and see its <b>real size</b>."
        ],
        say: [
          "Headphones for sixty euros. Cheap or pricey? The price on its own doesn't tell you much.",
          "So your brain compares, with a starting point, like your old pair at seventy. It's quick, and usually good enough.",
          "Anchoring. The tag says it was a hundred and fifty. Now sixty feels like a steal.",
          "The contrast effect. You've just seen a pair for fifteen. Now sixty feels like too much.",
          "The framing effect. Ten euros off sounds like a win. A ten euro fee sounds like a loss.",
          "Same headphones, same sixty euros. Only the starting point changed.",
          "The fix: sleep on it, and judge the price without the comparisons.",
          "Then work out the cost per use. Sixty euros over three hundred uses is twenty cents a go. Now you see its real size.",
          "We notice change. We judge by comparison, so the starting point decides how things look."
        ]
      },
      el: {
        name: "Η αλλαγή", shareTitle: "Γιατί κρίνουμε από τη διαφορά κι όχι από το ίδιο το πράγμα, σε 30 δευτερόλεπτα",
        ecline: "Κρίνουμε συγκρίνοντας, γι’\u00a0αυτό η αφετηρία καθορίζει πώς μας φαίνονται τα πράγματα.",
        price: "60 €", old: "70 €", was: "150 €", seen: "15 €", off: "10 € έκπτωση!", fee: "+10 € χρέωση",
        lOld: "τα παλιά σου", lWas: "αρχική τιμή", lSeen: "μόλις είδες", lWord: "η διατύπωση",
        start: "αφετηρία", starts: "αφετηρίες", pm: "±10\u00a0€", diffL: "διαφορά", money: v => `${v < 0 ? "−" : "+"}${Math.abs(v)} €`,
        cheap: "φθηνά", pricey: "ακριβά", feels: "πώς σου φαίνονται τα 60 €", same: "ίδια 60 €",
        verdict: ["?", "καλή τιμή", "ευκαιρία!", "πολλά λεφτά!", "κέρδος", "ζημιά"],
        pills: [["Αγκύρωση", 80], ["Φαινόμενο αντίθεσης", 142], ["Φαινόμενο πλαισίωσης", 148]],
        morning: "το επόμενο πρωί", cpu: "κόστος ανά χρήση", sum: "60 € ÷ 300 χρήσεις", res: "= 20 λεπτά τη χρήση",
        caps: [
          "Ακουστικά στα <b>60 €</b>. Φθηνά ή ακριβά; Η τιμή από μόνη της δεν σου λέει πολλά.",
          "Γι’ αυτό το μυαλό σου <b>συγκρίνει</b>. Είναι γρήγορο και συνήθως αρκεί.",
          "Η ετικέτα γράφει «αρχική τιμή <b>150 €</b>». Τώρα τα 60 € σου φαίνονται <b>ευκαιρία</b>.",
          "Μόλις είδες ένα ζευγάρι στα <b>15 €</b>; Τώρα τα 60 € σου φαίνονται <b>πολλά</b>.",
          "Η «<b>έκπτωση 10 €</b>» ακούγεται σαν κέρδος. Η «<b>χρέωση 10 €</b>», σαν ζημιά.",
          "Ίδια ακουστικά, ίδια 60 €. Άλλαξε μόνο η <b>αφετηρία</b>.",
          "<b>Η λύση:</b> άσ’\u00a0το για αύριο και κρίνε την τιμή <b>χωρίς τις συγκρίσεις</b>.",
          "Μετά βγάλε το <b>κόστος ανά χρήση</b> και δες πόσο <b>στοιχίζουν στ’\u00a0αλήθεια</b>."
        ],
        say: [
          "Ακουστικά στα εξήντα ευρώ. Φθηνά ή ακριβά; Η τιμή από μόνη της δεν σου λέει πολλά.",
          "Γι’ αυτό το μυαλό σου συγκρίνει με μια αφετηρία, όπως τα παλιά σου ακουστικά στα εβδομήντα. Είναι γρήγορο και συνήθως αρκεί.",
          "Αγκύρωση. Η ετικέτα γράφει αρχική τιμή εκατόν πενήντα ευρώ. Τώρα τα εξήντα σου φαίνονται ευκαιρία.",
          "Φαινόμενο αντίθεσης. Μόλις είδες ένα ζευγάρι στα δεκαπέντε ευρώ. Τώρα τα εξήντα σου φαίνονται πολλά.",
          "Φαινόμενο πλαισίωσης. Η έκπτωση δέκα ευρώ ακούγεται σαν κέρδος. Η χρέωση δέκα ευρώ, σαν ζημιά.",
          "Ίδια ακουστικά, ίδια εξήντα ευρώ. Άλλαξε μόνο η αφετηρία.",
          "Η λύση: άσ’ το για αύριο και κρίνε την τιμή χωρίς τις συγκρίσεις.",
          "Μετά βγάλε το κόστος ανά χρήση. Εξήντα ευρώ για τριακόσιες χρήσεις κάνουν είκοσι λεπτά τη φορά. Τώρα βλέπεις πόσο στοιχίζουν στ’ αλήθεια.",
          "Προσέχουμε την αλλαγή. Κρίνουμε συγκρίνοντας, γι’ αυτό η αφετηρία καθορίζει πώς μας φαίνονται τα πράγματα."
        ]
      },
      es: {
        name: "El cambio", shareTitle: "Por qué juzgamos la diferencia y no la cosa en sí, en 30 segundos",
        ecline: "Juzgamos comparando, así que el punto de partida decide cómo vemos las cosas.",
        price: "60 €", old: "70 €", was: "150 €", seen: "15 €", off: "¡10 € menos!", fee: "+10 € de recargo",
        lOld: "los que tenías", lWas: "antes", lSeen: "recién vistos", lWord: "cómo se dice",
        start: "punto de partida", starts: "puntos de partida", pm: "±10 €", diffL: "diferencia", money: v => `${v < 0 ? "−" : "+"}${Math.abs(v)} €`,
        cheap: "baratos", pricey: "caros", feels: "cómo ves los 60 €", same: "mismos 60 €",
        verdict: ["?", "buen precio", "¡una ganga!", "¡demasiado!", "ganancia", "pérdida"],
        pills: [["Anclaje", 84], ["Efecto de contraste", 150], ["Efecto marco", 112]],
        morning: "al día siguiente", cpu: "costo por uso", sum: "60 € ÷ 300 usos", res: "= 0,20 € por uso",
        caps: [
          "Auriculares por <b>60 €</b>. ¿Baratos o caros? El precio por sí solo dice poco.",
          "Así que tu cerebro <b>compara</b>. Es rápido, y casi siempre basta.",
          "La etiqueta dice «antes <b>150 €</b>». Ahora 60 € parecen <b>una ganga</b>.",
          "¿Acabas de ver unos por <b>15 €</b>? Ahora 60 € parecen <b>demasiado</b>.",
          "«<b>10 € menos</b>» suena a ganancia. «<b>10 € de recargo</b>», a pérdida.",
          "Mismos auriculares, mismos 60 €. Solo cambió el <b>punto de partida</b>.",
          "<b>La solución:</b> consúltalo con la almohada y juzga el precio <b>sin comparaciones</b>.",
          "Luego calcula el <b>costo por uso</b> y verás su <b>tamaño real</b>."
        ],
        say: [
          "Auriculares por sesenta euros. ¿Baratos o caros? El precio por sí solo no te dice mucho.",
          "Así que tu cerebro compara, con un punto de partida, como los que tenías, de setenta. Es rápido, y casi siempre basta.",
          "Anclaje. La etiqueta dice que antes costaban ciento cincuenta. Ahora sesenta parecen una ganga.",
          "El efecto de contraste. Acabas de ver unos por quince. Ahora sesenta parecen demasiado.",
          "El efecto marco. Diez euros menos suena a ganancia. Diez euros de recargo suenan a pérdida.",
          "Mismos auriculares, mismos sesenta euros. Solo cambió el punto de partida.",
          "La solución: consúltalo con la almohada, y juzga el precio sin comparaciones.",
          "Luego calcula el costo por uso. Sesenta euros entre trescientos usos son veinte céntimos cada vez. Ahora ves su tamaño real.",
          "Notamos el cambio. Juzgamos comparando, así que el punto de partida decide cómo vemos las cosas."
        ]
      },
      fr: {
        name: "Ce qui change", shareTitle: "Pourquoi on juge l’écart plutôt que la chose, en 30 secondes",
        ecline: "On juge en comparant, alors le point de départ décide de notre regard.",
        price: "60 €", old: "70 €", was: "150 €", seen: "15 €", off: "10 € de moins !", fee: "+10 € de frais",
        lOld: "l’ancien casque", lWas: "avant", lSeen: "vu à l’instant", lWord: "la formulation",
        start: "point de départ", starts: "points de départ", pm: "±10 €", diffL: "différence", money: v => `${v < 0 ? "−" : "+"}${Math.abs(v)} €`,
        cheap: "pas cher", pricey: "cher", feels: "perception des 60 €", same: "mêmes 60 €",
        verdict: ["?", "bon prix", "une affaire !", "trop cher !", "un gain", "une perte"],
        pills: [["Ancrage", 84], ["Effet de contraste", 140], ["Effet de cadrage", 126]],
        morning: "le lendemain", cpu: "coût par utilisation", sum: "60 € ÷ 300 utilisations", res: "= 0,20 € l’utilisation",
        caps: [
          "Un casque à <b>60 €</b>. Bon marché ou cher ? Le prix seul ne dit pas grand-chose.",
          "Alors votre cerveau <b>compare</b>. C’est rapide, et en général suffisant.",
          "L’étiquette indique « avant <b>150 €</b> ». Du coup, 60 € semble <b>une affaire</b>.",
          "Vous venez d’en voir un à <b>15 €</b> ? Du coup, 60 € semble <b>trop cher</b>.",
          "« <b>10 € de moins</b> » sonne comme un gain. « <b>10 € de frais</b> », comme une perte.",
          "Même casque, mêmes 60 €. Seul le <b>point de départ</b> a changé.",
          "<b>La solution :</b> laissez passer une nuit, et jugez le prix <b>sans comparer</b>.",
          "Puis calculez le <b>coût par utilisation</b>, pour voir son <b>vrai poids</b>."
        ],
        say: [
          "Un casque à soixante euros. Bon marché ou cher ? Le prix seul ne vous dit pas grand-chose.",
          "Alors votre cerveau compare, avec un point de départ, comme votre ancien casque à soixante-dix. C’est rapide, et en général suffisant.",
          "L’ancrage. L’étiquette dit qu’il valait cent cinquante. Du coup, soixante semble une affaire.",
          "L’effet de contraste. Vous venez d’en voir un à quinze. Du coup, soixante semble trop cher.",
          "L’effet de cadrage. Dix euros de moins sonne comme un gain. Dix euros de frais sonnent comme une perte.",
          "Même casque, mêmes soixante euros. Seul le point de départ a changé.",
          "La solution : laissez passer une nuit, et jugez le prix sans comparer.",
          "Puis calculez le coût par utilisation. Soixante euros pour trois cents utilisations, ça fait vingt centimes à chaque fois. Vous voyez alors son vrai poids.",
          "On remarque le changement. On juge en comparant, alors le point de départ décide de notre regard."
        ]
      },
      de: {
        name: "Was sich ändert", shareTitle: "Warum wir nach dem Unterschied urteilen, nicht nach der Sache, in 30 Sekunden",
        ecline: "Wir urteilen im Vergleich, also bestimmt der Ausgangspunkt, wie die Dinge wirken.",
        price: "60 €", old: "70 €", was: "150 €", seen: "15 €", off: "10 € Rabatt!", fee: "+10 € Gebühr",
        lOld: "dein altes Paar", lWas: "vorher", lSeen: "gerade gesehen", lWord: "die Wortwahl",
        start: "Ausgangspunkt", starts: "Ausgangspunkte", pm: "±10 €", diffL: "Unterschied", money: v => `${v < 0 ? "−" : "+"}${Math.abs(v)} €`,
        cheap: "günstig", pricey: "teuer", feels: "wie sich 60 € anfühlen", same: "gleiche 60 €",
        verdict: ["?", "guter Preis", "Schnäppchen!", "zu teuer!", "ein Gewinn", "ein Verlust"],
        pills: [["Ankereffekt", 97], ["Kontrasteffekt", 118], ["Framing-Effekt", 115]],
        morning: "am nächsten Morgen", cpu: "Kosten pro Nutzung", sum: "60 € ÷ 300 Nutzungen", res: "= 20 Cent pro Mal",
        caps: [
          "Kopfhörer für <b>60 €</b>. Günstig oder teuer? Der Preis allein sagt wenig.",
          "Also <b>vergleicht</b> dein Gehirn. Das geht schnell und reicht meistens.",
          "Auf dem Schild steht „vorher <b>150 €</b>“. Jetzt wirken 60 € wie <b>ein Schnäppchen</b>.",
          "Gerade welche für <b>15 €</b> gesehen? Jetzt wirken 60 € <b>zu teuer</b>.",
          "„<b>10 € Rabatt</b>“ klingt nach Gewinn. „<b>10 € Gebühr</b>“ nach Verlust.",
          "Gleiche Kopfhörer, gleiche 60 €. Nur der <b>Ausgangspunkt</b> ist anders.",
          "<b>Die Lösung:</b> Schlaf eine Nacht darüber und beurteile den Preis <b>ohne Vergleiche</b>.",
          "Dann rechne die <b>Kosten pro Nutzung</b> aus. So siehst du die <b>wahre Größe</b>."
        ],
        say: [
          "Kopfhörer für sechzig Euro. Günstig oder teuer? Der Preis allein sagt dir nicht viel.",
          "Also vergleicht dein Gehirn, mit einem Ausgangspunkt, etwa deinen alten Kopfhörern für siebzig. Das geht schnell und reicht meistens.",
          "Der Ankereffekt. Auf dem Schild steht, vorher hundertfünfzig. Jetzt wirken sechzig wie ein Schnäppchen.",
          "Der Kontrasteffekt. Du hast gerade welche für fünfzehn gesehen. Jetzt wirken sechzig zu teuer.",
          "Der Framing-Effekt. Zehn Euro Rabatt klingt nach Gewinn. Zehn Euro Gebühr klingt nach Verlust.",
          "Gleiche Kopfhörer, gleiche sechzig Euro. Nur der Ausgangspunkt ist anders.",
          "Die Lösung: Schlaf eine Nacht darüber, und beurteile den Preis ohne Vergleiche.",
          "Dann rechne die Kosten pro Nutzung aus. Sechzig Euro für dreihundert Nutzungen sind zwanzig Cent pro Mal. Jetzt siehst du die wahre Größe.",
          "Wir bemerken Veränderung. Wir urteilen im Vergleich, also bestimmt der Ausgangspunkt, wie die Dinge wirken."
        ]
      },
      it: {
        name: "Ciò che cambia", shareTitle: "Perché giudichiamo la differenza e non la cosa, in 30 secondi",
        ecline: "Giudichiamo per confronto, così il punto di partenza decide come vediamo le cose.",
        price: "60 €", old: "70 €", was: "150 €", seen: "15 €", off: "10 € di sconto!", fee: "+10 € di spese",
        lOld: "le tue vecchie", lWas: "prima", lSeen: "appena viste", lWord: "le parole",
        start: "punto di partenza", starts: "punti di partenza", pm: "±10 €", diffL: "differenza", money: v => `${v < 0 ? "−" : "+"}${Math.abs(v)} €`,
        cheap: "poco", pricey: "tanto", feels: "come ti sembrano i 60 €", same: "stessi 60 €",
        verdict: ["?", "buon prezzo", "un affare!", "troppo!", "un guadagno", "una perdita"],
        pills: [["Ancoraggio", 93], ["Effetto contrasto", 134], ["Effetto framing", 117]],
        morning: "il mattino dopo", cpu: "costo per uso", sum: "60 € ÷ 300 usi", res: "= 0,20 € a uso",
        caps: [
          "Cuffie a <b>60 €</b>. Economiche o care? Il prezzo da solo dice poco.",
          "Così il cervello <b>confronta</b>. È veloce, e di solito basta.",
          "Il cartellino dice «prima <b>150 €</b>». Ora 60 € sembrano <b>un affare</b>.",
          "Hai appena visto delle cuffie a <b>15 €</b>? Ora 60 € sembrano <b>troppi</b>.",
          "«<b>10 € di sconto</b>» suona come un guadagno. «<b>10 € di spese</b>», come una perdita.",
          "Stesse cuffie, stessi 60 €. È cambiato solo il <b>punto di partenza</b>.",
          "<b>La soluzione:</b> dormici su, e giudica il prezzo <b>senza confronti</b>.",
          "Poi calcola il <b>costo per uso</b>, e scopri <b>quanto pesa davvero</b>."
        ],
        say: [
          "Cuffie a sessanta euro. Economiche o care? Il prezzo da solo non ti dice molto.",
          "Così il cervello confronta, con un punto di partenza, come le tue vecchie cuffie da settanta. È veloce, e di solito basta.",
          "L’ancoraggio. Il cartellino dice che prima costavano centocinquanta. Ora sessanta sembrano un affare.",
          "L’effetto contrasto. Hai appena visto delle cuffie a quindici. Ora sessanta sembrano troppi.",
          "L’effetto framing. Dieci euro di sconto suonano come un guadagno. Dieci euro di spese, come una perdita.",
          "Stesse cuffie, stessi sessanta euro. È cambiato solo il punto di partenza.",
          "La soluzione: dormici su, e giudica il prezzo senza confronti.",
          "Poi calcola il costo per uso. Sessanta euro diviso trecento usi fa venti centesimi a volta. Ora vedi quanto pesa davvero.",
          "Notiamo il cambiamento. Giudichiamo per confronto, così il punto di partenza decide come vediamo le cose."
        ]
      }
    },
    svg(T) {
      const mini = `<g transform="translate(-33 12)">${phones(.34, "fc-mini")}</g>`;
      const chips = [[T.old, T.lOld], [T.was, T.lWas], [T.seen, T.lSeen], [T.pm, T.lWord]].map(([v, l], i) => {
        const y = CHIP.y + i * (CHIP.h + CHIP.gap);
        return `<g class="fc-chip" data-k="ch${i}"><rect x="${CHIP.x}" y="${y}" width="${CHIP.w}" height="${CHIP.h}" rx="${CHIP.h / 2}"/>
          <text x="${CHIP.x + 9}" y="${y + 12}"><tspan class="v">${v}</tspan><tspan class="l" dx="6">${l}</tspan></text></g>`;
      }).join("");
      const pills = T.pills.map(([name, w], i) => `<g class="fc-pill" data-k="p${i + 1}">
          <rect x="12" y="10" width="${w}" height="22" rx="11"/><text x="${12 + w / 2}" y="25">${name}</text></g>`).join("");
      let dots = "", lit = "";
      KP.forEach((p, i) => {
        dots += `<circle class="fc-dot" data-k="d${i}" cx="${mx(p)}" cy="${MY}" r="4"/>`;
        lit += `<circle class="fc-lit" cx="${mx(p)}" cy="${MY}" r="4.5"/>`;
      });
      const bx0 = mx(Math.min(...KP)), bx1 = mx(Math.max(...KP));
      return `
        ${pills}
        <text class="fc-start" data-k="start" x="${CX}" y="${TY - CH / 2 - 10}">${T.start}</text>
        <text class="fc-start" data-k="starts" x="${CX}" y="${TY - CH / 2 - 10}">${T.starts}</text>
        ${chips}
        ${card(0, T.lOld, `${mini}<text class="fc-pr" x="17" y="17">${T.old}</text>`)}
        ${card(1, T.lWas, `<text class="fc-pr" y="17">${T.was}</text><path class="fc-strike" data-k="strike" pathLength="1" stroke-dasharray="1 1" d="M-30 13 L30 7"/>`)}
        ${card(2, T.lSeen, `${mini}<text class="fc-pr" x="17" y="17">${T.seen}</text>`)}
        ${card(3, T.lWord, `<g data-k="ffg"><text class="fc-fr g" data-k="ffo" y="16">${T.off}</text><text class="fc-fr b" data-k="ffe" y="16">${T.fee}</text></g>`)}
        <g data-k="arrow"><path class="fc-arr" data-k="arrp" pathLength="1" stroke-dasharray="1 1" d="M${AX0} ${TY} H${AX1}"/>
          <path class="fc-arr" data-k="arrh" d="M${AX1 - 7} ${TY - 5} L${AX1} ${TY} L${AX1 - 7} ${TY + 5}"/></g>
        <text class="fc-diff" data-k="diff" x="${(AX0 + AX1) / 2}" y="${TY - 9}"></text>
        <text class="fc-note" data-k="diffL" x="${(AX0 + AX1) / 2}" y="${TY + 18}">${T.diffL}</text>
        <g data-k="item">
          <g transform="translate(${HX} ${HY})">${phones(1, "fc-hp")}</g>
          <g class="fc-tag" data-k="tag">
            <path class="fc-str" d="M${HX + 30} ${HY + 16} Q${HX + 30} ${TY - 12} ${TAG_HOLE + 1.5} ${TY - 2.2}"/>
            <path class="t" d="${TAG}"/><path class="ok" data-k="tagok" d="${TAG}"/>
            <circle cx="${TAG_HOLE}" cy="${TY}" r="2.4"/>
            <text class="fc-price" x="${TG.x + (TG.w - 14) / 2}" y="${TG.y + 20}">${T.price}</text></g>
        </g>
        <g data-k="meter">
          <rect class="fc-track" x="${MC - MR}" y="${MY - 4}" width="${2 * MR}" height="8" rx="4"/>
          <line class="fc-mid" x1="${MC}" x2="${MC}" y1="${MY - 9}" y2="${MY + 9}"/>
          <text class="fc-end e" x="${MC - MR - 9}" y="${MY + 3.5}">${T.cheap}</text>
          <text class="fc-end" x="${MC + MR + 9}" y="${MY + 3.5}">${T.pricey}</text>
          <text class="fc-note" x="${MC}" y="${MY + 28}">${T.feels}</text>
          ${dots}<g data-k="lit">${lit}</g>
          <g class="fc-brk" data-k="brk"><path d="M${bx0} ${MY - 9} V${MY - 15} H${bx1} V${MY - 9}"/><text x="${MC}" y="${MY - 20}">${T.same}</text></g>
          <circle class="fc-knob" data-k="knob" cy="${MY}" r="7.5"/>
          <text class="fc-v" data-k="verdict" y="${MY - 15}"></text>
        </g>
        <g data-k="moon"><path class="fc-moon" transform="translate(${CX - 68} ${TY - 34})" d="M66 12 A14 14 0 1 0 80 34 A11 11 0 0 1 66 12 Z"/>
          <path class="fc-moon" d="${spark(CX + 22, TY - 20, 4)} ${spark(CX - 24, TY + 10, 3.2)}"/></g>
        <g data-k="sun"><g class="fc-sun"><circle cx="${CX}" cy="${TY - 8}" r="11"/><path d="${rays(CX, TY - 8, 16, 22)}"/></g>
          <text class="fc-note" x="${CX}" y="${TY + 30}">${T.morning}</text></g>
        <g data-k="carr"><path class="fc-carr" data-k="carrp" pathLength="1" stroke-dasharray="1 1" d="M${HX} ${TG.y + TG.h + 5} V${CALC.y - 5}"/>
          <path class="fc-carr" data-k="carrh" d="M${HX - 5} ${CALC.y - 12} L${HX} ${CALC.y - 5} L${HX + 5} ${CALC.y - 12}"/></g>
        <g class="fc-calc" data-k="calc">
          <rect x="${CALC.x}" y="${CALC.y}" width="${CALC.w}" height="${CALC.h}" rx="10"/>
          <text class="h" x="${CALC.x + CALC.w / 2}" y="${CALC.y + 16}">${T.cpu}</text>
          <text class="s" x="${CALC.x + CALC.w / 2}" y="${CALC.y + 35}">${T.sum}</text>
          <text class="r" data-k="res" x="${CALC.x + CALC.w / 2}" y="${CALC.y + 56}">${T.res}</text></g>`;
    },
    S0: { item: 0, swing: 0, meter: 0, kp: 0, kOp: 0, vi: 0, vOp: 0, start: 0, c0: 0, c1: 0, c2: 0, c3: 0, strike: 0, ff: 0,
      arr: 0, arrOp: 1, arrL: 0, ref: 0, diffL: 0, d0: 0, d1: 0, d2: 0, d3: 0, d4: 0, lit: 0, brk: 0, ch: 0,
      p1: 0, p2: 0, p3: 0, calm: 0, night: 0, day: 0, carr: 0, calc: 0, ok: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const tr = (key, s) => k(key).setAttribute("transform", s);
      const keep = 1 - S.calm;                     // the comparisons fade out overnight
      // the headphones and their tag, which swings as it lands
      tr("item", `translate(0 ${f1(10 * (1 - S.item))})`); op("item", S.item);
      tr("tag", `rotate(${f1(S.swing)} ${HX + 30} ${HY + 16})`);
      op("tagok", S.ok);
      // the starting point: one card at a time, then all four as a list
      op("start", S.start * (1 - cl(S.ch * 4)) * keep); op("starts", cl(S.ch * 4) * keep);
      for (let i = 0; i < 4; i++) {
        const c = S["c" + i], a = cl((S.ch - i * .22) / .34);
        tr("c" + i, `translate(${CX} ${TY}) scale(${(.85 + .15 * cl(c)).toFixed(3)})`);
        op("c" + i, c * keep);
        tr("ch" + i, `translate(${f1(-8 * (1 - a))} 0)`); op("ch" + i, a * keep);
      }
      k("strike").style.strokeDashoffset = 1 - cl(S.strike);
      const flip = Math.abs(Math.cos(Math.PI * cl(S.ff)));
      tr("ffg", `translate(0 11) scale(1 ${flip.toFixed(3)}) translate(0 -11)`);
      op("ffo", S.ff < .5 ? 1 : 0); op("ffe", S.ff < .5 ? 0 : 1);
      // the difference the brain reads off, card to tag
      k("arrp").style.strokeDashoffset = 1 - cl(S.arr);
      op("arrh", S.arr > .92 ? 1 : 0);
      op("arrow", (S.arr > 0 ? 1 : 0) * S.arrOp * keep);
      const d = DIFF[Math.round(S.ref)], dt = k("diff");
      dt.textContent = T.money(d); dt.setAttribute("class", "fc-diff " + (d < 0 ? "g" : "b"));
      op("diff", S.arrL * keep);
      op("diffL", S.diffL * keep);
      // how it feels: the knob follows the difference and leaves a dot wherever it has been
      op("meter", S.meter * keep);
      const kx = MC + MR * S.kp, vi = Math.round(S.vi), v = k("verdict");
      k("knob").setAttribute("cx", f1(kx)); op("knob", S.kOp);
      v.textContent = T.verdict[vi]; v.setAttribute("x", f1(kx)); v.setAttribute("class", "fc-v " + MOOD[vi]);
      op("verdict", S.vOp * S.kOp);
      for (let i = 0; i < 5; i++) op("d" + i, S["d" + i]);
      op("lit", S.lit); op("brk", S.brk);
      // which bias this is
      for (let i = 1; i <= 3; i++) {
        const p = S["p" + i];
        tr("p" + i, `translate(12 21) scale(${(.8 + .2 * cl(p)).toFixed(3)}) translate(-12 -21)`);
        op("p" + i, p);
      }
      // sleep on it
      tr("moon", `translate(0 ${f1(12 * (1 - S.night))})`); op("moon", S.night);
      tr("sun", `translate(0 ${f1(12 * (1 - S.day))})`); op("sun", S.day);
      // cost per use
      k("carrp").style.strokeDashoffset = 1 - cl(S.carr);
      op("carrh", S.carr > .92 ? 1 : 0); op("carr", S.carr > 0 ? 1 : 0);
      op("calc", S.calc); op("res", S.ok);
    },
    beats: [
      { steps: [{ to: { item: 1 }, ms: 600, sfx: "pluck" }, { to: { swing: 10 }, ms: 240 }, { to: { swing: -7 }, ms: 300, ease: "inOut" },
        { to: { swing: 0 }, ms: 300, ease: "inOut" }, { to: { meter: 1, kOp: 1, vOp: 1 }, ms: 400 },
        { to: { kp: -.14 }, ms: 300, ease: "inOut" }, { to: { kp: .14 }, ms: 450, ease: "inOut" }, { to: { kp: 0 }, ms: 300, ease: "inOut" }] },
      { steps: [{ to: { start: 1, c0: 1 }, ms: 450, ease: "back", sfx: "pop" }, { to: { arr: 1 }, ms: 600 }, { to: { arrL: 1, diffL: 1 }, ms: 300 },
        { to: { vOp: 0 }, ms: 150 }, { to: { vi: 1 } }, { to: { kp: KP[0], vOp: 1 }, ms: 700, ease: "inOut" }] },
      { steps: [{ to: { c0: 0, arrL: 0, diffL: 0, vOp: 0, d0: 1 }, ms: 250 }, { to: { ref: 1, vi: 2 } },
        { to: { p1: 1, c1: 1 }, ms: 420, ease: "back", sfx: "thud", sfxAt: 120 }, { to: { strike: 1 }, ms: 350 }, { to: { arrL: 1 }, ms: 250 },
        { to: { kp: KP[1], vOp: 1 }, ms: 800, ease: "inOut" }] },
      { steps: [{ to: { p1: 0, c1: 0, arrL: 0, vOp: 0, d1: 1 }, ms: 250 }, { to: { ref: 2, vi: 3 } },
        { to: { p2: 1, c2: 1 }, ms: 420, ease: "back", sfx: "pop" }, { to: { arrL: 1 }, ms: 250 },
        { to: { kp: KP[2], vOp: 1 }, ms: 1000, ease: "inOut" }] },
      { steps: [{ to: { p2: 0, c2: 0, arrL: 0, vOp: 0, d2: 1 }, ms: 250 }, { to: { ref: 3, vi: 4 } },
        { to: { p3: 1, c3: 1 }, ms: 420, ease: "back" }, { to: { arrL: 1 }, ms: 250 }, { to: { kp: KP[3], vOp: 1 }, ms: 700, ease: "inOut" },
        { wait: 700 }, { to: { arrL: 0, vOp: 0, d3: 1 }, ms: 200 }, { to: { ref: 4, vi: 5 } }, { to: { ff: 1 }, ms: 500, sfx: "spring" },
        { to: { arrL: 1 }, ms: 200 }, { to: { kp: KP[4], vOp: 1 }, ms: 700, ease: "inOut" }], hold: 2400 },
      { steps: [{ to: { arrL: 0, arrOp: 0, vOp: 0, p3: 0, d4: 1 }, ms: 300 }, { to: { kOp: 0 }, ms: 250 },
        { to: { c3: 0 }, ms: 300 }, { to: { ch: 1 }, ms: 1000, ease: "lin", sfx: "tick" }, { to: { lit: 1 }, ms: 400 }, { to: { brk: 1 }, ms: 400 }] },
      { steps: [{ to: { calm: 1 }, ms: 900, ease: "inOut", sfx: "whoosh" }, { to: { night: 1 }, ms: 500 }, { wait: 500 },
        { to: { night: 0, day: 1 }, ms: 700, ease: "inOut" }] },
      { steps: [{ to: { carr: 1 }, ms: 450 }, { to: { calc: 1 }, ms: 450, sfx: "scribble" }, { wait: 300 },
        { to: { ok: 1 }, ms: 500, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
