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

document.getElementById("callBtn").addEventListener("click", () => {
  socket.emit("callNumber", { role: "host" });
});

socket.on("numberCalled", (data) => {
  speakNumber(data.letter, data.number);
});


