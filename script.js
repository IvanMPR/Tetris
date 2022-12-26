import { blocks } from './modules/blocks/blocks.js';
const board = document.querySelector('.board');
const button = document.querySelector('.btn');
const SMALL_BOARD_LENGTH = 4;
const BOARD_LENGTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_ROTATIONS = 4;
const smallGrid = document.querySelector('.grid');
const clickSound = new Audio(
  './sounds/90125__pierrecartoons1979__click-tiny.wav'
);
const scoreAmount = document.querySelector('.score-amount');
const levelAmount = document.querySelector('.level-amount');
let booster = 1;
const helper = {
  block: 0,
  rotation: 0,
  nextBlock: 0,
  nextRotation: 0,
  // isGameStarted: false,
  isGameFinished: false,
  position: 3,
  step: 0,
  stepLength: 10,
  array: [],
  boost: false,
  level: 1,
  points: 0,
  leftEdgeTouched: false,
  rightEdgeTouched: false,
  timeout: 1000,
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

function createSmallGrid() {
  let html = '';

  for (let i = 0; i < 16; i++) {
    html += `<div class="small-field" data-test="${smallGridIdMaker(
      i
    )}" id="${smallGridIdMaker(i)}-small"></div>`;
  }
  smallGrid.insertAdjacentHTML('beforeend', html.trim());
}
createSmallGrid();

function initializeFirstRandomBlock() {
  const randomNum1 = Math.floor(Math.random() * blocks.length);
  const randomNum2 = Math.floor(Math.random() * BLOCK_ROTATIONS);

  helper.block = randomNum1;
  helper.rotation = randomNum2;
}
initializeFirstRandomBlock();

// helper fn to avoid typing 'document.getElementById....
const field = id => document.getElementById(id);
// helper fn to reset some helper elements after block-tetromino is placed
const reset = () => {
  helper.array = [];
  helper.position = 3;
  helper.step = -10;
  helper.isGameFinished = true;
  helper.boost = false;
  helper.block = helper.nextBlock;
  helper.rotation = helper.nextRotation;
  pickRandomBlock(blocks);
  checkScore(helper.frame());
  helper.isGameFinished = false;
};

// helper fn to reset small board after every old block is placed
const resetSmallBoard = () => {
  document.querySelectorAll('.small-field').forEach(el => {
    el.classList.remove('small-test');
  });
};

// helper fn to create field ids on the small board
function smallGridIdMaker(index) {
  return index <= 3
    ? index
    : index > 3 && index <= 7
    ? index + (BOARD_LENGTH - SMALL_BOARD_LENGTH)
    : index > 7 && index <= 11
    ? index + (2 * BOARD_LENGTH - 2 * SMALL_BOARD_LENGTH)
    : index + (3 * BOARD_LENGTH - 3 * SMALL_BOARD_LENGTH);
}
// helper fn to sum up the score
function scoreUp(score) {
  helper.points += score;
}
// helper fn to display the score in the UI
function displayScore() {
  scoreAmount.textContent = helper.points;
}
// helper fn to help detect collision(depending on the offset value)
function collisionDetector(arr, offset) {
  return arr.map(el => Number(el) + offset).filter(el => !arr.includes(el));
}

// returns entire game board with field id's
function boardSkeleton() {
  const allFields = Array.from(document.querySelectorAll('.field')).map(field =>
    field.getAttribute('id')
  );
  const rows = [];
  for (let i = 0; i < allFields.length; i += BOARD_LENGTH) {
    const current = allFields.slice(i, i + BOARD_LENGTH);
    rows.push(current);
  }
  return rows;
}
// getting next random tetromino-block
function pickRandomBlock(arr) {
  const randomNum1 = Math.floor(Math.random() * arr.length);
  const randomNum2 = Math.floor(Math.random() * BLOCK_ROTATIONS);

  helper.nextBlock = randomNum1;
  helper.nextRotation = randomNum2;

  resetSmallBoard();
  displayNextBlockOnTheSmallBoard();
}

function displayNextBlockOnTheSmallBoard() {
  document.querySelectorAll('.small-field').forEach(el => {
    const id = el.getAttribute('id');
    const [currentFieldId] = id.split('-');
    if (
      blocks[helper.nextBlock][helper.nextRotation].includes(
        Number(currentFieldId)
      )
    ) {
      el.classList.add('small-test');
    }
  });
}
// main fn for displaying block on the grid
function displayBlock(arr, step, position, helper) {
  if (!helper.isGameFinished) {
    const clearFields = Array.from(document.querySelectorAll('.field'));
    clearFields.forEach(field => {
      if (!field.classList.contains('fixed'))
        field.classList.remove('test', 'yell');
    });

    let modified = arr.map(el => el + step + position);

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
  }
}
function levelUp(score) {
  return score > 500;
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
  // if rotation num is bigger that 3([0,1,2,3]), reset it to beginning([0])
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

  displayBlock(
    blocks[helper.block][helper.rotation],
    helper.step,
    helper.position,
    helper
  );
  isEndReached(helper.array);
}

// delete row if score is hit
function deleteRow(row) {
  row.forEach(fieldId => {
    field(fieldId).classList.remove('fixed');
  });
}
// slide down every block above the last score line
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
// check if score happened
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
    scoreUp(100);
    deleteRow(currentRow);
    shiftDown(i, helper.frame());
    displayScore();
  }
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
    scoreUp(5);
    displayScore();

    if (isGameOver()) {
      helper.isGameFinished = true;
      helper.boost = false;
    }
    displayBlock(
      blocks[helper.block][helper.rotation],
      helper.step,
      helper.position,
      helper
    );
  }
}

function isGameOver() {
  const topRow = Array.from({ length: BOARD_LENGTH }, (_, i) => i);
  return topRow.some(id => field(id).classList.contains('fixed'));
}
// if level 1 call init with speed 1, (make init function generator with various speeds)
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
    if (helper.isGameFinished) clearInterval(interval);
  }, speed * booster);
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
// ? Event Listeners // ------------------- //
button.addEventListener('click', () => {
  pickRandomBlock(blocks);
  init(helper.timeout);
});

addEventListener('keypress', e => {
  if (e.key !== 'a') return;
  moveLeft();
});

addEventListener('keypress', e => {
  if (e.key !== 'd') return;
  moveRight();
});

addEventListener('keypress', e => {
  if (e.key !== 'w') return;
  rotate();
});

addEventListener('keypress', e => {
  if (e.key !== 's') return;
  speedUp();
});

// const makeList = str => {
//   const mazeFields = str.split('\n');

//   const list = {};

//   for (let i = 0; i < mazeFields.length; i++) {
//     for (let j = 0; j < mazeFields[i].length; j++) {
//       const current = [i, j].join('');

//       const up =
//         !mazeFields[i - 1] || mazeFields[i - 1][j] === 'W'
//           ? null
//           : [i - 1, j].join('');

//       const down =
//         !mazeFields[i + 1] || mazeFields[i + 1][j] === 'W'
//           ? null
//           : [i + 1, j].join('');

//       const left =
//         !mazeFields[i][j - 1] || mazeFields[i][j - 1] === 'W'
//           ? null
//           : [i, j - 1].join('');
//       const right =
//         !mazeFields[i][j + 1] || mazeFields[i][j + 1] === 'W'
//           ? null
//           : [i, j + 1].join('');
//       const values = [up, down, left, right].filter(el => el !== null);

//       list[current] = values;
//     }
//   }
//   return list;
// };

// const truePath1 = `.W.
// .W.
// ...`;
// const falsePath1 = `.W.
// .W.
// W..`;
// const truePath2 = `......
// ......
// ......
// ......
// ......
// ......`;
// const falsePath2 = `......
// ......
// ......
// ......
// .....W
// ....W.`;
// const snakePath = `.W...W...W...
// .W.W.W.W.W.W.
// .W.W.W.W.W.W.
// .W.W.W.W.W.W.
// .W.W.W.W.W.W.
// .W.W.W.W.W.W.
// .W.W.W.W.W.W.
// .W.W.W.W.W.W.
// .W.W.W.W.W.W.
// .W.W.W.W.W.W.
// .W.W.W.W.W.W.
// .W.W.W.W.W.W.
// ...W...W...W.`;
// const test1 = makeList(truePath1);
// console.log(test1);
// const test2 = makeList(falsePath1);
// const test3 = makeList(truePath2);
// const test4 = makeList(falsePath2);
// const test5 = makeList(snakePath);
// const hasPath = (graph, start, end) => {
//   const visited = new Set();
//   const queue = [start];

//   while (queue.length) {
//     const current = queue.shift();
//     if (visited.has(current)) continue;
//     visited.add(current);

//     if (current === end) return true;
//     for (let neighbor of graph[current]) {
//       queue.push(neighbor);
//     }
//   }

//   return false;
// };

// console.log(hasPath(test5, '00', '22'));
// console.log(hasPath(adjList, start, end));
// function pathFinder(maze) {
//   let start = String([0, 0]); // start is always [0,0] => joined in array equals '00'
//   let end; //  end is calculated programatically depending of the maze size
//   // create adjacency list for traversing
//   const makeList = str => {
//     const mazeFields = str.split('\n');
//     end = String([mazeFields.length - 1, mazeFields.length - 1]);
//     console.log(start, 'start', end, 'end');
//     const list = {};

//     for (let i = 0; i < mazeFields.length; i++) {
//       for (let j = 0; j < mazeFields[i].length; j++) {
//         const current = String([i, j]);

//         const up =
//           !mazeFields[i - 1] || mazeFields[i - 1][j] === 'W'
//             ? null
//             : String([i - 1, j]);

//         const down =
//           !mazeFields[i + 1] || mazeFields[i + 1][j] === 'W'
//             ? null
//             : String([i + 1, j]);

//         const left =
//           !mazeFields[i][j - 1] || mazeFields[i][j - 1] === 'W'
//             ? null
//             : String([i, j - 1]);
//         const right =
//           !mazeFields[i][j + 1] || mazeFields[i][j + 1] === 'W'
//             ? null
//             : String([i, j + 1]);
//         const values = [up, down, left, right].filter(el => el !== null);

//         list[current] = values;
//       }
//     }
//     return list;
//   };
//   const hasPath = (graph, src, dst, visited) => {
//     if (src === dst) return true;
//     if (visited.has(src)) return false;
//     visited.add(src);

//     for (let neighbor of graph[src]) {
//       if (hasPath(graph, neighbor, dst, visited) === true) {
//         return true;
//       }
//     }

//     return false;
//   };

//   // create isPathPossible function that returns boolean (BFS)
//   // const hasPath = (graph, start, end) => {
//   //   const visited = new Set();
//   //   const queue = [start];

//   //   while (queue.length) {
//   //     const current = queue.shift();
//   //     // console.log(current, 'current');
//   //     if (visited.has(current)) continue;
//   //     visited.add(current);
//   //     if (current === end) return true;
//   //     for (let neighbor of graph[current]) {
//   //       queue.push(neighbor);
//   //     }
//   //   }
//   //   return false;
//   // };

//   const list = makeList(maze);
//   console.log(list);
//   return hasPath(list, start, end, new Set());
// }
// console.log(pathFinder(snakePath));
