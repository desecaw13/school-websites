"use strict";

// background animation
const delta = 64;
const offset = delta * 1.25;

let edges = offset; //dark
let center = 255 - offset; //light
let count = 0;
let i = 1;
setInterval(() => {
    document.body.style.background = `linear-gradient(rgb(${edges},${edges},${edges}), rgb(${center},${center},${center}), rgb(${edges},${edges},${edges}))`;

    if (count >= delta) {
        i = -1;
    } else if (count <= 0) {
        i = 1;
    }

    edges += i;
    center += i;
    count += i;
}, 200);
