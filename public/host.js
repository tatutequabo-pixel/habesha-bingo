const socket = io();

const loginPanel = document.getElementById("loginPanel");
const hostPanel = document.getElementById("hostPanel");
const codesDiv = document.getElementById("codes");
const boardPreview = document.getElementById("boardPreview");
const winnerBanner = document.getElementById("winnerBannerHost");
const startBtn = document.getElementById("startGameBtn");
const callBtn = document.getElementById("callNumberBtn");
const resetBtn = document.getElementById("resetGameBtn");
const hostPasswordInput = document.getElementById("hostPassword");

const HOST_PASSWORD = "Hanilove1";

// Start game
startBtn.addEventListener("click", () => {
  const password = hostPasswordInput.value.trim();
  if (!password) return alert("Enter host password");
  if (password !== HOST_PASSWORD) return alert("Wrong password!");
  socket.emit("start-game", password);
});

// Display codes and board preview
socket.on("game-started", (data) => {
  loginPanel.classList.add("hidden");
  hostPanel.classList.remove("hidden");
  codesDiv.innerHTML = "<strong>Player Codes:</strong> " + data.codes.join(", ");
  generateBoardPreview();
  winnerBanner.classList.add("hidden");
});

// Call number
callBtn.addEventListener("click", () => {
  const number = prompt("Enter number to call (e.g., B12):");
  if (number) socket.emit("call-number", number);
});

// Reset game
resetBtn.addEventListener("click", () => socket.emit("reset-game"));

// Highlight called number on host preview
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

// Reset game
socket.on("game-reset", () => {
  loginPanel.classList.remove("hidden");
  hostPanel.classList.add("hidden");
  winnerBanner.classList.add("hidden");
  hostPasswordInput.value = "";
});

// Board preview
function generateBoardPreview() {
  boardPreview.innerHTML = "";
  const nums = [];
  const used = new Set();
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 5; row++) {
      let num;
      do { num = Math.floor(Math.random() * 15 + 1 + col * 15); } while (used.has(num));
      used.add(num);
      const cell = document.createElement("div");
      cell.className = "board-cell";
      cell.innerText = num;
      boardPreview.appendChild(cell);
    }
  }
}

