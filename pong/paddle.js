
/**
 * Represents a paddle.
 */
export default class Paddle {
    /**
     * Amount of checkboxes away the upper left corner is from the origin (upper left corner of cbl).
     * @type {number}
     */
    #X;

    /**
     * Amount of checkboxes away the upper left corner is from the origin (upper left corner of cbl).
     * @type {number}
     */
    #Y;

    /**
     * The horizontal length.
     * @type {number}
     */
    #width;

    /**
     * The vertical length.
     * @type {number}
     */
    #height;

    /**
     * Contains 2d array for drawing.
     * @type {number[][]}
     */
    #data;

    /**
     * Initializes a new paddle. Arguments must be whole numbers.
     * @param {number} x The starting x position.
     * @param {number} y The starting y position.
     * @param {number} width The horizontal length.
     * @param {number} height The vertical length.
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

    /**
     * Amount of checkboxes away the upper left corner is from the origin (upper left corner of cbl).
     */
    get x() { return this.#X; }
    set x(v) { this.#X = v; }

    /**
     * Amount of checkboxes away the upper left corner is from the origin (upper left corner of cbl).
     */
    get y() { return this.#Y; }
    set y(v) { this.#Y = v; }

    /**
     * The horizontal length.
     */
    get width() { return this.#width; }

    /**
     * The vertical length.
     */
    get height() { return this.#height; }

    /**
     * Returns a genarator that yields arguments for checkboxland's `setData` function.
     */
    *getData() {
        yield this.#data;
        yield { x: this.#X, y: this.#Y };
    }
}
