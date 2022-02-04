import * as game from './pong.js';

/**
 * Loops through game logic using `window.requestAnimationFrame`.
 * @param {number} timestamp current time since page load.
 */
function main(timestamp) {
    window.requestAnimationFrame(main);

    game.update(timestamp - game.lastRender.value);
    game.draw();

    game.lastRender.value = timestamp;
}

/**
 * Starts the game when the start button is clicked.
 */
let start_btn = document.getElementById('start');
start_btn.addEventListener('click', () => {
    document.activeElement.blur();
    start_btn.disabled = true;

    // [Creates the events for game]. //move to game.init ?
    document.addEventListener('keydown', game.onKeyDown, true);
    //todo: 'mousemove' ?

    // Initializes the game. 
    //game.init(16, 16);
    game.init(13, 14);
    //game.init(36, 24);
    //todo: test and figure out smalls

    // the begining proper.
    window.requestAnimationFrame(main);
});
