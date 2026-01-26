const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const {
  createRoom,
  getRoom,
  connectHost,
  startGame,
  callNextNumber,
  joinPlayer,
  claimBingo,
  listRooms,
  endRoom,
} = require("./roomManager");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(express.json());

// --------------------
// SERVE STATIC FILES
// --------------------

// Make sure this path points to your public folder
app.use(express.static(path.join(__dirname, "..", "public")));

// Fallback for SPA routing: send index.html for any unknown route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// --------------------
// ADMIN HTTP ENDPOINTS
// --------------------

app.get("/admin/rooms", (req, res) => {
  res.json(listRooms());
});

app.post("/admin/create-room", (req, res) => {
  const room = createRoom();
  res.json({
    roomCode: room.roomCode,
    playerCodes: room.availablePlayerCodes,
  });
});

app.post("/admin/end-room/:roomCode", (req, res) => {
  try {
    endRoom(req.params.roomCode);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --------------------
// SOCKET.IO LOGIC
// --------------------

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // -------- HOST --------
  socket.on("host:join", ({ roomCode, password }) => {
    try {
      if (password !== "Greenday") {
        socket.emit("error", "Invalid host password");
        return;
      }
      const room = connectHost(roomCode);
      socket.join(roomCode);
      socket.emit("host:joined", {
        roomCode: room.roomCode,
        playerCodes: room.availablePlayerCodes,
      });
    } catch (err) {
      socket.emit("error", err.message);
    }
  });

  socket.on("host:start", ({ roomCode }) => {
    try {
      startGame(roomCode);
      io.to(roomCode).emit("game:started");
    } catch (err) {
      socket.emit("error", err.message);
    }
  });

  socket.on("host:call-number", ({ roomCode }) => {
    try {
      const number = callNextNumber(roomCode);
      if (!number) return;
      io.to(roomCode).emit("game:number-called", number);
    } catch (err) {
      socket.emit("error", err.message);
    }
  });

  // -------- PLAYER --------
  socket.on("player:join", ({ roomCode, name, playerCode }) => {
    try {
      const board = joinPlayer(roomCode, name, playerCode);
      socket.join(roomCode);
      socket.emit("player:joined", {
        board,
        roomCode,
        name,
      });
    } catch (err) {
      socket.emit("error", err.message);
    }
  });

  socket.on("player:bingo", ({ roomCode, playerCode, marked }) => {
    try {
      const result = claimBingo(roomCode, playerCode, marked);
      if (!result.success) {
        socket.emit("bingo:rejected", result.message);
        return;
      }
      // 🎉 WINNER
      io.to(roomCode).emit("game:ended", {
        winner: result.winner,
        board: result.board,
      });
    } catch (err) {
      socket.emit("error", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// --------------------

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🎱 Habesha Bingo server running on port ${PORT}`);
});
