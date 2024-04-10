var socket = io("http://localhost:3000/");

function setup() {
    let cnv = createCanvas(100, 100);
    frameRate(5);
    /* サーバからframecountを受け取る */
    socket.on("sendFrameCount", function (data) {
        frameCount = data;
    });
}

function draw() {
    background("#ffffff");
    text(`${frameCount}`, 0, 10);
}

function mousePressed() {
    console.log("mouse");
    /* サーバにframecountを渡す */
    socket.emit("saveFrameCount", frameCount);
}
