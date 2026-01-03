const socket = io();

function speakNumber(letter, number) {
  const msg = new SpeechSynthesisUtterance(`${letter} ${number}`);
  msg.rate = 0.9;
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}

document.getElementById("callBtn").addEventListener("click", () => {
  socket.emit("callNumber", { role: "host" });
});

socket.on("numberCalled", (data) => {
  speakNumber(data.letter, data.number);
});



