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
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Conway } from "./conway";

const camera = new PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
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

const geometry = new TorusKnotGeometry(10, 3, 100, 16);

const material = new MeshBasicMaterial({
  map: dataTexture,
});
const torus = new Mesh(geometry, material);
scene.add(torus);

setInterval(updateTexture, 16)
// end of game and torus knot

const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera as any, renderer.domElement);

window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

animate();

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  const delta = clock.getDelta();

  controls.update();

  torus.rotateY(delta);

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
