"""Spanyol tananyag (A1–B1) forrása. Futtatás: python3 parliamo/tools/content_es.py → data/es.json, stories-es.json, verbs-es.json.

Egy lecke: (id, szint, cím, magyar cím, szerepjáték-helyzet, [(nyelvtan cím, magyarázat)], [(szó, jelentés[, alternatívák])], [(mondat, fordítás[, alternatívák])])
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

UNITS = [
("u1", "A1", "¡Hola!", "Köszönés és bemutatkozás", "Egy madridi nyelviskolában megismerkedsz valakivel", [
  ("Kiejtés: a legfontosabb szabályok", "c + e/i és z: Spanyolországban a nyelv a fogak közé kerül, mint az angol th (gracias), Latin-Amerikában sz. j és g + e/i: erős torokhang h (jamón, gente). ll ≈ j (calle), ñ = ny (España), a h néma (hola). Ha a hangsúly nem szabályos, ékezet jelzi: café, teléfono."),
  ("Tegezés és magázás", "Barátnak: ¿Cómo estás? (tú). Idegennek, üzletben: ¿Cómo está? (usted) – az ige egyes szám harmadik személyű, mint a magyar „Ön”."),
  ("ser = lenni (állandó dolgok)", "soy, eres, es, somos, sois, son. Soy húngaro (férfi) / Soy húngara (nő). ¿De dónde eres?"),
], [
  ("hola", "szia"), ("buenos días", "jó reggelt, jó napot"), ("buenas tardes", "jó napot (délután)"), ("buenas noches", "jó estét, jó éjszakát"),
  ("adiós", "viszlát"), ("hasta luego", "viszontlátásra"), ("gracias", "köszönöm"), ("de nada", "szívesen"),
  ("por favor", "kérem"), ("perdón", "bocsánat"), ("sí", "igen"), ("encantado", "örvendek", ["encantada"]),
], [
  ("Me llamo Ana.", "A nevem Ana."), ("¿Cómo te llamas?", "Hogy hívnak?"), ("¿Cómo estás?", "Hogy vagy?"),
  ("Estoy bien, gracias.", "Jól vagyok, köszönöm."), ("Soy de Hungría.", "Magyarországról jöttem."), ("Mucho gusto.", "Örvendek."),
]),
("u2", "A1", "En la cafetería", "Kávézóban", "Rendelsz egy madridi kávézóban", [
  ("Névelők és nemek", "Határozott: el (hímnem), la (nőnem), los, las (többes). Határozatlan: un, una, unos, unas. Az -o általában hímnem (el libro), az -a nőnem (la casa). Kivétel: el día, la mano. Hangsúlyos a- előtt nőnemben is el áll: el agua."),
  ("Udvarias rendelés", "Quería… (szeretnék) vagy ¿Me pone…? (adna…?). A Quiero… (akarok) nyersen hangzik."),
  ("Fizetés", "¿Cuánto es? – Mennyi lesz? La cuenta, por favor. – A számlát kérem. Spanyolországban a borravaló nem kötelező, apróval kerekítenek."),
], [
  ("el café", "kávé"), ("el café con leche", "tejeskávé"), ("el té", "tea"), ("el agua", "víz"),
  ("la cerveza", "sör"), ("el vino", "bor"), ("el zumo de naranja", "narancslé"), ("el bocadillo", "szendvics (bagett)"),
  ("la tostada", "pirítós"), ("el azúcar", "cukor"), ("la cuenta", "számla"), ("caliente", "meleg, forró"),
], [
  ("Quería un café con leche, por favor.", "Egy tejeskávét kérnék."), ("¿Me pone una cerveza?", "Kérhetek egy sört?"),
  ("¿Cuánto es?", "Mennyi lesz?"), ("La cuenta, por favor.", "A számlát kérem."),
  ("¿Puedo pagar con tarjeta?", "Fizethetek kártyával?"), ("Sin azúcar, gracias.", "Cukor nélkül, köszönöm."),
]),
("u3", "A1", "Números y tiempo", "Számok és idő", "Időpontot egyeztetsz egy barátoddal", [
  ("tener = birtokolni, -ja van", "tengo, tienes, tiene, tenemos, tenéis, tienen. Az életkort is ezzel mondjuk: Tengo treinta años (harminc éves vagyok)."),
  ("Hány óra van?", "¿Qué hora es? – Es la una (1 óra). Son las dos (2 óra). y media = fél (2:30 = las dos y media), y cuarto = negyed (2:15), menos cuarto = háromnegyed (2:45 = las tres menos cuarto)."),
  ("A hét napjai", "lunes, martes, miércoles, jueves, viernes, sábado, domingo – kisbetűvel írjuk. El lunes = hétfőn, los lunes = hétfőnként."),
], [
  ("uno", "egy"), ("dos", "kettő"), ("tres", "három"), ("cuatro", "négy"), ("cinco", "öt"), ("diez", "tíz"),
  ("veinte", "húsz"), ("cien", "száz"), ("la hora", "óra (idő)"), ("el día", "nap"), ("la semana", "hét"), ("hoy", "ma"),
], [
  ("¿Qué hora es?", "Hány óra van?"), ("Son las tres y media.", "Fél négy van."), ("Tengo veinticinco años.", "Huszonöt éves vagyok."),
  ("¿Cuántos años tienes?", "Hány éves vagy?"), ("Hasta mañana.", "Holnap találkozunk."), ("Hoy es lunes.", "Ma hétfő van."),
]),
("u4", "A1", "De viaje", "Utazás", "Jegyet veszel a madridi pályaudvaron", [
  ("ir = menni", "voy, vas, va, vamos, vais, van. Voy a Sevilla. ¿Vamos?"),
  ("Elöljáró + névelő", "a + el = al (Voy al aeropuerto), de + el = del (Salgo del hotel). A la, de la nem olvad össze."),
  ("hay = van, vannak (valahol)", "¿Hay un hotel cerca? Hay dos trenes por hora. A hay nem változik többes számban."),
], [
  ("el tren", "vonat"), ("el autobús", "busz"), ("el billete", "jegy"), ("la estación", "állomás"),
  ("el aeropuerto", "repülőtér"), ("el hotel", "szálloda"), ("la maleta", "bőrönd"), ("a la derecha", "jobbra"),
  ("a la izquierda", "balra"), ("todo recto", "egyenesen"), ("cerca", "közel"), ("lejos", "messze"),
], [
  ("Un billete para Sevilla, por favor.", "Egy jegyet kérek Sevillába."), ("¿A qué hora sale el tren?", "Hánykor indul a vonat?"),
  ("¿Dónde está la estación?", "Hol van az állomás?"), ("Voy al aeropuerto.", "A repülőtérre megyek."),
  ("¿Hay un hotel cerca?", "Van a közelben szálloda?"), ("Gire a la derecha.", "Forduljon jobbra."),
]),
("u5", "A1", "En el restaurante", "Étteremben", "Vacsorát rendelsz egy sevillai tapasbárban", [
  ("-ar igék jelen időben", "hablar → hablo, hablas, habla, hablamos, habláis, hablan. Az alanyt általában elhagyjuk: Hablo español."),
  ("-er és -ir igék", "comer → como, comes, come, comemos, coméis, comen. vivir → vivo, vives, vive, vivimos, vivís, viven."),
  ("gustar = tetszik, szeretem", "Me gusta el vino (egy dolog). Me gustan las tapas (több dolog). ¿Te gusta? – Ízlik? Tetszik?"),
], [
  ("la mesa", "asztal"), ("la carta", "étlap"), ("el plato", "fogás, tányér"), ("la carne", "hús"),
  ("el pescado", "hal (étel)"), ("el pollo", "csirke"), ("la ensalada", "saláta"), ("el postre", "desszert"),
  ("el pan", "kenyér"), ("las tapas", "tapas (apró falatok)"), ("el camarero", "pincér"), ("rico", "finom"),
], [
  ("Una mesa para dos, por favor.", "Egy asztalt két főre."), ("¿Qué me recomienda?", "Mit ajánl?"),
  ("Para mí, el pescado.", "Nekem a halat."), ("Soy vegetariano.", "Vegetáriánus vagyok.", ["Soy vegetariana."]),
  ("Estaba todo muy rico.", "Minden nagyon finom volt."), ("Me gustan mucho las tapas.", "Nagyon szeretem a tapast."),
]),
("u6", "A1", "De compras", "Vásárlás", "Ruhát veszel egy barcelonai boltban", [
  ("Többes szám", "Magánhangzó után -s (casa → casas), mássalhangzó után -es (ciudad → ciudades). A melléknév egyezik: la camisa roja, los zapatos negros."),
  ("este, ese", "este/esta = ez (közel), ese/esa = az. Többes: estos/estas, esos/esas. ¿Cuánto cuesta esta camisa?"),
  ("Ár kérdezése", "¿Cuánto cuesta? (egy dolog) – ¿Cuánto cuestan? (több dolog). Es demasiado caro – túl drága."),
], [
  ("la tienda", "bolt"), ("el mercado", "piac"), ("la ropa", "ruha"), ("la camisa", "ing"),
  ("los zapatos", "cipő"), ("el precio", "ár"), ("barato", "olcsó"), ("caro", "drága"),
  ("grande", "nagy"), ("pequeño", "kicsi"), ("la talla", "méret (ruha)"), ("el dinero", "pénz"),
], [
  ("¿Cuánto cuesta esta camisa?", "Mennyibe kerül ez az ing?"), ("¿Tiene una talla más grande?", "Van nagyobb méretben?"),
  ("Es demasiado caro.", "Túl drága."), ("Me lo llevo.", "Megveszem."),
  ("Solo estoy mirando, gracias.", "Csak nézelődöm, köszönöm."), ("¿Dónde están los probadores?", "Hol vannak a próbafülkék?"),
]),
("u7", "A1", "El trabajo", "Munka", "Bemutatkozol új kollégáidnak egy irodában", [
  ("Foglalkozás névelő nélkül", "Soy médico. Es profesora. Névelő csak jelzővel: Es un médico muy bueno."),
  ("ser vagy estar?", "ser: állandó tulajdonság, eredet, foglalkozás (Soy ingeniera, Es de Madrid). estar: állapot és hely (Estoy cansado, Estoy en la oficina)."),
  ("trabajar en / de", "Trabajo en una empresa (egy cégnél). Trabajo de camarero (pincérként)."),
], [
  ("el trabajo", "munka"), ("la oficina", "iroda"), ("la empresa", "cég"), ("el jefe", "főnök"),
  ("el compañero", "kolléga"), ("la reunión", "megbeszélés"), ("el correo electrónico", "e-mail"), ("el ordenador", "számítógép"),
  ("el proyecto", "projekt"), ("el cliente", "ügyfél"), ("ocupado", "elfoglalt"), ("trabajar", "dolgozni"),
], [
  ("¿A qué te dedicas?", "Mivel foglalkozol?"), ("Trabajo en una empresa de software.", "Egy szoftvercégnél dolgozom."),
  ("Soy ingeniero.", "Mérnök vagyok.", ["Soy ingeniera."]), ("Tengo una reunión a las diez.", "Tízkor megbeszélésem van."),
  ("Estoy muy ocupado hoy.", "Ma nagyon elfoglalt vagyok.", ["Estoy muy ocupada hoy."]), ("Le envío un correo electrónico.", "Küldök Önnek egy e-mailt."),
]),
("u8", "A1", "La ciudad y la casa", "Város és otthon", "Lakást nézel, és körbevezetnek", [
  ("Birtokos névmások", "mi/mis (enyém), tu/tus (tiéd), su/sus (övé, Öné, övék), nuestro/a (miénk), vuestro/a (tiétek). Mi casa, mis amigos."),
  ("estar + hely", "La cocina está a la izquierda. El baño está al fondo. A hely kifejezésére mindig estar."),
  ("vivir = lakni, élni", "Vivo en Budapest. ¿Dónde vives? Vivimos en el centro."),
], [
  ("la casa", "ház, otthon"), ("el piso", "lakás"), ("la habitación", "szoba"), ("la cocina", "konyha"),
  ("el baño", "fürdőszoba"), ("la calle", "utca"), ("la plaza", "tér"), ("el barrio", "városrész, környék"),
  ("la ventana", "ablak"), ("la puerta", "ajtó"), ("el vecino", "szomszéd"), ("tranquilo", "csendes, nyugodt"),
], [
  ("Vivo en un piso pequeño.", "Egy kis lakásban lakom."), ("Mi barrio es muy tranquilo.", "A környékem nagyon csendes."),
  ("¿Dónde está el baño?", "Hol van a fürdőszoba?"), ("La cocina es muy luminosa.", "A konyha nagyon világos."),
  ("Mis vecinos son simpáticos.", "A szomszédaim kedvesek."), ("Hay una farmacia en la esquina.", "A sarkon van egy gyógyszertár."),
]),
("u9", "A2", "Tiempo libre", "Szabadidő", "Hétvégi programot terveztek egy baráttal", [
  ("encantar = imádni", "Úgy működik, mint a gustar: Me encanta bailar. Me encantan los conciertos."),
  ("Gyakoriság", "siempre (mindig), a menudo (gyakran), a veces (néha), nunca (soha). Nunca veo la tele = No veo nunca la tele."),
  ("ir a + főnévi igenév", "Közeli jövő: Voy a ver una película. ¿Vas a venir?"),
], [
  ("el cine", "mozi"), ("la película", "film"), ("el fútbol", "foci"), ("la playa", "strand, tengerpart"),
  ("la música", "zene"), ("el concierto", "koncert"), ("bailar", "táncolni"), ("leer", "olvasni"),
  ("nadar", "úszni"), ("el fin de semana", "hétvége"), ("a menudo", "gyakran"), ("nunca", "soha"),
], [
  ("¿Qué haces el fin de semana?", "Mit csinálsz hétvégén?"), ("Me encanta ir a la playa.", "Imádok strandra járni."),
  ("Voy a ver una película esta noche.", "Ma este megnézek egy filmet."), ("Nunca veo la tele.", "Soha nem nézek tévét."),
  ("¿Quedamos el sábado?", "Találkozunk szombaton?"), ("A veces juego al fútbol.", "Néha focizom."),
]),
("u10", "A2", "El pasado", "Mi történt? (pretérito indefinido)", "Elmeséled egy barátodnak, mit csináltál hétvégén", [
  ("pretérito indefinido = befejezett múlt", "-ar: hablé, hablaste, habló, hablamos, hablasteis, hablaron. -er/-ir: comí, comiste, comió, comimos, comisteis, comieron."),
  ("Gyakori rendhagyók", "ir és ser: fui, fuiste, fue, fuimos, fuisteis, fueron. hacer: hice, hiciste, hizo. tener: tuve. estar: estuve."),
  ("Időhatározók", "ayer (tegnap), anoche (tegnap este), la semana pasada (múlt héten), el año pasado (tavaly), hace dos días (két napja)."),
], [
  ("ayer", "tegnap"), ("anoche", "tegnap este"), ("el año pasado", "tavaly"), ("la semana pasada", "múlt héten"),
  ("el viaje", "utazás"), ("las vacaciones", "szabadság, nyaralás"), ("visitar", "meglátogatni"), ("volver", "visszatérni"),
  ("conocer", "megismerni"), ("fui", "mentem, voltam"), ("hice", "csináltam"), ("tuve", "volt nekem"),
], [
  ("Ayer fui al cine.", "Tegnap moziba mentem."), ("¿Qué hiciste el fin de semana?", "Mit csináltál hétvégén?"),
  ("El año pasado visité México.", "Tavaly Mexikóban jártam."), ("Comimos paella en la playa.", "Paellát ettünk a strandon."),
  ("Anoche volví muy tarde.", "Tegnap este nagyon későn értem haza."), ("Fue un viaje increíble.", "Hihetetlen utazás volt."),
]),
("u11", "A2", "Mi día", "A napi rutin (visszaható igék)", "Egy kollégádnak elmeséled egy átlagos napodat", [
  ("Visszaható igék", "levantarse → me levanto, te levantas, se levanta, nos levantamos, os levantáis, se levantan."),
  ("pretérito perfecto = ma, ezen a héten", "haber + -ado/-ido: he comido, has trabajado, ha salido. Hoy he trabajado mucho."),
  ("Napszakok", "por la mañana (reggel, délelőtt), por la tarde (délután), por la noche (este, éjjel). Pontos idő: a las siete."),
], [
  ("levantarse", "felkelni"), ("ducharse", "zuhanyozni"), ("vestirse", "felöltözni"), ("desayunar", "reggelizni"),
  ("comer", "ebédelni, enni"), ("cenar", "vacsorázni"), ("acostarse", "lefeküdni"), ("temprano", "korán"),
  ("tarde", "későn"), ("por la mañana", "reggel, délelőtt"), ("normalmente", "általában"), ("el despertador", "ébresztőóra"),
], [
  ("Me levanto a las siete.", "Hétkor kelek."), ("Normalmente desayuno café y tostadas.", "Általában kávét és pirítóst reggelizem."),
  ("Hoy he trabajado mucho.", "Ma sokat dolgoztam."), ("Me acuesto bastante tarde.", "Elég későn fekszem le."),
  ("Primero me ducho y luego me visto.", "Először lezuhanyozom, aztán felöltözöm."), ("¿A qué hora cenas?", "Hánykor vacsorázol?"),
]),
("u12", "A2", "Cuando era pequeño", "Amikor kicsi voltam (imperfecto)", "A nagymamád mesél a gyerekkoráról", [
  ("imperfecto = folyamatos múlt", "-ar: hablaba, hablabas, hablaba, hablábamos, hablabais, hablaban. -er/-ir: comía, comías, comía, comíamos, comíais, comían."),
  ("Csak három rendhagyó", "ser → era, ir → iba, ver → veía."),
  ("imperfecto vagy indefinido?", "Szokás, leírás, háttér: imperfecto (Cuando era niño, vivía en un pueblo). Egyszeri, lezárt esemény: indefinido (Un día conocí a Pedro)."),
], [
  ("la infancia", "gyerekkor"), ("el pueblo", "falu"), ("los abuelos", "nagyszülők"), ("el colegio", "iskola"),
  ("jugar", "játszani"), ("de niño", "gyerekként"), ("antes", "régen"), ("todos los días", "minden nap"),
  ("el recuerdo", "emlék"), ("era", "volt (ser)"), ("iba", "járt, ment (ir)"), ("tenía", "volt neki (tener)"),
], [
  ("Cuando era pequeño, vivía en un pueblo.", "Kiskoromban egy faluban laktam.", ["Cuando era pequeña, vivía en un pueblo."]),
  ("Todos los días jugaba en la calle.", "Minden nap az utcán játszottam."), ("Mis abuelos tenían un perro.", "A nagyszüleimnek volt egy kutyájuk."),
  ("Antes iba al colegio a pie.", "Régen gyalog jártam iskolába."), ("Era un niño muy tímido.", "Nagyon félénk gyerek voltam.", ["Era una niña muy tímida."]),
  ("Tengo muy buenos recuerdos.", "Nagyon szép emlékeim vannak."),
]),
("u13", "A2", "Quería, podría", "Udvariasan (feltételes mód)", "Udvariasan kérsz segítséget egy hotel recepcióján", [
  ("condicional = feltételes mód", "főnévi igenév + -ía, -ías, -ía, -íamos, -íais, -ían: hablaría, comería, viviría."),
  ("Rendhagyó tövek", "poder → podría, tener → tendría, hacer → haría, decir → diría, querer → querría, salir → saldría."),
  ("Tanács", "Deberías descansar (pihenned kellene). Yo que tú, iría en tren (a helyedben vonattal mennék)."),
], [
  ("podría", "tudna, tudnék"), ("me gustaría", "szeretnék"), ("sería", "lenne"), ("ayudar", "segíteni"),
  ("el favor", "szívesség"), ("la reserva", "foglalás"), ("cambiar", "megváltoztatni, cserélni"), ("deberías", "kellene (neked)"),
  ("preferiría", "jobban szeretném"), ("amable", "kedves"), ("posible", "lehetséges"), ("disculpe", "elnézést (magázva)"),
], [
  ("¿Podría ayudarme, por favor?", "Tudna segíteni?"), ("Me gustaría cambiar la reserva.", "Szeretném megváltoztatni a foglalást."),
  ("¿Sería posible salir más tarde?", "Lehetne később kijelentkezni?"), ("Yo que tú, iría en tren.", "A helyedben vonattal mennék."),
  ("Deberías descansar un poco.", "Pihenned kellene egy kicsit."), ("Es usted muy amable.", "Ön nagyon kedves."),
]),
("u14", "A2", "En el médico", "Orvosnál", "Orvosnál elmondod a tüneteidet", [
  ("doler = fájni", "Úgy működik, mint a gustar: Me duele la cabeza. Me duelen los pies. A testrészhez névelő kell, nem birtokos."),
  ("desde hace = óta", "Tengo fiebre desde hace dos días (két napja lázas vagyok). Desde ayer = tegnap óta."),
  ("tener que = kell", "Tiene que tomar estas pastillas (be kell vennie). Tengo que descansar."),
], [
  ("el médico", "orvos"), ("la farmacia", "gyógyszertár"), ("la cabeza", "fej"), ("el estómago", "gyomor"),
  ("la garganta", "torok"), ("la fiebre", "láz"), ("la tos", "köhögés"), ("la pastilla", "tabletta"),
  ("la receta", "recept"), ("enfermo", "beteg"), ("doler", "fájni"), ("la cita", "időpont (orvosnál)"),
], [
  ("Me duele mucho la cabeza.", "Nagyon fáj a fejem."), ("Tengo fiebre desde ayer.", "Tegnap óta lázas vagyok."),
  ("Necesito una cita con el médico.", "Időpontra van szükségem az orvoshoz."), ("¿Tiene algo para la tos?", "Van valami köhögés ellen?"),
  ("Tiene que tomar una pastilla cada ocho horas.", "Nyolcóránként be kell vennie egy tablettát."), ("Me encuentro mal.", "Rosszul érzem magam."),
]),
("u15", "B1", "Planes y sueños", "Tervek (jövő idő)", "Egy barátoddal a jövőbeli terveitekről beszélgettek", [
  ("futuro simple = jövő idő", "főnévi igenév + -é, -ás, -á, -emos, -éis, -án: hablaré, comerás, vivirá."),
  ("Rendhagyó tövek", "tener → tendré, hacer → haré, poder → podré, salir → saldré, venir → vendré, decir → diré."),
  ("Feltételezés", "A jövő idő valószínűséget is kifejez: Estará en casa (valószínűleg otthon van)."),
], [
  ("el futuro", "jövő"), ("el plan", "terv"), ("el sueño", "álom"), ("mudarse", "költözni"),
  ("ahorrar", "spórolni"), ("conseguir", "elérni, megszerezni"), ("el año que viene", "jövőre"), ("pronto", "hamarosan"),
  ("quizás", "talán"), ("seguro", "biztos"), ("tendré", "lesz nekem"), ("haré", "csinálni fogok"),
], [
  ("El año que viene me mudaré a Valencia.", "Jövőre Valenciába költözöm."), ("Quizás cambiaré de trabajo.", "Talán munkahelyet váltok."),
  ("Estoy ahorrando para un viaje.", "Spórolok egy utazásra."), ("¿Qué harás después de la universidad?", "Mit fogsz csinálni az egyetem után?"),
  ("Seguro que lo conseguirás.", "Biztosan sikerülni fog."), ("Mi sueño es vivir junto al mar.", "Az álmom, hogy a tenger mellett éljek."),
]),
("u16", "B1", "En mi opinión", "Vélemény és vita (kötőmód)", "Egy baráti vitában elmondod a véleményedet", [
  ("Véleményt mondani", "Creo que… / Pienso que… / En mi opinión… / Para mí… – utána kijelentő mód: Creo que tienes razón."),
  ("Tagadott vélemény után kötőmód", "No creo que sea verdad. No pienso que tengas razón. Es importante que lo pienses."),
  ("subjuntivo presente", "-ar → -e: hable, hables. -er/-ir → -a: coma, viva. Rendhagyó: ser → sea, ir → vaya, tener → tenga, hacer → haga."),
], [
  ("la opinión", "vélemény"), ("creer", "hinni, gondolni"), ("estar de acuerdo", "egyetérteni"), ("la ventaja", "előny"),
  ("la desventaja", "hátrány"), ("sin embargo", "azonban"), ("además", "ráadásul"), ("por un lado", "egyrészt"),
  ("por otro lado", "másrészt"), ("el argumento", "érv"), ("importante", "fontos"), ("depende", "attól függ"),
], [
  ("En mi opinión, es una buena idea.", "Szerintem ez jó ötlet."), ("No estoy de acuerdo contigo.", "Nem értek egyet veled."),
  ("No creo que sea tan fácil.", "Nem hiszem, hogy ilyen könnyű."), ("Por un lado es barato, por otro lado es lento.", "Egyrészt olcsó, másrészt lassú."),
  ("Es importante que lo pienses bien.", "Fontos, hogy jól átgondold."), ("Depende de la situación.", "A helyzettől függ."),
]),
("u17", "B1", "Trabajo y negocios", "Üzleti spanyol", "Egy állásinterjún beszélsz a tapasztalataidról", [
  ("Formális levél", "Megszólítás: Estimado señor / Estimada señora. Zárás: Un cordial saludo / Atentamente."),
  ("llevar + időtartam + gerundio", "Llevo cinco años trabajando en marketing = öt éve dolgozom marketingben."),
  ("Udvarias kérés", "¿Podría enviarme el contrato? Le agradecería una respuesta (hálás lennék egy válaszért)."),
], [
  ("la entrevista", "interjú"), ("el currículum", "önéletrajz"), ("la experiencia", "tapasztalat"), ("el sueldo", "fizetés"),
  ("el contrato", "szerződés"), ("el equipo", "csapat"), ("el plazo", "határidő"), ("el presupuesto", "költségvetés, árajánlat"),
  ("negociar", "tárgyalni"), ("responsable", "felelős"), ("la empresa", "vállalat"), ("el puesto", "állás, pozíció"),
], [
  ("Llevo cinco años trabajando en marketing.", "Öt éve dolgozom marketingben."), ("Me gusta trabajar en equipo.", "Szeretek csapatban dolgozni."),
  ("¿Cuál sería el sueldo?", "Mennyi lenne a fizetés?"), ("Le envío el presupuesto mañana.", "Holnap elküldöm az árajánlatot."),
  ("Tenemos que cumplir el plazo.", "Tartanunk kell a határidőt."), ("Un cordial saludo.", "Szívélyes üdvözlettel."),
]),
("u18", "B1", "Si pudiera…", "Ha tehetném… (feltételes mondat)", "Arról beszélgettek, mit tennétek, ha nyernétek a lottón", [
  ("Nem valós feltétel", "Si + subjuntivo imperfecto, + condicional: Si tuviera dinero, viajaría (ha lenne pénzem, utaznék)."),
  ("subjuntivo imperfecto", "Az indefinido többes szám 3. személyéből: tuvieron → tuviera, fueron → fuera, pudieron → pudiera, hablaron → hablara."),
  ("Valós feltétel", "Si llueve, me quedo en casa (ha esik, otthon maradok) – itt jelen idő kell."),
], [
  ("si", "ha"), ("tuviera", "lenne nekem"), ("pudiera", "tudnék, lehetne"), ("fuera", "lennék, mennék"),
  ("viajaría", "utaznék"), ("la lotería", "lottó"), ("ganar", "nyerni"), ("el mundo", "világ"),
  ("ojalá", "bárcsak"), ("imaginar", "elképzelni"), ("la oferta", "ajánlat"), ("la vuelta al mundo", "világ körüli út"),
], [
  ("Si tuviera más tiempo, aprendería a tocar la guitarra.", "Ha több időm lenne, megtanulnék gitározni."),
  ("Si ganara la lotería, daría la vuelta al mundo.", "Ha megnyerném a lottót, körbeutaznám a világot."),
  ("Si yo fuera tú, aceptaría la oferta.", "A helyedben elfogadnám az ajánlatot."), ("Ojalá pudiera quedarme más días.", "Bárcsak tovább maradhatnék."),
  ("Si llueve, nos quedamos en casa.", "Ha esik, otthon maradunk."), ("¿Qué harías tú en mi lugar?", "Te mit tennél a helyemben?"),
]),
]

STORIES = [
("s1", "A1", "u2", "Un café en Madrid", "Egy kávé Madridban", {"N": "Narrador", "L": "Lucía", "P": "Pablo"}, [
  ("N", "Es lunes por la mañana. Lucía entra en una cafetería.", "Hétfő reggel van. Lucía belép egy kávézóba."),
  ("P", "¡Buenos días! ¿Qué le pongo?", "Jó reggelt! Mit adhatok?"),
  ("L", "Buenos días. Quería un café con leche, por favor.", "Jó reggelt. Egy tejeskávét kérnék."),
  ("P", "¿Algo más?", "Valami mást?"),
  ("L", "Sí, una tostada con tomate.", "Igen, egy paradicsomos pirítóst."),
  ("Q", "Mit kér Lucía?", ["Tejeskávét és pirítóst", "Teát és szendvicset", "Narancslét"], 0),
  ("P", "Aquí tiene. ¿Azúcar?", "Tessék. Cukor?"),
  ("L", "No, gracias. ¿Cuánto es?", "Nem, köszönöm. Mennyi lesz?"),
  ("P", "Son tres euros con cincuenta.", "Három ötven lesz."),
  ("L", "¿Puedo pagar con tarjeta?", "Fizethetek kártyával?"),
  ("P", "Claro que sí.", "Természetesen."),
  ("Q", "Hogyan fizet Lucía?", ["Kártyával", "Készpénzzel", "Sehogy, meghívják"], 0),
  ("N", "Lucía desayuna tranquila y lee el periódico.", "Lucía nyugodtan reggelizik, és újságot olvas."),
]),
("s2", "A1", "u4", "El tren a Sevilla", "A sevillai vonat", {"N": "Narrador", "M": "Marcos", "T": "Taquillera"}, [
  ("N", "Marcos está en la estación de Atocha, en Madrid.", "Marcos a madridi Atocha pályaudvaron van."),
  ("M", "Buenas tardes. Un billete para Sevilla, por favor.", "Jó napot. Egy jegyet kérek Sevillába."),
  ("T", "¿De ida y vuelta?", "Retúrjegyet?"),
  ("M", "No, solo de ida. ¿A qué hora sale el próximo tren?", "Nem, csak oda. Hánykor indul a következő vonat?"),
  ("T", "Sale a las cinco y cuarto, del andén ocho.", "Negyed hatkor indul, a nyolcas vágányról."),
  ("Q", "Hánykor indul a vonat?", ["5:15-kor", "5:45-kor", "8:00-kor"], 0),
  ("M", "Perfecto. ¿Cuánto cuesta?", "Remek. Mennyibe kerül?"),
  ("T", "Son cuarenta y cinco euros.", "Negyvenöt euró."),
  ("M", "Aquí tiene. ¿Dónde está el andén ocho?", "Tessék. Hol van a nyolcas vágány?"),
  ("T", "Todo recto y luego a la derecha.", "Egyenesen, aztán jobbra."),
  ("Q", "Merre van a nyolcas vágány?", ["Egyenesen, aztán jobbra", "Balra, a bejáratnál", "Lent, a lépcső alatt"], 0),
  ("N", "Marcos corre al andén y sube al tren justo a tiempo.", "Marcos a vágányhoz fut, és épp időben felszáll a vonatra."),
]),
("s3", "A2", "u10", "Un fin de semana en Valencia", "Egy hétvége Valenciában", {"N": "Narrador", "E": "Elena", "J": "Javier"}, [
  ("N", "Es lunes. Elena y Javier toman un café en la oficina.", "Hétfő van. Elena és Javier kávéznak az irodában."),
  ("J", "¡Hola, Elena! ¿Qué hiciste el fin de semana?", "Szia, Elena! Mit csináltál hétvégén?"),
  ("E", "Fui a Valencia con mi hermana.", "Valenciába mentem a húgommal."),
  ("J", "¡Qué bien! ¿Y qué tal?", "De jó! És milyen volt?"),
  ("E", "Fue genial. El sábado fuimos a la playa y comimos paella.", "Szuper volt. Szombaton strandra mentünk, és paellát ettünk."),
  ("Q", "Kivel ment Elena Valenciába?", ["A lánytestvérével", "Javierrel", "Egyedül"], 0),
  ("J", "¿Visitaste la Ciudad de las Artes y las Ciencias?", "Megnézted a Művészetek és Tudományok Városát?"),
  ("E", "Sí, el domingo. Es increíble. ¿Y tú, qué hiciste?", "Igen, vasárnap. Hihetetlen. És te mit csináltál?"),
  ("J", "Yo me quedé en casa. Estuve un poco enfermo.", "Én otthon maradtam. Kicsit beteg voltam."),
  ("E", "¡Vaya! ¿Ya estás mejor?", "Jaj! Már jobban vagy?"),
  ("J", "Sí, ya estoy bien, gracias.", "Igen, már jól vagyok, köszönöm."),
  ("Q", "Mit csinált Javier hétvégén?", ["Otthon maradt, mert beteg volt", "Valenciába utazott", "Strandra ment"], 0),
  ("N", "Elena le enseña las fotos del viaje.", "Elena megmutatja neki az út fotóit."),
]),
("s4", "B1", "u17", "La entrevista", "Az interjú", {"N": "Narrador", "C": "Carmen", "D": "Daniel"}, [
  ("N", "Daniel tiene una entrevista de trabajo en una empresa de Barcelona.", "Danielnek állásinterjúja van egy barcelonai cégnél."),
  ("C", "Buenos días, Daniel. Siéntese, por favor. Háblenos un poco de usted.", "Jó napot, Daniel. Foglaljon helyet. Meséljen kicsit magáról."),
  ("D", "Buenos días. Llevo cinco años trabajando como diseñador gráfico.", "Jó napot. Öt éve dolgozom grafikusként."),
  ("C", "¿Por qué le interesa este puesto?", "Miért érdekli ez az állás?"),
  ("D", "Me gustaría trabajar en un equipo internacional y aprender cosas nuevas.", "Szeretnék nemzetközi csapatban dolgozni és új dolgokat tanulni."),
  ("Q", "Mióta dolgozik Daniel grafikusként?", ["Öt éve", "Két éve", "Tíz éve"], 0),
  ("C", "¿Cuál es su mayor fortaleza?", "Mi a legnagyobb erőssége?"),
  ("D", "Soy creativo y siempre cumplo los plazos.", "Kreatív vagyok, és mindig tartom a határidőket."),
  ("C", "Muy bien. ¿Tiene alguna pregunta para nosotros?", "Nagyon jó. Van kérdése felénk?"),
  ("D", "Sí. ¿Cómo sería un día normal en este puesto?", "Igen. Milyen lenne egy átlagos nap ebben a pozícióban?"),
  ("C", "Trabajaría con el equipo de marketing en varios proyectos.", "A marketingcsapattal dolgozna több projekten."),
  ("Q", "Mi Daniel legnagyobb erőssége?", ["Kreatív és tartja a határidőket", "Jól beszél angolul", "Szeret utazni"], 0),
  ("N", "Una semana después, Daniel recibe una llamada: ¡el puesto es suyo!", "Egy héttel később Daniel hívást kap: övé az állás!"),
]),
]

# Igék: jelen, befejezett múlt (indefinido), folyamatos múlt (imperfecto), jövő, feltételes
END = {
  "ar": {"pres": ["o", "as", "a", "amos", "áis", "an"], "pret": ["é", "aste", "ó", "amos", "asteis", "aron"], "imp": ["aba", "abas", "aba", "ábamos", "abais", "aban"]},
  "er": {"pres": ["o", "es", "e", "emos", "éis", "en"], "pret": ["í", "iste", "ió", "imos", "isteis", "ieron"], "imp": ["ía", "ías", "ía", "íamos", "íais", "ían"]},
  "ir": {"pres": ["o", "es", "e", "imos", "ís", "en"], "pret": ["í", "iste", "ió", "imos", "isteis", "ieron"], "imp": ["ía", "ías", "ía", "íamos", "íais", "ían"]},
}
FUT = ["é", "ás", "á", "emos", "éis", "án"]
COND = ["ía", "ías", "ía", "íamos", "íais", "ían"]

VERBS = [
  ("ser", "lenni (állandó)", "A1", {"pres": "soy eres es somos sois son", "pret": "fui fuiste fue fuimos fuisteis fueron", "imp": "era eras era éramos erais eran"}),
  ("estar", "lenni (állapot, hely)", "A1", {"pres": "estoy estás está estamos estáis están", "pret": "estuve estuviste estuvo estuvimos estuvisteis estuvieron"}),
  ("tener", "birtokolni", "A1", {"pres": "tengo tienes tiene tenemos tenéis tienen", "pret": "tuve tuviste tuvo tuvimos tuvisteis tuvieron", "stem": "tendr"}),
  ("ir", "menni", "A1", {"pres": "voy vas va vamos vais van", "pret": "fui fuiste fue fuimos fuisteis fueron", "imp": "iba ibas iba íbamos ibais iban"}),
  ("hacer", "csinálni", "A1", {"pres": "hago haces hace hacemos hacéis hacen", "pret": "hice hiciste hizo hicimos hicisteis hicieron", "stem": "har"}),
  ("poder", "tudni, -hat/-het", "A1", {"pres": "puedo puedes puede podemos podéis pueden", "pret": "pude pudiste pudo pudimos pudisteis pudieron", "stem": "podr"}),
  ("querer", "akarni, szeretni", "A1", {"pres": "quiero quieres quiere queremos queréis quieren", "pret": "quise quisiste quiso quisimos quisisteis quisieron", "stem": "querr"}),
  ("decir", "mondani", "A2", {"pres": "digo dices dice decimos decís dicen", "pret": "dije dijiste dijo dijimos dijisteis dijeron", "stem": "dir"}),
  ("venir", "jönni", "A1", {"pres": "vengo vienes viene venimos venís vienen", "pret": "vine viniste vino vinimos vinisteis vinieron", "stem": "vendr"}),
  ("saber", "tudni (ismeret)", "A2", {"pres": "sé sabes sabe sabemos sabéis saben", "pret": "supe supiste supo supimos supisteis supieron", "stem": "sabr"}),
  ("dar", "adni", "A2", {"pres": "doy das da damos dais dan", "pret": "di diste dio dimos disteis dieron"}),
  ("ver", "látni", "A1", {"pres": "veo ves ve vemos veis ven", "pret": "vi viste vio vimos visteis vieron", "imp": "veía veías veía veíamos veíais veían"}),
  ("poner", "tenni", "A2", {"pres": "pongo pones pone ponemos ponéis ponen", "pret": "puse pusiste puso pusimos pusisteis pusieron", "stem": "pondr"}),
  ("salir", "kimenni, indulni", "A2", {"pres": "salgo sales sale salimos salís salen", "stem": "saldr"}),
  ("volver", "visszatérni", "A2", {"pres": "vuelvo vuelves vuelve volvemos volvéis vuelven"}),
  ("pedir", "kérni, rendelni", "A2", {"pres": "pido pides pide pedimos pedís piden", "pret": "pedí pediste pidió pedimos pedisteis pidieron"}),
  ("dormir", "aludni", "A1", {"pres": "duermo duermes duerme dormimos dormís duermen", "pret": "dormí dormiste durmió dormimos dormisteis durmieron"}),
  ("jugar", "játszani", "A1", {"pres": "juego juegas juega jugamos jugáis juegan", "pret": "jugué jugaste jugó jugamos jugasteis jugaron"}),
  ("hablar", "beszélni", "A1", {}), ("trabajar", "dolgozni", "A1", {}), ("estudiar", "tanulni", "A1", {}),
  ("comer", "enni", "A1", {}), ("beber", "inni", "A1", {}), ("vivir", "élni, lakni", "A1", {}), ("escribir", "írni", "A2", {}),
]


def conj(inf, irr):
    kind, stem = inf[-2:], inf[:-2]
    forms = {}
    for t in ("pres", "pret", "imp"):
        forms[t] = irr[t].split() if t in irr else [stem + e for e in END[kind][t]]
    fs = irr.get("stem", inf)
    forms["fut"] = [fs + e for e in FUT]
    forms["cond"] = [fs + e for e in COND]
    return forms


def main():
    units = []
    for uid, lvl, title, hu, role, gram, words, sents in UNITS:
        items = []
        for k, lst in (("w", words), ("s", sents)):
            for i, t in enumerate(lst, 1):
                it = {"id": f"es-{uid}-{k}{i}", "k": k, "it": t[0], "hu": t[1]}
                if len(t) > 2:
                    it["alt"] = t[2]
                items.append(it)
        units.append({"id": f"es-{uid}", "title": title, "hu": hu, "level": lvl, "role": role,
                      "grammar": [{"h": h, "p": p} for h, p in gram], "items": items})
    pack = {"lang": "es", "name": "Spanyol", "native": "Español", "tts": "es-ES", "version": 1, "units": units}
    stories = []
    for sid, lvl, unlock, title, hu, cast, lines in STORIES:
        out = []
        for ln in lines:
            if ln[0] == "Q":
                out.append({"q": ln[1], "o": ln[2], "a": ln[3]})
            else:
                out.append({"s": ln[0], "it": ln[1], "hu": ln[2]})
        stories.append({"id": f"es-{sid}", "level": lvl, "unlock": f"es-{unlock}", "img": f"es-{unlock}", "title": title, "hu": hu,
                        "cast": {k: {"name": v} for k, v in cast.items()}, "lines": out})
    verbs = {"pronouns": ["yo", "tú", "él/ella", "nosotros", "vosotros", "ellos"],
             "tenses": {"pres": "jelen idő", "pret": "befejezett múlt (indefinido)", "imp": "folyamatos múlt (imperfecto)", "fut": "jövő idő", "cond": "feltételes mód"},
             "verbs": [{"inf": inf, "hu": hu, "level": lvl, "aux": "", "forms": conj(inf, irr)} for inf, hu, lvl, irr in VERBS]}
    for name, data in (("es", pack), ("stories-es", {"lang": "es", "stories": stories}), ("verbs-es", verbs)):
        (ROOT / "data" / f"{name}.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    n = sum(len(u["items"]) for u in units)
    print(f"spanyol: {len(units)} lecke, {n} elem, {len(stories)} történet, {len(verbs['verbs'])} ige")


if __name__ == "__main__":
    main()
