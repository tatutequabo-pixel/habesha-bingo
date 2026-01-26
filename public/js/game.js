// public/js/game.js

const socket = io();

const joinBtn = document.getElementById("joinGame");
const bingoBtn = document.getElementById("bingoBtn");

const nameInput = document.getElementById("playerName");
const roomInput = document.getElementById("roomCode");
const codeInput = document.getElementById("playerCode");

const boardContainer = document.getElementById("bingoBoard");
const calledNumbersDiv = document.getElementById("calledNumbers");
const playerNameDisplay = document.getElementById("displayName");

let roomCode = null;
let playerCode = null;
let board = [];
let marked = new Set();

// -------- Join Game --------
joinBtn.addEventListener("click", () => {
  socket.emit("player:join", {
    name: nameInput.value.trim(),
    roomCode: roomInput.value.trim().toUpperCase(),
    playerCode: codeInput.value.trim().toUpperCase(),
  });
});

socket.on("player:joined", data => {
  roomCode = data.roomCode;
  playerCode = codeInput.value.trim().toUpperCase();
  board = data.board;

  playerNameDisplay.textContent = data.name;
  renderBoard(board);
});

// -------- Render Board --------
function renderBoard(board) {
  boardContainer.innerHTML = "";

  board.forEach(row => {
    row.forEach(cell => {
      const div = document.createElement("div");
      div.className = "cell";
      div.textContent = cell === "FREE" ? "★" : cell;

      if (cell === "FREE") {
        div.classList.add("marked");
        marked.add("FREE");
      }

      div.addEventListener("click", () => {
        if (cell === "FREE") return;
        if (marked.has(cell)) return;

        div.classList.add("marked");
        marked.add(cell);
      });

      boardContainer.appendChild(div);
    });
  });
}

// -------- Receive Called Numbers --------
socket.on("game:number-called", number => {
  const span = document.createElement("span");
  span.textContent = number;
  calledNumbersDiv.appendChild(span);
});

// -------- Bingo Claim --------
bingoBtn.addEventListener("click", () => {
  socket.emit("player:bingo", {
    roomCode,
    playerCode,
    marked: Array.from(marked),
  });
});

socket.on("bingo:rejected", msg => {
  alert(msg);
});

// -------- Game End --------
socket.on("game:ended", data => {
  alert(`🏆 BINGO! Winner: ${data.winner}`);
  bingoBtn.disabled = true;
});

// -------- Errors --------
socket.on("error", msg => {
  alert(msg);
});
