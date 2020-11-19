const express = require('express');
const app = express();
const createError = require('http-errors');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const database = require('./src/database');

require('dotenv').config(); // For secret token access in .env file

// Routers
const loginRouter = require('./src/routes/login');
const logoutRouter = require('./src/routes/logout');
const signupRouter = require('./src/routes/signup');

// view engine setup
app.set('views', path.join(__dirname, '/src/views/pages'));
app.set('view engine', 'ejs');

//middlewares
const middlewares = [
	bodyParser.urlencoded({ extended: true }),
	bodyParser.json(),
	express.json(),
	express.urlencoded({ extended: false }),
	express.static(path.join(__dirname, '/src/public')),
];
app.use(middlewares);

// Routes
app.use('/login', loginRouter);
app.use('/inscription', signupRouter);
app.use('/logout', logoutRouter);

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

module.exports = app;
