var message = document.getElementById('message');
var btn = document.getElementById('send');

var currentLocation = window.location;

var path = new URL(currentLocation);

//connexion au socket
console.log(path.toString());
const socket = io.connect(path.toString());

socket.on('start', function () {
	console.log(new Date().getSeconds() + '; Socket started');
});

// Événement
btn.addEventListener('click', function () {
	socket.emit('event', {
		message: message.value,
	});
});

// Écoute d'Événement
socket.on('event', function (data) {
	console.log(new Date().getSeconds() + '; Réception dun socket');
	console.log('Message: ' + data.message);
	if (data.message[data.message.length - 1] != '?') {
		socket.emit('event', data.message);
	}
});
