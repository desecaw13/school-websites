"use strict";

// evil.css
let styleLink = document.getElementById("eCSS");
function evilFlip() {
    let checkBox = document.getElementById("eCB");
    if (checkBox.checked) { styleLink.disabled = false; }
    else { styleLink.disabled = true; };
}

// background animation (todo: 'breathing' effect)
let gIn = 191; //light
let gOut = 64; //dark
let i = 1;
setInterval(function () {return;
    if (gIn >= 127.5) { i = -1 } else if (gIn <= 0) { i = 1 };
    if (gOut <= 127.5) { i = -1 } else if (gOut >= 255) { i = 1 };
    document.body.style.background = `linear-gradient(rgb(${gIn},${gIn},${gIn}), rgb(${gOut},${gOut},${gOut}), rgb(${gIn},${gIn},${gIn}))`;
    gIn += i;
    gOut -= i;
}, 100);
