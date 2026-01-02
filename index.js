const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const path = require("path");

app.use(express.static(path.join(__dirname)));

let players = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("playerJoin", (name) => {
    players[socket.id] = name;
    io.emit("playersUpdate", players);
  });

  socket.on("numberCalled", (number) => {
    io.emit("numberCalled", number);
  });

  socket.on("bingo", (name) => {
    io.emit("bingoWin", name);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("playersUpdate", players);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log("Habesha Bingo running on port", PORT);
});


































