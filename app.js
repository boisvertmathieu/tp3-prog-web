//Imports
var express = require('express');
var createError = require('http-errors');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var database = require('./src/middlewares/database');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('express-flash');
var dotenv = require('dotenv').config(); // For secret token access in .env file
var utils = require('./src/middlewares/utils');
var debug = require('debug')('tp3-prog-web:server');

var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

// Routers
var indexRouter = require('./src/routes/index');
var loginRouter = require('./src/routes/login');
var signupRouter = require('./src/routes/signup');
var logoutRouter = require('./src/routes/logout');
var joueurRouter = require('./src/routes/joueur');
var partieRouter = require('./src/routes/partie');
var homeRouter = require('./src/routes/home');
var cartesRouter = require('./src/routes/cartes');

// view engine setup
app.set('views', path.join(__dirname, '/src/views/pages'));
app.set('view engine', 'ejs');

//middlewares
var middlewares = [
    bodyParser.urlencoded({
        extended: true
    }),
    bodyParser.json(),
    express.json(),
    express.urlencoded({
        extended: false
    }),
    express.static(path.join(__dirname, '/src/public')),
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 604800
        },
    }),
    cookieParser(),
];
app.use(middlewares);

// routes
app.use('/', indexRouter);
app.use('/connexion', loginRouter);
app.use('/inscription', signupRouter);
app.use('/cartes', cartesRouter);
app.use('/logout', logoutRouter);
app.use('/home', homeRouter);
app.use('/joueur', joueurRouter);
app.use('/partie', partieRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

////////////////////////////////////////////////////////////////
var Carte = require('./src/models/carteSchema');
var cartes_serveur = [];
var timeline = [];

// Dict info joueurs
/**
 * Dictionnaire ayant comme clé la partie (id)
 * et qui contient un dictionnaire ayant tous les infos
 * nécessaires pour la partie
 */
var dictParties = {}

// Dictionnaire gardant comme clé le socket de l'utilisateur
// et comme valeur son id, pour pouvoir le retrouver lors de
// la déconnexion
var playerSocket = {}

//Sockets handling
io.on('connection', (socket) => {
    //User entering a game
    console.log('\n----------- A user is connected with socket ' + socket.id + '-----------');

    //Récupération du numéro de partie
    var idPartie = socket.handshake.headers.referer.split('?')[1].split('=')[1];

    //Création de la partie si elle n'existe pas
    if (!(idPartie in dictParties)) {
        dictParties[idPartie] = {
            //Nb de connections actives
            nbConnect: 1,
            //Liste des objets joueurs
            joueurs: {},
            timeline: [],
            tour: {}
        };
    } else {
        dictParties[idPartie].nbConnect++;
    };

    // Joueur rejoint la partie dont le numéro est en paramètre de la requête
    socket.join(idPartie);

    console.log('Number of active users : ' + dictParties[idPartie].nbConnect + '\n');

    //Demande d'info sur le joueur
    //pour l'ajouter a la partie
    socket.emit("getUserInfo");
    socket.on("returnUserInfo", function (data) {
        //Vérification pour voir si l'utilisateur existe
        var userId = data.userId;

        if (!(userId in dictParties[idPartie].joueurs)) {
            dictParties[idPartie].joueurs[userId] = {
                username: data.username,
                isAdmin: data.userAdmin,
                cartes: []
            }
        }

        playerSocket[socket.id] = userId;

        consoleMessage(data.username + " c'est connecté.");

        console.log(dictParties[idPartie].joueurs[userId].username + " connected");
    });

    //
    // Messagerie
    //
    socket.on('chat', function (data) {
        io.sockets.to(idPartie).emit('chat', data);
    });

    function consoleMessage(message) {
        io.sockets.to(idPartie).emit('chat', {
            user: 'superUser',
            message: message
        });
    }

    //Démarrage de partie
    socket.on('requestStart', function (data) {
        //Vérification que la requête est fait par un admin et qu'il
        //y a plus qu'un joueur
        if (dictParties[idPartie].joueurs[data.userId].isAdmin) {
            if (dictParties[idPartie].nbConnect > 1 && Object.keys(dictParties[idPartie].joueurs).length >= 2) {
                console.log('game starting');
                startGame();

            } else {
                io.sockets.to(idPartie).emit('startError', {
                    userId: data.userId,
                    message: "Il n'y à pas assez de joueurs pour débuter"
                });
            };
        } else {
            io.sockets.to(idPartie).emit('startError', {
                userId: data.userId,
                message: "Vous n'êtes pas admin, impossible de démarrer la partie"
            });
        }
    });

    function startGame() {
        //Choix de la carte de départ
        Carte.Model.findOneRandom(function (err, result) {
            if (!err) {
                dictParties[idPartie].timeline = [result];
            }
        });

        var idTour = 0
        // Génération de 5 cartes par joueur
        Object.keys(dictParties[idPartie].joueurs).forEach(key => {
            Carte.Model.findRandom({}, {}, {
                limit: 5
            }, function (err, results) {
                if (err) console.log(err);
                else {
                    //Génération des infos nécessaires pour le déroulement de la partie
                    //idTour, détermine l'ordre du joueur
                    dictParties[idPartie].tour[idTour] = key; //key est l'id du joueur

                    //Cartes
                    dictParties[idPartie].joueurs[key].cartes = results;

                    //Envoi des infos
                    io.sockets.to(idPartie).emit('startGame', {
                        userId: key,
                        timeline: dictParties[idPartie].timeline,
                        cartes: dictParties[idPartie].joueurs[key].cartes
                    });

                }

            });
        });
    }



    //Réception des cartes du serveur
    socket.on('envoie-cartes-serveur', function (data) {
        for (var i = 0; i < data.length; i++) {
            cartes_serveur.push(data[i]);
        }
    });

    //Réception de la carte du timeline au début de la partie
    socket.on('envoie-carte-timeline', function (data) {
        timeline.push(data.une_carte);
    });

    //Listener sur quand le client click sur une carte (joue son tour)
    socket.on('carte-click', function (data) {
        console.log('Carte jouée : ' + data.carte.cue);
        console.log('at position : ' + data.position);
        //Validation de si la carte a bel et bien été placé sur la ligne du temps
    });

    //Listener sur un tour joué par le joueur
    socket.on('carte-a-jouer', function (data) {
        //Validation de l'existance de la carte
        Carte.Model.find({
            cue: data.cue,
            show: data.show,
            rep: data.rep
        }, function (err, carte) {
            if (err) socket.emit('carte-a-jouer-erreur', 'Erreur lors du placement de la carte');
            if (carte == null) socket.emit('carte-a-jouer-carte-null', 'Aucune carte ne correspond à la carte joué');
        });
    });
    socket.on('tour', function (data) {
        //Insertion de la carte ajouté dans le timeline à la position en paramètre
        timeline.splice(data.position, 0, data.carte);
        //Changement de tour de joueur
    });

    //User is leaving the game
    socket.on('disconnect', () => {
        console.log('\n----------- User is disconnected -----------');
        dictParties[idPartie].nbConnect--;

        if (dictParties[idPartie].nbConnect > 0) {
            consoleMessage(dictParties[idPartie].joueurs[playerSocket[socket.id]].username + " c'est déconnecté.");
            delete playerSocket[socket.id];
            console.log('Number of active user : ' + dictParties[idPartie].nbConnect + '\n');
        } else {
            delete playerSocket[socket.id];
            delete dictParties[idPartie];
            console.log("Partie vide, destruction de la partie : " + idPartie);
        };
    });

});

http.listen(utils.normalizePort(process.env.PORT || '3000'), () => {
    console.log('Listening on *:3000');
});

module.exports = app;
