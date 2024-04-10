const MARGIN = { x: 10, y: 10 };
const SPACING = { x: 5, y: 5 };
const BOX = { width: 30, height: 40 };

let state = 0;
// let array = [3, 1, 4, 6, 5, 2];
let array = [6, 5, 4, 3, 2, 1];
let i = 0;
let j = array.length - 1;
let sorted = false;

function setup() {
    createCanvas(1000, 1000);
    frameRate(1);
}

function draw() {
    bubbleSortAnimation(array, i, j);
    if (state == 0) {

    } else if (state == 1) {

    } else if (state == 2) {
        j--;
    } else if (state == 3) {

    } else if (state == 4) {
        i++;
        j = array.length - 1;
    } else if (state == 5) {

    }
}

function bubbleSort(array) {
    for (let i = 0; i < array.length - 1; i++) {
        // state = 1
        for (let j = array.length - 1; j > i; j--) {
            // state = 2
            if (array[j - 1] > array[j]) {
                // state = 3
                let t = array[j - 1];
                array[j - 1] = array[j];
                array[j] = t;
            }
        }
        // state = 4
    }
    // state = 5;
}

function bubbleSortAnimation(array, i, j) {
    background(255);
    if (state == 0) {
        // display all array elements
        for (x = 0; x < array.length; x++) {
            fill(255);
            rect(MARGIN.x + x * (BOX.width + SPACING.x), MARGIN.y, BOX.width, BOX.height);
            fill(0);
            textSize(20);
            text(array[x], 18 + x * (BOX.width + SPACING.x), 37);
        }
        state = 1;
    } else {
        if (state == 4) {
            if (i == j) {
                state = 5;
                sorted = true;
            } else {
                state = 2;
            }
        }
        if (state == 1 || state == 2 || state == 3) {
            // sorted elements are displayed as blue boxes
            if (state == 3) {
                let t = array[j - 1];
                array[j - 1] = array[j];
                array[j] = t;
            }
            for (x = 0; x < i; x++) {
                fill("#00ffff");
                rect(MARGIN.x + x * (BOX.width + SPACING.x), MARGIN.y, BOX.width, BOX.height);
                fill(0);
                textSize(20);
                text(array[x], 18 + x * (BOX.width + SPACING.x), 37);
            }
            for (x = i; x < array.length; x++) {
                fill(255);
                rect(MARGIN.x + x * (BOX.width + SPACING.x), MARGIN.y, BOX.width, BOX.height);
                fill(0);
                textSize(20);
                text(array[x], 18 + x * (BOX.width + SPACING.x), 37);
            }
            state = 2;
            for (x = j - 1; x <= j; x++) {
                fill("#ffff00");
                rect(MARGIN.x + x * (BOX.width + SPACING.x), MARGIN.y, BOX.width, BOX.height);
                fill(0);
                textSize(20);
                text(array[x], 18 + x * (BOX.width + SPACING.x), 37);
            }
            if (array[j - 1] > array[j]) {
                state = 3
            } else if (i == j - 1) {
                state = 4;
            }
        }
        if (state == 5) {
            for (x = 0; x < array.length; x++) {
                fill("#00ffff");
                rect(MARGIN.x + x * (BOX.width + SPACING.x), MARGIN.y, BOX.width, BOX.height);
                fill(0);
                textSize(20);
                text(array[x], 18 + x * (BOX.width + SPACING.x), 37);
            }
        }
    }
}
