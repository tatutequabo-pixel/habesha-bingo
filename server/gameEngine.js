// server/gameEngine.js

const BINGO_RANGES = [
  [1, 15],   // B
  [16, 30],  // I
  [31, 45],  // N
  [46, 60],  // G
  [61, 75],  // O
];

// Utility: random unique numbers in range
function generateColumn(min, max, count) {
  const nums = [];
  while (nums.length < count) {
    const n = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!nums.includes(n)) nums.push(n);
  }
  return nums;
}

// 🎱 Generate real bingo board
function generateBoard() {
  const board = Array.from({ length: 5 }, () => Array(5).fill(null));

  for (let col = 0; col < 5; col++) {
    const numbers = generateColumn(
      BINGO_RANGES[col][0],
      BINGO_RANGES[col][1],
      5
    );
    for (let row = 0; row < 5; row++) {
      board[row][col] = numbers[row];
    }
  }

  board[2][2] = "FREE"; // center free space
  return board;
}

// 🎱 Number draw (server controlled)
function drawNumber(calledNumbers) {
  const available = [];
  for (let i = 1; i <= 75; i++) {
    if (!calledNumbers.includes(i)) available.push(i);
  }
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// 🧠 Validate bingo claim
function validateBingo(board, marked, calledNumbers) {
  // FREE always counts
  marked.add("FREE");

  // All marked numbers must be called
  for (const num of marked) {
    if (num !== "FREE" && !calledNumbers.includes(num)) {
      return false;
    }
  }

  return (
    checkRows(board, marked) ||
    checkColumns(board, marked) ||
    checkDiagonals(board, marked) ||
    checkFourCorners(board, marked) ||
    checkX(board, marked) ||
    checkT(board, marked) ||
    checkL(board, marked) ||
    checkDiamond(board, marked) ||
    checkBlackout(board, marked)
  );
}

// -------- Pattern checks --------

function checkRows(board, marked) {
  return board.some(row => row.every(cell => marked.has(cell)));
}

function checkColumns(board, marked) {
  for (let c = 0; c < 5; c++) {
    let win = true;
    for (let r = 0; r < 5; r++) {
      if (!marked.has(board[r][c])) win = false;
    }
    if (win) return true;
  }
  return false;
}

function checkDiagonals(board, marked) {
  return (
    [0,1,2,3,4].every(i => marked.has(board[i][i])) ||
    [0,1,2,3,4].every(i => marked.has(board[i][4 - i]))
  );
}

function checkFourCorners(board, marked) {
  return (
    marked.has(board[0][0]) &&
    marked.has(board[0][4]) &&
    marked.has(board[4][0]) &&
    marked.has(board[4][4])
  );
}

function checkX(board, marked) {
  return checkDiagonals(board, marked);
}

function checkT(board, marked) {
  // top row + middle column
  return (
    board[0].every(cell => marked.has(cell)) &&
    [0,1,2,3,4].every(r => marked.has(board[r][2]))
  );
}

function checkL(board, marked) {
  // left column + bottom row
  return (
    [0,1,2,3,4].every(r => marked.has(board[r][0])) &&
    board[4].every(cell => marked.has(cell))
  );
}

function checkDiamond(board, marked) {
  const positions = [
    board[1][2],
    board[2][1],
    board[2][3],
    board[3][2],
  ];
  return positions.every(cell => marked.has(cell));
}

function checkBlackout(board, marked) {
  return board.flat().every(cell => marked.has(cell));
}

module.exports = {
  generateBoard,
  drawNumber,
  validateBingo
};

