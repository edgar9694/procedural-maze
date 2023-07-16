import * as THREE from 'three';
const initialBlockvalue = {
    position: { x: 0, y: 0, z: 0 },
    adjacentBlocks: {
        pastBlock: undefined,
        nextBlock: undefined
    },
    direction: '',
    mesh: [],
    name: 'path-'
};
export class MazeGenerator {
    constructor(blocks, sizeLab) {
        this.arrayMaze = [];
        this.setDirectionCube = {
            straightVertical: [true, true, false, true, false, false],
            straightHorizontal: [false, false, false, true, true, true],
            downRight: [true, false, false, true, true, false],
            upRight: [true, false, false, true, false, true],
            downLeft: [false, true, false, true, true, false],
            upLeft: [false, true, false, true, false, true],
            deadEnd: [true, true, false, true, true, false],
            //just for the external wall
            right: [false, true, false, true, false, false],
            left: [true, false, false, true, false, false],
            up: [false, false, false, true, true, false],
            down: [false, false, false, true, false, true]
        };
        // const matPathBox = [
        //     new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide}), //left side
        //     new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide}), // right side
        //     new THREE.MeshBasicMaterial({transparent: true, opacity: 0}), //up side
        //     new THREE.MeshBasicMaterial({color: 0xffffff, side: THREE.DoubleSide}), //down side
        //     new THREE.MeshBasicMaterial({transparent: true, opacity: 0}), //front side
        //     new THREE.MeshBasicMaterial({transparent: true, opacity: 0}), // back side
        // ];
        this.setPath = {
            left: [0],
            right: [1],
            up: [4],
            down: [5],
            straightVertical: [4, 5],
            straightHorizontal: [0, 1]
        };
        this.floorMesh = new THREE.MeshBasicMaterial({ color: 0x008000, side: THREE.DoubleSide });
        this.wallMesh = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
        this.transparentWallMesh = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
        // public wallGroupMesh = new THREE.Group(); 
        this.wallGroupMesh = [];
        this.pathGroup = [];
        this.blocks = blocks;
        if (!sizeLab) {
            this.sizeLab = blocks;
        }
        else {
            this.sizeLab = sizeLab;
        }
        this.fixCoord = blocks / 2;
        this.planePosition = (blocks * this.sizeLab) / 2;
        this.sizeGrid = blocks * this.sizeLab;
        this.geoPathBox = new THREE.BoxGeometry(this.sizeLab, this.sizeLab, this.sizeLab);
    }
    /**
     *
     * @param color
     * @returns
     */
    createMesh(color) {
        return new THREE.MeshBasicMaterial({ color: color });
    }
    /**
     * generates a random number
     * @param max the number limit
     * @param min usually 0 if the value is undefined
     * @returns a number between max and min
     */
    getRandomArbitrary(max, min) {
        if (!min) {
            min = 0;
        }
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    /**
     * Return coordinates of the attached blocks that satisfies the condition to insert the box in the array
     * @param block ThreeJS Object to extract the position
     * @param condition to know if the block will be inserted external or internal
     * @returns an array of coordinates
     */
    retrieveCoord(block) {
        let b;
        b = [
            [(block === null || block === void 0 ? void 0 : block.position.x) + this.sizeLab, block === null || block === void 0 ? void 0 : block.position.z],
            [(block === null || block === void 0 ? void 0 : block.position.x) - this.sizeLab, block === null || block === void 0 ? void 0 : block.position.z],
            [block === null || block === void 0 ? void 0 : block.position.x, (block === null || block === void 0 ? void 0 : block.position.z) + this.sizeLab],
            [block === null || block === void 0 ? void 0 : block.position.x, (block === null || block === void 0 ? void 0 : block.position.z) - this.sizeLab]
        ];
        b = b.filter(b => (b[0] <= (this.sizeGrid - this.fixCoord) && b[0] >= this.fixCoord) &&
            (b[1] <= (this.sizeGrid - this.fixCoord) && b[1] >= this.fixCoord));
        let newB = [];
        b.forEach(b => {
            let b2 = this.pathGroup.find(bl => bl.position.x === b[0] && bl.position.z === b[1] /*&& block.name == bl.name*/);
            if (!b2) {
                newB.push(b);
            }
        });
        return newB;
    }
    generateMaze() {
        for (let numberBlocks = 0; numberBlocks < this.sizeGrid; numberBlocks++) {
            let lengthPath = this.pathGroup.length;
            if (lengthPath > 0) {
                let foundBlock = false;
                let index = lengthPath - 1;
                while (!foundBlock) {
                    const block = this.pathGroup[index];
                    let posibleBlocks = this.retrieveCoord(block);
                    let point = this.getRandomArbitrary(posibleBlocks.length - 1);
                    if (posibleBlocks.length > 0) {
                        // console.log(block.name, block.position);
                        let position = {
                            x: posibleBlocks[point][0],
                            y: this.fixCoord,
                            z: posibleBlocks[point][1]
                        };
                        this.insertPoint(position, block, lengthPath);
                        foundBlock = true;
                    }
                    else {
                        index--;
                        if (index < 0) {
                            break;
                        }
                    }
                }
            }
            else {
                this.insertInitialPoint();
            }
        }
        this.pathGroup.forEach(b => {
            if (b.name.includes('straightHorizontal/') || b.name.includes('straightVertical/') || b.name.split('/').length >= 3) {
                // console.log(b);
            }
            this.generateWallBlock(b);
        });
    }
    // set the first point manually
    insertInitialPoint() {
        // initial point
        let block = initialBlockvalue;
        let posiblePoints = [
            [0, this.getRandomArbitrary(this.blocks) * this.sizeLab],
            [this.getRandomArbitrary(this.blocks) * this.sizeLab, 0],
            [this.blocks * this.sizeLab, this.getRandomArbitrary(this.blocks) * this.sizeLab],
            [this.getRandomArbitrary(this.blocks) * this.sizeLab, this.blocks * this.sizeLab]
        ];
        posiblePoints.forEach(p => {
            p[0] = p[0] === this.sizeGrid ? p[0] - this.fixCoord : p[0] + this.fixCoord;
            p[1] = p[1] === this.sizeGrid ? p[1] - this.fixCoord : p[1] + this.fixCoord;
        });
        posiblePoints = posiblePoints.filter(b => b[1] !== b[0] && (b[1] + b[0] !== this.sizeGrid));
        let point = this.getRandomArbitrary(posiblePoints.length - 1);
        block.position = {
            x: posiblePoints[point][0],
            y: this.fixCoord,
            z: posiblePoints[point][1]
        };
        let enterSide = '';
        if (block.position.x === this.fixCoord || block.position.x === (this.sizeGrid - this.fixCoord)) {
            if (block.position.x === this.fixCoord) {
                enterSide = 'right';
            }
            else {
                enterSide = 'left';
            }
        }
        else {
            if (block.position.z === this.fixCoord) {
                enterSide = 'down';
            }
            else {
                enterSide = 'up';
            }
        }
        block.name = 'path-' + enterSide + '-' + 0;
        let box = [true, true, false, true, true, true];
        let changeVar = this.setPath[enterSide];
        changeVar.forEach(c => {
            box[c] = false;
        });
        block.mesh = box;
        block.direction = enterSide;
        this.setReferencePoint(block);
        this.pathGroup.push(block);
    }
    insertPoint(position, pastBlock, length) {
        let block = {
            position: { x: 0, y: 0, z: 0 },
            adjacentBlocks: {
                pastBlock: undefined,
                nextBlock: undefined
            },
            direction: '',
            mesh: [],
            name: 'path-'
        };
        let indexPastBlock = this.pathGroup.findIndex(b => b == pastBlock);
        block.adjacentBlocks.pastBlock = indexPastBlock;
        block.position = position;
        block.mesh = [false, false, false, true, false, false];
        block.name = 'path-' + '-' + length;
        let index = this.pathGroup.length;
        let enterPastSide = '';
        let exitPastSide = '';
        let coordPRev = {
            x: pastBlock.position.x - block.position.x,
            z: pastBlock.position.z - block.position.z
        };
        //set Enter side
        //                  z
        //                  |
        //                  |p
        //                  |b
        //                  |    bp
        // // x ------------0----------- -x
        //                  |
        //                  |
        //                  |
        //                  |
        //                  -z
        if (coordPRev.x === 0) {
            if (coordPRev.z > 0) {
                enterPastSide = 'down';
                exitPastSide = 'up';
            }
            else {
                enterPastSide = 'up';
                exitPastSide = 'down';
            }
        }
        else {
            if (coordPRev.x > 0) {
                enterPastSide = 'right';
                exitPastSide = 'left';
            }
            else {
                enterPastSide = 'left';
                exitPastSide = 'right';
            }
        }
        let name = this.fixName(pastBlock.name, enterPastSide);
        pastBlock.name = name.join('-');
        pastBlock.direction = name[1];
        let pastBox = [true, true, false, true, true, true];
        let pastChangeVar;
        if (pastBlock.direction == 'straightVertical' || pastBlock.direction == 'straightHorizontal') {
            pastChangeVar = this.setPath[pastBlock.direction];
            pastChangeVar.forEach(c => {
                pastBox[c] = false;
            });
        }
        else {
            let directions = pastBlock.direction.split('/');
            pastChangeVar = this.setPath[directions[0]].concat(this.setPath[directions[1]]);
            pastChangeVar.forEach(c => {
                pastBox[c] = false;
            });
        }
        pastBlock.mesh = pastBox;
        pastBlock.adjacentBlocks.nextBlock = length;
        block.adjacentBlocks.pastBlock = indexPastBlock;
        block.name = 'path-' + exitPastSide + '-' + index;
        this.pathGroup[indexPastBlock] = pastBlock;
        this.pathGroup.push(block);
    }
    fixName(pastName, newString) {
        let splitName = pastName.split('-');
        if (splitName[1] == 'up' || splitName[1] == 'down') {
            if (newString == 'up' || newString == 'down') {
                splitName[1] = 'straightVertical';
            }
            else {
                let str = newString.charAt(0).toUpperCase() + newString.slice(1);
                // splitName[1] = String(splitName[1] +'+'+ str)
                splitName[1] = String(splitName[1] + '/' + newString);
            }
        }
        else {
            if (newString == 'left' || newString == 'right') {
                splitName[1] = 'straightHorizontal';
            }
            else {
                let str = splitName[1].charAt(0).toUpperCase() + splitName[1].slice(1);
                // splitName[1] = String(newString +'+'+ str);
                splitName[1] = String(splitName[1] + '/' + newString);
            }
        }
        return splitName;
    }
    generateWallBlock(block) {
        let matArray = [];
        for (let index = 0; index < (block === null || block === void 0 ? void 0 : block.mesh.length); index++) {
            let element = block === null || block === void 0 ? void 0 : block.mesh[index];
            let side;
            if (index == 3) {
                side = this.floorMesh;
            }
            else {
                side = element ? this.wallMesh : this.transparentWallMesh;
            }
            matArray.push(side);
        }
        // debugger
        let newMesh = new THREE.Mesh(this.geoPathBox, matArray);
        newMesh.position.set(block.position.x, this.fixCoord, block.position.z);
        newMesh.name = block.name;
        this.wallGroupMesh.push(newMesh);
    }
    setReferencePoint(initialPoint) {
        const geo = new THREE.ConeGeometry(5, 20, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        this.referenceCone = new THREE.Mesh(geo, material);
        this.referenceCone.position.set(initialPoint.position.x, initialPoint.position.y + 30, initialPoint.position.z);
        this.referenceCone.rotateX(Math.PI);
    }
}
