import { h, clear } from './dom.js';
import { tr } from './i18n.js';
import { createRestFocusGame, createRestBasketGame, createRestMemoryGame, createRestPairsGame, createRestMathGame, createRestTimingGame } from '../core/rest-mini-game.js';

/* Csak pihenő alatti, helyi szórakozás; nincs háttéridőzítő, hálózat vagy mentés. */
export function restMiniGame({standalone=false,onScore=()=>{}}={}) {
  const focus=createRestFocusGame(),basket=createRestBasketGame(),memory=createRestMemoryGame(),pairs=createRestPairsGame(),math=createRestMathGame(),timing=createRestTimingGame();
  const panel=h('section',{class:'workout-rest-game',hidden:!standalone,'aria-label':tr('Pihenőidős mini-játék')});
  const content=h('div',{class:'workout-rest-game-content'});
  const tabs=h('div',{class:'workout-rest-game-tabs',role:'group','aria-label':tr('Játék kiválasztása')});
  const games=[['focus','🎯 '+tr('Célpontvadászat')],['basket','🏀 '+tr('Kosárdobás')],['memory','🧠 '+tr('Memória')],['pairs','🃏 '+tr('Párosító')],['math','➕ '+tr('Villám matek')],['timing','⏱ '+tr('Időérzék')]];
  let active='focus';
  const render=()=>{
    clear(content);
    for(const tab of tabs.querySelectorAll('button'))tab.setAttribute('aria-pressed',String(tab.dataset.game===active));
    if(active==='focus'){
      const score=h('p',{role:'status',class:'small workout-rest-score'});
      const grid=h('div',{class:'workout-rest-game-grid',role:'group','aria-label':tr('Pihenőjáték célpontjai')});
      const cells=Array.from({length:9},(_,index)=>h('button',{type:'button',class:'workout-rest-game-cell',onclick:()=>{if(focus.tap(index))onScore('focus',focus.state().score);update();}}));
      const update=()=>{
        const state=focus.state();
        score.textContent=tr('Elkapott célpontok: {p0}',{p0:state.score});
        cells.forEach((cell,index)=>{
          const selected=index===state.target;
          cell.classList.toggle('active',selected);
          cell.setAttribute('aria-label',selected?tr('Célpont – érintsd meg'):tr('Üres mező'));
          cell.setAttribute('aria-pressed',String(selected));
          cell.textContent=selected?'●':'·';
        });
      };
      grid.append(...cells);content.append(score,grid);update();
    }else if(active==='basket'){
      const result=h('p',{role:'status',class:'workout-rest-score'});
      const ball=h('span',{class:'workout-rest-ball'},'🏀');
      const court=h('div',{class:'workout-rest-court','aria-hidden':'true'},
        h('span',{class:'workout-rest-backboard'}),h('span',{class:'workout-rest-rim'}),h('span',{class:'workout-rest-net'}),ball);
      ball.addEventListener('animationend',()=>ball.classList.remove('shooting'));
      const shots=h('div',{class:'workout-rest-basket-aim',role:'group','aria-label':tr('Dobás iránya')});
      const update=message=>{
        const state=basket.state();
        result.textContent=(message?message+' · ':'')+tr('Pont: {p0} · Dobás: {p1} · Szél: {p2}',{p0:state.points,p1:state.shots,p2:state.wind>0?'→':state.wind<0?'←':'–'});
      };
      for(let i=0;i<5;i++)shots.append(h('button',{type:'button',class:'workout-rest-aim',onclick:()=>{
        const shot=basket.shoot(i);
        ball.classList.remove('shooting');
        ball.style.setProperty('--shot-drift',((shot.landed-2)*32)+'px');
        void ball.offsetWidth;
        ball.classList.add('shooting');
        if(shot.made)onScore('basket',shot.points);
        update(tr(shot.made?'Kosár! +2 pont':'Mellé! Próbáld újra.'));
      },'aria-label':tr('Dobás a(z) {p0}. irányba',{p0:i+1})},'🏀'));
      content.append(h('p',{class:'small muted'},tr('Válassz dobásirányt! A szél eltérítheti a labdát.')),court,shots,result);
      update();
    }else if(active==='memory'){
      const status=h('p',{role:'status',class:'workout-rest-score'});
      const preview=h('div',{class:'workout-rest-memory-preview'});
      const actions=h('div',{class:'workout-rest-memory-actions'});
      const symbols=['●','◆','★','▲'];
      const renderMemory=message=>{
        const state=memory.state();
        status.textContent=(message?message+' · ':'')+tr('Memóriakör: {p0} · {p1} jel',{p0:state.round,p1:state.length});
        clear(preview);clear(actions);
        if(state.showing){
          preview.textContent=state.sequence.map(i=>symbols[i]).join('  ');
          actions.append(h('button',{type:'button',class:'btn primary',onclick:()=>{memory.start();renderMemory();}},tr('Megjegyeztem – jöhet!')));
        }else{
          preview.textContent=tr('Ismételd meg a sorrendet: {p0}/{p1}',{p0:state.progress,p1:state.length});
          for(let i=0;i<symbols.length;i++)actions.append(h('button',{type:'button',class:'workout-rest-memory-key',onclick:()=>{
            const result=memory.tap(i);
            if(result==='win')onScore('memory',memory.state().round-1);
            renderMemory(result==='retry'?tr('Újra megmutatom.'):result==='win'?tr('Szuper, következő kör!'):null);
          },'aria-label':tr('Memóriajel {p0}',{p0:i+1})},symbols[i]));
        }
      };
      content.append(h('p',{class:'small muted'},tr('Jegyezd meg a jelek sorrendjét, majd ismételd meg!')),status,preview,actions);
      renderMemory();
    }else if(active==='pairs'){
      const status=h('p',{role:'status',class:'workout-rest-score'});
      const board=h('div',{class:'workout-rest-pairs',role:'group','aria-label':tr('Párosító kártyák')});
      const next=h('button',{type:'button',class:'btn primary',hidden:true,onclick:()=>{pairs.next();paint();}},tr('Új párosító kör'));
      const paint=()=>{
        const state=pairs.state();
        status.textContent=tr('Párok: {p0}/3 · Fordítások: {p1}',{p0:state.matched.length/2,p1:state.moves});
        clear(board);
        state.deck.forEach((symbol,i)=>{
          const revealed=state.matched.includes(i)||state.open.includes(i);
          board.append(h('button',{type:'button',class:'workout-rest-card',disabled:state.matched.includes(i),onclick:()=>{if(pairs.flip(i)==='complete')onScore('pairs',pairs.state().round+1);paint();},'aria-label':tr('Kártya {p0}: {p1}',{p0:i+1,p1:revealed?symbol:tr('lefordítva')}),'aria-pressed':String(revealed)},revealed?symbol:'?'));
        });
        next.hidden=!state.complete;
      };
      content.append(h('p',{class:'small muted'},tr('Találd meg a három párt!')),status,board,next);
      paint();
    }else if(active==='math'){
      const status=h('p',{role:'status',class:'workout-rest-score'});
      const prompt=h('p',{class:'workout-rest-math-question'});
      const answers=h('div',{class:'workout-rest-math-options'});
      const paint=feedback=>{
        const state=math.state();
        status.textContent=tr('Helyes válaszok: {p0} / {p1}',{p0:state.score,p1:state.round})+(feedback?' · '+feedback:'');
        prompt.textContent=state.question.a+' + '+state.question.b+' = ?';
        clear(answers);
        for(const choice of state.question.choices)answers.append(h('button',{type:'button',class:'workout-rest-math-answer',onclick:()=>{
          const correct=math.answer(choice);
          if(correct)onScore('math',math.state().score);
          paint(tr(correct?'Helyes!':'Próbáld a következőt!'));
        }},String(choice)));
      };
      content.append(h('p',{class:'small muted'},tr('Válaszd ki a helyes összeget!')),prompt,answers,status);
      paint();
    }else{
      const status=h('p',{role:'status',class:'workout-rest-score'});
      const button=h('button',{type:'button',class:'btn primary workout-rest-timing-action',onclick:()=>{
        const result=timing.toggle();
        if(result)onScore('timing',Math.max(0,Math.round(1000-result.error*100)));
        update(result);
      }});
      const update=result=>{
        const state=timing.state();
        button.textContent=state.running?tr('Állj!'):tr('Indítás');
        status.textContent=result?tr('Idő: {p0} mp · Eltérés: {p1} mp',{p0:result.elapsed.toFixed(2),p1:result.error.toFixed(2)}):tr('Cél: pontosan 3 másodperc.');
      };
      content.append(h('p',{class:'small muted'},tr('Indíts, majd állítsd meg érzésre 3 másodpercnél!')),button,status);
      update();
    }
  };
  for(const [id,label] of games)tabs.append(h('button',{type:'button',class:'btn small',dataset:{game:id},'aria-pressed':String(id===active),onclick:()=>{active=id;render();}},label));
  panel.append(h('p',{class:'small muted'},tr('Csak kikapcsolódás: nem befolyásolja a pihenőidőt vagy az edzéseredményt.')),tabs,content);
  const toggle=h('button',{type:'button',class:'btn small workout-rest-game-toggle','aria-expanded':'false',onclick:()=>{
    panel.hidden=!panel.hidden;
    toggle.textContent=panel.hidden?tr('Mini-játékok megnyitása'):tr('Mini-játékok elrejtése');
    toggle.setAttribute('aria-expanded',String(!panel.hidden));
  }},tr('Mini-játékok megnyitása'));
  render();
  return h('div',{class:'workout-rest-game-wrap'},standalone?null:toggle,panel);
}
