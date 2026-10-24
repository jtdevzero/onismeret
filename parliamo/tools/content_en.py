"""Angol bővítés: „Haladó angol B2” ág, új történetek és célzott gyakorlók.
Futtatás: python3 parliamo/tools/content_en.py → frissíti a data/en.json-t és a data/stories-en.json-t, megírja a data/drills-en.json-t.
Idempotens: a saját leckéit (en-a*) és történeteit (en-s5…) mindig újraírja, a Viva Voce tartalmához nem nyúl.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

UNITS = [
("a1", "B2", "Phrasal verbs", "Kétszavas igék a mindennapokban", "Egy brit barátoddal a hétvégi terveitekről beszélgettek", [
  ("Mi a phrasal verb?", "Ige + határozószó vagy elöljáró, sokszor egészen új jelentéssel: give up (feladni), look after (vigyázni valakire), turn down (visszautasítani)."),
  ("Szétválasztható vagy sem?", "Sok phrasal verb szétválasztható: turn the music down = turn down the music. Névmással mindig középre kerül: turn it down (nem: turn down it). A look after, run into típusúak nem válnak szét."),
  ("Tanulási tipp", "Mindig mondattal együtt tanuld meg őket, mert az ige és a partikula külön-külön félrevezető: put off = elhalasztani, nem „letenni”."),
], [
  ("to give up", "feladni, abbahagyni"), ("to look after", "vigyázni valakire"), ("to turn down", "visszautasítani; lehalkítani"),
  ("to put off", "elhalasztani"), ("to run out of", "kifogy valamiből"), ("to come up with", "kitalálni (ötletet)"),
  ("to get on with", "jól kijönni valakivel"), ("to look forward to", "várni (örömmel)"), ("to figure out", "rájönni, kitalálni"),
  ("to set up", "létrehozni, beállítani"), ("to catch up", "utolérni; behozni a lemaradást"), ("to show up", "megjelenni, felbukkanni"),
], [
  ("I've finally given up smoking.", "Végre leszoktam a dohányzásról.", ["I have finally given up smoking."]),
  ("Can you look after my cat this weekend?", "Tudnál vigyázni a macskámra a hétvégén?"),
  ("We've run out of milk.", "Kifogytunk a tejből.", ["We have run out of milk."]),
  ("They had to put off the meeting until Friday.", "Péntekre kellett halasztaniuk a megbeszélést."),
  ("I'm really looking forward to seeing you.", "Nagyon várom, hogy lássalak.", ["I am really looking forward to seeing you."]),
  ("She came up with a brilliant idea.", "Kitalált egy zseniális ötletet."),
]),
("a2", "B2", "Wishes and regrets", "Feltételes mondatok és kívánságok", "Egy baráttal arról beszélgettek, mit csinálnátok másképp", [
  ("Második feltételes: elképzelt jelen", "If + múlt idő, would + ige: If I had more time, I would learn to dance. A were minden személyben állhat: If I were you, I'd apply."),
  ("Harmadik feltételes: megbánt múlt", "If + had + 3. alak, would have + 3. alak: If I had known, I would have called you (ha tudtam volna, felhívtalak volna)."),
  ("I wish / If only", "Jelen: I wish I lived by the sea (bárcsak a tengernél laknék). Múlt: I wish I had studied harder (bárcsak jobban tanultam volna). Másra: I wish you would stop (bárcsak abbahagynád)."),
], [
  ("I wish", "bárcsak (én)"), ("if only", "ha legalább, bárcsak"), ("a regret", "megbánás"), ("to regret", "megbánni"),
  ("otherwise", "különben, másképp"), ("in that case", "abban az esetben"), ("unless", "hacsak nem"), ("as long as", "feltéve, hogy"),
  ("I would have", "-tam volna"), ("I'd rather", "inkább (én)"), ("a chance", "esély, lehetőség"), ("by any chance", "véletlenül (kérdésben)"),
], [
  ("If I had more time, I would travel more.", "Ha több időm lenne, többet utaznék.", ["If I had more time, I'd travel more."]),
  ("If I were you, I would take the job.", "A helyedben elvállalnám az állást.", ["If I were you, I'd take the job."]),
  ("If I had known, I would have called you.", "Ha tudtam volna, felhívtalak volna.", ["If I'd known, I'd have called you."]),
  ("I wish I lived closer to the sea.", "Bárcsak közelebb laknék a tengerhez."),
  ("I wish I had studied harder at school.", "Bárcsak jobban tanultam volna az iskolában.", ["I wish I'd studied harder at school."]),
  ("You can come as long as you're on time.", "Jöhetsz, feltéve, hogy pontos vagy.", ["You can come as long as you are on time."]),
]),
("a3", "B2", "In the news", "Szenvedő szerkezet és hírnyelv", "Egy kollégáddal a nap híreit beszélitek meg", [
  ("A szenvedő szerkezet", "be + 3. alak: The bridge was built in 1890. A new law has been passed. Akkor használjuk, ha a cselekvés a fontos, nem az, aki végzi. A végzőt by vezeti be."),
  ("Minden igeidőben", "is made, was made, has been made, will be made, is being made, can be made – a be igét ragozzuk, a 3. alak nem változik."),
  ("Hírnyelv", "It is said that… / He is reported to be… (állítólag). The minister is expected to resign (várhatóan lemond). A hírek címében gyakran jelen idő áll múltra: Storm hits coast."),
], [
  ("the headline", "főcím"), ("an article", "cikk"), ("a journalist", "újságíró"), ("an election", "választás"),
  ("the government", "kormány"), ("to announce", "bejelenteni"), ("to be arrested", "letartóztatják"), ("to be injured", "megsérül"),
  ("according to", "valaki szerint"), ("allegedly", "állítólag"), ("an increase", "növekedés"), ("a decline", "csökkenés, hanyatlás"),
], [
  ("The bridge was built in 1890.", "A hidat 1890-ben építették."), ("A new law has been passed.", "Új törvényt fogadtak el."),
  ("Two people were injured in the accident.", "Két ember megsérült a balesetben."),
  ("The results will be announced tomorrow.", "Az eredményeket holnap hirdetik ki."),
  ("According to the report, prices are rising.", "A jelentés szerint az árak emelkednek."),
  ("The minister is expected to resign.", "A miniszter várhatóan lemond."),
]),
("a4", "B2", "He said that…", "Függő beszéd", "Elmeséled egy barátodnak, mit mondott a főnököd", [
  ("say vagy tell?", "say something (to someone): She said that she was tired. tell someone something: She told me that she was tired. A tell után mindig áll személy."),
  ("Időeltolás", "Múlt idejű bevezető után az ige egy idővel hátrébb lép: \"I'm busy\" → He said he was busy. \"I've finished\" → She said she had finished. will → would, can → could."),
  ("Kérdések és kérések", "He asked me where I lived (nincs fordított szórend, nincs do). She asked if I was coming. Kérés: He told me to wait. She asked me not to call."),
], [
  ("to explain", "elmagyarázni"), ("to admit", "beismerni"), ("to deny", "tagadni"), ("to promise", "megígérni"),
  ("to suggest", "javasolni"), ("to complain", "panaszkodni"), ("to warn", "figyelmeztetni"), ("to remind", "emlékeztetni"),
  ("to claim", "állítani"), ("apparently", "úgy tűnik, állítólag"), ("whether", "vajon, hogy"), ("the day before", "előző nap"),
], [
  ("She said that she was tired.", "Azt mondta, hogy fáradt."), ("He told me he would call later.", "Azt mondta, később hív."),
  ("They asked me where I lived.", "Megkérdezték, hol lakom."), ("My boss asked if I could stay late.", "A főnököm megkérdezte, maradhatnék-e tovább."),
  ("He promised to send the report.", "Megígérte, hogy elküldi a jelentést."),
  ("She suggested going to a different restaurant.", "Azt javasolta, menjünk egy másik étterembe."),
]),
("a5", "B2", "Making a complaint", "Panasz és udvarias kérés", "Panaszt teszel egy hotel recepcióján", [
  ("Udvarias panasz", "Kezdd tompítással: I'm afraid there's a problem with… · I'm sorry to bother you, but… A brit angol sokat tompít, a túl egyenes mondat bántónak hathat."),
  ("Would you mind…?", "Would you mind + -ing: Would you mind changing my room? Igenlő válasz: No, not at all (szó szerint: nem bánom)."),
  ("Mit szeretnél?", "I'd like a refund (visszatérítés), I'd like to speak to the manager. What would you suggest? – Ön mit javasol?"),
], [
  ("a complaint", "panasz"), ("a refund", "visszatérítés"), ("to replace", "kicserélni"), ("faulty", "hibás"),
  ("disappointed", "csalódott"), ("unacceptable", "elfogadhatatlan"), ("the manager", "vezető, igazgató"), ("a receipt", "blokk, nyugta"),
  ("to sort out", "elintézni, megoldani"), ("to bother", "zavarni"), ("an apology", "bocsánatkérés"), ("compensation", "kártérítés"),
], [
  ("I'm afraid there's a problem with my room.", "Sajnos gond van a szobámmal.", ["I am afraid there is a problem with my room."]),
  ("Would you mind changing it for me?", "Kicserélné nekem?"),
  ("I'd like a refund, please.", "Szeretném visszakapni a pénzem.", ["I would like a refund, please."]),
  ("The heating doesn't work.", "Nem működik a fűtés.", ["The heating does not work."]),
  ("I'm sorry to bother you, but it's quite urgent.", "Elnézést a zavarásért, de elég sürgős.", ["I am sorry to bother you, but it is quite urgent."]),
  ("Could you sort it out as soon as possible?", "El tudná intézni minél hamarabb?"),
]),
("a6", "B2", "Used to", "Szokások régen és most", "Régi barátokkal emlékeztek a diákéveitekre", [
  ("used to = régen (de már nem)", "I used to live in Szeged (régen Szegeden laktam). Kérdés és tagadás: Did you use to…? I didn't use to like coffee."),
  ("be/get used to = hozzászokni", "I'm used to getting up early (hozzá vagyok szokva). I'm getting used to the weather (szokom). Utána -ing vagy főnév jön."),
  ("would = ismétlődő múlt", "Every summer we would go to the lake. Csak cselekvésre, állapotra nem: We used to have a dog (nem: would have)."),
], [
  ("used to", "régen (szokás)"), ("to get used to", "hozzászokni"), ("to be used to", "hozzá van szokva"), ("nowadays", "manapság"),
  ("these days", "mostanában"), ("a habit", "szokás"), ("to grow up", "felnőni"), ("childhood", "gyerekkor"),
  ("to miss", "hiányozni valami; lekésni"), ("to remember", "emlékezni"), ("to keep in touch", "tartani a kapcsolatot"), ("anymore", "már nem"),
], [
  ("I used to live in a small village.", "Régen egy kis faluban laktam."), ("I didn't use to like coffee.", "Régen nem szerettem a kávét.", ["I did not use to like coffee."]),
  ("I'm used to getting up early.", "Hozzá vagyok szokva a korai keléshez.", ["I am used to getting up early."]),
  ("I'm still getting used to the weather.", "Még szokom az időjárást.", ["I am still getting used to the weather."]),
  ("Every summer we would go to the lake.", "Minden nyáron lementünk a tóhoz."), ("We don't keep in touch anymore.", "Már nem tartjuk a kapcsolatot.", ["We do not keep in touch anymore."]),
]),
("a7", "B2", "Healthy habits", "Tanács és kötelesség (módbeli igék)", "Egy edzővel az egészséges életmódodról beszélgetsz", [
  ("Tanács", "should / ought to: You should drink more water. You ought to see a doctor. Erősebb: You'd better rest (jobban teszed, ha pihensz)."),
  ("Kötelesség", "must: belső kötelesség, szabály (I must call my mum). have to: külső kényszer (I have to work on Saturday). Múltban mindkettő: had to."),
  ("Nem kell – nem szabad", "don't have to / needn't = nem kell (You don't have to come). mustn't = nem szabad (You mustn't smoke here). Ez gyakori hiba!"),
], [
  ("should", "kellene (tanács)"), ("ought to", "kellene, illene"), ("had better", "jobban teszi, ha"), ("must", "kell, muszáj"),
  ("have to", "kell (kényszer)"), ("mustn't", "nem szabad"), ("don't have to", "nem kell"), ("a diet", "étrend, diéta"),
  ("to exercise", "edzeni, mozogni"), ("to cut down on", "csökkenteni (fogyasztást)"), ("stress", "stressz"), ("to recover", "felépülni"),
], [
  ("You should drink more water.", "Több vizet kellene innod."), ("You'd better get some rest.", "Jobban teszed, ha pihensz egy kicsit.", ["You had better get some rest."]),
  ("I have to work on Saturday.", "Szombaton dolgoznom kell."), ("You don't have to come if you're busy.", "Nem kell jönnöd, ha elfoglalt vagy.", ["You do not have to come if you are busy."]),
  ("You mustn't smoke in here.", "Itt bent nem szabad dohányozni.", ["You must not smoke in here."]),
  ("I'm trying to cut down on sugar.", "Próbálom csökkenteni a cukrot.", ["I am trying to cut down on sugar."]),
]),
("a8", "B2", "For and against", "Érvelés és kötőszavak", "Egy vitában érvelsz a home office mellett és ellen", [
  ("Ellentét", "although / even though + mondat: Although it was late, we kept working. despite / in spite of + főnév vagy -ing: Despite the rain, we went out. however: mondat elején, vessző után."),
  ("Kiegészítés és következmény", "moreover, in addition, what's more (ráadásul) · therefore, as a result (ezért, emiatt)."),
  ("Lágyítás", "I tend to think… · It seems to me that… · I see your point, but… A brit vitakultúrában a lágyítás udvariasság, nem bizonytalanság."),
], [
  ("although", "habár"), ("however", "azonban"), ("despite", "ellenére"), ("whereas", "míg, ezzel szemben"),
  ("moreover", "ráadásul"), ("therefore", "ezért"), ("on the other hand", "másrészt"), ("an advantage", "előny"),
  ("a drawback", "hátrány"), ("to argue", "érvelni; vitatkozni"), ("to tend to", "hajlamos valamire"), ("I see your point", "értem, mire gondolsz"),
], [
  ("Although it was late, we kept working.", "Bár késő volt, tovább dolgoztunk."), ("Despite the rain, we went for a walk.", "Az eső ellenére elmentünk sétálni."),
  ("Working from home saves time. However, it can be lonely.", "Az otthoni munka időt spórol. Ugyanakkor magányos is lehet."),
  ("I see your point, but I don't agree.", "Értem, mire gondolsz, de nem értek egyet.", ["I see your point, but I do not agree."]),
  ("It seems to me that we need more time.", "Nekem úgy tűnik, több időre van szükségünk."),
  ("Prices went up; therefore, sales fell.", "Az árak emelkedtek, ezért az eladások csökkentek."),
]),
]

STORIES = [
("s5", "A2", "en-u10", "A weekend in Edinburgh", "Egy hétvége Edinburgh-ban", {"N": ("Narrator", "f"), "T": ("Tom", "m"), "K": ("Kate", "f")}, [
  ("N", "It's Monday morning. Tom and Kate are having coffee at work.", "Hétfő reggel van. Tom és Kate kávéznak a munkahelyen."),
  ("K", "Hi Tom! How was your weekend?", "Szia Tom! Milyen volt a hétvégéd?"),
  ("T", "Great, thanks. I went to Edinburgh with my brother.", "Remek, köszi. Edinburgh-ba mentem a bátyámmal."),
  ("K", "Lucky you! What did you do there?", "Szerencsés! Mit csináltatok ott?"),
  ("T", "We visited the castle and walked up Arthur's Seat.", "Megnéztük a várat, és felmásztunk az Arthur's Seatre."),
  ("Q", "Kivel utazott Tom Edinburgh-ba?", ["A testvérével", "Kate-tel", "Egyedül"], 0),
  ("K", "Was the weather good?", "Jó volt az idő?"),
  ("T", "Not really. It rained all day on Saturday.", "Nem igazán. Szombaton egész nap esett."),
  ("K", "Typical Scotland! Did you try haggis?", "Tipikus Skócia! Megkóstoltad a haggist?"),
  ("T", "Yes, I did. It was actually really good.", "Igen. Igazából nagyon finom volt."),
  ("Q", "Milyen volt az idő szombaton?", ["Egész nap esett", "Napos volt", "Havazott"], 0),
  ("N", "Kate decides to visit Edinburgh in the summer.", "Kate elhatározza, hogy nyáron ellátogat Edinburgh-ba."),
]),
("s6", "B1", "en-u11", "The job offer", "Az állásajánlat", {"N": ("Narrator", "f"), "M": ("Mia", "f"), "D": ("Dad", "m")}, [
  ("N", "Mia calls her dad on Sunday evening.", "Mia vasárnap este felhívja az apját."),
  ("M", "Dad, I've got some news. I've been offered a job in Manchester!", "Apa, hírem van. Állást ajánlottak Manchesterben!"),
  ("D", "That's fantastic! Have you accepted it yet?", "Ez fantasztikus! Elfogadtad már?"),
  ("M", "Not yet. I've never lived outside London.", "Még nem. Sosem éltem Londonon kívül."),
  ("D", "Have you been to Manchester before?", "Jártál már Manchesterben?"),
  ("M", "Only once, for the interview. It seemed really friendly.", "Csak egyszer, az interjún. Nagyon barátságosnak tűnt."),
  ("Q", "Hányszor járt Mia Manchesterben?", ["Egyszer, az interjún", "Még soha", "Sokszor"], 0),
  ("D", "And the salary?", "És a fizetés?"),
  ("M", "It's higher, and the rent is much cheaper than here.", "Magasabb, és a lakbér sokkal olcsóbb, mint itt."),
  ("D", "Then what's stopping you?", "Akkor mi tart vissza?"),
  ("M", "I'll miss my friends. But I think I'm going to say yes.", "Hiányozni fognak a barátaim. De azt hiszem, igent mondok."),
  ("Q", "Mi tartja vissza Miát?", ["Hiányoznak majd a barátai", "Alacsony a fizetés", "Drága a lakbér"], 0),
  ("N", "The next morning, Mia accepts the offer.", "Másnap reggel Mia elfogadja az ajánlatot."),
]),
("s7", "B2", "en-a5", "Room 214", "A 214-es szoba", {"N": ("Narrator", "f"), "G": ("Guest", "m"), "R": ("Receptionist", "f")}, [
  ("N", "It's late at night in a hotel in Brighton.", "Késő este van egy brightoni hotelben."),
  ("G", "Good evening. I'm sorry to bother you, but I'm afraid there's a problem with my room.", "Jó estét. Elnézést a zavarásért, de sajnos gond van a szobámmal."),
  ("R", "I'm sorry to hear that. What seems to be the problem?", "Sajnálattal hallom. Mi a probléma?"),
  ("G", "The heating doesn't work, and it's freezing in there.", "Nem működik a fűtés, és bent fagyos hideg van."),
  ("R", "I do apologise. I'll send someone up straight away.", "Elnézést kérek. Azonnal felküldök valakit."),
  ("Q", "Mi a gond a szobával?", ["Nem működik a fűtés", "Zajos a szomszéd", "Piszkos a fürdő"], 0),
  ("G", "Would you mind moving me to another room instead? It's almost midnight.", "Áttenne inkább egy másik szobába? Mindjárt éjfél van."),
  ("R", "Not at all. Let me check. We have a sea-view room on the third floor.", "Egyáltalán nem bánom. Megnézem. Van egy tengerre néző szobánk a harmadikon."),
  ("G", "That would be perfect, thank you.", "Az tökéletes lenne, köszönöm."),
  ("R", "And breakfast is on us tomorrow, to make up for the trouble.", "A holnapi reggeli pedig a mi vendégünk, kárpótlásul."),
  ("Q", "Mivel kárpótolja a hotel a vendéget?", ["Ingyenes reggelivel és jobb szobával", "Pénzvisszatérítéssel", "Ingyen éjszakával"], 0),
  ("N", "The guest falls asleep listening to the sea.", "A vendég a tenger hangjára alszik el."),
]),
("s8", "B2", "en-a2", "If only", "Bárcsak", {"N": ("Narrator", "f"), "L": ("Leo", "m"), "S": ("Sara", "f")}, [
  ("N", "Leo and Sara are waiting at the airport. Their flight has been cancelled.", "Leo és Sara a reptéren várnak. Törölték a járatukat."),
  ("L", "I wish we had taken the earlier flight.", "Bárcsak a korábbi járattal mentünk volna."),
  ("S", "If we had left at six, we would be in Rome by now.", "Ha hatkor indultunk volna, már Rómában lennénk."),
  ("L", "Well, there's nothing we can do about it now.", "Hát, most már nem tehetünk semmit."),
  ("Q", "Miért várnak a reptéren?", ["Törölték a járatukat", "Korán érkeztek", "Lekésték a vonatot"], 0),
  ("S", "If I were you, I'd ask about compensation.", "A helyedben rákérdeznék a kártérítésre."),
  ("L", "Good idea. Apparently, we're entitled to a refund or a new flight.", "Jó ötlet. Úgy tűnik, jár nekünk visszatérítés vagy új járat."),
  ("S", "As long as we get there by tomorrow, I don't mind.", "Amíg holnapra odaérünk, nem bánom."),
  ("L", "Look on the bright side: we've got time for a proper dinner.", "Nézd a jó oldalát: van időnk egy rendes vacsorára."),
  ("Q", "Mit javasol Sara?", ["Kérdezzen rá a kártérítésre", "Menjenek haza", "Béreljenek autót"], 0),
  ("N", "Two hours later, they are booked on the first flight in the morning.", "Két órával később már a reggeli első járatra van jegyük."),
]),
]

# Célzott gyakorlók: (mondat ___-sal, helyes, [lehetőségek], magyarázat)
DRILLS = {
"tenses": ("Igeidők", "Present simple vagy continuous, past simple vagy present perfect, will vagy going to – mondatokban.", [
  ("I ___ in London since 2019.", "have lived", ["have lived", "lived", "am living"], "Since + kezdőpont, ami ma is tart: present perfect."),
  ("She usually ___ to work by bus.", "goes", ["goes", "is going", "went"], "Szokás, ismétlődő cselekvés: present simple."),
  ("Look! It ___.", "is raining", ["is raining", "rains", "rained"], "Most, a beszéd pillanatában zajlik: present continuous."),
  ("We ___ the film last night.", "saw", ["saw", "have seen", "see"], "Lezárt múltbeli időpont (last night): past simple."),
  ("I ___ never ___ sushi.", "have / eaten", ["have / eaten", "did / eat", "am / eating"], "Élettapasztalat konkrét időpont nélkül: present perfect."),
  ("While I ___ dinner, the phone rang.", "was cooking", ["was cooking", "cooked", "have cooked"], "Hosszabb háttércselekvés, amit egy rövid megszakít: past continuous."),
  ("Don't worry, I ___ you with your bags.", "'ll help", ["'ll help", "'m helping", "help"], "Hirtelen ajánlat, döntés a beszéd pillanatában: will."),
  ("Look at those clouds. It ___ rain.", "is going to", ["is going to", "will", "rains"], "Jelenlegi jelekből következő jóslat: going to."),
  ("By the time we arrived, the film ___.", "had started", ["had started", "started", "has started"], "Egy múltbeli pont előtt már megtörtént: past perfect."),
  ("How long ___ you ___ English?", "have / been learning", ["have / been learning", "do / learn", "did / learn"], "Mióta tart és még most is tart: present perfect continuous."),
  ("I ___ my keys. I can't find them anywhere.", "have lost", ["have lost", "lost", "lose"], "Múltbeli esemény, aminek most is látszik a következménye: present perfect."),
  ("This time tomorrow I ___ on a beach.", "'ll be lying", ["'ll be lying", "lie", "'m lying"], "Egy jövőbeli pillanatban éppen zajló cselekvés: future continuous."),
  ("He ___ to the gym three times a week.", "goes", ["goes", "is going", "has gone"], "Gyakoriság (three times a week): present simple."),
  ("I ___ my homework yet.", "haven't finished", ["haven't finished", "didn't finish", "don't finish"], "A yet a present perfecttel jár tagadásban és kérdésben."),
  ("When I was a child, I ___ in a small town.", "lived", ["lived", "have lived", "was living"], "Lezárt múltbeli időszak: past simple."),
  ("What ___ you ___ this weekend?", "are / doing", ["are / doing", "do / do", "did / do"], "Megbeszélt, közeli jövőbeli program: present continuous."),
]),
"articles": ("Névelők", "a, an, the vagy semmi – ahol a magyar mást használ.", [
  ("She's ___ engineer.", "an", ["an", "a", "the"], "Foglalkozás előtt határozatlan névelő kell; magánhangzó-hang előtt an."),
  ("I'd like ___ coffee, please.", "a", ["a", "the", "–"], "Egy adag, ami még nem ismert: a."),
  ("___ Danube flows through Budapest.", "The", ["The", "A", "–"], "Folyók neve előtt the áll."),
  ("I love ___ music.", "–", ["–", "the", "a"], "Általánosságban vett megszámlálhatatlan főnév: nincs névelő."),
  ("Can you close ___ window, please?", "the", ["the", "a", "–"], "Mindketten tudjuk, melyik ablakról van szó: the."),
  ("It takes ___ hour to get there.", "an", ["an", "a", "the"], "Az hour h-ja néma, magánhangzó-hanggal kezdődik: an."),
  ("She goes to ___ work by bike.", "–", ["–", "the", "a"], "Go to work, go to school, go to bed: nincs névelő."),
  ("He plays ___ guitar in a band.", "the", ["the", "a", "–"], "Hangszer előtt (play the piano) the áll."),
  ("We stayed in ___ Hungary for a week.", "–", ["–", "the", "a"], "Országnév előtt általában nincs névelő (kivétel: the UK, the USA)."),
  ("This is ___ best day of my life.", "the", ["the", "a", "–"], "Felsőfok előtt mindig the."),
  ("I'm going to buy ___ new car.", "a", ["a", "the", "an"], "Egy (bármelyik) új autó: a; mássalhangzó-hang előtt a."),
  ("___ life is short.", "–", ["–", "The", "A"], "Általános, elvont főnév: nincs névelő."),
]),
"preps": ("Elöljárók", "in, on, at, for, since és társaik – időre és helyre.", [
  ("The meeting is ___ Monday.", "on", ["on", "in", "at"], "Napok és dátumok előtt on."),
  ("I was born ___ 1990.", "in", ["in", "on", "at"], "Évek, hónapok, évszakok előtt in."),
  ("See you ___ 7 o'clock.", "at", ["at", "on", "in"], "Pontos időpont előtt at."),
  ("She's lived here ___ ten years.", "for", ["for", "since", "from"], "Időtartam (ten years): for."),
  ("I've known him ___ 2015.", "since", ["since", "for", "from"], "Kezdőpont (2015): since."),
  ("The keys are ___ the table.", "on", ["on", "in", "at"], "Felületen: on."),
  ("He's waiting ___ the bus stop.", "at", ["at", "on", "in"], "Pontszerű hely, találkozási pont: at."),
  ("I'm good ___ maths.", "at", ["at", "in", "on"], "be good at: jó valamiben."),
  ("It depends ___ the weather.", "on", ["on", "of", "from"], "depend on: függ valamitől."),
  ("I'm interested ___ photography.", "in", ["in", "on", "about"], "interested in: érdeklődik valami iránt."),
  ("We arrived ___ London late at night.", "in", ["in", "at", "to"], "Arrive in + város/ország, arrive at + épület; arrive to nem helyes."),
  ("She's afraid ___ spiders.", "of", ["of", "from", "about"], "afraid of: fél valamitől (a magyar -tól/-től ellenére of)."),
]),
"phrasal": ("Phrasal verbs", "Kétszavas igék jelentése – a leggyakoribbak.", [
  ("I've decided to ___ smoking.", "give up", ["give up", "give in", "give out"], "give up: feladni, leszokni valamiről."),
  ("Can you ___ my dog while I'm away?", "look after", ["look after", "look for", "look up"], "look after: vigyázni valakire."),
  ("We've ___ milk. Can you buy some?", "run out of", ["run out of", "run into", "run over"], "run out of: kifogy valamiből."),
  ("The concert was ___ because of the storm.", "called off", ["called off", "called up", "called back"], "call off: lefújni, lemondani."),
  ("I'm ___ the holidays.", "looking forward to", ["looking forward to", "looking up to", "looking into"], "look forward to + -ing/főnév: örömmel várni."),
  ("Could you ___ the music? It's too loud.", "turn down", ["turn down", "turn up", "turn off"], "turn down: lehalkítani (turn up: felhangosítani)."),
  ("She ___ a great solution.", "came up with", ["came up with", "came across", "came down with"], "come up with: kitalálni (ötletet, megoldást)."),
  ("I ___ an old friend in town yesterday.", "ran into", ["ran into", "ran out of", "ran away"], "run into: véletlenül összefutni valakivel."),
  ("Let's ___ the meeting until next week.", "put off", ["put off", "put on", "put up with"], "put off: elhalasztani."),
  ("I can't ___ this noise any longer.", "put up with", ["put up with", "put off", "put down"], "put up with: eltűrni valamit."),
  ("Please ___ the form and sign it.", "fill in", ["fill in", "fill up", "fill out of"], "fill in (brit) / fill out (amerikai): kitölteni."),
  ("Do you ___ your colleagues?", "get on with", ["get on with", "get over", "get by"], "get on with: jól kijönni valakivel."),
]),
"cond": ("Feltételes mondatok", "Zero, first, second és third conditional – melyik igealak kell?", [
  ("If it rains, we ___ at home.", "'ll stay", ["'ll stay", "would stay", "stayed"], "Valós jövőbeli feltétel (first): if + jelen, will."),
  ("If I ___ rich, I would buy a boat.", "were", ["were", "am", "will be"], "Elképzelt jelen (second): if + múlt; a were minden személyben jó."),
  ("If you heat ice, it ___.", "melts", ["melts", "will melt", "would melt"], "Általános igazság (zero): if + jelen, jelen."),
  ("If I had known, I ___ you.", "would have told", ["would have told", "would tell", "told"], "Megbánt múlt (third): would have + 3. alak."),
  ("I ___ you if I had your number.", "would call", ["would call", "will call", "called"], "Second conditional: would + ige."),
  ("If she ___ harder, she would have passed.", "had studied", ["had studied", "studied", "would study"], "Third conditional: if + had + 3. alak."),
  ("Unless you hurry, you ___ the train.", "'ll miss", ["'ll miss", "miss", "would have missed"], "unless = if not; first conditional."),
  ("I wish I ___ more free time.", "had", ["had", "have", "will have"], "I wish + múlt idő: jelenbeli kívánság."),
  ("I wish I ___ to the party last night.", "had gone", ["had gone", "went", "would go"], "I wish + past perfect: múltbeli megbánás."),
  ("If I were you, I ___ the job.", "would take", ["would take", "will take", "take"], "Tanács: If I were you, I would…"),
]),
}


def main():
    pack = json.loads((ROOT / "data" / "en.json").read_text(encoding="utf-8"))
    pack["units"] = [u for u in pack["units"] if not u["id"].startswith("en-a")]
    tracks = pack.get("tracks", {})
    pack["tracks"] = {"gen": tracks.get("gen", "Általános angol A1–B1"), "adv": "Haladó angol B2", "biz": tracks.get("biz", "Üzleti angol B2–C1")}
    new = []
    for uid, lvl, title, hu, role, gram, words, sents in UNITS:
        items = []
        for k, lst in (("w", words), ("s", sents)):
            for i, t in enumerate(lst, 1):
                it = {"id": f"en-{uid}-{k}{i}", "k": k, "it": t[0], "hu": t[1]}
                if len(t) > 2:
                    it["alt"] = t[2]
                items.append(it)
        new.append({"id": f"en-{uid}", "title": title, "hu": hu, "level": lvl, "track": "adv", "role": role,
                    "grammar": [{"h": h, "p": p} for h, p in gram], "items": items})
    gen = [u for u in pack["units"] if u.get("track") == "gen"]
    biz = [u for u in pack["units"] if u.get("track") != "gen"]
    pack["units"] = gen + new + biz
    (ROOT / "data" / "en.json").write_text(json.dumps(pack, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    st = json.loads((ROOT / "data" / "stories-en.json").read_text(encoding="utf-8"))
    keep = {f"en-{s[0]}" for s in STORIES}
    st["stories"] = [s for s in st["stories"] if s["id"] not in keep]
    for sid, lvl, unlock, title, hu, cast, lines in STORIES:
        out = [{"q": l[1], "o": l[2], "a": l[3]} if l[0] == "Q" else {"s": l[0], "it": l[1], "hu": l[2]} for l in lines]
        st["stories"].append({"id": f"en-{sid}", "level": lvl, "unlock": unlock, "img": unlock, "title": title, "hu": hu,
                              "cast": {k: {"name": n, "g": g} for k, (n, g) in cast.items()}, "lines": out})
    order = {"A1": 0, "A2": 1, "B1": 2, "B2": 3, "C1": 4}
    st["stories"].sort(key=lambda s: (order.get(s["level"], 9), s["id"]))
    (ROOT / "data" / "stories-en.json").write_text(json.dumps(st, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    drills = {k: {"title": t, "desc": d, "items": [{"q": q, "a": a, "o": o, "why": w} for q, a, o, w in items]} for k, (t, d, items) in DRILLS.items()}
    (ROOT / "data" / "drills-en.json").write_text(json.dumps(drills, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"angol: {len(pack['units'])} lecke ({len(new)} új), {len(st['stories'])} történet, {sum(len(v['items']) for v in drills.values())} gyakorlóelem")


if __name__ == "__main__":
    main()
