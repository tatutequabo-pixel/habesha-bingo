const socket = io();
const synth = window.speechSynthesis;

let gameCode;
const numbersDiv = document.getElementById("numbers");

document.getElementById("start").onclick = () => {
  socket.emit("host:createGame",
    document.getElementById("password").value
  );
};

socket.on("host:gameCreated", data => {
  gameCode = data.gameCode;
  document.getElementById("panel").style.display = "block";
  document.getElementById("gameCode").textContent = gameCode;

  numbersDiv.innerHTML = "";
  for (let i = 1; i <= 75; i++) {
    const d = document.createElement("div");
    d.className = "num";
    d.textContent = i;
    d.onclick = () => {
      d.classList.add("called");
      socket.emit("host:callNumber", { gameCode, number: i });
    };
    numbersDiv.appendChild(d);
  }
});

socket.on("numberCalled", ({ number, letter }) => {
  const ball = document.getElementById("ball");
  ball.className = "ball";
  ball.textContent = `${letter}-${number}`;
  synth.speak(new SpeechSynthesisUtterance(`${letter} ${number}`));
});

socket.on("winnerAnnounced", name => {
  document.getElementById("winner").textContent =
    "🎉 WINNER: " + name;
});

