const socket = io();
function showBall(number){
  const ball=document.createElement("div");
  ball.className="bingo-ball"; ball.innerText=number;
  document.body.appendChild(ball);
  const x=100+Math.random()*400, y=150+Math.random()*300;
  ball.style.transform=`translate(${x}px, ${y}px)`;
  setTimeout(()=>ball.remove(),2000);
}
function speakNumber(letter,number){
  const msg=new SpeechSynthesisUtterance(letter+" "+number);
  msg.rate=0.85; msg.pitch=1; msg.lang="en-US";
  const voices=speechSynthesis.getVoices();
  const voice=voices.find(v=>v.name.includes("Google")||v.lang==="en-US");
  if(voice) msg.voice=voice;
  speechSynthesis.speak(msg);
}
socket.on("numberCalled",function(data){
  speakNumber(data.letter,data.number);
  showBall(data.number);
  document.querySelectorAll(".cell").forEach(c=>{
    if(c.innerText===String(data.number)) c.classList.add("call-available");
  });
});
document.querySelectorAll(".cell").forEach(c=>{
  c.addEventListener("click",()=>{ if(c.classList.contains("call-available")){c.classList.remove("call-available"); c.classList.add("called");} });
});
document.getElementById("bingoBtn").addEventListener("click",()=>{ const playerName=prompt("Enter your name:"); if(!playerName) return; socket.emit("bingoWinner",{name:playerName}); });
const leaderboard=document.getElementById("leaderboard");
socket.on("announceWinner",data=>{
  alert("🎉 "+data.name+" wins!");
  const banner=document.createElement("div"); banner.innerText="🎉 "+data.name+" wins! 🎉";
  banner.className="winner-banner"; document.body.appendChild(banner);
  setTimeout(()=>banner.remove(),5000);
  const entry=document.createElement("div"); entry.innerText="🎉 "+data.name+" wins!"; leaderboard.appendChild(entry);
});
socket.on("resetGamePlayers",()=>{ document.querySelectorAll(".cell").forEach(c=>c.classList.remove("call-available","called")); alert("Game has been reset by host!"); });



