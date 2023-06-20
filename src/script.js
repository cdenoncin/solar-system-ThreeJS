import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min.js";
import axios from "axios";

// Data
let targetPlanet = null;
let isAnimationPaused = false;
let targetLookAt;
let isZoomingIn = true;

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
const sunTexture = new THREE.TextureLoader().load("./assets/sun.jpg");
const sunMaterial = new THREE.MeshLambertMaterial({
  map: sunTexture,
  emissive: 0xff9900,
  emissiveIntensity: 0.5,
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const sunLight = new THREE.PointLight(0xff9900, 10, 30);
sunLight.position.copy(sun.position);
scene.add(sunLight);

// Planets
let planetsData = [];

await axios.get("..//json/planets.json").then((response) => {
  planetsData.push(...response.data);
});

console.log(planetsData);

const planetMeshes = [];
const orbitLines = [];

planetsData.forEach((planetData) => {
  const { radius, distance, speed, inclination = 0 } = planetData;

  const planetGeometry = new THREE.SphereGeometry(radius, 32, 16);
  const planetTexture = new THREE.TextureLoader().load(planetData.texture);
  const planetMaterial = new THREE.MeshLambertMaterial({
    map: planetTexture,
    emissive: "0xffffff",
    emissiveIntensity: 0.2,
  });
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
    linewidth: 0.7,
    opacity: 0.5,
    transparent: true,
  });

  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);

  scene.add(orbit);
  orbitLines.push(orbit);
});

// Create a Raycaster
const raycaster = new THREE.Raycaster();

// Create a vector to store the mouse coordinates
const mouse = new THREE.Vector2();
const handleCloseButtonClick = () => {
  // Animation de zoom sortant
  const zoomAnimationDuration = 1000; // Durée de l'animation en millisecondes
  const currentCameraPosition = camera.position.clone();
  const zoomTween = new TWEEN.Tween(currentCameraPosition)
    .to(originalCameraPosition, zoomAnimationDuration)
    .easing(TWEEN.Easing.Quadratic.InOut) // Type d'interpolation pour l'animation
    .onUpdate(() => {
      camera.position.copy(currentCameraPosition);
      camera.lookAt(targetLookAt);
    })
    .onComplete(() => {
      // Réactiver les contrôles
      controls.enabled = true;
      changePausePlay();
    })
    .start();

  // Masquer la modal
  modal.style.display = "none";
};
const handleClick = (event) => {
  // Coordonnées de la souris normalisées
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;

  // Mettre à jour le rayon de la souris
  raycaster.setFromCamera(mouse, camera);

  // Vérifier les intersections avec les objets 3D
  const intersects = raycaster.intersectObjects(
    planetMeshes.map((planet) => planet.mesh)
  );

  // S'il y a des intersections, prendre la première
  if (intersects.length > 0) {
    isZoomingIn = true;
    controls.enabled = false;
    const intersectedPlanet = intersects[0].object;
    targetPlanet = intersectedPlanet;
    const planetData = planetMeshes.find(
      (planet) => planet.mesh === intersectedPlanet
    );

    // Animation de zoom progressif
    const zoomDistance = planetData.radius * 0.01; // Distance de zoom personnalisée
    const zoomAnimationDuration = 1000; // Durée de l'animation en millisecondes
    const currentCameraPosition = camera.position.clone();
    const targetZoomPosition = intersectedPlanet.position
      .clone()
      .normalize()
      .multiplyScalar(zoomDistance);
    targetLookAt = intersectedPlanet.position.clone();
    const zoomTween = new TWEEN.Tween(currentCameraPosition)
      .to(targetZoomPosition, zoomAnimationDuration)
      .easing(TWEEN.Easing.Quadratic.InOut) // Type d'interpolation pour l'animation
      .onUpdate(() => {
        camera.position.copy(currentCameraPosition);
        camera.lookAt(targetLookAt);
      })
      .onComplete(() => {
        if (isZoomingIn) {
          // Animation de zoom entrant terminée
          // Mettre à jour les informations de la planète dans la modal
          const modalDelay = 500;
          setTimeout(() => {
            planetName.textContent = planetData.name;
            planetInfo.textContent = planetData.info;
            modal.style.display = "block";
          }, modalDelay);
        } else {
          // Animation de zoom sortant terminée
          controls.enabled = true;
        }
      })
      .start();

    // Mettre en pause l'animation
    makePause();
  }
};

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
const originalCameraPosition = camera.position.clone();
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

// Event listener for modal close button
const closeButton = document.querySelector(".close");
closeButton.addEventListener("click", () => {
  modal.style.display = "none";
});

const pauseButton = document.getElementById("pauseButton");

const changePausePlay = () => {
  isAnimationPaused = !isAnimationPaused;

  if (isAnimationPaused) {
    pauseButton.innerHTML = '<i class="fas fa-play"></i>';
  } else {
    pauseButton.innerHTML = '<i class="fas fa-pause"></i>';
  }
};

const makePause = () => {
  isAnimationPaused = true;
  pauseButton.innerHTML = '<i class="fas fa-play"></i>';
};

// Animation
const animate = () => {
  if (controls.enabled) {
    controls.update();
  }

  TWEEN.update();
  if (!isAnimationPaused) {
    sun.rotation.y += 0.003;
    sun.rotation.z += 0.001;

    const elapsedTime = Date.now();

    planetMeshes.forEach((planetData) => {
      const { mesh, distance, speed, inclination = 0 } = planetData;
      mesh.rotation.y += 0.006;
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

pauseButton.addEventListener("click", () => {
  changePausePlay();
});

closeButton.addEventListener("click", handleCloseButtonClick);

window.addEventListener("click", handleClick);
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
});
