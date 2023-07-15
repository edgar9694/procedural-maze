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
exports.FirstPersonCamera = void 0;
const THREE = __importStar(require("three"));
const PointerLockControls_1 = require("three/examples/jsm/controls/PointerLockControls");
class FirstPersonCamera {
    constructor(camera, scene, renderer, sizeGrid, blocks, fixCoord, firstPosition) {
        this.firstPersonView = false;
        this.prevTime = performance.now();
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.objects = [];
        this.raycaster = new THREE.Raycaster();
        this.gravity = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
        //movement
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.canJump = false;
        this.run = false;
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.sizeGrid = sizeGrid;
        this.blocks = blocks;
        this.fixCoord = fixCoord;
        this.firstPosition = firstPosition;
        this.initFirstPersonCamera();
    }
    switchTypeofCamera() {
        if (this.firstPersonView) {
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.camera.position.y = 10;
            // first Person Camera Controls
            this.controls = new PointerLockControls_1.PointerLockControls(this.camera, document.body);
            this.camera.position.set(this.firstPosition.x, this.firstPosition.y, this.firstPosition.z);
            this.controls = new PointerLockControls_1.PointerLockControls(this.camera, document.body);
            document.addEventListener('click', () => {
                this.controls.lock();
            });
        }
        else {
            //isometric view to check the maze
            const aspect = window.innerWidth / window.innerHeight;
            console.log(aspect);
            const d = 350;
            this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
            // this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000 );
            this.camera.position.set(500, 500, 500);
            let planePosition = (this.fixCoord * this.blocks) / 2;
            this.camera.lookAt(planePosition, 0, planePosition);
        }
    }
    initFirstPersonCamera() {
        this.light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 2.5);
        this.light.position.set(0.5, 1, 0.75);
        this.scene.add(this.light);
        this.switchTypeofCamera();
        if (this.firstPersonView) {
            this.scene.add(this.controls.getObject());
            const onKeyDown = (event) => {
                switch (event.code) {
                    case 'ArrowUp':
                    case 'KeyW':
                        this.moveForward = true;
                        break;
                    case 'ArrowLeft':
                    case 'KeyA':
                        this.moveLeft = true;
                        break;
                    case 'ArrowDown':
                    case 'KeyS':
                        this.moveBackward = true;
                        break;
                    case 'ArrowRight':
                    case 'KeyD':
                        this.moveRight = true;
                        break;
                    case 'ShiftLeft':
                        this.run = true;
                        break;
                    case 'Space':
                        if (this.canJump === true)
                            this.velocity.y += 350;
                        this.canJump = false;
                        break;
                }
            };
            const onKeyUp = (event) => {
                switch (event.code) {
                    case 'ArrowUp':
                    case 'KeyW':
                        this.moveForward = false;
                        break;
                    case 'ArrowLeft':
                    case 'KeyA':
                        this.moveLeft = false;
                        break;
                    case 'ArrowDown':
                    case 'KeyS':
                        this.moveBackward = false;
                        break;
                    case 'ArrowRight':
                    case 'KeyD':
                        this.moveRight = false;
                        break;
                    case 'ShiftLeft':
                        this.run = false;
                        break;
                }
            };
            document.addEventListener('keydown', onKeyDown);
            document.addEventListener('keyup', onKeyUp);
        }
    }
    animateMovement() {
        const time = performance.now();
        if (this.firstPersonView) {
            this.gravity.ray.origin.copy(this.controls.getObject().position);
            this.gravity.ray.origin.y -= this.blocks / 2;
            const intersections = this.gravity.intersectObjects(this.objects, false);
            // const wall = 
            // console.log(intersections);
            const onObject = intersections.length > 0;
            const delta = (time - this.prevTime) / (1500 - (700 * Number(this.run)));
            this.velocity.x -= this.velocity.x * 10.0 * delta;
            this.velocity.z -= this.velocity.z * 10.0 * delta;
            this.velocity.y -= 9.8 * 500.0 * delta; // 100.0 = mass
            this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
            this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
            this.direction.normalize(); // this ensures consistent movements in all directions
            if (this.moveForward || this.moveBackward)
                this.velocity.z -= this.direction.z * 400.0 * delta;
            if (this.moveLeft || this.moveRight)
                this.velocity.x -= this.direction.x * 400.0 * delta;
            if (onObject === true) {
                this.velocity.y = Math.max(0, this.velocity.y);
                this.canJump = true;
            }
            this.controls.moveRight(-this.velocity.x * delta);
            this.controls.moveForward(-this.velocity.z * delta);
            this.controls.getObject().position.y += (this.velocity.y * delta); // new behavior
            if (this.controls.getObject().position.y < this.blocks / 2) {
                this.velocity.y = this.blocks / 2;
                this.controls.getObject().position.y = this.blocks / 2;
                this.canJump = true;
            }
            this.prevTime = time;
        }
    }
}
exports.FirstPersonCamera = FirstPersonCamera;