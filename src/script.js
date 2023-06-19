import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Scene
const scene = new THREE.Scene();

// Sun
const sunGeometry = new THREE.SphereGeometry(1, 32, 16);
const sunMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planets
const planetsData = [
  { name: "Mercury", radius: 0.05, distance: 4, speed: 0.001 },
  {
    name: "Venus",
    radius: 0.08,
    distance: 6,
    speed: 0.0008,
    inclination: Math.PI / 8,
  },
  { name: "Earth", radius: 0.1, distance: 8, speed: 0.0006 },
  {
    name: "Mars",
    radius: 0.07,
    distance: 10,
    speed: 0.0005,
    inclination: Math.PI / 12,
  },
  { name: "Jupiter", radius: 0.18, distance: 14, speed: 0.0003 },
  {
    name: "Saturn",
    radius: 0.15,
    distance: 18,
    speed: 0.0002,
    inclination: Math.PI / 16,
  },
  { name: "Uranus", radius: 0.12, distance: 22, speed: 0.0001 },
  { name: "Neptune", radius: 0.11, distance: 26, speed: 0.00008 },
  { name: "Pluto", radius: 0.04, distance: 30, speed: 0.00006 },
];

const planetMeshes = [];
const orbitLines = [];

planetsData.forEach((planetData) => {
  const { radius, distance, speed, inclination = 0 } = planetData;

  const planetGeometry = new THREE.SphereGeometry(radius, 32, 16);
  const planetMaterial = new THREE.MeshLambertMaterial();
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  scene.add(planet);
  planetMeshes.push({ mesh: planet, ...planetData });

  const orbitCurve = new THREE.EllipseCurve(
    0,
    0,
    distance,
    distance,
    0,
    2 * Math.PI,
    false,
    0
  );

  const orbitPoints = orbitCurve.getPoints(100);

  // Convertir les points en THREE.Vector3
  const orbitPoints3D = orbitPoints.map(
    (point) => new THREE.Vector3(point.x, 0, point.y)
  );

  // Appliquer l'inclinaison aux points de la trajectoire
  const inclinationMatrix = new THREE.Matrix4().makeRotationX(inclination);
  orbitPoints3D.forEach((point) => {
    point.applyMatrix4(inclinationMatrix);
  });

  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints3D);
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);

  scene.add(orbit);
  orbitLines.push(orbit);
});

// Light
const light = new THREE.AmbientLight({ color: 0xffffff, intensity: 1 });
scene.add(light);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height);
camera.position.set(0, 0, 40);
scene.add(camera);

// Renderer
const canvas = document.querySelector(".webgl");
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Animation
const animate = () => {
  controls.update();

  planetMeshes.forEach((planetData) => {
    const { mesh, distance, speed } = planetData;
    const angle = Date.now() * speed;

    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;

    mesh.position.set(x, 0, z);
  });

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
};

animate();

window.addEventListener("resize", () => {
  // Mettre à jour les tailles
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Mettre à jour la caméra
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Mettre à jour le rendu
  renderer.setSize(sizes.width, sizes.height);
});
