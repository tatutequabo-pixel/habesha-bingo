const socket = io();

// DOM Elements
const loginPanel = document.getElementById("loginPanel");
const hostPanel = document.getElementById("hostPanel");
const codesDiv = document.getElementById("codes");
const boardPreview = document.getElementById("boardPreview");
const winnerBanner = document.getElementById("winnerBannerHost");
const startBtn = document.getElementById("startGameBtn");
const callNumberBtn = document.getElementById("callNumberBtn");
const resetBtn = document.getElementById("resetGameBtn");
const hostPasswordInput = document.getElementById("hostPassword");

// Host password (default)
const HOST_PASSWORD = "Hanilove1";

// ================= START GAME =================
startBtn.addEventListener("click", () => {
  const password = hostPasswordInput.value.trim();
  if (!password) return alert("Enter host password");

  if (password !== HOST_PASSWORD) {
    return alert("Incorrect password!");
  }

  // Emit start game to server
  socket.emit("start-game", password);
});

// ================= DISPLAY CODES AND PANEL =================
socket.on("game-started", (data) => {
  loginPanel.classList.add("hidden");
  hostPanel.classList.remove("hidden");

  // Display 30 player codes
  codesDiv.innerHTML = "<strong>Player Codes:</strong> " + data.codes.join(", ");

  // Generate board preview
  generateBoardPreview();

  // Hide winner banner
  winnerBanner.classList.add("hidden");
});

// ================= CALL NUMBER =================
callNumberBtn.addEventListener("click", () => {
  const number = prompt("Enter number to call (e.g., B12):");
  if (number) socket.emit("call-number", number);
});

// ================= RESET GAME =================
resetBtn.addEventListener("click", () => {
  socket.emit("reset-game");
});

// ================= WINNER ANNOUNCEMENT =================
socket.on("bingo-winner", (data) => {
  winnerBanner.innerText = `🎉 BINGO! Winner: ${data.name}`;
  winnerBanner.classList.remove("hidden");
});

// ================= GAME RESET =================
socket.on("game-reset", () => {
  loginPanel.classList.remove("hidden");
  hostPanel.classList.add("hidden");
  winnerBanner.classList.add("hidden");
  hostPasswordInput.value = "";
});

// ================= BOARD PREVIEW =================
function generateBoardPreview() {
  boardPreview.innerHTML = "";
  const nums = [];
  const usedNumbers = new Set();

  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 5; row++) {
      let number;
      do {
        number = Math.floor(Math.random() * 15 + 1 + col * 15);
      } while (usedNumbers.has(number));
      usedNumbers.add(number);
      nums.push(number);

      const cell = document.createElement("div");
      cell.className = "board-cell";
      cell.innerText = number;
      boardPreview.appendChild(cell);
    }
  }
}

