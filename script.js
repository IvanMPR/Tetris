import { blocks } from './modules/blocks/blocks.js';
const board = document.querySelector('.board');
const button = document.querySelector('.btn');
const BOARD_LENGTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_ROTATIONS = 4;
const smallGrid = document.querySelector('.grid');
const clickSound = new Audio(
  './sounds/90125__pierrecartoons1979__click-tiny.wav'
);
const helper = {
  block: 0,
  rotation: 0,
  timeout: 1000,
  isFinished: false,
  position: 3,
  step: 0,
  stepLength: 10,
  array: [],
  boost: false,
  ticker: BOARD_HEIGHT,
  leftEdgeTouched: false,
  rightEdgeTouched: false,
  frame() {
    return boardSkeleton();
  },
};

function createBoard() {
  let html = '';
  for (let i = 0; i < BOARD_LENGTH * BOARD_HEIGHT; i++) {
    html += `<div class="field" data-fieldId="${i}" id="${i}"></div>`;
  }
  board.insertAdjacentHTML('beforeend', html.trim());
}

createBoard();
function createInfoBoard() {
  let html = '';
  for (let i = 0; i < 16; i++) {
    html += `<div class="field" data-fieldId="${i}{smallGrid}" id="${i}"></div>`;
  }
  smallGrid.insertAdjacentHTML('beforeend', html.trim());
}
createInfoBoard();
// helper fn to avoid typing 'document.getElementById....
const field = id => document.getElementById(id);
// helper fn to reset some helper elements after tetromino is placed
const reset = () => {
  helper.array = [];
  helper.position = 3;
  helper.step = -10;
  helper.isFinished = true;
  helper.boost = false;
  pickRandomBlock(blocks);
  checkScore(helper.frame());
  helper.isFinished = false;
};

function boardSkeleton() {
  const allFields = Array.from(document.querySelectorAll('.field')).map(field =>
    field.getAttribute('id')
  );
  const rows = [];
  for (let i = 0; i < allFields.length; i += 10) {
    const current = allFields.slice(i, i + 10);
    rows.push(current);
  }
  return rows;
}

function pickRandomBlock(arr) {
  const randomNum1 = Math.floor(Math.random() * arr.length);
  const randomNum2 = Math.floor(Math.random() * BLOCK_ROTATIONS);
  helper.block = randomNum1;
  helper.rotation = randomNum2;
  helper.array.push(arr[helper.block][helper.rotation]);
}
pickRandomBlock(blocks);

function displayBlock(arr, step, position, helper) {
  if (!helper.isFinished) {
    const clearFields = Array.from(document.querySelectorAll('.field'));
    clearFields.forEach(field => {
      if (!field.classList.contains('fixed'))
        field.classList.remove('test', 'yell');
    });

    let modified = arr.map(el => el + step + position);
    // console.log(modified);
    if (helper.array.length === 0) helper.array.push(modified);
    else {
      helper.array.shift();
      helper.array.push(modified);
    }
    if (modified.every(el => el >= 0)) {
      modified.forEach(el => {
        field(el).classList.add('test');
      });
    }

    if (modified.some(el => el % 10 === 0)) {
      helper.leftEdgeTouched = true;
    }
    if (modified.some(el => el % 10 === 9)) {
      helper.rightEdgeTouched = true;
    }
    // console.log(modified, helper.leftEdgeTouched, helper.rightEdgeTouched);
  }
}

function checkLeftEdge(arr) {
  if (arr.some(id => id % 10 === 1)) {
    helper.leftEdgeTouched = true;
    console.log('left edge touched');
  }
}
function checkRightEdge(arr) {
  if (arr.some(id => id % 10 === 8)) {
    helper.rightEdgeTouched = true;
    console.log('right edge touched');
  }
}

function moveLeft() {
  helper.rightEdgeTouched = false;
  checkLeftEdge(helper.array[0]);
  const test = collisionDetector(helper.array[0], -1);

  if (test.some(el => el % 10 === 9 || el % 10 === -1)) {
    return;
  }
  if (test.some(el => field(el).classList.contains('fixed'))) {
    return;
  }

  helper.position -= 1;

  displayBlock(
    blocks[helper.block][helper.rotation],
    helper.step,
    helper.position,
    helper
  );
  // clickSound.play();
  isEndReached(helper.array);
}

function moveRight() {
  helper.leftEdgeTouched = false;
  checkRightEdge(helper.array[0]);
  const test = collisionDetector(helper.array[0], 1);

  if (test.some(el => el % 10 === 0)) {
    return;
  }
  if (test.some(el => field(el).classList.contains('fixed'))) {
    return;
  }

  helper.position += 1;

  displayBlock(
    blocks[helper.block][helper.rotation],
    helper.step,
    helper.position,
    helper
  );
  // clickSound.play();
  isEndReached(helper.array);
}

function rotate() {
  // variable copy holds fields with current block, var test holds fields with current block after the rotation
  const [copy] = helper.array;
  helper.rotation === blocks[helper.block].length - 1
    ? (helper.rotation = 0)
    : (helper.rotation += 1);
  const test = blocks[helper.block][helper.rotation].map(
    el => el + helper.step + helper.position
  );
  if (test.some(el => field(el).classList.contains('fixed'))) {
    helper.rotation === 0
      ? (helper.rotation = blocks[helper.block].length - 1)
      : (helper.rotation -= 1);
    return;
  }
  if (copy.every(el => el % 10 === 8) && test.some(el => el % 10 === 0)) {
    helper.position -= 1;
    displayBlock(
      blocks[helper.block][helper.rotation],
      helper.step,
      helper.position,
      helper
    );
    isEndReached(helper.array);
    return;
  }

  if (copy.every(el => el % 10 === 9) && test.some(el => el % 10 === 0)) {
    helper.position -= 2;
    displayBlock(
      blocks[helper.block][helper.rotation],
      helper.step,
      helper.position,
      helper
    );
    isEndReached(helper.array);
    return;
  }

  if (helper.leftEdgeTouched && test.some(el => el % 10 === 9)) {
    helper.position += 1;
    displayBlock(
      blocks[helper.block][helper.rotation],
      helper.step,
      helper.position,
      helper
    );
    isEndReached(helper.array);

    return;
  }
  // if (test.some(el => el % 10 === 8) && test.some(el => el % 10 === 0))
  if (helper.rightEdgeTouched && test.some(el => el % 10 === 0)) {
    helper.position -= 1;
    console.log(test, 'right edge');
    displayBlock(
      blocks[helper.block][helper.rotation],
      helper.step,
      helper.position,
      helper
    );
    isEndReached(helper.array);

    return;
  }

  console.log(test, 'current');

  displayBlock(
    blocks[helper.block][helper.rotation],
    helper.step,
    helper.position,
    helper
  );

  // console.log(copy, 'previous');

  isEndReached(helper.array);
}

function deleteRow(row) {
  row.forEach(fieldId => {
    field(fieldId).classList.remove('fixed');
  });
}

function shiftDown(rowNumber, frame) {
  let i = rowNumber;
  while (i > 0) {
    const currentRow = frame[i];
    currentRow.forEach(fieldId => {
      if (field(Number(fieldId) - BOARD_LENGTH).classList.contains('fixed')) {
        field(Number(fieldId) - BOARD_LENGTH).classList.remove('fixed');
        field(fieldId).classList.add('fixed');
      }
    });
    i--;
  }
}

function checkScore(rows) {
  for (let i = 0; i < rows.length; i++) {
    const currentRow = rows[i];
    if (
      currentRow.some(id => {
        const element = field(id);
        return !element.classList.contains('fixed');
      })
    )
      continue;

    deleteRow(currentRow);
    shiftDown(i, helper.frame());
  }
}

function collisionDetector(arr, offset) {
  return arr.map(el => Number(el) + offset).filter(el => !arr.includes(el));
}

function isEndReached() {
  const collisionArray = collisionDetector(helper.array[0], 10);

  if (
    collisionArray.some(id => id >= 200) ||
    collisionArray.some(el => field(el).classList.contains('fixed'))
  ) {
    const all = Array.from(document.querySelectorAll('.test'));
    all.forEach(field => {
      field.classList.remove('test');
      field.classList.add('fixed');
    });
    helper.leftEdgeTouched = false;
    helper.rightEdgeTouched = false;
    reset();

    if (isGameOver()) {
      helper.isFinished = true;
      helper.boost = false;
    }
    displayBlock(
      blocks[helper.block][helper.rotation],
      helper.step,
      helper.position,
      helper
    );
  } else {
    collisionArray.forEach(fieldId => {
      field(fieldId).classList.add('yell');
    });
  }
}

function isGameOver() {
  const topRow = Array.from({ length: BOARD_LENGTH }, (_, i) => i);
  return topRow.some(id => field(id).classList.contains('fixed'));
}

function init(speed) {
  displayBlock(
    blocks[helper.block][helper.rotation],
    helper.step,
    helper.position,
    helper
  );
  isEndReached(helper.array);

  const interval = setInterval(() => {
    helper.step += 10;
    displayBlock(
      blocks[helper.block][helper.rotation],
      helper.step,
      helper.position,
      helper
    );
    isEndReached(helper.array);
    if (helper.isFinished) clearInterval(interval);
  }, speed);
}

function boost(speed) {
  helper.boost = true;

  displayBlock(
    blocks[helper.block][helper.rotation],
    helper.step,
    helper.position,
    helper
  );
  isEndReached(helper.array);

  const interval = setInterval(() => {
    helper.step += 10;
    displayBlock(
      blocks[helper.block][helper.rotation],
      helper.step,
      helper.position,
      helper
    );
    isEndReached(helper.array);
    if (!helper.boost) clearInterval(interval);
  }, speed / 10);
}

function speedUp() {
  boost(helper.timeout);
}

button.addEventListener('click', () => {
  init(helper.timeout);
});

addEventListener('keypress', e => {
  const key = e.key;
  if (key !== 'a') return;
  moveLeft();
});

addEventListener('keypress', e => {
  const key = e.key;
  if (key !== 'd') return;
  moveRight();
});

addEventListener('keypress', e => {
  const key = e.key;
  if (key !== 'w') return;
  rotate();
});

addEventListener('keypress', e => {
  const key = e.key;
  if (key !== 's') return;
  speedUp();
});
