import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Scene
const scene = new THREE.Scene();

// Background
const backgroundGeometry = new THREE.SphereGeometry(100, 32, 16);
const backgroundTexture = new THREE.TextureLoader().load("./assets/bg.jpg");
const backgroundMaterial = new THREE.MeshLambertMaterial({
  map: backgroundTexture,
  side: THREE.BackSide,
});
const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
scene.add(background);

// Sun
const sunGeometry = new THREE.SphereGeometry(1, 32, 16);
const sunTexture = new THREE.TextureLoader().load('./assets/sun.jpg');
const sunMaterial = new THREE.MeshLambertMaterial({map: sunTexture, emissive: 0xff9900, emissiveIntensity: .7,});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const sunLight = new THREE.PointLight(0xff9900, 10, 30);
sunLight.position.copy(sun.position);
scene.add(sunLight);

// Planets
const planetsData = [
  {
    name: "Mercury",
    radius: 0.05,
    distance: 4,
    speed: 0.001,
    inclination: Math.PI / 8,
    info: "Information about Mercury",
    texture: "./assets/mercury.jpg",
  },
  {
    name: "Venus",
    radius: 0.08,
    distance: 6,
    speed: 0.0008,
    info: "Information about Venus",
    texture: "./assets/venus.jpg",
    inclination: Math.PI / 8,
  },
  {
    name: "Earth",
    radius: 0.1,
    distance: 8,
    speed: 0.0006,
    info: "Information about Earth",
    texture: "./assets/earth.jpg",
  },
  {
    name: "Mars",
    radius: 0.07,
    distance: 10,
    speed: 0.0005,
    inclination: Math.PI / 12,
    info: "Information about Mars",
    texture: "./assets/mars.jpg",
  },
  {
    name: "Jupiter",
    radius: 0.18,
    distance: 14,
    speed: 0.0003,
    info: "Information about Jupiter",
    texture: "./assets/jupiter.jpg",
  },
  {
    name: "Saturn",
    radius: 0.15,
    distance: 18,
    speed: 0.0002,
    inclination: Math.PI / 16,
    info: "Information about Saturn",
    texture: "./assets/saturn.jpg",
  },
  {
    name: "Uranus",
    radius: 0.12,
    distance: 22,
    speed: 0.0001,
    info: "Information about Uranus",
    texture: "./assets/uranus.jpg",
  },
  {
    name: "Neptune",
    radius: 0.11,
    distance: 26,
    speed: 0.00008,
    info: "Information about Neptune",
    texture: "./assets/neptune.jpg",
  },
  {
    name: "Pluton",
    radius: 0.04,
    distance: 30,
    speed: 0.00006,
    info: "Information about Pluton",
    texture: "./assets/pluton.jpg",
  },
];

const planetMeshes = [];
const orbitLines = [];

planetsData.forEach((planetData) => {
  const { radius, distance, speed, inclination = 0 } = planetData;

  const planetGeometry = new THREE.SphereGeometry(radius, 32, 16);
  const planetTexture = new THREE.TextureLoader().load(planetData.texture);
  const planetMaterial = new THREE.MeshLambertMaterial({map: planetTexture});
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

  // inclinaison
  const inclinationMatrix = new THREE.Matrix4().makeRotationX(inclination);
  orbitPoints3D.forEach((point) => {
    point.applyMatrix4(inclinationMatrix);
  });

  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints3D);
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0x808080,
    linewidth: .7,
    opacity: 0.5,
    transparent: true
  });

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
camera.position.set(0, 20, 55);
scene.add(camera);

// Renderer
const canvas = document.querySelector("canvas.webgl");
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.maxDistance = 100;
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

const pauseButton = document.getElementById('pauseButton');
pauseButton.addEventListener('click', () => {

    isAnimationPaused = !isAnimationPaused;

    if (isAnimationPaused) {
        pauseButton.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        pauseButton.innerHTML = '<i class="fas fa-pause"></i>';
    }
});

let isAnimationPaused = false;

// Animation
const animate = () => {
  controls.update();
  if (!isAnimationPaused) {
    sun.rotation.y += 0.003;
    sun.rotation.x += 0.001;

    const elapsedTime = Date.now();

    planetMeshes.forEach((planetData) => {
      const {mesh, distance, speed, inclination = 0} = planetData;
      mesh.rotation.y += 0.003;
      mesh.rotation.x += 0.001;

      const angle = (elapsedTime * speed) % (2 * Math.PI); // Angle en fonction du temps écoulé
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;

      // Appliquer l'inclinaison à la position de la planète
      const inclinationMatrix = new THREE.Matrix4().makeRotationX(inclination);
      const planetPosition = new THREE.Vector3(x, 0, z);
      planetPosition.applyMatrix4(inclinationMatrix);

      mesh.position.copy(planetPosition);
    });
  }
  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
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
