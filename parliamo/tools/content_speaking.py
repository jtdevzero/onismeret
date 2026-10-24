"""Angol szóbeli vizsga feladatai: 20 IELTS-jellegű témasor és 6 Cambridge (B2 First / C1 Advanced) jellegű feladatsor
képösszehasonlítással és páros (AI-partneres) feladattal.
Futtatás: python3 parliamo/tools/content_speaking.py  →  data/speaking-en.json"""
import json, os
D = os.path.join(os.path.dirname(__file__), "..", "data")

def S(t, p1, cue, say, p3): return {"t": t, "p1": p1, "cue": {"q": cue, "say": say}, "p3": p3}

IELTS = [
 S("Home and free time", ["Do you live in a house or a flat?", "What do you like most about the area where you live?", "What do you usually do at the weekend?", "Have your free-time activities changed since you were a child?"],
   "Describe a place in your town or city where you like to spend time.", ["where it is", "how often you go there", "what you do there", "and explain why you like it"],
   ["Why do some people prefer to spend their free time at home?", "How have cities changed in the way they provide spaces for young people?", "Should local governments spend more money on parks and public spaces? Why?"]),
 S("Work and study", ["Do you work or are you a student?", "What do you find most interesting about your work or studies?", "Would you like to change anything about your daily routine?", "Do you prefer working alone or with other people?"],
   "Describe a skill you learned that has been useful to you.", ["what the skill is", "when and how you learned it", "how difficult it was", "and explain why it has been useful"],
   ["Which skills will be most important for young people in the future?", "Is it better to learn a skill from a teacher or by yourself online?", "Should schools focus more on practical skills than on academic subjects?"]),
 S("Travel", ["Do you enjoy travelling?", "What kind of places do you like to visit?", "How do you usually travel when you go on holiday?", "Is there a country you would really like to visit? Why?"],
   "Describe a journey you remember well.", ["where you went", "who you travelled with", "what happened during the journey", "and explain why you remember it so well"],
   ["How has tourism changed in the last twenty years?", "What problems can mass tourism cause for local people?", "Do you think people will travel more or less in the future? Why?"]),
 S("Technology", ["How often do you use your phone during the day?", "What apps do you use most?", "Did you use computers a lot when you were at school?", "Is there any technology you would find it hard to live without?"],
   "Describe a piece of technology that has changed your life.", ["what it is", "when you started using it", "how you use it", "and explain how it has changed your life"],
   ["Do you think people spend too much time on their phones?", "How has technology changed the way families communicate?", "Should children's use of technology be limited? Who should decide?"]),
 S("Food and health", ["What kind of food do you like?", "Do you prefer eating at home or in restaurants?", "Did you eat differently when you were a child?", "Do you think you have a healthy lifestyle?"],
   "Describe a meal you enjoyed with other people.", ["where you had it", "who you were with", "what you ate", "and explain why you enjoyed it"],
   ["Why do many people find it hard to eat healthily?", "Should governments tax unhealthy food?", "How important is it for families to eat together?"]),
 S("People and relationships", ["Do you have a large family?", "Who are you closest to in your family?", "How often do you meet your friends?", "Do you prefer to have a few close friends or many friends?"],
   "Describe a person who has influenced you.", ["who the person is", "how you know them", "what they are like", "and explain how they have influenced you"],
   ["What qualities make someone a good role model?", "Do young people today have different role models from those of their parents?", "Is it easier or harder to make friends as an adult?"]),
 S("Books and reading", ["Do you enjoy reading?", "What kind of books did you read as a child?", "Do you prefer paper books or e-books?", "Where do you usually read?"],
   "Describe a book or article that made you think.", ["what it was about", "when you read it", "why you chose it", "and explain how it changed your thinking"],
   ["Why do fewer young people read books for pleasure today?", "Should schools let children choose what they read?", "Will printed books disappear in the future?"]),
 S("Weather and seasons", ["What's the weather like where you live?", "Which season do you like best?", "Does the weather affect your mood?", "What do you like to do on rainy days?"],
   "Describe a day when the weather affected your plans.", ["when it happened", "what you had planned", "what the weather was like", "and explain how you felt about it"],
   ["How is climate change affecting the weather in your country?", "What can individuals do to reduce their impact on the environment?", "Should rich countries do more to help poorer ones adapt to climate change?"]),
 S("Music", ["What kind of music do you listen to?", "Did you learn to play an instrument as a child?", "Do you listen to music while you work or study?", "Have you ever been to a live concert?"],
   "Describe a song or piece of music that is special to you.", ["what it is", "when you first heard it", "what it sounds like", "and explain why it is special to you"],
   ["Why is music important in different cultures?", "Should music be a compulsory subject at school?", "How has the way people listen to music changed?"]),
 S("Shopping", ["Do you enjoy shopping?", "Do you prefer shopping online or in shops?", "What was the last thing you bought?", "Are there any markets near where you live?"],
   "Describe something you bought that you were really happy with.", ["what it was", "where you bought it", "why you bought it", "and explain why you were so happy with it"],
   ["Why do people buy things they don't need?", "How has online shopping affected town centres?", "Do advertisements influence young people too much?"]),
 S("Sport and exercise", ["Do you do any sport or exercise?", "Did you enjoy PE lessons at school?", "Do you prefer watching sport or doing it?", "What sports are popular in your country?"],
   "Describe a sporting event you watched or took part in.", ["what the event was", "where and when it happened", "who you were with", "and explain why it was memorable"],
   ["Why do some people dislike exercise?", "Are professional athletes paid too much?", "What can governments do to encourage people to be more active?"]),
 S("Neighbourhoods", ["How long have you lived in your neighbourhood?", "Do you know your neighbours well?", "What facilities are there near your home?", "Would you like to move somewhere else? Why?"],
   "Describe a neighbour or local person you know.", ["who they are", "how you met them", "what you do together or talk about", "and explain what you think of them"],
   ["Why do people in cities often not know their neighbours?", "What makes a community strong?", "Should young people be encouraged to stay in their home towns?"]),
 S("Learning languages", ["How many languages can you speak?", "When did you start learning English?", "What do you find most difficult about English?", "Would you like to learn another language?"],
   "Describe a time when you had to use a foreign language.", ["where you were", "who you were talking to", "what you needed to say", "and explain how it went"],
   ["Why do some people learn languages more easily than others?", "Will translation apps make language learning unnecessary?", "At what age should children start learning a foreign language?"]),
 S("Celebrations", ["What celebrations are important in your country?", "How do you usually celebrate your birthday?", "Do you prefer big parties or small gatherings?", "Have celebrations changed since you were a child?"],
   "Describe a celebration you enjoyed.", ["what was being celebrated", "where it took place", "who was there", "and explain why you enjoyed it"],
   ["Why are traditional festivals important?", "Have celebrations become too commercial?", "How do celebrations bring communities together?"]),
 S("Transport", ["How do you usually get to work or school?", "Is public transport good where you live?", "Do you have a driving licence?", "Do you enjoy long journeys?"],
   "Describe a form of transport you enjoy using.", ["what it is", "how often you use it", "where you travel with it", "and explain why you enjoy it"],
   ["How could cities reduce traffic congestion?", "Should public transport be free?", "Will self-driving cars be common in the future?"]),
 S("Films and TV", ["How often do you watch films?", "Do you prefer watching films at home or at the cinema?", "What kind of TV programmes do you like?", "Did you watch a lot of TV as a child?"],
   "Describe a film you would recommend to others.", ["what it is called and what kind of film it is", "what it is about", "when you saw it", "and explain why you would recommend it"],
   ["Why are films based on true stories so popular?", "Do violent films influence young people?", "How has streaming changed the film industry?"]),
 S("Nature", ["Do you spend much time outdoors?", "Is there a park or natural area near where you live?", "Did you spend a lot of time in nature as a child?", "Do you prefer the mountains or the sea?"],
   "Describe a natural place you have visited.", ["where it is", "when you went there", "what you did there", "and explain how you felt about it"],
   ["Why is it important for children to spend time in nature?", "Should some natural areas be closed to tourists?", "What can be done to protect wildlife?"]),
 S("Clothes and fashion", ["What kind of clothes do you usually wear?", "Do you care about fashion?", "Do you have to wear a uniform at work or school?", "Where do you usually buy clothes?"],
   "Describe an item of clothing you like to wear.", ["what it is", "where you got it", "when you wear it", "and explain why you like it"],
   ["Why do young people follow fashion trends?", "What are the environmental problems of cheap fashion?", "Should schools have uniforms?"]),
 S("Childhood", ["Where did you grow up?", "What games did you play as a child?", "What was your favourite subject at primary school?", "Do you think childhood is different today?"],
   "Describe a happy memory from your childhood.", ["what happened", "where you were", "who was with you", "and explain why it is a happy memory"],
   ["Is it harder to be a child today than in the past?", "How much freedom should children have?", "What is the most important thing parents can teach their children?"]),
 S("The future", ["What are your plans for next year?", "Do you like making plans or do you prefer to be spontaneous?", "Where would you like to live in the future?", "What job would you like to do in ten years?"],
   "Describe a goal you would like to achieve in the future.", ["what the goal is", "why you want to achieve it", "what you need to do", "and explain how you will feel when you achieve it"],
   ["Is it important to have long-term goals?", "How will work change in the next twenty years?", "Are young people today optimistic about the future?"]),
]

def C(id, level, t, p1, img_a, img_b, pq, follow, centre, prompts, decide, p4):
    return {"id": id, "level": level, "t": t, "p1": p1,
            "pics": {"a": img_a, "b": img_b, "q": pq, "follow": follow},
            "collab": {"q": centre, "prompts": prompts, "decide": decide}, "p4": p4}

CAM = [
 C("c-learn", "B2", "Learning", ["Where are you from?", "What do you enjoy studying?", "How do you prefer to learn new things?"],
   "sp-c-learn-a", "sp-c-learn-b", "Here are two photographs of people learning in different ways. Compare the photographs, and say what the people might find enjoyable about learning in these ways.",
   "Which way of learning would you prefer? Why?",
   "Why might people want to learn something new as adults?", ["to get a better job", "to meet new people", "to keep their mind active", "to travel more easily", "for fun"],
   "Now decide which reason is the most important.",
   ["Is it better to learn alone or in a group?", "Should employers pay for their staff to learn new skills?", "Do you think people will study at university less in the future?"]),
 C("c-holiday", "B2", "Holidays", ["What do you usually do in the summer?", "Do you prefer holidays in your own country or abroad?", "Tell us about a place you would like to visit."],
   "sp-c-holiday-a", "sp-c-holiday-b", "Here are two photographs of people on holiday. Compare the photographs, and say why the people might have chosen these holidays.",
   "Which holiday would you prefer? Why?",
   "What should a town do to attract more tourists?", ["build a new hotel", "organise a festival", "improve public transport", "advertise online", "open a museum"],
   "Now decide which two ideas would be most effective.",
   ["Is tourism always good for a town?", "Why do some people prefer not to travel?", "How might holidays change in the future?"]),
 C("c-work", "B2", "Work", ["Do you work or study?", "What would be your ideal job?", "Do you prefer to plan your day or be flexible?"],
   "sp-c-work-a", "sp-c-work-b", "Here are two photographs of people working in different places. Compare the photographs, and say what might be difficult about working in these places.",
   "Where would you prefer to work? Why?",
   "What makes a job satisfying?", ["a good salary", "friendly colleagues", "flexible hours", "the chance to learn", "helping other people"],
   "Now decide which factor is the most important for young people.",
   ["Is it important to enjoy your job?", "Should people be able to work from home if they want to?", "Is it better to stay in one job or change jobs often?"]),
 C("c-city", "C1", "City and countryside", ["Where do you live at the moment?", "What do you like about your area?", "If you could change one thing about your town, what would it be?"],
   "sp-c-city-a", "sp-c-city-b", "Here are two photographs of people spending time in different environments. Compare the photographs, and say what the advantages of each environment might be and how the people might be feeling.",
   "Where would you rather live? Why?",
   "How could life in cities be improved?", ["more green spaces", "fewer cars", "cheaper housing", "more cultural events", "better safety"],
   "Now decide which improvement would make the biggest difference.",
   ["Why do young people tend to move to cities?", "Can technology make rural life more attractive?", "Should governments limit the growth of large cities?"]),
 C("c-tech", "C1", "Technology and communication", ["How do you usually keep in touch with friends?", "How much time do you spend online each day?", "Has technology made your life easier?"],
   "sp-c-tech-a", "sp-c-tech-b", "Here are two photographs of people communicating in different ways. Compare the photographs, and say what the people might gain from communicating in these ways and what problems they might have.",
   "Which way of communicating do you find more satisfying? Why?",
   "How has technology changed everyday life?", ["shopping", "friendships", "work", "education", "health"],
   "Now decide in which area technology has had the most positive effect.",
   ["Are people more or less sociable because of technology?", "Should there be limits on how much personal data companies can collect?", "Is it possible to be too dependent on technology?"]),
 C("c-health", "C1", "Health and lifestyle", ["What do you do to relax?", "Do you think you have a healthy lifestyle?", "How do you usually spend your evenings?"],
   "sp-c-health-a", "sp-c-health-b", "Here are two photographs of people keeping fit in different ways. Compare the photographs, and say why the people might have chosen these activities and how they might benefit from them.",
   "Which activity would suit you better? Why?",
   "What could be done to encourage people to lead healthier lives?", ["free gym membership", "healthier school meals", "cycling lanes", "health education", "shorter working hours"],
   "Now decide which two measures would be most effective.",
   ["Is it the government's responsibility to keep people healthy?", "Why do people find it hard to change unhealthy habits?", "Has modern life made people more stressed?"]),
]

IMG_PROMPTS = {
 "sp-c-learn-a": "an adult attending an evening pottery class with a teacher and other students",
 "sp-c-learn-b": "a person learning alone at home with a laptop and headphones, taking notes at a kitchen table",
 "sp-c-holiday-a": "a family camping by a mountain lake with a tent and a small campfire",
 "sp-c-holiday-b": "a couple sightseeing in a busy historic European city square with a map",
 "sp-c-work-a": "a chef working in a busy restaurant kitchen with steam and pans",
 "sp-c-work-b": "a person working alone on a laptop in a quiet home office by a window",
 "sp-c-city-a": "people walking along a crowded city street at rush hour with tall buildings",
 "sp-c-city-b": "a person tending a vegetable garden in front of a small countryside cottage",
 "sp-c-tech-a": "two friends having a video call on laptops in different rooms",
 "sp-c-tech-b": "a group of friends talking and laughing around a cafe table without phones",
 "sp-c-health-a": "a group of people doing a yoga class in a bright studio",
 "sp-c-health-b": "a person running alone along a river path early in the morning",
}


def main():
    assert len(IELTS) == 20
    json.dump({"ielts": IELTS, "cam": CAM}, open(os.path.join(D, "speaking-en.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("szóbeli:", len(IELTS), "IELTS-témasor,", len(CAM), "Cambridge-feladatsor")


if __name__ == "__main__":
    main()
