/* Vágyjackpot: pure game rules shared by the browser and tests. */
(function (root) {
  'use strict';
  const categories = [
    { id: 'kiss', name: 'Csók', symbol: '♡', tags: ['erintes'], tasks: [
      'Adj egy gyengéd csókot a másik arcára.', 'Csókoljátok meg egymás kézfejét.',
      'Válasszatok közösen egy helyet egy finom csóknak.', 'Kérdezd meg, milyen csók esne most jól a másiknak.',
      'Búcsúcsók helyett találjatok ki egy üdvözlőcsókot.', 'Mosolyogjatok egymásra, majd váltsatok egy csókot.'
    ] },
    { id: 'hug', name: 'Ölelés', symbol: '∞', tags: ['erintes'], tasks: [
      'Öleljétek meg egymást úgy, ahogyan most jólesik.', 'Bújjatok össze egy közösen választott helyen.',
      'Kérdezd meg, milyen ölelésre vágyik a másik.', 'Simítsd végig a másik hátát egy ölelés közben.',
      'Fogjátok meg egymás kezét, és hajoljatok közelebb.', 'Dőljetek egymás vállára egy csendes pillanatra.'
    ] },
    { id: 'massage', name: 'Masszázs', symbol: '✧', tags: ['erintes'], tasks: [
      'Masszírozd meg finoman a másik vállát.', 'Kényeztesd a másik tenyerét gyengéd mozdulatokkal.',
      'Kérdezd meg, hol esne most jól egy kis masszázs.', 'Válasszatok egymásnak egy kényelmes masszázspózt.',
      'A másik mutassa meg, milyen erősségű érintés jóleső.', 'Cseréljetek szerepet egy rövid kézmasszázs után.'
    ] },
    { id: 'compliment', name: 'Bók', symbol: '★', tags: [], tasks: [
      'Mondd el, mi fogott meg először a másikban.', 'Dicsérd meg a másik egy apró, kedves szokását.',
      'Súgj egy őszinte bókot a másiknak.', 'Fejezd be: attól vagy különleges nekem, hogy…',
      'Meséld el, mikor találtad legutóbb ellenállhatatlannak a másikat.', 'Mondj valamit, amit ma különösen szépnek látsz a másikban.'
    ] },
    { id: 'moment', name: 'Közös pillanat', symbol: '☾', tags: [], tasks: [
      'Válasszatok egy dalt, ami kettőtökről szólhatna.', 'Idézzetek fel egy közös, nevettető emléket.',
      'Nézzetek egymás szemébe, amíg mindkettőtöknek jólesik.', 'Tervezzetek egy apró meglepetést a következő randira.',
      'Mondjatok egy-egy dolgot, amiért hálásak vagytok ma.', 'Találjatok ki egy csak kettőtöknek szóló jelszót.'
    ] },
    { id: 'surprise', name: 'Meglepetés', symbol: '◇', tags: [], tasks: [
      'Válasszatok egymásnak egy kedves becenevet erre az estére.', 'Kérdezd meg, milyen apró figyelmesség esne most jól.',
      'Ajánlj fel egy közösen választott szívességet holnapra.', 'Találjatok ki egy új randiötletet a lakásban.',
      'A másik válasszon zenét a következő körhöz.', 'Írjatok le szóban egy álombeli közös estét.'
    ] }
  ];
  const tags = new Set(['anal','oral','testnedv','fajdalom','kotozes','foto','szerep','jatekszer','harmadik','mult','erintes','meztelen','pozicio']);
  function validOptions(o) {
    return !!o && typeof o.reward === 'string' && !!o.reward.trim() && o.reward.length <= 140 &&
      Array.isArray(o.tags) && o.tags.every(t => tags.has(t)) && Array.isArray(o.custom) &&
      o.custom.length <= 60 && categories.every(k => o.custom.filter(c => c?.category === k.id).length <= 10) && o.custom.every(c => c && categories.some(k => k.id === c.category) &&
        typeof c.t === 'string' && !!c.t.trim() && c.t.length <= 110);
  }
  function create(o, excluded) {
    if (!validOptions(o)) throw Error('Érvénytelen jackpotbeállítás.');
    const allowed = ts => !ts.some(t => excluded.has(t));
    const pools = categories.map(c => [...new Set([
      ...(allowed(c.tags) ? c.tasks : []),
      ...(allowed([...c.tags, ...o.tags]) ? o.custom.filter(x => x.category === c.id).map(x => x.t) : [])
    ])]);
    return { pools, reward: allowed(o.tags) ? o.reward.trim() : null,
      blocked: pools.some(p => !p.length) || !allowed(o.tags), result: null, rolling: false, rollAt: 0, rolls: 0, jackpots: 0 };
  }
  function index(n, rng) { return Math.min(n - 1, Math.max(0, Math.floor(rng() * n))); }
  function roll(state, rng = Math.random) {
    if (state.blocked) throw Error('Előbb módosítsátok a feladatokat vagy a jutalmat.');
    const faces = Array.from({length: 3}, () => index(6, rng));
    const counts = faces.map(f => faces.filter(x => x === f).length);
    if (counts[0] === 3) return { faces, kind: 'jackpot', tasks: [state.reward], chosen: 0 };
    const pair = counts.indexOf(2);
    const category = pair >= 0 ? faces[pair] : faces[index(3, rng)];
    const pool = state.pools[category];
    const first = index(pool.length, rng);
    const tasks = [pool[first]];
    if (pair >= 0 && pool.length > 1) {
      const others = pool.filter((_, i) => i !== first);
      tasks.push(others[index(others.length, rng)]);
    }
    return { faces, kind: pair >= 0 ? 'pair' : 'task', tasks, chosen: tasks.length === 1 ? 0 : null };
  }
  const api = { categories, validOptions, create, roll };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PAIR_JACKPOT = api;
})(typeof window === 'undefined' ? globalThis : window);
