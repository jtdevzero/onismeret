/* Decoy effect: small popcorn €3, large €7, and most people take the small. Then a €6.50 medium
   nobody wants appears, the large looks like a steal, and the crowd walks over to it. Scene for anim.js. */
(function () {
  const KEY = "decoy-effect", P = `.bp[data-scene="${KEY}"]`;
  const BX = { s: 90, m: 200, l: 310 };           // bucket centres
  const BASE = 92;                                // bucket bottoms (the counter top)
  const TT = 104, TW = 64, TH = 32;               // price tags: top, width, height
  const SIZE = { s: [19, 14, 40, 9], m: [25, 18.5, 54, 11], l: [30, 22, 60, 12] };   // top half-width, bottom half-width, height, popcorn heap
  const FB = 238, BB = 211, CNT = 258;            // crowd rows (feet) and the counters' baseline
  const SLOTS = [[0, FB], [-14, FB], [14, FB], [-7, BB], [7, BB], [-21, BB], [21, BB]];
  const E = [200, 268];                           // where the crowd walks in from
  // who goes where at first: seven to the small, three to the large. Back row first, and the spot farthest
  // from the entrance first, so nobody walks through someone already standing there.
  const WHO = [["s", 5], ["s", 3], ["l", 2], ["s", 4], ["s", 6], ["l", 0], ["s", 1], ["s", 0], ["l", 1], ["s", 2]];
  const MOVE = { 4: 0, 3: 1, 1: 2, 0: 3 };        // the back row of the small walks over to the large, rightmost first
  const ARC_A = [BX.s, BX.l, 178, 0], ARC_B = [BX.m + 6, BX.l - 6, 160, 17];   // comparisons under the tags: from x, to x, control y, pill drop
  const AY = TT + TH + 2;
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const walkE = p => (3 * p - p * p * p) / 2;     // set off briskly, slow to a stop
  const bump = p => cl(Math.min(p, 1 - p) * 14);  // 1 while walking, 0 when standing

  // a popcorn bucket standing on (0, 0): a heap of kernels (back rows first), body, two stripes
  const bucket = s => {
    const [hwT, hwB, h, heap] = SIZE[s];
    const n0 = Math.round(2 * hwT / 9) + 1;
    const rows = [[n0 - 3, hwT - 15, heap], [n0 - 1, hwT - 8, heap * .55], [n0, hwT - 3, 0]];
    let pop = "";
    rows.forEach(([n, half, up], r) => {
      for (let i = 0; i < n; i++) {
        const x = n > 1 ? -half + 2 * half * i / (n - 1) : 0, j = ((i * 7 + r * 3) % 5 - 2) * .5;
        pop += `<circle class="de-pc" cx="${f1(x + j * .6)}" cy="${f1(-h - 1 - up + j)}" r="${f1(5.3 - r * .15 + (i % 2) * .4)}"/>`;
      }
    });
    const band = (a, b) => `<path class="de-str" d="M${f1(a * hwB)} 0 L${f1(b * hwB)} 0 L${f1(b * hwT)} ${-h} L${f1(a * hwT)} ${-h} Z"/>`;
    return `${pop}
      <path class="de-bk" d="M${-hwB} 0 L${hwB} 0 L${hwT} ${-h} L${-hwT} ${-h} Z"/>
      ${band(-.62, -.24)}${band(.24, .62)}
      <path class="de-bl" d="M${-hwB} 0 L${hwB} 0 L${hwT} ${-h} L${-hwT} ${-h} Z"/>
      <line class="de-rim" x1="${-hwT - 2}" y1="${-h}" x2="${hwT + 2}" y2="${-h}"/>`;
  };
  // a price tag under a bucket: size, price, and two highlight outlines
  const tag = (s, T) => `<g data-k="tag${s.toUpperCase()}" transform="translate(${BX[s]} ${TT})">
      <rect class="de-tg" x="${-TW / 2}" width="${TW}" height="${TH}" rx="7"/>
      <rect class="de-tg q" data-k="tq${s.toUpperCase()}" x="${-TW / 2}" width="${TW}" height="${TH}" rx="7"/>
      <rect class="de-tg g" data-k="tg${s.toUpperCase()}" x="${-TW / 2}" width="${TW}" height="${TH}" rx="7"/>
      <text class="de-sz" y="12">${T.size[s]}</text><text class="de-pr" y="27.5">${T.price[s]}</text></g>`;
  // a comparison arc between two tags, with an arrowhead and a pill on (or just under) its lowest point
  const arc = (key, [x0, x1, cy, drop], cls, pill, w) => {
    const my = (AY + 2 * cy + AY) / 4 + drop, mx = (x0 + x1) / 2;
    const ang = Math.atan2(AY - cy, x1 - mx), h = 6;
    const hx = a => f1(x1 - h * Math.cos(ang + a)), hy = a => f1(AY - h * Math.sin(ang + a));
    return `<g class="de-arc ${cls}" data-k="${key}">
      <path class="ln" data-k="${key}p" pathLength="1" stroke-dasharray="1 1" d="M${x0} ${AY} Q${mx} ${cy} ${x1} ${AY}"/>
      <path class="ln" data-k="${key}h" d="M${hx(.5)} ${hy(.5)} L${x1} ${AY} L${hx(-.5)} ${hy(-.5)}"/>
      <g data-k="${key}t"><rect x="${mx - w / 2}" y="${my - 10}" width="${w}" height="20" rx="10"/><text x="${mx}" y="${my + 4}">${pill}</text></g></g>`;
  };
  const person = i => `<g class="de-p" data-k="p${i}"><path data-k="p${i}l"/>` +
    `<path d="M-5.5 -8 V-13 Q-5.5 -17 0 -17 Q5.5 -17 5.5 -13 V-8 Z"/><circle cy="-21.5" r="4.2"/></g>`;

  window.BiasAnim.SCENES[KEY] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
      ${P} .de-shelf{fill:var(--surface);stroke:var(--rule);stroke-width:2;stroke-linejoin:round}
      ${P} .de-pc{fill:var(--surface);stroke:var(--ink);stroke-width:1.7}
      ${P} .de-bk{fill:var(--surface);stroke:none}
      ${P} .de-str{fill:var(--q);fill-opacity:.32;stroke:none}
      ${P} .de-bl{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .de-rim{stroke:var(--ink);stroke-width:2.6;stroke-linecap:round}
      ${P} .de-tg{fill:var(--surface);stroke:var(--muted);stroke-width:1.6}
      ${P} .de-tg.q{fill:none;stroke:var(--q);stroke-width:2.2;opacity:0}
      ${P} .de-tg.g{fill:none;stroke:var(--good);stroke-width:2.2;opacity:0}
      ${P} .de-sz{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .de-pr{font:700 15px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .de-arc .ln{fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .de-arc rect{fill:var(--surface);stroke-width:1.8}
      ${P} .de-arc text{font:600 11px var(--display);text-anchor:middle}
      ${P} .de-arc.m .ln,${P} .de-arc.m rect{stroke:var(--muted)} ${P} .de-arc.m text{fill:var(--ink)}
      ${P} .de-arc.q .ln,${P} .de-arc.q rect{stroke:var(--q)} ${P} .de-arc.q text{fill:var(--ink)}
      ${P} .de-arc.g .ln,${P} .de-arc.g rect{stroke:var(--good)} ${P} .de-arc.g text{fill:var(--good)}
      ${P} .de-note{font:500 9.5px var(--mono);fill:var(--good);text-anchor:middle}
      ${P} .de-p path,${P} .de-p circle{fill:var(--surface);stroke:var(--ink);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .de-n{font:700 14px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .de-n.b{fill:var(--bad)}
      ${P} .de-st rect{fill:var(--surface);fill-opacity:.92;stroke:var(--bad);stroke-width:2.2}
      ${P} .de-st text{font:700 13px var(--display);fill:var(--bad);text-anchor:middle;letter-spacing:.12em}
      ${P} .de-x{fill:none;stroke:var(--q);stroke-width:3;stroke-linecap:round}
    `,
    text: {
      hu: {
        name: "Csalihatás", shareTitle: "A csalihatás, 30 másodpercben",
        ecline: "Egy senki által nem kívánt lehetőség más opciót alkuként tüntethet fel. Csak a valódi választásokat hasonlítsd össze.",
        size: { s: "kicsi", m: "közepes", l: "nagy" }, price: { s: "3 €", m: "6,50 €", l: "7 €" },
        diff: "+4 €", diffW: 44, more: "csak 50 centtel több!", moreW: 102, decoy: "CSALI", decoyW: 78, real: "a valódi különbség",
        caps: [
          "A moziban a kicsi popcorn <b>3 €</b>, a nagy <b>7 €</b>.",
          "4 € többért a nagyot? A legtöbben a <b>kicsit</b> választják.",
          "Aztán a mozi hozzáad egy közepeset, <b>6,50 €</b>-ért.",
          "A közepes mellett a nagy <b>lopásnak</b> tűnik.",
          "Hirtelen sokkal többen <b>a nagyot választják</b>.",
          "Szinte senki nem veszi a közepeset. Ez egy <b>csali</b>, a nagy eladására való.",
          "<b>A megoldás:</b> húzd át azt a lehetőséget, amit soha nem választanál.",
          "Aztán kérdezd meg: <b>neked</b> megéri a nagy 4 €-val többért?"
        ],
        say: [
          "A moziban a kicsi popcorn három euró. A nagy hét.",
          "Négy euróval többért a nagyot? A legtöbben a kicsit választják.",
          "Aztán a mozi hozzáad egy közepeset, hat euro ötvenért.",
          "A közepes mellett a nagy lopásnak tűnik. Csak ötven centtel több!",
          "Hirtelen sokkal többen átváltanak a nagyra.",
          "Szinte senki nem veszi a közepeset. Ez egy csali, a nagy eladására való.",
          "A megoldás: húzd át azt a lehetőséget, amit soha nem választanál.",
          "Aztán kérdezd meg magadtól: neked megéri a nagy négy euróval többet?",
          "A csalihatás. Egy senki által nem kívánt lehetőség más opciót alkuként tüntethet fel. Csak a valódi választásokat hasonlítsd össze."
        ]
      },
      en: {
        name: "Decoy effect", shareTitle: "Decoy effect, explained in 30 seconds",
        ecline: "An option nobody wants can make another look like a bargain. Compare only the real choices.",
        size: { s: "small", m: "medium", l: "large" }, price: { s: "€3", m: "€6.50", l: "€7" },
        diff: "+€4", diffW: 44, more: "only 50c more!", moreW: 102, decoy: "DECOY", decoyW: 78, real: "the real difference",
        caps: [
          "At the cinema: small popcorn <b>€3</b>, large <b>€7</b>.",
          "€4 more for the large? Most people pick the <b>small</b>.",
          "Then the cinema adds a medium, at <b>€6.50</b>.",
          "Next to the medium, the large looks like a <b>steal</b>.",
          "Suddenly, many more people <b>switch to the large</b>.",
          "Almost nobody buys the medium. It's a <b>decoy</b>, there to sell the large.",
          "<b>The fix:</b> cross out the option you'd never pick.",
          "Then ask: is the large worth €4 more <b>to you</b>?"
        ],
        say: [
          "At the cinema, small popcorn costs three euros. Large costs seven.",
          "Four euros more for the large? Most people pick the small.",
          "Then the cinema adds a medium, at six fifty.",
          "Next to the medium, the large looks like a steal. Only fifty cents more!",
          "Suddenly, many more people switch to the large.",
          "Almost nobody buys the medium. It's a decoy, there to sell the large.",
          "The fix: cross out the option you'd never pick.",
          "Then ask yourself: is the large worth four euros more to you?",
          "The decoy effect. An option nobody wants can make another look like a bargain. Compare only the real choices."
        ]
      },
      el: {
        name: "Φαινόμενο δολώματος", shareTitle: "Το φαινόμενο δολώματος σε 30 δευτερόλεπτα",
        ecline: "Μια επιλογή που κανείς δεν θέλει μπορεί να κάνει μια άλλη να μοιάζει ευκαιρία. Σύγκρινε μόνο όσα θα διάλεγες στ’\u00a0αλήθεια.",
        size: { s: "μικρό", m: "μεσαίο", l: "μεγάλο" }, price: { s: "3 €", m: "6,50 €", l: "7 €" },
        diff: "+4 €", diffW: 48, more: "μόνο 50 λεπτά παραπάνω!", moreW: 158, decoy: "ΔΟΛΩΜΑ", decoyW: 86, real: "η πραγματική διαφορά",
        caps: [
          "Στο σινεμά: μικρό ποπ κορν <b>3\u00a0€</b>, μεγάλο <b>7\u00a0€</b>.",
          "4\u00a0€ παραπάνω για το μεγάλο; Οι\u00a0περισσότεροι παίρνουν το <b>μικρό</b>.",
          "Ύστερα το σινεμά βάζει και μεσαίο, στα <b>6,50\u00a0€</b>.",
          "Δίπλα στο μεσαίο, το μεγάλο φαίνεται <b>ευκαιρία</b>.",
          "Ξαφνικά, πολύ περισσότεροι <b>γυρνάνε στο μεγάλο</b>.",
          "Σχεδόν κανείς δεν παίρνει το μεσαίο. Είναι <b>δόλωμα</b>, για να πουλάει το μεγάλο.",
          "<b>Η λύση:</b> σβήσε την επιλογή που δεν θα διάλεγες ποτέ.",
          "Μετά αναρωτήσου: <b>εσύ</b> θα έδινες 4\u00a0€ παραπάνω για το μεγάλο;"
        ],
        say: [
          "Στο σινεμά, το μικρό ποπ κορν κάνει τρία ευρώ. Το μεγάλο, εφτά.",
          "Τέσσερα ευρώ παραπάνω για το μεγάλο; Οι περισσότεροι παίρνουν το μικρό.",
          "Ύστερα το σινεμά βάζει και μεσαίο, στα έξι και πενήντα.",
          "Δίπλα στο μεσαίο, το μεγάλο φαίνεται ευκαιρία. Μόνο πενήντα λεπτά παραπάνω!",
          "Ξαφνικά, πολύ περισσότεροι γυρνάνε στο μεγάλο.",
          "Σχεδόν κανείς δεν παίρνει το μεσαίο. Είναι δόλωμα, για να πουλάει το μεγάλο.",
          "Η λύση: σβήσε την επιλογή που δεν θα διάλεγες ποτέ.",
          "Μετά αναρωτήσου: εσύ θα έδινες τέσσερα ευρώ παραπάνω για το μεγάλο;",
          "Φαινόμενο δολώματος. Μια επιλογή που κανείς δεν θέλει μπορεί να κάνει μια άλλη να μοιάζει ευκαιρία. Σύγκρινε μόνο όσα θα διάλεγες στ’ αλήθεια."
        ]
      },
      es: {
        name: "Efecto señuelo", shareTitle: "El efecto señuelo en 30 segundos",
        ecline: "Una opción que nadie quiere puede hacer que otra parezca una ganga. Compara solo las opciones reales.",
        size: { s: "pequeño", m: "mediano", l: "grande" }, price: { s: "3 €", m: "6,50 €", l: "7 €" },
        diff: "+4 €", diffW: 48, more: "¡solo 0,50 € más!", moreW: 124, decoy: "SEÑUELO", decoyW: 109, real: "la diferencia real",
        caps: [
          "En el cine: palomitas pequeñas a <b>3 €</b>, grandes a <b>7 €</b>.",
          "¿4 € más por las grandes? La mayoría elige las <b>pequeñas</b>.",
          "Entonces el cine añade unas medianas a <b>6,50 €</b>.",
          "Al lado de las medianas, las grandes parecen <b>una ganga</b>.",
          "De pronto, mucha más gente <b>se pasa a las grandes</b>.",
          "Casi nadie compra las medianas. Son un <b>señuelo</b> para vender las grandes.",
          "<b>La solución:</b> tacha la opción que nunca elegirías.",
          "Luego pregúntate: ¿las grandes valen 4 € más <b>para ti</b>?"
        ],
        say: [
          "En el cine, las palomitas pequeñas cuestan tres euros. Las grandes, siete.",
          "¿Cuatro euros más por las grandes? La mayoría elige las pequeñas.",
          "Entonces el cine añade unas medianas, a seis cincuenta.",
          "Al lado de las medianas, las grandes parecen una ganga. ¡Solo cincuenta céntimos más!",
          "De pronto, mucha más gente se pasa a las grandes.",
          "Casi nadie compra las medianas. Son un señuelo, puesto ahí para vender las grandes.",
          "La solución: tacha la opción que nunca elegirías.",
          "Luego pregúntate: ¿las grandes valen cuatro euros más para ti?",
          "Efecto señuelo. Una opción que nadie quiere puede hacer que otra parezca una ganga. Compara solo las opciones reales."
        ]
      },
      fr: {
        name: "Effet de leurre", shareTitle: "L’effet de leurre en 30 secondes",
        ecline: "Une option dont personne ne veut peut en faire passer une autre pour une affaire. Ne comparez que les vrais choix.",
        size: { s: "petit", m: "moyen", l: "grand" }, price: { s: "3 €", m: "6,50 €", l: "7 €" },
        diff: "+4 €", diffW: 48, more: "que 50 cts de plus !", moreW: 131, decoy: "LEURRE", decoyW: 90, real: "la vraie différence",
        caps: [
          "Au cinéma : petit pop-corn <b>3 €</b>, grand <b>7 €</b>.",
          "4 € de plus pour le grand ? La plupart prennent le <b>petit</b>.",
          "Puis le cinéma ajoute un moyen, à <b>6,50 €</b>.",
          "À côté du moyen, le grand semble une <b>affaire</b>.",
          "Soudain, bien plus de gens <b>passent au grand</b>.",
          "Presque personne ne prend le moyen. C’est un <b>leurre</b>, là pour vendre le grand.",
          "<b>La solution :</b> barrez l’option que vous ne choisiriez jamais.",
          "Puis demandez-vous : le grand vaut-il 4 € de plus <b>pour vous</b> ?"
        ],
        say: [
          "Au cinéma, le petit pop-corn coûte trois euros. Le grand, sept.",
          "Quatre euros de plus pour le grand ? La plupart prennent le petit.",
          "Puis le cinéma ajoute un moyen, à six euros cinquante.",
          "À côté du moyen, le grand semble une affaire. Que cinquante centimes de plus !",
          "Soudain, bien plus de gens passent au grand.",
          "Presque personne ne prend le moyen. C’est un leurre, placé là pour vendre le grand.",
          "La solution : barrez l’option que vous ne choisiriez jamais.",
          "Puis demandez-vous : le grand vaut-il quatre euros de plus pour vous ?",
          "L’effet de leurre. Une option dont personne ne veut peut en faire passer une autre pour une affaire. Ne comparez que les vrais choix."
        ]
      },
      de: {
        name: "Köder-Effekt", shareTitle: "Der Köder-Effekt in 30 Sekunden",
        ecline: "Eine Option, die niemand will, lässt eine andere wie ein Schnäppchen aussehen. Vergleiche nur die echten Optionen.",
        size: { s: "klein", m: "mittel", l: "groß" }, price: { s: "3 €", m: "6,50 €", l: "7 €" },
        diff: "+4 €", diffW: 48, more: "nur 50 Cent mehr!", moreW: 124, decoy: "KÖDER", decoyW: 79, real: "der echte Unterschied",
        caps: [
          "Im Kino: kleines Popcorn <b>3 €</b>, großes <b>7 €</b>.",
          "4 € mehr für das große? Die meisten nehmen das <b>kleine</b>.",
          "Dann bietet das Kino ein mittleres an, für <b>6,50 €</b>.",
          "Neben dem mittleren wirkt das große wie ein <b>Schnäppchen</b>.",
          "Plötzlich nehmen viel mehr Leute <b>das große</b>.",
          "Fast niemand kauft das mittlere. Es ist ein <b>Köder</b>, der das große verkaufen soll.",
          "<b>Die Lösung:</b> Streich die Option, die du nie wählen würdest.",
          "Dann frag dich: Ist <b>dir</b> das große 4 € mehr wert?"
        ],
        say: [
          "Im Kino kostet kleines Popcorn drei Euro. Großes kostet sieben.",
          "Vier Euro mehr für das große? Die meisten nehmen das kleine.",
          "Dann bietet das Kino ein mittleres an, für sechs Euro fünfzig.",
          "Neben dem mittleren wirkt das große wie ein Schnäppchen. Nur fünfzig Cent mehr!",
          "Plötzlich nehmen viel mehr Leute das große.",
          "Fast niemand kauft das mittlere. Es ist ein Köder, der das große verkaufen soll.",
          "Die Lösung: Streich die Option, die du nie wählen würdest.",
          "Dann frag dich: Ist dir das große vier Euro mehr wert?",
          "Der Köder-Effekt. Eine Option, die niemand will, lässt eine andere wie ein Schnäppchen aussehen. Vergleiche nur die echten Optionen."
        ]
      },
      it: {
        name: "Effetto esca", shareTitle: "L’effetto esca in 30 secondi",
        ecline: "Un’opzione che nessuno vuole può far sembrare un’altra un affare. Confronta solo le scelte reali.",
        size: { s: "piccolo", m: "medio", l: "grande" }, price: { s: "3 €", m: "6,50 €", l: "7 €" },
        diff: "+4 €", diffW: 48, more: "solo 50 cent in più!", moreW: 128, decoy: "ESCA", decoyW: 78, real: "la vera differenza",
        caps: [
          "Al cinema: popcorn piccolo <b>3 €</b>, grande <b>7 €</b>.",
          "4 € in più per il grande? I più scelgono il <b>piccolo</b>.",
          "Poi il cinema aggiunge un medio, a <b>6,50 €</b>.",
          "Accanto al medio, il grande sembra un <b>affare</b>.",
          "All’improvviso, molte più persone <b>passano al grande</b>.",
          "Il medio non lo compra quasi nessuno. È un’<b>esca</b>, serve a vendere il grande.",
          "<b>La soluzione:</b> cancella l’opzione che non sceglieresti mai.",
          "Poi chiediti: il grande vale 4 € in più <b>per te</b>?"
        ],
        say: [
          "Al cinema, il popcorn piccolo costa tre euro. Il grande costa sette.",
          "Quattro euro in più per il grande? I più scelgono il piccolo.",
          "Poi il cinema aggiunge un medio, a sei euro e cinquanta.",
          "Accanto al medio, il grande sembra un affare. Solo cinquanta centesimi in più!",
          "All’improvviso, molte più persone passano al grande.",
          "Il medio non lo compra quasi nessuno. È un’esca, serve a vendere il grande.",
          "La soluzione: cancella l’opzione che non sceglieresti mai.",
          "Poi chiediti: il grande vale quattro euro in più per te?",
          "L’effetto esca. Un’opzione che nessuno vuole può far sembrare un’altra un affare. Confronta solo le scelte reali."
        ]
      }
    },
    svg(T) {
      const [, , mh, mheap] = SIZE.m;
      let people = "";
      for (let i = 0; i < WHO.length; i++) people += person(i);
      return `
        <g data-k="shelf"><rect class="de-shelf" x="16" y="${BASE}" width="368" height="7" rx="2"/></g>
        <g data-k="colS"><g data-k="bS">${bucket("s")}</g>${tag("s", T)}</g>
        <g data-k="colL"><g data-k="bL">${bucket("l")}</g>${tag("l", T)}</g>
        <g data-k="colM"><g data-k="bM">${bucket("m")}</g>${tag("m", T)}</g>
        <g data-k="stamp"><g class="de-st" transform="translate(${BX.m} ${BASE - mh / 2}) rotate(-12)">
          <rect x="${-T.decoyW / 2}" y="-12" width="${T.decoyW}" height="24" rx="4"/><text y="5">${T.decoy}</text></g></g>
        <path class="de-x" data-k="cross" pathLength="1" stroke-dasharray="1 1"
          d="M${BX.m - 34} ${BASE - mh - mheap - 2} L${BX.m + 34} ${TT + TH + 4} M${BX.m + 34} ${BASE - mh - mheap - 2} L${BX.m - 34} ${TT + TH + 4}"/>
        ${arc("arcA", ARC_A, "m", T.diff, T.diffW)}
        ${arc("arcB", ARC_B, "q", T.more, T.moreW)}
        ${arc("arcG", ARC_A, "g", T.diff, T.diffW)}
        <text class="de-note" data-k="real" x="${BX.m}" y="${(AY + ARC_A[2]) / 2 + 25}">${T.real}</text>
        <g data-k="crowd">${people}
          <text class="de-n" data-k="nS" x="${BX.s}" y="${CNT}"></text>
          <text class="de-n" data-k="nL" x="${BX.l}" y="${CNT}"></text>
          <g data-k="nM"><text class="de-n" x="${BX.m}" y="${CNT}">0</text></g>
          <g data-k="nM0"><text class="de-n b" x="${BX.m}" y="${CNT}">0</text></g>
        </g>`;
    },
    S0: { shelf: 0, sIn: 0, lIn: 0, tags: 0, arcA: 0, cnt: 0, walk: 0, mIn: 0, mTag: 0, arcB: 0, boost: 0, hl: 0, dimS: 0,
      mCnt: 0, move: 0, stamp: 0, zero: 0, calm: 0, cross: 0, ghost: 0, arcG: 0, real: 0, ok: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const tr = (key, x, y, extra) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)})${extra || ""}`);
      op("shelf", S.shelf);
      // the two first buckets rise onto the counter; the large one jumps when it starts to look cheap
      tr("bS", BX.s, BASE + 8 * (1 - S.sIn));
      tr("bL", BX.l, BASE + 8 * (1 - S.lIn), ` scale(${f1((1 + .1 * S.boost) * 100) / 100})`);
      op("bS", S.sIn); op("bL", S.lIn);
      op("tagS", S.tags); op("tagL", S.tags);
      op("colS", 1 - .55 * S.dimS * (1 - S.calm));
      op("tqL", S.hl * (1 - S.calm)); op("tgS", S.ok); op("tgL", S.ok);
      // the medium drops in between, and later fades once it's crossed out
      tr("bM", BX.m, BASE - 34 * (1 - S.mIn));
      op("bM", cl(S.mIn * 2.2));
      op("tagM", S.mTag);
      op("colM", 1 - .75 * S.ghost);
      // comparisons: +€4 small to large, "only 50c more" medium to large, and +€4 again at the end
      const drawArc = (key, v, gone) => {
        k(key + "p").style.strokeDashoffset = f1((1 - cl(v / .7)) * 1000) / 1000;
        op(key + "h", (v - .65) / .1);
        op(key + "t", (v - .7) / .3);
        op(key, v > 0 ? 1 - gone : 0);
      };
      drawArc("arcA", S.arcA, 0);
      drawArc("arcB", S.arcB, S.calm);
      drawArc("arcG", S.arcG, 0);
      op("real", S.real);
      // the decoy stamp slams onto the medium, then gives way to a cross
      const ss = 1 + .6 * (1 - S.stamp);
      tr("stamp", BX.m, BASE - SIZE.m[2] / 2, ` scale(${f1(ss * 100) / 100}) translate(${-BX.m} ${-(BASE - SIZE.m[2] / 2)})`);
      op("stamp", cl(S.stamp * 3) * (1 - S.calm));
      k("cross").style.strokeDashoffset = f1((1 - S.cross) * 1000) / 1000;
      op("cross", S.cross > 0 ? 1 - .25 * S.ok : 0);
      // the crowd: walk in, then four of them walk over to the large
      let nS = 0, nL = 0;
      WHO.forEach(([dest, slot], i) => {
        const [dx, fy] = SLOTS[slot];
        const p = cl((S.walk - i * .07) / .37), sx = BX[dest] + dx;
        let x = E[0] + (sx - E[0]) * walkE(p), y = E[1] + (fy - E[1]) * walkE(p);
        let moving = bump(p), dist = p * Math.hypot(sx - E[0], fy - E[1]);
        let at = p >= .97 ? dest : null;
        if (i in MOVE) {
          const m = cl((S.move - MOVE[i] * .16) / .52);
          if (m > 0) { x = sx + (BX.l - BX.s) * walkE(m); moving = bump(m); dist = m * 220; if (m >= .5) at = "l"; }
        }
        const sw = 2.6 * Math.sin(dist * .2) * moving;
        tr("p" + i, x, y);
        k("p" + i + "l").setAttribute("d", `M-2.5 -8 L${f1(-3 + sw)} 0 M2.5 -8 L${f1(3 - sw)} 0`);
        op("p" + i, cl(p * 5));
        if (at === "s") nS++; else if (at === "l") nL++;
      });
      k("nS").textContent = nS; k("nL").textContent = nL;
      op("nS", S.cnt); op("nL", S.cnt);
      op("nM", S.mCnt * (1 - S.zero));
      const zs = 1 + .5 * Math.sin(Math.PI * cl(S.zero));
      tr("nM0", BX.m, CNT - 5, ` scale(${f1(zs * 100) / 100}) translate(${-BX.m} ${-(CNT - 5)})`);
      op("nM0", S.mCnt * S.zero);
      op("crowd", 1 - .82 * S.calm);
    },
    beats: [
      { steps: [{ to: { shelf: 1 }, ms: 300 }, { to: { sIn: 1 }, ms: 500, ease: "out", sfx: "pluck" }, { to: { lIn: 1 }, ms: 500, ease: "out" },
        { to: { tags: 1 }, ms: 400 }] },
      { steps: [{ to: { arcA: 1 }, ms: 700, sfx: "tick" }, { wait: 300 }, { to: { cnt: 1 }, ms: 300 }, { to: { walk: 1 }, ms: 2600, ease: "lin" }], hold: 2200 },
      { steps: [{ to: { arcA: 0 }, ms: 300 }, { to: { mIn: 1 }, ms: 700, ease: "out", sfx: "pop" }, { to: { mTag: 1 }, ms: 400 }] },
      { steps: [{ to: { arcB: 1 }, ms: 800 }, { to: { boost: 1, hl: 1, dimS: 1 }, ms: 260, sfx: "spring" }, { to: { boost: 0 }, ms: 700, ease: "out" }] },
      { steps: [{ to: { mCnt: 1 }, ms: 300 }, { to: { move: 1 }, ms: 1900, ease: "lin", sfx: "whoosh" }], hold: 2200 },
      { steps: [{ to: { stamp: 1 }, ms: 320, sfx: "thud", sfxAt: 220 }, { wait: 300 }, { to: { zero: 1 }, ms: 500 }] },
      { steps: [{ to: { calm: 1 }, ms: 500 }, { to: { cross: 1 }, ms: 700, sfx: "scribble" }, { to: { ghost: 1 }, ms: 500 }] },
      { steps: [{ to: { arcG: 1 }, ms: 900 }, { to: { real: 1 }, ms: 400 }, { to: { ok: 1 }, ms: 500, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
