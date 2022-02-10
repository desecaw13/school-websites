import * as game from './pong.js';

let reset = false;

let menu = document.menu;
let start_btn = document.getElementById('start');
const names = {
    first: document.getElementById('first-name'),
    second: document.getElementById('second-name')
};
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
 * Resets the game.
 */
reset_btn.addEventListener('click', () => {
    reset = true;
    game.destroy();
    document.getElementById('checkboxland').replaceChildren();
    menu.style.display = 'initial';
    names.first.innerText = '';
    names.second.innerText = '';
    names.first.setAttribute('score', '');
    names.second.setAttribute('score', '');
    reset_btn.style.display = 'none';
    document.activeElement.blur();
});

/**
 * Starts the game when the start button is clicked.
 */
start_btn.addEventListener('click', () => {
    menu.style.display = 'none';
    names.first.innerText = menu.nameOne.value;
    names.second.innerText = menu.nameTwo.value;
    names.first.setAttribute('score', 0);
    names.second.setAttribute('score', 0);
    reset_btn.style.display = 'initial';
    document.activeElement.blur();

    // Adds the events for game.
    document.addEventListener('keydown', game.onKeyDown, true);

    // Initializes the game.
    game.init(menu.xsize.value, menu.ysize.value,
        menu.multiplayer.checked,
        menu.difficulty.value
    );

    // the begining proper.
    window.requestAnimationFrame(main);
});
