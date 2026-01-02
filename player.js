const socket = io();

socket.on('numberCalled', num => {
    const ul = document.getElementById('numbersCalled');
    const li = document.createElement('li');
    li.innerText = num;
    ul.appendChild(li);

    // Highlight on board
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        if(cell.innerText == num){
            cell.classList.add('called');
        }
    });

    // Optional voice
    const msg = new SpeechSynthesisUtterance(`Number ${num} called`);
    window.speechSynthesis.speak(msg);
});

socket.on('gameReset', () => {
    document.getElementById('numbersCalled').innerHTML = '';
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('called'));
});





