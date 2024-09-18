class Ball {
    constructor(x, y, r, vx, vy, m = -1, e = 1) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = vx;
        this.vy = vy;
        this.m = m < 0 ? r ** 2 : m;
        this.e = e;
    }

    static ACCELERATION() {
        return 1.0;
    }

    update() {
        this.vy += Ball.ACCELERATION();
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        ellipse(this.x, this.y, this.r * 2, this.r * 2);
    }
}




const MARGIN = { x: 10, y: 40 };
const SPACING = { x: 5, y: 5 };
const BOX = { width: 30, height: 40 };
const STAGE = { width: 300, height: 400 };
const DEBUG = true;
const FPS = 30;
const SCREEN_SIZE = 1300;

let canvas;
let environment;
let restart_button;
let draw_button;
let ff_button;
let save_frame;
let frames;
let slider;
let myfont;


function preload() {
    myfont = loadFont("https://fonts.gstatic.com/ea/notosansjapanese/v6/NotoSansJP-Bold.otf");
}

function initializeVars() {
    frameCount = 0;
    frames = [];
    environment = {
        balls: [new Ball(100, 100, 10, 2, 1)],
        reset_flag: false,
        draw_flag: false,
        ff_flag: false,
        savedFrameCount: 0,
    }
    showVars(environment);
}

function showVars(env) {
    if (DEBUG) {
        textSize(20);
        textAlign(LEFT, CENTER);
        push();
        // translate(-SCREEN_SIZE/2, -SCREEN_SIZE/2 + BOX.height);
        fill(255);
        strokeWeight(0);
        rect(0, MARGIN.y + 370, 250, 200);
        fill(0);
        let o = Object.entries(env);
        for (let e = 0; e < Object.keys(env).length; e++) {
            text(`${o[e][0]}: ${o[e][1]}`, MARGIN.x, MARGIN.y + STAGE.height + BOX.width * e);
        }
        text(`frameCount: ${frameCount}`, MARGIN.x, MARGIN.y + STAGE.height + BOX.width * Object.keys(env).length);
        // ellipse(MARGIN.x,MARGIN.y+STAGE.height+BOX.width,SCREEN_SIZE,SCREEN_SIZE/2);
        pop();
    }
}

function setup() {
    createCanvas(SCREEN_SIZE, SCREEN_SIZE, WEBGL);
    textFont(myfont);
    canvas = createFramebuffer();
    background(255);
    frameRate(FPS);
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
        translate(-SCREEN_SIZE / 2, -SCREEN_SIZE / 2 + BOX.height);
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
        initializeVars();
        drawFlag = false;
        showVars(environment);
        frameRate(FPS);
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
            frameRate(FPS);
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
        if (environment.stop_flag) {
            push();
            translate(-SCREEN_SIZE / 2, -SCREEN_SIZE / 2 + BOX.height);
            // drawFrame(slider.value());
            image(frames[slider.value()], -SCREEN_SIZE / 2, -SCREEN_SIZE / 2);
            pop();
        }
    })

    /* サーバからframecountを受け取る */
    socket.on("sendFrameCount", function (data) {
        environment.savedFrameCount = data;
        frameRate(FPS);
    });
    /* サーバからenvironmentを受け取る */
    socket.on("sendEnvironment", function (data) {
        if (!environment.stop_flag) {
            if (Object.keys(data).length !== 0) {
                environment = data;
                for (let i = 0; i < environment.balls.length; i++) {
                    let t = new Ball();
                    t.x = environment.balls[i].x;
                    t.y = environment.balls[i].y;
                    t.r = environment.balls[i].r;
                    t.vx = environment.balls[i].vx;
                    t.vy = environment.balls[i].vy;
                    t.e = environment.balls[i].e;
                    environment.balls[i] = t;
                }
            }
            frameRate(FPS);
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
            frameRate(FPS);
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
    translate(-SCREEN_SIZE / 2, -SCREEN_SIZE / 2 + BOX.height);

    // background(128);
    if (environment.stop_flag) {
        // stop
        // drawFrame(slider.value());
        if (slider.value() < frameCount && frames.length > 0) {
            drawFrame(slider.value());
            image(frames[slider.value()], -SCREEN_SIZE / 2, -SCREEN_SIZE / 2);
        }
    } else {
        // start
        if (frameCount <= frames.length) {
            frameRate(30);
            image(frames[frameCount - 1], -SCREEN_SIZE / 2, -SCREEN_SIZE / 2);
            if (frameCount === frames.length) {
                // frameRate(0);
            }
        } else {
            canvas.begin();
            // fill(128, 255, 255);
            drawFrame();
            canvas.end();
            // frames.push(canvas.get());
            image(canvas, -SCREEN_SIZE / 2, -SCREEN_SIZE / 2);
        }
    }
    // drawFrame();
    pop();
}

function drawFrame() {
    rect(0, 0, STAGE.width, SCREEN_SIZE - 20);
    rect(0, 0, STAGE.width, STAGE.height);
    calculate();
    showVars(environment);
}

function calculate() {
    for (let i = 0; i < environment.balls.length; i++) {
        environment.balls[i].update();
        if (environment.balls[i].x - environment.balls[i].r <= 0) {
            environment.balls[i].vx *= -1;
            environment.balls[i].x = environment.balls[i].r;
        } else if (STAGE.width <= environment.balls[i].x + environment.balls[i].r) {
            environment.balls[i].vx *= -1;
            environment.balls[i].x = STAGE.width - environment.balls[i].r;
        }
        if (environment.balls[i].y - environment.balls[i].r <= 0) {
            environment.balls[i].vy *= -1;
            environment.balls[i].y = environment.balls[i].r;
        } else if (STAGE.height <= environment.balls[i].y + environment.balls[i].r) {
            environment.balls[i].vy = -(environment.balls[i].vy + 1);
            environment.balls[i].y = STAGE.height - environment.balls[i].r;

        }
        for (let j = i + 1; j < environment.balls.length; j++) {
            let diffX = environment.balls[j].x - environment.balls[i].x;
            let diffY = environment.balls[j].y - environment.balls[i].y;
            let d = environment.balls[i].r + environment.balls[j].r
            if (diffX * diffX + diffY * diffY <= d * d) {
                let temp = environment.balls[i].vx;
                environment.balls[i].vx = environment.balls[j].vx;
                environment.balls[j].vx = temp;
                temp = environment.balls[i].vy;
                environment.balls[i].vy = environment.balls[j].vy;
                environment.balls[j].vy = temp;
            }
        }
        environment.balls[i].draw();
    }
}

function mouseMoved(event) {
    // console.log(event);
    if (DEBUG) {
        push();
        translate(-SCREEN_SIZE / 2, -SCREEN_SIZE / 2);
        noStroke();
        fill("#ffffff");
        rect(350, 120, 300, 50);
        fill("#000000");
        text(`(${mouseX}, ${mouseY})`, 350, 150);
        strokeWeight(1);
        pop();
    }
    // console.log(get(mouseX, mouseY));
}

async function keyPressed() {
    if (key == "r") {
        initializeVars();
        // board = new Board([]);
        // gameOverFlag = false;
    } else if (key == "t") {
        try {
            await ballsTest(5);
        } catch (e) {
            console.log(e);
        }
    } else if (key == "b") {
        let b = new Ball(100, 100, 10, 2, 1);
        environment.balls.push(b);
    }
}

// 指定した時間(ミリ秒)だけ待つ
const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

async function waitForMilliseconds(ms) {
    return waitForFrameCounts(ms / 1000 * frameRate());
}

async function waitForFrameCounts(f) {
    let start = frameCount;
    while (frameCount - start < f) { }
    return;
}

// キーkeyの入力をテストする
async function keyInputTest(key) {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: key }));
    window.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
    await sleep(100);
}

async function ballsTest(n) {
    for (let i = 0; i < n; i++) {
        keyInputTest("b");
        waitForFrameCounts(60);
    }
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