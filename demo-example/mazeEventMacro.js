class MVector {
    // Vector
    static get UP() { return new MVector([0, -2]); }
    static get RIGHT() { return new MVector([2, 0]); }
    static get DOWN() { return new MVector([0, 2]); }
    static get LEFT() { return new MVector([-2, 0]); }
    static get DIRECTION() { return [MVector.UP, MVector.RIGHT, MVector.DOWN, MVector.LEFT]; }

    x; y;

    constructor(args) {
        if (args.length == 2) {
            // [x, y]
            this.x = args[0];
            this.y = args[1];
        } else if (args.length == 1) {
            // [MVector]
            this.x = args[0].x;
            this.y = args[0].y;
        }
    }

    static array2MVectorArray(array) {
        let result = [];
        for (let i = 0; i < array.length; i++) {
            result.push(new MVector([array[i].x, array[i].y]));
        }
        return result;
    }
}

// Search State
class MState {
    position; // MVector
    previousState; // MState
    previousMove; // MVector

    constructor(args) {
        if (args.length == 1) {
            // [MVector]
            this.position = args[0];
            this.previousState = null;
            this.previousMove = null;
        } else if (args.length == 2) {
            if (args[0] instanceof Number && args[1] instanceof Number) {
                // [x, y]
                let t = new MVector([args[0], args[1]]);
                this.position = t;
                this.previousState = null;
                this.previousMove = null;
            }
            else if (args[0] instanceof MState && args[1] instanceof MVector) {
                // [MState, MVector]
                let t = new MVector([args[0].position.x + args[1].x, args[0].position.y + args[1].y]);
                this.position = t;
                this.previousState = args[0];
                this.previousMove = args[1];
            }
        }
    }
    checkSuccess(success) {
        return this.position.x == success.x && this.position.y == success.y;
    }
}

class Maze {
    static get SIZE() { return 15; }
    static get START() { return new MVector([1, 1]); }
    static get GOAL() { return new MVector([(Maze.SIZE - 1) / 2, (Maze.SIZE - 1) / 2]); }

    cells; // 2D array

    constructor() {
        this.cells = [];
        for (let x = 0; x < Maze.SIZE; x++) {
            this.cells.push([]);
            for (let y = 0; y < Maze.SIZE; y++) {
                this.cells[x].push(false);
                this.cells[x][y] = x == 0 || x == Maze.SIZE - 1 || y == 0 ||
                    y == Maze.SIZE - 1 || !(x % 2 == 1 && y % 2 == 1);
            }
        }
    }
}

class MazeGenerator {
    static randomSequence = [0, 0, 0, 0];

    maze; // Maze
    stateVisitedFlags; // 2D array
    solution; // Array<MVector>
    // random; // Random

    constructor(maze) {
        this.maze = maze;
        this.stateVisitedFlags = [];
        for (let x = 0; x < Maze.SIZE; x++) {
            this.stateVisitedFlags.push([]);
            for (let y = 0; y < Maze.SIZE; y++) {
                this.stateVisitedFlags[x].push(false);
                this.stateVisitedFlags[x][y] = false;
            }
        }
        this.solution = [];
        // this.random = Math.random();
    }
    getSolution() {
        return this.solution;
    }

    record(state) {
        for (let s = state; s != null; s = s.previousState) {
            if (s.previousMove != null) {
                this.solution.push(s.previousMove);
            }
        }
    }

    getRandomSequence() {
        for (let i = 0; i < 4; i++) {
            MazeGenerator.randomSequence[i] = i;
        }
        for (let i = 0; i < 4; i++) {
            let r = Math.floor(Math.random() * 4);
            if (r != i) {
                let tmp = MazeGenerator.randomSequence[r];
                MazeGenerator.randomSequence[r] = MazeGenerator.randomSequence[i];
                MazeGenerator.randomSequence[i] = tmp;
            }
        }
        return MazeGenerator.randomSequence;
    }

    generate() {
        let stack = [];
        stack.push(new MState([Maze.GOAL]));
        while (stack.length != 0) {
            let state = stack.pop();
            // GOAL to START
            if (state == null) {
                break;
            }
            let rseq = this.getRandomSequence();
            for (let i = 0; i <= rseq.length; i++) {
                if (i == rseq.length) {
                    // No path to go
                    stack.push(state.previousState);
                    break;
                }
                this.stateVisitedFlags[state.position.x][state.position.y] = true;
                let n_state = new MState([state, MVector.DIRECTION[rseq[i]]]);
                // Erasable walls are 1 to 49 (MAZE.SIZE - 1)
                if (0 < n_state.position.x && n_state.position.x < Maze.SIZE &&
                    0 < n_state.position.y && n_state.position.y < Maze.SIZE) {
                    stack.push(n_state);
                    // Is unvisited
                    if (!this.stateVisitedFlags[n_state.position.x][n_state.position.y]) {
                        // Because it moves 2 cells, the wall between the cells is erased
                        this.maze.cells[(state.position.x + n_state.position.x) / 2][(state.position.y + n_state.position.y) / 2] = false;
                        stack.push(n_state);
                        if (n_state.checkSuccess(Maze.START)) {
                            this.record(n_state);
                        }
                        break;
                    }
                }
            }
        }
    }
}

class MazeSolver {
    maze; // Maze
    stateVisitedFlags; // 2D array
    solution; // Array<MVector>

    constructor(maze) {
        this.maze = maze;
        this.stateVisitedFlags = [];
        for (let x = 0; x < Maze.SIZE; x++) {
            this.stateVisitedFlags.push([]);
            for (let y = 0; y < Maze.SIZE; y++) {
                this.stateVisitedFlags[x].push(false);
            }
        }
        this.solution = [];
    }

    getSolution() {
        return this.solution;
    }

    record(state) {
        for (let s = state; s != null; s = s.previousState) {
            if (s.previousMove != null) {
                this.solution.push(s.previousMove);
            }
        }
    }

    // Find the shortest path
    solve() {
        let queue = [];
        queue.push(new MState([Maze.START]));
        while (queue.length != 0) {
            let state = queue.shift();
            // START to GOAL
            if (!this.stateVisitedFlags[state.position.x][state.position.y]) {
                this.stateVisitedFlags[state.position.x][state.position.y] = true;
                for (let i = 0; i < MVector.DIRECTION.length; i++) {
                    let n_state = new MState([state, MVector.DIRECTION[i]]);
                    // Search within 1 to 49 (MAZE.SIZE - 1)
                    if (0 < n_state.position.x && n_state.position.x < Maze.SIZE &&
                        0 < n_state.position.y && n_state.position.y < Maze.SIZE) {
                        if (!this.stateVisitedFlags[n_state.position.x][n_state.position.y]) {
                            // Whether there are any path
                            if (!this.maze.cells[(state.position.x + n_state.position.x) / 2][(state.position.y + n_state.position.y) / 2]) {
                                queue.push(n_state);
                                if (n_state.checkSuccess(Maze.GOAL)) {
                                    this.record(n_state);
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
}

class Player {
    position; // MVector

    constructor() {
        this.position = Maze.START;
    }

    move(direction) {
        let n_position = new MVector([this.position.x + direction.x, this.position.y + direction.y]);
        if (0 < n_position.x && n_position.x < Maze.SIZE &&
            0 < n_position.y && n_position.y < Maze.SIZE) {
            if (!maze.cells[(this.position.x + n_position.x) / 2][(this.position.y + n_position.y) / 2]) {
                this.position = n_position;
            }
        }
    }

}

const CELL_SIZE = 10;

let maze;
let removedWalls;
let originalPath;
let solutionPath;
let drawFlag = false;
let drawPathFlag = false;

let player;

function removeWallsAtRandom() {
    removedWalls = [];
    // let random = Math.random();
    for (let y = 0; y < Maze.SIZE - 1; y++) {
        for (let x = 0; x < Maze.SIZE - 1; x++) {
            if (((x % 2 == 0 && y % 2 == 1) || (x % 2 == 1 && y % 2 == 0)) && maze.cells[x][y] && Math.floor(Math.random() * 100) == 0) {
                removedWalls.push(new MVector([x, y]));
                maze.cells[x][y] = false;
            }
        }
    }
}

function initialize() {
    maze = new Maze();

    // イベントマクロのための迷路データ
    maze.cells = [
        [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
        [true, false, false, false, true, false, false, false, false, false, true, false, false, false, true],
        [true, false, true, true, true, false, true, true, true, false, true, false, true, false, true],
        [true, false, false, false, true, false, false, false, true, false, false, false, true, false, true],
        [true, false, true, false, true, true, true, false, true, true, true, true, true, false, true],
        [true, false, true, false, false, false, false, false, true, false, false, false, false, false, true],
        [true, false, true, false, true, true, true, true, true, false, true, true, true, true, true],
        [true, false, true, false, false, false, false, false, true, false, false, false, false, false, true],
        [true, false, true, false, true, true, true, true, true, false, true, true, true, false, true],
        [true, false, true, false, true, false, false, false, false, false, false, false, true, false, true],
        [true, true, true, false, true, false, true, true, true, true, true, true, true, false, true],
        [true, false, false, false, true, false, true, false, false, false, false, false, true, false, true],
        [true, false, true, true, true, true, true, false, true, true, true, false, true, false, true],
        [true, false, false, false, false, false, false, false, true, false, false, false, false, false, true],
        [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
    ]
    // let g = new MazeGenerator(maze);
    // g.generate();
    // originalPath = g.getSolution();
    originalPath = [
        { "x": -2, "y": 0 },
        { "x": 0, "y": -2 },
        { "x": -2, "y": 0 },
        { "x": 0, "y": -2 },
        { "x": 0, "y": -2 },
        { "x": 2, "y": 0 },
        { "x": 0, "y": 2 },
        { "x": 2, "y": 0 },
        { "x": 0, "y": -2 },
        { "x": 0, "y": -2 },
        { "x": -2, "y": 0 },
        { "x": 0, "y": -2 },
        { "x": 2, "y": 0 },
        { "x": 0, "y": -2 },
        { "x": -2, "y": 0 },
        { "x": -2, "y": 0 },
        { "x": 0, "y": 2 },
        { "x": 0, "y": 2 },
        { "x": -2, "y": 0 },
        { "x": 0, "y": -2 },
        { "x": 0, "y": -2 },
        { "x": -2, "y": 0 },
        { "x": -2, "y": 0 },
        { "x": -2, "y": 0 },
        { "x": 0, "y": 2 },
        { "x": 2, "y": 0 },
        { "x": 0, "y": 2 },
        { "x": 0, "y": 2 },
        { "x": -2, "y": 0 },
        { "x": 0, "y": 2 },
        { "x": 0, "y": 2 },
        { "x": 0, "y": 2 },
        { "x": 2, "y": 0 },
        { "x": 0, "y": -2 },
        { "x": 2, "y": 0 },
        { "x": 2, "y": 0 },
        { "x": 0, "y": -2 },
        { "x": 0, "y": -2 }
    ]

    originalPath = MVector.array2MVectorArray(originalPath);
    // removeWallsAtRandom();
    removedWalls = [
        { "x": 6, "y": 3 },
    ]
    removedWalls = MVector.array2MVectorArray(removedWalls);
    solutionPath = null;
    let s = new MazeSolver(maze);
    if (s.solve()) {
        solutionPath = s.getSolution();
    }
    player = new Player();
}

function drawPath(path, initialPosition,) {
    beginShape();
    s = new MState([initialPosition]);
    vertex(CELL_SIZE * (s.position.x + 0.5), CELL_SIZE * (s.position.y + 0.5));
    for (let i = path.length - 1; i >= 0; i--) {
        s = new MState([s, path[i]]);
        vertex(CELL_SIZE * (s.position.x + 0.5), CELL_SIZE * (s.position.y + 0.5));
    }
    endShape();
}

function drawCell(x, y) {
    rect(CELL_SIZE * x, CELL_SIZE * y, CELL_SIZE, CELL_SIZE);
}

function setup() {
    createCanvas(CELL_SIZE * Maze.SIZE, CELL_SIZE * Maze.SIZE);
    initialize();
}

function draw() {
    if (!drawFlag) {
        background(255);
        // drawing walls
        noStroke();
        fill(0);
        for (let y = 0; y < Maze.SIZE; y++) {
            for (let x = 0; x < Maze.SIZE; x++) {
                if (maze.cells[x][y]) {
                    drawCell(x, y);
                }
            }
        }
        // drawing removed walls
        fill(192);
        for (let w = 0; w < removedWalls.length; w++) {
            drawCell(removedWalls[w].x, removedWalls[w].y);
        }
        if (drawPathFlag) {
            // drawing paths at the maze generated point
            stroke(0, 0, 255);
            strokeWeight(0.5 * CELL_SIZE);
            noFill();
            drawPath(originalPath, Maze.GOAL);
            if (solutionPath != null) {
                // drawing the shortest path
                stroke(255, 0, 0);
                strokeWeight(0.3 * CELL_SIZE);
                noFill();
                drawPath(solutionPath, Maze.START);
            }
        }
        // drawing start and goal
        noStroke();
        fill(0, 255, 255);
        drawCell(Maze.START.x, Maze.START.y);
        fill(0, 255, 0);
        drawCell(Maze.GOAL.x, Maze.GOAL.y);

        // drawing player
        fill(255, 255, 0);
        drawCell(player.position.x, player.position.y);
        drawFlag = true;
    }
}

function keyPressed() {
    if (key == 's') {

    } else if (key == 'r') {
        initialize();
        drawFlag = false;
    } else if (key == 'd') {
        drawPathFlag = !drawPathFlag;
        drawFlag = false;
    } else if (key == "ArrowUp") {
        player.move(MVector.UP);
        drawFlag = false;
    } else if (key == "ArrowRight") {
        player.move(MVector.RIGHT);
        drawFlag = false;
    } else if (key == "ArrowDown") {
        player.move(MVector.DOWN);
        drawFlag = false;
    } else if (key == "ArrowLeft") {
        player.move(MVector.LEFT);
        drawFlag = false;
    }
}