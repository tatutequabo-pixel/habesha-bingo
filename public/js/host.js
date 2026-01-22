const socket = io();

const HOST_PASSWORD = "Greenday1";
let roomCode = "";

function loginHost() {
  const pass = document.getElementById("hostPassword").value;
  if (pass === HOST_PASSWORD) {
    document.getElementById("loginDiv").style.display = "none";
    document.getElementById("hostControls").style.display = "block";
    roomCode = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById("roomCode").innerText = roomCode;
    console.log("Room created:", roomCode);
  } else {
    document.getElementById("loginError").innerText = "Incorrect Password!";
  }
}

function startGame() {
  socket.emit("startGame", { roomCode });
  alert("Game started! Numbers will auto-call every 15 seconds.");
}

socket.on("numberCalled", (num) => {
  const div = document.getElementById("calledNumbers");
  const p = document.createElement("p");
  p.innerText = "Number Called: " + num;
  div.appendChild(p);
});
