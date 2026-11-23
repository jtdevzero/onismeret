/* Sematikus 3D bemutatópozíciók: nem biomechanikai mérés vagy technikaértékelés. */
const stand = { head:[0,2.15,0], shoulder:[0,1.63,0], elbow:[-.55,1.1,0], wrist:[-.58,.65,0], hip:[0,.45,0], knee:[-.3,-.48,0], ankle:[-.3,-1.48,0] };
const crouch = { head:[0,1.55,-.35], shoulder:[0,1.05,-.35], elbow:[-.55,.72,.1], wrist:[-.6,.5,.35], hip:[0,-.3,-.55], knee:[-.3,-.75,.45], ankle:[-.3,-1.48,0] };
const pushTop = { head:[1.65,.55,0], shoulder:[1.1,.35,0], elbow:[1.1,-.15,.1], wrist:[1.1,-.7,.15], hip:[-.15,.35,0], knee:[-.85,.35,0], ankle:[-1.65,.4,0] };
const pushBottom = { head:[1.65,.15,0], shoulder:[1.1,-.06,0], elbow:[.83,-.38,.45], wrist:[1.1,-.7,.15], hip:[-.15,.1,0], knee:[-.85,.25,0], ankle:[-1.65,.4,0] };
const bridgeLow = { head:[1.7,-1.13,0], shoulder:[1.18,-1.1,0], elbow:[.86,-1.36,.3], wrist:[.5,-1.5,.3], hip:[0,-1.2,0], knee:[-.83,-.47,0], ankle:[-1.44,-1.5,0] };
const bridgeHigh = { head:[1.7,-1.13,0], shoulder:[1.18,-1.1,0], elbow:[.86,-1.36,.3], wrist:[.5,-1.5,.3], hip:[.15,-.43,0], knee:[-.83,-.47,0], ankle:[-1.44,-1.5,0] };
export const MOTIONS = {
  squat: { title:'Guggolás – sematikus mozgás', status:'illustrative', evidence:'Kézzel szerkesztett kétpózos 3D illusztráció; referencia-videós validáció nélkül.', poses:[stand,crouch] },
  push_full: { title:'Fekvőtámasz – sematikus mozgás', status:'illustrative', evidence:'Kézzel szerkesztett kétpózos 3D illusztráció; referencia-videós validáció nélkül.', poses:[pushTop,pushBottom] },
  glute_bridge: { title:'Csípőemelés – sematikus mozgás', status:'illustrative', evidence:'Kézzel szerkesztett kétpózos 3D illusztráció; referencia-videós validáció nélkül.', poses:[bridgeLow,bridgeHigh] },
};
export const motionFor = id => MOTIONS[id] || null;
export const motionStatus = id => motionFor(id)?.status || 'draft';
export function motionPose(id, progress) {
  const motion=motionFor(id);
  if (!motion || !Number.isFinite(progress)) return null;
  const t=Math.max(0,Math.min(1,progress));
  if(t===0 || t===1)return structuredClone(motion.poses[t]);
  return Object.fromEntries(Object.keys(motion.poses[0]).map(k=>[k,motion.poses[0][k].map((v,i)=>v+(motion.poses[1][k][i]-v)*t)]));
}
