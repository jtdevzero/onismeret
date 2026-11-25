/* Endowment effect: a free mug, an offer to buy it, and the two prices you'd put on the very same
   mug, as its owner and as a buyer, read off one price pole. Scene for anim.js. */
(function () {
  const KEY = "endowment-effect", P = `.bp[data-scene="${KEY}"]`;
  const TABLE = 228;                         // the table line everything stands on
  const PX = 232, PER = 18;                  // the price pole's x, px per euro
  const py = v => TABLE - v * PER;           // euros -> y on the pole
  const YX = 48, BX = 360;                   // you, the buyer (centre x)
  const MX = 122, MSOLD = 296;               // the mug's centre: in front of you, and after it's sold
  const TR = PX + 30, TL = PX - 30;          // tags hanging right of the pole, and left of it
  const cl = v => Math.max(0, Math.min(1, v));
  const TAG = "M-20 -11 H23 Q27 -11 27 -7 V7 Q27 11 23 11 H-20 L-29 0 Z";
  const bust = (cls, x) => `<g class="${cls}"><circle cx="${x}" cy="174" r="13"/>
    <path d="M${x - 26} ${TABLE} C${x - 26} 206 ${x - 14} 196 ${x} 196 C${x + 14} 196 ${x + 26} 206 ${x + 26} ${TABLE}"/></g>`;

  window.BiasAnim.SCENES[KEY] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
      ${P} .ew-table{stroke:var(--rule);stroke-width:2;stroke-linecap:round}
      ${P} .ew-you circle,${P} .ew-you path{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ew-eye{fill:var(--ink)}
      ${P} .ew-them circle,${P} .ew-them path{fill:none;stroke:var(--muted);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ew-eye.m{fill:var(--muted)}
      ${P} .ew-mug{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .ew-hdl{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round}
      ${P} .ew-stripe{fill:none;stroke:var(--faint);stroke-width:1.6;stroke-linecap:round}
      ${P} .ew-box{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .ew-rib{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ew-heart{fill:var(--q);stroke:var(--q);stroke-width:1.5;stroke-linejoin:round}
      ${P} .ew-pole{stroke:var(--faint);stroke-width:2.2;stroke-linecap:round}
      ${P} .ew-tick{stroke:var(--rule);stroke-width:1.5;stroke-linecap:round}
      ${P} .ew-plab{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .ew-tag path{fill:var(--surface);stroke:var(--ink);stroke-width:1.8;stroke-linejoin:round}
      ${P} .ew-tag circle{fill:none;stroke:var(--ink);stroke-width:1.4}
      ${P} .ew-tag text{font:700 14px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ew-tag.ok path,${P} .ew-tag.ok circle{stroke:var(--good)}
      ${P} .ew-tag.ok text{fill:var(--good)}
      ${P} .ew-tl{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .ew-tl.ok{fill:var(--good)}
      ${P} .ew-strike{fill:none;stroke:var(--bad);stroke-width:2.4;stroke-linecap:round}
      ${P} .ew-gap .bar{stroke:var(--q);stroke-width:6;stroke-opacity:.4}
      ${P} .ew-gap path{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ew-gap text{font:600 11px var(--display);fill:var(--q);text-anchor:end}
      ${P} .ew-gap.bad .bar{stroke:var(--bad)}
      ${P} .ew-gap.bad path{stroke:var(--bad)}
      ${P} .ew-gap.bad text{fill:var(--bad)}
      ${P} .ew-bub rect,${P} .ew-bub path{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}
      ${P} .ew-bub.them rect,${P} .ew-bub.them path{stroke:var(--muted)}
      ${P} .ew-bub text{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ew-think rect,${P} .ew-think circle{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .ew-think text{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ew-think .no{font:700 13px var(--display);fill:var(--bad)}
      ${P} .ew-note rect{fill:var(--surface);stroke:var(--good);stroke-width:2}
      ${P} .ew-note .in{fill:none;stroke:var(--good);stroke-width:1;stroke-opacity:.6}
      ${P} .ew-note text{font:700 12.5px var(--display);fill:var(--good);text-anchor:middle}
      ${P} .ew-chk circle{fill:var(--surface);stroke:var(--good);stroke-width:2}
      ${P} .ew-chk path{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
    `,
    text: {
      hu: {
        name: "Birtoklási hatás", shareTitle: "A birtoklási hatás, 30 másodpercben",
        ecline: "Ami a tiéd, többet ér. Úgy becsüld az értékét, mintha nem a tiéd lenne.",
        eur: v => `${v} €`, sell: "Eladod?", atLeast: "Legalább 8 €.", price: "ár",
        ask: "ennyit kérnél", pay: "ennyit fizetnél", sold: "eladod", yours: "mert a tiéd", loss: "veszteségnek érződik",
        wouldI: "Megvenném 8 €-ért?", no: "Nem.",
        caps: [
          "Ajándékba kapsz egy <b>bögrét</b>. Szép, de nincs benne semmi különleges.",
          "Pár perc múlva valaki <b>meg akarja venni</b> tőled.",
          "Legalább <b>8 €</b> kellene, hogy odaadd.",
          "Pedig ugyanezt a bögrét csak <b>4 €</b>-ért vetted volna meg.",
          "Már attól, hogy <b>a tiéd</b>, többet ér.",
          "Az odaadása <b>veszteségnek érződik</b>, ezért többet kérsz.",
          "<b>A megoldás:</b> ha nem a tiéd lenne, megvennéd 8 €-ért?",
          "Képzeld el helyette az <b>5 €-t a kezedben</b>. Jobb, mint a bögre? Akkor <b>add el</b>."
        ],
        say: [
          "Ajándékba kapsz egy bögrét. Szép, de nincs benne semmi különleges.",
          "Pár perc múlva valaki meg akarja venni tőled.",
          "Legalább nyolc eurót kérnél, hogy odaadd.",
          "Pedig ugyanezt a bögrét csak négy euróért vetted volna meg.",
          "Már attól, hogy a tiéd, többet ér.",
          "Az odaadása veszteségnek érződik, ezért többet kérsz.",
          "A megoldás: ha nem a tiéd lenne, megvennéd nyolc euróért?",
          "Képzeld el helyette az öt eurót a kezedben. Jobb, mint a bögre? Akkor add el.",
          "A birtoklási hatás. Ami a tiéd, többet ér. Úgy becsüld az értékét, mintha nem a tiéd lenne."
        ]
      },
      en: {
        name: "Endowment effect", shareTitle: "Endowment effect, explained in 30 seconds",
        ecline: "What you own feels worth more. Judge its value as if it weren't yours.",
        eur: v => `€${v}`, sell: "Will you sell it?", atLeast: "€8, at least.", price: "price",
        ask: "you'd ask", pay: "you'd pay", sold: "you sell", yours: "because it's yours", loss: "feels like a loss",
        wouldI: "Would I buy it for €8?", no: "No.",
        caps: [
          "Someone gives you a <b>mug</b>. Nice, but nothing special.",
          "Minutes later, someone offers to <b>buy it</b> from you.",
          "You'd want at least <b>€8</b> to let it go.",
          "Yet you'd only have paid <b>€4</b> for the very same mug.",
          "Just <b>owning it</b> made it feel worth more.",
          "Giving it up <b>feels like a\u00a0loss</b>, so you ask for more.",
          "<b>The fix:</b> if it weren't yours, would you buy it for €8?",
          "Picture <b>€5 in your hand</b> instead. Better than the mug? <b>Sell.</b>"
        ],
        say: [
          "Someone gives you a mug. Nice, but nothing special.",
          "Minutes later, someone offers to buy it from you.",
          "You'd want at least eight euros to let it go.",
          "Yet you'd only have paid four euros for the very same mug.",
          "Just owning it made it feel worth more.",
          "Giving it up feels like a loss, so you ask for more.",
          "The fix: if it weren't yours, would you buy it for eight euros?",
          "Picture five euros in your hand instead. Better than the mug? Then sell.",
          "The endowment effect. What you own feels worth more. Judge its value as if it weren't yours."
        ]
      },
      el: {
        name: "Φαινόμενο κατοχής", shareTitle: "Το φαινόμενο κατοχής σε 30 δευτερόλεπτα",
        ecline: "Ό,τι σου ανήκει μοιάζει πιο πολύτιμο. Κρίνε την αξία του σαν να μην ήταν δικό\u00a0σου.",
        eur: v => `${v}\u00a0€`, sell: "Μου την πουλάς;", atLeast: "Τουλάχιστον 8\u00a0€.", price: "τιμή",
        ask: "ζητάς", pay: "θα έδινες", sold: "πουλάς", yours: "επειδή είναι δική σου", loss: "μοιάζει με απώλεια",
        wouldI: "Θα την αγόραζα 8\u00a0€;", no: "Όχι.",
        caps: [
          "Σου χαρίζουν μια <b>κούπα</b>. Ωραία, αλλά τίποτα το ιδιαίτερο.",
          "Λίγα λεπτά αργότερα, θέλουν να <b>σου την αγοράσουν</b>.",
          "Για να την αποχωριστείς, θέλεις τουλάχιστον <b>8\u00a0€</b>.",
          "Κι όμως, για την ίδια ακριβώς κούπα θα έδινες μόνο <b>4\u00a0€</b>.",
          "Και μόνο που είναι <b>δική\u00a0σου</b>, μοιάζει πιο πολύτιμη.",
          "Το να τη δώσεις <b>μοιάζει με απώλεια</b>, γι’\u00a0αυτό ζητάς περισσότερα.",
          "<b>Η λύση:</b> αν δεν ήταν δική\u00a0σου, θα την αγόραζες 8\u00a0€;",
          "Φαντάσου στη θέση της <b>5\u00a0€ στο χέρι σου</b>. Καλύτερα από την κούπα; <b>Πούλα\u00a0την.</b>"
        ],
        say: [
          "Σου χαρίζουν μια κούπα. Ωραία, αλλά τίποτα το ιδιαίτερο.",
          "Λίγα λεπτά αργότερα, θέλουν να σου την αγοράσουν.",
          "Για να την αποχωριστείς, θέλεις τουλάχιστον οκτώ ευρώ.",
          "Κι όμως, για την ίδια ακριβώς κούπα θα έδινες μόνο τέσσερα ευρώ.",
          "Και μόνο που είναι δική σου, μοιάζει πιο πολύτιμη.",
          "Το να τη δώσεις μοιάζει με απώλεια, γι’ αυτό ζητάς περισσότερα.",
          "Η λύση: αν δεν ήταν δική σου, θα την αγόραζες οκτώ ευρώ;",
          "Φαντάσου στη θέση της πέντε ευρώ στο χέρι σου. Καλύτερα από την κούπα; Τότε πούλα την.",
          "Φαινόμενο κατοχής. Ό,τι σου ανήκει μοιάζει πιο πολύτιμο. Κρίνε την αξία του σαν να μην ήταν δικό σου."
        ]
      },
      es: {
        name: "Efecto dotación", shareTitle: "El efecto dotación en 30 segundos",
        ecline: "Lo que tienes parece valer más. Juzga su valor como si no fuera tuyo.",
        eur: v => `${v} €`, sell: "¿Me la vendes?", atLeast: "Al menos 8 €.", price: "precio",
        ask: "pedirías", pay: "pagarías", sold: "vendes", yours: "porque es tuya", loss: "parece una pérdida",
        wouldI: "¿La compraría por 8 €?", no: "No.",
        caps: [
          "Te regalan una <b>taza</b>. Bonita, pero nada especial.",
          "Minutos después, alguien te ofrece <b>comprártela</b>.",
          "Pedirías al menos <b>8 €</b> para desprenderte de ella.",
          "Sin embargo, solo habrías pagado <b>4 €</b> por esa misma taza.",
          "El simple hecho de <b>tenerla</b> hace que parezca valer más.",
          "Desprenderte de ella <b>parece una pérdida</b>, así que pides más.",
          "<b>La solución:</b> si no fuera tuya, ¿la comprarías por 8 €?",
          "Imagina <b>5 € en la mano</b>. ¿Mejor que la taza? <b>Véndela.</b>"
        ],
        say: [
          "Te regalan una taza. Bonita, pero nada especial.",
          "Minutos después, alguien te ofrece comprártela.",
          "Pedirías al menos ocho euros para desprenderte de ella.",
          "Sin embargo, solo habrías pagado cuatro euros por esa misma taza.",
          "El simple hecho de tenerla hace que parezca valer más.",
          "Desprenderte de ella parece una pérdida, así que pides más.",
          "La solución: si no fuera tuya, ¿la comprarías por ocho euros?",
          "Imagina cinco euros en la mano. ¿Mejor que la taza? Entonces, véndela.",
          "Efecto dotación. Lo que tienes parece valer más. Juzga su valor como si no fuera tuyo."
        ]
      },
      fr: {
        name: "Effet de dotation", shareTitle: "L’effet de dotation en 30 secondes",
        ecline: "Ce qu’on possède semble valoir plus. Jugez-en la valeur comme si ce n’était pas à vous.",
        eur: v => `${v} €`, sell: "Vous le vendez ?", atLeast: "Au moins 8 €.", price: "prix",
        ask: "vente", pay: "achat", sold: "vendu", yours: "parce qu’il est à vous", loss: "comme une perte",
        wouldI: "Je l’achèterais 8 € ?", no: "Non.",
        caps: [
          "On vous offre un <b>mug</b>. Joli, mais rien de spécial.",
          "Quelques minutes plus tard, quelqu’un propose de vous l’<b>acheter</b>.",
          "Vous en voudriez au moins <b>8 €</b> pour vous en séparer.",
          "Pourtant, vous n’auriez payé que <b>4 €</b> pour ce même mug.",
          "Le simple fait de <b>le posséder</b> lui donne plus de valeur.",
          "S’en séparer <b>ressemble à une perte</b>, alors vous demandez plus.",
          "<b>La solution :</b> s’il n’était pas à vous, l’achèteriez-vous 8 € ?",
          "Imaginez plutôt <b>5 € en main</b>. Mieux que le mug ? <b>Vendez.</b>"
        ],
        say: [
          "On vous offre un mug. Joli, mais rien de spécial.",
          "Quelques minutes plus tard, quelqu’un propose de vous l’acheter.",
          "Vous en voudriez au moins huit euros pour vous en séparer.",
          "Pourtant, vous n’auriez payé que quatre euros pour ce même mug.",
          "Le simple fait de le posséder lui donne plus de valeur.",
          "S’en séparer ressemble à une perte, alors vous demandez plus.",
          "La solution : s’il n’était pas à vous, l’achèteriez-vous huit euros ?",
          "Imaginez plutôt cinq euros en main. Mieux que le mug ? Alors vendez.",
          "L’effet de dotation. Ce qu’on possède semble valoir plus. Jugez-en la valeur comme si ce n’était pas à vous."
        ]
      },
      de: {
        name: "Besitztumseffekt", shareTitle: "Der Besitztumseffekt in 30 Sekunden",
        ecline: "Was dir gehört, wirkt wertvoller. Schätz seinen Wert so, als wäre es nicht deins.",
        eur: v => `${v} €`, sell: "Verkaufst du sie?", atLeast: "Mindestens 8 €.", price: "Preis",
        ask: "du willst", pay: "du zahlst", sold: "verkauft", yours: "weil sie dir gehört", loss: "wie ein Verlust",
        wouldI: "Würde ich 8 € zahlen?", no: "Nein.",
        caps: [
          "Jemand schenkt dir eine <b>Tasse</b>. Nett, aber nichts Besonderes.",
          "Minuten später will dir jemand die Tasse <b>abkaufen</b>.",
          "Du willst mindestens <b>8 €</b>, um sie herzugeben.",
          "Dabei hättest du für genau diese Tasse nur <b>4 €</b> bezahlt.",
          "Allein, dass sie <b>dir gehört</b>, lässt sie wertvoller wirken.",
          "Sie herzugeben <b>fühlt sich wie ein Verlust an</b>, also verlangst du mehr.",
          "<b>Die Lösung:</b> Wenn sie nicht dir gehörte, würdest du sie für 8 € kaufen?",
          "Stell dir stattdessen <b>5 € in deiner Hand</b> vor. Besser als die Tasse? <b>Dann verkauf.</b>"
        ],
        say: [
          "Jemand schenkt dir eine Tasse. Nett, aber nichts Besonderes.",
          "Minuten später will dir jemand die Tasse abkaufen.",
          "Du willst mindestens acht Euro, um sie herzugeben.",
          "Dabei hättest du für genau diese Tasse nur vier Euro bezahlt.",
          "Allein, dass sie dir gehört, lässt sie wertvoller wirken.",
          "Sie herzugeben fühlt sich wie ein Verlust an, also verlangst du mehr.",
          "Die Lösung: Wenn sie nicht dir gehörte, würdest du sie für acht Euro kaufen?",
          "Stell dir stattdessen fünf Euro in deiner Hand vor. Besser als die Tasse? Dann verkauf.",
          "Der Besitztumseffekt. Was dir gehört, wirkt wertvoller. Schätz seinen Wert so, als wäre es nicht deins."
        ]
      },
      it: {
        name: "Effetto dotazione", shareTitle: "L’effetto dotazione in 30 secondi",
        ecline: "Ciò che possiedi sembra valere di più. Giudica il suo valore come se non fosse tuo.",
        eur: v => `${v} €`, sell: "Me la vendi?", atLeast: "Almeno 8 €.", price: "prezzo",
        ask: "vendita", pay: "acquisto", sold: "vendi", yours: "perché è tua", loss: "sembra una perdita",
        wouldI: "La comprerei a 8 €?", no: "No.",
        caps: [
          "Qualcuno ti regala una <b>tazza</b>. Carina, ma niente di speciale.",
          "Pochi minuti dopo, qualcuno si offre di <b>comprarla</b>.",
          "Per dargliela vorresti almeno <b>8 €</b>.",
          "Eppure per la stessa identica tazza avresti pagato solo <b>4 €</b>.",
          "Il solo fatto di <b>possederla</b> la fa sembrare più preziosa.",
          "Cederla <b>sembra una perdita</b>, così chiedi di più.",
          "<b>La soluzione:</b> se non fosse tua, la compreresti a 8 €?",
          "Immagina invece <b>5 € in mano</b>. Meglio della tazza? <b>Vendi.</b>"
        ],
        say: [
          "Qualcuno ti regala una tazza. Carina, ma niente di speciale.",
          "Pochi minuti dopo, qualcuno si offre di comprarla.",
          "Per dargliela vorresti almeno otto euro.",
          "Eppure per la stessa identica tazza avresti pagato solo quattro euro.",
          "Il solo fatto di possederla la fa sembrare più preziosa.",
          "Cederla sembra una perdita, così chiedi di più.",
          "La soluzione: se non fosse tua, la compreresti a otto euro?",
          "Immagina invece cinque euro in mano. Meglio della tazza? Allora vendi.",
          "L’effetto dotazione. Ciò che possiedi sembra valere di più. Giudica il suo valore come se non fosse tuo."
        ]
      }
    },
    svg(T) {
      let ticks = "";
      for (let v = 1; v <= 10; v++) {
        const w = v % 5 ? 3.5 : 6;
        ticks += `<line class="ew-tick" x1="${PX - w}" x2="${PX + w}" y1="${py(v)}" y2="${py(v)}"/>`;
      }
      const tag = (key, cls, flip) => `<g class="ew-tag${cls}" data-k="${key}"><path d="${TAG}"${flip ? ' transform="scale(-1 1)"' : ""}/>` +
        `<circle cx="${flip ? 21 : -21}" r="2.2"/><text data-k="${key}t" x="${flip ? -4 : 4}" y="5"></text></g>`;
      const gap = (key, cls, label) => `<g class="ew-gap${cls}" data-k="${key}"><line class="bar" x1="${PX}" x2="${PX}" y1="${py(8) + 3}" y2="${py(4) - 3}"/>
        <path d="M${PX - 8} ${py(8)} H${PX - 14} V${py(4)} H${PX - 8} M${PX - 14} ${py(6)} H${PX - 19}"/>
        <text x="${PX - 24}" y="${py(6) + 4}">${label}</text></g>`;
      const heart = "M0 7 C-11 -1 -11 -9 -5 -9 C-2.5 -9 0 -7 0 -4.5 C0 -7 2.5 -9 5 -9 C11 -9 11 -1 0 7 Z";
      return `
        <line class="ew-table" x1="16" y1="${TABLE}" x2="384" y2="${TABLE}"/>
        <g data-k="pole"><line class="ew-pole" x1="${PX}" x2="${PX}" y1="${TABLE}" y2="${py(10) - 6}"/>${ticks}
          <text class="ew-plab" x="${PX}" y="${TABLE + 16}">${T.price}</text></g>
        ${gap("gapQ", "", T.yours)}${gap("gapR", " bad", T.loss)}
        <g data-k="t8g">${tag("t8", "")}</g>
        <path class="ew-strike" data-k="strike" pathLength="1" stroke-dasharray="1 1" d="M${TR - 25} ${py(8) + 7} L${TR + 23} ${py(8) - 7}"/>
        <text class="ew-tl" data-k="ask" x="${TR}" y="${py(8) - 17}">${T.ask}</text>
        ${tag("t4", "")}
        <text class="ew-tl" data-k="pay" x="${TR}" y="${py(4) - 17}">${T.pay}</text>
        ${tag("t5", " ok", 1)}
        <text class="ew-tl ok" data-k="sold" x="${TL}" y="${py(5) - 17}">${T.sold}</text>
        <g data-k="you">${bust("ew-you", YX)}<circle class="ew-eye" cx="${YX - 4.5}" cy="171" r="1.6"/><circle class="ew-eye" cx="${YX + 4.5}" cy="171" r="1.6"/>
          <g class="ew-you"><path data-k="mouth" d=""/></g></g>
        <g data-k="them">${bust("ew-them", BX)}<circle class="ew-eye m" cx="${BX - 4.5}" cy="171" r="1.6"/><circle class="ew-eye m" cx="${BX + 4.5}" cy="171" r="1.6"/>
          <g class="ew-them"><path d="M${BX - 5} 180 Q${BX} 182 ${BX + 5} 180"/></g></g>
        <g data-k="box"><rect class="ew-box" x="-22" y="-32" width="44" height="32" rx="2"/><line class="ew-rib" x1="0" y1="-32" x2="0" y2="0"/>
          <g data-k="lid"><rect class="ew-box" x="-25" y="-40" width="50" height="9" rx="2"/><line class="ew-rib" x1="0" y1="-40" x2="0" y2="-31"/>
            <path class="ew-rib" d="M0 -40 C-6 -50 -15 -48 -12 -42 C-10 -39 -4 -40 0 -40 C4 -40 10 -39 12 -42 C15 -48 6 -50 0 -40"/></g></g>
        <g data-k="mug"><path class="ew-hdl" d="M20 -38 C35 -38 35 -12 20 -12"/>
          <path class="ew-mug" d="M-20 -46 V-6 Q-20 0 -14 0 H14 Q20 0 20 -6 V-46 Z"/>
          <path class="ew-stripe" d="M-20 -38 H20"/>
          <g data-k="heart"><path class="ew-heart" d="${heart}"/></g></g>
        <g class="ew-note" data-k="note"><rect x="-25" y="-14" width="50" height="28" rx="3"/><rect class="in" x="-20" y="-9" width="40" height="18" rx="2"/>
          <text y="4.5">${T.eur(5)}</text></g>
        <g class="ew-bub them" data-k="bubB"><rect x="266" y="118" width="122" height="28" rx="10"/><path d="M${BX - 12} 145 L${BX - 6} 156 L${BX} 145"/><text x="327" y="136">${T.sell}</text></g>
        <g class="ew-bub" data-k="bubY"><rect x="12" y="118" width="122" height="28" rx="10"/><path d="M${YX - 6} 145 L${YX} 156 L${YX + 6} 145"/><text x="73" y="136">${T.atLeast}</text></g>
        <g class="ew-think" data-k="think"><rect x="12" y="92" width="152" height="50" rx="14"/><circle cx="${YX + 2}" cy="149" r="3.4"/><circle cx="${YX}" cy="156" r="2"/>
          <text x="88" y="112">${T.wouldI}</text><text class="no" data-k="no" x="88" y="131">${T.no}</text></g>
        <g data-k="chk"><g class="ew-chk"><circle r="10"/><path d="M-4.5 0.5 L-1.2 3.8 L4.8 -3"/></g></g>`;
    },
    S0: { you: 0, box: 0, lid: 0, mug: 0, boxOut: 0, them: 0, bubB: 0, bubY: 0, pole: 0, t8: 0, ask: 0, t4: 0, pay: 0,
      heart: 0, gap: 0, red: 0, tug: 0, mood: 0, think: 0, no: 0, strike: 0, dim: 0, t5: 0, sold: 0, swap: 0, note: 0, chk: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const f = v => v.toFixed(2);
      op("you", S.you);
      k("mouth").setAttribute("d", `M${YX - 5.5} 180 Q${YX} ${f(180 + 4.5 * S.mood)} ${YX + 5.5} 180`);
      k("them").setAttribute("transform", `translate(${f((1 - S.them) * 40)} 0)`);
      op("them", S.them);
      // the gift box pops up, its lid flies off, and the mug rises out of it
      k("box").setAttribute("transform", `translate(${MX} ${TABLE}) scale(${f(0.6 + 0.4 * S.box)})`);
      op("box", S.box * 2 * (1 - S.boxOut));
      k("lid").setAttribute("transform", `translate(${f(S.lid * 10)} ${f(-S.lid * 30)}) rotate(${f(S.lid * 28)})`);
      op("lid", 1 - S.lid);
      const mx = MX + 36 * S.tug + (MSOLD - MX) * S.swap;
      k("mug").setAttribute("transform", `translate(${f(mx)} ${TABLE}) scale(${f(Math.max(0.001, 0.3 + 0.7 * S.mug))})`);
      op("mug", S.mug * 3);
      k("heart").setAttribute("transform", `translate(0 -18) scale(${f(Math.max(0.001, S.heart))})`);
      op("heart", S.heart * 2);
      // speech bubbles pop from their tails
      const pop = (key, v, x, y) => {
        const s = 0.7 + 0.3 * v;
        k(key).setAttribute("transform", `translate(${x} ${y}) scale(${f(s)}) translate(${-x} ${-y})`);
        op(key, v * 1.6);
      };
      pop("bubB", S.bubB, BX - 6, 156); pop("bubY", S.bubY, YX, 156); pop("think", S.think, YX, 156);
      op("no", S.no);
      // the price pole and the tags that climb it
      op("pole", S.pole);
      const tag = (key, v, x) => {
        k(key).setAttribute("transform", `translate(${x} ${f(py(v))})`);
        k(key + "t").textContent = T.eur(Math.round(v));
        return v >= 0.5 ? 1 : 0;
      };
      op("t8", tag("t8", S.t8, TR)); op("t4", tag("t4", S.t4, TR)); op("t5", tag("t5", S.t5, TL));
      op("t8g", 1 - 0.55 * S.dim);
      op("ask", S.ask * (1 - 0.55 * S.dim)); op("pay", S.pay); op("sold", S.sold);
      k("strike").style.strokeDashoffset = f(1 - S.strike);
      op("strike", S.strike > 0 ? 1 : 0);
      // the gap between the two prices: first "yours", then "a loss"
      op("gapQ", S.gap * (1 - S.red)); op("gapR", S.gap * S.red);
      // the fix: cash in your hand, the mug goes to the buyer
      k("note").setAttribute("transform", `translate(${MX} ${TABLE - 18}) scale(${f(Math.max(0.001, 0.6 + 0.4 * S.note))})`);
      op("note", S.note * 2);
      k("chk").setAttribute("transform", `translate(${YX + 32} 152) scale(${f(Math.max(0.001, S.chk))})`);
      op("chk", S.chk * 2);
    },
    beats: [
      { steps: [{ to: { you: 1 }, ms: 400 }, { to: { box: 1 }, ms: 450, ease: "out" }, { wait: 250 },
        { to: { lid: 1 }, ms: 450 }, { to: { mug: 1, boxOut: 1 }, ms: 600, ease: "out", sfx: "pluck" }, { to: { mood: 0.35 }, ms: 300 }] },
      { steps: [{ to: { them: 1 }, ms: 700, ease: "inOut" }, { to: { bubB: 1 }, ms: 400, ease: "out", sfx: "pop" }] },
      { steps: [{ to: { bubB: 0 }, ms: 250 }, { to: { bubY: 1 }, ms: 400, ease: "out" }, { to: { pole: 1 }, ms: 300 },
        { to: { t8: 8 }, ms: 1100, ease: "inOut", sfx: "tick" }, { to: { ask: 1 }, ms: 350 }] },
      { steps: [{ to: { bubY: 0 }, ms: 250 }, { to: { t4: 4 }, ms: 800, ease: "inOut", sfx: "tick" }, { to: { pay: 1 }, ms: 350 }] },
      { steps: [{ to: { heart: 1, mood: 0.8 }, ms: 450, ease: "out", sfx: "pop" }, { wait: 250 }, { to: { gap: 1 }, ms: 500 }] },
      { steps: [{ to: { tug: 1 }, ms: 500, ease: "inOut" }, { to: { red: 1, mood: -1 }, ms: 350 },
        { to: { tug: 0 }, ms: 700, ease: "out", sfx: "spring" }] },
      { steps: [{ to: { gap: 0, heart: 0, mood: 0 }, ms: 450 }, { to: { think: 1 }, ms: 400, ease: "out" }, { wait: 700 },
        { to: { no: 1 }, ms: 250 }, { to: { strike: 1, dim: 1 }, ms: 450, sfx: "scribble" }] },
      { steps: [{ to: { think: 0 }, ms: 300 }, { to: { t5: 5 }, ms: 800, ease: "inOut" }, { to: { sold: 1 }, ms: 300 },
        { to: { swap: 1 }, ms: 900, ease: "inOut", sfx: "whoosh" }, { to: { note: 1 }, ms: 400, ease: "out" },
        { to: { mood: 1, chk: 1 }, ms: 400, ease: "out", sfx: "chime" }], hold: 4200 }
    ]
  };
})();
