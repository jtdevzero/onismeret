#!/usr/bin/env node
/* Regression tests: retry grading and discoverability of grouped practice. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=name=>fs.readFileSync(path.join(__dirname,'../src/js',name),'utf8');
const elements=new Map();
const context={console,document:{addEventListener(){},querySelector(){return null;}},view:{innerHTML:'',querySelectorAll(){return[];}},esc:v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'),P:null,S:{drills:{}},POOL:[],CDRILLS:{},LESSONS:[],STORIES:[{level:'A1'},{level:'B1'}],XT:{off:{reads:[]},mock:[{}],ser:[{}]},I:{},lang:()=> 'en',LG:()=>({adv:'angolul',drills:['mock','examiner','journal','serial','read','miss','pod','pron','acc','exam','wcourse','build','ai','speak','story','conj','tenses','articles','preps','phrasal','cond','dict']}),canSpeak:()=>true,missCount:()=>2,bindAISetup(){},$:selector=>{if(!elements.has(selector))elements.set(selector,{});return elements.get(selector);},norm:v=>String(v).trim().toLowerCase(),itemResult(){context.schedules++;},schedules:0,easier:e=>({...e,retry:true}),shuffle:a=>a};
vm.createContext(context);
vm.runInContext(source('10-lessons.js'),context);
// Failed originals stay failed; a successful follow-up never changes XP, accuracy or FSRS.
vm.runInContext(`P={kind:'daily',queue:[{t:'type',cid:'word'}, {t:'mc'}, {t:'mc'}, {t:'mc'}, {t:'mc'}],i:0,n:0,ok:0,xp:0}; recordExerciseResult(P.queue[0],false,null,false);`,context);
assert.equal(context.P.n,1);
assert.equal(context.P.ok,0);
assert.equal(context.P.queue.length,6);
assert.equal(context.P.queue[4].retry,true,'retry comes after three intervening exercises');
assert.equal(context.schedules,1);
const retry=context.P.queue[4];
context.retry=retry;
vm.runInContext('recordExerciseResult(retry,true,null,false); recordExerciseResult(retry,false,null,false);',context);
assert.equal(context.P.n,1);
assert.equal(context.P.ok,0);
assert.equal(context.P.xp,0);
assert.equal(context.schedules,1);
assert.equal(context.P.queue.length,6,'retry cannot recursively enqueue more retries');
assert.equal(context.P.retryOk,1);
vm.runInContext('recordExerciseResult(P.queue[0],false,null,false);',context);
assert.equal(context.P.queue.length,6,'each original receives at most one retry');
// Grammar feedback uses a known explanation rather than inventing a rule.
context.CDRILLS={tenses:{items:[{q:'She ___ here.',why:'Szokás: present simple.'}]}};
assert.equal(vm.runInContext(`exerciseExplanation({blank:1,q:'She ___ here.',ans:'works'})`,context),'Szokás: present simple.');
vm.runInContext(source('12-practice.js'),context);
vm.runInContext('renderPractice()',context);
const html=context.view.innerHTML;
const all=[...html.matchAll(/data-d="([^"]+)"/g)].map(m=>m[1]);
assert.equal(all.length,new Set(all).size,'grouped destinations remain unique');
assert.ok(html.includes('Most ezt ajánlom'));
assert.ok(html.includes('data-recommend="miss"'));
assert.ok(html.includes('Azonnal használható · AI-val bővíthető'));
assert.ok(html.includes('AI-beállítás szükséges'));
assert.ok(html.includes('id="practice-exam"'));
assert.ok(all.includes('pod')&&all.includes('examiner')&&all.includes('exam'));
console.log('practice-feedback: passed');
