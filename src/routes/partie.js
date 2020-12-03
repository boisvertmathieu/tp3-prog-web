var express = require('express');
var router = express.Router();
const checkToken = require('../middlewares/token');

router.use('/', checkToken.checkToken, function (req, res, next) {
	next();
});

router.get('/', function (req, res, next) {
	res.render('partie', {
		user: req.user,
	});
});

router.post('/', function (req, res, next) {
	var room = req.body.id_partie;
	var uri = req.protocol + '://' + req.get('host') + req.originalUrl + '/jeu/' + room;
	res.redirect(uri);
});

router.get('/jeu/:id_partie', function (req, res, next) {
	res.render('jeu');
});

module.exports = router;
