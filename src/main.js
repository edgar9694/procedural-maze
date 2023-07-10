"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = __importStar(require("three"));
const PointerLockControls_1 = require("three/examples/jsm/controls/PointerLockControls");
// import * as firstPerson from "./first-person";
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8def0);
scene.fog = new THREE.Fog(0xffffff, 0, 750);
// const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
// camera.position.y = 10;
// camera.position.set(9, 31, -5);
let blocks = 20; //number of blocks of the grid
let sizeLab = 20; //trying a solution to implement sizeLab diferent to blocks number
let fixCoord = (blocks / 2);
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
function createMesh(color) {
    return new THREE.MeshBasicMaterial({ color: color });
}
const geoPathBox = new THREE.BoxGeometry(sizeLab, sizeLab, sizeLab);
const wall = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
const transparentWall = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
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
    upRight: [true, false, false, false, false, true],
    downLeft: [false, true, false, false, true, false],
    upLeft: [false, true, false, false, false, true],
    deadEnd: [true, true, false, false, true, false],
    //just for the external wall
    right: [false, true, false, false, false, false],
    left: [true, false, false, false, false, false],
    up: [false, false, false, false, true, false],
    down: [false, false, false, false, false, true]
};
function retrieveCoord(block) {
    return [
        [(block === null || block === void 0 ? void 0 : block.position.x) + sizeLab, block === null || block === void 0 ? void 0 : block.position.z],
        [(block === null || block === void 0 ? void 0 : block.position.x) - sizeLab, block === null || block === void 0 ? void 0 : block.position.z],
        [block === null || block === void 0 ? void 0 : block.position.x, (block === null || block === void 0 ? void 0 : block.position.z) + sizeLab],
        [block === null || block === void 0 ? void 0 : block.position.x, (block === null || block === void 0 ? void 0 : block.position.z) - sizeLab]
    ];
}
function limitConditions(b, condition) {
    if (condition == 'external') {
        return b[1] !== b[0] && (b[1] + b[0] !== sizeGrid);
    }
    else {
        return (b[0] < (sizeGrid - fixCoord) && b[0] > fixCoord) && (b[1] < (sizeGrid - fixCoord) && b[1] > fixCoord);
    }
}
function getRandomArbitrary(max, min) {
    if (!min) {
        min = 0;
    }
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}
// set the first point manually
function insertInitialPoint() {
    let posiblePoints = [
        [0, getRandomArbitrary(blocks) * sizeLab],
        [getRandomArbitrary(blocks) * sizeLab, 0],
        [blocks * sizeLab, getRandomArbitrary(blocks) * sizeLab],
        [getRandomArbitrary(blocks) * sizeLab, blocks * sizeLab]
    ];
    posiblePoints.forEach(p => {
        p[0] = p[0] === sizeGrid ? p[0] - fixCoord : p[0] + fixCoord;
        p[1] = p[1] === sizeGrid ? p[1] - fixCoord : p[1] + fixCoord;
    });
    posiblePoints = posiblePoints.filter(b => limitConditions(b, 'external'));
    let point = getRandomArbitrary(posiblePoints.length - 1);
    let x = posiblePoints[point][0];
    let z = posiblePoints[point][1];
    generatePathBlock({ x, z }, 'initialBlock');
}
var pathMesh = new THREE.Group();
function generatePathBlock(point, name) {
    let newMesh = hightlightMesh.clone();
    newMesh.material = createMesh(0x008000);
    newMesh.position.set(point.x, 0, point.z);
    newMesh.name = name;
    pathMesh.add(newMesh);
    scene.add(pathMesh);
}
var wallMesh = new THREE.Group();
function generateWallBlock(point, name, material) {
    let matArray = [];
    for (let index = 0; index < setDirectionCube[material].length; index++) {
        const element = setDirectionCube[material][index];
        let side = element ? wall : transparentWall;
        matArray.push(side);
    }
    let newMesh = new THREE.Mesh(geoPathBox, matArray);
    newMesh.position.set(point.x, sizeLab / 2, point.z);
    newMesh.name = name;
    wallMesh.add(newMesh);
    scene.add(wallMesh);
}
function generatePosibleBlocks(block) {
    let newBlocks = [];
    let coordBlocks = retrieveCoord(block);
    coordBlocks = coordBlocks.filter(b => limitConditions(b, 'internal'));
    if ((block === null || block === void 0 ? void 0 : block.name) == 'initialBlock') {
        if ((block === null || block === void 0 ? void 0 : block.position.x) == (sizeGrid - fixCoord) || (block === null || block === void 0 ? void 0 : block.position.x) == (fixCoord)) {
            coordBlocks = coordBlocks.filter(b => (b[0] !== (block === null || block === void 0 ? void 0 : block.position.x)));
        }
        else {
            coordBlocks = coordBlocks.filter(b => (b[1] !== (block === null || block === void 0 ? void 0 : block.position.z)));
        }
    }
    coordBlocks.forEach(b => {
        let pastBlocks = pathMesh.children.find(block => (block === null || block === void 0 ? void 0 : block.position.x) === b[0] && (block === null || block === void 0 ? void 0 : block.position.z) === b[1]);
        if (!pastBlocks) {
            newBlocks.push(b);
        }
    });
    return newBlocks;
}
function checkAdjacentWalls(block) {
    let newBlocks = [] = [];
    let coordBlocks = retrieveCoord(block);
    coordBlocks = coordBlocks.filter(b => limitConditions(b, 'internal'));
    coordBlocks.forEach(b => {
        let pastBlocks = wallMesh.children.find(block => (block === null || block === void 0 ? void 0 : block.position.x) === b[0] && (block === null || block === void 0 ? void 0 : block.position.z) === b[1]);
        if (pastBlocks) {
            newBlocks.push(b);
        }
    });
    return newBlocks;
}
function generatePath(lastBlock, newBlocks, length) {
    let point = getRandomArbitrary(newBlocks.length - 1);
    let pointBlock = {
        x: lastBlock.name == 'initialBlock' ? newBlocks[0][0] : newBlocks[point][0],
        z: lastBlock.name == 'initialBlock' ? newBlocks[0][1] : newBlocks[point][1],
    };
    generatePathBlock(pointBlock, 'block-' + length);
}
function generateWalls(pathMesh, lastBlock, length) {
    //check the direction of the next and previous
    if (length > 0) {
        let blockedWall = false;
        let previousBlock = pathMesh[length - 1];
        let nextBlock = pathMesh[length + 1];
        //indicates enter side
        let coordPRev = {
            x: lastBlock.position.x - previousBlock.position.x,
            z: lastBlock.position.z - previousBlock.position.z
        };
        // indicates exit side
        let coordNext = {
            x: nextBlock.position.x - lastBlock.position.x,
            z: nextBlock.position.z - lastBlock.position.z
        };
        let posibleBlocks = checkAdjacentWalls(lastBlock);
        if (posibleBlocks) {
            let a = false;
            let pastBlocks = [];
            posibleBlocks.forEach(b => {
                if (previousBlock.position.x == b[0] && previousBlock.position.z == b[1]) {
                    a = true;
                }
                else {
                    let block = wallMesh.children.find(block => (block === null || block === void 0 ? void 0 : block.position.x) === b[0] && (block === null || block === void 0 ? void 0 : block.position.z) === b[1]);
                    if (block) {
                        pastBlocks.push(block);
                    }
                }
            });
            if (!a) {
                if (pastBlocks.length > 0) {
                    blockedWall = true;
                    let point = getRandomArbitrary(pastBlocks.length - 1);
                    previousBlock = pastBlocks[point];
                    //indicates enter side
                    coordPRev = {
                        x: lastBlock.position.x - previousBlock.position.x,
                        z: lastBlock.position.z - previousBlock.position.z
                    };
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
        if (coordPRev.x === 0) {
            if (coordPRev.z > 0) {
                enterSide = 'down';
            }
            else {
                enterSide = 'up';
            }
        }
        else {
            if (coordPRev.x > 0) {
                enterSide = 'right';
            }
            else {
                enterSide = 'left';
            }
        }
        let exitSide = '';
        if (coordNext.x === 0) {
            if (coordNext.z > 0) {
                exitSide = 'up';
            }
            else {
                exitSide = 'down';
            }
        }
        else {
            if (coordNext.x > 0) {
                exitSide = 'left';
            }
            else {
                exitSide = 'right';
            }
        }
        let wallCreated = '';
        if (enterSide == 'up' || enterSide == 'down') {
            if (exitSide == 'up' || exitSide == 'down') {
                wallCreated = 'straightVertical';
            }
            else {
                let str = exitSide.charAt(0).toUpperCase() + exitSide.slice(1);
                wallCreated = enterSide + str;
            }
        }
        else {
            if (exitSide == 'left' || exitSide == 'right') {
                wallCreated = 'straightHorizontal';
            }
            else {
                let str = enterSide.charAt(0).toUpperCase() + enterSide.slice(1);
                wallCreated = exitSide + str;
            }
        }
        let pointBlock = {
            x: lastBlock.position.x,
            z: lastBlock.position.z
        };
        generateWallBlock(pointBlock, 'wall-' + wallCreated + '-' + length, wallCreated);
        if (blockedWall) {
            removeBlockedWalls(previousBlock);
        }
    }
    else {
        let directionWall = '';
        if (lastBlock.position.x == fixCoord || lastBlock.position.x == (blocks - fixCoord)) {
            directionWall = 'straightHorizontal';
        }
        else {
            directionWall = 'straightVertical';
        }
        let pointBlock = {
            x: lastBlock.position.x,
            z: lastBlock.position.z
        };
        generateWallBlock(pointBlock, 'initialWall-' + directionWall, directionWall);
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
    scene.add(wallMesh);
    // toggleInterval()
}
function setExternalWall() {
    let maxBlock = sizeGrid - fixCoord;
    for (let i = 0; i < blocks; i++) {
        let log = i * sizeLab;
        let firstBlock = log + fixCoord;
        let position = pathMesh.children[0].position;
        let wallsCoord = [
            {
                x: firstBlock,
                z: maxBlock,
                side: 'up',
                nameWall: 'Wall-up-X-',
                namePath: 'Block-X-',
            },
            {
                x: firstBlock,
                z: fixCoord,
                side: 'down',
                nameWall: 'Wall-down-MirrorX-',
                namePath: 'Block-MirrorX-',
            },
            {
                x: maxBlock,
                z: firstBlock,
                side: 'left',
                nameWall: 'Wall-left-Z-',
                namePath: 'Block-Z-',
            },
            {
                x: fixCoord,
                z: firstBlock,
                side: 'right',
                nameWall: 'Wall-right-MirrorZ-',
                namePath: 'Block-MirrorZ-',
            }
        ];
        wallsCoord.forEach(c => {
            if (!(c.x === position.x && c.z === position.z)) {
                generatePathBlock(c, 'external' + c.namePath + i);
                generateWallBlock(c, 'external' + c.nameWall + i, c.side);
            }
        });
    }
}
function startMaze() {
    let lengthPath = pathMesh.children.length;
    let lengthWall = wallMesh.children.length;
    if (lengthWall !== (blocks * blocks)) {
        let foundBlock = false;
        let index = lengthPath - 1;
        if (index !== 0) {
            //if there is no more options go backwards and create new paths
            while (!foundBlock) {
                const block = pathMesh.children[index];
                let posibleBlocks = generatePosibleBlocks(block);
                if (posibleBlocks.length > 0) {
                    generatePath(block, posibleBlocks, lengthPath);
                    foundBlock = true;
                }
                else {
                    index--;
                    if (index < 0) {
                        break;
                    }
                }
            }
            if (lengthPath >= 2) {
                generateWalls(pathMesh.children, pathMesh.children[lengthPath - 2], lengthPath - 2);
            }
        }
        else {
            let posibleBlocks = generatePosibleBlocks(pathMesh.children[index]);
            generatePath(pathMesh.children[index], posibleBlocks, lengthPath);
        }
    }
    else {
        // setExternalWall();
    }
}
insertInitialPoint();
var time = 10;
var refreshIntervalId;
function toggleInterval() {
    if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = undefined;
    }
    else {
        refreshIntervalId = setInterval(function () {
            if (wallMesh.children.length !== (blocks * blocks)) {
                startMaze();
            }
            else {
                setExternalWall();
                clearInterval(refreshIntervalId);
            }
        }, time);
    }
    refreshIntervalId;
}
toggleInterval();
document.body.appendChild(renderer.domElement);
let camera;
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
window.addEventListener('keydown', function (e) {
    if (e.code == 'Space') {
        toggleInterval();
    }
});
const raycaster = new THREE.Raycaster();
const gravity = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
// let controls: OrbitControls;
let controls;
// var controls: PointerLockControls;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const objects = [];
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
function initFirstPersonCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(pathMesh.children[0].position.x, fixCoord, pathMesh.children[0].position.z);
    camera.position.y = 10;
    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 2.5);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);
    //orbitControls to check the maze
    // controls = new OrbitControls(camera, renderer.domElement);
    // controls.target.set(sizeGrid/2,0,sizeGrid/2);
    // // these two values basically smooth the movement animation
    // controls.dampingFactor = 0.05;
    // controls.enableDamping = true;
    // first Person Camera Controls
    controls = new PointerLockControls_1.PointerLockControls(camera, document.body);
    document.addEventListener('click', function () {
        controls.lock();
    });
    scene.add(controls.getObject());
    const onKeyDown = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;
            case 'Space':
                if (canJump === true)
                    velocity.y += 350;
                canJump = false;
                break;
        }
    };
    const onKeyUp = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;
        }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}
initFirstPersonCamera();
function animate() {
    requestAnimationFrame(animate);
    const time = performance.now();
    gravity.ray.origin.copy(controls.getObject().position);
    gravity.ray.origin.y -= blocks / 2;
    const intersections = gravity.intersectObjects(objects, false);
    // const wall = 
    // console.log(intersections);
    const onObject = intersections.length > 0;
    const delta = (time - prevTime) / 3000;
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 750.0 * delta; // 100.0 = mass
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize(); // this ensures consistent movements in all directions
    if (moveForward || moveBackward)
        velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight)
        velocity.x -= direction.x * 400.0 * delta;
    if (onObject === true) {
        velocity.y = Math.max(0, velocity.y);
        canJump = true;
    }
    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
    controls.getObject().position.y += (velocity.y * delta); // new behavior
    if (controls.getObject().position.y < blocks / 2) {
        velocity.y = blocks / 2;
        controls.getObject().position.y = blocks / 2;
        canJump = true;
    }
    prevTime = time;
    renderer.render(scene, camera);
}
// renderer.setAnimationLoop(animate)
animate();
