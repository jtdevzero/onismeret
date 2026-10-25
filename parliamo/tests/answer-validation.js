#!/usr/bin/env node
/* Translation flexibility must preserve meaning; form-focused tasks stay strict. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ctx=vm.createContext({S:{settings:{lang:'en'}},document:{querySelector:()=>null}});
for(const name of ['02-course-data.js','05-helpers.js'])vm.runInContext(fs.readFileSync(path.join(root,'src/js',name),'utf8'),ctx,{filename:name});
const run=code=>vm.runInContext(code,ctx);
let count=0;
function answer(l,user,expected,type){ctx.S.settings.lang=l;return run(`check(${JSON.stringify(user)},${JSON.stringify(expected)},${JSON.stringify(type?{type}:{})})`);}
function accepts(l,user,expected,type='translation'){const r=answer(l,user,expected,type);assert.equal(r.ok,true,`${l}: ${user} should match ${expected} in ${type}`);count++;return r;}
function rejects(l,user,expected,type='translation'){const r=answer(l,user,expected,type);assert.equal(r.ok,false,`${l}: ${user} must not match ${expected} in ${type}`);assert.ok(r.hint);count++;return r;}

accepts('en','  COULD I HAVE A COFFEE?! ',['Could I have a coffee?']);
accepts('en','I’m from Budapest.',['I am from Budapest.']);
accepts('en',"I don't know.",['I do not know.']);
accepts('en',"I'd like a coffee.",['Could I have a coffee, please?']);
accepts('en','Please may I get a coffee?',['I would like a coffee, please.']);
accepts('en','Can we have two tickets?',['We would like two tickets.']);
accepts('en','Good evening.',['Good morning.','Good evening.']);
rejects('en','We would like a coffee.',['Could I have a coffee, please?']);
rejects('en','I would like two coffees.',['Could I have a coffee, please?']);
rejects('en','I would not like a coffee.',['Could I have a coffee, please?']);
rejects('en','I know.',['I do not know.']);
rejects('en','Could I have to go home?',['I would like to go home.']);
rejects('en','I would like to make an appointment.',['Could I have to make an appointment?']);
rejects('en','I want a coffee.',['Could I have a coffee, please?']);

accepts('it','Posso avere un caffè?',['Vorrei un caffè, per favore.']);
accepts('it','Potrei avere un caffè, per piacere?',['Vorrei un caffè.']);
const accentIt=accepts('it','Vorrei un caffe.',['Vorrei un caffè.']);assert.ok(accentIt.warn,'an accent-only match includes a correction');
rejects('it','Non vorrei un caffè.',['Vorrei un caffè, per favore.']);
rejects('it','Vorremmo un caffè.',['Vorrei un caffè.']);
rejects('it','Vorrei due caffè.',['Vorrei un caffè.']);

accepts('es','¿Puedo tomar un café?',['Quisiera un café, por favor.']);
accepts('es','Me gustaría un café.',['Podría tomar un café, por favor.']);
const accentEs=accepts('es','Querría un cafe, por favor.',['Quisiera un café.']);assert.ok(accentEs.warn,'an alternative with missing accents includes a correction');
rejects('es','No quisiera un café.',['Quisiera un café, por favor.']);
rejects('es','Quisiéramos un café.',['Quisiera un café.']);
rejects('es','Quisiera dos cafés.',['Quisiera un café.']);

for(const [l,bare,full] of [['en','film','a film'],['en','go','to go'],['it','caffè','il caffè'],['it','acqua',"l'acqua"],['es','café','el café']]){
  rejects(l,bare,[full],'word');rejects(l,bare,[full],'translation');
  accepts(l,full,[full],'word');
}
for(const type of ['grammar','dictation']){
  rejects('en','I am here.',["I'm here."],type);
  rejects('en','Could I have a coffee?',["I'd like a coffee."],type);
  rejects('it','Posso avere un caffè?',['Vorrei un caffè.'],type);
  rejects('es','Me gustaría un café.',['Quisiera un café.'],type);
  accepts('en',"I'm here!",["I'm here."],type);
  const accent=accepts('es','El cafe.',['El café.'],type);assert.ok(accent.warn);
}
assert.equal(answer('en','Can I have a coffee?',["I'd like a coffee."]).ok,false,'paraphrases require an explicit translation context');count++;
rejects('en','   ',['hello']);
rejects('en','hello',[]);
assert.doesNotMatch(rejects('en','film',['a film'],'word').hint,/a film/i,'retry hints do not reveal the full answer');
console.log(`${count} answer-validation checks passed.`);
