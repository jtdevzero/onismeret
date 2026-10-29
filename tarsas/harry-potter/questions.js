/* Saját megfogalmazású, a nyolc film eseményeire épülő kérdések. */
(function (root) {
  'use strict';
  const films = ['A bölcsek köve', 'A Titkok Kamrája', 'Az azkabani fogoly', 'A Tűz Serlege', 'A Főnix Rendje', 'A Félvér Herceg', 'A Halál ereklyéi – 1. rész', 'A Halál ereklyéi – 2. rész'];
  const questions = [];
  function choice(film, text, options, explanation, image) {
    questions.push({ id: questions.length + 1, film, type: image ? 'picture' : 'choice', text, options, answer: 0, explanation, ...(image ? { image } : {}) });
  }
  function number(film, text, answer, explanation) {
    questions.push({ id: questions.length + 1, film, type: 'number', text, answer, explanation });
  }
  choice(1, 'Melyik házba osztja a Teszlek Süveg Harryt?', ['Griffendél', 'Mardekár', 'Hollóhát', 'Hugrabug'], 'Harry a Griffendél ház tagja lesz.');
  choice(1, 'Ki vezeti be Harryt először az Abszol útra?', ['Hagrid', 'Dumbledore', 'Piton', 'Ron'], 'Hagrid kíséri el Harryt az iskolai felszerelésekért.');
  choice(1, 'Melyik poszton játszik Harry a kviddicscsapatban?', ['Fogó', 'Őrző', 'Terelő', 'Hajtó'], 'Harry feladata az aranycikesz elkapása.');
  number(1, 'Hányadik születésnapján tudja meg Harry Hagridtól, hogy varázsló?', 11, 'Hagrid Harry tizenegyedik születésnapján érkezik meg.');
  choice(1, 'Melyik állatot kapja Harry Hagridtól ajándékba?', ['Hóbaglyot', 'Macskát', 'Varangyot', 'Patkányt'], 'Hedvig egy hóbagoly.', 'owl');
  choice(2, 'Ki figyelmezteti Harryt, hogy ne térjen vissza Roxfortba?', ['Dobby', 'Kreacher', 'Sirius', 'Lupin'], 'Dobby megpróbálja megakadályozni Harry visszatérését.');
  choice(2, 'Milyen lény él a Titkok Kamrájában?', ['Baziliszkusz', 'Sárkány', 'Hippogriff', 'Dementor'], 'A kamrában egy hatalmas baziliszkusz rejtőzik.');
  choice(2, 'Ki nyitja ki a kamrát Tom Denem befolyása alatt?', ['Ginny Weasley', 'Hermione Granger', 'Luna Lovegood', 'Cho Chang'], 'Tom Denem naplója Ginnyt keríti hatalmába.');
  number(2, 'Hány évvel korábbi eseményeket mutat meg Harrynek Tom Denem naplója?', 50, 'A napló ötven évvel korábbi roxforti eseményekhez viszi Harryt.');
  choice(2, 'Melyik tárgyat pusztítja el Harry egy baziliszkusz méregfogával?', ['Tom Denem naplóját', 'A Tekergők Térképét', 'A Teszlek Süveget', 'A Tűz Serlegét'], 'Harry a naplót döfi át a méregfoggal.', 'diary');
  choice(3, 'Ki Harry keresztapja?', ['Sirius Black', 'Remus Lupin', 'Arthur Weasley', 'Perselus Piton'], 'Sirius Black James Potter barátja és Harry keresztapja.');
  choice(3, 'Milyen állat alakját veszi fel Harry patrónusa?', ['Szarvas', 'Farkas', 'Vidra', 'Ló'], 'Harry patrónusa egy szarvasbika.');
  choice(3, 'Ki tanítja Harryt a patrónusbűbájra?', ['Remus Lupin', 'Minerva McGalagony', 'Gilderoy Lockhart', 'Dolores Umbridge'], 'Lupin segít Harrynek védekezni a dementorok ellen.');
  number(3, 'Hány fordulatot teker Hermione az időnyerőn a kórházi szárnyban?', 3, 'Dumbledore tanácsára Hermione három fordulatot teker.');
  choice(3, 'Melyik tárgyon követhetők a Roxfortban mozgó emberek?', ['A Tekergők Térképén', 'Egy roxforti órarenden', 'Tom Denem naplójában', 'A Reggeli Prófétában'], 'A Tekergők Térképe nevekkel jelzi az emberek helyét.', 'map');
  choice(4, 'Melyik iskolából érkezik Viktor Krum?', ['Durmstrang', 'Beauxbatons', 'Roxfort', 'Ilvermorny'], 'Viktor Krum a Durmstrang bajnoka.');
  choice(4, 'Ki hal meg a temetőben Harry mellett?', ['Cedric Diggory', 'Viktor Krum', 'Neville Longbottom', 'Percy Weasley'], 'Cedricet Voldemort parancsára ölik meg.');
  choice(4, 'Ki rejtőzik Rémszem Mordon alakjában?', ['Ifjabb Barty Kupor', 'Lucius Malfoy', 'Peter Pettigrew', 'Igor Karkarov'], 'Ifjabb Barty Kupor százfűlé-főzettel veszi fel Mordon alakját.');
  number(4, 'Hány bajnok versenyez ténylegesen a Trimágus Tusán Harry kiválasztása után?', 4, 'Harry, Cedric, Fleur és Viktor: összesen négy bajnok.');
  choice(4, 'Melyik tárgy választja ki a Trimágus Tusa bajnokait?', ['A Tűz Serlege', 'A Teszlek Süveg', 'A Merengő', 'A Trimágus Kupa'], 'A Tűz Serlege adja ki a bajnokok nevét.', 'goblet');
  choice(5, 'Mi a Harry által tanított titkos diákkör neve?', ['Dumbledore Serege', 'A Főnix Rendje', 'A Tekergők', 'A Halálfalók'], 'A diákok Dumbledore Serege néven gyakorolnak.');
  choice(5, 'Hol tartják a titkos védekezésórákat?', ['A Szükség Szobájában', 'A Titkok Kamrájában', 'A Nagyteremben', 'A Bagolyházban'], 'A Szükség Szobája biztosít helyet a gyakorláshoz.');
  choice(5, 'Ki öli meg Sirius Blacket?', ['Bellatrix Lestrange', 'Lucius Malfoy', 'Dolores Umbridge', 'Perselus Piton'], 'Bellatrix támadása után Sirius átesik a fátylon.');
  number(5, 'Hány diák indul Londonba Harryvel együtt, Harryt is beleszámítva?', 6, 'Harry, Ron, Hermione, Ginny, Neville és Luna indul el.');
  choice(5, 'Milyen tárggyal bünteti Umbridge Harryt, amely sebet ejt a kezén?', ['Egy különleges írótollal', 'Egy varázspálcával', 'Egy ezüstkéssel', 'Egy megbűvölt gyűrűvel'], 'A büntetőtoll a leírt szavakat a kézfejbe vési.', 'quill');
  choice(6, 'Ki a Félvér Herceg?', ['Perselus Piton', 'Tom Denem', 'Horatius Lumpsluck', 'Albus Dumbledore'], 'Piton maga árulja el Harrynek, hogy ő a Félvér Herceg.');
  choice(6, 'Kitől próbál Dumbledore és Harry egy fontos emléket megszerezni?', ['Horatius Lumpslucktól', 'Rubeus Hagridtól', 'Minerva McGalagonytól', 'Sybill Trelawney-tól'], 'Lumpsluck emléke árulja el Tom Denem horcruxok iránti érdeklődését.');
  choice(6, 'Melyik tárgyon keresztül jutnak be a halálfalók Roxfortba?', ['A volt-nincs szekrényen', 'A Merengőn', 'Az Edevis tükrén', 'Az időnyerőn'], 'Draco megjavítja a volt-nincs szekrényt.');
  number(6, 'Hány részre akarja osztani a lelkét Tom Denem Lumpsluck emlékében?', 7, 'Hét lélekrészről beszél: hat horcrux és a testében maradó rész.');
  choice(6, 'Melyik bájitalból nyer Harry egy kis üveggel Lumpsluck óráján?', ['Felix Felicis', 'Százfűlé-főzet', 'Veritaserum', 'Amortentia'], 'A Felix Felicis folyékony szerencsét ad.', 'potion');
  choice(7, 'Ki pusztítja el Mardekár medálját?', ['Ron Weasley', 'Harry Potter', 'Hermione Granger', 'Neville Longbottom'], 'Ron a Griffendél kardjával pusztítja el a medált.');
  choice(7, 'Ki menti ki Harryéket a Malfoy-kúriából?', ['Dobby', 'Kreacher', 'Lupin', 'McGalagony'], 'Dobby hoppanálva szabadítja ki a foglyokat.');
  choice(7, 'Kinek az esküvőjén törik meg a védelmet a halálfalók?', ['Bill és Fleur', 'Ron és Hermione', 'Harry és Ginny', 'Lupin és Tonks'], 'Bill Weasley és Fleur Delacour esküvőjén érkezik a figyelmeztetés.');
  number(7, 'Hány testvérről szól A három testvér meséje?', 3, 'A mese a három Peverell testvérről és az ereklyékről szól.');
  choice(7, 'Melyik horcruxot viselik felváltva a bujkálás során?', ['Mardekár medálját', 'Hugrabug kelyhét', 'Hollóháti Hedvig diadémját', 'Tom Denem naplóját'], 'A medál negatívan hat arra, aki viseli.', 'locket');
  choice(8, 'Ki pusztítja el Naginit?', ['Neville Longbottom', 'Ron Weasley', 'Draco Malfoy', 'Seamus Finnigan'], 'Neville Griffendél kardjával végez Naginivel.');
  choice(8, 'Melyik bankból menekülnek el egy sárkány hátán?', ['Gringotts', 'A Varázslóbank', 'A Roxforti Kincstár', 'A Mágiaügyi Bank'], 'A Gringotts mélyén őrzött sárkány segíti a menekülést.');
  choice(8, 'Hol található Hollóháti Hedvig diadémja?', ['A Szükség Szobájában', 'Dumbledore irodájában', 'A Tiltott Rengetegben', 'A Bagolyházban'], 'A diadém az elrejtett tárgyakkal teli Szükség Szobájában van.');
  number(8, 'Hány évvel később játszódik a film pályaudvari zárójelenete?', 19, 'A zárójelenet tizenkilenc évvel a csata után játszódik.');
  choice(8, 'Melyik három tárgy együtt a Halál ereklyéi?', ['A pálca, a kő és a köpeny', 'A kard, a medál és a kehely', 'A napló, a gyűrű és a diadém', 'A térkép, a seprű és az időnyerő'], 'A bodzapálca, a feltámadás köve és a láthatatlanná tévő köpeny alkotják az ereklyéket.', 'hallows');
  const api = { films, questions };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HP_DATA = api;
})(typeof window === 'undefined' ? globalThis : window);
