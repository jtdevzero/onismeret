/* Mélyelemzés: havi.html — havi állapotfelmérés */
(function(D){

D.pulse = {
  cim: "A havi állapotkép mélyebben",
  bevezeto: [
    "A havi felmérés öt rövid, validált mérőt fűz össze: jóllét (WHO-5), stressz (PSS-4), kimerültség (Koppenhágai kiégés-kérdőív, személyes alskála), magányosság (UCLA-3) és alvás (SCI rövid változat).",
    "Egyetlen mérésnél többet ér az irány: a változás hónapos léptékű, ezért 2–3 egymást követő mérés mutatja meg igazán, merre tartasz."
  ],
  skalak: {
    who5: { jo: "hi", cut: [48, 72], hi: "Jó közérzet.", mid: "Közepes jóllét.", lo: "Gyenge jóllét; 28 vagy alatta érdemes a PHQ-9-et is kitölteni." },
    pss4: { jo: "lo", cut: [5, 10], hi: "Magas észlelt stressz.", mid: "Közepes stressz.", lo: "Alacsony stressz." },
    cbiP: { jo: "lo", cut: [49, 75], hi: "Erős kimerültség.", mid: "Közepes kimerültség.", lo: "Alacsony kimerültség." },
    ucla: { jo: "lo", cut: [3, 6], hi: "Gyakori magányosság.", mid: "Alkalmi magányosság.", lo: "Ritka magányosság." },
    sleep: { jo: "hi", cut: [3, 6], hi: "Jó alvás.", mid: "Közepes alvás.", lo: "Gyakori alvásprobléma." }
  },
  gyoker: [
    "Az öt mutató erősen összefügg: a rossz alvás rontja a jóllétet és növeli a stresszt, a tartós stressz kimerít, a kimerültség visszahúzódáshoz és magányossághoz vezethet. Ezért gyakran egyetlen terület javítása a többit is húzza."
  ],
  mindennap: [
    "Ha egy hónapban több mutató is romlik, gyakran egy konkrét változás áll a háttérben: több munka, betegség, kevesebb alvás, kapcsolati feszültség. Érdemes a mérés mellé egy mondatot jegyzetelni arról, mi történt abban a hónapban."
  ],
  fennmarad: "A rossz hónapok önmagukban természetesek. Akkor érdemes beavatkozni, ha ugyanaz a mutató két-három hónapon át ugyanabba az irányba megy.",
  lepesek: [
    "<strong>Egy terület egyszerre.</strong> Válaszd a legrosszabb mutatót, és a következő hónapban csak azzal foglalkozz.",
    "<strong>Alvás először.</strong> Ha az alvás gyenge, sokszor az a legjobb belépési pont.",
    "<strong>Jegyzet.</strong> A kitöltés után írj egy mondatot arról, mi határozta meg a hónapot.",
    "<strong>Naptár.</strong> Állíts be havi emlékeztetőt, hogy nagyjából ugyanakkor töltsd ki."
  ],
  kerdesek: [
    "Mi határozta meg leginkább ezt a hónapot?",
    "Melyik mutató változását vártad, és melyik lepett meg?",
    "Mi az egy dolog, amin a következő hónapban változtatnál?"
  ],
  megjegyzes: "A havi felmérés rövidített mérőket használ; a részletes kép a teljes tesztekben van (a mutató nevére kattintva)."
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
