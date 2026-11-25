/* Gambler's fallacy: a roulette wheel lands on red five times running, black feels due, and
   you bet big on it. The wheel has no memory: the chances are the same every spin.
   Every spin is fixed, so every recording is identical. Scene for anim.js. */
(function () {
  const KEY = "gamblers-fallacy", P = `.bp[data-scene="${KEY}"]`;
  const WX = 100, WY = 138;                          // wheel centre
  const R_RIM = 88, R_TRK = 76, R_IN = 58;            // rim, inner edge of the ball track, inner edge of the pockets
  const R_BALL = 82, R_POCKET = 67;                   // ball on the track, ball in a pocket
  const N = 37, A = 360 / N;                          // pockets: 0 is green, then red (odd) and black (even) alternate
  const J = [9, 25, 3, 17, 31, 13];                   // the pocket each spin lands in: all red
  const TURNS = [2, 1, 1, 1, 1, 2], LAPS = [2, 1, 1, 1, 1, 2];   // wheel turns and extra ball laps per spin
  const PD = .6, PW = .82;                            // share of a spin when the ball drops in, when the wheel stops
  const SX = i => 206 + i * 24, SY = 40, DR = 8.5;    // results strip: slot centres, dot radius
  const BB = 80, BH = 20;                             // odds bars: baseline, full height
  const PILE = [314, 244], BET = [270, 229];          // chip stack: your pile, on the black box
  const BUB = { r: 386, y: 136, h: 28 };              // thought bubble: right edge, top, height
  const f1 = n => +n.toFixed(1);
  const clamp = v => Math.max(0, Math.min(1, v));
  const mod = (a, m) => ((a % m) + m) % m;
  const outC = p => 1 - Math.pow(1 - p, 3);
  const inOut = p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const rad = d => d * Math.PI / 180;
  const at = (r, deg) => [f1(r * Math.cos(rad(deg))), f1(r * Math.sin(rad(deg)))];

  // wheel angle at the end of each spin, so the landing pocket ends up at the top
  const WEND = [0], D = [], PHI = J.map(j => j * A - 90);
  J.forEach((j, s) => { const d = TURNS[s] * 360 + mod(-j * A - WEND[s], 360); D.push(d); WEND.push(WEND[s] + d); });
  const wheelAt = (s, p) => { const u = Math.min(1, p / PW); return WEND[s] + D[s] * (1 - (1 - u) * (1 - u)); };
  // how far the ball runs back round the track before it drops into its pocket
  const LAP = J.map((_, s) => mod(-90 - wheelAt(s, PD) - PHI[s], 360) + 360 * LAPS[s]);
  function ballAt(s, p) {
    if (p < PD) {
      const u = p / PD, ang = -90 - LAP[s] * (1 - (1 - u) * (1 - u));
      const r0 = s === 0 ? R_BALL : R_POCKET;
      let r = R_BALL;
      if (p < .08) r = r0 + (R_BALL - r0) * outC(p / .08);
      else if (p > PD - .1) { const q = (p - (PD - .1)) / .1; r = R_BALL - (R_BALL - R_POCKET) * q * q; }
      return [ang, r];
    }
    const hop = p < PD + .07 ? 5 * Math.sin(Math.PI * (p - PD) / .07) : 0;
    return [wheelAt(s, p) + PHI[s], R_POCKET + hop];
  }

  function wheelSvg() {
    let pockets = "";
    for (let j = 0; j < N; j++) {
      const a0 = (j - .5) * A - 90, a1 = (j + .5) * A - 90;
      const [x0, y0] = at(R_TRK, a0), [x1, y1] = at(R_TRK, a1), [x2, y2] = at(R_IN, a1), [x3, y3] = at(R_IN, a0);
      const cls = j === 0 ? "grn" : j % 2 ? "red" : "blk";
      pockets += `<path class="gf-pk ${cls}" d="M${x0} ${y0} A${R_TRK} ${R_TRK} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${R_IN} ${R_IN} 0 0 0 ${x3} ${y3} Z"/>`;
    }
    let arms = "";
    for (let a = 0; a < 360; a += 90) { const [x, y] = at(24, a), [x2, y2] = at(9, a); arms += `<path d="M${x2} ${y2} L${x} ${y}"/><circle cx="${x}" cy="${y}" r="3.2"/>`; }
    return `<circle class="gf-rim" cx="${WX}" cy="${WY}" r="${R_RIM}"/>
      <g data-k="rot" transform="translate(${WX} ${WY})">${pockets}
        <circle class="gf-cone" r="${R_IN}"/><circle class="gf-cone2" r="${R_IN - 12}"/>
        <g class="gf-tur"><circle r="9"/>${arms}</g></g>
      <circle class="gf-trk" cx="${WX}" cy="${WY}" r="${R_TRK}"/>`;
  }

  window.BiasAnim.SCENES[KEY] = {
    q: "nem", viewBox: "0 0 400 272",
    css: `
      ${P} .gf-rim{fill:var(--surface);stroke:var(--ink);stroke-width:2.4}
      ${P} .gf-trk{fill:none;stroke:var(--ink);stroke-width:1.6}
      ${P} .gf-pk{stroke:var(--ink);stroke-width:.9;stroke-linejoin:round}
      ${P} .red{fill:var(--bad)}
      ${P} .blk{fill:var(--ink);fill:light-dark(var(--ink),var(--surface-2))}
      ${P} .grn{fill:var(--good)}
      ${P} .gf-cone{fill:var(--surface);stroke:var(--ink);stroke-width:2}
      ${P} .gf-cone2{fill:none;stroke:var(--rule);stroke-width:1.4}
      ${P} .gf-tur circle,${P} .gf-tur path{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linecap:round}
      ${P} .gf-ball{fill:var(--surface);fill:light-dark(var(--surface),var(--ink));stroke:var(--ink);stroke:light-dark(var(--ink),var(--ground));stroke-width:1.4}
      ${P} .gf-lb{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .gf-lb.c{text-anchor:middle}
      ${P} .gf-lb.q{fill:var(--q)}
      ${P} .gf-dot{stroke-width:1.4}
      ${P} .gf-dot.red{stroke:var(--bad)}
      ${P} .gf-dot.blk,${P} .gf-bar.blk{stroke:var(--ink);stroke:light-dark(var(--ink),var(--muted))}
      ${P} .gf-q circle{fill:none;stroke:var(--q);stroke-width:1.6;stroke-dasharray:2.5 3}
      ${P} .gf-q text{font:700 11px var(--display);fill:var(--q);text-anchor:middle}
      ${P} .gf-hl{fill:none;stroke-width:1.6;stroke-dasharray:3 3}
      ${P} .gf-hl.q{stroke:var(--q)} ${P} .gf-hl.ok{stroke:var(--good)}
      ${P} .gf-nx{font:500 9.5px var(--mono);text-anchor:middle}
      ${P} .gf-nx.q{fill:var(--q)} ${P} .gf-nx.ok{fill:var(--good)}
      ${P} .gf-brk{fill:none;stroke:var(--q);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .gf-bar{stroke-width:1.2}
      ${P} .gf-bar.red{stroke:var(--bad)}
      ${P} .gf-base{stroke:var(--rule);stroke-width:1.6;stroke-linecap:round}
      ${P} .gf-scr{fill:none;stroke:var(--q);stroke-width:2.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .gf-link{fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round;stroke-dasharray:1 4.5}
      ${P} .gf-arr{fill:none;stroke:var(--muted);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .gf-x circle{fill:var(--ground);stroke:var(--q);stroke-width:1.8}
      ${P} .gf-x path{fill:none;stroke:var(--q);stroke-width:2.2;stroke-linecap:round}
      ${P} .gf-box rect{fill:none;stroke:var(--muted);stroke-width:1.6}
      ${P} .gf-box path{stroke-width:1.2;stroke-linejoin:round}
      ${P} .gf-box path.red{stroke:var(--bad)} ${P} .gf-box path.blk{stroke:var(--ink);stroke:light-dark(var(--ink),var(--muted))}
      ${P} .gf-chip{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .gf-chip-t{fill:none;stroke:var(--q);stroke-width:1.2;stroke-dasharray:2 2.6}
      ${P} .gf-you{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .gf-bub rect,${P} .gf-bub circle{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .gf-bub text{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .gf-bub.ok rect,${P} .gf-bub.ok circle{stroke:var(--good)}
      ${P} .gf-bub.ok text{fill:var(--good)}
    `,
    text: {
      hu: {
        name: "A szerencsejátékos tévedése", shareTitle: "A szerencsejátékos tévedése, 30 másodpercben",
        ecline: "A véletlennek nincs emléke. Egy sorozat nem teszi esedékessé a másik kimenetelt.",
        last: "Az utolsó pörgetések", next: "következő", row: "5 egymás után", red: "piros", black: "fekete",
        due: "Fekete esedékes!", kept: "Megtartottam a zsetonjaimat", fresh: "minden pörgetés újrakezdődik", same: "minden pörgetésnél ugyanazok az esélyek",
        caps: [
          "A rulettnél a golyó <b>pirosra</b> áll…",
          "…aztán újra, és újra: <b>öt piros egymás után</b>.",
          "A fekete <b>esedékesnek</b> tűnik. Biztos most jön a sora.",
          "Ezért <b>nagyot tesz feketére</b>.",
          "De a kerék <b>nem emlékszik</b>.",
          "A fekete esélyei <b>ugyanazok</b>, mint bármelyik másik pörgetésnél.",
          "<b>A megoldás:</b> minden pörgetést a saját esélyei alapján ítélj meg, ne a sorozat alapján.",
          "A sorozatok <b>véletlenül</b> történnek. Nem változtatják meg, mi jön ezután."
        ],
        say: [
          "A rulettnél a golyó pirosra áll...",
          "...aztán újra, és újra. Öt piros egymás után.",
          "A fekete esedékesnek tűnik. Biztos most jön a sora.",
          "Ezért nagyot tesz feketére.",
          "De a kerék nem emlékszik.",
          "A fekete esélyei ugyanazok, mint bármelyik másik pörgetésnél.",
          "A megoldás: minden pörgetést a saját esélyei alapján ítélj meg, ne a sorozat alapján.",
          "A sorozatok véletlenül történnek. Nem változtatják meg, mi jön ezután.",
          "A szerencsejátékos tévedése. A véletlennek nincs emléke. Egy sorozat nem teszi esedékessé a másik kimenetelt."
        ]
      },
      en: {
        name: "Gambler's fallacy", shareTitle: "Gambler's fallacy, explained in 30 seconds",
        ecline: "Chance has no memory. A streak doesn't make the other outcome due.",
        last: "Last spins", next: "next", row: "5 in a row", red: "red", black: "black",
        due: "Black is due!", kept: "I kept my chips", fresh: "each spin starts fresh", same: "same chances every spin",
        caps: [
          "At roulette, the ball lands on <b>red</b>…",
          "…then again, and again: <b>five reds in a row</b>.",
          "Black feels <b>overdue</b>. Surely it's its turn now.",
          "So you bet <b>big on black</b>.",
          "But the wheel <b>has no memory</b>.",
          "Black's chances are <b>the same</b> as on every other spin.",
          "<b>The fix:</b> judge each spin on its own odds, not the streak.",
          "Streaks happen <b>by chance</b>. They don't change what comes next."
        ],
        say: [
          "At roulette, the ball lands on red...",
          "...then again, and again. Five reds in a row.",
          "Black feels overdue. Surely it's its turn now.",
          "So you bet big on black.",
          "But the wheel has no memory.",
          "Black's chances are the same as on every other spin.",
          "The fix: judge each spin on its own odds, not the streak.",
          "Streaks happen by chance. They don't change what comes next.",
          "The gambler's fallacy. Chance has no memory. A streak doesn't make the other outcome due."
        ]
      },
      el: {
        name: "Πλάνη του τζογαδόρου", shareTitle: "Η πλάνη του τζογαδόρου σε 30 δευτερόλεπτα",
        ecline: "Η τύχη δεν έχει μνήμη. Ένα σερί δεν σημαίνει ότι ήρθε η σειρά του άλλου αποτελέσματος.",
        last: "Τελευταίοι γύροι", next: "επόμενος", row: "5 στη σειρά", red: "κόκκινο", black: "μαύρο",
        due: "Σειρά έχει το μαύρο!", kept: "Κράτησα τις μάρκες μου", fresh: "κάθε γύρος, νέα αρχή", same: "ίδιες πιθανότητες σε κάθε γύρο",
        caps: [
          "Στη ρουλέτα, η μπίλια πέφτει στο <b>κόκκινο</b>…",
          "…ξανά και ξανά: <b>πέντε κόκκινα στη σειρά</b>.",
          "Νιώθεις ότι το μαύρο <b>έχει αργήσει</b>. Τώρα σίγουρα είναι η σειρά του.",
          "Κι έτσι ποντάρεις <b>χοντρά στο μαύρο</b>.",
          "Όμως η ρουλέτα <b>δεν έχει μνήμη</b>.",
          "Το μαύρο έχει <b>τις ίδιες πιθανότητες</b> που είχε και σε κάθε άλλο γύρο.",
          "<b>Η λύση:</b> κρίνε κάθε γύρο με βάση τις δικές του πιθανότητες, όχι το σερί.",
          "Τα σερί συμβαίνουν <b>τυχαία</b>. Δεν\u00a0επηρεάζουν το επόμενο αποτέλεσμα."
        ],
        say: [
          "Στη ρουλέτα, η μπίλια πέφτει στο κόκκινο...",
          "...ξανά και ξανά. Πέντε κόκκινα στη σειρά.",
          "Νιώθεις ότι το μαύρο έχει αργήσει. Τώρα σίγουρα είναι η σειρά του.",
          "Κι έτσι ποντάρεις χοντρά στο μαύρο.",
          "Όμως η ρουλέτα δεν έχει μνήμη.",
          "Το μαύρο έχει τις ίδιες πιθανότητες που είχε και σε κάθε άλλο γύρο.",
          "Η λύση: κρίνε κάθε γύρο με βάση τις δικές του πιθανότητες, όχι το σερί.",
          "Τα σερί συμβαίνουν τυχαία. Δεν επηρεάζουν το επόμενο αποτέλεσμα.",
          "Πλάνη του τζογαδόρου. Η τύχη δεν έχει μνήμη. Ένα σερί δεν σημαίνει ότι ήρθε η σειρά του άλλου αποτελέσματος."
        ]
      },
      es: {
        name: "Falacia del jugador", shareTitle: "La falacia del jugador en 30 segundos",
        ecline: "El azar no tiene memoria. Una racha no hace que ahora le toque al otro resultado.",
        last: "Últimas tiradas", next: "siguiente", row: "5 seguidos", red: "rojo", black: "negro",
        due: "¡Toca negro!", kept: "Guardé mis fichas", fresh: "cada tirada parte de cero", same: "mismas probabilidades siempre",
        caps: [
          "En la ruleta, la bola cae en <b>rojo</b>…",
          "…y otra vez, y otra más: <b>cinco rojos seguidos</b>.",
          "Sientes que al negro <b>ya le toca</b>. Seguro que ahora sale.",
          "Así que apuestas <b>fuerte al negro</b>.",
          "Pero la ruleta <b>no tiene memoria</b>.",
          "El negro tiene <b>las mismas</b> probabilidades que en cualquier otra tirada.",
          "<b>La solución:</b> juzga cada tirada por sus propias probabilidades, no por la racha.",
          "Las rachas ocurren <b>por azar</b>. No cambian lo que viene después."
        ],
        say: [
          "En la ruleta, la bola cae en rojo...",
          "...y otra vez, y otra más. Cinco rojos seguidos.",
          "Sientes que al negro ya le toca. Seguro que ahora sale.",
          "Así que apuestas fuerte al negro.",
          "Pero la ruleta no tiene memoria.",
          "El negro tiene las mismas probabilidades que en cualquier otra tirada.",
          "La solución: juzga cada tirada por sus propias probabilidades, no por la racha.",
          "Las rachas ocurren por azar. No cambian lo que viene después.",
          "La falacia del jugador. El azar no tiene memoria. Una racha no hace que ahora le toque al otro resultado."
        ]
      },
      fr: {
        name: "Erreur du parieur", shareTitle: "L’erreur du parieur en 30 secondes",
        ecline: "Le hasard n’a pas de mémoire. Une série ne rend pas l’autre résultat plus probable.",
        last: "Derniers tours", next: "suivant", row: "5 d’affilée", red: "rouge", black: "noir",
        due: "Le noir doit sortir !", kept: "J’ai gardé mes jetons", fresh: "chaque tour repart de zéro", same: "mêmes chances à chaque tour",
        caps: [
          "À la roulette, la bille tombe sur le <b>rouge</b>…",
          "…puis encore, et encore : <b>cinq rouges d’affilée</b>.",
          "Le noir semble <b>en retard</b>. C’est sûrement son tour.",
          "Alors vous misez <b>gros sur le noir</b>.",
          "Mais la roulette <b>n’a pas de mémoire</b>.",
          "Le noir a <b>les mêmes chances</b> qu’à n’importe quel autre tour.",
          "<b>La solution :</b> jugez chaque tour selon ses propres chances, pas selon la série.",
          "Les séries arrivent <b>par hasard</b>. Elles ne changent rien à la suite."
        ],
        say: [
          "À la roulette, la bille tombe sur le rouge...",
          "...puis encore, et encore. Cinq rouges d’affilée.",
          "Le noir semble en retard. C’est sûrement son tour.",
          "Alors vous misez gros sur le noir.",
          "Mais la roulette n’a pas de mémoire.",
          "Le noir a les mêmes chances qu’à n’importe quel autre tour.",
          "La solution : jugez chaque tour selon ses propres chances, pas selon la série.",
          "Les séries arrivent par hasard. Elles ne changent rien à la suite.",
          "L’erreur du parieur. Le hasard n’a pas de mémoire. Une série ne rend pas l’autre résultat plus probable."
        ]
      },
      de: {
        name: "Spielerfehlschluss", shareTitle: "Der Spielerfehlschluss in 30 Sekunden",
        ecline: "Der Zufall hat kein Gedächtnis. Nach einer Serie ist das andere Ergebnis nicht überfällig.",
        last: "Letzte Runden", next: "nächste", row: "5-mal in Folge", red: "Rot", black: "Schwarz",
        due: "Schwarz ist dran!", kept: "Ich behalte meine Jetons", fresh: "jede Runde fängt neu an", same: "jede Runde gleiche Chancen",
        caps: [
          "Beim Roulette landet die Kugel auf <b>Rot</b>…",
          "…dann wieder und wieder: <b>fünfmal Rot in Folge</b>.",
          "Schwarz scheint <b>überfällig</b>. Jetzt muss es doch drankommen.",
          "Also setzt du <b>viel auf Schwarz</b>.",
          "Aber das Rad <b>hat kein Gedächtnis</b>.",
          "Die Chancen für Schwarz sind <b>dieselben</b> wie bei jeder anderen Runde.",
          "<b>Die Lösung:</b> Beurteile jede Runde nach ihren eigenen Chancen, nicht nach der Serie.",
          "Serien entstehen <b>durch Zufall</b>. Sie ändern nichts an dem, was als Nächstes kommt."
        ],
        say: [
          "Beim Roulette landet die Kugel auf Rot...",
          "...dann wieder und wieder. Fünfmal Rot in Folge.",
          "Schwarz scheint überfällig. Jetzt muss es doch drankommen.",
          "Also setzt du viel auf Schwarz.",
          "Aber das Rad hat kein Gedächtnis.",
          "Die Chancen für Schwarz sind dieselben wie bei jeder anderen Runde.",
          "Die Lösung: Beurteile jede Runde nach ihren eigenen Chancen, nicht nach der Serie.",
          "Serien entstehen durch Zufall. Sie ändern nichts an dem, was als Nächstes kommt.",
          "Der Spielerfehlschluss. Der Zufall hat kein Gedächtnis. Nach einer Serie ist das andere Ergebnis nicht überfällig."
        ]
      },
      it: {
        name: "Fallacia del giocatore", shareTitle: "La fallacia del giocatore in 30 secondi",
        ecline: "Il caso non ha memoria. Una serie non fa sì che ora tocchi all’altro risultato.",
        last: "Ultimi giri", next: "prossimo", row: "5 di fila", red: "rosso", black: "nero",
        due: "Tocca al nero!", kept: "Ho tenuto le fiches", fresh: "ogni giro riparte da zero", same: "stesse probabilità sempre",
        caps: [
          "Alla roulette, la pallina finisce sul <b>rosso</b>…",
          "…e poi ancora, e ancora: <b>cinque rossi di fila</b>.",
          "Il nero sembra <b>in ritardo</b>. Ormai deve toccare a lui.",
          "Così punti <b>forte sul nero</b>.",
          "Ma la ruota <b>non ha memoria</b>.",
          "Le probabilità del nero sono <b>le stesse</b> di ogni altro giro.",
          "<b>La soluzione:</b> valuta ogni giro per le sue probabilità, non per la serie.",
          "Le serie capitano <b>per caso</b>. Non cambiano ciò che viene dopo."
        ],
        say: [
          "Alla roulette, la pallina finisce sul rosso...",
          "...e poi ancora, e ancora. Cinque rossi di fila.",
          "Il nero sembra in ritardo. Ormai deve toccare a lui.",
          "Così punti forte sul nero.",
          "Ma la ruota non ha memoria.",
          "Le probabilità del nero sono le stesse di ogni altro giro.",
          "La soluzione: valuta ogni giro per le sue probabilità, non per la serie.",
          "Le serie capitano per caso. Non cambiano ciò che viene dopo.",
          "La fallacia del giocatore. Il caso non ha memoria. Una serie non fa sì che ora tocchi all’altro risultato."
        ]
      }
    },
    svg(T) {
      let dots = "", bars = "";
      for (let i = 0; i < 6; i++) dots += `<circle class="gf-dot red" data-k="d${i}" r="${DR}"/>`;
      for (let i = 0; i < 7; i++) bars += `<rect class="gf-bar red" data-k="br${i}" x="${SX(i) - 8}" width="7"/><rect class="gf-bar blk" data-k="bb${i}" x="${SX(i) + 1}" width="7"/>`;
      const strike = `M${SX(0) - 15} ${SY + 4} L${SX(4) + 10} ${SY - 3.5}`;
      let chips = "";
      for (let c = 0; c < 6; c++) chips += `<ellipse class="gf-chip" cx="0" cy="${-c * 4.5}" rx="10" ry="3.8"/>`;
      chips += `<ellipse class="gf-chip-t" cx="0" cy="${-5 * 4.5}" rx="6.5" ry="2.2"/>`;
      const box = (x, cls, word) => `<g class="gf-box"><rect x="${x}" y="206" width="44" height="32" rx="4"/>
        <path class="${cls}" d="M${x + 8} 222 L${x + 22} 213 L${x + 36} 222 L${x + 22} 231 Z"/></g>
        <text class="gf-lb c" x="${x + 22}" y="251">${word}</text>`;
      const bubble = (key, cls, txt) => `<g class="gf-bub ${cls}" data-k="${key}"><rect data-k="${key}r" y="${BUB.y}" height="${BUB.h}" rx="12"/>
        <circle cx="354" cy="173" r="3.4"/><circle cx="359.5" cy="184" r="2.1"/><text data-k="${key}t" y="${BUB.y + 18.5}">${txt}</text></g>`;
      const [lx, ly] = [WX + 60, WY - 70];
      return `
        <g data-k="wheel">${wheelSvg()}
          <circle class="gf-ball" data-k="ball" r="5"/></g>
        <text class="gf-lb q c" data-k="fresh" x="${WX}" y="249">${T.fresh}</text>
        <g data-k="link"><path class="gf-link" d="M${SX(0) - 13} ${SY + 4} Q176 48 ${lx + 3} ${ly - 2}"/>
          <path class="gf-arr" d="M${lx + 3} ${ly - 11} L${lx + 1} ${ly} L${lx + 12} ${ly - 3}"/></g>
        <g class="gf-x" data-k="cut"><circle r="7.5"/><path d="M-3.2 -3.2 L3.2 3.2 M3.2 -3.2 L-3.2 3.2"/></g>
        <text class="gf-lb" data-k="last" x="${SX(0) - DR}" y="20">${T.last}</text>
        <g data-k="brk"><path class="gf-brk" d="M${SX(0) - DR} 53 V57 H${SX(4) + DR} V53"/><text class="gf-lb q c" x="${(SX(0) + SX(4)) / 2}" y="70">${T.row}</text></g>
        <line class="gf-base" data-k="base" x1="${SX(0) - 11}" y1="${BB}" y2="${BB}"/>
        ${bars}
        <text class="gf-lb q c" data-k="same" x="${(SX(0) + SX(6)) / 2}" y="100">${T.same}</text>
        <g data-k="nx">
          <rect class="gf-hl q" data-k="hlq" x="-11.5" y="28" width="23" height="58" rx="6"/>
          <rect class="gf-hl ok" data-k="hlg" x="-11.5" y="28" width="23" height="58" rx="6"/>
          <g class="gf-q" data-k="qm"><circle cy="${SY}" r="${DR}"/><text y="${SY + 4}">?</text></g>
          <text class="gf-nx q" data-k="nxq" y="20">${T.next}</text><text class="gf-nx ok" data-k="nxg" y="20">${T.next}</text>
        </g>
        ${dots}
        <path class="gf-scr" data-k="scr" pathLength="1" stroke-dasharray="1 1" d="${strike}"/>
        <g data-k="tbl">
          ${box(196, "red", T.red)}${box(248, "blk", T.black)}
          <circle class="gf-you" cx="364" cy="204" r="11"/><path class="gf-you" d="M342 256 C342 238 352 228 364 228 C376 228 386 238 386 256"/>
        </g>
        <g data-k="chips">${chips}</g>
        ${bubble("bub", "", T.due)}${bubble("bub2", "ok", T.kept)}`;
    },
    S0: { wh: 0, tbl: 0, last: 0, spin: 0, brk: 0, bub: 0, nxt: 0, bet: 0, link: 0, cut: 0, dim: 0, fresh: 0,
      bars: 0, same: 0, hl: 0, scr: 0, fix: 0, nx2: 0, bub2: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = clamp(v); };
      op("wheel", S.wh); op("tbl", S.tbl); op("last", S.last);
      // the wheel and the ball: spin s runs while S.spin goes from s to s + 1
      const s = Math.max(0, Math.min(5, Math.floor(S.spin))), p = S.spin >= 6 ? 1 : Math.max(0, S.spin - s);
      k("rot").setAttribute("transform", `translate(${WX} ${WY}) rotate(${f1(wheelAt(s, p) % 360)})`);
      const [ba, br] = ballAt(s, p), [bx, by] = at(br, ba);
      const ball = k("ball"); ball.setAttribute("cx", f1(WX + bx)); ball.setAttribute("cy", f1(WY + by));
      // each result flies from the ball's pocket to its slot in the strip once the wheel stops
      for (let i = 0; i < 6; i++) {
        const q = clamp((S.spin - i - PW) / (1 - PW)), e = inOut(q), d = k("d" + i);
        const x0 = WX, y0 = WY - R_POCKET, x1 = SX(i), y1 = SY, cx = (x0 + x1) / 2, cy = 4;
        const x = (1 - e) * (1 - e) * x0 + 2 * (1 - e) * e * cx + e * e * x1, y = (1 - e) * (1 - e) * y0 + 2 * (1 - e) * e * cy + e * e * y1;
        d.setAttribute("cx", f1(x)); d.setAttribute("cy", f1(y)); d.setAttribute("r", f1(DR * (.6 + .4 * e)));
        op("d" + i, (q > 0 ? 1 : 0) * (i < 5 ? 1 - .55 * S.dim : 1));
      }
      op("brk", S.brk);
      // the next spin: a "?" slot that moves on once the sixth result lands
      const q5 = clamp((S.spin - 5 - PW) / (1 - PW));
      k("nx").setAttribute("transform", `translate(${f1(SX(5) + 24 * S.nx2)} 0)`);
      op("qm", S.nxt * (S.nx2 > 0 ? S.nx2 * 1.5 : 1 - q5 * 1.5));
      op("nxq", S.nxt * (1 - S.fix)); op("nxg", S.nxt * S.fix);
      op("hlq", S.hl * (1 - S.fix)); op("hlg", S.hl * S.fix);
      // equal odds bars under every slot
      for (let i = 0; i < 7; i++) {
        const h = f1(BH * outC(clamp(S.bars - i)));
        for (const key of ["br" + i, "bb" + i]) { const r = k(key); r.setAttribute("y", f1(BB - h)); r.setAttribute("height", h); r.style.opacity = h > .3 ? 1 : 0; }
      }
      const base = k("base"); base.setAttribute("x2", f1(SX(5) + 11 + 24 * clamp(S.bars - 6)));
      op("base", S.bars * 2);
      op("same", S.same);
      k("scr").setAttribute("stroke-dashoffset", f1(1 - S.scr));
      op("scr", S.scr > .005 ? 1 : 0);
      // "the wheel has no memory": the link from the strip is cut
      op("link", S.link * (1 - .4 * S.cut));
      const cs = Math.max(.001, S.cut);
      k("cut").setAttribute("transform", `translate(177 51.5) scale(${f1(cs)})`);
      op("cut", S.cut * 3);
      op("fresh", S.fresh);
      // chips slide onto black, and back
      const e = S.bet, cx = PILE[0] + (BET[0] - PILE[0]) * e, cy = PILE[1] + (BET[1] - PILE[1]) * e - 14 * Math.sin(Math.PI * e);
      k("chips").setAttribute("transform", `translate(${f1(cx)} ${f1(cy)})`);
      op("chips", S.tbl);
      // thought bubbles, sized to their text
      for (const [key, v] of [["bub", S.bub], ["bub2", S.bub2]]) {
        const t = k(key + "t"), w = (t.getComputedTextLength ? t.getComputedTextLength() : 120) + 26;
        const r = k(key + "r"); r.setAttribute("x", f1(BUB.r - w)); r.setAttribute("width", f1(w));
        t.setAttribute("x", f1(BUB.r - w / 2));
        const sc = .7 + .3 * clamp(v);
        k(key).setAttribute("transform", `translate(356 170) scale(${f1(sc * 100) / 100}) translate(-356 -170)`);
        op(key, v * 1.6);
      }
    },
    beats: [
      { steps: [{ to: { wh: 1, tbl: 1, last: 1 }, ms: 500 }, { wait: 150 },
        { to: { spin: PW }, ms: 2000, ease: "lin", sfx: "whoosh" }, { to: { spin: 1 }, ms: 440, ease: "lin", sfx: "tick" }], hold: 2200 },
      { steps: [{ to: { spin: 5 }, ms: 3000, ease: "lin", sfx: "whoosh" }, { to: { brk: 1 }, ms: 400 }] },
      { steps: [{ to: { bub: 1 }, ms: 450, ease: "out", sfx: "pop" }, { wait: 250 }, { to: { nxt: 1 }, ms: 400 }] },
      { steps: [{ to: { bet: 1 }, ms: 800, ease: "inOut", sfx: "thud", sfxAt: 650 }] },
      { steps: [{ to: { link: 1 }, ms: 500 }, { wait: 250 }, { to: { cut: 1, dim: 1, bub: .4 }, ms: 600, ease: "out", sfx: "spring" }, { to: { fresh: 1 }, ms: 400 }] },
      { steps: [{ to: { brk: 0 }, ms: 300 }, { to: { bars: 6, hl: 1 }, ms: 1500, ease: "lin" }, { to: { same: 1 }, ms: 400 }] },
      { steps: [{ to: { scr: 1 }, ms: 900, sfx: "scribble" }, { to: { fix: 1, bub: 0 }, ms: 400 }, { to: { bet: 0 }, ms: 700, ease: "inOut" }], hold: 2800 },
      { steps: [{ to: { spin: 6 }, ms: 2400, ease: "lin", sfx: "whoosh" }, { to: { nx2: 1 }, ms: 500, ease: "inOut" }, { to: { bars: 7 }, ms: 400 },
        { to: { bub2: 1 }, ms: 450, ease: "out", sfx: "chime" }], hold: 4200 }
    ]
  };
})();
