console.log("🔥 NEW BINGO SERVER VERSION LOADED 🔥");

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

const HOST_PASSWORD = "Hanilove1";

let gameActive = false;
let playerCodes = [];
let players = {};
let calledNumbers = [];
let numbersToCall = [];

// ================= HELPERS =================
function generateCodes(count = 30) {
  return Array.from({ length: count }, () =>
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
}

function generateBoard() {
  const board = [];
  for (let col = 0; col < 5; col++) {
    const nums = [];
    while (nums.length < 5) {
      const n = Math.floor(Math.random() * 15) + 1 + col * 15;
      if (!nums.includes(n)) nums.push(n);
    }
    board.push(...nums);
  }
  return board;
}

function checkBingo(board) {
  const marked = board.map(n => calledNumbers.includes(n));

  const lines = [
    [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],
    [15,16,17,18,19],[20,21,22,23,24],
    [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],
    [3,8,13,18,23],[4,9,14,19,24],
    [0,6,12,18,24],[4,8,12,16,20]
  ];

  return lines.some(line => line.every(i => marked[i]));
}

// ================= SOCKET =================
io.on("connection", socket => {

  socket.on("start-game", password => {
    if (password !== HOST_PASSWORD) return;

    gameActive = true;
    playerCodes = generateCodes();
    players = {};
    calledNumbers = [];

    numbersToCall = [];
    for (let col = 0; col < 5; col++) {
      for (let i = 1; i <= 15; i++) {
        numbersToCall.push(i + col * 15);
      }
    }

    io.emit("game-started", { codes: playerCodes });
  });

  socket.on("join-game", ({ name, code }) => {
    if (!gameActive) return socket.emit("join-error", "Game not started");
    if (!playerCodes.includes(code)) return socket.emit("join-error", "Invalid code");
    if (Object.values(players).some(p => p.code === code))
      return socket.emit("join-error", "Code already used");

    const board = generateBoard();
    players[socket.id] = { name, code, board };

    socket.emit("join-success", {
      name,
      board,
      calledNumbers
    });
  });

  socket.on("call-number", number => {
    const num = parseInt(number.replace(/\D/g, ""));
    if (calledNumbers.includes(num)) return;

    calledNumbers.push(num);
    io.emit("number-called", number);

    for (const id in players) {
      if (checkBingo(players[id].board)) {
        io.emit("bingo-winner", { name: players[id].name });
        gameActive = false;
        return;
      }
    }
  });

  socket.on("reset-game", () => {
    gameActive = false;
    players = {};
    calledNumbers = [];
    playerCodes = [];
    io.emit("game-reset");
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Habesha Bingo running");
});
























