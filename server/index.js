const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { createRoom, getRoom } = require('./roomManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// HOST ENDPOINTS

app.post('/create-room', (req, res) => {
  const hostId = Date.now();
  const room = createRoom(hostId);
  res.json({
    roomCode: room.roomCode,
    playerCodes: room.playerCodes
  });
});

app.post('/start-game', (req, res) => {
  const { roomCode } = req.body;
  const room = getRoom(roomCode);
  if (!room) return res.status(404).send('Room not found');

  room.startGame(io);
  res.send('Game started');
});

// PLAYER ENDPOINT

app.post('/join-room', (req, res) => {
  const { name, roomCode, playerCode } = req.body;
  const room = getRoom(roomCode);
  if (!room) return res.status(404).send({ error: 'Room not found' });

  if (!room.validatePlayerCode(playerCode)) {
    return res.status(400).send({ error: 'Invalid player code' });
  }

  room.players[playerCode] = { name, socketId: null };
  res.send({ success: true });
});

// SOCKET.IO

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  socket.on('register-player', ({ roomCode, playerCode }) => {
    const room = getRoom(roomCode);
    if (!room) return;
    if (room.players[playerCode]) {
      room.players[playerCode].socketId = socket.id;
    }
  });

  socket.on('mark-number', ({ roomCode, playerCode, number }) => {
    const room = getRoom(roomCode);
    if (!room || !room.gameStarted) return;

    const playerBoard = room.playerBoards[playerCode];
    if (!playerBoard) return;

    // Mark number
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (playerBoard.board[i][j] === number) {
          playerBoard.marked[i][j] = true;
        }
      }
    }

    // Check Bingo
    const isBingo = playerBoard.marked.some(row => row.every(v => v))
      || [0,1,2,3,4].every(i => playerBoard.marked[i][i])
      || [0,1,2,3,4].every(i => playerBoard.marked[i][4-i]);

    if (isBingo) {
      io.emit('bingo', { playerCode, name: room.players[playerCode].name });
      room.gameStarted = false;
      clearInterval(room.numberInterval);
    }
  });

  socket.on('disconnect', () => console.log('Disconnected:', socket.id));
});

// START SERVER
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
