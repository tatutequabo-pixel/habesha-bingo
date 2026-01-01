const express=require("express");
const http=require("http");
const {Server}=require("socket.io");

const app=express();
const server=http.createServer(app);
const io=new Server(server);

app.use(express.static(__dirname));

let hostId=null;
let players={};
let calledNumbers=[];
let gameOver=false;

io.on("connection", socket=>{

  socket.on("registerHost", ()=>{
    if(!hostId){ hostId=socket.id; socket.emit("hostApproved"); console.log("Host connected"); }
    else socket.disconnect(true);
  });

  socket.on("joinPlayer", name=>{
    players[socket.id]={name, card:[], coins:10};
    updatePlayers();
  });

  socket.on("lockCard", card=>{ if(players[socket.id]) players[socket.id].card=card; });

  socket.on("callNumber", num=>{
    if(socket.id!==hostId||gameOver) return;
    if(!calledNumbers.includes(num)){
      calledNumbers.push(num);
      io.emit("numberCalled", num);
    }
  });

  socket.on("claimBingo", ()=>{
    if(gameOver) return;
    const player=players[socket.id]; if(!player) return;
    const highlight=getWinningCells(player.card);
    if(highlight.length){
      gameOver=true;
      player.coins+=5;
      io.emit("gameWon",{name:player.name, highlight, coins:player.coins});
    } else socket.emit("invalidBingo");
  });

  socket.on("disconnect", ()=>{
    if(socket.id===hostId) hostId=null;
    delete players[socket.id];
    updatePlayers();
  });

});

function updatePlayers(){
  const list=Object.values(players).map(p=>p.name);
  io.emit("playerList", list);
}

function getWinningCells(card){
  if(!card||card.length!==25) return [];
  const matrix=[]; for(let i=0;i<5;i++) matrix[i]=card.slice(i*5,i*5+5);
  for(let r=0;r<5;r++) if(matrix[r].every(n=>calledNumbers.includes(n))) return matrix[r].map((_,i)=>r*5+i);
  for(let c=0;c<5;c++){ let win=true; for(let r=0;r<5;r++) if(!calledNumbers.includes(matrix[r][c])) win=false; if(win) return [0,1,2,3,4].map(i=>i*5+c); }
  let diag1=true, diag2=true;
  for(let i=0;i<5;i++){ if(!calledNumbers.includes(matrix[i][i])) diag1=false; if(!calledNumbers.includes(matrix[i][4-i])) diag2=false; }
  if(diag1) return [0,6,12,18,24]; if(diag2) return [4,8,12,16,20];
  return [];
}

server.listen(3000, ()=>console.log("Habesha Bingo running on port 3000"));
































