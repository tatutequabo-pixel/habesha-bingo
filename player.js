const socket = io();

function speakNumber(letter, number) {
  const msg = new SpeechSynthesisUtterance(`${letter} ${number}`);
  msg.rate = 0.85;
  msg.pitch = 1;
  msg.lang = "en-US";

  const voices = speechSynthesis.getVoices();
  const naturalVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Natural"));
  if (naturalVoice) msg.voice = naturalVoice;

  speechSynthesis.speak(msg);
}

socket.on("numberCalled", (data) => {
  speakNumber(data.letter, data.number);

  // highlight but do NOT auto-mark
  document.querySelectorAll(".cell").forEach(cell => {
    if (cell.innerText === String(data.number)) {
      cell.classList.add("call-available");
    }
  });
});

// Manual marking
document.querySelectorAll(".cell").forEach(cell => {
  cell.addEventListener("click", () => {
    if (cell.classList.contains("call-available")) {
      cell.classList.remove("call-available");
      cell.classList.add("called");
    }
  });
});

// Bingo button
document.getElementById("bingoBtn").addEventListener("click", () => {
  const playerName = prompt("Enter your name:");
  if (!playerName) return;
  socket.emit("bingoWinner", { name: playerName });
});

// Show winner banner
socket.on("announceWinner", (data) => {
  alert(`🎉 ${data.name} wins!`);

  const banner = document.createElement("div");
  banner.innerText = `🎉 ${data.name} wins! 🎉`;
  banner.className = "winner-banner";
  document.body.appendChild(banner);

  setTimeout(() => banner.remove(), 5000);
});



