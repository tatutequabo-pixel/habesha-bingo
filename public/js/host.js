const hostPasswordInput = document.getElementById('hostPassword');
const loginBtn = document.getElementById('loginBtn');
const roomInfoDiv = document.getElementById('roomInfo');
const playerCodesDiv = document.getElementById('playerCodes');
const startBtn = document.getElementById('startGame');

let currentRoom = null;

loginBtn.addEventListener('click', async () => {
  const password = hostPasswordInput.value.trim();
  if (password !== 'Greenday1') {
    alert('Wrong password!');
    return;
  }

  try {
    const res = await fetch('/create-room', { method: 'POST' });
    const data = await res.json();
    if (!data.roomCode || !data.playerCodes) throw new Error('Invalid room data');

    currentRoom = data;

    // Show room code
    roomInfoDiv.innerHTML = `<h2>Room Code: ${currentRoom.roomCode}</h2>`;

    // Show 100 player codes
    playerCodesDiv.innerHTML = '';
    currentRoom.playerCodes.forEach(code => {
      const p = document.createElement('p');
      p.innerText = code;
      playerCodesDiv.appendChild(p);
    });

    startBtn.style.display = 'inline-block';
  } catch (err) {
    console.error(err);
    alert('Error creating room. Check server console.');
  }
});

startBtn.addEventListener('click', async () => {
  if (!currentRoom) return alert('No room created!');
  try {
    const res = await fetch('/start-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode: currentRoom.roomCode })
    });
    if (!res.ok) throw new Error('Failed to start game');
    alert('Game started! Numbers will auto-call every 15 seconds.');
  } catch (err) {
    console.error(err);
    alert('Error starting game. Check server.');
  }
});
