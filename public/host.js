const socket = io();

// Panels and elements
const loginPanel = document.getElementById("loginPanel");
const hostPanel = document.getElementById("hostPanel");
const codesDiv = document.getElementById("codes");
const boardPreview = document.getElementById("boardPreview");
const winnerBanner = document.getElementById("winnerBannerHost");

const startBtn = document.getElementById("startGameBtn");
const startAutoCallBtn = document.getElementById("startAutoCallBtn");
const resetBtn = document.getElementById("resetGameBtn");
const hostPasswordInput = document.getElementById("hostPassword");

const HOST_PASSWORD = "Hanilove1";

let autoCallInterval;
let numbersToCall = [];

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

  // Prepare auto-call numbers B1-B15, I16-I30, etc.
  numbersToCall = [];
  for (let col = 0; col < 5; col++) {
    for (let i = 1; i <= 15; i++) {
      const letter = "BINGO"[col];
      const num = i + col * 15;
      numbersToCall.push(`${letter}${num}`);
    }
  }
  numbersToCall = shuffle(numbersToCall);
});

// ================= AUTO-CALL NUMBERS =================
startAutoCallBtn.addEventListener("click", () => {
  if (autoCallInterval) clearInterval(autoCallInterval);
  autoCallInterval = setInterval(() => {
    if (numbersToCall.length === 0) {
      clearInterval(autoCallInterval);
      alert("All numbers called!");
      return;
    }
    const number = numbersToCall.shift();
    socket.emit("call-number", number); // broadcast to players
    speakNumber(number);
  }, 3000); // calls every 3 seconds
});

// ================= RESET GAME =================
resetBtn.addEventListener("click", () => socket.emit("reset-game"));

// ================= NUMBER HIGHLIGHT =================
socket.on("number-called", (num) => {
  document.querySelectorAll(".board-cell").forEach(cell => {
    if (cell.innerText == num.replace(/[^\d]/g, "")) cell.classList.add("called");
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
  if (autoCallInterval) clearInterval(autoCallInterval);
});

// ================= BOARD PREVIEW =================
function generateBoardPreview() {
  boardPreview.innerHTML = "";
  const table = document.createElement("table");
  table.className = "bingo-table";

  // Header B I N G O
  const headerRow = document.createElement("tr");
  ["B","I","N","G","O"].forEach(letter => {
    const th = document.createElement("th");
    th.innerText = letter;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // 5x5 board
  const tdNumbersUsed = new Set();
  for (let row = 0; row < 5; row++) {
    const tr = document.createElement("tr");
    for (let col = 0; col < 5; col++) {
      let num;
      do {
        num = Math.floor(Math.random() * 15 + 1 + col * 15);
      } while (tdNumbersUsed.has(num));
      tdNumbersUsed.add(num);

      const td = document.createElement("td");
      td.className = "board-cell";
      td.innerText = num;
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }

  boardPreview.appendChild(table);
}

// ================= SHUFFLE HELPER =================
function shuffle(array) {
  for (let i = array.length -1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ================= VOICE ANNOUNCE =================
function speakNumber(number) {
  const msg = new SpeechSynthesisUtterance(number);
  msg.lang = "en-US";
  window.speechSynthesis.speak(msg);
}


