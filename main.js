import *  as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );


const scene = new THREE.Scene();
// scene.background = new THREE.Color(0xa8def0)

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
// camera.position.y = 10;
camera.position.set(9, 31, -5);

let blocks = 20;
let planePosition = (blocks/2) //+ 0.5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(blocks/2,0,blocks/2);
// these two values basically smooth the movement animation
controls.dampingFactor = 0.05;
controls.enableDamping = true;



const grid = new THREE.GridHelper(blocks, blocks);
grid.position.set(planePosition,0,planePosition)
scene.add(grid);

const hightlightMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1,1),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        // transparent: true
    })
);

hightlightMesh.rotateX(-Math.PI / 2);
hightlightMesh.position.set(planePosition,0,planePosition)

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );
// var initialPoint = [-18, 25];
// let arrayMaze = [];

function createMesh(color){
    return new THREE.MeshBasicMaterial({ color: color });
}

const wall = new THREE.MeshBasicMaterial({color: 0x808080, side: THREE.DoubleSide});
const transparentWall = new THREE.MeshBasicMaterial({transparent: true, opacity: 0});
// const matPathBox = [
//     new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide}), //left side
//     new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide}), // right side
//     new THREE.MeshBasicMaterial({transparent: true, opacity: 0}), //up side
//     new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide}), //down side
//     new THREE.MeshBasicMaterial({transparent: true, opacity: 0}), //front side
//     new THREE.MeshBasicMaterial({transparent: true, opacity: 0}), // back side
// ];

const setDirectionCube = {
    straightVertical: [true, true, false, false, false, false],
    straightHorizontal: [false, false, false, false, true, true],
    downRight: [true, false, false, false, true, false],
    upRight:[true, false, false, false, false, true],
    downLeft: [false, true, false, false, true, false],
    upLeft: [false, true, false, false, false, true],
    deadEnd: [true, true, false, false, true, false],
    //just for the external wall
    right: [false, true, false, false, false, false],
    left: [true, false, false, false, false, false],
    up: [false, false, false, false, true, false],
    down: [false, false, false, false, false,  true]
}

const wallDirectionCube = {
    left: 0,
    right: 1,
    up: 4,
    down:5,
}

function createWallMesh(color, material){
    const wallColored = new THREE.MeshBasicMaterial({color, side: THREE.DoubleSide});
    let matArray = []
    for (let index = 0; index < setDirectionCube[material].length; index++) {
        const element = setDirectionCube[material][index];
        let side = element ? wallColored : transparentWall;
        matArray.push(side)
    }
    return matArray
}


const geoPathBox = new THREE.BoxGeometry( 1, 1, 1 ); 

function getRandomArbitrary(max, min) {
    if(!min){
        min = 0;
    }
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}
// set the first point manually
function insertInitialPoint(){
    let posiblePoints = [
        [0, getRandomArbitrary(blocks)],
        [getRandomArbitrary(blocks), 0],
        [blocks, getRandomArbitrary(blocks)],
        [getRandomArbitrary(blocks), blocks]
    ]
    posiblePoints.forEach(p =>{
        p[0] = p[0] === blocks ? p[0] - 0.5 : p[0] + 0.5;
        p[1] = p[1] === blocks ? p[1] - 0.5 : p[1] + 0.5
    })
    posiblePoints = posiblePoints.filter(b => b[1] !== b[0] && (b[1] +b[0] !== blocks))
    let point = getRandomArbitrary(posiblePoints.length - 1)
    let x = posiblePoints[point][0];
    let z = posiblePoints[point][1];

    generatePathBlock({x,z}, 'initialBlock');
}


var pathMesh = new THREE.Group(); 
function generatePathBlock(point, name){
    let newMesh = hightlightMesh.clone();
    newMesh.material = createMesh(0x008000)
    newMesh.position.set(point.x, 0, point.z);
    newMesh.name = name
    pathMesh.add(newMesh);
    scene.add(pathMesh);
    
}

var wallMesh = new THREE.Group(); 
function generateWallBlock(point, name, material) {
    let matArray = []
    for (let index = 0; index < setDirectionCube[material].length; index++) {
        const element = setDirectionCube[material][index];
        let side = element ? wall : transparentWall;
        matArray.push(side)
    }
    let newMesh = new THREE.Mesh(geoPathBox,matArray)
    newMesh.position.set(point.x, 0.5, point.z);
    newMesh.name = name
    wallMesh.add(newMesh);
    scene.add(wallMesh);
}

function generatePosibleBlocks(block) {
    let newBlocks = []
    let coordBlocks = [
        [block?.position.x + 1, block?.position.z],
        [block?.position.x - 1, block?.position.z],
        [block?.position.x, block?.position.z + 1],
        [block?.position.x, block?.position.z - 1]
    ]
    coordBlocks = coordBlocks.filter(b => (b[0] < (blocks - 0.5) && b[0] > 0.5) && (b[1] < (blocks - 0.5) && b[1] > 0.5))
    if(block?.name == 'initialBlock'){
        if(block?.position.x == (blocks - 0.5) || block?.position.x == (0.5)){
            coordBlocks = coordBlocks.filter(b => (b[0] !== block?.position.x))
        } else {
            coordBlocks = coordBlocks.filter(b => (b[1] !== block?.position.z))
        }
    }
    coordBlocks.forEach(b => {
        let pastBlocks = pathMesh.children.find(block =>block?.position.x === b[0] &&  block?.position.z === b[1])
        if(!pastBlocks){
            newBlocks.push(b)
        }
    })
    return newBlocks
}

function checkAdjacentWalls(block) {
    let newBlocks = []
    let coordBlocks = [
        [block?.position.x + 1, block?.position.z],
        [block?.position.x - 1, block?.position.z],
        [block?.position.x, block?.position.z + 1],
        [block?.position.x, block?.position.z - 1]
    ]
    coordBlocks = coordBlocks.filter(b => (b[0] < (blocks - 0.5) && b[0] > 0.5) && (b[1] < (blocks - 0.5) && b[1] > 0.5))
    coordBlocks.forEach(b => {
        let pastBlocks = wallMesh.children.find(block =>block?.position.x === b[0] &&  block?.position.z === b[1])
        if(pastBlocks){
            newBlocks.push(b)
        }
    })
    return newBlocks
}

function generatePath(lastBlock,newBlocks, length){
    let point = getRandomArbitrary(newBlocks.length - 1);
    let pointBlock = {
        x: lastBlock.name == 'initialBlock' ? newBlocks[0][0]: newBlocks[point][0],
        z: lastBlock.name == 'initialBlock' ? newBlocks[0][1]: newBlocks[point][1],
    }
    generatePathBlock(pointBlock, 'block-'+length )
   
}

function generateWalls(pathMesh, lastBlock, length){
    //check the direction of the next and previous
    if(length > 0){
        let blockedWall =false;
        let previousBlock = pathMesh[length-1]
        let nextBlock = pathMesh[length+1]
        //indicates enter side
        let coordPRev = {
            x: lastBlock.position.x - previousBlock.position.x,
            z: lastBlock.position.z - previousBlock.position.z
        }

        // indicates exit side
        let coordNext = {
            x: nextBlock.position.x - lastBlock.position.x,
            z: nextBlock.position.z - lastBlock.position.z
        }
        let posibleBlocks = checkAdjacentWalls(lastBlock)
        if(posibleBlocks){
            let a = false
            let pastBlocks = []
            posibleBlocks.forEach(b =>{
                if(previousBlock.position.x == b[0] && previousBlock.position.z == b[1]){
                    a = true;
                } else {
                    let block = wallMesh.children.find(block =>block?.position.x === b[0] &&  block?.position.z === b[1])
                    if(block){
                        pastBlocks.push(block)
                    }
                }
            })
            if(!a){
                // console.log("Sin conexion con el anterior");
                // console.log(pastBlocks);
                if (pastBlocks.length > 0) {
                    blockedWall = true;
                    let point = getRandomArbitrary(pastBlocks.length - 1)
                    previousBlock = pastBlocks[point];
                    //indicates enter side
                    coordPRev = {
                        x: lastBlock.position.x - previousBlock.position.x,
                        z: lastBlock.position.z - previousBlock.position.z
                    }
                }
            }
        }

        //set Enter side
        //                  z
        //                  |
        //                  |
        //                  |
        //                  |
        // // x ------------0----------- -x
        //                  |
        //                  |
        //                  |
        //                  |
        //                  -z

        let enterSide = '';
        if(coordPRev.x === 0){
            if(coordPRev.z > 0){
                enterSide = 'down'
            } else {
                enterSide = 'up'

            }
        } else {
            if(coordPRev.x > 0){
                enterSide = 'right'
            } else {
                enterSide = 'left'
            }
        } 


        let exitSide = '';
        if(coordNext.x === 0){
            if(coordNext.z > 0){
                exitSide = 'up'
            } else {
                exitSide = 'down'
            }
        } else {
            if(coordNext.x > 0){
                exitSide = 'left'
            } else {
                exitSide = 'right'
            }
        } 
        let wallCreated = '';
        if(enterSide == 'up' || enterSide == 'down'){
            if(exitSide == 'up' || exitSide == 'down'){
                wallCreated = 'straightVertical'
            } else {
                let str = exitSide.charAt(0).toUpperCase() + exitSide.slice(1);
                wallCreated = enterSide + str;
            }
        } else {
            if(exitSide == 'left' || exitSide == 'right'){
                wallCreated = 'straightHorizontal'
            } else {
                let str = enterSide.charAt(0).toUpperCase() + enterSide.slice(1);
                wallCreated = exitSide + str;
            }
        }
        let pointBlock = {
            x: lastBlock.position.x,
            z: lastBlock.position.z
        }
        generateWallBlock(pointBlock, 'wall-' +wallCreated+ '-' + length, wallCreated);
        if(blockedWall){
            removeBlockedWalls(previousBlock, lastBlock)
        }
    } else {
        let directionWall = ''
        if(lastBlock.position.x == 0.5 || lastBlock.position.x == (blocks-0.5)){
            directionWall = 'straightHorizontal'
        } 
        else {
            directionWall = 'straightVertical'
        }
        let pointBlock = {
            x: lastBlock.position.x,
            z: lastBlock.position.z
        }
        generateWallBlock(pointBlock, 'initialWall-'+directionWall, directionWall);
    }
}

function removeBlockedWalls(block) {
    // console.log(block.name.includes('updated'));
    // if(block.name.includes('updated')){
    //     return;
    // }
    // // indicates exit side
    // let coordNext = {
    //     x: nextBlock.position.x - block.position.x,
    //     z: nextBlock.position.z - block.position.z
    // }
    // let exitSide = '';
    // let enterSide = '';
    // if(coordNext.x === 0){
    //     if(coordNext.z > 0){
    //         exitSide = 'up'
    //         enterSide = 'down'
    //     } else {
    //         exitSide = 'down'
    //         enterSide = 'up'
    //     }
    // } else {
    //     if(coordNext.x > 0){
    //         exitSide = 'left' 
    //         enterSide = 'right'
    //     } else {
    //         exitSide = 'right'
    //         enterSide = 'left'
    //     }
    // }

    wallMesh.remove(block);
    scene.add(wallMesh)
    // toggleInterval()
}

function setExternalWall() { 
    let maxBlock = blocks-0.5
    for(let i=0.5 ;i<= maxBlock; i++){
        let position =pathMesh.children[0].position
        let wallsCoord = [
            {
                x: i,
                z: blocks-0.5,
                side: 'up',
                nameWall: 'Wall-up-X-',
                namePath: 'Block-X-',
            },
            {
                x: i,
                z: 0.5,
                side: 'down',
                nameWall: 'Wall-down-MirrorX-',
                namePath: 'Block-MirrorX-',
            },
            {
                x: blocks-0.5,
                z: i,
                side: 'left',
                nameWall: 'Wall-left-Z-',
                namePath: 'Block-Z-',
            },
            {
                x: 0.5,
                z: i,
                side: 'right',
                nameWall: 'Wall-right-MirrorZ-',
                namePath: 'Block-MirrorZ-',
            }
        ]

        wallsCoord.forEach(c =>{
            if(!(c.x === position.x && c.z ===position.z)){
                generatePathBlock(c, 'external'+ c.namePath +i )
                generateWallBlock(c, 'external'+ c.nameWall + i, c.side);
            }
            
        });
    }
}

function startMaze(){
    let lengthPath = pathMesh.children.length;
    let lengthWall = wallMesh.children.length
    // if(lengthWall !== ((blocks - 2) * (blocks - 2) + 1)){
    if(lengthWall !== (blocks* blocks)){
    // if(lengthPath !== ((blocks - 2) * (blocks - 2) + 1)){
    // if(lengthPath <= 4){
        let foundBlock = false;
        let index = lengthPath-1
        if(index !== 0){
            //if there is no more options go backwards and create new paths
            while (!foundBlock) {
                const block = pathMesh.children[index];
                let posibleBlocks = generatePosibleBlocks(block)

                if(posibleBlocks.length > 0){
                    generatePath(block,posibleBlocks, lengthPath)
                    foundBlock = true;
                } else {
                    index--;
                    if(index < 0){
                        break;
                    }
                }
            }
            if(lengthPath >= 2){
                wallMesh.children.forEach(element => {
                    let material =element.name.split('-')
                    var cloned = createWallMesh(0x808080, material[1]);
                    element.material = cloned;
                });
                generateWalls(pathMesh.children,pathMesh.children[lengthPath-2], lengthPath-2)
            }
            
        } else {
            let posibleBlocks = generatePosibleBlocks(pathMesh.children[index])
            generatePath(pathMesh.children[index],posibleBlocks, lengthPath)
        }
    } else {
        // setExternalWall();
    }

    
}

insertInitialPoint();
var time = 10
var refreshIntervalId
function toggleInterval() { 
    if(refreshIntervalId){ 
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
    } else {
        refreshIntervalId = setInterval(function(){
            if(wallMesh.children.length !== (blocks* blocks)){
                startMaze();
            } else {
                setExternalWall();
                clearInterval(refreshIntervalId);
            }
        },time)
    }

    refreshIntervalId
}

toggleInterval()
document.body.appendChild( renderer.domElement );
function animate(time) {
    
    // if(Math.floor(time/1000) % 2 == 0){
        // generatePath();
    // }
	renderer.render( scene, camera );
}  

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight)  
})

window.addEventListener('keydown', function (e) {
    if(e.code =='Space') {
        toggleInterval()
    }
    
})
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let intersects = [];
window.addEventListener('click', function (e) {
    pointer.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( pointer, camera );
    intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0){
        let i0 = intersects[0];
        console.log(i0.object);
    }
    
})
renderer.setAnimationLoop(animate)