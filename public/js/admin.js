const roomsDiv = document.getElementById('roomsDiv');

async function fetchRooms() {
  const res = await fetch('/admin/rooms'); // optional endpoint
  const data = await res.json();
  roomsDiv.innerHTML = '';
  data.forEach(room => {
    const div = document.createElement('div');
    div.innerHTML = `Room: ${room.roomCode} | Players: ${Object.keys(room.players).length}`;
    roomsDiv.appendChild(div);
  });
}

// Optionally call fetchRooms every 5-10 seconds
setInterval(fetchRooms, 10000);
