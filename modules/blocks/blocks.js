const width = 10;

const sBlock = [
  [1, width + 1, width + 2, width * 2 + 2],
  [1, 2, width, width + 1],
  [0, width, width + 1, width * 2 + 1],
  [1, 2, width, width + 1],
];

const zBlock = [
  [0, 1, width + 1, width + 2],
  [1, width, width + 1, width * 2],
  [0, 1, width + 1, width + 2],
  [2, width + 1, width + 2, width * 2 + 1],
];

const lBlock = [
  [1, width + 1, width * 2 + 1, width * 2 + 2],
  [0, 1, 2, width],
  [1, 2, width + 2, width * 2 + 2],
  [2, width, width + 1, width + 2],
];

const jBlock = [
  [1, width + 1, width * 2, width * 2 + 1],
  [0, width, width + 1, width + 2],
  [1, 2, width + 1, width * 2 + 1],
  [0, 1, 2, width + 2],
];

const oBlock = [
  [1, 2, width + 1, width + 2],
  [1, 2, width + 1, width + 2],
  [1, 2, width + 1, width + 2],
  [1, 2, width + 1, width + 2],
];

const tBlock = [
  [1, width, width + 1, width + 2],
  [0, width, width + 1, width * 2],
  [0, 1, 2, width + 1],
  [2, width + 1, width + 2, width * 2 + 2],
];

const longBlock = [
  [1, width + 1, width * 2 + 1, width * 3 + 1],
  [0, 1, 2, 3],
  [1, width + 1, width * 2 + 1, width * 3 + 1],
  [0, 1, 2, 3],
];

export const blocks = [
  sBlock,
  zBlock,
  lBlock,
  jBlock,
  oBlock,
  tBlock,
  longBlock,
];
