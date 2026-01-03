const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

let calledNumbers = [];
let gameOver = false;

function getLetter(num) {
  if (num <= 15) return "B";
  if (num <= 30) return "I";
  if (num <= 45) return "N";
  if (num <= 60) return "G";
  return "O";
}

function generateNumber() {
  if (calledNumbers.length >= 75 || gameOver) return null;
  let num;
  do {
    num = Math.floor(Math.random() * 75) + 1;
  } while (calledNumbers.includes(num));
  calledNumbers.push(num);
  return num;
}

io.on("connection", (socket) => {
  socket.on("callNumber", (data) => {
    if (data.role !== "host" || gameOver) return;
    const number = generateNumber();
    if (!number) return;
    const letter = getLetter(number);
    io.emit("numberCalled", { number, letter });
  });

  socket.on("bingoWinner", (data) => {
    if (gameOver) return;
    gameOver = true;
    io.emit("announceWinner", { name: data.name });
  });

  socket.on("resetGame", () => {
    calledNumbers = [];
    gameOver = false;
    io.emit("resetGamePlayers");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Habesha Bingo running on port " + PORT));




























