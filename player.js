import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

/* Firebase config */
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

/* Player joins room by prompt */
const room = prompt("Enter Room Code to join").toUpperCase();
if(!room) alert("No room code entered!");

const numberEl = document.getElementById("number");
const ball = document.getElementById("bingo-ball");

const roomRef = ref(db, `rooms/${room}`);
onValue(roomRef, (snapshot) => {
  const data = snapshot.val();
  if(!data) return;

  numberEl.textContent = data.currentNumber;

  ball.classList.remove("animate");
  void ball.offsetWidth;
  ball.classList.add("animate");
});
