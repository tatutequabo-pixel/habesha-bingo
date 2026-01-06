const socket = io();
let playerCode;

// Join game
document.getElementById("joinBtn").addEventListener("click", () => {
  const name = document.getElementById("nameInput").value.trim();
  const code = document.getElementById("codeInput").value.trim();
  if (!name || !code) return alert("Enter name and code");

  socket.emit("join-game", { name, code });
});

// Join response
socket.on("join-success", (data) => {
  playerCode = data.code;
  alert("Joined game successfully!");
});

socket.on("join-error", (msg) => alert(msg));

// Number called by host
socket.on("number-called", (number) => {
  // Mark number on board visually
  markNumberOnBoard(number);
});

// Player marks number
function markNumber(numberIdx) {
  socket.emit("mark-number", { code: playerCode, number: numberIdx });
}

// Bingo winner announcement
socket.on("bingo-winner", (data) => {
  alert(`🎉 BINGO! Winner: ${data.name}`);
});

// Reset game
socket.on("game-reset", () => {
  playerCode = null;
  alert("Game has been reset!");
});



