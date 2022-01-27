// X and Y are how many checkboxes away the upper left coner is.
// X and Y must be integers.

export default class Paddle {
    #X;
    #Y;
    #data;

    constructor(x, y, width, height) {
        this.#X = x;
        this.#Y = y;
        this.width = width;
        this.height = height;
        //todo: might want to make width and height read-only

        this.#data = [];
        for (let i = 0; i < height; i++) {
            this.#data[i] = [];
            for (let j = 0; j < width; j++) {
                this.#data[i][j] = 1;
            }
        }
    }

    get x() { return this.#X; }
    set x(v) { this.#X = v; }

    get y() { return this.#Y; }
    set y(v) { this.#Y = v; }

    *getData() {
        yield this.#data;
        //yield { x: this.x, y: this.y };
        yield { x: this.#X, y: this.#Y };
    }
}
