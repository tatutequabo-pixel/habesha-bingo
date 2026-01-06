const socket = io();

const loginPanel = document.getElementById("loginPanel");
const gamePanel = document.getElementById("gamePanel");
const nameInput = document.getElementById("playerName");
const codeInput = document.getElementById("playerCode");
const joinBtn = document.getElementById("joinGameBtn");
const boardDiv = document.getElementById("playerBoard");
const winnerBanner = document.getElementById("winnerBanner");

// ================= JOIN GAME =================
joinBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const code = codeInput.value.trim();
  if (!name || !code) return alert("Enter name and code");
  socket.emit("join-game", { name, code });
});

// ================= JOIN SUCCESS =================
socket.on("join-success", ({ name, board, calledNumbers }) => {
  loginPanel.classList.add("hidden");
  gamePanel.classList.remove("hidden");
  winnerBanner.classList.add("hidden");
  renderBoard(board, calledNumbers);
});

// ================= JOIN ERROR =================
socket.on("join-error", msg => alert(msg));

// ================= NUMBER CALLED =================
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

// ================= BOARD RENDER =================
function renderBoard(board, calledNumbers = []) {
  boardDiv.innerHTML = "";

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

  // 5x5 grid
  for (let row = 0; row < 5; row++) {
    const tr = document.createElement("tr");
    for (let col = 0; col < 5; col++) {
      const td = document.createElement("td");
      const num = board[row*5 + col];
      td.innerText = num;
      td.className = "board-cell";
      if (calledNumbers.includes(num)) td.classList.add("called");
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }

  boardDiv.appendChild(table);
}


