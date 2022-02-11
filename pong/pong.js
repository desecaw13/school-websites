import { Checkboxland } from 'https://unpkg.com/checkboxland?module';
import Paddle from './paddle.js';
import Ball from './ball.js';

/* todo:
    -speed up ball over time
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
 * The paddle to the left. Moves automaticly, or with W and S keys.
 */
let secondP;

/**
 * The ball. Moves and bounces.
 */
let ball;

/**
 * The current scores.
 */
const score = {
    /**
     * The first player's points.
     */
    p1: 0,
    
    /**
     * The second player's points.
     */
    p2: 0
};

let maxHeight;
let maxWidth;

/**
 * Miscellaneous variables from `init`
 */
let _info;

/**
 * The keys that user has pressed but haven't been handled by game yet.
 */
const pressedKeys = {
    up: false,
    w: false,
    down: false,
    s: false,
    changed: true
};

/**
 * A delay in milliseconds for the second paddle when singleplayer.
 * Allows the human player to win.
 */
let delay;

let lastTimestamp = 0;
/**
 * The previous timestamp.
 */
const lastRender = { value: lastTimestamp };

/**
 * For waiting a few moments before moving the ball.
 */
let started = false;

/**
 * Starts the game of pong.
 * @param {number} width The number of checkboxes horizontal. Must be a whole number.
 * @param {number} height The number of checkboxes vertical. Must be a whole number.
 * @param {*} options Options
 */
function init(width, height, multiplayer, difficulty, options = {}) {
    cbl = new Checkboxland({ dimensions: `${width}x${height}` });
    maxHeight = height;
    maxWidth = width;

    //todo: options.v || default

    const pw = 2;
    const ph = height / 4;
    const py = Math.round((height - ph) / 2);
    const sx = width - pw - 2;
    const fx = 2;
    firstP = new Paddle(fx, py, pw, ph);
    secondP = new Paddle(sx, py, pw, ph);

    const br = 1;
    const bx = width / 2 - br / 2;
    const by = height / 2 - br / 2;
    ball = new Ball(bx, by, br);

    ball.direction.x = Math.random() < 0.5 ? 1 : -1; // randomly pick either 1 or -1
    ball.direction.y = Math.random() * 2 - 1; // randomly pick a floating point between -1 and 1
    // ball.direction.y should not be close to zero because vertical movement will be too small.
    while (Math.abs(ball.direction.y) < 0.1) {
        ball.direction.y = Math.random() * 2 - 1;
    }

    switch (difficulty) {
        case 'easy':
            delay = 200 + 200 * ball.direction.y;
            break;
        case 'medium':
            delay = 100 + 100 * ball.direction.y;
            break;
        case 'hard':
            delay = 50 + 50 * ball.direction.y;
            break;
    }

    _info = {
        mp: multiplayer,

        pw: pw,
        ph: ph,
        py: py,
        sx: sx,
        fx: fx,

        br: br,
        bx: bx,
        by: by,

        //...options
    };

    setTimeout(() => { started = true; }, 500);
}

/**
 * Runs a game logic cycle.
 * @param {number} dt The delta time in ms.
 */
function update(dt) {
    //console.log(1/dt*1000);

    if (ball.x < -1) {
        score.p2 += 1;
        newRound();
    }
    if (ball.x > maxWidth) {
        score.p1 += 1;
        newRound();
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

    if (_info.mp) {
        if (pressedKeys.w) {
            if (!(secondP.y <= 0)) {
                secondP.y -= 1;
                pressedKeys.changed = true;
            }
            pressedKeys.w = false;
        }
        if (pressedKeys.s) {
            if (!(secondP.y >= maxHeight - secondP.height)) {
                secondP.y += 1;
                pressedKeys.changed = true;
            }
            pressedKeys.s = false;
        }
    } else {
        secondPTurn(dt);
    }

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

    if (started) {
        ball.x += ball.direction.x * 10 * dt/1000;
        ball.y += ball.direction.y * 10 * dt/1000;
    }
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

// todo: move to main.js
const names = {
    first: document.getElementById('first-name'),
    second: document.getElementById('second-name')
};

/**
 * Resets the game for a new round and updates the score.
 */
function newRound() {
    firstP.x = _info.fx;
    firstP.y = _info.py;

    secondP.x = _info.sx;
    secondP.y = _info.py;

    ball.x = _info.bx;
    ball.y = _info.by;

    pressedKeys.up = false;
    pressedKeys.w = false;
    pressedKeys.down = false;
    pressedKeys.s = false;
    pressedKeys.changed = true;
    started = false;

    names.first.setAttribute('score', score.p1);
    names.second.setAttribute('score', score.p2);

    setTimeout(() => { started = true; }, 500);
}

function destroy() {
    // cbl.clearData();
    cbl = null;
    firstP = null;
    secondP = null;
    ball = null;
    maxHeight = null;
    maxWidth = null;
    lastTimestamp = 0;
    pressedKeys.up = false;
    pressedKeys.w = false;
    pressedKeys.down = false;
    pressedKeys.s = false;
    pressedKeys.changed = true;
    started = false;
}

let delayDelta = 0;

/**
 * Controls the computer player two during singleplayer.
 * @param {number} dt The delta time in ms.
 */
function secondPTurn(dt) {
    delayDelta += dt;
    if (delayDelta >= delay) {
        if (ball.y < secondP.y + secondP.height / 2 - 2) {
            if (!(secondP.y <= 0)) {
                secondP.y -= 1;
            }
        } else if (ball.y > secondP.y + secondP.height / 2 + 2) {
            if (!(secondP.y >= maxHeight - secondP.height)) {
                secondP.y += 1;
            }
        }
        delayDelta = 0;
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
        case 'w':
            pressedKeys.w = true;
            break;
        case 'ArrowUp':
            pressedKeys.up = true;
            break;
        case 's':
            pressedKeys.s = true;
            break;
        default:
            return;
    }
    e.preventDefault();
}

export {
    lastRender,
    score,
    init,
    update,
    draw,
    destroy,
    onKeyDown
}
