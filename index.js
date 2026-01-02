const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Socket.io logic
io.on("connection", (socket) => {
  console.log("New user connected");

  // Host registration
  socket.on("registerHost", () => {
    console.log("Host registered");
  });

  // Player joins
  socket.on("playerJoin", (name) => {
    console.log("Player joined:", name);
    io.emit("updatePlayers", name);
  });

  // Host calls number
  socket.on("numberCalled", (number) => {
    io.emit("numberCalled", number);
  });

  // Bingo win
  socket.on("bingo", (playerName) => {
    io.emit("bingoWin", playerName);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Render uses dynamic port
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Habesha Bingo running on port ${PORT}`));


































