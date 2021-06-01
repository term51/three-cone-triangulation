let camera, scene, renderer, controls, geometry, coneParameters, conePoints = [], cone;

init();
animate();

function init() {
   const $coneHeight = document.getElementById('coneHeight');
   const $coneRadius = document.getElementById('coneRadius');
   const $coneSegments = document.getElementById('coneSegments');
   const $modelContainer = document.getElementById('3d-model');

   const width = $modelContainer.clientWidth;
   const height = window.innerHeight;
   camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
   camera.lookAt(0, 0, 0);
   camera.position.set(0, 0, 50);
 
   renderer = new THREE.WebGLRenderer();
   renderer.setSize(width, height);
   $modelContainer.appendChild(renderer.domElement);

   controls = new THREE.OrbitControls(camera, renderer.domElement);

   scene = new THREE.Scene();
   scene.background = new THREE.Color('#3e3e3e');

   geometry = new THREE.BufferGeometry();

   coneParameters = {
      height: null,
      radius: null,
      segments: null
   };

   addLights();

   $coneHeight.addEventListener('change', (e) => {
      coneParameters.height = e.target.value;
      sendData();
   });
   $coneRadius.addEventListener('change', (e) => {
      coneParameters.radius = e.target.value;
      sendData();
   });
   $coneSegments.addEventListener('change', (e) => {
      coneParameters.segments = e.target.value;
      sendData();
   });
}

function addLights() {
   const hemiLight = new THREE.HemisphereLight('#fff', 0x444444);
   hemiLight.position.set(0, 0, -10);
   scene.add(hemiLight);

   const light = new THREE.DirectionalLight(0xffffff, 1, 100);
   light.position.set(10, 20, 50); //default; light shining from top
   light.castShadow = false; // default false
   scene.add(light);
}

function isHaveNull(arr) {
   return Object.values(arr).includes(null);
}

function sendData() {
   if (!isHaveNull(coneParameters)) {
      fetch('/api/triangulation', {
         method: 'post',
         headers: {'Content-type': 'application/json'},
         body: JSON.stringify(coneParameters)
      })
         .then(res => res.json())
         .then(res => {
            viewModel(res);
         })
         .catch(e => console.log(e));
   }
}

function viewModel(triangulation) {
   buildConePoints(triangulation);
   if (!cone) {
      drawCone();
   } else {
      setupConeGeometry();
   }
   conePoints = [];
}

function buildConePoints(triangulation) {
   function isIndexExist(i) {
      return i < triangulation.Pi.length;
   }

   for (let i = 0; i < triangulation.Pi.length; i++) {
      addPoint(triangulation.Pi[i].X, triangulation.Pi[i].Y, triangulation.Pi[i].Z);
      addPoint(triangulation.A.X, triangulation.A.Y, triangulation.A.Z);
      if (!isIndexExist(i + 1)) {
         addPoint(triangulation.Pi[0].X, triangulation.Pi[0].Y, triangulation.Pi[0].Z);
      } else {
         addPoint(triangulation.Pi[i + 1].X, triangulation.Pi[i + 1].Y, triangulation.Pi[i + 1].Z);
      }
   }
}

function addPoint(...coords) {
   conePoints.push([
      coords[0],
      coords[1],
      coords[2],
   ]);
}

function drawCone() {
   setupConeGeometry();

   const material = new THREE.MeshStandardMaterial(
      {
         color: '#999',
         side: THREE.DoubleSide,
         flatShading: true,
      }
   );
   cone = new THREE.Mesh(geometry, material);
   scene.add(cone);
}

function setupConeGeometry() {
   const numVertices = conePoints.length;
   const positionNumComponents = 3;
   const positions = new Float32Array(numVertices * positionNumComponents);

   let posNdx = 0;

   conePoints.forEach(item => {
      positions.set(item, posNdx);
      posNdx += positionNumComponents;
   });

   const typedArray = new Float32Array(positions);
   const bufferAttr = new THREE.BufferAttribute(typedArray, positionNumComponents);

   geometry.setAttribute('position', bufferAttr);
}

function animate() {
   requestAnimationFrame(animate);
   controls.update();
   renderer.render(scene, camera);
}

