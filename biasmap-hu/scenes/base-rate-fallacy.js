/* Base rate fallacy: a quiet stranger reads poetry on a train. Librarian or salesperson?
   The details say librarian, but there are about 20 salespeople for every librarian, so even
   if only a few of them read poetry, most poetry readers work in sales. Counts are illustrative.
   Scene for anim.js. */
(function () {
  const KEY = "base-rate-fallacy", P = `.bp[data-scene="${KEY}"]`;
  const BW = 126, BT = 38, CH = 26, BH = 162;        // group boxes: width, top, card height, full height
  const LX = 130, SX = 264;                           // left edges: librarians, sales
  const LC = LX + BW / 2, SC = SX + BW / 2;           // their centres
  const SALES = Array.from({ length: 20 }, (_, i) => [SX + 17 + (i % 5) * 23, 94 + Math.floor(i / 5) * 31]);
  const LIB = [LC, 141];                              // the one librarian, in the middle of the box
  const READ = [1, 8, 12, 16];                        // the salespeople who read poetry (inner columns)
  const TQ = 156, TP = 178, LINKY = BT + 13;          // tags under the table, where their links enter the card
  const RA = 219, RB = 243;                           // rows under the boxes: how many, how many read poetry
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const back = p => 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2);

  // a small person (head and shoulders) standing on (0, 0), and the open book a reader holds
  const bust = `<path d="M-6.5 0 V-5 Q-6.5 -12 0 -12 Q6.5 -12 6.5 -5 V0 Z"/><circle cy="-17.5" r="4.6"/>`;
  const book = `<path d="M-6.4 -7.6 L-0.7 -6.2 V-1.4 L-6.4 -2.8 Z M6.4 -7.6 L0.7 -6.2 V-1.4 L6.4 -2.8 Z"/>`;
  const fig = (key, [x, y], reader) => `<g transform="translate(${x} ${y})"><circle class="br-ring" data-k="${key}r" cy="-10.5" r="0"/>` +
    `<g data-k="${key}"><g class="br-f">${bust}</g>${reader ? `<g class="br-bk" data-k="${key}b">${book}</g>` : ""}</g></g>`;
  const box = (key, x, label) => `<g data-k="${key}">
      <rect class="br-box" data-k="${key}r" x="${x}" y="${BT}" width="${BW}" height="${CH}" rx="8"/>
      <rect class="br-pick" data-k="${key}p" x="${x}" y="${BT}" width="${BW}" height="${CH}" rx="8"/>
      <rect class="br-won" data-k="${key}w" x="${x}" y="${BT}" width="${BW}" height="${BH}" rx="8"/>
      <line class="br-sep" data-k="${key}s" x1="${x + 8}" y1="${BT + CH}" x2="${x + BW - 8}" y2="${BT + CH}"/>
      <text class="br-hd" x="${x + BW / 2}" y="${BT + 17.5}">${label}</text>
      <text class="br-qm" data-k="${key}q" x="${x + BW / 2}" y="${BT + CH + 78}">?</text></g>`;
  const tag = (key, y, text) => `<g class="br-tag" data-k="${key}"><rect data-k="${key}r" x="14" y="${y}" height="17" rx="8.5"/>` +
    `<text data-k="${key}t" x="22" y="${y + 12}">${text}</text></g>`;
  const step = (key, y, n, text) => `<g class="br-step" data-k="${key}"><circle cx="20" cy="${y - 4}" r="7"/>` +
    `<text class="n" x="20" y="${y - 0.6}">${n}</text><text class="t" x="31" y="${y}">${text}</text></g>`;

  window.BiasAnim.SCENES[KEY] = {
    q: "tmi", viewBox: "0 0 400 272",
    css: `
      ${P} [data-k="scene"] *{vector-effect:non-scaling-stroke}
      ${P} .br-win{fill:var(--ground);stroke:var(--muted);stroke-width:1.8}
      ${P} .br-hill{fill:none;stroke:var(--faint);stroke-width:1.6;stroke-linecap:round}
      ${P} .br-seat{fill:var(--surface-2);stroke:var(--muted);stroke-width:1.8}
      ${P} .br-you path,${P} .br-you circle{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round}
      ${P} .br-you .e{fill:var(--ink);stroke:none}
      ${P} .br-page{fill:var(--surface);stroke:var(--ink);stroke-width:1.8;stroke-linejoin:round}
      ${P} .br-verse{fill:none;stroke:var(--q);stroke-width:1.3;stroke-linecap:round}
      ${P} .br-table{fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linecap:round}
      ${P} .br-tag rect{fill:var(--surface);stroke:var(--q);stroke-width:1.6}
      ${P} .br-tag text{font:500 10px var(--mono);fill:var(--q)}
      ${P} .br-link{fill:none;stroke:var(--q);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .br-box{fill:var(--surface);stroke:var(--muted);stroke-width:1.6}
      ${P} .br-pick{fill:var(--q);fill-opacity:.12;stroke:var(--q);stroke-width:2.2}
      ${P} .br-won{fill:none;stroke:var(--good);stroke-width:2.2}
      ${P} .br-sep{stroke:var(--rule);stroke-width:1.4}
      ${P} .br-hd{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .br-qm{font:700 30px var(--display);fill:var(--faint);text-anchor:middle}
      ${P} .br-f path,${P} .br-f circle{fill:var(--surface);stroke:var(--ink);stroke-width:1.7;stroke-linejoin:round}
      ${P} .br-bk path{fill:var(--q);fill-opacity:.35;stroke:var(--q);stroke-width:1.2;stroke-linejoin:round}
      ${P} .br-ring{fill:var(--q);fill-opacity:.16;stroke:var(--q);stroke-width:1.6}
      ${P} .br-num{font:700 15px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .br-num.g{fill:var(--good)}
      ${P} .br-rd{font:500 10px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .br-band{fill:var(--good);fill-opacity:.1}
      ${P} .br-step circle{fill:none;stroke:var(--good);stroke-width:1.6}
      ${P} .br-step .n{font:700 9.5px var(--mono);fill:var(--good);text-anchor:middle}
      ${P} .br-step .t{font:600 11px var(--display);fill:var(--good)}
      ${P} .br-chip rect,${P} .br-chip .pt{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}
      ${P} .br-chip text{font:600 11px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .br-chip.ok rect,${P} .br-chip.ok .pt{stroke:var(--good)}
      ${P} .br-chip.ok text{fill:var(--good);text-anchor:start}
      ${P} .br-chip.ok .ck{fill:none;stroke:var(--good);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    `,
    text: {
      hu: {
        name: "Alaparány-tévedés", shareTitle: "Az alaparány-tévedés, 30 másodpercben",
        ecline: "Az élénk részletek elrejtenek egy egyszerű tényt: mennyire gyakori az egyes lehetőség. Onnan indulj.",
        lib: "Könyvtáros", sales: "Eladó", quiet: "csendes", poetry: "költészet",
        bet: "a te fogadásod", win: "jobb tét", readL: "1 olvas költészetet", readS: "4 olvas költészetet",
        common: "mennyire gyakori?", details: "részletek",
        caps: [
          "Egy vonaton csendes idegen <b>verset</b> olvas.",
          "Könyvtáros vagy eladó? A <b>könyvtárosra</b> tennéd.",
          "<b>Illik a képbe</b>. A részletek meggyőzőnek tűnnek.",
          "De <b>hányan</b> vannak mindkét csoportból?",
          "Minden könyvtárosra körülbelül <b>20 eladó</b> jut.",
          "Kevesen olvasnak verset, mégis <b>4:1</b> az eladók javára.",
          "<b>A megoldás:</b> először azt kérdezd, mennyire gyakori az egyes csoport.",
          "Aztán mérlegeld a részleteket. <b>Az eladó a jobb tét.</b>"
        ],
        say: [
          "Egy vonaton csendes idegen verset olvas.",
          "Könyvtáros vagy eladó? A könyvtárosra tennéd.",
          "Illik a képbe. A részletek meggyőzőnek tűnnek.",
          "De hányan vannak mindkét csoportból?",
          "Minden könyvtárosra körülbelül húsz eladó jut.",
          "Kevesen olvasnak verset, de ez négy versolvasó egy ellen. Az idegen nagyobb valószínűséggel eladó.",
          "A megoldás: először azt kérdezd, mennyire gyakori az egyes csoport.",
          "Aztán mérlegeld a részleteket. Az eladó a jobb tét.",
          "Alaparány-tévedés. Az élénk részletek elrejtenek egy egyszerű tényt: mennyire gyakori az egyes lehetőség."
        ]
      },
      en: {
        name: "Base rate fallacy", shareTitle: "Base rate fallacy, explained in 30 seconds",
        ecline: "Vivid details hide a plain fact: how common each option is. Start from that.",
        lib: "Librarian", sales: "Salesperson", quiet: "quiet", poetry: "poetry",
        bet: "your bet", win: "better bet", readL: "1 reads poetry", readS: "4 read poetry",
        common: "how common?", details: "details",
        caps: [
          "On a train, a quiet stranger is reading <b>poetry</b>.",
          "Librarian or salesperson? You'd bet <b>librarian</b>.",
          "They <b>fit the picture</b>. The details feel convincing.",
          "But <b>how many</b> of each are there?",
          "For every librarian, there are about <b>20 salespeople</b>.",
          "Few of them read poetry, yet it's <b>4 to 1</b> for sales.",
          "<b>The fix:</b> first ask how common each group is.",
          "Then weigh the details. <b>Sales is the better bet.</b>"
        ],
        say: [
          "On a train, a quiet stranger is reading poetry.",
          "Librarian or salesperson? You'd bet librarian.",
          "They fit the picture. The details feel convincing.",
          "But how many of each are there?",
          "For every librarian, there are about twenty salespeople.",
          "Few of them read poetry, yet that's four readers to one. The stranger is more likely in sales.",
          "The fix: first ask how common each group is.",
          "Then weigh the details. Sales is the better bet.",
          "Base rate fallacy. Vivid details hide a plain fact: how common each option is. Start from that."
        ]
      },
      el: {
        name: "Πλάνη του βασικού ποσοστού", shareTitle: "Η πλάνη του βασικού ποσοστού σε 30 δευτερόλεπτα",
        ecline: "Οι εντυπωσιακές λεπτομέρειες κρύβουν κάτι απλό: πόσο συχνή είναι κάθε περίπτωση. Ξεκίνα\u00a0από\u00a0εκεί.",
        lib: "Βιβλιοθηκονόμος", sales: "Στις πωλήσεις", quiet: "ήσυχο άτομο", poetry: "ποίηση",
        bet: "το στοίχημά σου", win: "καλύτερο στοίχημα", readL: "1 διαβάζει ποίηση", readS: "4 διαβάζουν ποίηση",
        common: "πόσα άτομα;", details: "λεπτομέρειες",
        caps: [
          "Στο τρένο, ένα ήσυχο άτομο απέναντί σου διαβάζει <b>ποίηση</b>.",
          "Είναι βιβλιοθηκονόμος ή δουλεύει στις πωλήσεις; Θα έλεγες <b>βιβλιοθηκονόμος</b>.",
          "Ταιριάζει <b>απόλυτα στο προφίλ</b>. Οι λεπτομέρειες σε πείθουν.",
          "Πόσο μεγάλη είναι όμως <b>κάθε ομάδα</b>;",
          "Για κάθε βιβλιοθηκονόμο, περίπου <b>20 άτομα</b> δουλεύουν στις πωλήσεις.",
          "Ακόμα κι αν μόνο λίγοι διαβάζουν ποίηση, είναι <b>4 προς 1</b> υπέρ των πωλήσεων.",
          "<b>Η λύση:</b> αναρωτήσου πρώτα πόσο μεγάλη είναι κάθε ομάδα.",
          "Μετά ζύγισε τις λεπτομέρειες. <b>Οι\u00a0πωλήσεις είναι καλύτερο στοίχημα.</b>"
        ],
        say: [
          "Στο τρένο, ένα ήσυχο άτομο απέναντί σου διαβάζει ποίηση.",
          "Είναι βιβλιοθηκονόμος ή δουλεύει στις πωλήσεις; Θα έλεγες βιβλιοθηκονόμος.",
          "Ταιριάζει απόλυτα στο προφίλ. Οι λεπτομέρειες σε πείθουν.",
          "Πόσο μεγάλη είναι όμως κάθε ομάδα;",
          "Για κάθε βιβλιοθηκονόμο, περίπου είκοσι άτομα δουλεύουν στις πωλήσεις.",
          "Ακόμα κι αν μόνο λίγοι διαβάζουν ποίηση, είναι τέσσερα προς ένα υπέρ των πωλήσεων. Το άτομο στο τρένο μάλλον δουλεύει στις πωλήσεις.",
          "Η λύση: αναρωτήσου πρώτα πόσο μεγάλη είναι κάθε ομάδα.",
          "Μετά ζύγισε τις λεπτομέρειες. Οι πωλήσεις είναι καλύτερο στοίχημα.",
          "Πλάνη του βασικού ποσοστού. Οι εντυπωσιακές λεπτομέρειες κρύβουν κάτι απλό: πόσο συχνή είναι κάθε περίπτωση. Ξεκίνα από εκεί."
        ]
      },
      es: {
        name: "Falacia de la tasa base", shareTitle: "La falacia de la tasa base en 30 segundos",
        ecline: "Los detalles llamativos esconden un dato sencillo: lo común que es cada opción. Empieza por ahí.",
        lib: "Bibliotecario", sales: "Vendedor", quiet: "en silencio", poetry: "poesía",
        bet: "tu apuesta", win: "mejor apuesta", readL: "1 lee poesía", readS: "4 leen poesía",
        common: "¿cuántos hay?", details: "detalles",
        caps: [
          "En un tren, alguien callado está leyendo <b>poesía</b>.",
          "¿Bibliotecario o vendedor? Apostarías por <b>bibliotecario</b>.",
          "<b>Encaja en el perfil</b>. Los detalles te convencen.",
          "Pero ¿<b>cuántos</b> hay de cada uno?",
          "Por cada bibliotecario hay unos <b>20 vendedores</b>.",
          "Pocos de ellos leen poesía, pero aun así es <b>4 a 1</b> a favor de los vendedores.",
          "<b>La solución:</b> pregúntate primero cuántos hay de cada grupo.",
          "Luego sopesa los detalles. <b>Vendedor es mejor apuesta.</b>"
        ],
        say: [
          "En un tren, alguien callado está leyendo poesía.",
          "¿Bibliotecario o vendedor? Apostarías por bibliotecario.",
          "Encaja en el perfil. Los detalles te convencen.",
          "Pero ¿cuántos hay de cada uno?",
          "Por cada bibliotecario, hay unos veinte vendedores.",
          "Pocos de ellos leen poesía, pero aun así son cuatro lectores contra uno. Lo más probable es que se dedique a las ventas.",
          "La solución: pregúntate primero cuántos hay de cada grupo.",
          "Luego sopesa los detalles. Vendedor es mejor apuesta.",
          "Falacia de la tasa base. Los detalles llamativos esconden un dato sencillo: lo común que es cada opción. Empieza por ahí."
        ]
      },
      fr: {
        name: "Négligence du taux de base", shareTitle: "La négligence du taux de base en 30 secondes",
        ecline: "Les détails frappants cachent un fait simple : la fréquence de chaque option. Partez de là.",
        lib: "Bibliothécaire", sales: "Vendeur", quiet: "calme", poetry: "poésie",
        bet: "votre pari", win: "meilleur pari", readL: "1 lit des poèmes", readS: "4 lisent des poèmes",
        common: "combien de chaque ?", details: "détails",
        caps: [
          "Dans un train, une personne calme lit de la <b>poésie</b>.",
          "Bibliothécaire ou vendeur ? Vous pariez sur <b>bibliothécaire</b>.",
          "Elle <b>colle au portrait</b>. Les détails semblent convaincants.",
          "Mais <b>combien</b> y en a-t-il de chaque ?",
          "Pour un bibliothécaire, il y a environ <b>20 vendeurs</b>.",
          "Peu lisent de la poésie, mais c’est <b>4 contre 1</b> pour les vendeurs.",
          "<b>La solution :</b> demandez-vous d’abord la taille de chaque groupe.",
          "Puis pesez les détails. <b>Vendeur est le meilleur pari.</b>"
        ],
        say: [
          "Dans un train, une personne calme lit de la poésie.",
          "Bibliothécaire ou vendeur ? Vous pariez sur bibliothécaire.",
          "Elle colle au portrait. Les détails semblent convaincants.",
          "Mais combien y en a-t-il de chaque ?",
          "Pour un bibliothécaire, il y a environ vingt vendeurs.",
          "Peu d’entre eux lisent de la poésie, mais ça fait quand même quatre lecteurs contre un. Cette personne est plus probablement dans la vente.",
          "La solution : demandez-vous d’abord la taille de chaque groupe.",
          "Puis pesez les détails. Vendeur est le meilleur pari.",
          "La négligence du taux de base. Les détails frappants cachent un fait simple : la fréquence de chaque option. Partez de là."
        ]
      },
      de: {
        name: "Basisratenfehler", shareTitle: "Der Basisratenfehler in 30 Sekunden",
        ecline: "Lebhafte Details verdecken eine schlichte Tatsache: wie häufig jede Möglichkeit ist. Fang dort an.",
        lib: "Bibliothekar", sales: "Verkäufer", quiet: "still", poetry: "Gedichte",
        bet: "dein Tipp", win: "besserer Tipp", readL: "1 liest Gedichte", readS: "4 lesen Gedichte",
        common: "wie häufig?", details: "Details",
        caps: [
          "Im Zug sitzt jemand ganz still und liest <b>Gedichte</b>.",
          "Bibliothekar oder Verkäufer? Du tippst auf <b>Bibliothekar</b>.",
          "Das <b>passt ins Bild</b>. Die Details wirken überzeugend.",
          "Aber <b>wie viele</b> gibt es jeweils?",
          "Auf jeden Bibliothekar kommen etwa <b>20 Verkäufer</b>.",
          "Nur wenige lesen Gedichte, und doch steht es <b>4 zu 1</b> für den Verkauf.",
          "<b>Die Lösung:</b> Frag zuerst, wie häufig jede Gruppe ist.",
          "Dann gewichte die Details. <b>Verkäufer ist der bessere Tipp.</b>"
        ],
        say: [
          "Im Zug sitzt jemand ganz still und liest Gedichte.",
          "Bibliothekar oder Verkäufer? Du tippst auf Bibliothekar.",
          "Das passt ins Bild. Die Details wirken überzeugend.",
          "Aber wie viele gibt es jeweils?",
          "Auf jeden Bibliothekar kommen etwa zwanzig Verkäufer.",
          "Nur wenige von ihnen lesen Gedichte, und doch sind das vier Leser zu einem. Die Person arbeitet eher im Verkauf.",
          "Die Lösung: Frag zuerst, wie häufig jede Gruppe ist.",
          "Dann gewichte die Details. Verkäufer ist der bessere Tipp.",
          "Der Basisratenfehler. Lebhafte Details verdecken eine schlichte Tatsache: wie häufig jede Möglichkeit ist. Fang dort an."
        ]
      },
      it: {
        name: "Fallacia del tasso di base", shareTitle: "La fallacia del tasso di base in 30 secondi",
        ecline: "I dettagli vividi nascondono un fatto semplice: quanto è comune ogni opzione. Parti da lì.",
        lib: "Bibliotecario", sales: "Venditore", quiet: "in silenzio", poetry: "poesia",
        bet: "la tua scommessa", win: "scommessa migliore", readL: "1 legge poesie", readS: "4 leggono poesie",
        common: "quanti ce ne sono?", details: "dettagli",
        caps: [
          "In treno, una persona silenziosa sta leggendo <b>poesie</b>.",
          "Bibliotecario o venditore? Scommetteresti sul <b>bibliotecario</b>.",
          "Il profilo <b>calza a pennello</b>. I dettagli sembrano convincenti.",
          "Ma <b>quanti</b> ce ne sono di ciascuno?",
          "Per ogni bibliotecario ci sono circa <b>20 venditori</b>.",
          "Pochi leggono poesie, eppure è <b>4 a 1</b> per i venditori.",
          "<b>La soluzione:</b> prima chiediti quanto è comune ogni gruppo.",
          "Poi valuta i dettagli. <b>Conviene puntare sul venditore.</b>"
        ],
        say: [
          "In treno, una persona silenziosa sta leggendo poesie.",
          "Bibliotecario o venditore? Scommetteresti sul bibliotecario.",
          "Il profilo calza a pennello. I dettagli sembrano convincenti.",
          "Ma quanti ce ne sono di ciascuno?",
          "Per ogni bibliotecario ci sono circa venti venditori.",
          "Pochi di loro leggono poesie, eppure sono quattro lettori contro uno. È più probabile che quella persona lavori nelle vendite.",
          "La soluzione: prima chiediti quanto è comune ogni gruppo.",
          "Poi valuta i dettagli. Conviene puntare sul venditore.",
          "Fallacia del tasso di base. I dettagli vividi nascondono un fatto semplice: quanto è comune ogni opzione. Parti da lì."
        ]
      }
    },
    svg(T) {
      const pageR = "M84 116 Q74 112.5 65 117 V134 Q74 129.5 84 133 Z";
      return `
        <g data-k="scene">
          <rect class="br-win" x="14" y="14" width="100" height="48" rx="9"/>
          <path class="br-hill" d="M18 52 Q34 40 50 47 T82 44 Q96 40 110 47 M22 23 H36 M28 29 H46 M20 38 V54 M14 34 Q37 41 60 34 T106 34 M102 38 V54"/>
          <circle class="br-hill" cx="92" cy="30" r="5"/><path class="br-hill" d="M92 35 V46"/>
          <rect class="br-seat" x="38" y="52" width="52" height="94" rx="12"/>
          <g class="br-you">
            <path d="M42 142 V112 Q42 97 64 97 Q86 97 86 112 V142"/>
            <circle cx="64" cy="82" r="10.5"/><circle class="e" cx="60.3" cy="85" r="1.2"/><circle class="e" cx="67.7" cy="85" r="1.2"/>
          </g>
          <path class="br-page" d="M44 116 Q54 112.5 63 117 V134 Q54 129.5 44 133 Z"/>
          <path class="br-page" d="${pageR}"/>
          <path class="br-verse" d="M48 120.5 H58 M49 124.5 H56 M48 128.5 H59 M69 120.5 H79 M70 124.5 H77 M69 128.5 H80"/>
          <path class="br-page" data-k="page" d="${pageR}"/>
          <g class="br-you"><circle cx="43.5" cy="126" r="3.4"/><circle cx="84.5" cy="126" r="3.4"/></g>
          <rect class="br-table" x="12" y="140" width="104" height="6" rx="3"/>
        </g>
        <path class="br-link" data-k="tql" pathLength="1" stroke-dasharray="1 1"/>
        <path class="br-link" data-k="tpl" pathLength="1" stroke-dasharray="1 1"/>
        <path class="br-link" data-k="tah" d="M124.6 ${LINKY - 4} L129 ${LINKY} L124.6 ${LINKY + 4}"/>
        ${tag("tq", TQ, T.quiet)}${tag("tp", TP, T.poetry)}
        ${box("L", LX, T.lib)}${box("S", SX, T.sales)}
        ${fig("fL", LIB, true)}
        ${SALES.map((p, i) => fig("f" + i, p, READ.includes(i))).join("")}
        <rect class="br-band" data-k="bA" x="10" y="203" width="380" height="23" rx="7"/>
        <rect class="br-band" data-k="bB" x="10" y="228" width="380" height="22" rx="7"/>
        <g data-k="cnt"><text class="br-num" x="${LC}" y="${RA}">1</text><text class="br-num" x="${SC}" y="${RA}">20</text></g>
        <g data-k="cntG"><text class="br-num g" x="${LC}" y="${RA}">1</text><text class="br-num g" x="${SC}" y="${RA}">20</text></g>
        <text class="br-rd" data-k="rL" x="${LC}" y="${RB}">${T.readL}</text>
        <text class="br-rd" data-k="rS" x="${SC}" y="${RB}">${T.readS}</text>
        ${step("s1", RA - 1, 1, T.common)}${step("s2", RB, 2, T.details)}
        <g class="br-chip" data-k="bet"><rect data-k="betR" y="11" height="19" rx="9.5"/><path class="pt" d="M-5 29.6 L0 35 L5 29.6"/><text data-k="betT" y="24.3">${T.bet}</text></g>
        <g class="br-chip ok" data-k="win"><rect data-k="winR" y="11" height="19" rx="9.5"/><path class="pt" d="M-5 29.6 L0 35 L5 29.6"/>
          <path class="ck" data-k="winI" d="M-4 0 L-1.3 2.7 L4 -2.8"/><text data-k="winT" y="24.3">${T.win}</text></g>`;
    },
    S0: { scene: 0, home: 0, flip: 0, cards: 0, bet: 0, pick: 0, tags: 0, link: 0, grow: 0, qm: 0, popL: 0, popS: 0, cnt: 0,
      ring: 0, fade: 0, rB: 0, dim: 0, l1: 0, l2: 0, mv: 0, win: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const tw = (key, fb) => { const t = k(key); return t.getComputedTextLength ? t.getComputedTextLength() : fb; };
      const around = (x, y, s) => `translate(${f1(x)} ${f1(y)}) scale(${Math.max(0, s).toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`;

      // the stranger on the train, turning a page
      // (first large in the middle, then it moves aside to make room for the options)
      const vs = 1.5 - .5 * S.home, vx = 200 + (64 - 200) * S.home, vy = 122 + (80 - 122) * S.home;
      k("scene").setAttribute("transform", `translate(${f1(vx - 64 * vs)} ${f1(vy - 80 * vs + (1 - S.scene) * 10)}) scale(${vs.toFixed(3)})`);
      op("scene", S.scene);
      k("page").setAttribute("transform", `translate(64 0) scale(${Math.cos(Math.PI * S.flip).toFixed(3)} 1) translate(-64 0)`);
      op("page", S.flip > 0 && S.flip < 1 ? 1 : 0);

      // the details, and where they point
      const tagOp = S.tags * (1 - .7 * S.dim);
      [["tq", TQ, 32], ["tp", TP, 38]].forEach(([key, y, fb]) => {
        const w = tw(key + "t", fb) + 16, ym = y + 8.5;
        k(key + "r").setAttribute("width", f1(w));
        k(key).setAttribute("transform", `translate(${f1((1 - S.tags) * -8)} 0)`);
        op(key, tagOp);
        const l = k(key + "l");
        l.setAttribute("d", `M${f1(14 + w)} ${ym} H116 Q122 ${ym} 122 ${ym - 6} V${LINKY + 6} Q122 ${LINKY} 128 ${LINKY} H129`);
        l.setAttribute("stroke-dashoffset", (1 - S.link).toFixed(3));
        op(key + "l", S.link > 0 ? 1 - .7 * S.dim : 0);
      });
      op("tah", cl((S.link - .85) / .15) * (1 - .7 * S.dim));

      // two option cards that open into groups
      const h = CH + (BH - CH) * S.grow;
      ["L", "S"].forEach((g, i) => {
        k(g + "r").setAttribute("height", f1(h));
        k(g + "p").setAttribute("height", f1(h));
        k(g).setAttribute("transform", `translate(0 ${f1((1 - S.cards) * 8)})`);
        op(g, S.cards);
        op(g + "s", S.grow * 3);
        op(g + "q", S.qm);
        op(g + "w", i ? S.win : 0);
      });
      op("Lp", S.pick); op("Sp", 0);

      // the people: one librarian, twenty salespeople; readers get a book and a ring
      const pop = (key, p) => k(key).setAttribute("transform", `scale(${(p > 0 ? back(cl(p)) : 0).toFixed(3)})`);
      pop("fL", S.popL);
      SALES.forEach((_, i) => {
        pop("f" + i, (S.popS - i / 20 * .8) / .2);
        if (!READ.includes(i)) k("f" + i).style.opacity = 1 - .5 * S.fade;
      });
      ["fL", ...READ.map(i => "f" + i)].forEach((key, j) => {
        const p = cl((S.ring - j / 5 * .7) / .3), s = p > 0 ? back(p) : 0;
        k(key + "r").setAttribute("r", f1(12 * s));
        const b = k(key + "b");
        b.setAttribute("transform", `translate(0 -4.5) scale(${s.toFixed(3)}) translate(0 4.5)`);
        b.style.opacity = p > 0 ? 1 : 0;
      });

      // under the boxes: how many, and how many read poetry
      op("cnt", S.cnt * (1 - S.l1)); op("cntG", S.l1);
      k("rL").setAttribute("transform", around(LC, RB - 4, .6 + .4 * back(cl(S.rB))));
      k("rS").setAttribute("transform", around(SC, RB - 4, .6 + .4 * back(cl(S.rB))));
      op("rL", S.rB * 2); op("rS", S.rB * 2);

      // the fix: first how common, then the details
      op("bA", S.l1); op("bB", S.l2);
      k("s1").setAttribute("transform", `translate(${f1((1 - S.l1) * -8)} 0)`); op("s1", S.l1);
      k("s2").setAttribute("transform", `translate(${f1((1 - S.l2) * -8)} 0)`); op("s2", S.l2);

      // your bet, then the better bet
      const bx = LC + (SC - LC) * S.mv;
      const w1 = tw("betT", 48) + 20;
      k("betR").setAttribute("x", f1(-w1 / 2)); k("betR").setAttribute("width", f1(w1));
      k("bet").setAttribute("transform", `translate(${f1(Math.min(bx, 390 - w1 / 2))} ${f1((1 - S.bet) * -6)})`);
      op("bet", S.bet * (1 - S.win));
      const wt = tw("winT", 60), w2 = wt + 36, cx = Math.min(bx, 390 - w2 / 2);
      k("winR").setAttribute("x", f1(-w2 / 2)); k("winR").setAttribute("width", f1(w2));
      k("winI").setAttribute("transform", `translate(${f1(-w2 / 2 + 13)} 20.5)`);
      k("winT").setAttribute("x", f1(-w2 / 2 + 23));
      k("win").setAttribute("transform", `translate(${f1(cx)} 0)`);
      k("win").querySelector(".pt").setAttribute("transform", `translate(${f1(bx - cx)} 0)`);
      op("win", S.win);
    },
    beats: [
      { steps: [{ to: { scene: 1 }, ms: 700, sfx: "pluck" }, { wait: 400 }, { to: { flip: 1 }, ms: 800, ease: "inOut" }] },
      { steps: [{ to: { home: 1 }, ms: 700, ease: "inOut" }, { to: { cards: 1 }, ms: 500 }, { wait: 250 }, { to: { bet: 1, pick: 1 }, ms: 450, ease: "out", sfx: "pop" }] },
      { steps: [{ to: { tags: 1 }, ms: 450, sfx: "tick" }, { wait: 150 }, { to: { link: 1 }, ms: 800, ease: "inOut" }] },
      { steps: [{ to: { pick: 0 }, ms: 300 }, { to: { grow: 1 }, ms: 900, ease: "inOut", sfx: "whoosh" }, { to: { qm: 1 }, ms: 400 }] },
      { steps: [{ to: { qm: 0 }, ms: 300 }, { to: { popL: 1 }, ms: 400 }, { to: { popS: 1 }, ms: 1500, ease: "lin", sfx: "tick" }, { to: { cnt: 1 }, ms: 400 }] },
      { steps: [{ to: { ring: 1, fade: 1 }, ms: 1100, ease: "lin", sfx: "pop" }, { wait: 200 }, { to: { rB: 1 }, ms: 600, sfx: "spring" }] },
      { steps: [{ to: { dim: 1, fade: 0 }, ms: 500 }, { to: { l1: 1 }, ms: 600, sfx: "scribble" }] },
      { steps: [{ to: { l2: 1 }, ms: 500 }, { wait: 300 }, { to: { mv: 1 }, ms: 900, ease: "inOut" }, { to: { win: 1 }, ms: 450, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
