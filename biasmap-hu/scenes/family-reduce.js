/* Family: key elements. A talk makes ten points; a week later memory has kept the start, the end
   and the best bit, and the middle has faded (a light U-shaped curve shows it). Three members as
   quick examples on the same row of points: the serial position effect, leveling and sharpening
   (the retold version drops the dim points and blows up the best one), and the misinformation
   effect (a point that was never made slips into the retelling). The fix: notes that keep the
   middle, and, when you speak, your key point first and last. Numbers are illustrative, not study
   figures. Scene for anim.js. */
(function () {
  const KEY = "family-reduce", P = `.bp[data-scene="${KEY}"]`;
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const lerp = (a, b, t) => a + (b - a) * t;
  const io = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const out = t => 1 - Math.pow(1 - t, 3);

  // the row of ten points (slides), their numbers, and the memory bars above them
  const RX = i => 42.5 + 35 * i, RY = 168, TW = 30, TH = 36;
  const STAR = 5, SURV = [0, 5, 9];                              // the best bit; the three that survive the retelling
  const U = [.92, .66, .46, .34, .28, .3, .33, .44, .7, .95];    // serial position: high at both ends
  const SV = U.map((u, i) => (i === STAR ? .9 : u));             // what sticks, with the best bit
  const dimOp = s => .18 + .82 * Math.pow(cl((s - .25) / .65), 1.3);
  const BB = 142, BH = 78, BW = 14;                              // bar baseline, full height, width
  // the retold version, in a speech bubble: three points, then four with the one that wasn't there
  const BY = 86, B3 = { 0: 142.5, 5: 196, 9: 249.5 }, B4 = { 0: 128.5, 5: 216, 9: 263.5 }, FB = 168.5;
  const THEM = [358, 65], REJ = [200, 84];
  const DY = 16;                                   // everything but the name chips sits a little lower
  const T_FALLBACK = [150, 160, 150];             // chip text widths, if they can't be measured

  // little line icons, one per point, centred on 0 0
  const star = (() => {
    let d = "";
    for (let j = 0; j < 10; j++) {
      const a = -Math.PI / 2 + j * Math.PI / 5, r = j % 2 ? 4 : 9.5;
      d += `${j ? "L" : "M"}${f1(r * Math.cos(a))} ${f1(r * Math.sin(a) + .8)} `;
    }
    return d + "Z";
  })();
  const ICON = [
    `<path class="kf-ic" d="M-9 -7 H9 M-9 0 H5 M-9 7 H7"/>`,
    `<path class="kf-ic" d="M-10 9 H10 M-6 9 V2 M-1 9 V-4 M4 9 V-1 M8.5 9 V-8"/>`,
    `<circle class="kf-ic" r="8.5"/><path class="kf-ic" d="M0 0 V-8.5 M0 0 L7.4 4.2"/>`,
    `<path class="kf-ic" d="M-3.5 4.5 C-9 0.5 -7.5 -9 0 -9 C7.5 -9 9 0.5 3.5 4.5 V6.5 H-3.5 Z M-2.5 9.5 H2.5"/>`,
    `<path class="kf-ic" d="M-9 7 L-3 0.5 L1 3.5 L9 -6 M4 -6 H9 V-1"/>`,
    `<path class="kf-star" d="${star}"/>`,
    `<circle class="kf-ic" r="8.5"/><path class="kf-ic" d="M-8.5 0 H8.5 M0 -8.5 C-5 -3 -5 3 0 8.5 C5 3 5 -3 0 -8.5"/>`,
    `<circle class="kf-ic" r="8.5"/><path class="kf-ic" d="M0 -5 V0 L4 2.5"/>`,
    `<path class="kf-ic" d="M0 9.5 C-7 1.5 -7 -9 0 -9 C7 -9 7 1.5 0 9.5 Z"/><circle class="kf-ic" cy="-3" r="2.6"/>`,
    `<path class="kf-ic" d="M-6 9.5 V-9 M-6 -8 H7.5 L4.5 -4 L7.5 0 H-6"/>`
  ];
  const KEYI = `<circle class="kf-key" cx="-4.5" cy="-4.5" r="4.3"/><path class="kf-key" d="M-1.5 -1.5 L8.5 8.5 M4.5 4.5 L7 2 M7 7 L9.5 4.5"/>`;
  const RECT = `x="${-TW / 2}" y="${-TH / 2}" width="${TW}" height="${TH}" rx="4"`;
  const tile = i => `<g class="kf-tile" data-k="t${i}"><rect class="b" ${RECT}/>
      <rect class="gd" data-k="gd${i}" ${RECT}/>${i === STAR ? `<rect class="qo" data-k="qo" ${RECT}/>` : ""}
      <g data-k="ic${i}">${ICON[i]}</g>${i === 0 || i === 9 ? `<g data-k="ky${i}">${KEYI}</g>` : ""}</g>`;
  // the memory curve: a smooth line through the tops of the serial-position bars
  const curve = (() => {
    const p = U.map((u, i) => [RX(i), BB - BH * u]);
    let d = `M${p[0][0]} ${f1(p[0][1])}`;
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], e = p[Math.min(p.length - 1, i + 2)];
      d += ` C${f1(b[0] + (c[0] - a[0]) / 6)} ${f1(b[1] + (c[1] - a[1]) / 6)} ${f1(c[0] - (e[0] - b[0]) / 6)} ${f1(c[1] - (e[1] - b[1]) / 6)} ${c[0]} ${f1(c[1])}`;
    }
    return d;
  })();
  const person = (x, y) => `<circle class="kf-fl" cx="${x}" cy="${y}" r="8"/><path class="kf-fl" d="M${x - 16} ${y + 28} V${y + 22} a16 13 0 0 1 32 0 V${y + 28}"/>`;
  // your speech bubble, tail to the left; theirs, tail down
  const BUB = "M108 44 H284 Q300 44 300 60 V118 Q300 134 284 134 H108 Q92 134 92 118 V113 L65 108 L92 100 V60 Q92 44 108 44 Z";
  const TBUB = "M340 38 H376 Q388 38 388 50 V80 Q388 92 376 92 H366 L360 100 L354 92 H340 Q328 92 328 80 V50 Q328 38 340 38 Z";

  window.BiasAnim.SCENES[KEY] = {
    q: "mem", viewBox: "0 0 400 272",
    css: `
      ${P} .kf-ln{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .kf-fl{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .kf-wave{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round}
      ${P} .kf-tile *,${P} .kf-fake *{vector-effect:non-scaling-stroke}
      ${P} .kf-tile .b{fill:var(--surface);stroke:var(--ink);stroke-width:1.8}
      ${P} .kf-tile .gd{fill:none;stroke:var(--good);stroke-width:2.4}
      ${P} .kf-tile .qo{fill:none;stroke:var(--q);stroke-width:2.6}
      ${P} .kf-ic{fill:none;stroke:var(--ink);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .kf-star{fill:var(--q);stroke:var(--q);stroke-width:1.2;stroke-linejoin:round}
      ${P} .kf-key{fill:none;stroke:var(--good);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .kf-gh{fill:none;stroke:var(--faint);stroke-width:1.4;stroke-dasharray:3 3}
      ${P} .kf-num{font:500 9.5px var(--mono);fill:var(--faint);text-anchor:middle}
      ${P} .kf-kl{font:500 10px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .kf-kp{font:600 10px var(--mono);fill:var(--good)}
      ${P} .kf-lab{font:500 10px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .kf-yl{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .kf-bar{fill:var(--q);fill-opacity:.28;stroke:var(--q);stroke-width:1.3}
      ${P} .kf-bar.ok{fill:var(--good);fill-opacity:.35;stroke:var(--good)}
      ${P} .kf-curve{fill:none;stroke:var(--ink);stroke-opacity:.6;stroke-width:1.6;stroke-linecap:round}
      ${P} .kf-cal .p{fill:var(--surface);stroke:var(--ink);stroke-width:2}
      ${P} .kf-cal .n{font:700 18px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .kf-wk{font:600 12.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .kf-bub{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}
      ${P} .kf-sh{font:600 10px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .kf-chip rect{fill:var(--surface);stroke:var(--q);stroke-width:1.6}
      ${P} .kf-chip text{font:600 12px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .kf-fake .f{fill:var(--surface)}
      ${P} .kf-fake .d{fill:none;stroke:var(--ink);stroke-width:1.8;stroke-dasharray:3.5 3}
      ${P} .kf-fake .s{fill:none;stroke:var(--ink);stroke-width:1.8}
      ${P} .kf-fake .bd{fill:none;stroke:var(--bad);stroke-width:2.2}
      ${P} .kf-fake .x{fill:none;stroke:var(--bad);stroke-width:2.4;stroke-linecap:round}
      ${P} .kf-fake text{font:700 16px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .kf-rj{font:500 10px var(--mono);fill:var(--bad);text-anchor:middle}
      ${P} .kf-nb .pg{fill:none;stroke:var(--muted);stroke-width:1.6}
      ${P} .kf-nb circle{fill:var(--ground);stroke:var(--muted);stroke-width:1.6}
    `,
    text: {
      hu: {
        name: "Kulcselemek", shareTitle: "Miért emlékszünk az elejére, a végére és a legjobb részre, 30 másodpercben",
        ecline: "Az emlékezet az elejét, a végét és a legjobb részt tartja meg, ezért a közepét is írd le.",
        week: "egy héttel később", kl: ["elején", "legjobb rész", "végén"], ylab: "emlékszel",
        chip: ["Sorrendi pozíció-hatás", "Kiegyenlítés és élesítés", "Félreinformálás-hatás"],
        lvl: "kiegyenlítve", shl: "élesítve", notes: "a jegyzeteid", rej: "nincs a jegyzeteidben", kp: "fő pont",
        caps: [
          "Egy előadást hallgatsz <b>tíz ponttal</b>. Nem tudod mindet megtartani.",
          "Ezért az emlékezet néhány <b>kulcselemet</b> tart meg. Tömör, és gyorsan használható.",
          "Az <b>első</b> és az <b>utolsó</b> pont megragad. A <b>közepe</b> halványul.",
          "Újramesélve <b>elhagyod</b> a homályos részeket, és az egyik legjobbat <b>élesíted</b>.",
          "Később valaki azt mondja: „Tetszett az árakról szóló rész!” Pedig <b>nem volt ilyen</b>.",
          "Mégis belecsúszik az emlékezetedbe, és hamarosan <b>ugyanolyan valósnak</b> érződik.",
          "<b>A megoldás:</b> jegyzetelj, a <b>közepét is</b> beleértve. Aztán nézd meg, mire emlékszel.",
          "Amikor beszélsz, a <b>fő ponttal</b> nyiss és zárj. Meg fog ragadni."
        ],
        say: [
          "Egy előadást hallgatsz tíz ponttal. Nem tudod mindet megtartani.",
          "Ezért az emlékezet néhány kulcselemet tart meg: az elejét, a végét, a legjobb részt. Tömör, és gyorsan használható.",
          "A sorrendi pozíció-hatás: az első és az utolsó pont megragad. A közepe halványul.",
          "Kiegyenlítés és élesítés: újramesélve elhagyod a homályos részeket, és az egyik legjobbat élesíted.",
          "A félreinformálás-hatás: később valaki azt mondja, tetszett az árakról szóló rész! Pedig nem volt ilyen.",
          "Mégis belecsúszik az emlékezetedbe, és hamarosan ugyanolyan valósnak érződik.",
          "A megoldás: jegyzetelj, a közepét is beleértve. Aztán nézd meg, mire emlékszel.",
          "Amikor beszélsz, a fő ponttal nyiss és zárj. Meg fog ragadni.",
          "Kulcselemek. Az emlékezet az elejét, a végét és a legjobb részt tartja meg, ezért a közepét is írd le."
        ]
      },
      en: {
        name: "Key elements", shareTitle: "Why we remember the start, the end and the best bit, in 30 seconds",
        ecline: "Memory keeps the start, the end and the best bit, so write down the middle too.",
        week: "a week later", kl: ["start", "best bit", "end"], ylab: "remembered",
        chip: ["Serial position effect", "Leveling and sharpening", "Misinformation effect"],
        lvl: "leveled", shl: "sharpened", notes: "your notes", rej: "not in your notes", kp: "key point",
        caps: [
          "You hear a talk with <b>ten points</b>. You can't keep them all.",
          "So memory keeps a few <b>key elements</b>. Compact, and quick to use.",
          "The <b>first</b> and <b>last</b> points stick. The <b>middle</b> fades.",
          "Retelling it, you <b>drop</b> the dim bits and <b>sharpen</b> the best one.",
          "Later, someone says: “Loved the bit on prices!” There <b>wasn't one</b>.",
          "Yet it slips into your memory and soon feels <b>just as real</b>.",
          "<b>The fix:</b> take notes, <b>middle included</b>. Then check what you recall.",
          "When you speak, open and close with your <b>key point</b>. It'll stick."
        ],
        say: [
          "You hear a talk with ten points. You can't keep them all.",
          "So memory keeps a few key elements: the start, the end, the best bit. Compact, and quick to use.",
          "The serial position effect: the first and last points stick. The middle fades.",
          "Leveling and sharpening: retelling it, you drop the dim bits and sharpen the best one.",
          "The misinformation effect: later, someone says, loved the bit on prices! There wasn't one.",
          "Yet it slips into your memory, and soon it feels just as real.",
          "The fix: take notes, middle included. Then check what you recall.",
          "And when you speak, open and close with your key point. It'll stick.",
          "Key elements. Memory keeps the start, the end and the best bit, so write down the middle too."
        ]
      },
      el: {
        name: "Βασικά στοιχεία", shareTitle: "Γιατί θυμόμαστε την αρχή, το τέλος και το καλύτερο κομμάτι, σε 30 δευτερόλεπτα",
        ecline: "Η μνήμη κρατά την αρχή, το τέλος και το καλύτερο κομμάτι, γι’\u00a0αυτό σημείωνε και τη μέση.",
        week: "μια εβδομάδα μετά", kl: ["αρχή", "το καλύτερο", "τέλος"], ylab: "πόσο θυμάσαι",
        chip: ["Φαινόμενο σειριακής θέσης", "Εξομάλυνση και όξυνση", "Φαινόμενο παραπληροφόρησης"],
        lvl: "εξομάλυνση", shl: "όξυνση", notes: "οι σημειώσεις σου", rej: "δεν είναι στις σημειώσεις", kp: "βασικό μήνυμα",
        caps: [
          "Ακούς μια ομιλία με <b>δέκα σημεία</b>. Δεν γίνεται να τα κρατήσεις όλα.",
          "Γι’\u00a0αυτό η μνήμη κρατά λίγα <b>βασικά στοιχεία</b>. Πιάνουν λίγο χώρο και τα έχεις πρόχειρα.",
          "Τα <b>πρώτα</b> και τα <b>τελευταία</b> σημεία μένουν. Η <b>μέση</b> ξεθωριάζει.",
          "Όταν τη μεταφέρεις, <b>πετάς</b> τα θολά σημεία και <b>φουσκώνεις</b> το καλύτερο.",
          "Αργότερα σου λένε: «Τέλειο το κομμάτι για τις τιμές!» Τέτοιο <b>δεν υπήρχε</b>.",
          "Όμως τρυπώνει στη μνήμη σου και σύντομα μοιάζει <b>εξίσου αληθινό</b>.",
          "<b>Η λύση:</b> κράτα σημειώσεις <b>και\u00a0για\u00a0τη\u00a0μέση</b>. Μετά έλεγξε ό,τι θυμάσαι.",
          "Όταν μιλάς εσύ, άνοιξε και κλείσε με το <b>βασικό σου μήνυμα</b>. Θα μείνει."
        ],
        say: [
          "Ακούς μια ομιλία με δέκα σημεία. Δεν γίνεται να τα κρατήσεις όλα.",
          "Γι’ αυτό η μνήμη κρατά λίγα βασικά στοιχεία: την αρχή, το τέλος, το καλύτερο κομμάτι. Πιάνουν λίγο χώρο και τα έχεις πρόχειρα.",
          "Φαινόμενο σειριακής θέσης: τα πρώτα και τα τελευταία σημεία μένουν. Η μέση ξεθωριάζει.",
          "Εξομάλυνση και όξυνση: όταν τη μεταφέρεις, πετάς τα θολά σημεία και φουσκώνεις το καλύτερο.",
          "Φαινόμενο παραπληροφόρησης: αργότερα σου λένε, τέλειο το κομμάτι για τις τιμές! Τέτοιο δεν υπήρχε.",
          "Όμως τρυπώνει στη μνήμη σου, και σύντομα μοιάζει εξίσου αληθινό.",
          "Η λύση: κράτα σημειώσεις και για τη μέση. Μετά έλεγξε ό,τι θυμάσαι.",
          "Κι όταν μιλάς εσύ, άνοιξε και κλείσε με το βασικό σου μήνυμα. Θα μείνει.",
          "Βασικά στοιχεία. Η μνήμη κρατά την αρχή, το τέλος και το καλύτερο κομμάτι, γι’ αυτό σημείωνε και τη μέση."
        ]
      },
      es: {
        name: "Lo esencial", shareTitle: "Por qué recordamos el inicio, el final y lo mejor, en 30 segundos",
        ecline: "La memoria guarda el inicio, el final y lo mejor, así que anota también el medio.",
        week: "una semana después", kl: ["inicio", "lo mejor", "final"], ylab: "recordado",
        chip: ["Efecto de posición serial", "Nivelación y acentuación", "Efecto de desinformación"],
        lvl: "nivelado", shl: "acentuado", notes: "tus notas", rej: "no está en tus notas", kp: "idea clave",
        caps: [
          "Escuchas una charla con <b>diez puntos</b>. No puedes retenerlos todos.",
          "Así que la memoria guarda unos pocos <b>elementos clave</b>. Compacto y rápido de usar.",
          "El <b>primer</b> y el <b>último</b> punto se quedan. Los del <b>medio</b> se borran.",
          "Al contarlo, <b>quitas</b> lo borroso y <b>acentúas</b> lo mejor.",
          "Más tarde, alguien dice: «¡Me encantó lo de los precios!». <b>No hubo tal cosa</b>.",
          "Aun así, se cuela en tu memoria y pronto parece <b>igual de real</b>.",
          "<b>La solución:</b> toma notas, <b>también del medio</b>. Luego comprueba lo que recuerdas.",
          "Cuando hables, abre y cierra con tu <b>idea clave</b>. Se quedará."
        ],
        say: [
          "Escuchas una charla con diez puntos. No puedes retenerlos todos.",
          "Así que la memoria guarda unos pocos elementos clave: el inicio, el final, lo mejor. Compacto, y rápido de usar.",
          "El efecto de posición serial: el primer y el último punto se quedan. Los del medio se borran.",
          "Nivelación y acentuación: al contarlo, quitas lo borroso y acentúas lo mejor.",
          "El efecto de desinformación: más tarde, alguien dice, ¡me encantó lo de los precios! No hubo tal cosa.",
          "Aun así, se cuela en tu memoria, y pronto parece igual de real.",
          "La solución: toma notas, también del medio. Luego comprueba lo que recuerdas.",
          "Y cuando hables, abre y cierra con tu idea clave. Se quedará.",
          "Lo esencial. La memoria guarda el inicio, el final y lo mejor, así que anota también el medio."
        ]
      },
      fr: {
        name: "L’essentiel", shareTitle: "Pourquoi on retient le début, la fin et le meilleur passage, en 30 secondes",
        ecline: "La mémoire garde le début, la fin et le meilleur passage, alors notez aussi le milieu.",
        week: "une semaine plus tard", kl: ["début", "le meilleur", "fin"], ylab: "retenu",
        chip: ["Effet de position sérielle", "Nivellement et accentuation", "Effet de désinformation"],
        lvl: "nivelé", shl: "accentué", notes: "vos notes", rej: "absent de vos notes", kp: "point clé",
        caps: [
          "Vous écoutez un exposé en <b>dix points</b>. Impossible de tout retenir.",
          "Alors la mémoire garde quelques <b>éléments clés</b>. Compact, et rapide à utiliser.",
          "Le <b>premier</b> et le <b>dernier</b> point restent. Le <b>milieu</b> s’efface.",
          "En le racontant, vous <b>gommez</b> le flou et <b>accentuez</b> le meilleur.",
          "Plus tard, quelqu’un dit : « Super, le passage sur les prix ! » Il <b>n’y en avait pas</b>.",
          "Pourtant, il se glisse dans votre mémoire et paraît vite <b>tout aussi réel</b>.",
          "<b>La solution :</b> prenez des notes, <b>milieu compris</b>. Puis vérifiez vos souvenirs.",
          "Quand vous parlez, ouvrez et fermez sur votre <b>point clé</b>. Il restera."
        ],
        say: [
          "Vous écoutez un exposé en dix points. Impossible de tout retenir.",
          "Alors la mémoire garde quelques éléments clés : le début, la fin, le meilleur passage. Compact, et rapide à utiliser.",
          "L’effet de position sérielle : le premier et le dernier point restent. Le milieu s’efface.",
          "Nivellement et accentuation : en le racontant, vous gommez le flou et accentuez le meilleur.",
          "L’effet de désinformation : plus tard, quelqu’un dit, super, le passage sur les prix ! Il n’y en avait pas.",
          "Pourtant, il se glisse dans votre mémoire, et paraît vite tout aussi réel.",
          "La solution : prenez des notes, milieu compris. Puis vérifiez vos souvenirs.",
          "Et quand vous parlez, ouvrez et fermez sur votre point clé. Il restera.",
          "L’essentiel. La mémoire garde le début, la fin et le meilleur passage, alors notez aussi le milieu."
        ]
      },
      de: {
        name: "Das Wesentliche", shareTitle: "Warum wir uns Anfang, Ende und das Beste merken, in 30 Sekunden",
        ecline: "Das Gedächtnis behält den Anfang, das Ende und das Beste, also schreib auch die Mitte auf.",
        week: "eine Woche später", kl: ["Anfang", "das Beste", "Ende"], ylab: "erinnert",
        chip: ["Serieller Positionseffekt", "Nivellieren und Zuspitzen", "Fehlinformations-Effekt"],
        lvl: "nivelliert", shl: "zugespitzt", notes: "deine Notizen", rej: "nicht in deinen Notizen", kp: "Kernpunkt",
        caps: [
          "Du hörst einen Vortrag mit <b>zehn Punkten</b>. Du kannst nicht alle behalten.",
          "Also behält das Gedächtnis ein paar <b>Kernelemente</b>. Kompakt und schnell abrufbar.",
          "Der <b>erste</b> und der <b>letzte</b> Punkt bleiben. Die <b>Mitte</b> verblasst.",
          "Beim Weitererzählen <b>fällt</b> das Blasse weg, und das Beste wird <b>zugespitzt</b>.",
          "Später sagt jemand: „Toll, der Teil über die Preise!“ Den <b>gab es nicht</b>.",
          "Trotzdem rutscht er in deine Erinnerung und wirkt bald <b>genauso echt</b>.",
          "<b>Die Lösung:</b> Mach Notizen, <b>die Mitte inklusive</b>. Dann prüf, woran du dich erinnerst.",
          "Wenn du sprichst, fang mit deinem <b>Kernpunkt</b> an und hör damit auf. Er bleibt hängen."
        ],
        say: [
          "Du hörst einen Vortrag mit zehn Punkten. Du kannst nicht alle behalten.",
          "Also behält das Gedächtnis ein paar Kernelemente: den Anfang, das Ende, das Beste. Kompakt und schnell abrufbar.",
          "Der serielle Positionseffekt: Der erste und der letzte Punkt bleiben. Die Mitte verblasst.",
          "Nivellieren und Zuspitzen: Beim Weitererzählen fällt das Blasse weg, und das Beste wird zugespitzt.",
          "Der Fehlinformations-Effekt: Später sagt jemand, toll, der Teil über die Preise! Den gab es nicht.",
          "Trotzdem rutscht er in deine Erinnerung, und bald wirkt er genauso echt.",
          "Die Lösung: Mach Notizen, die Mitte inklusive. Dann prüf, woran du dich erinnerst.",
          "Und wenn du sprichst, fang mit deinem Kernpunkt an und hör damit auf. Er bleibt hängen.",
          "Das Wesentliche. Das Gedächtnis behält den Anfang, das Ende und das Beste, also schreib auch die Mitte auf."
        ]
      },
      it: {
        name: "L’essenziale", shareTitle: "Perché ricordiamo l’inizio, la fine e il pezzo migliore, in 30 secondi",
        ecline: "La memoria tiene l’inizio, la fine e il pezzo migliore, quindi annota anche la parte centrale.",
        week: "una settimana dopo", kl: ["inizio", "il meglio", "fine"], ylab: "ricordato",
        chip: ["Effetto posizione seriale", "Livellamento e accentuazione", "Effetto disinformazione"],
        lvl: "livellato", shl: "accentuato", notes: "i tuoi appunti", rej: "non è nei tuoi appunti", kp: "punto chiave",
        caps: [
          "Ascolti una presentazione con <b>dieci punti</b>. Non riesci a tenerli tutti.",
          "Così la memoria tiene pochi <b>elementi chiave</b>. Compatti, e rapidi da usare.",
          "Il <b>primo</b> e l’<b>ultimo</b> punto restano. La <b>parte centrale</b> svanisce.",
          "Quando lo racconti, <b>togli</b> le parti sbiadite e <b>accentui</b> la migliore.",
          "Poi qualcuno dice: «Bellissima la parte sui prezzi!» <b>Non c’era</b>.",
          "Eppure si infila nel tuo ricordo e presto sembra <b>altrettanto vera</b>.",
          "<b>La soluzione:</b> prendi appunti, <b>parte centrale compresa</b>. Poi verifica ciò che ricordi.",
          "Quando parli, apri e chiudi con il tuo <b>punto chiave</b>. Resterà."
        ],
        say: [
          "Ascolti una presentazione con dieci punti. Non riesci a tenerli tutti.",
          "Così la memoria tiene pochi elementi chiave: l’inizio, la fine, il pezzo migliore. Compatti, e rapidi da usare.",
          "L’effetto posizione seriale: il primo e l’ultimo punto restano. La parte centrale svanisce.",
          "Livellamento e accentuazione: quando lo racconti, togli le parti sbiadite e accentui la migliore.",
          "L’effetto disinformazione: poi qualcuno dice, bellissima la parte sui prezzi! Non c’era.",
          "Eppure si infila nel tuo ricordo, e presto sembra altrettanto vera.",
          "La soluzione: prendi appunti, parte centrale compresa. Poi verifica ciò che ricordi.",
          "E quando parli, apri e chiudi con il tuo punto chiave. Resterà.",
          "L’essenziale. La memoria tiene l’inizio, la fine e il pezzo migliore, quindi annota anche la parte centrale."
        ]
      }
    },
    svg(T) {
      const idx = [...Array(10).keys()];
      const rings = idx.concat(10).map(j => `<circle cx="${f1(40 + 32 * j)}" cy="138" r="3.4"/>`).join("");
      const chips = T.chip.map((t, i) => `<g class="kf-chip" data-k="ch${i}"><rect data-k="chr${i}" y="10" height="22" rx="11"/><text data-k="cht${i}" x="200" y="25.2">${t}</text></g>`).join("");
      return `<g transform="translate(0 ${DY})">
        <g class="kf-nb" data-k="nb"><rect class="pg" x="14" y="138" width="372" height="74" rx="6"/>${rings}
          <text class="kf-lab" x="200" y="229">${T.notes}</text></g>
        <g data-k="barsG">
          ${idx.map(i => `<rect class="kf-bar" data-k="b${i}" x="${RX(i) - BW / 2}" width="${BW}"/>`).join("")}
          ${[0, 9].map(i => `<rect class="kf-bar ok" data-k="bg${i}" x="${RX(i) - BW / 2}" width="${BW}"/>`).join("")}
          <path class="kf-curve" data-k="curve" pathLength="1" stroke-dasharray="1 1" d="${curve}"/>
        </g>
        <text class="kf-yl" data-k="yl" x="${RX(0) - TW / 2}" y="56">${T.ylab}</text>
        ${idx.map(i => `<rect class="kf-gh" data-k="g${i}" x="${RX(i) - TW / 2}" y="${RY - TH / 2}" width="${TW}" height="${TH}" rx="4"/>`).join("")}
        ${idx.map(i => `<text class="kf-num" data-k="n${i}" x="${RX(i)}" y="202">${i + 1}</text>`).join("")}
        <g data-k="kl">${[0, STAR, 9].map((i, j) => `<text class="kf-kl" x="${RX(i)}" y="218">${T.kl[j]}</text>`).join("")}</g>
        <g data-k="kp"><text class="kf-kp" x="${RX(0) - TW / 2}" y="218">${T.kp}</text>
          <text class="kf-kp" x="${RX(9) + TW / 2}" y="218" text-anchor="end">${T.kp}</text></g>
        <text class="kf-lab" data-k="lvl" x="200" y="206">${T.lvl}</text>
        <g data-k="sp">
          <path class="kf-fl" d="M178 108 V100 a22 17 0 0 1 44 0 V108"/><circle class="kf-fl" cx="200" cy="70" r="10"/>
          <path class="kf-wave" d="M216 64 q5 6 0 12 M222 59 q9 11 0 22"/>
          <path class="kf-ln" d="M213 99 L209 88"/><circle class="kf-fl" cx="208.4" cy="86" r="2.6"/>
          <path class="kf-fl" d="M176 105 L181 136 H219 L224 105 Z"/><path class="kf-fl" d="M166 98 H234 L231 105 H169 Z"/>
        </g>
        <g class="kf-cal" data-k="cal"><rect class="p" x="176" y="58" width="48" height="44" rx="6"/>
          <path class="kf-ln" d="M176 72 H224 M188 52 V62 M212 52 V62"/><text class="n" x="200" y="96">+7</text>
          <text class="kf-wk" x="200" y="123">${T.week}</text></g>
        <g data-k="bub"><path class="kf-bub" d="${BUB}"/>${person(48, 110)}</g>
        <g data-k="them"><path class="kf-bub" d="${TBUB}"/>${person(360, 110)}</g>
        ${idx.filter(i => i !== STAR).map(tile).join("")}${tile(STAR)}
        <g class="kf-fake" data-k="fk"><rect class="f" ${RECT}/><rect class="d" data-k="fkd" ${RECT}/><rect class="s" data-k="fks" ${RECT}/>
          <text y="5.5">€</text><rect class="bd" data-k="fkb" ${RECT}/><path class="x" data-k="fkx" d="M-11 -13 L11 13 M11 -13 L-11 13"/></g>
        <text class="kf-sh" data-k="shl" x="${B3[STAR]}" y="127">${T.shl}</text>
        <text class="kf-rj" data-k="rj" x="${REJ[0]}" y="124">${T.rej}</text></g>
        ${chips}`;
    },
    S0: { sp: 0, arr: 0, cal: 0, dim: 0, kl: 0, nums: 1, c0: 0, c1: 0, c2: 0, yl: 0, bars: 0, barsOp: 0, curve: 0,
      drop: 0, gs: 0, lvl: 0, up: 0, bub: 0, sharp: 0, shl: 0, them: 0, fake: 0, ins: 0, real: 0,
      nb: 0, rest: 0, back: 0, rej: 0, gone: 0, fin: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = f1(cl(v) * 100) / 100; };
      const at = (key, x, y, s = 1) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)})${s !== 1 ? ` scale(${Math.max(.001, s).toFixed(3)})` : ""}`);
      const len = (el, fb) => { try { return el.getComputedTextLength() || fb; } catch (e) { return fb; } };
      // the talk, then a week later
      op("sp", S.sp);
      op("cal", S.cal); k("cal").setAttribute("transform", `translate(0 ${f1(6 * (1 - cl(S.cal)))})`);
      // the ten points
      for (let i = 0; i < 10; i++) {
        const ta = cl((S.arr - i * .075) / .3), ea = out(ta), arrOp = cl(ta * 2.5);
        const dim = lerp(1, dimOp(SV[i]), S.dim), surv = SURV.includes(i);
        let x = RX(i), y = RY - 10 * (1 - ea), s = .7 + .3 * ea, o = arrOp * dim;
        if (surv) {
          const e1 = io(cl(S.up)), e2 = io(cl(S.ins)), e3 = io(cl(S.back));
          x = lerp(x, B3[i], e1); y = lerp(y, BY, e1);
          x = lerp(x, B4[i], e2);
          x = lerp(x, RX(i), e3); y = lerp(y, RY, e3);
          if (i === STAR) s *= 1 + .45 * S.sharp;
        } else {
          o *= 1 - cl(S.drop);
          y += 16 * cl(S.drop) * (1 - cl(S.rest));
          o = lerp(o, 1, cl(S.rest));
        }
        at("t" + i, x, y, s); op("t" + i, o);
        op("gd" + i, i === 0 || i === 9 ? S.fin : S.rest * (1 - S.fin) * (i === STAR ? 0 : 1));
        op("n" + i, arrOp * S.nums);
        // the empty slots left behind
        op("g" + i, S.gs * (surv ? cl(S.up * 2) * (1 - cl(S.back)) : cl(S.drop * 1.5) * (1 - cl(S.rest))));
        // how much of each point sticks
        const g = out(cl((S.bars - i * .06) / .46)), h = BH * SV[i] * g;
        for (const b of i === 0 || i === 9 ? ["b" + i, "bg" + i] : ["b" + i]) {
          k(b).setAttribute("y", f1(BB - h)); k(b).setAttribute("height", f1(Math.max(0, h)));
        }
        if (i === 0 || i === 9) {
          op("bg" + i, S.fin);
          op("ic" + i, 1 - S.fin); op("ky" + i, S.fin);
        }
      }
      op("qo", S.sharp);
      op("barsG", S.barsOp);
      k("curve").style.strokeDashoffset = f1((1 - cl(S.curve)) * 1000) / 1000;
      op("curve", S.curve > .001 ? 1 : 0);
      op("yl", S.yl); op("kl", S.kl); op("kp", S.fin);
      // retelling
      op("lvl", S.lvl); op("shl", S.shl);
      op("bub", S.bub); k("bub").setAttribute("transform", `translate(${f1(-6 * (1 - cl(S.bub)))} 0)`);
      op("them", S.them); k("them").setAttribute("transform", `translate(${f1(6 * (1 - cl(S.them)))} 0)`);
      // the point that was never made: offered, slipped in, then caught by the notes
      const e = io(cl(S.ins)), eb = io(cl(S.back));
      // over the top of the retold points, then down into the gap they open for it
      let fx = (1 - e) * (1 - e) * THEM[0] + 2 * e * (1 - e) * 190 + e * e * FB, fy = (1 - e) * (1 - e) * THEM[1] + e * e * BY;
      fx = lerp(fx, REJ[0], eb); fy = lerp(fy, REJ[1], eb);
      at("fk", fx, fy, lerp(.9, 1, e) * (.6 + .4 * S.fake));
      op("fk", cl(S.fake * 2) * (1 - S.gone));
      op("fkd", 1 - S.real); op("fks", S.real * (1 - S.rej)); op("fkb", S.rej); op("fkx", S.rej);
      op("rj", S.rej);
      // your notes
      op("nb", S.nb);
      // the three member names
      for (let i = 0; i < 3; i++) {
        const w = len(k("cht" + i), T_FALLBACK[i]) + 26, r = k("chr" + i);
        r.setAttribute("x", f1(200 - w / 2)); r.setAttribute("width", f1(w));
        op("ch" + i, S["c" + i]);
      }
    },
    beats: [
      { steps: [{ to: { sp: 1 }, ms: 500, sfx: "pluck" }, { wait: 200 }, { to: { arr: 1 }, ms: 1800, ease: "lin", sfx: "tick" }], hold: 2400 },
      { steps: [{ to: { sp: 0 }, ms: 400 }, { to: { cal: 1 }, ms: 450, ease: "out" }, { wait: 300 },
        { to: { dim: 1 }, ms: 1300, ease: "inOut", sfx: "whoosh" }, { to: { kl: 1 }, ms: 400 }], hold: 2800 },
      { steps: [{ to: { cal: 0 }, ms: 350 }, { to: { c0: 1, yl: 1, barsOp: 1 }, ms: 350 }, { to: { bars: 1 }, ms: 1300, ease: "lin", sfx: "tick" },
        { to: { curve: 1 }, ms: 700, ease: "inOut" }], hold: 2800 },
      { steps: [{ to: { c0: 0, barsOp: 0, yl: 0, kl: 0, nums: 0 }, ms: 400 }, { to: { c1: 1 }, ms: 300 },
        { to: { drop: 1, gs: 1 }, ms: 700 }, { to: { lvl: 1 }, ms: 300 }, { to: { up: 1 }, ms: 800, ease: "lin" }, { to: { bub: 1 }, ms: 350 },
        { to: { sharp: 1, shl: 1 }, ms: 600, ease: "out", sfx: "spring" }], hold: 2800 },
      { steps: [{ to: { c1: 0, lvl: 0, shl: 0, gs: .5 }, ms: 400 }, { to: { c2: 1 }, ms: 300 }, { to: { them: 1 }, ms: 500 },
        { to: { fake: 1 }, ms: 450, ease: "out", sfx: "pop" }], hold: 2800 },
      { steps: [{ to: { ins: 1 }, ms: 1100, ease: "lin", sfx: "whoosh" }, { to: { real: 1, them: 0 }, ms: 600 }], hold: 2800 },
      { steps: [{ to: { c2: 0, bub: 0, sharp: 0 }, ms: 450 }, { to: { nb: 1 }, ms: 500, sfx: "scribble" }, { to: { rest: 1, nums: 1 }, ms: 700 },
        { to: { back: 1 }, ms: 900, ease: "lin" }, { to: { rej: 1 }, ms: 400 }], hold: 3000 },
      { steps: [{ to: { nb: 0, rej: 0, gone: 1 }, ms: 450 }, { to: { bars: 0, curve: 0 } }, { to: { fin: 1 }, ms: 500 },
        { to: { barsOp: 1, yl: 1 }, ms: 200 }, { to: { bars: 1 }, ms: 1100, ease: "lin" }, { to: { curve: 1 }, ms: 600, ease: "inOut", sfx: "chime" }], hold: 4200 }
    ]
  };
})();
