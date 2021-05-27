import {
  PerspectiveCamera,
  Clock,
  Scene,
  MeshBasicMaterial,
  Mesh,
  WebGLRenderer,
  TorusKnotGeometry,
  DirectionalLight,
  DataTexture,
  RGBAFormat,
  UnsignedByteType,
  UVMapping,
  BufferGeometry,
  TorusBufferGeometry,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Conway } from "./conway";

const $parent: HTMLElement = document.querySelector('#visualisation')
const $solids: HTMLSelectElement = document.querySelector('#solids')

const camera = new PerspectiveCamera(
  90,
  $parent.offsetWidth / $parent.offsetHeight,
  1,
  20000
);
camera.position.z = 45;

const clock = new Clock();

const scene = new Scene();

// light
const dirLight = new DirectionalLight(0x55505a, 1);
dirLight.position.set(0, 3, 0);
dirLight.castShadow = true;
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 10;

dirLight.shadow.camera.right = 1;
dirLight.shadow.camera.left = -1;
dirLight.shadow.camera.top = 1;
dirLight.shadow.camera.bottom = -1;

dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
scene.add(dirLight);
// end of light

// game and torus knot
const w = 1024;
const h = 64;
const conway = new Conway(1024, 64, true);

const pixelData = new Uint8Array(4 * w * h);

const dataTexture = new DataTexture(
  pixelData,
  w,
  h,
  RGBAFormat,
  UnsignedByteType,
  UVMapping
);

updateTexture();

const solids = createSolids([{
  geometry: new TorusKnotGeometry(10, 3, 100, 16),
  name: 'Trefoil knot'
}, {
  geometry: new TorusBufferGeometry(20, 3, 100, 32),
  name: 'Torus'
}])

setInterval(updateTexture, 16)
// end of game and torus knot

const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize($parent.offsetWidth, $parent.offsetHeight);
$parent.appendChild(renderer.domElement);

const controls = new OrbitControls(camera as any, renderer.domElement);

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  camera.aspect = $parent.offsetWidth / $parent.offsetHeight;
  camera.updateProjectionMatrix();

  renderer.setSize($parent.offsetWidth, $parent.offsetHeight);
}

onSolidChange()
$solids.addEventListener('change', onSolidChange)

function onSolidChange() {
  const { value } = $solids
  for (const solid of solids) {
    solid.mesh.visible = value == solid.name
  }
}

animate();

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  const delta = clock.getDelta();

  controls.update();

  for (const solid of solids) {
    solid.mesh.rotateY(delta);
  }

  renderer.render(scene, camera);
}

// steps in the simulation and updates the texture !SIDE EFFECTS!
function updateTexture() {
  conway.next();
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const cell = conway.get(x, y);
      const index = (y * w + x) * 4;
      const val = cell ? 0 : 255;
      pixelData[index] = val;
      pixelData[index + 1] = val;
      pixelData[index + 2] = val;
      pixelData[index + 3] = 255;
    }
  }
  dataTexture.needsUpdate = true;
}

// creates all solids !SIDE EFFECTS!
function createSolids(solids: { geometry: BufferGeometry, name: string }[]) {
  const result = []
  for (const solid of solids) {
    const geo = solid.geometry;

    const material = new MeshBasicMaterial({
      map: dataTexture,
    });
  
    const mesh = new Mesh(geo, material);
    scene.add(mesh);
    result.push({
      name: solid.name,
      mesh
    })

    const $option = document.createElement('option')
    $option.value = solid.name
    $option.textContent = solid.name
    $solids.appendChild($option)
  }
  return result
}
