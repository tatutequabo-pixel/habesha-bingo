const socket = io();
const synth = window.speechSynthesis;
let gameCode;

const board = document.getElementById("board");

function generateBoard() {
  const letters = ["B","I","N","G","O"];
  board.innerHTML = "";

  letters.forEach(l => {
    const h = document.createElement("div");
    h.className = "cell header";
    h.textContent = l;
    board.appendChild(h);
  });

  for (let i = 0; i < 25; i++) {
    const c = document.createElement("div");
    c.className = "cell";
    c.textContent = Math.floor(Math.random() * 75) + 1;
    board.appendChild(c);
  }
}

document.getElementById("joinBtn").onclick = () => {
  gameCode = document.getElementById("game").value;
  socket.emit("player:join", {
    name: document.getElementById("name").value,
    code: document.getElementById("code").value,
    gameCode
  });
};

socket.on("player:joined", () => {
  document.getElementById("join").style.display = "none";
  document.getElementById("gamePanel").style.display = "block";
  generateBoard();
});

socket.on("numberCalled", ({ number, letter }) => {
  const ball = document.getElementById("ball");
  ball.className = "ball";
  ball.textContent = `${letter}-${number}`;
  synth.speak(new SpeechSynthesisUtterance(`${letter} ${number}`));
});

document.getElementById("bingo").onclick = () => {
  socket.emit("player:claimBingo", gameCode);
};

socket.on("winnerAnnounced", name => {
  document.getElementById("winner").textContent =
    "🎉 WINNER: " + name;
});

