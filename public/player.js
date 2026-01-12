const socket = io();

let playerCode = null;
let playerBoard = [];
let markedNumbers = [];

const joinBtn = document.getElementById('join-btn');
const playerNameInput = document.getElementById('player-name');
const playerCodeInput = document.getElementById('player-code');
const joinError = document.getElementById('join-error');

const joinSection = document.getElementById('join-section');
const gameSection = document.getElementById('game-section');
const boardDiv = document.getElementById('board');
const bingoBtn = document.getElementById('bingo-btn');
const winnerBanner = document.getElementById('winner-banner');

joinBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    const code = playerCodeInput.value.trim().toUpperCase();
    if(name && code){
        socket.emit('player-join', { name, code });
        playerCode = code;
    }
});

socket.on('player-join-success', (board, calledNumbers, gameStarted) => {
    playerBoard = board;
    markedNumbers = [];
    joinSection.style.display = 'none';
    gameSection.style.display = 'block';
    renderBoard();
    if(gameStarted) bingoBtn.disabled = false;
});

socket.on('player-join-failed', () => {
    joinError.style.display = 'block';
});

// Render bingo board
function renderBoard(){
    boardDiv.innerHTML = '';
    playerBoard.forEach((num, idx) => {
        const cell = document.createElement('div');
        cell.className = 'board-cell';
        cell.textContent = num;
        if(num === 'FREE'){
            cell.classList.add('free', 'marked');
            markedNumbers.push('FREE');
        }
        boardDiv.appendChild(cell);
    });
}

// Receive called numbers
socket.on('number-called', num => {
    const cells = document.querySelectorAll('.board-cell');
    cells.forEach(cell => {
        if(cell.textContent == num){
            cell.classList.add('marked');
            markedNumbers.push(num);
        }
    });
    bingoBtn.disabled = false;
});

// Call BINGO
bingoBtn.addEventListener('click', () => {
    socket.emit('bingo', playerCode);
});

// Winner announced
socket.on('winner', name => {
    winnerBanner.style.display = 'block';
    winnerBanner.textContent = `🎉 Winner: ${name} 🎉`;
});

