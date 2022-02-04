import * as game from './pong.js';

let reset = false;

let menu = document.getElementById('menu');
let xsize = document.getElementById('x-size');
let ysize = document.getElementById('y-size');
let start_btn = document.getElementById('start');
let reset_btn = document.getElementById('reset');

/**
 * Loops through game logic using `window.requestAnimationFrame`.
 * @param {number} timestamp current time since page load.
 */
function main(timestamp) {
    if (reset) { reset = false; return; }

    window.requestAnimationFrame(main);

    game.update(timestamp - game.lastRender.value);
    game.draw();

    game.lastRender.value = timestamp;
}

/**
 * Starts the game when the start button is clicked.
 */
start_btn.addEventListener('click', () => {
    menu.style.display = 'none';
    reset_btn.style.display = 'initial';
    document.activeElement.blur();

    reset_btn.addEventListener('click', () => {
        reset = true;
        game.destroy();
        document.getElementById('checkboxland').replaceChildren();
        menu.style.display = 'initial';
        reset_btn.style.display = 'none';
        document.activeElement.blur();
    });

    // [Creates the events for game]. //move to game.init ?
    document.addEventListener('keydown', game.onKeyDown, true);
    //todo: 'mousemove' ?

    // Initializes the game. 
    //game.init(16, 16);
    game.init(35, 24);
    //todo: test and figure out smalls

    // the begining proper.
    window.requestAnimationFrame(main);
});
