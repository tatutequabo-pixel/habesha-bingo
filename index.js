const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve front-end
app.use(express.static(path.join(__dirname, "public")));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Host password
const HOST_PASSWORD = "Hanilove1";

// Game state
let activeCodes = []; // 30 unique codes per game
let players = {}; // { code: { name, markedNumbers: [], hasBingo } }
let calledNumbers = [];

// Helper: generate 30 unique codes
function generatePlayerCodes(count = 30) {
  const codes = new Set();
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  while (codes.size < count) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += characters[Math.floor(Math.random() * characters.length)];
    }
    codes.add(code);
  }
  return Array.from(codes);
}

// Socket.IO connection
io.on("connection", (socket) => {

  // Host starts game
  socket.on("start-game", (password) => {
    if (password !== HOST_PASSWORD) {
      socket.emit("error-message", "Invalid host password");
      return;
    }
    activeCodes = generatePlayerCodes(30);
    players = {};
    calledNumbers = [];
    io.emit("game-started", { codes: activeCodes });
  });

  // Player tries to join
  socket.on("join-game", ({ name, code }) => {
    if (!activeCodes.includes(code)) {
      socket.emit("join-error", "Invalid code");
      return;
    }
    players[code] = { name, markedNumbers: [], hasBingo: false, socketId: socket.id };
    socket.emit("join-success", { code });
  });

  // Host calls number
  socket.on("call-number", (number) => {
    if (!calledNumbers.includes(number)) {
      calledNumbers.push(number);
      io.emit("number-called", number);
    }
  });

  // Player marks number
  socket.on("mark-number", ({ code, number }) => {
    if (!players[code] || players[code].hasBingo) return;
    if (!players[code].markedNumbers.includes(number)) {
      players[code].markedNumbers.push(number);
    }

    // Check Bingo
    if (checkBingo(players[code].markedNumbers)) {
      players[code].hasBingo = true;
      io.emit("bingo-winner", { name: players[code].name });
    }
  });

  // Reset game
  socket.on("reset-game", () => {
    activeCodes = [];
    players = {};
    calledNumbers = [];
    io.emit("game-reset");
  });

  socket.on("disconnect", () => {
    // Optional: handle player disconnect
  });
});

// Bingo detection (simple example: any full row/column/diagonal)
function checkBingo(markedNumbers) {
  // Assuming player board numbers are flat array 25 numbers (BINGO 5x5)
  // This is a simple placeholder logic
  const winningSets = [
    [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24], // rows
    [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24], // cols
    [0,6,12,18,24],[4,8,12,16,20] // diagonals
  ];

  return winningSets.some(set => set.every(idx => markedNumbers.includes(idx)));
}

server.listen(PORT, () => console.log(`Habesha Bingo server running on port ${PORT}`));




























