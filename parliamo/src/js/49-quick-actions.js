/* ============ QUICK ACTIONS (home-screen shortcuts, notification link) ============ */
function quickAction(h){
  const a={kor:()=>{render();startDailyJourney();},terv:()=>{const k=wplan()[(today()+4)%7];if(k&&k!=="free"){render();const b=$("#wGo");if(b)return b.click();}startRound("daily");},
    podcast:()=>{route="gyakorlas";render();renderPods();},auto:()=>{route="kartyak";render();startCar();},ellenorzes:()=>{route="ellenorzes";render();}}[h];
  if(!a)return false;try{history.replaceState(null,"","#ma");}catch(e){}route="ma";a();return true;
}

