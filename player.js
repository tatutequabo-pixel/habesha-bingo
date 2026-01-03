const socket = io();
const board=document.querySelectorAll(".cell") || [];
const leaderboard=document.getElementById("leaderboard");
let calledNumbers=[];

// Map of number => cell element
const numberCellMap={};
board.forEach(c=>numberCellMap[parseInt(c.innerText)]=c);

// Balls container to persist numbers
const ballsContainer=document.createElement("div");
ballsContainer.style.position="fixed";
ballsContainer.style.top="100px";
ballsContainer.style.left="50%";
ballsContainer.style.transform="translateX(-50%)";
ballsContainer.style.display="flex";
ballsContainer.style.flexWrap="wrap";
ballsContainer.style.gap="10px";
ballsContainer.style.zIndex="1000";
document.body.appendChild(ballsContainer);

// Show ball permanently
function showBall(number){
  const ball=document.createElement("div");
  ball.className="bingo-ball"; ball.innerText=number;
  ball.style.width="80px"; ball.style.height="80px";
  ball.style.fontSize="32px";
  ballsContainer.appendChild(ball);
}

// Speak number
function speakNumber(letter,number){
  const msg=new SpeechSynthesisUtterance(`${letter} ${number}`);
  msg.rate=0.85; msg.pitch=1; msg.lang="en-US";
  const voices=speechSynthesis.getVoices();
  const voice=voices.find(v=>v.lang==="en-US");
  if(voice) msg.voice=voice;
  speechSynthesis.speak(msg);
}

// Host called a number
socket.on("numberCalled",data=>{
  if(!calledNumbers.includes(data.number)) calledNumbers.push(data.number);
  speakNumber(data.letter,data.number);
  showBall(data.number);

  const cell=numberCellMap[data.number];
  if(cell) cell.classList.add("call-available");
});

// Manual marking by player
board.forEach(c=>{
  c.addEventListener("click",()=>{
    if(c.classList.contains("call-available")){
      c.classList.remove("call-available");
      c.classList.add("called");
    }
  });
});

// Bingo check
function checkBingo(){
  const cells=board;
  let status=cells.map(c=>c.classList.contains("called")?1:0);
  let win=false;

  // Rows
  for(let i=0;i<5;i++) if(status.slice(i*5,i*5+5).every(v=>v===1)) win=true;
  // Columns
  for(let i=0;i<5;i++) if([status[i],status[i+5],status[i+10],status[i+15],status[i+20]].every(v=>v===1)) win=true;
  // Diagonals
  if([status[0],status[6],status[12],status[18],status[24]].every(v=>v===1)) win=true;
  if([status[4],status[8],status[12],status[16],status[20]].every(v=>v===1)) win=true;

  return win;
}

// Player clicks Bingo
document.getElementById("bingoBtn").addEventListener("click",()=>{
  const name=prompt("Enter your name:");
  if(!name) return;
  if(checkBingo()){
    socket.emit("bingoWinner",{name});
  } else alert("❌ Not a valid Bingo yet!");
});

// Winner announcement
socket.on("announceWinner",data=>{
  alert(`🎉 ${data.name} wins!`);
  const banner=document.createElement("div");
  banner.innerText=`🎉 ${data.name} wins! 🎉`;
  banner.className="winner-banner";
  document.body.appendChild(banner);
  setTimeout(()=>banner.remove(),5000);

  const entry=document.createElement("div");
  entry.innerText=`🎉 ${data.name} wins!`;
  leaderboard.appendChild(entry);
});

// Reset
socket.on("resetGamePlayers",()=>{
  board.forEach(c=>c.classList.remove("called","call-available"));
  calledNumbers=[];
  ballsContainer.innerHTML="";
  alert("Game has been reset by host!");
});



