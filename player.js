function generateCard() {
  const ranges = [
    [1,15],[16,30],[31,45],[46,60],[61,75]
  ];
  let card = [];
  ranges.forEach(r => {
    let nums = [];
    while (nums.length < 5) {
      let n = Math.floor(Math.random()*(r[1]-r[0]+1))+r[0];
      if (!nums.includes(n)) nums.push(n);
    }
    card.push(...nums);
  });
  card[12] = 0; // FREE
  return card;
}

const socket = io();
let card = [];
let marked = [];

joinBtn.onclick = () => {
  socket.emit("playerJoin", {
    name: playerName.value,
    code: playerCode.value
  }, res => {
    if (!res.ok) return alert(res.msg);
    card = res.card;
    renderBoard();
    joinScreen.style.display = "none";
    gameScreen.style.display = "block";
  });
};

socket.on("numberCalled", num => {
  document.getElementById("called").innerHTML += `<span>${num}</span>`;
});

socket.on("bingoWin", name => {
  alert(`🎉 BINGO! ${name} wins!`);
});

function renderBoard() {
  board.innerHTML = "";
  card.forEach((n,i) => {
    const d = document.createElement("div");
    d.className = "cell";
    d.innerText = n === 0 ? "FREE" : n;
    d.onclick = () => {
      d.classList.toggle("marked");
      marked[i] = !marked[i];
      checkBingo();
    };
    board.appendChild(d);
  });
}

function checkBingo() {
  const wins = [
    [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],
    [15,16,17,18,19],[20,21,22,23,24],
    [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],
    [3,8,13,18,23],[4,9,14,19,24],
    [0,6,12,18,24],[4,8,12,16,20]
  ];
  if (wins.some(w => w.every(i => marked[i]))) {
    socket.emit("bingo");
  }
}



