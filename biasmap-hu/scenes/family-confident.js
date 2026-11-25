/* Family: confidence to act. You, a paper ball and a bin across the room. A dial shows your confidence:
   the brain turns it up so you take the shot, then too far. A second dial, your track record, shows how
   often the ball really goes in. You steer a ball that has left your hand, credit skill for the hits and
   luck for the misses, then set the dial by your record and still take the shot. Scene for anim.js. */
(function () {
  const KEY = "family-confident", P = `.bp[data-scene="${KEY}"]`;
  const FL = 214;                                        // the floor
  const PX = 56, HY = 150;                               // you: head centre
  const G1 = 210, G2 = 330, GY = 78, GR = 44;            // the two dials: centres, radius
  const BX = 340, BT = 184;                              // the bin: centre, rim
  const SH = [PX + 17, 179];                             // your shoulder
  const POSE = [                                         // elbow, hand, ball: at rest / ready / letting go
    [[PX + 26, 195], [PX + 30, 207], [PX + 33, 203]],
    [[PX + 31, 187], [PX + 35, 167], [PX + 36, 160.5]],
    [[PX + 34, 168], [PX + 45, 156], [PX + 46, 149.5]]
  ];
  const REL = [PX + 46, 149.5];                          // where the ball leaves your hand
  const IN = [BX, BT - 2], C_IN = [215, 100];            // a throw that goes in
  const RIM = [BX - 24, BT - 6], C_MISS = [205, 100];    // a throw that clips the rim...
  const BOUNCE = [[300, 152], [280, 208.5]];             // ...and drops to the floor
  const TALLY = [1, 1, 0, 1, 1, 0, 1, 0, 1, 0];          // your last ten throws: 6 in, 4 out
  const OLD = [[302, 208.5], [376, 208.5]];                // earlier misses, still on the floor
  const NX = 18, NY = 26, NW = 116, NH = 58;             // the notebook
  const REC = 60;                                        // your record, in %
  const cl = v => Math.max(0, Math.min(1, v));
  const f2 = v => +v.toFixed(2), f3 = v => +v.toFixed(3);
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const bez = (a, c, b, t) => { const u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; };
  const ang = v => Math.PI * (1 - v / 100);
  const pt = (cx, v, r) => [f2(cx + r * Math.cos(ang(v))), f2(GY - r * Math.sin(ang(v)))];
  const arc = (cx, a, b) => {
    if (b - a < .5) return "";
    const [x0, y0] = pt(cx, a, GR), [x1, y1] = pt(cx, b, GR);
    return `M${x0} ${y0} A${GR} ${GR} 0 0 1 ${x1} ${y1}`;
  };
  const est = (s, px) => Math.round(s.length * px + 22);
  const BALL = `<circle r="6"/><path d="M-5 1.2 L-2 -1.4 L.6 1.6 L3.6 -1.2 L5.2 .6 M-2 -1.4 L-1.2 -4.8 M.6 1.6 L-.4 4.9"/>`;
  const flyIn = p => p <= 1 ? bez(REL, C_IN, IN, p) : [IN[0], IN[1] + (p - 1) * 60];
  const flyMiss = p => p <= 1 ? bez(REL, C_MISS, RIM, p) : bez(RIM, BOUNCE[0], BOUNCE[1], Math.min(1, p - 1));

  // a dial: grey track, value arc, needle, readout and a label under it
  const ticks = cx => [0, 25, 50, 75, 100].map(v => {
    const [x0, y0] = pt(cx, v, GR - 9), [x1, y1] = pt(cx, v, GR - 14);
    return `<line class="fc-tk" x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}"/>`;
  }).join("");
  // your thoughts, above your head
  const bubble = (i, s) => {
    const w = est(s, 6.5);
    return `<g class="fc-bub" data-k="bb${i}"><circle cx="${PX + 6}" cy="133.5" r="1.8"/><circle cx="${PX + 10}" cy="127" r="2.6"/>` +
      `<rect x="18" y="96" width="${w}" height="26" rx="13"/><text x="${18 + w / 2}" y="113">${s}</text></g>`;
  };
  // a label with a tail on its bottom edge: base centred at tx, tip at (px, py)
  const tag = (key, cx, cy, s, tx, px, py) => {
    const w = est(s, 6.2), h = 18, r = 9, x0 = cx - w / 2, y0 = cy - h / 2, b = y0 + h, T = Math.max(x0 + r + 5, Math.min(x0 + w - r - 5, tx));
    const d = `M${x0 + r} ${y0} H${x0 + w - r} A${r} ${r} 0 0 1 ${x0 + w - r} ${b} H${T + 5} L${px} ${py} L${T - 5} ${b} H${x0 + r} A${r} ${r} 0 0 1 ${x0 + r} ${y0} Z`;
    return `<g class="fc-tag" data-k="${key}"><path d="${d}"/><text x="${cx}" y="${cy + 3.8}">${s}</text></g>`;
  };
  const TRAIL = Array.from({ length: 13 }, (_, j) => .08 + j * .07);   // dots along a throw that goes in
  const pill = (key, s) => {
    const w = est(s, 7);
    return `<g class="fc-pill" data-k="${key}"><rect x="${200 - w / 2}" y="229" width="${w}" height="25" rx="12.5"/><text x="200" y="245.8">${s}</text></g>`;
  };

  window.BiasAnim.SCENES[KEY] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
      ${P} .fc-floor{stroke:var(--rule);stroke-width:1.6;stroke-linecap:round}
      ${P} .fc-body{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round;stroke-linecap:round}
      ${P} .fc-eye{fill:var(--ink)}
      ${P} .fc-mouth{fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linecap:round}
      ${P} .fc-arm{fill:none;stroke:var(--ink);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fc-ball circle{fill:var(--surface);stroke:var(--ink);stroke-width:1.8}
      ${P} .fc-ball path{fill:none;stroke:var(--muted);stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fc-bin path{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .fc-bin .rim{stroke:var(--ink);stroke-width:2.6;stroke-linecap:round}
      ${P} .fc-bin .sl{stroke:var(--faint);stroke-width:1.4;stroke-linecap:round}
      ${P} .fc-trk{fill:none;stroke:var(--rule);stroke-width:7;stroke-linecap:round}
      ${P} .fc-val{fill:none;stroke:var(--q);stroke-width:7;stroke-linecap:round}
      ${P} .fc-val.ok{stroke:var(--good)}
      ${P} .fc-val.rec{stroke:var(--ink)}
      ${P} .fc-exc{fill:none;stroke:var(--bad);stroke-width:7;stroke-linecap:round}
      ${P} .fc-tk{stroke:var(--faint);stroke-width:1.4;stroke-linecap:round}
      ${P} .fc-ndl{stroke:var(--ink);stroke-width:2.4;stroke-linecap:round}
      ${P} .fc-piv{fill:var(--ink)}
      ${P} .fc-num{font:600 16px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .fc-num.rec{fill:var(--ink)}
      ${P} .fc-lab{font:500 10px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .fc-exl{font:500 10px var(--mono);fill:var(--bad);text-anchor:middle}
      ${P} .fc-in{fill:var(--ink)}
      ${P} .fc-x{stroke:var(--bad);stroke-width:1.7;stroke-linecap:round}
      ${P} .fc-eq{stroke:var(--good);stroke-width:2.4;stroke-linecap:round}
      ${P} .fc-bub rect,${P} .fc-bub circle{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .fc-bub text{font:600 11.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .fc-tag path{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fc-trail{fill:var(--muted)}
      ${P} .fc-tag text{font:600 10.5px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .fc-pill rect{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .fc-pill text{font:600 12px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .fc-note rect{fill:var(--surface);stroke:var(--ink);stroke-width:1.8}
      ${P} .fc-note .ring{fill:var(--ground);stroke:var(--ink);stroke-width:1.6}
      ${P} .fc-note .rg{stroke:var(--rule);stroke-width:1.2}
      ${P} .fc-note .k{font:500 10px var(--mono);fill:var(--muted)}
      ${P} .fc-note .v{font:600 13px var(--display);fill:var(--q);text-anchor:end}
      ${P} .fc-note .v.i{fill:var(--ink)}
      ${P} .fc-note .v.ok{fill:var(--good)}
    `,
    text: {
      hu: {
        name: "Magabiztosság a cselekvéshez", shareTitle: "Miért érezzük magunkat biztosabbnak, mint kellene, 30 másodpercben",
        ecline: "Hagyd, hogy a magabiztosság mozgásba hozzon, de a múltbeli eredményeidhez igazítsd.",
        conf: "a magabiztosságod", rec: "eddigi eredmények", tooSure: "túl magabiztos",
        bub: ["Megy?", "Meg tudom csinálni.", "Könnyű!", "Gyerünk… gyerünk…", "Megéri megpróbálni."],
        skill: "ügyesség", luck: "rossz szerencse", note: ["Biztos", "Bement"],
        names: ["Túlzott magabiztosság-hatás", "A kontroll illúziója", "Önkiszolgáló torzítás"],
        caps: [
          "Mielőtt bármibe belevágsz, érezned kell, hogy <b>menni fog</b>.",
          "Ezért az agyad <b>feljebb</b> tekeri a magabiztosságodat. Ez mozgásba hoz.",
          "De gyakran <b>túl messzire</b> megy: 95%-ig biztos, hogy bemegy.",
          "Pedig csak <b>10-ből 6</b> dobásod megy be.",
          "A labda már elhagyta a kezed, mégis <b>kormányozni</b> próbálod.",
          "Bement? Az a <b>tehetség</b>. Nem ment be? <b>Rossz szerencse</b>. A magabiztosságod magas marad.",
          "<b>A megoldás:</b> jegyezd fel, mennyire vagy biztos, aztán nézd meg, <b>mi történt</b>.",
          "Az eddigi <b>eredményeidhez</b> igazítsd a magabiztosságodat. Ez még elég a cselekvéshez."
        ],
        say: [
          "Mielőtt bármibe belevágsz, érezned kell, hogy meg tudod csinálni.",
          "Ezért az agyad feljebb tekeri a magabiztosságodat. Egy kis többlet mozgásba hoz, és egy-egy hiba után is továbbvisz.",
          "De gyakran túl messzire megy. Kilencvenöt százalékig biztos, hogy bemegy.",
          "Pedig csak tízből hat dobásod megy be. Ez a túlzott magabiztosság-hatás.",
          "A labda már elhagyta a kezed, mégis kormányozni próbálod. Ez a kontroll illúziója.",
          "Bement? Az a tehetség. Nem ment be? Rossz szerencse. A magabiztosságod magas marad. Ez az önkiszolgáló torzítás.",
          "A megoldás: jegyezd fel, mennyire vagy biztos, aztán nézd meg, mi történt valójában.",
          "Az eddigi eredményeidhez igazítsd a magabiztosságodat. Ez még elég a cselekvéshez.",
          "Magabiztosság a cselekvéshez. Hagyd, hogy a magabiztosság mozgásba hozzon, de a múltbeli eredményeidhez igazítsd."
        ]
      },
      en: {
        name: "Confidence to act", shareTitle: "Why we feel surer than we should, in 30 seconds",
        ecline: "Let confidence get you moving, but set it by your track record.",
        conf: "your confidence", rec: "track record", tooSure: "too sure",
        bub: ["Can I?", "I can do it.", "Easy!", "Go in… go in…", "Worth a shot."],
        skill: "skill", luck: "bad luck", note: ["Sure", "Went in"],
        names: ["Overconfidence effect", "Illusion of control", "Self-serving bias"],
        caps: [
          "Before you try anything, you need to feel <b>you can do it</b>.",
          "So your brain turns your confidence <b>up</b>. That gets you moving.",
          "But it often goes <b>too far</b>: 95% sure it goes in.",
          "Yet only <b>6 in 10</b> of your throws go in.",
          "The ball has left your hand, yet you lean to <b>steer</b> it.",
          "Went in? <b>Skill</b>. Missed? <b>Bad\u00a0luck</b>. Confidence stays high.",
          "<b>The fix:</b> note how sure you are, then check <b>what happened</b>.",
          "Set your confidence by your <b>track record</b>. It's still enough to act."
        ],
        say: [
          "Before you try anything, you need to feel you can do it.",
          "So your brain turns your confidence up. A little extra gets you moving, and keeps you going after a miss.",
          "But it often goes too far. Ninety-five percent sure it goes in.",
          "Yet only six in ten of your throws go in. That's the overconfidence effect.",
          "The ball has left your hand, yet you lean to steer it. That's the illusion of control.",
          "Went in? That's skill. Missed? Bad luck. Your confidence stays high. That's the self-serving bias.",
          "The fix: note how sure you are, then check what actually happened.",
          "Set your confidence by your track record. It's still enough to act.",
          "Confidence to act. Let confidence get you moving, but set it by your track record."
        ]
      },
      el: {
        name: "Σιγουριά για να δράσουμε", shareTitle: "Γιατί νιώθουμε περισσότερη σιγουριά απ’ όση θα έπρεπε, σε 30 δευτερόλεπτα",
        ecline: "Άφησε τη σιγουριά να σε βάζει σε κίνηση, αλλά ρύθμιζέ τη με βάση τις επιδόσεις σου.",
        conf: "η σιγουριά σου", rec: "επιδόσεις ως τώρα", tooSure: "πολύ ψηλά",
        bub: ["Μπορώ;", "Θα τα καταφέρω.", "Παιχνιδάκι!", "Μπες… μπες…", "Ας το δοκιμάσω."],
        skill: "ικανότητα", luck: "ατυχία", note: ["Σιγουριά", "Μπήκαν"],
        names: ["Υπερβολική αυτοπεποίθηση", "Ψευδαίσθηση ελέγχου", "Αυτοεξυπηρετική μεροληψία"],
        caps: [
          "Για να δοκιμάσεις οτιδήποτε, πρέπει πρώτα να νιώσεις ότι <b>μπορείς</b>.",
          "Γι’\u00a0αυτό το μυαλό σου <b>ανεβάζει</b> τη σιγουριά, κι έτσι ξεκινάς.",
          "Συχνά όμως <b>το παρακάνει</b>: 95% σιγουριά ότι θα μπει.",
          "Κι όμως, μόνο <b>6 στις 10</b> ρίψεις σου μπαίνουν.",
          "Η μπάλα έφυγε απ’\u00a0το χέρι σου, κι\u00a0όμως γέρνεις για να την <b>κατευθύνεις</b>.",
          "Μπήκε; <b>Ικανότητα</b>. Δεν μπήκε; <b>Ατυχία</b>. Η σιγουριά μένει ψηλά.",
          "<b>Η λύση:</b> γράψε πόσο το πιστεύεις και μετά έλεγξε <b>τι έγινε</b>.",
          "Ρύθμισε τη σιγουριά με βάση <b>τις επιδόσεις\u00a0σου</b>. Και πάλι φτάνει για να δράσεις."
        ],
        say: [
          "Για να δοκιμάσεις οτιδήποτε, πρέπει πρώτα να νιώσεις ότι μπορείς.",
          "Γι’ αυτό το μυαλό σου ανεβάζει τη σιγουριά. Λίγη παραπάνω σε βάζει σε κίνηση και σε βοηθά να συνεχίσεις μετά από μια αστοχία.",
          "Συχνά όμως το παρακάνει. Ενενήντα πέντε τοις εκατό σιγουριά ότι θα μπει.",
          "Κι όμως, μόνο έξι στις δέκα ρίψεις σου μπαίνουν. Λέγεται υπερβολική αυτοπεποίθηση.",
          "Η μπάλα έφυγε απ’ το χέρι σου, κι όμως γέρνεις για να την κατευθύνεις. Αυτή είναι η ψευδαίσθηση ελέγχου.",
          "Μπήκε; Ικανότητα. Δεν μπήκε; Ατυχία. Η σιγουριά μένει ψηλά. Εδώ φταίει η αυτοεξυπηρετική μεροληψία.",
          "Η λύση: γράψε πόσο το πιστεύεις, και μετά έλεγξε τι έγινε στην πράξη.",
          "Ρύθμισε τη σιγουριά με βάση τις επιδόσεις σου. Και πάλι φτάνει για να δράσεις.",
          "Σιγουριά για να δράσουμε. Άφησε τη σιγουριά να σε βάζει σε κίνηση, αλλά ρύθμιζέ τη με βάση τις επιδόσεις σου."
        ]
      },
      es: {
        name: "Confianza para actuar", shareTitle: "Por qué nos sentimos más seguros de lo que deberíamos, en 30 segundos",
        ecline: "Deja que la confianza te ponga en marcha, pero ajústala a tu historial.",
        conf: "tu confianza", rec: "tu historial", tooSure: "demasiado alta",
        bub: ["¿Puedo?", "Puedo hacerlo.", "¡Fácil!", "Entra… entra…", "Vale la pena."],
        skill: "habilidad", luck: "mala suerte", note: ["Certeza", "Entraron"],
        names: ["Efecto de exceso de confianza", "Ilusión de control", "Sesgo de autoservicio"],
        caps: [
          "Antes de intentar algo, necesitas sentir que <b>puedes hacerlo</b>.",
          "Así que tu cerebro <b>sube</b> tu confianza. Eso te pone en marcha.",
          "Pero a menudo <b>se pasa</b>: un 95% de certeza de que entra.",
          "Sin embargo, solo entran <b>6 de cada 10</b> lanzamientos.",
          "La pelota ya salió de tu mano, pero te inclinas para <b>guiarla</b>.",
          "¿Entró? <b>Habilidad</b>. ¿Falló? <b>Mala suerte</b>. La confianza sigue alta.",
          "<b>La solución:</b> anota tu nivel de certeza y luego comprueba <b>qué pasó</b>.",
          "Ajusta tu confianza a tu <b>historial</b>. Sigue bastando para actuar."
        ],
        say: [
          "Antes de intentar algo, necesitas sentir que puedes hacerlo.",
          "Así que tu cerebro sube tu confianza. Un poco de más te pone en marcha, y te ayuda a seguir tras un fallo.",
          "Pero a menudo se pasa. Un noventa y cinco por ciento de certeza de que entra.",
          "Sin embargo, solo entran seis de cada diez lanzamientos. Es el efecto de exceso de confianza.",
          "La pelota ya salió de tu mano, pero te inclinas para guiarla. Es la ilusión de control.",
          "¿Entró? Es habilidad. ¿Falló? Mala suerte. Tu confianza sigue alta. Es el sesgo de autoservicio.",
          "La solución: anota tu nivel de certeza, y luego comprueba qué pasó de verdad.",
          "Ajusta tu confianza a tu historial. Sigue bastando para actuar.",
          "Confianza para actuar. Deja que la confianza te ponga en marcha, pero ajústala a tu historial."
        ]
      },
      fr: {
        name: "Confiance pour agir", shareTitle: "Pourquoi on se sent plus sûr qu’on ne devrait, en 30 secondes",
        ecline: "Laissez la confiance vous mettre en mouvement, mais réglez-la sur vos résultats.",
        conf: "votre confiance", rec: "vos résultats", tooSure: "trop sûr",
        bub: ["Je peux ?", "Je peux le faire.", "Facile !", "Rentre… rentre…", "Ça vaut le coup."],
        skill: "adresse", luck: "malchance", note: ["Certitude", "Rentrés"],
        names: ["Effet de surconfiance", "Illusion de contrôle", "Biais d’autocomplaisance"],
        caps: [
          "Avant de tenter quoi que ce soit, il faut sentir que <b>vous en êtes capable</b>.",
          "Alors votre cerveau <b>monte</b> votre confiance. Ça vous met en mouvement.",
          "Mais souvent, il <b>va trop loin</b> : sûr à 95 % que ça rentre.",
          "Pourtant, seuls <b>6 lancers sur 10</b> rentrent.",
          "La boulette a quitté votre main, mais vous vous penchez pour la <b>guider</b>.",
          "Dedans ? <b>Adresse</b>. Raté ? <b>Malchance</b>. La confiance reste haute.",
          "<b>La solution :</b> notez votre degré de certitude, puis vérifiez <b>ce qui s’est passé</b>.",
          "Réglez votre confiance sur <b>vos résultats</b>. Ça suffit encore pour agir."
        ],
        say: [
          "Avant de tenter quoi que ce soit, il faut sentir que vous en êtes capable.",
          "Alors votre cerveau monte votre confiance. Un petit surplus vous met en mouvement, et vous fait continuer après un échec.",
          "Mais souvent, il va trop loin. Sûr à quatre-vingt-quinze pour cent que ça rentre.",
          "Pourtant, seuls six lancers sur dix rentrent. C’est l’effet de surconfiance.",
          "La boulette a quitté votre main, mais vous vous penchez pour la guider. C’est l’illusion de contrôle.",
          "Dedans ? C’est de l’adresse. Raté ? C’est la malchance. Votre confiance reste haute. C’est le biais d’autocomplaisance.",
          "La solution : notez votre degré de certitude, puis vérifiez ce qui s’est vraiment passé.",
          "Réglez votre confiance sur vos résultats. Ça suffit encore pour agir.",
          "Confiance pour agir. Laissez la confiance vous mettre en mouvement, mais réglez-la sur vos résultats."
        ]
      },
      de: {
        name: "Mut zum Handeln", shareTitle: "Warum wir uns sicherer fühlen, als wir sollten, in 30 Sekunden",
        ecline: "Lass dich von Zuversicht antreiben, aber richte sie nach deiner Bilanz.",
        conf: "deine Zuversicht", rec: "Trefferquote", tooSure: "zu sicher",
        bub: ["Kann ich das?", "Ich schaff das.", "Leicht!", "Rein… rein…", "Ich versuch’s."],
        skill: "Können", luck: "Pech", note: ["Sicher", "Getroffen"],
        names: ["Selbstüberschätzung", "Kontrollillusion", "Selbstwertdienliche Verzerrung"],
        caps: [
          "Bevor du etwas versuchst, musst du glauben, <b>dass du es kannst</b>.",
          "Also dreht dein Gehirn deine Zuversicht <b>hoch</b>. Das bringt dich in Bewegung.",
          "Aber oft <b>übertreibt</b> es: 95 % sicher, dass er reingeht.",
          "Dabei gehen nur <b>6 von 10</b> deiner Würfe rein.",
          "Der Ball hat deine Hand verlassen, doch du lehnst dich, um ihn zu <b>lenken</b>.",
          "Drin? <b>Können</b>. Daneben? <b>Pech</b>. Die Zuversicht bleibt hoch.",
          "<b>Die Lösung:</b> Notier, wie sicher du bist, und prüf dann, <b>was passiert ist</b>.",
          "Richte deine Zuversicht nach deiner <b>Trefferquote</b>. Sie reicht immer noch zum Handeln."
        ],
        say: [
          "Bevor du irgendetwas versuchst, musst du glauben, dass du es kannst.",
          "Also dreht dein Gehirn deine Zuversicht hoch. Ein bisschen mehr bringt dich in Bewegung, und lässt dich nach einem Fehlwurf weitermachen.",
          "Aber oft übertreibt es. Fünfundneunzig Prozent sicher, dass er reingeht.",
          "Dabei gehen nur sechs von zehn deiner Würfe rein. Das ist die Selbstüberschätzung.",
          "Der Ball hat deine Hand verlassen, doch du lehnst dich, um ihn zu lenken. Das ist die Kontrollillusion.",
          "Drin? Das ist Können. Daneben? Pech. Deine Zuversicht bleibt hoch. Das ist die selbstwertdienliche Verzerrung.",
          "Die Lösung: Notier, wie sicher du bist, und prüf dann, was wirklich passiert ist.",
          "Richte deine Zuversicht nach deiner Trefferquote. Sie reicht immer noch zum Handeln.",
          "Mut zum Handeln. Lass dich von Zuversicht antreiben, aber richte sie nach deiner Bilanz."
        ]
      },
      it: {
        name: "Fiducia per agire", shareTitle: "Perché ci sentiamo più sicuri del dovuto, in 30 secondi",
        ecline: "Lascia che la fiducia ti metta in moto, ma regolala sui tuoi risultati.",
        conf: "la tua fiducia", rec: "i tuoi risultati", tooSure: "troppo alta",
        bub: ["Ci riesco?", "Ce la faccio.", "Facile!", "Entra… entra…", "Vale la pena."],
        skill: "abilità", luck: "sfortuna", note: ["Certezza", "Canestri"],
        names: ["Eccesso di fiducia", "Illusione di controllo", "Bias di autoindulgenza"],
        caps: [
          "Prima di provare qualcosa, devi sentire <b>che ce la puoi fare</b>.",
          "Così il cervello <b>alza</b> la tua fiducia. Questo ti mette in moto.",
          "Ma spesso <b>esagera</b>: 95% di certezza che entri.",
          "Eppure entrano solo <b>6 tiri su 10</b>.",
          "La pallina ha lasciato la mano, eppure ti sporgi per <b>guidarla</b>.",
          "Dentro? <b>Abilità</b>. Fuori? <b>Sfortuna</b>. La fiducia resta alta.",
          "<b>La soluzione:</b> annota la tua certezza, poi verifica <b>com’è andata</b>.",
          "Regola la fiducia sui tuoi <b>risultati</b>. Basta comunque per agire."
        ],
        say: [
          "Prima di provare qualcosa, devi sentire che ce la puoi fare.",
          "Così il cervello alza la tua fiducia. Un po’ in più ti mette in moto, e ti fa andare avanti dopo un errore.",
          "Ma spesso esagera. Novantacinque per cento di certezza che entri.",
          "Eppure entrano solo sei tiri su dieci. È l’eccesso di fiducia.",
          "La pallina ha lasciato la mano, eppure ti sporgi per guidarla. È l’illusione di controllo.",
          "Dentro? Abilità. Fuori? Sfortuna. La tua fiducia resta alta. È il bias di autoindulgenza.",
          "La soluzione: annota la tua certezza, poi verifica com’è andata davvero.",
          "Regola la fiducia sui tuoi risultati. Basta comunque per agire.",
          "Fiducia per agire. Lascia che la fiducia ti metta in moto, ma regolala sui tuoi risultati."
        ]
      }
    },
    svg(T) {
      // the room: floor, a bin, a few old misses
      const bin = `<g class="fc-bin"><path d="M${BX - 20} ${BT} L${BX - 15} ${FL} H${BX + 15} L${BX + 20} ${BT} Z"/>` +
        `<line class="sl" x1="${BX - 8}" y1="${BT + 7}" x2="${BX - 6}" y2="${FL - 6}"/><line class="sl" x1="${BX}" y1="${BT + 7}" x2="${BX}" y2="${FL - 6}"/>` +
        `<line class="sl" x1="${BX + 8}" y1="${BT + 7}" x2="${BX + 6}" y2="${FL - 6}"/><line class="rim" x1="${BX - 22}" y1="${BT}" x2="${BX + 22}" y2="${BT}"/></g>`;
      const old = OLD.map(([x, y], i) => `<g class="fc-ball" transform="translate(${x} ${y}) rotate(${i * 70})">${BALL}</g>`).join("");
      // dial 1: your confidence
      const d1 = `<g data-k="g1"><path class="fc-trk" d="${arc(G1, 0, 100)}"/>${ticks(G1)}
          <path class="fc-val" data-k="v1q"/><path class="fc-val ok" data-k="v1g"/><path class="fc-exc" data-k="exc"/>
          <line class="fc-ndl" data-k="n1" x1="${G1}" y1="${GY}"/><circle class="fc-piv" cx="${G1}" cy="${GY}" r="4"/>
          <text class="fc-num" data-k="r1" x="${G1}" y="${GY + 22}"></text><text class="fc-lab" x="${G1}" y="${GY + 36}">${T.conf}</text>
          <text class="fc-exl" data-k="exl" x="${G1}" y="${GY + 50}">${T.tooSure}</text></g>`;
      // dial 2: your track record, with the last ten throws under it
      let tally = "";
      TALLY.forEach((hit, i) => {
        const x = G2 - 40.5 + 9 * i, y = GY + 49;
        tally += hit ? `<circle class="fc-in" data-k="t${i}" cx="${x}" cy="${y}" r="2.8"/>`
          : `<path class="fc-x" data-k="t${i}" d="M${x - 2.6} ${y - 2.6} L${x + 2.6} ${y + 2.6} M${x + 2.6} ${y - 2.6} L${x - 2.6} ${y + 2.6}"/>`;
      });
      const d2 = `<g data-k="g2"><path class="fc-trk" d="${arc(G2, 0, 100)}"/>${ticks(G2)}
          <path class="fc-val rec" data-k="v2"/>
          <line class="fc-ndl" data-k="n2" x1="${G2}" y1="${GY}"/><circle class="fc-piv" cx="${G2}" cy="${GY}" r="4"/>
          <text class="fc-num rec" data-k="r2" x="${G2}" y="${GY + 22}"></text><text class="fc-lab" x="${G2}" y="${GY + 36}">${T.rec}</text>${tally}</g>`;
      const eqX = (G1 + G2) / 2;
      const eq = `<g data-k="eq"><line class="fc-eq" x1="${eqX - 7}" y1="${GY + 13}" x2="${eqX + 7}" y2="${GY + 13}"/><line class="fc-eq" x1="${eqX - 7}" y1="${GY + 19}" x2="${eqX + 7}" y2="${GY + 19}"/></g>`;
      // you
      const me = `<g data-k="me">
          <path class="fc-body" d="M${PX - 24} ${FL} V${FL - 20} a24 22 0 0 1 48 0 V${FL}"/>
          <path class="fc-arm" data-k="arm"/>
          <g class="fc-ball" data-k="held">${BALL}</g>
          <circle class="fc-body" cx="${PX}" cy="${HY}" r="12"/>
          <circle class="fc-eye" cx="${PX - 1}" cy="${HY - 1.5}" r="1.5"/><circle class="fc-eye" cx="${PX + 6.5}" cy="${HY - 1.5}" r="1.5"/>
          <path class="fc-mouth" data-k="mouth"/></g>`;
      // the fix: a notebook
      const rings = [0, 1, 2, 3].map(i => `<circle class="ring" cx="${NX + 22 + i * 24}" cy="${NY}" r="2.6"/>`).join("");
      const note = `<g class="fc-note" data-k="note"><rect x="${NX}" y="${NY}" width="${NW}" height="${NH}" rx="6"/>${rings}
          <line class="rg" x1="${NX + 8}" y1="${NY + 31}" x2="${NX + NW - 8}" y2="${NY + 31}"/>
          <g data-k="nr1"><text class="k" x="${NX + 10}" y="${NY + 22}">${T.note[0]}</text><text class="v" data-k="nv0" x="${NX + NW - 10}" y="${NY + 22.5}">95%</text><text class="v ok" data-k="nv1" x="${NX + NW - 10}" y="${NY + 22.5}">${REC}%</text></g>
          <g data-k="nr2"><text class="k" x="${NX + 10}" y="${NY + 48}">${T.note[1]}</text><text class="v i" x="${NX + NW - 10}" y="${NY + 48.5}">6/10</text></g></g>`;
      return `
        <g data-k="room"><line class="fc-floor" x1="14" y1="${FL}" x2="390" y2="${FL}"/></g>
        ${TRAIL.map((t, j) => { const [x, y] = flyIn(t); return `<circle class="fc-trail" data-k="d${j}" cx="${f2(x)}" cy="${f2(y)}" r="1.3"/>`; }).join("")}
        <g class="fc-ball" data-k="b1">${BALL}</g><g class="fc-ball" data-k="b3">${BALL}</g>
        <g data-k="room2">${bin}${old}</g>
        <g class="fc-ball" data-k="b2">${BALL}</g>
        ${d1}${d2}${eq}${me}
        ${T.bub.map((s, i) => bubble(i, s)).join("")}
        ${tag("tagS", BX + 6, 148, T.skill, BX, BX, 171)}${tag("tagL", 236, 186, T.luck, 262, 272, 203)}
        ${note}
        ${T.names.map((s, i) => pill("pl" + i, s)).join("")}`;
    },
    S0: { room: 0, me: 0, mood: -.5, arm: 0, held: 1, lean: 0, g1: 0, v1: 0, exc: 0, exl: 0, cal: 0,
      g2: 0, tally: 0, eq: 0, bb0: 0, bb1: 0, bb2: 0, bb3: 0, bb4: 0,
      b1: 0, b1on: 0, b2: 0, b2on: 0, b3: 0, b3on: 0, tr1: 0, tr3: 0, tagS: 0, tagL: 0,
      pl0: 0, pl1: 0, pl2: 0, note: 0, nr1: 0, nr2: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = f3(cl(v)); };
      const tr = (key, x, y, extra) => k(key).setAttribute("transform", `translate(${f2(x)} ${f2(y)})${extra || ""}`);
      const pop = (key, v, cx, cy) => {   // fade in with a small grow from (cx, cy)
        const s = .85 + .15 * cl(v);
        k(key).setAttribute("transform", `translate(${cx} ${cy}) scale(${f3(s)}) translate(${-cx} ${-cy})`);
        op(key, v);
      };
      op("room", S.room); op("room2", S.room);
      // you: lean, face, arm and the ball in your hand
      op("me", S.me);
      const sk = -12 * S.lean;                              // lean: feet stay on the floor, head and arm tip over
      k("me").setAttribute("transform", `translate(${f2(-FL * Math.tan(sk * Math.PI / 180))} 0) skewX(${f2(sk)})`);
      k("mouth").setAttribute("d", `M${PX - 1} ${HY + 5.5} Q${PX + 3} ${f2(HY + 5.5 + 3.6 * S.mood)} ${PX + 7} ${HY + 5.5}`);
      const a = Math.max(0, Math.min(2, S.arm)), i0 = a < 1 ? 0 : 1, t = a - i0;
      const A = POSE[i0], B = POSE[Math.min(2, i0 + 1)];
      const el = lerp(A[0], B[0], t), hd = lerp(A[1], B[1], t), bl = lerp(A[2], B[2], t);
      k("arm").setAttribute("d", `M${SH[0]} ${SH[1]} L${f2(el[0])} ${f2(el[1])} L${f2(hd[0])} ${f2(hd[1])}`);
      tr("held", bl[0], bl[1]); op("held", S.held);
      // your thoughts
      for (let i = 0; i < 5; i++) pop("bb" + i, S["bb" + i], PX + 10, 127);
      // dial 1: your confidence
      op("g1", S.g1);
      const v1 = S.v1;
      k("v1q").setAttribute("d", arc(G1, 0, v1)); op("v1q", 1 - S.cal);
      k("v1g").setAttribute("d", arc(G1, 0, v1)); op("v1g", S.cal);
      k("exc").setAttribute("d", v1 > REC ? arc(G1, REC, v1) : ""); op("exc", S.exc);
      const [x1, y1] = pt(G1, v1, GR - 6);
      k("n1").setAttribute("x2", x1); k("n1").setAttribute("y2", y1);
      const r1 = k("r1");
      r1.textContent = Math.round(v1) + "%";
      r1.style.fill = S.cal > .5 ? "var(--good)" : "var(--q)";
      op("exl", S.exl);
      // dial 2: your track record climbs as the last ten throws are counted
      op("g2", S.g2);
      let v2 = 0;
      TALLY.forEach((hit, i) => { const p = cl(S.tally - i); op("t" + i, p); v2 += hit * p * 10; });
      k("v2").setAttribute("d", arc(G2, 0, v2));
      const [x2, y2] = pt(G2, v2, GR - 6);
      k("n2").setAttribute("x2", x2); k("n2").setAttribute("y2", y2);
      k("r2").textContent = Math.round(v2) + "%";
      op("eq", S.eq);
      // throws
      const spin = p => ` rotate(${f2(p * 540)})`;
      const p1 = flyIn(S.b1), p3 = flyIn(S.b3), p2 = flyMiss(S.b2);
      tr("b1", p1[0], p1[1], spin(S.b1)); op("b1", S.b1on);
      tr("b3", p3[0], p3[1], spin(S.b3)); op("b3", S.b3on);
      tr("b2", p2[0], p2[1], spin(Math.min(S.b2, 1.6))); op("b2", S.b2on);
      TRAIL.forEach((tj, j) => op("d" + j, cl((S.b1 - tj) * 12) * S.tr1 + cl((S.b3 - tj) * 12) * S.tr3));
      // labels
      pop("tagS", S.tagS, BX, 165); pop("tagL", S.tagL, 268, 200);
      for (let i = 0; i < 3; i++) pop("pl" + i, S["pl" + i], 200, 241);
      // the notebook
      op("note", S.note);
      tr("nr1", -6 * (1 - cl(S.nr1)), 0); op("nr1", S.nr1);
      op("nv0", 1 - S.cal); op("nv1", S.cal);
      tr("nr2", -6 * (1 - cl(S.nr2)), 0); op("nr2", S.nr2);
    },
    beats: [
      // 1. you, a paper ball, a bin across the room, and a low dial
      { steps: [{ to: { room: 1, me: 1 }, ms: 600, sfx: "pluck" }, { to: { g1: 1 }, ms: 400 }, { to: { v1: 25 }, ms: 700, ease: "inOut" },
        { to: { bb0: 1 }, ms: 350, ease: "back" }] },
      // 2. the brain turns it up: you get ready to throw
      { steps: [{ to: { bb0: 0 }, ms: 250 }, { to: { v1: 70, mood: 1 }, ms: 900, ease: "back", sfx: "spring" }, { to: { arm: 1 }, ms: 450, ease: "inOut" },
        { to: { bb1: 1 }, ms: 350, ease: "back" }] },
      // 3. ...and further than it should
      { steps: [{ to: { bb1: 0 }, ms: 250 }, { to: { v1: 95 }, ms: 1000, ease: "back", sfx: "tick" }, { to: { bb2: 1 }, ms: 350, ease: "back" }] },
      // 4. your track record: 6 in 10
      { steps: [{ to: { bb2: 0 }, ms: 250 }, { to: { g2: 1 }, ms: 450, sfx: "pop" }, { to: { tally: 10 }, ms: 1400, ease: "lin" },
        { to: { exc: 1, exl: 1 }, ms: 450 }, { to: { pl0: 1 }, ms: 400, ease: "back" }], hold: 2800 },
      // 5. illusion of control: leaning to steer a ball that has already left your hand
      { steps: [{ to: { exl: 0, pl0: 0 }, ms: 300 }, { to: { arm: 2 }, ms: 180, ease: "inOut" }, { to: { held: 0, b1on: 1, tr1: 1 } },
        { to: { b1: 1, lean: 1, bb3: 1 }, ms: 1300, ease: "inOut", sfx: "whoosh" }, { to: { b1: 1.4 }, ms: 220, ease: "lin" },
        { to: { pl1: 1 }, ms: 400, ease: "back" }] },
      // 6. self-serving bias: a hit is skill, a miss is bad luck, and the dial springs back
      { steps: [{ to: { bb3: 0, lean: 0, pl1: 0, tr1: 0 }, ms: 400 }, { to: { arm: 1, held: 1 }, ms: 350 }, { to: { tagS: 1, v1: 98 }, ms: 450, ease: "back" },
        { wait: 300 }, { to: { arm: 2 }, ms: 180, ease: "inOut" }, { to: { held: 0, b2on: 1 } }, { to: { b2: 1 }, ms: 900, ease: "inOut" },
        { to: { b2: 2, v1: 72 }, ms: 450, ease: "lin", sfx: "thud", sfxAt: 420 }, { to: { tagL: 1, v1: 95 }, ms: 800, ease: "back", sfx: "spring" },
        { to: { pl2: 1 }, ms: 400, ease: "back" }], hold: 3000 },
      // 7. the fix: write down how sure you are, then check what happened
      { steps: [{ to: { tagS: 0, tagL: 0, pl2: 0 }, ms: 400 }, { to: { arm: 1, held: 1 }, ms: 300 }, { to: { note: 1 }, ms: 400 },
        { to: { nr1: 1 }, ms: 500, sfx: "scribble" }, { wait: 600 }, { to: { nr2: 1 }, ms: 500 }], hold: 2800 },
      // 8. set the dial by the record: still enough to take the shot
      { steps: [{ to: { v1: REC, cal: 1 }, ms: 1300, ease: "inOut" }, { to: { eq: 1 }, ms: 350 }, { to: { bb4: 1 }, ms: 350, ease: "back" },
        { wait: 250 }, { to: { arm: 2 }, ms: 180, ease: "inOut" }, { to: { held: 0, b3on: 1, tr3: 1 } }, { to: { b3: 1 }, ms: 1100, ease: "inOut" },
        { to: { b3: 1.4 }, ms: 220, ease: "lin", sfx: "chime" }], hold: 4200 }
    ]
  };
})();
