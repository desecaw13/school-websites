class Checkboxland {
  constructor(props = {}) {
    if (typeof props.fillValue !== 'undefined') _checkForValidValue(props.fillValue);
    this.displayEl = document.querySelector(props.selector || '#checkboxland');
    this.dimensions = _textDimensionsToArray(props.dimensions || '8x8'); // The data object. Don't access this directly. Use methods like getData() and setData() instead.
    // Maybe we can restrict access to this variable in the future, using Proxies. See examples here:
    // https://github.com/bryanbraun/music-box-fun/commit/f399255261e9b8ab9fb8c10edbbedd55a639e9d1

    this._data = this.getEmptyMatrix({
      fillValue: props.fillValue || 0 });


    _createInitialCheckboxDisplay(this.displayEl, this._data);
  }

  getCheckboxValue(x, y) {
    const isWithinDisplay = x >= 0 && y >= 0 && x < this.dimensions[0] && y < this.dimensions[1];

    if (!isWithinDisplay) {
      throw new Error(`The location (x: ${x}, y: ${y}) is outside of this checkbox display`);
    }

    return this._data[y][x];
  }

  setCheckboxValue(x, y, newValue) {
    const isWithinDisplay = x >= 0 && y >= 0 && x < this.dimensions[0] && y < this.dimensions[1];

    _checkForValidValue(newValue);

    if (!isWithinDisplay) return;
    this._data[y][x] = newValue; // We can assume the checkboxEl exists because it's within the display.

    const checkboxEl = this.displayEl.children[y].children[x]; // Handle indeterminate newValues

    if (newValue === 2) {
      if (checkboxEl.indeterminate) return;
      checkboxEl.indeterminate = true; // The indeterminate state masks the checked state, so we always
      // uncheck indeterminate checkboxes to prevent weird state combinations.

      checkboxEl.checked = false;
    } // Handle non-indeterminate newValues
    else {
        // Remove any previously set indeterminate values.
        if (checkboxEl.indeterminate) {
          checkboxEl.indeterminate = false;
        } // If the checkbox value matches, then we don't need to update it.


        if (checkboxEl.checked === Boolean(newValue)) return;
        checkboxEl.checked = Boolean(newValue);
      }
  }

  getData() {
    const clonedData = this._data.map(row => row.slice());

    return clonedData;
  }

  setData(data, options = {}) {
    const {
      x = 0,
      y = 0,
      fillValue } =
    options;
    const isFillValueProvided = typeof fillValue !== 'undefined';
    const colNum = this.dimensions[0];
    const rowNum = this.dimensions[1];

    _checkForValidMatrix(data);

    for (let rowIndex = 0; rowIndex < rowNum; rowIndex++) {
      for (let colIndex = 0; colIndex < colNum; colIndex++) {
        let isBeforeStartingXPos = colIndex < x;
        let isBeforeStartingYPos = rowIndex < y;
        let isBeyondProvidedXPlusData = colIndex >= x + data[0].length;
        let isBeyondProvidedYPlusData = rowIndex >= y + data.length;
        let isOutsideOfProvidedData = isBeforeStartingXPos || isBeforeStartingYPos || isBeyondProvidedXPlusData || isBeyondProvidedYPlusData;
        if (isOutsideOfProvidedData && !isFillValueProvided) continue;
        let valueToSet = isOutsideOfProvidedData ? fillValue : data[rowIndex - y][colIndex - x];
        this.setCheckboxValue(colIndex, rowIndex, valueToSet);
      }
    }
  }

  clearData() {
    const emptyMatrix = this.getEmptyMatrix();
    this.setData(emptyMatrix);
  } // This kind of method makes more sense as a plugin but I needed to
  // use it in the core library anyways so I decided to expose it here.


  getEmptyMatrix(options = {}) {
    const {
      fillValue = 0,
      width = this.dimensions[0],
      height = this.dimensions[1] } =
    options;
    const matrix = [];

    for (let i = 0; i < height; i++) {
      matrix[i] = [];

      for (let j = 0; j < width; j++) {
        matrix[i][j] = fillValue;
      }
    }

    return matrix;
  }

  static extend(pluginObj = {}) {
    const {
      name,
      exec,
      cleanUp } =
    pluginObj;

    if (!name || !exec) {
      throw new Error('Your plugin must have a "name" and an "exec" function.');
    }

    if (cleanUp) {
      exec.cleanUp = cleanUp;
    }

    this.prototype[name] = exec;
  }}

// Private helper functions

function _checkForValidValue(value) {
  if (value === 0 || value === 1 || value === 2) return;
  throw new Error(`${value} is not a valid checkbox value.`);
}

function _checkForValidMatrix(matrix) {
  if (Array.isArray(matrix) && Array.isArray(matrix[0])) return;
  throw new Error(`${matrix} is not a valid matrix.`);
}

function _textDimensionsToArray(textDimensions) {
  const errorMessage = 'The dimensions you provided are invalid.';
  if (typeof textDimensions !== 'string') throw new Error(errorMessage);
  const dimArray = textDimensions.split('x').map(val => Number(val));
  const isValid = dimArray.length === 2 && !isNaN(dimArray[0]) && !isNaN(dimArray[0]);
  if (!isValid) throw new Error(errorMessage);
  return textDimensions.split('x').map(val => Number(val));
}

function _createInitialCheckboxDisplay(displayEl, data) {
  displayEl.innerHTML = '';
  displayEl.style.overflowX = 'auto';
  displayEl.setAttribute('aria-hidden', true);
  data.forEach(rowData => {
    const rowEl = document.createElement('div');
    rowEl.style.lineHeight = 0.75;
    rowEl.style.whiteSpace = 'nowrap';
    rowData.forEach(cellData => {
      const checkboxEl = document.createElement('input');
      const indeterminateVal = cellData === 2 ? true : false;
      const checkedVal = indeterminateVal ? false : Boolean(cellData);
      checkboxEl.style.margin = 0;
      checkboxEl.style.verticalAlign = 'top';
      checkboxEl.type = 'checkbox';
      checkboxEl.tabIndex = '-1';
      checkboxEl.checked = checkedVal;
      checkboxEl.indeterminate = indeterminateVal;
      rowEl.appendChild(checkboxEl);
    });
    displayEl.appendChild(rowEl);
  });
}

const fiveBySeven = {
  '0': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 1, 1], [1, 0, 1, 0, 1], [1, 1, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  '1': [[0, 1, 0], [1, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [1, 1, 1]],
  '2': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [0, 0, 0, 0, 1], [0, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
  '3': [[1, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 1, 0], [0, 0, 1, 1, 0], [0, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  '4': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1]],
  '5': [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [0, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  '6': [[0, 0, 1, 1, 0], [0, 1, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  '7': [[1, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 0]],
  '8': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  '9': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 1, 0], [0, 1, 1, 0, 0]],
  ':': [[0], [1], [0], [0], [0], [1], [0]],
  ' ': [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
  'A': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'B': [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0]],
  'C': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  'D': [[1, 1, 1, 0, 0], [1, 0, 0, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 1, 0], [1, 1, 1, 0, 0]],
  'E': [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
  'F': [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]],
  'G': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 0], [1, 0, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 1]],
  'H': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'I': [[1, 1, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [1, 1, 1]],
  'J': [[0, 0, 1, 1, 1], [0, 0, 0, 1, 0], [0, 0, 0, 1, 0], [0, 0, 0, 1, 0], [0, 0, 0, 1, 0], [1, 0, 0, 1, 0], [0, 1, 1, 0, 0]],
  'K': [[1, 0, 0, 0, 1], [1, 0, 0, 1, 0], [1, 0, 1, 0, 0], [1, 1, 0, 0, 0], [1, 0, 1, 0, 0], [1, 0, 0, 1, 0], [1, 0, 0, 0, 1]],
  'L': [[1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
  'M': [[1, 0, 0, 0, 1], [1, 1, 0, 1, 1], [1, 0, 1, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'N': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'O': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  'P': [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]],
  'Q': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 1, 0], [0, 1, 1, 0, 1]],
  'R': [[1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'S': [[0, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1], [1, 1, 1, 1, 0]],
  'T': [[1, 1, 1, 1, 1], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0]],
  'U': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  'V': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0]],
  'W': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 1, 0, 1], [0, 1, 0, 1, 0]],
  'X': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'Y': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0]],
  'Z': [[1, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
  'a': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 1], [0, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1]],
  'b': [[1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 1, 1, 0], [1, 1, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 0]],
  'c': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  'd': [[0, 0, 0, 0, 1], [0, 0, 0, 0, 1], [0, 1, 1, 0, 1], [1, 0, 0, 1, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 1]],
  'e': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [0, 1, 1, 1, 0]],
  'f': [[0, 0, 1, 1, 0], [0, 1, 0, 0, 1], [0, 1, 0, 0, 0], [1, 1, 1, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 0]],
  'g': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  'h': [[1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 1, 1, 0], [1, 1, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'i': [[0, 1, 0], [0, 0, 0], [1, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [1, 1, 1]],
  'j': [[0, 0, 0, 1], [0, 0, 0, 0], [0, 0, 1, 1], [0, 0, 0, 1], [0, 0, 0, 1], [1, 0, 0, 1], [0, 1, 1, 0]],
  'k': [[1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 1], [1, 0, 1, 0], [1, 1, 0, 0], [1, 0, 1, 0], [1, 0, 0, 1]],
  'l': [[1, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [1, 1, 1]],
  'm': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 1, 0, 1, 0], [1, 0, 1, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'n': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 0, 1, 1, 0], [1, 1, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1]],
  'o': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  'p': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]],
  'q': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 1, 1, 0, 1], [1, 0, 0, 1, 1], [1, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1]],
  'r': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 0, 1, 1, 0], [1, 1, 0, 0, 1], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0], [1, 0, 0, 0, 0]],
  's': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [1, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 1], [1, 1, 1, 1, 0]],
  't': [[0, 1, 0, 0, 0], [0, 1, 0, 0, 0], [1, 1, 1, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 1], [0, 0, 1, 1, 0]],
  'u': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 1, 1], [0, 1, 1, 0, 1]],
  'v': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0]],
  'w': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 1, 0, 1], [0, 1, 0, 1, 0]],
  'x': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 1, 0], [1, 0, 0, 0, 1]],
  'y': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
  'z': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [0, 0, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 0, 0], [1, 1, 1, 1, 1]],
  '`': [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
  '~': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 1, 0, 0, 0], [1, 0, 1, 0, 1], [0, 0, 0, 1, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
  '!': [[1], [1], [1], [1], [1], [0], [1]],
  '@': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [0, 0, 0, 0, 1], [0, 1, 1, 0, 1], [1, 0, 1, 0, 1], [1, 0, 1, 0, 1], [0, 1, 1, 1, 0]],
  '#': [[0, 1, 0, 1, 0], [0, 1, 0, 1, 0], [1, 1, 1, 1, 1], [0, 1, 0, 1, 0], [1, 1, 1, 1, 1], [0, 1, 0, 1, 0], [0, 1, 0, 1, 0]],
  '$': [[0, 0, 1, 0, 0], [0, 1, 1, 1, 1], [1, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 1], [1, 1, 1, 1, 0], [0, 0, 1, 0, 0]],
  '%': [[1, 1, 0, 0, 1], [1, 1, 0, 0, 1], [0, 0, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 0, 0], [1, 0, 0, 1, 1], [1, 0, 0, 1, 1]],
  '^': [[0, 0, 1, 0, 0], [0, 1, 0, 1, 0], [1, 0, 0, 0, 1], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
  '&': [[0, 1, 1, 0, 0], [1, 0, 0, 1, 0], [1, 0, 1, 0, 0], [0, 1, 0, 0, 0], [1, 0, 1, 0, 1], [1, 0, 0, 1, 0], [1, 1, 1, 0, 1]],
  '*': [[0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [1, 0, 1, 0, 1], [0, 1, 1, 1, 0], [1, 0, 1, 0, 1], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0]],
  '(': [[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]],
  ')': [[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 1, 0], [1, 0, 0]],
  '-': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
  '_': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
  '+': [[0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [1, 1, 1, 1, 1], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0]],
  '=': [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]],
  '[': [[1, 1, 1], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 1, 1]],
  ']': [[1, 1, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [1, 1, 1]],
  '{': [[0, 0, 1], [0, 1, 0], [0, 1, 0], [1, 0, 0], [0, 1, 0], [0, 1, 0], [0, 0, 1]],
  '}': [[1, 0, 0], [0, 1, 0], [0, 1, 0], [0, 0, 1], [0, 1, 0], [0, 1, 0], [1, 0, 0]],
  '|': [[1], [1], [1], [1], [1], [1], [1]],
  '\\': [[1, 0, 0], [1, 0, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 0, 1], [0, 0, 1]],
  '/': [[0, 0, 1], [0, 0, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0], [1, 0, 0], [1, 0, 0]],
  ';': [[0, 0], [0, 1], [0, 1], [0, 0], [0, 0], [0, 1], [1, 0]],
  '"': [[1, 0, 1], [1, 0, 1], [1, 0, 1], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
  "'": [[1, 1], [0, 1], [1, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
  ',': [[0, 0], [0, 0], [0, 0], [0, 0], [1, 1], [0, 1], [1, 0]],
  '.': [[0], [0], [0], [0], [0], [0], [1]],
  '<': [[0, 0, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, 0]],
  '>': [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 1, 0], [1, 0, 0], [0, 0, 0]],
  '?': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [0, 0, 0, 0, 1], [0, 0, 0, 1, 0], [0, 0, 1, 0, 0], [0, 0, 0, 0, 0], [0, 0, 1, 0, 0]] };


function print(text, options = {}) {
  const {
    dataOnly = false,
    font = fiveBySeven,
    x = 0,
    y = 0,
    fillValue } =
  options;
  const isFillValueProvided = typeof fillValue !== 'undefined';
  const textArray = text.split('');
  const textMatrix = textArray.reduce((matrix, currentChar) => {
    const currentCharacterMatrix = font[currentChar];
    return _matrixConcat(matrix, currentCharacterMatrix);
  }, []); // Handle an edge-case where an empty string produces an empty
  // array instead of an empty matrix (which is what we'd prefer).

  if (textMatrix.length === 0) {
    textMatrix.push([]);
  }

  if (dataOnly) {
    if (!isFillValueProvided) return textMatrix;
    let dataMatrix = this.getEmptyMatrix({
      fillValue });

    textMatrix.forEach((rowData, rowIndex) => {
      rowData.forEach((cellValue, cellIndex) => {
        dataMatrix[rowIndex + y][cellIndex + x] = cellValue;
      });
    });
    return dataMatrix;
  }

  this.setData(textMatrix, {
    x,
    y,
    fillValue });

} // HELPER FUNCTIONS


function _matrixConcat(mat1, mat2) {
  if (mat1.length === 0) return mat2;
  const newMatrix = [];
  mat1.forEach((row, index) => {
    // We go row by row, concatenating mat1 to mat2.
    newMatrix.push( // the [0] puts a spacer between the two characters.
    row.concat([0]).concat(mat2[index]));
  });
  return newMatrix;
}

var print$1 = {
  name: 'print',
  exec: print };


let intervalId;

function marquee(newData, options = {}) {
  const {
    interval = 200,
    repeat = false,
    fillValue = 0,
    callback = () => {} } =
  options;
  const numberOfRows = this.dimensions[1];
  const numberOfColumns = this.dimensions[0];
  const totalIterations = numberOfColumns + newData[0].length;
  let currentIteration = 1;
  intervalId = setInterval(() => {
    const currentData = this.getData();

    for (let y = 0; y < numberOfRows; y++) {
      for (let x = 0; x < numberOfColumns; x++) {
        const finalColumn = x + 1 === numberOfColumns; // We only draw fresh checkboxes on the final column of the grid.
        // All other values simply get shifted to the left.

        if (finalColumn) {
          // Pull the value from newData. If this location in newData is undefined,
          // we assign a fillValue to fill the space until the animation is complete.
          const sourceColumnToDraw = currentIteration - (numberOfColumns - x);
          const newDataValue = !newData[y] ? fillValue : typeof newData[y][sourceColumnToDraw] === 'undefined' ? fillValue : newData[y][sourceColumnToDraw];
          this.setCheckboxValue(x, y, newDataValue);
        } else {
          // Shift an existing value to the left.
          this.setCheckboxValue(x, y, currentData[y][x + 1]);
        }
      }
    }

    if (currentIteration === totalIterations) {
      if (repeat) {
        currentIteration = 1;
      } else {
        clearInterval(intervalId);
        callback();
      }
    } else {
      currentIteration++;
    }
  }, interval);
}

function cleanUp() {
  clearInterval(intervalId);
}

var marquee$1 = {
  name: 'marquee',
  exec: marquee,
  cleanUp: cleanUp };


let intervalId$1;

function transitionWipe(newData, options = {}) {
  const {
    interval = 200,
    fillValue = 0,
    direction = 'ltr',
    callback = () => {} } =
  options;
  const numberOfRows = this.dimensions[1];
  const numberOfColumns = this.dimensions[0];
  const totalIterations = numberOfColumns + 1;
  let currentIteration = 1;
  intervalId$1 = setInterval(() => {
    let leadingEdgeIndex, writingEdgeIndex;

    switch (direction) {
      case 'ltr':
        leadingEdgeIndex = currentIteration - 1;
        writingEdgeIndex = leadingEdgeIndex - 1;
        break;

      case 'rtl':
        leadingEdgeIndex = numberOfColumns - currentIteration;
        writingEdgeIndex = leadingEdgeIndex + 1;
        break;}


    for (let y = 0; y < numberOfRows; y++) {
      for (let x = 0; x < numberOfColumns; x++) {
        // we only need to write to locations on the leading edge, or one spot
        // behind the leading edge. The values in all other locations stay the same.
        if (x === leadingEdgeIndex) {
          this.setCheckboxValue(x, y, 1);
        } else if (x === writingEdgeIndex) {
          // Pull the value from newData. If this location in newData is undefined,
          // we assign a fillValue to fill the space until the animation is complete.
          let newDataValue = !newData[y] ? fillValue : typeof newData[y][x] === 'undefined' ? fillValue : newData[y][x];
          this.setCheckboxValue(x, y, newDataValue);
        }
      }
    }

    if (currentIteration === totalIterations) {
      clearInterval(intervalId$1);
      callback();
    } else {
      currentIteration++;
    }
  }, interval);
}

function cleanUp$1() {
  clearInterval(intervalId$1);
}

var transitionWipe$1 = {
  name: 'transitionWipe',
  exec: transitionWipe,
  cleanUp: cleanUp$1 };


function dataUtils(actionName, matrix, options) {
  const actions = {
    invert,
    pad };

  return actions[actionName](matrix, options);
}

function invert(matrix) {
  return matrix.map(row => {
    return row.map(value => {
      return value ? 0 : 1;
    });
  });
}

function pad(matrix, options = {}) {
  const isPaddingAllSidesEqually = Number.isInteger(options.all);
  const topPadding = isPaddingAllSidesEqually ? options.all : options.top;
  const rightPadding = isPaddingAllSidesEqually ? options.all : options.right;
  const bottomPadding = isPaddingAllSidesEqually ? options.all : options.bottom;
  const leftPadding = isPaddingAllSidesEqually ? options.all : options.left; // Create a new matrix with left and right padding.

  let newMatrix = matrix.map(row => {
    let newRow = row;

    if (leftPadding) {
      newRow = [...Array(leftPadding).fill(0), ...newRow];
    }

    if (rightPadding) {
      newRow = [...newRow, ...Array(rightPadding).fill(0)];
    }

    return newRow;
  }); // Set up to add top and bottom padding.

  const newRowLength = newMatrix[0].length;

  const buildPaddingRows = (numberOfRows, rowLength) => {
    const paddingRows = [];

    for (let i = 0; i < numberOfRows; i++) {
      paddingRows.push(Array(rowLength).fill(0));
    }

    return paddingRows;
  };

  if (topPadding) {
    newMatrix = [...buildPaddingRows(topPadding, newRowLength), ...newMatrix];
  }

  if (bottomPadding) {
    newMatrix = [...newMatrix, ...buildPaddingRows(bottomPadding, newRowLength)];
  }

  return newMatrix;
}

var dataUtils$1 = {
  name: 'dataUtils',
  exec: dataUtils };


let handleFun = null;
let displayEl = null;

function onClick(callback) {
  displayEl = this.displayEl;
  handleFun = handleEvent.bind(this, callback);
  displayEl.addEventListener('click', handleFun);
}

function handleEvent(callback, event) {
  const coords = findCoodrs(displayEl, event.target);

  if (!coords) {
    return;
  }

  const result = {
    x: coords.x,
    y: coords.y,
    checkbox: event.target };


  if (typeof callback == 'function') {
    callback(result);
  } else if ('handleEvent' in callback && typeof callback.handleEvent == 'function') {
    callback.handleEvent(result);
  } else {
    throw new TypeError('Callback should be a function or an EventListener object');
  }
}

function findCoodrs(root, target) {
  for (let y = 0; y < root.children.length; y += 1) {
    const div = root.children[y];

    for (let x = 0; x < div.children.length; x += 1) {
      const checkbox = div.children[x];

      if (checkbox === target) {
        return {
          x,
          y };

      }
    }
  }

  return null;
}

function cleanUp$2() {
  displayEl.removeEventListener('click', handleFun);
}

var onClick$1 = {
  name: 'onClick',
  exec: onClick,
  cleanUp: cleanUp$2 };


// Dithering algorithms pulled from https://github.com/danielepiccone/ditherjs.
// Default rgb colors for our dithering pallet (see https://github.com/danielepiccone/ditherjs#usage-and-options)
// The first color is "checkbox blue" and the second is white.
const PALLET = [[60, 136, 253], [255, 255, 255]];
function orderedDither({
  uint8data,
  palette = PALLET,
  step = 1,
  h,
  w })
{
  var d = new Uint8ClampedArray(uint8data);
  var ratio = 3;
  var m = new Array([1, 9, 3, 11], [13, 5, 15, 7], [4, 12, 2, 10], [16, 8, 14, 6]);
  var r, g, b, i, color, approx, tr, tg, tb, dx, dy, di;

  for (var y = 0; y < h; y += step) {
    for (var x = 0; x < w; x += step) {
      i = 4 * x + 4 * y * w; // Define bytes

      r = i;
      g = i + 1;
      b = i + 2;
      d[r] += m[x % 4][y % 4] * ratio;
      d[g] += m[x % 4][y % 4] * ratio;
      d[b] += m[x % 4][y % 4] * ratio;
      color = new Array(d[r], d[g], d[b]);
      approx = approximateColor(color, palette);
      tr = approx[0];
      tg = approx[1];
      tb = approx[2]; // Draw a block

      for (dx = 0; dx < step; dx++) {
        for (dy = 0; dy < step; dy++) {
          di = i + 4 * dx + 4 * w * dy; // Draw pixel

          d[di] = tr;
          d[di + 1] = tg;
          d[di + 2] = tb;
        }
      }
    }
  }

  return d;
}
function atkinsonDither({
  uint8data,
  palette = PALLET,
  step = 1,
  h,
  w })
{
  var d = new Uint8ClampedArray(uint8data);
  var out = new Uint8ClampedArray(uint8data);
  var ratio = 1 / 8;

  var $i = function (x, y) {
    return 4 * x + 4 * y * w;
  };

  var r, g, b, q, i, color, approx, tr, tg, tb, dx, dy, di;

  for (var y = 0; y < h; y += step) {
    for (var x = 0; x < w; x += step) {
      i = 4 * x + 4 * y * w; // Define bytes

      r = i;
      g = i + 1;
      b = i + 2;
      color = new Array(d[r], d[g], d[b]);
      approx = approximateColor(color, palette);
      q = [];
      q[r] = d[r] - approx[0];
      q[g] = d[g] - approx[1];
      q[b] = d[b] - approx[2]; // Diffuse the error for three colors

      d[$i(x + step, y) + 0] += ratio * q[r];
      d[$i(x - step, y + step) + 0] += ratio * q[r];
      d[$i(x, y + step) + 0] += ratio * q[r];
      d[$i(x + step, y + step) + 0] += ratio * q[r];
      d[$i(x + 2 * step, y) + 0] += ratio * q[r];
      d[$i(x, y + 2 * step) + 0] += ratio * q[r];
      d[$i(x + step, y) + 1] += ratio * q[g];
      d[$i(x - step, y + step) + 1] += ratio * q[g];
      d[$i(x, y + step) + 1] += ratio * q[g];
      d[$i(x + step, y + step) + 1] += ratio * q[g];
      d[$i(x + 2 * step, y) + 1] += ratio * q[g];
      d[$i(x, y + 2 * step) + 1] += ratio * q[g];
      d[$i(x + step, y) + 2] += ratio * q[b];
      d[$i(x - step, y + step) + 2] += ratio * q[b];
      d[$i(x, y + step) + 2] += ratio * q[b];
      d[$i(x + step, y + step) + 2] += ratio * q[b];
      d[$i(x + 2 * step, y) + 2] += ratio * q[b];
      d[$i(x, y + 2 * step) + 2] += ratio * q[b];
      tr = approx[0];
      tg = approx[1];
      tb = approx[2]; // Draw a block

      for (dx = 0; dx < step; dx++) {
        for (dy = 0; dy < step; dy++) {
          di = i + 4 * dx + 4 * w * dy; // Draw pixel

          out[di] = tr;
          out[di + 1] = tg;
          out[di + 2] = tb;
        }
      }
    }
  }

  return out;
}
function errorDiffusionDither({
  uint8data,
  palette = PALLET,
  step = 1,
  h,
  w })
{
  var d = new Uint8ClampedArray(uint8data);
  var out = new Uint8ClampedArray(uint8data);
  var ratio = 1 / 16;

  var $i = function (x, y) {
    return 4 * x + 4 * y * w;
  };

  var r, g, b, q, i, color, approx, tr, tg, tb, dx, dy, di;

  for (var y = 0; y < h; y += step) {
    for (var x = 0; x < w; x += step) {
      i = 4 * x + 4 * y * w; // Define bytes

      r = i;
      g = i + 1;
      b = i + 2;
      color = new Array(d[r], d[g], d[b]);
      approx = approximateColor(color, palette);
      q = [];
      q[r] = d[r] - approx[0];
      q[g] = d[g] - approx[1];
      q[b] = d[b] - approx[2]; // Diffuse the error

      d[$i(x + step, y)] = d[$i(x + step, y)] + 7 * ratio * q[r];
      d[$i(x - step, y + 1)] = d[$i(x - 1, y + step)] + 3 * ratio * q[r];
      d[$i(x, y + step)] = d[$i(x, y + step)] + 5 * ratio * q[r];
      d[$i(x + step, y + step)] = d[$i(x + 1, y + step)] + 1 * ratio * q[r];
      d[$i(x + step, y) + 1] = d[$i(x + step, y) + 1] + 7 * ratio * q[g];
      d[$i(x - step, y + step) + 1] = d[$i(x - step, y + step) + 1] + 3 * ratio * q[g];
      d[$i(x, y + step) + 1] = d[$i(x, y + step) + 1] + 5 * ratio * q[g];
      d[$i(x + step, y + step) + 1] = d[$i(x + step, y + step) + 1] + 1 * ratio * q[g];
      d[$i(x + step, y) + 2] = d[$i(x + step, y) + 2] + 7 * ratio * q[b];
      d[$i(x - step, y + step) + 2] = d[$i(x - step, y + step) + 2] + 3 * ratio * q[b];
      d[$i(x, y + step) + 2] = d[$i(x, y + step) + 2] + 5 * ratio * q[b];
      d[$i(x + step, y + step) + 2] = d[$i(x + step, y + step) + 2] + 1 * ratio * q[b]; // Color

      tr = approx[0];
      tg = approx[1];
      tb = approx[2]; // Draw a block

      for (dx = 0; dx < step; dx++) {
        for (dy = 0; dy < step; dy++) {
          di = i + 4 * dx + 4 * w * dy; // Draw pixel

          out[di] = tr;
          out[di + 1] = tg;
          out[di + 2] = tb;
        }
      }
    }
  }

  return out;
} // Color distance helpers, which are referenced in several of the algorithms.

function approximateColor(color, palette) {
  function colorDistance(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2) + Math.pow(a[2] - b[2], 2));
  }

  function findIndex(fun, arg, list, min) {
    if (list.length == 2) {
      if (fun(arg, min) <= fun(arg, list[1])) {
        return min;
      } else {
        return list[1];
      }
    } else {
      var tl = list.slice(1);

      if (fun(arg, min) <= fun(arg, list[1])) {
        min = min;
      } else {
        min = list[1];
      }

      return findIndex(fun, arg, tl, min);
    }
  }
  var foundColor = findIndex(colorDistance, color, palette, palette[0]);
  return foundColor;
}

function blackAndWhiteThreshold(rgbaImageData, threshold) {
  // These toGrayScale function values were borrowed from here:
  // https://www.jonathan-petitcolas.com/2017/12/28/converting-image-to-ascii-art.html#turning-an-image-into-gray-colors
  const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;

  const grayscaleThreshold = threshold / 100 * 255;

  for (let i = 0; i < rgbaImageData.length; i += 4) {
    // convert pixel to grayscale
    const r = rgbaImageData[i];
    const g = rgbaImageData[i + 1];
    const b = rgbaImageData[i + 2];
    const grayScaleVal = toGrayScale(r, g, b); // convert to black/white, based on the threshold

    const thresholdedVal = grayScaleVal > grayscaleThreshold ? 255 : 0; // set the thresholded values into the array

    rgbaImageData[i] = thresholdedVal;
    rgbaImageData[i + 1] = thresholdedVal;
    rgbaImageData[i + 2] = thresholdedVal; // Note: we currently ignore the transparency value;
  }

  return rgbaImageData;
} // copied with adjustments from https://gist.github.com/mikecao/65d9fc92dc7197cb8a7c

function sharpen(context, imageData, mix) {
  const w = imageData.width;
  const h = imageData.height;
  const srcBuff = imageData.data;
  const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  const katet = Math.round(Math.sqrt(weights.length));
  const half = katet * 0.5 | 0;
  const dstData = context.createImageData(w, h);
  const dstBuff = dstData.data;

  for (let y = h; y >= 0; y--) {
    for (let x = w; x >= 0; x--) {
      const sy = y;
      const sx = x;
      const dstOff = (y * w + x) * 4;
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      for (let cy = 0; cy < katet; cy++) {
        for (let cx = 0; cx < katet; cx++) {
          const scy = sy + cy - half;
          const scx = sx + cx - half;

          if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
            const srcOff = (scy * w + scx) * 4;
            const wt = weights[cy * katet + cx];
            r += srcBuff[srcOff] * wt;
            g += srcBuff[srcOff + 1] * wt;
            b += srcBuff[srcOff + 2] * wt;
            a += srcBuff[srcOff + 3] * wt;
          }
        }
      }

      dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
      dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
      dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
      dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
    }
  } // fix first column by just copying original data... dumb but works


  for (let y = h; y >= 0; y--) {
    const x = 0;
    const dstOff = (y * w + x) * 4;
    dstBuff[dstOff] = srcBuff[dstOff];
    dstBuff[dstOff + 1] = srcBuff[dstOff + 1];
    dstBuff[dstOff + 2] = srcBuff[dstOff + 2];
    dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
  }

  return dstBuff;
}

let canvasEl;
let context;
function renderMediaAsCheckboxes(element, options = {}, checkboxland) {
  if (!canvasEl) {
    canvasEl = document.createElement('canvas');
    context = canvasEl.getContext('2d');
  } // Create a tiny canvas. Each pixel on the canvas will represent a checkbox.


  canvasEl.width = checkboxland.dimensions[0];
  canvasEl.height = checkboxland.dimensions[1]; // Clear the canvas before applying a new image. We use a white rectangle
  // in order for PNGs with transparency to appear over a white background
  // (which seems to be most appropriate in the use-cases I can think of).

  context.fillStyle = 'white';
  context.fillRect(0, 0, canvasEl.width, canvasEl.height); // Determine the ideal dimensions for our media, such that it fills
  // as much of the checkbox grid as possible without overflowing.

  const [mediaWidth, mediaHeight] = getMediaDimensions(element);
  const [width, height] = clampDimensions(mediaWidth, mediaHeight, canvasEl.width, canvasEl.height); // Draw the original image on the tiny canvas (`drawImage` will scale the
  // image as needed to make it fit the canvas).

  context.drawImage(element, 0, 0, width, height); // Loop over the canvas pixels and apply an image algorithm (like dithering or thresholding).

  const imageData = applyImageAlgorithm(context, width, height, options);
  const checkboxMatrix = convertImageDataToCheckboxMatrix(imageData);
  checkboxland.setData(checkboxMatrix, options);
}

function getMediaDimensions(mediaEl) {
  let width = 0,
  height = 0;

  switch (mediaEl.tagName) {
    case 'IMG':
      width = mediaEl.width;
      height = mediaEl.height;
      break;

    case 'VIDEO':
      width = mediaEl.videoWidth;
      height = mediaEl.videoHeight;
      break;}


  return [width, height];
}

function clampDimensions(imageWidth, imageHeight, canvasWidth, canvasHeight) {
  const heightRatio = imageHeight / canvasHeight;
  const widthRatio = imageWidth / canvasWidth; // If the image is unconstrained (ie. very small images), return the dimensions as-is.

  if (heightRatio < 1 && widthRatio < 1) {
    return [imageWidth, imageHeight];
  }

  const getDimensionsClampedByHeight = () => {
    const reducedWidth = Math.floor(imageWidth * canvasHeight / imageHeight);
    return [reducedWidth, canvasHeight];
  };

  const getDimensionsClampedByWidth = () => {
    const reducedHeight = Math.floor(imageHeight * canvasWidth / imageWidth);
    return [canvasWidth, reducedHeight];
  }; // Determine the most constrained dimension, and clamp accordingly.


  return heightRatio > widthRatio ? getDimensionsClampedByHeight() : getDimensionsClampedByWidth();
}

function applyImageAlgorithm(context, width, height, options) {
  const {
    threshold = 50,
    dithering = 'none' } =
  options;
  let imageData = context.getImageData(0, 0, width, height),
  imageUint8data;
  const algorithms = {
    'ordered': orderedDither,
    'atkinson': atkinsonDither,
    'errorDiffusion': errorDiffusionDither };


  if (dithering === 'none') {
    imageUint8data = blackAndWhiteThreshold(imageData.data, threshold);
  } else {
    // Use "sharpen" as a way of applying a threshold value to dithered approaches.
    imageUint8data = sharpen(context, imageData, threshold / 100);
    imageUint8data = algorithms[dithering]({
      uint8data: imageUint8data,
      w: width,
      h: height });

  }

  imageData.data.set(imageUint8data);
  return imageData;
}

function convertImageDataToCheckboxMatrix(imageData) {
  const checkboxMatrix = [];
  const width = imageData.width;

  for (let i = 0; i < imageData.data.length; i += 4) {
    const pixelNum = i / 4;
    const rowNumber = Math.floor(pixelNum / width);
    const rowIndex = pixelNum % width;

    if (rowIndex === 0) {
      checkboxMatrix[rowNumber] = [];
    }

    checkboxMatrix[rowNumber][rowIndex] = imageData.data[i] === 255 ? 0 : 1;
  }

  return checkboxMatrix;
}

function renderImage(dataSource, options) {
  const checkboxland = this;
  let imageEl; // FOR PASSING A URL TO AN IMAGE

  if (typeof dataSource === 'string') {
    imageEl = new Image();
    imageEl.crossOrigin = 'anonymous'; // allow cross-origin loading.

    imageEl.addEventListener('load', () => renderMediaAsCheckboxes(imageEl, options, checkboxland), {
      once: true });

    imageEl.src = dataSource;
  } else // FOR PASSING AN <IMG> ELEMENT
    if (typeof dataSource === 'object') {
      if (dataSource.complete) {
        renderMediaAsCheckboxes(dataSource, options, checkboxland);
      } else {
        dataSource.addEventListener('load', () => renderMediaAsCheckboxes(dataSource, options, checkboxland), {
          once: true });

      }
    }
}

var renderImage$1 = {
  name: 'renderImage',
  exec: renderImage };


let refreshId;

function renderVideo(dataSource, options) {
  const checkboxland = this;
  let videoEl; // FOR PASSING A URL TO A VIDEO

  if (typeof dataSource === 'string') {
    videoEl = document.createElement("video");
    videoEl.loop = true;
    videoEl.controls = true;
    videoEl.autoplay = true;
    videoEl.muted = true; // enables autoplay on iOS

    videoEl.crossOrigin = 'anonymous'; // allow cross-origin loading.

    videoEl.addEventListener('loadeddata', () => {
      videoEl.play();
      setVideoRenderLoop(videoEl, options, checkboxland);
    }, {
      once: true });

    videoEl.src = dataSource;
  } else // FOR PASSING A <VIDEO> ELEMENT
    if (typeof dataSource === 'object') {
      if (dataSource.readyState === 4) {
        setVideoRenderLoop(dataSource, options, checkboxland);
      } else {
        dataSource.addEventListener('loadeddata', () => setVideoRenderLoop(dataSource, options, checkboxland), {
          once: true });

      }
    }
}

function setVideoRenderLoop(videoElement, options, checkboxland) {
  renderMediaAsCheckboxes(videoElement, options, checkboxland);
  refreshId = requestAnimationFrame(() => setVideoRenderLoop(videoElement, options, checkboxland));
}

function cleanUp$3() {
  cancelAnimationFrame(refreshId);
}

var renderVideo$1 = {
  name: 'renderVideo',
  exec: renderVideo,
  cleanUp: cleanUp$3 };


Checkboxland.extend(print$1);
Checkboxland.extend(marquee$1);
Checkboxland.extend(transitionWipe$1);
Checkboxland.extend(dataUtils$1);
Checkboxland.extend(onClick$1);
Checkboxland.extend(renderImage$1);
Checkboxland.extend(renderVideo$1);

export { Checkboxland };