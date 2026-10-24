"""Angol íráskurzus (4 modul) és szókincsbecslő teszt.
Futtatás: python3 parliamo/tools/content_en4.py  →  data/writing-en.json, data/vocabtest-en.json"""
import json, os
D = os.path.join(os.path.dirname(__file__), "..", "data")

def mc(q, a, o, why):
    return {"q": q, "a": a, "o": o, "why": why}

WRITING = [
 {"id": "email", "title": "Formal email", "hu": "Hivatalos e-mail", "level": "B1–B2",
  "intro": "A hivatalos e-mail célja, hogy gyorsan és udvariasan elérd, amit szeretnél. Három része van: megszólítás és cél (miért írsz), kifejtés (a részletek, kérések), zárás (mit vársz, elköszönés). Kerüld a rövidítéseket (I'm helyett I am) és a túl közvetlen fordulatokat.",
  "parts": [
   {"name": "Megszólítás és cél", "tip": "Kezdd megszólítással, és az első mondatban mondd meg, miért írsz.", "phrases": ["Dear Mr Smith,", "Dear Sir or Madam,", "I am writing to enquire about…", "I am writing with regard to…"]},
   {"name": "Kifejtés", "tip": "Két-három bekezdésben a részletek. Egy bekezdés, egy gondolat. A kéréseket udvariasan fogalmazd.", "phrases": ["I would be grateful if you could…", "Could you please let me know…", "In addition,", "I would also like to know whether…"]},
   {"name": "Zárás", "tip": "Mondd meg, mit vársz, és köszönj el a megszólításhoz illően.", "phrases": ["I look forward to hearing from you.", "Thank you in advance for your help.", "Yours sincerely, (ha tudod a nevet)", "Yours faithfully, (Dear Sir or Madam után)"]}],
  "model": "Dear Ms Taylor,\n\nI am writing to enquire about the evening Spanish course advertised on your website.\n\nI would be grateful if you could tell me how many students there are in each group and whether the course includes any online materials. In addition, I would like to know if it is possible to pay in two instalments.\n\nI have studied Spanish for about a year, so I would also appreciate some advice on which level would be most suitable for me.\n\nThank you in advance for your help. I look forward to hearing from you.\n\nYours sincerely,\nAnna Kovács",
  "drill": [
   mc("I am writing ___ regard to your advertisement.", "with", ["with", "in", "for", "on"], "with regard to = valamivel kapcsolatban."),
   mc("I would be grateful if you ___ send me more information.", "could", ["could", "can", "will", "should"], "would be grateful if + could: udvarias kérés."),
   mc("I look forward to ___ from you.", "hearing", ["hearing", "hear", "heard", "be hearing"], "look forward to + -ing."),
   mc("Dear Sir or Madam, … Yours ___,", "faithfully", ["faithfully", "sincerely", "truly", "lovely"], "Név nélküli megszólításnál Yours faithfully."),
   mc("___, I would like to ask about the price.", "In addition", ["In addition", "Besides of", "Moreover of", "Also that"], "In addition = továbbá.")],
  "task": "Write an email to a language school asking about a summer course: dates, price, accommodation and level test. (120–150 words)"},
 {"id": "complaint", "title": "Complaint letter", "hu": "Panaszlevél", "level": "B2",
  "intro": "A panaszlevél akkor hatásos, ha tárgyszerű és konkrét: mi történt, mikor, mi a baj vele, és mit vársz. Maradj udvarias, még ha mérges is vagy. A megoldási javaslat (visszatérítés, csere) a levél legfontosabb része.",
  "parts": [
   {"name": "Bevezetés", "tip": "Mondd meg, miért írsz, és add meg a fontos adatokat (rendelésszám, dátum).", "phrases": ["I am writing to complain about…", "I am writing to express my dissatisfaction with…", "On 12 March I ordered…", "My order number is…"]},
   {"name": "A probléma", "tip": "Írd le pontosan, mi volt a gond. Használj múlt időt és tényeket.", "phrases": ["Unfortunately,", "To make matters worse,", "Despite several phone calls,", "I was told that…"]},
   {"name": "Elvárás és zárás", "tip": "Mondd meg világosan, mit szeretnél, és mikorra.", "phrases": ["I would therefore like a full refund.", "I expect a replacement within seven days.", "If the matter is not resolved,", "I look forward to your prompt reply."]}],
  "model": "Dear Sir or Madam,\n\nI am writing to complain about a coffee machine I ordered from your website on 3 May (order number 48213).\n\nUnfortunately, when the machine arrived, the water tank was cracked and it leaked as soon as I filled it. I contacted your customer service the same day, and I was told that a replacement would be sent within a week. To make matters worse, three weeks have now passed and I have not received anything, despite two further phone calls.\n\nI would therefore like a full refund, including the delivery charge. If the matter is not resolved within seven days, I will have no choice but to contact my bank.\n\nI look forward to your prompt reply.\n\nYours faithfully,\nPéter Nagy",
  "drill": [
   mc("I am writing to complain ___ the service I received.", "about", ["about", "for", "on", "with"], "complain about something."),
   mc("___ several emails, nobody has replied.", "Despite", ["Despite", "Although", "However", "Even"], "Despite + főnév; az although után mellékmondat kell."),
   mc("To make matters ___, the delivery was late.", "worse", ["worse", "worst", "bad", "badly"], "To make matters worse = ráadásul (rosszabb)."),
   mc("I would ___ like a full refund.", "therefore", ["therefore", "so that", "because", "although"], "therefore = ezért."),
   mc("I expect the problem to be ___ within a week.", "resolved", ["resolved", "resolving", "resolve", "to resolve"], "be + 3. alak: szenvedő szerkezet.")],
  "task": "You bought a jacket online, but it arrived damaged and late. Write a complaint letter to the company and ask for a solution. (140–180 words)"},
 {"id": "essay", "title": "Opinion essay", "hu": "Véleményesszé", "level": "B2–C1",
  "intro": "A véleményesszében egy kérdésre adsz érvelt választ. Felépítés: bevezetés (a téma és az álláspontod), két-három érvelő bekezdés (mindegyik egy fő érv példával), ellenérv és cáfolat, végül összegzés. A kötőszavak teszik logikussá a szöveget.",
  "parts": [
   {"name": "Bevezetés", "tip": "Vezesd fel a témát egy általános mondattal, és mondd ki az álláspontod.", "phrases": ["Nowadays, it is widely believed that…", "This essay will argue that…", "In my view,", "There is no doubt that…"]},
   {"name": "Érvek", "tip": "Bekezdésenként egy érv, mindegyikhez példa vagy indoklás.", "phrases": ["Firstly,", "Another important point is that…", "For example,", "As a result,"]},
   {"name": "Ellenérv és összegzés", "tip": "Említs egy ellenérvet, cáfold, majd foglald össze a véleményed.", "phrases": ["On the other hand,", "Admittedly,", "Nevertheless,", "To sum up, / In conclusion,"]}],
  "model": "Nowadays, more and more people work from home at least part of the week. In my view, this trend brings more benefits than drawbacks, both for employees and for society.\n\nFirstly, working from home saves a considerable amount of time. Instead of spending an hour in traffic, people can start work earlier or spend more time with their families. As a result, many employees report lower stress levels.\n\nAnother important point is that remote work reduces pollution. Fewer cars on the roads means cleaner air in cities, which benefits everyone, not only those who work from home.\n\nAdmittedly, some people feel isolated without colleagues around them. Nevertheless, this problem can be solved by combining office days with home office, a model that many companies already use.\n\nIn conclusion, although remote work is not perfect, its advantages clearly outweigh its disadvantages, provided that companies organise it sensibly.",
  "drill": [
   mc("___, remote work saves time.", "Firstly", ["Firstly", "At first", "First of all of", "In first"], "Firstly = először is (felsorolásban). At first = eleinte."),
   mc("It is cheap. ___, it is not very reliable.", "However", ["However", "Although", "Despite", "Because"], "However új mondatot vezet be, vesszővel."),
   mc("___ it is expensive, many people buy it.", "Although", ["Although", "However", "Despite", "In spite"], "Although + mellékmondat."),
   mc("In ___, the advantages outweigh the disadvantages.", "conclusion", ["conclusion", "conclude", "concluding", "the end of"], "In conclusion = összegzésképpen."),
   mc("___, some people prefer the office.", "Admittedly", ["Admittedly", "Admitting", "To admit", "Admitted"], "Admittedly = kétségtelen, el kell ismerni.")],
  "task": "Some people think that children should not be allowed to use smartphones until they are 14. Do you agree? Write an opinion essay. (180–220 words)"},
 {"id": "report", "title": "Report", "hu": "Beszámoló", "level": "B2–C1",
  "intro": "A beszámoló (report) tárgyszerű, címszavakkal tagolt szöveg, amely egy helyzetet mutat be és javaslatot tesz. Címet és alcímeket használ, személytelen hangnemű, és a végén konkrét ajánlások állnak.",
  "parts": [
   {"name": "Cél (Introduction)", "tip": "Egy-két mondatban: mi a beszámoló célja, mire épül.", "phrases": ["The aim of this report is to…", "This report is based on…", "It also makes recommendations for…"]},
   {"name": "Megállapítások", "tip": "Alcímekkel tagolva a tények, eredmények. Személytelen szerkezetek.", "phrases": ["The majority of students said that…", "It was found that…", "Only a small number of…", "According to the survey,"]},
   {"name": "Javaslatok (Recommendations)", "tip": "Konkrét, megvalósítható ajánlások.", "phrases": ["It is recommended that…", "I would suggest that…", "It would be advisable to…", "In conclusion,"]}],
  "model": "Report on the school canteen\n\nIntroduction\nThe aim of this report is to evaluate the school canteen and to suggest improvements. It is based on a survey of 120 students.\n\nFood quality\nThe majority of students said that the food is tasty, but many complained that there is little choice for vegetarians. It was also found that portions are often too small.\n\nPrices and opening hours\nAccording to the survey, prices are reasonable. However, almost half of the students said that the canteen closes too early for those with afternoon classes.\n\nRecommendations\nIt is recommended that at least two vegetarian dishes be offered every day. I would also suggest extending the opening hours until 4 p.m. These changes would make the canteen more popular with students.",
  "drill": [
   mc("The ___ of this report is to evaluate the new system.", "aim", ["aim", "goal of", "target", "point to"], "The aim of this report is to… = a beszámoló célja."),
   mc("It ___ found that most employees were satisfied.", "was", ["was", "is being", "has", "were"], "Személytelen szenvedő: It was found that…"),
   mc("The ___ of students prefer online classes.", "majority", ["majority", "most", "major", "biggest"], "The majority of = a többség."),
   mc("It is recommended that the café ___ open longer.", "stay", ["stay", "stays", "will stay", "staying"], "recommend that + alapalak (kötőmód)."),
   mc("___ to the survey, prices are too high.", "According", ["According", "Regarding", "Following", "Due"], "According to = valami szerint.")],
  "task": "Your company wants to improve its office. Write a report based on a staff survey: what works, what does not, and your recommendations. (180–220 words)"},
]

# Szókincsbecslés: 6 gyakorisági sáv, sávonként 8 valódi szó, plusz 16 kitalált (nem létező) szó a találgatás kiszűrésére.
BANDS = [
 {"from": 0, "to": 1000, "words": ["house", "water", "friend", "money", "important", "begin", "small", "morning"]},
 {"from": 1000, "to": 2000, "words": ["borrow", "climb", "honest", "journey", "wedding", "neighbour", "guilty", "remind"]},
 {"from": 2000, "to": 3000, "words": ["ancient", "ladder", "flexible", "sufficient", "swallow", "grateful", "rumour", "decline"]},
 {"from": 3000, "to": 5000, "words": ["reluctant", "thorough", "stubborn", "wrist", "cunning", "mortgage", "prey", "endorse"]},
 {"from": 5000, "to": 7000, "words": ["lenient", "brittle", "wane", "sturdy", "gaunt", "haggle", "smug", "quaint"]},
 {"from": 7000, "to": 10000, "words": ["cajole", "trite", "wry", "tepid", "fickle", "quell", "laconic", "dour"]},
]
PSEUDO = ["plound", "crumper", "flarsh", "mendly", "brastle", "sprunt", "glimber", "prandal", "stoffle", "wrember", "cleaming", "abbertise", "plintful", "sporm", "nolder", "trembry"]
LEVELS = [[1000, "A1"], [2000, "A2"], [3250, "B1"], [5000, "B2"], [7500, "C1"], [99999, "C2"]]


def main():
    json.dump({"modules": WRITING}, open(os.path.join(D, "writing-en.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"bands": BANDS, "pseudo": PSEUDO, "levels": LEVELS}, open(os.path.join(D, "vocabtest-en.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("íráskurzus:", len(WRITING), "modul; szókincsteszt:", sum(len(b["words"]) for b in BANDS), "szó +", len(PSEUDO), "álszó")


if __name__ == "__main__":
    main()
