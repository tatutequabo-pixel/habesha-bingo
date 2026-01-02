const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
let calledNumbers = [];

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.emit("initNumbers", calledNumbers);

  socket.on("numberCalled", (num) => {
    if (!calledNumbers.includes(num)) {
      calledNumbers.push(num);
      io.emit("updateNumbers", num);
    }
  });

  socket.on("playerBingo", (playerName) => {
    io.emit("bingoWinner", playerName);
  });

  socket.on("disconnect", () => console.log("User disconnected"));
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

































