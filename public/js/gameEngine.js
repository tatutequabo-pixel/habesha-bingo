// Utility functions for marking, checking boards
export function markNumberOnBoard(boardData, number) {
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (boardData.board[i][j] === number) {
        boardData.marked[i][j] = true;
      }
    }
  }
}

// Checks for Bingo win
export function isBingo(boardData) {
  const marked = boardData.marked;

  // Rows
  for (let i = 0; i < 5; i++) if (marked[i].every(v => v)) return true;
  // Columns
  for (let j = 0; j < 5; j++) if ([0,1,2,3,4].every(i => marked[i][j])) return true;
  // Main diagonal
  if ([0,1,2,3,4].every(i => marked[i][i])) return true;
  // Anti-diagonal
  if ([0,1,2,3,4].every(i => marked[i][4-i])) return true;

  return false;
}
