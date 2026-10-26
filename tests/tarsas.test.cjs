#!/usr/bin/env node
'use strict';
/* Dependency-free state/interaction regressions for the standalone Társasest PWA.
   Run: node tests/tarsas.test.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.resolve(__dirname, '..', 'tarsas');
const GAME_KEYS = ['impostor', 'never', 'likely', 'bomb', 'wolf', 'codes', 'taboo', 'act', 'wave', 'story', 'bluff', 'scale', 'estimate', 'dreams'];

function createApp(seed = {}) {
  const listeners = new Map(), spoken = [], nodes = new Map();
  const local = new Map(Object.entries(seed.local || {})), session = new Map(Object.entries(seed.session || {}));
  let now = 1803500000000;
  const noop = () => {};
  const storage = map => ({ getItem:k => map.has(k) ? map.get(k) : null, setItem:(k,v) => map.set(k,String(v)), removeItem:k => map.delete(k), clear:() => map.clear() });
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, {
      id, hidden:false, innerHTML:'', textContent:'', value:'', checked:false, disabled:false,
      dataset:{}, style:{setProperty:noop}, classList:{add:noop,remove:noop,toggle:noop},
      focus:noop, scrollIntoView:noop, setAttribute:noop, removeAttribute:noop,
      addEventListener:noop, querySelector:() => null, querySelectorAll:() => [],
      closest:() => null, insertAdjacentHTML:noop
    });
    return nodes.get(id);
  };
  class Clock extends Date { static now() { return now; } }
  const location = { pathname:'/onismeret/tarsas/', hash:seed.hash || '', protocol:'http:', origin:'http://localhost', href:'http://localhost/onismeret/tarsas/' };
  const setLocation = value => { if (typeof value !== 'string') return; location.hash = value.includes('#') ? '#' + value.split('#')[1] : ''; location.href = location.origin + (value.startsWith('/') ? value : location.pathname + location.hash); };
  const document = {
    getElementById:node, querySelector:() => null, querySelectorAll:() => [], visibilityState:'visible', hidden:false,
    documentElement:{style:{setProperty:noop}}, body:node('body'),
    addEventListener:(name,fn) => { const list=listeners.get(name)||[]; list.push(fn); listeners.set(name,list); }
  };
  const context = {
    console, Date:Clock, URL, Math, JSON, Number, String, Object, Array, Map, Set, Promise,
    document, location, navigator:{}, localStorage:storage(local),sessionStorage:storage(session),
    history:{replaceState:(_s,_t,url)=>setLocation(url),pushState:(_s,_t,url)=>setLocation(url),back:noop},
    addEventListener:(name,fn) => { const list=listeners.get(name)||[]; list.push(fn); listeners.set(name,list); },
    scrollTo:noop, setInterval:noop, clearInterval:noop, setTimeout:noop,clearTimeout:noop,
    requestAnimationFrame:noop, cancelAnimationFrame:noop,
    confirm:() => true, alert:noop,
    speechSynthesis:{getVoices:()=>[],cancel:noop,speak:u=>spoken.push(u.text)},
    SpeechSynthesisUtterance:class {constructor(text){this.text=text;}},
    matchMedia:() => ({matches:false,addEventListener:noop}),
  };
  context.window = context;
  vm.createContext(context);
  const html = fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g)].map(m=>m[1].split('?')[0]);
  assert(scripts.includes('app.js') && scripts.includes('data.js'), 'index loads app and data');
  for (const script of scripts) vm.runInContext(fs.readFileSync(path.join(ROOT,script),'utf8'),context,{filename:script});
  vm.runInContext('if (typeof initTarsas === "function") initTarsas();',context);
  const run = src => vm.runInContext(src,context);
  const plain = value => JSON.parse(JSON.stringify(value));
  return {
    context, nodes, spoken, local, session, scripts,
    run, json:src=>plain(run(src)), html:()=>node('app').innerHTML,
    advance:ms=>{now+=ms;},
    event(name) { for (const fn of listeners.get(name)||[]) fn({type:name}); },
    action(name, value, el) { context.__testValue=value;context.__testEl=el; return run(`{ const result=A[${JSON.stringify(name)}](__testValue,__testEl); if(result!==false){save();render();} result; }`); },
    submit(name, fields) { const elements={}; for(const [k,v] of Object.entries(fields)) elements[k]={value:String(v)}; const form={...elements,elements}; context.__testForm=form; return run(`{ const result=A[${JSON.stringify(name)}](__testForm);save();render();result; }`); }
  };
}
let passed = 0;
const test = (name,fn) => { try { fn(); passed++; console.log('✓ '+name); } catch(error) { console.error('✗ '+name); throw error; } };
const seedPlayers = app => app.run(`S.players=['Anna','Béla','Csilla','Dani','Eszter','Feri'];S.settings.sound=false;S.settings.vibrate=false;`);

test('all fourteen games load through the production index and every setup renders', () => {
  const app=createApp(); seedPlayers(app);
  assert.deepEqual(app.json('Object.keys(GAMES).sort()'), [...GAME_KEYS].sort());
  for (const key of GAME_KEYS) {
    app.run(`go(${JSON.stringify(key)});`);
    assert(app.html().length>50, key+' setup has content');
    assert(!/undefined|NaN/.test(app.html()),key+' setup contains valid data');
  }
});

test('Impostor final guess keeps the solution hidden until the guess is resolved', () => {
  const app=createApp();
  app.run(`R.view='impostor';R.games.impostor={phase:'vote',mode:'szo',imps:['Anna'],voted:'Anna',word:'SECRET_REGRESSION',catName:'teszt',order:['Anna','Béla','Csilla']};`);
  app.action('impReveal');
  assert.equal(app.run('R.games.impostor.phase'),'guess');
  assert(!app.html().includes('SECRET_REGRESSION'),'the caught impostor cannot read the answer');
  app.action('impGuess','yes');
  assert.equal(app.run('R.games.impostor.phase'),'reveal');
  assert(app.html().includes('SECRET_REGRESSION'));
});

test('Vérfarkas automatic and manual narration never reads the private victim name', () => {
  const app=createApp();
  app.run(`R.view='wolf';R.games.wolf={phase:'night',skin:'farkas',players:[{name:'PRIVATE_VICTIM',role:'falusi',alive:true},{name:'Boszi',role:'boszi',alive:true}],steps:['boszi'],step:0,night:1,sel:{kill:'PRIVATE_VICTIM'},witch:{heal:true,poison:true}};render();`);
  assert(app.spoken.length>0,'automatic narration ran');
  assert(app.spoken.every(t=>!t.includes('PRIVATE_VICTIM')),'secret target not spoken');
  assert(app.html().includes('PRIVATE_VICTIM'),'narrator still sees secret target');
  const readback=[...app.html().matchAll(/data-a="wolfSay"\s+data-v="([^"]*)"/g)];
  assert(readback.every(m=>!m[1].includes('PRIVATE_VICTIM')),'manual narration also safe');
});

test('disabling adult cards sanitizes running decks and safely handles adult-only decks', () => {
  const app=createApp();
  app.run(`S.settings.spicy=true;R.view='settings';R.games.never={phase:'play',cats:['light','pikans'],deck:[['pikans',0],['light',0]],pos:0};R.games.likely={phase:'card',cats:['pikans'],deck:[['pikans',0]],pos:0,tally:{}};`);
  app.action('setting','spicy',{checked:false});
  assert.equal(app.run(`R.games.never.deck.some(([c])=>D.never[c].spicy)`),false);
  assert.equal(app.run('R.games.likely.phase'),'setup');
  app.run(`go('likely');`);
  app.run(`go('never');`);
  assert(!app.html().includes('Pikáns 18+'));
});

test('backgrounding covers dealt roles and the Codenames key', () => {
  const app=createApp(); seedPlayers(app);
  app.run(`R.view='impostor';R.games.impostor={phase:'deal',deal:{order:['Anna'],i:0,shown:true}};R.games.codes={key:true};hideSecrets();`);
  assert.equal(app.run('R.games.impostor.deal.shown'),false);
  assert.equal(app.run('R.games.codes.key'),false);
});

// New-game interaction tests below intentionally use the same public actions as the UI.

test('Kerülőút and Mutasd! score complete two-team rounds without duplicate commits', () => {
  for (const key of ['taboo','act']) {
    const app=createApp();seedPlayers(app);app.run(`go('${key}');`);
    app.action('partyStart',key); assert.equal(app.run(`R.games.${key}.phase`),'ready');
    app.action('partyBegin',key); assert.equal(app.run(`R.games.${key}.phase`),'play');
    app.action('partyMark',key+'|correct');
    app.action('partyMark',key+'|pass');
    if(key==='taboo') app.action('partyMark',key+'|penalty');
    app.action('partyEndTurn',key);
    const first=app.json(`R.games.${key}.teams.map(t=>t.score)`);
    app.action('partyEndTurn',key);
    assert.deepEqual(app.json(`R.games.${key}.teams.map(t=>t.score)`),first,'ending twice does not score twice');
    assert.equal(app.run(`R.games.${key}.phase`),'result');
    app.action('partyNext',key); app.action('partyBegin',key);
    app.advance(120000); app.run(`TICKERS.${key}(R.games.${key});render();`);
    assert.equal(app.run(`R.games.${key}.phase`),'result','expired timer ends active round');
    app.action('partyFinish',key);
    assert.equal(app.run(`R.games.${key}.phase`),'end');
    assert.equal(app.run(`R.results.filter(x=>x.game==='${key}').length`),1);
    app.action('partyFinish',key);
    assert.equal(app.run(`R.results.filter(x=>x.game==='${key}').length`),1);
  }
});

test('Közös hullám hides each starting word and normalizes matching answers', () => {
  const app=createApp();seedPlayers(app);app.run(`go('wave');`);app.action('waveStart');
  const words=app.json('R.games.wave.words');
  assert(!app.html().includes(words[0]) && !app.html().includes(words[1]),'handoff is private');
  app.action('dealShow');assert(app.html().includes(words[0]));assert(!app.html().includes(words[1]));
  app.action('dealNext');assert(!app.html().includes(words[0]));
  app.action('dealShow');assert(app.html().includes(words[1]));
  app.action('dealNext');assert.equal(app.run('R.games.wave.phase'),'say');
  app.action('waveDifferent');app.submit('waveWords',{w0:'alma',w1:'ALMA'});
  assert.equal(app.run('R.games.wave.phase'),'end');
  assert.equal(app.run(`R.results.filter(x=>x.game==='wave').length`),1);
  app.action('waveMatched');assert.equal(app.run(`R.results.filter(x=>x.game==='wave').length`),1);
});

test('Sztorilánc exposes only the previous sentence, escapes text, and protects a saved game', () => {
  const app=createApp();app.run(`S.players=['Anna','Béla','Csilla'];S.settings.sound=false;go('story');`);
  app.action('storyStart');const original=app.run('R.games.story.sentences[0].text');
  assert(!app.html().includes(original));
  app.action('storyShow');assert(app.html().includes(original));
  app.submit('storySubmit',{sentence:'<img src=x onerror=alert(1)> Első mondat.'});
  assert.equal(app.run('R.games.story.step'),1);
  assert(!app.html().includes('Első mondat.'));
  app.action('storyShow');assert(app.html().includes('&lt;img'));assert(!app.html().includes(original));
  app.run('hideSecrets();render();');assert.equal(app.run('R.games.story.shown'),false);
  app.action('storyShow');app.submit('storySubmit',{sentence:'Második mondat.'});
  app.action('storyShow');assert(app.html().includes('Második mondat.'));assert(!app.html().includes('Első mondat.'));
  app.submit('storySubmit',{sentence:'Harmadik mondat.'});
  assert.equal(app.run('R.games.story.phase'),'end');assert.equal(app.run('R.games.story.sentences.length'),4);
  assert(app.html().includes('Első mondat.') && app.html().includes('Második mondat.') && app.html().includes('Harmadik mondat.'));
  assert(!app.html().includes('<img src=x'));
  const restored=createApp({local:Object.fromEntries(app.local),session:Object.fromEntries(app.session)});
  assert.equal(restored.run('R.games.story.phase'),'end');assert.equal(restored.run('R.games.story.sentences.length'),4);
});

test('Skála keeps its target secret from guessers and awards a completed round once', () => {
  const app=createApp();app.run(`S.players=['Anna','Béla','Csilla'];S.settings.sound=false;go('scale');`);
  app.action('scaleStart');assert.equal(app.run('R.games.scale.phase'),'cluecover');
  app.run('R.games.scale.target=73;');
  app.action('scaleShow');assert(app.html().includes('73'));
  app.submit('scaleClue',{clue:'<b>Reggeli</b>'});assert.equal(app.run('R.games.scale.phase'),'guesscover');
  app.action('scaleGuessShow');assert.equal(app.run('R.games.scale.phase'),'guess');
  assert(!app.html().includes('value="73"'),'secret target does not leak as slider value');
  assert(app.html().includes('&lt;b&gt;Reggeli&lt;/b&gt;'));
  app.submit('scaleGuess',{guess:'70'});assert.equal(app.run('R.games.scale.phase'),'reveal');
  assert.equal(app.run('R.games.scale.gain'),4);
  const score=app.json('R.games.scale.scores');app.submit('scaleGuess',{guess:'73'});
  assert.deepEqual(app.json('R.games.scale.scores'),score,'repeated submission does not score twice');
  app.action('scaleEnd');assert.equal(app.run('R.games.scale.phase'),'end');
  assert.equal(app.run(`R.results.filter(x=>x.game==='scale').length`),1);
});

test('Becsüld meg! validates private guesses and gives tied distances equal points', () => {
  const app=createApp();app.run(`S.players=['Anna','Béla'];S.settings.sound=false;go('estimate');`);
  app.action('estimateStart');app.run('R.games.estimate.deck=[20];');
  app.action('estimateShow');app.submit('estimateAnswer',{answer:'Infinity'});
  assert.equal(app.run('R.games.estimate.player'),0);assert.equal(app.run('R.games.estimate.answers.length'),0);
  app.submit('estimateAnswer',{answer:'60'});assert.equal(app.run('R.games.estimate.phase'),'cover');
  assert(!app.html().includes('value="60"'),'previous guess is not in next handoff');
  app.action('estimateShow');app.submit('estimateAnswer',{answer:'68'});
  assert.equal(app.run('R.games.estimate.phase'),'reveal');
  assert.deepEqual(app.json('R.games.estimate.ranks'),[1,1]);
  assert.deepEqual(app.json('R.games.estimate.roundPoints'),[3,3]);
  app.action('estimateNext');assert.equal(app.run('R.games.estimate.phase'),'end');
  assert.equal(app.run(`R.results.filter(x=>x.game==='estimate').length`),1);
});

test('Kamulexikon enforces private unique answers, blocks own votes and scores correctly', () => {
  const app=createApp();app.run(`S.players=['Anna','Béla','Csilla'];S.settings.sound=false;go('bluff');`);
  app.action('bluffStart');
  app.submit('bluffSubmit',{answer:'This must not be accepted while covered.'});
  assert.equal(app.run('R.games.bluff.entries.length'),0);
  for(let i=0;i<3;i++) {
    app.action('bluffOpen');
    if(i===1) {app.submit('bluffSubmit',{answer:'Kitalált válasz szám 0.'});assert.equal(app.run('R.games.bluff.idx'),1);}
    app.submit('bluffSubmit',{answer:'Kitalált válasz szám '+i+'.'});
    assert(!app.html().includes('Kitalált válasz szám '+i+'.'),'private answer covered after save');
  }
  assert.equal(app.run('R.games.bluff.phase'),'vote');
  for(let i=0;i<3;i++) {
    app.action('bluffOpen');
    const own=app.run('R.games.bluff.options.findIndex(o=>o.owners.includes(R.games.bluff.voteOrder[R.games.bluff.voteIndex]))');
    app.action('bluffVote',String(own));assert.equal(app.run('R.games.bluff.selected'),null);
    const option=app.run(i===0?'R.games.bluff.options.findIndex(o=>o.correct)':'R.games.bluff.options.findIndex(o=>o.owners.includes(0))');
    app.action('bluffVote',String(option));app.action('bluffConfirmVote');
  }
  assert.equal(app.run('R.games.bluff.phase'),'result');
  assert.deepEqual(app.json('R.games.bluff.scores'),[4,0,0]);
  app.action('bluffFinish');assert.equal(app.run('R.games.bluff.phase'),'end');
  app.action('bluffFinish');assert.equal(app.run(`R.results.filter(x=>x.game==='bluff').length`),1);
});

test('custom question packs persist, escape content, and remove safely from running decks', () => {
  const app=createApp();seedPlayers(app);app.run(`go('packs');`);
  app.context.packForm={elements:{name:{value:'Saját teszt'},game:{value:'never'},items:{value:'<img src=x> Egyedi kérdés.\nMásik kérdés.'},spicy:{checked:false}}};
  app.run('A.packCreate(packForm);save();render();');
  const id=app.run('S.customPacks[0].id');assert.match(id,/^custom_/);
  app.run(`go('never');R.games.never.cats=[${JSON.stringify(id)}];`);app.action('neverStart');
  assert.equal(app.run('R.games.never.deck.length'),2);
  while(!app.html().includes('Egyedi kérdés.')) app.action('neverNext');
  assert(app.html().includes('&lt;img src=x&gt;'));assert(!app.html().includes('<img src=x>'));
  const restored=createApp({local:Object.fromEntries(app.local),session:Object.fromEntries(app.session)});
  assert.equal(restored.run('S.customPacks.length'),1);assert.equal(restored.run(`D.never[${JSON.stringify(id)}].items.length`),2);
  app.action('packRemove',id);
  assert.equal(app.run('S.customPacks.length'),0);
  assert.equal(app.run(`Object.hasOwn(D.never,${JSON.stringify(id)})`),false);
  assert.equal(app.run('R.games.never.phase'),'setup');
});

test('favorites, pass and never-show-again survive exhaustion without reintroducing blocked cards', () => {
  const app=createApp();app.run(`go('never');D.never.only_test={name:'Teszt',items:['Egyetlen kérdés.']};R.games.never.cats=['only_test'];`);
  app.action('neverStart');app.action('cardFavorite','never');
  assert.deepEqual(app.json('S.cardPrefs.never.favorites'),['only_test|0']);
  app.action('cardBlock','never');assert.equal(app.run('R.games.never.phase'),'exhausted');
  assert(app.html().includes('már láttátok'));
  app.action('cardSeenReset','never');assert.equal(app.run('R.games.never.phase'),'exhausted');
  assert.equal(app.run('R.games.never.deck.length'),0,'blocked card never returns');
  app.action('cardUnblockAll','never');app.action('cardSeenReset','never');
  assert.equal(app.run('R.games.never.phase'),'play');
  app.action('cardPass','never');assert.equal(app.run('R.games.never.phase'),'exhausted');
});

test('recommendations respect player counts and an evening can be planned, scored and completed', () => {
  const app=createApp();seedPlayers(app);app.run(`go('recommend');`);
  app.submit('recommendSet',{count:'2',time:'10',mood:'közös'});
  app.action('eveningSuggested');
  const queue=app.json('R.evening.queue');assert(queue.length>0&&queue.length<=3);
  assert.equal(queue[0].game,'wave','cooperative two-player game ranks first for cooperative mood');
  assert.equal(app.run('R.evening.queue.every(x=>GAMES[x.game].min<=2)'),true);
  assert(!app.html().includes('perc perc'));
  app.run(`recordResult('wave',[{name:'Anna',points:9},{name:'Béla',points:9}]);render();`);
  assert(app.html().includes('Anna')&&app.html().includes('Béla')&&app.html().includes('estpont'));
  app.action('eveningComplete',queue[0].game);
  assert.equal(app.run('R.evening.queue[0].done'),true);
  app.action('eveningToggle','0');assert.equal(app.run('R.evening.queue[0].done'),false);
});

test('all fourteen tutorials and example rounds leave real game scores untouched', () => {
  const app=createApp();seedPlayers(app);app.run(`go('bomb');`);
  const before=app.json('R.games');
  for(const key of GAME_KEYS){
    app.action('help',key);assert(app.html().includes('félperces szabályok'));
    app.action('practiceStart',key);assert.equal(app.run('R.practice.revealed'),false);
    app.action('practiceReveal');assert.equal(app.run('R.practice.revealed'),true);
  }
  assert.deepEqual(app.json('R.games'),before);
  assert.equal(app.run('(R.results||[]).length'),0);
});

test('original game results record once and ongoing score summaries update in place', () => {
  const app=createApp();seedPlayers(app);
  app.run(`go('codes');`);app.action('codesNew');
  const black=app.run(`codesBoard(R.games.codes.seed).colors.indexOf('a')`);
  app.action('codesTap',String(black));assert.equal(app.run('R.games.codes.phase'),'play');
  app.action('codesTap',String(black));assert.equal(app.run('R.games.codes.phase'),'end');
  app.action('codesTap',String(black));assert.equal(app.run(`R.results.filter(x=>x.game==='codes').length`),1);
  assert.deepEqual(app.json(`R.results.find(x=>x.game==='codes').entries.map(x=>x.points).sort()`),[0,1]);
  app.run(`go('likely');R.games.likely.tally={Anna:['címet kapott'],Béla:['első','második']};R.games.likely.phase='setup';`);
  app.action('likelyEnd');app.action('likelyEnd');
  assert.equal(app.run(`R.results.filter(x=>x.game==='likely').length`),1);
  app.run(`R.games.likely.tally.Anna.push('másik cím');`);app.action('likelyEnd');
  assert.equal(app.run(`R.results.find(x=>x.game==='likely').entries.find(x=>x.name==='Anna').points`),2);
  app.run(`go('bomb');R.games.bomb.losses={Anna:1,Béla:3};`);app.action('bombEnd');
  assert.equal(app.run(`R.results.find(x=>x.game==='bomb').entries.find(x=>x.name==='Anna').points`),-1);
  assert.equal(app.run(`R.results.find(x=>x.game==='bomb').entries.find(x=>x.name==='Béla').points`),-3);
  app.action('bombEnd');assert.equal(app.run(`R.results.filter(x=>x.game==='bomb').length`),1);
  app.run(`go('wolf');R.games.wolf={phase:'end',skin:'farkas',winner:'falu',players:[{name:'Anna',role:'falusi',alive:true},{name:'Béla',role:'farkas',alive:false}]};render();render();`);
  assert.equal(app.run(`R.results.filter(x=>x.game==='wolf').length`),1);
  assert.deepEqual(app.json(`R.results.find(x=>x.game==='wolf').entries.map(x=>x.points)`),[1,0]);
});

test('Ki a legvalószínűbb? exhausted decks can show results and return without losing the snapshot', () => {
  const app=createApp();seedPlayers(app);
  app.run(`go('likely');R.games.likely.phase='exhausted';R.games.likely.deck=[];R.games.likely.pos=0;R.games.likely.tally={Anna:['első cím'],Béla:['második cím']};render();`);
  assert(app.html().includes('data-a="likelyEnd"'),'results remain reachable from exhausted deck');
  app.action('likelyEnd');assert.equal(app.run('R.games.likely.phase'),'end');
  assert(app.html().includes('Az este címei')&&app.html().includes('első cím'));
  assert.equal(app.run(`R.results.filter(x=>x.game==='likely').length`),1);
  app.action('likelyBack');assert.equal(app.run('R.games.likely.phase'),'exhausted');
  assert(app.html().includes('már láttátok'));
  app.action('likelyEnd');assert.equal(app.run('R.games.likely.phase'),'end');
  assert.equal(app.run(`R.results.filter(x=>x.game==='likely').length`),1,'returning to results upserts the same summary');
});

if (require.main===module) test('Álomképek private hands, votes, scoring, rotation and restore',()=>{
 const a=createApp();a.run("S.players=['Anna','Béla','Csilla','Dani'];go('dreams');A.dreamStart();");
 assert.equal(a.run('new Set(R.games.dreams.hands.flat()).size'),16);
 assert(!a.html().includes('dream-art'));
 a.action('dreamOpen');const truth=a.run('R.games.dreams.hands[0][0]');a.action('dreamPick',String(truth));a.action('dreamConfirm');
 a.submit('dreamClue',{clue:'<b>Utazás</b>'});assert(a.html().includes('&lt;b&gt;'));
 for(let i=1;i<4;i++){a.action('dreamOpen');a.action('dreamPick',String(a.run(`R.games.dreams.hands[${i}][0]`)));a.action('dreamConfirm');}
 assert.equal(a.run('R.games.dreams.phase'),'vote');
 for(let i=1;i<4;i++){a.action('dreamOpen');a.action('dreamPick',String(a.run(`R.games.dreams.picks[${i}]`)));assert.equal(a.run('R.games.dreams.selected'),null);a.action('dreamPick',String(i===3?a.run('R.games.dreams.picks[1]'):truth));a.action('dreamConfirm');}
 assert.deepEqual(a.json('R.games.dreams.scores'),[3,4,3,0]);
 a.action('dreamConfirm');assert.deepEqual(a.json('R.games.dreams.scores'),[3,4,3,0]);
 a.action('dreamNext');assert.equal(a.run('R.games.dreams.actor'),1);
 a.action('dreamOpen');a.run("document.visibilityState='hidden'");a.event('visibilitychange');assert.equal(a.run('R.games.dreams.open'),false);
 const b=createApp({local:Object.fromEntries(a.local),session:Object.fromEntries(a.session)});assert.equal(b.run('R.games.dreams.open'),false);
});
test('Álomképek everyone and nobody guesses scoring and final record',()=>{
 for(const all of [true,false]){
 const a=createApp();a.run(`S.players=['A','B','C'];go('dreams');A.dreamStart();Object.assign(R.games.dreams,{phase:'vote',actor:2,open:true,picks:[0,1,2],options:[0,1,2],votes:[null,${all?0:2},null],selected:${all?0:1}});A.dreamConfirm();`);
 assert.deepEqual(a.json('R.games.dreams.scores'),all?[0,2,2]:[0,3,3]);
 a.action('dreamFinish');a.action('dreamFinish');assert.equal(a.run("R.results.filter(x=>x.game==='dreams').length"),1);
 }
});

module.exports={createApp,seedPlayers,test,GAME_KEYS};

console.log(`\n${passed} Társasest regression tests passed.`);
