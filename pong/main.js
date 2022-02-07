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
 * Starts the game when the start button is clicked.
 */
start_btn.addEventListener('click', () => {
    menu.style.display = 'none';
    names.first.innerText = menu.nameOne.value;
    names.second.innerText = menu.nameTwo.value;
    reset_btn.style.display = 'initial';
    document.activeElement.blur();

    reset_btn.addEventListener('click', () => {
        reset = true;
        game.destroy();
        document.getElementById('checkboxland').replaceChildren();
        menu.style.display = 'initial';
        names.first.innerText = '';
        names.second.innerText = '';
        reset_btn.style.display = 'none';
        document.activeElement.blur();
    });

    // [Creates the events for game]. //move to game.init ?
    document.addEventListener('keydown', game.onKeyDown, true);
    //todo: 'mousemove' ?

    // Initializes the game. 
    //game.init(16, 16);
    game.init(menu.xsize.value, menu.ysize.value,
        menu.multiplayer.checked,
        menu.difficulty.value
    );
    //todo: test and figure out smalls

    // the begining proper.
    window.requestAnimationFrame(main);
});
