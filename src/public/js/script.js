var message = document.getElementById('message');
var btn = document.getElementById('send');

// Vérification
var user_cards = document.getElementsByClassName('user-cards');

var currentLocation = window.location;
var path = new URL(currentLocation);

//connexion au socket
console.log(path.toString());
var socket = io();

socket.on('connection', function (data) {
	console.log('You are connected to game : {' + data.id_partie + '}');
	console.log('Nombre de joueur connecté à cette partie : ' + data.nb_joueur);
});
