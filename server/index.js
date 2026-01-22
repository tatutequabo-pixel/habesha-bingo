const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { RoomManager } = require("./roomManager");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const roomManager = new RoomManager();

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Player joins room
  socket.on("joinRoom", ({ roomCode, playerName, playerCode }) => {
    const room = roomManager.joinRoom(roomCode, playerName, playerCode, socket.id);
    if (room) {
      socket.join(roomCode);
      io.to(socket.id).emit("joined", room.playerBoards[playerCode]);
      io.to(roomCode).emit("updatePlayers", room.getPlayerNames());
    } else {
      io.to(socket.id).emit("errorMsg", "Invalid room code or player code.");
    }
  });

  // Host starts game
  socket.on("startGame", ({ roomCode }) => {
    const room = roomManager.getRoom(roomCode);
    if (room && !room.gameStarted) {
      room.startGame(io);
    }
  });

  // Player calls BINGO
  socket.on("callBingo", ({ roomCode, playerCode }) => {
    const room = roomManager.getRoom(roomCode);
    if (room && room.gameStarted) {
      const win = room.checkBingo(playerCode);
      if (win) {
        io.to(roomCode).emit("bingoWinner", { player: room.players[playerCode].name });
        room.stopGame();
      } else {
        io.to(socket.id).emit("errorMsg", "Not a valid Bingo!");
      }
    }
  });

  socket.on("disconnect", () => {
    roomManager.leaveSocket(socket.id);
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
