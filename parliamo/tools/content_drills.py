"""Célzott gyakorlók az olaszhoz és a spanyolhoz → data/drills-it.json, data/drills-es.json.
Formátum: (mondat ___-sal, helyes, [lehetőségek], magyarázat). Az angolé a content_en.py-ban van."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

IT = {
"cong": ("Kötőmód", "Congiuntivo vagy kijelentő mód? Vélemény, érzelem, kötőszavak után.", [
  ("Penso che lui ___ ragione.", "abbia", ["abbia", "ha", "avrà"], "Vélemény (penso che) után kötőmód: abbia."),
  ("Sono sicuro che lei ___ a casa.", "è", ["è", "sia", "fosse"], "Bizonyosság (sono sicuro) után kijelentő mód."),
  ("Spero che tu ___ bene.", "stia", ["stia", "stai", "starai"], "Remény (spero che) után kötőmód: stia."),
  ("Benché ___ stanco, continua a lavorare.", "sia", ["sia", "è", "era"], "A benché (bár) után mindig kötőmód."),
  ("Vorrei che tu ___ con me.", "venissi", ["venissi", "vieni", "venga"], "Vorrei che + kötőmód múlt idő (imperfetto)."),
  ("È importante che voi ___ in orario.", "arriviate", ["arriviate", "arrivate", "arriverete"], "È importante che + kötőmód."),
  ("So che loro ___ in Italia.", "vivono", ["vivono", "vivano", "vivessero"], "Tudás (so che) után kijelentő mód."),
  ("Se ___ più tempo, viaggerei.", "avessi", ["avessi", "ho", "abbia"], "Nem valós feltétel: se + congiuntivo imperfetto."),
  ("Credo che il film ___ già iniziato.", "sia", ["sia", "è", "fosse"], "Credo che + kötőmód; az iniziare múltja essere-vel: sia iniziato."),
  ("Prima che tu ___, chiamami.", "parta", ["parta", "parti", "partirai"], "A prima che után kötőmód."),
]),
"impp": ("Imperfetto vagy passato prossimo?", "Folyamatos háttér, szokás – vagy lezárt, egyszeri esemény?", [
  ("Quando ero piccolo, ___ al mare ogni estate.", "andavo", ["andavo", "sono andato"], "Rendszeres szokás a múltban: imperfetto."),
  ("Ieri ___ un film bellissimo.", "ho visto", ["ho visto", "vedevo"], "Egyszeri, lezárt esemény konkrét időponttal: passato prossimo."),
  ("Mentre ___, è suonato il telefono.", "cucinavo", ["cucinavo", "ho cucinato"], "Háttércselekvés, amit egy esemény megszakít: imperfetto."),
  ("La casa ___ grande e luminosa.", "era", ["era", "è stata"], "Leírás a múltban: imperfetto."),
  ("L'anno scorso ___ a Roma tre volte.", "sono stato", ["sono stato", "ero"], "Megszámolt, lezárt események: passato prossimo."),
  ("Da bambina ___ i capelli lunghi.", "avevo", ["avevo", "ho avuto"], "Állapot a múltban: imperfetto."),
  ("A un certo punto ___ a piovere.", "è cominciato", ["è cominciato", "cominciava"], "Hirtelen esemény (a un certo punto): passato prossimo."),
  ("Ogni sera mio nonno ___ il giornale.", "leggeva", ["leggeva", "ha letto"], "Ismétlődő cselekvés (ogni sera): imperfetto."),
  ("Stamattina ___ alle sette.", "mi sono svegliato", ["mi sono svegliato", "mi svegliavo"], "Egyszeri esemény ma reggel: passato prossimo."),
  ("Non sono uscito perché ___ male.", "stavo", ["stavo", "sono stato"], "Ok, háttér-állapot: imperfetto."),
]),
}

ES = {
"serestar": ("Ser vagy estar?", "Állandó tulajdonság vagy állapot és hely?", [
  ("Mi hermana ___ médica.", "es", ["es", "está"], "Foglalkozás: ser."),
  ("Hoy ___ muy cansado.", "estoy", ["estoy", "soy"], "Pillanatnyi állapot: estar."),
  ("Madrid ___ en el centro de España.", "está", ["está", "es"], "Földrajzi hely: estar."),
  ("La fiesta ___ en mi casa.", "es", ["es", "está"], "Esemény helyszíne kivétel: ser."),
  ("___ las tres de la tarde.", "Son", ["Son", "Están"], "Időpont: ser."),
  ("La sopa ___ fría.", "está", ["está", "es"], "Állapot (most hideg): estar."),
  ("Ellos ___ de Argentina.", "son", ["son", "están"], "Származás: ser."),
  ("¿Cómo ___ tus padres?", "están", ["están", "son"], "Hogylét: estar."),
  ("El libro ___ muy interesante.", "es", ["es", "está"], "Jellemző tulajdonság: ser."),
  ("La tienda ___ cerrada los domingos.", "está", ["está", "es"], "Állapot (zárva van): estar."),
]),
"pretimp": ("Indefinido vagy imperfecto?", "Lezárt esemény vagy múltbeli háttér, szokás?", [
  ("Ayer ___ al cine con Ana.", "fui", ["fui", "iba"], "Egyszeri, lezárt esemény: indefinido."),
  ("Cuando era niño, ___ en un pueblo.", "vivía", ["vivía", "viví"], "Hosszabb múltbeli állapot: imperfecto."),
  ("Mientras ___ la tele, sonó el teléfono.", "veía", ["veía", "vi"], "Háttércselekvés: imperfecto."),
  ("El año pasado ___ a México.", "viajé", ["viajé", "viajaba"], "Lezárt esemény konkrét időben: indefinido."),
  ("Todos los veranos ___ a la playa.", "íbamos", ["íbamos", "fuimos"], "Rendszeres szokás: imperfecto."),
  ("De repente ___ a llover.", "empezó", ["empezó", "empezaba"], "Hirtelen esemény: indefinido."),
  ("La casa ___ muy bonita.", "era", ["era", "fue"], "Leírás a múltban: imperfecto."),
  ("Anoche ___ muy tarde.", "llegué", ["llegué", "llegaba"], "Egyszeri esemény tegnap este: indefinido."),
]),
"porpara": ("Por vagy para?", "Cél, címzett, határidő (para) – ok, út, csere, időtartam (por).", [
  ("Este regalo es ___ ti.", "para", ["para", "por"], "Címzett: para."),
  ("Gracias ___ tu ayuda.", "por", ["por", "para"], "Ok (köszönet valamiért): por."),
  ("Estudio español ___ trabajar en Madrid.", "para", ["para", "por"], "Cél: para + főnévi igenév."),
  ("Paseamos ___ el parque.", "por", ["por", "para"], "Mozgás valamin keresztül: por."),
  ("Necesito el informe ___ el lunes.", "para", ["para", "por"], "Határidő: para."),
  ("Pagué veinte euros ___ la camisa.", "por", ["por", "para"], "Csere, ár: por."),
  ("Salimos ___ Sevilla mañana.", "para", ["para", "por"], "Úti cél: para."),
  ("Te llamo ___ teléfono.", "por", ["por", "para"], "Eszköz, mód: por."),
]),
}


def dump(name, data):
    out = {k: {"title": t, "desc": d, "items": [{"q": q, "a": a, "o": o, "why": w} for q, a, o, w in items]} for k, (t, d, items) in data.items()}
    for v in out.values():
        for i in v["items"]:
            assert i["a"] in i["o"] and "___" in i["q"], i
    (ROOT / "data" / f"{name}.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


if __name__ == "__main__":
    dump("drills-it", IT)
    dump("drills-es", ES)
    print("olasz és spanyol gyakorlók kész")
