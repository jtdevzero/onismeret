/* Helyi GLB-assetek, illusztratív oktatási státusszal. Nem riggelt/biomechanikailag validált modell. */
import { canUseLocalModel, BODYLAB_ASSET_POLICY } from '../core/bodylab-render.js';

const ECORCHE = Object.freeze({
  path:'./assets/models/ecorche.meshopt.glb',
  bytes:6004016,
  status:'illustrative',
  license:'CC BY-SA 4.0',
  source:'Écorché (Charleeh/ecorche), BodyParts3D és Z-Anatomy',
});
export const ANATOMY_MODELS = Object.freeze({muscles:ECORCHE,bones:ECORCHE});

export async function loadAnatomyModel(key, signal) {
  const entry=ANATOMY_MODELS[key];
  if(!canUseLocalModel(entry))return null;
  const response=await fetch(new URL('../../'+entry.path.slice(2),import.meta.url),{signal,credentials:'omit',cache:'default'});
  if(!response.ok)throw new Error('model-http');
  const claimed=Number(response.headers.get('content-length'));
  if(claimed>BODYLAB_ASSET_POLICY.maximumModelBytes)throw new Error('model-too-large');
  const bytes=await response.arrayBuffer();
  if(bytes.byteLength>BODYLAB_ASSET_POLICY.maximumModelBytes)throw new Error('model-too-large');
  const {GLTFLoader}=await import('../../vendor/three/addons/loaders/GLTFLoader.js');
  const {MeshoptDecoder}=await import('../../vendor/three/addons/libs/meshopt_decoder.module.js');
  const gltf=await new Promise((resolve,reject)=>new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parse(bytes,'',resolve,reject));
  return gltf;
}

export function disposeAnatomyModel(gltf) {
  if(!gltf?.scene)return;
  const geometries=new Set(),materials=new Set(),textures=new Set();
  gltf.scene.traverse(obj=>{
    if(obj.geometry)geometries.add(obj.geometry);
    const assigned=Array.isArray(obj.material)?obj.material:obj.material?[obj.material]:[];
    for(const mat of assigned){materials.add(mat);for(const value of Object.values(mat))if(value?.isTexture)textures.add(value);}
  });
  for(const item of textures)item.dispose();
  for(const item of materials)item.dispose();
  for(const item of geometries)item.dispose();
}
