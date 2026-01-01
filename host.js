const socket=io();

function getLetter(n){ if(n<=15) return"B"; if(n<=30) return"I"; if(n<=45) return"N"; if(n<=60) return"G"; return"O"; }

const callBtn = document.getElementById("callNumber");
const currentCall = document.getElementById("currentCall");
const playersList = document.getElementById("players");

callBtn.onclick=()=>{
  const num=Math.floor(Math.random()*75)+1;
  socket.emit("callNumber",num);
};

socket.on("numberCalled", num=>{
  const letter=getLetter(num);
  currentCall.innerText=`${letter} ${num}`;
  const msg=new SpeechSynthesisUtterance(`${letter} ${num}`);
  msg.rate=1.1; msg.pitch=1.2; 
  window.speechSynthesis.speak(msg);
});

socket.on("playerList", list=>{
  playersList.innerHTML="";
  list.forEach(name=>{
    const li=document.createElement("li");
    li.textContent=name;
    playersList.appendChild(li);
  });
});

socket.on("gameWon", data=>{
  alert(`🎉 BINGO!! ${data.name} WINS! 🎉 Coins: ${data.coins}`);
});




