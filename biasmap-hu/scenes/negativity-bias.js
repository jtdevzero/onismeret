/* Negativity bias: ten comments after a talk, nine warm and one sharp. That night the sharp one
   fills your head while the nine fade, and on the scale in your mind it outweighs them all.
   Counting them, and keeping only the useful point, tips it back. Scene for anim.js. */
(function () {
  const KEY = "negativity-bias", P = `.bp[data-scene="${KEY}"]`;
  const RED = 7, GREENS = [0, 1, 2, 3, 4, 5, 6, 8, 9];           // the sharp comment, and the nine warm ones
  const GX = [169, 218, 267, 316, 365], GY = [100, 146];           // the comments, as they arrive after the talk
  const BX = 247, BY = 81;                                         // centre of the thought bubble
  const PX = 200, PY = 172, BL = 118, STEM = 24;                   // the scale: pivot, half beam, tray stems
  const RX = j => 200 + (j - 4.5) * 36.5, RY = 100;                // the counting row
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const lerp = (a, b, t) => a + (b - a) * t;
  const io = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const out = t => 1 - Math.pow(1 - t, 3);
  // beam ends for a tilt in degrees (positive: right side down)
  const beam = th => { const a = th * Math.PI / 180, c = Math.cos(a) * BL, s = Math.sin(a) * BL; return { xl: PX - c, yl: PY - s, xr: PX + c, yr: PY + s }; };
  // nine cards stacked three by three on a tray, bottom row first
  const stack = (j, cx, ty, s) => [cx + (j % 3 - 1) * (42 * s + 3), ty - 23 * s - (j / 3 | 0) * (34 * s + 7), s];

  // a comment card: a speech-bubble outline, a face, three lines of text
  const OUT = "M-15 -17 H15 Q21 -17 21 -11 V11 Q21 17 15 17 H-6 L-13 23 L-12 17 H-15 Q-21 17 -21 11 V-11 Q-21 -17 -15 -17 Z";
  const EYES = `<circle class="e" cx="-11.4" cy="-2" r="1.2"/><circle class="e" cx="-6.6" cy="-2" r="1.2"/>`;
  const SMILE = "M-12.2 2 Q-9 5.6 -5.8 2", FROWN = "M-12.2 5 Q-9 1.6 -5.8 5";
  const card = i => {
    const c = i === RED ? "r" : "g";
    return `<g class="nb-card" data-k="c${i}"><path class="nb-cd" d="${OUT}"/><path class="nb-cd ${c}" data-k="co${i}" d="${OUT}"/>
      <path class="nb-tx" d="M3 -6 H15 M3 0 H13 M3 6 H9"/>
      <g class="nb-fn" data-k="fn${i}"><circle cx="-9" cy="0" r="7.5"/>${EYES}<path d="M-11.5 3.4 H-6.5"/></g>
      <g class="nb-fc ${c}" data-k="fc${i}"><circle cx="-9" cy="0" r="7.5"/>${EYES}<path d="${c === "r" ? FROWN : SMILE}"/></g></g>`;
  };
  const BIG = "M-84 -36 H84 Q96 -36 96 -24 V24 Q96 36 84 36 H-56 L-72 50 L-70 36 H-84 Q-96 36 -96 24 V-24 Q-96 -36 -84 -36 Z";
  const TRAY = "M-52 -5 Q-51 2 -44 2 H44 Q51 2 52 -5";

  window.BiasAnim.SCENES[KEY] = {
    q: "tmi", viewBox: "0 0 400 272",
    css: `
      ${P} .nb-ln{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .nb-fl{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .nb-e{fill:var(--ink)}
      ${P} .nb-flr{stroke:var(--rule);stroke-width:2;stroke-linecap:round}
      ${P} .nb-scr{fill:var(--surface);stroke:var(--ink);stroke-width:2}
      ${P} .nb-sl{fill:none;stroke:var(--faint);stroke-width:2;stroke-linecap:round}
      ${P} .nb-sq{fill:none;stroke:var(--q);stroke-width:2.6;stroke-linecap:round}
      ${P} .nb-bar{fill:var(--q);fill-opacity:.3;stroke:var(--q);stroke-width:1.4}
      ${P} .nb-cnt{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .nb-card *{vector-effect:non-scaling-stroke}
      ${P} .nb-cd{fill:var(--surface);stroke:var(--muted);stroke-width:1.8;stroke-linejoin:round}
      ${P} .nb-cd.g{fill:none;stroke:var(--good)} ${P} .nb-cd.r{fill:none;stroke:var(--bad);stroke-width:2.2}
      ${P} .nb-tx{fill:none;stroke:var(--faint);stroke-width:1.8;stroke-linecap:round}
      ${P} .nb-fn circle,${P} .nb-fn path{fill:none;stroke:var(--faint);stroke-width:1.6;stroke-linecap:round}
      ${P} .nb-fc circle,${P} .nb-fc path{fill:none;stroke:var(--good);stroke-width:1.7;stroke-linecap:round}
      ${P} .nb-fc.r circle,${P} .nb-fc.r path{stroke:var(--bad)}
      ${P} .nb-fn .e{fill:var(--faint);stroke:none} ${P} .nb-fc .e{fill:var(--good);stroke:none} ${P} .nb-fc.r .e{fill:var(--bad);stroke:none}
      ${P} .nb-tag rect,${P} .nb-tag path{fill:var(--surface);stroke:var(--bad);stroke-width:1.6;stroke-linejoin:round}
      ${P} .nb-tag text{font:600 12px var(--display);fill:var(--bad);text-anchor:middle}
      ${P} .nb-moon{fill:var(--q);fill-opacity:.22;stroke:var(--q);stroke-width:2;stroke-linejoin:round}
      ${P} .nb-star{fill:none;stroke:var(--muted);stroke-width:1.5;stroke-linecap:round}
      ${P} .nb-bub{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .nb-big .o{fill:var(--surface);stroke:var(--bad);stroke-width:2.4;stroke-linejoin:round}
      ${P} .nb-big circle,${P} .nb-big path.m{fill:none;stroke:var(--bad);stroke-width:2.4;stroke-linecap:round}
      ${P} .nb-big .e{fill:var(--bad);stroke:none}
      ${P} .nb-big text{font:700 23px var(--display);fill:var(--bad);text-anchor:middle}
      ${P} .nb-beam{stroke:var(--ink);stroke-width:3;stroke-linecap:round}
      ${P} .nb-stem{stroke:var(--ink);stroke-width:2.2;stroke-linecap:round}
      ${P} .nb-tray{fill:none;stroke:var(--ink);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .nb-ok .nb-beam,${P} .nb-ok .nb-stem,${P} .nb-ok .nb-tray{stroke:var(--good)}
      ${P} .nb-dz rect{fill:var(--surface);stroke:var(--bad);stroke-width:1.6}
      ${P} .nb-dz path{fill:none;stroke:var(--bad);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .nb-dz circle{fill:var(--bad)}
      ${P} .nb-dz text{font:600 12px var(--display);fill:var(--bad)}
      ${P} .nb-strike{fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linecap:round}
      ${P} .nb-op{font:600 12.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .nb-num{font:500 10.5px var(--mono);fill:var(--good);text-anchor:middle}
      ${P} .nb-br{fill:none;stroke:var(--good);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .nb-of{font:700 24px var(--display);fill:var(--good);text-anchor:middle}
      ${P} .nb-lk{font:500 10px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .nb-note path{fill:var(--surface);stroke:var(--q);stroke-width:1.6;stroke-linejoin:round}
      ${P} .nb-note .f{fill:var(--q);fill-opacity:.25}
      ${P} .nb-note text{font:600 11.5px var(--display);fill:var(--ink);text-anchor:middle}
    `,
    text: {
      hu: {
        name: "Negativitási torzítás", shareTitle: "A negativitási torzítás, 30 másodpercben",
        ecline: "Egy rossz hozzászólás elnyomhat kilenc jót. Számold meg őket, mielőtt mérlegeled.",
        count: n => (n === 1 ? "1 hozzászólás" : `${n} hozzászólás`),
        quote: "„Unalmas.”", tagW: 78, danger: "veszély!", dW: 46, opinion: "egy vélemény",
        of10: "10-ből 9", liked: "tetszett", note: "lassú kezdés?", noteW: 84,
        caps: [
          "Előadást tartasz. Utána <b>tíz hozzászólás</b> érkezik.",
          "Kilenc kedves. <b>Egy</b> éles.",
          "Aznap éjjel nem tudsz szabadulni <b>attól az egytől</b>.",
          "A kilenc jó? <b>Máris halványulnak.</b>",
          "A rossz dolgok <b>többet nyomnak</b>, mint az egyenlően jók.",
          "Ez a riasztó a mi őseinket védte. Itt viszont csak <b>torzítja a képet</b>.",
          "<b>A megoldás:</b> számold meg őket. <b>Tízből kilencen</b> tetszett.",
          "Vedd ki az egyből a hasznos pontot. <b>A kilencet is tartsd meg.</b>"
        ],
        say: [
          "Előadást tartasz. Utána tíz hozzászólás érkezik.",
          "Kilenc kedves. Egy éles. Csak annyit mond: unalmas.",
          "Aznap éjjel nem tudsz szabadulni az egytől.",
          "A kilenc jó? Már halványulnak.",
          "A rossz dolgok többet nyomnak, mint az egyenlően jók.",
          "Ez a riasztó a mi őseinket védte. Itt viszont csak torzítja a képet. Ez egy vélemény.",
          "A megoldás: számold meg őket. Tízből kilencen tetszett.",
          "Vedd ki az egyből a hasznos pontot. De a kilencet is tartsd meg.",
          "Negativitási torzítás. Egy rossz hozzászólás elnyomhat kilenc jót. Számold meg őket, mielőtt mérlegeled."
        ]
      },
      en: {
        name: "Negativity bias", shareTitle: "Negativity bias, explained in 30 seconds",
        ecline: "One bad comment can drown out nine good ones. Count them before you weigh them.",
        count: n => (n === 1 ? "1 comment" : `${n} comments`),
        quote: "“Boring.”", tagW: 78, danger: "danger!", dW: 46, opinion: "one opinion",
        of10: "9 of 10", liked: "liked it", note: "slow start?", noteW: 84,
        caps: [
          "You give a talk. Afterwards, <b>ten comments</b> come in.",
          "Nine are warm. <b>One</b> is sharp.",
          "That night, you can't stop thinking about <b>the one</b>.",
          "The nine good ones? <b>Already fading.</b>",
          "Bad things <b>weigh more</b> than equally good ones.",
          "That alarm kept our ancestors safe. Here, it just <b>skews the picture</b>.",
          "<b>The fix:</b> count them. <b>Nine of ten</b> liked it.",
          "Take the useful point from the one. <b>Keep the nine too.</b>"
        ],
        say: [
          "You give a talk. Afterwards, ten comments come in.",
          "Nine are warm. One is sharp. It just says: boring.",
          "That night, you can't stop thinking about the one.",
          "And the nine good ones? Already fading.",
          "Bad things weigh more than equally good ones.",
          "That alarm kept our ancestors safe. Here, it just skews the picture. It's one opinion.",
          "The fix: count them. Nine out of ten liked it.",
          "Take the useful point from the one. But keep the nine too.",
          "Negativity bias. One bad comment can drown out nine good ones. Count them before you weigh them."
        ]
      },
      el: {
        name: "Μεροληψία αρνητικότητας", shareTitle: "Η μεροληψία αρνητικότητας σε 30 δευτερόλεπτα",
        ecline: "Ένα άσχημο σχόλιο μπορεί να επισκιάσει εννιά καλά. Μέτρα τα πριν τα ζυγίσεις.",
        count: n => (n === 1 ? "1 σχόλιο" : `${n} σχόλια`),
        quote: "«Βαρετό»", tagW: 78, danger: "κίνδυνος!", dW: 60, opinion: "μία γνώμη",
        of10: "9 στα 10", liked: "θετικά", note: "αργό ξεκίνημα;", noteW: 100,
        caps: [
          "Δίνεις μια ομιλία. Μετά, σου έρχονται <b>δέκα σχόλια</b>.",
          "Εννιά είναι θετικά. <b>Ένα</b> είναι καυστικό.",
          "Το βράδυ, <b>το ένα</b> δεν σου βγαίνει από το μυαλό.",
          "Και τα εννιά καλά; <b>Ξεθωριάζουν κιόλας.</b>",
          "Τα άσχημα <b>ζυγίζουν πιο πολύ</b> από τα εξίσου καλά.",
          "Αυτός ο συναγερμός προστάτευε τους προγόνους μας. Εδώ σου δίνει <b>στρεβλή εικόνα</b>.",
          "<b>Η λύση:</b> μέτρησέ τα. <b>Εννιά στα δέκα</b> ήταν θετικά.",
          "Πάρε ό,τι χρήσιμο λέει το\u00a0ένα. <b>Κράτα όμως και τα εννιά.</b>"
        ],
        say: [
          "Δίνεις μια ομιλία. Μετά, σου έρχονται δέκα σχόλια.",
          "Εννιά είναι θετικά. Ένα είναι καυστικό. Γράφει μόνο: βαρετό.",
          "Το βράδυ, το ένα δεν σου βγαίνει από το μυαλό.",
          "Και τα εννιά καλά; Ξεθωριάζουν κιόλας.",
          "Τα άσχημα ζυγίζουν πιο πολύ από τα εξίσου καλά.",
          "Αυτός ο συναγερμός προστάτευε τους προγόνους μας. Εδώ σου δίνει στρεβλή εικόνα. Μία γνώμη είναι.",
          "Η λύση: μέτρησέ τα. Εννιά στα δέκα ήταν θετικά.",
          "Πάρε ό,τι χρήσιμο λέει το ένα. Κράτα όμως και τα εννιά.",
          "Μεροληψία αρνητικότητας. Ένα άσχημο σχόλιο μπορεί να επισκιάσει εννιά καλά. Μέτρα τα πριν τα ζυγίσεις."
        ]
      },
      es: {
        name: "Sesgo de negatividad", shareTitle: "El sesgo de negatividad en 30 segundos",
        ecline: "Un comentario malo puede ahogar nueve buenos. Cuéntalos antes de sopesarlos.",
        count: n => (n === 1 ? "1 comentario" : `${n} comentarios`),
        quote: "«Aburrido.»", tagW: 95, danger: "¡peligro!", dW: 49, opinion: "una opinión",
        of10: "9 de 10", liked: "les gustó", note: "¿inicio lento?", noteW: 107,
        caps: [
          "Das una charla. Después, llegan <b>diez comentarios</b>.",
          "Nueve son amables. <b>Uno</b> es duro.",
          "Esa noche, no puedes dejar de pensar en <b>ese uno</b>.",
          "¿Los nueve buenos? <b>Ya se están borrando.</b>",
          "Lo malo <b>pesa más</b> que algo igual de bueno.",
          "Esa alarma protegía a nuestros antepasados. Aquí solo <b>distorsiona la imagen</b>.",
          "<b>La solución:</b> cuéntalos. A <b>nueve de cada diez</b> les gustó.",
          "Quédate con lo útil de ese uno. <b>Y también con los nueve.</b>"
        ],
        say: [
          "Das una charla. Después, llegan diez comentarios.",
          "Nueve son amables. Uno es duro. Solo dice: aburrido.",
          "Esa noche, no puedes dejar de pensar en ese uno.",
          "¿Y los nueve buenos? Ya se están borrando.",
          "Lo malo pesa más que algo igual de bueno.",
          "Esa alarma protegía a nuestros antepasados. Aquí solo distorsiona la imagen. Es una opinión.",
          "La solución: cuéntalos. A nueve de cada diez les gustó.",
          "Quédate con lo útil de ese uno. Pero quédate también con los nueve.",
          "El sesgo de negatividad. Un comentario malo puede ahogar nueve buenos. Cuéntalos antes de sopesarlos."
        ]
      },
      fr: {
        name: "Biais de négativité", shareTitle: "Le biais de négativité en 30 secondes",
        ecline: "Un mauvais commentaire peut en noyer neuf bons. Comptez-les avant de les peser.",
        count: n => (n > 1 ? `${n} commentaires` : `${n} commentaire`),
        quote: "« Barbant. »", tagW: 103, danger: "danger !", dW: 49, opinion: "un avis",
        of10: "9 sur 10", liked: "ont aimé", note: "début lent ?", noteW: 90,
        caps: [
          "Vous donnez une conférence. Ensuite, <b>dix commentaires</b> arrivent.",
          "Neuf sont chaleureux. <b>Un</b> est cinglant.",
          "Le soir, vous ne pensez qu’à <b>celui-là</b>.",
          "Les neuf bons ? <b>Déjà en train de s’effacer.</b>",
          "Le mauvais <b>pèse plus lourd</b> que le bon, à force égale.",
          "Cette alarme protégeait nos ancêtres. Ici, elle <b>fausse le tableau</b>.",
          "<b>La solution :</b> comptez-les. <b>Neuf sur dix</b> ont aimé.",
          "Retenez ce qui est utile dans celui-là. <b>Gardez aussi les neuf.</b>"
        ],
        say: [
          "Vous donnez une conférence. Ensuite, dix commentaires arrivent.",
          "Neuf sont chaleureux. Un est cinglant. Il dit juste : barbant.",
          "Le soir, vous ne pensez qu’à celui-là.",
          "Et les neuf bons ? Déjà en train de s’effacer.",
          "Le mauvais pèse plus lourd que le bon, à force égale.",
          "Cette alarme protégeait nos ancêtres. Ici, elle fausse juste le tableau. Ce n’est qu’un avis.",
          "La solution : comptez-les. Neuf sur dix ont aimé.",
          "Retenez ce qui est utile dans celui-là. Mais gardez aussi les neuf.",
          "Le biais de négativité. Un mauvais commentaire peut en noyer neuf bons. Comptez-les avant de les peser."
        ]
      },
      de: {
        name: "Negativitätseffekt", shareTitle: "Der Negativitätseffekt in 30 Sekunden",
        ecline: "Ein schlechter Kommentar kann neun gute übertönen. Zähl sie, bevor du sie gewichtest.",
        count: n => (n === 1 ? "1 Kommentar" : `${n} Kommentare`),
        quote: "„Öde.“", tagW: 78, danger: "Gefahr!", dW: 46, opinion: "eine Meinung",
        of10: "9 von 10", liked: "fanden es gut", note: "zäher Start?", noteW: 93,
        caps: [
          "Du hältst einen Vortrag. Danach kommen <b>zehn Kommentare</b>.",
          "Neun sind herzlich. <b>Einer</b> ist bissig.",
          "Abends geht dir <b>dieser eine</b> nicht aus dem Kopf.",
          "Die neun guten? <b>Verblassen schon.</b>",
          "Schlechtes <b>wiegt schwerer</b> als gleich starkes Gutes.",
          "Dieser Alarm schützte unsere Vorfahren. Hier <b>verzerrt er nur das Bild</b>.",
          "<b>Die Lösung:</b> Zähl nach. <b>Neun von zehn</b> fanden es gut.",
          "Nimm aus dem einen das Nützliche mit. <b>Behalte auch die neun.</b>"
        ],
        say: [
          "Du hältst einen Vortrag. Danach kommen zehn Kommentare.",
          "Neun sind herzlich. Einer ist bissig. Da steht nur: öde.",
          "Abends geht dir dieser eine nicht aus dem Kopf.",
          "Und die neun guten? Verblassen schon.",
          "Schlechtes wiegt schwerer als gleich starkes Gutes.",
          "Dieser Alarm schützte unsere Vorfahren. Hier verzerrt er nur das Bild. Es ist eine einzige Meinung.",
          "Die Lösung: Zähl nach. Neun von zehn fanden es gut.",
          "Nimm aus dem einen das Nützliche mit. Aber behalte auch die neun.",
          "Der Negativitätseffekt. Ein schlechter Kommentar kann neun gute übertönen. Zähl sie, bevor du sie gewichtest."
        ]
      },
      it: {
        name: "Bias di negatività", shareTitle: "Il bias di negatività in 30 secondi",
        ecline: "Un commento negativo può soffocarne nove positivi. Contali prima di pesarli.",
        count: n => (n === 1 ? "1 commento" : `${n} commenti`),
        quote: "«Noioso.»", tagW: 87, danger: "pericolo!", dW: 53, opinion: "un’opinione",
        of10: "9 su 10", liked: "positivi", note: "inizio lento?", noteW: 90,
        caps: [
          "Fai una presentazione. Poi arrivano <b>dieci commenti</b>.",
          "Nove sono calorosi. <b>Uno</b> è tagliente.",
          "La sera non smetti di pensare a <b>quell’uno</b>.",
          "I nove positivi? <b>Già sbiaditi.</b>",
          "Il negativo <b>pesa più</b> di un positivo equivalente.",
          "Quell’allarme proteggeva i nostri antenati. Qui <b>distorce solo il quadro</b>.",
          "<b>La soluzione:</b> contali. A <b>nove su dieci</b> è piaciuto.",
          "Prendi lo spunto utile da quell’uno. <b>Ma tieni anche i nove.</b>"
        ],
        say: [
          "Fai una presentazione. Poi arrivano dieci commenti.",
          "Nove sono calorosi. Uno è tagliente. Dice solo: noioso.",
          "La sera non smetti di pensare a quell’uno.",
          "E i nove positivi? Già sbiaditi.",
          "Il negativo pesa più di un positivo equivalente.",
          "Quell’allarme proteggeva i nostri antenati. Qui distorce solo il quadro. È un’opinione.",
          "La soluzione: contali. A nove su dieci è piaciuto.",
          "Prendi lo spunto utile da quell’uno. Ma tieni anche i nove.",
          "Il bias di negatività. Un commento negativo può soffocarne nove positivi. Contali prima di pesarli."
        ]
      }
    },
    svg(T) {
      const W = 19 + T.dW, x0 = -W / 2;                         // the alarm label: icon + word, centred
      const mid = (RX(0) + RX(8)) / 2;
      const arm = g => `<line class="nb-beam" data-k="beam${g}"/><line class="nb-stem" data-k="stL${g}"/><line class="nb-stem" data-k="stR${g}"/>
          <path class="nb-tray" data-k="trL${g}" d="${TRAY}"/><path class="nb-tray" data-k="trR${g}" d="${TRAY}"/>`;
      return `
        <g data-k="talk">
          <path class="nb-ln" d="M14 14 H126"/><rect class="nb-scr" x="20" y="15" width="100" height="60" rx="2"/>
          <path class="nb-sq" d="M31 28 H72"/>
          <path class="nb-bar" d="M33 64 V53 H42 V64 Z M48 64 V46 H57 V64 Z M63 64 V39 H72 V64 Z"/>
          <path class="nb-sl" d="M30 65 H78 M88 42 H110 M88 50 H105 M88 58 H110"/>
          <path class="nb-fl" d="M50 184 V168 C50 156 59 150 70 150 C81 150 90 156 90 168 V184 Z"/>
          <circle class="nb-fl" cx="70" cy="134" r="10"/><circle class="nb-e" cx="66.4" cy="132.5" r="1.4"/><circle class="nb-e" cx="73.6" cy="132.5" r="1.4"/>
          <path class="nb-ln" d="M66 137.5 Q70 141 74 137.5"/>
          <path class="nb-fl" d="M48 186 H92 L88 240 H52 Z"/><path class="nb-fl" d="M40 176 H100 L96 186 H44 Z"/>
          <path class="nb-flr" d="M14 242 H128"/>
        </g>
        <text class="nb-cnt" data-k="cnt" x="267" y="70"></text>
        <g data-k="night">
          <path class="nb-moon" d="M58 38.1 A16 16 0 1 0 58 65.9 A20 20 0 0 1 58 38.1 Z"/>
          <path class="nb-star" d="M88 26 v8 M84 30 h8 M26 94 v6 M23 97 h6 M84 94 v6 M81 97 h6"/>
          <rect class="nb-fl" x="14" y="176" width="10" height="66" rx="3"/>
          <path class="nb-ln" d="M32 230 V242 M162 230 V242"/>
          <rect class="nb-fl" x="20" y="214" width="150" height="16" rx="3"/>
          <ellipse class="nb-fl" cx="44" cy="209" rx="16" ry="6"/>
          <circle class="nb-fl" cx="46" cy="198" r="10"/><circle class="nb-e" cx="42.4" cy="197" r="1.5"/><circle class="nb-e" cx="49.6" cy="197" r="1.5"/>
          <path class="nb-ln" d="M40 193.8 L44.4 191.9 M52 193.8 L47.6 191.9 M43.5 202.6 H48.5"/>
          <path class="nb-fl" d="M60 214 V206 Q61 198 72 197 H150 Q167 197 168 214 Z"/>
        </g>
        <g data-k="bub"><circle class="nb-bub" cx="62" cy="181" r="2.6"/><circle class="nb-bub" cx="75" cy="169" r="4"/><circle class="nb-bub" cx="90" cy="155" r="5.5"/>
          <rect class="nb-bub" x="104" y="14" width="284" height="136" rx="26"/></g>
        <g data-k="scale">
          <path class="nb-fl" d="M${PX} ${PY} L${PX - 20} 244 H${PX + 20} Z"/><path class="nb-ln" d="M${PX - 44} 245 H${PX + 44}"/>
          ${arm("")}<g class="nb-ok" data-k="win">${arm("G")}</g>
          <circle class="nb-fl" cx="${PX}" cy="${PY}" r="5"/>
        </g>
        ${GREENS.map((_, j) => `<text class="nb-num" data-k="n${j}" x="${RX(j)}" y="135">${j + 1}</text>`).join("")}
        <g data-k="n9"><path class="nb-br" d="M${RX(0) - 16} 143 V149 H${RX(8) + 16} V143 M${mid} 149 V154"/>
          <text class="nb-of" x="${mid}" y="181">${T.of10}</text><text class="nb-lk" x="${mid}" y="198">${T.liked}</text></g>
        <g data-k="big"><g class="nb-big"><path class="o" d="${BIG}"/>
          <circle cx="-62" cy="0" r="17"/><circle class="e" cx="-68" cy="-4" r="2"/><circle class="e" cx="-56" cy="-4" r="2"/><path class="m" d="M-70 10 Q-62 3 -54 10"/>
          <text x="27" y="8">${T.quote}</text></g></g>
        ${GREENS.map(card).join("")}${card(RED)}
        <g class="nb-tag" data-k="tag"><rect x="${267 - T.tagW / 2}" y="178" width="${T.tagW}" height="24" rx="12"/><path d="M260 179.4 L267 171 L274 179.4"/>
          <text x="267" y="194.5">${T.quote}</text></g>
        <g data-k="warn">
          <g class="nb-dz" data-k="dz"><rect x="${x0 - 8}" y="-30" width="${W + 16}" height="21" rx="10.5"/>
            <path d="M${x0 + 7} -25 L${x0 + 13.5} -13.5 H${x0 + .5} Z M${x0 + 7} -21.8 V-18.4"/><circle cx="${x0 + 7}" cy="-15.9" r="1"/>
            <text x="${x0 + 19}" y="-15">${T.danger}</text></g>
          <path class="nb-strike" data-k="strike" pathLength="1" stroke-dasharray="1 1" d="M${x0 - 12} -19.5 H${x0 + W + 12}"/>
          <text class="nb-op" data-k="op1" x="0" y="-39">${T.opinion}</text>
        </g>
        <g data-k="note"><g class="nb-note"><path d="M${-T.noteW / 2} -15 H${T.noteW / 2} V7 L${T.noteW / 2 - 8} 15 H${-T.noteW / 2} Z"/>
          <path class="f" d="M${T.noteW / 2} 7 H${T.noteW / 2 - 8} V15"/><text y="4">${T.note}</text></g></g>`;
    },
    S0: { talk: 0, arr: 0, gTone: 0, rTone: 0, rPop: 0, tag: 0, night: 0, bub: 0, toN: 0, big: 0, fade: 0, grow: 0,
      scale: 0, toS: 0, tilt: 0, dz: 0, strike: 0, op1: 0, toL: 0, count: 0, n9: 0, nums: 1, toF: 0, note: 0, win: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const at = (key, x, y, s = 1, r = 0) => k(key).setAttribute("transform",
        `translate(${f1(x)} ${f1(y)})${r ? ` rotate(${f1(r)})` : ""}${s !== 1 ? ` scale(${Math.max(.001, s).toFixed(3)})` : ""}`);
      const line = (key, x1, y1, x2, y2) => { const l = k(key); l.setAttribute("x1", f1(x1)); l.setAttribute("y1", f1(y1)); l.setAttribute("x2", f1(x2)); l.setAttribute("y2", f1(y2)); };
      // the talk, then the night
      op("talk", S.talk); op("night", S.night);
      const bs = .85 + .15 * S.bub;
      k("bub").setAttribute("transform", `translate(62 181) scale(${bs.toFixed(3)}) translate(-62 -181)`);
      op("bub", S.bub);
      // the scale
      const E = beam(S.tilt), tL = E.yl - STEM, tR = E.yr - STEM;
      op("scale", S.scale);
      for (const g of ["", "G"]) {
        line("beam" + g, E.xl, E.yl, E.xr, E.yr);
        line("stL" + g, E.xl, E.yl, E.xl, tL + 2); line("stR" + g, E.xr, E.yr, E.xr, tR + 2);
        at("trL" + g, E.xl, tL); at("trR" + g, E.xr, tR);
      }
      op("win", S.win);
      // the ten cards: arrive, then move from layout to layout
      let n = 0;
      for (let i = 0; i < 10; i++) {
        const red = i === RED, j = red ? 9 : GREENS.indexOf(i);
        const gx = GX[i % 5], gy = GY[i / 5 | 0];
        const ta = cl((S.arr - i * .08) / .28), ea = out(ta);
        if (ta >= .7) n++;
        let x = lerp(424, gx, ea), y = lerp(gy - 36, gy, ea), s = 1;
        const r = 18 * (1 - ea);
        if (red) s *= 1 + .2 * Math.sin(Math.PI * S.rPop);
        const go = (p, [tx, ty, ts]) => { x = lerp(x, tx, p); y = lerp(y, ty, p); s = lerp(s, ts, p); };
        const stg = (v, d) => io(cl((v - j * d) / (1 - 9 * d)));
        go(red ? io(S.toN) : stg(S.toN, .04),
          red ? [BX, BY, 1.8] : [j < 5 ? 236 + 30 * j : 251 + 30 * (j - 5), (j < 5 ? 200 : 228) + 6 * S.fade, .6]);
        go(red ? io(S.toS) : stg(S.toS, .04), red ? [E.xr, tR - 23 * 1.5, 1.5] : stack(j, E.xl, tL, .6));
        go(stg(S.toL, .03), [RX(j), RY, .75]);
        go(stg(S.toF, .03), red ? [E.xr, tR - 23 * .55, .55] : stack(j, E.xl, tL, .7));
        at("c" + i, x, y, s, r);
        let o = cl(ta * 3), tone;
        if (red) { o *= (1 - cl(S.big)) * (1 - cl(S.note)); tone = S.rTone; }
        else {
          const fd = S.fade * (1 - cl(S.count - j));
          o *= 1 - .72 * fd; tone = cl((S.gTone - j * .06) / .52) * (1 - .6 * fd);
        }
        op("c" + i, o); op("co" + i, tone); op("fc" + i, tone); op("fn" + i, 1 - tone);
      }
      k("cnt").textContent = n ? T.count(n) : "";
      op("cnt", S.talk);
      op("tag", S.tag);
      k("tag").setAttribute("transform", `translate(0 ${f1(6 * (1 - cl(S.tag)))})`);
      // the one, filling your head
      at("big", BX, BY, (.55 + .45 * S.big) * (1 + .08 * S.grow)); op("big", S.big);
      // the alarm, crossed out
      at("warn", E.xr, tR - 23 * 1.5 - 25.5);
      op("dz", S.dz * (1 - .3 * S.strike));
      k("strike").style.strokeDashoffset = (1 - S.strike).toFixed(3); op("strike", S.strike > 0 ? S.dz : 0);
      op("op1", S.op1);
      // counting
      GREENS.forEach((_, j) => op("n" + j, cl((S.count - j) * 2) * S.nums));
      op("n9", S.n9);
      // the useful point, as a small note
      at("note", E.xr, tR - 17, .6 + .4 * S.note); op("note", S.note);
    },
    beats: [
      { steps: [{ to: { talk: 1 }, ms: 500, sfx: "pluck" }, { wait: 250 }, { to: { arr: 1 }, ms: 2400, ease: "lin", sfx: "tick" }], hold: 2200 },
      { steps: [{ to: { gTone: 1 }, ms: 1000, ease: "lin" }, { wait: 250 }, { to: { rTone: 1, rPop: 1 }, ms: 350, sfx: "pop" },
        { to: { tag: 1 }, ms: 400, ease: "out" }] },
      { steps: [{ to: { talk: 0, tag: 0 }, ms: 400 }, { to: { night: 1 }, ms: 500 }, { to: { bub: 1 }, ms: 450, ease: "out" },
        { to: { toN: 1 }, ms: 1100, ease: "lin" }, { to: { big: 1 }, ms: 450, ease: "out", sfx: "thud" }] },
      { steps: [{ to: { fade: 1, grow: 1 }, ms: 1400, ease: "inOut", sfx: "whoosh" }], hold: 2400 },
      { steps: [{ to: { night: 0, bub: 0, big: 0 }, ms: 450 }, { to: { scale: 1 }, ms: 400 }, { to: { toS: 1 }, ms: 1000, ease: "lin" },
        { to: { tilt: 12 }, ms: 800, ease: "out", sfx: "spring" }] },
      { steps: [{ to: { dz: 1 }, ms: 400, ease: "out" }, { wait: 900 }, { to: { strike: 1 }, ms: 350, sfx: "tick" }, { to: { op1: 1 }, ms: 400 }], hold: 2800 },
      { steps: [{ to: { dz: 0, op1: 0, scale: 0 }, ms: 450 }, { to: { toL: 1 }, ms: 1000, ease: "lin" }, { to: { tilt: 0 } },
        { to: { count: 9 }, ms: 1800, ease: "lin", sfx: "scribble" }, { to: { n9: 1 }, ms: 400, ease: "out" }], hold: 2800 },
      { steps: [{ to: { n9: 0, nums: 0 }, ms: 350 }, { to: { scale: 1 }, ms: 400 }, { to: { toF: 1 }, ms: 1000, ease: "lin" },
        { to: { note: 1 }, ms: 450, ease: "out" }, { to: { tilt: -10 }, ms: 900, ease: "out", sfx: "chime" }, { to: { win: 1 }, ms: 500 }], hold: 4200 }
    ]
  };
})();
