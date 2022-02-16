// For bouncing.

/**
 * Represents a ball.
 */
export default class Ball {
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
     * Length of the radius of the ball.
     * @type {number}
     */
    #radius;

    /**
     * Vector representing the ball's direction.
     */
    direction = { x: 0, y: 0 };

    /**
     * Contains 2d array for drawing.
     * @type {number[][]}
     */
    #data;

    /**
     * Initializes a new ball.
     * @param {number} x The starting X position. Should be a whole number.
     * @param {number} y The starting Y position. Should be a whole number.
     * @param {number} radius The size of the ball's radius.
     */
    constructor(x, y, radius) {
        this.#X = x;
        this.#Y = y;
        this.#radius = radius;

        if (radius == 1) {
            this.#data = [[1]];
        } else if (radius == 2) {
            this.#data = [[1, 1], [1, 1]];
        } else {
            this.#data = [];
            for (let i = 0; i < radius; i++) {
                this.#data[i] = [];
                for (let j = 0; j < radius; j++) {
                    if ((j == 0 || j == radius - 1) && (i == 0 || i == radius - 1)) {
                        this.#data[i][j] = 0;
                    } else {
                        this.#data[i][j] = 1;
                    }
                }
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
     * Length of the radius of the ball.
     */
    get radius() { return this.#radius; }

    /**
     * Returns a genarator than yields arguments for checkboxland's `setData` function.
     */
    *getData() {
        yield this.#data;
        yield { x: Math.trunc(this.#X), y: Math.trunc(this.#Y) };
    }
}
