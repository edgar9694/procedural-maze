import *  as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { OrbitControls  } from 'three/examples/jsm/controls/OrbitControls.js';

import * as firstPerson from "./first-person";
import * as mazeGenerator from "./maze-generator"

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );


const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xa8def0)
// scene.fog = new THREE.Fog(0xffffff, 0, 750);

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

let blocks = 20; //number of blocks of the grid
let sizeLab = 20; //trying a solution to implement sizeLab diferent to blocks number


let fixCoord = (blocks/2);
let planePosition = (blocks*sizeLab/2); //+ 0.5;
let sizeGrid = blocks * sizeLab;
const grid = new THREE.GridHelper(sizeGrid, sizeLab);
grid.position.set(planePosition,0,planePosition)
scene.add(grid);

const hightlightMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(sizeLab,sizeLab),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        transparent: true
    })
);

hightlightMesh.rotateX(-Math.PI / 2);
hightlightMesh.position.set(planePosition,0,planePosition)
// scene.add( hightlightMesh );

const axesHelper = new THREE.AxesHelper( sizeLab );
scene.add( axesHelper );

function createMesh(color:any){
    return new THREE.MeshBasicMaterial({ color: color });
}

var time = 10;
var refreshIntervalId: number | undefined;

/**
 * add maze
 */
let newGroup = new THREE.Group() 
const maze = new mazeGenerator.MazeGenerator(blocks);
maze.generateMaze()
let index =0
function toggleInterval() { 
    if(refreshIntervalId){ 
        clearInterval(refreshIntervalId);
        refreshIntervalId = undefined;
    } else {
        refreshIntervalId = setInterval(function(){
            // if(wallMesh.children.length !== (blocks* blocks)){
            //     // startMaze();
            // } else {
            //     // setExternalWall();
            //     clearInterval(refreshIntervalId);
            // }
            if(maze.wallGroupMesh[index]){
                newGroup.add(maze.wallGroupMesh[index])
                scene.add(newGroup);
                index++
            } else {
                clearInterval(refreshIntervalId);
            }        
        },time)
    }

    refreshIntervalId
}

scene.add(maze.referenceCone);
/**
 * //add maze
 */


/**
 * add FirsPersonCamera
 */
const firstPersonCamera = new firstPerson.FirstPersonCamera(
    camera,
    scene,
    renderer,
    maze.sizeGrid,
    maze.blocks,
    maze.fixCoord,
    maze.wallGroupMesh[0].position
);
// firstPersonCamera.firstPersonView = false;
firstPersonCamera.initFirstPersonCamera();

toggleInterval()

function animate() {
    
    requestAnimationFrame( animate );
	firstPersonCamera.animateMovement();               
    renderer.render(firstPersonCamera.scene, firstPersonCamera.camera );
}  
// renderer.setAnimationLoop(animate)
animate();



document.body.appendChild( renderer.domElement );
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    firstPersonCamera.camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)  
})


