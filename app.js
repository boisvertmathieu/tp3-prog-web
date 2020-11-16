var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var database = require('./src/database');

var indexRouter = require('./src/routes/index');
var usersRouter = require('./src/routes/users');
var signupRouter = require('./src/routes/signup');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '/src/views/pages'));
app.set('view engine', 'ejs');

const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');

//middlewares
const middlewares = [
    bodyParser.urlencoded({extended: true}),
    bodyParser.json(),
    express.json(),
    express.urlencoded({extended: false}),
    express.static(path.join(__dirname, '/src/public')),
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

// routes
app.use('/', indexRouter);
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
