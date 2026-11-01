'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const J = require('../jackpot-core.js');
const options = () => ({reward:'Közösen megtervezett randi',tags:[],custom:[]});
const state = () => J.create(options(),new Set());
const fixed = faces => {const values=faces.map(i=>(i+0.1)/6);return ()=>values.length?values.shift():0;};
test('all 216 equally likely face combinations: 6 jackpots, 90 pairs, 120 distinct',()=>{
  const count={jackpot:0,pair:0,task:0};
  for(let a=0;a<6;a++) for(let b=0;b<6;b++) for(let c=0;c<6;c++) {
    const s=state(), r=J.roll(s,fixed([a,b,c])); count[r.kind]++;
    assert.deepEqual(r.faces,[a,b,c]);
    if(r.kind==='jackpot') assert.deepEqual(r.tasks,[s.reward]);
    if(r.kind==='pair') {
      const category=[a,b,c].find(f=>[a,b,c].filter(x=>x===f).length===2);
      assert.equal(r.tasks.length,2); assert.notEqual(r.tasks[0],r.tasks[1]);
      assert(r.tasks.every(t=>s.pools[category].includes(t))); assert.equal(r.chosen,null);
    }
    if(r.kind==='task') { assert.equal(r.tasks.length,1); assert.equal(r.chosen,0); assert([a,b,c].some(i=>s.pools[i].includes(r.tasks[0]))); }
  }
  assert.deepEqual(count,{jackpot:6,pair:90,task:120});
});
test('shared limits filter built-in tasks, custom tasks and jackpot; empty category blocks rolling',()=>{
  let o=options(); o.custom=[{category:'compliment',t:'Saját ötlet.'}]; o.tags=['foto'];
  let s=J.create(o,new Set(['foto']));
  assert.equal(s.reward,null); assert(!s.pools.flat().includes('Saját ötlet.')); assert(s.blocked);
  assert.throws(()=>J.roll(s));
  s=J.create(options(),new Set(['erintes']));
  assert(s.pools.slice(0,3).every(p=>p.length===0)); assert(s.blocked);
  assert(s.pools.slice(3).every(p=>p.length===6));
  assert(!state().blocked);
});
test('custom category tasks are added without mutating settings or built-in data',()=>{
  const o=options(); o.custom=[{category:'kiss',t:'Saját csók.'}]; const before=JSON.stringify(o);
  const s=J.create(o,new Set()); assert(s.pools[0].includes('Saját csók.')); assert.equal(s.pools[0].length,7);
  const duplicates=options(); duplicates.custom=[{category:'kiss',t:J.categories[0].tasks[0]}];
  assert.equal(J.create(duplicates,new Set()).pools[0].length,6);
  s.pools[0].pop(); assert.equal(J.categories[0].tasks.length,6); assert.equal(JSON.stringify(o),before);
});
test('invalid and oversized input cannot start a game',()=>{
  for(const o of [null,{}, {...options(),reward:' '},{...options(),reward:'x'.repeat(141)},
    {...options(),tags:['unknown']},{...options(),custom:[null]},{...options(),custom:[{category:'nope',t:'a'}]},
    {...options(),custom:[{category:'kiss',t:'x'.repeat(111)}]},
    {...options(),custom:Array.from({length:11},()=>({category:'kiss',t:'a'}))}]) assert(!J.validOptions(o));
  assert(J.validOptions(options()));
});
