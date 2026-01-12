const socket = io();

let playerBoard = [];
let marked = [];
let gameCode = null;

const boardDiv = document.getElementById("board");
const joinBtn = document.getElementById("join-btn");
const bingoBtn = document.getElementById("bingo-btn");
const nameInput = document.getElementById("player-name");
const codeInput = document.getElementById("player-code");
const joinSection = document.getElementById("join-section");
const gameSection = document.getElementById("game-section");
const winnerBanner = document.getElementById("winner-banner");

bingoBtn.disabled = true;
gameSection.style.display = "none";
winnerBanner.style.display = "none";

joinBtn.onclick = () => {
  const name = nameInput.value.trim();
  const code = codeInput.value.trim().toUpperCase();

  if (!name || !code) {
    alert("Enter your name and player code");
    return;
  }

  // This should be the actual game code shared by the host
  gameCode = window.location.search.split("gameCode=")[1]; 
  if (!gameCode) {
    alert("Game code missing in URL");
    return;
  }

  socket.emit("player-join-game", { gameCode, playerCode: code, playerName: name });
};

socket.on("join-error", (msg) => {
  alert(msg);
});

socket.on("board-assigned", (board) => {
  playerBoard = board;
  marked = Array(5)
    .fill(0)
    .map(() => Array(5).fill(false));
  // Mark center free space
  marked[2][2] = true;

  joinSection.style.display = "none";
  gameSection.style.display = "block";
  bingoBtn.disabled = false;
  renderBoard();
});

socket.on("number-called", (number) => {
  markNumber(number);
  renderBoard();
  // Optional voice call of number here
});

bingoBtn.onclick = () => {
  socket.emit("player-bingo", gameCode);
};

socket.on("bingo-winner", (winnerName) => {
  winnerBanner.style.display = "block";
  winnerBanner.textContent = `🎉 Bingo Winner: ${winnerName}`;
  bingoBtn.disabled = true;
});

socket.on("bingo-invalid", (msg) => {
  alert(msg);
});

socket.on("game-ended", () => {
  alert("Game ended.");
  window.location.reload();
});

function markNumber(number) {
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (playerBoard[r][c] === number) {
        marked[r][c] = true;
      }
    }
  }
}

function renderBoard() {
  boardDiv.innerHTML = "";
  for (let r = 0; r < 5; r++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "board-row";

    for (let c = 0; c < 5; c++) {
      const cell = document.createElement("div");
      cell.className = "board-cell";
      const val = playerBoard[r][c];
      cell.textContent = val === "FREE" ? "FREE" : val;
      if (marked[r][c]) {
        cell.classList.add("marked");
      }
      rowDiv.appendChild(cell);
    }

    boardDiv.appendChild(rowDiv);
  }
}

