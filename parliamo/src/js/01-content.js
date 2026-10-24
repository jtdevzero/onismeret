/* ============ CONTENT ============ */
/* The course itself (30 units, stories, verbs) is loaded from data/*.json at boot.
   OLD holds the first-round lessons; only their grammar drills are reused, attached to the matching units. */
const OLD=[
{t:"Saluti e presentazioni",hu:"Köszönés és bemutatkozás",goal:"Köszönni, bemutatkozni, megkérdezni, hogy van valaki.",
notes:["Két megszólítás van: <b>tu</b> (tegezés) és <b>Lei</b> (magázás). Boltban, hivatalban, idegenekkel a Lei a helyes: <i>Come sta?</i> Barátoknak: <i>Come stai?</i> A Lei-hez az ige harmadik személyű alakja jár, mintha „ő”-ről beszélnél.",
"Az <b>essere</b> (lenni) egyes számban: <i>io sono</i> (vagyok), <i>tu sei</i> (vagy), <i>lui/lei/Lei è</i> (ő van / Ön van).",
"Kiejtés: <b>c, g</b> + e/i = cs, dzs: <i>ciao</i> [csáo], <i>buongiorno</i> [buondzsorno]. <b>ch, gh</b> = k, g: <i>che</i> [ke]. <b>gn</b> ≈ ny: <i>gnocchi</i> [nyokki]. <b>gli</b> ≈ lyi. A <b>h</b> néma. A dupla mássalhangzót tényleg hosszan ejtsd: <i>notte</i>."],
words:[["ciao","szia"],["buongiorno","jó napot"],["buonasera","jó estét"],["buonanotte","jó éjszakát"],["arrivederci","viszontlátásra"],["grazie","köszönöm"],["prego","szívesen"],["per favore","kérem / légyszi"],["scusi","elnézést (magázva)"],["sì","igen"],["no","nem"],["bene","jól"],["piacere","örvendek"],["ungherese","magyar"]],
phrases:[["Mi chiamo Anna.","A nevem Anna."],["Come ti chiami?","Hogy hívnak?"],["Come si chiama?","Hogy hívják? (magázva)"],["Come stai?","Hogy vagy?"],["Sto bene, grazie.","Jól vagyok, köszönöm."],["Sono ungherese.","Magyar vagyok."],["Di dove sei?","Honnan jöttél?"],["Sono di Budapest.","Budapesti vagyok."]],
grammar:[["Io ___ ungherese.","sono",["sono","sei","è"]],["Tu ___ italiano?","sei",["sono","sei","è"]],["Lei ___ di Roma? (magázva)","è",["è","sei","sono"]],["Come ti ___?","chiami",["chiami","chiama","chiamo"]],["Come ___ chiama? (magázva)","si",["si","ti","mi"]]]},
{t:"Articoli",hu:"Névelők és nemek",goal:"Felismerni a főnevek nemét, és jó névelőt tenni eléjük.",
notes:["Minden főnév hím- vagy nőnemű. Általában <b>-o</b> = hímnem (<i>libro</i>), <b>-a</b> = nőnem (<i>casa</i>), <b>-e</b> = bármelyik (<i>il giorno</i>, de <i>la chiave</i>), ezt szóval együtt kell megtanulni.",
"Határozott névelő (a, az): hímnem <b>il</b> mássalhangzó előtt, <b>lo</b> s+mássalhangzó, z, gn, ps, y előtt, <b>l'</b> magánhangzó előtt. Nőnem <b>la</b>, magánhangzó előtt <b>l'</b>.",
"Határozatlan (egy): <b>un</b> (hímnem), <b>uno</b> (ahol lo állna), <b>una</b> (nőnem), <b>un'</b> (nőnem magánhangzó előtt). Hímnemben magánhangzó előtt nincs aposztróf: <i>un amico</i>, de <i>un'amica</i>."],
words:[["il libro","könyv"],["la casa","ház"],["lo studente","diák"],["l'amico","barát"],["l'amica","barátnő"],["la chiave","kulcs"],["il giorno","nap"],["la notte","éjszaka"],["lo zaino","hátizsák"],["l'acqua","víz"],["il telefono","telefon"],["la borsa","táska"],["l'albergo","szálloda"],["la città","város"]],
phrases:[["Questo è un libro.","Ez egy könyv."],["Questa è una chiave.","Ez egy kulcs."],["Dov'è la stazione?","Hol van az állomás?"],["Ho un'amica italiana.","Van egy olasz barátnőm."],["È uno studente.","Ő egy diák."],["La città è bella.","A város szép."]],
grammar:[["___ studente","lo",["il","lo","l'"]],["___ acqua","l'",["la","l'","lo"]],["___ amica (egy)","un'",["un","un'","una"]],["___ zaino (egy)","uno",["un","uno","una"]],["___ giorno","il",["il","lo","l'"]],["___ albergo (egy)","un",["un","un'","uno"]]]},
{t:"Numeri ed età",hu:"Számok és életkor",goal:"Számolni 0–100-ig, megmondani a korodat és árakat kérdezni.",
notes:["Az <b>avere</b> (birtokolni): <i>ho, hai, ha, abbiamo, avete, hanno</i>. A h néma: <i>ho</i> = [o].",
"Az életkort az avere-vel mondjuk: <i>Ho trent'anni</i>, szó szerint „harminc évem van”.",
"Tízesek: venti, trenta, quaranta, cinquanta, sessanta, settanta, ottanta, novanta. Egyes és nyolcas előtt a tízes elveszti a végét: <i>ventuno, ventotto</i>. A hármas ékezetet kap: <i>ventitré</i>."],
words:[["uno","egy"],["due","kettő"],["tre","három"],["quattro","négy"],["cinque","öt"],["sei","hat"],["sette","hét"],["otto","nyolc"],["nove","kilenc"],["dieci","tíz"],["venti","húsz"],["trenta","harminc"],["cento","száz"],["mille","ezer"],["l'anno","év"]],
phrases:[["Quanti anni hai?","Hány éves vagy?"],["Ho venticinque anni.","Huszonöt éves vagyok."],["Quanto costa?","Mennyibe kerül?"],["Costa dieci euro.","Tíz euróba kerül."],["Hai fratelli?","Vannak testvéreid?"],["Ho due sorelle.","Két lánytestvérem van."]],
grammar:[["Io ___ trent'anni.","ho",["ho","hai","ha"]],["Quanti anni ___ tu?","hai",["ha","hai","hanno"]],["Noi ___ una casa grande.","abbiamo",["abbiamo","avete","hanno"]],["Loro ___ due figli.","hanno",["hanno","ha","avete"]],["Írd le betűvel: 7","sette"],["Írd le betűvel: 21","ventuno"]]},
{t:"Al bar",hu:"A bárban",goal:"Kávét és reggelit rendelni, fizetni.",
notes:["Olaszországban a <b>caffè</b> eszpresszót jelent. A cappuccino reggeli ital, ebéd után ritkán kérik.",
"Udvarias kérés: <b>Vorrei…</b> (szeretnék). A <i>voglio</i> (akarok) nyersen hangzik.",
"Sok bárban előbb a kasszánál fizetsz, a blokkot (<i>lo scontrino</i>) leteszed a pultra, és utána rendelsz. Pultnál állva olcsóbb, mint asztalnál ülve."],
words:[["il caffè","kávé (eszpresszó)"],["il latte","tej"],["il tè","tea"],["la birra","sör"],["il vino","bor"],["il cornetto","croissant"],["il panino","szendvics"],["lo zucchero","cukor"],["il bicchiere","pohár"],["il conto","számla"],["lo scontrino","blokk"],["freddo","hideg"],["caldo","meleg"]],
phrases:[["Vorrei un caffè, per favore.","Kérnék egy kávét."],["Un cappuccino e un cornetto.","Egy cappuccinót és egy croissant-t."],["Quant'è?","Mennyi lesz?"],["Il conto, per favore.","A számlát, kérem."],["Posso pagare con la carta?","Fizethetek kártyával?"],["Ecco a Lei.","Tessék, parancsoljon."],["Senza zucchero.","Cukor nélkül."]],
grammar:[["___ un caffè, per favore. (szeretnék)","Vorrei",["Vorrei","Voglio","Volete"]],["Il ___, per favore. (számla)","conto",["conto","costa","caffè"]],["Posso pagare ___ la carta?","con",["con","di","a"]],["Un tè ___ zucchero. (nélkül)","senza",["senza","con","per"]]]},
{t:"La famiglia",hu:"A család",goal:"Bemutatni a családodat birtokos névmásokkal.",
notes:["A birtokos névmás elé névelő kell: <i>il mio libro, la mia casa, i miei amici, le mie amiche</i>.",
"Kivétel: egyes számú rokonnév előtt nincs névelő: <i>mia madre, mio padre, tuo fratello</i>. Többes számban viszont van: <i>i miei genitori</i>. A <i>loro</i> mindig névelővel áll: <i>il loro figlio</i>.",
"Alakok: mio/mia/miei/mie · tuo/tua/tuoi/tue · suo/sua/suoi/sue (övé, Öné) · nostro · vostro · loro."],
words:[["la famiglia","család"],["la madre","anya"],["il padre","apa"],["il fratello","fiútestvér"],["la sorella","lánytestvér"],["il figlio","fia (fiúgyermek)"],["la figlia","lánya"],["il marito","férj"],["la moglie","feleség"],["il nonno","nagypapa"],["la nonna","nagymama"],["i genitori","szülők"],["lo zio","nagybácsi"],["la zia","nagynéni"]],
phrases:[["Questa è mia madre.","Ez az anyám."],["Mio fratello abita a Milano.","A bátyám Milánóban lakik."],["Hai figli?","Vannak gyerekeid?"],["I miei genitori sono in pensione.","A szüleim nyugdíjasok."],["Mia sorella si chiama Giulia.","A húgomat Giuliának hívják."],["La mia famiglia è grande.","A családom nagy."]],
grammar:[["___ madre è italiana.","Mia",["Mia","La mia","Mio"]],["___ genitori abitano a Roma.","I miei",["Miei","I miei","Le mie"]],["Questa è ___ casa. (az én)","la mia",["mia","la mia","il mio"]],["___ fratello (a te)","tuo",["tuo","tua","il tuo"]],["___ figli (az övék)","i loro",["loro","i loro","i suoi"]]]},
{t:"Verbi in -are",hu:"Az -are igék",goal:"Szabályos -are igéket ragozni jelen időben, tagadni.",
notes:["Szabályos -are ige: <b>parl-are</b> → parl<b>o</b>, parl<b>i</b>, parl<b>a</b>, parl<b>iamo</b>, parl<b>ate</b>, parl<b>ano</b>.",
"Az alanyt általában elhagyjuk, hiszen a végződés elárulja: <i>Parlo italiano</i>. Tagadás: <b>non</b> az ige előtt: <i>Non parlo tedesco.</i>",
"Helyesírás: -care/-gare igéknél h kerül i elé, hogy a hang ne változzon: <i>paghi, paghiamo; cerchi</i>. A -ciare/-giare igék nem duplázzák az i-t: <i>mangi, mangiamo</i>. Hangsúly: <i>pàrlano</i>, nem parlàno."],
words:[["parlare","beszélni"],["abitare","lakni"],["lavorare","dolgozni"],["mangiare","enni"],["studiare","tanulni"],["comprare","venni (vásárolni)"],["pagare","fizetni"],["cercare","keresni"],["ascoltare","hallgatni"],["guardare","nézni"],["aspettare","várni"],["arrivare","megérkezni"],["tedesco","német"],["inglese","angol"]],
phrases:[["Parlo un po' di italiano.","Beszélek egy kicsit olaszul."],["Dove abiti?","Hol laksz?"],["Abito a Budapest.","Budapesten lakom."],["Lavoro in un ufficio.","Irodában dolgozom."],["Non mangio carne.","Nem eszem húst."],["Studiamo italiano insieme.","Együtt tanulunk olaszul."],["Può parlare più lentamente?","Tudna lassabban beszélni?"]],
grammar:[["Io ___ italiano. (parlare)","parlo"],["Voi dove ___? (abitare)","abitate"],["Loro ___ a Milano. (lavorare)","lavorano"],["Noi ___ la pizza. (mangiare)","mangiamo"],["Tu ___ il conto? (pagare)","paghi"],["Io ___ parlo tedesco. (tagadás)","non",["non","no","né"]]]},
{t:"Verbi in -ere e -ire",hu:"Az -ere és -ire igék",goal:"Ragozni az -ere és -ire igéket, köztük az -isc- típust.",
notes:["-ere: prend<b>o</b>, prend<b>i</b>, prend<b>e</b>, prend<b>iamo</b>, prend<b>ete</b>, prend<b>ono</b>.",
"-ire: dorm<b>o</b>, dorm<b>i</b>, dorm<b>e</b>, dorm<b>iamo</b>, dorm<b>ite</b>, dorm<b>ono</b>.",
"Sok -ire ige <b>-isc-</b>-et told be (kivéve noi és voi alakban): cap<b>isco</b>, cap<b>isci</b>, cap<b>isce</b>, capiamo, capite, cap<b>iscono</b>. Ilyen a finire, preferire, pulire, spedire. Kiejtés: <i>capisco</i> [kapiszko], de <i>capisci</i> [kapisi]."],
words:[["prendere","venni, fogni (ételt, járművet)"],["vedere","látni"],["scrivere","írni"],["leggere","olvasni"],["credere","hinni"],["vivere","élni"],["dormire","aludni"],["partire","elindulni"],["aprire","kinyitni"],["sentire","hallani, érezni"],["capire","érteni"],["finire","befejezni"],["preferire","jobban szeretni"]],
phrases:[["Non capisco.","Nem értem."],["Prendo un caffè.","Egy kávét kérek."],["Dormi bene?","Jól alszol?"],["Leggo un libro.","Olvasok egy könyvet."],["A che ora parte il treno?","Hánykor indul a vonat?"],["Preferisco il vino rosso.","Jobban szeretem a vörösbort."],["Scrivi in italiano?","Írsz olaszul?"]],
grammar:[["Io non ___. (capire)","capisco"],["Il treno ___ alle otto. (partire)","parte"],["Loro ___ il giornale. (leggere)","leggono"],["Tu ___ il tè o il caffè? (preferire)","preferisci"],["Noi ___ fino alle nove. (dormire)","dormiamo"],["Voi ___ la lezione? (capire)","capite"]]},
{t:"In città",hu:"A városban",goal:"Utat kérdezni, megérteni az útbaigazítást, elmondani, mi hol van.",
notes:["<b>C'è</b> = van (egy dolog), <b>ci sono</b> = vannak (több dolog): <i>C'è un bar. Ci sono due musei.</i>",
"Városnév előtt <b>a</b>: <i>a Roma</i>. Ország, utca, közlekedési eszköz előtt <b>in</b>: <i>in Italia, in via Roma, in treno</i>.",
"Az elöljárók összeolvadnak a névelővel: a + il = <b>al</b>, in + la = <b>nella</b>, di + il = <b>del</b>, su + la = <b>sulla</b>. A teljes táblázat a Nyelvtan oldalon van.",
"Útbaigazítás magázó felszólítással: <i>vada</i> (menjen), <i>giri</i> (forduljon), <i>prenda</i> (vegye/menjen a…)."],
words:[["la stazione","állomás"],["la strada","út, utca"],["la piazza","tér"],["il museo","múzeum"],["la chiesa","templom"],["il negozio","bolt"],["la farmacia","gyógyszertár"],["l'ospedale","kórház"],["la banca","bank"],["il treno","vonat"],["l'autobus","busz"],["la spiaggia","strand"],["a destra","jobbra"],["a sinistra","balra"],["dritto","egyenesen"],["vicino","közel"],["lontano","messze"]],
phrases:[["Scusi, dov'è la stazione?","Elnézést, hol van az állomás?"],["Vada dritto e poi giri a destra.","Menjen egyenesen, aztán forduljon jobbra."],["C'è una farmacia qui vicino?","Van itt a közelben gyógyszertár?"],["Ci sono molti turisti.","Sok turista van."],["È lontano?","Messze van?"],["Vado al museo.","A múzeumba megyek."],["Abito in Italia.","Olaszországban lakom."]],
grammar:[["___ una banca qui vicino?","C'è",["C'è","Ci sono","È"]],["___ due ristoranti in piazza.","Ci sono",["C'è","Ci sono","Sono"]],["Vado ___ museo. (a + il)","al",["al","allo","alla"]],["Abito ___ Roma.","a",["a","in","di"]],["Vado ___ Italia.","in",["in","a","da"]],["Il bar è ___ piazza. (in + la)","nella",["nella","nel","alla"]]]},
{t:"Il tempo e i giorni",hu:"Idő és napok",goal:"Megkérdezni és megmondani, hány óra van, napokról beszélni.",
notes:["<i>Che ore sono?</i> — <b>Sono le</b> tre (3 óra). Kivétel: <b>È l'una</b> (1 óra), <i>è mezzogiorno</i> (dél), <i>è mezzanotte</i>.",
"Perc: <i>e dieci</i> (10 perccel múlt), <i>e un quarto</i> (negyed), <i>e mezza</i> (fél), <i>meno un quarto</i> (háromnegyed): <i>le otto meno un quarto</i> = 7:45. Figyelj: a magyar „fél három” olaszul <i>le due e mezza</i>, vagyis kettő és fél.",
"A napok nevét kisbetűvel írjuk. Névelővel ismétlődést jelent: <i>il sabato</i> = szombatonként."],
words:[["oggi","ma"],["domani","holnap"],["ieri","tegnap"],["adesso","most"],["la mattina","reggel, délelőtt"],["il pomeriggio","délután"],["la sera","este"],["la settimana","hét"],["il mese","hónap"],["lunedì","hétfő"],["martedì","kedd"],["mercoledì","szerda"],["giovedì","csütörtök"],["venerdì","péntek"],["sabato","szombat"],["domenica","vasárnap"]],
phrases:[["Che ore sono?","Hány óra van?"],["Sono le due e mezza.","Fél három van."],["È l'una.","Egy óra van."],["A che ora apre?","Hánykor nyit?"],["Ci vediamo domani.","Holnap találkozunk."],["Oggi è venerdì.","Ma péntek van."],["Il sabato non lavoro.","Szombatonként nem dolgozom."]],
grammar:[["___ le cinque.","Sono",["Sono","È","Ci sono"]],["___ l'una.","È",["È","Sono","Ha"]],["Le otto ___ un quarto (7:45)","meno",["meno","e","più"]],["Hogy van olaszul: holnap?","domani"],["___ sabato vado al mare. (szombatonként)","Il",["Il","La","Lo"]]]},
{t:"Verbi irregolari",hu:"Rendhagyó igék",goal:"A leggyakoribb rendhagyó igéket biztosan használni.",
notes:["<b>andare</b>: vado, vai, va, andiamo, andate, vanno · <b>fare</b>: faccio, fai, fa, facciamo, fate, fanno · <b>venire</b>: vengo, vieni, viene, veniamo, venite, vengono.",
"A <b>volere</b> (akar), <b>potere</b> (tud, -hat/-het), <b>dovere</b> (kell) után főnévi igenév jön: <i>Voglio mangiare. Posso entrare? Devo partire.</i>",
"A fare sok kifejezésben szerepel: <i>fare colazione</i> (reggelizni), <i>fare la spesa</i> (bevásárolni), <i>fa caldo / fa freddo</i> (meleg / hideg van).",
"Két „tudni”: a <b>sapere</b> tudást jelent (<i>So nuotare</i>, tudok úszni), a <b>potere</b> lehetőséget (<i>Oggi non posso</i>, ma nem tudok / nem érek rá)."],
words:[["andare","menni"],["fare","csinálni"],["venire","jönni"],["volere","akarni"],["potere","tudni, -hat/-het"],["dovere","kell"],["stare","lenni, maradni"],["dire","mondani"],["uscire","kimenni"],["sapere","tudni (ismeret)"],["bere","inni"],["dare","adni"]],
phrases:[["Andiamo al mare?","Megyünk a tengerhez?"],["Che cosa fai stasera?","Mit csinálsz ma este?"],["Posso entrare?","Bejöhetek?"],["Devo andare.","Mennem kell."],["Vieni con me?","Jössz velem?"],["Fa caldo oggi.","Meleg van ma."],["Non lo so.","Nem tudom."]],
grammar:[["Io ___ al cinema. (andare)","vado"],["Che cosa ___ voi? (fare)","fate"],["Loro ___ domani. (venire)","vengono"],["Io ___ un gelato. (volere)","voglio"],["Tu ___ venire? (potere)","puoi"],["Noi ___ partire. (dovere)","dobbiamo"],["Lei ___ nuotare? (sapere)","sa"]]},
{t:"Al ristorante",hu:"Az étteremben",goal:"Asztalt foglalni, rendelni, többes számot használni.",
notes:["Többes szám: <b>-o → -i</b> (libro → libri), <b>-a → -e</b> (pizza → pizze), <b>-e → -i</b> (chiave → chiavi). Névelők: <b>i</b> (il helyett), <b>gli</b> (lo és hímnemű l' helyett), <b>le</b> (la és nőnemű l' helyett).",
"Nem változik: ékezetre végződő és rövidített szavak: <i>il caffè → i caffè, la città → le città, la foto → le foto</i>.",
"Az étkezés rendje: <i>antipasto</i> (előétel), <i>primo</i> (tészta, rizottó, leves), <i>secondo</i> (hús vagy hal), <i>contorno</i> (köret, külön kell kérni), <i>dolce</i> (desszert), végül egy caffè."],
words:[["il ristorante","étterem"],["il tavolo","asztal"],["il menù","étlap"],["l'antipasto","előétel"],["il primo","első fogás"],["il secondo","második fogás"],["il contorno","köret"],["il dolce","desszert"],["la carne","hús"],["il pesce","hal"],["la verdura","zöldség"],["il formaggio","sajt"],["il cameriere","pincér"],["prenotare","foglalni"],["buono","jó, finom"]],
phrases:[["Ho prenotato un tavolo per due.","Foglaltam asztalt két főre."],["Che cosa ci consiglia?","Mit ajánl nekünk?"],["Per me un primo.","Nekem egy első fogást."],["Sono vegetariano.","Vegetáriánus vagyok."],["Era tutto buonissimo!","Minden nagyon finom volt!"],["Un'acqua naturale, per favore.","Egy szénsavmentes vizet kérek."],["Possiamo avere il conto?","Kérhetnénk a számlát?"]],
grammar:[["il libro → i ___","libri"],["la pizza → le ___","pizze"],["lo studente → ___ studenti","gli",["gli","i","le"]],["il caffè → i ___","caffè"],["la chiave → le ___","chiavi"],["l'amica → ___ amiche","le",["le","gli","i"]]]},
{t:"Passato prossimo",hu:"Múlt idő",goal:"Elmesélni, mit csináltál tegnap vagy a hétvégén.",
notes:["Múlt idő = <b>avere</b> vagy <b>essere</b> jelen ideje + múlt idejű melléknévi igenév. -are → <b>-ato</b>, -ere → <b>-uto</b>, -ire → <b>-ito</b>: <i>ho mangiato, ho avuto, ho dormito</i>.",
"Mozgást vagy állapotváltozást jelentő igék <b>essere</b>-vel állnak (andare, venire, partire, arrivare, uscire, tornare, essere, stare), és ilyenkor a melléknévi igenév egyezik az alannyal: <i>sono andato</i> (férfi), <i>sono andata</i> (nő), <i>siamo andati</i>.",
"Gyakori rendhagyók: fare → <b>fatto</b>, prendere → <b>preso</b>, vedere → <b>visto</b>, dire → <b>detto</b>, scrivere → <b>scritto</b>, leggere → <b>letto</b>, bere → <b>bevuto</b>, essere/stare → <b>stato</b>."],
words:[["ieri sera","tegnap este"],["la settimana scorsa","múlt héten"],["l'anno scorso","tavaly"],["già","már"],["ancora","még"],["mai","soha, valaha"],["fatto","csinált (fare)"],["preso","vett (prendere)"],["visto","látott (vedere)"],["detto","mondott (dire)"],["stato","volt (essere, stare)"],["andato","ment (andare)"]],
phrases:[["Ieri ho mangiato una pizza.","Tegnap ettem egy pizzát."],["Sono andata a Roma.","Rómába mentem. (nő mondja)"],["Che cosa hai fatto ieri?","Mit csináltál tegnap?"],["Abbiamo visto un film.","Megnéztünk egy filmet."],["Sei mai stato in Italia?","Voltál már Olaszországban?"],["Non ho capito.","Nem értettem."]],
grammar:[["Ieri ___ mangiato la pasta.","ho",["ho","sono","ha"]],["Maria ___ andata a Napoli.","è",["è","ha","sono"]],["Abbiamo ___ un film. (vedere)","visto"],["Che cosa hai ___? (fare)","fatto"],["Loro sono ___ ieri. (partire, hímnem)","partiti"],["Ho ___ una lettera. (scrivere)","scritto"]]}
];

const AVE=["ho","hai","ha","abbiamo","avete","hanno"], ESS=["sono","sei","è","siamo","siete","sono"];
const PRON=["io","tu","lui/lei","noi","voi","loro"];
const VERBS=[
["essere","lenni",ESS,"stato","e",1],["avere","birtokolni, van neki",AVE,"avuto","a",1],
["parlare","beszélni",["parlo","parli","parla","parliamo","parlate","parlano"],"parlato","a",0],
["abitare","lakni",["abito","abiti","abita","abitiamo","abitate","abitano"],"abitato","a",0],
["lavorare","dolgozni",["lavoro","lavori","lavora","lavoriamo","lavorate","lavorano"],"lavorato","a",0],
["mangiare","enni",["mangio","mangi","mangia","mangiamo","mangiate","mangiano"],"mangiato","a",0],
["pagare","fizetni",["pago","paghi","paga","paghiamo","pagate","pagano"],"pagato","a",0],
["arrivare","megérkezni",["arrivo","arrivi","arriva","arriviamo","arrivate","arrivano"],"arrivato","e",0],
["tornare","visszatérni",["torno","torni","torna","torniamo","tornate","tornano"],"tornato","e",0],
["prendere","venni, fogni",["prendo","prendi","prende","prendiamo","prendete","prendono"],"preso","a",0],
["vedere","látni",["vedo","vedi","vede","vediamo","vedete","vedono"],"visto","a",0],
["scrivere","írni",["scrivo","scrivi","scrive","scriviamo","scrivete","scrivono"],"scritto","a",0],
["leggere","olvasni",["leggo","leggi","legge","leggiamo","leggete","leggono"],"letto","a",0],
["dormire","aludni",["dormo","dormi","dorme","dormiamo","dormite","dormono"],"dormito","a",0],
["partire","elindulni",["parto","parti","parte","partiamo","partite","partono"],"partito","e",0],
["capire","érteni",["capisco","capisci","capisce","capiamo","capite","capiscono"],"capito","a",0],
["finire","befejezni",["finisco","finisci","finisce","finiamo","finite","finiscono"],"finito","a",0],
["andare","menni",["vado","vai","va","andiamo","andate","vanno"],"andato","e",1],
["fare","csinálni",["faccio","fai","fa","facciamo","fate","fanno"],"fatto","a",1],
["venire","jönni",["vengo","vieni","viene","veniamo","venite","vengono"],"venuto","e",1],
["volere","akarni",["voglio","vuoi","vuole","vogliamo","volete","vogliono"],"voluto","a",1],
["potere","tudni, -hat/-het",["posso","puoi","può","possiamo","potete","possono"],"potuto","a",1],
["dovere","kell",["devo","devi","deve","dobbiamo","dovete","devono"],"dovuto","a",1],
["stare","lenni, maradni",["sto","stai","sta","stiamo","state","stanno"],"stato","e",1],
["dire","mondani",["dico","dici","dice","diciamo","dite","dicono"],"detto","a",1],
["uscire","kimenni",["esco","esci","esce","usciamo","uscite","escono"],"uscito","e",1],
["sapere","tudni (ismeret)",["so","sai","sa","sappiamo","sapete","sanno"],"saputo","a",1],
["bere","inni",["bevo","bevi","beve","beviamo","bevete","bevono"],"bevuto","a",1],
["dare","adni",["do","dai","dà","diamo","date","danno"],"dato","a",1]
].map(v=>({inf:v[0],hu:v[1],pres:v[2],pp:v[3],aux:v[4],irr:!!v[5]}));

/* noun, hu, def, indef, plural article, plural noun */
const NOUNS=[["libro","könyv","il","un","i","libri"],["studente","diák","lo","uno","gli","studenti"],["zaino","hátizsák","lo","uno","gli","zaini"],["amico","barát","l'","un","gli","amici"],["casa","ház","la","una","le","case"],["amica","barátnő","l'","un'","le","amiche"],["acqua","víz","l'","un'","le","acque"],["giorno","nap","il","un","i","giorni"],["chiave","kulcs","la","una","le","chiavi"],["pesce","hal","il","un","i","pesci"],["notte","éjszaka","la","una","le","notti"],["zio","nagybácsi","lo","uno","gli","zii"],["sport","sport","lo","uno","gli","sport"],["uomo","férfi","l'","un","gli","uomini"],["problema","probléma","il","un","i","problemi"],["mano","kéz","la","una","le","mani"],["foto","fénykép","la","una","le","foto"],["città","város","la","una","le","città"],["caffè","kávé","il","un","i","caffè"],["specchio","tükör","lo","uno","gli","specchi"],["isola","sziget","l'","un'","le","isole"],["orologio","óra (szerkezet)","l'","un","gli","orologi"],["psicologo","pszichológus","lo","uno","gli","psicologi"],["albero","fa","l'","un","gli","alberi"],["ora","óra (idő)","l'","un'","le","ore"],["gnocco","galuska","lo","uno","gli","gnocchi"]];

const PREPS=["di","a","da","in","su"], ARTS=["il","lo","l'","la","i","gli","le"];
const PREP_STEM={di:"de",a:"a",da:"da",in:"ne",su:"su"};
function prepArt(p,a){const s=PREP_STEM[p];return {"il":s+"l","lo":s+"llo","l'":s+"ll'","la":s+"lla","i":s+"i","gli":s+"gli","le":s+"lle"}[a];}
const PREP_SENT=[["Vado ___ cinema.","al","a + il"],["Il libro è ___ tavolo.","sul","su + il"],["Vengo ___ stazione.","dalla","da + la"],["Le chiavi sono ___ borsa.","nella","in + la"],["Il nome ___ ragazzo è Marco.","del","di + il"],["Parlo ___ studenti.","agli","a + gli"],["Torno ___ ufficio alle sei.","dall'","da + l'"],["La casa ___ nonni è grande.","dei","di + i"],["Metto il latte ___ frigo.","nel","in + il"],["Andiamo ___ spiaggia.","alla","a + la"],["Il gatto dorme ___ sedia.","sulla","su + la"],["Il treno arriva ___ aeroporto.","all'","a + l'"],["Il negozio è ___ zio di Marco.","dello","di + lo"],["Le foto sono ___ libri.","nei","in + i"],["Vado ___ amiche di Anna.","dalle","da + le"]];

const SCENARIOS=[
{id:"bar",t:"Al bar",d:"Rendelj reggelit egy római bárban, és fizess.",role:"barista egy forgalmas római bárban, reggel",open:["Buongiorno! Che cosa Le preparo?","Jó reggelt! Mit készíthetek Önnek?"]},
{id:"rist",t:"Al ristorante",d:"Rendelj háromfogásos vacsorát, és kérd a számlát.",role:"pincér egy firenzei trattoriában, vacsoraidőben",open:["Buonasera! Avete prenotato?","Jó estét! Foglaltak asztalt?"]},
{id:"hotel",t:"In albergo",d:"Jelentkezz be a szállodába, és kérdezz a reggeliről.",role:"recepciós egy kis velencei szállodában",open:["Buonasera e benvenuti! Ha una prenotazione?","Jó estét és isten hozta! Van foglalása?"]},
{id:"treno",t:"Alla stazione",d:"Vegyél jegyet Firenzébe, és kérdezd meg, melyik vágányról indul.",role:"jegypénztáros a milánói Centrale pályaudvaron",open:["Buongiorno, dove deve andare?","Jó napot, hova szeretne utazni?"]},
{id:"amici",t:"Fare amicizia",d:"Ismerkedj meg valakivel egy nyelvcserés esten.",role:"Luca, egy barátságos 30 éves bolognai mérnök egy nyelvcserés esten, tegeződik",open:["Ciao! Io sono Luca. E tu come ti chiami?","Szia! Luca vagyok. Téged hogy hívnak?"]},
{id:"farm",t:"In farmacia",d:"Mondd el, hogy fáj a fejed, és kérj valamit rá.",role:"gyógyszerész egy nápolyi patikában",open:["Buongiorno, mi dica.","Jó napot, miben segíthetek?"]},
{id:"libero",t:"Conversazione libera",d:"Kötetlen beszélgetés a tanárral bármiről.",role:"Giulia, egy kedves olasztanár, aki kötetlenül beszélget a tanulóval az életéről, hobbijairól, terveiről",open:["Ciao! Di che cosa vuoi parlare oggi?","Szia! Miről szeretnél ma beszélgetni?"]}
];
const WRITING=["Mutatkozz be: név, kor, honnan jöttél, mivel foglalkozol.","Írd le egy átlagos napodat 5–6 mondatban.","Mit csináltál a múlt hétvégén? (múlt időben)","Írj rövid üzenetet egy külföldi barátodnak, és hívd meg vacsorára.","Mutasd be a családodat.","Milyen a városod? Mi van benne, mit érdemes megnézni?","Írj e-mailt egy hotelnek: foglalj szobát két éjszakára.","Mi a kedvenc ételed, és hogyan készül?","Hova utaznál szívesen, és miért?"];

const DAYS_IT=["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"];
const MONTHS_IT=["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"];

