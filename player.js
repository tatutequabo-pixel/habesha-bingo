const socket = io();
const nameInput = document.getElementById("playerName");
const startBtn = document.getElementById("startBtn");
const boardContainer = document.getElementById("playerBoardContainer");
const boardDiv = document.getElementById("board");
const displayName = document.getElementById("playerDisplayName");
const bingoBtn = document.getElementById("bingoBtn");
const leaderboard = document.getElementById("leaderboard");

let playerName = "";
let board = [];
let calledNumbers = [];
let numberCellMap = {};
let ballsContainer = null;

// Generate 5x5 board numbers
function generateBoard() {
  let numbers = [];
  while(numbers.length < 25){
    let n = Math.floor(Math.random()*75)+1;
    if(!numbers.includes(n)) numbers.push(n);
  }
  return numbers;
}

// Render board
function renderBoard() {
  boardDiv.innerHTML = "";
  numberCellMap = {};
  board.forEach(n => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.innerText = n;
    boardDiv.appendChild(cell);
    numberCellMap[n] = cell;

    // Manual marking
    cell.addEventListener("click", () => {
      if(cell.classList.contains("call-available")){
        cell.classList.remove("call-available");
        cell.classList.add("called");
      }
    });
  });
}

// Show persistent balls
function createBallsContainer() {
  ballsContainer = document.createElement("div");
  ballsContainer.style.position = "fixed";
  ballsContainer.style.top = "100px";
  ballsContainer.style.left = "50%";
  ballsContainer.style.transform = "translateX(-50%)";
  ballsContainer.style.display = "flex";
  ballsContainer.style.flexWrap = "wrap";
  ballsContainer.style.gap = "10px";
  ballsContainer.style.zIndex = "1000";
  document.body.appendChild(ballsContainer);
}

function showBall(number) {
  const ball = document.createElement("div");
  ball.className = "bingo-ball";
  ball.innerText = number;
  ball.style.width = "80px";
  ball.style.height = "80px";
  ball.style.fontSize = "32px";
  ballsContainer.appendChild(ball);
}

// Speak number
function speakNumber(letter, number) {
  const msg = new SpeechSynthesisUtterance(`${letter} ${number}`);
  msg.rate = 0.85; msg.pitch = 1; msg.lang = "en-US";
  const voices = speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang === "en-US");
  if(voice) msg.voice = voice;
  speechSynthesis.speak(msg);
}

// Check Bingo
function checkBingo() {
  const status = board.map(n => numberCellMap[n].classList.contains("called") ? 1 : 0);
  let win = false;

  // Rows
  for(let i=0;i<5;i++) if(status.slice(i*5,i*5+5).every(v=>v===1)) win=true;
  // Columns
  for(let i=0;i<5;i++) if([status[i],status[i+5],status[i+10],status[i+15],status[i+20]].every(v=>v===1)) win=true;
  // Diagonals
  if([status[0],status[6],status[12],status[18],status[24]].every(v=>v===1)) win=true;
  if([status[4],status[8],status[12],status[16],status[20]].every(v=>v===1)) win=true;

  return win;
}

// Event listeners
bingoBtn.addEventListener("click", () => {
  if(!playerName) return alert("Enter your name first!");
  if(checkBingo()) {
    socket.emit("bingoWinner", {name: playerName});
  } else alert("❌ Not a valid Bingo yet!");
});

// Socket events
socket.on("numberCalled", data => {
  if(!calledNumbers.includes(data.number)) calledNumbers.push(data.number);
  speakNumber(data.letter, data.number);
  showBall(data.number);

  const cell = numberCellMap[data.number];
  if(cell) cell.classList.add("call-available");
});

socket.on("announceWinner", data => {
  alert(`🎉 ${data.name} wins!`);
  const banner = document.createElement("div");
  banner.innerText = `🎉 ${data.name} wins! 🎉`;
  banner.className = "winner-banner";
  document.body.appendChild(banner);
  setTimeout(()=>banner.remove(),5000);

  const entry = document.createElement("div");
  entry.innerText = `🎉 ${data.name} wins!`;
  leaderboard.appendChild(entry);
});

socket.on("resetGamePlayers", () => {
  board.forEach(n => {
    const cell = numberCellMap[n];
    cell.classList.remove("called", "call-available");
  });
  calledNumbers = [];
  ballsContainer.innerHTML = "";
  alert("Game has been reset by host!");
});

// Start game after name input
startBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if(!name) return alert("Please enter your name!");
  playerName = name;
  displayName.innerText = `Player: ${playerName}`;
  board = generateBoard();
  renderBoard();
  createBallsContainer();
  boardContainer.style.display = "block";
  document.getElementById("nameContainer").style.display = "none";
});



