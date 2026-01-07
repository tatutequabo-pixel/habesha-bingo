const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const HOST_PASSWORD = "Hanilove1";
const games = {};

function generateCodes(count = 30) {
  const set = new Set();
  while (set.size < count) {
    set.add(Math.random().toString(36).substring(2, 8).toUpperCase());
  }
  return [...set];
}

function letter(num) {
  if (num <= 15) return "B";
  if (num <= 30) return "I";
  if (num <= 45) return "N";
  if (num <= 60) return "G";
  return "O";
}

io.on("connection", socket => {

  socket.on("host:createGame", password => {
    if (password !== HOST_PASSWORD) {
      return socket.emit("host:error", "Wrong password");
    }

    const gameCode = Math.random().toString(36).substring(2, 7).toUpperCase();

    games[gameCode] = {
      hostId: socket.id,
      codes: generateCodes(),
      players: {},
      called: [],
      winner: null
    };

    socket.join(gameCode);
    socket.emit("host:gameCreated", { gameCode });
  });

  socket.on("player:join", ({ name, code, gameCode }) => {
    const game = games[gameCode];
    if (!game || !game.codes.includes(code)) {
      return socket.emit("player:error", "Invalid game or code");
    }

    game.players[socket.id] = { name };
    socket.join(gameCode);
    socket.emit("player:joined");
  });

  socket.on("host:callNumber", ({ gameCode, number }) => {
    const game = games[gameCode];
    if (!game || game.called.includes(number)) return;

    game.called.push(number);

    io.to(gameCode).emit("numberCalled", {
      number,
      letter: letter(number)
    });
  });

  socket.on("player:claimBingo", gameCode => {
    const game = games[gameCode];
    if (!game || game.winner) return;

    const player = game.players[socket.id];
    if (!player) return;

    game.winner = player.name;
    io.to(gameCode).emit("winnerAnnounced", player.name);
  });

});

server.listen(process.env.PORT || 3000, () =>
  console.log("Habesha Bingo running")
);























