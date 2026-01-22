// Make sure in index.html or game.html you include:
// <script src="/socket.io/socket.io.js"></script>
// <script src="js/game.js" type="module"></script>

const socket = io(); // Socket.io client

const joinBtn = document.getElementById('joinBtn');
const nameInput = document.getElementById('playerName');
const roomCodeInput = document.getElementById('roomCode');
const playerCodeInput = document.getElementById('playerCode');
const bingoBtn = document.getElementById('bingoBtn');
const boardDiv = document.getElementById('board');
const calledNumbersDiv = document.getElementById('calledNumbers');

let playerCode, roomCode, board = [], marked = [];

// JOIN ROOM
joinBtn.addEventListener('click', async () => {
  const name = nameInput.value.trim();
  roomCode = roomCodeInput.value.trim().toUpperCase();
  playerCode = playerCodeInput.value.trim().toUpperCase();

  if (!name || !roomCode || !playerCode) {
    alert('All fields are required!');
    return;
  }

  const res = await fetch('/join-room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, roomCode, playerCode })
  });

  const data = await res.json();
  if (data.error) {
    alert(data.error);
    return;
  }

  socket.emit('register-player', { roomCode, playerCode });
  generateBoard();
});

// GENERATE BOARD
function generateBoard() {
  board = [];
  marked = [];
  const numbers = Array.from({ length: 75 }, (_, i) => i + 1).sort(() => 0.5 - Math.random());
  for (let i = 0; i < 5; i++) {
    board.push(numbers.slice(i * 5, i * 5 + 5));
    marked.push([false, false, false, false, false]);
  }
  renderBoard();
}

// RENDER BOARD
function renderBoard() {
  boardDiv.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('board-row');
    for (let j = 0; j < 5; j++) {
      const cell = document.createElement('button');
      cell.innerText = board[i][j];
      cell.classList.add('board-cell');
      if (marked[i][j]) cell.classList.add('marked');
      cell.addEventListener('click', () => markNumber(board[i][j]));
      rowDiv.appendChild(cell);
    }
    boardDiv.appendChild(rowDiv);
  }
}

// MARK NUMBER
function markNumber(number) {
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (board[i][j] === number) marked[i][j] = true;
    }
  }
  renderBoard();
  socket.emit('mark-number', { roomCode, playerCode, number });
}

// BINGO BUTTON
bingoBtn.addEventListener('click', () => {
  let bingo = false;

  // Check rows
  bingo = marked.some(row => row.every(v => v));

  // Check columns
  for (let j = 0; j < 5; j++) {
    if (marked.every(row => row[j])) bingo = true;
  }

  // Check diagonals
  if ([0,1,2,3,4].every(i => marked[i][i])) bingo = true;
  if ([0,1,2,3,4].every(i => marked[i][4-i])) bingo = true;

  if (bingo) {
    alert('BINGO! Sending to server for validation...');
    socket.emit('mark-number', { roomCode, playerCode, number: 0 });
  } else {
    alert('Not a valid Bingo yet!');
  }
});

// SOCKET LISTENERS
socket.on('number-called', (num) => {
  const span = document.createElement('span');
  span.innerText = num + ' ';
  calledNumbersDiv.appendChild(span);
});

socket.on('bingo', ({ playerCode: winnerCode, name }) => {
  alert(`BINGO! Winner: ${name} (${winnerCode})`);
});
