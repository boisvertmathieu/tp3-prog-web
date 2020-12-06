var message = document.getElementById('message');
var btn = document.getElementById('send');

// Vérification
var user_cards = document.getElementsByClassName('user-cards');

var currentLocation = window.location;
var path = new URL(currentLocation);

//connexion au socket
console.log(path.toString());
var socket = io();

socket.on('connection', function () {
	console.log('You are connected to the websocket server');
});

// Événement sur le clique du bouton
btn.addEventListener('click', function () {
	socket.emit('messageToServer', message.value);
});
