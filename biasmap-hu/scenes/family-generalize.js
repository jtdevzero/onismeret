/* Family: generalities. Memory can't keep every dog you've met, so a press squeezes the cards into one stamp:
   "friendly". One bite outweighs the rest and knocks the friendly ones out (negativity bias). A trip's bad bits
   fade faster than its good ones, so it stamps as "perfect" (fading affect bias). Screen geniuses in glasses
   press into an automatic link (implicit associations). The stamp then lands on a friendly new dog. The fix:
   bring the left-out cases back, and the summary turns fair. Everything is illustrative. Scene for anim.js. */
(function () {
  const KEY = "family-generalize", P = `.bp[data-scene="${KEY}"]`;
  const RY = 40, CW = 50, CH = 56;                                   // the row of memory cards, card size
  const rowX = (i, n) => 200 + (i - (n - 1) / 2) * 60;
  const BED = 212, CS = .5;                                          // top of the press bed, card scale inside
  const JX = [-3, 2.5, -1.5, 3, -.5], JR = [-3, 2, -2, 3, -1];       // a slightly untidy pile
  const pileY = i => BED - CH * CS / 2 - i * 3.2;
  const pileH = n => CH * CS + (n - 1) * 3.2;
  const FLAT = .35;                                                  // how thin the press squeezes a pile
  const RAM0 = 146, RT5 = BED - FLAT * pileH(5), RT1 = BED - FLAT * pileH(1);
  const TX = j => 30 + j * 22, TY = 194, TR = [-8, 5, -4, 7, -6];     // the "left out" tray
  const SY = 124, NX = 322, NY = 196, NS = 1.12;                                // the stamp on display, the new dog
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const lerp = (a, b, t) => a + (b - a) * t;
  const io = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const back = p => 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2);
  const bez = (a, c, b, t) => [(1 - t) * (1 - t) * a[0] + 2 * t * (1 - t) * c[0] + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * t * (1 - t) * c[1] + t * t * b[1]];
  const cub = (a, b, c, d, t) => { const u = 1 - t; return [0, 1].map(i => u * u * u * a[i] + 3 * u * u * t * b[i] + 3 * u * t * t * c[i] + t * t * t * d[i]); };
  // into the press: out to the side first (clear of the beam), down, then slide in along the bed
  const feed = (x0, y0, to, t) => { const sd = x0 <= 200 ? -1 : 1, xo = 200 + sd * 116;
    return cub([x0, y0], [sd < 0 ? Math.min(x0, xo) : Math.max(x0, xo), y0 - 4], [xo, 206], to, t); };
  const stag = (v, j, d, n = 5) => cl((v - j * d) / (1 - (n - 1) * d));

  /* ---- little drawings, each centred in a 50 x 56 card ---- */
  const EYES = (y = -5) => `<circle class="e" cx="-3.8" cy="${y}" r="1.4"/><circle class="e" cx="3.8" cy="${y}" r="1.4"/>`;
  const FLOP = `<path class="f" d="M-5 -12.5 C-11 -15 -17 -9 -16 -1 C-15.5 3 -11 3 -10 -2 C-9 -6 -8 -9 -5 -12.5 Z"/><path class="f" d="M5 -12.5 C11 -15 17 -9 16 -1 C15.5 3 11 3 10 -2 C9 -6 8 -9 5 -12.5 Z"/>`;
  const POINT = `<path class="f" d="M-9 -8 L-11 -20 L-2.5 -13 Z"/><path class="f" d="M9 -8 L11 -20 L2.5 -13 Z"/>`;
  const PROP = {
    ball: `<circle class="f" cx="13" cy="17" r="4.2"/><path class="l" d="M9.2 15.4 Q13 18.4 16.8 15.4"/>`,
    heart: `<path class="hh" d="M13 21.5 C7 17.5 8 12.3 11 12.8 C12 13 12.7 13.8 13 14.5 C13.3 13.8 14 13 15 12.8 C18 12.3 19 17.5 13 21.5 Z"/>`,
    zzz: `<path class="z" d="M11 -22 H15 L11 -18 H15 M16.5 -26 H19 L16.5 -23.5 H19"/>`,
    bone: `<path class="bn" d="M7 18 H18"/><circle class="f" cx="6.5" cy="16.4" r="1.9"/><circle class="f" cx="6.5" cy="19.6" r="1.9"/><circle class="f" cx="18.5" cy="16.4" r="1.9"/><circle class="f" cx="18.5" cy="19.6" r="1.9"/>`,
    stick: `<path class="sk" d="M5 21 L19 14 M13 17 L15 20"/>`,
    bang: `<path class="bx" d="M15 -23 V-16"/><circle class="bxd" cx="15" cy="-12.5" r="1.3"/>`,
    wag: `<path class="l" d="M13 14 Q16 17 13 20 M16.5 12.5 Q21 17 16.5 21.5"/>`
  };
  const dog = o => {
    const head = `<circle class="f" cx="0" cy="-3" r="10.5"/>`;
    let s = o.ears === "point" ? POINT + head : head + FLOP;
    if (o.spot) s += `<circle class="sp" cx="4.6" cy="-6.2" r="3.8"/>`;
    if (o.eyes === "closed") s += `<path class="l" d="M-6 -5 Q-3.8 -3 -1.6 -5 M1.6 -5 Q3.8 -3 6 -5"/>`;
    else s += EYES();
    if (o.eyes === "angry") s += `<path class="l" d="M-7.2 -9.6 L-1.8 -7.2 M7.2 -9.6 L1.8 -7.2"/>`;
    s += `<ellipse class="e" cx="0" cy="0" rx="2.4" ry="1.7"/>`;
    if (o.mouth === "teeth") s += `<path class="l" d="M-5.5 3.2 L-3.6 5.8 L-1.8 3.2 L0 5.8 L1.8 3.2 L3.6 5.8 L5.5 3.2"/>`;
    else s += `<path class="l" d="M-4.4 2.6 Q-2.2 5.2 0 2.6 Q2.2 5.2 4.4 2.6"/>`;
    if (o.mouth === "tongue") s += `<path class="f" d="M-2 4.2 Q0 9.6 2 4.2"/>`;
    if (o.collar) s += `<path class="cq" d="M-7.5 6.2 Q0 10.4 7.5 6.2"/><circle class="cqd" cx="0" cy="10.2" r="1.7"/>`;
    return s + (o.prop ? PROP[o.prop] : "");
  };
  const DOGS = [
    { ears: "flop", spot: 1, prop: "ball" },
    { ears: "point", mouth: "tongue", prop: "heart" },
    { ears: "flop", eyes: "closed", prop: "zzz" },
    { ears: "point", spot: 1, collar: 1, prop: "bone" },
    { ears: "flop", mouth: "tongue", prop: "stick" }
  ].map(dog);
  const BITE = dog({ ears: "point", eyes: "angry", mouth: "teeth", prop: "bang" });
  const NEW = dog({ ears: "flop", spot: 1, mouth: "tongue", collar: 1, prop: "wag" });

  // trip memories: an icon plus a small face (good ones smile, bad ones frown, and the frown fades)
  const TRIP = [
    `<circle class="sq" cx="-6" cy="-13" r="4.2"/><path class="sq" d="M-6 -20.5 V-19 M-13.5 -13 H-12 M1.5 -13 H0 M-11.3 -18.3 L-10.2 -17.2 M-0.7 -18.3 L-1.8 -17.2"/>
      <path class="l" d="M-15 -2 Q-11.5 -5 -8 -2 T-1 -2 T6 -2 T13 -2 M-12 4 Q-8.5 1 -5 4 T2 4 T9 4 T15 4"/>`,
    `<circle class="f" cx="0" cy="-5" r="9"/><circle class="l" cx="0" cy="-5" r="5.2"/><path class="l" d="M-15 -14 V4 M-17 -14 V-10 Q-15 -8 -13 -10 V-14 M15 -14 V4 M15 -14 Q18.5 -10 15 -6.5"/>`,
    `<circle class="f" cx="0" cy="-5" r="10"/><path class="l" d="M0 -5 V-11.5 M0 -5 L4.8 -2.4 M0 -14 V-12.6 M0 2.6 V4 M-9 -5 H-7.6 M9 -5 H7.6"/>`,
    `<path class="f" d="M-11 -2 Q-15.5 -2 -15.5 -6.5 Q-15.5 -11 -10.5 -11 Q-9.5 -16.5 -3.5 -16.5 Q2 -16.5 3.5 -12.5 Q5 -14 8 -13.5 Q12.5 -13 12.5 -8.5 Q15.5 -8 15.5 -5 Q15.5 -2 12 -2 Z"/>
      <path class="l" d="M-7 2 L-9 6.5 M0 2 L-2 6.5 M7 2 L5 6.5"/>`,
    `<path class="f" d="M-13 0 H13 L9 6 H-9 Z"/><path class="l" d="M0 0 V-18"/><path class="f" d="M2 -17 L11.5 -2.5 H2 Z"/><path class="f" d="M-2 -13 L-9.5 -2.5 H-2 Z"/>`
  ];
  const TBAD = [0, 0, 1, 1, 0];
  const FACE = `<circle class="fc" cx="0" cy="18.5" r="5.6"/><circle class="fe" cx="-2" cy="17.4" r=".9"/><circle class="fe" cx="2" cy="17.4" r=".9"/>`;
  const MOUTH = { good: "M-2.6 19.6 Q0 22 2.6 19.6", bad: "M-2.6 21.4 Q0 19 2.6 21.4", flat: "M-2.4 20.6 H2.4" };

  // screen geniuses: a head with glasses and a clever prop
  const HAIR = [
    `<path class="hr" d="M-8.8 -9 Q-8.5 -18.2 0 -18.2 Q8.5 -18.2 8.8 -9 Q4 -13.6 -8.8 -9 Z"/>`,
    `<path class="l" d="M-8 -11.5 Q-9.5 -16.5 -5 -16.8 Q-3.5 -20 0 -18.4 Q3.5 -20 5 -16.8 Q9.5 -16.5 8 -11.5"/>`,
    `<circle class="hr" cx="0" cy="-19.4" r="3.2"/><path class="hr" d="M-8.8 -8.5 Q-8.2 -17.4 0 -17.4 Q8.2 -17.4 8.8 -8.5 Q0 -14 -8.8 -8.5 Z"/>`,
    `<path class="l" d="M-8.4 -12 Q-2 -19.5 7.4 -14.2 M-3.4 -17.4 L-1.5 -14.2"/>`,
    `<path class="hr" d="M-8.8 -8 Q-9.2 -18.4 1 -18.2 Q8.9 -17.8 8.8 -8 Q6 -15 -3 -13.8 Q-6.5 -13 -8.8 -8 Z"/>`
  ];
  const GPROP = [
    `<circle class="pq" cx="16" cy="-19" r="3.6"/><path class="pq" d="M14.4 -14.4 H17.6 M14.9 -12.6 H17.1"/>`,
    `<path class="pq" d="M14 -25 H18 M14.8 -25 V-20.5 L12 -14.5 H20 L17.2 -20.5 V-25"/>`,
    `<path class="pq" d="M11 -23.5 H16 Q17.5 -23.5 17.5 -22 V-13.5 H12.5 Q11 -13.5 11 -15 Z M11 -15 Q11 -16.5 12.5 -16.5 H17.5"/>`,
    `<path class="pq" d="M15.5 -25 L17 -21.2 L21 -21 L17.9 -18.5 L19 -14.6 L15.5 -16.8 L12 -14.6 L13.1 -18.5 L10 -21 L14 -21.2 Z"/>`,
    `<path class="pq" d="M12 -24 H19 V-21 Q19 -17 15.5 -17 Q12 -17 12 -21 Z M15.5 -17 V-14 M13 -13.5 H18"/>`
  ];
  const genius = i => `<path class="f" d="M-14 28 V20 C-14 11 -8 6 0 6 C8 6 14 11 14 20 V28"/>
      <circle class="f" cx="0" cy="-8" r="8.8"/>${HAIR[i]}
      <circle class="gl" cx="-3.9" cy="-8" r="3.3"/><circle class="gl" cx="3.9" cy="-8" r="3.3"/><path class="gl" d="M-0.6 -8.6 Q0 -9.3 0.6 -8.6"/>
      <path class="l" d="M-3 -2.6 Q0 -0.4 3 -2.6"/>${GPROP[i]}`;

  const cardSvg = (key, inner, tone, extra = "") =>
    `<g class="fg-card" data-k="${key}"><rect class="bg" x="${-CW / 2}" y="${-CH / 2}" width="${CW}" height="${CH}" rx="7"/>` +
    (tone ? `<rect class="tn ${tone}" data-k="${key}t" x="${-CW / 2}" y="${-CH / 2}" width="${CW}" height="${CH}" rx="7"/>` : "") +
    `<g class="ic" data-k="${key}i">${inner}${extra}</g></g>`;

  window.BiasAnim.SCENES[KEY] = {
    q: "mem", viewBox: "0 0 400 272",
    css: `
      ${P} .fg-card *{vector-effect:non-scaling-stroke}
      ${P} .fg-card .bg{fill:var(--surface);stroke:var(--muted);stroke-width:1.6}
      ${P} .fg-card .tn{fill:none;stroke-width:2.2}
      ${P} .fg-card .tn.g{stroke:var(--good)} ${P} .fg-card .tn.b{stroke:var(--bad)} ${P} .fg-card .tn.q{stroke:var(--q)}
      ${P} .ic .f{fill:var(--surface);stroke:var(--ink);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ic .l{fill:none;stroke:var(--ink);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ic .e{fill:var(--ink)}
      ${P} .ic .sp{fill:var(--faint);opacity:.55}
      ${P} .ic .hh{fill:var(--good);stroke:var(--good);stroke-width:1.2;stroke-linejoin:round}
      ${P} .ic .z{fill:none;stroke:var(--muted);stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ic .bn{stroke:var(--ink);stroke-width:3;stroke-linecap:round}
      ${P} .ic .sk{fill:none;stroke:var(--q);stroke-width:2.4;stroke-linecap:round}
      ${P} .ic .bx{stroke:var(--bad);stroke-width:2.4;stroke-linecap:round} ${P} .ic .bxd{fill:var(--bad)}
      ${P} .ic .cq{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round} ${P} .ic .cqd{fill:var(--q)}
      ${P} .ic .sq{fill:none;stroke:var(--q);stroke-width:1.7;stroke-linecap:round}
      ${P} .ic .fc{fill:none;stroke:var(--faint);stroke-width:1.4} ${P} .ic .fe{fill:var(--faint)}
      ${P} .ic .mo{fill:none;stroke:var(--faint);stroke-width:1.4;stroke-linecap:round}
      ${P} .ic .tf.g .fc,${P} .ic .tf.g .mo{stroke:var(--good)} ${P} .ic .tf.g .fe{fill:var(--good)}
      ${P} .ic .tf.b .fc,${P} .ic .tf.b .mo{stroke:var(--bad)} ${P} .ic .tf.b .fe{fill:var(--bad)}
      ${P} .ic .hr{fill:var(--ink)}
      ${P} .ic .gl{fill:none;stroke:var(--ink);stroke-width:1.6}
      ${P} .ic .pq{fill:none;stroke:var(--q);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      ${P} .fg-fr{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .fg-rod{stroke:var(--ink);stroke-width:5;stroke-linecap:butt}
      ${P} .fg-thr{stroke:var(--ground);stroke-width:5;stroke-dasharray:1.3 3.2}
      ${P} .fg-bar{stroke:var(--ink);stroke-width:3;stroke-linecap:round}
      ${P} .fg-knob{fill:var(--surface);stroke:var(--ink);stroke-width:2}
      ${P} .fg-ghost{fill:none;stroke:var(--faint);stroke-width:1.4;stroke-dasharray:4 3.5}
      ${P} .fg-die{stroke:var(--q);stroke-width:3;stroke-linecap:round}
      ${P} .fg-bolt{fill:var(--ink)}
      ${P} .fg-mem{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .fg-tray{fill:var(--surface);stroke:var(--muted);stroke-width:1.8;stroke-linejoin:round}
      ${P} .fg-note{font:500 10px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .fg-note.q{fill:var(--q)} ${P} .fg-note.r{text-anchor:end}
      ${P} .fg-st .o{fill:var(--surface);stroke-width:2.4}
      ${P} .fg-st .i{fill:none;stroke-width:1}
      ${P} .fg-st .h{font:500 9.5px var(--mono);text-anchor:middle}
      ${P} .fg-st .w{font:700 16px var(--display);text-anchor:middle}
      ${P} .fg-st.q .o,${P} .fg-st.q .i{stroke:var(--q)} ${P} .fg-st.q text{fill:var(--q)}
      ${P} .fg-st.b .o,${P} .fg-st.b .i{stroke:var(--bad)} ${P} .fg-st.b text{fill:var(--bad)}
      ${P} .fg-st.g .o,${P} .fg-st.g .i{stroke:var(--good)} ${P} .fg-st.g text{fill:var(--good)}
      ${P} .fg-imp rect{fill:var(--surface);stroke:var(--bad);stroke-width:2}
      ${P} .fg-imp text{font:700 11px var(--display);fill:var(--bad);text-anchor:middle}
      ${P} .fg-heart{fill:var(--good);stroke:var(--surface);stroke-width:1.6;stroke-linejoin:round}
      ${P} .fg-pill rect{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .fg-pill text{font:600 11.5px var(--display);fill:var(--q);text-anchor:middle}
    `,
    text: {
      hu: {
        name: "Általánosságok", shareTitle: "Miért tartja meg az emlék a lényeget, a részleteket eldobja, 30 másodpercben",
        ecline: "Az emlékezet a részleteket összefoglalásokra cseréli, ezért a kivételeket idézd fel, mielőtt ítélkezel.",
        memory: "emlék", more: "+ még több száz", dropped: "eldobott részletek", left: "kimaradt", newDog: "új kutya", count: "5 barátságos · 1 harapás",
        dogs: "kutyák", friendly: "barátságos", scary: "ijesztő", mostly: "többnyire barátságos",
        trip: "az utazás", perfect: "tökéletes", link: "automatikus kapcsolat", glasses: "szemüveg → zseni", imp: "ijesztő",
        names: ["Negatívitási torzítás", "Halványuló affektus-torzítás", "Implicit asszociációk"],
        caps: [
          "Több száz <b>kutyával</b> találkoztál. Az emlékezet nem tud <b>mindegyiket</b> megtartani.",
          "Ezért <b>egy összefoglalóba</b> sűríti őket. A következő kutya? Egy <b>gyors tipp</b>.",
          "Aztán egy kutya <b>megharap</b>. Ez az emlék <b>felülírja</b> az összes többit.",
          "Egy régi utazás: a <b>rossz részek gyorsabban halványulnak</b>. Most „<b>tökéletes</b>” volt.",
          "A képernyőn a <b>zsenik szemüvegesek</b>. Hamarosan az összekapcsolás <b>automatikus</b>.",
          "Az összefoglalás megmarad. Egy <b>barátságos új kutya</b>? Te mégis azt gondolod: <b>ijesztő</b>.",
          "<b>A megoldás:</b> idézd fel a <b>konkrét eseteket</b>, főleg azokat, amelyek <b>nem illenek</b> bele.",
          "Öt barátságos, egy harapás. Tartsd meg a <b>kivételeket</b>, és az összefoglalás <b>igazságos</b> marad."
        ],
        say: [
          "Több száz kutyával találkoztál. Az emlékezet nem tud mindegyiket megtartani.",
          "Ezért egy összefoglalóba sűríti őket: a kutyák barátságosak. A következő alkalommal már van egy gyors tipped.",
          "Aztán egy kutya megharap. Ez az emlék felülírja az összes többit. Ez a negatívitási torzítás.",
          "Gondolj egy régi utazásra. A rossz részek gyorsabban halványulnak, mint a jók, ezért most tökéletes volt. Ez a halványuló affektus-torzítás.",
          "A képernyőn a zsenik szemüvegesek. Hamarosan az összekapcsolás automatikus. Ez egy implicit asszociáció.",
          "És az összefoglalás megmarad. Jön egy barátságos új kutya, és te mégis azt gondolod: ijesztő.",
          "A megoldás: idézd fel a konkrét eseteket, főleg azokat, amelyek nem illenek bele.",
          "Öt barátságos kutya, egy harapás. Tartsd meg a kivételeket, és az összefoglalás igazságos marad.",
          "Általánosságok. Az emlékezet a részleteket összefoglalásokra cseréli, ezért a kivételeket idézd fel, mielőtt ítélkezel."
        ]
      },
      en: {
        name: "Generalities", shareTitle: "Why memory keeps the gist and drops the details, in 30 seconds",
        ecline: "Memory swaps details for summaries, so recall the exceptions before you judge.",
        memory: "memory", more: "+ hundreds more", dropped: "details dropped", left: "left out", newDog: "new dog", count: "5 friendly · 1 bite",
        dogs: "dogs", friendly: "friendly", scary: "scary", mostly: "mostly friendly",
        trip: "the trip", perfect: "perfect", link: "automatic link", glasses: "glasses → genius", imp: "scary",
        names: ["Negativity bias", "Fading affect bias", "Implicit associations"],
        caps: [
          "You've met <b>hundreds of dogs</b>. Memory can't keep <b>every one</b>.",
          "So it presses them into <b>one summary</b>. Next dog? A <b>quick guess</b>.",
          "Then one dog <b>bites</b>. That memory <b>outweighs</b> all the others.",
          "A past trip: the <b>bad bits fade faster</b>. Now it was <b>“perfect”</b>.",
          "On screen, the <b>geniuses</b> wear <b>glasses</b>. Soon the link is <b>automatic</b>.",
          "The summary sticks. A <b>friendly new dog</b>? You still think <b>“scary”</b>.",
          "<b>The fix:</b> recall <b>specific cases</b>, especially the ones that <b>don't fit</b>.",
          "Five friendly, one bite. Keep the\u00a0<b>exceptions</b>, and the summary stays <b>fair</b>."
        ],
        say: [
          "You've met hundreds of dogs. Memory can't keep every one.",
          "So it presses them into one summary: dogs are friendly. Next time, you have a quick guess.",
          "Then one dog bites you. That memory outweighs all the others. That's negativity bias.",
          "Think of a past trip. The bad bits fade faster than the good ones, so now it was perfect. That's the fading affect bias.",
          "On screen, the geniuses wear glasses. Soon the link is automatic. That's an implicit association.",
          "And the summary sticks. A friendly new dog comes by, and you still think: scary.",
          "The fix: recall specific cases, especially the ones that don't fit.",
          "Five friendly dogs, one bite. Keep the exceptions, and the summary stays fair.",
          "Generalities. Memory swaps details for summaries, so recall the exceptions before you judge."
        ]
      },
      el: {
        name: "Γενικεύσεις", shareTitle: "Γιατί η μνήμη κρατά την ουσία και πετά τις λεπτομέρειες, σε 30 δευτερόλεπτα",
        ecline: "Η μνήμη κρατά τη γενική εικόνα και πετά τις λεπτομέρειες, γι’\u00a0αυτό θυμήσου τις εξαιρέσεις πριν κρίνεις.",
        memory: "μνήμη", more: "+ εκατοντάδες ακόμα", dropped: "χωρίς λεπτομέρειες", left: "έμειναν έξω", newDog: "καινούργιος σκύλος", count: "5 φιλικοί · 1 δάγκωμα",
        dogs: "σκύλοι", friendly: "φιλικοί", scary: "επικίνδυνοι", mostly: "κυρίως φιλικοί",
        trip: "οι διακοπές", perfect: "τέλειες", link: "αυτόματη σύνδεση", glasses: "γυαλιά → ιδιοφυΐα", imp: "επικίνδυνος",
        names: ["Μεροληψία αρνητικότητας", "Ξεθώριασμα συναισθήματος", "Έμμεσοι συσχετισμοί"],
        caps: [
          "Έχεις γνωρίσει <b>εκατοντάδες σκύλους</b>. Η\u00a0μνήμη δεν μπορεί να τους κρατήσει <b>όλους</b>.",
          "Τους συμπιέζει λοιπόν σε <b>μία περίληψη</b>. Νέος σκύλος; Κάνεις <b>γρήγορη εκτίμηση</b>.",
          "Μετά σε <b>δαγκώνει</b> ένας σκύλος. Αυτή η\u00a0ανάμνηση <b>επισκιάζει</b> όλες τις άλλες.",
          "Από τις διακοπές, τα <b>άσχημα ξεθωριάζουν</b> πιο γρήγορα. Τώρα τις θυμάσαι <b>«τέλειες»</b>.",
          "Στην οθόνη, οι <b>ιδιοφυΐες</b> φοράνε <b>γυαλιά</b>. Σύντομα η σύνδεση γίνεται <b>αυτόματη</b>.",
          "Η ταμπέλα κολλάει. Ένας άλλος <b>φιλικός σκύλος</b>; Εσύ ακόμα σκέφτεσαι <b>«επικίνδυνος»</b>.",
          "<b>Η λύση:</b> θυμήσου <b>συγκεκριμένες περιπτώσεις</b>, ειδικά όσες <b>δεν ταιριάζουν</b>.",
          "Πέντε φιλικοί, ένα δάγκωμα. Με\u00a0τις\u00a0<b>εξαιρέσεις</b>, η περίληψη βγαίνει <b>δίκαιη</b>."
        ],
        say: [
          "Έχεις γνωρίσει εκατοντάδες σκύλους. Η μνήμη δεν μπορεί να τους κρατήσει όλους.",
          "Τους συμπιέζει λοιπόν σε μία περίληψη: οι σκύλοι είναι φιλικοί. Την επόμενη φορά, κάνεις μια γρήγορη εκτίμηση.",
          "Μετά σε δαγκώνει ένας σκύλος, και αυτή η ανάμνηση μετράει πιο πολύ από όλες τις άλλες μαζί. Λέγεται μεροληψία αρνητικότητας.",
          "Σκέψου κάποιες παλιές διακοπές. Τα άσχημα ξεθωριάζουν πιο γρήγορα από τα ωραία, κι έτσι τώρα τις θυμάσαι τέλειες. Αυτό είναι το ξεθώριασμα συναισθήματος.",
          "Στην οθόνη, οι ιδιοφυΐες φοράνε γυαλιά. Σύντομα η σύνδεση γίνεται αυτόματη. Αυτός είναι ένας έμμεσος συσχετισμός.",
          "Η ταμπέλα κολλάει. Περνάει ένας καινούργιος σκύλος, φιλικός, κι εσύ ακόμα σκέφτεσαι: επικίνδυνος.",
          "Η λύση: θυμήσου συγκεκριμένες περιπτώσεις, ειδικά όσες δεν ταιριάζουν.",
          "Πέντε φιλικοί σκύλοι, ένα δάγκωμα. Με τις εξαιρέσεις, η περίληψη βγαίνει δίκαιη.",
          "Γενικεύσεις. Η μνήμη κρατά τη γενική εικόνα και πετά τις λεπτομέρειες, γι’ αυτό θυμήσου τις εξαιρέσεις πριν κρίνεις."
        ]
      },
      es: {
        name: "Generalidades", shareTitle: "Por qué la memoria se queda con lo esencial y olvida los detalles, en 30 segundos",
        ecline: "La memoria cambia los detalles por resúmenes, así que recuerda las excepciones antes de juzgar.",
        memory: "memoria", more: "+ cientos más", dropped: "sin detalles", left: "descartados", newDog: "perro nuevo", count: "5 amables · 1 mordisco",
        dogs: "perros", friendly: "amables", scary: "peligrosos", mostly: "casi todos amables",
        trip: "el viaje", perfect: "perfecto", link: "vínculo automático", glasses: "gafas → genio", imp: "peligroso",
        names: ["Sesgo de negatividad", "Sesgo del afecto que se desvanece", "Asociaciones implícitas"],
        caps: [
          "Has conocido a <b>cientos de perros</b>. La memoria no puede guardar <b>cada uno</b>.",
          "Así que los comprime en <b>un resumen</b>. ¿El próximo perro? Una <b>suposición rápida</b>.",
          "Entonces un perro te <b>muerde</b>. Ese recuerdo <b>pesa más</b> que todos los demás.",
          "Un viaje pasado: lo <b>malo se borra antes</b>. Ahora fue <b>«perfecto»</b>.",
          "En pantalla, los <b>genios</b> llevan <b>gafas</b>. Pronto el vínculo es <b>automático</b>.",
          "El resumen se queda. ¿Un <b>perro nuevo y amable</b>? Sigues pensando <b>«peligroso»</b>.",
          "<b>La solución:</b> recuerda <b>casos concretos</b>, sobre todo los que <b>no encajan</b>.",
          "Cinco amables, un mordisco. Guarda las <b>excepciones</b> y el resumen será <b>justo</b>."
        ],
        say: [
          "Has conocido a cientos de perros. La memoria no puede guardarlos todos.",
          "Así que los comprime en un solo resumen: los perros son amables. La próxima vez, tienes una suposición rápida.",
          "Entonces un perro te muerde. Ese recuerdo pesa más que todos los demás. Es el sesgo de negatividad.",
          "Piensa en un viaje pasado. Lo malo se borra antes que lo bueno, así que ahora fue perfecto. Es el sesgo del afecto que se desvanece.",
          "En pantalla, los genios llevan gafas. Pronto el vínculo es automático. Es una asociación implícita.",
          "Y el resumen se queda. Pasa un perro nuevo y amable, y aun así piensas: peligroso.",
          "La solución: recuerda casos concretos, sobre todo los que no encajan.",
          "Cinco perros amables, un mordisco. Guarda las excepciones, y el resumen será justo.",
          "Generalidades. La memoria cambia los detalles por resúmenes, así que recuerda las excepciones antes de juzgar."
        ]
      },
      fr: {
        name: "Généralités", shareTitle: "Pourquoi la mémoire garde l’essentiel et jette les détails, en 30 secondes",
        ecline: "La mémoire échange les détails contre des résumés, alors repensez aux exceptions avant de juger.",
        memory: "mémoire", more: "+ des centaines", dropped: "sans les détails", left: "mis de côté", newDog: "nouveau chien", count: "5 gentils · 1 morsure",
        dogs: "chiens", friendly: "gentils", scary: "méchants", mostly: "surtout gentils",
        trip: "le voyage", perfect: "parfait", link: "lien automatique", glasses: "lunettes → génie", imp: "méchant",
        names: ["Biais de négativité", "Biais d’estompement de l’affect", "Associations implicites"],
        caps: [
          "Vous avez croisé <b>des centaines de chiens</b>. La mémoire ne peut pas <b>tous</b> les garder.",
          "Alors elle les compresse en <b>un seul résumé</b>. Le chien suivant ? Une <b>idée rapide</b>.",
          "Puis un chien <b>mord</b>. Ce souvenir <b>pèse plus</b> que tous les autres.",
          "Un ancien voyage : les <b>mauvais moments s’effacent plus vite</b>. Il devient <b>« parfait »</b>.",
          "À l’écran, les <b>génies</b> portent des <b>lunettes</b>. Bientôt, le lien est <b>automatique</b>.",
          "Le résumé reste. Un <b>nouveau chien gentil</b> ? Vous pensez encore <b>« méchant »</b>.",
          "<b>La solution :</b> repensez à des <b>cas précis</b>, surtout ceux qui <b>ne collent pas</b>.",
          "Cinq gentils, une morsure. Gardez les <b>exceptions</b>, et le résumé reste <b>juste</b>."
        ],
        say: [
          "Vous avez croisé des centaines de chiens. La mémoire ne peut pas tous les garder.",
          "Alors elle les compresse en un seul résumé : les chiens sont gentils. La fois suivante, vous avez une idée rapide.",
          "Puis un chien vous mord. Ce souvenir pèse plus que tous les autres. C’est le biais de négativité.",
          "Pensez à un ancien voyage. Les mauvais moments s’effacent plus vite que les bons, alors maintenant, il était parfait. C’est le biais d’estompement de l’affect.",
          "À l’écran, les génies portent des lunettes. Bientôt, le lien est automatique. C’est une association implicite.",
          "Et le résumé reste. Un nouveau chien gentil passe, et vous pensez encore : méchant.",
          "La solution : repensez à des cas précis, surtout ceux qui ne collent pas.",
          "Cinq chiens gentils, une morsure. Gardez les exceptions, et le résumé reste juste.",
          "Généralités. La mémoire échange les détails contre des résumés, alors repensez aux exceptions avant de juger."
        ]
      },
      de: {
        name: "Verallgemeinern", shareTitle: "Warum das Gedächtnis das Wesentliche behält und Details verwirft, in 30 Sekunden",
        ecline: "Das Gedächtnis tauscht Details gegen Zusammenfassungen, also denk an die Ausnahmen, bevor du urteilst.",
        memory: "Gedächtnis", more: "+ Hunderte mehr", dropped: "ohne Details", left: "aussortiert", newDog: "neuer Hund", count: "5 freundlich · 1 Biss",
        dogs: "Hunde", friendly: "freundlich", scary: "gefährlich", mostly: "meist freundlich",
        trip: "die Reise", perfect: "perfekt", link: "Automatismus", glasses: "Brille → Genie", imp: "gefährlich",
        names: ["Negativitätseffekt", "Verblassender Affekt", "Implizite Assoziationen"],
        caps: [
          "Du hast <b>Hunderte Hunde</b> getroffen. Dein Gedächtnis kann nicht <b>jeden</b> behalten.",
          "Also presst es sie zu <b>einer Zusammenfassung</b>. Nächster Hund? Eine <b>schnelle Einschätzung</b>.",
          "Dann <b>beißt</b> ein Hund. Diese Erinnerung <b>wiegt schwerer</b> als alle anderen.",
          "Eine frühere Reise: Das <b>Schlechte verblasst schneller</b>. Jetzt war sie <b>„perfekt“</b>.",
          "Im Film tragen <b>Genies</b> eine <b>Brille</b>. Bald ist die Verknüpfung <b>automatisch</b>.",
          "Die Zusammenfassung bleibt. Ein <b>freundlicher neuer Hund</b>? Du denkst trotzdem <b>„gefährlich“</b>.",
          "<b>Die Lösung:</b> Ruf dir <b>konkrete Fälle</b> in Erinnerung, vor allem die, die <b>nicht passen</b>.",
          "Fünf freundliche, ein Biss. Behalte die <b>Ausnahmen</b>, und die Zusammenfassung bleibt <b>fair</b>."
        ],
        say: [
          "Du hast Hunderte Hunde getroffen. Dein Gedächtnis kann nicht jeden behalten.",
          "Also presst es sie zu einer Zusammenfassung: Hunde sind freundlich. Beim nächsten Mal hast du eine schnelle Einschätzung.",
          "Dann beißt dich ein Hund. Diese Erinnerung wiegt schwerer als alle anderen. Das ist der Negativitätseffekt.",
          "Denk an eine frühere Reise. Das Schlechte verblasst schneller als das Gute, also war sie jetzt perfekt. Das ist der verblassende Affekt.",
          "Im Film tragen Genies eine Brille. Bald ist die Verknüpfung automatisch. Das ist eine implizite Assoziation.",
          "Und die Zusammenfassung bleibt. Ein freundlicher neuer Hund kommt vorbei, und du denkst trotzdem: gefährlich.",
          "Die Lösung: Ruf dir konkrete Fälle in Erinnerung, vor allem die, die nicht passen.",
          "Fünf freundliche Hunde, ein Biss. Behalte die Ausnahmen, und die Zusammenfassung bleibt fair.",
          "Verallgemeinern. Das Gedächtnis tauscht Details gegen Zusammenfassungen, also denk an die Ausnahmen, bevor du urteilst."
        ]
      },
      it: {
        name: "Generalizzazioni", shareTitle: "Perché la memoria tiene il succo e perde i dettagli, in 30 secondi",
        ecline: "La memoria scambia i dettagli con riassunti, quindi ricorda le eccezioni prima di giudicare.",
        memory: "memoria", more: "+ centinaia di altri", dropped: "dettagli persi", left: "esclusi", newDog: "nuovo cane", count: "5 buoni · 1 morso",
        dogs: "cani", friendly: "buoni", scary: "cattivi", mostly: "quasi tutti buoni",
        trip: "il viaggio", perfect: "perfetto", link: "legame automatico", glasses: "occhiali → genio", imp: "cattivo",
        names: ["Bias di negatività", "Sbiadimento delle emozioni", "Associazioni implicite"],
        caps: [
          "Hai incontrato <b>centinaia di cani</b>. La memoria non può tenerli <b>tutti</b>.",
          "Così li pressa in <b>un unico riassunto</b>. Il prossimo cane? Una <b>stima veloce</b>.",
          "Poi un cane <b>morde</b>. Quel ricordo <b>pesa più</b> di tutti gli altri.",
          "Un viaggio passato: le <b>parti brutte sbiadiscono prima</b>. Ora era <b>«perfetto»</b>.",
          "Sullo schermo, i <b>geni</b> portano gli <b>occhiali</b>. Presto il legame è <b>automatico</b>.",
          "Il riassunto resta. Un <b>nuovo cane buono</b>? Pensi ancora <b>«cattivo»</b>.",
          "<b>La soluzione:</b> ricorda <b>casi specifici</b>, soprattutto quelli che <b>non tornano</b>.",
          "Cinque buoni, un morso. Tieni le <b>eccezioni</b>, e il riassunto resta <b>equo</b>."
        ],
        say: [
          "Hai incontrato centinaia di cani. La memoria non può tenerli tutti.",
          "Così li pressa in un unico riassunto: i cani sono buoni. La volta dopo, hai una stima veloce.",
          "Poi un cane ti morde. Quel ricordo pesa più di tutti gli altri. È il bias di negatività.",
          "Pensa a un viaggio passato. Le parti brutte sbiadiscono prima di quelle belle, così ora era perfetto. È lo sbiadimento delle emozioni.",
          "Sullo schermo, i geni portano gli occhiali. Presto il legame è automatico. È un’associazione implicita.",
          "E il riassunto resta. Passa un nuovo cane buono, e pensi ancora: cattivo.",
          "La soluzione: ricorda casi specifici, soprattutto quelli che non tornano.",
          "Cinque cani buoni, un morso. Tieni le eccezioni, e il riassunto resta equo.",
          "Generalizzazioni. La memoria scambia i dettagli con riassunti, quindi ricorda le eccezioni prima di giudicare."
        ]
      }
    },
    svg(T) {
      const stamp = (key, cls, h, w) => `<g class="fg-st ${cls}" data-k="${key}"><rect class="o" data-k="${key}o" y="-22" height="44" rx="6"/>
          <rect class="i" data-k="${key}i" y="-18.5" height="37" rx="3.5"/><text class="h" data-k="${key}h" y="-6">${h}</text>
          <g data-k="${key}g"><text class="w" data-k="${key}w" y="0">${w}</text></g></g>`;
      const tripFace = i => `<g class="tf ${TBAD[i] ? "b" : "g"}" data-k="t${i}f">${FACE}<path class="mo" d="${TBAD[i] ? MOUTH.bad : MOUTH.good}"/></g>` +
        (TBAD[i] ? `<g class="tf" data-k="t${i}n">${FACE}<path class="mo" d="${MOUTH.flat}"/></g>` : "");
      return `
        <g data-k="ghosts">${[0, 1, 2, 3, 4].map(i => `<rect class="fg-ghost" x="${rowX(i, 5) - CW / 2}" y="${RY - CH / 2}" width="${CW}" height="${CH}" rx="7"/>`).join("")}</g>
        <g data-k="press">
          <rect class="fg-fr" x="156" y="102" width="9" height="${BED - 102}" rx="2"/><rect class="fg-fr" x="235" y="102" width="9" height="${BED - 102}" rx="2"/>
        </g>
        ${DOGS.map((d, i) => cardSvg("d" + i, d, "g")).join("")}
        ${TRIP.map((d, i) => cardSvg("t" + i, d + tripFace(i), TBAD[i] ? "b" : "g")).join("")}
        ${[0, 1, 2, 3, 4].map(i => cardSvg("g" + i, genius(i), "q")).join("")}
        ${cardSvg("db", BITE, "b")}
        <g data-k="ram"><line class="fg-rod" data-k="rod" x1="200" x2="200" y1="80"/><line class="fg-thr" data-k="thr" x1="200" x2="200" y1="108"/>
          <line class="fg-bar" data-k="bar" y1="80" y2="80"/><circle class="fg-knob" data-k="kL" cy="80" r="3.4"/><circle class="fg-knob" data-k="kR" cy="80" r="3.4"/>
          <rect class="fg-fr" data-k="ramr" x="170" width="60" height="14" rx="2"/><line class="fg-die" data-k="die" x1="175" x2="225"/></g>
        <g data-k="pressBase"><rect class="fg-fr" x="140" y="${BED}" width="120" height="8" rx="2"/>
          <rect class="fg-fr" x="148" y="92" width="104" height="14" rx="3"/>
          <circle class="fg-bolt" cx="156" cy="99" r="1.6"/><circle class="fg-bolt" cx="244" cy="99" r="1.6"/>
          <text class="fg-mem" x="200" y="102.4">${T.memory}</text></g>
        <path class="fg-tray" data-k="tray" d="M14 200 V210 Q14 214 18 214 H126 Q130 214 130 210 V200 Z"/>
        <text class="fg-note" data-k="nL" x="72" y="231">${T.left}</text>
        <text class="fg-note r" data-k="nH" x="${rowX(4, 5) + CW / 2}" y="84">${T.more}</text>
        <text class="fg-note r" data-k="nD" x="${rowX(4, 5) + CW / 2}" y="84">${T.dropped}</text>
        <text class="fg-note q r" data-k="nC" x="${rowX(5, 6) + CW / 2}" y="84">${T.count}</text>
        ${cardSvg("nd", NEW, "g")}
        <text class="fg-note" data-k="nN" x="${NX}" y="243">${T.newDog}</text>
        ${stamp("sF", "q", T.dogs, T.friendly)}${stamp("sS", "b", T.dogs, T.scary)}${stamp("sT", "q", T.trip, T.perfect)}
        ${stamp("sG", "q", T.link, T.glasses)}${stamp("sM", "g", T.dogs, T.mostly)}
        <g class="fg-imp" data-k="imp"><rect data-k="impr" y="-10.5" height="21" rx="4"/><text data-k="impt" y="4">${T.imp}</text></g>
        <path class="fg-heart" data-k="heart" d="M0 8 C-9 2 -7.5 -6 -3.4 -5.5 C-1.8 -5.3 -.6 -4.2 0 -3 C.6 -4.2 1.8 -5.3 3.4 -5.5 C7.5 -6 9 2 0 8 Z"/>
        ${T.names.map((s, i) => `<g class="fg-pill" data-k="p${i}"><rect data-k="p${i}r" y="238" height="22" rx="11"/><text data-k="p${i}t" x="200" y="253">${s}</text></g>`).join("")}`;
    },
    S0: { press: 0, ram: 0, rT: RT5,
      dIn: 0, dP: 0, dF: 0, dOut: 0, dim: 0, dR: 0,
      bIn: 0, bP: 0, bF: 0, bGone: 0, bR: 0,
      tIn: 0, tFade: 0, tP: 0, tF: 0, tGone: 0,
      gIn: 0, gP: 0, gF: 0, gGone: 0,
      sF: 0, sFo: 0, sS: 0, sSo: 0, sT: 0, sTo: 0, sG: 0, sGo: 0, sM: 0,
      p0: 0, p1: 0, p2: 0, nH: 0, nD: 0, ghost: 0, nL: 0, tray: 0, nN: 0, nC: 0, nd: 0, ndG: 0, imp: 0, impO: 0, heart: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = f1(cl(v) * 1000) / 1000; };
      const at = (key, x, y, s = 1, sy = s, r = 0) => k(key).setAttribute("transform",
        `translate(${f1(x)} ${f1(y)})${r ? ` rotate(${f1(r)})` : ""} scale(${Math.max(.001, s).toFixed(3)} ${Math.max(.001, sy).toFixed(3)})`);
      const len = key => { try { return k(key).getComputedTextLength() || 0; } catch (e) { return 0; } };

      // the press: frame, ram, bed
      op("press", S.press); op("pressBase", S.press); op("ram", S.press);
      const rb = lerp(RAM0, S.rT, S.ram * S.ram);                      // ram bottom (accelerates down)
      k("ramr").setAttribute("y", f1(rb - 14)); k("rod").setAttribute("y2", f1(rb - 14)); k("thr").setAttribute("y2", f1(rb - 16));
      const hw = 20 * Math.cos(Math.PI * 2 * S.ram * S.ram);           // the handle turns as the ram goes down
      k("bar").setAttribute("x1", f1(200 - hw)); k("bar").setAttribute("x2", f1(200 + hw));
      k("kL").setAttribute("cx", f1(200 - hw)); k("kR").setAttribute("cx", f1(200 + hw));
      k("die").setAttribute("y1", f1(rb - 1.5)); k("die").setAttribute("y2", f1(rb - 1.5));
      const squeeze = (n, F) => Math.min(Math.max(FLAT, Math.min(1, (BED - rb) / pileH(n))), lerp(1, FLAT, F));
      // a card sitting in the pile at slot i, squeezed by sq
      const inPile = (i, sq) => [200 + JX[i], BED - (BED - pileY(i)) * sq, CS, CS * sq, JR[i]];
      const icon = (key, sq) => op(key + "i", cl((sq - FLAT) / .4));

      // the friendly dogs
      const dsq = squeeze(5, S.dF);
      for (let j = 0; j < 5; j++) {
        const key = "d" + j, row = [rowX(j, 5), RY], pin = stag(S.dIn, j, .12);
        const pp = io(stag(S.dP, j, .1)), po = io(stag(S.dOut, j, .08)), pr = io(stag(S.dR, j, .08));
        let x, y, s, sy, r = 0, o, sq = 1;
        if (pr > 0) {
          [x, y] = bez([TX(j), TY], [TX(j), RY], [rowX(j + 1, 6), RY], pr);
          s = sy = lerp(CS, 1, pr); r = lerp(TR[j], 0, pr); o = lerp(.5 * (1 - .75 * S.dim), 1, pr);
        } else if (po > 0) {
          const [px, py, , psy] = inPile(j, dsq);
          [x, y] = bez([px, py], [150, 128], [TX(j), TY], po);
          s = CS; sy = lerp(psy, CS, po); sq = lerp(dsq, 1, po); r = lerp(JR[j], TR[j], po); o = lerp(1, .5, po) * (1 - .75 * S.dim);
        } else if (pp >= 1) {
          [x, y, s, sy, r] = inPile(j, dsq); sq = dsq; o = 1;
        } else if (pp > 0) {
          const [px, py] = inPile(j, 1);
          [x, y] = feed(row[0], row[1], [px, py], pp);
          s = sy = lerp(1, CS, pp); r = lerp(0, JR[j], pp); o = 1;
        } else {
          [x, y] = row; s = sy = .6 + .4 * (pin > 0 ? back(pin) : 0); o = cl(pin * 3);
        }
        at(key, x, y, s, sy, r); op(key, o); icon(key, sq);
      }

      // the bite: pops in big, lands on the pile, knocks the friendly ones out, gets squeezed; comes back at the fix
      {
        const bsq = squeeze(1, S.bF), topOfPile = BED - pileH(5) * dsq;
        let x, y, s, sy, r = 0, o, sq = 1;
        if (S.bR > 0) {
          const p = io(S.bR);
          [x, y] = bez([200, BED - CH * CS / 2 * bsq], [96, BED - 6], [rowX(0, 6), RY], p);
          s = lerp(CS, 1, p); sy = lerp(CS * bsq, 1, p); sq = lerp(bsq, 1, p); o = lerp(1 - S.bGone, 1, p);
        } else if (S.bP >= 1) {
          const yTop = lerp(topOfPile, BED, io(cl(S.dOut * 1.4)));
          x = 200; y = yTop - CH * CS / 2 * bsq; s = CS; sy = CS * bsq; sq = bsq; o = 1 - S.bGone;
        } else if (S.bP > 0) {
          const p = S.bP;
          [x, y] = feed(200, RY + 2, [200, topOfPile - CH * CS / 2], p);
          s = sy = lerp(1.15, CS, p); r = lerp(0, -3, p); o = 1;
        } else {
          x = 200; y = RY + 2; s = sy = 1.15 * (.6 + .4 * (S.bIn > 0 ? back(S.bIn) : 0)); o = cl(S.bIn * 3);
        }
        at("db", x, y, s, sy, r); op("db", o); icon("db", sq);
      }

      // trip memories: the bad feelings fade first, then into the press
      const tsq = squeeze(5, S.tF);
      for (let j = 0; j < 5; j++) {
        const key = "t" + j, row = [rowX(j, 5), RY], pin = stag(S.tIn, j, .12), pp = io(stag(S.tP, j, .1));
        let x, y, s, sy, r = 0, o, sq = 1;
        if (pp >= 1) { [x, y, s, sy, r] = inPile(j, tsq); sq = tsq; }
        else if (pp > 0) {
          const [px, py] = inPile(j, 1);
          [x, y] = feed(row[0], row[1], [px, py], pp);
          s = sy = lerp(1, CS, pp); r = lerp(0, JR[j], pp);
        } else { [x, y] = row; s = sy = .6 + .4 * (pin > 0 ? back(pin) : 0); }
        o = cl(pin * 3) * (1 - S.tGone);
        at(key, x, y, s, sy, r); op(key, o); icon(key, sq);
        if (TBAD[j]) { const f = 1 - .9 * S.tFade; op(key + "t", f); op(key + "f", f); op(key + "n", 1 - f); }
      }

      // screen geniuses
      const gsq = squeeze(5, S.gF);
      for (let j = 0; j < 5; j++) {
        const key = "g" + j, row = [rowX(j, 5), RY], pin = stag(S.gIn, j, .12), pp = io(stag(S.gP, j, .1));
        let x, y, s, sy, r = 0, sq = 1;
        if (pp >= 1) { [x, y, s, sy, r] = inPile(j, gsq); sq = gsq; }
        else if (pp > 0) {
          const [px, py] = inPile(j, 1);
          [x, y] = feed(row[0], row[1], [px, py], pp);
          s = sy = lerp(1, CS, pp); r = lerp(0, JR[j], pp);
        } else { [x, y] = row; s = sy = .6 + .4 * (pin > 0 ? back(pin) : 0); }
        at(key, x, y, s, sy, r); op(key, cl(pin * 3) * (1 - S.gGone)); icon(key, sq);
      }

      // the tray for what got left out
      op("tray", S.tray * (1 - .75 * S.dim)); op("nL", S.nL * (1 - .75 * S.dim));
      op("nH", S.nH); op("nD", S.nD); op("nC", S.nC); op("ghosts", S.ghost * (1 - .4 * S.p0 - .4 * S.p1 - .4 * S.p2 - .4 * S.nN));

      // stamps: fly out of the press to the display spot, sized to their words
      const stampAt = (key, p, out, pop) => {
        const hw = len(key + "h"), ww = len(key + "w"), sc = ww > 0 ? Math.min(1, 112 / ww) : 1;
        k(key + "g").setAttribute("transform", `translate(0 13) scale(${sc.toFixed(3)})`);
        const w = Math.max(96, hw, ww * sc) + 26;
        for (const [r, inset] of [["o", 0], ["i", 3.5]]) { const e = k(key + r); e.setAttribute("x", f1(-w / 2 + inset)); e.setAttribute("width", f1(w - 2 * inset)); }
        const sx = Math.min(NX, 388 - w / 2);
        if (pop) { at(key, sx, SY, .85 + .15 * p, .85 + .15 * p, -4); op(key, cl(p * 2) * (1 - out)); return; }
        const e = io(cl(p));
        at(key, lerp(200, sx, e), lerp(BED - 8, SY, e) - 26 * Math.sin(Math.PI * e), lerp(.3, 1, e), lerp(.3, 1, e), lerp(0, -4, e));
        op(key, cl(p * 3) * (1 - out));
      };
      stampAt("sF", S.sF, S.sFo); stampAt("sS", S.sS, S.sSo); stampAt("sT", S.sT, S.sTo); stampAt("sG", S.sG, S.sGo);
      stampAt("sM", S.sM, 0, true);

      // the new dog, and the summary stamped on it
      at("nd", NX, NY, NS * (.6 + .4 * S.nd)); op("nd", cl(S.nd * 2)); op("ndt", S.ndG); op("nN", S.nN);
      const iw = len("impt") + 16, ir = k("impr");
      ir.setAttribute("x", f1(-iw / 2)); ir.setAttribute("width", f1(iw));
      at("imp", NX, NY + 15, lerp(1.9, 1, cl(S.imp)), lerp(1.9, 1, cl(S.imp)), -9); op("imp", cl(S.imp * 2) * (1 - S.impO));
      at("heart", NX + 26, NY - 30, .5 + .5 * S.heart); op("heart", cl(S.heart * 2));

      // family members named on screen
      for (let i = 0; i < 3; i++) {
        const w = len(`p${i}t`) + 26, rr = k(`p${i}r`);
        rr.setAttribute("x", f1(200 - w / 2)); rr.setAttribute("width", f1(w));
        const v = [S.p0, S.p1, S.p2][i];
        k("p" + i).setAttribute("transform", `translate(0 ${f1(6 * (1 - cl(v)))})`); op("p" + i, v);
      }
    },
    beats: [
      { steps: [{ to: { dIn: 1 }, ms: 1500, ease: "lin", sfx: "pluck" }, { to: { nH: 1 }, ms: 400 }], hold: 2200 },
      { steps: [{ to: { nH: 0, press: 1 }, ms: 500 }, { to: { dP: 1, ghost: 1 }, ms: 1300, ease: "lin" },
        { to: { rT: RT5 } }, { to: { ram: 1 }, ms: 230, ease: "lin", sfx: "thud", sfxAt: 180 }, { to: { dF: 1 } },
        { to: { ram: 0 }, ms: 450 }, { to: { sF: 1 }, ms: 650 }, { to: { nD: 1 }, ms: 400 }], hold: 2400 },
      { steps: [{ to: { nD: 0 }, ms: 250 }, { to: { bIn: 1, p0: 1 }, ms: 420, ease: "lin", sfx: "pop" }, { wait: 350 },
        { to: { bP: 1 }, ms: 700, ease: "inOut", sfx: "thud", sfxAt: 640 }, { to: { dOut: 1, tray: 1 }, ms: 950, ease: "lin" },
        { to: { nL: 1 }, ms: 300 }, { to: { rT: RT1 } }, { to: { ram: 1 }, ms: 230, ease: "lin" }, { to: { bF: 1 } },
        { to: { ram: 0 }, ms: 400 }, { to: { sS: 1, sFo: 1 }, ms: 650 }], hold: 2600 },
      { steps: [{ to: { p0: 0, sSo: 1, bGone: 1, dim: 1 }, ms: 450 }, { to: { tIn: 1, p1: 1 }, ms: 1000, ease: "lin" }, { wait: 300 },
        { to: { tFade: 1 }, ms: 1000, ease: "inOut" }, { to: { tP: 1 }, ms: 1100, ease: "lin" },
        { to: { rT: RT5 } }, { to: { ram: 1 }, ms: 230, ease: "lin", sfx: "thud", sfxAt: 180 }, { to: { tF: 1 } },
        { to: { ram: 0 }, ms: 400 }, { to: { sT: 1 }, ms: 650 }], hold: 2600 },
      { steps: [{ to: { p1: 0, sTo: 1, tGone: 1 }, ms: 450 }, { to: { gIn: 1, p2: 1 }, ms: 1000, ease: "lin" }, { wait: 250 },
        { to: { gP: 1 }, ms: 1100, ease: "lin" }, { to: { ram: 1 }, ms: 230, ease: "lin", sfx: "thud", sfxAt: 180 }, { to: { gF: 1 } },
        { to: { ram: 0 }, ms: 400 }, { to: { sG: 1 }, ms: 650 }], hold: 2800 },
      { steps: [{ to: { p2: 0, sGo: 1, gGone: 1 }, ms: 450 }, { to: { sSo: 0, dim: 0 }, ms: 500 },
        { to: { nd: 1, nN: 1 }, ms: 450, ease: "back" }, { wait: 450 }, { to: { imp: 1 }, ms: 320, ease: "lin", sfx: "pop" }], hold: 2800 },
      { steps: [{ to: { nL: 0, ghost: 0 }, ms: 300 }, { to: { dR: 1, bR: 1 }, ms: 1300, ease: "lin", sfx: "whoosh" },
        { to: { tray: 0 }, ms: 300 }, { to: { nC: 1 }, ms: 400 }], hold: 2800 },
      { steps: [{ to: { sSo: 1, impO: 1 }, ms: 400 }, { to: { sM: 1 }, ms: 600, ease: "back", sfx: "chime" },
        { to: { heart: 1, ndG: 1 }, ms: 450, ease: "back" }], hold: 4200 }
    ]
  };
})();
