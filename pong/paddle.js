// X and Y are how many checkboxes away the upper left corner is from the origin (upper left corner of cbl).

/**
 * Represents a paddle.
 */
export default class Paddle {
    #X;
    #Y;
    #data;
    #width;
    #height;

    /**
     * Initializes a new paddle. Arguments must be whole numbers.
     * @param {*} x The starting x position.
     * @param {*} y The starting y position.
     * @param {*} width The horizontal length.
     * @param {*} height The vertical length.
     */
    constructor(x, y, width, height) {
        this.#X = x;
        this.#Y = y;
        this.#width = width;
        this.#height = height;

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

    get width() { return this.#width; }

    get height() { return this.#height; }

    /**
     * Returns a genarator that yields arguments for checkboxland's `setData` function.
     */
    *getData() {
        yield this.#data;
        yield { x: this.#X, y: this.#Y };
    }
}
