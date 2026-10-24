"""Angol teljes próbavizsgák (B2 First és C1 Advanced jelleggel).
Futtatás: python3 parliamo/tools/content_mock.py  →  data/mock-en.json"""
import json, os
D = os.path.join(os.path.dirname(__file__), "..", "data")

def q(text, opts, why=""):
    return {"q": text, "o": opts, "a": 0, "why": why}

def mc(text, a, o, why):
    return {"q": text, "a": a, "o": o, "why": why}

MOCKS = [
 {"id": "b2", "title": "B2 First jellegű próbavizsga", "level": "B2", "minutes": 75,
  "parts": [
   {"type": "reading", "title": "Olvasott szöveg értése", "name": "The rise of the repair café",
    "text": "In a community hall in Bristol, a retired engineer is examining a broken toaster while its owner watches nervously. Ten minutes later, the toaster is working again, and the owner has learned how to replace a fuse. This is a repair café, one of more than two thousand that now operate around the world.\n\nThe idea began in Amsterdam in 2009, when a journalist called Martine Postma decided that throwing away broken objects had become far too normal. She organised a single event where volunteers with practical skills offered to fix things for free. The response was so enthusiastic that she soon set up a foundation to help other communities copy the model.\n\nSupporters say repair cafés do much more than reduce waste. Visitors often arrive feeling frustrated with products that seem designed to fail, but leave feeling more confident about understanding the objects they own. \"People are surprised by how simple many repairs are,\" says one volunteer. \"Often it's just a loose wire.\"\n\nThere are limits, however. Many modern devices are glued together or need special tools, and manufacturers do not always make spare parts available. Campaigners argue that new laws are needed to give consumers a genuine \"right to repair\". Several countries have recently introduced rules forcing companies to supply parts and repair manuals for a number of years.\n\nFor now, the cafés rely on volunteers, donated tools and a great deal of goodwill. But as one regular visitor puts it, \"You don't just fix your kettle here. You meet your neighbours.\"",
    "questions": [
     q("What happened to the owner of the toaster?", ["They learned something practical.", "They bought a new toaster.", "They repaired it alone.", "They paid the engineer."], "\"the owner has learned how to replace a fuse\""),
     q("Why did Martine Postma start the first repair café?", ["She thought people threw things away too easily.", "She wanted to sell repaired objects.", "She was a trained engineer.", "Her city asked her to organise it."], "\"throwing away broken objects had become far too normal\""),
     q("According to supporters, how do visitors often feel when they leave?", ["More confident", "Disappointed", "Frustrated", "Confused"], "\"leave feeling more confident\""),
     q("What does the volunteer suggest about many repairs?", ["They are easier than people expect.", "They require expensive tools.", "They take several weeks.", "They are rarely successful."], "\"People are surprised by how simple many repairs are\""),
     q("What problem with modern devices is mentioned?", ["They are often difficult to open.", "They are too heavy.", "They use too much electricity.", "They are too cheap to repair."], "\"glued together or need special tools\""),
     q("What does the final quote suggest?", ["Repair cafés have a social value too.", "Kettles are the most common repair.", "Visitors prefer to buy new things.", "Neighbours often argue there."], "\"You meet your neighbours.\"")]},
   {"type": "mc", "title": "Nyelvhelyesség: szókitöltés", "items": [
     mc("She ___ a lot of effort into the project.", "put", ["put", "made", "did", "gave"], "put effort into = energiát fektetni bele."),
     mc("The flight was delayed ___ to bad weather.", "due", ["due", "because", "owing of", "thanks"], "due to = valami miatt."),
     mc("I'd rather you ___ tell anyone about this.", "didn't", ["didn't", "don't", "won't", "not"], "I'd rather + alany + múlt idő."),
     mc("He's very good ___ solving problems.", "at", ["at", "in", "on", "for"], "good at something."),
     mc("We had no ___ but to cancel the trip.", "choice", ["choice", "option of", "way", "decision"], "have no choice but to = nincs más választás."),
     mc("By the time we arrived, the concert ___.", "had started", ["had started", "started", "has started", "was starting"], "Múlt előtti múlt: past perfect."),
     mc("Could you ___ an eye on my bag for a moment?", "keep", ["keep", "hold", "put", "have"], "keep an eye on = szemmel tartani."),
     mc("It's no ___ complaining; nothing will change.", "use", ["use", "point of", "worth", "good of"], "It's no use + -ing = nincs értelme.")]},
   {"type": "wf", "title": "Nyelvhelyesség: szóképzés", "items": [
     {"q": "The ___ of the new library was celebrated with a concert. (OPEN)", "a": "opening", "why": "-ing főnév: opening = megnyitó."},
     {"q": "Her speech was surprisingly ___. (EMOTION)", "a": "emotional", "why": "-al melléknévképző."},
     {"q": "The instructions were completely ___. (CLEAR, ellentét)", "a": "unclear", "why": "un- fosztóképző."},
     {"q": "The museum has an impressive ___ of modern art. (COLLECT)", "a": "collection", "why": "-ion főnévképző."},
     {"q": "He answered the question ___. (CONFIDENT)", "a": "confidently", "why": "-ly határozószó-képző."},
     {"q": "We need more ___ about the event. (INFORM)", "a": "information", "why": "-ation főnévképző, megszámlálhatatlan."}]},
   {"type": "kwt", "title": "Nyelvhelyesség: mondatátalakítás", "items": [
     {"q": "I started learning French three years ago. (BEEN)", "a": "I have been learning French for three years.", "accept": ["i have been learning french for three years", "i've been learning french for three years"], "why": "have been + -ing + for."},
     {"q": "\"Don't touch the paintings,\" the guide said to us. (TOLD)", "a": "The guide told us not to touch the paintings.", "accept": ["the guide told us not to touch the paintings"], "why": "told + személy + not to."},
     {"q": "It wasn't necessary for you to bring a gift. (HAVE)", "a": "You didn't have to bring a gift.", "accept": ["you didn't have to bring a gift", "you did not have to bring a gift"], "why": "didn't have to = nem kellett."},
     {"q": "I regret not studying harder. (WISH)", "a": "I wish I had studied harder.", "accept": ["i wish i had studied harder", "i wish i'd studied harder"], "why": "wish + past perfect: múltbeli bánat."}]},
   {"type": "listening", "title": "Hallott szöveg értése", "name": "A volunteer weekend",
    "cast": {"A": {"name": "Host", "g": "f", "acc": "uk"}, "B": {"name": "Tom", "g": "m", "acc": "uk"}},
    "lines": [
     {"s": "A", "it": "Tom, you spent last weekend volunteering at a wildlife centre. How did that come about?", "hu": "Tom, a múlt hétvégét egy vadvédelmi központban töltötted önkéntesként. Hogy jött ez?"},
     {"s": "B", "it": "My sister works there, and they were short of people, so she persuaded me to help.", "hu": "A nővérem ott dolgozik, és kevesen voltak, így rábeszélt, hogy segítsek."},
     {"s": "A", "it": "What did you actually have to do?", "hu": "Mit kellett ténylegesen csinálnod?"},
     {"s": "B", "it": "Mostly cleaning, to be honest. But on Sunday I helped feed two young foxes, which was amazing.", "hu": "Őszintén szólva főleg takarítani. De vasárnap segítettem megetetni két fiatal rókát, ami csodálatos volt."},
     {"s": "A", "it": "Were you nervous around the animals?", "hu": "Ideges voltál az állatok közelében?"},
     {"s": "B", "it": "At first, yes. But the staff explained everything really clearly, so I soon relaxed.", "hu": "Eleinte igen. De a munkatársak mindent nagyon világosan elmagyaráztak, így hamar megnyugodtam."},
     {"s": "A", "it": "Would you do it again?", "hu": "Csinálnád újra?"},
     {"s": "B", "it": "Definitely. I've already signed up for one Saturday a month.", "hu": "Mindenképp. Már jelentkeztem havi egy szombatra."},
     {"s": "A", "it": "And what was the hardest part?", "hu": "És mi volt a legnehezebb?"},
     {"s": "B", "it": "Getting up at six on a Saturday! I'm not a morning person at all.", "hu": "Szombaton hatkor kelni! Egyáltalán nem vagyok reggeli ember."}],
    "questions": [
     q("Why did Tom go to the wildlife centre?", ["His sister asked him to help.", "He wanted a new job.", "It was a school project.", "He saw an advert."], "\"she persuaded me to help\""),
     q("What did Tom spend most of his time doing?", ["Cleaning", "Feeding animals", "Talking to visitors", "Building cages"], "\"Mostly cleaning\""),
     q("How did Tom feel at first around the animals?", ["Nervous", "Bored", "Excited", "Angry"], "\"At first, yes.\""),
     q("What has Tom already done?", ["Signed up to volunteer monthly", "Adopted a fox", "Left his job", "Visited another centre"], "\"signed up for one Saturday a month\""),
     q("What did Tom find hardest?", ["Getting up early", "Cleaning", "Feeding the foxes", "Following instructions"], "\"Getting up at six on a Saturday\"")]},
   {"type": "writing", "title": "Íráskészség", "task": "Your town wants to make its centre more attractive to young people. Write an essay giving your opinion. Write about: 1) leisure facilities, 2) transport, 3) your own idea. (140–190 words)", "etype": "B2 First essay"}]},
 {"id": "c1", "title": "C1 Advanced jellegű próbavizsga", "level": "C1", "minutes": 90,
  "parts": [
   {"type": "reading", "title": "Olvasott szöveg értése", "name": "The myth of multitasking",
    "text": "Few skills are more widely admired in the modern workplace than the ability to multitask. Job advertisements routinely request it, and many of us take quiet pride in answering emails during meetings or drafting reports while monitoring a stream of messages. Yet a growing body of research suggests that what we call multitasking is, in most cases, something rather less impressive.\n\nNeuroscientists point out that the brain does not genuinely perform two demanding tasks at once. Instead, it switches rapidly between them, and each switch carries a cost. Attention must be withdrawn from one task and re-engaged with another, and in the process small amounts of time and accuracy are lost. Over a working day, these losses accumulate into what some researchers estimate to be a reduction in productivity of up to forty per cent.\n\nPerhaps more troubling is the finding that habitual multitaskers tend to overestimate their own abilities. In laboratory studies, those who reported multitasking most frequently often performed worse at filtering out irrelevant information than those who rarely did so. The very habit that people believe sharpens their minds may, paradoxically, be dulling them.\n\nNone of this means that all combinations of activity are equally harmful. Listening to music while running, or chatting while cooking a familiar dish, places little strain on our cognitive resources, because one of the activities has become largely automatic. The difficulty arises when both tasks require conscious thought.\n\nSome organisations have begun to respond. A number of firms now encourage \"focus hours\" during which notifications are switched off and meetings are banned. Early reports are cautiously positive, though critics note that such schemes depend heavily on managers modelling the behaviour themselves. A policy announced by email and then ignored by senior staff is unlikely to change anything.",
    "questions": [
     q("What is the writer's main point in the first paragraph?", ["A widely valued skill may be misunderstood.", "Job adverts are becoming more demanding.", "Most people dislike multitasking.", "Meetings are a waste of time."], "\"something rather less impressive\""),
     q("According to neuroscientists, what actually happens when we multitask?", ["The brain switches between tasks.", "Both tasks get full attention.", "One task is ignored completely.", "The brain works faster than usual."], "\"it switches rapidly between them\""),
     q("What is surprising about habitual multitaskers?", ["They are often worse at ignoring distractions.", "They are more productive.", "They rarely overestimate themselves.", "They prefer quiet environments."], "\"performed worse at filtering out irrelevant information\""),
     q("Why are some combinations of activities less harmful?", ["One activity has become automatic.", "Both activities are physical.", "They are done in short bursts.", "They are enjoyable."], "\"one of the activities has become largely automatic\""),
     q("What does the word \"paradoxically\" emphasise?", ["The result is the opposite of what people expect.", "The research is unreliable.", "The effect is temporary.", "The finding is obvious."], "A szokás, ami állítólag élesíti az elmét, valójában tompítja."),
     q("What condition do critics mention for focus hours to succeed?", ["Managers must follow the rules themselves.", "Staff must be paid more.", "Meetings must be longer.", "Emails must be banned completely."], "\"depend heavily on managers modelling the behaviour\"")]},
   {"type": "mc", "title": "Nyelvhelyesség: szókitöltés", "items": [
     mc("The new policy has ___ a great deal of controversy.", "sparked", ["sparked", "lit", "fired", "burnt"], "spark controversy = vitát kavar."),
     mc("She was ___ aware of the risks involved.", "fully", ["fully", "highly", "deeply", "strongly"], "fully aware = teljesen tudatában."),
     mc("The results were ___ below our expectations.", "well", ["well", "much", "far more", "greatly"], "well below = jóval alatta."),
     mc("He made a ___ attempt to apologise.", "half-hearted", ["half-hearted", "half-minded", "half-done", "half-made"], "half-hearted = félszívű, erőtlen."),
     mc("Not ___ did she win, but she also broke the record.", "only", ["only", "just", "even", "merely as"], "Not only did … but also: inverzió."),
     mc("The project was ___ to a halt due to lack of funding.", "brought", ["brought", "taken", "put", "made"], "bring to a halt = leállítani."),
     mc("It goes ___ saying that safety comes first.", "without", ["without", "beyond", "with", "against"], "It goes without saying = magától értetődik."),
     mc("They agreed, ___ reluctantly.", "albeit", ["albeit", "despite", "though of", "even"], "albeit = bár (kötőszó, melléknév/határozó előtt).")]},
   {"type": "wf", "title": "Nyelvhelyesség: szóképzés", "items": [
     {"q": "The report highlights the ___ between rich and poor regions. (EQUAL)", "a": "inequality", "why": "in- + -ity: inequality."},
     {"q": "His behaviour was completely ___. (ACCEPT)", "a": "unacceptable", "why": "un- + -able."},
     {"q": "The scheme proved highly ___. (EFFECT)", "a": "effective", "why": "-ive melléknévképző."},
     {"q": "There is growing ___ about the plans. (SCEPTIC)", "a": "scepticism", "why": "-ism főnévképző."},
     {"q": "The decision was taken ___. (UNANIMOUS)", "a": "unanimously", "why": "-ly határozószó."},
     {"q": "The ___ of the building took longer than planned. (RENOVATE)", "a": "renovation", "why": "-ion főnévképző."}]},
   {"type": "kwt", "title": "Nyelvhelyesség: mondatátalakítás", "items": [
     {"q": "I have never seen such a beautiful sunset. (NEVER)", "a": "Never have I seen such a beautiful sunset.", "accept": ["never have i seen such a beautiful sunset", "never before have i seen such a beautiful sunset"], "why": "Inverzió tagadó határozó után."},
     {"q": "It's possible that she missed the train. (MIGHT)", "a": "She might have missed the train.", "accept": ["she might have missed the train"], "why": "might have + 3. alak."},
     {"q": "They didn't tell us about the changes until Monday. (ONLY)", "a": "Only on Monday were we told about the changes.", "accept": ["only on monday were we told about the changes", "only on monday did they tell us about the changes"], "why": "Only + időhatározó + inverzió."},
     {"q": "People say that he is a brilliant chef. (SAID)", "a": "He is said to be a brilliant chef.", "accept": ["he is said to be a brilliant chef"], "why": "Személytelen szenvedő: be said to."}]},
   {"type": "listening", "title": "Hallott szöveg értése", "name": "Cities and noise",
    "cast": {"A": {"name": "Presenter", "g": "f", "acc": "us"}, "B": {"name": "Dr Hughes", "g": "m", "acc": "uk"}},
    "lines": [
     {"s": "A", "it": "Dr Hughes, your research focuses on urban noise. Why should we care about it?", "hu": "Dr. Hughes, a kutatása a városi zajra összpontosít. Miért kellene ezzel foglalkoznunk?"},
     {"s": "B", "it": "Because it's one of the most underestimated health risks we face. Chronic noise raises stress levels and disrupts sleep, even when people believe they've got used to it.", "hu": "Mert ez az egyik leginkább alábecsült egészségügyi kockázat. A tartós zaj növeli a stresszt és rontja az alvást, még akkor is, ha az emberek azt hiszik, hozzászoktak."},
     {"s": "A", "it": "So the idea that we simply adapt is a myth?", "hu": "Tehát az, hogy egyszerűen alkalmazkodunk, mítosz?"},
     {"s": "B", "it": "Largely, yes. People may stop noticing it consciously, but their bodies continue to react.", "hu": "Nagyrészt igen. Az emberek tudatosan talán már nem veszik észre, de a testük továbbra is reagál."},
     {"s": "A", "it": "What are cities doing about it?", "hu": "Mit tesznek ellene a városok?"},
     {"s": "B", "it": "Some are reducing speed limits, which lowers tyre noise considerably. Others are planting trees, although their effect on noise is smaller than people assume.", "hu": "Néhányan csökkentik a sebességhatárokat, ami jelentősen mérsékli a gumik zaját. Mások fákat ültetnek, bár ezek hatása a zajra kisebb, mint gondolnák."},
     {"s": "A", "it": "Interesting. So trees are mainly symbolic?", "hu": "Érdekes. Tehát a fák inkább szimbolikusak?"},
     {"s": "B", "it": "Not entirely. They make streets feel calmer, and that perception matters for well-being, even if the decibels barely change.", "hu": "Nem teljesen. Nyugodtabbnak érződnek tőlük az utcák, és ez az érzet számít a jólléthez, még ha a decibelek alig változnak is."},
     {"s": "A", "it": "And what can individuals do?", "hu": "És mit tehetnek az egyének?"},
     {"s": "B", "it": "Protect their sleep above all. A quiet bedroom is probably the single most effective change most people can make.", "hu": "Mindenekelőtt óvják az alvásukat. Egy csendes hálószoba valószínűleg a leghatékonyabb változtatás, amit a legtöbben megtehetnek."}],
    "questions": [
     q("What does Dr Hughes say about getting used to noise?", ["The body still reacts to it.", "It happens within weeks.", "It improves sleep.", "It is a sign of good health."], "\"their bodies continue to react\""),
     q("Which measure reduces noise considerably?", ["Lower speed limits", "Planting trees", "Building walls", "Closing parks"], "\"lowers tyre noise considerably\""),
     q("What does he say about trees?", ["Their effect on noise is smaller than expected.", "They are useless.", "They reduce noise more than anything.", "They increase stress."], "\"smaller than people assume\""),
     q("Why might trees still be valuable?", ["They make streets feel calmer.", "They absorb all traffic noise.", "They are cheap to maintain.", "They attract tourists."], "\"make streets feel calmer\""),
     q("What does he recommend individuals prioritise?", ["Protecting their sleep", "Moving to the countryside", "Wearing headphones", "Avoiding traffic"], "\"Protect their sleep above all.\"")]},
   {"type": "writing", "title": "Íráskészség", "task": "Your class has attended a panel discussion on whether governments should limit working hours to four days a week. Write an essay discussing two of the following: productivity, employee well-being, the economy. Explain which is more important, giving reasons. (220–260 words)", "etype": "C1 Advanced essay"}]},
]


def main():
    for m in MOCKS:
        for p in m["parts"]:
            if p["type"] == "mc":
                for it in p["items"]:
                    assert it["a"] in it["o"], it
    json.dump({"mocks": MOCKS}, open(os.path.join(D, "mock-en.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("próbavizsga:", ", ".join(f"{m['id']} ({len(m['parts'])} rész)" for m in MOCKS))


if __name__ == "__main__":
    main()
