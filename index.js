const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

const PORT = process.env.PORT || 3000;

// Serve public folder
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ================== GAME STATE ==================
let activeGame = {
  codes: [],        // 30 unique codes
  players: {},      // {code: {name, board, socketId}}
  calledNumbers: []
};

// ================== SOCKET.IO ==================
io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // ================= START GAME =================
  socket.on("start-game", (password) => {
    const HOST_PASSWORD = "Hanilove1";
    if (password !== HOST_PASSWORD) return;

    // Reset game state
    activeGame.codes = [];
    activeGame.players = {};
    activeGame.calledNumbers = [];

    while (activeGame.codes.length < 30) {
      const code = Math.random().toString(36).substring(2,6).toUpperCase();
      if (!activeGame.codes.includes(code)) activeGame.codes.push(code);
    }

    io.emit("game-started", { codes: activeGame.codes });
  });

  // ================= PLAYER JOIN =================
  socket.on("join-game", ({ name, code }) => {
    code = code.toUpperCase();
    if (!activeGame.codes.includes(code)) {
      return socket.emit("join-error", "Invalid code or already used");
    }

    const board = generateBoard();
    activeGame.players[code] = { name, board, socketId: socket.id };
    activeGame.codes = activeGame.codes.filter(c => c !== code);

    // Send player their board and called numbers
    socket.emit("join-success", { name, board, calledNumbers: activeGame.calledNumbers });
  });

  // ================= CALL NUMBER =================
  socket.on("call-number", (num) => {
    num = num.toUpperCase();
    if (!activeGame.calledNumbers.includes(num)) {
      activeGame.calledNumbers.push(num);

      // Broadcast number to all
      io.emit("number-called", num);

      // Check winners
      for (const player of Object.values(activeGame.players)) {
        if (checkBingo(player.board, activeGame.calledNumbers)) {
          io.emit("bingo-winner", { name: player.name });
          break;
        }
      }
    }
  });

  // ================= RESET GAME =================
  socket.on("reset-game", () => {
    activeGame = { codes: [], players: {}, calledNumbers: [] };
    io.emit("game-reset");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

// ================== HELPERS ==================
function generateBoard() {
  const board = [];
  const used = new Set();
  for (let col=0; col<5; col++) {
    for (let row=0; row<5; row++) {
      let num;
      do { num = Math.floor(Math.random() * 15 + 1 + col*15); } while (used.has(num));
      used.add(num);
      board.push(num);
    }
  }
  return board;
}

function checkBingo(board, calledNumbers) {
  const c = calledNumbers.map(n => parseInt(n.replace(/[^\d]/g,"")));
  const b = board;

  const grid = [];
  for (let i=0;i<5;i++) grid.push(b.slice(i*5,i*5+5));

  // Rows
  for (let row of grid) if (row.every(n => c.includes(n))) return true;

  // Columns
  for (let col=0; col<5; col++) if (grid.every(row=>c.includes(row[col]))) return true;

  // Diagonals
  if ([0,1,2,3,4].every(i => c.includes(grid[i][i]))) return true;
  if ([0,1,2,3,4].every(i => c.includes(grid[i][4-i]))) return true;

  return false;
}

// ================== START SERVER ==================
http.listen(PORT, () => console.log("Server running on port", PORT));

























