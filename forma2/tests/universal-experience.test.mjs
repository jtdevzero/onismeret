import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseBodyLabRoute, bodyLabRegions, searchBodyLabRegions, stepBodyLabRegion, bodyLabSharePath, bodyLabSideForRegion } from '../js/core/bodylab-navigation.js';
import { createRestFocusGame, createRestBasketGame, createRestMemoryGame, createRestPairsGame, createRestMathGame, createRestTimingGame } from '../js/core/rest-mini-game.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('1. BODY LAB közvetlen link: érvényes réteg és elem visszaáll, ismeretlen érték nem',()=>{
  assert.deepEqual(parseBodyLabRoute('bones:femur'),{layer:'bones',selected:'femur'});
  assert.deepEqual(parseBodyLabRoute('muscles:back'),{layer:'muscles',selected:'back'});
  assert.deepEqual(parseBodyLabRoute('invalid:unknown'),{layer:'muscles',selected:null});
  assert.deepEqual(parseBodyLabRoute('bones:__proto__'),{layer:'bones',selected:null});
});

test('2. offline, ékezetfüggetlen területkeresés minden rétegben',()=>{
  assert.ok(searchBodyLabRegions('joints','terd').some(item=>item.id==='knee'));
  assert.ok(searchBodyLabRegions('muscles','farizom').some(item=>item.id==='glutes'));
  assert.equal(searchBodyLabRegions('bones','valami-nincs').length,0);
  assert.equal(bodyLabRegions('muscles').length,7);
});

test('3. léptetés az első és utolsó régió között körbefordul',()=>{
  const ids=bodyLabRegions('bones').map(item=>item.id);
  assert.equal(stepBodyLabRegion('bones',ids[0],-1),ids.at(-1));
  assert.equal(stepBodyLabRegion('bones',ids.at(-1),1),ids[0]);
  assert.equal(stepBodyLabRegion('bones',null,1),ids[0]);
});

test('4. billentyűzetes területléptetés nem ír bele a keresőbe',()=>{
  const source=read('js/ui/views-body-lab.js');
  assert.match(source,/if\(e\.target===input\|\|!\['ArrowLeft','ArrowRight'\]\.includes\(e\.key\)\)return/);
  assert.match(source,/go\(e\.key==='ArrowLeft'\?-1:1\)/);
});

test('5. megosztható oktatási link nem tartalmaz személyes adatot',()=>{
  assert.equal(bodyLabSharePath('bones','femur'),'#/bodylab/bones:femur');
  assert.equal(bodyLabSharePath('muscles','unknown'),'#/bodylab/muscles');
  assert.equal(bodyLabSharePath('invalid','unknown'),'#/bodylab');
  const source=read('js/ui/views-body-lab.js');
  assert.match(source,/navigator\.clipboard\.writeText\(url\)/);
});

test('6. kizárólag hátulsó izom kiválasztásakor automatikusan hátulnézetre vált',()=>{
  assert.equal(bodyLabSideForRegion('back'),'back');
  assert.equal(bodyLabSideForRegion('glutes'),'back');
  assert.equal(bodyLabSideForRegion('chest'),'front');
  assert.equal(bodyLabSideForRegion('shoulders'),'front');
});

test('7. takarékos 2D nézet 3D-import nélkül indulhat',()=>{
  const three=read('js/ui/three-body.js');
  assert.ok(three.indexOf('if(prefer2D)')<three.indexOf("await import('../../vendor/three/three.module.js')"));
  assert.match(three,/container\.dataset\.mode='manual2d'/);
});

test('8. sikertelen 3D után ugyanazzal a gombbal újrapróbálható',()=>{
  const view=read('js/ui/views-body-lab.js');
  assert.match(view,/state==='unavailable'\?'3D újrapróbálása'/);
  assert.match(view,/prefer2D:current\.prefer2D/);
});

test('9. testméretfüggő render-felbontás újraszámolódik',()=>{
  const body=read('js/ui/three-body.js'),motion=read('js/ui/exercise-motion-studio.js');
  assert.match(body,/width: container\.clientWidth\|\|innerWidth/);
  assert.match(body,/renderer\.getPixelRatio\(\)!==ratio/);
  assert.match(motion,/renderer\.getPixelRatio\(\)!==ratio/);
});

test('10. pihenőjáték végtelenül újraindítható, nem módosít mentési adatot',()=>{
  const game=createRestFocusGame();
  for(let i=0;i<1000;i++){
    const target=game.state().target;
    assert.equal(game.tap(target),true);
    assert.ok(game.state().target>=0&&game.state().target<=8);
  }
  assert.equal(game.state().score,1000);
  assert.equal(game.tap(-1),false);
  const ui=read('js/ui/rest-mini-game.js'),train=read('js/ui/views-train.js');
  assert.match(train,/restMiniGame\(\)/);
  assert.doesNotMatch(ui,/kvSet|itemPut|fetch\(|setInterval|localStorage/);
});

test('11. kosárdobás: érvénytelen célzás nem számít, a szél befolyásolja a találatot',()=>{
  const game=createRestBasketGame();
  assert.equal(game.shoot(99),null);
  assert.equal(game.state().shots,0);
  assert.equal(game.shoot(2).made,true);
  assert.equal(game.state().points,2);
  assert.equal(game.shoot(1).made,true);
  assert.equal(game.state().points,4);
  assert.equal(game.shoot(0).made,false);
});

test('12. memóriajáték: hibás sorozat újrakezdhető, helyes sorozat új körre vált',()=>{
  const game=createRestMemoryGame();
  const sequence=game.state().sequence;
  assert.equal(game.tap(0),'ignored');
  game.start();
  assert.equal(game.tap((sequence[0]+1)%4),'retry');
  assert.equal(game.state().round,1);
  game.start();
  for(let i=0;i<sequence.length;i++)assert.equal(game.tap(sequence[i]),i===sequence.length-1?'win':'correct');
  assert.equal(game.state().round,2);
});

test('13. három játék választóval és akadálymentes gombokkal érhető el a pihenő alatt',()=>{
  const ui=read('js/ui/rest-mini-game.js');
  for(const name of ['Célpontvadászat','Kosárdobás','Memória','Párosító','Villám matek'])assert.ok(ui.includes(name));
  assert.match(ui,/aria-pressed/);
  assert.match(ui,/aria-expanded/);
  assert.doesNotMatch(ui,/localStorage|indexedDB|setInterval|fetch\(/);
});

test('14. párosító kártyák: hibás választás javítható, minden pár megtalálható',()=>{
  const game=createRestPairsGame(),deck=game.state().deck;
  assert.equal(game.flip(-1),'ignored');
  assert.equal(game.flip(0),'open');
  assert.equal(game.flip(1),'miss');
  assert.equal(game.flip(3),'open');
  assert.equal(game.flip(0),'match');
  const remaining=[1,2,4,5];
  for(const i of remaining){
    if(game.state().matched.includes(i))continue;
    const j=remaining.find(j=>j!==i&&deck[j]===deck[i]);
    game.flip(i);game.flip(j);
  }
  assert.equal(game.state().complete,true);
  assert.equal(game.next(),true);
  assert.equal(game.state().complete,false);
});

test('15. villám matek: válaszok egyértelműek, a helytelen válasz sem blokkol',()=>{
  const game=createRestMathGame();
  for(let i=0;i<100;i++){
    const {question}=game.state();
    assert.equal(new Set(question.choices).size,3);
    assert.ok(question.choices.includes(question.answer));
    assert.equal(game.answer(question.answer),true);
  }
  assert.equal(game.state().score,100);
  assert.equal(game.answer(999),null);
  const next=game.state().question;
  assert.equal(game.answer(next.choices.find(x=>x!==next.answer)),false);
});

test('16. időérzék-játék valóban eltelt időt mér, és a jobb eredményt tartja meg',()=>{
  let clock=1000;const game=createRestTimingGame(()=>clock);
  assert.equal(game.toggle(),null);
  clock+=3000;
  assert.equal(game.toggle().error,0);
  assert.equal(game.state().best,0);
  clock+=100;
  game.toggle();clock+=4100;game.toggle();
  assert.equal(game.state().attempts,2);
  assert.equal(game.state().best,0);
});

test('17. külön Arcade útvonal, helyi és visszavonható rekordmentés',()=>{
  const app=read('js/ui/app.js'),more=read('js/ui/views-main.js'),arcade=read('js/ui/views-arcade.js');
  assert.match(app,/arcade: arcadeView/);
  assert.match(more,/#\/arcade/);
  assert.match(arcade,/enabled=false/);
  assert.match(arcade,/if\(enabled\)\{try\{localStorage\.setItem/);
  assert.match(arcade,/localStorage\.removeItem\(STORAGE_KEY\)/);
  assert.doesNotMatch(arcade,/fetch\(|XMLHttpRequest/);
  assert.match(arcade,/standalone:true/);
});
