"""További angol próbavizsgák: 2-2 újabb B2 First és C1 Advanced jellegű vizsga, plusz egy IELTS Academic jellegű olvasásvizsga.
Futtatás (a content_mock.py után): python3 parliamo/tools/content_mock2.py  →  data/mock-en.json bővítése"""
import json, os
from content_mock import MOCKS, q, mc, D

def wf(text, a, why): return {"q": text, "a": a, "why": why}
def kwt(text, a, accept, why): return {"q": text, "a": a, "accept": accept, "why": why}
def L(s, it, hu): return {"s": s, "it": it, "hu": hu}

MORE = [
 {"id": "b2-2", "title": "B2 First jellegű próbavizsga 2.", "level": "B2", "minutes": 75, "parts": [
   {"type": "reading", "title": "Olvasott szöveg értése", "name": "The four-day school week",
    "text": "When a small rural district in Colorado announced that its schools would close every Friday, many parents were horrified. Who would look after the children? Would they fall behind? Five years later, the four-day week has become so popular that more than a hundred districts in the state have followed the same path.\n\nThe original reason was money. Running buses and heating buildings one day less each week saved the district around seven per cent of its budget, which allowed it to keep teachers it would otherwise have lost. Recruitment also improved: teachers were attracted by the promise of a long weekend, and fewer of them left for better-paid jobs in the cities.\n\nThe effect on learning is harder to measure. Some studies have found small drops in test scores, particularly in maths, while others show no difference at all. Researchers point out that the school day becomes longer when the week is shorter, and tired pupils may not get as much out of the final hour.\n\nFamilies are divided. For parents who work on Fridays, the extra day can mean paying for childcare. Yet many pupils use the time well, taking part-time jobs, helping on family farms or attending sports clubs. Some schools now offer optional Friday activities for those who need them.\n\nWhat seems clear is that the four-day week works best where the community supports it. As one headteacher put it, \"It isn't a magic solution. It's a trade-off, and every town has to decide whether it's worth it.\"",
    "questions": [
     q("How did parents first react to the plan?", ["They were shocked.", "They welcomed it.", "They ignored it.", "They voted for it."], "\"many parents were horrified\""),
     q("What was the main reason for introducing the four-day week?", ["To save money", "To improve test results", "To give pupils more free time", "To reduce traffic"], "\"The original reason was money.\""),
     q("How did the change affect teachers?", ["It became easier to keep them.", "Many left for the cities.", "Their salaries fell.", "They had to work on Fridays."], "\"fewer of them left for better-paid jobs\""),
     q("What do researchers say about the longer school day?", ["Pupils may be less effective at the end of it.", "It improves maths results.", "It has no effect at all.", "Teachers prefer it."], "\"tired pupils may not get as much out of the final hour\""),
     q("What is the headteacher's view?", ["Whether it works depends on the community.", "Every school should adopt it.", "It solves most problems.", "It should be stopped."], "\"every town has to decide whether it's worth it\"")]},
   {"type": "mc", "title": "Nyelvhelyesség: szókitöltés", "items": [
     mc("I can't ___ up with this noise any longer.", "put", ["put", "stand", "get", "take"], "put up with = elviselni."),
     mc("The new manager ___ a good impression on everyone.", "made", ["made", "did", "gave", "took"], "make an impression."),
     mc("She ran out of money, so she had to ___ a loan.", "take out", ["take out", "make up", "bring in", "set off"], "take out a loan = kölcsönt felvenni."),
     mc("Despite ___ tired, he finished the race.", "being", ["being", "he was", "to be", "been"], "despite + -ing."),
     mc("You'd better ___ an umbrella; it looks like rain.", "take", ["take", "to take", "taking", "took"], "had better + alapalak."),
     mc("This is the ___ film I've ever seen.", "funniest", ["funniest", "funnier", "most funny", "more funny"], "Felsőfok: funny → funniest.")]},
   {"type": "wf", "title": "Nyelvhelyesség: szóképzés", "items": [
     wf("There has been a sharp ___ in the number of visitors. (GROW)", "growth", "-th főnévképző: grow → growth."),
     wf("The hotel staff were extremely ___. (HELP)", "helpful", "-ful melléknévképző."),
     wf("It is ___ to drive without insurance. (LEGAL, ellentét)", "illegal", "il- fosztóképző l előtt."),
     wf("Her ___ to the team was enormous. (CONTRIBUTE)", "contribution", "-ion főnévképző."),
     wf("The results were ___ disappointing. (DEEP)", "deeply", "-ly határozószó."),
     wf("We were impressed by the ___ of the building. (HIGH)", "height", "high → height (rendhagyó).")]},
   {"type": "kwt", "title": "Nyelvhelyesség: mondatátalakítás", "items": [
     kwt("It's a pity I didn't go to the party. (WISH)", "I wish I had gone to the party.", ["i wish i had gone to the party", "i wish i'd gone to the party"], "wish + past perfect: múltbeli sajnálat."),
     kwt("They say he is very rich. (SAID)", "He is said to be very rich.", ["he is said to be very rich", "he's said to be very rich"], "Személyes szenvedő: be said to."),
     kwt("I haven't seen Mark for ages. (SINCE)", "It's ages since I last saw Mark.", ["it's ages since i last saw mark", "it is ages since i last saw mark", "it's ages since i saw mark", "it has been ages since i saw mark", "it's been ages since i saw mark", "it's been ages since i last saw mark"], "It's + időtartam + since + múlt idő."),
     kwt("Although it rained, we enjoyed the trip. (SPITE)", "In spite of the rain, we enjoyed the trip.", ["in spite of the rain we enjoyed the trip", "in spite of the rain, we enjoyed the trip", "in spite of the fact that it rained we enjoyed the trip", "in spite of the fact that it rained, we enjoyed the trip"], "in spite of + főnév."),
     kwt("Somebody stole my bike last night. (HAD)", "I had my bike stolen last night.", ["i had my bike stolen last night"], "have something done: elszenvedett esemény.")]},
   {"type": "listening", "title": "Hallott szöveg értése", "name": "A new language at sixty",
    "cast": {"A": {"name": "Host", "g": "m", "acc": "uk"}, "B": {"name": "Margaret", "g": "f", "acc": "uk"}},
    "lines": [
     L("A", "Margaret, you started learning Japanese at sixty. What made you decide to do it?", "Margaret, hatvan évesen kezdett japánul tanulni. Mi vette rá?"),
     L("B", "My grandson moved to Osaka for work, and I wanted to be able to talk to his new family.", "Az unokám munka miatt Oszakába költözött, és szerettem volna beszélni az új családjával."),
     L("A", "Was it as difficult as people say?", "Olyan nehéz volt, mint mondják?"),
     L("B", "The writing system was the hardest part. Speaking came more quickly than I expected.", "Az írásrendszer volt a legnehezebb. A beszéd gyorsabban ment, mint vártam."),
     L("A", "How did you study?", "Hogyan tanult?"),
     L("B", "Twenty minutes every morning with an app, and a weekly conversation class at the library.", "Minden reggel húsz percet egy appal, és heti egy társalgási órát a könyvtárban."),
     L("A", "Did you ever think about giving up?", "Gondolt valaha arra, hogy feladja?"),
     L("B", "After about three months, yes. Then I watched a children's programme and understood a whole scene, and that kept me going.", "Körülbelül három hónap után igen. Aztán megnéztem egy gyerekműsort, és megértettem egy egész jelenetet, és ez tartotta bennem a lelket."),
     L("A", "And have you visited Japan?", "És járt már Japánban?"),
     L("B", "Last spring. I ordered dinner for the whole family in Japanese. My grandson was speechless.", "Tavaly tavasszal. Japánul rendeltem vacsorát az egész családnak. Az unokám szóhoz sem jutott.")],
    "questions": [
     q("Why did Margaret start learning Japanese?", ["To communicate with her grandson's new family", "To find a job in Japan", "Because she was bored after retiring", "For a university course"], "\"I wanted to be able to talk to his new family\""),
     q("What did she find most difficult?", ["Writing", "Speaking", "Listening", "Grammar"], "\"The writing system was the hardest part.\""),
     q("What motivated her to continue?", ["Understanding a scene in a TV programme", "Passing an exam", "Her teacher's encouragement", "A trip to Osaka"], "\"understood a whole scene, and that kept me going\""),
     q("How did her grandson react in the restaurant?", ["He was too surprised to speak.", "He corrected her.", "He laughed at her.", "He ordered for her."], "\"My grandson was speechless.\"")]},
   {"type": "writing", "title": "Íráskészség", "task": "You see this announcement on an English-language website: \"Reviews wanted! Have you used a learning app, website or online course recently? Write a review explaining what you used it for, what you liked and disliked, and whether you would recommend it to others.\" Write your review. (140–190 words)", "etype": "B2 First review"}]},

 {"id": "b2-3", "title": "B2 First jellegű próbavizsga 3.", "level": "B2", "minutes": 75, "parts": [
   {"type": "reading", "title": "Olvasott szöveg értése", "name": "Why we keep things we never use",
    "text": "Open almost any kitchen drawer and you will find it: the strange tool nobody remembers buying, the charger for a phone thrown away years ago, the takeaway menus from restaurants that have long since closed. Most of us own far more than we need, and yet the idea of getting rid of things makes many people uncomfortable.\n\nPsychologists have a name for part of this behaviour: the endowment effect. Once we own something, we value it more highly than we would if we were thinking of buying it. In one famous experiment, people who had been given a coffee mug asked for about twice as much money to sell it as others were willing to pay for the same mug.\n\nMemories play a role too. A ticket from a concert or a jumper knitted by a grandparent is not really about the object itself. Throwing it away can feel like throwing away a piece of our past. And then there is the classic thought: \"I might need it one day.\" Occasionally we do, which convinces us that keeping everything is sensible.\n\nThe decluttering movement argues that this habit has a cost. Crowded homes can be stressful, and searching for lost items wastes time. Its supporters suggest simple rules, such as removing one object for every new one that comes in, or photographing sentimental items before letting them go.\n\nCritics reply that there is nothing wrong with a little mess, and that a perfectly tidy home can become an obsession of its own. Perhaps the real question is not how much we own, but whether our possessions make our lives easier or harder.",
    "questions": [
     q("What point does the writer make in the first paragraph?", ["People keep many useless objects.", "Kitchens are badly designed.", "Old phones are valuable.", "Restaurants close too often."], "\"Most of us own far more than we need\""),
     q("What did the mug experiment show?", ["Owners valued the mug more than buyers did.", "People prefer cheap mugs.", "Most people refuse to sell things.", "Buyers paid twice the normal price."], "\"asked for about twice as much money to sell it\""),
     q("Why do people keep sentimental objects?", ["They connect them to the past.", "They are worth a lot of money.", "They are useful every day.", "They are hard to replace."], "\"Throwing it away can feel like throwing away a piece of our past.\""),
     q("What is one rule suggested by the decluttering movement?", ["Get rid of something when you buy something new.", "Never buy sentimental items.", "Throw away all old photos.", "Clean the house every day."], "\"removing one object for every new one that comes in\""),
     q("What is the writer's conclusion?", ["What matters is whether possessions help us.", "Everyone should declutter immediately.", "Mess is always harmful.", "Tidy homes are an obsession."], "\"whether our possessions make our lives easier or harder\"")]},
   {"type": "mc", "title": "Nyelvhelyesség: szókitöltés", "items": [
     mc("The meeting has been ___ off until next week.", "put", ["put", "called", "set", "taken"], "put off = elhalasztani."),
     mc("He apologised ___ being late.", "for", ["for", "about", "of", "on"], "apologise for."),
     mc("I'm not used to ___ up so early.", "getting", ["getting", "get", "got", "have got"], "be used to + -ing."),
     mc("If I ___ you, I'd accept the offer.", "were", ["were", "am", "would be", "had been"], "Második feltételes: if I were you."),
     mc("She has a good ___ of humour.", "sense", ["sense", "feeling", "taste", "mind"], "sense of humour."),
     mc("We ___ our holiday in Spain last summer.", "spent", ["spent", "passed", "made", "took"], "spend time/holiday.")]},
   {"type": "wf", "title": "Nyelvhelyesség: szóképzés", "items": [
     wf("The film was a huge ___. (SUCCEED)", "success", "succeed → success."),
     wf("He was ___ about the results. (OPTIMISM)", "optimistic", "-istic melléknév."),
     wf("The ___ between the two cities is 200 km. (DISTANT)", "distance", "distant → distance."),
     wf("It was ___ of you to forget her birthday. (CARE)", "careless", "-less: nemtörődöm."),
     wf("They live in a very ___ area. (PEACE)", "peaceful", "-ful melléknév."),
     wf("The ___ of the river caused serious damage. (FLOOD)", "flooding", "-ing főnév: áradás.")]},
   {"type": "kwt", "title": "Nyelvhelyesség: mondatátalakítás", "items": [
     kwt("\"I'll call you tomorrow,\" said Anna. (WOULD)", "Anna said she would call me the next day.", ["anna said she would call me the next day", "anna said that she would call me the next day", "anna said she would call me the following day", "anna said that she would call me the following day"], "Függő beszéd: will → would, tomorrow → the next day."),
     kwt("It wasn't necessary for you to bring food. (NEED)", "You didn't need to bring food.", ["you didn't need to bring food", "you did not need to bring food", "you needn't have brought food"], "didn't need to / needn't have."),
     kwt("The film was so boring that we left early. (SUCH)", "It was such a boring film that we left early.", ["it was such a boring film that we left early"], "such a + melléknév + főnév + that."),
     kwt("I started working here five years ago. (BEEN)", "I have been working here for five years.", ["i have been working here for five years", "i've been working here for five years"], "have been + -ing + for."),
     kwt("Perhaps she missed the train. (MAY)", "She may have missed the train.", ["she may have missed the train"], "may have + past participle: múltbeli lehetőség.")]},
   {"type": "listening", "title": "Hallott szöveg értése", "name": "Working from a campervan",
    "cast": {"A": {"name": "Host", "g": "f", "acc": "us"}, "B": {"name": "Dan", "g": "m", "acc": "us"}},
    "lines": [
     L("A", "Dan, you've spent the last year working from a campervan. Why?", "Dan, az elmúlt évben egy lakóautóból dolgoztál. Miért?"),
     L("B", "My company went fully remote, and I realised I was paying a lot of rent for a flat I only used to sleep in.", "A cégem teljesen távmunkára állt át, és rájöttem, hogy rengeteg bért fizetek egy lakásért, amit csak alvásra használok."),
     L("A", "What's the biggest challenge?", "Mi a legnagyobb kihívás?"),
     L("B", "Internet, without a doubt. I've had to plan my routes around places with a good signal.", "Kétségkívül az internet. Az útvonalaimat a jó térerejű helyekhez kellett igazítanom."),
     L("A", "Do you ever feel lonely?", "Szoktál magányos lenni?"),
     L("B", "Sometimes, especially in winter. That's why I join co-working spaces in the towns I pass through.", "Néha, főleg télen. Ezért beülök a közösségi irodákba azokban a városokban, amelyeken átutazom."),
     L("A", "Has it saved you money?", "Spóroltál vele?"),
     L("B", "Less than I hoped. Fuel and repairs add up quickly. But I've seen more of the country than in the previous ten years.", "Kevesebbet, mint reméltem. Az üzemanyag és a javítások gyorsan összeadódnak. De többet láttam az országból, mint az előző tíz évben."),
     L("A", "Would you recommend it?", "Ajánlanád?"),
     L("B", "Only if you're very organised. Freedom sounds great until your laptop battery dies before an important meeting.", "Csak ha nagyon szervezett vagy. A szabadság jól hangzik, amíg le nem merül a laptopod egy fontos megbeszélés előtt.")],
    "questions": [
     q("Why did Dan decide to live in a campervan?", ["He was paying too much for a flat he rarely used.", "His company moved abroad.", "He lost his job.", "He wanted to write a travel book."], "\"paying a lot of rent for a flat I only used to sleep in\""),
     q("What is his biggest problem?", ["Finding a good internet connection", "Finding places to park", "Cooking meals", "Cold weather"], "\"Internet, without a doubt.\""),
     q("How does he deal with loneliness?", ["He works in shared offices.", "He travels with friends.", "He calls his family every day.", "He avoids winter travel."], "\"I join co-working spaces\""),
     q("What does he say about money?", ["He saved less than expected.", "He saved a lot.", "He spent nothing on repairs.", "Fuel is cheap."], "\"Less than I hoped.\"")]},
   {"type": "writing", "title": "Íráskészség", "task": "In your English class you have been talking about technology and young people. Now your teacher has asked you to write an essay: \"Young people today spend too much time online. Do you agree?\" Write about: 1. education, 2. friendships, 3. your own idea. (140–190 words)", "etype": "B2 First essay"}]},

 {"id": "c1-2", "title": "C1 Advanced jellegű próbavizsga 2.", "level": "C1", "minutes": 90, "parts": [
   {"type": "reading", "title": "Olvasott szöveg értése", "name": "The myth of multitasking",
    "text": "We like to think of ourselves as accomplished jugglers, answering emails while listening to a podcast and keeping half an eye on a group chat. Yet a substantial body of research suggests that what we call multitasking is, for the most part, an illusion. The brain does not genuinely perform two demanding tasks at once; it switches rapidly between them, and each switch carries a cost.\n\nThese costs are small enough to escape notice, which is precisely what makes them insidious. A fraction of a second lost here, a moment of reorientation there, and over the course of a day the cumulative effect can be considerable. Studies in which participants alternate between simple tasks consistently show slower performance and more errors than when the same tasks are completed one after the other.\n\nIntriguingly, those who consider themselves skilled multitaskers often perform worst. In one widely cited experiment, heavy media multitaskers were more easily distracted by irrelevant information and slower to switch between tasks than their less habitual counterparts. Confidence, it seems, is no guarantee of competence.\n\nThis is not to say that all combinations are equally problematic. Walking while talking, or listening to familiar music while doing routine housework, poses little difficulty, because at least one of the activities requires minimal conscious attention. The trouble begins when two tasks compete for the same mental resources, such as reading and listening to speech.\n\nThe practical implications are hardly revolutionary, but they are frequently ignored. Grouping similar tasks, silencing notifications during periods of concentrated work and resisting the urge to check messages the moment they arrive may feel inefficient. In reality, they allow us to do one thing properly rather than several things badly.",
    "questions": [
     q("What does the writer claim about multitasking in the first paragraph?", ["The brain actually alternates between tasks.", "Most people are good at it.", "It is essential in modern life.", "It improves concentration."], "\"it switches rapidly between them\""),
     q("Why are the costs of switching described as 'insidious'?", ["They are too small to notice individually.", "They are impossible to measure.", "They only affect older people.", "They increase over the years."], "\"small enough to escape notice\""),
     q("What did the experiment with heavy media multitaskers reveal?", ["They were more easily distracted.", "They were faster at switching.", "They made fewer errors.", "They were more confident and more accurate."], "\"more easily distracted by irrelevant information\""),
     q("According to the writer, when is doing two things at once least problematic?", ["When one activity needs little attention", "When both tasks are new", "When the tasks involve language", "When the person is confident"], "\"at least one of the activities requires minimal conscious attention\""),
     q("How does the writer view the practical advice in the final paragraph?", ["It is simple but often not followed.", "It is completely new.", "It is unrealistic.", "It is only for office workers."], "\"hardly revolutionary, but they are frequently ignored\"")]},
   {"type": "mc", "title": "Nyelvhelyesség: szókitöltés", "items": [
     mc("The proposal was met with ___ opposition.", "fierce", ["fierce", "hard", "heavy", "thick"], "fierce opposition: erős ellenállás (kollokáció)."),
     mc("She ___ no attempt to hide her disappointment.", "made", ["made", "did", "took", "gave"], "make an attempt."),
     mc("The report ___ light on several problems.", "shed", ["shed", "threw out", "cast off", "put"], "shed light on = rávilágít."),
     mc("It's a ___ conclusion that the plan will be approved.", "foregone", ["foregone", "forgone", "forecast", "foreseen"], "a foregone conclusion = előre eldöntött."),
     mc("He was ___ aware of the risks involved.", "fully", ["fully", "highly", "deeply", "greatly"], "fully aware."),
     mc("The decision was taken ___ consultation with staff.", "in", ["in", "on", "by", "under"], "in consultation with.")]},
   {"type": "wf", "title": "Nyelvhelyesség: szóképzés", "items": [
     wf("The government's response was widely criticised as ___. (ADEQUATE)", "inadequate", "in- fosztóképző."),
     wf("There is growing ___ that the policy has failed. (RECOGNISE)", "recognition", "-ition főnévképző."),
     wf("The changes were introduced with little ___. (CONSULT)", "consultation", "-ation főnévképző."),
     wf("His behaviour was completely ___. (EXCUSE)", "inexcusable", "in- + -able."),
     wf("She spoke with remarkable ___. (CLEAR)", "clarity", "clear → clarity."),
     wf("The scheme has been a ___ success. (QUALIFY)", "qualified", "qualified success = részleges siker.")]},
   {"type": "kwt", "title": "Nyelvhelyesség: mondatátalakítás", "items": [
     kwt("I had never seen such a beautiful sunset before. (TIME)", "It was the first time I had ever seen such a beautiful sunset.", ["it was the first time i had ever seen such a beautiful sunset", "it was the first time i had seen such a beautiful sunset", "it was the first time i'd ever seen such a beautiful sunset", "it was the first time i'd seen such a beautiful sunset"], "It was the first time + past perfect."),
     kwt("We only realised the danger when we reached the bridge. (UNTIL)", "It was not until we reached the bridge that we realised the danger.", ["it was not until we reached the bridge that we realised the danger", "it wasn't until we reached the bridge that we realised the danger", "not until we reached the bridge did we realise the danger"], "Kiemelés: It was not until ... that."),
     kwt("People believe that the painting was stolen in 1990. (BELIEVED)", "The painting is believed to have been stolen in 1990.", ["the painting is believed to have been stolen in 1990"], "be believed to have been + 3. alak."),
     kwt("She regrets not studying harder at school. (WISHES)", "She wishes she had studied harder at school.", ["she wishes she had studied harder at school", "she wishes she'd studied harder at school"], "wish + past perfect."),
     kwt("The concert was cancelled because of the storm. (ACCOUNT)", "The concert was cancelled on account of the storm.", ["the concert was cancelled on account of the storm"], "on account of = miatt.")]},
   {"type": "listening", "title": "Hallott szöveg értése", "name": "The return of the night train",
    "cast": {"A": {"name": "Host", "g": "f", "acc": "uk"}, "B": {"name": "Professor Lang", "g": "m", "acc": "uk"}},
    "lines": [
     L("A", "Professor Lang, night trains seemed to be dying out a decade ago. Why are they coming back?", "Lang professzor, egy évtizede úgy tűnt, kihalnak az éjszakai vonatok. Miért térnek vissza?"),
     L("B", "Largely because travellers have become more conscious of the environmental cost of short-haul flights.", "Főleg azért, mert az utazók jobban tudatában vannak a rövid repülőutak környezeti árának."),
     L("A", "But aren't they still more expensive than flying?", "De nem drágábbak még mindig a repülésnél?"),
     L("B", "Often, yes. Though if you factor in a hotel night you'd otherwise pay for, the comparison becomes rather more favourable.", "Gyakran igen. De ha beszámítjuk a szállodai éjszakát, amit egyébként kifizetnénk, az összevetés jóval kedvezőbb lesz."),
     L("A", "What's held the revival back?", "Mi fékezte az újjáéledést?"),
     L("B", "Mainly a shortage of modern sleeping cars, and the complexity of agreeing timetables across several national rail networks.", "Főleg a korszerű hálókocsik hiánya, és az, hogy bonyolult több nemzeti vasúthálózat menetrendjét összehangolni."),
     L("A", "Is it mainly a romantic choice, then?", "Akkor ez főleg romantikus választás?"),
     L("B", "There's certainly an element of nostalgia, but I'd argue the main appeal is practical: you arrive in the city centre, rested, at the start of the working day.", "Van benne kétségkívül némi nosztalgia, de szerintem a fő vonzereje gyakorlati: pihenten érkezel a városközpontba, a munkanap elején."),
     L("A", "And the future?", "És a jövő?"),
     L("B", "Cautiously optimistic. Demand clearly exists; the question is whether governments are prepared to invest before it peaks.", "Óvatosan derűlátó vagyok. A kereslet egyértelműen megvan; a kérdés az, hogy a kormányok hajlandók-e befektetni, mielőtt az a csúcsra ér.")],
    "questions": [
     q("What is the main reason for the return of night trains?", ["Concern about the environmental impact of flying", "Lower ticket prices", "Faster trains", "Government advertising"], "\"more conscious of the environmental cost of short-haul flights\""),
     q("When does the cost comparison become more favourable?", ["When the saved hotel night is included", "When booked a year ahead", "When travelling in groups", "When flying is delayed"], "\"if you factor in a hotel night\""),
     q("What has slowed down the revival?", ["Lack of modern carriages and complex timetables", "Lack of passenger interest", "Strikes", "High fuel prices"], "\"a shortage of modern sleeping cars, and the complexity of agreeing timetables\""),
     q("What does the professor see as the main attraction?", ["Practical arrival in the city centre", "Nostalgia", "Luxury food", "Beautiful views"], "\"the main appeal is practical\"")]},
   {"type": "writing", "title": "Íráskészség", "task": "Your class has watched a documentary about how cities could reduce car use. You have made the notes below: possible measures — better public transport, cycle lanes, charging drivers to enter the city centre. Write an essay discussing two of the measures in your notes. Explain which measure would be more effective, giving reasons to support your opinion. (220–260 words)", "etype": "C1 Advanced essay"}]},

 {"id": "c1-3", "title": "C1 Advanced jellegű próbavizsga 3.", "level": "C1", "minutes": 90, "parts": [
   {"type": "reading", "title": "Olvasott szöveg értése", "name": "In praise of boredom",
    "text": "Few experiences are as universally disparaged as boredom. We fill every idle moment with our phones, treat waiting rooms as an opportunity to clear our inboxes, and regard a child who complains of having nothing to do as a problem to be solved. Yet a growing number of researchers argue that boredom, far from being a pointless discomfort, may serve a genuine purpose.\n\nThe argument runs roughly as follows. Boredom is an unpleasant signal that our current activity is failing to engage us. Like hunger, it prompts us to look for something more rewarding. Without it, we might remain stuck in unproductive situations indefinitely. In this sense, boredom is less an absence of feeling than a nudge towards change.\n\nThere is also evidence linking boredom with creativity. In one study, participants who first completed a deliberately tedious task, copying numbers from a telephone directory, subsequently came up with more inventive uses for a pair of plastic cups than those who had skipped the dull activity. The researchers suggested that a wandering mind, freed from external stimulation, is more inclined to make unusual connections.\n\nNone of this means that boredom is always beneficial. Chronic boredom has been associated with poorer mental health and risky behaviour, particularly among adolescents. The distinction appears to lie between brief, occasional boredom, which can be productive, and a persistent sense that life lacks meaning.\n\nWhat may be lost in an age of constant entertainment is the first kind. If every pause is instantly filled, the mind never has the chance to drift. The challenge, perhaps, is not to eliminate boredom, but to tolerate it long enough to see where it leads.",
    "questions": [
     q("How does the writer describe common attitudes to boredom?", ["Almost everyone sees it as negative.", "Most people enjoy it.", "Children rarely experience it.", "It is considered healthy."], "\"universally disparaged\""),
     q("What comparison is made in the second paragraph?", ["Boredom works like hunger as a signal.", "Boredom is similar to tiredness.", "Boredom is like a disease.", "Boredom resembles happiness."], "\"Like hunger, it prompts us to look for something more rewarding.\""),
     q("What did the study with plastic cups suggest?", ["A dull task beforehand can boost creativity.", "Copying numbers improves memory.", "Creative people are rarely bored.", "Plastic cups are hard to use creatively."], "\"came up with more inventive uses\""),
     q("What distinction does the writer draw in the fourth paragraph?", ["Between occasional and chronic boredom", "Between adults and children", "Between work and leisure", "Between creative and uncreative people"], "\"between brief, occasional boredom ... and a persistent sense\""),
     q("What is the writer's final suggestion?", ["We should learn to put up with boredom.", "We should avoid boredom completely.", "Phones cure boredom.", "Boredom should be studied more."], "\"to tolerate it long enough to see where it leads\"")]},
   {"type": "mc", "title": "Nyelvhelyesség: szókitöltés", "items": [
     mc("The minister refused to ___ responsibility for the failure.", "accept", ["accept", "receive", "admit", "agree"], "accept responsibility."),
     mc("Her argument doesn't ___ up to close examination.", "stand", ["stand", "hold", "keep", "bear"], "stand up to scrutiny/examination."),
     mc("The company is on the ___ of bankruptcy.", "verge", ["verge", "border", "edge of", "limit"], "on the verge of = valaminek a szélén."),
     mc("They reached a decision ___ lengthy discussion.", "after", ["after", "since", "following on", "upon to"], "after lengthy discussion."),
     mc("This view is ___ held among scientists.", "widely", ["widely", "largely", "broadly to", "greatly"], "widely held view."),
     mc("He has a ___ interest in the outcome.", "vested", ["vested", "invested", "dressed", "fixed"], "vested interest = személyes érdekeltség.")]},
   {"type": "wf", "title": "Nyelvhelyesség: szóképzés", "items": [
     wf("The results of the trial were ___. (CONCLUDE, ellentét)", "inconclusive", "in- + -ive."),
     wf("Her ___ to detail is remarkable. (ATTEND)", "attention", "attend → attention."),
     wf("The city has undergone a dramatic ___. (TRANSFORM)", "transformation", "-ation főnévképző."),
     wf("These figures are ___ misleading. (POTENTIAL)", "potentially", "-ly határozószó."),
     wf("He showed great ___ in difficult circumstances. (RESILIENT)", "resilience", "-ence főnévképző."),
     wf("The plan was rejected as ___. (PRACTICE)", "impractical", "im- + -ical.")]},
   {"type": "kwt", "title": "Nyelvhelyesség: mondatátalakítás", "items": [
     kwt("I'd prefer you not to smoke in here. (RATHER)", "I'd rather you didn't smoke in here.", ["i'd rather you didn't smoke in here", "i would rather you didn't smoke in here", "i would rather you did not smoke in here"], "would rather + alany + múlt idő."),
     kwt("He didn't apologise, which surprised me. (FAILURE)", "His failure to apologise surprised me.", ["his failure to apologise surprised me"], "Főnevesítés: failure to do."),
     kwt("As soon as she arrived, the meeting started. (SOONER)", "No sooner had she arrived than the meeting started.", ["no sooner had she arrived than the meeting started"], "Inverzió: No sooner had ... than."),
     kwt("It's possible that the letter got lost in the post. (MIGHT)", "The letter might have got lost in the post.", ["the letter might have got lost in the post", "the letter might have been lost in the post", "the letter might have gotten lost in the post"], "might have + 3. alak."),
     kwt("Nobody expected the team to win. (CONTRARY)", "Contrary to expectations, the team won.", ["contrary to expectations the team won", "contrary to expectations, the team won", "contrary to all expectations, the team won", "contrary to all expectations the team won"], "contrary to expectations = várakozásokkal ellentétben.")]},
   {"type": "listening", "title": "Hallott szöveg értése", "name": "Rewilding a farm",
    "cast": {"A": {"name": "Host", "g": "m", "acc": "us"}, "B": {"name": "Clara", "g": "f", "acc": "uk"}},
    "lines": [
     L("A", "Clara, your family farmed this land for three generations. Why did you decide to let it go wild?", "Clara, a családod három generáción át gazdálkodott ezen a földön. Miért döntöttél úgy, hogy hagyod elvadulni?"),
     L("B", "Frankly, we were losing money every year. The soil was exhausted, and conventional farming simply wasn't viable any more.", "Őszintén szólva minden évben veszteséges voltunk. A talaj kimerült, és a hagyományos gazdálkodás egyszerűen nem volt többé életképes."),
     L("A", "How did your neighbours react?", "Hogyan reagáltak a szomszédaitok?"),
     L("B", "With considerable suspicion at first. To many of them, an untidy field is a sign of failure rather than a choice.", "Eleinte jókora gyanakvással. Sokuk szemében egy rendezetlen mező a kudarc jele, nem pedig választás."),
     L("A", "What changed their minds?", "Mi győzte meg őket?"),
     L("B", "Within five years, we had species returning that hadn't been seen locally for decades, including turtle doves and several rare butterflies.", "Öt éven belül olyan fajok tértek vissza, amelyeket évtizedek óta nem láttak a környéken, köztük vadgerlék és több ritka lepke."),
     L("A", "Does the farm make money now?", "Hoz most pénzt a gazdaság?"),
     L("B", "Through eco-tourism and the sale of meat from free-roaming cattle, yes, though the income is more modest than people imagine.", "Az ökoturizmusból és a szabadon legelő marhák húsának eladásából igen, bár a bevétel szerényebb, mint az emberek gondolják."),
     L("A", "Would you advise others to follow your example?", "Tanácsolnád másoknak, hogy kövessék a példádat?"),
     L("B", "Only after careful thought. Rewilding isn't a shortcut to profit; it's a long-term commitment that requires patience and a willingness to give up control.", "Csak alapos megfontolás után. Az újravadítás nem rövidítés a nyereséghez; hosszú távú elköteleződés, amihez türelem kell, és hajlandóság lemondani az irányításról.")],
    "questions": [
     q("Why did Clara stop conventional farming?", ["It was no longer profitable.", "She wanted to move to the city.", "The government paid her.", "Her neighbours complained."], "\"we were losing money every year\""),
     q("How did the neighbours first see the project?", ["As a sign of failure", "As an exciting experiment", "As a tourist attraction", "As a good investment"], "\"an untidy field is a sign of failure\""),
     q("What changed the neighbours' opinion?", ["The return of rare wildlife", "Higher profits", "A newspaper article", "Government support"], "\"species returning that hadn't been seen locally for decades\""),
     q("What does Clara say about rewilding as a business?", ["It requires patience and is not a quick profit.", "It is the easiest way to get rich.", "It needs no investment.", "It should be avoided."], "\"Rewilding isn't a shortcut to profit\"")]},
   {"type": "writing", "title": "Íráskészség", "task": "A website is inviting readers to write a proposal on how their local area could better support older residents. Write a proposal describing the current situation, suggesting two or three practical improvements and explaining how they would benefit the community. (220–260 words)", "etype": "C1 Advanced proposal"}]},

 {"id": "ielts", "title": "IELTS Academic jellegű olvasásvizsga", "level": "C1", "minutes": 45, "ielts": True, "parts": [
   {"type": "reading", "title": "1. szöveg", "name": "The history of the pencil",
    "text": "The modern pencil owes its existence to a chance discovery in the 1560s, when a large deposit of unusually pure graphite was found in Borrowdale, in the north of England. Local shepherds reportedly used it to mark their sheep, and it soon became clear that the material left a darker, cleaner line than lead, which had been used for writing since Roman times.\n\nBecause pure graphite was soft and brittle, early users wrapped it in string or sheepskin. The idea of enclosing it in wood is generally credited to Italian craftsmen, who hollowed out sticks of juniper and inserted a graphite core. The design proved so practical that it has changed remarkably little since.\n\nThe Borrowdale mine was so valuable that it was guarded and flooded between extraction periods to deter thieves. When supplies elsewhere were cut off during the Napoleonic Wars, the French engineer Nicolas-Jacques Conté developed a method of mixing powdered graphite with clay and firing the mixture in a kiln. By varying the proportion of clay, manufacturers could produce pencils of differing hardness, a system still used today.\n\nDespite the arrival of ballpoint pens and digital devices, the pencil has retained a surprising number of loyal users, from architects and artists to astronauts, who value its reliability in conditions where ink might fail.",
    "questions": [
     q("What was special about the graphite found in Borrowdale?", ["It was exceptionally pure.", "It was very hard.", "It was mixed with lead.", "It was found underwater."], "\"unusually pure graphite\""),
     q("Why did early users wrap graphite in string or sheepskin?", ["Because it broke easily", "To make it darker", "To hide it from thieves", "Because it was hot"], "\"soft and brittle\""),
     q("What is said about the wooden pencil design?", ["It has hardly changed.", "It was invented in England.", "It was quickly replaced.", "It used oak wood."], "\"changed remarkably little since\""),
     q("What did Conté's method make possible?", ["Pencils of different hardness", "Cheaper wooden cases", "Pencils without graphite", "Coloured pencils"], "\"pencils of differing hardness\""),
     q("Why do astronauts value pencils, according to the text?", ["They work where ink may not.", "They are lighter than pens.", "They can be erased.", "They are cheap."], "\"reliability in conditions where ink might fail\"")]},
   {"type": "reading", "title": "2. szöveg", "name": "Urban heat islands",
    "text": "On a summer afternoon, the centre of a large city can be several degrees warmer than the surrounding countryside. This phenomenon, known as the urban heat island effect, arises mainly because materials such as asphalt and concrete absorb solar radiation during the day and release it slowly at night. The lack of vegetation compounds the problem, since plants cool their surroundings through the evaporation of water from their leaves.\n\nThe consequences extend beyond discomfort. Higher temperatures increase demand for air conditioning, which in turn raises energy consumption and emissions. During heatwaves, the effect can be deadly: elderly people and those with heart or lung conditions are particularly vulnerable, and studies of past heatwaves have found significantly higher death rates in the hottest urban districts.\n\nCities have experimented with a range of countermeasures. Reflective 'cool roofs' painted in light colours can lower roof surface temperatures considerably. Green roofs, covered with plants, offer additional benefits such as absorbing rainwater, although they are more expensive to install and maintain. Planting street trees remains one of the most cost-effective options, provided that species are chosen carefully to withstand drought.\n\nUrban planners increasingly argue that such measures should be coordinated rather than introduced piecemeal. A single green roof makes little difference; a network of parks, trees and reflective surfaces across an entire district can measurably reduce temperatures.",
    "questions": [
     q("What is the main cause of the urban heat island effect?", ["Building materials storing and releasing heat", "Air pollution", "Traffic noise", "High population density alone"], "\"absorb solar radiation during the day and release it slowly at night\""),
     q("How do plants help to cool cities?", ["By releasing water through their leaves", "By reflecting sunlight", "By blocking wind", "By absorbing traffic fumes"], "\"evaporation of water from their leaves\""),
     q("Which group is mentioned as especially at risk during heatwaves?", ["Elderly people", "Children", "Office workers", "Tourists"], "\"elderly people ... are particularly vulnerable\""),
     q("What disadvantage of green roofs is mentioned?", ["Higher cost", "They reflect too much light", "They attract insects", "They increase flooding"], "\"more expensive to install and maintain\""),
     q("What do planners recommend?", ["Coordinating measures across whole areas", "Building more air conditioning", "Introducing one measure at a time", "Moving people out of cities"], "\"should be coordinated rather than introduced piecemeal\"")]},
   {"type": "reading", "title": "3. szöveg", "name": "Can animals count?",
    "text": "For much of the twentieth century, claims that animals could count were treated with suspicion, largely because of the case of Clever Hans, a horse that appeared to solve arithmetic problems by tapping its hoof. It was later shown that Hans was responding to tiny, unconscious cues from his questioners, who relaxed when he reached the correct number. The episode made researchers extremely cautious about interpreting animal behaviour.\n\nModern studies, however, use carefully controlled methods to rule out such cues. Experiments have shown that a wide range of species possess what scientists call 'number sense': the ability to judge which of two groups contains more items. Fish, for example, prefer to join the larger of two shoals, and honeybees can be trained to choose the card showing a particular number of shapes.\n\nThis ability is generally approximate rather than exact. Animals distinguish easily between three and six objects, but find it much harder to tell twelve from thirteen. Interestingly, human infants show a similar pattern before they learn to use number words, suggesting that this approximate system may be an ancient and widely shared feature of animal brains.\n\nWhat appears to be uniquely human is the use of symbols to represent exact quantities. Some chimpanzees have learned to associate numerals with quantities after extensive training, but there is little evidence that any animal spontaneously develops such a system. Counting, in the precise sense, may therefore depend on language and culture as much as on biology.",
    "questions": [
     q("What did the case of Clever Hans show?", ["The horse was reacting to people's signals.", "Horses can do arithmetic.", "Animals cannot learn anything.", "Researchers had cheated."], "\"responding to tiny, unconscious cues from his questioners\""),
     q("What is 'number sense'?", ["Judging which group is larger", "Using number words", "Writing numerals", "Doing exact calculations"], "\"the ability to judge which of two groups contains more items\""),
     q("Which comparison do animals find difficult?", ["Twelve and thirteen", "Three and six", "One and five", "Two and ten"], "\"much harder to tell twelve from thirteen\""),
     q("What do human infants and animals have in common?", ["An approximate sense of quantity", "The ability to use symbols", "Knowledge of number words", "Exact counting skills"], "\"human infants show a similar pattern\""),
     q("What does the writer conclude about exact counting?", ["It may depend on language and culture.", "Many animals do it naturally.", "It is purely biological.", "Chimpanzees invented it."], "\"may therefore depend on language and culture\"")]}]},
]


def main():
    ids = {m["id"] for m in MORE}
    out = [m for m in MOCKS if m["id"] not in ids] + MORE
    for m in out:
        for p in m["parts"]:
            if p["type"] == "mc":
                for it in p["items"]:
                    assert it["a"] in it["o"], it
            if p["type"] == "wf":
                for it in p["items"]:
                    stem = it["q"].split("(")[-1].split(")")[0].split(",")[0].strip().lower()
                    assert it["a"].lower() != stem, it
    json.dump({"mocks": out}, open(os.path.join(D, "mock-en.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("próbavizsga:", ", ".join(f"{m['id']} ({len(m['parts'])} rész, {m['minutes']} perc)" for m in out))


if __name__ == "__main__":
    main()
