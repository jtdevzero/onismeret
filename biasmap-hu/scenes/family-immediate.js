/* Family: the here & now. You hold a lens close: whatever is near and concrete looks huge, whatever is far or
   abstract shrinks to a dot. A treat now against savings next year, one named child against thousands, the new
   model against the phone that works. Widening the view brings the far side up to real size, and the choice
   gets fair. Scene for anim.js. */
(function () {
  const KEY = "family-immediate", P = `.bp[data-scene="${KEY}"]`;
  const LX = 150, LY = 136, LR = 62, ZOOM = 2;         // the lens: centre, radius; how much it magnifies
  const NX = 150, FX = 330, ROW = [84, 136, 188];      // the near and far columns, and the three rows at the end
  const REAL = [1.2, 1.3, 1];                          // real size of the far things: savings, thousands, the old phone
  const WIDE = [112, 56, 256, 160, 16];                // the lens opened wide: x, y, width, height, corner
  const TAG_X = 240, TAG_Y = 16, TAG_H = 28;           // bias name tags
  const FOOT = 218;                                    // labels under the near and far columns
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const f3 = n => +n.toFixed(3);
  const lerp = (a, b, t) => a + (b - a) * t;
  const star = (x, y, r) => `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`;

  // the things, drawn round (0, 0) and about 34 px across at real size
  const PHONE = `<rect class="ih-fl" x="-9" y="-16" width="18" height="32" rx="3.5"/><path class="ih-ln" d="M-2.5 12.5 H2.5"/>`;
  const ICON = {
    gift: `<rect class="ih-fl" x="-13" y="-5" width="26" height="20" rx="2"/><rect class="ih-fl" x="-15" y="-11" width="30" height="7" rx="2"/>
      <path class="ih-acc" d="M0 -11 V15 M0 -11 C-3 -18 -11 -18 -9 -13 C-8 -11 -4 -11 0 -11 C4 -11 8 -11 9 -13 C11 -18 3 -18 0 -11"/>`,
    treat: `<path class="ih-fl" d="M-11 1 L-8 15 H8 L11 1 Z"/><path class="ih-fn" d="M-4 4 L-3 12.5 M4 4 L3 12.5"/>
      <path class="ih-fl" d="M-12 1 C-16 -3 -12 -9 -7 -7 C-6 -12 1 -13 3 -9 C7 -12 13 -8 11 -4 C15 -2 14 2 11 1 Z"/>
      <circle class="ih-dotq" cx="1.5" cy="-13" r="3"/>`,
    savings: `<circle class="ih-coin" cx="1" cy="-12" r="4.5"/>
      <path class="ih-fl" d="M-13 3 C-13 -6 -6 -10 1 -10 C8 -10 13 -6 13 1 C13 7 9 11 4 11 H-5 C-10 11 -13 8 -13 3 Z"/>
      <rect class="ih-fl" x="12" y="-3" width="4.5" height="7" rx="2"/><path class="ih-fl" d="M-7 -8 L-6 -13.5 L-1.5 -9.6"/>
      <path class="ih-ln" d="M-6 11 V15 M5 11 V15 M-13 1 C-16 0 -17 -3 -15 -4 M-2.5 -7.5 H4.5"/><circle class="ih-e" cx="7" cy="-3" r="1.2"/>`,
    child: `<path class="ih-fl" d="M-12 17 V13 C-12 6 -6 2 0 2 C6 2 12 6 12 13 V17"/><circle class="ih-fl" cx="0" cy="-8" r="8"/>
      <path class="ih-ln" d="M-5 -14 Q0 -19 4 -14.5"/><circle class="ih-e" cx="-3" cy="-8.5" r="1.1"/><circle class="ih-e" cx="3" cy="-8.5" r="1.1"/>
      <path class="ih-ln" d="M-2.8 -4.4 Q0 -2.6 2.8 -4.4"/><rect class="ih-name" x="-9" y="6.5" width="18" height="8.5" rx="2"/>`,
    crowd: [-10, -1, 8].map((y, r) => [-12, -6, 0, 6, 12].map(x => {
      const cx = x + (r === 1 ? 3 : 0);
      return cx > 13 ? "" : `<circle class="ih-mb" cx="${cx}" cy="${y}" r="2.2"/><path class="ih-mb" d="M${cx - 3.4} ${y + 6.4} Q${cx} ${y + 2.4} ${cx + 3.4} ${y + 6.4}"/>`;
    }).join("")).join(""),
    fresh: `${PHONE}<rect class="ih-scr" x="-6" y="-12" width="12" height="21" rx="1"/>
      <path class="ih-spk" d="${star(15, -11, 4.5)} ${star(-15, -3, 3.5)} ${star(14, 8, 3)}"/>`,
    old: `${PHONE}<rect class="ih-sco" x="-6" y="-12" width="12" height="21" rx="1"/><path class="ih-chk" d="M-3.6 -1.5 L-1 1.2 L3.8 -3.8"/>`
  };

  window.BiasAnim.SCENES[KEY] = {
    q: "fast", viewBox: "0 0 400 272",
    css: `
      ${P} .ih-it *{vector-effect:non-scaling-stroke}
      ${P} .ih-fl{fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ih-ln{fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ih-fn{fill:none;stroke:var(--faint);stroke-width:1.5;stroke-linecap:round}
      ${P} .ih-acc{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ih-e{fill:var(--ink)}
      ${P} .ih-dotq{fill:var(--q)}
      ${P} .ih-coin{fill:var(--q);fill-opacity:.25;stroke:var(--q);stroke-width:1.8}
      ${P} .ih-name{fill:var(--q);fill-opacity:.2;stroke:var(--q);stroke-width:1.4}
      ${P} .ih-nt{font:700 6px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ih-mb{fill:var(--surface);stroke:var(--muted);stroke-width:1.4;stroke-linecap:round}
      ${P} .ih-scr{fill:var(--q);fill-opacity:.22;stroke:var(--q);stroke-width:1.2}
      ${P} .ih-sco{fill:none;stroke:var(--faint);stroke-width:1.2}
      ${P} .ih-chk{fill:none;stroke:var(--good);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ih-spk{fill:var(--q)}
      ${P} .ih-gh *{stroke-dasharray:2.4 2.6}
      ${P} .ih-dot{fill:var(--muted)}
      ${P} .ih-ring{fill:none;stroke:var(--q);stroke-width:2}
      ${P} .ih-ray{stroke:var(--q);stroke-width:1.6;stroke-linecap:round;stroke-dasharray:1.5 5}
      ${P} .ih-you path,${P} .ih-you circle{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .ih-you .bd{stroke-linecap:butt}
      ${P} .ih-you .e{fill:var(--ink);stroke:none}
      ${P} .ih-you .m{fill:none}
      ${P} .ih-lens{fill:var(--q);fill-opacity:.07;stroke:var(--q);stroke-width:2.6}
      ${P} .ih-glint{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;opacity:.45}
      ${P} .ih-hd{stroke:var(--ink);stroke-width:7;stroke-linecap:round}
      ${P} .ih-hd2{stroke:var(--surface);stroke-width:3;stroke-linecap:round}
      ${P} .ih-ll{font:500 10px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .ih-lb{text-anchor:middle}
      ${P} .ih-lb .a{font:600 11.5px var(--display);fill:var(--ink)}
      ${P} .ih-lb .b{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .ih-lb .b.q{fill:var(--q)}
      ${P} .ih-real{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .ih-wl{font:500 10px var(--mono);text-anchor:middle}
      ${P} .ih-tag .bx{fill:var(--surface);stroke:var(--q);stroke-width:1.8}
      ${P} .ih-tag .lb{fill:var(--surface);stroke:none}
      ${P} .ih-tag .lg{font:500 9.5px var(--mono);fill:var(--q)}
      ${P} .ih-tag .nm{font:600 12.5px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .ih-row text{font:500 9.5px var(--mono);fill:var(--good);text-anchor:middle;paint-order:stroke;stroke:var(--ground);stroke-width:12px;stroke-linejoin:round}
      ${P} .ih-row line{stroke:var(--good);stroke-width:1.4;stroke-linecap:round;stroke-dasharray:1.5 3.5}
    `,
    text: {
      hu: {
        name: "A most és itt", shareTitle: "Miért nyer mindig az, ami éppen előttünk van, 30 másodpercben",
        ecline: "Ami közel van, nagyobbnak látszik, mint amekkora, ezért a döntés előtt képzeld el közelről a távolit.",
        lens: "most és itt", wide: "az egész kép", kid: "Alex", bias: "torzítás", real: ["valódi méret"],
        tags: ["Hiperbolikus diszkontálás", "Azonosítható áldozat-hatás", "Az újdonság vonzereje"], tw: [176, 200, 142],
        labs: [
          [["itt van"], ["messze"]],
          [["egy falat", "most"], ["megtakarítás", "jövőre"]],
          [["egy gyerek", "névvel"], ["ezrek", "névtelenül"]],
          [["az új modell", "éppen kijött"], ["a régi", "még jól működik"]]
        ],
        rows: ["most vagy később", "egy vagy ezrek", "új vagy bevált"],
        caps: [
          "A közeli és a távoli dolgok versenyeznek a <b>korlátozott figyelmeddel</b>.",
          "Az agyad a <b>most és itt</b> dolgokra közelít rá. Általában ez okos.",
          "Egy falat <b>most</b> hatalmasnak tűnik. A megtakarítás <b>jövőre</b>? Egy pötty.",
          "Egy gyerek <b>névvel</b> jobban megmozgat, mint <b>ezrek</b>, akiknek ugyanúgy szükségük van rá.",
          "Az <b>új</b> modell jobbnak látszik, csak mert új.",
          "Pedig ami zsugorodik, az gyakran <b>fontosabb</b>.",
          "<b>A megoldás:</b> tágítsd a látószöget. Képzeld el a távolit <b>közelről</b>.",
          "Egymás mellé téve, <b>valódi méretükben</b>, a döntés tisztává válik."
        ],
        say: [
          "A közeli és a távoli dolgok mind versenyeznek a figyelmeddel. A figyelmed pedig korlátozott.",
          "Az agyad ezért a most és itt dolgokra közelít rá. Ami közel van, hatalmasnak tűnik, ami messze, pöttyé zsugorodik. Általában ez okos: a jutalom vagy a veszély, ami előtted van, általában a legfontosabb.",
          "Egy falat most hatalmasnak tűnik. A jövő évi megtakarításod? Csak egy pötty. Ez a hiperbolikus diszkontálás.",
          "Egy gyerek névvel és arccal jobban megmozgat, mint több ezer ugyanilyen helyzetben lévő ember. Ez az azonosítható áldozat-hatás.",
          "Az új modell pedig jobbnak látszik, csak mert új, miközben a jól működő telefon elhalványul. Ez az újdonság vonzereje.",
          "Pedig ami zsugorodik, az gyakran fontosabb: a nagyobb jutalom, több ember, valami bevált.",
          "A megoldás: tágítsd a látószöget. Képzeld el a távolit közelről, például a jövőbeli éned egy év múlva.",
          "Tedd egymás mellé a közelit és a távolit, valódi méretükben, és a döntés tisztává válik. Ha valami újnak sürgősnek tűnik, adj neki egy napot.",
          "A most és itt. Ami közel van, nagyobbnak látszik, mint amekkora, ezért a döntés előtt képzeld el közelről a távolit."
        ]
      },
      en: {
        name: "The here & now", shareTitle: "Why what's right in front of us wins, in 30 seconds",
        ecline: "What's near looks bigger than it is, so picture the far side up close before you choose.",
        lens: "here & now", wide: "the whole picture", kid: "Alex", bias: "bias", real: ["real size"],
        tags: ["Hyperbolic discounting", "Identifiable victim effect", "Appeal to novelty"], tw: [176, 200, 142],
        labs: [
          [["right here"], ["far off"]],
          [["a treat", "now"], ["savings", "next year"]],
          [["one child", "with a name"], ["thousands", "no names"]],
          [["the new model", "just out"], ["your old one", "works fine"]]
        ],
        rows: ["now or later", "one or thousands", "new or proven"],
        caps: [
          "Things near and far compete for your <b>limited attention</b>.",
          "Your brain zooms in on <b>the\u00a0here\u00a0and\u00a0now</b>. Usually, that's smart.",
          "A treat <b>now</b> looks huge. Savings for <b>next year</b>? A dot.",
          "One child <b>with a name</b> moves you more than <b>thousands</b> in need.",
          "The <b>new</b> model looks better, just because it's new.",
          "Yet what shrinks is often what <b>matters more</b>.",
          "<b>The fix:</b> widen your view. Picture the far side <b>up close</b>.",
          "Side by side, at <b>real size</b>, the choice gets clear."
        ],
        say: [
          "Things near and far all compete for your attention. And your attention is limited.",
          "So your brain zooms in on the here and now. What's close looks huge, and what's far shrinks to a dot. Usually, that's smart: the reward or the threat right in front of you tends to matter most.",
          "A treat now looks huge. Your savings for next year? Just a dot. That's hyperbolic discounting.",
          "One child with a name and a face moves you more than thousands of people in the same need. That's the identifiable victim effect.",
          "And the new model looks better, just because it's new, while the phone that works fine fades away. That's the appeal to novelty.",
          "Yet what shrinks is often what matters more: a bigger reward, more people, something proven.",
          "The fix: widen your view. Picture the far side up close, like your future self a year from now.",
          "Put near and far side by side, at their real size, and the choice gets clear. And if something new feels urgent, give it a day.",
          "The here and now. What's near looks bigger than it is, so picture the far side up close before you choose."
        ]
      },
      el: {
        name: "Το εδώ & τώρα", shareTitle: "Γιατί κερδίζει ό,τι έχουμε μπροστά μας, σε 30 δευτερόλεπτα",
        ecline: "Ό,τι είναι κοντά φαίνεται μεγαλύτερο απ’\u00a0όσο είναι, γι’\u00a0αυτό φέρε και το μακρινό κοντά σου πριν διαλέξεις.",
        lens: "εδώ & τώρα", wide: "όλη η εικόνα", kid: "Άλεξ", bias: "μεροληψία", real: ["πραγματικό", "μέγεθος"],
        tags: ["Υπερβολική προεξόφληση", "Φαινόμενο αναγνωρίσιμου θύματος", "Επίκληση στο καινούργιο"], tw: [184, 252, 190],
        labs: [
          [["εδώ μπροστά σου"], ["μακριά"]],
          [["ένα γλυκό", "τώρα"], ["οικονομίες", "του χρόνου"]],
          [["ένα παιδί", "με όνομα"], ["χιλιάδες", "χωρίς όνομα"]],
          [["το νέο μοντέλο", "μόλις βγήκε"], ["το παλιό σου", "δουλεύει καλά"]]
        ],
        rows: ["τώρα ή αργότερα", "ένα παιδί ή χιλιάδες", "νέο ή δοκιμασμένο"],
        caps: [
          "Κοντινά και μακρινά, όλα διεκδικούν την <b>περιορισμένη προσοχή σου</b>.",
          "Το μυαλό σου εστιάζει στο <b>εδώ\u00a0και\u00a0τώρα</b>. Και συνήθως καλά κάνει.",
          "Ένα γλυκό <b>τώρα</b> μοιάζει τεράστιο. Οι\u00a0οικονομίες για <b>του χρόνου</b>; Μια\u00a0κουκκίδα.",
          "Ένα παιδί <b>με όνομα</b> σε συγκινεί πιο πολύ από <b>χιλιάδες</b> ανθρώπους σε ανάγκη.",
          "Το <b>νέο</b> μοντέλο μοιάζει καλύτερο, μόνο και μόνο επειδή είναι καινούργιο.",
          "Κι όμως, ό,τι μικραίνει συχνά <b>μετράει περισσότερο</b>.",
          "<b>Η λύση:</b> άνοιξε το κάδρο. Φαντάσου το μακρινό <b>από κοντά</b>.",
          "Δίπλα δίπλα, στο <b>πραγματικό τους μέγεθος</b>, η επιλογή ξεκαθαρίζει."
        ],
        say: [
          "Κοντινά και μακρινά, όλα διεκδικούν την προσοχή σου. Κι η προσοχή σου είναι περιορισμένη.",
          "Γι’ αυτό το μυαλό σου εστιάζει στο εδώ και τώρα. Ό,τι είναι κοντά φαίνεται τεράστιο, κι ό,τι είναι μακριά μικραίνει ώσπου γίνεται κουκκίδα. Και συνήθως καλά κάνει: η ανταμοιβή ή η απειλή που έχεις ακριβώς μπροστά σου τείνει να μετράει πιο πολύ.",
          "Ένα γλυκό τώρα μοιάζει τεράστιο. Οι οικονομίες σου για του χρόνου; Μια κουκκίδα. Λέγεται υπερβολική προεξόφληση.",
          "Ένα παιδί με όνομα και πρόσωπο σε συγκινεί πιο πολύ από χιλιάδες ανθρώπους με την ίδια ανάγκη. Είναι το φαινόμενο αναγνωρίσιμου θύματος.",
          "Και το νέο μοντέλο μοιάζει καλύτερο, μόνο και μόνο επειδή είναι καινούργιο, ενώ το κινητό που δουλεύει μια χαρά ξεθωριάζει. Αυτή είναι η επίκληση στο καινούργιο.",
          "Κι όμως, ό,τι μικραίνει συχνά μετράει περισσότερο: μια μεγαλύτερη ανταμοιβή, περισσότεροι άνθρωποι, κάτι δοκιμασμένο.",
          "Η λύση: άνοιξε το κάδρο. Φαντάσου το μακρινό από κοντά, όπως τον εαυτό σου σε έναν χρόνο.",
          "Βάλε το κοντινό και το μακρινό δίπλα δίπλα, στο πραγματικό τους μέγεθος, και η επιλογή ξεκαθαρίζει. Κι αν κάτι καινούργιο σου φαίνεται επείγον, περίμενε μια μέρα.",
          "Το εδώ και τώρα. Ό,τι είναι κοντά φαίνεται μεγαλύτερο απ’ όσο είναι, γι’ αυτό φέρε και το μακρινό κοντά σου πριν διαλέξεις."
        ]
      },
      es: {
        name: "El aquí y ahora", shareTitle: "Por qué gana lo que tenemos delante, en 30 segundos",
        ecline: "Lo cercano parece más grande de lo que es, así que imagina lo lejano de cerca antes de elegir.",
        lens: "aquí y ahora", wide: "la imagen completa", kid: "Alex", bias: "sesgo", real: ["tamaño real"],
        tags: ["Descuento hiperbólico", "Efecto de la víctima identificable", "Apelación a la novedad"], tw: [176, 262, 184],
        labs: [
          [["aquí mismo"], ["lejos"]],
          [["un capricho", "ahora"], ["ahorros", "el año que viene"]],
          [["un niño", "con nombre"], ["miles", "sin nombre"]],
          [["el nuevo modelo", "recién salido"], ["el que tienes", "funciona bien"]]
        ],
        rows: ["ahora o después", "uno o miles", "nuevo o probado"],
        caps: [
          "Lo cercano y lo lejano compiten por tu <b>atención limitada</b>.",
          "Tu cerebro se centra en <b>el aquí y ahora</b>. Normalmente, es lo sensato.",
          "Un capricho <b>ahora</b> parece enorme. ¿Ahorrar para <b>el año que viene</b>? Un punto.",
          "Un niño <b>con nombre</b> te conmueve más que <b>miles</b> de necesitados.",
          "El modelo <b>nuevo</b> parece mejor solo porque es nuevo.",
          "Pero lo que se encoge suele ser lo que <b>más importa</b>.",
          "<b>La solución:</b> amplía la vista. Imagina lo lejano <b>de cerca</b>.",
          "Uno al lado del otro, a <b>tamaño real</b>, la elección se aclara."
        ],
        say: [
          "Lo cercano y lo lejano compiten por tu atención. Y tu atención es limitada.",
          "Así que tu cerebro se centra en el aquí y ahora. Lo cercano parece enorme, y lo lejano se encoge hasta ser un punto. Normalmente, es lo sensato: la recompensa o la amenaza que tienes delante suele ser lo que más importa.",
          "Un capricho ahora parece enorme. ¿Tus ahorros para el año que viene? Solo un punto. Es el descuento hiperbólico.",
          "Un niño con nombre y cara te conmueve más que miles de personas con la misma necesidad. Es el efecto de la víctima identificable.",
          "Y el modelo nuevo parece mejor solo porque es nuevo, mientras el teléfono que funciona bien se desvanece. Es la apelación a la novedad.",
          "Pero lo que se encoge suele ser lo que más importa: una recompensa mayor, más personas, algo probado.",
          "La solución: amplía la vista. Imagina lo lejano de cerca, como a tu yo de dentro de un año.",
          "Pon lo cercano y lo lejano uno al lado del otro, a su tamaño real, y la elección se aclara. Y si algo nuevo te parece urgente, dale un día.",
          "El aquí y ahora. Lo cercano parece más grande de lo que es, así que imagina lo lejano de cerca antes de elegir."
        ]
      },
      fr: {
        name: "L’ici et maintenant", shareTitle: "Pourquoi ce qui est juste devant nous l’emporte, en 30 secondes",
        ecline: "Ce qui est proche paraît plus grand qu’il n’est, alors imaginez le lointain de près avant de choisir.",
        lens: "ici et maintenant", wide: "vue d’ensemble", kid: "Alex", bias: "biais", real: ["taille réelle"],
        tags: ["Actualisation hyperbolique", "Effet de la victime identifiable", "Appel à la nouveauté"], tw: [204, 243, 169],
        labs: [
          [["tout près"], ["au loin"]],
          [["une douceur", "maintenant"], ["l’épargne", "l’an prochain"]],
          [["un enfant", "avec un nom"], ["des milliers", "sans nom"]],
          [["le nouveau modèle", "tout juste sorti"], ["votre ancien", "marche bien"]]
        ],
        rows: ["maintenant ou après", "un ou des milliers", "neuf ou éprouvé"],
        caps: [
          "Le proche et le lointain se disputent votre <b>attention limitée</b>.",
          "Votre cerveau zoome sur <b>l’ici et maintenant</b>. En général, c’est malin.",
          "Une douceur <b>maintenant</b> paraît énorme. L’épargne pour <b>l’an prochain</b> ? Un point.",
          "Un enfant <b>avec un nom</b> vous touche plus que <b>des milliers</b> dans le besoin.",
          "Le modèle <b>neuf</b> semble meilleur, juste parce qu’il est neuf.",
          "Pourtant, ce qui rétrécit est souvent ce qui <b>compte le plus</b>.",
          "<b>La solution :</b> élargissez votre regard. Imaginez le lointain <b>de près</b>.",
          "Côte à côte, en <b>taille réelle</b>, le choix devient clair."
        ],
        say: [
          "Le proche et le lointain se disputent votre attention. Et votre attention est limitée.",
          "Alors votre cerveau zoome sur l’ici et maintenant. Ce qui est proche paraît énorme, et ce qui est loin rétrécit jusqu’à n’être qu’un point. En général, c’est malin : la récompense ou la menace juste devant vous compte souvent le plus.",
          "Une douceur maintenant paraît énorme. Votre épargne pour l’an prochain ? Juste un point. C’est l’actualisation hyperbolique.",
          "Un enfant avec un nom et un visage vous touche plus que des milliers de personnes dans le même besoin. C’est l’effet de la victime identifiable.",
          "Et le modèle neuf semble meilleur, juste parce qu’il est neuf, tandis que le téléphone qui marche bien s’efface. C’est l’appel à la nouveauté.",
          "Pourtant, ce qui rétrécit est souvent ce qui compte le plus : une plus grosse récompense, plus de personnes, quelque chose d’éprouvé.",
          "La solution : élargissez votre regard. Imaginez le lointain de près, comme vous-même dans un an.",
          "Mettez le proche et le lointain côte à côte, à leur taille réelle, et le choix devient clair. Et si une nouveauté semble urgente, laissez passer un jour.",
          "L’ici et maintenant. Ce qui est proche paraît plus grand qu’il n’est, alors imaginez le lointain de près avant de choisir."
        ]
      },
      de: {
        name: "Das Hier und Jetzt", shareTitle: "Warum gewinnt, was direkt vor uns liegt, in 30 Sekunden",
        ecline: "Was nah ist, wirkt größer, als es ist, also hol das Ferne nah heran, bevor du wählst.",
        lens: "Hier und Jetzt", wide: "das ganze Bild", kid: "Lena", bias: "Verzerrung", real: ["echte Größe"],
        tags: ["Hyperbolische Diskontierung", "Identifizierbares-Opfer-Effekt", "Appell an die Neuheit"], tw: [220, 242, 172],
        labs: [
          [["direkt hier"], ["weit weg"]],
          [["etwas Süßes", "jetzt"], ["Ersparnisse", "nächstes Jahr"]],
          [["ein Kind", "mit Namen"], ["Tausende", "ohne Namen"]],
          [["das neue Modell", "gerade erschienen"], ["dein altes", "läuft gut"]]
        ],
        rows: ["jetzt oder später", "einer oder Tausende", "neu oder bewährt"],
        caps: [
          "Nahes und Fernes konkurrieren um deine <b>begrenzte Aufmerksamkeit</b>.",
          "Dein Gehirn zoomt auf <b>das Hier und Jetzt</b>. Meist ist das klug.",
          "Etwas Süßes <b>jetzt</b> wirkt riesig. Ersparnisse fürs <b>nächste Jahr</b>? Ein Punkt.",
          "Ein Kind <b>mit Namen</b> bewegt dich mehr als <b>Tausende</b> in Not.",
          "Das <b>neue</b> Modell wirkt besser, nur weil es neu ist.",
          "Dabei ist das, was schrumpft, oft <b>wichtiger</b>.",
          "<b>Die Lösung:</b> Weite deinen Blick. Stell dir das Ferne <b>aus der Nähe</b> vor.",
          "Nebeneinander, in <b>echter Größe</b>, wird die Wahl klar."
        ],
        say: [
          "Nahes und Fernes konkurrieren um deine Aufmerksamkeit. Und deine Aufmerksamkeit ist begrenzt.",
          "Also zoomt dein Gehirn auf das Hier und Jetzt. Was nah ist, wirkt riesig, und was fern ist, schrumpft zu einem Punkt. Meist ist das klug: Die Belohnung oder die Gefahr direkt vor dir zählt oft am meisten.",
          "Etwas Süßes jetzt wirkt riesig. Deine Ersparnisse fürs nächste Jahr? Nur ein Punkt. Das ist hyperbolische Diskontierung.",
          "Ein Kind mit Namen und Gesicht bewegt dich mehr als Tausende Menschen in derselben Not. Das ist der Identifizierbares-Opfer-Effekt.",
          "Und das neue Modell wirkt besser, nur weil es neu ist, während das Handy, das gut läuft, verblasst. Das ist der Appell an die Neuheit.",
          "Dabei ist das, was schrumpft, oft wichtiger: eine größere Belohnung, mehr Menschen, etwas Bewährtes.",
          "Die Lösung: Weite deinen Blick. Stell dir das Ferne aus der Nähe vor, etwa dich selbst in einem Jahr.",
          "Stell Nahes und Fernes nebeneinander, in echter Größe, und die Wahl wird klar. Und wenn sich etwas Neues dringend anfühlt, gib ihm einen Tag.",
          "Das Hier und Jetzt. Was nah ist, wirkt größer, als es ist, also hol das Ferne nah heran, bevor du wählst."
        ]
      },
      it: {
        name: "Il qui e ora", shareTitle: "Perché vince ciò che abbiamo davanti, in 30 secondi",
        ecline: "Ciò che è vicino sembra più grande di quanto sia, quindi immagina da vicino ciò che è lontano prima di scegliere.",
        lens: "qui e ora", wide: "il quadro completo", kid: "Luca", bias: "bias", real: ["dimensione reale"],
        tags: ["Sconto iperbolico", "Effetto vittima identificabile", "Appello alla novità"], tw: [176, 229, 149],
        labs: [
          [["qui vicino"], ["lontano"]],
          [["un dolcetto", "ora"], ["risparmi", "l’anno prossimo"]],
          [["un bambino", "con un nome"], ["migliaia", "senza nome"]],
          [["il nuovo modello", "appena uscito"], ["il tuo vecchio", "funziona bene"]]
        ],
        rows: ["ora o dopo", "uno o migliaia", "nuovo o collaudato"],
        caps: [
          "Cose vicine e lontane si contendono la tua <b>attenzione limitata</b>.",
          "Il cervello fa zoom sul <b>qui e ora</b>. Di solito, è saggio.",
          "Un dolcetto <b>ora</b> sembra enorme. I risparmi per <b>l’anno prossimo</b>? Un puntino.",
          "Un bambino <b>con un nome</b> ti commuove più di <b>migliaia</b> di persone nel bisogno.",
          "Il modello <b>nuovo</b> sembra migliore, solo perché è nuovo.",
          "Eppure ciò che si rimpicciolisce spesso è ciò che <b>conta di più</b>.",
          "<b>La soluzione:</b> allarga lo sguardo. Immagina ciò che è lontano <b>da vicino</b>.",
          "Fianco a fianco, alla <b>dimensione reale</b>, la scelta diventa chiara."
        ],
        say: [
          "Cose vicine e lontane si contendono la tua attenzione. E la tua attenzione è limitata.",
          "Così il cervello fa zoom sul qui e ora. Ciò che è vicino sembra enorme, e ciò che è lontano si riduce a un puntino. Di solito, è saggio: la ricompensa o la minaccia che hai davanti tende a contare di più.",
          "Un dolcetto ora sembra enorme. I tuoi risparmi per l’anno prossimo? Solo un puntino. È lo sconto iperbolico.",
          "Un bambino con un nome e un volto ti commuove più di migliaia di persone nello stesso bisogno. È l’effetto vittima identificabile.",
          "E il modello nuovo sembra migliore, solo perché è nuovo, mentre il telefono che funziona bene sparisce. È l’appello alla novità.",
          "Eppure ciò che si rimpicciolisce spesso è ciò che conta di più: una ricompensa maggiore, più persone, qualcosa di collaudato.",
          "La soluzione: allarga lo sguardo. Immagina ciò che è lontano da vicino, per esempio te stesso fra un anno.",
          "Metti vicino e lontano fianco a fianco, alla loro dimensione reale, e la scelta diventa chiara. E se qualcosa di nuovo sembra urgente, aspetta un giorno.",
          "Il qui e ora. Ciò che è vicino sembra più grande di quanto sia, quindi immagina da vicino ciò che è lontano prima di scegliere."
        ]
      }
    },
    svg(T) {
      const item = (key, icon, extra = "") => `<g data-k="${key}"><g class="ih-it">${ICON[icon]}${extra}</g></g>`;
      const far = (key, icon) => `<circle class="ih-dot" data-k="${key}d" r="3"/>${item(key, icon)}`;
      const lab = (lines, x, near) => lines.map((s, i) => `<text class="${i ? `b${near ? " q" : ""}` : "a"}" x="${x}" y="${FOOT + i * 13}">${s}</text>`).join("");
      const labs = T.labs.map(([n, f], j) => `<g class="ih-lb" data-k="L${j}">${lab(n, NX, true)}${lab(f, FX, false)}</g>`).join("");
      const tags = T.tags.map((t, j) => {
        const w = T.tw[j], x = TAG_X - w / 2;
        return `<g class="ih-tag" data-k="tag${j}"><rect class="bx" x="${x}" y="${TAG_Y}" width="${w}" height="${TAG_H}" rx="8"/>
          <rect class="lb" x="${x + 7}" y="${TAG_Y - 3}" width="${f1(T.bias.length * 5.7 + 6)}" height="6"/><text class="lg" x="${x + 10}" y="${TAG_Y + 3.4}">${T.bias}</text>
          <text class="nm" x="${TAG_X}" y="${TAG_Y + 18.5}">${t}</text></g>`;
      }).join("");
      const rows = T.rows.map((r, i) => {
        const y = ROW[i];
        return `<g class="ih-row" data-k="row${i}"><line x1="177" y1="${y}" x2="303" y2="${y}"/><text x="240" y="${y + 3.4}">${r}</text></g>`;
      }).join("");
      const a = Math.PI * 3 / 4, hx = LX + LR * Math.cos(a), hy = LY + LR * Math.sin(a);
      return `
        <g class="ih-you" data-k="you" transform="translate(42 140)">
          <path class="bd" d="M-25.5 48 V40.5 C-25.5 28.5 -13.5 21 0 21 C13.5 21 25.5 28.5 25.5 40.5 V48"/><circle r="12.75"/>
          <circle class="e" cx="-4.6" cy="-1" r="1.8"/><circle class="e" cx="4.6" cy="-1" r="1.8"/><path class="m" data-k="mouth"/>
        </g>
        ${labs}
        <g data-k="LR">${T.real.map((s, i) => `<text class="ih-real" x="${FX}" y="${FOOT + i * 13}">${s}</text>`).join("")}</g>
        <line class="ih-ray" data-k="ray"/>
        <circle class="ih-ring" data-k="ring" cx="${FX}" r="8"/>
        ${far("fG", "gift")}${far("fS", "savings")}${far("fC", "crowd")}${far("fP", "old")}
        <g data-k="hand"><line class="ih-hd" x1="${f1(hx - 3)}" y1="${f1(hy + 3)}" x2="${f1(hx - 24)}" y2="${f1(hy + 24)}"/><line class="ih-hd2" x1="${f1(hx - 10)}" y1="${f1(hy + 10)}" x2="${f1(hx - 22)}" y2="${f1(hy + 22)}"/></g>
        <rect class="ih-lens" data-k="lens"/>
        <path class="ih-glint" data-k="glint" d="M${LX - 44} ${LY - 12} A46 46 0 0 1 ${LX - 16} ${LY - 43}"/>
        <text class="ih-ll" data-k="ll" x="${LX}" y="64">${T.lens}</text>
        <text class="ih-wl" data-k="wl" x="${WIDE[0] + WIDE[2] / 2}" y="${WIDE[1] - 8}">${T.wide}</text>
        ${item("nG", "gift")}${item("nT", "treat")}${item("nC", "child", `<text class="ih-nt" data-k="kid" y="12.8">${T.kid}</text>`)}${item("nP", "fresh")}
        ${rows}
        ${tags}`;
    },
    S0: { you: 0, g: 0, lens: 0, ll: 0, zoom: 0, ray: 0, rayY: 136, L0: 0, L1: 0, L2: 0, L3: 0, LR: 0,
      nG: 0, nT: 0, nC: 0, nP: 0, fG: 0, fS: 0, fC: 0, fP: 0, ghost: 0, fill: 0, wide: 0, grid: 0,
      rows: 0, good: 0, smile: 0, wl: 0, tag0: 0, tag1: 0, tag2: 0 },
    render(S, k) {
      const op = (key, v) => { k(key).style.opacity = f3(cl(v)); };
      const at = (key, x, y, s) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)}) scale(${f3(Math.max(.001, s))})`);
      op("you", S.you);
      k("mouth").setAttribute("d", `M-4.6 5.5 Q0 ${f1(5.5 + 4 * S.smile)} 4.6 5.5`);
      // the lens: a round glass held close, then opened out into a wide frame round both sides
      const w = S.wide, s0 = .7 + .3 * cl(S.lens), r = LR * s0;
      const L = k("lens");
      L.setAttribute("x", f1(lerp(LX - r, WIDE[0], w))); L.setAttribute("y", f1(lerp(LY - r, WIDE[1], w)));
      L.setAttribute("width", f1(lerp(2 * r, WIDE[2], w))); L.setAttribute("height", f1(lerp(2 * r, WIDE[3], w)));
      L.setAttribute("rx", f1(lerp(r, WIDE[4], w)));
      const hue = `color-mix(in srgb, var(--good) ${Math.round(100 * cl(S.good))}%, var(--q))`;
      L.style.stroke = hue; k("wl").style.fill = hue; op("wl", S.wl);
      L.style.fillOpacity = f3(.07 * (1 - w));
      op("lens", S.lens * 1.6);
      op("glint", S.lens * (1 - w * 2)); op("hand", S.lens * (1 - w * 2));
      op("ll", S.ll);
      // near things: magnified in the lens, then back to real size in their row
      const z = lerp(1, ZOOM, S.zoom);
      at("nG", LX, LY, z * (.7 + .3 * cl(S.nG))); op("nG", S.nG * 1.5);
      ["nT", "nC", "nP"].forEach((key, i) => {
        const v = S[key];
        at(key, NX, lerp(LY, ROW[i], S.grid), lerp(ZOOM, 1, S.grid) * (.7 + .3 * cl(v)));
        op(key, v * 1.5);
      });
      op("kid", (1 - S.grid) * 1.5 - .4);
      // far things: a dot while the lens is on the near side, their real size once you look properly
      const gs = lerp(1, .12, S.zoom);
      at("fG", FX, LY, gs); op("fG", S.fG * (1 - S.zoom * 1.4));
      k("fGd").setAttribute("cx", FX); k("fGd").setAttribute("cy", LY); op("fGd", S.fG * (S.zoom * 1.6 - .5));
      ["fS", "fC", "fP"].forEach((key, i) => {
        const v = cl(S[key]);
        at(key, FX, ROW[i], lerp(.15, REAL[i], S.ghost));
        op(key, v * (.6 * S.ghost + .4 * S.fill));
        k(key).firstChild.setAttribute("class", S.fill < .5 ? "ih-it ih-gh" : "ih-it");
        const d = k(key + "d"); d.setAttribute("cx", FX); d.setAttribute("cy", ROW[i]);
        op(key + "d", v * (1 - S.ghost));
      });
      // attention: a sight line from the lens to the far thing in question
      const ang = Math.atan2(S.rayY - LY, FX - LX), c = Math.cos(ang), s = Math.sin(ang);
      const ray = k("ray");
      ray.setAttribute("x1", f1(LX + (LR + 6) * c)); ray.setAttribute("y1", f1(LY + (LR + 6) * s));
      ray.setAttribute("x2", f1(FX - 13 * c)); ray.setAttribute("y2", f1(S.rayY - 13 * s));
      op("ray", S.ray);
      k("ring").setAttribute("cy", f1(S.rayY)); op("ring", S.ray);
      // labels
      for (let j = 0; j < 4; j++) op("L" + j, S["L" + j]);
      op("LR", S.LR);
      for (let j = 0; j < 3; j++) {
        const v = S["tag" + j];
        op("tag" + j, v * 1.4); k("tag" + j).setAttribute("transform", `translate(0 ${f1(6 * (1 - cl(v)))})`);
        op("row" + j, cl(S.rows - j) * 1.2);
      }
    },
    beats: [
      { steps: [{ to: { you: 1 }, ms: 500, sfx: "pluck" }, { to: { nG: 1, fG: 1 }, ms: 600 }, { to: { L0: 1 }, ms: 400 }], hold: 2400 },
      { steps: [{ to: { lens: 1, ll: 1 }, ms: 450, ease: "out", sfx: "pop" }, { wait: 250 },
        { to: { zoom: 1 }, ms: 1100, ease: "inOut", sfx: "whoosh" }, { to: { ray: 1 }, ms: 400 }], hold: 3000 },
      { steps: [{ to: { nG: 0, fG: 0, L0: 0 }, ms: 350 }, { to: { nT: 1, fS: 1, rayY: ROW[0] }, ms: 550, ease: "out", sfx: "pop" },
        { to: { L1: 1 }, ms: 350 }, { wait: 200 }, { to: { tag0: 1 }, ms: 400 }], hold: 2600 },
      { steps: [{ to: { nT: 0, L1: 0, tag0: 0 }, ms: 350 }, { to: { nC: 1, fC: 1, rayY: ROW[1] }, ms: 550, ease: "out", sfx: "pluck" },
        { to: { L2: 1 }, ms: 350 }, { wait: 200 }, { to: { tag1: 1 }, ms: 400 }], hold: 3000 },
      { steps: [{ to: { nC: 0, L2: 0, tag1: 0 }, ms: 350 }, { to: { nP: 1, fP: 1, rayY: ROW[2] }, ms: 550, ease: "out", sfx: "pop" },
        { to: { L3: 1 }, ms: 350 }, { wait: 200 }, { to: { tag2: 1 }, ms: 400 }], hold: 2800 },
      { steps: [{ to: { tag2: 0, L3: 0, ray: 0 }, ms: 400 }, { to: { ghost: 1 }, ms: 1100, ease: "inOut", sfx: "tick" }, { to: { LR: 1 }, ms: 400 }], hold: 2800 },
      { steps: [{ to: { LR: 0, ll: 0 }, ms: 300 }, { to: { wide: 1, grid: 1 }, ms: 1300, ease: "inOut", sfx: "whoosh" },
        { to: { fill: 1, nT: 1, nC: 1, wl: 1 }, ms: 600 }], hold: 2800 },
      { steps: [{ to: { rows: 3 }, ms: 1200, ease: "lin" },
        { to: { good: 1, smile: 1 }, ms: 600, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
