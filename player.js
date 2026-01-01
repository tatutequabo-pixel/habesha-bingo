const socket=io();
const ranges={B:[1,15],I:[16,30],N:[31,45],G:[46,60],O:[61,75]};
let card=[], cells=[], coins=10;

document.getElementById("joinGame").onclick=()=>{
  const name=document.getElementById("playerName").value;
  socket.emit("joinPlayer",name);
  createCard();
};

function createCard(){
  const div=document.getElementById("bingoCard"); div.innerHTML=""; card=[]; cells=[];
  ["B","I","N","G","O"].forEach(col=>{
    for(let i=0;i<5;i++){
      const cell=document.createElement("div"); cell.className="cell";
      cell.onclick=()=>pick(cell,col); div.appendChild(cell); cells.push(cell);
    }
  });
}

function pick(cell,col){
  if(cell.textContent) return;
  const [min,max]=ranges[col]; const num=prompt(`Choose ${col} (${min}-${max})`);
  if(num>=min&&num<=max){ cell.textContent=num; card.push(Number(num)); }
}

document.getElementById("lockCard").onclick=()=>{
  if(card.length===25) socket.emit("lockCard",card); else alert("Complete your 5x5 card before locking!");
};

document.getElementById("bingoBtn").onclick=()=>socket.emit("claimBingo");

socket.on("numberCalled", num=>{
  document.getElementById("status").innerText=`Called: ${num}`;
  const letter=["B","I","N","G","O"][(num-1)/15|0];
  const msg=new SpeechSynthesisUtterance(`${letter} ${num}`);
  msg.rate=1; msg.pitch=1.1; speechSynthesis.speak(msg);
});

socket.on("invalidBingo", ()=>alert("Not a valid BINGO yet!"));

socket.on("gameWon", data=>{
  document.getElementById("status").innerText=`🎉 BINGO!! ${data.name} WINS! 🎉`;
  coins=data.coins; document.getElementById("coins").innerText=coins;
  highlightCells(data.highlight);
});

function highlightCells(indexes){
  cells.forEach((c,i)=>c.classList.remove("highlight"));
  indexes.forEach(i=>cells[i].classList.add("highlight"));
}




