/* Motion Studio: helyi, szemléltető kétpózos mozgás. Nem riggelt és nem biomechanikai mérés.
   A 2D SVG vázlat WebGL nélkül is használható; a mozgásfázisok ugyanabból a magból származnak. */
import { motionPose, motionFor, motionCycle } from '../core/exercise-motion.js';
import { rendererQuality } from '../core/bodylab-render.js';
import { tr } from './i18n.js';

const NS='http://www.w3.org/2000/svg';
const KEYS=['head','shoulder','elbow','wrist','hip','knee','ankle'];
const LINKS=[['head','shoulder'],['shoulder','hip'],['shoulder','elbow'],['elbow','wrist'],['hip','knee'],['knee','ankle']];

function createFallback() {
  const element=(tag,attrs={})=>{
    const el=document.createElementNS(NS,tag);
    for(const [key,value] of Object.entries(attrs))el.setAttribute(key,String(value));
    return el;
  };
  const svg=element('svg',{viewBox:'-175 -205 350 410',class:'exercise-motion-fallback',role:'img','aria-label':tr('Sematikus mozgásábra')});
  const halo=element('circle',{cx:0,cy:0,r:156,class:'exercise-motion-guide'});
  const floor=element('path',{d:'M -152 140 H 152',class:'exercise-motion-floor'});
  const lines=LINKS.map(()=>element('line',{class:'exercise-motion-bone'}));
  const dots=Object.fromEntries(KEYS.map(key=>[key,element('circle',{r:key==='head'?17:9,class:'exercise-motion-joint'})]));
  svg.append(halo,floor,...lines,...Object.values(dots));
  const paint=(pose,angle)=>{
    const project=p=>({x:(p[0]*Math.cos(angle)+p[2]*Math.sin(angle))*75,y:(.2-p[1])*75});
    LINKS.forEach(([a,b],i)=>{const start=project(pose[a]),end=project(pose[b]);
      lines[i].setAttribute('x1',start.x);lines[i].setAttribute('y1',start.y);lines[i].setAttribute('x2',end.x);lines[i].setAttribute('y2',end.y);});
    for(const [key,dot] of Object.entries(dots)){const p=project(pose[key]);dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);}
  };
  return {svg,paint};
}

export function mountExerciseMotion(container, id) {
  const motion=motionFor(id);
  if(!motion)return()=>{};
  let disposed=false,position=0,running=false,frame=0,started=0,startCycle=0,speed=1,angle=0;
  let drawGpu=null,cleanupGpu=()=>{};
  const fallback=createFallback();
  const slider=document.createElement('input');slider.type='range';slider.min='0';slider.max='100';slider.step='1';slider.value='0';
  slider.className='exercise-three-slider';slider.setAttribute('aria-label',tr('Mozgás fázisa'));
  const phase=document.createElement('p');phase.className='exercise-motion-phase';phase.setAttribute('role','status');phase.setAttribute('aria-live','off');
  const actions=document.createElement('div');actions.className='row exercise-three-actions';
  const play=document.createElement('button');play.type='button';play.className='btn small';play.textContent=tr('Lejátszás');
  const rate=document.createElement('select');rate.className='exercise-three-speed';rate.setAttribute('aria-label',tr('Lejátszási sebesség'));
  for(const [value,label] of [['0.5','0,5×'],['1','1×'],['1.5','1,5×']]){
    const option=document.createElement('option');option.value=value;option.textContent=label;if(value==='1')option.selected=true;rate.append(option);
  }
  const views=document.createElement('div');views.className='exercise-motion-views';
  const viewButtons=[['front',tr('Elöl'),0],['side',tr('Oldalt'),Math.PI/2],['back',tr('Hátul'),Math.PI]];
  const draw=()=>{
    const state=motionCycle(id,position);if(!state)return;
    const pose=motionPose(id,state.poseProgress);
    fallback.paint(pose,angle);drawGpu?.(pose,angle);
    slider.value=String(Math.round(position*100));
    phase.textContent=tr(state.phaseLabel);
    slider.setAttribute('aria-valuetext',`${Math.round(position*100)}% · ${tr(state.phaseLabel)}`);
  };
  const pause=()=>{running=false;cancelAnimationFrame(frame);frame=0;play.textContent=tr('Lejátszás');play.setAttribute('aria-pressed','false');};
  const step=ts=>{
    if(disposed||!running)return;
    if(document.hidden){pause();return;}
    position=(startCycle+Math.max(0,ts-started)*speed/3400)%1;
    draw();frame=requestAnimationFrame(step);
  };
  play.onclick=()=>{
    if(running){pause();return;}
    running=true;play.textContent=tr('Szünet');play.setAttribute('aria-pressed','true');
    startCycle=position;started=performance.now();frame=requestAnimationFrame(step);
  };
  play.setAttribute('aria-pressed','false');
  slider.oninput=()=>{pause();position=Math.max(0,Math.min(1,Number(slider.value)/100));draw();};
  rate.onchange=()=>{speed=Number(rate.value)||1;startCycle=position;started=performance.now();};
  for(const [key,label,value] of viewButtons){
    const button=document.createElement('button');button.type='button';button.className='btn small';button.textContent=label;
    button.setAttribute('aria-pressed',String(key==='front'));
    button.onclick=()=>{angle=value;for(const child of views.children)child.setAttribute('aria-pressed',String(child===button));draw();};
    views.append(button);
  }
  const stages=document.createElement('div');stages.className='exercise-motion-stages';stages.setAttribute('aria-label',tr('Mozgás fő fázisai'));
  for(const [index,cycle] of [0,.25,.5,.75].entries()){
    const button=document.createElement('button');button.type='button';button.className='exercise-motion-stage';button.textContent=tr(motion.phases[index]);
    button.onclick=()=>{pause();position=cycle;draw();};stages.append(button);
  }
  const disclaimer=document.createElement('p');disclaimer.className='small muted exercise-three-status';
  disclaimer.textContent=tr('Sematikus illusztráció · nem ellenőrzött biomechanikai animáció.');disclaimer.dataset.motionStatus=motion.status;
  actions.append(play,rate);container.append(fallback.svg,phase,slider,stages,views,actions,disclaimer);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced)play.hidden=true;
  const visibility=()=>{if(document.hidden)pause();};document.addEventListener('visibilitychange',visibility);
  draw();

  (async()=>{
    try{
      const T=await import('../../vendor/three/three.module.js');
      if(disposed)return;
      const quality=rendererQuality({width:container.clientWidth||innerWidth,devicePixelRatio,deviceMemory:navigator.deviceMemory,reducedMotion:reduced});
      const renderer=new T.WebGLRenderer({antialias:quality.antialias,alpha:true,powerPreference:'low-power'});
      renderer.setPixelRatio(quality.pixelRatio);
      renderer.domElement.className='exercise-three-canvas';renderer.domElement.setAttribute('aria-hidden','true');
      container.insertBefore(renderer.domElement,fallback.svg);
      const scene=new T.Scene(),camera=new T.PerspectiveCamera(37,1,.1,100);
      camera.position.set(0,.25,7.8);camera.lookAt(0,.25,0);
      scene.add(new T.HemisphereLight(0xfce9e5,0x281130,2.6));
      const light=new T.DirectionalLight(0xffa574,3);light.position.set(-2,5,6);scene.add(light);
      const mesh=(geometry,color)=>{const m=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.38,metalness:.12}));scene.add(m);return m;};
      const joints=Object.fromEntries(KEYS.map(k=>[k,mesh(new T.SphereGeometry(k==='head'?.22:.12,12,9),k==='head'?0xffae7b:0x53d7d1)]));
      const rods=LINKS.map(([a,b])=>({a,b,m:mesh(new T.CylinderGeometry(.09,.11,1,10),0xd87992)}));
      /* Animáció közben a geometriai segédvektorok újrahasznosulnak: nincs frame-enkénti GC-terhelés. */
      const startPoint=new T.Vector3(),endPoint=new T.Vector3(),delta=new T.Vector3(),upAxis=new T.Vector3(0,1,0);
      drawGpu=(pose,rotation)=>{
        for(const key of KEYS)joints[key].position.fromArray(pose[key]);
        for(const {a,b,m} of rods){startPoint.fromArray(pose[a]);endPoint.fromArray(pose[b]);delta.subVectors(endPoint,startPoint);
          m.position.copy(startPoint).add(endPoint).multiplyScalar(.5);m.scale.y=delta.length();m.quaternion.setFromUnitVectors(upAxis,delta.normalize());}
        scene.rotation.y=rotation;renderer.render(scene,camera);
      };
      const resize=()=>{if(disposed)return;const width=Math.max(1,container.clientWidth);
        const ratio=rendererQuality({width,devicePixelRatio,deviceMemory:navigator.deviceMemory}).pixelRatio;
        if(renderer.getPixelRatio()!==ratio)renderer.setPixelRatio(ratio);
        renderer.setSize(width,250,false);camera.aspect=width/250;camera.updateProjectionMatrix();draw();};
      const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;
      const lost=e=>{e.preventDefault();container.dataset.webgl='unavailable';renderer.domElement.hidden=true;fallback.svg.hidden=false;pause();};
      const restored=()=>{container.dataset.webgl='ready';renderer.domElement.hidden=false;fallback.svg.hidden=true;resize();};
      renderer.domElement.addEventListener('webglcontextlost',lost);
      renderer.domElement.addEventListener('webglcontextrestored',restored);
      cleanupGpu=()=>{observer?.disconnect();renderer.domElement.removeEventListener('webglcontextlost',lost);
        renderer.domElement.removeEventListener('webglcontextrestored',restored);
        for(const item of [...Object.values(joints),...rods.map(x=>x.m)]){item.geometry.dispose();item.material.dispose();}
        drawGpu=null;renderer.dispose();renderer.domElement.remove();};
      observer?.observe(container);resize();fallback.svg.hidden=true;container.dataset.webgl='ready';
    }catch{if(!disposed)container.dataset.webgl='unavailable';}
  })();
  return()=>{disposed=true;pause();document.removeEventListener('visibilitychange',visibility);cleanupGpu();
    fallback.svg.remove();phase.remove();slider.remove();stages.remove();views.remove();actions.remove();disclaimer.remove();};
}
