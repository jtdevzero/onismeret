#!/usr/bin/env node
/* Language-specific discovery, exam prompts, results and stale AI requests. No network or paid AI calls. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../src/js');let checks=0;
const verify=(value,label)=>{assert.ok(value,label);checks++;};
function setup(language){
  const nodes=new Map(),topics=[{dataset:{t:'Kultúra'}}],choices=Array.from({length:4},(_,i)=>({dataset:{o:String(i)},classList:{add(){}}})),levels=['B1','B2','C1'].map(v=>({dataset:{v}}));let rendered='',pending=null;
  const node=key=>{if(!nodes.has(key))nodes.set(key,{value:'',innerHTML:'',disabled:false,readOnly:false,isConnected:true,dataset:{},focus(){},querySelectorAll(){return key==='#xLvl'?levels:[];}});return nodes.get(key);};
  const c={console,AbortController,setTimeout,clearTimeout,NAVN:0,EX:null,S:{settings:{lang:language},drills:{},exam:{mc:{ok:5,n:9}}},I:new Proxy({},{get:()=>''}),document:{addEventListener(){}},view:{querySelectorAll:q=>q==='[data-t]'?topics:q==='[data-o]'?choices:[]},$:node,
    esc:v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x])),LA:()=>`lang="${language}"`,norm:v=>String(v).trim().toLowerCase(),shuffle:a=>a,rnd:a=>a[0],fx(){},say(){},incEv(k){c.events[k]=(c.events[k]||0)+1;},events:{},addXP(n){c.xp+=n;},xp:0,skillLog(...args){c.skills.push(args);},skills:[],save(){},logMiss(){},defLevel:()=> 'A1',today:()=>1,aiErr:e=>e.code||'error',toast(){},getSample:async()=>({json:async(prompt)=>{c.prompts.push(prompt);return pending?pending():{title:'Example',text:'Example text.',questions:Array.from({length:5},(_,i)=>({q:'Question '+i+'?',o:['Yes','No','Maybe','Never'],a:0,why:'Mert.'}))};}}),prompts:[],aiConfigured:()=>false,aiAccessBadge:()=>'',missCount:()=>0,
    subShell(back,label,title,inner){for(const n of nodes.values())n.isConnected=false;nodes.clear();rendered=inner;node('#xmsg');node('#xres');node('#xtext');node('#xsend');},XT:{exam:{essays:[{type:language==='en'?'B2 First essay':language==='it'?'CILS B1 – lettera informale':'DELE B1 – correo informal',task:'Write a letter.'}]}}};
  vm.createContext(c);for(const file of ['02-course-data.js','12-practice.js','23-choice-drills.js','29-exam-prep.js','67-ai-requests.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});
  // Course loading creates XT in production; this test supplies only the exam fixture.
  const fixture={essays:[{type:language==='en'?'B2 First essay':language==='it'?'CILS B1 – lettera informale':'DELE B1 – correo informal',task:'Write a letter.'}]};c.fixture=fixture;vm.runInContext('XT.exam=fixture;',c);
  return {c,node,topics,levels,choices,run:code=>vm.runInContext(code,c),html:()=>rendered,setPending:fn=>pending=fn};
}
(async()=>{
  for(const language of ['en','it','es']){
    const t=setup(language),adj={en:'angol',it:'olasz',es:'spanyol'}[language],adv={en:'angolul',it:'olaszul',es:'spanyolul'}[language];
    verify(t.run(`practiceTile(DRILLS.find(x=>x[0]==='pron'),0)`).includes(`tipikus ${adj} kiejtési`),language+': pronunciation description follows language');
    const tile=t.run(`practiceTile(DRILLS.find(x=>x[0]==='exam'),0)`);if(language!=='en')verify(!/B2 First|IELTS/.test(tile),language+': discovery does not advertise English exams');
    t.run('renderExam()');if(language!=='en')verify(!/B2 First|IELTS/.test(t.c.view.innerHTML),language+': exam menu does not advertise English writing');
    t.run(`startExam('read')`);verify(t.c.EX.level===(language==='en'?'B2':'B1'),language+': appropriate default reading level');
    verify(t.html().includes(language==='en'?'data-v="C1"':'data-v="B1"'),language+': reading level choices match exam family');
    await t.topics[0].onclick();verify(t.c.EX.data?.questions.length===5,language+': valid five-question reading can open');const prompt=t.c.prompts[0];verify(prompt.includes(`${adj} szöveg`)&&prompt.includes(`kérdés ${adv}`),language+': actual AI prompt uses target language');
    if(language!=='en')verify(!/angol szöveg|kérdés angolul/.test(prompt),language+': no conflicting English instruction');
    t.c.S.drills.conj={ok:8,n:10};t.run(`drillStat('conj',true)`);verify(t.run(`drillResult('conj').n`)===1,language+': drill result is scoped');verify(t.c.S.drills.conj.n===10,language+': ambiguous legacy drill count is retained');
    const before=JSON.stringify(t.c.S.exam.mc);t.run(`examStat('read',true)`);verify(t.c.S.exam[language+':read'].n===1,language+': exam result is scoped');verify(JSON.stringify(t.c.S.exam.mc)===before,language+': ambiguous legacy result retained unchanged');
    t.c.S.settings.lang=language==='en'?'it':'en';verify(t.run(`examResult('read')`)===undefined&&t.run(`drillResult('conj')`)===undefined,language+': exam and drill results do not leak to another language');
  }
  {
    const t=setup('it');let release;t.setPending(()=>new Promise(r=>release=r));t.run(`startExam('read')`);const waiting=t.topics[0].onclick();await new Promise(r=>setImmediate(r));
    t.c.S.settings.lang='es';t.c.NAVN++;t.c.EX={k:'read',level:'B1',data:null,ans:{}};release({text:'Italian stale text',questions:[]});await waiting;
    verify(t.c.EX.data===null,'late reading result cannot enter another language/session');
  }
  {
    const t=setup('it');let release;t.setPending(()=>new Promise(r=>release=r));t.run(`startExam('write')`);t.node('#xtext').value=Array(65).fill('parola').join(' ');const waiting=t.node('#xsend').onclick();await new Promise(r=>setImmediate(r));
    verify(t.node('#xtext').readOnly,'writing cannot change under an in-flight assessment');t.c.S.settings.lang='es';t.c.NAVN++;t.c.EX={k:'write',text:'new text'};release({scores:{content:4,communicative:4,organisation:4,language:4}});await waiting;
    verify(t.c.xp===0&&!t.c.EX.res&&!t.c.S.exam['es:write'],'late writing response awards no XP or other-language result');
  }
  {
    const t=setup('it');t.setPending(()=>({scores:{content:4,communicative:4,organisation:4,language:4}}));t.run(`startExam('write')`);t.node('#xtext').value=Array(65).fill('parola').join(' ');await t.node('#xsend').onclick();
    verify(t.c.skills[0][1]==='B1','B1 Italian writing logs its actual task level');verify(t.c.S.exam['it:write'].n===1&&t.c.xp===10,'current writing stores only its scoped result');
  }
  {
    const t=setup('es');t.setPending(()=>null);t.run(`startExam('write')`);t.node('#xtext').value=Array(65).fill('palabra').join(' ');await t.node('#xsend').onclick();verify(t.c.xp===0&&!t.c.S.exam['es:write'],'invalid assessment cannot award XP');
  }
  for(const bad of [
    {text:'Text',questions:[]},
    {text:'Text',questions:Array.from({length:5},()=>({q:'Question?',o:['A','B','C','D'],a:-1}))},
    {text:'Text',questions:Array.from({length:5},()=>({q:'Question?',o:['A','a','C','D'],a:0}))}
  ]){
    const t=setup('es');t.setPending(()=>bad);t.run(`startExam('read')`);await t.topics[0].onclick();verify(t.c.EX.data===null&&t.node('#xmsg').innerHTML.includes('invalid_json'),'unplayable or empty reading is rejected');
  }
  {
    const t=setup('it');t.run(`CDRILLS['exam-mc']={title:'Choice',items:[{q:'Choose ___',a:'right',o:['right','wrong','other','extra'],why:'Correct.'}]};startChoice('exam-mc');`);t.choices[0].onclick();t.choices[0].onclick();
    verify(t.run(`examResult('mc').n`)===1&&t.run(`drillResult('exam-mc').n`)===1,'exam MC updates both scoped counters exactly once');verify(t.c.events.drills===1&&t.c.events.exam===1,'exam MC counts one drill event and one exam event');
  }
  console.log(`${checks} exam language and lifecycle checks passed.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
