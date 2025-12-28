import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

/* Firebase config */
const firebaseConfig = {
  apiKey: "AIzaSyBO4GXSRRmWgXwMMRt-wtlQNZpWbz5GH24",
  authDomain: "habesha-bingo-bf60a.firebaseapp.com",
  databaseURL: "https://habesha-bingo-bf60a-default-rtdb.firebaseio.com",
  projectId: "habesha-bingo-bf60a",
  storageBucket: "habesha-bingo-bf60a.firebasestorage.app",
  messagingSenderId: "787934477608",
  appId: "1:787934477608:web:b9a201fa07a4fae3a2241d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const callBtn = document.getElementById("callBtn");
const numberEl = document.getElementById("number");
const ball = document.getElementById("bingo-ball");
const roomCodeEl = document.getElementById("roomCode");

const roomCode = Math.random().toString(36).substring(2,7).toUpperCase();
roomCodeEl.textContent = roomCode;

let calledNumbers = [];

callBtn.addEventListener("click", () => {
  if(calledNumbers.length >= 75){
    alert("All numbers called!");
    return;
  }

  let num;
  do {
    num = Math.floor(Math.random()*75)+1;
  } while(calledNumbers.includes(num));

  calledNumbers.push(num);

  ball.classList.remove("animate");
  void ball.offsetWidth;
  ball.classList.add("animate");

  numberEl.textContent = num;

  set(ref(db, `rooms/${roomCode}`), {
    currentNumber: num,
    calledNumbers: calledNumbers
  });
});
