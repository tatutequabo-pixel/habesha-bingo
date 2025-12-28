import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBO4GXSRRmWgXwMMRt-wtlQNZpWbz5GH24",
  authDomain: "habesha-bingo-bf60a.firebaseapp.com",
  databaseURL: "https://habesha-bingo-bf60a-default-rtdb.firebaseio.com",
  projectId: "habesha-bingo-bf60a",
  storageBucket: "habesha-bingo-bf60a.firebasestorage.app",
  messagingSenderId: "787934477608",
  appId: "1:787934477608:web:b9a201fae3a2241d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const joinBtn = document.getElementById("joinBtn");
const roomInput = document.getElementById("roomInput");
const playerNameInput = document.getElementById("playerName");
const playerCardEl = document.getElementById("playerCard");
const ball = document.getElementById("playerBall");
const numberEl = document.getElementById("playerNumber");

let playerCard = [];

function generateCard() {
  const numbers = [];
  while(numbers.length < 25){
    const n = Math.floor(Math.random()*75)+1;
    if(!numbers.includes(n)) numbers.push(n);
  }
  return numbers;
}

function renderCard() {
  playerCardEl.innerHTML = "";
  playerCard.forEach(num => {
    const cell = document.createElement("div");
    cell.classList.add("bingo-cell");
    cell.textContent = num;
    playerCardEl.appendChild(cell);
  });
}

joinBtn.addEventListener("click", () => {
  const room = roomInput.value.toUpperCase();
  const name = playerNameInput.value || "Player";
  if(!room) return alert("Enter room code");

  playerCard = generateCard();
  renderCard();

  const playerRef = ref(db, `rooms/${room}/players/${name}`);
  set(playerRef, { card: playerCard });

  // Listen for numbers called
  const roomRef = ref(db, `rooms/${room}`);
  onValue(roomRef, snapshot => {
    const data = snapshot.val();
    if(!data) return;

    const currentNum = data.currentNumber;
    numberEl.textContent = currentNum;

    ball.classList.remove("animate");
    void ball.offsetWidth;
    ball.classList.add("animate");

    // Highlight cells if called
    const cells = playerCardEl.querySelectorAll(".bingo-cell");
    cells.forEach(cell => {
      if(data.calledNumbers.includes(parseInt(cell.textContent))){
        cell.classList.add("called");
      }
    });
  });
});

