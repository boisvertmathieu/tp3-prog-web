const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const database = require('./src/database');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');

require('dotenv').config(); // For secret token access in .env file

// Routers
const indexRouter = require('./src/routes/index');
const usersRouter = require('./src/routes/users');
const signupRouter = require('./src/routes/signup');
const homeRouter = require('./src/routes/home');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, '/src/views/pages'));
app.set('view engine', 'ejs');

//middlewares
const middlewares = [
    bodyParser.urlencoded({extended: true}),
    bodyParser.json(),
    express.json(),
    express.urlencoded({extended: false}),
    express.static(path.join(__dirname, '/src/public')),
    cookieParser(),
    logger('dev'),
    session({
      secret: 'super-secret-key',
      key: 'super-secret-cookie',
      resave: false,
      saveUninitialized: false,
      cookie: {maxAge: 60000}
    }),
    flash(),
];
app.use(middlewares);

// TODO : Les routes ont l'air mêlante mais fonctionne. Si tu vois le besoin de faire un 'cleanup' go ahead
// routes
app.use('/', indexRouter);
app.use('/home', homeRouter);
app.use('/users', usersRouter);
app.use('/inscription', signupRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
