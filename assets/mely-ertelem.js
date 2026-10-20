/* Mélyelemzés: ertelem.html — UCLA-3, MLQ, MAAS */
(function(D){

D.ucla = {
  jo: "lo",
  cim: "A kapcsolódásod mélyebben",
  bevezeto: [
    "A magányosság a kívánt és a megélt kapcsolódás közötti <strong>különbség</strong>: nem az számít, hány ember vesz körül, hanem hogy a kapcsolataid megadják-e azt a közelséget, amire szükséged van.",
    "A magányosság jelzés, mint az éhség: azt mutatja, hogy egy alapvető szükséglet nincs kielégítve. Tartósan viszont a kutatások szerint a testi és lelki egészséget is rontja."
  ],
  skalak: {
    total: { cut: [3, 6], hi: "Gyakori magányosság: sokszor hiányzik a kapcsolódás.", mid: "Alkalmi magányosság.", lo: "Ritka magányosság: a kapcsolataid most megtartanak." }
  },
  gyoker: [
    "Gyakori okai az élethelyzet-változások (költözés, szakítás, munkahelyváltás, egyéni vállalkozás), a túlterheltség miatti visszahúzódás, és az elutasítástól való félelem.",
    "Az elkerülő kötődés (ECR-R) és a mások ítéletétől való félelem (BFNE-II) gyakran fenntartja: a közelség vágya és a közelség kockázata egyszerre van jelen."
  ],
  mindennap: [
    "Magányosság idején a figyelem érzékenyebb lesz az elutasítás jeleire, ezért a semleges helyzeteket is könnyebb elutasításként olvasni. Ez tovább csökkenti a kezdeményezést."
  ],
  fennmarad: "A magányos ember óvatosabbá válik a kapcsolatokban, ritkábban kezdeményez, és így kevesebb esélye van a kapcsolódásra. A kört a kicsi, de rendszeres kezdeményezés töri meg.",
  lepesek: [
    "<strong>Egy ember, egy beszélgetés.</strong> Hetente egy valódi, nem üzenetben zajló beszélgetés valakivel, aki fontos.",
    "<strong>Közös tevékenység.</strong> Rendszeres csoport (sport, tanfolyam, önkéntesség), ahol a kapcsolat magától épül.",
    "<strong>Az értelmezés ellenőrzése.</strong> Ha valaki nem válaszol, írd le a legkézenfekvőbb semleges magyarázatot is.",
    "<strong>7 vagy afölött</strong>, ha ehhez lehangoltság is társul, érdemes szakemberrel beszélni."
  ],
  kerdesek: [
    "Kivel beszéltél utoljára igazán, és milyen volt?",
    "Mi tart vissza attól, hogy keress valakit?",
    "Milyen közösség hiányzik az életedből?"
  ],
  megjegyzes: "Az UCLA-3 nagyon rövid; a 6 pontos határ a nagy kutatásokban használt tájékozódó érték."
};

D.mlq = {
  cim: "Az élet értelme mélyebben",
  bevezeto: [
    "Az MLQ két független dolgot mér: mennyire <strong>érzed jelen</strong> az értelmet, és mennyire <strong>keresed</strong>. A keresés nem rossz jel: gyakran a változás és a fejlődés motorja.",
    "A kutatások szerint az értelem érzése három forrásból áll össze: koherencia (az életem összefüggő), cél (tudom, mi felé tartok) és jelentőség (számít, amit teszek)."
  ],
  skalak: {
    P: { jo: "hi", cut: [17, 25], hi: "Erősen érzed, hogy van értelme az életednek.", mid: "Részben érzed jelen az értelmet.", lo: "Most kevéssé érzed, hogy az életednek világos értelme van." },
    S: { cut: [17, 25], hi: "Aktívan keresed az élet értelmét.", mid: "Időnként foglalkoztat az értelem kérdése.", lo: "Most nem foglalkoztat különösebben az értelem keresése." }
  },
  gyoker: [
    "Az értelem érzése gyakran átmeneti időszakokban gyengül: pályaváltás, költözés, veszteség, kapcsolat vége, vagy egy nagy cél elérése után.",
    "Kimerültség és lehangoltság idején az értelem is kevésbé érezhető; ilyenkor a WHO-5 és a PHQ-9 segít elkülöníteni az állapotot a tartós élménytől."
  ],
  mindennap: [
    "Magas jelenlétnél a nehézségek is beilleszthetők egy nagyobb történetbe. Alacsonynál a napok inkább különálló feladatok sorozatának tűnnek."
  ],
  fennmarad: "Ha az értelmet csak nagy döntésektől várod, könnyű elakadni. Az értelem inkább a kis, rendszeres tettekből és kapcsolatokból áll össze.",
  lepesek: [
    "<strong>Heti visszatekintés.</strong> Három dolog, ami értelmes volt a héten, és mi köti össze őket.",
    "<strong>Kiért?</strong> Nevezd meg, kinek számít, amit csinálsz; a jelentőség érzése innen jön.",
    "<strong>Értékek.</strong> A PVQ-21 (Értékek témakör) megmutatja, mi fontos neked; nézd meg, melyik kap kevés helyet most.",
    "<strong>Kis kísérlet.</strong> Ha keresel, próbálj ki valamit kicsiben (önkéntesség, tanulás, alkotás), mielőtt nagy döntést hozol."
  ],
  kerdesek: [
    "Mi tette értelmessé az elmúlt hetedet?",
    "Ha öt év múlva visszanéznél erre az időszakra, mit szeretnél, hogy mi legyen benne?",
    "Kinek számít leginkább az, amit csinálsz?"
  ],
  megjegyzes: "Az MLQ alskálái függetlenek; a 24 pontos határ a szerző javaslata, tájékozódásra."
};

D.maas = {
  jo: "hi",
  cim: "A tudatos jelenlét mélyebben",
  bevezeto: [
    "A MAAS a tudatos jelenlétet <strong>hétköznapi figyelemként</strong> méri: mennyire veszed észre, mit csinálsz, érzel és tapasztalsz, szemben a „robotpilóta” üzemmóddal.",
    "A magasabb jelenlét a kutatásokban kevesebb stresszel, jobb érzelemszabályozással és jobb kapcsolati elégedettséggel jár együtt."
  ],
  skalak: {
    total: { cut: [3, 4.49], hi: "Erős jelenlét: a figyelmed többnyire ott van, ahol te.", mid: "Közepes jelenlét: bizonyos helyzetekben átvált a robotpilóta.", lo: "Gyakori robotpilóta: a mindennapok nagy része figyelem nélkül megy." }
  },
  gyoker: [
    "A robotpilóta leggyakoribb oka a túlterhelés és a párhuzamos feladatok: ha túl sok minden fut egyszerre, a figyelem nem tud jelen lenni.",
    "A folyamatos digitális megszakítások (értesítések, gyors váltások) szintén szétforgácsolják a figyelmet. Ha a figyelmetlenség gyerekkor óta jellemző, érdemes az ASRS-t is kitölteni."
  ],
  mindennap: [
    "Robotpilótán a testi jelzések (fáradtság, feszülés, éhség) későn tudatosodnak, a beszélgetések felszínesebbek, és a nap végén nehéz felidézni, mi történt."
  ],
  fennmarad: "A sietség csökkenti a figyelmet, a figyelmetlenség hibákat szül, a hibák még több sietést. A kör egy-egy tudatosan lassított pillanattal szakítható meg.",
  lepesek: [
    "<strong>Egy rutin, teljes figyelemmel.</strong> Egy hétig egyetlen napi tevékenységet csinálj tudatosan (kávé, fogmosás, séta).",
    "<strong>Három légzés.</strong> Feladatváltás előtt három lassú légvétel; ez visszahozza a figyelmet a jelenbe.",
    "<strong>Egyszerre egy dolog.</strong> Beszélgetés közben ne nézd a telefont; evés közben csak egyél.",
    "<strong>Testpásztázás.</strong> Este 5 perc: hol érzel feszültséget, fáradtságot? (MAIA-2 a testi figyelemhez)."
  ],
  kerdesek: [
    "Melyik napi tevékenységed megy leginkább robotpilótán?",
    "Mikor voltál utoljára teljesen jelen egy beszélgetésben?",
    "Mi szakítja meg leggyakrabban a figyelmedet?"
  ],
  megjegyzes: "A MAAS sávjai tájékozódó határok; normaérték helyett a skála terjedelméből számolva."
};

})(window.ONI_MELY_DATA = window.ONI_MELY_DATA || {});
