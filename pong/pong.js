import { Checkboxland } from './checkboxland.mjs'; //'https://unpkg.com/checkboxland?module';
import Paddle from './paddle.js';

//todo: two player

let cbl;
let firstP;
let secondP;

const minHeight = 0;
let maxHeight;

//
const pressedKeys = {
    up: false,
    down: false,
    changed: true
};
//todo fix: if down pressed while at bottom, it'll 'sticks' (not move) for one up input.

let lastTimestamp = 0;
/**
 * The previous timestamp.
 */
const lastRender = { value: lastTimestamp };

function init(width, height, options = {}) {
    cbl = new Checkboxland({ dimensions: `${width}x${height}` });
    maxHeight = height;

    //todo: options
    const pw = 2;
    const ph = height / 4;
    const py = Math.round((height - ph) / 2);
    const sx = width - pw - 2;
    const fx = 2;
    firstP = new Paddle(fx, py, pw, ph);
    secondP = new Paddle(sx, py, pw, ph);
}

function update(dt) {
    //console.log(1/dt*1000);

    if (pressedKeys.up) {
        firstP.y -= 1;
        if (firstP.y < minHeight) {
            firstP.y += 1;
        } else {
            pressedKeys.changed = true;
        }
        pressedKeys.up = false;
    }
    if (pressedKeys.down) {
        if (!(firstP.y >= maxHeight - firstP.height)) {
            firstP.y += 1;
            pressedKeys.down = false;
            pressedKeys.changed = true;
        }
    }
}

function draw() {
    if (pressedKeys.changed) {
        cbl.clearData();
        cbl.setData(...firstP.getData());
        cbl.setData(...secondP.getData());
        pressedKeys.changed = false;
    }
}

function onKeyDown(e) {
    if (e.defaultPrevented) { return; }

    switch (e.key) {
        case 'ArrowDown':
            pressedKeys.down = true;
            break;
        case 'ArrowUp':
            pressedKeys.up = true;
            break;
        default:
            return;
    }
    e.preventDefault();
}

export {
    lastRender,
    init,
    update,
    draw,
    onKeyDown
}
