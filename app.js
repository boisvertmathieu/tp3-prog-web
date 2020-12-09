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
	bodyParser.urlencoded({ extended: true }),
	bodyParser.json(),
	express.json(),
	express.urlencoded({ extended: false }),
	express.static(path.join(__dirname, '/src/public')),
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: { maxAge: 604800 },
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
var connect_counter = {};
var cartes_serveur = [];
//Sockets handling
io.on('connection', (socket) => {
	//User entering a game
	console.log('\n----------- A user is connected to socket ' + socket.id + '-----------');

	//Récupération du numéro de partie
	/** Pour une raison que je ne comprend pas, j'arrivais pas à utiliser la même manière que le
	 * prof ici pour récupérer l'id de la partie avec le schema d'url '/partie/jeu?param=id_partie'.
	 * J'ai trouvé une autre manière de faire à partir des headers mais c'est plus long et plus laid.
	 * Mais ça fonctionne.
	 */
	var partie = socket.handshake.headers.referer.split('?')[1].split('=')[1];
	if (partie in connect_counter) {
		connect_counter[partie] += 1;
	} else {
		connect_counter[partie] = 1;
	}
	console.log('Nunber of active user : ' + connect_counter[partie] + '\n');

	// Envoie d'un signal de connection au joueur
	socket.emit('connection', {
		id_partie: partie,
		nb_joueur: connect_counter[partie],
	});
	// Joueur rejoint la partie dont le numéro est en paramètre de la requête
	socket.join(partie);

	//Réception des cartes du serveur
	socket.on('envoie-cartes-serveur', function (data) {
		for (var i = 0; i < data.length; i++) {
			cartes_serveur.push(data[i]);
		}
	});

	//Listener sur quand le client click sur une carte (joue son tour)
	socket.on('carte-click', function (data) {
		console.log('Carte jouée : ' + data.carte.cue);
		console.log('at position : ' + data.position);
		//Validation de si la carte a bel et bien été placé sur la ligne du temps
	});

	//Listener sur un tour joué par le joueur
	socket.on('tour', function (data) {
		//Validation de l'existance de la carte
		Carte.Model.find({ cue: data.cue, show: data.show, rep: data.rep }, function (err, carte) {
			if (err) socket.emit('tour-erreur', 'Erreur lors du placement de la carte');
			if (carte == null) socket.emit('tour-carte-null', 'Aucune carte ne correspond à la carte joué');
		});
	});

	//User is leaving the game
	socket.on('disconnect', () => {
		console.log('\n----------- User is disconnected -----------');
		connect_counter[partie]--;
		console.log('Number of active user : ' + connect_counter[partie] + '\n');
	});
});

http.listen(utils.normalizePort(process.env.PORT || '3000'), () => {
	console.log('Listening on *:3000');
});

module.exports = app;
