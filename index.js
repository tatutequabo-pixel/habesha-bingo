const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

const HOST_PASSWORD = "Hanilove1";
const MAX_PLAYERS_PER_GAME = 30;

const games = {}; // gameCode -> { hostId, playerCodes, players, calledNumbers, winnerDeclared }

function generateGameCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

function generateUniquePlayerCodes() {
  const codes = new Set();
  while (codes.size < MAX_PLAYERS_PER_GAME) codes.add(Math.random().toString(36).slice(2, 7).toUpperCase());
  return Array.from(codes);
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("host-join", (password, callback) => {
    if (password !== HOST_PASSWORD) return callback({ success: false, message: "Incorrect password" });

    let newGameCode;
    do {
      newGameCode = generateGameCode();
    } while (games[newGameCode]);

    const playerCodes = generateUniquePlayerCodes();

    games[newGameCode] = {
      hostId: socket.id,
      playerCodes: playerCodes.reduce((acc, c) => { acc[c] = { used: false }; return acc; }, {}),
      players: {},
      calledNumbers: [],
      winnerDeclared: false,
    };

    socket.join(newGameCode);
    callback({ success: true, gameCode: newGameCode, playerCodes });
  });

  socket.on("player-join", ({ gameCode, playerCode, playerName }, callback) => {
    const game = games[gameCode];
    if (!game) return callback({ success: false, message: "Game not found" });

    const codeInfo = game.playerCodes[playerCode];
    if (!codeInfo) return callback({ success: false, message: "Invalid player code" });
    if (codeInfo.used) return callback({ success: false, message: "Player code already used" });

    codeInfo.used = true;
    game.players[socket.id] = { name: playerName, code: playerCode };
    socket.join(gameCode);

    callback({ success: true, calledNumbers: game.calledNumbers });
  });

  socket.on("host-call-number", ({ gameCode, number }) => {
    const game = games[gameCode];
    if (!game || game.hostId !== socket.id) return;

    if (!game.calledNumbers.includes(number)) {
      game.calledNumbers.push(number);
      io.to(gameCode).emit("number-called", number);
    }
  });

  socket.on("player-bingo", (gameCode) => {
    const game = games[gameCode];
    if (!game || game.winnerDeclared) return;
    game.winnerDeclared = true;

    const winner = game.players[socket.id];
    if (!winner) return;

    io.to(gameCode).emit("bingo-winner", winner.name);
  });

  socket.on("disconnect", () => {
    for (const [gameCode, game] of Object.entries(games)) {
      if (game.hostId === socket.id) {
        io.to(gameCode).emit("game-ended");
        delete games[gameCode];
        break;
      }
      if (game.players[socket.id]) {
        const playerCode = game.players[socket.id].code;
        if (game.playerCodes[playerCode]) game.playerCodes[playerCode].used = false;
        delete game.players[socket.id];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Habesha Bingo running on port ${PORT}`));



















