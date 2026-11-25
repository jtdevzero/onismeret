/* Family: others' flaws. A window onto other people and a mirror for you. Blame stickers land on everyone
   out there, while a fog on the mirror hides your own. Clear the fog and the same stickers are on you too.
   Scene for anim.js. */
(function () {
  const KEY = "family-flaws", P = `.bp[data-scene="${KEY}"]`;
  const WX0 = 16, WX1 = 240, WY0 = 14, WY1 = 188;      // the window (glass edge; the sill sits under it)
  const MX0 = 260, MX1 = 388, MY0 = 14, MY1 = 188;     // the mirror
  const IX0 = MX0 + 5, IX1 = MX1 - 5, IY1 = MY1 - 5;    // ...its glass
  const HY = 100, PX = [58, 128, 198], YX = 324;       // head line, the three people, your reflection
  const TY = 146, ROT = [-3, 2.5, -2.5];               // their stickers: chest height, tilt
  const YT = [[-3, 128, -4], [5, 150, 3], [-1, 172, -2]]; // your stickers: dx, y, tilt
  const FOG = 114;                                     // top of the fog on the mirror
  const cl = v => Math.max(0, Math.min(1, v));
  const f2 = n => +n.toFixed(2);
  // text width in viewBox units: measured for each label (T.w), or a safe guess for anything new
  const tw = (T, s, px) => (T.w && T.w[s]) || Math.ceil(s.length * px * .58);
  const tagW = (T, s) => tw(T, s, 10) + 14;

  // a person seen through glass: head and shoulders, the body runs down out of frame
  const bust = (key, cls, x, y, bottom) => `<g class="ff-p ${cls}" data-k="${key}">` +
    `<path class="b" d="M${x - 17} ${bottom} V${y + 27} C${x - 17} ${y + 18} ${x - 10} ${y + 13} ${x} ${y + 13} C${x + 10} ${y + 13} ${x + 17} ${y + 18} ${x + 17} ${y + 27} V${bottom}"/>` +
    `<circle class="b" cx="${x}" cy="${y}" r="9"/><circle class="e" cx="${x - 3.2}" cy="${y - .6}" r="1.3"/><circle class="e" cx="${x + 3.2}" cy="${y - .6}" r="1.3"/>` +
    `<path class="sm" data-k="${key}s" d="M${x - 3.6} ${y + 3.3} Q${x} ${y + 6.6} ${x + 3.6} ${y + 3.3}"/></g>`;
  // a sticker, drawn around (0, 0); placed, tilted and slapped on in render
  const sticker = (key, cls, s, w) => { return `<g class="ff-tag ${cls}" data-k="${key}"><rect x="${-w / 2}" y="-9.5" width="${w}" height="19" rx="4"/><text y="3.6">${s}</text></g>`; };
  // rounded box with a tail pointing down at (tx, y0 + h + th)
  const callout = (x0, y0, w, h, r, tx, th) => `M${x0 + r} ${y0} H${x0 + w - r} Q${x0 + w} ${y0} ${x0 + w} ${y0 + r} V${y0 + h - r} Q${x0 + w} ${y0 + h} ${x0 + w - r} ${y0 + h}` +
    ` H${tx + 6} L${tx} ${y0 + h + th} L${tx - 6} ${y0 + h} H${x0 + r} Q${x0} ${y0 + h} ${x0} ${y0 + h - r} V${y0 + r} Q${x0} ${y0} ${x0 + r} ${y0} Z`;
  // what someone behind the window says, kept inside the glass
  const speech = (key, x, s, w) => {
    const x0 = Math.max(WX0 + 9, Math.min(x - w / 2, WX1 - 9 - w));
    return `<g class="ff-sp" data-k="${key}"><path d="${callout(x0, 42, w, 24, 10, x, 9)}"/><text x="${x0 + w / 2}" y="58.2">${s}</text></g>`;
  };
  // your thoughts, in the top of the mirror, trailing down to your head
  const thought = (key, lines, w, inner) => {
    const h = lines.length > 1 ? 36 : 25, y0 = 60 - h;
    return `<g class="ff-th" data-k="${key}"><rect x="${YX - w / 2}" y="${y0}" width="${w}" height="${h}" rx="12"/>` +
      `<circle cx="${YX - 4}" cy="69" r="2.8"/><circle cx="${YX - 1}" cy="80" r="1.9"/>` +
      (inner || lines.map((l, i) => `<text x="${YX}" y="${y0 + (h > 30 ? 15.3 + 13 * i : 16.3)}">${l}</text>`).join("")) + `</g>`;
  };
  // what you see from the inside: your intentions, your reasons, your situation
  const INNER = `<g class="ff-ic" transform="translate(${YX - 22} 47.5)"><path d="M0 4.6 C-6 .6 -6.4 -3.6 -3.4 -4.9 C-1.6 -5.6 -.3 -4.5 0 -3.1 C.3 -4.5 1.6 -5.6 3.4 -4.9 C6.4 -3.6 6 .6 0 4.6 Z"/></g>` +
    `<g class="ff-ic" transform="translate(${YX} 48)"><path d="M-2.2 2.8 C-2.2 1 -4.6 -.2 -4.6 -2.8 C-4.6 -5.4 -2.6 -7 0 -7 C2.6 -7 4.6 -5.4 4.6 -2.8 C4.6 -.2 2.2 1 2.2 2.8 Z M-2 5.4 H2"/></g>` +
    `<g class="ff-ic" transform="translate(${YX + 22} 47.5)"><circle r="5.6"/><path d="M0 -3.2 V0 L2.5 1.7"/></g>`;
  // the fog: a bank of cloud over your chest, a few puffs inside it, and (for the blind spot) an eye that can't see
  const fogPath = `M${IX0} ${FOG + 12} A12 12 0 0 1 ${IX0 + 22} ${FOG + 6} A16 16 0 0 1 ${IX0 + 52} ${FOG + 2} A13 13 0 0 1 ${IX0 + 76} ${FOG + 8}` +
    ` A15 15 0 0 1 ${IX0 + 102} ${FOG + 2} A10 10 0 0 1 ${IX1} ${FOG + 12} V${IY1 - 13} Q${IX1} ${IY1} ${IX1 - 13} ${IY1} H${IX0 + 13} Q${IX0} ${IY1} ${IX0} ${IY1 - 13} Z`;
  const MIST = `M${IX0 + 10} ${FOG + 40} A11 11 0 0 1 ${IX0 + 30} ${FOG + 34} M${IX0 + 60} ${FOG + 58} A13 13 0 0 1 ${IX0 + 84} ${FOG + 52}` +
    ` M${IX0 + 78} ${FOG + 30} A9 9 0 0 1 ${IX0 + 94} ${FOG + 26} M${IX0 + 16} ${FOG + 64} A10 10 0 0 1 ${IX0 + 34} ${FOG + 60}`;
  const pill = (key, s, w) => { return `<g class="ff-pill" data-k="${key}"><rect x="${200 - w / 2}" y="230" width="${w}" height="26" rx="13"/><text x="200" y="247.3">${s}</text></g>`; };

  window.BiasAnim.SCENES[KEY] = {
    q: "tmi", viewBox: "0 0 400 272",
    css: `
      ${P} .ff-glass{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .ff-in{fill:none;stroke:var(--rule);stroke-width:1.6}
      ${P} .ff-sill{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .ff-glint{fill:none;stroke:var(--faint);stroke-width:2;stroke-linecap:round}
      ${P} .ff-p .b{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ff-p .e{fill:var(--ink)}
      ${P} .ff-p .sm{fill:none;stroke:var(--ink);stroke-width:1.7;stroke-linecap:round}
      ${P} .ff-p.you .b{stroke:var(--q)}
      ${P} .ff-p.you .e{fill:var(--q)}
      ${P} .ff-p.you .sm{stroke:var(--q)}
      ${P} .ff-tag rect{fill:var(--surface);stroke:var(--bad);stroke-width:1.8}
      ${P} .ff-tag text{font:600 10px var(--display);fill:var(--bad);text-anchor:middle}
      ${P} .ff-tag.good rect{stroke:var(--good);stroke-width:2}
      ${P} .ff-tag.good text{fill:var(--good)}
      ${P} .ff-tag.mute rect{stroke:var(--muted)}
      ${P} .ff-tag.mute text{fill:var(--muted)}
      ${P} .ff-sp path{fill:var(--surface);stroke:var(--muted);stroke-width:1.8;stroke-linejoin:round}
      ${P} .ff-sp.q path{stroke:var(--q)}
      ${P} .ff-sp text{font:600 11px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ff-th rect,${P} .ff-th circle{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .ff-th text{font:600 11px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ff-ic *{fill:none;stroke:var(--q);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ff-fog{fill:var(--faint);fill-opacity:.72;stroke:var(--muted);stroke-width:1.6;stroke-opacity:.6;stroke-linejoin:round}
      ${P} .ff-mist{fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round;opacity:.8}
      ${P} .ff-eye{fill:none;stroke:var(--ink);stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ff-eye .pu{fill:var(--ink);stroke:none}
      ${P} .ff-lab{font:500 10px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .ff-lab.q{fill:var(--q)}
      ${P} .ff-pill rect{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .ff-pill text{font:600 12px var(--display);fill:var(--q);text-anchor:middle}
    `,
    text: {
      hu: {
        name: "Mások hibái", shareTitle: "Miért látjuk mások hibáit, a sajátunkat nem, 30 másodpercben",
        ecline: "Bármilyen torzítást látsz másokon, keresd meg magadban is.",
        others: "mások", you: "te", outside: "kívülről", inside: "belülről",
        asIs: ["Úgy látom a dolgokat,", "ahogy vannak."], notMe: "Én nem.", meToo: "Én is?", fair: "Ez igaz.",
        sayA: "Nem értek egyet.", sayB: "Segíthetek?",
        tags: ["tudatlan", "önző", "elfogult"], point: "igazat adhat",
        names: ["Naiv realizmus", "Naiv cinizmus", "A torzítás vakfoltja"],
        w: { tudatlan: 40, önző: 33, elfogult: 33, "igazat adhat": 54, "Úgy látom a dolgokat,": 61, "ahogy vannak.": 62, "Én nem.": 41, "Én is?": 42,
          "Ez igaz.": 54, "Nem értek egyet.": 55, "Segíthetek?": 72, "Naiv realizmus": 79, "Naiv cinizmus": 88, "A torzítás vakfoltja": 86 },
        caps: [
          "Másokat csak <b>kívülről</b> látsz.",
          "Magadat <b>belülről</b> látod, ez segít magabiztosan cselekedni.",
          "Ezért úgy érzed, <b>ahogy van</b>, úgy látod a világot…",
          "…és aki nem ért egyet, annak <b>tudatlannak</b> kell lennie.",
          "Valaki segítséget ajánl? Egy <b>önző</b> indokot sejtesz mögötte.",
          "Mindenkiben <b>torzítást</b> látsz, csak a tükörben lévő arcban nem.",
          "<b>A megoldás:</b> ha torzítást látsz valakin? Keresd meg <b>magadban</b>.",
          "Aztán nevezz meg egy pontot, amiben <b>igazuk lehet</b>. A hangulat lecsillapodik."
        ],
        say: [
          "Másokat csak kívülről látsz: mit tesznek, nem azt, miért.",
          "Magadat belülről látod: az indokaidat, a szándékaidat, a helyzetedet. Ha ennek a látásnak bízol, az segít magabiztosan cselekedni.",
          "Ezért úgy érzed, ahogy van, úgy látod a világot. Ez a naiv realizmus...",
          "...és aki nem ért egyet veled, annak tudatlannak kell lennie.",
          "Valaki segítséget ajánl? Egy önző indokot sejtesz mögötte. Ez a naiv cinizmus.",
          "Mindenkiben torzítást látsz, csak a tükörben lévő arcban nem. Ez a torzítás vakfoltja.",
          "A megoldás: ha torzítást látsz valaki másban, keresd meg ugyanazt magadban.",
          "Aztán nevezz meg egy pontot, amiben igazuk lehet. A hangulat lecsillapodik, és te is tanulsz valamit.",
          "Mások hibái. Bármilyen torzítást látsz másokon, keresd meg magadban is."
        ]
      },
      en: {
        name: "Others' flaws", shareTitle: "Why we spot flaws in others, not ourselves, in 30 seconds",
        ecline: "Whatever bias you spot in others, look for it in yourself too.",
        others: "others", you: "you", outside: "from the outside", inside: "from the inside",
        asIs: ["I see things", "as they are."], notMe: "Not me.", meToo: "Me too?", fair: "Fair point.",
        sayA: "I disagree.", sayB: "Need a hand?",
        tags: ["clueless", "selfish", "biased"], point: "has a point",
        names: ["Naive realism", "Naive cynicism", "Bias blind spot"],
        w: { clueless: 40, selfish: 33, biased: 33, "has a point": 54, "I see things": 61, "as they are.": 62, "Not me.": 41, "Me too?": 42,
          "Fair point.": 54, "I disagree.": 55, "Need a hand?": 72, "Naive realism": 79, "Naive cynicism": 88, "Bias blind spot": 86 },
        caps: [
          "You only see other people <b>from the outside</b>.",
          "You see yourself <b>from the inside</b>, which helps you act with confidence.",
          "So you feel you see the world <b>as it is</b>…",
          "…and anyone who disagrees must be <b>clueless</b>.",
          "Someone offers to help? You suspect a <b>selfish</b> motive.",
          "You see <b>bias</b> in everyone, except the face in the mirror.",
          "<b>The fix:</b> spot a bias in someone? Look for it <b>in yourself</b>.",
          "Then name one point where <b>they could be right</b>. Tempers cool."
        ],
        say: [
          "You only see other people from the outside: what they do, not why.",
          "You see yourself from the inside: your reasons, your intentions, your situation. Trusting that view helps you act with confidence.",
          "So you feel you see the world as it is. That's naive realism...",
          "...and anyone who disagrees with you must be clueless.",
          "Someone offers to help? You suspect a selfish motive. That's naive cynicism.",
          "You see bias in everyone, except the face in the mirror. That's the bias blind spot.",
          "The fix: when you spot a bias in someone else, look for the same one in yourself.",
          "Then name one point where they could be right. Tempers cool, and you learn something too.",
          "Others' flaws. Whatever bias you spot in others, look for it in yourself too."
        ]
      },
      el: {
        name: "Τα λάθη των άλλων", shareTitle: "Γιατί βλέπουμε τα λάθη των άλλων κι όχι τα δικά μας, σε 30 δευτερόλεπτα",
        ecline: "Όποια μεροληψία βλέπεις στους άλλους, ψάξε\u00a0την και στον εαυτό σου.",
        others: "οι άλλοι", you: "εσύ", outside: "απ’ έξω", inside: "από μέσα",
        asIs: ["Βλέπω τον κόσμο", "όπως είναι."], notMe: "Εγώ όχι.", meToo: "Κι εγώ;", fair: "Εδώ έχεις δίκιο.",
        sayA: "Διαφωνώ.", sayB: "Να βοηθήσω;",
        tags: ["δεν ξέρει", "κάτι θέλει", "μεροληπτεί"], point: "έχει ένα δίκιο",
        names: ["Αφελής ρεαλισμός", "Αφελής κυνισμός", "Τυφλό σημείο της μεροληψίας"],
        w: { "δεν ξέρει": 43, "κάτι θέλει": 47, "μεροληπτεί": 54, "έχει ένα δίκιο": 63, "Βλέπω τον κόσμο": 89, "όπως είναι.": 57, "Εγώ όχι.": 42,
          "Κι εγώ;": 36, "Εδώ έχεις δίκιο.": 81, "Διαφωνώ.": 52, "Να βοηθήσω;": 68, "Αφελής ρεαλισμός": 104, "Αφελής κυνισμός": 97, "Τυφλό σημείο της μεροληψίας": 167 },
        caps: [
          "Τους άλλους τους βλέπεις μόνο <b>απ’ έξω</b>.",
          "Τον εαυτό σου τον βλέπεις <b>από\u00a0μέσα</b>, κι έτσι κινείσαι με σιγουριά.",
          "Νιώθεις λοιπόν ότι βλέπεις τον κόσμο <b>όπως είναι</b>…",
          "…άρα όποιος διαφωνεί απλώς <b>δεν ξέρει</b>.",
          "Κάποιος προσφέρεται να βοηθήσει; Υποψιάζεσαι ότι <b>κάτι θέλει</b>.",
          "Βλέπεις <b>μεροληψία</b> σε όλους, εκτός από το πρόσωπο στον καθρέφτη.",
          "<b>Η λύση:</b> βλέπεις μια μεροληψία σε κάποιον; Ψάξε την και <b>σε σένα</b>.",
          "Μετά πες ένα σημείο όπου <b>μπορεί να\u00a0έχουν δίκιο</b>. Τα πνεύματα ηρεμούν."
        ],
        say: [
          "Τους άλλους τους βλέπεις μόνο απ’ έξω: βλέπεις τι κάνουν, όχι γιατί.",
          "Τον εαυτό σου τον βλέπεις από μέσα: ξέρεις τους λόγους, τις προθέσεις και τις συνθήκες σου. Όταν εμπιστεύεσαι αυτή τη ματιά, κινείσαι με σιγουριά.",
          "Νιώθεις λοιπόν ότι βλέπεις τον κόσμο όπως είναι. Λέγεται αφελής ρεαλισμός...",
          "...άρα όποιος διαφωνεί μαζί σου απλώς δεν ξέρει.",
          "Κάποιος προσφέρεται να βοηθήσει; Υποψιάζεσαι ότι κάτι θέλει. Λέγεται αφελής κυνισμός.",
          "Βλέπεις μεροληψία σε όλους, εκτός από το πρόσωπο στον καθρέφτη. Λέγεται τυφλό σημείο της μεροληψίας.",
          "Η λύση: όταν βλέπεις μια μεροληψία σε κάποιον άλλον, ψάξε την ίδια και σε σένα.",
          "Μετά πες ένα σημείο όπου μπορεί να έχουν δίκιο. Τα πνεύματα ηρεμούν, και μαθαίνεις κι εσύ κάτι.",
          "Τα λάθη των άλλων. Όποια μεροληψία βλέπεις στους άλλους, ψάξε την και στον εαυτό σου."
        ]
      },
      es: {
        name: "Defectos ajenos", shareTitle: "Por qué vemos los defectos ajenos y no los propios, en 30 segundos",
        ecline: "Sea cual sea el sesgo que ves en los demás, búscalo también en ti.",
        others: "los demás", you: "tú", outside: "desde fuera", inside: "desde dentro",
        asIs: ["Veo las cosas", "como son."], notMe: "Yo no.", meToo: "¿Yo también?", fair: "Ahí tienes razón.",
        sayA: "No lo veo así.", sayB: "¿Te echo una mano?",
        tags: ["ignorante", "egoísta", "parcial"], point: "tiene razón",
        names: ["Realismo ingenuo", "Cinismo ingenuo", "Punto ciego de los sesgos"],
        w: { ignorante: 47, "egoísta": 36, parcial: 34, "tiene razón": 55, "Veo las cosas": 72, "como son.": 55, "Yo no.": 33, "¿Yo también?": 70,
          "Ahí tienes razón.": 88, "No lo veo así.": 70, "¿Te echo una mano?": 106, "Realismo ingenuo": 103, "Cinismo ingenuo": 97, "Punto ciego de los sesgos": 150 },
        caps: [
          "A los demás solo los ves <b>desde fuera</b>.",
          "A ti te ves <b>desde dentro</b>, y eso te ayuda a actuar con confianza.",
          "Así que sientes que ves el mundo <b>tal como es</b>…",
          "…y quien no está de acuerdo debe de ser un <b>ignorante</b>.",
          "¿Alguien se ofrece a ayudarte? Sospechas un motivo <b>egoísta</b>.",
          "Ves <b>sesgos</b> en todo el mundo, menos en la cara del espejo.",
          "<b>La solución:</b> ¿ves un sesgo en alguien? Búscalo <b>en ti</b>.",
          "Luego di un punto en el que <b>podría tener razón</b>. Los ánimos se calman."
        ],
        say: [
          "A los demás solo los ves desde fuera: lo que hacen, no por qué.",
          "A ti te ves desde dentro: tus razones, tus intenciones, tu situación. Fiarte de esa visión te ayuda a actuar con confianza.",
          "Así que sientes que ves el mundo tal como es. Es el realismo ingenuo...",
          "...y quien no está de acuerdo contigo debe de ser un ignorante.",
          "¿Alguien se ofrece a ayudarte? Sospechas un motivo egoísta. Es el cinismo ingenuo.",
          "Ves sesgos en todo el mundo, menos en la cara del espejo. Es el punto ciego de los sesgos.",
          "La solución: cuando veas un sesgo en otra persona, busca ese mismo sesgo en ti.",
          "Luego di un punto en el que podría tener razón. Los ánimos se calman, y además aprendes algo.",
          "Defectos ajenos. Sea cual sea el sesgo que ves en los demás, búscalo también en ti."
        ]
      },
      fr: {
        name: "Défauts des autres", shareTitle: "Pourquoi on voit les défauts des autres, pas les nôtres, en 30 secondes",
        ecline: "Quel que soit le biais que vous voyez chez les autres, cherchez-le aussi chez vous.",
        others: "les autres", you: "vous", outside: "de l’extérieur", inside: "de l’intérieur",
        asIs: ["Je vois le monde", "tel qu’il est."], notMe: "Pas moi.", meToo: "Moi aussi ?", fair: "C’est juste.",
        sayA: "Pas d’accord.", sayB: "Un coup de main ?",
        tags: ["ignorant", "égoïste", "partial"], point: "a raison",
        names: ["Réalisme naïf", "Cynisme naïf", "Angle mort des biais"],
        w: { ignorant: 41, "égoïste": 36, partial: 32, "a raison": 39, "Je vois le monde": 87, "tel qu’il est.": 60, "Pas moi.": 45, "Moi aussi ?": 58,
          "C’est juste.": 58, "Pas d’accord.": 71, "Un coup de main ?": 97, "Réalisme naïf": 78, "Cynisme naïf": 76, "Angle mort des biais": 119 },
        caps: [
          "Les autres, vous ne les voyez que <b>de l’extérieur</b>.",
          "Vous, vous vous voyez <b>de l’intérieur</b>, ce qui vous aide à agir avec assurance.",
          "Alors vous croyez voir le monde <b>tel qu’il est</b>…",
          "…et quiconque n’est pas d’accord doit être <b>ignorant</b>.",
          "Quelqu’un propose de vous aider ? Vous soupçonnez un motif <b>égoïste</b>.",
          "Vous voyez des <b>biais</b> chez tout le monde, sauf dans le miroir.",
          "<b>La solution :</b> un biais chez quelqu’un ? Cherchez-le <b>chez vous</b>.",
          "Puis trouvez un point où <b>l’autre pourrait avoir raison</b>. Les esprits se calment."
        ],
        say: [
          "Les autres, vous ne les voyez que de l’extérieur : ce qu’ils font, pas pourquoi.",
          "Vous, vous vous voyez de l’intérieur : vos raisons, vos intentions, votre situation. Faire confiance à ce regard vous aide à agir avec assurance.",
          "Alors vous croyez voir le monde tel qu’il est. C’est le réalisme naïf...",
          "...et quiconque n’est pas d’accord avec vous doit être ignorant.",
          "Quelqu’un propose de vous aider ? Vous soupçonnez un motif égoïste. C’est le cynisme naïf.",
          "Vous voyez des biais chez tout le monde, sauf dans le miroir. C’est l’angle mort des biais.",
          "La solution : quand vous repérez un biais chez quelqu’un, cherchez le même chez vous.",
          "Puis trouvez un point où l’autre pourrait avoir raison. Les esprits se calment, et vous apprenez quelque chose.",
          "Défauts des autres. Quel que soit le biais que vous voyez chez les autres, cherchez-le aussi chez vous."
        ]
      },
      de: {
        name: "Fehler der anderen", shareTitle: "Warum wir Fehler bei anderen sehen, nicht bei uns, in 30 Sekunden",
        ecline: "Welche Verzerrung du auch bei anderen siehst, such sie auch bei dir selbst.",
        others: "die anderen", you: "du", outside: "von außen", inside: "von innen",
        asIs: ["Ich sehe alles,", "wie es ist."], notMe: "Ich nicht.", meToo: "Ich auch?", fair: "Da ist was dran.",
        sayA: "Sehe ich anders.", sayB: "Brauchst du Hilfe?",
        tags: ["ignorant", "egoistisch", "parteiisch"], point: "hat recht",
        names: ["Naiver Realismus", "Naiver Zynismus", "Blinder Fleck für Verzerrungen"],
        w: { ignorant: 42, egoistisch: 50, parteiisch: 49, "hat recht": 44, "Ich sehe alles,": 74, "wie es ist.": 52, "Ich nicht.": 49, "Ich auch?": 50,
          "Da ist was dran.": 84, "Sehe ich anders.": 88, "Brauchst du Hilfe?": 97, "Naiver Realismus": 101, "Naiver Zynismus": 98, "Blinder Fleck für Verzerrungen": 178 },
        caps: [
          "Andere Menschen siehst du nur <b>von außen</b>.",
          "Dich selbst siehst du <b>von innen</b>, das hilft dir, selbstsicher zu handeln.",
          "Also glaubst du, die Welt zu sehen, <b>wie sie ist</b>…",
          "…und wer anderer Meinung ist, muss <b>ignorant</b> sein.",
          "Jemand bietet Hilfe an? Du vermutest ein <b>egoistisches</b> Motiv.",
          "Du findest alle <b>parteiisch</b>, nur nicht das Gesicht im Spiegel.",
          "<b>Die Lösung:</b> Du siehst bei jemandem eine Verzerrung? Such sie <b>bei dir selbst</b>.",
          "Dann nenn einen Punkt, in dem <b>die andere Seite recht haben könnte</b>. Die Gemüter kühlen ab."
        ],
        say: [
          "Andere Menschen siehst du nur von außen: was sie tun, nicht warum.",
          "Dich selbst siehst du von innen: deine Gründe, deine Absichten, deine Lage. Dieser Sicht zu vertrauen hilft dir, selbstsicher zu handeln.",
          "Also glaubst du, die Welt zu sehen, wie sie ist. Das ist naiver Realismus...",
          "...und wer anderer Meinung ist als du, muss ignorant sein.",
          "Jemand bietet Hilfe an? Du vermutest ein egoistisches Motiv. Das ist naiver Zynismus.",
          "Du findest alle parteiisch, nur nicht das Gesicht im Spiegel. Das ist der blinde Fleck für Verzerrungen.",
          "Die Lösung: Wenn du bei jemand anderem eine Verzerrung bemerkst, such dieselbe bei dir selbst.",
          "Dann nenn einen Punkt, in dem die andere Seite recht haben könnte. Die Gemüter kühlen ab, und du lernst auch etwas dazu.",
          "Fehler der anderen. Welche Verzerrung du auch bei anderen siehst, such sie auch bei dir selbst."
        ]
      },
      it: {
        name: "Difetti altrui", shareTitle: "Perché vediamo i difetti degli altri e non i nostri, in 30 secondi",
        ecline: "Qualunque bias noti negli altri, cercalo anche in te.",
        others: "gli altri", you: "tu", outside: "da fuori", inside: "da dentro",
        asIs: ["Vedo le cose", "come sono."], notMe: "Io no.", meToo: "Anch’io?", fair: "Hai ragione.",
        sayA: "Non sono d’accordo.", sayB: "Ti do una mano?",
        tags: ["ignorante", "egoista", "di parte"], point: "ha ragione",
        names: ["Realismo ingenuo", "Cinismo ingenuo", "Punto cieco dei bias"],
        w: { ignorante: 47, egoista: 36, "di parte": 38, "ha ragione": 52, "Vedo le cose": 67, "come sono.": 61, "Io no.": 29, "Anch’io?": 44,
          "Hai ragione.": 63, "Non sono d’accordo.": 108, "Ti do una mano?": 85, "Realismo ingenuo": 103, "Cinismo ingenuo": 97, "Punto cieco dei bias": 116 },
        caps: [
          "Gli altri li vedi solo <b>da fuori</b>.",
          "Te stesso lo vedi <b>da dentro</b>, e questo ti aiuta ad agire con sicurezza.",
          "Così ti sembra di vedere il mondo <b>com’è</b>…",
          "…e chi non è d’accordo deve essere <b>ignorante</b>.",
          "Qualcuno si offre di aiutarti? Sospetti un motivo <b>egoista</b>.",
          "Vedi <b>bias</b> in tutti, tranne nel volto allo specchio.",
          "<b>La soluzione:</b> noti un bias in qualcuno? Cercalo <b>in te</b>.",
          "Poi trova un punto su cui <b>potrebbe avere ragione</b>. Gli animi si calmano."
        ],
        say: [
          "Gli altri li vedi solo da fuori: ciò che fanno, non perché.",
          "Te stesso lo vedi da dentro: le tue ragioni, le tue intenzioni, la tua situazione. Fidarti di questa visione ti aiuta ad agire con sicurezza.",
          "Così ti sembra di vedere il mondo com’è. È il realismo ingenuo...",
          "...e chi non è d’accordo con te deve essere ignorante.",
          "Qualcuno si offre di aiutarti? Sospetti un motivo egoista. È il cinismo ingenuo.",
          "Vedi bias in tutti, tranne nel volto allo specchio. È il punto cieco dei bias.",
          "La soluzione: quando noti un bias in qualcun altro, cerca lo stesso in te.",
          "Poi trova un punto su cui potrebbe avere ragione. Gli animi si calmano, e impari anche qualcosa.",
          "Difetti altrui. Qualunque bias noti negli altri, cercalo anche in te."
        ]
      }
    },
    svg(T) {
      const people = PX.map((x, i) => bust("p" + i, "", x, HY, WY1 - 1)).join("");
      const theirs = PX.map((x, i) => sticker("t" + i, "", T.tags[i], tagW(T, T.tags[i]))).join("");
      const mine = YT.map((_, i) => sticker("y" + i, "", T.tags[i], tagW(T, T.tags[i])) + sticker("ym" + i, "mute", T.tags[i], tagW(T, T.tags[i]))).join("");
      const sw = s => tw(T, s, 11) + 22, fw = sw(T.fair);
      return `
        <g data-k="win">
          <rect class="ff-glass" x="${WX0}" y="${WY0}" width="${WX1 - WX0}" height="${WY1 - WY0}" rx="3"/>
          <path class="ff-glint" d="M${WX1 - 30} ${WY0 + 14} L${WX1 - 14} ${WY0 + 30} M${WX1 - 30} ${WY0 + 26} L${WX1 - 22} ${WY0 + 34}"/>
          ${people}
          <rect class="ff-in" x="${WX0 + 6}" y="${WY0 + 6}" width="${WX1 - WX0 - 12}" height="${WY1 - WY0 - 6}" rx="1"/>
          <rect class="ff-sill" x="${WX0 - 6}" y="${WY1}" width="${WX1 - WX0 + 12}" height="7" rx="2"/>
          ${theirs}
          <g data-k="good"><g data-k="t0g">${sticker("t0gi", "good", T.point, tagW(T, T.point))}</g></g>
          <text class="ff-lab" x="${(WX0 + WX1) / 2}" y="212">${T.others}</text>
          <text class="ff-lab q" data-k="outL" x="${(WX0 + WX1) / 2}" y="225">${T.outside}</text>
        </g>
        <g data-k="mir">
          <rect class="ff-glass" x="${MX0}" y="${MY0}" width="${MX1 - MX0}" height="${MY1 - MY0}" rx="18"/>
          <path class="ff-glint" d="M${IX0 + 7} ${HY + 2} L${IX0 + 21} ${HY - 12} M${IX0 + 7} ${HY + 12} L${IX0 + 14} ${HY + 5}"/>
          ${bust("me", "you", YX, HY, IY1)}
          ${mine}
          <g data-k="fog"><path class="ff-fog" d="${fogPath}"/><path class="ff-mist" data-k="mist" d="${MIST}"/>
            <g class="ff-eye" data-k="eye" transform="translate(${IX1 - 19} ${FOG + 30}) scale(1.15)"><path d="M-8.5 0 Q0 -7.5 8.5 0 Q0 7.5 -8.5 0 Z"/><circle class="pu" r="2.3"/><path d="M-7.5 6.5 L7.5 -6.5"/></g></g>
          <rect class="ff-in" x="${IX0}" y="${MY0 + 5}" width="${IX1 - IX0}" height="${IY1 - MY0 - 5}" rx="13"/>
          <text class="ff-lab q" x="${YX}" y="212">${T.you}</text>
          <text class="ff-lab q" data-k="inL" x="${YX}" y="225">${T.inside}</text>
        </g>
        ${speech("bA", PX[0], T.sayA, sw(T.sayA))}${speech("bB", PX[1], T.sayB, sw(T.sayB))}
        ${thought("inner", [], 84, INNER)}${thought("th1", T.asIs, Math.max(...T.asIs.map(sw)))}${thought("thN", [T.notMe], sw(T.notMe))}${thought("thM", [T.meToo], sw(T.meToo))}
        <g class="ff-sp q" data-k="thF"><path d="${callout(YX - fw / 2, 46, fw, 24, 10, YX, 11)}"/><text x="${YX}" y="62.2">${T.fair}</text></g>
        ${T.names.map((s, i) => pill("n" + i, s, tw(T, s, 12) + 30)).join("")}`;
    },
    S0: { win: 0, ppl: 0, outL: 0, mir: 0, inner: 0, inL: 0, n0: 0, n1: 0, n2: 0, th1: 0, thN: 0, thM: 0, thF: 0,
      bA: 0, bB: 0, t0: 0, t1: 0, t2: 0, fogUp: 0, clear: 0, mine: 0, flip: 0, dim: 0, smile: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = f2(cl(v)); };
      const pop = (key, v, cx, cy) => {     // scale in around (cx, cy)
        const s = f2(.7 + .3 * v);
        k(key).setAttribute("transform", `translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`);
        op(key, v * 1.6);
      };
      // a sticker lands: big and tilted, then flat on the chest; sy squashes it for a flip
      const slap = (key, x, y, r, v, sy) => {
        const s = 1 + .6 * (1 - cl(v));
        k(key).setAttribute("transform", `translate(${x} ${y}) rotate(${f2(r + 10 * (1 - cl(v)))}) scale(${f2(s)} ${f2(s * (sy || 1))})`);
      };
      // the window and the people behind it
      op("win", S.win);
      k("win").setAttribute("transform", `translate(0 ${f2(6 * (1 - S.win))})`);
      PX.forEach((x, i) => {
        const v = cl((S.ppl - i * .3) / .4);
        k("p" + i).setAttribute("transform", `translate(0 ${f2(10 * (1 - v))})`);
        op("p" + i, v);
        op("p" + i + "s", S.smile);
      });
      op("outL", S.outL);
      // the mirror, you, and the fog that hides your own stickers
      op("mir", S.mir);
      k("mir").setAttribute("transform", `translate(0 ${f2(6 * (1 - S.mir))})`);
      op("mes", S.smile);
      op("inL", S.inL);
      op("fog", (.6 + .4 * S.fogUp) * (1 - S.clear));
      k("fog").setAttribute("transform", `translate(0 ${f2(-6 * S.clear)})`);
      k("mist").setAttribute("transform", `translate(${f2(8 * S.clear)} 0)`);
      op("eye", S.fogUp);
      // speech and thoughts
      pop("bA", S.bA, PX[0], 75); pop("bB", S.bB, PX[1], 75);
      for (const key of ["inner", "th1", "thN", "thM"]) pop(key, S[key], YX, 80);
      pop("thF", S.thF, YX, 81);
      for (const key of ["n0", "n1", "n2"]) pop(key, S[key], 200, 243);
      // their stickers; at the end theirs come off and the first one flips over to "has a point"
      const fl = Math.max(.01, Math.abs(Math.cos(Math.PI * S.flip))), after = S.flip >= .5;
      PX.forEach((x, i) => slap("t" + i, x, TY, ROT[i], S["t" + i], i ? 1 : fl));
      op("t0", after ? 0 : S.t0 * 2.5); op("t1", S.t1 * 2.5 * (1 - S.dim)); op("t2", S.t2 * 2.5 * (1 - S.dim));
      const gx = Math.max(PX[0], WX0 + 10 + tagW(T, T.point) / 2);   // a longer label shifts right to stay on the glass
      slap("t0g", gx, TY, ROT[0], 1, fl);
      op("good", after ? 1 : 0);
      // yours appear once the fog is gone, and turn grey at the end: known, not hidden
      YT.forEach(([dx, y, r], i) => {
        const v = cl((S.mine - i * .3) / .4);
        slap("y" + i, YX + dx, y, r, v); slap("ym" + i, YX + dx, y, r, v);
        op("y" + i, v * 2.5 * (1 - S.dim)); op("ym" + i, v * 2.5 * S.dim);
      });
    },
    beats: [
      { steps: [{ to: { win: 1 }, ms: 500, sfx: "pluck" }, { to: { ppl: 1 }, ms: 900, ease: "lin" }, { to: { outL: 1 }, ms: 400 }] },
      { steps: [{ to: { mir: 1 }, ms: 500 }, { to: { inner: 1 }, ms: 450, ease: "back", sfx: "pop" }, { to: { inL: 1 }, ms: 400 }], hold: 3000 },
      { steps: [{ to: { inner: 0, outL: 0, inL: 0 }, ms: 300 }, { to: { n0: 1 }, ms: 400, ease: "back", sfx: "tick" }, { to: { th1: 1 }, ms: 450, ease: "back" }] },
      { steps: [{ to: { bA: 1 }, ms: 400, ease: "back" }, { wait: 500 }, { to: { t0: 1 }, ms: 380, ease: "back", sfx: "pop" }] },
      { steps: [{ to: { th1: 0, bA: 0, n0: 0 }, ms: 300 }, { to: { n1: 1 }, ms: 400, ease: "back" }, { to: { bB: 1 }, ms: 400, ease: "back" }, { wait: 500 },
        { to: { t1: 1 }, ms: 380, ease: "back", sfx: "pop" }] },
      { steps: [{ to: { bB: 0, n1: 0 }, ms: 300 }, { to: { n2: 1 }, ms: 400, ease: "back" }, { to: { t2: 1 }, ms: 380, ease: "back", sfx: "pop" }, { wait: 300 },
        { to: { thN: 1, fogUp: 1 }, ms: 450, ease: "back" }], hold: 2800 },
      { steps: [{ to: { n2: 0, thN: 0 }, ms: 300 }, { to: { clear: 1 }, ms: 900, ease: "inOut", sfx: "whoosh" }, { to: { mine: 1 }, ms: 900, ease: "lin", sfx: "tick" },
        { to: { thM: 1 }, ms: 400, ease: "back" }], hold: 2800 },
      { steps: [{ to: { thM: 0 }, ms: 250 }, { to: { thF: 1 }, ms: 400, ease: "back" }, { to: { flip: 1 }, ms: 700, ease: "inOut", sfx: "chime", sfxAt: 350 },
        { to: { dim: 1, smile: 1 }, ms: 600 }], hold: 4200 }
    ]
  };
})();
