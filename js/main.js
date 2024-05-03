import * as THREE from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls';


const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(window.innerWidth / -50, window.innerWidth / 50, window.innerHeight / 50, window.innerHeight / -50, 1, 1000);
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Define points
const start = new THREE.Vector3(-10, 0, 0);
const control = new THREE.Vector3(0, 10, 0); // Initially place control point above the center for a visible curve
const end = new THREE.Vector3(10, 0, 0);

// Material for the control points
const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const pointGeometry = new THREE.CircleGeometry(0.4, 32);

// Creating meshes for the control points
const startMesh = new THREE.Mesh(pointGeometry, pointMaterial);
const controlMesh = new THREE.Mesh(pointGeometry, pointMaterial);
const endMesh = new THREE.Mesh(pointGeometry, pointMaterial);

startMesh.position.copy(start);
controlMesh.position.copy(control);
endMesh.position.copy(end);

scene.add(startMesh);
scene.add(controlMesh);
scene.add(endMesh);

// Create the curve and line
const curve = new THREE.QuadraticBezierCurve3(start, control, end);
const curveGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
const curveMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
const curveLine = new THREE.Line(curveGeometry, curveMaterial);
scene.add(curveLine);

// Drag controls for all points
const dragControls = new DragControls([startMesh, controlMesh, endMesh], camera, renderer.domElement);
dragControls.addEventListener('drag', function () {
    updateCurve();
});

// Update the curve based on control point movement
function updateCurve() {
    curve.v0 = startMesh.position;
    curve.v1 = controlMesh.position;
    curve.v2 = endMesh.position;
    curveLine.geometry.setFromPoints(curve.getPoints(50));
}

// Animation loop to render the scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();