/* Rövid edukációs anatómiai útmutató, nem személyre szabott orvosi vagy biomechanikai értékelés. */
export const MUSCLE_GUIDE = Object.freeze({
  chest: {
    hu: { title: 'Mellizmok', about: 'A mellkas elülső izmai többek között a kart a test előtt közelítő és nyomó mozdulatokban vesznek részt.', moves: 'Fekvőtámasz, mellkas előtti nyomás, tárogatás.', tip: 'A vállat kényelmes helyzetben tartsd; a mozdulatot kontrolláltan végezd.' },
    en: { title: 'Chest', about: 'The muscles at the front of the chest help move the arm toward the body and support pushing movements.', moves: 'Push-ups, chest presses, fly variations.', tip: 'Keep your shoulders comfortable and move with control.' },
  },
  shoulders: {
    hu: { title: 'Váll és lapockakörnyék', about: 'A váll körüli izmok segítik a kar emelését és forgatását, a lapockakörnyéki izmok pedig a vállöv mozgását.', moves: 'Oldalemelés, vállból nyomás, lapockamozgatás.', tip: 'Csak kényelmes mozgástartományban dolgozz; a súly ne kényszerítsen lendítésre.' },
    en: { title: 'Shoulders and shoulder blades', about: 'These muscles support lifting and rotating the arms and moving the shoulder blades.', moves: 'Lateral raises, shoulder presses, scapular movements.', tip: 'Use a comfortable range and avoid swinging heavy weights.' },
  },
  arms: {
    hu: { title: 'Karizmok', about: 'A bicepsz főként a könyök hajlításában, a tricepsz a nyújtásában vesz részt; az alkar segíti a fogást.', moves: 'Karhajlítás, tricepsznyújtás, húzó és nyomó gyakorlatok.', tip: 'A csukló maradjon semleges, és ne lendületből mozgasd a terhelést.' },
    en: { title: 'Arms', about: 'The biceps help bend the elbow, the triceps extend it, and the forearms support grip.', moves: 'Curls, triceps extensions, pushing and pulling.', tip: 'Keep the wrist neutral and avoid swinging the load.' },
  },
  back: {
    hu: { title: 'Hátizmok', about: 'A hát különböző izmai részt vesznek a kar húzó mozdulataiban, a lapockák mozgatásában és a törzs tartásában.', moves: 'Evezés, lehúzás, húzódzkodás, lapockagyakorlatok.', tip: 'A húzást ne rángatással indítsd; figyelj a stabil testhelyzetre.' },
    en: { title: 'Back', about: 'Back muscles contribute to pulling, shoulder-blade movement and supporting the torso.', moves: 'Rows, pulldowns, pull-ups, scapular exercises.', tip: 'Avoid jerking and maintain a stable position.' },
  },
  core: {
    hu: { title: 'Törzsizmok', about: 'A has- és törzsizmok segítenek a testhelyzet kontrollálásában, a törzs hajlításában és forgatásában.', moves: 'Plank, dead bug, oldalsó plank, Pallof-nyomás.', tip: 'Lélegezz folyamatosan; a hosszabb tartás nem ér többet, ha közben szétesik a testhelyzet.' },
    en: { title: 'Core', about: 'Core muscles help control posture and contribute to bending and rotating the trunk.', moves: 'Planks, dead bugs, side planks, Pallof presses.', tip: 'Keep breathing; longer holds are not useful if your position breaks down.' },
  },
  legs: {
    hu: { title: 'Comb és lábszár', about: 'A comb elülső és hátsó, valamint a lábszár izmai többek között a térd- és bokamozgásban, járásban és felállásban fontosak.', moves: 'Guggolás, fellépés, kitörés, vádliemelés.', tip: 'Stabil talppal, egyenletes tempóban dolgozz; válassz biztonságos, fájdalommentes mélységet.' },
    en: { title: 'Legs', about: 'Thigh and lower-leg muscles contribute to knee and ankle movement, walking and standing up.', moves: 'Squats, step-ups, lunges, calf raises.', tip: 'Use stable footing and a comfortable, pain-free range.' },
  },
  glutes: {
    hu: { title: 'Farizmok és csípőkörnyék', about: 'A farizmok segítik a csípő nyújtását és stabilizálását többek között járás, felállás és lépcsőzés közben.', moves: 'Csípőemelés, guggolás, fellépés, csípőből döntés.', tip: 'A csípő mozdulatát ne túlzott derékhomorítással helyettesítsd.' },
    en: { title: 'Glutes and hips', about: 'The glutes support hip extension and stability during walking, standing up and climbing stairs.', moves: 'Bridges, squats, step-ups, hip hinges.', tip: 'Avoid substituting excessive lower-back arching for hip movement.' },
  },
});

export const muscleGuide = (area, locale = 'hu') => MUSCLE_GUIDE[area]?.[locale === 'en' ? 'en' : 'hu'] || null;
