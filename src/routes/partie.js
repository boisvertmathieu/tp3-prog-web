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
	var room = req.params.id_partie;
	var uri = 'http://localhost:4000?param=' + room;
	res.redirect(uri);
});

module.exports = router;
