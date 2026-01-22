const rooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function generatePlayerCodes() {
  const codes = new Set();
  while (codes.size < 100) {
    codes.add(Math.random().toString(36).substring(2, 6).toUpperCase());
  }
  return Array.from(codes);
}

function createRoom(hostId) {
  const roomCode = generateRoomCode();
  const playerCodes = generatePlayerCodes();

  const room = {
    roomCode,
    hostId,
    playerCodes,
    players: {},
    playerBoards: {},
    gameStarted: false,
    numberInterval: null,
    currentNumbers: [],
    validatePlayerCode(code) {
      return this.playerCodes.includes(code);
    },
    startGame(io) {
      if (this.gameStarted) return;
      this.gameStarted = true;

      let numbers = Array.from({ length: 75 }, (_, i) => i + 1).sort(() => 0.5 - Math.random());
      this.numberInterval = setInterval(() => {
        if (numbers.length === 0) return clearInterval(this.numberInterval);
        const num = numbers.shift();
        this.currentNumbers.push(num);
        io.emit('number-called', num);
      }, 15000);
    }
  };

  rooms[roomCode] = room;
  return room;
}

function getRoom(roomCode) {
  return rooms[roomCode];
}

module.exports = { createRoom, getRoom };
