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

//Définition de la ligne du temps et de sa première carte
var une_carte;
$('*[id="cartes-serveur"]:visible').each(function () {
	var cue = $(this)[0].innerText.split('\n')[0];
	var show = $(this)[0].innerText.split('\n')[1];
	var rep = $(this)[0].innerText.split('\n')[3];

	une_carte = { cue: cue, show: show, rep: rep };
});
socket.emit('envoie-carte-timeline', une_carte);

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
			var carte = { cue: cue, show: show, rep: rep };
			var erreurs = false;
			//Retour de la carte à jouer au serveur
			socket.emit('carte-a-jouer', {
				carte: carte,
			});

			//Validation de la présence d'erreur lors de l'ajout d'une la carte
			socket.on('carte-a-jouer-erreur', function (data) {
				erreurs = true;
				alert(data);
			});
			socket.on('carte-a-jouer-carte-null', function (data) {
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
							//Récupération des informations de la carte à droite et gauche
							var rep_carte_droite = null;
							var rep_carte_gauche = null;
							// Validation de si l'élément à droit de $(this) existe
							if ($(this).next().length) {
								rep_carte_droite = parseInt($(this).next().find('p')[0].innerText);
							}
							if ($(this).prev().length) {
								rep_carte_gauche = parseInt($(this).prev().find('p')[0].innerText);
							}

							//Validation de si la carte peut être placé à l'emplacement correspondant à $(this)
							if (rep_carte_droite != null) {
								if (rep > rep_carte_droite) erreurs = true;
							}
							if (rep_carte_gauche != null) {
								if (rep < rep_carte_gauche) erreurs = true;
                            }
                            
							if (!erreurs) {
								//Ajout de la carte à l'affichage
								$(this).clone(true).insertAfter($(this));
								$(this).clone(true).insertBefore($(this));
								$(this).replaceWith(carte_wait.clone());

								//Suppression de la carte cliquée de l'affichage
								var carte_wait_temp = carte_wait.clone();
								carte_wait.removeClass(border_class);
								carte_wait.remove();
								carte_wait = carte_wait_temp;

								//Suppression de la carte cliqué du paquet de carte en variable locale
								for (var i = 0; i < cartes.length; i++) {
									if (cartes[i].cue == cue && cartes[i].show == show && cartes[i].rep == rep) {
										cartes.splice(i, 1);
									}
								}
							} else {
								erreurs = true;
								alert('Impossible de joueur la carte ici');
							}
						}
					});

				//Recherche de la nouvelle position de la nouvelle carte placée
				var i = 0;
				var position;
				$('#timeline')
					.children('#cartes-client')
					.each(function () {
						if ($(this)[0].innerHTML == carte_wait[0].innerHTML) {
							position = i;
						}
						i++;
					});

				//Changement de tour
				if (!erreurs) {
					tour = false;
					socket.emit('tour', {
						carte: carte,
						position: position,
					});
				}
			} else {
				erreurs = true;
				alert('Carte placé au mauvais endroit');
			}
		}
	});
});
