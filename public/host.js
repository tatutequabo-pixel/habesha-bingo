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
const numberInput = document.getElementById("numberInput");

const HOST_PASSWORD = "Hanilove1";

// ================= START GAME =================
startBtn.addEventListener("click", () => {
  const password = hostPasswordInput.value.trim();
  if (!password) return alert("Enter password");
  if (password !== HOST_PASSWORD) return alert("Wrong password!");
  socket.emit("start-game", password);
});

// ================= DISPLAY CODES =================
socket.on("game-started", (data) => {
  loginPanel.classList.add("hidden");
  hostPanel.classList.remove("hidden");
  codesDiv.innerHTML = "<strong>Player Codes:</strong> " + data.codes.join(", ");
  generateBoardPreview();
  winnerBanner.classList.add("hidden");
});

// ================= CALL NUMBER =================
callBtn.addEventListener("click", () => {
  const num = numberInput.value.trim().toUpperCase();
  if (!num) return alert("Enter a number");
  socket.emit("call-number", num);
  numberInput.value = "";
});

// ================= RESET GAME =================
resetBtn.addEventListener("click", () => socket.emit("reset-game"));

// ================= NUMBER HIGHLIGHT =================
socket.on("number-called", (num) => {
  document.querySelectorAll(".board-cell").forEach(cell => {
    if (cell.innerText == num.replace(/[^\d]/g,"")) cell.classList.add("called");
  });
});

// ================= WINNER =================
socket.on("bingo-winner", (data) => {
  winnerBanner.innerText = `🎉 BINGO! Winner: ${data.name}`;
  winnerBanner.classList.remove("hidden");
});

// ================= RESET =================
socket.on("game-reset", () => {
  loginPanel.classList.remove("hidden");
  hostPanel.classList.add("hidden");
  winnerBanner.classList.add("hidden");
  hostPasswordInput.value = "";
});

// ================= BOARD PREVIEW =================
function generateBoardPreview() {
  boardPreview.innerHTML = "";
  const used = new Set();
  for (let col=0; col<5; col++){
    for (let row=0; row<5; row++){
      let num;
      do { num = Math.floor(Math.random() * 15 + 1 + col*15); } while(used.has(num));
      used.add(num);
      const cell = document.createElement("div");
      cell.className = "board-cell";
      cell.innerText = num;
      boardPreview.appendChild(cell);
    }
  }
}


