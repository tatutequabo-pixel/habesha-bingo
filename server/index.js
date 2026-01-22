const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { createRoom } = require('./roomManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Host creates a room
app.post('/create-room', (req, res) => {
  try {
    const room = createRoom();
    return res.json({
      roomCode: room.roomCode,
      playerCodes: room.playerCodes
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create room' });
  }
});

// Start the game
app.post('/start-game', (req, res) => {
  const { roomCode } = req.body;
  return res.send(`Game started for room ${roomCode}`);
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/host.html'));
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
