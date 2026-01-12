const socket = io();

const loginBtn = document.getElementById('login-btn');
const passwordInput = document.getElementById('host-password');
const loginError = document.getElementById('login-error');

const loginSection = document.getElementById('login-section');
const dashboard = document.getElementById('dashboard');
const codesList = document.getElementById('codes-list');
const startGameBtn = document.getElementById('start-game-btn');
const calledNumbersDiv = document.getElementById('called-numbers');
const winnerBanner = document.getElementById('winner-banner');

loginBtn.addEventListener('click', () => {
    socket.emit('host-login', passwordInput.value);
});

socket.on('host-login-success', (codes, calledNumbers) => {
    loginSection.style.display = 'none';
    dashboard.style.display = 'block';
    loginError.style.display = 'none';
    codesList.innerHTML = '';
    codes.forEach(code => {
        const li = document.createElement('li');
        li.textContent = code;
        codesList.appendChild(li);
    });

    // Show already called numbers if any
    calledNumbers.forEach(num => {
        const span = document.createElement('span');
        span.className = 'called-number';
        span.textContent = num;
        calledNumbersDiv.appendChild(span);
    });
});

socket.on('host-login-failed', () => {
    loginError.style.display = 'block';
});

// Start game
startGameBtn.addEventListener('click', () => {
    socket.emit('start-game');
});

// Receive called number
socket.on('number-called', num => {
    const span = document.createElement('span');
    span.className = 'called-number';
    span.textContent = num;
    calledNumbersDiv.appendChild(span);
});

// Winner
socket.on('winner', name => {
    winnerBanner.style.display = 'block';
    winnerBanner.textContent = `🎉 Winner: ${name} 🎉`;
});

