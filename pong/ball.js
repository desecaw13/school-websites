// see top comments in paddle.js

export default class Ball {
    #X;
    #Y;
    #radius;
    #data;
    direction = { x: 0, y: 0 };

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

    get x() { return this.#X; }
    set x(v) { this.#X = v; }

    get y() { return this.#Y; }
    set y(v) { this.#Y = v; }

    get radius() { return this.#radius; }

    /**
     * Returns a genarator than yields arguments for checkboxland's `setData` function.
     */
    *getData() {
        yield this.#data;
        yield { x: Math.trunc(this.#X), y: Math.trunc(this.#Y) };
    }
}
