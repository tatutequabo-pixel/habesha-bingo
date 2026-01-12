const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

let games = {};

function generateUniqueCodes() {
  const codes = new Set();
  while (codes.size < 30) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    codes.add(code);
  }
  return Array.from(codes);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generateBingoBoard() {
  const board = [];
  const ranges = {
    B: [1, 15],
    I: [16, 30],
    N: [31, 45],
    G: [46, 60],
    O: [61, 75],
  };

  for (let column in ranges) {
    let [start, end] = ranges[column];
    let numbers = [];
    for (let i = start; i <= end; i++) numbers.push(i);
    shuffleArray(numbers);
    board.push(numbers.slice(0, 5));
  }

  // Convert column-wise to row-wise
  let finalBoard = [];
  for (let i = 0; i < 5; i++) {
    finalBoard[i] = [];
    for (let j = 0; j < 5; j++) {
      finalBoard[i][j] = board[j][i];
    }
  }
  finalBoard[2][2] = "FREE"; // center free space
  return finalBoard;
}

function checkBingo(board, marked) {
  // board: 5x5, marked: 5x5 boolean
  // Check rows, cols, diagonals

  for (let i = 0; i < 5; i++) {
    // Check row
    if (marked[i].every(Boolean)) return true;
    // Check col
    if ([0,1,2,3,4].every(j => marked[j][i])) return true;
  }
  // Diagonal top-left to bottom-right
  if ([0,1,2,3,4].every(i => marked[i][i])) return true;
  // Diagonal top-right to bottom-left
  if ([0,1,2,3,4].every(i => marked[i][4 - i])) return true;

  return false;
}

io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);

  // Host creates a game
  socket.on("host-create-game", () => {
    const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const playerCodes = generateUniqueCodes();
    const numberPool = Array.from({ length: 75 }, (_, i) => i + 1);
    shuffleArray(numberPool);

    games[gameCode] = {
      hostId: socket.id,
      playerCodes,
      numberPool,
      currentCallIndex: 0,
      players: {}, // socket.id -> { playerName, playerCode, board, marked }
      autoCaller: null,
      winner: null,
    };

    socket.join(gameCode);
    socket.emit("game-created", { gameCode, playerCodes });
    console.log(`Game created: ${gameCode} by host ${socket.id}`);
  });

  // Player joins game
  socket.on("player-join-game", ({ gameCode, playerCode, playerName }) => {
    const game = games[gameCode];
    if (!game) {
      socket.emit("join-error", "Game not found.");
      return;
    }
    if (!game.playerCodes.includes(playerCode)) {
      socket.emit("join-error", "Invalid player code.");
      return;
    }
    // Check if playerCode already taken
    for (const p of Object.values(game.players)) {
      if (p.playerCode === playerCode) {
        socket.emit("join-error", "Player code already used.");
        return;
      }
    }

    const board = generateBingoBoard();
    // marked array parallel to board for called numbers
    let marked = Array(5)
      .fill(0)
      .map(() => Array(5).fill(false));
    // Mark center free space automatically
    marked[2][2] = true;

    game.players[socket.id] = { playerName, playerCode, board, marked };
    socket.join(gameCode);
    socket.emit("board-assigned", board);
    io.to(game.hostId).emit("player-joined", { playerName, playerCode });
    console.log(`Player ${playerName} joined game ${gameCode}`);
  });

  // Host starts auto calling
  socket.on("host-start-calling", (gameCode) => {
    const game = games[gameCode];
    if (!game) return;

    if (game.autoCaller) clearInterval(game.autoCaller);
    game.currentCallIndex = 0;
    game.winner = null;

    game.autoCaller = setInterval(() => {
      if (game.currentCallIndex < game.numberPool.length) {
        const calledNumber = game.numberPool[game.currentCallIndex];
        game.currentCallIndex++;

        io.in(gameCode).emit("number-called", calledNumber);

        // Update marked for all players who have the number on their boards
        for (const [playerSocketId, player] of Object.entries(game.players)) {
          for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
              if (player.board[r][c] === calledNumber) {
                player.marked[r][c] = true;
              }
            }
          }
        }
      } else {
        clearInterval(game.autoCaller);
        io.in(gameCode).emit("game-ended");
      }
    }, 5000);

    console.log(`Started auto calling in game ${gameCode}`);
  });

  // Player calls bingo
  socket.on("player-bingo", (gameCode) => {
    const game = games[gameCode];
    if (!game || game.winner) return; // ignore if game ended or winner already

    const player = game.players[socket.id];
    if (!player) return;

    // Check bingo validity
    if (checkBingo(player.board, player.marked)) {
      game.winner = player.playerName;
      io.in(gameCode).emit("bingo-winner", player.playerName);
      clearInterval(game.autoCaller);
      console.log(`Bingo! Winner: ${player.playerName} in game ${gameCode}`);
    } else {
      socket.emit("bingo-invalid", "No Bingo found on your board.");
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);

    // Remove player from games
    for (const [gameCode, game] of Object.entries(games)) {
      if (socket.id === game.hostId) {
        // End game if host disconnected
        io.in(gameCode).emit("game-ended");
        clearInterval(game.autoCaller);
        delete games[gameCode];
        console.log(`Game ${gameCode} ended because host disconnected`);
        break;
      }
      if (game.players[socket.id]) {
        const playerName = game.players[socket.id].playerName;
        delete game.players[socket.id];
        io.to(game.hostId).emit("player-left", playerName);
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

















