/* Family: projecting ourselves. A timeline with three of you: then, now and later. Today's you
   looks through a tinted lens, and both sides take on today's colour. Three members of the family:
   projection bias (shopping hungry for a future you who won't be), impact bias (a setback you expect
   to hurt for months), rosy retrospection (a rainy trip remembered as sunny). The fix: lower the lens,
   write down what you expect and check it, and plan for a future you who is a bit different.
   Scene for anim.js. */
(function () {
  const KEY = "family-project", P = `.bp[data-scene="${KEY}"]`;
  const FB = 186, TLY = FB + 4;                        // where the figures stand, and the timeline under them
  const PX = 72, NX = 200, FX = 328;                   // then, now, later
  const ST = 2.3, SS = 1.9;                           // bust scale: today, the other two
  const HT = FB - 25 * ST, HS = FB - 25 * SS;          // head centres
  const LX = NX + 3, LY = HT - 1, LR = 19;             // the lens, held in front of today's face
  const HX = NX + 26, HY = HT + 33;                    // the hand at the end of its handle (the lens pivots here)
  const TGT = FB - 92, TGS = FB - 76;                  // tag rows: over today, over then and later
  const LBY = TLY + 18, PY = LBY + 16, PH = 18;        // time labels, bias-name pill
  const BAG = 264, BT = FB - 30, IS = 1.35;            // shopping bag: centre just before "later", top; grocery scale
  const PILE = [[247, -5], [264, -6], [281, -5], [255.5, -20], [272.5, -20], [264, -34]].map(([x, dy]) => [x, BT + dy]);
  const WASTE = [3, 4, 5];
  const BE = 384, BR = NX + 58;                        // gloom: expected end, real end
  const CX0 = 20, CY0 = FB - 158, CW = 104, CH = 54;         // the holiday card over "then"
  const NTX = 146, NTY = FB - 160, NTW = 108, NTH = 60;      // the note (the fix)
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const f2 = n => +n.toFixed(2);

  // head and shoulders, head centre (x, y), scale s; bottom edge at y + 25s
  const bust = (x, y, s) => {
    const p = (dx, dy) => `${f1(x + dx * s)} ${f1(y + dy * s)}`;
    return `<path d="M${p(-13, 25)} L${p(-13, 21)} C${p(-13, 14)} ${p(-7, 10.5)} ${p(0, 10.5)} C${p(7, 10.5)} ${p(13, 14)} ${p(13, 21)} L${p(13, 25)}"/>` +
      `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(6.5 * s)}"/>`;
  };
  const eyes = (x, y, s) => `<circle class="e" cx="${f1(x - 2.4 * s)}" cy="${f1(y - .5 * s)}" r="${f1(1.05 * s)}"/>` +
    `<circle class="e" cx="${f1(x + 2.4 * s)}" cy="${f1(y - .5 * s)}" r="${f1(1.05 * s)}"/>`;
  // m = 1 smile, 0 flat, -1 frown
  const mouth = (x, y, s, m) => { const e = y + (3 - .6 * m) * s, c = y + (3 + 2 * m) * s;
    return `M${f1(x - 2.6 * s)} ${f1(e)} Q${f1(x)} ${f1(c)} ${f1(x + 2.6 * s)} ${f1(e)}`; };
  const person = (cls, key, x, y, s) => `<g class="fp-fig ${cls}" data-k="${key}">${bust(x, y, s)}${eyes(x, y, s)}<path class="mo" data-k="${key}m"/></g>`;
  // a rounded tag centred on (0, 0)
  const tag = (cls, key, t, w) => `<g class="fp-tag ${cls}" data-k="${key}"><rect x="${-w / 2}" y="-9" width="${w}" height="18" rx="9"/><text y="3.8">${t}</text></g>`;
  const tw = t => Math.max(34, Math.round(t.length * 6.2 + 20));
  // a pill with a notch pointing up at nx
  const pill = (x0, y0, w, h, nx) => { const r = h / 2;
    return `M${x0 + r} ${y0} H${nx - 5} L${nx} ${y0 - 6} L${nx + 5} ${y0} H${x0 + w - r} Q${x0 + w} ${y0} ${x0 + w} ${y0 + r} Q${x0 + w} ${y0 + h} ${x0 + w - r} ${y0 + h}` +
      ` H${x0 + r} Q${x0} ${y0 + h} ${x0} ${y0 + r} Q${x0} ${y0} ${x0 + r} ${y0} Z`; };
  // rounded box with a tail pointing down at (tx, y0 + h + th)
  const callout = (x0, y0, w, h, r, tx, th) => `M${x0 + r} ${y0} H${x0 + w - r} Q${x0 + w} ${y0} ${x0 + w} ${y0 + r} V${y0 + h - r} Q${x0 + w} ${y0 + h} ${x0 + w - r} ${y0 + h}` +
    ` H${tx + 5} L${tx} ${y0 + h + th} L${tx - 5} ${y0 + h} H${x0 + r} Q${x0} ${y0 + h} ${x0} ${y0 + h - r} V${y0 + r} Q${x0} ${y0} ${x0 + r} ${y0} Z`;
  // groceries, centred on (0, 0), about 13 px
  const FOOD = [
    `<path d="M0 -3 C-3 -5.8 -7 -3.6 -6.4 .8 C-5.8 5 -2.6 6.4 0 5.2 C2.6 6.4 5.8 5 6.4 .8 C7 -3.6 3 -5.8 0 -3 Z"/><path class="n" d="M0 -3 Q.4 -6 2.4 -7.6"/>`,
    `<g transform="rotate(-28)"><rect x="-9.5" y="-3.6" width="19" height="7.2" rx="3.6"/><path class="n" d="M-4.5 -2 l-1.4 4 M0 -2 l-1.4 4 M4.5 -2 l-1.4 4"/></g>`,
    `<path d="M-7 5 H7 V-1.5 L-7 -5 Z"/><circle class="n" cx="-2" cy="1.5" r="1.3"/><circle class="n" cx="3" cy="-.2" r="1"/>`,
    `<path d="M-3.4 6.5 V-.8 L-1.8 -3.4 V-6.5 H1.8 V-3.4 L3.4 -.8 V6.5 Z"/><path class="n" d="M-3.4 1.2 H3.4"/>`,
    `<circle r="5.6"/><circle class="n" r="1.8"/>`,
    `<rect x="-7" y="-4.5" width="14" height="9" rx="1.5"/><path class="n" d="M-2.3 -4.5 V4.5 M2.3 -4.5 V4.5 M-7 0 H7"/>`
  ];
  const BAGP = `M${BAG - 23} ${BT} H${BAG + 23} L${BAG + 20} ${FB} H${BAG - 20} Z`;
  const bagSvg = (cls, key, inner = "") => `<g class="fp-bag ${cls}" data-k="${key}"><path d="M${BAG - 9} ${BT} V${BT - 6} Q${BAG} ${BT - 15} ${BAG + 9} ${BT - 6} V${BT}"/><path class="b" d="${BAGP}"/>${inner}</g>`;
  const tick = (x, y, s = 1) => `M${f1(x - 4 * s)} ${f1(y)} L${f1(x - 1.2 * s)} ${f1(y + 2.8 * s)} L${f1(x + 4.2 * s)} ${f1(y - 3.2 * s)}`;

  window.BiasAnim.SCENES[KEY] = {
    q: "nem", viewBox: "0 0 400 272",
    css: `
      ${P} .fp-tl{stroke:var(--rule);stroke-width:2;stroke-linecap:round;fill:none}
      ${P} .fp-tlab{font:500 10px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .fp-tlab.n{fill:var(--ink)}
      ${P} .fp-fig path,${P} .fp-fig circle{fill:var(--surface);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fp-fig .mo{fill:none;stroke-width:1.8}
      ${P} .fp-fig.i path,${P} .fp-fig.i circle{stroke:var(--ink)} ${P} .fp-fig.i .e{fill:var(--ink)}
      ${P} .fp-fig.d path,${P} .fp-fig.d circle{stroke:var(--muted);stroke-dasharray:3 3.4;stroke-width:1.8} ${P} .fp-fig.d .e{fill:var(--muted)}
      ${P} .fp-fig.d .mo{stroke-dasharray:none}
      ${P} .fp-fig.q path,${P} .fp-fig.q circle{stroke:var(--q)} ${P} .fp-fig.q .e{fill:var(--q)}
      ${P} .fp-fig.g path,${P} .fp-fig.g circle{stroke:var(--good)} ${P} .fp-fig.g .e{fill:var(--good)}
      ${P} .fp-fig circle.e{stroke:none}
      ${P} .fp-lens .ring{fill:var(--q);fill-opacity:.22;stroke:var(--q);stroke-width:2.6}
      ${P} .fp-lens .hd{fill:none;stroke:var(--q);stroke-width:3.4;stroke-linecap:round}
      ${P} .fp-lens .gl{fill:none;stroke:var(--surface);stroke-width:1.6;stroke-linecap:round;opacity:.8}
      ${P} .fp-beam{fill:var(--q);fill-opacity:.1}
      ${P} .fp-beam-e{fill:none;stroke:var(--q);stroke-width:1.4;stroke-dasharray:2 4;stroke-linecap:round}
      ${P} .fp-tag rect{fill:var(--surface);stroke-width:1.6}
      ${P} .fp-tag text{font:600 10.5px var(--display);text-anchor:middle}
      ${P} .fp-tag.q rect{stroke:var(--q)} ${P} .fp-tag.q text{fill:var(--q)}
      ${P} .fp-tag.qd rect{stroke:var(--q);stroke-dasharray:3.5 2.5} ${P} .fp-tag.qd text{fill:var(--q)}
      ${P} .fp-tag.i rect{stroke:var(--ink)} ${P} .fp-tag.i text{fill:var(--ink)}
      ${P} .fp-tag.b rect{stroke:var(--bad)} ${P} .fp-tag.b text{fill:var(--bad)}
      ${P} .fp-tag.m rect{stroke:var(--muted);stroke-dasharray:3 3} ${P} .fp-tag.m text{fill:var(--muted);font-size:12px}
      ${P} .fp-it path,${P} .fp-it rect,${P} .fp-it circle{fill:var(--surface);stroke:var(--ink);stroke-width:1.5;stroke-linejoin:round;stroke-linecap:round}
      ${P} .fp-it .n{fill:none}
      ${P} .fp-it.b path,${P} .fp-it.b rect,${P} .fp-it.b circle{stroke:var(--bad)}
      ${P} .fp-it.g path,${P} .fp-it.g rect,${P} .fp-it.g circle{stroke:var(--good)}
      ${P} .fp-bag path{fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round}
      ${P} .fp-bag .b{fill:var(--surface)}
      ${P} .fp-bag.g path{stroke:var(--good)}
      ${P} .fp-note-t{font:600 10px var(--mono);fill:var(--bad);text-anchor:middle}
      ${P} .fp-bar-e{fill:var(--q);fill-opacity:.12;stroke:var(--q);stroke-width:1.6;stroke-dasharray:4 3}
      ${P} .fp-bar-r{fill:var(--bad);fill-opacity:.55}
      ${P} .fp-blab{font:600 10px var(--mono)}
      ${P} .fp-blab.q{fill:var(--q);text-anchor:end}
      ${P} .fp-blab.b{fill:var(--bad);text-anchor:middle}
      ${P} .fp-card .pa{fill:var(--surface);stroke:var(--ink);stroke-width:1.6}
      ${P} .fp-card .tint{fill:var(--q);fill-opacity:.14}
      ${P} .fp-card .sea{fill:none;stroke:var(--muted);stroke-width:1.6;stroke-linecap:round}
      ${P} .fp-card .cloud{fill:var(--surface);stroke:var(--ink);stroke-width:1.6;stroke-linejoin:round}
      ${P} .fp-card .rain{stroke:var(--muted);stroke-width:1.6;stroke-linecap:round}
      ${P} .fp-card .umb path{fill:none;stroke:var(--ink);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fp-card .umb .cv{fill:var(--surface)}
      ${P} .fp-card .sun circle{fill:none;stroke:var(--q);stroke-width:2}
      ${P} .fp-card .sun path{stroke:var(--q);stroke-width:1.8;stroke-linecap:round}
      ${P} .fp-dd circle{fill:var(--surface);stroke:var(--ink);stroke-width:1.4}
      ${P} .fp-clab{font:500 9.5px var(--mono);text-anchor:middle}
      ${P} .fp-clab.i{fill:var(--muted)} ${P} .fp-clab.q{fill:var(--q)}
      ${P} .fp-lab path{fill:var(--surface);stroke:var(--q);stroke-width:1.6;stroke-linejoin:round}
      ${P} .fp-lab text{font:500 10px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .fp-note .pa{fill:var(--surface);stroke:var(--ink);stroke-width:1.6}
      ${P} .fp-note .tape{fill:var(--q);fill-opacity:.35}
      ${P} .fp-note text{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .fp-note .ln{fill:none;stroke:var(--ink);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fp-ok{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fp-say path{fill:var(--surface);stroke:var(--good);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fp-say text{font:600 11px var(--display);fill:var(--good);text-anchor:middle}
    `,
    text: {
      hu: {
        name: "Önmagunk vetítése", shareTitle: "Miért ítéljük meg a múltat és a jövőt a mai érzéseink alapján, 30 másodpercben",
        ecline: "A múltbeli és a jövőbeli éned nem a mai éned másolata, ezért nézd meg a feljegyzéseket, és úgy tervezz.",
        times: ["akkor", "most", "később"], hungry: "éhes", full: "tele", setback: "visszaesés", wasted: "kidobva",
        months: "hónapig", weeks: "hétig", felt: "milyen volt", recall: "hogyan emlékszel rá",
        labs: ["Vetítési torzítás", "Hatástorzítás", "Rózsaszín visszatekintés"], note: ["vártam", "történt"], thanks: "köszönöm!",
        caps: [
          "Nehéz elképzelni a múltbeli vagy a jövőbeli éned. Az agyad a <b>mától</b> indul.",
          "Mindkettőt a <b>mai lencséjén</b> keresztül látja. Általában ez elég közel van.",
          "Éhesen vásárolsz, és az éhes jövőbeli éned számára vásárolsz.",
          "Később tele vagy, és a <b>felét</b> kidobod.",
          "Azt várod, hogy egy visszaesés <b>hónapokig</b> fáj majd. <b>Hetek</b> alatt elhalványul.",
          "Visszatekintve a tavalyi nyaralás <b>jobbnak</b> tűnik, mint amilyen volt.",
          "<b>A megoldás:</b> írd le, mire számítasz, aztán <b>nézd meg</b>, mi történt.",
          "Úgy tervezz a jövőbeli éneddel, mint <b>egy kicsit másik emberrel</b>. Majd hálás lesz."
        ],
        say: [
          "A múltbeli vagy a jövőbeli éned elképzelése nehéz. Ezért az agyad a mától indul.",
          "Mindkettőt a mai lencséjén keresztül látja, és feltételezi, hogy a dolgok nagyjából maradnak úgy, ahogy most vannak. Általában ez elég közel van.",
          "Vetítési torzítás. Éhesen vásárolsz, és az éhes jövőbeli éned számára vásárolsz.",
          "Később tele vagy, és a felét kidobod.",
          "Hatástorzítás. Azt várod, hogy egy visszaesés hónapokig fáj majd. Hetek alatt elhalványul.",
          "Rózsaszín visszatekintés. Visszatekintve a tavalyi nyaralás jobbnak tűnik, mint akkor érződött.",
          "A megoldás: írd le, mire számítasz, aztán nézd meg, mi történt valójában.",
          "Úgy tervezz a jövőbeli éneddel, mint egy kicsit másik emberrel. Majd hálás lesz.",
          "Önmagunk vetítése. A múltbeli és a jövőbeli éned nem a mai éned másolata, ezért nézd meg a feljegyzéseket, és úgy tervezz."
        ]
      },
      en: {
        name: "Projecting ourselves", shareTitle: "Why we judge past and future by how we feel today, in 30 seconds",
        ecline: "Past and future you aren't copies of today's you, so check the record and plan for them.",
        times: ["then", "now", "later"], hungry: "hungry", full: "full", setback: "setback", wasted: "wasted",
        months: "months", weeks: "weeks", felt: "how it felt", recall: "how you recall it",
        labs: ["Projection bias", "Impact bias", "Rosy retrospection"], note: ["expected", "happened"], thanks: "thanks!",
        caps: [
          "Picturing past or future you is hard. Your brain starts from <b>today</b>.",
          "It sees both through <b>today's lens</b>. Usually, that's close enough.",
          "Shop <b>hungry</b>, and you buy for a hungry future you.",
          "Later you're full, and <b>half of it</b> goes to waste.",
          "You expect a setback to hurt for <b>months</b>. It fades in <b>weeks</b>.",
          "Looking back, last summer's trip seems <b>better</b> than it felt.",
          "<b>The fix:</b> write down what you expect, then <b>check</b> what happened.",
          "Plan for future you as <b>someone a bit different</b>. They'll thank you."
        ],
        say: [
          "Picturing yourself in the past or the future is hard. So your brain starts from today.",
          "It sees both through today's lens, and assumes things will stay roughly as they are now. Usually, that's close enough.",
          "Projection bias. Shop hungry, and you buy for a hungry future you.",
          "Later you're full, and half of it goes to waste.",
          "Impact bias. You expect a setback to hurt for months. It fades in weeks.",
          "Rosy retrospection. Looking back, last summer's trip seems better than it felt at the time.",
          "The fix: write down what you expect, then check what really happened.",
          "Plan for future you as someone a bit different. They'll thank you.",
          "Projecting ourselves. Past and future you aren't copies of today's you, so check the record and plan for them."
        ]
      },
      el: {
        name: "Κρίνουμε με το σήμερα", shareTitle: "Γιατί κρίνουμε το χθες και το αύριο με βάση το πώς νιώθουμε σήμερα, σε 30 δευτερόλεπτα",
        ecline: "Ο χθεσινός κι ο αυριανός εαυτός σου δεν είναι αντίγραφα του σημερινού, οπότε κοίτα τι έγινε στ’\u00a0αλήθεια και σχεδίαζε γι’\u00a0αυτούς.",
        times: ["τότε", "τώρα", "αργότερα"], hungry: "πεινάς", full: "δεν πεινάς", setback: "αναποδιά", wasted: "στον κάδο",
        months: "μήνες", weeks: "εβδομάδες", felt: "πώς τις έζησες", recall: "πώς τις θυμάσαι",
        labs: ["Μεροληψία προβολής", "Μεροληψία αντίκτυπου", "Ρόδινη αναδρομή"], note: ["περίμενα", "έγινε"], thanks: "ευχαριστώ!",
        caps: [
          "Δύσκολα φαντάζεσαι πώς ήσουν ή πώς θα\u00a0είσαι. Το μυαλό σου ξεκινά από το <b>σήμερα</b>.",
          "Τα βλέπει και τα δύο μέσα από τον <b>φακό του σήμερα</b>. Συνήθως, αυτό αρκεί.",
          "Ψωνίζεις ενώ <b>πεινάς</b>, κι αγοράζεις λες και θα πεινάς το ίδιο και μετά.",
          "Αργότερα όμως δεν πεινάς, και <b>τα μισά</b> πάνε στα σκουπίδια.",
          "Μια αναποδιά νομίζεις ότι θα σε πονάει <b>μήνες</b>. Περνάει σε <b>εβδομάδες</b>.",
          "Στη μνήμη σου, οι περσινές διακοπές μοιάζουν <b>καλύτερες</b> απ’\u00a0ό,τι τις έζησες.",
          "<b>Η λύση:</b> γράψε τι περιμένεις και μετά <b>σύγκρινέ το</b> με ό,τι έγινε.",
          "Σχεδίαζε για έναν αυριανό εαυτό <b>λίγο διαφορετικό</b> από σένα. Θα σε ευχαριστήσει."
        ],
        say: [
          "Δύσκολα φαντάζεσαι πώς ήσουν ή πώς θα είσαι. Γι’ αυτό το μυαλό σου ξεκινά από το σήμερα.",
          "Τα βλέπει και τα δύο μέσα από τον φακό του σήμερα, και υποθέτει ότι τα πράγματα θα μείνουν πάνω κάτω όπως είναι. Συνήθως, αυτό αρκεί.",
          "Μεροληψία προβολής. Ψωνίζεις ενώ πεινάς, κι αγοράζεις λες και θα πεινάς το ίδιο και μετά.",
          "Αργότερα όμως δεν πεινάς, και τα μισά πάνε στα σκουπίδια.",
          "Μεροληψία αντίκτυπου. Μια αναποδιά νομίζεις ότι θα σε πονάει μήνες. Περνάει σε εβδομάδες.",
          "Ρόδινη αναδρομή. Στη μνήμη σου, οι περσινές διακοπές μοιάζουν καλύτερες απ’ ό,τι τις έζησες τότε.",
          "Η λύση: γράψε τι περιμένεις και μετά σύγκρινέ το με ό,τι έγινε στ’ αλήθεια.",
          "Σχεδίαζε για έναν αυριανό εαυτό λίγο διαφορετικό από σένα. Θα σε ευχαριστήσει.",
          "Κρίνουμε με το σήμερα. Ο χθεσινός κι ο αυριανός εαυτός σου δεν είναι αντίγραφα του σημερινού, οπότε κοίτα τι έγινε στ’ αλήθεια και σχεδίαζε γι’ αυτούς."
        ]
      },
      es: {
        name: "Proyectarnos", shareTitle: "Por qué juzgamos el pasado y el futuro según cómo nos sentimos hoy, en 30 segundos",
        ecline: "Tu yo pasado y tu yo futuro no son copias del de hoy, así que revisa lo que pasó y planifica pensando en ellos.",
        times: ["antes", "ahora", "después"], hungry: "con hambre", full: "sin hambre", setback: "revés", wasted: "a la basura",
        months: "meses", weeks: "semanas", felt: "cómo lo viviste", recall: "cómo lo recuerdas",
        labs: ["Sesgo de proyección", "Sesgo de impacto", "Retrospección rosada"], note: ["esperaba", "pasó"], thanks: "¡gracias!",
        caps: [
          "Imaginarte en el pasado o el futuro cuesta. Tu cerebro parte de <b>hoy</b>.",
          "Ve ambos con <b>la lente de hoy</b>. Normalmente, se acerca bastante.",
          "Si compras <b>con hambre</b>, compras para un yo futuro hambriento.",
          "Luego ya no tienes hambre, y <b>la mitad</b> acaba en la basura.",
          "Crees que un revés dolerá durante <b>meses</b>. Se pasa en <b>semanas</b>.",
          "Al recordarlo, el viaje del verano pasado parece <b>mejor</b> de lo que lo viviste.",
          "<b>La solución:</b> anota lo que esperas y luego <b>comprueba</b> qué pasó.",
          "Planifica para tu yo futuro como <b>alguien algo distinto</b>. Te lo agradecerá."
        ],
        say: [
          "Imaginarte en el pasado o en el futuro cuesta. Así que tu cerebro parte de hoy.",
          "Ve ambos con la lente de hoy, y da por hecho que las cosas seguirán más o menos como ahora. Normalmente, se acerca bastante.",
          "Sesgo de proyección. Si compras con hambre, compras para un yo futuro hambriento.",
          "Luego ya no tienes hambre, y la mitad acaba en la basura.",
          "Sesgo de impacto. Crees que un revés dolerá durante meses. Se pasa en semanas.",
          "Retrospección rosada. Al recordarlo, el viaje del verano pasado parece mejor de lo que lo viviste en su momento.",
          "La solución: anota lo que esperas, y luego comprueba qué pasó de verdad.",
          "Planifica para tu yo futuro como alguien algo distinto. Te lo agradecerá.",
          "Proyectarnos. Tu yo pasado y tu yo futuro no son copias del de hoy, así que revisa lo que pasó y planifica pensando en ellos."
        ]
      },
      fr: {
        name: "Se projeter", shareTitle: "Pourquoi on juge passé et avenir selon notre humeur du jour, en 30 secondes",
        ecline: "Le vous d’hier et celui de demain ne sont pas des copies du vous d’aujourd’hui, alors vérifiez les faits et prévoyez pour eux.",
        times: ["passé", "présent", "futur"], hungry: "affamé", full: "rassasié", setback: "revers", wasted: "gaspillé",
        months: "mois", weeks: "semaines", felt: "sur le moment", recall: "en souvenir",
        labs: ["Biais de projection", "Biais d’impact", "Rétrospection rose"], note: ["prévu", "arrivé"], thanks: "merci !",
        caps: [
          "Vous imaginer dans le passé ou l’avenir est difficile. Votre cerveau part d’<b>aujourd’hui</b>.",
          "Il voit les deux à travers <b>le filtre d’aujourd’hui</b>. En général, c’est assez juste.",
          "Faites les courses <b>le ventre vide</b>, et vous achetez pour un futur vous affamé.",
          "Plus tard, vous n’avez plus faim, et <b>la moitié</b> finit à la poubelle.",
          "Vous pensez qu’un revers fera mal des <b>mois</b>. Ça passe en quelques <b>semaines</b>.",
          "Avec le recul, le voyage de l’été dernier semble <b>meilleur</b> qu’il ne l’était.",
          "<b>La solution :</b> notez ce que vous prévoyez, puis <b>vérifiez</b> ce qui s’est passé.",
          "Préparez votre futur vous comme <b>quelqu’un d’un peu différent</b>. Il vous remerciera."
        ],
        say: [
          "Vous imaginer dans le passé ou dans l’avenir est difficile. Alors votre cerveau part d’aujourd’hui.",
          "Il voit les deux à travers le filtre d’aujourd’hui, et suppose que les choses resteront à peu près comme maintenant. En général, c’est assez juste.",
          "Le biais de projection. Faites les courses le ventre vide, et vous achetez pour un futur vous affamé.",
          "Plus tard, vous n’avez plus faim, et la moitié finit à la poubelle.",
          "Le biais d’impact. Vous pensez qu’un revers fera mal pendant des mois. Ça passe en quelques semaines.",
          "La rétrospection rose. Avec le recul, le voyage de l’été dernier semble meilleur qu’il ne l’était sur le moment.",
          "La solution : notez ce que vous prévoyez, puis vérifiez ce qui s’est vraiment passé.",
          "Préparez votre futur vous comme quelqu’un d’un peu différent. Il vous remerciera.",
          "Se projeter. Le vous d’hier et celui de demain ne sont pas des copies du vous d’aujourd’hui, alors vérifiez les faits et prévoyez pour eux."
        ]
      },
      de: {
        name: "Von sich ausgehen", shareTitle: "Warum wir Vergangenheit und Zukunft nach dem Gefühl von heute beurteilen, in 30 Sekunden",
        ecline: "Dein früheres und dein späteres Ich sind keine Kopien von heute, also prüf die Fakten und plane für sie.",
        times: ["damals", "jetzt", "später"], hungry: "hungrig", full: "satt", setback: "Rückschlag", wasted: "verschwendet",
        months: "Monate", weeks: "Wochen", felt: "wie es war", recall: "in der Erinnerung",
        labs: ["Projektionsfehler", "Gefühlsüberschätzung", "Rosarote Rückschau"], note: ["erwartet", "passiert"], thanks: "danke!",
        caps: [
          "Dich in Vergangenheit oder Zukunft vorzustellen ist schwer. Dein Gehirn geht von <b>heute</b> aus.",
          "Es sieht beides durch <b>die Brille von heute</b>. Meist passt das ungefähr.",
          "Gehst du <b>hungrig</b> einkaufen, kaufst du für ein hungriges späteres Ich.",
          "Später bist du satt, und <b>die Hälfte</b> landet im Müll.",
          "Du erwartest, dass ein Rückschlag <b>monatelang</b> wehtut. Nach <b>Wochen</b> ist es vorbei.",
          "Im Rückblick wirkt die Reise im letzten Sommer <b>schöner</b>, als sie sich anfühlte.",
          "<b>Die Lösung:</b> Schreib auf, was du erwartest, und <b>prüf</b> dann, was passiert ist.",
          "Plane für dein späteres Ich als <b>einen etwas anderen Menschen</b>. Es wird es dir danken."
        ],
        say: [
          "Dich in der Vergangenheit oder Zukunft vorzustellen ist schwer. Also geht dein Gehirn von heute aus.",
          "Es sieht beides durch die Brille von heute, und nimmt an, dass alles ungefähr so bleibt wie jetzt. Meist passt das ungefähr.",
          "Projektionsfehler. Gehst du hungrig einkaufen, kaufst du für ein hungriges späteres Ich.",
          "Später bist du satt, und die Hälfte landet im Müll.",
          "Gefühlsüberschätzung. Du erwartest, dass ein Rückschlag monatelang wehtut. Nach ein paar Wochen ist es vorbei.",
          "Rosarote Rückschau. Im Rückblick wirkt die Reise im letzten Sommer schöner, als sie sich damals anfühlte.",
          "Die Lösung: Schreib auf, was du erwartest, und prüf dann, was wirklich passiert ist.",
          "Plane für dein späteres Ich als einen etwas anderen Menschen. Es wird es dir danken.",
          "Von sich ausgehen. Dein früheres und dein späteres Ich sind keine Kopien von heute, also prüf die Fakten und plane für sie."
        ]
      },
      it: {
        name: "Proiettarsi", shareTitle: "Perché giudichiamo passato e futuro in base a come ci sentiamo oggi, in 30 secondi",
        ecline: "Il te del passato e quello del futuro non sono copie del te di oggi, quindi verifica i fatti e pianifica per loro.",
        times: ["prima", "ora", "dopo"], hungry: "con fame", full: "senza fame", setback: "brutto colpo", wasted: "sprecato",
        months: "mesi", weeks: "settimane", felt: "come l’hai vissuto", recall: "come lo ricordi",
        labs: ["Bias di proiezione", "Bias d’impatto", "Retrospettiva rosea"], note: ["previsto", "accaduto"], thanks: "grazie!",
        caps: [
          "Immaginarti nel passato o nel futuro è difficile. Il cervello parte da <b>oggi</b>.",
          "Vede entrambi con <b>la lente di oggi</b>. Di solito, ci va abbastanza vicino.",
          "Fai la spesa <b>con la fame</b>, e compri come se avessi fame anche dopo.",
          "Poi la fame passa, e <b>metà</b> finisce nella spazzatura.",
          "Pensi che un brutto colpo ti farà soffrire per <b>mesi</b>. Passa in poche <b>settimane</b>.",
          "Ripensandoci, il viaggio dell’estate scorsa sembra <b>migliore</b> di com’era.",
          "<b>La soluzione:</b> annota cosa ti aspetti, poi <b>verifica</b> com’è andata.",
          "Pianifica per il te futuro come per <b>qualcuno un po’ diverso</b>. Ti ringrazierà."
        ],
        say: [
          "Immaginarti nel passato o nel futuro è difficile. Così il cervello parte da oggi.",
          "Vede entrambi con la lente di oggi, e presume che le cose resteranno più o meno come ora. Di solito, ci va abbastanza vicino.",
          "Il bias di proiezione. Fai la spesa con la fame, e compri come se avessi fame anche dopo.",
          "Poi la fame passa, e metà finisce nella spazzatura.",
          "Il bias d’impatto. Pensi che un brutto colpo ti farà soffrire per mesi. Passa in poche settimane.",
          "La retrospettiva rosea. Ripensandoci, il viaggio dell’estate scorsa sembra migliore di com’era in quel momento.",
          "La soluzione: annota cosa ti aspetti, poi verifica com’è andata davvero.",
          "Pianifica per il te futuro come per qualcuno un po’ diverso. Ti ringrazierà.",
          "Proiettarsi. Il te del passato e quello del futuro non sono copie del te di oggi, quindi verifica i fatti e pianifica per loro."
        ]
      }
    },
    svg(T) {
      // then and later: imagined (dashed), seen through the lens (tinted), as they are (ink), better planned (good)
      const side = (key, x, layers) => layers.map(c => person(c, `${key}${c}`, x, HS, SS)).join("");
      // the bias names, each under its side
      const SX = [FX, FX, PX];
      const labs = T.labs.map((s, i) => {
        const w = s.length * 6 + 22, cx = Math.max(12 + w / 2, Math.min(388 - w / 2, SX[i]));
        return `<g class="fp-lab" data-k="lab${i}"><path d="${pill(f1(cx - w / 2), PY, w, PH, SX[i])}"/><text x="${f1(cx)}" y="${PY + 12.5}">${s}</text></g>`;
      }).join("");
      const items = PILE.map(([x, y], i) => `<g data-k="it${i}"><g class="fp-it" data-k="iti${i}">${FOOD[i]}</g>` +
        (WASTE.includes(i) ? `<g class="fp-it b" data-k="itb${i}">${FOOD[i]}</g>` : "") + `</g>`).join("");
      const beam = key => `<g data-k="${key}"><path class="fp-beam" data-k="${key}f"/><path class="fp-beam-e" data-k="${key}e"/></g>`;
      // the holiday card: sea, rain (as it was), sun (as remembered)
      const cx = CX0 + 42, SUNY = CY0 + 22;
      let rays = "";
      for (let a = 0; a < 8; a++) { const t = a * Math.PI / 4, c = Math.cos(t), s = Math.sin(t);
        rays += `M${f1(cx + 11 * c)} ${f1(SUNY + 11 * s)} L${f1(cx + 15 * c)} ${f1(SUNY + 15 * s)} `; }
      const card = `<g class="fp-card" data-k="card">
          <rect class="pa" x="${CX0}" y="${CY0}" width="${CW}" height="${CH}" rx="5"/>
          <rect class="tint" data-k="ctint" x="${CX0}" y="${CY0}" width="${CW}" height="${CH}" rx="5"/>
          <path class="sea" d="M${CX0 + 10} ${CY0 + CH - 9} q7 -4 14 0 t14 0 t14 0 t14 0 t14 0 t14 0"/>
          <g data-k="rain"><path class="cloud" d="M${cx - 14} ${CY0 + 27} a7 7 0 0 1 3 -13 a9 9 0 0 1 17 -2 a7 7 0 0 1 8 15 Z"/>
            <path class="rain" d="M${cx - 8} ${CY0 + 32} l-2 5 M${cx} ${CY0 + 32} l-2 5 M${cx + 8} ${CY0 + 32} l-2 5"/></g>
          <g class="umb"><path d="M${CX0 + CW - 24} ${CY0 + CH - 11} L${CX0 + CW - 20} ${CY0 + 24}"/><path class="cv" d="M${CX0 + CW - 33} ${CY0 + 26} Q${CX0 + CW - 21} ${CY0 + 10} ${CX0 + CW - 6} ${CY0 + 22} Z"/></g>
          <g class="sun" data-k="sun"><circle cx="${cx}" cy="${SUNY}" r="7"/><path d="${rays}"/></g></g>
        <g class="fp-dd" data-k="cdots"><circle cx="${PX - 2}" cy="${CY0 + CH + 9}" r="2.6"/><circle cx="${PX - 4}" cy="${CY0 + CH + 18}" r="1.8"/></g>
        <text class="fp-clab i" data-k="felt" x="${CX0 + CW / 2}" y="${CY0 - 7}">${T.felt}</text>
        <text class="fp-clab q" data-k="recall" x="${CX0 + CW / 2}" y="${CY0 - 7}">${T.recall}</text>`;
      const nx = NTX + 10;
      const note = `<g class="fp-note" data-k="note"><rect class="pa" x="${NTX}" y="${NTY}" width="${NTW}" height="${NTH}" rx="4"/>
          <rect class="tape" x="${NTX + NTW / 2 - 18}" y="${NTY - 5}" width="36" height="10" rx="2"/>
          <text x="${nx}" y="${NTY + 22}">${T.note[0]}</text><text x="${nx}" y="${NTY + 46}">${T.note[1]}</text>
          <path class="ln" data-k="nl0" d="M${nx} ${NTY + 29} q10 -3 20 0 t20 0 t20 0 t12 -1"/>
          <path class="ln" data-k="nl1" d="M${nx} ${NTY + 53} q10 -3 20 0 t20 0 t12 -1"/>
          <path class="fp-ok" data-k="nchk" d="${tick(NTX + NTW - 14, NTY + 50, 1.1)}"/></g>`;
      const bw = 34 + T.thanks.length * 6.2, sy = TGS - 12;
      return `
        ${beam("bl")}${beam("br")}
        <line class="fp-tl" data-k="tl" x1="16" y1="${TLY}" x2="16" y2="${TLY}"/>
        <path class="fp-tl" data-k="arr" d="M377 ${TLY - 5} L383 ${TLY} L377 ${TLY + 5}"/>
        <rect class="fp-bar-e" data-k="barE" y="${TLY - 4}" height="8" rx="4"/>
        <rect class="fp-bar-r" data-k="barR" y="${TLY - 4}" height="8" rx="4"/>
        <g data-k="lab"><text class="fp-tlab" x="${PX}" y="${LBY}">${T.times[0]}</text>
          <text class="fp-tlab n" x="${NX}" y="${LBY}">${T.times[1]}</text>
          <text class="fp-tlab" data-k="tl2" x="${FX}" y="${LBY}">${T.times[2]}</text></g>
        <text class="fp-blab q" data-k="mo" x="${BE + 2}" y="${LBY}">${T.months}</text>
        <text class="fp-blab b" data-k="wk" x="${BR}" y="${LBY}">${T.weeks}</text>
        <g data-k="past">${side("P", PX, ["d", "q", "i"])}</g>
        <g data-k="fut">${side("F", FX, ["d", "q", "i", "g"])}</g>
        <g data-k="you">${person("i", "T", NX, HT, ST)}</g>
        ${tag("m", "qP", "?", 34)}${tag("m", "qF", "?", 34)}
        ${bagSvg("", "bag")}${items}
        <text class="fp-note-t" data-k="wl" x="${BAG}" y="${LBY}">${T.wasted}</text>
        ${tag("q", "tH", T.hungry, tw(T.hungry))}${tag("b", "tS", T.setback, tw(T.setback))}
        ${tag("qd", "fH", T.hungry, tw(T.hungry))}${tag("i", "fF", T.full, tw(T.full))}
        <g class="fp-lens" data-k="lens"><path class="hd" d="M${f1(LX + LR * .7)} ${f1(LY + LR * .7)} L${HX} ${HY}"/>
          <circle class="ring" cx="${LX}" cy="${LY}" r="${LR}"/><path class="gl" d="M${LX - 9} ${LY - 3} A10 10 0 0 1 ${LX - 3} ${LY - 9}"/></g>
        ${card}
        ${note}
        ${bagSvg("g", "bag2", `<g class="fp-it g" transform="translate(${BAG - 7} ${BT - 6}) scale(${IS})">${FOOD[0]}</g><g class="fp-it g" transform="translate(${BAG + 8} ${BT - 7}) scale(${IS})">${FOOD[1]}</g>`)}
        <g class="fp-say" data-k="thanks"><path d="${callout(FX - bw / 2, sy - 11, bw, 22, 11, FX, 9)}"/><text x="${FX}" y="${sy + 4}">${T.thanks}</text></g>
        ${labs}`;
    },
    S0: { tl: 0, lab: 0, you: 0, ghost: 0, qm: 0, lens: 0, beam: 0, tint: 0, ink: 0, good: 0, mT: 0, mP: 0, mF: 0,
      tH: 0, tS: 0, lab0: 0, lab1: 0, lab2: 0, bag: 0, buy: 0, fcp: 0, flip: 0, waste: 0, wl: 0, pOut: 0,
      barE: 0, barR: 0, bOut: 0, pc: 0, rosy: 0, cOut: 0, low: 0, note: 0, nl: 0, nchk: 0, bag2: 0, thanks: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = f2(cl(v)); };
      const tr = (key, x, y, s = 1) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)})` + (s === 1 ? "" : ` scale(${f2(Math.max(.01, s))})`));
      // the timeline, drawn left to right
      k("tl").setAttribute("x2", f1(16 + (381 - 16) * cl(S.tl)));
      op("arr", (S.tl - .9) * 10); op("lab", S.lab);
      // today's you; then and later
      op("you", S.you);
      k("Tm").setAttribute("d", mouth(NX, HT, ST, S.mT));
      const lay = (key, x, m, o) => { Object.keys(o).forEach(c => { op(key + c, o[c]); k(key + c + "m").setAttribute("d", mouth(x, HS, SS, m)); }); };
      lay("P", PX, S.mP, { d: S.ghost * (1 - S.tint), q: S.tint * (1 - S.ink), i: S.ink });
      lay("F", FX, S.mF, { d: S.ghost * (1 - S.tint), q: S.tint * (1 - S.ink), i: S.ink * (1 - S.good), g: S.good });
      tr("qP", PX, TGS); tr("qF", FX, TGS);
      op("qP", S.qm); op("qF", S.qm);
      // the lens: raised in front of today's face, later lowered to the side
      const ls = .6 + .4 * Math.min(1.1, S.lens);
      k("lens").setAttribute("transform", `translate(0 ${f1(22 * S.low)}) rotate(${f1(35 * S.low)} ${HX} ${HY}) translate(${LX} ${LY}) scale(${f2(ls)}) translate(${-LX} ${-LY})`);
      op("lens", S.lens * 2 * (1 - S.low));
      // the beams: today's colour cast back to "then" and forward to "later"
      const beam = (key, ax, ex) => {
        const x = ax + (ex - ax) * cl(S.beam), y0 = LY - 10, y1 = LY + 10, t0 = y0 - 52 * cl(S.beam), t1 = TLY - 2 - (TLY - 2 - y1) * (1 - cl(S.beam));
        k(key + "f").setAttribute("d", `M${ax} ${y0} L${f1(x)} ${f1(t0)} L${f1(x)} ${f1(t1)} L${ax} ${y1} Z`);
        k(key + "e").setAttribute("d", `M${ax} ${y0} L${f1(x)} ${f1(t0)} M${ax} ${y1} L${f1(x)} ${f1(t1)}`);
        op(key, S.beam > .01 ? 1 : 0);
      };
      beam("bl", LX - LR + 2, 30); beam("br", LX + LR - 2, 372);
      // projection bias: shopping hungry, for a future you who won't be
      const tH = cl(S.tH);
      tr("tH", NX, TGT, .7 + .3 * tH); op("tH", tH * 1.5 * (1 - S.pOut));
      op("bag", S.bag * (1 - S.pOut));
      PILE.forEach(([x, y], i) => {
        const p = cl(S.buy - i), sx = NX + 10, sy = TGT - 4, e = p * p * (3 - 2 * p);
        const ix = sx + (x - sx) * e, iy = sy + (y - sy) * e - 40 * Math.sin(Math.PI * e);
        const w = WASTE.includes(i) ? cl(S.waste) : 0;
        tr("it" + i, ix, iy + 4 * w, (.5 + .5 * e) * IS);
        k("it" + i).style.opacity = f2((p > 0 ? cl(p * 4) : 0) * (1 - .35 * w) * (1 - S.pOut));
        if (WASTE.includes(i)) { op("itb" + i, w); op("iti" + i, 1 - w); }
      });
      op("wl", S.wl * (1 - S.pOut));
      // the copied "hungry" flies from today's tag to later's; then flips to how later really is
      const c = cl(S.fcp), ce = c * c * (3 - 2 * c);
      const fx = NX + (FX - NX) * ce, fy = TGT + (TGS - TGT) * ce - 34 * Math.sin(Math.PI * ce);
      const fl = cl(S.flip), sq = Math.abs(Math.cos(Math.PI * fl));
      k("fH").setAttribute("transform", `translate(${f1(fx)} ${f1(fy)}) scale(1 ${f2(fl < .5 ? Math.max(.01, sq) : .01)})`);
      k("fF").setAttribute("transform", `translate(${FX} ${TGS}) scale(1 ${f2(fl >= .5 ? Math.max(.01, sq) : .01)})`);
      op("fH", (c > 0 ? cl(c * 4) : 0) * (fl < .5 ? 1 : 0) * (1 - S.pOut));
      op("fF", (fl >= .5 ? 1 : 0) * (1 - S.pOut));
      // impact bias: a setback lands; the gloom you expect, and the gloom you get
      const ts = cl(S.tS);
      tr("tS", NX, TGT - 26 * (1 - S.tS)); op("tS", ts * 2 * (1 - S.bOut));
      const bar = (key, x1, v) => { const r = k(key), w = (x1 - NX) * cl(v);
        r.setAttribute("x", NX); r.setAttribute("width", f1(Math.max(0, w))); r.style.display = w > 1 ? "" : "none"; };
      bar("barE", BE, S.barE); bar("barR", BR, S.barR);
      op("barE", 1 - S.bOut); op("barR", 1 - S.bOut);
      op("mo", (S.barE - .8) * 5 * (1 - S.bOut)); op("tl2", 1 - cl((S.barE - .6) * 5) * (1 - S.bOut)); op("wk", (S.barR - .8) * 5 * (1 - S.bOut));
      // rosy retrospection: the trip as it felt, then as remembered
      const cd = cl(S.pc), r = cl(S.rosy);
      k("card").setAttribute("transform", `translate(0 ${f1(6 * (1 - cd))})`);
      op("card", cd * (1 - S.cOut)); op("cdots", cd * (1 - S.cOut));
      op("rain", 1 - r); op("sun", r); op("ctint", r);
      op("felt", cd * (1 - r) * (1 - S.cOut)); op("recall", r * (1 - S.cOut));
      // bias names
      [0, 1, 2].forEach(i => { const v = cl(S["lab" + i]); op("lab" + i, v); tr("lab" + i, 0, 5 * (1 - v)); });
      // the fix: a note of what you expected and what happened
      const n = cl(S.note);
      k("note").setAttribute("transform", `translate(0 ${f1(10 * (1 - n))})`); op("note", n * 1.5);
      [0, 1].forEach(i => { const l = k("nl" + i); l.style.strokeDasharray = "80"; l.style.strokeDashoffset = f1(80 * (1 - cl(S.nl * 2 - i))); });
      const ck = k("nchk"); ck.style.strokeDasharray = "14"; ck.style.strokeDashoffset = f1(14 * (1 - cl(S.nchk)));
      // plan for a future you who is a bit different
      const b2 = cl(S.bag2);
      k("bag2").setAttribute("transform", `translate(0 ${f1(8 * (1 - b2))})`); op("bag2", b2 * 1.5);
      const th = cl(S.thanks);
      k("thanks").setAttribute("transform", `translate(${FX} ${TGS + 6}) scale(${f2(.6 + .4 * Math.min(1.1, S.thanks))}) translate(${-FX} ${-(TGS + 6)})`);
      op("thanks", th * 2);
    },
    beats: [
      { steps: [{ to: { tl: 1 }, ms: 800, ease: "inOut", sfx: "pluck" }, { to: { lab: 1, you: 1 }, ms: 450 }, { wait: 250 },
        { to: { ghost: 1, qm: 1 }, ms: 600 }], hold: 2400 },
      { steps: [{ to: { lens: 1 }, ms: 450, ease: "back", sfx: "pop" }, { wait: 250 }, { to: { beam: 1 }, ms: 900, ease: "inOut", sfx: "whoosh" },
        { to: { tint: 1, qm: 0 }, ms: 500 }], hold: 2600 },
      { steps: [{ to: { lab0: 1 }, ms: 350 }, { to: { tH: 1 }, ms: 400, ease: "back", sfx: "tick" }, { to: { bag: 1 }, ms: 300 },
        { to: { buy: 6 }, ms: 1500, ease: "lin" }, { wait: 150 }, { to: { fcp: 1 }, ms: 700, ease: "inOut" }], hold: 2600 },
      { steps: [{ to: { flip: 1 }, ms: 600, ease: "inOut", sfx: "spring" }, { wait: 300 }, { to: { waste: 1 }, ms: 500 }, { to: { wl: 1 }, ms: 300 }], hold: 2600 },
      { steps: [{ to: { pOut: 1, lab0: 0 }, ms: 400 }, { to: { lab1: 1 }, ms: 300 },
        { to: { tS: 1, mT: -1 }, ms: 700, ease: "bounce", sfx: "thud", sfxAt: 250 }, { wait: 200 },
        { to: { barE: 1, mF: -1 }, ms: 1000, ease: "inOut" }, { wait: 400 }, { to: { barR: 1 }, ms: 500 }, { to: { mF: 1 }, ms: 400 }], hold: 3000 },
      { steps: [{ to: { bOut: 1, lab1: 0, mT: 0 }, ms: 400 }, { to: { lab2: 1 }, ms: 300 }, { to: { pc: 1 }, ms: 500, ease: "back", sfx: "pop" },
        { wait: 700 }, { to: { rosy: 1, mP: 1 }, ms: 900, ease: "inOut" }], hold: 3000 },
      { steps: [{ to: { cOut: 1, lab2: 0 }, ms: 400 }, { to: { beam: 0 }, ms: 500, ease: "inOut" }, { to: { low: 1 }, ms: 600, ease: "inOut" },
        { to: { ink: 1, mP: 0, mF: 0 }, ms: 500 }, { to: { note: 1 }, ms: 450, ease: "back" }, { to: { nl: 1 }, ms: 900, ease: "lin", sfx: "scribble" },
        { to: { nchk: 1 }, ms: 300 }], hold: 2800 },
      { steps: [{ to: { good: 1, mF: 1 }, ms: 600 }, { to: { bag2: 1 }, ms: 400, ease: "back" }, { to: { thanks: 1 }, ms: 450, ease: "back", sfx: "chime" }], hold: 4200 }
    ]
  };
})();
