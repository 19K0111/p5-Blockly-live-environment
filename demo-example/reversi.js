/// <reference path="../node_modules/@types/p5/global.d.ts" />

class Record {
    color;
    placedPiece;
    flippedPieces;

    constructor(color, placedPiece) {
        this.color = color;
        this.placedPiece = placedPiece;
        this.flippedPieces = [];
    }
    flip(piece) {
        this.flippedPieces.push(piece);
    }
}

class Board {
    static get DIRECTIONS() {
        return [new Location(-1, 0), new Location(-1, 1), new Location(0, 1),
        new Location(1, 1), new Location(1, 0), new Location(1, -1),
        new Location(0, -1), new Location(-1, -1)];
    }

    static flip(color) {
        return (color == 0) ? 1 : ((color == 1) ? 0 : -1);
    }

    currentColor; // 現在の手番
    board; // 局面
    counts; // 0, 1の石の個数
    records; // 履歴のリスト

    constructor(args) {
        if (args.length == 0) {
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
            this.currentColor = args[0].currentColor;
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    this.board[x][y] = args[0].board[x][y];
                }
            }
        }
    }

    get getCurrentColor() {
        return this.currentColor;
    }
    get getNextColor() {
        return flip(this.currentColor);
    }

    get(args) {
        if (args.length == 1) {
            return this.board[args[0].x][args[0].y];
        } else if (args.length == 2) {
            return this.board[args[0]][args[1]];
        }
    }
    // get(location) {
    //     return this.board[location.x][location.y];
    // }
    // get(x, y) {
    //     return this.board[x][y];
    // }
    getCount(color) {
        return this.counts[color];
    }
    get getRecords() {
        return this.records;
    }

    isLegal(args) {
        if (args.length == 0) {
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    if (this.isLegal([x, y])) {
                        return true;
                    }
                }
            }
            return false;
        } else if (args.length == 1) {
            if (args[0].x < 0 || args[0].x >= 8 || args[0].y < 0 || args[0].y >= 8 || this.board[args[0].x][args[0].y] != -1) {
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
                let d = Board.DIRECTIONS[args[1]];
                for (let i = 1; i < 8; i++) {
                    let x = args[0].x + d.x * i;
                    let y = args[0].y + d.y * i;
                    if (x < 0 || x >= 8 || y < 0 || y >= 8) {
                        return false;
                    }
                    c = this.board[x][y];
                    if (c == -1) {
                        return false;
                    } else if (c == this.currentColor) {
                        return i > 1;
                    }
                }
            } else {
                return this.isLegal([new Location(args[0], args[1])]);
            }
        }
    }

    // isLegal(location, direction) {
    //     d = DIRECTIONS()[direction];
    //     for (let i = 0; i < 8; i++) {
    //         let x = location.x + d.x + i;
    //         let y = location.y + d.x + i;
    //         if (x < 0 || x >= 8 || y < 0 || y >= 8) {
    //             return false;
    //         }
    //         c = this.board[x][y];
    //         if (c == -1) {
    //             return false;
    //         } else if (c == this.currentColor) {
    //             return i > 1;
    //         }
    //         return false;
    //     }
    // }
    // isLegal(location) {
    //     if (location == null || location.x < 0 || location.x >= 8 || location.y < 0 || location.y >= 8 || this.board[location.x][location.y] != -1) {
    //         return false;
    //     }
    //     for (let i = 0; i < 8; i++) {
    //         if (this.isLegal(new Location(location, i))) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }
    // isLegal(x, y) {
    //     return this.isLegal(new Location(x, y));
    // }
    // isLegal() {
    //     for (let y = 0; y < 8; y++) {
    //         for (let x = 0; x < 8; x++) {
    //             if (this.isLegal(x, y)) {
    //                 return true;
    //             }
    //         }
    //     }
    //     return false;
    // }

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
            put([new Location(args[0], args[1])]);
        }
    }
    // put(location) {
    //     legalFlags = [0, 0, 0, 0, 0, 0, 0, 0];
    //     legal = false;
    //     for (let i = 0; i < 8; i++) {
    //         legalFlags[i] = this.isLegal(location, i);
    //         legal = legal || legalFlags[i];
    //     }
    //     this.board[location.x][location.y] = this.currentColor;
    //     this.counts[this.currentColor]++;
    //     rec = new Record(this.currentColor, location);
    //     this.records.add(rec);
    //     opp = flip(this.currentColor);
    //     for (let i = 0; i < 8; i++) {
    //         if (legalFlags[i]) {
    //             d = DIRECTIONS()[i];
    //             for (let j = 1; j < 8; j++) {
    //                 let x = location.x + d.x + j;
    //                 let y = location.y + d.x + j;
    //                 if (this.board[x][y] == this.currentColor) {
    //                     break;
    //                 }
    //                 this.board[x][y] = this.currentColor;
    //                 this.counts[this.currentColor]++;
    //                 this.counts[opp]--;
    //                 rec.flip(new Location(x, y));
    //             }
    //         }
    //     }
    //     this.currentColor = flip(this.currentColor);
    // }
    // put(x, y) {
    //     put(new Location(x, y));
    // }
    pass() {
        this.records.add(null);
        this.currentColor = flip(this.currentColor);
    }
    undo() {
        rec = this.records.remove(this.records.size() - 1);
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
        this.currentColor = flip(this.currentColor);
    }
}

class Location {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }

}

SCREEN_SIZE = 500; // 画面サイズ
BOARD_COLOR = "#00a000"; // 盤面の色
LINE_WEIGHT = 2; // 線の太さ
PIECE_OUTLINE_WEIGHT = 2; // 石の枠の太さ
TEXT_SIZE = 16; // 文字サイズ
BOARD_OFFSET = 0.05 * SCREEN_SIZE; // 盤面の余白
BOARD_SIZE = 0.9 * SCREEN_SIZE; // 盤面のサイズ
PIECE_SIZE = BOARD_SIZE / 10; // 石のサイズ

let playerTypes; // 先手・後手のプレイヤー
let timeLimitedFlag; // 時間制限するかどうか
let board; // 局面
let aiThread; // AIスレッド
let mouseClickedFlag; // マウスがクリックされたかどうか
let gameOverFlag; // ゲームオーバーかどうか
let resultToShowFlag = false; // 結果を表示するかどうか

let lastLocation = new Location(0, 0);

function getColorName(color) {
    return (color == 0) ? "黒" : (color == 1 ? "白" : "" + color);
}

function transformBoardLocation(x, y) {
    return createVector(BOARD_OFFSET + BOARD_SIZE * (x + 0.5) / 8, BOARD_OFFSET + BOARD_SIZE * (y + 0.5) / 8);
}

function transformScreenPosition(x, y) {
    return new Location(floor(8 * (x - BOARD_OFFSET) / BOARD_SIZE), floor(8 * (y - BOARD_OFFSET) / BOARD_SIZE));
}

function setup() {
    let cnv = createCanvas(SCREEN_SIZE, SCREEN_SIZE);
    cnv.mouseReleased(mouseClicked);
    frameRate(10);
    background(255);
    playerTypes = [];
    for (let i = 0; i < 2; i++) {
        playerTypes.push(0); // vs 人
    }
    board = new Board([]);
    mouseClickedFlag = false;
    gameOverFlag = false;
}

function drawPiece(x, y, color, alpha, outline) {
    if (outline >= 0) {
        strokeWeight(PIECE_OUTLINE_WEIGHT * outline);
        stroke(255 * (1 - color));
    } else {
        noStroke();
    }
    c = 255 * color;
    fill(c, c, c, 255 * alpha);
    v = transformBoardLocation(x, y);
    ellipse(v.x, v.y, PIECE_SIZE, PIECE_SIZE);
}

function drawBoard(board) {
    background((board.getCurrentColor == 0) ? 64 : 192);
    noStroke();
    fill(BOARD_COLOR);
    rect(BOARD_OFFSET, BOARD_OFFSET, BOARD_SIZE, BOARD_SIZE);
    strokeWeight(LINE_WEIGHT);
    stroke(0);
    for (let i = 0; i <= 8; i++) {
        p = BOARD_OFFSET + BOARD_SIZE * i / 8;
        line(BOARD_OFFSET, p, BOARD_OFFSET + BOARD_SIZE, p);
        line(p, BOARD_OFFSET, p, BOARD_OFFSET + BOARD_SIZE);
    }
    fill((board.getCurrentColor == 0) ? 255 : 0);
    textSize(TEXT_SIZE);
    textAlign(CENTER, CENTER);
    for (let i = 0; i < 8; i++) {
        p = BOARD_OFFSET + BOARD_SIZE * (i + 0.5) / 8;
        text(i, p, 0.025 * SCREEN_SIZE);
        text(i, 0.025 * SCREEN_SIZE, p);
    }
    text("Black " + board.getCount(0) + " - " + board.getCount(1) + " White", 0.5 * SCREEN_SIZE, 0.975 * SCREEN_SIZE);
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            c = board.get([x, y]);
            if (c != -1) {
                drawPiece(x, y, c, 1, -1);
            }
        }
    }
    recs = board.getRecords;
    if (recs.length > 0) {
        lastRec = recs[recs.length - 1];
        if (lastRec != null) {
            color = lastRec.color;
            placed = lastRec.placedPiece;
            drawPiece(placed.x, placed.y, color, 1, 1.5);
            for (let i = 0; i < lastRec.flippedPieces.length; i++) {
                flipped = lastRec.flippedPieces[i];
                drawPiece(flipped.x, flipped.y, color, 1, 1);

            }
        }
    }
}

function draw() {
    if (resultToShowFlag) {
        bc = board.getCount(0);
        wc = board.getCount(1);
        alert(`黒 ${bc} - ${wc} 白\n${(bc > wc ? "黒の勝ち" : (bc < wc ? "白の勝ち" : "引き分け"))}`);
        resultToShowFlag = false;
    } else if (!gameOverFlag) {
        nextTurnFlag = false;
        playerType = playerTypes[board.getCurrentColor];
        if (playerType == 0) {
            // human vs human
            l = transformScreenPosition(mouseX, mouseY);
            if (lastLocation.x !== l.x || lastLocation.y !== l.y || mouseClickedFlag) {
                lastLocation = l;
                console.log(l);
                if (l.x < 0 || l.x >= 8 || l.y < 0 || l.y >= 8 || !board.isLegal([l])) {
                    drawBoard(board);
                } else if (mouseClickedFlag) {
                    board.put([l]);
                    nextTurnFlag = true;
                    mouseClickedFlag = false;
                } else {
                    drawBoard(board);
                    drawPiece(l.x, l.y, board.getCurrentColor, 0.5, -1);
                }
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
    }
    console.log(`mouseClickedFlag: ${mouseClickedFlag}`);
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
