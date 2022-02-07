import { Checkboxland } from './checkboxland.mjs';//'https://unpkg.com/checkboxland?module';
import Paddle from './paddle.js';
import Ball from './ball.js';

/* todo:
    -keep score
    -speed up ball over time
    -multiplayer
*/

/**
 * An instance of checkboxland.
 */
let cbl;

/**
 * The paddle to the right. Moves up and down with arrow keys.
 */
let firstP;

/**
 * The paddle to the left. Moves automaticly, or TODO: with W and S keys.
 */
let secondP;

/**
 * The ball. Moves and bounces.
 */
let ball;

let maxHeight;
let maxWidth;

/**
 * The keys that user has pressed but haven't been handled by game yet.
 */
const pressedKeys = {
    up: false,
    down: false,
    changed: true
};

let lastTimestamp = 0;
/**
 * The previous timestamp.
 */
const lastRender = { value: lastTimestamp };

/**
 * Starts the game of pong.
 * @param {number} width The number of checkboxes horizontal. Must be a whole number.
 * @param {number} height The number of checkboxes vertical. Must be a whole number.
 * @param {*} options Options
 */
function init(width, height, multiplayer, difficulty) {
    cbl = new Checkboxland({ dimensions: `${width}x${height}` });
    maxHeight = height;
    maxWidth = width;

    //todo: options
    const pw = 2;
    const ph = height / 4;
    const py = Math.round((height - ph) / 2);
    const sx = width - pw - 2;
    const fx = 2;
    firstP = new Paddle(fx, py, pw, ph);
    secondP = new Paddle(sx, py, pw, ph);

    const bw = 1;
    ball = new Ball(width / 2 - bw / 2, height / 2 - bw / 2, bw);
    ball.direction.x = Math.random() < 0.5 ? 1 : -1; // randomly pick either 1 or -1
    ball.direction.y = Math.random() * 2 - 1; // randomly pick a floating point between -1 and 1
}

/**
 * Runs a game logic cycle.
 * @param {number} dt The delta time in ms.
 */
function update(dt) {
    //console.log(1/dt*1000);

    if (ball.x < -1 || ball.x > maxWidth) {
        // todo: points and rounds
        //reset, newRound, ?
        return;
    }

    if (pressedKeys.up) {
        if (!(firstP.y <= 0)) {
            firstP.y -= 1;
            pressedKeys.changed = true;
        }
        pressedKeys.up = false;
    }
    if (pressedKeys.down) {
        if (!(firstP.y >= maxHeight - firstP.height)) {
            firstP.y += 1;
            pressedKeys.changed = true;
        }
        pressedKeys.down = false;
    }

    secondPTurn();

    if (!(((ball.y + ball.radius) < (firstP.y + 1))
        || (ball.y > (firstP.y + firstP.height))
        || ((ball.x + ball.radius) < firstP.x + 1)
        || (ball.x > (firstP.x + firstP.width)))) {

        ball.direction.x = 1;
    }

    if (!(((ball.y + ball.radius) < (secondP.y + 1))
        || (ball.y > (secondP.y + secondP.height))
        || ((ball.x + ball.radius) < secondP.x + 1)
        || (ball.x > (secondP.x + secondP.width)))) {

        ball.direction.x = -1;
    }

    if (ball.y < -1) {
        ball.direction.y = 1;
        ball.y += 1;
    }
    else if (ball.y > maxHeight) {
        ball.direction.y = -1;
        ball.y -= 1;
    }

    ball.x += ball.direction.x * 10 * dt/1000;
    ball.y += ball.direction.y * 10 * dt/1000;
}

/**
 * Updates display of game on screen.
 */
function draw() {
    //if (pressedKeys.changed) {
        cbl.clearData();
        cbl.setData(...firstP.getData());
        cbl.setData(...secondP.getData());
        //pressedKeys.changed = false;
    //}
    cbl.setData(...ball.getData());
}

function destroy() {
    cbl.clearData();
    cbl = null;
    // cbl
    firstP = null;
    secondP = null;
    ball = null;
    maxHeight = null;
    maxWidth = null;
    lastTimestamp = 0;
    pressedKeys.up = false;
    pressedKeys.down = false;
    pressedKeys.changed = true;
}

function secondPTurn() {
    //todo: delay
    if (ball.y < secondP.y + secondP.height / 2 - 2) {
        if (!(secondP.y <= 0)) {
            secondP.y -= 1;
        }
    } else if (ball.y > secondP.y + secondP.height / 2 + 2) {
        if (!(secondP.y >= maxHeight - secondP.height)) {
            secondP.y += 1;
        }
    }
}

/**
 * Event handler for contolling paddles with keyboard.
 * @param {Event} e The keydown event
 */
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
    destroy,
    onKeyDown
}
