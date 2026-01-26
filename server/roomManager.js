// server/roomManager.js

const { generateBoard, drawNumber, validateBingo } = require("./gameEngine");

const rooms = new Map();

// -------- Utilities --------

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generatePlayerCodes(count = 100) {
  const codes = new Set();
  while (codes.size < count) {
    codes.add(Math.random().toString(36).substring(2, 7).toUpperCase());
  }
  return Array.from(codes);
}

// -------- Room Lifecycle --------

function createRoom() {
  const roomCode = generateRoomCode();

  const room = {
    roomCode,
    status: "WAITING", // WAITING | LIVE | ENDED
    hostConnected: false,
    calledNumbers: [],
    players: new Map(),
    availablePlayerCodes: generatePlayerCodes(),
    winner: null,
  };

  rooms.set(roomCode, room);
  return room;
}

function getRoom(roomCode) {
  return rooms.get(roomCode);
}

// -------- Host Logic --------

function connectHost(roomCode) {
  const room = getRoom(roomCode);
  if (!room) throw new Error("Room not found");

  room.hostConnected = true;
  return room;
}

function startGame(roomCode) {
  const room = getRoom(roomCode);
  if (!room) throw new Error("Room not found");

  if (room.status !== "WAITING") {
    throw new Error("Game already started");
  }

  room.status = "LIVE";
  return room;
}

function callNextNumber(roomCode) {
  const room = getRoom(roomCode);
  if (!room) throw new Error("Room not found");

  if (room.status !== "LIVE") {
    throw new Error("Game not live");
  }

  const number = drawNumber(room.calledNumbers);
  if (!number) return null;

  room.calledNumbers.push(number);
  return number;
}

// -------- Player Logic --------

function joinPlayer(roomCode, playerName, playerCode) {
  const room = getRoom(roomCode);
  if (!room) throw new Error("Room not found");

  if (room.status !== "WAITING") {
    throw new Error("Game already started");
  }

  if (!room.availablePlayerCodes.includes(playerCode)) {
    throw new Error("Invalid or used player code");
  }

  // Consume player code
  room.availablePlayerCodes = room.availablePlayerCodes.filter(
    c => c !== playerCode
  );

  const board = generateBoard();

  room.players.set(playerCode, {
    name: playerName,
    board,
    marked: new Set(["FREE"]),
  });

  return board;
}

// -------- Bingo Claim --------

function claimBingo(roomCode, playerCode, markedNumbers) {
  const room = getRoom(roomCode);
  if (!room) throw new Error("Room not found");

  if (room.status !== "LIVE") {
    return { success: false, message: "Game not active" };
  }

  if (room.winner) {
    return { success: false, message: "Game already ended" };
  }

  const player = room.players.get(playerCode);
  if (!player) {
    return { success: false, message: "Player not found" };
  }

  const markedSet = new Set(markedNumbers);
  markedSet.add("FREE");

  const isValid = validateBingo(
    player.board,
    markedSet,
    room.calledNumbers
  );

  if (!isValid) {
    return { success: false, message: "Invalid bingo claim" };
  }

  // 🎉 WINNER FOUND
  room.winner = player.name;
  room.status = "ENDED";

  return {
    success: true,
    winner: player.name,
    board: player.board,
  };
}

// -------- Admin --------

function listRooms() {
  return Array.from(rooms.values()).map(room => ({
    roomCode: room.roomCode,
    status: room.status,
    players: room.players.size,
    winner: room.winner,
  }));
}

function endRoom(roomCode) {
  const room = getRoom(roomCode);
  if (!room) throw new Error("Room not found");

  room.status = "ENDED";
  return room;
}

module.exports = {
  createRoom,
  getRoom,
  connectHost,
  startGame,
  callNextNumber,
  joinPlayer,
  claimBingo,
  listRooms,
  endRoom,
};
