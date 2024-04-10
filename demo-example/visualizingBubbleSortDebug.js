const MARGIN = { x: 10, y: 40 };
const SPACING = { x: 5, y: 5 };
const BOX = { width: 30, height: 40 };
const DEBUG = true;

let state, array, i, j, sorted;
let environment;

let restart_button;
let draw_button;
let ff_button;

function initializeVars() {
    frameCount = 0;
    environment = {
        state: 0,
        array: [6, 5, 4, 3, 2, 1],
        i: 0,
        j: undefined,
        sorted: false,
        reset_flag: false,
        draw_flag: false,
        ff_flag: false,
    }
    environment.j = environment.array.length - 1;
    showVars(environment);
}

function showVars(env) {
    if (DEBUG) {
        textSize(20);
        let o = Object.entries(env);
        for (let e = 0; e < Object.keys(env).length; e++) {
            text(`${o[e][0]}: ${o[e][1]}`, MARGIN.x, MARGIN.y + 90 + BOX.width * e);

        }
        text(`frameCount: ${frameCount}`, MARGIN.x, MARGIN.y + 90 + BOX.width * Object.keys(env).length);
    }
}

function setup() {
    createCanvas(1000, 1000);
    background(255);
    frameRate(1);
    initializeVars();
    showVars(environment);

    // bubbleSortAnimation(environment.array, environment.i, environment.j);
    // showVars(environment);

    restart_button = createButton("restart");
    restart_button.position(MARGIN.x + 0, 10);
    draw_button = createButton("stop");
    draw_button.position(MARGIN.x + 70, 10);
    ff_button = createButton("fast forward");
    ff_button.position(MARGIN.x + 120, 10);

    restart_button.mousePressed(() => {
        if (environment.draw_flag) {
            draw_button.html("stop");
        }
        draw_button.elt.disabled = false;
        ff_button.elt.disabled = false;
        frameRate(0);
        background(255);
        initializeVars();
        showVars(environment);
        frameRate(1);
    });

    draw_button.mousePressed(() => {
        environment.draw_flag = !environment.draw_flag;
        if (environment.draw_flag) {
            frameRate(0);
            draw_button.html("start");
            ff_button.elt.disabled = true;
        } else {
            frameRate(1);
            draw_button.html("stop");
            ff_button.elt.disabled = false;
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
}

function draw() {
    bubbleSortAnimation(environment.array, environment.i, environment.j);
    if (environment.state == 0) {

    } else if (environment.state == 1) {

    } else if (environment.state == 2) {
        environment.j--;
    } else if (environment.state == 3) {

    } else if (environment.state == 4) {
        environment.i++;
        environment.j = environment.array.length - 1;
    } else if (environment.state == 5) {
        draw_button.elt.disabled = true;
        ff_button.elt.disabled = true;
        frameRate(0);
    }
    showVars(environment);
}

function bubbleSort(array) {
    for (let i = 0; i < array.length - 1; i++) {
        // environment.state = 1
        for (let j = array.length - 1; j > i; j--) {
            // environment.state = 2
            if (array[j - 1] > array[j]) {
                // environment.state = 3
                let t = array[j - 1];
                array[j - 1] = array[j];
                array[j] = t;
            }
        }
        // environment.state = 4
    }
    // environment.state = 5;
}

function bubbleSortAnimation(array, i, j) {
    background(255);
    if (environment.state == 0) {
        // display all array elements
        displayNumbers(0, array.length, "#ffffff");
        environment.state = 1;
    } else {
        if (environment.state == 4) {
            if (i == j) {
                environment.state = 5;
                environment.sorted = true;
            } else {
                environment.state = 2;
            }
        }
        if (environment.state == 1 || environment.state == 2 || environment.state == 3) {
            // sorted elements are displayed as blue boxes
            if (environment.state == 3) {
                let t = array[j - 1];
                array[j - 1] = array[j];
                array[j] = t;
            }
            displayNumbers(0, i, "#00ffff");
            displayNumbers(i, array.length, "#ffffff");
            environment.state = 2;
            displayNumbers(j - 1, j + 1, "#ffff00");
            if (array[j - 1] > array[j]) {
                environment.state = 3
            } else if (i == j - 1) {
                environment.state = 4;
            }
        }
        if (environment.state == 5) {
            displayNumbers(0, array.length, "#00ffff");
        }
    }
}

function displayNumbers(start, end, color) {
    for (x = start; x < end; x++) {
        fill(color);
        rect(MARGIN.x + x * (BOX.width + SPACING.x), MARGIN.y, BOX.width, BOX.height);
        fill(0);
        textSize(20);
        text(environment.array[x], MARGIN.x + 8 + x * (BOX.width + SPACING.x), MARGIN.y + 27);
    }
}