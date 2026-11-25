/* IKEA effect: a flat-pack shelf you build yourself, the same shelf built by the shop, and the extra
   coins your effort adds to your own price. Scene for anim.js. */
(function () {
  const KEY = "ikea-effect", P = `.bp[data-scene="${KEY}"]`;
  const FLOOR = 228;
  const W = 70, H = 150;                   // shelf size
  const SX0 = 165, YX = 18, TX = 312;      // your shelf's left edge while you build it and after it slides aside; the shop's shelf
  const YC = 132, TC = 268;                // coin stacks: yours, the shop's
  const LEAN = 4.5;                        // degrees your shelf leans
  const BX = 26, BY = 132, BW = 84, BH = 96; // the flat-pack box
  const LX = YX + W / 2 + 2;               // your label, nudged right so the longest Greek one clears the edge
  const START = [BX + BW / 2 - SX0, 190 - FLOOR];   // where the parts sit inside the box, in shelf coordinates
  // the parts, in shelf coordinates (origin at the shelf's bottom-left corner on the floor):
  // centre, size, exploded offset and tilt, order out of the box (o) and order of assembly (b)
  const PARTS = [
    { k: "pL", cx: 3, cy: -75, w: 6, h: H, dx: -26, dy: -6, r: -5, lie: 90, o: 0, b: 1 },
    { k: "pR", cx: 67, cy: -75, w: 6, h: H, dx: 26, dy: -6, r: 5, lie: 90, o: 1, b: 2 },
    { k: "pF", cx: 35, cy: -7, w: 58, h: 6, dx: 0, dy: -3, r: 2, lie: 0, o: 6, b: 0 },
    { k: "pC", cx: 35, cy: -42.25, w: 58, h: 5, dx: 0, dy: -2, r: -4, lie: 0, o: 5, b: 3 },
    { k: "pB", cx: 35, cy: -77, w: 58, h: 5, dx: 0, dy: -8, r: 4, lie: 0, o: 4, b: 4 },
    { k: "pA", cx: 35, cy: -111.75, w: 58, h: 5, dx: 0, dy: -14, r: -3, lie: 0, o: 3, b: 5 },
    { k: "pT", cx: 35, cy: -147, w: 58, h: 6, dx: 0, dy: -24, r: 3, lie: 0, o: 2, b: 6 }
  ];
  const coinY = i => FLOOR - 10 - 7 * i;    // top face of the i-th coin in a stack
  const tagY = c => coinY(Math.max(1, c) - 1) - 20;   // price tag centre, riding on a stack of c coins
  const cl = v => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const inOut = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const back = t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
  const bounce = t => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375;
    return n * (t -= 2.625 / d) * t + .984375;
  };
  const board = (x, y, w, h) => `<rect class="ik-bd" x="${x}" y="${y}" width="${w}" height="${h}" rx="1"/>`;
  const coin = cls => `<path class="ik-coin ${cls}" d="M-15 0 V6 A15 4 0 0 0 15 6 V0"/><ellipse class="ik-coin ${cls}" rx="15" ry="4"/>`;
  const TAG = "M-20 -11 H23 Q27 -11 27 -7 V7 Q27 11 23 11 H-20 L-29 0 Z";

  window.BiasAnim.SCENES[KEY] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
      ${P} .ik-floor{stroke:var(--rule);stroke-width:2;stroke-linecap:round}
      ${P} .ik-bd{fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linejoin:round}
      ${P} .ik-box{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .ik-flap{stroke:var(--ink);stroke-width:2.2;stroke-linecap:round}
      ${P} .ik-pic{fill:none;stroke:var(--muted);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ik-arw{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ik-key{fill:none;stroke:var(--ink);stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ik-clk circle{fill:var(--surface);stroke:var(--ink);stroke-width:2}
      ${P} .ik-clk line{stroke:var(--q);stroke-width:2;stroke-linecap:round}
      ${P} .ik-note{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .ik-sw{fill:var(--surface);stroke:var(--ink);stroke-width:1.4;stroke-linejoin:round}
      ${P} .ik-sw.hd{fill:var(--ink);stroke:none}
      ${P} .ik-sw.th{fill:none;stroke-width:1.1;stroke-linecap:round}
      ${P} .ik-qm{font:700 14px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .ik-who circle,${P} .ik-who path{fill:none;stroke:var(--muted);stroke-width:2;stroke-linecap:round}
      ${P} .ik-heart{fill:var(--q);stroke:var(--q);stroke-width:1.5;stroke-linejoin:round}
      ${P} .ik-lab{font:600 11.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ik-scr{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round}
      ${P} .ik-eq line{stroke:var(--q);stroke-width:2.4;stroke-linecap:round}
      ${P} .ik-eq.ok line{stroke:var(--good)}
      ${P} .ik-coin{fill:var(--surface);stroke:var(--ink);stroke-width:1.5}
      ${P} .ik-coin.e{stroke:var(--q);stroke-width:1.8}
      ${P} .ik-coin.g{stroke:var(--faint);stroke-dasharray:2.5 2.5}
      ${P} .ik-tag path{fill:var(--surface);stroke:var(--ink);stroke-width:1.8;stroke-linejoin:round}
      ${P} .ik-tag circle{fill:none;stroke:var(--ink);stroke-width:1.4}
      ${P} .ik-tag text{font:700 14px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ik-tag.ok path,${P} .ik-tag.ok circle{stroke:var(--good)}
      ${P} .ik-tag.ok text{fill:var(--good)}
      ${P} .ik-brace{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ik-plus{font:700 13px var(--display);fill:var(--q)}
      ${P} .ik-eff{font:500 9.5px var(--mono);fill:var(--q)}
      ${P} .ik-chk circle{fill:var(--surface);stroke:var(--good);stroke-width:2}
      ${P} .ik-chk path{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
    `,
    text: {
      hu: {
        name: "IKEA-hatás", shareTitle: "Az IKEA-hatás, 30 másodpercben",
        ecline: "Amit magad építesz, többet ér. Úgy ítéld meg, mintha valaki más készítette volna.",
        yours: "A tiéd", yoursW: 34, shops: "A boltié", stranger: "Egy idegené", same: "ugyanaz a modell",
        hrs: n => (n === 1 ? "1 óra" : `${n} óra`), eur: v => `${v} €`, plus: "+40 €", effort: "a te munkád",
        caps: [
          "Egy polcot <b>magad</b> építesz, egy lapraszerelhető csomagból.",
          "Két óra, egy imbuszkulcs, <b>egy tartalék csavar</b>.",
          "Kicsit ferde lesz. De te <b>szereted</b>.",
          "Mellette <b>ugyanaz a polc</b>, a bolt szerelte össze.",
          "Eladnád? A tiédért <b>80 €</b>-t kérnél, a bolt polcáért <b>40 €</b>-t.",
          "A <b>munkád</b> miatt <b>többet ér</b>.",
          "<b>A megoldás:</b> képzeld el, hogy egy idegen építette. Mennyit ér most?",
          "Ugyanaz a polc, ugyanaz az ár. <b>A dolgot ítéld meg, ne a munkát.</b>"
        ],
        say: [
          "Egy polcot magad építesz, egy lapraszerelhető csomagból.",
          "Két óra, egy imbuszkulcs, és egy tartalék csavar.",
          "Kicsit ferde lesz. De te szereted.",
          "Mellette ugyanaz a polc, amit a bolt szerelt össze.",
          "Eladnád? A tiédért nyolcvan eurót kérnél, a bolt polcáért negyvenet.",
          "A munkád miatt többet ér.",
          "A megoldás: képzeld el, hogy egy idegen építette. Mennyit ér most?",
          "Ugyanaz a polc, ugyanaz az ár. A dolgot ítéld meg, ne a munkát.",
          "Az IKEA-hatás. Amit magad építesz, többet ér. Úgy ítéld meg, mintha valaki más készítette volna."
        ]
      },
      en: {
        name: "IKEA effect", shareTitle: "IKEA effect, explained in 30 seconds",
        ecline: "What you build yourself feels worth more. Judge it as if someone else made it.",
        yours: "Yours", yoursW: 34, shops: "The shop's", stranger: "A stranger's", same: "same model",
        hrs: n => (n === 1 ? "1 hour" : `${n} hours`), eur: v => `€${v}`, plus: "+€40", effort: "your effort",
        caps: [
          "You build a shelf <b>yourself</b>, from a flat pack.",
          "Two hours, one Allen key, <b>one spare screw</b>.",
          "It leans a little. But you <b>love</b> it.",
          "Next to it, <b>the same shelf</b>, assembled by the shop.",
          "Selling? You'd want <b>€80</b> for yours, <b>€40</b> for the shop's.",
          "Your <b>effort</b> made it feel <b>worth more</b>.",
          "<b>The fix:</b> picture a stranger built it. What's it worth now?",
          "Same shelf, same price. <b>Judge the thing, not the effort.</b>"
        ],
        say: [
          "You build a shelf yourself, from a flat pack.",
          "Two hours, one Allen key, and one spare screw.",
          "It leans a little. But you love it.",
          "Next to it, the same shelf, assembled by the shop.",
          "Selling? You'd want eighty euros for yours, and forty for the shop's.",
          "Your effort made it feel worth more.",
          "The fix: picture a stranger built it. What's it worth now?",
          "Same shelf, same price. Judge the thing, not the effort.",
          "The IKEA effect. What you build yourself feels worth more. Judge it as if someone else made it."
        ]
      },
      el: {
        name: "Φαινόμενο IKEA", shareTitle: "Το φαινόμενο IKEA σε 30 δευτερόλεπτα",
        ecline: "Ό,τι φτιάχνεις με τα χέρια σου μοιάζει πιο πολύτιμο. Κρίνε το σαν να το έφτιαξε κάποιος\u00a0άλλος.",
        yours: "Δική σου", yoursW: 52, shops: "Του μαγαζιού", stranger: "Ενός αγνώστου", same: "ίδιο μοντέλο",
        hrs: n => (n === 1 ? "1 ώρα" : `${n} ώρες`), eur: v => `${v}\u00a0€`, plus: "+40\u00a0€", effort: "ο κόπος σου",
        caps: [
          "Αγοράζεις μια βιβλιοθήκη σε κούτα και τη στήνεις <b>με τα χέρια σου</b>.",
          "Δύο ώρες, ένα κλειδάκι άλεν, και στο τέλος <b>περισσεύει μια βίδα</b>.",
          "Γέρνει λίγο. Εσύ όμως τη <b>λατρεύεις</b>.",
          "Δίπλα της, <b>η ίδια ακριβώς βιβλιοθήκη</b>, στημένη από το μαγαζί.",
          "Πόσο θα τις πουλούσες; Τη\u00a0δική\u00a0σου <b>80\u00a0€</b>, την άλλη <b>40\u00a0€</b>.",
          "Ο <b>κόπος σου</b> την κάνει να μοιάζει <b>πιο πολύτιμη</b>.",
          "<b>Η λύση:</b> φαντάσου ότι την έφτιαξε ένας άγνωστος. Πόσο αξίζει τώρα;",
          "Ίδια βιβλιοθήκη, ίδια τιμή. <b>Κρίνε το αποτέλεσμα, όχι τον κόπο.</b>"
        ],
        say: [
          "Αγοράζεις μια βιβλιοθήκη σε κούτα και τη στήνεις με τα χέρια σου.",
          "Δύο ώρες, ένα κλειδάκι άλεν, και στο τέλος περισσεύει μια βίδα.",
          "Γέρνει λίγο. Εσύ όμως τη λατρεύεις.",
          "Δίπλα της, η ίδια ακριβώς βιβλιοθήκη, στημένη από το μαγαζί.",
          "Πόσο θα τις πουλούσες; Τη δική σου ογδόντα ευρώ, την άλλη σαράντα.",
          "Ο κόπος σου την κάνει να μοιάζει πιο πολύτιμη.",
          "Η λύση: φαντάσου ότι την έφτιαξε ένας άγνωστος. Πόσο αξίζει τώρα;",
          "Ίδια βιβλιοθήκη, ίδια τιμή. Κρίνε το αποτέλεσμα, όχι τον κόπο.",
          "Φαινόμενο IKEA. Ό,τι φτιάχνεις με τα χέρια σου μοιάζει πιο πολύτιμο. Κρίνε το σαν να το έφτιαξε κάποιος άλλος."
        ]
      },
      es: {
        name: "Efecto IKEA", shareTitle: "El efecto IKEA en 30 segundos",
        ecline: "Lo que construyes tú mismo parece valer más. Júzgalo como si lo hubiera hecho otra persona.",
        yours: "La tuya", yoursW: 42, shops: "De la tienda", stranger: "De un extraño", same: "mismo modelo",
        hrs: n => (n === 1 ? "1 hora" : `${n} horas`), eur: v => `${v} €`, plus: "+40 €", effort: "tu esfuerzo",
        caps: [
          "Montas <b>tú mismo</b> una estantería que viene por piezas.",
          "Dos horas, una llave Allen y <b>un tornillo que sobra</b>.",
          "Está un poco torcida. Pero te <b>encanta</b>.",
          "Al lado, <b>la misma estantería</b>, montada por la tienda.",
          "¿Venderla? Pedirías <b>80 €</b> por la tuya y <b>40 €</b> por la de la tienda.",
          "Tu <b>esfuerzo</b> hizo que pareciera <b>valer más</b>.",
          "<b>La solución:</b> imagina que la montó un extraño. ¿Cuánto vale ahora?",
          "Misma estantería, mismo precio. <b>Juzga el objeto, no el esfuerzo.</b>"
        ],
        say: [
          "Montas tú mismo una estantería que viene por piezas.",
          "Dos horas, una llave Allen, y un tornillo que sobra.",
          "Está un poco torcida. Pero te encanta.",
          "Al lado, la misma estantería, montada por la tienda.",
          "¿Venderla? Pedirías ochenta euros por la tuya, y cuarenta por la de la tienda.",
          "Tu esfuerzo hizo que pareciera valer más.",
          "La solución: imagina que la montó un extraño. ¿Cuánto vale ahora?",
          "Misma estantería, mismo precio. Juzga el objeto, no el esfuerzo.",
          "El efecto IKEA. Lo que construyes tú mismo parece valer más. Júzgalo como si lo hubiera hecho otra persona."
        ]
      },
      fr: {
        name: "Effet IKEA", shareTitle: "L’effet IKEA en 30 secondes",
        ecline: "Ce que vous construisez vous-même semble valoir plus. Jugez-le comme si quelqu’un d’autre l’avait fait.",
        yours: "La vôtre", yoursW: 47, shops: "Du magasin", stranger: "D’un inconnu", same: "même modèle",
        hrs: n => (n > 1 ? `${n} heures` : `${n} heure`), eur: v => `${v} €`, plus: "+40 €", effort: "votre effort",
        caps: [
          "Vous montez <b>vous-même</b> une étagère en kit.",
          "Deux heures, une clé Allen, <b>une vis en trop</b>.",
          "Elle penche un peu. Mais vous l’<b>adorez</b>.",
          "À côté, <b>la même étagère</b>, montée par le magasin.",
          "À vendre ? Vous demanderiez <b>80 €</b> pour la vôtre, <b>40 €</b> pour celle du magasin.",
          "Votre <b>effort</b> lui donne l’air de <b>valoir plus</b>.",
          "<b>La solution :</b> imaginez qu’un inconnu l’a montée. Combien vaut-elle ?",
          "Même étagère, même prix. <b>Jugez l’objet, pas l’effort.</b>"
        ],
        say: [
          "Vous montez vous-même une étagère en kit.",
          "Deux heures, une clé Allen, et une vis en trop.",
          "Elle penche un peu. Mais vous l’adorez.",
          "À côté, la même étagère, montée par le magasin.",
          "À vendre ? Vous demanderiez quatre-vingts euros pour la vôtre, et quarante pour celle du magasin.",
          "Votre effort lui donne l’air de valoir plus.",
          "La solution : imaginez qu’un inconnu l’a montée. Combien vaut-elle maintenant ?",
          "Même étagère, même prix. Jugez l’objet, pas l’effort.",
          "L’effet IKEA. Ce que vous construisez vous-même semble valoir plus. Jugez-le comme si quelqu’un d’autre l’avait fait."
        ]
      },
      de: {
        name: "IKEA-Effekt", shareTitle: "Der IKEA-Effekt in 30 Sekunden",
        ecline: "Was du selbst baust, wirkt wertvoller. Bewerte es so, als hätte es jemand anderes gemacht.",
        yours: "Deins", yoursW: 34, shops: "Vom Laden", stranger: "Von Fremden", same: "gleiches Modell",
        hrs: n => (n === 1 ? "1 Stunde" : `${n} Stunden`), eur: v => `${v} €`, plus: "+40 €", effort: "dein Aufwand",
        caps: [
          "Du baust ein Regal aus dem Flachpaket <b>selbst</b> zusammen.",
          "Zwei Stunden, ein Inbusschlüssel, <b>eine Schraube übrig</b>.",
          "Es steht etwas schief. Aber du <b>liebst</b> es.",
          "Daneben <b>dasselbe Regal</b>, vom Laden aufgebaut.",
          "Verkaufen? Für deins willst du <b>80 €</b>, für das vom Laden <b>40 €</b>.",
          "Dein <b>Aufwand</b> lässt es <b>wertvoller</b> wirken.",
          "<b>Die Lösung:</b> Stell dir vor, jemand Fremdes hat es gebaut. Was ist es jetzt wert?",
          "Gleiches Regal, gleicher Preis. <b>Bewerte die Sache, nicht die Mühe.</b>"
        ],
        say: [
          "Du baust ein Regal aus dem Flachpaket selbst zusammen.",
          "Zwei Stunden, ein Inbusschlüssel, und eine Schraube bleibt übrig.",
          "Es steht etwas schief. Aber du liebst es.",
          "Daneben dasselbe Regal, vom Laden aufgebaut.",
          "Verkaufen? Für deins willst du achtzig Euro, für das vom Laden vierzig.",
          "Dein Aufwand lässt es wertvoller wirken.",
          "Die Lösung: Stell dir vor, jemand Fremdes hat es gebaut. Was ist es jetzt wert?",
          "Gleiches Regal, gleicher Preis. Bewerte die Sache, nicht die Mühe.",
          "Der IKEA-Effekt. Was du selbst baust, wirkt wertvoller. Bewerte es so, als hätte es jemand anderes gemacht."
        ]
      },
      it: {
        name: "Effetto IKEA", shareTitle: "L’effetto IKEA in 30 secondi",
        ecline: "Ciò che costruisci da te sembra valere di più. Giudicalo come se l’avesse fatto qualcun altro.",
        yours: "La tua", yoursW: 36, shops: "Del negozio", stranger: "Di un estraneo", same: "stesso modello",
        hrs: n => (n === 1 ? "1 ora" : `${n} ore`), eur: v => `${v} €`, plus: "+40 €", effort: "lo sforzo",
        caps: [
          "Monti <b>con le tue mani</b> una libreria in kit.",
          "Due ore, una chiave a brugola, <b>una vite avanzata</b>.",
          "È un po’ storta. Ma la <b>adori</b>.",
          "Accanto, <b>la stessa libreria</b>, montata dal negozio.",
          "Se la vendessi? Chiederesti <b>80 €</b> per la tua, <b>40 €</b> per quella del negozio.",
          "Il tuo <b>sforzo</b> la fa sembrare <b>più preziosa</b>.",
          "<b>La soluzione:</b> immagina che l’abbia montata un estraneo. Quanto vale ora?",
          "Stessa libreria, stesso prezzo. <b>Giudica l’oggetto, non lo sforzo.</b>"
        ],
        say: [
          "Monti con le tue mani una libreria in kit.",
          "Due ore, una chiave a brugola, e una vite avanzata.",
          "È un po’ storta. Ma la adori.",
          "Accanto, la stessa libreria, montata dal negozio.",
          "Se la vendessi? Chiederesti ottanta euro per la tua, e quaranta per quella del negozio.",
          "Il tuo sforzo la fa sembrare più preziosa.",
          "La soluzione: immagina che l’abbia montata un estraneo. Quanto vale ora?",
          "Stessa libreria, stesso prezzo. Giudica l’oggetto, non lo sforzo.",
          "L’effetto IKEA. Ciò che costruisci da te sembra valere di più. Giudicalo come se l’avesse fatto qualcun altro."
        ]
      }
    },
    svg(T) {
      const parts = PARTS.map(p => `<g data-k="${p.k}">${board(-p.w / 2, -p.h / 2, p.w, p.h)}</g>`).join("");
      const twin = PARTS.map(p => board(p.cx - p.w / 2, p.cy - p.h / 2, p.w, p.h)).join("");
      const tag = (key, ok) => `<g class="ik-tag${ok ? " ok" : ""}" data-k="${key}"><path d="${TAG}"/><circle cx="-21" r="2.2"/><text data-k="${key}t" x="4" y="5"></text></g>`;
      let yc = "", tc = "";
      for (let i = 0; i < 8; i++) {
        yc += i < 4 ? `<g data-k="y${i}">${coin("")}</g>`
          : `<g data-k="y${i}"><g data-k="y${i}n">${coin("")}</g><g data-k="y${i}e">${coin("e")}</g><g data-k="y${i}g">${coin("g")}</g></g>`;
      }
      for (let i = 0; i < 4; i++) tc += `<g data-k="t${i}">${coin("")}</g>`;
      const bx = BX + BW / 2;
      return `
        <line class="ik-floor" x1="14" y1="${FLOOR}" x2="386" y2="${FLOOR}"/>
        <g data-k="twin">${twin}</g>
        <g data-k="mine">
          <g data-k="shelf">${parts}</g>
          <g data-k="arrows"><path class="ik-arw" d="M-15 -62 H0 M-5 -67 L0 -62 L-5 -57"/><path class="ik-arw" d="M85 -62 H70 M75 -67 L70 -62 L75 -57"/></g>
          <g data-k="screw"><rect class="ik-sw hd" x="-7" y="-9" width="3" height="9" rx="1"/>
            <path class="ik-sw" d="M-4 -6 H4 L7.5 -4.5 L4 -3 H-4 Z"/><path class="ik-sw th" d="M-2 -6 L-0.5 -3 M1 -6 L2.5 -3"/></g>
          <text class="ik-qm" data-k="qm">?</text>
          <g data-k="key"><path class="ik-key" d="M0 0 H9 Q11 0 11 2 V25"/></g>
          <g data-k="heart"><path class="ik-heart" d="M0 7 C-11 -1 -11 -9 -5 -9 C-2.5 -9 0 -7 0 -4.5 C0 -7 2.5 -9 5 -9 C11 -9 11 -1 0 7 Z"/></g>
          <g class="ik-who" data-k="who"><circle cy="-7" r="6"/><path d="M-11 11 Q-11 2 0 2 Q11 2 11 11"/></g>
        </g>
        <g data-k="box">
          <line class="ik-flap" data-k="flL" x1="${BX}" y1="${BY}" x2="${bx}" y2="${BY}"/>
          <line class="ik-flap" data-k="flR" x1="${BX + BW}" y1="${BY}" x2="${bx}" y2="${BY}"/>
          <rect class="ik-box" x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="2"/>
          <path class="ik-pic" d="M${bx - 10} ${BY + 36} h20 v32 h-20 Z M${bx - 10} ${BY + 46.7} h20 M${bx - 10} ${BY + 57.3} h20"/>
          <path class="ik-pic" d="M${BX + BW - 15} ${BY + 20} v-10 m-3 3 l3 -3 l3 3 M${BX + BW - 8} ${BY + 20} v-10 m-3 3 l3 -3 l3 3 M${BX + BW - 19} ${BY + 23} h15"/>
        </g>
        <g class="ik-clk" data-k="clock"><circle cx="330" cy="70" r="13"/>
          <line data-k="hh" x1="330" y1="70" x2="330" y2="63"/><line data-k="mh" x1="330" y1="70" x2="330" y2="60"/>
          <text class="ik-note" data-k="hrs" x="330" y="100"></text></g>
        <g class="ik-eq" data-k="same"><line x1="191" x2="209" y1="150" y2="150"/><line x1="191" x2="209" y1="157" y2="157"/>
          <text class="ik-note" x="200" y="176">${T.same}</text></g>
        ${yc}${tc}
        <g data-k="tagY">${tag("tYn")}${tag("tYo", 1)}</g>
        <g data-k="tagT">${tag("tTn")}${tag("tTo", 1)}</g>
        <g data-k="eff"><path class="ik-brace" d="M152 165 Q157 165 157 170 V174 Q157 179 161 179 Q157 179 157 184 V188 Q157 193 152 193"/>
          <text class="ik-plus" x="165" y="177">${T.plus}</text><text class="ik-eff" x="165" y="190">${T.effort}</text></g>
        <g class="ik-eq ok" data-k="eq"><line x1="191" x2="209" y1="174" y2="174"/><line x1="191" x2="209" y1="181" y2="181"/></g>
        <g data-k="chk"><g class="ik-chk"><circle r="10"/><path d="M-4.5 0.5 L-1.2 3.8 L4.8 -3"/></g></g>
        <g data-k="labs">
          <text class="ik-lab" data-k="lY" x="${LX}" y="250">${T.yours}</text>
          <path class="ik-scr" data-k="scr" pathLength="1" stroke-dasharray="1 1" d="M${LX - T.yoursW / 2 - 4} 247 L${LX + T.yoursW / 2 + 4} 244"/>
          <text class="ik-lab" data-k="lS" x="${LX}" y="250">${T.stranger}</text>
          <text class="ik-lab" x="${TX + W / 2}" y="250">${T.shops}</text>
        </g>`;
    },
    S0: { box: 0, flaps: 0, out: 0, arrows: 0, clock: 0, key: 0, build: 0, hours: 0, turn: 0, keyDrop: 0, screw: 0, qm: 0,
      boxOut: 0, lean: 0, heart: 0, slide: 0, twin: 0, labels: 0, same: 0, coins: 0, effort: 0, lift: 0,
      wipe: 0, relabel: 0, fade: 0, ghost: 0, ask: 0, drop: 0, win: 0, chk: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const tr = (key, x, y, extra) => k(key).setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})${extra || ""}`);
      const f = v => v.toFixed(2);
      // your shelf: built in the middle, then slides aside for its twin
      const ox = SX0 + (YX - SX0) * S.slide;
      tr("mine", ox, FLOOR);
      k("shelf").setAttribute("transform", `skewX(${f(-LEAN * S.lean)})`);
      const topShift = Math.tan(LEAN * S.lean * Math.PI / 180) * H;
      // parts: out of the box into an exploded view, then snapped together
      for (const p of PARTS) {
        const po = inOut(cl((S.out - p.o * .08) / .5)), pb = cl((S.build - p.b * .1) / .4);
        const ex = p.cx + p.dx, ey = p.cy + p.dy;
        let x, y, r, s;
        if (pb > 0) { const e = back(pb); x = lerp(ex, p.cx, e); y = lerp(ey, p.cy, e); r = lerp(p.r, 0, inOut(pb)); s = 1; }
        else {   // lift out of the box first, flat, then swing over into place
          const q = po * po;
          x = lerp(START[0], ex, q); y = lerp(START[1], ey, po) - 70 * Math.sin(Math.PI * po); r = lerp(p.lie, p.r, q); s = lerp(.5, 1, po);
        }
        tr(p.k, x, y, ` rotate(${f(r)}) scale(${f(s)})`);
        op(p.k, S.out > p.o * .08 ? 1 : 0);
      }
      op("arrows", S.arrows);
      // the box: appears, flaps open, fades once it's empty
      tr("box", 0, 8 * (1 - S.box)); op("box", S.box * (1 - S.boxOut));
      k("flL").setAttribute("transform", `rotate(${f(-105 * S.flaps)} ${BX} ${BY})`);
      k("flR").setAttribute("transform", `rotate(${f(105 * S.flaps)} ${BX + BW} ${BY})`);
      // two hours on the clock
      op("clock", S.clock);
      k("mh").setAttribute("transform", `rotate(${f(S.hours * 360)} 330 70)`);
      k("hh").setAttribute("transform", `rotate(${f(S.hours * 30)} 330 70)`);
      k("hrs").textContent = T.hrs(Math.min(2, Math.floor(S.hours + .001)));
      // the Allen key turns at a joint, then drops to the floor
      const kd = S.keyDrop, turn = -50 * Math.abs(Math.sin(S.turn * Math.PI * 3));
      tr("key", lerp(W, 108, inOut(kd)), lerp(-42.25, -12.6, bounce(kd)), ` rotate(${f(lerp(turn, 90, inOut(kd)))})`);
      op("key", S.key);
      // one spare screw drops onto the top of the shelf
      const sp = cl(S.screw);
      tr("screw", 48 + topShift, -H - 70 * (1 - bounce(sp)), ` scale(1.5) rotate(${f(-320 * (1 - sp))} 0 -4.5)`);
      op("screw", sp > 0 ? 1 : 0);
      tr("qm", 69 + topShift, -158); op("qm", S.qm);
      // it leans; you love it
      const hs = Math.max(0, S.heart);
      tr("heart", W / 2 + topShift, -H - 34, ` scale(${f(hs)})`);
      op("heart", cl(S.heart * 3) * (1 - S.fade));
      tr("who", W / 2 + topShift, -H - 34); op("who", S.relabel);
      // the shop's shelf, straight
      tr("twin", TX + 110 * (1 - S.twin), FLOOR); op("twin", S.twin);
      op("labs", S.labels);
      op("same", S.same);
      // coins: the price you'd ask for each
      let nY = 0, nT = 0;
      for (let i = 0; i < 8; i++) {
        const p = cl(S.coins - i);
        if (S.coins - i >= .55) { nY = i + 1; if (i < 4) nT = i + 1; }
        let y = coinY(i) - 26 * (1 - bounce(p)), o = p > 0 ? cl(p * 5) : 0;
        if (i >= 4) {
          y -= S.lift * 3 * (i - 3) + 10 * S.drop;
          o *= 1 - S.drop;
          op(`y${i}n`, 1 - S.effort); op(`y${i}e`, S.effort * (1 - S.ghost)); op(`y${i}g`, S.ghost);
        } else {
          tr(`t${i}`, TC, y); op(`t${i}`, o);
        }
        tr(`y${i}`, YC, y); op(`y${i}`, o);
      }
      // price tags ride on top of each stack
      const cY = Math.min(8, S.coins) - 4 * S.drop, cT = Math.min(4, S.coins);
      tr("tagY", YC, tagY(cY) - 12 * S.lift * (cY > 7 ? 1 : 0)); op("tagY", nY ? 1 : 0);
      tr("tagT", TC, tagY(cT)); op("tagT", nT ? 1 : 0);
      const tY = S.drop >= .5 ? T.eur(40) : S.ask > .5 ? "?" : T.eur(nY * 10);
      k("tYnt").textContent = tY; k("tYot").textContent = tY;
      k("tTnt").textContent = T.eur(nT * 10); k("tTot").textContent = T.eur(nT * 10);
      op("tYn", 1 - S.win); op("tYo", S.win); op("tTn", 1 - S.win); op("tTo", S.win);
      // your effort is the extra
      op("eff", S.effort * (1 - S.ghost));
      // the fix: a stranger built it
      k("scr").style.strokeDashoffset = f(1 - S.wipe);
      op("scr", S.wipe > 0 ? 1 - S.relabel : 0);
      op("lY", 1 - S.relabel); op("lS", S.relabel);
      op("eq", S.win);
      tr("chk", 200, 150, ` scale(${f(Math.max(0, S.chk))})`); op("chk", S.chk * 2);
    },
    beats: [
      { steps: [{ to: { box: 1 }, ms: 500, ease: "out", sfx: "pluck" }, { wait: 200 }, { to: { flaps: 1 }, ms: 450, ease: "inOut" },
        { to: { out: 1 }, ms: 1500, ease: "lin" }, { to: { arrows: 1 }, ms: 300 }] },
      { steps: [{ to: { arrows: 0, clock: 1, key: 1 }, ms: 300 }, { to: { build: 1, hours: 2, turn: 1 }, ms: 2000, ease: "lin", sfx: "tick" },
        { to: { keyDrop: 1 }, ms: 550, ease: "lin" }, { to: { screw: 1 }, ms: 800, ease: "lin", sfx: "pop" }, { to: { qm: 1 }, ms: 300 }] },
      { steps: [{ to: { boxOut: 1 }, ms: 400 }, { to: { lean: 1 }, ms: 900, ease: "out" }, { wait: 250 },
        { to: { heart: 1 }, ms: 450, ease: "out", sfx: "pop" }] },
      { steps: [{ to: { clock: 0, key: 0, qm: 0 }, ms: 300 }, { to: { slide: 1, twin: 1 }, ms: 1100, ease: "inOut", sfx: "whoosh" },
        { to: { labels: 1 }, ms: 400 }, { to: { same: 1 }, ms: 450 }] },
      { steps: [{ to: { same: 0 }, ms: 300 }, { to: { coins: 8 }, ms: 2400, ease: "lin", sfx: "tick" }] },
      { steps: [{ to: { effort: 1 }, ms: 500 }, { to: { lift: 1 }, ms: 250, sfx: "spring" }, { to: { lift: 0 }, ms: 800, ease: "out" }] },
      { steps: [{ to: { wipe: 1 }, ms: 650, sfx: "scribble" }, { to: { relabel: 1, fade: 1 }, ms: 500 }, { wait: 300 },
        { to: { ghost: 1, ask: 1 }, ms: 500 }] },
      { steps: [{ to: { drop: 1 }, ms: 900, ease: "inOut" }, { to: { win: 1 }, ms: 450 },
        { to: { chk: 1 }, ms: 400, ease: "out", sfx: "chime" }], hold: 4200 }
    ]
  };
})();
