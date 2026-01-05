const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const crypto = require("crypto");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let session;

function generateCode() {
  return "HB-" + crypto.randomBytes(2).toString("hex").toUpperCase();
}

function createSession() {
  session = {
    active: true,
    hostPassword: "Hanilove1",
    codes: Array.from({ length: 30 }, () => ({ code: generateCode(), used: false })),
    players: {},
    winner: null
  };
  console.log("🎲 NEW SESSION STARTED");
}
createSession();

io.on("connection", socket => {

  socket.on("hostJoin", (password, cb) => {
    if (password !== session.hostPassword) return cb(false);
    socket.join("host");
    cb(session.codes.map(c => c.code));
  });

  socket.on("playerJoin", ({ name, code }, cb) => {
    if (!session.active) return cb({ ok:false, msg:"Game ended" });

    const c = session.codes.find(x => x.code === code && !x.used);
    if (!c) return cb({ ok:false, msg:"Invalid or used code" });

    c.used = true;
    session.players[socket.id] = { name, card: generateCard(), marked: [] };
    socket.join("players");
    cb({ ok:true, card: session.players[socket.id].card });
  });

  socket.on("callNumber", num => {
    if (!session.active) return;
    io.to("players").emit("numberCalled", num);
  });

  socket.on("bingo", () => {
    if (session.winner) return;
    session.winner = session.players[socket.id].name;
    session.active = false;
    io.emit("bingoWin", session.winner);
  });

  socket.on("resetGame", () => {
    createSession();
    io.emit("gameReset");
  });

  socket.on("disconnect", () => {
    delete session.players[socket.id];
  });
});

server.listen(3000, () => console.log("✅ Habesha Bingo Live"));



























