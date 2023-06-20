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
  {
    name: "Mercury",
    radius: 0.05,
    distance: 4,
    speed: 0.001,
    info: "Information about Mercury",
  },
  {
    name: "Venus",
    radius: 0.08,
    distance: 6,
    speed: 0.0008,
    info: "Information about Venus",
  },
  {
    name: "Earth",
    radius: 0.1,
    distance: 8,
    speed: 0.0006,
    info: "Information about Earth",
  },
  {
    name: "Mars",
    radius: 0.07,
    distance: 10,
    speed: 0.0005,
    info: "Information about Mars",
  },
  {
    name: "Jupiter",
    radius: 0.18,
    distance: 14,
    speed: 0.0003,
    info: "Information about Jupiter",
  },
  {
    name: "Saturn",
    radius: 0.15,
    distance: 18,
    speed: 0.0002,
    info: "Information about Saturn",
  },
  {
    name: "Uranus",
    radius: 0.12,
    distance: 22,
    speed: 0.0001,
    info: "Information about Uranus",
  },
  {
    name: "Neptune",
    radius: 0.11,
    distance: 26,
    speed: 0.00008,
    info: "Information about Neptune",
  },
  {
    name: "Pluto",
    radius: 0.04,
    distance: 30,
    speed: 0.00006,
    info: "Information about Pluto",
  },
];

const planetMeshes = [];
const orbitLines = [];

planetsData.forEach((planetData) => {
  const planetGeometry = new THREE.SphereGeometry(planetData.radius, 32, 16);
  const planetMaterial = new THREE.MeshLambertMaterial();
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  scene.add(planet);
  planetMeshes.push({ mesh: planet, ...planetData });

  const orbitCurve = new THREE.EllipseCurve(
    0,
    0,
    planetData.distance,
    planetData.distance,
    0,
    2 * Math.PI,
    false,
    0
  );
  const orbitPoints = orbitCurve.getPoints(100);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2;
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
const canvas = document.querySelector("canvas.webgl");
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Modal
const modal = document.getElementById("modal");
const planetName = document.getElementById("planet-name");
const planetInfo = document.getElementById("planet-info");

// Event listener for planet click
planetMeshes.forEach((planetData) => {
  const { mesh, info } = planetData;
  console.log(mesh);
  mesh.addEventListener("mouseenter", () => {
    console.log(planetData);
    // Show modal
    planetName.textContent = planetData.name;
    planetInfo.textContent = info;
    modal.style.display = "block";
  });
});

// Event listener for modal close button
const closeButton = document.querySelector(".close");
closeButton.addEventListener("click", () => {
  modal.style.display = "none";
});

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

  window.requestAnimationFrame(animate);
};

animate();
