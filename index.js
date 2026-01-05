const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve public folder
app.use(express.static(path.join(__dirname, "public")));

// ✅ FIX: Root route (prevents "Cannot GET /")
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ======================
   GAME SESSION LOGIC
====================== */

let session = null;

function generateCode() {
  return "HB-" + crypto.randomBytes(2).toString("hex").toUpperCase();
}

function generateCard() {
  const ranges = [
    [1, 15],   // B
    [16, 30],  // I
    [31, 45],  // N
    [46, 60],  // G
    [61, 75]   // O
  ];

  let card = [];
  ranges.forEach(([min, max]) => {
    let nums = [];
    while (nums.length < 5) {
      let n = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!nums.includes(n)) nums.push(n);
    }
    card.push(...nums);
  });

  card[12] = 0; // FREE space
  return card;
}

function createSession() {
  session = {
    active: true,
    hostPassword: "Hanilove1",
    codes: Array.from({ length: 30 }, () => ({
      code: generateCode(),
      used: false
    })),
    players: {},
    winner: null
  };

  console.log("🎲 New Bingo Session Created");
}

createSession();

/* ======================
   SOCKET.IO
====================== */

io.on("connection", socket => {

  // HOST LOGIN
  socket.on("hostJoin", (password, cb) => {
    if (password !== session.hostPassword) {
      return cb({ success: false });
    }
    socket.join("host");
    cb({
      success: true,
      codes: session.codes.map(c => c.code)
    });
  });

  // PLAYER JOIN
  socket.on("playerJoin", ({ name, code }, cb) => {
    if (!session.active) {
      return cb({ ok: false, msg: "Game not active" });
    }

    const codeObj = session.codes.find(c => c.code === code && !c.used);
    if (!codeObj) {
      return cb({ ok: false, msg: "Invalid or used code" });
    }

    codeObj.used = true;

    session.players[socket.id] = {
      name,
      card: generateCard(),
      marked: Array(25).fill(false)
    };

    socket.join("players");

    cb({
      ok: true,
      card: session.players[socket.id].card
    });
  });

  // HOST CALL NUMBER
  socket.on("callNumber", number => {
    if (!session.active) return;
    io.to("players").emit("numberCalled", number);
  });

  // PLAYER CLAIMS BINGO
  socket.on("bingo", () => {
    if (session.winner || !session.active) return;

    const player = session.players[socket.id];
    if (!player) return;

    session.winner = player.name;
    session.active = false;

    io.emit("bingoWin", player.name);
    console.log("🏆 BINGO WINNER:", player.name);
  });

  // RESET GAME
  socket.on("resetGame", () => {
    createSession();
    io.emit("gameReset");
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    delete session.players[socket.id];
  });
});

/* ======================
   START SERVER
====================== */

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Habesha Bingo running on port ${PORT}`);
});




























