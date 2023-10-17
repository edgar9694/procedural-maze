import * as THREE from 'three';
import * as mazeGenerator from "./maze-generator";
import * as firstPerson from "./first-person";
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xa8def0)
// scene.fog = new THREE.Fog(0xffffff, 0, 750);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
let blocks = 20; //number of blocks of the grid
let sizeLab = 20; //trying a solution to implement sizeLab diferent to blocks number
let planePosition = (blocks * sizeLab / 2); //+ 0.5;
let sizeGrid = blocks * sizeLab;
const grid = new THREE.GridHelper(sizeGrid, sizeLab);
grid.position.set(planePosition, 0, planePosition);
scene.add(grid);
const hightlightMesh = new THREE.Mesh(new THREE.PlaneGeometry(sizeLab, sizeLab), new THREE.MeshBasicMaterial({
    side: THREE.DoubleSide,
    transparent: true
}));
hightlightMesh.rotateX(-Math.PI / 2);
hightlightMesh.position.set(planePosition, 0, planePosition);
// scene.add( hightlightMesh );
const axesHelper = new THREE.AxesHelper(sizeLab);
scene.add(axesHelper);
var time = 10;
var refreshIntervalId;
/**
 * add maze
 */
let newGroup = new THREE.Group();
const maze = new mazeGenerator.MazeGenerator(blocks);
maze.generateMaze();
let index = 0;
function toggleInterval() {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = undefined;
    }
    else {
        refreshIntervalId = setInterval(function () {
            // if(wallMesh.children.length !== (blocks* blocks)){
            //     // startMaze();
            // } else {
            //     // setExternalWall();
            //     clearInterval(refreshIntervalId);
            // }
            if (maze.wallGroupMesh[index]) {
                newGroup.add(maze.wallGroupMesh[index]);
                scene.add(newGroup);
                index++;
            }
            else {
                clearInterval(refreshIntervalId);
            }
        }, time);
    }
    refreshIntervalId;
}
scene.add(maze.referenceCone);
/**
 * //add maze
 */
/**
 * add FirsPersonCamera
 */
const firstPersonCamera = new firstPerson.FirstPersonCamera(camera, scene, renderer, maze.sizeGrid, maze.blocks, maze.fixCoord, maze.wallGroupMesh[0].position);
firstPersonCamera.toggleFirstPerson(false);
// firstPersonCamera;
toggleInterval();
function animate() {
    requestAnimationFrame(animate);
    firstPersonCamera.animateMovement();
    renderer.render(firstPersonCamera.scene, firstPersonCamera.camera);
}
// renderer.setAnimationLoop(animate)
animate();
document.body.appendChild(renderer.domElement);
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    firstPersonCamera.camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
