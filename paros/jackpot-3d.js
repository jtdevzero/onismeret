/* Local Three.js is loaded only when the casino is visible. */
(function () {
  'use strict';
  let loading;
  function load() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (!loading) loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'vendor/three-r160.min.js';
      script.onload = () => window.THREE ? resolve(window.THREE) : reject(Error('Three.js'));
      script.onerror = () => reject(Error('3D unavailable'));
      document.head.append(script);
    });
    return loading;
  }
  function mount(stage, faces, rolling, rollAt) {
    let disposed = false, cleanup = () => {};
    load().then(T => {
      if (disposed || !stage.isConnected) return;
      let renderer, observer, frame;
      const resources = [];
      const own = value => { resources.push(value); return value; };
      cleanup = () => {
        cancelAnimationFrame(frame);
        observer?.disconnect();
        stage.classList.remove('has-3d');
        if (renderer) {
          renderer.domElement.removeEventListener('webglcontextlost', lost);
          renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
        }
        resources.forEach(x => x.dispose());
        resources.length = 0;
      };
      function lost(e) { e.preventDefault(); stage.classList.remove('has-3d'); cancelAnimationFrame(frame); }
      try {
        renderer = new T.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'low-power'});
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.addEventListener('webglcontextlost', lost);
        stage.querySelector('.jackpot-canvas').append(renderer.domElement);
        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(34, 1, 0.1, 40);
        camera.position.set(0, 0.2, 10.8);
        scene.add(new T.AmbientLight(0xffffff, 2.2));
        for (const [color, x, y] of [[0xff59bb,-4,4],[0x8759ff,4,2]]) {
          const light = new T.PointLight(color, 55, 25);
          light.position.set(x,y,5); scene.add(light);
        }
        const symbols = window.PAIR_JACKPOT.categories.map(c=>c.symbol);
        const textures = symbols.map((symbol,i) => {
          const canvas = document.createElement('canvas'); canvas.width=256; canvas.height=256;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle='#241237'; ctx.fillRect(0,0,256,256);
          ctx.strokeStyle=i%2?'#bc8bff':'#ff92d5'; ctx.lineWidth=8;
          ctx.strokeRect(9,9,238,238);
          ctx.shadowColor=ctx.strokeStyle; ctx.shadowBlur=22;
          ctx.fillStyle='#fff0fc'; ctx.font='146px Georgia, serif';
          ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(symbol,128,136);
          const texture=own(new T.CanvasTexture(canvas)); texture.colorSpace=T.SRGBColorSpace;
          return texture;
        });
        const materials=textures.map(map=>own(new T.MeshPhysicalMaterial({map,metalness:0.25,roughness:0.16,clearcoat:1,clearcoatRoughness:0.08})));
        const geometry=own(new T.BoxGeometry(1.5,1.5,1.5));
        const edgeGeometry=own(new T.EdgesGeometry(geometry));
        const edgeMaterial=own(new T.LineBasicMaterial({color:0xeeaaff,transparent:true,opacity:0.7}));
        const cubes=faces.map((face,i)=>{
          const order=[0,1,2,3,4,5]; [order[4],order[face]]=[order[face],order[4]];
          const cube=new T.Mesh(geometry,order.map(k=>materials[k]));
          cube.position.x=(i-1)*2.04;
          cube.rotation.set(0.12,-0.15,0.035*(i-1));
          cube.add(new T.LineSegments(edgeGeometry,edgeMaterial)); scene.add(cube); return cube;
        });
        function draw() {
          if(disposed) return;
          const t=Math.min(1,Math.max(0,(Date.now()-rollAt)/1500));
          const moving=rolling&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&t<1;
          cubes.forEach((cube,i)=>{
            const remaining=moving?Math.pow(1-t,3):0;
            cube.rotation.x=0.12+remaining*Math.PI*(6+i*2);
            cube.rotation.y=-0.15+remaining*Math.PI*(8+i*2);
            cube.position.y=moving?Math.sin(t*Math.PI)*Math.sin(t*14+i)*0.25:0;
          });
          renderer.render(scene,camera);
          if(moving) frame=requestAnimationFrame(draw);
        }
        observer=new ResizeObserver(()=>{
          if(disposed) return;
          const width=stage.clientWidth, height=stage.clientHeight;
          if(!width||!height) return;
          renderer.setSize(width,height,false); camera.aspect=width/height; camera.updateProjectionMatrix();
          // Keep every cube inside the camera on narrow phones too.
          camera.position.z=Math.max(5.8,7.4/(2*Math.tan(17*Math.PI/180)*camera.aspect));
          cancelAnimationFrame(frame); draw();
        });
        observer.observe(stage);
        stage.classList.add('has-3d');
      } catch { cleanup(); }
    }).catch(() => { /* The accessible symbol view remains usable offline or without WebGL. */ });
    return () => { disposed=true; cleanup(); };
  }
  window.PAIR_JACKPOT_3D={mount};
})();
