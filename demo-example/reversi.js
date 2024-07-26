/// <reference path="../node_modules/@types/p5/global.d.ts" />

class Record {
    color; // 手番
    placedPiece; // 置かれた石
    flippedPieces; // 裏返された石のリスト

    // 手番colorでマスplacedPieceに置く石の履歴を生成する
    constructor(color, placedPiece) {
        this.color = color;
        this.placedPiece = placedPiece;
        this.flippedPieces = [];
    }

    // マスpieceにある石を裏返したことを記録する
    flip(piece) {
        this.flippedPieces.push(piece);
    }
}

// 局面と履歴
class Board {
    // 隣接する8つのマスの方向のリスト
    static get DIRECTIONS() {
        return [new Location(-1, 0), new Location(-1, 1), new Location(0, 1),
        new Location(1, 1), new Location(1, 0), new Location(1, -1),
        new Location(0, -1), new Location(-1, -1)];
    }

    // 0を1に、1を0に変える
    static flip(color) {
        return (color == 0) ? 1 : ((color == 1) ? 0 : -1);
    }

    currentColor; // 現在の手番
    board; // 局面
    counts; // 0, 1の石の個数
    records; // 履歴のリスト

    constructor(args) {
        if (args.length == 0) {
            // 最初の局面を生成する
            this.currentColor = 0;
            this.board = [];
            for (let y = 0; y < 8; y++) {
                this.board.push([]);
                for (let x = 0; x < 8; x++) {
                    this.board[y].push(-1);
                }
            }
            this.board[4][3] = this.board[3][4] = 0;
            this.board[3][3] = this.board[4][4] = 1;
            this.counts = [0, 0];
            this.counts[0] = this.counts[1] = 2;
            this.records = [];
        } else if (args.length == 1) {
            // 局面sourceの(履歴を除く)コピーを生成する
            this.currentColor = args[0].currentColor;
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    this.board[x][y] = args[0].board[x][y];
                }
            }
            this.counts = [0, 0];
            this.counts[0] = args[0].counts[0];
            this.counts[1] = args[0].counts[1];
            this.records = [];
        }
    }

    // 現在の手番を返す
    get getCurrentColor() {
        return this.currentColor;
    }

    // 次の手番を返す
    get getNextColor() {
        return Board.flip(this.currentColor);
    }

    get(args) {
        if (args.length == 1) {
            // マスargs[0]: Locationの状態を返す
            return this.board[args[0].x][args[0].y];
        } else if (args.length == 2) {
            // マス(args[0]: int, args[1]: int)の状態を返す
            return this.board[args[0]][args[1]];
        }
    }

    // 盤面上にあるcolorの石の個数を返す
    getCount(color) {
        return this.counts[color];
    }

    // 履歴のリストを返す
    get getRecords() {
        return this.records;
    }

    isLegal(args) {
        if (args.length == 0) {
            // 空いているマスのどれかに現在の手番の石を置けるかどうかを返す
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    if (this.isLegal([x, y])) {
                        return true;
                    }
                }
            }
            return false;
        } else if (args.length == 1) {
            // マスargs[0]: Locationに現在の手番の石を置けるかどうかを返す
            if (args[0] == null || args[0] == undefined || args[0].x < 0 || args[0].x >= 8 || args[0].y < 0 || args[0].y >= 8 || this.board[args[0].x][args[0].y] != -1) {
                return false;
            }
            for (let i = 0; i < 8; i++) {
                if (this.isLegal([args[0], i])) {
                    return true;
                }
            }
            return false;
        } else if (args.length == 2) {
            if (args[0].x != undefined && args[0].y != undefined) {
                // マス(args[0]: Location)に現在の手番の石を置くとしたときに、方向args[1]: intの石が裏返せるかどうかを返す
                let d = Board.DIRECTIONS[args[1]];
                for (let i = 1; i < 8; i++) {
                    let x = args[0].x + d.x * i;
                    let y = args[0].y + d.y * i;
                    if (x < 0 || x >= 8 || y < 0 || y >= 8) {
                        return false;
                    }
                    let c = this.board[x][y];
                    if (c == -1) {
                        return false;
                    } else if (c == this.currentColor) {
                        return i > 1;
                    }
                }
            } else {
                // マス(args[0]: int, args[1]: int)に現在の手番の石が置けるかどうかを返す
                return this.isLegal([new Location(args[0], args[1])]);
            }
        }
    }

    // 現在の手番が石を置けるマスを全て返す
    enumerateLegalLocations() {
        let locs = [];
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                let l = new Location(x, y);
                if (this.isLegal([l])) {
                    locs.push(l)
                }
            }
        }
        return locs;
    }

    put(args) {
        if (args.length == 1) {
            // マスargs[0]: Locationに現在の手番の石を置く
            let legalFlags = [false, false, false, false, false, false, false, false];
            let legal = false;
            for (let i = 0; i < 8; i++) {
                legalFlags[i] = this.isLegal([args[0], i]);
                legal = legal || legalFlags[i];
            }
            this.board[args[0].x][args[0].y] = this.currentColor;
            this.counts[this.currentColor]++;
            let rec = new Record(this.currentColor, args[0]);
            this.records.push(rec);
            let opp = Board.flip(this.currentColor);
            for (let i = 0; i < 8; i++) {
                if (legalFlags[i]) {
                    let d = Board.DIRECTIONS[i];
                    for (let j = 1; j < 8; j++) {
                        let x = args[0].x + d.x * j;
                        let y = args[0].y + d.y * j;
                        if (this.board[x][y] == this.currentColor) {
                            break;
                        }
                        this.board[x][y] = this.currentColor;
                        this.counts[this.currentColor]++;
                        this.counts[opp]--;
                        rec.flip(new Location(x, y));
                    }
                }
            }
            this.currentColor = Board.flip(this.currentColor);
        } else if (args.length == 2) {
            // マス(args[0]: int, args[1]: int)に現在の手番の石を置く
            this.put([new Location(args[0], args[1])]);
        }
    }

    // 現在の手番がパスをする
    pass() {
        this.records.push(null);
        this.currentColor = Board.flip(this.currentColor);
    }

    // 1つ前の手に戻す
    undo() {
        let rec = this.records.pop();
        if (rec != null) {
            this.board[rec.placedPiece.x][rec.placedPiece.y] = -1;
            opp = (rec.color + 1) % 2;
            flippedPieceCount = rec.flippedPieces.length;
            for (let i = 0; i < flippedPieceCount; i++) {
                p = rec.flippedPieces[i];
                this.board[p.x][p.y] = opp;
            }
            this.counts[rec.color] -= 1 + flippedPieceCount;
            this.counts[opp] += flippedPieceCount;
        }
        this.currentColor = Board.flip(this.currentColor);
    }
}

// マスの座標
class Location {
    x; // x座標 (0〜7)
    y; // y座標 (0〜7)

    // 座標(x, y)を生成する
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    // 文字列表現を返す
    toString() {
        return `(${this.x}, ${this.y})`;
    }

}

const SCREEN_SIZE = 500; // 画面サイズ
const BOARD_COLOR = "#00a000"; // 盤面の色
const LINE_WEIGHT = 2; // 線の太さ
const PIECE_OUTLINE_WEIGHT = 2; // 石の枠の太さ
const TEXT_SIZE = 16; // 文字サイズ
const BOARD_OFFSET = 0.05 * SCREEN_SIZE; // 盤面の余白
const BOARD_SIZE = 0.9 * SCREEN_SIZE; // 盤面のサイズ
const PIECE_SIZE = BOARD_SIZE / 10; // 石のサイズ

let playerTypes; // 先手・後手のプレイヤー
// let timeLimitedFlag; // 時間制限するかどうか
let board; // 局面
// let aiThread; // AIスレッド
let mouseClickedFlag; // マウスがクリックされたかどうか
let gameOverFlag; // ゲームオーバーかどうか
let resultToShowFlag = false; // 結果を表示するかどうか

let lastLocation = new Location(0, 0);

// 色colorの文字列を返す
function getColorName(color) {
    return (color == 0) ? "黒" : (color == 1 ? "白" : "" + color);
}

// マス(x, y)の座標を返す
function transformBoardLocation(x, y) {
    return createVector(BOARD_OFFSET + BOARD_SIZE * (x + 0.5) / 8, BOARD_OFFSET + BOARD_SIZE * (y + 0.5) / 8);
}

// 座標(x, y)のマスを返す
function transformScreenPosition(x, y) {
    return new Location(floor(8 * (x - BOARD_OFFSET) / BOARD_SIZE), floor(8 * (y - BOARD_OFFSET) / BOARD_SIZE));
}

function setup() {
    createCanvas(SCREEN_SIZE, SCREEN_SIZE);
    // frameRate(10);
    background(255);
    playerTypes = [];
    for (let i = 0; i < 2; i++) {
        playerTypes.push(0); // vs 人
    }
    board = new Board([]);
    mouseClickedFlag = false;
    gameOverFlag = false;
}

// マス(x, y)に色colorの石を描画する
// 追加の引数として不透明度alphaと枠の幅の重みoutlineを受け取る
function drawPiece(x, y, color, alpha, outline) {
    if (outline >= 0) {
        strokeWeight(PIECE_OUTLINE_WEIGHT * outline);
        stroke(255 * (1 - color));
    } else {
        noStroke();
    }
    let c = 255 * color;
    fill(c, c, c, 255 * alpha);
    let v = transformBoardLocation(x, y);
    ellipse(v.x, v.y, PIECE_SIZE, PIECE_SIZE);
}

// 局面boardの盤面を描画する
function drawBoard(board) {
    background((board.getCurrentColor == 0) ? 64 : 192);
    noStroke();
    fill(BOARD_COLOR);
    rect(BOARD_OFFSET, BOARD_OFFSET, BOARD_SIZE, BOARD_SIZE);
    strokeWeight(LINE_WEIGHT);
    stroke(0);
    for (let i = 0; i <= 8; i++) {
        let p = BOARD_OFFSET + BOARD_SIZE * i / 8;
        line(BOARD_OFFSET, p, BOARD_OFFSET + BOARD_SIZE, p);
        line(p, BOARD_OFFSET, p, BOARD_OFFSET + BOARD_SIZE);
    }
    fill((board.getCurrentColor == 0) ? 255 : 0);
    textSize(TEXT_SIZE);
    textAlign(CENTER, CENTER);
    noStroke();
    for (let i = 0; i < 8; i++) {
        let p = BOARD_OFFSET + BOARD_SIZE * (i + 0.5) / 8;
        text(i, p, 0.025 * SCREEN_SIZE);
        text(i, 0.025 * SCREEN_SIZE, p);
    }
    text("Black " + board.getCount(0) + " - " + board.getCount(1) + " White", 0.5 * SCREEN_SIZE, 0.975 * SCREEN_SIZE);
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            let c = board.get([x, y]);
            if (c != -1) {
                drawPiece(x, y, c, 1, -1);
            }
        }
    }
    let recs = board.getRecords;
    if (recs.length > 0) {
        let lastRec = recs[recs.length - 1];
        if (lastRec != null) {
            let color = lastRec.color;
            let placed = lastRec.placedPiece;
            drawPiece(placed.x, placed.y, color, 1, 1.5);
            for (let i = 0; i < lastRec.flippedPieces.length; i++) {
                let flipped = lastRec.flippedPieces[i];
                drawPiece(flipped.x, flipped.y, color, 1, 1);

            }
        }
    }
}

function draw() {
    if (resultToShowFlag) {
        let bc = board.getCount(0);
        let wc = board.getCount(1);
        alert(`黒 ${bc} - ${wc} 白\n${(bc > wc ? "黒の勝ち" : (bc < wc ? "白の勝ち" : "引き分け"))}`);
        resultToShowFlag = false;
    } else if (!gameOverFlag) {
        let nextTurnFlag = false;
        let playerType = playerTypes[board.getCurrentColor];
        if (playerType == 0) {
            // human vs human
            let l = transformScreenPosition(mouseX, mouseY);
            // console.log(l);
            if (l.x < 0 || l.x >= 8 || l.y < 0 || l.y >= 8 || !board.isLegal([l])) {
                drawBoard(board);
            } else if (mouseClickedFlag) {
                board.put([l]);
                nextTurnFlag = true;
            } else {
                drawBoard(board);
                drawPiece(l.x, l.y, board.getCurrentColor, 0.5, -1);
            }
        }
        if (nextTurnFlag) {
            if (!board.isLegal([])) {
                board.pass();
                if (!board.isLegal([])) {
                    board.undo();
                    gameOverFlag = true;
                    resultToShowFlag = true;
                }
                drawBoard(board);
                if (!gameOverFlag) {
                    playerType = playerTypes[board.getCurrentColor];
                }
            }
        }
        mouseClickedFlag = false;
    }
    // console.log(`mouseClickedFlag: ${mouseClickedFlag}`);
}

function mouseClicked() {
    mouseClickedFlag = true;
    console.log(`mouseClickedFlag: ${mouseClickedFlag}`);
}
function keyPressed() {
    if (key == "r") {
        board = new Board([]);
        gameOverFlag = false;
    }
}
