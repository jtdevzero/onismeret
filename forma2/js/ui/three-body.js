/* Three.js helyi, offline oktatási testmodell. Stilizált testarányok, nem validált anatómiai modell. */
import { tr } from './i18n.js';
export function mountThreeBody(container, { layer = 'muscles', onPick = () => {} } = {}) {
  let disposed = false, cleanup = () => {};
  (async () => {
    try {
      const THREE = await import('../../vendor/three/three.module.js');
      if (disposed) return;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.setAttribute('aria-hidden', 'true');
      renderer.domElement.className = 'bodylab-three-canvas';
      container.prepend(renderer.domElement);
      const scene = new THREE.Scene(), model = new THREE.Group();
      scene.add(model);
      scene.add(new THREE.HemisphereLight(0xffd9cc, 0x422450, 2.2));
      const key = new THREE.DirectionalLight(0xffab73, 3.2); key.position.set(-3, 6, 6); scene.add(key);
      const rim = new THREE.DirectionalLight(0x42dfdf, 2.5); rim.position.set(4, 3, -5); scene.add(rim);
      const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
      camera.position.set(0, 1.4, 9);
      camera.lookAt(0, 0.1, 0);
      const groups = {};
      const allMeshes = [];
      const palette = { muscles: 0xe57983, joints: 0x61ddd6, bones: 0xf8dcca, connective: 0x71afdb, movements: 0xffae68 };
      const pos = ([x,y,z]) => new THREE.Vector3(x,y,z);
      const shape = (name, geometry, center, material, sx=1, sy=1, sz=1, area='') => {
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: material, roughness: .36, metalness: .16, emissive: material, emissiveIntensity: .035 }));
        mesh.position.set(...center); mesh.scale.set(sx,sy,sz); mesh.userData.area = area;
        groups[name].add(mesh); allMeshes.push(mesh); return mesh;
      };
      const sphere = (name, center, scales, area, color=palette[name]) => shape(name, new THREE.SphereGeometry(1, 16, 12), center, color, ...scales, area);
      const rod = (name, from, to, radius, area, color=palette[name]) => {
        const a = pos(from), b = pos(to), direction = b.clone().sub(a);
        const mesh = shape(name, new THREE.CylinderGeometry(radius, radius, direction.length(), 10), a.clone().add(b).multiplyScalar(.5).toArray(), color, 1, 1, 1, area);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), direction.normalize()); return mesh;
      };
      for (const k of Object.keys(palette)) { groups[k] = new THREE.Group(); model.add(groups[k]); }
      /* Az első sematikus gömbtest helyett részletesebb, szegmentált oktatási izomforma.
         A testarányok illusztratívak, a geometriából NEM számolunk ízületi szöget. */
      sphere('muscles', [0,2.32,0], [.29,.36,.27], '', 0xf8b9a7);
      rod('muscles', [0,1.99,0],[0,1.78,0], .19, '',0xd48c96);
      sphere('muscles', [0,1.10,-.08], [.61,.78,.30], 'back',0x803f68);
      sphere('muscles', [0,.10,-.01], [.42,.56,.28], 'core',0xa65d80);
      sphere('muscles', [0,-.35,-.04], [.56,.33,.34], 'glutes',0xb95a78);
      for (const side of [-1,1]) {
        const p = x => x * side;
        const pec=sphere('muscles',[p(.34),1.49,.21],[.37,.31,.25],'chest',0xe77e89);
        pec.rotation.z=p(.14);
        sphere('muscles', [p(.91),1.52,0], [.29,.31,.31], 'shoulders',0xeeb38d);
        sphere('muscles', [p(1.13),.95,.02], [.22,.40,.22], 'arms',0xd86e82);
        sphere('muscles', [p(1.31),.23,.11], [.17,.37,.18], 'arms',0xb65b7d);
        sphere('muscles', [p(1.37),-.23,.15], [.16,.10,.18], 'arms',0xf3c4ac);
        sphere('muscles', [p(.23),.94,.26], [.18,.19,.13], 'core',0xc86c82);
        for(let row=0;row<3;row++)sphere('muscles',[p(.19),.66-row*.26,.255],[.16,.12,.09],'core',row===0?0xf0a391:0xda7889);
        sphere('muscles', [p(.34),-.42,-.11], [.31,.28,.30], 'glutes',0xdd8190);
        const quad=sphere('muscles', [p(.36),-.95,.09], [.30,.61,.28], 'legs',0xe08e8f);quad.rotation.z=p(.06);
        const shin=sphere('muscles',[p(.38),-1.84,.07],[.20,.49,.21],'legs',0xb96885);shin.rotation.z=p(.02);
        sphere('muscles', [p(.39),-2.30,.21], [.23,.14,.42], 'legs',0xf0b69f);
      }
      /* Hátul hangsúlyos lapocka-/széleshát-régiók a forgatható modellen. */
      for (const side of [-1,1]) {
        const p=x=>x*side;
        const lat=sphere('muscles',[p(.42),.91,-.26],[.33,.57,.16],'back',0x9a5578);lat.rotation.z=p(.18);
        sphere('muscles',[p(.38),1.53,-.29],[.28,.25,.12],'back',0xc77890);
      }
      /* Vizualizációs talapzat: a 3D modell alatt, nem része az anatómiai adatoknak. */
      const ground=new THREE.Mesh(new THREE.RingGeometry(.9,1.03,64),new THREE.MeshBasicMaterial({color:0x65e2d5,transparent:true,opacity:.52,side:THREE.DoubleSide}));
      ground.rotation.x=-Math.PI/2;ground.position.y=-2.59;scene.add(ground);
      const glow=new THREE.Mesh(new THREE.CircleGeometry(1.4,64),new THREE.MeshBasicMaterial({color:0x9a4c83,transparent:true,opacity:.17,depthWrite:false,side:THREE.DoubleSide}));
      glow.rotation.x=-Math.PI/2;glow.position.y=-2.60;scene.add(glow);
      /* Csontváz – felismerhető sematikus csontos elemek, külön réteg. */
      sphere('bones', [0,2.29,0], [.3,.36,.25], 'skull');
      rod('bones', [0,1.85,0], [0,-.25,0], .09, 'spine');
      for (let i=0;i<5;i++) { const y=1.56-i*.21; rod('bones', [-.55,y,0], [.55,y,0], .048, 'ribcage'); }
      sphere('bones', [0,-.27,0], [.48,.22,.25], 'pelvis');
      for (const s of [-1,1]) {
        const x = v => s*v;
        rod('bones', [x(.68),1.67,0], [x(1.04),1.37,0], .055, 'humerus');
        rod('bones', [x(1.05),1.32,0], [x(1.32),.48,0], .085, 'humerus');
        rod('bones', [x(1.32),.48,0], [x(1.44),-.2,0], .06, 'wrist');
        rod('bones', [x(.34),-.45,0], [x(.34),-1.44,0], .14, 'femur');
        rod('bones', [x(.34),-1.48,0], [x(.38),-2.32,0], .11, 'tibia');
      }
      /* Mozgatható ízületi pontok és kötőszöveti vonalak. */
      const nodes = [
        ['shoulder',[-.85,1.48,.08]],['elbow',[-1.25,.48,.08]],['wrist',[-1.39,-.22,.08]],
        ['spine',[0,.48,.33]],['hip',[-.36,-.43,.08]],['knee',[-.34,-1.46,.1]],['ankle',[-.38,-2.26,.12]],
      ];
      for (const [id,c] of nodes) sphere('joints', c, [.16,.16,.16], id);
      for (const s of [-1,1]) {
        const x=v=>v*s;
        rod('connective', [x(.9),1.45,.25],[x(1.18),.43,.24], .035,'tendons');
        rod('connective', [x(.34),-1.25,.2],[x(.35),-1.64,.21], .05,'ligaments');
        rod('connective', [x(.36),-2.05,.2],[x(.37),-2.34,.21], .035,'tendons');
      }
      rod('connective', [0,1.64,.28],[0,-.13,.28], .026,'fascia');
      sphere('connective', [-.34,-1.46,.15], [.11,.07,.12], 'cartilage');
      /* Színes marker a mozgásmintákhoz; animáció helyett magyarázható pontok. */
      for (const [id, center] of [['squat',[0,-1.1,.42]],['push',[0,1.4,.45]],['pull',[0,.9,-.44]],['hinge',[0,-.3,.44]],['rotation',[0,.52,.39]]])
        sphere('movements', center, [.16,.16,.16], id);

      const layerGroup = layer === 'connective' ? 'connective' : layer === 'joints' ? 'joints' : layer === 'bones' ? 'bones' : layer === 'movements' ? 'movements' : 'muscles';
      for (const [k, group] of Object.entries(groups)) group.visible = k === layerGroup;
      let width=0, height=0;
      const render = () => renderer.render(scene,camera);
      const size = () => {
        if (disposed) return;
        const w = Math.max(1,container.clientWidth), h = Math.max(1,container.clientHeight);
        if (w !== width || h !== height) { width=w; height=h; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
        render();
      };
      const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(size) : null;
      observer?.observe(container); size();
      const tools = document.createElement('div'); tools.className = 'bodylab-3d-controls';
      const controls = [
        ['↶', tr('Forgatás balra'), () => { model.rotation.y -= .24; render(); }],
        ['↷', tr('Forgatás jobbra'), () => { model.rotation.y += .24; render(); }],
        ['+', tr('Nagyítás'), () => { camera.position.z = Math.max(6,camera.position.z-.6); render(); }],
        ['−', tr('Kicsinyítés'), () => { camera.position.z = Math.min(13,camera.position.z+.6); render(); }],
      ];
      for (const [txt, label, action] of controls) {
        const button=document.createElement('button');button.type='button';button.className='btn small';button.textContent=txt;button.setAttribute('aria-label',label);button.addEventListener('click',action);tools.append(button);
      }
      container.append(tools);
      let drag = null, wasDrag = false;
      const down = e => { drag = { x:e.clientX, y:e.clientY }; wasDrag=false; renderer.domElement.setPointerCapture(e.pointerId); };
      const move = e => { if (!drag) return; const dx=e.clientX-drag.x, dy=e.clientY-drag.y; if (Math.abs(dx)+Math.abs(dy)>3) wasDrag=true; drag={x:e.clientX,y:e.clientY}; model.rotation.y += dx*.009; model.rotation.x = Math.max(-.45,Math.min(.45,model.rotation.x+dy*.005)); render(); };
      const up = () => { drag=null; };
      const wheel = e => { e.preventDefault(); camera.position.z=Math.max(6,Math.min(13,camera.position.z+Math.sign(e.deltaY)*.5)); render(); };
      const pick = e => {
        if (wasDrag) { wasDrag=false; return; }
        const bounds=renderer.domElement.getBoundingClientRect();
        const pointer = new THREE.Vector2(((e.clientX-bounds.left)/bounds.width)*2-1,-((e.clientY-bounds.top)/bounds.height)*2+1);
        const ray=new THREE.Raycaster(); ray.setFromCamera(pointer,camera);
        const hit=ray.intersectObjects(groups[layerGroup].children,false).find(x=>x.object.userData.area);
        if (hit) onPick(hit.object.userData.area);
      };
      const canvas=renderer.domElement;
      canvas.addEventListener('pointerdown',down); canvas.addEventListener('pointermove',move); canvas.addEventListener('pointerup',up); canvas.addEventListener('pointercancel',up);
      canvas.addEventListener('click',pick); canvas.addEventListener('wheel',wheel,{passive:false});
      /* Diszkrét, felhasználói választásra reagáló renderelés, nincsen folyamatos GPU-ciklus. */
      cleanup = () => {
        observer?.disconnect(); canvas.removeEventListener('pointerdown',down); canvas.removeEventListener('pointermove',move);
        canvas.removeEventListener('pointerup',up); canvas.removeEventListener('pointercancel',up);
        canvas.removeEventListener('click',pick); canvas.removeEventListener('wheel',wheel);
        allMeshes.forEach(m=>{m.geometry.dispose();m.material.dispose();});
        for(const m of [ground,glow]){m.geometry.dispose();m.material.dispose();}
        renderer.dispose(); canvas.remove(); tools.remove();
      };
      if (disposed) cleanup();
    } catch (e) {
      if (!disposed) container.dataset.webgl = 'unavailable';
      /* Az SVG és a szöveges gombok mindig használhatók WebGL nélkül is. */
    }
  })();
  return () => { disposed=true; cleanup(); };
}
