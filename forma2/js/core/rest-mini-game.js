/* Rövid, helyi, opcionális pihenőjáték. Nem teljesítménymérés és nem egészségügyi teszt. */
export function createRestFocusGame() {
  let score=0,target=4;
  return {
    state:()=>({score,target}),
    tap(index){
      if(!Number.isInteger(index)||index<0||index>8||index!==target)return false;
      score++;
      target=(target+score*3+2)%9;
      if(target===index)target=(target+1)%9;
      return true;
    },
  };
}

/* A kosárdobás három szögből választható. A „szél” körönként változik;
   a dobás célja a kosár irányának becslése, nem véletlen pontozás. */
export function createRestBasketGame() {
  let shots=0,points=0,wind=0;
  return {
    state:()=>({shots,points,wind}),
    shoot(aim){
      if(!Number.isInteger(aim)||aim<0||aim>4)return null;
      const landed=aim+wind;
      const made=landed===2;
      shots++;
      if(made)points+=2;
      wind=[-1,1,0,1,-1,0][shots%6];
      return {made,landed,points,shots};
    },
  };
}

/* Rövid, ismételhető memóriajáték. Nincs időnyomás vagy perzisztencia. */
export function createRestMemoryGame() {
  let round=1,progress=0,showing=true;
  const symbols=['●','◆','★','▲'];
  const sequence=()=>Array.from({length:Math.min(round+1,6)},(_,i)=>(i*3+round+i*round)%4);
  return {
    state:()=>({round,progress,showing,sequence:showing?sequence():null,length:sequence().length}),
    start(){showing=false;progress=0;},
    tap(index){
      if(showing||!Number.isInteger(index)||index<0||index>=symbols.length)return 'ignored';
      if(index!==sequence()[progress]){showing=true;progress=0;return 'retry';}
      progress++;
      if(progress===sequence().length){round++;showing=true;progress=0;return 'win';}
      return 'correct';
    },
  };
}

/* Hatlapos párosító: a kártyák sorrendje körönként változik. */
export function createRestPairsGame() {
  const symbols=['★','◆','●'];
  let round=0,matched=[],open=[],moves=0;
  const deck=()=>{
    const base=[0,1,2,0,1,2];
    return base.map((_,i)=>symbols[base[(i+round*2)%6]]);
  };
  return {
    state:()=>({round,moves,matched:[...matched],open:[...open],deck:deck(),complete:matched.length===6}),
    flip(index){
      if(!Number.isInteger(index)||index<0||index>5||matched.includes(index))return 'ignored';
      if(open.length===2)open=[];
      if(open.includes(index))return 'ignored';
      open.push(index);
      if(open.length===2){
        moves++;
        if(deck()[open[0]]===deck()[open[1]]){
          matched.push(...open);open=[];
          return matched.length===6?'complete':'match';
        }
        return 'miss';
      }
      return 'open';
    },
    next(){if(matched.length!==6)return false;round++;matched=[];open=[];moves=0;return true;},
  };
}

/* Fejben számolás: rövid, determinisztikus, mindig egyértelmű feladat. */
export function createRestMathGame() {
  let round=0,score=0;
  const question=()=>{
    const a=3+(round*7)%17,b=2+(round*5)%11;
    return {a,b,answer:a+b,choices:[a+b-2,a+b,a+b+3].sort((x,y)=>((x+round*7)%5)-((y+round*7)%5))};
  };
  return {
    state:()=>({round,score,question:question()}),
    answer(value){
      if(!Number.isInteger(value)||!question().choices.includes(value))return null;
      const correct=value===question().answer;
      if(correct)score++;
      round++;
      return correct;
    },
  };
}

/* Időérzék-játék, nincs háttérben futó időzítő. A kattintások közti eltelt időt mérjük. */
export function createRestTimingGame(now=()=>performance.now()) {
  let started=null,attempts=0,best=null;
  return {
    state:()=>({running:started!==null,attempts,best}),
    toggle(){
      if(started===null){started=now();return null;}
      const elapsed=Math.max(0,(now()-started)/1000);
      started=null;attempts++;
      const error=Math.abs(elapsed-3);
      if(best===null||error<best)best=error;
      return {elapsed,error,attempts,best};
    },
  };
}
