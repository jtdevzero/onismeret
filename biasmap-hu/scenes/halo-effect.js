/* Halo effect: two candidates with the same CV, one glowing first impression, and a score sheet it colours. Scene for anim.js. */
(function () {
  const KEY = "halo-effect", P = `.bp[data-scene="${KEY}"]`;
  const AX = 86, BX = 314;                          // candidates A (left) and B (right)
  const CA = 118, CB = 250, CW = 32, CT = 32, CH = 48; // CV cards: left edges, width, top, height
  const LA = 154, LB = 246, U = 13;                 // score bars grow outwards from the centre column, 13 px per point
  const ROW = [142, 185, 228], BH = 14;             // trait rows (centre y) and bar height
  const HIGH = [9, 9, 9], FAIR = [6, 5, 6];         // A with the halo; what the facts support (B's scores)
  const HY = 17, GB = 244;                          // halo centre y, bottom of its glow
  const cl = v => Math.max(0, Math.min(1, v));

  const person = x => `<circle class="he-ln" cx="${x}" cy="37" r="11"/>
    <path class="he-ln" d="M${x - 22} 82 V76 C${x - 22} 64 ${x - 12} 56 ${x} 56 C${x + 12} 56 ${x + 22} 64 ${x + 22} 76 V82"/>
    <circle class="he-eye" cx="${x - 4}" cy="35" r="1.4"/><circle class="he-eye" cx="${x + 4}" cy="35" r="1.4"/>`;
  const cv = x => `<g class="he-cv"><rect x="${x}" y="${CT}" width="${CW}" height="${CH}" rx="4"/>
    <line class="t" x1="${x + 7}" x2="${x + 21}" y1="${CT + 10}" y2="${CT + 10}"/>
    ${[19, 26, 33, 40].map((d, i) => `<line x1="${x + 7}" x2="${x + [25, 22, 25, 17][i]}" y1="${CT + d}" y2="${CT + d}"/>`).join("")}</g>`;

  window.BiasAnim.SCENES[KEY] = {
    q: "nem", viewBox: "0 0 400 272",
    css: `
      ${P} .he-ln{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .he-eye{fill:var(--ink)}
      ${P} .he-cv rect{fill:var(--surface);stroke:var(--ink);stroke-width:1.8}
      ${P} .he-cv line{stroke:var(--faint);stroke-width:1.6;stroke-linecap:round}
      ${P} .he-cv line.t{stroke:var(--ink);stroke-width:2.2}
      ${P} .he-eq{stroke:var(--q);stroke-width:2.4;stroke-linecap:round}
      ${P} .he-same{font:500 9.5px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .he-halo{fill:none;stroke:var(--q);stroke-width:2.6}
      ${P} .he-haloglow{fill:var(--q);fill-opacity:.22}
      ${P} .he-glow{fill:var(--q);fill-opacity:.18}
      ${P} .he-track{fill:none;stroke:var(--rule);stroke-width:1.4}
      ${P} .he-barA{fill:var(--q)}
      ${P} .he-barB{fill:var(--muted)}
      ${P} .he-barG{fill:var(--good)}
      ${P} .he-val{font:700 9.5px var(--mono);fill:var(--ground);text-anchor:middle}
      ${P} .he-trait{font:600 11px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .he-ev{font:500 9px var(--mono);fill:var(--good);text-anchor:middle}
      ${P} .he-cut{stroke:var(--ground);stroke-width:2.4}
      ${P} .he-br{fill:none;stroke:var(--bad);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .he-brt{font:600 10px var(--mono);fill:var(--bad);text-anchor:middle}
      ${P} .he-cover rect{fill:var(--surface);stroke:var(--muted);stroke-width:1.8}
      ${P} .he-cover text{font:700 22px var(--display);fill:var(--ink);text-anchor:middle}
    `,
    text: {
      hu: {
        name: "Halo-hatás", shareTitle: "A halo-hatás, 30 másodpercben",
        ecline: "Egy jó tulajdonság a többit is jónak mutatja. Mindegyiket a saját bizonyítéka alapján ítéld meg.",
        same: ["ugyanaz az önéletrajz"], traits: ["Szakmai tudás", "Őszinteség", "Megbízhatóság"],
        evidence: ["munkaminta", "referenciák", "eddigi eredmények"], halo: "halo",
        caps: [
          "Két jelölt <b>ugyanazzal az önéletrajzzal</b>.",
          "Az egyik magabiztosan, élesen és mosolyogva lép be.",
          "Ez az első benyomás <b>ragyog</b> minden másra.",
          "Szakmai tudás? <b>Erős.</b> Őszinte? <b>Biztos.</b> Megbízható? <b>Persze.</b>",
          "A másik <b>ugyanazokra a tényekre</b> átlagos pontszámot kap.",
          "Ez a különbség a <b>halo</b>: egyetlen tulajdonság színezte be az egész képet.",
          "<b>A megoldás:</b> minden tulajdonságot a saját bizonyítéka alapján értékelj.",
          "Tulajdonságonként megítélve <b>egyenlőnek</b> bizonyulnak."
        ],
        say: [
          "Két jelölt ugyanazzal az önéletrajzzal.",
          "Az egyik magabiztosan, élesen és mosolyogva lép be.",
          "Ez az első benyomás ragyog minden másra.",
          "Szakmai tudás? Erős. Őszinte? Biztos. Megbízható? Persze.",
          "A másik ugyanazokra a tényekre átlagos pontszámot kap.",
          "Ez a különbség a halo. Egyetlen tulajdonság színezte be az egész képet.",
          "A megoldás: minden tulajdonságot a saját bizonyítéka alapján értékelj.",
          "Tulajdonságonként megítélve egyenlőnek bizonyulnak.",
          "A halo-hatás. Egy jó tulajdonság a többit is jónak mutatja. Mindegyiket a saját bizonyítéka alapján ítéld meg."
        ]
      },
      en: {
        name: "Halo effect", shareTitle: "Halo effect, explained in 30 seconds",
        ecline: "One good trait makes the others look good too. Judge each on its own evidence.",
        same: ["same CV"], traits: ["Skills", "Honesty", "Reliability"],
        evidence: ["work sample", "references", "track record"], halo: "halo",
        caps: [
          "Two candidates with <b>the same CV</b>.",
          "One walks in confident, sharp and smiling.",
          "That first impression <b>glows</b> over everything else.",
          "Skills? <b>Strong.</b> Honest? <b>Surely.</b> Reliable? <b>Of course.</b>",
          "The other gets average scores <b>on the same facts</b>.",
          "That gap is the <b>halo</b>: one trait coloured the whole picture.",
          "<b>The fix:</b> rate each quality on its own evidence.",
          "Judged trait by trait, they come out <b>level</b>."
        ],
        say: [
          "Two candidates with the same CV.",
          "One walks in confident, sharp and smiling.",
          "That first impression glows over everything else.",
          "Skills? Strong. Honest? Surely. Reliable? Of course.",
          "The other gets average scores, on the same facts.",
          "That gap is the halo. One trait coloured the whole picture.",
          "The fix: rate each quality on its own evidence.",
          "Judged trait by trait, they come out level.",
          "The halo effect. One good trait makes the others look good too. Judge each on its own evidence."
        ]
      },
      el: {
        name: "Φαινόμενο της άλω", shareTitle: "Το φαινόμενο της άλω σε 30 δευτερόλεπτα",
        ecline: "Ένα καλό γνώρισμα κάνει και τα υπόλοιπα να φαίνονται καλά. Κρίνε το καθένα με τα δικά του στοιχεία.",
        same: ["ίδιο", "βιογραφικό"], traits: ["Δεξιότητες", "Ειλικρίνεια", "Αξιοπιστία"],
        evidence: ["δείγμα δουλειάς", "συστάσεις", "προϋπηρεσία"], halo: "φωτοστέφανο",
        caps: [
          "Δύο υποψήφιοι με <b>το ίδιο βιογραφικό</b>.",
          "Ο ένας μπαίνει με αυτοπεποίθηση, στιλ και χαμόγελο.",
          "Η λάμψη της πρώτης εντύπωσης <b>απλώνεται</b> σε όλα τα άλλα.",
          "Δεξιότητες; <b>Άριστες.</b> Ειλικρινής; <b>Σίγουρα.</b> Αξιόπιστος; <b>Εννοείται.</b>",
          "Ο άλλος παίρνει μέτριους βαθμούς <b>με τα ίδια στοιχεία</b>.",
          "Η διαφορά είναι το <b>φωτοστέφανο</b>: ένα γνώρισμα χρωμάτισε όλη την εικόνα.",
          "<b>Η λύση:</b> βαθμολόγησε κάθε προσόν χωριστά, με τα δικά του στοιχεία.",
          "Αν κρίνεις ένα ένα τα προσόντα, οι δύο βγαίνουν <b>ισάξιοι</b>."
        ],
        say: [
          "Δύο υποψήφιοι με το ίδιο βιογραφικό.",
          "Ο ένας μπαίνει με αυτοπεποίθηση, στιλ και χαμόγελο.",
          "Η λάμψη της πρώτης εντύπωσης απλώνεται σε όλα τα άλλα.",
          "Δεξιότητες; Άριστες. Ειλικρινής; Σίγουρα. Αξιόπιστος; Εννοείται.",
          "Ο άλλος παίρνει μέτριους βαθμούς, με τα ίδια στοιχεία.",
          "Η διαφορά είναι το φωτοστέφανο. Ένα γνώρισμα χρωμάτισε όλη την εικόνα.",
          "Η λύση: βαθμολόγησε κάθε προσόν χωριστά, με τα δικά του στοιχεία.",
          "Αν κρίνεις ένα ένα τα προσόντα, οι δύο βγαίνουν ισάξιοι.",
          "Φαινόμενο της άλω. Ένα καλό γνώρισμα κάνει και τα υπόλοιπα να φαίνονται καλά. Κρίνε το καθένα με τα δικά του στοιχεία."
        ]
      },
      es: {
        name: "Efecto halo", shareTitle: "El efecto halo en 30 segundos",
        ecline: "Un rasgo bueno hace que los demás también parezcan buenos. Juzga cada uno por sus propias pruebas.",
        same: ["mismo", "currículum"], traits: ["Habilidades", "Honestidad", "Fiabilidad"],
        evidence: ["prueba práctica", "referencias", "trayectoria"], halo: "halo",
        caps: [
          "Dos candidatos con <b>el mismo currículum</b>.",
          "Uno entra seguro, elegante y sonriente.",
          "Esa primera impresión <b>ilumina</b> todo lo demás.",
          "¿Habilidades? <b>Muchas.</b> ¿Honesto? <b>Seguro.</b> ¿Fiable? <b>Por supuesto.</b>",
          "El otro recibe puntuaciones medias <b>con los mismos datos</b>.",
          "Esa diferencia es el <b>halo</b>: un solo rasgo tiñó toda la imagen.",
          "<b>La solución:</b> puntúa cada cualidad según sus propias pruebas.",
          "Juzgados rasgo a rasgo, quedan <b>empatados</b>."
        ],
        say: [
          "Dos candidatos con el mismo currículum.",
          "Uno entra seguro, elegante y sonriente.",
          "Esa primera impresión ilumina todo lo demás.",
          "¿Habilidades? Muchas. ¿Honesto? Seguro. ¿Fiable? Por supuesto.",
          "El otro recibe puntuaciones medias, con los mismos datos.",
          "Esa diferencia es el halo. Un solo rasgo tiñó toda la imagen.",
          "La solución: puntúa cada cualidad según sus propias pruebas.",
          "Juzgados rasgo a rasgo, quedan empatados.",
          "El efecto halo. Un rasgo bueno hace que los demás también parezcan buenos. Juzga cada uno por sus propias pruebas."
        ]
      },
      fr: {
        name: "Effet de halo", shareTitle: "L’effet de halo en 30 secondes",
        ecline: "Un bon trait fait paraître les autres bons aussi. Jugez chacun sur ses propres preuves.",
        same: ["même CV"], traits: ["Compétences", "Honnêteté", "Fiabilité"],
        evidence: ["test pratique", "références", "parcours"], halo: "halo",
        caps: [
          "Deux candidats avec <b>le même CV</b>.",
          "L’un entre sûr de lui, élégant et souriant.",
          "Cette première impression <b>rayonne</b> sur tout le reste.",
          "Compétences ? <b>Solides.</b> Honnête ? <b>Sûrement.</b> Fiable ? <b>Bien sûr.</b>",
          "L’autre obtient des notes moyennes <b>avec les mêmes faits</b>.",
          "Cet écart, c’est le <b>halo</b> : un seul trait a coloré tout le tableau.",
          "<b>La solution :</b> notez chaque qualité sur ses propres preuves.",
          "Jugés trait par trait, ils sont <b>à égalité</b>."
        ],
        say: [
          "Deux candidats avec le même CV.",
          "L’un entre sûr de lui, élégant et souriant.",
          "Cette première impression rayonne sur tout le reste.",
          "Compétences ? Solides. Honnête ? Sûrement. Fiable ? Bien sûr.",
          "L’autre obtient des notes moyennes, avec les mêmes faits.",
          "Cet écart, c’est le halo. Un seul trait a coloré tout le tableau.",
          "La solution : notez chaque qualité sur ses propres preuves.",
          "Jugés trait par trait, ils sont à égalité.",
          "L’effet de halo. Un bon trait fait paraître les autres bons aussi. Jugez chacun sur ses propres preuves."
        ]
      },
      de: {
        name: "Halo-Effekt", shareTitle: "Der Halo-Effekt in 30 Sekunden",
        ecline: "Eine gute Eigenschaft lässt auch die anderen gut aussehen. Beurteile jede nach ihren eigenen Belegen.",
        same: ["gleicher", "Lebenslauf"], traits: ["Können", "Ehrlichkeit", "Zuverlässigkeit"],
        evidence: ["Arbeitsprobe", "Referenzen", "Werdegang"], halo: "Halo",
        caps: [
          "Zwei Menschen bewerben sich mit <b>demselben Lebenslauf</b>.",
          "Die eine Person tritt selbstbewusst, gepflegt und lächelnd auf.",
          "Dieser erste Eindruck <b>strahlt</b> auf alles andere ab.",
          "Können? <b>Stark.</b> Ehrlich? <b>Sicher.</b> Zuverlässig? <b>Natürlich.</b>",
          "Die andere Person bekommt mittlere Noten, <b>bei denselben Fakten</b>.",
          "Diese Lücke ist der <b>Halo</b>: Eine Eigenschaft färbt das ganze Bild.",
          "<b>Die Lösung:</b> Bewerte jede Eigenschaft nach ihren eigenen Belegen.",
          "Eigenschaft für Eigenschaft bewertet, liegen beide <b>gleichauf</b>."
        ],
        say: [
          "Zwei Menschen bewerben sich mit demselben Lebenslauf.",
          "Die eine Person tritt selbstbewusst, gepflegt und lächelnd auf.",
          "Dieser erste Eindruck strahlt auf alles andere ab.",
          "Können? Stark. Ehrlich? Sicher. Zuverlässig? Natürlich.",
          "Die andere Person bekommt mittlere Noten, bei denselben Fakten.",
          "Diese Lücke ist der Halo. Eine Eigenschaft färbt das ganze Bild.",
          "Die Lösung: Bewerte jede Eigenschaft nach ihren eigenen Belegen.",
          "Eigenschaft für Eigenschaft bewertet, liegen beide gleichauf.",
          "Der Halo-Effekt. Eine gute Eigenschaft lässt auch die anderen gut aussehen. Beurteile jede nach ihren eigenen Belegen."
        ]
      },
      it: {
        name: "Effetto alone", shareTitle: "L’effetto alone in 30 secondi",
        ecline: "Un tratto positivo fa sembrare positivi anche gli altri. Giudica ognuno in base alle sue prove.",
        same: ["stesso CV"], traits: ["Competenze", "Onestà", "Affidabilità"],
        evidence: ["prova pratica", "referenze", "percorso"], halo: "alone",
        caps: [
          "Due candidati con <b>lo stesso CV</b>.",
          "Uno entra sicuro di sé, brillante e sorridente.",
          "Quella prima impressione <b>illumina</b> tutto il resto.",
          "Competenze? <b>Ottime.</b> Onesto? <b>Di sicuro.</b> Affidabile? <b>Certo.</b>",
          "L’altro riceve punteggi nella media <b>con gli stessi fatti</b>.",
          "Quel divario è <b>l’alone</b>: un tratto ha colorato tutto il quadro.",
          "<b>La soluzione:</b> valuta ogni qualità in base alle sue prove.",
          "Giudicati tratto per tratto, risultano <b>alla pari</b>."
        ],
        say: [
          "Due candidati con lo stesso CV.",
          "Uno entra sicuro di sé, brillante e sorridente.",
          "Quella prima impressione illumina tutto il resto.",
          "Competenze? Ottime. Onesto? Di sicuro. Affidabile? Certo.",
          "L’altro riceve punteggi nella media, con gli stessi fatti.",
          "Quel divario è l’alone. Un tratto ha colorato tutto il quadro.",
          "La soluzione: valuta ogni qualità in base alle sue prove.",
          "Giudicati tratto per tratto, risultano alla pari.",
          "L’effetto alone. Un tratto positivo fa sembrare positivi anche gli altri. Giudica ognuno in base alle sue prove."
        ]
      }
    },
    svg(T) {
      const rows = ROW.map((y, i) => `
        <g data-k="trk${i}"><rect class="he-track" x="${LA - 10 * U}" y="${y - BH / 2}" width="${10 * U}" height="${BH}" rx="3"/>
          <rect class="he-track" x="${LB}" y="${y - BH / 2}" width="${10 * U}" height="${BH}" rx="3"/></g>
        <rect class="he-barA" data-k="ba${i}" y="${y - BH / 2}" height="${BH}" rx="3"/>
        <rect class="he-barB" data-k="bb${i}" y="${y - BH / 2}" height="${BH}" rx="3"/>
        <rect class="he-barG" data-k="ga${i}" y="${y - BH / 2}" height="${BH}" rx="3"/>
        <rect class="he-barG" data-k="gb${i}" y="${y - BH / 2}" height="${BH}" rx="3"/>
        <line class="he-cut" data-k="cut${i}" x1="${LA - FAIR[i] * U}" x2="${LA - FAIR[i] * U}" y1="${y - BH / 2 - 1}" y2="${y + BH / 2 + 1}"/>
        <text class="he-val" data-k="va${i}" y="${y + 3.4}"></text><text class="he-val" data-k="vb${i}" y="${y + 3.4}"></text>
        <text class="he-trait" data-k="tr${i}" x="200">${T.traits[i]}</text>
        <text class="he-ev" data-k="ev${i}" x="200" y="${y + 11}">${T.evidence[i]}</text>
        <path class="he-br" data-k="br${i}" d="M${LA - HIGH[i] * U + 1} ${y - 10} V${y - 14} H${LA - FAIR[i] * U - 1} V${y - 10}"/>`).join("");
      const brX = LA - (HIGH[0] + FAIR[0]) / 2 * U, eqY = T.same.length > 1 ? 40 : 45;
      return `
        <polygon class="he-glow" data-k="glow" points=""/>
        <g data-k="pa"><g data-k="paIn">${person(AX)}
          <path class="he-ln" data-k="mouthA" d=""/>
          <path class="he-ln" data-k="collar" d="M${AX - 9} 57 L${AX} 68 L${AX + 9} 57"/></g></g>
        <g data-k="pb">${person(BX)}<path class="he-ln" d="M${BX - 4} 41.5 H${BX + 4}"/></g>
        <g data-k="halo"><ellipse class="he-haloglow" cx="${AX}" cy="${HY}" rx="21" ry="7"/><ellipse class="he-halo" cx="${AX}" cy="${HY}" rx="15" ry="4.5"/></g>
        <g data-k="cva">${cv(CA)}</g><g data-k="cvb">${cv(CB)}</g>
        <g data-k="eq"><line class="he-eq" x1="191" x2="209" y1="${eqY}" y2="${eqY}"/><line class="he-eq" x1="191" x2="209" y1="${eqY + 7}" y2="${eqY + 7}"/>
          ${T.same.map((s, i) => `<text class="he-same" x="200" y="${eqY + 24 + i * 11}">${s}</text>`).join("")}</g>
        <g class="he-cover" data-k="coverA"><rect x="${AX - 26}" y="23" width="52" height="60" rx="9"/><text x="${AX}" y="61">A</text></g>
        <g class="he-cover" data-k="coverB"><rect x="${BX - 26}" y="23" width="52" height="60" rx="9"/><text x="${BX}" y="61">B</text></g>
        ${rows}
        <text class="he-brt" data-k="brt" x="${brX}" y="${ROW[0] - 19}">${T.halo}</text>`;
    },
    S0: { pa: 0, pb: 0, cva: 0, cvb: 0, eq: 0, sheet: 0, smile: 0, collar: 0, hop: 0, halo: 0, glow: 0, glowOp: 1,
      a0: 0, a1: 0, a2: 0, b0: 0, b1: 0, b2: 0, cut: 0, br: 0, cover: 0, ev: 0, ok: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = v; };
      const tr = (key, x, y) => k(key).setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
      // the candidates and their CVs
      op("pa", S.pa); tr("pa", -8 * (1 - S.pa), 0); tr("paIn", 0, -5 * S.hop);
      op("pb", S.pb); tr("pb", 8 * (1 - S.pb), 0);
      const my = 41.5 + 4 * S.smile;
      k("mouthA").setAttribute("d", `M${AX - 5} ${41.5 - S.smile} Q${AX} ${my} ${AX + 5} ${41.5 - S.smile}`);
      op("collar", S.collar);
      op("cva", S.cva); tr("cva", 0, 6 * (1 - S.cva));
      op("cvb", S.cvb); tr("cvb", 0, 6 * (1 - S.cvb));
      op("eq", S.eq);
      // the halo pops in above A, then its glow washes down over A's scores
      const hs = Math.max(0, S.halo);
      k("halo").setAttribute("transform", `translate(${AX} ${HY}) scale(${hs.toFixed(3)}) translate(${-AX} ${-HY})`);
      op("halo", cl(S.halo * 1.5) * S.glowOp);
      const gy = HY + 3 + (GB - HY - 3) * S.glow, f = S.glow;
      k("glow").setAttribute("points", `${AX - 15},${HY + 3} ${AX + 15},${HY + 3} ${AX + 15 + (LA + 4 - AX - 15) * f},${gy} ${AX - 15 - (AX - 15 - 14) * f},${gy}`);
      op("glow", (S.glow > 0 ? 1 : 0) * S.glowOp);
      // score sheet
      for (let i = 0; i < 3; i++) {
        const a = S["a" + i], b = S["b" + i];
        op("trk" + i, S.sheet); op("tr" + i, S.sheet);
        k("tr" + i).setAttribute("y", ROW[i] + 4 - 6 * S.ev);
        op("ev" + i, cl(S.ev * 3 - i));
        for (const [bar, g, v, len, x] of [["ba" + i, "ga" + i, "va" + i, a * U, LA - a * U], ["bb" + i, "gb" + i, "vb" + i, b * U, LB]]) {
          for (const r of [bar, g]) { k(r).setAttribute("x", x); k(r).setAttribute("width", Math.max(0, len)); }
          op(bar, len > .5 ? 1 : 0); op(g, len > .5 ? S.ok : 0);
          const isA = bar === "ba" + i, val = k(v);
          val.setAttribute("x", isA ? x + 8 : x + len - 8);
          val.textContent = Math.min(isA ? HIGH[i] : FAIR[i], Math.round(len / U));   // no flash of "10" on the overshoot
          op(v, cl((len / U - 1.2) * 2));
        }
        op("cut" + i, S.cut * (1 - S.ok));
        op("br" + i, cl(S.br * 3 - i) * (1 - S.ok));
      }
      op("brt", S.br * (1 - S.ok));
      // the fix: hide the impression, score on evidence
      for (const c of ["coverA", "coverB"]) { op(c, S.cover); tr(c, 0, -10 * (1 - S.cover)); }
    },
    beats: [
      { steps: [{ to: { pa: 1, pb: 1 }, ms: 600, sfx: "pluck" }, { to: { cva: 1 }, ms: 350 }, { to: { cvb: 1 }, ms: 350 },
        { to: { eq: 1 }, ms: 400 }, { wait: 200 }, { to: { sheet: 1 }, ms: 500 }] },
      { steps: [{ to: { smile: 1, collar: 1, hop: 1 }, ms: 450, ease: "inOut" }, { to: { hop: 0 }, ms: 350, ease: "out" },
        { wait: 150 }, { to: { halo: 1 }, ms: 500, ease: "out", sfx: "pop" }] },
      { steps: [{ to: { glow: 1 }, ms: 1300, ease: "inOut", sfx: "whoosh" }] },
      { steps: [{ to: { a0: HIGH[0] }, ms: 550, ease: "out", sfx: "tick" }, { wait: 450 },
        { to: { a1: HIGH[1] }, ms: 550, ease: "out" }, { wait: 450 }, { to: { a2: HIGH[2] }, ms: 550, ease: "out" }] },
      { steps: [{ to: { b0: FAIR[0], b1: FAIR[1], b2: FAIR[2] }, ms: 900, ease: "out", sfx: "tick" }] },
      { steps: [{ to: { cut: 1 }, ms: 400 }, { to: { br: 1 }, ms: 800, ease: "out", sfx: "spring" }] },
      { steps: [{ to: { glowOp: 0 }, ms: 600 }, { to: { cover: 1 }, ms: 500, ease: "out" }, { wait: 200 },
        { to: { ev: 1 }, ms: 1300, ease: "lin", sfx: "scribble" }] },
      { steps: [{ to: { br: 0, cut: 0 }, ms: 300 }, { to: { a0: FAIR[0], a1: FAIR[1], a2: FAIR[2] }, ms: 1000, ease: "inOut", sfx: "whoosh" },
        { to: { ok: 1 }, ms: 600, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
