/* XV. Munka és célok — Utrechti munkahelyi bevonódás skála (UWES-9), Rövid Grit-skála (Grit-S), Rövid „Almost Perfect” skála (SAPS).
   A magyar szöveg saját fordítás. Az UWES és a Grit-S nem kereskedelmi célra ingyenesen használható. */
const UWES_SCALE=[{v:0,l:'soha'},{v:1,l:'szinte soha · évente néhányszor'},{v:2,l:'ritkán · havonta egyszer'},{v:3,l:'néha · havonta néhányszor'},{v:4,l:'gyakran · hetente'},{v:5,l:'nagyon gyakran · hetente többször'},{v:6,l:'mindig · minden nap'}];
const GRIT_SCALE=[{v:1,l:'egyáltalán nem jellemző rám'},{v:2,l:'nem nagyon jellemző'},{v:3,l:'kissé jellemző'},{v:4,l:'nagyrészt jellemző'},{v:5,l:'nagyon jellemző rám'}];
const SAPS_SCALE=[{v:1,l:'egyáltalán nem értek egyet'},{v:2,l:'nem értek egyet'},{v:3,l:'inkább nem'},{v:4,l:'semleges'},{v:5,l:'inkább igen'},{v:6,l:'egyetértek'},{v:7,l:'teljesen egyetértek'}];

/* ═══════════ 1. UWES-9 — MUNKAHELYI BEVONÓDÁS ═══════════ */
(function(){
/* Schaufeli & Bakker (2003) kézikönyv, UWES-9 összátlag: ≤1,77 nagyon alacsony · ≤2,88 alacsony · ≤4,66 átlagos · ≤5,50 magas · fölötte nagyon magas */
const band=m=>m>5.5?{l:'Nagyon magas bevonódás',c:'#10b981'}:m>4.66?{l:'Magas bevonódás',c:'#34d399'}:m>2.88?{l:'Átlagos bevonódás',c:'#60a5fa'}:m>1.77?{l:'Alacsony bevonódás',c:'#f59e0b'}:{l:'Nagyon alacsony bevonódás',c:'#e11d48'};
const C={VI:{name:'Lendület',color:'#d4a017',d:'energia és kitartás munka közben'},DE:{name:'Elkötelezettség',color:'#10b981',d:'lelkesedés, büszkeség, értelem'},AB:{name:'Elmélyülés',color:'#2563eb',d:'teljes figyelem, „flow”'}};
makeTest({
  id:'uwes',key:'uwes9-responses-v1',name:'Munkahelyi bevonódás (UWES-9)',c1:'#10b981',c2:'#d4a017',
  tab:'Bevonódás',tabSub:'UWES-9 · 9 item',scale:UWES_SCALE,
  header:{status:'valid',statusText:'Validált skála · Schaufeli, Bakker & Salanova (2006)',
    eyebrow:'Utrecht Work Engagement Scale · rövid, 9 tételes változat',
    title:'Mennyire <em style="color:#10b981">töltődsz</em> a munkádban',
    lead:'A munkahelyi bevonódás a kiégés pozitív ellentéte: energikus, elkötelezett, elmélyült viszony a munkához. Három összetevője a <strong>lendület</strong>, az <strong>elkötelezettség</strong> és az <strong>elmélyülés</strong>. A vállalkozói munka, a tanulás vagy a fő elfoglaltságod is munkának számít.',
    intro:'<p><strong>Kitöltés:</strong> milyen gyakran érzed így magad a munkádban?</p><p>Eredmény: 0–6 átlag. A kézikönyv tájékozódó sávjai (nem magyar mintán): 2,88 alatt alacsony, 2,89–4,66 átlagos, 4,66 felett magas.</p>'},
  sections:[{title:'A munkádban',desc:'',items:[
    {s:'VI',t:'Munka közben csak úgy árad belőlem az energia.'},
    {s:'VI',t:'A munkámban erősnek és életerősnek érzem magam.'},
    {s:'DE',t:'Lelkes vagyok a munkámmal kapcsolatban.'},
    {s:'DE',t:'A munkám inspirál.'},
    {s:'VI',t:'Reggel, amikor felkelek, kedvem van dolgozni menni.'},
    {s:'AB',t:'Boldog vagyok, amikor intenzíven dolgozom.'},
    {s:'DE',t:'Büszke vagyok arra a munkára, amit végzek.'},
    {s:'AB',t:'Elmerülök a munkámban.'},
    {s:'AB',t:'Munka közben elragad a lendület.'}]}],
  score(R){const o={total:H.r2(R.allMean())};Object.keys(C).forEach(k=>o[k]=H.r2(R.mean(k)));return o;},
  sum(s){return {h:band(s.total).l,d:Object.assign({total:['Munkahelyi bevonódás (UWES-9)',s.total,0,6]},Object.fromEntries(Object.keys(C).map(k=>[k,[C[k].name,s[k],0,6]])))};},
  render(R,s){
    const b=band(s.total),ks=Object.keys(C).sort((x,y)=>s[x]-s[y]),lo=ks[0];
    return `<div class="res-eyebrow">Eredmény · UWES-9</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">Összátlag: <strong>${s.total.toFixed(2)}</strong> / 6.</p>
      ${H.bars('Három <em>összetevő</em>',[{title:'',color:b.c,rows:Object.keys(C).map(k=>({name:C[k].name+' <span style="color:var(--ink-lite-muted);font-size:12px">· '+C[k].d+'</span>',val:s[k].toFixed(1),unit:'/6',pct:s[k]/6*100,color:C[k].color}))}])}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>4.66?'<p>A munkád most energiát ad: lelkes vagy, elmélyülsz benne, és szívesen kezded a napot. Ez a kutatások szerint jobb teljesítménnyel és jobb egészséggel jár. Figyelj arra, hogy a magas bevonódás mellett is legyen határ, mert a túlzásba vitt munka a bevonódott embert is kimerítheti.</p>':s.total>2.88?'<p>Átlagos bevonódás: vannak részei a munkádnak, amelyek töltenek, és vannak, amelyek nem. Érdemes megnézni, melyik összetevő a leggyengébb.</p>':'<p>A munkád most kevés energiát ad. Ez lehet átmeneti (rossz időszak, túlterhelés), de ha tartós, érdemes összevetni a kiégés-kérdőívvel: ha ott magas, a kimerültség, ha alacsony, inkább az érdeklődés vagy az értelem hiányzik.</p>'},
        s[ks[2]]-s[lo]>=1?{h:'A leggyengébb összetevő: '+C[lo].name,color:C[lo].color,html:lo==='VI'?'<p>A lendület hiányzik: a munka fáraszt, nehezen indulsz. Ez gyakran terhelési vagy alvási kérdés (lásd: CBI, SCI).</p>':lo==='DE'?'<p>Az elkötelezettség hiányzik: kevés a lelkesedés és a büszkeség. Ez gyakran az értelem vagy az elismerés hiánya; érdemes megnézni, mennyire illeszkedik a munka az értékeidhez (PVQ-21).</p>':'<p>Az elmélyülés hiányzik: ritkán kerülsz flow-ba. Ennek gyakori oka a sok megszakítás és a párhuzamos feladat; egy-két zavartalan munkablokk naponta sokat segít.</p>'}:null
      ])}
      ${H.refs(['<strong>Schaufeli, W. B., Bakker, A. B., & Salanova, M. (2006).</strong> The measurement of work engagement with a short questionnaire: A cross-national study. <em>Educational and Psychological Measurement, 66</em>(4), 701–716.',
        '<strong>Schaufeli, W. B., & Bakker, A. B. (2003).</strong> <em>Utrecht Work Engagement Scale: Preliminary manual.</em> Utrecht University, Occupational Health Psychology Unit.'])}`;
  }
});
})();

/* ═══════════ 2. GRIT-S — KITARTÁS ═══════════ */
(function(){
const band=m=>m>=4?{l:'Magas kitartás',c:'#34d399'}:m>=3?{l:'Közepes kitartás',c:'#60a5fa'}:{l:'Alacsony kitartás',c:'#f59e0b'};
const C={CI:{name:'Az érdeklődés állandósága',color:'#7c3aed'},PE:{name:'Erőfeszítés kitartása',color:'#d4a017'}};
makeTest({
  id:'grit',key:'grit-responses-v1',name:'Kitartás (Grit-S)',c1:'#d4a017',c2:'#7c3aed',
  tab:'Kitartás',tabSub:'Grit-S · 8 item',scale:GRIT_SCALE,
  header:{status:'valid',statusText:'Validált skála · Duckworth & Quinn (2009)',
    eyebrow:'Short Grit Scale · Angela L. Duckworth & Patrick D. Quinn',
    title:'Mennyire <em style="color:#d4a017">tartasz ki</em> a céljaid mellett',
    lead:'A grit (állhatatosság) a hosszú távú célok iránti <strong>kitartás</strong> és <strong>szenvedély</strong> keveréke. Két összetevője: mennyire marad ugyanaz az érdeklődésed hónapokon, éveken át, és mennyire viszed végig az erőfeszítést akadályok ellenére.',
    intro:'<p><strong>Kitöltés:</strong> mennyire jellemzőek rád az alábbi állítások? Az érdeklődés állandóságára vonatkozó négy állítás fordított pontozású.</p><p>Eredmény: 1–5 átlag. Tájékozódó sávok: 3 alatt alacsony, 4 felett magas.</p>'},
  sections:[{title:'8 állítás',desc:'',items:[
    {s:'CI',t:'Az új ötletek és projektek néha elterelik a figyelmemet a korábbiakról.',r:true},
    {s:'PE',t:'A kudarcok nem vesznek el a kedvemtől.'},
    {s:'CI',t:'Előfordult, hogy egy ideig megszállottan foglalkoztam egy ötlettel vagy projekttel, de aztán elvesztettem iránta az érdeklődésemet.',r:true},
    {s:'PE',t:'Keményen dolgozom.'},
    {s:'CI',t:'Gyakran kitűzök egy célt, de később inkább egy másikat kezdek követni.',r:true},
    {s:'CI',t:'Nehezen tudok fókuszban maradni olyan projekteknél, amelyek befejezése néhány hónapnál tovább tart.',r:true},
    {s:'PE',t:'Amit elkezdek, azt befejezem.'},
    {s:'PE',t:'Szorgalmas vagyok.'}]}],
  score(R){return {total:H.r2(R.allMean()),CI:H.r2(R.mean('CI')),PE:H.r2(R.mean('PE'))};},
  sum(s){return {h:band(s.total).l,d:{total:['Kitartás (Grit-S)',s.total,1,5],CI:[C.CI.name,s.CI,1,5],PE:[C.PE.name,s.PE,1,5]}};},
  render(R,s){
    const b=band(s.total),gap=s.PE-s.CI;
    return `<div class="res-eyebrow">Eredmény · Grit-S</div>
      <h2 class="res-title"><em>${b.l}</em></h2>
      <p class="res-lead">Átlag: <strong>${s.total.toFixed(2)}</strong> / 5.</p>
      ${H.bars('Két <em>összetevő</em>',[{title:'',color:b.c,rows:['CI','PE'].map(k=>({name:C[k].name,val:s[k].toFixed(1),unit:'/5',pct:(s[k]-1)/4*100,color:C[k].color}))}])}
      ${H.interp('Mit <em>jelent</em>',[
        {h:'Az eredmény',color:b.c,html:s.total>=4?'<p>Hosszú távon is kitartasz a céljaid mellett. Ez a kutatásokban a nehéz, sokéves célok (képzés, vállalkozás, sport) elérésével jár együtt.</p>':s.total>=3?'<p>Közepes kitartás: bizonyos céljaidat végigviszed, másokat elengedsz. Ez önmagában nem baj: nem minden célt érdemes megtartani.</p>':'<p>A céljaid gyakran váltják egymást, vagy az erőfeszítés hamar elfogy. Ez lehet életszakasz (keresés, sok új lehetőség), de érdemes megnézni, mi szakítja meg a folyamatot.</p>'},
        Math.abs(gap)>=0.75?{h:gap>0?'Szorgalom van, az irány változik':'Az érdeklődés stabil, az erőfeszítés hullámzik',html:gap>0?'<p>Keményen dolgozol, de az érdeklődésed gyakrabban vált. Ez sokszor az új ötletek vonzása: a kezdés izgalmasabb, mint a folytatás. Segít, ha az új ötleteket egy listára írod, és csak egy-egy lezárt projekt után választasz közülük. Ha a fókuszvesztés gyerekkor óta jellemző, az ASRS-t is érdemes kitölteni.</p>':'<p>Tudod, mi érdekel hosszú távon, de az erőfeszítés hullámzik. Ilyenkor a külső struktúra segít a legtöbbet: rögzített munkablokkok, határidők, elszámolási társ.</p>'}:null,
        {h:'Egy fontos árnyalat',html:'<p>A grit nem mindig erény: a rossz cél melletti kitartás veszteség. A kutatások szerint a grit kevesebbet magyaráz, mint amit a népszerű könyvek állítanak, és nagyrészt átfed a lelkiismeretességgel (Big Five). Érdemes inkább azt kérdezni: melyik célom érdemli meg a kitartást?</p>'}
      ])}
      ${H.refs(['<strong>Duckworth, A. L., & Quinn, P. D. (2009).</strong> Development and validation of the Short Grit Scale (Grit-S). <em>Journal of Personality Assessment, 91</em>(2), 166–174.',
        '<strong>Credé, M., Tynan, M. C., & Harms, P. D. (2017).</strong> Much ado about grit: A meta-analytic synthesis of the grit literature. <em>Journal of Personality and Social Psychology, 113</em>(3), 492–511.'])}`;
  }
});
})();

/* ═══════════ 3. SAPS — PERFEKCIONIZMUS ═══════════ */
(function(){
/* Rice, Richardson & Tueller (2014): magas mérce (S) és diszkrepancia (D), alskálánként 4–28. A profilhatárok itt tájékozódók: S ≥ 20, D ≥ 16. */
const P={
  mal:{l:'Megterhelő perfekcionizmus',c:'#e11d48',d:'Magas mércét állítasz, és közben gyakran érzed, hogy nem éred el. A kutatásokban ez a kombináció jár együtt a legtöbb stresszel, halogatással és lehangoltsággal: nem a magas mérce a gond, hanem az, hogy soha nem elég.'},
  ada:{l:'Magas mérce, elégedettséggel',c:'#10b981',d:'Magas mércét állítasz, és többnyire elégedett vagy azzal, amit elérsz. Ez a „magas mérce, megbocsátó hozzáállás” mintája, ami a kutatások szerint teljesítménnyel és jólléttel jár együtt.'},
  dis:{l:'Elégedetlenség magas mérce nélkül',c:'#f59e0b',d:'A mércéd nem kiemelkedően magas, mégis gyakran érzed, hogy nem vagy elég jó. Ilyenkor az elégedetlenség forrása inkább az önértékelés, mint az elvárás (lásd: RSES, SCS-SF).'},
  non:{l:'Nem perfekcionista',c:'#60a5fa',d:'Sem a mércéd nem kiemelkedően magas, sem az elégedetlenséged. Rugalmas viszonyban vagy a teljesítménnyel.'}};
makeTest({
  id:'saps',key:'saps-responses-v1',name:'Perfekcionizmus (SAPS)',c1:'#e11d48',c2:'#d4a017',
  tab:'Perfekcionizmus',tabSub:'SAPS · 8 item',scale:SAPS_SCALE,
  header:{status:'valid',statusText:'Validált skála · Rice, Richardson & Tueller (2014)',
    eyebrow:'Short Almost Perfect Scale · Kenneth G. Rice és mtsai',
    title:'Milyen a <em style="color:#e11d48">mérced</em> önmagaddal szemben',
    lead:'A perfekcionizmusnak két, egymástól független oldala van: a <strong>magas mérce</strong> (mit vársz el magadtól) és a <strong>diszkrepancia</strong> (mennyire érzed, hogy nem éred el). A magas mérce önmagában hajtóerő lehet; a gond a soha-nem-elég érzéssel kezdődik.',
    intro:'<p><strong>Kitöltés:</strong> mennyire értesz egyet az alábbi állításokkal?</p><p>Alskálánként 4–28. A profil a két alskála kombinációjából adódik (tájékozódó határok: magas mérce ≥ 20, diszkrepancia ≥ 16).</p>'},
  sections:[{title:'8 állítás',desc:'',items:[
    {s:'S',t:'Magasak az elvárásaim önmagammal szemben.'},
    {s:'D',t:'Úgy tűnik, hogy a legjobb teljesítményem sem elég soha.'},
    {s:'S',t:'Nagyon magas mércét állítok magam elé.'},
    {s:'D',t:'Szinte soha nem vagyok elégedett a teljesítményemmel.'},
    {s:'S',t:'A legjobbat várom el magamtól.'},
    {s:'D',t:'Gyakran vagyok frusztrált, mert nem érem el a céljaimat.'},
    {s:'S',t:'Erős belső késztetést érzek arra, hogy kiváló legyek.'},
    {s:'D',t:'Egy feladat befejezése után gyakran csalódott vagyok, mert tudom, hogy jobban is meg tudtam volna csinálni.'}]}],
  score(R){const S=R.sum('S'),D=R.sum('D'),hs=S>=20,hd=D>=16;return {S,D,p:hs&&hd?'mal':hs?'ada':hd?'dis':'non'};},
  sum(s){return {h:P[s.p].l,d:{S:['Magas mérce',s.S,4,28],D:['Diszkrepancia (soha nem elég)',s.D,4,28]}};},
  render(R,s){
    const pr=P[s.p];
    return `<div class="res-eyebrow">Eredmény · SAPS</div>
      <h2 class="res-title"><em>${pr.l}</em></h2>
      <p class="res-lead">Magas mérce: <strong>${s.S}</strong> / 28 · diszkrepancia: <strong>${s.D}</strong> / 28.</p>
      ${H.bars('Két <em>dimenzió</em>',[{title:'',color:pr.c,rows:[
        {name:'Magas mérce',val:s.S,unit:'/28',pct:(s.S-4)/24*100,color:'#d4a017'},
        {name:'Diszkrepancia <span style="color:var(--ink-lite-muted);font-size:12px">· a soha-nem-elég érzés</span>',val:s.D,unit:'/28',pct:(s.D-4)/24*100,color:'#e11d48'}]}])}
      ${H.interp('Mit <em>jelent</em>',[
        {h:pr.l,color:pr.c,html:`<p>${pr.d}</p>`},
        s.D>=16?{h:'Ami a soha-nem-elég érzést oldja',html:'<p><strong>Előre rögzített „kész” kritérium.</strong> Mielőtt nekiállsz, írd le, mikor lesz elég jó, és ott állj meg. <strong>Szándékos 90%.</strong> Egy kis tétű feladatot adj le szándékosan nem tökéletesen, és jegyezd fel, mi történt valójában. <strong>Önegyüttérzés kudarc után</strong> (SCS-SF): a kutatások szerint a kemény önkritika nem javítja, hanem rontja a következő teljesítményt.</p>'}:null,
        {h:'Kapcsolódó térképek',html:'<p>A megterhelő perfekcionizmus gyakran a YSQ <em>Könyörtelen mércék</em> sémájával, magas halogatással (IPS) és munkához kötött kiégéssel (CBI) jár együtt. Az összegzés ezeket egymás mellé teszi.</p>'}
      ])}
      ${H.refs(['<strong>Rice, K. G., Richardson, C. M. E., & Tueller, S. (2014).</strong> The short form of the Revised Almost Perfect Scale. <em>Journal of Personality Assessment, 96</em>(3), 368–379.',
        '<strong>Stoeber, J., & Otto, K. (2006).</strong> Positive conceptions of perfectionism: Approaches, evidence, challenges. <em>Personality and Social Psychology Review, 10</em>(4), 295–319.'])}`;
  }
});
})();
