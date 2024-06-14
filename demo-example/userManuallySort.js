const MARGIN = { x: 10, y: 40 };
const SPACING = { x: 5, y: 5 };
const BOX = { width: 30, height: 40 };
const WEBGL_MARGIN = { x: 500, y: 500 };
const DEBUG = true;

const COLOR1 = "#ffffff";
const COLOR2 = "#ffff00";
const COLOR3 = "#00ffff";

let canvas;
let state, sorted;
let environment;
let myfont;

let restart_button;
let draw_button;
let ff_button;
let save_frame;
let frames;
let slider;

function initializeVars() {
    frameCount = 0;
    frames = [];
    environment = {
        state: 0,
        array: [6, 5, 4, 3, 2, 1],
        sorted_array: undefined,
        i: -1,
        j: -1,
        sorted: false,
        reset_flag: false,
        draw_flag: false,
        ff_flag: false,
        savedFrameCount: 0,
    }
    environment.sorted_array = JSON.parse(JSON.stringify(environment.array));
    environment.sorted_array.sort((a, b) => { return a - b });
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

function preload() {
    myfont = loadFont("https://fonts.gstatic.com/ea/notosansjapanese/v6/NotoSansJP-Bold.otf");
}

function setup() {
    createCanvas(1000, 1000, WEBGL);
    textFont(myfont);
    canvas = createFramebuffer();
    translate(-1000, -1000);
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
    ff_button.elt.disabled = true;
    save_frame = createCheckbox("save frame");
    save_frame.position(MARGIN.x + 220, 10);
    slider = createSlider(0, 0);
    slider.position(MARGIN.x + 350, 10);
    slider.size(200);
    slider.elt.disabled = true;

    restart_button.mousePressed(() => {
        push();
        translate(-1000, -1000);
        if (environment.draw_flag) {
            draw_button.html("stop");
        }
        if (!slider.elt.disabled) {
            slider.elt.disabled = true;
        }
        draw_button.elt.disabled = false;
        // ff_button.elt.disabled = false;
        frameRate(0);
        background(255);
        initializeVars();
        showVars(environment);
        frameRate(1);
        pop();
    });

    draw_button.mousePressed(() => {
        environment.draw_flag = !environment.draw_flag;
        if (environment.draw_flag) {
            frameRate(0);
            draw_button.html("start");
            // ff_button.elt.disabled = true;
            slider.elt.disabled = false;
            slider.attribute("max", frames.length - 1);
            slider.value(frameCount);
            if (save_frame.checked()) {
                /* サーバにframecountを渡す */
                socket.emit("saveFrameCount", frameCount);
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
        socket.emit("saveFrame", !save_frame.checked());
    });

    slider.input(() => {
        if (environment.draw_flag) {
            push();
            translate(-1000, -1000);
            // drawFrame(slider.value());
            image(frames[slider.value()], 0, 0);
            pop();
        }
    })

    /* サーバからframecountを受け取る */
    socket.on("sendFrameCount", function (data) {
        environment.savedFrameCount = data;
        frameRate(1);
    });
    console.log(socket);

    /* サーバからsave_frameを受け取る */
    socket.on("sendSaveFrame", function (data) {
        save_frame.checked(data);
    });
    console.log(socket);
    frameRate(0);
}

function drawFrame(count = frameCount) {

    // bubbleSortAnimation(environment.array, environment.i, environment.j);
    userManuallySort(environment.array);
    // frameRate(0);
    switch (environment.state) {
        case 5:
            draw_button.elt.disabled = true;
            ff_button.elt.disabled = true;
            frameRate(0);
            break;
        default:
            break;
    }
    if (environment.state == 0) {

    } else if (environment.state == 1) {

    } else if (environment.state == 2) {

    } else if (environment.state == 3) {

    } else if (environment.state == 4) {

    } else if (environment.state == 5) {
        draw_button.elt.disabled = true;
        ff_button.elt.disabled = true;
        frameRate(0);
    }
    showVars(environment);
}

function draw() {
    push();
    translate(-1000, -1000);
    if (environment.draw_flag) {
        // stop
        // drawFrame(slider.value());
        if (slider.value() < frameCount) {
            drawFrame(slider.value());
            image(frames[slider.value()], 0, 0);
        }
    } else {
        // start
        canvas.begin();
        drawFrame();
        canvas.end();
        frames.push(canvas.get());
        image(canvas, 0, 0);
    }
    pop();
}

function userManuallySort(array) {
    // environment.state = 0
    background(255);
    if (environment.state == 0 || environment.state == 1) {
        environment.state = 1;
        displayNumbers(0, array.length, COLOR1);
        frameRate(0);
    } else if (environment.state == 2) {
        displayNumbers(0, environment.i, COLOR1);
        displayNumbers(environment.i, environment.i + 1, COLOR2);
        displayNumbers(environment.i + 1, array.length, COLOR1);
        frameRate(0);
    } else if (environment.state == 3) {
        environment.state = 4;
        displayNumbers(0, environment.i, COLOR1);
        displayNumbers(environment.i, environment.i + 1, COLOR2);
        displayNumbers(environment.i + 1, environment.j, COLOR1);
        displayNumbers(environment.j, environment.j + 1, COLOR2);
        displayNumbers(environment.j + 1, array.length, COLOR1);

    } else if (environment.state == 4) {
        let t = environment.array[environment.i];
        environment.array[environment.i] = environment.array[environment.j];
        environment.array[environment.j] = t;

        if (JSON.stringify(environment.array) === JSON.stringify(environment.sorted_array)) {
            displayNumbers(0, array.length, COLOR3);
            environment.state = 5;
        } else {
            displayNumbers(0, environment.i, COLOR1);
            displayNumbers(environment.i, environment.i + 1, COLOR3);
            displayNumbers(environment.i + 1, environment.j, COLOR1);
            displayNumbers(environment.j, environment.j + 1, COLOR3);
            displayNumbers(environment.j + 1, array.length, COLOR1);

            environment.state = 1;
        }
        frameRate(0);
    }
}

function mouseMoved() {
    if (DEBUG) {
        strokeWeight(0);
        fill(COLOR1);
        rect(50, 120, 135, 45);
        fill("#000000");
        text(`(${mouseX}, ${mouseY})`, 50, 150);
        strokeWeight(1);
    }
}

function mousePressed() {
    // userManuallySort(environment.array);
    let x = judgeBox(environment.array);
    if (x >= 0 && !environment.draw_flag) {
        if (DEBUG) {
            strokeWeight(0);
            fill("#fffff");
            rect(250, 560, 135, 45);
            fill("#000000");
            text(`index: ${x}`, 250, 580);
            strokeWeight(1);
        }
        if (environment.state == 1) {
            environment.state = 2;
            environment.i = x;
        } else if (environment.state == 2) {
            environment.state = 3;
            environment.j = x;
            if (environment.j < environment.i) {
                let t = environment.j;
                environment.j = environment.i;
                environment.i = t;
            } else if (environment.i == environment.j) {
                environment.state = 1;
            }
        } else if (environment.state == 3) {
        } else if (environment.state == 4) {
        } else if (environment.state == 5) {
            return;
        }
        frameRate(30);
    } else {

    }
}

function judgeBox(array) {
    for (let x = 0; x < array.length; x++) {
        if (MARGIN.x + x * (BOX.width + SPACING.x) <= mouseX && mouseX <= MARGIN.x + x * (BOX.width + SPACING.x) + BOX.width
            && MARGIN.y <= mouseY && mouseY <= MARGIN.y + BOX.height) {
            return x;
        }
    }
    return -1;
}

function displayNumbers(start, end, color) {
    if (frameCount < environment.savedFrameCount && save_frame.checked()) {
        frameRate(120)
    } else {
        if (environment.ff_flag) {
            frameRate(5);
        } else {
            frameRate(1);
        }
    }
    for (x = start; x < end; x++) {
        fill(color);
        rect(MARGIN.x + x * (BOX.width + SPACING.x), MARGIN.y, BOX.width, BOX.height);
        fill(0);
        textSize(20);
        text(environment.array[x], MARGIN.x + 8 + x * (BOX.width + SPACING.x), MARGIN.y + 27);
    }
}