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

//Listener sur le click d'une carte pour la sélectionner
$('*[id="cartes-client"]:visible').each(function () {
	var cue = $(this)[0].innerText.split('\n')[0];
	var show = $(this)[0].innerText.split('\n')[1];
	var rep = $(this)[0].innerText.split('\n')[3];
	var une_carte = { cue: cue, show: show, rep: rep };
	cartes.push(une_carte);

	//on click listener
	$(this).on('click', function () {
		//Suppression de la bordure de l'autre carte précédemment cliquée
		$('*[id="cartes-client"]:visible').each(function () {
			if ($(this).find('>:first-child').hasClass(border_class)) {
				$(this).find('>:first-child').removeClass(border_class);
			}
		});
		$(this).find('>:first-child').addClass('border border-primary');
		carte_wait = $(this);
	});
});

//Listener sur le click d'un bouton d'ajouter d'un carte
$('*[id="ajout-carte"]:visible').each(function () {
	$(this).on('click', function () {
		if (!tour) {
			alert("Ce n'est pas encore votre tour");
		} else if (carte_wait == null) {
			alert('Vous devez sélectionner une carte en premier');
		} else {
			//Récupération des infos la carte jouée
			var cue = carte_wait.find('h4')[0].innerText;
			var show = carte_wait.find('h6')[0].innerText;
			var rep = carte_wait.find('p')[0].innerText;

			var erreurs = false;
			//Retour de la carte à jouer au serveur
			socket.emit('tour', {
				carte: { cue: cue, show: show, rep: rep },
			});

			//Validation de la présence d'erreur lors de l'ajout d'une la carte
			socket.on('tour-erreur', function (data) {
				erreurs = true;
				alert(data);
			});
			socket.on('tour-carte-null', function (data) {
				erreurs = true;
				alert(data);
			});

			//Ajout de la carte à la position cliqué
			if (!erreurs) {
				var btn_clique = $(this);
				$('#timeline')
					.children('div')
					.each(function () {
						//Validation de quel child du timeline correspond au bouton cliqué
						if ($(this).find('>:first-child').is(btn_clique)) {
							//Validation de si le bouton cliqué est aux bouts du timeline
							$(this).clone(true).insertAfter($(this));
							$(this).clone(true).insertBefore($(this));
							$(this).replaceWith(carte_wait.clone());
						}
					});
			} else {
				erreurs = true;
				alert('Carte placé au mauvais endroit');
			}
		}
	});
});

//Réception du tour du serveur
socket.on('tour', function (data) {
	//Placement de la carte joué par le serveur

	//Changement du tour
	tour = true;
});
