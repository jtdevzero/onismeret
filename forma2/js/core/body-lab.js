/* Változatjelölt oktatási atlasz: sematikus információk, nem diagnózis vagy mért adat. */
export const BODY_LAB_VERSION = 1;
export const BODY_LAB = Object.freeze({
  joints: [
    { id:'shoulder', name:'Vállízület', zone:[53,65], what:'A kar és a törzs közötti mozgások egyik fő ízületi kapcsolata.', moves:'Karemelés, közelítés, távolítás és forgatás.', watch:'A karemelés legyen kontrollált és kényelmes.', exercises:['push_wall','shoulder_lateral_raise','wall_slide'] },
    { id:'elbow', name:'Könyök', zone:[34,119], what:'A felkar és az alkar közötti ízületi terület.', moves:'A könyök hajlítása és nyújtása; az alkar forgása külön ízületeket is érint.', watch:'Kerüld a hirtelen, lendületes véghelyzeteket.', exercises:['biceps_curl','push_knee','band_row'] },
    { id:'wrist', name:'Csukló', zone:[25,161], what:'Az alkar és a kéz közötti összetett ízületi régió.', moves:'Hajlítás, nyújtás és oldalirányú mozdulatok.', watch:'Támaszgyakorlatnál válassz kényelmes kéztartást.', exercises:['wrist_mobility','push_wall','push_full'] },
    { id:'spine', name:'Gerinc', zone:[80,122], what:'Csigolyákból és a köztük lévő kapcsolatokból álló mozgásszervi rendszer.', moves:'Hajlítás, nyújtás, oldalra hajlás és forgás.', watch:'A mozgást fokozatosan, kontrollált tartományban végezd.', exercises:['cat_cow','thoracic_rotation','bird_dog'] },
    { id:'hip', name:'Csípőízület', zone:[62,180], what:'A medence és a combcsont kapcsolatának mozgékony ízülete.', moves:'Hajlítás, nyújtás, oldalirányú mozgások és forgatás.', watch:'A csípő mozdulatát ne helyettesítsd túlzott derékhomorítással.', exercises:['glute_bridge','squat','hip_9090'] },
    { id:'knee', name:'Térdízület', zone:[64,230], what:'A comb és a lábszár közötti összetett ízületi kapcsolat.', moves:'Elsősorban hajlítás és nyújtás, kis mértékű járulékos forgással.', watch:'Válassz stabil talajt és kényelmes, fájdalommentes mozgástartományt.', exercises:['squat_box','split_squat','db_step_up'] },
    { id:'ankle', name:'Boka', zone:[66,271], what:'A lábszár és lábfej közötti ízületi régió.', moves:'Lábfej emelése és lefeszítése, a láb egyéb ízületeivel együtt irányváltások.', watch:'Egyensúlyi gyakorlatnál legyen biztonságos kapaszkodási lehetőség.', exercises:['ankle_rock','ankle_alphabet','calf_raise_double'] },
  ],
  bones: [
    { id:'skull', name:'Koponya', zone:[80,35], what:'A fej csontos váza; védi az agyat és támaszt ad az arc képleteinek.' },
    { id:'ribcage', name:'Bordakosár', zone:[80,104], what:'A bordák és a szegycsont a mellkas csontos szerkezetének részei.' },
    { id:'humerus', name:'Felkarcsont', zone:[37,101], what:'A váll és a könyök közötti hosszú csont.' },
    { id:'pelvis', name:'Medence', zone:[80,177], what:'A törzs és az alsó végtagok közötti csontos kapcsolatrendszer.' },
    { id:'femur', name:'Combcsont', zone:[68,215], what:'A csípő és a térd közötti hosszú csont.' },
    { id:'tibia', name:'Sípcsont', zone:[65,255], what:'A lábszár egyik fő teherviselő csontja.' },
  ],
  connective: [
    { id:'tendons', name:'Inak', zone:[121,111], what:'Az inak az izmok és a csontok között közvetítik az izomerő egy részét.', watch:'A hirtelen terhelésnövelés helyett fokozatos gyakorlás javasolt.' },
    { id:'ligaments', name:'Szalagok', zone:[94,232], what:'Az ízületi szalagok csontok között kapcsolódnak, és az ízület passzív stabilitásához járulnak hozzá.', watch:'A szalagokat nem lehet kameraképből állapotértékelni.' },
    { id:'cartilage', name:'Porc és ízületi felszínek', zone:[65,233], what:'Az ízületi porc a csontok ízületi felszíneit borítja.', watch:'Az alkalmazás nem állapít meg porckárosodást vagy kopást.' },
    { id:'fascia', name:'Kötőszöveti hálózat', zone:[80,146], what:'A kötőszövetek sokféle módon kapcsolják össze és veszik körül a szervezet képleteit.', watch:'A vizualizáció nem mutat valós szövetszerkezeti mérést.' },
  ],
  movements: [
    { id:'squat', name:'Guggolás', zone:[80,216], what:'Térd- és csípőhajlításból kontrollált felállás.', moves:'A csípő, térd és boka mozgása összehangolt.', watch:'A talp maradjon stabil és a mélység legyen kényelmes.', exercises:['squat_box','squat','goblet_squat'] },
    { id:'push', name:'Nyomás', zone:[80,99], what:'A karok a testtől elfelé fejtenek ki erőt.', moves:'Vállövi és könyökmozgások vesznek részt.', watch:'Ne áldozd fel a testhelyzetet a nagyobb ismétlésszámért.', exercises:['push_wall','push_full','chest_floor_press'] },
    { id:'pull', name:'Húzás', zone:[80,124], what:'A karok a test felé vagy a törzs mögé mozgatnak ellenállást.', moves:'A vállöv és a könyök összehangolt mozgása.', watch:'Csak biztonságosan rögzített eszközzel dolgozz.', exercises:['band_row','db_row','table_row_bent'] },
    { id:'hinge', name:'Csípőből döntés', zone:[80,178], what:'A törzs és a comb közötti szög csípőmozgással változik.', moves:'Csípőhajlítás és -nyújtás stabil törzzsel.', watch:'Kis tartományban kezdd, a gerinc kényelmes helyzetével.', exercises:['glute_bridge','db_rdl','hamstring_walkout'] },
    { id:'rotation', name:'Törzsforgás', zone:[80,134], what:'A törzs különböző szakaszai összehangoltan fordulnak.', moves:'A háti gerinc és a csípő mozgása is szerepet kaphat.', watch:'Ne erőltesd a fájdalmas véghelyzetet.', exercises:['open_book','thoracic_rotation','pallof_press'] },
  ],
});

export function bodyLabItems(layer) { return Array.isArray(BODY_LAB[layer]) ? BODY_LAB[layer] : []; }
export function bodyLabItem(layer, id) { return bodyLabItems(layer).find(item => item.id === id) || null; }
