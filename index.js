const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");
const { db } = require("./firebase");
const { ref, set } = require("firebase/database");

// Serve static files
app.use(express.static(path.join(__dirname)));

io.on("connection", (socket) => {
  console.log("New user connected");

  // Player joins
  socket.on("playerJoin", async (name) => {
    await set(ref(db, "players/" + socket.id), { name, joinedAt: Date.now() });
    io.emit("updatePlayers", { id: socket.id, name });
  });

  // Number called by host
  socket.on("numberCalled", (number) => {
    io.emit("numberCalled", number);
  });

  // Player wins
  socket.on("bingo", async (playerName) => {
    io.emit("bingoWin", playerName);
    await set(ref(db, "winners/" + Date.now()), { player: playerName });
  });

  // Disconnect
  socket.on("disconnect", async () => {
    await set(ref(db, "players/" + socket.id), null);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Habesha Bingo running on port ${PORT}`));


































