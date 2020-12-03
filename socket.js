var express = require('express');
const path = require('path');
var socket = require('socket.io');

// App setup
var app = express();
var server = app.listen(4000, function () {
	console.log('Service sur le port 4000');
});

// view engine setup
app.set('views', path.join(__dirname, '/src/views/pages'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/src/public')));

// Static files
//Chargement de la page HTML avant de charger le serveur des websockets
app.use('/', function (req, res, next) {
	res.render('jeu');
});

/////////////////////////////////////////////////////////////////

// Instanciation du Socket
var io = socket(server);

io.on('connection', (socket) => {
	console.log(new Date().getSeconds() + '; Socket établi: ' + socket.id);
	socket.emit('start');

	socket.on('event', function (data) {
		console.log(new Date().getSeconds() + "Réception d'un message");
<<<<<<< HEAD
		console.log('Message: ' + data.message);
		data.message = data.message + '?';
=======
		console.log('Message: ' + data.message.value);
		data.message = data.message.value + '?';
>>>>>>> websockets
		socket.emit('event', data.message);
	});
});
