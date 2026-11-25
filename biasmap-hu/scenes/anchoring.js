/* Anchoring: a house, a seller's number, and a guess tied to it by a rope. Scene for anim.js. */
(function () {
  const X = v => 30 + (v - 300) / 700 * 340;           // € thousands -> x
  const AX = X(900), TRUTH = 600, SHORT = 780, OWN = 620;
  window.BiasAnim.SCENES.anchoring = {
    q: "tmi", viewBox: "0 0 400 272",
    text: {
      hu: {
        name: "Horgonyhatás", shareTitle: "A horgonyhatás, 30 másodpercben",
        ecline: "Az első szám, amit hallasz, lesz a kiindulópontod. Előbb a sajátodat tartsd szem előtt.",
        bubble: "„900 ezer eurót kérek”", truth: "Valós érték", hidden: "neked nem látszik", start: "kiindulópont",
        adj: "igazítás", pull: "húzás", padh: "Te becsülöd", padv: "550–650 ezer €", guess: "A te becslésed",
        withAnchor: "A horgonnyal", withRange: "Előbb a sávod", gap: v => `${v} ezer €-val drágább`, axis: "Ár, ezer €",
        caps: [
          "Egy házat szeretnél megvenni. Mennyit ér?",
          "A valós értéke körülbelül <b>600 ezer €</b>. Ezt te még nem tudod.",
          "Az eladó kezd: „<b>900 ezer €</b>-t kérek.”",
          "Az agyad ezt a <b>900 ezer €-t</b> veszi kiindulópontnak.",
          "Túl soknak tűnik, ezért lefelé igazítasz…",
          "…de túl korán állsz meg, <b>180 ezer €-val drágábban</b>.",
          "<b>A megoldás:</b> előbb írd le a saját becslésedet.",
          "A saját sávodból indulj. A <b>valós érték</b> közelében landolsz."
        ],
        say: [
          "Egy házat szeretnél megvenni. Mennyit ér?",
          "A valós értéke körülbelül hatszázezer euró. Ezt viszont még nem tudod.",
          "Az eladó kezd. Kilencszázezer eurót kérek.",
          "Az agyad ezt a számot veszi kiindulópontnak.",
          "Túl soknak tűnik, ezért lefelé igazítasz...",
          "...de túl korán állsz meg. Végül százkilencvenezer euróval drágábban vennéd meg.",
          "A megoldás: előbb írd le a saját becslésedet.",
          "A saját sávodból indulva a valós érték közelébe jutsz.",
          "Horgonyhatás. Az első szám, amit hallasz, lesz a kiindulópontod. Előbb a sajátodat tartsd szem előtt."
        ]
      },
      en: {
        name: "Anchoring", shareTitle: "Anchoring, explained in 30 seconds",
        ecline: "The first number you hear sets your starting point. Know your own first.",
        bubble: "“I'm asking €900k”", truth: "Fair value", hidden: "hidden from you", start: "starting point",
        adj: "adjusting", pull: "pull", padh: "Your estimate", padv: "€550–650k", guess: "Your guess",
        withAnchor: "With the anchor", withRange: "Your range first", gap: v => `€${v}k too high`, axis: "Price, € thousands",
        caps: [
          "You want to buy this house. What's it worth?",
          "Its fair value is about <b>€600k</b>. You don't know that yet.",
          "The seller speaks first: “I'm asking <b>€900k</b>.”",
          "Your mind grabs €900k as its <b>starting point</b>.",
          "It feels too high, so you adjust down…",
          "…but you stop too early, <b>€180k too high</b>.",
          "<b>The fix:</b> write down your own estimate first.",
          "Start from your own range. You land near <b>fair value</b>."
        ],
        say: [
          "You want to buy this house. What's it worth?",
          "Its fair value is about six hundred thousand euros. But you don't know that yet.",
          "The seller speaks first. I'm asking nine hundred thousand.",
          "Your mind grabs that number as its starting point.",
          "It feels too high, so you adjust down...",
          "...but you stop too early. You end up a hundred and eighty thousand too high.",
          "The fix: write down your own estimate first.",
          "Start from your own range, and you land close to the fair value.",
          "Anchoring. The first number you hear sets your starting point. Know your own first."
        ]
      },
      el: {
        name: "Αγκύρωση", shareTitle: "Η αγκύρωση σε 30 δευτερόλεπτα",
        ecline: "Ο πρώτος αριθμός που ακούς γίνεται η αφετηρία σου. Να ξέρεις τον δικό σου πρώτα.",
        bubble: "«Ζητάω 900 χιλ. €»", truth: "Πραγματική αξία", hidden: "δεν τη γνωρίζεις", start: "αφετηρία",
        adj: "προσαρμογή", pull: "τράβηγμα", padh: "Η εκτίμησή σου", padv: "550–650 χιλ.", guess: "Η εκτίμησή σου",
        withAnchor: "Με την άγκυρα", withRange: "Με το δικό σου εύρος", gap: v => `${v} χιλ. € παραπάνω`, axis: "Τιμή, χιλ. €",
        caps: [
          "Θέλεις να αγοράσεις αυτό το σπίτι. Πόσο αξίζει;",
          "Η πραγματική του αξία είναι περίπου <b>600 χιλ. €</b>. Εσύ δεν το ξέρεις ακόμα.",
          "Ο πωλητής μιλάει πρώτος: “Ζητάω <b>900 χιλ. €</b>”.",
          "Το μυαλό σου κρατά τα 900 χιλ. ως <b>αφετηρία</b>.",
          "Σου φαίνεται ακριβό, οπότε κατεβαίνεις…",
          "…αλλά σταματάς νωρίς, <b>180 χιλ. € πιο ψηλά</b>.",
          "<b>Η λύση:</b> γράψε πρώτα τη δική σου εκτίμηση.",
          "Ξεκίνα από το δικό σου εύρος. Καταλήγεις κοντά στην <b>πραγματική αξία</b>."
        ],
        say: [
          "Θέλεις να αγοράσεις αυτό το σπίτι. Πόσο αξίζει;",
          "Η πραγματική του αξία είναι περίπου εξακόσιες χιλιάδες ευρώ. Εσύ όμως δεν το ξέρεις ακόμα.",
          "Ο πωλητής μιλάει πρώτος. Ζητάω εννιακόσιες χιλιάδες.",
          "Το μυαλό σου κρατά αυτόν τον αριθμό ως αφετηρία.",
          "Σου φαίνεται ακριβό, οπότε κατεβαίνεις...",
          "...αλλά σταματάς νωρίς. Καταλήγεις εκατόν ογδόντα χιλιάδες πιο ψηλά.",
          "Η λύση: γράψε πρώτα τη δική σου εκτίμηση.",
          "Ξεκίνα από το δικό σου εύρος, και καταλήγεις κοντά στην πραγματική αξία.",
          "Αγκύρωση. Ο πρώτος αριθμός που ακούς γίνεται η αφετηρία σου. Να ξέρεις τον δικό σου πρώτα."
        ]
      },
      es: {
        name: "Anclaje", shareTitle: "El anclaje en 30 segundos",
        ecline: "El primer número que oyes se vuelve tu punto de partida. Ten claro el tuyo antes.",
        bubble: "«Pido 900 mil €»", truth: "Valor real", hidden: "no lo sabes", start: "punto de partida",
        adj: "ajustando", pull: "tirón", padh: "Tu estimación", padv: "550–650 mil", guess: "Tu cálculo",
        withAnchor: "Con el ancla", withRange: "Desde tu rango", gap: v => `${v} mil € de más`, axis: "Precio, miles de €",
        caps: [
          "Quieres comprar esta casa. ¿Cuánto vale?",
          "Su valor real ronda los <b>600 mil €</b>. Tú aún no lo sabes.",
          "El vendedor habla primero: «Pido <b>900 mil €</b>».",
          "Tu mente toma esos 900 mil como <b>punto de partida</b>.",
          "Te parece demasiado, así que bajas…",
          "…pero te detienes antes de tiempo: <b>180 mil € de más</b>.",
          "<b>La solución:</b> anota primero tu propia estimación.",
          "Parte de tu propio rango. Acabas cerca del <b>valor real</b>."
        ],
        say: [
          "Quieres comprar esta casa. ¿Cuánto vale?",
          "Su valor real ronda los seiscientos mil euros. Pero tú aún no lo sabes.",
          "El vendedor habla primero. Pido novecientos mil.",
          "Tu mente toma ese número como punto de partida.",
          "Te parece demasiado, así que bajas...",
          "...pero te detienes antes de tiempo. Acabas ciento ochenta mil euros por encima.",
          "La solución: anota primero tu propia estimación.",
          "Parte de tu propio rango, y acabas cerca del valor real.",
          "Anclaje. El primer número que oyes se vuelve tu punto de partida. Ten claro el tuyo antes."
        ]
      },
      fr: {
        name: "Ancrage", shareTitle: "L’ancrage en 30 secondes",
        ecline: "Le premier chiffre entendu devient votre point de départ. Fixez d’abord le vôtre.",
        bubble: "« J’en veux 900 000 € »", truth: "Juste prix", hidden: "vous l’ignorez", start: "point de départ",
        adj: "ajustement", pull: "rappel", padh: "Votre estimation", padv: "550–650 k€", guess: "Votre prix",
        withAnchor: "Avec l’ancre", withRange: "Votre fourchette", gap: v => `${v} k€ de trop`, axis: "Prix, milliers d’euros",
        caps: [
          "Vous voulez acheter cette maison. Combien vaut-elle ?",
          "Son juste prix est d’environ <b>600 000 €</b>. Vous l’ignorez encore.",
          "Le vendeur parle en premier : « J’en veux <b>900 000 €</b> ».",
          "Votre esprit prend ces 900 000 € comme <b>point de départ</b>.",
          "Ça vous semble trop cher, alors vous descendez…",
          "…mais vous vous arrêtez trop tôt : <b>180 000 € de trop</b>.",
          "<b>La solution :</b> notez d’abord votre propre estimation.",
          "Partez de votre fourchette. Vous tombez près du <b>juste prix</b>."
        ],
        say: [
          "Vous voulez acheter cette maison. Combien vaut-elle ?",
          "Son juste prix est d’environ six cent mille euros. Mais vous ne le savez pas encore.",
          "Le vendeur parle en premier. J’en veux neuf cent mille.",
          "Votre esprit prend ce chiffre comme point de départ.",
          "Ça vous semble trop cher, alors vous descendez...",
          "...mais vous vous arrêtez trop tôt. Vous finissez cent quatre-vingt mille euros trop haut.",
          "La solution : notez d’abord votre propre estimation.",
          "Partez de votre propre fourchette, et vous tombez près du juste prix.",
          "L’ancrage. Le premier chiffre entendu devient votre point de départ. Fixez d’abord le vôtre."
        ]
      },
      de: {
        name: "Ankereffekt", shareTitle: "Der Ankereffekt in 30 Sekunden",
        ecline: "Die erste Zahl, die du hörst, wird dein Startpunkt. Leg deine eigene vorher fest.",
        bubble: "„Ich will 900.000 €“", truth: "Fairer Wert", hidden: "kennst du nicht", start: "Startpunkt",
        adj: "Anpassung", pull: "Zug", padh: "Deine Schätzung", padv: "550–650 Tsd.", guess: "Dein Tipp",
        withAnchor: "Mit dem Anker", withRange: "Erst deine Spanne", gap: v => `${v}.000 € zu hoch`, axis: "Preis in Tausend €",
        caps: [
          "Du willst dieses Haus kaufen. Was ist es wert?",
          "Sein fairer Wert liegt bei etwa <b>600.000 €</b>. Das weißt du noch nicht.",
          "Der Verkäufer spricht zuerst: „Ich will <b>900.000 €</b>.“",
          "Dein Kopf nimmt die 900.000 € als <b>Startpunkt</b>.",
          "Das wirkt zu hoch, also gehst du runter…",
          "…aber du hörst zu früh auf, <b>180.000 € zu hoch</b>.",
          "<b>Die Lösung:</b> Schreib zuerst deine eigene Schätzung auf.",
          "Starte bei deiner eigenen Spanne. Du landest nahe am <b>fairen Wert</b>."
        ],
        say: [
          "Du willst dieses Haus kaufen. Was ist es wert?",
          "Sein fairer Wert liegt bei etwa sechshunderttausend Euro. Aber das weißt du noch nicht.",
          "Der Verkäufer spricht zuerst. Ich will neunhunderttausend.",
          "Dein Kopf nimmt diese Zahl als Startpunkt.",
          "Das wirkt zu hoch, also gehst du runter...",
          "...aber du hörst zu früh auf. Am Ende liegst du hundertachtzigtausend Euro zu hoch.",
          "Die Lösung: Schreib zuerst deine eigene Schätzung auf.",
          "Starte bei deiner eigenen Spanne, und du landest nahe am fairen Wert.",
          "Der Ankereffekt. Die erste Zahl, die du hörst, wird dein Startpunkt. Leg deine eigene vorher fest."
        ]
      },
      it: {
        name: "Ancoraggio", shareTitle: "L’ancoraggio in 30 secondi",
        ecline: "Il primo numero che senti diventa il tuo punto di partenza. Fissa prima il tuo.",
        bubble: "«Chiedo 900.000 €»", truth: "Valore reale", hidden: "non lo sai", start: "punto di partenza",
        adj: "correzione", pull: "tira", padh: "La tua stima", padv: "550–650 mila", guess: "Il tuo prezzo",
        withAnchor: "Con l’àncora", withRange: "Dalla tua forbice", gap: v => `${v}.000 € in più`, axis: "Prezzo, migliaia di €",
        caps: [
          "Vuoi comprare questa casa. Quanto vale?",
          "Il suo valore reale è di circa <b>600.000 €</b>. Tu ancora non lo sai.",
          "Il venditore parla per primo: «Chiedo <b>900.000 €</b>».",
          "La tua mente prende quei 900.000 € come <b>punto di partenza</b>.",
          "Ti sembra troppo, quindi scendi…",
          "…ma ti fermi troppo presto: <b>180.000 € in più</b>.",
          "<b>La soluzione:</b> scrivi prima la tua stima.",
          "Parti dalla tua forbice. Arrivi vicino al <b>valore reale</b>."
        ],
        say: [
          "Vuoi comprare questa casa. Quanto vale?",
          "Il suo valore reale è di circa seicentomila euro. Ma tu ancora non lo sai.",
          "Il venditore parla per primo. Chiedo novecentomila.",
          "La tua mente prende quel numero come punto di partenza.",
          "Ti sembra troppo, quindi scendi...",
          "...ma ti fermi troppo presto. Finisci centottantamila euro sopra.",
          "La soluzione: scrivi prima la tua stima.",
          "Parti dalla tua forbice, e arrivi vicino al valore reale.",
          "Ancoraggio. Il primo numero che senti diventa il tuo punto di partenza. Fissa prima il tuo."
        ]
      }
    },
    svg(T) {
      let axis = `<line class="ax" x1="30" y1="200" x2="370" y2="200"/>`;
      for (let v = 300; v <= 1000; v += 100) axis += `<line class="tick" x1="${X(v)}" y1="196" x2="${X(v)}" y2="204"/><text class="tl" x="${X(v)}" y="217">${v}</text>`;
      axis += `<text class="axt" x="30" y="270">${T.axis}</text>`;
      return `${axis}
        <g data-k="house"><path class="house" d="M34 70 L66 42 L98 70 M42 64 V100 H90 V64 M60 100 V82 H72 V100"/>
          <g class="tag" data-k="tag"><line x1="98" y1="66" x2="114" y2="58"/><rect x="112" y="44" width="30" height="26" rx="6"/><text x="127" y="63">?</text></g></g>
        <g class="pad" data-k="pad"><rect x="30" y="112" width="92" height="40" rx="7"/><text class="h" x="76" y="126">${T.padh}</text><text class="v" x="76" y="144">${T.padv}</text></g>
        <g class="bubble" data-k="bubble"><rect x="226" y="12" width="160" height="34" rx="10"/><path d="M314 45 L321 56 L328 45"/><text x="306" y="34">${T.bubble}</text></g>
        <g data-k="anchor"><g class="anchor"><circle cx="0" cy="-26" r="5"/><path d="M0 -21 V0 M-10 -15 H10 M-14 -8 C-12 2 -5 4 0 4 C5 4 12 2 14 -8"/></g></g>
        <text class="note" data-k="start" x="${AX}" y="236">${T.start}</text>
        <g class="band" data-k="band"><rect x="${X(550)}" y="193" width="${X(650) - X(550)}" height="14" rx="3"/></g>
        <path class="rope" data-k="rope" d=""/>
        <g data-k="adj"><path class="arrow" data-k="adjp" d=""/><text class="note" x="${(AX + X(700)) / 2}" y="110">${T.adj}</text></g>
        <g data-k="pull"><path class="arrow" data-k="pullp" d=""/><text class="note" data-k="pullt" y="164">${T.pull}</text></g>
        <g class="ghost" data-k="ghost" transform="translate(${X(TRUTH)} 0)"><line y1="168" y2="200"/><circle r="8" cy="160"/><text x="-13" y="158">${T.truth}</text><text class="sub" data-k="hidden" x="-13" y="170">${T.hidden}</text></g>
        <g class="pin p1" data-k="pin"><line y1="168" y2="200"/><circle r="8" cy="160"/><text data-k="guess"></text></g>
        <g class="pin p2" data-k="pin2"><line y1="168" y2="200"/><circle r="8" cy="160"/><text text-anchor="end" x="-13" y="164">${T.withRange}</text></g>
        <g class="gap" data-k="gap"><line x1="${X(TRUTH)}" x2="${X(SHORT)}" y1="244" y2="244"/><line x1="${X(TRUTH)}" x2="${X(TRUTH)}" y1="238" y2="250"/><line x1="${X(SHORT)}" x2="${X(SHORT)}" y1="238" y2="250"/><text x="${(X(TRUTH) + X(SHORT)) / 2}" y="262">${T.gap(SHORT - TRUTH)}</text></g>`;
    },
    S0: { house: 0, tagSwing: 0, ghost: 0, hidden: 1, bubble: 0, anchorY: 60, anchorOp: 0, start: 0,
      pin: 0, pinX: 900, pinFade: 1, rope: 0, adj: 0, pull: 0, gap: 0, pad: 0, band: 0, pin2: 0, pin2X: 600, final: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = v; };
      op("house", S.house);
      k("tag").setAttribute("transform", `rotate(${S.tagSwing} 98 66)`);
      op("bubble", S.bubble);
      k("anchor").setAttribute("transform", `translate(${AX} ${S.anchorY})`);
      op("anchor", S.anchorOp);
      op("start", S.start);
      op("ghost", S.ghost); op("hidden", S.hidden);
      const px = X(S.pinX);
      k("pin").setAttribute("transform", `translate(${px} 0)`);
      op("pin", S.pin * S.pinFade);
      const g = k("guess"), fin = S.final > .5;
      g.textContent = fin ? T.withAnchor : T.guess;
      g.setAttribute("text-anchor", fin ? "start" : "middle");
      g.setAttribute("x", fin ? 13 : 0); g.setAttribute("y", fin ? 164 : 142);
      const sag = Math.max(2, 22 - Math.abs(AX - px) / 6);
      k("rope").setAttribute("d", `M${AX} ${S.anchorY - 8} Q${(AX + px) / 2} ${184 + sag} ${px} 178`);
      op("rope", S.rope);
      const ax2 = AX - (AX - X(700)) * S.adj;
      k("adjp").setAttribute("d", `M${AX} 118 H${ax2} M${ax2 + 6} 113 L${ax2} 118 L${ax2 + 6} 123`);
      op("adj", S.adj > .02 ? Math.min(1, S.adj * 2) : 0);
      const mx = (AX + px) / 2;
      k("pullp").setAttribute("d", `M${mx - 10} 172 H${mx + 10} M${mx + 4} 167 L${mx + 10} 172 L${mx + 4} 177`);
      k("pullt").setAttribute("x", mx);
      op("pull", S.pull);
      op("gap", S.gap); op("pad", S.pad); op("band", S.band);
      k("pin2").setAttribute("transform", `translate(${X(S.pin2X)} 0)`);
      op("pin2", S.pin2);
    },
    beats: [
      { steps: [{ to: { house: 1 }, ms: 600, sfx: "pluck" }, { to: { tagSwing: 12 }, ms: 260, sfx: "tick" }, { to: { tagSwing: -8 }, ms: 300, ease: "inOut" }, { to: { tagSwing: 0 }, ms: 300, ease: "inOut" }] },
      { steps: [{ to: { ghost: 1 }, ms: 600, sfx: "tick" }, { wait: 1400 }, { to: { ghost: .35 }, ms: 600 }] },
      { steps: [{ to: { bubble: 1 }, ms: 450, sfx: "pop" }, { wait: 500 }, { to: { anchorOp: 1 } }, { to: { anchorY: 200 }, ms: 1000, ease: "out", sfx: "thud", sfxAt: 360 }] },
      { steps: [{ to: { start: 1 }, ms: 400 }, { to: { pin: 1 }, ms: 400, sfx: "pop" }, { to: { rope: 1 }, ms: 400 }] },
      { steps: [{ to: { adj: 1, pinX: 700 }, ms: 1500, ease: "inOut", sfx: "whoosh" }] },
      { steps: [{ to: { pull: 1 }, ms: 300 }, { to: { pinX: SHORT, adj: 0 }, ms: 800, ease: "out", sfx: "spring" }, { to: { ghost: 1, hidden: 0 }, ms: 400 }, { to: { gap: 1 }, ms: 400, sfx: "tick" }] },
      { steps: [{ to: { pull: 0, gap: 0, pinFade: .4, start: 0, ghost: 0 }, ms: 500 }, { to: { pad: 1 }, ms: 500, sfx: "scribble" }, { wait: 300 }, { to: { band: 1 }, ms: 500, sfx: "tick" }] },
      { steps: [{ to: { final: 1, pin2X: 600 } }, { to: { pin2: 1 }, ms: 400, sfx: "pop" }, { to: { pin2X: OWN }, ms: 700 }, { to: { rope: 0, anchorOp: .3, bubble: .35 }, ms: 600, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
