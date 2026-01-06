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

let numbersToCall = [];
let autoCallInterval;

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

  // Prepare automatic numbers (B1-B15, I16-I30,...)
  numbersToCall = [];
  for (let col = 0; col < 5; col++) {
    for (let i = 1; i <= 15; i++) {
      const num = i + col * 15;
      const letter = "BINGO"[col];
      numbersToCall.push(`${letter}${num}`);
    }
  }
  numbersToCall = shuffle(numbersToCall);
});

// ================= AUTO CALL =================
startAutoCallBtn.addEventListener("click", () => {
  if (autoCallInterval) clearInterval(autoCallInterval);
  autoCallInterval = setInterval(() => {
    if (numbersToCall.length === 0) {
      clearInterval(autoCallInterval);
      alert("All numbers have been called!");
      return;
    }
    const number = numbersToCall.shift();
    socket.emit("call-number", number);
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

  // Create table
  const table = document.createElement("table");
  table.className = "bingo-table";

  // B I N G O header
  const headerRow = document.createElement("tr");
  ["B","I","N","G","O"].forEach(letter => {
    const th = document.createElement("th");
    th.innerText = letter;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // 5x5 board preview
  const used = new Set();
  for (let i = 0; i < 5; i++) {
    const tr = document.createElement("tr");
    for (let j = 0; j < 5; j++) {
      let num;
      do { num = Math.floor(Math.random() * 15 + 1 + j*15); } while (used.has(num));
      used.add(num);

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


