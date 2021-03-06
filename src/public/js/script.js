// *******************************************************
// 				Déclaration de variables
// *******************************************************

//Messagerie
var message = document.getElementById('message');
var chatBox = document.getElementById('chatBox');

//Infos du joueur et de la partie
var userData = document.getElementById('userData');
var username = document.getElementById('username').value;
var userId = document.getElementById('userId').value;
var userAdmin = document.getElementById('userAdmin').value;

//Affichage
var timelineAffiche = document.getElementById('timeline');
var userCards = document.getElementById('playerHand');
var tourA = document.getElementById('tourA');

var debugMode = true;

// Connection au serveur
var socket = io();

// *******************************************************
// 						Initialisation
// *******************************************************

// Connection initale, envoi des infos du joueur
socket.on('getUserInfo', function () {
    socket.emit('returnUserInfo', {
        userId: userId,
        username: username,
        userAdmin: userAdmin,
    });
    // Suppression de l'info dans la page
    userData.remove();
});

// *******************************************************
// 						Messagerie
// *******************************************************

$('#btnMessage').on('click', function () {
    if (message.value != '') {
        socket.emit('chat', {
            message: message.value,
            user: username,
        });
        message.value = '';
    }
});

socket.on('chat', function (data) {
    if (data.user == 'superUser') {
        chatBox.innerHTML += '<div class="row d-flex justify-content-center">' + '<p class="font-italic text-muted">' + data.message + '</p>' + '</div>';
    } else {
        var color = data.user == username ? 'text-primary' : 'text-danger';

        chatBox.innerHTML += '<div class="row">' + '<p class="' + color + '"><strong>' + data.user + ': </strong>' + data.message + '</p>' + '</div>';
    }
});

// *******************************************************
// 				Demarrage de la partie
// *******************************************************

//Demande de demarrage de la partie
$('#startBtn').on('click', function () {
    socket.emit('requestStart', {
        userId: userId,
    });
});

socket.on('startError', function (data) {
    if (userId == data.userId) {
        alert(data.message);
    }
});


// *******************************************************
// 				Fonctions d'affichage
// *******************************************************
socket.on('updateHand', function (data) {
    //Mise à jour de la main du joueur concerné
    if (userId == data.userId) {
        drawHand(data.cartes);
    }
});

socket.on('refreshTimeline', function (data) {
    drawTimeline(data.timeline);
    tourA.innerText = "C'est au tour de " + data.tourA;
});

socket.on('score', function (data) {
    if (userId == data.userId) {
        $('#score')[0].innerText = data.score.toString();
    }
});

function drawHand(cartesEnMain) {
    var userCards = $('#playerHand');
    userCards.empty();
    cartesEnMain.forEach(element => {
        userCards.append(drawCarte(element, false, debugMode));
    });

}

// Fonction qui redessine l'entièreté de la timeline
function drawTimeline(cartesDeTimeline) {
    var timeline = $('#timeline');
    timeline.empty(); //Vide l'objet timeline

    var bouton_index = 0;
    //Ajout du premier bouton
    timeline.append(drawAddButton(bouton_index));
    bouton_index++;

    //Ajout des cartes
    cartesDeTimeline.forEach(element => {
        timeline.append(drawCarte(element, true, true));
        timeline.append(drawAddButton(bouton_index));
        bouton_index++;
    });

    //Mise à jour des eventlistener sur les +
    addGameEventListener();
}

//Retournes un bouton a afficher
function drawAddButton(bouton_index) {
    return '<div class="col col-lg" id="' + bouton_index + '"=>\n' +
        '                                <button class="btn btn-success" id="ajout-carte">\n' +
        '                                    <span class="material-icons">add</span>\n' +
        '                                </button>\n' +
        '                            </div>';

}

//Retourne une carte, showDate est une bool pour montrer la date
function drawCarte(carte, blnTimeline, showDate) {
    var carteType = 'carte-client';
    var cardColor = 'bg-success';
    if (blnTimeline) {
        carteType = 'carte-timeline';
        cardColor = 'bg-info';
    }

    var carteString =
        '<div class=" col py-2" id="' + carteType + '">\n' +
        '     <div class="card-jeu" style="width: 14rem">\n' +
        '             <div class="card-body ' + cardColor + '">\n';

    carteString += '<h4 class="card-title">' + carte.cue + '</h4>';
    carteString += '<h6 class="card-title">' + carte.show + '</h6>';

    if (showDate) {
        carteString += '<p className="card-text">' + carte.rep + '</p>';
    }

    carteString += '</div>\n' +
        '           </div>\n' +
        '           </div>';

    return carteString;
}

function addGameEventListener() {
    // Recherche de chaque cartes du joueur et
    // ajout de click listener sur chacun des cartes du joueur
    var carte_wait = null;
    var border_class = 'border-card';

    // Ajout de click listener sur les cartes du client
    $('*[id="carte-client"]:visible').each(function () {
        var cue = $(this)[0].innerText.split('\n')[0];
        var show = $(this)[0].innerText.split('\n')[1];
        var rep = $(this)[0].innerText.split('\n')[3];

        //on click listener
        $(this).on('click', function () {
            //Suppression de la bordure de l'autre carte précédemment cliquée
            $('*[id="carte-client"]:visible').each(function () {
                if ($(this).find('>:first-child').hasClass(border_class)) {
                    $(this).find('>:first-child').removeClass(border_class);
                }
            });
            $(this).find('>:first-child').addClass(border_class);
            carte_wait = $(this);
        });
    });

    //Listener sur le click d'un bouton d'ajouter d'un carte
    $('*[id="ajout-carte"]:visible').each(function () {
        $(this).on('click', function () {
            if (carte_wait == null) {
                alert('Vous devez sélectionner une carte en premier');
            } else {
                //Récupération des infos la carte jouée
                var cue = carte_wait.find('h4')[0].innerText;
                var show = carte_wait.find('h6')[0].innerText;
                var rep = carte_wait.find('p')[0].innerText;
                var carte = {
                    cue: cue,
                    show: show,
                    rep: parseInt(rep)
                };

                //Récupération de la position à laquelle la carte veut être placée
                var position = $(this).parent().attr('id');
                //Retour de la carte à jouer au serveur pour validation
                socket.emit('tour', {
                    carte: carte,
                    userId: userId, //Utilisation du userId stocké localement
                    position: position
                });
                carte_wait = null;
                $('*[id="carte-client"]:visible').each(function () {
                    if ($(this).find('>:first-child').hasClass(border_class)) {
                        $(this).find('>:first-child').removeClass(border_class);
                    }
                });
            }
        });
    });
};

socket.on('alert', function (data) {
    alert(data.message);
});

socket.on('targetAlert', function (data) {
    if (userId == data.userId) {
        alert(data.message);
    }
});



/*
                    //Enregistrement du bouton cliqué dans une variable temporaire
                    var btn_clique = $(this);
                    $('#timeline').children('div').each(function () {
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
                                $(this).replaceWith(carte_wait.clone().removeClass('col-3').addClass('col-md-auto'));

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

                        socket.emit('carte-a-jouer', {
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
}
*/


// *******************************************************
// 						Messagerie
// *******************************************************
