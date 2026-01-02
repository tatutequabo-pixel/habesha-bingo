const socket = io();
const boardDiv = document.getElementById("numbersBoard");
const bingoBtn = document.getElementById("bingoBtn");

function displayNumber(num) {
  const span = document.createElement("span");
  span.textContent = num;
  span.className = "called-number";
  boardDiv.appendChild(span);
}

socket.on("initNumbers", (numbers) => {
  numbers.forEach(displayNumber);
});

socket.on("updateNumbers", (num) => displayNumber(num));

bingoBtn.addEventListener("click", () => {
  const name = prompt("Enter your name:");
  if(name) socket.emit("playerBingo", name);
});

socket.on("bingoWinner", (name) => {
  alert(`BINGO!! ${name} won!`);
});






