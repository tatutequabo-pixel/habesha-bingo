const tableBody = document.createElement("tbody");
const bingoTable = document.getElementById("bingo-table");
bingoTable.appendChild(tableBody);

const calledBallsDiv = document.createElement("div");
calledBallsDiv.id = "called-balls";
bingoTable.parentNode.insertBefore(calledBallsDiv, bingoTable);

const callButton = document.createElement("button");
callButton.id = "call-number";
callButton.textContent = "Call Number";
bingoTable.parentNode.insertBefore(callButton, bingoTable.nextSibling);

const columns = ["B","I","N","G","O"];
const numbersCalled = new Set();

// Helper: generate unique numbers for a column
function generateColumnNumbers(start, end) {
  const nums = [];
  while(nums.length < 5) {
    const n = Math.floor(Math.random() * (end - start + 1)) + start;
    if(!nums.includes(n)) nums.push(n);
  }
  return nums;
}

// Generate bingo table with Free Space in the center
function generateTable() {
  const allCols = [];
  allCols.push(generateColumnNumbers(1,15));    // B
  allCols.push(generateColumnNumbers(16,30));   // I
  allCols.push(generateColumnNumbers(31,45));   // N
  allCols.push(generateColumnNumbers(46,60));   // G
  allCols.push(generateColumnNumbers(61,75));   // O

  for(let row=0; row<5; row++) {
    const tr = document.createElement("tr");
    for(let col=0; col<5; col++) {
      const td = document.createElement("td");
      if(row===2 && col===2) {
        td.textContent = "FREE";
        td.id = "cell-free";
        td.classList.add("marked");
      } else {
        const number = allCols[col][row];
        td.textContent = number;
        td.id = `cell-${number}`;
      }
      tr.appendChild(td);
    }
    tableBody.appendChild(tr);
  }
}

generateTable();

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
});
