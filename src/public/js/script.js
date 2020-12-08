var message = document.getElementById('message');
var btn = document.getElementById('send');
var tour = document.getElementById('tour');
var ligne = document.getElementById('ligne-du-temps');
var cartes = document.getElementsByClassName('card');

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

// Ajout de click listener sur chacun des cartes du joueur
$('*[class=card]:visible').each(function () {
	$(this).on('click', function () {
		// Transférer la carte à la ligne du temps
		if ($) $('#ligne-du-temps').append('<div class="card">' + $(this)[0].innerHTML + '</div>');
		//Transférer la carte sélectionné au server
		var cue = $(this)[0].innerText.split('\n')[0].split(':')[1];
		var show = $(this)[0].innerText.split('\n')[1].split(':')[1];
		var rep = $(this)[0].innerText.split('\n')[3].split(':')[1];
		socket.emit('carte-click', {
			carte: {
				cue: cue,
				show: show,
				rep: rep,
			},
		});
	});
});
