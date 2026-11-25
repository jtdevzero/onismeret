/* 137 Hungarian six-beat storyboards. Each concept gets its own text,
 * topic-selected illustration, deterministic layout and timeline. Preview only.
 * No raster assets or network requests. */
(function () {
  'use strict';
  const scenes = window.BiasAnim && window.BiasAnim.SCENES;
  if (!scenes) return;
  const records = window.BiasMapRemaining || {};
  const premium = new Set(Object.values(window.BiasMapPremium || {}));
  const escape = text => String(text || '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sentence = (text,max=122) => {
    const s=String(text||'').replace(/\s+/g,' ').trim();
    if(s.length<=max)return s;
    const end=s.search(/[.!?](?:\s|$)/);
    if(end>=24&&end<max)return s.slice(0,end+1);
    const cut=s.lastIndexOf(' ',max-1);
    return s.slice(0,cut>max*.55?cut:max-1).trimEnd()+'…';
  };
  const hash = s => [...s].reduce((n,c)=>Math.imul(n,31)+c.charCodeAt(0)|0,0)>>>0;
  const R=(x,y,w,h,c='sb-card')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" class="${c}"/>`;
  const C=(x,y,r,c='sb-card')=>`<circle cx="${x}" cy="${y}" r="${r}" class="${c}"/>`;
  const P=(d,c='sb-line')=>`<path d="${d}" class="${c}"/>`;
  const T=(x,y,t,c='sb-title')=>`<text x="${x}" y="${y}" class="${c}">${escape(t)}</text>`;
  const G=(id,svg)=>`<g data-k="${id}">${svg}</g>`;
  const ok=(x,y)=>P(`M${x-15} ${y}l10 11 22-24`,'sb-good');
  const cross=(x,y)=>P(`M${x-13} ${y-13}l26 26m0-26-26 26`,'sb-bad');
  const human=(x,y,em=false)=>`${C(x,y-12,10,em?'sb-hot':'sb-card')}${P(`M${x-19} ${y+28}q0-28 19-28t19 28`,em?'sb-accent':'sb-line')}`;
  const css=`
    .sb-card{fill:var(--surface);stroke:var(--ink);stroke-width:2.2}
    .sb-hot{fill:var(--surface-2);stroke:var(--q);stroke-width:3}
    .sb-line{fill:none;stroke:var(--ink);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
    .sb-accent{fill:none;stroke:var(--q);stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
    .sb-good{fill:none;stroke:var(--good);stroke-width:3.3;stroke-linecap:round;stroke-linejoin:round}
    .sb-bad{fill:none;stroke:var(--bad);stroke-width:3.1;stroke-linecap:round;stroke-linejoin:round}
    .sb-title{fill:var(--ink);font:600 12px var(--display);text-anchor:middle}
    .sb-small{fill:var(--muted);font:500 10px var(--mono);text-anchor:middle}
    .sb-em{fill:var(--q);font:700 12px var(--display);text-anchor:middle}
  `;
  // An illustration vocabulary of objects, not a random visual grammar.
  const icons={
    memory:(x,y)=>`${R(x-35,y-33,70,68)}${P(`M${x-23} ${y-15}h46m-46 13h38m-38 13h30`)}${C(x+28,y-25,8,'sb-hot')}`,
    people:(x,y)=>`${human(x-23,y-8)}${human(x+23,y-8,true)}`,
    money:(x,y)=>`${R(x-49,y-30,98,62,'sb-hot')}${C(x,y,23)}${T(x,y+5,'Ft','sb-em')}${P(`M${x-38} ${y-18}h10m56 36h10`)}`,
    decision:(x,y)=>`${P(`M${x} ${y-35}v28m0 0-42 35m42-35 42 35`,'sb-accent')}${R(x-61,y+20,39,19)}${R(x+22,y+20,39,19,'sb-hot')}`,
    chance:(x,y)=>`${C(x,y,41,'sb-hot')}${P(`M${x-36} ${y-20}l72 40m-72 0 72-40`)}${C(x,y,8)}`,
    time:(x,y)=>`${C(x,y,43)}${P(`M${x} ${y-29}v31l23 13`,'sb-accent')}${C(x,y,4,'sb-hot')}`,
    focus:(x,y)=>`${C(x,y,44)}${C(x,y,29,'sb-hot')}${C(x,y,11)}${P(`M${x+35} ${y+34}l25 25`,'sb-accent')}`,
    evidence:(x,y)=>`${R(x-33,y-40,66,82)}${P(`M${x-20} ${y-18}h38m-38 17h32m-32 17h36`)}${C(x+34,y+28,16,'sb-hot')}${P(`M${x+46} ${y+40}l16 16`,'sb-accent')}`,
    risk:(x,y)=>`${P(`M${x} ${y-46}l49 84h-98z`,'sb-accent')}${P(`M${x} ${y-20}v26`)}${C(x,y+19,3,'sb-hot')}`,
    social:(x,y)=>`${human(x-45,y)}${human(x,y-15,true)}${human(x+45,y)}`,
    scale:(x,y)=>`${P(`M${x} ${y-48}v90m-76-49h152M${x-55} ${y-7}l-27 41h54zM${x+55} ${y-7}l-27 41h54z`,'sb-line')}${C(x,y-48,9,'sb-hot')}`,
    journey:(x,y)=>`${P(`M${x-59} ${y+26}q25-70 55-20t64-18`,'sb-accent')}${C(x-59,y+26,12)}${C(x+60,y-12,12,'sb-hot')}`,
    eye:(x,y)=>`${P(`M${x-60} ${y}q60-75 120 0q-60 75-120 0z`)}${C(x,y,22,'sb-hot')}${C(x,y,8)}`,
    graph:(x,y)=>`${P(`M${x-57} ${y-48}v103h116`)}${P(`M${x-45} ${y+34}l27-31 20 16 32-49 26 15`,'sb-accent')}`,
    identity:(x,y)=>`${R(x-47,y-49,94,99)}${C(x,y-17,17,'sb-hot')}${P(`M${x-29} ${y+32}q0-37 29-37t29 37`)}`,
    language:(x,y)=>`${R(x-61,y-36,122,65)}${P(`M${x-25} ${y+29}l-15 18v-18`)}${T(x,y-9,'„…”','sb-em')}`,
    information:(x,y)=>`${[0,1,2].map(i=>R(x-58+i*42,y-28+i*5,36,65,i===1?'sb-hot':'sb-card')).join('')}`,
    group:(x,y)=>`${[0,1,2,3].map(i=>C(x-48+i*32,y+((i%2)?-13:13),13,i===2?'sb-hot':'sb-card')).join('')}`,
    value:(x,y)=>`${R(x-45,y-34,90,72,'sb-hot')}${P(`M${x-24} ${y-8}l19 22 34-42`,'sb-accent')}`,
    generic:(x,y)=>`${C(x-29,y,31)}${C(x+29,y,31,'sb-hot')}${P(`M${x-2} ${y}h28m-8-8 8 8-8 8`,'sb-accent')}`
  };
  const semantic = [
    ['memory',/emlé|memóri|felidéz|forget|recall|source confusion|cryptomn|suggestib|remember|retrospect|rosy|absent|telescop|misinformation|serial|primacy|recency|suffix|modality|spacing|testing effect|google effect|tip of the tongue|next.in.line|fading affect|confabul/],
    ['money',/ár|pénz|forint|fizet|vásárl|költs|bevét|bér|adó|bank|összeg|érme|érték|denomination|mental accounting|subaddit|zero sum|disposition/],
    ['social',/csoport|emberek|társ|sztereot|előítélet|mások|közösség|barát|személy|nemzet|race|group|ingroup|out.group|stereotyp|cheerleader|prejudice|anthropomorph/],
    ['time',/idő|perc|óra|nap|év|késő|jövő|múlt|várakoz|speed|saving|time|present|future|impact bias|declinis/],
    ['chance',/véletlen|esély|valószín|dobás|érme|kocka|szerencse|gyakoris|probabil|clustering|sample size|chance|hot.hand|magic number/],
    ['evidence',/bizonyít|kutat|adat|teszt|kísérlet|forrás|vizsgál|információ|tény|igazol|valid|observer|experiment|fallacy|belief|appeal|argument|conjunction/],
    ['focus',/figyelem|észlel|látszik|részlet|látunk|fókusz|spot|selectiv|attention|perception|blind|illusion|transparency|pareidolia/],
    ['risk',/veszély|kockázat|hiba|fenyeget|rossz|kudarc|mulaszt|tragédia|áldozat|risk|normalcy|ostrich|moral luck|just.world/],
    ['identity',/önmag|önérdek|saját|magunk|személyiség|önuralom|énkép|self|egocentric|trait|ascription|projection|restraint|superiority|consistency/],
    ['language',/mondat|szó|beszél|állítás|nyelv|rím|gondolat|vélemény|érv|meggyőz|rhyme|reason|naive|cynicism|realism/],
    ['journey',/út|halad|folyamat|fejlődés|lépés|munka|tervez|projekt|újítás|innováció|road|innovation|escalation|commitment/],
    ['scale',/különbség|összehasonl|aránya|nagyobb|kisebb|mérték|súly|két lehetőség|better|comparison|hard.easy|leveling/],
    ['graph',/növek|csökken|változ|előrejelzés|trend|sorozat|statisztika|hatás|effect|correlation|expectation|forecast/],
    ['decision',/választ|dönt|lehetőség|megoldás|elkötelez|helyzet|opció|politika|choice|decision|system justification|reactance/],
    ['information',/sok információ|olvas|tanul|újság|hír|ismétl|ismert|cikk|ismeret|processing|knowledge|information/],
    ['group',/szám|darab|lista|tétel|kategória|gyűjt|halmaz|pontosság|list|category|attribute/]
  ];
  const choose = data => {
    const combined=`${data.name} ${data.example} ${data.explanation}`.toLowerCase();
    const matches=semantic.map(([name,re])=>({name,score:(combined.match(new RegExp(re.source,'gi'))||[]).length}));
    matches.sort((a,b)=>b.score-a.score);
    return matches[0].score>0?matches[0].name:'generic';
  };
  const counterpart={memory:'evidence',people:'social',money:'scale',decision:'value',chance:'graph',
    time:'journey',focus:'eye',evidence:'information',risk:'scale',social:'people',scale:'value',
    journey:'time',eye:'focus',graph:'evidence',identity:'people',language:'social',
    information:'evidence',group:'scale',value:'decision',generic:'evidence'};
  const badge = (label,x,y) => {
    const width=Math.min(210,Math.max(116,Math.ceil([...label].length*7.5+22)));
    return `${R(x-width/2,y-20,width,34,'sb-hot')}${T(x,y+1,label,'sb-em')}`;
  };
  const label = s => {
    const clean=String(s||'').replace(/\s*\([^)]*\)\s*$/,'').trim();
    return clean.length>18?clean.slice(0,clean.lastIndexOf(' ',17)>8?clean.lastIndexOf(' ',17):17)+'…':clean;
  };
  const prompts={
    memory:'Mi az eredeti emlék?',money:'Mi az összes költség?',social:'Mások is így látják?',
    time:'Mi számít hosszú távon?',chance:'Mit mutat a sok próbálkozás?',
    evidence:'Mi cáfolhatná?',focus:'Mi maradt a látómezőn kívül?',
    risk:'Mekkora a tényleges kockázat?',identity:'És ha rólad lenne szó?',
    language:'Másképp fogalmazva?',journey:'Mi a következő valódi lépés?',
    scale:'Mihez viszonyítasz?',graph:'Mi a teljes adatsor?',
    decision:'Milyen más opció van?',information:'Mi a megbízható forrás?',
    group:'Mi hiányzik a csoportból?',people:'Kinek a nézőpontja hiányzik?',
    eye:'Mit nem vettél észre?',value:'Milyen szempont fontos még?',
    generic:'Mi lehet egy másik magyarázat?'
  };
  const trapNames={memory:'AZ EMLÉK VÁLTOZIK',money:'A KERET FÉLREVEZET',
    social:'A TÖBBIEK TORZ TÜKRE',time:'AZ IDŐ CSAPDÁJA',chance:'A VÉLETLEN MINTÁZAT',
    evidence:'EGYOLDALÚ BIZONYÍTÉK',focus:'BESZŰKÜLT FIGYELEM',risk:'TORZ KOCKÁZATÉRZET',
    identity:'ÖNIGAZOLÓ TÜKÖR',language:'A MEGFOGALMAZÁS HAT',journey:'BERAGADT FOLYAMAT',
    scale:'FÉLREVEZETŐ MÉRCE',graph:'HIÁNYOS ÖSSZKÉP',decision:'BESZŰKÜLT VÁLASZTÁS',
    information:'INFORMÁCIÓS ZAJ',group:'HIBÁS CSOPORTOSÍTÁS',generic:'TORZÍTOTT KÉP'};
  const steps=[
    {steps:[{to:{a:1},ms:800,ease:'out'}],hold:3000},
    {steps:[{to:{b:1},ms:750,ease:'out'}],hold:3000},
    {steps:[{to:{a:0,b:0,c:1},ms:900,ease:'out'}],hold:2900},
    {steps:[{to:{d:1},ms:750,ease:'out'}],hold:3000},
    {steps:[{to:{c:0,d:0,e:1},ms:850,ease:'out'}],hold:3100},
    {steps:[{to:{f:1},ms:750,ease:'out'}],hold:3150}
  ];
  for (const [key,data] of Object.entries(records)) {
    if (premium.has(key)) continue;
    const seed=hash(key+data.family),topic=choose(data),name=label(data.name);
    const second=counterpart[topic];
    const firstScene=icons[topic](112,130);
    const secondScene=icons[second](294,125);
    const points=Array.from({length:5},(_,i)=>C(140+i*30,243,4,i===(seed%5)?'sb-hot':'sb-card')).join('');
    const picture = () =>
      G('a',`${firstScene}${T(112,220,'HELYZET','sb-small')}${T(112,239,name,'sb-em')}`)+
      G('b',`${P('M179 133h39m-11-10 11 10-11 10','sb-accent')}${secondScene}${T(294,219,'ELSŐ BENYOMÁS','sb-small')}`)+
      G('c',`${C(200,124,65,'sb-hot')}${icons[topic](200,124)}${T(200,221,'AMI KIEMELKEDIK','sb-em')}`)+
      G('d',`${P('M137 186l127-123','sb-bad')}${badge(trapNames[topic]||'TORZÍTOTT KÉP',200,34)}`)+
      G('e',`${icons[second](110,125)}${P('M177 129h51m-12-10 12 10-12 10','sb-accent')}${icons[topic](292,125)}${T(200,223,'NÉZD MEG MÁSKÉNT!','sb-em')}`)+
      G('f',`${ok(200,42)}${badge('TUDATOS DÖNTÉS',200,245)}${points}`);
    const setup=sentence(data.example,124),why=sentence(data.explanation,122);
    const sign=sentence(data.warning,122),action=sentence(data.action,122);
    const captions=[
      escape(setup),
      `<b>Amit elsőre gondolunk:</b> ${escape(sign)}`,
      `<b>Mi történik?</b> ${escape(why)}`,
      `<b>A rejtett csapda:</b> ${escape(data.name)} észrevétlenül befolyásolhatja az ítéletünket.`,
      `<b>Ellenőrző kérdés:</b> ${escape(prompts[topic]||prompts.generic)}`,
      `<b>Mit tehetsz?</b> ${escape(action)}`
    ];
    scenes[key]={
      q:data.quadrant,viewBox:'0 0 400 272',css,
      text:{hu:{name:data.name,shareTitle:`${data.name} – magyarázat`,ecline:action,
        caps:captions,say:captions.map(s=>s.replace(/<[^>]+>/g,''))}},
      svg:picture,S0:{a:0,b:0,c:0,d:0,e:0,f:0},
      render(S,k){for(const part of ['a','b','c','d','e','f'])k(part).style.opacity=String(Math.max(0,Math.min(1,S[part])));},
      beats:steps
    };
  }
  window.BiasMapCraftedApply?.();
})();
