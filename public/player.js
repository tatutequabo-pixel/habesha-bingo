const socket = io();

const urlParams = new URLSearchParams(window.location.search);
let gameCode = urlParams.get("game");
const gameCodeDisplay = document.getElementById("gameCodeDisplay");
const playerNameInput = document.getElementById("playerName");
const playerCodeInput = document.getElementById("playerCode");
const joinBtn = document.getElementById("joinBtn");
const joinGameDiv = document.getElementById("joinGameDiv");
const gameBoardDiv = document.getElementById("gameBoardDiv");
const bingoBoard = document.getElementById("bingoBoard");
const bingoBtn = document.getElementById("bingoBtn");
const winnerBanner = document.getElementById("winnerBanner");
const calledBalls = document.getElementById("calledBalls");

let calledNumbers = [];
let markedNumbers = new Set();

if (!gameCode) {
  alert("Open this page with the player link from host (e.g., ?game=ABCDE)");
}

gameCodeDisplay.textContent = gameCode;

joinBtn.addEventListener("click", () => {
  const playerName = playerNameInput.value.trim();
  const playerCode = playerCodeInput.value.trim().toUpperCase();

  if (!playerName || !playerCode) return alert("Enter name and player code");

  socket.emit("player-join", { gameCode, playerCode, playerName }, (response) => {
    if (!response.success) return alert(response.message);

    joinGameDiv.style.display = "none";
    gameBoardDiv.style.display = "block";

    calledNumbers = response.calledNumbers;
    markedNumbers = new Set();
    buildBingoBoard();
    updateCalledBalls();
    bingoBtn.disabled = false;
  });
});

function buildBingoBoard() {
  bingoBoard.innerHTML = "";
  const numberRanges = [
    [1, 15],
    [16, 30],
    [31, 45],
    [46, 60],
    [61, 75],
  ];

  for (let row = 0; row < 5; row++) {
    const rowDiv = document.createElement("div");
    rowDiv.style.display = "flex";
    for (let col = 0; col < 5; col++) {
      const cell = document.createElement("div");
      cell.style.border = "2px solid yellow";
      cell.style.color = "yellow";
      cell.style.width = "50px";
      cell.style.height = "50px";
      cell.style.display = "flex";
      cell.style.justifyContent = "center";
      cell.style.alignItems = "center";
      cell.style.cursor = "pointer";
      cell.style.margin = "2px";
      cell.style.fontWeight = "bold";
      cell.style.userSelect = "none";

      if (row === 2 && col === 2) {
        cell.textContent = "FREE";
        cell.style.backgroundColor = "green";
        markedNumbers.add("FREE");
        cell.style.cursor = "default";
      } else {
        const min = numberRanges[col][0];
        const max = numberRanges[col][1];
        const num = min + row;
        cell.textContent = num;
      }

      cell.addEventListener("click", () => {
        if (markedNumbers.has(cell.textContent)) {
          markedNumbers.delete(cell.textContent);
          cell.style.backgroundColor = "black";
        } else {
          if (calledNumbers.includes(parseInt(cell.textContent))) {
            markedNumbers.add(cell.textContent);
            cell.style.backgroundColor = "lime";
          }
        }
      });

      rowDiv.appendChild(cell);
    }
    bingoBoard.appendChild(rowDiv);
  }
}

socket.on("number-called", (number) => {
  if (!calledNumbers.includes(number)) {
    calledNumbers.push(number);
    updateCalledBalls();
  }
});

function updateCalledBalls() {
  calledBalls.innerHTML = "";
  calledNumbers.forEach((n) => {
    const ball = document.createElement("span");
    ball.textContent = n;
    ball.style.display = "inline-block";
    ball.style.width = "30px";
    ball.style.height = "30px";
    ball.style.margin = "3px";
    ball.style.borderRadius = "50%";
    ball.style.backgroundColor = "orange";
    ball.style.color = "black";
    ball.style.fontWeight = "bold";
    ball.style.textAlign = "center";
    ball.style.lineHeight = "30px";
    calledBalls.appendChild(ball);
  });
}

bingoBtn.addEventListener("click", () => {
  if (markedNumbers.size < 5) {
    alert("You need to mark at least 5 numbers including free to declare Bingo!");
    return;
  }
  socket.emit("player-bingo", gameCode);
  bingoBtn.disabled = true;
  alert("Bingo declared! Waiting for host confirmation...");
});

socket.on("bingo-winner", (winnerName) => {
  winnerBanner.style.display = "block";
  winnerBanner.textContent = `🎉 Bingo Winner: ${winnerName} 🎉`;
  bingoBtn.disabled = true;
});

socket.on("game-ended", () => {
  alert("Game ended as host disconnected.");
  window.location.reload();
});

