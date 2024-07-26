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

const MARGIN = { x: 10, y: 100 };
const SPACING = { x: 5, y: 5 };
const BOX = { width: 30, height: 40 };
const WEBGL_MARGIN = { x: 500, y: 500 };
const DEBUG = true;
// using for snapshot 
let canvas;
let environment;
let restart_button;
let draw_button;
let ff_button;
let save_frame;
let frames;
let slider;
let myfont;

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

function initializeVars() {
    frameCount = 0;
    frames = [];
    environment = {
        reset_flag: false,
        stop_flag: false,
        ff_flag: false,
        savedFrameCount: 0,
    }
    showVars(environment);
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
    initializeVars();
}

function showVars(env) {
    if (DEBUG) {
        textSize(20);
        fill(0);
        push();
        fill(255);
        strokeWeight(0);
        rect(0, MARGIN.y + 70, 200, 200);
        pop();
        let o = Object.entries(env);
        for (let e = 0; e < Object.keys(env).length; e++) {
            text(`${o[e][0]}: ${o[e][1]}`, 0, MARGIN.y + 90 + BOX.width * e);
        }
        text(`frameCount: ${frameCount}`, 0, MARGIN.y + 90 + BOX.width * Object.keys(env).length);
    }
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

function drawPlayer(x, y) {
    stroke(0);
    strokeWeight(1);
    ellipse(CELL_SIZE * (x + 0.5), CELL_SIZE * (y + 0.5), CELL_SIZE, CELL_SIZE);
}

function preload() {
    myfont = loadFont("https://fonts.gstatic.com/ea/notosansjapanese/v6/NotoSansJP-Bold.otf");
}

function setup() {
    createCanvas(CELL_SIZE * Maze.SIZE + 500, CELL_SIZE * Maze.SIZE + 600, WEBGL);
    textFont(myfont);
    canvas = createFramebuffer();
    // translate(BOX.width - (CELL_SIZE * Maze.SIZE + 200) / 1, BOX.height - (CELL_SIZE * Maze.SIZE + 500) / 1);
    initialize();
    background(255);


    restart_button = createButton("restart");
    restart_button.position(MARGIN.x + 0, 10);
    draw_button = createButton("stop");
    draw_button.position(MARGIN.x + 70, 10);
    ff_button = createButton("fast forward");
    ff_button.position(MARGIN.x + 120, 10);
    ff_button.elt.disabled = true;
    save_frame = createCheckbox("save frame");
    save_frame.position(MARGIN.x + 220, 10);
    slider = createSlider(0, 0);
    slider.position(MARGIN.x + 350, 10);
    slider.size(200);
    slider.elt.disabled = true;

    restart_button.mousePressed(() => {
        push();
        translate(BOX.width - (CELL_SIZE * Maze.SIZE + 200) / 1, BOX.height - (CELL_SIZE * Maze.SIZE + 500) / 1);
        if (environment.stop_flag) {
            draw_button.html("stop");
        }
        if (!slider.elt.disabled) {
            slider.elt.disabled = true;
        }
        draw_button.elt.disabled = false;
        // ff_button.elt.disabled = false;
        frameRate(0);
        background(255);
        initialize();
        drawFlag = false;
        showVars(environment);
        frameRate(1);
        pop();
    });

    draw_button.mousePressed(() => {
        environment.stop_flag = !environment.stop_flag;
        // stop: true, start: false
        if (environment.stop_flag) {
            frameRate(0);
            draw_button.html("start");
            // ff_button.elt.disabled = true;
            slider.elt.disabled = false;
            slider.attribute("max", frames.length - 1);
            slider.value(frameCount);
            if (save_frame.checked()) {
                /* サーバにframecountを渡す */
                socket.emit("saveFrameCount", frameCount);
                socket.emit("saveEnvironment", environment);
                // socket.emit("saveFrame", frames);
                let base64Array = imagesToBase64Array(frames);
                socket.emit("saveFrame", base64Array);
            }
        } else {
            frameRate(1);
            draw_button.html("stop");
            // ff_button.elt.disabled = false;
            slider.elt.disabled = true;
        }
    });

    ff_button.mousePressed(() => {
        environment.ff_flag = true;
        frameRate(5);
    });

    ff_button.mouseReleased(() => {
        environment.ff_flag = false;
        frameRate(1);
    });

    save_frame.mouseReleased(() => {
        /* サーバにsave_frameを渡す */
        /* checkedはクリックする前の値なので反転させる */
        socket.emit("saveFlag", !save_frame.checked());
    });

    slider.input(() => {
        if (environment.stop_flag) {
            push();
            translate(BOX.width - (CELL_SIZE * Maze.SIZE + 200) / 1, BOX.height - (CELL_SIZE * Maze.SIZE + 500) / 1);
            // drawFrame(slider.value());
            image(frames[slider.value()], 0, 0);
            pop();
        }
    })

    /* サーバからframecountを受け取る */
    socket.on("sendFrameCount", function (data) {
        if (!environment.stop_flag) {
            environment.savedFrameCount = data;
            frameRate(1);
        }
    });

    /* サーバからenvironmentを受け取る */
    socket.on("sendEnvironment", function (data) {
        if (!environment.stop_flag) {
            if (Object.keys(data).length !== 0) {
                environment = data;
            }
            frameRate(1);
        }
    });

    /* サーバからframeを受け取る */
    socket.on("sendFrame", function (data) {
        if (!environment.stop_flag) {
            frames = [];
            for (let i = 0; i < data.length; i++) {
                base64ToP5Image(data[i], (p5Image) => {
                    frames.push(p5Image);
                });
            }
            frameRate(1);
        }
    });

    /* サーバからsave_frameを受け取る */
    socket.on("sendFlag", function (data) {
        save_frame.checked(data);
    });
    console.log(socket);
    frameRate(0);
}

function draw() {
    push();
    translate(BOX.width - (CELL_SIZE * Maze.SIZE + 500) / 1, BOX.height - (CELL_SIZE * Maze.SIZE + 600) / 1);
    if (environment.stop_flag) {
        // stop
        // drawFrame(slider.value());
        if (slider.value() < frameCount && frames.length > 0) {
            drawFrame(slider.value());
            image(frames[slider.value()], 0, 0);
        }
    } else {
        // start
        if (frameCount <= frames.length) {
            frameRate(30);
            image(frames[frameCount - 1], 0, 0);
            if (frameCount === frames.length) {
                frameRate(0);
            }
        } else {
            canvas.begin();
            drawFrame();
            canvas.end();
            frames.push(canvas.get());
            image(canvas, 0, 0);
        }
    }
    // drawFrame();
    pop();
}

function drawFrame(count = frameCount) {
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
        drawPlayer(player.position.x, player.position.y);
        drawFlag = true;
    }
    frameRate(0);
    if (player.position.x == Maze.GOAL.x && player.position.y == Maze.GOAL.y) {
        if (get(BOX.width + 10, BOX.height + 50)[2] < 154) {
            frameRate(0);
        } else {
            frameRate(30);
        }
        fill(255, 255, 128, 5);
        rect(0, 40, CELL_SIZE * Maze.SIZE, 70)
        fill(255, 0, 0);
        textSize(40);
        text("CLEAR", 10, 90);
        // console.log(get(BOX.width + 10, BOX.height + 50));
    }
    showVars(environment);
}

function mouseMoved(event) {
    // console.log(event);
    if (DEBUG) {
        noStroke();
        fill("#ffffff");
        rect(50, 120, 135, 45);
        fill("#000000");
        text(`(${mouseX}, ${mouseY})`, 50, 150);
        strokeWeight(1);
    }
    // console.log(get(mouseX, mouseY));
}

function imageToBase64(p5Image) {
    // Create an offscreen canvas
    let offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = p5Image.width;
    offscreenCanvas.height = p5Image.height;
    let context = offscreenCanvas.getContext('2d');

    // Draw the p5.Image onto the offscreen canvas
    context.drawImage(p5Image.canvas, 0, 0, p5Image.width, p5Image.height);

    // Get the data URL of the offscreen canvas
    let dataURL = offscreenCanvas.toDataURL('image/png'); // You can change 'image/png' to 'image/jpeg' if you prefer JPEG

    return dataURL;
}

function imagesToBase64Array(p5Images) {
    return p5Images.map(image => imageToBase64(image));
}
function base64ToP5Image(base64, callback) {
    let img = loadImage(base64);
    callback(img);
}

function keyPressed(event) {
    console.log(event)
    if (key == 't') {
        startToGoalTest();
        redraw();
    } else if (key == 'r') {
        initialize();
        background(255);
        drawFlag = false;
        redraw();
    } else if (key == 'd') {
        drawPathFlag = !drawPathFlag;
        drawFlag = false;
        redraw();
    } else if (key == "ArrowUp") {
        player.move(MVector.UP);
        drawFlag = false;
        redraw();
    } else if (key == "ArrowRight") {
        player.move(MVector.RIGHT);
        drawFlag = false;
        redraw();
    } else if (key == "ArrowDown") {
        player.move(MVector.DOWN);
        drawFlag = false;
        redraw();
    } else if (key == "ArrowLeft") {
        player.move(MVector.LEFT);
        drawFlag = false;
        redraw();
    }
}

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
async function keyInputTest(key) {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: key }));
    window.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
    await sleep(100);
}

async function startToGoalTest() {
    await keyInputTest("r");
    await keyInputTest("ArrowRight");
    await keyInputTest("ArrowDown");
    await keyInputTest("ArrowRight");
    await keyInputTest("ArrowRight");
    await keyInputTest("ArrowDown");
    await keyInputTest("ArrowDown");
}