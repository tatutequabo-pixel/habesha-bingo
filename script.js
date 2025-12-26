// Call a random number
callButton.addEventListener("click", () => {
  let number;
  do {
    const col = Math.floor(Math.random() * 5);
    number = Math.floor(Math.random() * 15) + 1 + col*15;
  } while(numbersCalled.has(number));

  numbersCalled.add(number);

  // Display called ball
  const ball = document.createElement("div");
  ball.classList.add("bingo-ball");
  const colLetter = columns[Math.floor((number-1)/15)];
  const colors = { B:"#f44336", I:"#2196f3", N:"#4caf50", G:"#ff9800", O:"#9c27b0" };
  ball.style.backgroundColor = colors[colLetter];
  ball.textContent = colLetter + number;
  calledBallsDiv.appendChild(ball);

  // Mark cell in table if exists
  const cell = document.getElementById(`cell-${number}`);
  if(cell) cell.classList.add("marked");

  // Check for win
  checkWin();
});



