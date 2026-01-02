const socket = io();

let numbersCalled = [];
const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
const callBtn = document.getElementById("callNumber");
const currentCall = document.getElementById("currentCall");
const playersList = document.getElementById("players");

// Function to call a number
function callNumber() {
  if (numbersCalled.length >= allNumbers.length) {
    alert("All numbers have been called!");
    return;
  }

  let number;
  do {
    number = allNumbers[Math.floor(Math.random() * allNumbers.length)];
  } while (numbersCalled.includes(number));

  numbersCalled.push(number);
  currentCall.textContent = number;

  // Emit to players
  socket.emit("numberCalled", number);

  // Speak number
  if ("speechSynthesis" in window) {
    const msg = new SpeechSynthesisUtterance(`Number ${number}`);
    window.speechSynthesis.speak(msg);
  }
}

// Update player list in real-time
socket.on("updatePlayers", (player) => {
  playersList.innerHTML = "";
  const ul = document.createElement("ul");
  Object.values(player).forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.name;
    playersList.appendChild(li);
  });
});

// Call number button
callBtn.onclick = callNumber;




