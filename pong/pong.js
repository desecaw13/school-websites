import { Checkboxland } from './checkboxland.mjs';//'https://unpkg.com/checkboxland?module';
import Paddle from './paddle.js';
import Ball from './ball.js';

/**
 * An instance of Checkboxland.
 * @type {Checkboxland}
 */
let cbl;

/**
 * The {@link Paddle} to the right. Moves up and down with arrow keys.
 * @type {Paddle}
 */
let firstP;

/**
 * The {@link Paddle} to the left. Moves automaticly, or with W and S keys.
 * @type {Paddle}
 */
let secondP;

/**
 * The {@link Ball}. Moves and bounces.
 * @type {Ball}
 */
let ball;

/**
 * The current scores.
 */
const score = {
    /**
     * The first player's points.
     * @type {number}
     */
    p1: 0,
    
    /**
     * The second player's points.
     * @type {number}
     */
    p2: 0
};

/**
 * The height of {@link cbl}.
 * @type {number}
 */
let maxHeight;

/**
 * The width of {@link cbl}.
 * @type {number}
 */
let maxWidth;

/**
 * Miscellaneous variables from {@link init}.
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
 * @type {number}
 */
let delay;

/**
 * The current count until the second paddle can move when controlled by computer.
 * @type {number}
 */
 let delayDelta = 0;

/**
 * The current speed of the ball. This increases over time.
 * @type {number}
 */
let ballSpeed = 10;

/**
 * The amount of time it takes for the ball's speed to increase.
 * @type {number}
 */
let millisecondsTillBallSpeedUp;

/**
 * The amount of time since the ball's speed last increased.
 * @type {number}
 */
let timeSinceLastSpeedUp;

/**
 * The previous timestamp. For internal use.
 * @type {number}
 */
let lastTimestamp = 0;

/**
 * The previous timestamp.
 */
// This is exported so lastTimestamp is mutable by importers.
const lastRender = { value: lastTimestamp };

/**
 * For waiting a few moments before moving the ball.
 * @type {boolean}
 */
let started = false;

/**
 * Starts the game of pong. All numerical arguments must be whole numbers.
 * @param {number} width The number of checkboxes horizontal.
 * @param {number} height The number of checkboxes vertical.
 * @param {boolean} multiplayer TODO
 * @param {string} difficulty Must be `'easy'`, `'medium'`, or `'hard'`
 * @param {{}} options Options
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

    const br = Math.round(Math.min(width, height) / 12);
    const bx = width / 2 - br / 2;
    const by = height / 2 - br / 2;
    ball = new Ball(bx, by, br);

    genBallMovement(difficulty);

    _info = {
        mp: multiplayer,
        df: difficulty,

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

    // Wait half a second before starting to move the ball.
    setTimeout(() => { started = true; }, 500);
}

/**
 * Sets up ball direction, speed up, and {@link delay}.
 * @param {string} difficulty Must be 'easy', 'medium', or 'hard'
 */
function genBallMovement(difficulty) {
    ball.direction.x = Math.random() < 0.5 ? 1 : -1; // randomly picks either 1 or -1
    ball.direction.y = Math.random() * 4 - 2; // randomly picks a floating point between -2 and 2

    // ball.direction.y should not be close to zero because vertical movement will be too small.
    while (Math.abs(ball.direction.y) < 0.275) {
        ball.direction.y = Math.random() * 2 - 1;
    }
    //ball.direction.y = 0.275;
    console.log('bdy:', ball.direction.y);

    //todo: factor in (max) width to delay.
    const absBallDirY = Math.abs(ball.direction.y);
    switch (difficulty) {
        case 'easy':
            delay = 200 + 200 * absBallDirY;
            break;
        case 'medium':
            delay = 100 + 100 * absBallDirY;
            break;
        case 'hard':
            delay = 50 + 50 * absBallDirY;
            break;
    }

    millisecondsTillBallSpeedUp = delay / absBallDirY;
    timeSinceLastSpeedUp = 0;
}

/**
 * Runs a game logic cycle.
 * @param {number} dt The delta time in milliseconds.
 */
function update(dt) {
    //console.log('fps:', 1/dt*1000);

    if (ball.x > maxWidth) {
        score.p1 += 1;
        newRound();
    }
    if (ball.x < -1) {
        score.p2 += 1;
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
        ball.direction.y = -ball.direction.y;
        ball.y += 1;
    }
    else if (ball.y + ball.radius - 1 > maxHeight) {
        ball.direction.y = -ball.direction.y;
        ball.y -= 1;
    }

    if (started) {
        ball.x += ball.direction.x * ballSpeed * dt/1000;
        ball.y += ball.direction.y * ballSpeed * dt/1000;

        timeSinceLastSpeedUp += dt;
    }

    if (timeSinceLastSpeedUp >= millisecondsTillBallSpeedUp) {
        ballSpeed += 0.05;
        timeSinceLastSpeedUp = 0;
    }
}

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

// todo: move to main.js
const names = {
    first: document.getElementById('first-name'),
    second: document.getElementById('second-name')
};

/**
 * Resets the game for a new round and updates the {@link score}.
 */
 function newRound() {
    pressedKeys.up = false;
    pressedKeys.w = false;
    pressedKeys.down = false;
    pressedKeys.s = false;
    pressedKeys.changed = true;

    firstP.x = _info.fx;
    firstP.y = _info.py;

    secondP.x = _info.sx;
    secondP.y = _info.py;

    ball.x = _info.bx;
    ball.y = _info.by;

    started = false;

    ballSpeed = 10;

    genBallMovement(_info.df);

    names.first.setAttribute('score', score.p1);
    names.second.setAttribute('score', score.p2);

    // Wait half a second before re-starting to move the ball.
    setTimeout(() => { started = true; }, 500);
}

/**
 * Updates display of game on the screen.
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

/**
 * Removes the current state of the pong game.
 * Sets most variables to null.
 */
function destroy() {
    // cbl.clearData();
    cbl = null;
    firstP = null;
    secondP = null;
    ball = null;
    score.p1 = 0;
    score.p2 = 0;
    maxHeight = null;
    maxWidth = null;
    lastTimestamp = 0;
    pressedKeys.up = false;
    pressedKeys.w = false;
    pressedKeys.down = false;
    pressedKeys.s = false;
    pressedKeys.changed = true;
    _info = null;
    delay = null;
    millisecondsTillBallSpeedUp = null;
    timeSinceLastSpeedUp = null;
    ballSpeed = 10;
    started = false;
}

/**
 * Event handler for contolling paddles with keyboard.
 * @param {KeyboardEvent} e The keydown event.
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
