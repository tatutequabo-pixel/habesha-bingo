const socket = io();

function callNumber(){
    const num = document.getElementById('number').value;
    if(num) socket.emit('callNumber', num);
    document.getElementById('number').value = "";
}

function resetGame(){
    socket.emit('resetGame');
}

socket.on('numberCalled', num => {
    const ul = document.getElementById('calledNumbers');
    const li = document.createElement('li');
    li.innerText = num;
    ul.appendChild(li);

    // Voice
    const msg = new SpeechSynthesisUtterance(`Number ${num} called`);
    window.speechSynthesis.speak(msg);
});

socket.on('gameReset', () => {
    document.getElementById('calledNumbers').innerHTML = '';
});





