/* A GLB forrásneveit megőrző, ellenőrizhető részleges magyar anatómiai szótár.
   A névazonosítás NEM minősül független anatómiai/biomechanikai validációnak. */
const LABELS = Object.freeze([
  ['pectoralis major', 'Nagy mellizom'],
  ['pectoralis minor', 'Kis mellizom'],
  ['serratus anterior', 'Elülső fűrészizom'],
  ['latissimus dorsi', 'Széles hátizom'],
  ['trapezius', 'Csuklyásizom'],
  ['rhomboid major', 'Nagy rombuszizom'],
  ['rhomboid minor', 'Kis rombuszizom'],
  ['deltoid', 'Deltaizom'],
  ['supraspinatus', 'Tövis feletti izom'],
  ['infraspinatus', 'Tövis alatti izom'],
  ['subscapularis', 'Lapocka alatti izom'],
  ['teres major', 'Nagy görgetegizom'],
  ['teres minor', 'Kis görgetegizom'],
  ['biceps brachii', 'Kétfejű karizom'],
  ['triceps brachii', 'Háromfejű karizom'],
  ['brachialis', 'Karizom'],
  ['brachioradialis', 'Karorsócsonti izom'],
  ['rectus abdominis', 'Egyenes hasizom'],
  ['external oblique', 'Külső ferde hasizom'],
  ['internal oblique', 'Belső ferde hasizom'],
  ['gluteus maximus', 'Nagy farizom'],
  ['gluteus medius', 'Középső farizom'],
  ['gluteus minimus', 'Kis farizom'],
  ['rectus femoris', 'Egyenes combizom'],
  ['vastus lateralis', 'Külső vaskosizom'],
  ['vastus medialis', 'Belső vaskosizom'],
  ['biceps femoris', 'Kétfejű combizom'],
  ['semitendinosus', 'Félinas izom'],
  ['semimembranosus', 'Félhártyás izom'],
  ['gastrocnemius', 'Kétfejű lábikraizom'],
  ['soleus', 'Gázlóizom'],
  ['tibialis anterior', 'Elülső sípcsonti izom'],
  ['scapula', 'Lapocka'],
  ['clavicle', 'Kulcscsont'],
  ['sternum', 'Szegycsont'],
  ['humerus', 'Felkarcsont'],
  ['radius', 'Orsócsont'],
  ['ulna', 'Singcsont'],
  ['femur', 'Combcsont'],
  ['patella', 'Térdkalács'],
  ['tibia', 'Sípcsont'],
  ['fibula', 'Szárkapocscsont'],
  ['mandible', 'Állkapocs'],
  ['maxilla', 'Felső állcsont'],
]);

export function describeAnatomyMesh(rawName, layer = 'muscles') {
  const name = String(rawName || '').trim().slice(0, 180);
  const lower = name.toLocaleLowerCase('en');
  const side = /\bleft\b/.test(lower) ? 'bal' : /\bright\b/.test(lower) ? 'jobb' : null;
  const pair = LABELS.find(([english]) => lower.includes(english));
  return Object.freeze({
    sourceName: name || 'Névtelen elem',
    hungarianName: pair ? `${side ? (side === 'bal' ? 'Bal ' : 'Jobb ') : ''}${pair[1].toLocaleLowerCase('hu')}` : null,
    side,
    layer: layer === 'bones' ? 'bones' : 'muscles',
    status: 'illustrative',
    reviewedName: false,
  });
}

const searchable = value => String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu');

export function searchAnatomyNames(records, query, limit = 8) {
  const needle=searchable(query).trim();
  if(needle.length<2 || !Array.isArray(records))return [];
  const safeLimit=Math.max(1,Math.min(12,Number.isFinite(limit)?Math.floor(limit):8));
  return records.filter(item=>item && searchable(`${item.sourceName} ${item.hungarianName||''}`).includes(needle)).slice(0,safeLimit);
}
