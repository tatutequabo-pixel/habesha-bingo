const { v4: uuidv4 } = require("uuid");

class Room {
  constructor(hostId) {
    this.hostId = hostId;
    this.roomCode = this.generateRoomCode();
    this.players = {};       // { playerCode: { name, socketId } }
    this.playerBoards = {};  // { playerCode: { board: [[...]], marked: [[false]] } }
    this.calledNumbers = []; // numbers called in game
    this.gameStarted = false;
    this.numberInterval = null;
  }

  // Generate 6-digit unique room code
  generateRoomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Player joins the room
  joinRoom(name, playerCode, socketId) {
    if (this.players[playerCode]) return false;

    this.players[playerCode] = { name, socketId };
    this.playerBoards[playerCode] = {
      board: this.generateBoard(),
      marked: Array.from({ length: 5 }, () => Array(5).fill(false))
    };
    return this;
  }

  // Get player names
  getPlayerNames() {
    return Object.values(this.players).map(p => p.name);
  }

  // Generate 5x5 board with unique numbers (1-75)
  generateBoard() {
    const nums = [];
    while (nums.length < 25) {
      const n = Math.floor(Math.random() * 75) + 1;
      if (!nums.includes(n)) nums.push(n);
    }
    // Create 5x5 matrix
    const board = [];
    for (let i = 0; i < 5; i++) {
      board.push(nums.slice(i * 5, i * 5 + 5));
    }
    return board;
  }

  // Start auto-calling numbers every 15 seconds
  startGame(io) {
    if (this.gameStarted) return;
    this.gameStarted = true;

    this.numberInterval = setInterval(() => {
      if (this.calledNumbers.length >= 75) return this.stopGame(); // all numbers called

      let num;
      do {
        num = Math.floor(Math.random() * 75) + 1;
      } while (this.calledNumbers.includes(num));

      this.calledNumbers.push(num);
      io.to(this.roomCode).emit("numberCalled", num);
    }, 15000);
  }

  // Stop game
  stopGame() {
    clearInterval(this.numberInterval);
    this.gameStarted = false;
  }

  // Mark number for player
  markNumber(playerCode, number) {
    const boardData = this.playerBoards[playerCode];
    if (!boardData) return;

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (boardData.board[i][j] === number) {
          boardData.marked[i][j] = true;
        }
      }
    }
  }

  // Check if player has Bingo
  checkBingo(playerCode) {
    const boardData = this.playerBoards[playerCode];
    if (!boardData) return false;

    const marked = boardData.marked;

    // Check rows
    for (let i = 0; i < 5; i++) {
      if (marked[i].every(v => v)) return true;
    }

    // Check columns
    for (let j = 0; j < 5; j++) {
      let col = true;
      for (let i = 0; i < 5; i++) {
        if (!marked[i][j]) col = false;
      }
      if (col) return true;
    }

    // Check main diagonal
    if ([0,1,2,3,4].every(i => marked[i][i])) return true;

    // Check anti-diagonal
    if ([0,1,2,3,4].every(i => marked[i][4-i])) return true;

    return false;
  }

  // Mark a number for all players automatically if called
  markCalledNumber(number) {
    for (const playerCode in this.playerBoards) {
      this.markNumber(playerCode, number);
    }
  }
}

class RoomManager {
  constructor() {
    this.rooms = {};
  }

  // Create new room
  createRoom(hostId) {
    const room = new Room(hostId);
    this.rooms[room.roomCode] = room;
    return room;
  }

  // Get existing room
  getRoom(roomCode) {
    return this.rooms[roomCode];
  }

  // Player joins a room
  joinRoom(roomCode, name, playerCode, socketId) {
    const room = this.getRoom(roomCode);
    if (!room) return false;
    return room.joinRoom(name, playerCode, socketId);
  }

  // Handle socket disconnect
  leaveSocket(socketId) {
    for (const code in this.rooms) {
      const room = this.rooms[code];
      for (const playerCode in room.players) {
        if (room.players[playerCode].socketId === socketId) {
          delete room.players[playerCode];
          delete room.playerBoards[playerCode];
        }
      }
    }
  }
}

module.exports = { RoomManager };
