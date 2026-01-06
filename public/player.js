const socket = io();

const loginPanel = document.getElementById("loginPanel");
const gamePanel = document.getElementById("gamePanel");
const nameInput = document.getElementById("playerName");
const codeInput = document.getElementById("playerCode");
const joinBtn = document.getElementById("joinGameBtn");
const boardDiv = document.getElementById("playerBoard");
const winnerBanner = document.getElementById("winnerBanner");

// Join game
joinBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const code = codeInput.value.trim();
  if (!name || !code) return alert("Enter name and code");
  socket.emit("join-game", { name, code });
});

// Join success
socket.on("join-success", ({ name, board, calledNumbers }) => {
  loginPanel.classList.add("hidden");
  gamePanel.classList.remove("hidden");
  winnerBanner.classList.add("hidden");
  renderBoard(board, calledNumbers);
});

// Join error
socket.on("join-error", (msg) => alert(msg));

// Number called
socket.on("number-called", (num) => {
  document.querySelectorAll(".board-cell").forEach(cell => {
    if (cell.innerText == num.replace(/[^\d]/g, "")) {
      cell.classList.add("called");
    }
  });
});

// Winner announcement
socket.on("bingo-winner", (data) => {
  winnerBanner.innerText = `🎉 BINGO! Winner: ${data.name}`;
  winnerBanner.classList.remove("hidden");
});

// Board render
function renderBoard(board, calledNumbers=[]) {
  boardDiv.innerHTML = "";
  board.forEach(num => {
    const cell = document.createElement("div");
    cell.className = "board-cell";
    cell.innerText = num;
    if (calledNumbers.includes(num)) cell.classList.add("called");
    boardDiv.appendChild(cell);
  });
}


