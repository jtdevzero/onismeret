"""Folytatásos olvasmány olaszul és spanyolul (A2–B1, 6-6 fejezet), felvett hanggal.
Futtatás: python3 parliamo/tools/content_serials_ites.py  →  data/serials-it.json, data/serials-es.json"""
import json, os
from content_serials import ch, D

IT = [
 {"id": "s1", "level": "A2–B1", "title": "Il segreto della trattoria", "hu": "A vendéglő titka", "img": "sc-rist",
  "desc": "Giulia megörökli a nagymamája római vendéglőjét. A régi receptfüzetben egy furcsa üzenetet talál.",
  "cast": {"N": {"name": "", "g": "m"}, "A": {"name": "Giulia", "g": "f"}, "B": {"name": "Marco", "g": "m"}},
  "chapters": [
   ch("L'eredità", "Az örökség", [
     ("N", "Giulia aveva trent'anni e lavorava in un ufficio a Milano.", "Giulia harmincéves volt, és egy milánói irodában dolgozott."),
     ("N", "Un giorno ricevette una lettera da un notaio di Roma.", "Egy nap levelet kapott egy római közjegyzőtől."),
     ("A", "La nonna mi ha lasciato la trattoria? Non ci posso credere!", "A nagymama rám hagyta a vendéglőt? El sem hiszem!"),
     ("N", "La trattoria si chiamava Da Rosa ed era in un piccolo vicolo di Trastevere.", "A vendéglőt Da Rosának hívták, és egy kis trasteverei sikátorban volt."),
     ("N", "Giulia prese il treno il giorno dopo.", "Giulia másnap vonatra ült."),
     ("B", "Buongiorno. Sono Marco, il cuoco. Lavoravo con tua nonna da quindici anni.", "Jó napot. Marco vagyok, a szakács. Tizenöt évig dolgoztam a nagymamáddal."),
     ("A", "Piacere, Marco. Non so niente di ristoranti.", "Örvendek, Marco. Semmit sem tudok az éttermekről."),
     ("B", "Non preoccuparti. Tua nonna diceva sempre che il segreto è nel quaderno.", "Ne aggódj. A nagymamád mindig azt mondta, hogy a titok a füzetben van.")],
    [("Mit kapott Giulia a közjegyzőtől?", ["Egy levelet", "Egy csomagot", "Egy telefonhívást"]),
     ("Ki Marco?", ["A vendéglő szakácsa", "Giulia testvére", "A közjegyző"])]),
   ch("Il quaderno", "A füzet", [
     ("N", "Quella sera Giulia trovò un vecchio quaderno in cucina.", "Aznap este Giulia egy régi füzetet talált a konyhában."),
     ("N", "Dentro c'erano le ricette della nonna, scritte a mano.", "Benne voltak a nagymama kézzel írt receptjei."),
     ("A", "Marco, guarda! Sull'ultima pagina c'è un messaggio.", "Marco, nézd! Az utolsó oldalon van egy üzenet."),
     ("B", "Cosa dice?", "Mit ír?"),
     ("A", "\"Il sugo vero si trova dove il sole tocca la fontana.\"", "„Az igazi szósz ott található, ahol a nap megérinti a szökőkutat.”"),
     ("B", "Che strano. Tua nonna amava i giochi e gli indovinelli.", "Furcsa. A nagymamád szerette a játékokat és a találós kérdéseket."),
     ("A", "Forse vuole dirmi qualcosa di importante.", "Talán valami fontosat akar mondani nekem."),
     ("N", "Giulia non riuscì a dormire tutta la notte.", "Giulia egész éjjel nem tudott aludni.")],
    [("Mi volt a füzetben?", ["A nagymama receptjei", "Régi fényképek", "Számlák"]),
     ("Hol volt az üzenet?", ["Az utolsó oldalon", "Az első oldalon", "Egy borítékban"])]),
   ch("La fontana", "A szökőkút", [
     ("N", "La mattina dopo, Giulia e Marco andarono in piazza.", "Másnap reggel Giulia és Marco kimentek a térre."),
     ("B", "Questa è la fontana più vecchia del quartiere.", "Ez a negyed legrégebbi szökőkútja."),
     ("A", "Alle dieci il sole tocca solo un lato della fontana.", "Tízkor a nap csak a szökőkút egyik oldalát éri."),
     ("N", "Davanti a quel lato c'era un piccolo negozio di spezie.", "Azzal az oldallal szemben egy kis fűszerbolt állt."),
     ("B", "Il negozio del signor Bruno! Tua nonna veniva qui ogni settimana.", "Bruno úr boltja! A nagymamád minden héten idejárt."),
     ("N", "Il signor Bruno era un uomo anziano con gli occhi gentili.", "Bruno úr idős ember volt kedves szemekkel."),
     ("A", "Buongiorno. Sono la nipote di Rosa.", "Jó napot. Rosa unokája vagyok."),
     ("N", "L'uomo sorrise e disse: \"Ti stavo aspettando.\"", "A férfi elmosolyodott, és azt mondta: „Már vártalak.”")],
    [("Mi állt a szökőkút napos oldalával szemben?", ["Egy fűszerbolt", "Egy pékség", "Egy templom"]),
     ("Mit mondott Bruno úr?", ["Hogy már várta Giuliát", "Hogy zárva van", "Hogy nem ismeri Rosát"])]),
   ch("La scatola", "A doboz", [
     ("N", "Il signor Bruno prese una scatola di legno da uno scaffale.", "Bruno úr egy fadobozt vett le egy polcról."),
     ("N", "\"Rosa me l'ha data un anno fa. Mi ha detto di darla solo a te.\"", "„Rosa egy éve adta nekem. Azt mondta, csak neked adjam oda.”"),
     ("A", "Dentro ci sono delle spezie e un'altra lettera.", "Benne fűszerek vannak és még egy levél."),
     ("N", "Nella lettera la nonna spiegava la ricetta del suo famoso sugo.", "A levélben a nagymama elmagyarázta a híres szósza receptjét."),
     ("B", "Ho provato a fare quel sugo per anni. Non era mai uguale.", "Évekig próbáltam elkészíteni azt a szószt. Sosem lett ugyanolyan."),
     ("A", "Mancava questa miscela di spezie. Era questo il segreto.", "Ez a fűszerkeverék hiányzott. Ez volt a titok."),
     ("N", "Ma alla fine della lettera c'era ancora una frase.", "De a levél végén még volt egy mondat."),
     ("A", "\"Il segreto più importante non è nella ricetta.\"", "„A legfontosabb titok nem a receptben van.”")],
    [("Mi volt a dobozban?", ["Fűszerek és egy levél", "Pénz és kulcsok", "Egy régi könyv"]),
     ("Mi hiányzott Marco szószából?", ["A fűszerkeverék", "A paradicsom", "A só"])]),
   ch("La riapertura", "Az újranyitás", [
     ("N", "Per due settimane Giulia e Marco lavorarono giorno e notte.", "Két hétig Giulia és Marco éjjel-nappal dolgozott."),
     ("N", "Pulirono la cucina, dipinsero le pareti e scrissero un nuovo menù.", "Kitakarították a konyhát, kifestették a falakat, és új étlapot írtak."),
     ("A", "Ho paura. E se non viene nessuno?", "Félek. Mi lesz, ha senki sem jön?"),
     ("B", "Verranno. In questo quartiere tutti volevano bene a Rosa.", "Jönni fognak. Ebben a negyedben mindenki szerette Rosát."),
     ("N", "La sera della riapertura, la trattoria era piena.", "Az újranyitás estéjén tele volt a vendéglő."),
     ("N", "C'erano i vicini, il signor Bruno e molti vecchi clienti.", "Ott voltak a szomszédok, Bruno úr és sok régi vendég."),
     ("B", "Assaggia il sugo, Giulia. È proprio come quello di tua nonna.", "Kóstold meg a szószt, Giulia. Pont olyan, mint a nagymamádé."),
     ("A", "È perfetto. Ma la cosa più bella è vedere tutte queste persone insieme.", "Tökéletes. De a legszebb az, hogy ennyi embert együtt látok.")],
    [("Mit csináltak két hétig?", ["Felújították a vendéglőt", "Szabadságon voltak", "Receptet kerestek"]),
     ("Milyen volt az újranyitás estéje?", ["Tele volt a vendéglő", "Senki sem jött", "Elmaradt"])]),
   ch("La decisione", "A döntés", [
     ("N", "Una settimana dopo, il capo di Giulia la chiamò da Milano.", "Egy héttel később Giulia főnöke felhívta Milánóból."),
     ("N", "\"Quando torni? Abbiamo bisogno di te in ufficio.\"", "„Mikor jössz vissza? Szükségünk van rád az irodában.”"),
     ("A", "Marco, devo decidere. Milano o Roma?", "Marco, döntenem kell. Milánó vagy Róma?"),
     ("B", "Cosa ti dice il cuore?", "Mit súg a szíved?"),
     ("N", "Giulia aprì di nuovo il quaderno e rilesse l'ultima frase della nonna.", "Giulia újra kinyitotta a füzetet, és újra elolvasta a nagymama utolsó mondatát."),
     ("A", "Adesso capisco. Il segreto più importante sono le persone.", "Most már értem. A legfontosabb titok az emberek."),
     ("N", "Il giorno dopo, Giulia scrisse una lettera di dimissioni.", "Másnap Giulia felmondólevelet írt."),
     ("A", "Resto qui, Marco. La trattoria Da Rosa continua.", "Itt maradok, Marco. A Da Rosa vendéglő tovább működik.")],
    [("Mit döntött Giulia?", ["Rómában marad", "Visszamegy Milánóba", "Eladja a vendéglőt"]),
     ("Mi volt a legfontosabb titok?", ["Az emberek", "A szósz", "A fűszerek"])]),
  ]},
]

ES = [
 {"id": "s1", "level": "A2–B1", "title": "La carta perdida", "hu": "Az elveszett levél", "img": "es-u12",
  "desc": "Lucía egy sevillai antikváriumban talál egy hatvan éve el nem küldött szerelmes levelet, és elhatározza, hogy megkeresi a címzettjét.",
  "cast": {"N": {"name": "", "g": "f"}, "A": {"name": "Lucía", "g": "f"}, "B": {"name": "Pablo", "g": "m"}},
  "chapters": [
   ch("El libro viejo", "A régi könyv", [
     ("N", "Lucía trabajaba en una pequeña librería de segunda mano en Sevilla.", "Lucía egy kis antikváriumban dolgozott Sevillában."),
     ("N", "Un martes por la tarde, abrió una caja de libros antiguos.", "Egy kedd délután kinyitott egy doboz régi könyvet."),
     ("N", "Dentro de una novela encontró un sobre amarillo.", "Az egyik regényben egy sárga borítékot talált."),
     ("A", "Pablo, mira esto. Es una carta de mil novecientos sesenta y cinco.", "Pablo, nézd ezt. Egy 1965-ös levél."),
     ("B", "¿Está abierta?", "Fel van bontva?"),
     ("A", "No. Nunca la enviaron. Tiene sello, pero no tiene matasellos.", "Nem. Sosem adták fel. Van rajta bélyeg, de nincs lebélyegezve."),
     ("B", "¿A quién va dirigida?", "Kinek szól?"),
     ("A", "A una tal Carmen Ruiz, calle de la Feria, número doce.", "Egy bizonyos Carmen Ruiznak, Feria utca 12.")],
    [("Mit talált Lucía a regényben?", ["Egy borítékot", "Egy fényképet", "Pénzt"]),
     ("Miért nem érkezett meg a levél?", ["Sosem adták fel", "Rossz volt a cím", "Elveszett a postán"])]),
   ch("La calle de la Feria", "A Feria utca", [
     ("N", "El sábado, Lucía y Pablo fueron a la calle de la Feria.", "Szombaton Lucía és Pablo elmentek a Feria utcába."),
     ("N", "En el número doce ya no había una casa, sino una panadería.", "A 12-es szám alatt már nem ház volt, hanem egy pékség."),
     ("B", "Hace sesenta años de esto. Es normal que todo haya cambiado.", "Ennek hatvan éve. Természetes, hogy minden megváltozott."),
     ("A", "Vamos a preguntar. A lo mejor alguien la conocía.", "Kérdezzük meg. Talán valaki ismerte."),
     ("N", "La panadera era una señora mayor y muy simpática.", "A pékné idős és nagyon kedves asszony volt."),
     ("A", "Perdone, ¿conoce a una mujer llamada Carmen Ruiz?", "Elnézést, ismer egy Carmen Ruiz nevű asszonyt?"),
     ("N", "La señora se quedó en silencio un momento.", "Az asszony egy pillanatra elhallgatott."),
     ("N", "\"Carmen era mi tía. Vivía aquí antes de casarse.\"", "„Carmen a nagynéném volt. Itt lakott, mielőtt férjhez ment.”")],
    [("Mi van most a 12-es szám alatt?", ["Egy pékség", "Egy könyvtár", "Egy park"]),
     ("Ki volt Carmen a pékné számára?", ["A nagynénje", "Az anyja", "A szomszédja"])]),
   ch("Una historia de amor", "Egy szerelmi történet", [
     ("N", "La panadera, que se llamaba Elena, les invitó a un café.", "A pékné, akit Elenának hívtak, meghívta őket egy kávéra."),
     ("N", "\"Mi tía estaba enamorada de un chico del barrio. Se llamaba Antonio.\"", "„A nagynéném szerelmes volt egy fiúba a negyedből. Antoniónak hívták.”"),
     ("N", "\"Un día, Antonio se fue a trabajar a Alemania y no volvió a escribir.\"", "„Egy nap Antonio Németországba ment dolgozni, és nem írt többet.”"),
     ("A", "Pero sí escribió. La carta está aquí. Nunca la envió.", "De igenis írt. Itt a levél. Csak sosem adta fel."),
     ("B", "¿Y qué pasó con Carmen?", "És mi lett Carmennel?"),
     ("N", "\"Pensó que Antonio la había olvidado. Dos años después se casó con otro hombre.\"", "„Azt hitte, Antonio elfelejtette. Két évvel később hozzáment egy másik férfihoz.”"),
     ("A", "¡Qué triste! ¿Todavía vive?", "Milyen szomorú! Él még?"),
     ("N", "\"Sí. Tiene ochenta y cinco años y vive en Cádiz.\"", "„Igen. Nyolcvanöt éves, és Cádizban él.”")],
    [("Hová ment Antonio dolgozni?", ["Németországba", "Franciaországba", "Madridba"]),
     ("Miért ment Carmen férjhez máshoz?", ["Azt hitte, Antonio elfelejtette", "A szülei kényszerítették", "Antonio meghalt"])]),
   ch("¿Abrir la carta?", "Felbontsuk a levelet?", [
     ("N", "Esa noche, Lucía no podía dejar de pensar en la carta.", "Aznap este Lucía nem tudta abbahagyni a levélre gondolást."),
     ("B", "¿Vamos a abrirla?", "Felbontjuk?"),
     ("A", "No. No es nuestra. Es de Carmen.", "Nem. Nem a miénk. Carmené."),
     ("B", "Tienes razón. Pero ¿y si le hace daño leerla ahora?", "Igazad van. De mi van, ha most fájni fog neki elolvasni?"),
     ("A", "Eso no lo podemos decidir nosotros. Ella tiene derecho a saber la verdad.", "Ezt nem mi dönthetjük el. Joga van megtudni az igazságot."),
     ("N", "Lucía llamó a Elena y le contó su idea.", "Lucía felhívta Elenát, és elmondta neki az ötletét."),
     ("N", "\"Voy a hablar con mi tía primero. Si quiere, os espera el domingo.\"", "„Előbb beszélek a nagynénémmel. Ha akarja, vasárnap vár titeket.”"),
     ("A", "Gracias, Elena. Esperaremos su respuesta.", "Köszönjük, Elena. Várjuk a válaszát.")],
    [("Miért nem bontották fel a levelet?", ["Mert Carmené", "Mert le volt ragasztva", "Mert féltek"]),
     ("Mit tesz először Elena?", ["Beszél a nagynénjével", "Elviszi a levelet", "Felbontja a levelet"])]),
   ch("Cádiz", "Cádiz", [
     ("N", "El domingo por la mañana, cogieron el tren a Cádiz.", "Vasárnap reggel vonatra ültek Cádiz felé."),
     ("N", "Carmen vivía en una casa blanca cerca del mar.", "Carmen egy fehér házban lakott a tenger közelében."),
     ("N", "Era una mujer pequeña, con el pelo blanco y una sonrisa tranquila.", "Alacsony asszony volt, fehér hajjal és nyugodt mosollyal."),
     ("A", "Señora Carmen, esta carta es para usted. La encontramos en un libro.", "Carmen asszony, ez a levél önnek szól. Egy könyvben találtuk."),
     ("N", "Carmen reconoció la letra inmediatamente.", "Carmen azonnal felismerte a kézírást."),
     ("N", "Abrió el sobre despacio y empezó a leer en silencio.", "Lassan felbontotta a borítékot, és csendben olvasni kezdett."),
     ("N", "Después de un largo rato, levantó la mirada. Tenía lágrimas en los ojos.", "Hosszú idő után felnézett. Könnyes volt a szeme."),
     ("N", "\"Me pedía que me fuera con él a Alemania. Me esperó en la estación.\"", "„Azt kérte, menjek vele Németországba. Várt rám az állomáson.”")],
    [("Mit ismert fel Carmen?", ["A kézírást", "A borítékot", "A bélyeget"]),
     ("Mit kért Antonio a levélben?", ["Hogy Carmen menjen vele", "Hogy Carmen felejtse el", "Pénzt"])]),
   ch("El final", "A vég", [
     ("A", "Lo siento mucho, Carmen. Quizás no debimos traérsela.", "Nagyon sajnálom, Carmen. Talán nem kellett volna elhoznunk."),
     ("N", "\"No, hija. Me habéis dado un regalo. Toda mi vida pensé que no me quería.\"", "„Nem, kislányom. Ajándékot adtatok nekem. Egész életemben azt hittem, nem szeretett.”"),
     ("N", "\"Tuve una buena vida, un buen marido y tres hijos. No me arrepiento.\"", "„Jó életem volt, jó férjem és három gyerekem. Nem bánok semmit.”"),
     ("N", "\"Pero ahora sé que el primer amor también fue verdadero.\"", "„De most már tudom, hogy az első szerelem is igazi volt.”"),
     ("B", "¿Sabe qué pasó con Antonio?", "Tudja, mi lett Antonióval?"),
     ("N", "\"No. Pero quizás podáis ayudarme a encontrarlo. Solo para darle las gracias.\"", "„Nem. De talán segíthettek megtalálni. Csak hogy megköszönjem neki.”"),
     ("A", "Claro que sí. Empezaremos mañana mismo.", "Persze. Már holnap elkezdjük."),
     ("N", "En el tren de vuelta, Lucía miraba el mar y sonreía. La carta, por fin, había llegado.", "A visszaúton Lucía a tengert nézte és mosolygott. A levél végre megérkezett.")],
    [("Hogyan érez Carmen a levél után?", ["Hálás", "Mérges", "Közömbös"]),
     ("Mit kér Carmen a végén?", ["Hogy segítsenek megtalálni Antoniót", "Hogy vigyék vissza a levelet", "Hogy ne meséljék el senkinek"])]),
  ]},
]


def main():
    for l, ser in (("it", IT), ("es", ES)):
        for s in ser:
            assert len(s["chapters"]) == 6
        json.dump({"serials": ser}, open(os.path.join(D, f"serials-{l}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(l, "folytatásos:", ", ".join(f"{s['id']} {len(s['chapters'])} fejezet" for s in ser))


if __name__ == "__main__":
    main()
