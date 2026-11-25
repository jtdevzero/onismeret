/* Sunk cost fallacy: a €60 ticket, a jar of spent money, and a balance that should ignore it. Scene for anim.js. */
(function () {
  const PX = 252, PY = 76, L = 86, H = 94, R = 48, D = 10;   // pivot, beam half-length, string drop, pan half-width, bowl depth
  const JAR = [[53, 179], [73, 179], [63, 162]];             // coin centres resting in the jar
  const PAN = [[-18, 71], [0, 71], [18, 71]];                 // coin centres on the "Go" pan, from its hook
  const DROP0 = 84;                                           // coins fall into the jar from here
  const hook = (side, deg) => { const a = deg * Math.PI / 180; return [PX + side * L * Math.cos(a), PY + side * L * Math.sin(a)]; };
  const cl = v => Math.max(0, Math.min(1, v));
  const inOut = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const bounce = t => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375;
    return n * (t -= 2.625 / d) * t + .984375;
  };
  // a weight: trapezoid block with its label, drawn from its top edge y0 (pan-local coordinates)
  const block = (w, y0, label) => `<path d="M${-w / 2} ${y0 + 15} L${-w / 2 + 3} ${y0} H${w / 2 - 3} L${w / 2} ${y0 + 15} Z"/><text y="${y0 + 11}">${label}</text>`;
  const coin = `<circle r="8"/><text y="3.6">€</text>`;
  const P = '.bp[data-scene="sunk-cost"]';

  window.BiasAnim.SCENES["sunk-cost"] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
${P} .ln{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
${P} .tk path{fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linejoin:round}
${P} .tk .t1{font:500 9px var(--mono);fill:var(--muted);text-anchor:middle;letter-spacing:.14em}
${P} .tk .t2{font:700 17px var(--display);fill:var(--ink);text-anchor:middle}
${P} .tk .t3{font:600 9.5px var(--display);fill:var(--bad);text-anchor:middle}
${P} .jar path{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
${P} .jar rect{fill:var(--surface);stroke:var(--muted);stroke-width:1.4}
${P} .jar text{font:600 10.5px var(--display);fill:var(--ink);text-anchor:middle}
${P} .coin circle{fill:var(--surface);stroke:var(--q);stroke-width:2.2}
${P} .coin text{font:700 10px var(--display);fill:var(--q);text-anchor:middle}
${P} .gcoin{fill:none;stroke:var(--faint);stroke-width:1.4;stroke-dasharray:2.5 3}
${P} .cloud{fill:var(--surface);stroke:var(--muted);stroke-width:2;stroke-linejoin:round}
${P} .rain line{stroke:var(--muted);stroke-width:1.8;stroke-linecap:round}
${P} .bat rect{fill:none;stroke:var(--ink);stroke-width:1.8}
${P} .bat .bar{fill:var(--ink);stroke:none}
${P} .bat .low{fill:var(--bad);stroke:none}
${P} .note{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
${P} .beam{stroke:var(--ink);stroke-width:3;stroke-linecap:round}
${P} .needle{stroke:var(--ink);stroke-width:2;stroke-linecap:round}
${P} .pin{fill:var(--surface);stroke:var(--ink);stroke-width:2}
${P} .base{fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linejoin:round}
${P} .str{fill:none;stroke:var(--muted);stroke-width:1.4;stroke-linejoin:round}
${P} .ring{fill:var(--surface);stroke:var(--ink);stroke-width:1.8}
${P} .bowl{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
${P} .bowl.g{stroke:var(--good);fill:none}
${P} .wt path{fill:var(--surface);stroke:var(--ink);stroke-width:1.8;stroke-linejoin:round}
${P} .wt text{font:600 10px var(--display);fill:var(--ink);text-anchor:middle}
${P} .wt.g path{stroke:var(--good);fill:none}
${P} .pl{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
${P} .pl.g{fill:var(--good)}
${P} .minus{font:600 10.5px var(--mono);fill:var(--bad);text-anchor:middle}
${P} .sunk{font:500 9.5px var(--mono);fill:var(--q);text-anchor:middle}
${P} .sunk rect{fill:var(--surface);stroke:var(--q);stroke-width:1.6}
${P} .check circle{fill:var(--surface);stroke:var(--good);stroke-width:2}
${P} .check path{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}`,
    text: {
      hu: {
        name: "Elsüllyedt költség tévedése", shareTitle: "Az elsüllyedt költség tévedése, 30 másodpercben",
        ecline: "Az már elköltött pénz így is elveszett. A döntést arra alapozd, ami előttünk áll.",
        concert: "KONCERT", price: "60 €", noref: "nem jár visszatérítés", spent: "Elköltött", sunk: "elsüllyedt költség", sunkW: 66, tired: "kimerült",
        go: "Elmegyek", stay: "Otthon maradok", music: "Zene", rest: "Pihenés", dry: "Száraz", minus: "−60 €",
        caps: [
          "<b>60 €</b>-t fizettél egy koncertjegyért. Nem jár visszatérítés.",
          "Az estén kimerült vagy, és zuhog az eső.",
          "Elmész vagy otthon maradsz? Mérlegelsz.",
          "Ma estére az otthon maradás az, amit <b>jobban élveznél</b>.",
          "Aztán egy gondolat: „60 eurót fizettem. Nem <b>pazarolhatom el</b>.”",
          "De a 60 euró <b>így is</b> elveszett.",
          "<b>A megoldás:</b> vedd le a mérlegről az már elköltött pénzt.",
          "A döntést arra alapozd, ami előttünk áll. <b>Maradj otthon</b> és pihenj."
        ],
        say: [
          "Hatvan euróért vettél egy koncertjegyet. Nem jár visszatérítés.",
          "Az estén kimerült vagy, és zuhog az eső.",
          "Elmész, vagy otthon maradsz? Mérlegelsz.",
          "Ma estére az otthon maradás az, amit jobban élveznél.",
          "Aztán egy gondolat: hatvan eurót fizettem. Nem pazarolhatom el.",
          "De azt a hatvan eurót így is elvesztetted.",
          "A megoldás: vedd le a mérlegről az már elköltött pénzt.",
          "A döntést arra alapozd, ami előttünk áll. Maradj otthon, és pihenj.",
          "Az elsüllyedt költség tévedése. Az már elköltött pénz így is elveszett. A döntést arra alapozd, ami előttünk áll."
        ]
      },
      en: {
        name: "Sunk cost fallacy", shareTitle: "Sunk cost fallacy, explained in 30 seconds",
        ecline: "Money already spent is gone either way. Decide on what's ahead.",
        concert: "CONCERT", price: "€60", noref: "no refunds", spent: "Spent", sunk: "sunk cost", sunkW: 66, tired: "exhausted",
        go: "Go", stay: "Stay home", music: "Music", rest: "Rest", dry: "Dry", minus: "−€60",
        caps: [
          "You paid <b>€60</b> for a concert ticket. No refunds.",
          "On the night, you're exhausted and it's pouring.",
          "Go or stay home? You weigh it up.",
          "Tonight, staying home is what you'd <b>enjoy more</b>.",
          "Then a thought: “I paid €60. I can't <b>waste it</b>.”",
          "But the €60 is gone <b>either way</b>.",
          "<b>The fix:</b> take spent money off the scale.",
          "Decide on what's ahead. <b>Stay home</b> and rest."
        ],
        say: [
          "You paid sixty euros for a concert ticket. No refunds.",
          "On the night, you're exhausted, and it's pouring.",
          "Go, or stay home? You weigh it up.",
          "Tonight, staying home is what you'd enjoy more.",
          "Then a thought: I paid sixty euros. I can't waste it.",
          "But that sixty euros is gone either way.",
          "The fix: take money you've already spent off the scale.",
          "Decide on what's ahead. Stay home, and rest.",
          "The sunk cost fallacy. Money already spent is gone either way. Decide on what's ahead."
        ]
      },
      el: {
        name: "Πλάνη του βυθισμένου κόστους", shareTitle: "Η πλάνη του βυθισμένου κόστους σε 30 δευτερόλεπτα",
        ecline: "Ό,τι ξόδεψες χάθηκε έτσι κι αλλιώς. Αποφάσισε με βάση όσα έρχονται.",
        concert: "ΣΥΝΑΥΛΙΑ", price: "60 €", noref: "δεν επιστρέφεται", spent: "Ξοδεμένα", sunk: "βυθισμένο κόστος", sunkW: 100, tired: "εξάντληση",
        go: "Πάω", stay: "Μένω σπίτι", music: "Μουσική", rest: "Ξεκούραση", dry: "Χωρίς βροχή", minus: "−60 €",
        caps: [
          "Πλήρωσες <b>60\u00a0€</b> για ένα εισιτήριο συναυλίας. Δεν επιστρέφεται.",
          "Φτάνει η βραδιά. Είσαι πτώμα κι έξω ρίχνει καρεκλοπόδαρα.",
          "Να πας ή να μείνεις σπίτι; Το ζυγίζεις.",
          "Απόψε θα περνούσες <b>πιο ωραία</b> στο σπίτι.",
          "Και μετά σκέφτεσαι: «Έδωσα\u00a060\u00a0€. Κρίμα να πάνε <b>χαμένα</b>».",
          "Όμως τα 60\u00a0€ έχουν φύγει <b>έτσι κι αλλιώς</b>.",
          "<b>Η λύση:</b> βγάλε από τη ζυγαριά ό,τι έχεις ήδη ξοδέψει.",
          "Σκέψου μόνο το από δω και πέρα. <b>Μείνε σπίτι</b> και ξεκουράσου."
        ],
        say: [
          "Πλήρωσες εξήντα ευρώ για ένα εισιτήριο συναυλίας. Δεν επιστρέφεται.",
          "Φτάνει η βραδιά. Είσαι πτώμα κι έξω ρίχνει καρεκλοπόδαρα.",
          "Να πας ή να μείνεις σπίτι; Το ζυγίζεις.",
          "Απόψε θα περνούσες πιο ωραία στο σπίτι.",
          "Και μετά σκέφτεσαι: Έδωσα εξήντα ευρώ. Κρίμα να πάνε χαμένα.",
          "Όμως τα εξήντα ευρώ έχουν φύγει έτσι κι αλλιώς.",
          "Η λύση: βγάλε από τη ζυγαριά ό,τι έχεις ήδη ξοδέψει.",
          "Σκέψου μόνο το από δω και πέρα. Μείνε σπίτι και ξεκουράσου.",
          "Πλάνη του βυθισμένου κόστους. Ό,τι ξόδεψες χάθηκε έτσι κι αλλιώς. Αποφάσισε με βάση όσα έρχονται."
        ]
      },
      es: {
        name: "Falacia del costo hundido", shareTitle: "La falacia del costo hundido en 30 segundos",
        ecline: "El dinero ya gastado no vuelve, hagas lo que hagas. Decide según lo que viene.",
        concert: "CONCIERTO", price: "60 €", noref: "sin reembolso", spent: "Gastado", sunk: "costo hundido", sunkW: 95, tired: "agotado",
        go: "Voy", stay: "Me quedo", music: "Música", rest: "Descanso", dry: "Sin lluvia", minus: "−60 €",
        caps: [
          "Pagaste <b>60 €</b> por una entrada de concierto. Sin reembolso.",
          "Llega la noche: estás agotado y llueve a cántaros.",
          "¿Ir o quedarte en casa? Lo sopesas.",
          "Esta noche, quedarte en casa es lo que <b>más disfrutarías</b>.",
          "Y entonces piensas: «Pagué 60 €. No puedo <b>desperdiciarlos</b>».",
          "Pero esos 60 € ya no vuelven, <b>vayas o no</b>.",
          "<b>La solución:</b> saca de la balanza el dinero ya gastado.",
          "Decide según lo que viene. <b>Quédate en casa</b> y descansa."
        ],
        say: [
          "Pagaste sesenta euros por una entrada de concierto. Sin reembolso.",
          "Llega la noche: estás agotado, y llueve a cántaros.",
          "¿Ir, o quedarte en casa? Lo sopesas.",
          "Esta noche, quedarte en casa es lo que más disfrutarías.",
          "Y entonces piensas: pagué sesenta euros. No puedo desperdiciarlos.",
          "Pero esos sesenta euros ya no vuelven, vayas o no.",
          "La solución: saca de la balanza el dinero que ya gastaste.",
          "Decide según lo que viene. Quédate en casa, y descansa.",
          "La falacia del costo hundido. El dinero ya gastado no vuelve, hagas lo que hagas. Decide según lo que viene."
        ]
      },
      fr: {
        name: "Biais des coûts irrécupérables", shareTitle: "Le biais des coûts irrécupérables en 30 secondes",
        ecline: "L’argent déjà dépensé est perdu dans tous les cas. Décidez selon ce qui vient.",
        concert: "CONCERT", price: "60 €", noref: "non remboursable", spent: "Dépensé", sunk: "irrécupérable", sunkW: 95, tired: "à plat",
        go: "Y aller", stay: "Rester", music: "Musique", rest: "Repos", dry: "Au sec", minus: "−60 €",
        caps: [
          "Vous avez payé <b>60 €</b> une place de concert. Non remboursable.",
          "Le soir venu, vous êtes à plat et il pleut à verse.",
          "Y aller ou rester chez vous ? Vous pesez le pour et le contre.",
          "Ce soir, rester chez vous vous <b>plairait davantage</b>.",
          "Puis une pensée : « J’ai payé 60 €. Je ne peux pas les <b>gâcher</b>. »",
          "Mais les 60 € sont perdus <b>dans tous les cas</b>.",
          "<b>La solution :</b> retirez de la balance l’argent déjà dépensé.",
          "Décidez selon ce qui vient. <b>Restez chez vous</b> et reposez-vous."
        ],
        say: [
          "Vous avez payé soixante euros une place de concert. Non remboursable.",
          "Le soir venu, vous êtes à plat, et il pleut à verse.",
          "Y aller, ou rester chez vous ? Vous pesez le pour et le contre.",
          "Ce soir, rester chez vous vous plairait davantage.",
          "Puis une pensée : j’ai payé soixante euros. Je ne peux pas les gâcher.",
          "Mais ces soixante euros sont perdus dans tous les cas.",
          "La solution : retirez de la balance l’argent que vous avez déjà dépensé.",
          "Décidez selon ce qui vient. Restez chez vous, et reposez-vous.",
          "Le biais des coûts irrécupérables. L’argent déjà dépensé est perdu dans tous les cas. Décidez selon ce qui vient."
        ]
      },
      de: {
        name: "Versunkene-Kosten-Falle", shareTitle: "Die Versunkene-Kosten-Falle in 30 Sekunden",
        ecline: "Bereits ausgegebenes Geld ist so oder so weg. Entscheide nach dem, was vor dir liegt.",
        concert: "KONZERT", price: "60 €", noref: "keine Erstattung", spent: "Bezahlt", sunk: "versunken", sunkW: 66, tired: "erschöpft",
        go: "Hingehen", stay: "Zu Hause bleiben", music: "Musik", rest: "Ruhe", dry: "Trocken", minus: "−60 €",
        caps: [
          "Du hast <b>60 €</b> für ein Konzertticket bezahlt. Keine Erstattung.",
          "Am Abend bist du erschöpft, und es schüttet.",
          "Hingehen oder zu Hause bleiben? Du wägst ab.",
          "Heute Abend hättest du <b>mehr davon</b>, zu Hause zu bleiben.",
          "Dann der Gedanke: „Ich habe 60 € bezahlt. Das darf ich nicht <b>verschwenden</b>.“",
          "Aber die 60 € sind <b>so oder so</b> weg.",
          "<b>Die Lösung:</b> Nimm ausgegebenes Geld von der Waage.",
          "Entscheide nach dem, was vor dir liegt. <b>Bleib zu Hause</b> und ruh dich aus."
        ],
        say: [
          "Du hast sechzig Euro für ein Konzertticket bezahlt. Keine Erstattung.",
          "Am Abend bist du erschöpft, und es schüttet.",
          "Hingehen oder zu Hause bleiben? Du wägst ab.",
          "Heute Abend hättest du mehr davon, zu Hause zu bleiben.",
          "Dann der Gedanke: Ich habe sechzig Euro bezahlt. Das darf ich nicht verschwenden.",
          "Aber die sechzig Euro sind so oder so weg.",
          "Die Lösung: Nimm Geld, das du schon ausgegeben hast, von der Waage.",
          "Entscheide nach dem, was vor dir liegt. Bleib zu Hause und ruh dich aus.",
          "Die Versunkene-Kosten-Falle. Bereits ausgegebenes Geld ist so oder so weg. Entscheide nach dem, was vor dir liegt."
        ]
      },
      it: {
        name: "Fallacia dei costi irrecuperabili", shareTitle: "La fallacia dei costi irrecuperabili in 30 secondi",
        ecline: "I soldi già spesi sono persi comunque. Decidi in base a ciò che ti aspetta.",
        concert: "CONCERTO", price: "60 €", noref: "non rimborsabile", spent: "Speso", sunk: "irrecuperabile", sunkW: 103, tired: "a pezzi",
        go: "Vado", stay: "Resto a casa", music: "Musica", rest: "Riposo", dry: "All’asciutto", minus: "−60 €",
        caps: [
          "Hai pagato <b>60 €</b> un biglietto per un concerto. Non rimborsabile.",
          "La sera stessa sei a pezzi, e piove a dirotto.",
          "Andare o restare a casa? Ci rifletti.",
          "Stasera, restare a casa è ciò che ti <b>godresti di più</b>.",
          "Poi un pensiero: «Ho pagato 60 €. Non posso <b>sprecarli</b>».",
          "Ma i 60 € sono andati <b>comunque</b>.",
          "<b>La soluzione:</b> togli dalla bilancia i soldi già spesi.",
          "Decidi in base a ciò che ti aspetta. <b>Resta a casa</b> e riposati."
        ],
        say: [
          "Hai pagato sessanta euro un biglietto per un concerto. Non rimborsabile.",
          "La sera stessa sei a pezzi, e piove a dirotto.",
          "Andare, o restare a casa? Ci rifletti.",
          "Stasera, restare a casa è ciò che ti godresti di più.",
          "Poi un pensiero: ho pagato sessanta euro. Non posso sprecarli.",
          "Ma quei sessanta euro sono andati comunque.",
          "La soluzione: togli dalla bilancia i soldi che hai già speso.",
          "Decidi in base a ciò che ti aspetta. Resta a casa, e riposati.",
          "La fallacia dei costi irrecuperabili. I soldi già spesi sono persi comunque. Decidi in base a ciò che ti aspetta."
        ]
      }
    },
    svg(T) {
      const pan = (side, label) => `
        <path class="bowl" d="M${-R} ${H} Q0 ${H + 2 * D} ${R} ${H} Z"/>
        <path class="bowl g" data-k="bowlg${side}" d="M${-R} ${H} Q0 ${H + 2 * D} ${R} ${H} Z"/>
        <text class="pl" data-k="pl${side}" y="${H + D + 17}">${label}</text>
        <text class="pl g" data-k="plg${side}" y="${H + D + 17}">${label}</text>
        <text class="minus" data-k="minus${side}" y="${H + D + 32}">${T.minus}</text>`;
      return `
        <g class="tk" data-k="ticket"><path d="M18 12 H108 Q114 12 114 18 V35 A6 6 0 0 0 114 47 V64 Q114 70 108 70 H18 Q12 70 12 64 V47 A6 6 0 0 0 12 35 V18 Q12 12 18 12 Z"/>
          <text class="t1" x="63" y="28">${T.concert}</text><text class="t2" x="63" y="49">${T.price}</text><text class="t3" data-k="noref" x="63" y="63">${T.noref}</text></g>
        <g data-k="cloud"><path class="cloud" d="M149 40 a9 9 0 0 1 1 -17.9 a13 13 0 0 1 24 -6 a10 10 0 0 1 15 8 a8 8 0 0 1 -1 15.9 Z"/></g>
        <g class="rain" data-k="rain"><line x1="155" y1="45" x2="152.5" y2="52"/><line x1="165" y1="48" x2="162.5" y2="55"/><line x1="175" y1="45" x2="172.5" y2="52"/><line x1="185" y1="48" x2="182.5" y2="55"/></g>
        <g class="bat" data-k="bat"><rect x="318" y="13" width="30" height="14" rx="3"/><rect x="348.5" y="17" width="2.5" height="6" rx="1"/>
          <rect class="low" x="321" y="16" width="7" height="8" rx="1"/><rect class="bar" data-k="b1" x="321" y="16" width="7" height="8" rx="1"/>
          <rect class="bar" data-k="b2" x="329.5" y="16" width="7" height="8" rx="1"/><rect class="bar" data-k="b3" x="338" y="16" width="7" height="8" rx="1"/>
          <text class="note" x="334" y="41">${T.tired}</text></g>
        <g data-k="scale">
          <path class="base" d="M${PX - 28} 246 H${PX + 28} L${PX + 36} 254 H${PX - 36} Z"/>
          <line class="beam" x1="${PX}" y1="${PY}" x2="${PX}" y2="246"/>
          <g data-k="hangL"><path class="str" d="M${-R} ${H} L0 0 L${R} ${H}"/></g>
          <g data-k="hangR"><path class="str" d="M${-R} ${H} L0 0 L${R} ${H}"/></g>
          <g data-k="beam"><line class="beam" x1="${-L}" y1="0" x2="${L}" y2="0"/><line class="needle" x1="0" y1="0" x2="0" y2="-15"/></g>
          <circle class="pin" cx="${PX}" cy="${PY}" r="4.5"/>
          <circle class="ring" data-k="ringL" r="3"/><circle class="ring" data-k="ringR" r="3"/>
        </g>
        <g data-k="ghost">${JAR.map(([x, y]) => `<circle class="gcoin" cx="${x}" cy="${y}" r="8"/>`).join("")}</g>
        <g class="wt" data-k="music">${block(80, 79, T.music)}</g>
        <g class="wt" data-k="dry">${block(80, 79, T.dry)}</g>
        <g class="wt" data-k="rest">${block(66, 64, T.rest)}</g>
        <g data-k="wing"><g class="wt g" data-k="dryg">${block(80, 79, "")}</g><g class="wt g" data-k="restg">${block(66, 64, "")}</g></g>
        ${JAR.map((_, i) => `<g class="coin" data-k="c${i}">${coin}</g>`).join("")}
        <g class="jar" data-k="jar"><path d="M33 104 H93 M37 104 V109 Q28 113 28 123 V180 Q28 190 38 190 H88 Q98 190 98 180 V123 Q98 113 89 109 V104"/>
          <rect x="34" y="120" width="58" height="16" rx="3"/><text x="63" y="131.5">${T.spent}</text></g>
        <g data-k="panL">${pan("L", T.go)}</g>
        <g data-k="panR">${pan("R", T.stay)}</g>
        <g class="sunk" data-k="sunk"><rect x="${63 - T.sunkW / 2}" y="199" width="${T.sunkW}" height="17" rx="8.5"/><text x="63" y="210.5">${T.sunk}</text></g>
        <g class="check" data-k="check"><circle r="9"/><path d="M-4 0.5 L-1 3.5 L4.5 -3"/></g>`;
    },
    S0: { ticket: 0, noref: 0, jar: 0, drop: 0, cloud: 0, rain: 0, bat: 0, drain: 0, scale: 0, tilt: 0,
      music: 0, dry: 0, rest: 0, fly: 0, back: 0, ghost: 0, minus: 0, sunk: 0, win: 0, check: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = v; };
      const tr = (key, x, y, extra) => k(key).setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})${extra || ""}`);
      // ticket pops in with a slight tilt
      const ts = .86 + .14 * S.ticket;
      k("ticket").setAttribute("transform", `translate(63 41) rotate(-3) scale(${ts}) translate(-63 -41)`);
      op("ticket", cl(S.ticket * 1.4)); op("noref", S.noref);
      op("jar", S.jar);
      // weather and tiredness
      tr("cloud", -34 * (1 - S.cloud), 0); op("cloud", S.cloud);
      tr("rain", 0, -6 * (1 - S.rain)); op("rain", S.rain);
      op("bat", S.bat);
      op("b3", cl(1 - S.drain * 2)); op("b2", cl(2 - S.drain * 2)); op("b1", 1 - S.drain);
      // the balance: the beam turns on its pin, each pan hangs level from its hook
      const [lx, ly] = hook(-1, S.tilt), [rx, ry] = hook(1, S.tilt);
      op("scale", S.scale); op("panL", S.scale); op("panR", S.scale);
      k("beam").setAttribute("transform", `translate(${PX} ${PY}) rotate(${S.tilt.toFixed(3)})`);
      tr("hangL", lx, ly); tr("hangR", rx, ry); tr("ringL", lx, ly); tr("ringR", rx, ry);
      tr("panL", lx, ly); tr("panR", rx, ry);
      // weights drop into the pans
      const drop = (key, x, y, p) => { tr(key, x, y - 22 * (1 - p)); op(key, p > 0 ? cl(p * 3) : 0); };
      drop("music", lx, ly, S.music); drop("dry", rx, ry, S.dry); drop("rest", rx, ry, S.rest);
      tr("dryg", rx, ry); tr("restg", rx, ry); op("wing", S.win);
      // coins: fall into the jar, then fly to the "Go" pan and back
      for (let i = 0; i < 3; i++) {
        const [jx, jy0] = JAR[i], pd = cl(S.drop - i);
        const jy = DROP0 + (jy0 - DROP0) * bounce(pd);
        const pf = cl((S.fly - (2 - i) * .15) / .7) * (1 - cl((S.back - i * .15) / .7));   // top coin leaves first, bottom coins return first
        const e = inOut(pf), tx = lx + PAN[i][0], ty = ly + PAN[i][1];
        const x = jx + (tx - jx) * e * e, y = jy + (ty - jy) * e - 70 * Math.sin(Math.PI * e);   // rise out of the jar mouth, then arc over
        tr("c" + i, x, y); op("c" + i, pd > 0 ? cl(pd * 6) : 0);
      }
      op("ghost", S.ghost);
      op("minusL", S.minus); op("minusR", S.minus);
      op("sunk", S.sunk);
      // the fix: "Stay home" wins
      op("plR", 1 - S.win); op("plgR", S.win); op("bowlgR", S.win);
      op("plgL", 0); op("bowlgL", 0);
      tr("check", rx, ry + H + D + 35, ` scale(${Math.max(0, S.check).toFixed(3)})`); op("check", cl(S.check * 2));
    },
    beats: [
      { steps: [{ to: { ticket: 1 }, ms: 500, ease: "back", sfx: "pop" }, { to: { jar: 1 }, ms: 350 },
        { to: { drop: 3 }, ms: 1300, ease: "lin", sfx: "thud", sfxAt: 160 }, { to: { noref: 1 }, ms: 400 }] },
      { steps: [{ to: { cloud: 1 }, ms: 800, sfx: "whoosh" }, { to: { rain: 1 }, ms: 500 },
        { to: { bat: 1 }, ms: 400 }, { to: { drain: 1 }, ms: 900, ease: "inOut" }] },
      { steps: [{ to: { scale: 1 }, ms: 600, sfx: "pluck" }, { wait: 500 },
        { to: { music: 1 }, ms: 420, ease: "inOut" }, { to: { tilt: -9 }, ms: 900, ease: "back" }] },
      { steps: [{ to: { dry: 1 }, ms: 420, ease: "inOut" }, { to: { tilt: -2 }, ms: 500 },
        { to: { rest: 1 }, ms: 420, ease: "inOut", sfx: "thud", sfxAt: 380 }, { to: { tilt: 10 }, ms: 1000, ease: "back" }] },
      { steps: [{ to: { ghost: 1 } }, { to: { fly: 1 }, ms: 1300, ease: "lin", sfx: "spring" },
        { to: { tilt: -11 }, ms: 1000, ease: "back" }] },
      { steps: [{ to: { minus: 1 }, ms: 500, sfx: "tick" }, { wait: 600 }, { to: { sunk: 1 }, ms: 500 }] },
      { steps: [{ to: { back: 1, minus: 0 }, ms: 1300, ease: "lin", sfx: "whoosh" }, { to: { ghost: 0 } },
        { to: { tilt: 10 }, ms: 1000, ease: "back" }] },
      { steps: [{ to: { win: 1 }, ms: 500 }, { to: { check: 1 }, ms: 450, ease: "back", sfx: "chime" }], hold: 4200 }
    ]
  };
})();
