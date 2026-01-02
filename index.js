const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

// Firebase
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set } = require("firebase/database");
const firebaseConfig = require("./firebase").config;
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// Serve static files
app.use(express.static(path.join(__dirname)));

io.on("connection", (socket) => {
  console.log("New user connected");

  // Host registration
  socket.on("registerHost", () => {
    console.log("Host connected");
  });

  // Player joins
  socket.on("playerJoin", async (name) => {
    await set(ref(db, "players/" + socket.id), { name, joinedAt: Date.now() });
    io.emit("updatePlayers", { id: socket.id, name });
  });

  // Host calls number
  socket.on("numberCalled", (number) => {
    io.emit("numberCalled", number);
  });

  // Player wins Bingo
  socket.on("bingo", async (playerName) => {
    io.emit("bingoWin", playerName);
    await set(ref(db, "winners/" + Date.now()), { player: playerName });
  });

  socket.on("disconnect", async () => {
    await set(ref(db, "players/" + socket.id), null);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Habesha Bingo running on port ${PORT}`));



































