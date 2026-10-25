#!/usr/bin/env node
/* Imported/cloud exercise snapshots must remain data, never markup or selectors. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'../src/js/10-lessons.js'),'utf8');
const ctx=vm.createContext({LESSONS:[{id:'en-1'}],POOL:[{id:'en-word'},{id:'en-own'}],S:{},lang:()=> 'en'});
vm.runInContext(src,ctx);
const valid=x=>{ctx.snapshot=x;return vm.runInContext('validExerciseSnapshot(snapshot)',ctx);};
const base=()=>({v:1,lessonId:'en-1',session:{kind:'lesson',li:0,i:0,ok:0,n:0,xp:0,graded:{},queue:[{t:'order',q:'Köszönj!',ans:'Hello there',tiles:[{i:0,w:'Hello'},{i:1,w:'there'}]}],draft:{picked:[0]}}});
let count=0;function check(x,expected,title){assert.equal(valid(x),expected,title);count++;}
check(base(),true,'valid shuffled tiles and picked draft remain resumable');
let x=base();x.session.queue[0].tiles[0].i='0" onclick="window.compromised=1';check(x,false,'attribute payload rejected');
x=base();x.session.draft.picked=['0]" onclick="x'];check(x,false,'picked tile selector payload rejected');
x=base();x.session.draft.picked=[99];check(x,false,'missing tile references rejected');
x=base();x.session.draft.picked={0:1};check(x,false,'non-array picked draft rejected');
x=base();x.session.queue[0].tiles[1].i=0;check(x,false,'duplicate tile ids rejected');
x=base();delete x.lessonId;check(x,false,'lesson without a known id rejected');
x=base();x.session.li=999;check(x,false,'invalid lesson index rejected');
x=base();x.session.graded=null;check(x,false,'missing grading map rejected');
x=base();x.session.xp='<img src=x onerror=alert(1)>';check(x,false,'non-numeric XP rejected');
x=base();x.session.queue=[{t:'mc',q:'Hello',ans:'Szia',opts:['Szia','Viszlát']}];x.session.draft={sel:'0"] <img src=x>'};check(x,false,'option selector payload rejected');
x.session.draft={sel:0};check(x,true,'valid selected option remains resumable');
x.session.queue[0].opts={0:'Szia'};check(x,false,'malformed option list rejected');
x=base();x.session.queue=[{t:'type',q:'Hello',ans:{0:'Szia'}}];delete x.session.draft;check(x,false,'malformed answer list rejected');
x=base();x.session.queue[0].opts={0:'x'};check(x,false,'malformed hidden retry options rejected');
x=base();x.session.queue=[{t:'intro',c:{id:'en-word',it:'Hello',hu:'Szia',alt:{0:'Hi'}}}];delete x.session.draft;check(x,false,'malformed intro alternatives rejected');
x=base();x.session.queue=[{t:'match',pairs:[{it:'Hello',hu:'Szia'}],matchDone:['0"] <img src=x>']}];delete x.session.draft;check(x,false,'match selector payload rejected');
x.session.queue[0].matchDone=[0];check(x,true,'valid matched pair remains resumable');
x=base();x.lessonId=null;x.session.kind='daily';x.session.li=null;x.session.queue=[{t:'type',cid:'en-own',li:1,q:'Saját szó',ans:['Custom']}];x.session.draft={text:'Cus'};check(x,true,'own/core vocabulary special index remains resumable');
x=base();x.session.i=1;delete x.session.draft;check(x,true,'fully answered snapshot may finish once');
x=base();x.session.queue=[{t:'speak',ans:'Hello',blank:true}];delete x.session.draft;check(x,false,'malformed blank task cannot call replace on a missing question');
ctx.S={activeExercises:{en:{...base(),session:{...base().session,queue:[{t:'order',tiles:[{i:'" onfocus=alert(1)',w:'x'}]}]}}}};
assert.equal(vm.runInContext('savedExercise()',ctx),null);count++;
assert.match(src,/data-t="\$\{esc\(t\.i\)\}"/,'tile attributes escaped as defense in depth');count++;
console.log(`Resume snapshot safety: ${count} checks passed.`);
