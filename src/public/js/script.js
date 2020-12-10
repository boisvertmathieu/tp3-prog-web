// *******************************************************
// 				Déclaration de variables
// *******************************************************

//Messagerie
var btnSendMsg = document.getElementById('btnMessage');
var message = document.getElementById('message');
var chatBox = document.getElementById('chatBox');

//Infos du joueur et de la partie
var btnStart = document.getElementById('startBtn');
var userData = document.getElementById('userData');
var username = document.getElementById('username').value;
var userId = document.getElementById('userId').value;
var userAdmin = document.getElementById('userAdmin').value;

var debugMode = true;


// Connection au serveur
var socket = io();

// *******************************************************
// 						Initialisation
// *******************************************************

// Connection initale, envoi des infos du joueur
socket.on("getUserInfo", function () {
	socket.emit("returnUserInfo", {
		userId: userId,
		username: username,
		userAdmin: userAdmin
	})
	// Suppression de l'info dans la page
	userData.remove();
})

// *******************************************************
// 						Messagerie
// *******************************************************

btnSendMsg.addEventListener('click',function(){
	if (message.value != '') {
		socket.emit('chat', {
			message: message.value,
			user: username
		});
		message.value = '';
	}
});

socket.on('chat', function(data){
	if (data.user == "superUser") {
		chatBox.innerHTML += '<div class="row d-flex justify-content-center">' +
			'<p class="font-italic text-muted">'+ data.message + '</p>' +
			'</div>'
	} else {
		var color = (data.user == username) ? "text-primary" : "text-danger";

		chatBox.innerHTML += '<div class="row">' +
			'<p class="' + color +'"><strong>'+data.user+': </strong>'+data.message+'</p>' +
			'</div>'
	}
})

//Demande de demarrage de la partie
btnStart.addEventListener('click',function(){
	socket.emit("requestStart", {
		userId: userId
	})
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

			//Ajoute carte_wait au timeline et ajoute des bouton d'ajout à droite et gauche
			if (!erreurs) {
				//Validation de la date de la carte (si elle est placé à la bonne place)
				console.log($('#timeline:last-child'));
				var rep_carte_droite = parseInt($('#timeline:last-child').children('p')[0].innerText);
				var rep_carte_gauche = parseInt($('#timeline:first-child').children('p')[0].innerText);
				if (rep < rep_carte_droite && rep > rep_carte_gauche) {
					//Placement de la carte
					if ($(this).hasClass('float-right')) {
						//Ajout de la carte à droite du timeline
						$('#timeline').append(carte_wait.clone());
					} else {
						//Ajout de la carte à gauche du timeline
						$('#timeline').prepend(carte_wait.clone());
					}

					//Suppression de la carte jouée de l'affiche
					carte_wait.removeClass(border_class);
					carte_wait.remove();
					carte_wait == null;
					//Changement du tour
					tour = false;
				} else {
					erreurs = true;
					alert('Carte placé au mauvais endroit');
				}
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

// *******************************************************
// 						Messagerie
// *******************************************************


