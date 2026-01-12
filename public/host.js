const socket = io();

let gameCode = null;
let playerCodes = [];
let calledNumbers = [];

const codesList = document.getElementById("codes-list");
const calledNumbersDiv = document.getElementById("called-numbers");
const startBtn = document.getElementById("start-game-btn");
const winnerBanner = document.getElementById("winner-banner");

startBtn.disabled = true;
winnerBanner.style.display = "none";

document.getElementById("create-game-btn").onclick = () => {
  socket.emit("host-create-game");
};

socket.on("game-created", ({ gameCode: code, playerCodes: codes }) => {
  gameCode = code;
  playerCodes = codes;
  codesList.innerHTML = "";

  codes.forEach((code) => {
    const li = document.createElement("li");
    li.textContent = code;
    codesList.appendChild(li);
  });

  startBtn.disabled = false;
  alert(`Game created! Game Code: ${gameCode}`);
});

startBtn.onclick = () => {
  if (!gameCode) return;
  socket.emit("host-start-calling", gameCode);
  startBtn.disabled = true;
  winnerBanner.style.display = "none";
  calledNumbers = [];
  calledNumbersDiv.innerHTML = "";
};

socket.on("number-called", (number) => {
  calledNumbers.push(number);
  const span = document.createElement("span");
  span.textContent = number;
  span.className = "called-number";
  calledNumbersDiv.appendChild(span);

  // TODO: Add voice announcement here (optional)
});

socket.on("player-joined", ({ playerName, playerCode }) => {
  const p = document.createElement("p");
  p.textContent = `Player joined: ${playerName} (${playerCode})`;
  codesList.appendChild(p);
});

socket.on("bingo-winner", (winnerName) => {
  winnerBanner.style.display = "block";
  winnerBanner.textContent = `🎉 Bingo Winner: ${winnerName}`;
  startBtn.disabled = false;
});

socket.on("game-ended", () => {
  alert("Game ended as host disconnected or numbers finished.");
  window.location.reload();
});

