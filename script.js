const board = document.getElementById("bingo-board");
const callBtn = document.getElementById("callBtn");
const resetBtn = document.getElementById("resetBtn");
const calledNumberDisplay = document.getElementById("called-number");

let availableNumbers = [];
let calledNumbers = [];

// Create bingo board
function createBoard() {
  board.innerHTML = "";
  let nums = [];

  for (let i = 1; i <= 25; i++) nums.push(i);
  nums.sort(() => Math.random() - 0.5);

  nums.forEach(num => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = num;

    cell.addEventListener("click", () => {
      if (calledNumbers.includes(num)) {
        cell.classList.toggle("marked");
      }
    });

    board.appendChild(cell);
  });
}

// Call a random number
function callNumber() {
  if (availableNumbers.length === 0) return;

  const index = Math.floor(Math.random() * availableNumbers.length);
  const number = availableNumbers.splice(index, 1)[0];
  calledNumbers.push(number);

  calledNumberDisplay.textContent = number;
}

// Reset game
function resetGame() {
  availableNumbers = [];
  calledNumbers = [];
  calledNumberDisplay.textContent = "—";

  for (let i = 1; i <= 25; i++) availableNumbers.push(i);
  createBoard();
}

// Button events
callBtn.addEventListener("click", callNumber);
resetBtn.addEventListener("click", resetGame);

// Start game
resetGame();





