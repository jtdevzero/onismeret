/* BiasMap HU preview: individual storyboards for the remaining cognitive biases.
 * Text comes exclusively from each concept's already-reviewed Hungarian data.
 * Eight SVG motion grammars share the site's existing minimal vector styling.
 * The production page does not load this module. */
(function () {
  'use strict';
  const records = window.BiasMapRemaining || {};
  const registry = window.BiasAnim && window.BiasAnim.SCENES;
  if (!registry) return;

  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));
  const hash = s => [...s].reduce((v,c) => ((v * 33) ^ c.charCodeAt(0)) >>> 0, 5381);
  const excerpt = (text, max = 128) => {
    const s = String(text || '').trim();
    if (s.length <= max) return s;
    const sentences = s.match(/[^.!?]+[.!?]+(?:\s|$)/gu) || [];
    if (sentences[0] && sentences[0].trim().length <= max) return sentences[0].trim();
    const cut = s.lastIndexOf(' ', max - 1);
    return s.slice(0, cut > max * .6 ? cut : max - 1).trimEnd() + '…';
  };
  const css = `
    .rem-line{stroke:var(--ink);stroke-width:2.3;stroke-linejoin:round;stroke-linecap:round;fill:none}
    .rem-accent{stroke:var(--q);stroke-width:3;stroke-linejoin:round;stroke-linecap:round;fill:none}
    .rem-soft{fill:var(--surface);stroke:var(--ink);stroke-width:2}
    .rem-focus{fill:var(--surface-2);stroke:var(--q);stroke-width:2.7}
    .rem-dot{fill:var(--q)} .rem-good{stroke:var(--good);stroke-width:3;fill:none;stroke-linecap:round}
    .rem-title{font:600 12px var(--display);fill:var(--ink);text-anchor:middle}
    .rem-small{font:500 10px var(--mono);fill:var(--muted);text-anchor:middle}
  `;
  const rect = (x,y,w,h,klass='rem-soft') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" class="${klass}"/>`;
  const circle = (x,y,r,klass='rem-soft') => `<circle cx="${x}" cy="${y}" r="${r}" class="${klass}"/>`;
  const line = (d,klass='rem-line') => `<path d="${d}" class="${klass}"/>`;
  const group = (id,content) => `<g data-k="${id}">${content}</g>`;

  function drawing(style, seed, family) {
    const d = (seed % 29) - 14;
    const tick = `<path d="M294 117l15 15 28-34" class="rem-good"/>`;
    let before = '', after = '';
    switch (style) {
      case 0: // Attention: one item eclipses the many
        before = Array.from({length:12},(_,i)=>circle(56+(i%4)*34,67+Math.floor(i/4)*35,10,i===seed%12?'rem-focus':'rem-soft')).join('');
        after = `${circle(294,113,47,'rem-focus')}${circle(294,113,19,'rem-dot')}`;
        break;
      case 1: // Skewed scale versus a balanced assessment
        before = `${line('M105 61V184M42 94H168M65 94L43 155H87ZM145 94L123 155H167Z')}${rect(46,154,40,14,'rem-focus')}`;
        after = `${line('M296 61V184M237 98H355M258 98L238 157H278ZM336 98L316 157H356Z')}${rect(239,156,38,11)}${rect(317,156,38,11)}`;
        break;
      case 2: // A sequence with changing interpretation
        before = [0,1,2,3].map(i=>rect(35+i*34,79+(i%2)*16,27,56,i===seed%4?'rem-focus':'rem-soft')).join('');
        after = `${line('M234 147L257 118L288 132L326 77L351 94','rem-accent')}${line('M234 170H360M234 170V54')}`;
        break;
      case 3: // The narrow filter and expanded view
        before = `${rect(45,65,112,104)}${line('M58 91H144M58 111H144M58 131H144')}${rect(69+d/3,83,65,17,'rem-focus')}`;
        after = `${circle(296,115,62)}${circle(296,115,37,'rem-focus')}${circle(296,115,12,'rem-dot')}`;
        break;
      case 4: // Comparing alternatives
        before = `${rect(45,75,41,100,'rem-focus')}${rect(96,96,41,79)}${line('M37 187H144')}`;
        after = `${rect(241,113,32,62)}${rect(280,83,32,92,'rem-focus')}${rect(319,65,32,110)}${line('M232 187H362')}`;
        break;
      case 5: // Groups versus individuals
        before = [0,1,2,3].map(i=>circle(58+(i%2)*65,79+Math.floor(i/2)*65,22,i===seed%4?'rem-focus':'rem-soft')).join('');
        after = [0,1,2,3,4].map(i=>circle(249+(i%3)*42,80+Math.floor(i/3)*68,15,i===seed%5?'rem-focus':'rem-soft')).join('');
        break;
      case 6: // One memory versus the complete timeline
        before = `${line('M39 155H157')}${circle(58,155,10)}${circle(93,155,10,'rem-focus')}${circle(130,155,10)}${line('M93 145V69','rem-accent')}`;
        after = `${line('M232 155H365')}${[0,1,2,3,4].map(i=>circle(242+i*28,155,8,i===seed%5?'rem-focus':'rem-soft')).join('')}${line('M243 100L271 119L298 78L326 115L354 88','rem-accent')}`;
        break;
      default: // Competing interpretations, adding a second perspective
        before = `${circle(101,111,53,'rem-focus')}${line('M75 111H127M101 85V137')}`;
        after = `${circle(274,107,38)}${circle(324,107,38,'rem-focus')}${line('M274 107L324 107','rem-accent')}`;
    }
    // A distinct rhythmic marker per family and concept, without new graphics assets.
    const rhythm = Array.from({length:5},(_,i)=>rect(152+i*19,218,12,5,i===seed%5?'rem-focus':'rem-soft')).join('');
    return `${group('first',before)}${group('bridge',`${line('M188 117H216M207 108L216 117L207 126','rem-accent')}`)}${group('second',after)}${group('insight',tick)}${group('labels',
      `<text x="100" y="207" class="rem-title">ELSŐ BENYOMÁS</text>`+
      `<text x="300" y="207" class="rem-title">TÁGABB KÉP</text>`+
      `<text x="200" y="255" class="rem-small">${esc(family.replace(/-/g,' ').toUpperCase())}</text>`+
      rhythm)}`;
  }

  for (const [key,data] of Object.entries(records)) {
    const seed = hash(key + data.family);
    const style = seed % 8;
    const setup = excerpt(data.example, 135);
    const why = excerpt(data.explanation, 142);
    const notice = excerpt(data.warning, 135);
    const help = excerpt(data.action, 140);
    registry[key] = {
      q:data.quadrant, viewBox:'0 0 400 272', css,
      text:{hu:{name:data.name,shareTitle:`${data.name} – animáció`,ecline:help,
        caps:[esc(setup),esc(why),esc(notice),`<b>Mit tehetsz?</b> ${esc(help)}`],
        say:[setup,why,notice,help]}},
      svg(){return drawing(style,seed,data.family);},
      S0:{first:0,bridge:0,second:0,insight:0,labels:0,zoom:.86},
      render(S,k){
        for (const part of ['first','bridge','second','insight','labels']) {
          k(part).style.opacity = String(Math.max(0,Math.min(1,S[part])));
        }
        k('first').setAttribute('transform',`translate(${100*(1-S.zoom)} ${112*(1-S.zoom)}) scale(${S.zoom})`);
        k('second').setAttribute('transform',`translate(${300*(1-S.zoom)} ${112*(1-S.zoom)}) scale(${S.zoom})`);
      },
      beats:[
        {steps:[{to:{first:1,zoom:1},ms:800,ease:'out'},{to:{labels:1},ms:650}],hold:1100},
        {steps:[{to:{bridge:1},ms:550},{to:{second:1},ms:850,ease:'out'}],hold:900},
        {steps:[{to:{insight:1},ms:600,ease:'out'}],hold:1900},
        {steps:[{to:{insight:1},ms:250}],hold:3000}
      ]
    };
  }
})();
