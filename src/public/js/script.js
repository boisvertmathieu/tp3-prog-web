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

//Réception des cartes du client
socket.on('connection', function (data) {
	console.log('You are connected to game : {' + data.id_partie + '}');
	console.log('Nombre de joueur connecté à cette partie : ' + data.nb_joueur);
});

//Envoie des cartes du serveur au serveur
var cartes = [];
$('*[id="cartes-serveur"]:visible').each(function () {
	var cue = $(this)[0].innerText.split('\n')[0];
	var show = $(this)[0].innerText.split('\n')[1];
	var rep = $(this)[0].innerText.split('\n')[3];

	//Envoie des cartes du serveur au serveur
	var une_carte = { cue: cue, show: show, rep: rep };
	cartes.push(une_carte);
});
//Envoie des cartes au serveur
socket.emit('envoie-cartes-serveur', cartes);

//Définition de la ligne du temps et de sa première carte
var ligne_du_temps = [];
$('*[id="cartes-serveur"]:visible').each(function () {
	var cue = $(this)[0].innerText.split('\n')[0];
	var show = $(this)[0].innerText.split('\n')[1];
	var rep = $(this)[0].innerText.split('\n')[3];

	var une_carte = { cue: cue, show: show, rep: rep };
	ligne_du_temps.push(une_carte);
});

// Recherche de chaque cartes du joueur et
// ajout de click listener sur chacun des cartes du joueur
var tour = true;
var carte_wait;
var cartes = [];
var border_class = 'border border-primary';
$('*[id="cartes-client"]:visible').each(function () {
	var cue = $(this)[0].innerText.split('\n')[0];
	var show = $(this)[0].innerText.split('\n')[1];
	var rep = $(this)[0].innerText.split('\n')[3];
	var une_carte = { cue: cue, show: show, rep: rep };
	cartes.push(une_carte);

	//on click listener
	$(this).on('click', function () {
		// Transférer la carte à la ligne du temps
		//if ($) $('#ligne-du-temps').append('<div class="card">' + $(this)[0].innerHTML + '</div>');
		//socket.emit('carte-click', {
		//	carte: une_carte,
		//	position: position,
		//});
		//Suppression de la bordure de l'autre carte précédemment cliquée
		$('*[id="cartes-client"]:visible').each(function () {
			if ($(this).hasClass(border_class)) {
				$(this).removeClass(border_class);
			}
		});
		$(this).addClass('border border-primary');
		carte_wait = $(this);
	});
});

//Listener sur le click d'un bouton d'ajouter d'un carte
$('.ajout-carte').on('click', function () {
	if (carte_wait == null) {
		alert('Vous devez sélectionner une carte en premier');
	} else {
		//Ajoute carte_wait au timeline et ajoute des bouton d'ajout à droite et gauche
		if ($(this).prevAll($('#timeline')).length == 0) {
			//Ajout de la carte à droite du timeline
			$('#timeline').append(carte_wait.clone());
		} else {
			//Ajout de la carte à gauche du timeline
			$('#timeline').prepend(carte_wait.clone());
		}

		//Suppression de la carte ajouté
		console.log(carte_wait);
		carte_wait.remove();
	}
});
