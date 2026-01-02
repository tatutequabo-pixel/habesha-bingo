const socket = io();
let numbersCalled = [];
const allNumbers = Array.from({length:75}, (_,i)=>i+1);

const callBtn = document.getElementById("callNumber");
const currentCall = document.getElementById("currentCall");
const playersList = document.getElementById("players");

function callNumber(){
  if(numbersCalled.length >= allNumbers.length) return alert("All numbers called!");
  let number;
  do{
    number = allNumbers[Math.floor(Math.random()*allNumbers.length)];
  }while(numbersCalled.includes(number));

  numbersCalled.push(number);
  currentCall.textContent = number;
  socket.emit("numberCalled", number);

  if("speechSynthesis" in window){
    const msg = new SpeechSynthesisUtterance(`Number ${number}`);
    window.speechSynthesis.speak(msg);
  }
}

socket.on("updatePlayers", (player) => {
  playersList.innerHTML = "";
  const ul = document.createElement("ul");
  Object.values(player).forEach(p=>{
    const li = document.createElement("li");
    li.textContent = p.name;
    playersList.appendChild(li);
  });
});

callBtn.onclick = callNumber;




