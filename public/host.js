const socket = io();

// Start game
document.getElementById("startGameBtn").addEventListener("click", () => {
  const password = prompt("Enter host password:");
  socket.emit("start-game", password);
});

// Display generated codes
socket.on("game-started", (data) => {
  const codesDiv = document.getElementById("codes");
  codesDiv.innerHTML = "<h3>Player Codes:</h3>" + data.codes.join(", ");
});

// Call number
document.getElementById("callNumberBtn").addEventListener("click", () => {
  const number = prompt("Enter number to call (e.g., B12):");
  socket.emit("call-number", number);
});

// Reset game
document.getElementById("resetGameBtn").addEventListener("click", () => {
  socket.emit("reset-game");
});

