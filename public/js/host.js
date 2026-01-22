const loginBtn = document.getElementById('loginBtn');
const hostPasswordInput = document.getElementById('hostPassword');
const roomInfoDiv = document.getElementById('roomInfo');
const playerCodesDiv = document.getElementById('playerCodes');
const startBtn = document.getElementById('startGame');

let currentRoom = null;

loginBtn.addEventListener('click', async () => {
  if (hostPasswordInput.value !== 'Greenday1') {
    alert('Wrong password!');
    return;
  }

  const res = await fetch('/create-room', { method: 'POST' });
  currentRoom = await res.json();

  roomInfoDiv.innerHTML = `<h2>Room Code: ${currentRoom.roomCode}</h2>`;
  playerCodesDiv.innerHTML = '';

  currentRoom.playerCodes.forEach(code => {
    const p = document.createElement('p');
    p.innerText = code;
    playerCodesDiv.appendChild(p);
  });

  startBtn.style.display = 'inline-block';
});

startBtn.addEventListener('click', async () => {
  if (!currentRoom) return;

  await fetch('/start-game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomCode: currentRoom.roomCode })
  });

  alert('Game started! Numbers will auto-call every 15 seconds.');
});
