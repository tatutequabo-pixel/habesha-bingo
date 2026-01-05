const socket = io();
let called = [];

document.getElementById("loginBtn").onclick = () => {
  socket.emit("hostJoin", hostPassword.value, codes => {
    document.getElementById("codes").innerHTML =
      codes.map(c => `<div>${c}</div>`).join("");
  });
};

document.getElementById("callBtn").onclick = () => {
  let n;
  do { n = Math.floor(Math.random()*75)+1; }
  while (called.includes(n));
  called.push(n);

  const letter =
    n<=15?"B":n<=30?"I":n<=45?"N":n<=60?"G":"O";

  socket.emit("callNumber", `${letter}${n}`);
  lastNumber.innerText = `${letter}${n}`;
};

document.getElementById("resetBtn").onclick = () => {
  socket.emit("resetGame");
};

