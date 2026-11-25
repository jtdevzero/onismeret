/* Survivorship bias: Wald's bombers. Holes on the planes that came back, none on the engines,
   because the planes hit there never came back. Scene for anim.js. */
(function () {
  const KEY = "survivorship-bias", P = `.bp[data-scene="${KEY}"]`;
  const MX = 114, MY = 130, MS = .92;                     // the returned bomber: centre and scale
  const GS = .44, GH = [[272, 82], [338, 136], [272, 190]]; // the planes that didn't return
  const ENG = [-66, -34, 34, 66];                          // engine positions along the wing
  const f1 = n => +n.toFixed(1);
  const clamp = v => Math.max(0, Math.min(1, v));
  const back = p => 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2);

  // A bomber seen from above, nose up, drawn around (cx, cy) at scale s.
  function plane(cx, cy, s) {
    const p = (x, y) => `${f1(cx + x * s)} ${f1(cy + y * s)}`;
    const wing = m => `M${p(6 * m, -21)} L${p(98 * m, -12)} C${p(104 * m, -11.5)} ${p(108 * m, -9)} ${p(108 * m, -5)} L${p(108 * m, -1)} C${p(108 * m, 2)} ${p(105 * m, 3)} ${p(100 * m, 3)} L${p(6 * m, 10)} Z`;
    const stab = m => `M${p(5 * m, 60)} L${p(38 * m, 69)} C${p(41 * m, 70)} ${p(42 * m, 72)} ${p(42 * m, 75)} L${p(42 * m, 78)} C${p(42 * m, 80)} ${p(41 * m, 81)} ${p(38 * m, 81)} L${p(4 * m, 83)} Z`;
    const body = `M${p(0, -66)} C${p(6, -66)} ${p(9, -58)} ${p(9, -48)} L${p(9, 48)} C${p(9, 64)} ${p(5, 82)} ${p(2, 92)} L${p(-2, 92)} C${p(-5, 82)} ${p(-9, 64)} ${p(-9, 48)} L${p(-9, -48)} C${p(-9, -58)} ${p(-6, -66)} ${p(0, -66)} Z`;
    const nac = e => `M${p(e - 5, 5)} L${p(e - 5, -23)} C${p(e - 5, -27)} ${p(e - 3, -29)} ${p(e, -29)} C${p(e + 3, -29)} ${p(e + 5, -27)} ${p(e + 5, -23)} L${p(e + 5, 5)} C${p(e + 5, 8.5)} ${p(e - 5, 8.5)} ${p(e - 5, 5)} Z`;
    const prop = e => `M${p(e - 9, -32)} L${p(e + 9, -32)} M${p(e, -29)} L${p(e, -32)}`;
    return `<path d="${wing(1)}"/><path d="${wing(-1)}"/><path d="${stab(1)}"/><path d="${stab(-1)}"/><path d="${body}"/>` +
      ENG.map(e => `<path d="${nac(e)}"/>`).join("") +
      `<path class="ln" d="${ENG.map(prop).join(" ")}"/><path class="ln thin" d="M${p(-5, -50)} Q${p(0, -55)} ${p(5, -50)} M${p(0, 64)} L${p(0, 89)}"/>`;
  }
  const V = (x, y) => [f1(MX + x * MS), f1(MY + y * MS)];

  // bullet holes on the returned plane: wings, body and tail, never the engines
  const HA = [[-50, -6], [51, -7], [-84, -4], [82, -6], [-3, 22], [4, 40], [-24, 74], [28, 75], [18, -3], [-18, 3]];
  const HB = [[49, 3], [-51, 4], [96, -3], [-97, -4], [0, -26], [-2, 54], [3, 8], [-34, 77], [36, 78], [15, 5], [-15, -6], [86, 2]];
  // engine hits on the planes that didn't return: [ghost, engine x, y]
  const GHIT = [[0, -34, -14], [0, 66, -9], [1, 34, -15], [1, -66, -10], [2, -66, -14], [2, 34, -9]];
  // armour plates: where the holes are -> the engines
  const PLATE = [
    [[73, -11, 28, 13], [61, -29, 10, 37.5]],
    [[-101, -11, 28, 13], [-71, -29, 10, 37.5]],
    [[-7, 14, 14, 34], [29, -29, 10, 37.5]],
    [[-38, 71, 76, 9], [-39, -29, 10, 37.5]]
  ];

  window.BiasAnim.SCENES[KEY] = {
    q: "nem", viewBox: "0 0 400 272",
    css: `
      ${P} .sv-pl path{fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
      ${P} .sv-pl .ln{fill:none;stroke-width:2.2}
      ${P} .sv-pl .thin{stroke-width:1.4}
      ${P} .sv-gh{opacity:.8}
      ${P} .sv-gh path{fill:var(--ground);stroke:var(--muted);stroke-width:1.5;stroke-linejoin:round;stroke-linecap:round}
      ${P} .sv-gh .ln{fill:none;stroke-width:1.5}
      ${P} .sv-gh .thin{stroke-width:1}
      ${P} .sv-slot path{fill:var(--ground);stroke:var(--faint);stroke-width:1.2;stroke-dasharray:4 2.5;stroke-linejoin:round;stroke-linecap:round}
      ${P} .sv-slot .ln{fill:none}
      ${P} .sv-hit{fill:var(--bad)}
      ${P} .sv-plate .g{fill:var(--muted);fill-opacity:.35;stroke:var(--muted);stroke-width:1.4}
      ${P} .sv-plate .ok{fill:var(--good);fill-opacity:.35;stroke:var(--good);stroke-width:2.2}
      ${P} .sv-ring{fill:var(--q);fill-opacity:.28}
      ${P} .sv-tag line{stroke:var(--ink);stroke-width:1.4}
      ${P} .sv-tag rect{fill:var(--surface);stroke:var(--ink);stroke-width:1.6}
      ${P} .sv-tag .qm{font:700 15px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .sv-hd{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .sv-hd.m{fill:var(--muted)}
      ${P} .sv-lb{font:500 10px var(--mono);fill:var(--muted)}
      ${P} .sv-nt{font:500 10px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .sv-nt.ok{fill:var(--good)}
      ${P} .sv-nt.end{text-anchor:end;fill:var(--muted)}
      ${P} .sv-lens circle{fill:var(--q);fill-opacity:.07;stroke:var(--q);stroke-width:2.4}
      ${P} .sv-lens line{stroke:var(--q);stroke-width:5;stroke-linecap:round}
    `,
    text: {
      hu: {
        name: "Túlélési torzítás", shareTitle: "A túlélési torzítás, 30 másodpercben",
        ecline: "Csak azt látod, ami túlélte. Mielőtt következtetéseket vonnál le, kérdezd meg, mi hiányzik.",
        legend: "találatok a visszatérő gépeken", armour: "páncél", back: "Visszatért", lost: "Nem tért vissza",
        noHoles: "nincs lyuk", missing: "hiányzó adat", armourHere: "itt van a páncél",
        caps: [
          "A második világháborúban a bombázók golyólyukakkal tele térnek vissza a küldetésekről.",
          "A mérnökök feljegyzik, hol találták el a <b>visszatérő gépeket</b>.",
          "A kézenfekvő ötlet: páncélozni kell <b>ott, ahol a lyukak vannak</b>.",
          "De ezek csak azok a gépek, <b>amelyek visszaértek</b>.",
          "Akiket a motorjukban találtak el, <b>ritkán tértek vissza</b>, hogy megszámolják őket.",
          "Ahol nincs lyuk, ott a találat <b>végzetes</b>.",
          "<b>A megoldás:</b> kérdezd meg, mi hiányzik az adataidból.",
          "Páncélozd a motorokat. Tanulmányozd a kudarcokat, <b>nem csak a túlélőket</b>."
        ],
        say: [
          "A második világháborúban a bombázók golyólyukakkal tele térnek vissza a küldetésekről.",
          "A mérnökök feljegyzik, hol találták el a visszatérő gépeket.",
          "A kézenfekvő ötlet: páncélozni kell ott, ahol a lyukak vannak.",
          "De ezek csak azok a gépek, amelyek visszaértek.",
          "Akiket a motorjukban találtak el, ritkán tértek vissza, hogy megszámolják őket.",
          "Ahol nincs lyuk, ott a találat végzetes.",
          "A megoldás: kérdezd meg, mi hiányzik az adataidból.",
          "Páncélozd a motorokat. Tanulmányozd a kudarcokat, nem csak a túlélőket.",
          "A túlélési torzítás. Csak azt látod, ami túlélte. Mielőtt következtetéseket vonnál le, kérdezd meg, mi hiányzik."
        ]
      },
      en: {
        name: "Survivorship bias", shareTitle: "Survivorship bias, explained in 30 seconds",
        ecline: "You only see what survived. Ask what's missing before you draw conclusions.",
        legend: "hits on returning planes", armour: "armour", back: "Returned", lost: "Didn't return",
        noHoles: "no holes", missing: "missing data", armourHere: "armour here",
        caps: [
          "In WWII, bombers come back from missions riddled with <b>bullet holes</b>.",
          "Engineers map where the <b>returning planes</b> were hit.",
          "The obvious idea: add armour <b>where the holes are</b>.",
          "But these are only the planes <b>that made it back</b>.",
          "Planes hit in the engines <b>rarely came back</b> to be counted.",
          "The spots with no holes are where a hit is <b>fatal</b>.",
          "<b>The fix:</b> ask what's missing from your data.",
          "Armour the engines. Study the failures, <b>not only the survivors</b>."
        ],
        say: [
          "In the Second World War, bombers come back from their missions riddled with bullet holes.",
          "Engineers map where the returning planes were hit.",
          "The obvious idea: add armour where the holes are.",
          "But these are only the planes that made it back.",
          "Planes hit in the engines rarely came back to be counted.",
          "The spots with no holes are where a hit is fatal.",
          "The fix: ask what's missing from your data.",
          "Armour the engines. Study the failures, not only the survivors.",
          "Survivorship bias. You only see what survived. Ask what's missing before you draw conclusions."
        ]
      },
      el: {
        name: "Μεροληψία επιβίωσης", shareTitle: "Η μεροληψία επιβίωσης σε 30 δευτερόλεπτα",
        ecline: "Βλέπεις μόνο ό,τι επέζησε. Πριν βγάλεις συμπεράσματα, αναρωτήσου τι λείπει.",
        legend: "χτυπήματα σε όσα γύρισαν", armour: "θωράκιση", back: "Γύρισαν", lost: "Δεν γύρισαν",
        noHoles: "καμία τρύπα", missing: "δεδομένα που λείπουν", armourHere: "θωράκιση εδώ",
        caps: [
          "Στον Δεύτερο Παγκόσμιο, τα βομβαρδιστικά γυρίζουν γεμάτα <b>τρύπες από σφαίρες</b>.",
          "Οι μηχανικοί σημειώνουν πού χτυπήθηκαν τα αεροπλάνα <b>που γύρισαν</b>.",
          "Η προφανής ιδέα: θωράκιση <b>εκεί που είναι οι τρύπες</b>.",
          "Όμως αυτά είναι μόνο όσα <b>κατάφεραν να γυρίσουν</b>.",
          "Όσα χτυπήθηκαν στις μηχανές <b>σπάνια γύριζαν</b> για να μετρηθούν.",
          "Όπου δεν βλέπεις τρύπες, ένα χτύπημα είναι <b>μοιραίο</b>.",
          "<b>Η λύση:</b> αναρωτήσου τι λείπει από τα δεδομένα σου.",
          "Θωράκισε τις μηχανές. Μελέτησε και όσα χάθηκαν, <b>όχι μόνο όσα επέζησαν</b>."
        ],
        say: [
          "Στον Δεύτερο Παγκόσμιο Πόλεμο, τα βομβαρδιστικά γυρίζουν από τις αποστολές γεμάτα τρύπες από σφαίρες.",
          "Οι μηχανικοί σημειώνουν πού χτυπήθηκαν τα αεροπλάνα που γύρισαν.",
          "Η προφανής ιδέα: θωράκιση εκεί που είναι οι τρύπες.",
          "Όμως αυτά είναι μόνο όσα κατάφεραν να γυρίσουν.",
          "Όσα χτυπήθηκαν στις μηχανές σπάνια γύριζαν για να μετρηθούν.",
          "Όπου δεν βλέπεις τρύπες, ένα χτύπημα είναι μοιραίο.",
          "Η λύση: αναρωτήσου τι λείπει από τα δεδομένα σου.",
          "Θωράκισε τις μηχανές. Μελέτησε και όσα χάθηκαν, όχι μόνο όσα επέζησαν.",
          "Μεροληψία επιβίωσης. Βλέπεις μόνο ό,τι επέζησε. Πριν βγάλεις συμπεράσματα, αναρωτήσου τι λείπει."
        ]
      },
      es: {
        name: "Sesgo de supervivencia", shareTitle: "El sesgo de supervivencia en 30 segundos",
        ecline: "Solo ves lo que sobrevivió. Pregúntate qué falta antes de sacar conclusiones.",
        legend: "impactos en los que volvieron", armour: "blindaje", back: "Volvieron", lost: "No volvieron",
        noHoles: "sin agujeros", missing: "datos que faltan", armourHere: "blindaje aquí",
        caps: [
          "En la Segunda Guerra Mundial, los bombarderos vuelven de sus misiones llenos de <b>agujeros de bala</b>.",
          "Los ingenieros marcan dónde recibieron impactos <b>los aviones que vuelven</b>.",
          "La idea obvia: blindar <b>donde están los agujeros</b>.",
          "Pero son solo los aviones <b>que lograron volver</b>.",
          "Los que recibían impactos en los motores <b>rara vez volvían</b> para contarlos.",
          "Las zonas sin agujeros son donde un impacto es <b>mortal</b>.",
          "<b>La solución:</b> pregúntate qué falta en tus datos.",
          "Blinda los motores. Estudia los fracasos, <b>no solo a los supervivientes</b>."
        ],
        say: [
          "En la Segunda Guerra Mundial, los bombarderos vuelven de sus misiones llenos de agujeros de bala.",
          "Los ingenieros marcan dónde recibieron impactos los aviones que vuelven.",
          "La idea obvia: blindar donde están los agujeros.",
          "Pero son solo los aviones que lograron volver.",
          "Los que recibían impactos en los motores rara vez volvían para que los contaran.",
          "Las zonas sin agujeros son donde un impacto es mortal.",
          "La solución: pregúntate qué falta en tus datos.",
          "Blinda los motores. Estudia los fracasos, no solo a los supervivientes.",
          "El sesgo de supervivencia. Solo ves lo que sobrevivió. Pregúntate qué falta antes de sacar conclusiones."
        ]
      },
      fr: {
        name: "Biais du survivant", shareTitle: "Le biais du survivant en 30 secondes",
        ecline: "Vous ne voyez que ce qui a survécu. Demandez-vous ce qui manque avant de conclure.",
        legend: "impacts sur les avions revenus", armour: "blindage", back: "Revenus", lost: "Pas revenus",
        noHoles: "aucun trou", missing: "données manquantes", armourHere: "blinder ici",
        caps: [
          "Pendant la Seconde Guerre mondiale, les bombardiers rentrent criblés de <b>trous de balles</b>.",
          "Les ingénieurs notent où les <b>avions revenus</b> ont été touchés.",
          "L’idée évidente : blinder <b>là où sont les trous</b>.",
          "Mais ce sont seulement les avions <b>qui sont rentrés</b>.",
          "Ceux touchés aux moteurs <b>revenaient rarement</b> pour être comptés.",
          "Les zones sans trous sont celles où un impact est <b>fatal</b>.",
          "<b>La solution :</b> demandez-vous ce qui manque dans vos données.",
          "Blindez les moteurs. Étudiez les échecs, <b>pas seulement les survivants</b>."
        ],
        say: [
          "Pendant la Seconde Guerre mondiale, les bombardiers rentrent de mission criblés de trous de balles.",
          "Les ingénieurs notent où les avions revenus ont été touchés.",
          "L’idée évidente : blinder là où sont les trous.",
          "Mais ce sont seulement les avions qui sont rentrés.",
          "Ceux touchés aux moteurs revenaient rarement pour être comptés.",
          "Les zones sans trous sont celles où un impact est fatal.",
          "La solution : demandez-vous ce qui manque dans vos données.",
          "Blindez les moteurs. Étudiez les échecs, pas seulement les survivants.",
          "Le biais du survivant. Vous ne voyez que ce qui a survécu. Demandez-vous ce qui manque avant de conclure."
        ]
      },
      de: {
        name: "Survivorship Bias", shareTitle: "Der Survivorship Bias in 30 Sekunden",
        ecline: "Du siehst nur, was überlebt hat. Frag dich, was fehlt, bevor du Schlüsse ziehst.",
        legend: "Treffer an Rückkehrern", armour: "Panzerung", back: "Zurückgekehrt", lost: "Nicht zurückgekehrt",
        noHoles: "keine Löcher", missing: "fehlende Daten", armourHere: "hier panzern",
        caps: [
          "Im Zweiten Weltkrieg kehren Bomber von Einsätzen zurück, durchsiebt von <b>Einschusslöchern</b>.",
          "Fachleute kartieren, wo die <b>zurückgekehrten Flugzeuge</b> getroffen wurden.",
          "Die naheliegende Idee: Panzerung dort, <b>wo die Löcher sind</b>.",
          "Aber das sind nur die Flugzeuge, <b>die es zurückgeschafft haben</b>.",
          "Flugzeuge mit Treffern in den Triebwerken <b>kamen selten zurück</b>, um gezählt zu werden.",
          "Wo keine Löcher sind, ist ein Treffer <b>tödlich</b>.",
          "<b>Die Lösung:</b> Frag dich, was in deinen Daten fehlt.",
          "Panzere die Triebwerke. Untersuche die Ausfälle, <b>nicht nur die Überlebenden</b>."
        ],
        say: [
          "Im Zweiten Weltkrieg kehren Bomber von ihren Einsätzen zurück, durchsiebt von Einschusslöchern.",
          "Fachleute kartieren, wo die zurückgekehrten Flugzeuge getroffen wurden.",
          "Die naheliegende Idee: Panzerung dort, wo die Löcher sind.",
          "Aber das sind nur die Flugzeuge, die es zurückgeschafft haben.",
          "Flugzeuge mit Treffern in den Triebwerken kamen selten zurück, um gezählt zu werden.",
          "Wo keine Löcher sind, ist ein Treffer tödlich.",
          "Die Lösung: Frag dich, was in deinen Daten fehlt.",
          "Panzere die Triebwerke. Untersuche die Ausfälle, nicht nur die Überlebenden.",
          "Der Survivorship Bias. Du siehst nur, was überlebt hat. Frag dich, was fehlt, bevor du Schlüsse ziehst."
        ]
      },
      it: {
        name: "Bias di sopravvivenza", shareTitle: "Il bias di sopravvivenza in 30 secondi",
        ecline: "Vedi solo ciò che è sopravvissuto. Chiediti cosa manca prima di trarre conclusioni.",
        legend: "colpi sugli aerei rientrati", armour: "blindatura", back: "Rientrati", lost: "Non rientrati",
        noHoles: "nessun foro", missing: "dati mancanti", armourHere: "blinda qui",
        caps: [
          "Nella seconda guerra mondiale, i bombardieri rientrano <b>crivellati di colpi</b>.",
          "Gli ingegneri segnano dove sono stati colpiti gli <b>aerei rientrati</b>.",
          "L’idea ovvia: rinforzare la blindatura <b>dove ci sono i fori</b>.",
          "Ma questi sono solo gli aerei <b>riusciti a tornare</b>.",
          "Gli aerei colpiti ai motori <b>tornavano di rado</b> per essere contati.",
          "I punti senza fori sono quelli dove un colpo è <b>fatale</b>.",
          "<b>La soluzione:</b> chiediti cosa manca nei tuoi dati.",
          "Blinda i motori. Studia i fallimenti, <b>non solo i sopravvissuti</b>."
        ],
        say: [
          "Nella seconda guerra mondiale, i bombardieri rientrano dalle loro missioni crivellati di colpi.",
          "Gli ingegneri segnano dove sono stati colpiti gli aerei rientrati.",
          "L’idea ovvia: rinforzare la blindatura dove ci sono i fori.",
          "Ma questi sono solo gli aerei riusciti a tornare.",
          "Gli aerei colpiti ai motori tornavano di rado per essere contati.",
          "I punti senza fori sono quelli dove un colpo è fatale.",
          "La soluzione: chiediti cosa manca nei tuoi dati.",
          "Blinda i motori. Studia i fallimenti, non solo i sopravvissuti.",
          "Il bias di sopravvivenza. Vedi solo ciò che è sopravvissuto. Chiediti cosa manca prima di trarre conclusioni."
        ]
      }
    },
    svg(T) {
      const dots = (list, r) => list.map(([x, y]) => { const [cx, cy] = V(x, y); return `<circle class="sv-hit" cx="${cx}" cy="${cy}" r="${r}"/>`; }).join("");
      const ghostHits = (g, cx, cy) => GHIT.filter(h => h[0] === g).map(h => `<circle class="sv-hit" cx="${f1(cx + h[1] * GS)}" cy="${f1(cy + h[2] * GS)}" r="0"/>`).join("");
      const LX = 62;                                           // engine labels: over the left engines, clear of the nose
      const [tx, ty] = V(87, -11);
      let slots = "", ghosts = "";
      GH.forEach(([x, y], i) => {
        slots += `<g class="sv-slot">${plane(x, y, GS)}</g><g data-k="sh${i}">${ghostHits(i, x, y).replace(/r="0"/g, 'r="3.2"')}</g>`;
        ghosts += `<g data-k="g${i}"><g class="sv-gh">${plane(x, y, GS)}</g><g data-k="gh${i}">${ghostHits(i, x, y)}</g></g>`;
      });
      return `
        <g data-k="slots">${slots}</g>
        ${ghosts}
        <g data-k="main">
          <g class="sv-pl">${plane(MX, MY, MS)}</g>
          <g data-k="plates">${PLATE.map((_, i) => `<g class="sv-plate" data-k="pl${i}"><rect class="g" rx="3"/><rect class="ok" rx="3"/></g>`).join("")}</g>
          <g data-k="rings">${ENG.map(e => { const [x, y] = V(e - 8, -30); return `<rect class="sv-ring" x="${x}" y="${y}" width="${f1(16 * MS)}" height="${f1(41 * MS)}" rx="6"/>`; }).join("")}</g>
          <g data-k="hitsA">${dots(HA, 0)}</g>
          <g data-k="hitsB">${dots(HB, 0)}</g>
        </g>
        <g class="sv-tag" data-k="tag"><line x1="${tx}" y1="${ty - 1}" x2="208" y2="90"/><rect x="196" y="66" width="24" height="24" rx="6"/><text class="qm" x="208" y="84">?</text></g>
        <text class="sv-nt end" data-k="armour" x="190" y="82">${T.armour}</text>
        <g data-k="legend"><circle class="sv-hit" cx="0" cy="246.5" r="3.2" data-k="legD"/><text class="sv-lb" data-k="legT" x="0" y="250">${T.legend}</text></g>
        <text class="sv-hd" data-k="hdBack" x="${MX}" y="34">${T.back}</text>
        <text class="sv-hd m" data-k="hdLost" x="305" y="34">${T.lost}</text>
        <text class="sv-nt" data-k="noHoles" x="${LX}" y="88">${T.noHoles}</text>
        <text class="sv-nt ok" data-k="armourHere" x="${LX}" y="88">${T.armourHere}</text>
        <g class="sv-lens" data-k="lens"><circle cx="333" cy="134" r="32"/><line x1="356" y1="157" x2="368" y2="169"/></g>
        <text class="sv-nt" data-k="missing" x="305" y="250">${T.missing}</text>`;
    },
    S0: { plane: 0, hitsA: 0, hitsB: 0, legend: 0, plates: 0, tag: 0, tagSwing: 0, hdBack: 0, hdLost: 0, ghosts: 0,
      gHits: 0, fall: 0, slot: 0, rings: 0, noHoles: 0, lens: 0, slotHi: 0, missing: 0, move: 0, green: 0, armourHere: 0, dim: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = v; };
      const pop = (g, v) => {                       // children pop in one after another as v goes 0 -> 1
        const kids = g.children, n = kids.length;
        for (let i = 0; i < n; i++) {
          const p = clamp((v - i / n * .75) / .25);
          kids[i].setAttribute("r", f1(3.2 * (p > 0 ? back(p) : 0)));
        }
      };
      k("main").setAttribute("transform", `translate(0 ${f1((1 - S.plane) * 16)})`);
      op("main", S.plane);
      pop(k("hitsA"), S.hitsA); pop(k("hitsB"), S.hitsB);
      op("hitsA", 1 - .5 * S.dim); op("hitsB", 1 - .5 * S.dim);
      PLATE.forEach(([a, b], i) => {
        const m = S.move, x = a[0] + (b[0] - a[0]) * m, y = a[1] + (b[1] - a[1]) * m, w = a[2] + (b[2] - a[2]) * m, h = a[3] + (b[3] - a[3]) * m;
        const [vx, vy] = V(x, y), g = k("pl" + i), [r1, r2] = g.children;
        for (const r of [r1, r2]) { r.setAttribute("x", vx); r.setAttribute("y", vy); r.setAttribute("width", f1(w * MS)); r.setAttribute("height", f1(h * MS)); r.setAttribute("rx", f1(3 + 1.6 * m)); }
        r1.style.opacity = 1 - S.green; r2.style.opacity = S.green;
      });
      op("plates", S.plates);
      op("rings", S.rings);
      const [tx, ty] = V(87, -11);
      k("tag").setAttribute("transform", `rotate(${S.tagSwing} ${tx} ${ty})`);
      op("tag", S.tag); op("armour", S.tag);
      // legend: red dot + text, centred under the plane
      const lt = k("legT"), lw = lt.getComputedTextLength ? lt.getComputedTextLength() : 130;
      lt.setAttribute("x", f1(MX - lw / 2 + 6)); k("legD").setAttribute("cx", f1(MX - lw / 2 - 3));
      op("legend", S.legend);
      op("hdBack", S.hdBack); op("hdLost", S.hdLost);
      // the planes that didn't return: slide in, take engine hits, fall away
      GH.forEach(([x, y], i) => {
        const f = S.fall * S.fall, dir = i === 1 ? 1 : -1;
        k("g" + i).setAttribute("transform", `translate(${f1((1 - S.ghosts) * 40 - f * 10)} ${f1(f * 150)}) rotate(${f1(S.fall * 26 * dir)} ${x} ${y})`);
        op("g" + i, S.ghosts * (1 - clamp(S.fall * 1.25)));
        const hs = k("gh" + i).children;
        GHIT.filter(h => h[0] === i).forEach((h, j) => {
          const idx = GHIT.indexOf(h), p = clamp((S.gHits - idx / GHIT.length * .75) / .25);
          hs[j].setAttribute("r", f1(3.2 * (p > 0 ? back(p) : 0)));
        });
        op("sh" + i, S.slotHi);
      });
      op("slots", S.slot * (.45 + .5 * S.slotHi));
      k("lens").setAttribute("transform", `translate(${f1((1 - S.lens) * 30)} ${f1((1 - S.lens) * 10)})`);
      op("lens", S.lens);
      op("noHoles", S.noHoles); op("armourHere", S.armourHere); op("missing", S.missing);
    },
    beats: [
      { steps: [{ to: { plane: 1 }, ms: 700, sfx: "pluck" }, { wait: 200 }, { to: { hitsA: 1 }, ms: 1400, ease: "lin", sfx: "pop" }] },
      { steps: [{ to: { legend: 1 }, ms: 400 }, { to: { hitsB: 1 }, ms: 1500, ease: "lin", sfx: "tick" }] },
      { steps: [{ to: { plates: 1 }, ms: 700, sfx: "pluck" }, { wait: 200 }, { to: { tag: 1 }, ms: 300 }, { to: { tagSwing: 12 }, ms: 260 }, { to: { tagSwing: -8 }, ms: 300, ease: "inOut" }, { to: { tagSwing: 0 }, ms: 300, ease: "inOut" }] },
      { steps: [{ to: { tag: 0 }, ms: 300 }, { to: { hdBack: 1 }, ms: 400 }, { to: { ghosts: 1, hdLost: 1 }, ms: 900, sfx: "whoosh" }] },
      { steps: [{ to: { gHits: 1 }, ms: 1000, ease: "lin" }, { wait: 500 }, { to: { fall: 1 }, ms: 1100, ease: "lin", sfx: "thud", sfxAt: 650 }, { to: { slot: 1 }, ms: 500 }] },
      { steps: [{ to: { rings: 1 }, ms: 600, sfx: "tick" }, { to: { noHoles: 1 }, ms: 400 }] },
      { steps: [{ to: { lens: 1 }, ms: 700 }, { to: { slotHi: 1 }, ms: 600 }, { to: { missing: 1 }, ms: 400, sfx: "scribble" }] },
      { steps: [{ to: { rings: 0, noHoles: 0, lens: 0 }, ms: 400 }, { to: { move: 1, dim: 1 }, ms: 1300, ease: "inOut" }, { to: { green: 1, armourHere: 1 }, ms: 500, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
