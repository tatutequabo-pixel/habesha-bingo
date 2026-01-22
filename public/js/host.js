const hostPasswordInput = document.getElementById('hostPassword');
const loginBtn = document.getElementById('loginBtn');
const roomInfoDiv = document.getElementById('roomInfo');
const playerCodesDiv = document.getElementById('playerCodes');
const startBtn = document.getElementById('startGame');

let currentRoom = null;

loginBtn.addEventListener('click', async () => {
  const password = hostPasswordInput.value.trim();
  if(password !== 'Greenday1') return alert('Wrong password!');

  try {
    const res = await fetch('/create-room', { method:'POST' });
    const data = await res.json();

    if(!data.roomCode || !data.playerCodes) throw new Error('Invalid room data');

    currentRoom = data;

    roomInfoDiv.innerHTML = `<h2>Room Code: ${currentRoom.roomCode}</h2>`;

    playerCodesDiv.innerHTML = '';
    currentRoom.playerCodes.forEach(code => {
      const p = document.createElement('p');
      p.innerText = code;
      playerCodesDiv.appendChild(p);
    });

    startBtn.style.display = 'inline-block';
  } catch(err) {
    console.error(err);
    alert('Error creating room');
  }
});

startBtn.addEventListener('click', async () => {
  if(!currentRoom) return alert('No room created!');
  try {
    await fetch('/start-game', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ roomCode: currentRoom.roomCode })
    });
    alert('Game started!');
  } catch(err) {
    console.error(err);
    alert('Error starting game');
  }
});
