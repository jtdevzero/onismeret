"""Olasz (CELI 2 jellegű) és spanyol (DELE B1 jellegű) teljes próbavizsga.
Futtatás: python3 parliamo/tools/content_mock_it_es.py  →  data/mock-it.json, data/mock-es.json"""
import json, os
from content_mock import q, mc, D

def wf(text, a, why):
    return {"q": text, "a": a, "why": why}

def line(s, it, hu):
    return {"s": s, "it": it, "hu": hu}

IT = [
 {"id": "celi2", "title": "CELI 2 (B1) jellegű próbavizsga", "level": "B1", "minutes": 60, "scheme": "pct",
  "examiner": "CELI 2 (B1, Università per Stranieri di Perugia)", "words": "100–120",
  "parts": [
   {"type": "reading", "title": "Olvasott szöveg értése", "name": "Il ritorno delle biciclette in città",
    "text": "Negli ultimi dieci anni molte città italiane hanno cambiato volto. A Bologna, a Ferrara e perfino a Milano, dove il traffico sembrava impossibile da fermare, sempre più persone vanno al lavoro in bicicletta. Secondo un'indagine recente, a Ferrara quasi un abitante su tre usa la bici ogni giorno.\n\nIl cambiamento non è avvenuto per caso. Molti comuni hanno costruito nuove piste ciclabili e hanno ridotto i parcheggi nel centro storico. A Milano, durante la pandemia, il comune ha trasformato in pochi mesi alcune strade a quattro corsie in strade con una corsia riservata alle biciclette. All'inizio i commercianti erano preoccupati: temevano di perdere clienti. Oggi molti di loro ammettono che i negozi sono più frequentati di prima, perché chi passa in bici si ferma più volentieri.\n\nNon mancano però i problemi. I furti di biciclette sono ancora molto diffusi, e nelle città più grandi molti ciclisti si lamentano della poca sicurezza agli incroci. Anche il clima ha un ruolo: d'estate fa molto caldo e non tutti gli uffici hanno una doccia per i dipendenti.\n\nPer questo alcune aziende offrono incentivi a chi lascia l'auto a casa: un piccolo bonus mensile, un parcheggio coperto per le bici o la possibilità di iniziare il lavoro mezz'ora più tardi. «Arrivo in ufficio più sveglia e di buon umore», racconta Giulia, impiegata milanese, «e risparmio quasi cento euro al mese di benzina.»",
    "questions": [
     q("Che cosa dice il testo di Ferrara?", ["Quasi un abitante su tre usa la bici ogni giorno.", "È la città con più traffico d'Italia.", "Ha vietato le automobili nel centro.", "Non ha piste ciclabili."], "\"a Ferrara quasi un abitante su tre usa la bici ogni giorno\""),
     q("Che cosa ha fatto il comune di Milano durante la pandemia?", ["Ha creato corsie per le biciclette su alcune strade.", "Ha chiuso tutti i parcheggi.", "Ha regalato biciclette ai cittadini.", "Ha costruito una nuova metropolitana."], "\"strade con una corsia riservata alle biciclette\""),
     q("Come si sentivano all'inizio i commercianti?", ["Preoccupati", "Entusiasti", "Indifferenti", "Arrabbiati con i ciclisti"], "\"All'inizio i commercianti erano preoccupati\""),
     q("Perché oggi i negozi sono più frequentati?", ["Chi passa in bici si ferma più volentieri.", "I prezzi sono più bassi.", "Ci sono più parcheggi.", "I negozi sono aperti anche di notte."], "\"chi passa in bici si ferma più volentieri\""),
     q("Quale problema NON è citato nel testo?", ["Il costo delle biciclette", "I furti", "La sicurezza agli incroci", "Il caldo d'estate"], "A szöveg a lopást, a kereszteződéseket és a nyári meleget említi, az árat nem."),
     q("Che cosa offrono alcune aziende?", ["Vantaggi a chi va al lavoro senza auto", "Un'auto aziendale", "Biciclette elettriche gratuite", "Più giorni di ferie"], "\"incentivi a chi lascia l'auto a casa\"")]},
   {"type": "mc", "title": "Nyelvhelyesség: szókitöltés", "items": [
     mc("Ieri ___ andati al mare con gli amici.", "siamo", ["siamo", "abbiamo", "sono", "avevamo"], "Az andare essere segédigével áll: siamo andati."),
     mc("Se ho tempo, ti ___ domani.", "chiamo", ["chiamo", "chiamerei", "chiamassi", "chiamato"], "Valós feltétel: se + presente, a főmondatban presente (vagy futuro)."),
     mc("Non conosco nessuno ___ parli giapponese.", "che", ["che", "chi", "cui", "quale"], "Alanyi vonatkozó névmás: che."),
     mc("Penso che Marco ___ ragione.", "abbia", ["abbia", "ha", "avendo", "avesse"], "A penso che után kötőmód: abbia."),
     mc("Abito a Torino ___ cinque anni.", "da", ["da", "per", "fra", "in"], "Ma is tartó időtartam: da (óta)."),
     mc("Hai visto le mie chiavi? – Sì, ___ ho viste sul tavolo.", "le", ["le", "li", "la", "gli"], "le chiavi nőnemű többes: le, és a participio is egyezik (viste)."),
     mc("Il film era così noioso ___ mi sono addormentato.", "che", ["che", "quindi", "perché", "come"], "così … che = annyira …, hogy."),
     mc("Quando ero piccolo, ___ sempre con mio nonno.", "giocavo", ["giocavo", "ho giocato", "giocai", "giocherò"], "Múltbeli szokás: imperfetto.")]},
   {"type": "wf", "title": "Nyelvhelyesség: szóképzés", "items": [
     wf("Prima dell'esame ho bisogno di un po' di ___. (TRANQUILLO)", "tranquillità", "-ità főnévképző: tranquillità = nyugalom."),
     wf("Il direttore ha parlato ___ con tutti i dipendenti. (GENTILE)", "gentilmente", "-mente határozószó-képző."),
     wf("L'___ della nuova biblioteca è prevista per giugno. (APRIRE)", "apertura", "-ura főnévképző: apertura = megnyitó."),
     wf("Finire tutto oggi è ___. (POSSIBILE, ellentét)", "impossibile", "im- fosztóképző a p előtt."),
     wf("Mia sorella lavora come ___ in un ospedale. (INFERMIERE, nőnem)", "infermiera", "Nőnem: -iere → -iera."),
     wf("È stato un viaggio ___. (DIMENTICARE)", "indimenticabile", "in- + -abile: felejthetetlen.")]},
   {"type": "listening", "title": "Hallott szöveg értése", "name": "Un fine settimana sul lago",
    "cast": {"A": {"name": "Sara", "g": "f"}, "B": {"name": "Marco", "g": "m"}},
    "lines": [
     line("A", "Marco, hai già deciso cosa fare questo fine settimana?", "Marco, eldöntötted már, mit csinálsz a hétvégén?"),
     line("B", "Pensavo di andare al lago di Garda. Mio cugino ha una casa a Sirmione.", "Arra gondoltam, hogy elmegyek a Garda-tóhoz. Az unokatestvéremnek van egy háza Sirmionéban."),
     line("A", "Che bello! Ci vai in macchina?", "De jó! Kocsival mész?"),
     line("B", "No, prendo il treno fino a Desenzano. In macchina c'è sempre troppo traffico il sabato mattina.", "Nem, vonattal megyek Desenzanóig. Szombat reggel kocsival mindig túl nagy a forgalom."),
     line("A", "E che cosa farete lì?", "És mit fogtok ott csinálni?"),
     line("B", "Se il tempo è bello, vogliamo noleggiare una barca. Altrimenti visitiamo il castello e mangiamo il pesce di lago.", "Ha szép az idő, csónakot akarunk bérelni. Ha nem, megnézzük a várat, és tavi halat eszünk."),
     line("A", "Io non sono mai stata a Sirmione. Dicono che d'estate sia pienissima di turisti.", "Én még sosem voltam Sirmionéban. Azt mondják, nyáron tele van turistákkal."),
     line("B", "È vero, ma a settembre è più tranquilla. Perché non vieni anche tu? C'è una camera libera.", "Igaz, de szeptemberben nyugodtabb. Miért nem jössz te is? Van egy szabad szoba."),
     line("A", "Mi piacerebbe, ma domenica pomeriggio devo lavorare. Potrei venire solo sabato.", "Szívesen mennék, de vasárnap délután dolgoznom kell. Csak szombatra tudnék jönni."),
     line("B", "Nessun problema: c'è un treno di ritorno alle otto di sera. Ti mando l'orario.", "Semmi gond: este nyolckor van visszafelé vonat. Elküldöm a menetrendet.")],
    "questions": [
     q("Dove ha una casa il cugino di Marco?", ["A Sirmione", "A Desenzano", "A Milano", "A Verona"], "\"Mio cugino ha una casa a Sirmione.\""),
     q("Perché Marco non va in macchina?", ["Il sabato mattina c'è troppo traffico.", "Non ha la patente.", "La macchina è rotta.", "Il treno costa meno."], "\"In macchina c'è sempre troppo traffico il sabato mattina.\""),
     q("Che cosa faranno se il tempo è bello?", ["Noleggeranno una barca.", "Visiteranno il castello.", "Andranno in montagna.", "Resteranno a casa."], "\"Se il tempo è bello, vogliamo noleggiare una barca.\""),
     q("Che cosa dice Marco di Sirmione a settembre?", ["È più tranquilla.", "È chiusa ai turisti.", "Fa troppo freddo.", "È più cara."], "\"a settembre è più tranquilla\""),
     q("Perché Sara può andare solo sabato?", ["Domenica pomeriggio deve lavorare.", "Non le piace il lago.", "Non c'è posto in casa.", "La domenica non ci sono treni."], "\"domenica pomeriggio devo lavorare\"")]},
   {"type": "writing", "title": "Íráskészség",
    "task": "Scrivi un'email a un'amica italiana. Racconta un viaggio che hai fatto di recente (dove sei andato, con chi, che cosa ti è piaciuto di più) e invitala a venirti a trovare. (100–120 parole)",
    "etype": "CELI 2 – informális e-mail"}]}
]

ES = [
 {"id": "dele-b1", "title": "DELE B1 jellegű próbavizsga", "level": "B1", "minutes": 60, "scheme": "pct",
  "examiner": "DELE B1 (Instituto Cervantes)", "words": "100–120",
  "parts": [
   {"type": "reading", "title": "Olvasott szöveg értése", "name": "Los mercados de barrio vuelven a estar de moda",
    "text": "En muchas ciudades españolas, los mercados de barrio estaban perdiendo clientes desde hacía años. Los supermercados abrían más horas, tenían aparcamiento y precios más bajos. Sin embargo, en la última década algo ha cambiado: en Madrid, Valencia o Barcelona, los mercados tradicionales vuelven a llenarse, sobre todo los fines de semana.\n\nEl caso del Mercado de San Fernando, en el barrio madrileño de Lavapiés, es un buen ejemplo. Hace quince años, casi la mitad de los puestos estaban vacíos. Entonces un grupo de vecinos propuso alquilarlos a precios bajos a jóvenes emprendedores. Hoy, junto a la frutería y la carnicería de siempre, hay una librería que vende libros al peso, un puesto de comida peruana y un taller donde arreglan bicicletas.\n\nLos comerciantes más antiguos reconocen que al principio tenían dudas. «Pensaba que la gente vendría solo a tomar algo y no a comprar», cuenta Antonio, que vende pescado desde hace treinta años. «Pero me equivoqué: ahora tengo clientes jóvenes que antes no venían nunca.»\n\nNo todo el mundo está contento. Algunos vecinos se quejan de que los precios han subido y de que el mercado se ha convertido en un lugar para turistas. Los responsables del mercado responden que han mantenido los horarios de mañana para los clientes habituales y que la mayoría de los puestos siguen vendiendo productos frescos.",
    "questions": [
     q("¿Por qué perdían clientes los mercados de barrio?", ["Los supermercados ofrecían más comodidades y precios más bajos.", "Los productos eran de mala calidad.", "Estaban lejos del centro.", "Cerraban los fines de semana."], "\"Los supermercados abrían más horas, tenían aparcamiento y precios más bajos.\""),
     q("¿Cómo era el Mercado de San Fernando hace quince años?", ["Casi la mitad de los puestos estaban vacíos.", "Era el mercado más caro de Madrid.", "Estaba cerrado por obras.", "Solo vendía pescado."], "\"casi la mitad de los puestos estaban vacíos\""),
     q("¿Qué propusieron los vecinos?", ["Alquilar los puestos baratos a jóvenes emprendedores.", "Convertir el mercado en un supermercado.", "Cerrar el mercado.", "Abrir un aparcamiento."], "\"alquilarlos a precios bajos a jóvenes emprendedores\""),
     q("¿Qué pensaba Antonio al principio?", ["Que la gente no vendría a comprar.", "Que el mercado cerraría pronto.", "Que los turistas comprarían mucho pescado.", "Que los jóvenes trabajarían con él."], "\"Pensaba que la gente vendría solo a tomar algo y no a comprar\""),
     q("¿Qué critican algunos vecinos?", ["La subida de los precios y el turismo.", "El ruido de los bares.", "La falta de productos frescos.", "Los horarios de la mañana."], "\"los precios han subido … un lugar para turistas\""),
     q("¿Qué han hecho los responsables del mercado para los clientes habituales?", ["Han mantenido los horarios de mañana.", "Han bajado todos los precios.", "Han cerrado los bares.", "Han prohibido la entrada a los turistas."], "\"han mantenido los horarios de mañana para los clientes habituales\"")]},
   {"type": "mc", "title": "Nyelvhelyesség: szókitöltés", "items": [
     mc("Ayer ___ al cine con mis amigos.", "fui", ["fui", "iba", "he ido", "voy"], "ayer: lezárt időszak, pretérito indefinido."),
     mc("Cuando era pequeño, ___ en un pueblo.", "vivía", ["vivía", "vivo", "he vivido", "viviré"], "Múltbeli háttér, állapot: imperfecto."),
     mc("Espero que ___ un buen viaje.", "tengas", ["tengas", "tienes", "tendrás", "tener"], "Az esperar que után kötőmód: tengas."),
     mc("Este regalo es ___ ti.", "para", ["para", "por", "a", "de"], "Címzett, cél: para."),
     mc("Mi hermano es ___ alto que yo.", "más", ["más", "tan", "muy", "mucho"], "Középfok: más … que."),
     mc("¿Has visto a Laura? – No, no la ___ visto hoy.", "he", ["he", "ha", "había", "haya"], "hoy: pretérito perfecto, első személy: he visto."),
     mc("Si ___ tiempo, iré contigo.", "tengo", ["tengo", "tendré", "tuviera", "tenga"], "Valós feltétel: si + presente, a főmondatban futuro."),
     mc("No me gusta ___ película.", "esta", ["esta", "este", "estos", "esto"], "película nőnemű egyes szám: esta.")]},
   {"type": "wf", "title": "Nyelvhelyesség: szóképzés", "items": [
     wf("Me gusta la ___ de este pueblo. (TRANQUILO)", "tranquilidad", "-idad főnévképző: tranquilidad = nyugalom."),
     wf("Habla español ___. (PERFECTO)", "perfectamente", "-mente határozószó-képző a nőnemű alakhoz."),
     wf("La ___ del museo es a las diez. (ABRIR)", "apertura", "apertura = nyitás, megnyitó."),
     wf("Es ___ terminar hoy. (POSIBLE, ellentét)", "imposible", "im- fosztóképző a p előtt."),
     wf("Mi madre trabaja como ___ en un colegio. (PROFESOR, nőnem)", "profesora", "Nőnem: -or → -ora."),
     wf("Fue un viaje ___. (OLVIDAR)", "inolvidable", "in- + -able: felejthetetlen.")]},
   {"type": "listening", "title": "Hallott szöveg értése", "name": "El piso nuevo de Lucía",
    "cast": {"A": {"name": "Carlos", "g": "m"}, "B": {"name": "Lucía", "g": "f"}},
    "lines": [
     line("A", "Lucía, ¿qué tal la mudanza? ¿Ya estás en el piso nuevo?", "Lucía, hogy ment a költözés? Már az új lakásban vagy?"),
     line("B", "Sí, desde el sábado. Todavía tengo cajas por todas partes, pero estoy muy contenta.", "Igen, szombat óta. Még mindenhol dobozok vannak, de nagyon boldog vagyok."),
     line("A", "¿Está cerca de tu trabajo?", "Közel van a munkahelyedhez?"),
     line("B", "Muchísimo más cerca. Antes tardaba una hora en metro; ahora voy andando en quince minutos.", "Sokkal közelebb. Korábban egy óra volt metróval, most tizenöt perc gyalog."),
     line("A", "¡Qué suerte! ¿Y cómo es el barrio?", "Micsoda szerencse! És milyen a környék?"),
     line("B", "Es bastante tranquilo. Hay un mercado muy bonito y un parque enfrente de mi casa. Lo único malo es que no hay muchos restaurantes.", "Elég csendes. Van egy nagyon szép piac, és egy park a házammal szemben. Az egyetlen rossz, hogy nincs sok étterem."),
     line("A", "Bueno, así cocinas más. ¿Vas a hacer una fiesta para enseñarnos el piso?", "Hát, így többet főzöl. Tartasz bulit, hogy megmutasd a lakást?"),
     line("B", "Claro, pero primero tengo que comprar un sofá. Ahora mismo solo tengo dos sillas.", "Persze, de előbb vennem kell egy kanapét. Most csak két székem van."),
     line("A", "Si quieres, el domingo te acompaño a una tienda de muebles de segunda mano. Mi hermana compró allí toda su casa.", "Ha akarod, vasárnap elkísérlek egy használtbútor-boltba. A húgom ott vette az egész berendezését."),
     line("B", "¡Perfecto! Así ahorro un poco. ¿Quedamos a las once?", "Tökéletes! Így spórolok egy kicsit. Tizenegykor találkozunk?")],
    "questions": [
     q("¿Desde cuándo vive Lucía en el piso nuevo?", ["Desde el sábado.", "Desde hace un mes.", "Desde el domingo.", "Todavía no vive allí."], "\"Sí, desde el sábado.\""),
     q("¿Cómo va Lucía al trabajo ahora?", ["Andando", "En metro", "En autobús", "En bici"], "\"ahora voy andando en quince minutos\""),
     q("¿Qué es lo único malo del barrio?", ["No hay muchos restaurantes.", "Hay mucho ruido.", "No hay parques.", "Está lejos del metro."], "\"Lo único malo es que no hay muchos restaurantes.\""),
     q("¿Qué tiene que comprar Lucía antes de la fiesta?", ["Un sofá", "Dos sillas", "Una mesa", "Una cama"], "\"primero tengo que comprar un sofá\""),
     q("¿Qué le propone Carlos?", ["Ir juntos a una tienda de muebles de segunda mano.", "Hacer la fiesta en su casa.", "Prestarle su sofá.", "Ayudarla con las cajas el sábado."], "\"el domingo te acompaño a una tienda de muebles de segunda mano\"")]},
   {"type": "writing", "title": "Íráskészség",
    "task": "Escribe un correo a un amigo español. Cuéntale cómo es tu barrio (qué hay, qué te gusta y qué no) e invítalo a visitarte. (100–120 palabras)",
    "etype": "DELE B1 – informális e-mail"}]}
]

if __name__ == "__main__":
    for l, m in (("it", IT), ("es", ES)):
        json.dump({"mocks": m}, open(os.path.join(D, f"mock-{l}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("ok")
