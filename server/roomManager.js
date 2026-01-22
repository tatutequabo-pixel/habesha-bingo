class Room {
  constructor(hostId) {
    this.hostId = hostId;
    this.roomCode = this.generateRoomCode();
    this.players = {};       // { playerCode: { name, socketId } }
    this.playerBoards = {};  // { playerCode: { board: [[...]], marked: [[false]] } }
    this.calledNumbers = []; // numbers called in game
    this.gameStarted = false;
    this.numberInterval = null;

    // Generate 100 unique player codes for this room
    this.playerCodes = this.generatePlayerCodes(100);
  }

  // Generate room code (4-6 char)
  generateRoomCode() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  }

  // Generate N unique player codes
  generatePlayerCodes(count) {
    const codes = new Set();
    while (codes.size < count) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6-char code
      codes.add(code);
    }
    return Array.from(codes);
  }

  // Reset player codes for a new game
  resetPlayerCodes() {
    this.playerCodes = this.generatePlayerCodes(100);
    this.players = {};
    this.playerBoards = {};
    this.calledNumbers = [];
    this.gameStarted = false;
    clearInterval(this.numberInterval);
  }

  // Start auto-calling numbers
  startGame(io) {
    if (this.gameStarted) return;
    this.gameStarted = true;
    const numbers = Array.from({ length: 75 }, (_, i) => i + 1);
    let idx = 0;
    this.numberInterval = setInterval(() => {
      if (idx >= numbers.length) {
        clearInterval(this.numberInterval);
        return;
      }
      const num = numbers[idx++];
      this.calledNumbers.push(num);
      io.to(this.roomCode).emit('number-called', num);
    }, 15000); // every 15 seconds
  }

  // Validate player code
  validatePlayerCode(code) {
    return this.playerCodes.includes(code);
  }
}

// Rooms manager
const rooms = {};

function createRoom(hostId) {
  const room = new Room(hostId);
  rooms[room.roomCode] = room;
  return room;
}

function getRoom(roomCode) {
  return rooms[roomCode];
}

module.exports = { createRoom, getRoom, Room };
