const socket = io();
let calledNumbers = [];
let gameOver = false;

function getLetter(num){
  if(num<=15) return "B";
  if(num<=30) return "I";
  if(num<=45) return "N";
  if(num<=60) return "G";
  return "O";
}

function generateNumber(){
  if(calledNumbers.length>=75 || gameOver){ alert("No more numbers!"); return null;}
  let num;
  do{ num=Math.floor(Math.random()*75)+1;} while(calledNumbers.includes(num));
  calledNumbers.push(num);
  return num;
}

document.getElementById("callBtn").addEventListener("click", ()=>{
  if(gameOver){ alert("Game over! Reset to play again."); return;}
  const number=generateNumber();
  if(!number) return;
  const letter=getLetter(number);
  socket.emit("callNumber",{role:"host"});
  document.getElementById("lastNumber").innerText=`Last Number: ${letter} ${number}`;
});

document.getElementById("resetBtn").addEventListener("click", ()=>{
  if(confirm("Reset game?")){
    calledNumbers=[];
    gameOver=false;
    socket.emit("resetGame");
    document.getElementById("lastNumber").innerText="Last Number: --";
    alert("✅ Game reset complete.");
  }
});

