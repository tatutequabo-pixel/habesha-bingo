const socket = io();
let playerName = "";
const joinBtn = document.getElementById("joinGame");
const playerNameInput = document.getElementById("playerName");
const bingoCardDiv = document.getElementById("bingoCard");
const lockBtn = document.getElementById("lockCard");
const bingoBtn = document.getElementById("bingoBtn");
const status = document.getElementById("status");

let selectedNumbers = [];

function generateCard(){
  const cardNumbers=[];
  while(cardNumbers.length<25){
    const n=Math.floor(Math.random()*75)+1;
    if(!cardNumbers.includes(n)) cardNumbers.push(n);
  }
  bingoCardDiv.innerHTML="";
  cardNumbers.forEach(n=>{
    const btn=document.createElement("button");
    btn.textContent=n;
    btn.onclick=()=> {
      if(!selectedNumbers.includes(n)){
        selectedNumbers.push(n);
        btn.style.background="gold";
      }
    };
    bingoCardDiv.appendChild(btn);
  });
}

joinBtn.onclick = ()=>{
  playerName = playerNameInput.value.trim();
  if(!playerName) return alert("Enter your name!");
  socket.emit("playerJoin", playerName);
  joinBtn.disabled=true;
  generateCard();
};

lockBtn.onclick = ()=>{
  bingoCardDiv.querySelectorAll("button").forEach(btn=>btn.disabled=true);
};

bingoBtn.onclick = ()=>{
  if(!playerName) return alert("Join first!");
  socket.emit("bingo", playerName);
};

socket.on("numberCalled", (number)=>{
  bingoCardDiv.querySelectorAll("button").forEach(btn=>{
    if(parseInt(btn.textContent)===number) btn.style.background="red";
  });
});

socket.on("bingoWin", (winner)=>{
  status.textContent = `🎉 BINGO!! ${winner} wins!`;
});





