/* Mélyelemzés: szokasok.html — AUDIT, SAS-SV, BSCS */
(function(D){

D.audit = {
  jo: "lo",
  cim: "Az alkoholhoz való viszonyod mélyebben",
  bevezeto: [
    "Az AUDIT három területet vizsgál: a <strong>fogyasztás</strong> mennyiségét és gyakoriságát, a <strong>kontroll elvesztésének</strong> jeleit, és az ivás <strong>következményeit</strong>. A három együtt adja a kockázati zónát.",
    "A kockázat folytonos: nincs teljesen biztonságos mennyiség, de a magasabb zónákban a kockázat meredeken nő."
  ],
  skalak: {
    total: { cut: [7, 16], hi: "Ártalmas fogyasztás vagy lehetséges függőség: orvosi segítség javasolt.", mid: "Kockázatos fogyasztás: a tudatos csökkentés most a leghatékonyabb.", lo: "Alacsony kockázat." },
    C: { cut: [3, 8], hi: "Magas fogyasztás.", mid: "Közepes fogyasztás.", lo: "Alacsony fogyasztás." },
    D: { cut: [0, 4], hi: "A kontroll elvesztésének erős jelei.", mid: "A kontroll elvesztésének egyes jelei.", lo: "Nincsenek kontrollvesztési jelek." },
    H: { cut: [0, 6], hi: "Jelentős következmények.", mid: "Egyes következmények.", lo: "Nincsenek jelentős következmények." }
  },
  gyoker: [
    "Az ivás gyakran funkciót tölt be: stresszoldás, alvássegítés, társas oldódás, unalom elleni szer. Ha egy funkciót csak az alkohol tölt be, a szokás megerősödik.",
    "Tartós stressz, szorongás, lehangoltság és rossz alvás idején a kockázatos ivás gyakoribb."
  ],
  mindennap: [
    "A kockázatos ivás gyakran észrevétlen: másnapi fáradtság, rosszabb alvás, rövidebb türelem, és az, hogy egyre több alkalom „megérdemel” egy italt."
  ],
  fennmarad: "Az alkohol rövid távon oldja a feszültséget, ezért megerősödik; hosszabb távon viszont növeli a szorongást és rontja az alvást, ami újabb ivásra ad okot.",
  lepesek: [
    "<strong>Ivásnapló.</strong> Egy hétig jegyezd fel, mikor, mennyit és miért ittál.",
    "<strong>Alkoholmentes napok.</strong> Legalább két nap egy héten.",
    "<strong>Funkciócsere.</strong> Ha az ital stresszoldó vagy altató, keress arra a helyzetre más megoldást.",
    "<strong>16 felett</strong> beszélj háziorvossal; ha naponta sokat iszol, ne hagyd abba hirtelen, egyedül."
  ],
  kerdesek: [
    "Mi az a helyzet, amikor a leginkább kívánod az italt?",
    "Mit adna neked egy hónap alkohol nélkül?",
    "Mondta már valaki, hogy aggódik az ivásod miatt?"
  ],
  megjegyzes: "Az AUDIT a WHO szűrője; a zónák nem diagnózisok."
};

D.sas = {
  jo: "lo",
  cim: "A telefonhasználatod mélyebben",
  bevezeto: [
    "A problémás telefonhasználat nem a képernyőidővel azonos: azt jelenti, hogy a használat <strong>a mindennapokat zavarja</strong>, és nehéz nélküle lenni. Sok, de kontrollált használat még nem probléma.",
    "Az alkalmazások a változó jutalmazás elvére épülnek (sosem tudod, mi vár), ami a leginkább szokásképző minta."
  ],
  skalak: {
    total: { cut: [21, 31], hi: "Problémás telefonhasználat.", mid: "Mérsékelt kötődés a telefonhoz.", lo: "Kontrollált telefonhasználat." }
  },
  gyoker: [
    "A telefon gyakran érzelemszabályozó eszköz: unalom, feszültség vagy magány idején nyúlunk érte. Az ilyen használat a legnehezebben kontrollálható.",
    "Figyelmi nehézségek (ASRS) és szorongás (GAD-7) mellett gyakoribb."
  ],
  mindennap: [
    "Problémás használatnál szétforgácsolódik a figyelem, csúszik az elalvás, és a beszélgetések felszínesebbek lesznek."
  ],
  fennmarad: "Minden ellenőrzés kis jutalmat ad (új üzenet, új tartalom), ami megerősíti a következő ellenőrzést, akkor is, ha a legtöbb alkalom üres.",
  lepesek: [
    "<strong>Fizikai távolság</strong> munka és alvás közben.",
    "<strong>Értesítések</strong> kikapcsolása mindenhol, ami nem emberi üzenet.",
    "<strong>Szürke képernyő</strong> és a kísértő alkalmazások a második oldalon.",
    "<strong>Mit pótol?</strong> Figyeld meg, milyen érzés előzi meg a telefonért nyúlást."
  ],
  kerdesek: [
    "Mi az első és az utolsó, amit naponta csinálsz?",
    "Milyen érzés előzi meg, hogy a telefonért nyúlsz?",
    "Mit csinálnál azzal az idővel, amit most a telefonon töltesz?"
  ],
  megjegyzes: "A SAS-SV határai (31 és 33) a szerzők által közölt értékek."
};

D.bscs = {
  jo: "hi",
  cim: "Az önkontrollod mélyebben",
  bevezeto: [
    "Az önkontroll a pillanatnyi késztetés felülírása egy hosszabb távú cél kedvéért. A kutatások szerint a magas önkontrollú emberek nem több akaraterőt használnak, hanem jobb szokásaik vannak, és ritkábban kerülnek kísértő helyzetbe.",
    "Ezért az önkontroll leghatékonyabb fejlesztése nem az erőlködés, hanem a környezet és a szokások tervezése."
  ],
  skalak: {
    total: { cut: [2.67, 3.67], hi: "Erős önkontroll.", mid: "Közepes önkontroll.", lo: "Gyengébb önkontroll." }
  },
  gyoker: [
    "Az önkontrollt átmenetileg gyengíti a fáradtság, az alváshiány, a stressz és az éhség. Tartósan alacsonyabb lehet figyelmi nehézség (ASRS) vagy erős impulzivitás (DERS impulzuskontroll) mellett."
  ],
  mindennap: [
    "Gyengébb önkontrollnál a rövid távú késztetések (telefon, nassolás, halogatás, költekezés) gyakrabban győznek, ami utólag bűntudatot és önkritikát hoz."
  ],
  fennmarad: "Az önkritika nem javítja, hanem rontja az önkontrollt: a bűntudat feszültséget kelt, amit újabb késztetés old. Az önegyüttérzés megtöri a kört (SCS-SF).",
  lepesek: [
    "<strong>Ha–akkor terv</strong> a leggyakoribb kísértő helyzetre.",
    "<strong>Súrlódás:</strong> a nem kívánt viselkedés legyen nehezebb, a kívánt könnyebb.",
    "<strong>Alapok:</strong> alvás, étkezés, stressz rendben tartása.",
    "<strong>Önegyüttérzés</strong> megcsúszás után, újrakezdés másnap."
  ],
  kerdesek: [
    "Melyik helyzetben győz leggyakrabban a pillanat?",
    "Mit tehetnél nehezebbé magad számára?",
    "Mit mondasz magadnak, amikor megcsúszol?"
  ],
  megjegyzes: "A BSCS sávjai a skála harmadai szerint, tájékozódásra."
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
