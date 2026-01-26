// public/js/host.js

const socket = io();

const roomCodeInput = document.getElementById("roomCode");
const passwordInput = document.getElementById("password");
const joinBtn = document.getElementById("joinHost");
const startBtn = document.getElementById("startGame");
const callBtn = document.getElementById("callNumber");

const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const numberDisplay = document.getElementById("currentNumber");
const playerCodesList = document.getElementById("playerCodes");

let roomCode = null;

// -------- Join as Host --------
joinBtn.addEventListener("click", () => {
  socket.emit("host:join", {
    roomCode: roomCodeInput.value.trim().toUpperCase(),
    password: passwordInput.value.trim(),
  });
});

socket.on("host:joined", data => {
  roomCode = data.roomCode;
  roomCodeDisplay.textContent = roomCode;

  playerCodesList.innerHTML = "";
  data.playerCodes.forEach(code => {
    const li = document.createElement("li");
    li.textContent = code;
    playerCodesList.appendChild(li);
  });

  startBtn.disabled = false;
});

// -------- Start Game --------
startBtn.addEventListener("click", () => {
  socket.emit("host:start", { roomCode });
  startBtn.disabled = true;
});

socket.on("game:started", () => {
  callBtn.disabled = false;
});

// -------- Call Numbers --------
callBtn.addEventListener("click", () => {
  socket.emit("host:call-number", { roomCode });
});

socket.on("game:number-called", number => {
  numberDisplay.textContent = number;
});

// -------- Errors --------
socket.on("error", msg => {
  alert(msg);
});
