const socket = io();

function speakNumber(letter, number) {
  const msg = new SpeechSynthesisUtterance(`${letter} ${number}`);
  msg.rate = 0.9;
  msg.lang = "en-US";
  speechSynthesis.speak(msg);
}

socket.on("numberCalled", (data) => {
  speakNumber(data.letter, data.number);

  document.querySelectorAll(".cell").forEach(cell => {
    if (cell.innerText == data.number) {
      cell.classList.add("call-available");
    }
  });
});

document.querySelectorAll(".cell").forEach(cell => {
  cell.addEventListener("click", () => {
    if (cell.classList.contains("call-available")) {
      cell.classList.add("called");
      cell.classList.remove("call-available");
    }
  });
});




