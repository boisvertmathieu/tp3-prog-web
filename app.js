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
var connect_counter = 0;
//Sockets handling
io.on('connection', (socket) => {
	//User entering a game
	console.log('----------- A user is connected -----------');
	connect_counter++;
	console.log('Nombre of user connected : ' + connect_counter);
	socket.emit('connection');

	//TODO : Handling de la partie de carte ici

	//User is leaving the game
	socket.on('disconnect', () => {
		console.log('----------- User is disconnected -----------');
		connect_counter--;
		console.log('Number of active user : ' + connect_counter);
	});
});

http.listen(utils.normalizePort(process.env.PORT || '3000'), () => {
	console.log('Listening on *:3000');
});

module.exports = app;
