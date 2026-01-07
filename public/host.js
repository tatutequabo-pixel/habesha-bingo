const socket = io();

const HOST_PASSWORD = "Hanilove1";

const startGameBtn = document.getElementById("startGameBtn");
const hostPasswordInput = document.getElementById("hostPassword");
const gameCodeDisplay = document.getElementById("gameCodeDisplay");
const playerCodesContainer = document.getElementById("playerCodesContainer");
const numberBoard = document.getElementById("numberBoard");
const calledNumbersDiv = document.getElementById("calledNumbers");
const gameInfoDiv = document.getElementById("gameInfo");

let currentGameCode = null;
let calledNumbers = [];

startGameBtn.addEventListener("click", () => {
  const password = hostPasswordInput.value.trim();
  if (!password) return alert("Enter password");

  socket.emit("host-join", password, (response) => {
    if (!response.success) return alert(response.message);

    currentGameCode = response.gameCode;
    gameCodeDisplay.textContent = currentGameCode;
    playerCodesContainer.innerHTML = "";
    response.playerCodes.forEach(code => {
      const span = document.createElement("span");
      span.textContent = code;
      span.style.padding = "5px 10px";
      span.style.background = "#333";
      span.style.color = "yellow";
      span.style.borderRadius = "5px";
      playerCodesContainer.appendChild(span);
    });

    gameInfoDiv.style.display = "block";
    hostPasswordInput.disabled = true;
    startGameBtn.disabled = true;

    buildNumberBoard();
  });
});

function buildNumberBoard() {
  numberBoard.innerHTML = "";
  for (let i = 1; i <= 75; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.style.width = "40px";
    btn.style.height = "40px";
    btn.style.margin = "3px";
    btn.style.backgroundColor = "#222";
    btn.style.color = "yellow";
    btn.style.border = "none";
    btn.style.borderRadius = "5px";
    btn.style.cursor = "pointer";

    btn.addEventListener("click", () => {
      if (calledNumbers.includes(i)) return; // Already called
      calledNumbers.push(i);
      updateCalledNumbers();
      socket.emit("host-call-number", { gameCode: currentGameCode, number: i });
      playVoiceCall(i);
      btn.style.backgroundColor = "#444"; // mark as called
    });

    numberBoard.appendChild(btn);
  }
}

function updateCalledNumbers() {
  calledNumbersDiv.innerHTML = "";
  calledNumbers.forEach(n => {
    const span = document.createElement("span");
    span.textContent = n;
    span.style.marginRight = "5px";
    span.style.color = "yellow";
    calledNumbersDiv.appendChild(span);
  });
}

function playVoiceCall(number) {
  const bingos = ["B", "I", "N", "G", "O"];
  let prefix = "";
  if (number >= 1 && number <= 15) prefix = bingos[0];
  else if (number >= 16 && number <= 30) prefix = bingos[1];
  else if (number >= 31 && number <= 45) prefix = bingos[2];
  else if (number >= 46 && number <= 60) prefix = bingos[3];
  else if (number >= 61 && number <= 75) prefix = bingos[4];

  const msg = new SpeechSynthesisUtterance(`${prefix} ${number}`);
  window.speechSynthesis.speak(msg);
}

// Listen for new calls from server (to sync in case)
socket.on("number-called", (number) => {
  if (!calledNumbers.includes(number)) {
    calledNumbers.push(number);
    updateCalledNumbers();
    markButtonCalled(number);
  }
});

function markButtonCalled(number) {
  const buttons = numberBoard.querySelectorAll("button");
  buttons.forEach(btn => {
    if (parseInt(btn.textContent) === number) {
      btn.style.backgroundColor = "#444";
    }
  });
}

socket.on("game-ended", () => {
  alert("Game ended as host disconnected.");
  window.location.reload();
});

