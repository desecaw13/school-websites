// Joe Olpin
// HTML Second Web Page
// January 21 - February 18, 2022

import * as game from './pong.js';

/**
 * For stopping the game when the user presses reset.
 */
let reset = false;

// HTML element variables
let menu = document.menu;
let start_btn = document.getElementById('start');
const names = {
    first: document.getElementById('first-name'),
    second: document.getElementById('second-name')
};
let reset_btn = document.getElementById('reset');
let scoreTable = document.getElementById('scoreboard');
let scorebody = document.getElementById('scorebody');

/**
 * Loops through game logic using `window.requestAnimationFrame`.
 * @param {number} timestamp The current time since page load.
 */
function main(timestamp) {
    if (reset) { reset = false; return; }

    window.requestAnimationFrame(main);

    game.update(timestamp - game.lastRender.value);
    game.draw();

    game.lastRender.value = timestamp;
}

/**
 * Inserts a new score row in into the table.
 * @param {string} name1
 * @param {number} score1
 * @param {string} name2
 * @param {number} score2
 */
function insertNewScores(name1, score1, name2, score2) {
    let row = document.createElement('tr');

    let name1_td = document.createElement('td');
    name1_td.innerText = name1;

    let score1_td = document.createElement('td');
    score1_td.innerText = score1;

    let name2_td = document.createElement('td');
    name2_td.innerText = name2;

    let score2_td = document.createElement('td');
    score2_td.innerText = score2;

    row.append(name1_td, score1_td, name2_td, score2_td);

    scorebody.insertBefore(row, scorebody.firstChild);
}

/**
 * Resets the game.
 */
reset_btn.addEventListener('click', () => {
    reset = true;
    game.destroy();
    document.getElementById('checkboxland').replaceChildren();
    reset_btn.style.display = 'none';
    menu.style.display = 'initial';
    scoreTable.style.display = 'initial';
    insertNewScores(names.first.innerText, names.first.getAttribute('score'), names.second.innerText, names.second.getAttribute('score'));
    names.first.innerText = '';
    names.second.innerText = '';
    names.first.setAttribute('score', '');
    names.second.setAttribute('score', '');
    document.activeElement.blur();
});

/**
 * Starts the game when the start button is clicked.
 */
start_btn.addEventListener('click', () => {
    menu.style.display = 'none';
    scoreTable.style.display = 'none';
    names.first.innerText = menu.nameOne.value;
    names.second.innerText = menu.nameTwo.value;
    names.first.setAttribute('score', 0);
    names.second.setAttribute('score', 0);
    reset_btn.style.display = 'initial';
    document.activeElement.blur();

    // Enables keyboard input.
    document.addEventListener('keydown', game.onKeyDown, true);

    // Initializes the game.
    game.init(menu.xsize.value, menu.ysize.value,
        menu.multiplayer.checked,
        menu.difficulty.value
    );

    // The begining proper.
    window.requestAnimationFrame(main);
});
