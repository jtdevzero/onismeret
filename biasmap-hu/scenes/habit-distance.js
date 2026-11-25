/* Habit: put distance between you and the choice. 11 pm, an annoying email, a sharp reply with the
   cursor on Send. Saving it as a draft, asking what you'd tell a friend, and sleeping on it let the
   anger cool; in the morning the calm version goes out. It catches the empathy gap. Scene for anim.js. */
(function () {
  const KEY = "habit-distance", P = `.bp[data-scene="${KEY}"]`;
  const HY = 191;                                   // head centre of every bust (shoulders rest on the desk at 246)
  const MX0 = 112, MX1 = 64, MX2 = 310;             // you: at the screen, stepped back, in the empathy-gap picture
  const FX = 132, GX = 90;                          // the friend in your spot; last night's you in the gap picture
  const CKX = 132, CKY = 46;                        // the clock
  const T0 = 23 * 60 + 4, T1 = 31 * 60 + 30;        // 23:04 to 07:30 the next morning, in minutes
  const SV = { x: 182, y: 178, w: 100, h: 20 };     // the Save draft button
  const SD = { x: 306, y: 178, w: 70, h: 20 };      // the Send button
  const cl = v => Math.max(0, Math.min(1, v));
  const f1 = n => +n.toFixed(1);
  const pad = n => String(n).padStart(2, "0");
  const hm = m => [Math.floor(m / 60) % 24, Math.floor(m % 60)];
  const timeEn = m => { const [h, mm] = hm(m); return `${(h + 11) % 12 + 1}:${pad(mm)} ${h < 12 ? "am" : "pm"}`; };
  const timeEl = m => { const [h, mm] = hm(m); return `${pad(h)}:${pad(mm)}`; };
  // the habit tile's four-point sparkle
  const spark = (x, y, r) => `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`;

  const sunRays = (x, y, r1, r2) => [0, 1, 2, 3, 4, 5, 6, 7].map(i => {
    const a = i * Math.PI / 4, c = Math.cos(a), n = Math.sin(a);
    return `M${f1(x + c * r1)} ${f1(y + n * r1)} L${f1(x + c * r2)} ${f1(y + n * r2)}`;
  }).join(" ");
  // a bust drawn like the habit tile's person: head and shoulders, resting on the desk
  const SHOULDERS = "M-28.6 55 V46.2 C-28.6 30.8 -15.4 23.1 0 23.1 C15.4 23.1 28.6 30.8 28.6 46.2 V55";
  const EYES_O = `<circle cx="-5" cy="-1.5" r="1.7"/><circle cx="5" cy="-1.5" r="1.7"/>`;
  const EYES_C = "M-8.4 -1.1 Q-5.5 1.8 -2.6 -1.1 M2.6 -1.1 Q5.5 1.8 8.4 -1.1";
  const BROWS = "M-9.5 -9 L-3 -6 M9.5 -9 L3 -6";
  const STEAM = "M-5 -19 Q-8.5 -23.5 -5 -28 Q-1.5 -32.5 -5 -37 M5 -19 Q1.5 -23.5 5 -28 Q8.5 -32.5 5 -37";
  const mouth = m => `M-5 6.5 Q0 ${f1(6.5 + 5 * m)} 5 6.5`;
  const angry = (cls, x) => `<g class="${cls}" transform="translate(${x} ${HY})"><path class="hd-fl" d="${SHOULDERS}"/><circle class="hd-fl" r="14.3"/>
      <circle class="hd-hot" r="14.3"/><g class="hd-e">${EYES_O}</g><path class="hd-ln" d="${BROWS} ${mouth(-1)}"/><path class="hd-steam" d="${STEAM}"/></g>`;
  const button = (b, cls, key, label) => `<g class="hd-b ${cls}" data-k="${key}"><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${b.h / 2}"/>
      <text x="${b.x + b.w / 2}" y="${b.y + 14}">${label}</text></g>`;

  window.BiasAnim.SCENES[KEY] = {
    q: "mem", viewBox: "0 0 400 272",
    css: `
      ${P} .hd-ln{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hd-fl{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hd-e{fill:var(--ink)}
      ${P} .hd-desk{stroke:var(--rule);stroke-width:2.2;stroke-linecap:round}
      ${P} .hd-moon{fill:var(--q);stroke:var(--q);stroke-width:2;stroke-linejoin:round}
      ${P} .hd-sun circle{fill:var(--q);fill-opacity:.25;stroke:var(--q);stroke-width:2}
      ${P} .hd-sun path{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round}
      ${P} .hd-tk{stroke:var(--faint);stroke-width:1.6;stroke-linecap:round}
      ${P} .hd-hand{stroke:var(--ink);stroke-linecap:round}
      ${P} .hd-time{font:500 10.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .hd-hot{fill:none;stroke:var(--bad);stroke-width:2.4}
      ${P} .hd-steam{fill:none;stroke:var(--bad);stroke-width:2;stroke-linecap:round}
      ${P} .hd-th{fill:var(--surface);stroke:var(--ink);stroke-width:2;stroke-linejoin:round}
      ${P} .hd-merc{fill:var(--bad)}
      ${P} .hd-thl{font:500 9.5px var(--mono);fill:var(--bad)}
      ${P} .hd-z{font:500 11px var(--mono);fill:var(--q)}
      ${P} .hd-scr{fill:var(--surface);stroke:var(--ink);stroke-width:2.2;stroke-linejoin:round}
      ${P} .hd-rule{stroke:var(--rule);stroke-width:1.6}
      ${P} .hd-dot{fill:var(--faint)}
      ${P} .hd-gl{fill:none;stroke:var(--faint);stroke-width:2;stroke-linecap:round}
      ${P} .hd-av circle{fill:none;stroke:var(--muted);stroke-width:1.6}
      ${P} .hd-av .e{fill:var(--muted);stroke:none}
      ${P} .hd-av path{fill:none;stroke:var(--muted);stroke-width:1.5;stroke-linecap:round}
      ${P} .hd-name{font:600 12px var(--display);fill:var(--ink)}
      ${P} .hd-quote{font:600 13px var(--display);fill:var(--ink)}
      ${P} .hd-lab{font:500 9.5px var(--mono);fill:var(--muted)}
      ${P} .hd-sharp{font:600 13px var(--display);fill:var(--bad)}
      ${P} .hd-calm{font:600 13px var(--display);fill:var(--good)}
      ${P} .hd-rl{fill:none;stroke:var(--bad);stroke-width:2;stroke-linecap:round;stroke-opacity:.6}
      ${P} .hd-gr{fill:none;stroke:var(--good);stroke-width:2;stroke-linecap:round;stroke-opacity:.6}
      ${P} .hd-b rect{fill:var(--surface);stroke:var(--muted);stroke-width:1.6}
      ${P} .hd-b text{font:600 10.5px var(--display);fill:var(--muted);text-anchor:middle}
      ${P} .hd-b.q rect{stroke:var(--q)} ${P} .hd-b.q text{fill:var(--q)}
      ${P} .hd-b.r rect{fill:var(--bad);fill-opacity:.14;stroke:var(--bad)} ${P} .hd-b.r text{fill:var(--bad)}
      ${P} .hd-b.g rect{fill:var(--good);fill-opacity:.14;stroke:var(--good)} ${P} .hd-b.g text{fill:var(--good)}
      ${P} .hd-b path{fill:none;stroke:var(--good);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hd-sent text{text-anchor:start}
      ${P} .hd-cur{fill:var(--surface);stroke:var(--ink);stroke-width:1.6;stroke-linejoin:round}
      ${P} .hd-ring{fill:none;stroke:var(--q);stroke-width:2}
      ${P} .hd-bub rect,${P} .hd-bub circle{fill:var(--surface);stroke:var(--bad);stroke-width:1.8}
      ${P} .hd-bub text{font:600 12px var(--display);fill:var(--bad);text-anchor:middle}
      ${P} .hd-say rect,${P} .hd-say path{fill:var(--surface);stroke:var(--good);stroke-width:1.8;stroke-linejoin:round}
      ${P} .hd-say text{font:600 12px var(--display);fill:var(--good);text-anchor:middle}
      ${P} .hd-arr{fill:none;stroke:var(--q);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      ${P} .hd-note{font:500 9.5px var(--mono);fill:var(--q);text-anchor:middle}
      ${P} .hd-fr .hd-fl{stroke:var(--q);stroke-dasharray:4 3.2}
      ${P} .hd-fr .hd-hot{display:none}
      ${P} .hd-fr .hd-ln{stroke:var(--q)} ${P} .hd-fr .hd-e{fill:var(--q)}
      ${P} .hd-you{font:500 10px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .hd-cant{font:600 11px var(--display);fill:var(--ink);text-anchor:middle}
      ${P} .hd-catch{font:500 9.5px var(--mono);fill:var(--muted);text-anchor:middle}
      ${P} .hd-gap{font:700 15px var(--display);fill:var(--bad);text-anchor:middle}
      ${P} .hd-gapl{fill:none;stroke:var(--bad);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    `,
    text: {
      hu: {
        name: "Tarts távolságot a választástól",
        shareTitle: "Tarts távolságot a választástól: egy szokás 30 másodpercben",
        ecline: "A hevület pillanatában a rossz választás helyesnek érződik: aludj rá egyet, vagy kérdezd meg magadtól, mit mondanál egy barátodnak.",
        time: timeEl, from: "Sam", quote: "„Harmadszorra is…”", repLab: "A válaszod",
        sharp: "„Tanulj meg olvasni!”", calm: "„Igazad van. Itt a válasz:”",
        save: "Piszkozat mentése", saved: "Piszkozat mentve", send: "Küldés", sent: "Elküldve",
        anger: "düh", think: "Megérdemli.", thinkW: 134, dont: "Ezt ne küldd el.", dontW: 124, dist: "távolság",
        youAt: t => `te, ${t}-kor`, cant1: "nem tudod elképzelni a nyugalmat", cant2: "nem tudod elképzelni a dühöt",
        catches: "elkapja", gap: "Empátiahiány", gapFs: 15,
        caps: [
          "<b>Este 11.</b> Egy bosszantó e-mail érkezik egy kollégától.",
          "Forrsz a dühtől. Éles választ gépelsz, az ujjad a <b>Küldés</b> fölött.",
          "Ebben az állapotban a válasz <b>teljesen jogosnak</b> tűnik.",
          "<b>Tarts távolságot</b> a választástól: mentsd <b>piszkozatként</b>.",
          "Kérdezd meg, mit mondanál <b>egy barátodnak</b> a helyzetedben: „Ezt ne küldd el.”",
          "Aztán <b>aludj rá egyet</b>. Reggelre a düh lecsillapodik.",
          "Ez az <b>empátiahiány</b> elkapása: haragban nem tudod elképzelni a nyugalmat.",
          "Ismét nyugodtan újraírod, és elküldöd <b>a jobb változatot</b>."
        ],
        say: [
          "Este tizenegy van. Egy bosszantó e-mail érkezik egy kollégától.",
          "Forrsz a dühtől. Éles választ gépelsz, és az ujjad a Küldés fölött lebeg.",
          "Ebben az állapotban a válasz teljesen jogosnak tűnik. Megérdemlik.",
          "Tarts távolságot a választástól. Mentsd piszkozatként, és lépj egyet hátra.",
          "Kérdezd meg, mit mondanál egy barátodnak a helyzetedben. Azt mondanád: ezt ne küldd el.",
          "Aztán aludj rá egyet. Reggelre a düh lecsillapodik.",
          "Ez az empátiahiány elkapása. Haragban nem tudod elképzelni a nyugalmat. Nyugodtan pedig nem érzed a dühöt.",
          "Ismét nyugodtan újraírod, és elküldöd a jobb változatot.",
          "Tarts távolságot a választástól. A hevület pillanatában a rossz választás helyesnek érződik. Aludj rá egyet, vagy kérdezd meg magadtól, mit mondanál egy barátodnak."
        ]
      },
      en: {
        name: "Put distance between you and the choice",
        shareTitle: "Put distance between you and the choice: a habit in 30 seconds",
        ecline: "In the heat of the moment, a bad choice feels right: sleep on it, or ask what you'd tell a friend.",
        time: timeEn, from: "Sam", quote: "“For the third time…”", repLab: "Your reply",
        sharp: "“Learn to read!”", calm: "“Fair point. Here it is:”",
        save: "Save draft", saved: "Draft saved", send: "Send", sent: "Sent",
        anger: "anger", think: "Serves them right.", thinkW: 134, dont: "Don't send that.", dontW: 124, dist: "distance",
        youAt: t => `you at ${t}`, cant1: "can't imagine calm", cant2: "can't imagine anger",
        catches: "catches", gap: "Empathy gap", gapFs: 15,
        caps: [
          "<b>11 pm.</b> An annoying email from a colleague lands.",
          "You're fuming. You type a sharp reply, finger over <b>Send</b>.",
          "In this state, the reply feels <b>completely justified</b>.",
          "<b>Put distance</b> between you and the choice: save it as a <b>draft</b>.",
          "Ask what you'd tell <b>a friend</b> in your spot: “Don't send that.”",
          "Then <b>sleep on it</b>. By morning, the anger has cooled.",
          "It catches the <b>empathy gap</b>: while\u00a0angry, you can't imagine calm.",
          "Calm again, you rewrite it and send <b>the better version</b>."
        ],
        say: [
          "It's eleven at night. An annoying email from a colleague lands.",
          "You're fuming. You type a sharp reply, and your finger hovers over Send.",
          "In this state, the reply feels completely justified. Serves them right.",
          "Put distance between you and the choice. Save it as a draft, and step back.",
          "Ask what you'd tell a friend in your spot. You'd say: don't send that.",
          "Then sleep on it. By morning, the anger has cooled.",
          "It catches the empathy gap. While you're angry, you can't imagine feeling calm. Once you're calm, you can't feel the anger.",
          "Calm again, you rewrite it, and send the better version.",
          "Put distance between you and the choice. In the heat of the moment, a bad choice feels right. Sleep on it, or ask what you'd tell a friend."
        ]
      },
      el: {
        name: "Πάρε απόσταση από την επιλογή",
        shareTitle: "Πάρε απόσταση από την επιλογή: μια συνήθεια σε 30 δευτερόλεπτα",
        ecline: "Πάνω στη βράση, μια κακή επιλογή μοιάζει σωστή: άφησε να περάσει μια νύχτα ή σκέψου τι θα έλεγες σε έναν φίλο.",
        time: timeEl, from: "Άλεξ", quote: "«Για τρίτη φορά…»", repLab: "Η απάντησή σου",
        sharp: "«Μάθε να διαβάζεις!»", calm: "«Δίκιο έχεις. Ορίστε:»",
        save: "Αποθήκευση", saved: "Αποθηκεύτηκε", send: "Αποστολή", sent: "Στάλθηκε",
        anger: "θυμός", think: "Καλά να πάθει.", thinkW: 112, dont: "Μην το στείλεις.", dontW: 124, dist: "απόσταση",
        youAt: t => `εσύ στις ${t}`, cant1: "δεν φαντάζεσαι την ηρεμία", cant2: "δεν φαντάζεσαι τον θυμό",
        catches: "σε προστατεύει από", gap: "Χάσμα ενσυναίσθησης", gapFs: 14,
        caps: [
          "<b>11 το βράδυ.</b> Σου έρχεται ένα εκνευριστικό μέιλ από συνάδελφο.",
          "Βράζεις. Γράφεις μια αιχμηρή απάντηση και πας να πατήσεις <b>«Αποστολή»</b>.",
          "Πάνω στον θυμό, η απάντηση μοιάζει <b>απόλυτα δικαιολογημένη</b>.",
          "<b>Πάρε απόσταση</b> από την επιλογή: κράτα την απάντηση στα <b>πρόχειρα</b>.",
          "Σκέψου τι θα έλεγες σε <b>έναν φίλο</b> στη θέση σου: «Μην το στείλεις».",
          "Μετά, <b>άσ’\u00a0το για αύριο</b>. Το\u00a0πρωί, ο θυμός έχει περάσει.",
          "Έτσι πιάνεις το <b>χάσμα ενσυναίσθησης</b>: όσο θυμώνεις, δεν φαντάζεσαι την ηρεμία.",
          "Με καθαρό μυαλό, ξαναγράφεις την\u00a0απάντηση και στέλνεις <b>την καλύτερη εκδοχή</b>."
        ],
        say: [
          "Έντεκα το βράδυ. Σου έρχεται ένα εκνευριστικό μέιλ από συνάδελφο.",
          "Βράζεις. Γράφεις μια αιχμηρή απάντηση και πας να πατήσεις αποστολή.",
          "Πάνω στον θυμό, η απάντηση μοιάζει απόλυτα δικαιολογημένη. Καλά να πάθει.",
          "Πάρε απόσταση από την επιλογή. Κράτα την απάντηση στα πρόχειρα και κάνε ένα βήμα πίσω.",
          "Σκέψου τι θα έλεγες σε έναν φίλο στη θέση σου. Θα έλεγες: μην το στείλεις.",
          "Μετά, άσ’ το για αύριο. Το πρωί, ο θυμός έχει περάσει.",
          "Έτσι πιάνεις το χάσμα ενσυναίσθησης. Όσο θυμώνεις, δεν φαντάζεσαι την ηρεμία. Κι όταν ηρεμήσεις, δεν νιώθεις πια τον θυμό.",
          "Με καθαρό μυαλό, ξαναγράφεις την απάντηση και στέλνεις την καλύτερη εκδοχή.",
          "Πάρε απόσταση από την επιλογή. Πάνω στη βράση, μια κακή επιλογή μοιάζει σωστή. Άφησε να περάσει μια νύχτα ή σκέψου τι θα έλεγες σε έναν φίλο."
        ]
      },
      es: {
        name: "Toma distancia de la decisión",
        shareTitle: "Toma distancia de la decisión: un hábito en 30 segundos",
        ecline: "En el calor del momento, una mala decisión parece correcta: consúltalo con la almohada o piensa qué le dirías a un amigo.",
        time: m => { const [h, mm] = hm(m); return `${pad(h)}:${pad(mm)}`; }, from: "Álex", quote: "«Por tercera vez…»", repLab: "Tu respuesta",
        sharp: "«¡Aprende a leer!»", calm: "«Tienes razón. Aquí está:»",
        save: "Guardar", saved: "Guardado", send: "Enviar", sent: "Enviado",
        anger: "rabia", think: "Se lo merece.", thinkW: 134, dont: "No lo envíes.", dontW: 124, dist: "distancia",
        youAt: t => `tú a las ${t}`, cant1: "no imaginas la calma", cant2: "no imaginas la rabia",
        catches: "detecta", gap: "Brecha de empatía", gapFs: 15,
        caps: [
          "<b>Las 11 de la noche.</b> Te llega un correo molesto de un compañero.",
          "Estás que echas humo. Escribes una respuesta cortante, con el dedo sobre <b>Enviar</b>.",
          "En ese estado, la respuesta parece <b>totalmente justificada</b>.",
          "<b>Toma distancia</b> de la decisión: guárdala como <b>borrador</b>.",
          "Piensa qué le dirías a <b>un amigo</b> en tu lugar: «No lo envíes».",
          "Luego <b>consúltalo con la almohada</b>. Por la mañana, la rabia se ha enfriado.",
          "Detecta la <b>brecha de empatía</b>: con rabia, no logras imaginar la calma.",
          "Ya en calma, la reescribes y envías <b>una versión mejor</b>."
        ],
        say: [
          "Son las once de la noche. Te llega un correo molesto de un compañero.",
          "Estás que echas humo. Escribes una respuesta cortante, y tienes el dedo sobre Enviar.",
          "En ese estado, la respuesta parece totalmente justificada. Se lo merece.",
          "Toma distancia de la decisión. Guárdala como borrador y aléjate un poco.",
          "Piensa qué le dirías a un amigo en tu lugar. Le dirías: no lo envíes.",
          "Luego consúltalo con la almohada. Por la mañana, la rabia se ha enfriado.",
          "Detecta la brecha de empatía. Con rabia, no logras imaginarte tranquilo. Ya tranquilo, no logras sentir la rabia.",
          "Ya en calma, la reescribes y envías una versión mejor.",
          "Toma distancia de la decisión. En el calor del momento, una mala decisión parece correcta. Consúltalo con la almohada, o piensa qué le dirías a un amigo."
        ]
      },
      fr: {
        name: "Prenez du recul sur le choix",
        shareTitle: "Prenez du recul sur le choix : une habitude en 30 secondes",
        ecline: "Dans le feu de l’action, un mauvais choix semble juste : laissez passer la nuit, ou demandez-vous ce que vous diriez à un ami.",
        time: m => { const [h, mm] = hm(m); return `${pad(h)}:${pad(mm)}`; }, from: "Léa", quote: "« Pour la troisième fois… »", repLab: "Votre réponse",
        sharp: "« Apprenez à lire ! »", calm: "« Bien vu. La voici : »",
        save: "Enregistrer", saved: "Enregistré", send: "Envoyer", sent: "Envoyé",
        anger: "colère", think: "Bien fait pour lui.", thinkW: 134, dont: "Je ne l’enverrais pas.", dontW: 140, dist: "recul",
        youAt: t => `vous à ${t}`, cant1: "n’imaginez pas le calme", cant2: "n’imaginez pas la colère",
        catches: "déjoue", gap: "Fossé d’empathie", gapFs: 15,
        caps: [
          "<b>23 h.</b> Un e-mail agaçant d’un collègue arrive.",
          "Vous bouillez. Vous tapez une réponse cinglante, le doigt sur <b>Envoyer</b>.",
          "Dans cet état, la réponse semble <b>totalement justifiée</b>.",
          "<b>Prenez du recul</b> sur le choix : enregistrez-la en <b>brouillon</b>.",
          "Demandez-vous ce que vous diriez à <b>un ami</b> à votre place : « Je ne l’enverrais pas. »",
          "Puis <b>laissez passer la nuit</b>. Au matin, la colère est retombée.",
          "Elle déjoue le <b>fossé d’empathie</b> : en colère, vous n’imaginez pas le calme.",
          "Une fois calme, vous la réécrivez et envoyez <b>la meilleure version</b>."
        ],
        say: [
          "Il est vingt-trois heures. Un e-mail agaçant d’un collègue arrive.",
          "Vous bouillez. Vous tapez une réponse cinglante, et votre doigt survole le bouton Envoyer.",
          "Dans cet état, la réponse semble totalement justifiée. Bien fait pour lui.",
          "Prenez du recul sur le choix. Enregistrez-la en brouillon, et éloignez-vous un peu.",
          "Demandez-vous ce que vous diriez à un ami à votre place. Vous diriez : je ne l’enverrais pas.",
          "Puis laissez passer la nuit. Au matin, la colère est retombée.",
          "Elle déjoue le fossé d’empathie. En colère, vous n’imaginez pas le calme. Une fois calme, vous ne ressentez plus la colère.",
          "Une fois calme, vous la réécrivez, et envoyez la meilleure version.",
          "Prenez du recul sur le choix. Dans le feu de l’action, un mauvais choix semble juste. Laissez passer la nuit, ou demandez-vous ce que vous diriez à un ami."
        ]
      },
      de: {
        name: "Geh auf Abstand zur Entscheidung",
        shareTitle: "Geh auf Abstand zur Entscheidung: eine Gewohnheit in 30 Sekunden",
        ecline: "Im Eifer des Gefechts fühlt sich eine schlechte Entscheidung richtig an: Schlaf eine Nacht darüber, oder frag dich, was du einem Freund sagen würdest.",
        time: m => { const [h, mm] = hm(m); return `${pad(h)}:${pad(mm)}`; }, from: "Jonas", quote: "„Zum dritten Mal…“", repLab: "Deine Antwort",
        sharp: "„Lern lesen!“", calm: "„Stimmt. Hier ist sie:“",
        save: "Entwurf sichern", saved: "Gesichert", send: "Senden", sent: "Gesendet",
        anger: "Wut", think: "Geschieht ihm recht.", thinkW: 151, dont: "Schick das nicht.", dontW: 135, dist: "Abstand",
        youAt: t => `du um ${t}`, cant1: "Ruhe? Unvorstellbar.", cant2: "Wut? Unvorstellbar.",
        catches: "hilft gegen", gap: "Empathielücke", gapFs: 15,
        caps: [
          "<b>23 Uhr.</b> Eine nervige E-Mail von einem Kollegen kommt an.",
          "Du kochst vor Wut. Du tippst eine scharfe Antwort, den Finger über <b>Senden</b>.",
          "In diesem Zustand wirkt die Antwort <b>völlig berechtigt</b>.",
          "<b>Geh auf Abstand</b> zur Entscheidung: Speichere sie als <b>Entwurf</b>.",
          "Frag dich, was du <b>einem Freund</b> an deiner Stelle sagen würdest: „Schick das nicht.“",
          "Dann <b>schlaf eine Nacht darüber</b>. Am Morgen ist die Wut verraucht.",
          "Diese Gewohnheit fängt die <b>Empathielücke</b> ab: Wütend kannst du dir Ruhe nicht vorstellen.",
          "Wieder ruhig, schreibst du sie neu und schickst <b>die bessere Version</b>."
        ],
        say: [
          "Es ist elf Uhr abends. Eine nervige E-Mail von einem Kollegen kommt an.",
          "Du kochst vor Wut. Du tippst eine scharfe Antwort, und dein Finger schwebt über Senden.",
          "In diesem Zustand wirkt die Antwort völlig berechtigt. Geschieht ihm recht.",
          "Geh auf Abstand zur Entscheidung. Speichere sie als Entwurf und tritt einen Schritt zurück.",
          "Frag dich, was du einem Freund an deiner Stelle sagen würdest. Du würdest sagen: Schick das nicht.",
          "Dann schlaf eine Nacht darüber. Am Morgen ist die Wut verraucht.",
          "Diese Gewohnheit fängt die Empathielücke ab. Solange du wütend bist, kannst du dir Ruhe nicht vorstellen. Sobald du ruhig bist, spürst du die Wut nicht mehr.",
          "Wieder ruhig, schreibst du sie neu und schickst die bessere Version.",
          "Geh auf Abstand zur Entscheidung. Im Eifer des Gefechts fühlt sich eine schlechte Entscheidung richtig an. Schlaf eine Nacht darüber, oder frag dich, was du einem Freund sagen würdest."
        ]
      },
      it: {
        name: "Prendi le distanze dalla scelta",
        shareTitle: "Prendi le distanze dalla scelta: un’abitudine in 30 secondi",
        ecline: "A caldo, una scelta sbagliata sembra giusta: dormici sopra, o chiediti cosa diresti a un amico.",
        time: m => { const [h, mm] = hm(m); return `${h}:${pad(mm)}`; }, from: "Luca", quote: "«Per la terza volta…»", repLab: "La tua risposta",
        sharp: "«Impara a leggere!»", calm: "«Hai ragione. Eccolo:»",
        save: "Salva bozza", saved: "Bozza salvata", send: "Invia", sent: "Inviata",
        anger: "rabbia", think: "Se lo merita.", thinkW: 134, dont: "Non inviarla.", dontW: 124, dist: "distanza",
        youAt: t => `tu alle ${t}`, cant1: "non immagini la calma", cant2: "non immagini la rabbia",
        catches: "smaschera", gap: "Divario di empatia", gapFs: 15,
        caps: [
          "<b>Ore 23.</b> Arriva una mail irritante da un collega.",
          "Ribolli di rabbia. Scrivi una risposta tagliente, il dito su <b>Invia</b>.",
          "In questo stato, la risposta sembra <b>del tutto giustificata</b>.",
          "<b>Prendi le distanze</b> dalla scelta: salvala come <b>bozza</b>.",
          "Chiediti cosa diresti a <b>un amico</b> al tuo posto: «Non inviarla».",
          "Poi <b>dormici sopra</b>. Al mattino, la rabbia si è calmata.",
          "Smaschera il <b>divario di empatia</b>: nella rabbia, non immagini la calma.",
          "Tornata la calma, la riscrivi e invii <b>la versione migliore</b>."
        ],
        say: [
          "Sono le undici di sera. Arriva una mail irritante da un collega.",
          "Ribolli di rabbia. Scrivi una risposta tagliente, e il dito resta sospeso su Invia.",
          "In questo stato, la risposta sembra del tutto giustificata. Se lo merita.",
          "Prendi le distanze dalla scelta. Salvala come bozza, e fai un passo indietro.",
          "Chiediti cosa diresti a un amico al tuo posto. Gli diresti: non inviarla.",
          "Poi dormici sopra. Al mattino, la rabbia si è calmata.",
          "Smaschera il divario di empatia. Nella rabbia, non riesci a immaginare la calma. Quando torna la calma, non senti più la rabbia.",
          "Tornata la calma, la riscrivi, e invii la versione migliore.",
          "Prendi le distanze dalla scelta. A caldo, una scelta sbagliata sembra giusta. Dormici sopra, o chiediti cosa diresti a un amico."
        ]
      }
    },
    svg(T) {
      let ticks = "";
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6, r1 = i % 3 ? 17.5 : 15.5, r2 = 19.5;
        ticks += `<line class="hd-tk" x1="${f1(CKX + Math.sin(a) * r1)}" y1="${f1(CKY - Math.cos(a) * r1)}" x2="${f1(CKX + Math.sin(a) * r2)}" y2="${f1(CKY - Math.cos(a) * r2)}"/>`;
      }
      const gw = T.thinkW, dw = T.dontW;
      return `
        <line class="hd-desk" x1="12" y1="246" x2="388" y2="246"/>
        <g data-k="sky">
          <g data-k="moon"><path class="hd-moon" transform="translate(-35 12.5) scale(1.18)" d="M66 12 A14 14 0 1 0 80 34 A11 11 0 0 1 66 12 Z"/>
            <path class="hd-moon" d="${spark(88, 24, 4.2)} ${spark(22, 76, 3.4)} ${spark(84, 72, 3.4)}"/></g>
          <g class="hd-sun" data-k="sun"><circle cx="46" cy="46" r="10"/><path d="${sunRays(46, 46, 15, 20)}"/></g>
          <circle class="hd-fl" cx="${CKX}" cy="${CKY}" r="23"/>${ticks}
          <line class="hd-hand" data-k="hh" x1="${CKX}" y1="${CKY}" x2="${CKX}" y2="${CKY - 10}" style="stroke-width:2.8"/>
          <line class="hd-hand" data-k="mh" x1="${CKX}" y1="${CKY}" x2="${CKX}" y2="${CKY - 16}" style="stroke-width:2"/>
          <circle class="hd-e" cx="${CKX}" cy="${CKY}" r="2.2"/>
          <text class="hd-time" data-k="time" x="${CKX}" y="87"></text>
        </g>
        <g data-k="mon">
          <path class="hd-fl" d="M276 210 L272 240 H300 L296 210"/><path class="hd-ln" d="M258 244 H314"/>
          <rect class="hd-scr" x="170" y="14" width="218" height="196" rx="8"/>
          <g data-k="ui">
            <circle class="hd-dot" cx="182" cy="25" r="2.4"/><circle class="hd-dot" cx="191" cy="25" r="2.4"/><circle class="hd-dot" cx="200" cy="25" r="2.4"/>
            <line class="hd-rule" x1="171" y1="36" x2="387" y2="36"/>
            <g data-k="mail">
              <g class="hd-av"><circle cx="193" cy="57" r="10"/><circle class="e" cx="189.5" cy="55.5" r="1.3"/><circle class="e" cx="196.5" cy="55.5" r="1.3"/>
                <path d="M190 61.5 H196 M194.5 51 L199 50"/></g>
              <text class="hd-name" x="210" y="55">${T.from}</text><path class="hd-gl" d="M210 65 H258"/>
              <text class="hd-quote" x="182" y="90">${T.quote}</text>
            </g>
            <g data-k="rep"><line class="hd-rule" x1="171" y1="104" x2="387" y2="104"/><text class="hd-lab" x="182" y="121">${T.repLab}</text></g>
            <text class="hd-sharp" data-k="typed" x="182" y="143"></text>
            <text class="hd-calm" data-k="typed2" x="182" y="143"></text>
            <path class="hd-rl" data-k="rl1" pathLength="1" stroke-dasharray="1 1" d="M182 157 H352"/>
            <path class="hd-rl" data-k="rl2" pathLength="1" stroke-dasharray="1 1" d="M182 168 H290"/>
            <path class="hd-gr" data-k="gl1" pathLength="1" stroke-dasharray="1 1" d="M182 157 H360"/>
            <path class="hd-gr" data-k="gl2" pathLength="1" stroke-dasharray="1 1" d="M182 168 H318"/>
            <g data-k="btns">
              ${button(SV, "", "svA", T.save)}${button(SV, "q", "svB", T.saved)}
              <g data-k="send">${button(SD, "r", "sdR", T.send)}${button(SD, "g", "sdG", T.send)}</g>
            </g>
            <g class="hd-b g hd-sent" data-k="sent"><rect x="${SD.x - 12}" y="${SD.y}" width="${SD.w + 12}" height="${SD.h}" rx="${SD.h / 2}"/>
              <path d="M${SD.x - 2} ${SD.y + 10} L${SD.x + 1.5} ${SD.y + 13.5} L${SD.x + 7.5} ${SD.y + 6.5}"/><text x="${SD.x + 13}" y="${SD.y + 14}">${T.sent}</text></g>
          </g>
        </g>
        <g data-k="therm">
          <path class="hd-th" d="M17.5 180 A4.5 4.5 0 0 1 26.5 180 V226 A7.5 7.5 0 1 1 17.5 226 Z"/>
          <circle class="hd-merc" cx="22" cy="232" r="4.5"/><rect class="hd-merc" data-k="merc" x="20" width="4" rx="2"/>
          <text class="hd-thl" x="12" y="169">${T.anger}</text>
        </g>
        <g data-k="dist"><path class="hd-arr" data-k="distA" d="M102 232 H160 M106.5 227.5 L102 232 L106.5 236.5 M155.5 227.5 L160 232 L155.5 236.5"/>
          <text class="hd-note" x="131" y="222">${T.dist}</text></g>
        <g data-k="fr">${angry("hd-fr", FX)}</g>
        <g data-k="me">
          <path class="hd-fl" d="${SHOULDERS}"/><circle class="hd-fl" r="14.3"/><circle class="hd-hot" data-k="hot" r="14.3"/>
          <g class="hd-e" data-k="eo">${EYES_O}</g><path class="hd-ln" data-k="ec" d="${EYES_C}"/>
          <path class="hd-ln" data-k="brow" d="${BROWS}"/><path class="hd-ln" data-k="mouth"/>
          <path class="hd-steam" data-k="steam" d="${STEAM}"/>
          <g data-k="zz"><text class="hd-z" x="17" y="-17">z</text><text class="hd-z" x="25" y="-28" style="font-size:13px">z</text><text class="hd-z" x="34" y="-41" style="font-size:15px">z</text></g>
        </g>
        <g data-k="eg">
          <path class="hd-moon" transform="translate(${f1(GX - 68.7)} ${52 - 25.7})" d="M66 12 A14 14 0 1 0 80 34 A11 11 0 0 1 66 12 Z"/>
          <path class="hd-moon" d="${spark(GX + 24, 38, 3.4)}"/>
          <g class="hd-sun"><circle cx="${MX2}" cy="52" r="9"/><path d="${sunRays(MX2, 52, 13, 17)}"/></g>
          <text class="hd-you" x="${GX}" y="96">${T.youAt(T.time(T0))}</text><text class="hd-cant" x="${GX}" y="114">${T.cant1}</text>
          <text class="hd-you" x="${MX2}" y="96">${T.youAt(T.time(T1))}</text><text class="hd-cant" x="${MX2}" y="114">${T.cant2}</text>
          ${angry("hd-ghost", GX)}
        </g>
        <g data-k="egTag">
          <text class="hd-catch" x="200" y="176">${T.catches}</text><text class="hd-gap" x="200" y="197" style="font-size:${T.gapFs}px">${T.gap}</text>
          <path class="hd-gapl" d="M124 222 H276 M129 217 L124 222 L129 227 M271 217 L276 222 L271 227"/>
        </g>
        <g class="hd-bub" data-k="think"><circle cx="97" cy="169" r="2.2"/><circle cx="89" cy="158" r="3.2"/><circle cx="80" cy="146" r="4.2"/>
          <rect x="${88 - gw / 2}" y="104" width="${gw}" height="30" rx="15"/><text x="88" y="123.5">${T.think}</text></g>
        <g class="hd-say" data-k="dont"><rect x="${80 - dw / 2}" y="118" width="${dw}" height="30" rx="12"/><path d="M62 147 L68 161 L75 147"/>
          <text x="80" y="137.5">${T.dont}</text></g>
        <circle class="hd-ring" data-k="ring"/>
        <g data-k="cur"><path class="hd-cur" d="M0 0 V16 L4.2 12.2 L7.2 18.6 L10 17.4 L7.1 11.1 H12.4 Z"/></g>`;
    },
    S0: { sky: 0, moon: 1, sun: 0, tm: 0, me: 0, mx: MX0, heat: 0, mood: 0, brow: 0, sleep: 0, zz: 0, therm: 0,
      mon: 0, dim: 0, mail: 0, rep: 0, type: 0, rl: 0, btn: 0, cur: 0, cx: 300, cy: 150, ring: 0, pulse: 0, saved: 0, sendOff: 0,
      think: 0, dist: 0, fr: 0, dont: 0, eg: 0, egTag: 0, type2: 0, gl: 0, sendG: 0, sent: 0 },
    render(S, k, T) {
      const op = (key, v) => { k(key).style.opacity = cl(v); };
      const at = (key, x, y) => k(key).setAttribute("transform", `translate(${f1(x)} ${f1(y)})`);
      const grow = (key, x, y, s) => k(key).setAttribute("transform",
        `translate(${f1(x)} ${f1(y)}) scale(${Math.max(.001, s).toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
      const draw = (key, p) => { k(key).style.strokeDashoffset = (1 - cl(p)).toFixed(3); op(key, p > 0 ? 1 : 0); };
      // night sky and clock
      op("sky", S.sky);
      at("moon", 0, 16 * (1 - S.moon)); op("moon", S.moon);
      at("sun", 0, 16 * (1 - S.sun)); op("sun", S.sun);
      const mins = T0 + (T1 - T0) * S.tm;
      k("hh").setAttribute("transform", `rotate(${f1(mins / 60 % 12 * 30)} ${CKX} ${CKY})`);
      k("mh").setAttribute("transform", `rotate(${f1(mins % 60 * 6)} ${CKX} ${CKY})`);
      k("time").textContent = T.time(mins);
      // you
      at("me", S.mx, HY); op("me", S.me);
      op("hot", S.heat);
      op("steam", (S.heat - .45) / .35);
      op("brow", S.brow);
      op("eo", 1 - S.sleep); op("ec", S.sleep);
      k("mouth").setAttribute("d", mouth(S.mood));
      op("zz", S.zz);
      op("therm", S.therm);
      const L = 3 + 45 * cl(S.heat), m = k("merc");
      m.setAttribute("y", f1(230 - L)); m.setAttribute("height", f1(L + 2));
      // the screen
      op("mon", S.mon);
      op("ui", 1 - .8 * S.dim);
      at("mail", 0, -8 * (1 - S.mail)); op("mail", S.mail);
      op("rep", S.rep);
      k("typed").textContent = T.sharp.slice(0, Math.round(T.sharp.length * cl(S.type)));
      k("typed2").textContent = T.calm.slice(0, Math.round(T.calm.length * cl(S.type2)));
      draw("rl1", S.rl * 1.6); draw("rl2", (S.rl - .6) / .4);
      draw("gl1", S.gl * 1.6); draw("gl2", (S.gl - .6) / .4);
      op("btns", S.btn * (1 - S.sent));
      op("svA", 1 - S.saved); op("svB", S.saved);
      op("send", 1 - .75 * S.sendOff);
      grow("send", SD.x + SD.w / 2, SD.y + SD.h / 2, 1 + .08 * Math.sin(Math.PI * S.pulse));
      op("sdR", 1 - S.sendG); op("sdG", S.sendG);
      op("sent", S.sent); at("sent", 0, 5 * (1 - S.sent));
      at("cur", S.cx, S.cy); op("cur", S.cur);
      const rg = k("ring");
      rg.setAttribute("cx", f1(S.cx)); rg.setAttribute("cy", f1(S.cy)); rg.setAttribute("r", f1(3 + 12 * S.ring));
      op("ring", S.ring > 0 && S.ring < 1 ? 1 - S.ring : 0);
      // the habit: a step back, a friend, a night
      op("think", S.think * 2); grow("think", 97, 169, .8 + .2 * S.think);
      op("dist", S.dist); grow("distA", 131, 232, S.dist);
      op("fr", S.fr);
      op("dont", S.dont * 2); grow("dont", 68, 161, .8 + .2 * S.dont);
      // the empathy gap
      op("eg", S.eg); op("egTag", S.egTag * 1.5); grow("egTag", 200, 192, .85 + .15 * S.egTag);
    },
    beats: [
      { steps: [{ to: { sky: 1, me: 1, mon: 1, therm: 1 }, ms: 600 }, { wait: 300 }, { to: { mail: 1 }, ms: 450, ease: "back", sfx: "pop" },
        { wait: 350 }, { to: { mood: -.6, brow: .6, heat: .35 }, ms: 650 }] },
      { steps: [{ to: { rep: 1, btn: 1 }, ms: 350 }, { to: { type: 1, heat: .7, brow: 1, mood: -1 }, ms: 1000, ease: "lin", sfx: "scribble" },
        { to: { rl: 1 }, ms: 500, ease: "lin" }, { to: { cur: 1 }, ms: 200 }, { to: { cx: 368, cy: 190 }, ms: 700, ease: "inOut" }] },
      { steps: [{ to: { think: 1 }, ms: 450, ease: "back", sfx: "pop" }, { to: { heat: 1 }, ms: 700 }, { to: { pulse: 2 }, ms: 900, ease: "lin" }], hold: 2800 },
      { steps: [{ to: { think: 0 }, ms: 300 }, { to: { cx: 262, cy: 190 }, ms: 650, ease: "inOut" }, { to: { ring: 0 } },
        { to: { ring: 1, saved: 1, sendOff: 1 }, ms: 350, sfx: "tick" }, { to: { cur: 0 }, ms: 250 },
        { to: { mx: MX1 }, ms: 1000, ease: "inOut" }, { to: { dist: 1 }, ms: 500, ease: "back" }], hold: 2800 },
      { steps: [{ to: { dist: 0 }, ms: 300 }, { to: { fr: 1 }, ms: 500 }, { wait: 300 },
        { to: { dont: 1, mood: 0, brow: .2, heat: .45 }, ms: 450, ease: "back", sfx: "pluck" }], hold: 2800 },
      { steps: [{ to: { fr: 0, dont: 0 }, ms: 350 }, { to: { sleep: 1, dim: 1, zz: 1, mood: .2, brow: 0 }, ms: 600 },
        { to: { tm: .5, heat: .2, moon: 0 }, ms: 1100, ease: "lin", sfx: "whoosh" }, { to: { tm: 1, heat: 0, sun: 1 }, ms: 1100, ease: "lin" },
        { to: { zz: 0, sleep: 0, dim: 0, mood: .5 }, ms: 500 }] },
      { steps: [{ to: { sky: 0, mon: 0, therm: 0 }, ms: 450 }, { to: { mx: MX2 }, ms: 800, ease: "inOut" }, { to: { eg: 1 }, ms: 500 },
        { wait: 250 }, { to: { egTag: 1 }, ms: 450, ease: "back", sfx: "pop" }], hold: 2900 },
      { steps: [{ to: { eg: 0, egTag: 0 }, ms: 350 }, { to: { mx: MX0 }, ms: 750, ease: "inOut" },
        { to: { sky: 1, mon: 1, therm: 1, saved: 0, sendOff: 0 }, ms: 500 }, { to: { type: 0, rl: 0 }, ms: 450, ease: "lin" },
        { to: { type2: 1, gl: 1, sendG: 1, mood: .8 }, ms: 1000, ease: "lin", sfx: "scribble" },
        { to: { cx: 300, cy: 160 } }, { to: { cur: 1 }, ms: 200 }, { to: { cx: 368, cy: 190 }, ms: 500, ease: "inOut" },
        { to: { ring: 0 } }, { to: { ring: 1, sent: 1, cur: 0 }, ms: 450, sfx: "chime" }], hold: 4200 }
    ]
  };
})();
