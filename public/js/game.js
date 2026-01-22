const socket = io();
let playerBoard = [];
let room = "";
let player = "";

function joinRoom() {
  player = document.getElementById("playerName").value;
  room = document.getElementById("roomCode").value;
  const playerCode = document.getElementById("playerCode").value;

  if (!player || !room || !playerCode) {
    document.getElementById("joinError").innerText = "Fill all fields!";
    return;
  }

  socket.emit("joinRoom", { roomCode: room, playerName: player, playerCode });
}

socket.on("joined", (board) => {
  playerBoard = board;
  document.getElementById("joinDiv").style.display = "none";
  document.getElementById("gameBoardDiv").style.display = "block";
  document.getElementById("playerDisplay").innerText = player + "'s Board";

  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";
  board.forEach((num, idx) => {
    const cell = document.createElement("div");
    cell.innerText = num;
    cell.style.border = "2px solid #0f0";
    cell.style.width = "60px";
    cell.style.height = "60px";
    cell.style.display = "flex";
    cell.style.justifyContent = "center";
    cell.style.alignItems = "center";
    cell.style.cursor = "pointer";
    cell.onclick = () => {
      cell.style.background = cell.style.background === "green" ? "#000" : "green";
    };
    boardDiv.appendChild(cell);
  });
});

function callBingo() {
  socket.emit("callBingo", { roomCode: room, playerCode: document.getElementById("playerCode").value });
}

socket.on("bingoWinner", ({ player }) => {
  alert(`${player} wins Bingo!`);
});

socket.on("numberCalled", (num) => {
  const div = document.getElementById("calledNumbers");
  const p = document.createElement("p");
  p.innerText = "Number Called: " + num;
  div.appendChild(p);
});

socket.on("errorMsg", (msg) => {
  alert(msg);
});
