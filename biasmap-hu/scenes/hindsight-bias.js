/* Hindsight bias: a final that felt like a toss-up, a 3–1 win, and a memory that quietly
   moves the needle. A note written before kick-off sets it straight. Scene for anim.js. */
(function () {
  const KEY = "hindsight-bias", P = `.bp[data-scene="${KEY}"]`;
  const CX = 293, CY = 136, R = 66;                  // the dial inside the thought bubble
  const NX = 99, NY = 160;                           // the note, written before kick-off
  const f1 = n => +n.toFixed(1);
  const clamp = v => Math.max(0, Math.min(1, v));
  const pt = (v, r) => { const a = v / 100 * Math.PI; return [f1(CX - r * Math.cos(a)), f1(CY - r * Math.sin(a))]; };
  const arc = (v0, v1, r) => { const [x0, y0] = pt(v0, r), [x1, y1] = pt(v1, r); return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`; };
  const radial = (v, r0, r1) => { const [x0, y0] = pt(v, r0), [x1, y1] = pt(v, r1); return `M${x0} ${y0} L${x1} ${y1}`; };
  const CARD = [118, 146, 174];                      // reason cards, top edges
  const UL = "M-70 31 q10 -3 20 0 t20 0 t8 -1";        // scribbled underline under the note's 50%
  const MK0 = [NX - 50, NY + 18], MK1 = [CX, 52];     // the note's 50% flies to the top of the dial

  window.BiasAnim.SCENES[KEY] = {
    q: "nem", viewBox: "0 0 400 272",
    css: `
      ${P} .hb-sb rect{fill:var(--surface);stroke:var(--ink);stroke-width:2}
      ${P} .hb-sb line{stroke:var(--rule);stroke-width:1.5}
      ${P} .hb-hd{font:500 9px var(--mono);fill:var(--muted);text-anchor:middle;letter-spacing:.12em}
      ${P} .hb-sc{font:700 26px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .hb-sc.w{fill:var(--q)}
      ${P} .hb-dash{font:600 20px var(--display);fill:var(--faint);text-anchor:middle}
      ${P} .hb-team{font:500 9.5px var(--display);fill:var(--muted);text-anchor:middle}
      ${P} .hb-bub{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .hb-man circle,${P} .hb-man path{fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hb-track{fill:none;stroke:var(--rule);stroke-width:7;stroke-linecap:round}
      ${P} .hb-tk{stroke:var(--faint);stroke-width:1.4;stroke-linecap:round}
      ${P} .hb-tk.b{stroke:var(--muted);stroke-width:2}
      ${P} .hb-tl{font:500 9.5px var(--mono);fill:var(--faint);text-anchor:middle}
      ${P} .hb-nd{stroke:var(--ink);stroke-width:2.6;stroke-linecap:round}
      ${P} .hb-nd.ok{stroke:var(--good)}
      ${P} .hb-ghost{stroke:var(--muted);stroke-width:2;stroke-dasharray:3 4;stroke-linecap:round}
      ${P} .hb-hub{fill:var(--surface);stroke:var(--ink);stroke-width:2}
      ${P} .hb-ro{font:700 20px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .hb-ro.ok{fill:var(--good)}
      ${P} .hb-lab{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .hb-wedge{fill:var(--bad);fill-opacity:.2;stroke:none}
      ${P} .hb-br{fill:none;stroke:var(--bad);stroke-width:1.8;stroke-linecap:round}
      ${P} .hb-brt{font:600 10px var(--mono);fill:var(--bad);text-anchor:middle}
      ${P} .hb-why{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .hb-card rect{fill:var(--surface);stroke:var(--muted);stroke-width:1.4}
      ${P} .hb-card text{font:600 11px var(--display);fill:var(--ink)}
      ${P} .hb-card path{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hb-note .pa{fill:var(--surface);stroke:var(--ink);stroke-width:1.6}
      ${P} .hb-note .tape{fill:var(--q);fill-opacity:.35}
      ${P} .hb-note .h{font:500 9px var(--mono);fill:var(--muted)}
      ${P} .hb-note .l{font:600 11.5px var(--display);fill:var(--ink)}
      ${P} .hb-note .v{font:700 22px var(--display);fill:var(--q)}
      ${P} .hb-note .v.ok{fill:var(--good)}
      ${P} .hb-note .ul{fill:none;stroke:var(--q);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hb-note .ul.ok{stroke:var(--good)}
      ${P} .hb-mk rect{fill:var(--surface);stroke:var(--good);stroke-width:1.8}
      ${P} .hb-mk path{fill:var(--good)}
      ${P} .hb-mk text{font:700 11px var(--display);fill:var(--good);text-anchor:middle}
      ${P} .hb-mkt{font:500 9.5px var(--mono);fill:var(--good);text-anchor:end}
      ${P} .hb-check{fill:none;stroke:var(--good);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
    `,
    text: {
      hu: {
        name: "Visszatekintő torzítás", shareTitle: "A visszatekintő torzítás, 30 másodpercben",
        ecline: "Utólag minden nyilvánvalónak tűnik. Írd le előbb a jóslataidat.",
        hd0: "VÉGEREDMÉNY · 21:00", hd1: "VÉGEREDMÉNY · LEFÚJVA", home: "Hazai", away: "Vendég",
        why: "miért volt nyilvánvaló:", reasons: ["Formában lévő csatár", "Jobb védelem", "Hazai szurkolók"],
        dial: "esély a hazai győzelemre", hind: "utólag",
        noteH: "20:45 · a rúgás előtt", noteL: "Hazai győzelem:", mark: "a jegyzeted",
        caps: [
          "A döntő előtt úgy gondolod, <b>50–50</b>.",
          "A hazai csapatnak nagyjából <b>50%</b>-ot adnál.",
          "Lefújás: a hazai csapat <b>3–1</b>-re nyer.",
          "Most a győzelem <b>nyilvánvalónak</b> tűnik. Felsorolod az okokat.",
          "Az emléked csendben átírja a tippedet: „<b>80%-ig biztos</b> voltam.”",
          "Utólag a múlt <b>kiszámíthatóbbnak</b> látszik, mint volt.",
          "<b>A megoldás:</b> írd le a jóslataidat, azzal együtt, mennyire vagy biztos.",
          "Nézd meg a jegyzeted: <b>50%</b>. Tanulj abból, amit valójában gondoltál."
        ],
        say: [
          "A döntő előtt úgy gondolod, 50–50 körül.",
          "A hazai csapatnak nagyjából ötven százalékot adnál.",
          "Lefújás. A hazai csapat nyer, három egy.",
          "Most a győzelem nyilvánvalónak tűnik. Felsorolod az okokat.",
          "Az emléked csendben átírja a tippedet. Nyolcvan százalékig biztos voltam.",
          "Utólag a múlt kiszámíthatóbbnak látszik, mint volt.",
          "A megoldás: írd le a jóslataidat, azzal együtt, mennyire vagy biztos.",
          "Nézd meg a jegyzeted: ötven százalék. Tanulj abból, amit valójában gondoltál.",
          "Visszatekintő torzítás. Utólag minden nyilvánvalónak tűnik. Írd le előbb a jóslataidat."
        ]
      },
      en: {
        name: "Hindsight bias", shareTitle: "Hindsight bias, explained in 30 seconds",
        ecline: "After the fact, everything looks obvious. Write your predictions down first.",
        hd0: "FINAL · 21:00", hd1: "FINAL · FULL TIME", home: "Home", away: "Away",
        why: "why it was obvious:", reasons: ["Striker in form", "Better defence", "Home crowd"],
        dial: "chance of a home win", hind: "hindsight",
        noteH: "20:45 · before kick-off", noteL: "Home win:", mark: "your note",
        caps: [
          "Before the final, you think it's a <b>toss-up</b>.",
          "You'd give the home team about <b>50%</b>.",
          "Full time: the home team wins <b>3–1</b>.",
          "Now the win looks <b>obvious</b>. You list the reasons.",
          "Your memory quietly edits your guess: “I was <b>80% sure</b>.”",
          "In hindsight, the past looks <b>more predictable</b> than it was.",
          "<b>The fix:</b> write predictions down, with how sure you are.",
          "Check your note: <b>50%</b>. Learn from what you really thought."
        ],
        say: [
          "Before the final, you think it's a toss-up.",
          "You'd give the home team about fifty percent.",
          "Full time. The home team wins, three one.",
          "Now the win looks obvious. You list the reasons.",
          "Your memory quietly edits your guess. I was eighty percent sure.",
          "In hindsight, the past looks more predictable than it was.",
          "The fix: write predictions down, with how sure you are.",
          "Check your note: fifty percent. Learn from what you really thought.",
          "Hindsight bias. After the fact, everything looks obvious. Write your predictions down first."
        ]
      },
      el: {
        name: "Μεροληψία εκ των υστέρων", shareTitle: "Η μεροληψία εκ των υστέρων σε 30 δευτερόλεπτα",
        ecline: "Μόλις μάθεις το αποτέλεσμα, όλα μοιάζουν προφανή. Γράφε τις προβλέψεις σου από πριν.",
        hd0: "ΤΕΛΙΚΟΣ · 21:00", hd1: "ΤΕΛΙΚΟΣ · ΛΗΞΗ", home: "Γηπεδούχοι", away: "Φιλοξενούμενοι",
        why: "γιατί ήταν προφανές:", reasons: ["Επιθετικός σε φόρμα", "Καλύτερη άμυνα", "Ο κόσμος της έδρας"],
        dial: "πιθανότητα νίκης γηπεδούχων", hind: "εκ των υστέρων",
        noteH: "20:45 · πριν τη σέντρα", noteL: "Νίκη γηπεδούχων:", mark: "σημείωμα",
        caps: [
          "Πριν τον τελικό, θεωρείς το ματς <b>αμφίρροπο</b>.",
          "Δίνεις στους γηπεδούχους περίπου <b>50%</b> να κερδίσουν.",
          "Σφύριγμα λήξης: οι γηπεδούχοι κερδίζουν με <b>3–1</b>.",
          "Τώρα η νίκη μοιάζει <b>προφανής</b>. Βρίσκεις αμέσως τους λόγους.",
          "Η μνήμη σου ξαναγράφει στα κρυφά την πρόβλεψη: «Το έδινα <b>80%</b>».",
          "Εκ των υστέρων, το παρελθόν μοιάζει <b>πιο προβλέψιμο</b> απ’ ό,τι ήταν.",
          "<b>Η λύση:</b> γράφε τις προβλέψεις σου και πόσο πιθανές τις θεωρείς.",
          "Κοίτα το σημείωμά σου: <b>50%</b>. Μάθε από αυτό που πραγματικά πίστευες."
        ],
        say: [
          "Πριν τον τελικό, θεωρείς το ματς αμφίρροπο.",
          "Δίνεις στους γηπεδούχους περίπου πενήντα τοις εκατό να κερδίσουν.",
          "Σφύριγμα λήξης. Οι γηπεδούχοι κερδίζουν με τρία ένα.",
          "Τώρα η νίκη μοιάζει προφανής. Βρίσκεις αμέσως τους λόγους.",
          "Η μνήμη σου ξαναγράφει στα κρυφά την πρόβλεψη. Το έδινα ογδόντα τοις εκατό.",
          "Εκ των υστέρων, το παρελθόν μοιάζει πιο προβλέψιμο απ’ ό,τι ήταν.",
          "Η λύση: γράφε τις προβλέψεις σου και πόσο πιθανές τις θεωρείς.",
          "Κοίτα το σημείωμά σου: πενήντα τοις εκατό. Μάθε από αυτό που πραγματικά πίστευες.",
          "Μεροληψία εκ των υστέρων. Μόλις μάθεις το αποτέλεσμα, όλα μοιάζουν προφανή. Γράφε τις προβλέψεις σου από πριν."
        ]
      },
      es: {
        name: "Sesgo retrospectivo", shareTitle: "El sesgo retrospectivo en 30 segundos",
        ecline: "Cuando ya ha pasado, todo parece obvio. Apunta antes tus predicciones.",
        hd0: "FINAL · 21:00", hd1: "FINAL · RESULTADO", home: "Local", away: "Visitante",
        why: "por qué era obvio:", reasons: ["Delantero en forma", "Mejor defensa", "Afición local"],
        dial: "opciones de victoria local", hind: "a posteriori",
        noteH: "20:45 · antes de empezar", noteL: "Gana el local:", mark: "tu nota",
        caps: [
          "Antes de la final, crees que está <b>muy igualada</b>.",
          "Al equipo local le darías más o menos un <b>50%</b>.",
          "Final del partido: gana el local <b>3–1</b>.",
          "Ahora la victoria parece <b>obvia</b>. Enumeras las razones.",
          "Tu memoria retoca tu pronóstico sin avisar: «Estaba <b>seguro al 80%</b>».",
          "Visto a posteriori, el pasado parece <b>más predecible</b> de lo que fue.",
          "<b>La solución:</b> apunta tus predicciones y lo seguro que estás.",
          "Mira tu nota: <b>50%</b>. Aprende de lo que pensabas de verdad."
        ],
        say: [
          "Antes de la final, crees que está muy igualada.",
          "Al equipo local le darías más o menos un cincuenta por ciento.",
          "Final del partido. Gana el local, tres a uno.",
          "Ahora la victoria parece obvia. Enumeras las razones.",
          "Tu memoria retoca tu pronóstico sin avisar. Estaba seguro al ochenta por ciento.",
          "Visto a posteriori, el pasado parece más predecible de lo que fue.",
          "La solución: apunta tus predicciones y lo seguro que estás.",
          "Mira tu nota: cincuenta por ciento. Aprende de lo que pensabas de verdad.",
          "El sesgo retrospectivo. Cuando ya ha pasado, todo parece obvio. Apunta antes tus predicciones."
        ]
      },
      fr: {
        name: "Biais rétrospectif", shareTitle: "Le biais rétrospectif en 30 secondes",
        ecline: "Après coup, tout semble évident. Notez d’abord vos prédictions.",
        hd0: "FINALE · 21:00", hd1: "FINALE · FIN DU MATCH", home: "Domicile", away: "Extérieur",
        why: "pourquoi c’était évident :", reasons: ["Buteur en forme", "Meilleure défense", "Public à domicile"],
        dial: "chances de gagner à domicile", hind: "après coup",
        noteH: "20:45 · avant le match", noteL: "Victoire à domicile :", mark: "votre note",
        caps: [
          "Avant la finale, pour vous, c’est <b>à pile ou face</b>.",
          "Vous donneriez environ <b>50 %</b> de chances à l’équipe qui reçoit.",
          "Coup de sifflet final : l’équipe qui reçoit gagne <b>3–1</b>.",
          "Maintenant, la victoire semble <b>évidente</b>. Vous listez les raisons.",
          "Votre mémoire retouche votre pronostic en douce : « J’en étais <b>sûr à 80 %</b>. »",
          "Après coup, le passé paraît <b>plus prévisible</b> qu’il ne l’était.",
          "<b>La solution :</b> notez vos prédictions, avec votre degré de certitude.",
          "Relisez votre note : <b>50 %</b>. Apprenez de ce que vous pensiez vraiment."
        ],
        say: [
          "Avant la finale, pour vous, c’est à pile ou face.",
          "Vous donneriez environ cinquante pour cent de chances à l’équipe qui reçoit.",
          "Coup de sifflet final. L’équipe qui reçoit gagne, trois à un.",
          "Maintenant, la victoire semble évidente. Vous listez les raisons.",
          "Votre mémoire retouche votre pronostic en douce. J’en étais sûr à quatre-vingts pour cent.",
          "Après coup, le passé paraît plus prévisible qu’il ne l’était.",
          "La solution : notez vos prédictions, avec votre degré de certitude.",
          "Relisez votre note : cinquante pour cent. Apprenez de ce que vous pensiez vraiment.",
          "Le biais rétrospectif. Après coup, tout semble évident. Notez d’abord vos prédictions."
        ]
      },
      de: {
        name: "Rückschaufehler", shareTitle: "Der Rückschaufehler in 30 Sekunden",
        ecline: "Im Nachhinein wirkt alles offensichtlich. Schreib deine Prognosen vorher auf.",
        hd0: "FINALE · 21:00", hd1: "FINALE · ENDSTAND", home: "Heim", away: "Gast",
        why: "warum es klar war:", reasons: ["Stürmer in Form", "Bessere Abwehr", "Heimpublikum"],
        dial: "Chance auf Heimsieg", hind: "im Nachhinein",
        noteH: "20:45 · vor dem Anpfiff", noteL: "Heimsieg:", mark: "Notiz",
        caps: [
          "Vor dem Finale hältst du das Spiel für <b>völlig offen</b>.",
          "Du gibst der Heimmannschaft etwa <b>50 %</b>.",
          "Abpfiff: Die Heimmannschaft gewinnt <b>3:1</b>.",
          "Jetzt wirkt der Sieg <b>offensichtlich</b>. Du zählst die Gründe auf.",
          "Dein Gedächtnis ändert still deinen Tipp: „Ich war mir <b>zu 80 % sicher</b>.“",
          "Im Nachhinein wirkt die Vergangenheit <b>vorhersehbarer</b>, als sie war.",
          "<b>Die Lösung:</b> Schreib Prognosen auf und notiere, wie sicher du bist.",
          "Schau auf deine Notiz: <b>50 %</b>. Lerne aus dem, was du wirklich gedacht hast."
        ],
        say: [
          "Vor dem Finale hältst du das Spiel für völlig offen.",
          "Du gibst der Heimmannschaft etwa fünfzig Prozent.",
          "Abpfiff. Die Heimmannschaft gewinnt, drei zu eins.",
          "Jetzt wirkt der Sieg offensichtlich. Du zählst die Gründe auf.",
          "Dein Gedächtnis ändert still deinen Tipp. Ich war mir zu achtzig Prozent sicher.",
          "Im Nachhinein wirkt die Vergangenheit vorhersehbarer, als sie war.",
          "Die Lösung: Schreib Prognosen auf und notiere, wie sicher du bist.",
          "Schau auf deine Notiz: fünfzig Prozent. Lerne aus dem, was du wirklich gedacht hast.",
          "Der Rückschaufehler. Im Nachhinein wirkt alles offensichtlich. Schreib deine Prognosen vorher auf."
        ]
      },
      it: {
        name: "Bias del senno di poi", shareTitle: "Il bias del senno di poi in 30 secondi",
        ecline: "A cose fatte, tutto sembra ovvio. Scrivi prima le tue previsioni.",
        hd0: "FINALE · 21:00", hd1: "FINALE · FINE PARTITA", home: "Casa", away: "Ospiti",
        why: "perché era ovvio:", reasons: ["Attaccante in forma", "Difesa migliore", "Tifo di casa"],
        dial: "chance di vittoria in casa", hind: "senno di poi",
        noteH: "20:45 · prima della gara", noteL: "Vittoria in casa:", mark: "la nota",
        caps: [
          "Prima della finale, la partita ti sembra <b>in bilico</b>.",
          "Daresti alla squadra di casa circa il <b>50%</b>.",
          "Fischio finale: la squadra di casa vince <b>3–1</b>.",
          "Ora la vittoria sembra <b>ovvia</b>. Elenchi i motivi.",
          "La tua memoria ritocca in silenzio la tua stima: «Ero <b>sicuro all’80%</b>».",
          "Col senno di poi, il passato sembra <b>più prevedibile</b> di quanto fosse.",
          "<b>La soluzione:</b> scrivi le previsioni, con il tuo grado di certezza.",
          "Controlla la nota: <b>50%</b>. Impara da ciò che pensavi davvero."
        ],
        say: [
          "Prima della finale, la partita ti sembra in bilico.",
          "Daresti alla squadra di casa circa il cinquanta per cento.",
          "Fischio finale. La squadra di casa vince, tre a uno.",
          "Ora la vittoria sembra ovvia. Elenchi i motivi.",
          "La tua memoria ritocca in silenzio la tua stima. Ero sicuro all’ottanta per cento.",
          "Col senno di poi, il passato sembra più prevedibile di quanto fosse.",
          "La soluzione: scrivi le previsioni, con il tuo grado di certezza.",
          "Controlla la nota: cinquanta per cento. Impara da ciò che pensavi davvero.",
          "Il bias del senno di poi. A cose fatte, tutto sembra ovvio. Scrivi prima le tue previsioni."
        ]
      }
    },
    svg(T) {
      // dial: track, ticks every 10, end labels
      let ticks = "";
      for (let v = 0; v <= 100; v += 10) {
        const big = v % 50 === 0;
        ticks += `<path class="hb-tk${big ? " b" : ""}" d="${radial(v, R - 8, R - (big ? 18 : 13))}"/>`;
      }
      const [l0x, l0y] = pt(0, R), [l1x] = pt(100, R);
      const needle = cls => `<line class="hb-nd${cls}" x1="${CX}" y1="${CY}" x2="${CX - R + 14}" y2="${CY}"/>`;
      const cards = T.reasons.map((r, i) => `<g class="hb-card" data-k="r${i}"><rect x="14" y="${CARD[i]}" width="170" height="22" rx="6"/>
          <path d="M24 ${CARD[i] + 11.5} l3.5 3.5 l6.5 -7.5"/><text x="40" y="${CARD[i] + 15}">${r}</text></g>`).join("");
      return `
        <g data-k="sb" class="hb-sb"><rect x="12" y="12" width="176" height="72" rx="8"/><line x1="12" y1="35" x2="188" y2="35"/>
          <text class="hb-hd" data-k="hd0" x="100" y="27">${T.hd0}</text><text class="hb-hd" data-k="hd1" x="100" y="27">${T.hd1}</text>
          <text class="hb-sc" data-k="sh" x="56" y="64">0</text><text class="hb-sc w" data-k="shw" x="56" y="64">3</text>
          <text class="hb-dash" x="100" y="61">–</text>
          <text class="hb-sc" data-k="sa" x="144" y="64">0</text>
          <text class="hb-team" x="56" y="77">${T.home}</text><text class="hb-team" x="144" y="77">${T.away}</text></g>
        <g data-k="rs"><text class="hb-why" data-k="why" x="16" y="108">${T.why}</text>${cards}</g>
        <g class="hb-note" data-k="note"><rect class="pa" x="-82" y="-36" width="164" height="72" rx="4"/>
          <rect class="tape" x="-20" y="-42" width="40" height="12" rx="2" transform="rotate(4)"/>
          <text class="h" x="-70" y="-16">${T.noteH}</text><text class="l" x="-70" y="2">${T.noteL}</text>
          <g data-k="nv"><text class="v" x="-70" y="26">50%</text><path class="ul" data-k="ul" d="${UL}"/></g>
          <g data-k="nvok"><text class="v ok" x="-70" y="26">50%</text><path class="ul ok" d="${UL}"/></g></g>
        <g data-k="bub">
          <rect class="hb-bub" x="200" y="12" width="186" height="184" rx="22"/>
          <circle class="hb-bub" cx="350" cy="206" r="4"/><circle class="hb-bub" cx="357" cy="216" r="2.6"/>
          <path class="hb-track" d="${arc(0, 100, R)}"/>${ticks}
          <text class="hb-tl" x="${l0x}" y="${l0y + 17}">0%</text><text class="hb-tl" x="${l1x}" y="${l0y + 17}">100%</text>
          <path class="hb-wedge" data-k="wedge"/>
          <path class="hb-br" data-k="br"/><text class="hb-brt" data-k="brt" x="336" y="48">${T.hind}</text>
          <path class="hb-ghost" data-k="ghost" d="${radial(50, 0, R - 14)}"/>
          <g data-k="ndl">${needle("")}<g data-k="ndok">${needle(" ok")}</g></g>
          <circle class="hb-hub" data-k="hub" cx="${CX}" cy="${CY}" r="5"/>
          <text class="hb-ro" data-k="qm" x="${CX}" y="${CY + 34}">?</text>
          <text class="hb-ro" data-k="ro" x="${CX}" y="${CY + 34}">50%</text><text class="hb-ro ok" data-k="rook" x="${CX}" y="${CY + 34}">50%</text>
          <text class="hb-lab" data-k="lab" x="${CX}" y="${CY + 50}">${T.dial}</text>
          <path class="hb-check" data-k="check" d=""/>
        </g>
        <g class="hb-mk" data-k="mk"><rect x="-21" y="-10" width="42" height="20" rx="10"/><path d="M-5 9.5 L0 15 L5 9.5 Z"/><text y="4">50%</text></g>
        <text class="hb-mkt" data-k="mkt" x="${CX - 27}" y="${MK1[1] + 3.5}">${T.mark}</text>
        <g class="hb-man" data-k="man"><circle cx="368" cy="233" r="8"/><path d="M352 262 V257 a16 13 0 0 1 32 0 V262"/></g>`;
    },
    S0: { sb: 0, ft: 0, home: 0, away: 0, win: 0, man: 0, bub: 0, nd: 0, v: 50, qm: 0, ro: 0,
      why: 0, r0: 0, r1: 0, r2: 0, rOut: 0, ghost: 0, wedge: 0, br: 0, brt: 0, mk: 0, note: 0, nv: 0, okNote: 0, ok: 0, check: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = v; };
      // scoreboard
      const s = .9 + .1 * S.sb;
      k("sb").setAttribute("transform", `translate(100 48) scale(${f1(s * 100) / 100}) translate(-100 -48)`);
      op("sb", clamp(S.sb * 1.5));
      op("hd0", 1 - S.ft); op("hd1", S.ft);
      k("sh").textContent = Math.floor(S.home + 1e-6); k("sa").textContent = Math.floor(S.away + 1e-6);
      op("sh", 1 - S.win); op("shw", S.win);
      // you, and the dial in your head
      op("man", S.man);
      k("bub").setAttribute("transform", `translate(${f1(8 * (1 - S.bub))} ${f1(8 * (1 - S.bub))})`);
      op("bub", S.bub);
      k("ndl").setAttribute("transform", `rotate(${f1(S.v * 1.8)} ${CX} ${CY})`);
      op("ndl", S.nd); op("ndok", S.ok);
      op("ghost", S.ghost);
      op("qm", S.qm * (1 - S.ro));
      const val = Math.round(S.v) + "%";
      k("ro").textContent = val; k("rook").textContent = val;
      op("ro", S.ro * (1 - S.ok)); op("rook", S.ro * S.ok); op("lab", S.ro);
      // the hindsight gap: from the forgotten 50 to wherever the needle is now
      const hi = Math.max(50.01, S.v);
      const [ax, ay] = pt(50, R - 14), [bx, by] = pt(hi, R - 14);
      k("wedge").setAttribute("d", `M${CX} ${CY} L${ax} ${ay} A${R - 14} ${R - 14} 0 0 1 ${bx} ${by} Z`);
      op("wedge", S.wedge);
      k("br").setAttribute("d", `${arc(50, hi, R + 9)} ${radial(50, R + 5, R + 13)} ${radial(hi, R + 5, R + 13)}`);
      op("br", S.br); op("brt", S.brt);
      // reasons found after the fact
      op("why", S.why);
      for (let i = 0; i < 3; i++) {
        const p = S["r" + i];
        k("r" + i).setAttribute("transform", `translate(${f1(-14 * (1 - p))} 0)`);
        op("r" + i, p);
      }
      op("rs", 1 - S.rOut);
      // the note, written before kick-off
      const np = S.note;
      k("note").setAttribute("transform", `translate(${NX} ${f1(NY + 18 * (1 - np))}) rotate(${f1(-2 - 5 * (1 - np))})`);
      op("note", clamp(np * 1.6));
      op("nv", clamp(S.nv * 2) * (1 - S.okNote));
      const ul = k("ul"); ul.style.strokeDasharray = "60"; ul.style.strokeDashoffset = f1(60 * (1 - clamp(S.nv * 1.4 - .4)));
      op("nvok", S.okNote);
      // the written 50% travels from the note to the dial
      const m = S.mk, e = m < .5 ? 2 * m * m : 1 - Math.pow(-2 * m + 2, 2) / 2;
      const mx = MK0[0] + (MK1[0] - MK0[0]) * e, my = MK0[1] + (MK1[1] - MK0[1]) * e - 10 * Math.sin(Math.PI * e);
      k("mk").setAttribute("transform", `translate(${f1(mx)} ${f1(my)})`);
      op("mk", clamp(m * 4)); op("mkt", clamp(m * 3 - 2));
      // the check, beside the readout
      const cx = CX + 30, cy = CY + 27;
      k("check").setAttribute("d", `M${cx} ${cy} l3.5 3.5 l7 -8`);
      k("check").style.strokeDasharray = "18"; k("check").style.strokeDashoffset = f1(18 * (1 - S.check));
      op("check", S.check > 0 ? 1 : 0);
    },
    beats: [
      { steps: [{ to: { sb: 1 }, ms: 500, ease: "out", sfx: "pluck" }, { to: { man: 1 }, ms: 300 }, { to: { bub: 1, qm: 1 }, ms: 500 },
        { to: { nd: 1 }, ms: 200 }, { to: { v: 30 }, ms: 450, ease: "inOut" }, { to: { v: 68 }, ms: 650, ease: "inOut" }, { to: { v: 40 }, ms: 550, ease: "inOut" }] },
      { steps: [{ to: { v: 50 }, ms: 600, ease: "out" }, { to: { ro: 1 }, ms: 400, sfx: "tick" }] },
      { steps: [{ to: { ft: 1 }, ms: 300 }, { wait: 200 }, { to: { home: 1 } }, { wait: 350 }, { to: { home: 2 } }, { wait: 350 },
        { to: { away: 1 } }, { wait: 350 }, { to: { home: 3 } }, { to: { win: 1 }, ms: 400, sfx: "pop" }] },
      { steps: [{ to: { why: 1 }, ms: 300 }, { to: { r0: 1 }, ms: 400, sfx: "scribble" }, { wait: 250 }, { to: { r1: 1 }, ms: 400 }, { wait: 250 }, { to: { r2: 1 }, ms: 400 }] },
      { steps: [{ to: { ghost: 1 } }, { to: { v: 80 }, ms: 1300, ease: "inOut", sfx: "spring" }, { to: { ghost: .5 }, ms: 600 }], hold: 3000 },
      { steps: [{ to: { wedge: 1 }, ms: 500, sfx: "tick" }, { to: { br: 1, brt: 1 }, ms: 400 }] },
      { steps: [{ to: { rOut: 1 }, ms: 400 }, { to: { note: 1 }, ms: 600, ease: "out" }, { to: { nv: 1 }, ms: 800, ease: "lin", sfx: "scribble" }], hold: 3000 },
      { steps: [{ to: { okNote: 1 }, ms: 400 }, { to: { mk: 1, brt: 0 }, ms: 800, ease: "lin" }, { wait: 150 },
        { to: { v: 50, ghost: 0 }, ms: 700, ease: "out" }, { to: { wedge: 0, br: 0 }, ms: 300 },
        { to: { ok: 1 }, ms: 400 }, { to: { check: 1 }, ms: 350, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
