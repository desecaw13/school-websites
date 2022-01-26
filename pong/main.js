import * as game from './pong.js';

/*
https://www.bryanbraun.com/checkboxland/
https://www.bryanbraun.com/checkboxland/docs/css/cbl-normalize-size.css
https://github.com/bryanbraun/checkboxland/tree/main/docs/demos
https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
https://stackoverflow.com/a/16580064
https://stackoverflow.com/a/30516012
https://stackoverflow.com/a/56507053
https://isaacsukin.com/news/2015/01/detailed-explanation-javascript-game-loops-and-timing
*/

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
document.getElementById('start').addEventListener('click', () => {
    document.activeElement.blur();

    // Initializes [the game]. 
    //game.init(16, 16);
    game.init(36, 24);
    //todo: test and figure out smalls

    // [Creates the events for game]. //move to game.init ?
    document.addEventListener('keydown', game.onKeyDown, true);
    //todo: 'mousemove' ?

    // the begining proper.
    window.requestAnimationFrame(main);
});
