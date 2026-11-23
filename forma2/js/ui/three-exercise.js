/* Egyszerű Three.js pózdemó. Képkockánként két oktatási póz között interpolál, nem mér valós testpontokat. */
import { motionPose } from '../core/exercise-motion.js';
import { tr } from './i18n.js';

export function mountExerciseMotion(container, id) {
  let disposed=false, cleanup=()=>{};
  (async()=>{
    try {
      const T=await import('../../vendor/three/three.module.js');
      if(disposed)return;
      const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
      renderer.setSize(Math.max(1,container.clientWidth),250,false);
      renderer.domElement.className='exercise-three-canvas'; renderer.domElement.setAttribute('aria-hidden','true');
      container.append(renderer.domElement);
      const scene=new T.Scene(), camera=new T.PerspectiveCamera(37,Math.max(1,container.clientWidth)/250,.1,100);
      camera.position.set(0,.25,7.8);camera.lookAt(0,.25,0);
      scene.add(new T.HemisphereLight(0xfce9e5,0x281130,2.6));
      const light=new T.DirectionalLight(0xffa574,3);light.position.set(-2,5,6);scene.add(light);
      const mesh=(geometry,color)=>{const m=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.38,metalness:.12}));scene.add(m);return m;};
      const joints=Object.fromEntries(['head','shoulder','elbow','wrist','hip','knee','ankle'].map(k=>[k,mesh(new T.SphereGeometry(k==='head'?.22:.12,12,9),k==='head'?0xffae7b:0x53d7d1)]));
      const segments=[['head','shoulder'],['shoulder','hip'],['shoulder','elbow'],['elbow','wrist'],['hip','knee'],['knee','ankle']];
      const rods=segments.map(([a,b])=>({a,b,m:mesh(new T.CylinderGeometry(.09,.11,1,10),0xd87992)}));
      let progress=0, running=false, frame=0, started=0, angle=0;
      const draw=()=>{
        const pose=motionPose(id,progress);if(!pose)return;
        for(const [k,p] of Object.entries(pose))joints[k].position.set(...p);
        for(const {a,b,m} of rods){const p=new T.Vector3(...pose[a]),q=new T.Vector3(...pose[b]),v=q.clone().sub(p);m.position.copy(p.add(q).multiplyScalar(.5));m.scale.y=v.length();m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());}
        scene.rotation.y=angle;renderer.render(scene,camera);
      };
      const resize=()=>{if(disposed)return;const width=Math.max(1,container.clientWidth);renderer.setSize(width,250,false);camera.aspect=width/250;camera.updateProjectionMatrix();draw();};
      const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;
      observer?.observe(container);
      const slider=document.createElement('input');slider.type='range';slider.min='0';slider.max='100';slider.value='0';slider.setAttribute('aria-label',tr('Mozgás fázisa'));slider.className='exercise-three-slider';
      slider.addEventListener('input',()=>{running=false;progress=Number(slider.value)/100;draw();});
      const actions=document.createElement('div');actions.className='row exercise-three-actions';
      const play=document.createElement('button');play.type='button';play.className='btn small';play.textContent=tr('Lejátszás');
      const rotate=document.createElement('button');rotate.type='button';rotate.className='btn small';rotate.textContent=tr('Nézet forgatása');
      rotate.onclick=()=>{angle+=.5;draw();};
      const step=ts=>{if(disposed||!running||document.hidden)return;const elapsed=(ts-started)/1700;progress=(1-Math.cos(elapsed*Math.PI*2))/2;slider.value=String(Math.round(progress*100));draw();frame=requestAnimationFrame(step);};
      play.onclick=()=>{running=!running;play.textContent=running?tr('Szünet'):tr('Lejátszás');cancelAnimationFrame(frame);if(running){started=performance.now();frame=requestAnimationFrame(step);}};
      actions.append(play,rotate);container.append(slider,actions);draw();
      if(matchMedia('(prefers-reduced-motion: reduce)').matches)play.hidden=true;
      const visibility=()=>{if(document.hidden){running=false;play.textContent=tr('Lejátszás');cancelAnimationFrame(frame);}};
      document.addEventListener('visibilitychange',visibility);
      cleanup=()=>{running=false;cancelAnimationFrame(frame);observer?.disconnect();document.removeEventListener('visibilitychange',visibility);for(const m of [...Object.values(joints),...rods.map(x=>x.m)]){m.geometry.dispose();m.material.dispose();}renderer.dispose();renderer.domElement.remove();slider.remove();actions.remove();};
      if(disposed)cleanup();
    }catch{if(!disposed)container.dataset.webgl='unavailable';}
  })();
  return()=>{disposed=true;cleanup();};
}
