const rooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substring(2,7).toUpperCase();
}

function generatePlayerCodes() {
  const codes = new Set();
  while(codes.size < 100) {
    codes.add(Math.random().toString(36).substring(2,6).toUpperCase());
  }
  return Array.from(codes);
}

function createRoom() {
  const roomCode = generateRoomCode();
  const playerCodes = generatePlayerCodes();
  const room = { roomCode, playerCodes };
  rooms[roomCode] = room;
  return room;
}

module.exports = { createRoom };
