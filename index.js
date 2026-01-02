const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const HOST_PASSWORD = "Hanilove1"; // Only the host knows this

app.use(express.static(__dirname)); // serve JS, CSS, logo.png

// Landing page - asks host password or redirects to player
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Host login
app.get('/host', (req, res) => {
    const password = req.query.password;
    if(password === HOST_PASSWORD) {
        res.sendFile(path.join(__dirname, 'host.html'));
    } else {
        res.send("Wrong password!");
    }
});

// Player page
app.get('/player', (req, res) => {
    res.sendFile(path.join(__dirname, 'player.html'));
});

// Socket.io events
let calledNumbers = [];

io.on('connection', (socket) => {
    console.log("New client connected");

    // When host calls a number
    socket.on('callNumber', (num) => {
        if(!calledNumbers.includes(num)){
            calledNumbers.push(num);
            io.emit('numberCalled', num); // send to all players
        }
    });

    // Reset game
    socket.on('resetGame', () => {
        calledNumbers = [];
        io.emit('gameReset');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));

































