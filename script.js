// ======================
// Complete Multiplayer Bingo Script
// ======================

let roomId = "";
let playerId = "";

// HTML elements
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const joinRoomInput = document.getElementById("joinRoomInput");
const lobby = document.getElementById("lobby");
const gameDiv = document.getElementById("game");
const roomIdDisplay = document.getElementById("roomIdDisplay");
const boardDiv = document.getElementById("board");
const currentTurnSpan = document.getElementById("currentTurn");
const callNumberBtn = document.getElementById("callNumberBtn");
const calledNumberDisplay = document.getElementById("calledNumber");
const bingoSound = document.getElementById("bingoSound");

// Number caller
let numbersToCall = Array.from({length:25}, (_,i)=>i+1);
let calledNumbers = [];

// ======= CREATE ROOM =======
createRoomBtn.addEventListener("click", () => {
  roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  playerId = "Player1";

  const initialBoard = Array.from({ length: 25 }, (_, i) => i + 1);
  initialBoard[12] = "X"; // Free center

  database.ref(`rooms/${roomId}`).set({
    board: initialBoard,
    players: { Player1: playerId },
    turn: playerId
  });

  startGame();
});

// ======= JOIN ROOM =======
joinRoomBtn.addEventListener("click", () => {
  roomId = joinRoomInput.value.toUpperCase();
  playerId = "Player2";

  database.ref(`rooms/${roomId}/players`).update({ Player2: playerId });
  startGame();
});

// ======= START GAME =======
function startGame() {
  lobby.style.display = "none";
  gameDiv.style.display = "block";
  roomIdDisplay.textContent = roomId;

  const roomRef = database.ref(`rooms/${roomId}`);
  roomRef.on("value", snapshot => {
    const data = snapshot.val();
    if (!data) return;

    renderBoard(data.board);
    currentTurnSpan.textContent = data.turn;

    if(data.turn === playerId){
      currentTurnSpan.style.color = "green";
    } else {
      currentTurnSpan.style.color = "red";
    }
  });
}

// ======= MARK CELL =======
function markCell(index) {
  const turnRef = database.ref(`rooms/${roomId}/turn`);
  turnRef.once("value").then(snapshot => {
    if (snapshot.val() !== playerId) return;

    const cellRef = database.ref(`rooms/${roomId}/board/${index}`);
    cellRef.set("X");

    const nextTurn = playerId === "Player1" ? "Player2" : "Player1";
    database.ref(`rooms/${roomId}/turn`).set(nextTurn);
  });
}

// ======= CHECK BINGO =======
function checkBingo(board) {
  const size = 5;
  let winnerCells = [];

  // Rows
  for (let r=0; r<size; r++){
    let row = [], bingo=true;
    for(let c=0;c<size;c++){
      const index = r*size + c;
      row.push(index);
      if(board[index]!=="X") bingo=false;
    }
    if(bingo) winnerCells=row;
  }

  // Columns
  for (let c=0;c<size;c++){
    let col=[], bingo=true;
    for(let r=0;r<size;r++){
      const index = r*size + c;
      col.push(index);
      if(board[index]!=="X") bingo=false;
    }
    if(bingo) winnerCells=col;
  }

  // Diagonals
  let diag1=[], diag2=[], bingo1=true, bingo2=true;
  for(let i=0;i<size;i++){
    diag1.push(i*size+i);
    diag2.push(i*size+(size-1-i));
    if(board[i*size+i]!=="X") bingo1=false;
    if(board[i*size+(size-1-i)]!=="X") bingo2=false;
  }
  if(bingo1) winnerCells=diag1;
  if(bingo2) winnerCells=diag2;

  return winnerCells;
}

// ======= RENDER BOARD =======
function renderBoard(board){
  boardDiv.innerHTML="";
  const winningCells = checkBingo(board);

  board.forEach((num,i)=>{
    const cell = document.createElement("div");
    cell.className="cell";

    if(num==="X") cell.classList.add("marked");
    cell.textContent=num;

    if(winningCells.includes(i)){
      cell.style.background="#FFD700";
      cell.style.color="black";
      cell.style.transform="scale(1.2)";
    }

    cell.addEventListener("click",()=>markCell(i));
    boardDiv.appendChild(cell);
  });

  if(winningCells.length>0){
    setTimeout(()=>alert(`Bingo! ${playerId} wins! 🎉`),100);
  }
}

// ======= NUMBER CALLER =======
callNumberBtn.addEventListener("click", callNumber);

function callNumber(){
  if(numbersToCall.length===0) return alert("All numbers called!");
  const index = Math.floor(Math.random()*numbersToCall.length);
  const number = numbersToCall.splice(index,1)[0];
  calledNumbers.push(number);
  displayCalledNumber(number);
  highlightNumberOnBoard(number);
}

function displayCalledNumber(number){
  calledNumberDisplay.textContent=`Number Called: ${number}`;
  bingoSound.play();
}

function highlightNumberOnBoard(number){
  const cells = boardDiv.querySelectorAll(".cell");
  cells.forEach(cell=>{
    if(cell.textContent==number){
      cell.style.background="#FF5722";
      setTimeout(()=>cell.style.background="#eee",500);
    }
  });
}








