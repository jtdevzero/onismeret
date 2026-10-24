"""Angol, harmadik kör: C1 ág, podcast-epizódok, kiejtésgyakorló magyaroknak, vizsgafeladatok.
Futtatás: python3 parliamo/tools/content_en2.py → data/en.json (C1 leckék), data/podcasts-en.json, data/pron-en.json, data/exam-en.json.
Idempotens: a saját elemeit (en-c*) mindig újraírja.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

C1 = [
("c1", "C1", "Hedging and nuance", "Óvatos fogalmazás és árnyalás", "Egy megbeszélésen kényes témáról mondasz véleményt", [
  ("Miért tompítunk?", "Az angol, főleg a brit, ritkán fogalmaz kategorikusan. A tompítás udvarias és szakmai: It seems that…, It could be argued that…, There's a chance that…"),
  ("Tompító eszközök", "Módbeli igék (may, might, could), határozók (arguably, presumably, to some extent), és bevezetők (I'd suggest that…, It's not entirely clear whether…)."),
  ("Erősítés, ha kell", "Ha határozott akarsz lenni: There's no doubt that…, Clearly…, It's undeniable that… Ne keverd egy mondaton belül a tompítással."),
], [
  ("arguably", "vitathatóan, mondhatni"), ("presumably", "feltehetően"), ("to some extent", "bizonyos mértékig"), ("by and large", "nagyjából, összességében"),
  ("it's worth noting", "érdemes megjegyezni"), ("tentative", "óvatos, ideiglenes"), ("a grey area", "szürke zóna"), ("to downplay", "lekicsinyelni, bagatellizálni"),
  ("to overstate", "túlozni"), ("conceivably", "elképzelhetően"), ("on balance", "mindent egybevetve"), ("to a large degree", "nagymértékben"),
], [
  ("It could be argued that the plan is too ambitious.", "Mondhatni, hogy a terv túl ambiciózus."),
  ("The results are, by and large, encouraging.", "Az eredmények összességében biztatóak."),
  ("I'd suggest that we wait a little longer.", "Azt javasolnám, várjunk még egy kicsit.", ["I would suggest that we wait a little longer."]),
  ("It's not entirely clear whether it will work.", "Nem egészen világos, hogy működni fog-e.", ["It is not entirely clear whether it will work."]),
  ("On balance, I think it's the right decision.", "Mindent egybevetve szerintem ez a helyes döntés.", ["On balance, I think it is the right decision."]),
  ("To some extent, they have a point.", "Bizonyos mértékig igazuk van."),
]),
("c2", "C1", "Idioms that natives use", "Idiómák, amiket tényleg használnak", "Kollégákkal kötetlenül beszélgettek egy projekt állásáról", [
  ("Idiómák a munkában", "be on the same page (egyetérteni, egy hullámhosszon lenni), cut corners (spórolni a minőség rovására), the ball is in your court (rajtad a sor)."),
  ("Ne fordítsd szó szerint", "Az idióma jelentése nem jön ki a szavakból: a piece of cake = gyerekjáték, nem egy szelet torta. Ezért mondattal együtt tanuld."),
  ("Mértékkel", "Egy-két idióma természetes, túl sok erőltetettnek hat. Írásban, hivatalos szövegben kerüld őket."),
], [
  ("on the same page", "egy hullámhosszon"), ("to cut corners", "a minőség rovására spórolni"), ("the ball is in your court", "rajtad a sor"),
  ("a piece of cake", "gyerekjáték"), ("to call it a day", "befejezni mára"), ("to get the hang of", "belejönni valamibe"),
  ("to hit the nail on the head", "fején találni a szöget"), ("under the weather", "kissé beteg, gyengélkedő"), ("to beat around the bush", "kerülgetni a forró kását"),
  ("to go the extra mile", "többet tenni a vártnál"), ("in hot water", "bajban"), ("back to square one", "vissza a kiindulóponthoz"),
], [
  ("Let's make sure we're all on the same page.", "Győződjünk meg róla, hogy mindannyian egyetértünk.", ["Let us make sure we are all on the same page."]),
  ("We can't afford to cut corners on safety.", "A biztonságon nem spórolhatunk.", ["We cannot afford to cut corners on safety."]),
  ("I've made my offer; the ball is in your court.", "Megtettem az ajánlatomat, most rajtad a sor.", ["I have made my offer; the ball is in your court."]),
  ("It took me a while to get the hang of it.", "Eltartott egy ideig, mire belejöttem."),
  ("Stop beating around the bush and tell me.", "Ne kerülgesd a forró kását, mondd már."),
  ("The client rejected it, so we're back to square one.", "Az ügyfél elutasította, úgyhogy kezdhetjük elölről.", ["The client rejected it, so we are back to square one."]),
]),
("c3", "C1", "Formal and informal", "Hivatalos és közvetlen regiszter", "Ugyanazt a hírt megírod a főnöködnek és egy barátodnak is", [
  ("Szóválasztás", "Hivatalos szövegben latin eredetű ige: obtain (get), require (need), commence (start), inform (tell). Közvetlenben phrasal verb: find out, set up, get back to."),
  ("Szerkezetek", "Hivatalos: I would be grateful if you could… / Please do not hesitate to contact me. Közvetlen: Could you…? / Just let me know."),
  ("Összevonások", "Hivatalos írásban kerüld: I am, do not, it is. Beszédben és baráti üzenetben természetes: I'm, don't, it's."),
], [
  ("to obtain", "megszerezni (hivatalos)"), ("to require", "igényelni, szükséges (hivatalos)"), ("to commence", "megkezdeni (hivatalos)"),
  ("to inform", "tájékoztatni"), ("regarding", "ami illeti, -val kapcsolatban"), ("furthermore", "továbbá"), ("to enquire", "érdeklődni"),
  ("to assist", "segíteni (hivatalos)"), ("to get back to", "visszajelezni valakinek"), ("to sort out", "elintézni"),
  ("prior to", "előtt (hivatalos)"), ("to be grateful", "hálásnak lenni"),
], [
  ("I would be grateful if you could send me the details.", "Hálás lennék, ha elküldené a részleteket."),
  ("Please do not hesitate to contact me.", "Kérem, forduljon hozzám bizalommal."),
  ("Could you just send me the details?", "Elküldenéd a részleteket?"),
  ("I'm writing to enquire about the position.", "Az állással kapcsolatban érdeklődöm.", ["I am writing to enquire about the position."]),
  ("I'll get back to you by Friday.", "Péntekig visszajelzek.", ["I will get back to you by Friday."]),
  ("Prior to the meeting, please read the report.", "A megbeszélés előtt kérjük, olvassa el a jelentést."),
]),
("c4", "C1", "Never have I…", "Inverzió és nyomatékosítás", "Beszédet mondasz egy céges ünnepségen", [
  ("Inverzió tagadó határozó után", "Nyomatékos, irodalmias: Never have I seen such a mess. Rarely do we get this chance. Not only did she win, but she also broke the record."),
  ("Feltételes inverzió", "Had I known, I would have come (= If I had known). Should you need help, call me (= If you need help). Were it not for you, … (= If it weren't for you)."),
  ("Nyomatékos do", "Állító mondatban is: I do understand your concern. She did call, but you were out."),
], [
  ("never have I", "még soha nem…"), ("rarely", "ritkán"), ("not only… but also", "nemcsak… hanem… is"), ("no sooner… than", "alighogy… máris"),
  ("hardly… when", "alig… amikor"), ("under no circumstances", "semmilyen körülmények között"), ("should you need", "ha szükséged lenne"),
  ("had I known", "ha tudtam volna"), ("little did I know", "akkor még nem is sejtettem"), ("only then", "csak akkor"),
  ("by no means", "korántsem"), ("in no way", "semmiképp"),
], [
  ("Never have I seen such a beautiful view.", "Még soha nem láttam ilyen gyönyörű kilátást."),
  ("Not only did she win, but she also broke the record.", "Nemcsak nyert, hanem rekordot is döntött."),
  ("Had I known, I would have come earlier.", "Ha tudtam volna, korábban jöttem volna."),
  ("Should you need any help, just call me.", "Ha bármiben segítség kell, csak hívj."),
  ("Little did I know that my life was about to change.", "Akkor még nem is sejtettem, hogy megváltozik az életem."),
  ("I do understand your concern.", "Tényleg értem az aggodalmadat."),
]),
("c5", "C1", "Collocations", "Kollokációk: amik együtt járnak", "Egy prezentáción a cég eredményeiről beszélsz", [
  ("Mi a kollokáció?", "Szavak, amelyek természetesen együtt állnak: make a decision (nem do a decision), heavy rain (nem strong rain), take a risk."),
  ("make vagy do?", "make: létrehozás, döntés (make a mistake, make progress, make an effort). do: tevékenység, munka (do research, do business, do someone a favour)."),
  ("Erős melléknevek", "highly unlikely, deeply concerned, bitterly disappointed, fully aware, widely regarded – ezek a C1-es szöveg ismertetőjelei."),
], [
  ("to make progress", "haladni, előrelépni"), ("to take a risk", "kockázatot vállalni"), ("to do research", "kutatást végezni"),
  ("to meet a deadline", "tartani a határidőt"), ("to raise awareness", "felhívni a figyelmet"), ("highly unlikely", "nagyon valószínűtlen"),
  ("deeply concerned", "mélyen aggódó"), ("bitterly disappointed", "keserűen csalódott"), ("fully aware", "teljesen tisztában"),
  ("widely regarded", "széles körben tartják valaminek"), ("a sharp increase", "meredek növekedés"), ("to pose a threat", "veszélyt jelenteni"),
], [
  ("We've made real progress this quarter.", "Ebben a negyedévben valódi előrelépést értünk el.", ["We have made real progress this quarter."]),
  ("It's highly unlikely that prices will fall.", "Nagyon valószínűtlen, hogy az árak csökkennek.", ["It is highly unlikely that prices will fall."]),
  ("We are fully aware of the risks.", "Teljesen tisztában vagyunk a kockázatokkal."),
  ("Sales showed a sharp increase in March.", "Az eladások márciusban meredeken nőttek."),
  ("She is widely regarded as an expert.", "Széles körben szakértőnek tartják."),
  ("We managed to meet the deadline.", "Sikerült tartanunk a határidőt."),
]),
("c6", "C1", "What I need is…", "Hasított mondatok és kiemelés", "Egy ügyfélnek elmagyarázod, mi a valódi probléma", [
  ("It-cleft", "It was Anna who found the solution (Anna volt az, aki…). It's the price that worries me. Kiemeli, mi az új vagy fontos információ."),
  ("What-cleft", "What I need is more time (amire szükségem van, az több idő). What surprised me was his reaction. All I want is…"),
  ("Fronting", "Beszédben a fontos rész előre kerülhet: That I can't accept. Strange as it may seem, it worked."),
], [
  ("what I need is", "amire szükségem van, az"), ("it was… who", "… volt az, aki"), ("all I want is", "csak azt szeretném"),
  ("the thing is", "az a helyzet, hogy"), ("the reason why", "az ok, amiért"), ("the point is", "a lényeg az, hogy"),
  ("what matters is", "ami számít, az"), ("strange as it may seem", "bármily furcsa"), ("the last thing I want", "az utolsó, amit akarok"),
  ("to emphasise", "hangsúlyozni"), ("the real issue", "a valódi probléma"), ("what struck me", "ami megdöbbentett"),
], [
  ("What I need is a bit more time.", "Amire szükségem van, az egy kis idő."),
  ("It was Anna who found the solution.", "Anna volt az, aki megtalálta a megoldást."),
  ("The thing is, we're already over budget.", "Az a helyzet, hogy már túlléptük a keretet.", ["The thing is, we are already over budget."]),
  ("What matters is that nobody was hurt.", "Az számít, hogy senki sem sérült meg."),
  ("The last thing I want is to upset anyone.", "Az utolsó, amit szeretnék, hogy bárkit megbántsak."),
  ("Strange as it may seem, it actually worked.", "Bármily furcsa, tényleg működött."),
]),
("c7", "C1", "Must have, might have", "Következtetés a múltról", "Egy rejtélyes irodai esetet próbáltok kitalálni", [
  ("Biztos következtetés", "must have + 3. alak: She must have forgotten (biztosan elfelejtette). Tagadás: can't have / couldn't have: He can't have seen us."),
  ("Lehetőség", "might / may / could have + 3. alak: They might have missed the train (lehet, hogy lekésték)."),
  ("Kritika, megbánás", "should have / shouldn't have: You should have told me (szólnod kellett volna). needn't have: I needn't have worried (fölöslegesen aggódtam)."),
], [
  ("must have", "biztosan …-t (múlt)"), ("can't have", "biztosan nem …-t (múlt)"), ("might have", "lehet, hogy …-t (múlt)"),
  ("should have", "kellett volna"), ("needn't have", "fölösleges volt"), ("would have", "-t volna"),
  ("to jump to conclusions", "elhamarkodott következtetést levonni"), ("evidence", "bizonyíték"), ("a clue", "nyom, támpont"),
  ("to rule out", "kizárni"), ("a hunch", "megérzés"), ("in hindsight", "utólag visszanézve"),
], [
  ("She must have forgotten about the meeting.", "Biztosan elfelejtette a megbeszélést."),
  ("He can't have seen us; he didn't say hello.", "Biztosan nem látott minket, nem köszönt.", ["He cannot have seen us; he did not say hello."]),
  ("They might have missed the train.", "Lehet, hogy lekésték a vonatot."),
  ("You should have told me earlier.", "Korábban kellett volna szólnod."),
  ("I needn't have worried; everything was fine.", "Fölöslegesen aggódtam, minden rendben volt.", ["I need not have worried; everything was fine."]),
  ("In hindsight, we should have waited.", "Utólag nézve várnunk kellett volna."),
]),
("c8", "C1", "Making your case", "Meggyőzés és kohézió", "Egy pályázati bizottság előtt érvelsz a projekted mellett", [
  ("Szerkezet", "Firstly / To begin with → Moreover / What is more → Nevertheless / That said → Consequently / As a result → All things considered / In conclusion."),
  ("Engedmény és ellenérv", "Admittedly, … However, … · While it is true that…, … · Granted, … but…"),
  ("Hivatkozó szavak", "this approach, such measures, the former / the latter – így nem ismétled ugyanazt a szót, és a szöveg összefügg."),
], [
  ("admittedly", "kétségtelen, el kell ismerni"), ("nevertheless", "mindazonáltal"), ("that said", "ugyanakkor, ezzel együtt"),
  ("consequently", "következésképpen"), ("granted", "igaz, elismerem"), ("the former", "az előbbi"), ("the latter", "az utóbbi"),
  ("to outweigh", "felülmúlni, többet nyomni a latban"), ("a compelling argument", "meggyőző érv"), ("to address", "kezelni, foglalkozni vele"),
  ("all things considered", "mindent figyelembe véve"), ("to substantiate", "alátámasztani"),
], [
  ("Admittedly, the project is expensive. However, the benefits are clear.", "Kétségtelen, hogy a projekt drága. Ugyanakkor az előnyei egyértelműek."),
  ("The advantages far outweigh the disadvantages.", "Az előnyök messze felülmúlják a hátrányokat."),
  ("That said, we need to address the costs.", "Ezzel együtt foglalkoznunk kell a költségekkel."),
  ("Both options are possible, but the latter is cheaper.", "Mindkét lehetőség járható, de az utóbbi olcsóbb."),
  ("All things considered, it's a risk worth taking.", "Mindent figyelembe véve ezt a kockázatot érdemes vállalni.", ["All things considered, it is a risk worth taking."]),
  ("We can substantiate this with recent data.", "Ezt friss adatokkal tudjuk alátámasztani."),
]),
]

# Podcastok: (id, szint, cím, magyar cím, leírás, szereplők {kulcs: (név, nem)}, sorok [(beszélő, szöveg, fordítás)], kérdések, szószedet)
PODCASTS = [
("p1", "A2", "Morning routines", "Reggeli rutinok", "Két kolléga arról beszélget, hogyan kezdik a napot.", {"A": ("Emma", "f"), "B": ("Jack", "m")}, [
  ("A", "Hi Jack. You always look so awake in the morning. What's your secret?", "Szia Jack. Reggelente mindig olyan éber vagy. Mi a titkod?"),
  ("B", "Honestly? I go to bed early. Usually before eleven.", "Őszintén? Korán fekszem. Általában tizenegy előtt."),
  ("A", "Before eleven! I'm usually still watching TV at midnight.", "Tizenegy előtt! Én éjfélkor általában még tévézek."),
  ("B", "That's the problem. Then I get up at half past six and go for a short run.", "Ez a gond. Aztán fél hétkor kelek, és futok egy rövidet."),
  ("A", "A run? Every day?", "Futás? Minden nap?"),
  ("B", "Not every day. Three or four times a week. On the other days I just walk the dog.", "Nem minden nap. Hetente háromszor-négyszer. A többi napon csak kutyát sétáltatok."),
  ("A", "And what do you have for breakfast?", "És mit reggelizel?"),
  ("B", "Porridge with some fruit, and a big cup of coffee. I never skip breakfast.", "Zabkását gyümölccsel, és egy nagy bögre kávét. Sosem hagyom ki a reggelit."),
  ("A", "I often skip it. I just grab a coffee on the way to work.", "Én gyakran kihagyom. Munkába menet veszek egy kávét."),
  ("B", "Maybe that's why you're always tired by eleven o'clock!", "Talán ezért vagy tizenegyre mindig fáradt!"),
  ("A", "Maybe you're right. I'll try your routine next week.", "Talán igazad van. Jövő héten kipróbálom a rutinodat."),
  ("B", "Good luck. The first three days are the hardest.", "Sok sikert. Az első három nap a legnehezebb."),
], [("Mikor fekszik le általában Jack?", ["Tizenegy előtt", "Éjfélkor", "Tízkor"], 0), ("Milyen gyakran fut Jack?", ["Hetente 3-4-szer", "Minden nap", "Soha"], 0), ("Mit csinál Emma reggeli helyett?", ["Kávét vesz munkába menet", "Gyümölcsöt eszik", "Fut"], 0), ("Mi Jack szerint a legnehezebb?", ["Az első három nap", "A korai kelés", "A futás"], 0)],
 [("awake", "éber"), ("to skip", "kihagyni"), ("porridge", "zabkása"), ("to grab", "gyorsan venni, felkapni"), ("routine", "rutin, napirend")]),
("p2", "B1", "Working from home", "Otthoni munka", "Egy rövid riport arról, hogyan változott meg a munka.", {"N": ("Host", "f"), "S": ("Sam", "m")}, [
  ("N", "Welcome to Everyday English. Today we're talking about working from home. My guest is Sam, a software developer from Leeds.", "Üdv az Everyday Englishben. Ma az otthoni munkáról beszélgetünk. A vendégem Sam, egy leedsi szoftverfejlesztő."),
  ("S", "Thanks for having me.", "Köszönöm a meghívást."),
  ("N", "Sam, how long have you been working from home?", "Sam, mióta dolgozol otthonról?"),
  ("S", "For about four years now. At first it was strange, but now I can't imagine going back to the office every day.", "Nagyjából négy éve. Eleinte furcsa volt, de most el sem tudom képzelni, hogy minden nap bejárjak az irodába."),
  ("N", "What do you like most about it?", "Mit szeretsz benne a legjobban?"),
  ("S", "Definitely not having to commute. I used to spend almost two hours a day on the train.", "Egyértelműen azt, hogy nem kell ingáznom. Régen majdnem napi két órát töltöttem a vonaton."),
  ("N", "And are there any downsides?", "És vannak hátrányai?"),
  ("S", "Yes, it can get lonely. I miss chatting with colleagues over lunch. So now I go to the office twice a week.", "Igen, néha magányos. Hiányoznak az ebéd közbeni beszélgetések a kollégákkal. Ezért most hetente kétszer bejárok."),
  ("N", "That sounds like a good balance. Any tips for people who are new to it?", "Ez jó egyensúlynak hangzik. Van tipped azoknak, akik most kezdik?"),
  ("S", "Have a separate space for work, even if it's just a corner of a room. And take proper breaks. Go outside, get some fresh air.", "Legyen külön munkahelyed, akár csak egy sarok a szobában. És tarts rendes szüneteket. Menj ki, szívj friss levegőt."),
  ("N", "Great advice. Thanks, Sam.", "Remek tanács. Köszönöm, Sam."),
  ("S", "My pleasure.", "Szívesen."),
], [("Mióta dolgozik Sam otthonról?", ["Kb. négy éve", "Egy éve", "Tíz éve"], 0), ("Mit szeret a legjobban?", ["Hogy nem kell ingáznia", "A csendet", "A rugalmas fizetést"], 0), ("Mi a hátránya szerinte?", ["Néha magányos", "Drága", "Zajos"], 0), ("Milyen gyakran jár be most?", ["Hetente kétszer", "Soha", "Minden nap"], 0)],
 [("to commute", "ingázni"), ("a downside", "hátrány"), ("lonely", "magányos"), ("a balance", "egyensúly"), ("a proper break", "rendes szünet")]),
("p3", "B1", "A trip to Scotland", "Utazás Skóciába", "Egy utazó meséli el skóciai kalandját.", {"N": ("Host", "f"), "L": ("Lucy", "f")}, [
  ("N", "Lucy, you've just come back from Scotland. How was it?", "Lucy, most jöttél vissza Skóciából. Milyen volt?"),
  ("L", "Amazing, but not quite what I expected.", "Csodálatos, de nem egészen olyan, amilyenre számítottam."),
  ("N", "Oh? What did you expect?", "Ó? Mire számítottál?"),
  ("L", "Rain, mainly! Everyone told me it rains all the time. But we had sunshine for five days in a row.", "Főleg esőre! Mindenki azt mondta, hogy állandóan esik. De öt napig egyfolytában sütött a nap."),
  ("N", "Lucky you. Where did you go?", "Szerencsés vagy. Hová mentél?"),
  ("L", "We started in Edinburgh, then hired a car and drove up to the Highlands.", "Edinburgh-ban kezdtünk, aztán béreltünk egy autót, és felmentünk a Felföldre."),
  ("N", "Driving on the left must have been a challenge.", "A bal oldali közlekedés biztos kihívás volt."),
  ("L", "It was terrifying at first, especially on the narrow roads. But I got used to it after a day or two.", "Eleinte rémisztő volt, főleg a keskeny utakon. De egy-két nap után megszoktam."),
  ("N", "What was the highlight?", "Mi volt a csúcspont?"),
  ("L", "Probably the Isle of Skye. The landscape was unbelievable, and we saw dolphins from the ferry.", "Talán a Skye-sziget. A táj hihetetlen volt, és a kompról delfineket láttunk."),
  ("N", "Would you go back?", "Visszamennél?"),
  ("L", "Definitely. Next time I want to go in winter and see the northern lights.", "Mindenképp. Legközelebb télen szeretnék menni, és megnézni az északi fényt."),
], [("Mire számított Lucy?", ["Sok esőre", "Hóra", "Hőségre"], 0), ("Hogyan jutottak el a Felföldre?", ["Bérelt autóval", "Vonattal", "Busszal"], 0), ("Mi volt az utazás csúcspontja?", ["A Skye-sziget", "Edinburgh vára", "Egy koncert"], 0), ("Mit szeretne legközelebb?", ["Télen menni és látni az északi fényt", "Nyáron táborozni", "Vonattal utazni"], 0)],
 [("in a row", "egymás után, sorban"), ("to hire a car", "autót bérelni"), ("terrifying", "rémisztő"), ("the highlight", "csúcspont, fénypont"), ("a ferry", "komp")]),
("p4", "B2", "The science of habits", "A szokások tudománya", "Rövid előadás arról, hogyan alakulnak ki és hogyan változtathatók meg a szokások.", {"N": ("Host", "f"), "D": ("Dr Patel", "m")}, [
  ("N", "Dr Patel, why is it so hard to change our habits?", "Dr. Patel, miért olyan nehéz megváltoztatni a szokásainkat?"),
  ("D", "Because habits are designed to save energy. Once a behaviour becomes automatic, the brain no longer has to think about it.", "Mert a szokások energiát spórolnak. Ha egy viselkedés automatikussá válik, az agynak már nem kell gondolkodnia rajta."),
  ("N", "So how does a habit actually form?", "És hogyan alakul ki valójában egy szokás?"),
  ("D", "Researchers often describe a loop: a cue, a routine, and a reward. The cue triggers the behaviour, and the reward makes us want to repeat it.", "A kutatók gyakran egy körről beszélnek: jelzés, rutin és jutalom. A jelzés elindítja a viselkedést, a jutalom miatt pedig meg akarjuk ismételni."),
  ("N", "Can you give an example?", "Tudna példát mondani?"),
  ("D", "Sure. You feel bored at work, that's the cue. You check your phone, that's the routine. And you get a little burst of novelty, which is the reward.", "Persze. Unatkozol a munkában, ez a jelzés. Megnézed a telefonod, ez a rutin. És kapsz egy kis újdonságélményt, ez a jutalom."),
  ("N", "That sounds very familiar. So what's the best way to break a bad habit?", "Ez nagyon ismerős. Mi a legjobb módja egy rossz szokás elhagyásának?"),
  ("D", "Rather than trying to rely on willpower, it's more effective to change the environment. If your phone is in another room, you simply won't check it as often.", "Ahelyett, hogy az akaraterőre támaszkodnánk, hatékonyabb a környezetet megváltoztatni. Ha a telefonod a másik szobában van, egyszerűen ritkábban nézed meg."),
  ("N", "And for building good habits, like learning a language?", "És jó szokások kialakítására, mint például a nyelvtanulás?"),
  ("D", "Make it small and attach it to something you already do. For example, ten minutes of vocabulary every morning with your first coffee.", "Legyen kicsi, és kösd valamihez, amit már úgyis csinálsz. Például tíz perc szótanulás minden reggel az első kávéhoz."),
  ("N", "How long does it take for something to become automatic?", "Mennyi idő alatt válik valami automatikussá?"),
  ("D", "It varies enormously. One well-known study found an average of around sixty-six days, but for some people it was much faster, and for others much slower.", "Nagyon változó. Egy ismert kutatás átlagosan nagyjából hatvanhat napot talált, de volt, akinél sokkal gyorsabb, másnál sokkal lassabb volt."),
], [("Miért nehéz szokást változtatni?", ["Mert a szokások energiát spórolnak az agynak", "Mert lusták vagyunk", "Mert a szokások örökletesek"], 0), ("Mi a szokáskör három eleme?", ["Jelzés, rutin, jutalom", "Cél, terv, eredmény", "Akarat, idő, pénz"], 0), ("Mit javasol a rossz szokások ellen?", ["A környezet megváltoztatását", "Több akaraterőt", "Büntetést"], 0), ("Mennyi idő alatt alakul ki átlagosan egy szokás az említett kutatásban?", ["Kb. 66 nap", "21 nap", "Egy év"], 0)],
 [("a cue", "jelzés, kiváltó inger"), ("a reward", "jutalom"), ("willpower", "akaraterő"), ("to rely on", "támaszkodni valamire"), ("enormously", "rendkívül, óriási mértékben")]),
("p5", "B2", "Is AI changing the job market?", "Megváltoztatja az MI a munkaerőpiacot?", "Két szakértő vitája a mesterséges intelligencia hatásáról.", {"N": ("Host", "f"), "R": ("Rachel", "f"), "T": ("Tom", "m")}, [
  ("N", "Today we're asking whether artificial intelligence will take our jobs. Rachel, you're optimistic.", "Ma azt kérdezzük, elveszi-e a mesterséges intelligencia a munkánkat. Rachel, ön optimista."),
  ("R", "I am. Every major technology has destroyed some jobs and created others. I think AI will mostly change how we work rather than replace us.", "Igen. Minden nagy technológia megszüntetett bizonyos munkákat, és újakat teremtett. Szerintem az MI főleg azt változtatja meg, hogyan dolgozunk, nem helyettesít minket."),
  ("N", "Tom, you're less convinced.", "Tom, ön kevésbé meggyőződéses."),
  ("T", "Admittedly, history is on Rachel's side. That said, this time the change is happening much faster, and it affects office jobs that were considered safe.", "Kétségtelen, hogy a történelem Rachelt igazolja. Ugyanakkor most sokkal gyorsabb a változás, és olyan irodai munkákat is érint, amelyeket biztonságosnak tartottunk."),
  ("R", "But speed isn't necessarily a bad thing if people are given the chance to retrain.", "De a gyorsaság nem feltétlenül rossz, ha az emberek lehetőséget kapnak az átképzésre."),
  ("T", "That's a big if. Retraining takes time and money, and not everyone has access to it.", "Ez egy nagy „ha”. Az átképzés időbe és pénzbe kerül, és nem mindenki fér hozzá."),
  ("N", "So what should governments do?", "Mit kellene tenniük a kormányoknak?"),
  ("T", "Invest heavily in education, and make sure the benefits of productivity gains are shared fairly.", "Sokat fektetni az oktatásba, és gondoskodni arról, hogy a termelékenységnövekedés előnyei igazságosan oszoljanak meg."),
  ("R", "On that, I completely agree. Where we differ is on how worried we should be.", "Ebben teljesen egyetértek. Abban térünk el, mennyire kellene aggódnunk."),
  ("N", "And what advice would you give our listeners?", "És mit tanácsolnának a hallgatóinknak?"),
  ("R", "Learn to use these tools rather than fear them. The people who benefit most will be those who combine AI with human skills.", "Tanulják meg használni ezeket az eszközöket ahelyett, hogy félnének tőlük. Azok járnak a legjobban, akik az MI-t emberi készségekkel ötvözik."),
  ("T", "And invest in the skills that are hardest to automate: communication, creativity and judgement.", "És fektessenek a legnehezebben automatizálható készségekbe: kommunikáció, kreativitás és ítélőképesség."),
], [("Mi Rachel fő álláspontja?", ["Az MI inkább átalakítja a munkát, mint helyettesít", "Az MI minden munkát elvesz", "Az MI nem hat a munkára"], 0), ("Mi aggasztja Tomot?", ["A változás gyorsasága és az irodai munkák érintettsége", "A gépek ára", "Az áramfogyasztás"], 0), ("Miben értenek egyet?", ["Az oktatásba kell fektetni és igazságosan elosztani az előnyöket", "Be kell tiltani az MI-t", "Semmiben"], 0), ("Milyen készségeket javasol Tom?", ["Kommunikáció, kreativitás, ítélőképesség", "Programozás", "Gépírás"], 0)],
 [("to retrain", "átképezni (magát)"), ("convinced", "meggyőződött"), ("productivity gains", "termelékenységnövekedés"), ("judgement", "ítélőképesség"), ("to automate", "automatizálni")]),
("p6", "C1", "The art of small talk", "A csevegés művészete", "Miért fontos a small talk a brit kultúrában, és hogyan csináld jól.", {"N": ("Host", "f"), "O": ("Oliver", "m")}, [
  ("N", "Oliver, why do the British talk about the weather so much?", "Oliver, miért beszélnek a britek annyit az időjárásról?"),
  ("O", "It's not really about the weather. It's a social ritual, a safe way of saying 'I'm friendly and I'm open to a chat' without being intrusive.", "Valójában nem az időjárásról szól. Társas rituálé, biztonságos módja annak, hogy azt mondjuk: „barátságos vagyok, és nyitott egy beszélgetésre” anélkül, hogy tolakodóak lennénk."),
  ("N", "So the content doesn't matter much?", "Tehát a tartalom nem nagyon számít?"),
  ("O", "Hardly at all. What matters is the rhythm. Someone makes a comment, you agree and add a little something, and you pass the ball back.", "Szinte egyáltalán nem. A ritmus számít. Valaki tesz egy megjegyzést, te egyetértesz, hozzáteszel valamit, és visszadobod a labdát."),
  ("N", "Can you show us?", "Megmutatnád?"),
  ("O", "Of course. 'Bit chilly this morning, isn't it?' And you'd say something like, 'Freezing! Apparently it's going to warm up at the weekend, though.'", "Persze. „Kicsit hűvös ma reggel, nem?” Te pedig valami ilyesmit mondanál: „Fagyos! Állítólag hétvégére azért melegszik.”"),
  ("N", "And what are the common mistakes learners make?", "És milyen gyakori hibákat követnek el a tanulók?"),
  ("O", "Being too direct, mainly. Answering a casual question with a long, detailed answer, or asking very personal questions too early, like how much someone earns.", "Főleg a túlzott egyenességet. Ha egy hétköznapi kérdésre hosszú, részletes választ adnak, vagy túl korán kérdeznek nagyon személyes dolgokat, például hogy mennyit keres valaki."),
  ("N", "So 'How are you?' isn't really a question?", "Szóval a „How are you?” nem igazi kérdés?"),
  ("O", "In most contexts, no. 'Fine, thanks, and you?' is the expected answer, even if you've had a terrible week.", "A legtöbb helyzetben nem. A „Fine, thanks, and you?” a várt válasz, még ha borzalmas heted is volt."),
  ("N", "Any final tips?", "Valami utolsó tipp?"),
  ("O", "Listen more than you speak, show genuine interest, and have a few safe topics up your sleeve: travel, food, weekend plans. And don't be afraid of a little self-deprecating humour.", "Többet hallgass, mint beszélj, mutass őszinte érdeklődést, és legyen pár biztonságos témád tartalékban: utazás, étel, hétvégi tervek. És ne félj egy kis önironikus humortól."),
], [("Miről szól valójában az időjárásról való beszélgetés?", ["Társas rituálé, barátságos jelzés", "Pontos időjárási információ", "Panaszkodás"], 0), ("Mi számít leginkább a small talkban?", ["A ritmus, a labda visszadobása", "A tartalom pontossága", "A nyelvtan"], 0), ("Mi a gyakori hiba?", ["A túlzott egyenesség és a túl személyes kérdések", "A túl rövid válasz", "Az időjárás említése"], 0), ("Mi a várt válasz a How are you?-ra?", ["Fine, thanks, and you?", "Részletes beszámoló", "Semmi"], 0)],
 [("intrusive", "tolakodó"), ("a ritual", "rituálé, szertartás"), ("chilly", "hűvös"), ("up your sleeve", "tartalékban"), ("self-deprecating", "önironikus, önmagát kicsinyítő")]),
]

# Kiejtés magyaroknak: kategória → (cím, magyarázat, [(szó1, szó2)], [mondatok])
PRON = [
("th", "A th hang", "A magyarból hiányzik. Zöngétlen (think) és zöngés (this) változata van. A nyelved hegye kicsit kilóg a fogaid közé, és ott fújod ki a levegőt. A magyarok gyakran sz-t, sz-t vagy d-t mondanak helyette: think → sink, they → day.",
  [("think", "sink"), ("three", "tree"), ("thank", "tank"), ("mouth", "mouse"), ("path", "pass"), ("they", "day"), ("then", "den"), ("breathe", "breeze")],
  ["I think there are three of them.", "Thank you for the birthday present.", "They thought the weather was fine."]),
("wv", "w vagy v", "A w nem v! Az ajkad kerekítsd, mintha u-t mondanál, és ne érintse a fogad. A v-nél a felső fogad az alsó ajkadra fekszik, mint a magyarban.",
  [("wine", "vine"), ("west", "vest"), ("wet", "vet"), ("while", "vile"), ("worse", "verse"), ("wary", "vary")],
  ["We were very worried about the weather.", "Would you like some white wine?", "Victor walked very slowly."]),
("ii", "Rövid i vagy hosszú í", "A ship rövid, laza [ɪ], szinte e felé hajlik; a sheep hosszú, feszes [iː], mint a magyar í. A különbség jelentést változtat!",
  [("ship", "sheep"), ("live", "leave"), ("fill", "feel"), ("bit", "beat"), ("sit", "seat"), ("chip", "cheap"), ("hit", "heat")],
  ["Please sit in this seat.", "I live here, but I'll leave tomorrow.", "The ship is full of sheep."]),
("ae", "Az æ hang (bad vagy bed)", "Az æ a magyar a és e között van: nyisd nagyra a szádat, mintha e-t mondanál, de lejjebb ejtett állkapoccsal. A bed-ben rendes e van.",
  [("bad", "bed"), ("man", "men"), ("sad", "said"), ("had", "head"), ("pan", "pen"), ("sat", "set")],
  ["The man had a bad headache.", "That black cat sat on my hat.", "Pass me the pan and the pen."]),
("uh", "A rövid ʌ (cut vagy cat)", "A cut-ban rövid, nyitott [ʌ] van, ami a magyar a és ö közé esik, ajakkerekítés nélkül. A cat-ben æ. A magyarok gyakran mindkettőre a-t mondanak.",
  [("cut", "cat"), ("hut", "hat"), ("bug", "bag"), ("run", "ran"), ("cup", "cap"), ("much", "match")],
  ["I love my cup of tea in the sun.", "Run! The bus is coming.", "There's a bug in my bag."]),
("final", "Zöngés szóvég", "Angolban a szóvégi zöngés mássalhangzó zöngés marad, és előtte hosszabb a magánhangzó: bag [bæːg] ≠ back [bæk]. A magyar fül ezt könnyen elhanyagolja.",
  [("bag", "back"), ("dog", "dock"), ("prize", "price"), ("eyes", "ice"), ("card", "cart"), ("leave", "leaf")],
  ["Put the bag at the back.", "He won a prize, but at what price?", "The dog sleeps by the dock."]),
("stress", "Szóhangsúly", "Sok kétszótagú szó főnévként az első, igeként a második szótagon hangsúlyos: a REcord – to reCORD. Rossz hangsúllyal nehezen értenek meg.",
  [("REcord", "reCORD"), ("PREsent", "preSENT"), ("OBject", "obJECT"), ("CONtract", "conTRACT"), ("INcrease", "inCREASE"), ("PERmit", "perMIT")],
  ["I'd like to present you with this present.", "They will record a new record.", "Prices increased; it was a huge increase."]),
]

# Vizsgafeladatok (B2 First / IELTS jellegű)
EXAM = {
"mc": ("Feleletválasztós szókitöltés", "Melyik szó illik a mondatba? (B2 First, Use of English 1. rész jellegű)", [
  ("She finally ___ up her mind and accepted the job.", "made", ["made", "did", "took", "got"], "make up your mind = dönteni."),
  ("The concert was ___ off because of the storm.", "called", ["called", "put", "taken", "set"], "call off = lefújni."),
  ("He has a strong ___ for chocolate.", "liking", ["liking", "loving", "wish", "taste"], "have a liking for = kedvelni valamit."),
  ("We need to ___ into account the cost of transport.", "take", ["take", "put", "bring", "make"], "take into account = figyelembe venni."),
  ("The new law will come into ___ next year.", "force", ["force", "power", "effect", "action"], "come into force = hatályba lépni."),
  ("I'm afraid I'm not ___ to make that decision.", "authorised", ["authorised", "allowed", "let", "able"], "be authorised to = jogosult valamire (hivatalos)."),
  ("The film was so boring that I nearly ___ asleep.", "fell", ["fell", "went", "got", "dropped"], "fall asleep = elaludni."),
  ("She ___ a great impression on the interviewers.", "made", ["made", "did", "gave", "had"], "make an impression = benyomást kelteni."),
  ("Prices have risen ___ over the last decade.", "steadily", ["steadily", "firmly", "solidly", "heavily"], "rise steadily = egyenletesen emelkedni."),
  ("It's ___ thinking about before you sign.", "worth", ["worth", "worthy", "value", "useful"], "be worth + -ing = érdemes."),
]),
"wf": ("Szóképzés", "Alakítsd át a zárójeles szót, hogy illjen a mondatba. (Use of English 3. rész jellegű)", [
  ("The ___ of the new bridge took three years. (CONSTRUCT)", "construction", "-ion főnévképző."),
  ("He was ___ about the results. (OPTIMISM)", "optimistic", "-ic melléknévképző."),
  ("Her ___ to help surprised everyone. (WILLING)", "willingness", "-ness főnévképző."),
  ("The instructions were completely ___. (UNDERSTAND)", "incomprehensible", "Tagadó: in- + -ible."),
  ("It was a ___ decision. (SPONTANEITY)", "spontaneous", "-ous melléknév."),
  ("There has been a significant ___ in sales. (GROW)", "growth", "grow → growth."),
  ("The hotel staff were extremely ___. (HELP)", "helpful", "-ful melléknév."),
  ("Please ___ the form before Friday. (COMPLETE)", "complete", "Ige marad."),
  ("His ___ was obvious to everyone. (DISAPPOINT)", "disappointment", "-ment főnévképző."),
  ("The museum is ___ to wheelchair users. (ACCESS)", "accessible", "-ible melléknév."),
]),
"kwt": ("Mondat-átalakítás kulcsszóval", "Írd át a mondatot a megadott szóval úgy, hogy a jelentés ne változzon (2–5 szó). (Use of English 4. rész jellegű)", [
  ("I haven't been to the cinema for a year. (LAST)", "It is a year since I last went to the cinema.", ["it is a year since i last went", "it's a year since i last went", "it has been a year since i last went", "it's been a year since i last went"], "It's/It has been + időtartam + since + múlt idő."),
  ("\"Don't touch the paintings,\" the guard told us. (NOT)", "The guard told us not to touch the paintings.", ["told us not to touch"], "Tiltás függő beszédben: tell somebody not to do."),
  ("It wasn't necessary for you to bring food. (NEED)", "You needn't have brought food.", ["needn't have brought", "need not have brought", "didn't need to bring", "did not need to bring"], "needn't have + 3. alak = fölösleges volt."),
  ("I regret not studying harder. (WISH)", "I wish I had studied harder.", ["wish i had studied", "wish i'd studied"], "I wish + past perfect = múltbeli megbánás."),
  ("They say he is very rich. (SAID)", "He is said to be very rich.", ["is said to be"], "Személyes szenvedő: be said to + ige."),
  ("Although it rained, we went out. (DESPITE)", "Despite the rain, we went out.", ["despite the rain", "despite it raining", "despite the fact that it rained"], "despite + főnév / -ing / the fact that."),
  ("Somebody stole my bike last night. (WAS)", "My bike was stolen last night.", ["bike was stolen"], "Szenvedő szerkezet: was + 3. alak."),
  ("It's possible that she missed the bus. (MIGHT)", "She might have missed the bus.", ["might have missed"], "might have + 3. alak = lehet, hogy (múlt)."),
]),
}
ESSAYS = [
  ("B2 First essay", "Some people think that young people should be required to do unpaid community work. Do you agree? Write about: 1) benefits for young people, 2) benefits for society, 3) your own idea. (140–190 szó)"),
  ("B2 First essay", "Is it better to live in a city or in the countryside? Write about: 1) jobs, 2) quality of life, 3) your own idea. (140–190 szó)"),
  ("IELTS Task 2", "Many people believe that social media has had a negative impact on society. To what extent do you agree or disagree? (min. 250 szó)"),
  ("IELTS Task 2", "Some people think governments should spend more on public transport than on roads. Discuss both views and give your opinion. (min. 250 szó)"),
  ("B2 First email", "You recently stayed at a hotel and were unhappy with the service. Write an email to the manager explaining the problems and what you would like them to do. (140–190 szó)"),
]


def items_of(uid, words, sents, prefix="en"):
    out = []
    for k, lst in (("w", words), ("s", sents)):
        for i, t in enumerate(lst, 1):
            it = {"id": f"{prefix}-{uid}-{k}{i}", "k": k, "it": t[0], "hu": t[1]}
            if len(t) > 2:
                it["alt"] = t[2]
            out.append(it)
    return out


def main():
    pack = json.loads((ROOT / "data" / "en.json").read_text(encoding="utf-8"))
    pack["units"] = [u for u in pack["units"] if not u["id"].startswith("en-c")]
    pack["tracks"] = {"gen": pack["tracks"]["gen"], "adv": pack["tracks"]["adv"], "c1": "Haladó angol C1", "biz": pack["tracks"]["biz"]}
    new = [{"id": f"en-{uid}", "title": title, "hu": hu, "level": lvl, "track": "c1", "role": role,
            "grammar": [{"h": h, "p": p} for h, p in gram], "items": items_of(uid, words, sents)}
           for uid, lvl, title, hu, role, gram, words, sents in C1]
    order = {"gen": 0, "adv": 1, "c1": 2, "biz": 3}
    units = [u for u in pack["units"]] + new
    units.sort(key=lambda u: order.get(u.get("track"), 9))
    pack["units"] = units
    (ROOT / "data" / "en.json").write_text(json.dumps(pack, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    pods = [{"id": f"en-{pid}", "level": lvl, "title": t, "hu": hu, "desc": desc,
             "cast": {k: {"name": n, "g": g} for k, (n, g) in cast.items()},
             "lines": [{"s": s, "it": it, "hu": h} for s, it, h in lines],
             "questions": [{"q": q, "o": o, "a": a} for q, o, a in qs],
             "vocab": [{"it": w, "hu": h} for w, h in vocab]}
            for pid, lvl, t, hu, desc, cast, lines, qs, vocab in PODCASTS]
    (ROOT / "data" / "podcasts-en.json").write_text(json.dumps({"podcasts": pods}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    pron = [{"id": cid, "title": t, "tip": tip, "pairs": [list(p) for p in pairs], "sentences": sents} for cid, t, tip, pairs, sents in PRON]
    (ROOT / "data" / "pron-en.json").write_text(json.dumps({"sets": pron}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

    exam = {}
    for k, (title, desc, items) in EXAM.items():
        if k == "mc":
            exam[k] = {"title": title, "desc": desc, "items": [{"q": q, "a": a, "o": o, "why": w} for q, a, o, w in items]}
        elif k == "wf":
            exam[k] = {"title": title, "desc": desc, "items": [{"q": q, "a": a, "why": w} for q, a, w in items]}
        else:
            exam[k] = {"title": title, "desc": desc, "items": [{"q": q, "a": a, "accept": acc, "why": w} for q, a, acc, w in items]}
    exam["essays"] = [{"type": t, "task": task} for t, task in ESSAYS]
    for v in (exam["mc"]["items"]):
        assert v["a"] in v["o"] and "___" in v["q"], v
    (ROOT / "data" / "exam-en.json").write_text(json.dumps(exam, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"angol: {len(pack['units'])} lecke ({len(new)} C1), {len(pods)} podcast, {len(pron)} kiejtési csoport, vizsga: {sum(len(exam[k]['items']) for k in ('mc','wf','kwt'))} feladat + {len(ESSAYS)} esszé")


if __name__ == "__main__":
    main()
