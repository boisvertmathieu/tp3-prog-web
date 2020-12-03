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
<<<<<<< HEAD
	var room = req.params.id_partie;
	var uri = 'http://localhost:4000?param=' + room;
	res.redirect(uri);
});

=======
	var room = req.body.id_partie;
	var uri = req.protocol + '://' + req.get('host') + req.originalUrl + '/jeu/' + room;
	res.redirect(uri);
});

router.get('/jeu/:id_partie', function (req, res, next) {
	res.render('jeu');
});

>>>>>>> websockets
module.exports = router;
