/* Hyperbolic discounting: €100 today or €110 in a week, the same choice a year out, and a timeline
   seen in perspective from where you stand, so "now" looms large and a far-off week shrinks. Scene for anim.js. */
(function () {
  const KEY = "hyperbolic-discounting", P = `.bp[data-scene="${KEY}"]`;
  const AY = 166;                                   // the time axis (the ground everything stands on)
  const FX = 24;                                    // you, standing at "today"
  const NW = 60, NH = 30;                           // a €100 note at scale 1; €110 is 10% bigger
  // [x centre, scale] of each note: laid out flat, seen in perspective from today, and pictured a year away
  const FLAT = { A1: [86, 1.1], A2: [174, 1.1], B1: [262, 1.1], B2: [350, 1.1] };
  const PER = { A1: [130, 2.8], A2: [256, 1.0], B1: [314, .65], B2: [358, .65] };
  const FAR = { A1: PER.B1, A2: PER.B2 };
  const AMT = { A1: 100, A2: 110, B1: 100, B2: 110 };
  const IDS = ["A1", "A2", "B1", "B2"];
  const ARC = [[176, 70], [276, 14], [332, 126]];    // the "picture it a year away" arrow
  const L = (a, b, t) => a + (b - a) * t;
  const cl = v => Math.max(0, Math.min(1, v));
  const f2 = v => v.toFixed(2);
  // where a note is right now; ticks and time labels stay put while a note is only pictured far away
  const at = (id, S, stay) => {
    let x = L(FLAT[id][0], PER[id][0], S.persp), s = L(FLAT[id][1], PER[id][1], S.persp);
    if (!stay && FAR[id]) { x = L(x, FAR[id][0], S.far); s = L(s, FAR[id][1], S.far); }
    s *= AMT[id] / 100;
    return { x, s, w: NW * s, h: NH * s, top: AY - 2 - NH * s };
  };
  const eurEn = v => "€" + v, eurEl = v => v + "\u00a0€";

  window.BiasAnim.SCENES[KEY] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
      ${P} .hd-ax{fill:none;stroke:var(--rule);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hd-brk{fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round}
      ${P} .hd-tk{stroke:var(--rule);stroke-width:1.6;stroke-linecap:round}
      ${P} .hd-tl{font:500 10px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .hd-you{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hd-mouth{fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linecap:round}
      ${P} .hd-eye{fill:var(--ink)}
      ${P} .hd-bub rect,${P} .hd-bub path{fill:var(--surface);stroke:var(--q);stroke-width:1.8;stroke-linejoin:round}
      ${P} .hd-bub text{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .hd-think rect,${P} .hd-think circle{fill:var(--surface);stroke:var(--muted);stroke-width:1.6}
      ${P} .hd-think text{font:700 16px var(--display);fill:var(--muted);text-anchor:middle}
      ${P} .hd-ghost{fill:none;stroke:var(--faint);stroke-width:1.5;stroke-dasharray:4 4;vector-effect:non-scaling-stroke}
      ${P} .hd-note rect{fill:var(--surface);stroke:var(--ink);stroke-width:2;vector-effect:non-scaling-stroke}
      ${P} .hd-note rect.in{fill:none;stroke:var(--faint);stroke-width:1.1}
      ${P} .hd-note text{font:700 15px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .hd-note.q rect.o{stroke:var(--q)} ${P} .hd-note.q text{fill:var(--q)}
      ${P} .hd-note.g rect.o{stroke:var(--good)} ${P} .hd-note.g text{fill:var(--good)}
      ${P} .hd-chk circle{fill:var(--surface);stroke:var(--q);stroke-width:2}
      ${P} .hd-chk path{fill:none;stroke:var(--q);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hd-chk.g circle,${P} .hd-chk.g path{stroke:var(--good)}
      ${P} .hd-br{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round}
      ${P} .hd-brl{font:500 10px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .hd-ten{font:600 11px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .hd-loom{font:600 12.5px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .hd-arr{fill:none;stroke:var(--good);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hd-arl{font:500 10px var(--mono);fill:var(--good);text-anchor:middle}
      ${P} .hd-lock rect{fill:var(--surface);stroke:var(--good);stroke-width:2;stroke-linejoin:round}
      ${P} .hd-lock path{fill:none;stroke:var(--good);stroke-width:2;stroke-linecap:round}
      ${P} .hd-lock circle{fill:var(--good)}
      ${P} .hd-lockl{font:500 10px var(--mono);fill:var(--good);text-anchor:middle}
    `,
    text: {
      hu: {
        name: "Hiperbolikus diszkontálás", shareTitle: "A hiperbolikus diszkontálás, 30 másodpercben",
        ecline: "Ami közel van, az nagynak látszik. Távolról dönts, aztán rögzítsd a döntést.",
        eur: eurEl, today: "ma", inWeek: "+1 hét", inYear: "egy év múlva", plusWeek: "+1 hét",
        week: "1 hét", ten: "+10 €", looms: "most nagynak látszik", away: "képzeld el, hogy egy évre van",
        now: "Most akarom!", nowW: 104, wait: "Rendben, várok.", waitW: 110,
        auto: "automatikus mentés", autoW: 56,
        caps: [
          "Inkább <b>100 €-t ma</b>, vagy <b>110 €-t egy hét múlva</b> szeretnél?",
          "Megragadod a <b>100 €-t most</b>. Miért várnál egy egész hetet?",
          "Következő: <b>100 € egy év múlva</b>, vagy <b>110 € egy héttel később</b>?",
          "Most örömmel <b>vársz még egy hetet</b> a 110 €-ért.",
          "Ugyanaz az <b>egyhetes várakozás</b>, ugyanaz a <b>10 € többlet</b>. Ellentétes döntés.",
          "Közelről a <b>most</b> nagynak látszik. Távolról a hét <b>zsugorodik</b>.",
          "<b>A megoldás:</b> képzeld el mindkét lehetőséget úgy, mintha egy évre lennének.",
          "Vagy <b>dönts előre</b>, és rögzítsd a döntést <b>automatikus megtakarítással</b>."
        ],
        say: [
          "Inkább száz eurót kapnál ma, vagy száztízet egy hét múlva?",
          "Megragadod a százat most. Miért várnál egy egész hetet?",
          "Következő: száz euró egy év múlva, vagy százegy euró egy héttel később?",
          "Most örömmel vársz még egy hetet a százötvenért.",
          "Ugyanaz az egyhetes várakozás, ugyanaz a tíz euró többlet. Ellentétes döntés.",
          "Közelről a most nagynak látszik. Távolról ugyanaz a hét zsugorodik.",
          "A megoldás: képzeld el mindkét lehetőséget úgy, mintha egy évre lennének.",
          "Vagy dönts előre, és rögzítsd a döntést automatikus megtakarítással.",
          "Hiperbolikus diszkontálás. Ami közel van, az nagynak látszik. Távolról dönts, aztán rögzítsd a döntést."
        ]
      },
      en: {
        name: "Hyperbolic discounting", shareTitle: "Hyperbolic discounting, explained in 30 seconds",
        ecline: "What's close looms large. Decide from a distance, then lock it in.",
        eur: eurEn, today: "today", inWeek: "+1 week", inYear: "in a year", plusWeek: "+1 week",
        week: "1 week", ten: "+€10", looms: "now looms large", away: "picture it a year away",
        now: "I want it now!", nowW: 104, wait: "Sure, I'll wait.", waitW: 110,
        auto: "auto-save", autoW: 56,
        caps: [
          "Would you rather have <b>€100 today</b> or <b>€110 in a week</b>?",
          "You grab the <b>€100 now</b>. Why wait a whole week?",
          "Next: <b>€100 in a year</b>, or <b>€110 a week after that</b>?",
          "This time you happily <b>wait the extra week</b> for €110.",
          "Same <b>one-week wait</b>, same <b>€10 extra</b>. Opposite choice.",
          "Up close, <b>now looms large</b>. Far away, the week <b>shrinks</b>.",
          "<b>The fix:</b> picture both options as if they were a year away.",
          "Or <b>decide in advance</b> and lock it in, with <b>automatic saving</b>."
        ],
        say: [
          "Would you rather have a hundred euros today, or a hundred and ten in a week?",
          "You grab the hundred now. Why wait a whole week?",
          "Next: a hundred euros in a year, or a hundred and ten a week after that?",
          "This time, you happily wait the extra week for a hundred and ten.",
          "Same one-week wait. Same ten euros extra. Opposite choice.",
          "Up close, now looms large. Far away, the same week shrinks.",
          "The fix: picture both options as if they were a year away.",
          "Or decide in advance and lock it in, with automatic saving.",
          "Hyperbolic discounting. What's close looms large. Decide from a distance, then lock it in."
        ]
      },
      el: {
        name: "Υπερβολική προεξόφληση", shareTitle: "Η υπερβολική προεξόφληση σε 30 δευτερόλεπτα",
        ecline: "Ό,τι είναι κοντά φαντάζει τεράστιο. Αποφάσισε από μακριά και κλείδωσέ\u00a0το.",
        eur: eurEl, today: "σήμερα", inWeek: "+1 εβδομάδα", inYear: "σε έναν χρόνο", plusWeek: "+1 εβδομάδα",
        week: "1 εβδομάδα", ten: "+10\u00a0€", looms: "το τώρα φαντάζει τεράστιο", away: "φαντάσου το σε έναν χρόνο",
        now: "Τα θέλω τώρα!", nowW: 104, wait: "Εντάξει, θα περιμένω.", waitW: 142,
        auto: "πάγια εντολή", autoW: 74,
        caps: [
          "Τι προτιμάς: <b>100\u00a0€ σήμερα</b> ή <b>110\u00a0€ σε μια εβδομάδα</b>;",
          "Αρπάζεις τα <b>100\u00a0€ τώρα</b>. Γιατί να περιμένεις μια ολόκληρη εβδομάδα;",
          "Κι αν ήταν <b>100\u00a0€ σε έναν χρόνο</b> ή <b>110\u00a0€ μια εβδομάδα αργότερα</b>;",
          "Αυτή τη φορά περιμένεις με χαρά <b>μια εβδομάδα ακόμα</b> για τα 110\u00a0€.",
          "Ίδια <b>εβδομάδα αναμονής</b>, ίδιο <b>κέρδος\u00a010\u00a0€</b>. Κι όμως, διαλέγεις το αντίθετο.",
          "Από κοντά, <b>το τώρα φαντάζει τεράστιο</b>. Από μακριά, η εβδομάδα <b>μικραίνει</b>.",
          "<b>Η λύση:</b> φαντάσου και τις δύο επιλογές σαν να απείχαν έναν χρόνο.",
          "Ή <b>αποφάσισε από πριν</b> και κλείδωσέ\u00a0το, με <b>πάγια εντολή</b> για αποταμίευση."
        ],
        say: [
          "Τι προτιμάς: εκατό ευρώ σήμερα ή εκατόν δέκα σε μια εβδομάδα;",
          "Αρπάζεις τα εκατό τώρα. Γιατί να περιμένεις μια ολόκληρη εβδομάδα;",
          "Κι αν ήταν εκατό ευρώ σε έναν χρόνο ή εκατόν δέκα μια εβδομάδα αργότερα;",
          "Αυτή τη φορά, περιμένεις με χαρά μια εβδομάδα ακόμα για τα εκατόν δέκα.",
          "Ίδια εβδομάδα αναμονής, ίδιο κέρδος δέκα ευρώ. Κι όμως, διαλέγεις το αντίθετο.",
          "Από κοντά, το τώρα φαντάζει τεράστιο. Από μακριά, η εβδομάδα μικραίνει.",
          "Η λύση: φαντάσου και τις δύο επιλογές σαν να απείχαν έναν χρόνο.",
          "Ή αποφάσισε από πριν και κλείδωσέ το, με πάγια εντολή για αποταμίευση.",
          "Υπερβολική προεξόφληση. Ό,τι είναι κοντά φαντάζει τεράστιο. Αποφάσισε από μακριά και κλείδωσέ το."
        ]
      },
      es: {
        name: "Descuento hiperbólico", shareTitle: "El descuento hiperbólico en 30 segundos",
        ecline: "Lo cercano pesa más. Decide desde lejos y luego déjalo fijado.",
        eur: v => v + " €", today: "hoy", inWeek: "+1 semana", inYear: "en un año", plusWeek: "+1 semana",
        week: "1 semana", ten: "+10 €", looms: "el ahora pesa más", away: "imagínalo dentro de un año",
        now: "¡Lo quiero ya!", nowW: 104, wait: "Claro, espero.", waitW: 110,
        auto: "ahorro automático", autoW: 106,
        caps: [
          "¿Qué prefieres: <b>100 € hoy</b> o <b>110 € dentro de una semana</b>?",
          "Te quedas los <b>100 € ya</b>. ¿Para qué esperar una semana entera?",
          "Ahora: ¿<b>100 € dentro de un año</b> o <b>110 € una semana después</b>?",
          "Esta vez <b>esperas la semana extra</b> sin problema por 110 €.",
          "La misma <b>semana de espera</b>, los mismos <b>10 € de más</b>. Elección opuesta.",
          "De cerca, <b>el ahora pesa más</b>. De lejos, la semana <b>se encoge</b>.",
          "<b>La solución:</b> imagina las dos opciones como si fueran dentro de un año.",
          "O <b>decide de antemano</b> y déjalo fijado, con <b>ahorro automático</b>."
        ],
        say: [
          "¿Qué prefieres: cien euros hoy, o ciento diez dentro de una semana?",
          "Te quedas los cien ya. ¿Para qué esperar una semana entera?",
          "Ahora: ¿cien euros dentro de un año, o ciento diez una semana después?",
          "Esta vez esperas la semana extra sin problema por ciento diez.",
          "La misma semana de espera. Los mismos diez euros de más. Elección opuesta.",
          "De cerca, el ahora pesa más. De lejos, la misma semana se encoge.",
          "La solución: imagina las dos opciones como si fueran dentro de un año.",
          "O decide de antemano y déjalo fijado, con ahorro automático.",
          "El descuento hiperbólico. Lo cercano pesa más. Decide desde lejos, y luego déjalo fijado."
        ]
      },
      fr: {
        name: "Actualisation hyperbolique", shareTitle: "L’actualisation hyperbolique en 30 secondes",
        ecline: "Ce qui est proche pèse lourd. Décidez de loin, puis verrouillez votre choix.",
        eur: v => `${v} €`, today: "aujourd’hui", inWeek: "+1 semaine", inYear: "dans un an", plusWeek: "+1 semaine",
        week: "1 semaine", ten: "+10 €", looms: "le présent pèse lourd", away: "imaginez-le dans un an",
        now: "Tout de suite !", nowW: 109, wait: "OK, j’attends.", waitW: 110,
        auto: "épargne auto", autoW: 74,
        caps: [
          "Vous préférez <b>100 € aujourd’hui</b> ou <b>110 € dans une semaine</b> ?",
          "Vous prenez les <b>100 € tout de suite</b>. Pourquoi attendre une semaine ?",
          "Ensuite : <b>100 € dans un an</b>, ou <b>110 € une semaine plus tard</b> ?",
          "Cette fois, vous <b>attendez volontiers la semaine</b> de plus pour 110 €.",
          "Même <b>semaine d’attente</b>, mêmes <b>10 € en plus</b>. Choix opposé.",
          "De près, <b>le présent pèse lourd</b>. De loin, la semaine <b>rétrécit</b>.",
          "<b>La solution :</b> imaginez les deux options comme si elles étaient dans un an.",
          "Ou <b>décidez à l’avance</b> et verrouillez votre choix, avec une <b>épargne automatique</b>."
        ],
        say: [
          "Vous préférez cent euros aujourd’hui, ou cent dix dans une semaine ?",
          "Vous prenez les cent tout de suite. Pourquoi attendre une semaine entière ?",
          "Ensuite : cent euros dans un an, ou cent dix une semaine plus tard ?",
          "Cette fois, vous attendez volontiers la semaine de plus pour cent dix.",
          "Même semaine d’attente. Mêmes dix euros en plus. Choix opposé.",
          "De près, le présent pèse lourd. De loin, la même semaine rétrécit.",
          "La solution : imaginez les deux options comme si elles étaient dans un an.",
          "Ou décidez à l’avance et verrouillez votre choix, avec une épargne automatique.",
          "L’actualisation hyperbolique. Ce qui est proche pèse lourd. Décidez de loin, puis verrouillez votre choix."
        ]
      },
      de: {
        name: "Hyperbolische Diskontierung", shareTitle: "Die hyperbolische Diskontierung in 30 Sekunden",
        ecline: "Was nah ist, wirkt riesig. Entscheide aus der Distanz und leg dich dann fest.",
        eur: v => `${v} €`, today: "heute", inWeek: "+1 Woche", inYear: "in einem Jahr", plusWeek: "+1 Woche",
        week: "1 Woche", ten: "+10 €", looms: "Jetzt wirkt riesig", away: "als wäre es in einem Jahr",
        now: "Ich will’s jetzt!", nowW: 109, wait: "Klar, ich warte.", waitW: 126,
        auto: "Sparplan", autoW: 56,
        caps: [
          "Hättest du lieber <b>100 € heute</b> oder <b>110 € in einer Woche</b>?",
          "Du schnappst dir die <b>100 € sofort</b>. Wozu eine ganze Woche warten?",
          "Als Nächstes: <b>100 € in einem Jahr</b> oder <b>110 € eine Woche später</b>?",
          "Diesmal <b>wartest du gern die Woche länger</b> auf 110 €.",
          "Dieselbe <b>Woche Warten</b>, dieselben <b>10 € extra</b>. Die umgekehrte Wahl.",
          "Aus der Nähe <b>wirkt das Jetzt riesig</b>. Aus der Ferne <b>schrumpft</b> die Woche.",
          "<b>Die Lösung:</b> Stell dir beide Optionen vor, als lägen sie ein Jahr entfernt.",
          "Oder <b>entscheide im Voraus</b> und leg dich fest, mit <b>automatischem Sparen</b>."
        ],
        say: [
          "Hättest du lieber hundert Euro heute oder hundertzehn in einer Woche?",
          "Du schnappst dir die hundert sofort. Wozu eine ganze Woche warten?",
          "Als Nächstes: hundert Euro in einem Jahr oder hundertzehn eine Woche später?",
          "Diesmal wartest du gern die Woche länger auf hundertzehn.",
          "Dieselbe Woche Warten. Dieselben zehn Euro extra. Die umgekehrte Wahl.",
          "Aus der Nähe wirkt das Jetzt riesig. Aus der Ferne schrumpft dieselbe Woche.",
          "Die Lösung: Stell dir beide Optionen vor, als lägen sie ein Jahr entfernt.",
          "Oder entscheide im Voraus und leg dich fest, mit automatischem Sparen.",
          "Die hyperbolische Diskontierung. Was nah ist, wirkt riesig. Entscheide aus der Distanz und leg dich dann fest."
        ]
      },
      it: {
        name: "Sconto iperbolico", shareTitle: "Lo sconto iperbolico in 30 secondi",
        ecline: "Ciò che è vicino sembra enorme. Decidi da lontano, poi blocca la scelta.",
        eur: v => `${v} €`, today: "oggi", inWeek: "+1 settimana", inYear: "tra un anno", plusWeek: "+1 settimana",
        week: "1 settimana", ten: "+10 €", looms: "l’adesso incombe", away: "immaginalo tra un anno",
        now: "Lo voglio ora!", nowW: 104, wait: "Certo, aspetto.", waitW: 124,
        auto: "automatico", autoW: 62,
        caps: [
          "Preferisci <b>100 € oggi</b> o <b>110 € tra una settimana</b>?",
          "Prendi subito i <b>100 €</b>. Perché aspettare un’intera settimana?",
          "Ora: <b>100 € tra un anno</b>, o <b>110 € una settimana dopo</b>?",
          "Stavolta <b>aspetti volentieri la settimana in più</b> per 110 €.",
          "Stessa <b>attesa di una settimana</b>, stessi <b>10 € in più</b>. Scelta opposta.",
          "Da vicino, <b>l’adesso incombe</b>. Da lontano, la settimana <b>si rimpicciolisce</b>.",
          "<b>La soluzione:</b> immagina entrambe le opzioni come se fossero tra un anno.",
          "Oppure <b>decidi in anticipo</b> e blocca la scelta, con il <b>risparmio automatico</b>."
        ],
        say: [
          "Preferisci cento euro oggi, o centodieci tra una settimana?",
          "Prendi subito i cento euro. Perché aspettare un’intera settimana?",
          "Ora: cento euro tra un anno, o centodieci una settimana dopo?",
          "Stavolta aspetti volentieri la settimana in più per centodieci euro.",
          "Stessa attesa di una settimana. Stessi dieci euro in più. Scelta opposta.",
          "Da vicino, l’adesso incombe. Da lontano, la stessa settimana si rimpicciolisce.",
          "La soluzione: immagina entrambe le opzioni come se fossero tra un anno.",
          "Oppure decidi in anticipo e blocca la scelta, con il risparmio automatico.",
          "Lo sconto iperbolico. Ciò che è vicino sembra enorme. Decidi da lontano, poi blocca la scelta."
        ]
      }
    },
    svg(T) {
      const note = id => `<g data-k="${id}"><g class="hd-note" data-k="${id}c">
        <rect class="o" x="${-NW / 2}" y="${-NH}" width="${NW}" height="${NH}" rx="4"/>
        <rect class="in" x="${-NW / 2 + 4}" y="${-NH + 4}" width="${NW - 8}" height="${NH - 8}" rx="2"/>
        <text y="-9.8">${T.eur(AMT[id])}</text></g></g>`;
      const chk = key => `<g data-k="${key}"><g class="hd-chk${key === "chkF" ? " g" : ""}"><circle r="8"/><path d="M-3.8 .4 L-1 3.2 L4 -2.6"/></g></g>`;
      const bubble = (key, txt, w) => `<g data-k="${key}"><g class="hd-bub"><rect x="40" y="${AY - 102}" width="${w}" height="26" rx="10"/>
        <path d="M50 ${AY - 77} L37 ${AY - 64} L62 ${AY - 77}"/><text x="${40 + w / 2}" y="${AY - 84.5}">${txt}</text></g></g>`;
      const think = key => `<g data-k="${key}"><g class="hd-think"><circle cx="37" cy="${AY - 66}" r="2.2"/><circle cx="43" cy="${AY - 73}" r="3.2"/>
        <rect x="44" y="${AY - 104}" width="30" height="26" rx="12"/><text x="59" y="${AY - 85}">?</text></g></g>`;
      const [p0, p1, p2] = ARC;
      const ang = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
      const head = [ang + Math.PI - .5, ang + Math.PI + .5].map(a => `M${p2[0]} ${p2[1]} L${f2(p2[0] + 9 * Math.cos(a))} ${f2(p2[1] + 9 * Math.sin(a))}`).join(" ");
      return `
        <g data-k="axis"><path class="hd-ax" data-k="axp" d=""/><path class="hd-ax" d="M382 ${AY - 5} L388 ${AY} L382 ${AY + 5}"/></g>
        <path class="hd-brk" data-k="brk" d=""/>
        ${IDS.map(id => `<line class="hd-tk" data-k="tk${id}" y1="${AY}" y2="${AY + 6}"/>`).join("")}
        <text class="hd-tl" data-k="t1" y="${AY + 18}">${T.today}</text>
        <text class="hd-tl" data-k="t2" y="${AY + 18}">${T.inWeek}</text>
        <text class="hd-tl" data-k="t3" y="${AY + 18}">${T.inYear}</text>
        <text class="hd-tl" data-k="t4" y="${AY + 18}">${T.plusWeek}</text>
        <g data-k="brA"><path class="hd-br" data-k="brAp" d=""/><text class="hd-brl" data-k="brAt" y="${AY + 49}">${T.week}</text></g>
        <g data-k="brB"><path class="hd-br" data-k="brBp" d=""/><text class="hd-brl" data-k="brBt" y="${AY + 49}">${T.week}</text></g>
        <g data-k="you">
          <path class="hd-you" d="M${FX - 14} ${AY} C${FX - 14} ${AY - 22} ${FX - 8} ${AY - 36} ${FX} ${AY - 36} C${FX + 8} ${AY - 36} ${FX + 14} ${AY - 22} ${FX + 14} ${AY}"/>
          <circle class="hd-you" cx="${FX}" cy="${AY - 50}" r="10"/>
          <circle class="hd-eye" cx="${FX + 3}" cy="${AY - 52}" r="1.5"/><circle class="hd-eye" cx="${FX + 7.5}" cy="${AY - 52}" r="1.5"/>
          <path class="hd-mouth" data-k="mouth" d=""/>
        </g>
        ${think("q1")}${think("q2")}${bubble("bNow", T.now, T.nowW)}${bubble("bWait", T.wait, T.waitW)}
        <g data-k="gA1"><rect class="hd-ghost" x="${-NW / 2}" y="${-NH}" width="${NW}" height="${NH}" rx="4"/></g>
        <g data-k="gA2"><rect class="hd-ghost" x="${-NW / 2}" y="${-NH}" width="${NW}" height="${NH}" rx="4"/></g>
        ${IDS.map(note).join("")}
        <text class="hd-ten" data-k="tenA">${T.ten}</text><text class="hd-ten" data-k="tenB">${T.ten}</text>
        ${chk("chkA")}${chk("chkB")}${chk("chkF")}
        <text class="hd-loom" data-k="loom">${T.looms}</text>
        <g data-k="arr"><path class="hd-arr" data-k="arrp" pathLength="1" stroke-dasharray="1 1" d="M${p0[0]} ${p0[1]} Q${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}"/>
          <path class="hd-arr" data-k="arrh" d="${head}"/>
          <text class="hd-arl" x="268" y="42">${T.away}</text></g>
        <g data-k="lock"><g class="hd-lock"><path d="M-4.5 -2 V-6 A4.5 4.5 0 0 1 4.5 -6 V-2"/><rect x="-7" y="-2" width="14" height="11" rx="2"/><circle cy="3.5" r="1.4"/></g></g>
        <text class="hd-lockl" data-k="lockl">${T.auto}</text>`;
    },
    S0: { ax: 0, a1: 0, a2: 0, b1: 0, b2: 0, t1: 0, t2: 0, t3: 0, t4: 0, brk: 0, lift: 0, mood: 0, q1: 0, q2: 0, bNow: 0, bWait: 0,
      chkA: 0, dimA2: 0, focusB: 0, chkB: 0, dimB1: 0, br: 0, ten: 0, pulse: 0, persp: 0, looms: 0,
      bOut: 0, far: 0, arrow: 0, arrowOut: 0, chkF: 0, lock: 0, win: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const tr = (key, x, y, s) => k(key).setAttribute("transform", `translate(${f2(x)} ${f2(y)})${s === undefined ? "" : ` scale(${s.toFixed(4)})`}`);
      const N = {}, TK = {};
      for (const id of IDS) { N[id] = at(id, S); TK[id] = at(id, S, true).x; }
      // the axis, with a break between "this week" and "next year" while it is drawn flat
      const bx = (TK.A2 + TK.B1) / 2, gap = 6 * S.brk;
      k("axp").setAttribute("d", `M12 ${AY} H${f2(bx - gap)} M${f2(bx + gap)} ${AY} H388`);
      op("axis", S.ax);
      k("brk").setAttribute("d", `M${f2(bx - 8)} ${AY + 4} L${f2(bx - 2)} ${AY - 8} M${f2(bx + 2)} ${AY + 4} L${f2(bx + 8)} ${AY - 8}`);
      op("brk", S.brk);
      for (const id of IDS) { const t = k("tk" + id); t.setAttribute("x1", f2(TK[id])); t.setAttribute("x2", f2(TK[id])); }
      op("tkA1", S.ax); op("tkA2", S.a2); op("tkB1", S.b1); op("tkB2", S.b2);
      [["t1", "A1"], ["t2", "A2"], ["t3", "B1"], ["t4", "B2"]].forEach(([t, id]) => { k(t).setAttribute("x", f2(TK[id])); op(t, S[t]); });
      // you, and what you say
      op("you", S.ax);
      k("mouth").setAttribute("d", `M${FX + 1.5} ${AY - 46} Q${FX + 5.25} ${f2(AY - 46 + 3.5 * S.mood)} ${FX + 9} ${AY - 46}`);
      for (const b of ["bNow", "bWait", "q1", "q2"]) {
        const s = .7 + .3 * cl(S[b]);
        k(b).setAttribute("transform", `translate(37 ${AY - 64}) scale(${s.toFixed(3)}) translate(-37 ${-(AY - 64)})`);
        op(b, S[b] * 1.6);
      }
      // the four notes
      const fade = { A1: (1 - .6 * S.focusB) * (1 - .6 * S.win), A2: (1 - .55 * S.dimA2) * (1 - .6 * S.focusB), B1: (1 - .55 * S.dimB1) * (1 - S.bOut), B2: 1 - S.bOut };
      const show = { A1: S.a1, A2: S.a2, B1: S.b1, B2: S.b2 };
      for (const id of IDS) {
        const n = N[id], grow = show[id] < 1 ? .6 + .4 * cl(show[id]) : 1;
        tr(id, n.x, AY - 2 - (id === "A1" ? 10 * S.lift : 0), n.s * grow);
        op(id, show[id] * 2 * fade[id]);
      }
      k("A1c").setAttribute("class", "hd-note" + (S.chkA > .5 ? " q" : ""));
      k("B2c").setAttribute("class", "hd-note" + (S.chkB > .5 ? " q" : ""));
      k("A2c").setAttribute("class", "hd-note" + (S.chkF > .5 ? " g" : ""));
      // check marks on the note you pick, sitting on its top-right corner
      const badge = (key, n, v, dy, f) => {
        tr(key, n.x + n.w / 2 - 4, n.top - 4 - dy, Math.max(.001, cl(v) * (1 + .25 * S.pulse)));
        op(key, v * 2 * f);
      };
      badge("chkA", N.A1, S.chkA, 10 * S.lift, 1 - .6 * S.focusB);
      badge("chkB", N.B2, S.chkB, 0, 1 - S.bOut);
      badge("chkF", N.A2, S.chkF, 0, 1);
      // same week, same €10
      const brace = (key, a, b, f) => {
        k(key + "p").setAttribute("d", `M${f2(a)} ${AY + 27} V${AY + 37} M${f2(a)} ${AY + 32} H${f2(b)} M${f2(b)} ${AY + 27} V${AY + 37}`);
        k(key + "t").setAttribute("x", f2((a + b) / 2));
        op(key, S.br * f);
      };
      brace("brA", N.A1.x, N.A2.x, 1); brace("brB", N.B1.x, N.B2.x, 1 - S.bOut);
      for (const [key, n] of [["tenA", N.A2], ["tenB", N.B2]]) { k(key).setAttribute("x", f2(n.x)); k(key).setAttribute("y", f2(n.top - 7)); op(key, S.ten); }
      // seen from where you stand: now looms large
      k("loom").setAttribute("x", f2(N.A1.x)); k("loom").setAttribute("y", f2(N.A1.top - 17)); op("loom", S.looms);
      // the fix: picture it a year away (dashed outlines mark where it really is), then lock the choice in
      for (const id of ["A1", "A2"]) { const g = at(id, S, true); tr("g" + id, g.x, AY - 2, g.s); op("g" + id, .8 * S.far); }
      k("arrp").style.strokeDashoffset = (1 - cl(S.arrow)).toFixed(3);
      op("arrh", S.arrow > .97 ? 1 : 0);
      op("arr", (S.arrow > 0 ? 1 : 0) * (1 - S.arrowOut));
      tr("lock", N.A2.x, N.A2.top - 15, .6 + .4 * cl(S.lock)); op("lock", S.lock * 2);
      k("lockl").setAttribute("x", f2(Math.min(N.A2.x, 390 - T.autoW / 2))); k("lockl").setAttribute("y", f2(N.A2.top - 31)); op("lockl", S.lock);
    },
    beats: [
      { steps: [{ to: { ax: 1, t1: 1 }, ms: 400 }, { to: { a1: 1 }, ms: 450, ease: "back", sfx: "pluck" }, { wait: 250 },
        { to: { a2: 1, t2: 1 }, ms: 450, ease: "back" }, { to: { q1: 1 }, ms: 400, ease: "back" }] },
      { steps: [{ to: { lift: 1, q1: 0 }, ms: 220 }, { to: { lift: 0, chkA: 1, mood: 1 }, ms: 420, ease: "back", sfx: "pop" },
        { to: { bNow: 1, dimA2: 1 }, ms: 400, ease: "back" }] },
      { steps: [{ to: { bNow: 0, focusB: 1, brk: 1, mood: 0 }, ms: 400 }, { to: { b1: 1, t3: 1 }, ms: 450, ease: "back", sfx: "pluck" }, { wait: 250 },
        { to: { b2: 1, t4: 1 }, ms: 450, ease: "back" }, { to: { q2: 1 }, ms: 400, ease: "back" }] },
      { steps: [{ to: { q2: 0 }, ms: 200 }, { to: { chkB: 1, mood: .6 }, ms: 420, ease: "back", sfx: "pop" }, { to: { bWait: 1, dimB1: 1 }, ms: 400, ease: "back" }] },
      { steps: [{ to: { bWait: 0, focusB: 0 }, ms: 400 }, { to: { br: 1, t2: 0, t4: 0 }, ms: 500, sfx: "tick" }, { to: { ten: 1 }, ms: 400 }, { wait: 200 },
        { to: { pulse: 1 }, ms: 220 }, { to: { pulse: 0 }, ms: 320 }] },
      { steps: [{ to: { ten: 0, dimA2: 0, dimB1: 0, mood: 0, brk: 0 }, ms: 350 }, { to: { persp: 1 }, ms: 1700, ease: "inOut", sfx: "whoosh" },
        { to: { looms: 1 }, ms: 400 }], hold: 3000 },
      { steps: [{ to: { looms: 0, bOut: 1, chkA: 0 }, ms: 450 }, { to: { far: 1, arrow: 1 }, ms: 1500, ease: "inOut" },
        { to: { chkF: 1, mood: .6 }, ms: 420, ease: "back", sfx: "pop" }] },
      { steps: [{ to: { arrowOut: 1 }, ms: 350 }, { to: { lock: 1 }, ms: 450, ease: "back" }, { wait: 300 },
        { to: { far: 0 }, ms: 1500, ease: "inOut", sfx: "whoosh" }, { to: { win: 1, mood: 1 }, ms: 450, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
