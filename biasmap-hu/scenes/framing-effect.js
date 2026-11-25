/* Framing effect: two identical packs of mince, one labelled "75% lean", the other "25% fat",
   the same split inside both, and the label flipped the other way round. Scene for anim.js. */
(function () {
  const KEY = "framing-effect", P = `.bp[data-scene="${KEY}"]`;
  const PX = { L: 104, R: 296 };                 // pack centres
  const TW = 74, TT = 44, TB = 168;              // tray half-width, top, bottom
  const SY = 46;                                 // sticker centre y
  const BW = 120, BY = 106, BH = 24;             // split bar: width, top, height (pack-local x from -BW/2)
  const BL = -BW / 2, BR = BW / 2, CUT = BL + BW * .75;   // bar ends and the lean/fat split
  const LC = (BL + CUT) / 2, FC = (CUT + BR) / 2;          // centres of the lean and fat parts
  const SHELF = 178, MY = 212, MW = 100, MX = -42;         // shelf top, meter row centre, meter width, meter left
  const clamp = v => Math.max(0, Math.min(1, v));
  const rr = (x0, x1, y0, y1, l, r) => {         // rect with rounded corners on the left and/or right only
    const a = l ? 4 : 0, b = r ? 4 : 0;
    return `M${x0 + a} ${y0} H${x1 - b} Q${x1} ${y0} ${x1} ${y0 + b} V${y1 - b} Q${x1} ${y1} ${x1 - b} ${y1} H${x0 + a} Q${x0} ${y1} ${x0} ${y1 - a} V${y0 + a} Q${x0} ${y0} ${x0 + a} ${y0} Z`;
  };
  const LEAN = rr(BL, CUT, BY, BY + BH, 1, 0), FAT = rr(CUT, BR, BY, BY + BH, 0, 1);
  // minced beef: short curly strands at mixed angles, filling the tray window
  let MINCE = "";
  for (let r = 0; r < 8; r++) for (let c = 0; c < 11; c++) {
    const x = -57 + c * 11.4 + (r % 2 ? 5 : 0) + ((r * 7 + c * 5) % 5) - 2, y = 73 + r * 10.6 + ((r * 3 + c * 7) % 4) - 1.5;
    if (x > 56 || x < -58) continue;
    const a = [-.6, .2, -.2, .9, .5, -1.1, 1.3][(r * 4 + c * 3) % 7], co = Math.cos(a), si = Math.sin(a);
    const R = (u, v) => `${(u * co - v * si).toFixed(1)} ${(u * si + v * co).toFixed(1)}`;
    const [sx, sy] = R(-4, 0).split(" ").map(Number);
    MINCE += `M${(x + sx).toFixed(1)} ${(y + sy).toFixed(1)} q${R(2, -2.6)} ${R(4, 0)} t${R(4, 0)}`;
  }

  window.BiasAnim.SCENES[KEY] = {
    q: "tmi", viewBox: "0 0 400 272",
    css: `
      ${P} .fe-shelf{fill:var(--surface);stroke:var(--rule);stroke-width:2;stroke-linejoin:round}
      ${P} .fe-tray{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .fe-lip{fill:none;stroke:var(--muted);stroke-width:1.4}
      ${P} .fe-mince{fill:none;stroke:var(--muted);stroke-width:1.5;stroke-linecap:round}
      ${P} .fe-st rect{fill:var(--surface);stroke-width:2}
      ${P} .fe-st.blank rect{stroke:var(--muted)}
      ${P} .fe-st.blank line{stroke:var(--faint);stroke-width:2;stroke-linecap:round}
      ${P} .fe-st text{font:700 16px var(--display);text-anchor:middle}
      ${P} .fe-st.g rect{stroke:var(--good)} ${P} .fe-st.g text{fill:var(--good)}
      ${P} .fe-st.b rect{stroke:var(--bad)} ${P} .fe-st.b text{fill:var(--bad)}
      ${P} .fe-tag rect{fill:var(--surface);stroke-width:1.6}
      ${P} .fe-tag text{font:600 11.5px var(--display);text-anchor:middle}
      ${P} .fe-tag.g rect{stroke:var(--good)} ${P} .fe-tag.g text{fill:var(--good)}
      ${P} .fe-tag.b rect{stroke:var(--bad)} ${P} .fe-tag.b text{fill:var(--bad)}
      ${P} .fe-base{fill:var(--surface)}
      ${P} .fe-seg{fill:var(--muted);fill-opacity:.16;stroke:var(--muted);stroke-width:1.6;stroke-linejoin:round}
      ${P} .fe-hi{stroke-width:2.2;stroke-linejoin:round}
      ${P} .fe-hi.g{fill:var(--good);fill-opacity:.24;stroke:var(--good)}
      ${P} .fe-hi.b{fill:var(--bad);fill-opacity:.24;stroke:var(--bad)}
      ${P} .fe-pct{font:600 11px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fe-part{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .fe-part.e{text-anchor:end}
      ${P} .fe-part.g{fill:var(--good)} ${P} .fe-part.b{fill:var(--bad)}
      ${P} .fe-arr{fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fe-arr.g{stroke:var(--good)} ${P} .fe-arr.b{stroke:var(--bad)}
      ${P} .fe-eq line{stroke:var(--q);stroke-width:3;stroke-linecap:round}
      ${P} .fe-eq.ok line{stroke:var(--good)}
      ${P} .fe-note{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .fe-track{fill:none;stroke:var(--muted);stroke-width:1.6}
      ${P} .fe-fill{fill:var(--q)}
      ${P} .fe-fillok{fill:var(--good)}
      ${P} .fe-face circle.o{fill:var(--surface);stroke-width:2}
      ${P} .fe-face path{fill:none;stroke-width:2;stroke-linecap:round}
      ${P} .fe-face .e{stroke:none}
      ${P} .fe-face.ink circle.o,${P} .fe-face.ink path{stroke:var(--ink)} ${P} .fe-face.ink .e{fill:var(--ink)}
      ${P} .fe-face.ok circle.o,${P} .fe-face.ok path{stroke:var(--good)} ${P} .fe-face.ok .e{fill:var(--good)}
    `,
    text: {
      hu: {
        name: "Keretezési hatás", shareTitle: "A keretezési hatás, 30 másodpercben",
        ecline: "Ugyanaz a tény másképp hangzik attól függően, hogyan mondják. Fordítsd meg, és nézd meg.",
        lean: "75% sovány", fat: "25% zsír", flipL: "= 25% zsír", flipR: "= 75% sovány", tagW: 84,
        pl: "sovány", pf: "zsír", same: ["ugyanaz a", "marhahús"], rate: "Mennyire jónak tűnik",
        caps: [
          "Két csomag darált marhahús a polcon.",
          "Az egyiken ez áll: „<b>75% sovány</b>”.",
          "A másikon: „<b>25% zsír</b>”.",
          "Melyik tűnik jobbnak? A legtöbben a <b>„sovány” címkéset</b> választják.",
          "De nézd meg belülről: <b>ugyanaz a marhahús</b>.",
          "Mindkét címke a <b>jó</b>, vagy a <b>rossz rész</b> felé tereli a szemedet.",
          "<b>A megoldás:</b> fordítsd meg a keretet. Mondd el fordítva.",
          "Ugyanazok a tények, mindkét irányban. Most már a <b>húst</b> ítéled meg, nem a <b>címkét</b>."
        ],
        say: [
          "Két csomag darált marhahús a polcon.",
          "Az egyiken ez áll: hetvenöt százalék sovány.",
          "A másikon: huszonöt százalék zsír.",
          "Melyik tűnik jobbnak? A legtöbben a soványt választják.",
          "De nézd meg belülről. Ugyanaz a marhahús.",
          "Mindkét címke a jó részre vagy a rossz részre tereli a szemedet.",
          "A megoldás: fordítsd meg a keretet. Mondd el fordítva.",
          "Ugyanazok a tények, mindkét irányban. Most már a húst ítéled meg, nem a címkét.",
          "A keretezési hatás. Ugyanaz a tény másképp hangzik attól függően, hogyan mondják. Fordítsd meg, és nézd meg."
        ]
      },
      en: {
        name: "Framing effect", shareTitle: "Framing effect, explained in 30 seconds",
        ecline: "The same fact sounds different depending on how it's put. Flip it and see.",
        lean: "75% lean", fat: "25% fat", flipL: "= 25% fat", flipR: "= 75% lean", tagW: 84,
        pl: "lean", pf: "fat", same: ["same", "beef"], rate: "How good it seems",
        caps: [
          "Two packs of minced beef on the shelf.",
          "One pack is labelled “<b>75% lean</b>”.",
          "The other is labelled “<b>25% fat</b>”.",
          "Which looks better? Most\u00a0people <b>prefer the “lean” one</b>.",
          "But look inside: it's <b>the same beef</b>.",
          "Each label pulls your eye to the <b>good</b> or the <b>bad part</b>.",
          "<b>The fix:</b> flip the frame. Say it the other way round.",
          "Same facts, both ways. Now you judge <b>the beef, not the label</b>."
        ],
        say: [
          "Two packs of minced beef on the shelf.",
          "One pack is labelled: seventy-five percent lean.",
          "The other is labelled: twenty-five percent fat.",
          "Which one looks better? Most people prefer the lean one.",
          "But look inside. It's the same beef.",
          "Each label pulls your eye to the good part, or the bad part.",
          "The fix: flip the frame. Say it the other way round.",
          "Same facts, both ways. Now you judge the beef, not the label.",
          "The framing effect. The same fact sounds different depending on how it's put. Flip it and see."
        ]
      },
      el: {
        name: "Φαινόμενο πλαισίωσης", shareTitle: "Το φαινόμενο πλαισίωσης σε 30 δευτερόλεπτα",
        ecline: "Το ίδιο γεγονός ακούγεται αλλιώς ανάλογα με το πώς θα το πεις. Γύρνα το ανάποδα και δες.",
        lean: "75% άπαχο", fat: "25% λιπαρά", flipL: "= 25% λιπαρά", flipR: "= 75% άπαχο", tagW: 96,
        pl: "άπαχο", pf: "λιπαρά", same: ["ίδιος", "κιμάς"], rate: "Πόσο καλός σου φαίνεται",
        caps: [
          "Δύο συσκευασίες κιμά στο ράφι του σούπερ μάρκετ.",
          "Η μία ετικέτα γράφει «<b>75% άπαχο</b>».",
          "Η άλλη ετικέτα γράφει «<b>25% λιπαρά</b>».",
          "Ποιος κιμάς σου φαίνεται καλύτερος; Οι\u00a0περισσότεροι <b>προτιμούν τον «άπαχο»</b>.",
          "Όμως κοίτα μέσα: είναι <b>ο ίδιος κιμάς</b>.",
          "Κάθε ετικέτα τραβάει το βλέμμα σου στο <b>καλό</b> ή στο <b>κακό</b> κομμάτι.",
          "<b>Η λύση:</b> γύρνα το ανάποδα. Πες το και με τον άλλο τρόπο.",
          "Τα ίδια στοιχεία, και με τους δύο τρόπους. Τώρα κρίνεις <b>τον κιμά, όχι την ετικέτα</b>."
        ],
        say: [
          "Δύο συσκευασίες κιμά στο ράφι του σούπερ μάρκετ.",
          "Η μία ετικέτα γράφει: εβδομήντα πέντε τοις εκατό άπαχο.",
          "Η άλλη ετικέτα γράφει: είκοσι πέντε τοις εκατό λιπαρά.",
          "Ποιος κιμάς σου φαίνεται καλύτερος; Οι περισσότεροι προτιμούν τον άπαχο.",
          "Όμως κοίτα μέσα. Είναι ο ίδιος κιμάς.",
          "Κάθε ετικέτα τραβάει το βλέμμα σου στο καλό ή στο κακό κομμάτι.",
          "Η λύση: γύρνα το ανάποδα. Πες το και με τον άλλο τρόπο.",
          "Τα ίδια στοιχεία, και με τους δύο τρόπους. Τώρα κρίνεις τον κιμά, όχι την ετικέτα.",
          "Φαινόμενο πλαισίωσης. Το ίδιο γεγονός ακούγεται αλλιώς ανάλογα με το πώς θα το πεις. Γύρνα το ανάποδα και δες."
        ]
      },
      es: {
        name: "Efecto marco", shareTitle: "El efecto marco en 30 segundos",
        ecline: "El mismo dato suena distinto según cómo se diga. Dale la vuelta y verás.",
        lean: "75% magra", fat: "25% grasa", flipL: "= 25% grasa", flipR: "= 75% magra", tagW: 93,
        pl: "magra", pf: "grasa", same: ["misma", "carne"], rate: "Cuánto te convence",
        caps: [
          "Dos paquetes de carne picada en el estante.",
          "Uno lleva la etiqueta «<b>75% magra</b>».",
          "El otro lleva la etiqueta «<b>25% grasa</b>».",
          "¿Cuál parece mejor? La mayoría <b>prefiere el que dice «magra»</b>.",
          "Pero mira dentro: es <b>la misma carne</b>.",
          "Cada etiqueta te hace mirar la parte <b>buena</b> o la <b>mala</b>.",
          "<b>La solución:</b> dale la vuelta al encuadre. Dilo al revés.",
          "Los mismos datos, de las dos formas. Ahora juzgas <b>la carne, no la etiqueta</b>."
        ],
        say: [
          "Dos paquetes de carne picada en el estante.",
          "Uno lleva la etiqueta: setenta y cinco por ciento magra.",
          "El otro lleva la etiqueta: veinticinco por ciento grasa.",
          "¿Cuál parece mejor? La mayoría prefiere el que dice magra.",
          "Pero mira dentro. Es la misma carne.",
          "Cada etiqueta te hace mirar la parte buena, o la mala.",
          "La solución: dale la vuelta al encuadre. Dilo al revés.",
          "Los mismos datos, de las dos formas. Ahora juzgas la carne, no la etiqueta.",
          "El efecto marco. El mismo dato suena distinto según cómo se diga. Dale la vuelta y verás."
        ]
      },
      fr: {
        name: "Effet de cadrage", shareTitle: "L’effet de cadrage en 30 secondes",
        ecline: "Un même fait sonne différemment selon la façon de le dire. Inversez-le, et voyez.",
        lean: "75 % maigre", fat: "25 % gras", flipL: "= 25 % gras", flipR: "= 75 % maigre", tagW: 100,
        pl: "maigre", pf: "gras", same: ["même", "bœuf"], rate: "À quel point il plaît",
        caps: [
          "Deux barquettes de bœuf haché en rayon.",
          "L’une porte l’étiquette « <b>75 % maigre</b> ».",
          "L’autre porte l’étiquette « <b>25 % gras</b> ».",
          "Laquelle semble meilleure ? La plupart des gens <b>préfèrent la « maigre »</b>.",
          "Mais regardez dedans : c’est <b>le même bœuf</b>.",
          "Chaque étiquette attire votre œil vers la <b>bonne</b> ou la <b>mauvaise partie</b>.",
          "<b>La solution :</b> inversez le cadrage. Dites-le dans l’autre sens.",
          "Mêmes faits, dans les deux sens. Vous jugez enfin <b>le bœuf, pas l’étiquette</b>."
        ],
        say: [
          "Deux barquettes de bœuf haché en rayon.",
          "L’une porte l’étiquette : soixante-quinze pour cent maigre.",
          "L’autre porte l’étiquette : vingt-cinq pour cent gras.",
          "Laquelle semble meilleure ? La plupart des gens préfèrent la maigre.",
          "Mais regardez dedans. C’est le même bœuf.",
          "Chaque étiquette attire votre œil vers la bonne partie, ou vers la mauvaise.",
          "La solution : inversez le cadrage. Dites-le dans l’autre sens.",
          "Mêmes faits, dans les deux sens. Vous jugez enfin le bœuf, pas l’étiquette.",
          "L’effet de cadrage. Un même fait sonne différemment selon la façon de le dire. Inversez-le, et voyez."
        ]
      },
      de: {
        name: "Framing-Effekt", shareTitle: "Der Framing-Effekt in 30 Sekunden",
        ecline: "Dieselbe Tatsache klingt anders, je nachdem, wie man sie formuliert. Dreh sie um und sieh selbst.",
        lean: "75 % mager", fat: "25 % Fett", flipL: "= 25 % Fett", flipR: "= 75 % mager", tagW: 100,
        pl: "mager", pf: "Fett", same: ["selbes", "Hack"], rate: "Wie gut es wirkt",
        caps: [
          "Zwei Packungen Rinderhack im Regal.",
          "Auf der einen steht „<b>75 % mager</b>“.",
          "Auf der anderen steht „<b>25 % Fett</b>“.",
          "Welche wirkt besser? Die meisten Menschen <b>bevorzugen die „magere“</b>.",
          "Aber schau hinein: Es ist <b>dasselbe Fleisch</b>.",
          "Jedes Etikett lenkt deinen Blick auf den <b>guten</b> oder den <b>schlechten Teil</b>.",
          "<b>Die Lösung:</b> Dreh den Rahmen um. Sag es andersherum.",
          "Gleiche Fakten, in beide Richtungen. Jetzt beurteilst du <b>das Fleisch, nicht das Etikett</b>."
        ],
        say: [
          "Zwei Packungen Rinderhack im Regal.",
          "Auf der einen steht: fünfundsiebzig Prozent mager.",
          "Auf der anderen steht: fünfundzwanzig Prozent Fett.",
          "Welche wirkt besser? Die meisten Menschen bevorzugen die magere.",
          "Aber schau hinein. Es ist dasselbe Fleisch.",
          "Jedes Etikett lenkt deinen Blick auf den guten Teil oder auf den schlechten.",
          "Die Lösung: Dreh den Rahmen um. Sag es andersherum.",
          "Gleiche Fakten, in beide Richtungen. Jetzt beurteilst du das Fleisch, nicht das Etikett.",
          "Der Framing-Effekt. Dieselbe Tatsache klingt anders, je nachdem, wie man sie formuliert. Dreh sie um und sieh selbst."
        ]
      },
      it: {
        name: "Effetto framing", shareTitle: "L’effetto framing in 30 secondi",
        ecline: "Lo stesso fatto suona diverso a seconda di come lo dici. Ribaltalo e vedrai.",
        lean: "75% magro", fat: "25% grasso", flipL: "= 25% grasso", flipR: "= 75% magro", tagW: 106,
        pl: "magro", pf: "grasso", same: ["stessa", "carne"], rate: "Quanto ti convince",
        caps: [
          "Due confezioni di carne macinata sullo scaffale.",
          "Su una c’è scritto «<b>75% magro</b>».",
          "Sull’altra c’è scritto «<b>25% grasso</b>».",
          "Quale sembra migliore? Quasi tutti <b>preferiscono quella «magra»</b>.",
          "Ma guarda dentro: è <b>la stessa carne</b>.",
          "Ogni etichetta ti porta l’occhio sulla <b>parte buona</b> o su <b>quella cattiva</b>.",
          "<b>La soluzione:</b> ribalta la formulazione. Dillo al contrario.",
          "Stessi fatti, in entrambi i modi. Ora giudichi <b>la carne, non l’etichetta</b>."
        ],
        say: [
          "Due confezioni di carne macinata sullo scaffale.",
          "Su una c’è scritto: settantacinque per cento magro.",
          "Sull’altra c’è scritto: venticinque per cento grasso.",
          "Quale sembra migliore? Quasi tutti preferiscono quella magra.",
          "Ma guarda dentro. È la stessa carne.",
          "Ogni etichetta ti porta l’occhio sulla parte buona, o su quella cattiva.",
          "La soluzione: ribalta la formulazione. Dillo al contrario.",
          "Stessi fatti, in entrambi i modi. Ora giudichi la carne, non l’etichetta.",
          "L’effetto framing. Lo stesso fatto suona diverso a seconda di come lo dici. Ribaltalo e vedrai."
        ]
      }
    },
    svg(T) {
      const pack = s => {
        const good = s === "L", tag = good ? T.flipL : T.flipR;
        return `<g data-k="pack${s}"><g transform="translate(${PX[s]} 0)">
          <rect class="fe-tray" x="${-TW}" y="${TT}" width="${2 * TW}" height="${TB - TT}" rx="12"/>
          <rect class="fe-lip" x="${-TW + 7}" y="${TT + 7}" width="${2 * TW - 14}" height="${TB - TT - 14}" rx="7"/>
          <path class="fe-mince" data-k="mince${s}" d="${MINCE}"/>
          <g data-k="bar${s}" clip-path="url(#fe-clip-${s})">
            <rect class="fe-base" x="${BL}" y="${BY}" width="${BW}" height="${BH}" rx="4"/>
            <g data-k="lean${s}"><path class="fe-seg" d="${LEAN}"/><path class="fe-hi g" data-k="hl${s}" d="${LEAN}"/>
              <text class="fe-pct" x="${LC}" y="${BY + 16}">75%</text><text class="fe-part" x="${LC}" y="${BY + BH + 14}">${T.pl}</text>
              <text class="fe-part g" data-k="tl${s}" x="${LC}" y="${BY + BH + 14}">${T.pl}</text></g>
            <g data-k="fat${s}"><path class="fe-seg" d="${FAT}"/><path class="fe-hi b" data-k="hf${s}" d="${FAT}"/>
              <text class="fe-pct" x="${FC}" y="${BY + 16}">25%</text><text class="fe-part e" x="${BR}" y="${BY + BH + 14}">${T.pf}</text>
              <text class="fe-part e b" data-k="tf${s}" x="${BR}" y="${BY + BH + 14}">${T.pf}</text></g>
          </g>
          <path class="fe-arr ${good ? "g" : "b"}" data-k="arr${s}" d=""/>
          <g transform="rotate(${good ? -2 : 2} 0 ${SY})">
            <g class="fe-st blank"><rect x="-56" y="${SY - 16}" width="112" height="32" rx="7"/><line x1="-30" y1="${SY - 3}" x2="30" y2="${SY - 3}"/><line x1="-18" y1="${SY + 5}" x2="18" y2="${SY + 5}"/></g>
            <g class="fe-st ${good ? "g" : "b"}" data-k="st${s}"><rect x="-56" y="${SY - 16}" width="112" height="32" rx="7"/><text y="${SY + 6}">${good ? T.lean : T.fat}</text></g>
          </g>
          <g class="fe-tag ${good ? "b" : "g"}" data-k="tag${s}"><rect x="${-T.tagW / 2}" y="70" width="${T.tagW}" height="20" rx="5"/><text y="84">${tag}</text></g>
        </g></g>`;
      };
      const meter = s => `<g transform="translate(${PX[s]} 0)">
          <g class="fe-face ink" data-k="fi${s}"><circle class="o" r="10"/><circle class="e" cx="-3.4" cy="-2.6" r="1.4"/><circle class="e" cx="3.4" cy="-2.6" r="1.4"/><path data-k="mi${s}" d=""/></g>
          <g class="fe-face ok" data-k="fo${s}"><circle class="o" r="10"/><circle class="e" cx="-3.4" cy="-2.6" r="1.4"/><circle class="e" cx="3.4" cy="-2.6" r="1.4"/><path data-k="mo${s}" d=""/></g>
          <rect class="fe-fill" data-k="fill${s}" x="${MX}" y="${MY - 5}" height="10" rx="5"/>
          <rect class="fe-fillok" data-k="fok${s}" x="${MX}" y="${MY - 5}" height="10" rx="5"/>
          <rect class="fe-track" x="${MX}" y="${MY - 5}" width="${MW}" height="10" rx="5"/></g>`;
      return `
        <defs>${["L", "R"].map(s => `<clipPath id="fe-clip-${s}"><rect data-k="clip${s}" x="${BL - 3}" y="${BY - 3}" height="${BH + 24}" width="0"/></clipPath>`).join("")}</defs>
        <g data-k="shelf"><rect class="fe-shelf" x="14" y="${SHELF}" width="372" height="9" rx="2"/></g>
        ${pack("L")}${pack("R")}
        <g class="fe-eq" data-k="eq"><line x1="191" x2="209" y1="${BY + 8}" y2="${BY + 8}"/><line x1="191" x2="209" y1="${BY + 16}" y2="${BY + 16}"/>
          <text class="fe-note" x="200" y="${BY + 38}">${T.same[0]}</text><text class="fe-note" x="200" y="${BY + 50}">${T.same[1]}</text></g>
        <g data-k="meters">${meter("L")}${meter("R")}<text class="fe-note" x="200" y="${MY + 28}">${T.rate}</text></g>
        <g class="fe-eq ok" data-k="eq2"><line x1="191" x2="209" y1="${MY - 4}" y2="${MY - 4}"/><line x1="191" x2="209" y1="${MY + 4}" y2="${MY + 4}"/></g>`;
    },
    S0: { packs: 0, stL: 0, stR: 0, rate: 0, vL: .5, vR: .5, look: 0, eq: 0, ptL: 0, ptR: 0, arrOff: 0, flip: 0, both: 0, fair: 0, eq2: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = v; };
      op("shelf", clamp(S.packs * 3));
      const appear = { L: clamp(S.packs / .6), R: clamp((S.packs - .4) / .6) };
      for (const s of ["L", "R"]) {
        const a = appear[s], st = S["st" + s], pt = S["pt" + s];
        k("pack" + s).setAttribute("transform", `translate(0 ${(-12 * (1 - a)).toFixed(2)})`);
        op("pack" + s, a);
        // sticker text pops in
        const sc = .7 + .3 * st;
        k("st" + s).setAttribute("transform", `translate(0 ${SY}) scale(${sc.toFixed(3)}) translate(0 ${-SY})`);
        op("st" + s, clamp(st * 2));
        // look inside: the mince gives way to the split
        op("mince" + s, .85 - .77 * S.look);
        k("clip" + s).setAttribute("width", (BW + 6) * S.look);
        // each label lights up its own part; the flip lights up the other one
        const good = s === "L";
        const hl = good ? pt : S.both, hf = good ? S.both : pt;
        op("hl" + s, hl); op("tl" + s, hl);
        op("hf" + s, hf); op("tf" + s, hf);
        const dim = 1 - .65 * pt * (1 - S.both);
        op(good ? "fatL" : "leanR", dim);
        // arrow from the sticker to the part it names
        const x0 = good ? LC : 18, y0 = SY + 19, x1 = good ? LC : FC, y1 = BY - 4;
        const p = clamp(pt * 1.4), xe = x0 + (x1 - x0) * p, ye = y0 + (y1 - y0) * p;
        const ang = Math.atan2(y1 - y0, x1 - x0), h = 5.5;
        const hx = a2 => (xe - h * Math.cos(ang + a2)).toFixed(2), hy = a2 => (ye - h * Math.sin(ang + a2)).toFixed(2);
        k("arr" + s).setAttribute("d", `M${x0} ${y0} L${xe.toFixed(2)} ${ye.toFixed(2)}` + (p > .15 ? ` M${hx(.5)} ${hy(.5)} L${xe.toFixed(2)} ${ye.toFixed(2)} L${hx(-.5)} ${hy(-.5)}` : ""));
        op("arr" + s, (pt > 0 ? 1 : 0) * (1 - S.arrOff));
        // flipped wording drops down under the label
        const f = S.flip;
        k("tag" + s).setAttribute("transform", `translate(0 70) scale(1 ${Math.max(0, f).toFixed(3)}) translate(0 -70)`);
        op("tag" + s, f > 0 ? clamp(f * 3) : 0);
        // meters: fill and face follow the rating
        const v = S["v" + s], w = MW * v;
        for (const r of ["fill", "fok"]) k(r + s).setAttribute("width", w.toFixed(2));
        op("fok" + s, S.fair);
        const c = (v - .5) * 13, my = 3.2 - c * .25;
        const mouth = `M-4.8 ${my.toFixed(2)} Q0 ${(my + c).toFixed(2)} 4.8 ${my.toFixed(2)}`;
        k("mi" + s).setAttribute("d", mouth); k("mo" + s).setAttribute("d", mouth);
        for (const f2 of ["fi", "fo"]) k(f2 + s).setAttribute("transform", `translate(${MX - 16} ${MY})`);
        op("fi" + s, 1 - S.fair); op("fo" + s, S.fair);
      }
      op("meters", S.rate);
      op("eq", S.eq);
      op("eq2", S.eq2);
    },
    beats: [
      { steps: [{ to: { packs: 1 }, ms: 900, ease: "inOut", sfx: "pluck" }] },
      { steps: [{ to: { stL: 1 }, ms: 450, ease: "out", sfx: "pop" }] },
      { steps: [{ to: { stR: 1 }, ms: 450, ease: "out", sfx: "pop" }] },
      { steps: [{ to: { rate: 1 }, ms: 400 }, { wait: 200 }, { to: { vL: .88, vR: .3 }, ms: 1100, ease: "inOut", sfx: "tick" }] },
      { steps: [{ to: { look: 1 }, ms: 1200, ease: "inOut", sfx: "whoosh" }, { to: { eq: 1 }, ms: 400 }] },
      { steps: [{ to: { ptL: 1 }, ms: 650, sfx: "tick" }, { wait: 200 }, { to: { ptR: 1 }, ms: 650 }] },
      { steps: [{ to: { arrOff: 1 }, ms: 300 }, { to: { flip: 1 }, ms: 650, ease: "out", sfx: "spring" }, { wait: 150 }, { to: { both: 1 }, ms: 600 }] },
      { steps: [{ to: { vL: .64, vR: .64, fair: 1 }, ms: 1200, ease: "inOut", sfx: "chime" }, { to: { eq2: 1 }, ms: 400 }], hold: 4200 }
    ]
  };
})();
