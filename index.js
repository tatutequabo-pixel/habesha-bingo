const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

const PORT = process.env.PORT || 3000;

// Serve public files
app.use(express.static(path.join(__dirname, "public")));

let activeGame = {
  codes: [],
  players: {}, // key: code, value: {name, board, socketId}
  calledNumbers: []
};

// ================= ROUTES =================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ================= SOCKET.IO =================
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Host starts game
  socket.on("start-game", (password) => {
    // Generate 30 unique codes
    activeGame.codes = [];
    activeGame.players = {};
    activeGame.calledNumbers = [];

    while (activeGame.codes.length < 30) {
      let code = Math.random().toString(36).substring(2, 6).toUpperCase();
      if (!activeGame.codes.includes(code)) activeGame.codes.push(code);
    }

    io.emit("game-started", { codes: activeGame.codes });
  });

  // Player joins
  socket.on("join-game", ({ name, code }) => {
    code = code.toUpperCase();
    if (!activeGame.codes.includes(code)) {
      return socket.emit("join-error", "Invalid code or already used");
    }

    // Assign board to player
    const board = generateBoard();
    activeGame.players[code] = { name, board, socketId: socket.id };
    activeGame.codes = activeGame.codes.filter(c => c !== code);

    // Send player their board
    socket.emit("join-success", { name, board, calledNumbers: activeGame.calledNumbers });
  });

  // Host calls a number
  socket.on("call-number", (num) => {
    if (!activeGame.calledNumbers.includes(num)) {
      activeGame.calledNumbers.push(num);
      io.emit("number-called", num);

      // Check for winner
      for (const [code, player] of Object.entries(activeGame.players)) {
        if (checkBingo(player.board, activeGame.calledNumbers)) {
          io.emit("bingo-winner", { name: player.name });
          break;
        }
      }
    }
  });

  // Reset game
  socket.on("reset-game", () => {
    activeGame = { codes: [], players: {}, calledNumbers: [] };
    io.emit("game-reset");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ================= FUNCTIONS =================
function generateBoard() {
  const board = [];
  const used = new Set();
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 5; row++) {
      let num;
      do {
        num = Math.floor(Math.random() * 15 + 1 + col * 15);
      } while (used.has(num));
      used.add(num);
      board.push(num);
    }
  }
  return board;
}

function checkBingo(board, called) {
  const c = called;
  const b = board;

  // Convert board to 5x5
  const grid = [];
  for (let i = 0; i < 5; i++) grid.push(b.slice(i*5, i*5+5));

  // Check rows
  for (let row of grid) if (row.every(n => c.includes(n))) return true;

  // Check columns
  for (let col = 0; col < 5; col++) {
    if (grid.every(row => c.includes(row[col]))) return true;
  }

  // Check diagonals
  if ([0,1,2,3,4].every(i => c.includes(grid[i][i]))) return true;
  if ([0,1,2,3,4].every(i => c.includes(grid[i][4-i]))) return true;

  return false;
}

// ================= START SERVER =================
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


























