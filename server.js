var http = require('http'),
    socketIO = require('socket.io'),
    fs = require('fs'),
    // express = require('express'),
    server,
    io;


var path = require('path');
var mime = {
    ".html": "text/html",
    ".css": "text/css"
    // 読み取りたいMIMEタイプはここに追記
};

var frameCount = 0;
let save_frame = true;

server = new http.createServer(function (req, res) {

    if (req.url == '/') {
        filePath = '/index.html';
    } else {
        filePath = req.url;
    }
    var fullPath = __dirname + filePath;

    res.writeHead(200, { "Content-Type": mime[path.extname(fullPath)] || "text/plain" });
    fs.readFile(fullPath, function (err, data) {
        if (err) {
            // エラー時の応答
        } else {
            res.end(data, 'UTF-8');
        }
    });
}).listen(3000);

io = socketIO(server);
console.log('Server is running at http://localhost:3000/');
// クライアントが接続してきたときの処理
io.on('connection', function (socket) {
    console.log(`connected: ${socket.id}`);
    socket.emit('greeting-from-server', {
        greeting: 'Hello Client'
    });
    socket.on('greeting-from-client', function (message) {
        console.log(message);
    });
    socket.on('saveFrameCount', function (cnt) {
        frameCount = cnt;
        console.log(`saved: ${frameCount}`);
    });
    socket.on('saveFrame', function (flag) {
        save_frame = flag;
        console.log(`save frame: ${save_frame}`);
    });
    setTimeout(() => {
        socket.emit("sendFrameCount", frameCount);
        console.log(`sent: ${frameCount}`);
        socket.emit("sendSaveFrame", save_frame);
        console.log(`sent: ${save_frame}`);
    }, 500);
});

io.on('disconnect', function (socket) {
    console.log(`disconnected: ${socket.id}`);
});
