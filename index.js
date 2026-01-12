const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// --- Game State ---
let game = {
    hostPassword: 'Hanilove1',
    playerCodes: [],       // 30 unique codes
    players: {},           // { code: { name, socketId, board, markedNumbers: [] } }
    calledNumbers: [],
    gameStarted: false,
    winner: null
};

// --- Helper functions ---
function generateUniqueCodes(count = 30) {
    const codes = new Set();
    while(codes.size < count){
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        codes.add(code);
    }
    return Array.from(codes);
}

function generateBingoBoard() {
    const board = [];
    while(board.length < 25){
        const num = Math.floor(Math.random() * 75) + 1;
        if(!board.includes(num)) board.push(num);
    }
    // Free space in center
    board[12] = 'FREE';
    return board;
}

function callNextNumber() {
    if(game.calledNumbers.length >= 75) return null;
    let num;
    do {
        num = Math.floor(Math.random() * 75) + 1;
    } while(game.calledNumbers.includes(num));
    game.calledNumbers.push(num);
    io.emit('number-called', num);
    return num;
}

function checkBingo(board, markedNumbers){
    const winPatterns = [
        [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24], // rows
        [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24], // cols
        [0,6,12,18,24],[4,8,12,16,20] // diagonals
    ];
    return winPatterns.some(pattern =>
        pattern.every(idx => board[idx]==='FREE' || markedNumbers.includes(board[idx]))
    );
}

// --- Socket.IO ---
io.on('connection', socket => {
    console.log('New connection:', socket.id);

    // Host login
    socket.on('host-login', password => {
        if(password === game.hostPassword){
            // Generate 30 codes only if first login
            if(game.playerCodes.length === 0) game.playerCodes = generateUniqueCodes(30);
            socket.emit('host-login-success', game.playerCodes, game.calledNumbers);
        } else {
            socket.emit('host-login-failed');
        }
    });

    // Start game
    socket.on('start-game', () => {
        if(!game.gameStarted){
            game.gameStarted = true;
            game.calledNumbers = [];
            io.emit('game-started');
            // Start auto-calling numbers every 5s
            const interval = setInterval(() => {
                if(game.winner) {
                    clearInterval(interval);
                    return;
                }
                callNextNumber();
            }, 5000);
        }
    });

    // Player join
    socket.on('player-join', ({name, code}) => {
        if(game.playerCodes.includes(code)){
            const board = generateBingoBoard();
            game.players[code] = { name, socketId: socket.id, board, markedNumbers: [] };
            socket.emit('player-join-success', board, game.calledNumbers, game.gameStarted);
        } else {
            socket.emit('player-join-failed');
        }
    });

    // Player marks number
    socket.on('mark-number', ({code, number}) => {
        const player = game.players[code];
        if(player && !player.markedNumbers.includes(number)){
            player.markedNumbers.push(number);
        }
    });

    // Player calls BINGO
    socket.on('bingo', code => {
        const player = game.players[code];
        if(player && !game.winner){
            if(checkBingo(player.board, player.markedNumbers)){
                game.winner = player.name;
                io.emit('winner', player.name);
            }
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('Disconnected:', socket.id);
        // Remove player if any
        for(const code in game.players){
            if(game.players[code].socketId === socket.id){
                delete game.players[code];
                break;
            }
        }
    });
});

http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
















