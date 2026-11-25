/* 137 scene-specific Hungarian SVG vignettes, preview only.
 * Explicit, per-concept visual cues. Shapes are shared primitives, while the
 * subject/setting/contrast and six-beat composition are selected per concept.
 * The five premium pilots remain untouched. The filename is retained for stable URLs. */
(function(){
  'use strict';
  const scenes=window.BiasAnim?.SCENES;
  if(!scenes)return;
  // ID: observed setting | actor/object | attention object | counterpoint
  const plots={
    1:'book|headphones|spark|repeat',3:'phone|wallet|camera|scale',4:'school|fork|memory|scale',
    5:'stadium|people|whistle|balance',6:'horse|number|observer|eye',7:'lab|flask|chart|check',
    8:'hospital|people|eye|soap',9:'airplane|headphones|signal|warning',10:'chart|wallet|eye|calendar',
    11:'book|stars|person|question',12:'office|message|person|check',13:'hospital|flask|shield|check',
    14:'office|person|mirror|people',15:'school|people|scale|mirror',16:'people|speech|eye|scale',
    17:'car|cloud|memory|question',18:'music|dots|pattern|dice',19:'school|people|chart|scale',
    20:'airplane|warning|car|chart',21:'smoke|person|chart|shield',22:'office|person|star|chart',
    23:'bank|mask|message|question',24:'book|speech|clock|timeline',26:'hospital|moon|chart|check',
    27:'moon|face|cloud|eye',28:'dog|face|person|question',29:'stadium|person|people|scale',
    30:'office|people|warning|balance',31:'store|person|phone|check',32:'office|person|lock|fork',
    33:'home|hammer|shoe|spark',34:'people|heart|scale|check',35:'street|person|warning|heart',
    36:'school|speech|check|scale',37:'car|map|warning|eye',38:'medicine|pill|heart|question',
    39:'people|people|mirror|person',40:'people|eye|face|check',41:'school|people|star|scale',
    42:'stage|people|star|person',43:'photo|face|heart|cloud',44:'computer|tool|clock|fork',
    45:'office|speech|money|balance',46:'road|clock|car|chart',47:'wallet|money|beach|scale',
    48:'chart|rocket|dice|question',49:'home|storm|warning|shield',50:'car|traffic|clock|check',
    51:'school|book|people|heart',52:'chart|tree|dots|balance',53:'store|coins|candy|wallet',
    54:'phone|number|blocks|brain',55:'stage|person|eye|people',56:'office|money|people|heart',
    57:'school|people|heart|dice',58:'office|people|mirror|question',59:'calendar|person|memory|timeline',
    60:'smoke|person|shield|warning',61:'store|food|basket|calendar',62:'school|tablet|chart|check',
    63:'road|speed|clock|chart',64:'hospital|person|warning|check',65:'school|star|cloud|clock',
    66:'street|people|clock|balance',67:'car|people|warning|scale',68:'office|shield|check|warning',
    69:'camp|rain|heart|photo',70:'calendar|dentist|clock|timeline',71:'office|calendar|chart|warning',
    72:'survey|people|heart|chart',73:'speech|people|mirror|question',75:'school|exam|star|chart',
    76:'office|people|star|scale',77:'home|people|check|balance',78:'survey|person|stars|people',
    79:'stars|book|person|people',80:'school|star|exam|balance',81:'store|people|speech|mirror',
    83:'road|car|star|scale',84:'home|candle|warning|person',85:'office|person|speech|mirror',
    86:'club|shield|heart|scale',87:'road|helmet|warning|speed',88:'road|shield|car|speed',
    89:'computer|spark|tool|chart',90:'news|child|heart|people',91:'home|money|people|warning',
    92:'building|money|clock|warning',93:'school|book|pencil|brain',94:'store|spoon|candy|scale',
    95:'water|warning|scale|shield',96:'chart|money|arrow|balance',97:'trophy|dice|star|question',
    98:'book|text|brain|check',99:'news|speech|shield|evidence',100:'office|people|lock|fork',
    101:'home|speech|food|spark',102:'people|speech|shield|fork',103:'office|people|star|mirror',
    104:'jars|dice|question|scale',105:'hospital|check|chart|question',106:'book|flower|check|question',
    107:'speech|music|star|check',108:'computer|paint|server|clock',109:'park|speech|clock|scale',
    110:'home|calendar|cloud|fork',111:'people|heart|dots|balance',112:'office|chart|fork|evidence',
    113:'icecream|cup|scale|question',114:'medicine|speech|memory|evidence',115:'office|speech|memory|eye',
    116:'office|lightbulb|speech|memory',118:'hospital|speech|memory|question',119:'school|calendar|book|brain',
    120:'store|logo|basket|mirror',121:'office|people|document|scale',122:'office|person|computer|check',
    123:'home|speech|person|heart',124:'heart|calendar|memory|timeline',125:'airplane|clock|speech|timeline',
    126:'store|news|face|evidence',127:'calendar|vacation|heart|clock',128:'phone|number|list|brain',
    129:'store|basket|list|brain',130:'office|speech|list|brain',131:'home|key|memory|calendar',
    132:'book|people|list|question',133:'restaurant|list|star|brain',134:'office|calendar|star|timeline',
    135:'people|timeline|star|brain',136:'office|speech|list|ear',137:'school|book|heart|brain',
    138:'hospital|flashcard|check|brain',139:'phone|key|cloud|brain',140:'stage|people|speech|memory',
    141:'stage|face|speech|brain',142:'phone|list|cloud|brain'
  };
  // A compact geometric pictogram library: every glyph is SVG, no remote assets.
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  const rect=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/>`;
  const circ=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}"/>`;
  const path=d=>`<path d="${d}"/>`;
  const line=(x,y,a,b)=>path(`M${x} ${y}L${a} ${b}`);
  const shapes={
    book:()=>`${rect(-31,-30,61,63)}${line(-1,-30,-1,33)}${line(-24,-18,-8,-18)}${line(8,-18,24,-18)}`,
    headphones:()=>`${path('M-28 12v-16a28 28 0 0 1 56 0v16')}${rect(-34,5,11,24)}${rect(23,5,11,24)}`,
    spark:()=>path('M0-36L9-10L35 0L9 10L0 36L-9 10L-35 0L-9-10Z'),
    repeat:()=>path('M-26-8Q-20-29 7-24L25-15M25-15L12-17M25-15L20-29M26 8Q20 29-7 24L-25 15M-25 15L-12 17M-25 15L-20 29'),
    phone:()=>`${rect(-22,-37,44,75)}${line(-9,25,9,25)}${circ(0,-29,2)}`,
    wallet:()=>`${rect(-35,-23,70,50)}${rect(6,-8,33,23)}${circ(22,3,3)}`,
    camera:()=>`${rect(-35,-18,70,48)}${rect(-18,-29,30,11)}${circ(0,6,18)}${circ(0,6,8)}`,
    scale:()=>`${line(0,-36,0,33)}${line(-33,-21,33,-21)}${path('M-27-19l-18 33h36zM27-19L9 14h36z')}`,
    school:()=>`${path('M-38-9L0-33L38-9Z')}${rect(-32,-9,64,45)}${rect(-10,8,20,28)}`,
    fork:()=>`${line(0,-34,0,0)}${path('M0 0L-27 28M0 0L27 28')}${circ(-27,28,5)}${circ(27,28,5)}`,
    memory:()=>`${rect(-33,-29,66,57)}${path('M-23-16H23M-23-3H13M-23 10H20')}${circ(24,-22,8)}`,
    stadium:()=>`${path('M-38-17Q0-38 38-17V16Q0 38-38 16Z')}${line(-38,0,38,0)}${circ(0,0,12)}`,
    people:()=>`${circ(-17,-19,13)}${circ(20,-19,12)}${path('M-40 28Q-34-5-17-5Q1-5 7 28M5 28Q10-5 20-5Q39-5 43 28')}`,
    whistle:()=>`${circ(-5,5,22)}${rect(13,-12,24,16)}${circ(-6,5,8)}`,
    balance:()=>`${circ(0,0,31)}${path('M-20 0L-7 13L21-17')}`,
    horse:()=>path('M-28 32L-27-2L-7-30L14-20L32-16L29-1L11 4L18 32M-10 9L-3 32'),
    number:()=>`${rect(-30,-31,60,62)}<text x="0" y="11" text-anchor="middle" class="craft-number">7</text>`,
    observer:()=>`${circ(0,-15,17)}${path('M-26 34Q-26 4 0 4Q26 4 26 34')}${circ(6,-17,4)}`,
    eye:()=>`${path('M-39 0Q0-38 39 0Q0 38-39 0Z')}${circ(0,0,15)}${circ(0,0,5)}`,
    lab:()=>`${path('M-8-35V-7L-31 30Q-34 36-21 36H21Q34 36 31 30L8-7V-35M-15-35H15')}${line(-23,16,23,16)}`,
    flask:()=>`${path('M-14-35H14M-9-35V-6L-29 30Q-31 35-23 35H23Q31 35 29 30L9-6V-35')}${circ(4,15,7)}`,
    chart:()=>`${path('M-35-31V32H36M-25 20L-7-4L9 8L30-23')}${circ(30,-23,4)}`,
    check:()=>path('M-29 1L-7 24L31-24'),
    hospital:()=>`${rect(-30,-34,60,69)}${rect(-10,12,20,23)}${path('M0-23V0M-12-12H12')}`,
    soap:()=>`${rect(-27,-16,54,48)}${rect(-6,-29,12,13)}${path('M-6-31H24M24-31V-24')}${circ(-11,7,5)}`,
    airplane:()=>path('M-40 0L-2-7L-5-35L7-35L18-7L38 2L38 10L17 13L6 34L-5 34L-3 12L-40 7Z'),
    signal:()=>`${circ(0,22,5)}${path('M-17 8Q0-8 17 8M-31-5Q0-34 31-5')}`,
    warning:()=>`${path('M0-36L38 31H-38Z')}${line(0,-12,0,9)}${circ(0,21,3)}`,
    money:()=>`${rect(-38,-26,76,52)}${circ(0,0,18)}<text x="0" y="6" text-anchor="middle" class="craft-number">Ft</text>`,
    calendar:()=>`${rect(-32,-30,64,66)}${line(-32,-13,32,-13)}${line(-15,-37,-15,-24)}${line(15,-37,15,-24)}${circ(-13,1,4)}${circ(13,1,4)}${circ(-13,20,4)}`,
    stars:()=>`${path('M0-34L10-10L36-10L16 6L25 33L0 18L-25 33L-16 6L-36-10L-10-10Z')}`,
    person:()=>`${circ(0,-20,16)}${path('M-27 33Q-26 0 0 0Q26 0 27 33')}`,
    question:()=>`${circ(0,0,34)}<text x="0" y="15" text-anchor="middle" class="craft-number">?</text>`,
    office:()=>`${rect(-31,-35,62,70)}${[-15,3,20].map(y=>`${rect(-22,y-10,15,15)}${rect(6,y-10,15,15)}`).join('')}`,
    message:()=>`${rect(-35,-24,70,47)}${path('M-18 23L-26 36V23M-23-9H24M-23 2H15')}`,
    shield:()=>`${path('M0-38L31-26V4Q24 28 0 38Q-24 28-31 4V-26Z')}${path('M-17-1L-4 12L17-14')}`,
    street:()=>`${path('M-23-36L-36 36H36L23-36Z')}${path('M0-24V-10M0 1V13M0 24V34')}`,
    speech:()=>`${rect(-38,-27,76,52)}${path('M-19 25L-30 36V25M-26-12H27M-26 0H15')}`,
    cloud:()=>`${path('M-27 22Q-43 17-34-3Q-27-16-13-12Q-8-36 13-29Q29-22 28-8Q46-8 39 15Q35 23 24 23Z')}`,
    music:()=>`${path('M-6-22L29-33V15M-6-22V27')}${circ(-17,27,11)}${circ(18,15,11)}`,
    dots:()=>`${[-21,0,21].map(x=>[-21,0,21].map(y=>circ(x,y,5)).join('')).join('')}`,
    pattern:()=>`${[-27,0,27].map((x,i)=>`${circ(x,(i%2)*20-10,11)}`).join('')}`,
    dice:()=>`${rect(-31,-31,62,62)}${circ(-15,-15,5)}${circ(15,15,5)}${circ(0,0,5)}`,
    smoke:()=>`${path('M-22 35V8Q-34-8-17-20M0 35V12Q-13-6 3-33M22 35V6Q8-8 22-22')}`,
    mirror:()=>`${rect(-28,-36,56,72)}${circ(0,-14,11)}${path('M-19 23Q-18 0 0 0Q18 0 19 23')}`,
    mask:()=>`${path('M-33-28Q0-44 33-28V5Q28 31 0 38Q-28 31-33 5Z')}${circ(-14,-7,7)}${circ(14,-7,7)}${path('M-17 16Q0 28 17 16')}`,
    bank:()=>`${path('M-37-18L0-38L37-18Z')}${[-23,0,23].map(x=>rect(x-6,-16,12,45)).join('')}${rect(-40,30,80,7)}`,
    moon:()=>`${path('M16-38A38 38 0 1 0 37 23A30 30 0 1 1 16-38Z')}`,
    face:()=>`${circ(0,0,34)}${circ(-12,-8,4)}${circ(12,-8,4)}${path('M-15 13Q0 27 15 13')}`,
    dog:()=>`${path('M-20-32L-38-14L-25 0M20-32L38-14L25 0')}${circ(0,4,28)}${circ(-10,-2,4)}${circ(10,-2,4)}${circ(0,12,5)}`,
    store:()=>`${rect(-34,-17,68,53)}${path('M-39-17L-30-36H30L39-17Z')}${rect(-19,5,22,31)}${rect(11,2,14,14)}`,
    lock:()=>`${rect(-28,-7,56,43)}${path('M-18-7V-22A18 18 0 0 1 18-22V-7')}${circ(0,12,5)}`,
    hammer:()=>`${path('M-15-36L19-36V-18L3-18L-12 36L-22 31L-5-18L-15-18Z')}`,
    shoe:()=>`${path('M-29 0L-20-27L-3-22L2 0Q19 13 35 16V32H-35V13Z')}`,
    heart:()=>path('M0 33L-29 3Q-44-13-27-29Q-11-39 0-20Q11-39 27-29Q44-13 29 3Z'),
    map:()=>`${path('M-35-26L-12-36L12-25L35-36V26L12 36L-12 25L-35 36Z')}${path('M-12-36V25M12-25V36')}`,
    medicine:()=>`${rect(-32,-10,64,35)}${path('M-10-10V25')}${circ(18,8,5)}`,
    pill:()=>`${path('M-24-24A18 18 0 0 1 1-24L24-1A18 18 0 0 1-1 24L-24 1A18 18 0 0 1-24-24Z')}${line(-12,12,12,-12)}`,
    photo:()=>`${rect(-35,-30,70,60)}${circ(14,-12,7)}${path('M-28 20L-8-6L7 9L18-1L29 20')}`,
    computer:()=>`${rect(-37,-30,74,51)}${path('M0 21V34M-20 34H20')}`,
    tool:()=>`${path('M-28-13Q-10-39 8-25L-9-10L10 9L25-8Q39 10 13 28L-11 5L-29 23L-37 15L-19-3Z')}`,
    road:()=>`${path('M-12-36L-36 36M12-36L36 36M0-29V-15M0-3V11M0 23V36')}`,
    clock:()=>`${circ(0,0,34)}${path('M0-25V0L18 10')}`,
    car:()=>`${rect(-37,-3,74,27)}${path('M-26-3L-14-24H19L30-3')}${circ(-23,27,8)}${circ(23,27,8)}`,
    beach:()=>`${path('M-36 15Q0-33 36 15M0-24V35M-14 35H14')}`,
    rocket:()=>`${path('M0-38Q29-19 18 12L0 31L-18 12Q-29-19 0-38Z')}${circ(0,-8,8)}`,
    storm:()=>`${path('M-34-5Q-46-28-15-28Q-2-43 17-25Q42-28 38-6Z')}${path('M6-5L-10 16H5L-9 35')}`,
    home:()=>`${path('M-38-5L0-37L38-5V34H-38Z')}${rect(-11,9,22,25)}`,
    traffic:()=>`${rect(-15,-36,30,72)}${circ(0,-22,7)}${circ(0,0,7)}${circ(0,22,7)}`,
    coins:()=>`${[-16,0,16].map((x,i)=>`${circ(x,i%2?9:-9,18)}`).join('')}`,
    candy:()=>`${circ(0,0,18)}${path('M-18-7L-37-20L-37 20L-18 7M18-7L37-20L37 20L18 7')}`,
    blocks:()=>`${[-24,0,24].map((x,i)=>rect(x-10,i%2?0:-22,20,31)).join('')}`,
    brain:()=>`${path('M0-32Q-16-43-25-23Q-43-21-35-3Q-45 17-27 24Q-17 39 0 29Q17 39 27 24Q45 17 35-3Q43-21 25-23Q16-43 0-32Z')}${path('M0-32V30M-23-12L-10 0M23-12L10 0')}`,
    stage:()=>`${rect(-38,-29,76,59)}${path('M-38-29L-13 0L-38 29M38-29L13 0L38 29')}`,
    basket:()=>`${path('M-35-8H35L26 33H-26Z')}${path('M-19-8L-8-32M19-8L8-32')}${line(-15,4,-12,23)}${line(15,4,12,23)}`,
    food:()=>`${circ(0,0,32)}${path('M-13-17V16M13-17V16M-23-17V-3M-3-17V-3')}`,
    tablet:()=>`${rect(-28,-38,56,76)}${circ(0,29,3)}${rect(-19,-25,38,43)}`,
    rain:()=>`${path('M-35-13Q0-40 35-13H-35Z')}${path('M-23-4L-30 11M0-4L-7 11M23-4L16 11M-22 25L-27 35')}`,
    camp:()=>`${path('M-35 32L0-34L35 32Z')}${path('M-13 32L0 5L13 32')}`,
    dentist:()=>`${path('M-25-34Q0-40 25-34Q43-16 24 15L12 37L1 17L-12 37L-24 15Q-43-16-25-34Z')}`,
    survey:()=>`${rect(-28,-36,56,72)}${[-20,1,22].map(y=>`${rect(-19,y-5,10,10)}${line(-3,y,19,y)}`).join('')}`,
    exam:()=>`${rect(-31,-35,62,72)}${[-20,-1,18].map(y=>`${circ(-19,y,5)}${line(-7,y,21,y)}`).join('')}`,
    club:()=>`${path('M-27-33H27V6Q0 38-27 6Z')}${path('M-15-12L0 5L15-12')}`,
    helmet:()=>`${path('M-36 10Q-36-29 0-32Q36-29 36 10V21H-36Z')}${path('M-36 7H36')}`,
    speed:()=>`${path('M-33 24A40 40 0 0 1 33 24M0 12L23-21')}${circ(0,12,5)}`,
    news:()=>`${rect(-36,-30,72,59)}${rect(-27,-19,23,21)}${path('M4-17H27M4-5H27M-27 13H27')}`,
    child:()=>`${circ(0,-17,14)}${path('M-22 32L-14 0H14L22 32')}`,
    building:()=>`${rect(-29,-36,58,73)}${[-18,0,18].map(y=>`${rect(-20,y-8,12,12)}${rect(8,y-8,12,12)}`).join('')}`,
    pencil:()=>`${path('M-23 29L-15 3L17-32L32-19L0 17Z')}${line(-15,3,0,17)}`,
    spoon:()=>`${path('M0 35V-10M0-10Q-20-22-10-36Q0-45 10-36Q20-22 0-10Z')}`,
    water:()=>`${path('M0-38Q-38 4-30 19Q-22 37 0 37Q22 37 30 19Q38 4 0-38Z')}`,
    arrow:()=>`${path('M-34 23L28-22M13-22H28V-7')}`,
    trophy:()=>`${rect(-15,-24,30,43)}${path('M-15-15H-36Q-36 10-15 10M15-15H36Q36 10 15 10M0 19V31M-23 31H23')}`,
    text:()=>`${rect(-35,-30,70,60)}${[-17,-5,7,19].map(y=>line(-25,y,25,y)).join('')}`,
    evidence:()=>`${rect(-27,-34,54,68)}${path('M-18-16H18M-18-2H18M-18 12H6')}${circ(23,23,10)}`,
    paint:()=>`${circ(0,0,33)}${circ(-13,-12,5)}${circ(11,-15,5)}${circ(-17,11,5)}${circ(15,10,8)}`,
    server:()=>`${[-24,0,24].map(y=>`${rect(-34,y-10,68,20)}${circ(23,y,3)}`).join('')}`,
    park:()=>`${path('M0-36L-32 3H-17L-38 24H-8V36H8V24H38L17 3H32Z')}`,
    flower:()=>`${[-90,-18,54,126,198].map(deg=>`<ellipse cx="0" cy="-19" rx="10" ry="19" transform="rotate(${deg})"/>`).join('')}${circ(0,0,8)}`,
    icecream:()=>`${path('M-21 4L0 36L21 4Z')}${circ(0,-12,24)}`,
    cup:()=>`${path('M-30-30H30L22 32H-22Z')}${path('M-30-7H30')}`,
    logo:()=>`${circ(0,0,32)}${path('M-15-16L0 16L15-16')}`,
    document:()=>`${rect(-28,-36,56,72)}${path('M-18-18H18M-18-5H18M-18 8H12M-18 21H5')}`,
    jars:()=>`${rect(-35,-30,28,65)}${rect(7,-30,28,65)}${rect(-38,-36,34,8)}${rect(4,-36,34,8)}`,
    lightbulb:()=>`${circ(0,-12,24)}${path('M-12 10V25H12V10M-10 32H10')}`,
    list:()=>`${rect(-30,-34,60,68)}${[-18,0,18].map(y=>`${circ(-20,y,3)}${line(-10,y,20,y)}`).join('')}`,
    vacation:()=>`${path('M-36-8Q0-40 36-8M0-30V33M-17 33H17')}${circ(22,-25,8)}`,
    timeline:()=>`${path('M-36 12H36')}${[-25,0,25].map(x=>circ(x,12,6)).join('')}`,
    key:()=>`${circ(-19,-11,18)}${path('M-6 2L29 36M17 22L27 12M25 30L35 20')}`,
    restaurant:()=>`${path('M-23-35V-6M-33-35V-6M-13-35V-6M-23-6V35M18-35Q35-13 18 5V35')}`,
    ear:()=>`${path('M-15 12Q-39-8-20-29Q-1-43 19-24Q35-9 19 7Q8 16 8 30Q4 42-10 35M-5-8Q15-21 17-1Q17 8 5 12')}`,
    flashcard:()=>`${rect(-31,-33,57,57)}${rect(-19,-23,57,57)}${path('M-9 3L0 12L18-10')}`
  };
  const titles={school:'TANULÁS',office:'MUNKAHELY',store:'VÁSÁRLÁS',hospital:'EGÉSZSÉG',
    people:'KÖZÖSSÉG',home:'OTTHON',car:'KÖZLEKEDÉS',chart:'ADATOK',
    memory:'EMLÉKEZET',road:'ÚTVONAL',book:'INFORMÁCIÓ',phone:'DIGITÁLIS',
    airplane:'UTAZÁS',stadium:'SPORT',news:'HÍREK'};
  const art=(kind,x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})" class="craft-icon">${(shapes[kind]||shapes.question)()}</g>`;
  const flow=(x,y,a,b)=>`<path d="M${x} ${y}L${a} ${b}" class="craft-flow"/>`;
  const heading=(txt,x,y)=>`<text x="${x}" y="${y}" text-anchor="middle" class="craft-label">${esc(txt)}</text>`;
  const css=`
    .craft-icon{fill:none;stroke:var(--ink);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
    .craft-number{fill:var(--ink);stroke:none;font:700 21px var(--display)}
    .craft-em .craft-icon{stroke:var(--q)}
    .craft-flow{fill:none;stroke:var(--q);stroke-width:3;stroke-dasharray:7 6;stroke-linecap:round}
    .craft-label{fill:var(--muted);font:600 10px var(--mono);letter-spacing:.07em}
    .craft-note{fill:var(--q);font:700 12px var(--display);text-anchor:middle}
    .craft-panel{fill:var(--surface);stroke:var(--rule);stroke-width:1.6;rx:12}
    .craft-em .craft-panel{stroke:var(--q)}
  `;
  const box=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" class="craft-panel"/>`;
  const g=(id,content)=>`<g data-k="${id}">${content}</g>`;
  function apply(){
  let made=0;
  for(const [index,encoded] of Object.entries(plots)){
    const key=`remaining-${String(index).padStart(3,'0')}`;
    const old=scenes[key];
    if(!old)continue;
    const [place,actor,attention,reframe]=encoded.split('|');
    const title=titles[place]||'HÉTKÖZNAPI HELYZET';
    // Each individual vignette has a distinct observed context, cognitive focus
    // and an explicit counter-perspective drawn from its curated example.
    const svg=()=>[
      g('a',`${box(33,36,334,190)}${heading(title,200,57)}${art(place,112,131,.86)}${art(actor,281,131,.86)}${flow(156,132,231,132)}`),
      g('b',`${box(90,50,220,155)}${art(attention,200,120,1.08)}${heading('EZ RAGADJA MEG A FIGYELMET',200,187)}`),
      g('c',`${box(25,44,154,170)}${box(221,44,154,170)}${art(actor,102,124,.83)}<g class="craft-em">${art(attention,298,124,.95)}</g>${heading('AMIT ÉSZLELÜNK',102,191)}${heading('AMIT KIEMELÜNK',298,191)}`),
      g('d',`${box(59,37,282,194)}${art(attention,200,115,1.02)}${heading('EGYETLEN NÉZŐPONT',200,192)}<path d="M65 46L335 218" class="sb-bad"/>`),
      g('e',`${box(23,42,166,174)}${box(211,42,166,174)}${art(attention,106,121,.78)}<g class="craft-em">${art(reframe,294,121,.83)}</g>${flow(174,122,225,122)}${heading('ELSŐ BENYOMÁS',106,193)}${heading('MÁSIK SZEMPONT',294,193)}`),
      g('f',`${box(71,47,258,174)}<g class="craft-em">${art(reframe,200,119,1.06)}</g>${heading('TUDATOS ELLENŐRZÉS',200,192)}`)
    ].join('');
    // The original six-stage timeline and individual Hungarian narration remain.
    scenes[key]={...old,css:`${old.css||''}\n${css}`,svg};
    made++;
  }
  window.BiasMapCraftedCount=made;
  }
  window.BiasMapCraftedApply=apply;
  apply();
})();
