const socket = io();
const numbers = Array.from({length: 75}, (_, i) => i+1);

const callBtn = document.getElementById("callBtn");
const calledDiv = document.getElementById("calledNumbers");

callBtn.addEventListener("click", () => {
  if(numbers.length === 0) return;
  const idx = Math.floor(Math.random() * numbers.length);
  const num = numbers.splice(idx,1)[0];

  socket.emit("numberCalled", num);
  addNumberToDiv(num);

  const msg = new SpeechSynthesisUtterance("Number " + num);
  window.speechSynthesis.speak(msg);
});

function addNumberToDiv(num) {
  const span = document.createElement("span");
  span.textContent = num;
  span.className = "called-number";
  calledDiv.appendChild(span);
}





